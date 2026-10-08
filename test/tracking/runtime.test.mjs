import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { BASELINE } from '../../scripts/tracking/git.mjs';
import { analyzeTests } from '../../scripts/tracking/analyze.mjs';
import { ingestCollections, requirements, environments, assertQualified, runtimeSchema } from '../../scripts/tracking/runtime.mjs';
import { aggregate, validateSchema } from '../../scripts/tracking/validate.mjs';
import { collectWithVitest, retainTask, projectIdentity, helperImports } from '../../scripts/tracking/vitest-collect.mjs';
import { collectCompiler } from '../../scripts/tracking/type-collect.mjs';
import { retainPlaywright } from '../../scripts/tracking/playwright-collect.mjs';
import ts from 'typescript';
import { sourceMatrix } from '../qualification/browser/source-matrix.mjs';

const schema = JSON.parse(readFileSync(new URL('../../tracking/schema/ledger.schema.json', import.meta.url)));
const path = 'packages/react/src/Foo.test.tsx';
const code = `describe.each(['ltr', 'rtl'])('%s', () => { it.each([1,2])('value %s', () => {}); it.skip('skipped', () => {}); it.todo('later'); describeConformance(<Foo />, () => ({})); it('conditional', ({skip}) => { skip(); }); });`;
const blob = createHash('sha1').update(`blob ${Buffer.byteLength(code)}\0${code}`).digest('hex');
const owner = { id: 'bsolid-fixture', owns: ['tracking/components/fixture.json', 'packages/solid/src/**'] };
const source = { path, blob, owner: owner.id, provenance: { kind: 'policy' }, tests: analyzeTests(path, code) };
const manifest = { schemaVersion: 1, baseline: BASELINE, sources: [source] };
const task = (name, mode = 'run', each = false) => ({ type: 'test', name, mode, each });
const tasks = [
  { type: 'suite', name: 'ltr', mode: 'run', each: true, tasks: [task('value 1'), task('value 2'), task('skipped', 'skip'), task('later', 'todo')] },
  { type: 'suite', name: 'rtl', mode: 'run', each: true, tasks: [task('value 1'), task('value 2'), task('skipped', 'skip'), task('later', 'todo')] },
  { type: 'suite', name: 'conformance', mode: 'skip', each: false, tasks: [task('ref')] },
];
function document(environment = 'jsdom') {
  const file = { path, blob, environment, project: '@base-ui/react', runnerProject: environment === 'jsdom' ? '@base-ui/react' : `@base-ui/react (${environment})` };
  return { schemaVersion: 1, baseline: BASELINE, method: 'vitest-runtime-collect', command: ['rtk', 'proxy', 'node', 'collector'],
    toolchain: { node: 'v24.21.0', vitest: '5.0.0-beta.4' }, specifications: [file],
    files: [{ ...file, mode: 'run', tasks: structuredClone(tasks), errors: [] }], errors: [] };
}
const ledger = (item, status = 'passing') => ({ path: 'tracking/components/fixture.json', ledger: {
  schemaVersion: 1, baseline: BASELINE, owner: owner.id, sources: [], cases: [{ id: item.id, kind: item.kind,
    sourcePath: path, sourceBlob: blob, targets: ['packages/solid/src/Foo.test.tsx'], status, reason: 'Retained source case', evidence: ['exact case evidence'], blockers: [] }] } });
const report = (runtime, ledgers = []) => aggregate(manifest, ledgers, [owner], schema, () => true, runtime);

