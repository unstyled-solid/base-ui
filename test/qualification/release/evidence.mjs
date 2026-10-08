import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const roots = ['packages/solid/src', 'packages/solid/test', 'test', 'scripts', 'distribution',
  'docs/demos', 'docs/components', 'docs/scripts', 'docs/tests', 'docs/patches', '.opencode/skills', 'tracking/schema'];
const excluded = ['node_modules', '.cache', '.generated', '.build', 'generated', 'evidence', 'build', 'dist'];
async function records(directory, prefix = '') {
  const output = [];
  for (const entry of (await fs.readdir(directory, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
    if (excluded.includes(entry.name)) continue;
    const relative = path.posix.join(prefix, entry.name), absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) output.push(...await records(absolute, relative));
    else if (entry.isFile()) output.push({ path: relative, sha256: sha256(await fs.readFile(absolute)) });
    else if (entry.isSymbolicLink()) output.push({ path: relative, symlink: await fs.readlink(absolute) });
  }
  return output;
}
export async function fingerprint() {
  const inputs = [];
  for (const directory of roots) {
    try { inputs.push(...await records(path.join(root, directory), directory)); }
    catch (error) { if (error.code !== 'ENOENT') throw error; inputs.push({ path: directory, absent: true }); }
  }
  for (const directory of [root, path.join(root, 'packages/solid'), path.join(root, 'docs')]) {
    for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
      if (!entry.isFile() || !/\.(?:json|jsonc|yaml|yml|mjs|ts|md)$/.test(entry.name)) continue;
      const absolute = path.join(directory, entry.name);
      inputs.push({ path: path.relative(root, absolute), sha256: sha256(await fs.readFile(absolute)) });
    }
  }
  const files = [...new Map(inputs.map(input => [input.path, input])).values()].sort((a, b) => a.path.localeCompare(b.path));
  return { sha256: sha256(JSON.stringify(files)), files, roots, excludedDirectoryNames: excluded };
}
async function main() {
  const [action, output, ...argv] = process.argv.slice(2);
  if (!path.isAbsolute(output ?? '')) throw new Error('Absolute external evidence directory required');
  const approved = '/var/folders/k1/dqkw16gn09q6492v5jn1x_jc0000gn/T/opencode';
  if (!output.startsWith(`${approved}/`)) throw new Error('Evidence must be beneath approved external temporary root');
  const reportFile = path.join(output, 'qualification.json');
  if (action === 'freeze') {
    await fs.mkdir(output);
    const target = await fingerprint();
    const report = { schemaVersion: 1, status: 'incomplete', startedAt: new Date().toISOString(), root, target,
      canonicalSha: '19511bb171f3b360b006c94cf6d07e53cb446505', toolchain: { node: process.versions.node,
        typescript: '5.9.3', solid: '2.0.0-rc.13', vite: '8.3.2', vitePlugin: '3.0.0-next.47' },
      stages: [], artifacts: {}, browsers: {}, exclusions: [], skips: [], blockers: [], publicationAuthorized: false };
    await fs.writeFile(reportFile, JSON.stringify(report, null, 2));
    console.log(`Frozen ${target.sha256}; ${target.files.length} inputs; ${reportFile}`);
    return;
  }
  const report = JSON.parse(await fs.readFile(reportFile, 'utf8'));
  const before = await fingerprint();
  if (before.sha256 !== report.target.sha256) throw new Error(`Source changed since freeze: ${before.sha256}`);
  if (action === 'run') {
    const [name, executable, ...args] = argv;
    if (!name || !executable || !/^[\w.-]+$/.test(name)) throw new Error('run OUTPUT STAGE EXECUTABLE ARGS');
    const stdout = path.join(output, `${name}.stdout.log`), stderr = path.join(output, `${name}.stderr.log`);
    const handles = await Promise.all([fs.open(stdout, 'wx'), fs.open(stderr, 'wx')]);
    const startedAt = new Date().toISOString();
    const result = spawnSync('rtk', ['proxy', executable, ...args], { cwd: root, stdio: ['ignore', handles[0].fd, handles[1].fd],
      timeout: 1_200_000, env: { ...process.env, TZ: 'UTC' } });
    await Promise.all(handles.map(handle => handle.close()));
    const after = await fingerprint();
    const stage = { name, command: ['rtk', 'proxy', executable, ...args], startedAt, endedAt: new Date().toISOString(),
      exitCode: result.status, signal: result.signal, error: result.error?.message ?? null,
      status: result.status === 0 && after.sha256 === report.target.sha256 ? 'passed' : 'failed',
      targetSha256: after.sha256, stdout, stderr, stdoutSha256: sha256(await fs.readFile(stdout)), stderrSha256: sha256(await fs.readFile(stderr)) };
    // Independent gates can run concurrently without overwriting one another's records.
    await fs.writeFile(path.join(output, `${name}.stage.json`), JSON.stringify(stage, null, 2));
    console.log(JSON.stringify(stage, null, 2));
    process.exitCode = stage.status === 'passed' ? 0 : 1;
  } else if (action === 'finish') {
    const [tarball, packageDirectory, docsDirectory] = argv;
    for (const name of (await fs.readdir(output)).filter(name => name.endsWith('.stage.json')).sort()) {
      report.stages.push(JSON.parse(await fs.readFile(path.join(output, name), 'utf8')));
    }
    if (tarball) report.artifacts.tarball = { path: tarball, sha256: sha256(await fs.readFile(tarball)) };
    for (const [name, directory] of [['package', packageDirectory], ['docs', docsDirectory]]) {
      if (!directory) continue;
      const files = await records(directory);
      report.artifacts[name] = { path: directory, sha256: sha256(JSON.stringify(files)), files };
    }
    const { chromium, firefox, webkit } = await import('playwright');
    for (const [name, browserType] of Object.entries({ chromium, firefox, webkit })) {
      try { const browser = await browserType.launch(); report.browsers[name] = browser.version(); await browser.close(); }
      catch (error) { report.browsers[name] = { unavailable: error.message }; }
    }
    report.endedAt = new Date().toISOString();
    report.stableSource = (await fingerprint()).sha256 === report.target.sha256;
    // Joining successful command exits cannot establish complete platform/scenario coverage.
    report.status = 'blocked';
    await fs.writeFile(reportFile, JSON.stringify(report, null, 2));
    console.log(`Blocked qualification retained at ${reportFile}`);
  } else throw new Error(`Unknown action: ${action}`);
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
