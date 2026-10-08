# Source, export and case inventory

Owner: `bsolid-inventory`. Canonical input: **Git objects** at
`19511bb171f3b360b006c94cf6d07e53cb446505` in `upstream/base-ui`.
No source checkout, reference, worker ledger, root manifest or lockfile is written.
All child terminal processes also use `rtk proxy`.

## Commands (repository root)

```sh
rtk proxy node scripts/tracking/cli.mjs generate
rtk proxy node scripts/tracking/cli.mjs check --no-watch
rtk proxy node scripts/tracking/cli.mjs check-owners
rtk proxy node --test test/tracking/inventory.test.mjs
rtk proxy node scripts/tracking/cli.mjs qualify
```

- `generate`: validate the exact tree, mappings and worker ledgers, then write only
  `tracking/source-manifest.json`, `tracking/export-manifest.json` and
  `tracking/reports/inventory.json`. No clock, absolute path, platform, ticket status,
  or working-tree source content enters these generated outputs.
- `check`: regenerate in memory and compare all three outputs byte-for-byte; fail
  on missing/stale files, unknown inputs, duplicate/missing ownership, invalid export
  targets, invalid ledgers or unaccounted source/export/case drift. It is an **inventory
  integrity gate**, not a parity gate. `--no-watch` is accepted and normalized.
- `qualify`: perform `check`, then reject unknown runtime cardinality, unmapped cases
  and pending/blocked/browser evidence. **Currently intentionally exits 1**, with the
  runtime collection blocker. Green integrity does not make this gate green.
- `check-owners`: compare scoped live Beads metadata with the versioned snapshot.
  New empty-scope followup tickets do not alter source ownership. No database contact
  is required for ordinary deterministic generation/check.
- `snapshot-owners`: explicitly refresh `tracking/schema/owners.json` from
  `rtk proxy bd list --all --limit 0 --json` after reviewed ownership changes.
  This snapshots allowlists/research paths, never statuses or a second live task list.

`bsolid-dist-contract` integrated the exact requested root commands:
`test:coverage-map` → `node scripts/tracking/cli.mjs check`, `inventory:generate` →
`node scripts/tracking/cli.mjs generate`, and `test:tracking` → the Node test glob above.
This directory does not modify root scripts/deps. No additional dependency is needed;
static parsing uses existing TypeScript 5.9.3.

## Consumer contracts

`tracking/schema/inventory.schema.json` validates the bundle
`{ sourceManifest, exportManifest, report }`; `$defs` expose individual schemas.
`tracking/schema/ledger.schema.json` defines worker ledgers; its README describes status
semantics. Both are draft 2020-12 JSON Schemas. The local validator implements exactly
their used vocabulary and fails on unsupported keywords.

**Source manifest**: `schemaVersion`, `baseline`, `treeDigest`, `ownershipDigest`,
`policyDigest`, and sorted `sources`. Each source has exact `path`, Git `blob`/`mode`,
`category`, `owner`, `targets`, `disposition`, `reason`, `provenance`, `targetState`,
and `transitiveConsumers`; JS/TS inputs additionally expose literal `dependencies` and
`unresolvedImports`. `targetState: planned` is a proposed correspondence, not proof
that the target exists. Worker refinements are `worker-mapped`, retaining the original
mapping and originating ledger in provenance. Completion lives in case evidence.

**Export manifest**: every pinned package export leaf has `key`, `conditions`,
`sourcePath`, source `blob`, `owner`, `targets`, `disposition`, and `rootPolicy`.
Includes internal subpaths, types, temporal adapters and unstable media query. The
original package `imports` preserve both prehydration branches and harness aliases.
This is source correspondence, not a replacement for distribution's output-condition
or individual exported-symbol/declaration contracts.

**Ownership**: source `sourcePaths` in tickets are reading references, not write claims.
`policy.mjs` maps target allowlists and approved React `useX` → Solid `createX` stems.
Serialized component stages need an explicit group with one primary owner; their
candidates are retained. Unrelated duplicate claims fail. Explicit overrides retain
displaced claims. Framework-only/excluded mappings require reasons and remain visible
to impact tooling. They never remove source test obligations. New unknown roots/leaves
fail; known-family additions still cause checked manifest drift.

