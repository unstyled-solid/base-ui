import { createContext, useContext } from 'solid-js';
import type { SelectItemRecord } from '../store';
export interface SelectItemContextValue { readonly record: SelectItemRecord; readonly selected: boolean; setText(element: HTMLElement | null): void }
export const SelectItemContext = createContext<SelectItemContextValue>();
export function useSelectItemContext() { return useContext(SelectItemContext); }
