import { createEffect, createSignal, omit, onCleanup, onSettled, Show, untrack } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { CompositeItem } from '../../internals/composite';
import { createButton } from '../../internals/use-button';
import { createChangeEventDetails } from '../../internals/createBaseUIEventDetails';
import { createClick } from '../../floating-ui-react/hooks/createClick';
import { createFloatingRoot } from '../../floating-ui-react/components/createFloatingRoot';
import { createHoverReferenceInteraction } from '../../floating-ui-react/hooks/createHoverReferenceInteraction';
import { createHoverInteractionSharedState, applySafePolygonPointerEventsMutation, clearSafePolygonPointerEventsMutation } from '../../floating-ui-react/hooks/createHoverInteractionSharedState';
import { safePolygon } from '../../floating-ui-react/safePolygon';
import { closest, contains } from '../../floating-ui-react/utils/element';
import { getNextTabbable, getPreviousTabbable, getTabbableNearElement, isOutsideEvent } from '../../floating-ui-react/utils/tabbable';
import { createTimeout } from '../../utils/createTimeout';
import { ownerVisuallyHidden, PATIENT_CLICK_THRESHOLD } from '../../internals/constants';
import { useDirection } from '../../internals/direction-context/DirectionContext';
import type { BaseUIComponentProps, NativeButtonProps } from '../../internals/types';
import { useNavigationMenuRootContext } from '../root/NavigationMenuRootContext';
import { useNavigationMenuItemContext } from '../item/NavigationMenuItemContext';
import { useNavigationMenuDismissContext } from '../list/NavigationMenuDismissContext';
import { isOutsideMenuEvent } from '../utils/isOutsideMenuEvent';
import { NAVIGATION_MENU_TRIGGER_IDENTIFIER } from '../utils/constants';
import { pressableTriggerOpenStateMapping } from '../../utils/popupStateMapping';
import { NavigationMenuFocusGuard } from '../viewport/NavigationMenuFocusGuard';

