import { useComboboxDerivedItemsContext } from '../ComboboxRootContext';
/** Native accessor; use inside JSX/memos to observe held/async result windows. */
export function useFilteredItems<T>() {
  const context = useComboboxDerivedItemsContext();
  return () => context.filteredItems as readonly T[];
}
