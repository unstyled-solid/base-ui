import { createEffect, runWithOwner, untrack } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { createDismiss } from '../../floating-ui-react/hooks/createDismiss';
import { FloatingTree, useFloatingParentNodeId } from '../../floating-ui-react/components/FloatingTree';
import { createChangeEventDetails, type BaseUIChangeEventDetails } from '../../internals/createBaseUIEventDetails';
import { createPreviewCardStore, type PreviewCardStore } from '../store/PreviewCardStore';
import { PreviewCardRootContext, usePreviewCardRootContext } from './PreviewCardContext';
import type { PreviewCardHandle } from '../store/PreviewCardHandle';

/** Groups the preview card parts without adding an element. */
export function PreviewCardRoot<Payload = unknown>(props: PreviewCardRoot.Props<Payload>) {
  const parent = usePreviewCardRootContext(true);
  if (parent) return <PreviewCardRootComponent {...props} />;
  return <FloatingTree><PreviewCardRootComponent {...props} /></FloatingTree>;
}

function PreviewCardRootComponent<Payload>(props: PreviewCardRoot.Props<Payload>) {
  const parent = usePreviewCardRootContext(true);
  const store = createPreviewCardStore(props, { parent, nested: useFloatingParentNodeId() !== null });
  const dismiss = createDismiss(store.state.floatingRootContext, {
    get enabled() { return store.state.open || store.state.mounted; },
  });
  store.setInteractionProps({
    get activeTriggerProps() { return dismiss.reference; },
    get inactiveTriggerProps() { return dismiss.reference; },
    get popupProps() { return dismiss.floating; },
  });
  // PreviewCard does not support an unassociated payload (unlike other popup
  // families). Clear the transaction when an open root loses its trigger.
  createEffect(() => store.state.open && store.state.activeTriggerId === null && store.state.payload !== undefined, (clear) => {
    if (clear) store.setPayload(undefined);
  });
  createEffect(() => props.handle, (handle) => handle?.attachStore(store));
  const actions: PreviewCardRootActions = {
    unmount: () => store.forceUnmount(),
    close: () => store.setOpen(false, createChangeEventDetails('imperative-action')),
  };
  createEffect(() => props.actionsRef, (ref) => {
    untrack(() => runWithOwner(null, () => { ref?.(actions); }));
    return () => untrack(() => runWithOwner(null, () => { ref?.(null); }));
  });
  const payloadContext = { get payload() { return store.state.payload; } };
  // A live argument lets JSX read payload without replacing the Root's entire subtree.
  function Content() {
    const content = () => {
      const children = props.children;
      return typeof children === 'function' ? children(payloadContext) : children;
    };
    return <>{content()}</>;
  }
  return (
    <PreviewCardRootContext value={store as PreviewCardStore<unknown>}>
      <Content />
    </PreviewCardRootContext>
  );
}

export interface PreviewCardRootState {}
export interface PreviewCardRootActions { unmount(): void; close(): void }
export type PreviewCardRootChangeEventReason = 'trigger-hover' | 'trigger-focus' | 'trigger-press' | 'outside-press' | 'escape-key' | 'imperative-action' | 'none';
export type PreviewCardRootChangeEventDetails = BaseUIChangeEventDetails<PreviewCardRootChangeEventReason> & { preventUnmountOnClose(): void };
export interface PreviewCardRootProps<Payload = unknown> {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean, details: PreviewCardRootChangeEventDetails) => void;
  onOpenChangeComplete?: (open: boolean) => void;
  /** Native callback ref; receives null on disposal or replacement. */
  actionsRef?: (actions: PreviewCardRootActions | null) => void;
  handle?: PreviewCardHandle<Payload>;
  children?: JSX.Element | ((context: { readonly payload: Payload | undefined }) => JSX.Element);
  triggerId?: string | null;
  defaultTriggerId?: string | null;
}
export namespace PreviewCardRoot {
  export type State = PreviewCardRootState;
  export type Props<Payload = unknown> = PreviewCardRootProps<Payload>;
  export type Actions = PreviewCardRootActions;
  export type ChangeEventReason = PreviewCardRootChangeEventReason;
  export type ChangeEventDetails = PreviewCardRootChangeEventDetails;
}
