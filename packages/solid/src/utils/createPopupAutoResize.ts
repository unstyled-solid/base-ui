import { createEffect, createMemo, untrack } from 'solid-js';
import { createAnimationFrame } from './createAnimationFrame';
import { createAnimationsFinished } from '../internals/createAnimationsFinished';
import { getCssDimensions } from './getCssDimensions';
import type { Side } from '../internals/createAnchorPositioning';
import * as popupCss from './CommonPopupCssVars';
import * as positionerCss from './CommonPositionerCssVars';
export interface PopupDimensions { width: number; height: number }
export interface UsePopupAutoResizeParameters {
  popupElement: HTMLElement | null; positionerElement: HTMLElement | null; mounted: boolean; content: unknown;
  onMeasureLayout?: (() => void) | undefined;
  onMeasureLayoutComplete?: ((previous: PopupDimensions | null, next: PopupDimensions) => void) | undefined;
  side: Side; direction: 'ltr' | 'rtl';
}
function styles(element: HTMLElement, values: Record<string, string>): () => void {
  const original = Object.entries(values).map(([key, value]) => { const old = element.style.getPropertyValue(key); element.style.setProperty(key, value); return { key, old, value }; });
  return () => { for (const { key, old, value } of original) if (element.style.getPropertyValue(key) === value) { if (old) element.style.setProperty(key, old); else element.style.removeProperty(key); } };
}
function popupSize(element: HTMLElement, dimensions: PopupDimensions | 'auto') { element.style.setProperty(popupCss.popupWidth, dimensions === 'auto' ? 'auto' : `${dimensions.width}px`); element.style.setProperty(popupCss.popupHeight, dimensions === 'auto' ? 'auto' : `${dimensions.height}px`); }
function positionerSize(element: HTMLElement, dimensions: PopupDimensions | 'max-content') { element.style.setProperty(positionerCss.positionerWidth, dimensions === 'max-content' ? dimensions : `${dimensions.width}px`); element.style.setProperty(positionerCss.positionerHeight, dimensions === 'max-content' ? dimensions : `${dimensions.height}px`); }
export function createPopupAutoResize(params: UsePopupAutoResizeParameters): void {
  const frame = createAnimationFrame(), finish = createAnimationsFinished(() => params.popupElement, true);
  let committed: PopupDimensions | null = null;
  const measurement = createMemo(() => ({ popup: params.popupElement, positioner: params.positionerElement, content: params.content, mounted: params.mounted,
    side: params.side, direction: params.direction, onMeasure: params.onMeasureLayout, onMeasured: params.onMeasureLayoutComplete }), {
    equals: (a, b) => a.popup === b.popup && a.positioner === b.positioner && a.content === b.content && a.mounted === b.mounted && a.side === b.side && a.direction === b.direction && a.onMeasure === b.onMeasure && a.onMeasured === b.onMeasured,
  });
  createEffect(measurement, (next) => {
    if (!next.mounted) { committed = null; return; }
    const popup = next.popup, positioner = next.positioner; if (!popup || !positioner) return;
    const top = next.side === 'top', left = next.side === 'left' || next.side === (next.direction === 'rtl' ? 'inline-end' : 'inline-start');
    const anchoring: Record<string, string> = top || left ? { position: 'absolute', [top ? 'bottom' : 'top']: '0', [left ? 'right' : 'left']: '0' } : {};
    const restoreAnchoring = styles(popup, anchoring);
    popupSize(popup, 'auto');
    const restorePopup = styles(popup, { position: 'static', transform: 'none', scale: '1' });
    const restorePositioner = styles(positioner, { [positionerCss.availableWidth]: 'max-content', [positionerCss.availableHeight]: 'max-content' });
    untrack(() => next.onMeasure?.());
    positionerSize(positioner, 'max-content');
    const previous = committed, measured = getCssDimensions(popup); committed = measured;
    if (previous) popupSize(popup, previous);
    positionerSize(positioner, measured); restorePopup(); restorePositioner();
    untrack(() => next.onMeasured?.(previous, measured));
    if (!previous) return restoreAnchoring;
    const controller = new AbortController();
    frame.request(() => { popupSize(popup, measured); finish(() => { popupSize(popup, 'auto'); }, controller.signal); });
    return () => { controller.abort(); frame.cancel(); restoreAnchoring(); };
  });
}
export { createPopupAutoResize as usePopupAutoResize };
