# Continue the source-parity migration — direct execution handoff

## Latest status — 2026-10-07 (supersedes runtime blockers below)

The user requested wrap-up. Runtime repairs and declared qualification are complete:

- Types: project, demos and tests pass.
- Complete jsdom: **6,428 passed**, 272 existing exclusions; zero failures/unhandled.
- Complete SSR: **132 passed**, 47 files; zero failures/unhandled.
- Appropriate complete Chromium: **7,268 passed**, 350 files; zero failures/unhandled/incomplete.
- Appropriate complete WebKit: **7,218 passed**, 350 files; zero failures/unhandled/incomplete.
- Final browser checkpoints revalidated changed transitive dependencies;40 Chromium and38 WebKit files rerun, others resumed only with matching receipts.
- Native-document Number Field: **4/4 passed** run alone. CDP/touch/pointer-lock capability exclusions are explicitly recorded, not new test skips.
- Protected filtering51 tests and real10000-item Chromium/WebKit10/10 flows clean.
- Interaction behavior48/48 passes. Diagnostic gate remains6/7 solely for the **user-accepted Collapsible layout warning**; experiments reverted.

DialogRoot's six assertions are resolved: native transitionend is a later browser dispatch checkpoint, and upstream no-animation double completion is synchronous StrictMode effect replay (pinned renderer/source evidence in dialog.json). Public useRender14 bodies, Avatar's identified gaps, Fieldset Legend actual hydration, AlertDialog's identified gaps and eight actual-control Field cases have concrete passing mappings. The Field cases exposed and repaired a genuine stale inherited-name registration bug in createField; intrinsic control-name fallback remains covered.

Retained production changes in this continuation: `FloatingFocusManager.tsx` child-removal restoration fallback and `internals/field-core/createField.ts` registration-name ownership. The observer's exact upstream/native root cause is **not proven**; user authorized retention with investigation debt.

**All follow-up debt:** `/Users/avi/avir-oss/baseui-solid2/testing-debt.md`.
**Exact final evidence:** `verification.json#/currentRepair/continuation20261007/finalQualification`.
Remaining exhaustive manual source-body inventory is still incomplete; do not call the entire migration finished. Read currentRepair overrides before historical family rows. The rest of this document is the prior session's historical handoff.

Work in `/Users/avi/avir-oss/baseui-solid2`. Finish the React-to-Solid 2 source-test parity migration and its genuine runtime failures. Do the work directly in the parent session; do not launch more agents. The previous session stopped at the user's requested logical boundary: the formerly failing **complete jsdom lane is now green**, and the repair batch has focused browser and protected-filter evidence. **The migration is still incomplete.**

## Binding constraints

- Canonical, read-only oracle: `upstream/base-ui`, commit `19511bb171f3b360b006c94cf6d07e53cb446505`. NEVER read/search/copy `ref/base-ui-solid`.
- Production changes ARE now authorized to fix source-parity defects. The old tests-only restriction is lifted. Preserve all preexisting dirty edits and every existing test, including Solid-only tests. No resets, commits, dependency upgrades, Beads, indexing/init/refresh, codemods, generated test trees, new inventory frameworks, shared setup/harness/config/package-script changes or unrelated edits.
- Every terminal command uses RTK. Dedicated file tools are available. Use targeted ccc existing-index searches with `refresh_index:false`, and fff with repository/path constraints. No indexing lifecycle commands. Avoid giant file dumps, repeated broad searches, or reading Solid internals speculatively. Inspect the actual affected source/test chunk, make justified edits, then move forward.
- Read `AGENTS.md`, `.opencode/skills/solid-v2-runtime/SKILL.md`, `docs/solid2-contract.md`, and `test/harness/README.md` once. Apply RC13 native semantics: setup runs once; props remain live; JSX-producing getters must not be read twice; resources have owned setup/cleanup; writes stage in microtasks. No React lifecycle emulation or blanket act/flush/drain.
- Never suppress diagnostics, add skips, weaken assertions, change animation durations/timeouts/tolerances/performance budgets to obtain green results. Preserve source predicates, expanded parameters, action order, callback counts/reasons/cancellation, focus, selection, attributes and host identity.
- Browser/environment exclusions, unconditional source skips, hydration, platform, temporal and type/spec classes are separate. Green test counts do not establish source-body coverage.
- No routine commentary or repeated plans. Do not ask the user to run tests. Continue until the work is complete, unless the user explicitly requests another bounded handoff.

## Protected performance work

