import { createSignal, untrack, type Accessor } from 'solid-js';
import { createChangeEventDetails } from '../../internals/createBaseUIEventDetails';
import type { FilterDropdownRootChangeEventDetails } from './FilterDropdownRootContext';
export interface UseFilterDropdownCloseQueryParameters {
  open: boolean;
  mounted: boolean;
  value: string;
  onValueChange(value: string, details: FilterDropdownRootChangeEventDetails): void;
}
/** Call transition with the accepted host state, before clearing its committed value. */
export function createFilterDropdownCloseQuery(parameters: UseFilterDropdownCloseQueryParameters): {
  query: Accessor<string>;
  transition(open: boolean, mounted: boolean): void;
} {
  const [snapshot, setSnapshot] = createSignal<string | null>(null);
  let previousOpen = untrack(() => parameters.open);
  return {
    query: () => !parameters.open && parameters.mounted ? snapshot() ?? parameters.value : parameters.value,
    transition(open, mounted) {
      const closing = previousOpen && !open;
      previousOpen = open;
      if (closing && parameters.value !== '') {
        setSnapshot(mounted ? parameters.value : null);
        parameters.onValueChange('', createChangeEventDetails('popup-close'));
      } else if (open || !mounted) setSnapshot(null);
    },
  };
}
export { createFilterDropdownCloseQuery as useFilterDropdownCloseQuery };
