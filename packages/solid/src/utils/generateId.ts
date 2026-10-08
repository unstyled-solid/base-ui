// Base UI's imperative record-id helper (MIT). Toast record identity is not a
// DOM/hydration ID: all rendered associations continue to use createBaseUiId.
let counter = 0;
export function generateId(prefix: string): string {
  counter++;
  return `${prefix}-${Math.random().toString(36).slice(2, 6)}-${counter}`;
}
