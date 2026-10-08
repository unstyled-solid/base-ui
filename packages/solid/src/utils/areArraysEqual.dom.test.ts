import { expect, it } from 'vitest';
import { areArraysEqual } from './areArraysEqual';
import { fastObjectShallowCompare } from './fastObjectShallowCompare';
import { mergeObjects } from './mergeObjects';
import { EMPTY_ARRAY, EMPTY_OBJECT } from './empty';
import { clamp } from './clamp';
import { valueToPercent } from './valueToPercent';
import formatErrorMessage from './formatErrorMessage';
it.each([
  [[1, 2, 3], [1, 2, 3], true], [[1, 2, 3], [1, 2, 4], false],
  [[1, 2, 3], [1, 2], false], [[], [], true], [[NaN], [NaN], true], [[0], [-0], false],
] as const)('source array comparison %j / %j = %s', (a, b, result) => { expect(areArraysEqual(a, b)).toBe(result); });
it('source custom comparison and same-reference semantics', () => {
  const a = [1, 2];
  expect(areArraysEqual(a, a)).toBe(true);
  expect(areArraysEqual(a, a, () => false)).toBe(false);
  expect(areArraysEqual([{ id: 1 }], [{ id: 1 }])).toBe(false);
  expect(areArraysEqual([{ id: 1 }], [{ id: 1 }], (x, y) => x.id === y.id)).toBe(true);
  expect(areArraysEqual([0], [-0], (x, y) => x === y)).toBe(true);
});
it('compares records without global constructors; preserves key and Object.is semantics', () => {
  expect(fastObjectShallowCompare({ a: undefined }, {})).toBe(false);
  expect(fastObjectShallowCompare({ a: NaN }, { a: NaN })).toBe(true);
  expect(fastObjectShallowCompare({ a: 0 }, { a: -0 })).toBe(false);
  expect(fastObjectShallowCompare(null, {})).toBe(false);
  expect(fastObjectShallowCompare(Object.assign(Object.create(null), { a: 1 }), { a: 1 })).toBe(true);
});
it('retains identity for a single merge, masks with undefined and freezes empty singletons', () => {
  const a = { a: 1 };
  expect(mergeObjects(a, undefined)).toBe(a);
  expect(mergeObjects(undefined, a)).toBe(a);
  expect(mergeObjects(undefined, undefined)).toBeUndefined();
  expect(mergeObjects(a, { a: undefined })).toEqual({ a: undefined });
  expect(Object.isFrozen(EMPTY_ARRAY)).toBe(true);
  expect(EMPTY_ARRAY).toHaveLength(0);
  expect(Object.isFrozen(EMPTY_OBJECT)).toBe(true);
  expect(() => (EMPTY_ARRAY as number[]).push(1)).toThrow();
});
it('preserves arithmetic and encoded production errors', () => {
  expect(clamp(-1, 0, 10)).toBe(0);
  expect(clamp(11, 0, 10)).toBe(10);
  expect(clamp(1, 2, 4)).toBe(2);
  expect(clamp(5, 2, 4)).toBe(4);
  expect(clamp(-5, -1, 5)).toBe(-1);
  expect(valueToPercent(5, 0, 10)).toBe(50);
  expect(Number.isNaN(valueToPercent(1, 1, 1))).toBe(true);
  expect(formatErrorMessage(2, 'a & b')).toBe('Base UI error #2; visit https://base-ui.com/production-error?code=2&args%5B%5D=a+%26+b for the full message.');
});
