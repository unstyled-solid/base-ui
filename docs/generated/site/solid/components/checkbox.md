<a id="checkbox"></a>

# Checkbox

An easily stylable checkbox component.

[Open mounted Solid demo: checkbox/hero](/solid/components/checkbox)

<a id="usage-guidelines"></a>

## Usage guidelines

- **Form controls must have an accessible name**: It can be created using a `<label>` element or the `Field` component. See [Labeling a checkbox](#labeling-a-checkbox) and the [forms guide](/solid/handbook/forms).

<a id="anatomy"></a>

## Anatomy

Import the component and assemble its parts:

```tsx
import { Checkbox } from '@unstyled-solid/base-ui/checkbox';
<Checkbox.Root>
  <Checkbox.Indicator />
</Checkbox.Root>;
```

<a id="examples"></a>

## Examples

<a id="labeling-a-checkbox"></a>

### Labeling a checkbox

An enclosing `<label>` is the simplest labeling pattern:

```tsx
<label>
  <Checkbox.Root />
  Accept terms and conditions
</label>;
```

<a id="rendering-as-a-native-button"></a>

### Rendering as a native button

By default, `<Checkbox.Root>` renders a `<span>` element to support enclosing labels. Prefer rendering the checkbox as a native button when using sibling labels (`htmlFor`/`id`).

```tsx
<div>
  <label for="notifications-checkbox">Enable notifications</label>

  <Checkbox.Root
    id="notifications-checkbox"
    nativeButton
    render={(renderProps) => <button {...renderProps} />}
  >
    <Checkbox.Indicator />
  </Checkbox.Root>
</div>;
```

Native buttons with wrapping labels are supported by using the `render` callback to avoid invalid HTML, so the hidden input is placed outside the label:

```tsx
<Checkbox.Root
  nativeButton
  render={(buttonProps) => (
    <label>
      <button {...buttonProps} />
      Enable notifications
    </label>
  )}
/>;
```

<a id="form-integration"></a>

### Form integration

Use [Field](/solid/components/field) to handle label associations and form integration:

```tsx
<Form>
  <Field.Root name="stayLoggedIn">
    <Field.Label>
      <Checkbox.Root />
      Stay logged in for 7 days
    </Field.Label>
  </Field.Root>
</Form>;
```

<a id="api-reference"></a>

## API reference

<a id="root"></a>

### Root

<a id="api-436865636b626f782e526f6f74"></a>

<a id="checkboxroot"></a>

### Checkbox.Root

A span-plus-native-input checkbox; only the accepted native change commits selection.

Declaration: `packages/solid/build/types/checkbox/root/CheckboxRoot.d.ts:33`

#### Declaration

```typescript
(props: CheckboxRootProps) => JSX.Element
```

<a id="api-436865636b626f782e526f6f742e2470726f70732e6e616d65"></a>

<a id="CheckboxRoot-name"></a>

<a id="api-436865636b626f782e526f6f742e2470726f70732e64656661756c74436865636b6564"></a>

<a id="CheckboxRoot-defaultChecked"></a>

<a id="api-436865636b626f782e526f6f742e2470726f70732e636865636b6564"></a>

<a id="CheckboxRoot-checked"></a>

<a id="api-436865636b626f782e526f6f742e2470726f70732e6f6e436865636b65644368616e6765"></a>

<a id="CheckboxRoot-onCheckedChange"></a>

<a id="api-436865636b626f782e526f6f742e2470726f70732e696e64657465726d696e617465"></a>

<a id="CheckboxRoot-indeterminate"></a>

<a id="api-436865636b626f782e526f6f742e2470726f70732e76616c7565"></a>

<a id="CheckboxRoot-value"></a>

<a id="api-436865636b626f782e526f6f742e2470726f70732e666f726d"></a>

<a id="CheckboxRoot-form"></a>

<a id="api-436865636b626f782e526f6f742e2470726f70732e6e6174697665427574746f6e"></a>

<a id="CheckboxRoot-nativeButton"></a>

<a id="api-436865636b626f782e526f6f742e2470726f70732e706172656e74"></a>

<a id="CheckboxRoot-parent"></a>

<a id="api-436865636b626f782e526f6f742e2470726f70732e756e636865636b656456616c7565"></a>

<a id="CheckboxRoot-uncheckedValue"></a>

<a id="api-436865636b626f782e526f6f742e2470726f70732e64697361626c6564"></a>

<a id="CheckboxRoot-disabled"></a>

<a id="api-436865636b626f782e526f6f742e2470726f70732e726561644f6e6c79"></a>

<a id="CheckboxRoot-readOnly"></a>

<a id="api-436865636b626f782e526f6f742e2470726f70732e7265717569726564"></a>

<a id="CheckboxRoot-required"></a>

<a id="api-436865636b626f782e526f6f742e2470726f70732e696e707574526566"></a>

<a id="CheckboxRoot-inputRef"></a>

<a id="api-436865636b626f782e526f6f742e2470726f70732e6964"></a>

<a id="CheckboxRoot-id"></a>

<a id="api-436865636b626f782e526f6f742e2470726f70732e636c617373"></a>

<a id="CheckboxRoot-class"></a>

<a id="api-436865636b626f782e526f6f742e2470726f70732e7374796c65"></a>

<a id="CheckboxRoot-style"></a>

<a id="api-436865636b626f782e526f6f742e2470726f70732e72656e646572"></a>

<a id="CheckboxRoot-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| name | `string \| undefined` | No | Unavailable |  |
| defaultChecked | `boolean \| undefined` | No | false |  |
| checked | `boolean \| undefined` | No | Unavailable |  |
| onCheckedChange | `((checked: boolean, details: CheckboxRootChangeEventDetails) => void) \| undefined` | No | Unavailable |  |
| indeterminate | `boolean \| undefined` | No | Unavailable |  |
| value | `string \| undefined` | No | Unavailable |  |
| form | `string \| undefined` | No | Unavailable |  |
| nativeButton | `boolean \| undefined` | No | false |  |
| parent | `boolean \| undefined` | No | Unavailable |  |
| uncheckedValue | `string \| undefined` | No | Unavailable |  |
| disabled | `boolean \| undefined` | No | Unavailable |  |
| readOnly | `boolean \| undefined` | No | false |  |
| required | `boolean \| undefined` | No | false |  |
| inputRef | `JSX.Ref<HTMLInputElement>` | No | Unavailable |  |
| id | `string \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<CheckboxRootState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<CheckboxRootState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, CheckboxRootState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-436865636b626f78526f6f7444617461417474726962757465732e636865636b6564"></a>

<a id="api-436865636b626f78526f6f7444617461417474726962757465732e756e636865636b6564"></a>

<a id="api-436865636b626f78526f6f7444617461417474726962757465732e64697361626c6564"></a>

<a id="api-436865636b626f78526f6f7444617461417474726962757465732e726561646f6e6c79"></a>

<a id="api-436865636b626f78526f6f7444617461417474726962757465732e7265717569726564"></a>

<a id="api-436865636b626f78526f6f7444617461417474726962757465732e76616c6964"></a>

<a id="api-436865636b626f78526f6f7444617461417474726962757465732e696e76616c6964"></a>

<a id="api-436865636b626f78526f6f7444617461417474726962757465732e6469727479"></a>

<a id="api-436865636b626f78526f6f7444617461417474726962757465732e746f7563686564"></a>

<a id="api-436865636b626f78526f6f7444617461417474726962757465732e66696c6c6564"></a>

<a id="api-436865636b626f78526f6f7444617461417474726962757465732e666f6375736564"></a>

<a id="api-436865636b626f78526f6f7444617461417474726962757465732e696e64657465726d696e617465"></a>

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
| data-indeterminate |  |

#### CSS variables

Metadata status: unavailable.

<a id="api-436865636b626f782e526f6f742e50726f7073"></a>

<a id="checkboxrootprops"></a>

### Related exported type: Checkbox.Root.Props

Declaration: `packages/solid/build/types/checkbox/root/CheckboxRoot.d.ts:35`

#### Declaration

```typescript
CheckboxRootProps
```

<a id="api-436865636b626f782e526f6f742e50726f70732e6e616d65"></a>

<a id="CheckboxRootProps-name"></a>

<a id="api-436865636b626f782e526f6f742e50726f70732e64656661756c74436865636b6564"></a>

<a id="CheckboxRootProps-defaultChecked"></a>

<a id="api-436865636b626f782e526f6f742e50726f70732e636865636b6564"></a>

<a id="CheckboxRootProps-checked"></a>

<a id="api-436865636b626f782e526f6f742e50726f70732e6f6e436865636b65644368616e6765"></a>

<a id="CheckboxRootProps-onCheckedChange"></a>

<a id="api-436865636b626f782e526f6f742e50726f70732e696e64657465726d696e617465"></a>

<a id="CheckboxRootProps-indeterminate"></a>

<a id="api-436865636b626f782e526f6f742e50726f70732e76616c7565"></a>

<a id="CheckboxRootProps-value"></a>

<a id="api-436865636b626f782e526f6f742e50726f70732e666f726d"></a>

<a id="CheckboxRootProps-form"></a>

<a id="api-436865636b626f782e526f6f742e50726f70732e6e6174697665427574746f6e"></a>

<a id="CheckboxRootProps-nativeButton"></a>

<a id="api-436865636b626f782e526f6f742e50726f70732e706172656e74"></a>

<a id="CheckboxRootProps-parent"></a>

<a id="api-436865636b626f782e526f6f742e50726f70732e756e636865636b656456616c7565"></a>

<a id="CheckboxRootProps-uncheckedValue"></a>

<a id="api-436865636b626f782e526f6f742e50726f70732e64697361626c6564"></a>

<a id="CheckboxRootProps-disabled"></a>

<a id="api-436865636b626f782e526f6f742e50726f70732e726561644f6e6c79"></a>

<a id="CheckboxRootProps-readOnly"></a>

<a id="api-436865636b626f782e526f6f742e50726f70732e7265717569726564"></a>

<a id="CheckboxRootProps-required"></a>

<a id="api-436865636b626f782e526f6f742e50726f70732e696e707574526566"></a>

<a id="CheckboxRootProps-inputRef"></a>

<a id="api-436865636b626f782e526f6f742e50726f70732e6964"></a>

<a id="CheckboxRootProps-id"></a>

<a id="api-436865636b626f782e526f6f742e50726f70732e636c617373"></a>

<a id="CheckboxRootProps-class"></a>

<a id="api-436865636b626f782e526f6f742e50726f70732e7374796c65"></a>

<a id="CheckboxRootProps-style"></a>

<a id="api-436865636b626f782e526f6f742e50726f70732e72656e646572"></a>

<a id="CheckboxRootProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| name | `string \| undefined` | No | Unavailable |  |
| defaultChecked | `boolean \| undefined` | No | Unavailable |  |
| checked | `boolean \| undefined` | No | Unavailable |  |
| onCheckedChange | `((checked: boolean, details: CheckboxRootChangeEventDetails) => void) \| undefined` | No | Unavailable |  |
| indeterminate | `boolean \| undefined` | No | Unavailable |  |
| value | `string \| undefined` | No | Unavailable |  |
| form | `string \| undefined` | No | Unavailable |  |
| nativeButton | `boolean \| undefined` | No | Unavailable |  |
| parent | `boolean \| undefined` | No | Unavailable |  |
| uncheckedValue | `string \| undefined` | No | Unavailable |  |
| disabled | `boolean \| undefined` | No | Unavailable |  |
| readOnly | `boolean \| undefined` | No | Unavailable |  |
| required | `boolean \| undefined` | No | Unavailable |  |
| inputRef | `JSX.Ref<HTMLInputElement>` | No | Unavailable |  |
| id | `string \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<CheckboxRootState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<CheckboxRootState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, CheckboxRootState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-436865636b626f782e526f6f742e5374617465"></a>

<a id="checkboxrootstate"></a>

### Related exported type: Checkbox.Root.State

Declaration: `packages/solid/build/types/checkbox/root/CheckboxRoot.d.ts:36`

#### Declaration

```typescript
CheckboxRootState
```

<a id="api-436865636b626f782e526f6f742e53746174652e636865636b6564"></a>

<a id="CheckboxRootState-checked"></a>

<a id="api-436865636b626f782e526f6f742e53746174652e696e64657465726d696e617465"></a>

<a id="CheckboxRootState-indeterminate"></a>

<a id="api-436865636b626f782e526f6f742e53746174652e6469727479"></a>

<a id="CheckboxRootState-dirty"></a>

<a id="api-436865636b626f782e526f6f742e53746174652e66696c6c6564"></a>

<a id="CheckboxRootState-filled"></a>

<a id="api-436865636b626f782e526f6f742e53746174652e666f6375736564"></a>

<a id="CheckboxRootState-focused"></a>

<a id="api-436865636b626f782e526f6f742e53746174652e746f7563686564"></a>

<a id="CheckboxRootState-touched"></a>

<a id="api-436865636b626f782e526f6f742e53746174652e64697361626c6564"></a>

<a id="CheckboxRootState-disabled"></a>

<a id="api-436865636b626f782e526f6f742e53746174652e726561644f6e6c79"></a>

<a id="CheckboxRootState-readOnly"></a>

<a id="api-436865636b626f782e526f6f742e53746174652e7265717569726564"></a>

<a id="CheckboxRootState-required"></a>

<a id="api-436865636b626f782e526f6f742e53746174652e76616c6964"></a>

<a id="CheckboxRootState-valid"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| checked | `boolean` | Yes | Unavailable |  |
| indeterminate | `boolean` | Yes | Unavailable |  |
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

<a id="api-436865636b626f782e526f6f742e4368616e67654576656e74526561736f6e"></a>

<a id="checkboxrootchangeeventreason"></a>

### Related exported type: Checkbox.Root.ChangeEventReason

Declaration: `packages/solid/build/types/checkbox/root/CheckboxRoot.d.ts:37`

#### Declaration

```typescript
"none"
```

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-436865636b626f782e526f6f742e4368616e67654576656e7444657461696c73"></a>

<a id="checkboxrootchangeeventdetails"></a>

### Related exported type: Checkbox.Root.ChangeEventDetails

Declaration: `packages/solid/build/types/checkbox/root/CheckboxRoot.d.ts:38`

#### Declaration

```typescript
{ reason: "none"; event: Event; cancel(): void; allowPropagation(): void; isCanceled: boolean; isPropagationAllowed: boolean; trigger: Element | undefined; }
```

<a id="api-436865636b626f782e526f6f742e4368616e67654576656e7444657461696c732e616c6c6f7750726f7061676174696f6e"></a>

<a id="CheckboxRootChangeEventDetails-allowPropagation"></a>

<a id="api-436865636b626f782e526f6f742e4368616e67654576656e7444657461696c732e63616e63656c"></a>

<a id="CheckboxRootChangeEventDetails-cancel"></a>

<a id="api-436865636b626f782e526f6f742e4368616e67654576656e7444657461696c732e6576656e74"></a>

<a id="CheckboxRootChangeEventDetails-event"></a>

<a id="api-436865636b626f782e526f6f742e4368616e67654576656e7444657461696c732e697343616e63656c6564"></a>

<a id="CheckboxRootChangeEventDetails-isCanceled"></a>

<a id="api-436865636b626f782e526f6f742e4368616e67654576656e7444657461696c732e697350726f7061676174696f6e416c6c6f776564"></a>

<a id="CheckboxRootChangeEventDetails-isPropagationAllowed"></a>

<a id="api-436865636b626f782e526f6f742e4368616e67654576656e7444657461696c732e726561736f6e"></a>

<a id="CheckboxRootChangeEventDetails-reason"></a>

<a id="api-436865636b626f782e526f6f742e4368616e67654576656e7444657461696c732e74726967676572"></a>

<a id="CheckboxRootChangeEventDetails-trigger"></a>

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

<a id="indicator"></a>

### Indicator

<a id="api-436865636b626f782e496e64696361746f72"></a>

<a id="checkboxindicator"></a>

### Checkbox.Indicator

Declaration: `packages/solid/build/types/checkbox/indicator/CheckboxIndicator.d.ts:11`

#### Declaration

```typescript
(props: CheckboxIndicatorProps) => JSX.Element
```

<a id="api-436865636b626f782e496e64696361746f722e2470726f70732e636c617373"></a>

<a id="CheckboxIndicator-class"></a>

<a id="api-436865636b626f782e496e64696361746f722e2470726f70732e7374796c65"></a>

<a id="CheckboxIndicator-style"></a>

<a id="api-436865636b626f782e496e64696361746f722e2470726f70732e6b6565704d6f756e746564"></a>

<a id="CheckboxIndicator-keepMounted"></a>

<a id="api-436865636b626f782e496e64696361746f722e2470726f70732e72656e646572"></a>

<a id="CheckboxIndicator-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<CheckboxIndicatorState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<CheckboxIndicatorState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| keepMounted | `boolean \| undefined` | No | Unavailable |  |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, CheckboxIndicatorState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-436865636b626f78496e64696361746f7244617461417474726962757465732e636865636b6564"></a>

<a id="api-436865636b626f78496e64696361746f7244617461417474726962757465732e756e636865636b6564"></a>

<a id="api-436865636b626f78496e64696361746f7244617461417474726962757465732e64697361626c6564"></a>

<a id="api-436865636b626f78496e64696361746f7244617461417474726962757465732e726561646f6e6c79"></a>

<a id="api-436865636b626f78496e64696361746f7244617461417474726962757465732e7265717569726564"></a>

<a id="api-436865636b626f78496e64696361746f7244617461417474726962757465732e76616c6964"></a>

<a id="api-436865636b626f78496e64696361746f7244617461417474726962757465732e696e76616c6964"></a>

<a id="api-436865636b626f78496e64696361746f7244617461417474726962757465732e6469727479"></a>

<a id="api-436865636b626f78496e64696361746f7244617461417474726962757465732e746f7563686564"></a>

<a id="api-436865636b626f78496e64696361746f7244617461417474726962757465732e66696c6c6564"></a>

<a id="api-436865636b626f78496e64696361746f7244617461417474726962757465732e666f6375736564"></a>

<a id="api-436865636b626f78496e64696361746f7244617461417474726962757465732e696e64657465726d696e617465"></a>

<a id="api-436865636b626f78496e64696361746f7244617461417474726962757465732e7374617274696e675374796c65"></a>

<a id="api-436865636b626f78496e64696361746f7244617461417474726962757465732e656e64696e675374796c65"></a>

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
| data-indeterminate |  |
| data-starting-style | Present when transitionStatus is 'starting'. |
| data-ending-style | Present when transitionStatus is 'ending'. |

#### CSS variables

Metadata status: unavailable.

<a id="api-436865636b626f782e496e64696361746f722e50726f7073"></a>

<a id="checkboxindicatorprops"></a>

### Related exported type: Checkbox.Indicator.Props

Declaration: `packages/solid/build/types/checkbox/indicator/CheckboxIndicator.d.ts:13`

#### Declaration

```typescript
CheckboxIndicatorProps
```

<a id="api-436865636b626f782e496e64696361746f722e50726f70732e636c617373"></a>

<a id="CheckboxIndicatorProps-class"></a>

<a id="api-436865636b626f782e496e64696361746f722e50726f70732e7374796c65"></a>

<a id="CheckboxIndicatorProps-style"></a>

<a id="api-436865636b626f782e496e64696361746f722e50726f70732e6b6565704d6f756e746564"></a>

<a id="CheckboxIndicatorProps-keepMounted"></a>

<a id="api-436865636b626f782e496e64696361746f722e50726f70732e72656e646572"></a>

<a id="CheckboxIndicatorProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<CheckboxIndicatorState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<CheckboxIndicatorState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| keepMounted | `boolean \| undefined` | No | Unavailable |  |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, CheckboxIndicatorState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-436865636b626f782e496e64696361746f722e5374617465"></a>

<a id="checkboxindicatorstate"></a>

### Related exported type: Checkbox.Indicator.State

Declaration: `packages/solid/build/types/checkbox/indicator/CheckboxIndicator.d.ts:14`

#### Declaration

```typescript
CheckboxIndicatorState
```

<a id="api-436865636b626f782e496e64696361746f722e53746174652e636865636b6564"></a>

<a id="CheckboxIndicatorState-checked"></a>

<a id="api-436865636b626f782e496e64696361746f722e53746174652e696e64657465726d696e617465"></a>

<a id="CheckboxIndicatorState-indeterminate"></a>

<a id="api-436865636b626f782e496e64696361746f722e53746174652e6469727479"></a>

<a id="CheckboxIndicatorState-dirty"></a>

<a id="api-436865636b626f782e496e64696361746f722e53746174652e66696c6c6564"></a>

<a id="CheckboxIndicatorState-filled"></a>

<a id="api-436865636b626f782e496e64696361746f722e53746174652e666f6375736564"></a>

<a id="CheckboxIndicatorState-focused"></a>

<a id="api-436865636b626f782e496e64696361746f722e53746174652e746f7563686564"></a>

<a id="CheckboxIndicatorState-touched"></a>

<a id="api-436865636b626f782e496e64696361746f722e53746174652e7472616e736974696f6e537461747573"></a>

<a id="CheckboxIndicatorState-transitionStatus"></a>

<a id="api-436865636b626f782e496e64696361746f722e53746174652e64697361626c6564"></a>

<a id="CheckboxIndicatorState-disabled"></a>

<a id="api-436865636b626f782e496e64696361746f722e53746174652e726561644f6e6c79"></a>

<a id="CheckboxIndicatorState-readOnly"></a>

<a id="api-436865636b626f782e496e64696361746f722e53746174652e7265717569726564"></a>

<a id="CheckboxIndicatorState-required"></a>

<a id="api-436865636b626f782e496e64696361746f722e53746174652e76616c6964"></a>

<a id="CheckboxIndicatorState-valid"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| checked | `boolean` | Yes | Unavailable |  |
| indeterminate | `boolean` | Yes | Unavailable |  |
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

