// Adapted from Base UI SelectPopup (MIT), 19511bb171f3b360b006c94cf6d07e53cb446505.
import { platform } from '@floating-ui/dom';
import { ownerWindow, ownerDocument } from '../../utils/owner';
import { clamp } from '../../utils/clamp';
import { getMaxScrollOffset, SCROLL_EDGE_TOLERANCE_PX } from '../../utils/scrollEdges';
import { platform as browserPlatform } from '../../utils/platform';

export function maxScroll(element: HTMLElement) { return getMaxScrollOffset(element.scrollHeight, element.clientHeight); }
function maxPopupHeight(styles: CSSStyleDeclaration) { return styles.maxHeight.endsWith('px') ? parseFloat(styles.maxHeight) || Infinity : Infinity; }
function scaleOf(element: HTMLElement) { return platform.getScale!(element) as { x: number; y: number }; }
function normalizedRect(element: HTMLElement, scale: { x: number; y: number }) {
  const rect = element.getBoundingClientRect();
  return { x: rect.x / scale.x, y: rect.y / scale.y, width: rect.width / scale.x, height: rect.height / scale.y,
    top: rect.top / scale.y, bottom: rect.bottom / scale.y, left: rect.left / scale.x, right: rect.right / scale.x };
}

export interface AlignmentElements { trigger: HTMLElement; positioner: HTMLElement; popup: HTMLElement; scroller: HTMLElement; text: HTMLElement | null; value: HTMLElement | null; direction: 'ltr' | 'rtl' }
export function alignSelectedItem({ trigger, positioner, popup, scroller, text, value, direction }: AlignmentElements) {
  const saved = ['transform', 'scale', 'translate'].map(property => [property, popup.style.getPropertyValue(property), popup.style.getPropertyPriority(property)]);
  popup.style.setProperty('transform', 'none', 'important');
  popup.style.setProperty('scale', '1', 'important');
  popup.style.setProperty('translate', '0 0', 'important');
  try {
    const win = ownerWindow(positioner);
    const doc = ownerDocument(trigger);
    const positionerStyles = win.getComputedStyle(positioner);
    const popupStyles = win.getComputedStyle(popup);
    const scale = scaleOf(trigger);
    const triggerRect = normalizedRect(trigger, scale);
    const positionerRect = normalizedRect(positioner, scale);
    // Source measures content before height:100% makes a short popup's own
    // scrollHeight expand to the positioner height. Collision fallback must
    // compare with that intrinsic content height, not the resized scroller.
    const scrollHeight = scroller.scrollHeight;
    const marginTop = parseFloat(positionerStyles.marginTop) || 10;
    const marginBottom = parseFloat(positionerStyles.marginBottom) || 10;
    const minHeight = parseFloat(positionerStyles.minHeight) || 100;
    const borderBottom = parseFloat(popupStyles.borderBottomWidth) || 0;
    const viewportHeight = doc.documentElement.clientHeight - marginTop - marginBottom;
    const viewportWidth = doc.documentElement.clientWidth;
    let alignedLeft = direction === 'rtl' ? triggerRect.right - positionerRect.width : triggerRect.left;
    let offsetY = 0;
    const textRect = text && value ? normalizedRect(text, scale) : null;
    if (textRect && value) {
      const valueRect = normalizedRect(value, scale);
      alignedLeft = positionerRect.left + (direction === 'rtl' ? valueRect.right - textRect.right : valueRect.left - textRect.left);
      offsetY = textRect.top - positionerRect.top + textRect.height / 2 - (valueRect.top - triggerRect.top + valueRect.height / 2);
    }
    const idealHeight = viewportHeight - triggerRect.bottom + triggerRect.height + offsetY + marginBottom + borderBottom;
    let height = Math.min(viewportHeight, idealHeight);
    const scrollTop = idealHeight - height;
    const original = { left: positioner.style.left, height: positioner.style.height, maxHeight: positioner.style.maxHeight, marginTop: positioner.style.marginTop, marginBottom: positioner.style.marginBottom };
    Object.assign(positioner.style, { left: `${clamp(alignedLeft, 5, viewportWidth - 5 - positionerRect.width)}px`, height: `${height}px`, maxHeight: 'none', marginTop: `${marginTop}px`, marginBottom: `${marginBottom}px` });
    const originalPopupHeight = popup.style.height;
    popup.style.height = '100%';
    const max = maxScroll(scroller);
    const topPositioned = scrollTop >= max - SCROLL_EDGE_TOLERANCE_PX;
    if (topPositioned) height = Math.min(viewportHeight, positionerRect.height) - (scrollTop - max);
    const fallback = triggerRect.top < 20 || triggerRect.bottom > viewportHeight - 20 || Math.ceil(height) + SCROLL_EDGE_TOLERANCE_PX < Math.min(scrollHeight, minHeight);
    // On WebKit, fixed positioning under a pinch-zoomed visual viewport cannot align reliably.
    const pinchZoomed = (win.visualViewport?.scale ?? 1) !== 1 && browserPlatform.engine.webkit;
    if (fallback || pinchZoomed) {
      Object.assign(positioner.style, original); popup.style.height = originalPopupHeight;
      return { fallback: true, reachedMaxHeight: false };
    }
    if (topPositioned) {
      positioner.style.top = positionerRect.height >= viewportHeight - marginTop - marginBottom ? '0' : `${Math.max(0, viewportHeight - idealHeight)}px`;
      positioner.style.bottom = '';
      positioner.style.height = `${height}px`;
      scroller.scrollTop = maxScroll(scroller);
    } else {
      positioner.style.top = ''; positioner.style.bottom = '0'; scroller.scrollTop = scrollTop;
    }
    if (textRect) {
      const y = clamp(positionerRect.height > 0 ? ((textRect.top + textRect.height / 2 - positionerRect.top) / positionerRect.height) * 100 : 50, 0, 100);
      popup.style.setProperty('--transform-origin', `50% ${y}%`);
    }
    return { fallback: false, reachedMaxHeight: Math.max(minHeight, height) === viewportHeight || height >= maxPopupHeight(popupStyles) };
  } finally {
    for (const [property, value, priority] of saved) {
      if (value) popup.style.setProperty(property, value, priority);
      else popup.style.removeProperty(property);
    }
  }
}

