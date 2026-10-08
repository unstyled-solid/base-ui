import { it, expect } from 'vitest';
import { rendezvous } from './pool-fixture';

// A module-level mutation must never affect another fork's imported Date/Intl.
process.env.TZ = 'Asia/Tokyo';
it('first fork holds a source-local timezone while its peer runs', async () => {
  expect(new Date('2018-10-30T11:44:25.750Z').getHours()).toBe(20);
  await rendezvous('a');
});
