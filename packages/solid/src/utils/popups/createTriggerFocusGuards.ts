import type { Accessor } from 'solid-js';
import { getTabbableNearElement, isOutsideEvent } from '../../floating-ui-react/utils/tabbable';
import { createChangeEventDetails } from '../../internals/createBaseUIEventDetails';
import type { ChangeEventDetails } from '../../internals/contracts/events';
export interface TriggerFocusGuardStore {
  readonly state: { readonly positionerElement: HTMLElement | null };
  readonly context: { readonly beforeContentFocusGuardRef?: { current: HTMLElement | null } | undefined };
  setOpen(open: boolean, details: ChangeEventDetails): void;
}
export function createTriggerFocusGuards(store: Accessor<TriggerFocusGuardStore>, trigger: Accessor<HTMLElement | null>) {
  const closeAndFocus = (event: FocusEvent, direction: 1 | -1) => {
    const model = store(), positioner = model.state.positionerElement, guard = event.currentTarget as HTMLElement;
    model.setOpen(false, createChangeEventDetails('focus-out', event, guard));
    // Read the final DOM tab order after the staged close, without a global flush.
    queueMicrotask(() => { getTabbableNearElement(guard.isConnected ? guard : trigger(), direction, positioner)?.focus(); });
  };
  return {
    handlePreFocusGuardFocus(event: FocusEvent) { closeAndFocus(event, -1); },
    handleFocusTargetFocus(event: FocusEvent) {
      const model = store(), positioner = model.state.positionerElement;
      if (positioner && isOutsideEvent(event, positioner)) model.context.beforeContentFocusGuardRef?.current?.focus();
      else closeAndFocus(event, 1);
    },
  };
}
