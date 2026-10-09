<a id="tabs"></a>

# Tabs

A component for toggling between related panels on the same page.

[Open mounted Solid demo: tabs/hero](/solid/components/tabs)

<a id="anatomy"></a>

## Anatomy

Import the component and assemble its parts:

```tsx
import { Tabs } from '@unstyled-solid/base-ui/tabs';
<Tabs.Root>
  <Tabs.List>
    <Tabs.Tab />
    <Tabs.Indicator />
  </Tabs.List>
  <Tabs.Panel />
</Tabs.Root>;
```

<a id="examples"></a>

## Examples

<a id="animated-panels"></a>

### Animated panels

Animate panels as they activate using the `data-starting-style` and `data-ending-style` attributes.
The `data-activation-direction` attribute indicates which direction the newly active tab is relative to the previously active one, letting panels slide in from the correct side.

[Open mounted Solid demo: tabs/animated-panels](/solid/components/tabs)

<a id="links"></a>

### Links

Use the `render` prop and set `nativeButton={false}` on `<Tabs.Tab>` to render tabs as anchor elements.

```jsx
import { Tabs } from '@unstyled-solid/base-ui/tabs';
<Tabs.Root>
  <Tabs.List>
    <Tabs.Tab
      nativeButton={false}
      render={(renderProps) => <a {...renderProps} href="/overview" />}
      value="overview"
    >
      Overview
    </Tabs.Tab>
  </Tabs.List>
  {/* ... */}
</Tabs.Root>;
```

<a id="api-reference"></a>

## API reference

<a id="root"></a>

### Root

<a id="api-546162732e526f6f74"></a>

<a id="tabsroot"></a>

<a id="api-546162732e526f6f742e2470726f70732e70726f703a616c69676e"></a>

### Tabs.Root

Groups tabs and their panels. Renders a div.

Declaration: `packages/solid/build/types/tabs/root/TabsRoot.d.ts:5`

#### Declaration

```typescript
(componentProps: TabsRoot.Props) => JSX.Element
```

<a id="api-546162732e526f6f742e2470726f70732e64656661756c7456616c7565"></a>

<a id="TabsRoot-defaultValue"></a>

<a id="api-546162732e526f6f742e2470726f70732e76616c7565"></a>

<a id="TabsRoot-value"></a>

<a id="api-546162732e526f6f742e2470726f70732e6f6e56616c75654368616e6765"></a>

<a id="TabsRoot-onValueChange"></a>

<a id="api-546162732e526f6f742e2470726f70732e6f7269656e746174696f6e"></a>

<a id="TabsRoot-orientation"></a>

<a id="api-546162732e526f6f742e2470726f70732e636c617373"></a>

<a id="TabsRoot-class"></a>

<a id="api-546162732e526f6f742e2470726f70732e7374796c65"></a>

<a id="TabsRoot-style"></a>

<a id="api-546162732e526f6f742e2470726f70732e72656e646572"></a>

<a id="TabsRoot-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| defaultValue | `any` | No | Unavailable |  |
| value | `any` | No | Unavailable |  |
| onValueChange | `((value: TabsTab.Value, details: TabsRootChangeEventDetails) => void) \| undefined` | No | Unavailable |  |
| orientation | `TabsRootOrientation \| undefined` | No | 'horizontal' |  |
| class | `JSX.ClassValue \| ((state: Readonly<TabsRootState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<TabsRootState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, TabsRootState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-54616273526f6f7444617461417474726962757465732e6f7269656e746174696f6e"></a>

<a id="api-54616273526f6f7444617461417474726962757465732e61637469766174696f6e446972656374696f6e"></a>

| Name | Description |
| --- | --- |
| data-orientation |  |
| data-activation-direction |  |

#### CSS variables

Metadata status: unavailable.

<a id="api-546162732e526f6f742e50726f7073"></a>

<a id="tabsrootprops"></a>

<a id="api-546162732e526f6f742e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Tabs.Root.Props

Declaration: `packages/solid/build/types/tabs/root/TabsRoot.d.ts:22`

#### Declaration

```typescript
TabsRootProps
```

<a id="api-546162732e526f6f742e50726f70732e64656661756c7456616c7565"></a>

<a id="TabsRootProps-defaultValue"></a>

<a id="api-546162732e526f6f742e50726f70732e76616c7565"></a>

<a id="TabsRootProps-value"></a>

<a id="api-546162732e526f6f742e50726f70732e6f6e56616c75654368616e6765"></a>

<a id="TabsRootProps-onValueChange"></a>

<a id="api-546162732e526f6f742e50726f70732e6f7269656e746174696f6e"></a>

<a id="TabsRootProps-orientation"></a>

<a id="api-546162732e526f6f742e50726f70732e636c617373"></a>

<a id="TabsRootProps-class"></a>

<a id="api-546162732e526f6f742e50726f70732e7374796c65"></a>

<a id="TabsRootProps-style"></a>

<a id="api-546162732e526f6f742e50726f70732e72656e646572"></a>

<a id="TabsRootProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| defaultValue | `any` | No | Unavailable |  |
| value | `any` | No | Unavailable |  |
| onValueChange | `((value: TabsTab.Value, details: TabsRootChangeEventDetails) => void) \| undefined` | No | Unavailable |  |
| orientation | `TabsRootOrientation \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<TabsRootState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<TabsRootState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, TabsRootState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-546162732e526f6f742e5374617465"></a>

