# Autocomplete

An input that suggests options as you type.



[Interactive example](/solid/components/autocomplete)

## Usage guidelines

- **Avoid when selection state is needed**: Use [Combobox](/solid/components/combobox) instead of Autocomplete if the selection should be remembered and the input value cannot be custom. Unlike Combobox, Autocomplete's input can contain free-form text, as its suggestions only *optionally* autocomplete the text.
- **Can be used for filterable command pickers**: The input can be used as a filter for command items that perform an action when clicked when rendered inside the popup.
- **Form controls must have an accessible name**: It can be created using a `<label>` element or the `Field` component. See the [forms guide](/solid/handbook/forms).
- **Closing animations**: The popup stays rendered until its closing animation finishes. See [JavaScript animations](/solid/handbook/animation#javascript-animations) for animating it with Motion and for manual control.

## Anatomy

Import the components and place them together:

```tsx
import { Autocomplete } from 'baseui-solid2/autocomplete';
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

## Item values

Each `<Autocomplete.Item>` takes a `value` prop identifying it. Pass the item being rendered, so that props like `itemToStringValue` receive it.

## Examples

### Async search

Load items asynchronously while typing and render custom status content.

[Interactive example](/solid/components/autocomplete)

### Inline autocomplete

Autofill the input with the highlighted item while navigating with arrow keys using the `mode` prop. Accepts `aria-autocomplete` values `list`, `both`, `inline`, or `none`.

[Interactive example](/solid/components/autocomplete)

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

[Interactive example](/solid/components/autocomplete)

### Fuzzy matching

Use fuzzy matching to find relevant results even when the query doesn't exactly match the item text.

[Interactive example](/solid/components/autocomplete)

### Limit results

Limit the number of visible items using the `limit` prop and guide users to refine their query using `<Autocomplete.Status>`.

[Interactive example](/solid/components/autocomplete)

### Auto highlight

The first matching item can be automatically highlighted as the user types by specifying the `autoHighlight` prop on `<Autocomplete.Root>`. Set the prop's value to `"always"` if the highlight should always be present, such as when the list is rendered inline within a dialog.

The prop can be combined with the `keepHighlight` and `highlightItemOnHover` props to configure how the highlight behaves during mouse interactions.

[Interactive example](/solid/components/autocomplete)

### Command palette

Use the autocomplete input to filter a list of command items that perform an action when clicked.

[Interactive example](/solid/components/autocomplete)

### Custom keyboard shortcuts

Use `actionsRef.highlightItem()` to navigate the open list with custom keyboard shortcuts. This example binds Ctrl

+N

 to the next item and Ctrl

+P

 to the previous item.

[Interactive example](/solid/components/autocomplete)

Navigation wraps between the first and last items unless `loopFocus` is disabled. Unlike arrow-key navigation, these shortcuts do not return the highlight to the input.

### Grid layout

Display items in a grid layout, wrapping each row in `<Autocomplete.Row>` components.

[Interactive example](/solid/components/autocomplete)

### Virtualized

Efficiently handle large datasets using a virtualization library like `@tanstack/solid-virtual`.

[Interactive example](/solid/components/autocomplete)

When using `highlightItem()`, scroll your virtualizer to the index reported by `onItemHighlighted` for the `'imperative-action'` reason. The highlighted item may not be rendered yet.

#### Memoizing items

Solid components execute once per mount. The upstream React example uses [`React.memo`](https://react.dev/reference/react/memo); in Solid, read the item through props inside JSX. This does not reduce the initial mount cost: with a large enough number of items, the mount cost dominates, and virtualization becomes necessary to keep the open interaction fast on low-end devices.

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

## API reference

### Root

Groups the autocomplete parts without rendering an element.

| Prop | Type | Description |
| --- | --- | --- |
| name | string \| undefined |  |
| defaultValue | AriaComboboxInputValue \| undefined | The initial, uncontrolled input text. |
| value | AriaComboboxInputValue \| undefined | Controlled input text, not a selected item. |
| onValueChange | ((value: string, details: AutocompleteRootChangeEventDetails) => void) \| undefined |  |
| defaultOpen | boolean \| undefined |  |
| open | boolean \| undefined |  |
| onOpenChange | ((open: boolean, details: AutocompleteRootOpenChangeEventDetails) => void) \| undefined |  |
| autoHighlight | boolean \| "always" \| undefined |  |
| keepHighlight | boolean \| undefined |  |
| highlightItemOnHover | boolean \| undefined |  |
| actionsRef | { current: AriaCombobox.Actions \| null; } \| ((actions: AriaCombobox.Actions \| null) => void) \| undefined |  |
| filter | ((item: Items[number]["items"][number], query: string, itemToString?: ((item: Items[number]["items"][number]) => string) \| undefined) => boolean) \| null \| undefined |  |
| filteredItems | readonly Items[number]["items"][number][] \| readonly Group<Items[number]["items"][number]>[] \| undefined | Externally filtered items, retaining the structure of `items`. |
| form | string \| undefined |  |
| grid | boolean \| undefined |  |
| inline | boolean \| undefined |  |
| itemToStringValue | ((item: Items[number]["items"][number]) => string) \| undefined | Converts an item to text for both display and submission. |
| items | Items |  |
| limit | number \| undefined |  |
| locale | Intl.LocalesArgument |  |
| loopFocus | boolean \| undefined |  |
| modal | boolean \| undefined |  |
| mode | "inline" \| "none" \| "both" \| "list" \| undefined | list filters; both filters and completes; inline only completes; none does neither. |
| onItemHighlighted | ((value: Items[number]["items"][number] \| undefined, details: AriaCombobox.HighlightEventDetails) => void) \| undefined |  |
| onOpenChangeComplete | ((open: boolean) => void) \| undefined |  |
| openOnInputClick | boolean \| undefined |  |
| submitOnItemClick | boolean \| undefined |  |
| virtualized | boolean \| undefined |  |
| disabled | boolean \| undefined |  |
| readOnly | boolean \| undefined |  |
| required | boolean \| undefined |  |
| inputRef | JSX.Ref<HTMLInputElement> |  |
| id | string \| undefined |  |
| children | JSX.Element |  |

### Value

Renders the current input text, or a live child renderer, without a host element.

| Prop | Type | Description |
| --- | --- | --- |
| children | JSX.Element \| ((value: string) => JSX.Element) |  |

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
| class | JSX.ClassValue \| ((state: Readonly<AutocompleteInputGroupState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AutocompleteInputGroupState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, AutocompleteInputGroupState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Trigger



| Prop | Type | Description |
| --- | --- | --- |
| nativeButton | boolean \| undefined |  |
| disabled | boolean \| undefined |  |
| class | JSX.ClassValue \| ((state: Readonly<AutocompleteTriggerState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AutocompleteTriggerState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, AutocompleteTriggerState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Icon



| Prop | Type | Description |
| --- | --- | --- |
| class | JSX.ClassValue \| ((state: Readonly<AutocompleteIconState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AutocompleteIconState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, AutocompleteIconState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Clear



| Prop | Type | Description |
| --- | --- | --- |
| nativeButton | boolean \| undefined |  |
| disabled | boolean \| undefined |  |
| class | JSX.ClassValue \| ((state: Readonly<AutocompleteClearState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AutocompleteClearState>) => StyleValue) |  |
| keepMounted | boolean \| undefined |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, AutocompleteClearState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

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

Same runtime part; the none-mode API deliberately omits selected state.

| Prop | Type | Description |
| --- | --- | --- |
| value | any |  |
| index | number \| undefined |  |
| nativeButton | boolean \| undefined |  |
| disabled | boolean \| undefined |  |
| class | JSX.ClassValue \| ((state: Readonly<AutocompleteItemState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AutocompleteItemState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, AutocompleteItemState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

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
| class | JSX.ClassValue \| ((state: Readonly<AutocompleteSeparatorState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AutocompleteSeparatorState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, AutocompleteSeparatorState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

## useFilter

Matches items against a query using `Intl.Collator` for robust string matching.
This utility is used when externally filtering items.



| Prop | Type | Description |
| --- | --- | --- |
| options | GetFilterParameters \| undefined |  |

## useFilteredItems

Returns the internally filtered items when called inside `<Autocomplete.Root>`.

Native accessor; use inside JSX/memos to observe held/async result windows.

| Prop | Type | Description |
| --- | --- | --- |


