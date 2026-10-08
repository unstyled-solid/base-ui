import { describe, expect, it, vi } from 'vitest';
import {
  flattenLeafItems, hasNullItemLabel, isGroupedItems, resolveMultipleLabels,
  resolveSelectedLabel, stringifyAsLabel, stringifyAsValue,
} from './resolveValueLabel';

describe('resolveValueLabel (pinned source)', () => {
  describe('isGroupedItems', () => {
    it.each([
      ['an undefined items field', [{ value: 'a', items: undefined }], false],
      ['a non-array items field', [{ value: 'a', items: 3 }], false],
      ['an array items field', [{ value: 'group', items: [] }], true],
      ['a list that starts with a flat item', [{ value: 'a' }, { value: 'group', items: [] }], false],
    ])('classifies %s', (_name, items, expected) => {
      expect(isGroupedItems(items)).toBe(expected);
    });
  });
  it('resolves a flat item label when the item has an unrelated items field', () => {
    const items = [{ value: 'a', label: 'A', items: 'metadata' }];
    expect(resolveSelectedLabel('a', items)).toBe('A');
  });
  describe('hasNullItemLabel', () => {
    it('returns true when grouped items contain a null-valued item with a label', () => {
      expect(hasNullItemLabel([{ value: 'group-1', items: [{ value: 'a', label: 'A' }, { value: null, label: 'Select' }] }])).toBe(true);
    });
    it('returns false when grouped items contain a null-valued item without a label', () => {
      expect(hasNullItemLabel([{ value: 'group-1', items: [{ value: null, label: null }, { value: 'a', label: 'A' }] }])).toBe(false);
    });
    it('returns false when grouped items do not contain a null-valued item', () => {
      expect(hasNullItemLabel([{ value: 'group-1', items: [{ value: 'a', label: 'A' }] }])).toBe(false);
    });
    it('supports grouped items with custom heading keys', () => {
      expect(hasNullItemLabel([{ heading: 'group-1', items: [{ value: 'a', label: 'A' }, { value: null, label: 'Select' }] }])).toBe(true);
    });
    it('returns true when flat items contain a null-valued item with a label', () => {
      expect(hasNullItemLabel([{ value: 'a', label: 'A' }, { value: null, label: 'None' }])).toBe(true);
    });
    it('returns false when flat items do not contain a null-valued item', () => {
      expect(hasNullItemLabel([{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }])).toBe(false);
    });
    it('returns false when items is a Record without a "null" key', () => {
      expect(hasNullItemLabel({ sans: 'Sans-serif', serif: 'Serif', mono: 'Monospace' })).toBe(false);
    });
    it('returns true when items is a Record with a "null" key', () => {
      expect(hasNullItemLabel({ null: 'None', sans: 'Sans-serif', serif: 'Serif' })).toBe(true);
    });
    it('returns false when items is undefined', () => { expect(hasNullItemLabel(undefined)).toBe(false); });
  });
  describe('record items with prototype member names', () => {
    it('falls back to the stringified label when the value matches an Object.prototype member', () => {
      const items = { sans: 'Sans-serif', serif: 'Serif', mono: 'Monospace' };
      for (const value of ['constructor', 'toString', 'hasOwnProperty', '__proto__']) {
        expect(resolveSelectedLabel(value, items)).toBe(value);
      }
    });
    it('resolves an own key that matches an Object.prototype member', () => {
      expect(resolveSelectedLabel('constructor', { constructor: 'Custom constructor', sans: 'Sans-serif' })).toBe('Custom constructor');
    });
    it('keeps resolving the null placeholder key in a record', () => {
      expect(resolveSelectedLabel(null, { null: 'None', sans: 'Sans-serif' })).toBe('None');
    });
    it('falls back to the stringified label when an own key has a nullish label', () => {
      expect(resolveSelectedLabel('sans', { sans: undefined })).toBe('sans');
      expect(resolveSelectedLabel('sans', { sans: null })).toBe('sans');
    });
  });
});

