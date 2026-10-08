import { createEffect, createSignal, omit, onCleanup, untrack } from 'solid-js';
import { createClick } from '../../floating-ui-react/hooks/createClick';
import { createFocus } from '../../floating-ui-react/hooks/createFocus';
import { createHoverReferenceInteraction } from '../../floating-ui-react/hooks/createHoverReferenceInteraction';
import { safePolygon } from '../../floating-ui-react/safePolygon';
import { createButton } from '../../internals/use-button';
import { createBaseUiId } from '../../internals/createBaseUiId';
import { createRenderElement } from '../../internals/createRenderElement';
import { createTimeout } from '../../utils/createTimeout';
import type { BaseUIComponentProps } from '../../internals/types';
import type { MenuHandle } from '../store/MenuHandle';
import { useMenuRootContext } from '../root/MenuRootContext';
import { useMenubarContext } from '../host/MenuHostContexts';
import { elementProps } from '../utils/props';
import { pressableTriggerMapping } from '../utils/stateAttributesMapping';
import { createMixedToggleClickHandler } from '../../utils/createMixedToggleClickHandler';
import { CompositeItem, useCompositeRootContext } from '../../internals/composite';
import { createFloatingNodeId, createFloatingParentNodeId, useFloatingTree } from '../../floating-ui-react/components/FloatingTree';
import { createFloatingTree } from '../../floating-ui-react/components/createFloatingTree';
import type { MenuTriggerData, MenuStoreContext } from '../store/MenuStore';
import type { MenuTree } from '../utils/MenuTreeEvents';
import { Show } from 'solid-js';
import { FocusGuard } from '../../utils/FocusGuard';
import { createTriggerFocusGuards } from '../../utils/popups/createTriggerFocusGuards';
import { contains, getTarget } from '../../utils/shadowDom';
import { isMouseWithinBounds } from '../../utils/getPseudoElementBounds';
import { findRootOwnerId } from '../utils/findRootOwnerId';
import { createChangeEventDetails } from '../../internals/createBaseUIEventDetails';
export interface MenuTriggerState { open: boolean; disabled: boolean }
export interface MenuTriggerProps<Payload = unknown> extends BaseUIComponentProps<'button', MenuTriggerState> {
  disabled?: boolean; nativeButton?: boolean; handle?: MenuHandle<Payload>; payload?: Payload;
  delay?: number; closeDelay?: number; openOnHover?: boolean;
}
export function MenuTrigger<Payload = unknown>(props: MenuTriggerProps<Payload>) {
  const root = useMenuRootContext(true); const menubar = useMenubarContext(true);
  const getStore = () => props.handle?.store ?? root?.store;
  // Validate the initial provider/handle boundary; the store accessor below
  // follows later handle changes without snapshotting reactive props in setup.
  if (!root && !untrack(() => props.handle)) throw new Error('Base UI: <Menu.Trigger> must be either used within a <Menu.Root> component or provided with a handle.');
  const store = () => getStore()!;
  const id = createBaseUiId(() => typeof props.id === 'string' ? props.id : undefined);
  const [element, setElement] = createSignal<HTMLElement | null>(null);
  const active = () => store().state.activeTriggerId === id();
  const open = () => store().state.open && active();
  const disabled = () => !!props.disabled || store().state.disabled || !!menubar?.disabled;
  const composite = useCompositeRootContext(true);
  const tree = (useFloatingTree() as MenuTree | null) ?? createFloatingTree() as MenuTree;
  const floating = () => store().state.floatingRootContext;
  const nodeId = createFloatingNodeId(tree, () => active() ? floating() : undefined);
  const parentNodeId = createFloatingParentNodeId();
  const triggerData: MenuTriggerData = {
    parent: menubar ? { type: 'menubar', context: menubar } : { type: undefined },
    // A contained trigger must not point its root back at that root's live
    // FloatingTree facade. Detached triggers supply their own host tree.
    get tree() { return root && getStore() === root.store ? root.store.context.localTree : tree; },
    get nodeId() { return nodeId(); }, get parentNodeId() { return parentNodeId(); },
    get closeDelay() { return props.closeDelay ?? 0; }, keyboardEventRelay: composite?.relayKeyboardEvent,
  };
  createEffect(() => ({ store: store(), element: element(), id: id(), payload: props.payload }), data => {
    if (data.element) return data.store.registerTrigger(data.id, data.element, data.payload, triggerData);
  });
  const [stick, setStick] = createSignal(false);
  const stickTimeout = createTimeout();
  createEffect(() => ({ open: open(), reason: store().state.openChangeReason }), data => {
    if (data.open && data.reason === 'trigger-hover') { setStick(true); stickTimeout.start(500, () => { setStick(false); }); }
    else if (!data.open) { stickTimeout.clear(); setStick(false); }
  });
  const click = createClick(floating, { get enabled() { return !disabled(); },
    get event() { return open() && menubar ? 'click' : 'mousedown'; }, toggle: true,
    get stickIfOpen() { return !menubar && stick(); },
  });
  const focus = createFocus(floating, { get enabled() { return !disabled() && !!menubar?.hasSubmenuOpen; } });
  const hover = createHoverReferenceInteraction(floating, {
    get enabled() { return !disabled() && (props.openOnHover ?? menubar?.hasSubmenuOpen ?? false) && (!menubar || menubar.hasSubmenuOpen && !(active() && store().state.mounted)); },
    handleClose: safePolygon({ blockPointerEvents: !menubar }), mouseOnly: true, move: false,
    get restMs() { return menubar ? undefined : props.delay ?? 100; }, get delay() { return { close: props.closeDelay ?? 0 }; },
    externalTree: tree,
    triggerElementRef: { get current() { return element(); } }, get isActiveTrigger() { return active(); },
    isClosing: () => store().state.transitionStatus === 'ending',
  });
  const button = createButton({ get disabled() { return disabled(); }, get native() { return props.nativeButton ?? true; } });
  const mouseUp = createTimeout();
  let removeMouseUp = () => {};
  function handleDocumentMouseUp(event: MouseEvent) {
    removeMouseUp(); mouseUp.clear();
    const current = store(); current.context.allowMouseUpTriggerRef.current = false;
    const node = element(); const target = getTarget(event) as Element | null;
    if (!node || contains(node, target) || contains(current.state.positionerElement, target) ||
      target && findRootOwnerId(target) === current.state.rootId || isMouseWithinBounds(event, node)) return;
    current.state.floatingTreeRoot.events.emit('close', { domEvent: event, reason: 'cancel-open' });
  }
  function listenForMouseUp(node: HTMLElement) {
    removeMouseUp();
    node.ownerDocument.addEventListener('mouseup', handleDocumentMouseUp, { once: true });
    removeMouseUp = () => { node.ownerDocument.removeEventListener('mouseup', handleDocumentMouseUp); removeMouseUp = () => {}; };
  }
  onCleanup(() => { removeMouseUp(); });
  const mixed = createMixedToggleClickHandler({ get open() { return open(); }, enabled: !!menubar, mouseDownAction: 'open' });
  const guards = createTriggerFocusGuards(store, element);
  createEffect(() => ({ open: open(), reason: store().state.openChangeReason, node: element(), mouseUpRef: store().context.allowMouseUpTriggerRef }), ({ open: isOpen, reason, node, mouseUpRef }) => {
    if (!isOpen) { if (!menubar) mouseUpRef.current = false; return; }
    if (node && reason === 'trigger-hover') listenForMouseUp(node);
    return () => { removeMouseUp(); mouseUp.clear(); };
  });
  const state: MenuTriggerState = { get open() { return open(); }, get disabled() { return disabled(); } };
  const nativeProps = elementProps(props, ['disabled', 'nativeButton', 'handle', 'payload', 'delay', 'closeDelay', 'openOnHover', 'id', 'children']);
  // The final button transform rebuilds its prop view as interaction state
  // changes. Keep lazy children on their original source after that transform.
  const childProps = omit(props, key => key !== 'children');
  const parameters = { state,
    stateAttributesMapping: pressableTriggerMapping, get ref() { return [props.ref, setElement, button.buttonRef]; },
    get props() { return [focus.reference, click.reference, hover, active() && store().state.mounted ? store().state.activeTriggerProps : store().state.inactiveTriggerProps, {
      get id() { return id(); }, 'aria-haspopup': 'menu', get 'aria-expanded'() { return open(); },
      get 'aria-controls'() { return active() && store().state.mounted ? store().state.listId || store().state.floatingId || undefined : undefined; },
      get role() { return menubar ? 'menuitem' : undefined; },
      onMouseDown(event: MouseEvent) { if (!store().state.open) {
        mouseUp.start(200, () => { store().context.allowMouseUpTriggerRef.current = true; });
        listenForMouseUp(event.currentTarget as HTMLElement);
      } },
    }, store().state.filterTriggerProps, mixed, nativeProps, button.getButtonProps, childProps]; },
  };
  if (menubar) return <CompositeItem tag="button" render={props.render} class={props.class} style={props.style}
    state={state} stateAttributesMapping={pressableTriggerMapping} refs={parameters.ref} props={parameters.props} />;
  const host = createRenderElement('button', props, parameters);
  return <>
    <Show when={open()}><MenuTriggerFocusGuard context={() => store().context} slot="beforeTriggerFocusGuardRef" onFocus={guards.handlePreFocusGuardFocus} /></Show>
    {host}
    <Show when={open()}><MenuTriggerFocusGuard context={() => store().context} slot="triggerFocusTargetRef" onFocus={guards.handleFocusTargetFocus} /></Show>
  </>;
}
/** Direct native guard refs have no null-on-disposal notification in RC13.
 * Keep cell ownership in setup, and follow detached handle migrations without
 * changing the native guard or reading reactive stores from a ref callback. */
function MenuTriggerFocusGuard(props: {
  context(): Pick<MenuStoreContext, 'beforeTriggerFocusGuardRef' | 'triggerFocusTargetRef'>;
  slot: 'beforeTriggerFocusGuardRef' | 'triggerFocusTargetRef';
  onFocus(event: FocusEvent): void;
}) {
  let node: HTMLElement | null = null;
  let cell: { current: HTMLElement | null } | undefined;
  const clear = () => { if (cell?.current === node) cell.current = null; cell = undefined; };
  createEffect(() => props.context()[props.slot], next => {
    cell = next;
    if (node) next.current = node;
    return clear;
  });
  return <FocusGuard onFocus={props.onFocus} ref={(next: HTMLElement | null) => {
    if (cell?.current === node) cell.current = null;
    node = next;
    if (cell) cell.current = next;
  }} />;
}
export namespace MenuTrigger { export type Props<Payload = unknown> = MenuTriggerProps<Payload>; export type State = MenuTriggerState }
