// Base UI Drawer keyboard targeting, MIT, source SHA 19511bb171f3b360b006c94cf6d07e53cb446505.
import { getParentNode, isHTMLElement } from '@floating-ui/utils/dom';
import { ownerWindow } from '../../utils/owner';
import { activeElement, closest } from '../../utils/shadowDom';
import { isInteractiveElement } from '../../floating-ui-react/utils/element';
import { getElementAtPoint } from '../../utils/getElementAtPoint';
import { findScrollableTouchTarget } from '../../utils/scrollable';

const INPUT_TYPES = new Set(['email', 'number', 'password', 'search', 'tel', 'text', 'url']);
export const KEYBOARD_TAP_BLOCKED = Symbol('KeyboardTapBlocked');
export interface KeyboardTouchTarget { focusTarget: HTMLElement; clickTarget: HTMLElement }
export function isKeyboardInputElement(element: HTMLElement): boolean {
  if (element.isContentEditable) return true;
  const win = ownerWindow(element);
  return (element instanceof win.HTMLTextAreaElement || (element instanceof win.HTMLInputElement && INPUT_TYPES.has(element.type))) && !element.matches(':disabled');
}
export function resolveKeyboardInputTarget(target: EventTarget | null): HTMLElement | null {
  if (!isHTMLElement(target)) return null;
  if (isKeyboardInputElement(target)) {
    let host = target;
    if (target.isContentEditable) while (host.parentElement?.isContentEditable) host = host.parentElement;
    return host;
  }
  const control = closest(target, 'label')?.control;
  return isHTMLElement(control) && isKeyboardInputElement(control) ? control : null;
}
export function resolveKeyboardTouchTarget(target: EventTarget | null): KeyboardTouchTarget | null {
  if (!isHTMLElement(target)) return null;
  const focusTarget = resolveKeyboardInputTarget(target);
  return focusTarget ? { focusTarget, clickTarget: target } : null;
}
export function resolveKeyboardTouchTargetFromPoint(root: Node, x: number, y: number): KeyboardTouchTarget | typeof KEYBOARD_TAP_BLOCKED | null {
  const exact = getElementAtPoint(root, x, y);
  const target = resolveKeyboardTouchTarget(exact);
  if (target) return target;
  if (isInteractiveElement(exact) || closest(exact, 'label')) return KEYBOARD_TAP_BLOCKED;
  for (const [dx, dy] of [[0, 16], [0, -16], [16, 0], [-16, 0]]) {
    const focusTarget = resolveKeyboardInputTarget(getElementAtPoint(root, x + dx, y + dy));
    if (focusTarget) return { focusTarget, clickTarget: focusTarget };
  }
  return null;
}
export function overrideGeometryDuringFocus(target: HTMLElement, y: number) {
  const { opacity, transform, transition } = target.style;
  target.style.transition = 'none';
  target.style.opacity = '0';
  target.style.transform = `translateY(${y}px)`;
  return () => { target.style.opacity = opacity; target.style.transform = transform; target.style.transition = transition; };
}
export function focusKeyboardInputWithoutPageScroll(target: HTMLElement) {
  const focused = activeElement(target.ownerDocument) === target;
  const restore = overrideGeometryDuringFocus(target, -2000);
  try { if (focused) target.blur(); target.focus({ preventScroll: true }); } finally { restore(); }
}
export function dispatchKeyboardClick(target: HTMLElement, touch: Pick<Touch, 'clientX' | 'clientY'>) {
  const win = ownerWindow(target);
  const Ctor = win.PointerEvent ?? win.MouseEvent;
  target.dispatchEvent(new Ctor('click', { bubbles: true, cancelable: true, clientX: touch.clientX, clientY: touch.clientY, detail: 1, view: win }));
}
export function findKeyboardScrollTarget(target: HTMLElement, root: HTMLElement) {
  const start = getParentNode(target);
  return findScrollableTouchTarget(start, root, 'vertical') ?? findScrollableTouchTarget(start, root, 'vertical', true);
}
