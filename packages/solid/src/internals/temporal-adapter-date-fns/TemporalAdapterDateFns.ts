// Adapted from Base UI 19511bb171f3b360b006c94cf6d07e53cb446505.
// Copyright (c) 2019 Material-UI SAS. MIT license: ../temporal/LICENSE.
import { addDays } from 'date-fns/addDays';
import { addHours } from 'date-fns/addHours';
import { addMinutes } from 'date-fns/addMinutes';
import { addMonths } from 'date-fns/addMonths';
import { addSeconds } from 'date-fns/addSeconds';
import { addMilliseconds } from 'date-fns/addMilliseconds';
import { addWeeks } from 'date-fns/addWeeks';
import { addYears } from 'date-fns/addYears';
import { differenceInDays } from 'date-fns/differenceInDays';
import { differenceInHours } from 'date-fns/differenceInHours';
import { differenceInMinutes } from 'date-fns/differenceInMinutes';
import { differenceInMonths } from 'date-fns/differenceInMonths';
import { differenceInWeeks } from 'date-fns/differenceInWeeks';
import { differenceInYears } from 'date-fns/differenceInYears';
import { endOfDay } from 'date-fns/endOfDay';
import { endOfHour } from 'date-fns/endOfHour';
import { endOfMinute } from 'date-fns/endOfMinute';
import { endOfMonth } from 'date-fns/endOfMonth';
import { endOfSecond } from 'date-fns/endOfSecond';
import { endOfWeek } from 'date-fns/endOfWeek';
import { endOfYear } from 'date-fns/endOfYear';
import { format as dateFnsFormat } from 'date-fns/format';
import { getDate } from 'date-fns/getDate';
import { getDay } from 'date-fns/getDay';
import { getISODay } from 'date-fns/getISODay';
import { getDaysInMonth } from 'date-fns/getDaysInMonth';
import { getHours } from 'date-fns/getHours';
import { getMilliseconds } from 'date-fns/getMilliseconds';
import { getMinutes } from 'date-fns/getMinutes';
import { getMonth } from 'date-fns/getMonth';
import { getSeconds } from 'date-fns/getSeconds';
import { getWeek } from 'date-fns/getWeek';
import { getYear } from 'date-fns/getYear';
import { isAfter } from 'date-fns/isAfter';
import { isBefore } from 'date-fns/isBefore';
import { isEqual } from 'date-fns/isEqual';
import { isSameDay } from 'date-fns/isSameDay';
import { isSameHour } from 'date-fns/isSameHour';
import { isSameYear } from 'date-fns/isSameYear';
import { isSameMonth } from 'date-fns/isSameMonth';
import { isValid } from 'date-fns/isValid';
import { isWithinInterval } from 'date-fns/isWithinInterval';
import type { Locale as DateFnsLocale } from 'date-fns/locale';
import { enUS } from 'date-fns/locale/en-US';
import { parse } from 'date-fns/parse';
import { setDate } from 'date-fns/setDate';
import { setHours } from 'date-fns/setHours';
import { setMilliseconds } from 'date-fns/setMilliseconds';
import { setMinutes } from 'date-fns/setMinutes';
import { setMonth } from 'date-fns/setMonth';
import { setSeconds } from 'date-fns/setSeconds';
import { setYear } from 'date-fns/setYear';
import { startOfDay } from 'date-fns/startOfDay';
import { startOfHour } from 'date-fns/startOfHour';
import { startOfMinute } from 'date-fns/startOfMinute';
import { startOfMonth } from 'date-fns/startOfMonth';
import { startOfSecond } from 'date-fns/startOfSecond';
import { startOfYear } from 'date-fns/startOfYear';
import { startOfWeek } from 'date-fns/startOfWeek';
import { TZDate } from '@date-fns/tz';
import type { TemporalAdapterFormats, DateBuilderReturnType, TemporalTimezone, TemporalAdapter } from '../temporal';

const FORMATS: TemporalAdapterFormats = {
  yearPadded: 'yyyy', monthPadded: 'MM', dayOfMonthPadded: 'dd',
  hours24hPadded: 'HH', hours12hPadded: 'hh', minutesPadded: 'mm', secondsPadded: 'ss',
  dayOfMonth: 'd', hours24h: 'H', hours12h: 'h',
  month3Letters: 'MMM', monthFullLetter: 'MMMM', monthFullLetterStandalone: 'LLLL',
  weekday: 'EEEE', weekday3Letters: 'EEE', weekday1Letter: 'EEEEE', meridiem: 'a',
  localizedDateWithFullMonthAndWeekDay: 'PPPP', localizedNumericDate: 'P',
};

