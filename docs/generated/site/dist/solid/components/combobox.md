# Combobox

An input combined with a list of predefined items to select.



[Interactive example](/solid/components/combobox)

## Usage guidelines

- **Combobox is a filterable Select**: Use Combobox when the input is restricted to a set of predefined selectable items, similar to [Select](/solid/components/select) but whose items are filterable using an input. Prefer using Combobox over Select when the number of items is sufficiently large to warrant filtering.
- **Avoid for simple search widgets**: Combobox does not allow free-form text input. For search widgets, consider using [Autocomplete](/solid/components/autocomplete) instead.
- **Avoid when not rendering an input**: Use [Select](/solid/components/select) instead of Combobox if no input is being rendered, which includes accessibility features specific to a listbox without an input.
- **Form controls must have an accessible name**: If `<Combobox.Input>` is the form control, label it with a native `<label>` or `<Field.Label>`, or provide an `aria-label` when no visible label is rendered. `<Combobox.Label>` labels `<Combobox.Trigger>` and is intended for the [input-inside-popup](#input-inside-popup) pattern, where the trigger is the form control. See the [forms guide](/solid/handbook/forms).
- **Closing animations**: The popup stays rendered until its closing animation finishes. See [JavaScript animations](/solid/handbook/animation#javascript-animations) for animating it with Motion and for manual control.

## Anatomy

Import the components and place them together:

```tsx
import { Combobox } from 'baseui-solid2/combobox';
<Combobox.Root>
  <Combobox.Label />

  <Combobox.InputGroup>
    <Combobox.Input />
    <Combobox.Trigger />
    <Combobox.Icon />
    <Combobox.Clear />
    <Combobox.Value />

    <Combobox.Chips>
      <Combobox.Chip>
        <Combobox.ChipRemove />
      </Combobox.Chip>
    </Combobox.Chips>
  </Combobox.InputGroup>

  <Combobox.Portal>
    <Combobox.Backdrop />
    <Combobox.Positioner>
      <Combobox.Popup>
        <Combobox.Arrow />

        <Combobox.Status />
        <Combobox.Empty />

        <Combobox.List>
          <Combobox.Row>
            <Combobox.Item>
              <Combobox.ItemIndicator />
            </Combobox.Item>
          </Combobox.Row>

          <Combobox.Separator />

          <Combobox.Group>
            <Combobox.GroupLabel />
          </Combobox.Group>

          <Combobox.Collection />
        </Combobox.List>
      </Combobox.Popup>
    </Combobox.Positioner>
  </Combobox.Portal>
</Combobox.Root>;
```

## Item values

Each `<Combobox.Item>` takes a `value` prop identifying it. Pass the item being rendered:

```tsx
<Combobox.List>
  {(item) => <Combobox.Item value={item}>{item.label}</Combobox.Item>}
</Combobox.List>;
```

That item is what `value`, `defaultValue`, and `onValueChange` receive. To store IDs instead, see [Value selection with IDs](#value-selection-with-ids).

## Examples

### Typed wrapper component

The following example shows a typed wrapper around the Combobox component with correct type inference and type safety:

```tsx
import type { JSX } from '@solidjs/web';
import { Combobox } from 'baseui-solid2/combobox';
export function MyCombobox<
  Value,
  Multiple extends boolean | undefined = false,
  Item = Value,
>(props: Combobox.Root.Props<Value, Multiple, Item>): JSX.Element {
  return <Combobox.Root {...props}>{/* ... */}</Combobox.Root>;
}
```

The third `Item` type parameter is what lets the wrapper accept a `Combobox.createItems()` collection, whose rendered item type differs from its selection value. Omit it and a collection infers `Value` as the source item type, surfacing an error on `defaultValue` rather than on `items`.

### Value selection with IDs

When your app stores IDs rather than item objects, use `Combobox.createItems` with `getValue` and `getLabel` to derive each item's selection value and display label.

With static data, create the collection at module scope. The accessor parameters are inferred from `users`. Pass the derived ID to the `value` prop of `<Combobox.Item>`, not the item being rendered:

```tsx
const items = Combobox.createItems(users, {
  getValue: (user) => user.id,
  getLabel: (user) => user.name,
});
<Combobox.Root items={items}>
  <Combobox.List>
    {(user) => <Combobox.Item value={user.id}>{user.name}</Combobox.Item>}
  </Combobox.List>
</Combobox.Root>;
```

Selection props and events use the derived IDs, while list rendering continues to receive the original items. The derived label is also used for filtering and typeahead.

When the data is loaded or replaced at runtime, memoize the collection on it so that it is rebuilt only when the data changes:

```tsx
import { createMemo } from 'solid-js';
const items = createMemo(() =>
  Combobox.createItems(users(), {
    getValue: (user) => user.id,
    getLabel: (user) => user.name,
  }),
);
```

[Interactive example](/solid/components/combobox)

As a rule of thumb, use primitive items for simple lists, object values when the selected record is useful application state, and `createItems()` when selection should use a stable primitive ID while rendering and filtering still use object records.

Stable IDs preserve item matching when an async data library replaces row objects during a refetch. With object values, use `isItemEqualToValue` to compare their IDs instead.

When results are filtered externally (for example, by a server-side search), `items` represents records known to the app, while `filteredItems` represents the current result window displayed in the popup. Pass source items rather than derived values to `filteredItems`, preserving the flat or grouped structure of `items`:

```tsx
import { createMemo } from 'solid-js';
const items = createMemo(() =>
  Combobox.createItems(knownUsers(), {
    getValue: (user) => user.id,
    getLabel: (user) => user.name,
  }),
);
<Combobox.Root
  items={items()}
  filteredItems={searchResults}
  value={selectedUserId}
  onValueChange={setSelectedUserId}
/>;
```

Include the selected user's record in `knownUsers` so its label remains available when it is outside `searchResults`. Alternatively, provide `itemToStringLabel` when the label can be derived from the selected value alone.

### Multiple select

The combobox can allow multiple selections by adding the `multiple` prop to `<Combobox.Root>`.
Selection chips are rendered with `<Combobox.Chip>` inside the input that can be removed.

[Interactive example](/solid/components/combobox)

In order for screen readers to announce how to reach and remove the chips, add `aria-description` to `<Combobox.Chip>` and `<Combobox.Input>`, alongside the `aria-label` on `<Combobox.Chips>` and `<Combobox.ChipRemove>`.
Base UI does not ship these strings. Translate them together with the rest of your interface.

Visible chips can be limited by slicing the selected values rendered in `<Combobox.Value>`:

```tsx
import { For } from 'solid-js';
const CHIP_LIMIT = 3;
<Combobox.Value>
  {(selectedValue: string[]) => {
    const visibleValue = selectedValue.slice(0, CHIP_LIMIT);
    const hiddenCount = selectedValue.length - visibleValue.length;
    return (
      <>
        <For each={visibleValue}>
          {(item) => (
            <Combobox.Chip aria-description="Press Backspace or Delete to remove">
              {item}
              <Combobox.ChipRemove aria-label={`Remove ${item}`} />
            </Combobox.Chip>
          )}
        </For>

        {hiddenCount > 0 && <span>{`+${hiddenCount} more`}</span>}

        <Combobox.Input
          aria-description={
            selectedValue.length > 0
              ? `${selectedValue.length} selected. From the start of the input, press Left Arrow to focus the selected items`
              : undefined
          }
        />
      </>
    );
  }}
</Combobox.Value>;
```

#### Keeping the filter after selection

In `multiple` mode, selecting an item clears the typed filter and closes the popup when the input is rendered outside it. To let users pick several results from one query, cancel the relevant change request.

Which request to cancel depends on the input's placement. When the input is outside the popup, cancel the `item-press` close request in `onOpenChange`. When it is inside, cancel the clear request in `onInputValueChange`, marked with `eventDetails.isItemPress`.

```tsx
<Combobox.Root
  multiple
  onOpenChange={(open, eventDetails) => {
    if (!open && eventDetails.reason === 'item-press') {
      eventDetails.cancel();
    }
  }}
>
  {/* ... */}
</Combobox.Root>;
```

```tsx
<Combobox.Root
  multiple
  onInputValueChange={(value, eventDetails) => {
    if (eventDetails.isItemPress) {
      eventDetails.cancel();
    }
  }}
>
  {/* ... */}
</Combobox.Root>;
```

The typed filter still resets once the popup closes.

### Input inside popup

`<Combobox.Input>` can be rendered inside `<Combobox.Popup>` to create a searchable select popup.

[Interactive example](/solid/components/combobox)

Use `<Combobox.Label>` to provide a visible label for the combobox trigger in this pattern:

```tsx
<Combobox.Root>
  <Combobox.Label>Favorite fruit</Combobox.Label>
  {/* ... */}
</Combobox.Root>;
```

`<Combobox.Label>` renders a `<div>`, so clicking it focuses the combobox trigger without opening the popup.

### Grouped

Organize related options with `<Combobox.Group>` and `<Combobox.GroupLabel>` to add section headings inside the popup.

Groups are represented by an array of objects with an `items` property, which itself is an array of individual items for each group. An extra property, such as `value`, can be provided for the heading text when rendering the group label.

```tsx
interface ProduceGroupItem {
  value: string;
  items: string[];
}
const groups: ProduceGroupItem[] = [
  {
    value: 'Fruits',
    items: ['Apple', 'Banana', 'Orange'],
  },
  {
    value: 'Vegetables',
    items: ['Carrot', 'Lettuce', 'Spinach'],
  },
];
```

[Interactive example](/solid/components/combobox)

### Async search (single)

Load items from a remote source by fetching on input changes. Keep the selected item in the `items` list so it remains available while new results stream in. This pattern avoids needing to load items upfront.

[Interactive example](/solid/components/combobox)

### Async search (multiple)

Load items from a remote source by fetching on input changes while supporting multiple selections. Selected items remain available in the list while new matches stream in. This pattern avoids needing to load items upfront.

[Interactive example](/solid/components/combobox)

### Creatable

Create a new item when the filter matches no items, opening a creation `<Dialog>`.

[Interactive example](/solid/components/combobox)

### Virtualized

Efficiently handle large datasets using a virtualization library like `@tanstack/solid-virtual`.

[Interactive example](/solid/components/combobox)

When using `highlightItem()`, scroll your virtualizer to the index reported by `onItemHighlighted` for the `'imperative-action'` reason. The highlighted item may not be rendered yet.

#### Memoizing items

Solid components execute once per mount. The upstream React example uses [`React.memo`](https://react.dev/reference/react/memo); in Solid, read the item through props inside JSX. This does not reduce the initial mount cost: with a large enough number of items, the mount cost dominates, and virtualization becomes necessary to keep the open interaction fast on low-end devices.

```tsx
interface Fruit {
  id: string;
  label: string;
}
const FruitItem = function FruitItem(props: { item: Fruit }) {
  return (
    <Combobox.Item value={props.item}>
      <Combobox.ItemIndicator />
      <span>{props.item.label}</span>
    </Combobox.Item>
  );
};
<Combobox.List>{(item: Fruit) => <FruitItem item={item} />}</Combobox.List>;
```

### Custom keyboard shortcuts

Use `actionsRef.highlightItem()` to navigate the open list with custom keyboard shortcuts, as shown in [the Autocomplete example](/solid/components/autocomplete#custom-keyboard-shortcuts).

## API reference

### Root



| Prop | Type | Description |
| --- | --- | --- |
| name | string \| undefined |  |
| defaultValue | (Multiple extends true ? readonly Value[] : Value) \| null \| undefined |  |
| value | (Multiple extends true ? readonly Value[] : Value) \| null \| undefined |  |
| onValueChange | ((value: Multiple extends true ? Value[] : Value \| null, details: AriaCombobox.ChangeEventDetails) => void) \| undefined |  |
| defaultInputValue | AriaComboboxInputValue \| undefined |  |
| inputValue | AriaComboboxInputValue \| undefined |  |
| onInputValueChange | ((value: string, details: AriaCombobox.ChangeEventDetails) => void) \| undefined |  |
| defaultOpen | boolean \| undefined |  |
| open | boolean \| undefined |  |
| onOpenChange | ((open: boolean, details: AriaCombobox.OpenChangeEventDetails) => void) \| undefined |  |
| autoHighlight | boolean \| undefined |  |
| highlightItemOnHover | boolean \| undefined |  |
| actionsRef | { current: AriaCombobox.Actions \| null; } \| ((actions: AriaCombobox.Actions \| null) => void) \| undefined |  |
| autoComplete | string \| undefined |  |
| filter | ((item: Item, query: string, itemToString?: ((item: Item) => string) \| undefined) => boolean) \| null \| undefined |  |
| filteredItems | readonly Item[] \| readonly Group<Item>[] \| undefined |  |
| form | string \| undefined |  |
| grid | boolean \| undefined |  |
| inline | boolean \| undefined |  |
| isItemEqualToValue | ((a: Value, b: Value) => boolean) \| undefined |  |
| itemToStringLabel | ((value: Value) => string) \| undefined |  |
| itemToStringValue | ((value: Value) => string) \| undefined |  |
| items | readonly Item[] \| readonly Group<Item>[] \| ComboboxItemCollection<Item, Value> \| undefined |  |
| limit | number \| undefined |  |
| locale | Intl.LocalesArgument |  |
| loopFocus | boolean \| undefined |  |
| modal | boolean \| undefined |  |
| multiple | Multiple \| undefined |  |
| onItemHighlighted | ((value: Value \| undefined, details: AriaCombobox.HighlightEventDetails) => void) \| undefined |  |
| onOpenChangeComplete | ((open: boolean) => void) \| undefined |  |
| openOnInputClick | boolean \| undefined |  |
| virtualized | boolean \| undefined |  |
| disabled | boolean \| undefined |  |
| readOnly | boolean \| undefined |  |
| required | boolean \| undefined |  |
| inputRef | JSX.Ref<HTMLInputElement> |  |
| id | string \| undefined |  |
| children | JSX.Element |  |

### Label



| Prop | Type | Description |
| --- | --- | --- |
| class | JSX.ClassValue \| ((state: Readonly<ComboboxLabelState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ComboboxLabelState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ComboboxLabelState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Value



| Prop | Type | Description |
| --- | --- | --- |
| placeholder | JSX.Element |  |
| children | JSX.Element \| ((selectedValue: any) => JSX.Element) |  |

### Icon



| Prop | Type | Description |
| --- | --- | --- |
| class | JSX.ClassValue \| ((state: Readonly<AutocompleteIconState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AutocompleteIconState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, AutocompleteIconState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Input



| Prop | Type | Description |
| --- | --- | --- |
| disabled | boolean \| undefined |  |
| class | JSX.ClassValue \| ((state: Readonly<AutocompleteInputState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AutocompleteInputState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, AutocompleteInputState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### InputGroup



| Prop | Type | Description |
| --- | --- | --- |
| class | JSX.ClassValue \| ((state: Readonly<ComboboxInputGroupState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ComboboxInputGroupState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ComboboxInputGroupState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Clear



| Prop | Type | Description |
| --- | --- | --- |
| nativeButton | boolean \| undefined |  |
| disabled | boolean \| undefined |  |
| class | JSX.ClassValue \| ((state: Readonly<AutocompleteClearState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AutocompleteClearState>) => StyleValue) |  |
| keepMounted | boolean \| undefined |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, AutocompleteClearState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Trigger



| Prop | Type | Description |
| --- | --- | --- |
| nativeButton | boolean \| undefined |  |
| disabled | boolean \| undefined |  |
| class | JSX.ClassValue \| ((state: Readonly<ComboboxTriggerState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ComboboxTriggerState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ComboboxTriggerState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Chips



| Prop | Type | Description |
| --- | --- | --- |
| class | JSX.ClassValue \| ((state: Readonly<ComboboxChipsState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ComboboxChipsState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ComboboxChipsState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Chip



| Prop | Type | Description |
| --- | --- | --- |
| class | JSX.ClassValue \| ((state: Readonly<ComboboxChipState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ComboboxChipState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ComboboxChipState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### ChipRemove



| Prop | Type | Description |
| --- | --- | --- |
| nativeButton | boolean \| undefined |  |
| disabled | boolean \| undefined |  |
| class | JSX.ClassValue \| ((state: Readonly<ComboboxChipRemoveState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ComboboxChipRemoveState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ComboboxChipRemoveState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### List



| Prop | Type | Description |
| --- | --- | --- |
| children | JSX.Element \| ((item: any, index: number) => JSX.Element) |  |
| class | JSX.ClassValue \| ((state: Readonly<AutocompleteListState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AutocompleteListState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, AutocompleteListState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Portal



| Prop | Type | Description |
| --- | --- | --- |
| portalOwnerRole | "search" \| "link" \| "none" \| "button" \| "grid" \| "article" \| "dialog" \| "figure" \| "form" \| "img" \| "main" \| "menu" \| "meter" \| "option" \| "table" \| "marquee" \| "menuitem" \| "switch" \| "math" \| "directory" \| "document" \| "menubar" \| "status" \| "toolbar" \| "alert" \| "group" \| "region" \| "navigation" \| "checkbox" \| "listbox" \| "radio" \| "cell" \| "row" \| "listitem" \| "progressbar" \| "separator" \| "tab" \| "tabpanel" \| "tooltip" \| "treeitem" \| "scrollbar" \| JSX.RemoveAttribute \| "list" \| "tree" \| "alertdialog" \| "application" \| "banner" \| "columnheader" \| "combobox" \| "complementary" \| "contentinfo" \| "definition" \| "feed" \| "gridcell" \| "heading" \| "log" \| "menuitemcheckbox" \| "menuitemradio" \| "note" \| "presentation" \| "radiogroup" \| "rowgroup" \| "rowheader" \| "searchbox" \| "slider" \| "spinbutton" \| "tablist" \| "term" \| "textbox" \| "timer" \| "treegrid" |  |
| preserveTabOrder | boolean \| undefined |  |
| container | PortalContainer |  |
| class | JSX.ClassValue \| ((state: Readonly<{}>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<{}>) => StyleValue) |  |
| keepMounted | boolean \| undefined |  |
| render | ComponentRenderFn<JSX.HTMLAttributes<HTMLElement>, {}> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Backdrop



| Prop | Type | Description |
| --- | --- | --- |
| class | JSX.ClassValue \| ((state: Readonly<AutocompleteBackdropState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AutocompleteBackdropState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, AutocompleteBackdropState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Positioner



| Prop | Type | Description |
| --- | --- | --- |
| disableAnchorTracking | boolean \| undefined |  |
| align | Align \| undefined |  |
| alignOffset | number \| OffsetFunction \| undefined |  |
| side | Side \| undefined |  |
| sideOffset | number \| OffsetFunction \| undefined |  |
| arrowPadding | number \| undefined |  |
| anchor | ReferenceType \| (() => ReferenceType \| null) \| null \| undefined |  |
| collisionAvoidance | { side?: "flip" \| "shift" \| "none"; align?: "flip" \| "shift" \| "none"; fallbackAxisSide?: "start" \| "end" \| "none"; } \| undefined |  |
| collisionBoundary | Boundary \| "clipping-ancestors" \| undefined |  |
| collisionPadding | Padding \| undefined |  |
| sticky | boolean \| undefined |  |
| positionMethod | "fixed" \| "absolute" \| undefined |  |
| class | JSX.ClassValue \| ((state: Readonly<AutocompletePositionerState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AutocompletePositionerState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, AutocompletePositionerState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Popup



| Prop | Type | Description |
| --- | --- | --- |
| initialFocus | FocusTarget \| undefined |  |
| finalFocus | FocusTarget \| undefined |  |
| class | JSX.ClassValue \| ((state: Readonly<AutocompletePopupState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AutocompletePopupState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, AutocompletePopupState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Arrow



| Prop | Type | Description |
| --- | --- | --- |
| class | JSX.ClassValue \| ((state: Readonly<AutocompleteArrowState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AutocompleteArrowState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, AutocompleteArrowState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Status



| Prop | Type | Description |
| --- | --- | --- |
| class | JSX.ClassValue \| ((state: Readonly<AutocompleteStatusState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AutocompleteStatusState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, AutocompleteStatusState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Empty



| Prop | Type | Description |
| --- | --- | --- |
| class | JSX.ClassValue \| ((state: Readonly<AutocompleteEmptyState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AutocompleteEmptyState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, AutocompleteEmptyState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Collection



| Prop | Type | Description |
| --- | --- | --- |
| children | (item: any, index: number) => JSX.Element |  |

### Row



| Prop | Type | Description |
| --- | --- | --- |
| class | JSX.ClassValue \| ((state: Readonly<AutocompleteRowState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AutocompleteRowState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, AutocompleteRowState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Item



| Prop | Type | Description |
| --- | --- | --- |
| value | any |  |
| index | number \| undefined |  |
| nativeButton | boolean \| undefined |  |
| disabled | boolean \| undefined |  |
| class | JSX.ClassValue \| ((state: Readonly<ComboboxItemState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ComboboxItemState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ComboboxItemState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### ItemIndicator



| Prop | Type | Description |
| --- | --- | --- |
| class | JSX.ClassValue \| ((state: Readonly<ComboboxItemIndicatorState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ComboboxItemIndicatorState>) => StyleValue) |  |
| keepMounted | boolean \| undefined |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ComboboxItemIndicatorState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Group



| Prop | Type | Description |
| --- | --- | --- |
| items | readonly any[] \| undefined |  |
| class | JSX.ClassValue \| ((state: Readonly<AutocompleteGroupState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AutocompleteGroupState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, AutocompleteGroupState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### GroupLabel



| Prop | Type | Description |
| --- | --- | --- |
| class | JSX.ClassValue \| ((state: Readonly<AutocompleteGroupLabelState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AutocompleteGroupLabelState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, AutocompleteGroupLabelState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Separator



| Prop | Type | Description |
| --- | --- | --- |
| orientation | Orientation \| undefined |  |
| class | JSX.ClassValue \| ((state: Readonly<SelectSeparatorState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<SelectSeparatorState>) => StyleValue) |  |
| render | ComponentRenderFn<JSX.HTMLAttributes<HTMLDivElement>, SelectSeparatorState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

## useFilter

Matches items against a query using `Intl.Collator` for robust string matching.
This utility is used when externally filtering items.
Pass the result to the `filter` prop of `<Combobox.Root>`.



| Prop | Type | Description |
| --- | --- | --- |
| options | UseComboboxFilterOptions \| undefined |  |

## useFilteredItems

Returns the internally filtered items when called inside `<Combobox.Root>`.

Native accessor; use inside JSX/memos to observe held/async result windows.

| Prop | Type | Description |
| --- | --- | --- |


## createItems

Normalizes items into a collection for the `items` prop of `<Combobox.Root>`, deriving each item's selection value and label before rendering.

Lazy, root-independent projection. For reactive data, create this inside a memo.

| Prop | Type | Description |
| --- | --- | --- |
| data | (ComboboxItemsData<Item> & RejectGroupShapedItems<Item>) \| undefined |  |
| options | CreateComboboxItemsOptions<Item, Value> |  |

