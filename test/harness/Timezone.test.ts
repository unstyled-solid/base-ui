import { it, expect } from 'vitest';

it('starts with the pinned upstream UTC Date and Intl baseline', () => {
  expect(Intl.DateTimeFormat().resolvedOptions().timeZone).toBe('UTC');
  expect(new Date('2018-10-30T11:44:25.750Z').getHours()).toBe(11);
});

it.skipIf(typeof process === 'undefined')('permits a Node source-local timezone override', () => {
  process.env.TZ = 'America/Sao_Paulo';
  expect(process.env.TZ).toBe('America/Sao_Paulo');
});

it.skipIf(typeof process === 'undefined')('restores the Node baseline before the next test even without a fixture cleanup', () => {
  expect(process.env.TZ).toBe('UTC');
  expect(new Date('2018-10-30T11:44:25.750Z').getHours()).toBe(11);
});
