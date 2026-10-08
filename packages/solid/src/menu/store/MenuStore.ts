import { createEffect, createMemo, createSignal, onCleanup, untrack } from 'solid-js';
import { createAnimationsFinished } from '../../internals/createAnimationsFinished';
import { createFloatingTree } from '../../floating-ui-react/components/createFloatingTree';
import type { MenuTree } from '../utils/MenuTreeEvents';
import { createNullPopup } from '../../utils/popups/createNullPopup';
import { createPopup, type PopupModel, type PopupOptions } from '../../utils/popups/createPopup';
import type { PopupChangeEventDetails, PopupState } from '../../internals/contracts/popup';
import type { TriggerLookup } from '../../internals/contracts/floating';
import type { HTMLProps } from '../../internals/types';
import type { MutableCell } from '../../internals/contracts/core';
import type { MenuParent, MenuRootProps, MenuRootHighlightEventReason } from '../root/MenuRoot';
import { isKeyboardClick, isKeyboardOpen } from '../utils/isKeyboardOpen';
import { createTimeout } from '../../utils/createTimeout';
import type { InteractionType } from '../../utils/createEnhancedClickHandler';
import { isServer } from '@solidjs/web';

export type MenuInstant = 'dismiss' | 'click' | 'group' | 'trigger-change' | undefined;
export interface MenuTriggerData {
  readonly parent: MenuParent; readonly tree: MenuTree; readonly nodeId: string | undefined;
  readonly parentNodeId: string | null; readonly closeDelay: number;
  readonly keyboardEventRelay: ((event: KeyboardEvent) => void) | undefined;
}
export interface MenuStoreOptions<Payload> extends MenuRootProps<Payload> {
  parent: MenuParent;
  rootId: string;
  floatingId: string;
  virtualFocusRef?: MutableCell<HTMLElement | null>;
  floatingNodeId?: string;
  floatingParentNodeId?: string | null;
  floatingTreeRoot?: MenuTree;
}

