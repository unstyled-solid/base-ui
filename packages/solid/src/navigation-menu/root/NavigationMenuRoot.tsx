import { createEffect, createMemo, createSignal, omit, onCleanup, onSettled, untrack } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { createControlled } from '../../utils/createControlled';
import { createBaseUiId } from '../../internals/createBaseUiId';
import { createUnmountAfterClose } from '../../internals/createUnmountAfterClose';
import { createOpenChangeComplete } from '../../internals/createOpenChangeComplete';
import { createRenderElement } from '../../internals/createRenderElement';
import { createChangeEventDetails, type BaseUIChangeEventDetails } from '../../internals/createBaseUIEventDetails';
import type { BaseUIComponentProps } from '../../internals/types';
import { createFloatingRoot } from '../../floating-ui-react/components/createFloatingRoot';
import { createFloatingTree } from '../../floating-ui-react/components/createFloatingTree';
import { FloatingNode, FloatingTreeContext, useFloatingParentNodeId, useFloatingTree } from '../../floating-ui-react/components/FloatingTree';
import { activeElement, contains, getTarget } from '../../floating-ui-react/utils/element';
import { NavigationMenuRootContext, NavigationMenuTreeContext, useNavigationMenuRootContext } from './NavigationMenuRootContext';
import { createNavigationMenuSizing } from '../utils/createNavigationMenuSizing';
import { preserveClosingSize } from '../utils/setSharedFixedSize';
import { CLOSE_DELAY, OPEN_DELAY } from '../utils/constants';
import type { FloatingRootContext, LogicalLayer } from '../../internals/contracts/floating';

