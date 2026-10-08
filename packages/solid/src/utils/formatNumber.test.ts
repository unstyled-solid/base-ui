import { describe, expect, it } from 'vitest';
import { formatNumber, getFormatter } from './formatNumber';

const getOptions = (): Intl.NumberFormatOptions => ({
  currency: 'USD', style: 'currency', minimumFractionDigits: 2, maximumFractionDigits: 2,
});

describe('formatNumber (pinned source)', () => {
  it('caches the formatter based on options', () => {
    expect(getFormatter(undefined, getOptions())).toBe(getFormatter(undefined, getOptions()));
  });
  it('caches different Intl.Locale objects separately', () => {
    const fr = getFormatter(new Intl.Locale('fr-FR'), getOptions());
    const en = getFormatter(new Intl.Locale('en-US'), getOptions());
    expect(fr).not.toBe(en);
    expect(fr.resolvedOptions().locale).toBe('fr-FR');
    expect(en.resolvedOptions().locale).toBe('en-US');
  });
  it('formats a number', () => {
    expect(formatNumber(1234.56, undefined, getOptions()))
      .toBe(new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(1234.56));
  });
  it('formats a number with different options', () => {
    expect(formatNumber(0.1234, 'en-US', { style: 'percent' })).toBe('12%');
  });
  it('returns an empty string for null', () => {
    expect(formatNumber(null, 'en-US', getOptions())).toBe('');
  });
});

describe('formatNumber edge contracts', () => {
  it('shares equivalent locale keys and separates options without normalizing insertion order', () => {
    expect(getFormatter(new Intl.Locale('fr-FR'))).toBe(getFormatter('fr-FR'));
    expect(getFormatter(['fr-FR', new Intl.Locale('en-US')])).toBe(getFormatter(['fr-FR', 'en-US']));
    expect(getFormatter()).not.toBe(getFormatter(undefined, {}));
    expect(getFormatter('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 2 }))
      .not.toBe(getFormatter('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 1 }));
    const options: Intl.NumberFormatOptions = { maximumFractionDigits: 1 };
    const before = getFormatter('en-US', options);
    options.maximumFractionDigits = 2;
    expect(getFormatter('en-US', options)).not.toBe(before);
  });
  it.each([undefined, 'fr-FR', 'pt-BR', 'ar-EG'])('retains exact Intl output for locale %s', (locale) => {
    for (const value of [1234.56, -0, NaN, Infinity, -Infinity]) {
      expect(formatNumber(value, locale, getOptions())).toBe(new Intl.NumberFormat(locale, getOptions()).format(value));
    }
  });
  it('short-circuits null before Intl validation but propagates invalid non-null options', () => {
    expect(formatNumber(null, 'not_a_locale')).toBe('');
    expect(() => formatNumber(1, 'not_a_locale')).toThrow(RangeError);
    expect(() => formatNumber(1, undefined, { style: 'currency' })).toThrow(TypeError);
  });
});
