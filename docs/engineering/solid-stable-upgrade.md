# Solid stable toolchain upgrade

Registry metadata checked 2026-11-19. Integration base: `main`,
`26cab3df0fe2a5e702d364acdc5d2e92c33b6e1d` (`origin/main`).

| Packages | Before | After |
| --- | --- | --- |
| solid-js, @solidjs/web, @solidjs/signals | 2.0.0-rc.20 | 2.0.3 |
| @solidjs/compiler, @solidjs/babel-plugin | 2.0.0-rc.20 | 2.0.2 |
| @solidjs/vite-plugin | 3.0.0-next.47 | 3.0.1 |
| @solidjs/testing-library | 1.0.0-beta.3 | 1.0.0-rc.2 |

The registry's testing-library `latest` remains the Solid 1 package; the
Solid-2-compatible `next` line is intentional. Runtime and compiler patch
versions differ legitimately. Package peers remain exact, with coordinated
workspace overrides and unchanged strict peer/engine enforcement.

## Changes

- Updated workspace/library/docs manifests, lockfile, distribution contracts,
  independent-consumer pins, version-sensitive proofs and consumer guidance.
- Removed the applied RC20 signals patch declaration. Stock 2.0.3's
  `shallowEquivalent` uses own data descriptors and does not invoke accessors.
  Historical patch files and RC reports remain as historical evidence.
- Kept the existing Babel build backend. Both native and Babel DOM/SSR syntax
  proofs pass; this does not establish that every historical native compiler
  limitation is fixed.
- Split build runtime and compiler versions, rather than incorrectly requiring
  equal stable patch numbers.
- Accounted for Vite's injected `$$moduleUrl` in the source SSR type-only test.
  The built temporal entry still has only a types export.
- Updated two RC-only null-ref-owner proofs: installed 2.0.3 `runRefCallback`
  explicitly runs untracked in the creating context for held-node staging,
  forbidding primitive creation there. This differs from the older guidance's
  ownerless wording. Disposal and ignored-ref-return assertions remain.
- Repaired the existing staged-package smoke's obsolete private/workspace-name
  assumptions so it actually tests the current published package identity.
- Added optional `BASEUI_RUNTIME_GATE_OUTPUT` and
  `BASEUI_CLICK_DIAGNOSTICS_OUTPUT` paths. Defaults are unchanged; this run uses
  external evidence paths to preserve existing user reports.
- Regenerated tracked demo catalog and static-site version guidance with the
  normal project generators. No component implementation was rewritten.

## Executed checks

Passed:

- `pnpm install --no-frozen-lockfile`, then `pnpm install --frozen-lockfile`.
- `pnpm typescript`, `pnpm test:types`.
- Runtime-identity proof, native/Babel DOM/SSR compiler proof, and all 12 local
  hydration fixture syntax/compiler combinations.
- `pnpm test:ssr`: 47 files, 132 tests.
- `pnpm build:package`; `pnpm test:package-types`: all 79 entrypoints in strict
  Bundler and NodeNext consumers.
- `node scripts/distribution/build/smoke.mjs`: actual staged root SSR, 74 server
  export imports, real Chromium hydration retaining original hosts, native click,
  independent client mount and disposal, zero diagnostics.
- `pnpm docs:build`, `pnpm docs:check` (86 routes), `pnpm docs:check:source`.
- Consumer-policy, release-overview and qualification-audit tests: 25 tests.
- Focused harness/bootstrap recheck after ref-contract adaptation: 30 tests
  passed. Runner accounting also reports 2 excluded cases; no alternate-lane
  execution is claimed here.
- Independent npm tarball install with strict peers and stock registry 2.0.3:
  74 server imports, pressed Toggle SSR, one Solid identity, types-only temporal.
  Archive SHA256:
  `74c9bfdb77cd8fec95d000abc4ddb63ae093d40b2fc79372bfdb48a04b221d84`.
  This is a focused archive smoke, not the full packed-consumer matrix.

Separate verification findings:

- `test/distribution/release-readme.test.mjs` retains an upstream-heading
  expectation incompatible with the already accepted README refresh at HEAD.
  The package-local registry README/subpath test passes. Tracked as `bsolid-hfto`.
- `pnpm docs:test:demos` passes source metadata/graph tests and builds, then
  fails its portal fixture's source-link expectation (upstream URL versus local
  fixture provenance). Tracked as `bsolid-3emb`.
- Full `pnpm test:jsdom --reporter=dot`: 6,101 passed, initially 3 failed,
  with 5 worker heap-exhaustion crashes and 5 unfinished modules. The two
  outdated ref-owner proofs pass after adaptation. ContextMenu's synchronous
  event dispatch inside a ref still triggers `STRICT_READ_UNTRACKED`.
  Unfinished modules are Menu.review, Menubar, Tooltip.parts,
  Menu.children.review and Menu.platform.review. Tracked as `bsolid-fs5z`.
  Raw runner accounting: 272 excluded, 355 pending; these are not claims of
  alternate-lane execution. Complete jsdom verification remains blocked.

The integrated interaction gate has separate external logs under
`$TMPDIR/opencode/baseui-stable-runtime-gate` (the full absolute path is in the
handoff). Its duplicate jsdom workers were terminated after repeating the
known multi-gigabyte heap-growth failure; this is an interrupted/failed stage,
not a passing run. Its final result must be included in the handoff, not
inferred from these focused passes.
No complete browser/platform parity or publication is claimed.

## Follow-up: bounded runtime repair

