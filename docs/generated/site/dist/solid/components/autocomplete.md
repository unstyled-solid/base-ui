<a id="autocomplete"></a>

# Autocomplete

An input that suggests options as you type.

[Open mounted Solid demo: autocomplete/hero](/solid/components/autocomplete)

<a id="usage-guidelines"></a>

## Usage guidelines

- **Avoid when selection state is needed**: Use [Combobox](/solid/components/combobox) instead of Autocomplete if the selection should be remembered and the input value cannot be custom. Unlike Combobox, Autocomplete's input can contain free-form text, as its suggestions only *optionally* autocomplete the text.
- **Can be used for filterable command pickers**: The input can be used as a filter for command items that perform an action when clicked when rendered inside the popup.
- **Form controls must have an accessible name**: It can be created using a `<label>` element or the `Field` component. See the [forms guide](/solid/handbook/forms).
- **Closing animations**: The popup stays rendered until its closing animation finishes. See [JavaScript animations](/solid/handbook/animation#javascript-animations) for animating it with Motion and for manual control.

<a id="anatomy"></a>

## Anatomy

Import the components and place them together:

```tsx
import { Autocomplete } from '@unstyled-solid/base-ui/autocomplete';
<Autocomplete.Root>
  <Autocomplete.InputGroup>
    <Autocomplete.Input />
    <Autocomplete.Trigger />
    <Autocomplete.Icon />
    <Autocomplete.Clear />
    <Autocomplete.Value />
  </Autocomplete.InputGroup>

  <Autocomplete.Portal>
    <Autocomplete.Backdrop />
    <Autocomplete.Positioner>
      <Autocomplete.Popup>
        <Autocomplete.Arrow />

        <Autocomplete.Status />
        <Autocomplete.Empty />

        <Autocomplete.List>
          <Autocomplete.Row>
            <Autocomplete.Item />
          </Autocomplete.Row>

          <Autocomplete.Separator />

          <Autocomplete.Group>
            <Autocomplete.GroupLabel />
          </Autocomplete.Group>

          <Autocomplete.Collection />
        </Autocomplete.List>
      </Autocomplete.Popup>
    </Autocomplete.Positioner>
  </Autocomplete.Portal>
</Autocomplete.Root>;
```

<a id="item-values"></a>

## Item values

Each `<Autocomplete.Item>` takes a `value` prop identifying it. Pass the item being rendered, so that props like `itemToStringValue` receive it.

<a id="examples"></a>

## Examples

<a id="async-search"></a>

### Async search

Load items asynchronously while typing and render custom status content.

[Open mounted Solid demo: autocomplete/async](/solid/components/autocomplete)

<a id="inline-autocomplete"></a>

### Inline autocomplete

Autofill the input with the highlighted item while navigating with arrow keys using the `mode` prop. Accepts `aria-autocomplete` values `list`, `both`, `inline`, or `none`.

[Open mounted Solid demo: autocomplete/inline](/solid/components/autocomplete)

<a id="grouped"></a>

### Grouped

Organize related options with `<Autocomplete.Group>` and `<Autocomplete.GroupLabel>` to add section headings inside the popup.

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

[Open mounted Solid demo: autocomplete/grouped](/solid/components/autocomplete)

<a id="fuzzy-matching"></a>

### Fuzzy matching

Use fuzzy matching to find relevant results even when the query doesn't exactly match the item text.

[Open mounted Solid demo: autocomplete/fuzzy-matching](/solid/components/autocomplete)

<a id="limit-results"></a>

### Limit results

Limit the number of visible items using the `limit` prop and guide users to refine their query using `<Autocomplete.Status>`.

[Open mounted Solid demo: autocomplete/limit](/solid/components/autocomplete)

<a id="auto-highlight"></a>

### Auto highlight

The first matching item can be automatically highlighted as the user types by specifying the `autoHighlight` prop on `<Autocomplete.Root>`. Set the prop's value to `"always"` if the highlight should always be present, such as when the list is rendered inline within a dialog.

The prop can be combined with the `keepHighlight` and `highlightItemOnHover` props to configure how the highlight behaves during mouse interactions.

[Open mounted Solid demo: autocomplete/auto-highlight](/solid/components/autocomplete)

<a id="command-palette"></a>

### Command palette

Use the autocomplete input to filter a list of command items that perform an action when clicked.

[Open mounted Solid demo: autocomplete/command-palette](/solid/components/autocomplete)

<a id="custom-keyboard-shortcuts"></a>

### Custom keyboard shortcuts

Use `actionsRef.highlightItem()` to navigate the open list with custom keyboard shortcuts. This example binds <kbd>Ctrl</kbd>+<kbd>N</kbd> to the next item and <kbd>Ctrl</kbd>+<kbd>P</kbd> to the previous item.

[Open mounted Solid demo: autocomplete/keyboard-shortcuts](/solid/components/autocomplete)

Navigation wraps between the first and last items unless `loopFocus` is disabled. Unlike arrow-key navigation, these shortcuts do not return the highlight to the input.

<a id="grid-layout"></a>

### Grid layout

Display items in a grid layout, wrapping each row in `<Autocomplete.Row>` components.

[Open mounted Solid demo: autocomplete/grid](/solid/components/autocomplete)

<a id="virtualized"></a>

### Virtualized

Efficiently handle large datasets using a virtualization library like `@tanstack/solid-virtual`.

[Open mounted Solid demo: autocomplete/virtualized](/solid/components/autocomplete)

When using `highlightItem()`, scroll your virtualizer to the index reported by `onItemHighlighted` for the `'imperative-action'` reason. The highlighted item may not be rendered yet.

<a id="memoizing-items"></a>

#### Solid item components

Solid components execute once per mount. Read item properties through props inside JSX so updates remain reactive. For large datasets, virtualization reduces the number of mounted items; a wrapper component does not reduce initial mount cost.

```tsx
interface Suggestion {
  id: string;
  label: string;
  description: string;
}
const SuggestionItem = function SuggestionItem(props: { item: Suggestion }) {
  return (
    <Autocomplete.Item value={props.item}>
      <span>{props.item.label}</span>
      <span>{props.item.description}</span>
    </Autocomplete.Item>
  );
};
<Autocomplete.List>
  {(item: Suggestion) => <SuggestionItem item={item} />}
</Autocomplete.List>;
```

<a id="api-reference"></a>

## API reference

<a id="root"></a>

### Root

<a id="api-4175746f636f6d706c6574652e526f6f74"></a>

<a id="autocompleteroot"></a>

### Autocomplete.Root

Groups the autocomplete parts without rendering an element.

Declaration: `packages/solid/build/types/autocomplete/root/AutocompleteRoot.d.ts:6`

#### Declaration

```typescript
{ <Items extends readonly { items: readonly any[]; }[]>(props: Omit<AutocompleteRootProps<Items[number]["items"][number]>, "items"> & { items: Items; }): JSX.Element; <ItemValue>(props: Omit<AutocompleteRootProps<ItemValue>, "items"> & { items?: readonly ItemValue[]; }): JSX.Element; }
```

<a id="api-4175746f636f6d706c6574652e526f6f742e2470726f70732e6e616d65"></a>

<a id="AutocompleteRoot-name"></a>

<a id="api-4175746f636f6d706c6574652e526f6f742e2470726f70732e64656661756c7456616c7565"></a>

<a id="AutocompleteRoot-defaultValue"></a>

<a id="api-4175746f636f6d706c6574652e526f6f742e2470726f70732e76616c7565"></a>

<a id="AutocompleteRoot-value"></a>

<a id="api-4175746f636f6d706c6574652e526f6f742e2470726f70732e6f6e56616c75654368616e6765"></a>

<a id="AutocompleteRoot-onValueChange"></a>

<a id="api-4175746f636f6d706c6574652e526f6f742e2470726f70732e64656661756c744f70656e"></a>

<a id="AutocompleteRoot-defaultOpen"></a>

<a id="api-4175746f636f6d706c6574652e526f6f742e2470726f70732e6f70656e"></a>

<a id="AutocompleteRoot-open"></a>

<a id="api-4175746f636f6d706c6574652e526f6f742e2470726f70732e6f6e4f70656e4368616e6765"></a>

<a id="AutocompleteRoot-onOpenChange"></a>

<a id="api-4175746f636f6d706c6574652e526f6f742e2470726f70732e6175746f486967686c69676874"></a>

<a id="AutocompleteRoot-autoHighlight"></a>

<a id="api-4175746f636f6d706c6574652e526f6f742e2470726f70732e6b656570486967686c69676874"></a>

<a id="AutocompleteRoot-keepHighlight"></a>

<a id="api-4175746f636f6d706c6574652e526f6f742e2470726f70732e686967686c696768744974656d4f6e486f766572"></a>

<a id="AutocompleteRoot-highlightItemOnHover"></a>

<a id="api-4175746f636f6d706c6574652e526f6f742e2470726f70732e616374696f6e73526566"></a>

<a id="AutocompleteRoot-actionsRef"></a>

<a id="api-4175746f636f6d706c6574652e526f6f742e2470726f70732e66696c746572"></a>

<a id="AutocompleteRoot-filter"></a>

<a id="api-4175746f636f6d706c6574652e526f6f742e2470726f70732e66696c74657265644974656d73"></a>

<a id="AutocompleteRoot-filteredItems"></a>

<a id="api-4175746f636f6d706c6574652e526f6f742e2470726f70732e666f726d"></a>

<a id="AutocompleteRoot-form"></a>

<a id="api-4175746f636f6d706c6574652e526f6f742e2470726f70732e67726964"></a>

<a id="AutocompleteRoot-grid"></a>

<a id="api-4175746f636f6d706c6574652e526f6f742e2470726f70732e696e6c696e65"></a>

<a id="AutocompleteRoot-inline"></a>

<a id="api-4175746f636f6d706c6574652e526f6f742e2470726f70732e6974656d546f537472696e6756616c7565"></a>

<a id="AutocompleteRoot-itemToStringValue"></a>

<a id="api-4175746f636f6d706c6574652e526f6f742e2470726f70732e6974656d73"></a>

<a id="AutocompleteRoot-items"></a>

<a id="api-4175746f636f6d706c6574652e526f6f742e2470726f70732e6c696d6974"></a>

<a id="AutocompleteRoot-limit"></a>

<a id="api-4175746f636f6d706c6574652e526f6f742e2470726f70732e6c6f63616c65"></a>

<a id="AutocompleteRoot-locale"></a>

<a id="api-4175746f636f6d706c6574652e526f6f742e2470726f70732e6c6f6f70466f637573"></a>

<a id="AutocompleteRoot-loopFocus"></a>

<a id="api-4175746f636f6d706c6574652e526f6f742e2470726f70732e6d6f64616c"></a>

<a id="AutocompleteRoot-modal"></a>

<a id="api-4175746f636f6d706c6574652e526f6f742e2470726f70732e6d6f6465"></a>

<a id="AutocompleteRoot-mode"></a>

<a id="api-4175746f636f6d706c6574652e526f6f742e2470726f70732e6f6e4974656d486967686c696768746564"></a>

<a id="AutocompleteRoot-onItemHighlighted"></a>

<a id="api-4175746f636f6d706c6574652e526f6f742e2470726f70732e6f6e4f70656e4368616e6765436f6d706c657465"></a>

<a id="AutocompleteRoot-onOpenChangeComplete"></a>

<a id="api-4175746f636f6d706c6574652e526f6f742e2470726f70732e6f70656e4f6e496e707574436c69636b"></a>

<a id="AutocompleteRoot-openOnInputClick"></a>

<a id="api-4175746f636f6d706c6574652e526f6f742e2470726f70732e7375626d69744f6e4974656d436c69636b"></a>

<a id="AutocompleteRoot-submitOnItemClick"></a>

<a id="api-4175746f636f6d706c6574652e526f6f742e2470726f70732e7669727475616c697a6564"></a>

<a id="AutocompleteRoot-virtualized"></a>

<a id="api-4175746f636f6d706c6574652e526f6f742e2470726f70732e64697361626c6564"></a>

<a id="AutocompleteRoot-disabled"></a>

<a id="api-4175746f636f6d706c6574652e526f6f742e2470726f70732e726561644f6e6c79"></a>

<a id="AutocompleteRoot-readOnly"></a>

<a id="api-4175746f636f6d706c6574652e526f6f742e2470726f70732e7265717569726564"></a>

<a id="AutocompleteRoot-required"></a>

<a id="api-4175746f636f6d706c6574652e526f6f742e2470726f70732e696e707574526566"></a>

<a id="AutocompleteRoot-inputRef"></a>

<a id="api-4175746f636f6d706c6574652e526f6f742e2470726f70732e6964"></a>

<a id="AutocompleteRoot-id"></a>

<a id="api-4175746f636f6d706c6574652e526f6f742e2470726f70732e6368696c6472656e"></a>

<a id="AutocompleteRoot-children"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| name | `string \| undefined` | No | Unavailable |  |
| defaultValue | `AriaComboboxInputValue \| undefined` | No | '' | The initial, uncontrolled input text. |
| value | `AriaComboboxInputValue \| undefined` | No | '' | Controlled input text, not a selected item. |
| onValueChange | `((value: string, details: AutocompleteRootChangeEventDetails) => void) \| undefined` | No | Unavailable |  |
| defaultOpen | `boolean \| undefined` | No | Unavailable |  |
| open | `boolean \| undefined` | No | Unavailable |  |
| onOpenChange | `((open: boolean, details: AutocompleteRootOpenChangeEventDetails) => void) \| undefined` | No | Unavailable |  |
| autoHighlight | `boolean \| "always" \| undefined` | No | Unavailable |  |
| keepHighlight | `boolean \| undefined` | No | Unavailable |  |
| highlightItemOnHover | `boolean \| undefined` | No | Unavailable |  |
| actionsRef | `{ current: AriaCombobox.Actions \| null; } \| ((actions: AriaCombobox.Actions \| null) => void) \| undefined` | No | Unavailable |  |
| filter | `((item: Items[number]["items"][number], query: string, itemToString?: ((item: Items[number]["items"][number]) => string) \| undefined) => boolean) \| null \| undefined` | No | Unavailable |  |
| filteredItems | `readonly Items[number]["items"][number][] \| readonly Group<Items[number]["items"][number]>[] \| undefined` | No | Unavailable | Externally filtered items, retaining the structure of `items`. |
| form | `string \| undefined` | No | Unavailable |  |
| grid | `boolean \| undefined` | No | Unavailable |  |
| inline | `boolean \| undefined` | No | Unavailable |  |
| itemToStringValue | `((item: Items[number]["items"][number]) => string) \| undefined` | No | Unavailable | Converts an item to text for both display and submission. |
| items | `Items` | Yes | Unavailable |  |
| limit | `number \| undefined` | No | Unavailable |  |
| locale | `Intl.LocalesArgument` | No | Unavailable |  |
| loopFocus | `boolean \| undefined` | No | Unavailable |  |
| modal | `boolean \| undefined` | No | Unavailable |  |
| mode | `"inline" \| "none" \| "both" \| "list" \| undefined` | No | 'list' | list filters; both filters and completes; inline only completes; none does neither. |
| onItemHighlighted | `((value: Items[number]["items"][number] \| undefined, details: AriaCombobox.HighlightEventDetails) => void) \| undefined` | No | Unavailable |  |
| onOpenChangeComplete | `((open: boolean) => void) \| undefined` | No | Unavailable |  |
| openOnInputClick | `boolean \| undefined` | No | false |  |
| submitOnItemClick | `boolean \| undefined` | No | Unavailable |  |
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

<a id="api-4175746f636f6d706c6574652e526f6f742e50726f7073"></a>

<a id="autocompleterootprops"></a>

### Related exported type: Autocomplete.Root.Props

Declaration: `packages/solid/build/types/autocomplete/root/AutocompleteRoot.d.ts:41`

#### Declaration

```typescript
Props<ItemValue>
```

<a id="api-4175746f636f6d706c6574652e526f6f742e50726f70732e6e616d65"></a>

<a id="AutocompleteRootProps-name"></a>

<a id="api-4175746f636f6d706c6574652e526f6f742e50726f70732e64656661756c7456616c7565"></a>

<a id="AutocompleteRootProps-defaultValue"></a>

<a id="api-4175746f636f6d706c6574652e526f6f742e50726f70732e76616c7565"></a>

<a id="AutocompleteRootProps-value"></a>

<a id="api-4175746f636f6d706c6574652e526f6f742e50726f70732e6f6e56616c75654368616e6765"></a>

<a id="AutocompleteRootProps-onValueChange"></a>

<a id="api-4175746f636f6d706c6574652e526f6f742e50726f70732e64656661756c744f70656e"></a>

<a id="AutocompleteRootProps-defaultOpen"></a>

<a id="api-4175746f636f6d706c6574652e526f6f742e50726f70732e6f70656e"></a>

<a id="AutocompleteRootProps-open"></a>

<a id="api-4175746f636f6d706c6574652e526f6f742e50726f70732e6f6e4f70656e4368616e6765"></a>

<a id="AutocompleteRootProps-onOpenChange"></a>

<a id="api-4175746f636f6d706c6574652e526f6f742e50726f70732e6175746f486967686c69676874"></a>

<a id="AutocompleteRootProps-autoHighlight"></a>

<a id="api-4175746f636f6d706c6574652e526f6f742e50726f70732e6b656570486967686c69676874"></a>

<a id="AutocompleteRootProps-keepHighlight"></a>

<a id="api-4175746f636f6d706c6574652e526f6f742e50726f70732e686967686c696768744974656d4f6e486f766572"></a>

<a id="AutocompleteRootProps-highlightItemOnHover"></a>

<a id="api-4175746f636f6d706c6574652e526f6f742e50726f70732e616374696f6e73526566"></a>

<a id="AutocompleteRootProps-actionsRef"></a>

<a id="api-4175746f636f6d706c6574652e526f6f742e50726f70732e66696c746572"></a>

<a id="AutocompleteRootProps-filter"></a>

<a id="api-4175746f636f6d706c6574652e526f6f742e50726f70732e66696c74657265644974656d73"></a>

<a id="AutocompleteRootProps-filteredItems"></a>

<a id="api-4175746f636f6d706c6574652e526f6f742e50726f70732e666f726d"></a>

<a id="AutocompleteRootProps-form"></a>

<a id="api-4175746f636f6d706c6574652e526f6f742e50726f70732e67726964"></a>

<a id="AutocompleteRootProps-grid"></a>

<a id="api-4175746f636f6d706c6574652e526f6f742e50726f70732e696e6c696e65"></a>

<a id="AutocompleteRootProps-inline"></a>

<a id="api-4175746f636f6d706c6574652e526f6f742e50726f70732e6974656d546f537472696e6756616c7565"></a>

<a id="AutocompleteRootProps-itemToStringValue"></a>

<a id="api-4175746f636f6d706c6574652e526f6f742e50726f70732e6974656d73"></a>

<a id="AutocompleteRootProps-items"></a>

<a id="api-4175746f636f6d706c6574652e526f6f742e50726f70732e6c696d6974"></a>

<a id="AutocompleteRootProps-limit"></a>

<a id="api-4175746f636f6d706c6574652e526f6f742e50726f70732e6c6f63616c65"></a>

<a id="AutocompleteRootProps-locale"></a>

<a id="api-4175746f636f6d706c6574652e526f6f742e50726f70732e6c6f6f70466f637573"></a>

<a id="AutocompleteRootProps-loopFocus"></a>

<a id="api-4175746f636f6d706c6574652e526f6f742e50726f70732e6d6f64616c"></a>

<a id="AutocompleteRootProps-modal"></a>

<a id="api-4175746f636f6d706c6574652e526f6f742e50726f70732e6d6f6465"></a>

<a id="AutocompleteRootProps-mode"></a>

<a id="api-4175746f636f6d706c6574652e526f6f742e50726f70732e6f6e4974656d486967686c696768746564"></a>

<a id="AutocompleteRootProps-onItemHighlighted"></a>

<a id="api-4175746f636f6d706c6574652e526f6f742e50726f70732e6f6e4f70656e4368616e6765436f6d706c657465"></a>

<a id="AutocompleteRootProps-onOpenChangeComplete"></a>

<a id="api-4175746f636f6d706c6574652e526f6f742e50726f70732e6f70656e4f6e496e707574436c69636b"></a>

<a id="AutocompleteRootProps-openOnInputClick"></a>

<a id="api-4175746f636f6d706c6574652e526f6f742e50726f70732e7375626d69744f6e4974656d436c69636b"></a>

<a id="AutocompleteRootProps-submitOnItemClick"></a>

<a id="api-4175746f636f6d706c6574652e526f6f742e50726f70732e7669727475616c697a6564"></a>

<a id="AutocompleteRootProps-virtualized"></a>

<a id="api-4175746f636f6d706c6574652e526f6f742e50726f70732e64697361626c6564"></a>

<a id="AutocompleteRootProps-disabled"></a>

<a id="api-4175746f636f6d706c6574652e526f6f742e50726f70732e726561644f6e6c79"></a>

<a id="AutocompleteRootProps-readOnly"></a>

<a id="api-4175746f636f6d706c6574652e526f6f742e50726f70732e7265717569726564"></a>

<a id="AutocompleteRootProps-required"></a>

<a id="api-4175746f636f6d706c6574652e526f6f742e50726f70732e696e707574526566"></a>

<a id="AutocompleteRootProps-inputRef"></a>

<a id="api-4175746f636f6d706c6574652e526f6f742e50726f70732e6964"></a>

<a id="AutocompleteRootProps-id"></a>

<a id="api-4175746f636f6d706c6574652e526f6f742e50726f70732e6368696c6472656e"></a>

<a id="AutocompleteRootProps-children"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| name | `string \| undefined` | No | Unavailable |  |
| defaultValue | `AriaComboboxInputValue \| undefined` | No | Unavailable | The initial, uncontrolled input text. |
| value | `AriaComboboxInputValue \| undefined` | No | Unavailable | Controlled input text, not a selected item. |
| onValueChange | `((value: string, details: AutocompleteRootChangeEventDetails) => void) \| undefined` | No | Unavailable |  |
| defaultOpen | `boolean \| undefined` | No | Unavailable |  |
| open | `boolean \| undefined` | No | Unavailable |  |
| onOpenChange | `((open: boolean, details: AutocompleteRootOpenChangeEventDetails) => void) \| undefined` | No | Unavailable |  |
| autoHighlight | `boolean \| "always" \| undefined` | No | Unavailable |  |
| keepHighlight | `boolean \| undefined` | No | Unavailable |  |
| highlightItemOnHover | `boolean \| undefined` | No | Unavailable |  |
| actionsRef | `{ current: AriaCombobox.Actions \| null; } \| ((actions: AriaCombobox.Actions \| null) => void) \| undefined` | No | Unavailable |  |
| filter | `((item: ItemValue, query: string, itemToString?: ((item: ItemValue) => string) \| undefined) => boolean) \| null \| undefined` | No | Unavailable |  |
| filteredItems | `readonly ItemValue[] \| readonly Group<ItemValue>[] \| undefined` | No | Unavailable | Externally filtered items, retaining the structure of `items`. |
| form | `string \| undefined` | No | Unavailable |  |
| grid | `boolean \| undefined` | No | Unavailable |  |
| inline | `boolean \| undefined` | No | Unavailable |  |
| itemToStringValue | `((item: ItemValue) => string) \| undefined` | No | Unavailable | Converts an item to text for both display and submission. |
| items | `readonly ItemValue[] \| readonly Group<ItemValue>[] \| undefined` | No | Unavailable | Flat items or groups of items; normalized Combobox collections are not accepted. |
| limit | `number \| undefined` | No | Unavailable |  |
| locale | `Intl.LocalesArgument` | No | Unavailable |  |
| loopFocus | `boolean \| undefined` | No | Unavailable |  |
| modal | `boolean \| undefined` | No | Unavailable |  |
| mode | `"inline" \| "none" \| "both" \| "list" \| undefined` | No | Unavailable | list filters; both filters and completes; inline only completes; none does neither. |
| onItemHighlighted | `((value: ItemValue \| undefined, details: AriaCombobox.HighlightEventDetails) => void) \| undefined` | No | Unavailable |  |
| onOpenChangeComplete | `((open: boolean) => void) \| undefined` | No | Unavailable |  |
| openOnInputClick | `boolean \| undefined` | No | Unavailable |  |
| submitOnItemClick | `boolean \| undefined` | No | Unavailable |  |
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

<a id="api-4175746f636f6d706c6574652e526f6f742e5374617465"></a>

<a id="autocompleterootstate"></a>

### Related exported type: Autocomplete.Root.State

Declaration: `packages/solid/build/types/autocomplete/root/AutocompleteRoot.d.ts:42`

#### Declaration

```typescript
AriaComboboxState
```

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4175746f636f6d706c6574652e526f6f742e416374696f6e73"></a>

<a id="autocompleterootactions"></a>

### Related exported type: Autocomplete.Root.Actions

Declaration: `packages/solid/build/types/autocomplete/root/AutocompleteRoot.d.ts:43`

#### Declaration

```typescript
AriaCombobox.Actions
```

<a id="api-4175746f636f6d706c6574652e526f6f742e416374696f6e732e636c6f7365"></a>

<a id="AutocompleteRootActions-close"></a>

<a id="api-4175746f636f6d706c6574652e526f6f742e416374696f6e732e686967686c696768744974656d"></a>

<a id="AutocompleteRootActions-highlightItem"></a>

<a id="api-4175746f636f6d706c6574652e526f6f742e416374696f6e732e756e6d6f756e74"></a>

<a id="AutocompleteRootActions-unmount"></a>

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

<a id="api-4175746f636f6d706c6574652e526f6f742e4368616e67654576656e74526561736f6e"></a>

<a id="autocompleterootchangeeventreason"></a>

### Related exported type: Autocomplete.Root.ChangeEventReason

Declaration: `packages/solid/build/types/autocomplete/root/AutocompleteRoot.d.ts:45`

#### Declaration

```typescript
AriaCombobox.ChangeEventReason
```

Inherited DOM attributes: `__@iterator@106`, `anchor`, `at`, `big`, `blink`, `bold`, `charAt`, `charCodeAt`, `codePointAt`, `concat`, `endsWith`, `fixed`, `fontcolor`, `fontsize`, `includes`, `indexOf`, `isWellFormed`, `italics`, `lastIndexOf`, `length`, `link`, `localeCompare`, `match`, `matchAll`, `normalize`, `padEnd`, `padStart`, `repeat`, `replace`, `replaceAll`, `search`, `slice`, `small`, `split`, `startsWith`, `strike`, `sub`, `substr`, `substring`, `sup`, `toLocaleLowerCase`, `toLocaleUpperCase`, `toLowerCase`, `toString`, `toUpperCase`, `toWellFormed`, `trim`, `trimEnd`, `trimLeft`, `trimRight`, `trimStart`, `valueOf`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4175746f636f6d706c6574652e526f6f742e4368616e67654576656e7444657461696c73"></a>

<a id="autocompleterootchangeeventdetails"></a>

### Related exported type: Autocomplete.Root.ChangeEventDetails

Declaration: `packages/solid/build/types/autocomplete/root/AutocompleteRoot.d.ts:46`

#### Declaration

```typescript
AutocompleteRootChangeEventDetails
```

<a id="api-4175746f636f6d706c6574652e526f6f742e4368616e67654576656e7444657461696c732e616c6c6f7750726f7061676174696f6e"></a>

<a id="AutocompleteRootChangeEventDetails-allowPropagation"></a>

<a id="api-4175746f636f6d706c6574652e526f6f742e4368616e67654576656e7444657461696c732e63616e63656c"></a>

<a id="AutocompleteRootChangeEventDetails-cancel"></a>

<a id="api-4175746f636f6d706c6574652e526f6f742e4368616e67654576656e7444657461696c732e6576656e74"></a>

<a id="AutocompleteRootChangeEventDetails-event"></a>

<a id="api-4175746f636f6d706c6574652e526f6f742e4368616e67654576656e7444657461696c732e697343616e63656c6564"></a>

<a id="AutocompleteRootChangeEventDetails-isCanceled"></a>

<a id="api-4175746f636f6d706c6574652e526f6f742e4368616e67654576656e7444657461696c732e697350726f7061676174696f6e416c6c6f776564"></a>

<a id="AutocompleteRootChangeEventDetails-isPropagationAllowed"></a>

<a id="api-4175746f636f6d706c6574652e526f6f742e4368616e67654576656e7444657461696c732e726561736f6e"></a>

<a id="AutocompleteRootChangeEventDetails-reason"></a>

<a id="api-4175746f636f6d706c6574652e526f6f742e4368616e67654576656e7444657461696c732e74726967676572"></a>

<a id="AutocompleteRootChangeEventDetails-trigger"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| allowPropagation | `() => void` | Yes | Unavailable | Marks this change transaction as allowing propagation. |
| cancel | `() => void` | Yes | Unavailable | Cancels the Base UI change transaction; separate from the DOM event’s preventDefault() and preventBaseUIHandler(). |
| event | `PointerEvent \| MouseEvent \| Event \| FocusEvent \| InputEvent \| KeyboardEvent \| TouchEvent` | Yes | Unavailable | Native DOM event associated with the change. Programmatic changes can use a Base UI-created Event. |
| isCanceled | `boolean` | Yes | Unavailable | Whether cancel() has been called for this change transaction. |
| isPropagationAllowed | `boolean` | Yes | Unavailable | Whether allowPropagation() has been called for this change transaction. |
| reason | `"none" \| "trigger-press" \| "outside-press" \| "item-press" \| "close-press" \| "clear-press" \| "chip-remove-press" \| "input-change" \| "input-clear" \| "input-press" \| "focus-out" \| "escape-key" \| "list-navigation" \| "cancel-open" \| "imperative-action"` | Yes | Unavailable | Reason for the requested change; it discriminates the native event type. |
| trigger | `Element \| undefined` | Yes | Unavailable | Trigger element associated with this change, when available. |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4175746f636f6d706c6574652e526f6f742e486967686c696768744576656e74526561736f6e"></a>

<a id="autocompleteroothighlighteventreason"></a>

### Related exported type: Autocomplete.Root.HighlightEventReason

Declaration: `packages/solid/build/types/autocomplete/root/AutocompleteRoot.d.ts:48`

#### Declaration

```typescript
AriaCombobox.HighlightEventReason
```

Inherited DOM attributes: `__@iterator@106`, `anchor`, `at`, `big`, `blink`, `bold`, `charAt`, `charCodeAt`, `codePointAt`, `concat`, `endsWith`, `fixed`, `fontcolor`, `fontsize`, `includes`, `indexOf`, `isWellFormed`, `italics`, `lastIndexOf`, `length`, `link`, `localeCompare`, `match`, `matchAll`, `normalize`, `padEnd`, `padStart`, `repeat`, `replace`, `replaceAll`, `search`, `slice`, `small`, `split`, `startsWith`, `strike`, `sub`, `substr`, `substring`, `sup`, `toLocaleLowerCase`, `toLocaleUpperCase`, `toLowerCase`, `toString`, `toUpperCase`, `toWellFormed`, `trim`, `trimEnd`, `trimLeft`, `trimRight`, `trimStart`, `valueOf`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4175746f636f6d706c6574652e526f6f742e486967686c696768744576656e7444657461696c73"></a>

<a id="autocompleteroothighlighteventdetails"></a>

### Related exported type: Autocomplete.Root.HighlightEventDetails

Declaration: `packages/solid/build/types/autocomplete/root/AutocompleteRoot.d.ts:49`

#### Declaration

```typescript
AriaCombobox.HighlightEventDetails
```

<a id="api-4175746f636f6d706c6574652e526f6f742e486967686c696768744576656e7444657461696c732e6576656e74"></a>

<a id="AutocompleteRootHighlightEventDetails-event"></a>

<a id="api-4175746f636f6d706c6574652e526f6f742e486967686c696768744576656e7444657461696c732e696e646578"></a>

<a id="AutocompleteRootHighlightEventDetails-index"></a>

<a id="api-4175746f636f6d706c6574652e526f6f742e486967686c696768744576656e7444657461696c732e726561736f6e"></a>

<a id="AutocompleteRootHighlightEventDetails-reason"></a>

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

<a id="api-4175746f636f6d706c6574652e526f6f742e486967686c696768744974656d546172676574"></a>

<a id="autocompleteroothighlightitemtarget"></a>

### Related exported type: Autocomplete.Root.HighlightItemTarget

Declaration: `packages/solid/build/types/autocomplete/root/AutocompleteRoot.d.ts:44`

#### Declaration

```typescript
AriaComboboxHighlightItemTarget
```

Inherited DOM attributes: `__@iterator@106`, `anchor`, `at`, `big`, `blink`, `bold`, `charAt`, `charCodeAt`, `codePointAt`, `concat`, `endsWith`, `fixed`, `fontcolor`, `fontsize`, `includes`, `indexOf`, `isWellFormed`, `italics`, `lastIndexOf`, `length`, `link`, `localeCompare`, `match`, `matchAll`, `normalize`, `padEnd`, `padStart`, `repeat`, `replace`, `replaceAll`, `search`, `slice`, `small`, `split`, `startsWith`, `strike`, `sub`, `substr`, `substring`, `sup`, `toLocaleLowerCase`, `toLocaleUpperCase`, `toLowerCase`, `toString`, `toUpperCase`, `toWellFormed`, `trim`, `trimEnd`, `trimLeft`, `trimRight`, `trimStart`, `valueOf`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4175746f636f6d706c6574652e526f6f742e4f70656e4368616e67654576656e7444657461696c73"></a>

<a id="autocompleterootopenchangeeventdetails"></a>

### Related exported type: Autocomplete.Root.OpenChangeEventDetails

Declaration: `packages/solid/build/types/autocomplete/root/AutocompleteRoot.d.ts:47`

#### Declaration

```typescript
AutocompleteRootOpenChangeEventDetails
```

<a id="api-4175746f636f6d706c6574652e526f6f742e4f70656e4368616e67654576656e7444657461696c732e616c6c6f7750726f7061676174696f6e"></a>

<a id="AutocompleteRootOpenChangeEventDetails-allowPropagation"></a>

<a id="api-4175746f636f6d706c6574652e526f6f742e4f70656e4368616e67654576656e7444657461696c732e63616e63656c"></a>

<a id="AutocompleteRootOpenChangeEventDetails-cancel"></a>

<a id="api-4175746f636f6d706c6574652e526f6f742e4f70656e4368616e67654576656e7444657461696c732e6576656e74"></a>

<a id="AutocompleteRootOpenChangeEventDetails-event"></a>

<a id="api-4175746f636f6d706c6574652e526f6f742e4f70656e4368616e67654576656e7444657461696c732e697343616e63656c6564"></a>

<a id="AutocompleteRootOpenChangeEventDetails-isCanceled"></a>

<a id="api-4175746f636f6d706c6574652e526f6f742e4f70656e4368616e67654576656e7444657461696c732e697350726f7061676174696f6e416c6c6f776564"></a>

<a id="AutocompleteRootOpenChangeEventDetails-isPropagationAllowed"></a>

<a id="api-4175746f636f6d706c6574652e526f6f742e4f70656e4368616e67654576656e7444657461696c732e70726576656e74556e6d6f756e744f6e436c6f7365"></a>

<a id="AutocompleteRootOpenChangeEventDetails-preventUnmountOnClose"></a>

<a id="api-4175746f636f6d706c6574652e526f6f742e4f70656e4368616e67654576656e7444657461696c732e726561736f6e"></a>

<a id="AutocompleteRootOpenChangeEventDetails-reason"></a>

<a id="api-4175746f636f6d706c6574652e526f6f742e4f70656e4368616e67654576656e7444657461696c732e74726967676572"></a>

<a id="AutocompleteRootOpenChangeEventDetails-trigger"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| allowPropagation | `() => void` | Yes | Unavailable | Marks this change transaction as allowing propagation. |
| cancel | `() => void` | Yes | Unavailable | Cancels the Base UI change transaction; separate from the DOM event’s preventDefault() and preventBaseUIHandler(). |
| event | `PointerEvent \| MouseEvent \| Event \| FocusEvent \| InputEvent \| KeyboardEvent \| TouchEvent` | Yes | Unavailable | Native DOM event associated with the change. Programmatic changes can use a Base UI-created Event. |
| isCanceled | `boolean` | Yes | Unavailable | Whether cancel() has been called for this change transaction. |
| isPropagationAllowed | `boolean` | Yes | Unavailable | Whether allowPropagation() has been called for this change transaction. |
| preventUnmountOnClose | `() => void` | Yes | Unavailable |  |
| reason | `"none" \| "trigger-press" \| "outside-press" \| "item-press" \| "close-press" \| "clear-press" \| "chip-remove-press" \| "input-change" \| "input-clear" \| "input-press" \| "focus-out" \| "escape-key" \| "list-navigation" \| "cancel-open" \| "imperative-action"` | Yes | Unavailable | Reason for the requested change; it discriminates the native event type. |
| trigger | `Element \| undefined` | Yes | Unavailable | Trigger element associated with this change, when available. |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="value"></a>

### Value

<a id="api-4175746f636f6d706c6574652e56616c7565"></a>

<a id="autocompletevalue"></a>

### Autocomplete.Value

Renders the current input text, or a live child renderer, without a host element.

Declaration: `packages/solid/build/types/autocomplete/value/AutocompleteValue.d.ts:3`

#### Declaration

```typescript
(props: AutocompleteValueProps) => JSX.Element
```

<a id="api-4175746f636f6d706c6574652e56616c75652e2470726f70732e6368696c6472656e"></a>

<a id="AutocompleteValue-children"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| children | `JSX.Element \| ((value: string) => JSX.Element)` | No | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4175746f636f6d706c6574652e56616c75652e50726f7073"></a>

<a id="autocompletevalueprops"></a>

### Related exported type: Autocomplete.Value.Props

Declaration: `packages/solid/build/types/autocomplete/value/AutocompleteValue.d.ts:10`

#### Declaration

```typescript
AutocompleteValueProps
```

<a id="api-4175746f636f6d706c6574652e56616c75652e50726f70732e6368696c6472656e"></a>

<a id="AutocompleteValueProps-children"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| children | `JSX.Element \| ((value: string) => JSX.Element)` | No | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4175746f636f6d706c6574652e56616c75652e5374617465"></a>

<a id="autocompletevaluestate"></a>

### Related exported type: Autocomplete.Value.State

Declaration: `packages/solid/build/types/autocomplete/value/AutocompleteValue.d.ts:11`

#### Declaration

```typescript
AutocompleteValueState
```

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="input"></a>

### Input

<a id="api-4175746f636f6d706c6574652e496e707574"></a>

<a id="autocompleteinput"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e2470726f70732e70726f703a616363657074"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e2470726f70732e70726f703a616c69676e"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e2470726f70732e70726f703a616c74"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e2470726f70732e70726f703a6175746f636f6d706c657465"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e2470726f70732e70726f703a63617074757265"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e2470726f70732e70726f703a6469724e616d65"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e2470726f70732e70726f703a64697361626c6564"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e2470726f70732e70726f703a666f726d416374696f6e"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e2470726f70732e70726f703a666f726d456e6374797065"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e2470726f70732e70726f703a666f726d4d6574686f64"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e2470726f70732e70726f703a666f726d4e6f56616c6964617465"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e2470726f70732e70726f703a666f726d546172676574"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e2470726f70732e70726f703a686569676874"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e2470726f70732e70726f703a696e64657465726d696e617465"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e2470726f70732e70726f703a6d6178"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e2470726f70732e70726f703a6d61784c656e677468"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e2470726f70732e70726f703a6d696e"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e2470726f70732e70726f703a6d696e4c656e677468"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e2470726f70732e70726f703a6d756c7469706c65"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e2470726f70732e70726f703a6e616d65"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e2470726f70732e70726f703a7061747465726e"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e2470726f70732e70726f703a706c616365686f6c646572"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e2470726f70732e70726f703a706f706f766572546172676574416374696f6e"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e2470726f70732e70726f703a706f706f766572546172676574456c656d656e74"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e2470726f70732e70726f703a726561644f6e6c79"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e2470726f70732e70726f703a7265717569726564"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e2470726f70732e70726f703a73656c656374696f6e446972656374696f6e"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e2470726f70732e70726f703a73656c656374696f6e456e64"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e2470726f70732e70726f703a73656c656374696f6e5374617274"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e2470726f70732e70726f703a73697a65"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e2470726f70732e70726f703a737263"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e2470726f70732e70726f703a73746570"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e2470726f70732e70726f703a74797065"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e2470726f70732e70726f703a7573654d6170"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e2470726f70732e70726f703a76616c7565417344617465"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e2470726f70732e70726f703a76616c756541734e756d626572"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e2470726f70732e70726f703a7765626b69746469726563746f7279"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e2470726f70732e70726f703a7769647468"></a>

### Autocomplete.Input

Declaration: `packages/solid/build/types/combobox/input/ComboboxInput.d.ts:14`

#### Declaration

```typescript
(props: ComboboxInputProps) => JSX.Element
```

<a id="api-4175746f636f6d706c6574652e496e7075742e2470726f70732e64697361626c6564"></a>

<a id="AutocompleteInput-disabled"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e2470726f70732e636c617373"></a>

<a id="AutocompleteInput-class"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e2470726f70732e7374796c65"></a>

<a id="AutocompleteInput-style"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e2470726f70732e72656e646572"></a>

<a id="AutocompleteInput-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| disabled | `boolean \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<AutocompleteInputState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AutocompleteInputState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, AutocompleteInputState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accept`, `accesskey`, `align`, `alpha`, `alt`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocomplete`, `autocorrect`, `autofocus`, `capture`, `checked`, `children`, `colorspace`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `dirname`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `form`, `formaction`, `formenctype`, `formmethod`, `formnovalidate`, `formtarget`, `height`, `hidden`, `id`, `incremental`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `list`, `max`, `maxlength`, `min`, `minlength`, `multiple`, `name`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `pattern`, `placeholder`, `popover`, `popovertarget`, `popovertargetaction`, `prefix`, `prop:accept`, `prop:align`, `prop:alt`, `prop:autocomplete`, `prop:capture`, `prop:checked`, `prop:defaultChecked`, `prop:defaultValue`, `prop:dirName`, `prop:disabled`, `prop:formAction`, `prop:formEnctype`, `prop:formMethod`, `prop:formNoValidate`, `prop:formTarget`, `prop:height`, `prop:indeterminate`, `prop:max`, `prop:maxLength`, `prop:min`, `prop:minLength`, `prop:multiple`, `prop:name`, `prop:pattern`, `prop:placeholder`, `prop:popoverTargetAction`, `prop:popoverTargetElement`, `prop:readOnly`, `prop:required`, `prop:selectionDirection`, `prop:selectionEnd`, `prop:selectionStart`, `prop:size`, `prop:src`, `prop:step`, `prop:type`, `prop:useMap`, `prop:value`, `prop:valueAsDate`, `prop:valueAsNumber`, `prop:webkitdirectory`, `prop:width`, `property`, `readonly`, `ref`, `required`, `resource`, `results`, `role`, `size`, `slot`, `spellcheck`, `src`, `step`, `tabindex`, `textContent`, `title`, `translate`, `type`, `typeof`, `usemap`, `value`, `virtualkeyboardpolicy`, `vocab`, `webkitdirectory`, `width`, `writingsuggestions`

#### Data attributes

<a id="api-4175746f636f6d706c6574652e496e7075742e64617461417474726962757465732e706f7075704f70656e"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e64617461417474726962757465732e706f70757053696465"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e64617461417474726962757465732e6c697374456d707479"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e64617461417474726962757465732e70726573736564"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e64617461417474726962757465732e64697361626c6564"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e64617461417474726962757465732e726561646f6e6c79"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e64617461417474726962757465732e7265717569726564"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e64617461417474726962757465732e76616c6964"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e64617461417474726962757465732e696e76616c6964"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e64617461417474726962757465732e6469727479"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e64617461417474726962757465732e746f7563686564"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e64617461417474726962757465732e66696c6c6564"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e64617461417474726962757465732e666f6375736564"></a>

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

<a id="api-4175746f636f6d706c6574652e496e7075742e50726f7073"></a>

<a id="autocompleteinputprops"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e50726f70732e70726f703a616363657074"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e50726f70732e70726f703a616c69676e"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e50726f70732e70726f703a616c74"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e50726f70732e70726f703a6175746f636f6d706c657465"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e50726f70732e70726f703a63617074757265"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e50726f70732e70726f703a6469724e616d65"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e50726f70732e70726f703a64697361626c6564"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e50726f70732e70726f703a666f726d416374696f6e"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e50726f70732e70726f703a666f726d456e6374797065"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e50726f70732e70726f703a666f726d4d6574686f64"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e50726f70732e70726f703a666f726d4e6f56616c6964617465"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e50726f70732e70726f703a666f726d546172676574"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e50726f70732e70726f703a686569676874"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e50726f70732e70726f703a696e64657465726d696e617465"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e50726f70732e70726f703a6d6178"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e50726f70732e70726f703a6d61784c656e677468"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e50726f70732e70726f703a6d696e"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e50726f70732e70726f703a6d696e4c656e677468"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e50726f70732e70726f703a6d756c7469706c65"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e50726f70732e70726f703a6e616d65"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e50726f70732e70726f703a7061747465726e"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e50726f70732e70726f703a706c616365686f6c646572"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e50726f70732e70726f703a706f706f766572546172676574416374696f6e"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e50726f70732e70726f703a706f706f766572546172676574456c656d656e74"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e50726f70732e70726f703a726561644f6e6c79"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e50726f70732e70726f703a7265717569726564"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e50726f70732e70726f703a73656c656374696f6e446972656374696f6e"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e50726f70732e70726f703a73656c656374696f6e456e64"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e50726f70732e70726f703a73656c656374696f6e5374617274"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e50726f70732e70726f703a73697a65"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e50726f70732e70726f703a737263"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e50726f70732e70726f703a73746570"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e50726f70732e70726f703a74797065"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e50726f70732e70726f703a7573654d6170"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e50726f70732e70726f703a76616c7565417344617465"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e50726f70732e70726f703a76616c756541734e756d626572"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e50726f70732e70726f703a7765626b69746469726563746f7279"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e50726f70732e70726f703a7769647468"></a>

### Related exported type: Autocomplete.Input.Props

Declaration: `packages/solid/build/types/combobox/input/ComboboxInput.d.ts:16`

#### Declaration

```typescript
ComboboxInputProps
```

<a id="api-4175746f636f6d706c6574652e496e7075742e50726f70732e64697361626c6564"></a>

<a id="AutocompleteInputProps-disabled"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e50726f70732e636c617373"></a>

<a id="AutocompleteInputProps-class"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e50726f70732e7374796c65"></a>

<a id="AutocompleteInputProps-style"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e50726f70732e72656e646572"></a>

<a id="AutocompleteInputProps-render"></a>

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

<a id="api-4175746f636f6d706c6574652e496e7075742e5374617465"></a>

<a id="autocompleteinputstate"></a>

### Related exported type: Autocomplete.Input.State

Declaration: `packages/solid/build/types/combobox/input/ComboboxInput.d.ts:17`

#### Declaration

```typescript
ComboboxInputState
```

<a id="api-4175746f636f6d706c6574652e496e7075742e53746174652e6f70656e"></a>

<a id="AutocompleteInputState-open"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e53746174652e6469727479"></a>

<a id="AutocompleteInputState-dirty"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e53746174652e66696c6c6564"></a>

<a id="AutocompleteInputState-filled"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e53746174652e666f6375736564"></a>

<a id="AutocompleteInputState-focused"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e53746174652e6c697374456d707479"></a>

<a id="AutocompleteInputState-listEmpty"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e53746174652e706f70757053696465"></a>

<a id="AutocompleteInputState-popupSide"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e53746174652e746f7563686564"></a>

<a id="AutocompleteInputState-touched"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e53746174652e64697361626c6564"></a>

<a id="AutocompleteInputState-disabled"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e53746174652e726561644f6e6c79"></a>

<a id="AutocompleteInputState-readOnly"></a>

<a id="api-4175746f636f6d706c6574652e496e7075742e53746174652e76616c6964"></a>

<a id="AutocompleteInputState-valid"></a>

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

<a id="api-4175746f636f6d706c6574652e496e70757447726f7570"></a>

<a id="autocompleteinputgroup"></a>

<a id="api-4175746f636f6d706c6574652e496e70757447726f75702e2470726f70732e70726f703a616c69676e"></a>

### Autocomplete.InputGroup

Declaration: `packages/solid/build/types/autocomplete/input-group/AutocompleteInputGroup.d.ts:9`

#### Declaration

```typescript
AutocompleteInputGroup
```

<a id="api-4175746f636f6d706c6574652e496e70757447726f75702e2470726f70732e636c617373"></a>

<a id="AutocompleteInputGroup-class"></a>

<a id="api-4175746f636f6d706c6574652e496e70757447726f75702e2470726f70732e7374796c65"></a>

<a id="AutocompleteInputGroup-style"></a>

<a id="api-4175746f636f6d706c6574652e496e70757447726f75702e2470726f70732e72656e646572"></a>

<a id="AutocompleteInputGroup-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<AutocompleteInputGroupState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AutocompleteInputGroupState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, AutocompleteInputGroupState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-4175746f636f6d706c657465496e70757447726f757044617461417474726962757465732e706f7075704f70656e"></a>

<a id="api-4175746f636f6d706c657465496e70757447726f757044617461417474726962757465732e706f70757053696465"></a>

<a id="api-4175746f636f6d706c657465496e70757447726f757044617461417474726962757465732e6c697374456d707479"></a>

<a id="api-4175746f636f6d706c657465496e70757447726f757044617461417474726962757465732e70726573736564"></a>

<a id="api-4175746f636f6d706c657465496e70757447726f757044617461417474726962757465732e64697361626c6564"></a>

<a id="api-4175746f636f6d706c657465496e70757447726f757044617461417474726962757465732e726561646f6e6c79"></a>

<a id="api-4175746f636f6d706c657465496e70757447726f757044617461417474726962757465732e76616c6964"></a>

<a id="api-4175746f636f6d706c657465496e70757447726f757044617461417474726962757465732e696e76616c6964"></a>

<a id="api-4175746f636f6d706c657465496e70757447726f757044617461417474726962757465732e6469727479"></a>

<a id="api-4175746f636f6d706c657465496e70757447726f757044617461417474726962757465732e746f7563686564"></a>

<a id="api-4175746f636f6d706c657465496e70757447726f757044617461417474726962757465732e66696c6c6564"></a>

<a id="api-4175746f636f6d706c657465496e70757447726f757044617461417474726962757465732e666f6375736564"></a>

| Name | Description |
| --- | --- |
| data-popup-open |  |
| data-popup-side |  |
| data-list-empty |  |
| data-pressed |  |
| data-disabled |  |
| data-readonly |  |
| data-valid |  |
| data-invalid |  |
| data-dirty |  |
| data-touched |  |
| data-filled |  |
| data-focused |  |

#### CSS variables

Metadata status: unavailable.

<a id="api-4175746f636f6d706c6574652e496e70757447726f75702e50726f7073"></a>

<a id="autocompleteinputgroupprops"></a>

<a id="api-4175746f636f6d706c6574652e496e70757447726f75702e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Autocomplete.InputGroup.Props

Declaration: `packages/solid/build/types/autocomplete/input-group/AutocompleteInputGroup.d.ts:11`

#### Declaration

```typescript
AutocompleteInputGroupProps
```

<a id="api-4175746f636f6d706c6574652e496e70757447726f75702e50726f70732e636c617373"></a>

<a id="AutocompleteInputGroupProps-class"></a>

<a id="api-4175746f636f6d706c6574652e496e70757447726f75702e50726f70732e7374796c65"></a>

<a id="AutocompleteInputGroupProps-style"></a>

<a id="api-4175746f636f6d706c6574652e496e70757447726f75702e50726f70732e72656e646572"></a>

<a id="AutocompleteInputGroupProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<AutocompleteInputGroupState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AutocompleteInputGroupState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, AutocompleteInputGroupState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4175746f636f6d706c6574652e496e70757447726f75702e5374617465"></a>

<a id="autocompleteinputgroupstate"></a>

### Related exported type: Autocomplete.InputGroup.State

Declaration: `packages/solid/build/types/autocomplete/input-group/AutocompleteInputGroup.d.ts:12`

#### Declaration

```typescript
AutocompleteInputGroupState
```

<a id="api-4175746f636f6d706c6574652e496e70757447726f75702e53746174652e6f70656e"></a>

<a id="AutocompleteInputGroupState-open"></a>

<a id="api-4175746f636f6d706c6574652e496e70757447726f75702e53746174652e6469727479"></a>

<a id="AutocompleteInputGroupState-dirty"></a>

<a id="api-4175746f636f6d706c6574652e496e70757447726f75702e53746174652e66696c6c6564"></a>

<a id="AutocompleteInputGroupState-filled"></a>

<a id="api-4175746f636f6d706c6574652e496e70757447726f75702e53746174652e666f6375736564"></a>

<a id="AutocompleteInputGroupState-focused"></a>

<a id="api-4175746f636f6d706c6574652e496e70757447726f75702e53746174652e6c697374456d707479"></a>

<a id="AutocompleteInputGroupState-listEmpty"></a>

<a id="api-4175746f636f6d706c6574652e496e70757447726f75702e53746174652e706f70757053696465"></a>

<a id="AutocompleteInputGroupState-popupSide"></a>

<a id="api-4175746f636f6d706c6574652e496e70757447726f75702e53746174652e746f7563686564"></a>

<a id="AutocompleteInputGroupState-touched"></a>

<a id="api-4175746f636f6d706c6574652e496e70757447726f75702e53746174652e64697361626c6564"></a>

<a id="AutocompleteInputGroupState-disabled"></a>

<a id="api-4175746f636f6d706c6574652e496e70757447726f75702e53746174652e726561644f6e6c79"></a>

<a id="AutocompleteInputGroupState-readOnly"></a>

<a id="api-4175746f636f6d706c6574652e496e70757447726f75702e53746174652e76616c6964"></a>

<a id="AutocompleteInputGroupState-valid"></a>

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

<a id="trigger"></a>

### Trigger

<a id="api-4175746f636f6d706c6574652e54726967676572"></a>

<a id="autocompletetrigger"></a>

<a id="api-4175746f636f6d706c6574652e547269676765722e2470726f70732e70726f703a64697361626c6564"></a>

<a id="api-4175746f636f6d706c6574652e547269676765722e2470726f70732e70726f703a666f726d416374696f6e"></a>

<a id="api-4175746f636f6d706c6574652e547269676765722e2470726f70732e70726f703a666f726d456e6374797065"></a>

<a id="api-4175746f636f6d706c6574652e547269676765722e2470726f70732e70726f703a666f726d4d6574686f64"></a>

<a id="api-4175746f636f6d706c6574652e547269676765722e2470726f70732e70726f703a666f726d4e6f56616c6964617465"></a>

<a id="api-4175746f636f6d706c6574652e547269676765722e2470726f70732e70726f703a666f726d546172676574"></a>

<a id="api-4175746f636f6d706c6574652e547269676765722e2470726f70732e70726f703a6e616d65"></a>

<a id="api-4175746f636f6d706c6574652e547269676765722e2470726f70732e70726f703a706f706f766572546172676574416374696f6e"></a>

<a id="api-4175746f636f6d706c6574652e547269676765722e2470726f70732e70726f703a706f706f766572546172676574456c656d656e74"></a>

<a id="api-4175746f636f6d706c6574652e547269676765722e2470726f70732e70726f703a74797065"></a>

<a id="api-4175746f636f6d706c6574652e547269676765722e2470726f70732e70726f703a76616c7565"></a>

### Autocomplete.Trigger

Declaration: `packages/solid/build/types/autocomplete/trigger/AutocompleteTrigger.d.ts:9`

#### Declaration

```typescript
AutocompleteTrigger
```

<a id="api-4175746f636f6d706c6574652e547269676765722e2470726f70732e6e6174697665427574746f6e"></a>

<a id="AutocompleteTrigger-nativeButton"></a>

<a id="api-4175746f636f6d706c6574652e547269676765722e2470726f70732e64697361626c6564"></a>

<a id="AutocompleteTrigger-disabled"></a>

<a id="api-4175746f636f6d706c6574652e547269676765722e2470726f70732e636c617373"></a>

<a id="AutocompleteTrigger-class"></a>

<a id="api-4175746f636f6d706c6574652e547269676765722e2470726f70732e7374796c65"></a>

<a id="AutocompleteTrigger-style"></a>

<a id="api-4175746f636f6d706c6574652e547269676765722e2470726f70732e72656e646572"></a>

<a id="AutocompleteTrigger-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| nativeButton | `boolean \| undefined` | No | Unavailable |  |
| disabled | `boolean \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<AutocompleteTriggerState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AutocompleteTriggerState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, AutocompleteTriggerState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `command`, `commandfor`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `form`, `formaction`, `formenctype`, `formmethod`, `formnovalidate`, `formtarget`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `name`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `popovertarget`, `popovertargetaction`, `prefix`, `prop:disabled`, `prop:formAction`, `prop:formEnctype`, `prop:formMethod`, `prop:formNoValidate`, `prop:formTarget`, `prop:name`, `prop:popoverTargetAction`, `prop:popoverTargetElement`, `prop:type`, `prop:value`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `type`, `typeof`, `value`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-4175746f636f6d706c6574655472696767657244617461417474726962757465732e706f7075704f70656e"></a>

<a id="api-4175746f636f6d706c6574655472696767657244617461417474726962757465732e706f70757053696465"></a>

<a id="api-4175746f636f6d706c6574655472696767657244617461417474726962757465732e6c697374456d707479"></a>

<a id="api-4175746f636f6d706c6574655472696767657244617461417474726962757465732e70726573736564"></a>

<a id="api-4175746f636f6d706c6574655472696767657244617461417474726962757465732e64697361626c6564"></a>

<a id="api-4175746f636f6d706c6574655472696767657244617461417474726962757465732e726561646f6e6c79"></a>

<a id="api-4175746f636f6d706c6574655472696767657244617461417474726962757465732e7265717569726564"></a>

<a id="api-4175746f636f6d706c6574655472696767657244617461417474726962757465732e76616c6964"></a>

<a id="api-4175746f636f6d706c6574655472696767657244617461417474726962757465732e696e76616c6964"></a>

<a id="api-4175746f636f6d706c6574655472696767657244617461417474726962757465732e6469727479"></a>

<a id="api-4175746f636f6d706c6574655472696767657244617461417474726962757465732e746f7563686564"></a>

<a id="api-4175746f636f6d706c6574655472696767657244617461417474726962757465732e66696c6c6564"></a>

<a id="api-4175746f636f6d706c6574655472696767657244617461417474726962757465732e666f6375736564"></a>

| Name | Description |
| --- | --- |
| data-popup-open |  |
| data-popup-side |  |
| data-list-empty |  |
| data-pressed |  |
| data-disabled |  |
| data-readonly |  |
| data-required |  |
| data-valid |  |
| data-invalid |  |
| data-dirty |  |
| data-touched |  |
| data-filled |  |
| data-focused |  |

#### CSS variables

Metadata status: unavailable.

<a id="api-4175746f636f6d706c6574652e547269676765722e50726f7073"></a>

<a id="autocompletetriggerprops"></a>

<a id="api-4175746f636f6d706c6574652e547269676765722e50726f70732e70726f703a64697361626c6564"></a>

<a id="api-4175746f636f6d706c6574652e547269676765722e50726f70732e70726f703a666f726d416374696f6e"></a>

<a id="api-4175746f636f6d706c6574652e547269676765722e50726f70732e70726f703a666f726d456e6374797065"></a>

<a id="api-4175746f636f6d706c6574652e547269676765722e50726f70732e70726f703a666f726d4d6574686f64"></a>

<a id="api-4175746f636f6d706c6574652e547269676765722e50726f70732e70726f703a666f726d4e6f56616c6964617465"></a>

<a id="api-4175746f636f6d706c6574652e547269676765722e50726f70732e70726f703a666f726d546172676574"></a>

<a id="api-4175746f636f6d706c6574652e547269676765722e50726f70732e70726f703a6e616d65"></a>

<a id="api-4175746f636f6d706c6574652e547269676765722e50726f70732e70726f703a706f706f766572546172676574416374696f6e"></a>

<a id="api-4175746f636f6d706c6574652e547269676765722e50726f70732e70726f703a706f706f766572546172676574456c656d656e74"></a>

<a id="api-4175746f636f6d706c6574652e547269676765722e50726f70732e70726f703a74797065"></a>

<a id="api-4175746f636f6d706c6574652e547269676765722e50726f70732e70726f703a76616c7565"></a>

### Related exported type: Autocomplete.Trigger.Props

Declaration: `packages/solid/build/types/autocomplete/trigger/AutocompleteTrigger.d.ts:11`

#### Declaration

```typescript
AutocompleteTriggerProps
```

<a id="api-4175746f636f6d706c6574652e547269676765722e50726f70732e6e6174697665427574746f6e"></a>

<a id="AutocompleteTriggerProps-nativeButton"></a>

<a id="api-4175746f636f6d706c6574652e547269676765722e50726f70732e64697361626c6564"></a>

<a id="AutocompleteTriggerProps-disabled"></a>

<a id="api-4175746f636f6d706c6574652e547269676765722e50726f70732e636c617373"></a>

<a id="AutocompleteTriggerProps-class"></a>

<a id="api-4175746f636f6d706c6574652e547269676765722e50726f70732e7374796c65"></a>

<a id="AutocompleteTriggerProps-style"></a>

<a id="api-4175746f636f6d706c6574652e547269676765722e50726f70732e72656e646572"></a>

<a id="AutocompleteTriggerProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| nativeButton | `boolean \| undefined` | No | Unavailable |  |
| disabled | `boolean \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<AutocompleteTriggerState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AutocompleteTriggerState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, AutocompleteTriggerState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `command`, `commandfor`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `form`, `formaction`, `formenctype`, `formmethod`, `formnovalidate`, `formtarget`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `name`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `popovertarget`, `popovertargetaction`, `prefix`, `prop:disabled`, `prop:formAction`, `prop:formEnctype`, `prop:formMethod`, `prop:formNoValidate`, `prop:formTarget`, `prop:name`, `prop:popoverTargetAction`, `prop:popoverTargetElement`, `prop:type`, `prop:value`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `type`, `typeof`, `value`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4175746f636f6d706c6574652e547269676765722e5374617465"></a>

<a id="autocompletetriggerstate"></a>

### Related exported type: Autocomplete.Trigger.State

Declaration: `packages/solid/build/types/autocomplete/trigger/AutocompleteTrigger.d.ts:12`

#### Declaration

```typescript
AutocompleteTriggerState
```

<a id="api-4175746f636f6d706c6574652e547269676765722e53746174652e6f70656e"></a>

<a id="AutocompleteTriggerState-open"></a>

<a id="api-4175746f636f6d706c6574652e547269676765722e53746174652e6469727479"></a>

<a id="AutocompleteTriggerState-dirty"></a>

<a id="api-4175746f636f6d706c6574652e547269676765722e53746174652e66696c6c6564"></a>

<a id="AutocompleteTriggerState-filled"></a>

<a id="api-4175746f636f6d706c6574652e547269676765722e53746174652e666f6375736564"></a>

<a id="AutocompleteTriggerState-focused"></a>

<a id="api-4175746f636f6d706c6574652e547269676765722e53746174652e6c697374456d707479"></a>

<a id="AutocompleteTriggerState-listEmpty"></a>

<a id="api-4175746f636f6d706c6574652e547269676765722e53746174652e706f70757053696465"></a>

<a id="AutocompleteTriggerState-popupSide"></a>

<a id="api-4175746f636f6d706c6574652e547269676765722e53746174652e746f7563686564"></a>

<a id="AutocompleteTriggerState-touched"></a>

<a id="api-4175746f636f6d706c6574652e547269676765722e53746174652e64697361626c6564"></a>

<a id="AutocompleteTriggerState-disabled"></a>

<a id="api-4175746f636f6d706c6574652e547269676765722e53746174652e726561644f6e6c79"></a>

<a id="AutocompleteTriggerState-readOnly"></a>

<a id="api-4175746f636f6d706c6574652e547269676765722e53746174652e76616c6964"></a>

<a id="AutocompleteTriggerState-valid"></a>

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

<a id="icon"></a>

### Icon

<a id="api-4175746f636f6d706c6574652e49636f6e"></a>

<a id="autocompleteicon"></a>

### Autocomplete.Icon

Declaration: `packages/solid/build/types/combobox/icon/ComboboxIcon.d.ts:6`

#### Declaration

```typescript
(props: ComboboxIconProps) => JSX.Element
```

<a id="api-4175746f636f6d706c6574652e49636f6e2e2470726f70732e636c617373"></a>

<a id="AutocompleteIcon-class"></a>

<a id="api-4175746f636f6d706c6574652e49636f6e2e2470726f70732e7374796c65"></a>

<a id="AutocompleteIcon-style"></a>

<a id="api-4175746f636f6d706c6574652e49636f6e2e2470726f70732e72656e646572"></a>

<a id="AutocompleteIcon-render"></a>

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

<a id="api-4175746f636f6d706c6574652e49636f6e2e50726f7073"></a>

<a id="autocompleteiconprops"></a>

### Related exported type: Autocomplete.Icon.Props

Declaration: `packages/solid/build/types/combobox/icon/ComboboxIcon.d.ts:8`

#### Declaration

```typescript
ComboboxIconProps
```

<a id="api-4175746f636f6d706c6574652e49636f6e2e50726f70732e636c617373"></a>

<a id="AutocompleteIconProps-class"></a>

<a id="api-4175746f636f6d706c6574652e49636f6e2e50726f70732e7374796c65"></a>

<a id="AutocompleteIconProps-style"></a>

<a id="api-4175746f636f6d706c6574652e49636f6e2e50726f70732e72656e646572"></a>

<a id="AutocompleteIconProps-render"></a>

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

<a id="api-4175746f636f6d706c6574652e49636f6e2e5374617465"></a>

<a id="autocompleteiconstate"></a>

### Related exported type: Autocomplete.Icon.State

Declaration: `packages/solid/build/types/combobox/icon/ComboboxIcon.d.ts:9`

#### Declaration

```typescript
ComboboxIconState
```

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="clear"></a>

### Clear

<a id="api-4175746f636f6d706c6574652e436c656172"></a>

<a id="autocompleteclear"></a>

<a id="api-4175746f636f6d706c6574652e436c6561722e2470726f70732e70726f703a64697361626c6564"></a>

<a id="api-4175746f636f6d706c6574652e436c6561722e2470726f70732e70726f703a666f726d416374696f6e"></a>

<a id="api-4175746f636f6d706c6574652e436c6561722e2470726f70732e70726f703a666f726d456e6374797065"></a>

<a id="api-4175746f636f6d706c6574652e436c6561722e2470726f70732e70726f703a666f726d4d6574686f64"></a>

<a id="api-4175746f636f6d706c6574652e436c6561722e2470726f70732e70726f703a666f726d4e6f56616c6964617465"></a>

<a id="api-4175746f636f6d706c6574652e436c6561722e2470726f70732e70726f703a666f726d546172676574"></a>

<a id="api-4175746f636f6d706c6574652e436c6561722e2470726f70732e70726f703a6e616d65"></a>

<a id="api-4175746f636f6d706c6574652e436c6561722e2470726f70732e70726f703a706f706f766572546172676574416374696f6e"></a>

<a id="api-4175746f636f6d706c6574652e436c6561722e2470726f70732e70726f703a706f706f766572546172676574456c656d656e74"></a>

<a id="api-4175746f636f6d706c6574652e436c6561722e2470726f70732e70726f703a74797065"></a>

<a id="api-4175746f636f6d706c6574652e436c6561722e2470726f70732e70726f703a76616c7565"></a>

### Autocomplete.Clear

Declaration: `packages/solid/build/types/combobox/clear/ComboboxClear.d.ts:14`

#### Declaration

```typescript
(props: ComboboxClearProps) => JSX.Element
```

<a id="api-4175746f636f6d706c6574652e436c6561722e2470726f70732e6e6174697665427574746f6e"></a>

<a id="AutocompleteClear-nativeButton"></a>

<a id="api-4175746f636f6d706c6574652e436c6561722e2470726f70732e64697361626c6564"></a>

<a id="AutocompleteClear-disabled"></a>

<a id="api-4175746f636f6d706c6574652e436c6561722e2470726f70732e636c617373"></a>

<a id="AutocompleteClear-class"></a>

<a id="api-4175746f636f6d706c6574652e436c6561722e2470726f70732e7374796c65"></a>

<a id="AutocompleteClear-style"></a>

<a id="api-4175746f636f6d706c6574652e436c6561722e2470726f70732e6b6565704d6f756e746564"></a>

<a id="AutocompleteClear-keepMounted"></a>

<a id="api-4175746f636f6d706c6574652e436c6561722e2470726f70732e72656e646572"></a>

<a id="AutocompleteClear-render"></a>

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

<a id="api-4175746f636f6d706c6574652e436c6561722e64617461417474726962757465732e706f7075704f70656e"></a>

<a id="api-4175746f636f6d706c6574652e436c6561722e64617461417474726962757465732e64697361626c6564"></a>

<a id="api-4175746f636f6d706c6574652e436c6561722e64617461417474726962757465732e76697369626c65"></a>

<a id="api-4175746f636f6d706c6574652e436c6561722e64617461417474726962757465732e7374617274696e675374796c65"></a>

<a id="api-4175746f636f6d706c6574652e436c6561722e64617461417474726962757465732e656e64696e675374796c65"></a>

| Name | Description |
| --- | --- |
| data-popup-open | Present when open is true. |
| data-disabled |  |
| data-visible |  |
| data-starting-style | Present when transitionStatus is 'starting'. |
| data-ending-style | Present when transitionStatus is 'ending'. |

#### CSS variables

Metadata status: unavailable.

<a id="api-4175746f636f6d706c6574652e436c6561722e50726f7073"></a>

<a id="autocompleteclearprops"></a>

<a id="api-4175746f636f6d706c6574652e436c6561722e50726f70732e70726f703a64697361626c6564"></a>

<a id="api-4175746f636f6d706c6574652e436c6561722e50726f70732e70726f703a666f726d416374696f6e"></a>

<a id="api-4175746f636f6d706c6574652e436c6561722e50726f70732e70726f703a666f726d456e6374797065"></a>

<a id="api-4175746f636f6d706c6574652e436c6561722e50726f70732e70726f703a666f726d4d6574686f64"></a>

<a id="api-4175746f636f6d706c6574652e436c6561722e50726f70732e70726f703a666f726d4e6f56616c6964617465"></a>

<a id="api-4175746f636f6d706c6574652e436c6561722e50726f70732e70726f703a666f726d546172676574"></a>

<a id="api-4175746f636f6d706c6574652e436c6561722e50726f70732e70726f703a6e616d65"></a>

<a id="api-4175746f636f6d706c6574652e436c6561722e50726f70732e70726f703a706f706f766572546172676574416374696f6e"></a>

<a id="api-4175746f636f6d706c6574652e436c6561722e50726f70732e70726f703a706f706f766572546172676574456c656d656e74"></a>

<a id="api-4175746f636f6d706c6574652e436c6561722e50726f70732e70726f703a74797065"></a>

<a id="api-4175746f636f6d706c6574652e436c6561722e50726f70732e70726f703a76616c7565"></a>

### Related exported type: Autocomplete.Clear.Props

Declaration: `packages/solid/build/types/combobox/clear/ComboboxClear.d.ts:16`

#### Declaration

```typescript
ComboboxClearProps
```

<a id="api-4175746f636f6d706c6574652e436c6561722e50726f70732e6e6174697665427574746f6e"></a>

<a id="AutocompleteClearProps-nativeButton"></a>

<a id="api-4175746f636f6d706c6574652e436c6561722e50726f70732e64697361626c6564"></a>

<a id="AutocompleteClearProps-disabled"></a>

<a id="api-4175746f636f6d706c6574652e436c6561722e50726f70732e636c617373"></a>

<a id="AutocompleteClearProps-class"></a>

<a id="api-4175746f636f6d706c6574652e436c6561722e50726f70732e7374796c65"></a>

<a id="AutocompleteClearProps-style"></a>

<a id="api-4175746f636f6d706c6574652e436c6561722e50726f70732e6b6565704d6f756e746564"></a>

<a id="AutocompleteClearProps-keepMounted"></a>

<a id="api-4175746f636f6d706c6574652e436c6561722e50726f70732e72656e646572"></a>

<a id="AutocompleteClearProps-render"></a>

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

<a id="api-4175746f636f6d706c6574652e436c6561722e5374617465"></a>

<a id="autocompleteclearstate"></a>

### Related exported type: Autocomplete.Clear.State

Declaration: `packages/solid/build/types/combobox/clear/ComboboxClear.d.ts:17`

#### Declaration

```typescript
ComboboxClearState
```

<a id="api-4175746f636f6d706c6574652e436c6561722e53746174652e6f70656e"></a>

<a id="AutocompleteClearState-open"></a>

<a id="api-4175746f636f6d706c6574652e436c6561722e53746174652e7472616e736974696f6e537461747573"></a>

<a id="AutocompleteClearState-transitionStatus"></a>

<a id="api-4175746f636f6d706c6574652e436c6561722e53746174652e76697369626c65"></a>

<a id="AutocompleteClearState-visible"></a>

<a id="api-4175746f636f6d706c6574652e436c6561722e53746174652e64697361626c6564"></a>

<a id="AutocompleteClearState-disabled"></a>

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

<a id="list"></a>

### List

<a id="api-4175746f636f6d706c6574652e4c697374"></a>

<a id="autocompletelist"></a>

<a id="api-4175746f636f6d706c6574652e4c6973742e2470726f70732e70726f703a616c69676e"></a>

### Autocomplete.List

Declaration: `packages/solid/build/types/combobox/list/ComboboxList.d.ts:9`

#### Declaration

```typescript
(props: ComboboxListProps) => JSX.Element
```

<a id="api-4175746f636f6d706c6574652e4c6973742e2470726f70732e6368696c6472656e"></a>

<a id="AutocompleteList-children"></a>

<a id="api-4175746f636f6d706c6574652e4c6973742e2470726f70732e636c617373"></a>

<a id="AutocompleteList-class"></a>

<a id="api-4175746f636f6d706c6574652e4c6973742e2470726f70732e7374796c65"></a>

<a id="AutocompleteList-style"></a>

<a id="api-4175746f636f6d706c6574652e4c6973742e2470726f70732e72656e646572"></a>

<a id="AutocompleteList-render"></a>

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

<a id="api-4175746f636f6d706c6574652e4c6973742e50726f7073"></a>

<a id="autocompletelistprops"></a>

<a id="api-4175746f636f6d706c6574652e4c6973742e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Autocomplete.List.Props

Declaration: `packages/solid/build/types/combobox/list/ComboboxList.d.ts:11`

#### Declaration

```typescript
ComboboxListProps
```

<a id="api-4175746f636f6d706c6574652e4c6973742e50726f70732e6368696c6472656e"></a>

<a id="AutocompleteListProps-children"></a>

<a id="api-4175746f636f6d706c6574652e4c6973742e50726f70732e636c617373"></a>

<a id="AutocompleteListProps-class"></a>

<a id="api-4175746f636f6d706c6574652e4c6973742e50726f70732e7374796c65"></a>

<a id="AutocompleteListProps-style"></a>

<a id="api-4175746f636f6d706c6574652e4c6973742e50726f70732e72656e646572"></a>

<a id="AutocompleteListProps-render"></a>

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

<a id="api-4175746f636f6d706c6574652e4c6973742e5374617465"></a>

<a id="autocompleteliststate"></a>

### Related exported type: Autocomplete.List.State

Declaration: `packages/solid/build/types/combobox/list/ComboboxList.d.ts:12`

#### Declaration

```typescript
ComboboxListState
```

<a id="api-4175746f636f6d706c6574652e4c6973742e53746174652e656d707479"></a>

<a id="AutocompleteListState-empty"></a>

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

<a id="api-4175746f636f6d706c6574652e506f7274616c"></a>

<a id="autocompleteportal"></a>

<a id="api-4175746f636f6d706c6574652e506f7274616c2e2470726f70732e70726f703a616c69676e"></a>

### Autocomplete.Portal

Declaration: `packages/solid/build/types/combobox/portal/ComboboxPortal.d.ts:6`

#### Declaration

```typescript
(props: ComboboxPortalProps) => JSX.Element
```

<a id="api-4175746f636f6d706c6574652e506f7274616c2e2470726f70732e706f7274616c4f776e6572526f6c65"></a>

<a id="AutocompletePortal-portalOwnerRole"></a>

<a id="api-4175746f636f6d706c6574652e506f7274616c2e2470726f70732e70726573657276655461624f72646572"></a>

<a id="AutocompletePortal-preserveTabOrder"></a>

<a id="api-4175746f636f6d706c6574652e506f7274616c2e2470726f70732e636f6e7461696e6572"></a>

<a id="AutocompletePortal-container"></a>

<a id="api-4175746f636f6d706c6574652e506f7274616c2e2470726f70732e636c617373"></a>

<a id="AutocompletePortal-class"></a>

<a id="api-4175746f636f6d706c6574652e506f7274616c2e2470726f70732e7374796c65"></a>

<a id="AutocompletePortal-style"></a>

<a id="api-4175746f636f6d706c6574652e506f7274616c2e2470726f70732e6b6565704d6f756e746564"></a>

<a id="AutocompletePortal-keepMounted"></a>

<a id="api-4175746f636f6d706c6574652e506f7274616c2e2470726f70732e72656e646572"></a>

<a id="AutocompletePortal-render"></a>

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

<a id="api-4175746f636f6d706c6574652e506f7274616c2e50726f7073"></a>

<a id="autocompleteportalprops"></a>

<a id="api-4175746f636f6d706c6574652e506f7274616c2e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Autocomplete.Portal.Props

Declaration: `packages/solid/build/types/combobox/portal/ComboboxPortal.d.ts:8`

#### Declaration

```typescript
ComboboxPortalProps
```

<a id="api-4175746f636f6d706c6574652e506f7274616c2e50726f70732e706f7274616c4f776e6572526f6c65"></a>

<a id="AutocompletePortalProps-portalOwnerRole"></a>

<a id="api-4175746f636f6d706c6574652e506f7274616c2e50726f70732e70726573657276655461624f72646572"></a>

<a id="AutocompletePortalProps-preserveTabOrder"></a>

<a id="api-4175746f636f6d706c6574652e506f7274616c2e50726f70732e636f6e7461696e6572"></a>

<a id="AutocompletePortalProps-container"></a>

<a id="api-4175746f636f6d706c6574652e506f7274616c2e50726f70732e636c617373"></a>

<a id="AutocompletePortalProps-class"></a>

<a id="api-4175746f636f6d706c6574652e506f7274616c2e50726f70732e7374796c65"></a>

<a id="AutocompletePortalProps-style"></a>

<a id="api-4175746f636f6d706c6574652e506f7274616c2e50726f70732e6b6565704d6f756e746564"></a>

<a id="AutocompletePortalProps-keepMounted"></a>

<a id="api-4175746f636f6d706c6574652e506f7274616c2e50726f70732e72656e646572"></a>

<a id="AutocompletePortalProps-render"></a>

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

<a id="api-4175746f636f6d706c6574652e506f7274616c2e5374617465"></a>

<a id="autocompleteportalstate"></a>

### Related exported type: Autocomplete.Portal.State

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

<a id="api-4175746f636f6d706c6574652e4261636b64726f70"></a>

<a id="autocompletebackdrop"></a>

<a id="api-4175746f636f6d706c6574652e4261636b64726f702e2470726f70732e70726f703a616c69676e"></a>

### Autocomplete.Backdrop

Declaration: `packages/solid/build/types/combobox/backdrop/ComboboxBackdrop.d.ts:9`

#### Declaration

```typescript
(props: ComboboxBackdropProps) => JSX.Element
```

<a id="api-4175746f636f6d706c6574652e4261636b64726f702e2470726f70732e636c617373"></a>

<a id="AutocompleteBackdrop-class"></a>

<a id="api-4175746f636f6d706c6574652e4261636b64726f702e2470726f70732e7374796c65"></a>

<a id="AutocompleteBackdrop-style"></a>

<a id="api-4175746f636f6d706c6574652e4261636b64726f702e2470726f70732e72656e646572"></a>

<a id="AutocompleteBackdrop-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<AutocompleteBackdropState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AutocompleteBackdropState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, AutocompleteBackdropState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-4175746f636f6d706c6574652e4261636b64726f702e64617461417474726962757465732e6f70656e"></a>

<a id="api-4175746f636f6d706c6574652e4261636b64726f702e64617461417474726962757465732e636c6f736564"></a>

<a id="api-4175746f636f6d706c6574652e4261636b64726f702e64617461417474726962757465732e7374617274696e675374796c65"></a>

<a id="api-4175746f636f6d706c6574652e4261636b64726f702e64617461417474726962757465732e656e64696e675374796c65"></a>

| Name | Description |
| --- | --- |
| data-open |  |
| data-closed |  |
| data-starting-style | Present when transitionStatus is 'starting'. |
| data-ending-style | Present when transitionStatus is 'ending'. |

#### CSS variables

Metadata status: unavailable.

<a id="api-4175746f636f6d706c6574652e4261636b64726f702e50726f7073"></a>

<a id="autocompletebackdropprops"></a>

<a id="api-4175746f636f6d706c6574652e4261636b64726f702e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Autocomplete.Backdrop.Props

Declaration: `packages/solid/build/types/combobox/backdrop/ComboboxBackdrop.d.ts:11`

#### Declaration

```typescript
ComboboxBackdropProps
```

<a id="api-4175746f636f6d706c6574652e4261636b64726f702e50726f70732e636c617373"></a>

<a id="AutocompleteBackdropProps-class"></a>

<a id="api-4175746f636f6d706c6574652e4261636b64726f702e50726f70732e7374796c65"></a>

<a id="AutocompleteBackdropProps-style"></a>

<a id="api-4175746f636f6d706c6574652e4261636b64726f702e50726f70732e72656e646572"></a>

<a id="AutocompleteBackdropProps-render"></a>

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

<a id="api-4175746f636f6d706c6574652e4261636b64726f702e5374617465"></a>

<a id="autocompletebackdropstate"></a>

### Related exported type: Autocomplete.Backdrop.State

Declaration: `packages/solid/build/types/combobox/backdrop/ComboboxBackdrop.d.ts:12`

#### Declaration

```typescript
ComboboxBackdropState
```

<a id="api-4175746f636f6d706c6574652e4261636b64726f702e53746174652e6f70656e"></a>

<a id="AutocompleteBackdropState-open"></a>

<a id="api-4175746f636f6d706c6574652e4261636b64726f702e53746174652e7472616e736974696f6e537461747573"></a>

<a id="AutocompleteBackdropState-transitionStatus"></a>

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

<a id="api-4175746f636f6d706c6574652e506f736974696f6e6572"></a>

<a id="autocompletepositioner"></a>

<a id="api-4175746f636f6d706c6574652e506f736974696f6e65722e2470726f70732e70726f703a616c69676e"></a>

### Autocomplete.Positioner

Declaration: `packages/solid/build/types/combobox/positioner/ComboboxPositioner.d.ts:12`

#### Declaration

```typescript
(props: ComboboxPositionerProps) => JSX.Element
```

<a id="api-4175746f636f6d706c6574652e506f736974696f6e65722e2470726f70732e64697361626c65416e63686f72547261636b696e67"></a>

<a id="AutocompletePositioner-disableAnchorTracking"></a>

<a id="api-4175746f636f6d706c6574652e506f736974696f6e65722e2470726f70732e616c69676e"></a>

<a id="AutocompletePositioner-align"></a>

<a id="api-4175746f636f6d706c6574652e506f736974696f6e65722e2470726f70732e616c69676e4f6666736574"></a>

<a id="AutocompletePositioner-alignOffset"></a>

<a id="api-4175746f636f6d706c6574652e506f736974696f6e65722e2470726f70732e73696465"></a>

<a id="AutocompletePositioner-side"></a>

<a id="api-4175746f636f6d706c6574652e506f736974696f6e65722e2470726f70732e736964654f6666736574"></a>

<a id="AutocompletePositioner-sideOffset"></a>

<a id="api-4175746f636f6d706c6574652e506f736974696f6e65722e2470726f70732e6172726f7750616464696e67"></a>

<a id="AutocompletePositioner-arrowPadding"></a>

<a id="api-4175746f636f6d706c6574652e506f736974696f6e65722e2470726f70732e616e63686f72"></a>

<a id="AutocompletePositioner-anchor"></a>

<a id="api-4175746f636f6d706c6574652e506f736974696f6e65722e2470726f70732e636f6c6c6973696f6e41766f6964616e6365"></a>

<a id="AutocompletePositioner-collisionAvoidance"></a>

<a id="api-4175746f636f6d706c6574652e506f736974696f6e65722e2470726f70732e636f6c6c6973696f6e426f756e64617279"></a>

<a id="AutocompletePositioner-collisionBoundary"></a>

<a id="api-4175746f636f6d706c6574652e506f736974696f6e65722e2470726f70732e636f6c6c6973696f6e50616464696e67"></a>

<a id="AutocompletePositioner-collisionPadding"></a>

<a id="api-4175746f636f6d706c6574652e506f736974696f6e65722e2470726f70732e737469636b79"></a>

<a id="AutocompletePositioner-sticky"></a>

<a id="api-4175746f636f6d706c6574652e506f736974696f6e65722e2470726f70732e706f736974696f6e4d6574686f64"></a>

<a id="AutocompletePositioner-positionMethod"></a>

<a id="api-4175746f636f6d706c6574652e506f736974696f6e65722e2470726f70732e636c617373"></a>

<a id="AutocompletePositioner-class"></a>

<a id="api-4175746f636f6d706c6574652e506f736974696f6e65722e2470726f70732e7374796c65"></a>

<a id="AutocompletePositioner-style"></a>

<a id="api-4175746f636f6d706c6574652e506f736974696f6e65722e2470726f70732e72656e646572"></a>

<a id="AutocompletePositioner-render"></a>

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

<a id="api-4175746f636f6d706c6574652e506f736974696f6e65722e64617461417474726962757465732e6f70656e"></a>

<a id="api-4175746f636f6d706c6574652e506f736974696f6e65722e64617461417474726962757465732e636c6f736564"></a>

<a id="api-4175746f636f6d706c6574652e506f736974696f6e65722e64617461417474726962757465732e616e63686f7248696464656e"></a>

<a id="api-4175746f636f6d706c6574652e506f736974696f6e65722e64617461417474726962757465732e616c69676e"></a>

<a id="api-4175746f636f6d706c6574652e506f736974696f6e65722e64617461417474726962757465732e656d707479"></a>

<a id="api-4175746f636f6d706c6574652e506f736974696f6e65722e64617461417474726962757465732e73696465"></a>

| Name | Description |
| --- | --- |
| data-open |  |
| data-closed |  |
| data-anchor-hidden |  |
| data-align |  |
| data-empty |  |
| data-side |  |

#### CSS variables

<a id="api-4175746f636f6d706c6574652e506f736974696f6e65722e6373735661726961626c65732e616e63686f72486569676874"></a>

<a id="api-4175746f636f6d706c6574652e506f736974696f6e65722e6373735661726961626c65732e616e63686f725769647468"></a>

<a id="api-4175746f636f6d706c6574652e506f736974696f6e65722e6373735661726961626c65732e617661696c61626c65486569676874"></a>

<a id="api-4175746f636f6d706c6574652e506f736974696f6e65722e6373735661726961626c65732e617661696c61626c655769647468"></a>

<a id="api-4175746f636f6d706c6574652e506f736974696f6e65722e6373735661726961626c65732e7472616e73666f726d4f726967696e"></a>

| Name | Description |
| --- | --- |
| --anchor-height |  |
| --anchor-width |  |
| --available-height |  |
| --available-width |  |
| --transform-origin |  |

<a id="api-4175746f636f6d706c6574652e506f736974696f6e65722e50726f7073"></a>

<a id="autocompletepositionerprops"></a>

<a id="api-4175746f636f6d706c6574652e506f736974696f6e65722e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Autocomplete.Positioner.Props

Declaration: `packages/solid/build/types/combobox/positioner/ComboboxPositioner.d.ts:14`

#### Declaration

```typescript
ComboboxPositionerProps
```

<a id="api-4175746f636f6d706c6574652e506f736974696f6e65722e50726f70732e64697361626c65416e63686f72547261636b696e67"></a>

<a id="AutocompletePositionerProps-disableAnchorTracking"></a>

<a id="api-4175746f636f6d706c6574652e506f736974696f6e65722e50726f70732e616c69676e"></a>

<a id="AutocompletePositionerProps-align"></a>

<a id="api-4175746f636f6d706c6574652e506f736974696f6e65722e50726f70732e616c69676e4f6666736574"></a>

<a id="AutocompletePositionerProps-alignOffset"></a>

<a id="api-4175746f636f6d706c6574652e506f736974696f6e65722e50726f70732e73696465"></a>

<a id="AutocompletePositionerProps-side"></a>

<a id="api-4175746f636f6d706c6574652e506f736974696f6e65722e50726f70732e736964654f6666736574"></a>

<a id="AutocompletePositionerProps-sideOffset"></a>

<a id="api-4175746f636f6d706c6574652e506f736974696f6e65722e50726f70732e6172726f7750616464696e67"></a>

<a id="AutocompletePositionerProps-arrowPadding"></a>

<a id="api-4175746f636f6d706c6574652e506f736974696f6e65722e50726f70732e616e63686f72"></a>

<a id="AutocompletePositionerProps-anchor"></a>

<a id="api-4175746f636f6d706c6574652e506f736974696f6e65722e50726f70732e636f6c6c6973696f6e41766f6964616e6365"></a>

<a id="AutocompletePositionerProps-collisionAvoidance"></a>

<a id="api-4175746f636f6d706c6574652e506f736974696f6e65722e50726f70732e636f6c6c6973696f6e426f756e64617279"></a>

<a id="AutocompletePositionerProps-collisionBoundary"></a>

<a id="api-4175746f636f6d706c6574652e506f736974696f6e65722e50726f70732e636f6c6c6973696f6e50616464696e67"></a>

<a id="AutocompletePositionerProps-collisionPadding"></a>

<a id="api-4175746f636f6d706c6574652e506f736974696f6e65722e50726f70732e737469636b79"></a>

<a id="AutocompletePositionerProps-sticky"></a>

<a id="api-4175746f636f6d706c6574652e506f736974696f6e65722e50726f70732e706f736974696f6e4d6574686f64"></a>

<a id="AutocompletePositionerProps-positionMethod"></a>

<a id="api-4175746f636f6d706c6574652e506f736974696f6e65722e50726f70732e636c617373"></a>

<a id="AutocompletePositionerProps-class"></a>

<a id="api-4175746f636f6d706c6574652e506f736974696f6e65722e50726f70732e7374796c65"></a>

<a id="AutocompletePositionerProps-style"></a>

<a id="api-4175746f636f6d706c6574652e506f736974696f6e65722e50726f70732e72656e646572"></a>

<a id="AutocompletePositionerProps-render"></a>

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

<a id="api-4175746f636f6d706c6574652e506f736974696f6e65722e5374617465"></a>

<a id="autocompletepositionerstate"></a>

### Related exported type: Autocomplete.Positioner.State

Declaration: `packages/solid/build/types/combobox/positioner/ComboboxPositioner.d.ts:15`

#### Declaration

```typescript
ComboboxPositionerState
```

<a id="api-4175746f636f6d706c6574652e506f736974696f6e65722e53746174652e6f70656e"></a>

<a id="AutocompletePositionerState-open"></a>

<a id="api-4175746f636f6d706c6574652e506f736974696f6e65722e53746174652e616e63686f7248696464656e"></a>

<a id="AutocompletePositionerState-anchorHidden"></a>

<a id="api-4175746f636f6d706c6574652e506f736974696f6e65722e53746174652e656d707479"></a>

<a id="AutocompletePositionerState-empty"></a>

<a id="api-4175746f636f6d706c6574652e506f736974696f6e65722e53746174652e616c69676e"></a>

<a id="AutocompletePositionerState-align"></a>

<a id="api-4175746f636f6d706c6574652e506f736974696f6e65722e53746174652e73696465"></a>

<a id="AutocompletePositionerState-side"></a>

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

<a id="api-4175746f636f6d706c6574652e506f707570"></a>

<a id="autocompletepopup"></a>

<a id="api-4175746f636f6d706c6574652e506f7075702e2470726f70732e70726f703a616c69676e"></a>

### Autocomplete.Popup

Declaration: `packages/solid/build/types/combobox/popup/ComboboxPopup.d.ts:17`

#### Declaration

```typescript
(props: ComboboxPopupProps) => JSX.Element
```

<a id="api-4175746f636f6d706c6574652e506f7075702e2470726f70732e696e697469616c466f637573"></a>

<a id="AutocompletePopup-initialFocus"></a>

<a id="api-4175746f636f6d706c6574652e506f7075702e2470726f70732e66696e616c466f637573"></a>

<a id="AutocompletePopup-finalFocus"></a>

<a id="api-4175746f636f6d706c6574652e506f7075702e2470726f70732e636c617373"></a>

<a id="AutocompletePopup-class"></a>

<a id="api-4175746f636f6d706c6574652e506f7075702e2470726f70732e7374796c65"></a>

<a id="AutocompletePopup-style"></a>

<a id="api-4175746f636f6d706c6574652e506f7075702e2470726f70732e72656e646572"></a>

<a id="AutocompletePopup-render"></a>

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

<a id="api-4175746f636f6d706c6574652e506f7075702e64617461417474726962757465732e6f70656e"></a>

<a id="api-4175746f636f6d706c6574652e506f7075702e64617461417474726962757465732e636c6f736564"></a>

<a id="api-4175746f636f6d706c6574652e506f7075702e64617461417474726962757465732e616e63686f7248696464656e"></a>

<a id="api-4175746f636f6d706c6574652e506f7075702e64617461417474726962757465732e616c69676e"></a>

<a id="api-4175746f636f6d706c6574652e506f7075702e64617461417474726962757465732e656d707479"></a>

<a id="api-4175746f636f6d706c6574652e506f7075702e64617461417474726962757465732e73696465"></a>

<a id="api-4175746f636f6d706c6574652e506f7075702e64617461417474726962757465732e7374617274696e675374796c65"></a>

<a id="api-4175746f636f6d706c6574652e506f7075702e64617461417474726962757465732e656e64696e675374796c65"></a>

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

<a id="api-4175746f636f6d706c6574652e506f7075702e50726f7073"></a>

<a id="autocompletepopupprops"></a>

<a id="api-4175746f636f6d706c6574652e506f7075702e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Autocomplete.Popup.Props

Declaration: `packages/solid/build/types/combobox/popup/ComboboxPopup.d.ts:19`

#### Declaration

```typescript
ComboboxPopupProps
```

<a id="api-4175746f636f6d706c6574652e506f7075702e50726f70732e696e697469616c466f637573"></a>

<a id="AutocompletePopupProps-initialFocus"></a>

<a id="api-4175746f636f6d706c6574652e506f7075702e50726f70732e66696e616c466f637573"></a>

<a id="AutocompletePopupProps-finalFocus"></a>

<a id="api-4175746f636f6d706c6574652e506f7075702e50726f70732e636c617373"></a>

<a id="AutocompletePopupProps-class"></a>

<a id="api-4175746f636f6d706c6574652e506f7075702e50726f70732e7374796c65"></a>

<a id="AutocompletePopupProps-style"></a>

<a id="api-4175746f636f6d706c6574652e506f7075702e50726f70732e72656e646572"></a>

<a id="AutocompletePopupProps-render"></a>

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

<a id="api-4175746f636f6d706c6574652e506f7075702e5374617465"></a>

<a id="autocompletepopupstate"></a>

### Related exported type: Autocomplete.Popup.State

Declaration: `packages/solid/build/types/combobox/popup/ComboboxPopup.d.ts:20`

#### Declaration

```typescript
ComboboxPopupState
```

<a id="api-4175746f636f6d706c6574652e506f7075702e53746174652e6f70656e"></a>

<a id="AutocompletePopupState-open"></a>

<a id="api-4175746f636f6d706c6574652e506f7075702e53746174652e616e63686f7248696464656e"></a>

<a id="AutocompletePopupState-anchorHidden"></a>

<a id="api-4175746f636f6d706c6574652e506f7075702e53746174652e656d707479"></a>

<a id="AutocompletePopupState-empty"></a>

<a id="api-4175746f636f6d706c6574652e506f7075702e53746174652e7472616e736974696f6e537461747573"></a>

<a id="AutocompletePopupState-transitionStatus"></a>

<a id="api-4175746f636f6d706c6574652e506f7075702e53746174652e616c69676e"></a>

<a id="AutocompletePopupState-align"></a>

<a id="api-4175746f636f6d706c6574652e506f7075702e53746174652e73696465"></a>

<a id="AutocompletePopupState-side"></a>

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

<a id="api-4175746f636f6d706c6574652e4172726f77"></a>

<a id="autocompletearrow"></a>

<a id="api-4175746f636f6d706c6574652e4172726f772e2470726f70732e70726f703a616c69676e"></a>

### Autocomplete.Arrow

Declaration: `packages/solid/build/types/combobox/arrow/ComboboxArrow.d.ts:11`

#### Declaration

```typescript
(props: ComboboxArrowProps) => JSX.Element
```

<a id="api-4175746f636f6d706c6574652e4172726f772e2470726f70732e636c617373"></a>

<a id="AutocompleteArrow-class"></a>

<a id="api-4175746f636f6d706c6574652e4172726f772e2470726f70732e7374796c65"></a>

<a id="AutocompleteArrow-style"></a>

<a id="api-4175746f636f6d706c6574652e4172726f772e2470726f70732e72656e646572"></a>

<a id="AutocompleteArrow-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<AutocompleteArrowState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AutocompleteArrowState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, AutocompleteArrowState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-4175746f636f6d706c6574652e4172726f772e64617461417474726962757465732e6f70656e"></a>

<a id="api-4175746f636f6d706c6574652e4172726f772e64617461417474726962757465732e636c6f736564"></a>

<a id="api-4175746f636f6d706c6574652e4172726f772e64617461417474726962757465732e756e63656e7465726564"></a>

<a id="api-4175746f636f6d706c6574652e4172726f772e64617461417474726962757465732e616c69676e"></a>

<a id="api-4175746f636f6d706c6574652e4172726f772e64617461417474726962757465732e73696465"></a>

| Name | Description |
| --- | --- |
| data-open |  |
| data-closed |  |
| data-uncentered |  |
| data-align |  |
| data-side |  |

#### CSS variables

Metadata status: unavailable.

<a id="api-4175746f636f6d706c6574652e4172726f772e50726f7073"></a>

<a id="autocompletearrowprops"></a>

<a id="api-4175746f636f6d706c6574652e4172726f772e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Autocomplete.Arrow.Props

Declaration: `packages/solid/build/types/combobox/arrow/ComboboxArrow.d.ts:13`

#### Declaration

```typescript
ComboboxArrowProps
```

<a id="api-4175746f636f6d706c6574652e4172726f772e50726f70732e636c617373"></a>

<a id="AutocompleteArrowProps-class"></a>

<a id="api-4175746f636f6d706c6574652e4172726f772e50726f70732e7374796c65"></a>

<a id="AutocompleteArrowProps-style"></a>

<a id="api-4175746f636f6d706c6574652e4172726f772e50726f70732e72656e646572"></a>

<a id="AutocompleteArrowProps-render"></a>

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

<a id="api-4175746f636f6d706c6574652e4172726f772e5374617465"></a>

<a id="autocompletearrowstate"></a>

### Related exported type: Autocomplete.Arrow.State

Declaration: `packages/solid/build/types/combobox/arrow/ComboboxArrow.d.ts:14`

#### Declaration

```typescript
ComboboxArrowState
```

<a id="api-4175746f636f6d706c6574652e4172726f772e53746174652e6f70656e"></a>

<a id="AutocompleteArrowState-open"></a>

<a id="api-4175746f636f6d706c6574652e4172726f772e53746174652e756e63656e7465726564"></a>

<a id="AutocompleteArrowState-uncentered"></a>

<a id="api-4175746f636f6d706c6574652e4172726f772e53746174652e616c69676e"></a>

<a id="AutocompleteArrowState-align"></a>

<a id="api-4175746f636f6d706c6574652e4172726f772e53746174652e73696465"></a>

<a id="AutocompleteArrowState-side"></a>

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

<a id="api-4175746f636f6d706c6574652e537461747573"></a>

<a id="autocompletestatus"></a>

<a id="api-4175746f636f6d706c6574652e5374617475732e2470726f70732e70726f703a616c69676e"></a>

### Autocomplete.Status

Declaration: `packages/solid/build/types/combobox/status/ComboboxStatus.d.ts:6`

#### Declaration

```typescript
(props: ComboboxStatusProps) => JSX.Element
```

<a id="api-4175746f636f6d706c6574652e5374617475732e2470726f70732e636c617373"></a>

<a id="AutocompleteStatus-class"></a>

<a id="api-4175746f636f6d706c6574652e5374617475732e2470726f70732e7374796c65"></a>

<a id="AutocompleteStatus-style"></a>

<a id="api-4175746f636f6d706c6574652e5374617475732e2470726f70732e72656e646572"></a>

<a id="AutocompleteStatus-render"></a>

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

<a id="api-4175746f636f6d706c6574652e5374617475732e50726f7073"></a>

<a id="autocompletestatusprops"></a>

<a id="api-4175746f636f6d706c6574652e5374617475732e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Autocomplete.Status.Props

Declaration: `packages/solid/build/types/combobox/status/ComboboxStatus.d.ts:8`

#### Declaration

```typescript
ComboboxStatusProps
```

<a id="api-4175746f636f6d706c6574652e5374617475732e50726f70732e636c617373"></a>

<a id="AutocompleteStatusProps-class"></a>

<a id="api-4175746f636f6d706c6574652e5374617475732e50726f70732e7374796c65"></a>

<a id="AutocompleteStatusProps-style"></a>

<a id="api-4175746f636f6d706c6574652e5374617475732e50726f70732e72656e646572"></a>

<a id="AutocompleteStatusProps-render"></a>

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

<a id="api-4175746f636f6d706c6574652e5374617475732e5374617465"></a>

<a id="autocompletestatusstate"></a>

### Related exported type: Autocomplete.Status.State

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

<a id="api-4175746f636f6d706c6574652e456d707479"></a>

<a id="autocompleteempty"></a>

<a id="api-4175746f636f6d706c6574652e456d7074792e2470726f70732e70726f703a616c69676e"></a>

### Autocomplete.Empty

Declaration: `packages/solid/build/types/combobox/empty/ComboboxEmpty.d.ts:6`

#### Declaration

```typescript
(props: ComboboxEmptyProps) => JSX.Element
```

<a id="api-4175746f636f6d706c6574652e456d7074792e2470726f70732e636c617373"></a>

<a id="AutocompleteEmpty-class"></a>

<a id="api-4175746f636f6d706c6574652e456d7074792e2470726f70732e7374796c65"></a>

<a id="AutocompleteEmpty-style"></a>

<a id="api-4175746f636f6d706c6574652e456d7074792e2470726f70732e72656e646572"></a>

<a id="AutocompleteEmpty-render"></a>

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

<a id="api-4175746f636f6d706c6574652e456d7074792e50726f7073"></a>

<a id="autocompleteemptyprops"></a>

<a id="api-4175746f636f6d706c6574652e456d7074792e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Autocomplete.Empty.Props

Declaration: `packages/solid/build/types/combobox/empty/ComboboxEmpty.d.ts:8`

#### Declaration

```typescript
ComboboxEmptyProps
```

<a id="api-4175746f636f6d706c6574652e456d7074792e50726f70732e636c617373"></a>

<a id="AutocompleteEmptyProps-class"></a>

<a id="api-4175746f636f6d706c6574652e456d7074792e50726f70732e7374796c65"></a>

<a id="AutocompleteEmptyProps-style"></a>

<a id="api-4175746f636f6d706c6574652e456d7074792e50726f70732e72656e646572"></a>

<a id="AutocompleteEmptyProps-render"></a>

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

<a id="api-4175746f636f6d706c6574652e456d7074792e5374617465"></a>

<a id="autocompleteemptystate"></a>

### Related exported type: Autocomplete.Empty.State

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

<a id="api-4175746f636f6d706c6574652e436f6c6c656374696f6e"></a>

<a id="autocompletecollection"></a>

### Autocomplete.Collection

Declaration: `packages/solid/build/types/combobox/collection/ComboboxCollection.d.ts:7`

#### Declaration

```typescript
(props: ComboboxCollectionProps) => JSX.Element
```

<a id="api-4175746f636f6d706c6574652e436f6c6c656374696f6e2e2470726f70732e6368696c6472656e"></a>

<a id="AutocompleteCollection-children"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| children | `(item: any, index: number) => JSX.Element` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4175746f636f6d706c6574652e436f6c6c656374696f6e2e50726f7073"></a>

<a id="autocompletecollectionprops"></a>

### Related exported type: Autocomplete.Collection.Props

Declaration: `packages/solid/build/types/combobox/collection/ComboboxCollection.d.ts:9`

#### Declaration

```typescript
ComboboxCollectionProps
```

<a id="api-4175746f636f6d706c6574652e436f6c6c656374696f6e2e50726f70732e6368696c6472656e"></a>

<a id="AutocompleteCollectionProps-children"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| children | `(item: any, index: number) => JSX.Element` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4175746f636f6d706c6574652e436f6c6c656374696f6e2e5374617465"></a>

<a id="autocompletecollectionstate"></a>

### Related exported type: Autocomplete.Collection.State

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

<a id="api-4175746f636f6d706c6574652e526f77"></a>

<a id="autocompleterow"></a>

<a id="api-4175746f636f6d706c6574652e526f772e2470726f70732e70726f703a616c69676e"></a>

### Autocomplete.Row

Declaration: `packages/solid/build/types/combobox/row/ComboboxRow.d.ts:6`

#### Declaration

```typescript
(props: ComboboxRowProps) => JSX.Element
```

<a id="api-4175746f636f6d706c6574652e526f772e2470726f70732e636c617373"></a>

<a id="AutocompleteRow-class"></a>

<a id="api-4175746f636f6d706c6574652e526f772e2470726f70732e7374796c65"></a>

<a id="AutocompleteRow-style"></a>

<a id="api-4175746f636f6d706c6574652e526f772e2470726f70732e72656e646572"></a>

<a id="AutocompleteRow-render"></a>

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

<a id="api-4175746f636f6d706c6574652e526f772e50726f7073"></a>

<a id="autocompleterowprops"></a>

<a id="api-4175746f636f6d706c6574652e526f772e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Autocomplete.Row.Props

Declaration: `packages/solid/build/types/combobox/row/ComboboxRow.d.ts:8`

#### Declaration

```typescript
ComboboxRowProps
```

<a id="api-4175746f636f6d706c6574652e526f772e50726f70732e636c617373"></a>

<a id="AutocompleteRowProps-class"></a>

<a id="api-4175746f636f6d706c6574652e526f772e50726f70732e7374796c65"></a>

<a id="AutocompleteRowProps-style"></a>

<a id="api-4175746f636f6d706c6574652e526f772e50726f70732e72656e646572"></a>

<a id="AutocompleteRowProps-render"></a>

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

<a id="api-4175746f636f6d706c6574652e526f772e5374617465"></a>

<a id="autocompleterowstate"></a>

### Related exported type: Autocomplete.Row.State

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

<a id="api-4175746f636f6d706c6574652e4974656d"></a>

<a id="autocompleteitem"></a>

<a id="api-4175746f636f6d706c6574652e4974656d2e2470726f70732e70726f703a616c69676e"></a>

### Autocomplete.Item

Same runtime part; the none-mode API deliberately omits selected state.

Declaration: `packages/solid/build/types/autocomplete/item/AutocompleteItem.d.ts:13`

#### Declaration

```typescript
AutocompleteItem
```

<a id="api-4175746f636f6d706c6574652e4974656d2e2470726f70732e76616c7565"></a>

<a id="AutocompleteItem-value"></a>

<a id="api-4175746f636f6d706c6574652e4974656d2e2470726f70732e696e646578"></a>

<a id="AutocompleteItem-index"></a>

<a id="api-4175746f636f6d706c6574652e4974656d2e2470726f70732e6e6174697665427574746f6e"></a>

<a id="AutocompleteItem-nativeButton"></a>

<a id="api-4175746f636f6d706c6574652e4974656d2e2470726f70732e64697361626c6564"></a>

<a id="AutocompleteItem-disabled"></a>

<a id="api-4175746f636f6d706c6574652e4974656d2e2470726f70732e636c617373"></a>

<a id="AutocompleteItem-class"></a>

<a id="api-4175746f636f6d706c6574652e4974656d2e2470726f70732e7374796c65"></a>

<a id="AutocompleteItem-style"></a>

<a id="api-4175746f636f6d706c6574652e4974656d2e2470726f70732e72656e646572"></a>

<a id="AutocompleteItem-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| value | `any` | No | Unavailable |  |
| index | `number \| undefined` | No | Unavailable |  |
| nativeButton | `boolean \| undefined` | No | Unavailable |  |
| disabled | `boolean \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<AutocompleteItemState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AutocompleteItemState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, AutocompleteItemState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-4175746f636f6d706c6574654974656d44617461417474726962757465732e686967686c696768746564"></a>

<a id="api-4175746f636f6d706c6574654974656d44617461417474726962757465732e64697361626c6564"></a>

| Name | Description |
| --- | --- |
| data-highlighted |  |
| data-disabled |  |

#### CSS variables

Metadata status: unavailable.

<a id="api-4175746f636f6d706c6574652e4974656d2e50726f7073"></a>

<a id="autocompleteitemprops"></a>

<a id="api-4175746f636f6d706c6574652e4974656d2e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Autocomplete.Item.Props

Declaration: `packages/solid/build/types/autocomplete/item/AutocompleteItem.d.ts:15`

#### Declaration

```typescript
AutocompleteItemProps
```

<a id="api-4175746f636f6d706c6574652e4974656d2e50726f70732e76616c7565"></a>

<a id="AutocompleteItemProps-value"></a>

<a id="api-4175746f636f6d706c6574652e4974656d2e50726f70732e696e646578"></a>

<a id="AutocompleteItemProps-index"></a>

<a id="api-4175746f636f6d706c6574652e4974656d2e50726f70732e6e6174697665427574746f6e"></a>

<a id="AutocompleteItemProps-nativeButton"></a>

<a id="api-4175746f636f6d706c6574652e4974656d2e50726f70732e64697361626c6564"></a>

<a id="AutocompleteItemProps-disabled"></a>

<a id="api-4175746f636f6d706c6574652e4974656d2e50726f70732e636c617373"></a>

<a id="AutocompleteItemProps-class"></a>

<a id="api-4175746f636f6d706c6574652e4974656d2e50726f70732e7374796c65"></a>

<a id="AutocompleteItemProps-style"></a>

<a id="api-4175746f636f6d706c6574652e4974656d2e50726f70732e72656e646572"></a>

<a id="AutocompleteItemProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| value | `any` | No | Unavailable |  |
| index | `number \| undefined` | No | Unavailable |  |
| nativeButton | `boolean \| undefined` | No | Unavailable |  |
| disabled | `boolean \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<AutocompleteItemState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AutocompleteItemState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, AutocompleteItemState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4175746f636f6d706c6574652e4974656d2e5374617465"></a>

<a id="autocompleteitemstate"></a>

### Related exported type: Autocomplete.Item.State

Declaration: `packages/solid/build/types/autocomplete/item/AutocompleteItem.d.ts:16`

#### Declaration

```typescript
AutocompleteItemState
```

<a id="api-4175746f636f6d706c6574652e4974656d2e53746174652e686967686c696768746564"></a>

<a id="AutocompleteItemState-highlighted"></a>

<a id="api-4175746f636f6d706c6574652e4974656d2e53746174652e64697361626c6564"></a>

<a id="AutocompleteItemState-disabled"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| highlighted | `boolean` | Yes | Unavailable |  |
| disabled | `boolean` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="group"></a>

### Group

<a id="api-4175746f636f6d706c6574652e47726f7570"></a>

<a id="autocompletegroup"></a>

<a id="api-4175746f636f6d706c6574652e47726f75702e2470726f70732e70726f703a616c69676e"></a>

### Autocomplete.Group

Declaration: `packages/solid/build/types/combobox/group/ComboboxGroup.d.ts:7`

#### Declaration

```typescript
(props: ComboboxGroupProps) => JSX.Element
```

<a id="api-4175746f636f6d706c6574652e47726f75702e2470726f70732e6974656d73"></a>

<a id="AutocompleteGroup-items"></a>

<a id="api-4175746f636f6d706c6574652e47726f75702e2470726f70732e636c617373"></a>

<a id="AutocompleteGroup-class"></a>

<a id="api-4175746f636f6d706c6574652e47726f75702e2470726f70732e7374796c65"></a>

<a id="AutocompleteGroup-style"></a>

<a id="api-4175746f636f6d706c6574652e47726f75702e2470726f70732e72656e646572"></a>

<a id="AutocompleteGroup-render"></a>

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

<a id="api-4175746f636f6d706c6574652e47726f75702e50726f7073"></a>

<a id="autocompletegroupprops"></a>

<a id="api-4175746f636f6d706c6574652e47726f75702e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Autocomplete.Group.Props

Declaration: `packages/solid/build/types/combobox/group/ComboboxGroup.d.ts:9`

#### Declaration

```typescript
ComboboxGroupProps
```

<a id="api-4175746f636f6d706c6574652e47726f75702e50726f70732e6974656d73"></a>

<a id="AutocompleteGroupProps-items"></a>

<a id="api-4175746f636f6d706c6574652e47726f75702e50726f70732e636c617373"></a>

<a id="AutocompleteGroupProps-class"></a>

<a id="api-4175746f636f6d706c6574652e47726f75702e50726f70732e7374796c65"></a>

<a id="AutocompleteGroupProps-style"></a>

<a id="api-4175746f636f6d706c6574652e47726f75702e50726f70732e72656e646572"></a>

<a id="AutocompleteGroupProps-render"></a>

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

<a id="api-4175746f636f6d706c6574652e47726f75702e5374617465"></a>

<a id="autocompletegroupstate"></a>

### Related exported type: Autocomplete.Group.State

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

<a id="api-4175746f636f6d706c6574652e47726f75704c6162656c"></a>

<a id="autocompletegrouplabel"></a>

<a id="api-4175746f636f6d706c6574652e47726f75704c6162656c2e2470726f70732e70726f703a616c69676e"></a>

### Autocomplete.GroupLabel

Declaration: `packages/solid/build/types/combobox/group-label/ComboboxGroupLabel.d.ts:6`

#### Declaration

```typescript
(props: ComboboxGroupLabelProps) => JSX.Element
```

<a id="api-4175746f636f6d706c6574652e47726f75704c6162656c2e2470726f70732e636c617373"></a>

<a id="AutocompleteGroupLabel-class"></a>

<a id="api-4175746f636f6d706c6574652e47726f75704c6162656c2e2470726f70732e7374796c65"></a>

<a id="AutocompleteGroupLabel-style"></a>

<a id="api-4175746f636f6d706c6574652e47726f75704c6162656c2e2470726f70732e72656e646572"></a>

<a id="AutocompleteGroupLabel-render"></a>

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

<a id="api-4175746f636f6d706c6574652e47726f75704c6162656c2e50726f7073"></a>

<a id="autocompletegrouplabelprops"></a>

<a id="api-4175746f636f6d706c6574652e47726f75704c6162656c2e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Autocomplete.GroupLabel.Props

Declaration: `packages/solid/build/types/combobox/group-label/ComboboxGroupLabel.d.ts:8`

#### Declaration

```typescript
ComboboxGroupLabelProps
```

<a id="api-4175746f636f6d706c6574652e47726f75704c6162656c2e50726f70732e636c617373"></a>

<a id="AutocompleteGroupLabelProps-class"></a>

<a id="api-4175746f636f6d706c6574652e47726f75704c6162656c2e50726f70732e7374796c65"></a>

<a id="AutocompleteGroupLabelProps-style"></a>

<a id="api-4175746f636f6d706c6574652e47726f75704c6162656c2e50726f70732e72656e646572"></a>

<a id="AutocompleteGroupLabelProps-render"></a>

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

<a id="api-4175746f636f6d706c6574652e47726f75704c6162656c2e5374617465"></a>

<a id="autocompletegrouplabelstate"></a>

### Related exported type: Autocomplete.GroupLabel.State

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

<a id="api-4175746f636f6d706c6574652e536570617261746f72"></a>

<a id="autocompleteseparator"></a>

<a id="api-4175746f636f6d706c6574652e536570617261746f722e2470726f70732e70726f703a616c69676e"></a>

### Autocomplete.Separator

Declaration: `packages/solid/build/types/autocomplete/separator/AutocompleteSeparator.d.ts:9`

#### Declaration

```typescript
(props: AutocompleteSeparatorProps) => JSX.Element
```

<a id="api-4175746f636f6d706c6574652e536570617261746f722e2470726f70732e6f7269656e746174696f6e"></a>

<a id="AutocompleteSeparator-orientation"></a>

<a id="api-4175746f636f6d706c6574652e536570617261746f722e2470726f70732e636c617373"></a>

<a id="AutocompleteSeparator-class"></a>

<a id="api-4175746f636f6d706c6574652e536570617261746f722e2470726f70732e7374796c65"></a>

<a id="AutocompleteSeparator-style"></a>

<a id="api-4175746f636f6d706c6574652e536570617261746f722e2470726f70732e72656e646572"></a>

<a id="AutocompleteSeparator-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| orientation | `Orientation \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<AutocompleteSeparatorState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AutocompleteSeparatorState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, AutocompleteSeparatorState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-4175746f636f6d706c657465536570617261746f7244617461417474726962757465732e6f7269656e746174696f6e"></a>

| Name | Description |
| --- | --- |
| data-orientation | Indicates the orientation of the separator. |

#### CSS variables

Metadata status: unavailable.

<a id="api-4175746f636f6d706c6574652e536570617261746f722e50726f7073"></a>

<a id="autocompleteseparatorprops"></a>

<a id="api-4175746f636f6d706c6574652e536570617261746f722e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Autocomplete.Separator.Props

Declaration: `packages/solid/build/types/autocomplete/separator/AutocompleteSeparator.d.ts:11`

#### Declaration

```typescript
AutocompleteSeparatorProps
```

<a id="api-4175746f636f6d706c6574652e536570617261746f722e50726f70732e6f7269656e746174696f6e"></a>

<a id="AutocompleteSeparatorProps-orientation"></a>

<a id="api-4175746f636f6d706c6574652e536570617261746f722e50726f70732e636c617373"></a>

<a id="AutocompleteSeparatorProps-class"></a>

<a id="api-4175746f636f6d706c6574652e536570617261746f722e50726f70732e7374796c65"></a>

<a id="AutocompleteSeparatorProps-style"></a>

<a id="api-4175746f636f6d706c6574652e536570617261746f722e50726f70732e72656e646572"></a>

<a id="AutocompleteSeparatorProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| orientation | `Orientation \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<AutocompleteSeparatorState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AutocompleteSeparatorState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, AutocompleteSeparatorState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4175746f636f6d706c6574652e536570617261746f722e5374617465"></a>

<a id="autocompleteseparatorstate"></a>

### Related exported type: Autocomplete.Separator.State

Declaration: `packages/solid/build/types/autocomplete/separator/AutocompleteSeparator.d.ts:12`

#### Declaration

```typescript
AutocompleteSeparatorState
```

<a id="api-4175746f636f6d706c6574652e536570617261746f722e53746174652e6f7269656e746174696f6e"></a>

<a id="AutocompleteSeparatorState-orientation"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| orientation | `Orientation` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="usefilter"></a>

## useFilter

Matches items against a query using `Intl.Collator` for robust string matching.
This utility is used when externally filtering items.

<a id="api-4175746f636f6d706c6574652e75736546696c746572"></a>

<a id="autocompleteusefilter"></a>

### Autocomplete.useFilter

Declaration: `packages/solid/build/types/combobox/root/utils/useFilter.d.ts:8`

#### Declaration

```typescript
(options?: GetFilterParameters) => Filter
```

<a id="api-4175746f636f6d706c6574652e75736546696c7465722e24706172616d65746572732e6f7074696f6e73"></a>

<a id="AutocompleteuseFilter-options"></a>

#### Parameters

| Parameter | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| options | `GetFilterParameters \| undefined` | No | Unavailable |  |

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

Returns the internally filtered items when called inside `<Autocomplete.Root>`.

<a id="api-4175746f636f6d706c6574652e75736546696c74657265644974656d73"></a>

<a id="autocompleteusefiltereditems"></a>

### Autocomplete.useFilteredItems

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

