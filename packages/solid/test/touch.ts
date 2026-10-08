import { fireEvent } from '@testing-library/dom';
import { ownerWindow } from '../src/utils/owner';

export function touchPoint(target: HTMLElement, clientX = 100, clientY = 100, identifier = 0) {
  return { identifier, target, clientX, clientY };
}

/** Use native touch interfaces where constructible, retaining identical event
 * payloads for desktop engines that do not expose the constructors. */
export function fireTouch(target: HTMLElement, type: 'touchstart' | 'touchmove' | 'touchend' | 'touchcancel', touches: ReturnType<typeof touchPoint>[] = []) {
  const win = ownerWindow(target);
  let event: Event;
  try {
    const nativeTouches = touches.map(point => new win.Touch(point));
    event = new win.TouchEvent(type, { bubbles: true, cancelable: true, touches: nativeTouches, targetTouches: nativeTouches, changedTouches: nativeTouches });
  } catch (error) {
    if (!(error instanceof win.TypeError)) throw error;
    event = new win.Event(type, { bubbles: true, cancelable: true });
    Object.defineProperties(event, {
      touches: { value: touches }, targetTouches: { value: touches }, changedTouches: { value: touches },
    });
  }
  return fireEvent(target, event);
}
