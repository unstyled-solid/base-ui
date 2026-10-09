<a id="radio-group"></a>

# Radio Group

Provides shared state to a series of radio buttons.

[Open mounted Solid demo: radio-group/hero](/solid/components/radio-group)

<a id="usage-guidelines"></a>

## Usage guidelines

- **Form controls must have an accessible name**: It can be created using `<label>` elements, or the `Field` and `Fieldset` components. See [Labeling a radio group](#labeling-a-radio-group) and the [forms guide](/solid/handbook/forms).

<a id="anatomy"></a>

## Anatomy

Import the component and assemble its parts:

```tsx
import { Radio } from '@unstyled-solid/base-ui/radio';
import { RadioGroup } from '@unstyled-solid/base-ui/radio-group';
<RadioGroup>
  <Radio.Root>
    <Radio.Indicator />
  </Radio.Root>
</RadioGroup>;
```

<a id="examples"></a>

## Examples

<a id="labeling-a-radio-group"></a>

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

<a id="rendering-as-a-native-button"></a>

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

<a id="form-integration"></a>

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

<a id="api-reference"></a>

## API reference

<a id="radiogroup"></a>

### RadioGroup

<a id="api-526164696f47726f7570"></a>

<a id="api-526164696f47726f75702e2470726f70732e70726f703a616c69676e"></a>

### RadioGroup

Provides shared, identity-based selection to radio buttons.

Declaration: `packages/solid/build/types/radio-group/RadioGroup.d.ts:6`

#### Declaration

```typescript
<Value = any>(props: RadioGroupProps<Value>) => JSX.Element
```

<a id="api-526164696f47726f75702e2470726f70732e6e616d65"></a>

<a id="RadioGroup-name"></a>

<a id="api-526164696f47726f75702e2470726f70732e64656661756c7456616c7565"></a>

<a id="RadioGroup-defaultValue"></a>

<a id="api-526164696f47726f75702e2470726f70732e76616c7565"></a>

<a id="RadioGroup-value"></a>

<a id="api-526164696f47726f75702e2470726f70732e6f6e56616c75654368616e6765"></a>

<a id="RadioGroup-onValueChange"></a>

<a id="api-526164696f47726f75702e2470726f70732e666f726d"></a>

<a id="RadioGroup-form"></a>

<a id="api-526164696f47726f75702e2470726f70732e64697361626c6564"></a>

<a id="RadioGroup-disabled"></a>

<a id="api-526164696f47726f75702e2470726f70732e726561644f6e6c79"></a>

<a id="RadioGroup-readOnly"></a>

<a id="api-526164696f47726f75702e2470726f70732e7265717569726564"></a>

<a id="RadioGroup-required"></a>

<a id="api-526164696f47726f75702e2470726f70732e696e707574526566"></a>

<a id="RadioGroup-inputRef"></a>

<a id="api-526164696f47726f75702e2470726f70732e636c617373"></a>

<a id="RadioGroup-class"></a>

<a id="api-526164696f47726f75702e2470726f70732e7374796c65"></a>

<a id="RadioGroup-style"></a>

<a id="api-526164696f47726f75702e2470726f70732e72656e646572"></a>

<a id="RadioGroup-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| name | `string \| undefined` | No | Unavailable |  |
| defaultValue | `Value \| undefined` | No | Unavailable |  |
| value | `Value \| undefined` | No | Unavailable |  |
| onValueChange | `((value: Value, details: RadioGroupChangeEventDetails) => void) \| undefined` | No | Unavailable |  |
| form | `string \| undefined` | No | Unavailable |  |
| disabled | `boolean \| undefined` | No | Unavailable |  |
| readOnly | `boolean \| undefined` | No | false |  |
| required | `boolean \| undefined` | No | false |  |
| inputRef | `JSX.Ref<HTMLInputElement>` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<RadioGroupState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<RadioGroupState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, RadioGroupState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-526164696f47726f757044617461417474726962757465732e64697361626c6564"></a>

| Name | Description |
| --- | --- |
| data-disabled |  |

#### CSS variables

Metadata status: unavailable.

<a id="api-526164696f47726f75702e50726f7073"></a>

<a id="radiogroupprops"></a>

<a id="api-526164696f47726f75702e50726f70732e70726f703a616c69676e"></a>

### Related exported type: RadioGroup.Props

Declaration: `packages/solid/build/types/radio-group/RadioGroup.d.ts:26`

#### Declaration

```typescript
Props<Value>
```

<a id="api-526164696f47726f75702e50726f70732e6e616d65"></a>

<a id="RadioGroupProps-name"></a>

<a id="api-526164696f47726f75702e50726f70732e64656661756c7456616c7565"></a>

<a id="RadioGroupProps-defaultValue"></a>

<a id="api-526164696f47726f75702e50726f70732e76616c7565"></a>

<a id="RadioGroupProps-value"></a>

<a id="api-526164696f47726f75702e50726f70732e6f6e56616c75654368616e6765"></a>

<a id="RadioGroupProps-onValueChange"></a>

<a id="api-526164696f47726f75702e50726f70732e666f726d"></a>

<a id="RadioGroupProps-form"></a>

<a id="api-526164696f47726f75702e50726f70732e64697361626c6564"></a>

<a id="RadioGroupProps-disabled"></a>

<a id="api-526164696f47726f75702e50726f70732e726561644f6e6c79"></a>

<a id="RadioGroupProps-readOnly"></a>

<a id="api-526164696f47726f75702e50726f70732e7265717569726564"></a>

<a id="RadioGroupProps-required"></a>

<a id="api-526164696f47726f75702e50726f70732e696e707574526566"></a>

<a id="RadioGroupProps-inputRef"></a>

<a id="api-526164696f47726f75702e50726f70732e636c617373"></a>

<a id="RadioGroupProps-class"></a>

<a id="api-526164696f47726f75702e50726f70732e7374796c65"></a>

<a id="RadioGroupProps-style"></a>

<a id="api-526164696f47726f75702e50726f70732e72656e646572"></a>

<a id="RadioGroupProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| name | `string \| undefined` | No | Unavailable |  |
| defaultValue | `Value \| undefined` | No | Unavailable |  |
| value | `Value \| undefined` | No | Unavailable |  |
| onValueChange | `((value: Value, details: RadioGroupChangeEventDetails) => void) \| undefined` | No | Unavailable |  |
| form | `string \| undefined` | No | Unavailable |  |
| disabled | `boolean \| undefined` | No | Unavailable |  |
| readOnly | `boolean \| undefined` | No | Unavailable |  |
| required | `boolean \| undefined` | No | Unavailable |  |
| inputRef | `JSX.Ref<HTMLInputElement>` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<RadioGroupState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<RadioGroupState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, RadioGroupState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-526164696f47726f75702e5374617465"></a>

<a id="radiogroupstate"></a>

### Related exported type: RadioGroup.State

Declaration: `packages/solid/build/types/radio-group/RadioGroup.d.ts:25`

#### Declaration

```typescript
RadioGroupState
```

<a id="api-526164696f47726f75702e53746174652e6469727479"></a>

<a id="RadioGroupState-dirty"></a>

<a id="api-526164696f47726f75702e53746174652e66696c6c6564"></a>

<a id="RadioGroupState-filled"></a>

<a id="api-526164696f47726f75702e53746174652e666f6375736564"></a>

<a id="RadioGroupState-focused"></a>

<a id="api-526164696f47726f75702e53746174652e746f7563686564"></a>

<a id="RadioGroupState-touched"></a>

<a id="api-526164696f47726f75702e53746174652e64697361626c6564"></a>

<a id="RadioGroupState-disabled"></a>

<a id="api-526164696f47726f75702e53746174652e726561644f6e6c79"></a>

<a id="RadioGroupState-readOnly"></a>

<a id="api-526164696f47726f75702e53746174652e7265717569726564"></a>

<a id="RadioGroupState-required"></a>

<a id="api-526164696f47726f75702e53746174652e76616c6964"></a>

<a id="RadioGroupState-valid"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| dirty | `boolean` | Yes | Unavailable |  |
| filled | `boolean` | Yes | Unavailable |  |
| focused | `boolean` | Yes | Unavailable |  |
| touched | `boolean` | Yes | Unavailable |  |
| disabled | `boolean` | Yes | Unavailable |  |
| readOnly | `boolean` | Yes | Unavailable |  |
| required | `boolean` | Yes | Unavailable |  |
| valid | `boolean \| null` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-526164696f47726f75702e4368616e67654576656e74526561736f6e"></a>

<a id="radiogroupchangeeventreason"></a>

### Related exported type: RadioGroup.ChangeEventReason

Declaration: `packages/solid/build/types/radio-group/RadioGroup.d.ts:27`

#### Declaration

```typescript
"none"
```

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-526164696f47726f75702e4368616e67654576656e7444657461696c73"></a>

<a id="radiogroupchangeeventdetails"></a>

### Related exported type: RadioGroup.ChangeEventDetails

Declaration: `packages/solid/build/types/radio-group/RadioGroup.d.ts:28`

#### Declaration

```typescript
{ reason: "none"; event: Event; cancel(): void; allowPropagation(): void; isCanceled: boolean; isPropagationAllowed: boolean; trigger: Element | undefined; }
```

<a id="api-526164696f47726f75702e4368616e67654576656e7444657461696c732e616c6c6f7750726f7061676174696f6e"></a>

<a id="RadioGroupChangeEventDetails-allowPropagation"></a>

<a id="api-526164696f47726f75702e4368616e67654576656e7444657461696c732e63616e63656c"></a>

<a id="RadioGroupChangeEventDetails-cancel"></a>

<a id="api-526164696f47726f75702e4368616e67654576656e7444657461696c732e6576656e74"></a>

<a id="RadioGroupChangeEventDetails-event"></a>

<a id="api-526164696f47726f75702e4368616e67654576656e7444657461696c732e697343616e63656c6564"></a>

<a id="RadioGroupChangeEventDetails-isCanceled"></a>

<a id="api-526164696f47726f75702e4368616e67654576656e7444657461696c732e697350726f7061676174696f6e416c6c6f776564"></a>

<a id="RadioGroupChangeEventDetails-isPropagationAllowed"></a>

<a id="api-526164696f47726f75702e4368616e67654576656e7444657461696c732e726561736f6e"></a>

<a id="RadioGroupChangeEventDetails-reason"></a>

<a id="api-526164696f47726f75702e4368616e67654576656e7444657461696c732e74726967676572"></a>

<a id="RadioGroupChangeEventDetails-trigger"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| allowPropagation | `() => void` | Yes | Unavailable | Marks this change transaction as allowing propagation. |
| cancel | `() => void` | Yes | Unavailable | Cancels the Base UI change transaction; separate from the DOM event’s preventDefault() and preventBaseUIHandler(). |
| event | `Event` | Yes | Unavailable | Native DOM event associated with the change. Programmatic changes can use a Base UI-created Event. |
| isCanceled | `boolean` | Yes | Unavailable | Whether cancel() has been called for this change transaction. |
| isPropagationAllowed | `boolean` | Yes | Unavailable | Whether allowPropagation() has been called for this change transaction. |
| reason | `"none"` | Yes | Unavailable | Reason for the requested change; it discriminates the native event type. |
| trigger | `Element \| undefined` | Yes | Unavailable | Trigger element associated with this change, when available. |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-526164696f47726f757050726f7073"></a>

<a id="api-526164696f47726f757050726f70732e70726f703a616c69676e"></a>

### Related exported type: RadioGroupProps

Declaration: `packages/solid/build/types/radio-group/RadioGroup.d.ts:11`

#### Declaration

```typescript
RadioGroupProps<Value>
```

<a id="api-526164696f47726f757050726f70732e6e616d65"></a>

<a id="api-526164696f47726f757050726f70732e64656661756c7456616c7565"></a>

<a id="api-526164696f47726f757050726f70732e76616c7565"></a>

<a id="api-526164696f47726f757050726f70732e6f6e56616c75654368616e6765"></a>

<a id="api-526164696f47726f757050726f70732e666f726d"></a>

<a id="api-526164696f47726f757050726f70732e64697361626c6564"></a>

<a id="api-526164696f47726f757050726f70732e726561644f6e6c79"></a>

<a id="api-526164696f47726f757050726f70732e7265717569726564"></a>

<a id="api-526164696f47726f757050726f70732e696e707574526566"></a>

<a id="api-526164696f47726f757050726f70732e636c617373"></a>

<a id="api-526164696f47726f757050726f70732e7374796c65"></a>

<a id="api-526164696f47726f757050726f70732e72656e646572"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| name | `string \| undefined` | No | Unavailable |  |
| defaultValue | `Value \| undefined` | No | Unavailable |  |
| value | `Value \| undefined` | No | Unavailable |  |
| onValueChange | `((value: Value, details: RadioGroupChangeEventDetails) => void) \| undefined` | No | Unavailable |  |
| form | `string \| undefined` | No | Unavailable |  |
| disabled | `boolean \| undefined` | No | Unavailable |  |
| readOnly | `boolean \| undefined` | No | Unavailable |  |
| required | `boolean \| undefined` | No | Unavailable |  |
| inputRef | `JSX.Ref<HTMLInputElement>` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<RadioGroupState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<RadioGroupState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, RadioGroupState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-526164696f47726f75705374617465"></a>

### Related exported type: RadioGroupState

Declaration: `packages/solid/build/types/radio-group/RadioGroup.d.ts:7`

#### Declaration

```typescript
RadioGroupState
```

<a id="api-526164696f47726f757053746174652e6469727479"></a>

<a id="api-526164696f47726f757053746174652e66696c6c6564"></a>

<a id="api-526164696f47726f757053746174652e666f6375736564"></a>

<a id="api-526164696f47726f757053746174652e746f7563686564"></a>

<a id="api-526164696f47726f757053746174652e64697361626c6564"></a>

<a id="api-526164696f47726f757053746174652e726561644f6e6c79"></a>

<a id="api-526164696f47726f757053746174652e7265717569726564"></a>

<a id="api-526164696f47726f757053746174652e76616c6964"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| dirty | `boolean` | Yes | Unavailable |  |
| filled | `boolean` | Yes | Unavailable |  |
| focused | `boolean` | Yes | Unavailable |  |
| touched | `boolean` | Yes | Unavailable |  |
| disabled | `boolean` | Yes | Unavailable |  |
| readOnly | `boolean` | Yes | Unavailable |  |
| required | `boolean` | Yes | Unavailable |  |
| valid | `boolean \| null` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="root"></a>

### Root

<a id="api-526164696f2e526f6f74"></a>

<a id="radioroot"></a>

### Radio.Root

A radio's visible span and adjacent native form input.

Declaration: `packages/solid/build/types/radio/root/RadioRoot.d.ts:5`

#### Declaration

```typescript
<Value = any>(props: RadioRootProps<Value>) => JSX.Element
```

<a id="api-526164696f2e526f6f742e2470726f70732e76616c7565"></a>

<a id="RadioRoot-value"></a>

<a id="api-526164696f2e526f6f742e2470726f70732e6e6174697665427574746f6e"></a>

<a id="RadioRoot-nativeButton"></a>

<a id="api-526164696f2e526f6f742e2470726f70732e64697361626c6564"></a>

<a id="RadioRoot-disabled"></a>

<a id="api-526164696f2e526f6f742e2470726f70732e726561644f6e6c79"></a>

<a id="RadioRoot-readOnly"></a>

<a id="api-526164696f2e526f6f742e2470726f70732e7265717569726564"></a>

<a id="RadioRoot-required"></a>

<a id="api-526164696f2e526f6f742e2470726f70732e696e707574526566"></a>

<a id="RadioRoot-inputRef"></a>

<a id="api-526164696f2e526f6f742e2470726f70732e636c617373"></a>

<a id="RadioRoot-class"></a>

<a id="api-526164696f2e526f6f742e2470726f70732e7374796c65"></a>

<a id="RadioRoot-style"></a>

<a id="api-526164696f2e526f6f742e2470726f70732e72656e646572"></a>

<a id="RadioRoot-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| value | `Value` | Yes | Unavailable |  |
| nativeButton | `boolean \| undefined` | No | false |  |
| disabled | `boolean \| undefined` | No | Unavailable |  |
| readOnly | `boolean \| undefined` | No | Unavailable |  |
| required | `boolean \| undefined` | No | Unavailable |  |
| inputRef | `JSX.Ref<HTMLInputElement>` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<RadioRootState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<RadioRootState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, RadioRootState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-526164696f526f6f7444617461417474726962757465732e636865636b6564"></a>

<a id="api-526164696f526f6f7444617461417474726962757465732e756e636865636b6564"></a>

<a id="api-526164696f526f6f7444617461417474726962757465732e64697361626c6564"></a>

<a id="api-526164696f526f6f7444617461417474726962757465732e726561646f6e6c79"></a>

<a id="api-526164696f526f6f7444617461417474726962757465732e7265717569726564"></a>

<a id="api-526164696f526f6f7444617461417474726962757465732e76616c6964"></a>

<a id="api-526164696f526f6f7444617461417474726962757465732e696e76616c6964"></a>

<a id="api-526164696f526f6f7444617461417474726962757465732e6469727479"></a>

<a id="api-526164696f526f6f7444617461417474726962757465732e746f7563686564"></a>

<a id="api-526164696f526f6f7444617461417474726962757465732e66696c6c6564"></a>

<a id="api-526164696f526f6f7444617461417474726962757465732e666f6375736564"></a>

| Name | Description |
| --- | --- |
| data-checked |  |
| data-unchecked |  |
| data-disabled |  |
| data-readonly |  |
| data-required |  |
| data-valid |  |
| data-invalid |  |
| data-dirty |  |
| data-touched |  |
| data-filled |  |
| data-focused |  |

#### CSS variables

Metadata status: unavailable.

<a id="api-526164696f2e526f6f742e50726f7073"></a>

<a id="radiorootprops"></a>

### Related exported type: Radio.Root.Props

Declaration: `packages/solid/build/types/radio/root/RadioRoot.d.ts:21`

#### Declaration

```typescript
Props<Value>
```

<a id="api-526164696f2e526f6f742e50726f70732e76616c7565"></a>

<a id="RadioRootProps-value"></a>

<a id="api-526164696f2e526f6f742e50726f70732e6e6174697665427574746f6e"></a>

<a id="RadioRootProps-nativeButton"></a>

<a id="api-526164696f2e526f6f742e50726f70732e64697361626c6564"></a>

<a id="RadioRootProps-disabled"></a>

<a id="api-526164696f2e526f6f742e50726f70732e726561644f6e6c79"></a>

<a id="RadioRootProps-readOnly"></a>

<a id="api-526164696f2e526f6f742e50726f70732e7265717569726564"></a>

<a id="RadioRootProps-required"></a>

<a id="api-526164696f2e526f6f742e50726f70732e696e707574526566"></a>

<a id="RadioRootProps-inputRef"></a>

<a id="api-526164696f2e526f6f742e50726f70732e636c617373"></a>

<a id="RadioRootProps-class"></a>

<a id="api-526164696f2e526f6f742e50726f70732e7374796c65"></a>

<a id="RadioRootProps-style"></a>

<a id="api-526164696f2e526f6f742e50726f70732e72656e646572"></a>

<a id="RadioRootProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| value | `Value` | Yes | Unavailable |  |
| nativeButton | `boolean \| undefined` | No | Unavailable |  |
| disabled | `boolean \| undefined` | No | Unavailable |  |
| readOnly | `boolean \| undefined` | No | Unavailable |  |
| required | `boolean \| undefined` | No | Unavailable |  |
| inputRef | `JSX.Ref<HTMLInputElement>` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<RadioRootState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<RadioRootState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, RadioRootState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-526164696f2e526f6f742e5374617465"></a>

<a id="radiorootstate"></a>

### Related exported type: Radio.Root.State

Declaration: `packages/solid/build/types/radio/root/RadioRoot.d.ts:20`

#### Declaration

```typescript
RadioRootState
```

<a id="api-526164696f2e526f6f742e53746174652e636865636b6564"></a>

<a id="RadioRootState-checked"></a>

<a id="api-526164696f2e526f6f742e53746174652e6469727479"></a>

<a id="RadioRootState-dirty"></a>

<a id="api-526164696f2e526f6f742e53746174652e66696c6c6564"></a>

<a id="RadioRootState-filled"></a>

<a id="api-526164696f2e526f6f742e53746174652e666f6375736564"></a>

<a id="RadioRootState-focused"></a>

<a id="api-526164696f2e526f6f742e53746174652e746f7563686564"></a>

<a id="RadioRootState-touched"></a>

<a id="api-526164696f2e526f6f742e53746174652e64697361626c6564"></a>

<a id="RadioRootState-disabled"></a>

<a id="api-526164696f2e526f6f742e53746174652e726561644f6e6c79"></a>

<a id="RadioRootState-readOnly"></a>

<a id="api-526164696f2e526f6f742e53746174652e7265717569726564"></a>

<a id="RadioRootState-required"></a>

<a id="api-526164696f2e526f6f742e53746174652e76616c6964"></a>

<a id="RadioRootState-valid"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| checked | `boolean` | Yes | Unavailable |  |
| dirty | `boolean` | Yes | Unavailable |  |
| filled | `boolean` | Yes | Unavailable |  |
| focused | `boolean` | Yes | Unavailable |  |
| touched | `boolean` | Yes | Unavailable |  |
| disabled | `boolean` | Yes | Unavailable |  |
| readOnly | `boolean` | Yes | Unavailable |  |
| required | `boolean` | Yes | Unavailable |  |
| valid | `boolean \| null` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="indicator"></a>

### Indicator

<a id="api-526164696f2e496e64696361746f72"></a>

<a id="radioindicator"></a>

### Radio.Indicator

Indicates selection, retaining the host until its exit animation completes.

Declaration: `packages/solid/build/types/radio/indicator/RadioIndicator.d.ts:4`

#### Declaration

```typescript
(props: RadioIndicatorProps) => JSX.Element
```

<a id="api-526164696f2e496e64696361746f722e2470726f70732e636c617373"></a>

<a id="RadioIndicator-class"></a>

<a id="api-526164696f2e496e64696361746f722e2470726f70732e7374796c65"></a>

<a id="RadioIndicator-style"></a>

<a id="api-526164696f2e496e64696361746f722e2470726f70732e6b6565704d6f756e746564"></a>

<a id="RadioIndicator-keepMounted"></a>

<a id="api-526164696f2e496e64696361746f722e2470726f70732e72656e646572"></a>

<a id="RadioIndicator-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<RadioIndicatorState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<RadioIndicatorState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| keepMounted | `boolean \| undefined` | No | Unavailable |  |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, RadioIndicatorState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-526164696f496e64696361746f7244617461417474726962757465732e636865636b6564"></a>

<a id="api-526164696f496e64696361746f7244617461417474726962757465732e756e636865636b6564"></a>

<a id="api-526164696f496e64696361746f7244617461417474726962757465732e64697361626c6564"></a>

<a id="api-526164696f496e64696361746f7244617461417474726962757465732e726561646f6e6c79"></a>

<a id="api-526164696f496e64696361746f7244617461417474726962757465732e7265717569726564"></a>

<a id="api-526164696f496e64696361746f7244617461417474726962757465732e76616c6964"></a>

<a id="api-526164696f496e64696361746f7244617461417474726962757465732e696e76616c6964"></a>

<a id="api-526164696f496e64696361746f7244617461417474726962757465732e6469727479"></a>

<a id="api-526164696f496e64696361746f7244617461417474726962757465732e746f7563686564"></a>

<a id="api-526164696f496e64696361746f7244617461417474726962757465732e66696c6c6564"></a>

<a id="api-526164696f496e64696361746f7244617461417474726962757465732e666f6375736564"></a>

<a id="api-526164696f496e64696361746f7244617461417474726962757465732e7374617274696e675374796c65"></a>

<a id="api-526164696f496e64696361746f7244617461417474726962757465732e656e64696e675374796c65"></a>

| Name | Description |
| --- | --- |
| data-checked |  |
| data-unchecked |  |
| data-disabled |  |
| data-readonly |  |
| data-required |  |
| data-valid |  |
| data-invalid |  |
| data-dirty |  |
| data-touched |  |
| data-filled |  |
| data-focused |  |
| data-starting-style |  |
| data-ending-style |  |

#### CSS variables

Metadata status: unavailable.

<a id="api-526164696f2e496e64696361746f722e50726f7073"></a>

<a id="radioindicatorprops"></a>

### Related exported type: Radio.Indicator.Props

Declaration: `packages/solid/build/types/radio/indicator/RadioIndicator.d.ts:12`

#### Declaration

```typescript
RadioIndicatorProps
```

<a id="api-526164696f2e496e64696361746f722e50726f70732e636c617373"></a>

<a id="RadioIndicatorProps-class"></a>

<a id="api-526164696f2e496e64696361746f722e50726f70732e7374796c65"></a>

<a id="RadioIndicatorProps-style"></a>

<a id="api-526164696f2e496e64696361746f722e50726f70732e6b6565704d6f756e746564"></a>

<a id="RadioIndicatorProps-keepMounted"></a>

<a id="api-526164696f2e496e64696361746f722e50726f70732e72656e646572"></a>

<a id="RadioIndicatorProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<RadioIndicatorState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<RadioIndicatorState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| keepMounted | `boolean \| undefined` | No | Unavailable |  |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, RadioIndicatorState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-526164696f2e496e64696361746f722e5374617465"></a>

<a id="radioindicatorstate"></a>

### Related exported type: Radio.Indicator.State

Declaration: `packages/solid/build/types/radio/indicator/RadioIndicator.d.ts:13`

#### Declaration

```typescript
RadioIndicatorState
```

<a id="api-526164696f2e496e64696361746f722e53746174652e636865636b6564"></a>

<a id="RadioIndicatorState-checked"></a>

<a id="api-526164696f2e496e64696361746f722e53746174652e6469727479"></a>

<a id="RadioIndicatorState-dirty"></a>

<a id="api-526164696f2e496e64696361746f722e53746174652e66696c6c6564"></a>

<a id="RadioIndicatorState-filled"></a>

<a id="api-526164696f2e496e64696361746f722e53746174652e666f6375736564"></a>

<a id="RadioIndicatorState-focused"></a>

<a id="api-526164696f2e496e64696361746f722e53746174652e746f7563686564"></a>

<a id="RadioIndicatorState-touched"></a>

<a id="api-526164696f2e496e64696361746f722e53746174652e7472616e736974696f6e537461747573"></a>

<a id="RadioIndicatorState-transitionStatus"></a>

<a id="api-526164696f2e496e64696361746f722e53746174652e64697361626c6564"></a>

<a id="RadioIndicatorState-disabled"></a>

<a id="api-526164696f2e496e64696361746f722e53746174652e726561644f6e6c79"></a>

<a id="RadioIndicatorState-readOnly"></a>

<a id="api-526164696f2e496e64696361746f722e53746174652e7265717569726564"></a>

<a id="RadioIndicatorState-required"></a>

<a id="api-526164696f2e496e64696361746f722e53746174652e76616c6964"></a>

<a id="RadioIndicatorState-valid"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| checked | `boolean` | Yes | Unavailable |  |
| dirty | `boolean` | Yes | Unavailable |  |
| filled | `boolean` | Yes | Unavailable |  |
| focused | `boolean` | Yes | Unavailable |  |
| touched | `boolean` | Yes | Unavailable |  |
| transitionStatus | `TransitionStatus` | Yes | Unavailable |  |
| disabled | `boolean` | Yes | Unavailable |  |
| readOnly | `boolean` | Yes | Unavailable |  |
| required | `boolean` | Yes | Unavailable |  |
| valid | `boolean \| null` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

