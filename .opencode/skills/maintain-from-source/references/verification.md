# Delta verification and evidence that can survive a weekly update

Read when choosing checks, interpreting a browser failure, rebuilding artifacts, or accepting a completed episode. A test count is not a source mapping or a future guarantee.

## Select checks by changed invariant

| Change | Minimum meaningful evidence to start |
|---|---|
| Pure helper/default | Source-derived vectors/undefined/null behavior; related types |
| Controlled state/callback/cancel | Accepted/rejected/canceled requests, same-turn transactions, current callback; real consumer |
| Native input/form | Attributes AND properties/defaults/caret/FormData/reset/autofill/native validation; actual browser timing |
| Refs/providers/children | Same hosts/descendants/context, replacement/removal/disposal; two affected consumers |
| Event/focus/dismiss/portal | Actual native order/identity, nested root/layer, Tab/return/outside/Escape; appropriate browser |
| Geometry/observers/CSS | Real measurements/resize/scroll/zoom/RTL, stale generation and teardown, retained exit |
| Animation/viewport payload | Native WAAPI readiness/cancellation, late content, previous snapshot/inertness, interrupted reopen |
| SSR/hydration/native ID | Independent server compilation, original nodes/IDs, multiple renderIds/requests, no server writes or leaked owners |
| Public API/export/build | Strict real consumers, regenerated declaration/runtime outputs, supported conditions, production smoke/archive |
| Docs/demo | Source-byte/semantic provenance, same executed/displayed example, real route/preview/source interactions and cleanup |

Start with the old failure/new source assertion. Verify the harness can detect it when practical; don't write a regression that mirrors an implementation but misses its observable outcome.

## Preserve tests as source, not as a summary

Load the user-level `react-to-solid-v2-port` skill and its `testing` reference. For new/re-ported scopes, copy the original test files and relevant helpers literally before adapting them. For a delta, retain existing translated cases and port the changed/new source bodies individually.

Keep suite/case correspondence, parameterization, interaction sequences, fixture composition, assertions and generated conformance obligations recognizable. Necessary React rendering/events/refs/ownership adaptations must not silently change what is asserted. Do not merge independent source scenarios into one broad locally invented case or replace real Field/Form/component integration with an internal core fixture. Additional core/ownership tests are useful supplements, not substitutes.

If a framework-only case cannot apply directly, state its exact source body and the justified native equivalent or exclusion. Test-name/source comments and aggregate passing counts do not establish one-to-one assertion preservation. Do not claim a near-literal migration when algorithms/structure were substantially reconstructed; report source correspondence and behavioral evidence separately.

## Widen once, after coherent fixes

1. Focused repro and related source cases.
2. Strict source/consumer types and affected real integration.
3. Required native browser/SSR/hydration/production path.
4. Once writers stop, applicable combined tests and independent oracle.
5. Rebuild relevant artifacts/docs and verify the generated consumers.

Do not run three equivalent whole-suite gates repeatedly while shared files change. A passing isolated mock/test-only context does not substitute for the real affected components.

Current command discovery is root `package.json` and `test/harness/README.md`. Common entrypoints:

```sh
rtk pnpm typescript
rtk pnpm test:types --no-watch
rtk pnpm test:jsdom <filter> --no-watch
rtk pnpm test:ssr <filter> --no-watch
rtk pnpm test:chromium <filter> --no-watch
rtk proxy env HARNESS_BROWSERS=chromium,firefox,webkit pnpm test:browsers <filter> --no-watch
rtk pnpm test:chromium:native NumberField.browser --no-watch
rtk pnpm test:browser-batch chromium --shards=4 --dry-run --reporter=dot
rtk proxy node scripts/test/negative-probes.mjs
rtk proxy node --test scripts/test/runner.test.mjs
rtk git diff --check
```

Use actual filter/file/test-name support; unmatched filters fail. `.browser.test` selects explicit files but misses `browserCase` bodies inside ordinary test suites. Type-only `.spec.tsx` must be strictly compiled, not executed as fake runtime tests.

## Source-runtime isolation

The port and upstream React have separate compatible toolchains. The initial upstream sigstore dependency rejected Node25; isolated Node24/pnpm12 enabled genuine pinned React tests. Discover current required engines and recorded oracle tools, not historical temporary paths. Never install into the canonical/read-only checkout or relax engines to manufacture a baseline.

Read `test/qualification/browser/README.md` and `test/qualification/react-oracle/` before original-source or differential execution. Qualification fixtures and their oracle selectors were initially pinned; **a weekly candidate needs its own exact-SHA oracle selection**, not successful assertions against the old checkout. Use existing tooling if it supports the episode; adapt that input under one owner when necessary. Do not invent CLI flags or keep the old comparison SHA while claiming new-source parity.

