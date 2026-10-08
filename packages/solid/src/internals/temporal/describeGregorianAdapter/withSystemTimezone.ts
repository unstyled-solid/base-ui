/** A synchronous, test-local TZ override. Capture at invocation, not collection,
 * and restore even when an assertion throws. Nested overrides restore their caller.
 */
export function withSystemTimezone<T>(timezone: string | undefined, run: () => T): T {
  const original = process.env.TZ;
  try {
    if (timezone === undefined) delete process.env.TZ;
    else process.env.TZ = timezone;
    return run();
  } finally {
    if (original === undefined) delete process.env.TZ;
    else process.env.TZ = original;
  }
}
