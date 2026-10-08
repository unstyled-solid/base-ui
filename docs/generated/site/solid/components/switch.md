# Switch

A control that indicates whether a setting is on or off.



[Interactive example](/solid/components/switch)

## Usage guidelines

- **Form controls must have an accessible name**: It can be created using a `<label>` element or the `Field` component. See [Labeling a switch](#labeling-a-switch) and the [forms guide](/solid/handbook/forms).

## Anatomy

Import the component and assemble its parts:

```tsx
import { Switch } from 'baseui-solid2/switch';
<Switch.Root>
  <Switch.Thumb />
</Switch.Root>;
```

## Examples

### Labeling a switch

An enclosing `<label>` is the simplest labeling pattern:

```tsx
<label>
  <Switch.Root />
  Notifications
</label>;
```

### Rendering as a native button

By default, `<Switch.Root>` renders a `<span>` element to support enclosing labels. Prefer rendering the switch as a native button when using sibling labels (`htmlFor`/`id`).

```tsx
<div>
  <label for="notifications-switch">Notifications</label>

  <Switch.Root
    id="notifications-switch"
    nativeButton
    render={(renderProps) => <button {...renderProps} />}
  >
    <Switch.Thumb />
  </Switch.Root>
</div>;
```

Native buttons with wrapping labels are supported by using the `render` callback to avoid invalid HTML, so the hidden input is placed outside the label:

```tsx
<Switch.Root
  nativeButton
  render={(buttonProps) => (
    <label>
      <button {...buttonProps} />
      Notifications
    </label>
  )}
/>;
```

### Form integration

Use [Field](/solid/components/field) to handle label associations and form integration:

```tsx
<Form>
  <Field.Root name="notifications">
    <Field.Label>
      <Switch.Root />
      Notifications
    </Field.Label>
  </Field.Root>
</Form>;
```

## API reference

### Root

A visible switch and an adjacent native checkbox, following Base UI's managed reset semantics.

| Prop | Type | Description |
| --- | --- | --- |
| name | string \| undefined |  |
| defaultChecked | boolean \| undefined |  |
| checked | boolean \| undefined |  |
| onCheckedChange | ((checked: boolean, details: SwitchRootChangeEventDetails) => void) \| undefined |  |
| value | string \| undefined |  |
| form | string \| undefined |  |
| nativeButton | boolean \| undefined |  |
| uncheckedValue | string \| undefined |  |
| disabled | boolean \| undefined |  |
| readOnly | boolean \| undefined |  |
| required | boolean \| undefined |  |
| inputRef | JSX.Ref<HTMLInputElement> |  |
| id | string \| undefined |  |
| class | JSX.ClassValue \| ((state: Readonly<SwitchRootState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<SwitchRootState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, SwitchRootState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Thumb



| Prop | Type | Description |
| --- | --- | --- |
| class | JSX.ClassValue \| ((state: Readonly<SwitchThumbState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<SwitchThumbState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, SwitchThumbState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

