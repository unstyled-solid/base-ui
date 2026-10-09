<a id="toggle-group"></a>

# Toggle Group

Provides a shared state to a series of toggle buttons.

[Open mounted Solid demo: toggle-group/hero](/solid/components/toggle-group)

<a id="anatomy"></a>

## Anatomy

Import the component and use it as a single part:

```tsx
import { ToggleGroup } from '@unstyled-solid/base-ui/toggle-group';
<ToggleGroup />;
```

<a id="examples"></a>

## Examples

<a id="multiple"></a>

### Multiple

Add the `multiple` prop to allow pressing more than one toggle at a time.

[Open mounted Solid demo: toggle-group/multiple](/solid/components/toggle-group)

<a id="api-reference"></a>

## API reference

<a id="api-546f67676c6547726f7570"></a>

<a id="togglegroup"></a>

<a id="api-546f67676c6547726f75702e2470726f70732e70726f703a616c69676e"></a>

### ToggleGroup

Provides shared selection and keyboard navigation to toggle buttons.

Declaration: `packages/solid/build/types/toggle-group/ToggleGroup.d.ts:5`

#### Declaration

```typescript
<Value extends string>(componentProps: ToggleGroupProps<Value>) => JSX.Element
```

<a id="api-546f67676c6547726f75702e2470726f70732e64656661756c7456616c7565"></a>

<a id="ToggleGroup-defaultValue"></a>

<a id="api-546f67676c6547726f75702e2470726f70732e76616c7565"></a>

<a id="ToggleGroup-value"></a>

<a id="api-546f67676c6547726f75702e2470726f70732e6f6e56616c75654368616e6765"></a>

<a id="ToggleGroup-onValueChange"></a>

<a id="api-546f67676c6547726f75702e2470726f70732e6c6f6f70466f637573"></a>

<a id="ToggleGroup-loopFocus"></a>

<a id="api-546f67676c6547726f75702e2470726f70732e6d756c7469706c65"></a>

<a id="ToggleGroup-multiple"></a>

<a id="api-546f67676c6547726f75702e2470726f70732e64697361626c6564"></a>

<a id="ToggleGroup-disabled"></a>

<a id="api-546f67676c6547726f75702e2470726f70732e6f7269656e746174696f6e"></a>

<a id="ToggleGroup-orientation"></a>

<a id="api-546f67676c6547726f75702e2470726f70732e636c617373"></a>

<a id="ToggleGroup-class"></a>

<a id="api-546f67676c6547726f75702e2470726f70732e7374796c65"></a>

<a id="ToggleGroup-style"></a>

<a id="api-546f67676c6547726f75702e2470726f70732e72656e646572"></a>

