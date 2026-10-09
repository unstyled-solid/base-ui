<a id="number-field"></a>

# Number Field

A numeric input element with increment and decrement buttons, and a scrub area.

[Open mounted Solid demo: number-field/hero](/solid/components/number-field)

<a id="usage-guidelines"></a>

## Usage guidelines

- **Form controls must have an accessible name**: It can be created using a `<label>` element or the `Field` component. See the [forms guide](/solid/handbook/forms).

<a id="anatomy"></a>

## Anatomy

Import the component and assemble its parts:

```tsx
import { NumberField } from '@unstyled-solid/base-ui/number-field';
<NumberField.Root>
  <NumberField.ScrubArea>
    <NumberField.ScrubAreaCursor />
  </NumberField.ScrubArea>
  <NumberField.Group>
    <NumberField.Decrement />
    <NumberField.Input />
    <NumberField.Increment />
  </NumberField.Group>
</NumberField.Root>;
```

<a id="api-reference"></a>

## API reference

<a id="root"></a>

### Root

<a id="api-4e756d6265724669656c642e526f6f74"></a>

<a id="numberfieldroot"></a>

<a id="api-4e756d6265724669656c642e526f6f742e2470726f70732e70726f703a616c69676e"></a>

### NumberField.Root

Declaration: `packages/solid/build/types/number-field/root/NumberFieldRoot.d.ts:5`

#### Declaration

```typescript
(props: NumberFieldRoot.Props) => JSX.Element
```

<a id="api-4e756d6265724669656c642e526f6f742e2470726f70732e6e616d65"></a>

<a id="NumberFieldRoot-name"></a>

<a id="api-4e756d6265724669656c642e526f6f742e2470726f70732e64656661756c7456616c7565"></a>

<a id="NumberFieldRoot-defaultValue"></a>

<a id="api-4e756d6265724669656c642e526f6f742e2470726f70732e76616c7565"></a>

<a id="NumberFieldRoot-value"></a>

<a id="api-4e756d6265724669656c642e526f6f742e2470726f70732e6f6e56616c75654368616e6765"></a>

<a id="NumberFieldRoot-onValueChange"></a>

<a id="api-4e756d6265724669656c642e526f6f742e2470726f70732e6f6e56616c7565436f6d6d6974746564"></a>

<a id="NumberFieldRoot-onValueCommitted"></a>

<a id="api-4e756d6265724669656c642e526f6f742e2470726f70732e616c6c6f774f75744f6652616e6765"></a>

<a id="NumberFieldRoot-allowOutOfRange"></a>

<a id="api-4e756d6265724669656c642e526f6f742e2470726f70732e666f726d"></a>

<a id="NumberFieldRoot-form"></a>

<a id="api-4e756d6265724669656c642e526f6f742e2470726f70732e6c6f63616c65"></a>

<a id="NumberFieldRoot-locale"></a>

<a id="api-4e756d6265724669656c642e526f6f742e2470726f70732e736e61704f6e53746570"></a>

<a id="NumberFieldRoot-snapOnStep"></a>

<a id="api-4e756d6265724669656c642e526f6f742e2470726f70732e73746570"></a>

<a id="NumberFieldRoot-step"></a>

<a id="api-4e756d6265724669656c642e526f6f742e2470726f70732e736d616c6c53746570"></a>

<a id="NumberFieldRoot-smallStep"></a>

<a id="api-4e756d6265724669656c642e526f6f742e2470726f70732e6c6172676553746570"></a>

<a id="NumberFieldRoot-largeStep"></a>

<a id="api-4e756d6265724669656c642e526f6f742e2470726f70732e6d696e"></a>

<a id="NumberFieldRoot-min"></a>

<a id="api-4e756d6265724669656c642e526f6f742e2470726f70732e6d6178"></a>

<a id="NumberFieldRoot-max"></a>

<a id="api-4e756d6265724669656c642e526f6f742e2470726f70732e616c6c6f77576865656c5363727562"></a>

<a id="NumberFieldRoot-allowWheelScrub"></a>

<a id="api-4e756d6265724669656c642e526f6f742e2470726f70732e666f726d6174"></a>

<a id="NumberFieldRoot-format"></a>

<a id="api-4e756d6265724669656c642e526f6f742e2470726f70732e64697361626c6564"></a>

<a id="NumberFieldRoot-disabled"></a>

<a id="api-4e756d6265724669656c642e526f6f742e2470726f70732e726561644f6e6c79"></a>

<a id="NumberFieldRoot-readOnly"></a>

<a id="api-4e756d6265724669656c642e526f6f742e2470726f70732e7265717569726564"></a>

<a id="NumberFieldRoot-required"></a>

<a id="api-4e756d6265724669656c642e526f6f742e2470726f70732e696e707574526566"></a>

<a id="NumberFieldRoot-inputRef"></a>

<a id="api-4e756d6265724669656c642e526f6f742e2470726f70732e6964"></a>

<a id="NumberFieldRoot-id"></a>

<a id="api-4e756d6265724669656c642e526f6f742e2470726f70732e636c617373"></a>

<a id="NumberFieldRoot-class"></a>

<a id="api-4e756d6265724669656c642e526f6f742e2470726f70732e7374796c65"></a>

<a id="NumberFieldRoot-style"></a>

<a id="api-4e756d6265724669656c642e526f6f742e2470726f70732e72656e646572"></a>

<a id="NumberFieldRoot-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| name | `string \| undefined` | No | Unavailable |  |
| defaultValue | `number \| undefined` | No | null |  |
| value | `number \| null \| undefined` | No | Unavailable |  |
| onValueChange | `((value: number \| null, details: NumberFieldRootChangeEventDetails) => void) \| undefined` | No | Unavailable |  |
| onValueCommitted | `((value: number \| null, details: NumberFieldRootCommitEventDetails) => void) \| undefined` | No | Unavailable |  |
| allowOutOfRange | `boolean \| undefined` | No | Unavailable |  |
| form | `string \| undefined` | No | Unavailable |  |
| locale | `Intl.LocalesArgument` | No | Unavailable |  |
| snapOnStep | `boolean \| undefined` | No | false |  |
| step | `number \| "any" \| undefined` | No | 1 |  |
| smallStep | `number \| undefined` | No | 0.1 |  |
| largeStep | `number \| undefined` | No | 10 |  |
| min | `number \| undefined` | No | 0 |  |
| max | `number \| undefined` | No | Unavailable |  |
| allowWheelScrub | `boolean \| undefined` | No | Unavailable |  |
| format | `Intl.NumberFormatOptions \| undefined` | No | Unavailable |  |
| disabled | `boolean \| undefined` | No | Unavailable |  |
| readOnly | `boolean \| undefined` | No | false |  |
| required | `boolean \| undefined` | No | false |  |
| inputRef | `JSX.Ref<HTMLInputElement>` | No | Unavailable |  |
| id | `string \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<NumberFieldRootState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<NumberFieldRootState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, NumberFieldRootState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-4e756d6265724669656c64526f6f7444617461417474726962757465732e64697361626c6564"></a>

<a id="api-4e756d6265724669656c64526f6f7444617461417474726962757465732e726561646f6e6c79"></a>

<a id="api-4e756d6265724669656c64526f6f7444617461417474726962757465732e7265717569726564"></a>

<a id="api-4e756d6265724669656c64526f6f7444617461417474726962757465732e76616c6964"></a>

<a id="api-4e756d6265724669656c64526f6f7444617461417474726962757465732e696e76616c6964"></a>

<a id="api-4e756d6265724669656c64526f6f7444617461417474726962757465732e6469727479"></a>

<a id="api-4e756d6265724669656c64526f6f7444617461417474726962757465732e746f7563686564"></a>

<a id="api-4e756d6265724669656c64526f6f7444617461417474726962757465732e66696c6c6564"></a>

<a id="api-4e756d6265724669656c64526f6f7444617461417474726962757465732e666f6375736564"></a>

<a id="api-4e756d6265724669656c64526f6f7444617461417474726962757465732e736372756262696e67"></a>

| Name | Description |
| --- | --- |
| data-disabled |  |
| data-readonly |  |
| data-required |  |
| data-valid |  |
| data-invalid |  |
| data-dirty |  |
| data-touched |  |
| data-filled |  |
| data-focused |  |
| data-scrubbing |  |

#### CSS variables

Metadata status: unavailable.

<a id="api-4e756d6265724669656c642e526f6f742e50726f7073"></a>

<a id="numberfieldrootprops"></a>

<a id="api-4e756d6265724669656c642e526f6f742e50726f70732e70726f703a616c69676e"></a>

### Related exported type: NumberField.Root.Props

Declaration: `packages/solid/build/types/number-field/root/NumberFieldRoot.d.ts:44`

#### Declaration

```typescript
NumberFieldRootProps
```

<a id="api-4e756d6265724669656c642e526f6f742e50726f70732e6e616d65"></a>

<a id="NumberFieldRootProps-name"></a>

<a id="api-4e756d6265724669656c642e526f6f742e50726f70732e64656661756c7456616c7565"></a>

<a id="NumberFieldRootProps-defaultValue"></a>

<a id="api-4e756d6265724669656c642e526f6f742e50726f70732e76616c7565"></a>

<a id="NumberFieldRootProps-value"></a>

<a id="api-4e756d6265724669656c642e526f6f742e50726f70732e6f6e56616c75654368616e6765"></a>

<a id="NumberFieldRootProps-onValueChange"></a>

<a id="api-4e756d6265724669656c642e526f6f742e50726f70732e6f6e56616c7565436f6d6d6974746564"></a>

<a id="NumberFieldRootProps-onValueCommitted"></a>

<a id="api-4e756d6265724669656c642e526f6f742e50726f70732e616c6c6f774f75744f6652616e6765"></a>

<a id="NumberFieldRootProps-allowOutOfRange"></a>

<a id="api-4e756d6265724669656c642e526f6f742e50726f70732e666f726d"></a>

<a id="NumberFieldRootProps-form"></a>

<a id="api-4e756d6265724669656c642e526f6f742e50726f70732e6c6f63616c65"></a>

<a id="NumberFieldRootProps-locale"></a>

<a id="api-4e756d6265724669656c642e526f6f742e50726f70732e736e61704f6e53746570"></a>

<a id="NumberFieldRootProps-snapOnStep"></a>

<a id="api-4e756d6265724669656c642e526f6f742e50726f70732e73746570"></a>

<a id="NumberFieldRootProps-step"></a>

<a id="api-4e756d6265724669656c642e526f6f742e50726f70732e736d616c6c53746570"></a>

<a id="NumberFieldRootProps-smallStep"></a>

<a id="api-4e756d6265724669656c642e526f6f742e50726f70732e6c6172676553746570"></a>

<a id="NumberFieldRootProps-largeStep"></a>

<a id="api-4e756d6265724669656c642e526f6f742e50726f70732e6d696e"></a>

<a id="NumberFieldRootProps-min"></a>

<a id="api-4e756d6265724669656c642e526f6f742e50726f70732e6d6178"></a>

<a id="NumberFieldRootProps-max"></a>

<a id="api-4e756d6265724669656c642e526f6f742e50726f70732e616c6c6f77576865656c5363727562"></a>

<a id="NumberFieldRootProps-allowWheelScrub"></a>

<a id="api-4e756d6265724669656c642e526f6f742e50726f70732e666f726d6174"></a>

<a id="NumberFieldRootProps-format"></a>

<a id="api-4e756d6265724669656c642e526f6f742e50726f70732e64697361626c6564"></a>

<a id="NumberFieldRootProps-disabled"></a>

<a id="api-4e756d6265724669656c642e526f6f742e50726f70732e726561644f6e6c79"></a>

<a id="NumberFieldRootProps-readOnly"></a>

<a id="api-4e756d6265724669656c642e526f6f742e50726f70732e7265717569726564"></a>

<a id="NumberFieldRootProps-required"></a>

<a id="api-4e756d6265724669656c642e526f6f742e50726f70732e696e707574526566"></a>

<a id="NumberFieldRootProps-inputRef"></a>

<a id="api-4e756d6265724669656c642e526f6f742e50726f70732e6964"></a>

<a id="NumberFieldRootProps-id"></a>

<a id="api-4e756d6265724669656c642e526f6f742e50726f70732e636c617373"></a>

<a id="NumberFieldRootProps-class"></a>

<a id="api-4e756d6265724669656c642e526f6f742e50726f70732e7374796c65"></a>

<a id="NumberFieldRootProps-style"></a>

<a id="api-4e756d6265724669656c642e526f6f742e50726f70732e72656e646572"></a>

<a id="NumberFieldRootProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| name | `string \| undefined` | No | Unavailable |  |
| defaultValue | `number \| undefined` | No | Unavailable |  |
| value | `number \| null \| undefined` | No | Unavailable |  |
| onValueChange | `((value: number \| null, details: NumberFieldRootChangeEventDetails) => void) \| undefined` | No | Unavailable |  |
| onValueCommitted | `((value: number \| null, details: NumberFieldRootCommitEventDetails) => void) \| undefined` | No | Unavailable |  |
| allowOutOfRange | `boolean \| undefined` | No | Unavailable |  |
| form | `string \| undefined` | No | Unavailable |  |
| locale | `Intl.LocalesArgument` | No | Unavailable |  |
| snapOnStep | `boolean \| undefined` | No | Unavailable |  |
| step | `number \| "any" \| undefined` | No | Unavailable |  |
| smallStep | `number \| undefined` | No | Unavailable |  |
| largeStep | `number \| undefined` | No | Unavailable |  |
| min | `number \| undefined` | No | Unavailable |  |
| max | `number \| undefined` | No | Unavailable |  |
| allowWheelScrub | `boolean \| undefined` | No | Unavailable |  |
| format | `Intl.NumberFormatOptions \| undefined` | No | Unavailable |  |
| disabled | `boolean \| undefined` | No | Unavailable |  |
| readOnly | `boolean \| undefined` | No | Unavailable |  |
| required | `boolean \| undefined` | No | Unavailable |  |
| inputRef | `JSX.Ref<HTMLInputElement>` | No | Unavailable |  |
| id | `string \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<NumberFieldRootState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<NumberFieldRootState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, NumberFieldRootState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4e756d6265724669656c642e526f6f742e5374617465"></a>