// ISO weekday numbers, as used by Intl.Locale (Monday = 1).
const DEFAULT_WEEKEND_DAYS = [6, 7];
const weekendDaysCache = new WeakMap<DateFnsLocale, number[]>();
interface LocaleWithWeekInfo {
  getWeekInfo?: (() => { weekend: number[] }) | undefined;
  weekInfo?: { weekend: number[] } | undefined;
}
function getWeekendDays(locale: DateFnsLocale): number[] {
  const cachedWeekendDays = weekendDaysCache.get(locale);
  if (cachedWeekendDays) return cachedWeekendDays;
  let weekInfo: { weekend: number[] } | undefined;
  try {
    const intlLocale = new Intl.Locale(locale.code) as Intl.Locale & LocaleWithWeekInfo;
    weekInfo = typeof intlLocale.getWeekInfo === 'function' ? intlLocale.getWeekInfo() : intlLocale.weekInfo;
  } catch {
    // Invalid locale code.
  }
  // Do not cache fallback: an Intl polyfill may load after this call.
  if (!weekInfo?.weekend) return DEFAULT_WEEKEND_DAYS;
  weekendDaysCache.set(locale, weekInfo.weekend);
  return weekInfo.weekend;
}

declare module 'baseui-solid2/internals/temporal' {
  interface TemporalSupportedObjectLookup { 'date-fns': Date }
}

export class TemporalAdapterDateFns implements TemporalAdapter<Date> {
  public isTimezoneCompatible = true;
  public lib = 'date-fns';
  declare private locale: DateFnsLocale;
  public formats = FORMATS;
  public escapedCharacters = { start: "'", end: "'" };

  constructor({ locale }: TemporalAdapterDateFns.ConstructorParameters = {}) {
    this.locale = locale ?? enUS;
  }

  public now = (timezone: TemporalTimezone) => {
    if (timezone === 'system' || timezone === 'default') return new Date();
    return TZDate.tz(timezone);
  };

