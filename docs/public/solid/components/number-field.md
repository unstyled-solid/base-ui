# Number Field

A numeric input element with increment and decrement buttons, and a scrub area.



[Interactive example](/solid/components/number-field)

## Usage guidelines

- **Form controls must have an accessible name**: It can be created using a `<label>` element or the `Field` component. See the [forms guide](/solid/handbook/forms).

## Anatomy

Import the component and assemble its parts:

```tsx
import { NumberField } from 'baseui-solid2/number-field';
<NumberField.Root>
  <NumberField.ScrubArea>
    <NumberField.ScrubAreaCursor />
  </NumberField.ScrubArea>
  <NumberField.Group>
    <NumberField.Decrement />
    <NumberField.Input />
    <NumberField.Increment />
  </NumberField.Group>
</NumberField.Root>;
```

## API reference

### Root



| Prop | Type | Description |
| --- | --- | --- |
| name | string \| undefined |  |
| defaultValue | number \| undefined |  |
| value | number \| null \| undefined |  |
| onValueChange | ((value: number \| null, details: NumberFieldRootChangeEventDetails) => void) \| undefined |  |
| onValueCommitted | ((value: number \| null, details: NumberFieldRootCommitEventDetails) => void) \| undefined |  |
| allowOutOfRange | boolean \| undefined |  |
| form | string \| undefined |  |
| locale | Intl.LocalesArgument |  |
| snapOnStep | boolean \| undefined |  |
| step | number \| "any" \| undefined |  |
| smallStep | number \| undefined |  |
| largeStep | number \| undefined |  |
| min | number \| undefined |  |
| max | number \| undefined |  |
| allowWheelScrub | boolean \| undefined |  |
| format | Intl.NumberFormatOptions \| undefined |  |
| disabled | boolean \| undefined |  |
| readOnly | boolean \| undefined |  |
| required | boolean \| undefined |  |
| inputRef | JSX.Ref<HTMLInputElement> |  |
| id | string \| undefined |  |
| class | JSX.ClassValue \| ((state: Readonly<NumberFieldRootState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<NumberFieldRootState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, NumberFieldRootState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### ScrubArea



| Prop | Type | Description |
| --- | --- | --- |
| direction | "horizontal" \| "vertical" \| undefined |  |
| pixelSensitivity | number \| undefined |  |
| teleportDistance | number \| undefined |  |
| class | JSX.ClassValue \| ((state: Readonly<NumberFieldScrubAreaState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<NumberFieldScrubAreaState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, NumberFieldScrubAreaState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### ScrubAreaCursor



| Prop | Type | Description |
| --- | --- | --- |
| class | JSX.ClassValue \| ((state: Readonly<NumberFieldScrubAreaCursorState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<NumberFieldScrubAreaCursorState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, NumberFieldScrubAreaCursorState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Group



| Prop | Type | Description |
| --- | --- | --- |
| class | JSX.ClassValue \| ((state: Readonly<NumberFieldGroupState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<NumberFieldGroupState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, NumberFieldGroupState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Decrement



| Prop | Type | Description |
| --- | --- | --- |
| nativeButton | boolean \| undefined |  |
| class | JSX.ClassValue \| ((state: Readonly<NumberFieldRootState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<NumberFieldRootState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, NumberFieldRootState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Input



| Prop | Type | Description |
| --- | --- | --- |
| class | JSX.ClassValue \| ((state: Readonly<NumberFieldInputState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<NumberFieldInputState>) => StyleValue) |  |
| render | ComponentRenderFn<JSX.InputHTMLAttributes<HTMLInputElement> & JSX.Properties<HTMLInputElement>, NumberFieldInputState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Increment



| Prop | Type | Description |
| --- | --- | --- |
| nativeButton | boolean \| undefined |  |
| class | JSX.ClassValue \| ((state: Readonly<NumberFieldRootState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<NumberFieldRootState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, NumberFieldRootState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