<a id="ToggleGroup-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| defaultValue | `readonly Value[] \| undefined` | No | Unavailable |  |
| value | `readonly Value[] \| undefined` | No | Unavailable |  |
| onValueChange | `((value: Value[], details: ToggleGroupChangeEventDetails) => void) \| undefined` | No | Unavailable |  |
| loopFocus | `boolean \| undefined` | No | Unavailable |  |
| multiple | `boolean \| undefined` | No | Unavailable |  |
| disabled | `boolean \| undefined` | No | Unavailable |  |
| orientation | `Orientation \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<ToggleGroupState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ToggleGroupState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ToggleGroupState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-546f67676c6547726f757044617461417474726962757465732e6f7269656e746174696f6e"></a>

<a id="api-546f67676c6547726f757044617461417474726962757465732e64697361626c6564"></a>

<a id="api-546f67676c6547726f757044617461417474726962757465732e6d756c7469706c65"></a>

| Name | Description |
| --- | --- |
| data-orientation | The horizontal or vertical orientation of the toggle group. |
| data-disabled | Present when the toggle group is disabled. |
| data-multiple | Present when multiple buttons may be pressed. |

#### CSS variables

Metadata status: unavailable.

<a id="api-546f67676c6547726f75702e50726f7073"></a>

<a id="togglegroupprops"></a>

<a id="api-546f67676c6547726f75702e50726f70732e70726f703a616c69676e"></a>

### Related exported type: ToggleGroup.Props

Declaration: `packages/solid/build/types/toggle-group/ToggleGroup.d.ts:24`

#### Declaration

```typescript
Props<Value>
```

<a id="api-546f67676c6547726f75702e50726f70732e64656661756c7456616c7565"></a>

<a id="ToggleGroupProps-defaultValue"></a>

<a id="api-546f67676c6547726f75702e50726f70732e76616c7565"></a>

<a id="ToggleGroupProps-value"></a>

<a id="api-546f67676c6547726f75702e50726f70732e6f6e56616c75654368616e6765"></a>

<a id="ToggleGroupProps-onValueChange"></a>

<a id="api-546f67676c6547726f75702e50726f70732e6c6f6f70466f637573"></a>

<a id="ToggleGroupProps-loopFocus"></a>

<a id="api-546f67676c6547726f75702e50726f70732e6d756c7469706c65"></a>

<a id="ToggleGroupProps-multiple"></a>

<a id="api-546f67676c6547726f75702e50726f70732e64697361626c6564"></a>

<a id="ToggleGroupProps-disabled"></a>

<a id="api-546f67676c6547726f75702e50726f70732e6f7269656e746174696f6e"></a>

<a id="ToggleGroupProps-orientation"></a>

<a id="api-546f67676c6547726f75702e50726f70732e636c617373"></a>

<a id="ToggleGroupProps-class"></a>

<a id="api-546f67676c6547726f75702e50726f70732e7374796c65"></a>

<a id="ToggleGroupProps-style"></a>

<a id="api-546f67676c6547726f75702e50726f70732e72656e646572"></a>

<a id="ToggleGroupProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| defaultValue | `readonly Value[] \| undefined` | No | Unavailable |  |
| value | `readonly Value[] \| undefined` | No | Unavailable |  |
| onValueChange | `((value: Value[], details: ToggleGroupChangeEventDetails) => void) \| undefined` | No | Unavailable |  |
| loopFocus | `boolean \| undefined` | No | Unavailable |  |
| multiple | `boolean \| undefined` | No | Unavailable |  |
| disabled | `boolean \| undefined` | No | Unavailable |  |
| orientation | `Orientation \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<ToggleGroupState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ToggleGroupState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ToggleGroupState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-546f67676c6547726f75702e5374617465"></a>

<a id="togglegroupstate"></a>

### Related exported type: ToggleGroup.State

Declaration: `packages/solid/build/types/toggle-group/ToggleGroup.d.ts:23`

#### Declaration

```typescript
ToggleGroupState
```

<a id="api-546f67676c6547726f75702e53746174652e6d756c7469706c65"></a>

<a id="ToggleGroupState-multiple"></a>

<a id="api-546f67676c6547726f75702e53746174652e64697361626c6564"></a>

<a id="ToggleGroupState-disabled"></a>

<a id="api-546f67676c6547726f75702e53746174652e6f7269656e746174696f6e"></a>

<a id="ToggleGroupState-orientation"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| multiple | `boolean` | Yes | Unavailable |  |
| disabled | `boolean` | Yes | Unavailable |  |
| orientation | `Orientation` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-546f67676c6547726f75702e4368616e67654576656e74526561736f6e"></a>

<a id="togglegroupchangeeventreason"></a>

### Related exported type: ToggleGroup.ChangeEventReason

Declaration: `packages/solid/build/types/toggle-group/ToggleGroup.d.ts:25`

#### Declaration

```typescript
"none"
```

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-546f67676c6547726f75702e4368616e67654576656e7444657461696c73"></a>

<a id="togglegroupchangeeventdetails"></a>

### Related exported type: ToggleGroup.ChangeEventDetails

Declaration: `packages/solid/build/types/toggle-group/ToggleGroup.d.ts:26`

#### Declaration

```typescript
{ reason: "none"; event: Event; cancel(): void; allowPropagation(): void; isCanceled: boolean; isPropagationAllowed: boolean; trigger: Element | undefined; }
```

