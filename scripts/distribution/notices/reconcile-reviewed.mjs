// One explicit review episode, not an automatic approval mechanism. Future
// source changes must be reviewed again; audit.mjs never invokes this recorder.
import fs from 'node:fs/promises';
import { hash } from '../../../docs/scripts/qualification/io.mjs';
const ledgerPath = 'tracking/distribution/donor-notices.json';
const ledger = JSON.parse(await fs.readFile(ledgerPath));
if (ledger.status === 'reviewed-source-and-notice-mapping') throw new Error('Review episode already recorded; review new source deltas explicitly instead of refreshing approval hashes.');
const map = JSON.parse(await fs.readFile('tracking/donors/solid-floating-ui/source-map.json'));
const evidence = async file => ({ file, sha256: hash(await fs.readFile(file)) });
const portion = async (source, revision, startLine, endLine, scope) => ({ source, revision, startLine, endLine, sha256: hash(await fs.readFile(source)), scope });
const reasons = {
  geometry: 'Owned source-informed adaptation of donor usePosition/getter/virtual-reference/DPR patterns. Current Solid 2 split effects and request generations replace donor Solid 1 effects; Base UI supplies root/tree contracts.',
  arrow: 'No donor accessor wrapper or arrowCore call: target directly implements Base UI baseArrow. Floating UI inherited algorithm is mapped separately below.',
  'root-tree': 'Target uses Base UI cancellation-first transaction, mutable node registry, typed Map/Set emitter with explicit disposal. Donor signal-backed tree/emit-before-callback implementation is not copied.',
  'dismiss-hover': 'Target preserves Base UI intentional/sloppy press policy, LogicalLayer and separate reference/floating/shared-hover leaves. Donor monolithic hover/useDismiss source is not transplanted; pure safePolygon derives from pinned Base UI.',
  focus: 'Target uses Base UI focus-manager behavior with owned generation/timer resources and local tabbability/markOthers; donor Solid1 effect/onMount and third-party tabbable implementation are not adopted.',
  composite: 'Target uses Base UI nullable-index and metadata registry with tokenized cleanup and DOM order invalidation; donor FloatingList default no-op context and signal Set/ref-owned registration are not adopted.',
  portal: 'Target owns replacement-aware portal nodes and LogicalLayer, native Solid 2 Portal wrappers and Base UI tab-order guards. Donor global-document/created-once portal is not copied.',
  'dom-helpers': 'Target helpers follow Base UI. markOthers inheritance is mapped to aria-hidden through Base UI below; local tabbable implementation does not use donor dependency. Platform is lazy and realm-aware.',
  'event-helpers': 'Target predicates match Base UI empty pointerType, desktop assistive pointer and fractional touch branches, not donor mozInputSource predicate. mergeProps preserves Base UI prevention/order, not donor useInteractions fanout. Adobe inheritance is separately scoped below.',
  'not-adopted': 'Donor-only FloatingArrow/FloatingOverlay/NextFloatingDelayGroup/useClientPoint/useRole/useTransition/inner and Solid1 reactivity helper are not exported/imported. Target family arrows/backdrops, gesture and presence owners use Base UI source; no donor package, index, types or utils facade is installed.',
};
ledger.groupReviews = await Promise.all(map.groups.map(async group => {
  const files = group.sources.map(p => 'upstream/solid-floating-ui/packages/solid-floating-ui/src/' + p);
  for (let p of group.targets) {
    p = 'packages/solid/src/' + p;
    try { await fs.access(p); } catch {
      if (p.endsWith('createFloatingPortalNode.ts')) p += 'x';
      else if (p.endsWith('createCompositeItem.ts')) p = 'packages/solid/src/internals/composite/item/CompositeItem.tsx';
      await fs.access(p);
    }
    files.push(p);
  }
  if (!group.targets.length) files.push('packages/solid/src/index.ts', 'packages/solid/package.json');
  return { id: group.id, status: group.id === 'geometry' ? 'adopted' : 'inspected-no-adoption', reason: reasons[group.id], reviewedBy: 'bsolid-qaiu', evidence: await Promise.all(files.map(evidence)) };
}));
for (const adoption of ledger.adoptions) adoption.targetSha256 = hash(await fs.readFile(adoption.target));
const aria = ledger.adoptions.find(a => a.target.endsWith('/markOthers.ts'));
aria.portions = [await portion('upstream/base-ui/packages/react/src/floating-ui-react/utils/markOthers.ts', ledger.baseUiSha, 1, 2, 'Intermediate source attribution'), await portion('scripts/distribution/notices/sources/aria-hidden.ts', '9220c8f4a4fd35f63bee5510a9f41a37264382d4', 18, 181, 'Shadow-host correction, keep/stop ancestry traversal, reference-counted attribute restoration and aria-live exclusion. Target rewrites counters as per-attribute locks and idempotent cleanup.')];
const event = ledger.adoptions.find(a => a.target.endsWith('/event.ts'));
event.targetScope = 'Virtual click and pointer predicates; stopEvent/mouse/click classification are Base UI helpers.';
event.portions.push(await portion('scripts/distribution/notices/sources/adobe-isVirtualEvent.ts', 'b35d5c02fe900badccd0cf1a8f23bb593419f238', 1, 58, 'Reviewed attributed ancestor, not byte-identical origin: Android click/buttons branch, detail/pointerType fallback and zero/one-size pointer predicates. Base UI changed Firefox detection and added jsdom, desktop and fractional touch handling; modified-file notice retained.'));
ledger.adoptions.push({ target: 'packages/solid/src/floating-ui-react/middleware/arrow.ts', targetSha256: hash(await fs.readFile('packages/solid/src/floating-ui-react/middleware/arrow.ts')), owner: 'bsolid-qaiu', requiresProminentChangeNotice: false, changes: 'Base UI always uses floating element offset parent; native DOM types, null element handling, direct baseArrow alias instead of React dependency wrapper.', targetScope: 'baseArrow geometry algorithm, lines 5-28', portions: [await portion('upstream/base-ui/packages/react/src/floating-ui-react/middleware/arrow.ts', ledger.baseUiSha, 25, 97, 'Exact intermediate Base UI fork'), await portion('scripts/distribution/notices/sources/floating-arrow.ts', '38f8b5acc419a286538ce8d7f78c28d58edf6900', 33, 117, 'Inherited Floating UI MIT algorithm: axis selection, padding clamp, center offset and one-reset alignment correction; offset-parent branch changed by Base UI.')] });
ledger.texts.push({ file: 'scripts/distribution/notices/licenses/floating-ui-MIT.txt', destination: 'notices/floating-ui-MIT.txt', sha256: hash(await fs.readFile('scripts/distribution/notices/licenses/floating-ui-MIT.txt')), repository: 'https://github.com/floating-ui/floating-ui', revision: '38f8b5acc419a286538ce8d7f78c28d58edf6900', source: 'LICENSE', scope: 'whole file', license: 'MIT' });
ledger.resolutions = ledger.unresolved.map(item => ({ id: item.id, reviewedBy: 'bsolid-qaiu', resolution: item.id === 'adobe-moving-origin' ? 'Pinned Base UI is the actual copied source. Compared the preserved Adobe ancestor: shared expressions and explicit later differences are recorded, without asserting identity to a moving main URL. Apache/React texts and modified-file notice apply to those inherited predicates.' : item.id === 'aria-hidden-line-map' ? 'Original immutable source retained and lines 18-181 mapped to target traversal, overlapping locks and aria-live preservation.' : 'Pinned Base UI fork and independently pinned Floating UI ancestor compared; full original Floating UI MIT license now included.' }));
ledger.unresolved = [];
ledger.status = 'reviewed-source-and-notice-mapping';
await fs.writeFile(ledgerPath, JSON.stringify(ledger, null, 2) + '\n');
