import { describe, expect, it } from 'vitest';
import { stringifyLocale } from './stringifyLocale';

describe('stringifyLocale', () => {
  it('stringifies Intl locale arguments for cache keys', () => {
    expect(stringifyLocale()).toBe('');
    expect(stringifyLocale('en-US')).toBe('en-US');
    expect(stringifyLocale(new Intl.Locale('fr-FR'))).toBe('fr-FR');
    expect(stringifyLocale(['fr-FR', new Intl.Locale('en-US')])).toBe('fr-FR,en-US');
  });
  it('does not canonicalize raw strings or reorder fallback lists', () => {
    expect(stringifyLocale('en-us')).toBe('en-us');
    expect(stringifyLocale([])).toBe('');
    expect(stringifyLocale(['en-US', 'fr-FR'])).toBe('en-US,fr-FR');
    expect(stringifyLocale(new Intl.Locale('en-us'))).toBe('en-US');
  });
});
