<a id="form"></a>

# Form

A native form element with consolidated error handling.

[Open mounted Solid demo: form/hero](/solid/components/form)

<a id="anatomy"></a>

## Anatomy

Form is composed together with [Field](/solid/components/field). Import the components and place them together:

```tsx
import { Field } from '@unstyled-solid/base-ui/field';
import { Form } from '@unstyled-solid/base-ui/form';
<Form>
  <Field.Root>
    <Field.Label />
    <Field.Control />
    <Field.Error />
  </Field.Root>
</Form>;
```

<a id="examples"></a>

## Examples

<a id="submit-with-a-server-function"></a>

### Submit with server-side validation

Handle the native `onSubmit` event, call `event.preventDefault()`, and collect values with `new FormData(event.currentTarget)`. Store the response in Solid state and pass field errors to the `errors` prop. This demo simulates an asynchronous server response, disables submission while pending, and explicitly calls `form.reset()` after the response. In your application, send the data to your server endpoint; no React Server Function or action hook is required.

[Open mounted Solid demo: form/form-action](/solid/components/form)

<a id="submit-form-values-as-a-javascript-object"></a>

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

<a id="using-with-zod"></a>

### Using with Zod

When parsing the schema using `schema.safeParse()`, the `z.flattenError(result.error).fieldErrors` data can be used to map the errors to each field's `name`.

[Open mounted Solid demo: form/zod](/solid/components/form)

<a id="api-reference"></a>

## API reference

<a id="api-466f726d"></a>

<a id="api-466f726d2e2470726f70732e70726f703a61636365707443686172736574"></a>

<a id="api-466f726d2e2470726f70732e70726f703a616374696f6e"></a>

<a id="api-466f726d2e2470726f70732e70726f703a6175746f636f6d706c657465"></a>

<a id="api-466f726d2e2470726f70732e70726f703a656e636f64696e67"></a>

<a id="api-466f726d2e2470726f70732e70726f703a656e6374797065"></a>

<a id="api-466f726d2e2470726f70732e70726f703a6d6574686f64"></a>

<a id="api-466f726d2e2470726f70732e70726f703a6e616d65"></a>

<a id="api-466f726d2e2470726f70732e70726f703a6e6f56616c6964617465"></a>

<a id="api-466f726d2e2470726f70732e70726f703a72656c"></a>

<a id="api-466f726d2e2470726f70732e70726f703a746172676574"></a>

### Form

A native form element with consolidated error handling.

Declaration: `packages/solid/build/types/form/Form.d.ts:6`

#### Declaration

```typescript
<FormValues extends Record<string, any> = Record<string, any>>(props: FormProps<FormValues>) => JSX.Element
```

<a id="api-466f726d2e2470726f70732e6572726f7273"></a>

<a id="Form-errors"></a>

<a id="api-466f726d2e2470726f70732e616374696f6e73526566"></a>

<a id="Form-actionsRef"></a>

<a id="api-466f726d2e2470726f70732e6e6f56616c6964617465"></a>

<a id="Form-noValidate"></a>

<a id="api-466f726d2e2470726f70732e6f6e466f726d5375626d6974"></a>

<a id="Form-onFormSubmit"></a>

<a id="api-466f726d2e2470726f70732e76616c69646174696f6e4d6f6465"></a>

<a id="Form-validationMode"></a>

<a id="api-466f726d2e2470726f70732e636c617373"></a>

<a id="Form-class"></a>

<a id="api-466f726d2e2470726f70732e7374796c65"></a>

<a id="Form-style"></a>

<a id="api-466f726d2e2470726f70732e72656e646572"></a>

<a id="Form-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| errors | `FormErrors \| undefined` | No | Unavailable |  |
| actionsRef | `((actions: FormActions \| null) => void) \| undefined` | No | Unavailable | Solid callback ref; receives null on replacement or disposal. |
| noValidate | `boolean \| undefined` | No | Unavailable |  |
| onFormSubmit | `((formValues: FormValues, eventDetails: FormSubmitEventDetails) => void) \| undefined` | No | Unavailable |  |
| validationMode | `FormValidationMode \| undefined` | No | 'onSubmit' |  |
| class | `JSX.ClassValue \| ((state: Readonly<FormState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<FormState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<JSX.FormHTMLAttributes<HTMLFormElement> & JSX.Properties<HTMLFormElement> & { noValidate?: boolean; }, FormState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accept`, `accept-charset`, `accesskey`, `action`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocomplete`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `encoding`, `enctype`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `method`, `name`, `nonce`, `novalidate`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:acceptCharset`, `prop:action`, `prop:autocomplete`, `prop:encoding`, `prop:enctype`, `prop:method`, `prop:name`, `prop:noValidate`, `prop:rel`, `prop:target`, `property`, `ref`, `rel`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `target`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-466f726d2e50726f7073"></a>

