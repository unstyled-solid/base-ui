<a id="navigation-menu"></a>

# Navigation Menu

A collection of links and menus for website navigation.

[Open mounted Solid demo: navigation-menu/hero](/solid/components/navigation-menu)

<a id="anatomy"></a>

## Anatomy

Import the component and assemble its parts:

```tsx
import { NavigationMenu } from '@unstyled-solid/base-ui/navigation-menu';
<NavigationMenu.Root>
  <NavigationMenu.List>
    <NavigationMenu.Item>
      <NavigationMenu.Trigger>
        <NavigationMenu.Icon />
      </NavigationMenu.Trigger>
      <NavigationMenu.Content>
        <NavigationMenu.Link />
      </NavigationMenu.Content>
    </NavigationMenu.Item>
  </NavigationMenu.List>

  <NavigationMenu.Portal>
    <NavigationMenu.Backdrop />
    <NavigationMenu.Positioner>
      <NavigationMenu.Popup>
        <NavigationMenu.Arrow />
        <NavigationMenu.Viewport />
      </NavigationMenu.Popup>
    </NavigationMenu.Positioner>
  </NavigationMenu.Portal>
</NavigationMenu.Root>;
```

<a id="examples"></a>

## Examples

<a id="nested-submenus"></a>

### Nested submenus

`<NavigationMenu.Root>` component can be nested within a higher-level `<NavigationMenu.Content>` part to create a multi-level navigation menu.

[Open mounted Solid demo: navigation-menu/nested](/solid/components/navigation-menu)

<a id="nested-inline-submenus"></a>

### Nested inline submenus

For second-level navigation that should stay in the same panel, omit the nested `<NavigationMenu.Portal>` and render only `List` + `Viewport` with a `defaultValue`.

[Open mounted Solid demo: navigation-menu/nested-inline](/solid/components/navigation-menu)

<a id="custom-links"></a>

### Custom links

Use the render callback to customize the anchor element while forwarding all received props and refs. The example uses native navigation; router integration depends on your Solid-compatible router.

```jsx
import { NavigationMenu } from '@unstyled-solid/base-ui/navigation-menu';
function Link(props: NavigationMenu.Link.Props) {
  return (
    <NavigationMenu.Link
      render={(renderProps) => <a {...renderProps} href={props.href} />}
      {...props}
    />
  );
}
```

<a id="large-menus"></a>

### Large menus

When you have large menu content that doesn't fit in the viewport in some cases, you usually have two choices:

1. Compress the navigation menu content

You can change the layout of the navigation menu to render less content or be more compact by reducing the space it takes up.
If your content is flexible, you can use the `max-height` property on `.Popup` to limit the height of the navigation menu to let it compress itself while preventing overflow.

```css
.Content,
.Popup {
  max-height: var(--available-height);
}
```

2. Make the navigation menu scrollable

```css
.Content,
.Popup {
  max-height: var(--available-height);
}

.Content {
  overflow-y: auto;
}
```

Native scrollbars are visible while transitioning content, so we recommend using the [Scroll Area](/solid/components/scroll-area) component instead of native scrollbars to keep them hidden, which also allows the `Arrow` to be centered correctly.

<a id="closing-animations"></a>

## Closing animations

