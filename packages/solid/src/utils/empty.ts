export function NOOP() {}
// Mutable typing permits T[] fallbacks; the shared value cannot be mutated.
export const EMPTY_ARRAY: never[] = Object.freeze([]) as never[];
export const EMPTY_OBJECT = Object.freeze({});
