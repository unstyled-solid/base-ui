<a id="combobox"></a>

# Combobox

An input combined with a list of predefined items to select.

[Open mounted Solid demo: combobox/hero](/solid/components/combobox)

<a id="usage-guidelines"></a>

## Usage guidelines

- **Combobox is a filterable Select**: Use Combobox when the input is restricted to a set of predefined selectable items, similar to [Select](/solid/components/select) but whose items are filterable using an input. Prefer using Combobox over Select when the number of items is sufficiently large to warrant filtering.
- **Avoid for simple search widgets**: Combobox does not allow free-form text input. For search widgets, consider using [Autocomplete](/solid/components/autocomplete) instead.
- **Avoid when not rendering an input**: Use [Select](/solid/components/select) instead of Combobox if no input is being rendered, which includes accessibility features specific to a listbox without an input.
- **Form controls must have an accessible name**: If `<Combobox.Input>` is the form control, label it with a native `<label>` or `<Field.Label>`, or provide an `aria-label` when no visible label is rendered. `<Combobox.Label>` labels `<Combobox.Trigger>` and is intended for the [input-inside-popup](#input-inside-popup) pattern, where the trigger is the form control. See the [forms guide](/solid/handbook/forms).
- **Closing animations**: The popup stays rendered until its closing animation finishes. See [JavaScript animations](/solid/handbook/animation#javascript-animations) for animating it with Motion and for manual control.

<a id="anatomy"></a>

## Anatomy

Import the components and place them together:

```tsx
import { Combobox } from '@unstyled-solid/base-ui/combobox';
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

<a id="item-values"></a>

## Item values

Each `<Combobox.Item>` takes a `value` prop identifying it. Pass the item being rendered:

```tsx
<Combobox.List>
  {(item) => <Combobox.Item value={item}>{item.label}</Combobox.Item>}
</Combobox.List>;
```

That item is what `value`, `defaultValue`, and `onValueChange` receive. To store IDs instead, see [Value selection with IDs](#value-selection-with-ids).

<a id="examples"></a>

## Examples

<a id="typed-wrapper-component"></a>

### Typed wrapper component

The following example shows a typed wrapper around the Combobox component with correct type inference and type safety:

```tsx
import type { JSX } from '@solidjs/web';
import { Combobox } from '@unstyled-solid/base-ui/combobox';
export function MyCombobox<
  Value,
  Multiple extends boolean | undefined = false,
  Item = Value,
>(props: Combobox.Root.Props<Value, Multiple, Item>): JSX.Element {
  return <Combobox.Root {...props}>{/* ... */}</Combobox.Root>;
}
```

The third `Item` type parameter is what lets the wrapper accept a `Combobox.createItems()` collection, whose rendered item type differs from its selection value. Omit it and a collection infers `Value` as the source item type, surfacing an error on `defaultValue` rather than on `items`.

<a id="value-selection-with-ids"></a>

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

[Open mounted Solid demo: combobox/create-items](/solid/components/combobox)

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

<a id="multiple-select"></a>

### Multiple select

The combobox can allow multiple selections by adding the `multiple` prop to `<Combobox.Root>`.
Selection chips are rendered with `<Combobox.Chip>` inside the input that can be removed.

[Open mounted Solid demo: combobox/multiple](/solid/components/combobox)

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

<a id="keeping-the-filter-after-selection"></a>

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

<a id="input-inside-popup"></a>

### Input inside popup

`<Combobox.Input>` can be rendered inside `<Combobox.Popup>` to create a searchable select popup.

[Open mounted Solid demo: combobox/input-inside-popup](/solid/components/combobox)

Use `<Combobox.Label>` to provide a visible label for the combobox trigger in this pattern:

```tsx
<Combobox.Root>
  <Combobox.Label>Favorite fruit</Combobox.Label>
  {/* ... */}
</Combobox.Root>;
```

`<Combobox.Label>` renders a `<div>`, so clicking it focuses the combobox trigger without opening the popup.

<a id="grouped"></a>

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

[Open mounted Solid demo: combobox/grouped](/solid/components/combobox)

<a id="async-search-single"></a>

### Async search (single)

Load items from a remote source by fetching on input changes. Keep the selected item in the `items` list so it remains available while new results stream in. This pattern avoids needing to load items upfront.

[Open mounted Solid demo: combobox/async-single](/solid/components/combobox)

<a id="async-search-multiple"></a>

### Async search (multiple)

Load items from a remote source by fetching on input changes while supporting multiple selections. Selected items remain available in the list while new matches stream in. This pattern avoids needing to load items upfront.

[Open mounted Solid demo: combobox/async-multiple](/solid/components/combobox)

<a id="creatable"></a>

### Creatable

Create a new item when the filter matches no items, opening a creation `<Dialog>`.

[Open mounted Solid demo: combobox/creatable](/solid/components/combobox)

<a id="virtualized"></a>

### Virtualized

Efficiently handle large datasets using a virtualization library like `@tanstack/solid-virtual`.

[Open mounted Solid demo: combobox/virtualized](/solid/components/combobox)

When using `highlightItem()`, scroll your virtualizer to the index reported by `onItemHighlighted` for the `'imperative-action'` reason. The highlighted item may not be rendered yet.

<a id="memoizing-items"></a>

#### Solid item components

Solid components execute once per mount. Read item properties through props inside JSX so updates remain reactive. For large datasets, virtualization reduces the number of mounted items; a wrapper component does not reduce initial mount cost.

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

<a id="custom-keyboard-shortcuts"></a>

### Custom keyboard shortcuts

Use `actionsRef.highlightItem()` to navigate the open list with custom keyboard shortcuts, as shown in [the Autocomplete example](/solid/components/autocomplete#custom-keyboard-shortcuts).

<a id="api-reference"></a>

## API reference

<a id="root"></a>

### Root

<a id="api-436f6d626f626f782e526f6f74"></a>

<a id="comboboxroot"></a>

### Combobox.Root

Declaration: `packages/solid/build/types/combobox/root/ComboboxRoot.d.ts:11`

#### Declaration

```typescript
<Value, Multiple extends boolean | undefined = false, Item = Value>(props: ComboboxRootProps<Value, Multiple, Item>) => JSX.Element
```

<a id="api-436f6d626f626f782e526f6f742e2470726f70732e6e616d65"></a>

<a id="ComboboxRoot-name"></a>

<a id="api-436f6d626f626f782e526f6f742e2470726f70732e64656661756c7456616c7565"></a>

<a id="ComboboxRoot-defaultValue"></a>

<a id="api-436f6d626f626f782e526f6f742e2470726f70732e76616c7565"></a>

<a id="ComboboxRoot-value"></a>

<a id="api-436f6d626f626f782e526f6f742e2470726f70732e6f6e56616c75654368616e6765"></a>

<a id="ComboboxRoot-onValueChange"></a>

<a id="api-436f6d626f626f782e526f6f742e2470726f70732e64656661756c74496e70757456616c7565"></a>

<a id="ComboboxRoot-defaultInputValue"></a>

<a id="api-436f6d626f626f782e526f6f742e2470726f70732e696e70757456616c7565"></a>

<a id="ComboboxRoot-inputValue"></a>

<a id="api-436f6d626f626f782e526f6f742e2470726f70732e6f6e496e70757456616c75654368616e6765"></a>

<a id="ComboboxRoot-onInputValueChange"></a>

<a id="api-436f6d626f626f782e526f6f742e2470726f70732e64656661756c744f70656e"></a>

<a id="ComboboxRoot-defaultOpen"></a>

<a id="api-436f6d626f626f782e526f6f742e2470726f70732e6f70656e"></a>

<a id="ComboboxRoot-open"></a>

<a id="api-436f6d626f626f782e526f6f742e2470726f70732e6f6e4f70656e4368616e6765"></a>

<a id="ComboboxRoot-onOpenChange"></a>

<a id="api-436f6d626f626f782e526f6f742e2470726f70732e6175746f486967686c69676874"></a>

<a id="ComboboxRoot-autoHighlight"></a>

<a id="api-436f6d626f626f782e526f6f742e2470726f70732e686967686c696768744974656d4f6e486f766572"></a>

<a id="ComboboxRoot-highlightItemOnHover"></a>

<a id="api-436f6d626f626f782e526f6f742e2470726f70732e616374696f6e73526566"></a>

<a id="ComboboxRoot-actionsRef"></a>

<a id="api-436f6d626f626f782e526f6f742e2470726f70732e6175746f436f6d706c657465"></a>

<a id="ComboboxRoot-autoComplete"></a>

<a id="api-436f6d626f626f782e526f6f742e2470726f70732e66696c746572"></a>

<a id="ComboboxRoot-filter"></a>

<a id="api-436f6d626f626f782e526f6f742e2470726f70732e66696c74657265644974656d73"></a>

<a id="ComboboxRoot-filteredItems"></a>

<a id="api-436f6d626f626f782e526f6f742e2470726f70732e666f726d"></a>

<a id="ComboboxRoot-form"></a>

<a id="api-436f6d626f626f782e526f6f742e2470726f70732e67726964"></a>

<a id="ComboboxRoot-grid"></a>

<a id="api-436f6d626f626f782e526f6f742e2470726f70732e696e6c696e65"></a>

<a id="ComboboxRoot-inline"></a>

<a id="api-436f6d626f626f782e526f6f742e2470726f70732e69734974656d457175616c546f56616c7565"></a>

<a id="ComboboxRoot-isItemEqualToValue"></a>

<a id="api-436f6d626f626f782e526f6f742e2470726f70732e6974656d546f537472696e674c6162656c"></a>

<a id="ComboboxRoot-itemToStringLabel"></a>

<a id="api-436f6d626f626f782e526f6f742e2470726f70732e6974656d546f537472696e6756616c7565"></a>

<a id="ComboboxRoot-itemToStringValue"></a>

<a id="api-436f6d626f626f782e526f6f742e2470726f70732e6974656d73"></a>

<a id="ComboboxRoot-items"></a>

<a id="api-436f6d626f626f782e526f6f742e2470726f70732e6c696d6974"></a>

<a id="ComboboxRoot-limit"></a>

<a id="api-436f6d626f626f782e526f6f742e2470726f70732e6c6f63616c65"></a>

<a id="ComboboxRoot-locale"></a>

<a id="api-436f6d626f626f782e526f6f742e2470726f70732e6c6f6f70466f637573"></a>

<a id="ComboboxRoot-loopFocus"></a>

<a id="api-436f6d626f626f782e526f6f742e2470726f70732e6d6f64616c"></a>

<a id="ComboboxRoot-modal"></a>

<a id="api-436f6d626f626f782e526f6f742e2470726f70732e6d756c7469706c65"></a>

<a id="ComboboxRoot-multiple"></a>

<a id="api-436f6d626f626f782e526f6f742e2470726f70732e6f6e4974656d486967686c696768746564"></a>

<a id="ComboboxRoot-onItemHighlighted"></a>

<a id="api-436f6d626f626f782e526f6f742e2470726f70732e6f6e4f70656e4368616e6765436f6d706c657465"></a>

<a id="ComboboxRoot-onOpenChangeComplete"></a>

<a id="api-436f6d626f626f782e526f6f742e2470726f70732e6f70656e4f6e496e707574436c69636b"></a>

<a id="ComboboxRoot-openOnInputClick"></a>

<a id="api-436f6d626f626f782e526f6f742e2470726f70732e7669727475616c697a6564"></a>

<a id="ComboboxRoot-virtualized"></a>

<a id="api-436f6d626f626f782e526f6f742e2470726f70732e64697361626c6564"></a>

<a id="ComboboxRoot-disabled"></a>

<a id="api-436f6d626f626f782e526f6f742e2470726f70732e726561644f6e6c79"></a>

<a id="ComboboxRoot-readOnly"></a>

<a id="api-436f6d626f626f782e526f6f742e2470726f70732e7265717569726564"></a>

<a id="ComboboxRoot-required"></a>

<a id="api-436f6d626f626f782e526f6f742e2470726f70732e696e707574526566"></a>

<a id="ComboboxRoot-inputRef"></a>

<a id="api-436f6d626f626f782e526f6f742e2470726f70732e6964"></a>

<a id="ComboboxRoot-id"></a>

<a id="api-436f6d626f626f782e526f6f742e2470726f70732e6368696c6472656e"></a>

<a id="ComboboxRoot-children"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| name | `string \| undefined` | No | Unavailable |  |
| defaultValue | `(Multiple extends true ? readonly Value[] : Value) \| null \| undefined` | No | Unavailable |  |
| value | `(Multiple extends true ? readonly Value[] : Value) \| null \| undefined` | No | Unavailable |  |
| onValueChange | `((value: Multiple extends true ? Value[] : Value \| null, details: AriaCombobox.ChangeEventDetails) => void) \| undefined` | No | Unavailable |  |
| defaultInputValue | `AriaComboboxInputValue \| undefined` | No | Unavailable |  |
| inputValue | `AriaComboboxInputValue \| undefined` | No | Unavailable |  |
| onInputValueChange | `((value: string, details: AriaCombobox.ChangeEventDetails) => void) \| undefined` | No | Unavailable |  |
| defaultOpen | `boolean \| undefined` | No | Unavailable |  |
| open | `boolean \| undefined` | No | Unavailable |  |
| onOpenChange | `((open: boolean, details: AriaCombobox.OpenChangeEventDetails) => void) \| undefined` | No | Unavailable |  |
| autoHighlight | `boolean \| undefined` | No | Unavailable |  |
| highlightItemOnHover | `boolean \| undefined` | No | Unavailable |  |
| actionsRef | `{ current: AriaCombobox.Actions \| null; } \| ((actions: AriaCombobox.Actions \| null) => void) \| undefined` | No | Unavailable |  |
| autoComplete | `string \| undefined` | No | Unavailable |  |
| filter | `((item: Item, query: string, itemToString?: ((item: Item) => string) \| undefined) => boolean) \| null \| undefined` | No | Unavailable |  |
| filteredItems | `readonly Item[] \| readonly Group<Item>[] \| undefined` | No | Unavailable |  |
| form | `string \| undefined` | No | Unavailable |  |
| grid | `boolean \| undefined` | No | Unavailable |  |
| inline | `boolean \| undefined` | No | Unavailable |  |
| isItemEqualToValue | `((a: Value, b: Value) => boolean) \| undefined` | No | Unavailable |  |
| itemToStringLabel | `((value: Value) => string) \| undefined` | No | Unavailable |  |
| itemToStringValue | `((value: Value) => string) \| undefined` | No | Unavailable |  |
| items | `readonly Item[] \| readonly Group<Item>[] \| ComboboxItemCollection<Item, Value> \| undefined` | No | Unavailable |  |
| limit | `number \| undefined` | No | Unavailable |  |
| locale | `Intl.LocalesArgument` | No | Unavailable |  |
| loopFocus | `boolean \| undefined` | No | Unavailable |  |
| modal | `boolean \| undefined` | No | Unavailable |  |
| multiple | `Multiple \| undefined` | No | Unavailable |  |
| onItemHighlighted | `((value: Value \| undefined, details: AriaCombobox.HighlightEventDetails) => void) \| undefined` | No | Unavailable |  |
| onOpenChangeComplete | `((open: boolean) => void) \| undefined` | No | Unavailable |  |
| openOnInputClick | `boolean \| undefined` | No | Unavailable |  |
| virtualized | `boolean \| undefined` | No | Unavailable |  |
| disabled | `boolean \| undefined` | No | Unavailable |  |
| readOnly | `boolean \| undefined` | No | Unavailable |  |
| required | `boolean \| undefined` | No | Unavailable |  |
| inputRef | `JSX.Ref<HTMLInputElement>` | No | Unavailable |  |
| id | `string \| undefined` | No | Unavailable |  |
| children | `JSX.Element` | No | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6d626f626f782e526f6f742e50726f7073"></a>

<a id="comboboxrootprops"></a>

### Related exported type: Combobox.Root.Props

Declaration: `packages/solid/build/types/combobox/root/ComboboxRoot.d.ts:21`

#### Declaration

```typescript
Props<Value, Multiple, Item>
```

<a id="api-436f6d626f626f782e526f6f742e50726f70732e6e616d65"></a>

<a id="ComboboxRootProps-name"></a>

<a id="api-436f6d626f626f782e526f6f742e50726f70732e64656661756c7456616c7565"></a>

<a id="ComboboxRootProps-defaultValue"></a>

<a id="api-436f6d626f626f782e526f6f742e50726f70732e76616c7565"></a>

<a id="ComboboxRootProps-value"></a>

<a id="api-436f6d626f626f782e526f6f742e50726f70732e6f6e56616c75654368616e6765"></a>

<a id="ComboboxRootProps-onValueChange"></a>

<a id="api-436f6d626f626f782e526f6f742e50726f70732e64656661756c74496e70757456616c7565"></a>

<a id="ComboboxRootProps-defaultInputValue"></a>

<a id="api-436f6d626f626f782e526f6f742e50726f70732e696e70757456616c7565"></a>

<a id="ComboboxRootProps-inputValue"></a>

<a id="api-436f6d626f626f782e526f6f742e50726f70732e6f6e496e70757456616c75654368616e6765"></a>

<a id="ComboboxRootProps-onInputValueChange"></a>

<a id="api-436f6d626f626f782e526f6f742e50726f70732e64656661756c744f70656e"></a>

<a id="ComboboxRootProps-defaultOpen"></a>

<a id="api-436f6d626f626f782e526f6f742e50726f70732e6f70656e"></a>

<a id="ComboboxRootProps-open"></a>

<a id="api-436f6d626f626f782e526f6f742e50726f70732e6f6e4f70656e4368616e6765"></a>

<a id="ComboboxRootProps-onOpenChange"></a>

<a id="api-436f6d626f626f782e526f6f742e50726f70732e6175746f486967686c69676874"></a>

<a id="ComboboxRootProps-autoHighlight"></a>

<a id="api-436f6d626f626f782e526f6f742e50726f70732e686967686c696768744974656d4f6e486f766572"></a>

<a id="ComboboxRootProps-highlightItemOnHover"></a>

<a id="api-436f6d626f626f782e526f6f742e50726f70732e616374696f6e73526566"></a>

<a id="ComboboxRootProps-actionsRef"></a>

<a id="api-436f6d626f626f782e526f6f742e50726f70732e6175746f436f6d706c657465"></a>

<a id="ComboboxRootProps-autoComplete"></a>

<a id="api-436f6d626f626f782e526f6f742e50726f70732e66696c746572"></a>

<a id="ComboboxRootProps-filter"></a>

<a id="api-436f6d626f626f782e526f6f742e50726f70732e66696c74657265644974656d73"></a>

<a id="ComboboxRootProps-filteredItems"></a>

<a id="api-436f6d626f626f782e526f6f742e50726f70732e666f726d"></a>

<a id="ComboboxRootProps-form"></a>

<a id="api-436f6d626f626f782e526f6f742e50726f70732e67726964"></a>

<a id="ComboboxRootProps-grid"></a>

<a id="api-436f6d626f626f782e526f6f742e50726f70732e696e6c696e65"></a>

<a id="ComboboxRootProps-inline"></a>

<a id="api-436f6d626f626f782e526f6f742e50726f70732e69734974656d457175616c546f56616c7565"></a>

<a id="ComboboxRootProps-isItemEqualToValue"></a>

<a id="api-436f6d626f626f782e526f6f742e50726f70732e6974656d546f537472696e674c6162656c"></a>

<a id="ComboboxRootProps-itemToStringLabel"></a>

<a id="api-436f6d626f626f782e526f6f742e50726f70732e6974656d546f537472696e6756616c7565"></a>

<a id="ComboboxRootProps-itemToStringValue"></a>

<a id="api-436f6d626f626f782e526f6f742e50726f70732e6974656d73"></a>

<a id="ComboboxRootProps-items"></a>

<a id="api-436f6d626f626f782e526f6f742e50726f70732e6c696d6974"></a>

<a id="ComboboxRootProps-limit"></a>

<a id="api-436f6d626f626f782e526f6f742e50726f70732e6c6f63616c65"></a>

<a id="ComboboxRootProps-locale"></a>

<a id="api-436f6d626f626f782e526f6f742e50726f70732e6c6f6f70466f637573"></a>

<a id="ComboboxRootProps-loopFocus"></a>

<a id="api-436f6d626f626f782e526f6f742e50726f70732e6d6f64616c"></a>

<a id="ComboboxRootProps-modal"></a>

<a id="api-436f6d626f626f782e526f6f742e50726f70732e6d756c7469706c65"></a>

<a id="ComboboxRootProps-multiple"></a>

<a id="api-436f6d626f626f782e526f6f742e50726f70732e6f6e4974656d486967686c696768746564"></a>

<a id="ComboboxRootProps-onItemHighlighted"></a>

<a id="api-436f6d626f626f782e526f6f742e50726f70732e6f6e4f70656e4368616e6765436f6d706c657465"></a>

<a id="ComboboxRootProps-onOpenChangeComplete"></a>

<a id="api-436f6d626f626f782e526f6f742e50726f70732e6f70656e4f6e496e707574436c69636b"></a>

<a id="ComboboxRootProps-openOnInputClick"></a>

<a id="api-436f6d626f626f782e526f6f742e50726f70732e7669727475616c697a6564"></a>

<a id="ComboboxRootProps-virtualized"></a>

<a id="api-436f6d626f626f782e526f6f742e50726f70732e64697361626c6564"></a>

<a id="ComboboxRootProps-disabled"></a>

<a id="api-436f6d626f626f782e526f6f742e50726f70732e726561644f6e6c79"></a>

<a id="ComboboxRootProps-readOnly"></a>

<a id="api-436f6d626f626f782e526f6f742e50726f70732e7265717569726564"></a>

<a id="ComboboxRootProps-required"></a>

<a id="api-436f6d626f626f782e526f6f742e50726f70732e696e707574526566"></a>

<a id="ComboboxRootProps-inputRef"></a>

<a id="api-436f6d626f626f782e526f6f742e50726f70732e6964"></a>

<a id="ComboboxRootProps-id"></a>

<a id="api-436f6d626f626f782e526f6f742e50726f70732e6368696c6472656e"></a>

<a id="ComboboxRootProps-children"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| name | `string \| undefined` | No | Unavailable |  |
| defaultValue | `(Multiple extends true ? readonly Value[] : Value) \| null \| undefined` | No | Unavailable |  |
| value | `(Multiple extends true ? readonly Value[] : Value) \| null \| undefined` | No | Unavailable |  |
| onValueChange | `((value: Multiple extends true ? Value[] : Value \| null, details: AriaCombobox.ChangeEventDetails) => void) \| undefined` | No | Unavailable |  |
| defaultInputValue | `AriaComboboxInputValue \| undefined` | No | Unavailable |  |
| inputValue | `AriaComboboxInputValue \| undefined` | No | Unavailable |  |
| onInputValueChange | `((value: string, details: AriaCombobox.ChangeEventDetails) => void) \| undefined` | No | Unavailable |  |
| defaultOpen | `boolean \| undefined` | No | Unavailable |  |
| open | `boolean \| undefined` | No | Unavailable |  |
| onOpenChange | `((open: boolean, details: AriaCombobox.OpenChangeEventDetails) => void) \| undefined` | No | Unavailable |  |
| autoHighlight | `boolean \| undefined` | No | Unavailable |  |
| highlightItemOnHover | `boolean \| undefined` | No | Unavailable |  |
| actionsRef | `{ current: AriaCombobox.Actions \| null; } \| ((actions: AriaCombobox.Actions \| null) => void) \| undefined` | No | Unavailable |  |
| autoComplete | `string \| undefined` | No | Unavailable |  |
| filter | `((item: Item, query: string, itemToString?: ((item: Item) => string) \| undefined) => boolean) \| null \| undefined` | No | Unavailable |  |
| filteredItems | `readonly Item[] \| readonly Group<Item>[] \| undefined` | No | Unavailable |  |
| form | `string \| undefined` | No | Unavailable |  |
| grid | `boolean \| undefined` | No | Unavailable |  |
| inline | `boolean \| undefined` | No | Unavailable |  |
| isItemEqualToValue | `((a: Value, b: Value) => boolean) \| undefined` | No | Unavailable |  |
| itemToStringLabel | `((value: Value) => string) \| undefined` | No | Unavailable |  |
| itemToStringValue | `((value: Value) => string) \| undefined` | No | Unavailable |  |
| items | `readonly Item[] \| readonly Group<Item>[] \| ComboboxItemCollection<Item, Value> \| undefined` | No | Unavailable |  |
| limit | `number \| undefined` | No | Unavailable |  |
| locale | `Intl.LocalesArgument` | No | Unavailable |  |
| loopFocus | `boolean \| undefined` | No | Unavailable |  |
| modal | `boolean \| undefined` | No | Unavailable |  |
| multiple | `Multiple \| undefined` | No | Unavailable |  |
| onItemHighlighted | `((value: Value \| undefined, details: AriaCombobox.HighlightEventDetails) => void) \| undefined` | No | Unavailable |  |
| onOpenChangeComplete | `((open: boolean) => void) \| undefined` | No | Unavailable |  |
| openOnInputClick | `boolean \| undefined` | No | Unavailable |  |
| virtualized | `boolean \| undefined` | No | Unavailable |  |
| disabled | `boolean \| undefined` | No | Unavailable |  |
| readOnly | `boolean \| undefined` | No | Unavailable |  |
| required | `boolean \| undefined` | No | Unavailable |  |
| inputRef | `JSX.Ref<HTMLInputElement>` | No | Unavailable |  |
| id | `string \| undefined` | No | Unavailable |  |
| children | `JSX.Element` | No | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6d626f626f782e526f6f742e5374617465"></a>

<a id="comboboxrootstate"></a>

### Related exported type: Combobox.Root.State

Declaration: `packages/solid/build/types/combobox/root/ComboboxRoot.d.ts:22`

#### Declaration

```typescript
AriaComboboxState
```

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6d626f626f782e526f6f742e416374696f6e73"></a>

<a id="comboboxrootactions"></a>

### Related exported type: Combobox.Root.Actions

Declaration: `packages/solid/build/types/combobox/root/ComboboxRoot.d.ts:23`

#### Declaration

```typescript
AriaCombobox.Actions
```

<a id="api-436f6d626f626f782e526f6f742e416374696f6e732e636c6f7365"></a>

<a id="ComboboxRootActions-close"></a>

<a id="api-436f6d626f626f782e526f6f742e416374696f6e732e686967686c696768744974656d"></a>

<a id="ComboboxRootActions-highlightItem"></a>

<a id="api-436f6d626f626f782e526f6f742e416374696f6e732e756e6d6f756e74"></a>

<a id="ComboboxRootActions-unmount"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| close | `() => void` | Yes | Unavailable |  |
| highlightItem | `(target: HighlightItemTarget) => void` | Yes | Unavailable |  |
| unmount | `() => void` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6d626f626f782e526f6f742e4368616e67654576656e74526561736f6e"></a>

<a id="comboboxrootchangeeventreason"></a>

### Related exported type: Combobox.Root.ChangeEventReason

Declaration: `packages/solid/build/types/combobox/root/ComboboxRoot.d.ts:25`

#### Declaration

```typescript
AriaCombobox.ChangeEventReason
```

Inherited DOM attributes: `__@iterator@106`, `anchor`, `at`, `big`, `blink`, `bold`, `charAt`, `charCodeAt`, `codePointAt`, `concat`, `endsWith`, `fixed`, `fontcolor`, `fontsize`, `includes`, `indexOf`, `isWellFormed`, `italics`, `lastIndexOf`, `length`, `link`, `localeCompare`, `match`, `matchAll`, `normalize`, `padEnd`, `padStart`, `repeat`, `replace`, `replaceAll`, `search`, `slice`, `small`, `split`, `startsWith`, `strike`, `sub`, `substr`, `substring`, `sup`, `toLocaleLowerCase`, `toLocaleUpperCase`, `toLowerCase`, `toString`, `toUpperCase`, `toWellFormed`, `trim`, `trimEnd`, `trimLeft`, `trimRight`, `trimStart`, `valueOf`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6d626f626f782e526f6f742e4368616e67654576656e7444657461696c73"></a>

<a id="comboboxrootchangeeventdetails"></a>

### Related exported type: Combobox.Root.ChangeEventDetails

Declaration: `packages/solid/build/types/combobox/root/ComboboxRoot.d.ts:26`

#### Declaration

```typescript
AriaCombobox.ChangeEventDetails
```

<a id="api-436f6d626f626f782e526f6f742e4368616e67654576656e7444657461696c732e616c6c6f7750726f7061676174696f6e"></a>

<a id="ComboboxRootChangeEventDetails-allowPropagation"></a>

<a id="api-436f6d626f626f782e526f6f742e4368616e67654576656e7444657461696c732e63616e63656c"></a>

<a id="ComboboxRootChangeEventDetails-cancel"></a>

<a id="api-436f6d626f626f782e526f6f742e4368616e67654576656e7444657461696c732e6576656e74"></a>

<a id="ComboboxRootChangeEventDetails-event"></a>

<a id="api-436f6d626f626f782e526f6f742e4368616e67654576656e7444657461696c732e697343616e63656c6564"></a>

<a id="ComboboxRootChangeEventDetails-isCanceled"></a>

<a id="api-436f6d626f626f782e526f6f742e4368616e67654576656e7444657461696c732e69734974656d5072657373"></a>

<a id="ComboboxRootChangeEventDetails-isItemPress"></a>

<a id="api-436f6d626f626f782e526f6f742e4368616e67654576656e7444657461696c732e697350726f7061676174696f6e416c6c6f776564"></a>

<a id="ComboboxRootChangeEventDetails-isPropagationAllowed"></a>

<a id="api-436f6d626f626f782e526f6f742e4368616e67654576656e7444657461696c732e726561736f6e"></a>

<a id="ComboboxRootChangeEventDetails-reason"></a>

<a id="api-436f6d626f626f782e526f6f742e4368616e67654576656e7444657461696c732e74726967676572"></a>

<a id="ComboboxRootChangeEventDetails-trigger"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| allowPropagation | `() => void` | Yes | Unavailable | Marks this change transaction as allowing propagation. |
| cancel | `() => void` | Yes | Unavailable | Cancels the Base UI change transaction; separate from the DOM event’s preventDefault() and preventBaseUIHandler(). |
| event | `PointerEvent \| MouseEvent \| Event \| FocusEvent \| InputEvent \| KeyboardEvent \| TouchEvent` | Yes | Unavailable | Native DOM event associated with the change. Programmatic changes can use a Base UI-created Event. |
| isCanceled | `boolean` | Yes | Unavailable | Whether cancel() has been called for this change transaction. |
| isItemPress | `boolean \| undefined` | No | Unavailable |  |
| isPropagationAllowed | `boolean` | Yes | Unavailable | Whether allowPropagation() has been called for this change transaction. |
| reason | `"none" \| "trigger-press" \| "outside-press" \| "item-press" \| "close-press" \| "clear-press" \| "chip-remove-press" \| "input-change" \| "input-clear" \| "input-press" \| "focus-out" \| "escape-key" \| "list-navigation" \| "cancel-open" \| "imperative-action"` | Yes | Unavailable | Reason for the requested change; it discriminates the native event type. |
| trigger | `Element \| undefined` | Yes | Unavailable | Trigger element associated with this change, when available. |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6d626f626f782e526f6f742e486967686c696768744576656e74526561736f6e"></a>

<a id="comboboxroothighlighteventreason"></a>

### Related exported type: Combobox.Root.HighlightEventReason

Declaration: `packages/solid/build/types/combobox/root/ComboboxRoot.d.ts:28`

#### Declaration

```typescript
AriaCombobox.HighlightEventReason
```

Inherited DOM attributes: `__@iterator@106`, `anchor`, `at`, `big`, `blink`, `bold`, `charAt`, `charCodeAt`, `codePointAt`, `concat`, `endsWith`, `fixed`, `fontcolor`, `fontsize`, `includes`, `indexOf`, `isWellFormed`, `italics`, `lastIndexOf`, `length`, `link`, `localeCompare`, `match`, `matchAll`, `normalize`, `padEnd`, `padStart`, `repeat`, `replace`, `replaceAll`, `search`, `slice`, `small`, `split`, `startsWith`, `strike`, `sub`, `substr`, `substring`, `sup`, `toLocaleLowerCase`, `toLocaleUpperCase`, `toLowerCase`, `toString`, `toUpperCase`, `toWellFormed`, `trim`, `trimEnd`, `trimLeft`, `trimRight`, `trimStart`, `valueOf`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6d626f626f782e526f6f742e486967686c696768744576656e7444657461696c73"></a>

<a id="comboboxroothighlighteventdetails"></a>

### Related exported type: Combobox.Root.HighlightEventDetails

Declaration: `packages/solid/build/types/combobox/root/ComboboxRoot.d.ts:29`

#### Declaration

```typescript
AriaCombobox.HighlightEventDetails
```

<a id="api-436f6d626f626f782e526f6f742e486967686c696768744576656e7444657461696c732e6576656e74"></a>

<a id="ComboboxRootHighlightEventDetails-event"></a>

<a id="api-436f6d626f626f782e526f6f742e486967686c696768744576656e7444657461696c732e696e646578"></a>

<a id="ComboboxRootHighlightEventDetails-index"></a>

<a id="api-436f6d626f626f782e526f6f742e486967686c696768744576656e7444657461696c732e726561736f6e"></a>

<a id="ComboboxRootHighlightEventDetails-reason"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| event | `PointerEvent \| MouseEvent \| Event \| KeyboardEvent` | Yes | Unavailable | Native DOM event associated with the change. Programmatic changes can use a Base UI-created Event. |
| index | `number` | Yes | Unavailable |  |
| reason | `"none" \| "pointer" \| "keyboard" \| "imperative-action"` | Yes | Unavailable | Reason for the requested change; it discriminates the native event type. |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6d626f626f782e526f6f742e486967686c696768744974656d546172676574"></a>

<a id="comboboxroothighlightitemtarget"></a>

### Related exported type: Combobox.Root.HighlightItemTarget

Declaration: `packages/solid/build/types/combobox/root/ComboboxRoot.d.ts:24`

#### Declaration

```typescript
AriaComboboxHighlightItemTarget
```

Inherited DOM attributes: `__@iterator@106`, `anchor`, `at`, `big`, `blink`, `bold`, `charAt`, `charCodeAt`, `codePointAt`, `concat`, `endsWith`, `fixed`, `fontcolor`, `fontsize`, `includes`, `indexOf`, `isWellFormed`, `italics`, `lastIndexOf`, `length`, `link`, `localeCompare`, `match`, `matchAll`, `normalize`, `padEnd`, `padStart`, `repeat`, `replace`, `replaceAll`, `search`, `slice`, `small`, `split`, `startsWith`, `strike`, `sub`, `substr`, `substring`, `sup`, `toLocaleLowerCase`, `toLocaleUpperCase`, `toLowerCase`, `toString`, `toUpperCase`, `toWellFormed`, `trim`, `trimEnd`, `trimLeft`, `trimRight`, `trimStart`, `valueOf`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6d626f626f782e526f6f742e4f70656e4368616e67654576656e7444657461696c73"></a>

<a id="comboboxrootopenchangeeventdetails"></a>

### Related exported type: Combobox.Root.OpenChangeEventDetails

Declaration: `packages/solid/build/types/combobox/root/ComboboxRoot.d.ts:27`

#### Declaration

```typescript
AriaCombobox.OpenChangeEventDetails
```

<a id="api-436f6d626f626f782e526f6f742e4f70656e4368616e67654576656e7444657461696c732e616c6c6f7750726f7061676174696f6e"></a>

<a id="ComboboxRootOpenChangeEventDetails-allowPropagation"></a>

<a id="api-436f6d626f626f782e526f6f742e4f70656e4368616e67654576656e7444657461696c732e63616e63656c"></a>

<a id="ComboboxRootOpenChangeEventDetails-cancel"></a>

<a id="api-436f6d626f626f782e526f6f742e4f70656e4368616e67654576656e7444657461696c732e6576656e74"></a>

<a id="ComboboxRootOpenChangeEventDetails-event"></a>

<a id="api-436f6d626f626f782e526f6f742e4f70656e4368616e67654576656e7444657461696c732e697343616e63656c6564"></a>

<a id="ComboboxRootOpenChangeEventDetails-isCanceled"></a>

<a id="api-436f6d626f626f782e526f6f742e4f70656e4368616e67654576656e7444657461696c732e69734974656d5072657373"></a>

<a id="ComboboxRootOpenChangeEventDetails-isItemPress"></a>

<a id="api-436f6d626f626f782e526f6f742e4f70656e4368616e67654576656e7444657461696c732e697350726f7061676174696f6e416c6c6f776564"></a>

<a id="ComboboxRootOpenChangeEventDetails-isPropagationAllowed"></a>

<a id="api-436f6d626f626f782e526f6f742e4f70656e4368616e67654576656e7444657461696c732e70726576656e74556e6d6f756e744f6e436c6f7365"></a>

<a id="ComboboxRootOpenChangeEventDetails-preventUnmountOnClose"></a>

<a id="api-436f6d626f626f782e526f6f742e4f70656e4368616e67654576656e7444657461696c732e726561736f6e"></a>

<a id="ComboboxRootOpenChangeEventDetails-reason"></a>

<a id="api-436f6d626f626f782e526f6f742e4f70656e4368616e67654576656e7444657461696c732e74726967676572"></a>

<a id="ComboboxRootOpenChangeEventDetails-trigger"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| allowPropagation | `() => void` | Yes | Unavailable | Marks this change transaction as allowing propagation. |
| cancel | `() => void` | Yes | Unavailable | Cancels the Base UI change transaction; separate from the DOM event’s preventDefault() and preventBaseUIHandler(). |
| event | `PointerEvent \| MouseEvent \| Event \| FocusEvent \| InputEvent \| KeyboardEvent \| TouchEvent` | Yes | Unavailable | Native DOM event associated with the change. Programmatic changes can use a Base UI-created Event. |
| isCanceled | `boolean` | Yes | Unavailable | Whether cancel() has been called for this change transaction. |
| isItemPress | `boolean \| undefined` | No | Unavailable |  |
| isPropagationAllowed | `boolean` | Yes | Unavailable | Whether allowPropagation() has been called for this change transaction. |
| preventUnmountOnClose | `() => void` | Yes | Unavailable |  |
| reason | `"none" \| "trigger-press" \| "outside-press" \| "item-press" \| "close-press" \| "clear-press" \| "chip-remove-press" \| "input-change" \| "input-clear" \| "input-press" \| "focus-out" \| "escape-key" \| "list-navigation" \| "cancel-open" \| "imperative-action"` | Yes | Unavailable | Reason for the requested change; it discriminates the native event type. |
| trigger | `Element \| undefined` | Yes | Unavailable | Trigger element associated with this change, when available. |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="label"></a>

### Label

<a id="api-436f6d626f626f782e4c6162656c"></a>

<a id="comboboxlabel"></a>

<a id="api-436f6d626f626f782e4c6162656c2e2470726f70732e70726f703a616c69676e"></a>

### Combobox.Label

Declaration: `packages/solid/build/types/combobox/label/ComboboxLabel.d.ts:7`

#### Declaration

```typescript
(props: ComboboxLabelProps) => JSX.Element
```

<a id="api-436f6d626f626f782e4c6162656c2e2470726f70732e636c617373"></a>

<a id="ComboboxLabel-class"></a>

<a id="api-436f6d626f626f782e4c6162656c2e2470726f70732e7374796c65"></a>

<a id="ComboboxLabel-style"></a>

<a id="api-436f6d626f626f782e4c6162656c2e2470726f70732e72656e646572"></a>

<a id="ComboboxLabel-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<ComboboxLabelState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ComboboxLabelState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ComboboxLabelState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6d626f626f782e4c6162656c2e50726f7073"></a>

<a id="comboboxlabelprops"></a>

<a id="api-436f6d626f626f782e4c6162656c2e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Combobox.Label.Props

Declaration: `packages/solid/build/types/combobox/label/ComboboxLabel.d.ts:9`

#### Declaration

```typescript
ComboboxLabelProps
```

<a id="api-436f6d626f626f782e4c6162656c2e50726f70732e636c617373"></a>

<a id="ComboboxLabelProps-class"></a>

<a id="api-436f6d626f626f782e4c6162656c2e50726f70732e7374796c65"></a>

<a id="ComboboxLabelProps-style"></a>

<a id="api-436f6d626f626f782e4c6162656c2e50726f70732e72656e646572"></a>

<a id="ComboboxLabelProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<ComboboxLabelState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ComboboxLabelState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ComboboxLabelState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6d626f626f782e4c6162656c2e5374617465"></a>

<a id="comboboxlabelstate"></a>

### Related exported type: Combobox.Label.State

Declaration: `packages/solid/build/types/combobox/label/ComboboxLabel.d.ts:10`

#### Declaration

```typescript
ComboboxLabelState
```

<a id="api-436f6d626f626f782e4c6162656c2e53746174652e6469727479"></a>

<a id="ComboboxLabelState-dirty"></a>

<a id="api-436f6d626f626f782e4c6162656c2e53746174652e66696c6c6564"></a>

<a id="ComboboxLabelState-filled"></a>

<a id="api-436f6d626f626f782e4c6162656c2e53746174652e666f6375736564"></a>

<a id="ComboboxLabelState-focused"></a>

<a id="api-436f6d626f626f782e4c6162656c2e53746174652e746f7563686564"></a>

<a id="ComboboxLabelState-touched"></a>

<a id="api-436f6d626f626f782e4c6162656c2e53746174652e64697361626c6564"></a>

<a id="ComboboxLabelState-disabled"></a>

<a id="api-436f6d626f626f782e4c6162656c2e53746174652e76616c6964"></a>

<a id="ComboboxLabelState-valid"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| dirty | `boolean` | Yes | Unavailable |  |
| filled | `boolean` | Yes | Unavailable |  |
| focused | `boolean` | Yes | Unavailable |  |
| touched | `boolean` | Yes | Unavailable |  |
| disabled | `boolean` | Yes | Unavailable |  |
| valid | `boolean \| null` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="value"></a>

### Value

<a id="api-436f6d626f626f782e56616c7565"></a>

<a id="comboboxvalue"></a>

### Combobox.Value

Declaration: `packages/solid/build/types/combobox/value/ComboboxValue.d.ts:8`

#### Declaration

```typescript
(props: ComboboxValueProps) => JSX.Element
```

<a id="api-436f6d626f626f782e56616c75652e2470726f70732e706c616365686f6c646572"></a>

<a id="ComboboxValue-placeholder"></a>

<a id="api-436f6d626f626f782e56616c75652e2470726f70732e6368696c6472656e"></a>

<a id="ComboboxValue-children"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| placeholder | `JSX.Element` | No | Unavailable |  |
| children | `JSX.Element \| ((selectedValue: any) => JSX.Element)` | No | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6d626f626f782e56616c75652e50726f7073"></a>

<a id="comboboxvalueprops"></a>

### Related exported type: Combobox.Value.Props

Declaration: `packages/solid/build/types/combobox/value/ComboboxValue.d.ts:10`

#### Declaration

```typescript
ComboboxValueProps
```

<a id="api-436f6d626f626f782e56616c75652e50726f70732e706c616365686f6c646572"></a>

<a id="ComboboxValueProps-placeholder"></a>

<a id="api-436f6d626f626f782e56616c75652e50726f70732e6368696c6472656e"></a>

<a id="ComboboxValueProps-children"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| placeholder | `JSX.Element` | No | Unavailable |  |
| children | `JSX.Element \| ((selectedValue: any) => JSX.Element)` | No | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6d626f626f782e56616c75652e5374617465"></a>

<a id="comboboxvaluestate"></a>

### Related exported type: Combobox.Value.State

Declaration: `packages/solid/build/types/combobox/value/ComboboxValue.d.ts:11`

#### Declaration

```typescript
ComboboxValueState
```

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="icon"></a>

### Icon

<a id="api-436f6d626f626f782e49636f6e"></a>

<a id="comboboxicon"></a>

### Combobox.Icon

Declaration: `packages/solid/build/types/combobox/icon/ComboboxIcon.d.ts:6`

#### Declaration

```typescript
(props: ComboboxIconProps) => JSX.Element
```

<a id="api-436f6d626f626f782e49636f6e2e2470726f70732e636c617373"></a>

<a id="ComboboxIcon-class"></a>

<a id="api-436f6d626f626f782e49636f6e2e2470726f70732e7374796c65"></a>

<a id="ComboboxIcon-style"></a>

<a id="api-436f6d626f626f782e49636f6e2e2470726f70732e72656e646572"></a>

<a id="ComboboxIcon-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<AutocompleteIconState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AutocompleteIconState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, AutocompleteIconState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6d626f626f782e49636f6e2e50726f7073"></a>

<a id="comboboxiconprops"></a>

### Related exported type: Combobox.Icon.Props

Declaration: `packages/solid/build/types/combobox/icon/ComboboxIcon.d.ts:8`

#### Declaration

```typescript
ComboboxIconProps
```

<a id="api-436f6d626f626f782e49636f6e2e50726f70732e636c617373"></a>

<a id="ComboboxIconProps-class"></a>

<a id="api-436f6d626f626f782e49636f6e2e50726f70732e7374796c65"></a>

<a id="ComboboxIconProps-style"></a>

<a id="api-436f6d626f626f782e49636f6e2e50726f70732e72656e646572"></a>

<a id="ComboboxIconProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<AutocompleteIconState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AutocompleteIconState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, AutocompleteIconState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6d626f626f782e49636f6e2e5374617465"></a>

<a id="comboboxiconstate"></a>

### Related exported type: Combobox.Icon.State

Declaration: `packages/solid/build/types/combobox/icon/ComboboxIcon.d.ts:9`

#### Declaration

```typescript
ComboboxIconState
```

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="input"></a>

### Input

<a id="api-436f6d626f626f782e496e707574"></a>

<a id="comboboxinput"></a>

<a id="api-436f6d626f626f782e496e7075742e2470726f70732e70726f703a616363657074"></a>

<a id="api-436f6d626f626f782e496e7075742e2470726f70732e70726f703a616c69676e"></a>

<a id="api-436f6d626f626f782e496e7075742e2470726f70732e70726f703a616c74"></a>

<a id="api-436f6d626f626f782e496e7075742e2470726f70732e70726f703a6175746f636f6d706c657465"></a>

<a id="api-436f6d626f626f782e496e7075742e2470726f70732e70726f703a63617074757265"></a>

<a id="api-436f6d626f626f782e496e7075742e2470726f70732e70726f703a6469724e616d65"></a>

<a id="api-436f6d626f626f782e496e7075742e2470726f70732e70726f703a64697361626c6564"></a>

<a id="api-436f6d626f626f782e496e7075742e2470726f70732e70726f703a666f726d416374696f6e"></a>

<a id="api-436f6d626f626f782e496e7075742e2470726f70732e70726f703a666f726d456e6374797065"></a>

<a id="api-436f6d626f626f782e496e7075742e2470726f70732e70726f703a666f726d4d6574686f64"></a>

<a id="api-436f6d626f626f782e496e7075742e2470726f70732e70726f703a666f726d4e6f56616c6964617465"></a>

<a id="api-436f6d626f626f782e496e7075742e2470726f70732e70726f703a666f726d546172676574"></a>

<a id="api-436f6d626f626f782e496e7075742e2470726f70732e70726f703a686569676874"></a>

<a id="api-436f6d626f626f782e496e7075742e2470726f70732e70726f703a696e64657465726d696e617465"></a>

<a id="api-436f6d626f626f782e496e7075742e2470726f70732e70726f703a6d6178"></a>

<a id="api-436f6d626f626f782e496e7075742e2470726f70732e70726f703a6d61784c656e677468"></a>

<a id="api-436f6d626f626f782e496e7075742e2470726f70732e70726f703a6d696e"></a>

<a id="api-436f6d626f626f782e496e7075742e2470726f70732e70726f703a6d696e4c656e677468"></a>

<a id="api-436f6d626f626f782e496e7075742e2470726f70732e70726f703a6d756c7469706c65"></a>

<a id="api-436f6d626f626f782e496e7075742e2470726f70732e70726f703a6e616d65"></a>

<a id="api-436f6d626f626f782e496e7075742e2470726f70732e70726f703a7061747465726e"></a>

<a id="api-436f6d626f626f782e496e7075742e2470726f70732e70726f703a706c616365686f6c646572"></a>

<a id="api-436f6d626f626f782e496e7075742e2470726f70732e70726f703a706f706f766572546172676574416374696f6e"></a>

<a id="api-436f6d626f626f782e496e7075742e2470726f70732e70726f703a706f706f766572546172676574456c656d656e74"></a>

<a id="api-436f6d626f626f782e496e7075742e2470726f70732e70726f703a726561644f6e6c79"></a>

<a id="api-436f6d626f626f782e496e7075742e2470726f70732e70726f703a7265717569726564"></a>

<a id="api-436f6d626f626f782e496e7075742e2470726f70732e70726f703a73656c656374696f6e446972656374696f6e"></a>

<a id="api-436f6d626f626f782e496e7075742e2470726f70732e70726f703a73656c656374696f6e456e64"></a>

<a id="api-436f6d626f626f782e496e7075742e2470726f70732e70726f703a73656c656374696f6e5374617274"></a>

<a id="api-436f6d626f626f782e496e7075742e2470726f70732e70726f703a73697a65"></a>

<a id="api-436f6d626f626f782e496e7075742e2470726f70732e70726f703a737263"></a>

<a id="api-436f6d626f626f782e496e7075742e2470726f70732e70726f703a73746570"></a>

<a id="api-436f6d626f626f782e496e7075742e2470726f70732e70726f703a74797065"></a>

<a id="api-436f6d626f626f782e496e7075742e2470726f70732e70726f703a7573654d6170"></a>

<a id="api-436f6d626f626f782e496e7075742e2470726f70732e70726f703a76616c7565417344617465"></a>

<a id="api-436f6d626f626f782e496e7075742e2470726f70732e70726f703a76616c756541734e756d626572"></a>

<a id="api-436f6d626f626f782e496e7075742e2470726f70732e70726f703a7765626b69746469726563746f7279"></a>

<a id="api-436f6d626f626f782e496e7075742e2470726f70732e70726f703a7769647468"></a>

### Combobox.Input

Declaration: `packages/solid/build/types/combobox/input/ComboboxInput.d.ts:14`

#### Declaration

```typescript
(props: ComboboxInputProps) => JSX.Element
```

<a id="api-436f6d626f626f782e496e7075742e2470726f70732e64697361626c6564"></a>

<a id="ComboboxInput-disabled"></a>

<a id="api-436f6d626f626f782e496e7075742e2470726f70732e636c617373"></a>

<a id="ComboboxInput-class"></a>

<a id="api-436f6d626f626f782e496e7075742e2470726f70732e7374796c65"></a>

<a id="ComboboxInput-style"></a>

<a id="api-436f6d626f626f782e496e7075742e2470726f70732e72656e646572"></a>

<a id="ComboboxInput-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| disabled | `boolean \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<AutocompleteInputState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AutocompleteInputState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, AutocompleteInputState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accept`, `accesskey`, `align`, `alpha`, `alt`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocomplete`, `autocorrect`, `autofocus`, `capture`, `checked`, `children`, `colorspace`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `dirname`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `form`, `formaction`, `formenctype`, `formmethod`, `formnovalidate`, `formtarget`, `height`, `hidden`, `id`, `incremental`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `list`, `max`, `maxlength`, `min`, `minlength`, `multiple`, `name`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `pattern`, `placeholder`, `popover`, `popovertarget`, `popovertargetaction`, `prefix`, `prop:accept`, `prop:align`, `prop:alt`, `prop:autocomplete`, `prop:capture`, `prop:checked`, `prop:defaultChecked`, `prop:defaultValue`, `prop:dirName`, `prop:disabled`, `prop:formAction`, `prop:formEnctype`, `prop:formMethod`, `prop:formNoValidate`, `prop:formTarget`, `prop:height`, `prop:indeterminate`, `prop:max`, `prop:maxLength`, `prop:min`, `prop:minLength`, `prop:multiple`, `prop:name`, `prop:pattern`, `prop:placeholder`, `prop:popoverTargetAction`, `prop:popoverTargetElement`, `prop:readOnly`, `prop:required`, `prop:selectionDirection`, `prop:selectionEnd`, `prop:selectionStart`, `prop:size`, `prop:src`, `prop:step`, `prop:type`, `prop:useMap`, `prop:value`, `prop:valueAsDate`, `prop:valueAsNumber`, `prop:webkitdirectory`, `prop:width`, `property`, `readonly`, `ref`, `required`, `resource`, `results`, `role`, `size`, `slot`, `spellcheck`, `src`, `step`, `tabindex`, `textContent`, `title`, `translate`, `type`, `typeof`, `usemap`, `value`, `virtualkeyboardpolicy`, `vocab`, `webkitdirectory`, `width`, `writingsuggestions`

#### Data attributes

<a id="api-436f6d626f626f78496e70757444617461417474726962757465732e706f7075704f70656e"></a>

<a id="api-436f6d626f626f78496e70757444617461417474726962757465732e706f70757053696465"></a>

<a id="api-436f6d626f626f78496e70757444617461417474726962757465732e6c697374456d707479"></a>

<a id="api-436f6d626f626f78496e70757444617461417474726962757465732e70726573736564"></a>

<a id="api-436f6d626f626f78496e70757444617461417474726962757465732e64697361626c6564"></a>

<a id="api-436f6d626f626f78496e70757444617461417474726962757465732e726561646f6e6c79"></a>

<a id="api-436f6d626f626f78496e70757444617461417474726962757465732e7265717569726564"></a>

<a id="api-436f6d626f626f78496e70757444617461417474726962757465732e76616c6964"></a>

<a id="api-436f6d626f626f78496e70757444617461417474726962757465732e696e76616c6964"></a>

<a id="api-436f6d626f626f78496e70757444617461417474726962757465732e6469727479"></a>

<a id="api-436f6d626f626f78496e70757444617461417474726962757465732e746f7563686564"></a>

<a id="api-436f6d626f626f78496e70757444617461417474726962757465732e66696c6c6564"></a>

<a id="api-436f6d626f626f78496e70757444617461417474726962757465732e666f6375736564"></a>

| Name | Description |
| --- | --- |
| data-popup-open | Present when open is true. |
| data-popup-side |  |
| data-list-empty | Present when listEmpty is true. |
| data-pressed | Present when open is true. |
| data-disabled |  |
| data-readonly | Present when readOnly is true. |
| data-required |  |
| data-valid |  |
| data-invalid |  |
| data-dirty |  |
| data-touched |  |
| data-filled |  |
| data-focused |  |

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6d626f626f782e496e7075742e50726f7073"></a>

<a id="comboboxinputprops"></a>

<a id="api-436f6d626f626f782e496e7075742e50726f70732e70726f703a616363657074"></a>

<a id="api-436f6d626f626f782e496e7075742e50726f70732e70726f703a616c69676e"></a>

<a id="api-436f6d626f626f782e496e7075742e50726f70732e70726f703a616c74"></a>

<a id="api-436f6d626f626f782e496e7075742e50726f70732e70726f703a6175746f636f6d706c657465"></a>

<a id="api-436f6d626f626f782e496e7075742e50726f70732e70726f703a63617074757265"></a>

<a id="api-436f6d626f626f782e496e7075742e50726f70732e70726f703a6469724e616d65"></a>

<a id="api-436f6d626f626f782e496e7075742e50726f70732e70726f703a64697361626c6564"></a>

<a id="api-436f6d626f626f782e496e7075742e50726f70732e70726f703a666f726d416374696f6e"></a>

<a id="api-436f6d626f626f782e496e7075742e50726f70732e70726f703a666f726d456e6374797065"></a>

<a id="api-436f6d626f626f782e496e7075742e50726f70732e70726f703a666f726d4d6574686f64"></a>

<a id="api-436f6d626f626f782e496e7075742e50726f70732e70726f703a666f726d4e6f56616c6964617465"></a>

<a id="api-436f6d626f626f782e496e7075742e50726f70732e70726f703a666f726d546172676574"></a>

<a id="api-436f6d626f626f782e496e7075742e50726f70732e70726f703a686569676874"></a>

<a id="api-436f6d626f626f782e496e7075742e50726f70732e70726f703a696e64657465726d696e617465"></a>

<a id="api-436f6d626f626f782e496e7075742e50726f70732e70726f703a6d6178"></a>

<a id="api-436f6d626f626f782e496e7075742e50726f70732e70726f703a6d61784c656e677468"></a>

<a id="api-436f6d626f626f782e496e7075742e50726f70732e70726f703a6d696e"></a>

<a id="api-436f6d626f626f782e496e7075742e50726f70732e70726f703a6d696e4c656e677468"></a>

<a id="api-436f6d626f626f782e496e7075742e50726f70732e70726f703a6d756c7469706c65"></a>

<a id="api-436f6d626f626f782e496e7075742e50726f70732e70726f703a6e616d65"></a>

<a id="api-436f6d626f626f782e496e7075742e50726f70732e70726f703a7061747465726e"></a>

<a id="api-436f6d626f626f782e496e7075742e50726f70732e70726f703a706c616365686f6c646572"></a>

<a id="api-436f6d626f626f782e496e7075742e50726f70732e70726f703a706f706f766572546172676574416374696f6e"></a>

<a id="api-436f6d626f626f782e496e7075742e50726f70732e70726f703a706f706f766572546172676574456c656d656e74"></a>

<a id="api-436f6d626f626f782e496e7075742e50726f70732e70726f703a726561644f6e6c79"></a>

<a id="api-436f6d626f626f782e496e7075742e50726f70732e70726f703a7265717569726564"></a>

<a id="api-436f6d626f626f782e496e7075742e50726f70732e70726f703a73656c656374696f6e446972656374696f6e"></a>

<a id="api-436f6d626f626f782e496e7075742e50726f70732e70726f703a73656c656374696f6e456e64"></a>

<a id="api-436f6d626f626f782e496e7075742e50726f70732e70726f703a73656c656374696f6e5374617274"></a>

<a id="api-436f6d626f626f782e496e7075742e50726f70732e70726f703a73697a65"></a>

<a id="api-436f6d626f626f782e496e7075742e50726f70732e70726f703a737263"></a>

<a id="api-436f6d626f626f782e496e7075742e50726f70732e70726f703a73746570"></a>

<a id="api-436f6d626f626f782e496e7075742e50726f70732e70726f703a74797065"></a>

<a id="api-436f6d626f626f782e496e7075742e50726f70732e70726f703a7573654d6170"></a>

<a id="api-436f6d626f626f782e496e7075742e50726f70732e70726f703a76616c7565417344617465"></a>

<a id="api-436f6d626f626f782e496e7075742e50726f70732e70726f703a76616c756541734e756d626572"></a>

<a id="api-436f6d626f626f782e496e7075742e50726f70732e70726f703a7765626b69746469726563746f7279"></a>

<a id="api-436f6d626f626f782e496e7075742e50726f70732e70726f703a7769647468"></a>

### Related exported type: Combobox.Input.Props

Declaration: `packages/solid/build/types/combobox/input/ComboboxInput.d.ts:16`

#### Declaration

```typescript
ComboboxInputProps
```

<a id="api-436f6d626f626f782e496e7075742e50726f70732e64697361626c6564"></a>

<a id="ComboboxInputProps-disabled"></a>

<a id="api-436f6d626f626f782e496e7075742e50726f70732e636c617373"></a>

<a id="ComboboxInputProps-class"></a>

<a id="api-436f6d626f626f782e496e7075742e50726f70732e7374796c65"></a>

<a id="ComboboxInputProps-style"></a>

<a id="api-436f6d626f626f782e496e7075742e50726f70732e72656e646572"></a>

<a id="ComboboxInputProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| disabled | `boolean \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<AutocompleteInputState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AutocompleteInputState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, AutocompleteInputState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accept`, `accesskey`, `align`, `alpha`, `alt`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocomplete`, `autocorrect`, `autofocus`, `capture`, `checked`, `children`, `colorspace`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `dirname`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `form`, `formaction`, `formenctype`, `formmethod`, `formnovalidate`, `formtarget`, `height`, `hidden`, `id`, `incremental`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `list`, `max`, `maxlength`, `min`, `minlength`, `multiple`, `name`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `pattern`, `placeholder`, `popover`, `popovertarget`, `popovertargetaction`, `prefix`, `prop:accept`, `prop:align`, `prop:alt`, `prop:autocomplete`, `prop:capture`, `prop:checked`, `prop:defaultChecked`, `prop:defaultValue`, `prop:dirName`, `prop:disabled`, `prop:formAction`, `prop:formEnctype`, `prop:formMethod`, `prop:formNoValidate`, `prop:formTarget`, `prop:height`, `prop:indeterminate`, `prop:max`, `prop:maxLength`, `prop:min`, `prop:minLength`, `prop:multiple`, `prop:name`, `prop:pattern`, `prop:placeholder`, `prop:popoverTargetAction`, `prop:popoverTargetElement`, `prop:readOnly`, `prop:required`, `prop:selectionDirection`, `prop:selectionEnd`, `prop:selectionStart`, `prop:size`, `prop:src`, `prop:step`, `prop:type`, `prop:useMap`, `prop:value`, `prop:valueAsDate`, `prop:valueAsNumber`, `prop:webkitdirectory`, `prop:width`, `property`, `readonly`, `ref`, `required`, `resource`, `results`, `role`, `size`, `slot`, `spellcheck`, `src`, `step`, `tabindex`, `textContent`, `title`, `translate`, `type`, `typeof`, `usemap`, `value`, `virtualkeyboardpolicy`, `vocab`, `webkitdirectory`, `width`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6d626f626f782e496e7075742e5374617465"></a>

<a id="comboboxinputstate"></a>

### Related exported type: Combobox.Input.State

Declaration: `packages/solid/build/types/combobox/input/ComboboxInput.d.ts:17`

#### Declaration

```typescript
ComboboxInputState
```

<a id="api-436f6d626f626f782e496e7075742e53746174652e6f70656e"></a>

<a id="ComboboxInputState-open"></a>

<a id="api-436f6d626f626f782e496e7075742e53746174652e6469727479"></a>

<a id="ComboboxInputState-dirty"></a>

<a id="api-436f6d626f626f782e496e7075742e53746174652e66696c6c6564"></a>

<a id="ComboboxInputState-filled"></a>

<a id="api-436f6d626f626f782e496e7075742e53746174652e666f6375736564"></a>

<a id="ComboboxInputState-focused"></a>

<a id="api-436f6d626f626f782e496e7075742e53746174652e6c697374456d707479"></a>

<a id="ComboboxInputState-listEmpty"></a>

<a id="api-436f6d626f626f782e496e7075742e53746174652e706f70757053696465"></a>

<a id="ComboboxInputState-popupSide"></a>

<a id="api-436f6d626f626f782e496e7075742e53746174652e746f7563686564"></a>

<a id="ComboboxInputState-touched"></a>

<a id="api-436f6d626f626f782e496e7075742e53746174652e64697361626c6564"></a>

<a id="ComboboxInputState-disabled"></a>

<a id="api-436f6d626f626f782e496e7075742e53746174652e726561644f6e6c79"></a>

<a id="ComboboxInputState-readOnly"></a>

<a id="api-436f6d626f626f782e496e7075742e53746174652e76616c6964"></a>

<a id="ComboboxInputState-valid"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| open | `boolean` | Yes | Unavailable |  |
| dirty | `boolean` | Yes | Unavailable |  |
| filled | `boolean` | Yes | Unavailable |  |
| focused | `boolean` | Yes | Unavailable |  |
| listEmpty | `boolean` | Yes | Unavailable |  |
| popupSide | `Side \| null` | Yes | Unavailable |  |
| touched | `boolean` | Yes | Unavailable |  |
| disabled | `boolean` | Yes | Unavailable |  |
| readOnly | `boolean` | Yes | Unavailable |  |
| valid | `boolean \| null` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="inputgroup"></a>

### InputGroup

<a id="api-436f6d626f626f782e496e70757447726f7570"></a>

<a id="comboboxinputgroup"></a>

<a id="api-436f6d626f626f782e496e70757447726f75702e2470726f70732e70726f703a616c69676e"></a>

### Combobox.InputGroup

Declaration: `packages/solid/build/types/combobox/input-group/ComboboxInputGroup.d.ts:7`

#### Declaration

```typescript
(props: ComboboxInputGroupProps) => JSX.Element
```

<a id="api-436f6d626f626f782e496e70757447726f75702e2470726f70732e636c617373"></a>

<a id="ComboboxInputGroup-class"></a>

<a id="api-436f6d626f626f782e496e70757447726f75702e2470726f70732e7374796c65"></a>

<a id="ComboboxInputGroup-style"></a>

<a id="api-436f6d626f626f782e496e70757447726f75702e2470726f70732e72656e646572"></a>

<a id="ComboboxInputGroup-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<ComboboxInputGroupState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ComboboxInputGroupState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ComboboxInputGroupState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-436f6d626f626f78496e70757447726f757044617461417474726962757465732e706f7075704f70656e"></a>

<a id="api-436f6d626f626f78496e70757447726f757044617461417474726962757465732e706f70757053696465"></a>

<a id="api-436f6d626f626f78496e70757447726f757044617461417474726962757465732e6c697374456d707479"></a>

<a id="api-436f6d626f626f78496e70757447726f757044617461417474726962757465732e70726573736564"></a>

<a id="api-436f6d626f626f78496e70757447726f757044617461417474726962757465732e64697361626c6564"></a>

<a id="api-436f6d626f626f78496e70757447726f757044617461417474726962757465732e726561646f6e6c79"></a>

<a id="api-436f6d626f626f78496e70757447726f757044617461417474726962757465732e76616c6964"></a>

<a id="api-436f6d626f626f78496e70757447726f757044617461417474726962757465732e696e76616c6964"></a>

<a id="api-436f6d626f626f78496e70757447726f757044617461417474726962757465732e6469727479"></a>

<a id="api-436f6d626f626f78496e70757447726f757044617461417474726962757465732e746f7563686564"></a>

<a id="api-436f6d626f626f78496e70757447726f757044617461417474726962757465732e66696c6c6564"></a>

<a id="api-436f6d626f626f78496e70757447726f757044617461417474726962757465732e666f6375736564"></a>

<a id="api-436f6d626f626f78496e70757447726f757044617461417474726962757465732e706c616365686f6c646572"></a>

| Name | Description |
| --- | --- |
| data-popup-open | Present when open is true. |
| data-popup-side |  |
| data-list-empty | Present when listEmpty is true. |
| data-pressed | Present when open is true. |
| data-disabled |  |
| data-readonly | Present when readOnly is true. |
| data-valid |  |
| data-invalid |  |
| data-dirty |  |
| data-touched |  |
| data-filled |  |
| data-focused |  |
| data-placeholder |  |

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6d626f626f782e496e70757447726f75702e50726f7073"></a>

<a id="comboboxinputgroupprops"></a>

<a id="api-436f6d626f626f782e496e70757447726f75702e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Combobox.InputGroup.Props

Declaration: `packages/solid/build/types/combobox/input-group/ComboboxInputGroup.d.ts:9`

#### Declaration

```typescript
ComboboxInputGroupProps
```

<a id="api-436f6d626f626f782e496e70757447726f75702e50726f70732e636c617373"></a>

<a id="ComboboxInputGroupProps-class"></a>

<a id="api-436f6d626f626f782e496e70757447726f75702e50726f70732e7374796c65"></a>

<a id="ComboboxInputGroupProps-style"></a>

<a id="api-436f6d626f626f782e496e70757447726f75702e50726f70732e72656e646572"></a>

<a id="ComboboxInputGroupProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<ComboboxInputGroupState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ComboboxInputGroupState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ComboboxInputGroupState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6d626f626f782e496e70757447726f75702e5374617465"></a>

<a id="comboboxinputgroupstate"></a>

### Related exported type: Combobox.InputGroup.State

Declaration: `packages/solid/build/types/combobox/input-group/ComboboxInputGroup.d.ts:10`

#### Declaration

```typescript
ComboboxInputGroupState
```

<a id="api-436f6d626f626f782e496e70757447726f75702e53746174652e6f70656e"></a>

<a id="ComboboxInputGroupState-open"></a>

<a id="api-436f6d626f626f782e496e70757447726f75702e53746174652e6469727479"></a>

<a id="ComboboxInputGroupState-dirty"></a>

<a id="api-436f6d626f626f782e496e70757447726f75702e53746174652e66696c6c6564"></a>

<a id="ComboboxInputGroupState-filled"></a>

<a id="api-436f6d626f626f782e496e70757447726f75702e53746174652e666f6375736564"></a>

<a id="ComboboxInputGroupState-focused"></a>

<a id="api-436f6d626f626f782e496e70757447726f75702e53746174652e6c697374456d707479"></a>

<a id="ComboboxInputGroupState-listEmpty"></a>

<a id="api-436f6d626f626f782e496e70757447726f75702e53746174652e706c616365686f6c646572"></a>

<a id="ComboboxInputGroupState-placeholder"></a>

<a id="api-436f6d626f626f782e496e70757447726f75702e53746174652e706f70757053696465"></a>

<a id="ComboboxInputGroupState-popupSide"></a>

<a id="api-436f6d626f626f782e496e70757447726f75702e53746174652e746f7563686564"></a>

<a id="ComboboxInputGroupState-touched"></a>

<a id="api-436f6d626f626f782e496e70757447726f75702e53746174652e64697361626c6564"></a>

<a id="ComboboxInputGroupState-disabled"></a>

<a id="api-436f6d626f626f782e496e70757447726f75702e53746174652e726561644f6e6c79"></a>

<a id="ComboboxInputGroupState-readOnly"></a>

<a id="api-436f6d626f626f782e496e70757447726f75702e53746174652e76616c6964"></a>

<a id="ComboboxInputGroupState-valid"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| open | `boolean` | Yes | Unavailable |  |
| dirty | `boolean` | Yes | Unavailable |  |
| filled | `boolean` | Yes | Unavailable |  |
| focused | `boolean` | Yes | Unavailable |  |
| listEmpty | `boolean` | Yes | Unavailable |  |
| placeholder | `boolean` | Yes | Unavailable |  |
| popupSide | `Side \| null` | Yes | Unavailable |  |
| touched | `boolean` | Yes | Unavailable |  |
| disabled | `boolean` | Yes | Unavailable |  |
| readOnly | `boolean` | Yes | Unavailable |  |
| valid | `boolean \| null` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="clear"></a>

### Clear

<a id="api-436f6d626f626f782e436c656172"></a>

<a id="comboboxclear"></a>

<a id="api-436f6d626f626f782e436c6561722e2470726f70732e70726f703a64697361626c6564"></a>

<a id="api-436f6d626f626f782e436c6561722e2470726f70732e70726f703a666f726d416374696f6e"></a>

<a id="api-436f6d626f626f782e436c6561722e2470726f70732e70726f703a666f726d456e6374797065"></a>

<a id="api-436f6d626f626f782e436c6561722e2470726f70732e70726f703a666f726d4d6574686f64"></a>

<a id="api-436f6d626f626f782e436c6561722e2470726f70732e70726f703a666f726d4e6f56616c6964617465"></a>

<a id="api-436f6d626f626f782e436c6561722e2470726f70732e70726f703a666f726d546172676574"></a>

<a id="api-436f6d626f626f782e436c6561722e2470726f70732e70726f703a6e616d65"></a>

<a id="api-436f6d626f626f782e436c6561722e2470726f70732e70726f703a706f706f766572546172676574416374696f6e"></a>

<a id="api-436f6d626f626f782e436c6561722e2470726f70732e70726f703a706f706f766572546172676574456c656d656e74"></a>

<a id="api-436f6d626f626f782e436c6561722e2470726f70732e70726f703a74797065"></a>

<a id="api-436f6d626f626f782e436c6561722e2470726f70732e70726f703a76616c7565"></a>

### Combobox.Clear

Declaration: `packages/solid/build/types/combobox/clear/ComboboxClear.d.ts:14`

#### Declaration

```typescript
(props: ComboboxClearProps) => JSX.Element
```

<a id="api-436f6d626f626f782e436c6561722e2470726f70732e6e6174697665427574746f6e"></a>

<a id="ComboboxClear-nativeButton"></a>

<a id="api-436f6d626f626f782e436c6561722e2470726f70732e64697361626c6564"></a>

<a id="ComboboxClear-disabled"></a>

<a id="api-436f6d626f626f782e436c6561722e2470726f70732e636c617373"></a>

<a id="ComboboxClear-class"></a>

<a id="api-436f6d626f626f782e436c6561722e2470726f70732e7374796c65"></a>

<a id="ComboboxClear-style"></a>

<a id="api-436f6d626f626f782e436c6561722e2470726f70732e6b6565704d6f756e746564"></a>

<a id="ComboboxClear-keepMounted"></a>

<a id="api-436f6d626f626f782e436c6561722e2470726f70732e72656e646572"></a>

<a id="ComboboxClear-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| nativeButton | `boolean \| undefined` | No | true |  |
| disabled | `boolean \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<AutocompleteClearState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AutocompleteClearState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| keepMounted | `boolean \| undefined` | No | Unavailable |  |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, AutocompleteClearState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `command`, `commandfor`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `form`, `formaction`, `formenctype`, `formmethod`, `formnovalidate`, `formtarget`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `name`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `popovertarget`, `popovertargetaction`, `prefix`, `prop:disabled`, `prop:formAction`, `prop:formEnctype`, `prop:formMethod`, `prop:formNoValidate`, `prop:formTarget`, `prop:name`, `prop:popoverTargetAction`, `prop:popoverTargetElement`, `prop:type`, `prop:value`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `type`, `typeof`, `value`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-436f6d626f626f78436c65617244617461417474726962757465732e706f7075704f70656e"></a>

<a id="api-436f6d626f626f78436c65617244617461417474726962757465732e64697361626c6564"></a>

<a id="api-436f6d626f626f78436c65617244617461417474726962757465732e76697369626c65"></a>

<a id="api-436f6d626f626f78436c65617244617461417474726962757465732e7374617274696e675374796c65"></a>

<a id="api-436f6d626f626f78436c65617244617461417474726962757465732e656e64696e675374796c65"></a>

| Name | Description |
| --- | --- |
| data-popup-open | Present when open is true. |
| data-disabled |  |
| data-visible |  |
| data-starting-style | Present when transitionStatus is 'starting'. |
| data-ending-style | Present when transitionStatus is 'ending'. |

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6d626f626f782e436c6561722e50726f7073"></a>

<a id="comboboxclearprops"></a>

<a id="api-436f6d626f626f782e436c6561722e50726f70732e70726f703a64697361626c6564"></a>

<a id="api-436f6d626f626f782e436c6561722e50726f70732e70726f703a666f726d416374696f6e"></a>

<a id="api-436f6d626f626f782e436c6561722e50726f70732e70726f703a666f726d456e6374797065"></a>

<a id="api-436f6d626f626f782e436c6561722e50726f70732e70726f703a666f726d4d6574686f64"></a>

<a id="api-436f6d626f626f782e436c6561722e50726f70732e70726f703a666f726d4e6f56616c6964617465"></a>

<a id="api-436f6d626f626f782e436c6561722e50726f70732e70726f703a666f726d546172676574"></a>

<a id="api-436f6d626f626f782e436c6561722e50726f70732e70726f703a6e616d65"></a>

<a id="api-436f6d626f626f782e436c6561722e50726f70732e70726f703a706f706f766572546172676574416374696f6e"></a>

<a id="api-436f6d626f626f782e436c6561722e50726f70732e70726f703a706f706f766572546172676574456c656d656e74"></a>

<a id="api-436f6d626f626f782e436c6561722e50726f70732e70726f703a74797065"></a>

<a id="api-436f6d626f626f782e436c6561722e50726f70732e70726f703a76616c7565"></a>

### Related exported type: Combobox.Clear.Props

Declaration: `packages/solid/build/types/combobox/clear/ComboboxClear.d.ts:16`

#### Declaration

```typescript
ComboboxClearProps
```

<a id="api-436f6d626f626f782e436c6561722e50726f70732e6e6174697665427574746f6e"></a>

<a id="ComboboxClearProps-nativeButton"></a>

<a id="api-436f6d626f626f782e436c6561722e50726f70732e64697361626c6564"></a>

<a id="ComboboxClearProps-disabled"></a>

<a id="api-436f6d626f626f782e436c6561722e50726f70732e636c617373"></a>

<a id="ComboboxClearProps-class"></a>

<a id="api-436f6d626f626f782e436c6561722e50726f70732e7374796c65"></a>

<a id="ComboboxClearProps-style"></a>

<a id="api-436f6d626f626f782e436c6561722e50726f70732e6b6565704d6f756e746564"></a>

<a id="ComboboxClearProps-keepMounted"></a>

<a id="api-436f6d626f626f782e436c6561722e50726f70732e72656e646572"></a>

<a id="ComboboxClearProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| nativeButton | `boolean \| undefined` | No | Unavailable |  |
| disabled | `boolean \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<AutocompleteClearState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AutocompleteClearState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| keepMounted | `boolean \| undefined` | No | Unavailable |  |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, AutocompleteClearState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `command`, `commandfor`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `form`, `formaction`, `formenctype`, `formmethod`, `formnovalidate`, `formtarget`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `name`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `popovertarget`, `popovertargetaction`, `prefix`, `prop:disabled`, `prop:formAction`, `prop:formEnctype`, `prop:formMethod`, `prop:formNoValidate`, `prop:formTarget`, `prop:name`, `prop:popoverTargetAction`, `prop:popoverTargetElement`, `prop:type`, `prop:value`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `type`, `typeof`, `value`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6d626f626f782e436c6561722e5374617465"></a>

<a id="comboboxclearstate"></a>

### Related exported type: Combobox.Clear.State

Declaration: `packages/solid/build/types/combobox/clear/ComboboxClear.d.ts:17`

#### Declaration

```typescript
ComboboxClearState
```

<a id="api-436f6d626f626f782e436c6561722e53746174652e6f70656e"></a>

<a id="ComboboxClearState-open"></a>

<a id="api-436f6d626f626f782e436c6561722e53746174652e7472616e736974696f6e537461747573"></a>

<a id="ComboboxClearState-transitionStatus"></a>

<a id="api-436f6d626f626f782e436c6561722e53746174652e76697369626c65"></a>

<a id="ComboboxClearState-visible"></a>

<a id="api-436f6d626f626f782e436c6561722e53746174652e64697361626c6564"></a>

<a id="ComboboxClearState-disabled"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| open | `boolean` | Yes | Unavailable |  |
| transitionStatus | `TransitionStatus` | Yes | Unavailable |  |
| visible | `boolean` | Yes | Unavailable |  |
| disabled | `boolean` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="trigger"></a>

### Trigger

<a id="api-436f6d626f626f782e54726967676572"></a>

<a id="comboboxtrigger"></a>

<a id="api-436f6d626f626f782e547269676765722e2470726f70732e70726f703a64697361626c6564"></a>

<a id="api-436f6d626f626f782e547269676765722e2470726f70732e70726f703a666f726d416374696f6e"></a>

<a id="api-436f6d626f626f782e547269676765722e2470726f70732e70726f703a666f726d456e6374797065"></a>

<a id="api-436f6d626f626f782e547269676765722e2470726f70732e70726f703a666f726d4d6574686f64"></a>

<a id="api-436f6d626f626f782e547269676765722e2470726f70732e70726f703a666f726d4e6f56616c6964617465"></a>

<a id="api-436f6d626f626f782e547269676765722e2470726f70732e70726f703a666f726d546172676574"></a>

<a id="api-436f6d626f626f782e547269676765722e2470726f70732e70726f703a6e616d65"></a>

<a id="api-436f6d626f626f782e547269676765722e2470726f70732e70726f703a706f706f766572546172676574416374696f6e"></a>

<a id="api-436f6d626f626f782e547269676765722e2470726f70732e70726f703a706f706f766572546172676574456c656d656e74"></a>

<a id="api-436f6d626f626f782e547269676765722e2470726f70732e70726f703a74797065"></a>

<a id="api-436f6d626f626f782e547269676765722e2470726f70732e70726f703a76616c7565"></a>

### Combobox.Trigger

Declaration: `packages/solid/build/types/combobox/trigger/ComboboxTrigger.d.ts:16`

#### Declaration

```typescript
(props: ComboboxTriggerProps) => JSX.Element
```

<a id="api-436f6d626f626f782e547269676765722e2470726f70732e6e6174697665427574746f6e"></a>

<a id="ComboboxTrigger-nativeButton"></a>

<a id="api-436f6d626f626f782e547269676765722e2470726f70732e64697361626c6564"></a>

<a id="ComboboxTrigger-disabled"></a>

<a id="api-436f6d626f626f782e547269676765722e2470726f70732e636c617373"></a>

<a id="ComboboxTrigger-class"></a>

<a id="api-436f6d626f626f782e547269676765722e2470726f70732e7374796c65"></a>

<a id="ComboboxTrigger-style"></a>

<a id="api-436f6d626f626f782e547269676765722e2470726f70732e72656e646572"></a>

<a id="ComboboxTrigger-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| nativeButton | `boolean \| undefined` | No | true |  |
| disabled | `boolean \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<ComboboxTriggerState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ComboboxTriggerState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ComboboxTriggerState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `command`, `commandfor`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `form`, `formaction`, `formenctype`, `formmethod`, `formnovalidate`, `formtarget`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `name`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `popovertarget`, `popovertargetaction`, `prefix`, `prop:disabled`, `prop:formAction`, `prop:formEnctype`, `prop:formMethod`, `prop:formNoValidate`, `prop:formTarget`, `prop:name`, `prop:popoverTargetAction`, `prop:popoverTargetElement`, `prop:type`, `prop:value`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `type`, `typeof`, `value`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-436f6d626f626f785472696767657244617461417474726962757465732e706f7075704f70656e"></a>

<a id="api-436f6d626f626f785472696767657244617461417474726962757465732e706f70757053696465"></a>

<a id="api-436f6d626f626f785472696767657244617461417474726962757465732e6c697374456d707479"></a>

<a id="api-436f6d626f626f785472696767657244617461417474726962757465732e70726573736564"></a>

<a id="api-436f6d626f626f785472696767657244617461417474726962757465732e64697361626c6564"></a>

<a id="api-436f6d626f626f785472696767657244617461417474726962757465732e726561646f6e6c79"></a>

<a id="api-436f6d626f626f785472696767657244617461417474726962757465732e7265717569726564"></a>

<a id="api-436f6d626f626f785472696767657244617461417474726962757465732e76616c6964"></a>

<a id="api-436f6d626f626f785472696767657244617461417474726962757465732e696e76616c6964"></a>

<a id="api-436f6d626f626f785472696767657244617461417474726962757465732e6469727479"></a>

<a id="api-436f6d626f626f785472696767657244617461417474726962757465732e746f7563686564"></a>

<a id="api-436f6d626f626f785472696767657244617461417474726962757465732e66696c6c6564"></a>

<a id="api-436f6d626f626f785472696767657244617461417474726962757465732e666f6375736564"></a>

<a id="api-436f6d626f626f785472696767657244617461417474726962757465732e706c616365686f6c646572"></a>

| Name | Description |
| --- | --- |
| data-popup-open | Present when open is true. |
| data-popup-side |  |
| data-list-empty | Present when listEmpty is true. |
| data-pressed | Present when open is true. |
| data-disabled |  |
| data-readonly | Present when readOnly is true. |
| data-required |  |
| data-valid |  |
| data-invalid |  |
| data-dirty |  |
| data-touched |  |
| data-filled |  |
| data-focused |  |
| data-placeholder |  |

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6d626f626f782e547269676765722e50726f7073"></a>

<a id="comboboxtriggerprops"></a>

<a id="api-436f6d626f626f782e547269676765722e50726f70732e70726f703a64697361626c6564"></a>

<a id="api-436f6d626f626f782e547269676765722e50726f70732e70726f703a666f726d416374696f6e"></a>

<a id="api-436f6d626f626f782e547269676765722e50726f70732e70726f703a666f726d456e6374797065"></a>

<a id="api-436f6d626f626f782e547269676765722e50726f70732e70726f703a666f726d4d6574686f64"></a>

<a id="api-436f6d626f626f782e547269676765722e50726f70732e70726f703a666f726d4e6f56616c6964617465"></a>

<a id="api-436f6d626f626f782e547269676765722e50726f70732e70726f703a666f726d546172676574"></a>

<a id="api-436f6d626f626f782e547269676765722e50726f70732e70726f703a6e616d65"></a>

<a id="api-436f6d626f626f782e547269676765722e50726f70732e70726f703a706f706f766572546172676574416374696f6e"></a>

<a id="api-436f6d626f626f782e547269676765722e50726f70732e70726f703a706f706f766572546172676574456c656d656e74"></a>

<a id="api-436f6d626f626f782e547269676765722e50726f70732e70726f703a74797065"></a>

<a id="api-436f6d626f626f782e547269676765722e50726f70732e70726f703a76616c7565"></a>

### Related exported type: Combobox.Trigger.Props

Declaration: `packages/solid/build/types/combobox/trigger/ComboboxTrigger.d.ts:18`

#### Declaration

```typescript
ComboboxTriggerProps
```

<a id="api-436f6d626f626f782e547269676765722e50726f70732e6e6174697665427574746f6e"></a>

<a id="ComboboxTriggerProps-nativeButton"></a>

<a id="api-436f6d626f626f782e547269676765722e50726f70732e64697361626c6564"></a>

<a id="ComboboxTriggerProps-disabled"></a>

<a id="api-436f6d626f626f782e547269676765722e50726f70732e636c617373"></a>

<a id="ComboboxTriggerProps-class"></a>

<a id="api-436f6d626f626f782e547269676765722e50726f70732e7374796c65"></a>

<a id="ComboboxTriggerProps-style"></a>

<a id="api-436f6d626f626f782e547269676765722e50726f70732e72656e646572"></a>

<a id="ComboboxTriggerProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| nativeButton | `boolean \| undefined` | No | Unavailable |  |
| disabled | `boolean \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<ComboboxTriggerState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ComboboxTriggerState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ComboboxTriggerState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `command`, `commandfor`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `form`, `formaction`, `formenctype`, `formmethod`, `formnovalidate`, `formtarget`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `name`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `popovertarget`, `popovertargetaction`, `prefix`, `prop:disabled`, `prop:formAction`, `prop:formEnctype`, `prop:formMethod`, `prop:formNoValidate`, `prop:formTarget`, `prop:name`, `prop:popoverTargetAction`, `prop:popoverTargetElement`, `prop:type`, `prop:value`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `type`, `typeof`, `value`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6d626f626f782e547269676765722e5374617465"></a>

<a id="comboboxtriggerstate"></a>

### Related exported type: Combobox.Trigger.State

Declaration: `packages/solid/build/types/combobox/trigger/ComboboxTrigger.d.ts:19`

#### Declaration

```typescript
ComboboxTriggerState
```

<a id="api-436f6d626f626f782e547269676765722e53746174652e6f70656e"></a>

<a id="ComboboxTriggerState-open"></a>

<a id="api-436f6d626f626f782e547269676765722e53746174652e6469727479"></a>

<a id="ComboboxTriggerState-dirty"></a>

<a id="api-436f6d626f626f782e547269676765722e53746174652e66696c6c6564"></a>

<a id="ComboboxTriggerState-filled"></a>

<a id="api-436f6d626f626f782e547269676765722e53746174652e666f6375736564"></a>

<a id="ComboboxTriggerState-focused"></a>

<a id="api-436f6d626f626f782e547269676765722e53746174652e6c697374456d707479"></a>

<a id="ComboboxTriggerState-listEmpty"></a>

<a id="api-436f6d626f626f782e547269676765722e53746174652e706c616365686f6c646572"></a>

<a id="ComboboxTriggerState-placeholder"></a>

<a id="api-436f6d626f626f782e547269676765722e53746174652e706f70757053696465"></a>

<a id="ComboboxTriggerState-popupSide"></a>

<a id="api-436f6d626f626f782e547269676765722e53746174652e746f7563686564"></a>

<a id="ComboboxTriggerState-touched"></a>

<a id="api-436f6d626f626f782e547269676765722e53746174652e64697361626c6564"></a>

<a id="ComboboxTriggerState-disabled"></a>

<a id="api-436f6d626f626f782e547269676765722e53746174652e726561644f6e6c79"></a>

<a id="ComboboxTriggerState-readOnly"></a>

<a id="api-436f6d626f626f782e547269676765722e53746174652e76616c6964"></a>

<a id="ComboboxTriggerState-valid"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| open | `boolean` | Yes | Unavailable |  |
| dirty | `boolean` | Yes | Unavailable |  |
| filled | `boolean` | Yes | Unavailable |  |
| focused | `boolean` | Yes | Unavailable |  |
| listEmpty | `boolean` | Yes | Unavailable |  |
| placeholder | `boolean` | Yes | Unavailable |  |
| popupSide | `Side \| null` | Yes | Unavailable |  |
| touched | `boolean` | Yes | Unavailable |  |
| disabled | `boolean` | Yes | Unavailable |  |
| readOnly | `boolean` | Yes | Unavailable |  |
| valid | `boolean \| null` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="chips"></a>

### Chips

<a id="api-436f6d626f626f782e4368697073"></a>

<a id="comboboxchips"></a>

<a id="api-436f6d626f626f782e43686970732e2470726f70732e70726f703a616c69676e"></a>

### Combobox.Chips

Declaration: `packages/solid/build/types/combobox/chips/ComboboxChips.d.ts:6`

#### Declaration

```typescript
(props: ComboboxChipsProps) => JSX.Element
```

<a id="api-436f6d626f626f782e43686970732e2470726f70732e636c617373"></a>

<a id="ComboboxChips-class"></a>

<a id="api-436f6d626f626f782e43686970732e2470726f70732e7374796c65"></a>

<a id="ComboboxChips-style"></a>

<a id="api-436f6d626f626f782e43686970732e2470726f70732e72656e646572"></a>

<a id="ComboboxChips-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<ComboboxChipsState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ComboboxChipsState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ComboboxChipsState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6d626f626f782e43686970732e50726f7073"></a>

<a id="comboboxchipsprops"></a>

<a id="api-436f6d626f626f782e43686970732e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Combobox.Chips.Props

Declaration: `packages/solid/build/types/combobox/chips/ComboboxChips.d.ts:8`

#### Declaration

```typescript
ComboboxChipsProps
```

<a id="api-436f6d626f626f782e43686970732e50726f70732e636c617373"></a>

<a id="ComboboxChipsProps-class"></a>

<a id="api-436f6d626f626f782e43686970732e50726f70732e7374796c65"></a>

<a id="ComboboxChipsProps-style"></a>

<a id="api-436f6d626f626f782e43686970732e50726f70732e72656e646572"></a>

<a id="ComboboxChipsProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<ComboboxChipsState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ComboboxChipsState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ComboboxChipsState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6d626f626f782e43686970732e5374617465"></a>

<a id="comboboxchipsstate"></a>

### Related exported type: Combobox.Chips.State

Declaration: `packages/solid/build/types/combobox/chips/ComboboxChips.d.ts:9`

#### Declaration

```typescript
ComboboxChipsState
```

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="chip"></a>

### Chip

<a id="api-436f6d626f626f782e43686970"></a>

<a id="comboboxchip"></a>

<a id="api-436f6d626f626f782e436869702e2470726f70732e70726f703a616c69676e"></a>

### Combobox.Chip

Declaration: `packages/solid/build/types/combobox/chip/ComboboxChip.d.ts:7`

#### Declaration

```typescript
(props: ComboboxChipProps) => JSX.Element
```

<a id="api-436f6d626f626f782e436869702e2470726f70732e636c617373"></a>

<a id="ComboboxChip-class"></a>

<a id="api-436f6d626f626f782e436869702e2470726f70732e7374796c65"></a>

<a id="ComboboxChip-style"></a>

<a id="api-436f6d626f626f782e436869702e2470726f70732e72656e646572"></a>

<a id="ComboboxChip-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<ComboboxChipState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ComboboxChipState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ComboboxChipState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6d626f626f782e436869702e50726f7073"></a>

<a id="comboboxchipprops"></a>

<a id="api-436f6d626f626f782e436869702e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Combobox.Chip.Props

Declaration: `packages/solid/build/types/combobox/chip/ComboboxChip.d.ts:9`

#### Declaration

```typescript
ComboboxChipProps
```

<a id="api-436f6d626f626f782e436869702e50726f70732e636c617373"></a>

<a id="ComboboxChipProps-class"></a>

<a id="api-436f6d626f626f782e436869702e50726f70732e7374796c65"></a>

<a id="ComboboxChipProps-style"></a>

<a id="api-436f6d626f626f782e436869702e50726f70732e72656e646572"></a>

<a id="ComboboxChipProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<ComboboxChipState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ComboboxChipState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ComboboxChipState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6d626f626f782e436869702e5374617465"></a>

<a id="comboboxchipstate"></a>

### Related exported type: Combobox.Chip.State

Declaration: `packages/solid/build/types/combobox/chip/ComboboxChip.d.ts:10`

#### Declaration

```typescript
ComboboxChipState
```

<a id="api-436f6d626f626f782e436869702e53746174652e64697361626c6564"></a>

<a id="ComboboxChipState-disabled"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| disabled | `boolean` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="chipremove"></a>

### ChipRemove

<a id="api-436f6d626f626f782e4368697052656d6f7665"></a>

<a id="comboboxchipremove"></a>

<a id="api-436f6d626f626f782e4368697052656d6f76652e2470726f70732e70726f703a64697361626c6564"></a>

<a id="api-436f6d626f626f782e4368697052656d6f76652e2470726f70732e70726f703a666f726d416374696f6e"></a>

<a id="api-436f6d626f626f782e4368697052656d6f76652e2470726f70732e70726f703a666f726d456e6374797065"></a>

<a id="api-436f6d626f626f782e4368697052656d6f76652e2470726f70732e70726f703a666f726d4d6574686f64"></a>

<a id="api-436f6d626f626f782e4368697052656d6f76652e2470726f70732e70726f703a666f726d4e6f56616c6964617465"></a>

<a id="api-436f6d626f626f782e4368697052656d6f76652e2470726f70732e70726f703a666f726d546172676574"></a>

<a id="api-436f6d626f626f782e4368697052656d6f76652e2470726f70732e70726f703a6e616d65"></a>

<a id="api-436f6d626f626f782e4368697052656d6f76652e2470726f70732e70726f703a706f706f766572546172676574416374696f6e"></a>

<a id="api-436f6d626f626f782e4368697052656d6f76652e2470726f70732e70726f703a706f706f766572546172676574456c656d656e74"></a>

<a id="api-436f6d626f626f782e4368697052656d6f76652e2470726f70732e70726f703a74797065"></a>

<a id="api-436f6d626f626f782e4368697052656d6f76652e2470726f70732e70726f703a76616c7565"></a>

### Combobox.ChipRemove

Declaration: `packages/solid/build/types/combobox/chip-remove/ComboboxChipRemove.d.ts:9`

#### Declaration

```typescript
(props: ComboboxChipRemoveProps) => JSX.Element
```

<a id="api-436f6d626f626f782e4368697052656d6f76652e2470726f70732e6e6174697665427574746f6e"></a>

<a id="ComboboxChipRemove-nativeButton"></a>

<a id="api-436f6d626f626f782e4368697052656d6f76652e2470726f70732e64697361626c6564"></a>

<a id="ComboboxChipRemove-disabled"></a>

<a id="api-436f6d626f626f782e4368697052656d6f76652e2470726f70732e636c617373"></a>

<a id="ComboboxChipRemove-class"></a>

<a id="api-436f6d626f626f782e4368697052656d6f76652e2470726f70732e7374796c65"></a>

<a id="ComboboxChipRemove-style"></a>

<a id="api-436f6d626f626f782e4368697052656d6f76652e2470726f70732e72656e646572"></a>

<a id="ComboboxChipRemove-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| nativeButton | `boolean \| undefined` | No | true |  |
| disabled | `boolean \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<ComboboxChipRemoveState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ComboboxChipRemoveState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ComboboxChipRemoveState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `command`, `commandfor`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `form`, `formaction`, `formenctype`, `formmethod`, `formnovalidate`, `formtarget`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `name`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `popovertarget`, `popovertargetaction`, `prefix`, `prop:disabled`, `prop:formAction`, `prop:formEnctype`, `prop:formMethod`, `prop:formNoValidate`, `prop:formTarget`, `prop:name`, `prop:popoverTargetAction`, `prop:popoverTargetElement`, `prop:type`, `prop:value`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `type`, `typeof`, `value`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6d626f626f782e4368697052656d6f76652e50726f7073"></a>

<a id="comboboxchipremoveprops"></a>

<a id="api-436f6d626f626f782e4368697052656d6f76652e50726f70732e70726f703a64697361626c6564"></a>

<a id="api-436f6d626f626f782e4368697052656d6f76652e50726f70732e70726f703a666f726d416374696f6e"></a>

<a id="api-436f6d626f626f782e4368697052656d6f76652e50726f70732e70726f703a666f726d456e6374797065"></a>

<a id="api-436f6d626f626f782e4368697052656d6f76652e50726f70732e70726f703a666f726d4d6574686f64"></a>

<a id="api-436f6d626f626f782e4368697052656d6f76652e50726f70732e70726f703a666f726d4e6f56616c6964617465"></a>

<a id="api-436f6d626f626f782e4368697052656d6f76652e50726f70732e70726f703a666f726d546172676574"></a>

<a id="api-436f6d626f626f782e4368697052656d6f76652e50726f70732e70726f703a6e616d65"></a>

<a id="api-436f6d626f626f782e4368697052656d6f76652e50726f70732e70726f703a706f706f766572546172676574416374696f6e"></a>

<a id="api-436f6d626f626f782e4368697052656d6f76652e50726f70732e70726f703a706f706f766572546172676574456c656d656e74"></a>

<a id="api-436f6d626f626f782e4368697052656d6f76652e50726f70732e70726f703a74797065"></a>

<a id="api-436f6d626f626f782e4368697052656d6f76652e50726f70732e70726f703a76616c7565"></a>

### Related exported type: Combobox.ChipRemove.Props

Declaration: `packages/solid/build/types/combobox/chip-remove/ComboboxChipRemove.d.ts:11`

#### Declaration

```typescript
ComboboxChipRemoveProps
```

<a id="api-436f6d626f626f782e4368697052656d6f76652e50726f70732e6e6174697665427574746f6e"></a>

<a id="ComboboxChipRemoveProps-nativeButton"></a>

<a id="api-436f6d626f626f782e4368697052656d6f76652e50726f70732e64697361626c6564"></a>

<a id="ComboboxChipRemoveProps-disabled"></a>

<a id="api-436f6d626f626f782e4368697052656d6f76652e50726f70732e636c617373"></a>

<a id="ComboboxChipRemoveProps-class"></a>

<a id="api-436f6d626f626f782e4368697052656d6f76652e50726f70732e7374796c65"></a>

<a id="ComboboxChipRemoveProps-style"></a>

<a id="api-436f6d626f626f782e4368697052656d6f76652e50726f70732e72656e646572"></a>

<a id="ComboboxChipRemoveProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| nativeButton | `boolean \| undefined` | No | Unavailable |  |
| disabled | `boolean \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<ComboboxChipRemoveState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ComboboxChipRemoveState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ComboboxChipRemoveState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `command`, `commandfor`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `form`, `formaction`, `formenctype`, `formmethod`, `formnovalidate`, `formtarget`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `name`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `popovertarget`, `popovertargetaction`, `prefix`, `prop:disabled`, `prop:formAction`, `prop:formEnctype`, `prop:formMethod`, `prop:formNoValidate`, `prop:formTarget`, `prop:name`, `prop:popoverTargetAction`, `prop:popoverTargetElement`, `prop:type`, `prop:value`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `type`, `typeof`, `value`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6d626f626f782e4368697052656d6f76652e5374617465"></a>

<a id="comboboxchipremovestate"></a>

### Related exported type: Combobox.ChipRemove.State

Declaration: `packages/solid/build/types/combobox/chip-remove/ComboboxChipRemove.d.ts:12`

#### Declaration

```typescript
ComboboxChipRemoveState
```

<a id="api-436f6d626f626f782e4368697052656d6f76652e53746174652e64697361626c6564"></a>

<a id="ComboboxChipRemoveState-disabled"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| disabled | `boolean` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="list"></a>

### List

<a id="api-436f6d626f626f782e4c697374"></a>

<a id="comboboxlist"></a>

<a id="api-436f6d626f626f782e4c6973742e2470726f70732e70726f703a616c69676e"></a>

### Combobox.List

Declaration: `packages/solid/build/types/combobox/list/ComboboxList.d.ts:9`

#### Declaration

```typescript
(props: ComboboxListProps) => JSX.Element
```

<a id="api-436f6d626f626f782e4c6973742e2470726f70732e6368696c6472656e"></a>

<a id="ComboboxList-children"></a>

<a id="api-436f6d626f626f782e4c6973742e2470726f70732e636c617373"></a>

<a id="ComboboxList-class"></a>

<a id="api-436f6d626f626f782e4c6973742e2470726f70732e7374796c65"></a>

<a id="ComboboxList-style"></a>

<a id="api-436f6d626f626f782e4c6973742e2470726f70732e72656e646572"></a>

<a id="ComboboxList-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| children | `JSX.Element \| ((item: any, index: number) => JSX.Element)` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<AutocompleteListState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AutocompleteListState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, AutocompleteListState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6d626f626f782e4c6973742e50726f7073"></a>

<a id="comboboxlistprops"></a>

<a id="api-436f6d626f626f782e4c6973742e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Combobox.List.Props

Declaration: `packages/solid/build/types/combobox/list/ComboboxList.d.ts:11`

#### Declaration

```typescript
ComboboxListProps
```

<a id="api-436f6d626f626f782e4c6973742e50726f70732e6368696c6472656e"></a>

<a id="ComboboxListProps-children"></a>

<a id="api-436f6d626f626f782e4c6973742e50726f70732e636c617373"></a>

<a id="ComboboxListProps-class"></a>

<a id="api-436f6d626f626f782e4c6973742e50726f70732e7374796c65"></a>

<a id="ComboboxListProps-style"></a>

<a id="api-436f6d626f626f782e4c6973742e50726f70732e72656e646572"></a>

<a id="ComboboxListProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| children | `JSX.Element \| ((item: any, index: number) => JSX.Element)` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<AutocompleteListState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AutocompleteListState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, AutocompleteListState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6d626f626f782e4c6973742e5374617465"></a>

<a id="comboboxliststate"></a>

### Related exported type: Combobox.List.State

Declaration: `packages/solid/build/types/combobox/list/ComboboxList.d.ts:12`

#### Declaration

```typescript
ComboboxListState
```

<a id="api-436f6d626f626f782e4c6973742e53746174652e656d707479"></a>

<a id="ComboboxListState-empty"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| empty | `boolean` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="portal"></a>

### Portal

<a id="api-436f6d626f626f782e506f7274616c"></a>

<a id="comboboxportal"></a>

<a id="api-436f6d626f626f782e506f7274616c2e2470726f70732e70726f703a616c69676e"></a>

### Combobox.Portal

Declaration: `packages/solid/build/types/combobox/portal/ComboboxPortal.d.ts:6`

#### Declaration

```typescript
(props: ComboboxPortalProps) => JSX.Element
```

<a id="api-436f6d626f626f782e506f7274616c2e2470726f70732e706f7274616c4f776e6572526f6c65"></a>

<a id="ComboboxPortal-portalOwnerRole"></a>

<a id="api-436f6d626f626f782e506f7274616c2e2470726f70732e70726573657276655461624f72646572"></a>

<a id="ComboboxPortal-preserveTabOrder"></a>

<a id="api-436f6d626f626f782e506f7274616c2e2470726f70732e636f6e7461696e6572"></a>

<a id="ComboboxPortal-container"></a>

<a id="api-436f6d626f626f782e506f7274616c2e2470726f70732e636c617373"></a>

<a id="ComboboxPortal-class"></a>

<a id="api-436f6d626f626f782e506f7274616c2e2470726f70732e7374796c65"></a>

<a id="ComboboxPortal-style"></a>

<a id="api-436f6d626f626f782e506f7274616c2e2470726f70732e6b6565704d6f756e746564"></a>

<a id="ComboboxPortal-keepMounted"></a>

<a id="api-436f6d626f626f782e506f7274616c2e2470726f70732e72656e646572"></a>

<a id="ComboboxPortal-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| portalOwnerRole | `"search" \| "link" \| "none" \| "button" \| "grid" \| "article" \| "dialog" \| "figure" \| "form" \| "img" \| "main" \| "menu" \| "meter" \| "option" \| "table" \| "marquee" \| "menuitem" \| "switch" \| "math" \| "directory" \| "document" \| "menubar" \| "status" \| "toolbar" \| "alert" \| "group" \| "region" \| "navigation" \| "checkbox" \| "listbox" \| "radio" \| "cell" \| "row" \| "listitem" \| "progressbar" \| "separator" \| "tab" \| "tabpanel" \| "tooltip" \| "treeitem" \| "scrollbar" \| JSX.RemoveAttribute \| "list" \| "tree" \| "alertdialog" \| "application" \| "banner" \| "columnheader" \| "combobox" \| "complementary" \| "contentinfo" \| "definition" \| "feed" \| "gridcell" \| "heading" \| "log" \| "menuitemcheckbox" \| "menuitemradio" \| "note" \| "presentation" \| "radiogroup" \| "rowgroup" \| "rowheader" \| "searchbox" \| "slider" \| "spinbutton" \| "tablist" \| "term" \| "textbox" \| "timer" \| "treegrid"` | No | Unavailable |  |
| preserveTabOrder | `boolean \| undefined` | No | Unavailable |  |
| container | `PortalContainer` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<{}>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<{}>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| keepMounted | `boolean \| undefined` | No | false |  |
| render | `ComponentRenderFn<JSX.HTMLAttributes<HTMLElement>, {}> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6d626f626f782e506f7274616c2e50726f7073"></a>

<a id="comboboxportalprops"></a>

<a id="api-436f6d626f626f782e506f7274616c2e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Combobox.Portal.Props

Declaration: `packages/solid/build/types/combobox/portal/ComboboxPortal.d.ts:8`

#### Declaration

```typescript
ComboboxPortalProps
```

<a id="api-436f6d626f626f782e506f7274616c2e50726f70732e706f7274616c4f776e6572526f6c65"></a>

<a id="ComboboxPortalProps-portalOwnerRole"></a>

<a id="api-436f6d626f626f782e506f7274616c2e50726f70732e70726573657276655461624f72646572"></a>

<a id="ComboboxPortalProps-preserveTabOrder"></a>

<a id="api-436f6d626f626f782e506f7274616c2e50726f70732e636f6e7461696e6572"></a>

<a id="ComboboxPortalProps-container"></a>

<a id="api-436f6d626f626f782e506f7274616c2e50726f70732e636c617373"></a>

<a id="ComboboxPortalProps-class"></a>

<a id="api-436f6d626f626f782e506f7274616c2e50726f70732e7374796c65"></a>

<a id="ComboboxPortalProps-style"></a>

<a id="api-436f6d626f626f782e506f7274616c2e50726f70732e6b6565704d6f756e746564"></a>

<a id="ComboboxPortalProps-keepMounted"></a>

<a id="api-436f6d626f626f782e506f7274616c2e50726f70732e72656e646572"></a>

<a id="ComboboxPortalProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| portalOwnerRole | `"search" \| "link" \| "none" \| "button" \| "grid" \| "article" \| "dialog" \| "figure" \| "form" \| "img" \| "main" \| "menu" \| "meter" \| "option" \| "table" \| "marquee" \| "menuitem" \| "switch" \| "math" \| "directory" \| "document" \| "menubar" \| "status" \| "toolbar" \| "alert" \| "group" \| "region" \| "navigation" \| "checkbox" \| "listbox" \| "radio" \| "cell" \| "row" \| "listitem" \| "progressbar" \| "separator" \| "tab" \| "tabpanel" \| "tooltip" \| "treeitem" \| "scrollbar" \| JSX.RemoveAttribute \| "list" \| "tree" \| "alertdialog" \| "application" \| "banner" \| "columnheader" \| "combobox" \| "complementary" \| "contentinfo" \| "definition" \| "feed" \| "gridcell" \| "heading" \| "log" \| "menuitemcheckbox" \| "menuitemradio" \| "note" \| "presentation" \| "radiogroup" \| "rowgroup" \| "rowheader" \| "searchbox" \| "slider" \| "spinbutton" \| "tablist" \| "term" \| "textbox" \| "timer" \| "treegrid"` | No | Unavailable |  |
| preserveTabOrder | `boolean \| undefined` | No | Unavailable |  |
| container | `PortalContainer` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<{}>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<{}>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| keepMounted | `boolean \| undefined` | No | Unavailable |  |
| render | `ComponentRenderFn<JSX.HTMLAttributes<HTMLElement>, {}> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6d626f626f782e506f7274616c2e5374617465"></a>

<a id="comboboxportalstate"></a>

### Related exported type: Combobox.Portal.State

Declaration: `packages/solid/build/types/combobox/portal/ComboboxPortal.d.ts:9`

#### Declaration

```typescript
ComboboxPortalState
```

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="backdrop"></a>

### Backdrop

<a id="api-436f6d626f626f782e4261636b64726f70"></a>

<a id="comboboxbackdrop"></a>

<a id="api-436f6d626f626f782e4261636b64726f702e2470726f70732e70726f703a616c69676e"></a>

### Combobox.Backdrop

Declaration: `packages/solid/build/types/combobox/backdrop/ComboboxBackdrop.d.ts:9`

#### Declaration

```typescript
(props: ComboboxBackdropProps) => JSX.Element
```

<a id="api-436f6d626f626f782e4261636b64726f702e2470726f70732e636c617373"></a>

<a id="ComboboxBackdrop-class"></a>

<a id="api-436f6d626f626f782e4261636b64726f702e2470726f70732e7374796c65"></a>

<a id="ComboboxBackdrop-style"></a>

<a id="api-436f6d626f626f782e4261636b64726f702e2470726f70732e72656e646572"></a>

<a id="ComboboxBackdrop-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<AutocompleteBackdropState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AutocompleteBackdropState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, AutocompleteBackdropState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-436f6d626f626f784261636b64726f7044617461417474726962757465732e6f70656e"></a>

<a id="api-436f6d626f626f784261636b64726f7044617461417474726962757465732e636c6f736564"></a>

<a id="api-436f6d626f626f784261636b64726f7044617461417474726962757465732e7374617274696e675374796c65"></a>

<a id="api-436f6d626f626f784261636b64726f7044617461417474726962757465732e656e64696e675374796c65"></a>

| Name | Description |
| --- | --- |
| data-open |  |
| data-closed |  |
| data-starting-style | Present when transitionStatus is 'starting'. |
| data-ending-style | Present when transitionStatus is 'ending'. |

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6d626f626f782e4261636b64726f702e50726f7073"></a>

<a id="comboboxbackdropprops"></a>

<a id="api-436f6d626f626f782e4261636b64726f702e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Combobox.Backdrop.Props

Declaration: `packages/solid/build/types/combobox/backdrop/ComboboxBackdrop.d.ts:11`

#### Declaration

```typescript
ComboboxBackdropProps
```

<a id="api-436f6d626f626f782e4261636b64726f702e50726f70732e636c617373"></a>

<a id="ComboboxBackdropProps-class"></a>

<a id="api-436f6d626f626f782e4261636b64726f702e50726f70732e7374796c65"></a>

<a id="ComboboxBackdropProps-style"></a>

<a id="api-436f6d626f626f782e4261636b64726f702e50726f70732e72656e646572"></a>

<a id="ComboboxBackdropProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<AutocompleteBackdropState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AutocompleteBackdropState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, AutocompleteBackdropState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6d626f626f782e4261636b64726f702e5374617465"></a>

<a id="comboboxbackdropstate"></a>

### Related exported type: Combobox.Backdrop.State

Declaration: `packages/solid/build/types/combobox/backdrop/ComboboxBackdrop.d.ts:12`

#### Declaration

```typescript
ComboboxBackdropState
```

<a id="api-436f6d626f626f782e4261636b64726f702e53746174652e6f70656e"></a>

<a id="ComboboxBackdropState-open"></a>

<a id="api-436f6d626f626f782e4261636b64726f702e53746174652e7472616e736974696f6e537461747573"></a>

<a id="ComboboxBackdropState-transitionStatus"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| open | `boolean` | Yes | Unavailable |  |
| transitionStatus | `TransitionStatus` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="positioner"></a>

### Positioner

<a id="api-436f6d626f626f782e506f736974696f6e6572"></a>

<a id="comboboxpositioner"></a>

<a id="api-436f6d626f626f782e506f736974696f6e65722e2470726f70732e70726f703a616c69676e"></a>

### Combobox.Positioner

Declaration: `packages/solid/build/types/combobox/positioner/ComboboxPositioner.d.ts:12`

#### Declaration

```typescript
(props: ComboboxPositionerProps) => JSX.Element
```

<a id="api-436f6d626f626f782e506f736974696f6e65722e2470726f70732e64697361626c65416e63686f72547261636b696e67"></a>

<a id="ComboboxPositioner-disableAnchorTracking"></a>

<a id="api-436f6d626f626f782e506f736974696f6e65722e2470726f70732e616c69676e"></a>

<a id="ComboboxPositioner-align"></a>

<a id="api-436f6d626f626f782e506f736974696f6e65722e2470726f70732e616c69676e4f6666736574"></a>

<a id="ComboboxPositioner-alignOffset"></a>

<a id="api-436f6d626f626f782e506f736974696f6e65722e2470726f70732e73696465"></a>

<a id="ComboboxPositioner-side"></a>

<a id="api-436f6d626f626f782e506f736974696f6e65722e2470726f70732e736964654f6666736574"></a>

<a id="ComboboxPositioner-sideOffset"></a>

<a id="api-436f6d626f626f782e506f736974696f6e65722e2470726f70732e6172726f7750616464696e67"></a>

<a id="ComboboxPositioner-arrowPadding"></a>

<a id="api-436f6d626f626f782e506f736974696f6e65722e2470726f70732e616e63686f72"></a>

<a id="ComboboxPositioner-anchor"></a>

<a id="api-436f6d626f626f782e506f736974696f6e65722e2470726f70732e636f6c6c6973696f6e41766f6964616e6365"></a>

<a id="ComboboxPositioner-collisionAvoidance"></a>

<a id="api-436f6d626f626f782e506f736974696f6e65722e2470726f70732e636f6c6c6973696f6e426f756e64617279"></a>

<a id="ComboboxPositioner-collisionBoundary"></a>

<a id="api-436f6d626f626f782e506f736974696f6e65722e2470726f70732e636f6c6c6973696f6e50616464696e67"></a>

<a id="ComboboxPositioner-collisionPadding"></a>

<a id="api-436f6d626f626f782e506f736974696f6e65722e2470726f70732e737469636b79"></a>

<a id="ComboboxPositioner-sticky"></a>

<a id="api-436f6d626f626f782e506f736974696f6e65722e2470726f70732e706f736974696f6e4d6574686f64"></a>

<a id="ComboboxPositioner-positionMethod"></a>

<a id="api-436f6d626f626f782e506f736974696f6e65722e2470726f70732e636c617373"></a>

<a id="ComboboxPositioner-class"></a>

<a id="api-436f6d626f626f782e506f736974696f6e65722e2470726f70732e7374796c65"></a>

<a id="ComboboxPositioner-style"></a>

<a id="api-436f6d626f626f782e506f736974696f6e65722e2470726f70732e72656e646572"></a>

<a id="ComboboxPositioner-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| disableAnchorTracking | `boolean \| undefined` | No | Unavailable | Disables ancestor-scroll, element-resize and layout-shift observation used for automatic positioning updates. |
| align | `Align \| undefined` | No | Unavailable | Preferred alignment along the anchor’s side. Collision handling can change the resolved alignment. |
| alignOffset | `number \| OffsetFunction \| undefined` | No | Unavailable | Offset along the alignment axis, in pixels. A callback receives anchor and positioner dimensions plus the side and alignment. |
| side | `Side \| undefined` | No | Unavailable | Preferred side of the anchor. Logical inline sides follow the text direction; collision handling can change the resolved side. |
| sideOffset | `number \| OffsetFunction \| undefined` | No | Unavailable | Distance from the anchor along the side axis, in pixels. A callback receives anchor and positioner dimensions plus the side and alignment. |
| arrowPadding | `number \| undefined` | No | Unavailable | Minimum padding in pixels between the arrow and the floating element’s edges. |
| anchor | `ReferenceType \| (() => ReferenceType \| null) \| null \| undefined` | No | Unavailable | Positioning reference: an element or virtual reference, or an accessor returning one. A nullish reference falls back to the root’s reference. |
| collisionAvoidance | `{ side?: "flip" \| "shift" \| "none"; align?: "flip" \| "shift" \| "none"; fallbackAxisSide?: "start" \| "end" \| "none"; } \| undefined` | No | { side: 'flip', align: 'shift', fallbackAxisSide: 'none' } | Controls flipping or shifting along the side and alignment axes, including fallback placement on the perpendicular axis. |
| collisionBoundary | `Boundary \| "clipping-ancestors" \| undefined` | No | Unavailable | Boundary used to detect overflow. The clipping-ancestors value uses clipping ancestors as the overflow boundary. |
| collisionPadding | `Padding \| undefined` | No | Unavailable | Space in pixels reserved inside the collision boundary, either for all edges or per edge. |
| sticky | `boolean \| undefined` | No | Unavailable | Allows shifting along the side axis without the usual limitShift limiter. |
| positionMethod | `"fixed" \| "absolute" \| undefined` | No | Unavailable | CSS positioning strategy used by the floating element: absolute or fixed. |
| class | `JSX.ClassValue \| ((state: Readonly<AutocompletePositionerState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AutocompletePositionerState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, AutocompletePositionerState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-436f6d626f626f78506f736974696f6e657244617461417474726962757465732e6f70656e"></a>

<a id="api-436f6d626f626f78506f736974696f6e657244617461417474726962757465732e636c6f736564"></a>

<a id="api-436f6d626f626f78506f736974696f6e657244617461417474726962757465732e616e63686f7248696464656e"></a>

<a id="api-436f6d626f626f78506f736974696f6e657244617461417474726962757465732e616c69676e"></a>

<a id="api-436f6d626f626f78506f736974696f6e657244617461417474726962757465732e656d707479"></a>

<a id="api-436f6d626f626f78506f736974696f6e657244617461417474726962757465732e73696465"></a>

| Name | Description |
| --- | --- |
| data-open |  |
| data-closed |  |
| data-anchor-hidden |  |
| data-align |  |
| data-empty |  |
| data-side |  |

#### CSS variables

<a id="api-436f6d626f626f78506f736974696f6e65724373735661726961626c65732e616e63686f72486569676874"></a>

<a id="api-436f6d626f626f78506f736974696f6e65724373735661726961626c65732e616e63686f725769647468"></a>

<a id="api-436f6d626f626f78506f736974696f6e65724373735661726961626c65732e617661696c61626c65486569676874"></a>

<a id="api-436f6d626f626f78506f736974696f6e65724373735661726961626c65732e617661696c61626c655769647468"></a>

<a id="api-436f6d626f626f78506f736974696f6e65724373735661726961626c65732e7472616e73666f726d4f726967696e"></a>

| Name | Description |
| --- | --- |
| --anchor-height |  |
| --anchor-width |  |
| --available-height |  |
| --available-width |  |
| --transform-origin |  |

<a id="api-436f6d626f626f782e506f736974696f6e65722e50726f7073"></a>

<a id="comboboxpositionerprops"></a>

<a id="api-436f6d626f626f782e506f736974696f6e65722e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Combobox.Positioner.Props

Declaration: `packages/solid/build/types/combobox/positioner/ComboboxPositioner.d.ts:14`

#### Declaration

```typescript
ComboboxPositionerProps
```

<a id="api-436f6d626f626f782e506f736974696f6e65722e50726f70732e64697361626c65416e63686f72547261636b696e67"></a>

<a id="ComboboxPositionerProps-disableAnchorTracking"></a>

<a id="api-436f6d626f626f782e506f736974696f6e65722e50726f70732e616c69676e"></a>

<a id="ComboboxPositionerProps-align"></a>

<a id="api-436f6d626f626f782e506f736974696f6e65722e50726f70732e616c69676e4f6666736574"></a>

<a id="ComboboxPositionerProps-alignOffset"></a>

<a id="api-436f6d626f626f782e506f736974696f6e65722e50726f70732e73696465"></a>

<a id="ComboboxPositionerProps-side"></a>

<a id="api-436f6d626f626f782e506f736974696f6e65722e50726f70732e736964654f6666736574"></a>

<a id="ComboboxPositionerProps-sideOffset"></a>

<a id="api-436f6d626f626f782e506f736974696f6e65722e50726f70732e6172726f7750616464696e67"></a>

<a id="ComboboxPositionerProps-arrowPadding"></a>

<a id="api-436f6d626f626f782e506f736974696f6e65722e50726f70732e616e63686f72"></a>

<a id="ComboboxPositionerProps-anchor"></a>

<a id="api-436f6d626f626f782e506f736974696f6e65722e50726f70732e636f6c6c6973696f6e41766f6964616e6365"></a>

<a id="ComboboxPositionerProps-collisionAvoidance"></a>

<a id="api-436f6d626f626f782e506f736974696f6e65722e50726f70732e636f6c6c6973696f6e426f756e64617279"></a>

<a id="ComboboxPositionerProps-collisionBoundary"></a>

<a id="api-436f6d626f626f782e506f736974696f6e65722e50726f70732e636f6c6c6973696f6e50616464696e67"></a>

<a id="ComboboxPositionerProps-collisionPadding"></a>

<a id="api-436f6d626f626f782e506f736974696f6e65722e50726f70732e737469636b79"></a>

<a id="ComboboxPositionerProps-sticky"></a>

<a id="api-436f6d626f626f782e506f736974696f6e65722e50726f70732e706f736974696f6e4d6574686f64"></a>

<a id="ComboboxPositionerProps-positionMethod"></a>

<a id="api-436f6d626f626f782e506f736974696f6e65722e50726f70732e636c617373"></a>

<a id="ComboboxPositionerProps-class"></a>

<a id="api-436f6d626f626f782e506f736974696f6e65722e50726f70732e7374796c65"></a>

<a id="ComboboxPositionerProps-style"></a>

<a id="api-436f6d626f626f782e506f736974696f6e65722e50726f70732e72656e646572"></a>

<a id="ComboboxPositionerProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| disableAnchorTracking | `boolean \| undefined` | No | Unavailable | Disables ancestor-scroll, element-resize and layout-shift observation used for automatic positioning updates. |
| align | `Align \| undefined` | No | Unavailable | Preferred alignment along the anchor’s side. Collision handling can change the resolved alignment. |
| alignOffset | `number \| OffsetFunction \| undefined` | No | Unavailable | Offset along the alignment axis, in pixels. A callback receives anchor and positioner dimensions plus the side and alignment. |
| side | `Side \| undefined` | No | Unavailable | Preferred side of the anchor. Logical inline sides follow the text direction; collision handling can change the resolved side. |
| sideOffset | `number \| OffsetFunction \| undefined` | No | Unavailable | Distance from the anchor along the side axis, in pixels. A callback receives anchor and positioner dimensions plus the side and alignment. |
| arrowPadding | `number \| undefined` | No | Unavailable | Minimum padding in pixels between the arrow and the floating element’s edges. |
| anchor | `ReferenceType \| (() => ReferenceType \| null) \| null \| undefined` | No | Unavailable | Positioning reference: an element or virtual reference, or an accessor returning one. A nullish reference falls back to the root’s reference. |
| collisionAvoidance | `{ side?: "flip" \| "shift" \| "none"; align?: "flip" \| "shift" \| "none"; fallbackAxisSide?: "start" \| "end" \| "none"; } \| undefined` | No | Unavailable | Controls flipping or shifting along the side and alignment axes, including fallback placement on the perpendicular axis. |
| collisionBoundary | `Boundary \| "clipping-ancestors" \| undefined` | No | Unavailable | Boundary used to detect overflow. The clipping-ancestors value uses clipping ancestors as the overflow boundary. |
| collisionPadding | `Padding \| undefined` | No | Unavailable | Space in pixels reserved inside the collision boundary, either for all edges or per edge. |
| sticky | `boolean \| undefined` | No | Unavailable | Allows shifting along the side axis without the usual limitShift limiter. |
| positionMethod | `"fixed" \| "absolute" \| undefined` | No | Unavailable | CSS positioning strategy used by the floating element: absolute or fixed. |
| class | `JSX.ClassValue \| ((state: Readonly<AutocompletePositionerState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AutocompletePositionerState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, AutocompletePositionerState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6d626f626f782e506f736974696f6e65722e5374617465"></a>

<a id="comboboxpositionerstate"></a>

### Related exported type: Combobox.Positioner.State

Declaration: `packages/solid/build/types/combobox/positioner/ComboboxPositioner.d.ts:15`

#### Declaration

```typescript
ComboboxPositionerState
```

<a id="api-436f6d626f626f782e506f736974696f6e65722e53746174652e6f70656e"></a>

<a id="ComboboxPositionerState-open"></a>

<a id="api-436f6d626f626f782e506f736974696f6e65722e53746174652e616e63686f7248696464656e"></a>

<a id="ComboboxPositionerState-anchorHidden"></a>

<a id="api-436f6d626f626f782e506f736974696f6e65722e53746174652e656d707479"></a>

<a id="ComboboxPositionerState-empty"></a>

<a id="api-436f6d626f626f782e506f736974696f6e65722e53746174652e616c69676e"></a>

<a id="ComboboxPositionerState-align"></a>

<a id="api-436f6d626f626f782e506f736974696f6e65722e53746174652e73696465"></a>

<a id="ComboboxPositionerState-side"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| open | `boolean` | Yes | Unavailable |  |
| anchorHidden | `boolean` | Yes | Unavailable |  |
| empty | `boolean` | Yes | Unavailable |  |
| align | `Align` | Yes | Unavailable |  |
| side | `Side` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="popup"></a>

### Popup

<a id="api-436f6d626f626f782e506f707570"></a>

<a id="comboboxpopup"></a>

<a id="api-436f6d626f626f782e506f7075702e2470726f70732e70726f703a616c69676e"></a>

### Combobox.Popup

Declaration: `packages/solid/build/types/combobox/popup/ComboboxPopup.d.ts:17`

#### Declaration

```typescript
(props: ComboboxPopupProps) => JSX.Element
```

<a id="api-436f6d626f626f782e506f7075702e2470726f70732e696e697469616c466f637573"></a>

<a id="ComboboxPopup-initialFocus"></a>

<a id="api-436f6d626f626f782e506f7075702e2470726f70732e66696e616c466f637573"></a>

<a id="ComboboxPopup-finalFocus"></a>

<a id="api-436f6d626f626f782e506f7075702e2470726f70732e636c617373"></a>

<a id="ComboboxPopup-class"></a>

<a id="api-436f6d626f626f782e506f7075702e2470726f70732e7374796c65"></a>

<a id="ComboboxPopup-style"></a>

<a id="api-436f6d626f626f782e506f7075702e2470726f70732e72656e646572"></a>

<a id="ComboboxPopup-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| initialFocus | `FocusTarget \| undefined` | No | Unavailable |  |
| finalFocus | `FocusTarget \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<AutocompletePopupState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AutocompletePopupState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, AutocompletePopupState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-436f6d626f626f78506f70757044617461417474726962757465732e6f70656e"></a>

<a id="api-436f6d626f626f78506f70757044617461417474726962757465732e636c6f736564"></a>

<a id="api-436f6d626f626f78506f70757044617461417474726962757465732e616e63686f7248696464656e"></a>

<a id="api-436f6d626f626f78506f70757044617461417474726962757465732e616c69676e"></a>

<a id="api-436f6d626f626f78506f70757044617461417474726962757465732e656d707479"></a>

<a id="api-436f6d626f626f78506f70757044617461417474726962757465732e73696465"></a>

<a id="api-436f6d626f626f78506f70757044617461417474726962757465732e7374617274696e675374796c65"></a>

<a id="api-436f6d626f626f78506f70757044617461417474726962757465732e656e64696e675374796c65"></a>

| Name | Description |
| --- | --- |
| data-open |  |
| data-closed |  |
| data-anchor-hidden |  |
| data-align |  |
| data-empty |  |
| data-side |  |
| data-starting-style | Present when transitionStatus is 'starting'. |
| data-ending-style | Present when transitionStatus is 'ending'. |

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6d626f626f782e506f7075702e50726f7073"></a>

<a id="comboboxpopupprops"></a>

<a id="api-436f6d626f626f782e506f7075702e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Combobox.Popup.Props

Declaration: `packages/solid/build/types/combobox/popup/ComboboxPopup.d.ts:19`

#### Declaration

```typescript
ComboboxPopupProps
```

<a id="api-436f6d626f626f782e506f7075702e50726f70732e696e697469616c466f637573"></a>

<a id="ComboboxPopupProps-initialFocus"></a>

<a id="api-436f6d626f626f782e506f7075702e50726f70732e66696e616c466f637573"></a>

<a id="ComboboxPopupProps-finalFocus"></a>

<a id="api-436f6d626f626f782e506f7075702e50726f70732e636c617373"></a>

<a id="ComboboxPopupProps-class"></a>

<a id="api-436f6d626f626f782e506f7075702e50726f70732e7374796c65"></a>

<a id="ComboboxPopupProps-style"></a>

<a id="api-436f6d626f626f782e506f7075702e50726f70732e72656e646572"></a>

<a id="ComboboxPopupProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| initialFocus | `FocusTarget \| undefined` | No | Unavailable |  |
| finalFocus | `FocusTarget \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<AutocompletePopupState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AutocompletePopupState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, AutocompletePopupState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6d626f626f782e506f7075702e5374617465"></a>

<a id="comboboxpopupstate"></a>

### Related exported type: Combobox.Popup.State

Declaration: `packages/solid/build/types/combobox/popup/ComboboxPopup.d.ts:20`

#### Declaration

```typescript
ComboboxPopupState
```

<a id="api-436f6d626f626f782e506f7075702e53746174652e6f70656e"></a>

<a id="ComboboxPopupState-open"></a>

<a id="api-436f6d626f626f782e506f7075702e53746174652e616e63686f7248696464656e"></a>

<a id="ComboboxPopupState-anchorHidden"></a>

<a id="api-436f6d626f626f782e506f7075702e53746174652e656d707479"></a>

<a id="ComboboxPopupState-empty"></a>

<a id="api-436f6d626f626f782e506f7075702e53746174652e7472616e736974696f6e537461747573"></a>

<a id="ComboboxPopupState-transitionStatus"></a>

<a id="api-436f6d626f626f782e506f7075702e53746174652e616c69676e"></a>

<a id="ComboboxPopupState-align"></a>

<a id="api-436f6d626f626f782e506f7075702e53746174652e73696465"></a>

<a id="ComboboxPopupState-side"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| open | `boolean` | Yes | Unavailable |  |
| anchorHidden | `boolean` | Yes | Unavailable |  |
| empty | `boolean` | Yes | Unavailable |  |
| transitionStatus | `TransitionStatus` | Yes | Unavailable |  |
| align | `Align` | Yes | Unavailable |  |
| side | `Side` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="arrow"></a>

### Arrow

<a id="api-436f6d626f626f782e4172726f77"></a>

<a id="comboboxarrow"></a>

<a id="api-436f6d626f626f782e4172726f772e2470726f70732e70726f703a616c69676e"></a>

### Combobox.Arrow

Declaration: `packages/solid/build/types/combobox/arrow/ComboboxArrow.d.ts:11`

#### Declaration

```typescript
(props: ComboboxArrowProps) => JSX.Element
```

<a id="api-436f6d626f626f782e4172726f772e2470726f70732e636c617373"></a>

<a id="ComboboxArrow-class"></a>

<a id="api-436f6d626f626f782e4172726f772e2470726f70732e7374796c65"></a>

<a id="ComboboxArrow-style"></a>

<a id="api-436f6d626f626f782e4172726f772e2470726f70732e72656e646572"></a>

<a id="ComboboxArrow-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<AutocompleteArrowState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AutocompleteArrowState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, AutocompleteArrowState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-436f6d626f626f784172726f7744617461417474726962757465732e6f70656e"></a>

<a id="api-436f6d626f626f784172726f7744617461417474726962757465732e636c6f736564"></a>

<a id="api-436f6d626f626f784172726f7744617461417474726962757465732e756e63656e7465726564"></a>

<a id="api-436f6d626f626f784172726f7744617461417474726962757465732e616c69676e"></a>

<a id="api-436f6d626f626f784172726f7744617461417474726962757465732e73696465"></a>

| Name | Description |
| --- | --- |
| data-open |  |
| data-closed |  |
| data-uncentered |  |
| data-align |  |
| data-side |  |

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6d626f626f782e4172726f772e50726f7073"></a>

<a id="comboboxarrowprops"></a>

<a id="api-436f6d626f626f782e4172726f772e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Combobox.Arrow.Props

Declaration: `packages/solid/build/types/combobox/arrow/ComboboxArrow.d.ts:13`

#### Declaration

```typescript
ComboboxArrowProps
```

<a id="api-436f6d626f626f782e4172726f772e50726f70732e636c617373"></a>

<a id="ComboboxArrowProps-class"></a>

<a id="api-436f6d626f626f782e4172726f772e50726f70732e7374796c65"></a>

<a id="ComboboxArrowProps-style"></a>

<a id="api-436f6d626f626f782e4172726f772e50726f70732e72656e646572"></a>

<a id="ComboboxArrowProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<AutocompleteArrowState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AutocompleteArrowState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, AutocompleteArrowState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6d626f626f782e4172726f772e5374617465"></a>

<a id="comboboxarrowstate"></a>

### Related exported type: Combobox.Arrow.State

Declaration: `packages/solid/build/types/combobox/arrow/ComboboxArrow.d.ts:14`

#### Declaration

```typescript
ComboboxArrowState
```

<a id="api-436f6d626f626f782e4172726f772e53746174652e6f70656e"></a>

<a id="ComboboxArrowState-open"></a>

<a id="api-436f6d626f626f782e4172726f772e53746174652e756e63656e7465726564"></a>

<a id="ComboboxArrowState-uncentered"></a>

<a id="api-436f6d626f626f782e4172726f772e53746174652e616c69676e"></a>

<a id="ComboboxArrowState-align"></a>

<a id="api-436f6d626f626f782e4172726f772e53746174652e73696465"></a>

<a id="ComboboxArrowState-side"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| open | `boolean` | Yes | Unavailable |  |
| uncentered | `boolean` | Yes | Unavailable |  |
| align | `Align` | Yes | Unavailable |  |
| side | `Side` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="status"></a>

### Status

<a id="api-436f6d626f626f782e537461747573"></a>

<a id="comboboxstatus"></a>

<a id="api-436f6d626f626f782e5374617475732e2470726f70732e70726f703a616c69676e"></a>

### Combobox.Status

Declaration: `packages/solid/build/types/combobox/status/ComboboxStatus.d.ts:6`

#### Declaration

```typescript
(props: ComboboxStatusProps) => JSX.Element
```

<a id="api-436f6d626f626f782e5374617475732e2470726f70732e636c617373"></a>

<a id="ComboboxStatus-class"></a>

<a id="api-436f6d626f626f782e5374617475732e2470726f70732e7374796c65"></a>

<a id="ComboboxStatus-style"></a>

<a id="api-436f6d626f626f782e5374617475732e2470726f70732e72656e646572"></a>

<a id="ComboboxStatus-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<AutocompleteStatusState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AutocompleteStatusState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, AutocompleteStatusState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6d626f626f782e5374617475732e50726f7073"></a>

<a id="comboboxstatusprops"></a>

<a id="api-436f6d626f626f782e5374617475732e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Combobox.Status.Props

Declaration: `packages/solid/build/types/combobox/status/ComboboxStatus.d.ts:8`

#### Declaration

```typescript
ComboboxStatusProps
```

<a id="api-436f6d626f626f782e5374617475732e50726f70732e636c617373"></a>

<a id="ComboboxStatusProps-class"></a>

<a id="api-436f6d626f626f782e5374617475732e50726f70732e7374796c65"></a>

<a id="ComboboxStatusProps-style"></a>

<a id="api-436f6d626f626f782e5374617475732e50726f70732e72656e646572"></a>

<a id="ComboboxStatusProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<AutocompleteStatusState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AutocompleteStatusState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, AutocompleteStatusState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6d626f626f782e5374617475732e5374617465"></a>

<a id="comboboxstatusstate"></a>

### Related exported type: Combobox.Status.State

Declaration: `packages/solid/build/types/combobox/status/ComboboxStatus.d.ts:9`

#### Declaration

```typescript
ComboboxStatusState
```

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="empty"></a>

### Empty

<a id="api-436f6d626f626f782e456d707479"></a>

<a id="comboboxempty"></a>

<a id="api-436f6d626f626f782e456d7074792e2470726f70732e70726f703a616c69676e"></a>

### Combobox.Empty

Declaration: `packages/solid/build/types/combobox/empty/ComboboxEmpty.d.ts:6`

#### Declaration

```typescript
(props: ComboboxEmptyProps) => JSX.Element
```

<a id="api-436f6d626f626f782e456d7074792e2470726f70732e636c617373"></a>

<a id="ComboboxEmpty-class"></a>

<a id="api-436f6d626f626f782e456d7074792e2470726f70732e7374796c65"></a>

<a id="ComboboxEmpty-style"></a>

<a id="api-436f6d626f626f782e456d7074792e2470726f70732e72656e646572"></a>

<a id="ComboboxEmpty-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<AutocompleteEmptyState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AutocompleteEmptyState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, AutocompleteEmptyState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6d626f626f782e456d7074792e50726f7073"></a>

<a id="comboboxemptyprops"></a>

<a id="api-436f6d626f626f782e456d7074792e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Combobox.Empty.Props

Declaration: `packages/solid/build/types/combobox/empty/ComboboxEmpty.d.ts:8`

#### Declaration

```typescript
ComboboxEmptyProps
```

<a id="api-436f6d626f626f782e456d7074792e50726f70732e636c617373"></a>

<a id="ComboboxEmptyProps-class"></a>

<a id="api-436f6d626f626f782e456d7074792e50726f70732e7374796c65"></a>

<a id="ComboboxEmptyProps-style"></a>

<a id="api-436f6d626f626f782e456d7074792e50726f70732e72656e646572"></a>

<a id="ComboboxEmptyProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<AutocompleteEmptyState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AutocompleteEmptyState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, AutocompleteEmptyState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6d626f626f782e456d7074792e5374617465"></a>

<a id="comboboxemptystate"></a>

### Related exported type: Combobox.Empty.State

Declaration: `packages/solid/build/types/combobox/empty/ComboboxEmpty.d.ts:9`

#### Declaration

```typescript
ComboboxEmptyState
```

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="collection"></a>

### Collection

<a id="api-436f6d626f626f782e436f6c6c656374696f6e"></a>

<a id="comboboxcollection"></a>

### Combobox.Collection

Declaration: `packages/solid/build/types/combobox/collection/ComboboxCollection.d.ts:7`

#### Declaration

```typescript
(props: ComboboxCollectionProps) => JSX.Element
```

<a id="api-436f6d626f626f782e436f6c6c656374696f6e2e2470726f70732e6368696c6472656e"></a>

<a id="ComboboxCollection-children"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| children | `(item: any, index: number) => JSX.Element` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6d626f626f782e436f6c6c656374696f6e2e50726f7073"></a>

<a id="comboboxcollectionprops"></a>

### Related exported type: Combobox.Collection.Props

Declaration: `packages/solid/build/types/combobox/collection/ComboboxCollection.d.ts:9`

#### Declaration

```typescript
ComboboxCollectionProps
```

<a id="api-436f6d626f626f782e436f6c6c656374696f6e2e50726f70732e6368696c6472656e"></a>

<a id="ComboboxCollectionProps-children"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| children | `(item: any, index: number) => JSX.Element` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6d626f626f782e436f6c6c656374696f6e2e5374617465"></a>

<a id="comboboxcollectionstate"></a>

### Related exported type: Combobox.Collection.State

Declaration: `packages/solid/build/types/combobox/collection/ComboboxCollection.d.ts:10`

#### Declaration

```typescript
ComboboxCollectionState
```

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="row"></a>

### Row

<a id="api-436f6d626f626f782e526f77"></a>

<a id="comboboxrow"></a>

<a id="api-436f6d626f626f782e526f772e2470726f70732e70726f703a616c69676e"></a>

### Combobox.Row

Declaration: `packages/solid/build/types/combobox/row/ComboboxRow.d.ts:6`

#### Declaration

```typescript
(props: ComboboxRowProps) => JSX.Element
```

<a id="api-436f6d626f626f782e526f772e2470726f70732e636c617373"></a>

<a id="ComboboxRow-class"></a>

<a id="api-436f6d626f626f782e526f772e2470726f70732e7374796c65"></a>

<a id="ComboboxRow-style"></a>

<a id="api-436f6d626f626f782e526f772e2470726f70732e72656e646572"></a>

<a id="ComboboxRow-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<AutocompleteRowState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AutocompleteRowState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, AutocompleteRowState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6d626f626f782e526f772e50726f7073"></a>

<a id="comboboxrowprops"></a>

<a id="api-436f6d626f626f782e526f772e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Combobox.Row.Props

Declaration: `packages/solid/build/types/combobox/row/ComboboxRow.d.ts:8`

#### Declaration

```typescript
ComboboxRowProps
```

<a id="api-436f6d626f626f782e526f772e50726f70732e636c617373"></a>

<a id="ComboboxRowProps-class"></a>

<a id="api-436f6d626f626f782e526f772e50726f70732e7374796c65"></a>

<a id="ComboboxRowProps-style"></a>

<a id="api-436f6d626f626f782e526f772e50726f70732e72656e646572"></a>

<a id="ComboboxRowProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<AutocompleteRowState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AutocompleteRowState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, AutocompleteRowState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6d626f626f782e526f772e5374617465"></a>

<a id="comboboxrowstate"></a>

### Related exported type: Combobox.Row.State

Declaration: `packages/solid/build/types/combobox/row/ComboboxRow.d.ts:9`

#### Declaration

```typescript
ComboboxRowState
```

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="item"></a>

### Item

<a id="api-436f6d626f626f782e4974656d"></a>

<a id="comboboxitem"></a>

<a id="api-436f6d626f626f782e4974656d2e2470726f70732e70726f703a616c69676e"></a>

### Combobox.Item

Declaration: `packages/solid/build/types/combobox/item/ComboboxItem.d.ts:13`

#### Declaration

```typescript
(props: ComboboxItemProps) => JSX.Element
```

<a id="api-436f6d626f626f782e4974656d2e2470726f70732e76616c7565"></a>

<a id="ComboboxItem-value"></a>

<a id="api-436f6d626f626f782e4974656d2e2470726f70732e696e646578"></a>

<a id="ComboboxItem-index"></a>

<a id="api-436f6d626f626f782e4974656d2e2470726f70732e6e6174697665427574746f6e"></a>

<a id="ComboboxItem-nativeButton"></a>

<a id="api-436f6d626f626f782e4974656d2e2470726f70732e64697361626c6564"></a>

<a id="ComboboxItem-disabled"></a>

<a id="api-436f6d626f626f782e4974656d2e2470726f70732e636c617373"></a>

<a id="ComboboxItem-class"></a>

<a id="api-436f6d626f626f782e4974656d2e2470726f70732e7374796c65"></a>

<a id="ComboboxItem-style"></a>

<a id="api-436f6d626f626f782e4974656d2e2470726f70732e72656e646572"></a>

<a id="ComboboxItem-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| value | `any` | No | null |  |
| index | `number \| undefined` | No | Unavailable |  |
| nativeButton | `boolean \| undefined` | No | false |  |
| disabled | `boolean \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<ComboboxItemState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ComboboxItemState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ComboboxItemState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-436f6d626f626f784974656d44617461417474726962757465732e73656c6563746564"></a>

<a id="api-436f6d626f626f784974656d44617461417474726962757465732e686967686c696768746564"></a>

<a id="api-436f6d626f626f784974656d44617461417474726962757465732e64697361626c6564"></a>

| Name | Description |
| --- | --- |
| data-selected |  |
| data-highlighted |  |
| data-disabled |  |

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6d626f626f782e4974656d2e50726f7073"></a>

<a id="comboboxitemprops"></a>

<a id="api-436f6d626f626f782e4974656d2e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Combobox.Item.Props

Declaration: `packages/solid/build/types/combobox/item/ComboboxItem.d.ts:15`

#### Declaration

```typescript
ComboboxItemProps
```

<a id="api-436f6d626f626f782e4974656d2e50726f70732e76616c7565"></a>

<a id="ComboboxItemProps-value"></a>

<a id="api-436f6d626f626f782e4974656d2e50726f70732e696e646578"></a>

<a id="ComboboxItemProps-index"></a>

<a id="api-436f6d626f626f782e4974656d2e50726f70732e6e6174697665427574746f6e"></a>

<a id="ComboboxItemProps-nativeButton"></a>

<a id="api-436f6d626f626f782e4974656d2e50726f70732e64697361626c6564"></a>

<a id="ComboboxItemProps-disabled"></a>

<a id="api-436f6d626f626f782e4974656d2e50726f70732e636c617373"></a>

<a id="ComboboxItemProps-class"></a>

<a id="api-436f6d626f626f782e4974656d2e50726f70732e7374796c65"></a>

<a id="ComboboxItemProps-style"></a>

<a id="api-436f6d626f626f782e4974656d2e50726f70732e72656e646572"></a>

<a id="ComboboxItemProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| value | `any` | No | Unavailable |  |
| index | `number \| undefined` | No | Unavailable |  |
| nativeButton | `boolean \| undefined` | No | Unavailable |  |
| disabled | `boolean \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<ComboboxItemState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ComboboxItemState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ComboboxItemState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6d626f626f782e4974656d2e5374617465"></a>

<a id="comboboxitemstate"></a>

### Related exported type: Combobox.Item.State

Declaration: `packages/solid/build/types/combobox/item/ComboboxItem.d.ts:16`

#### Declaration

```typescript
ComboboxItemState
```

<a id="api-436f6d626f626f782e4974656d2e53746174652e686967686c696768746564"></a>

<a id="ComboboxItemState-highlighted"></a>

<a id="api-436f6d626f626f782e4974656d2e53746174652e73656c6563746564"></a>

<a id="ComboboxItemState-selected"></a>

<a id="api-436f6d626f626f782e4974656d2e53746174652e64697361626c6564"></a>

<a id="ComboboxItemState-disabled"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| highlighted | `boolean` | Yes | Unavailable |  |
| selected | `boolean` | Yes | Unavailable |  |
| disabled | `boolean` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="itemindicator"></a>

### ItemIndicator

<a id="api-436f6d626f626f782e4974656d496e64696361746f72"></a>

<a id="comboboxitemindicator"></a>

### Combobox.ItemIndicator

Declaration: `packages/solid/build/types/combobox/item-indicator/ComboboxItemIndicator.d.ts:10`

#### Declaration

```typescript
(props: ComboboxItemIndicatorProps) => JSX.Element
```

<a id="api-436f6d626f626f782e4974656d496e64696361746f722e2470726f70732e636c617373"></a>

<a id="ComboboxItemIndicator-class"></a>

<a id="api-436f6d626f626f782e4974656d496e64696361746f722e2470726f70732e7374796c65"></a>

<a id="ComboboxItemIndicator-style"></a>

<a id="api-436f6d626f626f782e4974656d496e64696361746f722e2470726f70732e6b6565704d6f756e746564"></a>

<a id="ComboboxItemIndicator-keepMounted"></a>

<a id="api-436f6d626f626f782e4974656d496e64696361746f722e2470726f70732e72656e646572"></a>

<a id="ComboboxItemIndicator-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<ComboboxItemIndicatorState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ComboboxItemIndicatorState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| keepMounted | `boolean \| undefined` | No | Unavailable |  |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ComboboxItemIndicatorState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-436f6d626f626f784974656d496e64696361746f7244617461417474726962757465732e7374617274696e675374796c65"></a>

<a id="api-436f6d626f626f784974656d496e64696361746f7244617461417474726962757465732e656e64696e675374796c65"></a>

| Name | Description |
| --- | --- |
| data-starting-style |  |
| data-ending-style |  |

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6d626f626f782e4974656d496e64696361746f722e50726f7073"></a>

<a id="comboboxitemindicatorprops"></a>

### Related exported type: Combobox.ItemIndicator.Props

Declaration: `packages/solid/build/types/combobox/item-indicator/ComboboxItemIndicator.d.ts:12`

#### Declaration

```typescript
ComboboxItemIndicatorProps
```

<a id="api-436f6d626f626f782e4974656d496e64696361746f722e50726f70732e636c617373"></a>

<a id="ComboboxItemIndicatorProps-class"></a>

<a id="api-436f6d626f626f782e4974656d496e64696361746f722e50726f70732e7374796c65"></a>

<a id="ComboboxItemIndicatorProps-style"></a>

<a id="api-436f6d626f626f782e4974656d496e64696361746f722e50726f70732e6b6565704d6f756e746564"></a>

<a id="ComboboxItemIndicatorProps-keepMounted"></a>

<a id="api-436f6d626f626f782e4974656d496e64696361746f722e50726f70732e72656e646572"></a>

<a id="ComboboxItemIndicatorProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<ComboboxItemIndicatorState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ComboboxItemIndicatorState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| keepMounted | `boolean \| undefined` | No | Unavailable |  |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ComboboxItemIndicatorState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6d626f626f782e4974656d496e64696361746f722e5374617465"></a>

<a id="comboboxitemindicatorstate"></a>

### Related exported type: Combobox.ItemIndicator.State

Declaration: `packages/solid/build/types/combobox/item-indicator/ComboboxItemIndicator.d.ts:13`

#### Declaration

```typescript
ComboboxItemIndicatorState
```

<a id="api-436f6d626f626f782e4974656d496e64696361746f722e53746174652e73656c6563746564"></a>

<a id="ComboboxItemIndicatorState-selected"></a>

<a id="api-436f6d626f626f782e4974656d496e64696361746f722e53746174652e7472616e736974696f6e537461747573"></a>

<a id="ComboboxItemIndicatorState-transitionStatus"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| selected | `boolean` | Yes | Unavailable |  |
| transitionStatus | `TransitionStatus` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="group"></a>

### Group

<a id="api-436f6d626f626f782e47726f7570"></a>

<a id="comboboxgroup"></a>

<a id="api-436f6d626f626f782e47726f75702e2470726f70732e70726f703a616c69676e"></a>

### Combobox.Group

Declaration: `packages/solid/build/types/combobox/group/ComboboxGroup.d.ts:7`

#### Declaration

```typescript
(props: ComboboxGroupProps) => JSX.Element
```

<a id="api-436f6d626f626f782e47726f75702e2470726f70732e6974656d73"></a>

<a id="ComboboxGroup-items"></a>

<a id="api-436f6d626f626f782e47726f75702e2470726f70732e636c617373"></a>

<a id="ComboboxGroup-class"></a>

<a id="api-436f6d626f626f782e47726f75702e2470726f70732e7374796c65"></a>

<a id="ComboboxGroup-style"></a>

<a id="api-436f6d626f626f782e47726f75702e2470726f70732e72656e646572"></a>

<a id="ComboboxGroup-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| items | `readonly any[] \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<AutocompleteGroupState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AutocompleteGroupState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, AutocompleteGroupState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6d626f626f782e47726f75702e50726f7073"></a>

<a id="comboboxgroupprops"></a>

<a id="api-436f6d626f626f782e47726f75702e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Combobox.Group.Props

Declaration: `packages/solid/build/types/combobox/group/ComboboxGroup.d.ts:9`

#### Declaration

```typescript
ComboboxGroupProps
```

<a id="api-436f6d626f626f782e47726f75702e50726f70732e6974656d73"></a>

<a id="ComboboxGroupProps-items"></a>

<a id="api-436f6d626f626f782e47726f75702e50726f70732e636c617373"></a>

<a id="ComboboxGroupProps-class"></a>

<a id="api-436f6d626f626f782e47726f75702e50726f70732e7374796c65"></a>

<a id="ComboboxGroupProps-style"></a>

<a id="api-436f6d626f626f782e47726f75702e50726f70732e72656e646572"></a>

<a id="ComboboxGroupProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| items | `readonly any[] \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<AutocompleteGroupState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AutocompleteGroupState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, AutocompleteGroupState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6d626f626f782e47726f75702e5374617465"></a>

<a id="comboboxgroupstate"></a>

### Related exported type: Combobox.Group.State

Declaration: `packages/solid/build/types/combobox/group/ComboboxGroup.d.ts:10`

#### Declaration

```typescript
ComboboxGroupState
```

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="grouplabel"></a>

### GroupLabel

<a id="api-436f6d626f626f782e47726f75704c6162656c"></a>

<a id="comboboxgrouplabel"></a>

<a id="api-436f6d626f626f782e47726f75704c6162656c2e2470726f70732e70726f703a616c69676e"></a>

### Combobox.GroupLabel

Declaration: `packages/solid/build/types/combobox/group-label/ComboboxGroupLabel.d.ts:6`

#### Declaration

```typescript
(props: ComboboxGroupLabelProps) => JSX.Element
```

<a id="api-436f6d626f626f782e47726f75704c6162656c2e2470726f70732e636c617373"></a>

<a id="ComboboxGroupLabel-class"></a>

<a id="api-436f6d626f626f782e47726f75704c6162656c2e2470726f70732e7374796c65"></a>

<a id="ComboboxGroupLabel-style"></a>

<a id="api-436f6d626f626f782e47726f75704c6162656c2e2470726f70732e72656e646572"></a>

<a id="ComboboxGroupLabel-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<AutocompleteGroupLabelState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AutocompleteGroupLabelState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, AutocompleteGroupLabelState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6d626f626f782e47726f75704c6162656c2e50726f7073"></a>

<a id="comboboxgrouplabelprops"></a>

<a id="api-436f6d626f626f782e47726f75704c6162656c2e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Combobox.GroupLabel.Props

Declaration: `packages/solid/build/types/combobox/group-label/ComboboxGroupLabel.d.ts:8`

#### Declaration

```typescript
ComboboxGroupLabelProps
```

<a id="api-436f6d626f626f782e47726f75704c6162656c2e50726f70732e636c617373"></a>

<a id="ComboboxGroupLabelProps-class"></a>

<a id="api-436f6d626f626f782e47726f75704c6162656c2e50726f70732e7374796c65"></a>

<a id="ComboboxGroupLabelProps-style"></a>

<a id="api-436f6d626f626f782e47726f75704c6162656c2e50726f70732e72656e646572"></a>

<a id="ComboboxGroupLabelProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<AutocompleteGroupLabelState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AutocompleteGroupLabelState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, AutocompleteGroupLabelState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6d626f626f782e47726f75704c6162656c2e5374617465"></a>

<a id="comboboxgrouplabelstate"></a>

### Related exported type: Combobox.GroupLabel.State

Declaration: `packages/solid/build/types/combobox/group-label/ComboboxGroupLabel.d.ts:9`

#### Declaration

```typescript
ComboboxGroupLabelState
```

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="separator"></a>

### Separator

<a id="api-436f6d626f626f782e536570617261746f72"></a>

<a id="comboboxseparator"></a>

<a id="api-436f6d626f626f782e536570617261746f722e2470726f70732e70726f703a616c69676e"></a>

### Combobox.Separator

Declaration: `packages/solid/build/types/combobox/separator/ComboboxSeparator.d.ts:9`

#### Declaration

```typescript
(props: ListboxSeparatorProps) => JSX.Element
```

<a id="api-436f6d626f626f782e536570617261746f722e2470726f70732e6f7269656e746174696f6e"></a>

<a id="ComboboxSeparator-orientation"></a>

<a id="api-436f6d626f626f782e536570617261746f722e2470726f70732e636c617373"></a>

<a id="ComboboxSeparator-class"></a>

<a id="api-436f6d626f626f782e536570617261746f722e2470726f70732e7374796c65"></a>

<a id="ComboboxSeparator-style"></a>

<a id="api-436f6d626f626f782e536570617261746f722e2470726f70732e72656e646572"></a>

<a id="ComboboxSeparator-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| orientation | `Orientation \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<SelectSeparatorState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<SelectSeparatorState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<JSX.HTMLAttributes<HTMLDivElement>, SelectSeparatorState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-436f6d626f626f78536570617261746f7244617461417474726962757465732e6f7269656e746174696f6e"></a>

| Name | Description |
| --- | --- |
| data-orientation | Indicates the orientation of the separator. |

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6d626f626f782e536570617261746f722e50726f7073"></a>

<a id="comboboxseparatorprops"></a>

<a id="api-436f6d626f626f782e536570617261746f722e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Combobox.Separator.Props

Declaration: `packages/solid/build/types/combobox/separator/ComboboxSeparator.d.ts:11`

#### Declaration

```typescript
ComboboxSeparatorProps
```

<a id="api-436f6d626f626f782e536570617261746f722e50726f70732e6f7269656e746174696f6e"></a>

<a id="ComboboxSeparatorProps-orientation"></a>

<a id="api-436f6d626f626f782e536570617261746f722e50726f70732e636c617373"></a>

<a id="ComboboxSeparatorProps-class"></a>

<a id="api-436f6d626f626f782e536570617261746f722e50726f70732e7374796c65"></a>

<a id="ComboboxSeparatorProps-style"></a>

<a id="api-436f6d626f626f782e536570617261746f722e50726f70732e72656e646572"></a>

<a id="ComboboxSeparatorProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| orientation | `"horizontal" \| "vertical" \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<ComboboxSeparatorState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ComboboxSeparatorState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ComboboxSeparatorState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6d626f626f782e536570617261746f722e5374617465"></a>

<a id="comboboxseparatorstate"></a>

### Related exported type: Combobox.Separator.State

Declaration: `packages/solid/build/types/combobox/separator/ComboboxSeparator.d.ts:12`

#### Declaration

```typescript
ComboboxSeparatorState
```

<a id="api-436f6d626f626f782e536570617261746f722e53746174652e6f7269656e746174696f6e"></a>

<a id="ComboboxSeparatorState-orientation"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| orientation | `"horizontal" \| "vertical"` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="usefilter"></a>

## useFilter

Matches items against a query using `Intl.Collator` for robust string matching.
This utility is used when externally filtering items.
Pass the result to the `filter` prop of `<Combobox.Root>`.

<a id="api-436f6d626f626f782e75736546696c746572"></a>

<a id="comboboxusefilter"></a>

### Combobox.useFilter

Declaration: `packages/solid/build/types/combobox/root/utils/useFilter.d.ts:9`

#### Declaration

```typescript
(options?: UseComboboxFilterOptions) => Filter
```

<a id="api-436f6d626f626f782e75736546696c7465722e24706172616d65746572732e6f7074696f6e73"></a>

<a id="ComboboxuseFilter-options"></a>

#### Parameters

| Parameter | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| options | `UseComboboxFilterOptions \| undefined` | No | {} |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

#### Return value

```typescript
Filter
```

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| contains | `<Item>(item: Item, query: string, itemToString?: (item: Item) => string) => boolean` | Yes | Unavailable | Returns whether the item matches the query anywhere. |
| startsWith | `<Item>(item: Item, query: string, itemToString?: (item: Item) => string) => boolean` | Yes | Unavailable | Returns whether the item starts with the query. |
| endsWith | `<Item>(item: Item, query: string, itemToString?: (item: Item) => string) => boolean` | Yes | Unavailable | Returns whether the item ends with the query. |

<a id="usefiltereditems"></a>

## useFilteredItems

Returns the internally filtered items when called inside `<Combobox.Root>`.

<a id="api-436f6d626f626f782e75736546696c74657265644974656d73"></a>

<a id="comboboxusefiltereditems"></a>

### Combobox.useFilteredItems

Declaration: `packages/solid/build/types/combobox/root/utils/useFilteredItems.d.ts:2`

#### Declaration

```typescript
<T>() => () => readonly T[]
```

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

#### Return value

```typescript
() => readonly T[]
```

<a id="createitems"></a>

## createItems

Normalizes items into a collection for the `items` prop of `<Combobox.Root>`, deriving each item's selection value and label before rendering.

<a id="api-436f6d626f626f782e6372656174654974656d73"></a>

<a id="comboboxcreateitems"></a>

### Combobox.createItems

Declaration: `packages/solid/build/types/combobox/items/createItems.d.ts:19`

#### Declaration

```typescript
<Item, Value extends ComboboxPrimitiveValue>(data: (ComboboxItemsData<Item> & RejectGroupShapedItems<Item>) | undefined, options: CreateComboboxItemsOptions<Item, Value>) => ComboboxItemCollection<Item, Value>
```

<a id="api-436f6d626f626f782e6372656174654974656d732e24706172616d65746572732e64617461"></a>

<a id="ComboboxcreateItems-data"></a>

<a id="api-436f6d626f626f782e6372656174654974656d732e24706172616d65746572732e6f7074696f6e73"></a>

<a id="ComboboxcreateItems-options"></a>

#### Parameters

| Parameter | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| data | `(ComboboxItemsData<Item> & RejectGroupShapedItems<Item>) \| undefined` | Yes | Unavailable |  |
| options | `CreateComboboxItemsOptions<Item, Value>` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

#### Return value

```typescript
ComboboxItemCollection<Item, Value>
```

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| __itemCollectionBrand | `any` | Yes | Unavailable |  |

