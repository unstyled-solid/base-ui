# Work log and continuation record

This document preserves historical decisions, completed work, verification,
and remaining obligations for future agents. It is not a substitute for reading
the current code or checking whether an old receipt still matches it.

## How to extend this record

- Inspect the final current code before adding claims from an older chat.
- Add source paths, rationale, verification commands/results, and evidence paths.
- Distinguish **implemented**, **verified**, **historical/superseded**, and
  **deferred**. A plan or handoff is not implementation evidence.
- Preserve earlier history; explain corrections or superseding changes instead
  of silently rewriting conclusions.
- Do not claim old tests qualify newer code. State when evidence is unavailable.
- Do not modify implementation or rerun large suites solely to fill this log.
- Do not store credentials, tokens, or machine-specific authentication material.

## Project baseline

- Working repository: `/Users/avi/avir-oss/baseui-solid2`.
- Fresh Solid 2 port; canonical behavior comes from React Base UI, not the older
  Solid port in the reference tree.
- Pinned React upstream: `upstream/base-ui`, commit
  `19511bb171f3b360b006c94cf6d07e53cb446505`, version 1.8.0. Read-only reference.
- Solid runtime/renderer/compiler baseline: `2.0.0-rc.13`.
- JSX belongs to `@solidjs/web`; use native Solid 2 scheduling and ownership.
- Mandatory local guidance: `AGENTS.md`,
  `.opencode/skills/solid-v2-runtime/SKILL.md`, `docs/solid2-contract.md`, and
  `test/harness/README.md`.
- Terminal commands use RTK. No commits, pushes, or publication were performed
  during the work summarized here.
- The working tree had extensive pre-existing modifications and generated
  artifacts. Those were preserved; a dirty-tree entry alone does not identify
  work authored in this continuation.

## Earlier work: protected baseline, not reimplemented here

The incoming handoff described completed performance/reactivity and browser
repairs. This continuation protected them rather than treating them as new work:

- Exact Intl/UTF-16 filter semantics and caches; live label converters;
  collection/virtualizer row identity.
- `mergeProps` foreign-reactive proxy semantics and renderer ownership,
  host identity, input focus/caret preservation.
- Autocomplete completion, Avatar live status accessors, Collapsible measured
  dimensions and owned two-frame transition entry.
- Live native label association after input-ID changes, CSSOM-normalized swipe
  transform cleanup, and native bubbling `focusin` for Toolbar text selection.
- Previously corrected browser fixtures for layout scaling, clocks, clipboard,
  form navigation, touch payloads, and NumberField Gecko release timing.

Earlier agents should extend this section with their actual implementation
history and final source references. These summaries are inherited context,
not an assertion that this agent independently reconstructed every prior fix.

## Audited skipped-case execution

### Goal and denominator

Executed the `bsolid-enable-audited-skips` handoff, beginning with ledger child
`.1`, coordinating overlaps with `bsolid-beta-source-parity`.

The denominator was **181 original expanded jsdom-skipped registrations**:

- 141 reviewed source counterparts: 7 direct, 121 adapted, 13 generated.
- 26 Solid-specific cases: 24 source-behavior regressions and 2 harness cases.
- 14 whole-case provenance ambiguities, retained explicitly rather than falsely
  presented as exact upstream counterparts.

Browser-only bodies were executed in real browser lanes; jsdom exclusions were
not removed to simulate layout, animation, focus, or native default actions.
Original row identities, assertions, and parameters were preserved.

### Receipt reconciliation

The old 804-entry browser continuation contained historical mixed-version
receipts. Its shared fingerprint differed from the current harness/configuration.
Those receipts were not rewritten or blessed as current passes.

Scoped execution covered 50 browser test files / 150 file-engine rows, plus the
two temporal adapter files in a pure Node lane. Existing runner isolation and
durable checkpoints were reused. A supplemental reporter recorded exact full
case names and results. Unchanged green checkpoints were resumed after local
repairs; no unrelated whole-browser-matrix restart was performed.

### Initial test-only corrections

