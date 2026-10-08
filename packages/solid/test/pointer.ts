// Adapted from Base UI (MIT), pinned source recorded in tracking/harness.json.
import { createEvent, fireEvent } from '@testing-library/dom';

export function enterWithMouse(element: HTMLElement, init?: MouseEventInit) {
  fireEvent.pointerEnter(element, { pointerType: 'mouse', ...init });
  fireEvent.mouseEnter(element, init);
  fireEvent.mouseMove(element, init);
}
export function moveMouse(from: HTMLElement, to: HTMLElement) {
  fireEvent.pointerLeave(from, { pointerType: 'mouse', relatedTarget: to });
  fireEvent.mouseLeave(from, { relatedTarget: to });
  fireEvent.pointerEnter(to, { pointerType: 'mouse', relatedTarget: from });
  fireEvent.mouseEnter(to, { relatedTarget: from });
  fireEvent.mouseMove(to);
}
export type PointerInit = PointerEventInit & { timeStamp: number };
type PointerTarget = Element | Window;
function dispatch(type: 'pointerDown' | 'pointerMove' | 'pointerUp' | 'pointerCancel' | 'pointerEnter' | 'pointerLeave', element: PointerTarget, init: PointerInit) {
  const { timeStamp, ...rest } = init;
  if (!(timeStamp > 0) || !Number.isFinite(timeStamp)) throw new Error(`firePointer: timeStamp must be greater than 0 and finite, received ${timeStamp}.`);
  const event = 'document' in element
    ? new element.document.defaultView!.PointerEvent(type.toLowerCase(), { bubbles: true, cancelable: true, composed: true, ...rest })
    : createEvent[type](element, rest);
  Object.defineProperty(event, 'timeStamp', { value: timeStamp });
  return element.dispatchEvent(event);
}
export const firePointer = {
  down: (element: PointerTarget, init: PointerInit) => dispatch('pointerDown', element, init),
  move: (element: PointerTarget, init: PointerInit) => dispatch('pointerMove', element, init),
  up: (element: PointerTarget, init: PointerInit) => dispatch('pointerUp', element, init),
  cancel: (element: PointerTarget, init: PointerInit) => dispatch('pointerCancel', element, init),
  enter: (element: PointerTarget, init: PointerInit) => dispatch('pointerEnter', element, init),
  leave: (element: PointerTarget, init: PointerInit) => dispatch('pointerLeave', element, init),
};
