import { BasePopupHandle, createNullPopupStore } from '../../utils/popups';
import type { PopoverHandleStore, PopoverStore } from './PopoverStore';

/** Attachment, fallback migration and diagnostics are shared popup-engine behavior. */
export class PopoverHandle<Payload = unknown> extends BasePopupHandle<PopoverHandleStore<Payload>, PopoverStore<Payload>> {
  constructor() { super(createNullPopupStore<Payload>(), 'Popover'); }
  open(triggerId: string) { this.openByTrigger(triggerId); }
  close() { this.closePopup(); }
  get isOpen(): boolean { return this.store.state.open; }
}
export function createPopoverHandle<Payload = unknown>(): PopoverHandle<Payload> {
  return new PopoverHandle<Payload>();
}
