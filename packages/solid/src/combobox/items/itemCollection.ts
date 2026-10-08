// Adapted from Base UI (MIT), 19511bb171f3b360b006c94cf6d07e53cb446505.
import type { Group } from '../../internals/resolveValueLabel';
import { compareItemEquality, defaultItemEquality, type ItemEqualityComparer } from '../../internals/itemEquality';

export function findCollectionItem<Item, Value>(values: Map<Value, Item>, value: Value, isEqual: ItemEqualityComparer<Value>): Item | undefined {
  const exact = values.get(value);
  if (exact !== undefined || isEqual === defaultItemEquality) return exact;
  for (const [candidate, item] of values) {
    if (compareItemEquality(candidate, value, isEqual)) return item;
  }
  return undefined;
}

/** Opaque source-item/selection-value collection. Pass directly to Root.items. */
export declare class ComboboxItemCollection<in out Item, Value = Item> {
  private constructor();
  private readonly __itemCollectionBrand: (item: Item) => Value;
}

export interface ItemCollection<Item = any, Value = any> {
  readonly data: readonly Item[] | readonly Group<Item>[] | undefined;
  readonly value: (item: Item) => Value;
  readonly hasValue: (value: Value, isEqual: ItemEqualityComparer<Value>) => boolean;
  readonly itemLabel: (item: Item) => string;
  label(value: Value, isEqual: ItemEqualityComparer<Value>, fallback?: (value: Value) => string): string;
}

export function getItemCollection<Item, Value>(items: readonly Item[] | readonly Group<Item>[] | ComboboxItemCollection<Item, Value> | undefined): ItemCollection<Item, Value> | undefined {
  if (items === undefined || Array.isArray(items)) return undefined;
  const collection = items as unknown as ItemCollection<Item, Value>;
  if (typeof collection.label !== 'function') {
    throw new Error('Base UI: the items prop received an object that is not a collection, so its items cannot be read. Pass an array, grouped items, or createItems().');
  }
  return collection;
}
