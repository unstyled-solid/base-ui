import { expect, it, vi } from 'vitest';
import { flush, createSignal } from 'solid-js';
import { createRenderer, fireEvent, firePointer, browserCase } from '../../test';
import { fireTouch, touchPoint } from '../../test/touch';
import { Slider } from './index';
import { FieldRoot } from '../field/root/FieldRoot';
const { render } = createRenderer();
function touch(target: HTMLElement, type: 'touchstart' | 'touchmove' | 'touchend' | 'touchcancel', identifier: number, x: number) {
  fireTouch(target, type, [touchPoint(target, x, 0, identifier)]);
}
it('Slider touch fallback survives pointer cancellation and ignores another finger', async () => {
  const commit = vi.fn();
  const view = await render(() => <Slider.Root defaultValue={[25]} onValueCommitted={commit}>
    <Slider.Control data-testid="control"><Slider.Thumb /></Slider.Control>
  </Slider.Root>);
  const control = view.getByTestId('control');
  vi.spyOn(control, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 100, 10));
  Object.defineProperties(control, { setPointerCapture: { value: vi.fn() }, hasPointerCapture: { value: () => false } });
  firePointer.down(control, { timeStamp: 1, pointerId: 1, pointerType: 'touch', button: 0, buttons: 1, clientX: 40 });
  touch(control, 'touchstart', 1, 40);
  fireEvent.pointerCancel(control, { pointerId: 1, pointerType: 'touch' });
  touch(document.body, 'touchmove', 1, 70);
  touch(document.body, 'touchend', 2, 90);
  expect(commit).not.toHaveBeenCalled();
  touch(document.body, 'touchcancel', 1, 70); flush();
  expect(commit).toHaveBeenCalledExactlyOnceWith([70], expect.objectContaining({ reason: 'drag' }));
  touch(document.body, 'touchend', 1, 70);
  expect(commit).toHaveBeenCalledTimes(1);
});
for (const pointerType of ['touch', 'pen']) {
  it(`Slider source ${pointerType} compatibility track tap commits scalar once`, async () => {
    const commit = vi.fn();
    const view = await render(() => { const [value, setValue] = createSignal(0); return <Slider.Root value={value()} onValueChange={setValue} onValueCommitted={commit}><Slider.Control data-testid="control"><Slider.Thumb /></Slider.Control></Slider.Root>; });
    const control = view.getByTestId('control'); vi.spyOn(control, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 100, 10));
    Object.defineProperties(control, { setPointerCapture: { value: vi.fn() }, hasPointerCapture: { value: () => false } });
    firePointer.down(control, { timeStamp: 1, pointerType, pointerId: 1, buttons: 1, clientX: 50 }); touch(control, 'touchstart', 1, 50);
    firePointer.up(control, { timeStamp: 2, pointerType, pointerId: 1, clientX: 50 }); touch(document.body, 'touchend', 1, 50); await Promise.resolve();
    expect(commit).toHaveBeenCalledTimes(1); expect(commit.mock.calls[0][0]).toBe(50);
  });
  it(`Slider source ${pointerType} thumb tap does not change scalar`, async () => {
    const change = vi.fn(); const view = await render(() => <Slider.Root defaultValue={100} step={3} onValueChange={change}><Slider.Control data-testid="control"><Slider.Thumb data-testid="thumb" /></Slider.Control></Slider.Root>);
    const control = view.getByTestId('control'); const thumb = view.getByTestId('thumb'); vi.spyOn(control, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 100, 10)); vi.spyOn(thumb, 'getBoundingClientRect').mockReturnValue(new DOMRect(95, 0, 10, 10));
    Object.defineProperties(control, { setPointerCapture: { value: vi.fn() }, hasPointerCapture: { value: () => false } });
    firePointer.down(thumb, { timeStamp: 1, pointerType, pointerId: 1, buttons: 1, clientX: 100 }); touch(thumb, 'touchstart', 1, 100); firePointer.up(thumb, { timeStamp: 2, pointerType, pointerId: 1, clientX: 100 }); touch(document.body, 'touchend', 1, 100); expect(change).not.toHaveBeenCalled();
  });
}
it('Slider scalar touch drag survives pointercancel until touchend', async () => {
  const commit = vi.fn(); const view = await render(() => <Slider.Root defaultValue={0} onValueCommitted={commit}><Slider.Control data-testid="control"><Slider.Thumb /></Slider.Control></Slider.Root>);
  const control = view.getByTestId('control'); vi.spyOn(control, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 100, 10)); Object.defineProperties(control, { setPointerCapture: { value: vi.fn() }, hasPointerCapture: { value: () => false } });
  firePointer.down(control, { timeStamp: 1, pointerType: 'touch', pointerId: 1, buttons: 1, clientX: 50 }); touch(control, 'touchstart', 1, 50); firePointer.cancel(control, { timeStamp: 2, pointerType: 'touch', pointerId: 1 }); touch(document.body, 'touchmove', 1, 70); touch(document.body, 'touchend', 1, 70); expect(commit).toHaveBeenCalledTimes(1); expect(commit.mock.calls[0][0]).toBe(70);
});
it.each(['mouse', 'pen', 'touch'])('Slider source canceled %s gesture permits later prevented-pointer touch press', async (pointerType) => {
  const change = vi.fn(); const commit = vi.fn(); let prevent = false;
  const view = await render(() => <Slider.Root defaultValue={0} onValueChange={change} onValueCommitted={commit}><Slider.Control data-testid="control" onPointerDown={(event) => { if (prevent) event.preventDefault(); }}><Slider.Thumb /></Slider.Control></Slider.Root>);
  const control = view.getByTestId('control'); vi.spyOn(control, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 100, 10)); Object.defineProperties(control, { setPointerCapture: { value: vi.fn() }, hasPointerCapture: { value: () => false } });
  firePointer.down(control, { timeStamp: 1, pointerType, pointerId: 1, buttons: 1, clientX: 50 }); if (pointerType === 'touch') touch(control, 'touchstart', 1, 50); expect(change.mock.lastCall?.[0]).toBe(50);
  firePointer.cancel(control, { timeStamp: 2, pointerType, pointerId: 1 }); if (pointerType === 'touch') touch(document.body, 'touchcancel', 1, 50); commit.mockClear(); prevent = true;
  firePointer.down(control, { timeStamp: 3, pointerType: 'touch', pointerId: 2, buttons: 1, clientX: 30 }); touch(control, 'touchstart', 2, 30); expect(change.mock.lastCall?.[0]).toBe(30);
  firePointer.up(control, { timeStamp: 4, pointerType: 'touch', pointerId: 2, clientX: 30 }); touch(document.body, 'touchend', 2, 30); expect(commit).toHaveBeenCalledTimes(1); expect(commit.mock.calls[0][0]).toBe(30);
});
it('Slider canceled swap retains the original pressed thumb and last accepted commit', async () => {
  const commit = vi.fn();
  const view = await render(() => <Slider.Root defaultValue={[20, 40]} thumbCollisionBehavior="swap"
    onValueChange={(next, details) => { if (next[1] === 70) details.cancel(); }} onValueCommitted={commit}>
    <Slider.Control data-testid="control"><Slider.Thumb index={0} data-testid="thumb" /><Slider.Thumb index={1} /></Slider.Control>
  </Slider.Root>);
  const control = view.getByTestId('control'); const thumb = view.getByTestId('thumb');
  vi.spyOn(control, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 100, 10));
  vi.spyOn(thumb, 'getBoundingClientRect').mockReturnValue(new DOMRect(10, 0, 20, 10));
  firePointer.down(thumb, { timeStamp: 1, button: 0, buttons: 1, clientX: 20 });
  firePointer.move(document.body, { timeStamp: 2, buttons: 1, clientX: 70 });
  firePointer.move(document.body, { timeStamp: 3, buttons: 1, clientX: 30 });
  firePointer.up(document.body, { timeStamp: 4, buttons: 0, clientX: 90 }); flush();
  expect(commit).toHaveBeenCalledExactlyOnceWith([30, 40], expect.objectContaining({ reason: 'drag' }));
});
it('Slider field blur validates only after leaving the range', async () => {
  const validate = vi.fn((_value: unknown) => null);
  const view = await render(() => <FieldRoot validationMode="onBlur" validate={validate}>
    <Slider.Root defaultValue={[20, 50]}><Slider.Control><Slider.Thumb index={0} /><Slider.Thumb index={1} /><button>Help</button></Slider.Control></Slider.Root>
  </FieldRoot>);
  const inputs = view.getAllByRole('slider');
  inputs[0].focus(); flush(); validate.mockClear(); inputs[1].focus(); flush();
  expect(validate).not.toHaveBeenCalled();
  view.getByRole('button').focus(); flush();
  await vi.waitFor(() => expect(validate).toHaveBeenCalledTimes(1));
  expect(validate.mock.calls[0][0]).toEqual([20, 50]);
});
browserCase({ source: 'packages/react/src/slider/thumb/SliderThumb.test.tsx', case: 'resize observer recomputes edge alignment after visibility changes', environment: 'browser', issue: 'bsolid-browser' }, async () => {
  const { renderProps } = createRenderer();
  const view = await renderProps((props: { visible: boolean }) => <div style={{ display: props.visible ? 'block' : 'none' }}>
    <Slider.Root defaultValue={[30, 70]} thumbAlignment="edge"><Slider.Control style={{ position: 'relative', width: '100px', height: '10px' }}>
      <Slider.Indicator data-testid="indicator" /><Slider.Thumb index={0} data-testid="first" style={{ width: '10px', height: '10px' }} /><Slider.Thumb index={1} style={{ width: '10px', height: '10px' }} />
    </Slider.Control></Slider.Root>
  </div>, { visible: false });
  expect(view.getByTestId('first').style.visibility).toBe('hidden');
  await view.setProps({ visible: true });
  await vi.waitFor(() => expect(view.getByTestId('first').style.getPropertyValue('--position')).toBe('32%'));
  expect(view.getByTestId('indicator').style.getPropertyValue('--relative-size')).toBe('36%');
});
