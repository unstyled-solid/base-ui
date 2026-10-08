# Base UI Solid 2 — staff architecture, browser, and maintainer review

> Executable handoff and prompt for a **fresh agent**. Written after the implementation fleet, component-level source reviews, and several targeted repair rounds. This is a higher-level review, not an instruction to repeat every component review or restart the backlog.
>
> Snapshot date: 2026-10-05. Files and Beads are live; historical test results and issue descriptions can be stale. Establish a current baseline before making a release judgment.

> **Current user scope override:** Review the implemented library, its shared architecture, and browser behavior only. The unfinished documentation website is assigned to a separate chat: do not review, implement, audit, or qualify that website or its page/demo completeness here. Documentation status below is context only. Do not start release certification, npm-identity selection, publishing, or agents assigned to those activities. Package-consumer checks are allowed only to verify that the implemented library actually works; they are not release work.

## 1. Your mission

Act as a staff architect, browser-runtime expert, and experienced open-source maintainer. Review the **system produced by the combined work**, with particular attention to seams that individually passing components cannot prove.

Determine whether the library:

1. Preserves pinned React Base UI's observable DOM and interactions.
2. Uses coherent, genuinely native Solid 2 ownership and reactivity.
3. Works through real browsers, SSR/hydration, independent consumers, and its actual distribution artifacts.
4. Can be maintained and reconciled with upstream without architecture drift.
5. Has accurate library-facing instructions, package metadata, provenance, and implementation claims. The separate unfinished documentation website is outside this review.

Fix established defects or dispatch fresh, narrowly scoped fixers. Do not settle for a report that leaves readily fixable defects unresolved. Distinguish implementation gaps from missing qualification and from legitimate framework adaptations.

**Primary standard:** Use the web/source implementation as the canonical reference. Read the actual React implementation and relevant source test before deciding that target behavior is right or wrong. What reaches the DOM, how it interacts, callback ordering, cancellation, form values, accessibility relationships, data attributes, CSS variables, and native focus behavior matter more than preserving React implementation machinery.

Do not approximate the source structure. If exact parity is impossible at a seam, stop and document the blocker instead of inventing a substitute.

## 2. Authority and non-negotiable constraints

**Project:** `/Users/avi/avir-oss/baseui-solid2`

**Canonical source:** `upstream/base-ui`, React Base UI 1.8.0, SHA:

```text
19511bb171f3b360b006c94cf6d07e53cb446505
```

**Supplementary donor:** `upstream/solid-floating-ui`, SHA:

```text
0492e49b746deed543dbc167a9a58ed1210c2393
```

The donor is Solid 1 source, not a runnable Solid 2 dependency and not the behavioral oracle. Owned adaptations must satisfy Solid 2 RC13 and React Base UI behavior. Substantial donor changes are reconciled on developer request; tiny licensed source adaptations can be one-time copies with provenance.

- Both pinned source repositories and `/Users/avi/avir-oss/ref/base-ui` are read-only. The reference's pre-existing dirty lockfile is user work.
- Never use `/Users/avi/avir-oss/ref/base-ui-solid` as implementation source.
- **Use RTK for ALL terminal commands**, including instructions sent to workers. Prefer `rtk pnpm`, `rtk git`; use `rtk proxy` for unsupported commands and machine-readable output.
- **Never run `ccc index`, initialization, search refresh, or automatic reindexing.** The developer owns indexing. Use exact file tools when indexed search cannot safely run without rebuilding.
- No commits, pushes, publication, remote sync, or automatic upstream updates without explicit authorization. Local fixture-repository commits are test data, not permission to commit this project.
- Preserve unfamiliar working-tree files. The port was developed in a shared tree; substantial legitimate work is untracked. Do not reset or clean it.
- Beads is authoritative. Do not reimport `planning/*.json` over edited tickets or create a second live task database.
- Code, meaningful tests, and concise findings take priority. Do not spend the review generating redundant tracking JSON, inventories, or documentation fragments.
- No global diagnostic suppression, arbitrary sleeps, assertion deletion, broad type loosening, or fabricated browser events/capture/lock grants to obtain a green suite.
- **Do not put this entire project into one endlessly reused worker session.** Each fixer gets one coherent defect or interface, exact files, a reproduction, and source references. Replace an overgrown session with a concise handoff and a fresh worker.

