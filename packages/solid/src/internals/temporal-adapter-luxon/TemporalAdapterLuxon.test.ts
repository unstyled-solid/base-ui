import { describe, beforeEach, afterEach, it, expect, onTestFinished } from 'vitest';
import { DateTime, Settings } from 'luxon';
import { describeGregorianAdapter } from '../temporal/describeGregorianAdapter';
import { TemporalAdapterLuxon } from './TemporalAdapterLuxon';

describe('TemporalAdapterLuxon', () => {
  // Preserve the caller's actual Zone object, not a hardcoded system reset.
  // Every case owns its Settings mutation, including failed default-zone cases.
  let originalDefaultZone = Settings.defaultZone;
  beforeEach(() => { originalDefaultZone = Settings.defaultZone; });
  afterEach(() => { Settings.defaultZone = originalDefaultZone; });
  describeGregorianAdapter({
    adapter: new TemporalAdapterLuxon(), adapterFr: new TemporalAdapterLuxon({ locale: 'fr' }),
    setDefaultTimezone: (timezone) => { Settings.defaultZone = timezone ?? originalDefaultZone; },
    createDateInFrenchLocale: (dateStr) => DateTime.fromISO(dateStr, { locale: 'fr' }),
    createAdapterWithLocale: (localeCode) => new TemporalAdapterLuxon({ locale: localeCode }),
  });
  describe('isWeekend', () => {
    it('should respect Settings.defaultWeekSettings', () => {
      const originalWeekSettings = Settings.defaultWeekSettings;
      onTestFinished(() => { Settings.defaultWeekSettings = originalWeekSettings; });
      Settings.defaultWeekSettings = { firstDay: 1, minimalDays: 4, weekend: [5, 6] };
      const adapter = new TemporalAdapterLuxon({ locale: 'en-US' });
      expect(adapter.isWeekend(adapter.date('2018-11-02T12:00:00.000Z', 'UTC'))).toBe(true);
    });
  });
});
