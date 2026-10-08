export const sourceSha = '19511bb171f3b360b006c94cf6d07e53cb446505';
export const browsers = ['chromium', 'firefox', 'webkit'];
export const environments = ['default', 'rtl', 'reduced-motion', 'forced-colors', 'layout-zoom-200'];
export const facets = ['names-descriptions', 'keyboard', 'composed-state', 'required-invalid',
  'disabled-readOnly', 'rtl', 'reduced-motion', 'forced-colors', 'zoom'];

// These are bounded executable contracts, never replacements for the source denominator.
export const scenarios = [
  { id: 'button', families: ['button'], contract: 'Native and custom render button Enter/Space; disabled exclusion; stable host.' },
  { id: 'toggle', families: ['toggle'], contract: 'Space toggles aria-pressed; canceled change and disabled refuse mutation.' },
  { id: 'checks', families: ['checkbox', 'switch'], contract: 'Named checked/required controls, Space; disabled/readOnly refuse change.' },
  { id: 'radio', families: ['radio', 'radio-group'], contract: 'Named group/options; arrows select, Space keyup, Enter does not select; disabled/readOnly.' },
  { id: 'tabs', families: ['tabs', 'direction-provider'], contract: 'RTL arrows, focusable disabled tab without selection, panel relationships; dynamic highlighted removal.' },
  { id: 'accordion', families: ['accordion'], contract: 'Space expand/collapse, controls/panel linkage, disabled native trigger skipped.' },
  { id: 'form', families: ['form', 'field', 'fieldset', 'input'], contract: 'Label/description, required/custom errors, first invalid focus, caret and stable input identity.' },
  { id: 'dialog', families: ['dialog'], contract: 'Keyboard initial focus, modal trap, title/description, inner Escape restores inner trigger then outer trigger.' },
  { id: 'combobox', families: ['combobox'], contract: 'Input/listbox relations, active descendant, dynamic item removal, Escape; actual Gecko RTL caret.' },
  { id: 'select', families: ['select'], contract: 'Keyboard open, listbox/options, select via arrows/Enter, Escape restores trigger.' },
  { id: 'toast', families: ['toast'], contract: 'Polite/assertive live text, title/description relations, keyboard dismiss; DOM is not speech proof.' },
  { id: 'ranges', families: ['progress', 'meter', 'separator'], contract: 'Named progressbar/meter range values and separator orientation; static semantics.' },
];
const canonical = {
  button: ['button/Button.test.tsx'],
  toggle: ['toggle/Toggle.test.tsx'],
  checks: ['checkbox/root/CheckboxRoot.test.tsx', 'switch/root/SwitchRoot.test.tsx'],
  radio: ['radio-group/RadioGroup.test.tsx', 'radio/root/RadioRoot.test.tsx', 'test/screen-reader/radio.spec.ts'],
  tabs: ['tabs/list/TabsList.test.tsx', 'tabs/tab/TabsTab.test.tsx', 'tabs/panel/TabsPanel.test.tsx'],
  accordion: ['accordion/trigger/AccordionTrigger.test.tsx', 'accordion/root/AccordionRoot.test.tsx'],
  form: ['form/Form.test.tsx', 'field/control/FieldControl.test.tsx', 'field/description/FieldDescription.test.tsx', 'field/error/FieldError.test.tsx'],
  dialog: ['dialog/popup/DialogPopup.test.tsx', 'dialog/root/DialogRoot.test.tsx', 'dialog/title/DialogTitle.test.tsx', 'dialog/description/DialogDescription.test.tsx'],
  combobox: ['combobox/input/ComboboxInput.test.tsx', 'combobox/input/ComboboxInput.gecko.test.tsx', 'combobox/root/ComboboxRoot.test.tsx'],
  select: ['select/trigger/SelectTrigger.test.tsx', 'select/root/SelectRoot.test.tsx', 'select/popup/SelectPopup.test.tsx'],
  toast: ['toast/root/ToastRoot.test.tsx', 'toast/viewport/ToastViewport.test.tsx'],
  ranges: ['progress/root/ProgressRoot.test.tsx', 'meter/root/MeterRoot.test.tsx', 'separator/Separator.test.tsx'],
};
for (const scenario of scenarios) scenario.sourceTests = canonical[scenario.id].map((path) => path.startsWith('test/') ? path : `packages/react/src/${path}`);
export const manualPlatforms = [
  { id: 'macos-voiceover-safari', os: 'macOS', at: 'VoiceOver', browser: 'Safari', physical: false },
  { id: 'windows-nvda-chrome', os: 'Windows', at: 'NVDA', browser: 'Chrome', physical: false },
  { id: 'windows-nvda-firefox', os: 'Windows', at: 'NVDA', browser: 'Firefox', physical: false },
  { id: 'ios-voiceover-safari', os: 'iOS', at: 'VoiceOver', browser: 'Safari', physical: true },
  { id: 'android-talkback-chrome', os: 'Android', at: 'TalkBack', browser: 'Chrome', physical: true },
];
export const protocols = ['family-keyboard-aria', 'nested-modal-touch', 'form-errors',
  'composite-removal', 'toast-announcements', 'menu-filter-announcements', 'visual-settings'];

