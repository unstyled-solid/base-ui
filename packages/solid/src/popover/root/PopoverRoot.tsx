import { createEffect, createMemo, untrack } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { createChangeEventDetails, type BaseUIChangeEventDetails } from '../../internals/createBaseUIEventDetails';
import { createDismiss } from '../../floating-ui-react/hooks/createDismiss';
import { createPopoverStore, type PopoverStore } from '../store/PopoverStore';
import type { PopoverHandle } from '../store/PopoverHandle';
import { PopoverRootContext } from './PopoverRootContext';
import { usePopoverRootContext } from './PopoverRootContext';
import { createPopupInteractionProps } from '../../utils/popups';
import { FloatingTree, useFloatingParentNodeId } from '../../floating-ui-react/components/FloatingTree';

export function PopoverRoot<Payload = unknown>(props: PopoverRootProps<Payload>): JSX.Element {
  if (usePopoverRootContext(true)) return <PopoverRootContent {...props} />;
  return <FloatingTree><PopoverRootContent {...props} /></FloatingTree>;
}

function PopoverRootContent<Payload>(props: PopoverRootProps<Payload>): JSX.Element {
  const nested = untrack(() => useFloatingParentNodeId() != null);
  const store = createPopoverStore(props, usePopoverRootContext(true), nested);
  const dismiss = createDismiss(store.state.floatingRootContext, {
    get enabled() { return store.state.open || store.state.mounted; },
    get outsidePressEvent() { return { mouse: store.modal === 'trap-focus' ? 'sloppy' as const : 'intentional' as const, touch: 'sloppy' as const }; },
  });
  createPopupInteractionProps(store.popup, {
    get activeTriggerProps() { return dismiss.reference ?? {}; },
    get inactiveTriggerProps() { return dismiss.reference ?? {}; },
    get popupProps() { return dismiss.floating ?? {}; },
  });
  createEffect(() => props.handle, (handle) => handle?.attachStore(store));
  const actions: PopoverRootActions = {
    close: () => store.popup.setOpen(false, createChangeEventDetails('imperative-action')),
    unmount: () => store.popup.forceUnmount(),
  };
  createEffect(() => props.actionsRef, (ref) => {
    ref?.(actions);
    return () => ref?.(null);
  });
  const childState = { get payload() { return store.state.payload; } };
  const Content = () => {
    const content = createMemo(() => {
      const children = props.children;
      return typeof children === 'function' ? children(childState) : children;
    });
    return <>{content()}</>;
  };
  return (
    <PopoverRootContext value={store as PopoverStore}>
      <Content />
    </PopoverRootContext>
  );
}

export interface PopoverRootState {}
export interface PopoverRootActions { unmount(): void; close(): void }
export type PopoverRootChangeEventReason = 'trigger-hover' | 'trigger-focus' | 'trigger-press'
  | 'outside-press' | 'escape-key' | 'close-press' | 'focus-out' | 'imperative-action' | 'none';
export type PopoverRootChangeEventDetails = BaseUIChangeEventDetails<PopoverRootChangeEventReason> & {
  preventUnmountOnClose(): void;
};
export interface PopoverRootProps<Payload = unknown> {
  defaultOpen?: boolean;
  open?: boolean;
  modal?: boolean | 'trap-focus';
  triggerId?: string | null;
  defaultTriggerId?: string | null;
  handle?: PopoverHandle<Payload>;
  onOpenChange?: (open: boolean, details: PopoverRootChangeEventDetails) => void;
  onOpenChangeComplete?: (open: boolean) => void;
  /** Native callback attachment; dispose clears the attachment. */
  actionsRef?: (actions: PopoverRootActions | null) => void;
  children?: JSX.Element | ((state: { readonly payload: Payload | undefined }) => JSX.Element);
}
export namespace PopoverRoot {
  export type Props<Payload = unknown> = PopoverRootProps<Payload>;
  export type State = PopoverRootState;
  export type Actions = PopoverRootActions;
  export type ChangeEventReason = PopoverRootChangeEventReason;
  export type ChangeEventDetails = PopoverRootChangeEventDetails;
}