test('real task trees expand parameters, conformance, inherited skip/todo, and deterministic environment/blob IDs', () => {
  const result = ingestCollections(manifest, [document()]);
  assert.equal(result.cases.length, 9);
  assert.equal(new Set(result.cases.map((c) => c.id)).size, 9);
  assert.equal(result.cases.filter((c) => c.parameterized).length, 8);
  assert.equal(result.cases.filter((c) => c.mode === 'todo').length, 2);
  assert.equal(result.cases.filter((c) => c.mode === 'skip').length, 3);
  assert.ok(result.cases.every((c) => c.conformanceObligations.length === 1));
  assert.ok(result.cases.every((c) => c.parameterValues === 'not-exposed-by-vitest'));
  assert.deepEqual(result, ingestCollections(manifest, [document()]));
  assert.equal(result.missing.length, 3);
  assert.equal(report(result).runtimeCoverage.totalCases, null);
  assert.equal(report(result).runtimeCoverage.collectedCases, 9);
  assert.equal(report(result).runtimeCoverage.passingCases, 0);
  assert.throws(() => assertQualified(report(result)), /Qualification blocked/);
  const chrome = ingestCollections(manifest, [document('chromium')]);
  assert.ok(chrome.cases.every((c) => !result.cases.some((d) => c.id === d.id)));
});

test('full environment collection creates a real denominator but never erases existing static gaps or implies parity', () => {
  const result = ingestCollections(manifest, environments.map(document));
  assert.equal(result.complete, true);
  assert.equal(report(result).runtimeCoverage.totalCases, 36);
  assert.equal(report(result).unresolved.length, source.tests.unresolved.length);
  assert.throws(() => assertQualified(report(result)), /Qualification blocked/);
  validateSchema(report(result).runtimeCoverage, { $ref: '#/$defs/collectedCoverage' }, runtimeSchema);
});

test('strict ingestion rejects unknown paths, baseline/blob/hash/env/project drift, duplicates and fabricated IDs', () => {
  for (const mutate of [
    (d) => { d.baseline = 'a'.repeat(40); },
    (d) => { d.specifications[0].path = 'packages/react/src/Unknown.test.tsx'; },
    (d) => { d.specifications[0].blob = 'a'.repeat(40); },
    (d) => { d.files[0].blob = 'b'.repeat(40); },
    (d) => { d.files[0].blob = 'invalid'; },
    (d) => { d.specifications[0].environment = 'invented'; },
    (d) => { delete d.specifications[0].environment; },
    (d) => { delete d.files[0].environment; },
    (d) => { d.specifications[0].project = 'wrong'; },
    (d) => { d.specifications.push(d.specifications[0]); },
    (d) => { d.files.push(d.files[0]); },
    (d) => { d.files[0].tasks[0].tasks[0].id = 'invented'; },
    (d) => { d.collectedCases = 1000; },
    (d) => { d.files[0].tasks[0].each = undefined; },
    (d) => { d.files[0].tasks[0].tasks[0].mode = 'only'; },
    (d) => { d.files[0].tasks[0].tasks[0].tasks = []; },
    (d) => { d.files[0].tasks[0].tasks[0].result = { state: 'pass' }; },
  ]) {
    const invalid = document(); mutate(invalid);
    assert.throws(() => ingestCollections(manifest, [invalid]));
  }
  assert.throws(() => ingestCollections(manifest, [document(), document()]), /Duplicate collection/);
  const second = document(); second.command.push('different-command');
  assert.throws(() => ingestCollections(manifest, [document(), second]), /Duplicate collection specification/);
});

test('omitted/empty/error collection, type specs, helpers and unknown projects stay fail-closed', () => {
  for (const mutate of [
    (d) => { d.files = []; },
    (d) => { d.files[0].tasks = []; },
    (d) => { d.files[0].errors = ['import failed']; },
    (d) => { d.errors = ['unhandled collection error']; },
  ]) {
    const invalid = document(); mutate(invalid);
    const collected = ingestCollections(manifest, [invalid]);
    assert.equal(collected.cases.length, 0);
    assert.equal(collected.complete, false);
    assert.ok(collected.blocked.length);
  }
  const special = { ...manifest, sources: [...manifest.sources,
    { ...source, path: 'packages/react/src/Foo.spec.tsx', tests: analyzeTests('packages/react/src/Foo.spec.tsx', 'const foo = 1;') },
    { ...source, path: 'test/helpers/conformance.ts', tests: { ...source.tests, kind: 'conformance-helper' } },
    { ...source, path: 'elsewhere/Unknown.test.ts', tests: source.tests }] };
  const result = ingestCollections(special, environments.map(document));
  assert.equal(result.complete, false);
  assert.equal(result.typeSpecPaths.length, 1);
  assert.equal(result.blocked.length, 2);
  assert.equal(requirements(special).files.length, 4);
});