<a id="numberfieldrootstate"></a>

### Related exported type: NumberField.Root.State

Declaration: `packages/solid/build/types/number-field/root/NumberFieldRoot.d.ts:45`

#### Declaration

```typescript
NumberFieldRootState
```

<a id="api-4e756d6265724669656c642e526f6f742e53746174652e76616c7565"></a>

<a id="NumberFieldRootState-value"></a>

<a id="api-4e756d6265724669656c642e526f6f742e53746174652e696e70757456616c7565"></a>

<a id="NumberFieldRootState-inputValue"></a>

<a id="api-4e756d6265724669656c642e526f6f742e53746174652e6469727479"></a>

<a id="NumberFieldRootState-dirty"></a>

<a id="api-4e756d6265724669656c642e526f6f742e53746174652e66696c6c6564"></a>

<a id="NumberFieldRootState-filled"></a>

<a id="api-4e756d6265724669656c642e526f6f742e53746174652e666f6375736564"></a>

<a id="NumberFieldRootState-focused"></a>

<a id="api-4e756d6265724669656c642e526f6f742e53746174652e736372756262696e67"></a>

<a id="NumberFieldRootState-scrubbing"></a>

<a id="api-4e756d6265724669656c642e526f6f742e53746174652e746f7563686564"></a>

<a id="NumberFieldRootState-touched"></a>

<a id="api-4e756d6265724669656c642e526f6f742e53746174652e64697361626c6564"></a>

<a id="NumberFieldRootState-disabled"></a>

<a id="api-4e756d6265724669656c642e526f6f742e53746174652e726561644f6e6c79"></a>

<a id="NumberFieldRootState-readOnly"></a>

<a id="api-4e756d6265724669656c642e526f6f742e53746174652e7265717569726564"></a>

<a id="NumberFieldRootState-required"></a>

<a id="api-4e756d6265724669656c642e526f6f742e53746174652e76616c6964"></a>

<a id="NumberFieldRootState-valid"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| value | `number \| null` | Yes | Unavailable |  |
| inputValue | `string` | Yes | Unavailable |  |
| dirty | `boolean` | Yes | Unavailable |  |
| filled | `boolean` | Yes | Unavailable |  |
| focused | `boolean` | Yes | Unavailable |  |
| scrubbing | `boolean` | Yes | Unavailable |  |
| touched | `boolean` | Yes | Unavailable |  |
| disabled | `boolean` | Yes | Unavailable |  |
| readOnly | `boolean` | Yes | Unavailable |  |
| required | `boolean` | Yes | Unavailable |  |
| valid | `boolean \| null` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4e756d6265724669656c642e526f6f742e4368616e67654576656e74526561736f6e"></a>

<a id="numberfieldrootchangeeventreason"></a>

### Related exported type: NumberField.Root.ChangeEventReason

Declaration: `packages/solid/build/types/number-field/root/NumberFieldRoot.d.ts:46`

#### Declaration

```typescript
NumberFieldRootChangeEventReason
```

Inherited DOM attributes: `__@iterator@106`, `anchor`, `at`, `big`, `blink`, `bold`, `charAt`, `charCodeAt`, `codePointAt`, `concat`, `endsWith`, `fixed`, `fontcolor`, `fontsize`, `includes`, `indexOf`, `isWellFormed`, `italics`, `lastIndexOf`, `length`, `link`, `localeCompare`, `match`, `matchAll`, `normalize`, `padEnd`, `padStart`, `repeat`, `replace`, `replaceAll`, `search`, `slice`, `small`, `split`, `startsWith`, `strike`, `sub`, `substr`, `substring`, `sup`, `toLocaleLowerCase`, `toLocaleUpperCase`, `toLowerCase`, `toString`, `toUpperCase`, `toWellFormed`, `trim`, `trimEnd`, `trimLeft`, `trimRight`, `trimStart`, `valueOf`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4e756d6265724669656c642e526f6f742e4368616e67654576656e7444657461696c73"></a>

<a id="numberfieldrootchangeeventdetails"></a>

### Related exported type: NumberField.Root.ChangeEventDetails

Declaration: `packages/solid/build/types/number-field/root/NumberFieldRoot.d.ts:47`

#### Declaration

```typescript
NumberFieldRootChangeEventDetails
```

<a id="api-4e756d6265724669656c642e526f6f742e4368616e67654576656e7444657461696c732e616c6c6f7750726f7061676174696f6e"></a>

<a id="NumberFieldRootChangeEventDetails-allowPropagation"></a>

<a id="api-4e756d6265724669656c642e526f6f742e4368616e67654576656e7444657461696c732e63616e63656c"></a>

<a id="NumberFieldRootChangeEventDetails-cancel"></a>

<a id="api-4e756d6265724669656c642e526f6f742e4368616e67654576656e7444657461696c732e646972656374696f6e"></a>

<a id="NumberFieldRootChangeEventDetails-direction"></a>

<a id="api-4e756d6265724669656c642e526f6f742e4368616e67654576656e7444657461696c732e6576656e74"></a>

<a id="NumberFieldRootChangeEventDetails-event"></a>

<a id="api-4e756d6265724669656c642e526f6f742e4368616e67654576656e7444657461696c732e697343616e63656c6564"></a>

<a id="NumberFieldRootChangeEventDetails-isCanceled"></a>

<a id="api-4e756d6265724669656c642e526f6f742e4368616e67654576656e7444657461696c732e697350726f7061676174696f6e416c6c6f776564"></a>

<a id="NumberFieldRootChangeEventDetails-isPropagationAllowed"></a>

<a id="api-4e756d6265724669656c642e526f6f742e4368616e67654576656e7444657461696c732e726561736f6e"></a>

<a id="NumberFieldRootChangeEventDetails-reason"></a>

<a id="api-4e756d6265724669656c642e526f6f742e4368616e67654576656e7444657461696c732e74726967676572"></a>

<a id="NumberFieldRootChangeEventDetails-trigger"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| allowPropagation | `() => void` | Yes | Unavailable | Marks this change transaction as allowing propagation. |
| cancel | `() => void` | Yes | Unavailable | Cancels the Base UI change transaction; separate from the DOM event’s preventDefault() and preventBaseUIHandler(). |
| direction | `1 \| -1 \| undefined` | No | Unavailable |  |
| event | `PointerEvent \| MouseEvent \| Event \| ClipboardEvent \| FocusEvent \| InputEvent \| KeyboardEvent \| TouchEvent \| WheelEvent` | Yes | Unavailable | Native DOM event associated with the change. Programmatic changes can use a Base UI-created Event. |
| isCanceled | `boolean` | Yes | Unavailable | Whether cancel() has been called for this change transaction. |
| isPropagationAllowed | `boolean` | Yes | Unavailable | Whether allowPropagation() has been called for this change transaction. |
| reason | `"none" \| "wheel" \| "increment-press" \| "decrement-press" \| "input-change" \| "input-clear" \| "input-blur" \| "input-paste" \| "keyboard" \| "scrub"` | Yes | Unavailable | Reason for the requested change; it discriminates the native event type. |
| trigger | `Element \| undefined` | Yes | Unavailable | Trigger element associated with this change, when available. |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4e756d6265724669656c642e526f6f742e436f6d6d69744576656e74526561736f6e"></a>

