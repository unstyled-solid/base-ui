// https://github.com/mui/mui-x/blob/master/packages/x-internals/src/fastObjectShallowCompare/fastObjectShallowCompare.ts
const is = Object.is;
export function fastObjectShallowCompare<T extends Record<string, any> | null>(a: T, b: T) {
  if (a === b) return true;
  // Cross-realm and null-prototype records must not depend on the global Object constructor.
  if (a === null || b === null || (typeof a !== 'object' && typeof a !== 'function') || (typeof b !== 'object' && typeof b !== 'function')) return false;
  let aLength = 0;
  let bLength = 0;
  for (const key in a) {
    aLength += 1;
    if (!is(a[key], b[key]) || !(key in b)) return false;
  }
  for (const _ in b) bLength += 1;
  return aLength === bLength;
}
