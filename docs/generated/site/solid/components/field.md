<a id="field"></a>

# Field

A component that provides labeling and validation for form controls.

[Open mounted Solid demo: field/hero](/solid/components/field)

<a id="anatomy"></a>

## Anatomy

Import the component and assemble its parts:

```tsx
import { Field } from '@unstyled-solid/base-ui/field';
<Field.Root>
  <Field.Label />
  <Field.Control />
  <Field.Description />
  <Field.Item />
  <Field.Error />
  <Field.Validity />
</Field.Root>;
```

<a id="api-reference"></a>

## API reference

<a id="root"></a>

### Root

<a id="api-4669656c642e526f6f74"></a>

<a id="fieldroot"></a>

<a id="api-4669656c642e526f6f742e2470726f70732e70726f703a616c69676e"></a>

### Field.Root

Groups a field's controls, labels, descriptions and validation messages.

Declaration: `packages/solid/build/types/field/root/FieldRoot.d.ts:6`

#### Declaration

```typescript
(props: FieldRootProps) => JSX.Element
```

<a id="api-4669656c642e526f6f742e2470726f70732e6e616d65"></a>

<a id="FieldRoot-name"></a>

<a id="api-4669656c642e526f6f742e2470726f70732e616374696f6e73526566"></a>

<a id="FieldRoot-actionsRef"></a>

<a id="api-4669656c642e526f6f742e2470726f70732e6469727479"></a>

<a id="FieldRoot-dirty"></a>

<a id="api-4669656c642e526f6f742e2470726f70732e746f7563686564"></a>

<a id="FieldRoot-touched"></a>

<a id="api-4669656c642e526f6f742e2470726f70732e64697361626c6564"></a>

<a id="FieldRoot-disabled"></a>

<a id="api-4669656c642e526f6f742e2470726f70732e696e76616c6964"></a>

<a id="FieldRoot-invalid"></a>

<a id="api-4669656c642e526f6f742e2470726f70732e76616c6964617465"></a>

<a id="FieldRoot-validate"></a>

<a id="api-4669656c642e526f6f742e2470726f70732e76616c69646174696f6e4d6f6465"></a>

<a id="FieldRoot-validationMode"></a>

<a id="api-4669656c642e526f6f742e2470726f70732e76616c69646174696f6e4465626f756e636554696d65"></a>

<a id="FieldRoot-validationDebounceTime"></a>

<a id="api-4669656c642e526f6f742e2470726f70732e636c617373"></a>

<a id="FieldRoot-class"></a>

<a id="api-4669656c642e526f6f742e2470726f70732e7374796c65"></a>

<a id="FieldRoot-style"></a>

<a id="api-4669656c642e526f6f742e2470726f70732e72656e646572"></a>

<a id="FieldRoot-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| name | `string \| undefined` | No | Unavailable |  |
| actionsRef | `((actions: FieldRootActions \| null) => void) \| undefined` | No | Unavailable |  |
| dirty | `boolean \| undefined` | No | Unavailable |  |
| touched | `boolean \| undefined` | No | Unavailable |  |
| disabled | `boolean \| undefined` | No | Unavailable |  |
| invalid | `boolean \| undefined` | No | Unavailable |  |
| validate | `FieldValidator \| undefined` | No | Unavailable |  |
| validationMode | `FormValidationMode \| undefined` | No | Unavailable |  |
| validationDebounceTime | `number \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<FieldRootState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<FieldRootState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<JSX.HTMLAttributes<HTMLDivElement>, FieldRootState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-4669656c64526f6f7444617461417474726962757465732e64697361626c6564"></a>

<a id="api-4669656c64526f6f7444617461417474726962757465732e76616c6964"></a>

<a id="api-4669656c64526f6f7444617461417474726962757465732e696e76616c6964"></a>

<a id="api-4669656c64526f6f7444617461417474726962757465732e6469727479"></a>

<a id="api-4669656c64526f6f7444617461417474726962757465732e746f7563686564"></a>

<a id="api-4669656c64526f6f7444617461417474726962757465732e66696c6c6564"></a>

<a id="api-4669656c64526f6f7444617461417474726962757465732e666f6375736564"></a>

| Name | Description |
| --- | --- |
| data-disabled |  |
| data-valid |  |
| data-invalid |  |
| data-dirty |  |
| data-touched |  |
| data-filled |  |
| data-focused |  |

#### CSS variables

Metadata status: unavailable.

<a id="api-4669656c642e526f6f742e50726f7073"></a>

<a id="fieldrootprops"></a>

<a id="api-4669656c642e526f6f742e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Field.Root.Props

Declaration: `packages/solid/build/types/field/root/FieldRoot.d.ts:24`

#### Declaration

```typescript
FieldRootProps
```

<a id="api-4669656c642e526f6f742e50726f70732e6e616d65"></a>

<a id="FieldRootProps-name"></a>

<a id="api-4669656c642e526f6f742e50726f70732e616374696f6e73526566"></a>

<a id="FieldRootProps-actionsRef"></a>

<a id="api-4669656c642e526f6f742e50726f70732e6469727479"></a>

<a id="FieldRootProps-dirty"></a>

<a id="api-4669656c642e526f6f742e50726f70732e746f7563686564"></a>

<a id="FieldRootProps-touched"></a>

<a id="api-4669656c642e526f6f742e50726f70732e64697361626c6564"></a>

<a id="FieldRootProps-disabled"></a>

<a id="api-4669656c642e526f6f742e50726f70732e696e76616c6964"></a>

<a id="FieldRootProps-invalid"></a>

<a id="api-4669656c642e526f6f742e50726f70732e76616c6964617465"></a>

<a id="FieldRootProps-validate"></a>

<a id="api-4669656c642e526f6f742e50726f70732e76616c69646174696f6e4d6f6465"></a>

<a id="FieldRootProps-validationMode"></a>

<a id="api-4669656c642e526f6f742e50726f70732e76616c69646174696f6e4465626f756e636554696d65"></a>

<a id="FieldRootProps-validationDebounceTime"></a>

<a id="api-4669656c642e526f6f742e50726f70732e636c617373"></a>

<a id="FieldRootProps-class"></a>

<a id="api-4669656c642e526f6f742e50726f70732e7374796c65"></a>

<a id="FieldRootProps-style"></a>

<a id="api-4669656c642e526f6f742e50726f70732e72656e646572"></a>

<a id="FieldRootProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| name | `string \| undefined` | No | Unavailable |  |
| actionsRef | `((actions: FieldRootActions \| null) => void) \| undefined` | No | Unavailable |  |
| dirty | `boolean \| undefined` | No | Unavailable |  |
| touched | `boolean \| undefined` | No | Unavailable |  |
| disabled | `boolean \| undefined` | No | Unavailable |  |
| invalid | `boolean \| undefined` | No | Unavailable |  |
| validate | `FieldValidator \| undefined` | No | Unavailable |  |
| validationMode | `FormValidationMode \| undefined` | No | Unavailable |  |
| validationDebounceTime | `number \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<FieldRootState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<FieldRootState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<JSX.HTMLAttributes<HTMLDivElement>, FieldRootState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4669656c642e526f6f742e5374617465"></a>