| File | Final change and reason |
|---|---|
| `packages/solid/src/tooltip/root/TooltipRoot.test.tsx` | Fake only `setTimeout`, `clearTimeout`, and `Date` for hover-delay tests. Native ResizeObserver and its RAF remain on the same real clock; fixes Firefox teardown timer leaks. |
| `packages/solid/src/menu/Menu.review.test.tsx` | Query named `Open`/`Actions` triggers. WebKit source focus guards legitimately also expose `role="button"`; preserve callback, cancellation, ID and host-identity assertions. |
| `packages/solid/src/slider/Slider.gestures.test.tsx` | Reuse `packages/solid/test/touch.ts` for constructor-safe synthetic touch delivery. Desktop Firefox lacked `TouchEvent`; identifiers and coordinates are retained. |
| `packages/solid/src/number-field/NumberField.gecko.test.tsx` | Apply and restore existing `mockPointerLockPolicy` only in the already-mocked successful-lock unit fixture. Avoid combining mocked Gecko behavior with natural WebKit no-cursor policy. |
| `packages/solid/src/internals/temporal/describeGregorianAdapter/testComputations.ts` | Remove the library-name skip from the existing `now` test. Date-fns and Luxon bodies pass unchanged, including timezone parameters and the strict 5ms assertion. |

At that checkpoint 178 rows had clean containing-file receipts, two PreviewCard
animation bodies passed but their containing Firefox file was red, and date-fns
row 135 remained blocked. This was an intermediate result, superseded below.

### Follow-up repairs under explicit user-authorized delegation

The user requested a subagent to resolve all remaining failures and investigate
date-fns online. That agent reported and verified these final repairs:

- **PreviewCard synchronized closing:**
  `packages/solid/src/floating-ui-react/hooks/createHoverFloatingInteraction.ts`.
  The combined hover effect could dispose the parent's child-close listener
  before the child emitted its close. Separate pointer-style ownership from
  listener ownership. Original full `PreviewCardRoot.test.tsx` now passes
  **48/48 in Chromium, Firefox, and WebKit**. Rows 141/142 now have clean receipts.
- **Nested Tooltip teardown:**
  `packages/solid/src/tooltip/root/TooltipRoot.nested.test.tsx` uses the established
  selected hover-delay clocks. **21/21 pass in all three engines and jsdom**.

An earlier experiment awaiting PreviewCard positioner readiness did not fix the
full-file failure and was reverted. It is not part of the final implementation.

### Final audited disposition

**180/181 original rows verified; one explicitly deferred source-contract case.**

- Row **135**: date-fns “convert the date to the default timezone.” The original
  fixture provides `setDefaultTimezone: null`; removing its gate reproduced
  `TypeError: setDefaultTimezone is not a function`.
- Official date-fns timezone documentation and actual installed
  `date-fns@4.4.0` / `@date-fns/tz@1.5.0` probes were consulted. Explicit
  `TZDate`/timezone contexts work, but do not provide this adapter's missing
  configurable-default contract.
- Changing host TZ to New York or Paris changes native offsets, but the original
  `getTimezone(setTimezone(date, 'default'))` still returns `"system"`.
- Pinned upstream `TemporalAdapterDateFns.ts:229-242` has the same plain-Date
  semantics. Replacing the expected values, parameters, or adding a new adapter
  capability would change the contract. The original predicate was restored;
  no new skip was added.
- **The user explicitly chose to leave row 135 for later and proceed toward a
  public release.** Do not repeatedly reopen it as publishing work.
- Row **60**: the existing WebKit pointer-lock-cursor geometry exclusion is
  legitimate source policy. The case passes in Chromium and Firefox. A mocked
  lock unit fixture is not evidence of native WebKit pointer-lock capability.

### Last behavioral verification before publication-identity changes

| Check | Result |
|---|---|
| TypeScript and contract types | PASS |
| Full jsdom | 5,228 passed, 179 skips, 314 files |
| Full SSR | 130 passed, 47 files |
| Scoped audited browser containing files | 4,541 passed, zero failures, one existing platform exclusion |
| Additional hover/navigation protection | 210 passed |
| Integrated Chromium/hydration protection | 125 passed |
| Native interaction scenarios | 48/48; zero diagnostics/errors |

