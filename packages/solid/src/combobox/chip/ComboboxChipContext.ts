import { createContext, useContext } from 'solid-js';
export interface ComboboxChipContext { readonly index: number | null }
export const ComboboxChipContext = createContext<ComboboxChipContext>();
export const useComboboxChipContext = () => useContext(ComboboxChipContext);
