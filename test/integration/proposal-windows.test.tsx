import { createMemo, createSignal, flush, Loading } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { expect, it, vi } from 'vitest';
import { createRenderer, firePointer, waitFor } from '../../packages/solid/test';
import { createChangeEventDetails } from '../../packages/solid/src/internals/createBaseUIEventDetails';
import { RadioGroup } from '../../packages/solid/src/radio-group/RadioGroup';
import { useRadioGroupContext } from '../../packages/solid/src/radio-group/RadioGroupContext';
import { NumberFieldRoot } from '../../packages/solid/src/number-field/root/NumberFieldRoot';
import { useNumberFieldRootContext } from '../../packages/solid/src/number-field/root/NumberFieldRootContext';
import { SliderRoot } from '../../packages/solid/src/slider/root/SliderRoot';
import { useSliderRootContext } from '../../packages/solid/src/slider/root/SliderRootContext';
import { createComboboxModel } from '../../packages/solid/src/combobox/store';
import { createFloatingRoot } from '../../packages/solid/src/floating-ui-react/components/createFloatingRoot';
import * as Menu from '../../packages/solid/src/menu/index.parts';
import * as Drawer from '../../packages/solid/src/drawer/index.parts';
import { SliderControl } from '../../packages/solid/src/slider/control/SliderControl';
import { SliderThumb } from '../../packages/solid/src/slider/thumb/SliderThumb';

const { render } = createRenderer();

// The synchronous first result establishes a rendered async dependency. Changing
// it holds every write in the request's batch until this explicit promise resolves.
async function heldView(children: (hold: () => void) => JSX.Element) {
  let release!: () => void;
  const promise = new Promise<void>((resolve) => { release = resolve; });
  const view = await render(() => {
    const [revision, setRevision] = createSignal(0);
    const result = createMemo(() => revision() ? promise.then(() => 'ready') : 'initial');
    return <><Loading><span data-testid="held">{result()}</span></Loading>{children(() => setRevision(1))}</>;
  });
  return { view, release, async settle() {
    release();
    await waitFor(() => expect(view.getByTestId('held')).toHaveTextContent('ready'));
  } };
}

async function checkpoint() { await Promise.resolve(); await Promise.resolve(); await Promise.resolve(); }

it('RadioGroup retains selection for duplicate suppression during a held batch', async () => {
  let group!: NonNullable<ReturnType<typeof useRadioGroupContext>>;
  function Probe() { group = useRadioGroupContext()!; return null; }
  const changed = vi.fn();
  const held = await heldView((hold) => <RadioGroup defaultValue="a" onValueChange={(next) => { changed(next); hold(); }}><Probe /></RadioGroup>);
  try {
    group.setCheckedValue('b', createChangeEventDetails('none'));
    await checkpoint();
    expect(group.checkedValue).toBe('a');
    expect(group.isSelected('b')).toBe(true);
    group.setCheckedValue('b', createChangeEventDetails('none'));
    expect(changed.mock.calls).toEqual([['b']]);
    await held.settle();
    expect(group.checkedValue).toBe('b');
  } finally { held.release(); }
});

it('NumberField composes increments and retains manual text through a held batch', async () => {
  let field!: ReturnType<typeof useNumberFieldRootContext>;
  function Probe() { field = useNumberFieldRootContext(); return null; }
  const changed = vi.fn();
  const held = await heldView((hold) => <NumberFieldRoot defaultValue={0} onValueChange={(next) => { changed(next); hold(); }}><Probe /></NumberFieldRoot>);
  try {
    field.increment(1, 1, createChangeEventDetails('increment-press'));
    field.manual = true;
    field.setText('1.');
    await checkpoint();
    expect(field.state.value).toBe(0);
    expect(field.numericValue()).toBe(1);
    expect(field.text()).toBe('1.');
    field.increment(1, 1, createChangeEventDetails('increment-press'));
    expect(changed.mock.calls).toEqual([[1], [2]]);
    await held.settle();
    expect(field.numericValue()).toBe(2);
    field.manual = false;
    field.syncText();
    flush();
    expect(field.text()).toBe('2');
  } finally { held.release(); }
});

