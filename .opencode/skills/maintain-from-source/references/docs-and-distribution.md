# Documentation, generated surfaces, artifacts and provenance deltas

Read when an upstream delta touches public API, docs, examples, assets, build/dependencies, notices or packaging. This reference knows the port's migration boundaries and inspected command chain; it does not certify a current deployable site or release.

## Preserve source reuse without overwriting owned adaptation

The developer wants literal upstream file reuse where appropriate: prose, assets, CSS, anatomy, metadata and framework-neutral utilities. Source-derived docs should not be reinvented or redesigned unnecessarily. But copied React/Next runtime, demos or generated React type tables are not executable Solid documentation.

Keep four categories distinct:

1. **Captured source:** exact pinned bytes, hashes and licenses under `docs/upstream/`; never patch these to look Solid.
2. **Transformation/semantic adaptation:** structural non-executable AST, reviewed overlays, route/package/native-API language.
3. **Authored executable target:** Solid demo modules and their original CSS/assets.
4. **Generated output:** API tables, demo catalog, routes/static site and artifacts produced from those inputs.

A weekly update reconciles each affected category. Recopying React TSX into an authored Solid example destroys local adaptation; changing only the hash/SHA field hides unported semantics.

## Current documentation entry points

Discover current commands from root `package.json` and current docs READMEs. The docs were unfinished during the first runtime review but later site/API/demo code was added; do not hardcode the historical “no docs website” status.

```text
docs/content/transforms/README.md
docs/scripts/sync/{index,engine,policy}.mjs
docs/upstream-manifest.json
docs/upstream/snapshot.json
docs/upstream/generated/pages/
docs/scripts/demos/{generate,catalog}.mjs
docs/demos/
docs/demos/shared/runtime.tsx
docs/generated/demos/catalog.json
docs/scripts/api/{index,engine}.mjs
docs/generated/api/
docs/vite.config.ts
docs/scripts/site/{generate,paths,semantic-check,check}.mjs
docs/site/README.md
docs/site/{islands.tsx,site.css,demos.css}
```

At inspection, these aliases existed:

```sh
rtk pnpm docs:sync --check --verify-upstream
rtk pnpm docs:test:content
rtk pnpm docs:generate:demos
rtk pnpm docs:test:demos
rtk pnpm docs:api
rtk pnpm docs:api:check
rtk pnpm docs:check
rtk pnpm docs:build
rtk pnpm docs:test:browser
```

`docs:dev` served the source-tracked shell; `docs:preview` served built output. `DOCS_BASE` is an absolute prefix with a trailing slash; `DOCS_ORIGIN` supplies canonical/sitemap origin. `docs/generated/site/dist` was the static output. Verify current code before stating exact local/deployment behavior.

## Content intake: the version-input trap

- `docs:sync --import` explicitly captures the clean pinned submodule; normal sync/check uses local captured inputs, offline, without executing React/MDX modules.
- `--check --import` is not a valid combined mode. Unknown arguments fail.
- The pipeline had hardcoded initial source pins and `docs/scripts/site/paths.mjs` still had an initial `sha` constant at inspection. The CLI accepts no invented `--sha` flag.
- For a candidate update, inspect current intake/version policy and implement or use its real episode-aware input mechanism under one owner. Do not blindly run import against a moved candidate and then override failed pin checks.
- Check provenance/version/banners/source links together. A matching pin literal alone is not updated content.

Captured non-executable `sourceModule`, `demo:…#symbol` and `api:…#symbol` values are registry references, not browser imports or arbitrary MDX eval. Unknown nodes/expressions/spreads/exports must fail with locations. Retain React historical release meaning and ecosystem claims; do not relabel them Solid support.

Source-linked semantic approval keys include locations/content. A changed blob invalidates corresponding review, even if the route/name remains. Reapprove the changed statements with actual target evidence; do not carry every old approval forward blindly.

For prose-only changes, update source intake/semantic overlay and affected output; do not migrate untouched examples. For changed demos, copy legitimate neutral assets/CSS and reconcile actual Solid module behavior separately. New imports/assets, routes, deleted examples and licensing changes require explicit dispositions.

## Demo and API integration contracts

- A registered preview and its code tabs must use the **same actual TSX/CSS files**. Do not maintain duplicate source strings.
- Registry/catalog generation must expose missing upstream references; `generate.mjs --check --complete` rejects unresolved demos. Family workers own examples; one catalog/runtime owner integrates them.
- Lazy islands use `@solidjs/web`, preserve context/portal behavior, and dispose on variant/navigation/error. Site shell and generated/source-tab tooling are separate from library runtime.
- `docs:api` reads `distribution/exports.json` targets under `packages/solid/build/types`, not live React `types.md`. Emit current declarations **before** API generation after signature/JSDoc changes.
- API extraction should not execute runtime modules or rely on React component classification. Preserve native refs/events/render callbacks, namespace/generic information, stable anchors and honest unknown defaults/metadata.
- `docs:build` at inspection generated demos and site, but did **not itself guarantee fresh declaration/API output**. Do not assume one build command regenerates every prerequisite.

