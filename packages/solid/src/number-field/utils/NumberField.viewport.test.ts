import { describe, expect, it, vi } from 'vitest';
import { getViewportRect } from './getViewportRect';
describe('NumberField viewport (source getViewportRect fixtures)', () => {
  it('pads absolute edges and preserves a zero teleport distance', () => {
    const node = document.createElement('span');
    vi.spyOn(node, 'getBoundingClientRect').mockReturnValue({ left: 100, top: 110, right: 120, bottom: 140 } as DOMRect);
    expect(getViewportRect(100, node)).toEqual({ left: 50, top: 60, right: 170, bottom: 190 });
    expect(getViewportRect(0, node)).toEqual({ left: 100, top: 110, right: 120, bottom: 140 });
  });
  it('uses the owning document when no visual viewport exists', () => {
    const node = document.createElement('span');
    expect(getViewportRect(undefined, node)).toEqual({ left: 0, top: 0,
      right: document.documentElement.clientWidth, bottom: document.documentElement.clientHeight });
  });
});
