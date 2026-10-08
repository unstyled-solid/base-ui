# Bootstrap contracts — bsolid-bootstrap

## Baseline and ownership

React behavior is pinned to `19511bb171f3b360b006c94cf6d07e53cb446505` in the independent
`upstream/base-ui` submodule (`https://github.com/mui/base-ui.git`, branch `master`).
`tracking/upstream.json` records the baseline/candidate and `verifiedParitySha: null`.
The gitlink and `.gitmodules` are staged by submodule initialization; no commit is made.
The research checkout remains untouched, including its dirty lockfile.

The private placeholder package is **`baseui-solid2`**. It is a workspace identity,
not a publication claim. After bootstrap review and closure, `bsolid-dist-contract` corrected
the original `@base-ui-solid/solid` placeholder to the ticket-required identity and owns
identity/export/dependency integration. Temporal module augmentation must use this identity
until that owner coordinates a rename. No production components or root barrel exist yet.

Structural contracts live in `packages/solid/src/internals/contracts/`. Import with `import type`
from a leaf, `../internals/types`, or the type-only workspace self-reference
`baseui-solid2/internals/contracts`. The two package exports currently expose types
only; they intentionally have no runtime target. No public-family or React imports occur.
Foundation workers implement the contracts in their ticket-owned paths; additions to these
shared contracts require coordinator approval rather than competing definitions.

## Verified coordinated toolchain

| Tool | Exact version | Compatibility evidence |
|---|---|---|
| Node | `25.8.1` | Installed runtime; satisfies every engine below; pinned in root `engines` |
| pnpm | `11.8.0` | Installed manager, Node `>=22.13`; exact `packageManager` and engine |
| solid-js, @solidjs/web | `2.0.0-rc.13` | Node `>=22.12.0`; web peers on RC.13 |
| @solidjs/signals | `2.0.0-rc.13` | Pin the otherwise caret-selected reactive core too |
| @solidjs/compiler, @solidjs/babel-plugin | `2.0.0-rc.13` | Both compile DOM/SSR; Babel peer `^7.20.12` |
| @solidjs/vite-plugin | `3.0.0-next.47` | Node `>=22.12.0`, peers Vite `^8 || ^9` and RC.13 |
| Vite | `8.3.2` | Node `^20.19.0 || >=22.12.0` |
| Vitest | `4.1.11` | Vite `^6 || ^7 || ^8`, Node `^20 || ^22 || >=24` |
| TypeScript | `5.9.3` | Node `>=14.17`; strict check of RC.13 declarations passes |
| @types/node | `25.9.9` | Node 25 declaration line |
| jsdom | `27.4.0` | Node `^20.19.0 || ^22.12.0 || >=24` |
| @solidjs/testing-library | `1.0.0-beta.3` | Solid/web peers `>=2.0.0-0`, DOM testing library `^10.4.1` |
| @testing-library/dom | `10.4.2` | Node `>=18` |
| @testing-library/user-event | `14.6.7` | DOM testing library `>=7.21.4`, Node `>=12` |
| @babel/core | `7.29.7` | Satisfies compiler plugin's Babel 7 peer |

Registry metadata was checked before installation; strict peers and engines remain enabled.
All direct versions are exact; workspace overrides keep the coordinated RC packages from
drifting independently. The Node pin records this verified bootstrap environment, rather than
copying React upstream's unrelated pnpm 12/TypeScript 6 requirements. Distribution support
matrices belong to distribution qualification. No optional React/tooling peers were installed.

`jsxImportSource` is **`@solidjs/web`**. Its installed `types/jsx.d.ts` owns `JSX.Ref`,
`ClassValue`, native event handlers and HTML props. Its `types/index.d.ts` owns
`ComponentProps`, `dynamic` and `Portal`. `Portal.mount` is `Element`, not `ShadowRoot`.
`solid-js/types/client/core.d.ts` confirms defaultless contexts throw and contexts are direct
provider components. `solid-js/types/client/component.d.ts` re-exports `createUniqueId`.
The installed runtime, not Solid 1 examples, governs semantics.

