import { createEffect, createSignal, omit, type Accessor } from 'solid-js';
import { Portal, isServer, type JSX } from '@solidjs/web';
import { usePortalContext } from '../components/PortalContext';
import type { PortalContainer } from '../../internals/contracts/portal';
import { createBaseUiId } from '../../internals/createBaseUiId';
import { createRenderElement, type UseRenderElementComponentProps } from '../../internals/createRenderElement';
import type { InputRef } from '../../utils/createMergedRefs';
export interface UseFloatingPortalNodeProps<S extends object = {}, E extends HTMLElement = HTMLDivElement> {
  container?: PortalContainer;
  ref?: InputRef<E>;
  componentProps?: UseRenderElementComponentProps<S> | undefined;
  elementProps?: Record<string, any> | undefined;
}
export interface UseFloatingPortalNodeResult { readonly node: HTMLElement | null; readonly nodeId: string | undefined; subtree: JSX.Element; nodeAccessor: Accessor<HTMLElement | null> }
export function createFloatingPortalNode<S extends object = {}, E extends HTMLElement = HTMLDivElement>(props: UseFloatingPortalNodeProps<S, E> = {}): UseFloatingPortalNodeResult {
  const parent = usePortalContext();
  const id = createBaseUiId();
  const [mount, setMount] = createSignal<Element | null>(null);
  const [node, setNode] = createSignal<HTMLElement | null>(null);
  const [nodeId, setNodeId] = createSignal<string | undefined>(undefined);
  createEffect(() => {
    const container = props.container;
    return container === null || isServer ? null : (typeof container === 'function' ? container() : container) ?? parent?.portalNode() ?? document.body;
  }, (container) => {
    if (!container) { setMount(null); return; }
    if (container.nodeType === 11) {
      const wrapper = container.ownerDocument.createElement('div');
      wrapper.setAttribute('data-base-ui-shadow-portal', '');
      container.appendChild(wrapper);
      setMount(wrapper);
      return () => { wrapper.remove(); };
    }
    setMount(container as Element);
  });
  createEffect(node, (element) => {
    if (!element) { setNodeId(undefined); return; }
    const update = () => setNodeId(element.id || undefined);
    update();
    const Observer = element.ownerDocument.defaultView?.MutationObserver;
    if (!Observer) return;
    const observer = new Observer(update);
    observer.observe(element, { attributes: true, attributeFilter: ['id'] });
    return () => observer.disconnect();
  });
  function Host() {
    const report = (element: HTMLElement | null) => { setNode(element); };
    return createRenderElement<S, E>('div', props.componentProps ?? {}, {
      get ref() { return [props.ref, report]; },
      get props() { return [{ id: id(), 'data-base-ui-portal': '' }, props.elementProps && omit(props.elementProps, 'children')]; },
    });
  }
  const subtree = <>{mount() && <Portal mount={mount()!}><Host /></Portal>}</>;
  return { get node() { return node(); }, get nodeId() { return nodeId(); }, subtree, nodeAccessor: node };
}
export { createFloatingPortalNode as useFloatingPortalNode };
