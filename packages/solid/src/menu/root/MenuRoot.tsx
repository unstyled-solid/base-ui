import { createEffect, createMemo, onCleanup, onSettled, useContext, untrack, type Accessor } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { createBaseUiId } from '../../internals/createBaseUiId';
import { createChangeEventDetails, type BaseUIChangeEventDetails, type BaseUIHighlightEventDetails } from '../../internals/createBaseUIEventDetails';
import type { MutableCell } from '../../internals/contracts/core';
import { createDismiss } from '../../floating-ui-react/hooks/createDismiss';
import { createListNavigation } from '../../floating-ui-react/hooks/createListNavigation';
import { createTypeahead } from '../../floating-ui-react/hooks/createTypeahead';
import { useDirection } from '../../internals/direction-context/DirectionContext';
import { mergeProps } from '../../merge-props';
import { createMenuStore, type MenuStore } from '../store/MenuStore';
import type { MenuHandle } from '../store/MenuHandle';
import { MenuRootContext, useMenuRootContext } from './MenuRootContext';
import { useContextMenuRootContext, useMenubarContext, type ContextMenuRootContext, type MenubarContext } from '../host/MenuHostContexts';
import { MenuFilterProviderContext } from '../filter-provider/MenuFilterProviderContext';
import { FloatingTree, createFloatingParentNodeId, createFloatingNodeId, useFloatingTree } from '../../floating-ui-react/components/FloatingTree';
import type { MenuTree } from '../utils/MenuTreeEvents';
import { createFloatingTree } from '../../floating-ui-react/components/createFloatingTree';
import { createTimeout } from '../../utils/createTimeout';
import { elementProps } from '../utils/props';
import { createEnhancedClickHandler } from '../../utils/createEnhancedClickHandler';
import { platform } from '../../utils/platform';
import { getHighlightReason } from '../../utils/getHighlightReason';
import { FOCUSABLE_POPUP_PROPS } from '../../utils/popups';

