// Modified from Base UI 19511bb171f3b360b006c94cf6d07e53cb446505: native event types and local platform access.
// Virtual-event predicates inherit Copyright 2022 Adobe, Apache-2.0, and React MIT.
// See notices/react-spectrum-Apache-2.0.txt and notices/react-spectrum-React-NOTICE.txt.
import { platform } from '../../utils/platform';
export function stopEvent(event: Event) { event.preventDefault(); event.stopPropagation(); }
// Base UI's source-derived virtual event predicates (Adobe React Aria attribution).
export function isVirtualClick(event: MouseEvent | PointerEvent) {
  const pointer = event as PointerEvent;
  if (pointer.pointerType === '' && event.isTrusted) return true;
  if (platform.os.android && pointer.pointerType) return event.type === 'click' && event.buttons === 1;
  return event.detail === 0 && !pointer.pointerType;
}
export function isVirtualPointerEvent(event: PointerEvent) {
  if (platform.env.jsdom) return false;
  return (!platform.os.android && event.width === 0 && event.height === 0) ||
    (event.type === 'pointerdown' && event.width === 1 && event.height === 1 && event.pressure === 0 && event.detail === 0 && event.pointerType === 'mouse' && (platform.os.android || event.buttons === 0)) ||
    (event.width < 1 && event.height < 1 && event.pressure === 0 && event.detail === 0 && event.pointerType === 'touch');
}
export function isMouseLikePointerType(pointerType: string | undefined, strict?: boolean) { return ['mouse', 'pen', ...(!strict ? ['', undefined] : [])].includes(pointerType); }
export function isClickLikeEvent(event: Event) { return ['click', 'mousedown', 'keydown', 'keyup'].includes(event.type); }
