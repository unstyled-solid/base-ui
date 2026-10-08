import { BasePopupHandle, createNullPopupStore } from '../../utils/popups';
import { createChangeEventDetails } from '../../internals/createBaseUIEventDetails';
import type { DialogStore, DialogHandleStore, InteractionType } from './DialogStore';

/** The shared handle owns attachment stacks and detached trigger migration, never root state. */
export class DialogHandle<Payload = unknown> extends BasePopupHandle<DialogHandleStore<Payload>, DialogStore<Payload>> {
  constructor() { super(createNullPopupStore<Payload>(), 'Dialog', false); }
  open(triggerId: string | null) { this.openByTrigger(triggerId); }
  openWithPayload(payload: Payload) {
    const store = this.attachedStore;
    if (store === null) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('Base UI: DialogHandle.openWithPayload() was called while no root using this handle is mounted. ' +
          'The call and its payload were ignored; mount a root with this handle before opening it imperatively.');
      }
      return;
    }
    store.setPayload(payload);
    store.setOpen(true, createChangeEventDetails('imperative-action'));
  }
  close() { this.closePopup(); }
  /** @internal Trigger interaction metadata belongs to the attached root. */
  setOpenMethod(method: InteractionType) { this.attachedStore?.setOpenMethod(method); }
  get isOpen() { return this.store.state.open; }
}
export function createDialogHandle<Payload = unknown>(): DialogHandle<Payload> { return new DialogHandle<Payload>(); }
