import { describe, expect, it, vi } from 'vitest';
import {
  compareItemEquality, defaultItemEquality, findItemIndex, findSelectionIndex,
  isSelectedValueDirty, removeItem, resolveSelectedIndex, selectedValueIncludes,
} from './itemEquality';

describe('findSelectionIndex (pinned source)', () => {
  const items = ['a', 'b', 'c'];
  it('anchors to the first selected item in rendered order, not value order', () => {
    expect(findSelectionIndex(items, ['c', 'b'], defaultItemEquality, true)).toBe(1);
    expect(findSelectionIndex(items, ['b', 'c'], defaultItemEquality, true)).toBe(1);
  });
  it('returns null when nothing in the value array is rendered', () => {
    expect(findSelectionIndex(items, [], defaultItemEquality, true)).toBe(null);
    expect(findSelectionIndex(items, ['d'], defaultItemEquality, true)).toBe(null);
  });
  it('treats an array as a single value outside multiple mode', () => {
    const arrayValue = ['x', 'y'];
    const comparer = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
    expect(findSelectionIndex<string | string[], string[]>(['a', arrayValue], arrayValue, comparer, false)).toBe(1);
  });
  it('anchors to the first selected item with a custom comparer', () => {
    const comparer = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();
    expect(findSelectionIndex(items, ['C', 'B'], comparer, true)).toBe(1);
    expect(findSelectionIndex(items, ['D'], comparer, true)).toBe(null);
  });
  it('reads the selected values once instead of rescanning them for every item', () => {
    const itemValues = Array.from({ length: 200 }, (_, i) => `item-${i}`);
    let reads = 0;
    const selectedValues = new Proxy(Array.from({ length: 100 }, (_, i) => `filtered-out-${i}`), {
      get(target, key, receiver) {
        if (typeof key === 'string' && String(Number(key)) === key) reads += 1;
        return Reflect.get(target, key, receiver);
      },
    });
    expect(findSelectionIndex(itemValues, selectedValues, defaultItemEquality, true)).toBe(null);
    expect(reads).toBeLessThanOrEqual(itemValues.length + selectedValues.length);
  });
  it('keeps `+0` and `-0` distinct, like `Object.is`', () => {
    expect(findSelectionIndex([-0], [0], defaultItemEquality, true)).toBe(null);
    expect(findSelectionIndex([0], [-0], defaultItemEquality, true)).toBe(null);
    expect(findSelectionIndex([-0], [-0], defaultItemEquality, true)).toBe(0);
    expect(findSelectionIndex([1, 0], [2, 0], defaultItemEquality, true)).toBe(1);
    expect(findSelectionIndex([1, -0], [2, 0], defaultItemEquality, true)).toBe(null);
    expect(findSelectionIndex([1, -0], [2, -0], defaultItemEquality, true)).toBe(1);
  });
  it('matches `NaN` and `null` against themselves', () => {
    expect(findSelectionIndex([1, NaN], [NaN], defaultItemEquality, true)).toBe(1);
    expect(findSelectionIndex(['a', null], [null], defaultItemEquality, true)).toBe(1);
  });
  it('never matches an `undefined` item or an `undefined` selected value', () => {
    expect(findSelectionIndex([undefined, 'b'], [undefined, 'b'], defaultItemEquality, true)).toBe(1);
    expect(findSelectionIndex([undefined], [undefined], defaultItemEquality, true)).toBe(null);
  });
  it('never matches a hole left by an unmounted item', () => {
    const sparseItems: string[] = [];
    sparseItems[2] = 'c';
    const sparseSelection: string[] = [];
    sparseSelection[1] = 'c';
    expect(findSelectionIndex(sparseItems, sparseSelection, defaultItemEquality, true)).toBe(2);
    expect(findSelectionIndex(sparseItems, [], defaultItemEquality, true)).toBe(null);
  });
});

describe('resolveSelectedIndex (pinned source)', () => {
  const registry = ['a', 'b', 'c'];
  const resolve = (index: number, values: string[], current: number | null) =>
    resolveSelectedIndex(index, registry[index], registry, values, defaultItemEquality, current);
  it('does not claim an unselected item', () => { expect(resolve(1, ['a', 'c'], null)).toBe(null); });
  it('claims when no item holds the index yet', () => { expect(resolve(2, ['c'], null)).toBe(2); });
  it('claims from a later holder', () => { expect(resolve(0, ['a', 'c'], 2)).toBe(0); });
  it('leaves the index with an earlier selected holder', () => { expect(resolve(2, ['a', 'c'], 0)).toBe(0); });
  it('takes over from an earlier holder that is no longer selected', () => {
    expect(resolve(0, ['b', 'c'], 0)).toBe(1);
    expect(resolve(2, ['b', 'c'], 1)).toBe(1);
  });
  it('takes over when the earlier holder has left the registry', () => {
    const sparseRegistry: string[] = [];
    sparseRegistry[1] = 'b';
    sparseRegistry[2] = 'c';
    expect(resolveSelectedIndex(2, 'c', sparseRegistry, ['c'], defaultItemEquality, 0)).toBe(2);
  });
});

