import { createEffect } from 'solid-js';
import { createItemRegistry } from '../../internals/createItemRegistry';
import { useFilterDropdownItemContext } from '../root/FilterDropdownRootContext';
import { useFilterDropdownGroupContext, type FilterDropdownGroupContext } from './FilterDropdownGroupContext';
export interface UseFilterDropdownGroupReturnValue { readonly hidden: boolean; context: FilterDropdownGroupContext }
export function createFilterDropdownGroup(): UseFilterDropdownGroupReturnValue {
  const owner = useFilterDropdownItemContext();
  const parent = useFilterDropdownGroupContext();
  const registry = createItemRegistry<symbol, boolean>();
  const id = Symbol('filter-dropdown-group');
  const hidden = () => {
    const ids = owner.store.state.visibleItemIds;
    const items = registry.items;
    if (ids === null || items.size === 0) return false;
    for (const [key, retained] of items) if (retained || ids.has(key)) return false;
    return true;
  };
  createEffect(hidden, value => parent?.registerItem(id, !value));
  return { get hidden() { return hidden(); }, context: { registerItem: (key, retained) => registry.registerItem(key, retained) } };
}
export { createFilterDropdownGroup as useFilterDropdownGroup };
