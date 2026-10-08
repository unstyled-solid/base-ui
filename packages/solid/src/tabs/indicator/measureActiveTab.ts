// Adapted from Base UI (MIT), 19511bb171f3b360b006c94cf6d07e53cb446505.
import { getParentNode, isHTMLElement, isLastTraversableNode } from '@floating-ui/utils/dom';
import { getCssDimensions } from '../../utils/getCssDimensions';
import { getElementTransform } from '../../utils/getElementTransform';
import { ownerWindow } from '../../utils/owner';
import type { TabsTab } from '../tab/TabsTab';

export function measureActiveTab(tab: HTMLElement, list: HTMLElement): { position: TabsTab.Position; size: TabsTab.Size } {
  const size = getCssDimensions(tab);
  const listSize = getCssDimensions(list);
  const tabRect = tab.getBoundingClientRect();
  const listRect = list.getBoundingClientRect();
  const scaleX = listSize.width > 0 ? listRect.width / listSize.width : 1;
  const scaleY = listSize.height > 0 ? listRect.height / listSize.height : 1;
  let { left, top } = getLayoutOffset(tab, list);
  const rectLeft = (tabRect.left - listRect.left) / scaleX + list.scrollLeft - list.clientLeft;
  const rectTop = (tabRect.top - listRect.top) / scaleY + list.scrollTop - list.clientTop;
  const translation = getActiveTabTranslation(tab);
  // Rect precision is safe only when it agrees with transform-immune layout.
  // NaN/Infinity from scale(0) naturally fail the same agreement check.
  if (Math.abs(rectLeft - translation.x - left) <= 2 && Math.abs(rectTop - translation.y - top) <= 2) {
    left = rectLeft; top = rectTop;
  }
  return { size, position: { left, top, right: list.scrollWidth - left - size.width, bottom: list.scrollHeight - top - size.height } };
}
function getCumulativeOffset(element: HTMLElement) {
  let left = 0; let top = 0;
  let current: HTMLElement | null = element;
  while (current) {
    left += current.offsetLeft; top += current.offsetTop;
    const parent = current.offsetParent as HTMLElement | null;
    if (parent) { left += parent.clientLeft; top += parent.clientTop; }
    current = parent;
  }
  return { left, top };
}
function getLayoutOffset(element: HTMLElement, ancestor: HTMLElement) {
  const offset = getCumulativeOffset(element);
  const parentOffset = getCumulativeOffset(ancestor);
  let left = offset.left - parentOffset.left - ancestor.clientLeft;
  let top = offset.top - parentOffset.top - ancestor.clientTop;
  let node = getParentNode(element);
  while (isHTMLElement(node) && node !== ancestor && !isLastTraversableNode(node)) {
    left -= node.scrollLeft; top -= node.scrollTop;
    node = getParentNode(node);
  }
  return { left, top };
}
function getActiveTabTranslation(element: HTMLElement) {
  const style = ownerWindow(element).getComputedStyle(element);
  const { x, y } = getElementTransform(element, style);
  const parts = style.translate && style.translate !== 'none' ? style.translate.split(' ') : [];
  return { x: x + resolveTranslateLength(parts[0], element.offsetWidth), y: y + resolveTranslateLength(parts[1], element.offsetHeight) };
}
function resolveTranslateLength(value: string | undefined, reference: number) {
  if (!value) return 0;
  const numeric = parseFloat(value);
  if (!Number.isFinite(numeric)) return 0;
  return value.endsWith('%') ? numeric / 100 * reference : numeric;
}
