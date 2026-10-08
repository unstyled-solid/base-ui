// Adapted from Base UI (MIT), 19511bb171f3b360b006c94cf6d07e53cb446505.
import { flattenLeafItems, stringifyAsLabel } from '../../internals/resolveValueLabel';
import { error } from '../../utils/error';
import { findCollectionItem, type ComboboxItemCollection, type ItemCollection } from './itemCollection';

export type ComboboxPrimitiveValue = string | number | bigint | boolean;
type RemoveIndexSignature<T> = { [K in keyof T as string extends K ? never : number extends K ? never : symbol extends K ? never : K]: T[K] };
type HasGroupShape<Item> = Item extends object
  ? 'items' extends keyof RemoveIndexSignature<Item>
    ? [Extract<NonNullable<Item['items']>, ReadonlyArray<unknown>>] extends [never]
      ? never[] extends NonNullable<Item['items']> ? true : never
      : true
    : never
  : never;
type IsAny<T> = 0 extends 1 & T ? true : false;
type RejectGroupShapedItems<Item> = IsAny<Item> extends true ? unknown : true extends HasGroupShape<Item>
  ? 'Base UI: items passed to createItems() cannot have an `items` array property because it marks a group. Rename the field or cast the data.' : unknown;
type ComboboxItemsData<Item> =
  | (Extract<Item, { items: ReadonlyArray<unknown> }> extends never ? readonly Item[] : never)
  | readonly { items: ReadonlyArray<Item> }[];

export interface CreateComboboxItemsOptions<Item, Value extends ComboboxPrimitiveValue = ComboboxPrimitiveValue> {
  getValue: (item: Item) => Value;
  getLabel: (item: Item) => string;
}

/** Lazy, root-independent projection. For reactive data, create this inside a memo. */
export function createComboboxItems<Item, Value extends ComboboxPrimitiveValue>(
  data: (ComboboxItemsData<Item> & RejectGroupShapedItems<Item>) | undefined,
  options: CreateComboboxItemsOptions<Item, Value>,
): ComboboxItemCollection<Item, Value> {
  const { getValue, getLabel } = options;
  let index: Map<Value, Item> | null = null;
  function derive() {
    if (index === null) {
      const next = new Map<Value, Item>();
      for (const item of data ? flattenLeafItems<Item>(data) : []) {
        if (item == null) continue;
        const value = getValue(item);
        if (!next.has(value)) next.set(value, item);
        else if (process.env.NODE_ENV !== 'production') {
          error(`Two items passed to createItems() derived the value ${String(value)}, so selection and label ` +
            'resolution cannot tell them apart: the first item wins the label and every item ' +
            'carrying the value renders as selected. Return a unique value from `getValue`.');
        }
      }
      index = next;
    }
    return index;
  }
  const collection: ItemCollection<Item, Value> = {
    data,
    value: (item) => item == null ? item as unknown as Value : getValue(item),
    hasValue: (value, equal) => findCollectionItem(derive(), value, equal) !== undefined,
    itemLabel: getLabel,
    label(value, equal, fallback) {
      const item = findCollectionItem(derive(), value, equal);
      return item !== undefined ? getLabel(item) : stringifyAsLabel(value, fallback);
    },
  };
  return collection as unknown as ComboboxItemCollection<Item, Value>;
}
export { createComboboxItems as createItems };
