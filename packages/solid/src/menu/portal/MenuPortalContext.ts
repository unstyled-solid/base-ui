import { createContext, useContext, type Accessor } from 'solid-js';
export const MenuPortalContext = createContext<Accessor<boolean>>(() => false);
export function useMenuPortalContext() { return useContext(MenuPortalContext); }