## 3. Read first — bounded onboarding

Read these once; then inspect only the files relevant to the current architectural question:

1. `AGENTS.md`
2. `docs/architecture.md`
3. `docs/solid2-contract.md`
4. `docs/contracts.md`
5. `docs/parallel-execution.md`
6. `docs/reviewer-contract.md`
7. `test/harness/README.md`
8. Root and library `package.json`, `pnpm-workspace.yaml`, `tsconfig.json`.
9. `distribution/package-contract.json`, `distribution/exports.json`, `distribution/dependencies.json`.
10. `test/qualification/browser/README.md`.

`README.md` still describes the initial planning-only state. Some contract prose still describes command reservations that have since been implemented. **Actual files, current commands, and fresh evidence supersede stale prose.** Correct maintainer-facing inaccuracies after establishing the current state.

Start with:

```sh
rtk proxy bd prime
rtk git status --short
rtk proxy bd ready --type task --limit 0
rtk proxy bd list --status in_progress --limit 0
```

Inspect relevant issues selectively. Some shared review tickets have very long comment histories; retrieve descriptions/status/acceptance as machine-readable output rather than dumping every historical comment into context.

## 4. What already exists

- Coordinated toolchain: `solid-js`, `@solidjs/web`, `@solidjs/compiler`, `@solidjs/babel-plugin` **2.0.0-rc.13**; `@solidjs/vite-plugin` **3.0.0-next.47**; testing library **1.0.0-beta.3**; Vite 8; TypeScript 5.9.3; Vitest 4.1.11. Root runtime pins are Node 25.8.1 and pnpm 11.8.0. Read manifests for the exact installed set.
- Real implementations under `packages/solid/src/`, shared native foundations, family-local tests and barrels, aggregate root/types exports, and floating facades.
- Component-level reviewers inspected React source and repaired local defects. Numerous later fixes were cross-family ownership, native input, focus, and browser-fixture defects.
- `scripts/test/run.mjs` provides jsdom, separate SSR, strict types, and real Vitest/Playwright browser execution. Chromium, Firefox, and WebKit were installed and infrastructure-smoke-tested.
- Real independent SSR fixtures and browser hydration helpers exist; headed Chromium provides actual pointer lock.
- Build drivers emit module-preserving DOM/server ESM plus independently generated declarations. A staged private `baseui-solid2` package has **79 canonical export keys**; workspace-only `internals/contracts` is not a published extra key.
- Independent React/Solid browser hosts and a pristine throwaway React checkout exist. This is actual comparison, not screenshots of unrelated demos or a mock oracle.
- Upstream wrappers support independent Base UI and donor state, candidate/verified separation, locking, immutable episodes, and developer-triggered reconciliation.
- Upstream documentation inputs are copied and transformed. **A runnable documentation website has not been implemented.**

### Evidence limits

Historical combined replay reached **5,100 jsdom passes with four failures**, **126 SSR passes**, and passing strict types. Subsequent focused fixes addressed those failures, and new tests have been added since. This is **not a current whole-project green claim**.

Many focused browser suites now pass. The initial broad Chromium replay exposed real browser-only defects, followed by targeted fixes. There has not been a stable, final, all-scope, all-engine qualification after every later edit.

The independent representative comparison previously produced **22 matches / 18 failures across 40 applicable comparisons**. Several later focused comparisons improved this: Form and Tooltip Chromium comparisons reached zero differences. Remaining issues below were identified separately. Do not reuse the old 22/18 summary as the current result.

Passing source-inventory/export-map tests are not interaction tests. Passing synthetic resolver fixtures is not packed-consumer qualification. Passing Chromium is not iOS keyboard qualification or universal accessibility.

## 5. Current known work — verify, do not blindly reopen stale bugs