<a id="api-546f67676c6547726f75702e4368616e67654576656e7444657461696c732e616c6c6f7750726f7061676174696f6e"></a>

<a id="ToggleGroupChangeEventDetails-allowPropagation"></a>

<a id="api-546f67676c6547726f75702e4368616e67654576656e7444657461696c732e63616e63656c"></a>

<a id="ToggleGroupChangeEventDetails-cancel"></a>

<a id="api-546f67676c6547726f75702e4368616e67654576656e7444657461696c732e6576656e74"></a>

<a id="ToggleGroupChangeEventDetails-event"></a>

<a id="api-546f67676c6547726f75702e4368616e67654576656e7444657461696c732e697343616e63656c6564"></a>

<a id="ToggleGroupChangeEventDetails-isCanceled"></a>

<a id="api-546f67676c6547726f75702e4368616e67654576656e7444657461696c732e697350726f7061676174696f6e416c6c6f776564"></a>

<a id="ToggleGroupChangeEventDetails-isPropagationAllowed"></a>

<a id="api-546f67676c6547726f75702e4368616e67654576656e7444657461696c732e726561736f6e"></a>

<a id="ToggleGroupChangeEventDetails-reason"></a>

<a id="api-546f67676c6547726f75702e4368616e67654576656e7444657461696c732e74726967676572"></a>

<a id="ToggleGroupChangeEventDetails-trigger"></a>

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

<a id="api-546f67676c6547726f757050726f7073"></a>

<a id="api-546f67676c6547726f757050726f70732e70726f703a616c69676e"></a>

### Related exported type: ToggleGroupProps

Declaration: `packages/solid/build/types/toggle-group/ToggleGroup.d.ts:11`

#### Declaration

```typescript
ToggleGroupProps<Value>
```

<a id="api-546f67676c6547726f757050726f70732e64656661756c7456616c7565"></a>

<a id="api-546f67676c6547726f757050726f70732e76616c7565"></a>

<a id="api-546f67676c6547726f757050726f70732e6f6e56616c75654368616e6765"></a>

<a id="api-546f67676c6547726f757050726f70732e6c6f6f70466f637573"></a>

<a id="api-546f67676c6547726f757050726f70732e6d756c7469706c65"></a>

<a id="api-546f67676c6547726f757050726f70732e64697361626c6564"></a>

<a id="api-546f67676c6547726f757050726f70732e6f7269656e746174696f6e"></a>

<a id="api-546f67676c6547726f757050726f70732e636c617373"></a>

<a id="api-546f67676c6547726f757050726f70732e7374796c65"></a>

<a id="api-546f67676c6547726f757050726f70732e72656e646572"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| defaultValue | `readonly Value[] \| undefined` | No | Unavailable |  |
| value | `readonly Value[] \| undefined` | No | Unavailable |  |
| onValueChange | `((value: Value[], details: ToggleGroupChangeEventDetails) => void) \| undefined` | No | Unavailable |  |
| loopFocus | `boolean \| undefined` | No | Unavailable |  |
| multiple | `boolean \| undefined` | No | Unavailable |  |
| disabled | `boolean \| undefined` | No | Unavailable |  |
| orientation | `Orientation \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<ToggleGroupState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ToggleGroupState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ToggleGroupState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-546f67676c6547726f75705374617465"></a>

### Related exported type: ToggleGroupState

Declaration: `packages/solid/build/types/toggle-group/ToggleGroup.d.ts:6`

#### Declaration

```typescript
ToggleGroupState
```

<a id="api-546f67676c6547726f757053746174652e6d756c7469706c65"></a>

<a id="api-546f67676c6547726f757053746174652e64697361626c6564"></a>

<a id="api-546f67676c6547726f757053746174652e6f7269656e746174696f6e"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| multiple | `boolean` | Yes | Unavailable |  |
| disabled | `boolean` | Yes | Unavailable |  |
| orientation | `Orientation` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

