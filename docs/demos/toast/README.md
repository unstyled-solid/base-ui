# Toast demo port

Source: read-only `upstream/base-ui`, commit `19511bb171f3b360b006c94cf6d07e53cb446505`.

`entry.ts` registers all eight upstream demos and eleven variants: eight CSS Modules variants and Hero, Position, and Anchored Tailwind variants. Its `upstream` and `files` fields are repository-relative paths to real files. CSS Modules are copied byte-for-byte; Tailwind class strings and inline SVG paths are preserved.

Solid 2 adaptations include native `class` and SVG attributes, setup-local counters and refs, signals, callback render composition, live manager reads, and ID-keyed `<For>` lists whose row values are accessors. ID keying preserves toast roots when the manager replaces toast objects for geometry or promise updates. Deduplication pulse classes read current toast props.

## Checks

- `rtk proxy node docs/demos/toast/convert.mjs` reproduces the source conversion.
- `rtk proxy pnpm exec tsc --noEmit -p docs/demos/toast/tsconfig.json` checks the demo graph.
- `rtk proxy node docs/demos/toast/check.mjs` mounts every variant in Chromium, checks CSS byte parity, then attempts eight focused interaction flows. The preview is a local test fixture; Tailwind utility generation belongs to the consuming docs build.

## Current qualification results

- 11/11 variants compile and mount in Chromium before toast creation.
- 8/8 CSS Modules match the pinned source byte-for-byte.
- Strict TypeScript has one external diagnostic: `docs/demos/shared/types.ts:1` imports `Component` from `@solidjs/web`, which does not export that type. No toast-owned TypeScript diagnostics remain.
- 0/8 complete interaction flows pass. Toast creation encounters `ContextNotFoundError` at `useToastRootContext` via `createToastLabelPart` / `ToastTitle` (or `ToastDescription` for Anchored). Toasts remain in starting state, without measured height; CSS places dismiss/action controls outside the viewport. Promise updates do not complete the visible flow; Anchored positioning remains transparent. The browser check fails and reports all eight flows rather than treating mounts as interaction success.
- The rejected promise branch also exposes an unhandled rejection because the actual Solid toast manager returns a rejecting promise and the source demo ignores it.

Library and shared-type repairs are outside this family's ownership. The focused checks are retained for replay after those repairs. Tailwind visual parity has not been qualified by this fixture.
