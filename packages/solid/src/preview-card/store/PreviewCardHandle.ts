import { BasePopupHandle } from '../../utils/popups/popupHandle';
import { createNullPreviewCardStore, type PreviewCardHandleStore, type PreviewCardStore } from './PreviewCardStore';

/** Associates detached links with the last attached living PreviewCard.Root. */
export class PreviewCardHandle<Payload> extends BasePopupHandle<PreviewCardHandleStore<Payload>, PreviewCardStore<Payload>> {
  constructor() {
    super(createNullPreviewCardStore<Payload>(), 'PreviewCard');
  }
  open(triggerId: string): void { this.openByTrigger(triggerId); }
  close(): void { this.closePopup(); }
  get isOpen(): boolean { return this.store.state.open; }
}

export function createPreviewCardHandle<Payload = unknown>(): PreviewCardHandle<Payload> {
  return new PreviewCardHandle<Payload>();
}
