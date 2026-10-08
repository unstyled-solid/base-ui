import { NOOP } from '../../utils/empty';
import { ownerWindow } from '../../utils/owner';
import type { FocusableElement } from './tabbable';
interface Options {
  preventScroll?: boolean | undefined;
  sync?: boolean | undefined;
  shouldFocus?: (() => boolean) | undefined;
}
// Keep the source's single latest-focus queue, but cancel in the scheduling realm.
let pending: { win: Window; id: number } | undefined;
export function enqueueFocus(el: FocusableElement | null, options: Options = {}) {
  const { preventScroll = false, sync = false, shouldFocus } = options;
  if (pending) { pending.win.cancelAnimationFrame(pending.id); pending = undefined; }
  function exec() {
    if (shouldFocus && !shouldFocus()) return;
    el?.focus({ preventScroll });
  }
  if (sync) { exec(); return NOOP; }
  if (!el) return NOOP;
  const win = ownerWindow(el);
  const frame = { win, id: 0 };
  frame.id = win.requestAnimationFrame(() => {
    if (pending === frame) pending = undefined;
    exec();
  });
  pending = frame;
  return () => {
    if (pending === frame) { win.cancelAnimationFrame(frame.id); pending = undefined; }
  };
}