<a id="fieldrootstate"></a>

### Related exported type: Field.Root.State

Declaration: `packages/solid/build/types/field/root/FieldRoot.d.ts:25`

#### Declaration

```typescript
FieldRootState
```

<a id="api-4669656c642e526f6f742e53746174652e6469727479"></a>

<a id="FieldRootState-dirty"></a>

<a id="api-4669656c642e526f6f742e53746174652e66696c6c6564"></a>

<a id="FieldRootState-filled"></a>

<a id="api-4669656c642e526f6f742e53746174652e666f6375736564"></a>

<a id="FieldRootState-focused"></a>

<a id="api-4669656c642e526f6f742e53746174652e746f7563686564"></a>

<a id="FieldRootState-touched"></a>

<a id="api-4669656c642e526f6f742e53746174652e64697361626c6564"></a>

<a id="FieldRootState-disabled"></a>

<a id="api-4669656c642e526f6f742e53746174652e76616c6964"></a>

<a id="FieldRootState-valid"></a>

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

<a id="api-4669656c642e526f6f742e416374696f6e73"></a>

<a id="fieldrootactions"></a>

### Related exported type: Field.Root.Actions

Declaration: `packages/solid/build/types/field/root/FieldRoot.d.ts:26`

#### Declaration

```typescript
FieldRootActions
```

<a id="api-4669656c642e526f6f742e416374696f6e732e76616c6964617465"></a>

<a id="FieldRootActions-validate"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| validate | `() => void` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="label"></a>

### Label

<a id="api-4669656c642e4c6162656c"></a>

<a id="fieldlabel"></a>

<a id="api-4669656c642e4c6162656c2e2470726f70732e70726f703a68746d6c466f72"></a>

### Field.Label

Declaration: `packages/solid/build/types/field/label/FieldLabel.d.ts:4`

#### Declaration

```typescript
<E extends HTMLElement = HTMLLabelElement>(props: FieldLabelProps<E>) => JSX.Element
```

<a id="api-4669656c642e4c6162656c2e2470726f70732e6e61746976654c6162656c"></a>

<a id="FieldLabel-nativeLabel"></a>

<a id="api-4669656c642e4c6162656c2e2470726f70732e726566"></a>

<a id="FieldLabel-ref"></a>

<a id="api-4669656c642e4c6162656c2e2470726f70732e636c617373"></a>

<a id="FieldLabel-class"></a>

<a id="api-4669656c642e4c6162656c2e2470726f70732e7374796c65"></a>

<a id="FieldLabel-style"></a>

<a id="api-4669656c642e4c6162656c2e2470726f70732e72656e646572"></a>

<a id="FieldLabel-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| nativeLabel | `boolean \| undefined` | No | true |  |
| ref | `JSX.Ref<E>` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<FieldLabelState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<FieldLabelState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<JSX.LabelHTMLAttributes<E>, FieldLabelState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `for`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:htmlFor`, `property`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-4669656c644c6162656c44617461417474726962757465732e64697361626c6564"></a>

<a id="api-4669656c644c6162656c44617461417474726962757465732e76616c6964"></a>

<a id="api-4669656c644c6162656c44617461417474726962757465732e696e76616c6964"></a>

<a id="api-4669656c644c6162656c44617461417474726962757465732e6469727479"></a>

<a id="api-4669656c644c6162656c44617461417474726962757465732e746f7563686564"></a>

<a id="api-4669656c644c6162656c44617461417474726962757465732e66696c6c6564"></a>

<a id="api-4669656c644c6162656c44617461417474726962757465732e666f6375736564"></a>

| Name | Description |
| --- | --- |
| data-disabled |  |
| data-valid |  |
| data-invalid |  |
| data-dirty |  |
| data-touched |  |
| data-filled |  |
| data-focused |  |

#### CSS variables

Metadata status: unavailable.

<a id="api-4669656c642e4c6162656c2e50726f7073"></a>

<a id="fieldlabelprops"></a>

<a id="api-4669656c642e4c6162656c2e50726f70732e70726f703a68746d6c466f72"></a>

### Related exported type: Field.Label.Props

Declaration: `packages/solid/build/types/field/label/FieldLabel.d.ts:12`

#### Declaration

```typescript
Props
```

<a id="api-4669656c642e4c6162656c2e50726f70732e6e61746976654c6162656c"></a>

<a id="FieldLabelProps-nativeLabel"></a>

<a id="api-4669656c642e4c6162656c2e50726f70732e726566"></a>

<a id="FieldLabelProps-ref"></a>

<a id="api-4669656c642e4c6162656c2e50726f70732e636c617373"></a>

<a id="FieldLabelProps-class"></a>

<a id="api-4669656c642e4c6162656c2e50726f70732e7374796c65"></a>

<a id="FieldLabelProps-style"></a>

<a id="api-4669656c642e4c6162656c2e50726f70732e72656e646572"></a>

<a id="FieldLabelProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| nativeLabel | `boolean \| undefined` | No | Unavailable |  |
| ref | `JSX.Ref<HTMLLabelElement>` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<FieldLabelState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<FieldLabelState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<JSX.LabelHTMLAttributes<HTMLLabelElement>, FieldLabelState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `for`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:htmlFor`, `property`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4669656c642e4c6162656c2e5374617465"></a>

