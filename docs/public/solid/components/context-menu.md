<a id="context-menu"></a>

# Context Menu

A menu that appears at the pointer on right click or long press.

[Open mounted Solid demo: context-menu/hero](/solid/components/context-menu)

<a id="usage-guidelines"></a>

## Usage guidelines

- **Use context menus as an enhancement**: Don't make a context menu the only way to perform actions. Users may not discover or be able to open a context menu, especially on touch devices or with assistive technology. Always provide visible controls for the actions that are available in the context menu.

<a id="anatomy"></a>

## Anatomy

Import the components and place them together:

```tsx
import { ContextMenu } from '@unstyled-solid/base-ui/context-menu';
<ContextMenu.Root>
  <ContextMenu.Trigger />
  <ContextMenu.Portal>
    <ContextMenu.Backdrop />
    <ContextMenu.Positioner>
      <ContextMenu.Popup>
        <ContextMenu.Arrow />
        <ContextMenu.Item />
        <ContextMenu.LinkItem />
        <ContextMenu.Separator />

        <ContextMenu.SubmenuRoot>
          <ContextMenu.SubmenuTrigger />
        </ContextMenu.SubmenuRoot>

        <ContextMenu.Group>
          <ContextMenu.GroupLabel />
        </ContextMenu.Group>

        <ContextMenu.RadioGroup>
          <ContextMenu.RadioItem>
            <ContextMenu.RadioItemIndicator />
          </ContextMenu.RadioItem>
        </ContextMenu.RadioGroup>

        <ContextMenu.CheckboxItem>
          <ContextMenu.CheckboxItemIndicator />
        </ContextMenu.CheckboxItem>
      </ContextMenu.Popup>
    </ContextMenu.Positioner>
  </ContextMenu.Portal>
</ContextMenu.Root>;
```

<a id="examples"></a>

## Examples

