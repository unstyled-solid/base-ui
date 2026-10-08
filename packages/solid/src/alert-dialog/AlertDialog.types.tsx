import type { AlertDialogRootProps } from './root/AlertDialogRoot';
import type { AlertDialogTriggerProps } from './trigger/AlertDialogTrigger';
import type { AlertDialogHandle } from './handle';
import type { DialogHandle } from '../dialog/store/DialogHandle';
import { AlertDialog } from './index';
import { Dialog } from '../dialog';
import type { JSX } from '@solidjs/web';
import type { DialogRoot } from '../dialog/root/DialogRoot';
import type * as Public from './index';

// Compile-only public surface assertions; no runtime component invocation.
type Assert<T extends true> = T;
type HasNoModeOverrides = Assert<
  Extract<keyof AlertDialogRootProps, 'modal' | 'disablePointerDismissal'> extends never ? true : false
>;
type RejectsDialogHandle = Assert<DialogHandle<number> extends AlertDialogHandle<number> ? false : true>;
type PreservesRootPayload = Assert<
  NonNullable<AlertDialogRootProps<number>['handle']> extends AlertDialogHandle<number> ? true : false
>;
type PreservesTriggerPayload = Assert<
  NonNullable<AlertDialogTriggerProps<number>['handle']> extends AlertDialogHandle<number> ? true : false
>;
export type AlertDialogSurfaceAssertions = [
  HasNoModeOverrides, RejectsDialogHandle, PreservesRootPayload, PreservesTriggerPayload,
];

type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
export type AlertDialogAliasAssertions = [
  Assert<Equal<Public.AlertDialogBackdropProps, Dialog.Backdrop.Props>>,
  Assert<Equal<Public.AlertDialogBackdropState, Dialog.Backdrop.State>>,
  Assert<Equal<Public.AlertDialogCloseProps, Dialog.Close.Props>>,
  Assert<Equal<Public.AlertDialogCloseState, Dialog.Close.State>>,
  Assert<Equal<Public.AlertDialogDescriptionProps, Dialog.Description.Props>>,
  Assert<Equal<Public.AlertDialogDescriptionState, Dialog.Description.State>>,
  Assert<Equal<Public.AlertDialogPopupProps, Dialog.Popup.Props>>,
  Assert<Equal<Public.AlertDialogPopupState, Dialog.Popup.State>>,
  Assert<Equal<Public.AlertDialogPortalProps, Dialog.Portal.Props>>,
  Assert<Equal<Public.AlertDialogPortalState, Dialog.Portal.State>>,
  Assert<Equal<Public.AlertDialogTitleProps, Dialog.Title.Props>>,
  Assert<Equal<Public.AlertDialogTitleState, Dialog.Title.State>>,
  Assert<Equal<Public.AlertDialogViewportProps, Dialog.Viewport.Props>>,
  Assert<Equal<Public.AlertDialogViewportState, Dialog.Viewport.State>>,
  Assert<Equal<AlertDialog.Root.Actions, DialogRoot.Actions>>,
  Assert<Equal<AlertDialog.Root.ChangeEventDetails, DialogRoot.ChangeEventDetails>>,
];

// Actual consumer JSX inference from pinned AlertDialogRoot.spec.tsx. Never invoked.
export function alertDialogConsumerFixtures(): JSX.Element[] {
  const handle = AlertDialog.createHandle<number>();
  const dialogHandle = Dialog.createHandle<number>();
  return [
    <AlertDialog.Root handle={handle}><AlertDialog.Portal /></AlertDialog.Root>,
    <AlertDialog.Root handle={handle}>{(state) => {
      const payload: number | undefined = state.payload;
      return <span>{payload}</span>;
    }}</AlertDialog.Root>,
    <AlertDialog.Trigger handle={handle} payload={42} />,
    <AlertDialog.Trigger handle={handle} />,
    // @ts-expect-error Payload is inferred from the handle, not widened from payload.
    <AlertDialog.Trigger handle={handle} payload="invalid" />,
    // @ts-expect-error A Dialog handle lacks the nominal AlertDialog brand.
    <AlertDialog.Root handle={dialogHandle} />,
    // @ts-expect-error Detached triggers require an AlertDialog handle too.
    <AlertDialog.Trigger handle={dialogHandle} />,
    // @ts-expect-error Alert mode is mandatory.
    <AlertDialog.Root modal={false} />,
    // @ts-expect-error Pointer dismissal is always disabled.
    <AlertDialog.Root disablePointerDismissal={false} />,
    <AlertDialog.Root actionsRef={(actions) => { actions?.close(); actions?.unmount(); }} onOpenChange={(_open, details) => {
      details.cancel(); details.allowPropagation(); details.preventUnmountOnClose();
      if (details.reason === 'escape-key') {
        const event: KeyboardEvent = details.event;
        event.preventDefault();
      }
    }} />,
  ];
}