<a id="fieldlabelstate"></a>

### Related exported type: Field.Label.State

Declaration: `packages/solid/build/types/field/label/FieldLabel.d.ts:13`

#### Declaration

```typescript
FieldLabelState
```

<a id="api-4669656c642e4c6162656c2e53746174652e6469727479"></a>

<a id="FieldLabelState-dirty"></a>

<a id="api-4669656c642e4c6162656c2e53746174652e66696c6c6564"></a>

<a id="FieldLabelState-filled"></a>

<a id="api-4669656c642e4c6162656c2e53746174652e666f6375736564"></a>

<a id="FieldLabelState-focused"></a>

<a id="api-4669656c642e4c6162656c2e53746174652e746f7563686564"></a>

<a id="FieldLabelState-touched"></a>

<a id="api-4669656c642e4c6162656c2e53746174652e64697361626c6564"></a>

<a id="FieldLabelState-disabled"></a>

<a id="api-4669656c642e4c6162656c2e53746174652e76616c6964"></a>

<a id="FieldLabelState-valid"></a>

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

<a id="control"></a>

### Control

<a id="api-4669656c642e436f6e74726f6c"></a>

<a id="fieldcontrol"></a>

<a id="api-4669656c642e436f6e74726f6c2e2470726f70732e70726f703a616363657074"></a>

<a id="api-4669656c642e436f6e74726f6c2e2470726f70732e70726f703a616c69676e"></a>

<a id="api-4669656c642e436f6e74726f6c2e2470726f70732e70726f703a616c74"></a>

<a id="api-4669656c642e436f6e74726f6c2e2470726f70732e70726f703a6175746f636f6d706c657465"></a>

<a id="api-4669656c642e436f6e74726f6c2e2470726f70732e70726f703a63617074757265"></a>

<a id="api-4669656c642e436f6e74726f6c2e2470726f70732e70726f703a6469724e616d65"></a>

<a id="api-4669656c642e436f6e74726f6c2e2470726f70732e70726f703a64697361626c6564"></a>

<a id="api-4669656c642e436f6e74726f6c2e2470726f70732e70726f703a666f726d416374696f6e"></a>

<a id="api-4669656c642e436f6e74726f6c2e2470726f70732e70726f703a666f726d456e6374797065"></a>

<a id="api-4669656c642e436f6e74726f6c2e2470726f70732e70726f703a666f726d4d6574686f64"></a>

<a id="api-4669656c642e436f6e74726f6c2e2470726f70732e70726f703a666f726d4e6f56616c6964617465"></a>

<a id="api-4669656c642e436f6e74726f6c2e2470726f70732e70726f703a666f726d546172676574"></a>

<a id="api-4669656c642e436f6e74726f6c2e2470726f70732e70726f703a686569676874"></a>

<a id="api-4669656c642e436f6e74726f6c2e2470726f70732e70726f703a696e64657465726d696e617465"></a>

<a id="api-4669656c642e436f6e74726f6c2e2470726f70732e70726f703a6d6178"></a>

<a id="api-4669656c642e436f6e74726f6c2e2470726f70732e70726f703a6d61784c656e677468"></a>

<a id="api-4669656c642e436f6e74726f6c2e2470726f70732e70726f703a6d696e"></a>

<a id="api-4669656c642e436f6e74726f6c2e2470726f70732e70726f703a6d696e4c656e677468"></a>

<a id="api-4669656c642e436f6e74726f6c2e2470726f70732e70726f703a6d756c7469706c65"></a>

<a id="api-4669656c642e436f6e74726f6c2e2470726f70732e70726f703a6e616d65"></a>

<a id="api-4669656c642e436f6e74726f6c2e2470726f70732e70726f703a7061747465726e"></a>

<a id="api-4669656c642e436f6e74726f6c2e2470726f70732e70726f703a706c616365686f6c646572"></a>

<a id="api-4669656c642e436f6e74726f6c2e2470726f70732e70726f703a706f706f766572546172676574416374696f6e"></a>

<a id="api-4669656c642e436f6e74726f6c2e2470726f70732e70726f703a706f706f766572546172676574456c656d656e74"></a>

<a id="api-4669656c642e436f6e74726f6c2e2470726f70732e70726f703a726561644f6e6c79"></a>

<a id="api-4669656c642e436f6e74726f6c2e2470726f70732e70726f703a7265717569726564"></a>

<a id="api-4669656c642e436f6e74726f6c2e2470726f70732e70726f703a73656c656374696f6e446972656374696f6e"></a>

<a id="api-4669656c642e436f6e74726f6c2e2470726f70732e70726f703a73656c656374696f6e456e64"></a>

<a id="api-4669656c642e436f6e74726f6c2e2470726f70732e70726f703a73656c656374696f6e5374617274"></a>

<a id="api-4669656c642e436f6e74726f6c2e2470726f70732e70726f703a73697a65"></a>

<a id="api-4669656c642e436f6e74726f6c2e2470726f70732e70726f703a737263"></a>

<a id="api-4669656c642e436f6e74726f6c2e2470726f70732e70726f703a73746570"></a>

<a id="api-4669656c642e436f6e74726f6c2e2470726f70732e70726f703a74797065"></a>

<a id="api-4669656c642e436f6e74726f6c2e2470726f70732e70726f703a7573654d6170"></a>

<a id="api-4669656c642e436f6e74726f6c2e2470726f70732e70726f703a76616c7565417344617465"></a>

<a id="api-4669656c642e436f6e74726f6c2e2470726f70732e70726f703a76616c756541734e756d626572"></a>

<a id="api-4669656c642e436f6e74726f6c2e2470726f70732e70726f703a7765626b69746469726563746f7279"></a>

<a id="api-4669656c642e436f6e74726f6c2e2470726f70732e70726f703a7769647468"></a>

### Field.Control

Native input facade. Validation and form registration belong to field-core.

