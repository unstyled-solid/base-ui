import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';

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

function run(command, args, capture = false) {
  const result = spawnSync(command, args, { cwd: root, stdio: capture ? 'pipe' : 'inherit', encoding: 'utf8' });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed. No automatic rollback performed.`);
  return result.stdout?.trim();
}

async function main() {
  const args = process.argv.slice(2);
  const execute = args.includes('--yes');
  const bump = args.find(arg => !arg.startsWith('--')) ?? 'patch';
  if (args.some(arg => arg.startsWith('--') && !['--yes', '--dry-run'].includes(arg))) throw new Error('Usage: pnpm release [patch|minor|major|VERSION] [--yes|--dry-run]');
  if (execute && args.includes('--dry-run')) throw new Error('Choose --yes or --dry-run, not both');
  const contractFile = path.join(root, 'distribution/package-contract.json');
  const contract = JSON.parse(await fs.readFile(contractFile, 'utf8'));
  const current = contract.identity.version;
  const version = nextVersion(current, bump);
  const difference = version.split('.').map((n, i) => Number(n) - Number(current.split('.')[i])).find(n => n !== 0);
  if (!difference || difference < 0)
    throw new Error('Choose a new version greater than the current version');
  console.log(`Release ${contract.identity.publicationName}: ${current} → ${version}`);
  console.log('Bump versions/READMEs → update lockfile → build package/docs → check docs/package → commit → npm publish → git push.');
  console.log('Includes repository changes except aviross.pub and Git-ignored files. Netlify deploys after the push.');
  if (!execute) { console.log('Dry run: no changes. Run pnpm release ' + bump + ' --yes to execute.'); return; }

  // Check account and upstream before changing files or publishing anything.
  run('npm', ['whoami']);
  run('git', ['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{upstream}']);
  run('git', ['var', 'GIT_AUTHOR_IDENT']);
  if (run('git', ['diff', '--cached', '--name-only'], true).split('\n').includes('aviross.pub'))
    throw new Error('aviross.pub is already staged; unstage it before releasing');
  const tag = `v${version}`;
  if (run('git', ['tag', '--list', tag], true)) throw new Error(`Tag ${tag} already exists`);
  const packageFile = path.join(root, 'packages/solid/package.json');
  const pkg = JSON.parse(await fs.readFile(packageFile, 'utf8'));
  pkg.version = version;
  contract.identity.version = version;
  await fs.writeFile(packageFile, JSON.stringify(pkg, null, 2) + '\n');
  await fs.writeFile(contractFile, JSON.stringify(contract, null, 2) + '\n');
  for (const file of ['README.md', 'packages/solid/README.md']) {
    const absolute = path.join(root, file);
    const text = await fs.readFile(absolute, 'utf8');
    await fs.writeFile(absolute, text.replaceAll(current, version));
  }
  run('pnpm', ['install', '--lockfile-only']);
  run('pnpm', ['build:package']);
  run('pnpm', ['docs:build']);
  run('pnpm', ['docs:check']);
  const staged = JSON.parse(await fs.readFile(path.join(root, 'packages/solid/build/package.json'), 'utf8'));
  if (staged.name !== contract.identity.publicationName || staged.version !== version || staged.private)
    throw new Error('Built package identity does not match this release');
  run('npm', ['publish', './packages/solid/build', '--access', 'public', '--dry-run']);
  run('git', ['add', '--all', '--', '.', ':!aviross.pub']);
  run('git', ['commit', '-m', `Release ${version}`]);
  run('npm', ['publish', './packages/solid/build', '--access', 'public']);
  run('git', ['tag', tag]);
  run('git', ['push']);
  run('git', ['push', 'origin', tag]);
  console.log(`Published ${staged.name}@${version} and pushed GitHub. Netlify will build the connected branch.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
