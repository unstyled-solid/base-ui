# Bounded weekly verification

Owner: `bsolid-upstream-verify`. Transport contracts remain in
[`scripts/upstream/git/README.md`](../scripts/upstream/git/README.md).

## Current boundary

The verifier core and existing `scripts/upstream/cli.mjs` routing are implemented.
**Real qualification remains pending**. No real parity state was advanced by this work.
`tracking/rehearsal.json` records transport/verifier **fixture** proof, not global
component parity. Both source adapters preserve their existing checkout policy:
Base UI follows the active candidate; donor HEAD stays at `baselineSourceSha`.
Donor verification inspects candidate Git objects and a separately verified,
clean, exact-HEAD, globally scoped Base UI oracle. It never promotes the donor baseline.

## Commands

Run everything through RTK from the root. Fetch is explicit and source-local:

```sh
rtk proxy node scripts/upstream/cli.mjs update
rtk proxy node scripts/upstream/cli.mjs update --source solid-floating-ui
rtk proxy bd ready
rtk proxy bd show <episode-owner-ticket>
rtk proxy bd update <episode-owner-ticket> --claim
```

Impact dispatch must be supplied by `bsolid-upstream-impact`; the fetch command
currently freezes raw reports only. Do not manufacture a successful dispatch
record. Owners implement their assigned change and freeze source/test mappings,
commands, results and artifacts for the exact candidate. The coordinator freezes
the qualification inputs before collecting the final reports.

The existing CLI and standalone inspector are **check-only by default**, with an
explicit reviewed bundle hash:

```sh
rtk proxy node scripts/upstream/cli.mjs verify --source base-ui --evidence-path tracking/updates/<from>-<to>/verification-evidence.json --evidence-hash <sha256>
rtk proxy node scripts/upstream/verify/inspect.mjs --source base-ui --evidence-path tracking/updates/<from>-<to>/verification-evidence.json --evidence-hash <sha256>
rtk proxy node test/upstream/verify/preflight.mjs
rtk proxy node --test --test-concurrency=1 test/upstream/verify/core.test.mjs test/upstream/git/workflow.test.mjs test/upstream/verify/cli.test.mjs
```

After exact live coordinator approval and all required qualification closures,
the explicit one-command advance is:

```sh
rtk proxy node scripts/upstream/cli.mjs verify --source base-ui --evidence-path <relative-bundle> --evidence-hash <reviewed-sha256> --advance
```

The `--advance` flag is a request, not approval: complete same-tuple evidence and
the live approved record hash are still mandatory. No production advancement was
executed during implementation or tests. Root aliases remain coordinator-owned.

## Integrated CLI interface

The existing entry imports `runVerification` from `./verify/core.mjs` and routes
**only** `verify` to that core. Other commands continue through `runUpstream`.
`--evidence-path` maps to `evidencePath`, `--evidence-hash` to `evidenceHash`, and
`--advance` to a boolean (default false). JSON output/errors and source selectors
are preserved. No additional wrapper lock is taken; the core owns the shared lock.

The exported `parseCli`/`executeCli` interfaces validate command-scoped options
before any repository access. Evidence options are verify-only; reason/token
are abandon/unlock-only; common root/source/json/no-watch flags remain supported.
Unknown/repeated flags, missing values, unsafe relative evidence paths, partial
or uppercase hashes and unknown sources fail closed. Help is accepted only as
`--help`/`-h` alone or immediately after a known command, not as a validation bypass.
Test service injection is import-only; the executable exposes no fixture adapter.

`runVerification` defaults to check-only when imported directly. The production
entry rejects fixture-scoped evidence. `createFixtureVerifier` confines injected
Beads/tool adapters to explicitly marked roots beneath the OS temporary
directory. There is no injectable production gate policy.

## Producer contract v1

All references are `{ path: <repository-relative regular file>, sha256:
<64-lowercase-hex exact bytes> }`. Symlinks/traversal and missing inputs fail.
The bundle hash is an independent CLI argument, so editing a bundle is not an
implicit authorization. Producers publish immutable bytes; never rewrite raw
`episode.json`/`report.json` or historical evidence. This v1 join format is a
**requested adapter**, not an assertion that existing lane reports already use it.

Bundle fields:

- `schemaVersion: 1`, `source`, `scope: "global"`, `kind: "weekly" | "initial"`.
- Full `fromSha`, `candidateSha`, `oracleSha`, exact `reportHash` (null for initial
  same-pin qualification), `sourceTreeHash` (SHA-256 of exact UTF-8
  `git ls-tree -r -z --full-tree <candidate>` output).
- `toolchain: { node: <process.version>, pnpm: <pnpm --version>, solid:
  "2.0.0-rc.13" }`. Tool/compiler/runner/config/package versions and bytes are
  additionally frozen in input and gate reports.
- `inputs`: exact output of `snapshotInputs(root)`. Fixed categories are port
  source, test, tool/config/distribution, docs patches and docs. Entire mandatory
  roots are enumerated, including binary files, dotfiles and colocated tests.
  Additions/deletions also invalidate evidence. Conservative full-input hashing
  currently requires the whole gate set; impact may add gates/platforms but may
  not drop mandatory ones.
