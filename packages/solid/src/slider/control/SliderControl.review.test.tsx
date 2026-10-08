import { expect, it, vi } from 'vitest';
import { flush, omit } from 'solid-js';
import { createRenderer, firePointer, fireEvent } from '../../../test';
import { Slider } from '../index';
import type { SliderRootProps } from '../root/SliderRoot';

const { render, renderProps } = createRenderer();
it('Slider Control outside Root throws the descriptive source error', async () => {
  await expect(render(() => <Slider.Control />)).rejects.toThrow('Base UI: SliderRootContext is missing. Slider parts must be placed within <Slider.Root>.');
});
// Source: slider/control/SliderControl.test.tsx. Rect mocks isolate gesture math;
// real layout/capture/resize scenarios remain in the retained browser suites.
it('Slider picks the first thumb stacked at maximum and preserves the grab offset', async () => {
  const change = vi.fn();
  const view = await render(() => <Slider.Root defaultValue={[100, 100, 100]} onValueChange={change}>
    <Slider.Control data-testid="control"><Slider.Thumb index={0} /><Slider.Thumb index={1} /><Slider.Thumb index={2} data-testid="last" /></Slider.Control>
  </Slider.Root>);
  vi.spyOn(view.getByTestId('control'), 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 100, 10));
  const last = view.getByTestId('last');
  vi.spyOn(last, 'getBoundingClientRect').mockReturnValue(new DOMRect(90, 0, 20, 10));
  firePointer.down(last, { timeStamp: 1, button: 0, buttons: 1, clientX: 100 });
  firePointer.move(document.body, { timeStamp: 2, buttons: 1, clientX: 50 });
  firePointer.up(document.body, { timeStamp: 3, buttons: 0, clientX: 50 }); flush();
  expect(change).toHaveBeenLastCalledWith([50, 100, 100], expect.objectContaining({ activeThumbIndex: 0, reason: 'drag' }));
});

it('Slider clears the offset when swapping to an unrendered thumb', async () => {
  const change = vi.fn();
  const view = await render(() => <Slider.Root defaultValue={[20, 40]} thumbCollisionBehavior="swap" onValueChange={change}>
    <Slider.Control data-testid="control"><Slider.Thumb index={0} data-testid="thumb" /></Slider.Control>
  </Slider.Root>);
  vi.spyOn(view.getByTestId('control'), 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 100, 10));
  const thumb = view.getByTestId('thumb');
  vi.spyOn(thumb, 'getBoundingClientRect').mockReturnValue(new DOMRect(10, 0, 20, 10));
  firePointer.down(thumb, { timeStamp: 1, button: 0, buttons: 1, clientX: 30 });
  firePointer.move(document.body, { timeStamp: 2, buttons: 1, clientX: 70 });
  firePointer.move(document.body, { timeStamp: 3, buttons: 1, clientX: 80 });
  firePointer.up(document.body, { timeStamp: 4, buttons: 0, clientX: 80 }); flush();
  expect(change).toHaveBeenLastCalledWith([40, 80], expect.objectContaining({ activeThumbIndex: 1, reason: 'drag' }));
});

it.each(['horizontal', 'vertical'] as const)('Slider inset %s track press accounts for thumb size', async (orientation) => {
  const change = vi.fn();
  const vertical = orientation === 'vertical';
  const view = await render(() => <Slider.Root defaultValue={50} orientation={orientation} thumbAlignment="edge-client-only" onValueChange={change}>
    <Slider.Control data-testid="control"><Slider.Thumb data-testid="thumb" /></Slider.Control>
  </Slider.Root>);
  const control = view.getByTestId('control');
  vi.spyOn(control, 'getBoundingClientRect').mockReturnValue(vertical ? new DOMRect(0, 0, 10, 100) : new DOMRect(0, 0, 100, 10));
  vi.spyOn(view.getByTestId('thumb'), 'getBoundingClientRect').mockReturnValue(vertical ? new DOMRect(0, 40, 10, 20) : new DOMRect(40, 0, 20, 10));
  const point = vertical ? { clientX: 5, clientY: 90 } : { clientX: 10, clientY: 5 };
  firePointer.down(control, { timeStamp: 1, button: 0, buttons: 1, ...point });
  firePointer.up(document.body, { timeStamp: 2, buttons: 0, ...point }); flush();
  expect(change).toHaveBeenCalledExactlyOnceWith(0, expect.objectContaining({ activeThumbIndex: 0, reason: 'track-press' }));
});

