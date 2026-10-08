# Independent browser qualification

`run.mjs` starts separate React and Solid Vite hosts and separate Playwright contexts.
React imports the pristine exact-SHA checkout's **source components and frozen dependencies**;
Solid imports real family-local production components. Neither host imports the other's implementation.

```sh
# Creates/installs only the approved throwaway checkout and isolated Node 24.21.0 / pnpm 12.8.1 tools.
rtk proxy node test/qualification/react-oracle/prepare.mjs

# Independent DOM + interactions; optional positional family or --filter scenario.
rtk proxy env QUALIFICATION_REACT_CHECKOUT=/var/folders/k1/dqkw16gn09q6492v5jn1x_jc0000gn/T/opencode/bsolid-browser-react /var/folders/k1/dqkw16gn09q6492v5jn1x_jc0000gn/T/opencode/bsolid-browser-tools/node_modules/node/bin/node test/qualification/browser/run.mjs --output .cache/qualification

# Original selected React test bodies, using upstream Vitest 5 and its unmodified assertions.
rtk proxy env QUALIFICATION_REACT_CHECKOUT=/var/folders/k1/dqkw16gn09q6492v5jn1x_jc0000gn/T/opencode/bsolid-browser-react QUALIFICATION_REACT_NODE=/var/folders/k1/dqkw16gn09q6492v5jn1x_jc0000gn/T/opencode/bsolid-browser-tools/node_modules/node/bin/node node test/qualification/react-oracle/run-upstream.mjs

# Focused existing Solid browser bodies; both selectors are mandatory to prevent a broad replay.
rtk proxy node test/qualification/browser/run-retained.mjs --files packages/solid/src/button/Button.test.tsx,test/harness/BrowserRunner.browser.test.tsx --test-name 'allows hover handlers while blocking activation|native browser pointer, layout and Web Animations runner'

rtk proxy node --test test/qualification/browser/observe.test.mjs
rtk proxy node node_modules/typescript/bin/tsc --noEmit -p test/qualification/browser/tsconfig.json
rtk proxy env QUALIFICATION_REACT_CHECKOUT=/var/folders/k1/dqkw16gn09q6492v5jn1x_jc0000gn/T/opencode/bsolid-browser-react QUALIFICATION_REACT_NODE=/var/folders/k1/dqkw16gn09q6492v5jn1x_jc0000gn/T/opencode/bsolid-browser-tools/node_modules/node/bin/node node test/qualification/react-oracle/typecheck.mjs
```

Both runtime runners default to Chromium, Firefox and WebKit; `--browsers chromium`
and `--no-watch` are supported. Original-source platform restrictions stay explicit:
the trusted pointerdown-opening Dialog case executes only in Chromium/Blink.
`--solid-only` runs independent real Solid scenarios if React is unavailable, and labels
the evidence as having **no React baseline**. An unavailable baseline otherwise fails.

Checkpoints compare the whole natural body/portal/hidden-control DOM, all attributes and CSS
values, current control properties, ARIA relationships, focus, ordered callbacks/reasons/cancellation,
and native `FormData`. Generated IDs have persistent per-host tokens so regeneration is visible.
Only generated IDs and compiler comment markers are removed; attribute/declaration ordering is
canonical serialization. No hidden controls, wrappers, focus guards, empty styles, numeric CSS
differences, native event types or callbacks are discarded. Trusted native keyboard/pointer timelines
retain their original positive timestamps in raw host evidence; clock values from separate contexts
are not falsely compared as gesture-velocity assertions. No sleeps or synthetic pointer dispatch.

Failures exit nonzero and retain each host's failed state; diagnostics also fail. Evidence is local
under `.cache/qualification/` and React `.cache/upstream/`, with exact browser/tool versions, input
fingerprints and commands. Concurrent source changes invalidate the qualification summary.

**Final gate remains OPEN.** These are representative button/toggle/form/dialog/select/combobox/
tooltip comparisons, not the complete source matrix. Touch/pen, nested/shadow/iframe interactions,
collision/arrow assertions, Slider/NumberField/Drawer/ScrollArea gestures and interrupted animations
still require their assigned retained cases and independent React comparisons. Root setup owns
command integration; the lane neither changes root configuration nor repairs component/shared code.
