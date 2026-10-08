import { createContext, useContext } from 'solid-js';
import type { BaseUIEvent } from '../../internals/types';
export interface MenuSubmenuRootContext {
  getReturnElement?(): HTMLElement | null;
  onTriggerKeyDown?(event: BaseUIEvent<KeyboardEvent>): void;
  onPopupKeyDown?(event: KeyboardEvent): void;
}
export const MenuSubmenuRootContext = createContext<MenuSubmenuRootContext | null>(null);
export function useMenuSubmenuRootContext() { return useContext(MenuSubmenuRootContext); }
