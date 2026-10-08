import { afterEach, describe, expect, it, vi } from 'vitest';
import { script } from './prehydrationScript';

// Execute the actual server body against deterministic DOM metrics. Browser
// layout/reveal assertions remain in TabsIndicator.test.tsx for qualification.
describe('Tabs prehydration ownership', () => {
  let host: HTMLElement | undefined;
  afterEach(() => {
    if (vi.isFakeTimers()) vi.advanceTimersByTime(10000);
    host?.remove();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });
  function markup(width = 80, height = 32, transform: Partial<Pick<CSSStyleDeclaration, 'transform' | 'translate' | 'rotate' | 'scale'>> = {}) {
    vi.useFakeTimers();
    host = document.createElement('div');
    host.innerHTML = '<div role="tablist"><div><button data-active></button></div><span hidden></span><script></script></div>';
    document.body.appendChild(host);
    const list = host.firstElementChild as HTMLElement;
    const scroller = list.firstElementChild as HTMLElement;
    const tab = scroller.firstElementChild as HTMLElement;
    const indicator = list.querySelector('span')!;
    const scriptNode = list.querySelector('script')!;
    Object.assign(tab.style, transform);
    const size = { width, height };
    for (const [key, value] of Object.entries({ offsetLeft: 0, offsetTop: 0, clientLeft: 6, clientTop: 2, scrollWidth: 150, scrollHeight: 34 })) {
      Object.defineProperty(list, key, { value });
    }
    for (const [key, value] of Object.entries({ offsetParent: list, offsetLeft: 160, offsetTop: 4 })) {
      Object.defineProperty(tab, key, { value });
    }
    Object.defineProperty(tab, 'offsetWidth', { get: () => size.width });
    Object.defineProperty(tab, 'offsetHeight', { get: () => size.height });
    scroller.scrollLeft = 40;
    const computed = window.getComputedStyle.bind(window);
    vi.spyOn(window, 'getComputedStyle').mockImplementation((element) => new Proxy(computed(element), {
      get(target, key) {
        // jsdom does not supply browser initial values for transform longhands.
        if (['transform', 'translate', 'rotate', 'scale'].includes(String(key))) return Reflect.get(target, key, target) || 'none';
        return Reflect.get(target, key, target);
      },
    }));
    let deliver: (() => void) | undefined;
    const disconnect = vi.fn();
    const observe = vi.fn();
    vi.stubGlobal('ResizeObserver', class {
      constructor(callback: () => void) { deliver = callback; }
      observe = observe;
      disconnect = disconnect;
    });
    vi.spyOn(document, 'currentScript', 'get').mockReturnValue(scriptNode);
    new Function(script)();
    return { tab, indicator, list, size, observe, disconnect, deliver: () => deliver?.() };
  }
  it('uses transform-immune offsets, intermediate scroll, borders and edge clamping', () => {
    const { indicator, observe } = markup();
    expect(indicator).not.toHaveAttribute('hidden');
    expect(indicator.style.getPropertyValue('--active-tab-left')).toBe('70px');
    expect(indicator.style.getPropertyValue('--active-tab-right')).toBe('0px');
    expect(indicator.style.getPropertyValue('--active-tab-top')).toBe('2px');
    expect(indicator.style.getPropertyValue('--active-tab-bottom')).toBe('0px');
    expect(indicator.style.getPropertyValue('--active-tab-width')).toBe('80px');
    expect(indicator.style.getPropertyValue('--active-tab-height')).toBe('32px');
    expect(observe).not.toHaveBeenCalled();
  });
  it('keeps observing until both dimensions are measurable, then releases the timer and observer', () => {
    const { size, tab, indicator, observe, disconnect, deliver } = markup(80, 0);
    expect(observe).toHaveBeenCalledWith(tab);
    deliver();
    expect(indicator).toHaveAttribute('hidden');
    expect(disconnect).not.toHaveBeenCalled();
    size.height = 32;
    deliver();
    expect(indicator).not.toHaveAttribute('hidden');
    expect(disconnect).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });
  it.each(['selection', 'hydration', 'removal'] as const)('yields ownership after %s before a resize', (mode) => {
    const { size, tab, indicator, disconnect, deliver } = markup(0, 0);
    if (mode === 'selection') tab.removeAttribute('data-active');
    if (mode === 'hydration') indicator.hidden = false;
    if (mode === 'removal') host!.remove();
    indicator.style.setProperty('--active-tab-width', '55px');
    size.width = 80; size.height = 32;
    deliver();
    expect(indicator.style.getPropertyValue('--active-tab-width')).toBe('55px');
    expect(disconnect).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });
  it('bounds observer lifetime when a zero-sized subtree never reveals', () => {
    const { disconnect } = markup(0, 0);
    vi.advanceTimersByTime(9999);
    expect(disconnect).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(disconnect).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });
  it.each([{ transform: 'translateX(12px)' }, { translate: '12px' }, { rotate: '40deg' }, { scale: '1.5' }])(
    'defers painting a transformed active tab %j until hydration', (transform) => {
      const { indicator, observe } = markup(80, 32, transform);
      expect(indicator).toHaveAttribute('hidden');
      expect(indicator.style.getPropertyValue('--active-tab-width')).toBe('');
      expect(observe).not.toHaveBeenCalled();
      expect(vi.getTimerCount()).toBe(0);
    },
  );
});
