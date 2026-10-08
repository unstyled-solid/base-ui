# Pinned-source CLI and writer contract

Owner: `bsolid-upstream-cli`. Run from the repository root with Node and RTK installed.
The root script integrator owns `package.json`; direct equivalents are always available:

```sh
rtk proxy node scripts/upstream/cli.mjs init
rtk proxy node scripts/upstream/cli.mjs update
rtk proxy node scripts/upstream/cli.mjs status
rtk proxy node scripts/upstream/cli.mjs update --source solid-floating-ui
rtk proxy node scripts/upstream/cli.mjs abandon --reason "Coordinator stopped this batch"
rtk proxy node --test test/upstream/git/*.test.mjs
```

Requested package aliases: `upstream:init`, `upstream:update`, `upstream:status`,
`upstream:abandon`, `test:upstream:git`. Options follow the command. `--root` selects
a different repository root. Output is JSON (also accepts `--json`, `--no-watch`).
Failures return exit code 1 and `{error, message}` on stderr. `--help` describes recovery.
`verify` deliberately fails closed until the separately owned verifier is implemented.

## Independent sources

| Selection | State | Immutable episodes |
| --- | --- | --- |
| `base-ui` (default) | `tracking/upstream.json` | `tracking/updates/<from>-<to>/` |
| `solid-floating-ui` | `tracking/donors/solid-floating-ui.json` | `tracking/donors/solid-floating-ui/updates/<from>-<to>/` |

`git/state.mjs` exports the source adapter registry. Each state's **own** `repositoryUrl`,
`branch` and immutable SHAs control its checkout. `.gitmodules`, local submodule overrides,
origin URL and attached branch must agree. No branch, SHA, parity or update cadence is shared.
Paths are fixed independent `upstream/<source>` submodules, never the research checkout.
Adapters also define checkout policy: **Base UI follows `fetchedCandidateSha`; the donor stays
at `baselineSourceSha`**, including its first candidate fetch. Inspect donor candidate objects
by immutable Git SHA; updating never checks candidate files out over the donor baseline. A donor
baseline promotion is a separate reviewed coordinator action, not a fetch command.
Donor initialization/provenance belongs to `bsolid-donor-floating`. The CLI consumes the
owner's record, preserving additional provenance fields. Donor commands run only on explicit
developer request; nothing schedules fetches or rewrites an owned Solid adaptation.

The core state schema is `tracking/upstream-state.schema.json`; the original bootstrap
six-field record remains valid. `activeEpisode` is absent/null or `{id, fromSha, toSha,
reportHash}`; its `toSha` must equal `fetchedCandidateSha`. `queuedCandidateSha` is optional/null.
Fetch never changes `baselineSourceSha` or `verifiedParitySha`. An existing qualified pin
is retained in the episode's `previousVerifiedParitySha` and under the source checkout's
`refs/baseui-solid2/<source>/pins/<sha>` along with baseline/from/to/queued commits.

## Transitions and recovery

- `init`: validates a tracked gitlink and source configuration, initializes a missing checkout,
  then checks out the source-policy pin detached (Base UI candidate; donor baseline). It never stages a gitlink. An existing
  checkout at a different SHA is rejected, not reset. Fresh initialization is journaled before
  cloning, so a failure between clone and candidate checkout can resume.
- `update`: fetches exactly `refs/heads/<recorded branch>` and freezes `FETCH_HEAD^{commit}`.
  On a fresh clone, it first initializes the recorded pin, so fetching needs one command.
  A missing checkout with an active batch requires explicit `init` instead.
  Missing commits, rewritten history and remote rollback fail. Same SHA is a state-byte no-op.
  With no active batch, creates an immutable episode. Base UI moves the clean checkout to its
  candidate; donor HEAD remains at its recorded baseline, even for this first update.
  With an active batch, records a later descendant as queued **without moving the checkout**.
- `abandon --reason`: records immutable `abandoned.json`, restores the active episode's starting
  candidate state (and Base UI checkout; donor baseline HEAD stays fixed), clears active state
  and retains reports, previous parity and any later queue. Repeating
  abandonment is a no-op. The same abandoned range cannot be silently reactivated; a later
  descendant can start a new range after coordinator review.
- `status`: read-only/offline checkout and state inspection, including pending transaction and lock.
  It reports dirtiness without attempting repair. It is diagnostic, not a parity validation gate.

Each writer takes `<state>.lock` via exclusive creation. A lock records host, PID and unique token.
Overlapping calls fail immediately with `LOCKED`. A hard-killed process leaves its lock in place.
Inspect `status`; after proving the original local process is dead, explicitly run:

```sh
rtk proxy node scripts/upstream/cli.mjs unlock --token <token-from-status>
rtk proxy node scripts/upstream/cli.mjs update
```

Use the same `--source` on every donor command. Cross-host, malformed or live locks cannot be
automatically removed; coordinate recovery manually. Never delete a live lock. Git does not
participate in our lock when run directly: source workers must keep the pinned checkout read-only.

`<state>.transaction.json` contains durable before/after state, exact checkout SHAs and artifact
bytes. Intent is fsynced and atomically renamed **before** artifacts/checkout/state. Artifacts
are complete-byte, non-overwriting publications; state uses fsync + atomic rename. Repeating any
mutating command first finishes the pending intent and returns `resumed`, without fetching a new
tip. Dirty work, moved HEAD, conflicting state or modified reports stop recovery and retain intent.
Crash-left `*.tmp` files are not authoritative; do not replace state with them. Reports are never
silently regenerated over different historical bytes. No reset, clean, stash, force checkout,
repo commit, push or publication occurs. Ignored files also block source writes.

## Impact and verification handoff

An episode has `episode.json` and `report.json`. `reportHash` is SHA-256 of the **exact UTF-8
report bytes**, including final newline. The immutable raw report includes source, repository,
branch, exact from/to SHAs, ordered commit IDs and raw diff entries with rename detection,
old/new modes, blob IDs and lossless NUL-delimited path parsing (including newline filenames).
Every entry starts `disposition: "untriaged"`; raw fetch success is not semantic classification.
`bsolid-upstream-impact` writes separate classification/ticket artifacts, never edits this report.
It must implement unknown-path triage, source/target/test mapping and idempotent Beads dispatch.

Importable API:

- `workflow.mjs`: `runUpstream({root, source, command, reason?, token?})`,
  `validateEpisode(paths, state)`.
- `state.mjs`: `sourcePaths(root, source)`, `readState(paths)`, `saveState(paths, state)`,
  `withSourceLock(paths, synchronousAction)`, `hash`, `json`, `immutableWrite`.
- `checkout.mjs`: source inspection, clean/HEAD/commit/ancestry checks.
- `process.mjs`: `git(cwd, argv)` / `gitText(cwd, argv)` always spawn `rtk proxy git`, preserving
  machine-readable output. Local fixture commits occur only in temporary test repositories.

The impact/verifier writers **must** acquire this source's lock, reject a pending transaction
until CLI recovery completes, re-read state inside the lock and validate episode hash/range.
Only the verifier may advance `verifiedParitySha` and clear `activeEpisode`, after all exact-SHA
evidence passes. Preserve `queuedCandidateSha`: the next explicit update opens that range (or
a later descendant) after re-fetching and ancestry checks. Do not hold asynchronous work inside
the synchronous lock callback; gather expensive evidence first, then recheck it under the lock.
No verifier or Beads-ticket-generation implementation is represented by these fetch fixtures.
