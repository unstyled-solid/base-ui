# Owned donor source and developer-triggered reconciliation

## Authority and pin

`upstream/solid-floating-ui` is an **unmodified, detached Git submodule** from
<https://github.com/lxsmnsyc/solid-floating-ui>, pinned to
`0492e49b746deed543dbc167a9a58ed1210c2393` (main; source package 1.0.1).
The gitlink and `.gitmodules` were staged by submodule addition; no commit was
created. The donor supplies owned adaptation material. Base UI
`19511bb171f3b360b006c94cf6d07e53cb446505` remains the behavioral oracle and
Solid **2.0.0-rc.13** remains the runtime contract.

Do not install/import donor `solid-floating-ui`: its Solid peer is ^1.8 and its
source needs explicit RC13 adaptation. Read the [source assessment](../tracking/donors/solid-floating-ui/assessment.md)
and [exhaustive runtime map](../tracking/donors/solid-floating-ui/source-map.json)
before adopting code. Positioning owns the single `createBaseUIFloating` leaf;
root/tree, dismissal, focus, composite and portal implementations retain their
existing owners. Donor types/barrels never replace frozen shared contracts.

## Records and shared engine boundary

| Record | Meaning / writer |
|---|---|
| `tracking/donors/solid-floating-ui.json` | Six upstream-state keys: repositoryUrl, branch, submodulePath, baselineSourceSha, fetchedCandidateSha, verifiedParitySha. Shared CLI/coordinator owns future state transitions. |
| `tracking/donors/solid-floating-ui/provenance.json` | Source/package/license and oracle evidence; adopted source initially null. Donor reviewer maintains. |
| `tracking/donors/solid-floating-ui/source-map.json` | Exact runtime-source classifications and existing owner target seams. Planned mapping is not proof of copied/qualified code. Foundation owners report adopted ranges into their coverage ledgers; reviewer reconciles this map. |
| `tracking/donors/solid-floating-ui/LICENSE` | Byte-identical MIT source notice, in addition to submodule LICENSE. Distribution includes it for adopted material. |

The schema uses existing upstream field names deliberately. On a donor,
`verifiedParitySha` means “this donor revision was reconciled into the owned
adaptation and qualified **against the separately pinned Base UI oracle**,” not
“all donor public APIs are implemented.” Before that it stays null. A candidate
equal to baseline records the initially fetched pin, not successful qualification.

`bsolid-upstream-cli` alone owns selectors, locking, git adapters and update
engine under `scripts/upstream/**`. Its `git/state.mjs:10-15` consumes this state
path and the donor-scoped episode directory below. The read-only command
`rtk proxy node scripts/upstream/cli.mjs status --source solid-floating-ui`
was executed successfully: exact baseline HEAD, clean, no transaction/lock,
parity unverified. Optional engine fields are `queuedCandidateSha` and
`activeEpisode: { id, fromSha, toSha, reportHash }`; the ID is `<from>-<to>` and
reportHash is SHA-256. Provenance/map remain separate from that state schema.

**Update qualification gap:** the initial engine inspected during intake derived
`transaction.toHead` from candidate and checked it out in `git/workflow.mjs`
(`transact:106`, `finish:96`). That does not meet donor baseline-checkout stability.
The exact reproduction was sent to the CLI owner and recorded in
`bsolid-donor-update-proof`. Do not treat successful status as qualifying update;
the owner must pass that fixture before recommending donor update execution.
This followup is the integration gate, not a second updater.

## Explicit update protocol (no scheduled mutation)

1. A developer explicitly requests a donor check/update. Routine installs,
   builds, editor opens, tests and CI must not fetch/select a new donor baseline.
   An explicit update may fetch main to resolve a full immutable candidate SHA.
2. Shared CLI verifies configured URL/branch/path, clean donor worktree,
   available baseline object and ancestry. Stop on dirty/rewritten/missing history
   or fetch failure; never force-reset, stash or touch research references.