The jsdom count changed from 5,226 passed / 181 skipped by enabling precisely
rows 134 and 136. No scenario was deleted to explain the count change.
These are scoped results, not a universal claim about every browser suite.

### Historical tracker state

After the follow-up, audited child `.3` was closed. Children `.1`, `.2`, `.4`,
and `.5` were already closed. `.6`, `.7`, and the parent remained blocked on
row 135. Source-parity `.5` was technically resolved, but its closure was still
prevented by the open `.1` dependency.

The user subsequently instructed this agent to stop Beads work for release
preparation. This section records history; it does not request more tracker work.

## Public release identity and package preparation

### User decisions

- Use independent package version **`0.1.0`**, without a beta suffix.
- npm package: **`@unstyled-solid/base-ui`**.
- GitHub organization: <https://github.com/unstyled-solid>.
- Root and subpath imports must work under the selected public name.
- The user did not specify a repository name within that organization; no
  repository URL or GitHub repository creation was invented.

### Implemented publication changes

| File | Purpose |
|---|---|
| `distribution/package-contract.json` | Selected public name, version, organization homepage, registry install example, and publication/staging identity rules. |
| `packages/solid/package.json` | Version 0.1.0 and public-facing description. Development workspace name remains private `baseui-solid2`. |
| `scripts/distribution/build/index.mjs` | Stage the selected public name with `private: false` and public npm access; rewrite declaration self-references; exclude fixture/emit-only files from runtime builds. |
| `scripts/distribution/types/shared.mjs` | Optional AST module-literal identity rewrite preserving emitted signatures, namespaces and JSDoc. Includes module augmentations. |
| `scripts/distribution/consumers/policy.mjs` | Validate archive name against selected publication identity, falling back to workspace identity when unselected. |
| `packages/solid/tsconfig.build.json` | Exclude fixture-only files from declaration compilation. A pre-existing touch fixture imported test code outside production `rootDir`. |
| `scripts/distribution/build/build.test.mjs` | Assert public identity; supply the fixture's required Markdown manifest for its existing reproducibility test. |
| Root `package.json` | `build:package` now stages third-party notices after declarations/runtime output. |
| `packages/solid/README.md` | Public installation/import examples, exact Solid 2 peer expectations and provenance. |
| `docs/publish.md` | Detailed next-agent publishing procedure and authentication blocker. |

**The private source workspace is not the published package.** The publishable
manifest and compiled artifacts live in `packages/solid/build`. This deliberate
separation avoids renaming every development import and historical artifact.

Build output at verification: 927 declaration modules, 924 DOM modules,
928 server modules, and 79 explicit export keys (76 runtime / 3 types-only).
No runtime dependency upgrades or component behavior changes were part of
publication-identity preparation.

### Publication verification

- `rtk pnpm typescript` — PASS.
- `rtk pnpm build:package` — PASS after correcting fixture inclusion.
- `rtk proxy node --test scripts/distribution/build/build.test.mjs` — **12/12**.
  Includes artifact completeness, reproducibility, condition resolution, and
  actual emitted declaration checks.
- `rtk proxy node scripts/distribution/notices/stage.mjs` — staged MIT,
  donor and other third-party licenses/notices/provenance.
- Packed the staged directory using `npm pack`.
- Independently installed the actual tarball with stock registry dependencies.
- Strict TypeScript NodeNext compilation passed with `skipLibCheck: false`,
  public root/subpath imports, and both temporal adapters.
- Actual Node server and `--conditions=browser` root/subpath imports passed.

An initial smoke fixture used `@types/luxon@3.7.1`, which did not satisfy the
package's existing `^3.7.6` peer. The smoke fixture was corrected to the actual
project pin `3.7.6`; no package peer requirement was weakened.

### Publication status at this handoff

**Prepared and verified locally, NOT published.**

`rtk proxy npm whoami` returned `ENEEDAUTH`. The next agent must obtain a valid
authenticated npm session with permission for the npm `@unstyled-solid` scope.
GitHub organization ownership is separate from npm permissions.

