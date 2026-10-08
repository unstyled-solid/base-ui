# Local documentation website

Run `pnpm docs:dev` from the repository root. Open http://127.0.0.1:5173/solid/overview/quick-start.

`pnpm docs:build` produces the static website in `docs/generated/site/dist`.
`pnpm docs:preview` serves that artifact on http://127.0.0.1:4173.
`pnpm docs:check` checks generated demo freshness and static routes/anchors.
It also requires zero unresolved source-demo references, typechecks all registered
Solid examples, and checks non-historical snippets for React-only syntax.
`pnpm docs:test:browser` runs the full preview/source/interactions inventory against
the development server. Browser evidence is written to `docs/generated/browser/`.

For a subdirectory deployment, set `DOCS_BASE=/your-prefix/` for the build and preview.
Configure the static host to serve directory `index.html` files and `404.html` for missing routes.
Set `DOCS_ORIGIN` to the host origin when building canonical links and the sitemap.

The integration report is `docs/generated/site/report.json`; unresolved demos and semantic adaptations remain explicit there and on affected pages.

The registry contains 137 Solid examples and five explicitly scoped React ecosystem
examples. Runtime qualification issues are handed to the library reviewer in
`docs/docs-library-review-handoff.md`. The copied Paper Mono font is licensed;
the four upstream Die Grotesk fonts remain excluded pending a redistribution grant.
