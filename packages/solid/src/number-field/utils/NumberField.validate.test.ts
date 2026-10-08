// Source: number-field/utils/validate.test.ts at 19511bb171f3b360b006c94cf6d07e53cb446505.
import { describe, expect, it } from 'vitest';
import { removeFloatingPointErrors, toValidatedNumber } from './validate';
type Format = NonNullable<Parameters<typeof removeFloatingPointErrors>[1]>;
const validate = (value: number | null, options: { step?: number; min?: number; max?: number; base?: number; format?: Format; snap?: boolean; small?: boolean; clamp?: boolean } = {}) =>
  toValidatedNumber(value, options.step, options.min ?? Number.MIN_SAFE_INTEGER, options.max ?? Number.MAX_SAFE_INTEGER, options.base ?? options.min ?? 0, options.format, options.snap ?? true, options.small ?? false, options.clamp ?? true);

describe('NumberField validate (source fixtures)', () => {
  it.each([
    [0.2 + 0.1, 0.3], [-0.1 - 0.2, -0.3], [0.1 + 0.7, 0.8], [0.1 + 0.2 + 0.3, 0.6],
    [0.0005, 0.0005], [1.23456, 1.23456], [Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
    [Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER], [1000000.1 + 0.2, 1000000.1 + 0.2],
    [Infinity, Infinity], [-Infinity, -Infinity], [NaN, NaN], [1000, 1000],
  ])('bounded arithmetic cleanup %s', (value, expected) => { expect(removeFloatingPointErrors(value)).toBe(expected); });
  const roundingCases: [string, number, Format, number][] = [
    ['compact', 1234.567, { notation: 'compact', maximumFractionDigits: 1 }, 1234.6],
    ['fraction', 0.2 + 0.1, { maximumFractionDigits: 1 }, 0.3],
    ['floor', 1.239, { maximumFractionDigits: 2, roundingMode: 'floor' }, 1.23],
    ['halfEven up', 1.235, { maximumFractionDigits: 2, roundingMode: 'halfEven' }, 1.24],
    ['halfEven down', 1.245, { maximumFractionDigits: 2, roundingMode: 'halfEven' }, 1.24],
    ['negative floor', -1.239, { maximumFractionDigits: 2, roundingMode: 'floor' }, -1.24],
    ['negative trunc', -1.239, { maximumFractionDigits: 2, roundingMode: 'trunc' }, -1.23],
    ['percent', 0.01236, { style: 'percent', maximumFractionDigits: 2 }, 0.0124],
    ['percent floor', 0.01239, { style: 'percent', maximumFractionDigits: 2, roundingMode: 'floor' }, 0.0123],
    ['percent minimum', 0.01239, { style: 'percent', minimumFractionDigits: 2, roundingMode: 'floor' }, 0.0123],
    ['significant', 12345, { maximumSignificantDigits: 3, roundingMode: 'floor' }, 12300],
    ['percent significant', 0.01239, { style: 'percent', maximumSignificantDigits: 3, roundingMode: 'floor' }, 0.0123],
    ['percent binary noise', 0.009995, { style: 'percent', maximumSignificantDigits: 2, roundingMode: 'floor' }, 0.0099],
    ['tiny percent', 0.000001234, { style: 'percent', maximumSignificantDigits: 2 }, 0.0000012],
    ['percent boundary', 0.01230000001, { style: 'percent', maximumFractionDigits: 2, roundingMode: 'ceil' }, 0.0124],
    ['high precision percent', 0.001234567890123456, { style: 'percent', maximumFractionDigits: 16 }, 0.001234567890123456],
    ['high precision boundary', 0.0046, { style: 'percent', maximumFractionDigits: 16, roundingMode: 'floor' }, 0.0046],
    ['21 fraction digits', 1e-21, { maximumFractionDigits: 21 }, 1e-21],
    ['percent priority', 0.0123456, { style: 'percent', maximumSignificantDigits: 3, roundingPriority: 'morePrecision' }, 0.0123],
    ['priority', 1.2399, { minimumFractionDigits: 2, maximumSignificantDigits: 3, roundingMode: 'floor', roundingPriority: 'morePrecision' }, 1.239],
    ['unit percent', 1.239, { style: 'unit', unit: 'percent', maximumFractionDigits: 2, roundingMode: 'floor' }, 1.23],
    ['currency', 1.239, { style: 'currency', currency: 'USD', maximumFractionDigits: 2, roundingMode: 'floor' }, 1.23],
    ['currency scientific', 12345, { style: 'currency', currency: 'EUR', currencyDisplay: 'code', notation: 'scientific', maximumFractionDigits: 2 }, 12300],
    ['hidden sign', -1.239, { maximumFractionDigits: 2, signDisplay: 'never' }, -1.24],
    ['accounting', -1.239, { style: 'currency', currency: 'USD', currencySign: 'accounting', maximumFractionDigits: 2 }, -1.24],
    ['default precision floor', 1.2399, { minimumIntegerDigits: 1, roundingMode: 'floor' }, 1.239],
    ['increment', 1.26, { minimumFractionDigits: 1, maximumFractionDigits: 1, roundingIncrement: 5 }, 1.5],
    ['overflow', Number.MAX_VALUE, { style: 'percent', maximumFractionDigits: 2, roundingMode: 'floor' }, Number.MAX_VALUE],
    ['scientific', 0.000123456, { notation: 'scientific', maximumFractionDigits: 2 }, 0.000123],
    ['noninvertible zero bucket', 12345, { notation: 'scientific', minimumFractionDigits: 0, maximumFractionDigits: 0, roundingIncrement: 5 }, 12345],
    ['invertible zero bucket', 1, { notation: 'scientific', minimumFractionDigits: 0, maximumFractionDigits: 0, roundingIncrement: 5 }, 0],
    ['resolved fraction maximum', 1.234567, { minimumFractionDigits: 5 }, 1.23457],
  ];
  it.each(roundingCases)('Intl rounding: %s', (_, value, format, expected) => { expect(removeFloatingPointErrors(value, format)).toBe(expected); });
  it('retains the source display-round-trip assertions after numeric rounding', () => {
    for (const name of ['percent binary noise', 'tiny percent', 'percent boundary', 'high precision boundary',
      'percent priority', 'hidden sign', 'accounting', 'scientific', 'noninvertible zero bucket']) {
      const [, value, format, expected] = roundingCases.find(([label]) => label === name)!;
      const rounded = removeFloatingPointErrors(value, format);
      expect(rounded).toBe(expected);
      expect(new Intl.NumberFormat('en-US', format).format(rounded)).toBe(new Intl.NumberFormat('en-US', format).format(value));
    }
    expect(removeFloatingPointErrors(1000000.1 + 0.2)).not.toBe(1000000.3);
    expect(removeFloatingPointErrors(1000, { style: 'currency', currency: 'USD' })).toBe(1000);
  });
  it.each(['floor', 'ceil', 'trunc', 'expand'])('keeps exact percent boundary: %s', (roundingMode) => {
    expect(removeFloatingPointErrors(0.0046, { style: 'percent', maximumFractionDigits: 2, roundingMode })).toBe(0.0046);
  });
  it.each([
    [5, 1, 5], [5.5, 1, 5], [-0.3, 1, -1], [9, 5, 5], [12, 5, 10],
    [5, -1, 5], [5.5, -1, 6], [-0.3, -1, 0], [9, -5, 10], [12, -5, 15],
    [100.1 + 0.1, 0.1, 100.2], [100.1 - 0.1, -0.1, 100], [0.01 + 0.01, 0.01, 0.02],
  ])('directional snap %s by %s', (value, step, expected) => { expect(validate(value, { step })).toBe(expected); });
  it('preserves direct text precision, null, unsnapped steps and range entry', () => {
    expect(validate(null)).toBeNull();
    for (const value of [1.234567890123456, 0.1234567890123456, 5.5]) expect(validate(value)).toBe(value);
    expect(validate(12, { min: 0, max: 10, clamp: false })).toBe(12);
    expect(validate(9.7, { step: 5, snap: false })).toBe(9.7);
    expect(validate(12.3, { step: -5, snap: false })).toBe(12.3);
    expect(validate(0.1 + 0.7, { step: 0.1, snap: false })).toBe(0.8);
    expect(validate(100000000000000.1 + 0.1, { step: 0.1, snap: false })).toBe(100000000000000.1 + 0.1);
    expect(validate(0.1234567890123456, { step: 0.1234567890123456, snap: false })).toBe(0.1234567890123456);
  });
  it('preserves the source positional options for null, unclamped input and post-rounding bounds', () => {
    expect(validate(null, { step: 1 })).toBeNull();
    expect(validate(12, { min: 0, max: 10, snap: false, clamp: false })).toBe(12);
    expect(validate(0.2 + 0.1, { step: 0.1, snap: false })).toBe(0.3);
    expect(validate(0.01236, { max: 0.01235, snap: false, format: { style: 'percent', maximumFractionDigits: 2 } })).toBe(0.01235);
    expect(validate(0.01234, { min: 0.01235, snap: false, format: { style: 'percent', maximumFractionDigits: 2, roundingMode: 'floor' } })).toBe(0.01235);
    expect(validate(0.4, { min: 0.6, base: 0, max: 10, snap: false, format: { maximumFractionDigits: 0 } })).toBe(1);
    expect(validate(12.349, { min: 0, max: 10, snap: false, clamp: false, format: { maximumFractionDigits: 2 } })).toBe(12.35);
  });
  it('snaps before clamping and clamps both before and after rounding', () => {
    expect(validate(13, { step: 3, min: 0, max: 10 })).toBe(10);
    expect(validate(-13, { step: -3, min: -10, max: 0 })).toBe(-10);
    expect(validate(0.4, { min: 0.6, max: 10, format: { maximumFractionDigits: 0 } })).toBe(1);
    expect(validate(0.01236, { max: 0.01235, format: { style: 'percent', maximumFractionDigits: 2 } })).toBe(0.01235);
    expect(validate(0.01234, { min: 0.01235, format: { style: 'percent', maximumFractionDigits: 2, roundingMode: 'floor' } })).toBe(0.01235);
    expect(validate(12.349, { min: 0, max: 10, clamp: false, format: { maximumFractionDigits: 2 } })).toBe(12.35);
    expect(validate(1.239, { step: 0.001, format: { maximumFractionDigits: 2, roundingMode: 'floor' } })).toBe(1.23);
    expect(validate(3 + 0.2 + 0.2, { step: 0.2, min: 3 })).toBe(3.4);
    expect(validate(0.15, { step: 0.1, small: true })).toBe(0.2);
    expect(validate(-0.15, { step: -0.1, small: true })).toBe(-0.2);
  });
});
