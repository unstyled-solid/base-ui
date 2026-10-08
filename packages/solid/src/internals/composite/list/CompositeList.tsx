// Source: pinned Base UI CompositeList, MIT; native RC13 ownership/scheduling.
import { createContext, createEffect, createSignal, onCleanup, useContext, untrack } from 'solid-js';
import { isServer, type JSX } from '@solidjs/web';
import type { CompositeMetadata } from '../../contracts/items';
export type { CompositeMetadata } from '../../contracts/items';
export interface CompositeListProps<Metadata = {}> {
  children?: JSX.Element;
  elementsRef?: { current: (HTMLElement | null)[] } | undefined;
  labelsRef?: { current: (string | null)[] } | undefined;
  onMapChange?: ((map: Map<Node, CompositeMetadata<Metadata>>) => void) | undefined;
}
interface Registration<M> { metadata: M | null; index: number | null; label: string | null | undefined; textRef: (() => HTMLElement | null) | undefined }
export interface CompositeListContextValue<M = unknown> {
  nextIndexRef: { current: number };
  register(node: HTMLElement, registration: Registration<M>): () => void;
  invalidate(): void;
  subscribeMapChange(listener: (map: Map<Node, CompositeMetadata<M>>) => void): () => void;
}
export const CompositeListContext = createContext<CompositeListContextValue | null>(null);
export function useCompositeListContext<M = unknown>(optional: true): CompositeListContextValue<M> | null;
export function useCompositeListContext<M = unknown>(optional?: false): CompositeListContextValue<M>;
export function useCompositeListContext<M = unknown>(optional = false): CompositeListContextValue<M> | null {
  const context = useContext(CompositeListContext);
  if (!context && !optional) throw new Error('Base UI: A composite list item requires a CompositeList. Wrap the items in a CompositeList.');
  return context as CompositeListContextValue<M>;
}
export function CompositeList<M = {}>(props: CompositeListProps<M>): JSX.Element {
  const registrations = new Map<HTMLElement, Registration<M>>();
  const listeners = new Set<(map: Map<Node, CompositeMetadata<M>>) => void>();
  const [revision, setRevision] = createSignal(0, { ownedWrite: true });
  const nextIndexRef = { current: 0 };
  const fallbackElements = { current: [] as (HTMLElement | null)[] };
  let observer: MutationObserver | undefined;
  let previous: { element: HTMLElement; index: number; metadata: M | null; explicit: number | null }[] = [];
  let previousMetadata = new Map<Node, CompositeMetadata<M>>();
  let disposed = false;
  let published = false;
  const invalidate = () => { if (!disposed) setRevision((value) => value + 1); };
  const context: CompositeListContextValue<M> = {
    nextIndexRef, invalidate,
    register(node, registration) {
      registrations.set(node, registration);
      invalidate();
      return () => {
        if (registrations.get(node) !== registration) return;
        registrations.delete(node);
        invalidate();
      };
    },
    subscribeMapChange(listener) { listeners.add(listener); return () => { listeners.delete(listener); }; },
  };
  createEffect(() => {
    revision();
    return { elements: props.elementsRef ?? fallbackElements, labels: props.labelsRef, callback: props.onMapChange,
      entries: [...registrations].map(([element, registration]) => ({ element, explicit: registration.index,
        metadata: registration.metadata, publishedMetadata: { ...(registration.metadata ?? {} as M) },
        label: registration.label, text: registration.textRef?.()?.textContent ?? element.textContent })) };
  }, ({ elements, labels, callback, entries }) => {
    if (isServer) return;
    const reserved = new Set<number>();
    const automatic: HTMLElement[] = [];
    const ordered: { element: HTMLElement; index: number; metadata: M | null; explicit: number | null }[] = [];
    for (const { element, explicit, metadata } of entries) {
      if (!element.isConnected) continue;
      if (explicit === null) automatic.push(element);
      else if (explicit >= 0) { reserved.add(explicit); ordered.push({ element, index: explicit, metadata, explicit }); }
    }
    automatic.sort((a, b) => a.nextElementSibling === b ? -1 : b.nextElementSibling === a ? 1 : a.compareDocumentPosition(b) & 4 ? -1 : 1);
    let index = 0;
    for (const element of automatic) {
      while (reserved.has(index)) index++;
      ordered.push({ element, index: index++, metadata: entries.find((entry) => entry.element === element)!.metadata, explicit: null });
    }
    if (reserved.size) ordered.sort((a, b) => a.index - b.index);
    elements.current.length = 0;
    if (labels) labels.current.length = 0;
    const map = new Map<Node, CompositeMetadata<M>>();
    for (const item of ordered) {
      elements.current[item.index] = item.element;
      const entry = entries.find((entry) => entry.element === item.element)!;
      map.set(item.element, { ...entry.publishedMetadata, index: item.index });
      if (labels) {
        labels.current[item.index] = entry.label !== undefined ? entry.label : entry.text;
      }
    }
    nextIndexRef.current = elements.current.length;
    const changed = !published || ordered.length !== previous.length || ordered.some((item, i) => {
      const old = previous[i]!;
      return item.element !== old.element || item.index !== old.index || item.metadata !== old.metadata || item.explicit !== old.explicit;
    }) || [...map].some(([node, metadata]) => {
      const before = previousMetadata.get(node);
      if (!before) return true;
      const keys = Reflect.ownKeys(metadata);
      return keys.length !== Reflect.ownKeys(before).length || keys.some((key) => !Object.hasOwn(before, key) || !Object.is(Reflect.get(before, key), Reflect.get(metadata, key)));
    });
    previous = ordered;
    published = true;
    previousMetadata = map;
    observer?.disconnect();
    if (automatic.length > 0) {
      const Observer = automatic[0]!.ownerDocument.defaultView?.MutationObserver;
      if (Observer) {
        observer = new Observer((records) => {
          // In Solid, changing an item's text does not re-run list setup.
          // Keep the imperative typeahead label array current at the DOM boundary.
          if (records.some((record) => automatic.some((node) => node.contains(record.target)))) invalidate();
          if (records.some((record) => [...record.removedNodes].some((node) => node.isConnected))) {
            let last: HTMLElement | undefined;
            for (const node of automatic) {
              if (!node.isConnected) continue;
              if (last && !(last.compareDocumentPosition(node) & 4)) { invalidate(); break; }
              last = node;
            }
          }
        });
        const roots = new Set<Element>();
        if (automatic.length === 1 && automatic[0]!.parentElement) roots.add(automatic[0]!.parentElement!);
        for (let i = 1; i < automatic.length; i++) {
          let root = automatic[i - 1]!.parentElement;
          while (root && !root.contains(automatic[i]!)) root = root.parentElement;
          if (root) roots.add(root);
        }
        for (const root of roots) observer.observe(root, { childList: true, subtree: true, characterData: true });
      }
    }
    if (changed) untrack(() => { for (const listener of listeners) listener(map); callback?.(map); });
  });
  onCleanup(() => {
    disposed = true;
    observer?.disconnect();
    registrations.clear(); listeners.clear();
    (props.elementsRef ?? fallbackElements).current = [];
    if (props.labelsRef) props.labelsRef.current = [];
  });
  return <CompositeListContext value={context as CompositeListContextValue}>{props.children}</CompositeListContext>;
}
export interface CompositeListState {}
export namespace CompositeList { export type Props<M> = CompositeListProps<M>; export type State = CompositeListState }
