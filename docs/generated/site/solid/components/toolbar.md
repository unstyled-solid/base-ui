<a id="toolbar"></a>

# Toolbar

A container for grouping a set of buttons and controls.

[Open mounted Solid demo: toolbar/hero](/solid/components/toolbar)

<a id="usage-guidelines"></a>

## Usage guidelines

To ensure that toolbars are accessible and helpful, follow these guidelines:

- **Use inputs sparingly**: Left and right arrow keys are used to both move the text insertion cursor in an input, and to navigate among controls in horizontal toolbars. When using an input in a horizontal toolbar, use only one and place it as the last element of the toolbar.

<a id="anatomy"></a>

## Anatomy

Import the component and assemble its parts:

```tsx
import { Toolbar } from '@unstyled-solid/base-ui/toolbar';
<Toolbar.Root>
  <Toolbar.Button />
  <Toolbar.Link />
  <Toolbar.Separator />
  <Toolbar.Group>
    <Toolbar.Button />
    <Toolbar.Button />
  </Toolbar.Group>
  <Toolbar.Input />
</Toolbar.Root>;
```

<a id="examples"></a>

## Examples

<a id="using-with-menu"></a>

### Using with Menu

All Base UI popup components that provide a `Trigger` component can be integrated with a toolbar by passing the trigger to `<Toolbar.Button>` with the `render` prop:

```tsx
return (
  <Toolbar.Root>
    <Menu.Root>
      <Toolbar.Button render={(renderProps) => <Menu.Trigger {...renderProps} />} />
      <Menu.Portal>{/* Compose the rest of the menu */}</Menu.Portal>
    </Menu.Root>
  </Toolbar.Root>
);
```

This applies to `<AlertDialog>`, `<Dialog>`, `<Menu>`, `<Popover>`, and `<Select>`.

<a id="using-with-tooltip"></a>

### Using with Tooltip

Unlike other popups, the toolbar item should be passed to the `render` prop of `<Tooltip.Trigger>`:

```tsx
return (
  <Toolbar.Root>
    <Tooltip.Root>
      <Tooltip.Trigger
        render={(renderProps) => <Toolbar.Button {...renderProps} />}
      />
      <Tooltip.Portal>{/* Compose the rest of the tooltip */}</Tooltip.Portal>
    </Tooltip.Root>
  </Toolbar.Root>
);
```

<a id="using-with-numberfield"></a>

### Using with NumberField

To use a NumberField in the toolbar, pass `<NumberField.Input>` to `<Toolbar.Input>` using the `render` prop:

```tsx
return (
  <Toolbar.Root>
    <NumberField.Root>
      <NumberField.Group>
        <NumberField.Decrement />

        <Toolbar.Input
          render={(renderProps) => <NumberField.Input {...renderProps} />}
        />
        <NumberField.Increment />
      </NumberField.Group>
    </NumberField.Root>
  </Toolbar.Root>
);
```

<a id="api-reference"></a>

## API reference

<a id="root"></a>

### Root

<a id="api-546f6f6c6261722e526f6f74"></a>

<a id="toolbarroot"></a>

<a id="api-546f6f6c6261722e526f6f742e2470726f70732e70726f703a616c69676e"></a>

### Toolbar.Root

Groups controls into one ordered, roving-focus toolbar.

Declaration: `packages/solid/build/types/toolbar/root/ToolbarRoot.d.ts:3`

#### Declaration

```typescript
(componentProps: ToolbarRootProps) => JSX.Element
```

<a id="api-546f6f6c6261722e526f6f742e2470726f70732e6c6f6f70466f637573"></a>

<a id="ToolbarRoot-loopFocus"></a>

<a id="api-546f6f6c6261722e526f6f742e2470726f70732e64697361626c6564"></a>

<a id="ToolbarRoot-disabled"></a>

<a id="api-546f6f6c6261722e526f6f742e2470726f70732e6f7269656e746174696f6e"></a>

<a id="ToolbarRoot-orientation"></a>

<a id="api-546f6f6c6261722e526f6f742e2470726f70732e636c617373"></a>

<a id="ToolbarRoot-class"></a>

<a id="api-546f6f6c6261722e526f6f742e2470726f70732e7374796c65"></a>

<a id="ToolbarRoot-style"></a>

<a id="api-546f6f6c6261722e526f6f742e2470726f70732e72656e646572"></a>