Declaration: `packages/solid/build/types/field/control/FieldControl.d.ts:6`

#### Declaration

```typescript
<E extends HTMLElement = HTMLInputElement>(props: FieldControlProps<E>) => JSX.Element
```

<a id="api-4669656c642e436f6e74726f6c2e2470726f70732e64656661756c7456616c7565"></a>

<a id="FieldControl-defaultValue"></a>

<a id="api-4669656c642e436f6e74726f6c2e2470726f70732e76616c7565"></a>

<a id="FieldControl-value"></a>

<a id="api-4669656c642e436f6e74726f6c2e2470726f70732e6f6e56616c75654368616e6765"></a>

<a id="FieldControl-onValueChange"></a>

<a id="api-4669656c642e436f6e74726f6c2e2470726f70732e726566"></a>

<a id="FieldControl-ref"></a>

<a id="api-4669656c642e436f6e74726f6c2e2470726f70732e6175746f466f637573"></a>

<a id="FieldControl-autoFocus"></a>

<a id="api-4669656c642e436f6e74726f6c2e2470726f70732e636c617373"></a>

<a id="FieldControl-class"></a>

<a id="api-4669656c642e436f6e74726f6c2e2470726f70732e7374796c65"></a>

<a id="FieldControl-style"></a>

<a id="api-4669656c642e436f6e74726f6c2e2470726f70732e72656e646572"></a>

