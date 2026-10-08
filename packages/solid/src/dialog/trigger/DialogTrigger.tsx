import { createSignal, merge, omit } from 'solid-js';
import type { BaseUIComponentProps } from '../../internals/types';
import { createBaseUiId } from '../../internals/createBaseUiId';
import { createButton } from '../../internals/use-button/useButton';
import { createRenderElement } from '../../internals/createRenderElement';
import { createClick } from '../../floating-ui-react/hooks/createClick';
import { createTriggerDataForwarding } from '../../utils/popups';
import { createOpenMethodTriggerProps } from '../../utils/createOpenInteractionType';
import { CLICK_TRIGGER_IDENTIFIER } from '../../internals/constants';
import { useDialogRootContext } from '../root/DialogRootContext';
import { triggerOpenStateMapping } from '../../utils/popupStateMapping';
import type { DialogHandle } from '../store/DialogHandle';
import type { DialogHandleStore, InteractionType } from '../store/DialogStore';
import type { FloatingRootContext } from '../../internals/contracts/floating';

export function DialogTrigger<Payload = unknown>(props: DialogTriggerProps<Payload>) {
  const root = useDialogRootContext(true);
  const store = (): DialogHandleStore<Payload> => {
    const value = props.handle?.store ?? root;
    if (!value) throw new Error('Base UI: <Dialog.Trigger> must be used within <Dialog.Root> or provided with a handle.');
    return value as DialogHandleStore<Payload>;
  };
  const id = createBaseUiId(() => props.id);
  const [element, setElement] = createSignal<HTMLElement | null>(null);
  const registration = createTriggerDataForwarding(id, element, store, { get payload() { return props.payload; } });
  const button = createButton({ get disabled() { return props.disabled ?? false; }, get native() { return props.nativeButton ?? true; } });
  // Detached registrations can migrate without replacing the trigger DOM or its interaction owner.
  const context = new Proxy({} as FloatingRootContext, {
    get(_target, key) {
      const current = store().state.floatingRootContext;
      return Reflect.get(current, key, current);
    },
  });
  const click = createClick(context);
  const interactionProps = createOpenMethodTriggerProps(
    () => store().state.open,
    (method: InteractionType) => { if (props.handle) props.handle.setOpenMethod(method); else root?.setOpenMethod(method); },
  );
  const mountedByThisTrigger = () => registration.isMountedByThisTrigger;
  const popupId = () => {
    const current = store().state;
    const ownsOpen = current.open && (current.activeTriggerId === id() ||
      (current.activeTriggerId == null && !current.openedWithoutTrigger && current.triggerCount === 1));
    // The shared rendered-ID publisher invalidates this selector after native
    // DOM id mutations; reading only node.id would leave no reactive dependency.
    const floatingId = current.floatingId;
    return ownsOpen ? (current.popupElement?.id ?? floatingId) || undefined : undefined;
  };
  const state: DialogTriggerState = {
    get disabled() { return props.disabled ?? false; },
    get open() { return store().state.open && store().state.activeTriggerId === id(); },
  };
  const elementProps = omit(props, 'class', 'style', 'render', 'disabled', 'nativeButton', 'handle', 'payload', 'id');
  const rootTriggerProps = merge(() => mountedByThisTrigger() ? store().state.activeTriggerProps : store().state.inactiveTriggerProps);
  const defaults = {
    [CLICK_TRIGGER_IDENTIFIER]: '',
    get id() { return id(); },
    'aria-haspopup': 'dialog',
    get 'aria-expanded'() { return state.open; },
    get 'aria-controls'() { return popupId(); },
  };
  return createRenderElement<DialogTriggerState, HTMLButtonElement>('button', props, {
    state,
    ref: [button.buttonRef, (node: HTMLElement | null) => { setElement(node); }, registration.registerTrigger],
    stateAttributesMapping: triggerOpenStateMapping,
    // Button projection changes handlers/attributes, never the children source.
    // Apply it after merging instead of giving the child resolver a freshly
    // wrapped props object whenever active/inactive interaction bags switch.
    propGetter: button.getButtonProps,
    props: [
      click.reference,
      rootTriggerProps,
      interactionProps,
      defaults,
      elementProps,
    ],
  });
}
export interface DialogTriggerState { disabled: boolean; open: boolean }
export interface DialogTriggerProps<Payload = unknown> extends BaseUIComponentProps<'button', DialogTriggerState> {
  nativeButton?: boolean;
  disabled?: boolean;
  id?: string;
  handle?: DialogHandle<Payload>;
  payload?: NoInfer<Payload>;
}
export namespace DialogTrigger { export type Props<Payload = unknown> = DialogTriggerProps<Payload>; export type State = DialogTriggerState; }
