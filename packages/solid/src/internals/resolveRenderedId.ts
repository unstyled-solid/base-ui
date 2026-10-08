import { createEffect, createSignal, untrack } from 'solid-js';
import { ownerWindow } from '../utils/owner';
interface ResolveRenderedIdProps { id?: string | undefined; render?: unknown }
/** The component id falls back when omitted/undefined; an empty id suppresses it. */
export function resolveRenderedId(props: ResolveRenderedIdProps, fallbackId: string | undefined) {
  return props.id ?? fallbackId;
}
export function createRenderedId(props: ResolveRenderedIdProps, defaultId: string | undefined | (() => string | undefined), setId: ((id: string | undefined) => void) | undefined) {
  const fallback = () => typeof defaultId === 'function' ? defaultId() : defaultId;
  const id = () => resolveRenderedId(props, fallback());
  const [element, setElement] = createSignal<HTMLElement | null>(null, { ownedWrite: true });
  createEffect(() => ({ element: element(), fallback: fallback() }), (next) => {
    if (!next.element) return;
    const node = next.element;
    let previous: string | undefined;
    let published = false;
    const publish = () => {
      const actual = node.id;
      const value = actual === next.fallback ? undefined : actual;
      if (published && value === previous) return;
      previous = value; published = true;
      untrack(() => setId?.(value));
    };
    publish();
    // Native JSX templates can report an inert-document node before adoption.
    // Use the canonical realm utility, which handles a missing defaultView.
    const Observer = ownerWindow(node).MutationObserver;
    const observer = new Observer(publish);
    observer.observe(node, { attributes: true, attributeFilter: ['id'] });
    return () => { observer.disconnect(); untrack(() => setId?.(undefined)); };
  });
  return [id, (next: HTMLElement | null) => setElement(next)] as const;
}
export { createRenderedId as useRenderedId };
