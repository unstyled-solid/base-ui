# Runtime adaptation and verification invariants

Read this reference for runtime, shared-foundation, browser, or hydration deltas. It preserves source-reviewed lessons from the October 2026 migration and later shared-runtime review. These are engineering constraints and reproductions, not a permanent green status. The parent skill governs the weekly episode and task-dispatch workflow.

## Start with the actual requested scope

- Distinguish review-only from repair. A review request does not authorize fixes or delegation. Use subagents only when explicitly authorized, with disjoint file ownership; do not let multiple agents edit different line ranges of the same changing file.
- Read project `AGENTS.md`, `docs/solid2-contract.md`, and the relevant current Beads issue. Beads is authoritative; do not introduce another task ledger or reimport planning JSON.
- Use RTK for every terminal command. No commits, publication, remote sync, or upstream updates without authorization. Never initialize, rebuild, or refresh the code index; use existing indexed search only when it cannot trigger rebuilding.
- Preserve the shared working tree, including untracked implementation files. A cancelled worker may already have applied patches. Inspect its history and current files before assuming cancellation meant no changes; disclose any partial work.
- This runtime reference does not establish website deployment status. For documentation deltas, read `docs-and-distribution.md` and the current website's own sources. Keep a library-only request library-only; reconcile website changes when they belong to the requested episode.

## 1. Reconcile the right source, not a remembered API

Use the immutable source SHA recorded for the current update episode. At the review that established these lessons:

- React Base UI: `upstream/base-ui`, `19511bb171f3b360b006c94cf6d07e53cb446505`.
- Solid donor: `upstream/solid-floating-ui`, `0492e49b746deed543dbc167a9a58ed1210c2393`.
- Port runtime/compiler: coordinated Solid `2.0.0-rc.13`.

These are historical anchors, not permission to overwrite newer pins. Upstream checkouts are read-only. Never use `../ref/base-ui-solid` as implementation source. For an authorized update, use the project's existing upstream workflow and retain its separation of baseline, candidate, and verified parity; do not invent a replacement update process or advance verification on partial evidence.

For each changed behavior:

1. Read the exact upstream implementation **and its relevant test**.
2. Find the corresponding target and shared consumers.
3. Preserve observable DOM, input properties/defaults, native events, cancellation, callback ordering, focus, ARIA, CSS variables, and cleanup.
4. Translate framework mechanics deliberately. Getter-backed state, accessors, factories, native events, and render callbacks are legitimate native adaptations; missing capabilities are not.

### Floating UI: retain the existing layers

`@floating-ui/dom` already supplies geometry. Base UI adds interaction/root/tree behavior; our adapter provides Solid ownership and live state. Do not rewrite the geometry engine to fix an adapter defect.

- Canonical wrapper: `upstream/base-ui/packages/react/src/floating-ui-react/hooks/useFloating.ts`.
- Donor references: `upstream/solid-floating-ui/packages/solid-floating-ui/src/hooks/useFloating.ts` and `usePosition.ts`.
- The pinned Base UI `useBaseUIFloating` **requires a root store**. The donor's generic standalone `useFloating` has a broader contract. Do not repeatedly chase absent standalone options without checking which API Base UI actually exposes.
- The donor uses Solid 1 constructs, including `batch` and `createRenderEffect`. It is useful source, not a drop-in Solid 2 runtime dependency.
- Keep returned geometry, refs/elements, root identity, tree publication and disposal consistent. Test actual component consumers as well as plain-object API fixtures.
- Root and geometry contexts can be distinct objects sharing the same imperative `data`. Dismissal policies must follow that shared identity rather than assume wrapper object identity.
- Tree publication assigns `node.context`. A getter-only node context passes structural typing but throws at runtime. NavigationMenu exposed this: retain a writable node slot with a live fallback context, not a frozen snapshot or a swallowed assignment error.
- `FloatingTreeStore()` is an explicitly documented native factory mapping. Do not pretend a factory supports React's `new` syntax.

## 2. Check Solid 2 semantics before editing lifecycle code

Use the already indexed docs MCP, for example:

```text
search_docs({ library: "solidjs", version: "2", query: "createEffect compute effect callback cleanup" })
search_docs({ library: "solidjs", version: "2", query: "createSignal writable derivation staged writes" })
search_docs({ library: "solidjs", version: "2", query: "ref ownerless onSettled ownership" })
```

Check version-specific compiler/runtime behavior against installed RC13 source/declarations. Relevant documentation:

- https://v2.solidjs.com/concepts/reactivity
- https://v2.solidjs.com/guides/avoid-unnecessary-effects
- https://v2.solidjs.com/reference/solid-web/jsx-properties/ref
- https://v2.solidjs.com/guides/custom-primitives
- https://v2.solidjs.com/reference/solid-js/reactivity/create-effect

Apply these rules:

- Effects have tracked compute and untracked imperative phases. Put rerun dependencies in compute. An intentional current-value snapshot in the imperative callback still needs explicit `untrack` under strict diagnostics. Do not subscribe to a value merely to silence a warning if the same effect writes it.
- Do not relay derived props/state through effects. Use memos or function-form writable signals when a derived default accepts local overrides. Select's opening highlight follows selection, then keyboard/pointer actions override it; that is a writable derivation.
- Writes are staged. Carry explicit transaction proposals through same-turn code rather than rereading the old committed getter. Do not add blanket production `flush` calls.
- Separate effects that propose navigation from effects that focus the committed highlight. Reading and rewriting `activeIndex` in one effect caused feedback.
- Refs are ownerless/untracked; their return values are ignored. Create resources in setup, and return cleanup from the setup-owned effect or `onSettled`. Never create primitives inside a ref or settled callback.
- Preserve actual owner-document identity. Template nodes can belong to inert documents without `defaultView` before adoption. Scroll locking must resolve the document at the guarded DOM checkpoint, with cleanup able to cancel pending acquisition.
- `transparent` is an advanced hydration-allocation tool, not a general warning fix. Document why a computation must not consume an ownership slot.

## 3. Preserve the integration invariants that previously broke

### Renderer, inputs and hydration

Primary paths: `internals/createRenderElement.tsx`, `utils/createMergedRefs.ts`, Field control/registration, and their colocated tests, under `packages/solid/src/`.

- Globally deferring refs can break sibling-input initialization, autofocus, detached handles, registration and ref-time events. Default-host ref delivery must avoid the spread effect's tracked dependencies while preserving initialization order.
- Register ownership-slot-consuming primitives consistently on server and client. Even a server `onSettled` callback that never executes can reserve a hydration slot.
- Keep complex calls out of dynamic-host JSX spreads when they change compiler-generated allocation. `<NativeHost {...omit(attributes, 'ref')} />` produced extra server slots; hoisting `const hostAttributes = omit(attributes, 'ref')` into shared setup fixed actual production hydration.
- Development hydration tests are insufficient for this seam. Rebuild and run the **production staged-package smoke**, preserving original node identity.
- Check controlled input `value`, natural `value` attribute, `defaultValue`, caret, rejected edits and FormData together. Do not add per-family attribute-sync effects to hide a shared renderer defect.
- Browsers can drain microtasks between native listeners. Restoring input at the target listener can erase an edit before the delegated handler reads it. Restore after delegated processing.
- Native validation must inspect the accepted controlled DOM value, not the rejected edit or the previous projection. Uncontrolled registration must not capture the initial baseline before the input exists.
- Nullish Solid style projection removes the whole attribute; React may retain `style=""` after removing transient CSS. A stable empty style object preserved that source behavior without adding an attribute on initially unstyled client hosts. Test real Select/Tooltip consumers and SSR separately.

### Positioning, focus and tree interactions