export function growAlignedPopup(positioner: HTMLElement, popup: HTMLElement, scroller: HTMLElement): boolean {
  const top = positioner.style.top === '0px';
  if (!top && positioner.style.bottom !== '0px') return false;
  const win = ownerWindow(positioner);
  const style = win.getComputedStyle(positioner);
  const current = positioner.getBoundingClientRect().height / scaleOf(positioner).y;
  const available = Math.min(ownerDocument(positioner).documentElement.clientHeight - (parseFloat(style.marginTop) || 0) - (parseFloat(style.marginBottom) || 0), maxPopupHeight(win.getComputedStyle(popup)));
  const offset = scroller.scrollTop;
  const max = maxScroll(scroller);
  const diff = top ? max - offset : offset;
  if (diff <= SCROLL_EDGE_TOLERANCE_PX) {
    const delta = clamp(diff, 0, available - current);
    if (delta > 0) positioner.style.height = `${current + delta}px`;
    scroller.scrollTop = top ? max : 0;
    return available - (current + delta) <= SCROLL_EDGE_TOLERANCE_PX;
  }
  const nextHeight = Math.min(current + diff, available);
  let target: number | null = null;
  if (available - nextHeight > SCROLL_EDGE_TOLERANCE_PX) target = top ? Infinity : 0;
  else if (!top && offset < max) target = offset - (diff - (current + diff - available));
  if (Math.ceil(nextHeight) !== 0) positioner.style.height = `${Math.ceil(nextHeight)}px`;
  if (target !== null) {
    target = clamp(target, 0, maxScroll(scroller));
    if (Math.abs(scroller.scrollTop - target) > SCROLL_EDGE_TOLERANCE_PX) scroller.scrollTop = target;
  }
  return Math.ceil(nextHeight) >= available - SCROLL_EDGE_TOLERANCE_PX;
}
