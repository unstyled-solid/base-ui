# Solid RC20 upgrade

Branch: `chore/solid-rc20`, based on fetched `main` at `615b812`.
Tracking: `bsolid-7q63`.

**Final result: local CI green, 7/7 integrated stages passed.** Frozen install,
fresh package/docs builds and public types pass. No commit, push or publication.

## Scope

Upgrade `solid-js`, `@solidjs/signals`, `@solidjs/web`, `@solidjs/compiler`, and
`@solidjs/babel-plugin` together from `2.0.0-rc.13` to `2.0.0-rc.20`.
Retain the compatible Vite plugin and testing-library versions; registry metadata
confirms their prerelease peer ranges admit RC20. Keep the React and donor
submodules pinned. Historical reports and published-release evidence retain the
versions they actually tested; current manifests, consumer pins and docs use RC20.
No new package release has been published by this task.

## Compatibility findings

- RC20's JSX data-attribute index signature rejects computed-key test bags whose
  inferred string index also includes arrays or functions. Explicit named-key
  alternatives preserve every original parameterized scenario and assertion.
- Effect compute arrays infer readonly tuples; Avatar's snapshot collector now
  accepts readonly arrays without mutating the observations.
- RC20 still reads application getters in its unstable-output diagnostic
  comparator. The existing descriptor-safe signals patch is rebased, retaining
  RC20's added symbol-key comparisons. The RC13 patch remains historical evidence.
- Checkbox must establish `type="checkbox"` before binding `value`; changing type
  afterward can normalize an empty text-input value to `"on"`. The original empty
  selection/submission tests catch this through RC20 diagnostics.
- Accepted group requests do not always accept the browser's toggled boolean:
  parent mixed cycles and duplicate-value removal can leave logical checked
  unchanged. Reconcile from the accepted transaction immediately, rather than
  waiting for a later microtask to overwrite an uncommitted native edit.
- **Resolved in focused checks:** keyed Field.Label replacement inherited the
  previous owner's ID. Owner candidates are now registered independently of the
  shared published ID; see the causal evidence below and `bsolid-7q63.1`.
- RC20 SSR gives a `defaultValue` key precedence over `value`, even when its value
  is undefined. Slider now omits that key server-side while preserving the native
  client reset default. Original SSR assertions still require both values once.
- Solid's native missing-context error text changed. Switch's native-error test
  now checks RC20's named missing provider and provider-mount guidance.

## Verification checkpoints

Initial RC20 typecheck: six fixture typing errors; fixed without changing outcomes.
Package and docs builds: passed. Initial full jsdom: 6,412 passed, 47 failed;
initial SSR: 131 passed, one failed. No pending/unhandled/incomplete execution.
Failures were grouped and repaired through focused original scenarios, not retries,
exclusions or diagnostic-budget changes.

The integrated gate completed 5/7 stages: types, catalog, docs, all 132 SSR tests,
and all 180 targeted Chromium tests passed. Its failing Slider diagnostics were
traced to a newly introduced object spread evaluating a getter during setup; that
attempt was replaced with `omit` and the getter retained. An attempted Field.Label
precedence change also regressed existing tests and was reverted. The complete
affected-unit correction check then passed 704 tests across 26 files, with only the
original keyed-label scenario still failing. Both corrected Slider docs variants
then passed their browser replay with zero diagnostics/errors. Full qualification
was not green at that checkpoint because of the keyed-label failure. The repair
below passes focused checks; the final full-unit integrated gate now passes.

The installed signals comparator's three additional node regressions pass: getter
inspection stays inert, RC20 symbol-key changes remain visible, and sparse array
presence/data differences remain distinguishable. Frozen install passes.

An initial extra docs node suite passed 25/28 tests. Its three release-overview
cases asserted package `0.0.1` while the unchanged starting contract used `0.0.2`.
The failures were reproduced from pristine `615b812` files in
`/private/var/folders/k1/dqkw16gn09q6492v5jn1x_jc0000gn/T/opencode/rc20-docs-baseline-xTKyYN/result.log`.
After establishing that baseline mismatch, the three exact metadata expectations
were updated to `0.0.2` (not relaxed); release-overview, audit and consumer-policy
node suites now pass all 25 tests together.

