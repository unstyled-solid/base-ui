import { it, expect, vi } from 'vitest';
import { TimeoutManager } from './TimeoutManager';

it('Lifecycle TimeoutManager replaces keys, clears independently, permits safe repeated clear and clears all', () => {
  vi.useFakeTimers();
  const manager = new TimeoutManager(); const first = vi.fn(); const second = vi.fn(); const other = vi.fn();
  manager.start('a', 100, first); manager.start('a', 100, second); manager.start('b', 50, other);
  manager.clear('missing'); manager.clear('b'); manager.clear('b');
  vi.advanceTimersByTime(99); expect(second).not.toHaveBeenCalled();
  vi.advanceTimersByTime(1); expect(second).toHaveBeenCalledOnce(); expect(first).not.toHaveBeenCalled(); expect(other).not.toHaveBeenCalled();
  manager.clear('a'); manager.start('a', 100, first); manager.start('b', 200, other); manager.clearAll();
  expect(vi.getTimerCount()).toBe(0);
  vi.advanceTimersByTime(200);
  expect(first).not.toHaveBeenCalled(); expect(other).not.toHaveBeenCalled();
  vi.useRealTimers();
});
