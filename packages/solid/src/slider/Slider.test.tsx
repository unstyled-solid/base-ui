import { describe, expect, it, vi } from 'vitest';
import { flush, createSignal } from 'solid-js';
import { createRenderer, fireEvent, firePointer, browserCase, expectDiagnostic, isJSDOM } from '../../test';
import { Slider } from './index';
import type { SliderRootProps } from './root/SliderRoot';
import { DirectionContext } from '../internals/direction-context/DirectionContext';

const { render, renderProps } = createRenderer();
it('Slider warns when max is not greater than min', async () => {
  await expectDiagnostic({ message: /^Base UI: Slider `max` must be greater than `min`\.$/ }, async () => {
    await render(() => <Fixture defaultValue={10} min={10} max={10} />);
  });
});
function Fixture(props: SliderRootProps) {
  const shape = () => props.value ?? props.defaultValue;
  return <Slider.Root {...props}>
    <Slider.Label data-testid="label">Volume</Slider.Label><Slider.Value data-testid="value" />
    <Slider.Control data-testid="control" style={{ position: 'relative', width: '100px', height: '100px' }}>
      <Slider.Track style={{ width: '100%', height: '100%' }}><Slider.Indicator data-testid="indicator" /><Slider.Thumb index={0} data-testid="thumb" style={{ width: '10px', height: '10px' }} />
        {Array.isArray(shape()) && (shape() as readonly number[]).length > 1 && <Slider.Thumb index={1} style={{ width: '10px', height: '10px' }} />}
      </Slider.Track>
    </Slider.Control>
  </Slider.Root>;
}
describe('Slider source model and native keyboard transactions', () => {
  it('sorts/clamps frozen consumer values, associates output, and submits native values', async () => {
    const values = Object.freeze([120, -20]);
    const view = await render(() => <><form id="external" /><Fixture value={values} name="volume" form="external" /></>);
    const inputs = view.getAllByRole('slider') as HTMLInputElement[];
    expect(inputs.map((input) => input.value)).toEqual(['0', '100']);
    expect(values).toEqual([120, -20]);
    expect(view.getByTestId('value')).toHaveAttribute('for', inputs.map((input) => input.id).join(' '));
    expect(new FormData(view.container.querySelector('form')!).getAll('volume')).toEqual(['0', '100']);
  });
  it('keeps current callbacks and formatting on the same host', async () => {
    const old = vi.fn(); const current = vi.fn();
    const view = await renderProps<SliderRootProps>((props) => <Fixture {...props} />, { defaultValue: 40, onValueChange: old });
    const input = view.getByRole('slider');
    await view.setProps({ onValueChange: current, locale: 'de-DE', format: { style: 'currency', currency: 'EUR' } });
    fireEvent.keyDown(input, { key: 'ArrowRight' }); flush();
    expect(old).not.toHaveBeenCalled(); expect(current.mock.calls[0][0]).toBe(41);
    expect(view.getByRole('slider')).toBe(input);
    expect(view.getByTestId('value').textContent).toBe(new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(41));
  });
  for (const direction of ['ltr', 'rtl'] as const) for (const orientation of ['horizontal', 'vertical'] as const) {
    it(`${direction}/${orientation} keyboard matrix and explicit staged candidates`, async () => {
      const commit = vi.fn();
      const view = await render(() => <DirectionContext value={() => direction}><Fixture defaultValue={20} orientation={orientation} step={2} largeStep={5} onValueCommitted={commit} /></DirectionContext>);
      const input = view.getByRole('slider');
      fireEvent.keyDown(input, { key: direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight' });
      fireEvent.keyDown(input, { key: 'PageUp' }); flush();
      expect(commit.mock.calls.map((call) => call[0])).toEqual([22, 27]);
      fireEvent.keyDown(input, { key: 'Home' }); flush(); expect(input).toHaveAttribute('aria-valuenow', '0');
      fireEvent.keyDown(input, { key: 'End' }); flush(); expect(input).toHaveAttribute('aria-valuenow', '100');
    });
    for (const key of ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'PageUp', 'PageDown']) {
      for (const shift of [false, true]) {
        it(`${direction}/${orientation}/${key}/shift=${shift} source increment matrix`, async () => {
          const change = vi.fn();
          const view = await render(() => <DirectionContext value={() => direction}>
            <Fixture defaultValue={20} orientation={orientation} largeStep={5} onValueChange={change} />
          </DirectionContext>);
          const positive = key === 'ArrowUp' || key === 'PageUp' || (key === 'ArrowRight' && direction === 'ltr') || (key === 'ArrowLeft' && direction === 'rtl');
          await view.user.keyboard('[Tab]'); expect(view.getByRole('slider')).toHaveFocus();
          fireEvent.keyDown(view.getByRole('slider'), { key, shiftKey: shift }); flush();
          expect(view.getByRole('slider')).toHaveAttribute('aria-valuenow', String(20 + (positive ? 1 : -1) * (shift || key.startsWith('Page') ? 5 : 1)));
          expect(change).toHaveBeenCalledTimes(1); expect(change.mock.calls[0][0]).toBe(20 + (positive ? 1 : -1) * (shift || key.startsWith('Page') ? 5 : 1));
        });
      }
    }
    for (const key of ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'PageUp', 'PageDown', 'Home', 'End']) {
      const positive = key === 'ArrowUp' || key === 'PageUp' || key === 'End' || (key === 'ArrowRight' && direction === 'ltr') || (key === 'ArrowLeft' && direction === 'rtl');
      const profiles = key === 'Home' || key === 'End'
        ? [{ name: 'single bound', value: 20, min: 17, max: 77, step: 1, largeStep: 5, shift: false, expected: positive ? 77 : 17 }]
        : key.startsWith('Page')
          ? [{ name: 'page grid', value: 20, min: 0, max: 100, step: 2, largeStep: 5, shift: false, expected: positive ? 25 : 15 },
            { name: 'page bound', value: 20, min: 17, max: 21, step: 1, largeStep: 5, shift: false, expected: positive ? 21 : 17 }]
          : [{ name: 'large step', value: 20, min: 0, max: 100, step: 1, largeStep: 10, shift: true, expected: positive ? 30 : 10 },
            { name: 'shift bound', value: 20, min: 15, max: 21, step: 1, largeStep: 10, shift: true, expected: positive ? 21 : 15 },
            ...(positive ? [{ name: 'fractional grid', value: 0.2, min: 0, max: 1, step: 0.1, largeStep: 10, shift: false, expected: 0.3 }] : [])];
      for (const profile of profiles) it(`${direction}/${orientation}/${key}/${profile.name} source keyboard assertions`, async () => {
        const change = vi.fn();
        const view = await render(() => <div dir={direction}><DirectionContext value={() => direction}>
          <Fixture defaultValue={profile.value} orientation={orientation} min={profile.min} max={profile.max} step={profile.step} largeStep={profile.largeStep} onValueChange={change} />
        </DirectionContext></div>);
        const input = view.getByRole('slider'); await view.user.keyboard('[Tab]'); expect(input).toHaveFocus();
        await view.user.keyboard(profile.shift ? `{Shift>}[${key}]{/Shift}` : `[${key}]`);
        expect(change).toHaveBeenCalledTimes(1); expect(change.mock.calls[0][0]).toBe(profile.expected);
        expect(input).toHaveAttribute('aria-valuenow', String(profile.expected));
      });
    }
    for (const key of ['Home', 'End'] as const) it(`${direction}/${orientation}/${key} range bounds and repeated no-op`, async () => {
      const change = vi.fn();
      // Upstream's range fixtures deliberately omit orientation even inside the
      // orientation describe; preserve that input, rather than infer vertical.
      const view = await render(() => <div dir={direction}><DirectionContext value={() => direction}><Fixture defaultValue={[20, 50]} min={key === 'Home' ? 7 : 0} max={key === 'End' ? 77 : 100} onValueChange={change} /></DirectionContext></div>);
      const [first, second] = view.getAllByRole('slider');
      await view.user.keyboard(key === 'Home' ? '[Tab][Tab]' : '[Tab]'); expect(key === 'Home' ? second : first).toHaveFocus();
      await view.user.keyboard(`[${key}]`);
      expect(change).toHaveBeenCalledTimes(1); expect(change.mock.calls[0][0]).toEqual(key === 'Home' ? [20, 20] : [50, 50]);
      await view.user.keyboard(`[${key}]`); expect(change).toHaveBeenCalledTimes(1);
      await view.user.keyboard(key === 'Home' ? '{Shift>}[Tab]{/Shift}' : '[Tab]'); expect(key === 'Home' ? first : second).toHaveFocus();
      await view.user.keyboard(`[${key}]`); expect(change).toHaveBeenCalledTimes(2);
      expect(change.mock.calls[1][0]).toEqual(key === 'Home' ? [7, 20] : [50, 77]);
    });
  }
  it.each([
    { value: 0.2, min: 0, max: 1, step: 0.1, expected: '0.3' },
    { value: 0.25, min: 0.25, max: 1, step: 0.1, expected: '0.35' },
    { value: 5.4698, min: 0, max: 10, step: 1, expected: '6' },
    { value: 1e-8, min: 0, max: 1e-7, step: 1e-8, expected: '2e-8' },
  ])('corrects invalid/off-grid values and preserves fractional origin $value', async ({ value, min, max, step, expected }) => {
    const view = await render(() => <Fixture defaultValue={value} min={min} max={max} step={step} />);
    fireEvent.keyDown(view.getByRole('slider'), { key: 'ArrowRight' }); flush();
    expect(view.getByRole('slider')).toHaveAttribute('aria-valuenow', expected);
  });
  it('suppresses canceled and no-op commits while retaining original native targets', async () => {
    const commit = vi.fn(); const change = vi.fn((_value, details) => details.cancel());
    const view = await render(() => <Fixture defaultValue={100} onValueChange={change} onValueCommitted={commit} />);
    const input = view.getByRole('slider');
    fireEvent.keyDown(input, { key: 'End' }); fireEvent.keyDown(input, { key: 'ArrowLeft' }); flush();
    expect(change).toHaveBeenCalledTimes(1); expect(change.mock.calls[0][1].event.target).toBe(input);
    expect(commit).not.toHaveBeenCalled(); expect(input).toHaveAttribute('aria-valuenow', '100');
  });
  it('enforces range minimum distance for Home/End', async () => {
    const view = await render(() => <Fixture defaultValue={[20, 50]} minStepsBetweenValues={5} />);
    const [first, second] = view.getAllByRole('slider');
    fireEvent.keyDown(first, { key: 'End' }); flush(); expect(first).toHaveAttribute('aria-valuenow', '45');
    fireEvent.keyDown(second, { key: 'Home' }); flush(); expect(second).toHaveAttribute('aria-valuenow', '50');
  });
  it('preserves input siblings and focus currentTarget under render callbacks', async () => {
    const focus = vi.fn();
    const view = await render(() => <Slider.Root defaultValue={25}><Slider.Control><Slider.Thumb
      render={(props) => <section {...props} />} onFocus={(event) => focus(event.currentTarget)}>
      <span data-testid="child" />
    </Slider.Thumb></Slider.Control></Slider.Root>);
    const input = view.getByRole('slider'); input.focus(); flush();
    expect(focus).toHaveBeenCalledWith(input); expect(input.parentElement).toBe(view.getByTestId('child').parentElement);
  });
  it('commits the accepted pointer candidate on release, not release coordinates', async () => {
    const committed = vi.fn();
    const view = await render(() => <Fixture defaultValue={20} onValueCommitted={committed} />);
    const control = view.getByTestId('control');
    vi.spyOn(control, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 100, 10));
    firePointer.down(control, { timeStamp: 1, button: 0, buttons: 1, clientX: 30 });
    firePointer.move(document.body, { timeStamp: 2, buttons: 1, clientX: 60 });
    firePointer.up(document.body, { timeStamp: 3, buttons: 0, clientX: 90 }); flush();
    expect(committed).toHaveBeenCalledExactlyOnceWith(60, expect.objectContaining({ reason: 'drag' }));
  });
});
it('Slider range minimum steps rejects repeated neighbor crossings', async () => {
  const change = vi.fn();
  const view = await render(() => <Fixture defaultValue={[44, 50]} step={2} minStepsBetweenValues={2} onValueChange={change} />);
  await view.user.keyboard('[Tab][ArrowUp]'); expect(change).toHaveBeenCalledTimes(1); expect(change.mock.calls[0][0]).toEqual([46, 50]);
  await view.user.keyboard('[ArrowUp]'); expect(change).toHaveBeenCalledTimes(1);
  await view.user.keyboard('[Tab][ArrowUp]'); expect(change).toHaveBeenCalledTimes(2); expect(change.mock.calls[1][0]).toEqual([46, 52]);
  await view.user.keyboard('[ArrowDown][ArrowDown]'); expect(change).toHaveBeenCalledTimes(3); expect(change.mock.calls[2][0]).toEqual([46, 50]);
});
it.each([{ value: 100, step: 100, max: 200, min: 0, key: 'ArrowRight', expected: '200' }, { value: 1, step: 1, max: 100, min: 0, key: 'ArrowLeft', expected: '0' }])('Slider stops repeated $key at $expected', async ({ value, step, max, min, key, expected }) => {
  const view = await render(() => <Fixture defaultValue={value} step={step} min={min} max={max} />);
  const input = view.getByRole('slider'); await view.user.keyboard(`[Tab][${key}]`); expect(input).toHaveAttribute('aria-valuenow', expected);
  await view.user.keyboard(`[${key}]`); expect(input).toHaveAttribute('aria-valuenow', expected);
});
it('Slider input followed by keyboard updates ARIA and callback reasons', async () => {
  const change = vi.fn(); const commit = vi.fn();
  const view = await render(() => <Fixture defaultValue={50} onValueChange={change} onValueCommitted={commit} />);
  const input = view.getByRole('slider'); input.focus(); fireEvent.input(input, { target: { value: '51' } }); await Promise.resolve();
  expect(input).toHaveAttribute('aria-valuenow', '51');
  expect(change).toHaveBeenCalledExactlyOnceWith(51, expect.objectContaining({ reason: 'input-change', activeThumbIndex: 0 }));
  expect(commit).toHaveBeenCalledExactlyOnceWith(51, expect.objectContaining({ reason: 'input-change' }));
  await view.user.keyboard('[ArrowRight]'); expect(input).toHaveAttribute('aria-valuenow', '52');
  expect(change.mock.lastCall?.[1].reason).toBe('keyboard');
});
it('Slider equal range keyboard proposal does not notify or commit', async () => {
  const change = vi.fn(); const commit = vi.fn();
  const view = await render(() => <Fixture defaultValue={[50, 50]} onValueChange={change} onValueCommitted={commit} />);
  await view.user.keyboard('[Tab][ArrowRight]'); expect(change).not.toHaveBeenCalled(); expect(commit).not.toHaveBeenCalled();
  view.getAllByRole('slider').forEach((input) => expect(input).toHaveAttribute('aria-valuenow', '50'));
});
it('Slider controlled keyboard corrects an invalid off-grid value', async () => {
  const view = await render(() => { const [value, setValue] = createSignal(5.4698); return <Fixture value={value()} onValueChange={setValue} min={0} max={10} step={1} />; });
  const input = view.getByRole('slider'); expect(input).toHaveAttribute('aria-valuenow', '5.4698'); await view.user.keyboard('[Tab]'); expect(input).toHaveFocus(); await view.user.keyboard('[ArrowRight]'); expect(input).toHaveAttribute('aria-valuenow', '6');
});
it('Slider source ARIA and min/max inputs preserve explicit values', async () => {
  const view = await renderProps<SliderRootProps>((props) => <Slider.Root {...props} data-testid="root"><Slider.Value /><Slider.Control><Slider.Track><Slider.Indicator /><Slider.Thumb /></Slider.Track></Slider.Control></Slider.Root>, { value: 30, 'aria-labelledby': 'labelId' });
  const input = view.getByRole('slider'); expect(input.tagName).toBe('INPUT'); expect(view.getByTestId('root')).toHaveAttribute('aria-labelledby', 'labelId'); expect(input).toHaveAttribute('aria-labelledby', 'labelId'); expect(input).toHaveAttribute('aria-valuenow', '30'); expect(input).toHaveAttribute('aria-orientation', 'horizontal'); expect(input).toHaveAttribute('step', '1');
  await view.setProps({ value: 150, step: 100, max: 750, min: 150 }); expect(input).toHaveAttribute('max', '750'); expect(input).toHaveAttribute('min', '150'); input.focus(); await Promise.resolve(); expect(input).toHaveAttribute('aria-valuenow', '150');
  await view.setProps({ orientation: 'vertical' }); expect(input).toHaveAttribute('aria-orientation', 'vertical');
});
it.each([51.1, 5e-8, 1e-7])('Slider initial noninteger value %s', async (value) => {
  const view = await render(() => <Fixture value={value} min={-100} max={100} step={1e-8} />); expect(view.getByRole('slider')).toHaveAttribute('aria-valuenow', String(value));
});
it.skipIf(!isJSDOM)('Slider input event does not consult global event', async () => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'event'); const change = vi.fn();
  const view = await render(() => <Fixture value={3} name="change-testing" onValueChange={change} />);
  Object.defineProperty(globalThis, 'event', { configurable: true, get: () => ({ type: 'click', constructor: class { constructor() { throw new Error('Should not construct global event'); } } }), set: () => {} });
  try { const input = view.getByRole('slider'); input.focus(); expect(() => fireEvent.input(input, { target: { value: '4' } })).not.toThrow(); expect(change).toHaveBeenCalledTimes(1); }
  finally { if (descriptor) Object.defineProperty(globalThis, 'event', descriptor); else Reflect.deleteProperty(globalThis, 'event'); }
});
it('Slider initial near-bound range is clamped to source min and max', async () => {
  const view = await render(() => <Fixture defaultValue={[19, 41]} min={20} max={40} />);
  expect(view.getAllByRole('slider').map((input) => input.getAttribute('aria-valuenow'))).toEqual(['20', '40']);
});
it('Slider source maximum keyboard no-op never changes or commits', async () => {
  const change = vi.fn(); const commit = vi.fn(); const view = await render(() => <Fixture defaultValue={100} onValueChange={change} onValueCommitted={commit} />);
  await view.user.keyboard('[Tab][ArrowRight]'); expect(change).not.toHaveBeenCalled(); expect(commit).not.toHaveBeenCalled(); expect(view.getByRole('slider')).toHaveAttribute('aria-valuenow', '100');
});
it('Slider source track press then native input commit counts and reasons', async () => {
  const commit = vi.fn(); const view = await render(() => <Fixture defaultValue={0} onValueCommitted={commit} />); const control = view.getByTestId('control');
  vi.spyOn(control, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 100, 10)); Object.defineProperties(control, { setPointerCapture: { value: vi.fn() }, hasPointerCapture: { value: () => false } });
  firePointer.down(control, { timeStamp: 1, buttons: 1, clientX: 10 }); firePointer.up(control, { timeStamp: 2, buttons: 1, clientX: 10 }); await Promise.resolve();
  expect(commit).toHaveBeenCalledTimes(1); expect(commit.mock.lastCall?.[0]).toBe(10); expect(commit.mock.lastCall?.[1].reason).toBe('track-press');
  const input = view.getByRole('slider'); input.focus(); fireEvent.input(input, { target: { value: '23' } }); await Promise.resolve(); expect(commit).toHaveBeenCalledTimes(2); expect(commit.mock.lastCall?.[1].reason).toBe('input-change');
});
it('Slider source track press reports one active-index and track-press reason', async () => {
  const change = vi.fn(); const view = await render(() => <Fixture defaultValue={0} onValueChange={change} />); const control = view.getByTestId('control');
  vi.spyOn(control, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 100, 10)); Object.defineProperties(control, { setPointerCapture: { value: vi.fn() }, hasPointerCapture: { value: () => false } });
  firePointer.down(control, { timeStamp: 1, pointerId: 1, pointerType: 'mouse', button: 0, buttons: 1, clientX: 80 });
  expect(change).toHaveBeenCalledTimes(1); expect(change.mock.calls[0][1].reason).toBe('track-press'); firePointer.up(control, { timeStamp: 2, pointerId: 1, buttons: 0, clientX: 80 });
});
for (const orientation of ['horizontal', 'vertical'] as const) for (const alignment of ['center', 'edge'] as const) {
  browserCase({ source: 'packages/react/src/slider/indicator/SliderIndicator.test.tsx', case: `${orientation}/${alignment} measured positioning`, environment: 'browser', issue: 'bsolid-browser' }, async () => {
    const view = await render(() => <Fixture defaultValue={30} orientation={orientation} thumbAlignment={alignment} />);
    const thumb = view.getByTestId('thumb');
    const control = view.getByTestId('control');
    await vi.waitFor(() => expect(thumb.style.visibility).not.toBe('hidden'));
    const rect = thumb.getBoundingClientRect(); const track = control.getBoundingClientRect();
    const center = orientation === 'vertical' ? track.bottom - (rect.top + rect.height / 2) : rect.left + rect.width / 2 - track.left;
    expect(center).toBeCloseTo(alignment === 'edge' ? 32 : 30, 0);
  });
}
browserCase({ source: 'packages/react/src/slider/root/SliderRoot.test.tsx', case: 'disabled slider blurs native focus', environment: 'browser', issue: 'bsolid-browser' }, async () => {
  const view = await renderProps<SliderRootProps>((props) => <Fixture {...props} />, { defaultValue: 30 });
  const input = view.getByRole('slider'); input.focus(); flush();
  await view.setProps({ disabled: true });
  expect(input).not.toHaveFocus();
});