test('only validated compiler IDs can be ledger-mapped; static status does not become runtime evidence', () => {
  const runtime = ingestCollections(manifest, [document()]);
  const run = runtime.cases.find((c) => c.mode === 'run');
  assert.equal(report(runtime, [ledger(run)]).runtimeCoverage.passingCases, 1);
  assert.equal(report(runtime, [ledger(source.tests.declarations[0])]).runtimeCoverage.passingCases, 0);
  assert.throws(() => report(null, [ledger(run)]), /Unknown\/mismatched case/);
  assert.throws(() => report(runtime, [ledger({ ...run, kind: 'type-scenario' })]), /Unknown\/mismatched case/);
  assert.throws(() => report(runtime, [ledger({ ...run, id: 'fabricated' })]), /Unknown\/mismatched case/);
  assert.throws(() => report(structuredClone(runtime)), /validated task-tree ingestion/);
  const changed = ingestCollections(manifest, [document()]); changed.cases[0].id = 'fabricated';
  assert.throws(() => report(changed), /validated task-tree ingestion/);
  assert.throws(() => report(runtime, [ledger(run, 'upstream-skipped')]), /Unproven upstream skip/);
  const skipped = runtime.cases.find((c) => c.mode === 'skip');
  assert.throws(() => report(runtime, [ledger(skipped)]), /Skipped\/todo runtime case cannot pass/);
  assert.equal(report(runtime, [ledger(skipped, 'upstream-skipped')]).runtimeCoverage.passingCases, 0);
});

test('schema remains strict across integer bounds, unknown keywords, missing evidence and fabricated percentages', () => {
  assert.throws(() => validateSchema(1, { anyOf: [{ type: 'number' }, { unsupported: true }] }), /Unsupported schema keyword/);
  for (const [value, s] of [[-1, { type: 'integer', minimum: 0 }], [0.5, { type: 'integer' }], [NaN, { type: 'number' }]]) assert.throws(() => validateSchema(value, s));
  const runtime = report(ingestCollections(manifest, [document()])).runtimeCoverage;
  for (const mutate of [(r) => { r.totalCases = 1; }, (r) => { r.collectionDigests = []; }, (r) => { r.complete = true; }, (r) => { r.percentage = 100; }, (r) => { r.extra = true; }]) {
    const invalid = structuredClone(runtime); mutate(invalid);
    assert.throws(() => validateSchema(invalid, { $ref: '#/$defs/collectedCoverage' }, runtimeSchema));
  }
});

test('browser accounting compares source cases to exact actual records, never file counts or representative titles', () => {
  const partial = sourceMatrix(manifest, [document()]);
  assert.equal(partial.sourceFileEnvironmentObligations, 3);
  assert.equal(partial.totalCases, null);
  assert.equal(partial.collectedCases, 0);
  assert.equal(partial.passingCases, 0);
  const documents = environments.map(document);
  const chrome = ingestCollections(manifest, documents).cases.find((c) => c.environment === 'chromium' && c.mode === 'run');
  const record = { id: chrome.id, baseline: BASELINE, sourcePath: path, sourceBlob: blob, environment: 'chromium',
    react: 'passed', solid: 'passed', differences: 0, diagnostics: [], inputsChanged: false, evidence: 'retained-case.json' };
  const result = sourceMatrix(manifest, documents, [record]);
  assert.equal(result.collectedCases, 27);
  assert.equal(result.totalCases, 27);
  assert.equal(result.passingCases, 1);
  assert.equal(result.complete, false);
  assert.equal(sourceMatrix(manifest, documents, [{ ...record, react: 'absent' }]).passingCases, 0);
  assert.equal(sourceMatrix(manifest, documents, [{ ...record, inputsChanged: true }]).passingCases, 0);
  for (const changed of [{ ...record, id: 'value 1' }, { ...record, sourceBlob: 'a'.repeat(40) }, { ...record, environment: 'webkit' }]) assert.throws(() => sourceMatrix(manifest, documents, [changed]), /Unknown\/drifted/);
  assert.throws(() => sourceMatrix(manifest, documents, [record, record]), /Duplicate browser/);
  assert.throws(() => sourceMatrix(manifest, documents, [{ source: path, cases: ['value 1'], passed: true }]));
});

