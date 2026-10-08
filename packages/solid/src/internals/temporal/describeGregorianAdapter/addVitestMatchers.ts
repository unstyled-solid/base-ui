import { expect } from 'vitest';

declare module 'vitest' {
  interface Matchers<T = any> {
    toEqualDateTime(expected: unknown): void;
  }
  interface AsymmetricMatchersContaining { toEqualDateTime(expected: unknown): void }
}

function cleanDate(value: unknown): Date {
  if (value && typeof value === 'object' && 'toJSDate' in value && typeof value.toJSDate === 'function') {
    return value.toJSDate();
  }
  if (typeof value === 'string') return new Date(value);
  if (value instanceof Date) return value;
  throw new TypeError('Expected a Date, ISO string or object with toJSDate().');
}
function formatDate(value: Date): string {
  return `${value.getFullYear()}-${value.getMonth() + 1}-${value.getDate()}T${value.getHours()}:${value.getMinutes()}:${value.getSeconds()}.${value.getMilliseconds()}`;
}
// Deliberately compares wall-clock components as upstream does, not timestamps.
expect.extend({
  toEqualDateTime(received, expected) {
    const actual = formatDate(cleanDate(received));
    const expectedFormatted = formatDate(cleanDate(expected));
    const pass = actual === expectedFormatted;
    return { pass, message: () => pass
      ? `expected ${actual} not to equal ${expectedFormatted}`
      : `expected ${actual} to equal ${expectedFormatted}` };
  },
});
