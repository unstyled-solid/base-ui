import { describe, expect, it } from 'vitest';
import { computeActivationDirection } from './activationDirection';
import type { TabMap } from './TabsRootContext';
describe('Tabs activation direction algorithm', () => {
  function tab(left: number, top: number) {
    const element = document.createElement('button');
    element.getBoundingClientRect = () => ({ left, top }) as DOMRect;
    return element;
  }
  it('uses physical positions, including reversed DOM/value order', () => {
    const map: TabMap = new Map([
      [tab(80, 60), { value: 'a', index: 0, id: 'a', disabled: false }],
      [tab(20, 10), { value: 'z', index: 1, id: 'z', disabled: false }],
    ]);
    expect(computeActivationDirection('a', 'z', 'horizontal', map)).toBe('left');
    expect(computeActivationDirection('a', 'z', 'vertical', map)).toBe('up');
    expect(computeActivationDirection('z', 'a', 'vertical', map)).toBe('down');
  });
  it('falls back to comparable values only when one of the tabs has registered', () => {
    const map: TabMap = new Map([[tab(0, 0), { value: 1, index: 0, id: 'one', disabled: false }]]);
    expect(computeActivationDirection(1, 2, 'horizontal', map)).toBe('right');
    expect(computeActivationDirection(1, 0, 'vertical', map)).toBe('up');
    expect(computeActivationDirection(2, 3, 'horizontal', map)).toBe('none');
    expect(computeActivationDirection(1, 'two', 'horizontal', map)).toBe('none');
    expect(computeActivationDirection(null, 1, 'horizontal', map)).toBe('none');
  });
});
