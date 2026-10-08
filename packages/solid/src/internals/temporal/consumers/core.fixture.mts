import type { DateBuilderReturnType, TemporalNonNullableValue, TemporalRangeValue,
  TemporalSupportedObject, TemporalSupportedObjectLookup } from 'baseui-solid2/internals/temporal';
type Assert<T extends true> = T;
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
type Empty = Assert<Equal<keyof TemporalSupportedObjectLookup, never>>;
type Fallback = Assert<0 extends (1 & TemporalSupportedObject) ? true : false>;
type Null = Assert<Equal<DateBuilderReturnType<null>, null>>;
// With no registered library the upstream any fallback deliberately permits both shapes.
const object: TemporalNonNullableValue<TemporalRangeValue> = {};
const range: TemporalNonNullableValue<TemporalRangeValue> = [null, null];
void [object, range];