- `keepMounted` needs mounted-lifetime `autoUpdate`, not merely an initial calculation. React supplies a separate subscription for this branch. Test scrolling/resizing with actual moving anchors.
- Closed retained hosts may need one-shot middleware projection, including transform origin, without visible readiness, continuous tracking or scroll locking. Closing alone must not replace exit geometry with a measurement of a hidden zero-size box. Test initial closed mount, close, option changes, reopen and stale async completion.
- Lazy flip locks are measurement transactions. Preserve side-only versus full-placement locking and commit only an actual flip; avoid feeding every published result through an effect back into positioning configuration.
- Preserve source arithmetic grouping. Firefox exposed `49.000000000000014px` versus `49px` from reordered arrow calculations. Fix the arithmetic rather than widening comparison tolerance.
- The `aria-owns` helper span uses `ownerVisuallyHidden`; it is **not** a FocusGuard. Do not remove FocusGuard's full visually-hidden style.
- Native `focusin`/`focusout` identity, consumer callbacks and `preventBaseUIHandler` must share one merge chain. Tooltip's nested-focus and prevention failures came from splitting those paths.
- Focus listener lifetime should follow root/window/enabled state, not every active-reference publication. Otherwise staged registration can cancel queued blur work.
- Cursor reset should release a real virtual override and select the live DOM anchor. Repeatedly copying an already-derived anchor caused `EFFECT_RELAY_TEAR`.

## 4. Verify once per meaningful change, in widening scopes

Do not call a repair complete because its new isolated test passes. Also do not launch repeated full suites while workers are still changing shared files.

1. Establish the smallest reproduction and read source expectations.
2. Make a coherent patch across the necessary files.
3. Run focused runtime tests and strict types. Shared fixes need at least two real consumers.
4. Run browser cases for focus, geometry, native event timing and hydration. Fix fresh failures before broadening.
5. Once source is stable, run combined client/SSR checks and independent React/Solid comparisons. The before/after input fingerprints must match.
6. Rebuild artifacts after runtime edits; verify actual production hydration and declarations.

Known commands from the reviewed toolchain (check current scripts when maintaining a newer episode):

```sh
rtk pnpm test:jsdom <focused-filter> --no-watch
rtk pnpm test:chromium <focused-filter> --no-watch
rtk pnpm test:types --no-watch
rtk pnpm test:jsdom --no-watch --reporter=dot
rtk pnpm test:ssr --no-watch --reporter=dot
rtk proxy node scripts/test/negative-probes.mjs
rtk pnpm build:package
rtk proxy node scripts/distribution/build/smoke.mjs
rtk pnpm test:package-types
rtk proxy node scripts/distribution/types/validate.mjs --package
rtk git diff --check
```

Use `test/qualification/browser/README.md` for the independent oracle's exact current invocation and isolated engine requirements. Do not assume historical temporary tool paths exist. `.browser.test` filtering alone omits browser cases inside ordinary test files. Preserve genuine source platform restrictions.

### Interpret evidence honestly

- Separate assertion failures, unexpected runtime diagnostics, unhandled errors, unfinished modules, and infrastructure failures. One shared exception can generate hundreds of secondary failures; fix the first causal error before repairing families independently.
- The diagnostic harness must still reject leaks and unexpected findings. No broad suppression, fabricated native events, arbitrary sleeps or assertion removal.
- Whole-suite green, SSR serialization, browser hydration, workspace builds, and isolated tarball installation are different claims.
- ATTW's exact `CJSResolvesToESM/node16-cjs` and `NoResolution/node10` pairs were outside this ESM-only package's supported contract. Supported Bundler/ESM resolution failures must still fail. Keep classification explicit and tested; do not blanket-ignore `NoResolution` or add unsupported CJS.
- A Vite terminal warning is not a browser runtime diagnostic. RC13's generated `@solidjs/web` dependency emitted an unanalyzable `import(entryUrl)` warning even while browser scenarios passed. It was **not fixed** in this review. Do not edit generated `.cache/vite/deps` files or claim no warnings; an upstream/runtime annotation is a different change requiring source verification.
- Record exact commands, scope, versions, fingerprints and remaining gaps in existing Beads issues. Historical counts are not evidence for the next weekly update.

## Finish with a short maintenance handoff

Report the source range, changed behavior and files, intentional native adaptations, tests actually executed, and unresolved issues. Clearly distinguish defects from unexecuted qualification. Do not certify a full source matrix, devices/AT, mixed conditions or tarball consumers from representative checks. Keep website claims out of a library-only maintenance handoff.
