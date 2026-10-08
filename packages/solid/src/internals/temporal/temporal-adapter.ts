import type { TemporalTimezone, TemporalSupportedObject } from './temporal';

export interface TemporalAdapterFormats {
  /** Four-digit year. */
  yearPadded: string;
  /** Month with leading zeroes. */
  monthPadded: string;
  dayOfMonthPadded: string;
  hours24hPadded: string;
  hours12hPadded: string;
  minutesPadded: string;
  secondsPadded: string;
  /** Numeric formats without leading zeroes. */
  dayOfMonth: string;
  hours24h: string;
  hours12h: string;
  month3Letters: string;
  monthFullLetter: string;
  /** Standalone (nominative) month, rather than the contextual/genitive form. */
  monthFullLetterStandalone: string;
  weekday: string;
  weekday3Letters: string;
  weekday1Letter: string;
  meridiem: string;
  localizedDateWithFullMonthAndWeekDay: string;
  localizedNumericDate: string;
}

/** The non-distributive null conditional is retained from upstream.
 * TObject specializes a concrete adapter without coupling optional libraries.
 */
export type DateBuilderReturnType<T extends string | null, TObject = TemporalSupportedObject> =
  [T] extends [null] ? null : TObject;

/** Operations on a single adapter's object type. The default remains the augmented lookup.
 * Specialize TObject when both adapters are in the same program: an adapter cannot
 * perform arithmetic on the other library's objects.
 */
export interface TemporalAdapter<TObject = TemporalSupportedObject> {
  isTimezoneCompatible: boolean;
  formats: TemporalAdapterFormats;
  lib: string;
  escapedCharacters: { start: string; end: string };
  date<T extends string | null>(value: T, timezone: TemporalTimezone): DateBuilderReturnType<T, TObject>;
  parse(value: string, format: string, timezone: TemporalTimezone): TObject;
  now(timezone: TemporalTimezone): TObject;
  getTimezone(value: TObject | null | [TObject | null, TObject | null]): TemporalTimezone;
  setTimezone(value: TObject, timezone: TemporalTimezone): TObject;
  toJsDate(value: TObject): Date;
  getCurrentLocaleCode(): string;
  isValid(value: TObject | null | [TObject | null, TObject | null]): value is TObject;
  format(value: TObject, formatKey: keyof TemporalAdapterFormats): string;
  formatByString(value: TObject, formatString: string): string;
  isEqual(value: TObject | null | [TObject | null, TObject | null], comparing: TObject | null | [TObject | null, TObject | null]): boolean;
  /** Same-unit comparisons use the timezone of value. */
  isSameYear(value: TObject, comparing: TObject): boolean;
  isSameMonth(value: TObject, comparing: TObject): boolean;
  isSameDay(value: TObject, comparing: TObject): boolean;
  isSameHour(value: TObject, comparing: TObject): boolean;
  isAfter(value: TObject, comparing: TObject): boolean;
  isBefore(value: TObject, comparing: TObject): boolean;
  isWithinRange(value: TObject, range: [TObject, TObject]): boolean;
  startOfYear(value: TObject): TObject;
  startOfMonth(value: TObject): TObject;
  startOfWeek(value: TObject): TObject;
  startOfDay(value: TObject): TObject;
  startOfHour(value: TObject): TObject;
  startOfMinute(value: TObject): TObject;
  startOfSecond(value: TObject): TObject;
  endOfYear(value: TObject): TObject;
  endOfMonth(value: TObject): TObject;
  endOfWeek(value: TObject): TObject;
  endOfDay(value: TObject): TObject;
  endOfHour(value: TObject): TObject;
  endOfMinute(value: TObject): TObject;
  endOfSecond(value: TObject): TObject;
  addYears(value: TObject, amount: number): TObject;
  addMonths(value: TObject, amount: number): TObject;
  addWeeks(value: TObject, amount: number): TObject;
  addDays(value: TObject, amount: number): TObject;
  addHours(value: TObject, amount: number): TObject;
  addMinutes(value: TObject, amount: number): TObject;
  addSeconds(value: TObject, amount: number): TObject;
  addMilliseconds(value: TObject, amount: number): TObject;
  getYear(value: TObject): number;
  /** Zero-based month. */
  getMonth(value: TObject): number;
  getDate(value: TObject): number;
  getHours(value: TObject): number;
  getMinutes(value: TObject): number;
  getSeconds(value: TObject): number;
  getMilliseconds(value: TObject): number;
  getTime(value: TObject): number;
  setYear(value: TObject, year: number): TObject;
  setMonth(value: TObject, month: number): TObject;
  setDate(value: TObject, date: number): TObject;
  setHours(value: TObject, hours: number): TObject;
  setMinutes(value: TObject, minutes: number): TObject;
  setSeconds(value: TObject, seconds: number): TObject;
  setMilliseconds(value: TObject, milliseconds: number): TObject;
  differenceInYears: (value: TObject, comparing: TObject) => number;
  differenceInMonths: (value: TObject, comparing: TObject) => number;
  differenceInWeeks: (value: TObject, comparing: TObject) => number;
  differenceInDays: (value: TObject, comparing: TObject) => number;
  differenceInHours: (value: TObject, comparing: TObject) => number;
  differenceInMinutes: (value: TObject, comparing: TObject) => number;
  getDaysInMonth(value: TObject): number;
  getWeekNumber(value: TObject): number;
  /** One-based locale-relative day of week. */
  getDayOfWeek(value: TObject): number;
  /** Runtime Intl.Locale weekend information, with Saturday/Sunday fallback. */
  isWeekend(value: TObject): boolean;
}
