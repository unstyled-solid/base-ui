<a id="input"></a>

# Input

A native input element that automatically works with [Field](/solid/components/field).



[Open mounted Solid demo: input/hero](/solid/components/input)

<a id="usage-guidelines"></a>

## Usage guidelines

- **Form controls must have an accessible name**: It can be created using a `<label>` element or the `Field` component. See the [forms guide](/solid/handbook/forms).

<a id="anatomy"></a>

## Anatomy

Import the component and use it as a single part:

```tsx
import { Input } from '@unstyled-solid/base-ui/input';
<Input />;
```

<a id="api-reference"></a>

## API reference

<a id="api-496e707574"></a>

<a id="api-496e7075742e2470726f70732e70726f703a616363657074"></a>

<a id="api-496e7075742e2470726f70732e70726f703a616c69676e"></a>

<a id="api-496e7075742e2470726f70732e70726f703a616c74"></a>

<a id="api-496e7075742e2470726f70732e70726f703a6175746f636f6d706c657465"></a>

<a id="api-496e7075742e2470726f70732e70726f703a63617074757265"></a>

<a id="api-496e7075742e2470726f70732e70726f703a6469724e616d65"></a>

<a id="api-496e7075742e2470726f70732e70726f703a64697361626c6564"></a>

<a id="api-496e7075742e2470726f70732e70726f703a666f726d416374696f6e"></a>

<a id="api-496e7075742e2470726f70732e70726f703a666f726d456e6374797065"></a>

<a id="api-496e7075742e2470726f70732e70726f703a666f726d4d6574686f64"></a>

<a id="api-496e7075742e2470726f70732e70726f703a666f726d4e6f56616c6964617465"></a>

<a id="api-496e7075742e2470726f70732e70726f703a666f726d546172676574"></a>

<a id="api-496e7075742e2470726f70732e70726f703a686569676874"></a>

<a id="api-496e7075742e2470726f70732e70726f703a696e64657465726d696e617465"></a>

<a id="api-496e7075742e2470726f70732e70726f703a6d6178"></a>

<a id="api-496e7075742e2470726f70732e70726f703a6d61784c656e677468"></a>

<a id="api-496e7075742e2470726f70732e70726f703a6d696e"></a>

<a id="api-496e7075742e2470726f70732e70726f703a6d696e4c656e677468"></a>

<a id="api-496e7075742e2470726f70732e70726f703a6d756c7469706c65"></a>

<a id="api-496e7075742e2470726f70732e70726f703a6e616d65"></a>

<a id="api-496e7075742e2470726f70732e70726f703a7061747465726e"></a>

<a id="api-496e7075742e2470726f70732e70726f703a706c616365686f6c646572"></a>

<a id="api-496e7075742e2470726f70732e70726f703a706f706f766572546172676574416374696f6e"></a>

<a id="api-496e7075742e2470726f70732e70726f703a706f706f766572546172676574456c656d656e74"></a>

<a id="api-496e7075742e2470726f70732e70726f703a726561644f6e6c79"></a>

<a id="api-496e7075742e2470726f70732e70726f703a7265717569726564"></a>

<a id="api-496e7075742e2470726f70732e70726f703a73656c656374696f6e446972656374696f6e"></a>

<a id="api-496e7075742e2470726f70732e70726f703a73656c656374696f6e456e64"></a>

<a id="api-496e7075742e2470726f70732e70726f703a73656c656374696f6e5374617274"></a>

<a id="api-496e7075742e2470726f70732e70726f703a73697a65"></a>

<a id="api-496e7075742e2470726f70732e70726f703a737263"></a>

<a id="api-496e7075742e2470726f70732e70726f703a73746570"></a>

<a id="api-496e7075742e2470726f70732e70726f703a74797065"></a>

<a id="api-496e7075742e2470726f70732e70726f703a7573654d6170"></a>

<a id="api-496e7075742e2470726f70732e70726f703a76616c7565417344617465"></a>

<a id="api-496e7075742e2470726f70732e70726f703a76616c756541734e756d626572"></a>

<a id="api-496e7075742e2470726f70732e70726f703a7765626b69746469726563746f7279"></a>

<a id="api-496e7075742e2470726f70732e70726f703a7769647468"></a>

### Input

A native input element that automatically works with Field.
Renders an `<input>` element.

Declaration: `packages/solid/build/types/input/Input.d.ts:6`

#### Declaration

```typescript
(props: Input.Props) => JSX.Element
```