Read `base-ui-filter-performance.md` BEFORE changes touching filtering, Combobox or Autocomplete. Preserve cached bound `Intl.Collator.compare`; query-scoped comparison reuse; short-ASCII lookup strategies, lazy storage and UTF-16 fallback; live label conversion on each required scan with NO item-to-label cache; reentrant converter correctness; bounded cache lifetimes; empty-query short circuit before conversion; exact Intl semantics, order and identity; custom/null filters, controlled acceptance/refusal and selection; current reactive query boundaries and diagnostic budgets. Do not revert to upstream's slower sliding-window loop.

This repair batch did NOT edit `internals/filter.ts` or `combobox/root/createDerivedItems.ts`. It did fix the shared `filter-dropdown/item/useFilterDropdownItem.ts` setup-time optional-owner read without changing its live owner getter or label scans.

Required checks are:

```sh
rtk pnpm typescript
rtk pnpm exec tsc --noEmit -p docs/tsconfig.demos.json
rtk pnpm test:jsdom ComboboxDerivedItems filter.test ComboboxFilter --no-watch
```

When shared interactions/filtering change, run the existing interaction gate AND real 10,000-item Combobox/Autocomplete demos in Chromium and WebKit, with diagnostics enabled. Existing independent probe:

```sh
rtk proxy node /var/folders/k1/dqkw16gn09q6492v5jn1x_jc0000gn/T/opencode/bsolid-filter-pipeline-probe.mjs
```

Do not use `--profile` timings as uninstrumented performance evidence. The no-flag probe captures behavior/errors/diagnostics and filter rerun attribution, but its comparison counters are disabled; comparison counts are protected unit-test evidence.

## Current verification — these results supersede the old red inventories

See `test/source-parity-manual/verification.json#/currentRepair` for exact commands, edited files, outcomes and historical supersession. Family ledgers contain `currentRepair` sections; do not mistake stale older red rows for current results.

- `rtk pnpm typescript`: PASS.
- `rtk pnpm exec tsc --noEmit -p docs/tsconfig.demos.json`: PASS.
- `rtk pnpm test:types --no-watch`: PASS.
- Complete `rtk pnpm test:jsdom --no-watch`: **6,396 passed, 0 failed, 272 skipped; 314 files, 311 passed/3 excluded; 0 unhandled**. Log: `/Users/avi/.local/share/opencode/tool-output/tool_11758f55f001W5j4k9pRYcmO1v`. Only a TS narrowing capture of the identical floating host followed this whole-suite run; the later integrated types/jsdom checks also pass.
- Protected filter command: **51 passed, 5 files, 0 failed/skipped/unhandled**.
- Chromium repair selection (Menu.review, NavigationMenu.review, ScrollArea.test, ProgressLabel, SliderControl.review, DialogRoot.detached-triggers): **515 passed, 1 excluded, 6 files, 0 failed/unhandled**. Exact command is in verification.json.
- `Dialog.browser.test.tsx`: **46 passed, 0 failed/unhandled**. The display:contents crash is FIXED.
- `AvatarEndpoint` Chromium: **2 passed, 0 unhandled**. Its hydration error is FIXED.
- Native-document `rtk pnpm test:chromium:native NumberField.browser --no-watch`: **4 passed, 0 failed/unhandled**, with no Number Field edits in this batch. This supersedes the historical native 2 passed/2 failed, 10 vs651 finding. Ordinary iframe pointer-lock capability is still a separate lane concern.
- Latest DialogRoot targeted Chromium: `rtk pnpm test:chromium packages/solid/src/dialog/root/DialogRoot.test.tsx -t "keyed generated|externally-opened|completed exit" --no-watch`: **6 passed, 6 failed, 134 filtered-out, 0 unhandled**. Three keyed label cases and three animated-open cases pass; six callback-count cases below remain red.
- `rtk pnpm test:interactions`: **6/7 stages PASS**. Types, catalog, docs, jsdom (3407 passed/110 excluded), SSR (42 passed/14 files), and Chromium (149 passed/10 files) pass. Interaction demos: **48/48 behavior checks pass; 46/48 diagnostic-clean**, failing only the two Collapsible styles below. Evidence: `docs/generated/browser/runtime-gate/summary.json`, `interactions.log`, and `docs/generated/browser/click-diagnostics.json`.
- Independent real-list probe: **10/10 inspected records clean**, covering simple Combobox plus four 10,000-item virtualized demos in both Chromium and WebKit. Input identity, nonzero geometry, `9→99→999`, ArrowDown/Enter selection, Escape, and disposal checked. Filter-rerun sums: Chromium autocomplete CSS4.5ms/Tailwind4.3ms, combobox CSS3.1ms/Tailwind3.2ms; WebKit5/4/3/5ms respectively. No warnings or page errors. This was one sweep, NOT the historical two-pass20/20 report.
- Scoped diff whitespace checks and the nine updated JSON ledgers parse.

