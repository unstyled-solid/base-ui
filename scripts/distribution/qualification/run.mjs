import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { command } from '../consumers/process.mjs';
import { pins, optionalPins, peerSets, temporaryRoot, inspectArchive, sha256, validateQualification } from '../consumers/policy.mjs';
import { contracts } from '../types/shared.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const args = Object.fromEntries(Array.from({ length: process.argv.slice(2).length / 2 }, (_, i) => [process.argv[2 + i * 2], process.argv[3 + i * 2]]));
assert(args['--tarball'] && args['--output'], 'Usage: run.mjs --tarball absolute.tgz --output new-absolute-directory');
const output = path.resolve(args['--output']), tarball = path.resolve(args['--tarball']);
assert((await fs.realpath(path.dirname(output))).startsWith(await fs.realpath(temporaryRoot)));
await fs.mkdir(output);
const archive = inspectArchive(await fs.readFile(tarball));
const manifest = JSON.parse(archive.files.get('package.json'));
const { exports: contract } = await contracts();
const qualification = { schemaVersion: 1, archiveSha256: archive.sha256, obligations: {}, markdown: Object.fromEntries(archive.inventory.filter(f => f.file.startsWith('docs/') && f.file.endsWith('.md')).map(f => [f.file, f.sha256])), notices: [] };
const records = [];
const owner = 'bsolid-qaiu';
async function execute(cwd, name, executable, argv, options = {}) {
  const result = await command(cwd, path.join(output, 'logs'), name, executable, argv, { ...options, allowFailure: true });
  records.push(result);
  await fs.writeFile(path.join(output, 'commands.json'), JSON.stringify(records, null, 2));
  assert(result.code === 0 && !result.signal && !result.timedOut && !result.spawnError, `${name} failed: ${result.stderr}`);
  return result;
}
async function receipt(name, runs, assertions, artifacts = []) {
  assert(assertions.length && assertions.every(a => a.status === 'passed'));
  const exactCommand = JSON.stringify(runs.map(r => r.command));
  const gate = { schemaVersion: 1, archiveSha256: archive.sha256, owner, command: exactCommand, status: 'passed', exitCode: 0, signal: null,
    blockers: [], diagnostics: [], assertions, stdout: runs[0].stdout, stderr: runs[0].stderr, executions: runs };
  const gatePath = path.join(output, `${name}.gate.json`);
  await fs.writeFile(gatePath, JSON.stringify(gate, null, 2));
  const files = [{ path: gatePath, kind: 'gate-json' }, ...runs.flatMap(r => [{ path: r.stdout, kind: 'raw-log' }, { path: r.stderr, kind: 'raw-log' }]), ...artifacts.map(file => ({ path: file, kind: 'audit-json' }))];
  for (const file of files) file.sha256 = sha256(await fs.readFile(file.path));
  qualification.obligations[name] = { owner, command: exactCommand, status: 'passed', assertions: assertions.map(a => a.id), artifacts: files };
}
try {
  const staticRuns = {};
  for (const name of ['source-export-completeness', 'current-markdown', 'adopted-notices', 'side-effect-audit']) {
    const resultFile = path.join(output, `${name}.json`);
    const run = await execute(root, name, process.execPath, ['scripts/distribution/qualification/check.mjs', name, tarball, resultFile], { env: process.env });
    const result = JSON.parse(await fs.readFile(resultFile));
    staticRuns[name] = { run, result, resultFile };
    if (name !== 'side-effect-audit') await receipt(name, [run], result.assertions, [resultFile]);
  }
  const directory = path.join(output, 'consumer');
  await fs.mkdir(directory); await fs.mkdir(path.join(directory, 'home'));
  for (const file of ['empty.npmrc', 'empty-global.npmrc']) await fs.writeFile(path.join(directory, file), '');
  for (let parent = path.dirname(directory);; parent = path.dirname(parent)) {
    assert(!await fs.stat(path.join(parent, 'node_modules')).then(() => true, e => { if (e.code === 'ENOENT') return false; throw e; }), 'Ancestor node_modules contaminates independent consumer');
    if (path.dirname(parent) === parent) break;
  }
  const snapshot = path.join(directory, 'package.tgz');
  await fs.copyFile(tarball, snapshot);
  await fs.writeFile(path.join(directory, 'package.json'), JSON.stringify({ name: 'archive-qualification', private: true, type: 'module', dependencies: { ...pins, '@types/node': '25.9.9', [manifest.name]: snapshot }, overrides: { ...pins, '@floating-ui/core': '1.8.0', '@floating-ui/utils': '0.2.12' } }, null, 2));
  await fs.writeFile(path.join(directory, 'input.json'), JSON.stringify({ name: manifest.name, version: manifest.version, exports: manifest.exports, contract: contract.exports, inventory: archive.inventory, kind: 'ordinary', peers: peerSets.ordinary, pins, optionalPins, tarball: snapshot }, null, 2));
  const names = ['installation.mjs', 'initialization.mjs', 'runtime-accounting.mjs', 'bundle.mjs', 'client.tsx', 'app.tsx', 'qualification-app.tsx', 'qualification-client.tsx', 'qualification-server.tsx', 'qualification-browser.mjs'];
  const fixtureHashes = {};
  for (const name of names) {
    const source = await fs.readFile(path.join(root, 'test/distribution/consumers/templates', name), 'utf8');
    fixtureHashes[name] = sha256(source);
    await fs.writeFile(path.join(directory, name), source.replaceAll('baseui-solid2', manifest.name));
  }
  await fs.writeFile(path.join(output, 'fixture-hashes.json'), JSON.stringify(fixtureHashes, null, 2));
  const install = await execute(directory, 'install', 'npm', ['install', '--ignore-scripts', '--legacy-peer-deps', '--no-audit', '--no-fund', '--install-strategy=hoisted'], { timeout: 600000 });
  const installed = await execute(directory, 'installation-audit', process.execPath, ['installation.mjs']);
  const initialization = await execute(directory, 'initialization-audit', process.execPath, ['initialization.mjs']);
  const shaking = await execute(directory, 'tree-shaking', process.execPath, ['bundle.mjs', 'shaking']);
  const source = staticRuns['side-effect-audit'];
  await receipt('side-effect-audit', [source.run, install, installed, initialization, shaking], [...source.result.assertions,
    { id: 'independent-install-all-four-variant-initializations-classified', status: 'passed' },
    { id: 'unused-import-zero-retention-root-subpath-and-optional-isolation', status: 'passed' }], [source.resultFile, path.join(directory, 'initialization-result.json'), path.join(directory, 'bundle-shaking-0.json'), path.join(directory, 'installation-result.json')]);
  const browserInstall = await execute(directory, 'chromium-install', process.execPath, ['node_modules/playwright/cli.js', 'install', 'chromium'], { timeout: 600000 });
  const browser = await execute(directory, 'browser-qualification', process.execPath, ['qualification-browser.mjs']);
  const replayFile = path.join(directory, 'qualification-browser.json');
  const replay = JSON.parse(await fs.readFile(replayFile));
  assert.deepEqual(replay.diagnostics, []);
  for (const name of ['style-listener-disposal', 'prehydration-events']) {
    const assertions = replay.assertions.filter(a => name === 'prehydration-events' ? a.id.startsWith('prehydration-') : !a.id.startsWith('prehydration-'));
    await receipt(name, [browserInstall, browser], assertions, [replayFile, path.join(directory, 'qualification-ssr.json'), path.join(output, 'fixture-hashes.json')]);
  }
  const ledger = JSON.parse(await fs.readFile(path.join(root, 'tracking/distribution/donor-notices.json')));
  qualification.notices = ledger.texts.map(text => ({ sourceSha: text.revision, license: text.license, packedFile: text.destination, requiredText: [archive.files.get(text.destination).toString()] }));
  const artifacts = new Map();
  for (const obligation of Object.values(qualification.obligations)) for (const artifact of obligation.artifacts) artifacts.set(artifact.path, await fs.readFile(artifact.path));
  validateQualification(qualification, archive.sha256, artifacts);
  assert.equal(sha256(await fs.readFile(tarball)), archive.sha256);
  await fs.writeFile(path.join(output, 'qualification.json'), JSON.stringify(qualification, null, 2));
  console.log(`PASS: six executed archive-bound receipts: ${path.join(output, 'qualification.json')}`);
} catch (error) {
  await fs.writeFile(path.join(output, 'failure.json'), JSON.stringify({ archiveSha256: archive.sha256, error: error.stack, completedObligations: Object.keys(qualification.obligations) }, null, 2));
  throw error;
}
