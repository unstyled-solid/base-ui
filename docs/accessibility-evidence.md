# Accessibility qualification evidence

**Status: blocked; no browser or assistive-technology execution claimed by this batch.**

Owned implementation: `test/qualification/accessibility/`. Independent denominator: `tracking/qualification/accessibility.json`. Beads authority: `bsolid-accessibility`. Browser execution belongs to the coordinator after archive freeze. Harness syntax, unit and fixture types are separate from qualification.

## Baseline and support claims

Behavioral source: Base UI SHA `19511bb171f3b360b006c94cf6d07e53cb446505`, upstream accessibility guidance, `DialogPopup.tsx`, `FormContext.ts`, and canonical family test suites. Solid V2 documentation was consulted through docs MCP (`solidjs`, version `2`), including testing, staged updates and ownership. Installed RC13 declarations govern available APIs: keyed `For` supplies item accessors; native `Input` uses `readonly`.

No upstream platform support claim is inherited. Upstream `test:screen-reader` runs Playwright with Guidepup, with setup/install scripts, and contains a radio-name test and Windows-only NVDA menu-filter speech regressions. This harness reuses their observable expectations and bounded navigation approach, **not React fixtures or private harness internals**. Guidepup is not a supported root dependency here; no toolchain change is made to install it. Manual AT records are therefore mandatory.

Automated scope: twelve composed scenarios covering button/native custom host, toggle/cancel, checkbox/switch, radio/group, tabs/direction/dynamic removal, accordion, form/field/fieldset/input errors, nested dialogs, combobox active descendant/removal/Gecko RTL caret, select, toast live-region markup, and progress/meter/separator. All execute against installed compiled tarball or an independent consumer in Chromium, Firefox and WebKit, with default/RTL/reduced-motion/forced-colors/CSS-layout-zoom-200 variants. Exact browser versions are collected at execution; none are asserted before execution.

DOM live text does not prove speech, an ARIA attribute does not prove an announcement, CSS zoom does not prove native zoom, and desktop WebKit does not prove iOS Safari. Physical iOS and Android rows are required and currently blocked.

## Evidence record contract

Run commands and output schema: [`test/qualification/accessibility/README.md`](../test/qualification/accessibility/README.md). Generate the blocked manual template before testing. For each row record:

- Frozen artifact SHA256, source/fixture digest and fixture URL; never mix results from repaired/unfrozen artifacts.
- Operator/date, OS **and version/build**, AT **and version**, browser **and full version**, keyboard layout and input mode.
- Real device model for iOS/Android, physical-device attestation, orientation, OS text size, display zoom, IME/keyboard and speech settings. Desktop emulation, simulator, user-agent overrides and synthetic touch cannot pass a physical row.
- Unedited audio/video or AT speech-viewer transcript with timestamps; literal expected/observed phrases, focus target, caret, duplicate/missing/canceled speech and each of three attempts. An intermittent failure cannot be hidden by retry.
- Per-family results for all 45 inventory families, with exact steps/assertions and blockers. Type-only/provider/utility families need a reviewed composed consumer or explicit source-grounded disposition; never silently omit them.

`status: pass` is permitted only after the whole row is executed. Missing fixture/platform, partial speech capture, untested family, repair not replayed, or absent hardware stays `blocked`. A reproducible failed expectation is `fail` and requires a component/foundation-owner correction ticket. Repaired regressions are replayed on the same platform/AT/browser combinations on a newly frozen archive; old artifact evidence is not reused.

## Required platforms and native commands

| Platform row | Combination to execute | Navigation / activation |
| --- | --- | --- |
| macos-voiceover-safari | Physical Mac, macOS + VoiceOver + released Safari; record versions | Enable VoiceOver with Command+F5; VO = Control+Option. VO+Shift+Down interacts with web content; VO+Right advances; VO+Space activates. Turn Quick Nav off for raw arrow/text-control tests. Use Safari's Tab setting to visit every control. |
| windows-nvda-chrome | Windows + NVDA + released Chrome | Enable NVDA; open Speech Viewer. Browse via Tab/Shift+Tab and Down; NVDA+Space switches browse/focus mode. Enter/Space activates; use focus mode for arrows/text. NVDA+F7 element list may verify names, not replace keyboard traversal. |
| windows-nvda-firefox | Windows + NVDA + released Firefox | Same NVDA modes/commands; record Firefox version independently. Test Gecko RTL Home/End with a real RTL input, not platform mocking. |
| ios-voiceover-safari | **Physical iPhone/iPad**, iOS/iPadOS + VoiceOver + Safari | Enable VoiceOver in Settings → Accessibility. Swipe right/left advances/returns; double-tap activates; rotor selects form controls/characters. Use an attached hardware keyboard for raw Tab/arrow/Escape protocol, then repeat touch separately. Record software keyboard appearing/not appearing. |
| android-talkback-chrome | **Physical Android phone/tablet**, Android + TalkBack + Chrome | Enable TalkBack in Settings → Accessibility. Swipe right/left advances/returns; double-tap activates; use reading controls for characters. Use hardware keyboard for Tab/arrows/Escape, then repeat touch with the installed IME. Record composition updates and keyboard behavior. |

