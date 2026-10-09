<a id="toggle"></a>

# Toggle

A two-state button that can be on or off.

[Open mounted Solid demo: toggle/hero](/solid/components/toggle)

<a id="anatomy"></a>

## Anatomy

Import the component and use it as a single part:

```tsx
import { Toggle } from '@unstyled-solid/base-ui/toggle';
<Toggle />;
```

<a id="api-reference"></a>

## API reference

<a id="api-546f67676c65"></a>

<a id="api-546f67676c652e2470726f70732e70726f703a64697361626c6564"></a>

<a id="api-546f67676c652e2470726f70732e70726f703a666f726d416374696f6e"></a>

<a id="api-546f67676c652e2470726f70732e70726f703a666f726d456e6374797065"></a>

<a id="api-546f67676c652e2470726f70732e70726f703a666f726d4d6574686f64"></a>

<a id="api-546f67676c652e2470726f70732e70726f703a666f726d4e6f56616c6964617465"></a>

<a id="api-546f67676c652e2470726f70732e70726f703a666f726d546172676574"></a>

<a id="api-546f67676c652e2470726f70732e70726f703a6e616d65"></a>

<a id="api-546f67676c652e2470726f70732e70726f703a706f706f766572546172676574416374696f6e"></a>

<a id="api-546f67676c652e2470726f70732e70726f703a706f706f766572546172676574456c656d656e74"></a>

<a id="api-546f67676c652e2470726f70732e70726f703a74797065"></a>

<a id="api-546f67676c652e2470726f70732e70726f703a76616c7565"></a>

### Toggle

A two-state button that can be on or off. Renders a `<button>` element.

Declaration: `packages/solid/build/types/toggle/Toggle.d.ts:6`

#### Declaration

```typescript
<Value extends string = string>(componentProps: ToggleProps<Value>) => JSX.Element
```

<a id="api-546f67676c652e2470726f70732e76616c7565"></a>

<a id="Toggle-value"></a>

<a id="api-546f67676c652e2470726f70732e64656661756c7450726573736564"></a>

<a id="Toggle-defaultPressed"></a>

<a id="api-546f67676c652e2470726f70732e70726573736564"></a>

<a id="Toggle-pressed"></a>

<a id="api-546f67676c652e2470726f70732e6f6e507265737365644368616e6765"></a>

<a id="Toggle-onPressedChange"></a>

<a id="api-546f67676c652e2470726f70732e6e6174697665427574746f6e"></a>

<a id="Toggle-nativeButton"></a>

<a id="api-546f67676c652e2470726f70732e64697361626c6564"></a>

<a id="Toggle-disabled"></a>

<a id="api-546f67676c652e2470726f70732e636c617373"></a>

<a id="Toggle-class"></a>

<a id="api-546f67676c652e2470726f70732e7374796c65"></a>

<a id="Toggle-style"></a>

<a id="api-546f67676c652e2470726f70732e72656e646572"></a>

