<a id="switch"></a>

# Switch

A control that indicates whether a setting is on or off.

[Open mounted Solid demo: switch/hero](/solid/components/switch)

<a id="usage-guidelines"></a>

## Usage guidelines

- **Form controls must have an accessible name**: It can be created using a `<label>` element or the `Field` component. See [Labeling a switch](#labeling-a-switch) and the [forms guide](/solid/handbook/forms).

<a id="anatomy"></a>

## Anatomy

Import the component and assemble its parts:

```tsx
import { Switch } from '@unstyled-solid/base-ui/switch';
<Switch.Root>
  <Switch.Thumb />
</Switch.Root>;
```

<a id="examples"></a>

## Examples

<a id="labeling-a-switch"></a>

### Labeling a switch

An enclosing `<label>` is the simplest labeling pattern:

```tsx
<label>
  <Switch.Root />
  Notifications
</label>;
```

<a id="rendering-as-a-native-button"></a>

### Rendering as a native button

By default, `<Switch.Root>` renders a `<span>` element to support enclosing labels. Prefer rendering the switch as a native button when using sibling labels (`htmlFor`/`id`).

```tsx
<div>
  <label for="notifications-switch">Notifications</label>

  <Switch.Root
    id="notifications-switch"
    nativeButton
    render={(renderProps) => <button {...renderProps} />}
  >
    <Switch.Thumb />
  </Switch.Root>
</div>;
```

Native buttons with wrapping labels are supported by using the `render` callback to avoid invalid HTML, so the hidden input is placed outside the label:

```tsx
<Switch.Root
  nativeButton
  render={(buttonProps) => (
    <label>
      <button {...buttonProps} />
      Notifications
    </label>
  )}
/>;
```

<a id="form-integration"></a>

### Form integration

Use [Field](/solid/components/field) to handle label associations and form integration:

```tsx
<Form>
  <Field.Root name="notifications">
    <Field.Label>
      <Switch.Root />
      Notifications
    </Field.Label>
  </Field.Root>
</Form>;
```

<a id="api-reference"></a>

## API reference

<a id="root"></a>

### Root

<a id="api-5377697463682e526f6f74"></a>

<a id="switchroot"></a>

### Switch.Root

A visible switch and an adjacent native checkbox, following Base UI's managed reset semantics.

Declaration: `packages/solid/build/types/switch/root/SwitchRoot.d.ts:6`

#### Declaration

```typescript
(props: SwitchRootProps) => JSX.Element
```

<a id="api-5377697463682e526f6f742e2470726f70732e6e616d65"></a>

<a id="SwitchRoot-name"></a>

<a id="api-5377697463682e526f6f742e2470726f70732e64656661756c74436865636b6564"></a>

<a id="SwitchRoot-defaultChecked"></a>

<a id="api-5377697463682e526f6f742e2470726f70732e636865636b6564"></a>

<a id="SwitchRoot-checked"></a>

<a id="api-5377697463682e526f6f742e2470726f70732e6f6e436865636b65644368616e6765"></a>

<a id="SwitchRoot-onCheckedChange"></a>

<a id="api-5377697463682e526f6f742e2470726f70732e76616c7565"></a>

<a id="SwitchRoot-value"></a>

<a id="api-5377697463682e526f6f742e2470726f70732e666f726d"></a>

<a id="SwitchRoot-form"></a>

<a id="api-5377697463682e526f6f742e2470726f70732e6e6174697665427574746f6e"></a>

<a id="SwitchRoot-nativeButton"></a>

<a id="api-5377697463682e526f6f742e2470726f70732e756e636865636b656456616c7565"></a>

<a id="SwitchRoot-uncheckedValue"></a>

<a id="api-5377697463682e526f6f742e2470726f70732e64697361626c6564"></a>

<a id="SwitchRoot-disabled"></a>

<a id="api-5377697463682e526f6f742e2470726f70732e726561644f6e6c79"></a>

<a id="SwitchRoot-readOnly"></a>

<a id="api-5377697463682e526f6f742e2470726f70732e7265717569726564"></a>

<a id="SwitchRoot-required"></a>

<a id="api-5377697463682e526f6f742e2470726f70732e696e707574526566"></a>

<a id="SwitchRoot-inputRef"></a>

<a id="api-5377697463682e526f6f742e2470726f70732e6964"></a>

<a id="SwitchRoot-id"></a>

<a id="api-5377697463682e526f6f742e2470726f70732e636c617373"></a>

<a id="SwitchRoot-class"></a>

<a id="api-5377697463682e526f6f742e2470726f70732e7374796c65"></a>

<a id="SwitchRoot-style"></a>

<a id="api-5377697463682e526f6f742e2470726f70732e72656e646572"></a>

<a id="SwitchRoot-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| name | `string \| undefined` | No | Unavailable |  |
| defaultChecked | `boolean \| undefined` | No | Unavailable |  |
| checked | `boolean \| undefined` | No | Unavailable |  |
| onCheckedChange | `((checked: boolean, details: SwitchRootChangeEventDetails) => void) \| undefined` | No | Unavailable |  |
| value | `string \| undefined` | No | Unavailable |  |
| form | `string \| undefined` | No | Unavailable |  |
| nativeButton | `boolean \| undefined` | No | false |  |
| uncheckedValue | `string \| undefined` | No | Unavailable |  |
| disabled | `boolean \| undefined` | No | Unavailable |  |
| readOnly | `boolean \| undefined` | No | false |  |
| required | `boolean \| undefined` | No | false |  |
| inputRef | `JSX.Ref<HTMLInputElement>` | No | Unavailable |  |
| id | `string \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<SwitchRootState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<SwitchRootState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, SwitchRootState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-537769746368526f6f7444617461417474726962757465732e636865636b6564"></a>

<a id="api-537769746368526f6f7444617461417474726962757465732e756e636865636b6564"></a>

<a id="api-537769746368526f6f7444617461417474726962757465732e64697361626c6564"></a>

<a id="api-537769746368526f6f7444617461417474726962757465732e726561646f6e6c79"></a>

<a id="api-537769746368526f6f7444617461417474726962757465732e7265717569726564"></a>

<a id="api-537769746368526f6f7444617461417474726962757465732e76616c6964"></a>

<a id="api-537769746368526f6f7444617461417474726962757465732e696e76616c6964"></a>

<a id="api-537769746368526f6f7444617461417474726962757465732e6469727479"></a>

<a id="api-537769746368526f6f7444617461417474726962757465732e746f7563686564"></a>

<a id="api-537769746368526f6f7444617461417474726962757465732e66696c6c6564"></a>

<a id="api-537769746368526f6f7444617461417474726962757465732e666f6375736564"></a>

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

<a id="api-5377697463682e526f6f742e50726f7073"></a>

<a id="switchrootprops"></a>

### Related exported type: Switch.Root.Props

Declaration: `packages/solid/build/types/switch/root/SwitchRoot.d.ts:31`

#### Declaration

```typescript
SwitchRootProps
```

<a id="api-5377697463682e526f6f742e50726f70732e6e616d65"></a>

<a id="SwitchRootProps-name"></a>

<a id="api-5377697463682e526f6f742e50726f70732e64656661756c74436865636b6564"></a>

<a id="SwitchRootProps-defaultChecked"></a>

<a id="api-5377697463682e526f6f742e50726f70732e636865636b6564"></a>

<a id="SwitchRootProps-checked"></a>

<a id="api-5377697463682e526f6f742e50726f70732e6f6e436865636b65644368616e6765"></a>

<a id="SwitchRootProps-onCheckedChange"></a>

<a id="api-5377697463682e526f6f742e50726f70732e76616c7565"></a>

<a id="SwitchRootProps-value"></a>

<a id="api-5377697463682e526f6f742e50726f70732e666f726d"></a>

<a id="SwitchRootProps-form"></a>

<a id="api-5377697463682e526f6f742e50726f70732e6e6174697665427574746f6e"></a>

<a id="SwitchRootProps-nativeButton"></a>

<a id="api-5377697463682e526f6f742e50726f70732e756e636865636b656456616c7565"></a>

<a id="SwitchRootProps-uncheckedValue"></a>

<a id="api-5377697463682e526f6f742e50726f70732e64697361626c6564"></a>

<a id="SwitchRootProps-disabled"></a>

<a id="api-5377697463682e526f6f742e50726f70732e726561644f6e6c79"></a>

<a id="SwitchRootProps-readOnly"></a>

<a id="api-5377697463682e526f6f742e50726f70732e7265717569726564"></a>

<a id="SwitchRootProps-required"></a>

<a id="api-5377697463682e526f6f742e50726f70732e696e707574526566"></a>

<a id="SwitchRootProps-inputRef"></a>

<a id="api-5377697463682e526f6f742e50726f70732e6964"></a>

<a id="SwitchRootProps-id"></a>

<a id="api-5377697463682e526f6f742e50726f70732e636c617373"></a>

<a id="SwitchRootProps-class"></a>

<a id="api-5377697463682e526f6f742e50726f70732e7374796c65"></a>

<a id="SwitchRootProps-style"></a>

<a id="api-5377697463682e526f6f742e50726f70732e72656e646572"></a>

<a id="SwitchRootProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| name | `string \| undefined` | No | Unavailable |  |
| defaultChecked | `boolean \| undefined` | No | Unavailable |  |
| checked | `boolean \| undefined` | No | Unavailable |  |
| onCheckedChange | `((checked: boolean, details: SwitchRootChangeEventDetails) => void) \| undefined` | No | Unavailable |  |
| value | `string \| undefined` | No | Unavailable |  |
| form | `string \| undefined` | No | Unavailable |  |
| nativeButton | `boolean \| undefined` | No | Unavailable |  |
| uncheckedValue | `string \| undefined` | No | Unavailable |  |
| disabled | `boolean \| undefined` | No | Unavailable |  |
| readOnly | `boolean \| undefined` | No | Unavailable |  |
| required | `boolean \| undefined` | No | Unavailable |  |
| inputRef | `JSX.Ref<HTMLInputElement>` | No | Unavailable |  |
| id | `string \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<SwitchRootState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<SwitchRootState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, SwitchRootState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-5377697463682e526f6f742e5374617465"></a>

<a id="switchrootstate"></a>

### Related exported type: Switch.Root.State

Declaration: `packages/solid/build/types/switch/root/SwitchRoot.d.ts:30`

#### Declaration

```typescript
SwitchRootState
```

<a id="api-5377697463682e526f6f742e53746174652e636865636b6564"></a>

<a id="SwitchRootState-checked"></a>

<a id="api-5377697463682e526f6f742e53746174652e6469727479"></a>

<a id="SwitchRootState-dirty"></a>

<a id="api-5377697463682e526f6f742e53746174652e66696c6c6564"></a>

<a id="SwitchRootState-filled"></a>

<a id="api-5377697463682e526f6f742e53746174652e666f6375736564"></a>

<a id="SwitchRootState-focused"></a>

<a id="api-5377697463682e526f6f742e53746174652e746f7563686564"></a>

<a id="SwitchRootState-touched"></a>

<a id="api-5377697463682e526f6f742e53746174652e64697361626c6564"></a>

<a id="SwitchRootState-disabled"></a>

<a id="api-5377697463682e526f6f742e53746174652e726561644f6e6c79"></a>

<a id="SwitchRootState-readOnly"></a>

<a id="api-5377697463682e526f6f742e53746174652e7265717569726564"></a>

<a id="SwitchRootState-required"></a>

<a id="api-5377697463682e526f6f742e53746174652e76616c6964"></a>

<a id="SwitchRootState-valid"></a>

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

<a id="api-5377697463682e526f6f742e4368616e67654576656e74526561736f6e"></a>

<a id="switchrootchangeeventreason"></a>

### Related exported type: Switch.Root.ChangeEventReason

Declaration: `packages/solid/build/types/switch/root/SwitchRoot.d.ts:32`

#### Declaration

```typescript
"none"
```

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-5377697463682e526f6f742e4368616e67654576656e7444657461696c73"></a>

<a id="switchrootchangeeventdetails"></a>

### Related exported type: Switch.Root.ChangeEventDetails

Declaration: `packages/solid/build/types/switch/root/SwitchRoot.d.ts:33`

#### Declaration

```typescript
{ reason: "none"; event: Event; cancel(): void; allowPropagation(): void; isCanceled: boolean; isPropagationAllowed: boolean; trigger: Element | undefined; }
```

<a id="api-5377697463682e526f6f742e4368616e67654576656e7444657461696c732e616c6c6f7750726f7061676174696f6e"></a>

<a id="SwitchRootChangeEventDetails-allowPropagation"></a>

<a id="api-5377697463682e526f6f742e4368616e67654576656e7444657461696c732e63616e63656c"></a>

<a id="SwitchRootChangeEventDetails-cancel"></a>

<a id="api-5377697463682e526f6f742e4368616e67654576656e7444657461696c732e6576656e74"></a>

<a id="SwitchRootChangeEventDetails-event"></a>

<a id="api-5377697463682e526f6f742e4368616e67654576656e7444657461696c732e697343616e63656c6564"></a>

<a id="SwitchRootChangeEventDetails-isCanceled"></a>

<a id="api-5377697463682e526f6f742e4368616e67654576656e7444657461696c732e697350726f7061676174696f6e416c6c6f776564"></a>

<a id="SwitchRootChangeEventDetails-isPropagationAllowed"></a>

<a id="api-5377697463682e526f6f742e4368616e67654576656e7444657461696c732e726561736f6e"></a>

<a id="SwitchRootChangeEventDetails-reason"></a>

<a id="api-5377697463682e526f6f742e4368616e67654576656e7444657461696c732e74726967676572"></a>

<a id="SwitchRootChangeEventDetails-trigger"></a>

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

<a id="thumb"></a>

### Thumb

<a id="api-5377697463682e5468756d62"></a>

<a id="switchthumb"></a>

### Switch.Thumb

Declaration: `packages/solid/build/types/switch/thumb/SwitchThumb.d.ts:3`

#### Declaration

```typescript
(props: SwitchThumbProps) => JSX.Element
```

<a id="api-5377697463682e5468756d622e2470726f70732e636c617373"></a>

<a id="SwitchThumb-class"></a>

<a id="api-5377697463682e5468756d622e2470726f70732e7374796c65"></a>

<a id="SwitchThumb-style"></a>

<a id="api-5377697463682e5468756d622e2470726f70732e72656e646572"></a>

<a id="SwitchThumb-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<SwitchThumbState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<SwitchThumbState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, SwitchThumbState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-5377697463685468756d6244617461417474726962757465732e636865636b6564"></a>

<a id="api-5377697463685468756d6244617461417474726962757465732e756e636865636b6564"></a>

<a id="api-5377697463685468756d6244617461417474726962757465732e64697361626c6564"></a>

<a id="api-5377697463685468756d6244617461417474726962757465732e726561646f6e6c79"></a>

<a id="api-5377697463685468756d6244617461417474726962757465732e7265717569726564"></a>

<a id="api-5377697463685468756d6244617461417474726962757465732e76616c6964"></a>

<a id="api-5377697463685468756d6244617461417474726962757465732e696e76616c6964"></a>

<a id="api-5377697463685468756d6244617461417474726962757465732e6469727479"></a>

<a id="api-5377697463685468756d6244617461417474726962757465732e746f7563686564"></a>

<a id="api-5377697463685468756d6244617461417474726962757465732e66696c6c6564"></a>

<a id="api-5377697463685468756d6244617461417474726962757465732e666f6375736564"></a>

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

<a id="api-5377697463682e5468756d622e50726f7073"></a>

<a id="switchthumbprops"></a>

### Related exported type: Switch.Thumb.Props

Declaration: `packages/solid/build/types/switch/thumb/SwitchThumb.d.ts:9`

#### Declaration

```typescript
SwitchThumbProps
```

<a id="api-5377697463682e5468756d622e50726f70732e636c617373"></a>

<a id="SwitchThumbProps-class"></a>

<a id="api-5377697463682e5468756d622e50726f70732e7374796c65"></a>

<a id="SwitchThumbProps-style"></a>

<a id="api-5377697463682e5468756d622e50726f70732e72656e646572"></a>

<a id="SwitchThumbProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<SwitchThumbState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<SwitchThumbState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, SwitchThumbState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-5377697463682e5468756d622e5374617465"></a>

<a id="switchthumbstate"></a>

### Related exported type: Switch.Thumb.State

Declaration: `packages/solid/build/types/switch/thumb/SwitchThumb.d.ts:10`

#### Declaration

```typescript
SwitchThumbState
```

<a id="api-5377697463682e5468756d622e53746174652e636865636b6564"></a>

<a id="SwitchThumbState-checked"></a>

<a id="api-5377697463682e5468756d622e53746174652e6469727479"></a>

<a id="SwitchThumbState-dirty"></a>

<a id="api-5377697463682e5468756d622e53746174652e66696c6c6564"></a>

<a id="SwitchThumbState-filled"></a>

<a id="api-5377697463682e5468756d622e53746174652e666f6375736564"></a>

<a id="SwitchThumbState-focused"></a>

<a id="api-5377697463682e5468756d622e53746174652e746f7563686564"></a>

<a id="SwitchThumbState-touched"></a>

<a id="api-5377697463682e5468756d622e53746174652e64697361626c6564"></a>

<a id="SwitchThumbState-disabled"></a>

<a id="api-5377697463682e5468756d622e53746174652e726561644f6e6c79"></a>

<a id="SwitchThumbState-readOnly"></a>

<a id="api-5377697463682e5468756d622e53746174652e7265717569726564"></a>

<a id="SwitchThumbState-required"></a>

<a id="api-5377697463682e5468756d622e53746174652e76616c6964"></a>

<a id="SwitchThumbState-valid"></a>

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

