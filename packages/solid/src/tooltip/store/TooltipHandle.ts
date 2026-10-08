import { BasePopupHandle } from '../../utils/popups/popupHandle';
import { createNullTooltipStore, type TooltipStore } from './TooltipStore';

/** Associates detached triggers with the most recently attached living Root. */
export class TooltipHandle<Payload = unknown> extends BasePopupHandle<TooltipStore<Payload>, TooltipStore<Payload>> {
  constructor() { super(createNullTooltipStore<Payload>(), 'Tooltip'); }
  open(triggerId: string) { this.openByTrigger(triggerId); }
  close() { this.closePopup(); }
  get isOpen() { return this.attachedStore?.state.open ?? false; }
}
export function createTooltipHandle<Payload = unknown>(): TooltipHandle<Payload> {
  return new TooltipHandle<Payload>();
}