test('collection adapter uses discovery + collectTests only and retains skipped registration; no start/run API', async () => {
  let closed = false, collected = false;
  const project = { name: '@base-ui/react', config: { environment: 'jsdom', browser: { enabled: false } } };
  const module = { moduleId: `/isolated/${path}`, project, task: { mode: 'run', tasks }, errors: () => [], children: { allSuites: () => [] } };
  const create = async (config) => {
    assert.equal(config.watch, false);
    assert.equal(config.includeTaskLocation, true);
    return { getRelevantTestSpecifications: async () => [{ moduleId: module.moduleId, project }],
      collectTests: async () => { collected = true; return { testModules: [module], unhandledErrors: [] }; },
      close: async () => { closed = true; }, start: () => assert.fail('must not execute'), runTestSpecifications: () => assert.fail('must not execute') };
  };
  const output = await collectWithVitest({ checkout: '/isolated', baseline: BASELINE, projects: ['@base-ui/react'], environment: 'jsdom', paths: [path], sources: [{ path, blob }], vitestVersion: '5.0.0-beta.4', command: ['rtk', 'proxy', 'node'] }, create);
  assert.equal(collected, true); assert.equal(closed, true);
  assert.equal(output.toolchain.node, process.version);
  // The adapter mock runs on the workspace's host Node; the collection fixture
  // explicitly models isolated Node24 without weakening real ingestion checks.
  assert.equal(ingestCollections(manifest, [{ ...output, toolchain: { ...output.toolchain, node: 'v24.21.0' } }]).cases.length, 9);
  assert.throws(() => retainTask({ ...task('executed'), result: { state: 'pass' } }), /Executed test result/);
});

test('browser identity comes from the real instance and parent, not relabeled jsdom tasks', async () => {
  const project = { name: '@base-ui/react (webkit)', _parent: { name: '@base-ui/react' },
    config: { environment: 'jsdom', browser: { enabled: true, name: 'webkit' } } };
  assert.deepEqual(projectIdentity(project), { project: '@base-ui/react', runnerProject: project.name, environment: 'webkit' });
  assert.throws(() => projectIdentity({ ...project, _parent: null }), /parent identity/);
  assert.throws(() => ingestCollections(manifest, [{ ...document('webkit'), specifications: [{ ...document('webkit').specifications[0], runnerProject: '@base-ui/react (chromium)' }] }]), /runner project/);
  let calls = 0;
  const output = await collectWithVitest({ checkout: '/isolated', baseline: BASELINE, projects: ['@base-ui/react'], environment: 'webkit', paths: [path], sources: [{ path, blob }], vitestVersion: '5.0.2', command: ['rtk', 'proxy', 'node'] }, async () => ({
    getRelevantTestSpecifications: async () => [{ moduleId: `/isolated/${path}`, project }],
    collectTests: async () => { calls++; return { testModules: [{ moduleId: `/isolated/${path}`, project, task: { mode: 'run', tasks: [task('webkit-only genuine registration')] }, errors: () => [], children: { allSuites: () => [] } }], unhandledErrors: [] }; }, close: async () => {} }));
  assert.equal(calls, 1);
  assert.equal(output.files[0].tasks.length, 1);
  assert.equal(output.files[0].tasks[0].name, 'webkit-only genuine registration');
  assert.equal(output.files[0].environment, 'webkit');
});

