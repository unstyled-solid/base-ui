import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { BASELINE, git, readTree } from '../../scripts/tracking/git.mjs';
import { buildInventory, detectDrift, detectExportDrift, stableJSON, applyLedgerMappings } from '../../scripts/tracking/inventory.mjs';
import { mapOwnership, relativePath } from '../../scripts/tracking/ownership.mjs';
import { analyzeTests, dependencyGraph } from '../../scripts/tracking/analyze.mjs';
import { aggregate, validateSchema } from '../../scripts/tracking/validate.mjs';

const schema = JSON.parse(readFileSync(new URL('../../tracking/schema/ledger.schema.json', import.meta.url)));
const inventorySchema = JSON.parse(readFileSync(new URL('../../tracking/schema/inventory.schema.json', import.meta.url)));
const owner = { id: 'bsolid-fixture', owns: ['packages/solid/src/**', 'tracking/components/fixture.json'], sourcePaths: [] };
const dist = { id: 'bsolid-dist-contract', owns: [], sourcePaths: [] };
const blocker = { id: 'bsolid-inventory-runtime', owns: [], sourcePaths: [] };
const owners = [owner, dist, blocker];
const policy = { overrides: [], serializedFamilies: [], rules: [{ pattern: 'packages/react/package.json', owner: dist.id,
  disposition: 'excluded-with-reason', reason: 'Independent Solid package metadata.' }] };
const blob = (content) => createHash('sha1').update(`blob ${Buffer.byteLength(content)}\0${content}`).digest('hex');
const entry = (path, content) => ({ path, content, blob: blob(content), mode: '100644' });
const source = 'packages/react/src/Foo.test.tsx';
const fixture = (code = "describe('Foo', () => { it('works', () => {}); });", exports = { '.': './src/index.ts' }) => [
  entry('packages/react/package.json', JSON.stringify({ name: '@base-ui/react', exports })),
  entry('packages/react/src/index.ts', "export * from './Foo';"),
  entry('packages/react/src/Foo.ts', 'export const Foo = 1;'), entry(source, code),
];
const build = (entries = fixture(), own = owners, pol = policy) => buildInventory(entries, own, pol, BASELINE);
function ledgerFor(manifest, status = 'passing') {
  const s = manifest.sources.find((e) => e.path === source);
  return { path: 'tracking/components/fixture.json', ledger: { schemaVersion: 1, baseline: BASELINE, owner: owner.id,
    sources: [{ path: source, blob: s.blob, targets: ['packages/solid/src/Foo.test.tsx'], disposition: 'translated', reason: 'Native event assertions retained.' }],
    cases: [{ id: s.tests.declarations[0].id, sourcePath: source, sourceBlob: s.blob, kind: 'static-declaration', status,
      targets: ['packages/solid/src/Foo.test.tsx'], reason: 'Original assertion mapped to native implementation.', evidence: ['rtk pnpm test:jsdom Foo --no-watch: pass'], blockers: [] }] } };
}

test('all inputs and exports have pinned blobs, one owner, stable output, and root policy', () => {
  const entries = fixture(undefined, { '.': './src/index.ts', './internals/foo': './src/Foo.ts', './types': './src/Foo.ts', './unstable-use-media-query': './src/Foo.ts' });
  const result = build(entries);
  assert.equal(stableJSON(result), stableJSON(build([...entries].reverse(), [...owners].reverse())));
  assert.equal(result.sourceManifest.sources.length, 4);
  assert.deepEqual(result.exportManifest.exports.map((e) => [e.key, e.rootPolicy]), [
    ['.', 'root'], ['./internals/foo', 'subpath-only'], ['./types', 'type-only'], ['./unstable-use-media-query', 'subpath-only'],
  ]);
  assert.equal(result.sourceManifest.sources.find((e) => e.path === source).blob, blob(entries[3].content));
});

test('unknown paths, missing ownership and duplicate ownership fail closed', () => {
  assert.throws(() => build([...fixture(), entry('unknown/new.ts', '')]), /Missing ownership unknown/);
  assert.throws(() => build(fixture(), owners.filter((o) => o !== owner)), /Missing ownership/);
  assert.throws(() => build(fixture(), [...owners, { ...owner, id: 'bsolid-competing' }]), /Duplicate ownership/);
  assert.throws(() => build([...fixture(), fixture()[3]]), /Duplicate source path/);
});

test('serialized family stages require an explicit group and retain all candidates', () => {
  const second = { ...owner, id: 'bsolid-fixture-second' };
  const pol = { ...policy, serializedFamilies: [{ owner: owner.id, stages: [owner.id, second.id] }] };
  const result = build(fixture(), [...owners, second], pol).sourceManifest.sources.find((e) => e.path === source);
  assert.equal(result.owner, owner.id);
  assert.deepEqual(result.provenance.candidates, [owner.id, second.id]);
});

