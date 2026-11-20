import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { command } from './consumers/process.mjs';
import { temporaryRoot, sha256 } from './consumers/policy.mjs';
import { sourceFingerprint } from './inputs.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));

// Ordered calls to the supported runners. The candidate is packed exactly once.
export async function verify({ repository = root, output, execute = command, inputs, resume = false, currentInputs } = {}) {
  await fs.mkdir(temporaryRoot, { recursive: true });
  output ??= await fs.mkdtemp(path.join(temporaryRoot, 'baseui-verify-'));
  await fs.mkdir(output, { recursive: true });
  let report = { status: 'running', output, inputs, stages: [], attempt: 0 };
  if (resume) {
    const previous = await fs.readFile(path.join(output, 'verification.json'), 'utf8').then(JSON.parse).catch(error => { if (error.code === 'ENOENT') return null; throw error; });
    if (previous) {
      if (!inputs || previous.inputs !== inputs) throw new Error('Verification inputs changed; rebuild the candidate');
      report = previous;
      report.attempt++;
      report.status = 'running';
      if (report.tarball && sha256(await fs.readFile(report.tarball)) !== report.archiveSha256) throw new Error('Candidate archive changed; rebuild and reverify');
    }
  }
  const persist = async () => {
    const target = path.join(output, 'verification.json');
    await fs.writeFile(`${target}.tmp`, JSON.stringify(report, null, 2) + '\n');
    await fs.rename(`${target}.tmp`, target);
  };
  async function stage(name, executable, args, extra = {}) {
    const previous = report.stages.findLast(stage => stage.name === name);
    if (resume && report.tarball && name !== 'preflight' && previous?.status === 'passed') {
      for (const stream of ['stdout', 'stderr']) {
        if (sha256(await fs.readFile(previous[stream])) !== previous[`${stream}Sha256`]) throw new Error(`Retained ${name} evidence changed; rerun verification`);
      }
      console.log(`REUSE ${name}: unchanged source and archive`);
      return previous;
    }
    const started = Date.now();
    const result = await execute(repository, path.join(output, 'logs', String(report.attempt)), name, executable, args, {
      timeout: 60 * 60 * 1000, allowFailure: true,
      env: { ...process.env, BASEUI_RUNTIME_GATE_OUTPUT: path.join(output, 'interactions'), BASEUI_CLICK_DIAGNOSTICS_OUTPUT: path.join(output, 'interactions/click-diagnostics.json'), ...extra },
    });
    const passed = result.code === 0 && !result.signal && !result.timedOut && !result.spawnError;
    const record = { name, elapsedMs: Date.now() - started, status: passed ? 'passed' : 'failed', ...result };
    for (const stream of ['stdout', 'stderr']) record[`${stream}Sha256`] = sha256(await fs.readFile(result[stream]));
    report.stages.push(record);
    await persist();
    console.log(`${passed ? 'PASS' : 'FAIL'} ${name} (${(record.elapsedMs / 1000).toFixed(1)}s) ${result.stderr}`);
    if (!passed) {
      let detail = await fs.readFile(result.stderr, 'utf8').catch(() => '');
      if (name === 'interactions') {
        const summary = await fs.readFile(path.join(output, 'interactions/summary.json'), 'utf8').then(JSON.parse).catch(() => []);
        detail += '\n' + summary.filter(stage => !stage.passed).map(stage => `${stage.name}: ${(stage.summary ?? []).join('\n') || stage.error}; ${stage.log ?? ''}`).join('\n');
      }
      throw new Error(`${name}: ${detail.trim().slice(-6000) || result.spawnError || 'see retained logs'}`);
    }
    return result;
  }
  try {
    await stage('preflight', process.execPath, ['scripts/distribution/verify-preflight.mjs']);
    await stage('orchestration', process.execPath, ['--test', 'test/distribution/release-command.test.mjs', 'test/distribution/verify-command.test.mjs', 'test/distribution/consumers/policy.test.mjs']);
    await stage('package', 'pnpm', ['build:package']);
    await stage('api', 'pnpm', ['docs:api']);
    await stage('site', 'pnpm', ['docs:build:site']);
    await stage('markdown', 'pnpm', ['docs:generate-markdown']);
    await stage('runtime-docs', process.execPath, ['scripts/distribution/build/index.mjs', '--docs']);
    await stage('notices', process.execPath, ['scripts/distribution/notices/stage.mjs']);
    const packed = await stage('pack', 'npm', ['pack', './packages/solid/build', '--json', '--pack-destination', output]);
    const entries = JSON.parse(await fs.readFile(packed.stdout, 'utf8'));
    if (entries.length !== 1 || path.basename(entries[0].filename) !== entries[0].filename) throw new Error('Expected one candidate archive');
    report.tarball = path.join(output, entries[0].filename);
    report.archiveSha256 = sha256(await fs.readFile(report.tarball));
    await persist();
    await stage('public-types', 'pnpm', ['test:types']);
    await stage('interactions', 'pnpm', ['test:interactions', '--full-unit']);
    if (!report.stages.some(stage => stage.name === 'qualification' && stage.status === 'passed')) report.qualification = path.join(output, `qualification-${report.attempt}`);
    await stage('qualification', process.execPath, ['scripts/distribution/qualification/run.mjs', '--tarball', report.tarball, '--output', report.qualification]);
    await stage('consumers', process.execPath, ['scripts/distribution/consumers/run.mjs', '--tarball', report.tarball, '--output', path.join(output, `consumers-${report.attempt}`), '--qualification', path.join(report.qualification, 'qualification.json')]);
    if (sha256(await fs.readFile(report.tarball)) !== report.archiveSha256) throw new Error('Candidate archive changed during verification');
    if (currentInputs && inputs !== await currentInputs()) throw new Error('Verification changed source files; inspect git status');
    report.status = 'passed';
    return report;
  } catch (error) {
    report.status = 'failed';
    report.error = error.message;
    throw error;
  } finally {
    await persist();
    console.log(`${report.status.toUpperCase()}: ${path.join(output, 'verification.json')}`);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  if (args.length && (args.length !== 2 || args[0] !== '--resume')) throw new Error('Usage: pnpm verify [--resume DIRECTORY]');
  const inputs = await sourceFingerprint(root);
  verify({ inputs, resume: args.length > 0, output: args[1] && path.resolve(args[1]), currentInputs: () => sourceFingerprint(root) })
    .catch(error => { console.error(error.message); process.exitCode = 1; });
}