<a id="tabsrootstate"></a>

### Related exported type: Tabs.Root.State

Declaration: `packages/solid/build/types/tabs/root/TabsRoot.d.ts:23`

#### Declaration

```typescript
TabsRootState
```

<a id="api-546162732e526f6f742e53746174652e74616241637469766174696f6e446972656374696f6e"></a>

<a id="TabsRootState-tabActivationDirection"></a>

<a id="api-546162732e526f6f742e53746174652e6f7269656e746174696f6e"></a>

<a id="TabsRootState-orientation"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| tabActivationDirection | `TabsTabActivationDirection` | Yes | Unavailable |  |
| orientation | `TabsRootOrientation` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-546162732e526f6f742e4368616e67654576656e74526561736f6e"></a>

<a id="tabsrootchangeeventreason"></a>

### Related exported type: Tabs.Root.ChangeEventReason

Declaration: `packages/solid/build/types/tabs/root/TabsRoot.d.ts:25`

#### Declaration

```typescript
TabsRootChangeEventReason
```

Inherited DOM attributes: `__@iterator@106`, `anchor`, `at`, `big`, `blink`, `bold`, `charAt`, `charCodeAt`, `codePointAt`, `concat`, `endsWith`, `fixed`, `fontcolor`, `fontsize`, `includes`, `indexOf`, `isWellFormed`, `italics`, `lastIndexOf`, `length`, `link`, `localeCompare`, `match`, `matchAll`, `normalize`, `padEnd`, `padStart`, `repeat`, `replace`, `replaceAll`, `search`, `slice`, `small`, `split`, `startsWith`, `strike`, `sub`, `substr`, `substring`, `sup`, `toLocaleLowerCase`, `toLocaleUpperCase`, `toLowerCase`, `toString`, `toUpperCase`, `toWellFormed`, `trim`, `trimEnd`, `trimLeft`, `trimRight`, `trimStart`, `valueOf`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-546162732e526f6f742e4368616e67654576656e7444657461696c73"></a>

<a id="tabsrootchangeeventdetails"></a>

### Related exported type: Tabs.Root.ChangeEventDetails

Declaration: `packages/solid/build/types/tabs/root/TabsRoot.d.ts:26`

#### Declaration

```typescript
TabsRootChangeEventDetails
```

<a id="api-546162732e526f6f742e4368616e67654576656e7444657461696c732e61637469766174696f6e446972656374696f6e"></a>

<a id="TabsRootChangeEventDetails-activationDirection"></a>

<a id="api-546162732e526f6f742e4368616e67654576656e7444657461696c732e616c6c6f7750726f7061676174696f6e"></a>

<a id="TabsRootChangeEventDetails-allowPropagation"></a>

<a id="api-546162732e526f6f742e4368616e67654576656e7444657461696c732e63616e63656c"></a>

<a id="TabsRootChangeEventDetails-cancel"></a>

<a id="api-546162732e526f6f742e4368616e67654576656e7444657461696c732e6576656e74"></a>

<a id="TabsRootChangeEventDetails-event"></a>

<a id="api-546162732e526f6f742e4368616e67654576656e7444657461696c732e697343616e63656c6564"></a>

<a id="TabsRootChangeEventDetails-isCanceled"></a>

<a id="api-546162732e526f6f742e4368616e67654576656e7444657461696c732e697350726f7061676174696f6e416c6c6f776564"></a>

<a id="TabsRootChangeEventDetails-isPropagationAllowed"></a>

<a id="api-546162732e526f6f742e4368616e67654576656e7444657461696c732e726561736f6e"></a>

<a id="TabsRootChangeEventDetails-reason"></a>

