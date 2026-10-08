import { createEffect, createSignal, onCleanup, untrack } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { useFilterDropdownItemContext, type FilterDropdownItemContext } from '../root/FilterDropdownRootContext';
import { useFilterDropdownGroupContext } from '../group/FilterDropdownGroupContext';
import { selectors } from '../store';

function childrenText(value: unknown): string {
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (Array.isArray(value)) return value.map(childrenText).join('');
  if (value && typeof value === 'object' && 'textContent' in value) return String(value.textContent ?? '');
  return '';
}
export interface UseFilterDropdownItemParameters {
  label?: string;
  retainGroup?: boolean;
  children?: JSX.Element;
  render?: unknown;
  context?: FilterDropdownItemContext | null;
}
export interface UseFilterDropdownItemReturnValue {
  readonly visible: boolean;
  /** Native assignment callback, with a raw current node for the host's imperative work. */
  ref: ((element: HTMLElement | null) => void) & { readonly current: HTMLElement | null };
}
export function createFilterDropdownItem(params: UseFilterDropdownItemParameters): UseFilterDropdownItemReturnValue {
  // Context ancestry is fixed for this item owner; explicit item-owner policy
  // remains live through owner() rather than being copied from setup.
  const nearest = useFilterDropdownItemContext(untrack(() => params.context !== undefined));
  const group = useFilterDropdownGroupContext();
  const owner = () => params.context === undefined ? nearest : params.context;
  const id = Symbol('filter-dropdown-item');
  const [registered, setRegistered] = createSignal(false);
  // Native refs also detach during the owned host's disposal.
  const [element, setElement] = createSignal<HTMLElement | null>(null, { ownedWrite: true });
  let node: HTMLElement | null = null;
  let cachedText: string | undefined;
  let previousChildren: string | undefined;
  const ref = Object.defineProperty((next: HTMLElement | null) => { node = next; setElement(next); }, 'current', { get: () => node });
  onCleanup(() => { node = null; });
  createEffect(() => ({ owner: owner(), label: params.label, children: params.children, render: params.render, element: element() }), next => {
    const fallback = childrenText(next.children);
    const renderedText = next.element?.isConnected ? next.element.textContent : undefined;
    const text = next.label ?? renderedText ?? (fallback === previousChildren ? cachedText ?? fallback : fallback);
    previousChildren = fallback;
    cachedText = text;
    const unregister = next.owner?.registerItem(id, {
      getText() {
        if (params.label == null && node?.isConnected) cachedText = node.textContent ?? '';
        return params.label ?? cachedText;
      },
    });
    setRegistered(true);
    return unregister;
  });
  // The group belongs to the containing list, even when a submenu trigger's
  // explicit item owner is an enclosing root. Nested lists reset this context.
  createEffect(() => params.retainGroup ?? false, retained => group?.registerItem(id, retained));
  return {
    get visible() { const context = owner(); return !registered() || context === null || selectors.isItemVisible(context.store.state, id); },
    ref: ref as UseFilterDropdownItemReturnValue['ref'],
  };
}
export { createFilterDropdownItem as useFilterDropdownItem };