<a id="numberfieldrootcommiteventreason"></a>

### Related exported type: NumberField.Root.CommitEventReason

Declaration: `packages/solid/build/types/number-field/root/NumberFieldRoot.d.ts:48`

#### Declaration

```typescript
NumberFieldRootCommitEventReason
```

Inherited DOM attributes: `__@iterator@106`, `anchor`, `at`, `big`, `blink`, `bold`, `charAt`, `charCodeAt`, `codePointAt`, `concat`, `endsWith`, `fixed`, `fontcolor`, `fontsize`, `includes`, `indexOf`, `isWellFormed`, `italics`, `lastIndexOf`, `length`, `link`, `localeCompare`, `match`, `matchAll`, `normalize`, `padEnd`, `padStart`, `repeat`, `replace`, `replaceAll`, `search`, `slice`, `small`, `split`, `startsWith`, `strike`, `sub`, `substr`, `substring`, `sup`, `toLocaleLowerCase`, `toLocaleUpperCase`, `toLowerCase`, `toString`, `toUpperCase`, `toWellFormed`, `trim`, `trimEnd`, `trimLeft`, `trimRight`, `trimStart`, `valueOf`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4e756d6265724669656c642e526f6f742e436f6d6d69744576656e7444657461696c73"></a>

<a id="numberfieldrootcommiteventdetails"></a>

### Related exported type: NumberField.Root.CommitEventDetails

Declaration: `packages/solid/build/types/number-field/root/NumberFieldRoot.d.ts:49`

#### Declaration

```typescript
NumberFieldRootCommitEventDetails
```

<a id="api-4e756d6265724669656c642e526f6f742e436f6d6d69744576656e7444657461696c732e6576656e74"></a>

<a id="NumberFieldRootCommitEventDetails-event"></a>

<a id="api-4e756d6265724669656c642e526f6f742e436f6d6d69744576656e7444657461696c732e726561736f6e"></a>

<a id="NumberFieldRootCommitEventDetails-reason"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| event | `PointerEvent \| MouseEvent \| Event \| FocusEvent \| InputEvent \| KeyboardEvent \| TouchEvent \| WheelEvent` | Yes | Unavailable | Native DOM event associated with the change. Programmatic changes can use a Base UI-created Event. |
| reason | `"none" \| "wheel" \| "increment-press" \| "decrement-press" \| "input-clear" \| "input-blur" \| "keyboard" \| "scrub"` | Yes | Unavailable | Reason for the requested change; it discriminates the native event type. |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="scrubarea"></a>

### ScrubArea

<a id="api-4e756d6265724669656c642e536372756241726561"></a>

<a id="numberfieldscrubarea"></a>

### NumberField.ScrubArea

Declaration: `packages/solid/build/types/number-field/scrub-area/NumberFieldScrubArea.d.ts:3`

#### Declaration

```typescript
(props: NumberFieldScrubArea.Props) => JSX.Element
```

<a id="api-4e756d6265724669656c642e5363727562417265612e2470726f70732e646972656374696f6e"></a>

<a id="NumberFieldScrubArea-direction"></a>

<a id="api-4e756d6265724669656c642e5363727562417265612e2470726f70732e706978656c53656e7369746976697479"></a>

<a id="NumberFieldScrubArea-pixelSensitivity"></a>

<a id="api-4e756d6265724669656c642e5363727562417265612e2470726f70732e74656c65706f727444697374616e6365"></a>

<a id="NumberFieldScrubArea-teleportDistance"></a>

<a id="api-4e756d6265724669656c642e5363727562417265612e2470726f70732e636c617373"></a>

<a id="NumberFieldScrubArea-class"></a>

<a id="api-4e756d6265724669656c642e5363727562417265612e2470726f70732e7374796c65"></a>

<a id="NumberFieldScrubArea-style"></a>

<a id="api-4e756d6265724669656c642e5363727562417265612e2470726f70732e72656e646572"></a>

<a id="NumberFieldScrubArea-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| direction | `"horizontal" \| "vertical" \| undefined` | No | Unavailable |  |
| pixelSensitivity | `number \| undefined` | No | 2 |  |
| teleportDistance | `number \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<NumberFieldScrubAreaState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<NumberFieldScrubAreaState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, NumberFieldScrubAreaState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-4e756d6265724669656c6453637275624172656144617461417474726962757465732e64697361626c6564"></a>

<a id="api-4e756d6265724669656c6453637275624172656144617461417474726962757465732e726561646f6e6c79"></a>

<a id="api-4e756d6265724669656c6453637275624172656144617461417474726962757465732e7265717569726564"></a>

<a id="api-4e756d6265724669656c6453637275624172656144617461417474726962757465732e76616c6964"></a>

<a id="api-4e756d6265724669656c6453637275624172656144617461417474726962757465732e696e76616c6964"></a>

<a id="api-4e756d6265724669656c6453637275624172656144617461417474726962757465732e6469727479"></a>

<a id="api-4e756d6265724669656c6453637275624172656144617461417474726962757465732e746f7563686564"></a>

<a id="api-4e756d6265724669656c6453637275624172656144617461417474726962757465732e66696c6c6564"></a>

<a id="api-4e756d6265724669656c6453637275624172656144617461417474726962757465732e666f6375736564"></a>

<a id="api-4e756d6265724669656c6453637275624172656144617461417474726962757465732e736372756262696e67"></a>

| Name | Description |
| --- | --- |
| data-disabled |  |
| data-readonly |  |
| data-required |  |
| data-valid |  |
| data-invalid |  |
| data-dirty |  |
| data-touched |  |
| data-filled |  |
| data-focused |  |
| data-scrubbing |  |

#### CSS variables

Metadata status: unavailable.

<a id="api-4e756d6265724669656c642e5363727562417265612e50726f7073"></a>

<a id="numberfieldscrubareaprops"></a>

### Related exported type: NumberField.ScrubArea.Props

Declaration: `packages/solid/build/types/number-field/scrub-area/NumberFieldScrubArea.d.ts:12`

#### Declaration

```typescript
NumberFieldScrubAreaProps
```

<a id="api-4e756d6265724669656c642e5363727562417265612e50726f70732e646972656374696f6e"></a>

<a id="NumberFieldScrubAreaProps-direction"></a>

<a id="api-4e756d6265724669656c642e5363727562417265612e50726f70732e706978656c53656e7369746976697479"></a>

<a id="NumberFieldScrubAreaProps-pixelSensitivity"></a>

<a id="api-4e756d6265724669656c642e5363727562417265612e50726f70732e74656c65706f727444697374616e6365"></a>

<a id="NumberFieldScrubAreaProps-teleportDistance"></a>

<a id="api-4e756d6265724669656c642e5363727562417265612e50726f70732e636c617373"></a>

<a id="NumberFieldScrubAreaProps-class"></a>

<a id="api-4e756d6265724669656c642e5363727562417265612e50726f70732e7374796c65"></a>

<a id="NumberFieldScrubAreaProps-style"></a>

<a id="api-4e756d6265724669656c642e5363727562417265612e50726f70732e72656e646572"></a>

<a id="NumberFieldScrubAreaProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| direction | `"horizontal" \| "vertical" \| undefined` | No | Unavailable |  |
| pixelSensitivity | `number \| undefined` | No | Unavailable |  |
| teleportDistance | `number \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<NumberFieldScrubAreaState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<NumberFieldScrubAreaState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, NumberFieldScrubAreaState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4e756d6265724669656c642e5363727562417265612e5374617465"></a>

<a id="numberfieldscrubareastate"></a>

### Related exported type: NumberField.ScrubArea.State

Declaration: `packages/solid/build/types/number-field/scrub-area/NumberFieldScrubArea.d.ts:13`

#### Declaration

```typescript
NumberFieldScrubAreaState
```

<a id="api-4e756d6265724669656c642e5363727562417265612e53746174652e76616c7565"></a>

<a id="NumberFieldScrubAreaState-value"></a>

<a id="api-4e756d6265724669656c642e5363727562417265612e53746174652e696e70757456616c7565"></a>

<a id="NumberFieldScrubAreaState-inputValue"></a>

<a id="api-4e756d6265724669656c642e5363727562417265612e53746174652e6469727479"></a>

<a id="NumberFieldScrubAreaState-dirty"></a>

<a id="api-4e756d6265724669656c642e5363727562417265612e53746174652e66696c6c6564"></a>

<a id="NumberFieldScrubAreaState-filled"></a>

<a id="api-4e756d6265724669656c642e5363727562417265612e53746174652e666f6375736564"></a>

<a id="NumberFieldScrubAreaState-focused"></a>

<a id="api-4e756d6265724669656c642e5363727562417265612e53746174652e736372756262696e67"></a>

<a id="NumberFieldScrubAreaState-scrubbing"></a>

<a id="api-4e756d6265724669656c642e5363727562417265612e53746174652e746f7563686564"></a>

<a id="NumberFieldScrubAreaState-touched"></a>

<a id="api-4e756d6265724669656c642e5363727562417265612e53746174652e64697361626c6564"></a>

<a id="NumberFieldScrubAreaState-disabled"></a>

<a id="api-4e756d6265724669656c642e5363727562417265612e53746174652e726561644f6e6c79"></a>

<a id="NumberFieldScrubAreaState-readOnly"></a>

<a id="api-4e756d6265724669656c642e5363727562417265612e53746174652e7265717569726564"></a>

<a id="NumberFieldScrubAreaState-required"></a>

<a id="api-4e756d6265724669656c642e5363727562417265612e53746174652e76616c6964"></a>

<a id="NumberFieldScrubAreaState-valid"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| value | `number \| null` | Yes | Unavailable |  |
| inputValue | `string` | Yes | Unavailable |  |
| dirty | `boolean` | Yes | Unavailable |  |
| filled | `boolean` | Yes | Unavailable |  |
| focused | `boolean` | Yes | Unavailable |  |
| scrubbing | `boolean` | Yes | Unavailable |  |
| touched | `boolean` | Yes | Unavailable |  |
| disabled | `boolean` | Yes | Unavailable |  |
| readOnly | `boolean` | Yes | Unavailable |  |
| required | `boolean` | Yes | Unavailable |  |
| valid | `boolean \| null` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="scrubareacursor"></a>

### ScrubAreaCursor

<a id="api-4e756d6265724669656c642e536372756241726561437572736f72"></a>

<a id="numberfieldscrubareacursor"></a>

