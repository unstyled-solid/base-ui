import { relativePath, matches } from './ownership.mjs';
import { assertValidatedCollection } from './runtime.mjs';

// Deliberately limited to the vocabulary used by ledger.schema.json. Unknown keywords
// fail rather than silently weakening validation when the schema evolves.
const supported = new Set(['$schema', '$id', '$defs', '$ref', 'title', 'description', 'type', 'const', 'enum', 'pattern', 'minLength', 'required', 'properties', 'additionalProperties', 'items', 'uniqueItems', 'anyOf', 'not', 'minimum', 'maximum', 'minItems']);
function checkVocabulary(schema) {
  for (const key of Object.keys(schema)) if (!supported.has(key)) throw new Error(`Unsupported schema keyword ${key}`);
  for (const child of [...Object.values(schema.$defs ?? {}), ...Object.values(schema.properties ?? {}), ...(schema.anyOf ?? []),
    ...[schema.items, schema.not].filter(Boolean)]) checkVocabulary(child);
}
export function validateSchema(value, schema, root = schema, path = '$', checked = false) {
  if (!checked) { checkVocabulary(root); if (schema !== root) checkVocabulary(schema); }
  for (const key of Object.keys(schema)) if (!supported.has(key)) throw new Error(`Unsupported schema keyword ${key}`);
  const fail = (message) => { throw new Error(`${path}: ${message}`); };
  if (schema.$ref) {
    if (!schema.$ref.startsWith('#/')) fail('External schema reference is not supported');
    const resolved = schema.$ref.slice(2).split('/').reduce((s, key) => s?.[key], root);
    if (!resolved) fail(`Unknown schema reference ${schema.$ref}`);
    return validateSchema(value, resolved, root, path, true);
  }
  const type = Array.isArray(value) ? 'array' : value === null ? 'null' : typeof value;
  if (schema.type && !(Array.isArray(schema.type) ? schema.type : [schema.type]).some((t) => t === type || t === 'integer' && Number.isSafeInteger(value))) fail(`Expected ${schema.type}`);
  if ('const' in schema && JSON.stringify(value) !== JSON.stringify(schema.const)) fail(`Expected ${JSON.stringify(schema.const)}`);
  if (schema.enum && !schema.enum.includes(value)) fail(`Expected one of ${schema.enum.join(', ')}`);
  if (schema.pattern && !new RegExp(schema.pattern).test(value)) fail('Pattern mismatch');
  if (schema.minLength && value.length < schema.minLength) fail('Empty string');
  if (typeof value === 'number' && (!Number.isFinite(value) || 'minimum' in schema && value < schema.minimum || 'maximum' in schema && value > schema.maximum)) fail('Number outside schema bounds');
  if (schema.anyOf && !schema.anyOf.some((branch) => {
    try { validateSchema(value, branch, root, path, true); return true; } catch { return false; }
  })) fail('No anyOf branch matched (expected evidence-qualified shape)');
  if (schema.not) {
    let matches = false;
    try { validateSchema(value, schema.not, root, path, true); matches = true; } catch { /* rejected shape */ }
    if (matches) fail('Forbidden schema shape');
  }
  if (type === 'object') {
    for (const key of schema.required ?? []) if (!(key in value)) fail(`Missing ${key}`);
    for (const [key, child] of Object.entries(value)) {
      if (schema.properties?.[key]) validateSchema(child, schema.properties[key], root, `${path}.${key}`, true);
      else if (schema.additionalProperties === false) fail(`Unknown property ${key}`);
    }
  }
  if (type === 'array') {
    if ('minItems' in schema && value.length < schema.minItems) fail('Too few array items');
    if (schema.uniqueItems && new Set(value.map((v) => JSON.stringify(v))).size !== value.length) fail('Duplicate array item');
    if (schema.items) value.forEach((child, i) => validateSchema(child, schema.items, root, `${path}[${i}]`, true));
  }
}