  public date = <T extends string | null>(value: T, timezone: TemporalTimezone): DateBuilderReturnType<T, Date> => {
    type R = DateBuilderReturnType<T, Date>;
    if (value === null) return null as R;
    const date = new Date(value);
    // Date-only input is parsed as UTC by JS; datetime input uses local getters.
    const isDateOnly = typeof value === 'string' && !value.includes('T');
    if (timezone === 'system' || timezone === 'default') {
      if (isDateOnly) return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) as R;
      return date as R;
    }
    // Preserve the face-value components in the requested timezone, not the timestamp.
    return new TZDate(
      isDateOnly ? date.getUTCFullYear() : date.getFullYear(),
      isDateOnly ? date.getUTCMonth() : date.getMonth(),
      isDateOnly ? date.getUTCDate() : date.getDate(),
      isDateOnly ? date.getUTCHours() : date.getHours(),
      isDateOnly ? date.getUTCMinutes() : date.getMinutes(),
      isDateOnly ? date.getUTCSeconds() : date.getSeconds(),
      isDateOnly ? date.getUTCMilliseconds() : date.getMilliseconds(), timezone,
    ) as unknown as R;
  };

  public parse = (value: string, format: string, timezone: TemporalTimezone): Date => {
    const date = parse(value, format, new Date(), { locale: this.locale });
    if (timezone === 'system' || timezone === 'default') return date;
    return new TZDate(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(),
      date.getMinutes(), date.getSeconds(), date.getMilliseconds(), timezone);
  };
  public getTimezone = (value: Date): string => {
    if (value instanceof TZDate) return value.timeZone ?? 'system';
    return 'system';
  };
  public setTimezone = (value: Date, timezone: TemporalTimezone): Date => {
    const isSystemTimezone = timezone === 'system' || timezone === 'default';
    const zoned = value as Date & { withTimeZone?: (timezone: string) => Date };
    const canChangeTz = typeof zoned?.withTimeZone === 'function';
    if (isSystemTimezone) return this.toJsDate(value);
    // Structural check deliberately supports TZDate from a second library copy.
    if (canChangeTz) return zoned.withTimeZone!(timezone);
    return new TZDate(value, timezone);
  };
  public toJsDate = (value: Date) => {
    if (value instanceof TZDate) return new Date(value.getTime());
    return value;
  };
  public getCurrentLocaleCode = () => this.locale.code;
  public isValid = (value: Date | null): value is Date => {
    if (value == null) return false;
    return isValid(value);
  };
  public format = (value: Date, formatKey: keyof TemporalAdapterFormats) => this.formatByString(value, this.formats[formatKey]);
  public formatByString = (value: Date, format: string) => dateFnsFormat(value, format, { locale: this.locale });
  public isEqual = (value: Date | null, comparing: Date | null) => {
    if (value === null && comparing === null) return true;
    if (value === null || comparing === null) return false;
    return isEqual(value, comparing);
  };
  public isSameYear = (value: Date, comparing: Date) => isSameYear(value, comparing);
  public isSameMonth = (value: Date, comparing: Date) => isSameMonth(value, comparing);
  public isSameDay = (value: Date, comparing: Date) => isSameDay(value, comparing);
  public isSameHour = (value: Date, comparing: Date) => isSameHour(value, comparing);
  public isAfter = (value: Date, comparing: Date) => isAfter(value, comparing);
  public isBefore = (value: Date, comparing: Date) => isBefore(value, comparing);
  public isWithinRange = (value: Date, [start, end]: [Date, Date]) => isWithinInterval(value, { start, end });
  public startOfYear = (value: Date) => startOfYear(value);
  public startOfMonth = (value: Date) => startOfMonth(value);
  public startOfWeek = (value: Date) => startOfWeek(value, { locale: this.locale });
  public startOfDay = (value: Date) => startOfDay(value);
  public startOfHour = (value: Date) => startOfHour(value);
  public startOfMinute = (value: Date) => startOfMinute(value);
  public startOfSecond = (value: Date) => startOfSecond(value);
  public endOfYear = (value: Date): Date => endOfYear(value);
  public endOfMonth = (value: Date): Date => endOfMonth(value);
  public endOfWeek = (value: Date): Date => endOfWeek(value, { locale: this.locale });
  public endOfDay = (value: Date): Date => endOfDay(value);
  public endOfHour = (value: Date) => endOfHour(value);
  public endOfMinute = (value: Date) => endOfMinute(value);
  public endOfSecond = (value: Date) => endOfSecond(value);
  public addYears = (value: Date, amount: number): Date => addYears(value, amount);
  public addMonths = (value: Date, amount: number): Date => addMonths(value, amount);
  public addWeeks = (value: Date, amount: number): Date => addWeeks(value, amount);
  public addDays = (value: Date, amount: number): Date => addDays(value, amount);
  public addHours = (value: Date, amount: number): Date => addHours(value, amount);
  public addMinutes = (value: Date, amount: number): Date => addMinutes(value, amount);
  public addSeconds = (value: Date, amount: number): Date => addSeconds(value, amount);
  public addMilliseconds = (value: Date, amount: number) => addMilliseconds(value, amount);
  public getYear = (value: Date): number => getYear(value);
  public getMonth = (value: Date): number => getMonth(value);
  public getDate = (value: Date): number => getDate(value);
  public getHours = (value: Date): number => getHours(value);
  public getMinutes = (value: Date): number => getMinutes(value);
  public getSeconds = (value: Date): number => getSeconds(value);
  public getMilliseconds = (value: Date): number => getMilliseconds(value);
  public getTime = (value: Date): number => value.getTime();
  public setYear = (value: Date, year: number): Date => setYear(value, year);
  public setMonth = (value: Date, month: number): Date => setMonth(value, month);
  public setDate = (value: Date, date: number): Date => setDate(value, date);
  public setHours = (value: Date, hours: number): Date => setHours(value, hours);
  public setMinutes = (value: Date, minutes: number): Date => setMinutes(value, minutes);
  public setSeconds = (value: Date, seconds: number): Date => setSeconds(value, seconds);
  public setMilliseconds = (value: Date, milliseconds: number): Date => setMilliseconds(value, milliseconds);
  public differenceInYears = (value: Date, comparing: Date): number => differenceInYears(value, comparing);
  public differenceInMonths = (value: Date, comparing: Date): number => differenceInMonths(value, comparing);
  public differenceInWeeks = (value: Date, comparing: Date): number => differenceInWeeks(value, comparing);
  public differenceInDays = (value: Date, comparing: Date): number => differenceInDays(value, comparing);
  public differenceInHours = (value: Date, comparing: Date): number => differenceInHours(value, comparing);
  public differenceInMinutes = (value: Date, comparing: Date): number => differenceInMinutes(value, comparing);
  public getDaysInMonth = (value: Date): number => getDaysInMonth(value);
  public getWeekNumber = (value: Date) => getWeek(value, { locale: this.locale });
  public getDayOfWeek = (value: Date) => {
    const weekStartsOn = this.locale.options?.weekStartsOn ?? 0;
    return ((getDay(value) + 7 - weekStartsOn) % 7) + 1;
  };
  public isWeekend = (value: Date) => getWeekendDays(this.locale).includes(getISODay(value));
}

export namespace TemporalAdapterDateFns {
  export interface ConstructorParameters {
    /** Locale for formatting and parsing. @default enUS */
    locale?: DateFnsLocale | undefined;
  }
}
