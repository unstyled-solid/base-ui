<a id="forms"></a>

# Forms

A guide to building forms with Base UI components.

Base UI form control components extend the native [constraint validation API](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#the-constraint-validation-api) so you can build forms for collecting user input or providing control over an interface. Use the Form and Field APIs below for submission, validation, and server-returned errors.

[Open mounted Solid demo: handbook-forms/hero](/solid/handbook/forms)

<a id="naming-form-controls"></a>

## Naming form controls

Form controls must have an accessible name in order to be recognized by assistive technologies. Use the label strategy below for each control type.

<a id="input-controls"></a>

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
import { Field } from '@unstyled-solid/base-ui/field';
import { Switch } from '@unstyled-solid/base-ui/switch';
<Field.Root>
  <Field.Label>
    <Switch.Root />
    Developer mode
  </Field.Label>
  <Field.Description>Enables extra tools for web developers</Field.Description>
</Field.Root>;
```

<a id="trigger-based-controls"></a>

### Trigger-based controls

- `Combobox` (input inside popup): use `<Combobox.Label>`.
- `Select`: use `<Select.Label>`.
- `Slider`: use `<Slider.Label>`. For multi-thumb sliders, also add an `aria-label` on each
  `<Slider.Thumb>` to distinguish the thumbs.

<a id="fallback"></a>

### Fallback

If no visible label is rendered, provide `aria-label` on the actual form control.

<a id="describing-the-control"></a>

### Describing the control

`<Field.Description>` automatically assigns an accessible description:

```tsx
import { Form } from '@unstyled-solid/base-ui/form';
import { Field } from '@unstyled-solid/base-ui/field';
import { Select } from '@unstyled-solid/base-ui/select';
import { Slider } from '@unstyled-solid/base-ui/slider';
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

<a id="labeling-control-groups"></a>

### Labeling control groups

Compose `<Fieldset>` when a single label applies to multiple controls, such as a range slider with multiple thumbs or a section that combines several inputs. For checkbox and radio groups, keep the group label in `<Fieldset.Legend>` and wrap each option with `<Field.Item>`:

```tsx
import { Form } from '@unstyled-solid/base-ui/form';
import { Field } from '@unstyled-solid/base-ui/field';
import { Fieldset } from '@unstyled-solid/base-ui/fieldset';
import { Radio } from '@unstyled-solid/base-ui/radio';
import { RadioGroup } from '@unstyled-solid/base-ui/radio-group';
import { Slider } from '@unstyled-solid/base-ui/slider';
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
import { Form } from '@unstyled-solid/base-ui/form';
import { Field } from '@unstyled-solid/base-ui/field';
import { Fieldset } from '@unstyled-solid/base-ui/fieldset';
import { Checkbox } from '@unstyled-solid/base-ui/checkbox';
import { CheckboxGroup } from '@unstyled-solid/base-ui/checkbox-group';
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

<a id="building-form-fields"></a>

## Building form fields

Pass the `name` prop to `<Field.Root>` to include the wrapped control's value when a parent form is submitted:

```tsx
import { Form } from '@unstyled-solid/base-ui/form';
import { Field } from '@unstyled-solid/base-ui/field';
import { Combobox } from '@unstyled-solid/base-ui/combobox';
<Form>
  <Field.Root name="country">
    <Field.Label>Country of residence</Field.Label>
    <Combobox.Root />
  </Field.Root>
</Form>;
```

<a id="submitting-data"></a>

## Submitting data

You can take over form submission using the native `onSubmit`, or custom `onFormSubmit` props:

```tsx
import { Form } from '@unstyled-solid/base-ui/form';
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
import { Form } from '@unstyled-solid/base-ui/form';
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

<a id="constraint-validation"></a>

## Constraint validation

Base UI form components support native HTML validation attributes for many validation rules:

- `required` specifies a required field.
- `minlength` and `maxlength` specify a valid length for text fields.
- `pattern` specifies a regular expression that the field value must match.
- `step` specifies an increment that numeric field values must be an integral multiple of.

```tsx
import { Field } from '@unstyled-solid/base-ui/field';
<Field.Root name="website">
  <Field.Control type="url" required pattern="https?://.*" />
  <Field.Error />
</Field.Root>;
```

Base UI form components use a hidden input to participate in native form submission and validation.
To anchor the hidden input near a control so the native validation bubble points to the correct area, ensure the component has been given a `name`, and wrap controls in a relatively positioned container for best results.

```tsx
import { Field } from '@unstyled-solid/base-ui/field';
import { Select } from '@unstyled-solid/base-ui/select';
<Field.Root name="apple">
  <Select.Root>
    <Select.Label>Apple</Select.Label>
    <div class="relative">
      <Select.Trigger />
    </div>
  </Select.Root>
</Field.Root>;
```

<a id="custom-validation"></a>

## Custom validation

You can add custom validation logic by passing a synchronous or asynchronous validation function to the `validate` prop, which runs after native validations have passed.

Use the `validationMode` prop to configure when validation is performed:

- `onSubmit` (default) validates all fields when the containing `<Form>` is submitted, afterwards invalid fields revalidate when their value changes.
- `onBlur` validates the field when focus moves away.
- `onChange` validates the field when the value changes, for example, after each keypress in a text field or when a checkbox is checked or unchecked.

`validationDebounceTime` can be used to debounce the function in use cases such as asynchronous requests or text fields that validate `onChange`.

```tsx
import { Field } from '@unstyled-solid/base-ui/field';
<Field.Root
  name="username"
  validationMode="onChange"
  validationDebounceTime={300}
  validate={async (value) => {
    if (value === 'admin') return 'Reserved for system use.';
    const response = await fetch(
      '/api/usernames/' + encodeURIComponent(String(value)),
    );
    const result: {
      available: boolean;
    } = await response.json();
    if (!result.available) return `${value} is unavailable.`;
    return null;
  }}
>
  <Field.Control required minlength={3} />
  <Field.Error />
</Field.Root>;
```

<a id="server-side-validation"></a>

## Server-side validation

You can pass errors returned by (post-submission) server-side validation to the `errors` prop, which will be merged into the client-side field state for display.

This should be an object with field names as keys, and an error string or array of strings as the value. Once a field's value changes, any corresponding error in `errors` will be cleared from the field state.

```tsx
import { createSignal } from 'solid-js';
import { Form } from '@unstyled-solid/base-ui/form';
import { Field } from '@unstyled-solid/base-ui/field';
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

<a id="displaying-errors"></a>

## Displaying errors

Use `<Field.Error>` without `children` to automatically display the field's native error message when invalid. The `match` prop can be used to customize the message based on the validity state, and manage internationalization from your application logic:

```tsx
<Field.Error match="valueMissing">You must create a username</Field.Error>;
```

