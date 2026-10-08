import { it, expect } from 'vitest';
import * as temporal from './index';
import { TemporalAdapterDateFns } from '../temporal-adapter-date-fns';
import { TemporalAdapterLuxon } from '../temporal-adapter-luxon';

it('temporal core has no runtime exports and both adapters operate without a DOM', () => {
  expect(typeof document).toBe('undefined');
  expect(Object.keys(temporal)).toEqual([]);
  const dates = new TemporalAdapterDateFns();
  const luxon = new TemporalAdapterLuxon();
  const d = dates.date('2024-10-27T00:00', 'Europe/Paris');
  const l = luxon.date('2024-10-27T00:00', 'Europe/Paris');
  expect(dates.differenceInHours(dates.addDays(d, 1), d)).toBe(25);
  expect(luxon.differenceInHours(luxon.addDays(l, 1), l)).toBe(25);
});