Indexed `solidjs@2` references consulted:
- https://v2.solidjs.com/guides/testing
- https://v2.solidjs.com/concepts/rendering-and-ssr
- https://v2.solidjs.com/guides/custom-primitives
- https://v2.solidjs.com/guides/integrate-non-solid-code
- https://v2.solidjs.com/migration/from-solid-1

## Importable structural seams

| Leaf | Contract / implementation owner |
|---|---|
| `core.ts` | `Live`, `Cleanup`, `NativeRef`, `ElementAccessor`, `MutableCell`, `TransitionStatus`, orientation/direction, context types; lifecycle/render/presence consume |
| `events.ts` | `BaseUIEvent`, `MaybeBaseUIEvent`, `WithBaseUIEvent`, generic/change detail shapes and `FloatingUIOpenChangeDetails`; events implements cancellation/reason discrimination |
| `render.ts` | `HTMLProps`, `ComponentRenderFn`, `BaseUIComponentProps`, `ClassValue`, `StyleValue`, `StateAttributesMapping`; render/events implement composition |
| `state.ts` | `ControlledOptions`, `ControlledState`, `ChangeRequest`, `ChangeRequestResult`, `ReadableModel`; state implements requests and inert read-through models |
| `items.ts` | `ItemRegistry`, `ItemMetadata`, `ItemRegistration`, `CompositeMetadata`, `CompositeListRegistration`; composite owns ordering/navigation/button behavior |
| `floating.ts` | `TriggerLookup`, structural `PopupTriggerMap`, `ReferenceType`/`VirtualElement`, `FloatingRootState`, `FloatingRootContext`, `FloatingEvents`, `FloatingNodeType`, `FloatingTreeType`, `LogicalLayer`; floating-core owns root/tree, popup owns trigger mutations, dismiss/portal compose logical event participation |
| `popup.ts` | `PopupState` / `PopupStoreState`, `PopupStoreContext`, `PopupTriggerDataStore`, `PopupHandleStoreProvider`, `PopupHandleAttachment`, `PopupHandleStoreWithTriggers`/`WithOpen`, `PopupChangeEventDetails`; popup owns transactions/attachments |
| `field.ts` | `FieldValidityData`, `FieldValidator`, `FieldControlRegistration`, `FormFieldRegistration`, `FieldRegistration`, `FormContext`, form errors/values/mode; field-core owns implementation without public Field/Form type imports |
| `portal.ts` | `PortalContainer`, `PortalFocusState`, `PortalContext`; portal owns containers/guards, focus consumes the bridge |

### Behavioral obligations and deliberate adaptations

- **Live props/state:** readonly describes the consumer view, not frozen values. Keep stable
  getter-backed objects and their original getter receivers. Ordinary updates cannot recreate
  a host. `render(props, state)` is a Solid JSX callback, never a cloned JSX instance. `class`
  accepts the complete RC.13 `JSX.ClassValue` union, including arrays/objects, or a state callback.
- **Events:** `defaultPrevented`, `preventBaseUIHandler` and change-details `cancel()` remain
  independent. `WithBaseUIEvent` retains native `currentTarget` typing, bound handlers and
  non-event value callbacks. The events owner defines the canonical reason-to-event map and
  `BaseUIChangeEventDetails` / `BaseUIGenericEventDetails` discriminated public aliases over
  the structural details; bootstrap does not invent a second reason map.
- **Controlled requests:** the callback is read at invocation, cancellation precedes local
  commit/accepted dispatch, and accepted controlled requests are not acknowledgements.
  `request(nextValue, details)` takes an explicit resolved proposal. Callers issuing several
  same-turn requests must carry their transaction's next value forward, rather than rereading
  the committed accessor. Solid setter updaters accumulate pending writes; ordinary getters
  still see committed state. No production `flush` policy is introduced.