<a id="ToolbarRoot-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| loopFocus | `boolean \| undefined` | No | true | Wrap keyboard focus at the ends. |
| disabled | `boolean \| undefined` | No | false |  |
| orientation | `Orientation \| undefined` | No | 'horizontal' |  |
| class | `JSX.ClassValue \| ((state: Readonly<ToolbarRootState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ToolbarRootState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ToolbarRootState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-546f6f6c626172526f6f7444617461417474726962757465732e6f7269656e746174696f6e"></a>

<a id="api-546f6f6c626172526f6f7444617461417474726962757465732e64697361626c6564"></a>

| Name | Description |
| --- | --- |
| data-orientation | The toolbar orientation: horizontal or vertical. |
| data-disabled | Present when the toolbar is disabled. |

#### CSS variables

Metadata status: unavailable.

<a id="api-546f6f6c6261722e526f6f742e50726f7073"></a>

<a id="toolbarrootprops"></a>

<a id="api-546f6f6c6261722e526f6f742e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Toolbar.Root.Props

Declaration: `packages/solid/build/types/toolbar/root/ToolbarRoot.d.ts:24`

#### Declaration

```typescript
ToolbarRootProps
```

<a id="api-546f6f6c6261722e526f6f742e50726f70732e6c6f6f70466f637573"></a>

<a id="ToolbarRootProps-loopFocus"></a>

<a id="api-546f6f6c6261722e526f6f742e50726f70732e64697361626c6564"></a>

<a id="ToolbarRootProps-disabled"></a>

<a id="api-546f6f6c6261722e526f6f742e50726f70732e6f7269656e746174696f6e"></a>

<a id="ToolbarRootProps-orientation"></a>

<a id="api-546f6f6c6261722e526f6f742e50726f70732e636c617373"></a>

<a id="ToolbarRootProps-class"></a>

<a id="api-546f6f6c6261722e526f6f742e50726f70732e7374796c65"></a>

<a id="ToolbarRootProps-style"></a>

<a id="api-546f6f6c6261722e526f6f742e50726f70732e72656e646572"></a>

<a id="ToolbarRootProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| loopFocus | `boolean \| undefined` | No | true | Wrap keyboard focus at the ends. |
| disabled | `boolean \| undefined` | No | Unavailable |  |
| orientation | `Orientation \| undefined` | No | 'horizontal' |  |
| class | `JSX.ClassValue \| ((state: Readonly<ToolbarRootState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ToolbarRootState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ToolbarRootState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-546f6f6c6261722e526f6f742e5374617465"></a>

<a id="toolbarrootstate"></a>

### Related exported type: Toolbar.Root.State

Declaration: `packages/solid/build/types/toolbar/root/ToolbarRoot.d.ts:23`

#### Declaration

```typescript
ToolbarRootState
```

<a id="api-546f6f6c6261722e526f6f742e53746174652e64697361626c6564"></a>

<a id="ToolbarRootState-disabled"></a>

<a id="api-546f6f6c6261722e526f6f742e53746174652e6f7269656e746174696f6e"></a>

<a id="ToolbarRootState-orientation"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| disabled | `boolean` | Yes | Unavailable |  |
| orientation | `Orientation` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-546f6f6c6261722e526f6f742e4f7269656e746174696f6e"></a>

<a id="toolbarrootorientation"></a>

### Related exported type: Toolbar.Root.Orientation

Declaration: `packages/solid/build/types/toolbar/root/ToolbarRoot.d.ts:22`

#### Declaration

```typescript
Orientation
```

Inherited DOM attributes: `__@iterator@106`, `anchor`, `at`, `big`, `blink`, `bold`, `charAt`, `charCodeAt`, `codePointAt`, `concat`, `endsWith`, `fixed`, `fontcolor`, `fontsize`, `includes`, `indexOf`, `isWellFormed`, `italics`, `lastIndexOf`, `length`, `link`, `localeCompare`, `match`, `matchAll`, `normalize`, `padEnd`, `padStart`, `repeat`, `replace`, `replaceAll`, `search`, `slice`, `small`, `split`, `startsWith`, `strike`, `sub`, `substr`, `substring`, `sup`, `toLocaleLowerCase`, `toLocaleUpperCase`, `toLowerCase`, `toString`, `toUpperCase`, `toWellFormed`, `trim`, `trimEnd`, `trimLeft`, `trimRight`, `trimStart`, `valueOf`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-546f6f6c6261722e526f6f742e4974656d4d65746164617461"></a>

<a id="toolbarrootitemmetadata"></a>

### Related exported type: Toolbar.Root.ItemMetadata

Declaration: `packages/solid/build/types/toolbar/root/ToolbarRoot.d.ts:21`

#### Declaration

```typescript
ToolbarRootItemMetadata
```

<a id="api-546f6f6c6261722e526f6f742e4974656d4d657461646174612e666f63757361626c655768656e44697361626c6564"></a>

<a id="ToolbarRootItemMetadata-focusableWhenDisabled"></a>

<a id="api-546f6f6c6261722e526f6f742e4974656d4d657461646174612e64697361626c6564"></a>

<a id="ToolbarRootItemMetadata-disabled"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| focusableWhenDisabled | `boolean` | Yes | Unavailable |  |
| disabled | `boolean` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="button"></a>

### Button

<a id="api-546f6f6c6261722e427574746f6e"></a>

<a id="toolbarbutton"></a>

<a id="api-546f6f6c6261722e427574746f6e2e2470726f70732e70726f703a64697361626c6564"></a>

<a id="api-546f6f6c6261722e427574746f6e2e2470726f70732e70726f703a666f726d416374696f6e"></a>

<a id="api-546f6f6c6261722e427574746f6e2e2470726f70732e70726f703a666f726d456e6374797065"></a>

<a id="api-546f6f6c6261722e427574746f6e2e2470726f70732e70726f703a666f726d4d6574686f64"></a>

<a id="api-546f6f6c6261722e427574746f6e2e2470726f70732e70726f703a666f726d4e6f56616c6964617465"></a>

<a id="api-546f6f6c6261722e427574746f6e2e2470726f70732e70726f703a666f726d546172676574"></a>

<a id="api-546f6f6c6261722e427574746f6e2e2470726f70732e70726f703a6e616d65"></a>

<a id="api-546f6f6c6261722e427574746f6e2e2470726f70732e70726f703a706f706f766572546172676574416374696f6e"></a>

<a id="api-546f6f6c6261722e427574746f6e2e2470726f70732e70726f703a706f706f766572546172676574456c656d656e74"></a>

<a id="api-546f6f6c6261722e427574746f6e2e2470726f70732e70726f703a74797065"></a>

<a id="api-546f6f6c6261722e427574746f6e2e2470726f70732e70726f703a76616c7565"></a>

### Toolbar.Button

A toolbar button, also composable with another control's render callback.

Declaration: `packages/solid/build/types/toolbar/button/ToolbarButton.d.ts:4`

#### Declaration

```typescript
(componentProps: ToolbarButtonProps) => JSX.Element
```

<a id="api-546f6f6c6261722e427574746f6e2e2470726f70732e666f63757361626c655768656e44697361626c6564"></a>

<a id="ToolbarButton-focusableWhenDisabled"></a>

<a id="api-546f6f6c6261722e427574746f6e2e2470726f70732e6e6174697665427574746f6e"></a>

<a id="ToolbarButton-nativeButton"></a>

<a id="api-546f6f6c6261722e427574746f6e2e2470726f70732e64697361626c6564"></a>

<a id="ToolbarButton-disabled"></a>

<a id="api-546f6f6c6261722e427574746f6e2e2470726f70732e636c617373"></a>

<a id="ToolbarButton-class"></a>

<a id="api-546f6f6c6261722e427574746f6e2e2470726f70732e7374796c65"></a>

<a id="ToolbarButton-style"></a>

<a id="api-546f6f6c6261722e427574746f6e2e2470726f70732e72656e646572"></a>

<a id="ToolbarButton-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| focusableWhenDisabled | `boolean \| undefined` | No | true | Keep disabled buttons in roving focus. |
| nativeButton | `boolean \| undefined` | No | true | Whether the rendered element is a native button. |
| disabled | `boolean \| undefined` | No | false |  |
| class | `JSX.ClassValue \| ((state: Readonly<ToolbarButtonState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ToolbarButtonState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ToolbarButtonState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `command`, `commandfor`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `form`, `formaction`, `formenctype`, `formmethod`, `formnovalidate`, `formtarget`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `name`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `popovertarget`, `popovertargetaction`, `prefix`, `prop:disabled`, `prop:formAction`, `prop:formEnctype`, `prop:formMethod`, `prop:formNoValidate`, `prop:formTarget`, `prop:name`, `prop:popoverTargetAction`, `prop:popoverTargetElement`, `prop:type`, `prop:value`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `type`, `typeof`, `value`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-546f6f6c626172427574746f6e44617461417474726962757465732e6f7269656e746174696f6e"></a>

<a id="api-546f6f6c626172427574746f6e44617461417474726962757465732e64697361626c6564"></a>

<a id="api-546f6f6c626172427574746f6e44617461417474726962757465732e666f63757361626c65"></a>

| Name | Description |
| --- | --- |
| data-orientation |  |
| data-disabled |  |
| data-focusable |  |

#### CSS variables

Metadata status: unavailable.

<a id="api-546f6f6c6261722e427574746f6e2e50726f7073"></a>

<a id="toolbarbuttonprops"></a>

<a id="api-546f6f6c6261722e427574746f6e2e50726f70732e70726f703a64697361626c6564"></a>

<a id="api-546f6f6c6261722e427574746f6e2e50726f70732e70726f703a666f726d416374696f6e"></a>

<a id="api-546f6f6c6261722e427574746f6e2e50726f70732e70726f703a666f726d456e6374797065"></a>

<a id="api-546f6f6c6261722e427574746f6e2e50726f70732e70726f703a666f726d4d6574686f64"></a>

<a id="api-546f6f6c6261722e427574746f6e2e50726f70732e70726f703a666f726d4e6f56616c6964617465"></a>

<a id="api-546f6f6c6261722e427574746f6e2e50726f70732e70726f703a666f726d546172676574"></a>

<a id="api-546f6f6c6261722e427574746f6e2e50726f70732e70726f703a6e616d65"></a>

<a id="api-546f6f6c6261722e427574746f6e2e50726f70732e70726f703a706f706f766572546172676574416374696f6e"></a>

<a id="api-546f6f6c6261722e427574746f6e2e50726f70732e70726f703a706f706f766572546172676574456c656d656e74"></a>

<a id="api-546f6f6c6261722e427574746f6e2e50726f70732e70726f703a74797065"></a>

<a id="api-546f6f6c6261722e427574746f6e2e50726f70732e70726f703a76616c7565"></a>

### Related exported type: Toolbar.Button.Props

Declaration: `packages/solid/build/types/toolbar/button/ToolbarButton.d.ts:17`

#### Declaration

```typescript
ToolbarButtonProps
```

<a id="api-546f6f6c6261722e427574746f6e2e50726f70732e666f63757361626c655768656e44697361626c6564"></a>

<a id="ToolbarButtonProps-focusableWhenDisabled"></a>

<a id="api-546f6f6c6261722e427574746f6e2e50726f70732e6e6174697665427574746f6e"></a>

<a id="ToolbarButtonProps-nativeButton"></a>

<a id="api-546f6f6c6261722e427574746f6e2e50726f70732e64697361626c6564"></a>

<a id="ToolbarButtonProps-disabled"></a>

<a id="api-546f6f6c6261722e427574746f6e2e50726f70732e636c617373"></a>

<a id="ToolbarButtonProps-class"></a>

<a id="api-546f6f6c6261722e427574746f6e2e50726f70732e7374796c65"></a>

<a id="ToolbarButtonProps-style"></a>

<a id="api-546f6f6c6261722e427574746f6e2e50726f70732e72656e646572"></a>

<a id="ToolbarButtonProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| focusableWhenDisabled | `boolean \| undefined` | No | true | Keep disabled buttons in roving focus. |
| nativeButton | `boolean \| undefined` | No | true | Whether the rendered element is a native button. |
| disabled | `boolean \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<ToolbarButtonState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ToolbarButtonState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ToolbarButtonState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `command`, `commandfor`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `form`, `formaction`, `formenctype`, `formmethod`, `formnovalidate`, `formtarget`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `name`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `popovertarget`, `popovertargetaction`, `prefix`, `prop:disabled`, `prop:formAction`, `prop:formEnctype`, `prop:formMethod`, `prop:formNoValidate`, `prop:formTarget`, `prop:name`, `prop:popoverTargetAction`, `prop:popoverTargetElement`, `prop:type`, `prop:value`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `type`, `typeof`, `value`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-546f6f6c6261722e427574746f6e2e5374617465"></a>

<a id="toolbarbuttonstate"></a>

### Related exported type: Toolbar.Button.State

Declaration: `packages/solid/build/types/toolbar/button/ToolbarButton.d.ts:16`

#### Declaration

```typescript
ToolbarButtonState
```

<a id="api-546f6f6c6261722e427574746f6e2e53746174652e666f63757361626c65"></a>

<a id="ToolbarButtonState-focusable"></a>

<a id="api-546f6f6c6261722e427574746f6e2e53746174652e64697361626c6564"></a>

<a id="ToolbarButtonState-disabled"></a>

<a id="api-546f6f6c6261722e427574746f6e2e53746174652e6f7269656e746174696f6e"></a>

<a id="ToolbarButtonState-orientation"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| focusable | `boolean` | Yes | Unavailable |  |
| disabled | `boolean` | Yes | Unavailable |  |
| orientation | `Orientation` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="link"></a>

### Link

<a id="api-546f6f6c6261722e4c696e6b"></a>

<a id="toolbarlink"></a>

<a id="api-546f6f6c6261722e4c696e6b2e2470726f70732e70726f703a63686172736574"></a>

<a id="api-546f6f6c6261722e4c696e6b2e2470726f70732e70726f703a636f6f726473"></a>

<a id="api-546f6f6c6261722e4c696e6b2e2470726f70732e70726f703a646f776e6c6f6164"></a>

<a id="api-546f6f6c6261722e4c696e6b2e2470726f70732e70726f703a68617368"></a>

<a id="api-546f6f6c6261722e4c696e6b2e2470726f70732e70726f703a686f7374"></a>

<a id="api-546f6f6c6261722e4c696e6b2e2470726f70732e70726f703a686f73746e616d65"></a>

<a id="api-546f6f6c6261722e4c696e6b2e2470726f70732e70726f703a68726566"></a>

<a id="api-546f6f6c6261722e4c696e6b2e2470726f70732e70726f703a687265666c616e67"></a>

<a id="api-546f6f6c6261722e4c696e6b2e2470726f70732e70726f703a6e616d65"></a>

<a id="api-546f6f6c6261722e4c696e6b2e2470726f70732e70726f703a70617373776f7264"></a>

<a id="api-546f6f6c6261722e4c696e6b2e2470726f70732e70726f703a706174686e616d65"></a>

<a id="api-546f6f6c6261722e4c696e6b2e2470726f70732e70726f703a70696e67"></a>

<a id="api-546f6f6c6261722e4c696e6b2e2470726f70732e70726f703a706f7274"></a>

<a id="api-546f6f6c6261722e4c696e6b2e2470726f70732e70726f703a70726f746f636f6c"></a>

<a id="api-546f6f6c6261722e4c696e6b2e2470726f70732e70726f703a7265666572726572506f6c696379"></a>

<a id="api-546f6f6c6261722e4c696e6b2e2470726f70732e70726f703a72656c"></a>

<a id="api-546f6f6c6261722e4c696e6b2e2470726f70732e70726f703a726576"></a>

<a id="api-546f6f6c6261722e4c696e6b2e2470726f70732e70726f703a736561726368"></a>

<a id="api-546f6f6c6261722e4c696e6b2e2470726f70732e70726f703a7368617065"></a>

<a id="api-546f6f6c6261722e4c696e6b2e2470726f70732e70726f703a746172676574"></a>

<a id="api-546f6f6c6261722e4c696e6b2e2470726f70732e70726f703a74657874"></a>

<a id="api-546f6f6c6261722e4c696e6b2e2470726f70732e70726f703a74797065"></a>

<a id="api-546f6f6c6261722e4c696e6b2e2470726f70732e70726f703a757365726e616d65"></a>

### Toolbar.Link

Links remain enabled even inside disabled toolbars and groups.

Declaration: `packages/solid/build/types/toolbar/link/ToolbarLink.d.ts:5`

#### Declaration

```typescript
(componentProps: ToolbarLinkProps) => JSX.Element
```

<a id="api-546f6f6c6261722e4c696e6b2e2470726f70732e636c617373"></a>

<a id="ToolbarLink-class"></a>

<a id="api-546f6f6c6261722e4c696e6b2e2470726f70732e7374796c65"></a>

<a id="ToolbarLink-style"></a>

<a id="api-546f6f6c6261722e4c696e6b2e2470726f70732e72656e646572"></a>

<a id="ToolbarLink-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<ToolbarLinkState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ToolbarLinkState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<JSX.AnchorHTMLAttributes<HTMLAnchorElement> & JSX.Properties<HTMLAnchorElement>, ToolbarLinkState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `attributionsrc`, `autocapitalize`, `autocorrect`, `autofocus`, `charset`, `children`, `contenteditable`, `contextmenu`, `coords`, `datatype`, `dir`, `download`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `href`, `hreflang`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `link`, `name`, `nonce`, `noscroll`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `ping`, `popover`, `prefix`, `preload`, `prop:charset`, `prop:coords`, `prop:download`, `prop:hash`, `prop:host`, `prop:hostname`, `prop:href`, `prop:hreflang`, `prop:name`, `prop:password`, `prop:pathname`, `prop:ping`, `prop:port`, `prop:protocol`, `prop:referrerPolicy`, `prop:rel`, `prop:rev`, `prop:search`, `prop:shape`, `prop:target`, `prop:text`, `prop:type`, `prop:username`, `property`, `ref`, `referrerpolicy`, `rel`, `replace`, `resource`, `rev`, `role`, `shape`, `slot`, `spellcheck`, `state`, `tabindex`, `target`, `textContent`, `title`, `translate`, `type`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`, `xmlns`

#### Data attributes

<a id="api-546f6f6c6261724c696e6b44617461417474726962757465732e6f7269656e746174696f6e"></a>

| Name | Description |
| --- | --- |
| data-orientation |  |

#### CSS variables

Metadata status: unavailable.

<a id="api-546f6f6c6261722e4c696e6b2e50726f7073"></a>

<a id="toolbarlinkprops"></a>

<a id="api-546f6f6c6261722e4c696e6b2e50726f70732e70726f703a63686172736574"></a>

<a id="api-546f6f6c6261722e4c696e6b2e50726f70732e70726f703a636f6f726473"></a>

<a id="api-546f6f6c6261722e4c696e6b2e50726f70732e70726f703a646f776e6c6f6164"></a>

<a id="api-546f6f6c6261722e4c696e6b2e50726f70732e70726f703a68617368"></a>

<a id="api-546f6f6c6261722e4c696e6b2e50726f70732e70726f703a686f7374"></a>

<a id="api-546f6f6c6261722e4c696e6b2e50726f70732e70726f703a686f73746e616d65"></a>

<a id="api-546f6f6c6261722e4c696e6b2e50726f70732e70726f703a68726566"></a>

<a id="api-546f6f6c6261722e4c696e6b2e50726f70732e70726f703a687265666c616e67"></a>

<a id="api-546f6f6c6261722e4c696e6b2e50726f70732e70726f703a6e616d65"></a>

<a id="api-546f6f6c6261722e4c696e6b2e50726f70732e70726f703a70617373776f7264"></a>

<a id="api-546f6f6c6261722e4c696e6b2e50726f70732e70726f703a706174686e616d65"></a>

<a id="api-546f6f6c6261722e4c696e6b2e50726f70732e70726f703a70696e67"></a>

<a id="api-546f6f6c6261722e4c696e6b2e50726f70732e70726f703a706f7274"></a>

<a id="api-546f6f6c6261722e4c696e6b2e50726f70732e70726f703a70726f746f636f6c"></a>

<a id="api-546f6f6c6261722e4c696e6b2e50726f70732e70726f703a7265666572726572506f6c696379"></a>

<a id="api-546f6f6c6261722e4c696e6b2e50726f70732e70726f703a72656c"></a>

<a id="api-546f6f6c6261722e4c696e6b2e50726f70732e70726f703a726576"></a>

<a id="api-546f6f6c6261722e4c696e6b2e50726f70732e70726f703a736561726368"></a>

<a id="api-546f6f6c6261722e4c696e6b2e50726f70732e70726f703a7368617065"></a>

<a id="api-546f6f6c6261722e4c696e6b2e50726f70732e70726f703a746172676574"></a>

<a id="api-546f6f6c6261722e4c696e6b2e50726f70732e70726f703a74657874"></a>

<a id="api-546f6f6c6261722e4c696e6b2e50726f70732e70726f703a74797065"></a>

<a id="api-546f6f6c6261722e4c696e6b2e50726f70732e70726f703a757365726e616d65"></a>

### Related exported type: Toolbar.Link.Props

Declaration: `packages/solid/build/types/toolbar/link/ToolbarLink.d.ts:13`

#### Declaration

```typescript
ToolbarLinkProps
```

<a id="api-546f6f6c6261722e4c696e6b2e50726f70732e636c617373"></a>

<a id="ToolbarLinkProps-class"></a>

<a id="api-546f6f6c6261722e4c696e6b2e50726f70732e7374796c65"></a>

<a id="ToolbarLinkProps-style"></a>

<a id="api-546f6f6c6261722e4c696e6b2e50726f70732e72656e646572"></a>

<a id="ToolbarLinkProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<ToolbarLinkState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ToolbarLinkState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<JSX.AnchorHTMLAttributes<HTMLAnchorElement> & JSX.Properties<HTMLAnchorElement>, ToolbarLinkState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `attributionsrc`, `autocapitalize`, `autocorrect`, `autofocus`, `charset`, `children`, `contenteditable`, `contextmenu`, `coords`, `datatype`, `dir`, `download`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `href`, `hreflang`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `link`, `name`, `nonce`, `noscroll`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `ping`, `popover`, `prefix`, `preload`, `prop:charset`, `prop:coords`, `prop:download`, `prop:hash`, `prop:host`, `prop:hostname`, `prop:href`, `prop:hreflang`, `prop:name`, `prop:password`, `prop:pathname`, `prop:ping`, `prop:port`, `prop:protocol`, `prop:referrerPolicy`, `prop:rel`, `prop:rev`, `prop:search`, `prop:shape`, `prop:target`, `prop:text`, `prop:type`, `prop:username`, `property`, `ref`, `referrerpolicy`, `rel`, `replace`, `resource`, `rev`, `role`, `shape`, `slot`, `spellcheck`, `state`, `tabindex`, `target`, `textContent`, `title`, `translate`, `type`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`, `xmlns`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-546f6f6c6261722e4c696e6b2e5374617465"></a>

<a id="toolbarlinkstate"></a>

### Related exported type: Toolbar.Link.State

Declaration: `packages/solid/build/types/toolbar/link/ToolbarLink.d.ts:12`

#### Declaration

```typescript
ToolbarLinkState
```

<a id="api-546f6f6c6261722e4c696e6b2e53746174652e6f7269656e746174696f6e"></a>

<a id="ToolbarLinkState-orientation"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| orientation | `Orientation` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="input"></a>

### Input

<a id="api-546f6f6c6261722e496e707574"></a>

<a id="toolbarinput"></a>

<a id="api-546f6f6c6261722e496e7075742e2470726f70732e70726f703a616363657074"></a>

<a id="api-546f6f6c6261722e496e7075742e2470726f70732e70726f703a616c69676e"></a>

<a id="api-546f6f6c6261722e496e7075742e2470726f70732e70726f703a616c74"></a>

<a id="api-546f6f6c6261722e496e7075742e2470726f70732e70726f703a6175746f636f6d706c657465"></a>

<a id="api-546f6f6c6261722e496e7075742e2470726f70732e70726f703a63617074757265"></a>

<a id="api-546f6f6c6261722e496e7075742e2470726f70732e70726f703a6469724e616d65"></a>

<a id="api-546f6f6c6261722e496e7075742e2470726f70732e70726f703a64697361626c6564"></a>

<a id="api-546f6f6c6261722e496e7075742e2470726f70732e70726f703a666f726d416374696f6e"></a>

<a id="api-546f6f6c6261722e496e7075742e2470726f70732e70726f703a666f726d456e6374797065"></a>

<a id="api-546f6f6c6261722e496e7075742e2470726f70732e70726f703a666f726d4d6574686f64"></a>

<a id="api-546f6f6c6261722e496e7075742e2470726f70732e70726f703a666f726d4e6f56616c6964617465"></a>

<a id="api-546f6f6c6261722e496e7075742e2470726f70732e70726f703a666f726d546172676574"></a>

<a id="api-546f6f6c6261722e496e7075742e2470726f70732e70726f703a686569676874"></a>

<a id="api-546f6f6c6261722e496e7075742e2470726f70732e70726f703a696e64657465726d696e617465"></a>

<a id="api-546f6f6c6261722e496e7075742e2470726f70732e70726f703a6d6178"></a>

<a id="api-546f6f6c6261722e496e7075742e2470726f70732e70726f703a6d61784c656e677468"></a>

<a id="api-546f6f6c6261722e496e7075742e2470726f70732e70726f703a6d696e"></a>

<a id="api-546f6f6c6261722e496e7075742e2470726f70732e70726f703a6d696e4c656e677468"></a>

<a id="api-546f6f6c6261722e496e7075742e2470726f70732e70726f703a6d756c7469706c65"></a>

<a id="api-546f6f6c6261722e496e7075742e2470726f70732e70726f703a6e616d65"></a>

<a id="api-546f6f6c6261722e496e7075742e2470726f70732e70726f703a7061747465726e"></a>

<a id="api-546f6f6c6261722e496e7075742e2470726f70732e70726f703a706c616365686f6c646572"></a>

<a id="api-546f6f6c6261722e496e7075742e2470726f70732e70726f703a706f706f766572546172676574416374696f6e"></a>

<a id="api-546f6f6c6261722e496e7075742e2470726f70732e70726f703a706f706f766572546172676574456c656d656e74"></a>

<a id="api-546f6f6c6261722e496e7075742e2470726f70732e70726f703a726561644f6e6c79"></a>

<a id="api-546f6f6c6261722e496e7075742e2470726f70732e70726f703a7265717569726564"></a>

<a id="api-546f6f6c6261722e496e7075742e2470726f70732e70726f703a73656c656374696f6e446972656374696f6e"></a>

<a id="api-546f6f6c6261722e496e7075742e2470726f70732e70726f703a73656c656374696f6e456e64"></a>

<a id="api-546f6f6c6261722e496e7075742e2470726f70732e70726f703a73656c656374696f6e5374617274"></a>

<a id="api-546f6f6c6261722e496e7075742e2470726f70732e70726f703a73697a65"></a>

<a id="api-546f6f6c6261722e496e7075742e2470726f70732e70726f703a737263"></a>

<a id="api-546f6f6c6261722e496e7075742e2470726f70732e70726f703a73746570"></a>

<a id="api-546f6f6c6261722e496e7075742e2470726f70732e70726f703a74797065"></a>

<a id="api-546f6f6c6261722e496e7075742e2470726f70732e70726f703a7573654d6170"></a>

<a id="api-546f6f6c6261722e496e7075742e2470726f70732e70726f703a76616c7565417344617465"></a>

<a id="api-546f6f6c6261722e496e7075742e2470726f70732e70726f703a76616c756541734e756d626572"></a>

<a id="api-546f6f6c6261722e496e7075742e2470726f70732e70726f703a7765626b69746469726563746f7279"></a>

<a id="api-546f6f6c6261722e496e7075742e2470726f70732e70726f703a7769647468"></a>

### Toolbar.Input

Native editing semantics are retained by the shared composite navigation engine.

Declaration: `packages/solid/build/types/toolbar/input/ToolbarInput.d.ts:5`

#### Declaration

```typescript
(componentProps: ToolbarInputProps) => JSX.Element
```

<a id="api-546f6f6c6261722e496e7075742e2470726f70732e64656661756c7456616c7565"></a>

<a id="ToolbarInput-defaultValue"></a>

<a id="api-546f6f6c6261722e496e7075742e2470726f70732e666f63757361626c655768656e44697361626c6564"></a>

<a id="ToolbarInput-focusableWhenDisabled"></a>

<a id="api-546f6f6c6261722e496e7075742e2470726f70732e64697361626c6564"></a>

<a id="ToolbarInput-disabled"></a>

<a id="api-546f6f6c6261722e496e7075742e2470726f70732e636c617373"></a>

<a id="ToolbarInput-class"></a>

<a id="api-546f6f6c6261722e496e7075742e2470726f70732e7374796c65"></a>

<a id="ToolbarInput-style"></a>

<a id="api-546f6f6c6261722e496e7075742e2470726f70732e72656e646572"></a>

<a id="ToolbarInput-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| defaultValue | `string \| number \| string[] \| undefined` | No | Unavailable |  |
| focusableWhenDisabled | `boolean \| undefined` | No | true | Keep disabled inputs in roving focus. |
| disabled | `boolean \| undefined` | No | false |  |
| class | `JSX.ClassValue \| ((state: Readonly<ToolbarInputState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ToolbarInputState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ToolbarInputState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accept`, `accesskey`, `align`, `alpha`, `alt`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocomplete`, `autocorrect`, `autofocus`, `capture`, `checked`, `children`, `colorspace`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `dirname`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `form`, `formaction`, `formenctype`, `formmethod`, `formnovalidate`, `formtarget`, `height`, `hidden`, `id`, `incremental`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `list`, `max`, `maxlength`, `min`, `minlength`, `multiple`, `name`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `pattern`, `placeholder`, `popover`, `popovertarget`, `popovertargetaction`, `prefix`, `prop:accept`, `prop:align`, `prop:alt`, `prop:autocomplete`, `prop:capture`, `prop:checked`, `prop:defaultChecked`, `prop:defaultValue`, `prop:dirName`, `prop:disabled`, `prop:formAction`, `prop:formEnctype`, `prop:formMethod`, `prop:formNoValidate`, `prop:formTarget`, `prop:height`, `prop:indeterminate`, `prop:max`, `prop:maxLength`, `prop:min`, `prop:minLength`, `prop:multiple`, `prop:name`, `prop:pattern`, `prop:placeholder`, `prop:popoverTargetAction`, `prop:popoverTargetElement`, `prop:readOnly`, `prop:required`, `prop:selectionDirection`, `prop:selectionEnd`, `prop:selectionStart`, `prop:size`, `prop:src`, `prop:step`, `prop:type`, `prop:useMap`, `prop:value`, `prop:valueAsDate`, `prop:valueAsNumber`, `prop:webkitdirectory`, `prop:width`, `property`, `readonly`, `ref`, `required`, `resource`, `results`, `role`, `size`, `slot`, `spellcheck`, `src`, `step`, `tabindex`, `textContent`, `title`, `translate`, `type`, `typeof`, `usemap`, `value`, `virtualkeyboardpolicy`, `vocab`, `webkitdirectory`, `width`, `writingsuggestions`

#### Data attributes

<a id="api-546f6f6c626172496e70757444617461417474726962757465732e6f7269656e746174696f6e"></a>

<a id="api-546f6f6c626172496e70757444617461417474726962757465732e64697361626c6564"></a>

<a id="api-546f6f6c626172496e70757444617461417474726962757465732e666f63757361626c65"></a>

| Name | Description |
| --- | --- |
| data-orientation |  |
| data-disabled |  |
| data-focusable |  |

#### CSS variables

Metadata status: unavailable.

<a id="api-546f6f6c6261722e496e7075742e50726f7073"></a>

<a id="toolbarinputprops"></a>

<a id="api-546f6f6c6261722e496e7075742e50726f70732e70726f703a616363657074"></a>

<a id="api-546f6f6c6261722e496e7075742e50726f70732e70726f703a616c69676e"></a>

<a id="api-546f6f6c6261722e496e7075742e50726f70732e70726f703a616c74"></a>

<a id="api-546f6f6c6261722e496e7075742e50726f70732e70726f703a6175746f636f6d706c657465"></a>

<a id="api-546f6f6c6261722e496e7075742e50726f70732e70726f703a63617074757265"></a>

<a id="api-546f6f6c6261722e496e7075742e50726f70732e70726f703a6469724e616d65"></a>

<a id="api-546f6f6c6261722e496e7075742e50726f70732e70726f703a64697361626c6564"></a>

<a id="api-546f6f6c6261722e496e7075742e50726f70732e70726f703a666f726d416374696f6e"></a>

<a id="api-546f6f6c6261722e496e7075742e50726f70732e70726f703a666f726d456e6374797065"></a>

<a id="api-546f6f6c6261722e496e7075742e50726f70732e70726f703a666f726d4d6574686f64"></a>

<a id="api-546f6f6c6261722e496e7075742e50726f70732e70726f703a666f726d4e6f56616c6964617465"></a>

<a id="api-546f6f6c6261722e496e7075742e50726f70732e70726f703a666f726d546172676574"></a>

<a id="api-546f6f6c6261722e496e7075742e50726f70732e70726f703a686569676874"></a>

<a id="api-546f6f6c6261722e496e7075742e50726f70732e70726f703a696e64657465726d696e617465"></a>

<a id="api-546f6f6c6261722e496e7075742e50726f70732e70726f703a6d6178"></a>

<a id="api-546f6f6c6261722e496e7075742e50726f70732e70726f703a6d61784c656e677468"></a>

<a id="api-546f6f6c6261722e496e7075742e50726f70732e70726f703a6d696e"></a>

<a id="api-546f6f6c6261722e496e7075742e50726f70732e70726f703a6d696e4c656e677468"></a>

<a id="api-546f6f6c6261722e496e7075742e50726f70732e70726f703a6d756c7469706c65"></a>

<a id="api-546f6f6c6261722e496e7075742e50726f70732e70726f703a6e616d65"></a>

<a id="api-546f6f6c6261722e496e7075742e50726f70732e70726f703a7061747465726e"></a>

<a id="api-546f6f6c6261722e496e7075742e50726f70732e70726f703a706c616365686f6c646572"></a>

<a id="api-546f6f6c6261722e496e7075742e50726f70732e70726f703a706f706f766572546172676574416374696f6e"></a>

<a id="api-546f6f6c6261722e496e7075742e50726f70732e70726f703a706f706f766572546172676574456c656d656e74"></a>

<a id="api-546f6f6c6261722e496e7075742e50726f70732e70726f703a726561644f6e6c79"></a>

<a id="api-546f6f6c6261722e496e7075742e50726f70732e70726f703a7265717569726564"></a>

<a id="api-546f6f6c6261722e496e7075742e50726f70732e70726f703a73656c656374696f6e446972656374696f6e"></a>

<a id="api-546f6f6c6261722e496e7075742e50726f70732e70726f703a73656c656374696f6e456e64"></a>

<a id="api-546f6f6c6261722e496e7075742e50726f70732e70726f703a73656c656374696f6e5374617274"></a>

<a id="api-546f6f6c6261722e496e7075742e50726f70732e70726f703a73697a65"></a>

<a id="api-546f6f6c6261722e496e7075742e50726f70732e70726f703a737263"></a>

<a id="api-546f6f6c6261722e496e7075742e50726f70732e70726f703a73746570"></a>

<a id="api-546f6f6c6261722e496e7075742e50726f70732e70726f703a74797065"></a>

<a id="api-546f6f6c6261722e496e7075742e50726f70732e70726f703a7573654d6170"></a>

<a id="api-546f6f6c6261722e496e7075742e50726f70732e70726f703a76616c7565417344617465"></a>

<a id="api-546f6f6c6261722e496e7075742e50726f70732e70726f703a76616c756541734e756d626572"></a>

<a id="api-546f6f6c6261722e496e7075742e50726f70732e70726f703a7765626b69746469726563746f7279"></a>

<a id="api-546f6f6c6261722e496e7075742e50726f70732e70726f703a7769647468"></a>

### Related exported type: Toolbar.Input.Props

Declaration: `packages/solid/build/types/toolbar/input/ToolbarInput.d.ts:17`

#### Declaration

```typescript
ToolbarInputProps
```

<a id="api-546f6f6c6261722e496e7075742e50726f70732e64656661756c7456616c7565"></a>

<a id="ToolbarInputProps-defaultValue"></a>

<a id="api-546f6f6c6261722e496e7075742e50726f70732e666f63757361626c655768656e44697361626c6564"></a>

<a id="ToolbarInputProps-focusableWhenDisabled"></a>

<a id="api-546f6f6c6261722e496e7075742e50726f70732e64697361626c6564"></a>

<a id="ToolbarInputProps-disabled"></a>

<a id="api-546f6f6c6261722e496e7075742e50726f70732e636c617373"></a>

<a id="ToolbarInputProps-class"></a>

<a id="api-546f6f6c6261722e496e7075742e50726f70732e7374796c65"></a>

<a id="ToolbarInputProps-style"></a>

<a id="api-546f6f6c6261722e496e7075742e50726f70732e72656e646572"></a>

<a id="ToolbarInputProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| defaultValue | `string \| number \| string[] \| undefined` | No | Unavailable |  |
| focusableWhenDisabled | `boolean \| undefined` | No | true | Keep disabled inputs in roving focus. |
| disabled | `boolean \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<ToolbarInputState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ToolbarInputState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ToolbarInputState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accept`, `accesskey`, `align`, `alpha`, `alt`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocomplete`, `autocorrect`, `autofocus`, `capture`, `checked`, `children`, `colorspace`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `dirname`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `form`, `formaction`, `formenctype`, `formmethod`, `formnovalidate`, `formtarget`, `height`, `hidden`, `id`, `incremental`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `list`, `max`, `maxlength`, `min`, `minlength`, `multiple`, `name`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `pattern`, `placeholder`, `popover`, `popovertarget`, `popovertargetaction`, `prefix`, `prop:accept`, `prop:align`, `prop:alt`, `prop:autocomplete`, `prop:capture`, `prop:checked`, `prop:defaultChecked`, `prop:defaultValue`, `prop:dirName`, `prop:disabled`, `prop:formAction`, `prop:formEnctype`, `prop:formMethod`, `prop:formNoValidate`, `prop:formTarget`, `prop:height`, `prop:indeterminate`, `prop:max`, `prop:maxLength`, `prop:min`, `prop:minLength`, `prop:multiple`, `prop:name`, `prop:pattern`, `prop:placeholder`, `prop:popoverTargetAction`, `prop:popoverTargetElement`, `prop:readOnly`, `prop:required`, `prop:selectionDirection`, `prop:selectionEnd`, `prop:selectionStart`, `prop:size`, `prop:src`, `prop:step`, `prop:type`, `prop:useMap`, `prop:value`, `prop:valueAsDate`, `prop:valueAsNumber`, `prop:webkitdirectory`, `prop:width`, `property`, `readonly`, `ref`, `required`, `resource`, `results`, `role`, `size`, `slot`, `spellcheck`, `src`, `step`, `tabindex`, `textContent`, `title`, `translate`, `type`, `typeof`, `usemap`, `value`, `virtualkeyboardpolicy`, `vocab`, `webkitdirectory`, `width`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-546f6f6c6261722e496e7075742e5374617465"></a>

<a id="toolbarinputstate"></a>

### Related exported type: Toolbar.Input.State

Declaration: `packages/solid/build/types/toolbar/input/ToolbarInput.d.ts:16`

#### Declaration

```typescript
ToolbarInputState
```

<a id="api-546f6f6c6261722e496e7075742e53746174652e666f63757361626c65"></a>

<a id="ToolbarInputState-focusable"></a>

<a id="api-546f6f6c6261722e496e7075742e53746174652e64697361626c6564"></a>

<a id="ToolbarInputState-disabled"></a>

<a id="api-546f6f6c6261722e496e7075742e53746174652e6f7269656e746174696f6e"></a>

<a id="ToolbarInputState-orientation"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| focusable | `boolean` | Yes | Unavailable |  |
| disabled | `boolean` | Yes | Unavailable |  |
| orientation | `Orientation` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="group"></a>

### Group

<a id="api-546f6f6c6261722e47726f7570"></a>

<a id="toolbargroup"></a>

<a id="api-546f6f6c6261722e47726f75702e2470726f70732e70726f703a616c69676e"></a>

### Toolbar.Group

Groups toolbar controls; the nearest group supplies their disabled state.

Declaration: `packages/solid/build/types/toolbar/group/ToolbarGroup.d.ts:4`

#### Declaration

```typescript
(componentProps: ToolbarGroupProps) => JSX.Element
```

<a id="api-546f6f6c6261722e47726f75702e2470726f70732e64697361626c6564"></a>

<a id="ToolbarGroup-disabled"></a>

<a id="api-546f6f6c6261722e47726f75702e2470726f70732e636c617373"></a>

<a id="ToolbarGroup-class"></a>

<a id="api-546f6f6c6261722e47726f75702e2470726f70732e7374796c65"></a>

<a id="ToolbarGroup-style"></a>

<a id="api-546f6f6c6261722e47726f75702e2470726f70732e72656e646572"></a>

<a id="ToolbarGroup-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| disabled | `boolean \| undefined` | No | false | Disable the controls in this group. |
| class | `JSX.ClassValue \| ((state: Readonly<ToolbarGroupState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ToolbarGroupState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ToolbarGroupState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-546f6f6c62617247726f757044617461417474726962757465732e6f7269656e746174696f6e"></a>

<a id="api-546f6f6c62617247726f757044617461417474726962757465732e64697361626c6564"></a>

| Name | Description |
| --- | --- |
| data-orientation | The toolbar orientation: horizontal or vertical. |
| data-disabled | Present when the group is disabled. |

#### CSS variables

Metadata status: unavailable.

<a id="api-546f6f6c6261722e47726f75702e50726f7073"></a>

<a id="toolbargroupprops"></a>

<a id="api-546f6f6c6261722e47726f75702e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Toolbar.Group.Props

Declaration: `packages/solid/build/types/toolbar/group/ToolbarGroup.d.ts:13`

#### Declaration

```typescript
ToolbarGroupProps
```

<a id="api-546f6f6c6261722e47726f75702e50726f70732e64697361626c6564"></a>

<a id="ToolbarGroupProps-disabled"></a>

<a id="api-546f6f6c6261722e47726f75702e50726f70732e636c617373"></a>

<a id="ToolbarGroupProps-class"></a>

<a id="api-546f6f6c6261722e47726f75702e50726f70732e7374796c65"></a>

<a id="ToolbarGroupProps-style"></a>

<a id="api-546f6f6c6261722e47726f75702e50726f70732e72656e646572"></a>

<a id="ToolbarGroupProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| disabled | `boolean \| undefined` | No | false | Disable the controls in this group. |
| class | `JSX.ClassValue \| ((state: Readonly<ToolbarGroupState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ToolbarGroupState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ToolbarGroupState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-546f6f6c6261722e47726f75702e5374617465"></a>

<a id="toolbargroupstate"></a>

### Related exported type: Toolbar.Group.State

Declaration: `packages/solid/build/types/toolbar/group/ToolbarGroup.d.ts:12`

#### Declaration

```typescript
ToolbarGroupState
```

<a id="api-546f6f6c6261722e47726f75702e53746174652e64697361626c6564"></a>

<a id="ToolbarGroupState-disabled"></a>

<a id="api-546f6f6c6261722e47726f75702e53746174652e6f7269656e746174696f6e"></a>

<a id="ToolbarGroupState-orientation"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| disabled | `boolean` | Yes | Unavailable |  |
| orientation | `Orientation` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="separator"></a>

### Separator

<a id="api-546f6f6c6261722e536570617261746f72"></a>

<a id="toolbarseparator"></a>

<a id="api-546f6f6c6261722e536570617261746f722e2470726f70732e70726f703a616c69676e"></a>

### Toolbar.Separator

A separator perpendicular to its toolbar unless explicitly overridden.

Declaration: `packages/solid/build/types/toolbar/separator/ToolbarSeparator.d.ts:3`

#### Declaration

```typescript
(props: ToolbarSeparatorProps) => JSX.Element
```

<a id="api-546f6f6c6261722e536570617261746f722e2470726f70732e6f7269656e746174696f6e"></a>

<a id="ToolbarSeparator-orientation"></a>

<a id="api-546f6f6c6261722e536570617261746f722e2470726f70732e636c617373"></a>

<a id="ToolbarSeparator-class"></a>

<a id="api-546f6f6c6261722e536570617261746f722e2470726f70732e7374796c65"></a>

<a id="ToolbarSeparator-style"></a>

<a id="api-546f6f6c6261722e536570617261746f722e2470726f70732e72656e646572"></a>

<a id="ToolbarSeparator-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| orientation | `Orientation \| undefined` | No | 'horizontal' | The orientation of the separator. |
| class | `JSX.ClassValue \| ((state: Readonly<SeparatorState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<SeparatorState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, SeparatorState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-546f6f6c626172536570617261746f7244617461417474726962757465732e6f7269656e746174696f6e"></a>

| Name | Description |
| --- | --- |
| data-orientation | Separator orientation, perpendicular to the toolbar by default. |

#### CSS variables

Metadata status: unavailable.

<a id="api-546f6f6c6261722e536570617261746f722e50726f7073"></a>

<a id="toolbarseparatorprops"></a>

<a id="api-546f6f6c6261722e536570617261746f722e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Toolbar.Separator.Props

Declaration: `packages/solid/build/types/toolbar/separator/ToolbarSeparator.d.ts:10`

#### Declaration

```typescript
ToolbarSeparatorProps
```

<a id="api-546f6f6c6261722e536570617261746f722e50726f70732e6f7269656e746174696f6e"></a>

<a id="ToolbarSeparatorProps-orientation"></a>

<a id="api-546f6f6c6261722e536570617261746f722e50726f70732e636c617373"></a>

<a id="ToolbarSeparatorProps-class"></a>

<a id="api-546f6f6c6261722e536570617261746f722e50726f70732e7374796c65"></a>

<a id="ToolbarSeparatorProps-style"></a>

<a id="api-546f6f6c6261722e536570617261746f722e50726f70732e72656e646572"></a>

<a id="ToolbarSeparatorProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| orientation | `Orientation \| undefined` | No | 'horizontal' | The orientation of the separator. |
| class | `JSX.ClassValue \| ((state: Readonly<SeparatorState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<SeparatorState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, SeparatorState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-546f6f6c6261722e536570617261746f722e5374617465"></a>

<a id="toolbarseparatorstate"></a>

### Related exported type: Toolbar.Separator.State

Declaration: `packages/solid/build/types/toolbar/separator/ToolbarSeparator.d.ts:9`

#### Declaration

```typescript
ToolbarSeparatorState
```

<a id="api-546f6f6c6261722e536570617261746f722e53746174652e6f7269656e746174696f6e"></a>

<a id="ToolbarSeparatorState-orientation"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| orientation | `Orientation` | Yes | Unavailable | The orientation of the separator. |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

