import { describe, expect, it } from 'vitest';
import { tooltipInstant } from './instant';

describe('Tooltip interrupted instant transitions', () => {
  it('allows a normal exit even while the group remains instant', () => {
    expect(tooltipInstant('starting', true, 'trigger-hover', undefined)).toBe('delay');
    expect(tooltipInstant('ending', true, 'trigger-hover', undefined)).toBeUndefined();
  });
  it('closes siblings instantly, preserving the underlying focus/dismiss policy', () => {
    expect(tooltipInstant('ending', false, 'none', 'focus')).toBe('delay');
    expect(tooltipInstant('ending', true, 'escape-key', 'dismiss')).toBe('dismiss');
  });
  it('does not restore an interrupted temporary value into a later entry', () => {
    expect(tooltipInstant('ending', true, 'none', undefined)).toBe('delay');
    expect(tooltipInstant('starting', false, 'trigger-hover', undefined)).toBeUndefined();
    expect(tooltipInstant('starting', false, 'trigger-focus', 'focus')).toBe('focus');
    expect(tooltipInstant('idle', true, 'trigger-focus', 'focus')).toBe('delay');
    expect(tooltipInstant('idle', false, 'trigger-focus', 'focus')).toBe('focus');
  });
});
