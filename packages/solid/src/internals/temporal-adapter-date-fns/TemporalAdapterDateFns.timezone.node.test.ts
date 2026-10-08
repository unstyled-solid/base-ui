import { describe, it, expect } from 'vitest';
import { TemporalAdapterDateFns } from './TemporalAdapterDateFns';
import { withSystemTimezone } from '../temporal/describeGregorianAdapter/withSystemTimezone';

// Node host-zone mutation fixtures; regular adapter tests still run in browsers.
describe('date-only string parsing (UTC getters)', () => {
  const adapter = new TemporalAdapterDateFns();
  it('should preserve the date for date-only strings in a negative UTC offset', () => {
    withSystemTimezone('America/Sao_Paulo', () => {
      const result = adapter.date('2026-04-06', 'system');
      expect(result.getFullYear()).toBe(2026);
      expect(result.getMonth()).toBe(3);
      expect(result.getDate()).toBe(6);
    });
  });
  it('should preserve the date for date-only strings in a named timezone', () => {
    withSystemTimezone('America/Sao_Paulo', () => {
      const result = adapter.date('2026-04-06', 'America/Sao_Paulo');
      expect(adapter.getYear(result)).toBe(2026);
      expect(adapter.getMonth(result)).toBe(3);
      expect(adapter.getDate(result)).toBe(6);
      expect(adapter.getHours(result)).toBe(0);
    });
  });
  it('should still use local getters for datetime strings', () => {
    withSystemTimezone('America/Sao_Paulo', () => {
      const result = adapter.date('2026-04-06T14:30:00', 'system');
      expect(result.getHours()).toBe(14);
      expect(result.getMinutes()).toBe(30);
    });
  });
});
