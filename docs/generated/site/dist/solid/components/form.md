# Form

A native form element with consolidated error handling.



[Interactive example](/solid/components/form)

## Anatomy

Form is composed together with [Field](/solid/components/field). Import the components and place them together:

```tsx
import { Field } from 'baseui-solid2/field';
import { Form } from 'baseui-solid2/form';
<Form>
  <Field.Root>
    <Field.Label />
    <Field.Control />
    <Field.Error />
  </Field.Root>
</Form>;
```

## Examples

### Submit with a Server Function

Forms using `useActionState` can be submitted with a [Server Function](https://react.dev/reference/react-dom/components/form#handle-form-submission-with-a-server-function) instead of `onSubmit`.

[Interactive example](/solid/components/form)

### Submit form values as a JavaScript object

You can use `onFormSubmit` instead of the native `onSubmit` to access form values as a JavaScript object. This is useful when you need to transform the values before submission, or integrate with 3rd party APIs.

```tsx
<Form
  onFormSubmit={async (formValues: { id: string; quantity: number }) => {
    const payload = {
      product_id: formValues.id,
      order_quantity: formValues.quantity,
    };
    const response = await fetch('https://api.example.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  }}
/>;
```

When used, `preventDefault` is called on the native submit event.

### Using with Zod

When parsing the schema using `schema.safeParse()`, the `z.flattenError(result.error).fieldErrors` data can be used to map the errors to each field's `name`.

[Interactive example](/solid/components/form)

## API reference

A native form element with consolidated error handling.

| Prop | Type | Description |
| --- | --- | --- |
| errors | FormErrors \| undefined |  |
| actionsRef | ((actions: FormActions \| null) => void) \| undefined | Solid callback ref; receives null on replacement or disposal. |
| noValidate | boolean \| undefined |  |
| onFormSubmit | ((formValues: FormValues, eventDetails: FormSubmitEventDetails) => void) \| undefined |  |
| validationMode | FormValidationMode \| undefined |  |
| class | JSX.ClassValue \| ((state: Readonly<FormState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<FormState>) => StyleValue) |  |
| render | ComponentRenderFn<JSX.FormHTMLAttributes<HTMLFormElement> & JSX.Properties<HTMLFormElement> & { noValidate?: boolean; }, FormState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