<a id="api-546162732e526f6f742e4368616e67654576656e7444657461696c732e74726967676572"></a>

<a id="TabsRootChangeEventDetails-trigger"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| activationDirection | `TabsTabActivationDirection` | Yes | Unavailable |  |
| allowPropagation | `() => void` | Yes | Unavailable | Marks this change transaction as allowing propagation. |
| cancel | `() => void` | Yes | Unavailable | Cancels the Base UI change transaction; separate from the DOM event’s preventDefault() and preventBaseUIHandler(). |
| event | `Event` | Yes | Unavailable | Native DOM event associated with the change. Programmatic changes can use a Base UI-created Event. |
| isCanceled | `boolean` | Yes | Unavailable | Whether cancel() has been called for this change transaction. |
| isPropagationAllowed | `boolean` | Yes | Unavailable | Whether allowPropagation() has been called for this change transaction. |
| reason | `"none" \| "disabled" \| "initial" \| "missing"` | Yes | Unavailable | Reason for the requested change; it discriminates the native event type. |
| trigger | `Element \| undefined` | Yes | Unavailable | Trigger element associated with this change, when available. |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-546162732e526f6f742e4f7269656e746174696f6e"></a>

<a id="tabsrootorientation"></a>

### Related exported type: Tabs.Root.Orientation

Declaration: `packages/solid/build/types/tabs/root/TabsRoot.d.ts:24`

#### Declaration

```typescript
TabsRootOrientation
```

Inherited DOM attributes: `__@iterator@106`, `anchor`, `at`, `big`, `blink`, `bold`, `charAt`, `charCodeAt`, `codePointAt`, `concat`, `endsWith`, `fixed`, `fontcolor`, `fontsize`, `includes`, `indexOf`, `isWellFormed`, `italics`, `lastIndexOf`, `length`, `link`, `localeCompare`, `match`, `matchAll`, `normalize`, `padEnd`, `padStart`, `repeat`, `replace`, `replaceAll`, `search`, `slice`, `small`, `split`, `startsWith`, `strike`, `sub`, `substr`, `substring`, `sup`, `toLocaleLowerCase`, `toLocaleUpperCase`, `toLowerCase`, `toString`, `toUpperCase`, `toWellFormed`, `trim`, `trimEnd`, `trimLeft`, `trimRight`, `trimStart`, `valueOf`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="list"></a>

### List

<a id="api-546162732e4c697374"></a>

<a id="tabslist"></a>

<a id="api-546162732e4c6973742e2470726f70732e70726f703a616c69676e"></a>

### Tabs.List

Groups the tab buttons. Keyboard movement is owned by CompositeRoot.

Declaration: `packages/solid/build/types/tabs/list/TabsList.d.ts:4`

#### Declaration

```typescript
(componentProps: TabsList.Props) => JSX.Element
```

<a id="api-546162732e4c6973742e2470726f70732e61637469766174654f6e466f637573"></a>

<a id="TabsList-activateOnFocus"></a>

<a id="api-546162732e4c6973742e2470726f70732e6c6f6f70466f637573"></a>

<a id="TabsList-loopFocus"></a>

<a id="api-546162732e4c6973742e2470726f70732e636c617373"></a>

<a id="TabsList-class"></a>

<a id="api-546162732e4c6973742e2470726f70732e7374796c65"></a>

<a id="TabsList-style"></a>

<a id="api-546162732e4c6973742e2470726f70732e72656e646572"></a>

<a id="TabsList-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| activateOnFocus | `boolean \| undefined` | No | false |  |
| loopFocus | `boolean \| undefined` | No | true |  |
| class | `JSX.ClassValue \| ((state: Readonly<TabsListState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<TabsListState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, TabsListState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-546162734c69737444617461417474726962757465732e6f7269656e746174696f6e"></a>

<a id="api-546162734c69737444617461417474726962757465732e61637469766174696f6e446972656374696f6e"></a>

| Name | Description |
| --- | --- |
| data-orientation |  |
| data-activation-direction |  |

#### CSS variables

Metadata status: unavailable.

<a id="api-546162732e4c6973742e50726f7073"></a>

<a id="tabslistprops"></a>

<a id="api-546162732e4c6973742e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Tabs.List.Props

Declaration: `packages/solid/build/types/tabs/list/TabsList.d.ts:13`

#### Declaration

```typescript
TabsListProps
```

<a id="api-546162732e4c6973742e50726f70732e61637469766174654f6e466f637573"></a>

<a id="TabsListProps-activateOnFocus"></a>

<a id="api-546162732e4c6973742e50726f70732e6c6f6f70466f637573"></a>

<a id="TabsListProps-loopFocus"></a>

<a id="api-546162732e4c6973742e50726f70732e636c617373"></a>

<a id="TabsListProps-class"></a>

<a id="api-546162732e4c6973742e50726f70732e7374796c65"></a>

<a id="TabsListProps-style"></a>

<a id="api-546162732e4c6973742e50726f70732e72656e646572"></a>

<a id="TabsListProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| activateOnFocus | `boolean \| undefined` | No | Unavailable |  |
| loopFocus | `boolean \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<TabsListState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<TabsListState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, TabsListState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-546162732e4c6973742e5374617465"></a>

