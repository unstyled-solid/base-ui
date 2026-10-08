import { createEffect, createMemo } from 'solid-js';
import { isServer, type JSX } from '@solidjs/web';
import type { HTMLProps } from '../../internals/types';
import { createDismiss } from '../../floating-ui-react/hooks/createDismiss';
import { createClientPoint } from '../../floating-ui-react/hooks/createClientPoint';
import { createChangeEventDetails, type BaseUIChangeEventDetails } from '../../internals/createBaseUIEventDetails';
import { createPopupInteractionProps } from '../../utils/popups';
import { mergePropsN } from '../../merge-props';
import { createTooltipStore, type TooltipStore } from '../store/TooltipStore';
import type { TooltipHandle } from '../store/TooltipHandle';
import { TooltipRootContext } from './TooltipRootContext';

/** Groups tooltip parts without introducing a DOM element or focus trap. */
export function TooltipRoot<Payload = unknown>(props: TooltipRootProps<Payload>): JSX.Element {
  const store = createTooltipStore(props);
  createEffect(() => props.handle, handle => handle?.attachStore(store));

  const actions: TooltipRootActions = {
    unmount: () => store.forceUnmount(),
    close: () => store.setOpen(false, createChangeEventDetails('imperative-action')),
  };
  createEffect(() => props.actionsRef, ref => {
    if (typeof ref === 'function') {
      ref(actions);
      return () => ref(null);
    }
    if (ref) {
      ref.current = actions;
      return () => { if (ref.current === actions) ref.current = null; };
    }
  });

  if (!isServer) {
    const context = () => store.state.floatingRootContext;
    const dismiss = createDismiss(context, {
      get enabled() { return !store.disabled; },
      referencePress: () => store.closeOnClick,
    });
    const clientPoint = createClientPoint(context, {
      get enabled() { return !store.disabled && store.trackCursorAxis !== 'none'; },
      get axis() { return store.trackCursorAxis === 'none' ? undefined : store.trackCursorAxis; },
    });
    createPopupInteractionProps(store, {
      get activeTriggerProps() { return mergePropsN<(props: HTMLProps) => JSX.Element>([clientPoint.reference, dismiss.reference]); },
      get inactiveTriggerProps() { return mergePropsN<(props: HTMLProps) => JSX.Element>([clientPoint.reference, dismiss.reference]); },
      get popupProps() { return dismiss.floating ?? {}; },
    });
  }

  const payload = { get payload() { return store.state.payload; } };
  function Content(): JSX.Element {
    // A JSX-producing getter owns a subtree each time it is evaluated. Resolve
    // it once in this owned scope; a typeof check followed by a second props
    // read would create invisible triggers/portals and leave their resources live.
    const content = createMemo(() => {
      const children = props.children;
      // Context providers return Solid's public ChildrenReturn accessor. It is
      // renderer-owned JSX, not a payload callback: dereferencing it here would
      // subscribe this memo to its portal refs and recreate the entire subtree.
      const resolvedChildren = typeof children === 'function' && 'toArray' in children
        && typeof children.toArray === 'function';
      return typeof children === 'function' && !resolvedChildren ? children(payload) : children;
    });
    return <>{content()}</>;
  }
  return (
    <TooltipRootContext value={store as TooltipStore}>
      <Content />
    </TooltipRootContext>
  );
}

export interface TooltipRootState {}
export interface TooltipRootProps<Payload = unknown> {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean, eventDetails: TooltipRootChangeEventDetails) => void;
  onOpenChangeComplete?: (open: boolean) => void;
  disableHoverablePopup?: boolean;
  trackCursorAxis?: 'none' | 'x' | 'y' | 'both';
  actionsRef?: ((actions: TooltipRootActions | null) => void) | { current: TooltipRootActions | null };
  disabled?: boolean;
  handle?: TooltipHandle<Payload>;
  children?: JSX.Element | ((state: { readonly payload: Payload | undefined }) => JSX.Element);
  triggerId?: string | null;
  defaultTriggerId?: string | null;
}
export interface TooltipRootActions { unmount(): void; close(): void; }
export type TooltipRootChangeEventReason = 'trigger-hover' | 'trigger-focus' | 'trigger-press'
  | 'outside-press' | 'escape-key' | 'disabled' | 'imperative-action' | 'none';
export type TooltipRootChangeEventDetails = BaseUIChangeEventDetails<TooltipRootChangeEventReason> & {
  preventUnmountOnClose(): void;
};
export namespace TooltipRoot {
  export type State = TooltipRootState;
  export type Props<Payload = unknown> = TooltipRootProps<Payload>;
  export type Actions = TooltipRootActions;
  export type ChangeEventReason = TooltipRootChangeEventReason;
  export type ChangeEventDetails = TooltipRootChangeEventDetails;
}
