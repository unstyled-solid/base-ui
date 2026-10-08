# Field

A component that provides labeling and validation for form controls.



[Interactive example](/solid/components/field)

## Anatomy

Import the component and assemble its parts:

```tsx
import { Field } from 'baseui-solid2/field';
<Field.Root>
  <Field.Label />
  <Field.Control />
  <Field.Description />
  <Field.Item />
  <Field.Error />
  <Field.Validity />
</Field.Root>;
```

## API reference

### Root

Groups a field's controls, labels, descriptions and validation messages.

| Prop | Type | Description |
| --- | --- | --- |
| name | string \| undefined |  |
| actionsRef | ((actions: FieldRootActions \| null) => void) \| undefined |  |
| dirty | boolean \| undefined |  |
| touched | boolean \| undefined |  |
| disabled | boolean \| undefined |  |
| invalid | boolean \| undefined |  |
| validate | FieldValidator \| undefined |  |
| validationMode | FormValidationMode \| undefined |  |
| validationDebounceTime | number \| undefined |  |
| class | JSX.ClassValue \| ((state: Readonly<FieldRootState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<FieldRootState>) => StyleValue) |  |
| render | ComponentRenderFn<JSX.HTMLAttributes<HTMLDivElement>, FieldRootState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Label



| Prop | Type | Description |
| --- | --- | --- |
| nativeLabel | boolean \| undefined |  |
| ref | JSX.Ref<E> |  |
| class | JSX.ClassValue \| ((state: Readonly<FieldLabelState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<FieldLabelState>) => StyleValue) |  |
| render | ComponentRenderFn<JSX.LabelHTMLAttributes<E>, FieldLabelState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Control

Native input facade. Validation and form registration belong to field-core.

| Prop | Type | Description |
| --- | --- | --- |
| defaultValue | string \| number \| readonly string[] \| undefined |  |
| value | string \| number \| string[] \| readonly string[] \| undefined |  |
| onValueChange | ((value: string, details: FieldControlChangeEventDetails) => void) \| undefined |  |
| ref | JSX.Ref<E> |  |
| autoFocus | boolean \| undefined |  |
| class | JSX.ClassValue \| ((state: Readonly<FieldControlState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<FieldControlState>) => StyleValue) |  |
| render | ComponentRenderFn<JSX.InputHTMLAttributes<E>, FieldControlState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Description



| Prop | Type | Description |
| --- | --- | --- |
| class | JSX.ClassValue \| ((state: Readonly<FieldDescriptionState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<FieldDescriptionState>) => StyleValue) |  |
| render | ComponentRenderFn<JSX.HTMLAttributes<HTMLParagraphElement>, FieldDescriptionState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Item



| Prop | Type | Description |
| --- | --- | --- |
| disabled | boolean \| undefined |  |
| class | JSX.ClassValue \| ((state: Readonly<FieldItemState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<FieldItemState>) => StyleValue) |  |
| render | ComponentRenderFn<JSX.HTMLAttributes<HTMLDivElement>, FieldItemState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Error



| Prop | Type | Description |
| --- | --- | --- |
| match | boolean \| keyof ValidityState \| undefined |  |
| class | JSX.ClassValue \| ((state: Readonly<FieldErrorState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<FieldErrorState>) => StyleValue) |  |
| render | ComponentRenderFn<JSX.HTMLAttributes<HTMLDivElement>, FieldErrorState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Validity

A stable getter-backed validity view; unrelated focus/value styling does not recreate it.

| Prop | Type | Description |
| --- | --- | --- |
| children | (state: FieldValidityState) => JSX.Element |  |