<a id="tabsliststate"></a>

### Related exported type: Tabs.List.State

Declaration: `packages/solid/build/types/tabs/list/TabsList.d.ts:12`

#### Declaration

```typescript
TabsListState
```

<a id="api-546162732e4c6973742e53746174652e74616241637469766174696f6e446972656374696f6e"></a>

<a id="TabsListState-tabActivationDirection"></a>

<a id="api-546162732e4c6973742e53746174652e6f7269656e746174696f6e"></a>

<a id="TabsListState-orientation"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| tabActivationDirection | `TabsTabActivationDirection` | Yes | Unavailable |  |
| orientation | `TabsRootOrientation` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="tab"></a>

### Tab

<a id="api-546162732e546162"></a>

<a id="tabstab"></a>

<a id="api-546162732e5461622e2470726f70732e70726f703a64697361626c6564"></a>

<a id="api-546162732e5461622e2470726f70732e70726f703a666f726d416374696f6e"></a>

<a id="api-546162732e5461622e2470726f70732e70726f703a666f726d456e6374797065"></a>

<a id="api-546162732e5461622e2470726f70732e70726f703a666f726d4d6574686f64"></a>

<a id="api-546162732e5461622e2470726f70732e70726f703a666f726d4e6f56616c6964617465"></a>

<a id="api-546162732e5461622e2470726f70732e70726f703a666f726d546172676574"></a>

<a id="api-546162732e5461622e2470726f70732e70726f703a6e616d65"></a>

<a id="api-546162732e5461622e2470726f70732e70726f703a706f706f766572546172676574416374696f6e"></a>

<a id="api-546162732e5461622e2470726f70732e70726f703a706f706f766572546172676574456c656d656e74"></a>

<a id="api-546162732e5461622e2470726f70732e70726f703a74797065"></a>

<a id="api-546162732e5461622e2470726f70732e70726f703a76616c7565"></a>

### Tabs.Tab

An interactive tab button; disabled tabs remain keyboard focusable.

Declaration: `packages/solid/build/types/tabs/tab/TabsTab.d.ts:4`

#### Declaration

```typescript
(componentProps: TabsTab.Props) => JSX.Element
```

<a id="api-546162732e5461622e2470726f70732e76616c7565"></a>

<a id="TabsTab-value"></a>

<a id="api-546162732e5461622e2470726f70732e6e6174697665427574746f6e"></a>

<a id="TabsTab-nativeButton"></a>

<a id="api-546162732e5461622e2470726f70732e64697361626c6564"></a>

<a id="TabsTab-disabled"></a>

<a id="api-546162732e5461622e2470726f70732e636c617373"></a>

<a id="TabsTab-class"></a>

<a id="api-546162732e5461622e2470726f70732e7374796c65"></a>

<a id="TabsTab-style"></a>

<a id="api-546162732e5461622e2470726f70732e72656e646572"></a>

