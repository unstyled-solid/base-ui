# Solid 2 RC13 test harness

## Exhaustive composition qualification (stable 2.0.3)

`scripts/test/composition-inventory.mjs --check` verifies the checked-in runtime
export inventory: 206 render-bearing signatures, 250 public export spellings.
Erased type exports and imperative render helpers are not component hosts.
`compositionInventory.ssr` checks aliases, deterministic markup, and five extra
reads of every scalar prop (excluding executable JSX children). Per-key owner
counter probes reject allocations; a deliberately allocating getter is a negative
control. `compositionInventory.hydration` uses independently compiled SSR, captures
the first native ref claim, and checks live updates and retained interaction hosts.

Portal descendants intentionally mount on the client. NavigationMenu Content's
upstream inline crawler fallback hydrates first, then remounts in its viewport
portal; its Content/Link tests assert both phases rather than requiring identity
across this intentional replacement. The scrub cursor executes in chromium-native
with real pointer lock. All other inventory cases execute in Chromium.

The test-only Vite transform instruments pinned `nextChildIdFor`/`childId` calls,
observing owner/counter positions and stacks without changing counters or installed
packages. Independent server traces travel in escaped JSON; capture restores the
previous observer and stack limit. Button requires exact allocation sequence
equality. Other fixtures retain first-divergence stack evidence while asserting
actual hydration claims: intentional client-only allocations are not server slots.
The SSR negative controls test slot sensitivity, first divergence, and capture
restoration. `pnpm test:interactions --full-unit` explicitly executes inventory
freshness, exhaustive SSR/browser, and the native cursor stages.

Run from the repository root; family tests import `#test-utils` (Vitest alias), or a
relative `packages/solid/test` path. Import the family-local implementation, not a
future root barrel. All shell commands use RTK.

```sh
rtk pnpm test:jsdom Harness --no-watch
rtk pnpm test:jsdom Separator --no-watch
rtk pnpm test:ssr --no-watch
rtk pnpm test:types --no-watch
rtk pnpm test:contracts --no-watch
# Direct equivalent entrypoints:
rtk proxy node scripts/test/run.mjs jsdom Harness --no-watch
rtk proxy node scripts/test/run.mjs types --no-watch
rtk proxy node scripts/test/negative-probes.mjs
```

The runner is one-shot, removes `--no-watch`, forwards other arguments, and fails on
unmatched filters. `types` forwards TypeScript flags (for example `--pretty false`),
not filename filters. `contracts` runs strict types, bootstrap identity/compiler
checks, DOM, separate server tests and deliberate failing subprocess probes; use
that command without filename filters. Browser commands remain owned by bsolid-browser.

## Owned factories and live props

```tsx
const { render, renderProps } = createRenderer();
const view = await render(() => <FamilyLocalComponent />);
await view.user.click(view.getByRole('button'));

const host = await renderProps(
  (props: { label: string }) => <FamilyLocalComponent label={props.label} />,
  { label: 'before' },
);
const node = host.getByRole('button');
await host.setProps({ label: 'after' });
expect(host.getByRole('button')).toBe(node);
expect(node).toHaveAccessibleName('after');
host.unmount(); // optional early disposal; every mount is cleaned after the test
```

No React `act`, element cloning, `rerender` or setup re-execution. `renderProps`
passes a shallow live proxy and stages partial updates; values stay raw, getter
receivers stay with their original object, and explicit undefined overrides old
values. Allocate signals/effects inside the render factory. Family fixtures may
alternatively expose their own native setters. Use `flush()` only for intentional
synchronous observations; it does not await IO, promises, held updates or animations.

`render` uses testing-library beta.3 and native user-event. `onInput` tests per-key
input. Event assertions capture `currentTarget` during dispatch. `firePointer`
requires a positive finite timestamp. `advanceTimers`, `advanceFrame` and
`flushMicrotasks` distinguish their queues; pending fake timers fail teardown.
`waitForAnimations` uses real Web Animations promises and rejects unsupported DOMs.

## Diagnostics and lifetime gates

Setup installs RC13 `DEV.hooks.onOwner` and verifies `isDisposed(owner)` after
cleanup, including detached roots not associated with a DOM node. It subscribes to
`OBSERVE.diagnostics` and captures console warn/error without hiding their output.
Warnings/errors emitted during module evaluation, tests and disposal fail. No
blanket warning filters, mocked disposal counters or disabled strict-read checks.

An intentionally diagnostic test must use an exact-count, local expectation:

```ts
await expectDiagnostic(
  { code: 'STRICT_READ_UNTRACKED', message: /STRICT_READ_UNTRACKED/ },
  () => readOutsideTrackingForThisSpecificTest(),
);
```

Do not replace console spies or configure Solid diagnostics off. Tests in one file
are sequential because they share the document and diagnostic scope. Ref callback
returns do not dispose in RC13: resources must be setup-owned with split effects
or `onSettled` returning cleanup.

## Conformance adapters

`describeConformance(factory, { initialProps, refInstanceof, state?, ... })` checks
default/custom prop forwarding, class string/array/object/state callbacks, styles,
native refs, render wrapper composition, live callbacks, native prevention/order,
and same-host identity. `state` provides `change`, `assert`, `class`, `before`,
`after` for a family's meaningful state transition. Element-cloning source cases
become callback composition with native ref arrays and `class`; no React element API.

`popupConformanceTests({ createComponent, triggerMouseAction, expectedPopupRole,
expectedAriaHasPopupValue?, alwaysMounted?, combobox?, browserIssue })` receives
live `root/trigger/popup/portal` props. Spread/read them reactively. Checks controlled
and uncontrolled state, callbacks, accessibility relationships, and queues both
animation bodies for real browsers (including the upstream unconditional skip).
`createTestInteractions(() => interactions)` composes test-only interaction props
in source order; it is not a replacement production interaction engine.

## SSR / hydration

All hydration console warnings/errors are fatal through the shared diagnostics
harness, including warnings without a structured Solid diagnostic code. An
intentional mismatch test can use `expectDiagnostic({ message, count }, run)` with
an exact local expectation; ordinary hydration fixtures must not opt out. The
`hydration` negative probe verifies that an unapproved key-miss warning fails.

`ssr-fixture.mjs` compiles a production SSR entry with Vite and executes it in a
fresh Node process. Only serialized HTML crosses to jsdom. The client hydrates the
same fixture with independent client compilation: IDs, label relationships, original
node identity, two roots, native input and disposal are asserted. Server tests also
check separate render namespaces and overlapping streaming requests. Production
browser hydration, real CSS/focus/selection and streaming suspense races belong to
the explicit final qualification issue recorded in `tracking/harness.json`.

## Source cases and browser inventory

```ts
sourceCase({ source: 'packages/react/src/separator/Separator.test.tsx',
  case: 'orientation[vertical]', environment: 'jsdom',
  adaptation: 'live props instead of React rerender' }, async () => { /* assertions */ });

browserCase({ source: 'packages/react/test/popupConformanceTests.tsx',
  case: 'exit animation', environment: 'browser', issue: 'family-followup-id' },
  async () => { /* executable browser assertions, not an empty placeholder */ });
```

`browserCase` skips only in jsdom and includes the issue/source in the reported test
name. Record parameter values, generated conformance cases and upstream skipped/todo
cases in the family ledger; an executed harness fixture does not establish family
parity. Browser setup supplies `resetBrowserPointer` a real `unhover` driver.
Temporal adapter semantic suites belong to the temporal lane rather than this
framework runner; their source index entry is retained in the mapping ledger.