it('Slider does not drag when collision constraints cannot satisfy minimum distance', async () => {
  const change = vi.fn();
  const commit = vi.fn();
  const view = await render(() => <Slider.Root value={[20, 40]} thumbCollisionBehavior="none" minStepsBetweenValues={50} onValueChange={change} onValueCommitted={commit}>
    <Slider.Control data-testid="control"><Slider.Thumb index={0} data-testid="thumb" /><Slider.Thumb index={1} /></Slider.Control>
  </Slider.Root>);
  vi.spyOn(view.getByTestId('control'), 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 100, 10));
  const thumb = view.getByTestId('thumb');
  vi.spyOn(thumb, 'getBoundingClientRect').mockReturnValue(new DOMRect(10, 0, 20, 10));
  firePointer.down(thumb, { timeStamp: 1, button: 0, buttons: 1, clientX: 20 });
  firePointer.move(document.body, { timeStamp: 2, buttons: 1, clientX: 80 });
  firePointer.up(document.body, { timeStamp: 3, buttons: 0, clientX: 80 }); flush();
  expect(change).not.toHaveBeenCalled(); expect(commit).not.toHaveBeenCalled();
});

it.each(['mouse', 'pen'])('Slider pointercancel commits once, releases %s capture and removes listeners', async (pointerType) => {
  const commit = vi.fn();
  const change = vi.fn();
  const view = await render(() => <Slider.Root defaultValue={20} onValueChange={change} onValueCommitted={commit}>
    <Slider.Control data-testid="control"><Slider.Thumb /></Slider.Control>
  </Slider.Root>);
  const control = view.getByTestId('control');
  vi.spyOn(control, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 100, 10));
  const release = vi.fn();
  Object.defineProperties(control, { setPointerCapture: { value: vi.fn() }, hasPointerCapture: { value: () => true }, releasePointerCapture: { value: release } });
  const pointer = { pointerType, pointerId: 7 };
  firePointer.down(control, { timeStamp: 1, ...pointer, button: 0, buttons: 1, clientX: 40 });
  firePointer.move(document.body, { timeStamp: 2, ...pointer, buttons: 1, clientX: 70 });
  await Promise.resolve(); expect(control).toHaveAttribute('data-dragging', '');
  firePointer.cancel(document.body, { timeStamp: 3, ...pointer }); flush();
  expect(commit).toHaveBeenCalledExactlyOnceWith(70, expect.objectContaining({ reason: 'drag' }));
  expect(release).toHaveBeenCalledExactlyOnceWith(7);
  expect(control).not.toHaveAttribute('data-dragging');
  change.mockClear();
  const elsewhere = document.createElement('div'); view.container.appendChild(elsewhere);
  firePointer.down(elsewhere, { timeStamp: 4, ...pointer, button: 0, buttons: 1, clientX: 90 });
  firePointer.move(document.body, { timeStamp: 4, ...pointer, buttons: 1, clientX: 90 });
  firePointer.up(document.body, { timeStamp: 5, ...pointer, buttons: 0, clientX: 90 }); flush();
  expect(change).not.toHaveBeenCalled(); expect(commit).toHaveBeenCalledTimes(1);
});

it.each([{ value: [10, 20] }, { value: [10, 20, 30, 40] }])('Slider drops a cached commit when the published range resizes to $value', async ({ value }) => {
  const commit = vi.fn();
  const change = vi.fn();
  const view = await renderProps<SliderRootProps>((props) => <Slider.Root {...props}>
    <Slider.Control data-testid="control"><Slider.Thumb index={0} /><Slider.Thumb index={1} data-testid="thumb" /><Slider.Thumb index={2} /></Slider.Control>
  </Slider.Root>, { value: [10, 20, 30], onValueChange: change, onValueCommitted: commit });
  vi.spyOn(view.getByTestId('control'), 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 100, 10));
  const thumb = view.getByTestId('thumb');
  vi.spyOn(thumb, 'getBoundingClientRect').mockReturnValue(new DOMRect(15, 0, 10, 10));
  firePointer.down(thumb, { timeStamp: 1, button: 0, buttons: 1, clientX: 20 });
  firePointer.move(document.body, { timeStamp: 2, buttons: 1, clientX: 40 }); flush();
  expect(change.mock.lastCall?.[0]).toHaveLength(3);
  await view.setProps({ value });
  firePointer.up(document.body, { timeStamp: 3, buttons: 0, clientX: 40 }); flush();
  expect(commit).not.toHaveBeenCalled();
});

