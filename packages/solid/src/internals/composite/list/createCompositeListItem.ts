import { createEffect, createSignal, onCleanup, untrack, type Accessor } from 'solid-js';
import { useCompositeListContext } from './CompositeList';
import { isServer } from '@solidjs/web';
export interface UseCompositeListItemParameters<M = {}> {
  guess?: boolean | undefined; index?: number | undefined; disabled?: boolean | undefined;
  label?: string | null | undefined; metadata?: M | undefined;
  textRef?: { current: HTMLElement | null } | Accessor<HTMLElement | null> | undefined;
}
export function createCompositeListItem<M = {}>(params: UseCompositeListItemParameters<M> = {}): { readonly index: number | null; ref(element: HTMLElement | null): void } {
  const context = useCompositeListContext<M>(true);
  if (!context) {
    // Upstream's default context makes out-of-list items inert. Keep that
    // behavior locally without its shared mutable guess-index/no-op registry.
    return { get index() { return params.index ?? (params.guess ? 0 : null); }, ref() {} };
  }
  const guess = untrack(() => params.index ?? (params.guess ? context.nextIndexRef.current++ : null));
  const [internal, setInternal] = createSignal<number | null>(guess);
  let node: HTMLElement | null = null;
  let unregister = () => {};
  const registration = {
    get metadata() { return params.metadata ?? null; },
    get index() { return params.index ?? null; },
    get label() { return params.label; },
    get textRef() { return params.textRef ? () => typeof params.textRef === 'function' ? params.textRef() : params.textRef!.current : undefined; },
  };
  const unsubscribe = context.subscribeMapChange((map) => { if (node && params.index == null) setInternal(map.get(node)?.index ?? null); });
  if (!isServer) createEffect(() => ({ index: params.index, metadata: params.metadata, label: params.label, textRef: params.textRef }), () => { context.invalidate(); }, { transparent: true });
  onCleanup(() => { unsubscribe(); unregister(); node = null; });
  return {
    get index() { return params.index ?? internal(); },
    ref(element) { unregister(); node = element; unregister = element ? context.register(element, registration) : () => {}; },
  };
}
export { createCompositeListItem as useCompositeListItem };