test('source research references do not confer write ownership', () => {
  const readOnly = { id: 'bsolid-reader', owns: [], sourcePaths: [source] };
  assert.equal(build(fixture(), [...owners, readOnly]).sourceManifest.sources.find((s) => s.path === source).owner, owner.id);
});

test('policy override retains displaced claims and requires a reason and owned safe target', () => {
  const rule = { pattern: source, owner: owner.id, target: 'packages/solid/src/NativeFoo.test.tsx', disposition: 'translated', reason: 'Approved native source adaptation.' };
  const result = mapOwnership(fixture()[3], owners, { ...policy, overrides: [rule] });
  assert.deepEqual(result.provenance.previousClaims, [{ owner: owner.id, target: 'packages/solid/src/Foo.test.tsx' }]);
  assert.throws(() => mapOwnership(fixture()[3], owners, { ...policy, overrides: [{ ...rule, reason: '' }] }), /Missing disposition reason/);
  assert.throws(() => mapOwnership(fixture()[3], owners, { ...policy, overrides: [rule, rule] }), /Duplicate overrides/);
  for (const target of ['../other.json', '/tmp/file', 'upstream/base-ui/file.ts', 'another/owner.ts']) {
    assert.throws(() => mapOwnership(fixture()[3], owners, { ...policy, overrides: [{ ...rule, target }] }), /Unsafe target|outside owner/);
  }
});

test('add, delete and equal-blob rename drift are reported without transferring ownership', () => {
  const before = build().sourceManifest.sources;
  const changed = fixture().filter((e) => e.path !== source);
  changed.push({ ...fixture()[3], path: 'packages/react/src/Renamed.test.tsx' });
  const drift = detectDrift(before, build(changed).sourceManifest.sources);
  assert.deepEqual(drift.added, ['packages/react/src/Renamed.test.tsx']);
  assert.deepEqual(drift.deleted, [source]);
  assert.deepEqual(drift.renames, [{ from: source, to: 'packages/react/src/Renamed.test.tsx', blob: fixture()[3].blob }]);
});

test('export additions, renames, deletions, condition changes and missing source fail checks', () => {
  const before = build(fixture(undefined, { './old': './src/Foo.ts' })).exportManifest.exports;
  const after = build(fixture(undefined, { './new': './src/Foo.ts' })).exportManifest.exports;
  assert.deepEqual(detectDrift(before, after, 'key').renames, [{ from: './old', to: './new', blob: before[0].blob }]);
  assert.deepEqual(detectDrift(before, [], 'key').deleted, ['./old']);
  assert.deepEqual(detectDrift([], after, 'key').added, ['./new']);
  assert.throws(() => build(fixture(undefined, { './missing': './src/Missing.ts' })), /Missing export source/);
  assert.throws(() => build(fixture(undefined, { './*': './src/Foo.ts' })), /Unsafe\/unexpanded export/);
  const conditional = build(fixture(undefined, { './old': { browser: './src/Foo.ts', default: './src/index.ts' } })).exportManifest.exports;
  assert.equal(conditional.length, 2);
  assert.deepEqual(detectExportDrift(before, conditional).added, ['./old#browser', './old#default']);
  assert.throws(() => detectDrift(before, conditional, 'key'), /Duplicate drift identity/);
  const modified = structuredClone(conditional); modified[0].blob = 'a'.repeat(40);
  assert.deepEqual(detectExportDrift(conditional, modified).changed, ['./old#browser']);
});

test('parameterized loops and conformance helpers remain unresolved, never file-count parity', () => {
  const code = `describe.skipIf(isJSDOM)('browser', () => {
    describe.each(['ltr', 'rtl'])('%s', () => {
      it.each([[1], [2]])('value %s', () => {});
      it.todo('later');
    });
    for (const value of values) it(\`computed \${value}\`, () => {});
    describeConformance(<Thing />, () => ({ skip: ['refForwarding'] }));
    popupConformanceTests({ alwaysMounted: true });
  });`;
  const inventory = analyzeTests(source, code);
  assert.equal(inventory.declarations.length, 3);
  assert.equal(inventory.runtimeCaseCount, null);
  assert.ok(inventory.declarations[0].flags.includes('skipIf'));
  assert.ok(inventory.declarations[0].flags.includes('each'));
  assert.ok(inventory.unresolved.some((u) => u.expression === 'describeConformance'));
  assert.ok(inventory.unresolved.some((u) => u.expression === 'popupConformanceTests'));
  assert.equal(inventory.declarations[2].title, null);
  const changed = build(fixture(code)).sourceManifest.sources;
  assert.ok(detectDrift(build().sourceManifest.sources, changed).changed.includes(source));
  const report = aggregate(build(fixture(code)).sourceManifest, [], owners, schema);
  assert.equal(report.runtimeCoverage.totalCases, null);
  assert.equal(report.runtimeCoverage.percentage, null);
  assert.ok(report.unmapped.length > report.totals.testFiles);
});

