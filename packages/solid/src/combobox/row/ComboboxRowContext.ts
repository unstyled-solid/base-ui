import { createContext, useContext } from 'solid-js';
export const ComboboxRowContext = createContext(false);
export const useComboboxRowContext = () => useContext(ComboboxRowContext);