- **Raw identity:** element accessors return original nodes; plain Maps/cells hold imperative
  registry/event metadata. Never wrap DOM nodes/registrations in deep stores. Item snapshots
  publish reactively, while `liveItems` includes same-turn registrations. Stale cleanup must
  not remove a replacement. Composite `index: null`, labels and metadata retain source nulls.
- **Refs/resources:** native ref callbacks are untracked and ownerless, with ignored returns.
  Allocate effects/cleanup in setup, use split `createEffect(compute, effect)` and returned
  cleanup, and report elements from refs. `MutableCell` is an internal imperative cell, not
  a public React ref API. Public `NativeRef` follows RC.13 assignment/callback/array typing.
- **Popup/floating:** effective state is getter-backed. `mounted` is distinct from `open`;
  transition status is exactly `'starting' | 'ending' | 'idle' | undefined`. Dispatch receives
  explicit next values after cancellation. DOM and virtual references stay distinct. Trigger
  lookup is injected into floating/DOM leaves with no popup imports. Extend the typed emitter's
  event map for a tree lane instead of creating a global event bus.
- **Handles:** `store` becomes a reactive getter, replacing React subscription machinery;
  `serverStore` stays a stable inert fallback. Attach only in a committed owned client
  lifetime. Last attached living root wins and stale cleanup restores the previous root.
  Detached imperative calls remain source-defined no-ops/warnings; `openedWithoutTrigger`,
  payload and closing-trigger retention are not collapsed into `open`.
- **Field/form:** synchronous validity reaches the live Map before submit continues. Async
  validation does not block submit. Keep `value` distinct from `getValue`, preserve the
  field-lifetime initial value and use source tokens for replacement/removal ownership.
- **Portals:** omitted container defaults, literal null waits, and an accessor is the native
  replacement for a live ref container. To retain upstream unresolved-ref behavior, an
  explicitly supplied accessor returning null/undefined follows upstream ref fallback to the
  default parent/body; literal null alone means wait. The portal owner must test that distinction.
  A ShadowRoot requires an owned HTMLElement wrapper and cannot be cast into `Portal.mount`.
  Logical event participation is distinct from DOM containment.

### Required and optional contexts

Use `createContext<T>()` and `<Context value={liveValue}>` for required part/root contexts.
Missing providers throw through RC.13; never swallow that exception. For optional nesting,
field/form adapters, floating trees or portals use `createContext<T | null>(null)` explicitly.
A required consumer of an optional seam checks null and gives a component-specific error.
Direction may default to `'ltr'`; CSP may use immutable static configuration. Never use a
shared mutable Map/store/no-op context as an absence sentinel. Resources are subtree/request-owned.

## Foundation export handoff

This is the complete foundation-related set from pinned `packages/react/package.json`.
Paths retain source spelling; implementation symbols use `createX`. The listed legacy `useX`
names must be explicit aliases of the same function (with corresponding type/namespace
aliases), not a second implementation or React lifecycle shim. These future exports are
not advertised by today's private placeholder manifest. `bsolid-integration` wires public
barrels; `bsolid-dist-contract` wires conditional export/import metadata.

