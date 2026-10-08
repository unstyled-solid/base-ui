import { firePointer, flushMicrotasks } from '../../../test';
import type { DrawerSwipeDirection } from '../root/snapPoints';
export function cancelPointer(element: HTMLElement, init: PointerEventInit & { timeStamp: number }) {
  const { timeStamp, ...rest } = init;
  if (!Number.isFinite(timeStamp) || timeStamp <= 0) throw new Error('Drawer pointer fixture requires a positive finite timestamp.');
  const event = new element.ownerDocument.defaultView!.PointerEvent('pointercancel', { bubbles: true, cancelable: true, ...rest });
  Object.defineProperty(event, 'timeStamp', { value: timeStamp });
  element.dispatchEvent(event);
}
export async function timedSwipe(element: HTMLElement, direction: DrawerSwipeDirection, distance: number, options: { pointerType?: 'mouse' | 'pen'; step?: number; release?: HTMLElement; cancel?: boolean } = {}) {
  const horizontal = direction === 'left' || direction === 'right';
  const sign = direction === 'left' || direction === 'up' ? -1 : 1;
  const start = { clientX: 100, clientY: 100 };
  const point = (amount: number) => ({ clientX: start.clientX + (horizontal ? amount * sign : 0), clientY: start.clientY + (horizontal ? 0 : amount * sign) });
  const common = { pointerType: options.pointerType ?? 'mouse', pointerId: 1, button: 0 };
  const step = options.step ?? 16;
  firePointer.down(element, { ...common, ...start, buttons: 1, timeStamp: 1 }); await flushMicrotasks();
  firePointer.move(element, { ...common, ...point(1), buttons: 1, timeStamp: 1 + step }); await flushMicrotasks();
  firePointer.move(element, { ...common, ...point(distance), buttons: 1, timeStamp: 1 + 2 * step }); await flushMicrotasks();
  if (options.cancel) cancelPointer(options.release ?? element, { ...common, ...point(distance), buttons: 0, timeStamp: 1 + 3 * step });
  else firePointer.up(options.release ?? element, { ...common, ...point(distance), buttons: 0, timeStamp: 1 + 3 * step });
  await flushMicrotasks();
}
