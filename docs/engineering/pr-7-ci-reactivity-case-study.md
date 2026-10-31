# PR #7: CI failures, reactive dependency leaks, and migration lessons

## Status and scope

Repository: `unstyled-solid/base-ui`.
PR: <https://github.com/unstyled-solid/base-ui/pull/7>.
Branch: `ci/github-actions`.
Investigation date: 2026-10-31.

This is an evidence record and engineering retrospective, not a claim that every
component has release-qualified parity. Beads remains the authoritative work
tracker. The PR gate runs full jsdom and SSR suites, targeted Chromium tests,
and all supported docs gesture scenarios; it is not exhaustive multi-browser
qualification.

**Current checkpoint:** `3cbd0d176d45c2e4432347a0d1a2dc876b9fcb74` fixed the
Collapsible failure and passed the complete local CI sequence. Its GitHub run
failed on Menu ref recomputation and NumberField input projection diagnostics.
The bounded shared-renderer repair has now passed the complete local CI sequence:
package/docs builds, public types, and all 7 integrated stages (6,459 jsdom tests,
132 SSR tests, 180 targeted Chromium tests, and 48 docs scenarios). Exact-commit
GitHub qualification is the remaining completion requirement; its result is
recorded on PR #7 and in Beads `bsolid-x1o3`.

## Source of truth and runtime

- React Base UI baseline: `19511bb171f3b360b006c94cf6d07e53cb446505`, checked
  out read-only at `upstream/base-ui`.
- Solid runtime, signals, web renderer and compiler: `2.0.0-rc.13`.
- Toolchain: Node `25.8.1`, pnpm `11.8.0`; CI uses frozen dependencies.
- React source and assertions define behavior. Solid's pinned runtime defines
  scheduling, ownership and native binding mechanics.
- Current V2 documentation can differ from RC13. Consult indexed `solidjs@2`
  documentation and verify the specific API against installed declarations.

Important contracts are recorded in `docs/solid2-contract.md` and the
`solid-v2-runtime` and `react-to-solid-v2-port` skills. This report supplements
them; it does not authorize a framework upgrade or subsystem rewrite.

## What actually happened

### Earlier repairs retained in the branch

These are the earlier repairs recorded in the task handoff and Beads; they were
not all independently re-reproduced during this continuation.

| Commit | Demonstrated problem | Repair |
| --- | --- | --- |
| `5c28dc4` | A stale queued navigation focus could steal focus from custom Menu content. | Preserve upstream synchronous-focus policy through staged active-index synchronization; retain the original assertion and add a deterministic regression. |
| `5c28dc4` | NumberField stepper disabled predicates invalidated native props even when their boolean result stayed unchanged. | Equality-gate the shared disabled result, with read-count and actual boundary-change coverage. |
| `5c28dc4` | Collapsible animation policy and layout styles unnecessarily coupled attribute projection to measurement updates. | Gate the often-unchanged animation-suppression boolean; bind native styles independently from attributes, preserving real measurement effects and SSR styles. |
| `dda6471` | State-style fallback membership probes subscribed style readers to unrelated `data-open` changes. | Gate style presence and value together, preserving dynamic addition, change, removal and explicit-undefined semantics. |
| `079902f` | Menu focus-manager initialization replayed when transition status changed although mounted presence stayed true. Nested Email focus returned to Share, breaking Menubar handoff. | Pass an equality-gated `!mounted` boolean to the focus manager, matching React's primitive effect dependency. |

### Run 41229437243: only Collapsible remained

Run: <https://github.com/unstyled-solid/base-ui/actions/runs/41229437243>.
Verified head: `079902f2081bbed121b58111aa42bd186cd23da6`.

The complete downloaded artifact established:

- jsdom: 6,452 passed, zero failed, pending or unhandled cases.
- SSR: 132 passed.
- Targeted Chromium: passed.
- Docs: 46 scenarios clean; both Collapsible variants completed their gestures
  but reported `EFFECT_RELAY_TEAR`.
- No incomplete or crashed stage was hidden behind that diagnosis.

The warning named `createControlled.local` and
`createCollapsiblePanel.dimensions`. The actual owner chain ended in the panel
host's reactive rendering effect.

