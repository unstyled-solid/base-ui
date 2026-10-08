import { createContext, useContext } from 'solid-js';
import type { MenuRadioItemState } from './MenuRadioItem';
export const MenuRadioItemContext = createContext<MenuRadioItemState>();
export function useMenuRadioItemContext() { return useContext(MenuRadioItemContext); }
