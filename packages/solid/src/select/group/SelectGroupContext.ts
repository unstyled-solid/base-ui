import { createContext, useContext, type Setter } from 'solid-js';
export const SelectGroupContext = createContext<{ readonly labelId: string | undefined; setLabelId: Setter<string | undefined> }>();
export function useSelectGroupContext() { return useContext(SelectGroupContext); }