<a id="formprops"></a>

<a id="api-466f726d2e50726f70732e70726f703a61636365707443686172736574"></a>

<a id="api-466f726d2e50726f70732e70726f703a616374696f6e"></a>

<a id="api-466f726d2e50726f70732e70726f703a6175746f636f6d706c657465"></a>

<a id="api-466f726d2e50726f70732e70726f703a656e636f64696e67"></a>

<a id="api-466f726d2e50726f70732e70726f703a656e6374797065"></a>

<a id="api-466f726d2e50726f70732e70726f703a6d6574686f64"></a>

<a id="api-466f726d2e50726f70732e70726f703a6e616d65"></a>

<a id="api-466f726d2e50726f70732e70726f703a6e6f56616c6964617465"></a>

<a id="api-466f726d2e50726f70732e70726f703a72656c"></a>

<a id="api-466f726d2e50726f70732e70726f703a746172676574"></a>

### Related exported type: Form.Props

Declaration: `packages/solid/build/types/form/Form.d.ts:26`

#### Declaration

```typescript
Props<FormValues>
```

<a id="api-466f726d2e50726f70732e6572726f7273"></a>

<a id="FormProps-errors"></a>

<a id="api-466f726d2e50726f70732e616374696f6e73526566"></a>

<a id="FormProps-actionsRef"></a>

<a id="api-466f726d2e50726f70732e6e6f56616c6964617465"></a>

<a id="FormProps-noValidate"></a>

<a id="api-466f726d2e50726f70732e6f6e466f726d5375626d6974"></a>

<a id="FormProps-onFormSubmit"></a>

<a id="api-466f726d2e50726f70732e76616c69646174696f6e4d6f6465"></a>

<a id="FormProps-validationMode"></a>

<a id="api-466f726d2e50726f70732e636c617373"></a>

<a id="FormProps-class"></a>

<a id="api-466f726d2e50726f70732e7374796c65"></a>

<a id="FormProps-style"></a>

<a id="api-466f726d2e50726f70732e72656e646572"></a>

<a id="FormProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| errors | `FormErrors \| undefined` | No | Unavailable |  |
| actionsRef | `((actions: FormActions \| null) => void) \| undefined` | No | Unavailable | Solid callback ref; receives null on replacement or disposal. |
| noValidate | `boolean \| undefined` | No | Unavailable |  |
| onFormSubmit | `((formValues: FormValues, eventDetails: FormSubmitEventDetails) => void) \| undefined` | No | Unavailable |  |
| validationMode | `FormValidationMode \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<FormState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<FormState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<JSX.FormHTMLAttributes<HTMLFormElement> & JSX.Properties<HTMLFormElement> & { noValidate?: boolean; }, FormState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accept`, `accept-charset`, `accesskey`, `action`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocomplete`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `encoding`, `enctype`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `method`, `name`, `nonce`, `novalidate`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:acceptCharset`, `prop:action`, `prop:autocomplete`, `prop:encoding`, `prop:enctype`, `prop:method`, `prop:name`, `prop:noValidate`, `prop:rel`, `prop:target`, `property`, `ref`, `rel`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `target`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-466f726d2e5374617465"></a>

<a id="formstate"></a>

### Related exported type: Form.State

Declaration: `packages/solid/build/types/form/Form.d.ts:27`

#### Declaration

```typescript
FormState
```

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-466f726d2e416374696f6e73"></a>

<a id="formactions"></a>

### Related exported type: Form.Actions

Declaration: `packages/solid/build/types/form/Form.d.ts:28`

#### Declaration

```typescript
FormActions
```

<a id="api-466f726d2e416374696f6e732e76616c6964617465"></a>

<a id="FormActions-validate"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| validate | `(fieldName?: string) => void` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-466f726d2e5375626d69744576656e7444657461696c73"></a>

<a id="formsubmiteventdetails"></a>

### Related exported type: Form.SubmitEventDetails

Declaration: `packages/solid/build/types/form/Form.d.ts:31`

#### Declaration

```typescript
{ reason: "none"; event: Event; }
```

<a id="api-466f726d2e5375626d69744576656e7444657461696c732e6576656e74"></a>

<a id="FormSubmitEventDetails-event"></a>

<a id="api-466f726d2e5375626d69744576656e7444657461696c732e726561736f6e"></a>

<a id="FormSubmitEventDetails-reason"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| event | `Event` | Yes | Unavailable | Native DOM event associated with the change. Programmatic changes can use a Base UI-created Event. |
| reason | `"none"` | Yes | Unavailable | Reason for the requested change; it discriminates the native event type. |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-466f726d2e5375626d69744576656e74526561736f6e"></a>