Representative independent comparisons do not cover the entire source matrix. Preserve source platform skips/todos, parameter/conformance expansion and eligible type scenarios. `test:coverage-map` checks map integrity, not runtime cardinality/parity. Changes to test parameters or source blobs invalidate old case evidence.

Before/after input fingerprints must match for a final comparison. HMR during execution can diagnose useful mismatches but invalidates its final-baseline status. Finish disjoint code work, freeze writers, and rerun once; do not loop qualification against continuously changing source.

## Native browser fixtures: proven traps

- CDP held mouse moves need correct `button:'left'` and `buttons:1`; release is `buttons:0`. Wrong packets caused Drawer/Slider capture loss without a production release call. Preserve trusted got/lost-capture, original host, timestamps and exactly-once completion.
- Coordinate packets are top-level widget/screen coordinates. Account for tester iframe offset/scaling; do not broaden gesture assertions to compensate for a miscalibrated fixture.
- Native pointer lock needs the foreground/headed supported document. Promise fulfillment can precede `pointerlockchange`; wait for actual acquisition, assert native movement and release. Do not mock a successful grant.
- CSS margins can trigger scroll anchoring/collapse on focus. PreviewCard inline positioning once appeared off by150px because its fixture scrolled. Check actual rect/scroll invariants before accusing middleware.
- Mocked scrollHeight is not real native scrollable space. Drawer keyboard fixtures require physical overflow for native scrollTop behavior. Desktop viewport simulation is not an actual iOS software keyboard/picker qualification.
- Native animations can be canceled/replaced by legitimate entry/measurement choreography. Wait for the actual started epoch/native readiness; retain previous-content and completion assertions rather than blindly finishing a pre-start snapshot.
- A browser hook passing TestContext into an optional driver argument can fail before any test body; wrap hooks appropriately (`resetBrowserPointer` was one example).
- ResizeObserver-loop errors can be genuine feedback. Source-faithful setup-owned RAF coalescing and cleanup solved ScrollArea loops; globally ignoring the diagnostic is not a fix.
- Multiple portal DOMs after earlier tests can be a disposal/ownership cascade. Find the first causal halt/leak rather than rewriting every subsequent query.

## Actual SSR and hydration

Read current `scripts/test/fixture-server.ts`, `test/harness/` and native web declarations. Existing helpers:

```text
fetchSSRFixture({ module, exportName, renderId, props, mode })
mountSSRFixtureHTML(html) -> { root, restoreHydration }
hydrateSSRFixture(Fixture, clientProps, root, renderId)
prepareNativeDocument()
```

These use independently compiled actual fixtures and fresh server execution. Preserve native bootstrap/value/assets; capture scripts before moving their root, adopt DOM before active-realm assertions, use matching explicit renderIds, and restore globals only after native work/disposal settles.

Never substitute handcrafted server HTML, forged namespaces/maps, manually rewritten keys, fake cached-image completeness, or imperative refocusing to hide original-node movement.

Check default native hosts, not only compiler controls. Client-only omission of a native registration can still consume a server ownership slot (`onSettled`); inconsistent dynamic-spread allocations broke production hydration despite passing development probes. Assert server purity, original nodes/IDs and first real paints, plus multiple-root/request isolation.

## Honest classification and final evidence

- Separate assertion failures, unexpected diagnostics, unhandled errors, unfinished modules, worker exits, stale artifacts and missing infrastructure.
- Inventory/export-map/fixture passes must not inflate behavioral counts. Do not add overlapping suite counts into a fictitious total.
- Expected warnings are precise local expectations, not global filters. The owner/diagnostic/timer harness must keep failing unexpected results; negative probes verify this.
- Native form properties, serialized attributes, style absence versus `style=""`, guard/ownership-span DOM and callback native event types are part of comparison. Normalize only documented generated IDs/framework markers, not behavioral differences.
- ATTW's unsupported node16-CJS/node10 pairs were classified against the explicit ESM-only contract. Do not blanket-ignore `NoResolution`; supported Bundler/ESM errors remain failures.
- Terminal Vite analysis warnings and browser runtime warnings are distinct. An RC13-generated `import(entryUrl)` analysis warning was not repaired by suppressing logs or editing cache output. Record what passed and what warning remained.
- Browser engine installation/smoke is not component qualification. Chromium is not Firefox/WebKit, real iOS keyboard, or assistive-technology evidence.

Keep minimum reproducible evidence for this exact episode: source range/report hash, target fingerprint, affected scenarios, actual commands/results, tool/runtime/browser versions and artifact hashes when relevant. Preserve known unrelated gaps rather than silently shrinking acceptance. Existing issue descriptions may be stale after repair; attach corrected current evidence.

Final verification is not publishing, not a claim of zero future bugs, and not a reason to advance state without the legitimate source-local verifier contract.
