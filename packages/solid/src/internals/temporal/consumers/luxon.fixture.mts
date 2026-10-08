import { TemporalAdapterLuxon } from 'baseui-solid2/internals/temporal-adapter-luxon';
import type { DateTime } from 'luxon';
import type { DateBuilderReturnType, TemporalAdapter, TemporalNonNullableValue,
  TemporalRangeValue, TemporalSupportedObject, TemporalSupportedObjectLookup, TemporalValue } from 'baseui-solid2/internals/temporal';
type Assert<T extends true> = T;
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
type Registered = Assert<Equal<keyof TemporalSupportedObjectLookup, 'luxon'>>;
type ObjectType = Assert<Equal<TemporalSupportedObject, DateTime>>;
type Nullable = Assert<Equal<TemporalValue, DateTime | null>>;
type NonNullRange = TemporalNonNullableValue<TemporalRangeValue>;
type RangeStart = Assert<Equal<NonNullRange[0], DateTime>>;
type RangeEnd = Assert<Equal<NonNullRange[1], DateTime>>;
type RangeLength = Assert<Equal<NonNullRange['length'], 2>>;
type Single = Assert<Equal<TemporalNonNullableValue<TemporalValue>, DateTime>>;
type Null = Assert<Equal<DateBuilderReturnType<null>, null>>;
type String = Assert<Equal<DateBuilderReturnType<string>, DateTime>>;
type Union = Assert<Equal<DateBuilderReturnType<string | null>, DateTime>>;
const adapter = new TemporalAdapterLuxon();
const contract: TemporalAdapter = adapter;
const date: DateTime = adapter.date('2024-03-31', 'Europe/Paris');
const nothing: null = adapter.date(null, 'UTC');
// @ts-expect-error A Luxon adapter cannot operate on a native Date.
adapter.addDays(new Date(), 1);
// @ts-expect-error Nullable range endpoints are removed.
const invalidRange: TemporalNonNullableValue<TemporalRangeValue> = [date, null];
// @ts-expect-error A scalar is not a non-null range.
const invalidScalar: NonNullRange = date;
// @ts-expect-error Range tuple arity remains exact.
const invalidArity: NonNullRange = [date, date, date];
void [contract, nothing, invalidRange, invalidScalar, invalidArity];