### NumberField.ScrubAreaCursor

Declaration: `packages/solid/build/types/number-field/scrub-area-cursor/NumberFieldScrubAreaCursor.d.ts:3`

#### Declaration

```typescript
(props: NumberFieldScrubAreaCursor.Props) => JSX.Element
```

<a id="api-4e756d6265724669656c642e536372756241726561437572736f722e2470726f70732e636c617373"></a>

<a id="NumberFieldScrubAreaCursor-class"></a>

<a id="api-4e756d6265724669656c642e536372756241726561437572736f722e2470726f70732e7374796c65"></a>

<a id="NumberFieldScrubAreaCursor-style"></a>

<a id="api-4e756d6265724669656c642e536372756241726561437572736f722e2470726f70732e72656e646572"></a>

<a id="NumberFieldScrubAreaCursor-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<NumberFieldScrubAreaCursorState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<NumberFieldScrubAreaCursorState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, NumberFieldScrubAreaCursorState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-4e756d6265724669656c64536372756241726561437572736f7244617461417474726962757465732e64697361626c6564"></a>

<a id="api-4e756d6265724669656c64536372756241726561437572736f7244617461417474726962757465732e726561646f6e6c79"></a>

<a id="api-4e756d6265724669656c64536372756241726561437572736f7244617461417474726962757465732e7265717569726564"></a>

<a id="api-4e756d6265724669656c64536372756241726561437572736f7244617461417474726962757465732e76616c6964"></a>

<a id="api-4e756d6265724669656c64536372756241726561437572736f7244617461417474726962757465732e696e76616c6964"></a>

<a id="api-4e756d6265724669656c64536372756241726561437572736f7244617461417474726962757465732e6469727479"></a>

<a id="api-4e756d6265724669656c64536372756241726561437572736f7244617461417474726962757465732e746f7563686564"></a>

<a id="api-4e756d6265724669656c64536372756241726561437572736f7244617461417474726962757465732e66696c6c6564"></a>

<a id="api-4e756d6265724669656c64536372756241726561437572736f7244617461417474726962757465732e666f6375736564"></a>

<a id="api-4e756d6265724669656c64536372756241726561437572736f7244617461417474726962757465732e736372756262696e67"></a>

| Name | Description |
| --- | --- |
| data-disabled |  |
| data-readonly |  |
| data-required |  |
| data-valid |  |
| data-invalid |  |
| data-dirty |  |
| data-touched |  |
| data-filled |  |
| data-focused |  |
| data-scrubbing |  |

#### CSS variables

Metadata status: unavailable.

<a id="api-4e756d6265724669656c642e536372756241726561437572736f722e50726f7073"></a>

<a id="numberfieldscrubareacursorprops"></a>

### Related exported type: NumberField.ScrubAreaCursor.Props

Declaration: `packages/solid/build/types/number-field/scrub-area-cursor/NumberFieldScrubAreaCursor.d.ts:9`

#### Declaration

```typescript
NumberFieldScrubAreaCursorProps
```

<a id="api-4e756d6265724669656c642e536372756241726561437572736f722e50726f70732e636c617373"></a>

<a id="NumberFieldScrubAreaCursorProps-class"></a>

<a id="api-4e756d6265724669656c642e536372756241726561437572736f722e50726f70732e7374796c65"></a>

<a id="NumberFieldScrubAreaCursorProps-style"></a>

<a id="api-4e756d6265724669656c642e536372756241726561437572736f722e50726f70732e72656e646572"></a>

<a id="NumberFieldScrubAreaCursorProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<NumberFieldScrubAreaCursorState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<NumberFieldScrubAreaCursorState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, NumberFieldScrubAreaCursorState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4e756d6265724669656c642e536372756241726561437572736f722e5374617465"></a>

<a id="numberfieldscrubareacursorstate"></a>

### Related exported type: NumberField.ScrubAreaCursor.State

Declaration: `packages/solid/build/types/number-field/scrub-area-cursor/NumberFieldScrubAreaCursor.d.ts:10`

#### Declaration

```typescript
NumberFieldScrubAreaCursorState
```

<a id="api-4e756d6265724669656c642e536372756241726561437572736f722e53746174652e76616c7565"></a>

<a id="NumberFieldScrubAreaCursorState-value"></a>

<a id="api-4e756d6265724669656c642e536372756241726561437572736f722e53746174652e696e70757456616c7565"></a>

<a id="NumberFieldScrubAreaCursorState-inputValue"></a>

<a id="api-4e756d6265724669656c642e536372756241726561437572736f722e53746174652e6469727479"></a>

<a id="NumberFieldScrubAreaCursorState-dirty"></a>

<a id="api-4e756d6265724669656c642e536372756241726561437572736f722e53746174652e66696c6c6564"></a>

<a id="NumberFieldScrubAreaCursorState-filled"></a>

<a id="api-4e756d6265724669656c642e536372756241726561437572736f722e53746174652e666f6375736564"></a>

<a id="NumberFieldScrubAreaCursorState-focused"></a>

<a id="api-4e756d6265724669656c642e536372756241726561437572736f722e53746174652e736372756262696e67"></a>

<a id="NumberFieldScrubAreaCursorState-scrubbing"></a>

<a id="api-4e756d6265724669656c642e536372756241726561437572736f722e53746174652e746f7563686564"></a>

<a id="NumberFieldScrubAreaCursorState-touched"></a>

<a id="api-4e756d6265724669656c642e536372756241726561437572736f722e53746174652e64697361626c6564"></a>

<a id="NumberFieldScrubAreaCursorState-disabled"></a>

<a id="api-4e756d6265724669656c642e536372756241726561437572736f722e53746174652e726561644f6e6c79"></a>

<a id="NumberFieldScrubAreaCursorState-readOnly"></a>

<a id="api-4e756d6265724669656c642e536372756241726561437572736f722e53746174652e7265717569726564"></a>

<a id="NumberFieldScrubAreaCursorState-required"></a>

<a id="api-4e756d6265724669656c642e536372756241726561437572736f722e53746174652e76616c6964"></a>

<a id="NumberFieldScrubAreaCursorState-valid"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| value | `number \| null` | Yes | Unavailable |  |
| inputValue | `string` | Yes | Unavailable |  |
| dirty | `boolean` | Yes | Unavailable |  |
| filled | `boolean` | Yes | Unavailable |  |
| focused | `boolean` | Yes | Unavailable |  |
| scrubbing | `boolean` | Yes | Unavailable |  |
| touched | `boolean` | Yes | Unavailable |  |
| disabled | `boolean` | Yes | Unavailable |  |
| readOnly | `boolean` | Yes | Unavailable |  |
| required | `boolean` | Yes | Unavailable |  |
| valid | `boolean \| null` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="group"></a>

### Group

<a id="api-4e756d6265724669656c642e47726f7570"></a>

<a id="numberfieldgroup"></a>

<a id="api-4e756d6265724669656c642e47726f75702e2470726f70732e70726f703a616c69676e"></a>

### NumberField.Group

Declaration: `packages/solid/build/types/number-field/group/NumberFieldGroup.d.ts:3`

#### Declaration

```typescript
(props: NumberFieldGroup.Props) => JSX.Element
```

<a id="api-4e756d6265724669656c642e47726f75702e2470726f70732e636c617373"></a>

<a id="NumberFieldGroup-class"></a>

<a id="api-4e756d6265724669656c642e47726f75702e2470726f70732e7374796c65"></a>

<a id="NumberFieldGroup-style"></a>

<a id="api-4e756d6265724669656c642e47726f75702e2470726f70732e72656e646572"></a>

<a id="NumberFieldGroup-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<NumberFieldGroupState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<NumberFieldGroupState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, NumberFieldGroupState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-4e756d6265724669656c6447726f757044617461417474726962757465732e64697361626c6564"></a>

<a id="api-4e756d6265724669656c6447726f757044617461417474726962757465732e726561646f6e6c79"></a>

<a id="api-4e756d6265724669656c6447726f757044617461417474726962757465732e7265717569726564"></a>

<a id="api-4e756d6265724669656c6447726f757044617461417474726962757465732e76616c6964"></a>

<a id="api-4e756d6265724669656c6447726f757044617461417474726962757465732e696e76616c6964"></a>

<a id="api-4e756d6265724669656c6447726f757044617461417474726962757465732e6469727479"></a>

<a id="api-4e756d6265724669656c6447726f757044617461417474726962757465732e746f7563686564"></a>

<a id="api-4e756d6265724669656c6447726f757044617461417474726962757465732e66696c6c6564"></a>

<a id="api-4e756d6265724669656c6447726f757044617461417474726962757465732e666f6375736564"></a>

<a id="api-4e756d6265724669656c6447726f757044617461417474726962757465732e736372756262696e67"></a>

| Name | Description |
| --- | --- |
| data-disabled |  |
| data-readonly |  |
| data-required |  |
| data-valid |  |
| data-invalid |  |
| data-dirty |  |
| data-touched |  |
| data-filled |  |
| data-focused |  |
| data-scrubbing |  |

#### CSS variables

Metadata status: unavailable.

<a id="api-4e756d6265724669656c642e47726f75702e50726f7073"></a>

<a id="numberfieldgroupprops"></a>

<a id="api-4e756d6265724669656c642e47726f75702e50726f70732e70726f703a616c69676e"></a>

### Related exported type: NumberField.Group.Props

Declaration: `packages/solid/build/types/number-field/group/NumberFieldGroup.d.ts:9`

#### Declaration

```typescript
NumberFieldGroupProps
```

<a id="api-4e756d6265724669656c642e47726f75702e50726f70732e636c617373"></a>

<a id="NumberFieldGroupProps-class"></a>

<a id="api-4e756d6265724669656c642e47726f75702e50726f70732e7374796c65"></a>

<a id="NumberFieldGroupProps-style"></a>

<a id="api-4e756d6265724669656c642e47726f75702e50726f70732e72656e646572"></a>

<a id="NumberFieldGroupProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<NumberFieldGroupState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<NumberFieldGroupState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, NumberFieldGroupState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4e756d6265724669656c642e47726f75702e5374617465"></a>

<a id="numberfieldgroupstate"></a>

### Related exported type: NumberField.Group.State

Declaration: `packages/solid/build/types/number-field/group/NumberFieldGroup.d.ts:10`

#### Declaration

```typescript
NumberFieldGroupState
```

<a id="api-4e756d6265724669656c642e47726f75702e53746174652e76616c7565"></a>

<a id="NumberFieldGroupState-value"></a>

<a id="api-4e756d6265724669656c642e47726f75702e53746174652e696e70757456616c7565"></a>

<a id="NumberFieldGroupState-inputValue"></a>

