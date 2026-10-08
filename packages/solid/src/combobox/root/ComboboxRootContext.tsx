import { createContext, useContext, type Accessor } from 'solid-js';
import type { ComboboxStore } from '../store';
import type { FloatingRootContext } from '../../internals/contracts/floating';
import type { AriaComboboxInputValue } from './AriaCombobox';
export interface ComboboxDerivedItemsContext {
  readonly query: string; readonly hasItems: boolean;
  readonly filteredItems: readonly any[]; readonly flatFilteredValues: readonly any[];
}
export const ComboboxRootContext = createContext<ComboboxStore>();
export const ComboboxFloatingContext = createContext<FloatingRootContext>();
export const ComboboxDerivedItemsContext = createContext<ComboboxDerivedItemsContext>();
export const ComboboxHasItemsContext = createContext<Accessor<boolean>>(() => false);
export const ComboboxInputValueContext = createContext<Accessor<AriaComboboxInputValue>>(() => '');
export const useComboboxRootContext = () => useContext(ComboboxRootContext);
export const useComboboxFloatingContext = () => useContext(ComboboxFloatingContext);
export const useComboboxDerivedItemsContext = () => useContext(ComboboxDerivedItemsContext);
export const useComboboxHasItemsContext = () => useContext(ComboboxHasItemsContext);
export const useComboboxInputValueContext = () => useContext(ComboboxInputValueContext);
