import { createEffect, createSignal, onCleanup, untrack, type Accessor } from 'solid-js';
import { acquirePointerCapture, releasePointerCapture } from '../utils/pointerCapture';
export interface PointerSessionParameters {
  element: Accessor<HTMLElement | null>; disabled?: boolean | undefined;
  onMove(event: PointerEvent): void; onEnd(event: PointerEvent, finish: () => boolean): void; onCancel(): void;
  capture?: boolean | undefined;
  eventTarget?: Accessor<EventTarget | null> | undefined;
  listenerCapture?: boolean | undefined;
  /** Retain move/cancel resources until onEnd's idempotent finish is called. */
  deferEnd?: boolean | undefined;
}
/** One raw pointer transaction owns its document listeners and capture resource. */
export function createPointerSession(params: PointerSessionParameters) {
  const [active, setActive] = createSignal(false);
  let disposed = false;
  let current: { pointerId: number; element: HTMLElement; ending: boolean; cleanup(): void } | undefined;
  const cancel = () => {
    const session = current; if (!session) return;
    current = undefined; session.cleanup(); setActive(false); params.onCancel();
  };
  createEffect(() => ({ disabled: params.disabled, element: params.element() }), (next) => {
    if (next.disabled || current && current.element !== next.element) untrack(cancel);
  });
  onCleanup(() => { disposed = true; untrack(cancel); });
  return {
    active,
    cancel,
    start(event: PointerEvent) {
      if (disposed) return;
      cancel();
      const element = untrack(params.element);
      if (!element || params.disabled || event.button !== 0) return;
      const target = params.eventTarget?.() ?? element.ownerDocument, id = event.pointerId;
      const listenerCapture = params.listenerCapture ?? false, capture = params.capture;
      const move = (event: PointerEvent) => { if (event.pointerId === id && current === session) params.onMove(event); };
      const finish = () => {
        if (current !== session) return false;
        current = undefined; session.cleanup(); setActive(false); return true;
      };
      const end = (event: PointerEvent) => {
        if (event.pointerId !== id || current !== session) return;
        if (event.type === 'pointercancel') { finish(); params.onCancel(); return; }
        if (session.ending) return;
        session.ending = true;
        if (!params.deferEnd) finish();
        params.onEnd(event, finish);
      };
      const session = { pointerId: id, element, ending: false, cleanup() { target.removeEventListener('pointermove', move as EventListener, listenerCapture); target.removeEventListener('pointerup', end as EventListener, listenerCapture); target.removeEventListener('pointercancel', end as EventListener, listenerCapture); if (capture) releasePointerCapture(element, id); } };
      current = session;
      target.addEventListener('pointermove', move as EventListener, listenerCapture); target.addEventListener('pointerup', end as EventListener, listenerCapture); target.addEventListener('pointercancel', end as EventListener, listenerCapture);
      if (capture) acquirePointerCapture(element, id);
      setActive(true);
    },
  };
}