<a id="api-4e756d6265724669656c642e47726f75702e53746174652e6469727479"></a>

<a id="NumberFieldGroupState-dirty"></a>

<a id="api-4e756d6265724669656c642e47726f75702e53746174652e66696c6c6564"></a>

<a id="NumberFieldGroupState-filled"></a>

<a id="api-4e756d6265724669656c642e47726f75702e53746174652e666f6375736564"></a>

<a id="NumberFieldGroupState-focused"></a>

<a id="api-4e756d6265724669656c642e47726f75702e53746174652e736372756262696e67"></a>

<a id="NumberFieldGroupState-scrubbing"></a>

<a id="api-4e756d6265724669656c642e47726f75702e53746174652e746f7563686564"></a>

<a id="NumberFieldGroupState-touched"></a>

<a id="api-4e756d6265724669656c642e47726f75702e53746174652e64697361626c6564"></a>

<a id="NumberFieldGroupState-disabled"></a>

<a id="api-4e756d6265724669656c642e47726f75702e53746174652e726561644f6e6c79"></a>

<a id="NumberFieldGroupState-readOnly"></a>

<a id="api-4e756d6265724669656c642e47726f75702e53746174652e7265717569726564"></a>

<a id="NumberFieldGroupState-required"></a>

<a id="api-4e756d6265724669656c642e47726f75702e53746174652e76616c6964"></a>

<a id="NumberFieldGroupState-valid"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| value | `number \| null` | Yes | Unavailable |  |
| inputValue | `string` | Yes | Unavailable |  |
| dirty | `boolean` | Yes | Unavailable |  |
| filled | `boolean` | Yes | Unavailable |  |
| focused | `boolean` | Yes | Unavailable |  |
| scrubbing | `boolean` | Yes | Unavailable |  |
| touched | `boolean` | Yes | Unavailable |  |
| disabled | `boolean` | Yes | Unavailable |  |
| readOnly | `boolean` | Yes | Unavailable |  |
| required | `boolean` | Yes | Unavailable |  |
| valid | `boolean \| null` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="decrement"></a>

### Decrement

<a id="api-4e756d6265724669656c642e44656372656d656e74"></a>

<a id="numberfielddecrement"></a>

<a id="api-4e756d6265724669656c642e44656372656d656e742e2470726f70732e70726f703a64697361626c6564"></a>

<a id="api-4e756d6265724669656c642e44656372656d656e742e2470726f70732e70726f703a666f726d416374696f6e"></a>

<a id="api-4e756d6265724669656c642e44656372656d656e742e2470726f70732e70726f703a666f726d456e6374797065"></a>

<a id="api-4e756d6265724669656c642e44656372656d656e742e2470726f70732e70726f703a666f726d4d6574686f64"></a>

<a id="api-4e756d6265724669656c642e44656372656d656e742e2470726f70732e70726f703a666f726d4e6f56616c6964617465"></a>

<a id="api-4e756d6265724669656c642e44656372656d656e742e2470726f70732e70726f703a666f726d546172676574"></a>

<a id="api-4e756d6265724669656c642e44656372656d656e742e2470726f70732e70726f703a6e616d65"></a>

<a id="api-4e756d6265724669656c642e44656372656d656e742e2470726f70732e70726f703a706f706f766572546172676574416374696f6e"></a>

<a id="api-4e756d6265724669656c642e44656372656d656e742e2470726f70732e70726f703a706f706f766572546172676574456c656d656e74"></a>

<a id="api-4e756d6265724669656c642e44656372656d656e742e2470726f70732e70726f703a74797065"></a>

<a id="api-4e756d6265724669656c642e44656372656d656e742e2470726f70732e70726f703a76616c7565"></a>

### NumberField.Decrement

Declaration: `packages/solid/build/types/number-field/decrement/NumberFieldDecrement.d.ts:3`

#### Declaration

```typescript
(props: NumberFieldDecrement.Props) => JSX.Element
```

<a id="api-4e756d6265724669656c642e44656372656d656e742e2470726f70732e6e6174697665427574746f6e"></a>

<a id="NumberFieldDecrement-nativeButton"></a>

<a id="api-4e756d6265724669656c642e44656372656d656e742e2470726f70732e636c617373"></a>

<a id="NumberFieldDecrement-class"></a>

<a id="api-4e756d6265724669656c642e44656372656d656e742e2470726f70732e7374796c65"></a>

<a id="NumberFieldDecrement-style"></a>

<a id="api-4e756d6265724669656c642e44656372656d656e742e2470726f70732e72656e646572"></a>

