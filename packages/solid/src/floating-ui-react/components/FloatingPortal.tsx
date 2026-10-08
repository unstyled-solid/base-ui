import { createEffect, createMemo, createSignal, omit, untrack, type Accessor } from 'solid-js';
import type { JSX } from '@solidjs/web';
import type { PortalContainer, PortalContext as PortalContextValue, PortalFocusState } from '../../internals/contracts/portal';
import type { BaseUIComponentProps } from '../../internals/types';
import { PortalContext, usePortalContext } from './PortalContext';
import { createFloatingPortalNode } from '../hooks/createFloatingPortalNode';
import { FocusGuard } from '../../utils/FocusGuard';
import { ownerVisuallyHidden } from '../../internals/constants';
import { disableFocusInside, enableFocusInside, getNextTabbable, getPreviousTabbable, isOutsideEvent } from '../utils/tabbable';
import { OwnedPortalContent } from '../../utils/OwnedPortalContent';
import { LogicalLayerContext, createLogicalLayerAccessor } from './LogicalLayerContext';
export interface FloatingPortalProps extends BaseUIComponentProps<'div', {}, JSX.HTMLAttributes<HTMLElement>> { container?: PortalContainer; keepMounted?: boolean; preserveTabOrder?: boolean; portalOwnerRole?: JSX.HTMLAttributes<HTMLElement>['role'] | undefined }
export function FloatingPortal(props: FloatingPortalProps): JSX.Element {
  const parentLayer = createLogicalLayerAccessor();
  const result = createFloatingPortalNode({ get container() { return props.container; }, get ref() { return props.ref; }, componentProps: props,
    elementProps: omit(props, 'children', 'container', 'render', 'class', 'style', 'ref', 'keepMounted', 'preserveTabOrder', 'portalOwnerRole') });
  // Only manager ownership is stored. Its policy remains a live derivation,
  // so open state and the portal guards observe the same committed update.
  const [focusManager, setFocusManager] = createSignal<Accessor<PortalFocusState | null> | null>(null);
  const focus = createMemo(() => focusManager()?.() ?? null);
  const [beforeInside, setBeforeInside] = createSignal<HTMLElement | null>(null);
  const [afterInside, setAfterInside] = createSignal<HTMLElement | null>(null);
  const [beforeOutside, setBeforeOutside] = createSignal<HTMLElement | null>(null);
  const [afterOutside, setAfterOutside] = createSignal<HTMLElement | null>(null);
  const marked = new WeakSet<Event>();
  const branches = new Set<Element>();
  const context: PortalContextValue = {
    portalNode: result.nodeAccessor, beforeInside, afterInside, beforeOutside, afterOutside,
    get focusState() { return focus(); },
    registerFocusManagerState(source) {
      setFocusManager(() => source);
      return () => { setFocusManager(current => current === source ? null : current); };
    }, setBeforeInside, setAfterInside,
    layer: {
      markEvent(event) { marked.add(event); parentLayer()?.markEvent(event); },
      containsEvent(event) { return marked.has(event) || event.composedPath().some((node) => node === result.node || [...branches].some((branch) => node === branch)); },
      registerBranch(element) { branches.add(element); return () => { branches.delete(element); }; },
    },
  };
  createEffect(() => ({ node: result.node, layer: parentLayer() }), ({ node, layer }) => {
    if (node && layer) return layer.registerBranch(node);
  });
  createEffect(() => ({ node: result.node, modal: focus()?.modal, open: focus()?.open }), ({ node, modal, open }) => {
    if (!node) return;
    let disabled = false;
    const mark = (event: Event) => context.layer.markEvent(event);
    const handleFocus = (event: FocusEvent) => {
      if (modal || !event.relatedTarget || !isOutsideEvent(event)) return;
      if (event.type === 'focusin') { if (disabled) { enableFocusInside(node); disabled = false; } }
      else if (!disabled) { disableFocusInside(node); disabled = true; }
    };
    const events = ['pointerdown', 'pointerup', 'mousedown', 'mouseup', 'click', 'keydown', 'focusin', 'focusout'];
    for (const event of events) node.addEventListener(event, mark, true);
    node.addEventListener('focusin', handleFocus, true); node.addEventListener('focusout', handleFocus, true);
    if (open) enableFocusInside(node);
    return () => {
      for (const event of events) node.removeEventListener(event, mark, true);
      node.removeEventListener('focusin', handleFocus, true); node.removeEventListener('focusout', handleFocus, true);
      if (disabled) enableFocusInside(node);
    };
  });
  const guards = () => props.preserveTabOrder !== false && !!focus() && !focus()!.modal && focus()!.open && !!result.node;
  return <>{result.subtree}<LogicalLayerContext value={() => context.layer}><PortalContext value={context}>
    {guards() && <FocusGuard ref={setBeforeOutside} data-type="outside" onFocusIn={(event) => untrack(() => {
      if (isOutsideEvent(event, result.node!)) beforeInside()?.focus();
      else getPreviousTabbable(focus()?.domReference ?? null)?.focus();
    })} />}
    {guards() && <span role={props.portalOwnerRole} aria-owns={result.nodeId} style={ownerVisuallyHidden} />}
    <OwnedPortalContent mount={result.node} wait={props.container === null}>{props.children}</OwnedPortalContent>
    {guards() && <FocusGuard ref={setAfterOutside} data-type="outside" onFocusIn={(event) => untrack(() => {
      if (isOutsideEvent(event, result.node!)) afterInside()?.focus();
      else { getNextTabbable(focus()?.domReference ?? null)?.focus(); if (focus()?.closeOnFocusOut) focus()!.onOpenChange(false, { reason: 'focus-out', event }); }
    })} />}
  </PortalContext></LogicalLayerContext></>;
}
export { usePortalContext };
