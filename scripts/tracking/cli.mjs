import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync, lstatSync } from 'node:fs';
import { resolve, dirname, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BASELINE, readTree } from './git.mjs';
import { buildInventory, stableJSON, detectDrift, detectExportDrift, applyLedgerMappings } from './inventory.mjs';
import { policy } from './policy.mjs';
import { aggregate, validateSchema } from './validate.mjs';
import { ingestCollections, assertQualified } from './runtime.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const readJSON = (path) => JSON.parse(readFileSync(resolve(root, path), 'utf8'));
const outputPaths = ['tracking/source-manifest.json', 'tracking/export-manifest.json', 'tracking/reports/inventory.json'];
const schemaPath = 'tracking/schema/ledger.schema.json';
const ownersPath = 'tracking/schema/owners.json';

function writeOwned(path, value) {
  if (![...outputPaths, ownersPath].includes(path)) throw new Error(`Write outside inventory outputs: ${path}`);
  const full = resolve(root, path);
  // Do not follow output symlinks into another worker's files.
  for (let current = full; current !== root; current = dirname(current)) {
    if (existsSync(current) && lstatSync(current).isSymbolicLink()) throw new Error(`Symlink output: ${current}`);
  }
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, stableJSON(value));
}

function liveOwners() {
  const issues = JSON.parse(execFileSync('rtk', ['proxy', 'bd', 'list', '--all', '--limit', '0', '--json'], { cwd: root, maxBuffer: 32 * 1024 * 1024 }));
  return issues.filter((i) => i.id.startsWith('bsolid-')).map((i) => ({
    id: i.id, owns: [...(i.metadata?.owns ?? [])].sort(), sourcePaths: [...(i.metadata?.sourcePaths ?? [])].sort(),
  })).sort((a, b) => a.id < b.id ? -1 : 1);
}

function loadLedgers() {
  const ledgers = [];
  const evidenceOnly = [];
  function visit(directory) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      if (entry.isSymbolicLink()) throw new Error(`Symlink tracking input: ${entry.name}`);
      const full = resolve(directory, entry.name);
      const path = relative(root, full).split(sep).join('/');
      if (['tracking/schema', 'tracking/reports'].includes(path) || outputPaths.includes(path)) continue;
      if (entry.isDirectory()) visit(full);
      else if (entry.name.endsWith('.json')) {
        const ledger = readJSON(path);
        if (('cases' in ledger || 'sources' in ledger) && 'owner' in ledger) ledgers.push({ path, ledger });
        else evidenceOnly.push(path);
      }
    }
  }
  visit(resolve(root, 'tracking'));
  return { ledgers: ledgers.sort((a, b) => a.path < b.path ? -1 : 1), evidenceOnly: evidenceOnly.sort() };
}

export function main(args = process.argv.slice(2)) {
  const normalized = [], collectionPaths = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--no-watch') continue;
    if (args[i] === '--collection') {
      if (!args[i + 1] || args[i + 1].startsWith('--')) throw new Error('--collection requires a retained collection JSON path');
      collectionPaths.push(args[++i]);
    } else normalized.push(args[i]);
  }
  const command = normalized[0] ?? 'check';
  if (normalized.length > 1 || !['snapshot-owners', 'generate', 'check', 'qualify', 'check-owners'].includes(command)) throw new Error('Usage: cli.mjs snapshot-owners|generate|check|check-owners|qualify [--no-watch]');
  if (collectionPaths.length && ['snapshot-owners', 'check-owners'].includes(command)) throw new Error('--collection applies only to generate/check/qualify');
  if (command === 'snapshot-owners') {
    writeOwned(ownersPath, { schemaVersion: 1, baseline: BASELINE, owners: liveOwners() });
    console.log('Snapshotted Beads allowlists only; no ticket status copied.');
    return;
  }
  const ownership = readJSON(ownersPath);
  if (ownership.baseline !== BASELINE) throw new Error('Owner snapshot baseline mismatch');
  if (command === 'check-owners') {
    const live = liveOwners();
    // New followup IDs with no write scope do not change source ownership.
    const scoped = (owners) => owners.filter((o) => o.owns.length);
    if (stableJSON(scoped(live)) !== stableJSON(scoped(ownership.owners))) throw new Error('Live Beads ownership drift; review and snapshot-owners before generation');
    console.log('Live Beads allowlists match snapshot.');
    return;
  }
  let { sourceManifest, exportManifest } = buildInventory(readTree(resolve(root, 'upstream/base-ui')), ownership.owners, policy, BASELINE);
  const { ledgers, evidenceOnly } = loadLedgers();
  const runtime = collectionPaths.length ? ingestCollections(sourceManifest, collectionPaths.map(readJSON)) : null;
  const report = aggregate(sourceManifest, ledgers, ownership.owners, readJSON(schemaPath), (path) => existsSync(resolve(root, path)), runtime);
  if (runtime) sourceManifest = { ...sourceManifest, runtimeCollection: runtime };
  ({ sourceManifest, exportManifest } = applyLedgerMappings(sourceManifest, exportManifest, ledgers));
  report.evidenceOnlyInputs = evidenceOnly;
  report.ownershipSeams = sourceManifest.sources.filter((s) => s.ownershipSeam).map((s) => ({ path: s.path, owner: s.owner, blocker: s.ownershipSeam }));
  report.dependencyAnalysis = { scope: 'Static literal imports/reexports and known Base UI aliases; dynamic imports, MDX and unrecognized aliases need impact triage.',
    unresolved: sourceManifest.sources.filter((s) => s.unresolvedImports?.length).map((s) => ({ path: s.path, imports: s.unresolvedImports })) };
  validateSchema({ sourceManifest, exportManifest, report }, readJSON('tracking/schema/inventory.schema.json'));
  const values = [sourceManifest, exportManifest, report];
  if (command === 'generate') outputPaths.forEach((path, i) => writeOwned(path, values[i]));
  else {
    const drift = [];
    for (const [i, path] of outputPaths.entries()) {
      if (!existsSync(resolve(root, path))) { drift.push(`Missing generated output ${path}`); continue; }
      const previous = readJSON(path);
      if (readFileSync(resolve(root, path), 'utf8') !== stableJSON(values[i])) {
        const detail = i === 0 ? detectDrift(previous.sources, sourceManifest.sources) : i === 1 ? detectExportDrift(previous.exports, exportManifest.exports) : 'ledger/report drift';
        drift.push(`${path}: ${JSON.stringify(detail)}`);
      }
    }
    if (drift.length) throw new Error(drift.join('\n'));
  }
  console.log(JSON.stringify({ command, ...report.totals, exports: exportManifest.exports.length, runtimeCoverage: report.runtimeCoverage }, null, 2));
  if (command === 'qualify') assertQualified(report);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(); } catch (error) { console.error(error.message); process.exitCode = 1; }
}