<a id="Toggle-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| value | `Value \| undefined` | No | Unavailable | Unique group value; omitted and empty values receive a generated ID. |
| defaultPressed | `boolean \| undefined` | No | false | Initial uncontrolled pressed state. |
| pressed | `boolean \| undefined` | No | Unavailable | Controlled pressed state. |
| onPressedChange | `((pressed: boolean, eventDetails: ToggleChangeEventDetails) => void) \| undefined` | No | Unavailable | Called before a grouped toggle requests a group value change. |
| nativeButton | `boolean \| undefined` | No | true | Whether the render callback returns a native button. |
| disabled | `boolean \| undefined` | No | false | Whether the component should ignore interaction. |
| class | `JSX.ClassValue \| ((state: Readonly<ToggleState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ToggleState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<JSX.HTMLAttributes<HTMLElement>, ToggleState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `command`, `commandfor`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `form`, `formaction`, `formenctype`, `formmethod`, `formnovalidate`, `formtarget`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `name`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `popovertarget`, `popovertargetaction`, `prefix`, `prop:disabled`, `prop:formAction`, `prop:formEnctype`, `prop:formMethod`, `prop:formNoValidate`, `prop:formTarget`, `prop:name`, `prop:popoverTargetAction`, `prop:popoverTargetElement`, `prop:type`, `prop:value`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `type`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-546f67676c6544617461417474726962757465732e70726573736564"></a>

<a id="api-546f67676c6544617461417474726962757465732e64697361626c6564"></a>

| Name | Description |
| --- | --- |
| data-pressed | Present when the toggle button is pressed. |
| data-disabled | Present when the toggle button is disabled. |

#### CSS variables

Metadata status: unavailable.

<a id="api-546f67676c652e50726f7073"></a>

<a id="toggleprops"></a>

<a id="api-546f67676c652e50726f70732e70726f703a64697361626c6564"></a>

<a id="api-546f67676c652e50726f70732e70726f703a666f726d416374696f6e"></a>

<a id="api-546f67676c652e50726f70732e70726f703a666f726d456e6374797065"></a>

<a id="api-546f67676c652e50726f70732e70726f703a666f726d4d6574686f64"></a>

<a id="api-546f67676c652e50726f70732e70726f703a666f726d4e6f56616c6964617465"></a>

<a id="api-546f67676c652e50726f70732e70726f703a666f726d546172676574"></a>

<a id="api-546f67676c652e50726f70732e70726f703a6e616d65"></a>

<a id="api-546f67676c652e50726f70732e70726f703a706f706f766572546172676574416374696f6e"></a>

<a id="api-546f67676c652e50726f70732e70726f703a706f706f766572546172676574456c656d656e74"></a>

<a id="api-546f67676c652e50726f70732e70726f703a74797065"></a>

<a id="api-546f67676c652e50726f70732e70726f703a76616c7565"></a>

### Related exported type: Toggle.Props

Declaration: `packages/solid/build/types/toggle/Toggle.d.ts:31`

#### Declaration

```typescript
Props<Value>
```

<a id="api-546f67676c652e50726f70732e76616c7565"></a>

<a id="ToggleProps-value"></a>

<a id="api-546f67676c652e50726f70732e64656661756c7450726573736564"></a>

<a id="ToggleProps-defaultPressed"></a>

<a id="api-546f67676c652e50726f70732e70726573736564"></a>

<a id="ToggleProps-pressed"></a>

<a id="api-546f67676c652e50726f70732e6f6e507265737365644368616e6765"></a>

<a id="ToggleProps-onPressedChange"></a>

<a id="api-546f67676c652e50726f70732e6e6174697665427574746f6e"></a>

<a id="ToggleProps-nativeButton"></a>

<a id="api-546f67676c652e50726f70732e64697361626c6564"></a>

<a id="ToggleProps-disabled"></a>

<a id="api-546f67676c652e50726f70732e636c617373"></a>

<a id="ToggleProps-class"></a>

<a id="api-546f67676c652e50726f70732e7374796c65"></a>

<a id="ToggleProps-style"></a>

<a id="api-546f67676c652e50726f70732e72656e646572"></a>

<a id="ToggleProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| value | `Value \| undefined` | No | Unavailable | Unique group value; omitted and empty values receive a generated ID. |
| defaultPressed | `boolean \| undefined` | No | false | Initial uncontrolled pressed state. |
| pressed | `boolean \| undefined` | No | Unavailable | Controlled pressed state. |
| onPressedChange | `((pressed: boolean, eventDetails: ToggleChangeEventDetails) => void) \| undefined` | No | Unavailable | Called before a grouped toggle requests a group value change. |
| nativeButton | `boolean \| undefined` | No | true | Whether the render callback returns a native button. |
| disabled | `boolean \| undefined` | No | false | Whether the component should ignore interaction. |
| class | `JSX.ClassValue \| ((state: Readonly<ToggleState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ToggleState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<JSX.HTMLAttributes<HTMLElement>, ToggleState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `command`, `commandfor`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `form`, `formaction`, `formenctype`, `formmethod`, `formnovalidate`, `formtarget`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `name`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `popovertarget`, `popovertargetaction`, `prefix`, `prop:disabled`, `prop:formAction`, `prop:formEnctype`, `prop:formMethod`, `prop:formNoValidate`, `prop:formTarget`, `prop:name`, `prop:popoverTargetAction`, `prop:popoverTargetElement`, `prop:type`, `prop:value`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `type`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-546f67676c652e5374617465"></a>

<a id="togglestate"></a>

### Related exported type: Toggle.State

Declaration: `packages/solid/build/types/toggle/Toggle.d.ts:30`

#### Declaration

```typescript
ToggleState
```

<a id="api-546f67676c652e53746174652e70726573736564"></a>

<a id="ToggleState-pressed"></a>

<a id="api-546f67676c652e53746174652e64697361626c6564"></a>

<a id="ToggleState-disabled"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| pressed | `boolean` | Yes | Unavailable | Whether the toggle is currently pressed. |
| disabled | `boolean` | Yes | Unavailable | Whether the toggle should ignore user interaction. |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-546f67676c652e4368616e67654576656e74526561736f6e"></a>

<a id="togglechangeeventreason"></a>

### Related exported type: Toggle.ChangeEventReason

Declaration: `packages/solid/build/types/toggle/Toggle.d.ts:32`

#### Declaration

```typescript
"none"
```

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-546f67676c652e4368616e67654576656e7444657461696c73"></a>

<a id="togglechangeeventdetails"></a>

### Related exported type: Toggle.ChangeEventDetails

Declaration: `packages/solid/build/types/toggle/Toggle.d.ts:33`

#### Declaration

```typescript
{ reason: "none"; event: Event; cancel(): void; allowPropagation(): void; isCanceled: boolean; isPropagationAllowed: boolean; trigger: Element | undefined; }
```

<a id="api-546f67676c652e4368616e67654576656e7444657461696c732e616c6c6f7750726f7061676174696f6e"></a>

<a id="ToggleChangeEventDetails-allowPropagation"></a>

<a id="api-546f67676c652e4368616e67654576656e7444657461696c732e63616e63656c"></a>

<a id="ToggleChangeEventDetails-cancel"></a>

<a id="api-546f67676c652e4368616e67654576656e7444657461696c732e6576656e74"></a>

<a id="ToggleChangeEventDetails-event"></a>

<a id="api-546f67676c652e4368616e67654576656e7444657461696c732e697343616e63656c6564"></a>

<a id="ToggleChangeEventDetails-isCanceled"></a>

<a id="api-546f67676c652e4368616e67654576656e7444657461696c732e697350726f7061676174696f6e416c6c6f776564"></a>

<a id="ToggleChangeEventDetails-isPropagationAllowed"></a>

<a id="api-546f67676c652e4368616e67654576656e7444657461696c732e726561736f6e"></a>

<a id="ToggleChangeEventDetails-reason"></a>

<a id="api-546f67676c652e4368616e67654576656e7444657461696c732e74726967676572"></a>

<a id="ToggleChangeEventDetails-trigger"></a>

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

<a id="api-546f67676c6550726f7073"></a>

<a id="api-546f67676c6550726f70732e70726f703a64697361626c6564"></a>

<a id="api-546f67676c6550726f70732e70726f703a666f726d416374696f6e"></a>

<a id="api-546f67676c6550726f70732e70726f703a666f726d456e6374797065"></a>

<a id="api-546f67676c6550726f70732e70726f703a666f726d4d6574686f64"></a>

<a id="api-546f67676c6550726f70732e70726f703a666f726d4e6f56616c6964617465"></a>

<a id="api-546f67676c6550726f70732e70726f703a666f726d546172676574"></a>

<a id="api-546f67676c6550726f70732e70726f703a6e616d65"></a>

<a id="api-546f67676c6550726f70732e70726f703a706f706f766572546172676574416374696f6e"></a>

<a id="api-546f67676c6550726f70732e70726f703a706f706f766572546172676574456c656d656e74"></a>

<a id="api-546f67676c6550726f70732e70726f703a74797065"></a>

<a id="api-546f67676c6550726f70732e70726f703a76616c7565"></a>

### Related exported type: ToggleProps

Declaration: `packages/solid/build/types/toggle/Toggle.d.ts:13`

#### Declaration

```typescript
ToggleProps<Value>
```

<a id="api-546f67676c6550726f70732e76616c7565"></a>

<a id="api-546f67676c6550726f70732e64656661756c7450726573736564"></a>

<a id="api-546f67676c6550726f70732e70726573736564"></a>

<a id="api-546f67676c6550726f70732e6f6e507265737365644368616e6765"></a>

<a id="api-546f67676c6550726f70732e6e6174697665427574746f6e"></a>

<a id="api-546f67676c6550726f70732e64697361626c6564"></a>

<a id="api-546f67676c6550726f70732e636c617373"></a>

<a id="api-546f67676c6550726f70732e7374796c65"></a>

<a id="api-546f67676c6550726f70732e72656e646572"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| value | `Value \| undefined` | No | Unavailable | Unique group value; omitted and empty values receive a generated ID. |
| defaultPressed | `boolean \| undefined` | No | false | Initial uncontrolled pressed state. |
| pressed | `boolean \| undefined` | No | Unavailable | Controlled pressed state. |
| onPressedChange | `((pressed: boolean, eventDetails: ToggleChangeEventDetails) => void) \| undefined` | No | Unavailable | Called before a grouped toggle requests a group value change. |
| nativeButton | `boolean \| undefined` | No | true | Whether the render callback returns a native button. |
| disabled | `boolean \| undefined` | No | false | Whether the component should ignore interaction. |
| class | `JSX.ClassValue \| ((state: Readonly<ToggleState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ToggleState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<JSX.HTMLAttributes<HTMLElement>, ToggleState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `command`, `commandfor`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `form`, `formaction`, `formenctype`, `formmethod`, `formnovalidate`, `formtarget`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `name`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `popovertarget`, `popovertargetaction`, `prefix`, `prop:disabled`, `prop:formAction`, `prop:formEnctype`, `prop:formMethod`, `prop:formNoValidate`, `prop:formTarget`, `prop:name`, `prop:popoverTargetAction`, `prop:popoverTargetElement`, `prop:type`, `prop:value`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `type`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-546f67676c655374617465"></a>

### Related exported type: ToggleState

Declaration: `packages/solid/build/types/toggle/Toggle.d.ts:7`

#### Declaration

```typescript
ToggleState
```

<a id="api-546f67676c6553746174652e70726573736564"></a>

<a id="api-546f67676c6553746174652e64697361626c6564"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| pressed | `boolean` | Yes | Unavailable | Whether the toggle is currently pressed. |
| disabled | `boolean` | Yes | Unavailable | Whether the toggle should ignore user interaction. |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

