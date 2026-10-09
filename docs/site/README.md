# Local documentation website

Run `pnpm docs:dev` from the repository root. Open http://127.0.0.1:5173/.

`pnpm docs:build` produces the static website in `docs/generated/site/dist`.
`pnpm docs:preview` serves that artifact on http://127.0.0.1:4173.
After building, `pnpm docs:check` typechecks the Solid examples and checks the
built pages, assets, local links, anchors, and missing demo/API integrations.
That is the website release check; no per-page approval or qualification receipts
are required. `pnpm docs:check:source` is an optional source-maintenance audit.
`pnpm docs:test:browser` runs the full preview/source/interactions inventory against
the development server. Browser evidence is written to `docs/generated/browser/`.

For a subdirectory deployment, set `DOCS_BASE=/your-prefix/` for the build and preview.
Configure the static host to serve directory `index.html` files and `404.html` for missing routes.
Set `DOCS_ORIGIN` to the real host origin when building canonical links, social
metadata, robots.txt, and the sitemap (for example, `DOCS_ORIGIN=https://your-host pnpm docs:build`).
Do not include a path: subdirectory deployments use `DOCS_BASE` separately.
Without an origin, local previews use relative canonical URLs, are marked noindex,
and do not emit a sitemap.
Primary documentation becomes indexable when the origin is configured; upstream
React history remains a separately labelled, noindex archive.

## Netlify

The root `netlify.toml` configures the pinned Node/pnpm toolchain, `pnpm docs:build`,
and the `docs/generated/site/dist` publish directory. No credentials are needed
to build locally. When you connect the repository later, Netlify supplies `URL`
as the production canonical origin. Set `DOCS_ORIGIN` only to override it for a
custom canonical domain. Deploy previews and branch deploys remain noindex;
`DOCS_NOINDEX=true` can also force noindex explicitly. Do not add an SPA fallback:
the site serves distinct directory `index.html` documents and a real `404.html`.

The integration report is `docs/generated/site/report.json`; missing demos and API references are reported there.

The registry retains copied Solid examples and explicit exclusions for upstream-only
React integrations. The primary handbook teaches native Solid examples rather than
React adapters. `/llms.txt` indexes Markdown pages; `/llms-full.txt` includes full
examples and generated API references. Runtime qualification issues are handed to the library reviewer in
`docs/docs-library-review-handoff.md`. The copied Paper Mono font is licensed;
the four upstream Die Grotesk fonts remain excluded. The website uses DM Sans
and IBM Plex Mono from Google Fonts, with system fallbacks and `font-display: swap`.
