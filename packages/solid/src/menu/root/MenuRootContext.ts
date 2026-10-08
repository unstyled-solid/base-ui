import { createContext, useContext } from 'solid-js';
import type { MenuStore } from '../store/MenuStore';
import type { MenuParent, MenuRootOrientation } from './MenuRoot';
export interface MenuRootContext<Payload = unknown> {
  store: MenuStore<Payload>;
  parent: MenuParent;
  orientation: MenuRootOrientation;
  loopFocus: boolean;
  allowEscape: boolean;
  defaultFloatingId: string;
  setRenderedFloatingId(id: string | undefined): void;
  virtualFocus: boolean;
  parentVirtualFocus: boolean;
  parentWebkitItemSelected: boolean;
  webkitItemSelected: boolean;
  syncHighlightedItem(): void;
}
export const MenuRootContext = createContext<MenuRootContext | null>(null);
export function useMenuRootContext(optional?: false): MenuRootContext;
export function useMenuRootContext(optional: true): MenuRootContext | null;
export function useMenuRootContext(optional = false) {
  const context = useContext(MenuRootContext);
  if (!context && !optional) throw new Error('Base UI: MenuRootContext is missing. Menu parts must be placed within <Menu.Root>.');
  return context;
}