export function obligations(family) {
  const special = {
    accordion: 'Headers/triggers, expanded state, Home/End/arrows, disabled items, linked panels.',
    'alert-dialog': 'alertdialog name/description, deliberate action, Escape policy, nested modality/focus return.',
    autocomplete: 'Editable input, active descendant, suggestion announcements, IME, clear, removal and caret.',
    avatar: 'Image alt and fallback; loaded/error transitions must not duplicate or erase the accessible name.',
    button: 'Native/non-native Enter/Space, type/submit, disabled versus focusable disabled and cancellation.',
    checkbox: 'Field label, checked/mixed, required/invalid, Space keyup, hidden input, readonly and disabled.',
    'checkbox-group': 'Group label, parent mixed state, disabled children, limits, validation and form values.',
    collapsible: 'Trigger expanded/controls, closed content inaccessible, keyboard reopen, disabled trigger.',
    combobox: 'Input/listbox/options, active descendant, Home/End, IME, chips, dynamic removal, multi-selection.',
    'context-menu': 'ContextMenu keyboard/Shift+F10, touch long press, menu loop/submenus, dismissal and focus return.',
    'csp-provider': 'Composed prehydration script nonce and focus/ARIA preservation; provider has no standalone role.',
    dialog: 'Modal/nonmodal and nested trap, title/description, Escape and touch popup default focus.',
    'direction-provider': 'Live direction in composites, RTL arrows/submenus/caret; provider has no standalone role.',
    drawer: 'Dialog semantics plus nested swipe/cancel, snap points, touch focus and background scroll.',
    field: 'Label/control/description/error id handoff, required/invalid, validation race and announcement.',
    fieldset: 'Legend/group association, description, inherited disabled, nested controls.',
    'filter-dropdown': 'Solid-only extension: filter keyboard, menu/list identity, label and active descendant.',
    form: 'Submit blocking, first invalid focus in DOM order including portals/reorder, async validators.',
    input: 'Native name/description, typing/caret, readonly/disabled, required/invalid and field composition.',
    menu: 'Trigger expanded/haspopup, menuitem roles, typeahead, filter input, submenus and focus restoration.',
    menubar: 'Menubar roving focus, RTL horizontal arrows, submenu vertical navigation, Escape and disabled items.',
    'merge-props': 'Composed handlers/cancellation, rightmost ARIA/label/ref precedence and host identity.',
    meter: 'Name, min/max/now/text, formatted value and boundaries; no keyboard interaction on passive meter.',
    'navigation-menu': 'Navigation labels/links, trigger expanded, keyboard/RTL submenu, focus and removal.',
    'number-field': 'Spinbutton label/value/range, Arrow/Page/Home/End, locale input, disabled/readonly and steppers.',
    'otp-field': 'Group/input labels, paste/backspace/arrows, caret, validation, mobile autofill and readonly.',
    popover: 'Trigger/popup relations, modal versus nonmodal, nested Escape, touch/keyboard initial/final focus.',
    'preview-card': 'Link semantics, hover/focus opening, Escape dismissal, popup traversal and touch policy.',
    progress: 'Named determinate/indeterminate progressbar, absent now in indeterminate state, range/text.',
    radio: 'Option label, checked state, Space keyup not Enter, hidden input, readonly/disabled.',
    'radio-group': 'Group label, required/invalid, roving RTL arrows, disabled skip, cancellation and removal.',
    'scroll-area': 'Focusable scroll viewport, keyboard scroll, scrollbar orientation/value, RTL and touch.',
    select: 'Trigger name/expanded, linked listbox/options, typeahead, selection, multiple/removal, focus return.',
    separator: 'Orientation and decorative semantics; passive separator has no keyboard interaction.',
    slider: 'Named thumbs, value/min/max/text, RTL arrows/Home/End/Page, multiple thumbs, disabled/readonly.',
    switch: 'Field label, checked, Space, required/invalid, hidden input and disabled/readonly.',
    tabs: 'Tablist/tab/panel IDs, selected state, RTL/orientation arrows/Home/End, disabled focus and removal.',
    toast: 'Priority live announcements, title/description, repeated updates, viewport shortcut and dismiss focus.',
    toggle: 'Accessible name and pressed state, native/non-native Space/Enter, disabled and cancellation.',
    'toggle-group': 'Group name, single/multiple pressed state, RTL roving navigation, disabled and removal.',
    toolbar: 'Toolbar name, roving arrows/RTL/orientation, embedded input/select, disabled and group semantics.',
    tooltip: 'Trigger accessible description, focus/hover/Escape, delay, no invented tooltip role, disabled trigger.',
    'unstable-use-media-query': 'Live reduced-motion/forced-colors matching in composed control; no standalone role.',
    'use-render': 'Custom host roles/ARIA/ref forwarding, keyboard/cancellation, focused host and caret identity.',
    types: 'Type-only export: no rendered host; usage contracts in consumers need explicit disposition.',
  };
  return special[family] ?? `Unclassified exported family ${family}: source review and explicit obligations required.`;
}

