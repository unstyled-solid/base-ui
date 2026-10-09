<a id="menubar"></a>

# Menubar

A menu bar providing commands and options for your application.

[Open mounted Solid demo: menubar/hero](/solid/components/menubar)

<a id="anatomy"></a>

## Anatomy

Import the component and assemble its parts:

```tsx
import { Menubar } from '@unstyled-solid/base-ui/menubar';
import { Menu } from '@unstyled-solid/base-ui/menu';
<Menubar>
  <Menu.Root>
    <Menu.Trigger />
    <Menu.Portal>
      <Menu.Backdrop />
      <Menu.Positioner>
        <Menu.Popup>
          <Menu.Arrow />
          <Menu.Item />
          <Menu.LinkItem />
          <Menu.Separator />

          <Menu.SubmenuRoot>
            <Menu.SubmenuTrigger />
          </Menu.SubmenuRoot>

          <Menu.Group>
            <Menu.GroupLabel />
          </Menu.Group>

          <Menu.RadioGroup>
            <Menu.RadioItem>
              <Menu.RadioItemIndicator />
            </Menu.RadioItem>
          </Menu.RadioGroup>

          <Menu.CheckboxItem>
            <Menu.CheckboxItemIndicator />
          </Menu.CheckboxItem>

          <Menu.Viewport />
        </Menu.Popup>
      </Menu.Positioner>
    </Menu.Portal>
  </Menu.Root>
</Menubar>;
```

<a id="api-reference"></a>

## API reference

<a id="api-4d656e75626172"></a>

<a id="api-4d656e756261722e2470726f70732e70726f703a616c69676e"></a>

### Menubar

The container for menus. Roving focus is owned by the shared composite.

Declaration: `packages/solid/build/types/menubar/Menubar.d.ts:4`

#### Declaration

```typescript
(props: MenubarProps) => JSX.Element
```

<a id="api-4d656e756261722e2470726f70732e6c6f6f70466f637573"></a>

<a id="Menubar-loopFocus"></a>

<a id="api-4d656e756261722e2470726f70732e6d6f64616c"></a>

<a id="Menubar-modal"></a>

<a id="api-4d656e756261722e2470726f70732e64697361626c6564"></a>

<a id="Menubar-disabled"></a>

<a id="api-4d656e756261722e2470726f70732e6f7269656e746174696f6e"></a>

<a id="Menubar-orientation"></a>

<a id="api-4d656e756261722e2470726f70732e636c617373"></a>

<a id="Menubar-class"></a>

<a id="api-4d656e756261722e2470726f70732e7374796c65"></a>

<a id="Menubar-style"></a>

<a id="api-4d656e756261722e2470726f70732e72656e646572"></a>

