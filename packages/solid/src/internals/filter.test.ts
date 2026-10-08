import { describe, expect, it, vi } from 'vitest';
import { createFilterMatcher, getFilter } from './filter';

describe('getFilter (pinned source)', () => {
  it('caches different locales separately', () => {
    expect(getFilter({ locale: new Intl.Locale('fr-FR') }))
      .not.toBe(getFilter({ locale: new Intl.Locale('en-US') }));
  });
  it('caches equivalent locale inputs', () => {
    expect(getFilter({ locale: new Intl.Locale('fr-FR') })).toBe(getFilter({ locale: 'fr-FR' }));
  });
  it('matches locale-aware substrings without accent sensitivity', () => {
    expect(getFilter({ locale: 'en-US' }).contains('Résumé', 'resume')).toBe(true);
  });
});

describe('filter edge contracts', () => {
  it('does no hash lookups for repeated ASCII windows and retains the UTF-16 fallback', () => {
    const filter = getFilter({ locale: 'en-US' });
    const NativeMap = Map;
    let reads = 0;
    class CountingMap<K, V> extends NativeMap<K, V> {
      override get(key: K) { reads++; return super.get(key); }
    }
    globalThis.Map = CountingMap;
    let asciiReads = -1;
    let fallbackReads = -1;
    try {
      const pair = createFilterMatcher(filter, 'zz');
      const triple = createFilterMatcher(filter, 'zzz');
      for (let i = 0; i < 10000; i++) { pair('aaaaab'); triple('aaaaab'); }
      asciiReads = reads;
      pair('éé'); triple('ééé');
      fallbackReads = reads - asciiReads;
    } finally { globalThis.Map = NativeMap; }
    expect(asciiReads).toBe(0);
    expect(fallbackReads).toBe(2);
  });
  it('does not build a substring map when each candidate has just one window', () => {
    const filter = getFilter({ locale: 'en-US' });
    const NativeMap = Map;
    let writes = 0;
    class CountingMap<K, V> extends NativeMap<K, V> {
      override set(key: K, value: V) { writes++; return super.set(key, value); }
    }
    globalThis.Map = CountingMap;
    let matches = 0;
    try {
      const match = createFilterMatcher(filter, 'Item 0999');
      for (let i = 0; i < 10000; i++) {
        if (match(`Item ${String(i).padStart(4, '0')}`)) matches++;
      }
    } finally { globalThis.Map = NativeMap; }
    expect(matches).toBe(1);
    expect(writes).toBe(0);
  });
  it('shares whole-window comparisons in every length strategy without reusing labels', () => {
    const descriptor = Object.getOwnPropertyDescriptor(Intl.Collator.prototype, 'compare')!;
    const comparisons = vi.fn();
    const getter = vi.spyOn(Intl.Collator.prototype, 'compare', 'get').mockImplementation(function (this: Intl.Collator) {
      const compare = descriptor.get!.call(this) as (a: string, b: string) => number;
      return (a: string, b: string) => { comparisons(a, b); return compare(a, b); };
    });
    try {
      const filter = getFilter({ locale: 'en-NZ', caseFirst: 'upper' });
      for (const query of ['z', 'zz', 'zzz', 'zzzz']) {
        for (const policy of [filter, filter.contains]) {
          comparisons.mockClear();
          let labelReads = 0;
          const item = { label: 'aaaaab' };
          const match = createFilterMatcher<typeof item>(policy, query, (value) => { labelReads++; return value.label; });
          for (let i = 0; i < 10000; i++) match(item);
          expect(labelReads).toBe(10000);
          expect(comparisons.mock.calls).toEqual([
            ['a'.repeat(query.length), query],
            ['a'.repeat(query.length - 1) + 'b', query],
          ]);
          item.label = query;
          expect(match(item)).toBe(true);
          expect(labelReads).toBe(10001);
        }
      }
      expect(getter).toHaveBeenCalledTimes(1);
    } finally { getter.mockRestore(); }
  });
  it('retains the current matcher when a live converter reenters a different length strategy', () => {
    const filter = getFilter({ locale: 'en-US' });
    for (const query of ['é', 'éé', 'ééé', 'éééé']) {
      expect(filter.contains({ label: query }, query, () => {
        expect(filter.contains('other', 'other')).toBe(true);
        return 'e'.repeat(query.length);
      })).toBe(true);
    }
  });
  it('distinguishes thousands of packed keys including high UTF-16 units', () => {
    const descriptor = Object.getOwnPropertyDescriptor(Intl.Collator.prototype, 'compare')!;
    let calls = 0;
    const getter = vi.spyOn(Intl.Collator.prototype, 'compare', 'get').mockImplementation(function (this: Intl.Collator) {
      const compare = descriptor.get!.call(this) as (a: string, b: string) => number;
      return (a: string, b: string) => { calls++; return compare(a, b); };
    });
    try {
      const filter = getFilter({ locale: 'fr-BE', sensitivity: 'variant', ignorePunctuation: false });
      for (const query of ['zz', 'zzz']) {
        const windows = Array.from({ length: 2048 }, (_, i) => query.length === 2
          ? String.fromCharCode(i + 256, 0xffff - i)
          : String.fromCharCode(i + 256, i % 256, 0xffff - i));
        const match = createFilterMatcher(filter, query);
        const before = calls;
        for (const window of windows) expect(match(window)).toBe(false);
        expect(calls - before).toBe(windows.length);
        for (const window of windows.slice().reverse()) expect(match(window)).toBe(false);
        expect(calls - before).toBe(windows.length);
        expect(match('z'.repeat(query.length - 1) + 'Z')).toBe(false);
      }
    } finally { getter.mockRestore(); }
  });
  it('packed UTF-16 keys agree with an independent Intl window oracle', () => {
    const texts = ['\u0000ab', '\u007fab', '\u0080ab', 'a\u0080b', '\uffffab', '\u8000ab', '🙂é-9', 'e\u0301-9', 'İıI', '0099', 'a-b', 'chCH', '\ud800x\udfff'];
    for (const locale of ['en', 'tr', 'cs']) {
      const filter = getFilter({ locale });
      const compare = new Intl.Collator(locale, { usage: 'search', sensitivity: 'base', ignorePunctuation: true }).compare;
      for (const query of ['a', 'é', '9', '99', '999', '\u0000a', '\uffffa', '\u8000ab', '🙂', '\ud800', 'ch', 'a-']) {
        const match = createFilterMatcher(filter.contains, query);
        for (const text of texts) {
          let expected = false;
          for (let i = 0; i <= text.length - query.length; i++) expected ||= compare(text.slice(i, i + query.length), query) === 0;
          expect(match(text)).toBe(expected);
        }
      }
    }
  });
  it('preserves accent matches at every window position with live labels', () => {
    const filter = getFilter({ locale: 'en-US' });
    for (const query of ['é', 'éé', 'ééé', 'é-éé', 'ééééé']) {
      const value = { label: '' };
      const match = createFilterMatcher<typeof value>(filter, query, item => item.label);
      for (let start = 0; start < 12; start++) {
        value.label = 'x'.repeat(start) + query.replaceAll('é', 'E') + 'y'.repeat(12);
        expect(match(value)).toBe(true);
        value.label = 'x'.repeat(start) + 'z'.repeat(query.length) + 'y'.repeat(12);
        expect(match(value)).toBe(false);
      }
    }
  });
  it('scan predicates preserve the native Intl oracle and live object labels', () => {
    const inputs = ['Résumé', 'a-b', '🙂Résumé!', 'Istanbul', 'İstanbul', 'Item 0999', '', '10', '2'];
    for (const locale of ['en-AU', 'tr', 'fr-FR']) {
      for (const options of [{}, { sensitivity: 'accent' as const }, { ignorePunctuation: false }, { numeric: true }]) {
        const filter = getFilter({ locale, ...options });
        for (const query of ['resume', 'ab', 'a-', 'istan', '999', '', '2']) {
          const match = createFilterMatcher(filter, query);
          expect(inputs.map(match)).toEqual(inputs.map((text) => filter.contains(text, query)));
        }
      }
    }
    const item = { label: 'Résumé' };
    const label = vi.fn((value: typeof item) => value.label);
    const match = createFilterMatcher(getFilter(), 'resume', label);
    expect(match(item)).toBe(true);
    item.label = 'Different';
    expect(match(item)).toBe(false);
    expect(label).toHaveBeenCalledTimes(2);
  });

  it('binds compare once and compares each repeated substring only once per scan', () => {
    const descriptor = Object.getOwnPropertyDescriptor(Intl.Collator.prototype, 'compare')!;
    const compareCalls = vi.fn();
    const getter = vi.spyOn(Intl.Collator.prototype, 'compare', 'get').mockImplementation(function (this: Intl.Collator) {
      const compare = descriptor.get!.call(this) as (a: string, b: string) => number;
      return (a: string, b: string) => { compareCalls(a, b); return compare(a, b); };
    });
    try {
      const filter = getFilter({ locale: 'de-AT', caseFirst: 'lower' });
      const match = createFilterMatcher(filter, 'z');
      for (let i = 0; i < 10000; i++) expect(match('aaaaab')).toBe(false);
      expect(getter).toHaveBeenCalledTimes(1);
      expect(compareCalls.mock.calls).toEqual([['a', 'z'], ['b', 'z']]);
      const nextScan = createFilterMatcher(filter, 'z');
      expect(nextScan('aaaaab')).toBe(false);
      expect(compareCalls).toHaveBeenCalledTimes(4);
      expect(getter).toHaveBeenCalledTimes(1);
      compareCalls.mockClear();
      for (let i = 0; i < 10000; i++) expect(filter.contains('aaaaab', 'z')).toBe(false);
      expect(compareCalls.mock.calls).toEqual([['a', 'z'], ['b', 'z']]);
      expect(filter.contains({ label: 'aaaaab' }, 'z', () => {
        filter.contains('different', 'other-query');
        return 'aaaaab';
      })).toBe(false);
    } finally { getter.mockRestore(); }
  });
  it('uses source defaults, overrides, locale lists and option insertion-order cache keys', () => {
    expect(getFilter()).toBe(getFilter({ usage: 'search', sensitivity: 'base', ignorePunctuation: true }));
    expect(getFilter({ locale: ['fr-FR', new Intl.Locale('en-US')] }))
      .toBe(getFilter({ locale: [new Intl.Locale('fr-FR'), 'en-US'] }));
    expect(getFilter({ sensitivity: 'accent' })).not.toBe(getFilter());
    expect(getFilter({ numeric: true, caseFirst: 'upper' }))
      .not.toBe(getFilter({ caseFirst: 'upper', numeric: true }));
    expect(getFilter({ locale: 'en-US', sensitivity: 'accent' }).contains('Résumé', 'resume')).toBe(false);
    expect(getFilter({ locale: 'tr' }).startsWith('İstanbul', 'istan')).toBe(true);
    expect(getFilter({ locale: 'tr' }).startsWith('Istanbul', 'istan')).toBe(false);
  });

  it.each(['contains', 'startsWith', 'endsWith'] as const)('%s short-circuits empty queries and null converters', (method) => {
    const filter = getFilter();
    const converter = vi.fn(() => { throw new Error('must not stringify'); });
    expect(filter[method]({ label: 'x' }, '', converter)).toBe(true);
    expect(filter[method](null, 'x', converter)).toBe(false);
    expect(filter[method](undefined, 'x', converter)).toBe(false);
    expect(converter).not.toHaveBeenCalled();
    expect(filter[method]({ label: 'Résumé' }, 'resume')).toBe(true);
    expect(filter[method]({ value: 'Résumé' }, 'resume')).toBe(true);
    expect(filter[method]({ name: 'Résumé' }, 'resume', (item) => item.name)).toBe(true);
    expect(filter[method]('', 'x')).toBe(false);
  });

  it('preserves fixed UTF-16 windows rather than punctuation stripping or full-string normalization', () => {
    const filter = getFilter({ locale: 'en-US' });
    expect(filter.contains('a-b', 'ab')).toBe(false);
    expect(filter.startsWith('a', 'a-')).toBe(true);
    expect(filter.contains('a', 'a-')).toBe(false);
    expect(filter.endsWith('a', 'a-')).toBe(false);
    expect(filter.contains('🙂Résumé!', 'resume')).toBe(true);
    expect(filter.startsWith('Résumé!', 'resume')).toBe(true);
    expect(filter.endsWith('!Résumé', 'resume')).toBe(true);
    expect(filter.startsWith('xRésumé', 'resume')).toBe(false);
    expect(filter.endsWith('Résuméx', 'resume')).toBe(false);
    expect(getFilter({ ignorePunctuation: false }).startsWith('a', 'a-')).toBe(false);
  });

  it('propagates invalid Intl input and converter errors', () => {
    expect(() => getFilter({ locale: 'not_a_locale' })).toThrow(RangeError);
    expect(() => getFilter().contains('x', 'x', () => { throw new Error('converter'); })).toThrow('converter');
  });
});