Docs-content owns intake of docs inputs; its finer-grained manifest remains authoritative
for reusable prose/assets, demos, generated tables and Next transformations. Generic
planned intake paths do not assert that all React/Next files will be shipped.

The three floating facade leaves assigned by `docs/contracts.md` to integration still
need that ticket's `owns` extension. They are explicitly marked
`ownershipSeam: bsolid-bootstrap-command-handoff`, and appear in the report. No write
permission is inferred from the manifest. Ledger validation enforces actual allowlists.

**Import graph**: reverse transitive closure over static literal JS/TS imports/reexports,
relative paths, Base UI aliases and both prehydration branches. Cycles terminate.
Unrecognized internal aliases are listed; computed imports, MDX links, package config
and external dependency semantics require upstream-impact triage. This graph is an
aid, not a claim that every dynamic dependency can be inferred statically.

## Cases and honest coverage

For every test/spec input and recognized conformance helper, `tests` records:

- `declarations`: AST call-site IDs (`path#declaration:<source offset>`), line/column,
  title or title expression, suite names/registrations, skip/todo/conditional/each flags,
  environment hints and runtime skip indicators. These are **not expanded cases**.
- `unresolved`: file collection obligations (`path#collection`) plus parameterized,
  computed-title and generated-conformance registration obligations. This conservative
  file obligation also catches loops, imported aliases and custom generators that
  syntax inspection cannot prove complete. No static table expansion guesses.
- `runtimeCaseCount: null`, `collection: unresolved`. Package `.spec.*` files are
  compiler/type scenarios, excluded by upstream Vitest; browser/Playwright specs outside
  packages are not misclassified as type tests.

IDs are baseline-local; source blob pins invalidate stale evidence after any source
change. Parameter edits also change the blob and declaration inventory. Missing
ledgers count as zero mapped obligations, not passing coverage. Legacy bootstrap,
harness, docs and distribution evidence formats appear in `evidenceOnlyInputs` and
do not become case ledgers implicitly. A file with owner plus `sources`/`cases` is
validated as a ledger (even if its version is wrong); malformed ledgers cannot hide
as legacy evidence.

Worker ledgers can map `static-declaration`, `unresolved-dynamic`, and validated
`runtime-case` IDs. Runtime IDs come only from `ingestCollections` replaying retained
Vitest task trees; caller-supplied IDs/counts are rejected. `type-scenario` IDs now
require retained compiler-backed statement collection; uncollected type-spec paths
remain separate blockers. Without collection input the report retains `collectedCases: 0`,
`passingCases: 0`, `totalCases: null`, `percentage: null`, `complete: false`.
Partial collection exposes its real collected-case count but keeps the full denominator
and percentage null. Static passing and `pending-browser` never increment runtime
passing coverage. Collection alone never establishes parity.

Passing/adapted ledger cases require a real owned target file and recorded evidence;
blocked cases need known Beads IDs; skipped cases need an upstream skip indicator plus
evidence. An unresolved obligation cannot be passed, adapted or skipped away. Worker
ledgers are read-only; the aggregator rejects duplicate case/source claims and never
rewrites their schema or auto-inserts mappings.

## Importable API for impact tooling

- `git.mjs`: `readTree(repo, fullSha)` (NUL-delimited Git tree, binary-safe batched blobs).
- `inventory.mjs`: `buildInventory(entries, owners, policy, baseline)`,
  `detectDrift(beforeSources, afterSources)`, `detectExportDrift(beforeExports, afterExports)`.
  Export drift is condition-qualified. Equal-blob moves are reported as rename evidence;
  edited renames stay add/delete until triaged. Never auto-transfer ownership from a
  suspected rename. `stableJSON` provides byte-stable serialization.
- `validate.mjs`: `validateSchema`, `aggregate`; `applyLedgerMappings` in inventory.mjs
  applies already-validated worker refinements without mutating its inputs.

Weekly tools may read a candidate SHA explicitly through this API; CLI generation stays
pinned until coordinated baseline advancement. Review the diff before replacing outputs.

## Bounded runtime collection and ingestion

