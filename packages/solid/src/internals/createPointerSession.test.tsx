import { expect, it, vi } from 'vitest';
import { createRenderer, firePointer } from '../../test';
import { createPointerSession } from './createPointerSession';

it('pointer sessions consume owner-window capture events and release the exact owned listeners', async () => {
  let node!: HTMLDivElement, session!: ReturnType<typeof createPointerSession>;
  const moved = vi.fn(), ended = vi.fn(), canceled = vi.fn();
  const remove = vi.spyOn(window, 'removeEventListener');
  const view = await createRenderer().render(() => {
    session = createPointerSession({ element: () => node, eventTarget: () => window, listenerCapture: true, onMove: moved, onEnd: ended, onCancel: canceled });
    return <div ref={(element) => { node = element; }} />;
  });
  session.start(new PointerEvent('pointerdown', { pointerId: 1, button: 0 }));
  firePointer.move(window, { pointerId: 1, timeStamp: 20 }); expect(moved).toHaveBeenCalledOnce();
  firePointer.up(window, { pointerId: 1, timeStamp: 30 }); expect(ended).toHaveBeenCalledOnce();
  expect(remove).toHaveBeenCalledWith('pointermove', expect.any(Function), true);
  session.start(new PointerEvent('pointerdown', { pointerId: 2, button: 0 }));
  view.unmount(); expect(canceled).toHaveBeenCalledOnce();
  firePointer.move(window, { pointerId: 2, timeStamp: 40 }); expect(moved).toHaveBeenCalledOnce();
  remove.mockRestore();
});

it('deferred pointer release retains movement and makes cancellation/disposal invalidate late finish', async () => {
  let node!: HTMLDivElement, session!: ReturnType<typeof createPointerSession>, finish!: () => boolean;
  let distance = 0;
  const canceled = vi.fn();
  const view = await createRenderer().render(() => {
    session = createPointerSession({ element: () => node, eventTarget: () => window, listenerCapture: true, deferEnd: true,
      onMove(event) { distance += event.movementX; }, onEnd(_, complete) { finish = complete; }, onCancel: canceled });
    return <div ref={(element) => { node = element; }} />;
  });
  session.start(new PointerEvent('pointerdown', { pointerId: 1, button: 0 }));
  firePointer.move(window, { pointerId: 1, movementX: 10, timeStamp: 10 });
  firePointer.up(window, { pointerId: 1, timeStamp: 20 });
  firePointer.move(window, { pointerId: 1, movementX: 2, timeStamp: 25 });
  expect(distance).toBe(12); expect(finish()).toBe(true); expect(finish()).toBe(false);
  session.start(new PointerEvent('pointerdown', { pointerId: 2, button: 0 }));
  firePointer.up(window, { pointerId: 2, timeStamp: 30 });
  view.unmount(); expect(canceled).toHaveBeenCalledOnce(); expect(finish()).toBe(false);
  session.start(new PointerEvent('pointerdown', { pointerId: 3, button: 0 }));
  firePointer.move(window, { pointerId: 3, movementX: 10, timeStamp: 40 }); expect(distance).toBe(12);
});
