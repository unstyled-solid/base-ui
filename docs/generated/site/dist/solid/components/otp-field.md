# OTP Field

A one-time password input composed of individual character slots.



[Interactive example](/solid/components/otp-field)

## Usage guidelines

- **Form controls must have an accessible name**: It can be created using a `<label>` element or the `Field` component. See [Labeling an OTP field](#labeling-an-otp-field) and the [forms guide](/solid/handbook/forms).

## Anatomy

Import the component and assemble its parts:

```tsx
import { OTPField } from 'baseui-solid2/otp-field';
<OTPField.Root>
  <OTPField.Input />
  <OTPField.Separator />
</OTPField.Root>;
```

## Examples

### Labeling an OTP field

Pass an `id` to `<OTPField.Root>` and use a native `<label>` with a matching `htmlFor`. Let the
first input use the field label, and add `aria-label` to the remaining inputs so assistive
technology can announce which slot is focused.

Optionally, add `aria-describedby` when supporting text should be announced with the field.

```tsx
<div>
  <label for="verification-code">Verification code</label>
  <OTPField.Root
    id="verification-code"
    length={6}
    aria-describedby="verification-code-description"
  >
    <OTPField.Input />
    <OTPField.Input aria-label="Character 2 of 6" />
    <OTPField.Input aria-label="Character 3 of 6" />
    <OTPField.Input aria-label="Character 4 of 6" />
    <OTPField.Input aria-label="Character 5 of 6" />
    <OTPField.Input aria-label="Character 6 of 6" />
  </OTPField.Root>
  <p id="verification-code-description">
    Enter the 6-character code we sent to your device.
  </p>
</div>;
```

### Form integration

Use [Field](/solid/components/field) to handle label associations and form integration:

```tsx
<Form>
  <Field.Root name="verificationCode">
    <Field.Label>Verification code</Field.Label>
    <Field.Description>
      Enter the 6-character code we sent to your device.
    </Field.Description>
    <OTPField.Root length={6}>
      <OTPField.Input />
      <OTPField.Input aria-label="Character 2 of 6" />
      <OTPField.Input aria-label="Character 3 of 6" />
      <OTPField.Input aria-label="Character 4 of 6" />
      <OTPField.Input aria-label="Character 5 of 6" />
      <OTPField.Input aria-label="Character 6 of 6" />
    </OTPField.Root>
  </Field.Root>
</Form>;
```

Pass `autoSubmit` to submit the owning form automatically when all slots are filled, or use
`onValueComplete` to react to completion without submitting.

### Alphanumeric verification codes

Use `validationType="alphanumeric"` for recovery, backup, or invite codes that mix letters and
numbers.

[Interactive example](/solid/components/otp-field)

### Grouped layouts

Wrap subsets of inputs in your own layout elements and use `<OTPField.Separator>` when you
want the code presented in smaller visual chunks such as `123-456`.

[Interactive example](/solid/components/otp-field)

### Placeholder hints

`<OTPField.Input>` is a real input, so native `placeholder` props and CSS work as usual. This
example keeps placeholder hints visible until the active slot receives focus.

[Interactive example](/solid/components/otp-field)

### Custom normalization

Use `normalizeValue` to normalize accepted values before state updates, such as converting
alphanumeric codes to uppercase. It runs after `validationType` filtering, and the result is filtered
against `validationType` again. Use `validationType="none"` when the normalizer should provide the
full validation rule.

Pair custom rules with `inputMode` for keyboard hints and `onValueInvalid` for rejected characters.

[Interactive example](/solid/components/otp-field)

### Masked entry

Use `mask` when the code should be obscured while it is being typed.

[Interactive example](/solid/components/otp-field)

## API reference

### Root

Groups OTP slots and owns the logical string and native validation input.

| Prop | Type | Description |
| --- | --- | --- |
| name | string \| undefined |  |
| defaultValue | string \| undefined |  |
| value | string \| undefined |  |
| onValueChange | ((value: string, details: OTPFieldRootChangeEventDetails) => void) \| undefined |  |
| autoComplete | string \| undefined |  |
| autoSubmit | boolean \| undefined |  |
| form | string \| undefined |  |
| inputMode | "search" \| "decimal" \| "numeric" \| "none" \| "url" \| "text" \| "email" \| "tel" \| JSX.RemoveAttribute |  |
| length | number | Required before slots mount, including during SSR. |
| mask | boolean \| undefined |  |
| normalizeValue | ((value: string) => string) \| undefined | Applied after built-in filtering, then revalidated and clamped. Must be idempotent. |
| onValueComplete | ((value: string, details: OTPFieldRootCompleteEventDetails) => void) \| undefined |  |
| onValueInvalid | ((value: string, details: OTPFieldRootInvalidEventDetails) => void) \| undefined |  |
| validationType | OTPValidationType \| undefined |  |
| disabled | boolean \| undefined |  |
| readOnly | boolean \| undefined |  |
| required | boolean \| undefined |  |
| id | string \| undefined | First slot ID; subsequent IDs append `-2`, `-3`, etc. |
| class | JSX.ClassValue \| ((state: Readonly<OTPFieldRootState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<OTPFieldRootState>) => StyleValue) |  |
| render | ComponentRenderFn<JSX.HTMLAttributes<HTMLDivElement> & JSX.Properties<HTMLDivElement>, OTPFieldRootState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Input

A single OTP slot. Indexing belongs to the shared, DOM-ordered composite list.

| Prop | Type | Description |
| --- | --- | --- |
| class | JSX.ClassValue \| ((state: Readonly<OTPFieldInputState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<OTPFieldInputState>) => StyleValue) |  |
| render | ComponentRenderFn<JSX.InputHTMLAttributes<HTMLInputElement> & JSX.Properties<HTMLInputElement>, OTPFieldInputState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Separator

A separator element accessible to screen readers.
Renders a `<div>` element.

| Prop | Type | Description |
| --- | --- | --- |
| orientation | Orientation \| undefined | The orientation of the separator. |
| class | JSX.ClassValue \| ((state: Readonly<SeparatorState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<SeparatorState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, SeparatorState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

