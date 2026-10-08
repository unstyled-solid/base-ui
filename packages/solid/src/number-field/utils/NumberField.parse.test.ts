// Source: number-field/utils/parse.test.ts at 19511bb171f3b360b006c94cf6d07e53cb446505.
import { describe, expect, it } from 'vitest';
import { getNumberLocaleDetails, isNumeralChar, parseNumber } from './parse';

describe('NumberField parse (source fixtures)', () => {
  it('resolves locale separators even when formatting hides decimals', () => {
    expect(getNumberLocaleDetails('en-US')).toMatchObject({ decimal: '.', group: ',' });
    const details = getNumberLocaleDetails('en-US');
    expect(details.currency).toBeUndefined();
    expect(details.percent).toBeUndefined();
    expect(details.unit).toBeUndefined();
    expect(getNumberLocaleDetails('de-DE', { maximumFractionDigits: 0 }).decimal).toBe(',');
  });
  it('parses the runtime default locale and explicit percent and currency fixtures', () => {
    expect(parseNumber(new Intl.NumberFormat().format(1234.56))).toBe(1234.56);
    expect(parseNumber('12%', 'en-US', { style: 'percent' })).toBe(0.12);
    expect(parseNumber('$1,234.56', 'en-US', { style: 'currency', currency: 'USD' })).toBe(1234.56);
    expect(parseNumber('1e-7‰', 'en-US')).toBe(1e-10);
    expect(parseNumber('12 kg', 'en-US', { style: 'unit', unit: 'kilogram' })).toBe(12);
    expect(parseNumber('12 km/h', 'en-US', { style: 'unit', unit: 'kilometer-per-hour' })).toBe(12);
    expect(parseNumber('12 m/s', 'en-US', { style: 'unit', unit: 'meter-per-second' })).toBe(12);
    const overflowFormat = { style: 'percent', maximumFractionDigits: 2 } as const;
    expect(parseNumber(new Intl.NumberFormat('en-US', overflowFormat).format(Number.MAX_VALUE), 'en-US', { style: 'percent' })).toBeNull();
    const fr = new Intl.NumberFormat('fr-FR').format(1234.5);
    expect(parseNumber(fr, 'fr-FR')).toBe(1234.5);
    expect(parseNumber(`${fr}−`, 'fr-FR')).toBe(-1234.5);
  });
  it.each([
    ['12%', 0.12], ['一,二三四.五六', 1234.56], ['١٢٪', 0.12], ['一二%', 0.12],
    ['１，２３４．５６', 1234.56], ['１２％', 0.12], ['۱۲۳۴', 1234], ['۱۲٫۳۴', 12.34], ['۱۲٪', 0.12],
    ['۱۲٬۳۴۵٫۶۷', 12345.67], ['١٬٢٣٤٫٥٦', 1234.56], ['12‰', 0.012], ['12؉', 0.012],
    ['1\u200E234.56', 1234.56], ['\u200E12\u200F%', 0.12], ['−1234', -1234], ['1234−', -1234],
    ['＋1234', 1234], ['1234＋', 1234], ['1e-7‰', 1e-10], ['1.234.567.89', 1234567.89],
    ['+1234', 1234], ['1234+', 1234], ['-1234', -1234], ['1234-', -1234],
    ['‒123', -123], ['–123', -123], ['—123', -123], ['－123', -123], ['﹣123', -123], ['﹢123', 123],
    ['12％', 0.12], ['12﹪', 0.12], ['12٪', 0.12], ['1٬234٫56', 1234.56],
    ['1\u202A234\u202C.56', 1234.56], ['\u202A12\u202C%', 0.12],
    ['1..5', 1.5], ['123..456..789.01', 123456789.01], ['....5', 0.5],
    ['۹۸۷۶۵۴۳۲۱۰', 9876543210], ['０１２３４５６７８９', 123456789], ['٩٨٧٦٥٤٣٢١٠', 9876543210],
    ['九八七六五四三二一〇', 9876543210], ['零', 0], ['〇', 0],
    ['invalid', null], ['Infinity', null], ['-Infinity', null], ['∞', null], [' +Infinity ', null],
    [' -∞ ', null], ['+Infinity', null], ['', null], ['   ', null], ['-', null], ['+', null], ['1e999', null],
  ] as const)('parses %s → %s', (text, expected) => { expect(parseNumber(text)).toBe(expected); });
  it.each([
    ['1.234.567,89', 'fr-FR', 1234567.89], ['1.234.567,89', 'en-US', 1234.56789],
    ['1.234,56', 'de-DE', 1234.56], ['1.234.567,89', 'de-DE', 1234567.89],
    ['1’234.56', 'de-CH', 1234.56], ["1'234.56", 'de-CH', 1234.56],
    ...['\u202F', '\u2009', '\u2007', '\u00A0'].map((space) => [`1${space}234,56`, 'fr-FR', 1234.56] as const),
  ] as const)('locale %s (%s)', (text, locale, expected) => { expect(parseNumber(text, locale)).toBe(expected); });
  it.each(['en-US', 'fr-FR', 'de-DE', 'tr-TR', 'ar-EG', 'fa-IR'])('round trips decorated/scientific %s', (locale) => {
    const cases: [number, Intl.NumberFormatOptions, number][] = [
      [1234.56, { style: 'currency', currency: 'EUR' }, 1234.56],
      [0.0123, { style: 'percent', maximumFractionDigits: 2 }, 0.0123],
      [12345, { notation: 'scientific', maximumFractionDigits: 2 }, 12300],
      [12345, { style: 'currency', currency: 'EUR', currencyDisplay: 'code', notation: 'scientific', maximumFractionDigits: 2 }, 12300],
      [0.0000012345, { style: 'percent', notation: 'scientific', maximumFractionDigits: 2 }, 0.00000123],
      [0.0000000000012345, { style: 'percent', notation: 'scientific', maximumFractionDigits: 2 }, 0.00000000000123],
      [12, { style: 'unit', unit: 'kilogram' }, 12],
      [12, { style: 'unit', unit: 'kilometer-per-hour' }, 12],
      [12, { style: 'unit', unit: 'meter-per-second' }, 12],
    ];
    for (const [value, format, expected] of cases) {
      expect(parseNumber(new Intl.NumberFormat(locale, format).format(value), locale, format)).toBe(expected);
    }
  });
  it('preserves source percent scaling, interleaved symbols, overflow and unit-percent policy', () => {
    expect(parseNumber('1e-7%', 'en-US', { style: 'percent' })).toBe(1e-9);
    expect(parseNumber('1%2', 'en-US', { style: 'percent' })).toBe(0.12);
    expect(parseNumber('1%2', 'en-US', { style: 'unit', unit: 'percent' })).toBe(12);
    expect(parseNumber('12%', 'en-US', { style: 'unit', unit: 'percent' })).toBe(12);
    expect(parseNumber(new Intl.NumberFormat('en-US', { style: 'percent' }).format(Number.MAX_VALUE), 'en-US', { style: 'percent' })).toBeNull();
    // Source intentionally uses parseFloat, rather than strict full-string parsing.
    expect(parseNumber('12abc', 'en-US')).toBe(12);
  });
  it('recognizes only the supported numeral systems', () => {
    for (const char of ['0', '9', '٠', '٩', '۰', '۹', '０', '９', '零', '〇', '九']) expect(isNumeralChar(char)).toBe(true);
    for (const char of ['.', ',', '-', '+', '%', '٫', 'a', ' ']) expect(isNumeralChar(char)).toBe(false);
  });
});
