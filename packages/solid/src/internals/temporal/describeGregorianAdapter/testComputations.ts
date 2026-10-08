import { describe, it, test, expect, onTestFinished } from 'vitest';
import type { TemporalAdapter, TemporalTimezone } from '..';
import type { DescribeGregorianAdapterParameters } from './describeGregorianAdapter.types';
import { TEST_DATE_ISO_STRING, TEST_DATE_LOCALE_STRING, getAdapterWeekendDays, hasIntlWeekInfo, stubIntlWeekInfo } from './describeGregorianAdapter.utils';

function expectSameTimeInMonacoTZ<T>(adapter: TemporalAdapter<T>, value: T) {
  const valueInMonacoTz = adapter.setTimezone(value, 'Europe/Monaco');
  expect(adapter.getHours(value)).toBe(adapter.getHours(valueInMonacoTz));
}

export function testComputations<T>({ adapter, adapterTZ = adapter, adapterFr, setDefaultTimezone,
  createDateInFrenchLocale, createAdapterWithLocale }: DescribeGregorianAdapterParameters<T>) {
  const testDateIso = adapter.date(TEST_DATE_ISO_STRING, 'default');
  const testDateIsoInSystemTz = adapter.date(TEST_DATE_ISO_STRING, 'system');
  const testDateIsoFr = createDateInFrenchLocale(TEST_DATE_ISO_STRING);
  const testDateLastNonDSTDay = adapterTZ.isTimezoneCompatible
    ? adapterTZ.date('2022-03-27', 'Europe/Paris') : adapterTZ.date('2022-03-27', 'default');
  const testDateLocale = adapter.date(TEST_DATE_LOCALE_STRING, 'default');

  describe('Method: date', () => {
    it('should parse ISO strings', () => {
      if (adapter.isTimezoneCompatible) {
        const check = (timezone: TemporalTimezone, expectedTimezones: string = timezone) => {
          [adapterTZ, adapterFr].forEach((instance) => {
            const dateWithZone = instance.date(TEST_DATE_ISO_STRING, timezone);
            expect(instance.getTimezone(dateWithZone)).toBe(expectedTimezones);
            expect(dateWithZone).toEqualDateTime(TEST_DATE_ISO_STRING);
          });
        };
        check('UTC'); check('system'); check('America/New_York'); check('Europe/Paris');
        if (setDefaultTimezone != null) {
          try {
            setDefaultTimezone('America/New_York'); check('default', 'America/New_York');
            setDefaultTimezone('Europe/Paris'); check('default', 'Europe/Paris');
          } finally {
            setDefaultTimezone(undefined);
          }
        }
      } else {
        expect(adapter.date(TEST_DATE_ISO_STRING, 'system')).toEqualDateTime(TEST_DATE_ISO_STRING);
        expect(adapter.date(TEST_DATE_ISO_STRING, 'default')).toEqualDateTime(TEST_DATE_ISO_STRING);
      }
    });
    it('should parse locale strings', () => {
      if (adapter.isTimezoneCompatible) {
        const check = (timezone: TemporalTimezone) => {
          [adapterTZ, adapterFr].forEach((instance) => {
            const dateWithZone = instance.date(TEST_DATE_LOCALE_STRING, timezone);
            expect(instance.getTimezone(dateWithZone)).toBe(timezone);
            expect(instance.format(dateWithZone, 'hours24hPadded')).toBe('00');
          });
        };
        check('UTC'); check('system'); check('America/New_York'); check('Europe/Paris');
      } else {
        expect(adapter.date(TEST_DATE_LOCALE_STRING, 'system')).toEqualDateTime(TEST_DATE_LOCALE_STRING);
      }
    });
    it('should parse null', () => {
      expect(adapter.date(null, 'system')).toBe(null);
      if (adapter.isTimezoneCompatible) {
        expect(adapter.date(null, 'UTC')).toBe(null);
        expect(adapter.date(null, 'America/New_York')).toBe(null);
      }
    });
  });
  describe('Method: date', () => {
    it('should parse custom strings', () => {
      const f = adapter.formats;
      const dateFormat = `${f.yearPadded}${f.monthPadded}${f.dayOfMonthPadded}`;
      const dateTimeSeparator = `${adapter.escapedCharacters.start}T${adapter.escapedCharacters.end}`;
      const timeFormat = `${f.hours24hPadded}${f.minutesPadded}${f.secondsPadded}`;
      const timezoneSuffix = `${adapter.escapedCharacters.start}Z${adapter.escapedCharacters.end}`;
      expect(adapter.parse('20181030T114400Z', `${dateFormat}${dateTimeSeparator}${timeFormat}${timezoneSuffix}`, 'default'))
        .toEqualDateTime('2018-10-30T11:44:00.000Z');
    });
  });
  describe('Method: now', () => {
    test('should support system timezone', () => {
      if (adapter.isTimezoneCompatible) {
        const check = (timezone: TemporalTimezone) => {
          const dateWithZone = adapterTZ.now(timezone);
          expect(adapterTZ.getTimezone(dateWithZone)).toBe(timezone);
          expect(Math.abs(adapterTZ.toJsDate(dateWithZone).getTime() - Date.now())).toBeLessThan(5);
        };
        check('system'); check('UTC'); check('America/New_York');
      } else {
        expect(Math.abs(adapterTZ.toJsDate(adapter.now('system')).getTime() - Date.now())).toBeLessThan(5);
      }
    });
  });
  test.skipIf(!adapter.isTimezoneCompatible)('Method: getTimezone', () => {
    const check = (timezone: string, expectedTimezone = timezone) => {
      expect(adapter.getTimezone(adapter.now(timezone))).toBe(expectedTimezone);
    };
    check('system'); check('Europe/Paris'); check('America/New_York'); check('UTC');
    if (setDefaultTimezone != null) {
      try {
        setDefaultTimezone('America/Chicago'); check('default', 'America/Chicago');
      } finally {
        setDefaultTimezone(undefined);
      }
    }
  });
  test.skipIf(!adapter.isTimezoneCompatible)('should not mix Europe/London and UTC in winter', () => {
    expect(adapter.getTimezone(adapter.date('2023-10-30T11:44:00.000Z', 'Europe/London'))).toBe('Europe/London');
  });
  describe('Method: setTimezone', () => {
    it.skipIf(!adapter.isTimezoneCompatible)('should convert the date to the target timezone without impacting its timestamp', () => {
      const dateWithLocaleTimezone = adapter.date(TEST_DATE_ISO_STRING, 'system');
      const check = (timezone: TemporalTimezone) => {
        const dateInTargetTimezone = adapter.setTimezone(dateWithLocaleTimezone, timezone);
        expect(adapter.getTimezone(dateInTargetTimezone)).toBe(timezone);
        expect(adapter.toJsDate(dateInTargetTimezone).getTime()).toBe(adapter.toJsDate(dateWithLocaleTimezone).getTime());
      };
      check('America/New_York'); check('Europe/Paris'); check('Australia/Sydney'); check('UTC');
    });
    test.skipIf(!adapter.isTimezoneCompatible || setDefaultTimezone == null)('should convert the date to the default timezone', () => {
      try {
        setDefaultTimezone!('America/New_York');
        expect(adapter.getTimezone(adapter.setTimezone(testDateIsoInSystemTz, 'default'))).toBe('America/New_York');
        setDefaultTimezone!('Europe/Paris');
        expect(adapter.getTimezone(adapter.setTimezone(testDateIsoInSystemTz, 'default'))).toBe('Europe/Paris');
      } finally {
        setDefaultTimezone!(undefined);
      }
    });
    test.skipIf(!adapter.isTimezoneCompatible)('should do nothing if the adapter does not support timezones', () => {
      const systemDate = adapter.date(TEST_DATE_ISO_STRING, 'system');
      expect(adapter.setTimezone(systemDate, 'default')).toEqualDateTime(systemDate);
      expect(adapter.setTimezone(systemDate, 'system')).toEqualDateTime(systemDate);
      const defaultDate = adapter.date(TEST_DATE_ISO_STRING, 'default');
      expect(adapter.setTimezone(systemDate, 'default')).toEqualDateTime(defaultDate);
      expect(adapter.setTimezone(systemDate, 'system')).toEqualDateTime(defaultDate);
    });
  });
  it('Method: toJsDate', () => {
    expect(adapter.toJsDate(testDateIso)).toBeInstanceOf(Date);
    expect(adapter.toJsDate(testDateLocale)).toBeInstanceOf(Date);
  });
  it('Method: isValid', () => {
    const invalidDate = adapter.date('2018-42-30T11:60:00.000Z', 'default');
    expect(adapter.isValid(testDateIso)).toBe(true);
    expect(adapter.isValid(testDateLocale)).toBe(true);
    expect(adapter.isValid(invalidDate)).toBe(false);
    expect(adapter.isValid(null)).toBe(false);
  });
  describe('Method: isEqual', () => {
    it('should work in the same timezone', () => {
      expect(adapter.isEqual(adapter.date(null, 'default'), null)).toBe(true);
      expect(adapter.isEqual(testDateIso, adapter.date(TEST_DATE_ISO_STRING, 'default'))).toBe(true);
      expect(adapter.isEqual(null, testDateIso)).toBe(false);
      expect(adapter.isEqual(testDateLocale, adapter.date(TEST_DATE_LOCALE_STRING, 'default'))).toBe(true);
      expect(adapter.isEqual(null, testDateLocale)).toBe(false);
    });
    test.skipIf(!adapter.isTimezoneCompatible)('should work with different timezones', () => {
      expect(adapterTZ.isEqual(adapterTZ.setTimezone(testDateIso, 'Europe/London'), adapterTZ.setTimezone(testDateIso, 'Europe/Paris'))).toBe(true);
    });
  });
  for (const [method, same, different, end] of [
    ['isSameYear', '2018-10-01T00:00:00.000Z', '2019-10-01T00:00:00.000Z', 'endOfYear'],
    ['isSameMonth', '2018-10-01T00:00:00.000Z', '2019-10-01T00:00:00.000Z', 'endOfMonth'],
    ['isSameDay', '2018-10-30T00:00:00.000Z', '2019-10-30T00:00:00.000Z', 'endOfDay'],
  ] as const) {
    describe(`Method: ${method}`, () => {
      it('should work in the same timezone', () => {
        for (const value of [testDateIso, testDateLocale]) {
          expect(adapter[method](value, adapter.date(same, 'default'))).toBe(true);
          expect(adapter[method](value, adapter.date(different, 'default'))).toBe(false);
        }
      });
      test.skipIf(!adapter.isTimezoneCompatible)('should work with different timezones', () => {
        const london = adapterTZ[end](adapterTZ.setTimezone(testDateIso, 'Europe/London'));
        const paris = adapterTZ.setTimezone(london, 'Europe/Paris');
        expect(adapterTZ[method](london, paris)).toBe(true);
        expect(adapterTZ[method](paris, london)).toBe(true);
      });
    });
  }
  describe('Method: isSameHour', () => {
    it('should work in the same timezone', () => {
      expect(adapter.isSameHour(testDateIso, adapter.date('2018-10-30T11:00:00.000Z', 'default'))).toBe(true);
      expect(adapter.isSameHour(testDateIso, adapter.date('2018-10-30T12:00:00.000Z', 'default'))).toBe(false);
    });
    test.skipIf(!adapter.isTimezoneCompatible)('should work with different timezones', () => {
      const london = adapterTZ.setTimezone(testDateIso, 'Europe/London');
      const paris = adapterTZ.setTimezone(london, 'Europe/Paris');
      expect(adapterTZ.isSameHour(london, paris)).toBe(true);
      expect(adapterTZ.isSameHour(paris, london)).toBe(true);
    });
  });
  for (const method of ['isAfter', 'isBefore'] as const) {
    describe(`Method: ${method}`, () => {
      it('should work with the same timezone', () => {
        for (const value of [testDateIso, testDateLocale]) {
          expect(adapter[method](adapter.now('default'), value)).toBe(method === 'isAfter');
          expect(adapter[method](value, adapter.now('default'))).toBe(method === 'isBefore');
        }
      });
      test.skipIf(!adapter.isTimezoneCompatible)('should work with different timezones', () => {
        const london = adapterTZ.endOfDay(adapterTZ.setTimezone(testDateIso, 'Europe/London'));
        const paris = adapterTZ.addMinutes(adapterTZ.endOfDay(adapterTZ.setTimezone(testDateIso, 'Europe/Paris')), 30);
        expect(adapter[method](london, paris)).toBe(method === 'isAfter');
        expect(adapter[method](paris, london)).toBe(method === 'isBefore');
      });
    });
  }
  describe('Method: isWithinRange', () => {
    it('should work on simple examples', () => {
      for (const suffix of ['T00:00:00.000Z', '']) {
        const range: [T, T] = [adapter.date(`2019-09-01${suffix}`, 'default'), adapter.date(`2019-11-01${suffix}`, 'default')];
        expect(adapter.isWithinRange(adapter.date(`2019-10-01${suffix}`, 'default'), range)).toBe(true);
        expect(adapter.isWithinRange(adapter.date(`2019-12-01${suffix}`, 'default'), range)).toBe(false);
      }
    });
    it('should use inclusiveness of range', () => {
      for (const suffix of ['T00:00:00.000Z', '']) {
        const range: [T, T] = [adapter.date(`2019-09-01${suffix}`, 'default'), adapter.date(`2019-12-01${suffix}`, 'default')];
        expect(adapter.isWithinRange(adapter.date(`2019-09-01${suffix}`, 'default'), range)).toBe(true);
        expect(adapter.isWithinRange(adapter.date(`2019-12-01${suffix}`, 'default'), range)).toBe(true);
      }
    });
    it('should be equal with values in different locales', () => {
      expect(adapter.isWithinRange(adapter.date('2022-04-17', 'default'), [adapterFr.date('2022-04-17', 'default'), adapterFr.date('2022-04-19', 'default')])).toBe(true);
    });
  });
  for (const [method, expected, dateOnly] of [
    ['startOfYear', '2018-01-01T00:00:00.000Z', true],
    ['startOfMonth', '2018-10-01T00:00:00.000Z', true],
    ['startOfDay', '2018-10-30T00:00:00.000Z', true],
    ['startOfHour', '2018-10-30T11:00:00.000Z', false],
    ['startOfMinute', '2018-10-30T11:44:00.000Z', false],
    ['startOfSecond', '2018-10-30T11:44:25.000Z', false],
    ['endOfYear', '2018-12-31T23:59:59.999Z', true],
    ['endOfWeek', '2018-11-03T23:59:59.999Z', true],
    ['endOfDay', '2018-10-30T23:59:59.999Z', true],
    ['endOfHour', '2018-10-30T11:59:59.999Z', false],
    ['endOfMinute', '2018-10-30T11:44:59.999Z', false],
    ['endOfSecond', '2018-10-30T11:44:25.999Z', false],
  ] as const) {
    it(`Method: ${method}`, () => {
      expect(adapter[method](testDateIso)).toEqualDateTime(expected);
      if (dateOnly) expect(adapter[method](testDateLocale)).toEqualDateTime(expected);
    });
  }
  describe('Method: startOfWeek', () => {
    it('should handle basic use-cases', () => {
      expect(adapter.startOfWeek(testDateIso)).toEqualDateTime('2018-10-28T00:00:00.000Z');
      expect(adapter.startOfWeek(testDateLocale)).toEqualDateTime('2018-10-28T00:00:00.000Z');
    });
    it('should use the adapter locale when the date has another locale', () => {
      expect(adapter.startOfWeek(testDateIsoFr)).toEqualDateTime('2018-10-28T00:00:00.000Z');
    });
  });
  describe('Method: endOfMonth', () => {
    it('should handle basic use-cases', () => {
      expect(adapter.endOfMonth(testDateIso)).toEqualDateTime('2018-10-31T23:59:59.999Z');
      expect(adapter.endOfMonth(testDateLocale)).toEqualDateTime('2018-10-31T23:59:59.999Z');
    });
    test.skipIf(!adapter.isTimezoneCompatible)('should update the offset when entering DST', () => {
      expectSameTimeInMonacoTZ(adapterTZ, testDateLastNonDSTDay);
      expectSameTimeInMonacoTZ(adapterTZ, adapterTZ.endOfMonth(testDateLastNonDSTDay));
    });
  });
  it('Method: addYears', () => {
    expect(adapter.addYears(testDateIso, 2)).toEqualDateTime('2020-10-30T11:44:25.750Z');
    expect(adapter.addYears(testDateIso, -2)).toEqualDateTime('2016-10-30T11:44:25.750Z');
  });
  for (const [method, positive, negative] of [
    ['addMonths', '2018-12-30T11:44:25.750Z', '2018-08-30T11:44:25.750Z'],
    ['addWeeks', '2018-11-13T11:44:25.750Z', '2018-10-16T11:44:25.750Z'],
    ['addDays', '2018-11-01T11:44:25.750Z', '2018-10-28T11:44:25.750Z'],
  ] as const) {
    // Upstream labels addDays as addWeeks; keep the duplicate source title.
    describe(`Method: ${method === 'addDays' ? 'addWeeks' : method}`, () => {
      it('should handle basic use-cases', () => {
        expect(adapter[method](testDateIso, 2)).toEqualDateTime(positive);
        expect(adapter[method](testDateIso, -2)).toEqualDateTime(negative);
        if (method === 'addMonths') expect(adapter.addMonths(testDateIso, 3)).toEqualDateTime('2019-01-30T11:44:25.750Z');
      });
      test.skipIf(!adapter.isTimezoneCompatible)('should update the offset when entering DST', () => {
        expectSameTimeInMonacoTZ(adapterTZ, testDateLastNonDSTDay);
        expectSameTimeInMonacoTZ(adapterTZ, adapterTZ[method](testDateLastNonDSTDay, 1));
      });
    });
  }
  for (const [method, positive, negative, overflow, overflowDate] of [
    ['addHours', '2018-10-30T13:44:25.750Z', '2018-10-30T09:44:25.750Z', 15, '2018-10-31T02:44:25.750Z'],
    ['addMinutes', '2018-10-30T11:46:25.750Z', '2018-10-30T11:42:25.750Z', 20, '2018-10-30T12:04:25.750Z'],
    ['addSeconds', '2018-10-30T11:44:27.750Z', '2018-10-30T11:44:23.750Z', 70, '2018-10-30T11:45:35.750Z'],
    ['addMilliseconds', '2018-10-30T11:44:25.752Z', '2018-10-30T11:44:25.748Z', 500, '2018-10-30T11:44:26.250Z'],
  ] as const) {
    it(`Method: ${method}`, () => {
      expect(adapter[method](testDateIso, 2)).toEqualDateTime(positive);
      expect(adapter[method](testDateIso, -2)).toEqualDateTime(negative);
      expect(adapter[method](testDateIso, overflow)).toEqualDateTime(overflowDate);
    });
  }
  for (const [method, expected] of [
    ['getYear', 2018], ['getMonth', 9], ['getDate', 30], ['getHours', 11], ['getMinutes', 44],
    ['getSeconds', 25], ['getMilliseconds', 750], ['getTime', 1540899865750],
    ['getDayOfWeek', 3], ['getWeekNumber', 44],
  ] as const) {
    it(`Method: ${method}`, () => { expect(adapter[method](testDateIso)).toBe(expected); });
  }
  for (const [method, amount, expected] of [
    ['setYear', 2011, '2011-10-30T11:44:25.750'], ['setMonth', 4, '2018-05-30T11:44:25.750'],
    ['setDate', 15, '2018-10-15T11:44:25.750'], ['setHours', 0, '2018-10-30T00:44:25.750'],
    ['setMinutes', 12, '2018-10-30T11:12:25.750'], ['setSeconds', 11, '2018-10-30T11:44:11.750'],
    ['setMilliseconds', 11, '2018-10-30T11:44:25.011Z'],
  ] as const) {
    it(`Method: ${method}`, () => { expect(adapter[method](testDateIso, amount)).toEqualDateTime(expected); });
  }
  for (const [method, a, b, first, c, d, second, tzA, tzB, tzExpected] of [
    ['differenceInYears', '2020-04-01', '2018-10-30', 1, '2020-04-01', '2018-04-01', 2, '2020-04-01T12:00', '2018-04-01T12:00', 1],
    ['differenceInMonths', '2019-01-30', '2018-10-30', 3, '2019-01-15', '2018-10-30', 2, '2018-06-30T12:00', '2018-04-30T12:00', 1],
    ['differenceInDays', '2018-11-05', '2018-10-30', 6, '2018-11-05', '2018-11-01', 4, '2018-10-07T12:00', '2018-10-05T12:00', 1],
    ['differenceInHours', '2018-10-31T15:00', '2018-10-30T11:00', 28, '2018-10-31T15:00', '2018-10-31T11:00', 4, '2018-10-30T12:00', '2018-10-30T12:00', -5],
    ['differenceInMinutes', '2018-10-30T12:30', '2018-10-30T11:00', 90, '2018-10-30T11:30', '2018-10-30T11:00', 30, '2018-10-30T12:00', '2018-10-30T12:00', -300],
  ] as const) {
    describe(`Method: ${method}`, () => {
      it('should handle basic use-cases', () => {
        expect(adapter[method](adapter.date(a, 'default'), adapter.date(b, 'default'))).toBe(first);
        expect(adapter[method](adapter.date(c, 'default'), adapter.date(d, 'default'))).toBe(second);
      });
      test.skipIf(!adapter.isTimezoneCompatible)('should work with timezones', () => {
        expect(adapter[method](adapter.date(tzA, 'Europe/Paris'), adapter.date(tzB, 'America/New_York'))).toBe(tzExpected);
      });
      if (method === 'differenceInHours' || method === 'differenceInMinutes') {
        test.skipIf(!adapter.isTimezoneCompatible)('should work accross DST', () => {
          expect(adapter[method](adapter.date('2022-03-28', 'Europe/Paris'), adapter.date('2022-03-27', 'Europe/Paris'))).toBe(method === 'differenceInHours' ? 23 : 23 * 60);
        });
      }
    });
  }
  it('Method: getDaysInMonth', () => {
    expect(adapter.getDaysInMonth(testDateIso)).toBe(31);
    expect(adapter.getDaysInMonth(testDateLocale)).toBe(31);
    expect(adapter.getDaysInMonth(adapter.addMonths(testDateIso, 1))).toBe(30);
  });
  describe('Method: isWeekend', () => {
    it('should handle basic use-cases', () => {
      expect(adapter.isWeekend(testDateIso)).toBe(false);
      expect(adapterFr.isWeekend(testDateIso)).toBe(false);
      expect(adapter.isWeekend(adapter.addDays(testDateIso, 4))).toBe(true);
      expect(adapter.isWeekend(adapter.addDays(testDateIso, 5))).toBe(true);
      expect(adapterFr.isWeekend(adapterFr.addDays(testDateIso, 4))).toBe(true);
      expect(adapterFr.isWeekend(adapterFr.addDays(testDateIso, 5))).toBe(true);
    });
    it.skipIf(!hasIntlWeekInfo)('should use the weekend days of the locale', () => {
      expect(getAdapterWeekendDays(createAdapterWithLocale('en-US'))).toEqual([6, 7]);
      expect(getAdapterWeekendDays(createAdapterWithLocale('he'))).toEqual([5, 6]);
      expect(getAdapterWeekendDays(createAdapterWithLocale('en-IN'))).toEqual([7]);
    });
    it.skipIf(!hasIntlWeekInfo)('should use the adapter locale when the date has another locale', () => {
      const friday = createDateInFrenchLocale('2018-11-02T12:00:00.000Z');
      expect(createAdapterWithLocale('he').isWeekend(friday)).toBe(true);
    });
    it('should use the day in the timezone of the date', () => {
      const friday = adapter.date('2018-11-02T12:00:00.000Z', 'UTC');
      expect(adapter.isWeekend(friday)).toBe(false);
      expect(adapter.isWeekend(adapter.setTimezone(friday, 'Pacific/Kiritimati'))).toBe(true);
    });
    it('should support engines that only expose the week info method', () => {
      onTestFinished(stubIntlWeekInfo('method'));
      expect(getAdapterWeekendDays(createAdapterWithLocale('ar-SA'))).toEqual([2, 3]);
    });
    it('should support engines that only expose the week info accessor', () => {
      onTestFinished(stubIntlWeekInfo('accessor'));
      expect(getAdapterWeekendDays(createAdapterWithLocale('hi'))).toEqual([2, 3]);
    });
    it('should fall back to Saturday and Sunday when the engine has no week info', () => {
      onTestFinished(stubIntlWeekInfo('none'));
      expect(getAdapterWeekendDays(createAdapterWithLocale('ar-EG'))).toEqual([6, 7]);
    });
  });
}
