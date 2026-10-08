// Base UI's floating-offset-parent fork of Floating UI arrow, MIT.
import type { Derivable, Middleware, Padding } from '@floating-ui/dom';
import { clamp, evaluate, getAlignment, getAlignmentAxis, getAxisLength, getPaddingObject } from '@floating-ui/utils';
export interface ArrowOptions { element: Element | null; padding?: Padding | undefined }
export const baseArrow = (options: ArrowOptions | Derivable<ArrowOptions>): Middleware => ({
  name: 'arrow', options,
  async fn(state) {
    const { x, y, placement, rects, platform, elements, middlewareData } = state;
    const { element, padding = 0 } = evaluate(options, state);
    if (!element) return {};
    const pad = getPaddingObject(padding), coords = { x, y };
    const axis = getAlignmentAxis(placement), length = getAxisLength(axis);
    const dimensions = await platform.getDimensions(element);
    const minProp = axis === 'y' ? 'top' : 'left', maxProp = axis === 'y' ? 'bottom' : 'right';
    const clientSize = elements.floating[axis === 'y' ? 'clientHeight' : 'clientWidth'] || rects.floating[length];
    const endDiff = rects.reference[length] + rects.reference[axis] - coords[axis] - rects.floating[length];
    const startDiff = coords[axis] - rects.reference[axis];
    const largest = clientSize / 2 - dimensions[length] / 2 - 1;
    const min = Math.min(pad[minProp], largest), maxPad = Math.min(pad[maxProp], largest);
    const max = clientSize - dimensions[length] - maxPad;
    const centerToReference = endDiff / 2 - startDiff / 2;
    const center = clientSize / 2 - dimensions[length] / 2 + centerToReference;
    const value = clamp(min, center, max);
    const adjust = !middlewareData.arrow && getAlignment(placement) != null && center !== value && rects.reference[length] / 2 - (center < min ? min : maxPad) - dimensions[length] / 2 < 0;
    const alignmentOffset = adjust ? center < min ? center - min : center - max : 0;
    return { [axis]: coords[axis] + alignmentOffset, data: { [axis]: value, centerOffset: center - value - alignmentOffset, ...(adjust && { alignmentOffset }) }, reset: adjust };
  },
});
export const arrow = baseArrow;