[Menu](/solid/components/menu#examples) displays additional demos, many of which apply to the context menu as well.

<a id="using-with-menu"></a>

### Using with Menu

A context menu should supplement a primary way to perform the same actions. This image card exposes actions through a visible menu button and reuses them in the context menu for right-click and long-press users.

[Open mounted Solid demo: context-menu/with-menu](/solid/components/context-menu)

<a id="nested-menu"></a>

### Nested menu

To create a submenu, create a `<ContextMenu.SubmenuRoot>` inside the parent context menu. Use the `<ContextMenu.SubmenuTrigger>` part for the menu item that opens the nested menu.

[Open mounted Solid demo: context-menu/submenu](/solid/components/context-menu)

<a id="api-reference"></a>

## API reference

<a id="root"></a>

### Root

<a id="api-436f6e746578744d656e752e526f6f74"></a>

<a id="contextmenuroot"></a>

### ContextMenu.Root

Creates a context menu activated by right clicking or long pressing.

Declaration: `packages/solid/build/types/context-menu/root/ContextMenuRoot.d.ts:5`

#### Declaration

```typescript
(props: ContextMenuRootProps) => JSX.Element
```

<a id="api-436f6e746578744d656e752e526f6f742e2470726f70732e64656661756c744f70656e"></a>

<a id="ContextMenuRoot-defaultOpen"></a>

<a id="api-436f6e746578744d656e752e526f6f742e2470726f70732e6f70656e"></a>

<a id="ContextMenuRoot-open"></a>

<a id="api-436f6e746578744d656e752e526f6f742e2470726f70732e6f6e4f70656e4368616e6765"></a>

<a id="ContextMenuRoot-onOpenChange"></a>

<a id="api-436f6e746578744d656e752e526f6f742e2470726f70732e686967686c696768744974656d4f6e486f766572"></a>

<a id="ContextMenuRoot-highlightItemOnHover"></a>

<a id="api-436f6e746578744d656e752e526f6f742e2470726f70732e616374696f6e73526566"></a>

<a id="ContextMenuRoot-actionsRef"></a>

<a id="api-436f6e746578744d656e752e526f6f742e2470726f70732e636c6f7365506172656e744f6e457363"></a>

<a id="ContextMenuRoot-closeParentOnEsc"></a>

<a id="api-436f6e746578744d656e752e526f6f742e2470726f70732e6c6f6f70466f637573"></a>

<a id="ContextMenuRoot-loopFocus"></a>

<a id="api-436f6e746578744d656e752e526f6f742e2470726f70732e6f6e4974656d486967686c696768746564"></a>

<a id="ContextMenuRoot-onItemHighlighted"></a>

<a id="api-436f6e746578744d656e752e526f6f742e2470726f70732e6f6e4f70656e4368616e6765436f6d706c657465"></a>

<a id="ContextMenuRoot-onOpenChangeComplete"></a>

<a id="api-436f6e746578744d656e752e526f6f742e2470726f70732e64697361626c6564"></a>

<a id="ContextMenuRoot-disabled"></a>

<a id="api-436f6e746578744d656e752e526f6f742e2470726f70732e6f7269656e746174696f6e"></a>

<a id="ContextMenuRoot-orientation"></a>

<a id="api-436f6e746578744d656e752e526f6f742e2470726f70732e6368696c6472656e"></a>

<a id="ContextMenuRoot-children"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| defaultOpen | `boolean \| undefined` | No | Unavailable |  |
| open | `boolean \| undefined` | No | Unavailable |  |
| onOpenChange | `((open: boolean, eventDetails: ContextMenuRootChangeEventDetails) => void) \| undefined` | No | Unavailable |  |
| highlightItemOnHover | `boolean \| undefined` | No | Unavailable |  |
| actionsRef | `MutableCell<MenuRootActions \| null> \| undefined` | No | Unavailable |  |
| closeParentOnEsc | `boolean \| undefined` | No | Unavailable |  |
| loopFocus | `boolean \| undefined` | No | Unavailable |  |
| onItemHighlighted | `((item: HTMLElement \| undefined, details: MenuRootHighlightEventDetails) => void) \| undefined` | No | Unavailable |  |
| onOpenChangeComplete | `((open: boolean) => void) \| undefined` | No | Unavailable |  |
| disabled | `boolean \| undefined` | No | Unavailable |  |
| orientation | `MenuRootOrientation \| undefined` | No | Unavailable |  |
| children | `JSX.Element` | No | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6e746578744d656e752e526f6f742e50726f7073"></a>

<a id="contextmenurootprops"></a>

### Related exported type: ContextMenu.Root.Props

Declaration: `packages/solid/build/types/context-menu/root/ContextMenuRoot.d.ts:24`

#### Declaration

```typescript
ContextMenuRootProps
```

<a id="api-436f6e746578744d656e752e526f6f742e50726f70732e64656661756c744f70656e"></a>

<a id="ContextMenuRootProps-defaultOpen"></a>

<a id="api-436f6e746578744d656e752e526f6f742e50726f70732e6f70656e"></a>

<a id="ContextMenuRootProps-open"></a>

<a id="api-436f6e746578744d656e752e526f6f742e50726f70732e6f6e4f70656e4368616e6765"></a>

<a id="ContextMenuRootProps-onOpenChange"></a>

<a id="api-436f6e746578744d656e752e526f6f742e50726f70732e686967686c696768744974656d4f6e486f766572"></a>

<a id="ContextMenuRootProps-highlightItemOnHover"></a>

<a id="api-436f6e746578744d656e752e526f6f742e50726f70732e616374696f6e73526566"></a>

<a id="ContextMenuRootProps-actionsRef"></a>

<a id="api-436f6e746578744d656e752e526f6f742e50726f70732e636c6f7365506172656e744f6e457363"></a>

<a id="ContextMenuRootProps-closeParentOnEsc"></a>

<a id="api-436f6e746578744d656e752e526f6f742e50726f70732e6c6f6f70466f637573"></a>

<a id="ContextMenuRootProps-loopFocus"></a>

<a id="api-436f6e746578744d656e752e526f6f742e50726f70732e6f6e4974656d486967686c696768746564"></a>

<a id="ContextMenuRootProps-onItemHighlighted"></a>

<a id="api-436f6e746578744d656e752e526f6f742e50726f70732e6f6e4f70656e4368616e6765436f6d706c657465"></a>

<a id="ContextMenuRootProps-onOpenChangeComplete"></a>

<a id="api-436f6e746578744d656e752e526f6f742e50726f70732e64697361626c6564"></a>

<a id="ContextMenuRootProps-disabled"></a>

<a id="api-436f6e746578744d656e752e526f6f742e50726f70732e6f7269656e746174696f6e"></a>

<a id="ContextMenuRootProps-orientation"></a>

<a id="api-436f6e746578744d656e752e526f6f742e50726f70732e6368696c6472656e"></a>

<a id="ContextMenuRootProps-children"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| defaultOpen | `boolean \| undefined` | No | Unavailable |  |
| open | `boolean \| undefined` | No | Unavailable |  |
| onOpenChange | `((open: boolean, eventDetails: ContextMenuRootChangeEventDetails) => void) \| undefined` | No | Unavailable |  |
| highlightItemOnHover | `boolean \| undefined` | No | Unavailable |  |
| actionsRef | `MutableCell<MenuRootActions \| null> \| undefined` | No | Unavailable |  |
| closeParentOnEsc | `boolean \| undefined` | No | Unavailable |  |
| loopFocus | `boolean \| undefined` | No | Unavailable |  |
| onItemHighlighted | `((item: HTMLElement \| undefined, details: MenuRootHighlightEventDetails) => void) \| undefined` | No | Unavailable |  |
| onOpenChangeComplete | `((open: boolean) => void) \| undefined` | No | Unavailable |  |
| disabled | `boolean \| undefined` | No | Unavailable |  |
| orientation | `MenuRootOrientation \| undefined` | No | Unavailable |  |
| children | `JSX.Element` | No | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6e746578744d656e752e526f6f742e5374617465"></a>

<a id="contextmenurootstate"></a>

### Related exported type: ContextMenu.Root.State

Declaration: `packages/solid/build/types/context-menu/root/ContextMenuRoot.d.ts:23`

#### Declaration

```typescript
ContextMenuRootState
```

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6e746578744d656e752e526f6f742e416374696f6e73"></a>

<a id="contextmenurootactions"></a>

### Related exported type: ContextMenu.Root.Actions

Declaration: `packages/solid/build/types/context-menu/root/ContextMenuRoot.d.ts:25`

#### Declaration

```typescript
ContextMenuRootActions
```

<a id="api-436f6e746578744d656e752e526f6f742e416374696f6e732e636c6f7365"></a>

<a id="ContextMenuRootActions-close"></a>

<a id="api-436f6e746578744d656e752e526f6f742e416374696f6e732e686967686c696768744974656d"></a>

<a id="ContextMenuRootActions-highlightItem"></a>

<a id="api-436f6e746578744d656e752e526f6f742e416374696f6e732e756e6d6f756e74"></a>

<a id="ContextMenuRootActions-unmount"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| close | `() => void` | Yes | Unavailable |  |
| highlightItem | `(target: ContextMenuRootHighlightItemTarget) => void` | Yes | Unavailable |  |
| unmount | `() => void` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6e746578744d656e752e526f6f742e4368616e67654576656e74526561736f6e"></a>

<a id="contextmenurootchangeeventreason"></a>

### Related exported type: ContextMenu.Root.ChangeEventReason

Declaration: `packages/solid/build/types/context-menu/root/ContextMenuRoot.d.ts:27`

#### Declaration

```typescript
MenuRootChangeEventReason
```

Inherited DOM attributes: `__@iterator@106`, `anchor`, `at`, `big`, `blink`, `bold`, `charAt`, `charCodeAt`, `codePointAt`, `concat`, `endsWith`, `fixed`, `fontcolor`, `fontsize`, `includes`, `indexOf`, `isWellFormed`, `italics`, `lastIndexOf`, `length`, `link`, `localeCompare`, `match`, `matchAll`, `normalize`, `padEnd`, `padStart`, `repeat`, `replace`, `replaceAll`, `search`, `slice`, `small`, `split`, `startsWith`, `strike`, `sub`, `substr`, `substring`, `sup`, `toLocaleLowerCase`, `toLocaleUpperCase`, `toLowerCase`, `toString`, `toUpperCase`, `toWellFormed`, `trim`, `trimEnd`, `trimLeft`, `trimRight`, `trimStart`, `valueOf`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6e746578744d656e752e526f6f742e4368616e67654576656e7444657461696c73"></a>

<a id="contextmenurootchangeeventdetails"></a>

### Related exported type: ContextMenu.Root.ChangeEventDetails

Declaration: `packages/solid/build/types/context-menu/root/ContextMenuRoot.d.ts:28`

#### Declaration

```typescript
ContextMenuRootChangeEventDetails
```

<a id="api-436f6e746578744d656e752e526f6f742e4368616e67654576656e7444657461696c732e616c6c6f7750726f7061676174696f6e"></a>

<a id="ContextMenuRootChangeEventDetails-allowPropagation"></a>

<a id="api-436f6e746578744d656e752e526f6f742e4368616e67654576656e7444657461696c732e63616e63656c"></a>

<a id="ContextMenuRootChangeEventDetails-cancel"></a>

<a id="api-436f6e746578744d656e752e526f6f742e4368616e67654576656e7444657461696c732e6576656e74"></a>

<a id="ContextMenuRootChangeEventDetails-event"></a>

<a id="api-436f6e746578744d656e752e526f6f742e4368616e67654576656e7444657461696c732e697343616e63656c6564"></a>

<a id="ContextMenuRootChangeEventDetails-isCanceled"></a>

<a id="api-436f6e746578744d656e752e526f6f742e4368616e67654576656e7444657461696c732e697350726f7061676174696f6e416c6c6f776564"></a>

<a id="ContextMenuRootChangeEventDetails-isPropagationAllowed"></a>

<a id="api-436f6e746578744d656e752e526f6f742e4368616e67654576656e7444657461696c732e726561736f6e"></a>

<a id="ContextMenuRootChangeEventDetails-reason"></a>

<a id="api-436f6e746578744d656e752e526f6f742e4368616e67654576656e7444657461696c732e74726967676572"></a>

<a id="ContextMenuRootChangeEventDetails-trigger"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| allowPropagation | `() => void` | Yes | Unavailable | Marks this change transaction as allowing propagation. |
| cancel | `() => void` | Yes | Unavailable | Cancels the Base UI change transaction; separate from the DOM event’s preventDefault() and preventBaseUIHandler(). |
| event | `PointerEvent \| MouseEvent \| Event \| FocusEvent \| KeyboardEvent \| TouchEvent` | Yes | Unavailable | Native DOM event associated with the change. Programmatic changes can use a Base UI-created Event. |
| isCanceled | `boolean` | Yes | Unavailable | Whether cancel() has been called for this change transaction. |
| isPropagationAllowed | `boolean` | Yes | Unavailable | Whether allowPropagation() has been called for this change transaction. |
| reason | `"none" \| "trigger-press" \| "trigger-hover" \| "trigger-focus" \| "outside-press" \| "item-press" \| "close-press" \| "focus-out" \| "escape-key" \| "list-navigation" \| "cancel-open" \| "sibling-open" \| "imperative-action"` | Yes | Unavailable | Reason for the requested change; it discriminates the native event type. |
| trigger | `Element \| undefined` | Yes | Unavailable | Trigger element associated with this change, when available. |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6e746578744d656e752e526f6f742e486967686c696768744974656d546172676574"></a>

<a id="contextmenuroothighlightitemtarget"></a>

### Related exported type: ContextMenu.Root.HighlightItemTarget

Declaration: `packages/solid/build/types/context-menu/root/ContextMenuRoot.d.ts:26`

#### Declaration

```typescript
MenuRootHighlightItemTarget
```

Inherited DOM attributes: `__@iterator@106`, `anchor`, `at`, `big`, `blink`, `bold`, `charAt`, `charCodeAt`, `codePointAt`, `concat`, `endsWith`, `fixed`, `fontcolor`, `fontsize`, `includes`, `indexOf`, `isWellFormed`, `italics`, `lastIndexOf`, `length`, `link`, `localeCompare`, `match`, `matchAll`, `normalize`, `padEnd`, `padStart`, `repeat`, `replace`, `replaceAll`, `search`, `slice`, `small`, `split`, `startsWith`, `strike`, `sub`, `substr`, `substring`, `sup`, `toLocaleLowerCase`, `toLocaleUpperCase`, `toLowerCase`, `toString`, `toUpperCase`, `toWellFormed`, `trim`, `trimEnd`, `trimLeft`, `trimRight`, `trimStart`, `valueOf`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="trigger"></a>

### Trigger

<a id="api-436f6e746578744d656e752e54726967676572"></a>

<a id="contextmenutrigger"></a>

<a id="api-436f6e746578744d656e752e547269676765722e2470726f70732e70726f703a616c69676e"></a>

### ContextMenu.Trigger

An area that opens the menu on right click or long press. Renders a div.

Declaration: `packages/solid/build/types/context-menu/trigger/ContextMenuTrigger.d.ts:3`

#### Declaration

```typescript
(componentProps: ContextMenuTriggerProps) => JSX.Element
```

<a id="api-436f6e746578744d656e752e547269676765722e2470726f70732e636c617373"></a>

<a id="ContextMenuTrigger-class"></a>

<a id="api-436f6e746578744d656e752e547269676765722e2470726f70732e7374796c65"></a>

<a id="ContextMenuTrigger-style"></a>

<a id="api-436f6e746578744d656e752e547269676765722e2470726f70732e72656e646572"></a>

<a id="ContextMenuTrigger-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<ContextMenuTriggerState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ContextMenuTriggerState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ContextMenuTriggerState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-436f6e746578744d656e755472696767657244617461417474726962757465732e706f7075704f70656e"></a>

<a id="api-436f6e746578744d656e755472696767657244617461417474726962757465732e70726573736564"></a>

| Name | Description |
| --- | --- |
| data-popup-open | Present when the corresponding context menu is open. |
| data-pressed | Present when the corresponding context menu is open. |

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6e746578744d656e752e547269676765722e50726f7073"></a>

<a id="contextmenutriggerprops"></a>

<a id="api-436f6e746578744d656e752e547269676765722e50726f70732e70726f703a616c69676e"></a>

### Related exported type: ContextMenu.Trigger.Props

Declaration: `packages/solid/build/types/context-menu/trigger/ContextMenuTrigger.d.ts:11`

#### Declaration

```typescript
ContextMenuTriggerProps
```

<a id="api-436f6e746578744d656e752e547269676765722e50726f70732e636c617373"></a>

<a id="ContextMenuTriggerProps-class"></a>

<a id="api-436f6e746578744d656e752e547269676765722e50726f70732e7374796c65"></a>

<a id="ContextMenuTriggerProps-style"></a>

<a id="api-436f6e746578744d656e752e547269676765722e50726f70732e72656e646572"></a>

<a id="ContextMenuTriggerProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<ContextMenuTriggerState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ContextMenuTriggerState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ContextMenuTriggerState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6e746578744d656e752e547269676765722e5374617465"></a>

<a id="contextmenutriggerstate"></a>

### Related exported type: ContextMenu.Trigger.State

Declaration: `packages/solid/build/types/context-menu/trigger/ContextMenuTrigger.d.ts:10`

#### Declaration

```typescript
ContextMenuTriggerState
```

<a id="api-436f6e746578744d656e752e547269676765722e53746174652e6f70656e"></a>

<a id="ContextMenuTriggerState-open"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| open | `boolean` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="portal"></a>

### Portal

<a id="api-436f6e746578744d656e752e506f7274616c"></a>

<a id="contextmenuportal"></a>

<a id="api-436f6e746578744d656e752e506f7274616c2e2470726f70732e70726f703a616c69676e"></a>

### ContextMenu.Portal

Declaration: `packages/solid/build/types/menu/portal/MenuPortal.d.ts:9`

#### Declaration

```typescript
(props: MenuPortalProps) => JSX.Element
```

<a id="api-436f6e746578744d656e752e506f7274616c2e2470726f70732e636f6e7461696e6572"></a>

<a id="ContextMenuPortal-container"></a>

<a id="api-436f6e746578744d656e752e506f7274616c2e2470726f70732e636c617373"></a>

<a id="ContextMenuPortal-class"></a>

<a id="api-436f6e746578744d656e752e506f7274616c2e2470726f70732e7374796c65"></a>

<a id="ContextMenuPortal-style"></a>

<a id="api-436f6e746578744d656e752e506f7274616c2e2470726f70732e6b6565704d6f756e746564"></a>

<a id="ContextMenuPortal-keepMounted"></a>

<a id="api-436f6e746578744d656e752e506f7274616c2e2470726f70732e72656e646572"></a>

<a id="ContextMenuPortal-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| container | `PortalContainer` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<ContextMenuPortalState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ContextMenuPortalState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| keepMounted | `boolean \| undefined` | No | false |  |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ContextMenuPortalState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6e746578744d656e752e506f7274616c2e50726f7073"></a>

<a id="contextmenuportalprops"></a>

<a id="api-436f6e746578744d656e752e506f7274616c2e50726f70732e70726f703a616c69676e"></a>

### Related exported type: ContextMenu.Portal.Props

Declaration: `packages/solid/build/types/menu/portal/MenuPortal.d.ts:11`

#### Declaration

```typescript
MenuPortalProps
```

<a id="api-436f6e746578744d656e752e506f7274616c2e50726f70732e636f6e7461696e6572"></a>

<a id="ContextMenuPortalProps-container"></a>

<a id="api-436f6e746578744d656e752e506f7274616c2e50726f70732e636c617373"></a>

<a id="ContextMenuPortalProps-class"></a>

<a id="api-436f6e746578744d656e752e506f7274616c2e50726f70732e7374796c65"></a>

<a id="ContextMenuPortalProps-style"></a>

<a id="api-436f6e746578744d656e752e506f7274616c2e50726f70732e6b6565704d6f756e746564"></a>

<a id="ContextMenuPortalProps-keepMounted"></a>

<a id="api-436f6e746578744d656e752e506f7274616c2e50726f70732e72656e646572"></a>

<a id="ContextMenuPortalProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| container | `PortalContainer` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<ContextMenuPortalState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ContextMenuPortalState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| keepMounted | `boolean \| undefined` | No | Unavailable |  |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ContextMenuPortalState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6e746578744d656e752e506f7274616c2e5374617465"></a>

<a id="contextmenuportalstate"></a>

### Related exported type: ContextMenu.Portal.State

Declaration: `packages/solid/build/types/menu/portal/MenuPortal.d.ts:12`

#### Declaration

```typescript
MenuPortalState
```

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="backdrop"></a>

### Backdrop

<a id="api-436f6e746578744d656e752e4261636b64726f70"></a>

<a id="contextmenubackdrop"></a>

<a id="api-436f6e746578744d656e752e4261636b64726f702e2470726f70732e70726f703a616c69676e"></a>

### ContextMenu.Backdrop

Declaration: `packages/solid/build/types/menu/backdrop/MenuBackdrop.d.ts:9`

#### Declaration

```typescript
(props: MenuBackdropProps) => JSX.Element
```

<a id="api-436f6e746578744d656e752e4261636b64726f702e2470726f70732e636c617373"></a>

<a id="ContextMenuBackdrop-class"></a>

<a id="api-436f6e746578744d656e752e4261636b64726f702e2470726f70732e7374796c65"></a>

<a id="ContextMenuBackdrop-style"></a>

<a id="api-436f6e746578744d656e752e4261636b64726f702e2470726f70732e72656e646572"></a>

<a id="ContextMenuBackdrop-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<ContextMenuBackdropState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ContextMenuBackdropState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ContextMenuBackdropState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-436f6e746578744d656e752e4261636b64726f702e64617461417474726962757465732e6f70656e"></a>

<a id="api-436f6e746578744d656e752e4261636b64726f702e64617461417474726962757465732e636c6f736564"></a>

<a id="api-436f6e746578744d656e752e4261636b64726f702e64617461417474726962757465732e7374617274696e675374796c65"></a>

<a id="api-436f6e746578744d656e752e4261636b64726f702e64617461417474726962757465732e656e64696e675374796c65"></a>

| Name | Description |
| --- | --- |
| data-open |  |
| data-closed |  |
| data-starting-style |  |
| data-ending-style |  |

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6e746578744d656e752e4261636b64726f702e50726f7073"></a>

<a id="contextmenubackdropprops"></a>

<a id="api-436f6e746578744d656e752e4261636b64726f702e50726f70732e70726f703a616c69676e"></a>

### Related exported type: ContextMenu.Backdrop.Props

Declaration: `packages/solid/build/types/menu/backdrop/MenuBackdrop.d.ts:11`

#### Declaration

```typescript
MenuBackdropProps
```

<a id="api-436f6e746578744d656e752e4261636b64726f702e50726f70732e636c617373"></a>

<a id="ContextMenuBackdropProps-class"></a>

<a id="api-436f6e746578744d656e752e4261636b64726f702e50726f70732e7374796c65"></a>

<a id="ContextMenuBackdropProps-style"></a>

<a id="api-436f6e746578744d656e752e4261636b64726f702e50726f70732e72656e646572"></a>

<a id="ContextMenuBackdropProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<ContextMenuBackdropState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ContextMenuBackdropState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ContextMenuBackdropState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6e746578744d656e752e4261636b64726f702e5374617465"></a>

<a id="contextmenubackdropstate"></a>

### Related exported type: ContextMenu.Backdrop.State

Declaration: `packages/solid/build/types/menu/backdrop/MenuBackdrop.d.ts:12`

#### Declaration

```typescript
MenuBackdropState
```

<a id="api-436f6e746578744d656e752e4261636b64726f702e53746174652e6f70656e"></a>

<a id="ContextMenuBackdropState-open"></a>

<a id="api-436f6e746578744d656e752e4261636b64726f702e53746174652e7472616e736974696f6e537461747573"></a>

<a id="ContextMenuBackdropState-transitionStatus"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| open | `boolean` | Yes | Unavailable |  |
| transitionStatus | `TransitionStatus` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="positioner"></a>

### Positioner

<a id="api-436f6e746578744d656e752e506f736974696f6e6572"></a>

<a id="contextmenupositioner"></a>

<a id="api-436f6e746578744d656e752e506f736974696f6e65722e2470726f70732e70726f703a616c69676e"></a>

### ContextMenu.Positioner

Positions against the pointer (root) or submenu trigger; the Menu engine owns defaults.

Declaration: `packages/solid/build/types/context-menu/positioner/ContextMenuPositioner.d.ts:7`

#### Declaration

```typescript
(props: MenuPositionerProps) => JSX.Element
```

<a id="api-436f6e746578744d656e752e506f736974696f6e65722e2470726f70732e64697361626c65416e63686f72547261636b696e67"></a>

<a id="ContextMenuPositioner-disableAnchorTracking"></a>

<a id="api-436f6e746578744d656e752e506f736974696f6e65722e2470726f70732e616c69676e"></a>

<a id="ContextMenuPositioner-align"></a>

<a id="api-436f6e746578744d656e752e506f736974696f6e65722e2470726f70732e616c69676e4f6666736574"></a>

<a id="ContextMenuPositioner-alignOffset"></a>

<a id="api-436f6e746578744d656e752e506f736974696f6e65722e2470726f70732e73696465"></a>

<a id="ContextMenuPositioner-side"></a>

<a id="api-436f6e746578744d656e752e506f736974696f6e65722e2470726f70732e736964654f6666736574"></a>

<a id="ContextMenuPositioner-sideOffset"></a>

<a id="api-436f6e746578744d656e752e506f736974696f6e65722e2470726f70732e6172726f7750616464696e67"></a>

<a id="ContextMenuPositioner-arrowPadding"></a>

<a id="api-436f6e746578744d656e752e506f736974696f6e65722e2470726f70732e616e63686f72"></a>

<a id="ContextMenuPositioner-anchor"></a>

<a id="api-436f6e746578744d656e752e506f736974696f6e65722e2470726f70732e636f6c6c6973696f6e41766f6964616e6365"></a>

<a id="ContextMenuPositioner-collisionAvoidance"></a>

<a id="api-436f6e746578744d656e752e506f736974696f6e65722e2470726f70732e636f6c6c6973696f6e426f756e64617279"></a>

<a id="ContextMenuPositioner-collisionBoundary"></a>

<a id="api-436f6e746578744d656e752e506f736974696f6e65722e2470726f70732e636f6c6c6973696f6e50616464696e67"></a>

<a id="ContextMenuPositioner-collisionPadding"></a>

<a id="api-436f6e746578744d656e752e506f736974696f6e65722e2470726f70732e737469636b79"></a>

<a id="ContextMenuPositioner-sticky"></a>

<a id="api-436f6e746578744d656e752e506f736974696f6e65722e2470726f70732e706f736974696f6e4d6574686f64"></a>

<a id="ContextMenuPositioner-positionMethod"></a>

<a id="api-436f6e746578744d656e752e506f736974696f6e65722e2470726f70732e636c617373"></a>

<a id="ContextMenuPositioner-class"></a>

<a id="api-436f6e746578744d656e752e506f736974696f6e65722e2470726f70732e7374796c65"></a>

<a id="ContextMenuPositioner-style"></a>

<a id="api-436f6e746578744d656e752e506f736974696f6e65722e2470726f70732e72656e646572"></a>

<a id="ContextMenuPositioner-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| disableAnchorTracking | `boolean \| undefined` | No | Unavailable | Disables ancestor-scroll, element-resize and layout-shift observation used for automatic positioning updates. |
| align | `Align \| undefined` | No | Unavailable | Preferred alignment along the anchor’s side. Collision handling can change the resolved alignment. |
| alignOffset | `number \| OffsetFunction \| undefined` | No | Unavailable | Offset along the alignment axis, in pixels. A callback receives anchor and positioner dimensions plus the side and alignment. |
| side | `Side \| undefined` | No | Unavailable | Preferred side of the anchor. Logical inline sides follow the text direction; collision handling can change the resolved side. |
| sideOffset | `number \| OffsetFunction \| undefined` | No | Unavailable | Distance from the anchor along the side axis, in pixels. A callback receives anchor and positioner dimensions plus the side and alignment. |
| arrowPadding | `number \| undefined` | No | Unavailable | Minimum padding in pixels between the arrow and the floating element’s edges. |
| anchor | `ReferenceType \| (() => ReferenceType \| null) \| null \| undefined` | No | Unavailable | Positioning reference: an element or virtual reference, or an accessor returning one. A nullish reference falls back to the root’s reference. |
| collisionAvoidance | `{ side?: "flip" \| "shift" \| "none"; align?: "flip" \| "shift" \| "none"; fallbackAxisSide?: "start" \| "end" \| "none"; } \| undefined` | No | Unavailable | Controls flipping or shifting along the side and alignment axes, including fallback placement on the perpendicular axis. |
| collisionBoundary | `Boundary \| "clipping-ancestors" \| undefined` | No | Unavailable | Boundary used to detect overflow. The clipping-ancestors value uses clipping ancestors as the overflow boundary. |
| collisionPadding | `Padding \| undefined` | No | Unavailable | Space in pixels reserved inside the collision boundary, either for all edges or per edge. |
| sticky | `boolean \| undefined` | No | Unavailable | Allows shifting along the side axis without the usual limitShift limiter. |
| positionMethod | `"fixed" \| "absolute" \| undefined` | No | Unavailable | CSS positioning strategy used by the floating element: absolute or fixed. |
| class | `JSX.ClassValue \| ((state: Readonly<MenuPositionerState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<MenuPositionerState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, MenuPositionerState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-436f6e746578744d656e75506f736974696f6e657244617461417474726962757465732e6f70656e"></a>

<a id="api-436f6e746578744d656e75506f736974696f6e657244617461417474726962757465732e636c6f736564"></a>

<a id="api-436f6e746578744d656e75506f736974696f6e657244617461417474726962757465732e616e63686f7248696464656e"></a>

<a id="api-436f6e746578744d656e75506f736974696f6e657244617461417474726962757465732e616c69676e"></a>

<a id="api-436f6e746578744d656e75506f736974696f6e657244617461417474726962757465732e73696465"></a>

| Name | Description |
| --- | --- |
| data-open |  |
| data-closed |  |
| data-anchor-hidden |  |
| data-align |  |
| data-side |  |

#### CSS variables

<a id="api-436f6e746578744d656e75506f736974696f6e65724373735661726961626c65732e616e63686f72486569676874"></a>

<a id="api-436f6e746578744d656e75506f736974696f6e65724373735661726961626c65732e616e63686f725769647468"></a>

<a id="api-436f6e746578744d656e75506f736974696f6e65724373735661726961626c65732e617661696c61626c65486569676874"></a>

<a id="api-436f6e746578744d656e75506f736974696f6e65724373735661726961626c65732e617661696c61626c655769647468"></a>

<a id="api-436f6e746578744d656e75506f736974696f6e65724373735661726961626c65732e706f736974696f6e6572486569676874"></a>

<a id="api-436f6e746578744d656e75506f736974696f6e65724373735661726961626c65732e706f736974696f6e65725769647468"></a>

<a id="api-436f6e746578744d656e75506f736974696f6e65724373735661726961626c65732e7472616e73666f726d4f726967696e"></a>

| Name | Description |
| --- | --- |
| --anchor-height |  |
| --anchor-width |  |
| --available-height |  |
| --available-width |  |
| --positioner-height |  |
| --positioner-width |  |
| --transform-origin |  |

<a id="api-436f6e746578744d656e752e506f736974696f6e65722e50726f7073"></a>

<a id="contextmenupositionerprops"></a>

<a id="api-436f6e746578744d656e752e506f736974696f6e65722e50726f70732e70726f703a616c69676e"></a>

### Related exported type: ContextMenu.Positioner.Props

Declaration: `packages/solid/build/types/context-menu/positioner/ContextMenuPositioner.d.ts:24`

#### Declaration

```typescript
ContextMenuPositionerProps
```

<a id="api-436f6e746578744d656e752e506f736974696f6e65722e50726f70732e64697361626c65416e63686f72547261636b696e67"></a>

<a id="ContextMenuPositionerProps-disableAnchorTracking"></a>

<a id="api-436f6e746578744d656e752e506f736974696f6e65722e50726f70732e616c69676e"></a>

<a id="ContextMenuPositionerProps-align"></a>

<a id="api-436f6e746578744d656e752e506f736974696f6e65722e50726f70732e616c69676e4f6666736574"></a>

<a id="ContextMenuPositionerProps-alignOffset"></a>

<a id="api-436f6e746578744d656e752e506f736974696f6e65722e50726f70732e73696465"></a>

<a id="ContextMenuPositionerProps-side"></a>

<a id="api-436f6e746578744d656e752e506f736974696f6e65722e50726f70732e736964654f6666736574"></a>

<a id="ContextMenuPositionerProps-sideOffset"></a>

<a id="api-436f6e746578744d656e752e506f736974696f6e65722e50726f70732e6172726f7750616464696e67"></a>

<a id="ContextMenuPositionerProps-arrowPadding"></a>

<a id="api-436f6e746578744d656e752e506f736974696f6e65722e50726f70732e616e63686f72"></a>

<a id="ContextMenuPositionerProps-anchor"></a>

<a id="api-436f6e746578744d656e752e506f736974696f6e65722e50726f70732e636f6c6c6973696f6e41766f6964616e6365"></a>

<a id="ContextMenuPositionerProps-collisionAvoidance"></a>

<a id="api-436f6e746578744d656e752e506f736974696f6e65722e50726f70732e636f6c6c6973696f6e426f756e64617279"></a>

<a id="ContextMenuPositionerProps-collisionBoundary"></a>

<a id="api-436f6e746578744d656e752e506f736974696f6e65722e50726f70732e636f6c6c6973696f6e50616464696e67"></a>

<a id="ContextMenuPositionerProps-collisionPadding"></a>

<a id="api-436f6e746578744d656e752e506f736974696f6e65722e50726f70732e737469636b79"></a>

<a id="ContextMenuPositionerProps-sticky"></a>

<a id="api-436f6e746578744d656e752e506f736974696f6e65722e50726f70732e706f736974696f6e4d6574686f64"></a>

<a id="ContextMenuPositionerProps-positionMethod"></a>

<a id="api-436f6e746578744d656e752e506f736974696f6e65722e50726f70732e636c617373"></a>

<a id="ContextMenuPositionerProps-class"></a>

<a id="api-436f6e746578744d656e752e506f736974696f6e65722e50726f70732e7374796c65"></a>

<a id="ContextMenuPositionerProps-style"></a>

<a id="api-436f6e746578744d656e752e506f736974696f6e65722e50726f70732e72656e646572"></a>

<a id="ContextMenuPositionerProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| disableAnchorTracking | `boolean \| undefined` | No | Unavailable | Disables ancestor-scroll, element-resize and layout-shift observation used for automatic positioning updates. |
| align | `Align \| undefined` | No | 'start' |  |
| alignOffset | `number \| OffsetFunction \| undefined` | No | Unavailable | Root default: 2 when side is omitted and align is not center; otherwise 0. |
| side | `Side \| undefined` | No | 'bottom' (submenus: 'inline-end') |  |
| sideOffset | `number \| OffsetFunction \| undefined` | No | Unavailable | Root default: -5 when side is omitted and align is not center; otherwise 0. |
| arrowPadding | `number \| undefined` | No | Unavailable | Root context menus always use 0; submenus default to 5. |
| anchor | `ReferenceType \| (() => ReferenceType \| null) \| null \| undefined` | No | Unavailable |  |
| collisionAvoidance | `{ side?: "flip" \| "shift" \| "none"; align?: "flip" \| "shift" \| "none"; fallbackAxisSide?: "start" \| "end" \| "none"; } \| undefined` | No | Unavailable | Controls flipping or shifting along the side and alignment axes, including fallback placement on the perpendicular axis. |
| collisionBoundary | `Boundary \| "clipping-ancestors" \| undefined` | No | Unavailable | Boundary used to detect overflow. The clipping-ancestors value uses clipping ancestors as the overflow boundary. |
| collisionPadding | `Padding \| undefined` | No | Unavailable | Space in pixels reserved inside the collision boundary, either for all edges or per edge. |
| sticky | `boolean \| undefined` | No | Unavailable | Allows shifting along the side axis without the usual limitShift limiter. |
| positionMethod | `"fixed" \| "absolute" \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<ContextMenuPositionerState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ContextMenuPositionerState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ContextMenuPositionerState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6e746578744d656e752e506f736974696f6e65722e5374617465"></a>

<a id="contextmenupositionerstate"></a>

### Related exported type: ContextMenu.Positioner.State

Declaration: `packages/solid/build/types/context-menu/positioner/ContextMenuPositioner.d.ts:25`

#### Declaration

```typescript
ContextMenuPositionerState
```

<a id="api-436f6e746578744d656e752e506f736974696f6e65722e53746174652e6f70656e"></a>

<a id="ContextMenuPositionerState-open"></a>

<a id="api-436f6e746578744d656e752e506f736974696f6e65722e53746174652e616e63686f7248696464656e"></a>

<a id="ContextMenuPositionerState-anchorHidden"></a>

<a id="api-436f6e746578744d656e752e506f736974696f6e65722e53746174652e696e7374616e74"></a>

<a id="ContextMenuPositionerState-instant"></a>

<a id="api-436f6e746578744d656e752e506f736974696f6e65722e53746174652e6e6573746564"></a>

<a id="ContextMenuPositionerState-nested"></a>

<a id="api-436f6e746578744d656e752e506f736974696f6e65722e53746174652e616c69676e"></a>

<a id="ContextMenuPositionerState-align"></a>

<a id="api-436f6e746578744d656e752e506f736974696f6e65722e53746174652e73696465"></a>

<a id="ContextMenuPositionerState-side"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| open | `boolean` | Yes | Unavailable |  |
| anchorHidden | `boolean` | Yes | Unavailable |  |
| instant | `string \| undefined` | Yes | Unavailable |  |
| nested | `boolean` | Yes | Unavailable |  |
| align | `Align` | Yes | Unavailable |  |
| side | `Side` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="popup"></a>

### Popup

<a id="api-436f6e746578744d656e752e506f707570"></a>

<a id="contextmenupopup"></a>

<a id="api-436f6e746578744d656e752e506f7075702e2470726f70732e70726f703a616c69676e"></a>

### ContextMenu.Popup

Declaration: `packages/solid/build/types/menu/popup/MenuPopup.d.ts:22`

#### Declaration

```typescript
(props: MenuPopupProps) => JSX.Element
```

<a id="api-436f6e746578744d656e752e506f7075702e2470726f70732e66696e616c466f637573"></a>

<a id="ContextMenuPopup-finalFocus"></a>

<a id="api-436f6e746578744d656e752e506f7075702e2470726f70732e636c617373"></a>

<a id="ContextMenuPopup-class"></a>

<a id="api-436f6e746578744d656e752e506f7075702e2470726f70732e7374796c65"></a>

<a id="ContextMenuPopup-style"></a>

<a id="api-436f6e746578744d656e752e506f7075702e2470726f70732e72656e646572"></a>

<a id="ContextMenuPopup-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| finalFocus | `boolean \| (() => HTMLElement \| null) \| ((closeType: InteractionType) => boolean \| HTMLElement \| null \| void) \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<ContextMenuPopupState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ContextMenuPopupState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ContextMenuPopupState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-436f6e746578744d656e752e506f7075702e64617461417474726962757465732e6f70656e"></a>

<a id="api-436f6e746578744d656e752e506f7075702e64617461417474726962757465732e636c6f736564"></a>

<a id="api-436f6e746578744d656e752e506f7075702e64617461417474726962757465732e616c69676e"></a>

<a id="api-436f6e746578744d656e752e506f7075702e64617461417474726962757465732e696e7374616e74"></a>

<a id="api-436f6e746578744d656e752e506f7075702e64617461417474726962757465732e73696465"></a>

<a id="api-436f6e746578744d656e752e506f7075702e64617461417474726962757465732e7374617274696e675374796c65"></a>

<a id="api-436f6e746578744d656e752e506f7075702e64617461417474726962757465732e656e64696e675374796c65"></a>

| Name | Description |
| --- | --- |
| data-open |  |
| data-closed |  |
| data-align |  |
| data-instant |  |
| data-side |  |
| data-starting-style |  |
| data-ending-style |  |

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6e746578744d656e752e506f7075702e50726f7073"></a>

<a id="contextmenupopupprops"></a>

<a id="api-436f6e746578744d656e752e506f7075702e50726f70732e70726f703a616c69676e"></a>

### Related exported type: ContextMenu.Popup.Props

Declaration: `packages/solid/build/types/menu/popup/MenuPopup.d.ts:24`

#### Declaration

```typescript
MenuPopupProps
```

<a id="api-436f6e746578744d656e752e506f7075702e50726f70732e66696e616c466f637573"></a>

<a id="ContextMenuPopupProps-finalFocus"></a>

<a id="api-436f6e746578744d656e752e506f7075702e50726f70732e636c617373"></a>

<a id="ContextMenuPopupProps-class"></a>

<a id="api-436f6e746578744d656e752e506f7075702e50726f70732e7374796c65"></a>

<a id="ContextMenuPopupProps-style"></a>

<a id="api-436f6e746578744d656e752e506f7075702e50726f70732e72656e646572"></a>

<a id="ContextMenuPopupProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| finalFocus | `boolean \| (() => HTMLElement \| null) \| ((closeType: InteractionType) => boolean \| HTMLElement \| null \| void) \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<ContextMenuPopupState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ContextMenuPopupState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ContextMenuPopupState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6e746578744d656e752e506f7075702e5374617465"></a>

<a id="contextmenupopupstate"></a>

### Related exported type: ContextMenu.Popup.State

Declaration: `packages/solid/build/types/menu/popup/MenuPopup.d.ts:25`

#### Declaration

```typescript
MenuPopupState
```

<a id="api-436f6e746578744d656e752e506f7075702e53746174652e6f70656e"></a>

<a id="ContextMenuPopupState-open"></a>

<a id="api-436f6e746578744d656e752e506f7075702e53746174652e696e7374616e74"></a>

<a id="ContextMenuPopupState-instant"></a>

<a id="api-436f6e746578744d656e752e506f7075702e53746174652e6e6573746564"></a>

<a id="ContextMenuPopupState-nested"></a>

<a id="api-436f6e746578744d656e752e506f7075702e53746174652e7472616e736974696f6e537461747573"></a>

<a id="ContextMenuPopupState-transitionStatus"></a>

<a id="api-436f6e746578744d656e752e506f7075702e53746174652e616c69676e"></a>

<a id="ContextMenuPopupState-align"></a>

<a id="api-436f6e746578744d656e752e506f7075702e53746174652e73696465"></a>

<a id="ContextMenuPopupState-side"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| open | `boolean` | Yes | Unavailable |  |
| instant | `MenuInstant` | Yes | Unavailable |  |
| nested | `boolean` | Yes | Unavailable |  |
| transitionStatus | `TransitionStatus` | Yes | Unavailable |  |
| align | `Align` | Yes | Unavailable |  |
| side | `Side` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="arrow"></a>

### Arrow

<a id="api-436f6e746578744d656e752e4172726f77"></a>

<a id="contextmenuarrow"></a>

<a id="api-436f6e746578744d656e752e4172726f772e2470726f70732e70726f703a616c69676e"></a>

### ContextMenu.Arrow

Declaration: `packages/solid/build/types/menu/arrow/MenuArrow.d.ts:11`

#### Declaration

```typescript
(props: MenuArrowProps) => JSX.Element
```

<a id="api-436f6e746578744d656e752e4172726f772e2470726f70732e636c617373"></a>

<a id="ContextMenuArrow-class"></a>

<a id="api-436f6e746578744d656e752e4172726f772e2470726f70732e7374796c65"></a>

<a id="ContextMenuArrow-style"></a>

<a id="api-436f6e746578744d656e752e4172726f772e2470726f70732e72656e646572"></a>

<a id="ContextMenuArrow-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<ContextMenuArrowState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ContextMenuArrowState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ContextMenuArrowState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-436f6e746578744d656e752e4172726f772e64617461417474726962757465732e6f70656e"></a>

<a id="api-436f6e746578744d656e752e4172726f772e64617461417474726962757465732e636c6f736564"></a>

<a id="api-436f6e746578744d656e752e4172726f772e64617461417474726962757465732e756e63656e7465726564"></a>

<a id="api-436f6e746578744d656e752e4172726f772e64617461417474726962757465732e616c69676e"></a>

<a id="api-436f6e746578744d656e752e4172726f772e64617461417474726962757465732e73696465"></a>

| Name | Description |
| --- | --- |
| data-open |  |
| data-closed |  |
| data-uncentered |  |
| data-align |  |
| data-side |  |

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6e746578744d656e752e4172726f772e50726f7073"></a>

<a id="contextmenuarrowprops"></a>

<a id="api-436f6e746578744d656e752e4172726f772e50726f70732e70726f703a616c69676e"></a>

### Related exported type: ContextMenu.Arrow.Props

Declaration: `packages/solid/build/types/menu/arrow/MenuArrow.d.ts:13`

#### Declaration

```typescript
MenuArrowProps
```

<a id="api-436f6e746578744d656e752e4172726f772e50726f70732e636c617373"></a>

<a id="ContextMenuArrowProps-class"></a>

<a id="api-436f6e746578744d656e752e4172726f772e50726f70732e7374796c65"></a>

<a id="ContextMenuArrowProps-style"></a>

<a id="api-436f6e746578744d656e752e4172726f772e50726f70732e72656e646572"></a>

<a id="ContextMenuArrowProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<ContextMenuArrowState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ContextMenuArrowState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ContextMenuArrowState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6e746578744d656e752e4172726f772e5374617465"></a>

<a id="contextmenuarrowstate"></a>

### Related exported type: ContextMenu.Arrow.State

Declaration: `packages/solid/build/types/menu/arrow/MenuArrow.d.ts:14`

#### Declaration

```typescript
MenuArrowState
```

<a id="api-436f6e746578744d656e752e4172726f772e53746174652e6f70656e"></a>

<a id="ContextMenuArrowState-open"></a>

<a id="api-436f6e746578744d656e752e4172726f772e53746174652e756e63656e7465726564"></a>

<a id="ContextMenuArrowState-uncentered"></a>

<a id="api-436f6e746578744d656e752e4172726f772e53746174652e616c69676e"></a>

<a id="ContextMenuArrowState-align"></a>

<a id="api-436f6e746578744d656e752e4172726f772e53746174652e73696465"></a>

<a id="ContextMenuArrowState-side"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| open | `boolean` | Yes | Unavailable |  |
| uncentered | `boolean` | Yes | Unavailable |  |
| align | `Align` | Yes | Unavailable |  |
| side | `Side` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="item"></a>

### Item

<a id="api-436f6e746578744d656e752e4974656d"></a>

<a id="contextmenuitem"></a>

<a id="api-436f6e746578744d656e752e4974656d2e2470726f70732e70726f703a616c69676e"></a>

### ContextMenu.Item

Declaration: `packages/solid/build/types/menu/item/MenuItem.d.ts:12`

#### Declaration

```typescript
(props: MenuItemProps) => JSX.Element
```

<a id="api-436f6e746578744d656e752e4974656d2e2470726f70732e6c6162656c"></a>

<a id="ContextMenuItem-label"></a>

<a id="api-436f6e746578744d656e752e4974656d2e2470726f70732e636c6f73654f6e436c69636b"></a>

<a id="ContextMenuItem-closeOnClick"></a>

<a id="api-436f6e746578744d656e752e4974656d2e2470726f70732e6e6174697665427574746f6e"></a>

<a id="ContextMenuItem-nativeButton"></a>

<a id="api-436f6e746578744d656e752e4974656d2e2470726f70732e64697361626c6564"></a>

<a id="ContextMenuItem-disabled"></a>

<a id="api-436f6e746578744d656e752e4974656d2e2470726f70732e636c617373"></a>

<a id="ContextMenuItem-class"></a>

<a id="api-436f6e746578744d656e752e4974656d2e2470726f70732e7374796c65"></a>

<a id="ContextMenuItem-style"></a>

<a id="api-436f6e746578744d656e752e4974656d2e2470726f70732e72656e646572"></a>

<a id="ContextMenuItem-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| label | `string \| undefined` | No | Unavailable |  |
| closeOnClick | `boolean \| undefined` | No | Unavailable |  |
| nativeButton | `boolean \| undefined` | No | false |  |
| disabled | `boolean \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<ContextMenuItemState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ContextMenuItemState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ContextMenuItemState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-436f6e746578744d656e752e4974656d2e64617461417474726962757465732e686967686c696768746564"></a>

<a id="api-436f6e746578744d656e752e4974656d2e64617461417474726962757465732e64697361626c6564"></a>

| Name | Description |
| --- | --- |
| data-highlighted |  |
| data-disabled |  |

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6e746578744d656e752e4974656d2e50726f7073"></a>

<a id="contextmenuitemprops"></a>

<a id="api-436f6e746578744d656e752e4974656d2e50726f70732e70726f703a616c69676e"></a>

### Related exported type: ContextMenu.Item.Props

Declaration: `packages/solid/build/types/menu/item/MenuItem.d.ts:14`

#### Declaration

```typescript
MenuItemProps
```

<a id="api-436f6e746578744d656e752e4974656d2e50726f70732e6c6162656c"></a>

<a id="ContextMenuItemProps-label"></a>

<a id="api-436f6e746578744d656e752e4974656d2e50726f70732e636c6f73654f6e436c69636b"></a>

<a id="ContextMenuItemProps-closeOnClick"></a>

<a id="api-436f6e746578744d656e752e4974656d2e50726f70732e6e6174697665427574746f6e"></a>

<a id="ContextMenuItemProps-nativeButton"></a>

<a id="api-436f6e746578744d656e752e4974656d2e50726f70732e64697361626c6564"></a>

<a id="ContextMenuItemProps-disabled"></a>

<a id="api-436f6e746578744d656e752e4974656d2e50726f70732e636c617373"></a>

<a id="ContextMenuItemProps-class"></a>

<a id="api-436f6e746578744d656e752e4974656d2e50726f70732e7374796c65"></a>

<a id="ContextMenuItemProps-style"></a>

<a id="api-436f6e746578744d656e752e4974656d2e50726f70732e72656e646572"></a>

<a id="ContextMenuItemProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| label | `string \| undefined` | No | Unavailable |  |
| closeOnClick | `boolean \| undefined` | No | Unavailable |  |
| nativeButton | `boolean \| undefined` | No | Unavailable |  |
| disabled | `boolean \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<ContextMenuItemState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ContextMenuItemState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ContextMenuItemState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6e746578744d656e752e4974656d2e5374617465"></a>

<a id="contextmenuitemstate"></a>

### Related exported type: ContextMenu.Item.State

Declaration: `packages/solid/build/types/menu/item/MenuItem.d.ts:15`

#### Declaration

```typescript
MenuItemState
```

<a id="api-436f6e746578744d656e752e4974656d2e53746174652e686967686c696768746564"></a>

<a id="ContextMenuItemState-highlighted"></a>

<a id="api-436f6e746578744d656e752e4974656d2e53746174652e64697361626c6564"></a>

<a id="ContextMenuItemState-disabled"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| highlighted | `boolean` | Yes | Unavailable |  |
| disabled | `boolean` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="linkitem"></a>

### LinkItem

<a id="api-436f6e746578744d656e752e4c696e6b4974656d"></a>

<a id="contextmenulinkitem"></a>

<a id="api-436f6e746578744d656e752e4c696e6b4974656d2e2470726f70732e70726f703a63686172736574"></a>

<a id="api-436f6e746578744d656e752e4c696e6b4974656d2e2470726f70732e70726f703a636f6f726473"></a>

<a id="api-436f6e746578744d656e752e4c696e6b4974656d2e2470726f70732e70726f703a646f776e6c6f6164"></a>

<a id="api-436f6e746578744d656e752e4c696e6b4974656d2e2470726f70732e70726f703a68617368"></a>

<a id="api-436f6e746578744d656e752e4c696e6b4974656d2e2470726f70732e70726f703a686f7374"></a>

<a id="api-436f6e746578744d656e752e4c696e6b4974656d2e2470726f70732e70726f703a686f73746e616d65"></a>

<a id="api-436f6e746578744d656e752e4c696e6b4974656d2e2470726f70732e70726f703a68726566"></a>

<a id="api-436f6e746578744d656e752e4c696e6b4974656d2e2470726f70732e70726f703a687265666c616e67"></a>

<a id="api-436f6e746578744d656e752e4c696e6b4974656d2e2470726f70732e70726f703a6e616d65"></a>

<a id="api-436f6e746578744d656e752e4c696e6b4974656d2e2470726f70732e70726f703a70617373776f7264"></a>

<a id="api-436f6e746578744d656e752e4c696e6b4974656d2e2470726f70732e70726f703a706174686e616d65"></a>

<a id="api-436f6e746578744d656e752e4c696e6b4974656d2e2470726f70732e70726f703a70696e67"></a>

<a id="api-436f6e746578744d656e752e4c696e6b4974656d2e2470726f70732e70726f703a706f7274"></a>

<a id="api-436f6e746578744d656e752e4c696e6b4974656d2e2470726f70732e70726f703a70726f746f636f6c"></a>

<a id="api-436f6e746578744d656e752e4c696e6b4974656d2e2470726f70732e70726f703a7265666572726572506f6c696379"></a>

<a id="api-436f6e746578744d656e752e4c696e6b4974656d2e2470726f70732e70726f703a72656c"></a>

<a id="api-436f6e746578744d656e752e4c696e6b4974656d2e2470726f70732e70726f703a726576"></a>

<a id="api-436f6e746578744d656e752e4c696e6b4974656d2e2470726f70732e70726f703a736561726368"></a>

<a id="api-436f6e746578744d656e752e4c696e6b4974656d2e2470726f70732e70726f703a7368617065"></a>

<a id="api-436f6e746578744d656e752e4c696e6b4974656d2e2470726f70732e70726f703a746172676574"></a>

<a id="api-436f6e746578744d656e752e4c696e6b4974656d2e2470726f70732e70726f703a74657874"></a>

<a id="api-436f6e746578744d656e752e4c696e6b4974656d2e2470726f70732e70726f703a74797065"></a>

<a id="api-436f6e746578744d656e752e4c696e6b4974656d2e2470726f70732e70726f703a757365726e616d65"></a>

### ContextMenu.LinkItem

Declaration: `packages/solid/build/types/menu/link-item/MenuLinkItem.d.ts:10`

#### Declaration

```typescript
(props: MenuLinkItemProps) => JSX.Element
```

<a id="api-436f6e746578744d656e752e4c696e6b4974656d2e2470726f70732e6c6162656c"></a>

<a id="ContextMenuLinkItem-label"></a>

<a id="api-436f6e746578744d656e752e4c696e6b4974656d2e2470726f70732e636c6f73654f6e436c69636b"></a>

<a id="ContextMenuLinkItem-closeOnClick"></a>

<a id="api-436f6e746578744d656e752e4c696e6b4974656d2e2470726f70732e636c617373"></a>

<a id="ContextMenuLinkItem-class"></a>

<a id="api-436f6e746578744d656e752e4c696e6b4974656d2e2470726f70732e7374796c65"></a>

<a id="ContextMenuLinkItem-style"></a>

<a id="api-436f6e746578744d656e752e4c696e6b4974656d2e2470726f70732e72656e646572"></a>

<a id="ContextMenuLinkItem-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| label | `string \| undefined` | No | Unavailable |  |
| closeOnClick | `boolean \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<ContextMenuLinkItemState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ContextMenuLinkItemState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<JSX.AnchorHTMLAttributes<HTMLAnchorElement> & JSX.Properties<HTMLAnchorElement>, ContextMenuLinkItemState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `attributionsrc`, `autocapitalize`, `autocorrect`, `autofocus`, `charset`, `children`, `contenteditable`, `contextmenu`, `coords`, `datatype`, `dir`, `download`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `href`, `hreflang`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `link`, `name`, `nonce`, `noscroll`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `ping`, `popover`, `prefix`, `preload`, `prop:charset`, `prop:coords`, `prop:download`, `prop:hash`, `prop:host`, `prop:hostname`, `prop:href`, `prop:hreflang`, `prop:name`, `prop:password`, `prop:pathname`, `prop:ping`, `prop:port`, `prop:protocol`, `prop:referrerPolicy`, `prop:rel`, `prop:rev`, `prop:search`, `prop:shape`, `prop:target`, `prop:text`, `prop:type`, `prop:username`, `property`, `ref`, `referrerpolicy`, `rel`, `replace`, `resource`, `rev`, `role`, `shape`, `slot`, `spellcheck`, `state`, `tabindex`, `target`, `textContent`, `title`, `translate`, `type`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`, `xmlns`

#### Data attributes

<a id="api-436f6e746578744d656e752e4c696e6b4974656d2e64617461417474726962757465732e686967686c696768746564"></a>

| Name | Description |
| --- | --- |
| data-highlighted |  |

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6e746578744d656e752e4c696e6b4974656d2e50726f7073"></a>

<a id="contextmenulinkitemprops"></a>

<a id="api-436f6e746578744d656e752e4c696e6b4974656d2e50726f70732e70726f703a63686172736574"></a>

<a id="api-436f6e746578744d656e752e4c696e6b4974656d2e50726f70732e70726f703a636f6f726473"></a>

<a id="api-436f6e746578744d656e752e4c696e6b4974656d2e50726f70732e70726f703a646f776e6c6f6164"></a>

<a id="api-436f6e746578744d656e752e4c696e6b4974656d2e50726f70732e70726f703a68617368"></a>

<a id="api-436f6e746578744d656e752e4c696e6b4974656d2e50726f70732e70726f703a686f7374"></a>

<a id="api-436f6e746578744d656e752e4c696e6b4974656d2e50726f70732e70726f703a686f73746e616d65"></a>

<a id="api-436f6e746578744d656e752e4c696e6b4974656d2e50726f70732e70726f703a68726566"></a>

<a id="api-436f6e746578744d656e752e4c696e6b4974656d2e50726f70732e70726f703a687265666c616e67"></a>

<a id="api-436f6e746578744d656e752e4c696e6b4974656d2e50726f70732e70726f703a6e616d65"></a>

<a id="api-436f6e746578744d656e752e4c696e6b4974656d2e50726f70732e70726f703a70617373776f7264"></a>

<a id="api-436f6e746578744d656e752e4c696e6b4974656d2e50726f70732e70726f703a706174686e616d65"></a>

<a id="api-436f6e746578744d656e752e4c696e6b4974656d2e50726f70732e70726f703a70696e67"></a>

<a id="api-436f6e746578744d656e752e4c696e6b4974656d2e50726f70732e70726f703a706f7274"></a>

<a id="api-436f6e746578744d656e752e4c696e6b4974656d2e50726f70732e70726f703a70726f746f636f6c"></a>

<a id="api-436f6e746578744d656e752e4c696e6b4974656d2e50726f70732e70726f703a7265666572726572506f6c696379"></a>

<a id="api-436f6e746578744d656e752e4c696e6b4974656d2e50726f70732e70726f703a72656c"></a>

<a id="api-436f6e746578744d656e752e4c696e6b4974656d2e50726f70732e70726f703a726576"></a>

<a id="api-436f6e746578744d656e752e4c696e6b4974656d2e50726f70732e70726f703a736561726368"></a>

<a id="api-436f6e746578744d656e752e4c696e6b4974656d2e50726f70732e70726f703a7368617065"></a>

<a id="api-436f6e746578744d656e752e4c696e6b4974656d2e50726f70732e70726f703a746172676574"></a>

<a id="api-436f6e746578744d656e752e4c696e6b4974656d2e50726f70732e70726f703a74657874"></a>

<a id="api-436f6e746578744d656e752e4c696e6b4974656d2e50726f70732e70726f703a74797065"></a>

<a id="api-436f6e746578744d656e752e4c696e6b4974656d2e50726f70732e70726f703a757365726e616d65"></a>

### Related exported type: ContextMenu.LinkItem.Props

Declaration: `packages/solid/build/types/menu/link-item/MenuLinkItem.d.ts:12`

#### Declaration

```typescript
MenuLinkItemProps
```

<a id="api-436f6e746578744d656e752e4c696e6b4974656d2e50726f70732e6c6162656c"></a>

<a id="ContextMenuLinkItemProps-label"></a>

<a id="api-436f6e746578744d656e752e4c696e6b4974656d2e50726f70732e636c6f73654f6e436c69636b"></a>

<a id="ContextMenuLinkItemProps-closeOnClick"></a>

<a id="api-436f6e746578744d656e752e4c696e6b4974656d2e50726f70732e636c617373"></a>

<a id="ContextMenuLinkItemProps-class"></a>

<a id="api-436f6e746578744d656e752e4c696e6b4974656d2e50726f70732e7374796c65"></a>

<a id="ContextMenuLinkItemProps-style"></a>

<a id="api-436f6e746578744d656e752e4c696e6b4974656d2e50726f70732e72656e646572"></a>

<a id="ContextMenuLinkItemProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| label | `string \| undefined` | No | Unavailable |  |
| closeOnClick | `boolean \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<ContextMenuLinkItemState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ContextMenuLinkItemState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<JSX.AnchorHTMLAttributes<HTMLAnchorElement> & JSX.Properties<HTMLAnchorElement>, ContextMenuLinkItemState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `attributionsrc`, `autocapitalize`, `autocorrect`, `autofocus`, `charset`, `children`, `contenteditable`, `contextmenu`, `coords`, `datatype`, `dir`, `download`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `href`, `hreflang`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `link`, `name`, `nonce`, `noscroll`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `ping`, `popover`, `prefix`, `preload`, `prop:charset`, `prop:coords`, `prop:download`, `prop:hash`, `prop:host`, `prop:hostname`, `prop:href`, `prop:hreflang`, `prop:name`, `prop:password`, `prop:pathname`, `prop:ping`, `prop:port`, `prop:protocol`, `prop:referrerPolicy`, `prop:rel`, `prop:rev`, `prop:search`, `prop:shape`, `prop:target`, `prop:text`, `prop:type`, `prop:username`, `property`, `ref`, `referrerpolicy`, `rel`, `replace`, `resource`, `rev`, `role`, `shape`, `slot`, `spellcheck`, `state`, `tabindex`, `target`, `textContent`, `title`, `translate`, `type`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`, `xmlns`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6e746578744d656e752e4c696e6b4974656d2e5374617465"></a>

<a id="contextmenulinkitemstate"></a>

### Related exported type: ContextMenu.LinkItem.State

Declaration: `packages/solid/build/types/menu/link-item/MenuLinkItem.d.ts:13`

#### Declaration

```typescript
MenuLinkItemState
```

<a id="api-436f6e746578744d656e752e4c696e6b4974656d2e53746174652e686967686c696768746564"></a>

<a id="ContextMenuLinkItemState-highlighted"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| highlighted | `boolean` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="submenuroot"></a>

### SubmenuRoot

<a id="api-436f6e746578744d656e752e5375626d656e75526f6f74"></a>

<a id="contextmenusubmenuroot"></a>

### ContextMenu.SubmenuRoot

Declaration: `packages/solid/build/types/menu/submenu-root/MenuSubmenuRoot.d.ts:9`

#### Declaration

```typescript
(props: MenuSubmenuRootProps) => JSX.Element
```

<a id="api-436f6e746578744d656e752e5375626d656e75526f6f742e2470726f70732e64656661756c744f70656e"></a>

<a id="ContextMenuSubmenuRoot-defaultOpen"></a>

<a id="api-436f6e746578744d656e752e5375626d656e75526f6f742e2470726f70732e6f70656e"></a>

<a id="ContextMenuSubmenuRoot-open"></a>

<a id="api-436f6e746578744d656e752e5375626d656e75526f6f742e2470726f70732e6f6e4f70656e4368616e6765"></a>

<a id="ContextMenuSubmenuRoot-onOpenChange"></a>

<a id="api-436f6e746578744d656e752e5375626d656e75526f6f742e2470726f70732e686967686c696768744974656d4f6e486f766572"></a>

<a id="ContextMenuSubmenuRoot-highlightItemOnHover"></a>

<a id="api-436f6e746578744d656e752e5375626d656e75526f6f742e2470726f70732e616374696f6e73526566"></a>

<a id="ContextMenuSubmenuRoot-actionsRef"></a>

<a id="api-436f6e746578744d656e752e5375626d656e75526f6f742e2470726f70732e636c6f7365506172656e744f6e457363"></a>

<a id="ContextMenuSubmenuRoot-closeParentOnEsc"></a>

<a id="api-436f6e746578744d656e752e5375626d656e75526f6f742e2470726f70732e6c6f6f70466f637573"></a>

<a id="ContextMenuSubmenuRoot-loopFocus"></a>

<a id="api-436f6e746578744d656e752e5375626d656e75526f6f742e2470726f70732e6f6e4974656d486967686c696768746564"></a>

<a id="ContextMenuSubmenuRoot-onItemHighlighted"></a>

<a id="api-436f6e746578744d656e752e5375626d656e75526f6f742e2470726f70732e6f6e4f70656e4368616e6765436f6d706c657465"></a>

<a id="ContextMenuSubmenuRoot-onOpenChangeComplete"></a>

<a id="api-436f6e746578744d656e752e5375626d656e75526f6f742e2470726f70732e64697361626c6564"></a>

<a id="ContextMenuSubmenuRoot-disabled"></a>

<a id="api-436f6e746578744d656e752e5375626d656e75526f6f742e2470726f70732e6f7269656e746174696f6e"></a>

<a id="ContextMenuSubmenuRoot-orientation"></a>

<a id="api-436f6e746578744d656e752e5375626d656e75526f6f742e2470726f70732e6368696c6472656e"></a>

<a id="ContextMenuSubmenuRoot-children"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| defaultOpen | `boolean \| undefined` | No | Unavailable |  |
| open | `boolean \| undefined` | No | Unavailable |  |
| onOpenChange | `((open: boolean, details: MenuRootChangeEventDetails) => void) \| undefined` | No | Unavailable |  |
| highlightItemOnHover | `boolean \| undefined` | No | Unavailable |  |
| actionsRef | `MutableCell<MenuRootActions \| null> \| undefined` | No | Unavailable |  |
| closeParentOnEsc | `boolean \| undefined` | No | Unavailable |  |
| loopFocus | `boolean \| undefined` | No | Unavailable |  |
| onItemHighlighted | `((item: HTMLElement \| undefined, details: MenuRootHighlightEventDetails) => void) \| undefined` | No | Unavailable |  |
| onOpenChangeComplete | `((open: boolean) => void) \| undefined` | No | Unavailable |  |
| disabled | `boolean \| undefined` | No | Unavailable |  |
| orientation | `MenuRootOrientation \| undefined` | No | Unavailable |  |
| children | `JSX.Element` | No | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6e746578744d656e752e5375626d656e75526f6f742e50726f7073"></a>

<a id="contextmenusubmenurootprops"></a>

### Related exported type: ContextMenu.SubmenuRoot.Props

Declaration: `packages/solid/build/types/menu/submenu-root/MenuSubmenuRoot.d.ts:13`

#### Declaration

```typescript
MenuSubmenuRootProps
```

<a id="api-436f6e746578744d656e752e5375626d656e75526f6f742e50726f70732e64656661756c744f70656e"></a>

<a id="ContextMenuSubmenuRootProps-defaultOpen"></a>

<a id="api-436f6e746578744d656e752e5375626d656e75526f6f742e50726f70732e6f70656e"></a>

<a id="ContextMenuSubmenuRootProps-open"></a>

<a id="api-436f6e746578744d656e752e5375626d656e75526f6f742e50726f70732e6f6e4f70656e4368616e6765"></a>

<a id="ContextMenuSubmenuRootProps-onOpenChange"></a>

<a id="api-436f6e746578744d656e752e5375626d656e75526f6f742e50726f70732e686967686c696768744974656d4f6e486f766572"></a>

<a id="ContextMenuSubmenuRootProps-highlightItemOnHover"></a>

<a id="api-436f6e746578744d656e752e5375626d656e75526f6f742e50726f70732e616374696f6e73526566"></a>

<a id="ContextMenuSubmenuRootProps-actionsRef"></a>

<a id="api-436f6e746578744d656e752e5375626d656e75526f6f742e50726f70732e636c6f7365506172656e744f6e457363"></a>

<a id="ContextMenuSubmenuRootProps-closeParentOnEsc"></a>

<a id="api-436f6e746578744d656e752e5375626d656e75526f6f742e50726f70732e6c6f6f70466f637573"></a>

<a id="ContextMenuSubmenuRootProps-loopFocus"></a>

<a id="api-436f6e746578744d656e752e5375626d656e75526f6f742e50726f70732e6f6e4974656d486967686c696768746564"></a>

<a id="ContextMenuSubmenuRootProps-onItemHighlighted"></a>

<a id="api-436f6e746578744d656e752e5375626d656e75526f6f742e50726f70732e6f6e4f70656e4368616e6765436f6d706c657465"></a>

<a id="ContextMenuSubmenuRootProps-onOpenChangeComplete"></a>

<a id="api-436f6e746578744d656e752e5375626d656e75526f6f742e50726f70732e64697361626c6564"></a>

<a id="ContextMenuSubmenuRootProps-disabled"></a>

<a id="api-436f6e746578744d656e752e5375626d656e75526f6f742e50726f70732e6f7269656e746174696f6e"></a>

<a id="ContextMenuSubmenuRootProps-orientation"></a>

<a id="api-436f6e746578744d656e752e5375626d656e75526f6f742e50726f70732e6368696c6472656e"></a>

<a id="ContextMenuSubmenuRootProps-children"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| defaultOpen | `boolean \| undefined` | No | Unavailable |  |
| open | `boolean \| undefined` | No | Unavailable |  |
| onOpenChange | `((open: boolean, details: MenuRootChangeEventDetails) => void) \| undefined` | No | Unavailable |  |
| highlightItemOnHover | `boolean \| undefined` | No | Unavailable |  |
| actionsRef | `MutableCell<MenuRootActions \| null> \| undefined` | No | Unavailable |  |
| closeParentOnEsc | `boolean \| undefined` | No | Unavailable |  |
| loopFocus | `boolean \| undefined` | No | Unavailable |  |
| onItemHighlighted | `((item: HTMLElement \| undefined, details: MenuRootHighlightEventDetails) => void) \| undefined` | No | Unavailable |  |
| onOpenChangeComplete | `((open: boolean) => void) \| undefined` | No | Unavailable |  |
| disabled | `boolean \| undefined` | No | Unavailable |  |
| orientation | `MenuRootOrientation \| undefined` | No | Unavailable |  |
| children | `JSX.Element` | No | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6e746578744d656e752e5375626d656e75526f6f742e5374617465"></a>

<a id="contextmenusubmenurootstate"></a>

### Related exported type: ContextMenu.SubmenuRoot.State

Declaration: `packages/solid/build/types/menu/submenu-root/MenuSubmenuRoot.d.ts:14`

#### Declaration

```typescript
MenuSubmenuRootState
```

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6e746578744d656e752e5375626d656e75526f6f742e4368616e67654576656e74526561736f6e"></a>

<a id="contextmenusubmenurootchangeeventreason"></a>

### Related exported type: ContextMenu.SubmenuRoot.ChangeEventReason

Declaration: `packages/solid/build/types/menu/submenu-root/MenuSubmenuRoot.d.ts:15`

#### Declaration

```typescript
MenuRootChangeEventReason
```

Inherited DOM attributes: `__@iterator@106`, `anchor`, `at`, `big`, `blink`, `bold`, `charAt`, `charCodeAt`, `codePointAt`, `concat`, `endsWith`, `fixed`, `fontcolor`, `fontsize`, `includes`, `indexOf`, `isWellFormed`, `italics`, `lastIndexOf`, `length`, `link`, `localeCompare`, `match`, `matchAll`, `normalize`, `padEnd`, `padStart`, `repeat`, `replace`, `replaceAll`, `search`, `slice`, `small`, `split`, `startsWith`, `strike`, `sub`, `substr`, `substring`, `sup`, `toLocaleLowerCase`, `toLocaleUpperCase`, `toLowerCase`, `toString`, `toUpperCase`, `toWellFormed`, `trim`, `trimEnd`, `trimLeft`, `trimRight`, `trimStart`, `valueOf`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6e746578744d656e752e5375626d656e75526f6f742e4368616e67654576656e7444657461696c73"></a>

<a id="contextmenusubmenurootchangeeventdetails"></a>

### Related exported type: ContextMenu.SubmenuRoot.ChangeEventDetails

Declaration: `packages/solid/build/types/menu/submenu-root/MenuSubmenuRoot.d.ts:16`

#### Declaration

```typescript
MenuRootChangeEventDetails
```

<a id="api-436f6e746578744d656e752e5375626d656e75526f6f742e4368616e67654576656e7444657461696c732e616c6c6f7750726f7061676174696f6e"></a>

<a id="ContextMenuSubmenuRootChangeEventDetails-allowPropagation"></a>

<a id="api-436f6e746578744d656e752e5375626d656e75526f6f742e4368616e67654576656e7444657461696c732e63616e63656c"></a>

<a id="ContextMenuSubmenuRootChangeEventDetails-cancel"></a>

<a id="api-436f6e746578744d656e752e5375626d656e75526f6f742e4368616e67654576656e7444657461696c732e6576656e74"></a>

<a id="ContextMenuSubmenuRootChangeEventDetails-event"></a>

<a id="api-436f6e746578744d656e752e5375626d656e75526f6f742e4368616e67654576656e7444657461696c732e697343616e63656c6564"></a>

<a id="ContextMenuSubmenuRootChangeEventDetails-isCanceled"></a>

<a id="api-436f6e746578744d656e752e5375626d656e75526f6f742e4368616e67654576656e7444657461696c732e697350726f7061676174696f6e416c6c6f776564"></a>

<a id="ContextMenuSubmenuRootChangeEventDetails-isPropagationAllowed"></a>

<a id="api-436f6e746578744d656e752e5375626d656e75526f6f742e4368616e67654576656e7444657461696c732e70726576656e74556e6d6f756e744f6e436c6f7365"></a>

<a id="ContextMenuSubmenuRootChangeEventDetails-preventUnmountOnClose"></a>

<a id="api-436f6e746578744d656e752e5375626d656e75526f6f742e4368616e67654576656e7444657461696c732e726561736f6e"></a>

<a id="ContextMenuSubmenuRootChangeEventDetails-reason"></a>

<a id="api-436f6e746578744d656e752e5375626d656e75526f6f742e4368616e67654576656e7444657461696c732e74726967676572"></a>

<a id="ContextMenuSubmenuRootChangeEventDetails-trigger"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| allowPropagation | `() => void` | Yes | Unavailable | Marks this change transaction as allowing propagation. |
| cancel | `() => void` | Yes | Unavailable | Cancels the Base UI change transaction; separate from the DOM event’s preventDefault() and preventBaseUIHandler(). |
| event | `PointerEvent \| MouseEvent \| Event \| FocusEvent \| KeyboardEvent \| TouchEvent` | Yes | Unavailable | Native DOM event associated with the change. Programmatic changes can use a Base UI-created Event. |
| isCanceled | `boolean` | Yes | Unavailable | Whether cancel() has been called for this change transaction. |
| isPropagationAllowed | `boolean` | Yes | Unavailable | Whether allowPropagation() has been called for this change transaction. |
| preventUnmountOnClose | `() => void` | Yes | Unavailable |  |
| reason | `"none" \| "trigger-press" \| "trigger-hover" \| "trigger-focus" \| "outside-press" \| "item-press" \| "close-press" \| "focus-out" \| "escape-key" \| "list-navigation" \| "cancel-open" \| "sibling-open" \| "imperative-action"` | Yes | Unavailable | Reason for the requested change; it discriminates the native event type. |
| trigger | `Element \| undefined` | Yes | Unavailable | Trigger element associated with this change, when available. |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="submenutrigger"></a>

### SubmenuTrigger

<a id="api-436f6e746578744d656e752e5375626d656e7554726967676572"></a>

<a id="contextmenusubmenutrigger"></a>

<a id="api-436f6e746578744d656e752e5375626d656e75547269676765722e2470726f70732e70726f703a616c69676e"></a>

### ContextMenu.SubmenuTrigger

Declaration: `packages/solid/build/types/menu/submenu-trigger/MenuSubmenuTrigger.d.ts:15`

#### Declaration

```typescript
(props: MenuSubmenuTriggerProps) => JSX.Element
```

<a id="api-436f6e746578744d656e752e5375626d656e75547269676765722e2470726f70732e6c6162656c"></a>

<a id="ContextMenuSubmenuTrigger-label"></a>

<a id="api-436f6e746578744d656e752e5375626d656e75547269676765722e2470726f70732e6e6174697665427574746f6e"></a>

<a id="ContextMenuSubmenuTrigger-nativeButton"></a>

<a id="api-436f6e746578744d656e752e5375626d656e75547269676765722e2470726f70732e64697361626c6564"></a>

<a id="ContextMenuSubmenuTrigger-disabled"></a>

<a id="api-436f6e746578744d656e752e5375626d656e75547269676765722e2470726f70732e6f70656e4f6e486f766572"></a>

<a id="ContextMenuSubmenuTrigger-openOnHover"></a>

<a id="api-436f6e746578744d656e752e5375626d656e75547269676765722e2470726f70732e64656c6179"></a>

<a id="ContextMenuSubmenuTrigger-delay"></a>

<a id="api-436f6e746578744d656e752e5375626d656e75547269676765722e2470726f70732e636c6f736544656c6179"></a>

<a id="ContextMenuSubmenuTrigger-closeDelay"></a>

<a id="api-436f6e746578744d656e752e5375626d656e75547269676765722e2470726f70732e636c617373"></a>

<a id="ContextMenuSubmenuTrigger-class"></a>

<a id="api-436f6e746578744d656e752e5375626d656e75547269676765722e2470726f70732e7374796c65"></a>

<a id="ContextMenuSubmenuTrigger-style"></a>

<a id="api-436f6e746578744d656e752e5375626d656e75547269676765722e2470726f70732e72656e646572"></a>

<a id="ContextMenuSubmenuTrigger-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| label | `string \| undefined` | No | Unavailable |  |
| nativeButton | `boolean \| undefined` | No | Unavailable |  |
| disabled | `boolean \| undefined` | No | Unavailable |  |
| openOnHover | `boolean \| undefined` | No | true |  |
| delay | `number \| undefined` | No | 100 |  |
| closeDelay | `number \| undefined` | No | 0 |  |
| class | `JSX.ClassValue \| ((state: Readonly<ContextMenuSubmenuTriggerState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ContextMenuSubmenuTriggerState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ContextMenuSubmenuTriggerState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-436f6e746578744d656e752e5375626d656e75547269676765722e64617461417474726962757465732e706f7075704f70656e"></a>

<a id="api-436f6e746578744d656e752e5375626d656e75547269676765722e64617461417474726962757465732e686967686c696768746564"></a>

<a id="api-436f6e746578744d656e752e5375626d656e75547269676765722e64617461417474726962757465732e64697361626c6564"></a>

| Name | Description |
| --- | --- |
| data-popup-open |  |
| data-highlighted |  |
| data-disabled |  |

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6e746578744d656e752e5375626d656e75547269676765722e50726f7073"></a>

<a id="contextmenusubmenutriggerprops"></a>

<a id="api-436f6e746578744d656e752e5375626d656e75547269676765722e50726f70732e70726f703a616c69676e"></a>

### Related exported type: ContextMenu.SubmenuTrigger.Props

Declaration: `packages/solid/build/types/menu/submenu-trigger/MenuSubmenuTrigger.d.ts:17`

#### Declaration

```typescript
MenuSubmenuTriggerProps
```

<a id="api-436f6e746578744d656e752e5375626d656e75547269676765722e50726f70732e6c6162656c"></a>

<a id="ContextMenuSubmenuTriggerProps-label"></a>

<a id="api-436f6e746578744d656e752e5375626d656e75547269676765722e50726f70732e6e6174697665427574746f6e"></a>

<a id="ContextMenuSubmenuTriggerProps-nativeButton"></a>

<a id="api-436f6e746578744d656e752e5375626d656e75547269676765722e50726f70732e64697361626c6564"></a>

<a id="ContextMenuSubmenuTriggerProps-disabled"></a>

<a id="api-436f6e746578744d656e752e5375626d656e75547269676765722e50726f70732e6f70656e4f6e486f766572"></a>

<a id="ContextMenuSubmenuTriggerProps-openOnHover"></a>

<a id="api-436f6e746578744d656e752e5375626d656e75547269676765722e50726f70732e64656c6179"></a>

<a id="ContextMenuSubmenuTriggerProps-delay"></a>

<a id="api-436f6e746578744d656e752e5375626d656e75547269676765722e50726f70732e636c6f736544656c6179"></a>

<a id="ContextMenuSubmenuTriggerProps-closeDelay"></a>

<a id="api-436f6e746578744d656e752e5375626d656e75547269676765722e50726f70732e636c617373"></a>

<a id="ContextMenuSubmenuTriggerProps-class"></a>

<a id="api-436f6e746578744d656e752e5375626d656e75547269676765722e50726f70732e7374796c65"></a>

<a id="ContextMenuSubmenuTriggerProps-style"></a>

<a id="api-436f6e746578744d656e752e5375626d656e75547269676765722e50726f70732e72656e646572"></a>

<a id="ContextMenuSubmenuTriggerProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| label | `string \| undefined` | No | Unavailable |  |
| nativeButton | `boolean \| undefined` | No | Unavailable |  |
| disabled | `boolean \| undefined` | No | Unavailable |  |
| openOnHover | `boolean \| undefined` | No | Unavailable |  |
| delay | `number \| undefined` | No | Unavailable |  |
| closeDelay | `number \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<ContextMenuSubmenuTriggerState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ContextMenuSubmenuTriggerState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ContextMenuSubmenuTriggerState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6e746578744d656e752e5375626d656e75547269676765722e5374617465"></a>

<a id="contextmenusubmenutriggerstate"></a>

### Related exported type: ContextMenu.SubmenuTrigger.State

Declaration: `packages/solid/build/types/menu/submenu-trigger/MenuSubmenuTrigger.d.ts:18`

#### Declaration

```typescript
MenuSubmenuTriggerState
```

<a id="api-436f6e746578744d656e752e5375626d656e75547269676765722e53746174652e6f70656e"></a>

<a id="ContextMenuSubmenuTriggerState-open"></a>

<a id="api-436f6e746578744d656e752e5375626d656e75547269676765722e53746174652e686967686c696768746564"></a>

<a id="ContextMenuSubmenuTriggerState-highlighted"></a>

<a id="api-436f6e746578744d656e752e5375626d656e75547269676765722e53746174652e64697361626c6564"></a>

<a id="ContextMenuSubmenuTriggerState-disabled"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| open | `boolean` | Yes | Unavailable |  |
| highlighted | `boolean` | Yes | Unavailable |  |
| disabled | `boolean` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="group"></a>

### Group

<a id="api-436f6e746578744d656e752e47726f7570"></a>

<a id="contextmenugroup"></a>

<a id="api-436f6e746578744d656e752e47726f75702e2470726f70732e70726f703a616c69676e"></a>

### ContextMenu.Group

Declaration: `packages/solid/build/types/menu/group/MenuGroup.d.ts:7`

#### Declaration

```typescript
(props: MenuGroupProps) => JSX.Element
```

<a id="api-436f6e746578744d656e752e47726f75702e2470726f70732e636c617373"></a>

<a id="ContextMenuGroup-class"></a>

<a id="api-436f6e746578744d656e752e47726f75702e2470726f70732e7374796c65"></a>

<a id="ContextMenuGroup-style"></a>

<a id="api-436f6e746578744d656e752e47726f75702e2470726f70732e72656e646572"></a>

<a id="ContextMenuGroup-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<ContextMenuGroupState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ContextMenuGroupState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ContextMenuGroupState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6e746578744d656e752e47726f75702e50726f7073"></a>

<a id="contextmenugroupprops"></a>

<a id="api-436f6e746578744d656e752e47726f75702e50726f70732e70726f703a616c69676e"></a>

### Related exported type: ContextMenu.Group.Props

Declaration: `packages/solid/build/types/menu/group/MenuGroup.d.ts:9`

#### Declaration

```typescript
MenuGroupProps
```

<a id="api-436f6e746578744d656e752e47726f75702e50726f70732e636c617373"></a>

<a id="ContextMenuGroupProps-class"></a>

<a id="api-436f6e746578744d656e752e47726f75702e50726f70732e7374796c65"></a>

<a id="ContextMenuGroupProps-style"></a>

<a id="api-436f6e746578744d656e752e47726f75702e50726f70732e72656e646572"></a>

<a id="ContextMenuGroupProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<ContextMenuGroupState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ContextMenuGroupState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ContextMenuGroupState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6e746578744d656e752e47726f75702e5374617465"></a>

<a id="contextmenugroupstate"></a>

### Related exported type: ContextMenu.Group.State

Declaration: `packages/solid/build/types/menu/group/MenuGroup.d.ts:10`

#### Declaration

```typescript
MenuGroupState
```

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="grouplabel"></a>

### GroupLabel

<a id="api-436f6e746578744d656e752e47726f75704c6162656c"></a>

<a id="contextmenugrouplabel"></a>

<a id="api-436f6e746578744d656e752e47726f75704c6162656c2e2470726f70732e70726f703a616c69676e"></a>

### ContextMenu.GroupLabel

Declaration: `packages/solid/build/types/menu/group-label/MenuGroupLabel.d.ts:6`

#### Declaration

```typescript
(props: MenuGroupLabelProps) => JSX.Element
```

<a id="api-436f6e746578744d656e752e47726f75704c6162656c2e2470726f70732e636c617373"></a>

<a id="ContextMenuGroupLabel-class"></a>

<a id="api-436f6e746578744d656e752e47726f75704c6162656c2e2470726f70732e7374796c65"></a>

<a id="ContextMenuGroupLabel-style"></a>

<a id="api-436f6e746578744d656e752e47726f75704c6162656c2e2470726f70732e72656e646572"></a>

<a id="ContextMenuGroupLabel-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<ContextMenuGroupLabelState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ContextMenuGroupLabelState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ContextMenuGroupLabelState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6e746578744d656e752e47726f75704c6162656c2e50726f7073"></a>

<a id="contextmenugrouplabelprops"></a>

<a id="api-436f6e746578744d656e752e47726f75704c6162656c2e50726f70732e70726f703a616c69676e"></a>

### Related exported type: ContextMenu.GroupLabel.Props

Declaration: `packages/solid/build/types/menu/group-label/MenuGroupLabel.d.ts:8`

#### Declaration

```typescript
MenuGroupLabelProps
```

<a id="api-436f6e746578744d656e752e47726f75704c6162656c2e50726f70732e636c617373"></a>

<a id="ContextMenuGroupLabelProps-class"></a>

<a id="api-436f6e746578744d656e752e47726f75704c6162656c2e50726f70732e7374796c65"></a>

<a id="ContextMenuGroupLabelProps-style"></a>

<a id="api-436f6e746578744d656e752e47726f75704c6162656c2e50726f70732e72656e646572"></a>

<a id="ContextMenuGroupLabelProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<ContextMenuGroupLabelState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ContextMenuGroupLabelState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ContextMenuGroupLabelState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6e746578744d656e752e47726f75704c6162656c2e5374617465"></a>

<a id="contextmenugrouplabelstate"></a>

### Related exported type: ContextMenu.GroupLabel.State

Declaration: `packages/solid/build/types/menu/group-label/MenuGroupLabel.d.ts:9`

#### Declaration

```typescript
MenuGroupLabelState
```

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="radiogroup"></a>

### RadioGroup

<a id="api-436f6e746578744d656e752e526164696f47726f7570"></a>

<a id="contextmenuradiogroup"></a>

<a id="api-436f6e746578744d656e752e526164696f47726f75702e2470726f70732e70726f703a616c69676e"></a>

### ContextMenu.RadioGroup

Declaration: `packages/solid/build/types/menu/radio-group/MenuRadioGroup.d.ts:13`

#### Declaration

```typescript
(props: MenuRadioGroupProps) => JSX.Element
```

<a id="api-436f6e746578744d656e752e526164696f47726f75702e2470726f70732e64656661756c7456616c7565"></a>

<a id="ContextMenuRadioGroup-defaultValue"></a>

<a id="api-436f6e746578744d656e752e526164696f47726f75702e2470726f70732e76616c7565"></a>

<a id="ContextMenuRadioGroup-value"></a>

<a id="api-436f6e746578744d656e752e526164696f47726f75702e2470726f70732e6f6e56616c75654368616e6765"></a>

<a id="ContextMenuRadioGroup-onValueChange"></a>

<a id="api-436f6e746578744d656e752e526164696f47726f75702e2470726f70732e64697361626c6564"></a>

<a id="ContextMenuRadioGroup-disabled"></a>

<a id="api-436f6e746578744d656e752e526164696f47726f75702e2470726f70732e636c617373"></a>

<a id="ContextMenuRadioGroup-class"></a>

<a id="api-436f6e746578744d656e752e526164696f47726f75702e2470726f70732e7374796c65"></a>

<a id="ContextMenuRadioGroup-style"></a>

<a id="api-436f6e746578744d656e752e526164696f47726f75702e2470726f70732e72656e646572"></a>

<a id="ContextMenuRadioGroup-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| defaultValue | `any` | No | Unavailable |  |
| value | `any` | No | Unavailable |  |
| onValueChange | `((value: any, details: MenuRoot.ChangeEventDetails) => void) \| undefined` | No | Unavailable |  |
| disabled | `boolean \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<ContextMenuRadioGroupState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ContextMenuRadioGroupState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ContextMenuRadioGroupState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6e746578744d656e752e526164696f47726f75702e50726f7073"></a>

<a id="contextmenuradiogroupprops"></a>

<a id="api-436f6e746578744d656e752e526164696f47726f75702e50726f70732e70726f703a616c69676e"></a>

### Related exported type: ContextMenu.RadioGroup.Props

Declaration: `packages/solid/build/types/menu/radio-group/MenuRadioGroup.d.ts:17`

#### Declaration

```typescript
MenuRadioGroupProps
```

<a id="api-436f6e746578744d656e752e526164696f47726f75702e50726f70732e64656661756c7456616c7565"></a>

<a id="ContextMenuRadioGroupProps-defaultValue"></a>

<a id="api-436f6e746578744d656e752e526164696f47726f75702e50726f70732e76616c7565"></a>

<a id="ContextMenuRadioGroupProps-value"></a>

<a id="api-436f6e746578744d656e752e526164696f47726f75702e50726f70732e6f6e56616c75654368616e6765"></a>

<a id="ContextMenuRadioGroupProps-onValueChange"></a>

<a id="api-436f6e746578744d656e752e526164696f47726f75702e50726f70732e64697361626c6564"></a>

<a id="ContextMenuRadioGroupProps-disabled"></a>

<a id="api-436f6e746578744d656e752e526164696f47726f75702e50726f70732e636c617373"></a>

<a id="ContextMenuRadioGroupProps-class"></a>

<a id="api-436f6e746578744d656e752e526164696f47726f75702e50726f70732e7374796c65"></a>

<a id="ContextMenuRadioGroupProps-style"></a>

<a id="api-436f6e746578744d656e752e526164696f47726f75702e50726f70732e72656e646572"></a>

<a id="ContextMenuRadioGroupProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| defaultValue | `any` | No | Unavailable |  |
| value | `any` | No | Unavailable |  |
| onValueChange | `((value: any, details: MenuRoot.ChangeEventDetails) => void) \| undefined` | No | Unavailable |  |
| disabled | `boolean \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<ContextMenuRadioGroupState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ContextMenuRadioGroupState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ContextMenuRadioGroupState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6e746578744d656e752e526164696f47726f75702e5374617465"></a>

<a id="contextmenuradiogroupstate"></a>

### Related exported type: ContextMenu.RadioGroup.State

Declaration: `packages/solid/build/types/menu/radio-group/MenuRadioGroup.d.ts:18`

#### Declaration

```typescript
MenuRadioGroupState
```

<a id="api-436f6e746578744d656e752e526164696f47726f75702e53746174652e64697361626c6564"></a>

<a id="ContextMenuRadioGroupState-disabled"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| disabled | `boolean` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6e746578744d656e752e526164696f47726f75702e4368616e67654576656e74526561736f6e"></a>

<a id="contextmenuradiogroupchangeeventreason"></a>

### Related exported type: ContextMenu.RadioGroup.ChangeEventReason

Declaration: `packages/solid/build/types/menu/radio-group/MenuRadioGroup.d.ts:19`

#### Declaration

```typescript
MenuRootChangeEventReason
```

Inherited DOM attributes: `__@iterator@106`, `anchor`, `at`, `big`, `blink`, `bold`, `charAt`, `charCodeAt`, `codePointAt`, `concat`, `endsWith`, `fixed`, `fontcolor`, `fontsize`, `includes`, `indexOf`, `isWellFormed`, `italics`, `lastIndexOf`, `length`, `link`, `localeCompare`, `match`, `matchAll`, `normalize`, `padEnd`, `padStart`, `repeat`, `replace`, `replaceAll`, `search`, `slice`, `small`, `split`, `startsWith`, `strike`, `sub`, `substr`, `substring`, `sup`, `toLocaleLowerCase`, `toLocaleUpperCase`, `toLowerCase`, `toString`, `toUpperCase`, `toWellFormed`, `trim`, `trimEnd`, `trimLeft`, `trimRight`, `trimStart`, `valueOf`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6e746578744d656e752e526164696f47726f75702e4368616e67654576656e7444657461696c73"></a>

<a id="contextmenuradiogroupchangeeventdetails"></a>

### Related exported type: ContextMenu.RadioGroup.ChangeEventDetails

Declaration: `packages/solid/build/types/menu/radio-group/MenuRadioGroup.d.ts:20`

#### Declaration

```typescript
MenuRootChangeEventDetails
```

<a id="api-436f6e746578744d656e752e526164696f47726f75702e4368616e67654576656e7444657461696c732e616c6c6f7750726f7061676174696f6e"></a>

<a id="ContextMenuRadioGroupChangeEventDetails-allowPropagation"></a>

<a id="api-436f6e746578744d656e752e526164696f47726f75702e4368616e67654576656e7444657461696c732e63616e63656c"></a>

<a id="ContextMenuRadioGroupChangeEventDetails-cancel"></a>

<a id="api-436f6e746578744d656e752e526164696f47726f75702e4368616e67654576656e7444657461696c732e6576656e74"></a>

<a id="ContextMenuRadioGroupChangeEventDetails-event"></a>

<a id="api-436f6e746578744d656e752e526164696f47726f75702e4368616e67654576656e7444657461696c732e697343616e63656c6564"></a>

<a id="ContextMenuRadioGroupChangeEventDetails-isCanceled"></a>

<a id="api-436f6e746578744d656e752e526164696f47726f75702e4368616e67654576656e7444657461696c732e697350726f7061676174696f6e416c6c6f776564"></a>

<a id="ContextMenuRadioGroupChangeEventDetails-isPropagationAllowed"></a>

<a id="api-436f6e746578744d656e752e526164696f47726f75702e4368616e67654576656e7444657461696c732e70726576656e74556e6d6f756e744f6e436c6f7365"></a>

<a id="ContextMenuRadioGroupChangeEventDetails-preventUnmountOnClose"></a>

<a id="api-436f6e746578744d656e752e526164696f47726f75702e4368616e67654576656e7444657461696c732e726561736f6e"></a>

<a id="ContextMenuRadioGroupChangeEventDetails-reason"></a>

<a id="api-436f6e746578744d656e752e526164696f47726f75702e4368616e67654576656e7444657461696c732e74726967676572"></a>

<a id="ContextMenuRadioGroupChangeEventDetails-trigger"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| allowPropagation | `() => void` | Yes | Unavailable | Marks this change transaction as allowing propagation. |
| cancel | `() => void` | Yes | Unavailable | Cancels the Base UI change transaction; separate from the DOM event’s preventDefault() and preventBaseUIHandler(). |
| event | `PointerEvent \| MouseEvent \| Event \| FocusEvent \| KeyboardEvent \| TouchEvent` | Yes | Unavailable | Native DOM event associated with the change. Programmatic changes can use a Base UI-created Event. |
| isCanceled | `boolean` | Yes | Unavailable | Whether cancel() has been called for this change transaction. |
| isPropagationAllowed | `boolean` | Yes | Unavailable | Whether allowPropagation() has been called for this change transaction. |
| preventUnmountOnClose | `() => void` | Yes | Unavailable |  |
| reason | `"none" \| "trigger-press" \| "trigger-hover" \| "trigger-focus" \| "outside-press" \| "item-press" \| "close-press" \| "focus-out" \| "escape-key" \| "list-navigation" \| "cancel-open" \| "sibling-open" \| "imperative-action"` | Yes | Unavailable | Reason for the requested change; it discriminates the native event type. |
| trigger | `Element \| undefined` | Yes | Unavailable | Trigger element associated with this change, when available. |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="radioitem"></a>

### RadioItem

<a id="api-436f6e746578744d656e752e526164696f4974656d"></a>

<a id="contextmenuradioitem"></a>

<a id="api-436f6e746578744d656e752e526164696f4974656d2e2470726f70732e70726f703a616c69676e"></a>

### ContextMenu.RadioItem

Declaration: `packages/solid/build/types/menu/radio-item/MenuRadioItem.d.ts:14`

#### Declaration

```typescript
(props: MenuRadioItemProps) => JSX.Element
```

<a id="api-436f6e746578744d656e752e526164696f4974656d2e2470726f70732e6c6162656c"></a>

<a id="ContextMenuRadioItem-label"></a>

<a id="api-436f6e746578744d656e752e526164696f4974656d2e2470726f70732e76616c7565"></a>

<a id="ContextMenuRadioItem-value"></a>

<a id="api-436f6e746578744d656e752e526164696f4974656d2e2470726f70732e636c6f73654f6e436c69636b"></a>

<a id="ContextMenuRadioItem-closeOnClick"></a>

<a id="api-436f6e746578744d656e752e526164696f4974656d2e2470726f70732e6e6174697665427574746f6e"></a>

<a id="ContextMenuRadioItem-nativeButton"></a>

<a id="api-436f6e746578744d656e752e526164696f4974656d2e2470726f70732e64697361626c6564"></a>

<a id="ContextMenuRadioItem-disabled"></a>

<a id="api-436f6e746578744d656e752e526164696f4974656d2e2470726f70732e636c617373"></a>

<a id="ContextMenuRadioItem-class"></a>

<a id="api-436f6e746578744d656e752e526164696f4974656d2e2470726f70732e7374796c65"></a>

<a id="ContextMenuRadioItem-style"></a>

<a id="api-436f6e746578744d656e752e526164696f4974656d2e2470726f70732e72656e646572"></a>

<a id="ContextMenuRadioItem-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| label | `string \| undefined` | No | Unavailable |  |
| value | `any` | Yes | Unavailable |  |
| closeOnClick | `boolean \| undefined` | No | Unavailable |  |
| nativeButton | `boolean \| undefined` | No | Unavailable |  |
| disabled | `boolean \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<ContextMenuRadioItemState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ContextMenuRadioItemState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ContextMenuRadioItemState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-436f6e746578744d656e752e526164696f4974656d2e64617461417474726962757465732e636865636b6564"></a>

<a id="api-436f6e746578744d656e752e526164696f4974656d2e64617461417474726962757465732e756e636865636b6564"></a>

<a id="api-436f6e746578744d656e752e526164696f4974656d2e64617461417474726962757465732e686967686c696768746564"></a>

<a id="api-436f6e746578744d656e752e526164696f4974656d2e64617461417474726962757465732e64697361626c6564"></a>

<a id="api-436f6e746578744d656e752e526164696f4974656d2e64617461417474726962757465732e646174612d7374617274696e672d7374796c65"></a>

<a id="api-436f6e746578744d656e752e526164696f4974656d2e64617461417474726962757465732e646174612d656e64696e672d7374796c65"></a>

| Name | Description |
| --- | --- |
| data-checked | Present when checked is true. |
| data-unchecked | Present when checked is false. |
| data-highlighted |  |
| data-disabled |  |
| data-starting-style | Present when transitionStatus is 'starting'. |
| data-ending-style | Present when transitionStatus is 'ending'. |

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6e746578744d656e752e526164696f4974656d2e50726f7073"></a>

<a id="contextmenuradioitemprops"></a>

<a id="api-436f6e746578744d656e752e526164696f4974656d2e50726f70732e70726f703a616c69676e"></a>

### Related exported type: ContextMenu.RadioItem.Props

Declaration: `packages/solid/build/types/menu/radio-item/MenuRadioItem.d.ts:16`

#### Declaration

```typescript
MenuRadioItemProps
```

<a id="api-436f6e746578744d656e752e526164696f4974656d2e50726f70732e6c6162656c"></a>

<a id="ContextMenuRadioItemProps-label"></a>

<a id="api-436f6e746578744d656e752e526164696f4974656d2e50726f70732e76616c7565"></a>

<a id="ContextMenuRadioItemProps-value"></a>

<a id="api-436f6e746578744d656e752e526164696f4974656d2e50726f70732e636c6f73654f6e436c69636b"></a>

<a id="ContextMenuRadioItemProps-closeOnClick"></a>

<a id="api-436f6e746578744d656e752e526164696f4974656d2e50726f70732e6e6174697665427574746f6e"></a>

<a id="ContextMenuRadioItemProps-nativeButton"></a>

<a id="api-436f6e746578744d656e752e526164696f4974656d2e50726f70732e64697361626c6564"></a>

<a id="ContextMenuRadioItemProps-disabled"></a>

<a id="api-436f6e746578744d656e752e526164696f4974656d2e50726f70732e636c617373"></a>

<a id="ContextMenuRadioItemProps-class"></a>

<a id="api-436f6e746578744d656e752e526164696f4974656d2e50726f70732e7374796c65"></a>

<a id="ContextMenuRadioItemProps-style"></a>

<a id="api-436f6e746578744d656e752e526164696f4974656d2e50726f70732e72656e646572"></a>

<a id="ContextMenuRadioItemProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| label | `string \| undefined` | No | Unavailable |  |
| value | `any` | Yes | Unavailable |  |
| closeOnClick | `boolean \| undefined` | No | Unavailable |  |
| nativeButton | `boolean \| undefined` | No | Unavailable |  |
| disabled | `boolean \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<ContextMenuRadioItemState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ContextMenuRadioItemState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ContextMenuRadioItemState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6e746578744d656e752e526164696f4974656d2e5374617465"></a>

<a id="contextmenuradioitemstate"></a>

### Related exported type: ContextMenu.RadioItem.State

Declaration: `packages/solid/build/types/menu/radio-item/MenuRadioItem.d.ts:17`

#### Declaration

```typescript
MenuRadioItemState
```

<a id="api-436f6e746578744d656e752e526164696f4974656d2e53746174652e636865636b6564"></a>

<a id="ContextMenuRadioItemState-checked"></a>

<a id="api-436f6e746578744d656e752e526164696f4974656d2e53746174652e686967686c696768746564"></a>

<a id="ContextMenuRadioItemState-highlighted"></a>

<a id="api-436f6e746578744d656e752e526164696f4974656d2e53746174652e64697361626c6564"></a>

<a id="ContextMenuRadioItemState-disabled"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| checked | `boolean` | Yes | Unavailable |  |
| highlighted | `boolean` | Yes | Unavailable |  |
| disabled | `boolean` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="radioitemindicator"></a>

### RadioItemIndicator

<a id="api-436f6e746578744d656e752e526164696f4974656d496e64696361746f72"></a>

<a id="contextmenuradioitemindicator"></a>

### ContextMenu.RadioItemIndicator

Declaration: `packages/solid/build/types/menu/radio-item-indicator/MenuRadioItemIndicator.d.ts:6`

#### Declaration

```typescript
(props: MenuRadioItemIndicatorProps) => JSX.Element
```

<a id="api-436f6e746578744d656e752e526164696f4974656d496e64696361746f722e2470726f70732e636c617373"></a>

<a id="ContextMenuRadioItemIndicator-class"></a>

<a id="api-436f6e746578744d656e752e526164696f4974656d496e64696361746f722e2470726f70732e7374796c65"></a>

<a id="ContextMenuRadioItemIndicator-style"></a>

<a id="api-436f6e746578744d656e752e526164696f4974656d496e64696361746f722e2470726f70732e6b6565704d6f756e746564"></a>

<a id="ContextMenuRadioItemIndicator-keepMounted"></a>

<a id="api-436f6e746578744d656e752e526164696f4974656d496e64696361746f722e2470726f70732e72656e646572"></a>

<a id="ContextMenuRadioItemIndicator-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<MenuIndicatorState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<MenuIndicatorState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| keepMounted | `boolean \| undefined` | No | Unavailable |  |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, MenuIndicatorState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-436f6e746578744d656e752e526164696f4974656d496e64696361746f722e64617461417474726962757465732e636865636b6564"></a>

<a id="api-436f6e746578744d656e752e526164696f4974656d496e64696361746f722e64617461417474726962757465732e756e636865636b6564"></a>

<a id="api-436f6e746578744d656e752e526164696f4974656d496e64696361746f722e64617461417474726962757465732e64697361626c6564"></a>

<a id="api-436f6e746578744d656e752e526164696f4974656d496e64696361746f722e64617461417474726962757465732e7374617274696e675374796c65"></a>

<a id="api-436f6e746578744d656e752e526164696f4974656d496e64696361746f722e64617461417474726962757465732e656e64696e675374796c65"></a>

| Name | Description |
| --- | --- |
| data-checked |  |
| data-unchecked |  |
| data-disabled |  |
| data-starting-style |  |
| data-ending-style |  |

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6e746578744d656e752e526164696f4974656d496e64696361746f722e50726f7073"></a>

<a id="contextmenuradioitemindicatorprops"></a>

### Related exported type: ContextMenu.RadioItemIndicator.Props

Declaration: `packages/solid/build/types/menu/radio-item-indicator/MenuRadioItemIndicator.d.ts:8`

#### Declaration

```typescript
MenuRadioItemIndicatorProps
```

<a id="api-436f6e746578744d656e752e526164696f4974656d496e64696361746f722e50726f70732e636c617373"></a>

<a id="ContextMenuRadioItemIndicatorProps-class"></a>

<a id="api-436f6e746578744d656e752e526164696f4974656d496e64696361746f722e50726f70732e7374796c65"></a>

<a id="ContextMenuRadioItemIndicatorProps-style"></a>

<a id="api-436f6e746578744d656e752e526164696f4974656d496e64696361746f722e50726f70732e6b6565704d6f756e746564"></a>

<a id="ContextMenuRadioItemIndicatorProps-keepMounted"></a>

<a id="api-436f6e746578744d656e752e526164696f4974656d496e64696361746f722e50726f70732e72656e646572"></a>

<a id="ContextMenuRadioItemIndicatorProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<MenuIndicatorState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<MenuIndicatorState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| keepMounted | `boolean \| undefined` | No | Unavailable |  |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, MenuIndicatorState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6e746578744d656e752e526164696f4974656d496e64696361746f722e5374617465"></a>

<a id="contextmenuradioitemindicatorstate"></a>

### Related exported type: ContextMenu.RadioItemIndicator.State

Declaration: `packages/solid/build/types/menu/radio-item-indicator/MenuRadioItemIndicator.d.ts:9`

#### Declaration

```typescript
MenuRadioItemIndicatorState
```

<a id="api-436f6e746578744d656e752e526164696f4974656d496e64696361746f722e53746174652e636865636b6564"></a>

<a id="ContextMenuRadioItemIndicatorState-checked"></a>

<a id="api-436f6e746578744d656e752e526164696f4974656d496e64696361746f722e53746174652e686967686c696768746564"></a>

<a id="ContextMenuRadioItemIndicatorState-highlighted"></a>

<a id="api-436f6e746578744d656e752e526164696f4974656d496e64696361746f722e53746174652e7472616e736974696f6e537461747573"></a>

<a id="ContextMenuRadioItemIndicatorState-transitionStatus"></a>

<a id="api-436f6e746578744d656e752e526164696f4974656d496e64696361746f722e53746174652e64697361626c6564"></a>

<a id="ContextMenuRadioItemIndicatorState-disabled"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| checked | `boolean` | Yes | Unavailable |  |
| highlighted | `boolean` | Yes | Unavailable |  |
| transitionStatus | `TransitionStatus` | Yes | Unavailable |  |
| disabled | `boolean` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="checkboxitem"></a>

### CheckboxItem

<a id="api-436f6e746578744d656e752e436865636b626f784974656d"></a>

<a id="contextmenucheckboxitem"></a>

<a id="api-436f6e746578744d656e752e436865636b626f784974656d2e2470726f70732e70726f703a616c69676e"></a>

### ContextMenu.CheckboxItem

Declaration: `packages/solid/build/types/menu/checkbox-item/MenuCheckboxItem.d.ts:17`

#### Declaration

```typescript
(props: MenuCheckboxItemProps) => JSX.Element
```

<a id="api-436f6e746578744d656e752e436865636b626f784974656d2e2470726f70732e6c6162656c"></a>

<a id="ContextMenuCheckboxItem-label"></a>

<a id="api-436f6e746578744d656e752e436865636b626f784974656d2e2470726f70732e64656661756c74436865636b6564"></a>

<a id="ContextMenuCheckboxItem-defaultChecked"></a>

<a id="api-436f6e746578744d656e752e436865636b626f784974656d2e2470726f70732e636865636b6564"></a>

<a id="ContextMenuCheckboxItem-checked"></a>

<a id="api-436f6e746578744d656e752e436865636b626f784974656d2e2470726f70732e6f6e436865636b65644368616e6765"></a>

<a id="ContextMenuCheckboxItem-onCheckedChange"></a>

<a id="api-436f6e746578744d656e752e436865636b626f784974656d2e2470726f70732e636c6f73654f6e436c69636b"></a>

<a id="ContextMenuCheckboxItem-closeOnClick"></a>

<a id="api-436f6e746578744d656e752e436865636b626f784974656d2e2470726f70732e6e6174697665427574746f6e"></a>

<a id="ContextMenuCheckboxItem-nativeButton"></a>

<a id="api-436f6e746578744d656e752e436865636b626f784974656d2e2470726f70732e64697361626c6564"></a>

<a id="ContextMenuCheckboxItem-disabled"></a>

<a id="api-436f6e746578744d656e752e436865636b626f784974656d2e2470726f70732e636c617373"></a>

<a id="ContextMenuCheckboxItem-class"></a>

<a id="api-436f6e746578744d656e752e436865636b626f784974656d2e2470726f70732e7374796c65"></a>

<a id="ContextMenuCheckboxItem-style"></a>

<a id="api-436f6e746578744d656e752e436865636b626f784974656d2e2470726f70732e72656e646572"></a>

<a id="ContextMenuCheckboxItem-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| label | `string \| undefined` | No | Unavailable |  |
| defaultChecked | `boolean \| undefined` | No | false |  |
| checked | `boolean \| undefined` | No | Unavailable |  |
| onCheckedChange | `((checked: boolean, details: MenuRoot.ChangeEventDetails) => void) \| undefined` | No | Unavailable |  |
| closeOnClick | `boolean \| undefined` | No | Unavailable |  |
| nativeButton | `boolean \| undefined` | No | false |  |
| disabled | `boolean \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<ContextMenuCheckboxItemState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ContextMenuCheckboxItemState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ContextMenuCheckboxItemState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-436f6e746578744d656e752e436865636b626f784974656d2e64617461417474726962757465732e636865636b6564"></a>

<a id="api-436f6e746578744d656e752e436865636b626f784974656d2e64617461417474726962757465732e756e636865636b6564"></a>

<a id="api-436f6e746578744d656e752e436865636b626f784974656d2e64617461417474726962757465732e686967686c696768746564"></a>

<a id="api-436f6e746578744d656e752e436865636b626f784974656d2e64617461417474726962757465732e64697361626c6564"></a>

<a id="api-436f6e746578744d656e752e436865636b626f784974656d2e64617461417474726962757465732e646174612d7374617274696e672d7374796c65"></a>

<a id="api-436f6e746578744d656e752e436865636b626f784974656d2e64617461417474726962757465732e646174612d656e64696e672d7374796c65"></a>

| Name | Description |
| --- | --- |
| data-checked | Present when checked is true. |
| data-unchecked | Present when checked is false. |
| data-highlighted |  |
| data-disabled |  |
| data-starting-style | Present when transitionStatus is 'starting'. |
| data-ending-style | Present when transitionStatus is 'ending'. |

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6e746578744d656e752e436865636b626f784974656d2e50726f7073"></a>

<a id="contextmenucheckboxitemprops"></a>

<a id="api-436f6e746578744d656e752e436865636b626f784974656d2e50726f70732e70726f703a616c69676e"></a>

### Related exported type: ContextMenu.CheckboxItem.Props

Declaration: `packages/solid/build/types/menu/checkbox-item/MenuCheckboxItem.d.ts:21`

#### Declaration

```typescript
MenuCheckboxItemProps
```

<a id="api-436f6e746578744d656e752e436865636b626f784974656d2e50726f70732e6c6162656c"></a>

<a id="ContextMenuCheckboxItemProps-label"></a>

<a id="api-436f6e746578744d656e752e436865636b626f784974656d2e50726f70732e64656661756c74436865636b6564"></a>

<a id="ContextMenuCheckboxItemProps-defaultChecked"></a>

<a id="api-436f6e746578744d656e752e436865636b626f784974656d2e50726f70732e636865636b6564"></a>

<a id="ContextMenuCheckboxItemProps-checked"></a>

<a id="api-436f6e746578744d656e752e436865636b626f784974656d2e50726f70732e6f6e436865636b65644368616e6765"></a>

<a id="ContextMenuCheckboxItemProps-onCheckedChange"></a>

<a id="api-436f6e746578744d656e752e436865636b626f784974656d2e50726f70732e636c6f73654f6e436c69636b"></a>

<a id="ContextMenuCheckboxItemProps-closeOnClick"></a>

<a id="api-436f6e746578744d656e752e436865636b626f784974656d2e50726f70732e6e6174697665427574746f6e"></a>

<a id="ContextMenuCheckboxItemProps-nativeButton"></a>

<a id="api-436f6e746578744d656e752e436865636b626f784974656d2e50726f70732e64697361626c6564"></a>

<a id="ContextMenuCheckboxItemProps-disabled"></a>

<a id="api-436f6e746578744d656e752e436865636b626f784974656d2e50726f70732e636c617373"></a>

<a id="ContextMenuCheckboxItemProps-class"></a>

<a id="api-436f6e746578744d656e752e436865636b626f784974656d2e50726f70732e7374796c65"></a>

<a id="ContextMenuCheckboxItemProps-style"></a>

<a id="api-436f6e746578744d656e752e436865636b626f784974656d2e50726f70732e72656e646572"></a>

<a id="ContextMenuCheckboxItemProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| label | `string \| undefined` | No | Unavailable |  |
| defaultChecked | `boolean \| undefined` | No | Unavailable |  |
| checked | `boolean \| undefined` | No | Unavailable |  |
| onCheckedChange | `((checked: boolean, details: MenuRoot.ChangeEventDetails) => void) \| undefined` | No | Unavailable |  |
| closeOnClick | `boolean \| undefined` | No | Unavailable |  |
| nativeButton | `boolean \| undefined` | No | Unavailable |  |
| disabled | `boolean \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<ContextMenuCheckboxItemState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ContextMenuCheckboxItemState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ContextMenuCheckboxItemState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6e746578744d656e752e436865636b626f784974656d2e5374617465"></a>

<a id="contextmenucheckboxitemstate"></a>

### Related exported type: ContextMenu.CheckboxItem.State

Declaration: `packages/solid/build/types/menu/checkbox-item/MenuCheckboxItem.d.ts:22`

#### Declaration

```typescript
MenuCheckboxItemState
```

<a id="api-436f6e746578744d656e752e436865636b626f784974656d2e53746174652e636865636b6564"></a>

<a id="ContextMenuCheckboxItemState-checked"></a>

<a id="api-436f6e746578744d656e752e436865636b626f784974656d2e53746174652e686967686c696768746564"></a>

<a id="ContextMenuCheckboxItemState-highlighted"></a>

<a id="api-436f6e746578744d656e752e436865636b626f784974656d2e53746174652e64697361626c6564"></a>

<a id="ContextMenuCheckboxItemState-disabled"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| checked | `boolean` | Yes | Unavailable |  |
| highlighted | `boolean` | Yes | Unavailable |  |
| disabled | `boolean` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6e746578744d656e752e436865636b626f784974656d2e4368616e67654576656e74526561736f6e"></a>

<a id="contextmenucheckboxitemchangeeventreason"></a>

### Related exported type: ContextMenu.CheckboxItem.ChangeEventReason

Declaration: `packages/solid/build/types/menu/checkbox-item/MenuCheckboxItem.d.ts:23`

#### Declaration

```typescript
MenuRootChangeEventReason
```

Inherited DOM attributes: `__@iterator@106`, `anchor`, `at`, `big`, `blink`, `bold`, `charAt`, `charCodeAt`, `codePointAt`, `concat`, `endsWith`, `fixed`, `fontcolor`, `fontsize`, `includes`, `indexOf`, `isWellFormed`, `italics`, `lastIndexOf`, `length`, `link`, `localeCompare`, `match`, `matchAll`, `normalize`, `padEnd`, `padStart`, `repeat`, `replace`, `replaceAll`, `search`, `slice`, `small`, `split`, `startsWith`, `strike`, `sub`, `substr`, `substring`, `sup`, `toLocaleLowerCase`, `toLocaleUpperCase`, `toLowerCase`, `toString`, `toUpperCase`, `toWellFormed`, `trim`, `trimEnd`, `trimLeft`, `trimRight`, `trimStart`, `valueOf`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6e746578744d656e752e436865636b626f784974656d2e4368616e67654576656e7444657461696c73"></a>

<a id="contextmenucheckboxitemchangeeventdetails"></a>

### Related exported type: ContextMenu.CheckboxItem.ChangeEventDetails

Declaration: `packages/solid/build/types/menu/checkbox-item/MenuCheckboxItem.d.ts:24`

#### Declaration

```typescript
MenuRootChangeEventDetails
```

<a id="api-436f6e746578744d656e752e436865636b626f784974656d2e4368616e67654576656e7444657461696c732e616c6c6f7750726f7061676174696f6e"></a>

<a id="ContextMenuCheckboxItemChangeEventDetails-allowPropagation"></a>

<a id="api-436f6e746578744d656e752e436865636b626f784974656d2e4368616e67654576656e7444657461696c732e63616e63656c"></a>

<a id="ContextMenuCheckboxItemChangeEventDetails-cancel"></a>

<a id="api-436f6e746578744d656e752e436865636b626f784974656d2e4368616e67654576656e7444657461696c732e6576656e74"></a>

<a id="ContextMenuCheckboxItemChangeEventDetails-event"></a>

<a id="api-436f6e746578744d656e752e436865636b626f784974656d2e4368616e67654576656e7444657461696c732e697343616e63656c6564"></a>

<a id="ContextMenuCheckboxItemChangeEventDetails-isCanceled"></a>

<a id="api-436f6e746578744d656e752e436865636b626f784974656d2e4368616e67654576656e7444657461696c732e697350726f7061676174696f6e416c6c6f776564"></a>

<a id="ContextMenuCheckboxItemChangeEventDetails-isPropagationAllowed"></a>

<a id="api-436f6e746578744d656e752e436865636b626f784974656d2e4368616e67654576656e7444657461696c732e70726576656e74556e6d6f756e744f6e436c6f7365"></a>

<a id="ContextMenuCheckboxItemChangeEventDetails-preventUnmountOnClose"></a>

<a id="api-436f6e746578744d656e752e436865636b626f784974656d2e4368616e67654576656e7444657461696c732e726561736f6e"></a>

<a id="ContextMenuCheckboxItemChangeEventDetails-reason"></a>

<a id="api-436f6e746578744d656e752e436865636b626f784974656d2e4368616e67654576656e7444657461696c732e74726967676572"></a>

<a id="ContextMenuCheckboxItemChangeEventDetails-trigger"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| allowPropagation | `() => void` | Yes | Unavailable | Marks this change transaction as allowing propagation. |
| cancel | `() => void` | Yes | Unavailable | Cancels the Base UI change transaction; separate from the DOM event’s preventDefault() and preventBaseUIHandler(). |
| event | `PointerEvent \| MouseEvent \| Event \| FocusEvent \| KeyboardEvent \| TouchEvent` | Yes | Unavailable | Native DOM event associated with the change. Programmatic changes can use a Base UI-created Event. |
| isCanceled | `boolean` | Yes | Unavailable | Whether cancel() has been called for this change transaction. |
| isPropagationAllowed | `boolean` | Yes | Unavailable | Whether allowPropagation() has been called for this change transaction. |
| preventUnmountOnClose | `() => void` | Yes | Unavailable |  |
| reason | `"none" \| "trigger-press" \| "trigger-hover" \| "trigger-focus" \| "outside-press" \| "item-press" \| "close-press" \| "focus-out" \| "escape-key" \| "list-navigation" \| "cancel-open" \| "sibling-open" \| "imperative-action"` | Yes | Unavailable | Reason for the requested change; it discriminates the native event type. |
| trigger | `Element \| undefined` | Yes | Unavailable | Trigger element associated with this change, when available. |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="checkboxitemindicator"></a>

### CheckboxItemIndicator

<a id="api-436f6e746578744d656e752e436865636b626f784974656d496e64696361746f72"></a>

<a id="contextmenucheckboxitemindicator"></a>

### ContextMenu.CheckboxItemIndicator

Declaration: `packages/solid/build/types/menu/checkbox-item-indicator/MenuCheckboxItemIndicator.d.ts:6`

#### Declaration

```typescript
(props: MenuCheckboxItemIndicatorProps) => JSX.Element
```

<a id="api-436f6e746578744d656e752e436865636b626f784974656d496e64696361746f722e2470726f70732e636c617373"></a>

<a id="ContextMenuCheckboxItemIndicator-class"></a>

<a id="api-436f6e746578744d656e752e436865636b626f784974656d496e64696361746f722e2470726f70732e7374796c65"></a>

<a id="ContextMenuCheckboxItemIndicator-style"></a>

<a id="api-436f6e746578744d656e752e436865636b626f784974656d496e64696361746f722e2470726f70732e6b6565704d6f756e746564"></a>

<a id="ContextMenuCheckboxItemIndicator-keepMounted"></a>

<a id="api-436f6e746578744d656e752e436865636b626f784974656d496e64696361746f722e2470726f70732e72656e646572"></a>

<a id="ContextMenuCheckboxItemIndicator-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<MenuIndicatorState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<MenuIndicatorState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| keepMounted | `boolean \| undefined` | No | Unavailable |  |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, MenuIndicatorState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-436f6e746578744d656e752e436865636b626f784974656d496e64696361746f722e64617461417474726962757465732e636865636b6564"></a>

<a id="api-436f6e746578744d656e752e436865636b626f784974656d496e64696361746f722e64617461417474726962757465732e756e636865636b6564"></a>

<a id="api-436f6e746578744d656e752e436865636b626f784974656d496e64696361746f722e64617461417474726962757465732e64697361626c6564"></a>

<a id="api-436f6e746578744d656e752e436865636b626f784974656d496e64696361746f722e64617461417474726962757465732e7374617274696e675374796c65"></a>

<a id="api-436f6e746578744d656e752e436865636b626f784974656d496e64696361746f722e64617461417474726962757465732e656e64696e675374796c65"></a>

| Name | Description |
| --- | --- |
| data-checked |  |
| data-unchecked |  |
| data-disabled |  |
| data-starting-style |  |
| data-ending-style |  |

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6e746578744d656e752e436865636b626f784974656d496e64696361746f722e50726f7073"></a>

<a id="contextmenucheckboxitemindicatorprops"></a>

### Related exported type: ContextMenu.CheckboxItemIndicator.Props

Declaration: `packages/solid/build/types/menu/checkbox-item-indicator/MenuCheckboxItemIndicator.d.ts:8`

#### Declaration

```typescript
MenuCheckboxItemIndicatorProps
```

<a id="api-436f6e746578744d656e752e436865636b626f784974656d496e64696361746f722e50726f70732e636c617373"></a>

<a id="ContextMenuCheckboxItemIndicatorProps-class"></a>

<a id="api-436f6e746578744d656e752e436865636b626f784974656d496e64696361746f722e50726f70732e7374796c65"></a>

<a id="ContextMenuCheckboxItemIndicatorProps-style"></a>

<a id="api-436f6e746578744d656e752e436865636b626f784974656d496e64696361746f722e50726f70732e6b6565704d6f756e746564"></a>

<a id="ContextMenuCheckboxItemIndicatorProps-keepMounted"></a>

<a id="api-436f6e746578744d656e752e436865636b626f784974656d496e64696361746f722e50726f70732e72656e646572"></a>

<a id="ContextMenuCheckboxItemIndicatorProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<MenuIndicatorState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<MenuIndicatorState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| keepMounted | `boolean \| undefined` | No | Unavailable |  |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, MenuIndicatorState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6e746578744d656e752e436865636b626f784974656d496e64696361746f722e5374617465"></a>

<a id="contextmenucheckboxitemindicatorstate"></a>

### Related exported type: ContextMenu.CheckboxItemIndicator.State

Declaration: `packages/solid/build/types/menu/checkbox-item-indicator/MenuCheckboxItemIndicator.d.ts:9`

#### Declaration

```typescript
MenuCheckboxItemIndicatorState
```

<a id="api-436f6e746578744d656e752e436865636b626f784974656d496e64696361746f722e53746174652e636865636b6564"></a>

<a id="ContextMenuCheckboxItemIndicatorState-checked"></a>

<a id="api-436f6e746578744d656e752e436865636b626f784974656d496e64696361746f722e53746174652e686967686c696768746564"></a>

<a id="ContextMenuCheckboxItemIndicatorState-highlighted"></a>

<a id="api-436f6e746578744d656e752e436865636b626f784974656d496e64696361746f722e53746174652e7472616e736974696f6e537461747573"></a>

<a id="ContextMenuCheckboxItemIndicatorState-transitionStatus"></a>

<a id="api-436f6e746578744d656e752e436865636b626f784974656d496e64696361746f722e53746174652e64697361626c6564"></a>

<a id="ContextMenuCheckboxItemIndicatorState-disabled"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| checked | `boolean` | Yes | Unavailable |  |
| highlighted | `boolean` | Yes | Unavailable |  |
| transitionStatus | `TransitionStatus` | Yes | Unavailable |  |
| disabled | `boolean` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="separator"></a>

### Separator

<a id="api-436f6e746578744d656e752e536570617261746f72"></a>

<a id="contextmenuseparator"></a>

<a id="api-436f6e746578744d656e752e536570617261746f722e2470726f70732e70726f703a616c69676e"></a>

### ContextMenu.Separator

A separator element accessible to screen readers.
Renders a `<div>` element.

Declaration: `packages/solid/build/types/separator/Separator.d.ts:6`

#### Declaration

```typescript
(componentProps: Separator.Props) => JSX.Element
```

<a id="api-436f6e746578744d656e752e536570617261746f722e2470726f70732e6f7269656e746174696f6e"></a>

<a id="ContextMenuSeparator-orientation"></a>

<a id="api-436f6e746578744d656e752e536570617261746f722e2470726f70732e636c617373"></a>

<a id="ContextMenuSeparator-class"></a>

<a id="api-436f6e746578744d656e752e536570617261746f722e2470726f70732e7374796c65"></a>

<a id="ContextMenuSeparator-style"></a>

<a id="api-436f6e746578744d656e752e536570617261746f722e2470726f70732e72656e646572"></a>

<a id="ContextMenuSeparator-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| orientation | `Orientation \| undefined` | No | 'horizontal' | The orientation of the separator. |
| class | `JSX.ClassValue \| ((state: Readonly<SeparatorState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<SeparatorState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, SeparatorState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-436f6e746578744d656e752e536570617261746f722e64617461417474726962757465732e6f7269656e746174696f6e"></a>

| Name | Description |
| --- | --- |
| data-orientation | Indicates the orientation of the separator. |

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6e746578744d656e752e536570617261746f722e50726f7073"></a>

<a id="contextmenuseparatorprops"></a>

<a id="api-436f6e746578744d656e752e536570617261746f722e50726f70732e70726f703a616c69676e"></a>

### Related exported type: ContextMenu.Separator.Props

Declaration: `packages/solid/build/types/separator/Separator.d.ts:19`

#### Declaration

```typescript
SeparatorProps
```

<a id="api-436f6e746578744d656e752e536570617261746f722e50726f70732e6f7269656e746174696f6e"></a>

<a id="ContextMenuSeparatorProps-orientation"></a>

<a id="api-436f6e746578744d656e752e536570617261746f722e50726f70732e636c617373"></a>

<a id="ContextMenuSeparatorProps-class"></a>

<a id="api-436f6e746578744d656e752e536570617261746f722e50726f70732e7374796c65"></a>

<a id="ContextMenuSeparatorProps-style"></a>

<a id="api-436f6e746578744d656e752e536570617261746f722e50726f70732e72656e646572"></a>

<a id="ContextMenuSeparatorProps-render"></a>

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

<a id="api-436f6e746578744d656e752e536570617261746f722e5374617465"></a>

<a id="contextmenuseparatorstate"></a>

### Related exported type: ContextMenu.Separator.State

Declaration: `packages/solid/build/types/separator/Separator.d.ts:20`

#### Declaration

```typescript
SeparatorState
```

<a id="api-436f6e746578744d656e752e536570617261746f722e53746174652e6f7269656e746174696f6e"></a>

<a id="ContextMenuSeparatorState-orientation"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| orientation | `Orientation` | Yes | Unavailable | The orientation of the separator. |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