<a id="api-496e7075742e2470726f70732e64656661756c7456616c7565"></a>

<a id="Input-defaultValue"></a>

<a id="api-496e7075742e2470726f70732e76616c7565"></a>

<a id="Input-value"></a>

<a id="api-496e7075742e2470726f70732e6f6e56616c75654368616e6765"></a>

<a id="Input-onValueChange"></a>

<a id="api-496e7075742e2470726f70732e726566"></a>

<a id="Input-ref"></a>

<a id="api-496e7075742e2470726f70732e6175746f466f637573"></a>

<a id="Input-autoFocus"></a>

<a id="api-496e7075742e2470726f70732e636c617373"></a>

<a id="Input-class"></a>

<a id="api-496e7075742e2470726f70732e7374796c65"></a>

<a id="Input-style"></a>

<a id="api-496e7075742e2470726f70732e72656e646572"></a>

<a id="Input-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| defaultValue | `string \| number \| readonly string[] \| undefined` | No | Unavailable | The default value of the input. Use when uncontrolled. |
| value | `string \| number \| string[] \| readonly string[] \| undefined` | No | Unavailable | The value of the input. Use when controlled. |
| onValueChange | `((value: string, eventDetails: Input.ChangeEventDetails) => void) \| undefined` | No | Unavailable | Callback fired when the `value` changes. Use when controlled. |
| ref | `JSX.Ref<HTMLInputElement>` | No | Unavailable |  |
| autoFocus | `boolean \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<FieldControlState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<FieldControlState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<JSX.InputHTMLAttributes<HTMLInputElement>, FieldControlState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accept`, `accesskey`, `align`, `alpha`, `alt`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocomplete`, `autocorrect`, `autofocus`, `capture`, `checked`, `children`, `colorspace`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `dirname`, `disabled`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `form`, `formaction`, `formenctype`, `formmethod`, `formnovalidate`, `formtarget`, `height`, `hidden`, `id`, `incremental`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `list`, `max`, `maxlength`, `min`, `minlength`, `multiple`, `name`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `pattern`, `placeholder`, `popover`, `popovertarget`, `popovertargetaction`, `prefix`, `prop:accept`, `prop:align`, `prop:alt`, `prop:autocomplete`, `prop:capture`, `prop:checked`, `prop:defaultChecked`, `prop:defaultValue`, `prop:dirName`, `prop:disabled`, `prop:formAction`, `prop:formEnctype`, `prop:formMethod`, `prop:formNoValidate`, `prop:formTarget`, `prop:height`, `prop:indeterminate`, `prop:max`, `prop:maxLength`, `prop:min`, `prop:minLength`, `prop:multiple`, `prop:name`, `prop:pattern`, `prop:placeholder`, `prop:popoverTargetAction`, `prop:popoverTargetElement`, `prop:readOnly`, `prop:required`, `prop:selectionDirection`, `prop:selectionEnd`, `prop:selectionStart`, `prop:size`, `prop:src`, `prop:step`, `prop:type`, `prop:useMap`, `prop:value`, `prop:valueAsDate`, `prop:valueAsNumber`, `prop:webkitdirectory`, `prop:width`, `property`, `readonly`, `required`, `resource`, `results`, `role`, `size`, `slot`, `spellcheck`, `src`, `step`, `tabindex`, `textContent`, `title`, `translate`, `type`, `typeof`, `usemap`, `virtualkeyboardpolicy`, `vocab`, `webkitdirectory`, `width`, `writingsuggestions`

#### Data attributes

<a id="api-496e70757444617461417474726962757465732e64697361626c6564"></a>

<a id="api-496e70757444617461417474726962757465732e76616c6964"></a>

<a id="api-496e70757444617461417474726962757465732e696e76616c6964"></a>

<a id="api-496e70757444617461417474726962757465732e6469727479"></a>

<a id="api-496e70757444617461417474726962757465732e746f7563686564"></a>

<a id="api-496e70757444617461417474726962757465732e66696c6c6564"></a>

<a id="api-496e70757444617461417474726962757465732e666f6375736564"></a>

| Name | Description |
| --- | --- |
| data-disabled | Present when the input is disabled. |
| data-valid | Present when the input is in a valid state (when wrapped in Field.Root). |
| data-invalid | Present when the input is in an invalid state (when wrapped in Field.Root). |
| data-dirty | Present when the input's value has changed (when wrapped in Field.Root). |
| data-touched | Present when the input has been touched (when wrapped in Field.Root). |
| data-filled | Present when the input is filled (when wrapped in Field.Root). |
| data-focused | Present when the input is focused (when wrapped in Field.Root). |

#### CSS variables

Metadata status: unavailable.

<a id="api-496e7075742e50726f7073"></a>

<a id="inputprops"></a>

<a id="api-496e7075742e50726f70732e70726f703a616363657074"></a>

<a id="api-496e7075742e50726f70732e70726f703a616c69676e"></a>

<a id="api-496e7075742e50726f70732e70726f703a616c74"></a>

<a id="api-496e7075742e50726f70732e70726f703a6175746f636f6d706c657465"></a>

<a id="api-496e7075742e50726f70732e70726f703a63617074757265"></a>

<a id="api-496e7075742e50726f70732e70726f703a6469724e616d65"></a>

<a id="api-496e7075742e50726f70732e70726f703a64697361626c6564"></a>

<a id="api-496e7075742e50726f70732e70726f703a666f726d416374696f6e"></a>

<a id="api-496e7075742e50726f70732e70726f703a666f726d456e6374797065"></a>

<a id="api-496e7075742e50726f70732e70726f703a666f726d4d6574686f64"></a>

<a id="api-496e7075742e50726f70732e70726f703a666f726d4e6f56616c6964617465"></a>

<a id="api-496e7075742e50726f70732e70726f703a666f726d546172676574"></a>

<a id="api-496e7075742e50726f70732e70726f703a686569676874"></a>

<a id="api-496e7075742e50726f70732e70726f703a696e64657465726d696e617465"></a>

<a id="api-496e7075742e50726f70732e70726f703a6d6178"></a>

<a id="api-496e7075742e50726f70732e70726f703a6d61784c656e677468"></a>

<a id="api-496e7075742e50726f70732e70726f703a6d696e"></a>

<a id="api-496e7075742e50726f70732e70726f703a6d696e4c656e677468"></a>

<a id="api-496e7075742e50726f70732e70726f703a6d756c7469706c65"></a>

<a id="api-496e7075742e50726f70732e70726f703a6e616d65"></a>

<a id="api-496e7075742e50726f70732e70726f703a7061747465726e"></a>

<a id="api-496e7075742e50726f70732e70726f703a706c616365686f6c646572"></a>

<a id="api-496e7075742e50726f70732e70726f703a706f706f766572546172676574416374696f6e"></a>

<a id="api-496e7075742e50726f70732e70726f703a706f706f766572546172676574456c656d656e74"></a>

<a id="api-496e7075742e50726f70732e70726f703a726561644f6e6c79"></a>

<a id="api-496e7075742e50726f70732e70726f703a7265717569726564"></a>

<a id="api-496e7075742e50726f70732e70726f703a73656c656374696f6e446972656374696f6e"></a>

<a id="api-496e7075742e50726f70732e70726f703a73656c656374696f6e456e64"></a>

<a id="api-496e7075742e50726f70732e70726f703a73656c656374696f6e5374617274"></a>

<a id="api-496e7075742e50726f70732e70726f703a73697a65"></a>

<a id="api-496e7075742e50726f70732e70726f703a737263"></a>

<a id="api-496e7075742e50726f70732e70726f703a73746570"></a>

<a id="api-496e7075742e50726f70732e70726f703a74797065"></a>

<a id="api-496e7075742e50726f70732e70726f703a7573654d6170"></a>

<a id="api-496e7075742e50726f70732e70726f703a76616c7565417344617465"></a>

<a id="api-496e7075742e50726f70732e70726f703a76616c756541734e756d626572"></a>

<a id="api-496e7075742e50726f70732e70726f703a7765626b69746469726563746f7279"></a>

<a id="api-496e7075742e50726f70732e70726f703a7769647468"></a>

### Related exported type: Input.Props

Declaration: `packages/solid/build/types/input/Input.d.ts:20`

#### Declaration

```typescript
InputProps
```

<a id="api-496e7075742e50726f70732e64656661756c7456616c7565"></a>

<a id="InputProps-defaultValue"></a>

<a id="api-496e7075742e50726f70732e76616c7565"></a>

<a id="InputProps-value"></a>

<a id="api-496e7075742e50726f70732e6f6e56616c75654368616e6765"></a>

<a id="InputProps-onValueChange"></a>

<a id="api-496e7075742e50726f70732e726566"></a>

<a id="InputProps-ref"></a>

<a id="api-496e7075742e50726f70732e6175746f466f637573"></a>

<a id="InputProps-autoFocus"></a>

<a id="api-496e7075742e50726f70732e636c617373"></a>

<a id="InputProps-class"></a>

<a id="api-496e7075742e50726f70732e7374796c65"></a>

<a id="InputProps-style"></a>

<a id="api-496e7075742e50726f70732e72656e646572"></a>

<a id="InputProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| defaultValue | `string \| number \| readonly string[] \| undefined` | No | Unavailable | The default value of the input. Use when uncontrolled. |
| value | `string \| number \| string[] \| readonly string[] \| undefined` | No | Unavailable | The value of the input. Use when controlled. |
| onValueChange | `((value: string, eventDetails: Input.ChangeEventDetails) => void) \| undefined` | No | Unavailable | Callback fired when the `value` changes. Use when controlled. |
| ref | `JSX.Ref<HTMLInputElement>` | No | Unavailable |  |
| autoFocus | `boolean \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<FieldControlState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<FieldControlState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<JSX.InputHTMLAttributes<HTMLInputElement>, FieldControlState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accept`, `accesskey`, `align`, `alpha`, `alt`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocomplete`, `autocorrect`, `autofocus`, `capture`, `checked`, `children`, `colorspace`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `dirname`, `disabled`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `form`, `formaction`, `formenctype`, `formmethod`, `formnovalidate`, `formtarget`, `height`, `hidden`, `id`, `incremental`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `list`, `max`, `maxlength`, `min`, `minlength`, `multiple`, `name`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `pattern`, `placeholder`, `popover`, `popovertarget`, `popovertargetaction`, `prefix`, `prop:accept`, `prop:align`, `prop:alt`, `prop:autocomplete`, `prop:capture`, `prop:checked`, `prop:defaultChecked`, `prop:defaultValue`, `prop:dirName`, `prop:disabled`, `prop:formAction`, `prop:formEnctype`, `prop:formMethod`, `prop:formNoValidate`, `prop:formTarget`, `prop:height`, `prop:indeterminate`, `prop:max`, `prop:maxLength`, `prop:min`, `prop:minLength`, `prop:multiple`, `prop:name`, `prop:pattern`, `prop:placeholder`, `prop:popoverTargetAction`, `prop:popoverTargetElement`, `prop:readOnly`, `prop:required`, `prop:selectionDirection`, `prop:selectionEnd`, `prop:selectionStart`, `prop:size`, `prop:src`, `prop:step`, `prop:type`, `prop:useMap`, `prop:value`, `prop:valueAsDate`, `prop:valueAsNumber`, `prop:webkitdirectory`, `prop:width`, `property`, `readonly`, `required`, `resource`, `results`, `role`, `size`, `slot`, `spellcheck`, `src`, `step`, `tabindex`, `textContent`, `title`, `translate`, `type`, `typeof`, `usemap`, `virtualkeyboardpolicy`, `vocab`, `webkitdirectory`, `width`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-496e7075742e5374617465"></a>

