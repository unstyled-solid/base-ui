import { expect, it, vi } from 'vitest';
import { cdp } from 'vitest/browser';
import { createRenderer, browserCase, fireEvent, firePointer } from '../../test';
import { fireTouch, touchPoint } from '../../test/touch';
import type { SliderRootProps } from './root/SliderRoot';
import { DirectionContext } from '../internals/direction-context/DirectionContext';
import { FieldRoot } from '../field/root/FieldRoot';
import { createSignal } from 'solid-js';
import { Slider } from './index';

// Qualification owner bsolid-browser runs this file with the Chromium CDP
// provider. The real driver, not synthetic pointer events, owns active captures.
function pagePoint(rect: DOMRect, fraction: number) {
  const frame = window.frameElement?.getBoundingClientRect() ?? new DOMRect();
  const scale = frame.width / window.innerWidth || 1;
  return { x: frame.left + (rect.left + rect.width * fraction) * scale, y: frame.top + (rect.top + rect.height / 2) * scale };
}
const { render, renderProps } = createRenderer();
browserCase({ source: 'packages/react/src/slider/control/SliderControl.test.tsx', case: 'real Chromium capture/release and committed candidate', environment: 'browser', issue: 'bsolid-browser' }, async () => {
  const commit = vi.fn(); const capture = vi.fn(); const change = vi.fn();
  const view = await render(() => <Slider.Root defaultValue={0} onValueCommitted={commit} onValueChange={change}>
    <Slider.Control data-testid="control" style={{ position: 'relative', width: '200px', height: '20px', 'touch-action': 'none' }}>
      <Slider.Thumb style={{ width: '10px', height: '10px' }} />
    </Slider.Control>
  </Slider.Root>);
  const control = view.getByTestId('control');
  const release = vi.spyOn(control, 'releasePointerCapture');
  control.addEventListener('gotpointercapture', (event) => capture(event.pointerId));
  const rect = control.getBoundingClientRect(); const session = cdp();
  let id: number;
  try {
    await session.send('Input.dispatchMouseEvent', { type: 'mousePressed', ...pagePoint(rect, 0.4), button: 'left', buttons: 1, clickCount: 1 });
    // CDP defaults button to "none". Keep the pressed button during a drag:
    // Chromium otherwise releases capture even though pointermove.buttons is 1.
    await session.send('Input.dispatchMouseEvent', { type: 'mouseMoved', ...pagePoint(rect, 0.6), button: 'left', buttons: 1 });
    expect(capture).toHaveBeenCalledTimes(1);
    id = capture.mock.calls[0][0]; expect(control.hasPointerCapture(id)).toBe(true);
    expect(change.mock.calls.map(([value, details]) => [value, details.reason])).toEqual([[40, 'track-press'], [60, 'drag']]);
  } finally {
    await session.send('Input.dispatchMouseEvent', { type: 'mouseReleased', ...pagePoint(rect, 0.9), button: 'left', buttons: 0, clickCount: 1 });
  }
  await vi.waitFor(() => expect(commit).toHaveBeenCalledTimes(1));
  expect(commit.mock.calls[0][0]).toBe(60); expect(control.hasPointerCapture(id)).toBe(false);
  expect(release).toHaveBeenCalledExactlyOnceWith(id);
});

// Synthetic source packets run in a real browser when the source requires
// layout/focus/Touch. Only active-capture driver tests above use actual capture.
async function packetSlider(props: SliderRootProps = {}, options: { direction?: 'ltr' | 'rtl'; disabledThumb?: boolean; accept?: boolean; sourceLayout?: boolean } = {}) {
  const direction = options.direction ?? 'ltr';
  const view = await renderProps<SliderRootProps>((live) => {
    const [value, setValue] = createSignal(() => live.value);
    const count = () => { const value = live.value ?? live.defaultValue; return Array.isArray(value) ? value.length : 1; };
    return <div dir={direction}><DirectionContext value={() => direction}>
    <Slider.Root {...live} value={options.accept ? value() : live.value} onValueChange={(next, details) => { live.onValueChange?.(next, details); if (options.accept && !details.isCanceled) setValue(next); }}><Slider.Value data-testid="value" /><Slider.Control data-testid="control" style={options.sourceLayout ? undefined : { position: 'relative', width: '100px', height: '100px' }}>
      <Slider.Thumb index={0} data-testid="thumb-0" disabled={options.disabledThumb && !Array.isArray(live.value ?? live.defaultValue)} style={options.sourceLayout ? undefined : { width: '10px', height: '10px' }} />
      {count() > 1 && <Slider.Thumb index={1} data-testid="thumb-1" disabled={options.disabledThumb} style={options.sourceLayout ? undefined : { width: '10px', height: '10px' }} />}
      {count() > 2 && <Slider.Thumb index={2} data-testid="thumb-2" style={options.sourceLayout ? undefined : { width: '10px', height: '10px' }} />}
    </Slider.Control></Slider.Root></DirectionContext></div>;
  }, { defaultValue: 20, ...props });
  const control = view.getByTestId('control');
  vi.spyOn(control, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 100, 100));
  Object.defineProperties(control, {
    setPointerCapture: { configurable: true, value: vi.fn() }, hasPointerCapture: { configurable: true, value: () => false }, releasePointerCapture: { configurable: true, value: vi.fn() },
  });
  const values = () => view.getAllByRole('slider').map((input) => Number(input.getAttribute('aria-valuenow')));
  return { ...view, control, values };
}
async function touchPacket(target: HTMLElement, type: 'touchstart' | 'touchmove' | 'touchend' | 'touchcancel', x: number, y = 0, identifier = 1) {
  fireTouch(target, type, [touchPoint(document.body, x, y, identifier)]);
  await Promise.resolve();
}
async function pointerPacket(type: 'down' | 'move' | 'up' | 'cancel', target: Element | Document, x: number, timeStamp: number, pointerType = 'mouse', pointerId = 1, buttons = type === 'up' ? 0 : 1) {
  if (target instanceof Document) {
    const event = new PointerEvent(`pointer${type}`, { bubbles: true, cancelable: true, pointerType, pointerId, button: 0, buttons, clientX: x });
    Object.defineProperty(event, 'timeStamp', { value: timeStamp }); target.dispatchEvent(event);
  } else firePointer[type](target, { timeStamp, pointerType, pointerId, button: 0, buttons, clientX: x });
  await Promise.resolve();
}
const isWebKit = /AppleWebKit/.test(navigator.userAgent) && !/Chrome|Chromium/.test(navigator.userAgent);
const rootSource = 'packages/react/src/slider/root/SliderRoot.test.tsx';
const controlSource = 'packages/react/src/slider/control/SliderControl.test.tsx';
const thumbSource = 'packages/react/src/slider/thumb/SliderThumb.test.tsx';

