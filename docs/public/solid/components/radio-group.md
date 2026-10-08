# Radio Group

Provides shared state to a series of radio buttons.



[Interactive example](/solid/components/radio-group)

## Usage guidelines

- **Form controls must have an accessible name**: It can be created using `<label>` elements, or the `Field` and `Fieldset` components. See [Labeling a radio group](#labeling-a-radio-group) and the [forms guide](/solid/handbook/forms).

## Anatomy

Import the component and assemble its parts:

```tsx
import { Radio } from 'baseui-solid2/radio';
import { RadioGroup } from 'baseui-solid2/radio-group';
<RadioGroup>
  <Radio.Root>
    <Radio.Indicator />
  </Radio.Root>
</RadioGroup>;
```

## Examples

### Labeling a radio group

Label the group with `aria-labelledby` and a sibling label element:

```tsx
<>
  <div id="storage-type-label">Storage type</div>
  <RadioGroup aria-labelledby="storage-type-label">{/* ... */}</RadioGroup>
</>;
```

An enclosing `<label>` is the simplest labeling pattern for each radio:

```tsx
<label>
  <Radio.Root value="ssd" />
  SSD
</label>;
```

### Rendering as a native button

By default, `<Radio.Root>` renders a `<span>` element to support enclosing labels. Prefer rendering each radio as a native button when using sibling labels (`htmlFor`/`id`).

```tsx
<>
  <div id="storage-type">Storage type</div>
  <RadioGroup defaultValue="ssd" aria-labelledby="storage-type">
    <div>
      <label for="storage-type-ssd">SSD</label>

      <Radio.Root
        value="ssd"
        id="storage-type-ssd"
        nativeButton
        render={(renderProps) => <button {...renderProps} />}
      >
        <Radio.Indicator />
      </Radio.Root>
    </div>
  </RadioGroup>
</>;
```

Native buttons with wrapping labels are supported by using the `render` callback to avoid invalid HTML, so the hidden input is placed outside the label:

```tsx
<>
  <div id="storage-type">Storage type</div>
  <RadioGroup defaultValue="ssd" aria-labelledby="storage-type">
    <Radio.Root
      value="ssd"
      nativeButton
      render={(buttonProps) => (
        <label>
          <button {...buttonProps} />
          SSD
        </label>
      )}
    />
  </RadioGroup>
</>;
```

### Form integration

Use [Field](/solid/components/field) and [Fieldset](/solid/components/fieldset) for group labeling and form integration:

```tsx
<Form>
  <Field.Root name="storageType">
    <Fieldset.Root render={(renderProps) => <RadioGroup {...renderProps} />}>
      <Fieldset.Legend>Storage type</Fieldset.Legend>
      <Field.Item>
        <Field.Label>
          <Radio.Root value="ssd" />
          SSD
        </Field.Label>
      </Field.Item>
      <Field.Item>
        <Field.Label>
          <Radio.Root value="hdd" />
          HDD
        </Field.Label>
      </Field.Item>
    </Fieldset.Root>
  </Field.Root>
</Form>;
```

## API reference

### RadioGroup

Provides shared, identity-based selection to radio buttons.

| Prop | Type | Description |
| --- | --- | --- |
| name | string \| undefined |  |
| defaultValue | Value \| undefined |  |
| value | Value \| undefined |  |
| onValueChange | ((value: Value, details: RadioGroupChangeEventDetails) => void) \| undefined |  |
| form | string \| undefined |  |
| disabled | boolean \| undefined |  |
| readOnly | boolean \| undefined |  |
| required | boolean \| undefined |  |
| inputRef | JSX.Ref<HTMLInputElement> |  |
| class | JSX.ClassValue \| ((state: Readonly<RadioGroupState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<RadioGroupState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, RadioGroupState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Root

A radio's visible span and adjacent native form input.

| Prop | Type | Description |
| --- | --- | --- |
| value | Value |  |
| nativeButton | boolean \| undefined |  |
| disabled | boolean \| undefined |  |
| readOnly | boolean \| undefined |  |
| required | boolean \| undefined |  |
| inputRef | JSX.Ref<HTMLInputElement> |  |
| class | JSX.ClassValue \| ((state: Readonly<RadioRootState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<RadioRootState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, RadioRootState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Indicator

Indicates selection, retaining the host until its exit animation completes.

| Prop | Type | Description |
| --- | --- | --- |
| class | JSX.ClassValue \| ((state: Readonly<RadioIndicatorState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<RadioIndicatorState>) => StyleValue) |  |
| keepMounted | boolean \| undefined |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, RadioIndicatorState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

