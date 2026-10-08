# Architecture and scope

## Baseline
- React Base UI: `https://github.com/mui/base-ui`, branch `master`, SHA `19511bb171f3b360b006c94cf6d07e53cb446505`, package version `1.8.0`. Remote HEAD and the research checkout matched when inspected.
- Research checkout: `../ref/base-ui`; its pre-existing `pnpm-lock.yaml` modification is user work. Do not reset, install into, or otherwise modify it.
- Old Solid checkout was examined only as prior art: Separator/Toggle and Dialog/Select pairs. It is not a baseline or implementation source. Its issue #5 describes beta.1 parity and missing APIs; our export inventory comes from current React instead.
- Runtime/renderer/compiler: `solid-js`, `@solidjs/web`, `@solidjs/compiler`, `@solidjs/babel-plugin` exact `2.0.0-rc.13`. Vite integration verified: `@solidjs/vite-plugin@3.0.0-next.47`; Solid testing library: `@solidjs/testing-library@1.0.0-beta.3` (`next`, not its Solid-1-oriented `latest`). Bootstrap verifies their entire peer/engine set and locks tool versions.

## Repository
```text
upstream/base-ui/             pinned, unmodified Git submodule
packages/solid/src/           one published Solid package
  <component>/               source-corresponding family directories
  internals/                 shared Solid primitives/contracts
  floating-ui-react/         mapped upstream interaction files, Solid code only
  utils/                     pure helpers and owned resources
test/                        test harness, SSR, integration, consumers
docs/                        generated static site + Solid interactive islands
scripts/upstream/            fetch/report/verify tooling
tracking/                    source/test mappings and parity records
distribution/                explicit export and dependency contracts
.beads/                      authoritative task database
```
The legacy `floating-ui-react` directory name is retained only to keep the current ticket/source map unambiguous. Its code must import no React. A coordinated directory rename is optional only after updating all ownership/source mappings together; workers must not rename it independently.

## Porting rules
Preserve behavior, DOM semantics, parts, defaults, events, data attributes, CSS variables, exported capabilities and accessibility. Preserve source-local organization where it helps comparison, not hook structure. Pure algorithms can be adapted directly with notices intact. React `Store`/`ReactStore` synchronization is re-expressed with native accessors, owned signals/stores and explicit imperative transaction data. No React compatibility runtime.

One component owns its implementation, tests, docs fragments and coverage ledger. Shared foundations own geometry, portal/focus/dismissal, events, lifecycle, forms and composite interaction. Internal button behavior has **one owner: composite**; public Button and all triggers consume it.

Solid-native API adaptations are explicit: `class`; a live `(props, state) => JSX` render callback instead of React element cloning; native DOM events; Solid ref conventions. Keep public names/subpaths where possible. Internal `createX` naming may differ while exported hook-shaped utilities receive documented compatibility aliases or a reviewed API mapping. Never silently remove an export.

## Distribution
Use module-preserving ESM DOM/server output, independent declarations and explicit subpath exports. No bundled Solid runtime. Conditional resolution, type-only exports, SSR, optional temporal adapters and tree shaking are tested from **packed tarballs in independent consumer projects**. Root imports and component imports must not pull unrelated families into optimized bundles. Preserve MIT notices. The placeholder name stays private until the actual npm identity is chosen; no assumption of ownership of `@base-ui`.

## Documentation reuse
React upstream uses Next/React-specific factories and tooling. Reuse pinned MDX prose, assets, styles, metadata, anatomy, navigation ordering and framework-neutral transformations with source manifests. Generate static routes from MDX and mount Solid 2 demo islands using the same pinned toolchain. Do not blindly copy a Next application or introduce a Solid 1 router. Generate API tables from our own declarations/JSDoc; copy source content, not React type tables. Unsupported MDX constructs fail with actionable mappings rather than disappearing.

## Completion
Initial implementation completion means every export/source scenario is accounted for, non-browser suites pass, and browser cases are explicitly queued. Release qualification additionally requires browser, accessibility, SSR/hydration, packed-consumer and docs checks. No claim of parity is based solely on passing type checks or a subset of tests.
