# Testing debt

## WebKit focus restoration after child removal

- **Location:** `packages/solid/src/floating-ui-react/components/FloatingFocusManager.tsx`.
- The owned `MutationObserver` fallback restores focus when the previously focused child is removed and focus falls to `document.body`. It makes the four failing WebKit Dialog pointerdown-removal cases pass; upstream instead relies on its `focusout` handler.
- **Investigate:** compare native focus-event ordering and DOM-removal timing in pinned React upstream and Solid before concluding why the fallback is necessary. Missing WebKit `focusout` is a hypothesis, not a verified root cause. Check consumer-directed focus changes, close/disposal and duplicate restoration; remove or narrow the fallback if unnecessary.

## Collapsible measured-layout diagnostic — accepted

- Both demo styles pass behavior and control-identity checks. Their external layout measurement can produce `EFFECT_RELAY_TEAR`; the user accepted this as nonblocking on 2026-10-07.
- Keep the warning visible in verification evidence. Measurement experiments were reverted; no diagnostic suppression or budget changes were retained.

## Browser capability and qualification debt

- Chromium CDP gestures, constructor-based touch fixtures and pointer-lock tests need their declared capability lanes. Desktop WebKit cannot execute Chromium CDP or its unavailable `Touch` constructor; retain those exclusions explicitly rather than adding test skips.
- Number Field pointer-lock movement assertions failed while other browser lanes ran concurrently, then passed4/4 when run alone in the native-document lane. Investigate runner/OS pointer interference before attributing the intermittent movement delta to the component.
- Headless Playwright WebKit reports zero movement deltas even on a trusted hover to a different option. Autocomplete fixture replays supply explicit nonzero motion while preserving the upstream stationary-pointer guard. Investigate native Safari hover separately; this fixture is not proof of its raw movement-event behavior.
- Green runtime suites do not complete the manual source-body inventory. Outstanding family scopes remain in `test/source-parity-manual/*.json`, including large Popover, Tooltip, Number Field, Tabs, Combobox/Menu/Select, Field/Form, Drawer, NavigationMenu, OTP, Toast and Floating/helper inventories. Completed concrete mappings are recorded in each family's currentRepair section.