Conditional regeneration order for an API/demo/docs delta:

1. Reconcile source intake and affected semantic adaptations.
2. Implement relevant library/signature/example changes under their owners.
3. Emit declarations if needed: `types:package`.
4. Generate/check API for changed signatures/JSDoc.
5. Generate demo catalog from authored modules; run affected example tests/type checks.
6. Generate/build/check site and affected links/anchors/base paths/source tabs.
7. Run actual registered preview/browser interactions and cleanup.

Use local targeted scripts where supported; don't invent flags or claim an unrelated whole-site count proves the changed page.

The Vite site's browser graph intentionally rejects React, Next, Solid1/router and canonical upstream runtime imports. Preserve that check. Historical fonts marked unresolved must not silently ship; check current asset decisions/licenses rather than copying every source font on an update.

## Runtime/types/package delta chain

Important paths:

```text
packages/solid/src/index.ts
packages/solid/src/types/index.ts
packages/solid/src/floating-ui-react/{index,types,utils}.ts
packages/solid/src/internals/export-aliases/
packages/solid/package.json
distribution/{exports,package-contract,dependencies}.json
packages/solid/{build.config.mjs,tsconfig.build.json,api-extractor.json}
scripts/distribution/build/
scripts/distribution/types/
test/integration/
test/distribution/types/
```

The initial contract had 79 canonical keys (76 runtime/three types-only), plus workspace-only structural seams. These are historical counts, not a fixed ceiling for new upstream exports. Reconcile added/deleted/renamed keys, namespace parts, runtime/type-only intent and public capabilities. Preserve root exclusion of utilities that source excludes. Native create/use aliases are one implementation, not compatibility lifecycles.

`isReactEvent` was deliberately removed as React-only dead code, with an explicit integration exclusion. Do not resurrect it or other discarded React machinery merely to make literal exported-name comparison pass. Conversely, a native adaptation cannot omit a meaningful capability. Compare the **actual canonical wrapper** before importing the donor's broader standalone options.

Reconcile one owned manifest/lock/export map at a time. Signature changes flow through genuine declaration emission, JSDoc/API docs and independent consumers. Optional date adapters must not leak into ordinary root/subpath runtime or declarations.

`build:package` at inspection emitted declarations first, then DOM/server ESM. Build cleanup preserves `build/types`. Relative runtime/declaration imports use `.js`; source-stage resolution success is not NodeNext emitted-artifact proof.

The native compiler once captured type-only generic identifiers into SSR runtime. The tested pinned Babel fallback is intentional, not a React dependency. When upgrading compiler/runtime, qualify the original repro plus DOM/server production consumers before switching backend or removing the workaround. Do not update unrelated tool pins simply because upstream React did.

Run only applicable artifact checks:

```sh
rtk pnpm build:package
rtk pnpm test:package-types
rtk proxy node scripts/distribution/build/check.mjs
rtk proxy node scripts/distribution/build/smoke.mjs
rtk proxy node scripts/distribution/types/validate.mjs --api-extractor
rtk proxy node scripts/distribution/types/validate.mjs --package
```

Rebuild first after source edits. Default package smoke exercises actual Toggle/Separator hosts; `--compiler-control` is a control probe, not component qualification.

For changed export/runtime/optional-peer contracts, test real archive-installed consumers outside monorepo search paths and source aliases. No publishing is needed. Audit side effects/tree shaking without removing styles, event delegation, prehydration or necessary initialization. Check binary/source maps/notices and exclude tests, fixture helpers, screenshots, caches and absolute local paths from the archive.

## Provenance and donor maintenance

- `tracking/donors/solid-floating-ui/{provenance,source-map,assessment}.…` distinguishes planned, adopted and qualified material.
- Donor geometry lifecycle/getter/virtual-ref patterns were adapted into the existing owned implementation; no installed Solid1 runtime or second floating engine.
- Donor event fanout, default dismissal, list metadata, arrow algorithm and tree behavior differ from Base UI. Reconcile a donor improvement against Base UI source outcomes; do not replace Base UI algorithms wholesale.
- Tiny pure helpers can be licensed one-time adaptations. A one-line re-export of a nontrivial cache library is not a tiny algorithm; maintained geometry is an actual dependency, not an excuse to copy its entire implementation.
- React external-store shims should not be vendored into native reactive architecture.
- Preserve MIT and inherited notices, including attributed snippets. Check changed licenses, source ranges, adapters, fonts and redistributed assets during the delta, not only before publishing.

Current docs, archive or deployment status must come from current evidence. The runtime review's original website exclusion applied to that request, not to all future source reconciliation.