The collector uses the already frozen-installed independent clone and compatible
Node **>=24.15**; it does not install, rewrite upstream config, execute test bodies,
or invoke library/browser runtime suites. The installed Vitest 5 CLI `list --json`
drops skipped tests and does not expose the complete task tree. The adapter instead
uses `createVitest`, `getRelevantTestSpecifications`, and `collectTests` (runtime
registration, never static parsing or `start`/`runTestSpecifications`). It retains
suite/test mode, `each`, expanded title paths, locations, exact source SHA/blob,
project/environment, command, tool versions, import errors and unhandled errors.
Vitest does **not** expose arbitrary parameter argument values: this limitation is
explicit; expanded titles/positions/each and pinned source registrations retain the
runner-visible parameter identity without fabricated values. Body-time `skip()` is
only a possible runtime restriction, never a proven collected skip.

```sh
# Explicit new output under the approved temporary parent. 120s, max 2 workers.
rtk proxy node scripts/tracking/collect.mjs --checkout <isolated-pristine-clone> --node <isolated-node24> --output <new-temporary-json>

# One bounded continuation: 3 browser collections, node, compiler and screen-reader list.
# Reuses the original jsdom document unchanged. Each stage runs once, with no retries.
rtk proxy node scripts/tracking/collect.mjs --checkout <isolated-pristine-clone> --node <isolated-node24> --previous <retained-jsdom-json> --output <new-temporary-batch-json>

# Replay retained input only: no runner, no central generation. Optional temporary summary.
rtk proxy node scripts/tracking/inspect-collection.mjs --collection <retained-batch-json> --output <new-temporary-summary>

# COORDINATOR ONLY, after ownership/source freeze. Same input on all three gates.
rtk proxy node scripts/tracking/cli.mjs generate --collection <retained-json>
rtk proxy node scripts/tracking/cli.mjs check --collection <retained-json> --no-watch
rtk proxy node scripts/tracking/cli.mjs qualify --collection <retained-json>

# Browser accounting only; no browser launch. Emits to stdout, red while incomplete.
rtk proxy node test/qualification/browser/source-matrix.mjs --manifest tracking/source-manifest.json --collection <retained-json> [--records <exact-case-record-array>]
```

The continuation output is a strict `collection-batch` containing the unchanged old
document and all six new stage documents, including failures. Pass **the batch alone**
to coordinator generation/check/qualification; adding its original jsdom document
again is a duplicate and fails. Per-stage JSON, request and log artifacts remain
isolated under the new temporary prefix. Deadlines are 120s per browser, 60s node,
90s compiler and 50s screen-reader; process groups are owned and cleaned up. Browser
project/environment identity comes from the actual Vitest instance and its parent,
not from relabeling jsdom task trees. The provider may launch a browser to register
tasks, but `collectTests` never executes test callbacks.

`--collection` is repeatable for **disjoint** retained inputs; duplicate file/environment/
project specifications are rejected even when the earlier collection failed. Inputs
validate against `$defs.collectionInput` in inventory.schema.json. Their normalized
digests and `$defs.runtimeCollection` are attached to the generated source manifest.
The aggregate accepts only unmodified results of task-tree ingestion tied to that
source manifest. Runtime case IDs bind blob, environment, project, task-tree position
and expanded titles. A source edit, parameter-title change, or environment change
invalidates identity. Wrong/missing pins, unknown paths/projects/environments, focused
registrations, fabricated metadata, malformed tasks and duplicate inputs fail closed.
Empty/omitted files and collection errors retain blockers and do not produce cases.

Reviewed pinned config obligations: package React/utils test files require jsdom,
Chromium, Firefox and WebKit; docs/e2e/regressions require node. The reviewed
screen-reader Playwright config requires Chromium registration separately; `--list`
retains its genuine source/platform skip rather than claiming a Vitest case. The
default collector launches jsdom only; the explicit continuation adds the remaining
stages. Missing environments, conformance-helper consumer attribution and missing
compiler/type fixtures remain explicit. The existing static
declarations and unresolved obligations are preserved; task-tree expansion does not
silently complete their mappings. `conformanceObligations` is a file-level list of
source helper registrations, not an invented per-case helper attribution. Actual
generated suite/task names remain in the tree and expanded titles.

