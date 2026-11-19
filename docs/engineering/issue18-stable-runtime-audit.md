# Issue #18: pinned stable runtime characterization

2026-11-19. Completed runtime-claim audit, verified Switch/Radio cleanup, and
current-version comment corrections. Every original listed claim has a retain,
remove or corrected-explanation decision below. This is not full package qualification.

## Authority and execution

- Read [#18](https://github.com/unstyled-solid/base-ui/issues/18): report explicitly
  says none of its claims were initially verified; it has no comments or linked PR.
- Read #15 and its correction comment: `resolvePopupLabel` and `FloatingTree`
  already use transparent client-only effects. No changes needed there.
- Reviewed related upgrade PRs #10/#13 and their issue/review comments: deployment
  bot comments only, no additional runtime review findings.
- Consulted indexed `solidjs@2` testing/reactivity/composition docs and installed
  2.0.3 declarations/runtime/CHEATSHEET. Runtime-only tests import Solid/web
  directly. Separately named consumer tests import the actual Base UI helpers
  and components; they are not evidence about Solid alone.
- Compiler/Babel 2.0.2, installed Solid/web/signals 2.0.3; dedicated Vitest config,
  one worker, jsdom client and separately compiled Node SSR lanes.

```sh
rtk proxy pnpm exec vitest run --config test/runtime-stable-characterization/issue18.config.ts
rtk proxy env ISSUE18_SSR=1 pnpm exec vitest run --config test/runtime-stable-characterization/issue18.config.ts
```

Files under `test/runtime-stable-characterization/`:

- `issue18.dom.test.tsx`: 16 Solid-only cases.
- `issue18-followup.dom.test.tsx`: 7 runtime/native-input/user-event cases.
- `issue18-consumers.dom.test.tsx`: 15 actual merged-ref, Combobox, animation and OTP cases.
- `issue18-native-input.dom.test.tsx`: 2 actual Switch/Radio cases.
- `issue18.ssr.test.tsx`: 5 SSR runtime cases.

These are opt-in isolated tests;
the normal suite include patterns do not discover this directory.

Executed results: **40/40 client cases passed, 5/5 SSR cases passed** after source
cleanup; no runtime diagnostics appeared in the final characterization runs.
`rtk pnpm typescript` passed, including correction of the reported TS2352 cast.
Initial probes disproved the checkbox/radio empty-string and ordinary-event
readonly-method hypotheses; assertions record observed stable behavior. The
merged-ref negative test catches/asserts the exact consumer `NoOwnerError` at its
source, avoiding an intentionally crashing callback halting the rest of the suite.

## Complete claim inventory and decisions

Paths below are relative to `packages/solid/src`; test names are literal or
distinctive prefixes from the new suite.

| Sites / claim | Stable evidence | Decision |
| --- | --- | --- |
| `switch/root/SwitchRoot.tsx:76`, `radio/root/RadioRoot.tsx:43`: removed spread value becomes empty | Simplified runtime probe, exact source ternary/spread-order probes, and actual component omission/replacement/empty-string/FormData/reset tests all restore `on` and remove the attribute | **Removed only the two obsolete effects.** Real-component baseline and in-memory removal counterfactual both passed before source editing. Post-edit actual component tests and focused suites pass; details below. |
| `internals/createRenderElement.tsx:158`, `scroll-area/utils/registerPart.ts:13`, `menu/trigger/MenuTrigger.tsx:131`, `utils/createMergedRefs.ts:14`: no removal ref, ignored return | `refs receive neither null nor returned cleanup…` proves both conditional host removal and owner disposal | Retained explicit detach/observer/registration teardown. Updated comments to verified 2.0.3. |
| `utils/createMergedRefs.ts:28`: native refs ownerless | Native ref reads provided context; actual merged refs throw `NoOwnerError` on attachment, retained-host callback replacement, and disposal; setup-captured context works throughout | **Retain adapter behavior, correct explanation.** Its ownerless dispatch is an established package contract, not native emulation. Source comments and contract now state this explicitly. See upstream/API decision below. |
| `field/control/FieldControl.tsx:28`: native defaultValue | `defaultValue updates the reset baseline without replacing a dirty text value` | Retained uncontrolled `defaultValue` projection; updated version wording. |
| `slider/thumb/SliderThumb.tsx:156`: SSR defaultValue key precedence | SSR `SSR spread defaultValue key presence…`: present undefined masks value, present string wins, absent key preserves value | Retained SSR omission; updated version wording. |
| `internals/createRenderElement.tsx:173`: disabled delegation | `delegated input skips disabled node…`: direct listener and ancestor run, disabled target delegated handler does not; enabling restores it | Retained native input bridge; updated version wording. Synthetic jsdom dispatch, not real autofill qualification. |
| `internals/labelable-provider/LabelableProvider.tsx:35`: keyed construction precedes cleanup | `keyed replacement constructs before predecessor cleanup`: setup a, setup b, cleanup a | Retained candidate/token separation; updated version wording. No assumption about intermediate shared-ID propagation is needed. |
| `slider/control/SliderControl.tsx:173`: server cleanup | SSR `server onCleanup runs at render disposal` | Retained server guard; updated version wording. |
| `dialog/store/DialogStore.ts:63`, `tooltip/store/TooltipStore.ts:92,95` | `signal updaters accumulate pending writes…`: ordinary store/effect consumers remain committed until flush | **Retain accepted-proposal handoff.** Comments now name verified 2.0.3 staging. Shared transaction windows already received the separate #17 held-batch-aware changes. |
| `number-field/root/NumberFieldRoot.tsx:119`, `checkbox/root/CheckboxRoot.tsx:226`, `checkbox-group/CheckboxGroup.tsx:43` | Same staged-write test | **Retain imperative proposal/DOM acknowledgement logic.** Updated NumberField/Checkbox explanations; preserved #17's already-corrected CheckboxGroup comment and `onSettled` lifetime handling. |
| `context-menu/trigger/ContextMenuTrigger.tsx:25` | `ref-written state remains staged with insert before render flush` | Retained raw host and updated version. Normal render flushes before returning; this test preserves precommit timing. |
| `otp-field/input/OTPFieldInput.tsx:27` | Same staged-write test | Retained imperative IME transaction flag; updated explanation to staged 2.0.3 reads. |
| `otp-field/root/OTPFieldRoot.tsx:253` | Actual CompositeList update observes `[length,count]=[1,2]` before `[1,1]`; deferred connected-node count sees `[1,1]`. Actual OTP emits no warning for coordinated slot/length shrink and still warns for a genuine mismatch | **Retained generation/disposal guards and deferred connected-node validation.** Updated comment to verified 2.0.3 publication behavior. |
| `internals/createAnimationsFinished.ts:14` | Chained microtasks let callback 2 observe callback 1's commit; prequeued callbacks do not. Actual helper `batch=false` sees committed 1, `batch=true` sees 0; abort and disposal between promise completion and delivery prevent callback | **Retained queue and cancellation checks.** Updated version wording. This proves scheduling with an empty animation list, not browser animation-engine behavior. |
| `combobox/list/ComboboxList.tsx:16` | Actual List renders ordinary item callback twice, provider subtree once; default/rest-parameter callbacks receive no items. Explicit Collection renders default/rest/zero-arity callbacks once per item | **Retain existing convention without a breaking API change.** Corrected implementation comment and documented public children JSDoc/contract: explicit Collection handles arbitrary callback signatures. This is a Solid-specific adaptation, not a runtime guarantee. |
| `merge-props/mergeProps.ts:122` | `foreign changing-key proxy with $PROXY=…`: unbranded merge/omit caches old keys; branded sees replacement keys | Retained `$PROXY` identity marker; updated version wording. |
| `merge-props/mergeProps.ts:31` | Native input and keyboard events have no own preventDefault; user-event simulated Tab has a non-writable/non-configurable own method and respects cancellation | **Retain descriptor-safe handling; remove unsupported attribution to RC13.** The reproduced source is user-event's `event/dispatchEvent.js:32`, not stable delegation. |

Additional merge test confirms explicit undefined masks defaults, own-key presence
survives, and source getter `this` is preserved through merge/omit.

All retained runtime-version comments above were changed to Solid 2.0.3;
readonly-event attribution was narrowed to the actually reproduced user-event source.

## Completed label-only inventory

The issue's “31” is not an acceptance count: the initial literal source search also
finds `select/Select.typecheck.mjs`, `internals/contracts/core.ts` and
`internals/contracts/events.ts` (32 non-test RC-comment matches including those).
All listed compensating-code sites above were inspected in context.

- Label/provenance only: `utils/createSwipeDismiss.ts:1`,
  `internals/composite/list/CompositeList.tsx:1`,
  `floating-ui-react/hooks/createFloating.ts:1`. Updated to “native Solid 2”
  rather than claiming these algorithms were newly validated.
- `utils/createId.emit.tsx:6`: stable SSR probe confirms export, within-request
  uniqueness and between-request determinism; updated error to “Expected pinned
  Solid 2 server ID export”. This does not claim full ID hydration coverage.
- `select/Select.typecheck.mjs:4`, `toolbar/link/ToolbarLink.spec.tsx:5`: changed
  historical current-run labels to “pinned Solid 2”; no reason to claim new
  Select/Toolbar behavioral qualification. Whole-workspace typecheck passed.
- `internals/contracts/core.ts:9` and `events.ts:14`: assignment refs, nested ref
  arrays/order/context/ignored returns and bound event payload/currentTarget
  are now characterized; updated labels to pinned Solid 2.0.3 contracts.
- Also corrected the label-only `accordion/root/AccordionRoot.spec.tsx:4` reference.
- `scripts/distribution/build/build.test.mjs`: renamed the emitted-declaration
  test to “actual emitted pinned Solid 2 package declarations”; preserved #16's code.
- Corrected AGENTS donor version and replaced contract's historical RC13 evidence
  paragraph with a link to current tests. Historical upgrade reports stay historical.

## Closed composition decisions against upstream and the existing API

**Merged refs:** `createMergedRefs.lifecycle.test.tsx` already explicitly requires
ownerless attachment/replacement/disposal. That is a library policy, not a stable
Solid requirement. The new consumer test demonstrates its cost: calling
`useContext` in a Base UI ref fails where the same native ref succeeds. Callbacks
can capture context in setup; the added positive consumer test proves that contract.
Pinned React `packages/utils/src/useMergedRefs.ts:95–149` establishes synchronized
attachment/replacement/disposal, but no Solid owner/context guarantee. It supports
React callback-return cleanup; this port intentionally follows Solid's ignored
return convention and explicit null-detach policy instead. The existing native
adaptation's four lifecycle tests explicitly require ownerless dispatch and pass.
**Decision: retain its behavior, correct the false native-parity explanation, and
document setup context capture.** Changing it solely because stable native refs
retain context would break a tested package contract; it is not a dead workaround.
Do not blindly use
`runWithOwner(capturedOwner)` on teardown: stable marks owners disposed before
cleanup and reports `RUN_WITH_DISPOSED_OWNER`. `runRefCallback` is internal; its
primitive-creation guard is not reproduced by ordinary `untrack` alone.

**Children:** no public runtime discriminator distinguishes every lazy JSX thunk
from every user payload callback. Default and rest arguments can have arity zero;
provider output can be an unbranded zero-arity accessor. `children()` normalizes
JSX but cannot recover the user's intended payload signature. Existing explicit
`ComboboxCollection` resolves the ambiguity and is verified. Pinned React
`packages/react/src/combobox/list/ComboboxList.tsx:52–61,128–133` classifies any
function as an item template because React JSX is not represented by functions.
Transplanting that predicate would incorrectly expand native Solid providers as
item callbacks. **Decision: preserve the existing nonzero-arity implicit-template
adaptation and document it in public children JSDoc and the contract.** Explicit
Collection preserves upstream item/index callback behavior for default/rest/zero
signatures; all three now have actual-component coverage. No private runtime
branding, eager payload probing, new marker prop or breaking behavior was added.

## Integrated Switch/Radio cleanup and execution

Removed exactly the two `createEffect` blocks whose sole operation was
`removeAttribute('value')` for undefined values. No other effects, imports,
proposal windows, native event-deduplication microtasks or composition code changed.
Both files still use `createEffect` elsewhere, so their imports remain.

Before editing, the two actual-component tests passed both normally and with a
temporary Vite transform removing only the exact effect text before compilation.
The transform guarded source identity and was deleted after applying the real
removal; it is not a maintained alternate implementation.

```sh
rtk proxy pnpm exec vitest run packages/solid/src/switch/root/SwitchRoot.test.tsx packages/solid/src/switch/thumb/SwitchThumb.test.tsx packages/solid/src/switch/Switch.integration.test.tsx packages/solid/src/radio/root/RadioRoot.test.tsx packages/solid/src/radio/indicator/RadioIndicator.test.tsx
rtk proxy node scripts/test/run.mjs chromium --grouped packages/solid/src/switch/root/SwitchRoot.test.tsx packages/solid/src/switch/Switch.integration.test.tsx packages/solid/src/radio/root/RadioRoot.test.tsx
rtk proxy node scripts/test/run.mjs chromium --grouped packages/solid/src/radio/indicator/RadioIndicator.test.tsx
rtk pnpm typescript
```

- jsdom: **117 passed** across five existing files. Runner accounting: 6 skipped;
  all six are lane-routed cases subsequently executed in Chromium (two Switch
  native-form cases and four Radio indicator animation cases).
- Chromium: **96 + 16 passed**, zero skipped, across four affected files, including
  native validation/submission/reset. The runner also compiled an isolated SSR
  fixture; that preparation is not a claim of a hydration replay.
- Vite emitted its existing dependency dynamic-import-analysis warning for
  `@solidjs/web`; the browser harness reported zero unhandled errors.
- Whole-workspace TypeScript passed after the edits.

## Final focused checks and scope

```sh
rtk proxy pnpm exec vitest run packages/solid/src/utils/createMergedRefs.lifecycle.test.tsx packages/solid/src/combobox/collection/ComboboxCollection.test.tsx
```

The existing merged-ref and Collection suites passed **8/8**, retaining lifecycle
and row-ownership behavior. The Collection suite emits intentional why-run traces,
not failures. Whole-workspace typecheck passed after comment/JSDoc changes.

```sh
rtk pnpm docs:api
rtk pnpm docs:api:check
rtk proxy node --test --test-name-pattern 'production probe typechecks' scripts/distribution/build/build.test.mjs
rtk git diff --check
```

Regenerated API docs after documenting the existing children/ref contracts; the
check passed for 79 entrypoints and 7,743 exports. Generated output also reflects
the shared branch's concurrent source/type corrections. The renamed emitted-package
declaration probe passed both its Bundler and NodeNext checks (one test). Diff
whitespace validation passed.

The dedicated characterization configuration intentionally stays isolated from
the full package gate; its two documented commands are the reproducible runtime
upgrade check. #17's already-integrated `onSettled` proposal lifetime changes and
Switch's native event-deduplication microtask are preserved. Historical upgrade
reports remain historical. No original #18 claim is left without a decision;
package-wide release/hydration qualification is a separate integrated gate.