| Area | Concrete handoff | Files / issues to inspect |
|---|---|---|
| Controlled input DOM parity | Combobox value properties and FormData pass, but the independent host observed missing natural `value` attributes on visible/hidden inputs. NativeHost also emitted `EFFECT_WRITES_OWN_SOURCE` on input registration. Avoid per-family attribute-sync effects as a shortcut. | `internals/createRenderElement.tsx`; `combobox/input/ComboboxInput.tsx`; hidden control in `combobox/root/AriaCombobox.tsx`; **`bsolid-itlx`** |
| Select canceled-open geometry | Force-mounted, canceled-open Positioner lacks React's `--transform-origin: 0px 0px`. Shared positioning prevents closed/unmounted passes. Need source-compatible hidden projection without enabling visible readiness, tracking, or scroll locking. | `internals/createAnchorPositioning.ts`; `floating-ui-react/hooks/createFloating.ts`; `select/positioner/SelectClosedProjection.browser.test.tsx`; **`bsolid-lnjy`** |
| Portal owner-span DOM | The differing minimal fixed style belongs to the `aria-owns` helper span, **not FocusGuard**. FocusGuard's full visually-hidden source style is correct. Do not change the wrong element to satisfy comparison. | `FloatingPortal.tsx`; React `internals/constants.ts` `ownerVisuallyHidden`; `test/qualification/browser/.cache/select-projection-current/` |
| Navigation diagnostics | Independent Select host reported `EFFECT_WRITES_OWN_SOURCE` on `activeIndex`. Same-element setter feedback and tracked terminal reads deserve review independently of passing local tests. | `floating-ui-react/hooks/createListNavigation.ts`; **`bsolid-browser-differential-replay`** |
| Floating exposed capabilities | Facades exist, but standalone options/external elements/onOpenChange/external tree and returned context geometry capabilities require source comparison. Constructor-to-factory adaptation must be deliberate, not a fake constructor alias. | `floating-ui-react/{types,index}.ts`; `hooks/createFloating.ts`; **`bsolid-integration.1`** |
| Package validation | Build/type consumers and publint passed in focused checks, but ATTW reported **156 CJSResolvesToESM / NoResolution findings**. Classify ESM-only unsupported-CJS findings separately from genuinely broken supported consumers. Do not add unsupported CJS or hide actual resolution failures. | `scripts/distribution/types/validate.mjs`; staged manifest; **`bsolid-dist-types.1`**, **`bsolid-dist-pack`** |
| Mixed conditions | Library's browser-first map can disagree with RC13 peers' worker-before-browser map. Real mounted consumers must establish the supported combination, not just export-object ordering tests. | `distribution/package-contract.json`; **`bsolid-dist-mixed-conditions`** |
| Full source matrix | Representative independent fixtures cover only a subset. Runtime-expanded source inventory and broader appropriate-platform browser matrix remain gates. Compatible isolated React tools now exist; the original Node-engine installation blocker is no longer a reason to assume collection impossible. | **`bsolid-inventory-runtime`**, **`bsolid-browser-source-matrix`** |
| Device / AT gates | Real iOS software keyboard, date/time picker, native reveal and assistive-technology checks have not been established by desktop simulations. | **`bsolid-review-drawer.3`**, accessibility/hydration gates |
| Docs deployment | Content pipeline exists, site/API/demo/audit tasks remain open. No `docs:dev` / `docs:build` script, docs app manifest, site shell, or deployable static site currently exists. | **`bsolid-docs-site`**, **`bsolid-docs-api`**, **`bsolid-docs-demos`**, **`bsolid-docs-complete`** |

### Recent fixes that must not be mistaken for still-open root causes

- Default-host hydration namespace drift was traced to **client-only registration of `onSettled`**: RC13 server setup reserves an ownership slot even though the callback does not execute. Registering it on both sides fixed actual Avatar hydration. Server merged-ref typing was also corrected.
- Cached Avatar default-mode fallback reinsertion was traced to an image becoming eligible one staged commit before Root status caught up. A one-time initial-status publication barrier fixed the transient movement; both hydration modes and all ten Avatar Chromium bodies then passed.
- NavigationMenu's original Content ancestry differs from its sibling Portal ancestry. `NavigationMenuList` now supplies a separate logical-layer context to its original subtree. Real body-portal/Dialog/Lite and outside-dismissal regressions passed.
- Drawer capture loss was a **CDP packet defect**: held moves omitted `button: 'left'`. Correct packets preserve real capture; 57 gesture browser cases passed. Do not introduce a production capture workaround for that old repro.
- NumberField native pointer lock genuinely grants in the headed lane. Its fixture now waits for native `pointerlockchange` and asserts actual movement delta. The historical 639-versus-10 value was not reproduced by the fresh fixer; current two native bodies passed, but robustness should be requalified.
- Native focus callbacks now use `focusin` / `focusout`, retaining Event identity and matching React's observable reason/event contract.
- FieldRoot's resolved children now have an owned accessor below the providers; the independent real Form comparison then passed without context errors.
- Tooltip, Menu and related Root components had confused renderer-owned `ChildrenReturn` accessors with payload render callbacks. Fixes prevent recursive owner creation, OOMs, and child replacement.
- `isReactEvent` was intentionally **removed** as React-only dead compatibility code. `test/integration/RootExports.test.ts` explicitly records and asserts that exclusion. Do not restore it to make literal export-name comparison pass.

