// Every case in upstream packages/react/test/pointer.test.tsx, using native handlers.
import { describe, it, expect } from 'vitest';
import type { JSX } from '@solidjs/web';
import { createRenderer, firePointer } from '../../packages/solid/test';
function Target(props: { onEvent: JSX.EventHandler<HTMLDivElement, PointerEvent> }) {
  return <div data-testid="target" onPointerDown={props.onEvent} onPointerMove={props.onEvent} onPointerUp={props.onEvent} />;
}
describe('firePointer source cases', () => {
  const { render } = createRenderer();
  it('preserves cancellation timestamps on window-level gesture listeners', () => {
    const seen: { type: string; time: number; pointer: number }[] = [];
    const listener = (event: PointerEvent) => {
      seen.push({ type: event.type, time: event.timeStamp, pointer: event.pointerId });
      event.preventDefault();
    };
    window.addEventListener('pointercancel', listener);
    try {
      expect(firePointer.cancel(window, { pointerId: 7, timeStamp: 1050 })).toBe(false);
      expect(seen).toEqual([{ type: 'pointercancel', time: 1050, pointer: 7 }]);
    } finally { window.removeEventListener('pointercancel', listener); }
  });
  it('reports requested timestamps for down/move/up through native handlers', async () => {
    const seen: number[] = [];
    const view = await render(() => <Target onEvent={(event) => { seen.push(event.timeStamp); }} />);
    const target = view.getByTestId('target');
    firePointer.down(target, { pointerId: 1, timeStamp: 1000 });
    firePointer.move(target, { pointerId: 1, timeStamp: 1050 });
    firePointer.up(target, { pointerId: 1, timeStamp: 1100 });
    expect(seen).toEqual([1000, 1050, 1100]);
  });
  it('delivers pointer identity/type, coordinates and buttons beside the timestamp', async () => {
    const seen: object[] = [];
    const view = await render(() => <Target onEvent={(event) => { seen.push({ pointerId: event.pointerId, pointerType: event.pointerType, clientX: event.clientX, clientY: event.clientY, buttons: event.buttons, timeStamp: event.timeStamp }); }} />);
    const init = { pointerId: 1, pointerType: 'mouse', clientX: 120, clientY: 40, buttons: 1, timeStamp: 1050 };
    firePointer.move(view.getByTestId('target'), init);
    expect(seen).toEqual([init]);
  });
  it('rejects non-positive timestamps before dispatch', async () => {
    const seen: number[] = [];
    const view = await render(() => <Target onEvent={(event) => { seen.push(event.timeStamp); }} />);
    expect(() => firePointer.down(view.getByTestId('target'), { pointerId: 1, timeStamp: 0 })).toThrow(/timeStamp must be greater than 0/);
    expect(seen).toEqual([]);
  });
});
