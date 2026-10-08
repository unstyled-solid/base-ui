import { createContext, useContext } from 'solid-js';
import type { MenuRoot } from '../root/MenuRoot';
export interface MenuRadioGroupContext { value: any; disabled: boolean; setValue(value: any, details: MenuRoot.ChangeEventDetails): void }
export const MenuRadioGroupContext = createContext<MenuRadioGroupContext>();
export function useMenuRadioGroupContext() { return useContext(MenuRadioGroupContext); }
