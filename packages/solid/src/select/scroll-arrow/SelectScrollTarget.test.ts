import { describe, expect, it } from 'vitest';
import { getTargetScrollTop } from './scrollTarget';
import { normalizeScrollOffset } from '../../utils/scrollEdges';

function item(top: number, height: number) {
  const element = document.createElement('div');
  Object.defineProperties(element, { offsetTop: { value: top }, offsetHeight: { value: height } });
  return element;
}
describe('Select scroll-arrow targets (pinned source fractional regressions)', () => {
  it('reaches the true fractional bottom instead of stopping at the last item edge', () => {
    const items = [item(0, 40), item(40, 40), item(80, 40)];
    const max = 20.6;
    expect(getTargetScrollTop(items, false, 19, 100, 0, max)).toBe(max);
    expect(normalizeScrollOffset(20.2, max)).toBe(max);
  });
  it('advances when the next item bottom is fractionally within the visible bottom', () => {
    const items = [item(0, 40), item(40, 40), item(80, 40), item(120, 40)];
    expect(getTargetScrollTop(items, false, 19.7, 100, 0, 60)).toBe(60);
  });
  it('reaches trailing content beyond the last option', () => {
    const items = Array.from({ length: 10 }, (_, i) => item(i * 40, 40));
    expect(getTargetScrollTop(items, false, 390, 200, 0, 400)).toBe(400);
  });
  it('continues upward past an item within fractional top tolerance', () => {
    const items = [item(0, 40), item(40, 40), item(80, 40), item(120, 40)];
    expect(getTargetScrollTop(items, true, 40.2, 100, 0, 60)).toBe(0);
  });
  it('returns to true top when no preceding option remains', () => {
    expect(getTargetScrollTop([item(40, 40), item(80, 40)], true, 20, 100, 0, 60)).toBe(0);
  });
  it('accounts for arrow occlusion in each direction', () => {
    const items = [item(0, 40), item(40, 40), item(80, 40), item(120, 40), item(160, 40)];
    expect(getTargetScrollTop(items, false, 0, 100, 20, 100)).toBe(40);
    expect(getTargetScrollTop(items, true, 100, 100, 20, 100)).toBe(60);
  });
  it('handles holes and empty lists at both boundaries', () => {
    expect(getTargetScrollTop([], true, 4, 100, 0, 40)).toBe(0);
    expect(getTargetScrollTop([], false, 4, 100, 0, 40)).toBe(40);
    expect(getTargetScrollTop([null, item(40, 40), null], false, 10, 100, 0, 40)).toBe(40);
  });
});