<a id="inputstate"></a>

### Related exported type: Input.State

Declaration: `packages/solid/build/types/input/Input.d.ts:21`

#### Declaration

```typescript
InputState
```

<a id="api-496e7075742e53746174652e6469727479"></a>

<a id="InputState-dirty"></a>

<a id="api-496e7075742e53746174652e66696c6c6564"></a>

<a id="InputState-filled"></a>

<a id="api-496e7075742e53746174652e666f6375736564"></a>

<a id="InputState-focused"></a>

<a id="api-496e7075742e53746174652e746f7563686564"></a>

<a id="InputState-touched"></a>

<a id="api-496e7075742e53746174652e64697361626c6564"></a>

<a id="InputState-disabled"></a>

<a id="api-496e7075742e53746174652e76616c6964"></a>

<a id="InputState-valid"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| dirty | `boolean` | Yes | Unavailable |  |
| filled | `boolean` | Yes | Unavailable |  |
| focused | `boolean` | Yes | Unavailable |  |
| touched | `boolean` | Yes | Unavailable |  |
| disabled | `boolean` | Yes | Unavailable |  |
| valid | `boolean \| null` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-496e7075742e4368616e67654576656e74526561736f6e"></a>

<a id="inputchangeeventreason"></a>

### Related exported type: Input.ChangeEventReason