it('Slider custom control renderer dropping its ref safely ignores presses', async () => {
  const change = vi.fn();
  const view = await render(() => <Slider.Root defaultValue={20} onValueChange={change}>
    <Slider.Control data-testid="control" render={(native) => { const withoutRef = omit(native, 'ref'); return <div {...withoutRef} />; }}><Slider.Thumb /></Slider.Control>
  </Slider.Root>);
  firePointer.down(view.getByTestId('control'), { timeStamp: 1, button: 0, buttons: 1, clientX: 80 }); flush();
  expect(change).not.toHaveBeenCalled();
  view.unmount();
});
it('Slider single-element array track press and pointer release preserve shape', async () => {
  const change = vi.fn(); const commit = vi.fn(); const release = vi.fn();
  const view = await render(() => <Slider.Root defaultValue={[25]} onValueChange={change} onValueCommitted={commit}><Slider.Control data-testid="control"><Slider.Thumb /></Slider.Control></Slider.Root>);
  const control = view.getByTestId('control'); vi.spyOn(control, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 100, 10));
  Object.defineProperties(control, { setPointerCapture: { value: vi.fn() }, hasPointerCapture: { value: () => true }, releasePointerCapture: { value: release } });
  firePointer.down(control, { timeStamp: 1, pointerId: 7, button: 0, buttons: 1, clientX: 50 }); firePointer.up(document.body, { timeStamp: 2, pointerId: 7, buttons: 0, clientX: 50 }); await Promise.resolve();
  expect(change.mock.calls[0][0]).toEqual([50]); expect(commit.mock.calls[0][0]).toEqual([50]); expect(release).toHaveBeenCalledWith(7);
});
it('Slider disabled thumb ignores pointer drag and single disabled thumb ignores track press', async () => {
  const change = vi.fn(); const single = vi.fn();
  const view = await render(() => <><Slider.Root defaultValue={[20, 80]} onValueChange={change}><Slider.Control data-testid="control"><Slider.Thumb index={0} /><Slider.Thumb index={1} disabled data-testid="disabled" /></Slider.Control></Slider.Root>
    <Slider.Root defaultValue={20} onValueChange={single}><Slider.Control data-testid="single"><Slider.Thumb disabled data-testid="single-thumb" /></Slider.Control></Slider.Root></>);
  const disabled = view.getByTestId('disabled'); expect(disabled.querySelector('input')).toBeDisabled();
  for (const control of [view.getByTestId('control'), view.getByTestId('single')]) vi.spyOn(control, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 100, 10));
  firePointer.down(disabled, { timeStamp: 1, buttons: 1, clientX: 80 }); firePointer.move(document.body, { timeStamp: 2, buttons: 1, clientX: 40 }); firePointer.up(document.body, { timeStamp: 3, buttons: 1, clientX: 40 });
  firePointer.down(view.getByTestId('single'), { timeStamp: 4, buttons: 1, clientX: 80 }); firePointer.up(view.getByTestId('single'), { timeStamp: 5, buttons: 1, clientX: 80 }); await Promise.resolve();
  expect(change).not.toHaveBeenCalled(); expect(disabled.querySelector('input')).toHaveAttribute('aria-valuenow', '80'); expect(single).not.toHaveBeenCalled(); expect(view.getByTestId('single-thumb').querySelector('input')).toHaveAttribute('aria-valuenow', '20');
  expect(view.getByTestId('single-thumb').querySelector('input')).toBeDisabled();
});
it('Slider thumb press focuses without notifying and right click does not change', async () => {
  const change = vi.fn(); const view = await render(() => <Slider.Root defaultValue={50} onValueChange={change}><Slider.Control data-testid="control"><Slider.Thumb data-testid="thumb" /></Slider.Control></Slider.Root>);
  const control = view.getByTestId('control'); vi.spyOn(control, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 100, 10));
  firePointer.down(view.getByTestId('thumb'), { timeStamp: 1, buttons: 1, clientX: 51 }); await Promise.resolve(); expect(change).not.toHaveBeenCalled(); await vi.waitFor(() => expect(view.getByRole('slider')).toHaveFocus()); firePointer.up(document.body, { timeStamp: 2, buttons: 0, clientX: 51 });
  firePointer.down(control, { timeStamp: 3, button: 2, clientX: 41 }); expect(change).not.toHaveBeenCalled();
});
it('Slider vertical drag retains its grab offset', async () => {
  const change = vi.fn(); const view = await render(() => <Slider.Root defaultValue={50} orientation="vertical" onValueChange={change}><Slider.Control data-testid="control"><Slider.Thumb data-testid="thumb" /></Slider.Control></Slider.Root>);
  vi.spyOn(view.getByTestId('control'), 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 10, 100)); const thumb = view.getByTestId('thumb'); vi.spyOn(thumb, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 40, 10, 20));
  firePointer.down(thumb, { timeStamp: 1, button: 0, buttons: 1, clientX: 5, clientY: 60 }); firePointer.move(document.body, { timeStamp: 2, buttons: 1, clientX: 5, clientY: 80 }); firePointer.up(document.body, { timeStamp: 3, buttons: 0, clientX: 5, clientY: 80 });
  expect(change).toHaveBeenLastCalledWith(30, expect.objectContaining({ activeThumbIndex: 0, reason: 'drag' }));
});
it('Slider mouse events preserve ancestor and native document targets', async () => {
  const change = vi.fn(); const native = vi.fn(); const ancestor = vi.fn();
  const view = await render(() => <div onMouseDown={ancestor}><Slider.Root value={0} onValueChange={change}><Slider.Control data-testid="control"><Slider.Thumb /></Slider.Control></Slider.Root></div>);
  document.addEventListener('mousedown', native);
  try { const control = view.getByTestId('control'); fireEvent.mouseDown(control); expect(change).not.toHaveBeenCalled(); expect(native).toHaveBeenCalledTimes(1); expect(native.mock.calls[0][0].target).toBe(control); expect(ancestor).toHaveBeenCalledTimes(1); expect(ancestor.mock.calls[0][0].target).toBe(control); }
  finally { document.removeEventListener('mousedown', native); }
});
