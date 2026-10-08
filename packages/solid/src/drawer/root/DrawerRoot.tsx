// Adapted from Base UI (MIT), source SHA 19511bb171f3b360b006c94cf6d07e53cb446505.
import { createEffect, onSettled } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { createRenderDialogRoot } from '../../dialog/root/useRenderDialogRoot';
import { useDialogRootContext } from '../../dialog/root/DialogRootContext';
import type { DialogRootProps, DialogRootActions } from '../../dialog/root/DialogRoot';
import { createChangeEventDetails, type BaseUIChangeEventDetails } from '../../internals/createBaseUIEventDetails';
import { DrawerRootContext, useDrawerRootContext, type DrawerChangeReason, type DrawerSnapChangeDetails } from './DrawerRootContext';
import { useDrawerProviderContext } from '../provider/DrawerProviderContext';
import { createDrawerState, type DrawerStateOptions } from './createDrawerState';
import type { DrawerHandle } from '../handle';
import type { DrawerSnapPoint } from './snapPoints';
import { ownerWindow } from '../../utils/owner';

export function DrawerRoot<Payload = unknown>(props: DrawerRootProps<Payload>): JSX.Element {
  const context = createDrawerState(props, useDrawerRootContext(true), useDrawerProviderContext());
  function Adapter() {
    return createRenderDialogRoot<Payload>('drawer', {
      get open() { return props.open; }, get defaultOpen() { return props.defaultOpen; },
      get modal() { return props.modal; }, get disablePointerDismissal() { return props.disablePointerDismissal; },
      get handle() { return props.handle; }, get actionsRef() { return props.actionsRef; },
      get triggerId() { return props.triggerId; }, get defaultTriggerId() { return props.defaultTriggerId; },
      get onOpenChangeComplete() { return props.onOpenChangeComplete; },
      onOpenChange(next, details) {
        props.onOpenChange?.(next, details);
        if (details.isCanceled || next || !props.snapPoints?.length) return;
        context.setActiveSnapPoint(props.defaultSnapPoint !== undefined ? props.defaultSnapPoint : props.snapPoints[0] ?? null,
          createChangeEventDetails<DrawerChangeReason>(details.reason, details.event, details.trigger));
      },
      children(payload) {
        const Children = () => <>{(() => {
          // JSX-producing getters allocate owned descendants. Read once in the
          // tracking scope so the type check cannot instantiate a second tree.
          const children = props.children;
          return typeof children === 'function' ? children(payload) : children;
        })()}</>;
        return <><DrawerProviderReporter /><Children /></>;
      },
    });
  }
  return <DrawerRootContext value={context}><Adapter /></DrawerRootContext>;
}

function DrawerProviderReporter() {
  const drawer = useDrawerRootContext();
  const store = useDialogRootContext();
  onSettled(() => drawer.attachDialog(() => store.state.open, () => !!store.state.popupElement && (store.state.open || store.state.transitionStatus === 'ending')));
  createEffect(() => ({ open: store.state.open, top: store.state.nestedOpenDialogCount === 0, node: store.state.popupElement }), ({ open, top, node }) => {
    if (!open || !top) return;
    const win = ownerWindow(node);
    if (!/Android/i.test(win.navigator.userAgent)) return;
    const Ctor = (win as Window & { CloseWatcher?: new () => EventTarget & { destroy(): void } }).CloseWatcher;
    if (!Ctor) return;
    const watcher = new Ctor();
    const cancel = (event: Event) => {
      if (!store.state.open) return;
      const details = createChangeEventDetails('close-watcher', event);
      if (!event.cancelable) details.cancel = () => {};
      store.setOpen(false, details);
      if (details.isCanceled) event.preventDefault();
    };
    watcher.addEventListener('cancel', cancel);
    return () => { watcher.removeEventListener('cancel', cancel); watcher.destroy(); };
  });
  return null;
}

export interface DrawerRootProps<Payload = unknown> extends Omit<DialogRootProps<Payload>, 'handle' | 'onOpenChange'>, DrawerStateOptions {
  handle?: DrawerHandle<Payload>;
  onOpenChange?: (open: boolean, details: DrawerRootChangeEventDetails) => void;
}
export interface DrawerRootState {}
export type DrawerRootActions = DialogRootActions;
export type DrawerRootChangeEventReason = DrawerChangeReason;
export type DrawerRootChangeEventDetails = BaseUIChangeEventDetails<DrawerChangeReason, { preventUnmountOnClose(): void }>;
export type DrawerRootSnapPointChangeEventReason = DrawerChangeReason;
export type DrawerRootSnapPointChangeEventDetails = DrawerSnapChangeDetails;
export namespace DrawerRoot {
  export type Props<Payload = unknown> = DrawerRootProps<Payload>;
  export type State = DrawerRootState;
  export type Actions = DrawerRootActions;
  export type ChangeEventReason = DrawerRootChangeEventReason;
  export type ChangeEventDetails = DrawerRootChangeEventDetails;
  export type SnapPointChangeEventReason = DrawerRootSnapPointChangeEventReason;
  export type SnapPointChangeEventDetails = DrawerRootSnapPointChangeEventDetails;
  export type SnapPoint = DrawerSnapPoint;
}