Helper origins additionally require a collected conformance-suite location matching
the consumer's pinned helper call, an observed runtime import-graph module, and
unambiguous nested source-suite/declaration attribution. Import presence alone does
not prove a helper generated cases. Helper origin records retain helper path/blob and
the exact consumer registration ID. Missing origins keep helper blockers red.

The compiler stage uses the installed upstream TypeScript API, pinned test config and
ambient declaration roots, source imports, and an explicit **source-only/no-emit**
projection (no declaration build or project-reference emit). It visits every non-import
top-level statement in each included `.spec` fixture. These compiler-checked statement
scenarios include assertions inside their function bodies; their count is neither a
runtime case count nor an independently executed assertion count. Ingestion checks
every statement range/kind and expected-error line against canonical AST descriptors,
pins config blobs, and derives `type-scenario` identities. Checked types and compiler
diagnostics remain retained. Compiler-diagnostic scenarios cannot be ledger-passed;
collecting a fixture never implies it compiled cleanly or that a Solid counterpart passed.

Some upstream modules have import-time runtime prerequisites. For example,
`test/regressions/index.test.ts` launches Chromium and reads fixture routes from
`http://localhost:5173` **before** registering its tests. A failed route discovery is a
collection blocker; the collector neither starts that fixture application nor invents
the route-generated cases. Fatal upstream browser mocking rejections likewise retain
failure documents/logs and do not become copied jsdom cases.

`source-matrix.mjs` derives browser file/environment obligations from that same contract
and compares real collected cases with exact actual records. File counts are only
obligation counts; absent browser collection yields a null denominator. Each actual
record requires `id`, `baseline`, `sourcePath`, `sourceBlob`, browser `environment`,
`react`/`solid` (`passed|failed|absent`), nonnegative `differences`, `diagnostics`,
`inputsChanged`, and an `evidence` locator. Passing needs both hosts, zero differences/
diagnostics and stable inputs. Existing representative scenario summaries/source title
strings do not satisfy this record contract and cannot certify source cases. Skipped/
todo source cases remain visible and need separate reviewed dispositions.

Validation (no full library runtime):

```sh
rtk proxy node --test test/tracking/inventory.test.mjs test/tracking/runtime.test.mjs
rtk proxy node node_modules/typescript/bin/tsc --noEmit --allowJs --checkJs --target esnext --module nodenext --skipLibCheck scripts/tracking/collect.mjs scripts/tracking/vitest-collect.mjs scripts/tracking/type-collect.mjs scripts/tracking/playwright-collect.mjs scripts/tracking/inspect-collection.mjs test/qualification/browser/source-matrix.mjs scripts/tracking/runtime.mjs
```

## Historical install blocker

`bsolid-inventory-runtime` (`tooling-blocker`, `deferred-validation`, `coverage`) is a
child of inventory and blocks `bsolid-components-complete` and `bsolid-upstream-verify`.

An independent `git clone --no-hardlinks --no-checkout` of the canonical repository was
detached at the exact SHA in the approved temporary directory under
`opencode/bsolid-inventory-upstream`. It is not a worktree attached to the canonical clone.
One bounded install attempt:

```sh
rtk pnpm install --frozen-lockfile --ignore-scripts
```

failed with `ERR_PNPM_UNSUPPORTED_ENGINE`: pinned `@sigstore/verify@4.1.2` requires
Node `^22.22.2 || ^24.15.0 || >=26.0.0`, current Node is `25.8.1`. Engines were not
relaxed, dependencies were not replaced, and the canonical checkout was not installed
into or tested. The followup needs a compatible **isolated** Node plus pinned upstream
pnpm 12.8.1, frozen install, runtime collection in each relevant environment, skip/todo
and conformance expansion evidence, and separate type-scenario validation. No runtime
collection was executed or represented as passing during that historical attempt.
The compatible Node24/frozen-installed `bsolid-browser-react` clone is now usable by
the bounded collector above. Retained evidence and current blockers belong in Beads;
central inventory/report generation belongs to the coordinator.
