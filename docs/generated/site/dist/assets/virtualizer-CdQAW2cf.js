var e=`// Solid 2 lifecycle adapter for TanStack Virtual Core (MIT), version 3.17.11.
import { createEffect, createMemo, createSignal, onCleanup, untrack } from 'solid-js';
import {
  Virtualizer,
  observeElementRect,
  observeElementOffset,
  elementScroll,
} from './vendor/virtual-index.js';

export type DemoVirtualizer = ReturnType<typeof createVirtualizer>;

export function createVirtualizer(options: {
  count: () => number;
  getScrollElement: () => HTMLDivElement | null;
  estimateSize: () => number;
  overscan: number;
  paddingStart: number;
  paddingEnd: number;
  scrollPaddingStart: number;
  scrollPaddingEnd: number;
}) {
  const [revision, setRevision] = createSignal(0);
  const count = createMemo(options.count);
  const element = createMemo(options.getScrollElement);
  const virtualizer = new Virtualizer<HTMLDivElement, Element>({
    ...options,
    // Constructor snapshot; subsequent changes are owned by the split effect.
    count: untrack(count),
    getScrollElement: () => untrack(element),
    observeElementRect,
    observeElementOffset,
    scrollToFn: elementScroll,
    onChange: () => setRevision(value => value + 1),
  });
  onCleanup(virtualizer._didMount());
  createEffect(() => ({ count: count(), element: element() }), ({ count, element }) => {
    virtualizer.setOptions({ ...virtualizer.options, count, getScrollElement: () => element });
    virtualizer._willUpdate();
    setRevision(value => value + 1);
  });
  return {
    get options() { return virtualizer.options; },
    measure() { virtualizer.measure(); },
    measureElement: (element: Element | null) => virtualizer.measureElement(element),
    scrollToIndex: (index: number, scrollOptions: { align: 'start' | 'end' }) => virtualizer.scrollToIndex(index, scrollOptions),
    getTotalSize() { revision(); return virtualizer.getTotalSize(); },
    getVirtualItems() { revision(); return virtualizer.getVirtualItems(); },
  };
}
`;export{e as default};