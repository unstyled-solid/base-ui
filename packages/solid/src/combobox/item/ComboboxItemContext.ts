import { createContext, useContext } from 'solid-js';
export interface ComboboxItemContext { readonly selected: boolean }
export const ComboboxItemContext = createContext<ComboboxItemContext>();
export const useComboboxItemContext = () => useContext(ComboboxItemContext);