- Nonempty `artifacts` references for the qualified package/build, plus `plan`,
  `inventory`, `gates` references and `fingerprint: fingerprint(tuple)`.

The tuple is exactly `{ source, fromSha, candidateSha, reportHash, oracleSha,
sourceTreeHash, mappingHash: plan.sha256, inventoryHash: inventory.sha256,
inputHash: fingerprint(inputs), toolchain, artifacts }`. `fingerprint` hashes
`json(tuple)` using the existing state module's two-space formatting and final
newline. All gates must repeat this **same tuple**, not independent hashes from
different revisions.

Plan fields: version/source/candidate/report/oracle context; nonempty
`mappingRevision`; `tasks`, empty `blockers`, additional `requiredGates` rows
`{ name, platform }`; `sourceMap` covering the **entire** exact candidate Git tree.
Each mapping has `path`, Git `blob`, `mode`, reviewed disposition
(`translated`, `pure-adapted`, `framework-only`, `excluded-with-reason`), `reason`,
`reviewTask`, `targets`, `tests`. Translated/adapted mappings need real targets and
tests. Mapping strategies alone do not establish passing behavior.

Plan `changes` has exactly one row for each raw report index, including removed
and renamed paths: `{ index, changeHash: hash(json(rawChange)), disposition,
reason, task, targets, tests }`. Allowed dispositions are `reconciled`,
`reviewed-noop`, `removed`, `renamed`; no-op needs review/reason, other changes
need target/test handoff. Unknowns/untriaged entries fail closed. The verifier
also recomputes the immutable Git range/report so an omitted raw change cannot
be hidden by rehashing the report.

Inventory fields: same version/context, `complete: true`, `runtimeExpanded:
true`, empty `unresolved`, nonempty `obligations`. Obligations use **accepted
collector IDs**, not representative fixture strings: `{ id, kind: "runtime-case"
| "type-scenario", sourcePath, sourceBlob, requirements: ["gate/platform"] }`.
Source blob must match the complete source map. The runtime-inventory owner
must adapt accepted collection identities, environment restrictions, type
scenarios and retained skips. Static declarations/file counts are insufficient.
The core audits completeness of this frozen join; it does not itself run a
collector or prove producer semantic claims.

Each gate record contains `name`, `platform`, `tuple`, `status: "passed"`,
`exitCode: 0`, zero `failures`, `errors`, `unresolved`, `diagnostics`, accountable
`task`, reproducible `command` beginning `rtk `, nonempty exact `versions`,
retained `artifacts` references and `cases`. Packed-consumer evidence must
reference all of the qualified build/archive hashes as well as its logs.

Mandatory gates/platforms are exported as `mandatoryGates` in `evidence.mjs`:
inventory/components/types/unit/integration/original-source-tests/docs/package
on `node`; browser Chromium/Firefox/WebKit; hydration development/production;
accessibility keyboard/assistive-technology; real iOS Safari software keyboard.
These platform names identify evidence lanes, not a claim that desktop WebKit
proves real-device or AT behavior. Exact platform/AT/browser/build versions belong
in each record. Collector/impact obligations add more precise combinations.

Every obligated case has a matching gate case `{ id, status, targets, blockers:
[] }`. Passing/adapted/skipped are the only terminal dispositions. Reviewed
`adapted` additionally requires `sourceStatus: "passed"`, `reason`, `reviewTask`;
`upstream-skipped` requires the same review fields and `sourceStatus: "skipped"`.
Source failures never become framework adaptations. Missing, queued, failed,
unresolved, extra/duplicate IDs and unlisted platforms fail closed.

## Beads and initial qualification

The default adapter executes `bd --readonly list --all --flat --limit 0` with
gates/ephemerals included, then reads required tasks and recursive blocking
dependencies through `bd --readonly show`. Saved producer statuses are not
accepted. Required tasks, reviewers and real dependencies must be closed.
Open bugs or explicitly labelled/metadata parity blockers fail even when omitted
from the plan. Unknown statuses, missing tasks, incomplete output and dependency
cycles fail closed. The complete audit is repeated inside the source lock.

Initial same-pin qualification is supported without inventing a fetch episode:
`kind: initial`, from=candidate, report=null, current parity=null, no active batch.
Weekly verification from null or a historical **unscoped** parity field also
requires initial final qualification. **Every production verification**, including
weekly verification from a scoped qualified pin, requires the live same-tuple
coordinator approval. Add
`release-ready/coordinator` gate with task `bsolid-release-ready`,
`authorization: "approved"` and the complete tuple. The coordinator must record
its exact gate-file SHA-256 in that live ticket's metadata
`verificationAuthorizationHash`. This explicit approval avoids requiring the
release-ready ticket to close before its verifier dependency finishes. All
actual qualification dependencies still require closure. The verifier never
closes Beads tickets or fabricates that approval.

## Lock, crash and QUEUED behavior