it('Slider composes range input changes while the first update is held', async () => {
  let slider!: ReturnType<typeof useSliderRootContext>;
  function Probe() { slider = useSliderRootContext(); return null; }
  const changed = vi.fn();
  const held = await heldView((hold) => <SliderRoot defaultValue={[10, 50]} onValueChange={(next) => { changed(next); hold(); }}><Probe /></SliderRoot>);
  try {
    slider.handleInputChange(20, 0, new Event('input'));
    await checkpoint();
    expect(slider.values).toEqual([10, 50]);
    expect(slider.inputValues()).toEqual([20, 50]);
    slider.handleInputChange(60, 1, new Event('input'));
    expect(changed.mock.calls).toEqual([[[20, 50]], [[20, 60]]]);
    await held.settle();
    expect(slider.values).toEqual([20, 60]);
  } finally { held.release(); }
});

it('Combobox multiple selection composes item presses during a held update', async () => {
  let model!: ReturnType<typeof createComboboxModel>;
  const changed = vi.fn();
  function Model(props: { hold: () => void }) {
    model = createComboboxModel({ selectionMode: 'multiple', items: ['a', 'b'], onSelectedValueChange(next) { changed(next); props.hold(); } });
    return null;
  }
  const held = await heldView((hold) => <Model hold={hold} />);
  try {
    model.context.handleSelection(new MouseEvent('click'), 'a');
    await checkpoint();
    expect(model.state.selectedValue).toEqual([]);
    model.context.handleSelection(new MouseEvent('click'), 'b');
    expect(changed.mock.calls).toEqual([[['a']], [['a', 'b']]]);
    await held.settle();
    expect(model.state.selectedValue).toEqual(['a', 'b']);
  } finally { held.release(); }
});

it('FloatingRoot preserves click provenance when publication follows dispatch and is held', async () => {
  let root!: ReturnType<typeof createFloatingRoot>;
  let publish!: (value: boolean) => void;
  function Model() {
    const [open, setOpen] = createSignal(false);
    publish = setOpen;
    root = createFloatingRoot({ state: { get open() { return open(); }, transitionStatus: undefined, domReferenceElement: null, referenceElement: null, positionReference: null, floatingElement: null, floatingId: undefined } });
    return null;
  }
  let hold!: () => void;
  const held = await heldView((start) => { hold = start; return <Model />; });
  try {
    const click = new MouseEvent('click');
    // This dispatch precedes the first signal write, matching Popup publication.
    root.dispatchOpenChange(true, createChangeEventDetails('trigger-press', click));
    publish(true);
    hold();
    await checkpoint();
    expect(root.state.open).toBe(false);
    root.dispatchOpenChange(true, createChangeEventDetails('trigger-hover', new MouseEvent('mouseenter')));
    expect(root.data.openEvent).toBe(click);
    await held.settle();
    expect(root.state.open).toBe(true);
    held.view.unmount();
    root.dispatchOpenChange(true, createChangeEventDetails('trigger-press', click));
    expect(root.data.openEvent).toBeUndefined();
  } finally { held.release(); }
});

it('MenuCheckboxItem composes toggles across a held batch', async () => {
  const changed = vi.fn();
  const held = await heldView((hold) => <Menu.Root open><Menu.CheckboxItem onCheckedChange={(next) => { changed(next); hold(); }}>Item</Menu.CheckboxItem></Menu.Root>);
  try {
    const item = held.view.getByRole('menuitemcheckbox');
    item.click();
    await checkpoint();
    expect(item).toHaveAttribute('aria-checked', 'false');
    item.click();
    expect(changed.mock.calls).toEqual([[true], [false]]);
    await held.settle();
    expect(item).toHaveAttribute('aria-checked', 'false');
  } finally { held.release(); }
});

it('SliderControl suppresses a duplicate drag candidate while publication is held', async () => {
  const changed = vi.fn();
  const held = await heldView((hold) => <SliderRoot defaultValue={0} onValueChange={(next) => { changed(next); hold(); }}>
    <SliderControl data-testid="control"><SliderThumb /></SliderControl>
  </SliderRoot>);
  try {
    const control = held.view.getByTestId('control');
    vi.spyOn(control, 'getBoundingClientRect').mockReturnValue({ left: 0, right: 100, top: 0, bottom: 20, width: 100, height: 20, x: 0, y: 0, toJSON() {} });
    firePointer.down(control, { pointerType: 'mouse', button: 0, buttons: 1, pointerId: 1, clientX: 20, clientY: 10, timeStamp: 1000 });
    await checkpoint();
    expect(held.view.getByRole('slider')).toHaveAttribute('aria-valuenow', '0');
    firePointer.move(control, { pointerType: 'mouse', buttons: 1, pointerId: 1, clientX: 20, clientY: 10, timeStamp: 1016 });
    expect(changed.mock.calls).toEqual([[20]]);
    firePointer.move(control, { pointerType: 'mouse', buttons: 1, pointerId: 1, clientX: 30, clientY: 10, timeStamp: 1032 });
    expect(changed.mock.calls).toEqual([[20], [30]]);
    firePointer.up(control, { pointerType: 'mouse', button: 0, buttons: 0, pointerId: 1, clientX: 30, clientY: 10, timeStamp: 1048 });
    await held.settle();
    expect(held.view.getByRole('slider')).toHaveAttribute('aria-valuenow', '30');
  } finally { held.release(); }
});

