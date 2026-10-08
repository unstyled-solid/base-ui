# Source-tracked documentation content

Owner: `bsolid-docs-content`. Source: React Base UI commit
`19511bb171f3b360b006c94cf6d07e53cb446505`. This is a non-executable content
intermediate representation for the site, API, demo and semantic-overlay owners.

## Commands

The shared-manifest owner integrates these exact scripts:

```sh
rtk pnpm docs:sync --import          # explicitly capture the clean pinned submodule
rtk pnpm docs:sync                  # regenerate from local captured inputs only
rtk pnpm docs:sync --check          # read-only hashes + deterministic output check
rtk pnpm docs:sync --check --verify-upstream  # additionally compare canonical bytes
rtk pnpm docs:test:content
```

Entrypoints: `docs/scripts/sync/index.mjs` and
`node --test docs/scripts/sync/content.test.mjs`. Required exact parser versions
are exported by `policy.mjs` and checked against resolved package metadata.
Missing tools fail; this pipeline never installs packages, indexes code, fetches
the network, changes the checkout or executes imported React/MDX modules.

`--import` is the only mode reading `upstream/base-ui`. It checks HEAD and dirty
status before capturing files. Normal regeneration and `--check` need neither
Git nor an upstream checkout. Unknown arguments and `--check --import` fail.

## Files and ownership

- `docs/upstream/base-ui/**`: byte-identical original inputs, including the MIT
  notice, docs package provenance, public MDX, referenced demo dependency graph,
  CSS and assets, and four reused pure Markdown/heading helpers.
- `docs/upstream/snapshot.json`: pinned source catalog, hashes and dependency
  edges. Private/Next routes have named exclusions. React `types.md` files have
  hashes and explicit excluded dispositions, with **no copied API output**.
- `docs/upstream/generated/pages/**`: deterministic JSON AST and page records.
- `docs/upstream/generated/report.json`: every public page's disposition and
  aggregate handler/semantic inventory.
- `docs/upstream-manifest.json`: source/destination/hash/license/owner/version
  records, transformation-source hashes, navigation/headings and adaptation flags.

The writer only accepts snapshot/generated/manifest paths. It rejects traversal
and symlinks, writes only changed bytes, and stops on unexpected generated files
instead of deleting possible user work. It never writes `docs/components/**`.

## Consumer contract (schema version 1)

`transformPage(source, sourcePath, repositoryRoot)` returns:

- `provenance`: source SHA, content SHA-256, upstream URL and retained MIT notice.
- `ast`: Markdown/GFM/MDX nodes, source positions and preserved code/prose. ESTree
  executable syntax trees are removed after structural interpretation. Imports
  and metadata exports become **non-executable** `sourceModule` records; their raw
  source stays available as evidence. Never compile/evaluate these records as MDX.
- `title`, `subtitle`, `metadata`: structurally extracted original values, not
  automatically rebranded claims. `Subtitle` children remain in the AST.
- `headings`: ordered depths, text and upstream IDs. The exact upstream badge,
  TOC-exclusion and slug helpers are reused, including duplicate and explicit IDs.
- `imports`: source/imported/local bindings plus `demo:…#symbol`, `api:…#symbol`
  or custom references. These are registry keys, **not executable import URLs**.
  The site/demos/API owners resolve them against real Solid outputs.
- `nodes`: exact custom/native MDX occurrences, static attributes, handler names
  and locations. Unknown nodes/exports/expressions/spreads fail with an actionable
  location. Static metadata accepts JSON-like values only; no `eval` or imports.
- `adaptations`: source-linked unreviewed semantic work. Public component names,
  React hooks, render elements, refs, events, class names, framework prose/SEO,
  ecosystem/support claims, code fragments and API/demo handlers stay visible.

Package rewriting touches only parser-identified module-specifier ranges in code
nodes. Comments, ordinary strings, behavioral prose and original code (`sourceValue`)
are retained. The target is the **private workspace identity `baseui-solid2`**;
no npm publication or compatible ecosystem integration is asserted.

Local `/react` links and relative MDX page links map to `/solid`. Historical
release routes map to `/upstream/react/overview/releases/**`; code, dates, links
and package names inside those historical pages stay React-scoped. The source
release index is retained with an explicit historical notice. Production-error
MDX is accounted for as upstream-reference-only, not a Solid error-code catalog.
Navigation list ordering is preserved, not rewritten into central site navigation.

Every imported page starts `publishable: false`. `assertSiteReady(page, approvals)`
rejects missing handlers and unreviewed adaptations. Approval keys are
`kind@location:detail`; approvals require source-linked overlays and actual
component/API/demo evidence from their owning lanes. This guard is an integration
seam, not proof of rendering, accessibility or component parity.

## Provenance boundaries

Pure helpers are captured unmodified from the upstream `docs` package at the
source SHA, alongside its `package.json` and root MIT license. Their exact hashes
and external parser package versions are recorded. No external MUI tooling
package is vendored or imported into the browser graph.

React factories, reference tables and renderers are source-evidence boundaries:
their direct imports have explicit dispositions/hashes, but the Next/React
runtime graph is not copied recursively. CSS imports continue across those
boundaries. Referenced external URLs/packages are recorded, never downloaded or
asserted compatible. CSS bytes (including Tailwind directives and URLs) are
unchanged; actual site compilation/isolation is the site owner's responsibility.

The five upstream fonts are captured with exact hashes and the repository MIT
notice, but are marked `NOASSERTION` / `license-review-required` pending explicit
font redistribution provenance. Consumers must not publish unresolved assets.

## Verification and handoff

Node fixtures prove structural edits, unknown-node/static-expression failures,
preserved historical meaning and heading IDs, deterministic full-corpus output,
offline operation without a checkout, corrupt-input/obsolete-output failures,
write boundaries, and targeted mutation without touching authored component docs
or unrelated output mtimes. They do not execute browser code.

Actual results: `tracking/docs/content.json`. Outstanding integration, semantic,
font and final-render work is tracked in Beads and blocks `bsolid-docs-complete`.
