import { describe, it, expect, vi } from 'vitest';
import { createEffect } from 'solid-js';
import { createRenderer } from '../../../test';
import { createVirtualizer } from '../../../../../docs/demos/autocomplete/virtualizer';

describe('ComboboxFilter virtualizer source and observation boundaries', () => {
  const { renderProps } = createRenderer();
  it('derives count without an effect relay and releases replaced observers/listeners', async () => {
    const observers: { callback: ResizeObserverCallback; targets: Set<Element> }[] = [];
    const Original = window.ResizeObserver;
    window.ResizeObserver = class {
      targets = new Set<Element>();
      constructor(public callback: ResizeObserverCallback) { observers.push(this); }
      observe(node: Element) { this.targets.add(node); }
      unobserve(node: Element) { this.targets.delete(node); }
      disconnect() { this.targets.clear(); }
    } as unknown as typeof ResizeObserver;
    const makeElement = () => {
      const element = document.createElement('div');
      Object.defineProperties(element, { offsetHeight: { value: 320 }, offsetWidth: { value: 200 } });
      element.scrollTo = vi.fn();
      document.body.append(element);
      return element;
    };
    const first = makeElement();
    const second = makeElement();
    const remove = vi.spyOn(first, 'removeEventListener');
    const paints: number[] = [];
    try {
      const view = await renderProps((props: { count: number; element: HTMLDivElement }) => {
        const virtualizer = createVirtualizer({ count: () => props.count, getScrollElement: () => props.element,
          estimateSize: () => 32, overscan: 20, paddingStart: 4, paddingEnd: 4, scrollPaddingStart: 4, scrollPaddingEnd: 4 });
        createEffect(() => virtualizer.getTotalSize(), size => { paints.push(size); });
        return <output>{virtualizer.getVirtualItems().length}:{virtualizer.getTotalSize()}</output>;
      }, { count: 10000, element: first });
      expect(paints).toEqual([320008]);
      await view.setProps({ count: 19 });
      expect(paints).toEqual([320008, 616]);
      expect(view.getByText('19:616')).toBeInTheDocument();
      await view.setProps({ element: second });
      expect(observers.every(observer => !observer.targets.has(first))).toBe(true);
      expect(remove.mock.calls.some(([type]) => type === 'scroll')).toBe(true);
      expect(paints).toEqual([320008, 616]);
      view.unmount();
      expect(observers.every(observer => observer.targets.size === 0)).toBe(true);
    } finally {
      window.ResizeObserver = Original;
      first.remove(); second.remove();
    }
  });
});