it('DrawerSwipeArea does not request opening twice when release precedes a held commit', async () => {
  const changed = vi.fn();
  const held = await heldView((hold) => <Drawer.Root modal={false} onOpenChange={(next) => { changed(next); hold(); }}>
    <Drawer.SwipeArea data-testid="area" />
  </Drawer.Root>);
  try {
    const area = held.view.getByTestId('area');
    firePointer.down(area, { pointerType: 'mouse', button: 0, buttons: 1, pointerId: 1, clientX: 10, clientY: 120, timeStamp: 1000 });
    firePointer.move(area, { pointerType: 'mouse', buttons: 1, pointerId: 1, clientX: 10, clientY: 40, timeStamp: 1016 });
    await checkpoint();
    expect(area).toHaveAttribute('data-closed');
    firePointer.up(area, { pointerType: 'mouse', button: 0, buttons: 0, pointerId: 1, clientX: 10, clientY: 40, timeStamp: 1032 });
    expect(changed.mock.calls).toEqual([[true]]);
    await held.settle();
    expect(area).toHaveAttribute('data-open');
  } finally { held.release(); }
});

it.each(['uncontrolled', 'refuse', 'cancel-open', 'cancel-close'] as const)('DrawerSwipeArea reverses a short held swipe only when permitted (%s)', async (mode) => {
  const changed = vi.fn();
  const held = await heldView((hold) => <Drawer.Root modal={false} open={mode === 'refuse' ? false : undefined} onOpenChange={(next, details) => {
    changed(next); hold();
    if ((mode === 'cancel-open' && next) || (mode === 'cancel-close' && !next)) details.cancel();
  }}><Drawer.SwipeArea data-testid="area" /></Drawer.Root>);
  try {
    const area = held.view.getByTestId('area');
    firePointer.down(area, { pointerType: 'mouse', button: 0, buttons: 1, pointerId: 1, clientX: 10, clientY: 120, timeStamp: 1000 });
    firePointer.move(area, { pointerType: 'mouse', buttons: 1, pointerId: 1, clientX: 10, clientY: 110, timeStamp: 1100 });
    await checkpoint();
    expect(changed.mock.calls).toEqual([[true]]);
    expect(area).toHaveAttribute('data-closed');
    // Ten pixels is below the 40px fallback threshold; the stationary release
    // more than 80ms after the last sample also has zero release velocity.
    firePointer.up(area, { pointerType: 'mouse', button: 0, buttons: 0, pointerId: 1, clientX: 10, clientY: 110, timeStamp: 1400 });
    expect(changed.mock.calls).toEqual(mode === 'refuse' || mode === 'cancel-open' ? [[true]] : [[true], [false]]);
    await held.settle();
    expect(area).toHaveAttribute(mode === 'cancel-close' ? 'data-open' : 'data-closed');
    expect(area).not.toHaveAttribute('data-swiping');
  } finally { held.release(); }
});