## 6. Review execution order

### Phase A — freeze and establish an honest baseline

1. Verify pinned checkout SHAs and clean statuses without modifying them.
2. Read actual package commands, build configs, test discovery, and skip predicates.
3. Confirm no implementation worker is still changing source. Stop live HMR edits before definitive comparisons.
4. Run types and current combined client/SSR checks once. Classify every failure by actual root cause.
5. Read current independent comparison evidence and rerun on stable input. The runner's before/after fingerprint must match.
6. Record a concise baseline: exact commands, results, tested source/artifact revision, engine versions, and unresolved items. No giant replacement inventory.

### Phase B — review architecture through high-risk seams

Inspect **shared invariants**, not all small components again:

- **Ownership tree:** provider placement, lazy child resolution, host stability, payload callback distinction, context-preserving portals, disposal order, and multi-root isolation.
- **Reactive state:** controlled/uncontrolled initial-mode selection, current callbacks, cancellation before accepted dispatch, explicit same-turn proposals, raw registration Maps, no effect-mirrored props.
- **Refs and resources:** callbacks ownerless/untracked, setup-owned lifecycle, replacement tokens, no stale node/ref caches, actual owner document, cleanup symmetry.
- **Browser event system:** native default prevention vs Base UI handler prevention vs details cancellation; capture/bubble ordering, pre-open press tails, nested Escape/outside presses, modifier-preserving activation, root-scoped delegation.
- **Forms:** natural DOM attributes AND properties, hidden values, native reset/autofill/required validation, submit ordering, asynchronous validation races, external form association, grouped/direct registration takeover.
- **Geometry and motion:** DOM/virtual anchors, RTL/logical sides, clipping/zoom/DPR, middleware order and defaults, size CSS ownership, late measurement generations, closed/retained projection, real WAAPI cancellation/rearming, late payloads and interrupted transitions.
- **Focus/accessibility:** guards versus ownership-helper spans, native Tab/Shift+Tab, roving/active-descendant semantics, focus return provenance, modal marking/scroll-lock reference counting, disabled/readOnly differences, reduced motion.
- **SSR/hydration:** matching native ownership slots and render IDs, transparent computations only where justified, no server signal writes, initial-open/kept states, Loading/Errored, original node identity, context, first-paint semantics, stale async completion after disposal.

Key starting paths:

```text
packages/solid/src/internals/createRenderElement.tsx
packages/solid/src/utils/createMergedRefs.ts
packages/solid/src/utils/createControlled.ts
packages/solid/src/internals/field-core/
packages/solid/src/internals/composite/
packages/solid/src/internals/use-button/
packages/solid/src/utils/popups/
packages/solid/src/floating-ui-react/components/
packages/solid/src/floating-ui-react/hooks/
packages/solid/src/internals/createAnchorPositioning.ts
packages/solid/src/utils/createPopupViewport.ts
```

For each suspicious seam, use the equivalent actual React source and tests. Validate through at least two real consumers when the proposed fix affects shared behavior. Keep runtime behavior unchanged except where this task explicitly requires parity fixes.

### Phase C — validate tests as evidence

- Check that generated conformance cases still assert native refs, identity, props, overrides, callback order, and cancellation rather than only snapshots.
- Trace apparent fixture fixes to source evidence. Legitimate fixes included real scrollable geometry, correct held-button packets, awaiting actual animation completion, and adoption before realm checks. These are not permission to weaken a failing assertion.
- Do not let an inventory test inflate behavioral pass counts.
- Inspect skip/todo/source-platform restrictions. Unsupported browser cases need a real gate; a function body or annotation is not execution evidence.
- Ensure tests use actual current native input and positive timestamps where velocity matters.
- Verify unexpected warnings, owner leaks, timers, unhandled errors, and diagnostic findings fail. Expected diagnostics should be narrow, local, and exact-count.
- Run negative probes to prove the harness catches failures; inspect pathological assertion formatting/OOM roots instead of increasing memory blindly.
- Browser failure screenshots are evidence, not proof of source parity; consult source before changing code.

