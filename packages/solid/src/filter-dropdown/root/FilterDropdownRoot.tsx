import { createEffect, createMemo, createSignal, untrack } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { createItemRegistry } from '../../internals/createItemRegistry';
import { createBaseUiId } from '../../internals/createBaseUiId';
import { getFilter } from '../../internals/filter';
import type { MutableCell } from '../../internals/contracts/core';
import { FilterDropdownItemContext, FilterDropdownRootContext, FilterDropdownValueContext, useFilterDropdownItemContext, type FilterDropdownFilter, type FilterDropdownItemRegistration, type FilterDropdownRootChangeEventDetails, type FilterDropdownRootChangeEventReason } from './FilterDropdownRootContext';

export interface FilterDropdownRootProps {
  children?: JSX.Element;
  open: boolean;
  disabled?: boolean;
  openedByKeyboard?: boolean;
  locale?: Intl.LocalesArgument;
  value: string;
  query?: string;
  onValueChange?(value: string, details: FilterDropdownRootChangeEventDetails): void;
  filter?: FilterDropdownFilter | null;
  autoHighlight?: boolean | 'always';
  triggerId?: string | null;
  listRef: MutableCell<Array<HTMLElement | null>>;
  getActiveIndex(): number | null;
  setActiveIndex(index: number | null): void;
  focusOwnerRef?: MutableCell<HTMLElement | null>;
}

/** The host owns ordering/navigation; this root owns only query and match identities. */
export function FilterDropdownRoot(props: FilterDropdownRootProps) {
  const parent = useFilterDropdownItemContext(true);
  const registry = createItemRegistry<symbol, FilterDropdownItemRegistration>();
  const id = createBaseUiId();
  const fallbackFocusOwner = { current: null as HTMLElement | null };
  const [renderedListId, setRenderedListId] = createSignal<string>();
  const [focus, setFocus] = createSignal(() => props.openedByKeyboard ?? false);
  const [keyboard, setKeyboard] = createSignal(() => props.openedByKeyboard ?? false);
  const query = () => (props.query ?? props.value).trim();
  const auto = () => props.open && (props.autoHighlight === 'always' || (props.autoHighlight === true && query() !== ''));
  const defaultMatch = createMemo(() => getFilter({ locale: props.locale }).contains);
  const match = () => query() === '' || props.filter === null ? null : props.filter ?? defaultMatch();
  // Match identities are a DOM-fed registry result, not a copy of the query.
  // Read getText in the terminal reconciliation phase: a pure memo would read
  // descendants before their DOM text updates and hide a newly matching item.
  const [visible, setVisible] = createSignal<ReadonlySet<symbol> | null>(null);
  const store = { state: {
    get visibleItemIds() { return visible(); },
    get registeredItemCount() { registry.items; return registry.liveItems.size; },
  } };
  let previousQuery: string | null = null;
  let currentIds: ReadonlySet<symbol> | null = null;
  createEffect(() => ({ query: query(), open: props.open, override: props.query, auto: auto(), match: match(), items: registry.items }), (next) => untrack(() => {
    if (!next.open && next.override === undefined) return;
    const changed = previousQuery !== null && previousQuery !== next.query;
    previousQuery = next.query;
    if (next.match === null) {
      currentIds = null;
      setVisible(null);
      if (next.auto && registry.liveItems.size > 0) {
        if (changed || props.getActiveIndex() === null) props.setActiveIndex(0);
      } else if (next.query === '' && changed) props.setActiveIndex(null);
    } else {
      // Keep the discovery render until the popup's first registrations arrive.
      if (currentIds === null && registry.liveItems.size === 0) return;
      const ids = new Set<symbol>();
      registry.liveItems.forEach((item, key) => {
        const text = item.getText();
        if (text != null && next.match!(text, next.query)) ids.add(key);
      });
      const identitiesChanged = currentIds === null || currentIds.size !== ids.size || [...ids].some(key => !currentIds!.has(key));
      if (identitiesChanged) {
        if (next.auto && ids.size > 0) props.setActiveIndex(0);
        else if (currentIds !== null || changed) props.setActiveIndex(null);
        currentIds = ids;
        setVisible(ids);
      } else if (next.auto && changed && ids.size > 0) props.setActiveIndex(0);
    }
  }));
  const context: FilterDropdownRootContext = {
    get open() { return props.open; }, get disabled() { return props.disabled ?? false; },
    get inputFocusVisible() { return focus(); },
    setInputFocusVisible: setFocus,
    get keyboardModality() { return keyboard(); },
    setKeyboardModality: setKeyboard,
    get autoHighlight() { return props.autoHighlight ?? false; },
    get triggerId() { return props.triggerId || undefined; },
    get defaultListId() { return `${id()}-list`; },
    get listId() { return (renderedListId() ?? context.defaultListId) || undefined; },
    setRenderedListId,
    get focusOwnerRef() { return props.focusOwnerRef ?? fallbackFocusOwner; },
    setActiveIndex(index) { props.setActiveIndex(index); },
    onItemsChange(previous) {
      const items = props.listRef.current;
      const index = props.getActiveIndex();
      if (index !== null && items[index] != null && items[index] === previous[index]) return;
      props.setActiveIndex(untrack(auto) && items.length > 0 ? 0 : null);
    },
    onValueChange(value, details) {
      props.onValueChange?.(value, details);
      if (!details.isCanceled && !props.autoHighlight) props.setActiveIndex(null);
    },
  };
  const items: FilterDropdownItemContext = {
    parent, store, registerItem: (key, item) => registry.registerItem(key, item),
    get listRef() { return props.listRef; },
  };
  return <FilterDropdownItemContext value={items}><FilterDropdownRootContext value={context}><FilterDropdownValueContext value={() => props.query ?? props.value}>{props.children}</FilterDropdownValueContext></FilterDropdownRootContext></FilterDropdownItemContext>;
}
export namespace FilterDropdownRoot {
  export type Props = FilterDropdownRootProps;
  export type ChangeEventReason = FilterDropdownRootChangeEventReason;
  export type ChangeEventDetails = FilterDropdownRootChangeEventDetails;
}
