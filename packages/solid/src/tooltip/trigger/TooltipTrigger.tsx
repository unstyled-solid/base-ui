import { createEffect, createSignal, merge, omit, untrack } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { isElement } from '@floating-ui/utils/dom';
import type { BaseUIComponentProps } from '../../internals/contracts/render';
import type { BaseUIEvent } from '../../internals/contracts/events';
import { createRenderElement } from '../../internals/createRenderElement';
import { createBaseUiId } from '../../internals/createBaseUiId';
import { createChangeEventDetails } from '../../internals/createBaseUIEventDetails';
import { createTimeout } from '../../utils/createTimeout';
import { createTriggerDataForwarding } from '../../utils/popups/createTriggerDataForwarding';
import { createFocus } from '../../floating-ui-react/hooks/createFocus';
import { createDelayGroup } from '../../floating-ui-react/components/FloatingDelayGroup';
import { createHoverReferenceInteraction } from '../../floating-ui-react/hooks/createHoverReferenceInteraction';
import { createHoverInteractionSharedState } from '../../floating-ui-react/hooks/createHoverInteractionSharedState';
import { safePolygon } from '../../floating-ui-react/safePolygon';
import { closest, contains, getTarget } from '../../floating-ui-react/utils/element';
import { isMouseLikePointerType } from '../../floating-ui-react/utils/event';
import { useTooltipRootContext } from '../root/TooltipRootContext';
import { useTooltipProviderContext } from '../provider/TooltipProviderContext';
import type { TooltipHandle } from '../store/TooltipHandle';
import type { TooltipStore } from '../store/TooltipStore';
import { OPEN_DELAY, TOOLTIP_TRIGGER_IDENTIFIER } from '../utils/constants';
import type { TooltipRenderProps } from '../utils/types';