Follow `docs/publish.md` to publish the exact verified archive and confirm the
registry version, integrity and `latest` tag. Rebuild if inputs changed; do not
assume an old temporary tarball contains later code.

## Evidence locations

Temporary evidence root used by this continuation:

```text
/var/folders/k1/dqkw16gn09q6492v5jn1x_jc0000gn/T/opencode
```

Important artifacts beneath it:

- `bsolid-181-skipped-provenance.json` / `.md`: original audit denominator and
  detailed source/parameter mappings.
- `bsolid-enable-audited-skips-results.md`: latest audited execution report.
- `bsolid-enable-181-disposition.json`: exact per-row results and receipt paths.
- `bsolid-enable-family-{2,3,4,5,6}/`: scoped runner plans, checkpoints,
  per-case receipts and complete logs.
- `bsolid-enable-family-3-before-hover-repair/`: retained pre-repair evidence.
- `bsolid-enable-regression-summary.json` and associated logs.
- `bsolid-enable-temporal-reproduction.json.cases.json`: original row 135 failure.
- `bsolid-enable-temporal-checkpoint.json`: Node adapter verification fingerprints.
- `bsolid-date-fns-default-probe.mjs` / `.json`: installed-adapter research probe.
- `bsolid-hover-investigation.md`, `bsolid-hover-protection*`,
  `bsolid-hover-integrated-chromium`, `bsolid-hover-native-protection.json`:
  follow-up repair/protection evidence.
- `unstyled-solid-base-ui-0.1.0.tgz`: prepared public-name tarball.
- `unstyled-release-smoke.mjs`: independent tarball consumer check.
- `unstyled-release-smoke-4I6X36/`: passing independent consumer installation.

Temporary paths may disappear. Preserve durable conclusions here, but do not
claim an unavailable artifact was rechecked. Git history, final code and exact
source references should supplement this record as earlier agents fill it in.

## Sections for earlier contributors to complete

Add only what you can ground in final current code and your actual work:

1. Original architecture, foundation contracts, and significant Solid 2 adaptations.
2. Component-family implementation history and source-parity decisions.
3. Completed performance/reactivity repairs: causes, protected invariants, paths,
   and meaningful measurements or regression gates.
4. Renderer/portal/focus/caret/host-identity repair history.
5. Distribution, packed-consumer, optional-peer, SSR/hydration, and license work
   completed before this continuation; distinguish outstanding qualification.
6. Documentation/site generation and developer workflows actually available.
7. Superseded approaches, known limitations, and concrete remaining work not
   already recorded above.

Do not fill these headings with inferred completion claims. Leave unknowns
explicit rather than turning a historical plan into a statement of fact.

## Initial migration fleet and source-first repair history

This addition supplies the earlier orchestrator's implementation history. The
current source files named below were inspected before writing it; **no new test
suite, source update, or publication was executed to prepare this record**.
Historical receipts describe their tested revision, not the later publication
identity or current entire tree. The newer audited-skip and publication results
above supersede earlier aggregate counts and private-package assumptions.

### Bootstrap, shared contracts, and fleet execution

**Implemented; bootstrap verification is historical.** The project entered the
conversation with 11 epics and 108 dependency-linked implementation tasks, not
with a library to migrate from Solid 1. Bootstrap was the only initially ready
implementation task. Existing tracked/untracked files and the reference repo's
dirty lockfile were preserved. Disjoint shared-tree ownership was used because
there was no suitable committed implementation baseline for worktrees.

- The workspace, source submodule and exact RC13 toolchain were established in
  root/package manifests, `pnpm-workspace.yaml`, `tsconfig.json`, and
  `packages/solid/src/internals/contracts/`. Structural rendering, native-event,
  controlled-request, raw-element, item, field, portal and floating contracts
  made downstream ownership explicit. `docs/contracts.md` records the seams.
- `tracking/bootstrap.json` retains actual version/import evidence, source SHA,
  untouched-reference lockfile hash, frozen-install/compiler/runtime/client/SSR
  proof commands, and the historical identity correction from
  `@base-ui-solid/solid` to private `baseui-solid2`. The selected public identity
  described above is a **later** change; neither old placeholder was an npm claim.