/** Menu metadata over the single foundation-owned popup transaction model. */
export interface MenuStoreState<Payload> extends PopupState<Payload> {
  disabled: boolean; modal: boolean; parent: MenuParent; rootId: string | undefined;
  activeIndex: number | null; listElement: HTMLElement | null; listId: string | undefined; instantType: MenuInstant;
  openChangeReason: string | null; keyboardOpen: boolean; openMethod: InteractionType | null;
  highlightedItem: HTMLElement | undefined; hoverEnabled: boolean; highlightItemOnHover: boolean;
  filterTriggerProps: HTMLProps; inputProps: HTMLProps; itemProps: HTMLProps;
  floatingTreeRoot: MenuTree; floatingNodeId: string | undefined; floatingParentNodeId: string | null;
  keyboardEventRelay: ((event: KeyboardEvent) => void) | undefined;
  closeDelay: number;
  instantTypeRaw: MenuInstant;
}
export interface MenuStoreContext {
  /** The root's original tree, before a detached trigger supplies its host tree. */
  localTree: MenuTree;
  triggerElements: TriggerLookup;
  itemDomElements: MutableCell<(HTMLElement | null)[]>; itemLabels: MutableCell<(string | null)[]>;
  typingRef: MutableCell<boolean>; allowMouseUpTriggerRef: MutableCell<boolean>;
  virtualFocusRef: MutableCell<HTMLElement | null> | undefined;
  reportedItem: HTMLElement | undefined; highlightReason: MenuRootHighlightEventReason;
  highlightEvent: Event | undefined; virtualPress: boolean; closeDelay: number; allowMouseEnter: boolean;
  beforeTriggerFocusGuardRef: MutableCell<HTMLElement | null>;
  beforeContentFocusGuardRef: MutableCell<HTMLElement | null>;
  triggerFocusTargetRef: MutableCell<HTMLElement | null>;
}
export interface MenuStore<Payload = unknown> {
  popup: PopupModel<Payload>; state: MenuStoreState<Payload>; context: MenuStoreContext;
  setOpen(next: boolean, details: Omit<PopupChangeEventDetails, 'preventUnmountOnClose'>): void;
  registerTrigger(id: string, element: Element, payload?: Payload, data?: MenuTriggerData): () => void;
  setPopupElement(element: HTMLElement | null): void; setPositionerElement(element: HTMLElement | null): void;
  setMounted(mounted: boolean): void;
  setActiveIndex(index: number | null, reason: MenuRootHighlightEventReason, event?: Event): void;
  setListElement(element: HTMLElement | null): void; setListId(id: string | undefined): void; setHighlightedItem(element: HTMLElement | undefined): void;
  setHoverEnabled(enabled: boolean): void; setFloatingId(id: string): void;
  setFilterTriggerProps(props: HTMLProps): void;
  installInteractions(props: { readonly trigger: HTMLProps; readonly inactiveTrigger: HTMLProps; readonly popup: HTMLProps; readonly item: HTMLProps; readonly input: HTMLProps }): void;
  setOpenMethod(method: InteractionType | null): void;
  setInstantType(instant: MenuInstant): void;
  highlightItem(element: Element | null, reason: MenuRootHighlightEventReason, event?: Event): void;
}
export function createMenuStore<Payload>(options: MenuStoreOptions<Payload>): MenuStore<Payload> {
  const [activeIndex, setIndex] = createSignal<number | null>(null);
  const [listElement, setListElement] = createSignal<HTMLElement | null>(null);
  const [listId, setListId] = createSignal<string | undefined>();
  const initialParent = options.parent;
  const animateInitialOpen = untrack(() => !!(options.open ?? options.defaultOpen) && initialParent.type === 'menu' && initialParent.store.state.transitionStatus === 'starting');
  const seededInstant = untrack(() => animateInitialOpen && initialParent.type === 'menu' ? initialParent.store.state.instantType : undefined);
  const [instant, setInstant] = createSignal<MenuInstant>(seededInstant);
  const [reason, setReason] = createSignal<string | null>(null);
  const [keyboardOpen, setKeyboardOpen] = createSignal(false);
  const [methodRequest, setMethodRequest] = createSignal<{ value: InteractionType | null }>();
  const [hoverEnabled, setHoverEnabled] = createSignal(true);
  const [highlightedItem, setHighlightedItem] = createSignal<HTMLElement | undefined>();
  let initialFilterTriggerProps: HTMLProps = {};
  const [filterTriggerProps, setFilterTriggerProps] = createSignal<HTMLProps | undefined>();
  // Root installs a stable live view before rendering children. Interaction
  // getters remain tracked by their consumers, including enabled/virtual modes.
  let interactions: Parameters<MenuStore<Payload>['installInteractions']>[0] | undefined;
  const [floatingId, setFloatingId] = createSignal(options.floatingId);
  const parent = options.parent;
  const tree = options.floatingTreeRoot ?? (parent.type === 'menu' ? parent.store.state.floatingTreeRoot : createFloatingTree() as MenuTree);
  const triggerMetadata = new Map<string, { element: Element; data: MenuTriggerData; token: symbol }>();
  const inheritedMouseUp: MutableCell<boolean> = untrack(() => parent.type === 'menu' ? parent.store.context.allowMouseUpTriggerRef
    : parent.type !== undefined ? parent.context.allowMouseUpTriggerRef : { current: false });
  const metadata = {
    itemDomElements: { current: [] as (HTMLElement | null)[] },
    itemLabels: { current: [] as (string | null)[] },
    typingRef: { current: false },
    allowMouseUpTriggerRef: inheritedMouseUp,
    virtualFocusRef: options.virtualFocusRef,
    reportedItem: undefined as HTMLElement | undefined,
    highlightReason: 'none' as MenuRootHighlightEventReason,
    highlightEvent: undefined as Event | undefined,
    virtualPress: false,
    closeDelay: 0,
    allowMouseEnter: false,
    beforeTriggerFocusGuardRef: { current: null as HTMLElement | null },
    beforeContentFocusGuardRef: { current: null as HTMLElement | null },
    triggerFocusTargetRef: { current: null as HTMLElement | null },
  };
  const touchTimeout = createTimeout();
  let allowTouchClose = true;
  const suppressedTouchCloses = new WeakSet<object>();
  const popupOptions: PopupOptions<Payload> = {
    open: () => options.open, defaultOpen: untrack(() => options.defaultOpen),
    disabled: () => !!options.disabled || (effectiveParent().type === 'menubar' && (effectiveParent() as Extract<MenuParent, { type: 'menubar' }>).context.disabled),
    get nested() { return state.floatingParentNodeId != null; },
    parent: parent.type === 'menu' ? parent.store : null,
    triggerId: () => options.triggerId, defaultTriggerId: untrack(() => options.defaultTriggerId),
    onOpenChange: () => (next, details) => {
      options.onOpenChange?.(next, details as Parameters<NonNullable<typeof options.onOpenChange>>[1]);
      if (details.isCanceled) return;
      if (!next && details.reason !== 'item-press' && details.event.type === 'click' && (details.event as PointerEvent).pointerType === 'touch' && !allowTouchClose) {
        suppressedTouchCloses.add(details); return;
      }
      if (next && details.reason === 'trigger-focus') {
        allowTouchClose = false; touchTimeout.start(300, () => { allowTouchClose = true; });
      } else { allowTouchClose = true; touchTimeout.clear(); }
      setReason(details.reason);
      setKeyboardOpen(next && isKeyboardOpen(details.reason, details.event));
      const transactionParent = [...triggerMetadata.values()].find(entry => entry.element === details.trigger)?.data.parent ?? state.parent;
      setInstant(transactionParent.type === 'menubar' && ['trigger-focus', 'focus-out', 'trigger-hover', 'list-navigation', 'sibling-open'].includes(details.reason)
        ? 'group' : isKeyboardClick(details.reason, details.event) ? 'click' : !next && details.reason === 'escape-key' ? 'dismiss' : undefined);
    },
    onOpenChangeComplete: () => options.onOpenChangeComplete,
    floatingId: () => floatingId() || undefined, animateInitialOpen,
    // The source reports and dispatches the request, then suppresses only this
    // delayed compatibility-click commit. It is not details.cancel().
    onBeforeOpenCommit(_next, details) { return !suppressedTouchCloses.has(details); },
  };
  const popup = createPopup<Payload>(popupOptions);
  // All interaction engines enter Menu's source-specific guards before the
  // shared popup transaction. Dispatch/state/geometry still have one owner.
  const floatingRootContext = new Proxy(popup.state.floatingRootContext, {
    get(target, key) { return key === 'setOpen' ? setOpen : Reflect.get(target, key, target); },
  });
  // The popup registry is the registration authority. Project its revision to
  // the stable family data, rather than publishing a second version from each
  // trigger attachment effect (including no-op payload re-registrations).
  const activeData = createMemo(() => {
    const id = popup.state.activeTriggerId;
    const registered = popup.getTriggerData(id);
    const entry = id === null ? undefined : triggerMetadata.get(id);
    return registered?.element === entry?.element ? entry?.data : undefined;
  });
  const effectiveParent = createMemo(() => {
    const activeParent = activeData()?.parent;
    if (activeParent) return activeParent.type === undefined && parent.type === undefined ? parent : activeParent;
    if (parent.type !== undefined) return parent;
    // Detached triggers know their composite host before the popup opens.
    // Use an unambiguous common host for the single navigation engine's
    // closed-trigger key policy; the active trigger wins once associated.
    // getTriggerData observes membership even when there is no active ID.
    popup.getTriggerData(null);
    const parents = [...triggerMetadata.entries()]
      .filter(([id, entry]) => popup.context.triggerElements.getById(id) === entry.element)
      .map(([, entry]) => entry.data.parent);
    const first = parents[0];
    return first?.type === 'menubar' && parents.every(candidate => candidate.type === 'menubar' && candidate.context === first.context) ? first : parent;
  });
  const openMethod = createMemo((previous: { open: boolean; request: ReturnType<typeof methodRequest>; value: InteractionType | null } | undefined) => {
    const open = popup.state.open, request = methodRequest();
    const value = previous?.open && !open ? null
      : request !== previous?.request ? request?.value ?? null : previous?.value ?? null;
    return previous && previous.open === open && previous.request === request && previous.value === value
      ? previous : { open, request, value };
  });
  createEffect(() => popup.state.open, open => {
    if (!open) {
      setKeyboardOpen(false); setHoverEnabled(true);
      context.typingRef.current = false; context.allowMouseEnter = false;
    }
  });
  if (seededInstant !== undefined) {
    const clear = () => { setInstant(current => current === seededInstant ? undefined : current); };
    createEffect(() => ({ open: popup.state.open, status: popup.state.transitionStatus, node: popup.state.popupElement }), current => {
      if (!current.open || current.status === undefined && !current.node) clear();
    });
    createAnimationsFinished({ element: () => popup.state.popupElement,
      enabled: () => popup.state.open && popup.state.transitionStatus === undefined && instant() === seededInstant,
      onFinished: clear,
    });
  }
  const menuState = {
    floatingRootContext,
    get disabled() { const p = effectiveParent(); return !!options.disabled || (p.type === 'menubar' && p.context.disabled); },
    get modal() { const p = effectiveParent(); return (p.type === undefined || p.type === 'context-menu') && (options.modal ?? true); },
    get parent() { return effectiveParent(); },
    get rootId(): string | undefined { const p = effectiveParent(); return p.type === 'menu' ? p.store.state.rootId : p.type !== undefined ? p.context.rootId : options.rootId; },
    get floatingTreeRoot() { const p = effectiveParent(); return p.type === 'menu' ? p.store.state.floatingTreeRoot : activeData()?.tree ?? tree; },
    get floatingNodeId() { return activeData()?.nodeId ?? options.floatingNodeId; },
    get floatingParentNodeId() { return activeData()?.parentNodeId ?? options.floatingParentNodeId ?? null; },
    get keyboardEventRelay(): ((event: KeyboardEvent) => void) | undefined {
      const p = effectiveParent();
      return activeData()?.keyboardEventRelay ?? (p.type === 'menu' ? p.store.state.keyboardEventRelay : undefined);
    },
    get closeDelay() { return activeData()?.closeDelay ?? context.closeDelay; },
    get floatingId() { return floatingId() || undefined; },
    get activeIndex() { return activeIndex(); },
    get listElement() { return listElement(); },
    get listId() { return listId(); },
    get instantType() { return instant() === 'trigger-change' && !popup.state.open ? undefined : instant(); },
    get instantTypeRaw() { return instant(); },
    get openChangeReason() { return reason(); },
    get keyboardOpen() { return popup.state.open && keyboardOpen(); },
    get openMethod() { return openMethod().value; },
    get highlightedItem() { return highlightedItem(); },
    get hoverEnabled() { return hoverEnabled(); },
    get highlightItemOnHover() { return options.highlightItemOnHover ?? true; },
    get filterTriggerProps() { return filterTriggerProps() ?? initialFilterTriggerProps; },
    get inputProps() { return interactions?.input ?? {}; },
    get itemProps() { return interactions?.item ?? {}; },
    get activeTriggerProps() { return interactions?.trigger ?? {}; },
    get inactiveTriggerProps() { return interactions?.inactiveTrigger ?? {}; },
    get popupProps() { return interactions?.popup ?? {}; },
  };
  const state = new Proxy(menuState as MenuStoreState<Payload>, {
    get: (target, key) => key in target ? Reflect.get(target, key, target) : Reflect.get(popup.state, key, popup.state),
  });
  const context: MenuStoreContext = {
    ...metadata,
    localTree: tree,
    get triggerElements() { return popup.context.triggerElements; },
    get allowMouseUpTriggerRef() {
      const p = effectiveParent();
      return p.type === 'menu' ? p.store.context.allowMouseUpTriggerRef : p.type !== undefined ? p.context.allowMouseUpTriggerRef : inheritedMouseUp;
    },
  };
  function setActiveIndex(index: number | null, why: MenuRootHighlightEventReason, event?: Event) {
    if (activeIndex() !== index) {
      const item = index === null ? undefined : context.itemDomElements.current[index];
      context.highlightReason = item === context.reportedItem ? 'none' : why;
      context.highlightEvent = item === context.reportedItem ? undefined : event;
    }
    setIndex(index);
  }
  let disposed = false;
  onCleanup(() => { disposed = true; });
  function setOpen(next: boolean, details: Omit<PopupChangeEventDetails, 'preventUnmountOnClose'>) {
    untrack(() => {
      if (!next && !popup.state.open) return;
      const currentTrigger = popup.getCurrentTrigger();
      if (popup.state.open === next && details.trigger === currentTrigger && reason() === details.reason) return;
      if (!next && details.trigger == null) Object.assign(details, { trigger: currentTrigger ?? undefined });
      popup.setOpen(next, details as PopupChangeEventDetails);
    });
  }
  return {
    popup, state, context,
    setOpen,
    registerTrigger(id, element, payload, data) {
      const unregister = popup.registerTrigger(id, element, payload);
      const token = Symbol('menu-trigger-data');
      if (data) triggerMetadata.set(id, { element, data, token });
      return () => {
        unregister();
        if (triggerMetadata.get(id)?.token === token) triggerMetadata.delete(id);
      };
    },
    setPopupElement: popup.setPopupElement,
    setPositionerElement: popup.setPositionerElement,
    setMounted(mounted) { if (mounted) popup.setMounted(true); else popup.forceUnmount(); },
    setActiveIndex, setListElement, setListId, setHighlightedItem, setHoverEnabled,
    setFloatingId,
    setFilterTriggerProps(props) {
      // Seed before contained triggers render, including SSR. Detached triggers
      // subscribed earlier are notified at the ordinary commit checkpoint.
      initialFilterTriggerProps = props;
      if (!isServer) queueMicrotask(() => { if (!disposed) setFilterTriggerProps(() => props); });
    },
    installInteractions(props) { interactions = props; },
    setOpenMethod(value) { setMethodRequest({ value }); }, setInstantType: setInstant,
    highlightItem(element: Element | null, why: MenuRootHighlightEventReason, event?: Event) {
      const index = context.itemDomElements.current.indexOf(element as HTMLElement);
      if (index !== -1) setActiveIndex(index, why, event);
    },
  };
}
export type MenuHandleStore<Payload = unknown> = Pick<MenuStore<Payload>, 'state' | 'context' | 'registerTrigger' | 'setOpen'>;

