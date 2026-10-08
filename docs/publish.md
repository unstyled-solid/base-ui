# Publish @unstyled-solid/base-ui 0.0.1

## Latest: distribution fixes verified

The export-condition and tree-shaking failures below are **resolved** in a new
archive. Publication is outside the current task, per the user's instruction.

Final archive:
`/var/folders/k1/dqkw16gn09q6492v5jn1x_jc0000gn/T/opencode/unstyled-0.0.1-final-archive/unstyled-solid-base-ui-0.0.1.tgz`

SHA256: `cd0ba150ad60057dad9229471b625ce9ed3b8c4f2d311c3a862e96f132881a73`.
SHA512 integrity:
`sha512-jLmGEFI52R39+60O5fTjipZ9JRmIL/uKBqhiVB7cvPeCQxlgJF3MkUAU3VffYl+U5XwYr+O2oaiaIHhYzHDZHQ==`.

Final report:
`/var/folders/k1/dqkw16gn09q6492v5jn1x_jc0000gn/T/opencode/unstyled-0.0.1-final-check/report.json`.
This supersedes the initial failing archive and intermediate fixed checks.

All four independent stock RC13 consumers pass every package verification stage:
installation, import portability, module initialization audit, strict package and
fixture declarations, all 64 resolver subsets, actual server imports, temporal
checks, tree-shaking, SSR, worker SSR, Chromium hydration and optimized behavior.
Workspace runtime patches are absent. publint/ATTW supported ESM analysis and
archive inventory/immutability pass. The final archive contains 4,786 files.

- Export order is types, worker, browser, deno, node, default, with types-only
  entries unchanged. Library output and stock core/renderer now agree.
- All 256 resolver subsets pass. Per peer set, 24 server-condition subsets
  execute actual runtime imports, including browser+worker.
- All eight mixed browser+worker subsets per peer set execute real separately
  compiled SSR under their active conditions: 32 worker SSR runs pass. These are
  server lanes, not browser hydration lanes or omissions.
- All eight browser-without-worker subsets per peer set execute real Chromium
  rendering/hydration: 32 browser runs pass with zero diagnostics.
- Staged sideEffects is audited false. The unused import retains zero library
  modules (100 raw / 112 gzip bytes). Root and subpath Toggle retain the exact
  same 21 library-module graph, 96,882 / 96,885 raw bytes respectively. Minor
  bundle wrapper/name bytes differ; no exact total-byte equality is asserted.
- Optimized native events, disposal, original hydrated host identity,
  prehydration Toggle click replay, Tabs selection, scrollbar styles/CSP nonce
  and repeated mount/style cleanup pass in all four peer sets.
- Removed test-only hydration/plural fixture output and declaration leaks. The
  archive rejects these names and its initialization audit rejects unreviewed
  top-level calls/constructors/expressions, including import-time delegation.
- `rtk pnpm typescript` passes; build tests pass 12/12; consumer runner tests
  pass 24/24. No component assertions or diagnostics were weakened.

The report has **packageVerificationStatus: passed**, but deliberately retains
**status: blocked** and exit code 1 for missing full coordinator qualification
receipts. The missing six obligations are source-export-completeness,
current-markdown, adopted-notices, side-effect-audit, style-listener-disposal and
prehydration-events. This run provides concrete packed initialization and scoped
style/event evidence; it does not fabricate the broader archive-bound receipts
or complete the exhaustive upstream source-case audit. Existing generated
Markdown was packed rather than independently certified current. Accepted debt
remains explicit in `testing-debt.md` and the public README.

The initialization rationale is in `docs/distribution-initialization-audit.md`;
the durable final receipt is `distribution/release-0.0.1-verification.json`.

## Historical: initial 0.0.1 verification — 2026-10-07

The selected first release is now **0.0.1**. The 0.1.0 receipts below are
historical and do not qualify this archive. **Publication is blocked.**

Fresh build command: `rtk proxy env BASE_UI_PUBLISH_DOCS=true pnpm build:package`.
Regenerated declarations, DOM/server runtime, public README and license notices;
included 163 existing generated Markdown pages. Existing Markdown was packaged,
not independently certified current by the documentation qualification gate.
Build tests pass 12/12 after updating the version assertion.

Archive:
`/var/folders/k1/dqkw16gn09q6492v5jn1x_jc0000gn/T/opencode/unstyled-solid-base-ui-0.0.1.tgz`

SHA256: `2b08cc6b501fd3d699f283e8a7b8e290a332380e7d2c99401bf0d1553f48e730`.

Independent full report (includes complete commands/logs and retained consumers):
`/var/folders/k1/dqkw16gn09q6492v5jn1x_jc0000gn/T/opencode/unstyled-0.0.1-release-check-full/report.json`.
The earlier `unstyled-0.0.1-release-check` run was interrupted by a terminal
timeout; use only the completed `-full` report.

Executed four independent stock registry RC13 installations: no optional peers,
date-fns only, Luxon only, both. Workspace signals patch absent in all consumers.

