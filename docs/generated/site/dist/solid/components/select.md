# Select

A common form component for choosing a predefined value in a dropdown menu.



[Interactive example](/solid/components/select)

## Usage guidelines

- **Prefer Combobox for large lists**: Select is not filterable, aside from basic keyboard typeahead functionality to find items by focusing and highlighting them. Prefer [Combobox](/solid/components/combobox) instead of Select when the number of items is sufficiently large to warrant filtering.
- **Special positioning behavior**: The select popup by default overlaps its trigger so the selected item's text is aligned with the trigger's value text. This behavior [can be disabled or customized](/solid/components/select#positioning).
- **Form controls must have an accessible name**: Prefer `<Select.Label>`, or provide an `aria-label` on `<Select.Trigger>` when no visible label is rendered. See [Labeling a select](#labeling-a-select) and the [forms guide](/solid/handbook/forms).
- **Closing animations**: The popup stays rendered until its closing animation finishes. See [JavaScript animations](/solid/handbook/animation#javascript-animations) for animating it with Motion and for manual control.

## Anatomy

Import the component and assemble its parts:

```tsx
import { Select } from 'baseui-solid2/select';
<Select.Root>
  <Select.Label />
  <Select.Trigger>
    <Select.Value />
    <Select.Icon />
  </Select.Trigger>

  <Select.Portal>
    <Select.Backdrop />
    <Select.Positioner>
      <Select.Popup>
        <Select.ScrollUpArrow />
        <Select.Arrow />
        <Select.List>
          <Select.Item>
            <Select.ItemText />
            <Select.ItemIndicator />
          </Select.Item>
          <Select.Separator />
          <Select.Group>
            <Select.GroupLabel />
          </Select.Group>
        </Select.List>
        <Select.ScrollDownArrow />
      </Select.Popup>
    </Select.Positioner>
  </Select.Portal>
</Select.Root>;
```

## Positioning

`<Select.Positioner>` has a special prop called `alignItemWithTrigger` which causes the positioning to act differently by default from other `Positioner` components.
The prop makes the select popup overlap the trigger so the selected item's text is aligned with the trigger's value text.

For styling, `data-side` is `"none"` on the `.Popup` and `.Positioner` parts when the mode is active.

To prevent the select popup from overlapping its trigger, set the `alignItemWithTrigger` prop to `false`.
When set to `true` (its default) there are a few important points to note about its behavior:

- **Interaction type dependent**: For UX reasons, the `alignItemWithTrigger` positioning mode is disabled if touch was the pointer type used to open the popup.
- **Viewport space dependent**: There must be enough space in the viewport to align the selected item's text with the trigger's value text without causing the popup to be too vertically small - otherwise, it falls back to the default positioning mode.
This can be customized by setting `min-height` on the `<Select.Positioner>` element; a smaller value will fallback less often.
Additionally, the trigger must be at least 20px from the edges of the top and bottom of the viewport, or it will also fall back.
- **Other positioning props are ignored**: Props like `side` or `align` have no effect unless the prop is set to `false` or when in fallback mode.

## Examples

### Typed wrapper component

The following example shows a typed wrapper around the Select component with correct type inference and type safety:

```tsx
import type { JSX } from '@solidjs/web';
import { Select } from 'baseui-solid2/select';
export function MySelect<Value, Multiple extends boolean | undefined = false>(
  props: Select.Root.Props<Value, Multiple>,
): JSX.Element {
  return <Select.Root {...props}>{/* ... */}</Select.Root>;
}
```

### Formatting the value

By default, the `<Select.Value>` component renders the raw `value`.

Passing the `items` prop to `<Select.Root>` instead renders the matching label for the rendered value:

```tsx
const items = [
  { value: null, label: 'Select theme' },
  { value: 'system', label: 'System default' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];
<Select.Root items={items}>
  <Select.Value />
</Select.Root>;
```

A function can also be passed as the `children` prop of `<Select.Value>` to render a formatted value:

```tsx
const items = {
  monospace: 'Monospace',
  serif: 'Serif',
  'san-serif': 'Sans-serif',
};
<Select.Value>
  {(value: keyof typeof items) => (
    <span style={{ fontFamily: value }}>{items[value]}</span>
  )}
</Select.Value>;
```

To avoid lookup, [object values](#object-values) for each item can also be used.

### Labeling a select

Use `<Select.Label>` to provide a visible label for the select trigger:

```tsx
<Select.Root>
  <Select.Label>Theme</Select.Label>
  {/* ... */}
</Select.Root>;
```

`<Select.Label>` renders a `<div>`, so clicking it focuses the select trigger without opening the popup.

### Placeholder values

To show a placeholder value, use the `placeholder` prop on `<Select.Value>`:

```tsx
const items = [
  { value: 'system', label: 'System default' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];
<Select.Root items={items}>
  <Select.Value placeholder="Select theme" />
</Select.Root>;
```

With placeholders, users cannot clear selected values using the select itself. If the select value should be clearable from the popup (instead of an external "reset" button), use a `null` item rendered in the list itself:

```tsx
const items = [
  { value: null, label: 'Select theme' },
  { value: 'system', label: 'System default' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];
<Select.Root items={items}>
  <Select.Value />
</Select.Root>;
```

### Multiple selection

Add the `multiple` prop to the `<Select.Root>` component to allow multiple selections.

[Interactive example](/solid/components/select)

### Object values

Select items can use objects as values instead of primitives.
This lets you access the full object in custom render functions, and can avoid needing to specify `items` for lookup.

[Interactive example](/solid/components/select)

### Grouped

Organize related options with `<Select.Group>` and `<Select.GroupLabel>` to add section headings inside the popup.

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

[Interactive example](/solid/components/select)

### Custom keyboard shortcuts

`<Select.Root>` accepts an `actionsRef` whose `highlightItem()` action moves the highlight to the `'next'`, `'previous'`, `'first'` or `'last'` item, or clears it with `'none'`. Use it to bind shortcuts beyond the built-in arrow keys. Select items receive real DOM focus, so the action moves focus along with the highlight, and `'none'` hands focus back to the popup. Select does not loop focus, so `'next'` on the last item and `'previous'` on the first one leave the highlight where it is. The action does nothing while the popup is closed.

Because the items hold focus while the popup is open, attach the key handler to `<Select.Popup>` rather than to the trigger:

```tsx
let actionsRef: Select.Root.Actions | null = null;
<Select.Root
  actionsRef={(value) => {
    actionsRef = value;
  }}
>
  <Select.Trigger>
    <Select.Value />
  </Select.Trigger>
  <Select.Portal>
    <Select.Positioner>
      <Select.Popup
        onKeyDown={(event) => {
          if (event.ctrlKey && event.key === 'j') {
            event.preventDefault();
            actionsRef?.highlightItem('next');
          }
        }}
      >
        {/* items */}
      </Select.Popup>
    </Select.Positioner>
  </Select.Portal>
</Select.Root>;
```

## API reference

### Root



| Prop | Type | Description |
| --- | --- | --- |
| name | string \| undefined |  |
| defaultValue | InputValue<Value, Multiple> \| null \| undefined |  |
| value | InputValue<Value, Multiple> \| null \| undefined |  |
| onValueChange | ((value: OutputValue<Value, Multiple>, details: SelectRootChangeEventDetails) => void) \| undefined |  |
| defaultOpen | boolean \| undefined |  |
| open | boolean \| undefined |  |
| onOpenChange | ((open: boolean, details: SelectRootOpenChangeEventDetails) => void) \| undefined |  |
| highlightItemOnHover | boolean \| undefined |  |
| actionsRef | ((actions: SelectRootActions \| null) => void) \| undefined |  |
| autoComplete | string \| undefined |  |
| form | string \| undefined |  |
| isItemEqualToValue | ((item: Value, value: Value) => boolean) \| undefined |  |
| itemToStringLabel | ((value: Value) => string) \| undefined |  |
| itemToStringValue | ((value: Value) => string) \| undefined |  |
| items | readonly Group<any>[] \| Record<string, JSX.Element> \| readonly { label: JSX.Element; value: any; }[] \| undefined |  |
| modal | boolean \| undefined |  |
| multiple | Multiple \| undefined |  |
| onOpenChangeComplete | ((open: boolean) => void) \| undefined |  |
| disabled | boolean \| undefined |  |
| readOnly | boolean \| undefined |  |
| required | boolean \| undefined |  |
| inputRef | NativeRef<HTMLInputElement> |  |
| id | string \| undefined |  |
| children | JSX.Element |  |

### Label



| Prop | Type | Description |
| --- | --- | --- |
| class | JSX.ClassValue \| ((state: Readonly<FieldRootState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<FieldRootState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, FieldRootState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Trigger



| Prop | Type | Description |
| --- | --- | --- |
| nativeButton | boolean \| undefined |  |
| disabled | boolean \| undefined |  |
| class | JSX.ClassValue \| ((state: Readonly<SelectTriggerState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<SelectTriggerState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, SelectTriggerState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Value



| Prop | Type | Description |
| --- | --- | --- |
| placeholder | JSX.Element |  |
| children | JSX.Element \| ((value: any) => JSX.Element) |  |
| class | JSX.ClassValue \| ((state: Readonly<SelectValueState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<SelectValueState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, SelectValueState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Icon



| Prop | Type | Description |
| --- | --- | --- |
| class | JSX.ClassValue \| ((state: Readonly<SelectIconState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<SelectIconState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, SelectIconState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Backdrop



| Prop | Type | Description |
| --- | --- | --- |
| class | JSX.ClassValue \| ((state: Readonly<SelectBackdropState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<SelectBackdropState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, SelectBackdropState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Portal



| Prop | Type | Description |
| --- | --- | --- |
| container | PortalContainer |  |
| class | JSX.ClassValue \| ((state: Readonly<SelectPortalState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<SelectPortalState>) => StyleValue) |  |
| render | ComponentRenderFn<JSX.HTMLAttributes<HTMLElement>, SelectPortalState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Positioner



| Prop | Type | Description |
| --- | --- | --- |
| alignItemWithTrigger | boolean \| undefined |  |
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
| class | JSX.ClassValue \| ((state: Readonly<SelectPositionerState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<SelectPositionerState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, SelectPositionerState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Popup



| Prop | Type | Description |
| --- | --- | --- |
| finalFocus | FocusTarget \| undefined |  |
| class | JSX.ClassValue \| ((state: Readonly<SelectPopupState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<SelectPopupState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, SelectPopupState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### List



| Prop | Type | Description |
| --- | --- | --- |
| class | JSX.ClassValue \| ((state: Readonly<SelectListState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<SelectListState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, SelectListState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Arrow



| Prop | Type | Description |
| --- | --- | --- |
| class | JSX.ClassValue \| ((state: Readonly<SelectArrowState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<SelectArrowState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, SelectArrowState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Item



| Prop | Type | Description |
| --- | --- | --- |
| label | string \| undefined |  |
| value | any |  |
| nativeButton | boolean \| undefined |  |
| disabled | boolean \| undefined |  |
| class | JSX.ClassValue \| ((state: Readonly<SelectItemState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<SelectItemState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, SelectItemState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### ItemText



| Prop | Type | Description |
| --- | --- | --- |
| class | JSX.ClassValue \| ((state: Readonly<SelectItemTextState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<SelectItemTextState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, SelectItemTextState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### ItemIndicator



| Prop | Type | Description |
| --- | --- | --- |
| class | JSX.ClassValue \| ((state: Readonly<SelectItemIndicatorState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<SelectItemIndicatorState>) => StyleValue) |  |
| keepMounted | boolean \| undefined |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, SelectItemIndicatorState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Group



| Prop | Type | Description |
| --- | --- | --- |
| class | JSX.ClassValue \| ((state: Readonly<SelectGroupState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<SelectGroupState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, SelectGroupState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### GroupLabel



| Prop | Type | Description |
| --- | --- | --- |
| class | JSX.ClassValue \| ((state: Readonly<SelectGroupLabelState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<SelectGroupLabelState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, SelectGroupLabelState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### ScrollUpArrow



| Prop | Type | Description |
| --- | --- | --- |
| class | JSX.ClassValue \| ((state: Readonly<SelectScrollUpArrowState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<SelectScrollUpArrowState>) => StyleValue) |  |
| keepMounted | boolean \| undefined |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, SelectScrollUpArrowState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### ScrollDownArrow



| Prop | Type | Description |
| --- | --- | --- |
| class | JSX.ClassValue \| ((state: Readonly<SelectScrollDownArrowState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<SelectScrollDownArrowState>) => StyleValue) |  |
| keepMounted | boolean \| undefined |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, SelectScrollDownArrowState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Separator



| Prop | Type | Description |
| --- | --- | --- |
| orientation | Orientation \| undefined |  |
| class | JSX.ClassValue \| ((state: Readonly<SelectSeparatorState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<SelectSeparatorState>) => StyleValue) |  |
| render | ComponentRenderFn<JSX.HTMLAttributes<HTMLDivElement>, SelectSeparatorState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

