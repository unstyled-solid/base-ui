import { expect, it, vi } from 'vitest';
import { enqueueFocus } from './enqueueFocus';
it('schedules and cancels in the owner realm; stale cleanups cannot cancel a newer focus', () => {
  const frame = document.createElement('iframe'); document.body.append(frame);
  const win = frame.contentWindow!;
  const node = frame.contentDocument!.createElement('button'); frame.contentDocument!.body.append(node);
  const frames = new Map<number, FrameRequestCallback>(); let next = 0;
  const request = vi.spyOn(win, 'requestAnimationFrame').mockImplementation((cb) => { frames.set(++next, cb); return next; });
  const cancel = vi.spyOn(win, 'cancelAnimationFrame').mockImplementation((id) => { frames.delete(id); });
  const focus = vi.spyOn(node, 'focus');
  try {
    const first = enqueueFocus(node); const second = enqueueFocus(node, { preventScroll: true }); first();
    expect(cancel).toHaveBeenCalledWith(1); expect(frames.has(2)).toBe(true);
    frames.get(2)!(0); frames.delete(2);
    expect(focus).toHaveBeenCalledWith({ preventScroll: true }); second();
    let shouldFocus = false;
    const third = enqueueFocus(node, { shouldFocus: () => shouldFocus });
    frames.get(3)!(0); frames.delete(3); third();
    expect(focus).toHaveBeenCalledTimes(1);
    shouldFocus = true;
    enqueueFocus(node, { sync: true, shouldFocus: () => shouldFocus })();
    expect(focus).toHaveBeenCalledTimes(2);
    const pending = enqueueFocus(node); enqueueFocus(null); pending();
    expect(frames.size).toBe(0);
  } finally { request.mockRestore(); cancel.mockRestore(); focus.mockRestore(); frame.remove(); }
});
