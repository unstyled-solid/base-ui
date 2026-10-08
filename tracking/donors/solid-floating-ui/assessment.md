# Source assessment: solid-floating-ui → owned Solid 2 foundations

Donor `0492e49b746deed543dbc167a9a58ed1210c2393`, source package **1.0.1**.
Behavioral oracle remains Base UI `19511bb171f3b360b006c94cf6d07e53cb446505`.
Paths below are relative to donor `packages/solid-floating-ui/src/` unless marked
Base UI. This is an adoption plan backed by source/declaration evidence, **not a
claim that donor runtime or target foundations pass RC13 qualification**.

## Exact compatibility verdict

**Do not install or import this donor package unchanged.** Its package manifest
declares Solid peer `^1.8`, development `^1.9.9`, DOM peer `^1.5`, DOM development
`^1.7.4`, `vite-plugin-solid ^2.11.9`, and Vite `^7.1.9`. RC13 is outside the
declared Solid peer. Runtime dependencies are `@floating-ui/utils ^0.2.9` and
`tabbable ^6.2.0`; neither is permission to change our dependency graph.

| Actual donor evidence | Installed RC13 evidence / required adaptation |
|---|---|
| `usePosition.ts:3,95` imports/calls `batch`; `useDismiss.ts:10` imports `on`; focus manager imports `onMount`; DOM JSX comes from `solid-js` | `node_modules/solid-js/types/index.d.ts` exports no `batch`, `on`, `onMount` or DOM `JSX`. Use native staging, explicit compute snapshots, `onSettled`, and `@solidjs/web` types. Do not add compatibility shims. |
| `utils/reactivity.ts:13-19` runs one-argument `createRenderEffect`, installs cleanup during its tracked callback | RC13 `types/client/hydration.d.ts:427-522` requires compute/effect split. Capture all elements/options in compute; establish DOM subscriptions in effect; return cleanup. Replacing the helper's import alone is insufficient. |
| `FloatingTree.tsx:66,98` uses `.Provider`; `FloatingList.tsx:35-40` has a shared mutable no-op default | RC13 `types/client/core.d.ts:10-45` makes context itself the provider; required context defaultless, optional nesting explicitly null. No shared Map sentinel. |
| `FloatingPortal.tsx:14` imports `solid-js/web` | That subpath is absent from RC13 package exports. Use `@solidjs/web` and its Element-only Portal mount; real owned HTMLElement inside ShadowRoot. Donor already has a subroot idea, but global `document` and `created` short-circuit at 138-187 do not meet replacement/iframe ownership. |
| `FloatingList.tsx:147-158` calls `onCleanup` inside ref; registration stored in mutable signal Set/Map at 62-87 | RC13 refs are ownerless; setup owns subscription/disposal. Use composite's immediate live Map and published immutable snapshot, replacement tokens and observer invalidation. Do not assume setter→getter visibility. |
| `usePosition.ts:80-110` async continuation checks only `disposed`, capturing `positioned` before promise; config effect 126-144 has no request generation | A newer request B can finish before A; A then overwrites B. Closing during A can republish `isPositioned=true`. In owned adaptation, invalidate generations on options/elements/open policy/disable/disposal, with captured references/results and no implicit suspending memo. |
| `useFloating.ts:18-35` always builds internal root before selecting external; `useFloatingRootContext.ts:33-38` emits before callback | Base UI `hooks/useFloating.ts:22-38` requires supplied root, supports external tree. Use existing structural `FloatingRootContext`; callback cancellation precedes accepted dispatch and open provenance mutation. Donor root cannot be transplanted. |

Run `rtk proxy node --conditions=browser --conditions=development
tracking/donors/solid-floating-ui/compatibility.mjs` for targeted, executable
RC13 negative type diagnostics plus positive native primitives/staged-write proof.
It uses installed packages without installing the donor. It is **not** a full
donor build, geometry implementation test or browser suite.

## What is worth owning

1. **Geometry lifecycle skeleton:** `usePosition` live config, raw element
   accessors, update entry point, getter return surface and DPR rounding; combine
   with the virtual `contextElement` wrapper from `useFloating:78-88`. Adapt inside
   **one** positioning-owned `floating-ui-react/hooks/createFloating.ts`; private
   helpers in that leaf are sufficient. Its named entry is `createBaseUIFloating`.
   Do not introduce a second public `usePosition` or a new foundation.