<a id="TabsTab-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| value | `any` | Yes | Unavailable |  |
| nativeButton | `boolean \| undefined` | No | true |  |
| disabled | `boolean \| undefined` | No | false |  |
| class | `JSX.ClassValue \| ((state: Readonly<TabsTabState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<TabsTabState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, TabsTabState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `command`, `commandfor`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `form`, `formaction`, `formenctype`, `formmethod`, `formnovalidate`, `formtarget`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `name`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `popovertarget`, `popovertargetaction`, `prefix`, `prop:disabled`, `prop:formAction`, `prop:formEnctype`, `prop:formMethod`, `prop:formNoValidate`, `prop:formTarget`, `prop:name`, `prop:popoverTargetAction`, `prop:popoverTargetElement`, `prop:type`, `prop:value`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `type`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-5461627354616244617461417474726962757465732e6f7269656e746174696f6e"></a>

<a id="api-5461627354616244617461417474726962757465732e64697361626c6564"></a>

<a id="api-5461627354616244617461417474726962757465732e61637469766174696f6e446972656374696f6e"></a>

<a id="api-5461627354616244617461417474726962757465732e616374697665"></a>

| Name | Description |
| --- | --- |
| data-orientation |  |
| data-disabled |  |
| data-activation-direction |  |
| data-active |  |

#### CSS variables

Metadata status: unavailable.

<a id="api-546162732e5461622e56616c7565"></a>

<a id="tabstabvalue"></a>

### Related exported type: Tabs.Tab.Value

Declaration: `packages/solid/build/types/tabs/tab/TabsTab.d.ts:34`

#### Declaration

```typescript
any
```

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-546162732e5461622e41637469766174696f6e446972656374696f6e"></a>

<a id="tabstabactivationdirection"></a>

### Related exported type: Tabs.Tab.ActivationDirection

Declaration: `packages/solid/build/types/tabs/tab/TabsTab.d.ts:35`

#### Declaration

```typescript
TabsTabActivationDirection
```

Inherited DOM attributes: `__@iterator@106`, `anchor`, `at`, `big`, `blink`, `bold`, `charAt`, `charCodeAt`, `codePointAt`, `concat`, `endsWith`, `fixed`, `fontcolor`, `fontsize`, `includes`, `indexOf`, `isWellFormed`, `italics`, `lastIndexOf`, `length`, `link`, `localeCompare`, `match`, `matchAll`, `normalize`, `padEnd`, `padStart`, `repeat`, `replace`, `replaceAll`, `search`, `slice`, `small`, `split`, `startsWith`, `strike`, `sub`, `substr`, `substring`, `sup`, `toLocaleLowerCase`, `toLocaleUpperCase`, `toLowerCase`, `toString`, `toUpperCase`, `toWellFormed`, `trim`, `trimEnd`, `trimLeft`, `trimRight`, `trimStart`, `valueOf`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-546162732e5461622e4d65746164617461"></a>

<a id="tabstabmetadata"></a>

### Related exported type: Tabs.Tab.Metadata

Declaration: `packages/solid/build/types/tabs/tab/TabsTab.d.ts:36`

#### Declaration

```typescript
TabsTabMetadata
```

<a id="api-546162732e5461622e4d657461646174612e76616c7565"></a>

<a id="TabsTabMetadata-value"></a>

<a id="api-546162732e5461622e4d657461646174612e64697361626c6564"></a>

<a id="TabsTabMetadata-disabled"></a>

<a id="api-546162732e5461622e4d657461646174612e6964"></a>

<a id="TabsTabMetadata-id"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| value | `any` | Yes | Unavailable |  |
| disabled | `boolean` | Yes | Unavailable |  |
| id | `string \| undefined` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-546162732e5461622e506f736974696f6e"></a>

<a id="tabstabposition"></a>

### Related exported type: Tabs.Tab.Position

Declaration: `packages/solid/build/types/tabs/tab/TabsTab.d.ts:37`

#### Declaration

```typescript
TabsTabPosition
```

<a id="api-546162732e5461622e506f736974696f6e2e626f74746f6d"></a>

<a id="TabsTabPosition-bottom"></a>

<a id="api-546162732e5461622e506f736974696f6e2e6c656674"></a>

<a id="TabsTabPosition-left"></a>

<a id="api-546162732e5461622e506f736974696f6e2e7269676874"></a>

<a id="TabsTabPosition-right"></a>

<a id="api-546162732e5461622e506f736974696f6e2e746f70"></a>

<a id="TabsTabPosition-top"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| bottom | `number` | Yes | Unavailable |  |
| left | `number` | Yes | Unavailable |  |
| right | `number` | Yes | Unavailable |  |
| top | `number` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-546162732e5461622e50726f7073"></a>

<a id="tabstabprops"></a>

<a id="api-546162732e5461622e50726f70732e70726f703a64697361626c6564"></a>

<a id="api-546162732e5461622e50726f70732e70726f703a666f726d416374696f6e"></a>

<a id="api-546162732e5461622e50726f70732e70726f703a666f726d456e6374797065"></a>

<a id="api-546162732e5461622e50726f70732e70726f703a666f726d4d6574686f64"></a>

<a id="api-546162732e5461622e50726f70732e70726f703a666f726d4e6f56616c6964617465"></a>

<a id="api-546162732e5461622e50726f70732e70726f703a666f726d546172676574"></a>

<a id="api-546162732e5461622e50726f70732e70726f703a6e616d65"></a>

<a id="api-546162732e5461622e50726f70732e70726f703a706f706f766572546172676574416374696f6e"></a>

<a id="api-546162732e5461622e50726f70732e70726f703a706f706f766572546172676574456c656d656e74"></a>

<a id="api-546162732e5461622e50726f70732e70726f703a74797065"></a>

<a id="api-546162732e5461622e50726f70732e70726f703a76616c7565"></a>

### Related exported type: Tabs.Tab.Props

Declaration: `packages/solid/build/types/tabs/tab/TabsTab.d.ts:32`

#### Declaration

```typescript
TabsTabProps
```

<a id="api-546162732e5461622e50726f70732e76616c7565"></a>

<a id="TabsTabProps-value"></a>

<a id="api-546162732e5461622e50726f70732e6e6174697665427574746f6e"></a>

<a id="TabsTabProps-nativeButton"></a>

<a id="api-546162732e5461622e50726f70732e64697361626c6564"></a>

<a id="TabsTabProps-disabled"></a>

<a id="api-546162732e5461622e50726f70732e636c617373"></a>

<a id="TabsTabProps-class"></a>

<a id="api-546162732e5461622e50726f70732e7374796c65"></a>

<a id="TabsTabProps-style"></a>

<a id="api-546162732e5461622e50726f70732e72656e646572"></a>

<a id="TabsTabProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| value | `any` | Yes | Unavailable |  |
| nativeButton | `boolean \| undefined` | No | Unavailable |  |
| disabled | `boolean \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<TabsTabState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<TabsTabState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, TabsTabState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `command`, `commandfor`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `form`, `formaction`, `formenctype`, `formmethod`, `formnovalidate`, `formtarget`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `name`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `popovertarget`, `popovertargetaction`, `prefix`, `prop:disabled`, `prop:formAction`, `prop:formEnctype`, `prop:formMethod`, `prop:formNoValidate`, `prop:formTarget`, `prop:name`, `prop:popoverTargetAction`, `prop:popoverTargetElement`, `prop:type`, `prop:value`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `type`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-546162732e5461622e53697a65"></a>

