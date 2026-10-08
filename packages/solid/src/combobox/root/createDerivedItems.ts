import { createMemo } from 'solid-js';
import { flattenLeafItems, isGroupedItems, stringifyAsLabel, type Group } from '../../internals/resolveValueLabel';
import { defaultItemEquality, type ItemEqualityComparer } from '../../internals/itemEquality';
import { createFilterMatcher, getFilter } from '../../internals/filter';
import { findCollectionItem, getItemCollection, type ComboboxItemCollection } from '../items/itemCollection';

function sameItems(previous: readonly unknown[], next: readonly unknown[]) {
  return previous === next || previous.length === next.length && previous.every((item, index) => Object.hasOwn(previous, index) === Object.hasOwn(next, index) && Object.is(item, next[index]));
}

export interface DerivedItemsOptions<Item, Value> {
  readonly items?: readonly Item[] | readonly Group<Item>[] | ComboboxItemCollection<Item, Value>;
  readonly filteredItems?: readonly Item[] | readonly Group<Item>[];
  readonly query: string;
  readonly selectedValue: Value | readonly Value[] | null;
  readonly selectionMode: 'single' | 'multiple' | 'none';
  readonly queryChanged: boolean;
  readonly filterQuery?: string;
  readonly limit?: number;
  readonly locale?: Intl.LocalesArgument;
  readonly filter?: null | ((item: Item, query: string, label?: (item: Item) => string) => boolean);
  readonly itemToStringLabel?: (value: Value) => string;
  readonly isItemEqualToValue?: ItemEqualityComparer<Value>;
}

export function createDerivedItems<Item, Value>(options: DerivedItemsOptions<Item, Value>) {
  // Live prop bags can invalidate on unrelated query writes. Gate the often
  // unchanged locale before the expensive shared Intl configuration below.
  const locale = createMemo(() => options.locale);
  // Expensive locale configuration belongs to owned setup, independent of
  // query scans. Both selected-label bypass and default scanning share it.
  // Custom/null filtering still constructs no Intl filter unless bypass needs it.
  const filterPolicy = createMemo(() => {
    const filter = options.filter;
    // Custom/null policy must not read query during root setup; selected-label
    // bypass resolves locale lazily after initialization.
    const needsLocale = filter === undefined;
    return { filter, localeFilter: needsLocale ? getFilter({ locale: locale() }) : undefined };
  }, {
    name: 'createDerivedItems.localeFilter',
    equals: (a, b) => a.filter === b.filter && a.localeFilter === b.localeFilter,
  });
  const collection = createMemo(() => getItemCollection(options.items));
  const items = () => collection()?.data ?? (collection() ? undefined : options.items as readonly Item[] | readonly Group<Item>[] | undefined);
  const equal = () => options.isItemEqualToValue ?? defaultItemEquality;
  const external = createMemo(() => {
    const c = collection();
    if (!c || !options.filteredItems) return undefined;
    const index = new Map<Value, Item>();
    for (const item of flattenLeafItems<Item>(options.filteredItems)) {
      if (item == null) continue;
      const value = c.value(item);
      if (!index.has(value)) index.set(value, item);
    }
    return index;
  });
  function label(value: Value): string {
    // Locale updates are also a source render invalidation for stable label
    // accessors (for example a localized collection closure).
    options.locale;
    const c = collection();
    if (!c) return stringifyAsLabel(value, options.itemToStringLabel);
    return c.label(value, equal(), (missing) => {
      const window = external();
      const item = window && findCollectionItem(window, missing, equal());
      return item !== undefined ? c.itemLabel(item) : stringifyAsLabel(missing, options.itemToStringLabel);
    });
  }
  const sourceLabel = Object.assign((item: Item) => collection()?.itemLabel(item) ?? stringifyAsLabel(item, options.itemToStringLabel as ((item: Item) => string) | undefined), { selected: label });
  const filterLabel = () => collection() ? sourceLabel : options.itemToStringLabel as ((item: Item) => string) | undefined;
  const bypass = createMemo(() => {
    if (options.selectionMode !== 'single' || options.queryChanged || !options.query) return false;
    const text = label(options.selectedValue as Value);
    return text.length === options.query.length && (filterPolicy().localeFilter ?? getFilter({ locale: locale() })).contains(text, options.query);
  }, { lazy: true });
  // Opening/closing and queryChanged can invalidate the query accessor without
  // changing its effective text. Do not rescan 10,000 live labels for that.
  const query = createMemo(() => bypass() ? '' : (options.filterQuery ?? options.query), { lazy: true });
  const filtered = createMemo(() => {
    const c = collection();
    const data = items();
    const externalItems = options.filteredItems;
    const browse = data ? bypass() : false;
    if (externalItems !== undefined && !(data && browse && (!c || c.hasValue(options.selectedValue as Value, equal())))) return externalItems;
    if (!data) return [];
    const text = query();
    const limit = options.limit ?? -1;
    // These are per-query policies, not per-item work. In particular getFilter
    // serializes its cache key even on a hit; do that once for the whole scan.
    const policy = filterPolicy();
    const filter = text ? policy.filter : null;
    const itemLabel = text && filter !== null ? filterLabel() : undefined;
    const defaultMatch = text && filter === undefined ? createFilterMatcher(policy.localeFilter!, text, itemLabel) : undefined;
    const match = !text || filter === null ? () => true
      : filter ? createFilterMatcher(filter, text, itemLabel)
        : (item: Item) => item != null && defaultMatch!(item);
    if (isGroupedItems(data)) {
      const result: Group<Item>[] = [];
      let count = 0;
      for (const group of data) {
        if (limit >= 0 && count >= limit) break;
        const selected: Item[] = [];
        for (const item of group.items) {
          if (limit >= 0 && count >= limit) break;
          if (match(item)) { selected.push(item); count++; }
        }
        if (selected.length) result.push({ ...group, items: selected });
      }
      return result;
    }
    if (!text) return limit >= 0 ? data.slice(0, limit) : data;
    const result: Item[] = [];
    // The unbounded path is the common large-list scan. Select it once rather
    // than checking the limit and constructing iterator results for every row.
    // Indexed reads still visit sparse entries as undefined, like the existing
    // custom-filter contract, and read live labels for each candidate.
    if (!(limit >= 0)) {
      for (let index = 0; index < data.length; index++) {
        const item = data[index];
        if (match(item)) result.push(item);
      }
    } else {
      for (let index = 0; index < data.length && result.length < limit; index++) {
        const item = data[index];
        if (match(item)) result.push(item);
      }
    }
    return result;
  }, { lazy: true, equals: sameItems });
  const values = createMemo(() => {
    const c = collection();
    const flat = flattenLeafItems<Item>(filtered());
    return c ? flat.map(c.value) : flat as unknown as readonly Value[];
  }, { lazy: true, equals: sameItems });
  return {
    get query() { return options.query; }, get hasItems() { return items() !== undefined; },
    get filteredItems() { return filtered(); }, get flatFilteredValues() { return values(); },
    get items() { return items(); }, get collection() { return collection(); }, label, sourceLabel,
  };
}
