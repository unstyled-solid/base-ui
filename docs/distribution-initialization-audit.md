# Distribution initialization audit — Solid 2 RC13

The staged ESM package uses `sideEffects: false`: unused modules can be omitted
without losing externally observable import-time work. This is module metadata,
not a claim that every function call is pure.

## Audited authored initialization

`scripts/distribution/build/initialization-census.mjs` enumerates module-level
calls, construction and expression statements. Function bodies and instance
fields execute when invoked/constructed, not when their module loads.
The independent consumer's `initialization.mjs` checks the actual installed
runtime files against these audited categories and rejects unknown initialization.

- Context modules call RC13 `createContext`: installed `solid-js/dist/solid.js`
  creates a local Symbol and provider closure; ownership begins when the provider
  is called. No registration, listener or reactive computation runs at import.
- Map/WeakMap/Set/WeakSet and Symbol initializers create module-local state.
  Empty caches/locks are consumed only by referenced exported code.
- `utils/createAnimationFrame.ts` constructs a Scheduler containing an empty
  callback map and fields. It requests native animation frames only in request;
  cancel/disposal cancels the last owned request.
- `utils/createLogOnce.ts` allocates a local development-only deduplication Set.
  `utils/error.ts` and `utils/warn.ts` create closures; logging occurs on call.
- `utils/formatErrorMessage.ts` creates a formatter closure; URL allocation and
  formatting happen on call.
- `utils/empty.ts` freezes newly allocated local objects/arrays.
- `scroll-area/root/stateAttributes.ts` builds closures over literal attributes.
- PopupHandle, ToastStore, RequestQueue and TimeoutManager instance fields are
  constructor-time state, not global effects.
- `utils/styles.tsx` only allocates a registry on import. Style insertion and
  leasing occur inside the mounted component's effect; cleanup releases/removes
  the final lease. Hover/listener/scroll-lock/timer effects likewise run through
  invoked setup/event code rather than module evaluation.

## Compiler output

Pinned Babel RC13 emits PURE-annotated DOM `template` factory calls. Installed
`@solidjs/web/dist/web.js` returns a closure and delays document/template creation
until that closure runs. SSR symbols and assignments to compiler-local prototype
constructors do not mutate external objects. No added blanket purity annotation
is required or justified.

The audit found test-only `FieldHydrationFixture.tsx` and
`Tooltip.hydration-fixture.tsx` compiled with module-level `delegateEvents`, plus
plural fixture naming that escaped the original source filter. Runtime and
declaration builds now exclude these naming forms. No production file currently
requires an import-time side-effect allowlist.

## Required regression evidence

Use the packed consumer runner with stock registry peers. The unused-import
bundle must contain zero library modules, root/subpath Toggle module graphs must
match, and unrelated families/optional adapters must disappear. Execute optimized
native events/disposal and optimized SSR/hydration/style/CSP checks. Resolution
must agree with RC13's worker-before-browser behavior; mixed worker conditions
execute SSR rather than a DOM hydration fixture.

This audit does not complete the exhaustive upstream behavioral case inventory.
