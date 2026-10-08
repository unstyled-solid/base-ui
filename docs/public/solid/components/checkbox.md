# Checkbox

An easily stylable checkbox component.



[Interactive example](/solid/components/checkbox)

## Usage guidelines

- **Form controls must have an accessible name**: It can be created using a `<label>` element or the `Field` component. See [Labeling a checkbox](#labeling-a-checkbox) and the [forms guide](/solid/handbook/forms).

## Anatomy

Import the component and assemble its parts:

```tsx
import { Checkbox } from 'baseui-solid2/checkbox';
<Checkbox.Root>
  <Checkbox.Indicator />
</Checkbox.Root>;
```

## Examples

### Labeling a checkbox

An enclosing `<label>` is the simplest labeling pattern:

```tsx
<label>
  <Checkbox.Root />
  Accept terms and conditions
</label>;
```

### Rendering as a native button

By default, `<Checkbox.Root>` renders a `<span>` element to support enclosing labels. Prefer rendering the checkbox as a native button when using sibling labels (`htmlFor`/`id`).

```tsx
<div>
  <label for="notifications-checkbox">Enable notifications</label>

  <Checkbox.Root
    id="notifications-checkbox"
    nativeButton
    render={(renderProps) => <button {...renderProps} />}
  >
    <Checkbox.Indicator />
  </Checkbox.Root>
</div>;
```

Native buttons with wrapping labels are supported by using the `render` callback to avoid invalid HTML, so the hidden input is placed outside the label:

```tsx
<Checkbox.Root
  nativeButton
  render={(buttonProps) => (
    <label>
      <button {...buttonProps} />
      Enable notifications
    </label>
  )}
/>;
```

### Form integration

Use [Field](/solid/components/field) to handle label associations and form integration:

```tsx
<Form>
  <Field.Root name="stayLoggedIn">
    <Field.Label>
      <Checkbox.Root />
      Stay logged in for 7 days
    </Field.Label>
  </Field.Root>
</Form>;
```

## API reference

### Root

A span-plus-native-input checkbox; only the accepted native change commits selection.

| Prop | Type | Description |
| --- | --- | --- |
| name | string \| undefined |  |
| defaultChecked | boolean \| undefined |  |
| checked | boolean \| undefined |  |
| onCheckedChange | ((checked: boolean, details: CheckboxRootChangeEventDetails) => void) \| undefined |  |
| indeterminate | boolean \| undefined |  |
| value | string \| undefined |  |
| form | string \| undefined |  |
| nativeButton | boolean \| undefined |  |
| parent | boolean \| undefined |  |
| uncheckedValue | string \| undefined |  |
| disabled | boolean \| undefined |  |
| readOnly | boolean \| undefined |  |
| required | boolean \| undefined |  |
| inputRef | JSX.Ref<HTMLInputElement> |  |
| id | string \| undefined |  |
| class | JSX.ClassValue \| ((state: Readonly<CheckboxRootState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<CheckboxRootState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, CheckboxRootState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Indicator



| Prop | Type | Description |
| --- | --- | --- |
| class | JSX.ClassValue \| ((state: Readonly<CheckboxIndicatorState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<CheckboxIndicatorState>) => StyleValue) |  |
| keepMounted | boolean \| undefined |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, CheckboxIndicatorState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