The five unfinished modules were a real upgrade regression, not concurrency
pressure. An isolated source archive of `origin/main` (no Git worktree and no
changes to the main checkout) ran the exact Menu provider-wrapped workload:

| Controlled profile, one worker / 512 MB | Result |
| --- | --- |
| RC20 runtime/compiler/plugin | Pass, 1.77 s |
| Stable solid-js/signals, RC20 web/compiler/plugin | OOM, 9.04 s |
| Stable signals only, RC20 solid-js/web/compiler/plugin | Pass, 1.60 s |
| Stable core with deferred native-child resolution | Pass, 1.62 s |

The installed `solid-js` provider changed from a `ChildrenReturn` accessor
(with `.toArray`) to bare lazy memos. The root adapters invoked an unmarked
native accessor as a payload callback in the computation constructing JSX.
That subscribed construction to descendant portal status, repeatedly creating
the subtree. V8 profiling showed reactive/DOM work, and temporary diagnostic
instrumentation observed over 5,000 constructed owners in 264 ms. That
instrumentation was removed; no diagnostic threshold was changed.

Minimal changes in MenuRoot, MenuFilterRoot, TooltipRoot and
useRenderDialogRoot use native `children` normalization and lazy JSX boundaries
to separate construction from resolution. Existing explicit `ChildrenReturn`
recognition remains: native children receive zero arguments; genuine payload
callbacks still receive the live payload. No source assertions were removed.

Verification after the repair:

- All five originally unfinished modules: **503 passed**, one worker / 512 MB,
  16.24 s, zero unhandled errors and unfinished modules. Raw runner accounting
  also reports 44 excluded cases; no alternate-lane execution is claimed here.
- Full standard-profile jsdom completed with **6,458 passed**, zero OOMs,
  unhandled errors or unfinished modules. Its one Dialog native-child arity
  failure was corrected by retaining the explicit native-child branch, then
  the directly affected Dialog and Menu child tests passed.
- Full SSR: **132 passed**. Package/docs builds and staged Chromium hydration
  smoke also passed after the construction-loop repair.
- A test-only attempt to move ContextMenu's synthetic ref-time dispatch into
  a render effect did not preserve its timing/diagnostic contract. A proposed
  shared native-event ownership change did not resolve the inherited strict-read
  context either. Both attempts were reverted in full. The original ContextMenu
  fixture and shared renderer remain unchanged; its strict-read failure remains
  an explicit verification blocker, not a demonstrated ordinary user-gesture
  failure. No warning suppression, ownership escape hatch or weakened assertion
  is shipped.
- An integrated run with a synthetic 1 GB cap on *all* processes stopped during
  TypeScript heap exhaustion before runtime stages. Standard TypeScript passes;
  memory-bounded comparisons apply to isolated runtime tests, not the entire
  typechecker. The subsequent standard full gate was terminated on user steering
  after its jsdom/SSR stages. The final scoped gate uses external output under
  `baseui-stable-handoff-gate`; its result is recorded in the handoff.

Diagnosis, source references, allowlist, non-goals, hypotheses, failed attempts,
acceptance criteria and bounded validation are recorded in `bsolid-fs5z`.
Planning, parallel-execution and runtime-guidance requirements were consulted.
There was no additional delegation, worktree, commit, push or publication.

## Final ContextMenu fixture correction

The remaining failure was the synthetic host fixture reading live render props
and dispatching an event inside a native ref callback. Stable ref callbacks
explicitly reject these untracked reactive reads. Moving the event after
`web.render` would weaken the test because `render` flushes before returning.

The fixture now mounts through owned `createRoot`/`insert`, which does not add
that automatic flush. Its native ref only captures/adopts the node. Immediately
after insertion, ordinary imperative test code installs the actual merged
handler, forwards the actual ref, and dispatches the same iframe event before
flushing. All original realm, release-document and callback-count assertions
remain. Added ref-signal assertions prove that the write is uncommitted before
the gesture and committed afterward. The root is disposed in `finally`.

TypeScript and all **23 ContextMenu host tests pass**, with diagnostics enabled
and no unhandled errors. No production event/renderer changes, diagnostic
suppression, dependency rollback, or weakened expectations were needed.
The final integrated gate **passes all 7/7 stages**: types, catalog, docs,
3,424 jsdom tests, 42 SSR tests, 180 Chromium tests, and trusted docs interactions.
There are zero unhandled errors or unfinished modules. Raw jsdom runner accounting
also reports 110 excluded cases; no alternate-lane execution is inferred for them.
Evidence is external under `baseui-astra-final-gate`; the seven preexisting user
browser-report modifications remain outside the upgrade commits.

## Releasing after merge

The repository's `scripts/release.mjs` is the release entry point. As checked on
2026-11-19, npm already publishes **0.0.3**, while the integration manifest is
still **0.0.2**. Do not use the default patch command (it selects the already
published 0.0.3). After merging, with a clean checkout and verified npm identity:

```sh
rtk git switch main
rtk git pull --ff-only
rtk proxy npm whoami
rtk pnpm release 0.0.4 --dry-run
rtk pnpm release 0.0.4 --yes
```

Recheck npm's latest version before selecting the explicit version. The `--yes`
command changes versions/lockfile, builds package/docs, checks docs/package
identity, runs npm publish dry-run, stages repository changes, commits, publishes
to npm, tags and pushes the branch/tag. It stages **all nonignored changes except
`aviross.pub`**, so the existing user browser reports must not be present as
uncommitted unrelated changes when releasing. This investigation ran dry-run
only; nothing was published.
