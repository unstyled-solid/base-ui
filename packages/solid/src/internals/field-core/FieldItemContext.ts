import { createContext, useContext } from 'solid-js';
export interface FieldItemContextValue {
  readonly disabled: boolean;
}
export const FieldItemContext = createContext<FieldItemContextValue | null>(null);
export function useFieldItemContext(): FieldItemContextValue | null { return useContext(FieldItemContext); }
