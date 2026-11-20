import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { verify } from './distribution/verify.mjs';
import { temporaryRoot, sha256 } from './distribution/consumers/policy.mjs';
import { sourceFingerprint } from './distribution/inputs.mjs';
export { sourceFingerprint } from './distribution/inputs.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export function nextVersion(current, bump) {
  if (/^\d+\.\d+\.\d+$/.test(bump)) return bump;
  const parts = current.split('.').map(Number);
  const index = ['major', 'minor', 'patch'].indexOf(bump);
  if (index < 0 || parts.length !== 3 || parts.some(n => !Number.isInteger(n)))
    throw new Error('Use patch, minor, major, or an explicit version such as 0.0.2');
  parts[index]++;
  for (let i = index + 1; i < 3; i++) parts[i] = 0;
  return parts.join('.');
}

function run(command, args, { cwd = root, allowFailure = false } = {}) {
  const result = spawnSync('rtk', ['proxy', command, ...args], { cwd, stdio: 'pipe', encoding: 'utf8' });
  if (result.error) throw result.error;
  if (!allowFailure && result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed: ${result.stderr}`);
  return { code: result.status, stdout: result.stdout?.trim() ?? '', stderr: result.stderr?.trim() ?? '' };
}

const releaseFiles = ['distribution/package-contract.json', 'packages/solid/package.json', 'README.md', 'packages/solid/README.md', 'pnpm-lock.yaml'];

export async function release({ repository = root, bump = 'patch', resume, execute = run, validate = verify } = {}) {
  const git = (...args) => execute('git', args, { cwd: repository }).stdout;
  let state, directory;
  if (resume) {
    directory = path.resolve(resume);
    state = JSON.parse(await fs.readFile(path.join(directory, 'release.json')));
    if (state.repository !== await fs.realpath(repository)) throw new Error('Resume checkout differs from release checkout');
    if (await sourceFingerprint(repository, execute) !== state.inputs) throw new Error('Source inputs changed; prepare and verify a new release candidate');
    const head = git('rev-parse', 'HEAD');
    if (![state.sourceCommit, state.commit].includes(head)) {
      // Recover the narrow crash window after git commit but before journaling.
      if (!state.commit && git('show', '-s', '--format=%P%n%s', 'HEAD') === `${state.sourceCommit}\nRelease ${state.version}`) state.commit = head;
      else throw new Error('Release HEAD changed');
    }
  } else {
    if (git('status', '--porcelain')) throw new Error('Release requires a clean starting checkout');
    const contract = JSON.parse(await fs.readFile(path.join(repository, releaseFiles[0])));
    const version = nextVersion(contract.identity.version, bump);
    const difference = version.split('.').map((n, i) => Number(n) - Number(contract.identity.version.split('.')[i])).find(n => n !== 0);
    if (!difference || difference < 0) throw new Error('Choose a new version greater than the current version');
    if (git('tag', '--list', `v${version}`)) throw new Error(`Tag v${version} already exists`);
    git('rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{upstream}');
    git('var', 'GIT_AUTHOR_IDENT');
    await fs.mkdir(temporaryRoot, { recursive: true });
    directory = await fs.mkdtemp(path.join(temporaryRoot, `baseui-release-${version}-`));
    state = { repository: await fs.realpath(repository), version, previous: contract.identity.version, name: contract.identity.publicationName,
      sourceCommit: git('rev-parse', 'HEAD'), publication: 'unpublished' };
  }
  const persist = async () => {
    const target = path.join(directory, 'release.json');
    await fs.writeFile(`${target}.tmp`, JSON.stringify(state, null, 2) + '\n');
    await fs.rename(`${target}.tmp`, target);
  };
  const registry = () => {
    const result = execute('npm', ['view', `${state.name}@${state.version}`, 'dist.integrity', '--json'], { cwd: repository, allowFailure: true });
    if (result.code === 0) return JSON.parse(result.stdout || 'null');
    if (/E404/.test(result.stderr + result.stdout)) return null;
    throw new Error(`Registry lookup failed: ${result.stderr}`);
  };
  console.log(`Release evidence: ${directory}; resume with pnpm release --resume ${directory} --yes`);
  try {
    if (!state.prepared) {
      if (registry()) throw new Error(`${state.name}@${state.version} is already published`);
      for (const file of releaseFiles.slice(0, 2)) {
        const target = path.join(repository, file), value = JSON.parse(await fs.readFile(target));
        if (value.identity) value.identity.version = state.version;
        else value.version = state.version;
        await fs.writeFile(target, JSON.stringify(value, null, 2) + '\n');
      }
      for (const file of releaseFiles.slice(2, 4)) {
        const target = path.join(repository, file);
        await fs.writeFile(target, (await fs.readFile(target, 'utf8')).replaceAll(state.previous, state.version));
      }
      execute('pnpm', ['install', '--lockfile-only'], { cwd: repository });
      state.prepared = true;
      state.inputs = await sourceFingerprint(repository, execute);
      await persist();
    }
    if (!state.verification) {
      const verification = await validate({ repository, output: path.join(directory, 'verification'), inputs: state.inputs, resume: Boolean(resume) });
      if (verification.status !== 'passed') throw new Error('Verification did not pass');
      if (state.inputs !== await sourceFingerprint(repository, execute)) throw new Error('Source inputs changed during verification');
      state.verification = verification;
      await persist();
    }
    if (state.inputs !== await sourceFingerprint(repository, execute)) throw new Error('Source inputs changed; verification must rerun');
    const changed = [...git('diff', '--name-only').split('\n'), ...git('diff', '--cached', '--name-only').split('\n')].filter(Boolean);
    if (changed.some(file => !releaseFiles.includes(file)) || git('ls-files', '--others', '--exclude-standard')) throw new Error('Unexpected release changes; refusing publication or staging');
    const archive = await fs.readFile(state.verification.tarball);
    if (sha256(archive) !== state.verification.archiveSha256) throw new Error('Verified archive hash changed');
    const integrity = `sha512-${createHash('sha512').update(archive).digest('base64')}`;
    const published = registry();
    if (published && published !== integrity) throw new Error('Registry version has a different archive');
    if (published) state.publication = 'published';
    else if (['accepted', 'publishing', 'published'].includes(state.publication)) {
      throw new Error('Publication accepted or outcome uncertain; registry validation is pending. Resume once the version is visible; do not republish.');
    } else {
      execute('npm', ['whoami'], { cwd: repository });
      state.publication = 'publishing';
      await persist();
      const result = execute('npm', ['publish', state.verification.tarball, '--access', 'public'], { cwd: repository, allowFailure: true });
      if (result.code !== 0) {
        if (/ENEEDAUTH|E401|E403/.test(result.stderr)) state.publication = 'unpublished';
        await persist();
        throw new Error(`Publication failed: ${result.stderr}`);
      }
      state.publication = 'accepted';
      await persist();
      const visible = registry();
      if (visible !== integrity) throw new Error('Publication accepted; awaiting registry validation. Resume to finish tagging/pushing.');
      state.publication = 'published';
    }
    await persist();
    if (!state.commit) {
      const changed = git('diff', '--name-only').split('\n').filter(Boolean);
      if (changed.some(file => !releaseFiles.includes(file)) || git('ls-files', '--others', '--exclude-standard')) throw new Error('Unexpected release changes; refusing to stage unrelated files');
      git('add', '--', ...releaseFiles);
      git('commit', '-m', `Release ${state.version}`);
      state.commit = git('rev-parse', 'HEAD');
      await persist();
    }
    const tag = `v${state.version}`;
    if (!state.tagged) {
      if (git('tag', '--list', tag)) {
        if (git('rev-list', '-n', '1', tag) !== state.commit) throw new Error('Release tag points to another commit');
      } else git('tag', tag, state.commit);
      state.tagged = true;
      await persist();
    }
    if (!state.pushed) { git('push'); state.pushed = true; await persist(); }
    if (!state.tagPushed) { git('push', 'origin', tag); state.tagPushed = true; await persist(); }
    return state;
  } catch (error) {
    state.error = error.message;
    await persist();
    throw error;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const execute = args.includes('--yes');
  const resumeIndex = args.indexOf('--resume');
  const resume = resumeIndex < 0 ? undefined : args[resumeIndex + 1];
  if (resumeIndex >= 0 && (!resume || resume.startsWith('--'))) throw new Error('--resume requires a release evidence directory');
  const bump = args.find((arg, index) => !arg.startsWith('--') && (resumeIndex < 0 || index !== resumeIndex + 1)) ?? 'patch';
  if (args.some(arg => arg.startsWith('--') && !['--yes', '--dry-run', '--resume'].includes(arg))) throw new Error('Usage: pnpm release [patch|minor|major|VERSION] [--resume DIRECTORY] [--yes|--dry-run]');
  if (execute && args.includes('--dry-run')) throw new Error('Choose --yes or --dry-run, not both');
  if (execute) {
    const state = await release({ bump, resume });
    console.log(`Published ${state.name}@${state.version} from verified archive and pushed v${state.version}`);
    return;
  }
  if (resume) { console.log(`Preview: validate and resume release in ${resume}. No changes.`); return; }
  const contractFile = path.join(root, 'distribution/package-contract.json');
  const contract = JSON.parse(await fs.readFile(contractFile, 'utf8'));
  const current = contract.identity.version;
  const version = nextVersion(current, bump);
  const difference = version.split('.').map((n, i) => Number(n) - Number(current.split('.')[i])).find(n => n !== 0);
  if (!difference || difference < 0)
    throw new Error('Choose a new version greater than the current version');
  console.log(`Release ${contract.identity.publicationName}: ${current} → ${version}`);
  console.log('Clean checkout → prepare version → verify → publish exact verified tarball → commit release files → tag/push.');
  console.log('Non-mutating preview only. Use pnpm verify for real validation; --yes executes the release.');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
