import { describe, it, expect, onTestFinished } from 'vitest';
import { Settings } from 'luxon';
import { TemporalAdapterDateFns } from '../temporal-adapter-date-fns';
import { TemporalAdapterLuxon } from '../temporal-adapter-luxon';
import { withSystemTimezone } from './describeGregorianAdapter/withSystemTimezone';

// Requires Node's process.env.TZ to change the host Date/Intl timezone.
// A browser's fixed timezoneId context cannot implement that fixture contract.
describe('TemporalAdapter host timezone regressions', () => {
  it('runs source Gregorian fixtures under the upstream UTC runner contract', () => {
    // Upstream package.json test:_unit sets TZ=UTC before collection. Do not
    // repair a missing runner precondition by changing adapters or assertions.
    expect(new Date('2018-01-01T00:00:00Z').getTimezoneOffset()).toBe(0);
    expect(new Date('2018-07-01T00:00:00Z').getTimezoneOffset()).toBe(0);
  });

  it.each([
    ['America/Sao_Paulo', -3],
    ['America/New_York', -4],
    ['Asia/Jerusalem', 3],
    ['Asia/Tokyo', 9],
  ] as const)('preserves source ISO-offset construction under host %s', (host, offset) => {
    withSystemTimezone(host, () => {
      const dates = new TemporalAdapterDateFns();
      const luxon = new TemporalAdapterLuxon();
      const input = '2024-06-01T12:00:00+02:00'; // instant 10:00 UTC
      expect(new Date(input).getTimezoneOffset()).toBe(-offset * 60);
      const date = dates.date(input, 'America/New_York');
      // date-fns copies system-local getters into TZDate's requested zone.
      expect(dates.getHours(date)).toBe(10 + offset);
      expect(dates.toJsDate(date).toISOString()).toBe(`2024-06-01T${String(14 + offset).padStart(2, '0')}:00:00.000Z`);
      // Luxon parses the offset into an instant, then converts that instant.
      const time = luxon.date(input, 'America/New_York');
      expect(luxon.getHours(time)).toBe(6);
      expect(luxon.toJsDate(time).toISOString()).toBe('2024-06-01T10:00:00.000Z');
      for (const timezone of ['system', 'default']) {
        expect(dates.toJsDate(dates.date(input, timezone)).toISOString()).toBe('2024-06-01T10:00:00.000Z');
        expect(luxon.toJsDate(luxon.date(input, timezone)).toISOString()).toBe('2024-06-01T10:00:00.000Z');
      }
    });
  });

  it.each(['America/Sao_Paulo', 'Asia/Jerusalem', 'Asia/Tokyo'])('preserves date-only and local datetime face values under host %s', (host) => {
    withSystemTimezone(host, () => {
      const dates = new TemporalAdapterDateFns();
      const luxon = new TemporalAdapterLuxon();
      for (const timezone of ['system', 'default', 'UTC', 'America/New_York']) {
        const d = dates.date('2026-04-06', timezone);
        const l = luxon.date('2026-04-06', timezone);
        expect(dates.formatByString(d, 'yyyy-MM-dd HH:mm')).toBe('2026-04-06 00:00');
        expect(luxon.formatByString(l, 'yyyy-MM-dd HH:mm')).toBe('2026-04-06 00:00');
        const dt = dates.date('2026-04-06T14:30:00', timezone);
        const lt = luxon.date('2026-04-06T14:30:00', timezone);
        expect(dates.formatByString(dt, 'yyyy-MM-dd HH:mm')).toBe('2026-04-06 14:30');
        expect(luxon.formatByString(lt, 'yyyy-MM-dd HH:mm')).toBe('2026-04-06 14:30');
        expect(dates.formatByString(dates.parse('2026-04-06 14:30', 'yyyy-MM-dd HH:mm', timezone), 'yyyy-MM-dd HH:mm')).toBe('2026-04-06 14:30');
        expect(luxon.formatByString(luxon.parse('2026-04-06 14:30', 'yyyy-MM-dd HH:mm', timezone), 'yyyy-MM-dd HH:mm')).toBe('2026-04-06 14:30');
      }
    });
  });

  it('restores each nested timezone override, including a failed assertion path', () => {
    const original = process.env.TZ;
    const sentinel = new Error('simulated failed assertion');
    withSystemTimezone('Asia/Jerusalem', () => {
      expect(() => withSystemTimezone('America/Sao_Paulo', () => { throw sentinel; })).toThrow(sentinel);
      expect(process.env.TZ).toBe('Asia/Jerusalem');
      expect(new Date('2024-06-01T10:00:00Z').getHours()).toBe(13);
    });
    expect(process.env.TZ).toBe(original);
  });

  it('restores an absent TZ instead of assigning the string undefined', () => {
    const original = process.env.TZ;
    withSystemTimezone(undefined, () => {
      expect(Object.hasOwn(process.env, 'TZ')).toBe(false);
      withSystemTimezone('Asia/Tokyo', () => {
        expect(new Date('2024-06-01T10:00:00Z').getHours()).toBe(19);
      });
      expect(Object.hasOwn(process.env, 'TZ')).toBe(false);
    });
    expect(process.env.TZ).toBe(original);
  });

  it('honors a configured Luxon default zone independently of the system zone', () => {
    const original = Settings.defaultZone;
    onTestFinished(() => { Settings.defaultZone = original; });
    withSystemTimezone('Asia/Jerusalem', () => {
      Settings.defaultZone = 'Pacific/Kiritimati';
      const adapter = new TemporalAdapterLuxon();
      const input = '2024-06-01T10:00:00Z';
      const defaultDate = adapter.date(input, 'default');
      const systemDate = adapter.date(input, 'system');
      expect(adapter.getTimezone(defaultDate)).toBe('Pacific/Kiritimati');
      expect(adapter.formatByString(defaultDate, 'yyyy-MM-dd HH:mm')).toBe('2024-06-02 00:00');
      expect(adapter.getTimezone(systemDate)).toBe('system');
      expect(adapter.formatByString(systemDate, 'yyyy-MM-dd HH:mm')).toBe('2024-06-01 13:00');
      expect(adapter.toJsDate(defaultDate).getTime()).toBe(adapter.toJsDate(systemDate).getTime());
    });
  });
});