test('helper provenance needs an actual imported module AND a matching collected conformance callsite', () => {
  const helperPath = 'packages/react/test/popupConformanceTests.tsx';
  const helper = { ...source, path: helperPath, blob: 'a'.repeat(40), tests: { ...source.tests, kind: 'conformance-helper', suiteTitles: ['Popup conformance'] }, transitiveConsumers: [path] };
  const consumer = { ...source, tests: { ...source.tests, unresolved: [{ id: `${path}#conformance:1`, kind: 'unresolved-dynamic', expression: 'popupConformanceTests', line: 2, column: 3 }] } };
  const m = { ...manifest, sources: [consumer, helper] };
  const doc = document();
  doc.files[0].helperModules = [{ path: helperPath, blob: helper.blob }];
  doc.files[0].tasks = [{ type: 'suite', name: 'Popup conformance', mode: 'run', each: false, location: { line: 2, column: 3 }, tasks: [task('generated')] }];
  const provenance = ingestCollections(m, [doc]);
  assert.equal(provenance.helperProvenance.length, 1);
  assert.equal(provenance.helperProvenance[0].cases.length, 1);
  assert.equal(provenance.cases[0].helperOrigins[0].blob, helper.blob);
  const importOnly = structuredClone(doc); delete importOnly.files[0].tasks[0].location;
  assert.equal(ingestCollections(m, [importOnly]).helperProvenance.length, 0);
  const unknown = structuredClone(doc); unknown.files[0].helperModules[0].blob = 'b'.repeat(40);
  assert.throws(() => ingestCollections(m, [unknown]), /helper module/);
  const module = { file: `/isolated/${helperPath}`, transformResult: {}, importedModules: new Set() };
  const root = { importedModules: new Set([module]) };
  assert.deepEqual(helperImports({ vite: { environments: { client: { moduleGraph: { getModuleById: () => root } } } } }, `/isolated/${path}`, { checkout: '/isolated', helpers: [{ path: helperPath, blob: helper.blob }] }), [{ path: helperPath, blob: helper.blob }]);
});