export function NavigationMenuTrigger(props: NavigationMenuTrigger.Props) {
  const root = useNavigationMenuRootContext();
  const item = useNavigationMenuItemContext();
  const dismiss = useNavigationMenuDismissContext();
  const direction = useDirection();
  const [element, setElement] = createSignal<HTMLElement | null>(null, { ownedWrite: true });
  const [patient, setPatient] = createSignal(false);
  const timeout = createTimeout();
  let pointerType = '';
  const active = () => root.open && root.value === item.value;
  const floating = () => root.positionerElement ?? root.viewportElement;
  const interactionsEnabled = () => !props.disabled && (!!root.positionerElement || root.value == null);
  // Every trigger owns its interaction provenance and timers. Only the active
  // trigger's context is published to the list/positioner, as in the source.
  const context = createFloatingRoot({ nested: root.nested, state: {
    get open() { return root.open; }, get transitionStatus() { return root.transitionStatus; },
    get domReferenceElement() { return element(); }, get referenceElement() { return element(); },
    get positionReference() { return element(); }, get floatingElement() { return floating(); },
    get floatingId() { return root.popupElement?.id; },
  }, onOpenChange(next, details) {
    if (!interactionsEnabled() || pointerType === 'touch' && details.reason === 'trigger-hover' || !next && root.value !== item.value) { details.cancel(); return; }
    if (details.reason === 'trigger-hover') { setPatient(false); timeout.start(PATIENT_CLICK_THRESHOLD, () => setPatient(true)); }
    if (!root.setValue(next ? item.value : null, details as import('../root/NavigationMenuRoot').NavigationMenuRoot.ChangeEventDetails)) details.cancel();
    if (!next) pointerType = '';
  } });
  const hoverState = createHoverInteractionSharedState(context);
  const getScope = () => root.nested && root.positionerElement ? null : closest(element(), 'ul');
  const hover = createHoverReferenceInteraction(context, {
    get enabled() { return !props.disabled && pointerType !== 'touch' && (!!floating() || root.value == null); },
    move: false,
    get restMs() { return root.mounted && root.positionerElement ? 0 : root.delay; },
    get delay() { return { close: root.closeDelay }; },
    triggerElement: element,
    handleClose: safePolygon({ get blockPointerEvents() { return pointerType !== 'touch'; }, getScope }),
    getHandleCloseContext() {
      const trigger = element(); const popup = floating();
      if (!root.nested || root.positionerElement || !trigger || !popup) return null;
      const a = trigger.getBoundingClientRect(); const b = popup.getBoundingClientRect();
      const x = b.left + b.width / 2 - a.left - a.width / 2;
      const y = b.top + b.height / 2 - a.top - a.height / 2;
      const placement = Math.abs(x) >= Math.abs(y) ? (x >= 0 ? 'right' : 'left') : (y >= 0 ? 'bottom' : 'top');
      return { placement, elements: { domReference: trigger, floating: popup }, nodeId: root.nodeId };
    },
  });
  const click = createClick(context, {
    get enabled() { return interactionsEnabled(); }, get toggle() { return active(); },
    get stickIfOpen() { return !patient(); },
  });
  const button = createButton({ get disabled() { return props.disabled ?? false; }, focusableWhenDisabled: true, get native() { return props.nativeButton ?? true; } });
  onSettled(() => root.registerTrigger({ get value() { return item.value; }, get element() { return element(); } }));
  onCleanup(() => clearSafePolygonPointerEventsMutation(hoverState));
  createEffect(active, (isActive) => {
    timeout.clear(); setPatient(false);
    if (isActive) timeout.start(PATIENT_CLICK_THRESHOLD, () => setPatient(true));
    else clearSafePolygonPointerEventsMutation(hoverState);
  });
  createEffect(() => ({ open: root.open, active: active(), element: element() }), (state) => {
    if (state.active) root.setFloatingRootContext(context);
    if (!state.open) {
      pointerType = ''; context.data.openEvent = undefined;
      hoverState.pointerType = undefined; hoverState.interactedInside = false; hoverState.restTimeoutPending = false;
      hoverState.openChangeTimeout.clear(); hoverState.restTimeout.clear();
      clearSafePolygonPointerEventsMutation(hoverState);
    }
  });
  onCleanup(() => untrack(() => { if (root.floatingRootContext === context) root.setFloatingRootContext(null); }));
  function prepare(event: MouseEvent) {
    if (props.disabled || pointerType === 'touch' && event.type !== 'click') return;
    const trigger = event.currentTarget as HTMLElement;
    const switching = root.value != null && root.value !== item.value;
    root.prepareActivation(item.value, trigger);
    if (event.type !== 'click' && root.value != null) context.data.openEvent = undefined;
    if (switching) {
      root.setValue(item.value, event.type === 'mouseenter' ? createChangeEventDetails('trigger-hover', event) : createChangeEventDetails('trigger-press', event));
    }
    const popup = floating();
    if (event.type === 'mouseenter' && pointerType !== 'touch' && (!root.nested || !root.positionerElement) && popup) {
      const apply = () => {
        if (!trigger.isConnected || props.disabled || pointerType === 'touch') return;
        applySafePolygonPointerEventsMutation(hoverState, { scopeElement: getScope() ?? trigger.ownerDocument.body, referenceElement: trigger, floatingElement: popup });
      };
      if (switching) queueMicrotask(apply);
      else apply();
    }
  }
  const defaults: JSX.HTMLAttributes<HTMLElement> = {
    tabindex: 0,
    get 'aria-expanded'() { return active() ? 'true' : 'false'; }, get 'aria-controls'() { return active() ? root.popupElement?.id : undefined; },
    onMouseEnter: prepare, onClick: prepare,
    onPointerEnter(event) { pointerType = event.pointerType; },
    onPointerDown(event) { pointerType = event.pointerType; clearSafePolygonPointerEventsMutation(hoverState); },
    onMouseLeave() { if (!root.open) clearSafePolygonPointerEventsMutation(hoverState); },
    onFocus() { if (active()) root.setViewportInert(false); },
    onKeyDown(event) {
      if (props.disabled || root.nested) return;
      const key = root.orientation === 'horizontal' ? 'ArrowDown' : direction() === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
      if (event.key !== key) return;
      root.prepareActivation(item.value, event.currentTarget);
      root.setValue(item.value, createChangeEventDetails('list-navigation', event));
      event.preventDefault(); event.stopPropagation();
    },
    onBlur(event) { if (root.positionerElement && root.popupElement && isOutsideMenuEvent(event, root)) root.setValue(null, createChangeEventDetails('focus-out', event)); },
  };
  const state = { get open() { return active(); }, get disabled() { return props.disabled ?? false; } };
  const rest = omit(props, 'nativeButton', 'disabled', 'class', 'style', 'render', 'ref');
  return <>
    <CompositeItem tag="button" render={props.render} class={props.class} style={props.style}
      state={state} stateAttributesMapping={pressableTriggerOpenStateMapping}
      refs={[props.ref, setElement, button.buttonRef]}
      props={[click.reference, hover, dismiss?.reference, defaults, { tabIndex: undefined, [NAVIGATION_MENU_TRIGGER_IDENTIFIER]: '' }, rest, button.getButtonProps]} />
    <Show when={active()}>
      <NavigationMenuFocusGuard slot="beforeOutside" onFocus={(event) => {
        const popup = floating();
        if (popup && isOutsideEvent(event, popup)) root.guards.beforeInside?.focus();
        else getPreviousTabbable(element())?.focus();
      }} />
      <span aria-owns={root.viewportElement?.id} style={ownerVisuallyHidden} />
      <NavigationMenuFocusGuard slot="afterOutside" onFocus={(event) => {
        const popup = floating();
        if (popup && isOutsideEvent(event, popup)) {
          root.setViewportInert(false);
          // Native focus cannot wait for a staged inert attribute update.
          root.viewportElement?.removeAttribute('inert');
          (root.guards.afterInside ?? element())?.focus();
        } else {
          let next = getNextTabbable(element());
          if (root.nested && !root.positionerElement && popup && contains(popup, next)) next = getTabbableNearElement(root.guards.afterInside, 1);
          next?.focus();
          if ((!root.nested || root.positionerElement) && !contains(root.rootElement, next)) root.setValue(null, createChangeEventDetails('focus-out', event));
        }
      }} />
    </Show>
  </>;
}
export interface NavigationMenuTriggerState { open: boolean; disabled: boolean }
export interface NavigationMenuTriggerProps extends NativeButtonProps, BaseUIComponentProps<'button', NavigationMenuTriggerState> { disabled?: boolean }
export namespace NavigationMenuTrigger { export type State = NavigationMenuTriggerState; export type Props = NavigationMenuTriggerProps }
