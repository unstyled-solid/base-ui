# Continuous integration

GitHub Actions runs **CI / Build and test** on every pull request and push to
`main`. Pushes to `ci/**` branches also run it so workflow changes can be checked
before opening a PR. Manual runs are available after the workflow reaches `main`.

The workflow uses a standard `ubuntu-latest` runner, the exact Node and pnpm
versions from `package.json`, frozen dependencies, and the pinned upstream
submodules. Only the pnpm download store is cached—not test results or builds.
Chromium and its Ubuntu dependencies are installed with the project's Playwright.
RTK is installed from a checksum-verified release because existing scripts use it.

Checks run once, in order:

1. Build the distributable package, including declarations and notices.
2. Build the documentation from source, rather than checking stale build output.
3. Check public TypeScript contract fixtures.
4. Run `pnpm test:interactions --full-unit`: repository typechecking, demo catalog,
   built-docs checks, the full jsdom and SSR suites, the existing targeted Chromium
   interaction/hydration gate, and all docs gesture scenarios. The browser gate
   also includes the checkbox, popover retained-exit, and field teardown regressions.

This is a PR regression gate, not the exhaustive multi-browser release
qualification or packed-consumer matrix. Development diagnostics remain enabled;
there are no automatic test retries or failure exclusions. Runner `skipped`
counts include lane routing and platform exclusions and are not a count of
untested cases.

Reproduce the same checks locally after installing the pinned toolchain and RTK:

```sh
pnpm install --frozen-lockfile
pnpm exec playwright install --with-deps chromium
pnpm build:package
pnpm docs:build
pnpm test:types
pnpm test:interactions --full-unit
```

Normal runs upload no artifacts. Failures retain only gate logs and JSON
diagnostics for three days; no videos, browser caches, or built sites are uploaded.
The workflow needs only read access to repository contents and no project secrets,
including for fork pull requests. New runs cancel older runs for the same PR/ref.