The complete browser runtime selection has NOT been executed after this repair batch. Do not claim full Chromium/WebKit qualification.

## Repairs completed — do not rediscover or revert these

Production:

1. `menu/trigger/MenuTrigger.tsx`: initial handle validation now short-circuits on an existing root; only the no-root initial boundary intentionally snapshots the handle. The live store accessor still follows later handle migrations.
2. `menu/filter-root/MenuFilterImpl.tsx`: FilterList refs compose through a live merged getter, rather than evaluating `props.ref` in setup.
3. `filter-dropdown/item/useFilterDropdownItem.ts`: only the initial optional-context ancestry policy is snapshotted; `owner()` stays live. These three repairs eliminated the former Menu strict-read failures.
4. `floating-ui-react/components/FloatingFocusManager.tsx`: sibling/inert marking waits for the queued settled DOM adoption checkpoint. A ref can report a template-owned node whose inert document has no body, before its ancestor/Portal adopts it. Do not paper over this by guessing global document. Acquisition is canceled if superseded; acquired marker locks are still released. The narrowed floating host is captured before the callback. Initial/return focus policies are retained.
5. ProgressRootContext, SliderRootContext and all three ScrollArea context hooks now explicitly reject missing providers with exact upstream Base UI strings. They return no sentinel to parts; required-context failure remains loud. Existing hook-only tests were retained.

Fixtures/tests:

- `menu/Menu.review.test.tsx`: source mousedown opens on RAF, so native user.click is followed by findByRole for relevant pointer-open item cases. No blanket frame drain. The controlled-query and Turkish fixtures restored the omitted source Actions Trigger; controlled query also restores source input.focus and real-position visibility observation. Filter algorithm is untouched.
- `navigation-menu/NavigationMenu.review.test.tsx`: pinned Content source lines132–183 uses **fireEvent.click**, not user.click's additional hover/patient-click interactions. Both synthetic clicks and containment observations are now faithful; no NavigationMenu production fix was needed.
- `scroll-area/ScrollArea.test.tsx`: React pointerover→synthetic pointerenter is adapted to **native pointerenter on Root**, preserving the source path observation. Native pointerleave dispatches on Root. Nested missing-context fixtures use Errored to capture the exact source exception without halting the whole reactive root.
- `dialog/root/DialogRoot.detached-triggers.test.tsx`: instrumentation proved the leaked timer was **jsdom SelectionImpl._associateRange scheduling selectionchange via setTimeout(0) during focus**, not an owned component timer. The overlap test controls only requestAnimationFrame/cancelAnimationFrame now, since it only needs the transient-root warning frame. Native timeouts keep their real clock. Instrumentation/logging was removed; no drain/suppression was added.
- `test/harness/AvatarEndpoint.browser.test.tsx`: retained ALL original DOM identity/IDs/cache/loaded-callback assertions, then awaits emitted native hydration bootstrap `done=true` before restoring the prior global state. Immediate restoration had deleted _$HY while the runtime's completion was still pending.
- `dialog/root/DialogRoot.test.tsx`: SourceFixture now respects explicit null children. Its JSX-producing popupContent getter is read **once**, via a cheap accessor; an earlier double-read experiment instantiated an abandoned Labels owner and left stale ARIA registrations. Corrected keyed-label cases pass in both lanes. The exit-transition case asserts initial computed opacity1 and independently counts native transitionend, retaining the source consumer callback count too.

Exactly nine production files and six test files changed in this repair batch; their paths are listed in verification.json. Standard evidence artifacts were regenerated by the existing interaction gate. The repo was already heavily dirty before this work; git's total diff is NOT an attribution of all changes to this batch.

## Next coherent block: remaining verified runtime failures

### DialogRoot — six Chromium assertions, not the fixed focus/ARIA cases

Target `packages/solid/src/dialog/root/DialogRoot.test.tsx`, three trigger graphs: contained, detached, multiple-detached.

1. `completed exit transition preserves accessible popup until its transitionend`: native transitionend AND consumer callback counts are **0 instead of1**. The CSS duration remains source200ms. Initial computed opacity1 is now observed; explicit source null children are retained. The popup remains accessible initially after close and eventually becomes inaccessible, but the browser emits no observed transitionend before that. Independent native listener also stays0, so this is NOT just camel-case handler forwarding. Investigate closing/presence/animation completion timing; do not simply fabricate an end event or wait extra arbitrary time.
   - Source: `upstream/base-ui/packages/react/src/dialog/root/DialogRoot.test.tsx:820-862`.
   - Shared paths already inspected: `internals/createAnimationsFinished.ts` (finite animation finished promises, replacement rejection handling, queued completion), `internals/createOpenChangeComplete.ts`, `utils/popups/createPopup.ts`, `internals/createUnmountAfterClose.ts`, `internals/createTransitionStatus.ts`.
   - Do NOT assume a next-frame delay is correct: the source helper explicitly completes before paint and source/native ordering must be checked.
