---
name: solid-v2-runtime
description: Use for all Solid V2 component, primitive, reactive demo, renderer, focus, portal, async, performance, SSR, or hydration work in baseui-solid2. Mandates V2 documentation, source-grounded reactive design, coherent repair batches, and real interaction verification.
---

# Solid V2 runtime — mandatory project practice

## Authority and preparation

1. Read project `AGENTS.md`, `docs/solid2-contract.md`, the Beads ticket, and the actual implementation and source tests in scope.
2. Consult the docs MCP with **library `solidjs`, version `2`** for the affected semantics before substantive design. Use targeted queries; do not repeatedly reread the entire documentation for a small edit. Relevant starting pages:
   - [Reactivity](https://v2.solidjs.com/concepts/reactivity)
   - [Components, props, refs, ownership](https://v2.solidjs.com/concepts/components-and-jsx)
   - [Avoid unnecessary effects](https://v2.solidjs.com/guides/avoid-unnecessary-effects)
   - [Performance](https://v2.solidjs.com/guides/performance)
   - [Debugging reactivity](https://v2.solidjs.com/guides/debugging-reactivity)
   - [createMemo](https://v2.solidjs.com/reference/solid-js/reactivity/create-memo)
   - [Async reactivity](https://v2.solidjs.com/concepts/async-reactivity)
   - [Rendering and SSR](https://v2.solidjs.com/concepts/rendering-and-ssr)
3. Verify the APIs against **installed declarations and runtime**, not remembered Solid 1 conventions. The current project targets `2.0.0-rc.13`; inspect manifests/lockfile when a task changes the toolchain. Current online V2 docs can be newer than the pin. Document a mismatch rather than assuming an unavailable API exists.
4. React `upstream/base-ui` is the behavioral oracle: observable outcomes, callback order, cancellation, attributes, focus, selection, layout, and source tests. Its hooks/lifecycle are not a Solid implementation recipe. Keep source/reference repositories read-only and never implement from the old Solid port.
5. Use RTK for every shell command and Beads for live work tracking. No indexing/initialization/refresh, commits, pushes, or publishing under this skill. Preserve concurrent work and ownership allowlists.
6. For porting, re-porting, upstream reconciliation, or source-fidelity review, also load the mandatory user-level **`react-to-solid-v2-port`** skill (fallback: `~/.config/opencode/skills/react-to-solid-v2-port/SKILL.md`). Its copy-first/minimal-adaptation method complements this skill's native runtime rules. Preserve original source organization, framework-independent algorithms/types/JSDoc and individual test assertions; do not invent replacement engines or representative suites under the guise of Solid adaptation. Existing Solid files receive scoped deltas, not destructive recopying. Pass both requirements to delegated workers.

This skill is **not** permission for a dependency upgrade, architectural rewrite, or delegation. Follow the requested scope. Generic Solid/SolidStart advice that assumes Solid 1 APIs does not override this skill.

## Choose state by its meaning

Classify each value **before** choosing a primitive:

| Meaning | Representation |
| --- | --- |
| Independent editable/event state | `createSignal(value)` or a store with a synchronous draft setter |
| Cheap derived value with one reader | Plain accessor, called in a tracking scope |
| Shared/expensive derivation or an often-unchanged output | `createMemo(compute, options)` with a justified equality boundary |
| Local override that intentionally resets when its upstream dependency changes | Function-form `createSignal(() => source())`, after verifying reset semantics |
| Necessary transition history | Pure memo over current inputs and its previous output; preserve the source's transition rules |
| Browser observation such as measured size | Signal updated by an owned external observation/lifecycle, with semantic equality |
| Imperative resource or callback | Setup-owned lifecycle and terminal effect; not a mirrored reactive state signal |

- **Do not memoize everything.** A memo adds a graph node and comparison. Name its purpose and downstream readers in the design. If it merely wraps a cheap single-reader expression, keep the accessor.
- `createMemo` receives the previous output as its compute argument. Keep the computation free of setters, callbacks with side effects, and mutation of shared state or previous output. Do not simulate React render-time `setState`.
- Function-form `createSignal` is a **writable derivation**, not a Solid 1 lazy initializer. It does not automatically implement a public controlled-component contract. Retain `createControlled` callback/cancellation/refusal behavior where required.
- A memo returning a fresh shallow-equivalent object/array defeats reference equality. Return the previous reference or compare all semantically relevant fields. An equality function must preserve order, item identity, meaningful key presence, and sparse-array behavior where applicable; never compare only convenient fields to silence a warning.
- Previous-output history is justified only when the source actually retains history. Do not invent bookkeeping if a direct derivation or writable derivation satisfies the contract. History-bearing memos must not be `lazy: true` if autodisposal would erase required history.

## Scheduling and controlled transactions

- Component setup runs once and is untracked. Keep reactive props/state reads inside JSX, accessors, or computations. Destructuring in setup creates snapshots; use `merge`/`omit` or live getters.
- Ordinary writes are staged and commit in a microtask. Calling a getter immediately after a setter returns committed state, not the proposal. Pending updater functions can compose writes.
- Carry accepted request values explicitly through same-turn algorithms. Distinguish the committed value, the accepted uncontrolled proposal, and a controlled request the parent has not accepted.
- Invoke the current callback, honor `details.cancel()`, and only then perform permitted mutation. Preserve source notification/dispatch order and reasons. A controlled refusal must not acknowledge value, focus ownership, or selection as accepted.
- Do not add `flush()` to make stale algorithms appear synchronous. Tests may intentionally flush a synchronous observation; effects/actions and ordinary interactions must follow the V2 scheduling contract.
- `preventDefault`, `preventBaseUIHandler`, and `details.cancel()` are distinct. Native `onInput` handles per-keystroke edits; callback props must remain live at invocation.

## Effects, refs, and ownership

- Use **`createEffect(compute, effect)`**. Track all inputs in the compute half. The effect half performs terminal imperative work and returns cleanup or `undefined`, not a setter's return value.
- Do not maintain `derived = f(source)` through a signal-writing effect. Readers otherwise see the new source with an old copy before the effect's write lands. Derive it directly or use a justified memo.
- Do not hide a real dependency with `untrack` to remove a diagnostic. `untrack` is for an intentional snapshot or an imperative read whose dependency is not supposed to subscribe.
- Allocate signals, memos, effects, and resources during owned setup. Ref callbacks are **untracked and ownerless**; their return values are ignored. They may record the node, but must not allocate primitives or register cleanup.
- `onSettled` performs one-time settled DOM work and returns owned cleanup. Do not allocate primitives inside its callback. Use a split effect when work must follow a changing element or policy, and return cleanup for replacement and removal.
- Register ownership once when a consumer supplies a live policy. Let readers derive from that policy rather than repeatedly publishing its current result into another signal. Identity-checked cleanup must not erase a newer registration. Preserve duplicate-owner and replacement semantics from source tests.
- Native ref arrays compose callbacks. Use the project's ref helper when its explicit replacement/null-detach contract is needed; do not add object-ref emulation everywhere.

## JSX, contexts, stores, and async

- Reactive primitives come from `solid-js`; DOM `JSX`, tag `ComponentProps`, render/hydrate/Portal come from **`@solidjs/web`**. JSX ownership is `@solidjs/web`.
- Use direct context components: `<Context value={value}>`. Preserve defaultless-context failures. Optional nesting has an explicit nullable default, not swallowed context errors.
- Keep JSX-producing children lazy under their correct provider/owner. A diagnostic comparator, metadata effect, prop enumeration, or source-display helper must not instantiate them out of owner. Do not repair an owner bug by injecting context through a side channel.
- Preserve source getter receivers. Reading `source[key]` is different from transplanting its getter onto a different object. Keep key presence distinct from an explicitly present `undefined`.
- V2 store setters take synchronous draft callbacks. Do not use Solid 1 `solid-js/store`, `produce`, or async draft setters. Preserve DOM nodes/external identities as intentional raw data.
- `For` item values are accessors; use stable keys where row identity must survive updates. Do not recreate hosts or rows just because a shallow-equivalent bag changed.
- Use V2 async computations and `Loading`/`Errored`/`Reveal` where appropriate. Preserve held updates and source validation-race behavior. Do not move work off the graph to make input seem faster, or let positioning/validation promises accidentally suspend unrelated input.
- SSR/hydration require separately compiled server and client evidence, stable namespaces/IDs, and original-node identity. Integration-only options such as `transparent` must follow pinned semantics; they are not performance/diagnostic escape hatches.

## Trace the shared read path before patching a component

For repeated click/type warnings, inspect the actual cause chain, including these shared paths:

- `packages/solid/src/internals/createRenderElement.tsx`
- `packages/solid/src/merge-props/mergeProps.ts`
- `packages/solid/src/internals/getStateAttributesProps.ts`
- `packages/solid/src/internals/use-button/useButton.ts`
- `packages/solid/src/utils/createFocusableWhenDisabled.ts`
- `packages/solid/src/internals/createTransitionStatus.ts`
- `packages/solid/src/utils/popups/createPopup.ts`

Common project-specific traps:

- Eager state/prop enumeration makes refs, children, and unrelated attributes subscribe to every field.
- Excluded render state must not be read merely to discard it. This project supports **`null` in `StateAttributesMapping`** for omission without subscribing; this is a Base UI adaptation, not a Solid API.
- Prop membership checks must honor rightmost read precedence as well as value precedence. Probing an earlier reactive source unnecessarily can widen subscriptions or recreate an owned child.
- Nested merged-proxy layers can repeatedly enumerate preceding layers. Preserve ordered merges and functional-stage replacement while measuring actual work; do not optimize away legitimate reactive key changes.
- Disabled/boundary predicates may change inputs repeatedly while their boolean result stays the same. A primitive equality gate is useful when many expensive consumers share that result.
- Text-control value projection belongs on actual input/textarea hosts, not every host sharing a state bag.
- Do not use labels/roles invented by a test. Read canonical markup: for example, the pinned Tooltip popup does not supply `role="tooltip"`.
- Do not rerun `docs/scripts/demos/migrate-remaining.mjs` to refresh a catalog; it can overwrite hand-authored corrections. Use the supported catalog generator.

## Diagnose first; batch once; verify the actual contract

For a multi-component or recurring defect:

1. **Read-only diagnosis:** reproduce trusted interactions, capture complete diagnostics/owner paths, profile the relevant workload, and map shared causes to actual consumers. Check code, source tests, and V2 docs before selecting a repair.
2. **Bounded design in Beads:** record source references, state categories, impacted files/consumers, intended semantic changes, acceptance criteria, and exact validation. Explain each memo/equality/history choice. Freeze overlapping writers before integration.
3. **One coherent implementation batch:** fix causes across the mapped files, preserve source outcomes, and add meaningful regressions. Delegate only when authorized and genuinely disjoint; do not continually spawn small fix agents.
4. **One planned integrated gate:** typecheck first. A compile failure invalidates runtime evidence and must prevent expensive runtime stages. After types pass, gather the complete failure set rather than rerunning individual green suites repeatedly.
5. **One bounded correction pass:** correct the observed set together, then verify the changed behavior. If blockers remain, retain a red gate, record the exact findings and ownership in Beads, and report the incomplete scope. Do not claim completion or silently start an unlimited patch/test loop.

For a simple local change, use the smallest meaningful check instead of invoking the whole gate.

### Required evidence

- Keep diagnostics enabled. Read `node_modules/solid-js/skills/reactivity-diagnostics/SKILL.md` for observed codes. Use attribution `why`, `costs`, and owner/cause records when needed; import folds before the interaction being measured.
- `EFFECT_RELAY_TEAR`/`EFFECT_WRITES_OWN_SOURCE`: prove whether the write copies derived state, resets an editable override, or records external observation. A screenshot alone does not establish which.
- **Measured DOM size is an external input.** Do not replace post-layout measurement with an uninvalidated DOM-reading memo or suppress the report. Preserve animation frames, cached dimensions, interruption, and cleanup; remove unnecessary readers/identical measurements and document any genuine residual measurement cost.
- `HOT_SCOPE_TIME`, `WIDE_SCOPE_DEPS`, `UNSTABLE_MEMO_OUTPUT`: profile and inspect dependencies. Keep diagnostic budgets unchanged. Prefer deterministic read-count, rerun, identity, and complexity gates over fragile elapsed-time assertions. Compare the same workload before/after; do not present reduced operation counts as measured end-to-end speedup.
- Trusted browser scenarios cover repeated click/open/close, keyboard, typing, hover, press-and-hold, focus return, caret/selection, and original control identity. Test controlled acceptance/refusal, cancellation/order, dynamic registration, and cleanup with the relevant source suites.
- Assert mounted content, opacity, nonzero geometry, and source-specific ARIA relationships when relevant. A click resolving without throwing is not a behavior check. Behavior success and diagnostic cleanliness are separate results.
- Harness disposal/timer checks must pass. For shared renderer/ownership changes, retain SSR and actual hydration identity checks. Passing jsdom is not browser qualification; representative demos do not certify every component or platform.

### Project gate and artifacts

```sh
rtk pnpm test:interactions
```

`scripts/test/runtime-interactions.mjs` coordinates types, catalog/docs checks, relevant source unit suites, SSR, targeted Chromium/hydration suites, and trusted docs gestures. It reuses a responding docs server or owns an isolated server it closes. It does not close the user's server. Current scenarios run both CSS Modules and Tailwind hero variants.

- Combined status and full per-stage logs: `docs/generated/browser/runtime-gate/`
- Native scenario diagnostics, errors, and Number Field profile: `docs/generated/browser/click-diagnostics.json`
- Browser-only replay: `rtk pnpm docs:test:interactions`

The command is a **gate**, not a guarantee that the repository is green. Inspect every exit/result, identify unexecuted coverage, and link unresolved failures to Beads. Never rewrite assertions, filter warnings, or close parent qualification issues just to make the report look complete.