**Cause:** `createCollapsiblePanel.shouldRender` was a raw accessor over
`keepMounted || hiddenUntilFound || mounted || open`. `mounted` read a shared
transition snapshot. The snapshot changed during closing even while retained
presence remained true. Renderer prop/style readers therefore ran before the
external size measurement, then again when dimensions were published.

**Repair:** one memo for the shared, often-unchanged presence boolean. Actual
DOM measurement, cached dimensions, frames and animation completion stayed in
their existing lifecycle paths.

**Evidence:** a deterministic retained-presence reader ran twice before the
repair and once after. Focused panel jsdom tests (24), Chromium motion tests
(23), and both actual docs variants passed. The latter had no diagnostics or
errors. Commit: `3cbd0d176d45c2e4432347a0d1a2dc876b9fcb74`.

### Local green was real, but was not GitHub green

Before pushing `3cbd0d1`, the following all completed successfully with
`CI=true TZ=UTC`:

1. `rtk pnpm build:package`
2. `rtk pnpm docs:build`
3. `rtk pnpm test:types`
4. `rtk pnpm test:interactions --full-unit`

The integrated gate passed 7/7 stages: 6,453 jsdom tests, 132 SSR tests, 176
targeted Chromium tests, and all 48 docs scenarios. This was an actual local
execution result, not an inference from focused tests.

Nevertheless, <https://github.com/unstyled-solid/base-ui/actions/runs/41231281843>
failed for that exact SHA. This is why the completion condition must be the
successful remote run, not the local summary.

### Run 41231281843: two remaining shared-renderer causes

All build, type, jsdom, SSR and targeted Chromium stages passed. All docs
gestures passed their behavioral assertions. Three scenario results failed
because diagnostics remained enabled:

1. Menu Tailwind: `WASTED_RECOMPUTE` for `createMergedRefsN.inputs`.
   Ten runs in a 1,000 ms window produced the same result, costing 2.1 ms.
   Reported causes included `createTransitionStatus.snapshot` and `computed`.
2. NumberField CSS Modules: `HOT_SCOPE_TIME` in the native input host effect,
   8.1 ms in a 1,000 ms window against an 8 ms budget.
3. NumberField Tailwind: the same input-host diagnostic, displayed as 8.0 ms.

The full NumberField profile recorded 54 executions of the hottest effect,
with total self time of approximately 10.6 ms and 9.1 ms respectively. Its
dependencies included formatted `text`. No budget was changed.

#### NumberField: value presence is not value content

`createRenderElement`'s live prop facade read `resolved().value` when deciding
whether to expose an `onInput` handler or a controlled reset default. A change
from `"1"` to `"2"` therefore invalidated key enumeration even though presence
had not changed. Additionally, `defaultValue` shared the native attribute
spread, so updating the reset default re-read unrelated attributes and handlers.

The minimal regression used an input with a counted, constant `title` getter:
one value update changed its reads from one to two. Correct current value,
reset default and serialized `value` already passed; the extra read was the
demonstrated waste.

The repair:

- Equality-gate `hasValue`, shared by membership and handler policy.
- Use the existing native `spread` API to bind input `defaultValue` separately
  from unrelated attributes, just as styles already have an independent binding.
- Preserve controlled current-value projection and caret safeguards, native
  reset defaults, the server's complete props, and custom render callbacks.

The minimal regression now retains one title read. A real NumberField regression
also retains its initial title-read count across 54 numeric values while
updating both current value and reset default on the same input node.

#### Menu: reactive prop derivation is not ref identity

For functional prop stages, `createRenderElement` used `resolved().ref` inside
the merged-ref input callback. Resolving that ref could observe changing
state-attribute membership or a newly constructed interaction prop view even
when the final ref remained identical. The merged-ref equality gate prevented
detach/attach, but ran only **after** ref collection, flattening and deduplication.

Two deterministic controls established the unnecessary work:

- Real Menu.Trigger: four open toggles caused four unchanged ref reads.
- A renderer/button fixture with stable prop sources: four state-attribute
  toggles likewise caused four unchanged ref reads.

The repair projects `propRef` separately and gates its actual identity before
the merged-ref list is processed. Functional prop stages still receive their
full preceding live props; legitimate state-derived refs are not frozen or
untracked. Tests cover both functional prop stages and `propGetter`, including
real ref replacement, null detachment and retained host identity.