### Phase D — review distribution like an open-source maintainer

Read:

```text
packages/solid/src/index.ts
packages/solid/src/types/index.ts
packages/solid/src/floating-ui-react/{index,types,utils}.ts
packages/solid/package.json
scripts/distribution/build/{index,compiler,check,smoke}.mjs
scripts/distribution/types/{build,test,validate}.mjs
packages/solid/tsconfig.build.json
packages/solid/build/package.json
LICENSE
NOTICE
```

Required questions:

- Are all canonical **capabilities**, not merely names, retained or explicitly adapted?
- Are factory/constructor and accessor/value adaptations sound, typed, documented, and actually consumable?
- Does the final tarball install **outside workspace resolution**, with no source aliases or monorepo ambient dependencies?
- Do root/subpath imports stay tree-shakeable while preserving real side effects? Do not trust bootstrap `sideEffects: false` without an audit.
- Are tests, source-test helper trees, browser fixtures, screenshots, caches, compiler proofs and local paths excluded from published artifacts? A large compiled module count is not evidence of correct inclusion.
- Are declarations generated from real source, with `.js` relative imports, exact namespaces, native refs/events, and no React ambient types?
- Do optional date adapters remain isolated from ordinary runtime and declaration graphs?
- Does server import avoid browser globals, and does a production minified client retain state/events and hydrate actual server output?
- Are browser/node/worker/deno/default/type-only conditions true in real consumers?
- Are build tools dev-only and runtime peers external? Does package identity remain private and unresolved for publication?
- Are MIT and inherited notices present in the archive, with donor provenance for actual adopted snippets?

A successful workspace build, publint run, or resolver matrix does not substitute for actual tarball consumers. Classify tool findings according to the advertised ESM contract, then resolve supported-path failures.

### Phase E — upstream and library-facing instructions

- Audit `scripts/upstream/cli.mjs`, `scripts/upstream/git/`, `tracking/upstream.json`, donor state and workflow. Candidate, baseline, adapted source and verified parity are separate facts.
- Do not advance `verifiedParitySha` until release gates pass for one exact evidence tuple.
- Prove no upstream update can move an active worker's source or silently overwrite owned donor adaptations.
- Audit source maps, notices, exclusions and source-pinned update reports for maintainability without demanding another giant metadata rewrite.
- Correct stale library-facing README/command claims when supported by actual implementation. Do not evaluate the separately assigned documentation website.

## 7. Documentation website — context only, explicitly outside this review

**Do not execute this workstream or assess its completeness.** Another chat owns website implementation and its own validation. The following records the starting state so you do not mistake missing website files for library-review findings.

**No runnable/deployable Solid docs site currently exists.** The root has `docs:sync` and `docs:test:content`; it lacks `docs:dev` and `docs:build`. Current `docs/` contains copied upstream inputs and transforms, not a built site shell.

Content checks available now:

```sh
rtk pnpm docs:sync --check --verify-upstream
rtk pnpm docs:test:content
```

These validate imported content; they do **not** start a website.

The developer wants literal source reuse/file operations wherever possible:

- Reuse pinned MDX prose, assets, CSS, anatomy, navigation metadata, and framework-neutral formatting through copy/adaptation, preserving provenance.
- Already imported: 739 inputs covering 84 public MDX pages. Imported pages were marked non-publishable until semantic work is reviewed.
- Do not rebuild the documentation from invented prose or redesign it unnecessarily.
- Do not copy React/Next runtime dependencies and call the resulting app Solid. Adapt the bounded shell/MDX handlers and convert executable demos to real Solid 2.
- Public API tables must come from actual Solid declarations, not copied React `types.md`.
- The prose inventory includes source-linked semantic flags and fonts with unresolved redistribution provenance; neither can disappear silently at publication.