Declaration: `packages/solid/build/types/input/Input.d.ts:22`

#### Declaration

```typescript
"none"
```

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-496e7075742e4368616e67654576656e7444657461696c73"></a>

<a id="inputchangeeventdetails"></a>

### Related exported type: Input.ChangeEventDetails

Declaration: `packages/solid/build/types/input/Input.d.ts:23`

#### Declaration

```typescript
{ reason: "none"; event: Event; cancel(): void; allowPropagation(): void; isCanceled: boolean; isPropagationAllowed: boolean; trigger: Element | undefined; }
```

<a id="api-496e7075742e4368616e67654576656e7444657461696c732e616c6c6f7750726f7061676174696f6e"></a>

<a id="InputChangeEventDetails-allowPropagation"></a>

<a id="api-496e7075742e4368616e67654576656e7444657461696c732e63616e63656c"></a>

<a id="InputChangeEventDetails-cancel"></a>

<a id="api-496e7075742e4368616e67654576656e7444657461696c732e6576656e74"></a>

<a id="InputChangeEventDetails-event"></a>

<a id="api-496e7075742e4368616e67654576656e7444657461696c732e697343616e63656c6564"></a>

<a id="InputChangeEventDetails-isCanceled"></a>

<a id="api-496e7075742e4368616e67654576656e7444657461696c732e697350726f7061676174696f6e416c6c6f776564"></a>

