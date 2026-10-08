import { expect, it } from 'vitest';
import { getMaxScrollOffset, normalizeScrollOffset, SCROLL_EDGE_TOLERANCE_PX } from './scrollEdges';
it('chooses the closest edge when tolerances overlap', () => {
  const max = SCROLL_EDGE_TOLERANCE_PX;
  expect(normalizeScrollOffset(0, max)).toBe(0);
  expect(normalizeScrollOffset(max, max)).toBe(max);
  expect(normalizeScrollOffset(max * 0.4, max)).toBe(0);
  expect(normalizeScrollOffset(max * 0.6, max)).toBe(max);
});
it.each([[10, 0, 0], [10, -5, 0], [0.5, 10, 0], [9.5, 10, 10], [5, 10, 5], [0, 1, 0], [1, 1, 1], [0.4, 1, 0], [0.6, 1, 1], [0.5, 1, 0], [-10, 10, 0], [20, 10, 10]])(
  'source scroll offset %s max %s => %s', (value, max, expected) => { expect(normalizeScrollOffset(value, max)).toBe(expected); },
);
it('nonnegative max offset', () => { expect(getMaxScrollOffset(5, 10)).toBe(0); expect(getMaxScrollOffset(20, 10)).toBe(10); });