<a id="NumberFieldDecrement-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| nativeButton | `boolean \| undefined` | No | true | Whether the rendered host is a native button. Set false when supplying a non-button host through render. |
| class | `JSX.ClassValue \| ((state: Readonly<NumberFieldRootState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<NumberFieldRootState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, NumberFieldRootState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `command`, `commandfor`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `disabled`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `form`, `formaction`, `formenctype`, `formmethod`, `formnovalidate`, `formtarget`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `name`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `popovertarget`, `popovertargetaction`, `prefix`, `prop:disabled`, `prop:formAction`, `prop:formEnctype`, `prop:formMethod`, `prop:formNoValidate`, `prop:formTarget`, `prop:name`, `prop:popoverTargetAction`, `prop:popoverTargetElement`, `prop:type`, `prop:value`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `type`, `typeof`, `value`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-4e756d6265724669656c6444656372656d656e7444617461417474726962757465732e64697361626c6564"></a>

<a id="api-4e756d6265724669656c6444656372656d656e7444617461417474726962757465732e726561646f6e6c79"></a>

<a id="api-4e756d6265724669656c6444656372656d656e7444617461417474726962757465732e7265717569726564"></a>

<a id="api-4e756d6265724669656c6444656372656d656e7444617461417474726962757465732e76616c6964"></a>

<a id="api-4e756d6265724669656c6444656372656d656e7444617461417474726962757465732e696e76616c6964"></a>

<a id="api-4e756d6265724669656c6444656372656d656e7444617461417474726962757465732e6469727479"></a>

<a id="api-4e756d6265724669656c6444656372656d656e7444617461417474726962757465732e746f7563686564"></a>

<a id="api-4e756d6265724669656c6444656372656d656e7444617461417474726962757465732e66696c6c6564"></a>

<a id="api-4e756d6265724669656c6444656372656d656e7444617461417474726962757465732e666f6375736564"></a>

<a id="api-4e756d6265724669656c6444656372656d656e7444617461417474726962757465732e736372756262696e67"></a>

| Name | Description |
| --- | --- |
| data-disabled |  |
| data-readonly |  |
| data-required |  |
| data-valid |  |
| data-invalid |  |
| data-dirty |  |
| data-touched |  |
| data-filled |  |
| data-focused |  |
| data-scrubbing |  |

#### CSS variables

Metadata status: unavailable.

<a id="api-4e756d6265724669656c642e44656372656d656e742e50726f7073"></a>

<a id="numberfielddecrementprops"></a>

<a id="api-4e756d6265724669656c642e44656372656d656e742e50726f70732e70726f703a64697361626c6564"></a>

<a id="api-4e756d6265724669656c642e44656372656d656e742e50726f70732e70726f703a666f726d416374696f6e"></a>

<a id="api-4e756d6265724669656c642e44656372656d656e742e50726f70732e70726f703a666f726d456e6374797065"></a>

<a id="api-4e756d6265724669656c642e44656372656d656e742e50726f70732e70726f703a666f726d4d6574686f64"></a>

<a id="api-4e756d6265724669656c642e44656372656d656e742e50726f70732e70726f703a666f726d4e6f56616c6964617465"></a>

<a id="api-4e756d6265724669656c642e44656372656d656e742e50726f70732e70726f703a666f726d546172676574"></a>

<a id="api-4e756d6265724669656c642e44656372656d656e742e50726f70732e70726f703a6e616d65"></a>

<a id="api-4e756d6265724669656c642e44656372656d656e742e50726f70732e70726f703a706f706f766572546172676574416374696f6e"></a>

<a id="api-4e756d6265724669656c642e44656372656d656e742e50726f70732e70726f703a706f706f766572546172676574456c656d656e74"></a>

<a id="api-4e756d6265724669656c642e44656372656d656e742e50726f70732e70726f703a74797065"></a>

<a id="api-4e756d6265724669656c642e44656372656d656e742e50726f70732e70726f703a76616c7565"></a>

### Related exported type: NumberField.Decrement.Props

Declaration: `packages/solid/build/types/number-field/decrement/NumberFieldDecrement.d.ts:9`

#### Declaration

```typescript
NumberFieldDecrementProps
```

<a id="api-4e756d6265724669656c642e44656372656d656e742e50726f70732e6e6174697665427574746f6e"></a>

<a id="NumberFieldDecrementProps-nativeButton"></a>

<a id="api-4e756d6265724669656c642e44656372656d656e742e50726f70732e636c617373"></a>

<a id="NumberFieldDecrementProps-class"></a>

<a id="api-4e756d6265724669656c642e44656372656d656e742e50726f70732e7374796c65"></a>

<a id="NumberFieldDecrementProps-style"></a>

<a id="api-4e756d6265724669656c642e44656372656d656e742e50726f70732e72656e646572"></a>

<a id="NumberFieldDecrementProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| nativeButton | `boolean \| undefined` | No | Unavailable | Whether the rendered host is a native button. Set false when supplying a non-button host through render. |
| class | `JSX.ClassValue \| ((state: Readonly<NumberFieldRootState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<NumberFieldRootState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, NumberFieldRootState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `command`, `commandfor`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `disabled`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `form`, `formaction`, `formenctype`, `formmethod`, `formnovalidate`, `formtarget`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `name`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `popovertarget`, `popovertargetaction`, `prefix`, `prop:disabled`, `prop:formAction`, `prop:formEnctype`, `prop:formMethod`, `prop:formNoValidate`, `prop:formTarget`, `prop:name`, `prop:popoverTargetAction`, `prop:popoverTargetElement`, `prop:type`, `prop:value`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `type`, `typeof`, `value`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4e756d6265724669656c642e44656372656d656e742e5374617465"></a>

<a id="numberfielddecrementstate"></a>

### Related exported type: NumberField.Decrement.State

Declaration: `packages/solid/build/types/number-field/decrement/NumberFieldDecrement.d.ts:10`

#### Declaration

```typescript
NumberFieldDecrementState
```

<a id="api-4e756d6265724669656c642e44656372656d656e742e53746174652e76616c7565"></a>

<a id="NumberFieldDecrementState-value"></a>

<a id="api-4e756d6265724669656c642e44656372656d656e742e53746174652e696e70757456616c7565"></a>

<a id="NumberFieldDecrementState-inputValue"></a>

<a id="api-4e756d6265724669656c642e44656372656d656e742e53746174652e6469727479"></a>

<a id="NumberFieldDecrementState-dirty"></a>

<a id="api-4e756d6265724669656c642e44656372656d656e742e53746174652e66696c6c6564"></a>

<a id="NumberFieldDecrementState-filled"></a>

<a id="api-4e756d6265724669656c642e44656372656d656e742e53746174652e666f6375736564"></a>

<a id="NumberFieldDecrementState-focused"></a>

<a id="api-4e756d6265724669656c642e44656372656d656e742e53746174652e736372756262696e67"></a>

<a id="NumberFieldDecrementState-scrubbing"></a>

<a id="api-4e756d6265724669656c642e44656372656d656e742e53746174652e746f7563686564"></a>

<a id="NumberFieldDecrementState-touched"></a>

<a id="api-4e756d6265724669656c642e44656372656d656e742e53746174652e64697361626c6564"></a>

<a id="NumberFieldDecrementState-disabled"></a>

<a id="api-4e756d6265724669656c642e44656372656d656e742e53746174652e726561644f6e6c79"></a>

<a id="NumberFieldDecrementState-readOnly"></a>

<a id="api-4e756d6265724669656c642e44656372656d656e742e53746174652e7265717569726564"></a>

<a id="NumberFieldDecrementState-required"></a>

<a id="api-4e756d6265724669656c642e44656372656d656e742e53746174652e76616c6964"></a>

<a id="NumberFieldDecrementState-valid"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| value | `number \| null` | Yes | Unavailable |  |
| inputValue | `string` | Yes | Unavailable |  |
| dirty | `boolean` | Yes | Unavailable |  |
| filled | `boolean` | Yes | Unavailable |  |
| focused | `boolean` | Yes | Unavailable |  |
| scrubbing | `boolean` | Yes | Unavailable |  |
| touched | `boolean` | Yes | Unavailable |  |
| disabled | `boolean` | Yes | Unavailable |  |
| readOnly | `boolean` | Yes | Unavailable |  |
| required | `boolean` | Yes | Unavailable |  |
| valid | `boolean \| null` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="input"></a>

### Input

<a id="api-4e756d6265724669656c642e496e707574"></a>

<a id="numberfieldinput"></a>

<a id="api-4e756d6265724669656c642e496e7075742e2470726f70732e70726f703a616363657074"></a>

<a id="api-4e756d6265724669656c642e496e7075742e2470726f70732e70726f703a616c69676e"></a>

<a id="api-4e756d6265724669656c642e496e7075742e2470726f70732e70726f703a616c74"></a>

<a id="api-4e756d6265724669656c642e496e7075742e2470726f70732e70726f703a6175746f636f6d706c657465"></a>

<a id="api-4e756d6265724669656c642e496e7075742e2470726f70732e70726f703a63617074757265"></a>

<a id="api-4e756d6265724669656c642e496e7075742e2470726f70732e70726f703a6469724e616d65"></a>

<a id="api-4e756d6265724669656c642e496e7075742e2470726f70732e70726f703a64697361626c6564"></a>

<a id="api-4e756d6265724669656c642e496e7075742e2470726f70732e70726f703a666f726d416374696f6e"></a>

<a id="api-4e756d6265724669656c642e496e7075742e2470726f70732e70726f703a666f726d456e6374797065"></a>

<a id="api-4e756d6265724669656c642e496e7075742e2470726f70732e70726f703a666f726d4d6574686f64"></a>

<a id="api-4e756d6265724669656c642e496e7075742e2470726f70732e70726f703a666f726d4e6f56616c6964617465"></a>

<a id="api-4e756d6265724669656c642e496e7075742e2470726f70732e70726f703a666f726d546172676574"></a>

<a id="api-4e756d6265724669656c642e496e7075742e2470726f70732e70726f703a686569676874"></a>

<a id="api-4e756d6265724669656c642e496e7075742e2470726f70732e70726f703a696e64657465726d696e617465"></a>

<a id="api-4e756d6265724669656c642e496e7075742e2470726f70732e70726f703a6d6178"></a>

<a id="api-4e756d6265724669656c642e496e7075742e2470726f70732e70726f703a6d61784c656e677468"></a>

<a id="api-4e756d6265724669656c642e496e7075742e2470726f70732e70726f703a6d696e"></a>

<a id="api-4e756d6265724669656c642e496e7075742e2470726f70732e70726f703a6d696e4c656e677468"></a>

<a id="api-4e756d6265724669656c642e496e7075742e2470726f70732e70726f703a6d756c7469706c65"></a>

<a id="api-4e756d6265724669656c642e496e7075742e2470726f70732e70726f703a6e616d65"></a>

<a id="api-4e756d6265724669656c642e496e7075742e2470726f70732e70726f703a7061747465726e"></a>

<a id="api-4e756d6265724669656c642e496e7075742e2470726f70732e70726f703a706c616365686f6c646572"></a>

<a id="api-4e756d6265724669656c642e496e7075742e2470726f70732e70726f703a706f706f766572546172676574416374696f6e"></a>

<a id="api-4e756d6265724669656c642e496e7075742e2470726f70732e70726f703a706f706f766572546172676574456c656d656e74"></a>

<a id="api-4e756d6265724669656c642e496e7075742e2470726f70732e70726f703a726561644f6e6c79"></a>

<a id="api-4e756d6265724669656c642e496e7075742e2470726f70732e70726f703a7265717569726564"></a>

<a id="api-4e756d6265724669656c642e496e7075742e2470726f70732e70726f703a73656c656374696f6e446972656374696f6e"></a>

<a id="api-4e756d6265724669656c642e496e7075742e2470726f70732e70726f703a73656c656374696f6e456e64"></a>

<a id="api-4e756d6265724669656c642e496e7075742e2470726f70732e70726f703a73656c656374696f6e5374617274"></a>

<a id="api-4e756d6265724669656c642e496e7075742e2470726f70732e70726f703a73697a65"></a>

<a id="api-4e756d6265724669656c642e496e7075742e2470726f70732e70726f703a737263"></a>

<a id="api-4e756d6265724669656c642e496e7075742e2470726f70732e70726f703a73746570"></a>

<a id="api-4e756d6265724669656c642e496e7075742e2470726f70732e70726f703a74797065"></a>

<a id="api-4e756d6265724669656c642e496e7075742e2470726f70732e70726f703a7573654d6170"></a>

<a id="api-4e756d6265724669656c642e496e7075742e2470726f70732e70726f703a76616c7565417344617465"></a>

<a id="api-4e756d6265724669656c642e496e7075742e2470726f70732e70726f703a76616c756541734e756d626572"></a>

<a id="api-4e756d6265724669656c642e496e7075742e2470726f70732e70726f703a7765626b69746469726563746f7279"></a>

<a id="api-4e756d6265724669656c642e496e7075742e2470726f70732e70726f703a7769647468"></a>

### NumberField.Input

Declaration: `packages/solid/build/types/number-field/input/NumberFieldInput.d.ts:4`

#### Declaration

```typescript
(props: NumberFieldInput.Props) => JSX.Element
```

<a id="api-4e756d6265724669656c642e496e7075742e2470726f70732e636c617373"></a>

<a id="NumberFieldInput-class"></a>

<a id="api-4e756d6265724669656c642e496e7075742e2470726f70732e7374796c65"></a>

<a id="NumberFieldInput-style"></a>

<a id="api-4e756d6265724669656c642e496e7075742e2470726f70732e72656e646572"></a>

<a id="NumberFieldInput-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<NumberFieldInputState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<NumberFieldInputState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<JSX.InputHTMLAttributes<HTMLInputElement> & JSX.Properties<HTMLInputElement>, NumberFieldInputState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accept`, `accesskey`, `align`, `alpha`, `alt`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocomplete`, `autocorrect`, `autofocus`, `capture`, `checked`, `children`, `colorspace`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `dirname`, `disabled`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `form`, `formaction`, `formenctype`, `formmethod`, `formnovalidate`, `formtarget`, `height`, `hidden`, `id`, `incremental`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `list`, `max`, `maxlength`, `min`, `minlength`, `multiple`, `name`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `pattern`, `placeholder`, `popover`, `popovertarget`, `popovertargetaction`, `prefix`, `prop:accept`, `prop:align`, `prop:alt`, `prop:autocomplete`, `prop:capture`, `prop:checked`, `prop:defaultChecked`, `prop:defaultValue`, `prop:dirName`, `prop:disabled`, `prop:formAction`, `prop:formEnctype`, `prop:formMethod`, `prop:formNoValidate`, `prop:formTarget`, `prop:height`, `prop:indeterminate`, `prop:max`, `prop:maxLength`, `prop:min`, `prop:minLength`, `prop:multiple`, `prop:name`, `prop:pattern`, `prop:placeholder`, `prop:popoverTargetAction`, `prop:popoverTargetElement`, `prop:readOnly`, `prop:required`, `prop:selectionDirection`, `prop:selectionEnd`, `prop:selectionStart`, `prop:size`, `prop:src`, `prop:step`, `prop:type`, `prop:useMap`, `prop:value`, `prop:valueAsDate`, `prop:valueAsNumber`, `prop:webkitdirectory`, `prop:width`, `property`, `readonly`, `ref`, `required`, `resource`, `results`, `role`, `size`, `slot`, `spellcheck`, `src`, `step`, `tabindex`, `textContent`, `title`, `translate`, `type`, `typeof`, `usemap`, `value`, `virtualkeyboardpolicy`, `vocab`, `webkitdirectory`, `width`, `writingsuggestions`

#### Data attributes

<a id="api-4e756d6265724669656c64496e70757444617461417474726962757465732e64697361626c6564"></a>

<a id="api-4e756d6265724669656c64496e70757444617461417474726962757465732e726561646f6e6c79"></a>

<a id="api-4e756d6265724669656c64496e70757444617461417474726962757465732e7265717569726564"></a>

<a id="api-4e756d6265724669656c64496e70757444617461417474726962757465732e76616c6964"></a>

<a id="api-4e756d6265724669656c64496e70757444617461417474726962757465732e696e76616c6964"></a>

<a id="api-4e756d6265724669656c64496e70757444617461417474726962757465732e6469727479"></a>

<a id="api-4e756d6265724669656c64496e70757444617461417474726962757465732e746f7563686564"></a>

<a id="api-4e756d6265724669656c64496e70757444617461417474726962757465732e66696c6c6564"></a>

<a id="api-4e756d6265724669656c64496e70757444617461417474726962757465732e666f6375736564"></a>

<a id="api-4e756d6265724669656c64496e70757444617461417474726962757465732e736372756262696e67"></a>

| Name | Description |
| --- | --- |
| data-disabled |  |
| data-readonly |  |
| data-required |  |
| data-valid |  |
| data-invalid |  |
| data-dirty |  |
| data-touched |  |
| data-filled |  |
| data-focused |  |
| data-scrubbing |  |

#### CSS variables

Metadata status: unavailable.

<a id="api-4e756d6265724669656c642e496e7075742e50726f7073"></a>

<a id="numberfieldinputprops"></a>

<a id="api-4e756d6265724669656c642e496e7075742e50726f70732e70726f703a616363657074"></a>

<a id="api-4e756d6265724669656c642e496e7075742e50726f70732e70726f703a616c69676e"></a>

<a id="api-4e756d6265724669656c642e496e7075742e50726f70732e70726f703a616c74"></a>

<a id="api-4e756d6265724669656c642e496e7075742e50726f70732e70726f703a6175746f636f6d706c657465"></a>

<a id="api-4e756d6265724669656c642e496e7075742e50726f70732e70726f703a63617074757265"></a>

<a id="api-4e756d6265724669656c642e496e7075742e50726f70732e70726f703a6469724e616d65"></a>

<a id="api-4e756d6265724669656c642e496e7075742e50726f70732e70726f703a64697361626c6564"></a>

<a id="api-4e756d6265724669656c642e496e7075742e50726f70732e70726f703a666f726d416374696f6e"></a>

<a id="api-4e756d6265724669656c642e496e7075742e50726f70732e70726f703a666f726d456e6374797065"></a>

<a id="api-4e756d6265724669656c642e496e7075742e50726f70732e70726f703a666f726d4d6574686f64"></a>

<a id="api-4e756d6265724669656c642e496e7075742e50726f70732e70726f703a666f726d4e6f56616c6964617465"></a>

<a id="api-4e756d6265724669656c642e496e7075742e50726f70732e70726f703a666f726d546172676574"></a>

<a id="api-4e756d6265724669656c642e496e7075742e50726f70732e70726f703a686569676874"></a>

<a id="api-4e756d6265724669656c642e496e7075742e50726f70732e70726f703a696e64657465726d696e617465"></a>

<a id="api-4e756d6265724669656c642e496e7075742e50726f70732e70726f703a6d6178"></a>

<a id="api-4e756d6265724669656c642e496e7075742e50726f70732e70726f703a6d61784c656e677468"></a>

<a id="api-4e756d6265724669656c642e496e7075742e50726f70732e70726f703a6d696e"></a>

<a id="api-4e756d6265724669656c642e496e7075742e50726f70732e70726f703a6d696e4c656e677468"></a>

<a id="api-4e756d6265724669656c642e496e7075742e50726f70732e70726f703a6d756c7469706c65"></a>

<a id="api-4e756d6265724669656c642e496e7075742e50726f70732e70726f703a6e616d65"></a>

<a id="api-4e756d6265724669656c642e496e7075742e50726f70732e70726f703a7061747465726e"></a>

<a id="api-4e756d6265724669656c642e496e7075742e50726f70732e70726f703a706c616365686f6c646572"></a>

<a id="api-4e756d6265724669656c642e496e7075742e50726f70732e70726f703a706f706f766572546172676574416374696f6e"></a>

<a id="api-4e756d6265724669656c642e496e7075742e50726f70732e70726f703a706f706f766572546172676574456c656d656e74"></a>

<a id="api-4e756d6265724669656c642e496e7075742e50726f70732e70726f703a726561644f6e6c79"></a>

<a id="api-4e756d6265724669656c642e496e7075742e50726f70732e70726f703a7265717569726564"></a>

<a id="api-4e756d6265724669656c642e496e7075742e50726f70732e70726f703a73656c656374696f6e446972656374696f6e"></a>

<a id="api-4e756d6265724669656c642e496e7075742e50726f70732e70726f703a73656c656374696f6e456e64"></a>

<a id="api-4e756d6265724669656c642e496e7075742e50726f70732e70726f703a73656c656374696f6e5374617274"></a>

<a id="api-4e756d6265724669656c642e496e7075742e50726f70732e70726f703a73697a65"></a>

<a id="api-4e756d6265724669656c642e496e7075742e50726f70732e70726f703a737263"></a>

<a id="api-4e756d6265724669656c642e496e7075742e50726f70732e70726f703a73746570"></a>

<a id="api-4e756d6265724669656c642e496e7075742e50726f70732e70726f703a74797065"></a>

<a id="api-4e756d6265724669656c642e496e7075742e50726f70732e70726f703a7573654d6170"></a>

<a id="api-4e756d6265724669656c642e496e7075742e50726f70732e70726f703a76616c7565417344617465"></a>

<a id="api-4e756d6265724669656c642e496e7075742e50726f70732e70726f703a76616c756541734e756d626572"></a>

<a id="api-4e756d6265724669656c642e496e7075742e50726f70732e70726f703a7765626b69746469726563746f7279"></a>

<a id="api-4e756d6265724669656c642e496e7075742e50726f70732e70726f703a7769647468"></a>

### Related exported type: NumberField.Input.Props

Declaration: `packages/solid/build/types/number-field/input/NumberFieldInput.d.ts:10`

#### Declaration

```typescript
NumberFieldInputProps
```

<a id="api-4e756d6265724669656c642e496e7075742e50726f70732e636c617373"></a>

<a id="NumberFieldInputProps-class"></a>

<a id="api-4e756d6265724669656c642e496e7075742e50726f70732e7374796c65"></a>

<a id="NumberFieldInputProps-style"></a>

<a id="api-4e756d6265724669656c642e496e7075742e50726f70732e72656e646572"></a>

<a id="NumberFieldInputProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<NumberFieldInputState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<NumberFieldInputState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<JSX.InputHTMLAttributes<HTMLInputElement> & JSX.Properties<HTMLInputElement>, NumberFieldInputState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accept`, `accesskey`, `align`, `alpha`, `alt`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocomplete`, `autocorrect`, `autofocus`, `capture`, `checked`, `children`, `colorspace`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `dirname`, `disabled`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `form`, `formaction`, `formenctype`, `formmethod`, `formnovalidate`, `formtarget`, `height`, `hidden`, `id`, `incremental`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `list`, `max`, `maxlength`, `min`, `minlength`, `multiple`, `name`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `pattern`, `placeholder`, `popover`, `popovertarget`, `popovertargetaction`, `prefix`, `prop:accept`, `prop:align`, `prop:alt`, `prop:autocomplete`, `prop:capture`, `prop:checked`, `prop:defaultChecked`, `prop:defaultValue`, `prop:dirName`, `prop:disabled`, `prop:formAction`, `prop:formEnctype`, `prop:formMethod`, `prop:formNoValidate`, `prop:formTarget`, `prop:height`, `prop:indeterminate`, `prop:max`, `prop:maxLength`, `prop:min`, `prop:minLength`, `prop:multiple`, `prop:name`, `prop:pattern`, `prop:placeholder`, `prop:popoverTargetAction`, `prop:popoverTargetElement`, `prop:readOnly`, `prop:required`, `prop:selectionDirection`, `prop:selectionEnd`, `prop:selectionStart`, `prop:size`, `prop:src`, `prop:step`, `prop:type`, `prop:useMap`, `prop:value`, `prop:valueAsDate`, `prop:valueAsNumber`, `prop:webkitdirectory`, `prop:width`, `property`, `readonly`, `ref`, `required`, `resource`, `results`, `role`, `size`, `slot`, `spellcheck`, `src`, `step`, `tabindex`, `textContent`, `title`, `translate`, `type`, `typeof`, `usemap`, `value`, `virtualkeyboardpolicy`, `vocab`, `webkitdirectory`, `width`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4e756d6265724669656c642e496e7075742e5374617465"></a>

<a id="numberfieldinputstate"></a>

### Related exported type: NumberField.Input.State

Declaration: `packages/solid/build/types/number-field/input/NumberFieldInput.d.ts:11`

#### Declaration

```typescript
NumberFieldInputState
```

<a id="api-4e756d6265724669656c642e496e7075742e53746174652e76616c7565"></a>

<a id="NumberFieldInputState-value"></a>

<a id="api-4e756d6265724669656c642e496e7075742e53746174652e696e70757456616c7565"></a>

<a id="NumberFieldInputState-inputValue"></a>

<a id="api-4e756d6265724669656c642e496e7075742e53746174652e6469727479"></a>

<a id="NumberFieldInputState-dirty"></a>

<a id="api-4e756d6265724669656c642e496e7075742e53746174652e66696c6c6564"></a>

<a id="NumberFieldInputState-filled"></a>

<a id="api-4e756d6265724669656c642e496e7075742e53746174652e666f6375736564"></a>

<a id="NumberFieldInputState-focused"></a>

<a id="api-4e756d6265724669656c642e496e7075742e53746174652e736372756262696e67"></a>

<a id="NumberFieldInputState-scrubbing"></a>

<a id="api-4e756d6265724669656c642e496e7075742e53746174652e746f7563686564"></a>

<a id="NumberFieldInputState-touched"></a>

<a id="api-4e756d6265724669656c642e496e7075742e53746174652e64697361626c6564"></a>

<a id="NumberFieldInputState-disabled"></a>

<a id="api-4e756d6265724669656c642e496e7075742e53746174652e726561644f6e6c79"></a>

<a id="NumberFieldInputState-readOnly"></a>

<a id="api-4e756d6265724669656c642e496e7075742e53746174652e7265717569726564"></a>

<a id="NumberFieldInputState-required"></a>

<a id="api-4e756d6265724669656c642e496e7075742e53746174652e76616c6964"></a>

<a id="NumberFieldInputState-valid"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| value | `number \| null` | Yes | Unavailable |  |
| inputValue | `string` | Yes | Unavailable |  |
| dirty | `boolean` | Yes | Unavailable |  |
| filled | `boolean` | Yes | Unavailable |  |
| focused | `boolean` | Yes | Unavailable |  |
| scrubbing | `boolean` | Yes | Unavailable |  |
| touched | `boolean` | Yes | Unavailable |  |
| disabled | `boolean` | Yes | Unavailable |  |
| readOnly | `boolean` | Yes | Unavailable |  |
| required | `boolean` | Yes | Unavailable |  |
| valid | `boolean \| null` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="increment"></a>

### Increment

<a id="api-4e756d6265724669656c642e496e6372656d656e74"></a>

<a id="numberfieldincrement"></a>

<a id="api-4e756d6265724669656c642e496e6372656d656e742e2470726f70732e70726f703a64697361626c6564"></a>

<a id="api-4e756d6265724669656c642e496e6372656d656e742e2470726f70732e70726f703a666f726d416374696f6e"></a>

<a id="api-4e756d6265724669656c642e496e6372656d656e742e2470726f70732e70726f703a666f726d456e6374797065"></a>

<a id="api-4e756d6265724669656c642e496e6372656d656e742e2470726f70732e70726f703a666f726d4d6574686f64"></a>

<a id="api-4e756d6265724669656c642e496e6372656d656e742e2470726f70732e70726f703a666f726d4e6f56616c6964617465"></a>

<a id="api-4e756d6265724669656c642e496e6372656d656e742e2470726f70732e70726f703a666f726d546172676574"></a>

<a id="api-4e756d6265724669656c642e496e6372656d656e742e2470726f70732e70726f703a6e616d65"></a>

<a id="api-4e756d6265724669656c642e496e6372656d656e742e2470726f70732e70726f703a706f706f766572546172676574416374696f6e"></a>

<a id="api-4e756d6265724669656c642e496e6372656d656e742e2470726f70732e70726f703a706f706f766572546172676574456c656d656e74"></a>

<a id="api-4e756d6265724669656c642e496e6372656d656e742e2470726f70732e70726f703a74797065"></a>

<a id="api-4e756d6265724669656c642e496e6372656d656e742e2470726f70732e70726f703a76616c7565"></a>

### NumberField.Increment

Declaration: `packages/solid/build/types/number-field/increment/NumberFieldIncrement.d.ts:3`

#### Declaration

```typescript
(props: NumberFieldIncrement.Props) => JSX.Element
```

<a id="api-4e756d6265724669656c642e496e6372656d656e742e2470726f70732e6e6174697665427574746f6e"></a>

<a id="NumberFieldIncrement-nativeButton"></a>

<a id="api-4e756d6265724669656c642e496e6372656d656e742e2470726f70732e636c617373"></a>

<a id="NumberFieldIncrement-class"></a>

<a id="api-4e756d6265724669656c642e496e6372656d656e742e2470726f70732e7374796c65"></a>

<a id="NumberFieldIncrement-style"></a>

<a id="api-4e756d6265724669656c642e496e6372656d656e742e2470726f70732e72656e646572"></a>

<a id="NumberFieldIncrement-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| nativeButton | `boolean \| undefined` | No | true | Whether the rendered host is a native button. Set false when supplying a non-button host through render. |
| class | `JSX.ClassValue \| ((state: Readonly<NumberFieldRootState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<NumberFieldRootState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, NumberFieldRootState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `command`, `commandfor`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `disabled`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `form`, `formaction`, `formenctype`, `formmethod`, `formnovalidate`, `formtarget`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `name`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `popovertarget`, `popovertargetaction`, `prefix`, `prop:disabled`, `prop:formAction`, `prop:formEnctype`, `prop:formMethod`, `prop:formNoValidate`, `prop:formTarget`, `prop:name`, `prop:popoverTargetAction`, `prop:popoverTargetElement`, `prop:type`, `prop:value`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `type`, `typeof`, `value`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-4e756d6265724669656c64496e6372656d656e7444617461417474726962757465732e64697361626c6564"></a>

<a id="api-4e756d6265724669656c64496e6372656d656e7444617461417474726962757465732e726561646f6e6c79"></a>

<a id="api-4e756d6265724669656c64496e6372656d656e7444617461417474726962757465732e7265717569726564"></a>

<a id="api-4e756d6265724669656c64496e6372656d656e7444617461417474726962757465732e76616c6964"></a>

<a id="api-4e756d6265724669656c64496e6372656d656e7444617461417474726962757465732e696e76616c6964"></a>

<a id="api-4e756d6265724669656c64496e6372656d656e7444617461417474726962757465732e6469727479"></a>

<a id="api-4e756d6265724669656c64496e6372656d656e7444617461417474726962757465732e746f7563686564"></a>

<a id="api-4e756d6265724669656c64496e6372656d656e7444617461417474726962757465732e66696c6c6564"></a>

<a id="api-4e756d6265724669656c64496e6372656d656e7444617461417474726962757465732e666f6375736564"></a>

<a id="api-4e756d6265724669656c64496e6372656d656e7444617461417474726962757465732e736372756262696e67"></a>

| Name | Description |
| --- | --- |
| data-disabled |  |
| data-readonly |  |
| data-required |  |
| data-valid |  |
| data-invalid |  |
| data-dirty |  |
| data-touched |  |
| data-filled |  |
| data-focused |  |
| data-scrubbing |  |

#### CSS variables

Metadata status: unavailable.

<a id="api-4e756d6265724669656c642e496e6372656d656e742e50726f7073"></a>

<a id="numberfieldincrementprops"></a>

<a id="api-4e756d6265724669656c642e496e6372656d656e742e50726f70732e70726f703a64697361626c6564"></a>

<a id="api-4e756d6265724669656c642e496e6372656d656e742e50726f70732e70726f703a666f726d416374696f6e"></a>

<a id="api-4e756d6265724669656c642e496e6372656d656e742e50726f70732e70726f703a666f726d456e6374797065"></a>

<a id="api-4e756d6265724669656c642e496e6372656d656e742e50726f70732e70726f703a666f726d4d6574686f64"></a>

<a id="api-4e756d6265724669656c642e496e6372656d656e742e50726f70732e70726f703a666f726d4e6f56616c6964617465"></a>

<a id="api-4e756d6265724669656c642e496e6372656d656e742e50726f70732e70726f703a666f726d546172676574"></a>

<a id="api-4e756d6265724669656c642e496e6372656d656e742e50726f70732e70726f703a6e616d65"></a>

<a id="api-4e756d6265724669656c642e496e6372656d656e742e50726f70732e70726f703a706f706f766572546172676574416374696f6e"></a>

<a id="api-4e756d6265724669656c642e496e6372656d656e742e50726f70732e70726f703a706f706f766572546172676574456c656d656e74"></a>

<a id="api-4e756d6265724669656c642e496e6372656d656e742e50726f70732e70726f703a74797065"></a>

<a id="api-4e756d6265724669656c642e496e6372656d656e742e50726f70732e70726f703a76616c7565"></a>

### Related exported type: NumberField.Increment.Props

Declaration: `packages/solid/build/types/number-field/increment/NumberFieldIncrement.d.ts:9`

#### Declaration

```typescript
NumberFieldIncrementProps
```

<a id="api-4e756d6265724669656c642e496e6372656d656e742e50726f70732e6e6174697665427574746f6e"></a>

<a id="NumberFieldIncrementProps-nativeButton"></a>

<a id="api-4e756d6265724669656c642e496e6372656d656e742e50726f70732e636c617373"></a>

<a id="NumberFieldIncrementProps-class"></a>

<a id="api-4e756d6265724669656c642e496e6372656d656e742e50726f70732e7374796c65"></a>

<a id="NumberFieldIncrementProps-style"></a>

<a id="api-4e756d6265724669656c642e496e6372656d656e742e50726f70732e72656e646572"></a>

<a id="NumberFieldIncrementProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| nativeButton | `boolean \| undefined` | No | Unavailable | Whether the rendered host is a native button. Set false when supplying a non-button host through render. |
| class | `JSX.ClassValue \| ((state: Readonly<NumberFieldRootState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<NumberFieldRootState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, NumberFieldRootState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `command`, `commandfor`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `disabled`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `form`, `formaction`, `formenctype`, `formmethod`, `formnovalidate`, `formtarget`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `name`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `popovertarget`, `popovertargetaction`, `prefix`, `prop:disabled`, `prop:formAction`, `prop:formEnctype`, `prop:formMethod`, `prop:formNoValidate`, `prop:formTarget`, `prop:name`, `prop:popoverTargetAction`, `prop:popoverTargetElement`, `prop:type`, `prop:value`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `type`, `typeof`, `value`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4e756d6265724669656c642e496e6372656d656e742e5374617465"></a>

<a id="numberfieldincrementstate"></a>

### Related exported type: NumberField.Increment.State

Declaration: `packages/solid/build/types/number-field/increment/NumberFieldIncrement.d.ts:10`

#### Declaration

```typescript
NumberFieldIncrementState
```

<a id="api-4e756d6265724669656c642e496e6372656d656e742e53746174652e76616c7565"></a>

<a id="NumberFieldIncrementState-value"></a>

<a id="api-4e756d6265724669656c642e496e6372656d656e742e53746174652e696e70757456616c7565"></a>

<a id="NumberFieldIncrementState-inputValue"></a>

<a id="api-4e756d6265724669656c642e496e6372656d656e742e53746174652e6469727479"></a>

<a id="NumberFieldIncrementState-dirty"></a>

<a id="api-4e756d6265724669656c642e496e6372656d656e742e53746174652e66696c6c6564"></a>

<a id="NumberFieldIncrementState-filled"></a>

<a id="api-4e756d6265724669656c642e496e6372656d656e742e53746174652e666f6375736564"></a>

<a id="NumberFieldIncrementState-focused"></a>

<a id="api-4e756d6265724669656c642e496e6372656d656e742e53746174652e736372756262696e67"></a>

<a id="NumberFieldIncrementState-scrubbing"></a>

<a id="api-4e756d6265724669656c642e496e6372656d656e742e53746174652e746f7563686564"></a>

<a id="NumberFieldIncrementState-touched"></a>

<a id="api-4e756d6265724669656c642e496e6372656d656e742e53746174652e64697361626c6564"></a>

<a id="NumberFieldIncrementState-disabled"></a>

<a id="api-4e756d6265724669656c642e496e6372656d656e742e53746174652e726561644f6e6c79"></a>

<a id="NumberFieldIncrementState-readOnly"></a>

<a id="api-4e756d6265724669656c642e496e6372656d656e742e53746174652e7265717569726564"></a>

<a id="NumberFieldIncrementState-required"></a>

<a id="api-4e756d6265724669656c642e496e6372656d656e742e53746174652e76616c6964"></a>

<a id="NumberFieldIncrementState-valid"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| value | `number \| null` | Yes | Unavailable |  |
| inputValue | `string` | Yes | Unavailable |  |
| dirty | `boolean` | Yes | Unavailable |  |
| filled | `boolean` | Yes | Unavailable |  |
| focused | `boolean` | Yes | Unavailable |  |
| scrubbing | `boolean` | Yes | Unavailable |  |
| touched | `boolean` | Yes | Unavailable |  |
| disabled | `boolean` | Yes | Unavailable |  |
| readOnly | `boolean` | Yes | Unavailable |  |
| required | `boolean` | Yes | Unavailable |  |
| valid | `boolean \| null` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

