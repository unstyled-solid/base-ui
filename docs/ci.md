# Continuous integration

GitHub Actions runs `pnpm verify` on pull requests and pushes to `main`, using the
pinned toolchain, frozen dependencies and upstream submodule. Headed Chromium
runs under Xvfb; pointer-lock preflight fails early if that capability is absent.

The same command runs locally. See [checks and releases](maintaining.md) for
setup, focused development checks, generated artifacts and release recovery.

CI uploads stage logs and JSON reports on success and failure for three days.
Only the pnpm download store is cached. New runs cancel older runs for the same
PR/ref. The workflow requires read-only repository access and no secrets.

Runner `skipped` counts include lane routing and platform exclusions; they are
not a count of untested cases. Verification retains the existing assertion and
diagnostic policies.
