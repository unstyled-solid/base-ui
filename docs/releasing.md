# Release npm and the documentation website

Log in once with `npm login`, and connect this GitHub repository to Netlify.
Run from the repository root:

```sh
pnpm release patch --yes
```

This bumps both version sources and the READMEs, updates the lockfile, builds the
package and website, checks the website and package contents, commits repository
changes, publishes the compiled public npm package, tags the release, and pushes
GitHub. Netlify deploys the connected branch automatically.

Preview without changing or publishing anything:

```sh
pnpm release patch --dry-run
```

Use `minor`, `major`, or an explicit version instead of `patch` when needed.
The command includes your current repository changes, except ignored files and
`aviross.pub`; review them before running. npm may prompt for authentication/OTP.

On failure it stops without reverting your work. If npm publication succeeded
but the push failed, finish the Git push; do not publish or bump again.
