import { afterEach, describe, expect, it, vi } from 'vitest';
import type { JSX } from '@solidjs/web';
import { createRenderer, flushMicrotasks } from '../../../test';
import { Tabs } from '../index';

// Drive actual family registrations, the list observer and indicator DOM.
// Geometry is deterministic here; retained browser cases qualify real layout.
describe('Tabs indicator DOM measurement', () => {
  const { renderProps } = createRenderer();
  afterEach(() => vi.unstubAllGlobals());
  it('updates all six variables on selection/resize and observes the replacement tab host', async () => {
    const observers: ControlledResize[] = [];
    class ControlledResize implements ResizeObserver {
      readonly elements = new Set<Element>();
      constructor(readonly callback: ResizeObserverCallback) { observers.push(this); }
      observe(element: Element) { this.elements.add(element); }
      unobserve(element: Element) { this.elements.delete(element); }
      disconnect() { this.elements.clear(); }
      deliver() { this.callback([], this); }
    }
    vi.stubGlobal('ResizeObserver', ControlledResize);
    let firstWidth = 80;
    const metrics = (element: HTMLElement, list: boolean, first = false) => {
      const width = (): number => list ? 300 : first ? firstWidth : 80;
      const left = (): number => list || first ? 0 : firstWidth;
      element.style.width = `${width()}px`; element.style.height = '32px';
      const sizes: Record<string, () => number> = {
        offsetWidth: width, offsetHeight: () => 32, offsetLeft: left, offsetTop: () => 0,
        scrollWidth: () => 300, scrollHeight: () => 32,
      };
      for (const [key, getter] of Object.entries(sizes)) Object.defineProperty(element, key, { configurable: true, get: getter });
      element.getBoundingClientRect = () => new DOMRect(left(), 0, width(), 32);
    };
    const listRef = (node: HTMLElement | null) => { if (node) metrics(node, true); };
    const firstRef = (node: HTMLElement | null) => { if (node) metrics(node, false, true); };
    const secondRef = (node: HTMLElement | null) => { if (node) metrics(node, false); };
    const anchor: Tabs.Tab.Props['render'] = (props) => <a {...props as JSX.HTMLAttributes<HTMLAnchorElement>} href="#zero" />;
    const view = await renderProps((p: { value: number; anchor: boolean }) => <Tabs.Root value={p.value}>
      <Tabs.List ref={listRef}>
        <Tabs.Tab value={0} ref={firstRef} nativeButton={!p.anchor} render={p.anchor ? anchor : undefined}>Zero</Tabs.Tab>
        <Tabs.Tab value={1} ref={secondRef}>One</Tabs.Tab>
        <Tabs.Indicator data-testid="indicator-1" /><Tabs.Indicator data-testid="indicator-2" />
      </Tabs.List></Tabs.Root>, { value: 0, anchor: false });
    const old = view.getByRole('tab', { name: 'Zero' });
    for (const name of ['indicator-1', 'indicator-2']) {
      const indicator = view.getByTestId(name);
      expect(indicator).not.toHaveAttribute('hidden');
      expect(['left', 'right', 'top', 'bottom', 'width', 'height'].map((key) => indicator.style.getPropertyValue(`--active-tab-${key}`)))
        .toEqual(['0px', '220px', '0px', '0px', '80px', '32px']);
    }
    await view.setProps({ value: 1, anchor: true });
    const replacement = view.getByRole('tab', { name: 'Zero' });
    expect(replacement.tagName).toBe('A');
    expect(replacement).not.toBe(old);
    const observer = observers.at(-1)!;
    expect(observer.elements.has(old)).toBe(false);
    expect(observer.elements.has(replacement)).toBe(true);
    firstWidth = 140; replacement.style.width = '140px';
    observer.deliver();
    await flushMicrotasks();
    for (const name of ['indicator-1', 'indicator-2']) {
      expect(view.getByTestId(name).style.getPropertyValue('--active-tab-left')).toBe('140px');
      expect(view.getByTestId(name).style.getPropertyValue('--active-tab-right')).toBe('80px');
    }
    view.unmount();
    expect(observer.elements.size).toBe(0);
  });
});
