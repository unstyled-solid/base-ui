// Adapted from Base UI SelectScrollArrow (MIT), 19511bb171f3b360b006c94cf6d07e53cb446505.
import { normalizeScrollOffset, SCROLL_EDGE_TOLERANCE_PX } from '../../utils/scrollEdges';
export function getTargetScrollTop(items: readonly (HTMLElement | null)[], up: boolean, scrollTop: number, clientHeight: number, arrowHeight: number, max: number) {
  if (up) {
    let first = 0;
    const top = scrollTop + arrowHeight - SCROLL_EDGE_TOLERANCE_PX;
    for (let i = 0; i < items.length; i += 1) {
      if (items[i] && items[i]!.offsetTop >= top) { first = i; break; }
    }
    const target = Math.max(0, first - 1);
    return target < first && items[target] ? normalizeScrollOffset(items[target]!.offsetTop - arrowHeight, max) : 0;
  }
  let last = items.length - 1;
  const bottom = scrollTop + clientHeight - arrowHeight + SCROLL_EDGE_TOLERANCE_PX;
  for (let i = 0; i < items.length; i += 1) {
    const item = items[i];
    if (item && item.offsetTop + item.offsetHeight > bottom) { last = Math.max(0, i - 1); break; }
  }
  const target = Math.min(items.length - 1, last + 1);
  return target > last && items[target] ? normalizeScrollOffset(items[target]!.offsetTop + items[target]!.offsetHeight - clientHeight + arrowHeight, max) : max;
}
