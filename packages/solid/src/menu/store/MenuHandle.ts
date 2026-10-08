import { BasePopupHandle } from '../../utils/popups/popupHandle';
import { createNullMenuStore, type MenuStore, type MenuHandleStore } from './MenuStore';

/** The foundation owns attachment order, inert fallback and trigger migration. */
export class MenuHandle<Payload = unknown> extends BasePopupHandle<MenuHandleStore<Payload>, MenuStore<Payload>> {
  constructor() { super(createNullMenuStore<Payload>(), 'Menu'); }
  open(triggerId: string) { this.openByTrigger(triggerId); }
  close() { this.closePopup(); }
  get isOpen() { return this.store.state.open; }
}
export function createMenuHandle<Payload = unknown>() { return new MenuHandle<Payload>(); }
