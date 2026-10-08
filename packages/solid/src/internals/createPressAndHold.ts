import { createEffect, onCleanup, type Accessor } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { createTimeout } from '../utils/createTimeout';
import { createInterval } from '../utils/createInterval';
export function isTouchLikePointerType(type: string): boolean { return type === 'touch' || type === 'pen'; }
export interface UsePressAndHoldParameters {
  disabled: boolean; tick(event: MouseEvent | PointerEvent | TouchEvent): boolean;
  onStop?: ((event: PointerEvent) => void) | undefined;
  tickDelay?: number | undefined; startDelay?: number | undefined; scrollDistance?: number | undefined;
  elementRef: Accessor<HTMLElement | null>;
}
export interface UsePressAndHoldReturnValue {
  pointerHandlers: Pick<JSX.HTMLAttributes<HTMLElement>, 'onTouchStart' | 'onTouchEnd' | 'onPointerDown' | 'onPointerUp' | 'onPointerMove' | 'onMouseEnter' | 'onMouseLeave' | 'onMouseUp'> & {
    onPointerDown(event: PointerEvent): void; onPointerUp(event: PointerEvent): void; onPointerMove(event: PointerEvent): void;
  };
  shouldSkipClick(event: MouseEvent): boolean;
}
export function createPressAndHold(params: UsePressAndHoldParameters): UsePressAndHoldReturnValue {
  const startTimeout = createTimeout(), intentional = createTimeout(), interval = createInterval();
  let pressed = false, moves = 0, touching = false, ignoredClick = false, pointerType = '';
  let coords = { x: 0, y: 0 };
  let removeContext = () => {}, removeRelease = () => {};
  const stop = () => { intentional.clear(); startTimeout.clear(); interval.clear(); removeContext(); moves = 0; };
  const start = (event: MouseEvent | PointerEvent | TouchEvent) => {
    stop(); const element = params.elementRef(); if (!element || params.disabled) return;
    const win = element.ownerDocument.defaultView!;
    const context = (event: Event) => event.preventDefault();
    win.addEventListener('contextmenu', context); removeContext = () => { win.removeEventListener('contextmenu', context); };
    removeRelease();
    const release = (event: PointerEvent) => { pressed = false; stop(); params.onStop?.(event); };
    win.addEventListener('pointerup', release, { once: true }); removeRelease = () => win.removeEventListener('pointerup', release);
    if (!params.tick(event)) { stop(); return; }
    startTimeout.start(params.startDelay ?? 400, () => { interval.start(params.tickDelay ?? 60, () => { if (params.disabled || !params.tick(event)) stop(); }); });
  };
  onCleanup(() => { pressed = false; stop(); removeRelease(); });
  createEffect(() => params.disabled, (disabled) => { if (disabled) { pressed = false; touching = false; pointerType = ''; stop(); } });
  return {
    pointerHandlers: {
      onTouchStart() { touching = true; }, onTouchEnd() { touching = false; },
      onPointerDown(event: PointerEvent) {
        if (event.defaultPrevented || event.button || params.disabled) return;
        pointerType = event.pointerType; ignoredClick = false; pressed = true; coords = { x: event.clientX, y: event.clientY };
        if (!isTouchLikePointerType(pointerType)) { event.preventDefault(); start(event); }
        else intentional.start(50, () => {
          const moved = moves; moves = 0;
          if (pressed && moved < 3) { start(event); ignoredClick = true; }
          else { ignoredClick = false; stop(); }
        });
      },
      onPointerUp(event: PointerEvent) { if (isTouchLikePointerType(event.pointerType)) pressed = false; },
      onPointerMove(event: PointerEvent) { if (params.disabled || !isTouchLikePointerType(event.pointerType) || !pressed) return; moves++;
        if ((coords.x - event.clientX) ** 2 + (coords.y - event.clientY) ** 2 > (params.scrollDistance ?? 8) ** 2) stop(); },
      onMouseEnter(event: MouseEvent) { if (!event.defaultPrevented && !params.disabled && pressed && !touching && !isTouchLikePointerType(pointerType)) start(event); },
      onMouseLeave() { if (!touching) stop(); }, onMouseUp() { if (!touching) stop(); },
    },
    shouldSkipClick(event) { return event.defaultPrevented || (isTouchLikePointerType(pointerType) ? ignoredClick : event.detail !== 0); },
  };
}
export { createPressAndHold as usePressAndHold };