export function NavigationMenuRoot<Value = any>(props: NavigationMenuRoot.Props<Value>): JSX.Element {
  const parent = useNavigationMenuRootContext(true);
  const parentNodeId = useFloatingParentNodeId();
  const inheritedTree = useFloatingTree();
  const nested = parentNodeId != null;
  const id = createBaseUiId();
  const tree = nested ? inheritedTree ?? parent?.tree ?? createFloatingTree() : createFloatingTree();
  const [preventUnmount, setPreventUnmount] = createSignal(false);
  const [root, setRoot] = createSignal<HTMLElement | null>(null, { ownedWrite: true });
  const [popup, setPopup] = createSignal<HTMLElement | null>(null, { ownedWrite: true });
  const [positioner, setPositioner] = createSignal<HTMLElement | null>(null, { ownedWrite: true });
  const [viewport, setViewport] = createSignal<HTMLElement | null>(null, { ownedWrite: true });
  const [target, setTarget] = createSignal<HTMLElement | null>(null, { ownedWrite: true });
  const [inert, setInert] = createSignal<{ token: object; inert: boolean } | null>(null);
  const [direction, setDirection] = createSignal<NavigationMenuRootContext['activationDirection']>(null);
  const [activeFloating, setActiveFloating] = createSignal<FloatingRootContext | null>(null, { ownedWrite: true });
  const [logicalLayer, setLogicalLayer] = createSignal<LogicalLayer | null>(null, { ownedWrite: true });
  let layerOwner: object | null = null;
  type Entry = { readonly value: Value; readonly element: HTMLElement | null };
  const [triggers, setTriggers] = createSignal<readonly Entry[]>([], { ownedWrite: true });
  const [contents, setContents] = createSignal<readonly Entry[]>([], { ownedWrite: true });
  let lastTrigger: HTMLElement | null = null;
  let candidate: { value: Value; element: HTMLElement } | null = null;
  let closeReason: string | undefined;
  const requests = new WeakMap<Event, { value: Value | null; accepted: boolean }>();
  const model = createControlled<Value | null, NavigationMenuRoot.ChangeEventDetails>({
    value: () => props.value,
    defaultValue: untrack(() => props.defaultValue ?? null),
    onChange: () => (next, details) => { if (next !== model.value()) props.onValueChange?.(next, details); },
    name: 'NavigationMenu', state: 'value',
  });
  const open = () => model.value() != null;
  const valueToken = createMemo<{ value: Value | null }>((previous) => {
    const value = model.value();
    return previous && previous.value === value ? previous : { value };
  });
  const presence = createUnmountAfterClose({ open, ref: popup, preventUnmountOnClose: preventUnmount, setPreventUnmountOnClose: setPreventUnmount, onUnmount: completeClose });
  const activeTrigger = () => triggers().find((entry) => entry.value === model.value())?.element ?? null;
  const currentContent = () => {
    const value = model.value(); const entries = contents();
    for (let index = entries.length - 1; index >= 0; index -= 1) {
      const entry = entries[index];
      if (entry.value === value && entry.element != null) return entry.element;
    }
    return null;
  };
  const guards: NavigationMenuRootContext['guards'] = { beforeInside: null, afterInside: null, beforeOutside: null, afterOutside: null };
  const floating = createFloatingRoot({
    nested,
    state: {
      get open() { return open(); },
      get transitionStatus() { return presence.transitionStatus; },
      get domReferenceElement() { return activeTrigger() ?? candidate?.element ?? lastTrigger; },
      get referenceElement() { return activeTrigger() ?? candidate?.element ?? lastTrigger; },
      get positionReference() { return activeTrigger() ?? candidate?.element ?? lastTrigger; },
      get floatingElement() { return positioner() ?? viewport(); },
      get floatingId() { return popup()?.id; },
    },
    onOpenChange(next, details) {
      const target = getTarget(details.event) as Element | null;
      const entry = triggers().find((trigger) => contains(trigger.element, target))
        ?? triggers().find((trigger) => contains(trigger.element, details.trigger));
      if (!next && entry && entry.value !== model.value()) { details.cancel(); return; }
      const proposal = entry ?? (candidate?.element.isConnected ? candidate : null);
      const accepted = !next ? setValue(null, details as NavigationMenuRoot.ChangeEventDetails)
        : proposal ? setValue(proposal.value, details as NavigationMenuRoot.ChangeEventDetails) : false;
      if (!accepted) details.cancel();
    },
  });
  function setValue(next: Value | null, details: Omit<NavigationMenuRoot.ChangeEventDetails, 'preventUnmountOnClose'>) {
    const existing = requests.get(details.event);
    if (existing && existing.value === next) return existing.accepted;
    let prevent = false;
    // Preserve native detail getters and cancellation identity, including nested bubbling.
    const extended = Object.assign(details, { preventUnmountOnClose() { prevent = true; } });
    const previous = model.value();
    const result = model.request(next, extended as NavigationMenuRoot.ChangeEventDetails);
    requests.set(details.event, { value: next, accepted: result.accepted });
    if (!result.accepted) return false;
    if (next == null) {
      closeReason = details.reason;
      if (previous != null) setPreventUnmount(prevent);
      setDirection(null);
      setActiveFloating(null);
    }
    if (nested && next == null && details.reason === 'link-press') parent?.setValue(null, details);
    return true;
  }
  function completeClose() {
    const element = popup();
    if (element && lastTrigger && !['trigger-hover', 'outside-press', 'focus-out'].includes(closeReason ?? '')) {
      const focused = activeElement(element.ownerDocument);
      if (focused === element.ownerDocument.body || contains(element, focused)) lastTrigger.focus({ preventScroll: true });
    }
    setDirection(null);
    closeReason = undefined;
    props.onOpenChangeComplete?.(false);
  }
  createOpenChangeComplete({ ref: target, open, enabled: () => presence.mounted && !open() && !presence.preventUnmountingOnClose, onComplete: () => { if (!open()) presence.forceUnmount(); } });
  createEffect(() => ({ open: open(), trigger: activeTrigger(), popup: popup(), positioner: positioner() }), (state) => {
    if (state.open) {
      if (state.trigger) lastTrigger = state.trigger;
    } else if (state.popup && state.positioner) preserveClosingSize(state.popup, state.positioner);
  });
  const context: NavigationMenuRootContext<Value> = {
    get value() { return model.value(); }, get open() { return open(); },
    get mounted() { return presence.mounted; }, get transitionStatus() { return presence.transitionStatus; },
    nested, get delay() { return props.delay ?? OPEN_DELAY; }, get closeDelay() { return props.closeDelay ?? CLOSE_DELAY; },
    get orientation() { return props.orientation ?? 'horizontal'; },
    get activationDirection() { return open() ? direction() : null; },
    get rootElement() { return root(); }, get popupElement() { return popup(); },
    get positionerElement() { return positioner(); }, get viewportElement() { return viewport(); },
    get viewportTargetElement() { return target(); }, get currentContent() { return currentContent(); },
    get activeTrigger() { return activeTrigger() ?? lastTrigger; },
    get viewportInert() { const state = inert(); return state?.token === valueToken() && state.inert; },
    get floatingRootContext() { return activeFloating() ?? floating; }, setFloatingRootContext: setActiveFloating,
    get logicalLayer() { return logicalLayer(); },
    registerLogicalLayer(layer) {
      const token = {}; layerOwner = token; setLogicalLayer(layer);
      return () => { if (layerOwner === token) { layerOwner = null; setLogicalLayer(null); } };
    },
    tree, get nodeId() { return id(); }, guards,
    setValue, setRootElement: setRoot, setPopupElement: setPopup, setPositionerElement: setPositioner,
    setViewportElement: setViewport, setViewportTargetElement: setTarget,
    setViewportInert(value) { setInert({ token: valueToken(), inert: value }); },
    registerTrigger(entry) { setTriggers((entries) => [...entries, entry]); return () => setTriggers((entries) => entries.filter((item) => item !== entry)); },
    registerContent(entry) { setContents((entries) => [...entries, entry]); return () => setContents((entries) => entries.filter((item) => item !== entry)); },
    prepareActivation(value, element) { sizing.prepareActivation(value); candidate = { value, element }; context.activate(element); },
    activate(element) {
      const before = lastTrigger?.getBoundingClientRect();
      const after = element.getBoundingClientRect();
      if (presence.mounted && before) {
        if (context.orientation === 'horizontal' && before.left !== after.left) setDirection(after.left > before.left ? 'right' : 'left');
        else if (context.orientation === 'vertical' && before.top !== after.top) setDirection(after.top > before.top ? 'down' : 'up');
      }
    },
  };
  const sizing = createNavigationMenuSizing(context);
  const actions: NavigationMenuRoot.Actions = { unmount: presence.forceUnmount, close: () => { setValue(null, createChangeEventDetails('imperative-action')); } };
  createEffect(() => props.actionsRef, (ref) => {
    if (typeof ref === 'function') ref(actions);
    else if (ref) ref.current = actions;
    return () => { if (typeof ref === 'function') ref(null); else if (ref?.current === actions) ref.current = null; };
  });
  onSettled(() => {
    // Tree nodes expose a writable context slot to the positioning wrapper.
    // Keep the fallback live without making that slot a getter-only property.
    const fallback: FloatingRootContext = {
      get state() { return context.floatingRootContext.state; },
      get nested() { return context.floatingRootContext.nested; },
      get triggerElements() { return context.floatingRootContext.triggerElements; },
      get events() { return context.floatingRootContext.events; },
      get data() { return context.floatingRootContext.data; },
      setOpen: (next, details) => context.floatingRootContext.setOpen(next, details),
      dispatchOpenChange: (next, details) => context.floatingRootContext.dispatchOpenChange(next, details),
    };
    const node = { id: id(), parentId: parentNodeId, context: fallback };
    tree.addNode(node);
    return () => tree.removeNode(node);
  });
  onCleanup(() => { lastTrigger = null; candidate = null; });
  const elementProps = omit(props, 'value', 'defaultValue', 'onValueChange', 'actionsRef', 'onOpenChangeComplete', 'delay', 'closeDelay', 'orientation', 'class', 'style', 'render', 'ref');
  const state: NavigationMenuRoot.State = { get open() { return open(); }, nested };
  // Component setup is untracked. Do not create the render primitives inside a
  // provider's tracked children expression: changing open would recreate the
  // entire root host and its triggers, losing native hover/focus ownership.
  const RootHost = () => createRenderElement(nested ? 'div' : 'nav', props, { state, get ref() { return [props.ref, setRoot]; }, props: elementProps });
  return <FloatingTreeContext value={tree}><NavigationMenuRootContext value={context}><NavigationMenuTreeContext value={id()}>
    <FloatingNode id={id()}>
      <RootHost />
    </FloatingNode>
  </NavigationMenuTreeContext></NavigationMenuRootContext></FloatingTreeContext>;
}

