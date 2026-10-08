// Extracted native ToastRoot gesture policy from Base UI 19511bb, MIT.
import { createEffect, createSignal, onCleanup, untrack, type Accessor } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { getTarget, closest, contains } from '../floating-ui-react/utils/element';
import { getElementTransform } from './getElementTransform';
import { getDisplacement, type SwipeDirection } from './createSwipeDismiss';
import { acquirePointerCapture, releasePointerCapture } from './pointerCapture';
export interface ToastSwipeParameters {
  element: Accessor<HTMLElement | null>; directions: Accessor<readonly SwipeDirection[]>;
  onStart(event: PointerEvent): void; onDismiss(direction: SwipeDirection): void;
}
export function createToastSwipe(params: ToastSwipeParameters) {
  const [state, publish] = createSignal({ swiping: false, direction: undefined as SwipeDirection | undefined, offset: { x: 0, y: 0 }, initial: { x: 0, y: 0, scale: 1 } });
  let active: { id: number; element: HTMLElement; cleanup(): void } | undefined;
  let first = false, realSwipe = false, locked: 'horizontal' | 'vertical' | null = null, canceled = false, intended: SwipeDirection | undefined;
  let start = { x: 0, y: 0 }, baseline = { x: 0, y: 0 }, offset = { x: 0, y: 0 }, initial = { x: 0, y: 0, scale: 1 }, maximum = 0;
  const snapshot = (swiping = !!active, direction = intended) => publish({ swiping, direction, offset, initial });
  const reset = () => { const previous = active; active = undefined; previous?.cleanup(); first = false; realSwipe = false; locked = null; canceled = false; intended = undefined; maximum = 0;
    initial = { x: 0, y: 0, scale: 1 }; offset = { x: 0, y: 0 }; snapshot(false, undefined); };
  const end = (event: PointerEvent) => {
    const session = active; if (!session || event.pointerId !== session.id) return;
    active = undefined; session.cleanup(); realSwipe = false; locked = null;
    if (event.type === 'pointercancel' || canceled) { offset = { x: initial.x, y: initial.y }; intended = undefined; snapshot(false, undefined); return; }
    const x = offset.x - initial.x, y = offset.y - initial.y;
    const direction = params.directions().find((direction) => getDisplacement(direction, x, y) > 40);
    if (direction) { intended = direction; snapshot(false, direction); params.onDismiss(direction); }
    else { offset = { x: initial.x, y: initial.y }; intended = undefined; snapshot(false, undefined); }
  };
  const move = (event: PointerEvent) => {
    if (!active || event.pointerId !== active.id) return;
    event.preventDefault();
    if (first) { start = { x: event.clientX, y: event.clientY }; first = false; }
    const { clientX: x, clientY: y, movementX, movementY } = event;
    if ((movementY < 0 && y > baseline.y) || (movementY > 0 && y < baseline.y)) baseline = { ...baseline, y };
    if ((movementX < 0 && x > baseline.x) || (movementX > 0 && x < baseline.x)) baseline = { ...baseline, x };
    const deltaX = x - start.x, deltaY = y - start.y, directions = params.directions();
    const horizontal = directions.includes('left') || directions.includes('right'), vertical = directions.includes('up') || directions.includes('down');
    if (!realSwipe && Math.hypot(deltaX, deltaY) >= 1) { realSwipe = true; if (horizontal && vertical) locked = Math.abs(deltaX) > Math.abs(deltaY) ? 'horizontal' : 'vertical'; }
    if (!intended) {
      const direction: SwipeDirection | undefined = locked === 'vertical' ? deltaY > 0 ? 'down' : deltaY < 0 ? 'up' : undefined
        : locked === 'horizontal' ? deltaX > 0 ? 'right' : deltaX < 0 ? 'left' : undefined
        : Math.abs(deltaX) >= Math.abs(deltaY) ? deltaX > 0 ? 'right' : 'left' : deltaY > 0 ? 'down' : 'up';
      if (direction && directions.includes(direction)) { intended = direction; maximum = getDisplacement(direction, deltaX, deltaY); }
    } else {
      const displacement = getDisplacement(intended, x - baseline.x, y - baseline.y);
      if (displacement > 40) canceled = false;
      else if (!(directions.includes('left') && directions.includes('right')) && !(directions.includes('up') && directions.includes('down')) && maximum - displacement >= 10) canceled = true;
    }
    const damp = (value: number, negative: SwipeDirection, positive: SwipeDirection) => (value > 0 && !directions.includes(positive)) || (value < 0 && !directions.includes(negative)) ? Math.sign(value) * Math.abs(value) ** 0.5 : value;
    offset = { x: initial.x + (locked !== 'vertical' && horizontal ? damp(deltaX, 'left', 'right') : 0), y: initial.y + (locked !== 'horizontal' && vertical ? damp(deltaY, 'up', 'down') : 0) };
    snapshot();
  };
  createEffect(() => ({ element: params.element(), directions: params.directions() }), (next) => {
    if (!next.element || !next.directions.length) { untrack(reset); return; }
    const element = next.element;
    const touch = (event: TouchEvent) => { if (active && contains(element, getTarget(event) as Element | null)) event.preventDefault(); };
    element.addEventListener('touchmove', touch, { passive: false });
    return () => { element.removeEventListener('touchmove', touch); if (active?.element === element) untrack(reset); };
  });
  onCleanup(() => { active?.cleanup(); active = undefined; });
  return {
    get swiping() { return state().swiping; }, get direction() { return state().direction; },
    get styles(): JSX.CSSProperties { const value = state(); return { transition: value.swiping ? 'none' : undefined, transform: value.swiping ? `translateX(${value.offset.x}px) translateY(${value.offset.y}px) scale(${value.initial.scale})` : undefined,
      '--toast-swipe-movement-x': `${value.offset.x - value.initial.x}px`, '--toast-swipe-movement-y': `${value.offset.y - value.initial.y}px` }; },
    onPointerDown(event: PointerEvent) {
      const element = untrack(params.element); if (!element || !params.directions().length || event.button !== 0 || event.defaultPrevented) return;
      const target = getTarget(event) as Element | null;
      if (closest(target, 'button,a,input,textarea,[role="button"],[data-base-ui-swipe-ignore],[data-swipe-ignore]')) return;
      active?.cleanup(); canceled = false; intended = undefined; maximum = 0; start = { x: event.clientX, y: event.clientY }; baseline = start;
      initial = getElementTransform(element); offset = { x: initial.x, y: initial.y }; first = true; realSwipe = false; locked = null;
      const doc = element.ownerDocument, id = event.pointerId;
      const session = { element, id, cleanup() { doc.removeEventListener('pointerup', end); doc.removeEventListener('pointercancel', end); releasePointerCapture(element, id); } };
      active = session; doc.addEventListener('pointerup', end); doc.addEventListener('pointercancel', end); acquirePointerCapture(element, id); snapshot(); params.onStart(event);
    },
    onPointerMove: move, onPointerUp: end, onPointerCancel: end, reset,
  };
}
