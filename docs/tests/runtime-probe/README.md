# RC13 attribution ownership regression

**Update:** The user-authorized pnpm patch is applied in
`docs/patches/@solidjs__signals@2.0.0-rc.13.patch`. All 8 focused regressions pass,
including ordinary object/array diagnostic emission. The developer confirmed
Avatar, Tabs, and Accordion work on a fresh server at localhost:5174. Details and
upstream PR guidance: `solidjs-rc13-issue.md` at the repository root.

**Original unpatched outcome:** previews were blocked by a Solid RC13 dependency defect. The docs
registry and preview host are not required to reproduce it. The Babel compiler
is not the cause: the same verified Vitest configuration fails when attribution
is enabled explicitly.

## Exact cause

1. `@solidjs/vite-plugin@3.0.0-next.47` enables Chrome performance tracks by
   default for dev HTML (`dist/esm/index.mjs:5346–5351`). Its injected
   `virtual:solid-performance-tracks` calls `enablePerformanceTracks({})`.
2. `@solidjs/web@2.0.0-rc.13/performance-tracks` calls
   `attribution.enable({ log: false, ...options.attribution })`
   (`performance-tracks/dist/performance-tracks.dev.js:31–34`).
3. `@solidjs/signals@2.0.0-rc.13/dist/dev.attribution.js:844–858`,
   `shallowEquivalent`, compares objects using `a[key] !== b[key]`.
4. `checkUnstableOutput` invokes that comparison from `recomputeEnd`
   (`dev.attribution.js:868–878`; `dev-shared.js:5338–5346`). The memo's compute
   owner is no longer active. Reading a lazy JSX `children` getter here runs
   component setup without its provider context. The diagnostic itself throws
   and interrupts the flush, before the intended interaction can commit.

Actual Base UI path:

```text
recomputeEnd -> checkUnstableOutput -> shallowEquivalent
  -> mergeProps Proxy.get("children") -> source children getter
  -> AvatarImage / TabsList / AccordionItem / NumberFieldScrubArea / ToastTitle
  -> useContext -> ContextNotFoundError
```

Direct Avatar and Tabs renders fail without `mountDemo`, the registry, styling
switches, or an error boundary. `context.tsx` reduces the defect further to a
plain memo record containing a lazy JSX getter, with **no Base UI imports**.
The minimal case throws `NoOwnerError`; the real components create their own
component owner, then throw `ContextNotFoundError` because that owner has no
provider ancestor.

The served optimizer metadata resolves one RC13 development `solid-js` and one
matching `@solidjs/web`. Inspected transformed library/demo imports share those
same optimized modules. No mixed Solid version or owner-runtime duplication
was found.

## Reproduce from the repository root

```sh
rtk proxy pnpm exec vitest run --config docs/tests/runtime-probe/vitest.config.ts
rtk proxy node docs/scripts/site/runtime-probe.mjs
```

The browser command requires the existing docs dev server at
`http://127.0.0.1:5173` (override with `DOCS_TEST_URL`). It reuses the worker's
`agent-browser --session docs-runtime --color-scheme dark` browser.

## Actual checks

- Existing `AvatarImage.test.tsx`: **41/41 passed**, with verified Babel harness.
- Minimal memo/getter baseline: **passed**.
- Identical minimal case with `attribution.enable()`: **failed**, directly at
  `shallowEquivalent`. The regression test intentionally remains red.
- Live CSS Modules and Tailwind variants: Avatar/Tabs fail on mount;
  Accordion/Number Field fail after click; Toast creation fails before the
  dismiss button becomes usable. **All 10 checks remain red.**
- Full stacks, preview DOM, and runtime-resolution metadata:
  `docs/tests/runtime-probe/browser-evidence.json`.

## Ownership handoff

Cause and root dependency seam request are posted to **bsolid-docs-complete.1**.
The framework/dependency owner needs a comparator correction that avoids
executing accessors/JSX-producing proxy properties during diagnostic inspection,
while retaining development diagnostics and RC13 renderer ownership. No host
configuration change can repair that comparator within this worker's ownership
and the no-suppression constraint.
