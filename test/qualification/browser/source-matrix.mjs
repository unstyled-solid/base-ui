import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ingestCollections, requirements, fileKey, assertValidatedCollection, runtimeSchema } from '../../../scripts/tracking/runtime.mjs';
import { BASELINE } from '../../../scripts/tracking/git.mjs';
import { validateSchema } from '../../../scripts/tracking/validate.mjs';

const recordSchema = {
  type: 'object', additionalProperties: false,
  required: ['id', 'baseline', 'sourcePath', 'sourceBlob', 'environment', 'react', 'solid', 'differences', 'diagnostics', 'inputsChanged', 'evidence'],
  properties: {
    id: { type: 'string', minLength: 1 }, baseline: { type: 'string', pattern: '^[a-f0-9]{40}$' },
    sourcePath: { type: 'string', minLength: 1 }, sourceBlob: { type: 'string', pattern: '^[a-f0-9]{40}$' },
    environment: { enum: ['chromium', 'firefox', 'webkit'] },
    react: { enum: ['passed', 'failed', 'absent'] }, solid: { enum: ['passed', 'failed', 'absent'] },
    differences: { type: 'integer', minimum: 0 }, diagnostics: { type: 'array', items: { type: 'string' } },
    inputsChanged: { type: 'boolean' }, evidence: { type: 'string', minLength: 1, pattern: '\\S' },
  },
};

// Only exact case/environment/blob records are accounting evidence. A runner's
// representative source-file/title strings are useful research, not case identities.
export function sourceMatrix(manifest, documents = [], records = []) {
  const collection = ingestCollections(manifest, documents);
  assertValidatedCollection(manifest, collection);
  const expected = requirements(manifest);
  const browserEnvs = new Set(['chromium', 'firefox', 'webkit']);
  const cases = collection.cases.filter((c) => browserEnvs.has(c.environment));
  const byId = new Map(cases.map((c) => [c.id, c]));
  const received = new Map();
  for (const record of records) {
    validateSchema(record, recordSchema);
    const obligation = byId.get(record.id);
    if (record.baseline !== manifest.baseline || !obligation || record.sourcePath !== obligation.sourcePath
      || record.sourceBlob !== obligation.sourceBlob || record.environment !== obligation.environment) throw new Error(`Unknown/drifted browser case record ${record.id}`);
    if (received.has(record.id)) throw new Error(`Duplicate browser case record ${record.id}`);
    if (obligation.mode !== 'run') throw new Error(`Skipped/todo source registration requires separate reviewed disposition ${record.id}`);
    received.set(record.id, record);
  }
  const passed = (r) => r && r.react === 'passed' && r.solid === 'passed' && r.differences === 0 && r.diagnostics.length === 0 && !r.inputsChanged;
  const collectedFiles = new Map(collection.files.map((f) => [fileKey(f), f]));
  const obligations = expected.files.filter((f) => browserEnvs.has(f.environment)).map((f) => {
    const collected = collectedFiles.get(fileKey(f));
    const sourceCases = cases.filter((c) => c.sourcePath === f.path && c.environment === f.environment && c.project === f.project);
    return { ...f, collectedCaseCount: collected?.caseCount ?? null,
      passingCases: sourceCases.filter((c) => passed(received.get(c.id))).length,
      missingCaseRecords: sourceCases.filter((c) => !received.has(c.id)).map((c) => c.id),
      skippedOrTodo: sourceCases.filter((c) => c.mode !== 'run').map((c) => c.id) };
  });
  const missing = obligations.filter((o) => o.collectedCaseCount === null);
  const unaccounted = cases.filter((c) => !received.has(c.id)).map((c) => c.id);
  const failed = records.filter((r) => !passed(r)).map((r) => r.id);
  const complete = missing.length === 0 && collection.blocked.length === 0 && cases.length > 0
    && unaccounted.length === 0 && failed.length === 0;
  return { baseline: manifest.baseline, collectionDigests: collection.digests,
    sourceFileEnvironmentObligations: obligations.length,
    collectedCases: cases.length, totalCases: missing.length || collection.blocked.length ? null : cases.length,
    passingCases: records.filter(passed).length, missingFileEnvironments: missing,
    collectionBlockers: collection.blocked, typeSpecPaths: collection.typeSpecPaths,
    obligations, unaccounted, failed, complete };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2), paths = { '--manifest': [], '--collection': [], '--records': [] };
    for (let i = 0; i < args.length; i += 2) {
      if (!Object.hasOwn(paths, args[i]) || !args[i + 1]) throw new Error('Usage: source-matrix.mjs --manifest <source-manifest> [--collection <retained-json>] [--records <case-record-array>]');
      paths[args[i]].push(args[i + 1]);
    }
    if (paths['--manifest'].length !== 1) throw new Error('One pinned source manifest required');
    const read = (path) => JSON.parse(readFileSync(resolve(path), 'utf8'));
    const manifest = read(paths['--manifest'][0]);
    validateSchema(manifest, { $ref: '#/$defs/sourceManifest' }, runtimeSchema);
    if (manifest.baseline !== BASELINE) throw new Error('Browser matrix requires the pinned source baseline');
    const result = sourceMatrix(manifest, paths['--collection'].map(read), paths['--records'].flatMap(read));
    console.log(JSON.stringify(result, null, 2));
    process.exitCode = result.complete ? 0 : 1;
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
