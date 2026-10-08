# Isolated packed consumers

## Current RC13 distribution policy

Runtime exports now prioritize `worker` before `browser`, matching stock
`solid-js` and `@solidjs/web` RC13. All 64 resolver subsets remain mandatory in
each of the four independent peer installations. Every non-types subset that
selects server output (24 sets, including browser+worker) executes actual imports.
Of the 16 subsets containing browser and excluding types, eight without worker
execute Chromium hydration; the eight with worker execute separately compiled
SSR under their actual Node conditions. Mixed conditions are lane-routed, not
omitted. Every corresponding execution must pass.

Staged `sideEffects: false` follows the authored/compiler initialization audit in
`docs/distribution-initialization-audit.md`. The packed initialization stage
checks every runtime module against the reviewed allocation/factory classes and
rejects unreviewed top-level calls, constructors and expressions. Test-only
hydration/plural fixtures are excluded from runtime/declaration output and the
archive inventory rejects fixture leakage. Optimized graph and behavior gates
remain mandatory.

`report.packageVerificationStatus` summarizes the archive/import/type/runtime/
initialization/optimized consumer checks. `report.status` still includes all
coordinator qualification obligations and remains blocked if their independent
evidence is missing. A passing package verification does not close the exhaustive
upstream case audit or manufacture coordinator receipts.

The prior browser-first and conservative-sideEffects reports below are historical
evidence; they describe the earlier failing archive, not current policy. Retained
replay now executes browser+worker rows in the worker SSR lane too.

Owned by `bsolid-dist-pack`. Write allowlist: `scripts/distribution/consumers/**`,
`test/distribution/consumers/**`, `tracking/distribution/packed-consumers.json`.

## Coordinator wiring and frozen-archive execution

The manifest integrator should add this root command:

```json
"test:packed-consumers": "node scripts/distribution/consumers/run.mjs"
```

After the coordinator freezes a fresh complete build, stages current Markdown and
notices, and obtains the actual `npm pack --json` archive, invoke:

```sh
rtk pnpm test:packed-consumers \
   --tarball /absolute/path/to/unstyled-solid-base-ui-0.0.1.tgz \
  --output /var/folders/k1/dqkw16gn09q6492v5jn1x_jc0000gn/T/opencode/packed-evidence-UNIQUE \
  --qualification /absolute/path/to/archive-bound-qualification.json

# Equivalent before command integration:
rtk proxy node scripts/distribution/consumers/run.mjs \
   --tarball /absolute/path/to/unstyled-solid-base-ui-0.0.1.tgz \
  --output /var/folders/k1/dqkw16gn09q6492v5jn1x_jc0000gn/T/opencode/packed-evidence-UNIQUE \
  --qualification /absolute/path/to/archive-bound-qualification.json
```

`--tarball` and `--output` are required and absolute. The output parent must
already exist inside the approved temporary root; the output directory must be
new. `--qualification` can be omitted to collect the runner's own full failure
set, but its absence **blocks** final acceptance. The runner never packs or
rebuilds. Do not run it before the fresh-build freeze.

## What actually runs

- Inspect gzip/tar bytes without extracting into the checkout: archive SHA256,
  per-file SHA256/size, safe paths, no links/special files, exact 79-export
  contract, condition ordering, three type-only entries, metadata/peers,
  README/MIT/NOTICE/Markdown, portable sourcemaps and omitted test/cache/source
  directories. Uses the declaration owner's `contracts` and `assertExportMap`.
- Snapshot archive, templates, ordinary type fixture and all four temporal
  specialization fixtures. Reuses existing type/temporal assertions **as fixture
  content**, not source-path mappings or workspace artifacts. Snapshot hashes are
  retained. No checkout dependency is copied into a consumer.
- Create `mkdtemp` outside the workspace beneath the approved root. Independently
  install the actual archive four times using npm: ordinary/no optional peers;
  date-fns + timezone only; Luxon + its declaration package only; both.
  `--legacy-peer-deps` disables peer auto-installation, not the explicit peer
  contract checks. `--ignore-scripts` avoids package lifecycle execution.
- Install exact stock RC13 core/renderer/signals/compiler/Babel plugin, Vite
  integration `3.0.0-next.47`, Babel `7.29.7`, Vite `8.3.2`, TypeScript `5.9.3`,
  Playwright `1.63.0`, publint `0.3.25`, ATTW core `0.18.5`; exact independent
  temporal pins. Consumer-only overrides prevent RC/tool drift. Verify nested
  installations, reject package symlinks/React, and byte-compare installed
  library files with the input archive. Only npm executable `.bin` shims are
  excluded from package-link rejection.
- Reject ancestor node_modules, clear inherited Node/npm/workspace resolution controls and use private
  npm cache/config/home and Playwright browser directories. Registry integrity
  metadata is retained for independently installed dependencies. Each executable goes
  through `rtk proxy`, with full stdout/stderr and exit/signal/timeout evidence.
