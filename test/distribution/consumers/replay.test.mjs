import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { gzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import { parseReplayArgs, assertPriorReport, browserMasks, verifyStockBytes, assertRetainedManifests } from '../../../scripts/distribution/consumers/replay-evidence.mjs';
import { sha256, peerSets, temporaryRoot } from '../../../scripts/distribution/consumers/policy.mjs';
import { runtimeKeys, staticRuntimeSource, namespaceOracle, assertRuntimeAccounting } from './templates/runtime-accounting.mjs';

const input = { name: 'baseui-solid2', kind: 'ordinary', contract: { '.': { kind: 'runtime' }, './button': { kind: 'runtime' }, './types': { kind: 'types-only' },
  './internals/temporal-adapter-date-fns': { kind: 'runtime' }, './internals/temporal-adapter-luxon': { kind: 'runtime' } } };
test('generated accounting uses static executable namespace bindings for every applicable export', async () => {
  const ts = (await import('typescript')).default;
  for (const kind of Object.keys(peerSets)) {
    const value = { ...input, kind }, source = staticRuntimeSource(value);
    const ast = ts.createSourceFile('all-runtime.mjs', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
    assert.deepEqual(ast.parseDiagnostics, []);
    const imports = ast.statements.filter(ts.isImportDeclaration);
    assert.equal(imports.length, runtimeKeys(value).length);
    assert(imports.every(statement => ts.isNamespaceImport(statement.importClause.namedBindings)));
    assert.deepEqual(imports.map(statement => statement.moduleSpecifier.text), runtimeKeys(value).map(key => input.name + (key === '.' ? '' : key.slice(1))));
    assert.doesNotMatch(source, /import\(|Promise\.all|\.\/packages\/|workspace:|file:/);
    assert.match(source, /value: Runtime0/); assert.match(source, /Object\.entries\(value\)/);
    assert(!imports.some(statement => statement.moduleSpecifier.text === 'baseui-solid2/types'));
  }
});
test('browser accounting cannot report omitted keys, omitted namespace symbols or unobserved bindings as passed', () => {
  const resolution = { conditions: [], failures: [], records: [{ key: '.', runtime: 'passed', exports: ['Button', 'Toggle'] }, { key: './button', runtime: 'passed', exports: ['Button'] }] };
  const oracle = namespaceOracle(input, resolution);
  const records = Object.entries(oracle).map(([key, exports]) => ({ key, exports, bindings: exports.map(name => ({ name, type: 'function' })) }));
  assert.doesNotThrow(() => assertRuntimeAccounting(input, records, oracle));
  for (const mutate of [rows => rows.pop(), rows => rows.push(rows[0]), rows => rows[0].exports.pop(), rows => rows[0].bindings.pop(), rows => rows[0].bindings[0].type = undefined]) {
    const changed = structuredClone(records); mutate(changed); assert.throws(() => assertRuntimeAccounting(input, changed, oracle));
  }
  for (const mutate of [result => result.conditions.push('browser'), result => result.failures.push('unresolved'), result => result.records[0].runtime = 'failed', result => result.records.pop()]) {
    const changed = structuredClone(resolution); mutate(changed); assert.throws(() => namespaceOracle(input, changed));
  }
});
test('replay selections are explicit, bounded and keep the full16 browser condition matrix available', () => {
  const base = ['--tarball', '/tmp/package.tgz', '--report', '/tmp/old/report.json', '--consumer', '/tmp/retained', '--output', '/tmp/new'];
  assert.deepEqual(parseReplayArgs(base).masks, browserMasks); assert.equal(browserMasks.length, 16);
  assert.deepEqual(parseReplayArgs([...base, '--conditions', 'default']).masks, [2]);
  assert.deepEqual(parseReplayArgs([...base, '--conditions', 'focused']).masks, [2, 6, 10, 18]);
  for (const args of [[], [...base, '--conditions', 'skip'], [...base, '--consumer', '/tmp/other'], [...base, '--install', '/tmp/new']]) assert.throws(() => parseReplayArgs(args));
  assert.throws(() => parseReplayArgs(base.map(value => value === '/tmp/package.tgz' ? 'relative.tgz' : value)));
});
test('replay rejects injected optional peers, removed dependencies and tool-version drift', () => {
  const original = [{ name: 'solid-js', version: '2.0.0-rc.13', path: '/consumer/node_modules/solid-js/package.json' },
    { name: 'vite', version: '8.3.2', path: '/consumer/node_modules/vite/package.json' }];
  assert.doesNotThrow(() => assertRetainedManifests(original.slice().reverse(), original));
  assert.throws(() => assertRetainedManifests([...original, { name: 'luxon', version: '3.7.2', path: '/consumer/node_modules/luxon/package.json' }], original));
  assert.throws(() => assertRetainedManifests(original.slice(1), original));
  assert.throws(() => assertRetainedManifests(original.map(entry => entry.name === 'vite' ? { ...entry, version: '9.0.0' } : entry), original));
});
async function prior() {
  const contract = JSON.parse(await fs.readFile(new URL('../../../distribution/exports.json', import.meta.url)));
  const exports = Object.fromEntries(Object.entries(contract.exports).map(([key, entry]) => {
    const stem = entry.target.slice(6).replace(/\.tsx?$/, '');
    return [key, Object.fromEntries((entry.kind === 'types-only' ? ['types'] : contract.pathRules.conditionOrder).map(condition => [condition, contract.pathRules[condition].replace('{stem}', stem)]))];
  }));
  const manifest = { name: 'baseui-solid2', version: '0.0.0', exports };
  const archive = { sha256: sha256('real archive bytes'), files: new Map([['package.json', Buffer.from(JSON.stringify(manifest))]]), inventory: [{ file: 'package.json', bytes: 1, sha256: sha256('metadata') }] };
  const report = { schemaVersion: 1, owner: 'bsolid-dist-pack', status: 'blocked', ended: 'actual-completed-run', archiveSha256: archive.sha256,
    package: manifest, inventory: archive.inventory, exportContract: contract, contractHashes: { exports: sha256(JSON.stringify(contract)) }, nodeVersion: process.versions.node,
    stages: Object.fromEntries(['inventory', 'analysis', 'immutable-archive'].map(stage => [stage, { status: 'passed' }])),
    consumers: Object.fromEntries(Object.keys(peerSets).map(kind => [kind, { peerSet: peerSets[kind], installation: { stockRC13: true, workspacePatch: 'absent' },
      stages: Object.fromEntries(['installation', 'import-audit', 'types', 'resolution', 'runtime', 'temporal', 'ssr'].map(stage => [stage, { status: 'passed', ...(stage === 'types' ? { skipLibCheck: false } : {}), ...(stage === 'resolution' ? { sets: 64 } : {}) }])),
      typeModes: ['Bundler', 'NodeNext'], resolutionSets: 64, typeKeys: Object.keys(contract.exports).filter(key => !key.includes('temporal-adapter-') || kind === 'both' || key.endsWith(`temporal-adapter-${kind}`)) }])) };
  return { report, archive };
}
test('a blocked prior full gate can authorize scoped replay, but incomplete/foreign successful prerequisites cannot', async () => {
  const { report, archive } = await prior(); assert.doesNotThrow(() => assertPriorReport(report, archive));
  for (const mutate of [value => value.archiveSha256 = sha256('another archive'), value => value.owner = 'other', value => delete value.ended,
    value => value.contractHashes.exports = sha256('stale contract'), value => value.stages.analysis.status = 'failed', value => value.consumers.luxon.stages.ssr.status = 'blocked',
    value => value.consumers.ordinary.installation.workspacePatch = 'present', value => value.consumers.both.typeKeys.pop(), value => value.consumers.ordinary.typeModes.pop(),
    value => value.consumers['date-fns'].stages.types.skipLibCheck = true, value => value.consumers.ordinary.resolutionSets--]) {
    const changed = structuredClone(report); mutate(changed); assert.throws(() => assertPriorReport(changed, archive));
  }
});
test('warning rejection and coordinator notice allowance remain intact through correction', async () => {
  const bundle = await fs.readFile(new URL('./templates/bundle.mjs', import.meta.url), 'utf8');
  assert.match(bundle, /onwarn\(warning\) \{ throw new Error\(warning\.message\); \}/);
  const policy = await fs.readFile(new URL('../../../scripts/distribution/consumers/policy.mjs', import.meta.url), 'utf8');
  assert.match(policy, /'notices'/); assert.match(policy, /'THIRD-PARTY-NOTICES\.md'/);
});
function entry(name, text) {
  const content = Buffer.from(text), header = Buffer.alloc(512);
  header.write(`package/${name}`); header.write('0000644\0', 100); header.write('0000000\0', 108); header.write('0000000\0', 116);
  header.write(`${content.length.toString(8).padStart(11, '0')}\0`, 124); header.write('00000000000\0', 136);
  header.fill(32, 148, 156); header.write('0', 156); header.write('ustar\0', 257);
  header.write(`${header.reduce((sum, byte) => sum + byte, 0).toString(8).padStart(6, '0')}\0 `, 148);
  return Buffer.concat([header, content, Buffer.alloc((512 - content.length % 512) % 512)]);
}
test('retained stock runtime verification rejects patched bytes, altered registry cache and symlinks', async () => {
  const directory = await fs.mkdtemp(path.join(temporaryRoot, 'bsolid-replay-unit-'));
  try {
    const source = 'export const stock = true;';
    const metadata = '{"name":"@solidjs/signals","version":"2.0.0-rc.13"}';
    const archive = gzipSync(Buffer.concat([entry('package.json', metadata), entry('dist/runtime.js', source), Buffer.alloc(1024)]));
    const digest = createHash('sha512').update(archive).digest();
    const hex = digest.toString('hex'), integrity = `sha512-${digest.toString('base64')}`;
    const cached = path.join(directory, 'npm-cache/_cacache/content-v2/sha512', hex.slice(0, 2), hex.slice(2, 4), hex.slice(4));
    const installed = path.join(directory, 'node_modules/@solidjs/signals');
    await fs.mkdir(path.dirname(cached), { recursive: true }); await fs.mkdir(path.join(installed, 'dist'), { recursive: true });
    await fs.writeFile(cached, archive); await fs.writeFile(path.join(installed, 'package.json'), metadata);
    const runtime = path.join(installed, 'dist/runtime.js'); await fs.writeFile(runtime, source);
    const provenance = { version: '2.0.0-rc.13', integrity };
    assert.equal((await verifyStockBytes(directory, '@solidjs/signals', provenance)).files, 2);
    await fs.writeFile(runtime, source + '\n// patched workspace runtime');
    await assert.rejects(verifyStockBytes(directory, '@solidjs/signals', provenance), /bytes changed/);
    await fs.writeFile(runtime, source); await fs.writeFile(cached, Buffer.from('corrupted cache'));
    await assert.rejects(verifyStockBytes(directory, '@solidjs/signals', provenance), /cache changed/);
    await fs.writeFile(cached, archive); await fs.unlink(runtime); await fs.symlink(path.join(installed, 'package.json'), runtime);
    await assert.rejects(verifyStockBytes(directory, '@solidjs/signals', provenance), /link\/special/);
  } finally { await fs.rm(directory, { recursive: true, force: true }); }
});
