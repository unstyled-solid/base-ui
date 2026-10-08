// Native RC13 translation of Base UI useSwipeDismiss (19511bb), MIT.
import { createEffect, createMemo, createSignal, onCleanup, untrack, type Accessor } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { closest, contains, getTarget } from '../floating-ui-react/utils/element';
import { findScrollableTouchTarget, hasScrollableAncestor, type ScrollAxis } from './scrollable';
import { getElementAtPoint } from './getElementAtPoint';
import { getElementTransform } from './getElementTransform';
import { isHTMLElement } from '@floating-ui/utils/dom';
export type SwipeDirection = 'up' | 'down' | 'left' | 'right';
type NativeEvent = PointerEvent | TouchEvent;
type Point = { x: number; y: number };
export interface UseSwipeDismissDetails { nativeEvent: NativeEvent; direction: SwipeDirection | undefined }
export interface UseSwipeDismissProgressDetails { deltaX: number; deltaY: number; direction: SwipeDirection | undefined }
export interface SwipeReleaseDetails extends UseSwipeDismissProgressDetails { event: NativeEvent; velocityX: number; velocityY: number; releaseVelocityX: number; releaseVelocityY: number }
export interface UseSwipeDismissOptions {
  enabled: boolean; directions: readonly SwipeDirection[]; elementRef: Accessor<HTMLElement | null>; movementCssVars: { x: string; y: string };
  swipeThreshold?: number | ((details: { element: HTMLElement; direction: SwipeDirection }) => number) | undefined;
  canStart?: ((position: Point, details: UseSwipeDismissDetails) => boolean) | undefined;
  ignoreScrollableAncestors?: boolean | undefined; ignoreSelectorWhenTouch?: boolean | undefined; trackDrag?: boolean | undefined;
  onSwipeStart?: ((event: NativeEvent) => void) | undefined;
  onProgress?: ((progress: number, details?: UseSwipeDismissProgressDetails) => void) | undefined;
  onCancel?: ((event: NativeEvent) => void) | undefined; onSwipingChange?: ((swiping: boolean) => void) | undefined;
  onRelease?: ((details: SwipeReleaseDetails) => boolean | void) | undefined;
  onDismiss?: ((event: NativeEvent, details: { direction: SwipeDirection }) => void) | undefined;
}
export interface UseSwipeDismissState {}
export interface UseSwipeDismissReturnValue {
  readonly swiping: boolean; readonly swipeDirection: SwipeDirection | undefined; readonly dragDismissed: boolean;
  getPointerProps(): { onPointerDown?: (event: PointerEvent) => void; onPointerMove?: (event: PointerEvent) => void; onPointerUp?: (event: PointerEvent) => void; onPointerCancel?: (event: PointerEvent) => void };
  getTouchProps(): { onTouchStart?: (event: TouchEvent) => void; onTouchMove?: (event: TouchEvent) => void; onTouchEnd?: (event: TouchEvent) => void; onTouchCancel?: (event: TouchEvent) => void };
  moveNative(event: TouchEvent, currentTarget: HTMLElement): void;
  getDragStyles(): JSX.CSSProperties; reset(): void;
}
export function getDisplacement(direction: SwipeDirection, x: number, y: number): number { return direction === 'up' ? -y : direction === 'down' ? y : direction === 'left' ? -x : x; }
const timestamp = (event: NativeEvent): number | null => Number.isFinite(event.timeStamp) && event.timeStamp > 0 ? event.timeStamp : null;
const position = (event: NativeEvent): Point | null => 'touches' in event ? event.touches[0] ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null : { x: event.clientX, y: event.clientY };
const touchLike = (event: NativeEvent) => 'touches' in event || event.pointerType === 'touch';
export function createSwipeDismiss(options: UseSwipeDismissOptions): UseSwipeDismissReturnValue {
  const [published, publish] = createSignal({ swiping: false, direction: undefined as SwipeDirection | undefined, dismissed: false });
  let swiping = false, dismissed = false, direction: SwipeDirection | undefined;
  let start: Point = { x: 0, y: 0 }, offset: Point = { x: 0, y: 0 }, baseline: Point = { x: 0, y: 0 }, lastPosition: Point | null = null;
  let initial = { x: 0, y: 0, scale: 1 }, size = { width: 0, height: 0 }, firstMove = false, canceled = false;
  let maxDisplacement = 0, progress = 0, lastDetails: UseSwipeDismissProgressDetails | undefined;
  let pending: Point | null = null, fromScrollable = false, sawButtons = false, threshold = 40;
  let startTime: number | null = null, sample: (Point & { time: number }) | null = null, stationarySample = false, velocity: Point = { x: 0, y: 0 };
  let styleSnapshot: { element: HTMLElement; transition: string; transform: string; writtenTransform: string } | undefined;
  let capture: { element: HTMLElement; id: number } | undefined;
  const horizontal = () => options.directions.includes('left') || options.directions.includes('right');
  const vertical = () => options.directions.includes('up') || options.directions.includes('down');
  const axis = (): ScrollAxis => horizontal() ? 'horizontal' : 'vertical';
  const primary = () => options.directions.length === 1 ? options.directions[0] : undefined;
  const snapshot = () => publish({ swiping, direction, dismissed });
  const setSwiping = (next: boolean) => { if (swiping !== next) { swiping = next; snapshot(); options.onSwipingChange?.(next); } };
  function releaseCapture() {
    const current = capture; capture = undefined;
    if (!current || typeof current.element.releasePointerCapture !== 'function') return;
    try { current.element.releasePointerCapture(current.id); } catch (error) { if (!(error && typeof error === 'object' && 'name' in error && error.name === 'NotFoundError')) throw error; }
  }
  function syncStyles(active: boolean) {
    const element = untrack(options.elementRef);
    if (options.trackDrag === false || !element) { if (!active) styleSnapshot = undefined; return; }
    if (active) {
      styleSnapshot ??= { element, transition: element.style.transition, transform: element.style.transform, writtenTransform: '' };
      const transform = `translate3d(${offset.x}px,${offset.y}px,0) scale(${initial.scale})`;
      element.style.transition = 'none'; element.style.transform = transform;
      // CSSOM normalizes whitespace. Compare against our actual written value
      // when restoring, while still preserving a consumer's later replacement.
      styleSnapshot.writtenTransform = element.style.transform;
    } else if (styleSnapshot) {
      const saved = styleSnapshot; styleSnapshot = undefined;
      if (saved.element.style.transition === 'none') saved.element.style.transition = saved.transition;
      if (saved.element.style.transform === saved.writtenTransform) saved.element.style.transform = saved.transform;
    }
    element.style.setProperty(options.movementCssVars.x, `${offset.x - initial.x}px`);
    element.style.setProperty(options.movementCssVars.y, `${offset.y - initial.y}px`);
  }
  function updateProgress(value: number, details?: UseSwipeDismissProgressDetails) {
    const next = Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0;
    const changed = next !== progress;
    const detailsChanged = details && (!lastDetails || details.deltaX !== lastDetails.deltaX || details.deltaY !== lastDetails.deltaY || details.direction !== lastDetails.direction);
    if (!changed && !detailsChanged) return;
    progress = next;
    if (details) lastDetails = details; else if (changed) lastDetails = undefined;
    options.onProgress?.(next, details);
  }
  function record(time: number | null) {
    if (time === null) return;
    if (sample && time > sample.time) {
      const stationary = Math.abs(offset.x - sample.x) < 1 && Math.abs(offset.y - sample.y) < 1;
      const skip = stationary && !stationarySample; stationarySample = stationary;
      if (skip) return;
      const duration = Math.max(time - sample.time, 16);
      velocity = { x: (offset.x - sample.x) / duration, y: (offset.y - sample.y) / duration };
    }
    sample = { ...offset, time };
  }
  function reset() {
    releaseCapture(); setSwiping(false); dismissed = false; direction = undefined; updateProgress(0);
    start = { x: 0, y: 0 }; offset = { x: 0, y: 0 }; initial = { x: 0, y: 0, scale: 1 }; baseline = { x: 0, y: 0 }; lastPosition = null;
    maxDisplacement = 0; canceled = false; firstMove = false; pending = null; fromScrollable = false; sawButtons = false;
    size = { width: 0, height: 0 }; startTime = null; sample = null; stationarySample = false; velocity = { x: 0, y: 0 }; lastDetails = undefined;
    syncStyles(false); snapshot();
  }
  function scrollTarget(target: EventTarget | null, root: HTMLElement) {
    const found = findScrollableTouchTarget(target, root, axis());
    const doc = root.ownerDocument;
    return found === doc.body || found === doc.documentElement ? null : found;
  }
  function targetAt(point: Point, event: NativeEvent) { return getElementAtPoint(untrack(options.elementRef)?.getRootNode(), point.x, point.y) ?? getTarget(event) as HTMLElement | null; }
  function resolveThreshold() { const element = untrack(options.elementRef); if (direction && element && typeof options.swipeThreshold === 'function') threshold = Math.max(0, options.swipeThreshold({ element, direction })); }
  function activate(event: NativeEvent, point: Point, ignoreScrollable = false): boolean {
    const element = untrack(options.elementRef); if (!element) return false;
    const target = targetAt(point, event), touch = touchLike(event);
    const scrollable = touch ? scrollTarget(target, element.ownerDocument.body) : null;
    if (scrollable && !ignoreScrollable) return false;
    if (closest(target, 'button,a,input,select,textarea,label,[role="button"]') && (!touch || options.ignoreSelectorWhenTouch !== false)) return false;
    const scrollElement = isHTMLElement(target) ? target : target?.parentElement;
    if (options.ignoreScrollableAncestors && scrollElement && !ignoreScrollable && hasScrollableAncestor(scrollElement, element, axis())) return false;
    fromScrollable = !!scrollable && ignoreScrollable; canceled = false; direction = undefined; maxDisplacement = 0;
    start = point; baseline = point; lastPosition = point; startTime = timestamp(event); sample = null; stationarySample = false; velocity = { x: 0, y: 0 };
    threshold = Math.max(0, typeof options.swipeThreshold === 'number' ? options.swipeThreshold : 40);
    direction = primary(); resolveThreshold(); direction = undefined;
    size = { width: element.offsetWidth, height: element.offsetHeight }; initial = getElementTransform(element); offset = { x: initial.x, y: initial.y }; record(startTime);
    if (!('touches' in event) && typeof element.setPointerCapture === 'function') {
      try { element.setPointerCapture(event.pointerId); capture = { element, id: event.pointerId }; } catch (error) { if (!(error && typeof error === 'object' && 'name' in error && error.name === 'NotFoundError')) throw error; }
    }
    options.onSwipeStart?.(event); setSwiping(true); firstMove = true; updateProgress(0); syncStyles(true); return true;
  }
  function startHandler(event: NativeEvent) {
    if (!options.enabled || event.defaultPrevented || (!('touches' in event) && event.button !== 0)) return;
    const point = position(event); if (!point) return;
    pending = point; fromScrollable = false; sawButtons = !('touches' in event);
    if (options.canStart && !options.canStart(point, { nativeEvent: event, direction: primary() })) return;
    if (activate(event, point)) pending = null;
  }
  function cancel(event: NativeEvent) {
    pending = null; fromScrollable = false; lastPosition = null;
    if (!swiping) return;
    setSwiping(false); offset = { x: initial.x, y: initial.y }; direction = undefined; sawButtons = false; syncStyles(false); releaseCapture();
    updateProgress(0, { deltaX: 0, deltaY: 0, direction: undefined }); options.onCancel?.(event); snapshot();
  }
  function endHandler(event: NativeEvent) {
    if (!options.enabled) return;
    const deltaX = offset.x - initial.x, deltaY = offset.y - initial.y;
    const details = { deltaX, deltaY, direction };
    pending = null; fromScrollable = false; lastPosition = null;
    if (!swiping) { updateProgress(0, details); return; }
    setSwiping(false); sawButtons = false; releaseCapture();
    const endTime = timestamp(event), duration = startTime !== null && endTime !== null && endTime > startTime ? Math.max(endTime - startTime, 50) : 0;
    let releaseX = velocity.x, releaseY = velocity.y;
    if (sample && endTime !== null && endTime >= sample.time) {
      const age = endTime - sample.time;
      if (age > 80) { releaseX = 0; releaseY = 0; }
      else { const duration = Math.max(age, 16), x = offset.x - sample.x, y = offset.y - sample.y; if (Math.abs(x) >= 1) releaseX = x / duration; if (Math.abs(y) >= 1) releaseY = y / duration; }
    }
    const decision = options.onRelease?.({ event, direction, deltaX, deltaY, velocityX: duration ? deltaX / duration : 0, velocityY: duration ? deltaY / duration : 0, releaseVelocityX: releaseX, releaseVelocityY: releaseY });
    const explicit = typeof decision === 'boolean';
    let close = false, dismissDirection: SwipeDirection | undefined;
    if (explicit) { close = decision; dismissDirection = direction ?? primary(); }
    else if (!canceled) { dismissDirection = options.directions.find((candidate) => getDisplacement(candidate, deltaX, deltaY) > threshold); close = !!dismissDirection; }
    if (close && dismissDirection) { direction = dismissDirection; dismissed = true; syncStyles(false); options.onDismiss?.(event, { direction: dismissDirection }); }
    else { offset = { x: initial.x, y: initial.y }; direction = undefined; syncStyles(false); updateProgress(0, details); }
    snapshot();
  }
  function moveHandler(event: NativeEvent, boundary = event.currentTarget as HTMLElement) {
    if (!options.enabled) return;
    const point = position(event); if (!point) return;
    let endAfter = false;
    if (!('touches' in event)) {
      const primaryButton = event.buttons % 2 === 1;
      if (primaryButton) sawButtons = true;
      if (event.buttons !== 0 && !primaryButton) { cancel(event); return; }
      if (!event.buttons && sawButtons) { if (!swiping) { endHandler(event); return; } endAfter = true; }
    }
    if (!swiping && pending) {
      if (!touchLike(event) && event.defaultPrevented) { pending = null; lastPosition = null; return; }
      if (!options.canStart || options.canStart(point, { nativeEvent: event, direction: primary() })) {
        const origin = pending, element = untrack(options.elementRef); let allowScrollable = false;
        if (touchLike(event) && element) {
          const target = targetAt(point, event), scrollable = scrollTarget(target, element.ownerDocument.body);
          if (scrollable && (contains(element, scrollable) || contains(scrollable, element))) {
            const delta = horizontal() ? point.x - origin.x : point.y - origin.y;
            const current = horizontal() ? scrollable.scrollLeft : scrollable.scrollTop;
            const maximum = horizontal() ? scrollable.scrollWidth - scrollable.clientWidth : scrollable.scrollHeight - scrollable.clientHeight;
            const towardStart = horizontal() ? 'right' : 'down', towardEnd = horizontal() ? 'left' : 'up';
            if (delta) { allowScrollable = delta > 0 && current <= 0 && options.directions.includes(towardStart) || delta < 0 && current >= Math.max(0, maximum) && options.directions.includes(towardEnd); if (!allowScrollable) return; }
          }
        }
        if (activate(event, point, allowScrollable)) {
          pending = null;
          if (allowScrollable) { start = origin; baseline = origin; lastPosition = origin; firstMove = false; }
          else fromScrollable = false;
        }
      }
    }
    const movement = lastPosition ? { x: point.x - lastPosition.x, y: point.y - lastPosition.y } : { x: 0, y: 0 }; lastPosition = point;
    if (!swiping) return;
    if (touchLike(event) && !fromScrollable && boundary && scrollTarget(getTarget(event), boundary)) return;
    if (!('touches' in event)) event.preventDefault();
    if (firstMove) {
      firstMove = false;
      if (options.trackDrag !== false) { start = point; startTime = timestamp(event) ?? startTime; sample = null; stationarySample = false; }
    }
    if ((movement.y < 0 && point.y > baseline.y) || (movement.y > 0 && point.y < baseline.y)) baseline = { ...baseline, y: point.y };
    if ((movement.x < 0 && point.x > baseline.x) || (movement.x > 0 && point.x < baseline.x)) baseline = { ...baseline, x: point.x };
    const deltaX = point.x - start.x, deltaY = point.y - start.y;
    if (!direction) {
      const candidate: SwipeDirection = Math.abs(deltaX) >= Math.abs(deltaY) ? deltaX > 0 ? 'right' : 'left' : deltaY > 0 ? 'down' : 'up';
      if (options.directions.includes(candidate)) { direction = candidate; maxDisplacement = getDisplacement(direction, deltaX, deltaY); resolveThreshold(); }
    } else {
      const displacement = getDisplacement(direction, point.x - baseline.x, point.y - baseline.y);
      if (displacement > threshold) canceled = false;
      else if (!(options.directions.includes('left') && options.directions.includes('right')) && !(options.directions.includes('up') && options.directions.includes('down')) && maxDisplacement - displacement >= 10) canceled = true;
    }
    const damp = (value: number, negative: boolean, positive: boolean) => (!negative && value < 0) || (!positive && value > 0) ? Math.sign(value) * Math.abs(value) ** 0.5 : value;
    const x = initial.x + (horizontal() ? damp(deltaX, options.directions.includes('left'), options.directions.includes('right')) : 0);
    const y = initial.y + (vertical() ? damp(deltaY, options.directions.includes('up'), options.directions.includes('down')) : 0);
    const changed = x !== offset.x || y !== offset.y; offset = { x, y }; if (changed) syncStyles(true); record(timestamp(event));
    const details = { deltaX: x - initial.x, deltaY: y - initial.y, direction }, progressDirection = primary() ?? direction;
    const extent = progressDirection && (progressDirection === 'left' || progressDirection === 'right' ? size.width : size.height), scale = initial.scale || 1;
    const displacement = progressDirection ? getDisplacement(progressDirection, details.deltaX, details.deltaY) : 0;
    updateProgress(extent && extent > 0 && scale > 0 && displacement > 0 ? displacement / (extent * scale) : 0, details); snapshot();
    if (endAfter) endHandler(event);
  }
  const resource = createMemo(() => ({ enabled: options.enabled, element: options.elementRef() }), {
    equals: (a, b) => a.enabled === b.enabled && a.element === b.element,
  });
  createEffect(resource, (next) => {
    if (!next.enabled) untrack(reset);
    return () => { releaseCapture(); if (styleSnapshot && styleSnapshot.element === next.element) syncStyles(false); };
  });
  onCleanup(() => { releaseCapture(); untrack(() => syncStyles(false)); });
  return {
    get swiping() { return published().swiping; }, get swipeDirection() { return published().direction; }, get dragDismissed() { return published().dismissed; },
    getPointerProps: () => options.enabled ? { onPointerDown: startHandler, onPointerMove: (event) => moveHandler(event), onPointerUp: endHandler, onPointerCancel: endHandler } : {},
    getTouchProps: () => options.enabled ? { onTouchStart: startHandler, onTouchMove: (event) => moveHandler(event), onTouchEnd: endHandler, onTouchCancel: endHandler } : {},
    moveNative: moveHandler,
    getDragStyles() {
      published();
      const x = offset.x - initial.x, y = offset.y - initial.y;
      if (!swiping && x === 0 && y === 0 && !dismissed) return { [options.movementCssVars.x]: '0px', [options.movementCssVars.y]: '0px' };
      return { transition: swiping ? 'none' : undefined, transform: swiping ? `translate3d(${offset.x}px,${offset.y}px,0) scale(${initial.scale})` : undefined, [options.movementCssVars.x]: `${x}px`, [options.movementCssVars.y]: `${y}px` };
    }, reset,
  };
}
export { createSwipeDismiss as useSwipeDismiss };