<a id="InputChangeEventDetails-isPropagationAllowed"></a>

<a id="api-496e7075742e4368616e67654576656e7444657461696c732e726561736f6e"></a>

<a id="InputChangeEventDetails-reason"></a>

<a id="api-496e7075742e4368616e67654576656e7444657461696c732e74726967676572"></a>

<a id="InputChangeEventDetails-trigger"></a>

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

<a id="api-496e70757450726f7073"></a>

<a id="api-496e70757450726f70732e70726f703a616363657074"></a>

<a id="api-496e70757450726f70732e70726f703a616c69676e"></a>

<a id="api-496e70757450726f70732e70726f703a616c74"></a>

<a id="api-496e70757450726f70732e70726f703a6175746f636f6d706c657465"></a>

<a id="api-496e70757450726f70732e70726f703a63617074757265"></a>

<a id="api-496e70757450726f70732e70726f703a6469724e616d65"></a>

<a id="api-496e70757450726f70732e70726f703a64697361626c6564"></a>

<a id="api-496e70757450726f70732e70726f703a666f726d416374696f6e"></a>

<a id="api-496e70757450726f70732e70726f703a666f726d456e6374797065"></a>

<a id="api-496e70757450726f70732e70726f703a666f726d4d6574686f64"></a>

<a id="api-496e70757450726f70732e70726f703a666f726d4e6f56616c6964617465"></a>

<a id="api-496e70757450726f70732e70726f703a666f726d546172676574"></a>

<a id="api-496e70757450726f70732e70726f703a686569676874"></a>

<a id="api-496e70757450726f70732e70726f703a696e64657465726d696e617465"></a>

<a id="api-496e70757450726f70732e70726f703a6d6178"></a>

<a id="api-496e70757450726f70732e70726f703a6d61784c656e677468"></a>

<a id="api-496e70757450726f70732e70726f703a6d696e"></a>

<a id="api-496e70757450726f70732e70726f703a6d696e4c656e677468"></a>

<a id="api-496e70757450726f70732e70726f703a6d756c7469706c65"></a>

<a id="api-496e70757450726f70732e70726f703a6e616d65"></a>

<a id="api-496e70757450726f70732e70726f703a7061747465726e"></a>

<a id="api-496e70757450726f70732e70726f703a706c616365686f6c646572"></a>

<a id="api-496e70757450726f70732e70726f703a706f706f766572546172676574416374696f6e"></a>

<a id="api-496e70757450726f70732e70726f703a706f706f766572546172676574456c656d656e74"></a>

<a id="api-496e70757450726f70732e70726f703a726561644f6e6c79"></a>

<a id="api-496e70757450726f70732e70726f703a7265717569726564"></a>

<a id="api-496e70757450726f70732e70726f703a73656c656374696f6e446972656374696f6e"></a>

<a id="api-496e70757450726f70732e70726f703a73656c656374696f6e456e64"></a>

<a id="api-496e70757450726f70732e70726f703a73656c656374696f6e5374617274"></a>

<a id="api-496e70757450726f70732e70726f703a73697a65"></a>

<a id="api-496e70757450726f70732e70726f703a737263"></a>

<a id="api-496e70757450726f70732e70726f703a73746570"></a>

<a id="api-496e70757450726f70732e70726f703a74797065"></a>

<a id="api-496e70757450726f70732e70726f703a7573654d6170"></a>

