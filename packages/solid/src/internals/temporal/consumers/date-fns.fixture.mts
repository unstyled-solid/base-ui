import { TemporalAdapterDateFns } from 'baseui-solid2/internals/temporal-adapter-date-fns';
import type { DateBuilderReturnType, TemporalAdapter, TemporalNonNullableValue,
  TemporalRangeValue, TemporalSupportedObject, TemporalSupportedObjectLookup, TemporalValue } from 'baseui-solid2/internals/temporal';
type Assert<T extends true> = T;
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
type Registered = Assert<Equal<keyof TemporalSupportedObjectLookup, 'date-fns'>>;
type ObjectType = Assert<Equal<TemporalSupportedObject, Date>>;
type Nullable = Assert<Equal<TemporalValue, Date | null>>;
type Range = Assert<Equal<TemporalNonNullableValue<TemporalRangeValue>, [Date, Date]>>;
type Single = Assert<Equal<TemporalNonNullableValue<TemporalValue>, Date>>;
type Null = Assert<Equal<DateBuilderReturnType<null>, null>>;
type String = Assert<Equal<DateBuilderReturnType<string>, Date>>;
// Upstream's conditional is non-distributive: string | null maps to the object, not object | null.
type Union = Assert<Equal<DateBuilderReturnType<string | null>, Date>>;
const adapter = new TemporalAdapterDateFns();
const contract: TemporalAdapter = adapter;
const date: Date = adapter.date('2024-03-31', 'Europe/Paris');
const nothing: null = adapter.date(null, 'UTC');
// @ts-expect-error Non-null input does not return null.
const wrong: null = adapter.date('2024-03-31', 'UTC');
// @ts-expect-error Nullable range endpoints are removed.
const invalidRange: TemporalNonNullableValue<TemporalRangeValue> = [date, null];
void [contract, nothing, wrong, invalidRange];
