/** Lookup in which each date library registers its supported date object type.
 * @example
 * declare module 'baseui-solid2/internals/temporal' {
 *   interface TemporalSupportedObjectLookup { 'date-fns': Date }
 * }
 */
export interface TemporalSupportedObjectLookup {}

/** Valid date objects; the unaugmented fallback deliberately matches upstream. */
export type TemporalSupportedObject = keyof TemporalSupportedObjectLookup extends never
  ? any
  : TemporalSupportedObjectLookup[keyof TemporalSupportedObjectLookup];

export type TemporalTimezone = 'default' | 'system' | 'UTC' | string;
export type TemporalValue = TemporalSupportedObject | null;
export type TemporalRangeValue = [TemporalValue, TemporalValue];
export type TemporalSupportedValue = TemporalValue | TemporalRangeValue;
export type TemporalNonNullableRangeValue = [TemporalSupportedObject, TemporalSupportedObject];
export type TemporalNonNullableValue<TValue extends TemporalSupportedValue> =
  TValue extends TemporalRangeValue
    ? TValue extends TemporalValue
      ? TemporalSupportedObject | TemporalNonNullableRangeValue
      : TemporalNonNullableRangeValue
    : TemporalSupportedObject;
