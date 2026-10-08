# Demo infrastructure seams

`runtime.tsx` exports `mountDemo(host: HTMLElement, id: string): () => void`.
Mounting again into a host disposes its previous island. The returned function is
idempotent and invalidates pending lazy module/source loads. Variants and reloads
dispose the prior Solid root, including portals and setup-owned resources.

Family owners export a default `DemoFamily` from `docs/demos/<family>/entry.ts`.
Use `<family>/<demo>` IDs, a repository-relative upstream `index.ts` path, and
variant `files` containing **every** executed local TSX, CSS and asset dependency.
Metadata uses static literals (an identifier for the default array and `satisfies`
are supported); component values are imported component identifiers. Family
modules are discovered with a lazy `import.meta.glob`; no registry edits.

The raw-file glob is separate from executable imports. It preserves source bytes,
CSS Module imports and package identities. Code display uses text nodes and a
small lexical highlighter; there is no eval, arbitrary compilation, injected HTML,
React runtime or CDN sandbox. CSS Modules are compiled by Vite as authored;
Tailwind compilation and global demo theme styles belong to the site build owner.
Portal styling must be available in the document, not only inside the preview.
Binary assets are linked using Vite's build-time URL imports rather than decoded
into inaccurate code snippets; copying is enabled only for loaded textual files.
The lexical token classes (`demo-token-comment`, `demo-token-string`,
`demo-token-keyword`) are site styling hooks.

## Coordinator commands

- `docs:generate:demos`: `node docs/scripts/demos/generate.mjs`
- `docs:test:demos`: `node docs/tests/demos/run.mjs`
- Focused types: `node node_modules/typescript/bin/tsc -p docs/tests/demos/tsconfig.json`
- Determinism: `node docs/scripts/demos/generate.mjs --check`
- Final family gate: `node docs/scripts/demos/generate.mjs --complete`

All terminal invocations must use `rtk proxy` in this repository. The coordinator
owns adding scripts/dependencies to manifests.

`docs/generated/demos/catalog.json` has `entries`, `references`, and `missing`.
`references` centrally maps transformed MDX keys such as
`demo:docs/src/app/(docs)/react/components/button/demos/hero#DemoButtonHero` to
`button/hero`; index-file and extensionless aliases are also included. Resolve a
page's imported binding reference through this object before calling `mountDemo`.
Missing references remain explicit; `--complete` fails until every imported demo
is implemented. Generation parses metadata without executing family components.
It records exact file hashes, local dependency edges and package imports, and
rejects missing local files, omitted executed dependencies, traversal, symlinks,
duplicate IDs, and crossing into library internals.

## Qualification limits

Fixtures validate infrastructure independently, including a production Vite
build replayed in Chromium with a response CSP that disallows unsafe-eval and
inline scripts/styles. Final qualification must replay real CSS Modules/Tailwind
families, layout, portal styles, and accessibility. Clipboard
failure is presented as a status diagnostic, and source links target the pinned
upstream commit. No downloadable example is exposed while the package remains a
private workspace identity.

The pinned upstream `demoProcessor.mjs` delegates loading/highlighting to
`@mui/internal-docs-infra`, which is absent from this workspace. The bounded Node
reader is independently tested; reuse of that external loader/highlighter remains
an integration seam requiring coordinator review. It is not represented as a
verified upstream implementation.