describe('label/value edge contracts', () => {
  it('flattens one level, retains leaf identity and returns flat inputs untouched', () => {
    const item = { value: 'a', label: 'A' };
    const flat = Object.freeze([item]);
    expect(flattenLeafItems(flat)).toBe(flat);
    expect(flattenLeafItems([{ items: [] }, { items: flat }])).toEqual([item]);
    expect(flattenLeafItems([{ items: flat }])[0]).toBe(item);
    expect(isGroupedItems(undefined)).toBe(false);
    expect(isGroupedItems([])).toBe(false);
    expect(isGroupedItems([null])).toBe(false);
  });
  it('preserves record key-presence null detection separately from own-label resolution', () => {
    expect(hasNullItemLabel({ null: undefined })).toBe(true);
    const inherited = Object.create({ null: 'inherited', a: 'A' });
    expect(hasNullItemLabel(inherited)).toBe(true);
    expect(resolveSelectedLabel(null, inherited)).toBe('');
    expect(resolveSelectedLabel('a', inherited)).toBe('a');
    const record = Object.assign(Object.create(null), { toString: 'Own', null: false, undefined: 0 });
    expect(resolveSelectedLabel('toString', record)).toBe('Own');
    expect(resolveSelectedLabel(null, record)).toBe(false);
    expect(resolveSelectedLabel(undefined, record)).toBe(0);
  });
  it.each(['', 0, false] as const)('retains non-null falsy label %s', (label) => {
    expect(hasNullItemLabel([{ value: undefined, label }])).toBe(true);
    expect(hasNullItemLabel([{ items: [null, undefined, { value: null, label }] }])).toBe(true);
    expect(resolveSelectedLabel(null, [{ value: null, label }])).toBe(label);
    expect(resolveSelectedLabel('x', { x: label })).toBe(label);
    expect(resolveSelectedLabel({ label, value: 'x' }, undefined)).toBe(label);
  });
  it('preserves converter/object/record/array/fallback precedence', () => {
    const value = { value: 'x', label: 'object' };
    expect(resolveSelectedLabel(value, { '[object Object]': 'record' }, () => 'converter')).toBe('converter');
    expect(resolveSelectedLabel(value, [{ value: 'x', label: 'array' }])).toBe('object');
    expect(resolveSelectedLabel({ value: 'x' }, { '[object Object]': 'record' })).toBe('record');
    expect(resolveSelectedLabel({ value: 'x', label: null }, [{ items: [{ value: 'x', label: 'array' }] }])).toBe('array');
    expect(resolveSelectedLabel({ value: 'x' }, [{ value: 'missing', label: 'array' }])).toBe('x');
    expect(resolveSelectedLabel({ id: 1 }, undefined)).toBe('{"id":1}');
    expect(resolveSelectedLabel(null, [{ value: undefined, label: 'undefined' }, { value: null, label: 'null' }])).toBe('null');
    expect(resolveSelectedLabel(undefined, [{ value: undefined, label: 'undefined' }])).toBe('undefined');
    expect(resolveSelectedLabel(NaN, [{ value: NaN, label: 'not matched' }])).toBe('null');
    expect(resolveSelectedLabel(0, [{ value: -0, label: 'strict equals' }])).toBe('strict equals');
    expect(resolveSelectedLabel('x', [{ value: 'x', label: null }, { value: 'x', label: 'later' }])).toBe('x');
  });
  it('distinguishes string labels from serialized form values', () => {
    expect(stringifyAsLabel({ value: { id: 1 }, label: 'Title' })).toBe('Title');
    expect(stringifyAsValue({ value: { id: 1 }, label: 'Title' })).toBe('{"id":1}');
    expect(stringifyAsLabel({ value: null, label: null })).toBe('null');
    expect(stringifyAsValue({ value: null, label: null })).toBe('');
    expect(stringifyAsLabel({ value: undefined })).toBe('undefined');
    expect(stringifyAsValue({ value: 'x' })).toBe('{"value":"x"}');
    expect(stringifyAsValue({ value: 'x', label: undefined })).toBe('x');
    expect(stringifyAsLabel(Object.create({ label: 'inherited' }))).toBe('inherited');
    expect(stringifyAsValue(Object.create({ label: 'inherited', value: 2 }))).toBe('2');
  });
  it('bypasses converters for nullish values, preserving distinct nullish converter returns', () => {
    const converter = vi.fn(() => 'converted');
    expect(stringifyAsLabel(null, converter)).toBe('');
    expect(stringifyAsValue(undefined, converter)).toBe('');
    expect(resolveSelectedLabel(null, { null: 'None' }, converter)).toBe('None');
    expect(converter).not.toHaveBeenCalled();
    expect(stringifyAsValue(false, converter)).toBe('converted');
    // Source types promise strings; JS callers can still return nullish values.
    const nullish = (() => undefined) as unknown as () => string;
    expect(stringifyAsLabel('x', nullish)).toBe('');
    expect(stringifyAsValue('x', nullish)).toBe('');
    expect(resolveSelectedLabel('x', undefined, nullish)).toBeUndefined();
  });
  it('preserves literal separators even for empty or invisible labels', () => {
    expect(resolveMultipleLabels([], undefined)).toEqual([]);
    expect(resolveMultipleLabels([null, 'x', 'y'], { x: false, y: 0 })).toEqual(['', ', ', false, ', ', 0]);
    expect(resolveMultipleLabels(['a', 'b'], undefined, (v) => v.toUpperCase())).toEqual(['A', ', ', 'B']);
  });
});