<a id="FieldControl-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| defaultValue | `string \| number \| readonly string[] \| undefined` | No | Unavailable |  |
| value | `string \| number \| string[] \| readonly string[] \| undefined` | No | Unavailable |  |
| onValueChange | `((value: string, details: FieldControlChangeEventDetails) => void) \| undefined` | No | Unavailable |  |
| ref | `JSX.Ref<E>` | No | Unavailable |  |
| autoFocus | `boolean \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<FieldControlState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<FieldControlState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<JSX.InputHTMLAttributes<E>, FieldControlState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accept`, `accesskey`, `align`, `alpha`, `alt`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocomplete`, `autocorrect`, `autofocus`, `capture`, `checked`, `children`, `colorspace`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `dirname`, `disabled`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `form`, `formaction`, `formenctype`, `formmethod`, `formnovalidate`, `formtarget`, `height`, `hidden`, `id`, `incremental`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `list`, `max`, `maxlength`, `min`, `minlength`, `multiple`, `name`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `pattern`, `placeholder`, `popover`, `popovertarget`, `popovertargetaction`, `prefix`, `prop:accept`, `prop:align`, `prop:alt`, `prop:autocomplete`, `prop:capture`, `prop:checked`, `prop:defaultChecked`, `prop:defaultValue`, `prop:dirName`, `prop:disabled`, `prop:formAction`, `prop:formEnctype`, `prop:formMethod`, `prop:formNoValidate`, `prop:formTarget`, `prop:height`, `prop:indeterminate`, `prop:max`, `prop:maxLength`, `prop:min`, `prop:minLength`, `prop:multiple`, `prop:name`, `prop:pattern`, `prop:placeholder`, `prop:popoverTargetAction`, `prop:popoverTargetElement`, `prop:readOnly`, `prop:required`, `prop:selectionDirection`, `prop:selectionEnd`, `prop:selectionStart`, `prop:size`, `prop:src`, `prop:step`, `prop:type`, `prop:useMap`, `prop:value`, `prop:valueAsDate`, `prop:valueAsNumber`, `prop:webkitdirectory`, `prop:width`, `property`, `readonly`, `required`, `resource`, `results`, `role`, `size`, `slot`, `spellcheck`, `src`, `step`, `tabindex`, `textContent`, `title`, `translate`, `type`, `typeof`, `usemap`, `virtualkeyboardpolicy`, `vocab`, `webkitdirectory`, `width`, `writingsuggestions`

#### Data attributes

<a id="api-4669656c64436f6e74726f6c44617461417474726962757465732e64697361626c6564"></a>

<a id="api-4669656c64436f6e74726f6c44617461417474726962757465732e76616c6964"></a>

<a id="api-4669656c64436f6e74726f6c44617461417474726962757465732e696e76616c6964"></a>

<a id="api-4669656c64436f6e74726f6c44617461417474726962757465732e6469727479"></a>

<a id="api-4669656c64436f6e74726f6c44617461417474726962757465732e746f7563686564"></a>

<a id="api-4669656c64436f6e74726f6c44617461417474726962757465732e66696c6c6564"></a>

<a id="api-4669656c64436f6e74726f6c44617461417474726962757465732e666f6375736564"></a>

| Name | Description |
| --- | --- |
| data-disabled |  |
| data-valid |  |
| data-invalid |  |
| data-dirty |  |
| data-touched |  |
| data-filled |  |
| data-focused |  |

#### CSS variables

Metadata status: unavailable.

<a id="api-4669656c642e436f6e74726f6c2e50726f7073"></a>

<a id="fieldcontrolprops"></a>

<a id="api-4669656c642e436f6e74726f6c2e50726f70732e70726f703a616363657074"></a>

<a id="api-4669656c642e436f6e74726f6c2e50726f70732e70726f703a616c69676e"></a>

<a id="api-4669656c642e436f6e74726f6c2e50726f70732e70726f703a616c74"></a>

<a id="api-4669656c642e436f6e74726f6c2e50726f70732e70726f703a6175746f636f6d706c657465"></a>

<a id="api-4669656c642e436f6e74726f6c2e50726f70732e70726f703a63617074757265"></a>

<a id="api-4669656c642e436f6e74726f6c2e50726f70732e70726f703a6469724e616d65"></a>

<a id="api-4669656c642e436f6e74726f6c2e50726f70732e70726f703a64697361626c6564"></a>

<a id="api-4669656c642e436f6e74726f6c2e50726f70732e70726f703a666f726d416374696f6e"></a>

<a id="api-4669656c642e436f6e74726f6c2e50726f70732e70726f703a666f726d456e6374797065"></a>

<a id="api-4669656c642e436f6e74726f6c2e50726f70732e70726f703a666f726d4d6574686f64"></a>

<a id="api-4669656c642e436f6e74726f6c2e50726f70732e70726f703a666f726d4e6f56616c6964617465"></a>

<a id="api-4669656c642e436f6e74726f6c2e50726f70732e70726f703a666f726d546172676574"></a>

<a id="api-4669656c642e436f6e74726f6c2e50726f70732e70726f703a686569676874"></a>

<a id="api-4669656c642e436f6e74726f6c2e50726f70732e70726f703a696e64657465726d696e617465"></a>

<a id="api-4669656c642e436f6e74726f6c2e50726f70732e70726f703a6d6178"></a>

<a id="api-4669656c642e436f6e74726f6c2e50726f70732e70726f703a6d61784c656e677468"></a>

<a id="api-4669656c642e436f6e74726f6c2e50726f70732e70726f703a6d696e"></a>

<a id="api-4669656c642e436f6e74726f6c2e50726f70732e70726f703a6d696e4c656e677468"></a>

<a id="api-4669656c642e436f6e74726f6c2e50726f70732e70726f703a6d756c7469706c65"></a>

<a id="api-4669656c642e436f6e74726f6c2e50726f70732e70726f703a6e616d65"></a>

<a id="api-4669656c642e436f6e74726f6c2e50726f70732e70726f703a7061747465726e"></a>

<a id="api-4669656c642e436f6e74726f6c2e50726f70732e70726f703a706c616365686f6c646572"></a>

<a id="api-4669656c642e436f6e74726f6c2e50726f70732e70726f703a706f706f766572546172676574416374696f6e"></a>

<a id="api-4669656c642e436f6e74726f6c2e50726f70732e70726f703a706f706f766572546172676574456c656d656e74"></a>

<a id="api-4669656c642e436f6e74726f6c2e50726f70732e70726f703a726561644f6e6c79"></a>

<a id="api-4669656c642e436f6e74726f6c2e50726f70732e70726f703a7265717569726564"></a>

<a id="api-4669656c642e436f6e74726f6c2e50726f70732e70726f703a73656c656374696f6e446972656374696f6e"></a>

<a id="api-4669656c642e436f6e74726f6c2e50726f70732e70726f703a73656c656374696f6e456e64"></a>

<a id="api-4669656c642e436f6e74726f6c2e50726f70732e70726f703a73656c656374696f6e5374617274"></a>

<a id="api-4669656c642e436f6e74726f6c2e50726f70732e70726f703a73697a65"></a>

<a id="api-4669656c642e436f6e74726f6c2e50726f70732e70726f703a737263"></a>

<a id="api-4669656c642e436f6e74726f6c2e50726f70732e70726f703a73746570"></a>

<a id="api-4669656c642e436f6e74726f6c2e50726f70732e70726f703a74797065"></a>

<a id="api-4669656c642e436f6e74726f6c2e50726f70732e70726f703a7573654d6170"></a>

<a id="api-4669656c642e436f6e74726f6c2e50726f70732e70726f703a76616c7565417344617465"></a>

<a id="api-4669656c642e436f6e74726f6c2e50726f70732e70726f703a76616c756541734e756d626572"></a>

<a id="api-4669656c642e436f6e74726f6c2e50726f70732e70726f703a7765626b69746469726563746f7279"></a>

<a id="api-4669656c642e436f6e74726f6c2e50726f70732e70726f703a7769647468"></a>

### Related exported type: Field.Control.Props

Declaration: `packages/solid/build/types/field/control/FieldControl.d.ts:19`

#### Declaration

```typescript
Props
```

<a id="api-4669656c642e436f6e74726f6c2e50726f70732e64656661756c7456616c7565"></a>

<a id="FieldControlProps-defaultValue"></a>

<a id="api-4669656c642e436f6e74726f6c2e50726f70732e76616c7565"></a>

<a id="FieldControlProps-value"></a>

<a id="api-4669656c642e436f6e74726f6c2e50726f70732e6f6e56616c75654368616e6765"></a>

<a id="FieldControlProps-onValueChange"></a>

<a id="api-4669656c642e436f6e74726f6c2e50726f70732e726566"></a>

<a id="FieldControlProps-ref"></a>

<a id="api-4669656c642e436f6e74726f6c2e50726f70732e6175746f466f637573"></a>

<a id="FieldControlProps-autoFocus"></a>

<a id="api-4669656c642e436f6e74726f6c2e50726f70732e636c617373"></a>

<a id="FieldControlProps-class"></a>

<a id="api-4669656c642e436f6e74726f6c2e50726f70732e7374796c65"></a>

<a id="FieldControlProps-style"></a>

<a id="api-4669656c642e436f6e74726f6c2e50726f70732e72656e646572"></a>

<a id="FieldControlProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| defaultValue | `string \| number \| readonly string[] \| undefined` | No | Unavailable |  |
| value | `string \| number \| string[] \| readonly string[] \| undefined` | No | Unavailable |  |
| onValueChange | `((value: string, details: FieldControlChangeEventDetails) => void) \| undefined` | No | Unavailable |  |
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

<a id="api-4669656c642e436f6e74726f6c2e5374617465"></a>

<a id="fieldcontrolstate"></a>

### Related exported type: Field.Control.State

Declaration: `packages/solid/build/types/field/control/FieldControl.d.ts:20`

#### Declaration

```typescript
FieldControlState
```

<a id="api-4669656c642e436f6e74726f6c2e53746174652e6469727479"></a>

<a id="FieldControlState-dirty"></a>

<a id="api-4669656c642e436f6e74726f6c2e53746174652e66696c6c6564"></a>

<a id="FieldControlState-filled"></a>

<a id="api-4669656c642e436f6e74726f6c2e53746174652e666f6375736564"></a>

<a id="FieldControlState-focused"></a>

<a id="api-4669656c642e436f6e74726f6c2e53746174652e746f7563686564"></a>

<a id="FieldControlState-touched"></a>

<a id="api-4669656c642e436f6e74726f6c2e53746174652e64697361626c6564"></a>

<a id="FieldControlState-disabled"></a>

<a id="api-4669656c642e436f6e74726f6c2e53746174652e76616c6964"></a>

<a id="FieldControlState-valid"></a>

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

<a id="api-4669656c642e436f6e74726f6c2e4368616e67654576656e74526561736f6e"></a>

<a id="fieldcontrolchangeeventreason"></a>

### Related exported type: Field.Control.ChangeEventReason

Declaration: `packages/solid/build/types/field/control/FieldControl.d.ts:21`

#### Declaration

```typescript
"none"
```

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4669656c642e436f6e74726f6c2e4368616e67654576656e7444657461696c73"></a>

<a id="fieldcontrolchangeeventdetails"></a>

### Related exported type: Field.Control.ChangeEventDetails

Declaration: `packages/solid/build/types/field/control/FieldControl.d.ts:22`

#### Declaration

```typescript
{ reason: "none"; event: Event; cancel(): void; allowPropagation(): void; isCanceled: boolean; isPropagationAllowed: boolean; trigger: Element | undefined; }
```

<a id="api-4669656c642e436f6e74726f6c2e4368616e67654576656e7444657461696c732e616c6c6f7750726f7061676174696f6e"></a>

<a id="FieldControlChangeEventDetails-allowPropagation"></a>

<a id="api-4669656c642e436f6e74726f6c2e4368616e67654576656e7444657461696c732e63616e63656c"></a>

<a id="FieldControlChangeEventDetails-cancel"></a>

<a id="api-4669656c642e436f6e74726f6c2e4368616e67654576656e7444657461696c732e6576656e74"></a>

<a id="FieldControlChangeEventDetails-event"></a>

<a id="api-4669656c642e436f6e74726f6c2e4368616e67654576656e7444657461696c732e697343616e63656c6564"></a>

<a id="FieldControlChangeEventDetails-isCanceled"></a>

<a id="api-4669656c642e436f6e74726f6c2e4368616e67654576656e7444657461696c732e697350726f7061676174696f6e416c6c6f776564"></a>

<a id="FieldControlChangeEventDetails-isPropagationAllowed"></a>

<a id="api-4669656c642e436f6e74726f6c2e4368616e67654576656e7444657461696c732e726561736f6e"></a>

<a id="FieldControlChangeEventDetails-reason"></a>

<a id="api-4669656c642e436f6e74726f6c2e4368616e67654576656e7444657461696c732e74726967676572"></a>

<a id="FieldControlChangeEventDetails-trigger"></a>

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

<a id="description"></a>

### Description

<a id="api-4669656c642e4465736372697074696f6e"></a>

<a id="fielddescription"></a>

<a id="api-4669656c642e4465736372697074696f6e2e2470726f70732e70726f703a616c69676e"></a>

### Field.Description

Declaration: `packages/solid/build/types/field/description/FieldDescription.d.ts:4`

#### Declaration

```typescript
(props: FieldDescriptionProps) => JSX.Element
```

<a id="api-4669656c642e4465736372697074696f6e2e2470726f70732e636c617373"></a>

<a id="FieldDescription-class"></a>

<a id="api-4669656c642e4465736372697074696f6e2e2470726f70732e7374796c65"></a>

<a id="FieldDescription-style"></a>

<a id="api-4669656c642e4465736372697074696f6e2e2470726f70732e72656e646572"></a>

<a id="FieldDescription-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<FieldDescriptionState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<FieldDescriptionState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<JSX.HTMLAttributes<HTMLParagraphElement>, FieldDescriptionState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-4669656c644465736372697074696f6e44617461417474726962757465732e64697361626c6564"></a>

<a id="api-4669656c644465736372697074696f6e44617461417474726962757465732e76616c6964"></a>

<a id="api-4669656c644465736372697074696f6e44617461417474726962757465732e696e76616c6964"></a>

<a id="api-4669656c644465736372697074696f6e44617461417474726962757465732e6469727479"></a>

<a id="api-4669656c644465736372697074696f6e44617461417474726962757465732e746f7563686564"></a>

<a id="api-4669656c644465736372697074696f6e44617461417474726962757465732e66696c6c6564"></a>

<a id="api-4669656c644465736372697074696f6e44617461417474726962757465732e666f6375736564"></a>

| Name | Description |
| --- | --- |
| data-disabled |  |
| data-valid |  |
| data-invalid |  |
| data-dirty |  |
| data-touched |  |
| data-filled |  |
| data-focused |  |

#### CSS variables

Metadata status: unavailable.

<a id="api-4669656c642e4465736372697074696f6e2e50726f7073"></a>

<a id="fielddescriptionprops"></a>

<a id="api-4669656c642e4465736372697074696f6e2e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Field.Description.Props

Declaration: `packages/solid/build/types/field/description/FieldDescription.d.ts:10`

#### Declaration

```typescript
FieldDescriptionProps
```

<a id="api-4669656c642e4465736372697074696f6e2e50726f70732e636c617373"></a>

<a id="FieldDescriptionProps-class"></a>

<a id="api-4669656c642e4465736372697074696f6e2e50726f70732e7374796c65"></a>

<a id="FieldDescriptionProps-style"></a>

<a id="api-4669656c642e4465736372697074696f6e2e50726f70732e72656e646572"></a>

<a id="FieldDescriptionProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<FieldDescriptionState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<FieldDescriptionState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<JSX.HTMLAttributes<HTMLParagraphElement>, FieldDescriptionState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4669656c642e4465736372697074696f6e2e5374617465"></a>

<a id="fielddescriptionstate"></a>

### Related exported type: Field.Description.State

Declaration: `packages/solid/build/types/field/description/FieldDescription.d.ts:11`

#### Declaration

```typescript
FieldDescriptionState
```

<a id="api-4669656c642e4465736372697074696f6e2e53746174652e6469727479"></a>

<a id="FieldDescriptionState-dirty"></a>

<a id="api-4669656c642e4465736372697074696f6e2e53746174652e66696c6c6564"></a>

<a id="FieldDescriptionState-filled"></a>

<a id="api-4669656c642e4465736372697074696f6e2e53746174652e666f6375736564"></a>

<a id="FieldDescriptionState-focused"></a>

<a id="api-4669656c642e4465736372697074696f6e2e53746174652e746f7563686564"></a>

<a id="FieldDescriptionState-touched"></a>

<a id="api-4669656c642e4465736372697074696f6e2e53746174652e64697361626c6564"></a>

<a id="FieldDescriptionState-disabled"></a>

<a id="api-4669656c642e4465736372697074696f6e2e53746174652e76616c6964"></a>

<a id="FieldDescriptionState-valid"></a>

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

<a id="item"></a>

### Item

<a id="api-4669656c642e4974656d"></a>

<a id="fielditem"></a>

<a id="api-4669656c642e4974656d2e2470726f70732e70726f703a616c69676e"></a>

### Field.Item

Declaration: `packages/solid/build/types/field/item/FieldItem.d.ts:4`

#### Declaration

```typescript
(props: FieldItemProps) => JSX.Element
```

<a id="api-4669656c642e4974656d2e2470726f70732e64697361626c6564"></a>

<a id="FieldItem-disabled"></a>

<a id="api-4669656c642e4974656d2e2470726f70732e636c617373"></a>

<a id="FieldItem-class"></a>

<a id="api-4669656c642e4974656d2e2470726f70732e7374796c65"></a>

<a id="FieldItem-style"></a>

<a id="api-4669656c642e4974656d2e2470726f70732e72656e646572"></a>

<a id="FieldItem-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| disabled | `boolean \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<FieldItemState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<FieldItemState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<JSX.HTMLAttributes<HTMLDivElement>, FieldItemState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-4669656c644974656d44617461417474726962757465732e64697361626c6564"></a>

