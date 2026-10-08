import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const root = fileURLToPath(new URL('../../', import.meta.url));
const upstream = path.resolve(root, '../ref/base-ui');
const files = ['operations', 'foundations', 'controls', 'overlays', 'distribution'];
const tickets = files.flatMap(name => JSON.parse(fs.readFileSync(path.join(root, `planning/${name}.json`), 'utf8')));
// Coordinator reconciliation is deliberately explicit and reproducible. Shards were
// authored independently; these rules resolve their shared seams before Beads import.
for (const t of tickets) {
  if (t.id.startsWith('bsolid-c-')) {
    t.deps = t.deps.map(d => d === 'bsolid-c-button' ? 'bsolid-composite' : d);
    t.description = t.description
      .replace(/button's (?:read-only )?adapter/gi, 'the composite-owned internal button primitive')
      .replace(/Use button's adapter/g, 'Use the composite-owned internal button primitive');
  }
  t.description = t.description.replace('Button owns a reusable button-behavior adapter within its directory.', 'Composite owns the sole internal button primitive; public Button consumes it.');
  t.description = t.description.replace('utils/popups/**, utils/usePopupViewport.tsx and popup state mapping', 'utils/popups/** and utils/usePopupViewport.tsx');
  if (t.id === 'bsolid-c-button') {
    t.title = 'Implement public Button over the shared native/non-native activation primitive';
    t.deps.push('bsolid-composite');
    t.description = 'WHY: Expose the public Button contract without duplicating activation behavior. READ FIRST: upstream packages/react/src/button/Button.tsx, Button.test.tsx, index.ts and internals/use-button/useButton.ts at the pinned SHA; then composite-owned createButton and bootstrap contracts. IMPLEMENT: the public Button consumes the composite-owned internal button primitive. Default to native button, disabled=false and focusableWhenDisabled=false; preserve type, anchor activation, native/custom Space/Enter timing, modifier forwarding, disabled focusability, handler prevention and current reactive props. Public Button must not implement a second activation adapter. Preserve family type/data exports, Solid class, live render(props,state), setup-owned refs and native event semantics. Use accessor/memo derivation; split effects only for imperative DOM work. WRITE BOUNDARY: packages/solid/src/button/**, colocated tests/fixtures, docs/components/button/** and tracking/components/button.json. Shared internals, root barrel, manifests and lockfile are read-only. NON-GOALS: changing composite behavior, Toggle/Form state or browser execution during porting. Missing shared behavior is a blocker for its owner. VALIDATE: translate every Button.test.tsx scenario and conformance case, add reactive disabled/callback replacement and ref identity checks. Run pnpm test:jsdom Button --no-watch, pnpm typescript and type fixtures; author and inventory real-browser activation cases for final qualification. Record each source case, target case, environment and result. No skipped source behavior is counted as passing.';
    t.acceptance = ['All public Button exports and source defaults are preserved.', 'Public Button consumes one composite-owned activation primitive; no duplicate implementation.', 'Native/custom/anchor disabled and focusable-disabled semantics pass translated non-browser tests.', 'Callback freshness, Base UI prevention, class/render state and ref identity pass.', 'Every source case is mapped; browser-required cases are authored and deferred to final qualification.'];
  }
  if (t.id === 'bsolid-dist-publish') t.deps.push('bsolid-release-ready');
  if (t.type !== 'epic' && (t.id.startsWith('bsolid-c-') || t.parent === 'bsolid-foundations')) {
    t.description += '\n\nEXECUTION CONTRACT: use RTK for all terminal commands; owned paths are exclusive. pnpm test:jsdom <FamilyOrPrimitive> --no-watch, pnpm typescript and pnpm test:types are the bootstrap/harness command contract. Browser-only assertions must be authored and assigned, but their execution and final pass are deferred to bsolid-browser/bsolid-hydration/bsolid-accessibility. This handoff is not browser parity. Root exports/manifests/lockfile remain integrator-owned.';
  }
}
for (const t of tickets) t.deps = [...new Set(t.deps.flatMap(dep => {
  if (dep === '@component-tasks') return tickets.filter(x => x.type !== 'epic' && x.id.startsWith('bsolid-c-')).map(x => x.id);
  if (dep === '@foundation-tasks') return tickets.filter(x => x.parent === 'bsolid-foundations').map(x => x.id);
  return dep;
}))];
const byId = new Map(tickets.map(t => [t.id, t]));
const errors = [];
if (byId.size !== tickets.length) errors.push('Duplicate ticket IDs');
for (const t of tickets) {
  for (const k of ['id', 'title', 'description', 'acceptance', 'owns', 'sourcePaths', 'deps']) {
    if (t[k] === undefined) errors.push(`${t.id}: missing ${k}`);
  }
  for (const dep of [...t.deps, ...(t.parent ? [t.parent] : [])]) {
    if (!byId.has(dep)) errors.push(`${t.id}: unknown dependency/parent ${dep}`);
  }
  for (const p of t.sourcePaths) if (!fs.existsSync(path.join(upstream, p))) errors.push(`${t.id}: missing source ${p}`);
}
const ordered = [], active = new Set(), visited = new Set();
function visit(id) {
  if (active.has(id)) { errors.push(`Cycle at ${id}`); return; }
  if (visited.has(id) || !byId.has(id)) return;
  active.add(id);
  const t = byId.get(id);
  for (const dep of [...t.deps, ...(t.parent ? [t.parent] : [])]) visit(dep);
  active.delete(id); visited.add(id); ordered.push(t);
}
for (const t of tickets) visit(t.id);
const reaches = (from, to, seen = new Set()) => {
  if (from === to) return true;
  if (seen.has(from)) return false;
  seen.add(from);
  return (byId.get(from)?.deps ?? []).some(d => reaches(d, to, seen));
};
// Check glob allowlists against representative paths at every declared stem.
// This is a conservative planning check; dispatch still checks actual changed files.
const matches = (pattern, file) => new RegExp('^' + pattern.split('**').map(s => s.split('*').map(x => x.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('[^/]*')).join('.*') + '$').test(file);
const ownTickets = tickets.filter(t => t.type !== 'epic');
const collisions = [];
for (let i = 0; i < ownTickets.length; i++) for (let j = i + 1; j < ownTickets.length; j++) {
  const a = ownTickets[i], b = ownTickets[j];
  if (reaches(a.id, b.id) || reaches(b.id, a.id)) continue;
  for (const ap of a.owns) for (const bp of b.owns) {
    const witnesses = [ap, bp].flatMap(p => [p.replaceAll('**', 'Example.ts').replaceAll('*', 'ts'), p.replaceAll('**', 'root/Example.tsx').replaceAll('*', 'test.tsx')]);
    if (witnesses.some(p => matches(ap, p) && matches(bp, p))) collisions.push(`${a.id} / ${b.id}: ${ap} <> ${bp}`);
  }
}
if (collisions.length) errors.push(...collisions.map(x => `Unserialized ownership: ${x}`));
const componentOwners = new Set(tickets.flatMap(t => t.owns).map(p => p.match(/^packages\/solid\/src\/([^/]+)\/\*\*$/)?.[1]).filter(Boolean));
const pkg = JSON.parse(fs.readFileSync(path.join(upstream, 'packages/react/package.json'), 'utf8'));
const publicFamilies = Object.keys(pkg.exports).filter(p => /^\.\/[^/]+$/.test(p)).map(p => p.slice(2));
for (const family of publicFamilies) if (family !== 'types' && !componentOwners.has(family)) errors.push(`Unowned public family: ${family}`);
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log(`Validated ${tickets.length} tickets (${tickets.filter(t => t.type === 'epic').length} epics), ${publicFamilies.length} public subpaths, all source paths and DAG.`);
const firstComponentWave = tickets.filter(t => t.id.startsWith('bsolid-c-') && !t.deps.some(d => d.startsWith('bsolid-c-')));
console.log(`After shared foundations: ${firstComponentWave.length} independent component-family tasks can start concurrently. Shared-file allowlists have no detected unordered overlaps.`);
if (process.argv.includes('--summary')) {
  for (const t of ordered) console.log(`${t.id} [${t.type}] <- ${t.deps.join(', ')} | ${t.title}`);
}
function bd(args) {
  return execFileSync('rtk', ['proxy', 'bd', ...args], { cwd: root, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
}
if (process.argv.includes('--verify')) {
  const exported = bd(['export']).trim().split('\n').filter(Boolean).map(line => JSON.parse(line));
  const actual = new Map(exported.map(t => [t.id, t]));
  const failures = [];
  for (const t of tickets) {
    const row = actual.get(t.id);
    if (!row) { failures.push(`Missing database ticket ${t.id}`); continue; }
    if (row.description !== t.description) failures.push(`Description mismatch ${t.id}`);
    const edges = new Set((row.dependencies ?? []).map(d => `${d.type}:${d.depends_on_id}`));
    for (const dep of t.deps) if (!edges.has(`blocks:${dep}`)) failures.push(`Missing blocker ${t.id} -> ${dep}`);
    if (t.parent && !edges.has(`parent-child:${t.parent}`)) failures.push(`Missing parent ${t.id} -> ${t.parent}`);
  }
  if (failures.length) { console.error(failures.join('\n')); process.exit(1); }
  console.log(`Database verified: all ${tickets.length} planned records, descriptions, parents and prerequisite edges match.`);
}
if (process.argv.includes('--apply')) {
  const existing = new Set(JSON.parse(bd(['list', '--all', '--limit', '0', '--json'])).map(t => t.id));
  let created = 0;
  for (const t of ordered) {
    if (existing.has(t.id)) continue;
    const acceptance = Array.isArray(t.acceptance) ? t.acceptance.map(x => `- ${x}`).join('\n') : t.acceptance;
    const args = ['create', '--id', t.id, '--title', t.title, '--type', t.type, '--priority', String(t.priority ?? 2),
      '--description', t.description, '--acceptance', acceptance,
      '--metadata', JSON.stringify({ owns: t.owns, sourcePaths: t.sourcePaths, sourceSha: '19511bb171f3b360b006c94cf6d07e53cb446505', terminal: 'rtk', specification: files.find(f => JSON.parse(fs.readFileSync(path.join(root, `planning/${f}.json`), 'utf8')).some(x => x.id === t.id)) }), '--silent'];
    // Explicit IDs and --parent are mutually exclusive in this Beads release.
    // Add the equivalent parent-child relationship in the dependency batch below.
    if (t.labels?.length) args.push('--labels', t.labels.join(','));
    bd(args); existing.add(t.id); created++;
    console.log(`Created ${t.id}`);
  }
  // A rerun repairs missing dependency edges without replacing edited descriptions or statuses.
  const records = JSON.parse(bd(['list', '--all', '--limit', '0', '--json']));
  const exported = bd(['export']).trim().split('\n').filter(Boolean).map(line => JSON.parse(line));
  const edges = new Set(exported.flatMap(t => (t.dependencies ?? []).map(d => `${t.id}>${d.depends_on_id}`)));
  const commands = tickets.flatMap(t => [
    ...t.deps.filter(d => !edges.has(`${t.id}>${d}`)).map(d => `dep add ${t.id} ${d} blocks`),
    ...(t.parent && !edges.has(`${t.id}>${t.parent}`) ? [`dep add ${t.id} ${t.parent} parent-child`] : []),
  ]);
  if (commands.length) execFileSync('rtk', ['proxy', 'bd', 'batch'], { cwd: root, input: commands.join('\n'), encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 });
  console.log(`Created ${created}; linked ${commands.length} prerequisites; database contains ${records.length} issues.`);
}
