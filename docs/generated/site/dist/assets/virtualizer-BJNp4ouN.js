var e=`// Solid 2 lifecycle adapter for TanStack Virtual Core (MIT), version 3.17.11.
import { createEffect, createMemo, createSignal, onCleanup, untrack } from 'solid-js';
import {
  Virtualizer,
  observeElementRect,
  observeElementOffset,
  elementScroll,
  type VirtualItem,
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
  const [geometry, setGeometry] = createSignal({ size: 0, rows: [] as VirtualItem[] }, {
    equals: (a, b) => a.size === b.size && sameRows(a.rows, b.rows),
  });
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
    onChange: (instance) => setGeometry({ size: instance.getTotalSize(), rows: instance.getVirtualItems() }),
  });
  // This adapter only exposes the start-anchored, single-lane policy. Core's
  // measurement cache already keys on count; read the source directly instead
  // of copying it through setOptions and a signal-writing effect.
  Object.defineProperty(virtualizer.options, 'count', { enumerable: true, get: count });
  const cleanup = virtualizer._didMount();
  onCleanup(cleanup);
  createEffect(element, () => {
    // Attachment takes an imperative snapshot; derived readers below continue
    // to subscribe to count. It must not subscribe the attachment lifecycle.
    untrack(() => virtualizer._willUpdate());
    return cleanup;
  });
  // Shared equality boundaries: count updates are synchronous derivations;
  // scroll/measurement callbacks are external observations, not revisions.
  const totalSize = createMemo(() => { geometry(); return virtualizer.getTotalSize(); });
  const rows = createMemo(() => { geometry(); return virtualizer.getVirtualItems(); }, { equals: sameRows });
  return {
    get options() { return virtualizer.options; },
    measure() { virtualizer.measure(); },
    measureElement: (element: Element | null) => virtualizer.measureElement(element),
    scrollToIndex: (index: number, scrollOptions: { align: 'start' | 'end' }) => virtualizer.scrollToIndex(index, scrollOptions),
    getTotalSize: totalSize,
    getVirtualItems: rows,
  };
}

function sameRows(a: VirtualItem[], b: VirtualItem[]) {
  return a === b || a.length === b.length && a.every((row, i) => {
    const next = b[i];
    return row.key === next.key && row.index === next.index && row.start === next.start &&
      row.end === next.end && row.size === next.size && row.lane === next.lane;
  });
}
`;export{e as default};