| Retained subpath(s) | Target source / symbols | Owner |
|---|---|---|
| `types`, `internals/types` | public type facade / existing structural facade; `HTMLProps`, `ComponentRenderFn`, `BaseUIEvent`, events-owned details | integration/bootstrap/events |
| `merge-props` | `merge-props/index.ts`: `mergeProps`, `mergePropsN` | events |
| `use-render` | `use-render/index.ts`: `createRender` as `useRender`, plus `HTMLProps`, `ComponentRenderFn` | render |
| `unstable-use-media-query` | local index: `createMediaQuery` as `useMediaQuery`, returning an accessor; preserve `UseMediaQueryOptions/State` and namespace; **excluded from root** | media-query |
| `direction-provider`, `csp-provider` | family-local indexes, original provider names | providers |
| `internals/composite`, `internals/use-button` | local indexes; `createButton` as `useButton`, create-style implementations with explicit aliases for source hook exports | composite |
| `internals/constants`, `internals/noop` | same stems | dom |
| `internals/createBaseUIEventDetails`, `internals/reasons` | same stems and source function/type names | events |
| `internals/csp-context`, `internals/direction-context`, `internals/labelable-provider` | local indexes; getter-backed contexts, original public names and explicit aliases to create-style helpers | providers |
| `internals/field-constants`, `internals/field-register-control`, `internals/field-root-context`, `internals/form-context` | local indexes; engine-local types and create-style registration helpers aliased to source names | field-core |
| `internals/filter`, `internals/itemEquality`, `internals/resolveValueLabel`, `internals/serializeValue` | same stems/names; Solid JSX labels | filter |
| `internals/getStateAttributesProps`, `internals/stateAttributesMapping` | same stems; transition union imported type-only | render |
| `internals/getDisabledMountTransitionStyles` | same stem | presence |
| `internals/RequestQueue`, `internals/TimeoutManager` | same stems/names | lifecycle |
| `internals/temporal`, `internals/temporal-adapter-date-fns`, `internals/temporal-adapter-luxon` | same indexes, isolated optional date peers, augmentation at `baseui-solid2/internals/temporal` | temporal |
| `internals/useBaseUiId` | `internals/createBaseUiId.ts`: `createBaseUiId` as `useBaseUiId` | lifecycle |
| `internals/useAnchorPositioning` | `internals/createAnchorPositioning.ts`: `createAnchorPositioning` as `useAnchorPositioning` | positioning |
| `internals/useAnimationsFinished` | `internals/createAnimationsFinished.ts`: same create/use alias rule | presence |
| `internals/useOpenChangeComplete` | `internals/createOpenChangeComplete.ts`: same create/use alias rule | presence |
| `internals/usePressAndHold` | `internals/createPressAndHold.ts`: same create/use alias rule | gestures |
| `internals/useRenderElement` | `internals/createRenderElement.tsx`: same create/use alias rule | render |
| `internals/useValueChanged` | `internals/createValueChanged.ts`: same create/use alias rule | state |
| `internals/useTransitionStatus` | `internals/createTransitionStatus.ts`: same create/use alias rule; shared `TransitionStatus` | presence |

The integration owner must also wire `floating-ui-react/types.ts`, `index.ts`, and `utils.ts`
as facades over these type seams and each hook owner's leaves. They are outside bootstrap's
actual `owns` allowlist despite broader planning prose. They are deliberately not written here.
Providers/tabs/slider send the integrator exact browser-stub/server-body requests for
`#prehydration/tabs/indicator` and `#prehydration/slider/thumb`; no exports point to missing files.

Index-level hook mappings are explicit as well:
- composite: `createCompositeListItem as useCompositeListItem`,
  `createCompositeRoot as useCompositeRoot`; retain native context read `useCompositeListContext`.
  Preserve `CompositeItem/List/Root`, `CompositeMetadata`, `CompositeListContext/Value`,
  `UseCompositeListItemParameters`, `UseCompositeRootParameters`, `gridNavigation`,
  `CompositeGridConfig/ItemSize/NavigationState/Navigator`, `scrollIntoViewIfNeeded`,
  `findNonDisabledListIndex` and `isListIndexDisabled` from their owning leaves.
- labelable: `createAriaLabelledBy as useAriaLabelledBy`, `createLabelableId as useLabelableId`,
  `createLabel as useLabel`; retain `useLabelableContext`, `LabelableProvider` and
  `UseLabelParameters` / `UseLabelReturnValue` aliases.
- field registration: `createRegisterFieldControl as useRegisterFieldControl`,
  `createFieldControlRegistration as useFieldControlRegistration`; retain
  `FieldControlRegistration` / `UseFieldControlRegistrationParameters` aliases.