it.each(['short', 'long', 'cancel', 'cancel-before-progress'] as const)('DrawerSwipeArea preserves ordinary %s gesture behavior', async (kind) => {
  const changed = vi.fn();
  const view = await render(() => <Drawer.Root modal={false} onOpenChange={(next) => changed(next)}>
    <Drawer.SwipeArea data-testid="area" />
  </Drawer.Root>);
  const area = view.getByTestId('area');
  const endY = kind === 'long' ? 40 : 110;
  firePointer.down(area, { pointerType: 'mouse', button: 0, buttons: 1, pointerId: 1, clientX: 10, clientY: 120, timeStamp: 1000 });
  if (kind !== 'cancel-before-progress') {
    firePointer.move(area, { pointerType: 'mouse', buttons: 1, pointerId: 1, clientX: 10, clientY: endY, timeStamp: 1100 });
    await checkpoint();
    expect(area).toHaveAttribute('data-open');
  }
  const finish = kind.startsWith('cancel') ? firePointer.cancel : firePointer.up;
  finish(area, { pointerType: 'mouse', button: 0, buttons: 0, pointerId: 1, clientX: 10, clientY: endY, timeStamp: 1400 });
  await checkpoint();
  // Upstream routes pointercancel through handleEnd, applying the same threshold
  // policy as pointerup (distinct from the gesture recognizer's onCancel hook).
  expect(changed.mock.calls).toEqual(kind === 'cancel-before-progress' ? [] : kind === 'long' ? [[true]] : [[true], [false]]);
  expect(area).toHaveAttribute(kind === 'long' ? 'data-open' : 'data-closed');
  expect(area).not.toHaveAttribute('data-swiping');
});

it.each(['accept', 'refuse', 'cancel'] as const)('Slider ends its held proposal window after controlled %s', async (mode) => {
  let slider!: ReturnType<typeof useSliderRootContext>;
  function Probe() { slider = useSliderRootContext(); return null; }
  function Controlled(props: { hold: () => void }) {
    const [value, setValue] = createSignal(10);
    return <SliderRoot value={value()} onValueChange={(next, details) => {
      props.hold();
      if (mode === 'cancel') details.cancel();
      if (mode === 'accept') setValue(next + 1);
    }}><Probe /></SliderRoot>;
  }
  const held = await heldView((hold) => <Controlled hold={hold} />);
  try {
    slider.handleInputChange(20, 0, new Event('input'));
    await checkpoint();
    // Proposal composition must never publish a controlled value to the UI.
    expect(slider.values).toEqual([10]);
    await held.settle();
    expect(slider.values).toEqual([mode === 'accept' ? 21 : 10]);
    expect(slider.inputValues()).toEqual(slider.values);
  } finally { held.release(); }
});

it.each(['refuse', 'cancel'] as const)('MenuCheckboxItem does not retain a %s toggle during a hold', async (mode) => {
  const changed = vi.fn();
  const held = await heldView((hold) => <Menu.Root open><Menu.CheckboxItem checked={mode === 'refuse' ? false : undefined} onCheckedChange={(next, details) => {
    changed(next); hold(); if (mode === 'cancel') details.cancel();
  }}>Item</Menu.CheckboxItem></Menu.Root>);
  try {
    const item = held.view.getByRole('menuitemcheckbox');
    item.click();
    await checkpoint();
    item.click();
    expect(changed.mock.calls).toEqual([[true], [true]]);
    await held.settle();
    expect(item).toHaveAttribute('aria-checked', 'false');
  } finally { held.release(); }
});

it('disposing a MenuCheckboxItem before its batch settles cannot mutate its detached host', async () => {
  const held = await heldView((hold) => <Menu.Root open><Menu.CheckboxItem onCheckedChange={hold}>Item</Menu.CheckboxItem></Menu.Root>);
  const item = held.view.getByRole('menuitemcheckbox');
  item.click();
  await checkpoint();
  held.view.unmount();
  held.release();
  await checkpoint();
  flush();
  expect(item.isConnected).toBe(false);
  expect(item).toHaveAttribute('aria-checked', 'false');
});

it('Combobox label synchronization does not duplicate a held input request', async () => {
  let model!: ReturnType<typeof createComboboxModel>;
  let replaceItems!: () => void;
  const changed = vi.fn();
  function Model(props: { hold: () => void }) {
    const [items, setItems] = createSignal(['a']);
    replaceItems = () => setItems(['a', 'b']);
    model = createComboboxModel({ selectionMode: 'single', get items() { return items(); }, onInputValueChange(next) { changed(next); props.hold(); } });
    return null;
  }
  const held = await heldView((hold) => <Model hold={hold} />);
  try {
    model.context.setSelectedValue('a', createChangeEventDetails('none'));
    model.setInside(false);
    await checkpoint();
    expect(changed.mock.calls).toEqual([['a']]);
    replaceItems();
    await checkpoint();
    expect(model.state.inputValue).toBe('');
    expect(changed.mock.calls).toEqual([['a']]);
    await held.settle();
    expect(model.state.inputValue).toBe('a');
    expect(changed.mock.calls).toEqual([['a']]);
  } finally { held.release(); }
});
