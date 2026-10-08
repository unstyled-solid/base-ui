import { createContext, useContext, type Setter } from 'solid-js';
export interface ComboboxGroupContext { readonly labelId: string | undefined; setLabelId: Setter<string | undefined>; readonly items?: readonly any[] }
export const ComboboxGroupContext = createContext<ComboboxGroupContext>();
export const useComboboxGroupContext = () => useContext(ComboboxGroupContext);
