import type { JSX } from '@solidjs/web';
import { DialogTrigger } from '../../dialog/trigger/DialogTrigger';
import type { DialogTriggerProps, DialogTriggerState } from '../../dialog/trigger/DialogTrigger';
import type { AlertDialogHandle } from '../handle';

/** A button that opens the alert dialog. Shares Dialog's trigger implementation. */
export const AlertDialogTrigger = DialogTrigger as AlertDialogTrigger;

export interface AlertDialogTrigger {
  <Payload>(componentProps: AlertDialogTriggerProps<Payload>): JSX.Element;
}

export interface AlertDialogTriggerProps<Payload = unknown> extends Omit<
  DialogTriggerProps<Payload>, 'handle'
> {
  handle?: AlertDialogHandle<Payload> | undefined;
}

export interface AlertDialogTriggerState extends DialogTriggerState {}

export namespace AlertDialogTrigger {
  export type Props<Payload = unknown> = AlertDialogTriggerProps<Payload>;
  export type State = AlertDialogTriggerState;
}