- Independent harness/distribution/source-inventory/docs-intake/upstream/donor
  lanes were followed by DOM/lifecycle/filter/temporal leaves. Then 37 atomic
  component assignments implemented family-local parts, namespace exports,
  types, data/CSS contracts and tests. Checkbox/CheckboxGroup and Radio/RadioGroup
  remained paired owners; large families implemented their sequential stages.
- The user explicitly allowed typed foundation scaffolds to unblock parallel
  component authoring. They threw rather than pretending interactions worked.
  Initial import/scaffold failures were not accepted as parity; shared runtime
  implementation and real-consumer replay followed.
- Source-first component reviewers repaired code directly, plus setup/foundation
  reviewers addressed common causes. A later oversized foundation session was
  stopped for a concise handoff and replaced by fresh, narrowly scoped workers.
  The eventual task unit was a coherent seam/regression, not one tiny edit per
  failing consumer or one indefinitely growing shared-runtime conversation.

The detailed retrospective and 105 substantive child-session IDs are in
`../mighty-migration-dump.md`. Parent recall session:
`ses_ef6ffeaeaffeeOKj6QrOzdVLvf`. Use targeted recall for exact old handoffs;
do not resume the enormous historical reviewer merely to apply another tweak.

### Durable runtime decisions and confirmed current implementations

The port deliberately preserves React **outcomes**, not React lifecycle
machinery: native events/refs, live `class`/style/state, accessor/factory mappings,
and render callbacks replace synthetic-event wrappers and cloned JSX elements.
Controlled requests carry explicit same-turn proposals because setters stage
writes. DOM nodes and transaction/registry identity remain raw. Effect inputs
belong in compute; ref callbacks do not allocate owners or return usable cleanup.

| Area / original failure | Implementation and current inspection |
|---|---|
| Default native hosts recreated descendants or captured broad reactive state | `packages/solid/src/internals/createRenderElement.tsx` now separately resolves child-bearing sources, state attributes and merged construction; `ownedHost`/static `NativeHost`/`Ready` boundaries keep host identity out of changing attribute enumeration. State proxy reads use the original receiver; key presence is reactive. These boundaries were refined again by later systemic work, not frozen at the initial patch. |
| Ref replacement/disposal inherited an effect owner, duplicated attach, or missed custom-host removal | `utils/createMergedRefs.ts` has typed server no-op refs, deduplicated inputs, setup cleanup, and `untrack` plus `runWithOwner(null)` for every callback path. Renderer removal observation distinguishes a disconnected removed node from native Portal reparenting. Initial refs precede settled/sibling consumers; later delivery is guarded. |
| Production hydration namespace mismatch despite passing compiler controls | Renderer `ownedHost` registers `onSettled` on both server and client: server registration reserves an ownership slot even though its callback does not run. `hostAttributes = omit(attributes, 'ref')` is hoisted outside JSX; call-expression spreads had changed server allocation. `internals/createRenderElement.hydration.browser.test.tsx` and the real fixture service exercise actual components rather than rewriting hydration keys. |
| Field parts lost context in an independent real Form host | `field/root/FieldRoot.tsx` resolves `children(() => props.children)` in `RootElement` beneath both providers, then forwards a stable child accessor. Merely removing an outer JSX spread did not fix it. `field/root/FieldRoot.children.test.tsx` retains validation, association, identity, conditional-registration and disposal coverage. |
| Original logical content ancestry differed from a sibling portal's mount/focus ancestry | `floating-ui-react/components/LogicalLayerContext.ts` provides an accessor independently of PortalContext. `navigation-menu/list/NavigationMenuList.tsx` wraps its original subtree with the root logical layer without extra DOM elements or wrapping the sibling portal in its own layer. The integration browser file retains nested Dialog/body/Lite branches and genuine outside dismissal. |
| Focus callback native types and ordering differed from source | `floating-ui-react/hooks/createFocus.ts` uses `onFocusIn`/`onFocusOut`, original Event identity, current root/options and a root/window/enabled subscription lifetime rather than recreating listeners for every active reference. Source FocusGuard styling was preserved; the minimal fixed style belongs to the separate `aria-owns` helper. |
| Literal export matching restored meaningless React compatibility | `floating-ui-react/utils/event.ts` does not provide `isReactEvent`; `test/integration/RootExports.test.ts` explicitly records it as a React-only exclusion and asserts absence. Meaningful utilities/capabilities remain checked; the exclusion is not permission to omit observable native behavior. |

