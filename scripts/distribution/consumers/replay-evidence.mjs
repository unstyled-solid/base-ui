import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { pins, optionalPins, peerSets, sha256, inside, inspectArchive, conditionSets } from './policy.mjs';

export const browserMasks = conditionSets().flatMap((conditions, mask) => conditions.includes('browser') && !conditions.includes('types') ? [mask] : []);
export function parseReplayArgs(argv) {
  const result = { conditions: 'all' };
  const seen = new Set();
  for (let i = 0; i < argv.length; i += 2) {
    const key = argv[i]?.slice(2), value = argv[i + 1];
    assert(['tarball', 'report', 'consumer', 'output', 'conditions'].includes(key) && argv[i].startsWith('--') && value && !value.startsWith('--'), `Invalid replay argument ${argv[i]}`);
    assert(!seen.has(key), `Duplicate replay ${key}`); seen.add(key);
    if (key === 'conditions') assert(['all', 'focused', 'default'].includes(value), 'Replay --conditions must be all, focused or default');
    else assert(path.isAbsolute(value), `Replay --${key} must be absolute`);
    result[key] = value;
  }
  for (const key of ['tarball', 'report', 'consumer', 'output']) assert(result[key], `Missing replay --${key}`);
  result.masks = result.conditions === 'all' ? browserMasks : result.conditions === 'focused' ? [2, 6, 10, 18] : [2];
  return result;
}
export function assertPriorReport(report, archive) {
  assert.equal(report.schemaVersion, 1); assert.equal(report.owner, 'bsolid-dist-pack');
  assert(['blocked', 'passed'].includes(report.status) && report.ended, 'Incomplete original report');
  assert.equal(report.archiveSha256, archive.sha256, 'Replay archive differs from original report');
  assert.deepEqual(report.package, JSON.parse(archive.files.get('package.json')), 'Original report manifest differs from archive');
  assert.deepEqual(report.inventory.slice().sort((a, b) => a.file.localeCompare(b.file)), archive.inventory.slice().sort((a, b) => a.file.localeCompare(b.file)), 'Original archive inventory mismatch');
  assert.equal(Object.keys(report.exportContract.exports).length, 79, 'Incomplete prior export contract');
  assert.deepEqual(Object.keys(report.package.exports).sort(), Object.keys(report.exportContract.exports).sort(), 'Incomplete archive export map');
  for (const [key, entry] of Object.entries(report.exportContract.exports)) {
    assert(/^\.\/src\/[\w/-]+\.tsx?$/.test(entry.target), `Unsafe prior export target ${key}`);
    const stem = entry.target.slice(6).replace(/\.tsx?$/, '');
    const conditions = entry.kind === 'types-only' ? ['types'] : report.exportContract.pathRules.conditionOrder;
    assert.deepEqual(Object.keys(report.package.exports[key]), conditions, `Prior condition-order mismatch ${key}`);
    for (const condition of conditions) assert.equal(report.package.exports[key][condition], report.exportContract.pathRules[condition].replace('{stem}', stem), `Prior conditional target mismatch ${key}:${condition}`);
  }
  assert.equal(report.contractHashes.exports, sha256(JSON.stringify(report.exportContract)), 'Original export contract hash mismatch');
  assert.equal(report.nodeVersion, process.versions.node, 'Replay Node differs from original pinned runtime');
  for (const stage of ['inventory', 'analysis', 'immutable-archive']) assert.equal(report.stages[stage]?.status, 'passed', `Prior ${stage} did not pass`);
  assert.deepEqual(Object.keys(report.consumers).sort(), Object.keys(peerSets).sort());
  for (const [kind, consumer] of Object.entries(report.consumers)) {
    for (const stage of ['installation', 'import-audit', 'types', 'resolution', 'runtime', 'temporal', 'ssr']) assert.equal(consumer.stages[stage]?.status, 'passed', `${kind}: prior ${stage} incomplete`);
    assert.deepEqual(consumer.peerSet, peerSets[kind]);
    assert.equal(consumer.installation.stockRC13, true); assert.equal(consumer.installation.workspacePatch, 'absent');
    assert.deepEqual(consumer.typeModes, ['Bundler', 'NodeNext']); assert.equal(consumer.stages.types.skipLibCheck, false);
    assert.equal(consumer.resolutionSets, 64); assert.equal(consumer.stages.resolution.sets, 64);
    const keys = Object.keys(report.exportContract.exports).filter(key => !key.includes('temporal-adapter-') || kind === 'both' || key.endsWith(`temporal-adapter-${kind}`)).sort();
    assert.deepEqual(consumer.typeKeys.slice().sort(), keys, `${kind}: prior type accounting incomplete`);
  }
}
export function assertRetainedManifests(actual, expected) {
  const sorted = entries => entries.slice().sort((a, b) => a.path.localeCompare(b.path));
  assert.deepEqual(sorted(actual), sorted(expected), 'Retained dependency graph changed (added/missing peer, package or version)');
}
function successful(record, label) {
  assert(record && record.code === 0 && record.signal === null && !record.timedOut && !record.spawnError, `Prior command not successful: ${label}`);
}
export async function verifyStockBytes(consumerRoot, name, registry) {
  assert(registry.integrity.startsWith('sha512-'), `Unsupported cached integrity ${name}`);
  const digest = Buffer.from(registry.integrity.slice(7), 'base64').toString('hex');
  const cached = path.join(consumerRoot, 'npm-cache/_cacache/content-v2/sha512', digest.slice(0, 2), digest.slice(2, 4), digest.slice(4));
  const bytes = await fs.readFile(cached);
  assert.equal(`sha512-${createHash('sha512').update(bytes).digest('base64')}`, registry.integrity, `Stock registry cache changed: ${name}`);
  const packed = inspectArchive(bytes);
  const packageRoot = await fs.realpath(path.join(consumerRoot, 'node_modules', name));
  for (const file of packed.inventory) {
    const installed = path.join(packageRoot, file.file);
    assert.equal((await fs.lstat(installed)).isFile(), true, `Stock package link/special file: ${name}/${file.file}`);
    assert(inside(packageRoot, await fs.realpath(installed)), `Stock package file escaped: ${name}/${file.file}`);
    assert.equal(sha256(await fs.readFile(installed)), file.sha256, `Stock package bytes changed: ${name}/${file.file}`);
  }
  return { name, version: registry.version, integrity: registry.integrity, cachedArchiveSha256: packed.sha256, files: packed.inventory.length };
}
export async function priorEvidence(report, reportPath, approved) {
  const sourceOutput = await fs.realpath(path.dirname(reportPath));
  assert.equal(sourceOutput, await fs.realpath(report.output));
  assert(inside(approved, sourceOutput), 'Prior output outside approved external root');
  const artifacts = [];
  const labels = new Map();
  for (const record of report.commands) {
    assert.deepEqual(record.command.slice(0, 2), ['rtk', 'proxy'], 'Non-RTK original command');
    assert(inside(await fs.realpath(report.temporaryDirectory), await fs.realpath(record.cwd)), 'Prior command escaped retained graph');
    for (const file of [record.stdout, record.stderr, record.stdout.replace(/\.stdout\.log$/, '.command.json')]) {
      const real = await fs.realpath(file); assert(inside(sourceOutput, real), `Prior evidence escaped output: ${file}`);
      const bytes = await fs.readFile(real); artifacts.push({ path: real, bytes: bytes.length, sha256: sha256(bytes) });
      if (file.endsWith('.command.json')) assert.deepEqual(JSON.parse(bytes), record, `Prior command record changed: ${file}`);
    }
    const label = path.basename(record.stdout, '.stdout.log');
    assert(!labels.has(label), `Duplicate prior command ${label}`); labels.set(label, record);
  }
  // Validate every inherited success, without executing installs/types/resolvers.
  for (const kind of Object.keys(peerSets)) {
    for (const suffix of ['install', 'installation-audit', 'import-audit', 'types', 'temporal-runtime', 'server-build', 'node-ssr']) successful(labels.get(`${kind}-${suffix}`), `${kind}-${suffix}`);
    const installed = labels.get(`${kind}-install`);
    assert.equal(installed.command[2], 'npm');
    for (const flag of ['--ignore-scripts', '--legacy-peer-deps', '--install-strategy=hoisted']) assert(installed.command.includes(flag), `Unsafe prior installation: missing ${flag}`);
    for (const [mask, conditions] of conditionSets().entries()) {
      const label = `${kind}-conditions-${mask}`, record = labels.get(label); successful(record, label);
      assert.deepEqual(record.command.slice(3), [...conditions.map(condition => `--conditions=${condition}`), 'resolution.mjs', String(mask)], `Prior matrix command mismatch: ${label}`);
      const file = path.join(sourceOutput, kind, `resolution-${mask}.json`), bytes = await fs.readFile(file), result = JSON.parse(bytes);
      assert.deepEqual(result.conditions, conditions); assert.deepEqual(result.failures, []);
      assert.deepEqual(result.records.map(entry => entry.key).sort(), Object.keys(report.exportContract.exports).sort(), `Incomplete prior runtime/resolution keys: ${label}`);
      artifacts.push({ path: file, bytes: bytes.length, sha256: sha256(bytes) });
    }
    const typesFile = path.join(sourceOutput, kind, 'types-result.json'), typeBytes = await fs.readFile(typesFile), types = JSON.parse(typeBytes);
    assert.deepEqual(types.failures, []); assert.deepEqual(types.modes, ['Bundler', 'NodeNext']);
    assert.deepEqual(types.keys, report.consumers[kind].typeKeys);
    const positives = types.results.filter(result => result.files);
    assert.equal(positives.length, 2);
    for (const positive of positives) { assert.deepEqual(positive.diagnostics, []); assert.equal(positive.options.strict, true); assert.equal(positive.options.skipLibCheck, false); }
    artifacts.push({ path: typesFile, bytes: typeBytes.length, sha256: sha256(typeBytes) });
  }
  successful(labels.get('archive-publint-attw'), 'archive-publint-attw');
  const lint = JSON.parse(await fs.readFile(path.join(sourceOutput, 'both/publint-result.json')));
  assert.deepEqual(lint.messages, []);
  assert.deepEqual(JSON.parse(await fs.readFile(path.join(sourceOutput, 'both/attw-classification.json'))).failures, []);
  return { sourceOutput, artifacts, labels };
}
export async function verifyRetainedConsumer(report, archive, consumerRoot, sourceOutput, approved) {
  assert(inside(approved, consumerRoot), 'Retained consumer outside approved external root');
  const matches = Object.entries(report.consumers).filter(([, consumer]) => consumer.stages['import-audit'].cwd === consumerRoot);
  assert.equal(matches.length, 1, 'Consumer not uniquely identified by complete original report');
  const [kind, prior] = matches[0];
  for (const name of ['installation.mjs', 'types.mjs', 'resolution.mjs', 'import-audit.mjs', 'temporal.mjs', 'app.tsx', 'server.tsx']) {
    assert.equal(sha256(await fs.readFile(path.join(consumerRoot, name))), report.fixtureHashes[name], `Prior executed fixture changed: ${name}`);
  }
  for (let ancestor = path.dirname(consumerRoot);; ancestor = path.dirname(ancestor)) {
    assert(!(await fs.lstat(path.join(ancestor, 'node_modules')).then(() => true, error => { if (error.code === 'ENOENT') return false; throw error; })), `Ancestor dependency resolution: ${ancestor}`);
    if (ancestor === path.dirname(ancestor)) break;
  }
  const proof = { kind, consumerRoot, archiveSha256: archive.sha256, stockRC13: true, workspacePatch: 'absent', artifacts: [], registryByteVerification: [] };
  for (const name of ['input.json', 'package.json', 'package-lock.json', 'installation-result.json', 'ssr-result.json', 'resolution-0.json']) {
    const bytes = await fs.readFile(path.join(consumerRoot, name));
    assert.equal(sha256(bytes), sha256(await fs.readFile(path.join(sourceOutput, kind, name))), `Retained prerequisite changed: ${name}`);
    proof.artifacts.push({ name, sha256: sha256(bytes) });
  }
  const input = JSON.parse(await fs.readFile(path.join(consumerRoot, 'input.json')));
  assert.deepEqual(input.pins, pins); assert.deepEqual(input.optionalPins, optionalPins); assert.deepEqual(input.peers, peerSets[kind]);
  assert.deepEqual(input.exports, report.package.exports); assert.deepEqual(input.contract, report.exportContract.exports);
  assert.deepEqual(input.inventory, archive.inventory); assert.deepEqual(input.conditionSets, conditionSets());
  assert.equal(input.kind, kind); assert.equal(sha256(await fs.readFile(input.tarball)), archive.sha256, 'Retained install archive changed');
  const lock = JSON.parse(await fs.readFile(path.join(consumerRoot, 'package-lock.json')));
  const locked = lock.packages[`node_modules/${input.name}`];
  assert.deepEqual(locked, prior.installation.archive); assert(!locked.link);
  assert.equal(locked.integrity, `sha512-${createHash('sha512').update(await fs.readFile(input.tarball)).digest('base64')}`, 'Retained archive integrity mismatch');
  assert.equal(lock.packages[''].dependencies[input.name], input.tarball);
  const packageDirectory = path.join(consumerRoot, 'node_modules', input.name);
  const files = [], actualManifests = [];
  async function walk(directory, packageFiles = false) {
    for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
      if (!packageFiles && entry.name === '.bin') continue;
      const file = path.join(directory, entry.name);
      assert(!entry.isSymbolicLink(), `Retained dependency link: ${file}`);
      if (entry.isDirectory()) await walk(file, packageFiles);
      else if (packageFiles) files.push(path.relative(packageDirectory, file));
      else if (entry.name === 'package.json') {
        const metadata = JSON.parse(await fs.readFile(file));
        if (metadata.name && metadata.version) actualManifests.push({ name: metadata.name, version: metadata.version, path: file });
      }
    }
  }
  await walk(path.join(consumerRoot, 'node_modules'));
  assertRetainedManifests(actualManifests, prior.installation.manifests);
  await walk(packageDirectory, true);
  assert.deepEqual(files.sort(), archive.inventory.map(file => file.file).sort(), 'Retained installed archive file list changed');
  for (const file of archive.inventory) assert.equal(sha256(await fs.readFile(path.join(packageDirectory, file.file))), file.sha256, `Retained archive byte mismatch: ${file.file}`);
  for (const metadata of prior.installation.manifests) {
    assert(inside(path.join(consumerRoot, 'node_modules'), metadata.path), 'Retained package manifest escaped consumer');
    const actual = JSON.parse(await fs.readFile(metadata.path));
    assert.equal(actual.name, metadata.name); assert.equal(actual.version, metadata.version);
  }
  // Byte-verify stock tool/runtime packages against the original private npm cache,
  // not just version strings. In particular a patched signals tree is rejected.
  for (const name of Object.keys(pins)) {
    const key = `node_modules/${name}`, registry = prior.installation.registryIntegrities[key];
    assert(registry && registry.version === pins[name] && registry.resolved.startsWith('https://'), `Missing stock registry provenance ${name}`);
    assert.deepEqual({ version: lock.packages[key].version, resolved: lock.packages[key].resolved, integrity: lock.packages[key].integrity }, registry);
    proof.registryByteVerification.push(await verifyStockBytes(consumerRoot, name, registry));
  }
  const ssr = JSON.parse(await fs.readFile(path.join(consumerRoot, 'ssr-result.json')));
  assert.equal(ssr.isServer, true); assert.deepEqual(ssr.errors, []); assert(ssr.html && ssr.bootstrap);
  proof.ssrSha256 = sha256(JSON.stringify(ssr));
  return { kind, prior, input, proof };
}
export async function failureCensus(report, sourceOutput) {
  const logs = [], failures = [];
  for (const record of report.commands) {
    for (const name of ['stdout', 'stderr']) {
      const bytes = await fs.readFile(record[name]); logs.push({ path: record[name], bytes: bytes.length, sha256: sha256(bytes) });
    }
    if (record.code !== 0 || record.timedOut || record.spawnError) {
      const stderr = await fs.readFile(record.stderr, 'utf8');
      const cause = stderr.includes('[INEFFECTIVE_DYNAMIC_IMPORT]') ? 'harness-static-dynamic-import-conflict' : stderr.includes('unused: unwanted initialization retained') ? 'conservative-side-effects-audit-required' : 'unclassified-failure';
      failures.push({ command: record.command, cwd: record.cwd, stderr: record.stderr, cause });
    }
  }
  const graphs = [];
  for (const kind of Object.keys(peerSets)) {
    const file = path.join(sourceOutput, kind, 'bundle-shaking-0.json'), bytes = await fs.readFile(file), graph = JSON.parse(bytes);
    graphs.push({ kind, path: file, sha256: sha256(bytes), sideEffects: report.package.sideEffects,
      fixtures: graph.reports.map(chunk => ({ label: chunk.label, bytes: chunk.bytes, gzipBytes: chunk.gzipBytes,
        retainedLibraryModules: chunk.modules.filter(module => module.renderedLength > 0 && module.id.includes(`/node_modules/${report.package.name}/`)) })) });
  }
  return { logs, failures, causeCounts: Object.fromEntries([...new Set(failures.map(failure => failure.cause))].map(cause => [cause, failures.filter(failure => failure.cause === cause).length])), graphs,
    blocker: { owner: 'bsolid-dist-shaking', status: 'blocked', reason: 'Actual unused/root/subpath graphs retain library initialization under deliberately conservative sideEffects:true; source/compiler side-effect audit and reviewed metadata decision required. No archive or production policy modified.' } };
}
