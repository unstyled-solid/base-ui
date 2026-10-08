import { createEffect, createSignal, untrack } from 'solid-js';
import { createAnchorPositioning, type Side, type Align, type UseAnchorPositioningSharedParameters } from '../../internals/createAnchorPositioning';
import { CompositeList } from '../../internals/composite';
import type { BaseUIComponentProps } from '../../internals/types';
import { useMenuRootContext } from '../root/MenuRootContext';
import { useMenuPortalContext } from '../portal/MenuPortalContext';
import { MenuPositionerContext } from './MenuPositionerContext';
import { elementProps } from '../utils/props';
import { FloatingNode } from '../../floating-ui-react/components/FloatingTree';
import { createChangeEventDetails } from '../../internals/createBaseUIEventDetails';
import { createTimeout } from '../../utils/createTimeout';
import type { MenuOpenEventDetails } from '../utils/types';
import { createAnchoredPopupScrollLock } from '../../utils/createAnchoredPopupScrollLock';
import { InternalBackdrop } from '../../utils/InternalBackdrop';
import { Show } from 'solid-js';
import { useContextMenuRootContext } from '../host/MenuHostContexts';
import { DROPDOWN_COLLISION_AVOIDANCE, POPUP_COLLISION_AVOIDANCE } from '../../internals/constants';
import { createTriggerSwitchTransition } from '../../internals/createTriggerSwitchTransition';
import { createPositioner } from '../../utils/createPositioner';
export interface MenuPositionerState { open: boolean; side: Side; align: Align; anchorHidden: boolean; nested: boolean; instant: string | undefined }
export interface MenuPositionerProps extends BaseUIComponentProps<'div', MenuPositionerState>, UseAnchorPositioningSharedParameters {}
export function MenuPositioner(props: MenuPositionerProps) {
  const root = useMenuRootContext(); const store = root.store;
  const contextMenu = useContextMenuRootContext(true);
  const keepMounted = useMenuPortalContext();
  const closeTimeout = createTimeout();
  function openChange(details: MenuOpenEventDetails) {
    if (details.open) {
      if (details.parentNodeId === store.state.floatingNodeId) store.setHoverEnabled(false);
      if (details.nodeId !== store.state.floatingNodeId && details.parentNodeId === store.state.floatingParentNodeId) store.setOpen(false, createChangeEventDetails('sibling-open'));
    } else if (details.nodeId === store.state.floatingParentNodeId && store.state.floatingParentNodeId !== null) {
      store.setOpen(false, createChangeEventDetails(details.reason ?? 'sibling-open'));
    }
  }
  function itemHover(data: { nodeId: string | undefined; target: Element | null }) {
    if (!store.state.open || data.nodeId !== store.state.floatingParentNodeId) return;
    if (data.target && store.state.activeTriggerElement && data.target !== store.state.activeTriggerElement) {
      const close = () => store.setOpen(false, createChangeEventDetails('sibling-open'));
      if (store.state.closeDelay > 0) { if (!closeTimeout.isStarted()) closeTimeout.start(store.state.closeDelay, close); }
      else close();
    } else closeTimeout.clear();
  }
  createEffect(() => store.state.floatingTreeRoot.events, events => {
    const change = (data: MenuOpenEventDetails) => untrack(() => openChange(data));
    const hover = (data: Parameters<typeof itemHover>[0]) => untrack(() => itemHover(data));
    events.on('menuopenchange', change); events.on('itemhover', hover);
    return () => { events.off('menuopenchange', change); events.off('itemhover', hover); };
  });
  createEffect(() => ({ events: store.state.floatingTreeRoot.events, open: store.state.open, nodeId: store.state.floatingNodeId, parentNodeId: store.state.floatingParentNodeId, reason: store.state.openChangeReason as MenuOpenEventDetails['reason'] }), data => {
    if (!data.open) closeTimeout.clear();
    data.events.emit('menuopenchange', { open: data.open, nodeId: data.nodeId, parentNodeId: data.parentNodeId, reason: data.reason });
  });
  const parent = () => store.state.parent;
  const position = createAnchorPositioning({
    rootContext: store.state.floatingRootContext,
    get anchor() { const p = parent(); return props.anchor ?? (p.type === 'context-menu' ? p.context.anchor : undefined); },
    get side() { const p = parent(); return props.side ?? (p.type === 'menu' || (p.type === 'menubar' && p.context.orientation === 'vertical') ? 'inline-end' : 'bottom'); },
    get align() { return props.align ?? (parent().type !== undefined ? 'start' : 'center'); },
    get positionMethod() { return contextMenu ? 'fixed' : props.positionMethod ?? 'absolute'; },
    get sideOffset() { return props.sideOffset ?? (parent().type === 'context-menu' && !props.side && props.align !== 'center' ? -5 : 0); },
    get alignOffset() { return props.alignOffset ?? (parent().type === 'context-menu' && !props.side && props.align !== 'center' ? 2 : 0); },
    get collisionBoundary() { return props.collisionBoundary ?? 'clipping-ancestors'; },
    get collisionPadding() { return props.collisionPadding ?? 5; },
    get arrowPadding() { return parent().type === 'context-menu' ? 0 : props.arrowPadding ?? 5; },
    get sticky() { return props.sticky ?? false; }, get disableAnchorTracking() { return props.disableAnchorTracking ?? false; },
    get collisionAvoidance() { return props.collisionAvoidance ?? (parent().type === 'menu' ? POPUP_COLLISION_AVOIDANCE : DROPDOWN_COLLISION_AVOIDANCE); },
    get nodeId() { return store.state.floatingNodeId; },
    get adaptiveOrigin() { return store.popup.state.adaptiveOrigin; },
    get lazyFlip() { return root.virtualFocus ? 'placement' as const : false; },
    get shift() { const collision = props.collisionAvoidance ?? DROPDOWN_COLLISION_AVOIDANCE; return parent().type === 'context-menu' ? { crossAxis: !('side' in collision && collision.side === 'flip'), rootBoundary: 'layoutViewport' as const } : undefined; },
    get mounted() { return store.state.mounted; }, get open() { return store.state.open; }, get keepMounted() { return keepMounted(); },
  });
  createTriggerSwitchTransition({
    get instantType() { return store.state.instantTypeRaw; }, setInstantType: store.setInstantType,
    get domReference() { return store.state.floatingRootContext.state.domReferenceElement; },
    get positionerElement() { return store.state.positionerElement; }, get open() { return store.state.open; },
  });
  createEffect(() => ({ parent: parent(), element: store.state.positionerElement }), ({ parent: p, element }) => {
    if (p.type === 'context-menu') {
      p.context.positionerRef.current = element;
      return () => { if (p.context.positionerRef.current === element) p.context.positionerRef.current = null; };
    }
  });
  const state: MenuPositionerState = {
    get open() { return store.state.open; }, get side() { return position.side; }, get align() { return position.align; },
    get anchorHidden() { return position.anchorHidden; }, get nested() { return parent().type === 'menu'; }, get instant() { return store.state.instantType; },
  };
  const modal = () => {
    const p = parent();
    return p.type === 'menubar' ? p.context.modal : store.state.modal && store.state.openChangeReason !== 'trigger-hover';
  };
  createAnchoredPopupScrollLock(() => store.state.open && modal(), () => store.state.openMethod === 'touch',
    () => store.state.positionerElement, () => store.state.activeTriggerElement);
  const cutout = () => {
    const p = parent();
    return p.type === 'menubar' ? p.context.contentElement : p.type === undefined ? store.state.activeTriggerElement as HTMLElement | null : null;
  };
  function PositionerElement() {
    return createPositioner(props, state, {
      get refs() { return [props.ref, store.setPositionerElement, position.refs.setFloating]; },
      get hidden() { return !store.state.mounted; }, get inert() { return !store.state.open; },
      get styles() { return position.positionerStyles; }, get transitionStatus() { return store.state.transitionStatus; },
      props: elementProps(props, ['anchor', 'side', 'align', 'positionMethod', 'sideOffset', 'alignOffset', 'collisionBoundary', 'collisionPadding', 'arrowPadding', 'sticky', 'disableAnchorTracking', 'collisionAvoidance']),
    });
  }
  function BackdropElement() {
    const [element, setElement] = createSignal<HTMLDivElement | null>(null);
    createEffect(() => ({ parent: parent(), element: element() }), ({ parent, element }) => {
      if (parent.type !== 'context-menu' && parent.type !== 'nested-context-menu') return;
      const cell = parent.context.internalBackdropRef;
      cell.current = element;
      return () => { if (cell.current === element) cell.current = null; };
    });
    return <InternalBackdrop inert={!store.state.open} cutout={cutout()} ref={setElement} />;
  }
  return <MenuPositionerContext value={position}>
    <Show when={store.state.mounted && parent().type !== 'menu' && modal()}>
      <BackdropElement />
    </Show>
    <FloatingNode id={store.state.floatingNodeId}><CompositeList elementsRef={store.context.itemDomElements} labelsRef={store.context.itemLabels} onMapChange={root.syncHighlightedItem}>
    <PositionerElement />
  </CompositeList></FloatingNode></MenuPositionerContext>;
}
export namespace MenuPositioner { export type Props = MenuPositionerProps; export type State = MenuPositionerState }