Do not invent version numbers: record installed values before execution. Released Safari and physical browser versions are independent of Playwright WebKit's build version. Start manual host with `run.mjs --freeze SHA --serve 4317` and use its LAN address on hardware.

## Seven exact protocols (each platform, all-family accounting)

### 1. `family-keyboard-aria`

Open each inventory family's composed fixture with no pointer input. Begin at “Before fixture”, then Tab/Shift+Tab through the host. Use the platform's AT next/activate commands separately from raw keyboard activation. Record accessible name/role/description, required/invalid/checked/selected/pressed/expanded/value announcements and focus target before/after every change. Use the family-specific obligation in the inventory:

- Buttons/toggles: Enter and Space down/up; verify a single activation, pressed announcement, canceled change refusal and disabled versus focusable-disabled behavior.
- Checkbox/switch/radio: Space down then up, mixed/checked/required announcements, radio Enter refusal and arrow selection. Readonly remains operable for focus but refuses edits; disabled behavior matches source. Check group/fieldset labels and hidden-input form values.
- Tabs/toolbar/toggle-group/radio-group/menubar: Tab entry, both arrows, Home/End where supported, orientation/RTL, disabled focus versus selection, one roving tab stop and removal. Match actual source, not a generic assumption that every disabled item is skipped.
- Menus/context-menu/navigation-menu/select: open using canonical trigger key or Shift+F10 for context menu; traverse/typeahead, activate submenu, Escape one layer, restore exact trigger. Check item roles, filter inputs and selection announcements.
- Text/number/OTP/combobox/autocomplete: name/description, edit/paste/backspace, Home/End/caret, keyboard selection, active descendant, limits and validation. Check IME on physical Android; preserve original focused host and selection across updates.
- Dialog/alert-dialog/drawer/popover/preview-card/tooltip: open by keyboard/focus, inspect announced title/description and background isolation, Tab/Shift+Tab, Escape, final focus. Tooltip expectations follow source description behavior; do not require an invented `role=tooltip`.
- Accordion/collapsible: Space/Enter toggle, announce expanded/collapsed, resolve trigger/panel IDs and confirm closed content cannot be browsed; disabled triggers follow source.
- Avatar/ranges/separator/scroll area: alt/fallback, value/text/min/max/indeterminate and orientation, no inappropriate passive tab stops; keyboard-scroll the viewport and inspect RTL scrollbar semantics.
- Form/field/fieldset/input, toast, providers/render/merge/media utilities: execute the appropriate composed protocols below and record every underlying outcome. A provider or utility has no standalone interactive role.

Repeat with disabled/readOnly/required-invalid states exposed by each family's actual API. A missing state/fixture is an explicit blocked facet. The twelve existing automated fixtures cover only their listed subset; remaining family fixture work is open.

### 2. `nested-modal-touch`

Open `?scenario=dialog&environment=default`. Tab to “Open account”, Enter; verify “Account settings” and “Edit account settings” are announced and “Account name” receives keyboard initial focus. Tab and Shift+Tab through all controls twice; background “Before/After fixture” must be unreachable. Open “Open confirmation”; verify inner name/description and focus, and that outer content is unavailable to AT while inner is modal. Escape once: inner closes, exact inner trigger restored, outer remains open. Escape again: outer closes, original outer trigger restored.

On physical mobile, disable AT for the first raw-touch trial: tap outer trigger; default focus is the popup, **not the input**, and virtual keyboard does not spuriously open. Re-enable AT and repeat with swipe/double-tap; record actual interaction/focus and speech separately, because AT activation is not necessarily the same pointer type as raw touch. Repeat nested drawer/popover/alert-dialog fixtures when implemented; missing fixtures block those family rows.

### 3. `form-errors`

Open `?scenario=form&environment=default`. Read “Account”, “Custom name”, “Enter ok”, “Required name”, readonly and disabled fields. Tab to Submit and Enter with custom value `bad` and required value empty. Submission must be blocked, original custom control focused/selected, and “Use ok” associated/announced; required-invalid state must also be available. Type `ok`, submit again: first required control receives focus and its error is announced. Fill required value and submit: only one accepted submission. Record caret and node identity across each change. Replay reordered fields and portal/shadow-root first-invalid cases when their composed fixtures exist; current absence blocks those source outcomes.

### 4. `composite-removal`

