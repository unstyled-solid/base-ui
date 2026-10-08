# Immutable Git episodes and safe reconciliation

Read for any authorized source update, crash recovery, baseline question, or verifier change.

## Current implemented surfaces, not planned prose

Read the current implementations:

```text
scripts/upstream/cli.mjs
scripts/upstream/git/README.md
scripts/upstream/git/{state,workflow,checkout,report,process}.mjs
tracking/upstream-state.schema.json
test/upstream/git/
```

Some `docs/upstream-workflow.md`/donor prose predates fixes or implementation. Current CLI code and current fixture results decide what a command actually does.

At this skill's update, the CLI supports `init`, `update`, `status`, `abandon`, `unlock`, `--source`, `--root`, `--reason`, `--token`, and JSON output. Root package aliases exist. `verify` is reserved and fails closed. `report.mjs` produces a raw source diff with every entry `untriaged`; automatic impact-to-Beads generation and parity advancement are not provided by fetch fixtures.

## Independent source policies

| Source | State | Episodes | Checkout policy |
|---|---|---|---|
| `base-ui` | `tracking/upstream.json` | `tracking/updates/<from>-<to>/` | Clean checkout follows `fetchedCandidateSha` after an authorized update |
| `solid-floating-ui` | `tracking/donors/solid-floating-ui.json` | `tracking/donors/solid-floating-ui/updates/<from>-<to>/` | Checkout stays at `baselineSourceSha`; inspect candidate objects without moving it |

The donor's first-candidate movement was found and corrected during the initial migration. Do not reintroduce it by applying Base UI's policy to both sources. Donor reconciliation is qualified against the **separately recorded Base UI oracle**, not against all donor APIs. Check current provenance/adoption records alongside source state.

Both sources must remain unmodified content-wise. Authorized CLI checkout transitions are coordinator actions, not permission for workers to edit source, force reset, stash, install dependencies into it, or change its branch.

## Meanings that must stay distinct

- `baselineSourceSha`: recorded baseline/pin, not necessarily current candidate checkout.
- `fetchedCandidateSha`: immutable candidate; branch names are not worker inputs.
- `verifiedParitySha`: exact revision qualified by evidence; null means no claim yet.
- `activeEpisode`: exact `{id, fromSha, toSha, reportHash}`; its `toSha` equals the candidate.
- `queuedCandidateSha`: later fetched revision; it cannot silently replace an active batch.
- Donor provenance/map/adapted-source state: separate from fetch state. A planned source map is not adopted runtime code.

Read `activeEpisode.fromSha`; do not infer an active range from today's branch tip or assume it always starts at the original baseline. If source state is unverified, do not bless an initial full port by testing only the new weekly changes. Identify inherited qualification gaps and their effect on this episode's acceptance.

## Before fetching

1. Verify the selected source, current status, clean checkout, configured remote/branch/path, and any lock/journal.
2. Check whether implementation workers or another chat own an active batch. Coordinate, not race.
3. Capture the current target working-tree state. Dirty target code is not automatically disposable or part of this delta.
4. Use `upstream:init` only for a missing checkout that needs initialization. Existing moved/dirty checkout errors should be investigated, not reset.

```sh
rtk proxy node scripts/upstream/cli.mjs status --source base-ui --json
rtk proxy node scripts/upstream/cli.mjs status --source solid-floating-ui --json
rtk proxy node scripts/upstream/cli.mjs --help
```

No routine install/build/test/CI or editor event should fetch/advance upstream. The developer chooses the cadence.

## Fetch result handling

```sh
rtk pnpm upstream:update --source base-ui
rtk pnpm upstream:update --source solid-floating-ui
```

- `unchanged`: no new range; do not generate duplicate work. Existing unfinished obligations may still need attention if included in the request.
- New active episode: use its frozen from/to/hash; Base UI may now be on the candidate, donor stays on its baseline.
- `queue`: newer SHA recorded while old batch stays active. Dispatch against the old frozen `activeEpisode`, not the queued tip.
- `resumed`: pending durable intent was completed first. Re-read state; this invocation may not have fetched a new tip.
- Error: preserve evidence and source. Dirty files, missing objects, wrong remotes, rollback/non-ancestor history and conflicting artifacts are not reasons for `--force`.

