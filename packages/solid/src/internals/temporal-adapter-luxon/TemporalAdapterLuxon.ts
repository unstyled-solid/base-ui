// Adapted from Base UI 19511bb171f3b360b006c94cf6d07e53cb446505.
// Copyright (c) 2019 Material-UI SAS. MIT license: ../temporal/LICENSE.
import { DateTime, Info } from 'luxon';
import type { TemporalAdapterFormats, DateBuilderReturnType, TemporalTimezone, TemporalAdapter } from '../temporal';

// Upstream exposes fullMonthAndYear at runtime, but omits it from its shared formats interface.
const FORMATS: TemporalAdapterFormats & { fullMonthAndYear: string } = {
  yearPadded: 'yyyy', monthPadded: 'MM', dayOfMonthPadded: 'dd',
  hours24hPadded: 'HH', hours12hPadded: 'hh', minutesPadded: 'mm', secondsPadded: 'ss',
  dayOfMonth: 'd', hours24h: 'H', hours12h: 'h',
  month3Letters: 'MMM', monthFullLetter: 'MMMM', monthFullLetterStandalone: 'LLLL',
  weekday: 'cccc', weekday3Letters: 'ccc', weekday1Letter: 'ccccc', meridiem: 'a',
  localizedDateWithFullMonthAndWeekDay: 'DDDD', localizedNumericDate: 'D', fullMonthAndYear: 'MMMM yyyy',
};

declare module 'baseui-solid2/internals/temporal' {
  interface TemporalSupportedObjectLookup { luxon: DateTime }
}

export class TemporalAdapterLuxon implements TemporalAdapter<DateTime> {
  public isTimezoneCompatible = true;
  public lib = 'luxon';
  declare private locale: string;
  public formats = FORMATS;
  public escapedCharacters = { start: "'", end: "'" };

