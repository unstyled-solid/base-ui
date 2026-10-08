import { expect, vi } from 'vitest';
import { fireEvent, advanceTimers, flushMicrotasks, wait } from '../../../test';
import { platform } from '../../utils/platform';

/** Pinned Gecko release remains live for 20ms after pointerup. */
export async function settleScrubRelease() {
  if (platform.engine.gecko) {
    if (vi.isFakeTimers()) await advanceTimers(20);
    else await wait(20);
  }
  await flushMicrotasks();
}

/** Controlled lock/cursor unit fixtures supply a lock API even on WebKit.
 * Natural platform policy is covered separately by the active-cursor fixture. */
export function mockPointerLockPolicy() {
  return vi.spyOn(platform.engine, 'webkit', 'get').mockReturnValue(false);
}

/** Pinned Root/ScrubArea tests define clipboardData on a native event in browsers. */
export function pasteText(input: HTMLInputElement, text: string) {
  const event = new Event('paste', { bubbles: true, cancelable: true });
  Object.defineProperty(event, 'clipboardData', {
    value: { getData: (type: string) => type === 'text/plain' ? text : '' },
  });
  return fireEvent(input, event);
}

/** Assert exact coordinates/scale after the browser's own CSSOM serialization. */
export function expectCursorTransform(cursor: HTMLElement, x: number, y: number, scale = 1) {
  const expected = cursor.ownerDocument.createElement('span');
  expected.style.transform = `translate3d(${x}px,${y}px,0) scale(${scale})`;
  expect(cursor.style.transform).toBe(expected.style.transform);
}
