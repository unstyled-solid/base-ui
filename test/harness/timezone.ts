import { beforeEach, onTestFinished } from 'vitest';

/** Permit source-local TZ scenarios, then restore even if assertions/disposal throw. */
export function installTimezoneRestoration() {
  // Browser Date/Intl use the Playwright context's UTC timezone, not Node env.
  if (typeof process === 'undefined') return;
  beforeEach(() => {
    const timezone = process.env.TZ;
    onTestFinished(() => {
      if (timezone === undefined) delete process.env.TZ;
      else process.env.TZ = timezone;
    });
  });
}