  constructor({ locale }: TemporalAdapterLuxon.ConstructorParameters = {}) {
    this.locale = locale ?? 'en-US';
  }
  private setLocaleToValue = (value: DateTime) => {
    const expectedLocale = this.getCurrentLocaleCode();
    if (expectedLocale === value.locale) return value;
    return value.setLocale(expectedLocale);
  };
  public now = (timezone: TemporalTimezone) => {
    // fromJSDate accepts locale at runtime; @types/luxon narrows its options to ZoneOptions.
    const options = { locale: this.locale, zone: timezone };
    return DateTime.fromJSDate(new Date(), options);
  };
  public date = <T extends string | null>(value: T, timezone: TemporalTimezone): DateBuilderReturnType<T, DateTime> => {
    // TypeScript cannot narrow a generic conditional return using value === null.
    type R = DateBuilderReturnType<T, DateTime>;
    if (value === null) return null as R;
    return DateTime.fromISO(value, { locale: this.locale, zone: timezone }) as R;
  };
  public parse = (value: string, format: string, timezone: TemporalTimezone): DateTime =>
    DateTime.fromFormat(value, format, { locale: this.locale, zone: timezone });
  public getTimezone = (value: DateTime): string => {
    if (value.zone.type === 'system') return 'system';
    return value.zoneName!;
  };
  public setTimezone = (value: DateTime, timezone: TemporalTimezone): DateTime => {
    if (!value.zone.equals(Info.normalizeZone(timezone))) return value.setZone(timezone);
    return value;
  };
  public toJsDate = (value: DateTime) => value.toJSDate();
  public getCurrentLocaleCode = () => this.locale;
  public isValid = (value: DateTime | null): value is DateTime => {
    if (value == null) return false;
    return value.isValid;
  };
  public format = (value: DateTime, formatKey: keyof TemporalAdapterFormats) => this.formatByString(value, this.formats[formatKey]);
  public formatByString = (value: DateTime, format: string) => value.setLocale(this.locale).toFormat(format);
  public isEqual = (value: DateTime | null, comparing: DateTime | null) => {
    if (value === null && comparing === null) return true;
    if (value === null || comparing === null) return false;
    return +value === +comparing;
  };
  public isSameYear = (value: DateTime, comparing: DateTime) => {
    const comparingInValueTimezone = this.setTimezone(comparing, this.getTimezone(value));
    return value.hasSame(comparingInValueTimezone, 'year');
  };
  public isSameMonth = (value: DateTime, comparing: DateTime) => {
    const comparingInValueTimezone = this.setTimezone(comparing, this.getTimezone(value));
    return value.hasSame(comparingInValueTimezone, 'month');
  };
  public isSameDay = (value: DateTime, comparing: DateTime) => {
    const comparingInValueTimezone = this.setTimezone(comparing, this.getTimezone(value));
    return value.hasSame(comparingInValueTimezone, 'day');
  };
  public isSameHour = (value: DateTime, comparing: DateTime) => {
    const comparingInValueTimezone = this.setTimezone(comparing, this.getTimezone(value));
    return value.hasSame(comparingInValueTimezone, 'hour');
  };
  public isAfter = (value: DateTime, comparing: DateTime) => value > comparing;
  public isBefore = (value: DateTime, comparing: DateTime) => value < comparing;
  public isWithinRange = (value: DateTime, [start, end]: [DateTime, DateTime]) => {
    if (this.isAfter(value, start) && this.isBefore(value, end)) return true;
    return this.isEqual(value, start) || this.isEqual(value, end);
  };
  public startOfYear = (value: DateTime) => value.startOf('year');
  public startOfMonth = (value: DateTime) => value.startOf('month');
  public startOfWeek = (value: DateTime) => this.setLocaleToValue(value).startOf('week', { useLocaleWeeks: true });
  public startOfDay = (value: DateTime) => value.startOf('day');
  public startOfHour = (value: DateTime) => value.startOf('hour');
  public startOfMinute = (value: DateTime) => value.startOf('minute');
  public startOfSecond = (value: DateTime) => value.startOf('second');
  public endOfYear = (value: DateTime) => value.endOf('year');
  public endOfMonth = (value: DateTime) => value.endOf('month');
  public endOfWeek = (value: DateTime) => this.setLocaleToValue(value).endOf('week', { useLocaleWeeks: true });
  public endOfDay = (value: DateTime) => value.endOf('day');
  public endOfHour = (value: DateTime) => value.endOf('hour');
  public endOfMinute = (value: DateTime) => value.endOf('minute');
  public endOfSecond = (value: DateTime) => value.endOf('second');
  public addYears = (value: DateTime, amount: number) => value.plus({ years: amount });
  public addMonths = (value: DateTime, amount: number) => value.plus({ months: amount });
  public addWeeks = (value: DateTime, amount: number) => value.plus({ weeks: amount });
  public addDays = (value: DateTime, amount: number) => value.plus({ days: amount });
  public addHours = (value: DateTime, amount: number) => value.plus({ hours: amount });
  public addMinutes = (value: DateTime, amount: number) => value.plus({ minutes: amount });
  public addSeconds = (value: DateTime, amount: number) => value.plus({ seconds: amount });
  public addMilliseconds = (value: DateTime, amount: number) => value.plus({ milliseconds: amount });
  public getYear = (value: DateTime) => value.get('year');
  public getMonth = (value: DateTime) => value.get('month') - 1;
  public getDate = (value: DateTime) => value.get('day');
  public getHours = (value: DateTime) => value.get('hour');
  public getMinutes = (value: DateTime) => value.get('minute');
  public getSeconds = (value: DateTime) => value.get('second');
  public getMilliseconds = (value: DateTime) => value.get('millisecond');
  public getTime = (value: DateTime): number => value.toMillis();
  public setYear = (value: DateTime, year: number) => value.set({ year });
  public setMonth = (value: DateTime, month: number) => value.set({ month: month + 1 });
  public setDate = (value: DateTime, date: number) => value.set({ day: date });
  public setHours = (value: DateTime, hours: number) => value.set({ hour: hours });
  public setMinutes = (value: DateTime, minutes: number) => value.set({ minute: minutes });
  public setSeconds = (value: DateTime, seconds: number) => value.set({ second: seconds });
  public setMilliseconds = (value: DateTime, milliseconds: number) => value.set({ millisecond: milliseconds });
  public differenceInYears = (value: DateTime, comparing: DateTime): number => Math.floor(value.diff(comparing, 'years').as('years'));
  public differenceInMonths = (value: DateTime, comparing: DateTime): number => Math.floor(value.diff(comparing, 'months').as('months'));
  public differenceInWeeks = (value: DateTime, comparing: DateTime): number => Math.floor(value.diff(comparing, 'weeks').as('weeks'));
  public differenceInDays = (value: DateTime, comparing: DateTime): number => Math.floor(value.diff(comparing, 'days').as('days'));
  public differenceInHours = (value: DateTime, comparing: DateTime): number => Math.floor(value.diff(comparing, 'hours').as('hours'));
  public differenceInMinutes = (value: DateTime, comparing: DateTime): number => Math.floor(value.diff(comparing, 'minutes').as('minutes'));
  public getDaysInMonth = (value: DateTime) => value.daysInMonth!;
  public getWeekNumber = (value: DateTime) => value.localWeekNumber ?? value.weekNumber;
  public getDayOfWeek = (value: DateTime) => value.localWeekday ?? value.weekday;
  public isWeekend = (value: DateTime) => this.setLocaleToValue(value).isWeekend ?? [6, 7].includes(value.weekday);
}

export namespace TemporalAdapterLuxon {
  export interface ConstructorParameters {
    /** Locale for formatting and parsing. @default 'en-US' */
    locale?: string | undefined;
  }
}