Compare Git objects at exact SHAs. Candidate source need not be checked out to read it:

```sh
rtk proxy git -C upstream/base-ui diff --find-renames <fromSha> <toSha> -- packages/react/src
rtk proxy git -C upstream/base-ui show <toSha>:packages/react/src/<exact-file>
rtk proxy git -C upstream/solid-floating-ui show <toSha>:packages/solid-floating-ui/src/<exact-file>
```

Include tests/docs/tooling/licenses and raw-report mode/blob/rename information, not just runtime text. Preserve binary/path correctness by consuming the existing report, not ad hoc whitespace parsing.

## Crash, lock and abandon semantics

Source-local files are `<state>.lock` and `<state>.transaction.json`. Locks contain host/PID/token. Intent is recorded before checkout/state/artifact writes. Reports and episode records are immutable, exact-byte hashed (including newline).

- After interruption, repeat the appropriate CLI mutating operation to finish its journal; inspect return/state before doing more.
- A stale lock is not automatically stolen. Verify the owner is dead and on the same host; use the CLI token check. Never delete a live or uncertain lock.
- Workers do not manipulate journals or call raw Git checkouts around coordinator locks.
- Explicit abandonment needs a reason and preserves historical artifacts. It restores the episode's starting candidate state; donor baseline stays fixed. Do not abandon to relabel failed parity as complete or silently reactivate an abandoned range.

```sh
rtk proxy node scripts/upstream/cli.mjs unlock --source <source> --token <token-from-status>
rtk pnpm upstream:abandon --source <source> --reason "<explicit coordinator decision>"
```

Use the same source selector throughout recovery. These are decision-dependent commands, not a mandatory weekly ritual.

## Classification and idempotency

`report.json`/`episode.json` are fetch artifacts. Place mutable classifications/progress in existing separate records/Beads, not by rewriting historical reports. Key work by **source + full range + owner/behavior scope**, not titles alone. Repeat/resume should find existing tasks and evidence rather than create another epic for the same change.

Use `tracking/source-manifest.json`, `tracking/export-manifest.json`, `tracking/schema/owners.json`, relevant family mappings, `docs/upstream-manifest.json`, donor map and actual imports. Planned/stale mappings do not prove implementation; read target paths. Static imports miss dynamic demo registries and context consumers.

The existing inventory API can read exact candidate trees (`scripts/tracking/git.mjs` `readTree(repo, sha)`). Its CLI and policy were initially pinned to a `BASELINE` constant. Do not run a baseline-pinned generator and claim it inventoried the candidate. Update generation inputs deliberately when that belongs to the episode, with regression/provenance checks.

## Acceptance / future verifier contract

Before promotion, all required changed-source dispositions, implementations, reviewed no-ops, applicable tests, generated surfaces and unresolved relevant gates must be accounted for at the exact range. Keep prior evidence and pins recoverable.

Every state writer must use the shared source lock, reject/recover a pending journal, re-read state inside the lock and validate the exact episode/report hash. Gather asynchronous expensive evidence **before** the synchronous lock callback, then recheck source and target fingerprints under it. Preserve `queuedCandidateSha` and the other source's state.

There is no implemented promotion command in the inspected CLI. Do not replace it with ad hoc JSON edits. A separately authorized verifier can be implemented under `bsolid-upstream-verify` with these contracts and interruption/concurrency fixtures; until then, leave formal verification blocked and report delivered delta scope honestly.

Relevant existing gate names: `bsolid-upstream-impact`, `bsolid-upstream-verify`, `bsolid-donor-update-proof`. Check current implementation/status; names are not proof the feature exists.

If modifying the engine, replay local fixtures for unchanged SHA, missing/dirty source, wrong URL/branch, ancestry, concurrent writers, interruption, resume, queued candidates, abandonment and donor baseline stability. Do not exercise failure recovery against the live canonical sources.