Both controls were re-executed with the ref repair removed and failed; they
passed with the repair restored. This distinguishes a causal fix from a lucky
diagnostic-free run.

## What the diagnostics do—and do not—prove

- `EFFECT_RELAY_TEAR` identifies a reader exposed to an intermediate state. Its
  suggested repair must still be checked against the value's meaning. A browser
  size measurement is an external observation, not a pure derivation of `open`.
- `WASTED_RECOMPUTE` says the computation ran and then compared equal. Adding
  another comparator to that same expensive scope does not prevent the work.
  Narrow the input or gate a cheaper projection before it.
- `HOT_SCOPE_TIME` accumulates compute time in a window. The same logical work
  can cross that threshold in one environment and not another. This does not
  prove that a particular machine is weak or that the test is wrong.
- An 8.1 ms observation against 8 ms is not permission to increase the budget.
  Inspect the scope and profile first. Here deterministic unnecessary work was
  independently reproduced, so there was an implementation repair to make.
- No current evidence establishes that the Collapsible fix caused the later
  Menu/NumberField warnings. Keep their separate causal chains explicit.
- Local elapsed times and CI elapsed times are not a controlled benchmark.
  Operation counts establish structural improvements; matched workload profiles
  describe measured costs. Do not present their ratio as an end-to-end speedup.

## Solid 2 lessons to reuse

### Choose state by meaning

| Meaning | Appropriate representation |
| --- | --- |
| User-editable or independent event state | Signal or synchronously edited store |
| Cheap, single-reader derivation | Plain accessor |
| Shared policy with an often-unchanged primitive result | Memo with a stated equality purpose |
| Actual DOM size or observer result | Owned external observation published with semantic equality |
| Ref identity or native resource | Setup-owned lifecycle with narrow reactive inputs |

Memoizing everything is not the lesson. These memos protect specific expensive
or semantically sensitive consumers from irrelevant changes. Every added memo
should name those consumers and explain what unchanged output it absorbs.

### Follow dependencies through helpers, not just direct getters

A property read can subscribe indirectly through:

- `in` membership probes and `Object.keys` enumeration;
- fallback lookup through merged prop proxies;
- functional prop stages and native spread;
- a getter for one field of a coarse transition snapshot;
- broad props objects reconstructed by a caller.

Reading a boolean expression is not automatically the same as a primitive
dependency in React. An accessor exposes its inputs to the reader; a memo can
make the boolean result the dependency instead.

Presence, logical open, animation phase, geometry readiness, and interaction
enablement have different lifetimes. A retained exit can stay rendered while
logically closed. Initial-focus effects should not replay merely because a
transition changed phase with unchanged mounted presence.

### Keep native contracts intact when splitting work

An input has current value, reset default, serialized attributes, selection,
native events and possibly a custom render override. Optimizing one binding must
preserve all of them. Use the pinned native renderer APIs instead of inventing
a parallel DOM updater. Separately verify SSR/hydration, host identity and
dynamic prop removal where a shared binding boundary changes.

Styles likewise have key presence, values, removal and caller precedence. A
style membership probe must not accidentally subscribe to every data attribute.
Explicit `undefined` and absence are not universally interchangeable.

Solid 2 writes are staged. Carry accepted values through same-turn imperative
algorithms rather than adding production `flush()` to imitate React. Keep
native event cancellation, Base UI handler prevention and change-details
cancellation distinct. Cleanup is not necessarily ownerless; confirmed release
writes need a narrow ownership boundary, not blanket owned-write permission.

## Migration lessons

1. Copy canonical source/tests first and adapt runtime seams minimally. Existing
   Solid adaptations receive scoped deltas, not destructive re-copying.
2. Preserve source outcomes, defaults, algorithms, notices and test scenarios.
   React lifecycle machinery is not itself the behavior contract.
3. Audit the translated dependency graph. A direct-looking accessor can expose
   more dependencies than the original primitive React prop/effect dependency.
4. Test shared foundations through real consumers. A low-level fixture identifies
   a cause; the real Menu/NumberField fixture proves the composition reaches it.
5. Add native regressions for publication count, identity, cleanup, caret and
   reconciliation. Supplement the copied suites rather than replacing them.
6. A green jsdom suite is not motion/layout/hydration qualification. A browser
   lane registration alone is also not execution evidence.