<a id="api-4669656c644974656d44617461417474726962757465732e76616c6964"></a>

<a id="api-4669656c644974656d44617461417474726962757465732e696e76616c6964"></a>

<a id="api-4669656c644974656d44617461417474726962757465732e6469727479"></a>

<a id="api-4669656c644974656d44617461417474726962757465732e746f7563686564"></a>

<a id="api-4669656c644974656d44617461417474726962757465732e66696c6c6564"></a>

<a id="api-4669656c644974656d44617461417474726962757465732e666f6375736564"></a>

| Name | Description |
| --- | --- |
| data-disabled |  |
| data-valid |  |
| data-invalid |  |
| data-dirty |  |
| data-touched |  |
| data-filled |  |
| data-focused |  |

#### CSS variables

Metadata status: unavailable.

<a id="api-4669656c642e4974656d2e50726f7073"></a>

<a id="fielditemprops"></a>

<a id="api-4669656c642e4974656d2e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Field.Item.Props

Declaration: `packages/solid/build/types/field/item/FieldItem.d.ts:11`

#### Declaration

```typescript
FieldItemProps
```

<a id="api-4669656c642e4974656d2e50726f70732e64697361626c6564"></a>

<a id="FieldItemProps-disabled"></a>

<a id="api-4669656c642e4974656d2e50726f70732e636c617373"></a>