/** Menu-specific inert view; the foundation owns the fallback popup and trigger tokens. */
export function createNullMenuStore<Payload = unknown>(): MenuHandleStore<Payload> {
  const popup = createNullPopup<Payload>();
  const context: MenuStoreContext = {
    localTree: createFloatingTree() as MenuTree,
    get triggerElements() { return popup.context.triggerElements; },
    itemDomElements: { current: [] }, itemLabels: { current: [] }, typingRef: { current: false },
    allowMouseUpTriggerRef: { current: false }, virtualFocusRef: undefined,
    reportedItem: undefined, highlightReason: 'none', highlightEvent: undefined,
    virtualPress: false, closeDelay: 0, allowMouseEnter: false,
    beforeTriggerFocusGuardRef: { current: null }, beforeContentFocusGuardRef: { current: null }, triggerFocusTargetRef: { current: null },
  };
  const menuState = {
    disabled: false, modal: true, parent: { type: undefined } as MenuParent, rootId: undefined,
    activeIndex: null, listElement: null, listId: undefined, instantType: undefined,
    openChangeReason: null, keyboardOpen: false, openMethod: null,
    highlightedItem: undefined, hoverEnabled: true, highlightItemOnHover: true,
    filterTriggerProps: {}, inputProps: {}, itemProps: {}, activeTriggerProps: {}, popupProps: {},
    floatingNodeId: undefined, floatingParentNodeId: null,
    keyboardEventRelay: undefined,
    floatingTreeRoot: context.localTree,
    closeDelay: 0,
    instantTypeRaw: undefined,
  };
  const state = new Proxy(menuState as MenuStoreState<Payload>, {
    get: (target, key) => key in target ? Reflect.get(target, key, target) : Reflect.get(popup.state, key, popup.state),
  });
  return { state, context, registerTrigger: popup.registerTrigger, setOpen() {} };
}
