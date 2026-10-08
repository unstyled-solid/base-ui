# Checkbox Group

Provides shared state to a series of checkboxes.



[Interactive example](/solid/components/checkbox-group)

## Usage guidelines

- **Form controls must have an accessible name**: It can be created using `<label>` elements, or the `Field` and `Fieldset` components. See [Labeling a checkbox group](#labeling-a-checkbox-group) and the [forms guide](/solid/handbook/forms).

## Anatomy

Checkbox Group is composed together with [Checkbox](/solid/components/checkbox). Import the components and place them together:

```tsx
import { Checkbox } from 'baseui-solid2/checkbox';
import { CheckboxGroup } from 'baseui-solid2/checkbox-group';
<CheckboxGroup>
  <Checkbox.Root />
</CheckboxGroup>;
```

## Examples

### Labeling a checkbox group

Label the group with `aria-labelledby` and a sibling label element:

```tsx
<>
  <div id="protocols-label">Allowed network protocols</div>
  <CheckboxGroup aria-labelledby="protocols-label">{/* ... */}</CheckboxGroup>
</>;
```

An enclosing `<label>` is the simplest labeling pattern for each checkbox:

```tsx
<label>
  <Checkbox.Root value="http" />
  HTTP
</label>;
```

### Rendering as a native button

By default, `<Checkbox.Root>` renders a `<span>` element to support enclosing labels. Prefer rendering each checkbox as a native button when using sibling labels (`htmlFor`/`id`).

```tsx
<>
  <div id="protocols-label">Allowed network protocols</div>
  <CheckboxGroup aria-labelledby="protocols-label">
    <div>
      <label for="protocol-http">HTTP</label>

      <Checkbox.Root
        id="protocol-http"
        value="http"
        nativeButton
        render={(renderProps) => <button {...renderProps} />}
      >
        <Checkbox.Indicator />
      </Checkbox.Root>
    </div>
  </CheckboxGroup>
</>;
```

Native buttons with wrapping labels are supported by using the `render` callback to avoid invalid HTML, so the hidden input is placed outside the label:

```tsx
<>
  <div id="protocols-label">Allowed network protocols</div>
  <CheckboxGroup aria-labelledby="protocols-label">
    <Checkbox.Root
      value="http"
      nativeButton
      render={(buttonProps) => (
        <label>
          <button {...buttonProps} />
          HTTP
        </label>
      )}
    />
  </CheckboxGroup>
</>;
```

### Form integration

Use [Field](/solid/components/field) and [Fieldset](/solid/components/fieldset) for group labeling and form integration:

```tsx
<Form>
  <Field.Root name="allowedNetworkProtocols">
    <Fieldset.Root render={(renderProps) => <CheckboxGroup {...renderProps} />}>
      <Fieldset.Legend>Allowed network protocols</Fieldset.Legend>
      <Field.Item>
        <Field.Label>
          <Checkbox.Root value="http" />
          HTTP
        </Field.Label>
      </Field.Item>
      <Field.Item>
        <Field.Label>
          <Checkbox.Root value="https" />
          HTTPS
        </Field.Label>
      </Field.Item>
      <Field.Item>
        <Field.Label>
          <Checkbox.Root value="ssh" />
          SSH
        </Field.Label>
      </Field.Item>
    </Fieldset.Root>
  </Field.Root>
</Form>;
```

### Parent checkbox

A checkbox that controls other checkboxes within a `<CheckboxGroup>` can be created:

- Make `<CheckboxGroup>` a controlled component
- Pass an array of all the child checkbox values to the `allValues` prop on the `<CheckboxGroup>` component
- Add the `parent` boolean prop to the parent `<Checkbox.Root>`

The group controls the parent checkbox's [indeterminate](/solid/components/checkbox#CheckboxRoot-indeterminate) state when some, but not all, child checkboxes are checked.

[Interactive example](/solid/components/checkbox-group)

### Nested parent checkbox

[Interactive example](/solid/components/checkbox-group)

## API reference

Shared logical selection. Successful form values are projected from registered native inputs.

| Prop | Type | Description |
| --- | --- | --- |
| defaultValue | readonly string[] \| undefined |  |
| value | readonly string[] \| undefined |  |
| onValueChange | ((value: string[], details: CheckboxGroupChangeEventDetails) => void) \| undefined |  |
| allValues | readonly string[] \| undefined |  |
| disabled | boolean \| undefined |  |
| class | JSX.ClassValue \| ((state: Readonly<CheckboxGroupState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<CheckboxGroupState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, CheckboxGroupState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

