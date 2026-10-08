import { DialogHandle } from '../dialog/store/DialogHandle';

/** Connects detached triggers to a mounted alert dialog root. */
export class AlertDialogHandle<Payload> extends DialogHandle<Payload> {
  // Type-only nominal brand; all imperative behavior belongs to Dialog.
  declare private readonly __alertDialogBrand: never;
}

export function createAlertDialogHandle<Payload>(): AlertDialogHandle<Payload> {
  return new AlertDialogHandle<Payload>();
}