<a id="formsubmiteventreason"></a>

### Related exported type: Form.SubmitEventReason

Declaration: `packages/solid/build/types/form/Form.d.ts:30`

#### Declaration

```typescript
"none"
```

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-466f726d2e56616c69646174696f6e4d6f6465"></a>

<a id="formvalidationmode"></a>

### Related exported type: Form.ValidationMode

Declaration: `packages/solid/build/types/form/Form.d.ts:29`

#### Declaration

```typescript
FormValidationMode
```

Inherited DOM attributes: `__@iterator@106`, `anchor`, `at`, `big`, `blink`, `bold`, `charAt`, `charCodeAt`, `codePointAt`, `concat`, `endsWith`, `fixed`, `fontcolor`, `fontsize`, `includes`, `indexOf`, `isWellFormed`, `italics`, `lastIndexOf`, `length`, `link`, `localeCompare`, `match`, `matchAll`, `normalize`, `padEnd`, `padStart`, `repeat`, `replace`, `replaceAll`, `search`, `slice`, `small`, `split`, `startsWith`, `strike`, `sub`, `substr`, `substring`, `sup`, `toLocaleLowerCase`, `toLocaleUpperCase`, `toLowerCase`, `toString`, `toUpperCase`, `toWellFormed`, `trim`, `trimEnd`, `trimLeft`, `trimRight`, `trimStart`, `valueOf`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-466f726d2e56616c756573"></a>

<a id="formvalues"></a>

### Related exported type: Form.Values

Declaration: `packages/solid/build/types/form/Form.d.ts:32`

#### Declaration

```typescript
FormValues
```

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-466f726d50726f7073"></a>

<a id="api-466f726d50726f70732e70726f703a61636365707443686172736574"></a>

<a id="api-466f726d50726f70732e70726f703a616374696f6e"></a>

<a id="api-466f726d50726f70732e70726f703a6175746f636f6d706c657465"></a>

<a id="api-466f726d50726f70732e70726f703a656e636f64696e67"></a>

<a id="api-466f726d50726f70732e70726f703a656e6374797065"></a>

<a id="api-466f726d50726f70732e70726f703a6d6574686f64"></a>

<a id="api-466f726d50726f70732e70726f703a6e616d65"></a>

<a id="api-466f726d50726f70732e70726f703a6e6f56616c6964617465"></a>

<a id="api-466f726d50726f70732e70726f703a72656c"></a>

<a id="api-466f726d50726f70732e70726f703a746172676574"></a>

### Related exported type: FormProps

Declaration: `packages/solid/build/types/form/Form.d.ts:15`

#### Declaration

```typescript
FormProps<FormValues>
```

<a id="api-466f726d50726f70732e6572726f7273"></a>

<a id="api-466f726d50726f70732e616374696f6e73526566"></a>

<a id="api-466f726d50726f70732e6e6f56616c6964617465"></a>

<a id="api-466f726d50726f70732e6f6e466f726d5375626d6974"></a>

<a id="api-466f726d50726f70732e76616c69646174696f6e4d6f6465"></a>

<a id="api-466f726d50726f70732e636c617373"></a>

<a id="api-466f726d50726f70732e7374796c65"></a>

<a id="api-466f726d50726f70732e72656e646572"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| errors | `FormErrors \| undefined` | No | Unavailable |  |
| actionsRef | `((actions: FormActions \| null) => void) \| undefined` | No | Unavailable | Solid callback ref; receives null on replacement or disposal. |
| noValidate | `boolean \| undefined` | No | Unavailable |  |
| onFormSubmit | `((formValues: FormValues, eventDetails: FormSubmitEventDetails) => void) \| undefined` | No | Unavailable |  |
| validationMode | `FormValidationMode \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<FormState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<FormState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<JSX.FormHTMLAttributes<HTMLFormElement> & JSX.Properties<HTMLFormElement> & { noValidate?: boolean; }, FormState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accept`, `accept-charset`, `accesskey`, `action`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocomplete`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `encoding`, `enctype`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `method`, `name`, `nonce`, `novalidate`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:acceptCharset`, `prop:action`, `prop:autocomplete`, `prop:encoding`, `prop:enctype`, `prop:method`, `prop:name`, `prop:noValidate`, `prop:rel`, `prop:target`, `property`, `ref`, `rel`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `target`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-466f726d5374617465"></a>

### Related exported type: FormState

Declaration: `packages/solid/build/types/form/Form.d.ts:13`

#### Declaration

```typescript
FormState
```

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