Open `?scenario=combobox&environment=default`. Tab to “Choose fruit”, ArrowDown to open, then highlight banana. Verify focus stays in the original input, highlighted option is announced, and active descendant references that option. Remove highlighted banana via the same fixture's controlled item update while input stays focused; record the fallback/cleared descendant and speech, with no dangling ID. Select remaining item, Escape, and check input value/caret. Repeat with RTL in Firefox; Home places caret at value length and End at zero per canonical Gecko RTL case. Repeat tabs using arrows to Details, disabled Unavailable (focusable but not selectable), dynamic removal, End/Enter History. Dynamic-removal updates are currently automated test-driver hooks; manual family hosts need an exposed state-update control/script and must record that action explicitly. No pointer/focus helper counts as keyboard reachability.

For Android, enter composing text with the real IME while suggestions are open; verify each composition edit propagates without losing caret/host or dismissing the keyboard. Do not substitute the upstream android platform mock for real hardware.

### 5. `toast-announcements`

Open `?scenario=toast&environment=default`. Keep focus on Notify; Enter, verify “Saved / Changes saved” is spoken once politely and focus stays on the trigger. Tab to Alert; Enter, verify “Failed / Try again” is announced assertively once, without duplicate speech from the hidden toast plus alert copy. Repeat both additions/updates three times using distinct IDs in the full manual fixture; preserve the entire speech log (current core fixture only supplies one low/high addition). F6 enters the Notifications viewport, Shift+Tab returns to prior control, Tab reaches notification action/close controls, Escape dismisses focused toast and restores sensible source-defined focus. Verify timeout pause on keyboard focus and physical touch, then resume. Each unsupported update/timer/action fixture remains blocked. Live-region DOM text alone cannot pass this protocol.

### 6. `menu-filter-announcements`

Canonical source: `upstream/base-ui/test/screen-reader/menu-filter.spec.ts`. **Current local filter/submenu AT fixture is not implemented; keep blocked.** On Windows NVDA, after implementing the actual packed-component fixture, open “Actions” using Enter and separately AT activation, **three attempts each, no retries masking failure**. Focus must be “Filter actions” searchbox with New file active descendant. Capture a quiet speech interval: it must announce New file; later “Actions, menu” must not cancel it. ArrowUp clears descendant and announces Filter actions edit/search; another ArrowUp announces Keep available offline; ArrowDown returns to input. Type Save, ArrowDown, hear Save; Escape returns Actions trigger.

Submenu: reopen, type Move, ArrowDown, ArrowRight. Focus Filter folders; hear Desktop without a later Move to folder menu announcement canceling it. ArrowUp clears descendant and announces Filter folders; type Projects, ArrowDown hears Projects; Escape restores Filter actions. Repeat RTL using canonical reversed submenu direction. Other AT/browser platforms record their actual speech rather than copy NVDA output.

### 7. `visual-settings`

Use OS reduced-motion setting and OS forced/high-contrast setting, separately; record exact setting and actual `matchMedia` result. Traverse/open each family fixture with keyboard. Focus indicator, popup content and selected/disabled states remain visible; reduced motion does not delay focus restore or leave inaccessible exiting content. Capture screenshots of initial/open/nested/error/selected states. Contrast of a future consumer theme requires that theme's separate evidence.

Desktop: use native browser zoom control to **200%**, then **400%**, record browser's actual zoom display and viewport, and replay keyboard/open/error/dismiss paths. Text/controls remain reachable without clipping or hidden focus. Mobile: portrait/landscape, OS larger text and native pinch zoom; replay touch/AT opening and focus. CSS `zoom:2`, deviceScaleFactor and desktop viewport emulation do not satisfy these native rows. Native zoom and physical keyboard/IME behavior remain unexecuted.

## Current acceptance and actual gaps

- Inventory initially accounts for **45 families, 405 family/facet rows, 6,127 canonical registration sites**, a known literal-instance subtotal of **6,384**, and **220 unresolved dynamic/generated expansions**. These counts include conservative non-a11y source cases; the literal subtotal is not a full expanded-case denominator. Source file hashes and call-site/domain records are retained; file-level platform skip directives are restrictions, not test cases. Refresh the owned inventory if canonical inputs change.
- All 180 automated browser/environment rows are unexecuted here. Twelve fixture contracts are authored and typechecked; no browser versions, snapshots or behavior passes have been invented.
- Full family/source assertion mappings and remaining family fixtures are incomplete, including menu/filter/submenu announcements, aliases such as drawer/alert-dialog/autocomplete, broad number/OTP/slider/touch coverage, generated conformance expansion, and portal/reordered-form cases.
- All 35 manual platform/protocol rows are blocked, including required physical iOS/Android rows. Native zoom, actual speech, real IME, physical touch default focus and consumer-theme contrast have no executed evidence.

Release acceptance requires source/facet evidence plus the automated/AT/device results to join green on the same frozen artifact. A passing core scenario never closes the full denominator. `bsolid-accessibility` remains open pending those execution/mapping blockers.
