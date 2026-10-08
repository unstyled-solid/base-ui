import { createEffect, createSignal, merge, omit, Show } from 'solid-js';
import { createBaseUiId } from '../../internals/createBaseUiId';
import { createRenderElement } from '../../internals/createRenderElement';
import { createButton } from '../../internals/use-button/useButton';
import { createClick } from '../../floating-ui-react/hooks/createClick';
import { createHoverReferenceInteraction } from '../../floating-ui-react/hooks/createHoverReferenceInteraction';
import { safePolygon } from '../../floating-ui-react/safePolygon';
import { createTriggerDataForwarding } from '../../utils/popups';
import { createOpenMethodTriggerProps } from '../../utils/createOpenInteractionType';
import type { BaseUIComponentProps } from '../../internals/contracts/render';
import type { FloatingRootContext } from '../../internals/contracts/floating';
import type { PopoverHandle } from '../store/PopoverHandle';
import type { PopoverHandleStore } from '../store/PopoverStore';
import type { PopoverInteraction } from '../store/PopoverPolicy';
import { usePopoverRootContext } from '../root/PopoverRootContext';
import { OPEN_DELAY } from '../utils/state';
import { CLICK_TRIGGER_IDENTIFIER } from '../../internals/constants';
import { FocusGuard } from '../../utils/FocusGuard';
import { createTriggerFocusGuards } from '../../utils/popups/createTriggerFocusGuards';

export function PopoverTrigger<Payload = unknown>(props: PopoverTriggerProps<Payload>) {
  const root = usePopoverRootContext(true);
  const store = (): PopoverHandleStore<Payload> => {
    const model = props.handle?.store ?? root;
    if (!model) throw new Error('Base UI: <Popover.Trigger> must be either used within a <Popover.Root> component or provided with a handle.');
    return model as PopoverHandleStore<Payload>;
  };
  const id = createBaseUiId(() => props.id);
  const [element, setElement] = createSignal<HTMLElement | null>(null);
  // Current interaction APIs accept a live context accessor and own listener migration.
  const context = (): FloatingRootContext => store().state.floatingRootContext;
  createTriggerDataForwarding(id, element, store, {
    get payload() { return props.payload; },
    get disabled() { return props.disabled ?? false; },
    get openOnHover() { return props.openOnHover ?? false; },
    get closeDelay() { return props.closeDelay ?? 0; },
  });
  const active = () => store().state.activeTriggerId === id();
  const opened = () => store().state.open && active();
  const click = createClick(context, {
    get enabled() { return !props.disabled; },
    get stickIfOpen() { return store().policy?.stickIfOpen ?? true; },
  });
  const hover = createHoverReferenceInteraction(context, {
    get enabled() { return !props.disabled && !!props.openOnHover &&
      !(store().policy?.openMethod === 'touch' && store().policy?.openChangeReason === 'trigger-press'); },
    mouseOnly: true, move: false, handleClose: safePolygon(),
    get restMs() { return props.delay ?? OPEN_DELAY; },
    get delay() { return { close: props.closeDelay ?? 0 }; },
    triggerElementRef: element,
    get isActiveTrigger() { return active(); },
    isClosing: () => store().state.transitionStatus === 'ending',
  });
  const interaction = createOpenMethodTriggerProps(
    () => store().state.open,
    (method: PopoverInteraction) => store().policy?.setOpenMethod(method),
  );
  const button = createButton({
    get disabled() { return props.disabled ?? false; },
    get native() { return props.nativeButton ?? true; },
  });
  const state: PopoverTriggerState = {
    get disabled() { return props.disabled ?? false; },
    get open() { return opened(); },
  };
  const guards = createTriggerFocusGuards(store, element);
  const [beforeGuard, setBeforeGuard] = createSignal<HTMLElement | null>(null);
  const [focusTarget, setFocusTarget] = createSignal<HTMLElement | null>(null);
  createEffect(() => ({ context: store().context, before: beforeGuard(), after: focusTarget() }), (next) => {
    const before = next.context.beforeTriggerFocusGuardRef;
    const after = next.context.triggerFocusTargetRef;
    if (before && next.before) before.current = next.before;
    if (after && next.after) after.current = next.after;
    return () => {
      if (before && before.current === next.before) before.current = null;
      if (after && after.current === next.after) after.current = null;
    };
  });
  const elementProps = omit(props, 'render', 'class', 'style', 'ref', 'id', 'handle', 'payload', 'openOnHover', 'delay', 'closeDelay', 'disabled', 'nativeButton', 'children');
  // Button's prop transform owns event/disabled behavior; keep its rebuilt views out of
  // the child source lifetime. The native view preserves laziness and the original receiver.
  const childProps = omit(props, (key) => key !== 'children');
  const host = createRenderElement('button', props, {
    state,
    get ref() { return [props.ref, button.buttonRef, setElement]; },
    props: [merge(() => click.reference ?? {}), hover,
       merge(() => active() && store().state.mounted ? store().state.activeTriggerProps : store().state.inactiveTriggerProps),
      interaction, {
      [CLICK_TRIGGER_IDENTIFIER]: '',
      get id() { return id(); },
      'aria-haspopup': 'dialog',
       get 'aria-expanded'() { return opened(); },
       get 'aria-controls'() {
         const state = store().state;
         const owns = opened() || (state.open && state.activeTriggerId == null && !state.openedWithoutTrigger && state.triggerCount === 1);
         // Track observer publication even when the selector prefers the raw host's actual ID.
         const floatingId = state.floatingId;
         return owns ? (state.popupElement?.id ?? floatingId) || undefined : undefined;
       },
     }, elementProps, button.getButtonProps, childProps],
    stateAttributesMapping: {
      open(value): Record<string, string> | null {
        if (!value) return null;
        return store().policy?.openChangeReason === 'trigger-press'
          ? { 'data-popup-open': '', 'data-pressed': '' } : { 'data-popup-open': '' };
      },
    },
  });
  return <>
    <Show when={opened() && !store().focusManagerModal}>
      <FocusGuard ref={setBeforeGuard} onFocus={guards.handlePreFocusGuardFocus} />
    </Show>
    {host}
    <Show when={opened() && !store().focusManagerModal}>
      <FocusGuard ref={setFocusTarget} onFocus={guards.handleFocusTargetFocus} />
    </Show>
  </>;
}
export interface PopoverTriggerState { disabled: boolean; open: boolean }
export interface PopoverTriggerProps<Payload = unknown> extends BaseUIComponentProps<'button', PopoverTriggerState> {
  id?: string;
  disabled?: boolean;
  nativeButton?: boolean;
  handle?: PopoverHandle<Payload>;
  payload?: NoInfer<Payload>;
  openOnHover?: boolean;
  delay?: number;
  closeDelay?: number;
}
export namespace PopoverTrigger {
  export type Props<Payload = unknown> = PopoverTriggerProps<Payload>;
  export type State = PopoverTriggerState;
}
