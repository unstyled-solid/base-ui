import { createSignal } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { FilterDropdownItemContext, FilterDropdownRootContext, FilterDropdownValueContext, type FilterDropdownRootChangeEventDetails } from '../root/FilterDropdownRootContext';

/** A host-contract fixture for testing parts independently of registry implementation. */
export function PartContext(props: {
  children?: JSX.Element;
  value?: string;
  disabled?: boolean;
  empty?: boolean;
  active?: string;
  onValueChange?(value: string, details: FilterDropdownRootChangeEventDetails): void;
}) {
  const [focus, setFocus] = createSignal(false);
  const [keyboard, setKeyboard] = createSignal(false);
  const [listId, setListId] = createSignal<string>();
  const listRef = { current: [] as Array<HTMLElement | null> };
  const context: FilterDropdownRootContext = {
    open: true, get disabled() { return props.disabled ?? false; }, autoHighlight: false,
    get inputFocusVisible() { return focus(); }, setInputFocusVisible: setFocus,
    get keyboardModality() { return keyboard(); }, setKeyboardModality: setKeyboard,
    triggerId: undefined, defaultListId: 'fixture-list', get listId() { return (listId() ?? 'fixture-list') || undefined; },
    setRenderedListId: setListId, focusOwnerRef: { current: null }, setActiveIndex() {}, onItemsChange() {},
    onValueChange: (value, details) => props.onValueChange?.(value, details),
  };
  const items: FilterDropdownItemContext = {
    parent: null, listRef, registerItem() { throw new Error('PartContext does not implement item registration; use the real Root fixture.'); },
    store: { state: { visibleItemIds: null, get registeredItemCount() { return props.empty ? 0 : 1; } } },
  };
  return <FilterDropdownItemContext value={items}><FilterDropdownRootContext value={context}><FilterDropdownValueContext value={() => props.value ?? ''}>{props.children}</FilterDropdownValueContext></FilterDropdownRootContext></FilterDropdownItemContext>;
}