- Context reads are already native Solid operations, so retain `useCSPContext`, `useDirection`,
  `useFieldRootContext` and `useFormContext` names. Retain `CSPContext/Value`,
  `DirectionContext/Type`, `TextDirection`, `FieldRootContext/Type`, `FormContext` and `Errors`
  (the latter aliases structural `FormErrors`). These are not reimplemented reactive hooks.

## Exact commands and current coverage

Run from the repository root. All shell commands are RTK-wrapped.

| Command | Bootstrap behavior / eventual owner |
|---|---|
| `rtk pnpm install --frozen-lockfile` | Reproducible two-package workspace install |
| `rtk pnpm typescript` | Strict TS/JSX and declaration checks, `skipLibCheck: false` |
| `rtk pnpm test:types --no-watch` | Positive/negative structural consumer fixtures, currently full strict typecheck |
| `rtk pnpm test:jsdom Bootstrap --no-watch` | Two client proof cases; family filter syntax retained for harness handoff |
| `rtk pnpm test:ssr --no-watch` | Separate Node/server compilation, one SSR proof |
| `rtk pnpm test:contracts --no-watch` | Typecheck, resolved runtime identity, native+Babel DOM/SSR compiler checks, then both proof suites |
| `rtk proxy node packages/solid/src/internals/contracts/proof/frozen-install.mjs` | Clean isolated manifest-only install with no prior node_modules and unchanged lockfile |
| `rtk pnpm test:coverage-map --no-watch` | **Reserved, exits 1** until bsolid-inventory implements full coverage mapping |
| `rtk pnpm build:package` | **Reserved, exits 1** until bsolid-dist-build produces real package artifacts |
| `rtk pnpm test:browsers <filter> --no-watch` | **Reserved, exits 1**; bsolid-browser owns final cross-browser execution |
| `rtk pnpm test:parity <filter> --no-watch` | **Reserved, exits 1**; bsolid-browser/upstream-verify own source-versus-target qualification |

`proof/run.mjs` removes `--no-watch` and invokes `vitest run`; it never treats an unmatched
filter as a pass. Remaining arguments are forwarded. `typescript` is intrinsically one-shot.
The harness owner replaces proof-only routing in coordination with the manifest owner.
No full build pipeline or package publication is represented by a bootstrap test pass.

`proof/vitest.config.mjs` uses the pinned plugin's per-environment browser/development
posture for jsdom and Node/server posture with `ssr: true` for SSR. They run in separate
processes, not a shared client/server module cache. Console spies retain their original
output and fail unexpected warnings/errors. Test-only `flush()` marks synchronous observation;
async user interactions are awaited separately. The native compiler is the Vite default;
the separate compiler smoke also checks pinned Babel output parses as JavaScript.

Real bootstrap results and source mappings are in `tracking/bootstrap.json`. Two development
fixture errors were corrected during implementation (HTML template strings are not JSX;
Vitest's CLI path is located from its exported package metadata). No diagnostics/assertions
were disabled and no external tooling blocker remains.

## Remaining gates and handoff

- `bsolid-bootstrap-command-handoff` (**integration-followup**) links command reservations,
  complete export/alias wiring and ownership transfer to `bsolid-release-ready`.
- `bsolid-bootstrap-hydration-replay` (**deferred-validation**) blocks `bsolid-hydration`:
  production SSR-to-client hydration, matching IDs, separate roots/concurrent requests,
  browser focus/selection and cleanup still require the harness/lifecycle/final-browser lanes.
- Bootstrap proves the toolchain and structural seams, not Base UI component parity.
  `bsolid-components-complete`, `bsolid-dist-pack`, `bsolid-browser`, `bsolid-accessibility`,
  `bsolid-hydration` and `bsolid-upstream-verify` remain their actual qualification gates.
- Main ticket remains in progress for orchestrator review. No reference file, original
  planning import specification, publication state or existing user file is overwritten.
