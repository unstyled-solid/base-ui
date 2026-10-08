# Input

A native input element that automatically works with [Field](/solid/components/field).



[Interactive example](/solid/components/input)

## Usage guidelines

- **Form controls must have an accessible name**: It can be created using a `<label>` element or the `Field` component. See the [forms guide](/solid/handbook/forms).

## Anatomy

Import the component and use it as a single part:

```tsx
import { Input } from 'baseui-solid2/input';
<Input />;
```

## API reference

A native input element that automatically works with Field.
Renders an `<input>` element.

| Prop | Type | Description |
| --- | --- | --- |
| defaultValue | string \| number \| readonly string[] \| undefined | The default value of the input. Use when uncontrolled. |
| value | string \| number \| string[] \| readonly string[] \| undefined | The value of the input. Use when controlled. |
| onValueChange | ((value: string, eventDetails: Input.ChangeEventDetails) => void) \| undefined | Callback fired when the `value` changes. Use when controlled. |
| ref | JSX.Ref<HTMLInputElement> |  |
| autoFocus | boolean \| undefined |  |
| class | JSX.ClassValue \| ((state: Readonly<FieldControlState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<FieldControlState>) => StyleValue) |  |
| render | ComponentRenderFn<JSX.InputHTMLAttributes<HTMLInputElement>, FieldControlState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

