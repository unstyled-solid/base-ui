# Solid 2 contract — stable 2.0.3

Read the indexed `solidjs@2` docs through the docs MCP and pinned package declarations. Before runtime work, load the mandatory project skill [`solid-v2-runtime`](../.opencode/skills/solid-v2-runtime/SKILL.md). This contract is for a **React-to-Solid 2 implementation**, not an old Solid port migration.

| Concern | Required implementation |
|---|---|
| Imports/types | Reactive primitives from `solid-js`; DOM JSX/ComponentProps/render/hydrate/Portal from `@solidjs/web`; `jsxImportSource: @solidjs/web`. |
| Execution | Component setup runs once. Do not destructure reactive props into snapshots. Use live property reads/accessors. |
| Derived data | Plain accessor or shared memo; never relay derived state through a signal-writing effect. |
| Controlled state | Live external accessor plus local uncontrolled state and intentional initial snapshot. Call the current change handler, honor cancellation, then stage permitted local changes. Writable derivations do not imply permission to override a controlled value. |
| Scheduling | Ordinary writes commit in a microtask. Updater functions compose pending writes; getters still see committed values. Carry request values explicitly through same-turn algorithms. No blanket `flush`. |
| Stores | `createStore` from `solid-js`, draft setter callbacks. Keep DOM nodes and external object identity out of accidental deep proxies. |
| Effects | `createEffect(compute, effect)`: all tracked inputs extracted in compute, terminal imperative work in effect, cleanup returned. Effect callback must return cleanup or undefined, not a setter value. |
| Lifecycle | Setup allocates primitives; `onSettled` performs one-time settled DOM work and returns cleanup. Neither its callback nor ref callbacks are places to create primitives. |
| Label ownership | A mounted label's candidate ID is distinct from the shared registered ID. Preserve retained/shared-label precedence; derive selection from active owner registrations with token-guarded cleanup. Keyed setup/cleanup ordering and intermediate staged clears must not decide identity. |
| Refs | Ref callbacks are untracked and retain creating context in stable 2.0.3; primitive creation there is forbidden and return values are ignored. Own attachment/disposal in setup; handle replacement and removal explicitly. |
| Merged refs | The package's existing merged-ref adapter deliberately dispatches callbacks ownerless on attachment, replacement and null-detach. Capture context during setup. This adapter policy is distinct from native ref context retention; returned cleanup remains ignored. |
| Context | `<Context value={...}>`. Missing defaultless context throws. Optional nesting context uses a deliberate null default, never swallowed errors. |
| Composition | Render callback receives live prop/state objects. Preserve source getter receivers; no descriptor transplant. Prop/state changes must not recreate the host or lose focus/selection. |
| Combobox children | Native JSX may itself be an unbranded zero-arity accessor. List's implicit item-template convention requires a nonzero declared arity. Use explicit `Combobox.Collection` for zero-arity/default/rest-parameter templates; it invokes all signatures with item/index. Do not replace this convention with private runtime branding or eager evaluation. |
| Merging | Solid `merge` is not Base UI `mergeProps`: implement event/class/style ordering and cancellation explicitly. An explicitly present undefined masks ordinary defaults. |
| Events | Native events, `onInput` for per-keystroke input where React synthetic onChange supplied that behavior. Current callbacks read at invocation. Delegation belongs to roots, not one global document. |
| Portals | Verify the pinned Portal API. Use a real owned HTMLElement container inside ShadowRoot where mount requires Element; do not cast ShadowRoot into Element. Preserve context, owner document, nested ownership, explicit-null waiting and root event behavior. |
| IDs | Verify `createUniqueId` through the pinned declarations and browser/server runtime. Prove hydration/multiple-root/request isolation; no random/global counter substitute. |
| Async consumers | Honor host Loading/Errored and held updates. Do not turn validation or positioning promises into implicit suspending computations that stall normal input. Preserve source async-validation race semantics explicitly. |
| Testing | Use browser/development conditions for DOM tests, separate server compilation for SSR. Flush only intentional sync test observations; await asynchronous work separately. Fail unapproved dev diagnostics. |

## Evidence read
- https://v2.solidjs.com/concepts/reactivity
- https://v2.solidjs.com/concepts/components-and-jsx
- https://v2.solidjs.com/concepts/async-reactivity
- https://v2.solidjs.com/concepts/rendering-and-ssr
- https://v2.solidjs.com/guides/custom-primitives
- https://v2.solidjs.com/guides/testing
- https://v2.solidjs.com/guides/avoid-unnecessary-effects
- https://v2.solidjs.com/guides/performance
- https://v2.solidjs.com/guides/debugging-reactivity
- https://v2.solidjs.com/reference/solid-js/reactivity/create-memo
- https://v2.solidjs.com/reference/solid-js/reactivity/create-signal
- https://v2.solidjs.com/reference/solid-js/stores/merge
- https://v2.solidjs.com/reference/solid-js/components-context/create-context
- https://v2.solidjs.com/reference/solid-web/components/portal

Current pinned-runtime characterization lives in `test/runtime-stable-characterization/issue18.*.test.tsx`; commands and claim-by-claim findings are in [the issue #18 audit](engineering/issue18-stable-runtime-audit.md). Stable 2.0.3 confirms staged signal/store reads, pending updater accumulation, split-effect disposal, explicit-undefined merging, ref removal semantics, disabled-node delegation and SSR default-value precedence. Checkbox/radio spread-value removal now restores native `"on"`, and native refs retain creating context: historical RC explanations must not override those observations. The earlier isolated RC13 probe is historical evidence only. These isolated tests do not replace component, browser or hydration qualification.