<a id="FieldItemProps-class"></a>

<a id="api-4669656c642e4974656d2e50726f70732e7374796c65"></a>

<a id="FieldItemProps-style"></a>

<a id="api-4669656c642e4974656d2e50726f70732e72656e646572"></a>

<a id="FieldItemProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| disabled | `boolean \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<FieldItemState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<FieldItemState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<JSX.HTMLAttributes<HTMLDivElement>, FieldItemState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4669656c642e4974656d2e5374617465"></a>

<a id="fielditemstate"></a>

### Related exported type: Field.Item.State

Declaration: `packages/solid/build/types/field/item/FieldItem.d.ts:12`

#### Declaration

```typescript
FieldItemState
```

<a id="api-4669656c642e4974656d2e53746174652e6469727479"></a>

<a id="FieldItemState-dirty"></a>

<a id="api-4669656c642e4974656d2e53746174652e66696c6c6564"></a>

<a id="FieldItemState-filled"></a>

<a id="api-4669656c642e4974656d2e53746174652e666f6375736564"></a>

<a id="FieldItemState-focused"></a>

<a id="api-4669656c642e4974656d2e53746174652e746f7563686564"></a>

<a id="FieldItemState-touched"></a>

<a id="api-4669656c642e4974656d2e53746174652e64697361626c6564"></a>

<a id="FieldItemState-disabled"></a>

<a id="api-4669656c642e4974656d2e53746174652e76616c6964"></a>

<a id="FieldItemState-valid"></a>

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

<a id="error"></a>

### Error

<a id="api-4669656c642e4572726f72"></a>

<a id="fielderror"></a>

<a id="api-4669656c642e4572726f722e2470726f70732e70726f703a616c69676e"></a>

### Field.Error

Declaration: `packages/solid/build/types/field/error/FieldError.d.ts:5`

#### Declaration

```typescript
(props: FieldErrorProps) => JSX.Element
```

<a id="api-4669656c642e4572726f722e2470726f70732e6d61746368"></a>

<a id="FieldError-match"></a>

<a id="api-4669656c642e4572726f722e2470726f70732e636c617373"></a>

<a id="FieldError-class"></a>

<a id="api-4669656c642e4572726f722e2470726f70732e7374796c65"></a>

<a id="FieldError-style"></a>

<a id="api-4669656c642e4572726f722e2470726f70732e72656e646572"></a>

<a id="FieldError-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| match | `boolean \| keyof ValidityState \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<FieldErrorState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<FieldErrorState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<JSX.HTMLAttributes<HTMLDivElement>, FieldErrorState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-4669656c644572726f7244617461417474726962757465732e64697361626c6564"></a>

<a id="api-4669656c644572726f7244617461417474726962757465732e76616c6964"></a>

<a id="api-4669656c644572726f7244617461417474726962757465732e696e76616c6964"></a>

<a id="api-4669656c644572726f7244617461417474726962757465732e6469727479"></a>

<a id="api-4669656c644572726f7244617461417474726962757465732e746f7563686564"></a>

<a id="api-4669656c644572726f7244617461417474726962757465732e66696c6c6564"></a>

<a id="api-4669656c644572726f7244617461417474726962757465732e666f6375736564"></a>