export function aggregate(sourceManifest, ledgers, owners, schema, exists = (_path) => true, runtime = null) {
  if (runtime) assertValidatedCollection(sourceManifest, runtime);
  const sources = new Map(sourceManifest.sources.map((e) => [e.path, e]));
  const obligations = new Map();
  for (const source of sources.values()) {
    for (const item of [...(source.tests?.declarations ?? []), ...(source.tests?.unresolved ?? [])]) {
      obligations.set(item.id, { ...item, source });
    }
  }
  for (const item of [...(runtime?.cases ?? []), ...(runtime?.typeCases ?? [])]) {
    if (obligations.has(item.id)) throw new Error(`Duplicate runtime identity ${item.id}`);
    obligations.set(item.id, { ...item, source: sources.get(item.sourcePath) });
  }
  const claimed = new Map();
  const sourceClaims = new Set();
  const statuses = Object.fromEntries(['pending', 'pending-browser', 'blocked', 'passing', 'adapted', 'upstream-skipped'].map((s) => [s, 0]));
  const validTarget = (target, owner, requireExists = false) => {
    if (!relativePath(target) || target.startsWith('upstream/') || target.startsWith('ref/')) throw new Error(`Unsafe target ${target}`);
    if (!owner.owns.some((glob) => matches(target, glob))) throw new Error(`Target outside ${owner.id} ownership: ${target}`);
    if (requireExists && !exists(target)) throw new Error(`Missing passing target ${target}`);
  };
  const validSource = (path, blob, owner) => {
    const source = sources.get(path);
    if (!source || source.blob !== blob) throw new Error(`Unknown or drifted source ${path}`);
    if (source.owner !== owner.id && !source.provenance.candidates?.includes(owner.id)) throw new Error(`Source outside ${owner.id} ownership: ${path}`);
    return source;
  };
  for (const { path, ledger } of ledgers) {
    validateSchema(ledger, schema);
    if (ledger.baseline !== sourceManifest.baseline) throw new Error(`Wrong ledger baseline ${path}`);
    const owner = owners.find((o) => o.id === ledger.owner);
    if (!owner || !owner.owns.some((glob) => matches(path, glob))) throw new Error(`Ledger outside owner allowlist ${path}`);
    for (const record of ledger.sources) {
      validSource(record.path, record.blob, owner);
      if (sourceClaims.has(record.path)) throw new Error(`Duplicate source mapping ${record.path}`);
      sourceClaims.add(record.path);
      if (['translated', 'pure-adapted'].includes(record.disposition) && !record.targets.length) throw new Error(`Missing mapping targets ${record.path}`);
      record.targets.forEach((target) => validTarget(target, owner));
    }
    for (const record of ledger.cases) {
      validSource(record.sourcePath, record.sourceBlob, owner);
      const obligation = obligations.get(record.id);
      if (!obligation || obligation.source.path !== record.sourcePath || obligation.kind !== record.kind) throw new Error(`Unknown/mismatched case ${record.id}`);
      if (claimed.has(record.id)) throw new Error(`Duplicate case ownership ${record.id}`);
      const complete = ['passing', 'adapted'].includes(record.status);
      if (record.kind === 'unresolved-dynamic' && !['pending', 'pending-browser', 'blocked'].includes(record.status)) throw new Error(`Unresolved dynamic case cannot be complete: ${record.id}`);
      if (complete && (!record.targets.length || !record.evidence.length)) throw new Error(`Missing case evidence/target ${record.id}`);
      if (record.status === 'blocked' && !record.blockers.length) throw new Error(`Missing blocker ${record.id}`);
      if (record.status === 'upstream-skipped' && (!record.evidence.length ||
         !(obligation.kind === 'runtime-case' ? ['skip', 'todo'].includes(obligation.mode)
           : obligation.flags?.some((f) => ['skip', 'todo', 'skipIf', 'runIf'].includes(f)) || obligation.runtimeSkip))) throw new Error(`Unproven upstream skip ${record.id}`);
      if (complete && obligation.kind === 'runtime-case' && obligation.mode !== 'run') throw new Error(`Skipped/todo runtime case cannot pass: ${record.id}`);
      if (complete && obligation.kind === 'type-scenario' && obligation.compilerDiagnostics.length) throw new Error(`Compiler-diagnostic type scenario cannot pass: ${record.id}`);
      for (const blocker of record.blockers) if (!owners.some((o) => o.id === blocker)) throw new Error(`Unknown blocker ${blocker}`);
      record.targets.forEach((target) => validTarget(target, owner, complete));
      claimed.set(record.id, record);
      statuses[record.status]++;
    }
  }
  const unresolved = [...obligations.values()].filter((o) => o.kind === 'unresolved-dynamic').map((o) => o.id);
  const collectedCases = runtime?.cases.length ?? 0;
  const passingCases = [...claimed.values()].filter((c) => c.kind === 'runtime-case' && ['passing', 'adapted'].includes(c.status)).length;
  const runtimeCoverage = runtime?.digests.length ? {
    collectedCases, totalCases: runtime.complete ? collectedCases : null, passingCases,
    percentage: runtime.complete ? passingCases / collectedCases * 100 : null, complete: runtime.complete,
    blocker: 'bsolid-inventory-runtime', reason: 'Runtime task-tree evidence only; missing environments, helper provenance and compiler type scenarios remain blockers. Collection is not passing parity.',
    collectionDigests: runtime.digests, missingFileEnvironments: runtime.missing.length,
    typeSpecFiles: runtime.typeSpecPaths.length, collectionBlockers: runtime.blocked,
    collectedTypeScenarios: runtime.typeCases.length,
  } : { collectedCases: 0, totalCases: null, passingCases: 0, percentage: null, complete: false,
    blocker: 'bsolid-inventory-runtime', reason: 'No validated pinned runtime collection input; static declarations and files are not runtime case counts.' };
  return { schemaVersion: 1, baseline: sourceManifest.baseline,
    integrity: 'valid', parity: 'unverified',
    totals: { trackedInputs: sources.size, testFiles: [...sources.values()].filter((s) => s.tests?.kind === 'test-file').length,
      typeSpecFiles: [...sources.values()].filter((s) => s.tests?.kind === 'type-spec').length,
      staticDeclarations: [...obligations.values()].filter((o) => o.kind === 'static-declaration').length,
      unresolvedObligations: unresolved.length, mappedSources: sourceClaims.size, mappedCaseObligations: claimed.size },
    caseStatuses: statuses,
    runtimeCoverage,
    unresolved, unmapped: [...obligations.keys()].filter((id) => !claimed.has(id)),
  };
}