3. Freeze an episode with **donor ID + full from/to SHAs**, map revision/hash,
   Base UI oracle SHA, deterministic source diff/report hash and owner tasks.
   Donor-scoped episodes live beneath `tracking/donors/solid-floating-ui/updates/<from>-<to>/`
   with `episode.json` and `report.json`. From/to/report content is immutable;
   mutable progress belongs in a separate state/journal. Repeated identical
   requests resume/deduplicate, not create different reports for the same range.
4. Diff immutable git objects or a separate candidate workspace; **do not move
   the active baseline checkout**. While an episode is active, retain its candidate
   and queue newer fetched SHAs separately. Serialize writes with explicit locks
   and atomic recovery. Base UI and donor episodes must never share an identity
   solely because SHA ranges happen to match.
5. Map modified/renamed/deleted source and tests to existing owners. Include
   exported types, package/compiler inputs, license, docs and non-runtime paths.
   Unknown/new paths require explicit triage. A no-op needs recorded reasoning;
   “not adopted” still gets a reviewer decision if it affects adopted code.
6. Owners **manually reconcile** into their existing target leaves, maintaining
   local RC13 changes and Base UI outcomes. Tooling may create reports/tasks;
   it must never overwrite adaptations, switch contracts, auto-install donor
   dependencies, auto-commit or claim parity. Record source SHA/path/range and
   modified-copy notices for every copied substantial portion.
7. Run impacted type/unit/SSR checks and retained browser/packed-license gates.
   Only an explicit reviewed promotion after that exact episode is accepted can
   change the baseline/adopted/verified SHA. A new baseline pin is a separate
   coordinator action; keep prior verified objects and immutable reports usable.
   Explicit abandon preserves history and does not rewrite an active report.

Local-fixture validation must exercise fresh clone, unchanged SHA, normal update,
dirty source, wrong remote, missing object, non-ancestor history, fetch failure,
concurrent calls, interrupted/resumed writes, later candidates and abandonment.
Snapshot both baseline HEAD and adaptation bytes, plus the other upstream's
state, before/after. No real update is needed to qualify this behavior.

## Ownership adjustments

The user's new authority supersedes positioning's old “no third-party Solid
adapter” text **for owned, reviewed RC13-adapted donor source**. It does not
authorize an installed Solid1 runtime. Exact replacement wording and root-context
attachment seam request are in the assessment and Beads owner comments. Target
owns patterns and central manifests stay with their existing integrators.

Use one-time licensed adaptations for genuinely tiny helpers (ref callback loop,
DPR rounding, listener cleanup). Substantial maintained implementations deserve
tracked donor/dependency treatment; a one-line re-export of reselect's LRU is not
a tiny algorithm. Avoid bringing in React subscription shims or duplicating
Base UI's already-tracked tabbability and marking algorithms.

## Verification and handoff

Run from the repository root, with all terminal commands RTK-wrapped:

```sh
rtk proxy node tracking/donors/solid-floating-ui/verify.mjs
rtk proxy node --conditions=browser --conditions=development tracking/donors/solid-floating-ui/compatibility.mjs
rtk git submodule status
rtk git diff --check
```

The verifier is read-only: exact pin/gitlink/remote/branch/cleanliness, license
bytes, source/spec completeness, oracle file existence and target ownership.
The compatibility probe intentionally expects documented Solid1 forms to fail
RC13 types and checks native staging. Neither qualifies production adaptations.

Actual remaining gates are `bsolid-donor-positioning-proof`,
`bsolid-donor-interaction-proof`, `bsolid-donor-notices`, and
`bsolid-donor-update-proof`. Donor e2e tests are supplementary, never replacements
for Base UI assertions. Main `bsolid-donor-floating` remains in progress for
review; accepting it releases only its positioning dependency, not positioning's
other prerequisites or final qualification gates.