- Strict Bundler and NodeNext, `skipLibCheck: false`, no React ambient types or
  aliases. Every applicable export resolves to its exact declaration target under
  all 64 advertised condition subsets. Native ref/generic/private-export
  negatives, missing-adapter diagnostics and temporal null/range/augmentation
  specialization/emission are retained verbatim.
- Actual Node resolver subprocesses for all 64 subsets in each install; server
  import execution for the 16 non-browser/non-types sets, type-only runtime
  rejection and missing-adapter locality. Node's builtin `node` condition is
  recorded. Declaration conditions are resolution evidence, never executable
  `.d.ts` imports. AST audit covers packed imports/reexports/import types,
  augmentations, relative targets and declared external dependencies.
- Separate production Vite Babel client/server compilation, fresh Node SSR with
  no document/window, and real Chromium hydration/mount across the 16 browser
  condition subsets **in every peer set**. Preserve original Toggle/Separator,
  prehydration click replay, reactive native events, Tabs selection, visible
  geometry, scrollbar CSS/CSP nonce and repeated style cleanup/disposal.
  The exhaustive registry uses executable **static namespace imports** and
  observes every exported binding. Namespace names are compared with the real
  independently executed server oracle; type-only entries stay excluded.
- Optimized unused/root/subpath/compound/adapter fixtures retain rendered-module
  graphs and raw/gzip sizes. Graph checks reject unrelated families, date-library
  coupling and duplicate runtime roots. Root/subpath optimized Toggle mounts
  exercise native events/disposal; a separate optimized hydration/style fixture
  avoids the exhaustive export-import matrix, so behavior is checked after real
  elimination. No universal byte budget or CI upload/comment action.
- publint analyzes the byte-verified installed archive. ATTW receives precisely
  the actual archive's files and every export. Retain its full analysis and reuse
  `scripts/distribution/types/attw.mjs`'s exact classification: only node10
  NoResolution and node16-cjs CJSResolvesToESM are outside the ESM contract.

Types and portability must pass before expensive runtime compilation. Matrix
failures are collected across all attempted conditions; no assertion downgrade,
diagnostic suppression, or automatic toolchain repair. Outputs, installation
graphs, lockfiles and browser caches remain external for diagnosis. Every final
mandatory stage must pass; missing stages/evidence remain blockers.

## Stock RC13 and mixed conditions

The workspace declares a signals RC13 patch. Consumers use **stock registry**
RC13, with that patch absent; report records the workspace declaration/config and
patch hash separately. A patched workspace success never substitutes for this
consumer result. No consumer applies or copies the patch.

The library's browser-first map and RC13 renderer's worker-first map are tested
as advertised, including browser+worker, browser+node and browser+deno. No resolver
alias, renderer vendoring, condition reordering or second runtime is installed to
conceal `bsolid-dist-mixed-conditions`. An unresolved incompatibility stays red.

## Byte-verified retained-consumer replay

`scripts/distribution/consumers/replay.mjs` reuses a retained independent install
from a complete original runner report. It performs no installs and no reruns of
the previously passing 256 Node condition sets. It verifies all four original
prerequisite stages, exact archive/report/inventory/export contract, every saved
command/log record, full resolution/type result accounting, selected consumer
manifest/lock/SSR/oracle snapshots, actual installed archive file inventory/bytes,
and stock tool/runtime bytes against SHA512-verified tarballs in that consumer's
private npm cache. A patched signals tree, missing cache, changed fixture,
different archive, symlink, missing successful prerequisite or changed evidence
rejects replay before builds.

New fixtures are frozen in an exclusive child directory of the verified external
consumer. Ordinary dependency lookup reaches that consumer's existing registry
install; there is no copied/linked node_modules or new consumer manifest. Fresh
strict Bundler and NodeNext checks (`checkJs`, `strict`, `skipLibCheck: false`)
cover the changed namespace registry and mounted TSX before any compilation.
The unchanged SSR App is hash-checked before inherited SSR HTML is reused.

Coordinator full16 replay command (repeat with each of the four retained peer
graphs and a distinct new evidence directory):

```sh
rtk proxy node scripts/distribution/consumers/replay.mjs \
  --tarball /var/folders/k1/dqkw16gn09q6492v5jn1x_jc0000gn/T/opencode/bsolid-release-20261006-02/baseui-solid2-0.0.0.tgz \
  --report /var/folders/k1/dqkw16gn09q6492v5jn1x_jc0000gn/T/opencode/bsolid-release-20261006-02/consumers/report.json \
  --consumer /var/folders/k1/dqkw16gn09q6492v5jn1x_jc0000gn/T/opencode/bsolid-packed-f5OVfK/ordinary-XXvlHM \
  --output /var/folders/k1/dqkw16gn09q6492v5jn1x_jc0000gn/T/opencode/bsolid-release-20261006-02/consumers-replay-ordinary-UNIQUE \
  --conditions all
```