2. `externally-opened completion animation=false`: count **1 instead of2**; first call true is correct. Animated variants pass. Source **really asserts2** at lines1400–1424; the previous agent did not invent that count. Source createRenderer wraps act around render/setProps; React StrictMode/effect replay might be involved but this has NOT been proven. Do not declare a React-only exception or introduce duplicate callbacks solely on that hypothesis. Preserve all existing target-only once-per-cycle/cancellation/animation tests and native semantics.

### Collapsible — real demo diagnostics

The only failed integrated stage contains **EFFECT_RELAY_TEAR** on `createControlled.local → createCollapsiblePanel.dimensions` in both CSS Modules and Tailwind. All48 behavior scenarios pass and errors arrays are empty. Full diagnostic and owner paths are in `docs/generated/browser/click-diagnostics.json`; short summaries in `docs/generated/browser/runtime-gate/interactions.log:10-11`.

Affected path: `packages/solid/src/collapsible/panel/createCollapsiblePanel.ts`. Existing code treats dimensions as an external post-layout input, uses semantic height/width equality, measures scrollHeight/scrollWidth, and clears dimensions on certain completion/none-motion paths. **Measured geometry is not a pure source derivation.** Do not follow the diagnostic wording blindly into a DOM-reading memo, suppress it, disable diagnostics, or change budgets. Verify the actual repeated read/write cause and close/ending/completion measurement lifetimes; inspect Accordion consumers too if the shared primitive changes. No Collapsible production changes were made in the repair batch.

### Lane accounting

`test/integration/RootExports.test.ts` imports `node:child_process`: it is Node-only, not a browser runtime component failure. Its old inclusion by the browser runner must not lead to config/runner changes or skipped evidence. Verify in its proper existing lane. Browser pointer-lock behavior belongs to the existing native-document lane. Complete regular/native selections using the runner's existing selection/checkpoint facilities, preserving per-file process isolation; allow enough elapsed time or retain background logs yourself instead of asking the user.

## Then finish manual source-to-target comparisons

Reuse `test/source-parity-manual/*.json`, including heterogeneous schemas and `conformance.json`; do NOT normalize/build inventory tooling. Read the next outstanding source body and the actual mapped Solid body, expand parameters and imported helper invocations with their exact options, add only confirmed missing assertions/actions, repair true production failures, update that family's concrete evidence, and move onward. Whole-file green tests and matching titles never close missing/partial rows.

Known outstanding scopes from the previous sweep:

- Popover: old ledger reported181 missing/84 partial expanded direct cases. Tooltip35 partial and hydration obligations. Number Field279 partial/missing rows. Tabs77 gaps. These counts are historical ledger findings, not new exhaustive totals.
- Combobox/Menu/Select inventories and their large Root/Input/helper-wrapper/platform/SSR/hydration scopes remain incomplete.
- Field/Form actual-control debounce/name/baseline/custom-validity, hydration, shadow portal/keyed/control-handler cases; Fieldset Legend hydration association.
- Avatar source-change/error-delay/cache/timing/CSS gaps; Collapsible motion/race/disabled/controlled and React.Activity distinctions.
- Drawer large gesture/popup/keyboard suites, NavigationMenu root/WebKit/layout/custom-trigger sequences, OTP normalization/completion/context/SSR mapping.
- AlertDialog handle/remount/nesting/completion, ContextMenu error/default-open/touch restart, Menubar exact keyboard/focus tails, PreviewCard root/detached/viewport/layout sequences.
- Toast part/provider/use-manager suites and real rendered-title/timing interactions; Floating hooks/components/safePolygon/WebKit; utils/internals Composite/label/temporal helper expansions.
- Public use-render: source14 runtime bodies were read, but prior ledger has6 partial equivalents/8 missing; internal createRenderElement tests are NOT automatically public useRender parity. Prior worker incorrectly treated absence of a family-local suite as a blocker—resolve supported public coverage deliberately in a hand-authored allowed test location, without generated trees or hidden title-only substitutes.
- Preserve all target-only tests. Account genuine React-only capabilities with precise evidence; no fake passing fixtures.

Finish criteria remain: every scoped source runtime file/expanded case compared, supported missing behavior addressed, retained/added tests passing in declared lanes without unexpected diagnostics/leaks/unhandled errors, protected filtering evidence green, existing functionality intact, and ledgers current. After the final edit pass, types first, complete jsdom and appropriate complete browser selections in parallel, native pointer-lock separately, correct failures and rerun only affected checks. Do not call an intermediate batch or incomplete ledger the finished migration.
