import { getFilter, type Filter, type GetFilterParameters } from '../../../internals/filter';
import { createCollatorItemFilter, createSingleSelectionCollatorFilter } from './index';
export type { Filter };
export type UseFilterOptions = GetFilterParameters;
export interface UseComboboxFilterOptions extends GetFilterParameters { multiple?: boolean; value?: any }
export const useCoreFilter = getFilter;
export function createComboboxFilter(options: UseComboboxFilterOptions = {}): Filter {
  // Read live options at invocation; no effect-relayed collator or selection snapshot.
  return {
    contains(item, query, label) {
      const core = getFilter(options);
      return options.multiple ? createCollatorItemFilter(core, label)(item, query)
        : createSingleSelectionCollatorFilter(core, label, options.value)(item, query);
    },
    startsWith: (item, query, label) => getFilter(options).startsWith(item, query, label),
    endsWith: (item, query, label) => getFilter(options).endsWith(item, query, label),
  };
}
export { createComboboxFilter as useComboboxFilter };
