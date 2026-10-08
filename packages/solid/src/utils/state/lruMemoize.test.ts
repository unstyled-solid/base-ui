import { expect, it, vi } from 'vitest';
import { lruMemoize } from '../lruMemoize';
it('the retained maintained LRU re-export preserves Object.is and bounded cache semantics', () => {
  const compute = vi.fn((value: number) => ({ value }));
  const memoized = lruMemoize(compute, { maxSize: 2, equalityCheck: Object.is });
  const negativeZero = memoized(-0), positiveZero = memoized(0);
  expect(negativeZero).not.toBe(positiveZero);
  expect(memoized(-0)).toBe(negativeZero);
  const nan = memoized(NaN);
  expect(memoized(NaN)).toBe(nan);
  expect(memoized(0)).not.toBe(positiveZero);
});
