import { describe, expect, it } from 'vitest';
import { serializeValue } from './serializeValue';

describe('serializeValue', () => {
  it.each([
    [null, ''], [undefined, ''], ['', ''], ['raw', 'raw'], [false, 'false'], [0, '0'],
    [-0, '0'], [NaN, 'null'], [Infinity, 'null'], [[1, undefined], '[1,null]'],
    [{ value: 'x' }, '{"value":"x"}'],
  ])('serializes %s using the source JSON policy', (input, expected) => {
    expect(serializeValue(input)).toBe(expected);
  });
  it('uses toJSON and retains JSON.stringify undefined results', () => {
    expect(serializeValue({ toJSON: () => 'custom' })).toBe('"custom"');
    expect(serializeValue(Symbol('x'))).toBeUndefined();
    expect(serializeValue(() => 'x')).toBeUndefined();
    expect(serializeValue({ toJSON: () => undefined })).toBeUndefined();
  });
  it('falls back to String only on JSON failure, allowing fallback failures to propagate', () => {
    const circular: { self?: unknown } = {};
    circular.self = circular;
    expect(serializeValue(circular)).toBe('[object Object]');
    expect(serializeValue(123n)).toBe('123');
    expect(serializeValue({ toJSON() { throw new Error('json'); }, toString: () => 'fallback' })).toBe('fallback');
    expect(() => serializeValue({
      toJSON() { throw new Error('json'); },
      toString() { throw new Error('string'); },
    })).toThrow('string');
  });
});
