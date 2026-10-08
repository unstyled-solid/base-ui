// Drawer-specific scroll arbitration from pinned Base UI DrawerViewport (MIT).
import { isElement } from '@floating-ui/utils/dom';
import { activeElement, contains } from '../../utils/shadowDom';
import type { DrawerSwipeDirection } from '../root/snapPoints';
export type ScrollAxis = 'horizontal' | 'vertical';
export interface TouchScrollState {
  startX: number; startY: number; lastX: number; lastY: number;
  scrollTarget: HTMLElement | null;
  hasCrossAxisGestureTarget: boolean;
  allowSwipe: boolean | null;
  preserveNativeCrossAxisScroll: boolean;
  drawerAxisAttributed: boolean;
}
export function shouldYieldTouchMove(state: TouchScrollState, event: Pick<TouchEvent, 'cancelable'>, touch: Pick<Touch, 'clientX' | 'clientY'>, vertical: boolean): boolean {
  if (state.preserveNativeCrossAxisScroll) return true;
  if (state.drawerAxisAttributed || state.allowSwipe === true || !state.hasCrossAxisGestureTarget) return false;
  if (!event.cancelable) { state.preserveNativeCrossAxisScroll = true; return true; }
  const drawerDelta = Math.abs(vertical ? touch.clientY - state.startY : touch.clientX - state.startX);
  const crossDelta = Math.abs(vertical ? touch.clientX - state.startX : touch.clientY - state.startY);
  if (crossDelta >= 6 && crossDelta > drawerDelta + 2) { state.preserveNativeCrossAxisScroll = true; return true; }
  if (drawerDelta >= 6) { state.drawerAxisAttributed = true; return false; }
  return true;
}
export function getScrollMetrics(target: HTMLElement, axis: ScrollAxis) {
  return axis === 'vertical' ? { offset: target.scrollTop, max: Math.max(0, target.scrollHeight - target.clientHeight) } : { offset: target.scrollLeft, max: Math.max(0, target.scrollWidth - target.clientWidth) };
}
export function isAtSwipeStartEdge(target: HTMLElement, axis: ScrollAxis, direction: DrawerSwipeDirection) {
  const start = axis === 'vertical' ? direction === 'down' : direction === 'right';
  const { offset, max } = getScrollMetrics(target, axis);
  return start ? offset <= 0 : offset >= max;
}
export function canSwipeFromScrollEdgeOnMove(target: HTMLElement, axis: ScrollAxis, direction: DrawerSwipeDirection, delta: number) {
  const start = axis === 'vertical' ? direction === 'down' : direction === 'right';
  return (start ? delta > 0 : delta < 0) && isAtSwipeStartEdge(target, axis, direction);
}
export function shouldIgnoreSwipeForTextSelection(doc: Document, root: HTMLElement) {
  const focused = activeElement(doc);
  if (focused && contains(root, focused) && (focused.tagName === 'INPUT' || focused.tagName === 'TEXTAREA')) {
    const field = focused as HTMLInputElement | HTMLTextAreaElement;
    if (field.selectionStart != null && field.selectionEnd != null && field.selectionStart < field.selectionEnd) return true;
  }
  const selection = doc.getSelection?.();
  if (!selection || selection.isCollapsed) return false;
  const anchor = isElement(selection.anchorNode) ? selection.anchorNode : selection.anchorNode?.parentElement;
  const focus = isElement(selection.focusNode) ? selection.focusNode : selection.focusNode?.parentElement;
  return selection.containsNode(root, true) || contains(root, anchor) || contains(root, focus);
}
export function getBaseSwipeSize(element: HTMLElement, direction: DrawerSwipeDirection) { return direction === 'left' || direction === 'right' ? element.offsetWidth : element.offsetHeight; }
export function getBaseSwipeThreshold(element: HTMLElement, direction: DrawerSwipeDirection) { return Math.max(10, getBaseSwipeSize(element, direction) * 0.5); }
