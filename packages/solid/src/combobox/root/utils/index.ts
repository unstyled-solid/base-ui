import { stringifyAsLabel } from '../../../internals/resolveValueLabel';
import type { Filter } from '../../../internals/filter';
export type FilterItemToString = ((item: any) => string) & { selected?: (value: any) => string };
export function getComboboxPopupId(id: string | null | undefined) { return id == null ? undefined : `${id}-popup`; }
export function createCollatorItemFilter(filter: Filter, label?: FilterItemToString) {
  return (item: any, query: string) => item != null && filter.contains(item, query, label);
}
export function createSingleSelectionCollatorFilter(filter: Filter, label?: FilterItemToString, selected?: any) {
  return (item: any, query: string) => {
    if (item == null) return false;
    if (!query) return true;
    const text = selected == null ? '' : stringifyAsLabel(selected, label?.selected ?? label);
    return Boolean(text && text.length === query.length && filter.contains(text, query)) || filter.contains(item, query, label);
  };
}