<a id="tabstabsize"></a>

### Related exported type: Tabs.Tab.Size

Declaration: `packages/solid/build/types/tabs/tab/TabsTab.d.ts:38`

#### Declaration

```typescript
TabsTabSize
```

<a id="api-546162732e5461622e53697a652e686569676874"></a>

<a id="TabsTabSize-height"></a>

<a id="api-546162732e5461622e53697a652e7769647468"></a>

<a id="TabsTabSize-width"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| height | `number` | Yes | Unavailable |  |
| width | `number` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-546162732e5461622e5374617465"></a>

<a id="tabstabstate"></a>

### Related exported type: Tabs.Tab.State

Declaration: `packages/solid/build/types/tabs/tab/TabsTab.d.ts:33`

#### Declaration

```typescript
TabsTabState
```

<a id="api-546162732e5461622e53746174652e616374697665"></a>

<a id="TabsTabState-active"></a>

<a id="api-546162732e5461622e53746174652e74616241637469766174696f6e446972656374696f6e"></a>

<a id="TabsTabState-tabActivationDirection"></a>

<a id="api-546162732e5461622e53746174652e64697361626c6564"></a>

<a id="TabsTabState-disabled"></a>

<a id="api-546162732e5461622e53746174652e6f7269656e746174696f6e"></a>

<a id="TabsTabState-orientation"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| active | `boolean` | Yes | Unavailable |  |
| tabActivationDirection | `TabsTabActivationDirection` | Yes | Unavailable |  |
| disabled | `boolean` | Yes | Unavailable |  |
| orientation | `TabsRootOrientation` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="indicator"></a>

### Indicator

<a id="api-546162732e496e64696361746f72"></a>

<a id="tabsindicator"></a>

### Tabs.Indicator

Measures the selected tab in layout coordinates, retaining subpixel precision when safe.

Declaration: `packages/solid/build/types/tabs/indicator/TabsIndicator.d.ts:5`

#### Declaration

```typescript
(componentProps: TabsIndicator.Props) => JSX.Element
```

<a id="api-546162732e496e64696361746f722e2470726f70732e72656e6465724265666f7265487964726174696f6e"></a>

<a id="TabsIndicator-renderBeforeHydration"></a>

<a id="api-546162732e496e64696361746f722e2470726f70732e636c617373"></a>

<a id="TabsIndicator-class"></a>

<a id="api-546162732e496e64696361746f722e2470726f70732e7374796c65"></a>

