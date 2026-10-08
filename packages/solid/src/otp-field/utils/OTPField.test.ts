import { describe, expect, it, vi } from 'vitest';
import { getOTPValidationConfig, normalizeOTPValue, normalizeOTPValueWithDetails, removeOTPCharacter, replaceOTPValue, stripOTPWhitespace } from './otp';

// Source: utils/otp.test.ts at 19511bb171f3b360b006c94cf6d07e53cb446505.
describe('OTPField normalization', () => {
  it('strips whitespace and accepts nullish values', () => {
    expect(stripOTPWhitespace(' 12 3\t4\n5 ')).toBe('12345');
    expect(stripOTPWhitespace(null)).toBe('');
    expect(stripOTPWhitespace(undefined)).toBe('');
    expect(normalizeOTPValue(null, 6, 'numeric')).toBe('');
    expect(normalizeOTPValue(undefined, 6, 'alpha')).toBe('');
  });
  it.each([
    ['numeric', '1a 2b34c56', 4, '1234'],
    ['alpha', '1a 2b3C4', 6, 'abC'],
    ['alphanumeric', 'A1-B2 c3!', 6, 'A1B2c3'],
    ['none', 'a! 😀z', 3, 'a!😀'],
    ['none', '1234', -1, ''],
  ] as const)('normalizes %s, clamps without splitting code points', (mode, raw, length, expected) => {
    expect(normalizeOTPValue(raw, length, mode)).toBe(expected);
  });
  it('applies custom normalization after filtering, then revalidates and clamps', () => {
    const normalize = vi.fn((value: string) => value.toUpperCase());
    expect(normalizeOTPValue('ab-12 cd!', 6, 'alphanumeric', normalize)).toBe('AB12CD');
    expect(normalize).toHaveBeenCalledExactlyOnceWith('ab12cd');
    expect(normalizeOTPValue('12', 6, 'numeric', (v) => `${v}AB`)).toBe('12');
    expect(normalizeOTPValue('123456', 4, 'numeric', (v) => `${v}789`)).toBe('1234');
    expect(normalizeOTPValue('ab-12 cd', 6, 'none', (v) => v.replace(/[^a-zA-Z0-9]/g, '').toUpperCase())).toBe('AB12CD');
  });
  it('distinguishes rejected characters from whitespace and expanded accepted values', () => {
    expect(normalizeOTPValueWithDetails(' 12 ', 2, 'numeric')).toEqual(['12', false]);
    expect(normalizeOTPValueWithDetails('123', 2, 'numeric')).toEqual(['12', true]);
    expect(normalizeOTPValueWithDetails('1a', 6, 'numeric', () => '12')).toEqual(['12', true]);
    expect(normalizeOTPValueWithDetails('19', 6, 'numeric', (v) => v.replace('9', ''))).toEqual(['1', true]);
    expect(normalizeOTPValueWithDetails('1', 6, 'numeric', () => '')).toEqual(['', true]);
    expect(normalizeOTPValueWithDetails('1', 6, 'numeric', () => '1a')).toEqual(['1', true]);
    expect(normalizeOTPValueWithDetails('1', 6, 'numeric', () => '12')).toEqual(['12', false]);
  });
  it.each([[0, '99', '993456'], [2, '99', '129956'], [5, '9', '123459']])('replaces at slot %s', (index, text, expected) => {
    expect(replaceOTPValue('123456', Number(index), String(text), 6, 'numeric')).toBe(expected);
  });
  it('preserves suffix after filtered custom middle replacement', () => {
    expect(replaceOTPValue('123456', 2, 'ab', 6, 'alphanumeric', (v) => v.toUpperCase())).toBe('12AB56');
    expect(replaceOTPValue('1303', 1, '29', 4, 'numeric', (v) => v.replace(/[^0-3]/g, ''))).toBe('1203');
  });
  it.each([[0, '234'], [3, '123'], [10, '1234'], [-1, '1234']])('removes slot %s', (index, expected) => {
    expect(removeOTPCharacter('1234', Number(index))).toBe(expected);
  });
  it.each([
    ['numeric', '\\d{1}', '\\d{4}', 'numeric'],
    ['alpha', '[a-zA-Z]{1}', '[a-zA-Z]{4}', 'text'],
    ['alphanumeric', '[a-zA-Z0-9]{1}', '[a-zA-Z0-9]{4}', 'text'],
  ] as const)('provides SSR validation constraints for %s', (mode, slot, root, inputMode) => {
    const config = getOTPValidationConfig(mode)!;
    expect(config.slotPattern).toBe(slot);
    expect(config.getRootPattern(4)).toBe(root);
    expect(config.inputMode).toBe(inputMode);
    expect(getOTPValidationConfig('none')).toBeNull();
  });
});
