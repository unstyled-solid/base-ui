import { createContext, useContext, type Setter } from 'solid-js';
export const MenuGroupContext = createContext<Setter<string | undefined>>();
export function useMenuGroupRootContext() { return useContext(MenuGroupContext); }
