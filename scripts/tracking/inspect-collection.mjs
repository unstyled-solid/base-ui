// Read-only replay of retained evidence. Never starts a runner or generates central outputs.
import { readFileSync, writeFileSync, realpathSync } from 'node:fs';
import { resolve, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BASELINE, readTree } from './git.mjs';
import { buildInventory, stableJSON } from './inventory.mjs';
import { policy } from './policy.mjs';
import { ingestCollections, runtimeSchema } from './runtime.mjs';
import { aggregate, validateSchema } from './validate.mjs';

export function inspectCollection(manifest, inputs) {
  const runtime = ingestCollections(manifest, inputs);
  const documents = inputs.flatMap((d) => d.method === 'collection-batch' ? d.documents : [d]);
  return { baseline: manifest.baseline, collectionDigests: runtime.digests, collectedCases: runtime.cases.length,
    totalCases: runtime.complete ? runtime.cases.length : null, complete: runtime.complete,
    environments: Object.fromEntries(['jsdom', 'chromium', 'firefox', 'webkit', 'node'].map((env) => [env, {
      files: runtime.files.filter((f) => f.environment === env).length, cases: runtime.cases.filter((c) => c.environment === env).length,
      run: runtime.cases.filter((c) => c.environment === env && c.mode === 'run').length,
      skipped: runtime.cases.filter((c) => c.environment === env && c.mode === 'skip').length,
      todo: runtime.cases.filter((c) => c.environment === env && c.mode === 'todo').length }])),
    typeFiles: runtime.typeFiles.length, typeScenarios: runtime.typeCases.length,
    typeDiagnostics: documents.filter((d) => d.method === 'typescript-compiler-collect').flatMap((d) => d.files.flatMap((f) => f.diagnostics)),
    helperProvenance: runtime.helperProvenance, missingFileEnvironments: runtime.missing,
    missingTypeSpecs: runtime.typeSpecPaths, blockers: runtime.blocked };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
  const args = process.argv.slice(2), paths = [], options = new Map();
  for (let i = 0; i < args.length; i += 2) {
    if (!['--collection', '--output'].includes(args[i]) || !args[i + 1]) throw new Error('Usage: inspect-collection.mjs --collection <retained-json> [--output <new-temporary-summary>]');
    if (args[i] === '--collection') paths.push(args[i + 1]);
    else { if (options.has(args[i])) throw new Error('Duplicate output'); options.set(args[i], args[i + 1]); }
  }
  if (!paths.length) throw new Error('Retained collection required');
  const read = (path) => JSON.parse(readFileSync(resolve(root, path), 'utf8'));
  const owners = read('tracking/schema/owners.json').owners;
  const built = buildInventory(readTree(resolve(root, 'upstream/base-ui')), owners, policy, BASELINE);
  const documents = paths.map(read), runtime = ingestCollections(built.sourceManifest, documents);
  const report = aggregate(built.sourceManifest, [], owners, read('tracking/schema/ledger.schema.json'), () => true, runtime);
  validateSchema({ ...built, sourceManifest: { ...built.sourceManifest, runtimeCollection: runtime }, report }, runtimeSchema);
  const summary = { ...inspectCollection(built.sourceManifest, documents), staticUnresolved: report.unresolved.length, passingCases: 0,
    qualification: 'unverified: inventory replay only; no target case evidence consumed' };
  if (options.has('--output')) {
    const requested = resolve(options.get('--output')), parent = realpathSync(dirname(requested));
    const approved = realpathSync('/var/folders/k1/dqkw16gn09q6492v5jn1x_jc0000gn/T/opencode');
    if (parent !== approved && !parent.startsWith(`${approved}/`)) throw new Error('Retained summary must remain under approved temporary parent');
    writeFileSync(resolve(parent, basename(requested)), stableJSON(summary), { flag: 'wx' });
  }
  console.log(JSON.stringify({ ...summary, missingFileEnvironments: summary.missingFileEnvironments.length,
    typeDiagnostics: summary.typeDiagnostics.length, helperProvenance: summary.helperProvenance.length }, null, 2));
  process.exitCode = summary.complete ? 0 : 1;
}
