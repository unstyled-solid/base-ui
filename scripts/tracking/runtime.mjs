import { readFileSync } from 'node:fs';
import { digest } from './inventory.mjs';
import { validateSchema } from './validate.mjs';

export const runtimeSchema = JSON.parse(readFileSync(new URL('../../tracking/schema/inventory.schema.json', import.meta.url), 'utf8'));
export const environments = ['jsdom', 'chromium', 'firefox', 'webkit'];
const order = (a, b) => a < b ? -1 : a > b ? 1 : 0;
export const fileKey = (file) => `${file.path}#${file.environment}#${file.project}`;
const validated = new WeakMap();
const sourcePin = (manifest) => digest({ baseline: manifest.baseline, sources: manifest.sources.map(({ path, blob, tests, transitiveConsumers }) => ({ path, blob, tests, transitiveConsumers })) });

export function assertValidatedCollection(manifest, collection) {
  const proof = validated.get(collection);
  if (!proof || proof.source !== sourcePin(manifest) || proof.content !== digest(collection)) throw new Error('Runtime collection must come from unmodified validated task-tree ingestion');
}

// These are obligations from the pinned configs, not inferred case cardinalities.
// Unknown projects/roots remain explicit blockers until their configs are reviewed.
export function requirements(sourceManifest) {
  const files = [], blocked = [], types = [];
  for (const source of sourceManifest.sources) {
    if (!source.tests) continue;
    if (source.tests.kind === 'type-spec') { types.push(source.path); continue; }
    if (source.tests.kind === 'conformance-helper') {
      blocked.push(`${source.path}: helper registration provenance requires a reviewed consumer mapping`);
      continue;
    }
    const pkg = source.path.match(/^packages\/(react|utils)\//)?.[1];
    const project = pkg ? `@base-ui/${pkg}` : source.path.startsWith('docs/') ? 'docs'
      : source.path.startsWith('test/e2e/') ? 'e2e' : source.path.startsWith('test/regressions/') ? 'regressions'
        : source.path.startsWith('test/screen-reader/') ? 'screen-reader' : null;
    if (!project) { blocked.push(`${source.path}: no reviewed Vitest project/environment contract`); continue; }
    for (const environment of pkg ? environments : project === 'screen-reader' ? ['chromium'] : ['node']) files.push({ path: source.path, blob: source.blob, environment, project });
  }
  return { files: files.sort((a, b) => order(fileKey(a), fileKey(b))), blocked: blocked.sort(), types: types.sort() };
}

function expand(file, source, sources) {
  const cases = [];
  const roots = { describeConformance: 'packages/react/test/describeConformance.tsx',
    popupConformanceTests: 'packages/react/test/popupConformanceTests.tsx',
    describeGregorianAdapter: 'packages/react/test/describeGregorianAdapter/describeGregorianAdapter.ts' };
  const loaded = new Set((file.helperModules ?? []).map((h) => h.path));
  function visit(tasks, suites = [], address = [], inherited = 'run', each = false, origin = null) {
    tasks.forEach((task, i) => {
      const position = [...address, i];
      if (task.mode === 'only') throw new Error(`Focused registration invalidates collection: ${file.path}`);
      const mode = inherited !== 'run' ? inherited : task.mode;
      const parameterized = each || task.each;
      const registration = task.location && source.tests.unresolved.find((u) => u.id.includes('#conformance:')
        && u.line === task.location.line && u.column === task.location.column && roots[u.expression]);
      const rootPath = registration && roots[registration.expression];
      const nextOrigin = rootPath && loaded.has(rootPath) ? { rootPath, registration: registration.id } : origin;
      if (task.type === 'suite') visit(task.tasks, [...suites, task.name], position, mode, parameterized, nextOrigin);
      else {
        const titles = [...suites, task.name];
        const location = task.location;
        const registrations = source.tests.declarations.filter((d) => location && d.line === location.line && d.column === location.column);
        // Expanded titles + each retain runner-visible parameter identity. Vitest does
        // not expose arbitrary argument values; never invent them by parsing titles.
        const identity = { blob: file.blob, environment: file.environment, project: file.project, position, titles };
        const helpers = nextOrigin ? [...sources.values()].filter((h) => loaded.has(h.path) && h.tests?.kind === 'conformance-helper'
          && (h.path === nextOrigin.rootPath || h.transitiveConsumers?.includes(nextOrigin.rootPath))) : [];
        const matches = helpers.filter((h) => h.tests.declarations.some((d) => d.title === task.name)
          || h.tests.suiteTitles?.some((title) => suites.includes(title)));
        const originPaths = nextOrigin ? [nextOrigin.rootPath, ...(matches.length === 1 ? [matches[0].path] : [])] : [];
        cases.push({ id: `${file.path}#runtime:${file.environment}:${digest(identity)}`,
          kind: 'runtime-case', sourcePath: file.path, sourceBlob: file.blob,
          environment: file.environment, project: file.project, position, titles, mode,
          parameterized, parameterValues: 'not-exposed-by-vitest',
          location: location ?? null,
          registrations: registrations.map((d) => d.id),
          // File-level obligations; NOT a claim that every task came from a helper.
          conformanceObligations: source.tests.unresolved.filter((u) => u.id.includes('#conformance:')).map((u) => u.id),
          helperOrigins: [...new Set(originPaths)].map((path) => ({ path, blob: sources.get(path).blob, registration: nextOrigin.registration })),
          runtimeSkipPossible: registrations.some((d) => d.runtimeSkip) || (!registrations.length && source.tests.declarations.some((d) => d.runtimeSkip))
            || matches.some((h) => h.tests.declarations.some((d) => d.runtimeSkip)),
        });
      }
    });
  }
  if (file.mode === 'only') throw new Error(`Focused file invalidates collection: ${file.path}`);
  visit(file.tasks, [], [], file.mode);
  return cases;
}

// Ingestion accepts runner trees, NEVER caller-supplied runtime IDs/counts/statuses.
// The exact tree is retained externally, digest-bound here and replayable deterministically.
export function ingestCollections(sourceManifest, documents = []) {
  documents = documents.flatMap((document) => {
    if (document.method !== 'collection-batch') return [document];
    validateSchema(document, { $ref: '#/$defs/collectionInput' }, runtimeSchema);
    if (document.baseline !== sourceManifest.baseline) throw new Error('Wrong collection batch baseline');
    return document.documents;
  });
  const required = requirements(sourceManifest);
  const expected = new Map(required.files.map((f) => [fileKey(f), f]));
  const sources = new Map(sourceManifest.sources.map((s) => [s.path, s]));
  const seen = new Set(), specified = new Set(), cases = [], files = [], errors = [], digests = [], typeCases = [], typeFiles = [];
  const collectedTypes = new Set();
  for (const document of documents) {
    validateSchema(document, { $ref: '#/$defs/collectionInput' }, runtimeSchema);
    if (document.baseline !== sourceManifest.baseline) throw new Error('Wrong collection baseline');
    if (!/^v24\./.test(document.toolchain.node) || Number(document.toolchain.node.split('.')[1]) < 15) throw new Error('Collection requires compatible isolated Node >=24.15');
    const hash = digest(document);
    if (digests.includes(hash)) throw new Error('Duplicate collection input');
    digests.push(hash);
    if (document.method === 'typescript-compiler-collect') {
      if (new Set(document.configurations.map((c) => c.path)).size !== document.configurations.length) throw new Error('Duplicate compiler config pin');
      for (const config of document.configurations) {
        if (sources.get(config.path)?.blob !== config.blob || !config.path.endsWith('.json')) throw new Error(`Unknown/drifted compiler config ${config.path}`);
      }
      for (const file of document.files) {
        const source = sources.get(file.path);
        if (!source || source.tests?.kind !== 'type-spec' || source.blob !== file.blob) throw new Error(`Unknown/drifted compiler fixture ${file.path}`);
        if (collectedTypes.has(file.path)) throw new Error(`Duplicate compiler fixture ${file.path}`);
        collectedTypes.add(file.path);
        const config = document.configurations.find((c) => c.path === file.configuration);
        if (!config || file.configuration !== `packages/${file.path.split('/')[1]}/tsconfig.test.json`) throw new Error(`Missing/wrong compiler fixture config ${file.path}`);
        const descriptors = file.scenarios.map(({ start, end, syntaxKind }) => ({ start, end, syntaxKind }));
        if (digest(descriptors) !== digest(source.tests.typeDeclarations ?? []) || !descriptors.length) throw new Error(`Stale/incomplete compiler scenarios ${file.path}`);
        if (digest(file.expectErrorLines) !== digest(source.tests.typeExpectErrorLines ?? [])) throw new Error(`Stale compiler expected-error directives ${file.path}`);
        for (const item of file.scenarios) typeCases.push({ id: `${file.path}#type:${digest({ blob: file.blob, configuration: config, ...item })}`,
          kind: 'type-scenario', sourcePath: file.path, sourceBlob: file.blob, environment: 'typescript', configuration: config.path,
          ...item, expectErrorLines: file.expectErrorLines, compilerDiagnostics: file.diagnostics });
        typeFiles.push({ path: file.path, blob: file.blob, scenarioCount: file.scenarios.length, inputDigest: hash });
        errors.push(...file.diagnostics.map((d) => `${file.path}: compiler ${d}`));
      }
      errors.push(...document.errors.map((e) => `compiler: ${e}`));
      continue;
    }
    if (document.method === 'vitest-runtime-collect' && !/^5\./.test(document.toolchain.vitest)) throw new Error('Collection adapter requires upstream Vitest 5');
    const scoped = new Set();
    for (const spec of document.specifications) {
      const key = fileKey(spec), requirement = expected.get(key);
      if (!requirement || requirement.blob !== spec.blob) throw new Error(`Unknown or drifted collection source/environment/project: ${key}`);
      if ((spec.project === 'screen-reader') !== (document.method === 'playwright-list')) throw new Error(`Wrong collection registration API: ${key}`);
      if (environments.slice(1).includes(spec.environment) && !spec.runnerProject) throw new Error(`Missing actual browser runner identity: ${key}`);
      if (spec.runnerProject && spec.runnerProject !== (document.method === 'playwright-list' ? 'chromium'
        : environments.slice(1).includes(spec.environment) ? `${spec.project} (${spec.environment})` : spec.project)) throw new Error(`Wrong runner project/environment: ${key}`);
      if (scoped.has(key) || specified.has(key)) throw new Error(`Duplicate collection specification: ${key}`);
      scoped.add(key);
      specified.add(key);
    }
    const received = new Set();
    for (const file of document.files) {
      const key = fileKey(file);
      if (!scoped.has(key) || received.has(key)) throw new Error(`Unknown/duplicate collected file: ${key}`);
      const requirement = expected.get(key);
      if (file.blob !== requirement.blob) throw new Error(`Bad collected blob: ${key}`);
      const spec = document.specifications.find((s) => fileKey(s) === key);
      if (file.runnerProject !== spec.runnerProject) throw new Error(`Runner identity drift: ${key}`);
      for (const helper of file.helperModules ?? []) {
        const source = sources.get(helper.path);
        if (!source || source.tests?.kind !== 'conformance-helper' || source.blob !== helper.blob
          || !source.transitiveConsumers?.includes(file.path)) throw new Error(`Unknown/drifted/unrelated helper module ${helper.path}`);
      }
      received.add(key);
      const fileErrors = file.errors;
      const expanded = expand(file, sources.get(file.path), sources);
      if (document.errors.length || fileErrors.length) {
        errors.push(`${key}: collection errors; registrations are not a validated denominator${fileErrors.length ? `: ${fileErrors[0].split('\n')[0]}` : ''}`);
        continue;
      }
      if (!expanded.length) { errors.push(`${key}: empty collection requires explicit review`); continue; }
      cases.push(...expanded);
      files.push({ ...requirement, inputDigest: hash, caseCount: expanded.length });
      seen.add(key);
    }
    for (const key of scoped) if (!received.has(key)) errors.push(`${key}: runner omitted specification`);
    const runnerLabel = document.command.find((part) => part.startsWith('VITEST_ENV=')) ?? document.method;
    errors.push(...document.errors.map((e) => `runner ${runnerLabel}: ${e}`));
  }
  const missing = required.files.filter((f) => !seen.has(fileKey(f)));
  const helperProvenance = [...sources.values()].filter((s) => s.tests?.kind === 'conformance-helper').map((source) => ({ path: source.path, blob: source.blob,
    cases: cases.filter((c) => c.helperOrigins.some((h) => h.path === source.path)).map((c) => c.id) })).filter((h) => h.cases.length);
  const provenHelpers = new Set(helperProvenance.map((h) => h.path));
  const blocked = [...new Set([...required.blocked.filter((b) => !provenHelpers.has(b.split(':')[0])), ...errors])].sort();
  const missingTypes = required.types.filter((p) => !collectedTypes.has(p));
  const result = { digests: digests.sort(), files: files.sort((a, b) => order(fileKey(a), fileKey(b))),
    cases: cases.sort((a, b) => order(a.id, b.id)), missing, blocked, typeSpecPaths: missingTypes,
    typeCases: typeCases.sort((a, b) => order(a.id, b.id)), typeFiles: typeFiles.sort((a, b) => order(a.path, b.path)), helperProvenance,
    complete: missing.length === 0 && blocked.length === 0 && missingTypes.length === 0 && cases.length > 0 };
  validateSchema(result, { $ref: '#/$defs/runtimeCollection' }, runtimeSchema);
  validated.set(result, { source: sourcePin(sourceManifest), content: digest(result) });
  return result;
}

export function assertQualified(report) {
  if (!report.runtimeCoverage.complete || report.runtimeCoverage.totalCases === null || !report.runtimeCoverage.collectedCases
    || report.unresolved.length || report.unmapped.length || report.caseStatuses.blocked || report.caseStatuses.pending
    || report.caseStatuses['pending-browser']) throw new Error('Qualification blocked: missing collection environments, unresolved/type obligations, unmapped or incomplete case evidence. See bsolid-inventory-runtime.');
}