describe('itemEquality edge contracts', () => {
  it('bypasses comparers for nullish values and never conflates null with undefined', () => {
    const comparer = vi.fn(() => true);
    expect(compareItemEquality(null, null, comparer)).toBe(true);
    expect(compareItemEquality(undefined, undefined, comparer)).toBe(true);
    expect(compareItemEquality(null, undefined, comparer)).toBe(false);
    expect(compareItemEquality(null, 'x', comparer)).toBe(false);
    expect(comparer).not.toHaveBeenCalled();
    expect(compareItemEquality('a', 'b', comparer)).toBe(true);
    expect(comparer).toHaveBeenCalledExactlyOnceWith('a', 'b');
  });
  it('preserves comparer argument direction and raw object identity', () => {
    const item = { id: 1 };
    const comparer = (a: { id: number }, b: number) => a.id === b;
    expect(findItemIndex([item], 1, comparer)).toBe(0);
    expect(selectedValueIncludes([1], item, comparer)).toBe(true);
    expect(findSelectionIndex([item], [1], comparer, true)).toBe(0);
    expect(removeItem([1, 2, 1], item, comparer)).toEqual([2]);
    expect(defaultItemEquality(item, { id: 1 })).toBe(false);
    expect(findSelectionIndex([item], [item], defaultItemEquality, true)).toBe(0);
  });
  it('supports absent collections, skips undefined in searches but removes it by equality', () => {
    expect(findItemIndex(null, null, defaultItemEquality)).toBe(-1);
    expect(findItemIndex(undefined, undefined, defaultItemEquality)).toBe(-1);
    expect(findItemIndex([undefined], undefined, defaultItemEquality)).toBe(-1);
    expect(selectedValueIncludes(null, null, defaultItemEquality)).toBe(false);
    expect(selectedValueIncludes(undefined, undefined, defaultItemEquality)).toBe(false);
    expect(selectedValueIncludes([undefined], undefined, defaultItemEquality)).toBe(false);
    expect(selectedValueIncludes([null], null, defaultItemEquality)).toBe(true);
    expect(removeItem([null, undefined, undefined], undefined, defaultItemEquality)).toEqual([null]);
  });
  it('keeps scalar dirty checks strict and array dirty checks ordered/custom/null-safe', () => {
    const comparer = vi.fn(() => true);
    expect(isSelectedValueDirty({}, {}, comparer)).toBe(true);
    expect(isSelectedValueDirty(NaN, NaN, comparer)).toBe(true);
    expect(isSelectedValueDirty(-0, 0, comparer)).toBe(false);
    expect(comparer).not.toHaveBeenCalled();
    expect(isSelectedValueDirty([1], [2], comparer)).toBe(false);
    expect(isSelectedValueDirty([null], [undefined], comparer)).toBe(true);
    expect(isSelectedValueDirty([1], [], comparer)).toBe(true);
    expect(isSelectedValueDirty([1, 2], [2, 1], defaultItemEquality)).toBe(true);
    expect(isSelectedValueDirty([NaN], [NaN], defaultItemEquality)).toBe(false);
    expect(isSelectedValueDirty([-0], [0], defaultItemEquality)).toBe(true);
    expect(isSelectedValueDirty(Array(1), [undefined], defaultItemEquality)).toBe(false);
    expect(isSelectedValueDirty(Array(1), [1], defaultItemEquality)).toBe(true);
  });
  it('releases the anchor when selection disappears and does not mutate removed lists', () => {
    expect(resolveSelectedIndex(0, 'a', ['a'], [], defaultItemEquality, 0)).toBe(null);
    expect(resolveSelectedIndex(1, 'b', ['a', 'b'], [], defaultItemEquality, 0)).toBe(0);
    const values = Object.freeze(['a', 'b', 'a']);
    expect(removeItem(values, 'a', defaultItemEquality)).toEqual(['b']);
    expect(values).toEqual(['a', 'b', 'a']);
  });
});