Canonical comparison included the pinned React renderer, merged-ref/event,
Field/validation, popup/focus, Portal, NavigationMenu and component source tests.
These inspected implementations are **present**; this document extension did
not independently rerun their assertions on the latest code.

### Avatar publication barrier: completed repair, then superseded design

**Historical fix verified then; implementation subsequently replaced.** Cached
default-mode hydration originally made Image eligible one staged commit before
Root received loaded status. The MutationObserver recorded reinsertion of the
original fallback itself, not merely Root reparenting. A one-time status
publication barrier synchronized image presence and Root; both hydration modes
and all ten Avatar Chromium bodies passed at that repair checkpoint.

That barrier is **not the current design**. Inspection of
`avatar/root/AvatarRoot.tsx` and `avatar/image/AvatarImage.tsx` confirms Root now
selects the notifying image's status accessor through `registerImage`; Image and
Fallback consume that same source. The current Image explicitly says no initial
publication barrier or subsequent status relay is necessary. Source-defined
cleanup resets Root to idle even for a non-current Image. Do not resurrect the
old barrier from an earlier successful receipt or describe it as still installed.
This complements, rather than reclaims, the later live-status work recorded in
the protected-baseline section.

### Native-browser diagnoses that prevented incorrect production fixes

- **Drawer capture — verified fixture correction.** The same connected popup
  held capture after down but lost it on the first CDP move; there was no
  production release call. Held packets omitted `button: 'left'`. The corrected
  `drawer/viewport/DrawerGestures.browser.test.tsx` preserves held/released button
  state, timestamps, iframe scaling, trusted got/lost capture and once-only swipe
  completion. Full gesture-file replay passed **57/57** at that checkpoint. Do
  not infer this old packet failure requires a gesture-engine workaround.
- **NumberField pointer lock — native evidence, bounded attribution.**
  `number-field/NumberField.browser.test.tsx` now observes real
  `pointerlockchange` before movement and asserts `movementX=10`, `movementY=0`,
  native value/commit and release. The headed native lane granted actual lock;
  the fresh worker's two focused bodies passed. It did **not reproduce** the
  earlier 639-versus-10 value, so its synchronization hardening is not a proven
  explanation for that historical value. Existing later clock/Gecko corrections
  above remain separate.
- **PreviewCard geometry — retracted shared-cause claim.** A collapsing-margin
  fixture scrolled by 150px on focus. Source-shaped padding and native Tab
  interactions repaired `preview-card/positioner/PreviewCardPositioner.browser.test.tsx`;
  shared collision arithmetic was correct for the actual rects. Earlier claims
  that middleware was wrong were retracted.
- **Popover animation epochs — valid fixture sequencing.**
  `popover/viewport/PopoverViewport.browser.test.tsx` had finished pending
  animations before starting-style/measurement produced the actual new epoch.
  Waiting for native readiness retained, rather than removed, previous-content,
  inertness, latest-payload, identity and completion-order assertions. Source
  Viewport cleanup was read before that correction.
- **ScrollArea observer feedback — production repair, not suppression.**
  `scroll-area/viewport/ScrollAreaViewport.tsx` and
  `scroll-area/content/ScrollAreaContent.tsx` coalesce observer-driven geometry
  in setup-owned RAF with cancellation and source initial-delivery deduplication.
  This removed actual ResizeObserver-loop errors. The original native thumb
  formula remained; settled track/margin and CDP animation-target GC assertions
  in `ScrollArea.browser.test.tsx` passed **35/35** at that checkpoint.

