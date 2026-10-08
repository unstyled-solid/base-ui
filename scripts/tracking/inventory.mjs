import { createHash } from 'node:crypto';
import { posix } from 'node:path';
import { analyzeTests, dependencyGraph } from './analyze.mjs';
import { classify, mapOwnership } from './ownership.mjs';

export const stableJSON = (value) => `${JSON.stringify(value, null, 2)}\n`;
export const digest = (value) => createHash('sha256').update(stableJSON(value)).digest('hex');

export function buildInventory(entries, owners, policy, baseline) {
  if (!/^[a-f0-9]{40}$/.test(baseline)) throw new Error('Invalid baseline SHA');
  if (new Set(entries.map((e) => e.path)).size !== entries.length) throw new Error('Duplicate source path');
  if (new Set(owners.map((o) => o.id)).size !== owners.length) throw new Error('Duplicate owner ID');
  entries = [...entries].sort((a, b) => a.path < b.path ? -1 : 1);
  owners = [...owners].sort((a, b) => a.id < b.id ? -1 : 1);
  const graph = dependencyGraph(entries);
  const errors = [];
  const sources = entries.map((entry) => {
    let mapping;
    try { mapping = mapOwnership(entry, owners, policy); }
    catch (error) { errors.push(error.message); return null; }
    const tests = analyzeTests(entry.path, entry.content);
    return { path: entry.path, blob: entry.blob, mode: entry.mode, category: classify(entry.path),
      ...mapping, targetState: 'planned',
      ...graph.details.get(entry.path), transitiveConsumers: graph.consumers(entry.path),
      ...(tests ? { tests } : {}) };
  }).filter(Boolean).sort((a, b) => a.path < b.path ? -1 : 1);
  if (errors.length) throw new Error(errors.join('\n'));
  const pkgEntry = entries.find((e) => e.path === 'packages/react/package.json');
  if (!pkgEntry?.content) throw new Error('Missing canonical package export metadata');
  const pkg = JSON.parse(pkgEntry.content);
  const byPath = new Map(sources.map((e) => [e.path, e]));
  function resolveLeaves(value, conditions = []) {
    if (typeof value === 'string') return [{ conditions, value }];
    if (!value || Array.isArray(value)) throw new Error('Unsupported export shape; explicit mapping required');
    return Object.entries(value).flatMap(([key, child]) => resolveLeaves(child, [...conditions, key]));
  }
  const exports = Object.entries(pkg.exports).flatMap(([key, value]) => resolveLeaves(value).map((leaf) => {
    if (!leaf.value.startsWith('./') || leaf.value.includes('..') || key.includes('*')) throw new Error(`Unsafe/unexpanded export ${key}`);
    const sourcePath = posix.join('packages/react', leaf.value);
    const source = byPath.get(sourcePath);
    if (!source) throw new Error(`Missing export source ${key}: ${sourcePath}`);
    return { key, conditions: leaf.conditions, sourcePath, blob: source.blob, owner: source.owner,
      targets: source.targets, disposition: source.disposition,
      rootPolicy: key === '.' ? 'root' : key === './types' ? 'type-only' : /^\.\/(internals|unstable-)/.test(key) ? 'subpath-only' : 'root-and-subpath' };
  })).sort((a, b) => `${a.key}:${a.conditions}`.localeCompare(`${b.key}:${b.conditions}`, 'en'));
  const metadata = { schemaVersion: 1, baseline, treeDigest: digest(entries.map(({ path, blob, mode }) => ({ path, blob, mode }))), ownershipDigest: digest(owners), policyDigest: digest(policy) };
  return { sourceManifest: { ...metadata, sources }, exportManifest: { ...metadata, package: pkg.name, exports, imports: pkg.imports ?? {} } };
}

/** @param {any[]} before @param {any[]} after @param {string | ((entry: any) => string)} key */
export function detectDrift(before, after, key = 'path') {
  const identity = typeof key === 'function' ? key : (entry) => entry[key];
  const previous = new Map(before.map((e) => [identity(e), e]));
  const current = new Map(after.map((e) => [identity(e), e]));
  if (previous.size !== before.length || current.size !== after.length) throw new Error('Duplicate drift identity; use condition-qualified export keys');
  const added = after.filter((e) => !previous.has(identity(e)));
  const deleted = before.filter((e) => !current.has(identity(e)));
  const changed = after.filter((e) => previous.has(identity(e)) && stableJSON(previous.get(identity(e))) !== stableJSON(e)).map(identity);
  // Equal-blob renames are evidence, not automatic ownership transfer. Edited renames
  // remain additions/deletions, requiring explicit mapping instead of fuzzy guesses.
  const renames = deleted.flatMap((old) => added.filter((entry) => entry.blob === old.blob)
    .map((entry) => ({ from: identity(old), to: identity(entry), blob: old.blob })));
  return { added: added.map(identity), deleted: deleted.map(identity), changed, renames };
}

export const detectExportDrift = (before, after) => detectDrift(before, after, (entry) => `${entry.key}#${entry.conditions.join('/')}`);

// Called only after aggregate() has validated ownership, blob pins and all ledger paths.
// Keep the original policy decision: refinements must not erase provenance.
export function applyLedgerMappings(sourceManifest, exportManifest, ledgers) {
  const updates = new Map(ledgers.flatMap(({ path, ledger }) => ledger.sources.map((record) =>
    [record.path, { record, ledgerPath: path, owner: ledger.owner }])));
  const sources = sourceManifest.sources.map((source) => {
    const update = updates.get(source.path);
    if (!update) return source;
    return { ...source, owner: update.owner, targets: update.record.targets,
      disposition: update.record.disposition, reason: update.record.reason, targetState: 'worker-mapped',
      provenance: { kind: 'ledger', ledger: update.ledgerPath, previousMapping: {
        owner: source.owner, targets: source.targets, disposition: source.disposition,
        reason: source.reason, provenance: source.provenance,
      } } };
  });
  const byPath = new Map(sources.map((source) => [source.path, source]));
  return { sourceManifest: { ...sourceManifest, sources }, exportManifest: { ...exportManifest,
    exports: exportManifest.exports.map((entry) => {
      const source = byPath.get(entry.sourcePath);
      return { ...entry, owner: source.owner, targets: source.targets, disposition: source.disposition };
    }) } };
}