export interface NavigationMenuRootState { open: boolean; nested: boolean }
export interface NavigationMenuRootActions { close(): void; unmount(): void }
export type NavigationMenuRootChangeEventReason = 'trigger-press' | 'trigger-hover' | 'outside-press' | 'list-navigation' | 'focus-out' | 'escape-key' | 'link-press' | 'imperative-action' | 'none';
export type NavigationMenuRootChangeEventDetails = BaseUIChangeEventDetails<NavigationMenuRootChangeEventReason> & { preventUnmountOnClose(): void };
export interface NavigationMenuRootProps<Value = any> extends BaseUIComponentProps<'nav', NavigationMenuRootState> {
  value?: Value | null; defaultValue?: Value | null;
  onValueChange?(value: Value | null, details: NavigationMenuRootChangeEventDetails): void;
  actionsRef?: ((actions: NavigationMenuRootActions | null) => void) | { current: NavigationMenuRootActions | null };
  onOpenChangeComplete?(open: boolean): void;
  delay?: number; closeDelay?: number; orientation?: 'horizontal' | 'vertical';
}
export namespace NavigationMenuRoot {
  export type Props<T = any> = NavigationMenuRootProps<T>;
  export type Value<T = any> = T | null;
  export type State = NavigationMenuRootState;
  export type Actions = NavigationMenuRootActions;
  export type ChangeEventReason = NavigationMenuRootChangeEventReason;
  export type ChangeEventDetails = NavigationMenuRootChangeEventDetails;
}