test('compiler collection derives checked statements and rejects fake IDs, stale ranges/configs and duplicates', () => {
  const typePath = 'packages/react/src/Foo.spec.tsx', text = '// @ts-expect-error\nunknown();\nconst value: number = 1;';
  const typeBlob = createHash('sha1').update(`blob ${Buffer.byteLength(text)}\0${text}`).digest('hex');
  const configPath = 'packages/react/tsconfig.test.json', configBlob = 'c'.repeat(40);
  const typeSource = { ...source, path: typePath, blob: typeBlob, tests: analyzeTests(typePath, text) };
  const m = { ...manifest, sources: [...manifest.sources, typeSource, { path: configPath, blob: configBlob }] };
  const sf = ts.createSourceFile(typePath, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const compiler = { ...ts, version: '6.0.2', sys: { readFile: () => '{}' },
    getParsedCommandLineOfConfigFile: (path, options, host) => { host.readFile(path); return { options: {}, errors: [], fileNames: [`/isolated/${typePath}`] }; },
    createProgram: ({ options }) => {
      assert.equal(options.noEmit, true);
      return { getTypeChecker: () => ({ getTypeAtLocation: () => ({}), typeToString: () => 'number' }), getSourceFile: () => sf,
        getOptionsDiagnostics: () => [], getGlobalDiagnostics: () => [], getSyntacticDiagnostics: () => [], getSemanticDiagnostics: () => [],
        emit: () => assert.fail('compiler must never emit') };
    } };
  const output = collectCompiler({ checkout: '/isolated', baseline: BASELINE, paths: [typePath], sources: m.sources, command: ['rtk', 'proxy', 'node'] }, compiler);
  output.toolchain.node = 'v24.21.0';
  const collected = ingestCollections(m, [output]);
  assert.equal(collected.typeCases.length, 2);
  assert.equal(collected.typeCases[0].environment, 'typescript');
  assert.deepEqual(collected.typeCases[0].expectErrorLines, [1]);
  assert.equal(collected.cases.length, 0);
  assert.equal(collected.typeSpecPaths.length, 0);
  for (const mutate of [
    (d) => { d.files[0].scenarios[0].start++; },
    (d) => { d.files[0].scenarios.pop(); },
    (d) => { d.files[0].scenarios[0].id = 'fabricated'; },
    (d) => { d.files[0].expectErrorLines = []; },
    (d) => { d.configurations[0].blob = 'd'.repeat(40); },
    (d) => { d.files.push(d.files[0]); },
  ]) { const invalid = structuredClone(output); mutate(invalid); assert.throws(() => ingestCollections(m, [invalid])); }
  const bad = structuredClone(output); bad.files[0].diagnostics.push('TS1234 source diagnostic');
  assert.ok(ingestCollections(m, [bad]).blocked.some((b) => b.includes('TS1234')));
  const compilerLedger = ledger(collected.typeCases[0]); compilerLedger.ledger.cases[0].sourcePath = typePath; compilerLedger.ledger.cases[0].sourceBlob = typeBlob;
  const report = aggregate(m, [compilerLedger], [owner], schema, () => true, collected);
  assert.equal(report.caseStatuses.passing, 1);
  assert.equal(report.runtimeCoverage.passingCases, 0);
  const failedCollection = ingestCollections(m, [bad]);
  const failedLedger = structuredClone(compilerLedger); failedLedger.ledger.cases[0].id = failedCollection.typeCases[0].id;
  assert.throws(() => aggregate(m, [failedLedger], [owner], schema, () => true, failedCollection), /Compiler-diagnostic type scenario/);
});

test('Playwright list registration retains source skip and never accepts executed results or other engines', () => {
  const p = 'test/screen-reader/example.spec.ts';
  const m = { ...manifest, sources: [{ ...source, path: p, tests: analyzeTests(p, "test('reader', () => {});") }] };
  const raw = { suites: [{ title: 'example.spec.ts', file: 'example.spec.ts', specs: [{ file: 'example.spec.ts', title: 'reader', line: 1, column: 1,
    tests: [{ projectName: 'chromium', expectedStatus: 'skipped', results: [] }] }] }], errors: [] };
  const request = { sources: m.sources, baseline: BASELINE, playwrightVersion: '1.63.0', command: ['rtk', 'proxy', 'node'] };
  const collected = retainPlaywright(raw, request); collected.toolchain.node = 'v24.21.0';
  const result = ingestCollections(m, [collected]);
  assert.equal(result.cases.length, 1); assert.equal(result.cases[0].mode, 'skip');
  assert.equal(result.missing.length, 0);
  const executed = structuredClone(raw); executed.suites[0].specs[0].tests[0].results.push({ status: 'passed' });
  assert.throws(() => retainPlaywright(executed, request), /executed Playwright/);
  const batch = { schemaVersion: 1, baseline: BASELINE, method: 'collection-batch', documents: [collected] };
  assert.deepEqual(ingestCollections(m, [batch]), result);
  assert.throws(() => ingestCollections(m, [batch, batch]), /Duplicate collection/);
});

test('independent browser failures retain environment-qualified blockers without relaxing uniqueItems', () => {
  const failures = ['chromium', 'firefox', 'webkit'].map((env) => ({ ...document(env),
    command: ['rtk', 'proxy', 'env', `VITEST_ENV=${env}`, 'node'], specifications: [], files: [], errors: ['Collector produced no task tree: exit=1'] }));
  const result = ingestCollections(manifest, [document(), ...failures]);
  assert.equal(result.cases.length, 9);
  assert.equal(result.missing.length, 3);
  assert.equal(result.blocked.length, 3);
  for (const env of ['chromium', 'firefox', 'webkit']) assert.ok(result.blocked.some((b) => b.includes(`VITEST_ENV=${env}`)));
  validateSchema(result, { $ref: '#/$defs/runtimeCollection' }, runtimeSchema);
  assert.throws(() => assertQualified(report(result)), /Qualification blocked/);
});
