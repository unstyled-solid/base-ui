# Full documentation qualification evidence

Owned evidence preparation seam for `bsolid-docs-complete`, which remains
assigned to **docs-coordinator**. These scripts do not build the site, migrate
demos, emit declarations, change the catalogs, or supply reactive adaptations.
The coordinator owns final generation/build/browser replay.

## Audit

```sh
rtk proxy node docs/scripts/qualification/audit.mjs
rtk proxy node docs/scripts/qualification/audit.mjs --summary
rtk proxy node --test docs/tests/qualification/*.test.mjs
```

The report is JSON on stdout; exit 1 means incomplete. `--summary` retains
counts and the total failure count but prints only the first 20 failures. The
full report must be retained by the coordinator's final evidence pipeline.
Options `--site`, `--artifact`, `--evidence` accept repository-relative paths;
the defaults are `docs/generated/site`, `docs/generated/site/dist`, and
`docs/tests/qualification/evidence/execution.json`.

The auditor joins:

* Independently enumerated pinned canonical public `page.mdx` files, imported
  manifest/pages, semantic overlays, source hashes, generated route ledger,
  and **actual built HTML**. Every route, heading, anchor and local asset/link
  is checked. Missing integrations and unresolved publication reviews fail.
* All 79 export-contract declaration entrypoints against a **read-only full
  current declaration/JSDoc extraction**, including internal distribution
  contracts, all generated API Markdown and rendered public parts/rows.
  Unavailable metadata/documentation is retained as a gap, not invented as empty.
* A regenerated **in-memory** demo inventory/file graph and all canonical demo
  factories, all actual hosts, and every registered variant's execution result.
  This uses the supported catalog reader, never `migrate-remaining.mjs`.
* Required actual per-page Markdown and complete declaration-derived API
  Markdown, byte-compared with existing generators' representations. Existing
  Markdown formatting/partial-fragment behavior is reused literally.
* Retained checks, real logs, outcome checksums and the actual artifact/live
  source binding. Six-preview or hero-only reports cannot pass.

The release report's `bindingSha256` hashes sorted artifact/source input
records. `binding()` is exported for a coordinator pipeline needing the full
list. This is an evidence integrity check, not a substitute for test assertions.

## Execution recording seam

Run only after the coordinator finishes declarations/catalogs/static build.
The recorder spawns the supplied command through **`rtk proxy`**, retains its
exit code and unfiltered stdout/stderr, and rejects changes to artifacts or
live implementations during the command. It refuses a `DOCS_DEMO_IDS` filter.

```sh
rtk proxy node docs/scripts/qualification/record.mjs docs-check -- pnpm docs:check
rtk proxy node docs/scripts/qualification/record.mjs route-anchor-crawl -- node docs/scripts/site/check.mjs --dist
rtk proxy node docs/scripts/qualification/record.mjs registered-previews --result docs/generated/browser/inventory.json -- node docs/scripts/site/browser-all.mjs
```

The current `browser-all.mjs` mounts the **real source-backed** preview runtime
through Vite's `/@fs` endpoint. Its result proves registered source-preview
smoke/source-tab/disposal coverage, not production-bundle replay or all deferred
semantic tests. Run it against the coordinator's live docs server with
`DOCS_TEST_URL` set as needed. No server is started by these preparation tools.

**Unresolved execution seam:** no existing single runner emits the complete
deferred real-family result described below. The coordinator must wire the
actual lazy mounts, variant/source equivalence, portal/focus, form, SSR guidance
and cleanup suites; a `browser-all` or hero diagnostic pass alone cannot
manufacture this record. Then record that runner with:

```sh
rtk proxy node docs/scripts/qualification/record.mjs real-family-deferred --result <repository-relative-result.json> -- <actual-executable> <actual-arguments>
```

Every check in schema-v1 `execution.json` has `kind`, `argv`, `startedAt`,
`finishedAt`, `exitCode`, `log`, `logSha256`. The full preview and deferred checks
also have `result`, `resultSha256`. The enclosing object contains `schemaVersion:
1`, the pinned `sourceSha`, and `bindingSha256`. Previous evidence with a
different binding must be archived/reset by its coordinator rather than merged.

The existing preview result shape is `{ passed: ["family/demo/variant", ...],
failures: [...] }`. Every registered variant must appear exactly once and the
failure list must be empty, including diagnostics and post-sequence disposal.

The deferred result shape is:

```json
{
  "suites": [
    {
      "kind": "lazy-preview",
      "status": "passed",
      "executed": 262,
      "failures": [],
      "cases": [{ "id": "family/demo/variant", "status": "passed" }]
    }
  ]
}
```

The example is a **shape**, not execution evidence; actual counts/cases are
derived from the current inventories. Required suite kinds:
`lazy-preview`, `variant-source-equality`, `portal-focus`, `forms`,
`ssr-guidance`, `cleanup`. The first, second and last must execute **every
registered variant**. Portal/focus and forms account for every variant; SSR
guidance accounts for every source route. Where a specific latter case is
genuinely not applicable, retain `status: "not-applicable"`, a concrete
`reason`, `reviewedBy`, `source` path, and current `sourceSha256`. Missing
implementation is not non-applicability. Each suite's executed count must
equal its passed cases, with at least one real execution.

## Supported Markdown staging

The actual existing spec is `packages/solid/build.config.mjs:docsDirectory =
docs/public`, with the build and upstream `stagePublishedDocs.mjs` copying
all `.md` files. The current site generator emits page Markdown elsewhere.
This stage copies **already-existing verified outputs** into that seam:

```sh
rtk proxy node docs/scripts/qualification/stage-markdown.mjs
rtk proxy node docs/scripts/qualification/stage-markdown.mjs --check
```

It copies every page and `api/<module>.md`, adds
`docs/public/markdown-manifest.json` with staging version
`bsolid-markdown-stage/1`, package identity/version/private state, upstream pin,
and source/destination/checksum inventory. It rejects unexpected existing files
and symlink destinations instead of deleting coordinator/user work.

**Build-owner seams:** stage Markdown before the final `--docs` package build;
copy `markdown-manifest.json` alongside the Markdown (the existing build copies
only `.md`), and add `docs:audit-complete` / qualification-test command wiring
through the root script integrator. Final artifact retention and checksums
belong to the coordinator, including the packed Markdown inventory check.

After the coordinator packs the final staged package:

```sh
rtk proxy node docs/scripts/qualification/audit-packed.mjs --tarball path/to/actual.tgz
```

This independent gate reads the actual archive, requires every page/API
Markdown plus the versioned manifest, compares bytes/checksums against the
current complete inventory, and verifies package identity/version/private
state. Wire it alongside the notice archive gate in `bsolid-dist-pack`.

Source scope does not include runtime changes. Local V2 guidance has been read;
no reactive APIs are implemented here, and no V2 docs-MCP runtime consultation
is claimed for these Node-only preparation tools.
