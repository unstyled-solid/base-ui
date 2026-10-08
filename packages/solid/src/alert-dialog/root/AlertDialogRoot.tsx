import type { DialogRoot } from '../../dialog/root/DialogRoot';
import { createRenderDialogRoot } from '../../dialog/root/createRenderDialogRoot';
import type { AlertDialogHandle } from '../handle';

/** Groups the alert dialog parts without rendering an HTML element. */
export function AlertDialogRoot<Payload>(props: AlertDialogRoot.Props<Payload>) {
  // Pass the original live object: copying it would snapshot controlled props,
  // callbacks and handles. The shared engine owns the enforced alert mode flags.
  return createRenderDialogRoot('alert-dialog', props);
}

export interface AlertDialogRootState {}

export interface AlertDialogRootProps<Payload = unknown> extends Omit<
  DialogRoot.Props<Payload>,
  'modal' | 'disablePointerDismissal' | 'onOpenChange' | 'actionsRef' | 'handle'
> {
  onOpenChange?: ((open: boolean, eventDetails: AlertDialogRoot.ChangeEventDetails) => void) | undefined;
  /** Call preventUnmountOnClose() before using unmount to finish a manual exit. */
  actionsRef?: DialogRoot.Props<Payload>['actionsRef'];
  /** Associates this root with detached alert dialog triggers. */
  handle?: AlertDialogHandle<Payload> | undefined;
}

export type AlertDialogRootActions = DialogRoot.Actions;
export type AlertDialogRootChangeEventReason = DialogRoot.ChangeEventReason;
export type AlertDialogRootChangeEventDetails = DialogRoot.ChangeEventDetails;

export namespace AlertDialogRoot {
  export type State = AlertDialogRootState;
  export type Props<Payload = unknown> = AlertDialogRootProps<Payload>;
  export type Actions = AlertDialogRootActions;
  export type ChangeEventReason = AlertDialogRootChangeEventReason;
  export type ChangeEventDetails = AlertDialogRootChangeEventDetails;
}