### Real harness and oracle infrastructure delivered before later audits

**Implemented; available in current code.** Relevant paths:

```text
scripts/test/{run,ssr-fixture,browser-batch,negative-probes}.mjs
scripts/test/{fixture-server,worker-reporter}.ts
test/harness/{setup,diagnostics,browser-setup,matchers}.ts
packages/solid/test/{createRenderer,describeConformance,nativeDocument}.ts*
vitest.config.ts
vitest.browser.config.ts
```

The setup repaired portal-aware `baseElement` queries, native-element-generic
conformance typing, compile-only `.spec.tsx` discovery, duplicate matcher
augmentation, per-run SSR artifact/cache deletion races, UTC source-test policy,
worker/crash attribution, and long screenshot filenames without disabling
diagnostics or screenshots. Owner, timer and unexpected diagnostic gates remain
real; the negative probes deliberately fail to test their enforcement.

`scripts/test/fixture-server.ts` currently compiles a physical fixture entry
using pinned Babel SSR and executes fresh server-condition Node per request. It
bridges native assets/bootstrap and exposes `/__harness__/ssr.html`; this replaced
the failed virtual-entry experiment. `fetchSSRFixture`,
`mountSSRFixtureHTML`, `hydrateSSRFixture`, and `prepareNativeDocument` are the
owned helpers: adopt nodes before active-realm checks, capture serialized scripts
before moving `<main>`, and restore hydration globals after native work finishes.
`test/harness/browser-setup.ts` installs genuine Chromium CDP and does not invent
a trusted replacement for other engines.

The independent oracle in `test/qualification/browser/` and
`test/qualification/react-oracle/` used a pristine exact-SHA throwaway React
checkout with isolated Node **24.21.0** and pnpm **12.8.1**. Root Node25 could not
satisfy an upstream sigstore engine; upstream engines were not relaxed. Original
selected React bodies passed **109 tests across three engines** historically.
Comparisons observe natural DOM/attributes/CSS, control properties, focus, ARIA,
callbacks and FormData. Only documented generated IDs/framework markers and
serialization ordering are normalized. Fingerprint-invalidated concurrent runs
are diagnosis, not final parity receipts.

Evidence confirmed present while extending this document:

- `test/qualification/browser/.cache/field-focused/{summary,chromium-form}.json`:
  source-equivalent Form fixture reached zero differences after Field ownership
  repair; corresponding Field/Form client receipt reported 217 passes.
- `test/qualification/browser/.cache/focus-parity-after-tooltip/{summary,chromium-tooltip}.json`:
  focused native focus-event repair reached zero Chromium differences.
- `test/qualification/browser/.cache/combobox-attrs-stable/`: retained partial
  attribute comparison, including the then-unresolved value-attribute/ref-loop
  findings. Those findings predate the later renderer/default-value/projection
  work; they are **not reasserted as current defects** here.

Earlier full runs grew from 4,767 passes/129 failures with four worker crashes
to 5,100 passes/four failures without crashes, and an SSR checkpoint passed
126/126. Later focused repairs and the newer audited results above supersede
those totals. Counts overlap and must not be summed. A fresh geometry/morph pass
verified 106 real browser assertions without inventory inflation; it also noted
that an exit-position snapshot alone did not prove continuous exit geometry.

### Initial integration and distribution foundation

**Implemented; original private-artifact checks are historical.** Before the
public-name preparation above, the fleet supplied:

- `packages/solid/src/index.ts`, `src/types/index.ts`, native export aliases and
  `floating-ui-react/{index,types,utils}.ts` facades.
- `test/integration/RootExports.test.ts`, `RootCrossFamily.test.tsx`,
  `Root.types.tsx` and `Root.ssr.test.tsx`: namespace/capability/alias checks,
  strict consumers, no React/legacy renderer imports and real cross-family
  Toolbar/forms/portals/nested-overlay/CSP replay.
- `scripts/distribution/build/`, `scripts/distribution/types/` and library build
  configs: module-preserving DOM/server ESM, independent declarations, `.js`
  imports, source maps, external runtime peers, exact 79-key contract and
  optional-date-peer isolation. Runtime clean did not delete declaration output.