Selections: `all` (default) runs all16 browser subsets; `focused` runs masks
2/6/10/18 (browser-only, browser+node, browser+worker, browser+deno); `default`
runs browser-only. The report records exact selection and completeness. Every
replay exits **2**, retains `status: "blocked"`/`fullGateStatus: "blocked"`, and
reports its separate `replayStatus`; even a passing browser matrix cannot close
source/export, side-effect, notice/Markdown, listener/prehydration or manual gaps.
Invalid CLI/output setup exits 1. Prior evidence is read-only. New complete logs,
fixtures, registry-byte proofs, builds, namespaces, failure DOM and causal graph
census are retained in the unique external output.

### Executed consolidated correction diagnosis

Archive SHA256: `352d394087cd48b29facdbfd9f48d810f233375c990ba9c523a50491194485c8`.
Report: `/var/folders/k1/dqkw16gn09q6492v5jn1x_jc0000gn/T/opencode/bsolid-release-20261006-02/consumers-correction-01/report.json`.

- Entire prior report and 714 stdout/stderr logs read: 64
  `INEFFECTIVE_DYNAMIC_IMPORT` fixture faults and four unused-initialization
  failures; no other executed command failure class.
- Corrected four builds pass with unchanged warning rejection. Fresh strict
  fixture types pass both modes. Stock core/renderer/signals/compiler/Babel/Vite
  tool files were byte-verified against original registry tarballs, and library
  archive bytes/manifest/lock remain unchanged after replay.
- Browser-only, browser+node and browser+deno each pass all74 applicable runtime
  namespaces/630 binding observations, original hydration identity, prehydration
  native click, reactive Toggle/Tabs events, scrollbar CSS/CSP and repeated
  disposal, with zero diagnostics.
- Browser+worker builds but fails during evaluation. Graph selects library DOM
  plus `@solidjs/web/dist/server.js`; the exact page error is
  `Client-only API called on the server side. Run client-only code in onMount, or conditionally run client-only component with <Show>.`
  Source-map frames are renderer `server.js:4273:12` and packed
  `dom/utils/createPopupViewport.js:11:27` (template initialization). This is the
  genuine `bsolid-dist-mixed-conditions` blocker, not the corrected import graph.
- `sideEffects: true` remains deliberate. Ordinary unused-import graph: 125
  library modules retained, 39,377 raw / 12,357 gzip bytes versus 99 raw bytes for
  empty. Root/subpath graphs retain 143/24 library modules. The full causal census
  is `prior-failure-census.json`; `bsolid-dist-shaking` must audit initialization
  and obtain a reviewed metadata decision. No production policy is altered.

Only this single focused ordinary replay was executed; full16/all-four browser
matrices remain coordinator-owned.

## Cross-owner evidence contract (mandatory)

The supplied qualification JSON is version 1 and bound to `archiveSha256`. It
contains exact `markdown` mapping `docs/<path>.md -> SHA256` (including the
versioned content inventory) and `notices` mappings with `sourceSha`, `license`,
`packedFile`, and nonempty `requiredText`. Their content is checked in the archive.

`obligations` must contain all six entries:

1. `source-export-completeness`: integration's finished source/symbol-to-export
   accounting; key equality alone cannot establish this.
2. `current-markdown`: docs completeness/current versioned Markdown provenance.
3. `adopted-notices`: donor/inherited license and notice applicability inventory.
4. `side-effect-audit`: actual authored/compiler initialization audit and justified
   staged sideEffects policy, not merely a copied false value.
5. `style-listener-disposal`: tree-shaking owner's full style/CSP/shared-listener
   and disposal replay against finished components.
6. `prehydration-events`: full package-specific prehydration replay, including
   Tabs/Slider, not just this runner's Toggle delegated click.

Each obligation has `status: "passed"`, `owner`, exact `command`, `assertions`
(nonempty IDs), and `artifacts` (`path` absolute, `sha256`, `kind: "gate-json"` or
`"raw-log"`). A `gate-json` artifact must actually contain:

```json
{
  "schemaVersion": 1,
  "archiveSha256": "<the exact archive SHA256>",
  "status": "passed",
  "owner": "<same obligation owner>",
  "command": "<same exact RTK command>",
  "exitCode": 0,
  "signal": null,
  "blockers": [],
  "diagnostics": [],
  "assertions": [{ "id": "<required assertion ID>", "status": "passed" }],
  "stdout": "/absolute/full-stdout.log",
  "stderr": "/absolute/full-stderr.log"
}
```

Both logs must be included as hashed raw-log artifacts. Changed hashes, another
archive, missing assertions, skipped results, nonzero/interrupted commands,
diagnostics or unresolved blockers reject qualification. Raw artifacts are copied
by content hash into external evidence. This seam needs coordinator/owner wiring;
it does not invent results for their pending gates.

## Bounded local verification

```sh
rtk proxy node --test test/distribution/consumers/policy.test.mjs \
  test/distribution/consumers/process.test.mjs \
  test/distribution/consumers/replay.test.mjs \
  test/distribution/consumers/syntax.test.mjs
```

These tests use synthetic in-memory tar bytes, evidence mutations, inert Node
diagnostic/timeout children and `node --check`; they never install, pack, build,
launch a browser or execute final consumers. TSX gets syntax parsing only.
