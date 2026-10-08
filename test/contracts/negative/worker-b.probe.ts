import { it, expect } from 'vitest';
import { rendezvous } from './pool-fixture';

const importedHour = new Date('2018-10-30T11:44:25.750Z').getHours();
it('second fork imports UTC fixtures independently from the mutated peer', async () => {
  expect(importedHour).toBe(11);
  expect(process.env.TZ).toBe('UTC');
  await rendezvous('b');
});
