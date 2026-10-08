import { isHTMLElement } from '@floating-ui/utils/dom';
export { stopEvent } from '../../floating-ui-react/utils/event';
export { isIndexOutOfListBounds, isListIndexDisabled, findNonDisabledListIndex, getMaxListIndex, getMinListIndex } from '../../floating-ui-react/utils/composite';
export const ARROW_UP = 'ArrowUp', ARROW_DOWN = 'ArrowDown', ARROW_LEFT = 'ArrowLeft', ARROW_RIGHT = 'ArrowRight';
export const HOME = 'Home', END = 'End', PAGE_UP = 'PageUp', PAGE_DOWN = 'PageDown';
export const COMPOSITE_KEYS = new Set([ARROW_UP, ARROW_DOWN, ARROW_LEFT, ARROW_RIGHT, HOME, END]);
export const SHIFT = 'Shift';
export const MODIFIER_KEYS = ['Shift', 'Control', 'Alt', 'Meta'] as const;
export type ModifierKey = typeof MODIFIER_KEYS[number];
export function isNativeInput(element: EventTarget): element is HTMLInputElement | HTMLTextAreaElement { return isHTMLElement(element) && (element.tagName === 'TEXTAREA' || (element.tagName === 'INPUT' && (element as HTMLInputElement).selectionStart != null)); }
export function scrollIntoViewIfNeeded(container: HTMLElement | null, element: HTMLElement | null, direction: 'ltr' | 'rtl', orientation: 'horizontal' | 'vertical' | 'both'): void {
  if (!container || !element || !element.scrollTo) return;
  const win = container.ownerDocument.defaultView!, outer = win.getComputedStyle(container), inner = win.getComputedStyle(element);
  const numeric = (style: CSSStyleDeclaration, key: string) => parseFloat(style.getPropertyValue(key)) || 0;
  const offset = (axis: 'top' | 'left') => { let node = element, result = 0; while (node.offsetParent) { result += axis === 'top' ? node.offsetTop : node.offsetLeft; if (node.offsetParent === container) break; node = node.offsetParent as HTMLElement; } return result; };
  let x = container.scrollLeft, y = container.scrollTop;
  if (container.clientWidth < container.scrollWidth && orientation !== 'vertical') {
    const left = offset('left') - numeric(inner, 'scroll-margin-left') - numeric(outer, 'scroll-padding-left');
    const right = offset('left') + element.offsetWidth + numeric(inner, 'scroll-margin-right') - container.clientWidth + numeric(outer, 'scroll-padding-right');
    if (direction === 'rtl') { if (left < x) x = left; else if (right > x) x = right; }
    else { if (right > x) x = right; else if (left < x) x = left; }
  }
  if (container.clientHeight < container.scrollHeight && orientation !== 'horizontal') {
    const top = offset('top') - numeric(inner, 'scroll-margin-top') - numeric(outer, 'scroll-padding-top');
    const bottom = offset('top') + element.offsetHeight + numeric(inner, 'scroll-margin-bottom') - container.clientHeight + numeric(outer, 'scroll-padding-bottom');
    if (top < y) y = top; else if (bottom > y) y = bottom;
  }
  container.scrollTo({ left: x, top: y, behavior: 'auto' });
}
