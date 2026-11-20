# Checks and releases

Use the Node/pnpm versions in `package.json`, install RTK, initialize the pinned
submodule (`git submodule update --init`), and run `pnpm install --frozen-lockfile`.
Install Chromium with `pnpm exec playwright install chromium` (Linux also needs
`--with-deps`).

## Check a change

| Change | Development check |
| --- | --- |
| Component | `pnpm test:jsdom <component> --no-watch` and its relevant browser/SSR suite |
| Shared rendering or lifecycle | `pnpm test:interactions` after `pnpm docs:build` |
| Compiler or exports | `pnpm verify` (includes the packed four-peer matrix) |
| Documentation | `pnpm docs:build && pnpm docs:check` |

Before merge or release, run **`pnpm verify`**. CI runs this same command under
`xvfb-run --auto-servernum` on Linux. Native pointer lock requires a headed display;
preflight checks it before the long run.

Verification generates declarations, API reference, site and published Markdown,
stages runtime/notices, packs one candidate, and executes public types, full unit/
SSR and interaction gates, six archive-bound receipts and all four consumer peer
sets. Each stage prints its duration and log location. `verification.json` records
the candidate SHA-256 and results. External evidence lives below `RUNNER_TEMP`,
`BASEUI_VERIFY_TEMP`, or the system temporary directory's `opencode` folder.
CI retains reports/logs on success and failure.

`docs/generated/`, `docs/public/`, and package `build/` are build products, ignored
by Git. `docs:build` generates API prerequisites itself, including on Netlify.
Published Markdown is generated and included by verification. Authored source,
upstream provenance and regression fixtures remain versioned. Standalone
interaction logs go under `.artifacts/interactions/`.

## Release

From a clean checkout on a branch with an upstream:

```sh
pnpm release 0.0.5 --dry-run   # non-mutating preview, not validation
pnpm release 0.0.5 --yes
```

The command checks that the version is unpublished, prepares it, verifies it,
publishes the **exact verified tarball**, then commits only the explicit release
files and tags/pushes. `patch`, `minor`, and `major` also select the next version.

An interruption prints a release evidence directory. Resume using:

```sh
pnpm release --resume /absolute/release-evidence-directory --yes
```

Resume validates source inputs and the archive hash. Unchanged completed stages
are reused; a failed browser stage does not rebuild the candidate. Source changes
require a new candidate. Fix authentication and resume after an authentication
failure. An accepted or uncertain publication is checked in the registry, never
blindly republished; tagging/pushing continues once its integrity is visible.

Upstream parity reviews and runtime upgrades are separate maintenance work.
