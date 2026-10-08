# Inventory contract v1

`ledger.schema.json` is the worker-facing contract. Workers write only their ticket-owned
ledger; inventory reads it and never migrates or overwrites it. Existing bootstrap evidence
is a different format and is not silently treated as a case ledger.

Required top-level fields: `schemaVersion: 1`, `baseline` (full Git SHA), `owner` (Beads ID),
`sources`, `cases`. Each source records pinned `path`, Git `blob`, `targets`, `disposition`
and a nonempty `reason`. Dispositions describe the **mapping strategy**, not completion.
Targets are repository-relative POSIX paths, never upstream/reference paths or globs.

Each case records `id`, `sourcePath`, `sourceBlob`, `kind`, `status`, `targets`, `reason`,
`evidence` (commands/results), and `blockers` (Beads IDs). Copy IDs from the generated
source manifest's `tests.declarations`, `tests.unresolved`, or an accepted runtime
collection (runtime ingestion is the blocked `bsolid-inventory-runtime` followup).
`static-declaration` is a source call site, **not** an expanded test case.
`runtime-case` and `type-scenario` are reserved kinds until validated collection/type
identities are available; invented IDs are rejected. `unresolved-dynamic` explicitly
preserves unknown cardinality.

Statuses: `pending`, `pending-browser`, `blocked`, `passing`, `adapted`, `upstream-skipped`.
Passing/adapted records require targets and evidence; adaptations and skips require a
specific explanation. Blocked records require real blocker IDs. Unresolved dynamic
records cannot pass or be adapted/skipped away. Pending browser work never counts as passing.

Multiple serialized family stages may contribute **different case IDs** to the same
owned family ledger; exactly one owner is accountable per mapping. Shared source references
in ticket `sourcePaths` are research inputs, not competing ownership claims.

An empty/missing ledger is zero mapped cases, not 100% coverage. Static file and declaration
totals are inventory metrics only. The report's runtime coverage denominator remains null
until runtime collection is complete; non-browser and release gates must not interpret
successful inventory validation as behavior parity.

Consumption and CLI details: `scripts/tracking/README.md`.