<a id="api-496e70757450726f70732e70726f703a76616c7565417344617465"></a>

<a id="api-496e70757450726f70732e70726f703a76616c756541734e756d626572"></a>

<a id="api-496e70757450726f70732e70726f703a7765626b69746469726563746f7279"></a>

<a id="api-496e70757450726f70732e70726f703a7769647468"></a>

### Related exported type: InputProps

Declaration: `packages/solid/build/types/input/Input.d.ts:7`

#### Declaration

```typescript
InputProps
```

<a id="api-496e70757450726f70732e64656661756c7456616c7565"></a>

<a id="api-496e70757450726f70732e76616c7565"></a>

<a id="api-496e70757450726f70732e6f6e56616c75654368616e6765"></a>

<a id="api-496e70757450726f70732e726566"></a>

<a id="api-496e70757450726f70732e6175746f466f637573"></a>

<a id="api-496e70757450726f70732e636c617373"></a>

<a id="api-496e70757450726f70732e7374796c65"></a>

<a id="api-496e70757450726f70732e72656e646572"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| defaultValue | `string \| number \| readonly string[] \| undefined` | No | Unavailable | The default value of the input. Use when uncontrolled. |
| value | `string \| number \| string[] \| readonly string[] \| undefined` | No | Unavailable | The value of the input. Use when controlled. |
| onValueChange | `((value: string, eventDetails: Input.ChangeEventDetails) => void) \| undefined` | No | Unavailable | Callback fired when the `value` changes. Use when controlled. |
| ref | `JSX.Ref<HTMLInputElement>` | No | Unavailable |  |
| autoFocus | `boolean \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<FieldControlState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<FieldControlState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<JSX.InputHTMLAttributes<HTMLInputElement>, FieldControlState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accept`, `accesskey`, `align`, `alpha`, `alt`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocomplete`, `autocorrect`, `autofocus`, `capture`, `checked`, `children`, `colorspace`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `dirname`, `disabled`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `form`, `formaction`, `formenctype`, `formmethod`, `formnovalidate`, `formtarget`, `height`, `hidden`, `id`, `incremental`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `list`, `max`, `maxlength`, `min`, `minlength`, `multiple`, `name`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `pattern`, `placeholder`, `popover`, `popovertarget`, `popovertargetaction`, `prefix`, `prop:accept`, `prop:align`, `prop:alt`, `prop:autocomplete`, `prop:capture`, `prop:checked`, `prop:defaultChecked`, `prop:defaultValue`, `prop:dirName`, `prop:disabled`, `prop:formAction`, `prop:formEnctype`, `prop:formMethod`, `prop:formNoValidate`, `prop:formTarget`, `prop:height`, `prop:indeterminate`, `prop:max`, `prop:maxLength`, `prop:min`, `prop:minLength`, `prop:multiple`, `prop:name`, `prop:pattern`, `prop:placeholder`, `prop:popoverTargetAction`, `prop:popoverTargetElement`, `prop:readOnly`, `prop:required`, `prop:selectionDirection`, `prop:selectionEnd`, `prop:selectionStart`, `prop:size`, `prop:src`, `prop:step`, `prop:type`, `prop:useMap`, `prop:value`, `prop:valueAsDate`, `prop:valueAsNumber`, `prop:webkitdirectory`, `prop:width`, `property`, `readonly`, `required`, `resource`, `results`, `role`, `size`, `slot`, `spellcheck`, `src`, `step`, `tabindex`, `textContent`, `title`, `translate`, `type`, `typeof`, `usemap`, `virtualkeyboardpolicy`, `vocab`, `webkitdirectory`, `width`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-496e7075745374617465"></a>

### Related exported type: InputState

Declaration: `packages/solid/build/types/input/Input.d.ts:15`

#### Declaration

```typescript
InputState
```

<a id="api-496e70757453746174652e6469727479"></a>

<a id="api-496e70757453746174652e66696c6c6564"></a>

<a id="api-496e70757453746174652e666f6375736564"></a>

<a id="api-496e70757453746174652e746f7563686564"></a>

<a id="api-496e70757453746174652e64697361626c6564"></a>

<a id="api-496e70757453746174652e76616c6964"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| dirty | `boolean` | Yes | Unavailable |  |
| filled | `boolean` | Yes | Unavailable |  |
| focused | `boolean` | Yes | Unavailable |  |
| touched | `boolean` | Yes | Unavailable |  |
| disabled | `boolean` | Yes | Unavailable |  |
| valid | `boolean \| null` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

