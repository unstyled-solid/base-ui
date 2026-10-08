import { useComboboxRootContext } from '../root/ComboboxRootContext';
import type { ComboboxStore } from '../store';
export function getChipNavigationKeys(direction: 'ltr' | 'rtl') { return direction === 'rtl' ? ['ArrowRight', 'ArrowLeft'] as const : ['ArrowLeft', 'ArrowRight'] as const; }
export function getIndexAfterChipRemoval(index: number, count: number) { const next = index >= count - 1 ? count - 2 : index; return next >= 0 ? next : undefined; }
export function useListEmpty() { const model = useComboboxRootContext(); return () => model.derived.filteredItems.length === 0; }
export function usePopupSide(model: ComboboxStore) { return () => model.state.mounted && model.state.positionerElement ? model.state.popupSide : null; }
export function clickHighlightedItem(model: ComboboxStore, index: number, event: KeyboardEvent) {
  const element = model.context.listRef.current[index];
  if (element) { model.context.selectionEventRef.current = event; element.click(); model.context.selectionEventRef.current = null; }
}