Existing implementation tasks for the **other chat**: `bsolid-docs-site`, `bsolid-docs-api`, `bsolid-docs-demos`, and `bsolid-docs-complete`. They are not reviewer assignments. Site acceptance includes real static HTML, no-JS prose readability, deep links/base paths, search/navigation, a useful 404, generated version/SHA/RC13 banner, actual interactive demos, and source-linked API tables.

The other chat must document its actual startup/build/preview commands and output. This reviewer must not give the user a nonexistent startup command or run the upstream React website as if it were the Solid site.

## 8. Executable validation toolbox

Run from the project root. Use targeted checks during repairs; run whole-project gates once source is stable.

### Workspace and infrastructure

```sh
rtk pnpm install --frozen-lockfile
rtk pnpm typescript
rtk pnpm test:types --no-watch
rtk pnpm test:jsdom --no-watch --reporter=dot
rtk pnpm test:ssr --no-watch --reporter=dot
rtk proxy node scripts/test/negative-probes.mjs
rtk proxy node --test scripts/test/runner.test.mjs
rtk git diff --check
```

`test:contracts` includes broad suites; do not repeatedly run it alongside equivalent whole-project commands. Root integration tests are included in current discovery; focused `RootExports` and `RootCrossFamily` filters are useful.

### Real browser execution

```sh
rtk pnpm test:chromium .browser.test --no-watch --reporter=dot
rtk proxy env HARNESS_BROWSERS=chromium,firefox,webkit pnpm test:browsers .browser.test --no-watch --reporter=dot
rtk pnpm test:chromium:native NumberField.browser --no-watch --reporter=dot
rtk pnpm test:browser-batch chromium --shards=4 --dry-run --reporter=dot
```

Browser cases also live in ordinary `.test.tsx` files. A `.browser.test` filter alone is **not the complete retained scenario set**. Inspect `scripts/test/browser-batch.mjs`, `vitest.browser.config.ts`, and actual case annotations; run appropriate scoped regular suites in browser mode. Preserve platform restrictions. The native headed lane is necessary for actual pointer-lock acquisition, not a general replacement for headless checks.

Real SSR/hydration APIs are exported from `#test-utils`:

```text
fetchSSRFixture({ module, exportName, renderId, props, mode })
mountSSRFixtureHTML(html) -> { root, restoreHydration }
hydrateSSRFixture(Fixture, clientProps, root, renderId)
prepareNativeDocument()
```

Read `scripts/test/fixture-server.ts` and `test/harness/` for their actual definitions. Adopt server nodes before realm checks and capture native bootstrap scripts before moving their root. Never fabricate markup/maps or rewrite hydration IDs.

### Independent React/Solid comparison

Read `test/qualification/browser/README.md` before running. Existing isolated tools/checkouts:

```text
/var/folders/k1/dqkw16gn09q6492v5jn1x_jc0000gn/T/opencode/bsolid-browser-react
/var/folders/k1/dqkw16gn09q6492v5jn1x_jc0000gn/T/opencode/bsolid-browser-tools/node_modules/node/bin/node
```

The oracle uses isolated Node **24.21.0** and pnpm **12.8.1** for the pinned React engine set; this does not change the port's root toolchain. Original selected React assertions passed 109 tests across three engines historically.

```sh
rtk proxy env QUALIFICATION_REACT_CHECKOUT=/var/folders/k1/dqkw16gn09q6492v5jn1x_jc0000gn/T/opencode/bsolid-browser-react /var/folders/k1/dqkw16gn09q6492v5jn1x_jc0000gn/T/opencode/bsolid-browser-tools/node_modules/node/bin/node test/qualification/browser/run.mjs --output .cache/staff-review
rtk proxy node --test test/qualification/browser/observe.test.mjs
```

The comparison records natural DOM, all attributes/CSS, control properties, ARIA, focus, callbacks and native forms. Generated IDs/framework comment markers are the documented normalizations. Do not normalize away missing value attributes, guard markup, native event types, floating readiness, or callback differences. Numeric CSS serialization differences need a source-grounded assessment, not arbitrary tolerance expansion.

Before/after fingerprints must match. If another agent changes source, finish useful diagnosis but mark that comparison non-final; rerun once after the batch settles, not in an endless loop.

### Actual package artifacts