The current development manifests require RC20. Published `0.0.2` remains the
previous RC13 package until a separately authorized release updates npm; use the
local package build to test RC20 meanwhile.

## Field label ownership repair and attribution

A runtime-only probe downloaded pristine npm `solid-js` and `@solidjs/signals`
RC13/RC20 tarballs into an isolated temporary directory (no workspace patch).
It uses `Show({ keyed: true })`, a shared registration signal, the original
`registered() ?? candidate` memo, and split-effect registration/cleanup. Command:

```sh
rtk proxy node --conditions=browser --conditions=development /private/var/folders/k1/dqkw16gn09q6492v5jn1x_jc0000gn/T/opencode/label-order-rJ2a9o/probe.mjs
```

Both versions construct `b` before cleaning up `a`; that ordering is **not new
in RC20**. The decisive traces are:

- RC13: `setup b → resolve b:a → cleanup a → resolve b:undefined → register b:b`.
- RC20: `setup b → resolve b:a → cleanup a → register b:a → resolve b:a`.

RC13 exposes the intermediate cleared registration to the replacement memo;
RC20 coalesces the clear with the replacement's inherited-ID publication. Indexed
`solidjs@2` reactivity/testing docs promise staged writes; `onCleanup` documents
owner disposal and unwind order, not replacement-before-construction ordering
or observation of intermediate writes. This is a demonstrated scheduling change
exposing an invalid port assumption, **not an established upstream Solid defect**.
The earlier interpretation that construction-before-cleanup itself was new was
incorrect. The target remains RC20, not RC21.

Pinned React `FieldLabel.tsx:43–45` resolves `labelId ?? idProp`, and
`useRegisteredLabelId.ts` publishes through a layout effect with identity-checked
cleanup. Those source outcomes remain authoritative; its lifecycle feedback loop
does not establish a Solid scheduling guarantee.

The narrow native repair keeps each mounted Field label's initial candidate
separate from the shared registration. `LabelableProvider.registerFieldLabel`
registers owner candidates through `onSettled`, derives precedence from the first
active owner, and removes only the disposing owner's token. `FieldLabel` retains
an equality-gating primitive memo so an unchanged shared ID does not re-register.
Field publications are kept separate from local-control label publications so
the original Field/Combobox shared-ID precedence still applies without treating
the inherited published ID as a new Field owner's candidate.
No runtime scheduling patch, flush, deferred cleanup, assertion weakening, or
diagnostic suppression was added.

Rejected approaches: explicit-ID-first broke retained Input/shared-label
precedence; previous-output memo and redundant-set guards retained the inherited
replacement ID; a registry without distinct candidate identity could republish
the same stale ID. A first candidate-registry prototype wrote during setup and
correctly failed `REACTIVE_WRITE_IN_OWNED_SCOPE`; registration was moved to the
owned settled lifecycle, not hidden with an owned-write option.

Exact focused command passes **64 tests across three files**, diagnostics intact:

```sh
rtk pnpm test:jsdom packages/solid/src/radio-group/RadioGroup.field.test.tsx packages/solid/src/input/Input.test.tsx packages/solid/src/field/FieldReview.test.tsx
rtk pnpm test:types
rtk pnpm build:package
```

Regression contracts preserved:
- RadioGroup: `updates explicit/Field/legend label precedence through replacement
  and removal on the same host` (keyed replacement, removal/fallback, original host
  and ARIA association).
- Input: `retains the registered Field label ID while updating control,
  description and error IDs on the same input` (retained live ID and remount).
- FieldReview: `keeps a registered label ID when another Field.Label mounts in
  the same scope` (shared precedence).

Focused runner accounting included three raw lane-excluded cases; the 64 count
is actual execution, not a claim those three ran in another lane.
Final integrated qualification passed against an isolated server started in
this RC20 worktree on `127.0.0.1:5194`:

```sh
rtk proxy env DOCS_TEST_URL=http://127.0.0.1:5194 pnpm test:interactions --full-unit
```