it.skipIf(isWebKit)('source Root initial out-of-range touch does not break', async () => {
  const view = await packetSlider({ value: [19, 41], min: 20, max: 40 });
  await touchPacket(view.control, 'touchstart', 100); await touchPacket(document.body, 'touchmove', 20);
  expect(view.getAllByRole('slider')).toHaveLength(2); await touchPacket(document.body, 'touchend', 20);
});
for (const axis of ['rtl', 'vertical'] as const) it.skipIf(isWebKit)(`source Root ${axis} touch position`, async () => {
  const change = vi.fn((value) => value);
  const view = await packetSlider({ value: axis === 'rtl' ? 30 : undefined, defaultValue: 20, orientation: axis === 'vertical' ? 'vertical' : 'horizontal', onValueChange: change }, { direction: axis === 'rtl' ? 'rtl' : 'ltr' });
  if (axis === 'rtl') expect(view.getByTestId('thumb-0').style.insetInlineStart).toBe('30%');
  await touchPacket(view.control, 'touchstart', axis === 'rtl' ? 20 : 0, axis === 'vertical' ? 20 : 0);
  await touchPacket(document.body, 'touchmove', axis === 'rtl' ? 22 : 0, axis === 'vertical' ? 22 : 0);
  expect(change).toHaveBeenCalledTimes(2); expect(change.mock.results.map((result) => result.value)).toEqual([80, 78]);
  await touchPacket(document.body, 'touchend', 22);
});
for (const initiallyDisabled of [false, true]) it.skipIf(isWebKit)(`source Root ignores touch drag disabled initially=${initiallyDisabled}`, async () => {
  const view = await packetSlider({ defaultValue: initiallyDisabled ? 21 : 0, disabled: initiallyDisabled });
  const input = view.getByRole('slider'); await touchPacket(view.control, 'touchstart', 21); expect(input).toHaveAttribute('aria-valuenow', '21');
  if (!initiallyDisabled) { expect(input).toHaveFocus(); await view.setProps({ disabled: true }); expect(input).not.toHaveFocus(); }
  await touchPacket(document.body, 'touchmove', 30); await touchPacket(document.body, 'touchend', 30); expect(input).toHaveAttribute('aria-valuenow', '21');
});
it.skipIf(isWebKit)('source Root disabled thumb ignores touch', async () => {
  const change = vi.fn(); const view = await packetSlider({ defaultValue: [20, 80], onValueChange: change }, { disabledThumb: true });
  const disabled = view.getAllByRole('slider')[1]; expect(disabled).toBeDisabled();
  await touchPacket(view.getByTestId('thumb-1'), 'touchstart', 80); await touchPacket(document.body, 'touchmove', 40); await touchPacket(document.body, 'touchend', 40);
  expect(change).not.toHaveBeenCalled(); expect(view.values()).toEqual([20, 80]);
});
browserCase({ source: rootSource, case: 'does not select disabled closest thumb on track press', environment: 'browser', issue: 'bsolid-browser' }, async () => {
  const view = await packetSlider({ defaultValue: [20, 80], thumbCollisionBehavior: 'none' }, { disabledThumb: true });
  expect(view.getAllByRole('slider')[1]).toBeDisabled(); await pointerPacket('down', view.control, 95, 1); await pointerPacket('up', view.control, 95, 2);
  expect(view.getAllByRole('slider')[1]).toHaveAttribute('aria-valuenow', '80');
});
it.skipIf(!/WebKit/.test(navigator.userAgent))('source Root vertical does not use WebKit appearance', async () => {
  const view = await packetSlider({ orientation: 'vertical' }); const input = view.getByRole('slider');
  expect(input.tagName).toBe('INPUT'); expect(input).toHaveProperty('type', 'range'); expect(getComputedStyle(input).webkitAppearance).not.toBe('slider-vertical');
});
for (const scenario of [
  { name: 'decimal', value: 0.2, min: 0, max: 1, step: 0.1, points: [20, 80, 40], expected: ['0.2', '0.8', '0.4'] },
  { name: 'tiny positive', value: 2e-8, min: 0, max: 1e-7, step: 1e-8, points: [20, 80], expected: ['2e-8', '8e-8'] },
  { name: 'tiny negative', value: -2e-8, min: -1e-7, max: 0, step: 1e-8, points: [80, 20], expected: ['-2e-8', '-8e-8'] },
  { name: 'right edge origin', value: 90, min: 6, max: 108, step: 10, points: [20, 100, 200, 50, -100], expected: [undefined, '106', '106', '56', '6'] },
]) it.skipIf(isWebKit)(`source Root touch precision ${scenario.name}`, async () => {
  const view = await packetSlider({ defaultValue: scenario.value, min: scenario.min, max: scenario.max, step: scenario.step }); const input = view.getByRole('slider');
  input.focus(); expect(input).toHaveAttribute('aria-valuenow', String(scenario.value));
  for (let index = 0; index < scenario.points.length; index += 1) {
    await touchPacket(index ? document.body : view.control, index ? 'touchmove' : 'touchstart', scenario.points[index]);
    if (scenario.expected[index] !== undefined) expect(input).toHaveAttribute('aria-valuenow', scenario.expected[index]);
  }
  await touchPacket(document.body, 'touchend', 0);
});
for (const pointerType of ['touch', 'pen']) browserCase({ source: rootSource, case: `commits a ${pointerType} track tap`, environment: 'browser', issue: 'bsolid-browser' }, async () => {
  const commit = vi.fn(); const view = await render(() => {
    const [value, setValue] = createSignal(0);
    return <Slider.Root value={value()} onValueChange={setValue} onValueCommitted={commit}><Slider.Control data-testid="control"><Slider.Thumb /></Slider.Control></Slider.Root>;
  });
  const control = view.getByTestId('control'); vi.spyOn(control, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 100, 10));
  Object.defineProperties(control, { setPointerCapture: { value: vi.fn() }, hasPointerCapture: { value: () => false } });
  await pointerPacket('down', control, 50, 1, pointerType); await touchPacket(control, 'touchstart', 50);
  await pointerPacket('up', control, 50, 2, pointerType); await touchPacket(document.body, 'touchend', 50);
  expect(commit).toHaveBeenCalledTimes(1); expect(commit.mock.calls[0][0]).toBe(50);
});
for (const pointerType of ['mouse', 'pen', 'touch']) browserCase({ source: rootSource, case: `handles a touch press after canceled ${pointerType}`, environment: 'browser', issue: 'bsolid-browser' }, async () => {
  const change = vi.fn(); const commit = vi.fn(); let prevent = false;
  const view = await render(() => <Slider.Root defaultValue={0} onValueChange={change} onValueCommitted={commit}><Slider.Control data-testid="control" onPointerDown={(event) => { if (prevent) event.preventDefault(); }}><Slider.Thumb /></Slider.Control></Slider.Root>);
  const control = view.getByTestId('control'); vi.spyOn(control, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 100, 10));
  Object.defineProperties(control, { setPointerCapture: { value: vi.fn() }, hasPointerCapture: { value: () => false } });
  await pointerPacket('down', control, 50, 1, pointerType); if (pointerType === 'touch') await touchPacket(control, 'touchstart', 50);
  expect(change.mock.lastCall?.[0]).toBe(50); await pointerPacket('cancel', control, 50, 2, pointerType);
  if (pointerType === 'touch') await touchPacket(document.body, 'touchcancel', 50);
  commit.mockClear(); prevent = true; await pointerPacket('down', control, 30, 3, 'touch', 2); await touchPacket(control, 'touchstart', 30, 0, 2);
  expect(change.mock.lastCall?.[0]).toBe(30); await pointerPacket('up', control, 30, 4, 'touch', 2); await touchPacket(document.body, 'touchend', 30, 0, 2);
  expect(commit).toHaveBeenCalledTimes(1); expect(commit.mock.calls[0][0]).toBe(30);
});
for (const pointerType of ['touch', 'pen']) browserCase({ source: rootSource, case: `does not change on ${pointerType} thumb tap`, environment: 'browser', issue: 'bsolid-browser' }, async () => {
  const change = vi.fn(); const view = await packetSlider({ defaultValue: 100, step: 3, onValueChange: change }); const thumb = view.getByTestId('thumb-0');
  vi.spyOn(thumb, 'getBoundingClientRect').mockReturnValue(new DOMRect(95, 0, 10, 10));
  await pointerPacket('down', thumb, 100, 1, pointerType); await touchPacket(thumb, 'touchstart', 100); await pointerPacket('up', thumb, 100, 2, pointerType); await touchPacket(document.body, 'touchend', 100);
  expect(change).not.toHaveBeenCalled();
});
for (const range of [false, true]) browserCase({ source: rootSource, case: `commits last accepted ${range ? 'range' : 'scalar'} after canceled move`, environment: 'browser', issue: 'bsolid-browser' }, async () => {
  let cancel = false; const change = vi.fn((_value, details) => { if (cancel) details.cancel(); }); const commit = vi.fn();
  const view = await packetSlider({ defaultValue: range ? [20, 80] : 20, onValueChange: change, onValueCommitted: commit }); const thumb = view.getByTestId('thumb-0');
  vi.spyOn(thumb, 'getBoundingClientRect').mockReturnValue(new DOMRect(20, 0, 0, 0));
  await pointerPacket('down', thumb, 20, 1); await pointerPacket('move', document.body, 40, 2); cancel = true;
  await pointerPacket('move', document.body, 60, 3); await pointerPacket('up', document.body, 60, 4);
  expect(change).toHaveBeenCalledTimes(2); expect(commit).toHaveBeenCalledTimes(1); expect(commit.mock.calls[0][0]).toEqual(range ? [40, 80] : 40); expect(view.values()).toEqual(range ? [40, 80] : [40]);
});
for (const interaction of ['track', 'drag']) browserCase({ source: rootSource, case: `does not commit canceled ${interaction}`, environment: 'browser', issue: 'bsolid-browser' }, async () => {
  let cancel = false; const change = vi.fn((_value, details) => { if (cancel) details.cancel(); }); const commit = vi.fn();
  const view = await packetSlider({ defaultValue: 0, onValueChange: change, onValueCommitted: commit });
  await pointerPacket('down', view.control, 10, 1); await pointerPacket('up', view.control, 10, 2); expect(commit).toHaveBeenCalledExactlyOnceWith(10, expect.anything()); expect(view.values()).toEqual([10]);
  const thumb = view.getByTestId('thumb-0'); vi.spyOn(thumb, 'getBoundingClientRect').mockReturnValue(new DOMRect(10, 0, 0, 0));
  cancel = true; change.mockClear(); commit.mockClear(); await pointerPacket('down', interaction === 'track' ? view.control : thumb, interaction === 'track' ? 20 : 10, 3);
  if (interaction === 'drag') await pointerPacket('move', document.body, 20, 4); await pointerPacket('up', document.body, 20, 5);
  expect(change).toHaveBeenCalledTimes(1); expect(change.mock.calls[0][0]).toBe(20); expect(commit).not.toHaveBeenCalled(); expect(view.values()).toEqual([10]);
});
browserCase({ source: rootSource, case: 'unchanged thumb press does not commit', environment: 'browser', issue: 'bsolid-browser' }, async () => {
  const change = vi.fn(); const commit = vi.fn(); const view = await packetSlider({ defaultValue: 50, onValueChange: change, onValueCommitted: commit });
  const thumb = view.getByTestId('thumb-0'); vi.spyOn(thumb, 'getBoundingClientRect').mockReturnValue(new DOMRect(50, 0, 0, 0));
  await pointerPacket('down', thumb, 50, 1); await pointerPacket('up', document.body, 50, 2); expect(change).not.toHaveBeenCalled(); expect(commit).not.toHaveBeenCalled(); expect(view.values()).toEqual([50]);
});
browserCase({ source: rootSource, case: 'range drag then native input commits reasons', environment: 'browser', issue: 'bsolid-browser' }, async () => {
  const commit = vi.fn(); const view = await packetSlider({ defaultValue: [10, 20], onValueCommitted: commit }); const [first, second] = view.getAllByRole('slider');
  await pointerPacket('down', second, 20, 1); await pointerPacket('move', second, 30, 2); expect(commit).not.toHaveBeenCalled();
  await pointerPacket('up', second, 30, 3); expect(commit).toHaveBeenCalledTimes(1); expect(commit.mock.lastCall?.[1].reason).toBe('drag');
  first.focus(); fireEvent.input(first, { target: { value: '23' } }); await Promise.resolve(); expect(commit).toHaveBeenCalledTimes(2); expect(commit.mock.lastCall?.[1].reason).toBe('input-change');
});
for (const eventName of ['touchend', 'touchcancel'] as const) it.skipIf(typeof Touch === 'undefined')(`source Control ignores other finger ${eventName}`, async () => {
  const change = vi.fn(); const commit = vi.fn(); const view = await packetSlider({ onValueChange: change, onValueCommitted: commit });
  await pointerPacket('down', view.control, 40, 1, 'touch'); await touchPacket(view.control, 'touchstart', 40); await touchPacket(document.body, 'touchmove', 70);
  await touchPacket(document.body, 'touchstart', 90, 0, 2); await touchPacket(document.body, eventName, 90, 0, 2);
  expect(commit).not.toHaveBeenCalled(); expect(view.control).toHaveAttribute('data-dragging');
  await touchPacket(document.body, 'touchmove', 80); expect(change.mock.lastCall?.[0]).toBe(80); await touchPacket(document.body, 'touchcancel', 80);
  expect(commit).toHaveBeenCalledExactlyOnceWith(80, expect.objectContaining({ reason: 'drag' })); expect(view.control).not.toHaveAttribute('data-dragging');
});
for (const pointerType of ['mouse', 'pen']) it.skipIf(typeof Touch === 'undefined')(`source Control canceled ${pointerType} after disabled touch`, async () => {
  const change = vi.fn(); const commit = vi.fn(); const view = await packetSlider({ onValueChange: change, onValueCommitted: commit });
  await pointerPacket('down', view.control, 40, 1, 'touch'); await touchPacket(view.control, 'touchstart', 40); await view.setProps({ disabled: true }); await touchPacket(document.body, 'touchcancel', 40); await view.setProps({ disabled: false });
  await pointerPacket('down', view.control, 50, 2, pointerType, 7); await pointerPacket('move', document.body, 70, 3, pointerType, 7); await pointerPacket('cancel', document.body, 70, 4, pointerType, 7);
  expect(commit).toHaveBeenCalledExactlyOnceWith(70, expect.objectContaining({ reason: 'drag' })); expect(view.control).not.toHaveAttribute('data-dragging'); change.mockClear();
  await pointerPacket('move', document.body, 90, 5, pointerType, 7); await pointerPacket('up', document.body, 90, 6, pointerType, 7); expect(change).not.toHaveBeenCalled(); expect(commit).toHaveBeenCalledTimes(1);
});
browserCase({ source: rootSource, case: 'three thumbs intended drag', environment: 'browser', issue: 'bsolid-browser' }, async () => {
  const change = vi.fn(); const view = await packetSlider({ defaultValue: [10, 40, 60], onValueChange: change }); const thumb = view.getByTestId('thumb-2');
  vi.spyOn(thumb, 'getBoundingClientRect').mockReturnValue(new DOMRect(60, 0, 0, 0)); await pointerPacket('down', thumb, 60, 1); await pointerPacket('move', document, 80, 2);
  expect(change.mock.calls.length).toBeGreaterThan(0); expect(change.mock.lastCall?.[1].activeThumbIndex).toBe(2); expect(change.mock.lastCall?.[0][0]).toBe(10); expect(change.mock.lastCall?.[0][1]).toBe(40); expect(change.mock.lastCall?.[0][2]).not.toBe(60); await pointerPacket('up', document, 80, 3);
});
for (const interaction of ['thumb drag', 'track press']) browserCase({ source: rootSource, case: `logical focus after swap ${interaction}`, environment: 'browser', issue: 'bsolid-browser' }, async () => {
  const change = vi.fn(); const commit = vi.fn(); const view = await packetSlider({ defaultValue: [20, 40], thumbCollisionBehavior: 'swap', onValueChange: change, onValueCommitted: commit });
  for (const index of [0, 1]) vi.spyOn(view.getByTestId(`thumb-${index}`), 'getBoundingClientRect').mockReturnValue(new DOMRect(index ? 40 : 20, 0, 0, 0));
  await pointerPacket('down', interaction === 'thumb drag' ? view.getByTestId('thumb-0') : view.control, 20, 1); await pointerPacket('move', document.body, 70, 2);
  expect(view.getAllByRole('slider')[1]).toHaveFocus(); expect(change.mock.lastCall?.[0]).toEqual([40, 70]); expect(change.mock.lastCall?.[1].activeThumbIndex).toBe(1);
  await pointerPacket('up', document.body, 70, 3); expect(commit).toHaveBeenCalledWith([40, 70], expect.objectContaining({ reason: 'drag' }));
});
for (const frozen of [false, true]) browserCase({ source: rootSource, case: `unchanged unsorted ${frozen ? 'readonly range' : 'range'} reports sorted copy`, environment: 'browser', issue: 'bsolid-browser' }, async () => {
  const original = frozen ? Object.freeze([2, 1]) : [2, 1]; const change = vi.fn(); const view = await packetSlider({ value: original, min: 0, max: 5, onValueChange: change });
  await pointerPacket('down', view.control, 41, 1); expect(change).toHaveBeenCalledTimes(1); expect(change.mock.calls[0][0]).not.toBe(original); expect(change.mock.calls[0][0]).toEqual([1, 2]); await pointerPacket('up', view.control, 41, 2);
});
it.skipIf(isWebKit)('source Root repeated touch sessions notify only changed range values', async () => {
  const change = vi.fn(); const view = await packetSlider({ defaultValue: [20, 30], onValueChange: change });
  for (const [start, end] of [[20, 21], [21, 22], [22, 22.1]]) {
    await touchPacket(view.control, 'touchstart', start); await touchPacket(document.body, 'touchmove', end); await touchPacket(document.body, 'touchend', end);
  }
  expect(change.mock.calls.map(([value]) => value)).toEqual([[21, 30], [22, 30]]);
});
it.skipIf(isWebKit)('source Root only tracks the same touchpoint and removes touchend listener', async () => {
  const change = vi.fn(); const commit = vi.fn(); const view = await packetSlider({ value: 0, onValueChange: change, onValueCommitted: commit });
  const add = vi.spyOn(document, 'addEventListener'); const remove = vi.spyOn(document, 'removeEventListener');
  await touchPacket(view.control, 'touchstart', 0); expect(change).not.toHaveBeenCalled(); expect(commit).not.toHaveBeenCalled();
  await touchPacket(document.body, 'touchstart', 40, 0, 2); expect(change).not.toHaveBeenCalled(); expect(commit).not.toHaveBeenCalled();
  await touchPacket(document.body, 'touchmove', 1); expect(change).toHaveBeenCalledTimes(1); expect(commit).not.toHaveBeenCalled();
  await touchPacket(document.body, 'touchmove', 41, 0, 2); expect(change).toHaveBeenCalledTimes(1); expect(commit).not.toHaveBeenCalled();
  await touchPacket(document.body, 'touchend', 2); expect(change).toHaveBeenCalledTimes(1); expect(commit).toHaveBeenCalledTimes(1); expect(commit.mock.calls[0][1].reason).toBe('drag');
  const added = add.mock.calls.filter(([type]) => type === 'touchend').map(([, listener]) => listener);
  const removed = remove.mock.calls.filter(([type]) => type === 'touchend').map(([, listener]) => listener);
  expect(added.length).toBeGreaterThan(0); expect(added.every((listener) => removed.includes(listener))).toBe(true);
  await touchPacket(document.body, 'touchstart', 80, 50, 2); await touchPacket(document.body, 'touchend', 80, 50, 2); expect(commit).toHaveBeenCalledTimes(1);
});
for (const drag of [false, true]) it.skipIf(isWebKit)(`source Root data-dragging touch modality drag=${drag}`, async () => {
  const view = await packetSlider({ defaultValue: 90 }); await touchPacket(view.control, 'touchstart', 20); await touchPacket(document.body, 'touchmove', drag ? 200 : 21);
  expect(view.control).not.toHaveAttribute('data-dragging');
  if (drag) { await touchPacket(document.body, 'touchmove', 200); expect(view.control).not.toHaveAttribute('data-dragging'); await touchPacket(document.body, 'touchmove', 200); expect(view.control).toHaveAttribute('data-dragging', ''); }
  await touchPacket(document.body, 'touchend', 0); expect(view.control).not.toHaveAttribute('data-dragging');
});
browserCase({ source: rootSource, case: 'hedges dropped mouseup and ignores duplicate coordinates', environment: 'browser', issue: 'bsolid-browser' }, async () => {
  const change = vi.fn(); const view = await packetSlider({ value: 0, onValueChange: change });
  await pointerPacket('down', view.control, 1, 1); expect(change.mock.calls.map(([value]) => value)).toEqual([1]);
  await pointerPacket('move', document.body, 10, 2); expect(change.mock.calls.map(([value]) => value)).toEqual([1, 10]);
  await pointerPacket('move', document.body, 11, 3, 'mouse', 1, 0); expect(change).toHaveBeenCalledTimes(2);
});
browserCase({ source: rootSource, case: 'only notifies changed pointer coordinates', environment: 'browser', issue: 'bsolid-browser' }, async () => {
  const change = vi.fn(); const view = await packetSlider({ defaultValue: 20, onValueChange: change });
  await pointerPacket('down', view.control, 21, 1); await pointerPacket('move', document.body, 22, 2); await pointerPacket('move', document.body, 22, 3);
  expect(change.mock.calls.map(([value]) => value)).toEqual([21, 22]); await pointerPacket('up', document.body, 22, 4);
});
it.skipIf(isWebKit)('source Root touch focuses native slider', async () => {
  const view = await packetSlider({ defaultValue: 30 }); await touchPacket(view.control, 'touchstart', 0); expect(view.getByRole('slider')).toHaveFocus(); await touchPacket(document.body, 'touchend', 0);
});
it.skipIf(isWebKit)('source Root touch does not override native or ancestor event targets', async () => {
  const change = vi.fn(); const native = vi.fn(); const ancestor = vi.fn();
  const view = await render(() => <div onTouchStart={ancestor}><Slider.Root value={0} onValueChange={change}><Slider.Control data-testid="control"><Slider.Thumb /></Slider.Control></Slider.Root></div>);
  const control = view.getByTestId('control'); vi.spyOn(control, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 100, 10)); document.addEventListener('touchstart', native);
  try {
    await touchPacket(control, 'touchstart', 0); expect(change).not.toHaveBeenCalled(); expect(native).toHaveBeenCalledTimes(1); expect(native.mock.calls[0][0].target).toBe(control); expect(ancestor).toHaveBeenCalledTimes(1); expect(ancestor.mock.calls[0][0].target).toBe(control);
    await touchPacket(document.body, 'touchend', 0);
  } finally { document.removeEventListener('touchstart', native); }
});
it.skipIf(isWebKit)('source Root focus-visible changes after pointer then keyboard without extra callbacks', async () => {
  const focus = vi.fn(); const blur = vi.fn();
  const view = await render(() => <Slider.Root defaultValue={40}><Slider.Control data-testid="control"><Slider.Thumb onFocus={focus} onBlur={blur} /></Slider.Control></Slider.Root>);
  const control = view.getByTestId('control'); vi.spyOn(control, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 100, 10)); Object.defineProperties(control, { setPointerCapture: { value: vi.fn() }, hasPointerCapture: { value: () => false } });
  await pointerPacket('down', control, 40, 1); const input = view.getByRole('slider'); await vi.waitFor(() => expect(input).toHaveFocus());
  expect(input.matches(':focus-visible')).toBe(false); expect(focus).toHaveBeenCalledTimes(1); expect(blur).not.toHaveBeenCalled();
  fireEvent.keyDown(input, { key: 'ArrowRight' }); await vi.waitFor(() => expect(input.matches(':focus-visible')).toBe(true)); expect(focus).toHaveBeenCalledTimes(1); expect(blur).not.toHaveBeenCalled(); await pointerPacket('up', control, 40, 2);
});
browserCase({ source: rootSource, case: 'keyboard changes inside shadow root', environment: 'browser', issue: 'bsolid-browser' }, async () => {
  const host = document.createElement('div'); document.body.appendChild(host); const shadow = host.attachShadow({ mode: 'open' }); const container = document.createElement('div'); shadow.appendChild(container);
  const change = vi.fn();
  try {
    const view = await render(() => <Slider.Root value={3} name="shadow" onValueChange={change}><Slider.Thumb /></Slider.Root>, { container });
    const input = shadow.querySelector<HTMLInputElement>('input[type="range"]'); expect(input).toBeTruthy();
    input!.focus(); input!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })); await Promise.resolve(); expect(change).toHaveBeenCalledTimes(1); view.unmount();
  } finally { host.remove(); }
});
for (const count of [1, 2]) browserCase({ source: thumbSource, case: `focus blur native currentTarget ${count} thumbs`, environment: 'browser', issue: 'bsolid-browser' }, async () => {
  const focus = vi.fn((event) => event.target); const blur = vi.fn((event) => event.target); const currentFocus = vi.fn(); const currentBlur = vi.fn();
  const events = { onFocus: (event: FocusEvent & { currentTarget: HTMLInputElement }) => { focus(event); currentFocus(event.currentTarget); }, onBlur: (event: FocusEvent & { currentTarget: HTMLInputElement }) => { blur(event); currentBlur(event.currentTarget); } };
  const view = await render(() => <Slider.Root defaultValue={count === 1 ? 50 : [50, 70]}><Slider.Control><Slider.Thumb {...events} />{count === 2 && <Slider.Thumb {...events} />}</Slider.Control></Slider.Root>);
  expect(document.body).toHaveFocus(); const inputs = view.getAllByRole('slider'); inputs.forEach((input) => { expect(input.tagName).toBe('INPUT'); expect(input).toHaveAttribute('type', 'range'); });
  for (let index = 0; index < count; index += 1) { await view.user.keyboard('[Tab]'); expect(inputs[index]).toHaveFocus(); expect(focus).toHaveBeenCalledTimes(index + 1); expect(focus.mock.results[index].value).toBe(inputs[index]); expect(currentFocus.mock.calls[index][0]).toBe(inputs[index]); if (index) { expect(blur).toHaveBeenCalledTimes(index); expect(blur.mock.results[index - 1].value).toBe(inputs[index - 1]); } }
  await view.user.keyboard('[Tab]'); expect(document.body).toHaveFocus(); expect(blur).toHaveBeenCalledTimes(count); expect(blur.mock.results[count - 1].value).toBe(inputs[count - 1]); expect(currentBlur.mock.calls[count - 1][0]).toBe(inputs[count - 1]);
});
browserCase({ source: thumbSource, case: 'field focus leaves range for arbitrary Control child', environment: 'browser', issue: 'bsolid-browser' }, async () => {
  const validate = vi.fn((_value: unknown) => null);
  const view = await render(() => <><FieldRoot validationMode="onBlur" validate={validate} data-testid="field"><Slider.Root defaultValue={[20, 50]}><Slider.Control><Slider.Thumb index={0} /><Slider.Thumb index={1} /><button type="button">Help</button></Slider.Control></Slider.Root></FieldRoot><button type="button">Outside</button></>);
  const [first, second] = view.getAllByRole('slider'); await view.user.keyboard('[Tab]'); expect(first).toHaveFocus(); validate.mockClear();
  await view.user.keyboard('[Tab]'); expect(second).toHaveFocus(); expect(validate).not.toHaveBeenCalled();
  await view.user.keyboard('[Tab]'); expect(view.getByRole('button', { name: 'Help' })).toHaveFocus(); await vi.waitFor(() => expect(validate).toHaveBeenCalledTimes(1));
  expect(view.getByTestId('field')).toHaveAttribute('data-touched'); expect(view.getByTestId('field')).not.toHaveAttribute('data-focused');
  await view.user.keyboard('[Tab]'); expect(view.getByRole('button', { name: 'Outside' })).toHaveFocus(); expect(validate).toHaveBeenCalledTimes(1);
});
browserCase({ source: thumbSource, case: 'field validation waits until range tab exit', environment: 'browser', issue: 'bsolid-browser' }, async () => {
  const validate = vi.fn((_value: unknown) => null);
  const view = await render(() => <FieldRoot validationMode="onBlur" validate={validate}><Slider.Root defaultValue={[20, 50]}><Slider.Thumb index={0} /><Slider.Thumb index={1} /></Slider.Root></FieldRoot>);
  const [first, second] = view.getAllByRole('slider'); await view.user.keyboard('[Tab]'); expect(first).toHaveFocus(); validate.mockClear(); await view.user.keyboard('[Tab]'); expect(second).toHaveFocus(); expect(validate).not.toHaveBeenCalled(); await view.user.keyboard('[Tab]'); expect(second).not.toHaveFocus(); await vi.waitFor(() => expect(validate).toHaveBeenCalledTimes(1));
});
for (const scenario of ['removed', 'valid shrink', 'grow'] as const) browserCase({ source: controlSource, case: `range resize mid-drag ${scenario}`, environment: 'browser', issue: 'bsolid-browser' }, async () => {
  const change = vi.fn(); const commit = vi.fn(); const view = await packetSlider({ value: scenario === 'grow' ? [10, 20] : [10, 20, 30], onValueChange: change, onValueCommitted: commit }, { accept: scenario === 'grow', sourceLayout: true });
  const index = scenario === 'removed' ? 2 : 1; const thumb = view.getByTestId(`thumb-${index}`);
  await pointerPacket('down', thumb, index === 2 ? 30 : 20, 1); await pointerPacket('move', document.body, scenario === 'removed' ? 50 : 40, 2); expect(change).toHaveBeenCalled();
  if (scenario !== 'grow') expect(change.mock.lastCall?.[0]).toHaveLength(3);
  if (scenario === 'removed') expect(change).toHaveBeenCalledWith([10, 20, 100], expect.objectContaining({ reason: 'drag' }));
  await view.setProps({ value: scenario === 'grow' ? [10, 20, 30] : [10, 20] }); expect(view.getAllByRole('slider')).toHaveLength(scenario === 'grow' ? 3 : 2); change.mockClear(); commit.mockClear();
  if (scenario === 'removed') await pointerPacket('move', document.body, 50, 3);
  await pointerPacket('up', document.body, 40, 4); expect(commit).not.toHaveBeenCalled(); if (scenario === 'removed') expect(change).not.toHaveBeenCalled();
  if (scenario === 'grow') { await pointerPacket('down', view.getByTestId('thumb-2'), 30, 5); await pointerPacket('move', document.body, 80, 6); await pointerPacket('up', document.body, 80, 7); expect(change.mock.lastCall?.[0]).toEqual([10, 20, 100]); expect(commit).toHaveBeenCalledWith(change.mock.lastCall?.[0], expect.objectContaining({ reason: 'drag' })); }
});
browserCase({ source: rootSource, case: 'controlled scalar handlers track then input', environment: 'browser', issue: 'bsolid-browser' }, async () => {
  const change = vi.fn(); const commit = vi.fn(); const view = await packetSlider({ value: 0, onValueChange: change, onValueCommitted: commit });
  await pointerPacket('down', view.control, 10, 1); await pointerPacket('up', view.control, 10, 2); expect(change).toHaveBeenCalledTimes(1); expect(change.mock.calls[0][0]).toBe(10); expect(change.mock.calls[0][1].activeThumbIndex).toBe(0); expect(commit).toHaveBeenCalledTimes(1); expect(commit.mock.calls[0][0]).toBe(10); expect(commit.mock.calls[0][1].reason).toBe('track-press');
  const input = view.getByRole('slider'); input.focus(); fireEvent.input(input, { target: { value: '23' } }); await Promise.resolve(); expect(change).toHaveBeenCalledTimes(2); expect(commit).toHaveBeenCalledTimes(2); expect(commit.mock.calls[1][1].reason).toBe('input-change');
});
browserCase({ source: rootSource, case: 'control click calls change once', environment: 'browser', issue: 'bsolid-browser' }, async () => {
  const change = vi.fn(); const view = await packetSlider({ defaultValue: 50, onValueChange: change }); await pointerPacket('down', view.control, 41, 1); expect(change).toHaveBeenCalledTimes(1); await pointerPacket('up', view.control, 41, 2);
});
browserCase({ source: rootSource, case: 'release differing coordinate commits last changed value with exact counts', environment: 'browser', issue: 'bsolid-browser' }, async () => {
  const change = vi.fn(); const commit = vi.fn(); const view = await packetSlider({ defaultValue: 0, onValueChange: change, onValueCommitted: commit });
  await pointerPacket('down', view.control, 10, 1); await pointerPacket('move', view.control, 15, 2); await pointerPacket('up', view.control, 20, 3);
  expect(change.mock.calls.map(([value]) => value)).toEqual([10, 15]); expect(commit).toHaveBeenCalledExactlyOnceWith(15, expect.objectContaining({ reason: 'drag' }));
});
browserCase({ source: rootSource, case: 'canceled swap retains original input focus and attempted active index', environment: 'browser', issue: 'bsolid-browser' }, async () => {
  const change = vi.fn((value, details) => { if (Array.isArray(value) && value[1] === 70) details.cancel(); }); const commit = vi.fn(); const view = await packetSlider({ defaultValue: [20, 40], thumbCollisionBehavior: 'swap', onValueChange: change, onValueCommitted: commit });
  const first = view.getAllByRole('slider')[0]; const thumb = view.getByTestId('thumb-0'); vi.spyOn(thumb, 'getBoundingClientRect').mockReturnValue(new DOMRect(20, 0, 0, 0)); first.focus();
  await pointerPacket('down', thumb, 20, 1); await pointerPacket('move', document.body, 70, 2); expect(first).toHaveFocus(); expect(change.mock.lastCall?.[1].activeThumbIndex).toBe(1);
  await pointerPacket('move', document.body, 30, 3); await pointerPacket('up', document.body, 30, 4); expect(change.mock.lastCall?.[0]).toEqual([30, 40]); expect(change.mock.lastCall?.[1].activeThumbIndex).toBe(0); expect(commit).toHaveBeenCalledWith([30, 40], expect.objectContaining({ reason: 'drag' }));
});
it.skipIf(typeof Touch === 'undefined')('source Control touchcancel clears scalar fallback and later outside gesture', async () => {
  const change = vi.fn(); const commit = vi.fn(); const view = await packetSlider({ defaultValue: 20, onValueChange: change, onValueCommitted: commit });
  await pointerPacket('down', view.control, 40, 1, 'touch'); await touchPacket(view.control, 'touchstart', 40); await pointerPacket('cancel', document.body, 40, 2, 'touch'); await touchPacket(document.body, 'touchmove', 70); expect(change.mock.lastCall?.[0]).toBe(70); await touchPacket(document.body, 'touchcancel', 70);
  expect(commit).toHaveBeenCalledTimes(1); expect(commit.mock.calls[0][0]).toBe(70); expect(view.control).not.toHaveAttribute('data-dragging'); change.mockClear();
  await pointerPacket('down', document.body, 90, 3, 'touch', 2); await touchPacket(document.body, 'touchstart', 90, 0, 2); await touchPacket(document.body, 'touchmove', 90, 0, 2); await pointerPacket('up', document.body, 90, 4, 'touch', 2); await touchPacket(document.body, 'touchend', 90, 0, 2); expect(change).not.toHaveBeenCalled(); expect(commit).toHaveBeenCalledTimes(1);
});
browserCase({ source: thumbSource, case: 'restoring focus-visible does not emit extra focus or blur', environment: 'browser', issue: 'bsolid-browser' }, async () => {
  const focus = vi.fn((event) => event.target); const blur = vi.fn(); const view = await render(() => <Slider.Root defaultValue={40}><Slider.Control data-testid="control"><Slider.Thumb onFocus={focus} onBlur={blur} /></Slider.Control></Slider.Root>);
  const control = view.getByTestId('control'); vi.spyOn(control, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 100, 10)); Object.defineProperties(control, { setPointerCapture: { value: vi.fn() }, hasPointerCapture: { value: () => false } });
  await pointerPacket('down', control, 40, 1); const input = view.getByRole('slider'); await vi.waitFor(() => expect(input).toHaveFocus()); expect(focus).toHaveBeenCalledTimes(1); expect(focus.mock.results[0].value).toBe(input); expect(blur).not.toHaveBeenCalled();
  fireEvent.keyDown(input, { key: 'ArrowRight' }); await Promise.resolve(); expect(focus).toHaveBeenCalledTimes(1); expect(blur).not.toHaveBeenCalled(); await pointerPacket('up', control, 40, 2);
});
browserCase({ source: rootSource, case: 'real Chromium scalar touch track tap', environment: 'browser', issue: 'bsolid-browser' }, async () => {
  const commit = vi.fn(); const view = await render(() => <Slider.Root defaultValue={0} onValueCommitted={commit}><Slider.Control data-testid="control" style={{ width: '200px', height: '20px' }}><Slider.Thumb style={{ width: '10px', height: '10px' }} /></Slider.Control></Slider.Root>);
  const point = pagePoint(view.getByTestId('control').getBoundingClientRect(), 0.5); const session = cdp();
  await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [point] }); await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await vi.waitFor(() => expect(commit).toHaveBeenCalledTimes(1)); expect(commit.mock.calls[0][0]).toBe(50);
});
for (const range of [false, true]) browserCase({ source: thumbSource, case: `edge positions after becoming visible range=${range}`, environment: 'browser', issue: 'bsolid-browser' }, async () => {
  const view = await renderProps((props: { visible: boolean }) => <div style={{ display: props.visible ? 'block' : 'none' }}><Slider.Root defaultValue={range ? [30, 70] : 30} thumbAlignment="edge" style={{ width: '100px' }}>
    <Slider.Control style={{ position: 'relative', width: '100%', height: '10px' }}><Slider.Track style={{ position: 'relative', width: '100%', height: '10px' }}><Slider.Indicator data-testid="indicator" /><Slider.Thumb data-testid="first" style={{ width: '10px', height: '10px' }} />{range && <Slider.Thumb data-testid="second" style={{ width: '10px', height: '10px' }} />}</Slider.Track></Slider.Control></Slider.Root></div>, { visible: false });
  const first = view.getByTestId('first'); const indicator = view.getByTestId('indicator');
  await vi.waitFor(() => expect(first.style.visibility).toBe('hidden')); expect(first.style.getPropertyValue('--position')).toBe('0%'); expect(indicator.style.visibility).toBe('hidden'); expect(indicator.style.getPropertyValue('--start-position')).toBe('0%');
  if (range) { expect(view.getByTestId('second').style.visibility).toBe('hidden'); expect(view.getByTestId('second').style.getPropertyValue('--position')).toBe('0%'); expect(indicator.style.getPropertyValue('--relative-size')).toBe('0%'); }
  await view.setProps({ visible: true }); await vi.waitFor(() => expect(first.style.visibility).toBe('')); expect(first.style.getPropertyValue('--position')).toBe('32%'); expect(indicator.style.visibility).toBe(''); expect(indicator.style.getPropertyValue('--start-position')).toBe('32%');
  if (range) { expect(view.getByTestId('second').style.visibility).toBe(''); expect(view.getByTestId('second').style.getPropertyValue('--position')).toBe('68%'); expect(indicator.style.getPropertyValue('--relative-size')).toBe('36%'); }
});
for (const range of [false, true]) it.skipIf(isWebKit || typeof Touch === 'undefined')(`source Thumb computed drag positioning range=${range}`, async () => {
  const view = await render(() => <Slider.Root defaultValue={range ? [20, 40] : undefined} style={{ width: '1000px' }}><Slider.Control data-testid="control"><Slider.Track><Slider.Indicator /><Slider.Thumb data-testid="first" />{range && <Slider.Thumb data-testid="second" />}</Slider.Track></Slider.Control></Slider.Root>);
  const control = view.getByTestId('control'); vi.spyOn(control, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 1000, 10));
  const first = view.getByTestId('first'); const active = range ? view.getByTestId('second') : first;
  await touchPacket(control, 'touchstart', range ? 400 : 20); for (let index = 0; index < 3; index += 1) await touchPacket(document.body, 'touchmove', range ? 699 : 199);
  expect(getComputedStyle(active).left).toBe(range ? '700px' : '200px'); await touchPacket(document.body, 'touchend', 0); expect(getComputedStyle(active).left).toBe(range ? '700px' : '200px'); if (range) expect(getComputedStyle(first).left).toBe('200px');
});
for (const [behavior, expected, points, initial, distance] of [
  ['none', [40, 40], [600], [20, 40], 0], ['push', [65, 65], [650], [20, 40], 0], ['swap', [40, 70], [700], [20, 40], 0], ['swap', [30, 50, 80], [500, 550, 800], [20, 40, 60], 10],
] as const) it.skipIf(isWebKit || typeof Touch === 'undefined')(`source Thumb touch collision ${behavior}/${distance}`, async () => {
  const view = await render(() => <Slider.Root defaultValue={initial} minStepsBetweenValues={distance} thumbCollisionBehavior={behavior} style={{ width: '1000px' }}><Slider.Control data-testid="control"><Slider.Track><Slider.Indicator /><Slider.Thumb index={0} /><Slider.Thumb index={1} />{initial.length > 2 && <Slider.Thumb index={2} />}</Slider.Track></Slider.Control></Slider.Root>);
  const control = view.getByTestId('control'); vi.spyOn(control, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 1000, 10)); await touchPacket(control, 'touchstart', 200);
  for (const point of points) await touchPacket(document.body, 'touchmove', point); await touchPacket(document.body, 'touchend', points[points.length - 1]);
  expect(view.getAllByRole('slider').map((input) => Number(input.getAttribute('aria-valuenow')))).toEqual(expected);
});
for (const range of [false, true]) it.skipIf(isWebKit || typeof Touch === 'undefined')(`source Thumb controlled external computed position range=${range}`, async () => {
  const view = await renderProps<SliderRootProps>((props) => <Slider.Root {...props} style={{ width: '100px' }}><Slider.Control><Slider.Track><Slider.Indicator /><Slider.Thumb data-testid="first" />{range && <Slider.Thumb data-testid="second" />}</Slider.Track></Slider.Control></Slider.Root>, { value: range ? [20, 50] : 20 });
  expect(getComputedStyle(view.getByTestId('first')).left).toBe('20px'); if (range) expect(getComputedStyle(view.getByTestId('second')).left).toBe('50px');
  await view.setProps({ value: range ? [33, 72] : 55 }); expect(getComputedStyle(view.getByTestId('first')).left).toBe(range ? '33px' : '55px'); if (range) expect(getComputedStyle(view.getByTestId('second')).left).toBe('72px');
});
it.skipIf(isWebKit || typeof Touch === 'undefined')('source Thumb external out-of-bounds computed position', async () => {
  const view = await renderProps<SliderRootProps>((props) => <Slider.Root {...props} style={{ width: '100px' }}><Slider.Control><Slider.Track><Slider.Thumb data-testid="thumb" /></Slider.Track></Slider.Control></Slider.Root>, { value: 50, min: 0, max: 100 });
  expect(getComputedStyle(view.getByTestId('thumb')).left).toBe('50px'); await view.setProps({ value: 119.9 }); expect(getComputedStyle(view.getByTestId('thumb')).left).toBe('100px'); await view.setProps({ value: -7.31 }); expect(getComputedStyle(view.getByTestId('thumb')).left).toBe('0px');
});
it.skipIf(typeof Touch === 'undefined')('source Control text node touch origin and no-thumb touch are safe', async () => {
  const change = vi.fn(); const emptyChange = vi.fn();
  const view = await render(() => <><Slider.Root defaultValue={20} onValueChange={change}><Slider.Control data-testid="control"><span data-testid="text">Track</span><Slider.Thumb /></Slider.Control></Slider.Root><Slider.Root defaultValue={20} thumbAlignment="edge-client-only" onValueChange={emptyChange}><Slider.Control data-testid="empty" /></Slider.Root></>);
  const control = view.getByTestId('control'); vi.spyOn(control, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 100, 10));
  const event = new TouchEvent('touchstart', { bubbles: true, cancelable: true, changedTouches: [new Touch({ target: document.body, identifier: 1, clientX: 60, clientY: 0 })] });
  view.getByTestId('text').firstChild!.dispatchEvent(event); await Promise.resolve(); expect(change).toHaveBeenCalledWith(60, expect.objectContaining({ activeThumbIndex: 0, reason: 'track-press' })); await touchPacket(document.body, 'touchend', 60);
  await touchPacket(view.getByTestId('empty'), 'touchstart', 60); await touchPacket(document.body, 'touchmove', 80); expect(emptyChange).not.toHaveBeenCalled(); await touchPacket(document.body, 'touchend', 80);
});
browserCase({ source: 'packages/react/src/slider/root/SliderRoot.test.tsx', case: 'commits a real Chromium touch track tap', environment: 'browser', issue: 'bsolid-browser' }, async () => {
  const commit = vi.fn();
  const view = await render(() => <Slider.Root defaultValue={[0]} onValueCommitted={commit}>
    <Slider.Control data-testid="control" style={{ position: 'relative', width: '200px', height: '20px' }}><Slider.Thumb style={{ width: '10px', height: '10px' }} /></Slider.Control>
  </Slider.Root>);
  const point = pagePoint(view.getByTestId('control').getBoundingClientRect(), 0.5); const session = cdp();
  await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [point] });
  await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await vi.waitFor(() => expect(commit).toHaveBeenCalledTimes(1));
  expect(commit.mock.calls[0][0]).toEqual([50]);
});
