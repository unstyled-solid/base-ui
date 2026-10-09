<a id="otp-field"></a>

# OTP Field

A one-time password input composed of individual character slots.

[Open mounted Solid demo: otp-field/hero](/solid/components/otp-field)

<a id="usage-guidelines"></a>

## Usage guidelines

- **Form controls must have an accessible name**: It can be created using a `<label>` element or the `Field` component. See [Labeling an OTP field](#labeling-an-otp-field) and the [forms guide](/solid/handbook/forms).

<a id="anatomy"></a>

## Anatomy

Import the component and assemble its parts:

```tsx
import { OTPField } from '@unstyled-solid/base-ui/otp-field';
<OTPField.Root>
  <OTPField.Input />
  <OTPField.Separator />
</OTPField.Root>;
```

<a id="examples"></a>

## Examples

<a id="labeling-an-otp-field"></a>

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

<a id="form-integration"></a>

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

<a id="alphanumeric-verification-codes"></a>

### Alphanumeric verification codes

Use `validationType="alphanumeric"` for recovery, backup, or invite codes that mix letters and
numbers.

[Open mounted Solid demo: otp-field/alphanumeric](/solid/components/otp-field)

<a id="grouped-layouts"></a>

### Grouped layouts

Wrap subsets of inputs in your own layout elements and use `<OTPField.Separator>` when you
want the code presented in smaller visual chunks such as `123-456`.

[Open mounted Solid demo: otp-field/grouped](/solid/components/otp-field)

<a id="placeholder-hints"></a>

### Placeholder hints

`<OTPField.Input>` is a real input, so native `placeholder` props and CSS work as usual. This
example keeps placeholder hints visible until the active slot receives focus.

[Open mounted Solid demo: otp-field/focused-placeholder](/solid/components/otp-field)

<a id="custom-normalization"></a>

### Custom normalization

Use `normalizeValue` to normalize accepted values before state updates, such as converting
alphanumeric codes to uppercase. It runs after `validationType` filtering, and the result is filtered
against `validationType` again. Use `validationType="none"` when the normalizer should provide the
full validation rule.

Pair custom rules with `inputMode` for keyboard hints and `onValueInvalid` for rejected characters.

[Open mounted Solid demo: otp-field/custom-sanitize](/solid/components/otp-field)

<a id="masked-entry"></a>

### Masked entry

Use `mask` when the code should be obscured while it is being typed.

[Open mounted Solid demo: otp-field/password](/solid/components/otp-field)

<a id="api-reference"></a>

## API reference

<a id="root"></a>

### Root

<a id="api-4f54504669656c642e526f6f74"></a>

<a id="otpfieldroot"></a>

<a id="api-4f54504669656c642e526f6f742e2470726f70732e70726f703a616c69676e"></a>

### OTPField.Root

Groups OTP slots and owns the logical string and native validation input.

Declaration: `packages/solid/build/types/otp-field/root/OTPFieldRoot.d.ts:7`

#### Declaration

```typescript
(props: OTPFieldRootProps) => JSX.Element
```

<a id="api-4f54504669656c642e526f6f742e2470726f70732e6e616d65"></a>

<a id="OTPFieldRoot-name"></a>

<a id="api-4f54504669656c642e526f6f742e2470726f70732e64656661756c7456616c7565"></a>

<a id="OTPFieldRoot-defaultValue"></a>

<a id="api-4f54504669656c642e526f6f742e2470726f70732e76616c7565"></a>

<a id="OTPFieldRoot-value"></a>

<a id="api-4f54504669656c642e526f6f742e2470726f70732e6f6e56616c75654368616e6765"></a>

<a id="OTPFieldRoot-onValueChange"></a>

<a id="api-4f54504669656c642e526f6f742e2470726f70732e6175746f436f6d706c657465"></a>

<a id="OTPFieldRoot-autoComplete"></a>

<a id="api-4f54504669656c642e526f6f742e2470726f70732e6175746f5375626d6974"></a>

<a id="OTPFieldRoot-autoSubmit"></a>

<a id="api-4f54504669656c642e526f6f742e2470726f70732e666f726d"></a>

<a id="OTPFieldRoot-form"></a>

<a id="api-4f54504669656c642e526f6f742e2470726f70732e696e7075744d6f6465"></a>

<a id="OTPFieldRoot-inputMode"></a>

<a id="api-4f54504669656c642e526f6f742e2470726f70732e6c656e677468"></a>

<a id="OTPFieldRoot-length"></a>

<a id="api-4f54504669656c642e526f6f742e2470726f70732e6d61736b"></a>

<a id="OTPFieldRoot-mask"></a>

<a id="api-4f54504669656c642e526f6f742e2470726f70732e6e6f726d616c697a6556616c7565"></a>

<a id="OTPFieldRoot-normalizeValue"></a>

<a id="api-4f54504669656c642e526f6f742e2470726f70732e6f6e56616c7565436f6d706c657465"></a>

<a id="OTPFieldRoot-onValueComplete"></a>

<a id="api-4f54504669656c642e526f6f742e2470726f70732e6f6e56616c7565496e76616c6964"></a>

<a id="OTPFieldRoot-onValueInvalid"></a>

<a id="api-4f54504669656c642e526f6f742e2470726f70732e76616c69646174696f6e54797065"></a>

<a id="OTPFieldRoot-validationType"></a>

<a id="api-4f54504669656c642e526f6f742e2470726f70732e64697361626c6564"></a>

<a id="OTPFieldRoot-disabled"></a>

<a id="api-4f54504669656c642e526f6f742e2470726f70732e726561644f6e6c79"></a>

<a id="OTPFieldRoot-readOnly"></a>

<a id="api-4f54504669656c642e526f6f742e2470726f70732e7265717569726564"></a>

<a id="OTPFieldRoot-required"></a>

<a id="api-4f54504669656c642e526f6f742e2470726f70732e6964"></a>

<a id="OTPFieldRoot-id"></a>

<a id="api-4f54504669656c642e526f6f742e2470726f70732e636c617373"></a>

<a id="OTPFieldRoot-class"></a>

<a id="api-4f54504669656c642e526f6f742e2470726f70732e7374796c65"></a>

<a id="OTPFieldRoot-style"></a>

<a id="api-4f54504669656c642e526f6f742e2470726f70732e72656e646572"></a>

<a id="OTPFieldRoot-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| name | `string \| undefined` | No | Unavailable |  |
| defaultValue | `string \| undefined` | No | '' |  |
| value | `string \| undefined` | No | Unavailable |  |
| onValueChange | `((value: string, details: OTPFieldRootChangeEventDetails) => void) \| undefined` | No | Unavailable |  |
| autoComplete | `string \| undefined` | No | 'one-time-code' |  |
| autoSubmit | `boolean \| undefined` | No | Unavailable |  |
| form | `string \| undefined` | No | Unavailable |  |
| inputMode | `"search" \| "decimal" \| "numeric" \| "none" \| "url" \| "text" \| "email" \| "tel" \| JSX.RemoveAttribute` | No | Unavailable |  |
| length | `number` | Yes | Unavailable | Required before slots mount, including during SSR. |
| mask | `boolean \| undefined` | No | false |  |
| normalizeValue | `((value: string) => string) \| undefined` | No | Unavailable | Applied after built-in filtering, then revalidated and clamped. Must be idempotent. |
| onValueComplete | `((value: string, details: OTPFieldRootCompleteEventDetails) => void) \| undefined` | No | Unavailable |  |
| onValueInvalid | `((value: string, details: OTPFieldRootInvalidEventDetails) => void) \| undefined` | No | Unavailable |  |
| validationType | `OTPValidationType \| undefined` | No | 'numeric' |  |
| disabled | `boolean \| undefined` | No | Unavailable |  |
| readOnly | `boolean \| undefined` | No | false |  |
| required | `boolean \| undefined` | No | false |  |
| id | `string \| undefined` | No | Unavailable | First slot ID; subsequent IDs append `-2`, `-3`, etc. |
| class | `JSX.ClassValue \| ((state: Readonly<OTPFieldRootState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<OTPFieldRootState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<JSX.HTMLAttributes<HTMLDivElement> & JSX.Properties<HTMLDivElement>, OTPFieldRootState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-4f54504669656c64526f6f7444617461417474726962757465732e64697361626c6564"></a>

<a id="api-4f54504669656c64526f6f7444617461417474726962757465732e726561646f6e6c79"></a>

<a id="api-4f54504669656c64526f6f7444617461417474726962757465732e7265717569726564"></a>

<a id="api-4f54504669656c64526f6f7444617461417474726962757465732e76616c6964"></a>

<a id="api-4f54504669656c64526f6f7444617461417474726962757465732e696e76616c6964"></a>

<a id="api-4f54504669656c64526f6f7444617461417474726962757465732e6469727479"></a>

<a id="api-4f54504669656c64526f6f7444617461417474726962757465732e746f7563686564"></a>

<a id="api-4f54504669656c64526f6f7444617461417474726962757465732e636f6d706c657465"></a>

<a id="api-4f54504669656c64526f6f7444617461417474726962757465732e66696c6c6564"></a>

<a id="api-4f54504669656c64526f6f7444617461417474726962757465732e666f6375736564"></a>

| Name | Description |
| --- | --- |
| data-disabled |  |
| data-readonly |  |
| data-required |  |
| data-valid |  |
| data-invalid |  |
| data-dirty |  |
| data-touched |  |
| data-complete |  |
| data-filled |  |
| data-focused |  |

#### CSS variables

Metadata status: unavailable.

<a id="api-4f54504669656c642e526f6f742e50726f7073"></a>

<a id="otpfieldrootprops"></a>

<a id="api-4f54504669656c642e526f6f742e50726f70732e70726f703a616c69676e"></a>

### Related exported type: OTPField.Root.Props

Declaration: `packages/solid/build/types/otp-field/root/OTPFieldRoot.d.ts:46`

#### Declaration

```typescript
OTPFieldRootProps
```

<a id="api-4f54504669656c642e526f6f742e50726f70732e6e616d65"></a>

<a id="OTPFieldRootProps-name"></a>

<a id="api-4f54504669656c642e526f6f742e50726f70732e64656661756c7456616c7565"></a>

<a id="OTPFieldRootProps-defaultValue"></a>

<a id="api-4f54504669656c642e526f6f742e50726f70732e76616c7565"></a>

<a id="OTPFieldRootProps-value"></a>

<a id="api-4f54504669656c642e526f6f742e50726f70732e6f6e56616c75654368616e6765"></a>

<a id="OTPFieldRootProps-onValueChange"></a>

<a id="api-4f54504669656c642e526f6f742e50726f70732e6175746f436f6d706c657465"></a>

<a id="OTPFieldRootProps-autoComplete"></a>

<a id="api-4f54504669656c642e526f6f742e50726f70732e6175746f5375626d6974"></a>

<a id="OTPFieldRootProps-autoSubmit"></a>

<a id="api-4f54504669656c642e526f6f742e50726f70732e666f726d"></a>

<a id="OTPFieldRootProps-form"></a>

<a id="api-4f54504669656c642e526f6f742e50726f70732e696e7075744d6f6465"></a>

<a id="OTPFieldRootProps-inputMode"></a>

<a id="api-4f54504669656c642e526f6f742e50726f70732e6c656e677468"></a>

<a id="OTPFieldRootProps-length"></a>

<a id="api-4f54504669656c642e526f6f742e50726f70732e6d61736b"></a>

<a id="OTPFieldRootProps-mask"></a>

<a id="api-4f54504669656c642e526f6f742e50726f70732e6e6f726d616c697a6556616c7565"></a>

<a id="OTPFieldRootProps-normalizeValue"></a>

<a id="api-4f54504669656c642e526f6f742e50726f70732e6f6e56616c7565436f6d706c657465"></a>

<a id="OTPFieldRootProps-onValueComplete"></a>

<a id="api-4f54504669656c642e526f6f742e50726f70732e6f6e56616c7565496e76616c6964"></a>

<a id="OTPFieldRootProps-onValueInvalid"></a>

<a id="api-4f54504669656c642e526f6f742e50726f70732e76616c69646174696f6e54797065"></a>

<a id="OTPFieldRootProps-validationType"></a>

<a id="api-4f54504669656c642e526f6f742e50726f70732e64697361626c6564"></a>

<a id="OTPFieldRootProps-disabled"></a>

<a id="api-4f54504669656c642e526f6f742e50726f70732e726561644f6e6c79"></a>

<a id="OTPFieldRootProps-readOnly"></a>

<a id="api-4f54504669656c642e526f6f742e50726f70732e7265717569726564"></a>

<a id="OTPFieldRootProps-required"></a>

<a id="api-4f54504669656c642e526f6f742e50726f70732e6964"></a>

<a id="OTPFieldRootProps-id"></a>

<a id="api-4f54504669656c642e526f6f742e50726f70732e636c617373"></a>

<a id="OTPFieldRootProps-class"></a>

<a id="api-4f54504669656c642e526f6f742e50726f70732e7374796c65"></a>

<a id="OTPFieldRootProps-style"></a>

<a id="api-4f54504669656c642e526f6f742e50726f70732e72656e646572"></a>

<a id="OTPFieldRootProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| name | `string \| undefined` | No | Unavailable |  |
| defaultValue | `string \| undefined` | No | Unavailable |  |
| value | `string \| undefined` | No | Unavailable |  |
| onValueChange | `((value: string, details: OTPFieldRootChangeEventDetails) => void) \| undefined` | No | Unavailable |  |
| autoComplete | `string \| undefined` | No | Unavailable |  |
| autoSubmit | `boolean \| undefined` | No | Unavailable |  |
| form | `string \| undefined` | No | Unavailable |  |
| inputMode | `"search" \| "decimal" \| "numeric" \| "none" \| "url" \| "text" \| "email" \| "tel" \| JSX.RemoveAttribute` | No | Unavailable |  |
| length | `number` | Yes | Unavailable | Required before slots mount, including during SSR. |
| mask | `boolean \| undefined` | No | Unavailable |  |
| normalizeValue | `((value: string) => string) \| undefined` | No | Unavailable | Applied after built-in filtering, then revalidated and clamped. Must be idempotent. |
| onValueComplete | `((value: string, details: OTPFieldRootCompleteEventDetails) => void) \| undefined` | No | Unavailable |  |
| onValueInvalid | `((value: string, details: OTPFieldRootInvalidEventDetails) => void) \| undefined` | No | Unavailable |  |
| validationType | `OTPValidationType \| undefined` | No | Unavailable |  |
| disabled | `boolean \| undefined` | No | Unavailable |  |
| readOnly | `boolean \| undefined` | No | Unavailable |  |
| required | `boolean \| undefined` | No | Unavailable |  |
| id | `string \| undefined` | No | Unavailable | First slot ID; subsequent IDs append `-2`, `-3`, etc. |
| class | `JSX.ClassValue \| ((state: Readonly<OTPFieldRootState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<OTPFieldRootState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<JSX.HTMLAttributes<HTMLDivElement> & JSX.Properties<HTMLDivElement>, OTPFieldRootState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4f54504669656c642e526f6f742e5374617465"></a>

<a id="otpfieldrootstate"></a>

### Related exported type: OTPField.Root.State

Declaration: `packages/solid/build/types/otp-field/root/OTPFieldRoot.d.ts:47`

#### Declaration

```typescript
OTPFieldRootState
```

<a id="api-4f54504669656c642e526f6f742e53746174652e76616c7565"></a>

<a id="OTPFieldRootState-value"></a>

<a id="api-4f54504669656c642e526f6f742e53746174652e636f6d706c657465"></a>

<a id="OTPFieldRootState-complete"></a>

<a id="api-4f54504669656c642e526f6f742e53746174652e6469727479"></a>

<a id="OTPFieldRootState-dirty"></a>

<a id="api-4f54504669656c642e526f6f742e53746174652e66696c6c6564"></a>

<a id="OTPFieldRootState-filled"></a>

<a id="api-4f54504669656c642e526f6f742e53746174652e666f6375736564"></a>

<a id="OTPFieldRootState-focused"></a>

<a id="api-4f54504669656c642e526f6f742e53746174652e6c656e677468"></a>

<a id="OTPFieldRootState-length"></a>

<a id="api-4f54504669656c642e526f6f742e53746174652e746f7563686564"></a>

<a id="OTPFieldRootState-touched"></a>

<a id="api-4f54504669656c642e526f6f742e53746174652e64697361626c6564"></a>

<a id="OTPFieldRootState-disabled"></a>

<a id="api-4f54504669656c642e526f6f742e53746174652e726561644f6e6c79"></a>

<a id="OTPFieldRootState-readOnly"></a>

<a id="api-4f54504669656c642e526f6f742e53746174652e7265717569726564"></a>

<a id="OTPFieldRootState-required"></a>

<a id="api-4f54504669656c642e526f6f742e53746174652e76616c6964"></a>

<a id="OTPFieldRootState-valid"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| value | `string` | Yes | Unavailable |  |
| complete | `boolean` | Yes | Unavailable |  |
| dirty | `boolean` | Yes | Unavailable |  |
| filled | `boolean` | Yes | Unavailable |  |
| focused | `boolean` | Yes | Unavailable |  |
| length | `number` | Yes | Unavailable |  |
| touched | `boolean` | Yes | Unavailable |  |
| disabled | `boolean` | Yes | Unavailable |  |
| readOnly | `boolean` | Yes | Unavailable |  |
| required | `boolean` | Yes | Unavailable |  |
| valid | `boolean \| null` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4f54504669656c642e526f6f742e4368616e67654576656e74526561736f6e"></a>

<a id="otpfieldrootchangeeventreason"></a>

### Related exported type: OTPField.Root.ChangeEventReason

Declaration: `packages/solid/build/types/otp-field/root/OTPFieldRoot.d.ts:49`

#### Declaration

```typescript
OTPFieldRootChangeEventReason
```

Inherited DOM attributes: `__@iterator@106`, `anchor`, `at`, `big`, `blink`, `bold`, `charAt`, `charCodeAt`, `codePointAt`, `concat`, `endsWith`, `fixed`, `fontcolor`, `fontsize`, `includes`, `indexOf`, `isWellFormed`, `italics`, `lastIndexOf`, `length`, `link`, `localeCompare`, `match`, `matchAll`, `normalize`, `padEnd`, `padStart`, `repeat`, `replace`, `replaceAll`, `search`, `slice`, `small`, `split`, `startsWith`, `strike`, `sub`, `substr`, `substring`, `sup`, `toLocaleLowerCase`, `toLocaleUpperCase`, `toLowerCase`, `toString`, `toUpperCase`, `toWellFormed`, `trim`, `trimEnd`, `trimLeft`, `trimRight`, `trimStart`, `valueOf`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4f54504669656c642e526f6f742e4368616e67654576656e7444657461696c73"></a>

<a id="otpfieldrootchangeeventdetails"></a>

### Related exported type: OTPField.Root.ChangeEventDetails

Declaration: `packages/solid/build/types/otp-field/root/OTPFieldRoot.d.ts:50`

#### Declaration

```typescript
OTPFieldRootChangeEventDetails
```

<a id="api-4f54504669656c642e526f6f742e4368616e67654576656e7444657461696c732e616c6c6f7750726f7061676174696f6e"></a>

<a id="OTPFieldRootChangeEventDetails-allowPropagation"></a>

<a id="api-4f54504669656c642e526f6f742e4368616e67654576656e7444657461696c732e63616e63656c"></a>

<a id="OTPFieldRootChangeEventDetails-cancel"></a>

<a id="api-4f54504669656c642e526f6f742e4368616e67654576656e7444657461696c732e6576656e74"></a>

<a id="OTPFieldRootChangeEventDetails-event"></a>

<a id="api-4f54504669656c642e526f6f742e4368616e67654576656e7444657461696c732e697343616e63656c6564"></a>

<a id="OTPFieldRootChangeEventDetails-isCanceled"></a>

<a id="api-4f54504669656c642e526f6f742e4368616e67654576656e7444657461696c732e697350726f7061676174696f6e416c6c6f776564"></a>

<a id="OTPFieldRootChangeEventDetails-isPropagationAllowed"></a>

<a id="api-4f54504669656c642e526f6f742e4368616e67654576656e7444657461696c732e726561736f6e"></a>

<a id="OTPFieldRootChangeEventDetails-reason"></a>

<a id="api-4f54504669656c642e526f6f742e4368616e67654576656e7444657461696c732e74726967676572"></a>

<a id="OTPFieldRootChangeEventDetails-trigger"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| allowPropagation | `() => void` | Yes | Unavailable | Marks this change transaction as allowing propagation. |
| cancel | `() => void` | Yes | Unavailable | Cancels the Base UI change transaction; separate from the DOM event’s preventDefault() and preventBaseUIHandler(). |
| event | `Event \| ClipboardEvent \| FocusEvent \| InputEvent \| KeyboardEvent` | Yes | Unavailable | Native DOM event associated with the change. Programmatic changes can use a Base UI-created Event. |
| isCanceled | `boolean` | Yes | Unavailable | Whether cancel() has been called for this change transaction. |
| isPropagationAllowed | `boolean` | Yes | Unavailable | Whether allowPropagation() has been called for this change transaction. |
| reason | `"input-change" \| "input-clear" \| "input-paste" \| "keyboard"` | Yes | Unavailable | Reason for the requested change; it discriminates the native event type. |
| trigger | `Element \| undefined` | Yes | Unavailable | Trigger element associated with this change, when available. |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4f54504669656c642e526f6f742e436f6d706c6574654576656e7444657461696c73"></a>

<a id="otpfieldrootcompleteeventdetails"></a>

### Related exported type: OTPField.Root.CompleteEventDetails

Declaration: `packages/solid/build/types/otp-field/root/OTPFieldRoot.d.ts:54`

#### Declaration

```typescript
OTPFieldRootCompleteEventDetails
```

<a id="api-4f54504669656c642e526f6f742e436f6d706c6574654576656e7444657461696c732e6576656e74"></a>

<a id="OTPFieldRootCompleteEventDetails-event"></a>

<a id="api-4f54504669656c642e526f6f742e436f6d706c6574654576656e7444657461696c732e726561736f6e"></a>

<a id="OTPFieldRootCompleteEventDetails-reason"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| event | `Event \| ClipboardEvent \| InputEvent` | Yes | Unavailable | Native DOM event associated with the change. Programmatic changes can use a Base UI-created Event. |
| reason | `"input-change" \| "input-paste"` | Yes | Unavailable | Reason for the requested change; it discriminates the native event type. |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4f54504669656c642e526f6f742e436f6d706c6574654576656e74526561736f6e"></a>

<a id="otpfieldrootcompleteeventreason"></a>

### Related exported type: OTPField.Root.CompleteEventReason

Declaration: `packages/solid/build/types/otp-field/root/OTPFieldRoot.d.ts:53`

#### Declaration

```typescript
OTPFieldRootCompleteEventReason
```

Inherited DOM attributes: `__@iterator@106`, `anchor`, `at`, `big`, `blink`, `bold`, `charAt`, `charCodeAt`, `codePointAt`, `concat`, `endsWith`, `fixed`, `fontcolor`, `fontsize`, `includes`, `indexOf`, `isWellFormed`, `italics`, `lastIndexOf`, `length`, `link`, `localeCompare`, `match`, `matchAll`, `normalize`, `padEnd`, `padStart`, `repeat`, `replace`, `replaceAll`, `search`, `slice`, `small`, `split`, `startsWith`, `strike`, `sub`, `substr`, `substring`, `sup`, `toLocaleLowerCase`, `toLocaleUpperCase`, `toLowerCase`, `toString`, `toUpperCase`, `toWellFormed`, `trim`, `trimEnd`, `trimLeft`, `trimRight`, `trimStart`, `valueOf`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4f54504669656c642e526f6f742e496e76616c69644576656e7444657461696c73"></a>

<a id="otpfieldrootinvalideventdetails"></a>

### Related exported type: OTPField.Root.InvalidEventDetails

Declaration: `packages/solid/build/types/otp-field/root/OTPFieldRoot.d.ts:52`

#### Declaration

```typescript
OTPFieldRootInvalidEventDetails
```

<a id="api-4f54504669656c642e526f6f742e496e76616c69644576656e7444657461696c732e6576656e74"></a>

<a id="OTPFieldRootInvalidEventDetails-event"></a>

<a id="api-4f54504669656c642e526f6f742e496e76616c69644576656e7444657461696c732e726561736f6e"></a>

<a id="OTPFieldRootInvalidEventDetails-reason"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| event | `Event \| ClipboardEvent \| InputEvent` | Yes | Unavailable | Native DOM event associated with the change. Programmatic changes can use a Base UI-created Event. |
| reason | `"input-change" \| "input-paste"` | Yes | Unavailable | Reason for the requested change; it discriminates the native event type. |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4f54504669656c642e526f6f742e496e76616c69644576656e74526561736f6e"></a>

<a id="otpfieldrootinvalideventreason"></a>

### Related exported type: OTPField.Root.InvalidEventReason

Declaration: `packages/solid/build/types/otp-field/root/OTPFieldRoot.d.ts:51`

#### Declaration

```typescript
OTPFieldRootInvalidEventReason
```

Inherited DOM attributes: `__@iterator@106`, `anchor`, `at`, `big`, `blink`, `bold`, `charAt`, `charCodeAt`, `codePointAt`, `concat`, `endsWith`, `fixed`, `fontcolor`, `fontsize`, `includes`, `indexOf`, `isWellFormed`, `italics`, `lastIndexOf`, `length`, `link`, `localeCompare`, `match`, `matchAll`, `normalize`, `padEnd`, `padStart`, `repeat`, `replace`, `replaceAll`, `search`, `slice`, `small`, `split`, `startsWith`, `strike`, `sub`, `substr`, `substring`, `sup`, `toLocaleLowerCase`, `toLocaleUpperCase`, `toLowerCase`, `toString`, `toUpperCase`, `toWellFormed`, `trim`, `trimEnd`, `trimLeft`, `trimRight`, `trimStart`, `valueOf`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4f54504669656c642e526f6f742e56616c69646174696f6e54797065"></a>

<a id="otpfieldrootvalidationtype"></a>

### Related exported type: OTPField.Root.ValidationType

Declaration: `packages/solid/build/types/otp-field/root/OTPFieldRoot.d.ts:48`

#### Declaration

```typescript
OTPValidationType
```

Inherited DOM attributes: `__@iterator@106`, `anchor`, `at`, `big`, `blink`, `bold`, `charAt`, `charCodeAt`, `codePointAt`, `concat`, `endsWith`, `fixed`, `fontcolor`, `fontsize`, `includes`, `indexOf`, `isWellFormed`, `italics`, `lastIndexOf`, `length`, `link`, `localeCompare`, `match`, `matchAll`, `normalize`, `padEnd`, `padStart`, `repeat`, `replace`, `replaceAll`, `search`, `slice`, `small`, `split`, `startsWith`, `strike`, `sub`, `substr`, `substring`, `sup`, `toLocaleLowerCase`, `toLocaleUpperCase`, `toLowerCase`, `toString`, `toUpperCase`, `toWellFormed`, `trim`, `trimEnd`, `trimLeft`, `trimRight`, `trimStart`, `valueOf`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="input"></a>

### Input

<a id="api-4f54504669656c642e496e707574"></a>

<a id="otpfieldinput"></a>

<a id="api-4f54504669656c642e496e7075742e2470726f70732e70726f703a616363657074"></a>

<a id="api-4f54504669656c642e496e7075742e2470726f70732e70726f703a616c69676e"></a>

<a id="api-4f54504669656c642e496e7075742e2470726f70732e70726f703a616c74"></a>

<a id="api-4f54504669656c642e496e7075742e2470726f70732e70726f703a6175746f636f6d706c657465"></a>

<a id="api-4f54504669656c642e496e7075742e2470726f70732e70726f703a63617074757265"></a>

<a id="api-4f54504669656c642e496e7075742e2470726f70732e70726f703a6469724e616d65"></a>

<a id="api-4f54504669656c642e496e7075742e2470726f70732e70726f703a64697361626c6564"></a>

<a id="api-4f54504669656c642e496e7075742e2470726f70732e70726f703a666f726d416374696f6e"></a>

<a id="api-4f54504669656c642e496e7075742e2470726f70732e70726f703a666f726d456e6374797065"></a>

<a id="api-4f54504669656c642e496e7075742e2470726f70732e70726f703a666f726d4d6574686f64"></a>

<a id="api-4f54504669656c642e496e7075742e2470726f70732e70726f703a666f726d4e6f56616c6964617465"></a>

<a id="api-4f54504669656c642e496e7075742e2470726f70732e70726f703a666f726d546172676574"></a>

<a id="api-4f54504669656c642e496e7075742e2470726f70732e70726f703a686569676874"></a>

<a id="api-4f54504669656c642e496e7075742e2470726f70732e70726f703a696e64657465726d696e617465"></a>

<a id="api-4f54504669656c642e496e7075742e2470726f70732e70726f703a6d6178"></a>

<a id="api-4f54504669656c642e496e7075742e2470726f70732e70726f703a6d61784c656e677468"></a>

<a id="api-4f54504669656c642e496e7075742e2470726f70732e70726f703a6d696e"></a>

<a id="api-4f54504669656c642e496e7075742e2470726f70732e70726f703a6d696e4c656e677468"></a>

<a id="api-4f54504669656c642e496e7075742e2470726f70732e70726f703a6d756c7469706c65"></a>

<a id="api-4f54504669656c642e496e7075742e2470726f70732e70726f703a6e616d65"></a>

<a id="api-4f54504669656c642e496e7075742e2470726f70732e70726f703a7061747465726e"></a>

<a id="api-4f54504669656c642e496e7075742e2470726f70732e70726f703a706c616365686f6c646572"></a>

<a id="api-4f54504669656c642e496e7075742e2470726f70732e70726f703a706f706f766572546172676574416374696f6e"></a>

<a id="api-4f54504669656c642e496e7075742e2470726f70732e70726f703a706f706f766572546172676574456c656d656e74"></a>

<a id="api-4f54504669656c642e496e7075742e2470726f70732e70726f703a726561644f6e6c79"></a>

<a id="api-4f54504669656c642e496e7075742e2470726f70732e70726f703a7265717569726564"></a>

<a id="api-4f54504669656c642e496e7075742e2470726f70732e70726f703a73656c656374696f6e446972656374696f6e"></a>

<a id="api-4f54504669656c642e496e7075742e2470726f70732e70726f703a73656c656374696f6e456e64"></a>

<a id="api-4f54504669656c642e496e7075742e2470726f70732e70726f703a73656c656374696f6e5374617274"></a>

<a id="api-4f54504669656c642e496e7075742e2470726f70732e70726f703a73697a65"></a>

<a id="api-4f54504669656c642e496e7075742e2470726f70732e70726f703a737263"></a>

<a id="api-4f54504669656c642e496e7075742e2470726f70732e70726f703a73746570"></a>

<a id="api-4f54504669656c642e496e7075742e2470726f70732e70726f703a74797065"></a>

<a id="api-4f54504669656c642e496e7075742e2470726f70732e70726f703a7573654d6170"></a>

<a id="api-4f54504669656c642e496e7075742e2470726f70732e70726f703a76616c7565417344617465"></a>

<a id="api-4f54504669656c642e496e7075742e2470726f70732e70726f703a76616c756541734e756d626572"></a>

<a id="api-4f54504669656c642e496e7075742e2470726f70732e70726f703a7765626b69746469726563746f7279"></a>

<a id="api-4f54504669656c642e496e7075742e2470726f70732e70726f703a7769647468"></a>

### OTPField.Input

A single OTP slot. Indexing belongs to the shared, DOM-ordered composite list.

Declaration: `packages/solid/build/types/otp-field/input/OTPFieldInput.d.ts:5`

#### Declaration

```typescript
(props: OTPFieldInputProps) => JSX.Element
```

<a id="api-4f54504669656c642e496e7075742e2470726f70732e636c617373"></a>

<a id="OTPFieldInput-class"></a>

<a id="api-4f54504669656c642e496e7075742e2470726f70732e7374796c65"></a>

<a id="OTPFieldInput-style"></a>

<a id="api-4f54504669656c642e496e7075742e2470726f70732e72656e646572"></a>

<a id="OTPFieldInput-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<OTPFieldInputState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<OTPFieldInputState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<JSX.InputHTMLAttributes<HTMLInputElement> & JSX.Properties<HTMLInputElement>, OTPFieldInputState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accept`, `accesskey`, `align`, `alpha`, `alt`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocomplete`, `autocorrect`, `autofocus`, `capture`, `checked`, `children`, `colorspace`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `dirname`, `disabled`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `form`, `formaction`, `formenctype`, `formmethod`, `formnovalidate`, `formtarget`, `height`, `hidden`, `id`, `incremental`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `list`, `max`, `maxlength`, `min`, `minlength`, `multiple`, `name`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `pattern`, `placeholder`, `popover`, `popovertarget`, `popovertargetaction`, `prefix`, `prop:accept`, `prop:align`, `prop:alt`, `prop:autocomplete`, `prop:capture`, `prop:checked`, `prop:defaultChecked`, `prop:defaultValue`, `prop:dirName`, `prop:disabled`, `prop:formAction`, `prop:formEnctype`, `prop:formMethod`, `prop:formNoValidate`, `prop:formTarget`, `prop:height`, `prop:indeterminate`, `prop:max`, `prop:maxLength`, `prop:min`, `prop:minLength`, `prop:multiple`, `prop:name`, `prop:pattern`, `prop:placeholder`, `prop:popoverTargetAction`, `prop:popoverTargetElement`, `prop:readOnly`, `prop:required`, `prop:selectionDirection`, `prop:selectionEnd`, `prop:selectionStart`, `prop:size`, `prop:src`, `prop:step`, `prop:type`, `prop:useMap`, `prop:value`, `prop:valueAsDate`, `prop:valueAsNumber`, `prop:webkitdirectory`, `prop:width`, `property`, `readonly`, `ref`, `required`, `resource`, `results`, `role`, `size`, `slot`, `spellcheck`, `src`, `step`, `tabindex`, `textContent`, `title`, `translate`, `type`, `typeof`, `usemap`, `value`, `virtualkeyboardpolicy`, `vocab`, `webkitdirectory`, `width`, `writingsuggestions`

#### Data attributes

<a id="api-4f54504669656c64496e70757444617461417474726962757465732e64697361626c6564"></a>

<a id="api-4f54504669656c64496e70757444617461417474726962757465732e726561646f6e6c79"></a>

<a id="api-4f54504669656c64496e70757444617461417474726962757465732e7265717569726564"></a>

<a id="api-4f54504669656c64496e70757444617461417474726962757465732e76616c6964"></a>

<a id="api-4f54504669656c64496e70757444617461417474726962757465732e696e76616c6964"></a>

<a id="api-4f54504669656c64496e70757444617461417474726962757465732e6469727479"></a>

<a id="api-4f54504669656c64496e70757444617461417474726962757465732e746f7563686564"></a>

<a id="api-4f54504669656c64496e70757444617461417474726962757465732e636f6d706c657465"></a>

<a id="api-4f54504669656c64496e70757444617461417474726962757465732e66696c6c6564"></a>

<a id="api-4f54504669656c64496e70757444617461417474726962757465732e666f6375736564"></a>

| Name | Description |
| --- | --- |
| data-disabled |  |
| data-readonly |  |
| data-required |  |
| data-valid |  |
| data-invalid |  |
| data-dirty |  |
| data-touched |  |
| data-complete |  |
| data-filled |  |
| data-focused |  |

#### CSS variables

Metadata status: unavailable.

<a id="api-4f54504669656c642e496e7075742e50726f7073"></a>

<a id="otpfieldinputprops"></a>

<a id="api-4f54504669656c642e496e7075742e50726f70732e70726f703a616363657074"></a>

<a id="api-4f54504669656c642e496e7075742e50726f70732e70726f703a616c69676e"></a>

<a id="api-4f54504669656c642e496e7075742e50726f70732e70726f703a616c74"></a>

<a id="api-4f54504669656c642e496e7075742e50726f70732e70726f703a6175746f636f6d706c657465"></a>

<a id="api-4f54504669656c642e496e7075742e50726f70732e70726f703a63617074757265"></a>

<a id="api-4f54504669656c642e496e7075742e50726f70732e70726f703a6469724e616d65"></a>

<a id="api-4f54504669656c642e496e7075742e50726f70732e70726f703a64697361626c6564"></a>

<a id="api-4f54504669656c642e496e7075742e50726f70732e70726f703a666f726d416374696f6e"></a>

<a id="api-4f54504669656c642e496e7075742e50726f70732e70726f703a666f726d456e6374797065"></a>

<a id="api-4f54504669656c642e496e7075742e50726f70732e70726f703a666f726d4d6574686f64"></a>

<a id="api-4f54504669656c642e496e7075742e50726f70732e70726f703a666f726d4e6f56616c6964617465"></a>

<a id="api-4f54504669656c642e496e7075742e50726f70732e70726f703a666f726d546172676574"></a>

<a id="api-4f54504669656c642e496e7075742e50726f70732e70726f703a686569676874"></a>

<a id="api-4f54504669656c642e496e7075742e50726f70732e70726f703a696e64657465726d696e617465"></a>

<a id="api-4f54504669656c642e496e7075742e50726f70732e70726f703a6d6178"></a>

<a id="api-4f54504669656c642e496e7075742e50726f70732e70726f703a6d61784c656e677468"></a>

<a id="api-4f54504669656c642e496e7075742e50726f70732e70726f703a6d696e"></a>

<a id="api-4f54504669656c642e496e7075742e50726f70732e70726f703a6d696e4c656e677468"></a>

<a id="api-4f54504669656c642e496e7075742e50726f70732e70726f703a6d756c7469706c65"></a>

<a id="api-4f54504669656c642e496e7075742e50726f70732e70726f703a6e616d65"></a>

<a id="api-4f54504669656c642e496e7075742e50726f70732e70726f703a7061747465726e"></a>

<a id="api-4f54504669656c642e496e7075742e50726f70732e70726f703a706c616365686f6c646572"></a>

<a id="api-4f54504669656c642e496e7075742e50726f70732e70726f703a706f706f766572546172676574416374696f6e"></a>

<a id="api-4f54504669656c642e496e7075742e50726f70732e70726f703a706f706f766572546172676574456c656d656e74"></a>

<a id="api-4f54504669656c642e496e7075742e50726f70732e70726f703a726561644f6e6c79"></a>

<a id="api-4f54504669656c642e496e7075742e50726f70732e70726f703a7265717569726564"></a>

<a id="api-4f54504669656c642e496e7075742e50726f70732e70726f703a73656c656374696f6e446972656374696f6e"></a>

<a id="api-4f54504669656c642e496e7075742e50726f70732e70726f703a73656c656374696f6e456e64"></a>

<a id="api-4f54504669656c642e496e7075742e50726f70732e70726f703a73656c656374696f6e5374617274"></a>

<a id="api-4f54504669656c642e496e7075742e50726f70732e70726f703a73697a65"></a>

<a id="api-4f54504669656c642e496e7075742e50726f70732e70726f703a737263"></a>

<a id="api-4f54504669656c642e496e7075742e50726f70732e70726f703a73746570"></a>

<a id="api-4f54504669656c642e496e7075742e50726f70732e70726f703a74797065"></a>

<a id="api-4f54504669656c642e496e7075742e50726f70732e70726f703a7573654d6170"></a>

<a id="api-4f54504669656c642e496e7075742e50726f70732e70726f703a76616c7565417344617465"></a>

<a id="api-4f54504669656c642e496e7075742e50726f70732e70726f703a76616c756541734e756d626572"></a>

<a id="api-4f54504669656c642e496e7075742e50726f70732e70726f703a7765626b69746469726563746f7279"></a>

<a id="api-4f54504669656c642e496e7075742e50726f70732e70726f703a7769647468"></a>

### Related exported type: OTPField.Input.Props

Declaration: `packages/solid/build/types/otp-field/input/OTPFieldInput.d.ts:15`

#### Declaration

```typescript
OTPFieldInputProps
```

<a id="api-4f54504669656c642e496e7075742e50726f70732e636c617373"></a>

<a id="OTPFieldInputProps-class"></a>

<a id="api-4f54504669656c642e496e7075742e50726f70732e7374796c65"></a>

<a id="OTPFieldInputProps-style"></a>

<a id="api-4f54504669656c642e496e7075742e50726f70732e72656e646572"></a>

<a id="OTPFieldInputProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<OTPFieldInputState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<OTPFieldInputState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<JSX.InputHTMLAttributes<HTMLInputElement> & JSX.Properties<HTMLInputElement>, OTPFieldInputState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accept`, `accesskey`, `align`, `alpha`, `alt`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocomplete`, `autocorrect`, `autofocus`, `capture`, `checked`, `children`, `colorspace`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `dirname`, `disabled`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `form`, `formaction`, `formenctype`, `formmethod`, `formnovalidate`, `formtarget`, `height`, `hidden`, `id`, `incremental`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `list`, `max`, `maxlength`, `min`, `minlength`, `multiple`, `name`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `pattern`, `placeholder`, `popover`, `popovertarget`, `popovertargetaction`, `prefix`, `prop:accept`, `prop:align`, `prop:alt`, `prop:autocomplete`, `prop:capture`, `prop:checked`, `prop:defaultChecked`, `prop:defaultValue`, `prop:dirName`, `prop:disabled`, `prop:formAction`, `prop:formEnctype`, `prop:formMethod`, `prop:formNoValidate`, `prop:formTarget`, `prop:height`, `prop:indeterminate`, `prop:max`, `prop:maxLength`, `prop:min`, `prop:minLength`, `prop:multiple`, `prop:name`, `prop:pattern`, `prop:placeholder`, `prop:popoverTargetAction`, `prop:popoverTargetElement`, `prop:readOnly`, `prop:required`, `prop:selectionDirection`, `prop:selectionEnd`, `prop:selectionStart`, `prop:size`, `prop:src`, `prop:step`, `prop:type`, `prop:useMap`, `prop:value`, `prop:valueAsDate`, `prop:valueAsNumber`, `prop:webkitdirectory`, `prop:width`, `property`, `readonly`, `ref`, `required`, `resource`, `results`, `role`, `size`, `slot`, `spellcheck`, `src`, `step`, `tabindex`, `textContent`, `title`, `translate`, `type`, `typeof`, `usemap`, `value`, `virtualkeyboardpolicy`, `vocab`, `webkitdirectory`, `width`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4f54504669656c642e496e7075742e5374617465"></a>

<a id="otpfieldinputstate"></a>

### Related exported type: OTPField.Input.State

Declaration: `packages/solid/build/types/otp-field/input/OTPFieldInput.d.ts:14`

#### Declaration

```typescript
OTPFieldInputState
```

<a id="api-4f54504669656c642e496e7075742e53746174652e76616c7565"></a>

<a id="OTPFieldInputState-value"></a>

<a id="api-4f54504669656c642e496e7075742e53746174652e636f6d706c657465"></a>

<a id="OTPFieldInputState-complete"></a>

<a id="api-4f54504669656c642e496e7075742e53746174652e6469727479"></a>

<a id="OTPFieldInputState-dirty"></a>

<a id="api-4f54504669656c642e496e7075742e53746174652e66696c6c6564"></a>

<a id="OTPFieldInputState-filled"></a>

<a id="api-4f54504669656c642e496e7075742e53746174652e666f6375736564"></a>

<a id="OTPFieldInputState-focused"></a>

<a id="api-4f54504669656c642e496e7075742e53746174652e696e646578"></a>

<a id="OTPFieldInputState-index"></a>

<a id="api-4f54504669656c642e496e7075742e53746174652e6c656e677468"></a>

<a id="OTPFieldInputState-length"></a>

<a id="api-4f54504669656c642e496e7075742e53746174652e746f7563686564"></a>

<a id="OTPFieldInputState-touched"></a>

<a id="api-4f54504669656c642e496e7075742e53746174652e64697361626c6564"></a>

<a id="OTPFieldInputState-disabled"></a>

<a id="api-4f54504669656c642e496e7075742e53746174652e726561644f6e6c79"></a>

<a id="OTPFieldInputState-readOnly"></a>

<a id="api-4f54504669656c642e496e7075742e53746174652e7265717569726564"></a>

<a id="OTPFieldInputState-required"></a>

<a id="api-4f54504669656c642e496e7075742e53746174652e76616c6964"></a>

<a id="OTPFieldInputState-valid"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| value | `string` | Yes | Unavailable |  |
| complete | `boolean` | Yes | Unavailable |  |
| dirty | `boolean` | Yes | Unavailable |  |
| filled | `boolean` | Yes | Unavailable |  |
| focused | `boolean` | Yes | Unavailable |  |
| index | `number` | Yes | Unavailable |  |
| length | `number` | Yes | Unavailable |  |
| touched | `boolean` | Yes | Unavailable |  |
| disabled | `boolean` | Yes | Unavailable |  |
| readOnly | `boolean` | Yes | Unavailable |  |
| required | `boolean` | Yes | Unavailable |  |
| valid | `boolean \| null` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="separator"></a>

### Separator

<a id="api-4f54504669656c642e536570617261746f72"></a>

<a id="otpfieldseparator"></a>

<a id="api-4f54504669656c642e536570617261746f722e2470726f70732e70726f703a616c69676e"></a>

### OTPField.Separator

A separator element accessible to screen readers.
Renders a `<div>` element.

Declaration: `packages/solid/build/types/separator/Separator.d.ts:6`

#### Declaration

```typescript
(componentProps: Separator.Props) => JSX.Element
```

<a id="api-4f54504669656c642e536570617261746f722e2470726f70732e6f7269656e746174696f6e"></a>

<a id="OTPFieldSeparator-orientation"></a>

<a id="api-4f54504669656c642e536570617261746f722e2470726f70732e636c617373"></a>

<a id="OTPFieldSeparator-class"></a>

<a id="api-4f54504669656c642e536570617261746f722e2470726f70732e7374796c65"></a>

<a id="OTPFieldSeparator-style"></a>

<a id="api-4f54504669656c642e536570617261746f722e2470726f70732e72656e646572"></a>

<a id="OTPFieldSeparator-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| orientation | `Orientation \| undefined` | No | 'horizontal' | The orientation of the separator. |
| class | `JSX.ClassValue \| ((state: Readonly<SeparatorState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<SeparatorState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, SeparatorState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-4f54504669656c642e536570617261746f722e64617461417474726962757465732e6f7269656e746174696f6e"></a>

| Name | Description |
| --- | --- |
| data-orientation | Indicates the orientation of the separator. |

#### CSS variables

Metadata status: unavailable.

<a id="api-4f54504669656c642e536570617261746f722e50726f7073"></a>

<a id="otpfieldseparatorprops"></a>

<a id="api-4f54504669656c642e536570617261746f722e50726f70732e70726f703a616c69676e"></a>

### Related exported type: OTPField.Separator.Props

Declaration: `packages/solid/build/types/separator/Separator.d.ts:19`

#### Declaration

```typescript
SeparatorProps
```

<a id="api-4f54504669656c642e536570617261746f722e50726f70732e6f7269656e746174696f6e"></a>

<a id="OTPFieldSeparatorProps-orientation"></a>

<a id="api-4f54504669656c642e536570617261746f722e50726f70732e636c617373"></a>

<a id="OTPFieldSeparatorProps-class"></a>

<a id="api-4f54504669656c642e536570617261746f722e50726f70732e7374796c65"></a>

<a id="OTPFieldSeparatorProps-style"></a>

<a id="api-4f54504669656c642e536570617261746f722e50726f70732e72656e646572"></a>

<a id="OTPFieldSeparatorProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| orientation | `Orientation \| undefined` | No | 'horizontal' | The orientation of the separator. |
| class | `JSX.ClassValue \| ((state: Readonly<SeparatorState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<SeparatorState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, SeparatorState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4f54504669656c642e536570617261746f722e5374617465"></a>

<a id="otpfieldseparatorstate"></a>

### Related exported type: OTPField.Separator.State

Declaration: `packages/solid/build/types/separator/Separator.d.ts:20`

#### Declaration

```typescript
SeparatorState
```

<a id="api-4f54504669656c642e536570617261746f722e53746174652e6f7269656e746174696f6e"></a>

<a id="OTPFieldSeparatorState-orientation"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| orientation | `Orientation` | Yes | Unavailable | The orientation of the separator. |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