7. Report source correspondence separately from tested parity. Neither a small
   text diff nor a large passing test count alone proves faithful behavior.

## What to do better in the debugging process

### Start from the exact failed run

Read the PR head and run's `head_sha`; download the complete diagnostics before
editing. Separate assertion failures, diagnostic failures and incomplete/crashed
stages. A canceled local command supplies no test result.

Useful public artifact endpoint:

```text
https://nightly.link/unstyled-solid/base-ui/actions/runs/<RUN_ID>/ci-diagnostics.zip
```

Artifacts include `runtime-gate/summary.json`, per-stage logs and
`click-diagnostics.json`. The last file includes fuller owner paths and profiles
than abbreviated Actions annotations. GitHub API access may rate-limit; public
Actions HTML is a fallback. Do not depend on an endless polling process.

### Turn the warning into a deterministic failing case

Use getter-read counts, computation counts, callback order and node identity
before relying on timing thresholds. Preserve a negative control or before/after
execution. Do not repeatedly run the full suite while guessing at causes.

Be careful with the fixture itself: a test's shared props snapshot can legitimately
invalidate several getters when one prop changes. For an unchanged-ref or
unchanged-attribute test, isolate the reactive source being exercised. This
investigation corrected newly authored fixtures to do that while retaining the
same read-count expectations. The corrected Menu fixtures were then re-executed
with and without the production repair to confirm their causal sensitivity.

### Diagnose the shared cause and freeze a bounded repair

Record the exact affected paths, state meanings, consumer chain, intended change
and checks in Beads. One shared renderer cause should be repaired coherently,
not hidden behind several component-specific workarounds. A delegated worker
needs one precise scenario, an ownership boundary and a stopping condition.

### Make local success a checkpoint, not the finish line

The repeated cycle was frustrating because full local passing did not predict
all timed diagnostic failures remotely. The correction is not to claim stronger
certainty from local results. It is to remove demonstrated unnecessary work,
run the whole prescribed local CI sequence once the batch is ready, then inspect
the exact pushed SHA remotely.

Communicate those statuses explicitly: **focused green**, **local CI green**,
**GitHub pending**, **GitHub failed**, or **exact-SHA GitHub green**. Do not say
"everything passes" without specifying the execution environment and scope.
Do not promise that the next run cannot expose another failure.

### Preserve the evidence and the user's work

- Keep assertions, diagnostics and budgets intact; no retries or exclusions to
  obtain green.
- Stage only owned repair files and explicitly requested documentation.
- Preserve unrelated instruction/skill edits, `.DS_Store` files and dirty
  generated artifacts. Do not indiscriminately commit or discard build output.
- Do not initialize, rebuild or refresh CocoIndex for this operation.
- Run terminal commands through RTK; use Beads for authoritative tracking.
- Runner `skipped` totals include filtering and lane routing. Preserve raw totals
  as runner accounting, not a claim that those cases were untested. Name a case's
  other execution lane only when its execution evidence exists.

## Evidence map

| Area | Files / tracker |
| --- | --- |
| Workflow and gate | `.github/workflows/ci.yml`, `scripts/test/runtime-interactions.mjs`, `docs/ci.md`, `bsolid-x1o3` |
| Native prop/ref/value bindings | `packages/solid/src/internals/createRenderElement.tsx` and `.test.tsx` |
| Collapsible presence | `packages/solid/src/collapsible/panel/createCollapsiblePanel.ts`, `CollapsiblePanel.test.tsx`, `bsolid-7asx.2` |
| Menu ref regression | `packages/solid/src/menu/trigger/MenuTrigger.refs.test.tsx`, `bsolid-7asx.4` |
| NumberField regression | `packages/solid/src/number-field/NumberField.reactivity.test.tsx`, `bsolid-7asx.3` |
| Earlier focus diagnosis | `bsolid-7asx.1`, `packages/solid/src/menu/popup/MenuPopup.tsx` |
| Earlier stepper projection | `bsolid-x1o3.1` |
| Local full gate outputs | `docs/generated/browser/runtime-gate/` |
| Actual docs gesture diagnostics | `docs/generated/browser/click-diagnostics.json` |

Generated evidence files are overwritten by subsequent runs. Durable conclusions
belong here and in Beads; link the immutable remote run/commit for final proof.
