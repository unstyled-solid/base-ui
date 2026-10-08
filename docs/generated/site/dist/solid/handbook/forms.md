# Forms

A guide to building forms with Base UI components.



Base UI form control components extend the native [constraint validation API](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#the-constraint-validation-api) so you can build forms for collecting user input or providing control over an interface. The upstream React integrations with [React Hook Form](#react-hook-form) and [TanStack Form](#tanstack-form) are retained below as React examples.

[Interactive example](/solid/handbook/forms)

## Naming form controls

Form controls must have an accessible name in order to be recognized by assistive technologies. Use the label strategy below for each control type.

### Input controls

Use `<Field.Label>` or a native `<label>` to label the following controls:

- `Input`
- `NumberField`
- `OTPField`
- `Autocomplete`
- `Combobox` (input outside popup)
- `Checkbox`
- `Radio`
- `Switch`

You can implicitly label `<Checkbox>`, `<Radio>` and `<Switch>` components by enclosing them with `<Field.Label>`:

```tsx
import { Field } from 'baseui-solid2/field';
import { Switch } from 'baseui-solid2/switch';
<Field.Root>
  <Field.Label>
    <Switch.Root />
    Developer mode
  </Field.Label>
  <Field.Description>Enables extra tools for web developers</Field.Description>
</Field.Root>;
```

### Trigger-based controls

- `Combobox` (input inside popup): use `<Combobox.Label>`.
- `Select`: use `<Select.Label>`.
- `Slider`: use `<Slider.Label>`. For multi-thumb sliders, also add an `aria-label` on each
`<Slider.Thumb>` to distinguish the thumbs.

### Fallback

If no visible label is rendered, provide `aria-label` on the actual form control.

### Describing the control

`<Field.Description>` automatically assigns an accessible description:

```tsx
import { Form } from 'baseui-solid2/form';
import { Field } from 'baseui-solid2/field';
import { Select } from 'baseui-solid2/select';
import { Slider } from 'baseui-solid2/slider';
<Form>
  <Field.Root>
    <Select.Root>
      <Select.Label>Time zone</Select.Label>
      <Select.Trigger />
    </Select.Root>
    <Field.Description>Used for notifications and reminders</Field.Description>
  </Field.Root>

  <Field.Root>
    <Slider.Root defaultValue={50}>
      <Slider.Label>Zoom level</Slider.Label>
      <Field.Description>Adjust the size of the user interface</Field.Description>
      <Slider.Control>
        <Slider.Track>
          <Slider.Thumb />
        </Slider.Track>
      </Slider.Control>
    </Slider.Root>
  </Field.Root>
</Form>;
```

### Labeling control groups

Compose `<Fieldset>` when a single label applies to multiple controls, such as a range slider with multiple thumbs or a section that combines several inputs. For checkbox and radio groups, keep the group label in `<Fieldset.Legend>` and wrap each option with `<Field.Item>`:

```tsx
import { Form } from 'baseui-solid2/form';
import { Field } from 'baseui-solid2/field';
import { Fieldset } from 'baseui-solid2/fieldset';
import { Radio } from 'baseui-solid2/radio';
import { RadioGroup } from 'baseui-solid2/radio-group';
import { Slider } from 'baseui-solid2/slider';
<Form>
  <Field.Root>
    <Fieldset.Root render={(renderProps) => <Slider.Root {...renderProps} />}>
      <Fieldset.Legend>Price range</Fieldset.Legend>

      <Slider.Control>
        <Slider.Track>
          <Slider.Thumb aria-label="Minimum price" />
          <Slider.Thumb aria-label="Maximum price" />
        </Slider.Track>
      </Slider.Control>
    </Fieldset.Root>
  </Field.Root>

  <Field.Root>
    <Fieldset.Root render={(renderProps) => <RadioGroup {...renderProps} />}>
      <Fieldset.Legend>Storage type</Fieldset.Legend>

      <Radio.Root value="ssd" />
      <Radio.Root value="hdd" />
    </Fieldset.Root>
  </Field.Root>
</Form>;
```

`<Field.Item>` should enclose each checkbox or radio option so every control has its own label and description:

```tsx
import { Form } from 'baseui-solid2/form';
import { Field } from 'baseui-solid2/field';
import { Fieldset } from 'baseui-solid2/fieldset';
import { Checkbox } from 'baseui-solid2/checkbox';
import { CheckboxGroup } from 'baseui-solid2/checkbox-group';
<Field.Root>
  <Fieldset.Root render={(renderProps) => <CheckboxGroup {...renderProps} />}>
    <Fieldset.Legend>Backup schedule</Fieldset.Legend>

    <Field.Item>
      <Checkbox.Root value="daily" />
      <Field.Label>Daily</Field.Label>
      <Field.Description>Daily at 00:00</Field.Description>
    </Field.Item>
    <Field.Item>
      <Checkbox.Root value="monthly" />
      <Field.Label>Monthly</Field.Label>
      <Field.Description>On the 5th of every month at 23:59</Field.Description>
    </Field.Item>
  </Fieldset.Root>
</Field.Root>;
```

## Building form fields

Pass the `name` prop to `<Field.Root>` to include the wrapped control's value when a parent form is submitted:

```tsx
import { Form } from 'baseui-solid2/form';
import { Field } from 'baseui-solid2/field';
import { Combobox } from 'baseui-solid2/combobox';
<Form>
  <Field.Root name="country">
    <Field.Label>Country of residence</Field.Label>
    <Combobox.Root />
  </Field.Root>
</Form>;
```

## Submitting data

You can take over form submission using the native `onSubmit`, or custom `onFormSubmit` props:

```tsx
import { Form } from 'baseui-solid2/form';
<Form
  onSubmit={async (event) => {
    // Prevent the browser's default full-page refresh
    event.preventDefault();
    // Create a FormData object
    const formData = new FormData(event.currentTarget);
    // Send the FormData instance in a fetch request
    await fetch('https://api.example.com', {
      method: 'POST',
      body: formData,
    });
  }}
/>;
```

When using `onFormSubmit`, you receive form values as a JavaScript object, with `eventDetails` provided as a second argument. Additionally, `preventDefault()` is automatically called on the native submit event:

```tsx
import { Form } from 'baseui-solid2/form';
<Form
  onFormSubmit={async (formValues) => {
    const payload = {
      product_id: formValues.id,
      order_quantity: formValues.quantity,
    };
    await fetch('https://api.example.com', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }}
/>;
```

## Constraint validation

Base UI form components support native HTML validation attributes for many validation rules:

- `required` specifies a required field.
- `minlength` and `maxlength` specify a valid length for text fields.
- `pattern` specifies a regular expression that the field value must match.
- `step` specifies an increment that numeric field values must be an integral multiple of.

```tsx
import { Field } from 'baseui-solid2/field';
<Field.Root name="website">
  <Field.Control type="url" required pattern="https?://.*" />
  <Field.Error />
</Field.Root>;
```

Base UI form components use a hidden input to participate in native form submission and validation.
To anchor the hidden input near a control so the native validation bubble points to the correct area, ensure the component has been given a `name`, and wrap controls in a relatively positioned container for best results.

```tsx
import { Field } from 'baseui-solid2/field';
import { Select } from 'baseui-solid2/select';
<Field.Root name="apple">
  <Select.Root>
    <Select.Label>Apple</Select.Label>
    <div class="relative">
      <Select.Trigger />
    </div>
  </Select.Root>
</Field.Root>;
```

## Custom validation

You can add custom validation logic by passing a synchronous or asynchronous validation function to the `validate` prop, which runs after native validations have passed.

Use the `validationMode` prop to configure when validation is performed:

- `onSubmit` (default) validates all fields when the containing `<Form>` is submitted, afterwards invalid fields revalidate when their value changes.
- `onBlur` validates the field when focus moves away.
- `onChange` validates the field when the value changes, for example, after each keypress in a text field or when a checkbox is checked or unchecked.

`validationDebounceTime` can be used to debounce the function in use cases such as asynchronous requests or text fields that validate `onChange`.

```tsx
import { Field } from 'baseui-solid2/field';

<Field.Root
  name="username"
  validationMode="onChange"
  validationDebounceTime={300}
  validate={async (value) => {
    if (value === 'admin') return 'Reserved for system use.';
    const response = await fetch(
      '/api/usernames/' + encodeURIComponent(String(value)),
    );
    const result: { available: boolean } = await response.json();
    if (!result.available) return `${value} is unavailable.`;
    return null;
  }}
>
  <Field.Control required minlength={3} />
  <Field.Error />
</Field.Root>;
```

## Server-side validation

You can pass errors returned by (post-submission) server-side validation to the `errors` prop, which will be merged into the client-side field state for display.

This should be an object with field names as keys, and an error string or array of strings as the value. Once a field's value changes, any corresponding error in `errors` will be cleared from the field state.

```tsx
import { createSignal } from 'solid-js';
import { Form } from 'baseui-solid2/form';
import { Field } from 'baseui-solid2/field';

async function submitToServer() {
  return { errors: { promoCode: 'This promo code has expired' } };
}

function Example() {
  const [errors, setErrors] = createSignal<Record<string, string>>({});
  return (
    <Form
      errors={errors()}
      onSubmit={async (event) => {
        event.preventDefault();
        const response = await submitToServer();
        setErrors(response.errors);
      }}
    >
      <Field.Root name="promoCode" />
    </Form>
  );
}
```

Upstream React integration: When using [Server Functions with Form Actions](https://react.dev/reference/rsc/server-functions#server-functions-with-use-action-state) you can return server-side errors from `useActionState` to the `errors` prop. A demo is available [here](/solid/components/form#submit-with-a-server-function).

```tsx
// app/form.tsx
/* prettier-ignore */
'use client';
import { Form } from '@base-ui/react/form';
import { Field } from '@base-ui/react/field';
import { login } from './actions';

// @highlight-text "state" "formAction"
const [state, formAction, loading] = React.useActionState(login, {});

// @highlight-text "state" "errors" "formAction"
<Form action={formAction} errors={state.errors}>
  <Field.Root name="password">
    <Field.Control />
    <Field.Error />
  </Field.Root>
</Form>;

// app/actions.ts
/* prettier-ignore */
'use server';
export async function login(formData: FormData) {
  const result = authenticateUser(formData);

  if (!result.success) {
    return {
      // @highlight-text "errors"
      errors: {
        password: 'Invalid username or password',
      },
    };
  }
  /* redirect on the server on success */
}
```

## Displaying errors

Use `<Field.Error>` without `children` to automatically display the field's native error message when invalid. The `match` prop can be used to customize the message based on the validity state, and manage internationalization from your application logic:

```tsx
<Field.Error match="valueMissing">You must create a username</Field.Error>;
```

## React Hook Form

In upstream React Base UI, [React Hook Form](https://react-hook-form.com) is a popular library that you can integrate with Base UI to externally manage form and field state for your existing components.

[Interactive example](/solid/handbook/forms)

### Initialize the form

Initialize the form with the `useForm` hook, assigning the initial value of each field by their name in the `defaultValues` parameter:

```tsx
import { useForm } from 'react-hook-form';

const { control, handleSubmit } = useForm<FormValues>({
  defaultValues: {
    username: '',
    email: '',
  },
});
```

### Integrate components

Use the `<Controller>` component to integrate with any `<Field>` component, forwarding the `name`, `field`, and `fieldState` render props to the appropriate part:

```tsx
import { useForm, Controller } from "react-hook-form";
import { Field } from '@base-ui/react/field';

const { control, handleSubmit} = useForm({
  defaultValues: {
    username: '',
  }
})

<Controller
  {/* @highlight-start */}
  name="username"
  control={control}
  render={({
    // @highlight-text "ref" "value" "onBlur" "onChange"
    field: { name, ref, value, onBlur, onChange },
    // @highlight-text "invalid" "isTouched" "isDirty" "error"
    fieldState: { invalid, isTouched, isDirty, error },
  }) => (
    {/* @highlight-text "invalid" "isTouched" "isDirty" */}
    <Field.Root name={name} invalid={invalid} touched={isTouched} dirty={isDirty}>
    {/* @highlight-end */}
      <Field.Label>Username</Field.Label>
      <Field.Description>
        May appear where you contribute or are mentioned. You can remove it at any time.
      </Field.Description>
      {/* @highlight-start */}
      <Field.Control
        placeholder="e.g. alice132"
        value={value} {/* @highlight-text "value" */}
        onBlur={onBlur} {/* @highlight-text "onBlur" */}
        onValueChange={onChange} {/* @highlight-text "onChange" */}
        ref={ref} {/* @highlight-text "ref" */}
      />
      {/* @highlight-end */}
      <Field.Error match={!!error}> {/* @highlight-text "error" */}
        {error?.message} {/* @highlight-text "error" */}
      </Field.Error>
    </Field.Root>
  )}
/>
```

For React Hook Form to focus invalid fields when performing validation, you must ensure that any wrapping components forward the `ref` to the underlying Base UI component. You can typically accomplish this using the `inputRef` prop, or directly as the `ref` for components that render an input element like `<NumberField.Input>`.

### Field validation

Specify `rules` on the `<Controller>` in the same format as [`register`](https://react-hook-form.com/docs/useform/register) options, and use the `match` prop to delegate control of the error rendering:

```tsx
import { Controller } from "react-hook-form";
import { Field } from '@base-ui/react/field';

<Controller
  {/* @highlight-start */}
  name="username"
  control={control}
  rules={{
    required: 'This is a required field',
    minLength: { value: 2, message: 'Too short' },
    validate: (value) => {
      if (/* custom logic */) {
        return 'Invalid'
      }
      return null;
    },
    {/* @highlight-end */}
  }}
  render={({
    field: { name, ref, value, onBlur, onChange },
    fieldState: { invalid, isTouched, isDirty, error },
  }) => (
    <Field.Root name={name} invalid={invalid} touched={isTouched} dirty={isDirty}>
      <Field.Label>Username</Field.Label>
      <Field.Description>
        May appear where you contribute or are mentioned. You can remove it at any time.
      </Field.Description>
      <Field.Control
        placeholder="e.g. alice132"
        value={value}
        onBlur={onBlur}
        onValueChange={onChange}
        ref={ref}
      />
      {/* @highlight-start */}
      <Field.Error match={!!error}>
        {error?.message}
      </Field.Error>
      {/* @highlight-end */}
    </Field.Root>
  )}
/>
```

### Submitting data

Wrap your submit handler function with `handleSubmit` to receive the form values as a JavaScript object for further handling:

```tsx
import { useForm } from 'react-hook-form';
import { Form } from '@base-ui/react/form';

interface FormValues {
  username: string;
  email: string;
}

const { handleSubmit } = useForm<FormValues>();

async function submitForm(data: FormValues) {
  // transform the object and/or submit it to a server
  await fetch(/* ... */);
}

<Form onSubmit={handleSubmit(submitForm)} />;
```

## TanStack Form

In upstream React Base UI, [TanStack Form](https://tanstack.com/form/v1/docs/overview) is a form library with a function-based API for orchestrating validations that can also be integrated with Base UI.

[Interactive example](/solid/handbook/forms)

### Initialize the form

Create a form instance with the `useForm` hook, assigning the initial value of each field by their name in the `defaultValues` parameter:

```tsx
import { useForm } from '@tanstack/react-form';

interface FormValues {
  username: string;
  email: string;
}

const defaultValues: FormValues = {
  username: '',
  email: '',
};

{/* @highlight-start */}
/* useForm returns a form instance */
const form = useForm<FormValues>({
{/* @highlight-end */}
  defaultValues,
});
```

### Integrate components

Use the `<form.Field>` component from the form instance to integrate with Base UI components using the `children` prop, forwarding the various `field` render props to the appropriate part:

```tsx
import { useForm } from '@tanstack/react-form';
import { Field } from '@base-ui/react/field';

const form = useForm(/* defaultValues, other parameters */)

<form>
  {/* @highlight-start */}
  <form.Field
    name="username"
    children={(field) => (
    // @highlight-end
      <Field.Root
        {/* @highlight-start */}
        name={field.name} {/* @highlight-text "field.name" */}
        invalid={!field.state.meta.isValid} {/* @highlight-text "isValid" */}
        dirty={field.state.meta.isDirty} {/* @highlight-text "isDirty" */}
        touched={field.state.meta.isTouched} {/* @highlight-text "isTouched" */}
        {/* @highlight-end */}
      >
        <Field.Label>Username</Field.Label>
        <Field.Control
          {/* @highlight-start */}
          value={field.state.value} {/* @highlight-text "value" */}
          onValueChange={field.handleChange} {/* @highlight-text "handleChange" */}
          onBlur={field.handleBlur} {/* @highlight-text "handleBlur" */}
          {/* @highlight-end */}
          placeholder="e.g. bob276"
        />

        {/* @highlight-start */}
        <Field.Error match={!field.state.meta.isValid}> {/* @highlight-text "isValid" */}
        {/* @highlight-end */}
          {field.state.meta.errors.join(',')}
        </Field.Error>
      </Field.Root>
    )}
  />
</form>
```

The Base UI `<Form>` component is not needed when using TanStack Form.

### Form validation

To configure a native `<form>`-like validation strategy:

- Use the additional `revalidateLogic` hook and pass it to `useForm`.
- Pass a validation function to the `validators.onDynamic` prop on `<form.Field>` that returns an error object with keys corresponding to the field `name`s.

This validates all fields when the first submission is attempted, and revalidates any invalid fields when their values change again.

```tsx
import { useForm, revalidateLogic } from '@tanstack/react-form'; // @highlight-text "revalidateLogic"

const form = useForm({
  defaultValues: {
    username: '',
    email: '',
  },
  {/* @highlight-start */}
  validationLogic: revalidateLogic({ {/* @highlight-text "revalidateLogic" */}
  {/* @highlight-end */}
    mode: 'submit',
    modeAfterSubmission: 'change',
  }),
  validators: {
    // @highlight-start
    onDynamic: ({ value: formValues }) => { // @highlight-text "onDynamic"
    // @highlight-end
      const errors = {};

      if (!formValues.username) {
        errors.username = 'Username is required.';
      } else if (formValues.username.length < 3) {
        errors.username = 'At least 3 characters.';
      }

      if (!formValues.email) {
        errors.email = 'Email is required.';
      } else if (!isValidEmail(formValues.email)) {
        errors.email = 'Invalid email address.';
      }

      return { form: errors, fields: errors };
    },
  },
});
```

### Field validation

You can pass additional validator functions to individual `<form.Field>` components to add validations on top of the form-level validators:

```tsx
import { Field } from '@base-ui/react/field';
import { useForm } from '@tanstack/react-form';

const form = useForm();

<form.Field
  name="username"
  {/* @highlight-start */}
  validators={{
    onChangeAsync: async ({ value: username }) => {
      const result = await fetch(
        /* check the availability of a username from an external API */
      );

      return result.success ? undefined : `${username} is not available.`
    }
  }}
  {/* @highlight-end */}
  children={(field) => (
    <Field.Root name={field.name} /* forward the field props */ />
  )}
>
```

### Submitting data

To submit the form:

- Pass a submit handler function to the `onSubmit` parameter of `useForm`.
- Call `form.handleSubmit()` from an event handler such as form `onSubmit` or `onClick` on a button.

```tsx
import { useForm } from '@tanstack/react-form';

const form = useForm({
  // @highlight-start
  onSubmit: async ({ value: formValues }) => {
    /* prettier-ignore */
    await fetch(/* POST the `formValues` to an external API */);
  },
  {/* @highlight-end */}
});

<form
  onSubmit={(event) => {
    event.preventDefault();
    // @highlight-start
    form.handleSubmit(); // @highlight-text "form.handleSubmit()"
    // @highlight-end
  }}
>
  {/* form fields */}
  {/* @highlight-start */}
  <button type="submit">Submit</button>
  {/* @highlight-end */}
</form>;
```