- Pinned Babel fallback for the native RC13 SSR compiler's type-only generic
  capture (`Value`/`S` becoming undeclared runtime identifiers).
  `scripts/distribution/build/compiler.mjs` still contains separate tested native
  and Babel paths and performs no second JSX pass or React preset conversion.

The original default staged-package smoke preserved Toggle/Separator nodes,
state/events and disposal in minified Chromium, separate from its compiler-only
control. **Current inspection found `scripts/distribution/build/smoke.mjs:19`
still asserts `manifest.private === true`.** Consequently its old private-stage
receipt is not verification of today's public staged manifest. The independent
public-name tarball evidence above is a different check; this log extension does
not repair or rerun the old smoke driver.

### Donor intake and safe weekly-update foundation

**Implemented; qualification boundaries retained.** The developer added
`solid-floating-ui` as a separately owned donor. Its pinned source is
`0492e49b746deed543dbc167a9a58ed1210c2393`; it is Solid1 adaptation material,
not an installed target runtime or alternative behavior oracle.

`tracking/donors/solid-floating-ui/{assessment.md,source-map.json,provenance.json}`
records exact source, license and owner mappings. Donor effects/providers/refs,
promise races, event fanout, arrow offset-parent semantics and defaults could
not simply replace Base UI outcomes. The current provenance still has
`compatibility.adaptedSourceSha: null`; planned mapping/adoption intent must not
be represented as a qualified donor revision. `@floating-ui/dom` remains the
geometry dependency; native adapter/root/tree/interaction ownership is separate.

The initial CLI implemented `init/update/status/abandon/unlock`, source-local
locks and durable recovery journals, exact hashed immutable ranges, candidate /
baseline / verified separation, and queuing without moving an active source.
`scripts/upstream/git/state.mjs` still distinguishes Base UI's candidate checkout
from the donor's baseline checkout. The donor's original first-update movement
bug was corrected and tested rather than retained as a second updater.

**Superseded reservation:** `upstream:verify` was initially fail-closed and not
implemented by that fetch worker. Current `scripts/upstream/cli.mjs` now imports
`verify/core.mjs`; verification requires an evidence path/hash, is check-only by
default, and `--advance` requires exact evidence/closed prerequisites/live approval.
The core checks immutable source/report mappings, runtime inputs, artifacts,
scenarios and donor oracle state. This later implementation was inspected, not
authored or newly qualified by this addition. Earlier skill/handoff statements
that verification is permanently absent are historical, not current command truth.

### Documentation contribution and ownership boundary

This fleet implemented **content intake**, not the later full website:
`docs/scripts/sync/`, `docs/content/transforms/`, `docs/upstream/`, and
`docs/upstream-manifest.json`. It captured 739 source inputs / 84 MDX pages,
excluded copied React `types.md` as Solid API truth, preserved semantic flags,
source hashes/assets/prose and unknown-node failures, and passed 11 content tests
at that handoff. Imported content did not imply deployability.

The historical answer “there is no docs:dev/docs:build” is now superseded.
Current root `package.json` and `docs/site/README.md` provide site, demo/API,
completeness/Markdown and browser commands. Those later website implementations
belong to other contributors; this addition does not claim to have authored or
reverified their current site. `docs/staff-architecture-browser-review.md` was
deliberately scoped away from the then-unfinished website to permit disjoint work.

### Maintenance knowledge and evidence limits

The contribution also expanded
`.opencode/skills/maintain-from-source/SKILL.md` and its focused references for
immutable source episodes, bounded parallel delta tasks, runtime invariants,
docs/distribution regeneration and native verification. The original workflow
capabilities were explicitly time-qualified; compare them with current code
(notably the now-implemented verifier) before executing a new delta.

No new release-readiness verdict, source-state promotion, device/AT result,
or current whole-library pass is asserted by this historical addition. The newer
audited receipts, chosen row135 deferral and public-identity decisions already
recorded above are preserved, not reopened. No Beads or implementation file was
changed while extending this document.
