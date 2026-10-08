import { clamp } from '../../utils/clamp';
import { normalizeScrollOffset } from '../../utils/scrollEdges';
import { MIN_THUMB_SIZE } from '../constants';
import { getOffset } from '../utils/getOffset';
import type { ScrollAreaRootContextValue } from '../root/ScrollAreaRootContext';
import * as vars from './ScrollAreaViewportCssVars';

export const OVERFLOW_EDGE_VARS = [vars.scrollAreaOverflowXStart, vars.scrollAreaOverflowXEnd, vars.scrollAreaOverflowYStart, vars.scrollAreaOverflowYEnd];
export function pickState<T extends object>(previous: T, next: T): T {
  for (const key in next) if (previous[key] !== next[key]) return next;
  return previous;
}

/** Native rubber-band feedback: shrink proportionally and pin to the overscrolled edge. */
export function applyOverscrollThumb(thumb: HTMLElement, sizeVar: string, scroll: number, maxScroll: number, content: number, size: number, travel: number) {
  const clamped = clamp(scroll, 0, maxScroll);
  const overscroll = scroll - clamped;
  const nextSize = Math.max(MIN_THUMB_SIZE, content ? size * content / (content + Math.abs(overscroll)) : size);
  thumb.style.setProperty(sizeVar, overscroll ? `${nextSize}px` : '');
  return (maxScroll ? clamped / maxScroll * travel : 0) + (overscroll > 0 ? size - nextSize : 0);
}

export function measure(context: ScrollAreaRootContextValue, direction: 'ltr' | 'rtl') {
  const { viewport, scrollbarX, scrollbarY, thumbX, thumbY, corner } = context.nodes;
  if (!viewport) return;
  const width = viewport.clientWidth;
  const height = viewport.clientHeight;
  const contentWidth = viewport.scrollWidth;
  const contentHeight = viewport.scrollHeight;
  const hiddenX = width >= contentWidth;
  const hiddenY = height >= contentHeight;
  const nextHidden = { x: hiddenX, y: hiddenY, corner: hiddenX || hiddenY };
  const maxX = Math.max(0, contentWidth - width);
  const maxY = Math.max(0, contentHeight - height);
  const x = hiddenX ? 0 : normalizeScrollOffset(direction === 'rtl' ? -viewport.scrollLeft : viewport.scrollLeft, maxX);
  const y = hiddenY ? 0 : normalizeScrollOffset(viewport.scrollTop, maxY);
  const distances = [x, hiddenX ? 0 : maxX - x, y, hiddenY ? 0 : maxY - y];
  const cornerWidth = nextHidden.corner ? 0 : scrollbarY?.offsetWidth || 0;
  const cornerHeight = nextHidden.corner ? 0 : scrollbarX?.offsetHeight || 0;
  const cornerNotSized = context.cornerSize.width === 0 && context.cornerSize.height === 0;
  const paddingX = getOffset(scrollbarX, 'padding', 'x');
  const paddingY = getOffset(scrollbarY, 'padding', 'y');
  const marginX = getOffset(thumbX, 'margin', 'x');
  const marginY = getOffset(thumbY, 'margin', 'y');
  const idealWidth = (hiddenX ? 0 : width) - paddingX - marginX;
  const idealHeight = (hiddenY ? 0 : height) - paddingY - marginY;
  const maxWidth = scrollbarX ? Math.min(scrollbarX.offsetWidth - (cornerNotSized ? cornerWidth : 0), idealWidth) : idealWidth;
  const maxHeight = scrollbarY ? Math.min(scrollbarY.offsetHeight - (cornerNotSized ? cornerHeight : 0), idealHeight) : idealHeight;
  const thumbWidth = Math.max(MIN_THUMB_SIZE, maxWidth * (contentWidth ? width / contentWidth : 0));
  const thumbHeight = Math.max(MIN_THUMB_SIZE, maxHeight * (contentHeight ? height / contentHeight : 0));
  context.setHasMeasuredScrollbar(true);
  context.setThumbSize((previous) => pickState(previous, { width: thumbWidth, height: thumbHeight }));
  if (scrollbarY && thumbY) {
    const offset = applyOverscrollThumb(thumbY, '--scroll-area-thumb-height', viewport.scrollTop, maxY, contentHeight,
      thumbHeight, scrollbarY.offsetHeight - thumbHeight - paddingY - marginY);
    thumbY.style.transform = `translate3d(0,${offset}px,0)`;
  }
  if (scrollbarX && thumbX) {
    const offset = applyOverscrollThumb(thumbX, '--scroll-area-thumb-width', direction === 'rtl' ? -viewport.scrollLeft : viewport.scrollLeft,
      maxX, contentWidth, thumbWidth, scrollbarX.offsetWidth - thumbWidth - paddingX - marginX);
    thumbX.style.transform = `translate3d(${direction === 'rtl' ? -offset : offset}px,0,0)`;
  }
  OVERFLOW_EDGE_VARS.forEach((name, index) => viewport.style.setProperty(name, `${distances[index]}px`));
  if (corner || nextHidden.corner) context.setCornerSize((previous) => pickState(previous, { width: cornerWidth, height: cornerHeight }));
  context.setHiddenState((previous) => pickState(previous, nextHidden));
  const thresholds = context.overflowEdgeThreshold;
  context.setOverflowEdges((previous) => pickState(previous, {
    xStart: !hiddenX && distances[0] > thresholds.xStart, xEnd: !hiddenX && distances[1] > thresholds.xEnd,
    yStart: !hiddenY && distances[2] > thresholds.yStart, yEnd: !hiddenY && distances[3] > thresholds.yEnd,
  }));
}