```sh
rtk pnpm build:package
rtk pnpm test:package-types
rtk proxy node --test scripts/distribution/build/build.test.mjs
rtk proxy node scripts/distribution/build/check.mjs
rtk proxy node scripts/distribution/build/smoke.mjs
rtk proxy node scripts/distribution/types/validate.mjs --api-extractor
rtk proxy node scripts/distribution/types/validate.mjs --package
```

Rebuild after source changes before claiming artifact validation. `smoke.mjs --compiler-control` is deliberately a compiler-control probe; only the default smoke exercises actual default-host Toggle/Separator hydration. Archive testing is `bsolid-dist-pack` scope and must use the staged package, with independent consumer installs and no publishing.

## 9. Efficient delegation and repair protocol

Use a fresh narrow agent when a defect warrants parallel work. Do not relaunch the entire component fleet just to perform this higher-level audit.

Good independent boundaries:

- Renderer/ref/hydration ownership: **one owner**, never overlapping fixers.
- Logical portal ancestry: one separate owner if it does not touch renderer files.
- Input attribute projection and ref-loop feedback: coordinate with renderer owner before edits.
- Closed positioning projection: geometry owner, independent of form/control fixes.
- Native capture/lock fixture packets: family-local fixture owner, no shared gesture rewrites without evidence.
- Package conditions/declarations: distribution owner; root manifests/lockfiles remain single-owned.
- Qualification fixtures and independent oracle: read-only production source until a source-backed defect is routed.
- Docs content/site/API/demo work: owned by the separate chat; do not dispatch it from this review.

Worker brief must contain the exact symptom/test, expected and received behavior, canonical source files, allowed paths, current proven root cause versus hypotheses, and smallest meaningful acceptance checks. Forward reviewer findings **verbatim** where possible. If routing back to an implementer is cumbersome, authorize the fresh reviewer to fix inside an explicit boundary rather than create a bureaucracy blocker.

Each worker returns a short handoff: fixed files, source requirement, actual results, and precise remaining gaps. It should not review unrelated families or repeatedly regenerate ledgers.

The roughly 15-minute/two-attempt bound applies to **tooling tangents**, not to genuine implementation work. Do not stop fixing a real code defect merely because two test runs failed. Conversely, do not spend hours reinstalling browsers or debugging one optional tool while independent code work can proceed.

## 10. Findings, acceptance, and final deliverables

Classify every finding:

1. **Implementation defect:** wrong observable behavior or unsafe ownership; required repair and regression.
2. **Architecture/API gap:** public capability missing or competing contract; source-derived interface correction or explicitly approved adaptation.
3. **Infrastructure blocker:** exact reproduction and bounded diagnosis; retain the affected gate.
4. **Qualification gap:** unexecuted case/platform/consumer; no green claim.
5. **Intentional adaptation:** native API mapping or genuinely React-only exclusion with explicit evidence.

For deferred work, create or reuse a real Beads issue with origin, affected components/files, exact command, evidence, classification, acceptance criteria and blocked final gate. A comment alone is not a deferral. Do not duplicate stale issues; update existing evidence and close only verified scopes.

### Done when

- Current source/build/test commands and baseline are accurately described.
- High-risk shared invariants have source-grounded cross-family and native-browser evidence.
- Independent comparisons are stable, with no unexplained differences or hidden diagnostic failures for the executed scope.
- Supported runtime/declaration/archive/condition contracts are verified from genuine artifacts.
- Remaining library source cases, devices, AT and browser verification gaps are explicitly tracked. Do not turn separate website or release tasks into review assignments.
- No release or deployment claim is based solely on local tests, copied docs inputs, source inventories, or stale artifacts.
- Source checkouts stay pristine; no indexing, unauthorized commits or publication occurred.

### Final output

Write **one concise staff-review report** with:

1. Direct judgment: architecture sound/not yet sound; browser parity qualified/partial; package installability qualified/partial. Do not judge the unfinished, separately assigned documentation website.
2. Prioritized source-backed findings and fixes, with exact paths.
3. Executed evidence, tested scope, engine/source/artifact tuple, and remaining blind spots.
4. Actual implementation gaps separate from blocked/unexecuted verification.
5. Minimal ordered remaining work and corresponding Beads IDs.
6. Real local commands for exercising the library. Website instructions belong to the separate documentation chat.

Do not certify `bsolid-release-ready`, advance verified parity, publish, or claim a deployable documentation website while its mandatory gates remain open.
