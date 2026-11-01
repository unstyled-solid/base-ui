# Netlify documentation site

Import `unstyled-solid/base-ui` into Netlify and deploy the repository root.
The root `netlify.toml` supplies the build command and publishes only
`docs/generated/site/dist`. No dashboard environment variables, adapter, secrets,
or separate library publication are required.

Netlify installs pnpm 11.8.0 from `packageManager` with `--frozen-lockfile`.
The build checks out the **recorded** public Git submodules (never their branch
tips), generates the Vite multi-page site, then runs `docs:check`.
Network access to GitHub and the npm registry is required.

The deployment uses supported Node 24.22.2 LTS. The workspace development engine
currently names Node 25.8.1; pnpm may print its engine warning on Node 24. The
Netlify pin does not change the workspace or Solid dependency profile.

`DOCS_BASE=/` keeps routes and assets at the site's root. Netlify provides `URL`
and `CONTEXT`; the existing generator derives the canonical production origin
from `URL` and prevents preview indexing. A custom domain needs no source URL
change. Leave `DOCS_ORIGIN` unset unless deliberately overriding that origin.

For a local equivalent using the configured Node and pnpm versions:

```sh
pnpm install --frozen-lockfile
git submodule update --init --recursive
pnpm docs:build
pnpm docs:check
pnpm docs:preview
```

Netlify serves generated directory-index routes and the generated `404.html`.
Do not add a catch-all SPA rewrite: it would hide missing pages and assets.
Local build/preview validation is not evidence of a hosted Netlify deployment.
