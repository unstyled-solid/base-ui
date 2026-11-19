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