test('comments and strings are not test registrations; spec files retain compiler obligations', () => {
  const result = analyzeTests(source, `// it('fake', () => {});\nconst text = "it('fake2')"; it.skip('real', () => {});`);
  assert.deepEqual(result.declarations.map((d) => d.title), ['real']);
  assert.deepEqual(result.declarations[0].flags, ['skip']);
  const spec = analyzeTests('packages/react/src/Foo.spec.tsx', 'const element = <Foo />;');
  assert.equal(spec.kind, 'type-spec');
  assert.match(spec.unresolved[0].reason, /compiler-backed/);
  const skip = analyzeTests(source, `it('text skip()', () => { /* skip(); */ const text = 'skip()'; }); it('browser', ({skip}) => { if(isJSDOM) skip(); });`);
  assert.deepEqual(skip.declarations.map((d) => d.runtimeSkip), [false, true]);
});

test('transitive consumers include relative, package aliases and both prehydration conditions', () => {
  const entries = [
    entry('packages/utils/src/clamp.ts', 'export const clamp = () => {};'),
    entry('packages/react/src/Foo.ts', "import {clamp} from '@base-ui/utils/clamp';"),
    entry('packages/react/src/index.ts', "export * from './Foo';"),
    entry('packages/react/src/use.ts', "import '#prehydration/tabs/indicator'; import '#unknown';"),
    entry('packages/react/src/internals/prehydrationScript.stub.ts', ''),
    entry('packages/react/src/tabs/indicator/prehydrationScript.min.ts', ''),
  ];
  const graph = dependencyGraph(entries);
  assert.deepEqual(graph.consumers(entries[0].path), [entries[1].path, entries[2].path]);
  assert.deepEqual(graph.consumers(entries[4].path), [entries[3].path]);
  assert.deepEqual(graph.consumers(entries[5].path), [entries[3].path]);
  assert.deepEqual(graph.details.get(entries[3].path).unresolvedImports, ['#unknown']);
});

test('ledger cases require exact IDs, blobs, ownership and evidence; passing static is not runtime coverage', () => {
  const { sourceManifest } = build();
  const ledger = ledgerFor(sourceManifest);
  const report = aggregate(sourceManifest, [ledger], owners, schema);
  assert.equal(report.caseStatuses.passing, 1);
  assert.equal(report.runtimeCoverage.passingCases, 0);
  assert.equal(report.runtimeCoverage.totalCases, null);
  for (const [mutate, error] of [
    [(l) => { l.ledger.baseline = 'a'.repeat(40); }, /Wrong ledger baseline/],
    [(l) => { l.ledger.cases[0].sourceBlob = 'b'.repeat(40); }, /drifted source/],
    [(l) => { l.ledger.cases[0].id = 'invented'; }, /Unknown\/mismatched case/],
    [(l) => { l.ledger.cases[0].evidence = []; }, /Missing case evidence/],
    [(l) => { l.ledger.cases[0].targets = []; }, /Missing case evidence/],
    [(l) => { l.ledger.cases[0].targets = ['elsewhere/test.ts']; }, /outside .* ownership/],
    [(l) => { l.path = 'tracking/components/someone-else.json'; }, /Ledger outside owner/],
    [(l) => { l.ledger.cases[0].status = 'blocked'; }, /Missing blocker/],
    [(l) => { l.ledger.cases[0].status = 'upstream-skipped'; }, /Unproven upstream skip/],
  ]) {
    const invalid = structuredClone(ledger); mutate(invalid);
    assert.throws(() => aggregate(sourceManifest, [invalid], owners, schema), error);
  }
  assert.throws(() => aggregate(sourceManifest, [ledger], owners, schema, () => false), /Missing passing target/);
  const duplicate = structuredClone(ledger); duplicate.ledger.sources = [];
  assert.throws(() => aggregate(sourceManifest, [ledger, duplicate], owners, schema), /Duplicate case ownership/);
});

test('unresolved cases cannot be passed, adapted or skipped; pending-browser remains incomplete', () => {
  const { sourceManifest } = build();
  const ledger = ledgerFor(sourceManifest, 'pending-browser');
  assert.equal(aggregate(sourceManifest, [ledger], owners, schema).caseStatuses['pending-browser'], 1);
  for (const status of ['passing', 'adapted', 'upstream-skipped']) {
    const unresolved = structuredClone(ledger);
    unresolved.ledger.cases[0].id = `${source}#collection`;
    unresolved.ledger.cases[0].kind = 'unresolved-dynamic';
    unresolved.ledger.cases[0].status = status;
    assert.throws(() => aggregate(sourceManifest, [unresolved], owners, schema), /Unresolved dynamic case cannot/);
  }
});