export function TooltipTrigger<Payload = unknown>(props: TooltipTriggerProps<Payload>): JSX.Element {
  const elementProps = omit(props, 'render', 'class', 'style', 'ref', 'handle', 'payload', 'disabled', 'delay', 'closeOnClick', 'closeDelay', 'id', 'onFocus', 'onBlur');
  const root = useTooltipRootContext(true);
  if (!root && !untrack(() => props.handle)) {
    throw new Error('Base UI: <Tooltip.Trigger> must be either used within a <Tooltip.Root> component or provided with a handle.');
  }
  const store = () => (props.handle?.store ?? root) as TooltipStore<Payload> | null;
  const requiredStore = () => {
    const value = store();
    if (!value) throw new Error('Base UI: <Tooltip.Trigger> must be either used within a <Tooltip.Root> component or provided with a handle.');
    return value;
  };
  // The shared interaction owner follows this accessor, including emitter cleanup
  // when a detached trigger migrates. Never capture an old root's event emitter.
  const context = () => requiredStore().state.floatingRootContext;
  const id = createBaseUiId(() => typeof props.id === 'string' ? props.id : undefined);
  const [element, setElement] = createSignal<HTMLElement | null>(null, { ownedWrite: true });
  const providerDelay = useTooltipProviderContext();
  const isActive = () => requiredStore().state.activeTriggerId === id();
  const isOpen = () => requiredStore().state.open && isActive();
  const group = createDelayGroup(context, { get open() { return isOpen(); } });
  const hoverState = createHoverInteractionSharedState(context);
  const nestedTimeout = createTimeout();
  let nestedHovered = false;
  let pointerType: string | undefined;
  const disabled = () => props.disabled ?? requiredStore().disabled;
  const enabled = () => !disabled() && !requiredStore().disabled;
  const getOpenDelay = () => group.hasProvider && group.activeIdRef.current != null
    ? 0 : props.delay ?? providerDelay?.() ?? OPEN_DELAY;
  const data = {
    get payload() { return props.payload; },
    get closeOnClick() { return props.closeOnClick ?? true; },
    // Upstream floating-side delay is the trigger's own delay, defaulting to zero.
    get closeDelay() { return props.closeDelay ?? 0; },
    get isInstantPhase() { return group.isInstantPhase; },
  };
  const registration = createTriggerDataForwarding({
    store: requiredStore,
    id,
    get payload() { return props.payload; },
    get closeOnClick() { return props.closeOnClick ?? true; },
    get closeDelay() { return props.closeDelay ?? 0; },
  });
  createEffect(() => ({ store: requiredStore(), id: id() }), value => value.store.registerTooltipData(value.id, data));

  function nestedTarget(target: EventTarget | null) {
    const trigger = element();
    if (!trigger || !isElement(target)) return false;
    const nearest = closest(target, `[${TOOLTIP_TRIGGER_IDENTIFIER}]`);
    return nearest !== null && nearest !== trigger && contains(trigger, nearest);
  }
  function detectNested(event: MouseEvent) {
    const wasNested = nestedHovered;
    const target = getTarget(event);
    nestedHovered = nestedTarget(target);
    if (nestedHovered) {
      hoverState.openChangeTimeout.clear();
      hoverState.restTimeout.clear();
      hoverState.restTimeoutPending = false;
      nestedTimeout.clear();
      if (requiredStore().state.open && requiredStore().lastOpenChangeReason === 'trigger-hover') {
        requiredStore().setOpen(false, createChangeEventDetails('trigger-hover', event));
      }
      return;
    }
    const trigger = element();
    if (wasNested && trigger && isElement(target) && contains(trigger, target)
      && enabled() && !requiredStore().state.open && isMouseLikePointerType(pointerType)) {
      const open = () => {
        if (!nestedHovered && enabled() && !requiredStore().state.open && element() === trigger) {
          requiredStore().setOpen(true, createChangeEventDetails('trigger-hover', event, trigger));
        }
      };
      const delay = getOpenDelay();
      if (delay === 0) { nestedTimeout.clear(); open(); }
      else nestedTimeout.start(delay, open);
    }
  }
  const polygon = safePolygon();
  const hover = createHoverReferenceInteraction(context, {
    get enabled() { return enabled(); },
    mouseOnly: true,
    move: false,
    get handleClose() { return !requiredStore().disableHoverablePopup && requiredStore().trackCursorAxis !== 'both' ? polygon : null; },
    restMs: getOpenDelay,
    delay: () => ({ close: props.closeDelay ?? (group.hasProvider
      ? (typeof group.delayRef.current === 'number' ? group.delayRef.current : group.delayRef.current.close) ?? 0 : 0) }),
    triggerElement: element,
    isActiveTrigger: isActive,
    isClosing: () => requiredStore().state.transitionStatus === 'ending',
    shouldOpen: () => !nestedHovered,
  });
  const focus = createFocus(context, { get enabled() { return enabled(); } });
  // Root/handle migration must invalidate the local nested reopening timeout too.
  createEffect(() => ({ store: requiredStore(), id: id(), enabled: enabled() }), () => {
    nestedTimeout.clear();
    return () => { nestedTimeout.clear(); nestedHovered = false; pointerType = undefined; };
  });
  const state: TooltipTriggerState = { get open() { return isOpen(); } };
  const rootTriggerProps = merge(() => {
    const model = requiredStore();
    // Closed, unmounted triggers have no root interactions unless tracking the cursor.
    return registration.isMountedByThisTrigger || model.trackCursorAxis !== 'none'
      ? isActive() ? model.state.activeTriggerProps : model.state.inactiveTriggerProps : undefined;
  });
  const ownProps = {
    get id() { return id(); },
    get 'data-trigger-disabled'() { return disabled() ? '' : undefined; },
    get [TOOLTIP_TRIGGER_IDENTIFIER]() { return disabled() ? undefined : ''; },
    onMouseOver: detectNested,
    onFocusIn(event: BaseUIEvent<FocusEvent>) {
      if (nestedTarget(getTarget(event))) event.preventBaseUIHandler();
    },
    onMouseLeave() { nestedHovered = false; nestedTimeout.clear(); pointerType = undefined; },
    onPointerEnter(event: PointerEvent) { pointerType = event.pointerType; },
    onPointerDown(event: PointerEvent) {
      pointerType = event.pointerType;
      const model = requiredStore();
      model.setCloseOnClickSource(data);
      if ((props.closeOnClick ?? true) && !model.state.open) model.cancelPendingOpen(event);
    },
    onClick(event: MouseEvent) {
      const model = requiredStore();
      if ((props.closeOnClick ?? true) && !model.state.open) model.cancelPendingOpen(event);
    },
  };
  return createRenderElement('button', props, {
    state,
    get ref() { return [props.ref, setElement, registration.registerTrigger]; },
    stateAttributesMapping: { open: value => value ? { 'data-popup-open': '' } : null },
    // React's onFocus/onBlur chain runs on the native bubbling focusin/out
    // event. Keep consumer prevention and nested-trigger prevention in that
    // same chain, including the exact event forwarded to onOpenChange.
    props: [hover, merge(() => focus.reference), rootTriggerProps, ownProps, {
      get onFocusIn() { return props.onFocus; },
      get onFocusOut() { return props.onBlur; },
    }, elementProps],
  });
}
export interface TooltipTriggerState { open: boolean; }
export interface TooltipTriggerProps<Payload = unknown> extends BaseUIComponentProps<'button', TooltipTriggerState, TooltipRenderProps> {
  handle?: TooltipHandle<Payload>;
  payload?: Payload;
  delay?: number;
  closeOnClick?: boolean;
  closeDelay?: number;
  disabled?: boolean;
}
export namespace TooltipTrigger {
  export type State = TooltipTriggerState;
  export type Props<Payload = unknown> = TooltipTriggerProps<Payload>;
}