<a id="api-4669656c644572726f7244617461417474726962757465732e7374617274696e675374796c65"></a>

<a id="api-4669656c644572726f7244617461417474726962757465732e656e64696e675374796c65"></a>

| Name | Description |
| --- | --- |
| data-disabled |  |
| data-valid |  |
| data-invalid |  |
| data-dirty |  |
| data-touched |  |
| data-filled |  |
| data-focused |  |
| data-starting-style | Present when transitionStatus is 'starting'. |
| data-ending-style | Present when transitionStatus is 'ending'. |

#### CSS variables

Metadata status: unavailable.

<a id="api-4669656c642e4572726f722e50726f7073"></a>

<a id="fielderrorprops"></a>

<a id="api-4669656c642e4572726f722e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Field.Error.Props

Declaration: `packages/solid/build/types/field/error/FieldError.d.ts:13`

#### Declaration

```typescript
FieldErrorProps
```

<a id="api-4669656c642e4572726f722e50726f70732e6d61746368"></a>

<a id="FieldErrorProps-match"></a>

<a id="api-4669656c642e4572726f722e50726f70732e636c617373"></a>

<a id="FieldErrorProps-class"></a>

<a id="api-4669656c642e4572726f722e50726f70732e7374796c65"></a>

<a id="FieldErrorProps-style"></a>

<a id="api-4669656c642e4572726f722e50726f70732e72656e646572"></a>

<a id="FieldErrorProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| match | `boolean \| keyof ValidityState \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<FieldErrorState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<FieldErrorState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<JSX.HTMLAttributes<HTMLDivElement>, FieldErrorState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4669656c642e4572726f722e5374617465"></a>

<a id="fielderrorstate"></a>

### Related exported type: Field.Error.State

Declaration: `packages/solid/build/types/field/error/FieldError.d.ts:14`

#### Declaration

```typescript
FieldErrorState
```

<a id="api-4669656c642e4572726f722e53746174652e6469727479"></a>

<a id="FieldErrorState-dirty"></a>

<a id="api-4669656c642e4572726f722e53746174652e66696c6c6564"></a>

<a id="FieldErrorState-filled"></a>

<a id="api-4669656c642e4572726f722e53746174652e666f6375736564"></a>

<a id="FieldErrorState-focused"></a>

<a id="api-4669656c642e4572726f722e53746174652e746f7563686564"></a>

<a id="FieldErrorState-touched"></a>

<a id="api-4669656c642e4572726f722e53746174652e7472616e736974696f6e537461747573"></a>

<a id="FieldErrorState-transitionStatus"></a>

<a id="api-4669656c642e4572726f722e53746174652e64697361626c6564"></a>

<a id="FieldErrorState-disabled"></a>

<a id="api-4669656c642e4572726f722e53746174652e76616c6964"></a>

<a id="FieldErrorState-valid"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| dirty | `boolean` | Yes | Unavailable |  |
| filled | `boolean` | Yes | Unavailable |  |
| focused | `boolean` | Yes | Unavailable |  |
| touched | `boolean` | Yes | Unavailable |  |
| transitionStatus | `TransitionStatus` | Yes | Unavailable |  |
| disabled | `boolean` | Yes | Unavailable |  |
| valid | `boolean \| null` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="validity"></a>

### Validity

<a id="api-4669656c642e56616c6964697479"></a>

<a id="fieldvalidity"></a>

### Field.Validity

A stable getter-backed validity view; unrelated focus/value styling does not recreate it.

Declaration: `packages/solid/build/types/field/validity/FieldValidity.d.ts:5`

#### Declaration

```typescript
(props: FieldValidityProps) => JSX.Element
```

<a id="api-4669656c642e56616c69646974792e2470726f70732e6368696c6472656e"></a>

<a id="FieldValidity-children"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| children | `(state: FieldValidityState) => JSX.Element` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4669656c642e56616c69646974792e50726f7073"></a>

<a id="fieldvalidityprops"></a>

### Related exported type: Field.Validity.Props

Declaration: `packages/solid/build/types/field/validity/FieldValidity.d.ts:14`

#### Declaration

```typescript
FieldValidityProps
```

<a id="api-4669656c642e56616c69646974792e50726f70732e6368696c6472656e"></a>

<a id="FieldValidityProps-children"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| children | `(state: FieldValidityState) => JSX.Element` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4669656c642e56616c69646974792e5374617465"></a>

<a id="fieldvaliditystate"></a>

### Related exported type: Field.Validity.State

Declaration: `packages/solid/build/types/field/validity/FieldValidity.d.ts:15`

#### Declaration

```typescript
FieldValidityState
```

<a id="api-4669656c642e56616c69646974792e53746174652e76616c7565"></a>

<a id="FieldValidityState-value"></a>

<a id="api-4669656c642e56616c69646974792e53746174652e6572726f7273"></a>

<a id="FieldValidityState-errors"></a>

<a id="api-4669656c642e56616c69646974792e53746174652e6572726f72"></a>

<a id="FieldValidityState-error"></a>

<a id="api-4669656c642e56616c69646974792e53746174652e696e697469616c56616c7565"></a>

<a id="FieldValidityState-initialValue"></a>

<a id="api-4669656c642e56616c69646974792e53746174652e7472616e736974696f6e537461747573"></a>

<a id="FieldValidityState-transitionStatus"></a>

<a id="api-4669656c642e56616c69646974792e53746174652e76616c6964697479"></a>

<a id="FieldValidityState-validity"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| value | `unknown` | Yes | Unavailable |  |
| errors | `string[]` | Yes | Unavailable |  |
| error | `string` | Yes | Unavailable |  |
| initialValue | `unknown` | Yes | Unavailable |  |
| transitionStatus | `TransitionStatus` | Yes | Unavailable |  |
| validity | `{ badInput: boolean; customError: boolean; patternMismatch: boolean; rangeOverflow: boolean; rangeUnderflow: boolean; stepMismatch: boolean; tooLong: boolean; tooShort: boolean; typeMismatch: boolean; valueMissing: boolean; } & { valid: boolean \| null; }` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

