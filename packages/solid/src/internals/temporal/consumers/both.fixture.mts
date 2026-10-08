import { TemporalAdapterDateFns } from 'baseui-solid2/internals/temporal-adapter-date-fns';
import { TemporalAdapterLuxon } from 'baseui-solid2/internals/temporal-adapter-luxon';
import type { DateTime } from 'luxon';
import type { DateBuilderReturnType, TemporalAdapter, TemporalNonNullableValue,
  TemporalRangeValue, TemporalSupportedObject, TemporalSupportedObjectLookup, TemporalValue } from 'baseui-solid2/internals/temporal';
type Assert<T extends true> = T;
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
type Registered = Assert<Equal<keyof TemporalSupportedObjectLookup, 'date-fns' | 'luxon'>>;
type ObjectType = Assert<Equal<TemporalSupportedObject, Date | DateTime>>;
type Nullable = Assert<Equal<TemporalValue, Date | DateTime | null>>;
type NonNullRange = TemporalNonNullableValue<TemporalRangeValue>;
type RangeStart = Assert<Equal<NonNullRange[0], Date | DateTime>>;
type RangeEnd = Assert<Equal<NonNullRange[1], Date | DateTime>>;
type RangeLength = Assert<Equal<NonNullRange['length'], 2>>;
type SingleOrRange = Assert<Equal<TemporalNonNullableValue<TemporalValue | TemporalRangeValue>, Date | DateTime | [Date | DateTime, Date | DateTime]>>;
type Null = Assert<Equal<DateBuilderReturnType<null>, null>>;
type Union = Assert<Equal<DateBuilderReturnType<string | null>, Date | DateTime>>;
const dates = new TemporalAdapterDateFns();
const luxon = new TemporalAdapterLuxon();
const date: Date = dates.date('2024-03-31', 'UTC');
const time: DateTime = luxon.date('2024-03-31', 'UTC');
const d: TemporalAdapter<Date> = dates;
const l: TemporalAdapter<DateTime> = luxon;
const dn: null = dates.date(null, 'UTC');
const ln: null = luxon.date(null, 'UTC');
// @ts-expect-error Concrete adapters remain library-specific after both augmentations.
dates.addDays(time, 1);
// @ts-expect-error Concrete adapters remain library-specific after both augmentations.
luxon.addDays(date, 1);
// @ts-expect-error A union adapter would falsely promise cross-library arithmetic.
const unsafe: TemporalAdapter = dates;
void [d, l, dn, ln, unsafe];
