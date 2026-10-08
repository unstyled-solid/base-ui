import { expect, it, vi } from 'vitest';
import { createSignal } from 'solid-js';
import { createRenderer, firePointer, advanceTimers } from '../../test';
import { createPressAndHold } from './createPressAndHold';
it('createPressAndHold preserves delayed repeat timing and releases once after tick veto', async () => {
  vi.useFakeTimers();
  let ticks = 0;
  const tick = vi.fn(() => ++ticks < 2), stop = vi.fn();
  const view = await createRenderer().render(() => {
    const [element, setElement] = createSignal<HTMLElement | null>(null);
    const hold = createPressAndHold({ disabled: false, elementRef: element, tick, onStop: stop });
    return <button ref={setElement} {...hold.pointerHandlers}>Hold</button>;
  });
  const element = view.getByRole('button');
  firePointer.down(element, { pointerType: 'mouse', buttons: 1, timeStamp: 100 });
  expect(tick).toHaveBeenCalledTimes(1);
  await advanceTimers(400);
  expect(tick).toHaveBeenCalledTimes(1);
  await advanceTimers(60);
  expect(tick).toHaveBeenCalledTimes(2);
  firePointer.up(element, { pointerType: 'mouse', buttons: 0, timeStamp: 600 });
  expect(stop).toHaveBeenCalledTimes(1);
  view.unmount();
});
