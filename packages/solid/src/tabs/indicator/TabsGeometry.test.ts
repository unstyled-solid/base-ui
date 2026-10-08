import { describe, expect, it } from 'vitest';
import { measureActiveTab } from './measureActiveTab';

// Arithmetic checks only: actual layout evidence is authored in TabsIndicator.test.tsx.
describe('Tabs indicator geometry arithmetic', () => {
  function fixture(rectLeft: number, rectTop: number, rectWidth = 600, rectHeight = 80) {
    const list = document.createElement('div'); const tab = document.createElement('button');
    list.appendChild(tab); document.body.appendChild(list);
    list.style.cssText = 'width:300px;height:40px'; tab.style.cssText = 'width:80px;height:32px';
    for (const [name, value] of Object.entries({ offsetWidth: 300, offsetHeight: 40, clientLeft: 6, clientTop: 2, scrollLeft: 20, scrollTop: 0, scrollWidth: 400, scrollHeight: 50, offsetLeft: 0, offsetTop: 0 })) Object.defineProperty(list, name, { value });
    for (const [name, value] of Object.entries({ offsetWidth: 80, offsetHeight: 32, offsetLeft: 160, offsetTop: 4, offsetParent: list })) Object.defineProperty(tab, name, { value });
    list.getBoundingClientRect = () => ({ left: 100, top: 50, width: rectWidth, height: rectHeight }) as DOMRect;
    tab.getBoundingClientRect = () => ({ left: rectLeft, top: rectTop, width: 160, height: 64 }) as DOMRect;
    return { list, tab, dispose: () => list.remove() };
  }
  it('uses subpixel rects with scale, scroll and borders when consistent with layout', () => {
    const { list, tab, dispose } = fixture(392.5, 62.5);
    try { expect(measureActiveTab(tab, list)).toEqual({ size: { width: 80, height: 32 }, position: { left: 160.25, top: 4.25, right: 159.75, bottom: 13.75 } }); }
    finally { dispose(); }
  });
  it.each([[20, 180, 600, 80], [100, 50, 0, 0]])('uses layout under distorted or degenerate transforms (%s,%s)', (left, top, width, height) => {
    const { list, tab, dispose } = fixture(left, top, width, height);
    try { expect(measureActiveTab(tab, list).position).toEqual({ left: 160, top: 4, right: 160, bottom: 14 }); }
    finally { dispose(); }
  });
  it('subtracts intermediary scroll without subtracting list scroll twice', () => {
    const { list, tab, dispose } = fixture(20, 180);
    const scroller = document.createElement('div'); list.appendChild(scroller); scroller.appendChild(tab);
    // This is a layout-arithmetic fixture, not a native scrolling surface.
    Object.defineProperty(scroller, 'scrollLeft', { value: 40 });
    try { expect(measureActiveTab(tab, list).position.left).toBe(120); }
    finally { dispose(); }
  });
});