test('schema rejects typo versions, unknown fields and non-relative paths', () => {
  const ledger = ledgerFor(build().sourceManifest).ledger;
  validateSchema(ledger, schema);
  assert.throws(() => validateSchema({ ...ledger, schemaVersion: 2 }, schema), /Expected 1/);
  assert.throws(() => validateSchema({ ...ledger, magic: true }, schema), /Unknown property/);
  for (const path of ['../escape.ts', '/absolute.ts', 'a/../b.ts', 'a\\b.ts', 'a//b.ts', 'C:/file.ts']) {
    assert.equal(relativePath(path), false);
    const invalid = structuredClone(ledger); invalid.sources[0].path = path;
    assert.throws(() => validateSchema(invalid, schema), /Pattern mismatch/);
  }
  assert.equal(relativePath('docs/[...slug]/page.tsx'), true);
  const whitespace = structuredClone(ledger); whitespace.sources[0].reason = '  ';
  assert.throws(() => validateSchema(whitespace, schema), /Pattern mismatch/);
});

test('generated bundle schema rejects malformed provenance, fake runtime coverage and unknown output fields', () => {
  const inventory = build();
  const bundle = { ...inventory, report: aggregate(inventory.sourceManifest, [], owners, schema) };
  validateSchema(bundle, inventorySchema);
  const invalid = structuredClone(bundle);
  invalid.report.runtimeCoverage.totalCases = invalid.report.totals.testFiles;
  assert.throws(() => validateSchema(invalid, inventorySchema), /No anyOf branch/);
  const malformed = structuredClone(bundle);
  malformed.sourceManifest.sources[0].provenance.kind = 'guessed';
  assert.throws(() => validateSchema(malformed, inventorySchema), /Expected one of/);
  assert.throws(() => validateSchema({ ...bundle, verified: true }, inventorySchema), /Unknown property/);
});

test('worker refinements retain provenance and do not mutate input ledgers or source data', () => {
  const inventory = build(fixture(undefined, { '.': './src/index.ts', './foo-test': './src/Foo.test.tsx' }));
  const ledger = ledgerFor(inventory.sourceManifest);
  ledger.ledger.sources[0].targets = ['packages/solid/src/Native.test.tsx'];
  aggregate(inventory.sourceManifest, [ledger], owners, schema);
  const before = stableJSON({ inventory, ledger });
  const result = applyLedgerMappings(inventory.sourceManifest, inventory.exportManifest, [ledger]);
  const mapped = result.sourceManifest.sources.find((s) => s.path === source);
  assert.equal(mapped.provenance.kind, 'ledger');
  assert.equal(mapped.provenance.previousMapping.provenance.kind, 'target-allowlist');
  assert.deepEqual(result.exportManifest.exports.find((e) => e.key === './foo-test').targets, ['packages/solid/src/Native.test.tsx']);
  assert.equal(stableJSON({ inventory, ledger }), before);
});

test('exact Git objects win over dirty/untracked checkout; NUL tree and batch preserve blob bytes', (t) => {
  const fixtureParent = join(tmpdir(), 'opencode');
  mkdirSync(fixtureParent, { recursive: true });
  const repo = mkdtempSync(join(fixtureParent, 'bsolid-inventory-fixture-'));
  t.after(() => rmSync(repo, { recursive: true, force: true }));
  git(repo, ['init', '--quiet']);
  const content = "it.each([1,2])('value %s', () => {});\n";
  const shaBlob = git(repo, ['hash-object', '-w', '--stdin'], { input: content }).toString().trim();
  const tree = git(repo, ['mktree'], { input: `100644 blob ${shaBlob}\tcase with spaces.test.ts\n` }).toString().trim();
  // Synthetic commit object in an isolated fixture, no git commit, branch or repository history update.
  const commit = git(repo, ['hash-object', '-t', 'commit', '-w', '--stdin'], { input: `tree ${tree}\nauthor Fixture <fixture@example.invalid> 1 +0000\ncommitter Fixture <fixture@example.invalid> 1 +0000\n\nfixture\n` }).toString().trim();
  writeFileSync(join(repo, 'case with spaces.test.ts'), "it('dirty', () => {});");
  mkdirSync(join(repo, 'node_modules'));
  writeFileSync(join(repo, 'node_modules', 'untracked.test.ts'), "it('never collect', () => {});");
  const before = git(repo, ['status', '--porcelain']).toString();
  const entries = readTree(repo, commit);
  assert.equal(entries.length, 1);
  assert.equal(entries[0].content, content);
  assert.equal(entries[0].blob, shaBlob);
  assert.equal(stableJSON(entries), stableJSON(readTree(repo, commit)));
  assert.equal(git(repo, ['status', '--porcelain']).toString(), before);
  assert.throws(() => readTree(repo, 'HEAD'), /immutable full SHA/);
});
