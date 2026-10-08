import { describe, expect, it } from 'vitest';
import { applyOverscrollThumb, pickState } from './viewport/measure';
import { getOffset } from './utils/getOffset';

describe('ScrollArea pinned geometry', () => {
  it('keeps unchanged metric objects and replaces only changed values', () => {
    const size = { width: 40, height: 40 };
    expect(pickState(size, { width: 40, height: 40 })).toBe(size);
    expect(pickState(size, { width: 40, height: 41 })).not.toBe(size);
  });
  it('damps rubber band feedback, pins both edges, and removes the settled override', () => {
    const thumb = document.createElement('div');
    const variable = '--scroll-area-thumb-height';
    expect(applyOverscrollThumb(thumb, variable, -50, 800, 1000, 40, 160)).toBe(0);
    const shrunk = 40 * 1000 / 1050;
    expect(parseFloat(thumb.style.getPropertyValue(variable))).toBeCloseTo(shrunk);
    expect(applyOverscrollThumb(thumb, variable, 850, 800, 1000, 40, 160)).toBeCloseTo(160 + 40 - shrunk);
    expect(applyOverscrollThumb(thumb, variable, 400, 800, 1000, 40, 160)).toBe(80);
    expect(thumb.style.getPropertyValue(variable)).toBe('');
    applyOverscrollThumb(thumb, variable, -10000, 800, 1000, 40, 160);
    expect(thumb.style.getPropertyValue(variable)).toBe('16px');
  });
  it('uses symmetric inline thumb margins but both padding/block edges', () => {
    const node = document.createElement('div');
    node.style.marginInlineStart = '8px'; node.style.marginInlineEnd = '30px';
    node.style.paddingInlineStart = '3px'; node.style.paddingInlineEnd = '5px';
    node.style.marginBlockStart = '2px'; node.style.marginBlockEnd = '7px';
    // Browsers resolve computed logical margins only for a connected host.
    document.body.append(node);
    try {
      expect(getOffset(node, 'margin', 'x')).toBe(16);
      expect(getOffset(node, 'padding', 'x')).toBe(8);
      expect(getOffset(node, 'margin', 'y')).toBe(9);
      expect(getOffset(null, 'margin', 'x')).toBe(0);
    } finally { node.remove(); }
  });
});
