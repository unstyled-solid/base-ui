import { describe, it, expect } from 'vitest';
import { shouldYieldTouchMove, canSwipeFromScrollEdgeOnMove, getBaseSwipeThreshold, type TouchScrollState } from './touchArbitration';

describe('Drawer cross-axis touch arbitration', () => {
  const state = (): TouchScrollState => ({ startX: 0, startY: 0, lastX: 0, lastY: 0, scrollTarget: null, hasCrossAxisGestureTarget: true, allowSwipe: null, preserveNativeCrossAxisScroll: false, drawerAxisAttributed: false });
  it.each([true, false])('waits for slop and permanently assigns the drawer axis (vertical=%s)', vertical => {
    const value = state();
    expect(shouldYieldTouchMove(value, { cancelable: true }, { clientX: 2, clientY: 2 }, vertical)).toBe(true);
    expect(shouldYieldTouchMove(value, { cancelable: true }, { clientX: vertical ? 0 : 6, clientY: vertical ? 6 : 0 }, vertical)).toBe(false);
    expect(shouldYieldTouchMove(value, { cancelable: true }, { clientX: vertical ? 40 : 1, clientY: vertical ? 1 : 40 }, vertical)).toBe(false);
  });
  it.each([true, false])('permanently yields to native cross-axis scrolling (vertical=%s)', vertical => {
    const value = state();
    expect(shouldYieldTouchMove(value, { cancelable: true }, { clientX: vertical ? 10 : 0, clientY: vertical ? 0 : 10 }, vertical)).toBe(true);
    expect(shouldYieldTouchMove(value, { cancelable: true }, { clientX: vertical ? 0 : 40, clientY: vertical ? 40 : 0 }, vertical)).toBe(true);
  });
  it('never claims a gesture already committed by the browser', () => {
    const value = state();
    expect(shouldYieldTouchMove(value, { cancelable: false }, { clientX: 0, clientY: 20 }, true)).toBe(true);
    expect(value.preserveNativeCrossAxisScroll).toBe(true);
  });
  it.each(['up', 'down', 'left', 'right'] as const)('only dismisses from the matching scroll edge: %s', direction => {
    const node = document.createElement('div');
    // This is a pure arbitration input, not a browser layout fixture. Detached
    // native elements clamp scroll positions to zero despite mocked extents.
    Object.defineProperties(node, { scrollTop: { value: 0, writable: true }, scrollLeft: { value: 0, writable: true }, scrollHeight: { value: 400 }, clientHeight: { value: 100 }, scrollWidth: { value: 400 }, clientWidth: { value: 100 }, offsetHeight: { value: 400 }, offsetWidth: { value: 200 } });
    const vertical = direction === 'up' || direction === 'down';
    const axis = vertical ? 'vertical' : 'horizontal';
    const start = direction === 'down' || direction === 'right';
    node.scrollTop = node.scrollLeft = start ? 0 : 300;
    expect(canSwipeFromScrollEdgeOnMove(node, axis, direction, start ? 10 : -10)).toBe(true);
    expect(canSwipeFromScrollEdgeOnMove(node, axis, direction, start ? -10 : 10)).toBe(false);
    node.scrollTop = node.scrollLeft = 150;
    expect(canSwipeFromScrollEdgeOnMove(node, axis, direction, start ? 10 : -10)).toBe(false);
    expect(getBaseSwipeThreshold(node, direction)).toBe(vertical ? 200 : 100);
  });
});