<a id="TabsIndicator-style"></a>

<a id="api-546162732e496e64696361746f722e2470726f70732e72656e646572"></a>

<a id="TabsIndicator-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| renderBeforeHydration | `boolean \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<TabsIndicatorState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<TabsIndicatorState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, TabsIndicatorState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-54616273496e64696361746f7244617461417474726962757465732e6f7269656e746174696f6e"></a>

<a id="api-54616273496e64696361746f7244617461417474726962757465732e61637469766174696f6e446972656374696f6e"></a>

| Name | Description |
| --- | --- |
| data-orientation |  |
| data-activation-direction |  |

#### CSS variables

<a id="api-54616273496e64696361746f724373735661726961626c65732e616374697665546162426f74746f6d"></a>

<a id="api-54616273496e64696361746f724373735661726961626c65732e616374697665546162486569676874"></a>

<a id="api-54616273496e64696361746f724373735661726961626c65732e6163746976655461624c656674"></a>

<a id="api-54616273496e64696361746f724373735661726961626c65732e6163746976655461625269676874"></a>

<a id="api-54616273496e64696361746f724373735661726961626c65732e616374697665546162546f70"></a>

<a id="api-54616273496e64696361746f724373735661726961626c65732e6163746976655461625769647468"></a>

| Name | Description |
| --- | --- |
| --active-tab-bottom |  |
| --active-tab-height |  |
| --active-tab-left |  |
| --active-tab-right |  |
| --active-tab-top |  |
| --active-tab-width |  |

<a id="api-546162732e496e64696361746f722e50726f7073"></a>

<a id="tabsindicatorprops"></a>

### Related exported type: Tabs.Indicator.Props

Declaration: `packages/solid/build/types/tabs/indicator/TabsIndicator.d.ts:14`

#### Declaration

```typescript
TabsIndicatorProps
```

<a id="api-546162732e496e64696361746f722e50726f70732e72656e6465724265666f7265487964726174696f6e"></a>

<a id="TabsIndicatorProps-renderBeforeHydration"></a>

<a id="api-546162732e496e64696361746f722e50726f70732e636c617373"></a>

<a id="TabsIndicatorProps-class"></a>

<a id="api-546162732e496e64696361746f722e50726f70732e7374796c65"></a>

<a id="TabsIndicatorProps-style"></a>

<a id="api-546162732e496e64696361746f722e50726f70732e72656e646572"></a>

<a id="TabsIndicatorProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| renderBeforeHydration | `boolean \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<TabsIndicatorState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<TabsIndicatorState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, TabsIndicatorState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-546162732e496e64696361746f722e5374617465"></a>

<a id="tabsindicatorstate"></a>

### Related exported type: Tabs.Indicator.State

Declaration: `packages/solid/build/types/tabs/indicator/TabsIndicator.d.ts:15`

#### Declaration

```typescript
TabsIndicatorState
```

<a id="api-546162732e496e64696361746f722e53746174652e616374697665546162506f736974696f6e"></a>

<a id="TabsIndicatorState-activeTabPosition"></a>

<a id="api-546162732e496e64696361746f722e53746174652e61637469766554616253697a65"></a>

<a id="TabsIndicatorState-activeTabSize"></a>

<a id="api-546162732e496e64696361746f722e53746174652e74616241637469766174696f6e446972656374696f6e"></a>

<a id="TabsIndicatorState-tabActivationDirection"></a>

<a id="api-546162732e496e64696361746f722e53746174652e6f7269656e746174696f6e"></a>

<a id="TabsIndicatorState-orientation"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| activeTabPosition | `TabsTabPosition \| null` | Yes | Unavailable |  |
| activeTabSize | `TabsTabSize \| null` | Yes | Unavailable |  |
| tabActivationDirection | `TabsTabActivationDirection` | Yes | Unavailable |  |
| orientation | `TabsRootOrientation` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="panel"></a>

### Panel

<a id="api-546162732e50616e656c"></a>

<a id="tabspanel"></a>

<a id="api-546162732e50616e656c2e2470726f70732e70726f703a616c69676e"></a>

### Tabs.Panel

A panel retained until its exit animation completes.

Declaration: `packages/solid/build/types/tabs/panel/TabsPanel.d.ts:6`

#### Declaration

```typescript
(componentProps: TabsPanel.Props) => JSX.Element
```

<a id="api-546162732e50616e656c2e2470726f70732e76616c7565"></a>

<a id="TabsPanel-value"></a>