export function makeMatrix(families) {
  return families.flatMap((family) => facets.map((facet) => ({
    id: `${family}:${facet}`, family, facet, obligation: obligations(family),
    status: 'blocked', blocker: 'Full family/facet source mapping and runtime evidence pending.',
    candidateScenarios: scenarios.filter((s) => s.families.includes(family)).map((s) => s.id),
  })));
}

export function gate(inventory, results = [], manual = []) {
  const expected = scenarios.flatMap((s) => browsers.flatMap((browser) => environments.map((environment) =>
    `${s.id}:${browser}:${environment}`)));
  const unique = new Map();
  const errors = [];
  for (const row of results) {
    const id = `${row.scenario}:${row.browser}:${row.environment}`;
    if (!expected.includes(id) || unique.has(id)) errors.push(`Unexpected or duplicate automated row ${id}`);
    unique.set(id, row);
  }
  const automated = expected.map((id) => ({ id, status: unique.get(id)?.status ?? 'unexecuted' }));
  const sourceBlockers = inventory.cases.filter((row) => row.status !== 'pass');
  const matrixBlockers = inventory.matrix.filter((row) => row.status !== 'pass');
  const manualRows = manualPlatforms.flatMap((platform) => protocols.map((protocol) => {
    const id = `${platform.id}:${protocol}`;
    const evidence = manual.filter((row) => row.id === id);
    // Explicit physical attestation and artifact binding; desktop emulation never qualifies.
    const valid = evidence.length === 1 && evidence[0].status === 'pass' && evidence[0].artifactSha256 &&
      evidence[0].os === platform.os && evidence[0].at === platform.at && evidence[0].browser === platform.browser &&
      evidence[0].osVersion && evidence[0].atVersion && evidence[0].browserVersion && evidence[0].operator &&
      evidence[0].recording && evidence[0].transcript && evidence[0].familyResults?.length === inventory.families.length &&
      inventory.families.every((f) => evidence[0].familyResults.some((r) => r.family === f && r.status === 'pass')) &&
      !evidence[0].emulated &&
      (!platform.physical || (evidence[0].physicalDevice === true && evidence[0].deviceModel && !evidence[0].emulated));
    return { id, status: valid ? 'pass' : 'blocked', reason: valid ? null :
      platform.physical ? 'Physical device/AT execution and archive-bound transcript required; emulation rejected.' :
        'Platform-specific AT execution and archive-bound family transcript required.' };
  }));
  return { passed: errors.length === 0 && sourceBlockers.length === 0 && matrixBlockers.length === 0 &&
    automated.every((r) => r.status === 'pass') && manualRows.every((r) => r.status === 'pass'),
    errors, automated, sourceBlockers: sourceBlockers.length, matrixBlockers: matrixBlockers.length, manual: manualRows };
}
