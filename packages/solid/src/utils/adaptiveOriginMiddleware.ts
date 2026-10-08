import type { Middleware } from '@floating-ui/dom';
import { getSide } from '@floating-ui/utils';
import { ownerWindow, ownerDocument } from './owner';
import { DEFAULT_SIDES } from './adaptiveOriginConstants';
export const adaptiveOrigin: Middleware = {
  name: 'adaptiveOrigin',
  async fn(state) {
    const { x: rawX, y: rawY, rects: { floating: rect }, elements: { floating }, platform, strategy, placement } = state;
    const win = ownerWindow(floating), styles = win.getComputedStyle(floating);
    if (styles.transitionDuration === '0s' || !styles.transitionDuration) return { x: rawX, y: rawY, data: DEFAULT_SIDES };
    const parent = await platform.getOffsetParent?.(floating);
    let dimensions = { width: 0, height: 0 };
    if (strategy === 'fixed' && win.visualViewport) dimensions = { width: win.visualViewport.width, height: win.visualViewport.height };
    else if (parent === win) { const doc = ownerDocument(floating); dimensions = { width: doc.documentElement.clientWidth, height: doc.documentElement.clientHeight }; }
    else if (await platform.isElement?.(parent)) dimensions = await platform.getDimensions(parent as Element);
    const side = getSide(placement);
    return { x: side === 'left' ? dimensions.width - (rawX + rect.width) : rawX, y: side === 'top' ? dimensions.height - (rawY + rect.height) : rawY,
      data: { sideX: side === 'left' ? 'right' : 'left', sideY: side === 'top' ? 'bottom' : 'top' } };
  },
};