<a id="api-546162732e50616e656c2e2470726f70732e636c617373"></a>

<a id="TabsPanel-class"></a>

<a id="api-546162732e50616e656c2e2470726f70732e7374796c65"></a>

<a id="TabsPanel-style"></a>

<a id="api-546162732e50616e656c2e2470726f70732e6b6565704d6f756e746564"></a>

<a id="TabsPanel-keepMounted"></a>

<a id="api-546162732e50616e656c2e2470726f70732e72656e646572"></a>

<a id="TabsPanel-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| value | `any` | Yes | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<TabsPanelState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<TabsPanelState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| keepMounted | `boolean \| undefined` | No | false |  |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, TabsPanelState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-5461627350616e656c44617461417474726962757465732e6f7269656e746174696f6e"></a>

<a id="api-5461627350616e656c44617461417474726962757465732e61637469766174696f6e446972656374696f6e"></a>

<a id="api-5461627350616e656c44617461417474726962757465732e68696464656e"></a>

<a id="api-5461627350616e656c44617461417474726962757465732e696e646578"></a>

<a id="api-5461627350616e656c44617461417474726962757465732e7374617274696e675374796c65"></a>

<a id="api-5461627350616e656c44617461417474726962757465732e656e64696e675374796c65"></a>

| Name | Description |
| --- | --- |
| data-orientation |  |
| data-activation-direction |  |
| data-hidden |  |
| data-index |  |
| data-starting-style |  |
| data-ending-style |  |

#### CSS variables

Metadata status: unavailable.

<a id="api-546162732e50616e656c2e50726f7073"></a>

<a id="tabspanelprops"></a>

<a id="api-546162732e50616e656c2e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Tabs.Panel.Props

Declaration: `packages/solid/build/types/tabs/panel/TabsPanel.d.ts:20`

#### Declaration

```typescript
TabsPanelProps
```

<a id="api-546162732e50616e656c2e50726f70732e76616c7565"></a>

<a id="TabsPanelProps-value"></a>

<a id="api-546162732e50616e656c2e50726f70732e636c617373"></a>

<a id="TabsPanelProps-class"></a>

<a id="api-546162732e50616e656c2e50726f70732e7374796c65"></a>

<a id="TabsPanelProps-style"></a>

<a id="api-546162732e50616e656c2e50726f70732e6b6565704d6f756e746564"></a>

<a id="TabsPanelProps-keepMounted"></a>

<a id="api-546162732e50616e656c2e50726f70732e72656e646572"></a>

<a id="TabsPanelProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| value | `any` | Yes | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<TabsPanelState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<TabsPanelState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| keepMounted | `boolean \| undefined` | No | Unavailable |  |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, TabsPanelState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-546162732e50616e656c2e5374617465"></a>

<a id="tabspanelstate"></a>

### Related exported type: Tabs.Panel.State

Declaration: `packages/solid/build/types/tabs/panel/TabsPanel.d.ts:21`

#### Declaration

```typescript
TabsPanelState
```

<a id="api-546162732e50616e656c2e53746174652e68696464656e"></a>

<a id="TabsPanelState-hidden"></a>

<a id="api-546162732e50616e656c2e53746174652e74616241637469766174696f6e446972656374696f6e"></a>

<a id="TabsPanelState-tabActivationDirection"></a>

<a id="api-546162732e50616e656c2e53746174652e7472616e736974696f6e537461747573"></a>

<a id="TabsPanelState-transitionStatus"></a>

<a id="api-546162732e50616e656c2e53746174652e6f7269656e746174696f6e"></a>

<a id="TabsPanelState-orientation"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| hidden | `boolean` | Yes | Unavailable |  |
| tabActivationDirection | `TabsTabActivationDirection` | Yes | Unavailable |  |
| transitionStatus | `TransitionStatus` | Yes | Unavailable |  |
| orientation | `TabsRootOrientation` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-546162732e50616e656c2e4d65746164617461"></a>

<a id="tabspanelmetadata"></a>

### Related exported type: Tabs.Panel.Metadata

Declaration: `packages/solid/build/types/tabs/panel/TabsPanel.d.ts:22`

#### Declaration

```typescript
TabsPanelMetadata
```

<a id="api-546162732e50616e656c2e4d657461646174612e76616c7565"></a>

<a id="TabsPanelMetadata-value"></a>

<a id="api-546162732e50616e656c2e4d657461646174612e6964"></a>

<a id="TabsPanelMetadata-id"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| value | `any` | Yes | Unavailable |  |
| id | `string \| undefined` | No | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