export function MenuRootInternal<Payload>(props: MenuRootInternalProps<Payload>): JSX.Element {
  const enclosing = useMenuRootContext(true);
  const contextMenu = useContextMenuRootContext(true);
  const menubar = useMenubarContext(true);
  const parent: MenuParent = untrack(() => props.isSubmenu) && enclosing ? { type: 'menu', store: enclosing.store }
    : menubar ? { type: 'menubar', context: menubar }
    : contextMenu && !enclosing ? { type: 'context-menu', context: contextMenu } : { type: undefined };
  const rootId = createBaseUiId();
  const defaultFloatingId = createBaseUiId();
  const direction = useDirection();
  const parentNodeId = createFloatingParentNodeId();
  const treeFromContext = useFloatingTree() as MenuTree | null;
  const treeForRoot = parent.type === 'menu' ? treeFromContext ?? untrack(() => parent.store.state.floatingTreeRoot)
    : parent.type === 'menubar' ? treeFromContext ?? createFloatingTree() as MenuTree
      : createFloatingTree() as MenuTree;
  let store: MenuStore<Payload>;
  let floatingNodeId: Accessor<string>;
  const metadata = { parent, rootId: rootId(), floatingId: defaultFloatingId(), virtualFocusRef: untrack(() => props.virtualFocusRef),
     get floatingNodeId() { return floatingNodeId?.(); }, get floatingParentNodeId() { return parentNodeId(); },
    floatingTreeRoot: treeForRoot,
  };
  const options = new Proxy({} as MenuRootInternalProps<Payload> & typeof metadata, {
    get(_target, key) { return key in metadata ? Reflect.get(metadata, key, metadata) : Reflect.get(props, key, props); },
  });
  store = createMenuStore<Payload>(options);
  floatingNodeId = createFloatingNodeId(treeForRoot, () => {
    const currentId = store.state.floatingNodeId;
    return currentId === undefined || currentId === floatingNodeId?.() ? store.state.floatingRootContext : undefined;
  });
  function closeFromTree(data: { domEvent: Event | undefined; reason: MenuRootChangeEventReason }) {
    store.setOpen(false, createChangeEventDetails<MenuRootChangeEventReason>(data.reason, data.domEvent));
  }
  createEffect(() => store.state.floatingTreeRoot.events, events => {
    events.on('close', closeFromTree);
    return () => events.off('close', closeFromTree);
  });
  const floating = store.state.floatingRootContext;
  const outsideTimeout = createTimeout();
  let allowOutsideDismiss = parent.type !== 'context-menu';
  createEffect(() => store.state.open, open => {
    if (parent.type !== 'context-menu') return;
    if (!open) { outsideTimeout.clear(); allowOutsideDismiss = false; }
    else outsideTimeout.start(500, () => { allowOutsideDismiss = true; });
  });
  const dismiss = createDismiss(floating, {
    get enabled() { return !store.state.disabled; },
    get bubbles() { return { escapeKey: !!props.closeParentOnEsc && store.state.parent.type === 'menu' }; },
    outsidePress() { return parent.type !== 'context-menu' || floating.data.openEvent?.type === 'contextmenu' || allowOutsideDismiss; },
    get externalTree() { return store.state.floatingTreeRoot; },
  });
  const navigation = createListNavigation(floating, {
    listRef: store.context.itemDomElements,
    get activeIndex() { return store.state.activeIndex; },
    get enabled() { return !store.state.disabled; },
    get virtual() { return props.virtualFocus ?? false; },
    get nested() { const current = store.state.parent; return current.type === 'menubar' || (!props.virtualFocus && current.type !== undefined); },
    get orientation() { return props.orientation ?? 'vertical'; },
    get triggerOrientation() { return props.virtualFocus ? 'vertical' : props.orientation ?? 'vertical'; },
    get parentOrientation() { const current = store.state.parent; return current.type === 'menubar' ? current.context.orientation : undefined; },
    get rtl() { return direction() === 'rtl'; },
    get loopFocus() { return props.loopFocus ?? true; },
    get allowEscape() { return !!props.virtualFocus && (props.loopFocus ?? true) && (props.allowEscape ?? true); },
    get focusItemOnOpen() { return props.virtualFocus ? store.state.keyboardOpen : undefined; },
    get focusItemOnHover() { return props.highlightItemOnHover ?? true; },
    get resetOnPointerLeave() { return props.resetOnPointerLeave ?? true; },
    disabledIndices: [],
    get openOnArrowKeyDown() { return store.state.parent.type !== 'context-menu' && !(props.virtualFocus && props.isSubmenu); },
    get nestedReturnFocusRef() { const current = store.state.parent; return current.type === 'menu' ? current.store.context.virtualFocusRef : undefined; },
    get externalTree() { return store.state.floatingTreeRoot; },
    onNavigate(index: number | null, event?: Event, source?: string) {
      store.setActiveIndex(index, source === 'imperative' ? 'imperative-action' : getHighlightReason(event), event);
    },
  });
  const typeahead = createTypeahead(floating, {
    get enabled() { return !store.state.disabled && !props.virtualFocus; },
    listRef: store.context.itemLabels, elementsRef: store.context.itemDomElements,
    get activeIndex() { return store.state.activeIndex; }, resetMs: 500,
    onTyping(value: boolean) { store.context.typingRef.current = value; },
    onMatch(index: number, event?: Event) { if (store.state.open) store.setActiveIndex(index, 'keyboard', event); },
  });
  // These are live interaction views, installed once; no signal-writing synchronization effects.
  const interactionType = createEnhancedClickHandler(() => (_event, method) => {
    if (!store.state.open) store.setOpenMethod(method || (platform.os.ios ? 'touch' : ''));
  });
  // The prop merger brands native handlers at dispatch. Its generic native /
  // branded tuple facade is still being reconciled by the events owner.
  store.installInteractions({
    get trigger() { return mergeProps<any>(typeahead.reference,
      props.virtualFocus ? elementProps(navigation.trigger ?? {}, ['onFocus']) : navigation.reference, dismiss.reference,
      { onMouseMove() { store.context.allowMouseEnter = true; } }, interactionType); },
    get inactiveTrigger() { return mergeProps<any>(navigation.trigger, dismiss.trigger, interactionType); },
    get popup() { return mergeProps<any>(FOCUSABLE_POPUP_PROPS, {
      onMouseMove() { store.context.allowMouseEnter = true; if (store.state.parent.type === 'menu') store.setHoverEnabled(false); },
      onClick() { store.setHoverEnabled(false); },
      onKeyDown(event: KeyboardEvent) { if (!event.cancelBubble) store.state.keyboardEventRelay?.(event); },
    }, typeahead.floating, navigation.floating, dismiss.floating); },
    get item() { return navigation.item ?? {}; },
    get input() { return props.virtualFocus ? navigation.reference ?? {} : {}; },
  });
  let lastIndex = -1;
  let disposed = false;
  let highlightSyncQueued = false;
  onCleanup(() => { disposed = true; });
  function syncHighlightedItem(index = untrack(() => store.state.activeIndex)) {
    untrack(() => {
      const item = index === null ? undefined : store.context.itemDomElements.current[index] ?? undefined;
      if (item?.isConnected === false) return;
      const itemIndex = item ? index! : -1;
      if (lastIndex === itemIndex && store.context.reportedItem === item) return;
      lastIndex = itemIndex;
      store.context.reportedItem = item;
      if (props.virtualFocus) store.setHighlightedItem(item);
      const reason = store.context.highlightReason;
      const event = store.context.highlightEvent ?? new Event('base-ui');
      store.context.highlightReason = 'none'; store.context.highlightEvent = undefined;
      props.onItemHighlighted?.(item, { reason, event, label: item ? store.context.itemLabels.current[itemIndex] ?? undefined : undefined } as MenuRootHighlightEventDetails);
    });
  }
  createEffect(() => store.state.activeIndex, index => { syncHighlightedItem(index); });
  function syncSettledRegistry() {
    if (disposed || highlightSyncQueued) return;
    highlightSyncQueued = true;
    // Registry subscribers can propose an index in this turn. Wait for its
    // ordinary commit so a temporarily shifted element is never reported.
    queueMicrotask(() => { highlightSyncQueued = false; if (!disposed) syncHighlightedItem(); });
  }
  const actions: MenuRootActions = {
    unmount() { store.setMounted(false); },
    close() { store.setOpen(false, createChangeEventDetails('imperative-action')); },
    highlightItem(target) { if (store.state.open) navigation.highlightItem(target); },
  };
  createEffect(() => props.actionsRef, ref => {
    if (!ref) return;
    ref.current = actions;
    return () => { if (ref.current === actions) ref.current = null; };
  });
  let committed = false;
  let attachedHandle: MenuHandle<Payload> | undefined;
  let detachHandle: (() => void) | undefined;
  function attach(handle: MenuHandle<Payload> | undefined) {
    if (attachedHandle === handle) return;
    detachHandle?.(); attachedHandle = handle;
    detachHandle = handle?.attachStore(store);
  }
  createEffect(() => props.handle, handle => { if (committed) attach(handle); });
  onSettled(() => {
    if (process.env.NODE_ENV !== 'production' && parent.type !== undefined && props.modal !== undefined) console.warn('Base UI: The `modal` prop is not supported on nested menus. It will be ignored.');
    committed = true; attach(props.handle);
    const host = parent.type === 'context-menu' ? parent.context : null;
    const hostActions = { setOpen: store.setOpen };
    if (host) host.actionsRef.current = hostActions;
    return () => {
      committed = false; detachHandle?.(); detachHandle = undefined; attachedHandle = undefined;
      if (host?.actionsRef.current === hostActions) host.actionsRef.current = null;
    };
  });
  const context: MenuRootContext<Payload> = {
    store, parent,
    get orientation() { return props.orientation ?? 'vertical'; },
    get loopFocus() { return props.loopFocus ?? true; },
    get allowEscape() { return props.allowEscape ?? true; },
    get defaultFloatingId() { return defaultFloatingId(); },
    setRenderedFloatingId(id) { store.setFloatingId(id ?? defaultFloatingId()); },
    get virtualFocus() { return props.virtualFocus ?? false; },
    get parentVirtualFocus() { return enclosing?.virtualFocus ?? false; },
    get parentWebkitItemSelected() { return enclosing?.webkitItemSelected ?? false; },
    get webkitItemSelected() { return props.webkitItemSelected ?? false; }, syncHighlightedItem: syncSettledRegistry,
  };
  // A payload callback can read/destructure its argument immediately. Narrow
  // the dependency to payload identity so trigger registration and unrelated
  // popup metadata cannot recreate that callback's owned subtree in a loop.
  const currentPayload = createMemo(() => store.state.payload);
  const payload = { get payload() { return currentPayload(); } };
  function Content(): JSX.Element {
    const content = createMemo(() => {
      const children = props.children;
      // Providers can forward Solid's public ChildrenReturn accessor. It is
      // renderer-owned JSX, not a payload callback. Calling it here would make
      // this owner depend on descendant portal refs and recreate its subtree.
      const resolvedChildren = typeof children === 'function' && 'toArray' in children
        && typeof children.toArray === 'function';
      return typeof children === 'function' && !resolvedChildren ? children(payload) : children;
    });
    return <>{content()}</>;
  }
  const content = () => <MenuRootContext value={context as MenuRootContext}><Content /></MenuRootContext>;
  return parent.type === undefined || parent.type === 'context-menu' ? <FloatingTree externalTree={store.state.floatingTreeRoot}>{content()}</FloatingTree> : content();
}
export function MenuRoot<Payload = unknown>(props: MenuRootProps<Payload>): JSX.Element {
  const filter = useContext(MenuFilterProviderContext);
  if (!filter) return <MenuRootInternal {...props} />;
  return <MenuFilterProviderContext value={null}><filter.Root {...filter.options} {...props} /></MenuFilterProviderContext>;
}
export type MenuParent = { type: 'menu'; store: MenuStore } | { type: 'menubar'; context: MenubarContext } | { type: 'context-menu'; context: ContextMenuRootContext } | { type: 'nested-context-menu'; context: ContextMenuRootContext; menuContext: MenuRootContext } | { type: undefined };
export type MenuRootOrientation = 'horizontal' | 'vertical';
export type MenuRootChangeEventReason = 'trigger-hover' | 'trigger-focus' | 'trigger-press' | 'outside-press' | 'focus-out' | 'list-navigation' | 'escape-key' | 'item-press' | 'close-press' | 'sibling-open' | 'cancel-open' | 'imperative-action' | 'none';
export type MenuRootChangeEventDetails = BaseUIChangeEventDetails<MenuRootChangeEventReason> & { preventUnmountOnClose(): void };
export type MenuRootHighlightEventReason = 'keyboard' | 'pointer' | 'imperative-action' | 'none';
export type MenuRootHighlightEventDetails = BaseUIHighlightEventDetails<MenuRootHighlightEventReason, { label: string | undefined }>;
export type MenuRootHighlightItemTarget = 'next' | 'previous' | 'first' | 'last' | 'none';
export interface MenuRootState {}
export interface MenuRootActions { unmount(): void; close(): void; highlightItem(target: MenuRootHighlightItemTarget): void }
export interface MenuRootProps<Payload = unknown> {
  defaultOpen?: boolean; open?: boolean; loopFocus?: boolean; highlightItemOnHover?: boolean;
  modal?: boolean; disabled?: boolean; orientation?: MenuRootOrientation; closeParentOnEsc?: boolean;
  onOpenChange?(open: boolean, details: MenuRootChangeEventDetails): void;
  onOpenChangeComplete?(open: boolean): void;
  onItemHighlighted?(item: HTMLElement | undefined, details: MenuRootHighlightEventDetails): void;
  actionsRef?: MutableCell<MenuRootActions | null>; triggerId?: string | null; defaultTriggerId?: string | null;
  handle?: MenuHandle<Payload>; children?: JSX.Element | ((data: { payload: Payload | undefined }) => JSX.Element);
}
export interface MenuRootInternalProps<Payload = unknown> extends MenuRootProps<Payload> {
  isSubmenu?: boolean; virtualFocus?: boolean; virtualFocusRef?: MutableCell<HTMLElement | null>;
  allowEscape?: boolean; resetOnPointerLeave?: boolean; webkitItemSelected?: boolean;
}
export namespace MenuRoot {
  export type Props<Payload = unknown> = MenuRootProps<Payload>;
  export type State = MenuRootState; export type Actions = MenuRootActions;
  export type Orientation = MenuRootOrientation; export type ChangeEventReason = MenuRootChangeEventReason;
  export type ChangeEventDetails = MenuRootChangeEventDetails; export type HighlightEventReason = MenuRootHighlightEventReason;
  export type HighlightEventDetails = MenuRootHighlightEventDetails; export type HighlightItemTarget = MenuRootHighlightItemTarget;
}
