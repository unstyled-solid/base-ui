var e=`import { createSignal, createMemo, createEffect } from 'solid-js';

/** Solid 2 fixed-row adapter for this demo's 32px rows (no React runtime). */
export interface Virtualizer {
  options: { readonly count: number };
  measure(): void;
  measureElement(element: Element | null): void;
  getTotalSize(): number;
  getVirtualItems(): { key: number; index: number; start: number; size: number }[];
  scrollToIndex(index: number, options: { align: 'start' | 'end' }): void;
}

export function createVirtualizer(options: {
  readonly count: number;
  readonly enabled?: boolean;
  getScrollElement(): HTMLDivElement | null;
  estimateSize(): number;
  overscan: number;
  paddingStart: number;
  paddingEnd: number;
  scrollPaddingStart: number;
  scrollPaddingEnd: number;
}): Virtualizer {
  const [element, setElement] = createSignal<HTMLDivElement | null>(null);
  const [viewport, setViewport] = createSignal({ top: 0, height: 360 });
  function measure() {
    const node = options.getScrollElement();
    setElement(node);
    if (node) setViewport({ top: node.scrollTop, height: node.clientHeight || 360 });
  }
  createEffect(() => ({ node: element(), enabled: options.enabled !== false }), ({ node, enabled }) => {
    if (!node || !enabled) return;
    const update = () => setViewport({ top: node.scrollTop, height: node.clientHeight || 360 });
    node.addEventListener('scroll', update, { passive: true });
    const Observer = node.ownerDocument.defaultView?.ResizeObserver;
    const observer = Observer ? new Observer(update) : undefined;
    observer?.observe(node);
    update();
    return () => { node.removeEventListener('scroll', update); observer?.disconnect(); };
  });
  const rows = createMemo(() => {
    const size = options.estimateSize();
    const start = Math.max(0, Math.floor((viewport().top - options.paddingStart) / size) - options.overscan);
    const end = Math.min(options.count, Math.ceil((viewport().top + viewport().height) / size) + options.overscan);
    return Array.from({ length: Math.max(0, end - start) }, (_, offset) => {
      const index = start + offset;
      return { key: index, index, start: options.paddingStart + index * size, size };
    });
  });
  return {
    options,
    measure,
    measureElement: () => {},
    getTotalSize: () => options.paddingStart + options.count * options.estimateSize() + options.paddingEnd,
    getVirtualItems: rows,
    scrollToIndex(index, { align }) {
      const node = options.getScrollElement();
      if (!node) return;
      const size = options.estimateSize();
      const top = options.paddingStart + index * size;
      node.scrollTop = align === 'start' ? Math.max(0, top - options.scrollPaddingStart) : Math.max(0, top + size - node.clientHeight + options.scrollPaddingEnd);
      measure();
    },
  };
}
`;export{e as default};