2. **Small accessor conveniences:** donor `arrow.ts:28-43` resolves an Element or
   accessor and handles null. Reuse only that boundary. Base UI's `baseArrow`
   explicitly uses **floating as offset parent** (`middleware/arrow.ts:25-97`),
   unlike donor's stock DOM `arrowCore`. Preserve one-pixel alignment reset and
   existing placement/collision/adaptive-origin/hide order from Base UI.
3. **Selective Solid source examples:** getter-backed interaction options, focus
   resolvers, optional tree contexts, list accessors, render callbacks and guard
   bridge. They can shorten translation but every owner checks its Base UI suite.
   `source-map.json` exhaustively assigns donor runtime source to owner, exact
   target, decision, oracle and supplementary donor spec (or explicit non-adoption).

### Behavioral differences that must survive adaptation

- Donor `useDismiss` uses `pointerdown|mousedown|click`, a boolean referencePress
  and MouseEvent predicate. Base UI uses `intentional|sloppy`, lazy referencePress,
  MouseEvent/TouchEvent predicates, pre-open press-tail suppression and
  cancellation-aware `allowPropagation`. Donor's defaults cannot replace them.
- Donor `useInteractions.ts:61-75` calls every collected handler; it does not
  implement Base UI right-to-left prop merging or `preventBaseUIHandler`.
  Reuse events-owned mergeProps instead; no new interaction-composition contract.
- Donor `utils/event.ts:17-48` uses `mozInputSource` and Android-specific 1×1
  pointer recognition. Base UI `utils/event.ts:13-46` checks empty pointerType
  and includes desktop assistive pointer cases. Preserve Base UI predicates.
- `FloatingList` supplies index `-1`, no-op absence and registration-triggered
  sorting; Base UI owns nullable index, explicit indexes, metadata, MutationObserver
  DOM-order changes, staged snapshots and immediate registrations.
- Focus uses existing dom tabbability and reference-counted marking, portal's
  guard/context seam, and floating-core ancestry. Donor `tabbable` dependency,
  global history/constructors and lifecycle effects cannot silently replace them.
- Source names such as donor transition `initial/open/close/unmounted`, additional
  roles/inner/NextFloatingDelayGroup and FloatingArrow/Overlay are not additions
  to the Base UI public surface. Public aliases/barrels remain integration-owned.

## Exact ticket adjustments / implementation seams

These are coordination requests, recorded in Beads comments; owner descriptions
and frozen root contracts are not rewritten by this lane.

- **bsolid-positioning:** replace NON-GOALS “third-party Solid adapter” with
  “no installed/unreviewed Solid1 adapter; owned adaptation from the pinned donor
  is authorized.” Replace acceptance #1's blanket adapter ban with “geometry
  calls `@floating-ui/dom` directly through the single owned RC13-adapted
  createBaseUIFloating implementation; no `@floating-ui/react-dom`, donor runtime
  package or Solid1 declarations.” Add donor geometry/accessor rows and MIT
  provenance to its coverage record. No owns expansion is required. Retain
  `createAnchorPositioning as useAnchorPositioning`, `createPositioner`, all
  CSS dimensions and Base UI middleware algorithm ownership.
- **floating-core:** donor does not own a second root/tree. Its current
  `state: Live<FloatingRootState>`, raw DOM/virtual split, immediate nodes,
  `setOpen(next, details)`/`dispatchOpenChange(next, details)` and typed emitter
  remain the seam. Geometry consumes these, never popup implementation imports.
  `FloatingRootContext.data` currently only types `openEvent`; Base UI context
  publication (`data.floatingContext`, node context attachment) needs an
  owner-proposed typed bridge/extension through the contract integrator before
  implementation, not donor types or an `any` escape. Readonly node context is
  another reason to coordinate the attachment API, not mutate competing objects.
- **dismiss:** split donor hover examples into existing reference/floating/shared
  leaves; Base UI reasons, logical portal participation, root transactions,
  delays/touch timing and safePolygon remain authoritative.
- **focus/composite/portal:** read mapped donor examples selectively; rewrite
  RC13 resources and providers, retain source behavior and single-owned helpers.
  No new runtime/declaration dependency on donor types, tabbable or Solid1.
- **dom/events/lifecycle:** prefer existing source-owned helper leaves; annotate
  licensed one-time snippets only where actually copied. Root barrel integration
  and package/lock changes stay with their existing owners.