The popup stays rendered until its closing animation finishes.
See [JavaScript animations](/solid/handbook/animation#javascript-animations) for native Web Animations and manual control.
For Navigation Menu, call `eventDetails.preventUnmountOnClose()` in `onValueChange` when the value becomes `null`, and use `actionsRef.current.close()` instead of setting `value` to `null` directly.

<a id="api-reference"></a>

## API reference

<a id="root"></a>

### Root

<a id="api-4e617669676174696f6e4d656e752e526f6f74"></a>

<a id="navigationmenuroot"></a>

### NavigationMenu.Root

Declaration: `packages/solid/build/types/navigation-menu/root/NavigationMenuRoot.d.ts:4`

#### Declaration

```typescript
<Value = any>(props: NavigationMenuRoot.Props<Value>) => JSX.Element
```

<a id="api-4e617669676174696f6e4d656e752e526f6f742e2470726f70732e64656661756c7456616c7565"></a>

<a id="NavigationMenuRoot-defaultValue"></a>

<a id="api-4e617669676174696f6e4d656e752e526f6f742e2470726f70732e76616c7565"></a>

<a id="NavigationMenuRoot-value"></a>

<a id="api-4e617669676174696f6e4d656e752e526f6f742e2470726f70732e6f6e56616c75654368616e6765"></a>

<a id="NavigationMenuRoot-onValueChange"></a>

<a id="api-4e617669676174696f6e4d656e752e526f6f742e2470726f70732e616374696f6e73526566"></a>

<a id="NavigationMenuRoot-actionsRef"></a>

<a id="api-4e617669676174696f6e4d656e752e526f6f742e2470726f70732e6f6e4f70656e4368616e6765436f6d706c657465"></a>

<a id="NavigationMenuRoot-onOpenChangeComplete"></a>

<a id="api-4e617669676174696f6e4d656e752e526f6f742e2470726f70732e64656c6179"></a>

<a id="NavigationMenuRoot-delay"></a>

<a id="api-4e617669676174696f6e4d656e752e526f6f742e2470726f70732e636c6f736544656c6179"></a>

<a id="NavigationMenuRoot-closeDelay"></a>

<a id="api-4e617669676174696f6e4d656e752e526f6f742e2470726f70732e6f7269656e746174696f6e"></a>

<a id="NavigationMenuRoot-orientation"></a>

<a id="api-4e617669676174696f6e4d656e752e526f6f742e2470726f70732e636c617373"></a>

<a id="NavigationMenuRoot-class"></a>

<a id="api-4e617669676174696f6e4d656e752e526f6f742e2470726f70732e7374796c65"></a>

<a id="NavigationMenuRoot-style"></a>

<a id="api-4e617669676174696f6e4d656e752e526f6f742e2470726f70732e72656e646572"></a>

<a id="NavigationMenuRoot-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| defaultValue | `Value \| null \| undefined` | No | null |  |
| value | `Value \| null \| undefined` | No | Unavailable |  |
| onValueChange | `((value: Value \| null, details: NavigationMenuRootChangeEventDetails) => void) \| undefined` | No | Unavailable |  |
| actionsRef | `{ current: NavigationMenuRootActions \| null; } \| ((actions: NavigationMenuRootActions \| null) => void) \| undefined` | No | Unavailable |  |
| onOpenChangeComplete | `((open: boolean) => void) \| undefined` | No | Unavailable |  |
| delay | `number \| undefined` | No | 50 |  |
| closeDelay | `number \| undefined` | No | 50 |  |
| orientation | `"horizontal" \| "vertical" \| undefined` | No | 'horizontal' |  |
| class | `JSX.ClassValue \| ((state: Readonly<NavigationMenuRootState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<NavigationMenuRootState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, NavigationMenuRootState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4e617669676174696f6e4d656e752e526f6f742e56616c7565"></a>

<a id="navigationmenurootvalue"></a>

### Related exported type: NavigationMenu.Root.Value

Declaration: `packages/solid/build/types/navigation-menu/root/NavigationMenuRoot.d.ts:31`

#### Declaration

```typescript
Value<T>
```

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4e617669676174696f6e4d656e752e526f6f742e416374696f6e73"></a>

<a id="navigationmenurootactions"></a>

### Related exported type: NavigationMenu.Root.Actions

Declaration: `packages/solid/build/types/navigation-menu/root/NavigationMenuRoot.d.ts:33`

#### Declaration

```typescript
NavigationMenuRootActions
```

<a id="api-4e617669676174696f6e4d656e752e526f6f742e416374696f6e732e636c6f7365"></a>

<a id="NavigationMenuRootActions-close"></a>

<a id="api-4e617669676174696f6e4d656e752e526f6f742e416374696f6e732e756e6d6f756e74"></a>

<a id="NavigationMenuRootActions-unmount"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| close | `() => void` | Yes | Unavailable |  |
| unmount | `() => void` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4e617669676174696f6e4d656e752e526f6f742e4368616e67654576656e7444657461696c73"></a>

<a id="navigationmenurootchangeeventdetails"></a>

### Related exported type: NavigationMenu.Root.ChangeEventDetails

Declaration: `packages/solid/build/types/navigation-menu/root/NavigationMenuRoot.d.ts:35`

#### Declaration

```typescript
NavigationMenuRootChangeEventDetails
```

<a id="api-4e617669676174696f6e4d656e752e526f6f742e4368616e67654576656e7444657461696c732e616c6c6f7750726f7061676174696f6e"></a>

<a id="NavigationMenuRootChangeEventDetails-allowPropagation"></a>

<a id="api-4e617669676174696f6e4d656e752e526f6f742e4368616e67654576656e7444657461696c732e63616e63656c"></a>

<a id="NavigationMenuRootChangeEventDetails-cancel"></a>

<a id="api-4e617669676174696f6e4d656e752e526f6f742e4368616e67654576656e7444657461696c732e6576656e74"></a>

<a id="NavigationMenuRootChangeEventDetails-event"></a>

<a id="api-4e617669676174696f6e4d656e752e526f6f742e4368616e67654576656e7444657461696c732e697343616e63656c6564"></a>

<a id="NavigationMenuRootChangeEventDetails-isCanceled"></a>

<a id="api-4e617669676174696f6e4d656e752e526f6f742e4368616e67654576656e7444657461696c732e697350726f7061676174696f6e416c6c6f776564"></a>

<a id="NavigationMenuRootChangeEventDetails-isPropagationAllowed"></a>

<a id="api-4e617669676174696f6e4d656e752e526f6f742e4368616e67654576656e7444657461696c732e70726576656e74556e6d6f756e744f6e436c6f7365"></a>

<a id="NavigationMenuRootChangeEventDetails-preventUnmountOnClose"></a>

<a id="api-4e617669676174696f6e4d656e752e526f6f742e4368616e67654576656e7444657461696c732e726561736f6e"></a>

<a id="NavigationMenuRootChangeEventDetails-reason"></a>

<a id="api-4e617669676174696f6e4d656e752e526f6f742e4368616e67654576656e7444657461696c732e74726967676572"></a>

<a id="NavigationMenuRootChangeEventDetails-trigger"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| allowPropagation | `() => void` | Yes | Unavailable | Marks this change transaction as allowing propagation. |
| cancel | `() => void` | Yes | Unavailable | Cancels the Base UI change transaction; separate from the DOM event’s preventDefault() and preventBaseUIHandler(). |
| event | `PointerEvent \| MouseEvent \| Event \| FocusEvent \| KeyboardEvent \| TouchEvent` | Yes | Unavailable | Native DOM event associated with the change. Programmatic changes can use a Base UI-created Event. |
| isCanceled | `boolean` | Yes | Unavailable | Whether cancel() has been called for this change transaction. |
| isPropagationAllowed | `boolean` | Yes | Unavailable | Whether allowPropagation() has been called for this change transaction. |
| preventUnmountOnClose | `() => void` | Yes | Unavailable |  |
| reason | `"none" \| "trigger-press" \| "trigger-hover" \| "outside-press" \| "link-press" \| "focus-out" \| "escape-key" \| "list-navigation" \| "imperative-action"` | Yes | Unavailable | Reason for the requested change; it discriminates the native event type. |
| trigger | `Element \| undefined` | Yes | Unavailable | Trigger element associated with this change, when available. |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4e617669676174696f6e4d656e752e526f6f742e4368616e67654576656e74526561736f6e"></a>

<a id="navigationmenurootchangeeventreason"></a>

### Related exported type: NavigationMenu.Root.ChangeEventReason

Declaration: `packages/solid/build/types/navigation-menu/root/NavigationMenuRoot.d.ts:34`

#### Declaration

```typescript
NavigationMenuRootChangeEventReason
```

Inherited DOM attributes: `__@iterator@106`, `anchor`, `at`, `big`, `blink`, `bold`, `charAt`, `charCodeAt`, `codePointAt`, `concat`, `endsWith`, `fixed`, `fontcolor`, `fontsize`, `includes`, `indexOf`, `isWellFormed`, `italics`, `lastIndexOf`, `length`, `link`, `localeCompare`, `match`, `matchAll`, `normalize`, `padEnd`, `padStart`, `repeat`, `replace`, `replaceAll`, `search`, `slice`, `small`, `split`, `startsWith`, `strike`, `sub`, `substr`, `substring`, `sup`, `toLocaleLowerCase`, `toLocaleUpperCase`, `toLowerCase`, `toString`, `toUpperCase`, `toWellFormed`, `trim`, `trimEnd`, `trimLeft`, `trimRight`, `trimStart`, `valueOf`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4e617669676174696f6e4d656e752e526f6f742e50726f7073"></a>

<a id="navigationmenurootprops"></a>

### Related exported type: NavigationMenu.Root.Props

Declaration: `packages/solid/build/types/navigation-menu/root/NavigationMenuRoot.d.ts:30`

#### Declaration

```typescript
Props<T>
```

<a id="api-4e617669676174696f6e4d656e752e526f6f742e50726f70732e64656661756c7456616c7565"></a>

<a id="NavigationMenuRootProps-defaultValue"></a>

<a id="api-4e617669676174696f6e4d656e752e526f6f742e50726f70732e76616c7565"></a>

<a id="NavigationMenuRootProps-value"></a>

<a id="api-4e617669676174696f6e4d656e752e526f6f742e50726f70732e6f6e56616c75654368616e6765"></a>

<a id="NavigationMenuRootProps-onValueChange"></a>

<a id="api-4e617669676174696f6e4d656e752e526f6f742e50726f70732e616374696f6e73526566"></a>

<a id="NavigationMenuRootProps-actionsRef"></a>

<a id="api-4e617669676174696f6e4d656e752e526f6f742e50726f70732e6f6e4f70656e4368616e6765436f6d706c657465"></a>

<a id="NavigationMenuRootProps-onOpenChangeComplete"></a>

<a id="api-4e617669676174696f6e4d656e752e526f6f742e50726f70732e64656c6179"></a>

<a id="NavigationMenuRootProps-delay"></a>

<a id="api-4e617669676174696f6e4d656e752e526f6f742e50726f70732e636c6f736544656c6179"></a>

<a id="NavigationMenuRootProps-closeDelay"></a>

<a id="api-4e617669676174696f6e4d656e752e526f6f742e50726f70732e6f7269656e746174696f6e"></a>

<a id="NavigationMenuRootProps-orientation"></a>

<a id="api-4e617669676174696f6e4d656e752e526f6f742e50726f70732e636c617373"></a>

<a id="NavigationMenuRootProps-class"></a>

<a id="api-4e617669676174696f6e4d656e752e526f6f742e50726f70732e7374796c65"></a>

<a id="NavigationMenuRootProps-style"></a>

<a id="api-4e617669676174696f6e4d656e752e526f6f742e50726f70732e72656e646572"></a>

<a id="NavigationMenuRootProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| defaultValue | `T \| null \| undefined` | No | Unavailable |  |
| value | `T \| null \| undefined` | No | Unavailable |  |
| onValueChange | `((value: T \| null, details: NavigationMenuRootChangeEventDetails) => void) \| undefined` | No | Unavailable |  |
| actionsRef | `{ current: NavigationMenuRootActions \| null; } \| ((actions: NavigationMenuRootActions \| null) => void) \| undefined` | No | Unavailable |  |
| onOpenChangeComplete | `((open: boolean) => void) \| undefined` | No | Unavailable |  |
| delay | `number \| undefined` | No | Unavailable |  |
| closeDelay | `number \| undefined` | No | Unavailable |  |
| orientation | `"horizontal" \| "vertical" \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<NavigationMenuRootState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<NavigationMenuRootState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, NavigationMenuRootState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4e617669676174696f6e4d656e752e526f6f742e5374617465"></a>

<a id="navigationmenurootstate"></a>

### Related exported type: NavigationMenu.Root.State

Declaration: `packages/solid/build/types/navigation-menu/root/NavigationMenuRoot.d.ts:32`

#### Declaration

```typescript
NavigationMenuRootState
```

<a id="api-4e617669676174696f6e4d656e752e526f6f742e53746174652e6f70656e"></a>

<a id="NavigationMenuRootState-open"></a>

<a id="api-4e617669676174696f6e4d656e752e526f6f742e53746174652e6e6573746564"></a>

<a id="NavigationMenuRootState-nested"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| open | `boolean` | Yes | Unavailable |  |
| nested | `boolean` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="list"></a>

### List

<a id="api-4e617669676174696f6e4d656e752e4c697374"></a>

<a id="navigationmenulist"></a>

<a id="api-4e617669676174696f6e4d656e752e4c6973742e2470726f70732e70726f703a636f6d70616374"></a>

<a id="api-4e617669676174696f6e4d656e752e4c6973742e2470726f70732e70726f703a74797065"></a>

### NavigationMenu.List

Declaration: `packages/solid/build/types/navigation-menu/list/NavigationMenuList.d.ts:3`

#### Declaration

```typescript
(props: NavigationMenuList.Props) => JSX.Element
```

<a id="api-4e617669676174696f6e4d656e752e4c6973742e2470726f70732e636c617373"></a>

<a id="NavigationMenuList-class"></a>

<a id="api-4e617669676174696f6e4d656e752e4c6973742e2470726f70732e7374796c65"></a>

<a id="NavigationMenuList-style"></a>

<a id="api-4e617669676174696f6e4d656e752e4c6973742e2470726f70732e72656e646572"></a>

<a id="NavigationMenuList-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<NavigationMenuListState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<NavigationMenuListState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, NavigationMenuListState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:compact`, `prop:type`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4e617669676174696f6e4d656e752e4c6973742e50726f7073"></a>

<a id="navigationmenulistprops"></a>

<a id="api-4e617669676174696f6e4d656e752e4c6973742e50726f70732e70726f703a636f6d70616374"></a>

<a id="api-4e617669676174696f6e4d656e752e4c6973742e50726f70732e70726f703a74797065"></a>

### Related exported type: NavigationMenu.List.Props

Declaration: `packages/solid/build/types/navigation-menu/list/NavigationMenuList.d.ts:11`

#### Declaration

```typescript
NavigationMenuListProps
```

<a id="api-4e617669676174696f6e4d656e752e4c6973742e50726f70732e636c617373"></a>

<a id="NavigationMenuListProps-class"></a>

<a id="api-4e617669676174696f6e4d656e752e4c6973742e50726f70732e7374796c65"></a>

<a id="NavigationMenuListProps-style"></a>

<a id="api-4e617669676174696f6e4d656e752e4c6973742e50726f70732e72656e646572"></a>

<a id="NavigationMenuListProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<NavigationMenuListState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<NavigationMenuListState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, NavigationMenuListState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:compact`, `prop:type`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4e617669676174696f6e4d656e752e4c6973742e5374617465"></a>

<a id="navigationmenuliststate"></a>

### Related exported type: NavigationMenu.List.State

Declaration: `packages/solid/build/types/navigation-menu/list/NavigationMenuList.d.ts:10`

#### Declaration

```typescript
NavigationMenuListState
```

<a id="api-4e617669676174696f6e4d656e752e4c6973742e53746174652e6f70656e"></a>

<a id="NavigationMenuListState-open"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| open | `boolean` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="item"></a>

### Item

<a id="api-4e617669676174696f6e4d656e752e4974656d"></a>

<a id="navigationmenuitem"></a>

<a id="api-4e617669676174696f6e4d656e752e4974656d2e2470726f70732e70726f703a74797065"></a>

<a id="api-4e617669676174696f6e4d656e752e4974656d2e2470726f70732e70726f703a76616c7565"></a>

### NavigationMenu.Item

Declaration: `packages/solid/build/types/navigation-menu/item/NavigationMenuItem.d.ts:2`

#### Declaration

```typescript
(props: NavigationMenuItem.Props) => JSX.Element
```

<a id="api-4e617669676174696f6e4d656e752e4974656d2e2470726f70732e76616c7565"></a>

<a id="NavigationMenuItem-value"></a>

<a id="api-4e617669676174696f6e4d656e752e4974656d2e2470726f70732e636c617373"></a>

<a id="NavigationMenuItem-class"></a>

<a id="api-4e617669676174696f6e4d656e752e4974656d2e2470726f70732e7374796c65"></a>

<a id="NavigationMenuItem-style"></a>

<a id="api-4e617669676174696f6e4d656e752e4974656d2e2470726f70732e72656e646572"></a>

<a id="NavigationMenuItem-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| value | `any` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<NavigationMenuItemState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<NavigationMenuItemState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, NavigationMenuItemState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:type`, `prop:value`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `type`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4e617669676174696f6e4d656e752e4974656d2e50726f7073"></a>

<a id="navigationmenuitemprops"></a>

<a id="api-4e617669676174696f6e4d656e752e4974656d2e50726f70732e70726f703a74797065"></a>

<a id="api-4e617669676174696f6e4d656e752e4974656d2e50726f70732e70726f703a76616c7565"></a>

### Related exported type: NavigationMenu.Item.Props

Declaration: `packages/solid/build/types/navigation-menu/item/NavigationMenuItem.d.ts:10`

#### Declaration

```typescript
NavigationMenuItemProps
```

<a id="api-4e617669676174696f6e4d656e752e4974656d2e50726f70732e76616c7565"></a>

<a id="NavigationMenuItemProps-value"></a>

<a id="api-4e617669676174696f6e4d656e752e4974656d2e50726f70732e636c617373"></a>

<a id="NavigationMenuItemProps-class"></a>

<a id="api-4e617669676174696f6e4d656e752e4974656d2e50726f70732e7374796c65"></a>

<a id="NavigationMenuItemProps-style"></a>

<a id="api-4e617669676174696f6e4d656e752e4974656d2e50726f70732e72656e646572"></a>

<a id="NavigationMenuItemProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| value | `any` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<NavigationMenuItemState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<NavigationMenuItemState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, NavigationMenuItemState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:type`, `prop:value`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `type`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4e617669676174696f6e4d656e752e4974656d2e5374617465"></a>

<a id="navigationmenuitemstate"></a>

### Related exported type: NavigationMenu.Item.State

Declaration: `packages/solid/build/types/navigation-menu/item/NavigationMenuItem.d.ts:9`

#### Declaration

```typescript
NavigationMenuItemState
```

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="trigger"></a>

### Trigger

<a id="api-4e617669676174696f6e4d656e752e54726967676572"></a>

<a id="navigationmenutrigger"></a>

<a id="api-4e617669676174696f6e4d656e752e547269676765722e2470726f70732e70726f703a64697361626c6564"></a>

<a id="api-4e617669676174696f6e4d656e752e547269676765722e2470726f70732e70726f703a666f726d416374696f6e"></a>

<a id="api-4e617669676174696f6e4d656e752e547269676765722e2470726f70732e70726f703a666f726d456e6374797065"></a>

<a id="api-4e617669676174696f6e4d656e752e547269676765722e2470726f70732e70726f703a666f726d4d6574686f64"></a>

<a id="api-4e617669676174696f6e4d656e752e547269676765722e2470726f70732e70726f703a666f726d4e6f56616c6964617465"></a>

<a id="api-4e617669676174696f6e4d656e752e547269676765722e2470726f70732e70726f703a666f726d546172676574"></a>

<a id="api-4e617669676174696f6e4d656e752e547269676765722e2470726f70732e70726f703a6e616d65"></a>

<a id="api-4e617669676174696f6e4d656e752e547269676765722e2470726f70732e70726f703a706f706f766572546172676574416374696f6e"></a>

<a id="api-4e617669676174696f6e4d656e752e547269676765722e2470726f70732e70726f703a706f706f766572546172676574456c656d656e74"></a>

<a id="api-4e617669676174696f6e4d656e752e547269676765722e2470726f70732e70726f703a74797065"></a>

<a id="api-4e617669676174696f6e4d656e752e547269676765722e2470726f70732e70726f703a76616c7565"></a>

### NavigationMenu.Trigger

Declaration: `packages/solid/build/types/navigation-menu/trigger/NavigationMenuTrigger.d.ts:3`

#### Declaration

```typescript
(props: NavigationMenuTrigger.Props) => JSX.Element
```

<a id="api-4e617669676174696f6e4d656e752e547269676765722e2470726f70732e6e6174697665427574746f6e"></a>

<a id="NavigationMenuTrigger-nativeButton"></a>

<a id="api-4e617669676174696f6e4d656e752e547269676765722e2470726f70732e64697361626c6564"></a>

<a id="NavigationMenuTrigger-disabled"></a>

<a id="api-4e617669676174696f6e4d656e752e547269676765722e2470726f70732e636c617373"></a>

<a id="NavigationMenuTrigger-class"></a>

<a id="api-4e617669676174696f6e4d656e752e547269676765722e2470726f70732e7374796c65"></a>

<a id="NavigationMenuTrigger-style"></a>

<a id="api-4e617669676174696f6e4d656e752e547269676765722e2470726f70732e72656e646572"></a>

<a id="NavigationMenuTrigger-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| nativeButton | `boolean \| undefined` | No | true | Whether the rendered host is a native button. Set false when supplying a non-button host through render. |
| disabled | `boolean \| undefined` | No | false |  |
| class | `JSX.ClassValue \| ((state: Readonly<NavigationMenuTriggerState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<NavigationMenuTriggerState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, NavigationMenuTriggerState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `command`, `commandfor`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `form`, `formaction`, `formenctype`, `formmethod`, `formnovalidate`, `formtarget`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `name`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `popovertarget`, `popovertargetaction`, `prefix`, `prop:disabled`, `prop:formAction`, `prop:formEnctype`, `prop:formMethod`, `prop:formNoValidate`, `prop:formTarget`, `prop:name`, `prop:popoverTargetAction`, `prop:popoverTargetElement`, `prop:type`, `prop:value`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `type`, `typeof`, `value`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-4e617669676174696f6e4d656e755472696767657244617461417474726962757465732e706f7075704f70656e"></a>

<a id="api-4e617669676174696f6e4d656e755472696767657244617461417474726962757465732e70726573736564"></a>

<a id="api-4e617669676174696f6e4d656e755472696767657244617461417474726962757465732e64697361626c6564"></a>

| Name | Description |
| --- | --- |
| data-popup-open |  |
| data-pressed |  |
| data-disabled |  |

#### CSS variables

Metadata status: unavailable.

<a id="api-4e617669676174696f6e4d656e752e547269676765722e50726f7073"></a>

<a id="navigationmenutriggerprops"></a>

<a id="api-4e617669676174696f6e4d656e752e547269676765722e50726f70732e70726f703a64697361626c6564"></a>

<a id="api-4e617669676174696f6e4d656e752e547269676765722e50726f70732e70726f703a666f726d416374696f6e"></a>

<a id="api-4e617669676174696f6e4d656e752e547269676765722e50726f70732e70726f703a666f726d456e6374797065"></a>

<a id="api-4e617669676174696f6e4d656e752e547269676765722e50726f70732e70726f703a666f726d4d6574686f64"></a>

<a id="api-4e617669676174696f6e4d656e752e547269676765722e50726f70732e70726f703a666f726d4e6f56616c6964617465"></a>

<a id="api-4e617669676174696f6e4d656e752e547269676765722e50726f70732e70726f703a666f726d546172676574"></a>

<a id="api-4e617669676174696f6e4d656e752e547269676765722e50726f70732e70726f703a6e616d65"></a>

<a id="api-4e617669676174696f6e4d656e752e547269676765722e50726f70732e70726f703a706f706f766572546172676574416374696f6e"></a>

<a id="api-4e617669676174696f6e4d656e752e547269676765722e50726f70732e70726f703a706f706f766572546172676574456c656d656e74"></a>

<a id="api-4e617669676174696f6e4d656e752e547269676765722e50726f70732e70726f703a74797065"></a>

<a id="api-4e617669676174696f6e4d656e752e547269676765722e50726f70732e70726f703a76616c7565"></a>

### Related exported type: NavigationMenu.Trigger.Props

Declaration: `packages/solid/build/types/navigation-menu/trigger/NavigationMenuTrigger.d.ts:13`

#### Declaration

```typescript
NavigationMenuTriggerProps
```

<a id="api-4e617669676174696f6e4d656e752e547269676765722e50726f70732e6e6174697665427574746f6e"></a>

<a id="NavigationMenuTriggerProps-nativeButton"></a>

<a id="api-4e617669676174696f6e4d656e752e547269676765722e50726f70732e64697361626c6564"></a>

<a id="NavigationMenuTriggerProps-disabled"></a>

<a id="api-4e617669676174696f6e4d656e752e547269676765722e50726f70732e636c617373"></a>

<a id="NavigationMenuTriggerProps-class"></a>

<a id="api-4e617669676174696f6e4d656e752e547269676765722e50726f70732e7374796c65"></a>

<a id="NavigationMenuTriggerProps-style"></a>

<a id="api-4e617669676174696f6e4d656e752e547269676765722e50726f70732e72656e646572"></a>

<a id="NavigationMenuTriggerProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| nativeButton | `boolean \| undefined` | No | Unavailable | Whether the rendered host is a native button. Set false when supplying a non-button host through render. |
| disabled | `boolean \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<NavigationMenuTriggerState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<NavigationMenuTriggerState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, NavigationMenuTriggerState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `command`, `commandfor`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `form`, `formaction`, `formenctype`, `formmethod`, `formnovalidate`, `formtarget`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `name`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `popovertarget`, `popovertargetaction`, `prefix`, `prop:disabled`, `prop:formAction`, `prop:formEnctype`, `prop:formMethod`, `prop:formNoValidate`, `prop:formTarget`, `prop:name`, `prop:popoverTargetAction`, `prop:popoverTargetElement`, `prop:type`, `prop:value`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `type`, `typeof`, `value`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4e617669676174696f6e4d656e752e547269676765722e5374617465"></a>

<a id="navigationmenutriggerstate"></a>

### Related exported type: NavigationMenu.Trigger.State

Declaration: `packages/solid/build/types/navigation-menu/trigger/NavigationMenuTrigger.d.ts:12`

#### Declaration

```typescript
NavigationMenuTriggerState
```

<a id="api-4e617669676174696f6e4d656e752e547269676765722e53746174652e6f70656e"></a>

<a id="NavigationMenuTriggerState-open"></a>

<a id="api-4e617669676174696f6e4d656e752e547269676765722e53746174652e64697361626c6564"></a>

<a id="NavigationMenuTriggerState-disabled"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| open | `boolean` | Yes | Unavailable |  |
| disabled | `boolean` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="icon"></a>

### Icon

<a id="api-4e617669676174696f6e4d656e752e49636f6e"></a>

<a id="navigationmenuicon"></a>

### NavigationMenu.Icon

Declaration: `packages/solid/build/types/navigation-menu/icon/NavigationMenuIcon.d.ts:2`

#### Declaration

```typescript
(props: NavigationMenuIcon.Props) => JSX.Element
```

<a id="api-4e617669676174696f6e4d656e752e49636f6e2e2470726f70732e636c617373"></a>

<a id="NavigationMenuIcon-class"></a>

<a id="api-4e617669676174696f6e4d656e752e49636f6e2e2470726f70732e7374796c65"></a>

<a id="NavigationMenuIcon-style"></a>

<a id="api-4e617669676174696f6e4d656e752e49636f6e2e2470726f70732e72656e646572"></a>

<a id="NavigationMenuIcon-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<NavigationMenuIconState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<NavigationMenuIconState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, NavigationMenuIconState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-4e617669676174696f6e4d656e7549636f6e44617461417474726962757465732e706f7075704f70656e"></a>

| Name | Description |
| --- | --- |
| data-popup-open | Present when open is true. |

#### CSS variables

Metadata status: unavailable.

<a id="api-4e617669676174696f6e4d656e752e49636f6e2e50726f7073"></a>

<a id="navigationmenuiconprops"></a>

### Related exported type: NavigationMenu.Icon.Props

Declaration: `packages/solid/build/types/navigation-menu/icon/NavigationMenuIcon.d.ts:10`

#### Declaration

```typescript
NavigationMenuIconProps
```

<a id="api-4e617669676174696f6e4d656e752e49636f6e2e50726f70732e636c617373"></a>

<a id="NavigationMenuIconProps-class"></a>

<a id="api-4e617669676174696f6e4d656e752e49636f6e2e50726f70732e7374796c65"></a>

<a id="NavigationMenuIconProps-style"></a>

<a id="api-4e617669676174696f6e4d656e752e49636f6e2e50726f70732e72656e646572"></a>

<a id="NavigationMenuIconProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<NavigationMenuIconState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<NavigationMenuIconState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, NavigationMenuIconState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4e617669676174696f6e4d656e752e49636f6e2e5374617465"></a>

<a id="navigationmenuiconstate"></a>

### Related exported type: NavigationMenu.Icon.State

Declaration: `packages/solid/build/types/navigation-menu/icon/NavigationMenuIcon.d.ts:9`

#### Declaration

```typescript
NavigationMenuIconState
```

<a id="api-4e617669676174696f6e4d656e752e49636f6e2e53746174652e6f70656e"></a>

<a id="NavigationMenuIconState-open"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| open | `boolean` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="content"></a>

### Content

<a id="api-4e617669676174696f6e4d656e752e436f6e74656e74"></a>

<a id="navigationmenucontent"></a>

<a id="api-4e617669676174696f6e4d656e752e436f6e74656e742e2470726f70732e70726f703a616c69676e"></a>

### NavigationMenu.Content

Declaration: `packages/solid/build/types/navigation-menu/content/NavigationMenuContent.d.ts:4`

#### Declaration

```typescript
(props: NavigationMenuContent.Props) => JSX.Element
```

<a id="api-4e617669676174696f6e4d656e752e436f6e74656e742e2470726f70732e636c617373"></a>

<a id="NavigationMenuContent-class"></a>

<a id="api-4e617669676174696f6e4d656e752e436f6e74656e742e2470726f70732e7374796c65"></a>

<a id="NavigationMenuContent-style"></a>

<a id="api-4e617669676174696f6e4d656e752e436f6e74656e742e2470726f70732e6b6565704d6f756e746564"></a>

<a id="NavigationMenuContent-keepMounted"></a>

<a id="api-4e617669676174696f6e4d656e752e436f6e74656e742e2470726f70732e72656e646572"></a>

<a id="NavigationMenuContent-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<NavigationMenuContentState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<NavigationMenuContentState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| keepMounted | `boolean \| undefined` | No | Unavailable |  |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, NavigationMenuContentState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-4e617669676174696f6e4d656e75436f6e74656e7444617461417474726962757465732e6f70656e"></a>

<a id="api-4e617669676174696f6e4d656e75436f6e74656e7444617461417474726962757465732e636c6f736564"></a>

<a id="api-4e617669676174696f6e4d656e75436f6e74656e7444617461417474726962757465732e61637469766174696f6e446972656374696f6e"></a>

<a id="api-4e617669676174696f6e4d656e75436f6e74656e7444617461417474726962757465732e7374617274696e675374796c65"></a>

<a id="api-4e617669676174696f6e4d656e75436f6e74656e7444617461417474726962757465732e656e64696e675374796c65"></a>

| Name | Description |
| --- | --- |
| data-open |  |
| data-closed |  |
| data-activation-direction |  |
| data-starting-style |  |
| data-ending-style |  |

#### CSS variables

Metadata status: unavailable.

<a id="api-4e617669676174696f6e4d656e752e436f6e74656e742e50726f7073"></a>

<a id="navigationmenucontentprops"></a>

<a id="api-4e617669676174696f6e4d656e752e436f6e74656e742e50726f70732e70726f703a616c69676e"></a>

### Related exported type: NavigationMenu.Content.Props

Declaration: `packages/solid/build/types/navigation-menu/content/NavigationMenuContent.d.ts:15`

#### Declaration

```typescript
NavigationMenuContentProps
```

<a id="api-4e617669676174696f6e4d656e752e436f6e74656e742e50726f70732e636c617373"></a>

<a id="NavigationMenuContentProps-class"></a>

<a id="api-4e617669676174696f6e4d656e752e436f6e74656e742e50726f70732e7374796c65"></a>

<a id="NavigationMenuContentProps-style"></a>

<a id="api-4e617669676174696f6e4d656e752e436f6e74656e742e50726f70732e6b6565704d6f756e746564"></a>

<a id="NavigationMenuContentProps-keepMounted"></a>

<a id="api-4e617669676174696f6e4d656e752e436f6e74656e742e50726f70732e72656e646572"></a>

<a id="NavigationMenuContentProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<NavigationMenuContentState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<NavigationMenuContentState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| keepMounted | `boolean \| undefined` | No | Unavailable |  |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, NavigationMenuContentState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4e617669676174696f6e4d656e752e436f6e74656e742e5374617465"></a>

<a id="navigationmenucontentstate"></a>

### Related exported type: NavigationMenu.Content.State

Declaration: `packages/solid/build/types/navigation-menu/content/NavigationMenuContent.d.ts:14`

#### Declaration

```typescript
NavigationMenuContentState
```

<a id="api-4e617669676174696f6e4d656e752e436f6e74656e742e53746174652e6f70656e"></a>

<a id="NavigationMenuContentState-open"></a>

<a id="api-4e617669676174696f6e4d656e752e436f6e74656e742e53746174652e61637469766174696f6e446972656374696f6e"></a>

<a id="NavigationMenuContentState-activationDirection"></a>

<a id="api-4e617669676174696f6e4d656e752e436f6e74656e742e53746174652e7472616e736974696f6e537461747573"></a>

<a id="NavigationMenuContentState-transitionStatus"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| open | `boolean` | Yes | Unavailable |  |
| activationDirection | `"left" \| "right" \| "up" \| "down" \| null` | Yes | Unavailable |  |
| transitionStatus | `TransitionStatus` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="link"></a>

### Link

<a id="api-4e617669676174696f6e4d656e752e4c696e6b"></a>

<a id="navigationmenulink"></a>

<a id="api-4e617669676174696f6e4d656e752e4c696e6b2e2470726f70732e70726f703a63686172736574"></a>

<a id="api-4e617669676174696f6e4d656e752e4c696e6b2e2470726f70732e70726f703a636f6f726473"></a>

<a id="api-4e617669676174696f6e4d656e752e4c696e6b2e2470726f70732e70726f703a646f776e6c6f6164"></a>

<a id="api-4e617669676174696f6e4d656e752e4c696e6b2e2470726f70732e70726f703a68617368"></a>

<a id="api-4e617669676174696f6e4d656e752e4c696e6b2e2470726f70732e70726f703a686f7374"></a>

<a id="api-4e617669676174696f6e4d656e752e4c696e6b2e2470726f70732e70726f703a686f73746e616d65"></a>

<a id="api-4e617669676174696f6e4d656e752e4c696e6b2e2470726f70732e70726f703a68726566"></a>

<a id="api-4e617669676174696f6e4d656e752e4c696e6b2e2470726f70732e70726f703a687265666c616e67"></a>

<a id="api-4e617669676174696f6e4d656e752e4c696e6b2e2470726f70732e70726f703a6e616d65"></a>

<a id="api-4e617669676174696f6e4d656e752e4c696e6b2e2470726f70732e70726f703a70617373776f7264"></a>

<a id="api-4e617669676174696f6e4d656e752e4c696e6b2e2470726f70732e70726f703a706174686e616d65"></a>

<a id="api-4e617669676174696f6e4d656e752e4c696e6b2e2470726f70732e70726f703a70696e67"></a>

<a id="api-4e617669676174696f6e4d656e752e4c696e6b2e2470726f70732e70726f703a706f7274"></a>

<a id="api-4e617669676174696f6e4d656e752e4c696e6b2e2470726f70732e70726f703a70726f746f636f6c"></a>

<a id="api-4e617669676174696f6e4d656e752e4c696e6b2e2470726f70732e70726f703a7265666572726572506f6c696379"></a>

<a id="api-4e617669676174696f6e4d656e752e4c696e6b2e2470726f70732e70726f703a72656c"></a>

<a id="api-4e617669676174696f6e4d656e752e4c696e6b2e2470726f70732e70726f703a726576"></a>

<a id="api-4e617669676174696f6e4d656e752e4c696e6b2e2470726f70732e70726f703a736561726368"></a>

<a id="api-4e617669676174696f6e4d656e752e4c696e6b2e2470726f70732e70726f703a7368617065"></a>

<a id="api-4e617669676174696f6e4d656e752e4c696e6b2e2470726f70732e70726f703a746172676574"></a>

<a id="api-4e617669676174696f6e4d656e752e4c696e6b2e2470726f70732e70726f703a74657874"></a>

<a id="api-4e617669676174696f6e4d656e752e4c696e6b2e2470726f70732e70726f703a74797065"></a>

<a id="api-4e617669676174696f6e4d656e752e4c696e6b2e2470726f70732e70726f703a757365726e616d65"></a>

### NavigationMenu.Link

Declaration: `packages/solid/build/types/navigation-menu/link/NavigationMenuLink.d.ts:3`

#### Declaration

```typescript
(props: NavigationMenuLink.Props) => JSX.Element
```

<a id="api-4e617669676174696f6e4d656e752e4c696e6b2e2470726f70732e636c6f73654f6e436c69636b"></a>

<a id="NavigationMenuLink-closeOnClick"></a>

<a id="api-4e617669676174696f6e4d656e752e4c696e6b2e2470726f70732e616374697665"></a>

<a id="NavigationMenuLink-active"></a>

<a id="api-4e617669676174696f6e4d656e752e4c696e6b2e2470726f70732e636c617373"></a>

<a id="NavigationMenuLink-class"></a>

<a id="api-4e617669676174696f6e4d656e752e4c696e6b2e2470726f70732e7374796c65"></a>

<a id="NavigationMenuLink-style"></a>

<a id="api-4e617669676174696f6e4d656e752e4c696e6b2e2470726f70732e72656e646572"></a>

<a id="NavigationMenuLink-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| closeOnClick | `boolean \| undefined` | No | Unavailable |  |
| active | `boolean \| undefined` | No | false |  |
| class | `JSX.ClassValue \| ((state: Readonly<NavigationMenuLinkState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<NavigationMenuLinkState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<JSX.AnchorHTMLAttributes<HTMLAnchorElement> & JSX.Properties<HTMLAnchorElement>, NavigationMenuLinkState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `attributionsrc`, `autocapitalize`, `autocorrect`, `autofocus`, `charset`, `children`, `contenteditable`, `contextmenu`, `coords`, `datatype`, `dir`, `download`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `href`, `hreflang`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `link`, `name`, `nonce`, `noscroll`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `ping`, `popover`, `prefix`, `preload`, `prop:charset`, `prop:coords`, `prop:download`, `prop:hash`, `prop:host`, `prop:hostname`, `prop:href`, `prop:hreflang`, `prop:name`, `prop:password`, `prop:pathname`, `prop:ping`, `prop:port`, `prop:protocol`, `prop:referrerPolicy`, `prop:rel`, `prop:rev`, `prop:search`, `prop:shape`, `prop:target`, `prop:text`, `prop:type`, `prop:username`, `property`, `ref`, `referrerpolicy`, `rel`, `replace`, `resource`, `rev`, `role`, `shape`, `slot`, `spellcheck`, `state`, `tabindex`, `target`, `textContent`, `title`, `translate`, `type`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`, `xmlns`

#### Data attributes

<a id="api-4e617669676174696f6e4d656e754c696e6b44617461417474726962757465732e616374697665"></a>

| Name | Description |
| --- | --- |
| data-active |  |

#### CSS variables

Metadata status: unavailable.

<a id="api-4e617669676174696f6e4d656e752e4c696e6b2e50726f7073"></a>

<a id="navigationmenulinkprops"></a>

<a id="api-4e617669676174696f6e4d656e752e4c696e6b2e50726f70732e70726f703a63686172736574"></a>

<a id="api-4e617669676174696f6e4d656e752e4c696e6b2e50726f70732e70726f703a636f6f726473"></a>

<a id="api-4e617669676174696f6e4d656e752e4c696e6b2e50726f70732e70726f703a646f776e6c6f6164"></a>

<a id="api-4e617669676174696f6e4d656e752e4c696e6b2e50726f70732e70726f703a68617368"></a>

<a id="api-4e617669676174696f6e4d656e752e4c696e6b2e50726f70732e70726f703a686f7374"></a>

<a id="api-4e617669676174696f6e4d656e752e4c696e6b2e50726f70732e70726f703a686f73746e616d65"></a>

<a id="api-4e617669676174696f6e4d656e752e4c696e6b2e50726f70732e70726f703a68726566"></a>

<a id="api-4e617669676174696f6e4d656e752e4c696e6b2e50726f70732e70726f703a687265666c616e67"></a>

<a id="api-4e617669676174696f6e4d656e752e4c696e6b2e50726f70732e70726f703a6e616d65"></a>

<a id="api-4e617669676174696f6e4d656e752e4c696e6b2e50726f70732e70726f703a70617373776f7264"></a>

<a id="api-4e617669676174696f6e4d656e752e4c696e6b2e50726f70732e70726f703a706174686e616d65"></a>

<a id="api-4e617669676174696f6e4d656e752e4c696e6b2e50726f70732e70726f703a70696e67"></a>

<a id="api-4e617669676174696f6e4d656e752e4c696e6b2e50726f70732e70726f703a706f7274"></a>

<a id="api-4e617669676174696f6e4d656e752e4c696e6b2e50726f70732e70726f703a70726f746f636f6c"></a>

<a id="api-4e617669676174696f6e4d656e752e4c696e6b2e50726f70732e70726f703a7265666572726572506f6c696379"></a>

<a id="api-4e617669676174696f6e4d656e752e4c696e6b2e50726f70732e70726f703a72656c"></a>

<a id="api-4e617669676174696f6e4d656e752e4c696e6b2e50726f70732e70726f703a726576"></a>

<a id="api-4e617669676174696f6e4d656e752e4c696e6b2e50726f70732e70726f703a736561726368"></a>

<a id="api-4e617669676174696f6e4d656e752e4c696e6b2e50726f70732e70726f703a7368617065"></a>

<a id="api-4e617669676174696f6e4d656e752e4c696e6b2e50726f70732e70726f703a746172676574"></a>

<a id="api-4e617669676174696f6e4d656e752e4c696e6b2e50726f70732e70726f703a74657874"></a>

<a id="api-4e617669676174696f6e4d656e752e4c696e6b2e50726f70732e70726f703a74797065"></a>

<a id="api-4e617669676174696f6e4d656e752e4c696e6b2e50726f70732e70726f703a757365726e616d65"></a>

### Related exported type: NavigationMenu.Link.Props

Declaration: `packages/solid/build/types/navigation-menu/link/NavigationMenuLink.d.ts:13`

#### Declaration

```typescript
NavigationMenuLinkProps
```

<a id="api-4e617669676174696f6e4d656e752e4c696e6b2e50726f70732e636c6f73654f6e436c69636b"></a>

<a id="NavigationMenuLinkProps-closeOnClick"></a>

<a id="api-4e617669676174696f6e4d656e752e4c696e6b2e50726f70732e616374697665"></a>

<a id="NavigationMenuLinkProps-active"></a>

<a id="api-4e617669676174696f6e4d656e752e4c696e6b2e50726f70732e636c617373"></a>

<a id="NavigationMenuLinkProps-class"></a>

<a id="api-4e617669676174696f6e4d656e752e4c696e6b2e50726f70732e7374796c65"></a>

<a id="NavigationMenuLinkProps-style"></a>

<a id="api-4e617669676174696f6e4d656e752e4c696e6b2e50726f70732e72656e646572"></a>

<a id="NavigationMenuLinkProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| closeOnClick | `boolean \| undefined` | No | Unavailable |  |
| active | `boolean \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<NavigationMenuLinkState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<NavigationMenuLinkState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<JSX.AnchorHTMLAttributes<HTMLAnchorElement> & JSX.Properties<HTMLAnchorElement>, NavigationMenuLinkState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `attributionsrc`, `autocapitalize`, `autocorrect`, `autofocus`, `charset`, `children`, `contenteditable`, `contextmenu`, `coords`, `datatype`, `dir`, `download`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `href`, `hreflang`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `link`, `name`, `nonce`, `noscroll`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `ping`, `popover`, `prefix`, `preload`, `prop:charset`, `prop:coords`, `prop:download`, `prop:hash`, `prop:host`, `prop:hostname`, `prop:href`, `prop:hreflang`, `prop:name`, `prop:password`, `prop:pathname`, `prop:ping`, `prop:port`, `prop:protocol`, `prop:referrerPolicy`, `prop:rel`, `prop:rev`, `prop:search`, `prop:shape`, `prop:target`, `prop:text`, `prop:type`, `prop:username`, `property`, `ref`, `referrerpolicy`, `rel`, `replace`, `resource`, `rev`, `role`, `shape`, `slot`, `spellcheck`, `state`, `tabindex`, `target`, `textContent`, `title`, `translate`, `type`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`, `xmlns`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4e617669676174696f6e4d656e752e4c696e6b2e5374617465"></a>

<a id="navigationmenulinkstate"></a>

### Related exported type: NavigationMenu.Link.State

Declaration: `packages/solid/build/types/navigation-menu/link/NavigationMenuLink.d.ts:12`

#### Declaration

```typescript
NavigationMenuLinkState
```

<a id="api-4e617669676174696f6e4d656e752e4c696e6b2e53746174652e616374697665"></a>

<a id="NavigationMenuLinkState-active"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| active | `boolean` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="backdrop"></a>

### Backdrop

<a id="api-4e617669676174696f6e4d656e752e4261636b64726f70"></a>

<a id="navigationmenubackdrop"></a>

<a id="api-4e617669676174696f6e4d656e752e4261636b64726f702e2470726f70732e70726f703a616c69676e"></a>

### NavigationMenu.Backdrop

Declaration: `packages/solid/build/types/navigation-menu/backdrop/NavigationMenuBackdrop.d.ts:3`

#### Declaration

```typescript
(props: NavigationMenuBackdrop.Props) => JSX.Element
```

<a id="api-4e617669676174696f6e4d656e752e4261636b64726f702e2470726f70732e636c617373"></a>

<a id="NavigationMenuBackdrop-class"></a>

<a id="api-4e617669676174696f6e4d656e752e4261636b64726f702e2470726f70732e7374796c65"></a>

<a id="NavigationMenuBackdrop-style"></a>

<a id="api-4e617669676174696f6e4d656e752e4261636b64726f702e2470726f70732e72656e646572"></a>

<a id="NavigationMenuBackdrop-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<NavigationMenuBackdropState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<NavigationMenuBackdropState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, NavigationMenuBackdropState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-4e617669676174696f6e4d656e754261636b64726f7044617461417474726962757465732e6f70656e"></a>

<a id="api-4e617669676174696f6e4d656e754261636b64726f7044617461417474726962757465732e636c6f736564"></a>

<a id="api-4e617669676174696f6e4d656e752e4261636b64726f702e64617461417474726962757465732e646174612d616e63686f722d68696464656e"></a>

<a id="api-4e617669676174696f6e4d656e754261636b64726f7044617461417474726962757465732e7374617274696e675374796c65"></a>

<a id="api-4e617669676174696f6e4d656e754261636b64726f7044617461417474726962757465732e656e64696e675374796c65"></a>

| Name | Description |
| --- | --- |
| data-open | Present when open is true. |
| data-closed | Present when open is false. |
| data-anchor-hidden | Present when anchorHidden is true. |
| data-starting-style | Present when transitionStatus is 'starting'. |
| data-ending-style | Present when transitionStatus is 'ending'. |

#### CSS variables

Metadata status: unavailable.

<a id="api-4e617669676174696f6e4d656e752e4261636b64726f702e50726f7073"></a>

<a id="navigationmenubackdropprops"></a>

<a id="api-4e617669676174696f6e4d656e752e4261636b64726f702e50726f70732e70726f703a616c69676e"></a>

### Related exported type: NavigationMenu.Backdrop.Props

Declaration: `packages/solid/build/types/navigation-menu/backdrop/NavigationMenuBackdrop.d.ts:12`

#### Declaration

```typescript
NavigationMenuBackdropProps
```

<a id="api-4e617669676174696f6e4d656e752e4261636b64726f702e50726f70732e636c617373"></a>

<a id="NavigationMenuBackdropProps-class"></a>

<a id="api-4e617669676174696f6e4d656e752e4261636b64726f702e50726f70732e7374796c65"></a>

<a id="NavigationMenuBackdropProps-style"></a>

<a id="api-4e617669676174696f6e4d656e752e4261636b64726f702e50726f70732e72656e646572"></a>

<a id="NavigationMenuBackdropProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<NavigationMenuBackdropState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<NavigationMenuBackdropState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, NavigationMenuBackdropState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4e617669676174696f6e4d656e752e4261636b64726f702e5374617465"></a>

<a id="navigationmenubackdropstate"></a>

### Related exported type: NavigationMenu.Backdrop.State

Declaration: `packages/solid/build/types/navigation-menu/backdrop/NavigationMenuBackdrop.d.ts:11`

#### Declaration

```typescript
NavigationMenuBackdropState
```

<a id="api-4e617669676174696f6e4d656e752e4261636b64726f702e53746174652e6f70656e"></a>

<a id="NavigationMenuBackdropState-open"></a>

<a id="api-4e617669676174696f6e4d656e752e4261636b64726f702e53746174652e7472616e736974696f6e537461747573"></a>

<a id="NavigationMenuBackdropState-transitionStatus"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| open | `boolean` | Yes | Unavailable |  |
| transitionStatus | `TransitionStatus` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="portal"></a>

### Portal

<a id="api-4e617669676174696f6e4d656e752e506f7274616c"></a>

<a id="navigationmenuportal"></a>

<a id="api-4e617669676174696f6e4d656e752e506f7274616c2e2470726f70732e70726f703a616c69676e"></a>

### NavigationMenu.Portal

Declaration: `packages/solid/build/types/navigation-menu/portal/NavigationMenuPortal.d.ts:3`

#### Declaration

```typescript
(props: NavigationMenuPortal.Props) => JSX.Element
```

<a id="api-4e617669676174696f6e4d656e752e506f7274616c2e2470726f70732e636f6e7461696e6572"></a>

<a id="NavigationMenuPortal-container"></a>

<a id="api-4e617669676174696f6e4d656e752e506f7274616c2e2470726f70732e636c617373"></a>

<a id="NavigationMenuPortal-class"></a>

<a id="api-4e617669676174696f6e4d656e752e506f7274616c2e2470726f70732e7374796c65"></a>

<a id="NavigationMenuPortal-style"></a>

<a id="api-4e617669676174696f6e4d656e752e506f7274616c2e2470726f70732e6b6565704d6f756e746564"></a>

<a id="NavigationMenuPortal-keepMounted"></a>

<a id="api-4e617669676174696f6e4d656e752e506f7274616c2e2470726f70732e72656e646572"></a>

<a id="NavigationMenuPortal-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| container | `PortalContainer` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<NavigationMenuPortalState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<NavigationMenuPortalState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| keepMounted | `boolean \| undefined` | No | false |  |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, NavigationMenuPortalState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4e617669676174696f6e4d656e752e506f7274616c2e50726f7073"></a>

<a id="navigationmenuportalprops"></a>

<a id="api-4e617669676174696f6e4d656e752e506f7274616c2e50726f70732e70726f703a616c69676e"></a>

### Related exported type: NavigationMenu.Portal.Props

Declaration: `packages/solid/build/types/navigation-menu/portal/NavigationMenuPortal.d.ts:12`

#### Declaration

```typescript
NavigationMenuPortalProps
```

<a id="api-4e617669676174696f6e4d656e752e506f7274616c2e50726f70732e636f6e7461696e6572"></a>

<a id="NavigationMenuPortalProps-container"></a>

<a id="api-4e617669676174696f6e4d656e752e506f7274616c2e50726f70732e636c617373"></a>

<a id="NavigationMenuPortalProps-class"></a>

<a id="api-4e617669676174696f6e4d656e752e506f7274616c2e50726f70732e7374796c65"></a>

<a id="NavigationMenuPortalProps-style"></a>

<a id="api-4e617669676174696f6e4d656e752e506f7274616c2e50726f70732e6b6565704d6f756e746564"></a>

<a id="NavigationMenuPortalProps-keepMounted"></a>

<a id="api-4e617669676174696f6e4d656e752e506f7274616c2e50726f70732e72656e646572"></a>

<a id="NavigationMenuPortalProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| container | `PortalContainer` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<NavigationMenuPortalState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<NavigationMenuPortalState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| keepMounted | `boolean \| undefined` | No | Unavailable |  |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, NavigationMenuPortalState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4e617669676174696f6e4d656e752e506f7274616c2e5374617465"></a>

<a id="navigationmenuportalstate"></a>

### Related exported type: NavigationMenu.Portal.State

Declaration: `packages/solid/build/types/navigation-menu/portal/NavigationMenuPortal.d.ts:11`

#### Declaration

```typescript
NavigationMenuPortalState
```

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="positioner"></a>

### Positioner

<a id="api-4e617669676174696f6e4d656e752e506f736974696f6e6572"></a>

<a id="navigationmenupositioner"></a>

<a id="api-4e617669676174696f6e4d656e752e506f736974696f6e65722e2470726f70732e70726f703a616c69676e"></a>

### NavigationMenu.Positioner

Declaration: `packages/solid/build/types/navigation-menu/positioner/NavigationMenuPositioner.d.ts:3`

#### Declaration

```typescript
(props: NavigationMenuPositioner.Props) => JSX.Element
```

<a id="api-4e617669676174696f6e4d656e752e506f736974696f6e65722e2470726f70732e64697361626c65416e63686f72547261636b696e67"></a>

<a id="NavigationMenuPositioner-disableAnchorTracking"></a>

<a id="api-4e617669676174696f6e4d656e752e506f736974696f6e65722e2470726f70732e616c69676e"></a>

<a id="NavigationMenuPositioner-align"></a>

<a id="api-4e617669676174696f6e4d656e752e506f736974696f6e65722e2470726f70732e616c69676e4f6666736574"></a>

<a id="NavigationMenuPositioner-alignOffset"></a>

<a id="api-4e617669676174696f6e4d656e752e506f736974696f6e65722e2470726f70732e73696465"></a>

<a id="NavigationMenuPositioner-side"></a>

<a id="api-4e617669676174696f6e4d656e752e506f736974696f6e65722e2470726f70732e736964654f6666736574"></a>

<a id="NavigationMenuPositioner-sideOffset"></a>

<a id="api-4e617669676174696f6e4d656e752e506f736974696f6e65722e2470726f70732e6172726f7750616464696e67"></a>

<a id="NavigationMenuPositioner-arrowPadding"></a>

<a id="api-4e617669676174696f6e4d656e752e506f736974696f6e65722e2470726f70732e616e63686f72"></a>

<a id="NavigationMenuPositioner-anchor"></a>

<a id="api-4e617669676174696f6e4d656e752e506f736974696f6e65722e2470726f70732e636f6c6c6973696f6e41766f6964616e6365"></a>

<a id="NavigationMenuPositioner-collisionAvoidance"></a>

<a id="api-4e617669676174696f6e4d656e752e506f736974696f6e65722e2470726f70732e636f6c6c6973696f6e426f756e64617279"></a>

<a id="NavigationMenuPositioner-collisionBoundary"></a>

<a id="api-4e617669676174696f6e4d656e752e506f736974696f6e65722e2470726f70732e636f6c6c6973696f6e50616464696e67"></a>

<a id="NavigationMenuPositioner-collisionPadding"></a>

<a id="api-4e617669676174696f6e4d656e752e506f736974696f6e65722e2470726f70732e737469636b79"></a>

<a id="NavigationMenuPositioner-sticky"></a>

<a id="api-4e617669676174696f6e4d656e752e506f736974696f6e65722e2470726f70732e706f736974696f6e4d6574686f64"></a>

<a id="NavigationMenuPositioner-positionMethod"></a>

<a id="api-4e617669676174696f6e4d656e752e506f736974696f6e65722e2470726f70732e636c617373"></a>

<a id="NavigationMenuPositioner-class"></a>

<a id="api-4e617669676174696f6e4d656e752e506f736974696f6e65722e2470726f70732e7374796c65"></a>

<a id="NavigationMenuPositioner-style"></a>

<a id="api-4e617669676174696f6e4d656e752e506f736974696f6e65722e2470726f70732e72656e646572"></a>

<a id="NavigationMenuPositioner-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| disableAnchorTracking | `boolean \| undefined` | No | false | Disables ancestor-scroll, element-resize and layout-shift observation used for automatic positioning updates. |
| align | `Align \| undefined` | No | 'center' | Preferred alignment along the anchor’s side. Collision handling can change the resolved alignment. |
| alignOffset | `number \| OffsetFunction \| undefined` | No | 0 | Offset along the alignment axis, in pixels. A callback receives anchor and positioner dimensions plus the side and alignment. |
| side | `Side \| undefined` | No | 'bottom' | Preferred side of the anchor. Logical inline sides follow the text direction; collision handling can change the resolved side. |
| sideOffset | `number \| OffsetFunction \| undefined` | No | 0 | Distance from the anchor along the side axis, in pixels. A callback receives anchor and positioner dimensions plus the side and alignment. |
| arrowPadding | `number \| undefined` | No | 5 | Minimum padding in pixels between the arrow and the floating element’s edges. |
| anchor | `ReferenceType \| (() => ReferenceType \| null) \| null \| undefined` | No | Unavailable | Positioning reference: an element or virtual reference, or an accessor returning one. A nullish reference falls back to the root’s reference. |
| collisionAvoidance | `{ side?: "flip" \| "shift" \| "none"; align?: "flip" \| "shift" \| "none"; fallbackAxisSide?: "start" \| "end" \| "none"; } \| undefined` | No | Unavailable | Controls flipping or shifting along the side and alignment axes, including fallback placement on the perpendicular axis. |
| collisionBoundary | `Boundary \| "clipping-ancestors" \| undefined` | No | 'clipping-ancestors' | Boundary used to detect overflow. The clipping-ancestors value uses clipping ancestors as the overflow boundary. |
| collisionPadding | `Padding \| undefined` | No | 5 | Space in pixels reserved inside the collision boundary, either for all edges or per edge. |
| sticky | `boolean \| undefined` | No | false | Allows shifting along the side axis without the usual limitShift limiter. |
| positionMethod | `"fixed" \| "absolute" \| undefined` | No | 'absolute' | CSS positioning strategy used by the floating element: absolute or fixed. |
| class | `JSX.ClassValue \| ((state: Readonly<NavigationMenuPositionerState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<NavigationMenuPositionerState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, NavigationMenuPositionerState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-4e617669676174696f6e4d656e75506f736974696f6e657244617461417474726962757465732e6f70656e"></a>

<a id="api-4e617669676174696f6e4d656e75506f736974696f6e657244617461417474726962757465732e636c6f736564"></a>

<a id="api-4e617669676174696f6e4d656e75506f736974696f6e657244617461417474726962757465732e616e63686f7248696464656e"></a>

<a id="api-4e617669676174696f6e4d656e75506f736974696f6e657244617461417474726962757465732e616c69676e"></a>

<a id="api-4e617669676174696f6e4d656e75506f736974696f6e657244617461417474726962757465732e696e7374616e74"></a>

<a id="api-4e617669676174696f6e4d656e75506f736974696f6e657244617461417474726962757465732e73696465"></a>

| Name | Description |
| --- | --- |
| data-open |  |
| data-closed |  |
| data-anchor-hidden |  |
| data-align |  |
| data-instant |  |
| data-side |  |

#### CSS variables

<a id="api-4e617669676174696f6e4d656e75506f736974696f6e65724373735661726961626c65732e616e63686f72486569676874"></a>

<a id="api-4e617669676174696f6e4d656e75506f736974696f6e65724373735661726961626c65732e616e63686f725769647468"></a>

<a id="api-4e617669676174696f6e4d656e75506f736974696f6e65724373735661726961626c65732e617661696c61626c65486569676874"></a>

<a id="api-4e617669676174696f6e4d656e75506f736974696f6e65724373735661726961626c65732e617661696c61626c655769647468"></a>

<a id="api-4e617669676174696f6e4d656e75506f736974696f6e65724373735661726961626c65732e706f736974696f6e6572486569676874"></a>

<a id="api-4e617669676174696f6e4d656e75506f736974696f6e65724373735661726961626c65732e706f736974696f6e65725769647468"></a>

<a id="api-4e617669676174696f6e4d656e75506f736974696f6e65724373735661726961626c65732e7472616e73666f726d4f726967696e"></a>

| Name | Description |
| --- | --- |
| --anchor-height |  |
| --anchor-width |  |
| --available-height |  |
| --available-width |  |
| --positioner-height |  |
| --positioner-width |  |
| --transform-origin |  |

<a id="api-4e617669676174696f6e4d656e752e506f736974696f6e65722e50726f7073"></a>

<a id="navigationmenupositionerprops"></a>

<a id="api-4e617669676174696f6e4d656e752e506f736974696f6e65722e50726f70732e70726f703a616c69676e"></a>

### Related exported type: NavigationMenu.Positioner.Props

Declaration: `packages/solid/build/types/navigation-menu/positioner/NavigationMenuPositioner.d.ts:15`

#### Declaration

```typescript
NavigationMenuPositionerProps
```

<a id="api-4e617669676174696f6e4d656e752e506f736974696f6e65722e50726f70732e64697361626c65416e63686f72547261636b696e67"></a>

<a id="NavigationMenuPositionerProps-disableAnchorTracking"></a>

<a id="api-4e617669676174696f6e4d656e752e506f736974696f6e65722e50726f70732e616c69676e"></a>

<a id="NavigationMenuPositionerProps-align"></a>

<a id="api-4e617669676174696f6e4d656e752e506f736974696f6e65722e50726f70732e616c69676e4f6666736574"></a>

<a id="NavigationMenuPositionerProps-alignOffset"></a>

<a id="api-4e617669676174696f6e4d656e752e506f736974696f6e65722e50726f70732e73696465"></a>

<a id="NavigationMenuPositionerProps-side"></a>

<a id="api-4e617669676174696f6e4d656e752e506f736974696f6e65722e50726f70732e736964654f6666736574"></a>

<a id="NavigationMenuPositionerProps-sideOffset"></a>

<a id="api-4e617669676174696f6e4d656e752e506f736974696f6e65722e50726f70732e6172726f7750616464696e67"></a>

<a id="NavigationMenuPositionerProps-arrowPadding"></a>

<a id="api-4e617669676174696f6e4d656e752e506f736974696f6e65722e50726f70732e616e63686f72"></a>

<a id="NavigationMenuPositionerProps-anchor"></a>

<a id="api-4e617669676174696f6e4d656e752e506f736974696f6e65722e50726f70732e636f6c6c6973696f6e41766f6964616e6365"></a>

<a id="NavigationMenuPositionerProps-collisionAvoidance"></a>

<a id="api-4e617669676174696f6e4d656e752e506f736974696f6e65722e50726f70732e636f6c6c6973696f6e426f756e64617279"></a>

<a id="NavigationMenuPositionerProps-collisionBoundary"></a>

<a id="api-4e617669676174696f6e4d656e752e506f736974696f6e65722e50726f70732e636f6c6c6973696f6e50616464696e67"></a>

<a id="NavigationMenuPositionerProps-collisionPadding"></a>

<a id="api-4e617669676174696f6e4d656e752e506f736974696f6e65722e50726f70732e737469636b79"></a>

<a id="NavigationMenuPositionerProps-sticky"></a>

<a id="api-4e617669676174696f6e4d656e752e506f736974696f6e65722e50726f70732e706f736974696f6e4d6574686f64"></a>

<a id="NavigationMenuPositionerProps-positionMethod"></a>

<a id="api-4e617669676174696f6e4d656e752e506f736974696f6e65722e50726f70732e636c617373"></a>

<a id="NavigationMenuPositionerProps-class"></a>

<a id="api-4e617669676174696f6e4d656e752e506f736974696f6e65722e50726f70732e7374796c65"></a>

<a id="NavigationMenuPositionerProps-style"></a>

<a id="api-4e617669676174696f6e4d656e752e506f736974696f6e65722e50726f70732e72656e646572"></a>

<a id="NavigationMenuPositionerProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
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
| class | `JSX.ClassValue \| ((state: Readonly<NavigationMenuPositionerState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<NavigationMenuPositionerState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, NavigationMenuPositionerState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4e617669676174696f6e4d656e752e506f736974696f6e65722e5374617465"></a>

<a id="navigationmenupositionerstate"></a>

### Related exported type: NavigationMenu.Positioner.State

Declaration: `packages/solid/build/types/navigation-menu/positioner/NavigationMenuPositioner.d.ts:14`

#### Declaration

```typescript
NavigationMenuPositionerState
```

<a id="api-4e617669676174696f6e4d656e752e506f736974696f6e65722e53746174652e6f70656e"></a>

<a id="NavigationMenuPositionerState-open"></a>

<a id="api-4e617669676174696f6e4d656e752e506f736974696f6e65722e53746174652e616e63686f7248696464656e"></a>

<a id="NavigationMenuPositionerState-anchorHidden"></a>

<a id="api-4e617669676174696f6e4d656e752e506f736974696f6e65722e53746174652e696e7374616e74"></a>

<a id="NavigationMenuPositionerState-instant"></a>

<a id="api-4e617669676174696f6e4d656e752e506f736974696f6e65722e53746174652e616c69676e"></a>

<a id="NavigationMenuPositionerState-align"></a>

<a id="api-4e617669676174696f6e4d656e752e506f736974696f6e65722e53746174652e73696465"></a>

<a id="NavigationMenuPositionerState-side"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| open | `boolean` | Yes | Unavailable |  |
| anchorHidden | `boolean` | Yes | Unavailable |  |
| instant | `boolean` | Yes | Unavailable |  |
| align | `Align` | Yes | Unavailable |  |
| side | `Side` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="popup"></a>

### Popup

<a id="api-4e617669676174696f6e4d656e752e506f707570"></a>

<a id="navigationmenupopup"></a>

### NavigationMenu.Popup

Declaration: `packages/solid/build/types/navigation-menu/popup/NavigationMenuPopup.d.ts:4`

#### Declaration

```typescript
(props: NavigationMenuPopup.Props) => JSX.Element
```

<a id="api-4e617669676174696f6e4d656e752e506f7075702e2470726f70732e636c617373"></a>

<a id="NavigationMenuPopup-class"></a>

<a id="api-4e617669676174696f6e4d656e752e506f7075702e2470726f70732e7374796c65"></a>

<a id="NavigationMenuPopup-style"></a>

<a id="api-4e617669676174696f6e4d656e752e506f7075702e2470726f70732e72656e646572"></a>

<a id="NavigationMenuPopup-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<NavigationMenuPopupState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<NavigationMenuPopupState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, NavigationMenuPopupState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-4e617669676174696f6e4d656e75506f70757044617461417474726962757465732e6f70656e"></a>

<a id="api-4e617669676174696f6e4d656e75506f70757044617461417474726962757465732e636c6f736564"></a>

<a id="api-4e617669676174696f6e4d656e75506f70757044617461417474726962757465732e616e63686f7248696464656e"></a>

<a id="api-4e617669676174696f6e4d656e75506f70757044617461417474726962757465732e616c69676e"></a>

<a id="api-4e617669676174696f6e4d656e75506f70757044617461417474726962757465732e73696465"></a>

<a id="api-4e617669676174696f6e4d656e75506f70757044617461417474726962757465732e7374617274696e675374796c65"></a>

<a id="api-4e617669676174696f6e4d656e75506f70757044617461417474726962757465732e656e64696e675374796c65"></a>

| Name | Description |
| --- | --- |
| data-open | Present when open is true. |
| data-closed | Present when open is false. |
| data-anchor-hidden | Present when anchorHidden is true. |
| data-align |  |
| data-side |  |
| data-starting-style | Present when transitionStatus is 'starting'. |
| data-ending-style | Present when transitionStatus is 'ending'. |

#### CSS variables

<a id="api-4e617669676174696f6e4d656e75506f7075704373735661726961626c65732e706f707570486569676874"></a>

<a id="api-4e617669676174696f6e4d656e75506f7075704373735661726961626c65732e706f7075705769647468"></a>

| Name | Description |
| --- | --- |
| --popup-height |  |
| --popup-width |  |

<a id="api-4e617669676174696f6e4d656e752e506f7075702e50726f7073"></a>

<a id="navigationmenupopupprops"></a>

### Related exported type: NavigationMenu.Popup.Props

Declaration: `packages/solid/build/types/navigation-menu/popup/NavigationMenuPopup.d.ts:16`

#### Declaration

```typescript
NavigationMenuPopupProps
```

<a id="api-4e617669676174696f6e4d656e752e506f7075702e50726f70732e636c617373"></a>

<a id="NavigationMenuPopupProps-class"></a>

<a id="api-4e617669676174696f6e4d656e752e506f7075702e50726f70732e7374796c65"></a>

<a id="NavigationMenuPopupProps-style"></a>

<a id="api-4e617669676174696f6e4d656e752e506f7075702e50726f70732e72656e646572"></a>

<a id="NavigationMenuPopupProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<NavigationMenuPopupState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<NavigationMenuPopupState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, NavigationMenuPopupState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4e617669676174696f6e4d656e752e506f7075702e5374617465"></a>

<a id="navigationmenupopupstate"></a>

### Related exported type: NavigationMenu.Popup.State

Declaration: `packages/solid/build/types/navigation-menu/popup/NavigationMenuPopup.d.ts:15`

#### Declaration

```typescript
NavigationMenuPopupState
```

<a id="api-4e617669676174696f6e4d656e752e506f7075702e53746174652e6f70656e"></a>

<a id="NavigationMenuPopupState-open"></a>

<a id="api-4e617669676174696f6e4d656e752e506f7075702e53746174652e616e63686f7248696464656e"></a>

<a id="NavigationMenuPopupState-anchorHidden"></a>

<a id="api-4e617669676174696f6e4d656e752e506f7075702e53746174652e7472616e736974696f6e537461747573"></a>

<a id="NavigationMenuPopupState-transitionStatus"></a>

<a id="api-4e617669676174696f6e4d656e752e506f7075702e53746174652e616c69676e"></a>

<a id="NavigationMenuPopupState-align"></a>

<a id="api-4e617669676174696f6e4d656e752e506f7075702e53746174652e73696465"></a>

<a id="NavigationMenuPopupState-side"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| open | `boolean` | Yes | Unavailable |  |
| anchorHidden | `boolean` | Yes | Unavailable |  |
| transitionStatus | `TransitionStatus` | Yes | Unavailable |  |
| align | `Align` | Yes | Unavailable |  |
| side | `Side` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="viewport"></a>

### Viewport

<a id="api-4e617669676174696f6e4d656e752e56696577706f7274"></a>

<a id="navigationmenuviewport"></a>

<a id="api-4e617669676174696f6e4d656e752e56696577706f72742e2470726f70732e70726f703a616c69676e"></a>

### NavigationMenu.Viewport

Declaration: `packages/solid/build/types/navigation-menu/viewport/NavigationMenuViewport.d.ts:3`

#### Declaration

```typescript
(props: NavigationMenuViewport.Props) => JSX.Element
```

<a id="api-4e617669676174696f6e4d656e752e56696577706f72742e2470726f70732e636c617373"></a>

<a id="NavigationMenuViewport-class"></a>

<a id="api-4e617669676174696f6e4d656e752e56696577706f72742e2470726f70732e7374796c65"></a>

<a id="NavigationMenuViewport-style"></a>

<a id="api-4e617669676174696f6e4d656e752e56696577706f72742e2470726f70732e72656e646572"></a>

<a id="NavigationMenuViewport-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<NavigationMenuViewportState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<NavigationMenuViewportState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, NavigationMenuViewportState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4e617669676174696f6e4d656e752e56696577706f72742e50726f7073"></a>

<a id="navigationmenuviewportprops"></a>

<a id="api-4e617669676174696f6e4d656e752e56696577706f72742e50726f70732e70726f703a616c69676e"></a>

### Related exported type: NavigationMenu.Viewport.Props

Declaration: `packages/solid/build/types/navigation-menu/viewport/NavigationMenuViewport.d.ts:10`

#### Declaration

```typescript
NavigationMenuViewportProps
```

<a id="api-4e617669676174696f6e4d656e752e56696577706f72742e50726f70732e636c617373"></a>

<a id="NavigationMenuViewportProps-class"></a>

<a id="api-4e617669676174696f6e4d656e752e56696577706f72742e50726f70732e7374796c65"></a>

<a id="NavigationMenuViewportProps-style"></a>

<a id="api-4e617669676174696f6e4d656e752e56696577706f72742e50726f70732e72656e646572"></a>

<a id="NavigationMenuViewportProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<NavigationMenuViewportState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<NavigationMenuViewportState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, NavigationMenuViewportState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4e617669676174696f6e4d656e752e56696577706f72742e5374617465"></a>

<a id="navigationmenuviewportstate"></a>

### Related exported type: NavigationMenu.Viewport.State

Declaration: `packages/solid/build/types/navigation-menu/viewport/NavigationMenuViewport.d.ts:9`

#### Declaration

```typescript
NavigationMenuViewportState
```

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="arrow"></a>

### Arrow

<a id="api-4e617669676174696f6e4d656e752e4172726f77"></a>

<a id="navigationmenuarrow"></a>

<a id="api-4e617669676174696f6e4d656e752e4172726f772e2470726f70732e70726f703a616c69676e"></a>

### NavigationMenu.Arrow

Declaration: `packages/solid/build/types/navigation-menu/arrow/NavigationMenuArrow.d.ts:3`

#### Declaration

```typescript
(props: NavigationMenuArrow.Props) => JSX.Element
```

<a id="api-4e617669676174696f6e4d656e752e4172726f772e2470726f70732e636c617373"></a>

<a id="NavigationMenuArrow-class"></a>

<a id="api-4e617669676174696f6e4d656e752e4172726f772e2470726f70732e7374796c65"></a>

<a id="NavigationMenuArrow-style"></a>

<a id="api-4e617669676174696f6e4d656e752e4172726f772e2470726f70732e72656e646572"></a>

<a id="NavigationMenuArrow-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<NavigationMenuArrowState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<NavigationMenuArrowState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, NavigationMenuArrowState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-4e617669676174696f6e4d656e754172726f7744617461417474726962757465732e6f70656e"></a>

<a id="api-4e617669676174696f6e4d656e754172726f7744617461417474726962757465732e636c6f736564"></a>

<a id="api-4e617669676174696f6e4d656e754172726f7744617461417474726962757465732e756e63656e7465726564"></a>

<a id="api-4e617669676174696f6e4d656e752e4172726f772e64617461417474726962757465732e646174612d616e63686f722d68696464656e"></a>

<a id="api-4e617669676174696f6e4d656e754172726f7744617461417474726962757465732e616c69676e"></a>

<a id="api-4e617669676174696f6e4d656e754172726f7744617461417474726962757465732e73696465"></a>

| Name | Description |
| --- | --- |
| data-open | Present when open is true. |
| data-closed | Present when open is false. |
| data-uncentered |  |
| data-anchor-hidden | Present when anchorHidden is true. |
| data-align |  |
| data-side |  |

#### CSS variables

Metadata status: unavailable.

<a id="api-4e617669676174696f6e4d656e752e4172726f772e50726f7073"></a>

<a id="navigationmenuarrowprops"></a>

<a id="api-4e617669676174696f6e4d656e752e4172726f772e50726f70732e70726f703a616c69676e"></a>

### Related exported type: NavigationMenu.Arrow.Props

Declaration: `packages/solid/build/types/navigation-menu/arrow/NavigationMenuArrow.d.ts:14`

#### Declaration

```typescript
NavigationMenuArrowProps
```

<a id="api-4e617669676174696f6e4d656e752e4172726f772e50726f70732e636c617373"></a>

<a id="NavigationMenuArrowProps-class"></a>

<a id="api-4e617669676174696f6e4d656e752e4172726f772e50726f70732e7374796c65"></a>

<a id="NavigationMenuArrowProps-style"></a>

<a id="api-4e617669676174696f6e4d656e752e4172726f772e50726f70732e72656e646572"></a>

<a id="NavigationMenuArrowProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<NavigationMenuArrowState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<NavigationMenuArrowState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, NavigationMenuArrowState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4e617669676174696f6e4d656e752e4172726f772e5374617465"></a>

<a id="navigationmenuarrowstate"></a>

### Related exported type: NavigationMenu.Arrow.State

Declaration: `packages/solid/build/types/navigation-menu/arrow/NavigationMenuArrow.d.ts:13`

#### Declaration

```typescript
NavigationMenuArrowState
```

<a id="api-4e617669676174696f6e4d656e752e4172726f772e53746174652e6f70656e"></a>

<a id="NavigationMenuArrowState-open"></a>

<a id="api-4e617669676174696f6e4d656e752e4172726f772e53746174652e756e63656e7465726564"></a>

<a id="NavigationMenuArrowState-uncentered"></a>

<a id="api-4e617669676174696f6e4d656e752e4172726f772e53746174652e616c69676e"></a>

<a id="NavigationMenuArrowState-align"></a>

<a id="api-4e617669676174696f6e4d656e752e4172726f772e53746174652e73696465"></a>

<a id="NavigationMenuArrowState-side"></a>

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