- Archive inventory passes: 4,805 files, 79 exports, all targets present, three
  type-only entries, runtime peers pinned to Solid **2.0.0-rc.13**.
- Import portability and strict Bundler/NodeNext declarations pass in all four
  peer sets, `skipLibCheck: false`; temporal specialization/runtime checks pass.
- All 64 Node condition subsets pass in each peer set (256 total). This checks
  resolution; it does not establish browser helper compatibility.
- Independent production SSR passes in each peer set. publint/ATTW's supported
  ESM analysis passes under the existing documented classification.
- Chromium rendering/hydration passes 8/16 browser subsets per peer set (32
  successful runs): every subset without `worker`. These fixtures check static
  runtime namespaces, original hydrated host identity, prehydration Toggle click,
  native Toggle/Tabs events, scrollbar CSS/CSP and disposal.
- Every browser+worker subset fails (32 runs): library selects DOM while stock
  RC13 renderer selects server. Page error: `Client-only API called on the server
  side`. The crash precedes client initialization/hydration.
- Tree-shaking fails in all four installs: `unused: unwanted initialization
  retained`. Staged `sideEffects: true` remains conservative and unaudited.
  Ordinary unused root import retains 125 library modules, 39,229 raw / 12,328
  gzip bytes (empty: 99 raw bytes). Mounted root Toggle retains 143 modules,
  100,490 raw bytes; subpath retains 24 modules, 96,902 raw bytes. Later shaking
  assertions and optimized-behavior execution are not qualified by this run.
- Archive immutability passes. Six archive-bound coordinator qualification
  obligations remain missing; the full gate correctly reports blocked.
- `rtk proxy npm whoami --registry=https://registry.npmjs.org/` returns ENEEDAUTH.
  Scope publishing permission cannot be established until login.

Before publication, reconcile export conditions with stock RC13, audit top-level
initialization and justify sideEffects metadata, then rebuild and reverify the
new bytes including optimized events/hydration/styles. Complete the remaining
archive-bound qualification evidence and authenticate npm. Publish only the
exact passing `0.0.1` archive; do not publish this blocked archive.

Accepted behavioral limitations are recorded in `testing-debt.md` and the public
README: Collapsible's visible `EFFECT_RELAY_TEAR`, WebKit focus fallback research,
browser capability exclusions/pointer interference, unverified raw Safari hover,
and the incomplete exhaustive source-case audit. The deferred date-fns
default-zone setter case also remains explicit. No complete source-test parity
claim is made.

## User decision

- Publish **`@unstyled-solid/base-ui`**, version **`0.0.1`**, publicly on npm under the **`latest`** tag once verification passes.
- The user owns the GitHub organization <https://github.com/unstyled-solid>.
- Intended imports:

  ```tsx
  import { Button, Dialog } from '@unstyled-solid/base-ui';
  import { Checkbox } from '@unstyled-solid/base-ui/checkbox';
  ```

Work in `/Users/avi/avir-oss/baseui-solid2`. Use RTK for terminal commands.
The user explicitly requested **no more Beads work** for this release: execute
the publishing work directly. Do not commit, push, create a GitHub repository,
or create a GitHub release without separate authorization.

## Current state

The package identity is configured and a real tarball has been built and tested.
**It has not been published.** The last `rtk proxy npm whoami` failed with
`ENEEDAUTH`.

GitHub organization ownership does not establish npm scope ownership. The
authenticated npm account must have publishing permission for the npm
`@unstyled-solid` scope. Have the user complete npm login/2FA if needed; never
request tokens or recovery codes in chat or put credentials in repository files.

### Identity and build layout

- `distribution/package-contract.json` is the publication identity source:
  `publicationName: "@unstyled-solid/base-ui"`, `version: "0.0.1"`.
- `packages/solid/package.json` deliberately remains the private development
  workspace named `baseui-solid2`. Its version is `0.0.1`.
- **Publish `packages/solid/build`, not the workspace root or
  `packages/solid`.** The build generates the public package manifest there.
- The staged manifest has the public name, `private: false`, public npm access,
  and 79 explicit exports, with separate browser/server outputs and types.
- The build rewrites workspace self-references in emitted declarations,
  including temporal module augmentations, to `@unstyled-solid/base-ui`.
  Do not bulk-rename historical records or development imports.
- `packages/solid/README.md` contains the public install/import documentation.
- `rtk pnpm build:package` emits declarations, compiles runtime modules, and
  stages the required upstream/third-party notices.
- Runtime peers remain pinned to **`solid-js@2.0.0-rc.13`** and
  **`@solidjs/web@2.0.0-rc.13`**. This is a Solid 2 package, not Solid 1.

The repository already has extensive pre-existing changes. Preserve them.
Do not reset or clean the working tree to prepare publication.

## Already verified

The first public-name build passed:

- `rtk pnpm typescript`
- `rtk pnpm build:package`
- `rtk proxy node --test scripts/distribution/build/build.test.mjs` — 12/12
- Notice staging with `scripts/distribution/notices/stage.mjs`
- Independent installation of the actual tarball with stock registry peers
- Strict NodeNext TypeScript consumers using root/subpath imports and both
  temporal adapters, with `skipLibCheck: false`
- Actual root/subpath imports under Node server and browser conditions

Prepared tarball:

```text
/var/folders/k1/dqkw16gn09q6492v5jn1x_jc0000gn/T/opencode/unstyled-solid-base-ui-0.1.0.tgz
```

Reproducible independent-consumer smoke script:

```text
/var/folders/k1/dqkw16gn09q6492v5jn1x_jc0000gn/T/opencode/unstyled-release-smoke.mjs
```

That script installs the above tarball into a fresh temporary project, checks
strict types and both import conditions. It uses the installed dependency pins,
including `@types/luxon@3.7.6`.

These temporary artifacts may not survive indefinitely. If the package inputs
have changed or the tarball is missing, rebuild and verify the new archive.
Do not present earlier receipts as verification of different bytes.

## Publish procedure

### 1. Authenticate and check the registry

From the repository root:

```sh
rtk proxy npm whoami --registry=https://registry.npmjs.org/
rtk proxy npm view @unstyled-solid/base-ui@0.0.1 version dist.integrity --registry=https://registry.npmjs.org/
```

If authentication is absent, the user needs to complete:

```sh
rtk proxy npm login --registry=https://registry.npmjs.org/
```

A registry `E404` for the unpublished version is expected. Other failures are
not proof that the version is available. If `0.0.1` already exists, inspect it
and report the situation; do not unpublish it or silently select another version.

### 2. Build and pack when needed

From the repository root:

```sh
rtk pnpm typescript
rtk proxy env BASE_UI_PUBLISH_DOCS=true pnpm build:package
rtk proxy node --test scripts/distribution/build/build.test.mjs
rtk proxy node scripts/distribution/notices/stage.mjs --check
```

Inspect `packages/solid/build/package.json` for the exact public name/version,
`private: false`, `publishConfig.access: "public"`, export targets, and runtime
peers. Ensure the public README and notice files are present.

Verify the destination directory exists, then run the following **with working
directory `/Users/avi/avir-oss/baseui-solid2/packages/solid/build`**:

```sh
rtk proxy npm pack --quiet --pack-destination /var/folders/k1/dqkw16gn09q6492v5jn1x_jc0000gn/T/opencode
```

From the repository root, verify the newly packed archive:

```sh
rtk proxy node /var/folders/k1/dqkw16gn09q6492v5jn1x_jc0000gn/T/opencode/unstyled-release-smoke.mjs
```

If that temporary script is missing, recreate an independent consumer that
installs the archive, the exact Solid runtime peers, and compatible optional
adapter peers. Verify the public imports and strict declarations, including
the temporal augmentation paths. Do not substitute workspace source resolution
for the packed consumer check.

### 3. Publish the verified tarball

Publish the exact tested archive, not an implicitly repacked directory:

```sh
rtk proxy npm publish /var/folders/k1/dqkw16gn09q6492v5jn1x_jc0000gn/T/opencode/unstyled-solid-base-ui-0.0.1.tgz --access public --tag latest --registry=https://registry.npmjs.org/
```

If npm requires interactive authentication or 2FA, have the user complete it.
If publishing fails, inspect the actual error. Do not switch registry, version,
scope, or access policy just to bypass it.

### 4. Verify publication

```sh
rtk proxy npm view @unstyled-solid/base-ui@0.0.1 name version dist.integrity dist.tarball --json --registry=https://registry.npmjs.org/
rtk proxy npm dist-tag ls @unstyled-solid/base-ui --registry=https://registry.npmjs.org/
```

Confirm `latest` is `0.0.1` and compare the registry integrity to the SHA-512
integrity of the tested tarball. Install **the registry version** in a fresh
consumer and verify the documented root/subpath imports and TypeScript
resolution once more. A successful local pack is not publication evidence.

Return the npm URL, published version/tag, and verification results:

<https://www.npmjs.com/package/@unstyled-solid/base-ui>

## Deferred item and protected work

The user explicitly deferred audited row 135: the date-fns adapter has no
configurable default-zone setter matching that original test. Leave it for
later; do not reopen it as release work or claim 181/181 audited completion.
The previous browser failures were repaired. The existing WebKit exclusion for
NumberField's pointer-lock cursor geometry is intentional source behavior.

Latest pre-publication behavioral baseline: 5,228 jsdom tests passed with 179
skips; 130 SSR tests passed; scoped browser files had 4,541 passes and zero
failures with one existing platform exclusion. Native interactions passed
48/48 with zero diagnostics/errors. This is scoped evidence, not a claim that
every possible browser test or release qualification was executed.

Preserve the completed performance, reactivity, ownership, focus/caret and
host-identity fixes. No dependency upgrades, assertion weakening, new skips,
diagnostic suppression, or speculative refactors belong in this publishing task.
