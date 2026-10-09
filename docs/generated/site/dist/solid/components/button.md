<a id="button"></a>

# Button

A button component that can be rendered as another tag or focusable when disabled.



[Open mounted Solid demo: button/hero](/solid/components/button)

<a id="usage-guidelines"></a>

## Usage guidelines

- **Submit buttons**: Unlike the native button element, `type="submit"` must be specified on Button for it to act as a submit button.
- **Links**: The Button component enforces button semantics (`role="button"`, keyboard interaction, disabled state). It should not be used for links. See [Rendering links as buttons](#rendering-links-as-buttons) below.

<a id="anatomy"></a>

## Anatomy

Import the component:

```tsx
import { Button } from '@unstyled-solid/base-ui/button';
<Button />;
```

<a id="examples"></a>

## Examples

<a id="rendering-as-another-tag"></a>

### Rendering as another tag

The button can remain keyboard accessible while being rendered as another tag, such as a `<div>`, by specifying `nativeButton={false}`.

```tsx
import { Button } from '@unstyled-solid/base-ui/button';
<Button render={(renderProps) => <div {...renderProps} />} nativeButton={false}>
  Button that can contain complex children
</Button>;
```

<a id="rendering-links-as-buttons"></a>

### Rendering links as buttons

The Button component enforces button semantics. `nativeButton={false}` signals that the rendered tag is not a `<button>`, but it must still be a tag that can receive button semantics (`role="button"`, keyboard interaction handlers). Links (`<a>`) have their own semantics and should not be rendered as buttons through the `render` prop.

If a link needs to look like a button visually, style the `<a>` element directly with CSS rather than using the Button component.

<a id="loading-states"></a>

### Loading states

For buttons that enter a loading state after activation, specify `focusableWhenDisabled` so focus remains on the button while it is disabled. Because some browser and screen reader combinations do not reliably announce changes to a focused button's descendant text, use [`aria-labelledby`](https://www.w3.org/TR/accname-1.2/#computation-steps) to make the changing text the button's explicit accessible name.

[Open mounted Solid demo: button/loading](/solid/components/button)

<a id="api-reference"></a>

## API reference

<a id="api-427574746f6e"></a>

<a id="api-427574746f6e2e2470726f70732e70726f703a64697361626c6564"></a>

<a id="api-427574746f6e2e2470726f70732e70726f703a666f726d416374696f6e"></a>

<a id="api-427574746f6e2e2470726f70732e70726f703a666f726d456e6374797065"></a>

<a id="api-427574746f6e2e2470726f70732e70726f703a666f726d4d6574686f64"></a>

<a id="api-427574746f6e2e2470726f70732e70726f703a666f726d4e6f56616c6964617465"></a>

<a id="api-427574746f6e2e2470726f70732e70726f703a666f726d546172676574"></a>

<a id="api-427574746f6e2e2470726f70732e70726f703a6e616d65"></a>

<a id="api-427574746f6e2e2470726f70732e70726f703a706f706f766572546172676574416374696f6e"></a>

<a id="api-427574746f6e2e2470726f70732e70726f703a706f706f766572546172676574456c656d656e74"></a>

<a id="api-427574746f6e2e2470726f70732e70726f703a74797065"></a>

<a id="api-427574746f6e2e2470726f70732e70726f703a76616c7565"></a>

### Button

A button that triggers actions. Renders a native `<button>` by default.

Declaration: `packages/solid/build/types/button/Button.d.ts:4`

#### Declaration

```typescript
(componentProps: Button.Props) => JSX.Element
```

<a id="api-427574746f6e2e2470726f70732e666f63757361626c655768656e44697361626c6564"></a>

<a id="Button-focusableWhenDisabled"></a>

<a id="api-427574746f6e2e2470726f70732e6e6174697665427574746f6e"></a>

<a id="Button-nativeButton"></a>

<a id="api-427574746f6e2e2470726f70732e726566"></a>

<a id="Button-ref"></a>

<a id="api-427574746f6e2e2470726f70732e64697361626c6564"></a>

<a id="Button-disabled"></a>

<a id="api-427574746f6e2e2470726f70732e636c617373"></a>

<a id="Button-class"></a>

<a id="api-427574746f6e2e2470726f70732e7374796c65"></a>

<a id="Button-style"></a>

<a id="api-427574746f6e2e2470726f70732e72656e646572"></a>

<a id="Button-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| focusableWhenDisabled | `boolean \| undefined` | No | false | Whether the button remains focusable when disabled. |
| nativeButton | `boolean \| undefined` | No | true | Whether the rendered host is a native button. Set false when supplying a non-button host through render. |
| ref | `JSX.Ref<HTMLElement>` | No | Unavailable | The rendered host, including non-native hosts supplied through `render`. |
| disabled | `boolean \| undefined` | No | false | Whether the button should ignore user interaction. |
| class | `JSX.ClassValue \| ((state: Readonly<ButtonState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ButtonState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<Omit<JSX.HTMLAttributes<HTMLElement>, "ref"> & { ref?: (element: HTMLElement) => void; }, ButtonState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `command`, `commandfor`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `form`, `formaction`, `formenctype`, `formmethod`, `formnovalidate`, `formtarget`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `name`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `popovertarget`, `popovertargetaction`, `prefix`, `prop:disabled`, `prop:formAction`, `prop:formEnctype`, `prop:formMethod`, `prop:formNoValidate`, `prop:formTarget`, `prop:name`, `prop:popoverTargetAction`, `prop:popoverTargetElement`, `prop:type`, `prop:value`, `property`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `type`, `typeof`, `value`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-427574746f6e44617461417474726962757465732e64697361626c6564"></a>

| Name | Description |
| --- | --- |
| data-disabled | Present when the button is disabled. |

#### CSS variables

Metadata status: unavailable.

<a id="api-427574746f6e2e50726f7073"></a>

<a id="buttonprops"></a>

<a id="api-427574746f6e2e50726f70732e70726f703a64697361626c6564"></a>

<a id="api-427574746f6e2e50726f70732e70726f703a666f726d416374696f6e"></a>

<a id="api-427574746f6e2e50726f70732e70726f703a666f726d456e6374797065"></a>

<a id="api-427574746f6e2e50726f70732e70726f703a666f726d4d6574686f64"></a>

<a id="api-427574746f6e2e50726f70732e70726f703a666f726d4e6f56616c6964617465"></a>

<a id="api-427574746f6e2e50726f70732e70726f703a666f726d546172676574"></a>

<a id="api-427574746f6e2e50726f70732e70726f703a6e616d65"></a>

<a id="api-427574746f6e2e50726f70732e70726f703a706f706f766572546172676574416374696f6e"></a>

<a id="api-427574746f6e2e50726f70732e70726f703a706f706f766572546172676574456c656d656e74"></a>

<a id="api-427574746f6e2e50726f70732e70726f703a74797065"></a>

<a id="api-427574746f6e2e50726f70732e70726f703a76616c7565"></a>

### Related exported type: Button.Props

Declaration: `packages/solid/build/types/button/Button.d.ts:21`

#### Declaration

```typescript
ButtonProps
```

<a id="api-427574746f6e2e50726f70732e666f63757361626c655768656e44697361626c6564"></a>

<a id="ButtonProps-focusableWhenDisabled"></a>

<a id="api-427574746f6e2e50726f70732e6e6174697665427574746f6e"></a>

<a id="ButtonProps-nativeButton"></a>

<a id="api-427574746f6e2e50726f70732e726566"></a>

<a id="ButtonProps-ref"></a>

<a id="api-427574746f6e2e50726f70732e64697361626c6564"></a>

<a id="ButtonProps-disabled"></a>

<a id="api-427574746f6e2e50726f70732e636c617373"></a>

<a id="ButtonProps-class"></a>

<a id="api-427574746f6e2e50726f70732e7374796c65"></a>

<a id="ButtonProps-style"></a>

<a id="api-427574746f6e2e50726f70732e72656e646572"></a>

<a id="ButtonProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| focusableWhenDisabled | `boolean \| undefined` | No | false | Whether the button remains focusable when disabled. |
| nativeButton | `boolean \| undefined` | No | Unavailable | Whether the rendered host is a native button. Set false when supplying a non-button host through render. |
| ref | `JSX.Ref<HTMLElement>` | No | Unavailable | The rendered host, including non-native hosts supplied through `render`. |
| disabled | `boolean \| undefined` | No | false | Whether the button should ignore user interaction. |
| class | `JSX.ClassValue \| ((state: Readonly<ButtonState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ButtonState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<Omit<JSX.HTMLAttributes<HTMLElement>, "ref"> & { ref?: (element: HTMLElement) => void; }, ButtonState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `command`, `commandfor`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `form`, `formaction`, `formenctype`, `formmethod`, `formnovalidate`, `formtarget`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `name`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `popovertarget`, `popovertargetaction`, `prefix`, `prop:disabled`, `prop:formAction`, `prop:formEnctype`, `prop:formMethod`, `prop:formNoValidate`, `prop:formTarget`, `prop:name`, `prop:popoverTargetAction`, `prop:popoverTargetElement`, `prop:type`, `prop:value`, `property`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `type`, `typeof`, `value`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-427574746f6e2e5374617465"></a>

<a id="buttonstate"></a>

### Related exported type: Button.State

Declaration: `packages/solid/build/types/button/Button.d.ts:20`

#### Declaration

```typescript
ButtonState
```

<a id="api-427574746f6e2e53746174652e64697361626c6564"></a>

<a id="ButtonState-disabled"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| disabled | `boolean` | Yes | Unavailable | Whether the button should ignore user interaction. |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-427574746f6e50726f7073"></a>

<a id="api-427574746f6e50726f70732e70726f703a64697361626c6564"></a>

<a id="api-427574746f6e50726f70732e70726f703a666f726d416374696f6e"></a>

<a id="api-427574746f6e50726f70732e70726f703a666f726d456e6374797065"></a>

<a id="api-427574746f6e50726f70732e70726f703a666f726d4d6574686f64"></a>

<a id="api-427574746f6e50726f70732e70726f703a666f726d4e6f56616c6964617465"></a>

<a id="api-427574746f6e50726f70732e70726f703a666f726d546172676574"></a>

<a id="api-427574746f6e50726f70732e70726f703a6e616d65"></a>

<a id="api-427574746f6e50726f70732e70726f703a706f706f766572546172676574416374696f6e"></a>

<a id="api-427574746f6e50726f70732e70726f703a706f706f766572546172676574456c656d656e74"></a>

<a id="api-427574746f6e50726f70732e70726f703a74797065"></a>

<a id="api-427574746f6e50726f70732e70726f703a76616c7565"></a>

### Related exported type: ButtonProps

Declaration: `packages/solid/build/types/button/Button.d.ts:9`

#### Declaration

```typescript
ButtonProps
```

<a id="api-427574746f6e50726f70732e666f63757361626c655768656e44697361626c6564"></a>

<a id="api-427574746f6e50726f70732e6e6174697665427574746f6e"></a>

<a id="api-427574746f6e50726f70732e726566"></a>

<a id="api-427574746f6e50726f70732e64697361626c6564"></a>

<a id="api-427574746f6e50726f70732e636c617373"></a>

<a id="api-427574746f6e50726f70732e7374796c65"></a>

<a id="api-427574746f6e50726f70732e72656e646572"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| focusableWhenDisabled | `boolean \| undefined` | No | false | Whether the button remains focusable when disabled. |
| nativeButton | `boolean \| undefined` | No | Unavailable | Whether the rendered host is a native button. Set false when supplying a non-button host through render. |
| ref | `JSX.Ref<HTMLElement>` | No | Unavailable | The rendered host, including non-native hosts supplied through `render`. |
| disabled | `boolean \| undefined` | No | false | Whether the button should ignore user interaction. |
| class | `JSX.ClassValue \| ((state: Readonly<ButtonState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ButtonState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<Omit<JSX.HTMLAttributes<HTMLElement>, "ref"> & { ref?: (element: HTMLElement) => void; }, ButtonState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `command`, `commandfor`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `form`, `formaction`, `formenctype`, `formmethod`, `formnovalidate`, `formtarget`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `name`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `popovertarget`, `popovertargetaction`, `prefix`, `prop:disabled`, `prop:formAction`, `prop:formEnctype`, `prop:formMethod`, `prop:formNoValidate`, `prop:formTarget`, `prop:name`, `prop:popoverTargetAction`, `prop:popoverTargetElement`, `prop:type`, `prop:value`, `property`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `type`, `typeof`, `value`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-427574746f6e5374617465"></a>

### Related exported type: ButtonState

Declaration: `packages/solid/build/types/button/Button.d.ts:5`

#### Declaration

```typescript
ButtonState
```

<a id="api-427574746f6e53746174652e64697361626c6564"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| disabled | `boolean` | Yes | Unavailable | Whether the button should ignore user interaction. |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

