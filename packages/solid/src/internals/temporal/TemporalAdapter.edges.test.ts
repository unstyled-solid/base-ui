import { describe, it, expect, vi, onTestFinished } from 'vitest';
import { DateTime } from 'luxon';
import { fr } from 'date-fns/locale/fr';
import { pl } from 'date-fns/locale/pl';
import { TemporalAdapterDateFns } from '../temporal-adapter-date-fns';
import { TemporalAdapterLuxon } from '../temporal-adapter-luxon';
import type { TemporalAdapter } from '.';

function edgeCases<T>(adapter: TemporalAdapter<T>) {
  describe(adapter.lib, () => {
    it.each(['system', 'default', 'UTC', 'America/New_York'])('now preserves the instant in %s', (zone) => {
      vi.useFakeTimers();
      onTestFinished(() => { vi.useRealTimers(); });
      vi.setSystemTime(new Date('2024-03-31T00:30:45.123Z'));
      expect(adapter.toJsDate(adapter.now(zone)).toISOString()).toBe('2024-03-31T00:30:45.123Z');
    });
    it.each([
      ['Europe/Paris', '2024-03-31T00:00:00', 23],
      ['Europe/Paris', '2024-10-27T00:00:00', 25],
      ['America/New_York', '2024-03-10T00:00:00', 23],
      ['America/New_York', '2024-11-03T00:00:00', 25],
    ] as const)('calendar and elapsed arithmetic cross DST: %s %s', (zone, input, hours) => {
      const date = adapter.date(input, zone);
      const nextDay = adapter.addDays(date, 1);
      expect(adapter.getHours(nextDay)).toBe(0);
      expect(adapter.getTimezone(nextDay)).toBe(zone);
      expect(adapter.differenceInHours(nextDay, date)).toBe(hours);
      expect(adapter.differenceInDays(nextDay, date)).toBe(1);
      expect(adapter.getTime(adapter.endOfDay(date)) - adapter.getTime(adapter.startOfDay(date))).toBe(hours * 3600000 - 1);
      expect(adapter.getTime(adapter.addHours(date, 24)) - adapter.getTime(date)).toBe(24 * 3600000);
      expect(adapter.getHours(date)).toBe(0); // input was not mutated
    });
    it('clamps leap-day and month-end arithmetic without mutating its input', () => {
      const leap = adapter.date('2024-02-29T12:34:56', 'UTC');
      expect(adapter.getDate(adapter.addYears(leap, 1))).toBe(28);
      // date-fns setYear rolls February 29 to March 1; Luxon clamps to February 28.
      expect(adapter.formatByString(adapter.setYear(leap, 2023), 'yyyy-MM-dd'))
        .toBe(adapter.lib === 'date-fns' ? '2023-03-01' : '2023-02-28');
      const january = adapter.date('2024-01-31T12:34:56', 'UTC');
      expect(adapter.getDate(adapter.addMonths(january, 1))).toBe(29);
      expect(adapter.getMonth(january)).toBe(0);
      expect(adapter.getDate(leap)).toBe(29);
    });
    it('preserves complete weeks and inclusive range endpoints', () => {
      const date = adapter.date('2024-01-01T12:00', 'UTC');
      const end = adapter.addWeeks(date, 3);
      expect(adapter.differenceInWeeks(end, date)).toBe(3);
      expect(adapter.differenceInWeeks(date, end)).toBe(-3);
      expect(adapter.isWithinRange(date, [date, end])).toBe(true);
      expect(adapter.isWithinRange(end, [date, end])).toBe(true);
      expect(adapter.isWithinRange(adapter.addMilliseconds(end, 1), [date, end])).toBe(false);
    });
    it('distinguishes invalid objects, null and equal instants', () => {
      const invalid = adapter.date('not-a-date', 'system');
      expect(adapter.isValid(invalid)).toBe(false);
      expect(adapter.isEqual(invalid, invalid)).toBe(false);
      expect(adapter.isValid(null)).toBe(false);
      expect(adapter.isEqual(null, null)).toBe(true);
      const valid = adapter.date('2024-01-01', 'UTC');
      expect(adapter.isEqual(valid, null)).toBe(false);
      expect(adapter.isEqual(valid, adapter.setTimezone(valid, 'Pacific/Kiritimati'))).toBe(true);
      expect(adapter.isValid(adapter.parse('garbage', 'yyyy-MM-dd', 'system'))).toBe(false);
    });
    it('parses locale-independent custom tokens into the requested wall clock', () => {
      const date = adapter.parse('2024-03-31 04:35:17', 'yyyy-MM-dd HH:mm:ss', 'Europe/Paris');
      expect(adapter.getTimezone(date)).toBe('Europe/Paris');
      expect(adapter.getHours(date)).toBe(4);
      expect(adapter.getMinutes(date)).toBe(35);
      expect(adapter.getSeconds(date)).toBe(17);
      expect(adapter.toJsDate(date).toISOString()).toBe('2024-03-31T02:35:17.000Z');
    });
  });
}
describe('TemporalAdapter additional boundaries', () => {
  edgeCases(new TemporalAdapterDateFns());
  edgeCases(new TemporalAdapterLuxon());
  it('retains the adapters’ distinct negative fractional difference semantics', () => {
    const dates = new TemporalAdapterDateFns();
    const luxon = new TemporalAdapterLuxon();
    expect(dates.differenceInHours(dates.date('2024-01-01T00:00', 'UTC'), dates.date('2024-01-01T01:30', 'UTC'))).toBe(-1);
    expect(luxon.differenceInHours(luxon.date('2024-01-01T00:00', 'UTC'), luxon.date('2024-01-01T01:30', 'UTC'))).toBe(-2);
  });
  it('retains date-fns face-value construction versus Luxon ISO offset conversion', () => {
    const dates = new TemporalAdapterDateFns();
    const luxon = new TemporalAdapterLuxon();
    const input = '2024-06-01T12:00:00+02:00';
    // date-fns intentionally uses the system-local getters of new Date(input).
    const systemHours = new Date(input).getHours();
    expect(dates.getHours(dates.date(input, 'America/New_York'))).toBe(systemHours);
    expect(luxon.getHours(luxon.date(input, 'America/New_York'))).toBe(6);
    expect(luxon.toJsDate(luxon.date(input, 'America/New_York')).toISOString()).toBe('2024-06-01T10:00:00.000Z');
  });
  it('retains date-fns native identity and Luxon equal-zone identity', () => {
    const dates = new TemporalAdapterDateFns();
    const native = new Date('2024-01-01T00:00:00Z');
    expect(dates.toJsDate(native)).toBe(native);
    expect(dates.setTimezone(native, 'system')).toBe(native);
    const zoned = dates.setTimezone(native, 'UTC');
    const converted = dates.toJsDate(zoned);
    expect(converted).not.toBe(zoned);
    expect(converted.getTime()).toBe(native.getTime());
    const luxon = new TemporalAdapterLuxon();
    const dateTime = luxon.date('2024-01-01', 'UTC');
    expect(luxon.setTimezone(dateTime, 'UTC')).toBe(dateTime);
  });
  it('retains Luxon local week/weekend fallbacks without changing production feature detection', () => {
    const adapter = new TemporalAdapterLuxon();
    const date = DateTime.fromISO('2024-06-02', { locale: 'en-US', zone: 'UTC' });
    Object.defineProperties(date, {
      localWeekNumber: { value: undefined }, localWeekday: { value: undefined }, isWeekend: { value: undefined },
    });
    expect(adapter.getWeekNumber(date)).toBe(date.weekNumber);
    expect(adapter.getDayOfWeek(date)).toBe(date.weekday);
    expect(adapter.isWeekend(date)).toBe(true);
  });
  it('now keeps the configured Luxon locale despite the narrower installed fromJSDate declarations', () => {
    expect(new TemporalAdapterLuxon({ locale: 'fr' }).now('UTC').locale).toBe('fr');
  });
  for (const adapter of [new TemporalAdapterDateFns({ locale: fr }), new TemporalAdapterLuxon({ locale: 'fr' })]) {
    // Each concrete adapter remains independently typed; the generic helper correlates its values.
    function localized<T>(instance: TemporalAdapter<T>) {
      const date = instance.date('2024-06-02T15:08:09', 'UTC');
      expect(instance.format(date, 'localizedNumericDate')).toBe('02/06/2024');
      expect(instance.format(date, 'monthFullLetter')).toBe('juin');
      expect(instance.format(instance.startOfWeek(date), 'dayOfMonthPadded')).toBe('27');
      expect(instance.format(instance.endOfWeek(date), 'dayOfMonthPadded')).toBe('02');
      expect(instance.formatByString(instance.parse('2 juin 2024', 'd MMMM yyyy', 'UTC'), 'yyyy-MM-dd')).toBe('2024-06-02');
    }
    it(`French formats, parsing and week conventions: ${adapter.lib}`, () => {
      if (adapter instanceof TemporalAdapterDateFns) localized(adapter);
      else localized(adapter);
    });
  }
  it('preserves standalone versus grammatical Polish month forms', () => {
    const dates = new TemporalAdapterDateFns({ locale: pl });
    const luxon = new TemporalAdapterLuxon({ locale: 'pl' });
    const d = dates.date('2024-06-02', 'UTC');
    const l = luxon.date('2024-06-02', 'UTC');
    expect(dates.format(d, 'monthFullLetterStandalone')).toBe('czerwiec');
    expect(dates.format(d, 'monthFullLetter')).toBe('czerwca');
    expect(luxon.format(l, 'monthFullLetterStandalone')).toBe('czerwiec');
    expect(luxon.format(l, 'monthFullLetter')).toBe('czerwca');
    expect(luxon.formats.fullMonthAndYear).toBe('MMMM yyyy');
  });
});
