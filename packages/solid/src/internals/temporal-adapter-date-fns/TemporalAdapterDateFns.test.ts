import { describe, it, expect, onTestFinished } from 'vitest';
import { arEG } from 'date-fns/locale/ar-EG';
import { arSA } from 'date-fns/locale/ar-SA';
import { enIN } from 'date-fns/locale/en-IN';
import { enUS } from 'date-fns/locale/en-US';
import { fr } from 'date-fns/locale/fr';
import { he } from 'date-fns/locale/he';
import { hi } from 'date-fns/locale/hi';
import { describeGregorianAdapter } from '../temporal/describeGregorianAdapter';
import { getAdapterWeekendDays, stubIntlWeekInfo } from '../temporal/describeGregorianAdapter/describeGregorianAdapter.utils';
import { TemporalAdapterDateFns } from './TemporalAdapterDateFns';

describe('TemporalAdapterDateFns', () => {
  describeGregorianAdapter({
    adapter: new TemporalAdapterDateFns(), adapterFr: new TemporalAdapterDateFns({ locale: fr }),
    setDefaultTimezone: null, createDateInFrenchLocale: (dateStr) => new Date(dateStr),
    createAdapterWithLocale: (localeCode) => new TemporalAdapterDateFns({
      locale: { 'en-US': enUS, he, 'en-IN': enIN, 'ar-SA': arSA, hi, 'ar-EG': arEG }[localeCode],
    }),
  });
  describe('setTimezone duck typing', () => {
    it('should use withTimeZone on non-TZDate objects that support it', () => {
      const expected = new Date('2026-04-06T12:00:00Z');
      const fakeDate = Object.assign(new Date('2026-04-06T12:00:00Z'), { withTimeZone: () => expected });
      expect(new TemporalAdapterDateFns().setTimezone(fakeDate, 'America/New_York')).toBe(expected);
    });
  });
  describe('isWeekend', () => {
    it('should fall back to Saturday and Sunday when the locale code is invalid', () => {
      const adapter = new TemporalAdapterDateFns({ locale: { ...he, code: 'not a locale' } });
      const friday = adapter.date('2018-11-02T12:00:00.000Z', 'UTC');
      expect(adapter.isWeekend(friday)).toBe(false);
      expect(adapter.isWeekend(adapter.addDays(friday, 1))).toBe(true);
    });
    it('should read the week info once the engine supports it', () => {
      const adapter = new TemporalAdapterDateFns({ locale: { ...he } });
      const restoreWeekInfo = stubIntlWeekInfo('none');
      try { expect(getAdapterWeekendDays(adapter)).toEqual([6, 7]); } finally { restoreWeekInfo(); }
      onTestFinished(stubIntlWeekInfo('method'));
      expect(getAdapterWeekendDays(adapter)).toEqual([2, 3]);
    });
  });
});
