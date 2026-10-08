import { createContext, useContext } from 'solid-js';
import type { MenuCheckboxItemState } from './MenuCheckboxItem';
export const MenuCheckboxItemContext = createContext<MenuCheckboxItemState>();
export function useMenuCheckboxItemContext() { return useContext(MenuCheckboxItemContext); }