The first owner-candidate gate completed 6/7 stages: 6,458 unit cases passed and
one failed (Combobox `shared Field/local label registration follows the pinned
native label association`); all 132 SSR and 180 targeted Chromium tests and docs
gestures passed. This concrete missed consumer motivated separating Field/local
publications in the same registration seam. Expanded correction check:

```sh
rtk pnpm test:jsdom packages/solid/src/radio-group/RadioGroup.field.test.tsx packages/solid/src/input/Input.test.tsx packages/solid/src/field packages/solid/src/combobox/root/ComboboxReview.test.tsx
```

Result: **379 passed across 16 collected files**, no unhandled/incomplete work or
unexpected diagnostics. Raw runner accounting: 13 excluded cases, not a claim of
13 untested cases. The exact full-unit integrated gate was replayed once for
this observed correction and passed. Frozen install and fresh package/docs builds pass.
The current identity proof passes with coordinated RC20 pins; the hydration-ID
fixture's version metadata and assertion were updated together, then all three
of its actual SSR/hydration/identity tests passed.

One additional non-CI README-shape test still fails identically on pristine
`615b812`: it requires upstream heading equality, while that baseline already
has `Getting started`/`Acknowledgments` instead of `Team`. Evidence:
`/private/var/folders/k1/dqkw16gn09q6492v5jn1x_jc0000gn/T/opencode/rc20-readme-baseline-7JhXfn/result.log`.
Its assertions and README structure were not weakened/reworked for this upgrade.
The repository CI workflow does not run that extra node suite.

Additional final checks:

```sh
rtk pnpm test:package-types
rtk pnpm test:chromium packages/solid/src/combobox/root/ComboboxReview.test.tsx -t 'shared Field/local label registration'
rtk proxy node --conditions=browser --conditions=development packages/solid/src/internals/contracts/proof/identity.mjs
rtk proxy node --test test/runtime/signals-diagnostics-patch.test.mjs
rtk proxy node --test docs/tests/release-overview.test.mjs docs/tests/qualification/audit.test.mjs test/distribution/consumers/policy.test.mjs
```

Results: all 79 public type entrypoints pass strict Bundler and NodeNext consumers;
the exact Field/Combobox association passes in Chromium (one executed case; 50
others outside that command's name filter); one coordinated runtime/signals
identity passes; three comparator regressions and all 25 docs/policy cases pass.
Vite emits an import-analysis build warning for RC20 renderer's dynamic module
URL import in browser tests; runtime diagnostics remain enabled and clean. Raw
gate logs preserve that output, including its trailing whitespace; non-generated
source passes `rtk git diff --check -- . ':!docs/generated'`.

## Final CI evidence

The final `DOCS_TEST_URL=http://127.0.0.1:5194 pnpm test:interactions --full-unit`
completed **7/7 stages**: project types, 137-entry catalog, 86-route docs checks,
**6,459 jsdom tests**, **132 SSR tests**, **180 targeted Chromium tests**, and
trusted docs gestures. No failed, pending, unhandled, or unfinished tests were
reported. Raw jsdom runner accounting includes 272 exclusions and three excluded
files; this is not a count of untested cases or a claim all were executed in
another lane. The exact Combobox shared-label case additionally executed in
Chromium as recorded above.

Authoritative artifacts: `docs/generated/browser/runtime-gate/summary.json`, its
per-stage logs, and `docs/generated/browser/click-diagnostics.json`. All final
docs scenarios passed with diagnostics and browser-error collection enabled.
The isolated RC20 server was not the other checkout's RC13 server on port 5173.

Commands matching `.github/workflows/ci.yml` executed successfully:

```sh
rtk pnpm install --frozen-lockfile
rtk pnpm build:package
rtk pnpm docs:build
rtk pnpm test:types
rtk proxy env DOCS_TEST_URL=http://127.0.0.1:5194 pnpm test:interactions --full-unit
```

Current manifests/consumer tool pins, runtime identity proof, hydration fixture
metadata and generated-site runtime badge use RC20. Historical RC13 issue,
release evidence, replay tooling for retained RC13 consumers, and provenance
remain historical rather than being blindly rewritten. Current consumer reports
identify RC20; no independent packed-consumer runtime qualification or new
published release is claimed by this local CI checkpoint.