The core gathers evidence, acquires **the same `<state>.lock`**, rejects
`<state>.transaction.json`, rereads state and repeats the full validation/hash/
Beads checks. Changed state or fingerprints abort. Qualification workers must
freeze the input tree; arbitrary external writers do not honor this lock.

On explicit advance it first publishes an immutable `verification.json` receipt
under `<episodes>/<candidate>-<evidenceHash>/`, containing the complete before/
after states, previous parity, evidence fingerprint and Beads snapshot hash.
Receipt before/after states are schema-validated and the allowed transition is
reconstructed on replay; a receipt cannot silently change baseline/provenance or
queue fields. Then existing `saveState` fsyncs and atomically renames the new state. It clears
`activeEpisode`, retains all provenance/baseline fields, sets exact tested parity,
records receipt/scope, and **preserves `queuedCandidateSha`**. No checkout/ref
write, fetch, baseline promotion, adaptation write, commit or publication occurs.

Before-rename interruption leaves prior state and receipt; rerun revalidates and
finishes once. After-rename interruption revalidates retained evidence and returns
`unchanged`. Divergent before/after state or receipt bytes fail closed. The next
explicit `update` starts the queued/later descendant range; verify never promotes
the queue or rewrites old evidence.

Recovery commands:

```sh
rtk proxy node scripts/upstream/cli.mjs status --source base-ui
rtk proxy node scripts/upstream/cli.mjs unlock --source base-ui --token <dead-local-owner-token>
rtk proxy node scripts/upstream/cli.mjs update --source base-ui
```

Only unlock after the existing CLI can prove the original local process is dead.
Pending fetch journals must be resumed by that CLI first. Re-run verification
with the **same** reviewed evidence path/hash after restoring its exact inputs.
Use the donor selector consistently for donor recovery.

## Rehearsal and remaining integration blockers

Node tests copy real immutable objects into isolated temporary repositories:
Base UI `ca5b43fca6f94ba27c46b875b34f0eefcd5ed27a` →
`46f746399bc63a985157859f7568fbaf0097d528`, queue
`19511bb171f3b360b006c94cf6d07e53cb446505`; donor
`0a7028eb6f4fa2cda712393f818d2ccb81b1c83a` →
`0492e49b746deed543dbc167a9a58ed1210c2393`, separately pinned Base UI oracle
`19511bb171f3b360b006c94cf6d07e53cb446505`. They use real engine discovery/update
and freeze mock owner handoff, closed-task audit and gate records **explicitly
scoped fixture**. They do not execute source/browser/component qualification or
real Beads dispatch. Canonical source refs, root config and live state are read-only.

Outstanding: impact dispatch and immutable join adapter;
accepted complete runtime/environment/type scenario inventory adapter; exact final
browser/hydration/accessibility/device/docs/packed-consumer evidence; donor
mapping/oracle qualification and notices closure; initial exact-hash release
coordinator approval. The ticket remains open while these are unresolved.

### Initial bounded execution (historical)

First batch: 14/34 passed; one shared structural-comparison defect blocked all
later assertions. The single correction changed semantic object comparison to
`isDeepStrictEqual` while retaining exact-byte artifact hashing. Correction replay:
**36/38 passed, 2 failed, 0 skipped** (one failed subtest plus its parent).
`rtk git diff --check` passed. Both canonical parity fields remain null.

The remaining subtest is `same-lock concurrency, locked reread and evidence
reread`. Its generated child program emits `runtime:()=>{...JSON object...}`;
the object expression needs parentheses before that child can execute. The
resulting syntax-error stderr is then rejected by the test's JSON parser.
The same-process `LOCKED` assertion passed before that failure; independent
process verification and the following locked state/evidence reread assertions
were **not reached**. This is a concrete fixture-proof blocker, not a successful
concurrency result. No second correction/replay was attempted under the user's
one-batch/one-correction bound. The exact report path/hash and passed scope are in
`tracking/rehearsal.json`.

### Coordinator-authorized final consolidated wave

The generated worker is now built by `verifierWorkerProgram` with an object
expression returned in parentheses. Syntax preflight compiles both the actual
modules and a representative generated worker; TypeScript validates the exported
command/core consumer contracts and negative selector/boolean/hash cases without
editing root configuration or emitting files.

`rtk proxy node test/upstream/verify/preflight.mjs` passed: 16 JavaScript modules,
generated worker syntax, and typed command consumers. The single consolidated
runtime batch then passed **77/77, zero failures/skips**: original verifier
**38/38**, existing Git workflow **29/29**, new CLI/schema/routing regressions
**10/10**. This includes independent-process locking, locked state/evidence
rereads, incoming pending-journal refusal, tampered-receipt rejection, omitted
open parity-task refusal, and donor oracle-lock/dirty-baseline checks.

The CLI seam is integrated, and the previous fixture blocker is resolved.
`rtk git diff --check` passed. Canonical Base UI/donor state, `.gitmodules`, root
manifest and lockfile hashes matched before/after; both real parity fields remain
null and no canonical transaction/lock was left. Fixture proof remains distinct
from missing real qualification/approval. Exact commands, report and tested-file
hashes are retained in `tracking/rehearsal.json`.