<a id="Menubar-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| loopFocus | `boolean \| undefined` | No | true | Wrap arrow-key focus at either end. |
| modal | `boolean \| undefined` | No | true | Whether menus are modal. |
| disabled | `boolean \| undefined` | No | false | Whether all menus are disabled. |
| orientation | `"horizontal" \| "vertical" \| undefined` | No | 'horizontal' | The menubar's orientation. |
| class | `JSX.ClassValue \| ((state: Readonly<MenubarState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<MenubarState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLDivElement>>, MenubarState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-4d656e7562617244617461417474726962757465732e6f7269656e746174696f6e"></a>

<a id="api-4d656e7562617244617461417474726962757465732e6861735375626d656e754f70656e"></a>

<a id="api-4d656e7562617244617461417474726962757465732e6d6f64616c"></a>

| Name | Description |
| --- | --- |
| data-orientation | The menubar's horizontal or vertical orientation. |
| data-has-submenu-open | Present when a submenu within the menubar is open. |
| data-modal | Present when the menubar is modal. |

#### CSS variables

Metadata status: unavailable.

<a id="api-4d656e756261722e50726f7073"></a>

<a id="menubarprops"></a>

<a id="api-4d656e756261722e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Menubar.Props

Declaration: `packages/solid/build/types/menubar/Menubar.d.ts:22`

#### Declaration

```typescript
MenubarProps
```

<a id="api-4d656e756261722e50726f70732e6c6f6f70466f637573"></a>

<a id="MenubarProps-loopFocus"></a>

<a id="api-4d656e756261722e50726f70732e6d6f64616c"></a>

<a id="MenubarProps-modal"></a>

<a id="api-4d656e756261722e50726f70732e64697361626c6564"></a>

<a id="MenubarProps-disabled"></a>

<a id="api-4d656e756261722e50726f70732e6f7269656e746174696f6e"></a>

<a id="MenubarProps-orientation"></a>

<a id="api-4d656e756261722e50726f70732e636c617373"></a>

<a id="MenubarProps-class"></a>

<a id="api-4d656e756261722e50726f70732e7374796c65"></a>

<a id="MenubarProps-style"></a>

<a id="api-4d656e756261722e50726f70732e72656e646572"></a>

<a id="MenubarProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| loopFocus | `boolean \| undefined` | No | true | Wrap arrow-key focus at either end. |
| modal | `boolean \| undefined` | No | true | Whether menus are modal. |
| disabled | `boolean \| undefined` | No | false | Whether all menus are disabled. |
| orientation | `"horizontal" \| "vertical" \| undefined` | No | 'horizontal' | The menubar's orientation. |
| class | `JSX.ClassValue \| ((state: Readonly<MenubarState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<MenubarState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLDivElement>>, MenubarState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4d656e756261722e5374617465"></a>

<a id="menubarstate"></a>

### Related exported type: Menubar.State

Declaration: `packages/solid/build/types/menubar/Menubar.d.ts:21`

#### Declaration

```typescript
MenubarState
```

<a id="api-4d656e756261722e53746174652e6861735375626d656e754f70656e"></a>

<a id="MenubarState-hasSubmenuOpen"></a>

<a id="api-4d656e756261722e53746174652e6d6f64616c"></a>

<a id="MenubarState-modal"></a>

<a id="api-4d656e756261722e53746174652e6f7269656e746174696f6e"></a>

<a id="MenubarState-orientation"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| hasSubmenuOpen | `boolean` | Yes | Unavailable |  |
| modal | `boolean` | Yes | Unavailable |  |
| orientation | `"horizontal" \| "vertical"` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4d656e7562617250726f7073"></a>

<a id="api-4d656e7562617250726f70732e70726f703a616c69676e"></a>

### Related exported type: MenubarProps

Declaration: `packages/solid/build/types/menubar/Menubar.d.ts:10`

#### Declaration

```typescript
MenubarProps
```

<a id="api-4d656e7562617250726f70732e6c6f6f70466f637573"></a>

<a id="api-4d656e7562617250726f70732e6d6f64616c"></a>

<a id="api-4d656e7562617250726f70732e64697361626c6564"></a>

<a id="api-4d656e7562617250726f70732e6f7269656e746174696f6e"></a>

<a id="api-4d656e7562617250726f70732e636c617373"></a>

<a id="api-4d656e7562617250726f70732e7374796c65"></a>

<a id="api-4d656e7562617250726f70732e72656e646572"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| loopFocus | `boolean \| undefined` | No | true | Wrap arrow-key focus at either end. |
| modal | `boolean \| undefined` | No | true | Whether menus are modal. |
| disabled | `boolean \| undefined` | No | false | Whether all menus are disabled. |
| orientation | `"horizontal" \| "vertical" \| undefined` | No | 'horizontal' | The menubar's orientation. |
| class | `JSX.ClassValue \| ((state: Readonly<MenubarState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<MenubarState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLDivElement>>, MenubarState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4d656e756261725374617465"></a>

### Related exported type: MenubarState

Declaration: `packages/solid/build/types/menubar/Menubar.d.ts:5`

#### Declaration

```typescript
MenubarState
```

<a id="api-4d656e7562617253746174652e6861735375626d656e754f70656e"></a>

<a id="api-4d656e7562617253746174652e6d6f64616c"></a>

<a id="api-4d656e7562617253746174652e6f7269656e746174696f6e"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| hasSubmenuOpen | `boolean` | Yes | Unavailable |  |
| modal | `boolean` | Yes | Unavailable |  |
| orientation | `"horizontal" \| "vertical"` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