- **upstream-cli:** same six state keys in `tracking/donors/solid-floating-ui.json`;
  provenance/map are sidecars. Shared selector/update engine owns mutation and
  donor-scoped episodes. No competing updater is supplied here. Developer request
  and immutable range/report are mandatory; baseline/adapted code remain stable.

## Other production dependencies: grounded disposition

Audited pinned `packages/react/package.json:130-160`,
`packages/utils/package.json:30-49` and their literal import sites.

| Dependency/helper | Evidence and recommendation |
|---|---|
| `@floating-ui/react-dom ^2.1.9` | `floating-ui-react/hooks/useFloating.ts:4` uses its position adapter; index/types/arrow/hide/inlineRect also reference it. Replace with owned donor-informed RC13 adapter + framework-independent DOM/core types. DOM is substantial maintained geometry: depend on a reviewed exact version via distribution owner, do not copy its algorithms as “tiny helpers”. Donor supports DOM ^1.5 and develops on ^1.7.4; the integrator must select/lock and qualify the actual version. |
| `use-sync-external-store ^1.7.0` | `utils/src/store/useStore.ts`, `hydration.ts`, media-query and popup-handle imports bridge React scheduling. Remove the bridge, not vendor its React shim: state/lifecycle/media-query/popup owners use native accessors and owned resources. |
| `@base-ui/utils` | Mixed React/pure workspace source already tracked at the Base UI SHA. `mergeCleanups.ts` is 15 lines; `addEventListener.ts:58-61` has a four-line attach/cleanup body with important typed overloads. Licensed one-time source adaptation into dom-owned leaves is sufficient; retain Base UI MIT and existing upstream source mapping. No additional donor repository for those helpers. |
| Donor `useMergeRefs.ts` / `utils/dpr.ts` | 13 lines each. A licensed loop/rounding helper does not justify importing the whole package. Lifecycle must retain full RC13 NativeRef forms and setup-owned disposal; positioning may inline DPR helpers privately. Since their parent donor is already tracked, map copied portions for future reports, but never maintain a second installed helper package. |
| `reselect ^5.3.0` | Framework-neutral, not React-only. Base UI `lruMemoize.ts` is a **one-line re-export**, not a one-line implementation; `store/createSelectorMemoized.ts` has 171 lines of per-state/argument cache policy. Native memos replace React selector subscription plumbing, not necessarily all cache semantics. State/dom owner must inventory actual remaining consumers. If full LRU semantics remain necessary, use a reviewed maintained dependency or separately pinned substantial donor, not an unlicensed toy cache. No new source vendored here. |
| `@babel/runtime`, React/react-dom/types | Build/lifecycle compatibility inputs, not reusable behavior helpers. Do not carry React runtime into target. Distribution/compiler owner determines any real Babel helper requirement from emitted artifacts. |
| `@floating-ui/utils` | Framework-neutral low-level algorithms already used by Base UI; pin centrally when owners require them. Do not duplicate upstream geometry/realm algorithms across foundations. |
| `tabbable` (donor dependency) | Not in pinned Base UI production manifests. Base UI has its own tested `floating-ui-react/utils/tabbable.ts`. Do not import donor dependency or replace dom owner's oracle. |
| `aria-hidden` / React Aria virtual-event snippets | These are attributed source fragments, not current declared production dependencies. markOthers is substantial, modified and already tracked through Base UI; keep its source relationship. Tiny virtual-event predicates can be licensed one-time adaptations of the Base UI version. Donor cites immutable Adobe revision with Apache header/root NOTICE and aria-hidden MIT. Track attribution, not an entire React Aria runtime. Packed notice followup is required. |
| Optional date-fns/tz/Luxon adapters | Framework-independent; temporal/distribution owners already govern them. No donor change warranted. |

## Gaps and qualification

`bsolid-donor-positioning-proof` records the promise/arrow reproductions and
blocks integration/browser qualification. `bsolid-donor-interaction-proof`
records canceled requests, pre-open press tails, ref replacement and cross-document
portal reproductions, blocking integration/browser/accessibility/hydration.
`bsolid-donor-notices` gates packed inherited notices. `bsolid-donor-update-proof`
gates shared CLI donor episodes. See Beads for authoritative status/dependencies.
No donor E2E suite has been executed and no production adaptation exists yet;
`adaptedSourceSha` and `verifiedParitySha` deliberately remain null.
