<a id="scroll-area"></a>

# Scroll Area

A native scroll container with custom scrollbars.

[Open mounted Solid demo: scroll-area/hero](/solid/components/scroll-area)

<a id="anatomy"></a>

## Anatomy

Import the component and assemble its parts:

```tsx
import { ScrollArea } from '@unstyled-solid/base-ui/scroll-area';
<ScrollArea.Root>
  <ScrollArea.Viewport>
    <ScrollArea.Content />
  </ScrollArea.Viewport>
  <ScrollArea.Scrollbar>
    <ScrollArea.Thumb />
  </ScrollArea.Scrollbar>
  <ScrollArea.Corner />
</ScrollArea.Root>;
```

<a id="examples"></a>

## Examples

<a id="both-scrollbars"></a>

### Both scrollbars

Use `<ScrollArea.Corner>` to prevent the scrollbars from intersecting.

[Open mounted Solid demo: scroll-area/both](/solid/components/scroll-area)

<a id="gradient-scroll-fade"></a>

### Gradient scroll fade

Use the viewport overflow CSS variables to drive a CSS mask, which gradually increases the fade as the user scrolls away from the edges.

```css
.Viewport {
  mask-image: linear-gradient(
    to bottom,
    transparent 0,
    black min(40px, var(--scroll-area-overflow-y-start)),
    black calc(100% - min(40px, var(--scroll-area-overflow-y-end, 40px))),
    transparent 100%
  );
  mask-repeat: no-repeat;
}
```

For SSR, a fallback can be used as part of the end-side `var()` call so the mask is visible before the overflow CSS variables hydrate.

```css

var(--scroll-area-overflow-y-end, 40px);
```

When the fade is applied to `<ScrollArea.Viewport>` itself, the variables can be used directly. However, inheritance to children is disabled, so they must explicitly opt-in using the `inherit` keyword.

```css
.Child {
  --scroll-area-overflow-y-start: inherit;
  --scroll-area-overflow-y-end: inherit;
}
```

[Open mounted Solid demo: scroll-area/scroll-fade](/solid/components/scroll-area)

<a id="combining-with-tabs"></a>

### Combining with Tabs

Use `<Tabs.List>`'s `render` prop to render `<ScrollArea.Viewport>` directly when the tab list itself needs the viewport overflow values for a mask fade. This keeps the mask logic on the same element that receives the scroll state.

```tsx
<Tabs.Root defaultValue="overview">
  <ScrollArea.Root>
    <Tabs.List render={(renderProps) => <ScrollArea.Viewport {...renderProps} />}>
      <Tabs.Tab value="overview">Overview</Tabs.Tab>
      <Tabs.Indicator />
    </Tabs.List>
  </ScrollArea.Root>
  <Tabs.Panel value="overview">...</Tabs.Panel>
</Tabs.Root>;
```

<a id="api-reference"></a>

## API reference

<a id="root"></a>

### Root

<a id="api-5363726f6c6c417265612e526f6f74"></a>

<a id="scrollarearoot"></a>

<a id="api-5363726f6c6c417265612e526f6f742e2470726f70732e70726f703a616c69676e"></a>

### ScrollArea.Root

Source: Base UI 19511bb, MIT. Solid setup owns state; gesture latches are synchronous.

Declaration: `packages/solid/build/types/scroll-area/root/ScrollAreaRoot.d.ts:42`

#### Declaration

```typescript
(componentProps: ScrollAreaRootProps) => JSX.Element
```

<a id="api-5363726f6c6c417265612e526f6f742e2470726f70732e6f766572666c6f77456467655468726573686f6c64"></a>

<a id="ScrollAreaRoot-overflowEdgeThreshold"></a>

<a id="api-5363726f6c6c417265612e526f6f742e2470726f70732e636c617373"></a>

<a id="ScrollAreaRoot-class"></a>

<a id="api-5363726f6c6c417265612e526f6f742e2470726f70732e7374796c65"></a>

<a id="ScrollAreaRoot-style"></a>

<a id="api-5363726f6c6c417265612e526f6f742e2470726f70732e72656e646572"></a>

<a id="ScrollAreaRoot-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| overflowEdgeThreshold | `number \| Partial<Record<keyof OverflowEdges, number>> \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<ScrollAreaRootState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ScrollAreaRootState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<JSX.HTMLAttributes<HTMLDivElement> & JSX.Properties<HTMLDivElement>, ScrollAreaRootState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-5363726f6c6c41726561526f6f7444617461417474726962757465732e6861734f766572666c6f7758"></a>

<a id="api-5363726f6c6c41726561526f6f7444617461417474726962757465732e6861734f766572666c6f7759"></a>

<a id="api-5363726f6c6c41726561526f6f7444617461417474726962757465732e6f766572666c6f7758456e64"></a>

<a id="api-5363726f6c6c41726561526f6f7444617461417474726962757465732e6f766572666c6f77585374617274"></a>

<a id="api-5363726f6c6c41726561526f6f7444617461417474726962757465732e6f766572666c6f7759456e64"></a>

<a id="api-5363726f6c6c41726561526f6f7444617461417474726962757465732e6f766572666c6f77595374617274"></a>

<a id="api-5363726f6c6c41726561526f6f7444617461417474726962757465732e7363726f6c6c696e67"></a>

| Name | Description |
| --- | --- |
| data-has-overflow-x |  |
| data-has-overflow-y |  |
| data-overflow-x-end |  |
| data-overflow-x-start |  |
| data-overflow-y-end |  |
| data-overflow-y-start |  |
| data-scrolling |  |

#### CSS variables

<a id="api-5363726f6c6c41726561526f6f744373735661726961626c65732e7363726f6c6c41726561436f726e6572486569676874"></a>

<a id="api-5363726f6c6c41726561526f6f744373735661726961626c65732e7363726f6c6c41726561436f726e65725769647468"></a>

| Name | Description |
| --- | --- |
| --scroll-area-corner-height |  |
| --scroll-area-corner-width |  |

<a id="api-5363726f6c6c417265612e526f6f742e50726f7073"></a>

<a id="scrollarearootprops"></a>

<a id="api-5363726f6c6c417265612e526f6f742e50726f70732e70726f703a616c69676e"></a>

### Related exported type: ScrollArea.Root.Props

Declaration: `packages/solid/build/types/scroll-area/root/ScrollAreaRoot.d.ts:44`

#### Declaration

```typescript
ScrollAreaRootProps
```

<a id="api-5363726f6c6c417265612e526f6f742e50726f70732e6f766572666c6f77456467655468726573686f6c64"></a>

<a id="ScrollAreaRootProps-overflowEdgeThreshold"></a>

<a id="api-5363726f6c6c417265612e526f6f742e50726f70732e636c617373"></a>

<a id="ScrollAreaRootProps-class"></a>

<a id="api-5363726f6c6c417265612e526f6f742e50726f70732e7374796c65"></a>

<a id="ScrollAreaRootProps-style"></a>

<a id="api-5363726f6c6c417265612e526f6f742e50726f70732e72656e646572"></a>

<a id="ScrollAreaRootProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| overflowEdgeThreshold | `number \| Partial<Record<keyof OverflowEdges, number>> \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<ScrollAreaRootState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ScrollAreaRootState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<JSX.HTMLAttributes<HTMLDivElement> & JSX.Properties<HTMLDivElement>, ScrollAreaRootState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-5363726f6c6c417265612e526f6f742e5374617465"></a>

<a id="scrollarearootstate"></a>

### Related exported type: ScrollArea.Root.State

Declaration: `packages/solid/build/types/scroll-area/root/ScrollAreaRoot.d.ts:45`

#### Declaration

```typescript
ScrollAreaRootState
```

<a id="api-5363726f6c6c417265612e526f6f742e53746174652e636f726e657248696464656e"></a>

<a id="ScrollAreaRootState-cornerHidden"></a>

<a id="api-5363726f6c6c417265612e526f6f742e53746174652e6861734f766572666c6f7758"></a>

<a id="ScrollAreaRootState-hasOverflowX"></a>

<a id="api-5363726f6c6c417265612e526f6f742e53746174652e6861734f766572666c6f7759"></a>

<a id="ScrollAreaRootState-hasOverflowY"></a>

<a id="api-5363726f6c6c417265612e526f6f742e53746174652e6f766572666c6f7758456e64"></a>

<a id="ScrollAreaRootState-overflowXEnd"></a>

<a id="api-5363726f6c6c417265612e526f6f742e53746174652e6f766572666c6f77585374617274"></a>

<a id="ScrollAreaRootState-overflowXStart"></a>

<a id="api-5363726f6c6c417265612e526f6f742e53746174652e6f766572666c6f7759456e64"></a>

<a id="ScrollAreaRootState-overflowYEnd"></a>

<a id="api-5363726f6c6c417265612e526f6f742e53746174652e6f766572666c6f77595374617274"></a>

<a id="ScrollAreaRootState-overflowYStart"></a>

<a id="api-5363726f6c6c417265612e526f6f742e53746174652e7363726f6c6c696e67"></a>

<a id="ScrollAreaRootState-scrolling"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| cornerHidden | `boolean` | Yes | Unavailable |  |
| hasOverflowX | `boolean` | Yes | Unavailable |  |
| hasOverflowY | `boolean` | Yes | Unavailable |  |
| overflowXEnd | `boolean` | Yes | Unavailable |  |
| overflowXStart | `boolean` | Yes | Unavailable |  |
| overflowYEnd | `boolean` | Yes | Unavailable |  |
| overflowYStart | `boolean` | Yes | Unavailable |  |
| scrolling | `boolean` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="viewport"></a>

### Viewport

<a id="api-5363726f6c6c417265612e56696577706f7274"></a>

<a id="scrollareaviewport"></a>

<a id="api-5363726f6c6c417265612e56696577706f72742e2470726f70732e70726f703a616c69676e"></a>

### ScrollArea.Viewport

Declaration: `packages/solid/build/types/scroll-area/viewport/ScrollAreaViewport.d.ts:5`

#### Declaration

```typescript
(componentProps: ScrollAreaViewportProps) => JSX.Element
```

<a id="api-5363726f6c6c417265612e56696577706f72742e2470726f70732e636c617373"></a>

<a id="ScrollAreaViewport-class"></a>

<a id="api-5363726f6c6c417265612e56696577706f72742e2470726f70732e7374796c65"></a>

<a id="ScrollAreaViewport-style"></a>

<a id="api-5363726f6c6c417265612e56696577706f72742e2470726f70732e72656e646572"></a>

<a id="ScrollAreaViewport-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<ScrollAreaViewportState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ScrollAreaViewportState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<JSX.HTMLAttributes<HTMLDivElement> & JSX.Properties<HTMLDivElement>, ScrollAreaViewportState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-5363726f6c6c4172656156696577706f727444617461417474726962757465732e6861734f766572666c6f7758"></a>

<a id="api-5363726f6c6c4172656156696577706f727444617461417474726962757465732e6861734f766572666c6f7759"></a>

<a id="api-5363726f6c6c4172656156696577706f727444617461417474726962757465732e6f766572666c6f7758456e64"></a>

<a id="api-5363726f6c6c4172656156696577706f727444617461417474726962757465732e6f766572666c6f77585374617274"></a>

<a id="api-5363726f6c6c4172656156696577706f727444617461417474726962757465732e6f766572666c6f7759456e64"></a>

<a id="api-5363726f6c6c4172656156696577706f727444617461417474726962757465732e6f766572666c6f77595374617274"></a>

<a id="api-5363726f6c6c4172656156696577706f727444617461417474726962757465732e7363726f6c6c696e67"></a>

| Name | Description |
| --- | --- |
| data-has-overflow-x |  |
| data-has-overflow-y |  |
| data-overflow-x-end |  |
| data-overflow-x-start |  |
| data-overflow-y-end |  |
| data-overflow-y-start |  |
| data-scrolling |  |

#### CSS variables

<a id="api-5363726f6c6c4172656156696577706f72744373735661726961626c65732e7363726f6c6c417265614f766572666c6f7758456e64"></a>

<a id="api-5363726f6c6c4172656156696577706f72744373735661726961626c65732e7363726f6c6c417265614f766572666c6f77585374617274"></a>

<a id="api-5363726f6c6c4172656156696577706f72744373735661726961626c65732e7363726f6c6c417265614f766572666c6f7759456e64"></a>

<a id="api-5363726f6c6c4172656156696577706f72744373735661726961626c65732e7363726f6c6c417265614f766572666c6f77595374617274"></a>

| Name | Description |
| --- | --- |
| --scroll-area-overflow-x-end |  |
| --scroll-area-overflow-x-start |  |
| --scroll-area-overflow-y-end |  |
| --scroll-area-overflow-y-start |  |

<a id="api-5363726f6c6c417265612e56696577706f72742e50726f7073"></a>

<a id="scrollareaviewportprops"></a>

<a id="api-5363726f6c6c417265612e56696577706f72742e50726f70732e70726f703a616c69676e"></a>

### Related exported type: ScrollArea.Viewport.Props

Declaration: `packages/solid/build/types/scroll-area/viewport/ScrollAreaViewport.d.ts:11`

#### Declaration

```typescript
ScrollAreaViewportProps
```

<a id="api-5363726f6c6c417265612e56696577706f72742e50726f70732e636c617373"></a>

<a id="ScrollAreaViewportProps-class"></a>

<a id="api-5363726f6c6c417265612e56696577706f72742e50726f70732e7374796c65"></a>

<a id="ScrollAreaViewportProps-style"></a>

<a id="api-5363726f6c6c417265612e56696577706f72742e50726f70732e72656e646572"></a>

<a id="ScrollAreaViewportProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<ScrollAreaViewportState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ScrollAreaViewportState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<JSX.HTMLAttributes<HTMLDivElement> & JSX.Properties<HTMLDivElement>, ScrollAreaViewportState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-5363726f6c6c417265612e56696577706f72742e5374617465"></a>

<a id="scrollareaviewportstate"></a>

### Related exported type: ScrollArea.Viewport.State

Declaration: `packages/solid/build/types/scroll-area/viewport/ScrollAreaViewport.d.ts:12`

#### Declaration

```typescript
ScrollAreaViewportState
```

<a id="api-5363726f6c6c417265612e56696577706f72742e53746174652e636f726e657248696464656e"></a>

<a id="ScrollAreaViewportState-cornerHidden"></a>

<a id="api-5363726f6c6c417265612e56696577706f72742e53746174652e6861734f766572666c6f7758"></a>

<a id="ScrollAreaViewportState-hasOverflowX"></a>

<a id="api-5363726f6c6c417265612e56696577706f72742e53746174652e6861734f766572666c6f7759"></a>

<a id="ScrollAreaViewportState-hasOverflowY"></a>

<a id="api-5363726f6c6c417265612e56696577706f72742e53746174652e6f766572666c6f7758456e64"></a>

<a id="ScrollAreaViewportState-overflowXEnd"></a>

<a id="api-5363726f6c6c417265612e56696577706f72742e53746174652e6f766572666c6f77585374617274"></a>

<a id="ScrollAreaViewportState-overflowXStart"></a>

<a id="api-5363726f6c6c417265612e56696577706f72742e53746174652e6f766572666c6f7759456e64"></a>

<a id="ScrollAreaViewportState-overflowYEnd"></a>

<a id="api-5363726f6c6c417265612e56696577706f72742e53746174652e6f766572666c6f77595374617274"></a>

<a id="ScrollAreaViewportState-overflowYStart"></a>

<a id="api-5363726f6c6c417265612e56696577706f72742e53746174652e7363726f6c6c696e67"></a>

<a id="ScrollAreaViewportState-scrolling"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| cornerHidden | `boolean` | Yes | Unavailable |  |
| hasOverflowX | `boolean` | Yes | Unavailable |  |
| hasOverflowY | `boolean` | Yes | Unavailable |  |
| overflowXEnd | `boolean` | Yes | Unavailable |  |
| overflowXStart | `boolean` | Yes | Unavailable |  |
| overflowYEnd | `boolean` | Yes | Unavailable |  |
| overflowYStart | `boolean` | Yes | Unavailable |  |
| scrolling | `boolean` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="content"></a>

### Content

<a id="api-5363726f6c6c417265612e436f6e74656e74"></a>

<a id="scrollareacontent"></a>

<a id="api-5363726f6c6c417265612e436f6e74656e742e2470726f70732e70726f703a616c69676e"></a>

### ScrollArea.Content

Declaration: `packages/solid/build/types/scroll-area/content/ScrollAreaContent.d.ts:4`

#### Declaration

```typescript
(componentProps: ScrollAreaContentProps) => JSX.Element
```

<a id="api-5363726f6c6c417265612e436f6e74656e742e2470726f70732e636c617373"></a>

<a id="ScrollAreaContent-class"></a>

<a id="api-5363726f6c6c417265612e436f6e74656e742e2470726f70732e7374796c65"></a>

<a id="ScrollAreaContent-style"></a>

<a id="api-5363726f6c6c417265612e436f6e74656e742e2470726f70732e72656e646572"></a>

<a id="ScrollAreaContent-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<ScrollAreaContentState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ScrollAreaContentState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<JSX.HTMLAttributes<HTMLDivElement> & JSX.Properties<HTMLDivElement>, ScrollAreaContentState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-5363726f6c6c41726561436f6e74656e7444617461417474726962757465732e6861734f766572666c6f7758"></a>

<a id="api-5363726f6c6c41726561436f6e74656e7444617461417474726962757465732e6861734f766572666c6f7759"></a>

<a id="api-5363726f6c6c41726561436f6e74656e7444617461417474726962757465732e6f766572666c6f7758456e64"></a>

<a id="api-5363726f6c6c41726561436f6e74656e7444617461417474726962757465732e6f766572666c6f77585374617274"></a>

<a id="api-5363726f6c6c41726561436f6e74656e7444617461417474726962757465732e6f766572666c6f7759456e64"></a>

<a id="api-5363726f6c6c41726561436f6e74656e7444617461417474726962757465732e6f766572666c6f77595374617274"></a>

<a id="api-5363726f6c6c41726561436f6e74656e7444617461417474726962757465732e7363726f6c6c696e67"></a>

| Name | Description |
| --- | --- |
| data-has-overflow-x |  |
| data-has-overflow-y |  |
| data-overflow-x-end |  |
| data-overflow-x-start |  |
| data-overflow-y-end |  |
| data-overflow-y-start |  |
| data-scrolling |  |

#### CSS variables

Metadata status: unavailable.

<a id="api-5363726f6c6c417265612e436f6e74656e742e50726f7073"></a>

<a id="scrollareacontentprops"></a>

<a id="api-5363726f6c6c417265612e436f6e74656e742e50726f70732e70726f703a616c69676e"></a>

### Related exported type: ScrollArea.Content.Props

Declaration: `packages/solid/build/types/scroll-area/content/ScrollAreaContent.d.ts:10`

#### Declaration

```typescript
ScrollAreaContentProps
```

<a id="api-5363726f6c6c417265612e436f6e74656e742e50726f70732e636c617373"></a>

<a id="ScrollAreaContentProps-class"></a>

<a id="api-5363726f6c6c417265612e436f6e74656e742e50726f70732e7374796c65"></a>

<a id="ScrollAreaContentProps-style"></a>

<a id="api-5363726f6c6c417265612e436f6e74656e742e50726f70732e72656e646572"></a>

<a id="ScrollAreaContentProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<ScrollAreaContentState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ScrollAreaContentState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<JSX.HTMLAttributes<HTMLDivElement> & JSX.Properties<HTMLDivElement>, ScrollAreaContentState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-5363726f6c6c417265612e436f6e74656e742e5374617465"></a>

<a id="scrollareacontentstate"></a>

### Related exported type: ScrollArea.Content.State

Declaration: `packages/solid/build/types/scroll-area/content/ScrollAreaContent.d.ts:11`

#### Declaration

```typescript
ScrollAreaContentState
```

<a id="api-5363726f6c6c417265612e436f6e74656e742e53746174652e636f726e657248696464656e"></a>

<a id="ScrollAreaContentState-cornerHidden"></a>

<a id="api-5363726f6c6c417265612e436f6e74656e742e53746174652e6861734f766572666c6f7758"></a>

<a id="ScrollAreaContentState-hasOverflowX"></a>

<a id="api-5363726f6c6c417265612e436f6e74656e742e53746174652e6861734f766572666c6f7759"></a>

<a id="ScrollAreaContentState-hasOverflowY"></a>

<a id="api-5363726f6c6c417265612e436f6e74656e742e53746174652e6f766572666c6f7758456e64"></a>

<a id="ScrollAreaContentState-overflowXEnd"></a>

<a id="api-5363726f6c6c417265612e436f6e74656e742e53746174652e6f766572666c6f77585374617274"></a>

<a id="ScrollAreaContentState-overflowXStart"></a>

<a id="api-5363726f6c6c417265612e436f6e74656e742e53746174652e6f766572666c6f7759456e64"></a>

<a id="ScrollAreaContentState-overflowYEnd"></a>

<a id="api-5363726f6c6c417265612e436f6e74656e742e53746174652e6f766572666c6f77595374617274"></a>

<a id="ScrollAreaContentState-overflowYStart"></a>

<a id="api-5363726f6c6c417265612e436f6e74656e742e53746174652e7363726f6c6c696e67"></a>

<a id="ScrollAreaContentState-scrolling"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| cornerHidden | `boolean` | Yes | Unavailable |  |
| hasOverflowX | `boolean` | Yes | Unavailable |  |
| hasOverflowY | `boolean` | Yes | Unavailable |  |
| overflowXEnd | `boolean` | Yes | Unavailable |  |
| overflowXStart | `boolean` | Yes | Unavailable |  |
| overflowYEnd | `boolean` | Yes | Unavailable |  |
| overflowYStart | `boolean` | Yes | Unavailable |  |
| scrolling | `boolean` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="scrollbar"></a>

### Scrollbar

<a id="api-5363726f6c6c417265612e5363726f6c6c626172"></a>

<a id="scrollareascrollbar"></a>

<a id="api-5363726f6c6c417265612e5363726f6c6c6261722e2470726f70732e70726f703a616c69676e"></a>

### ScrollArea.Scrollbar

Declaration: `packages/solid/build/types/scroll-area/scrollbar/ScrollAreaScrollbar.d.ts:4`

#### Declaration

```typescript
(componentProps: ScrollAreaScrollbarProps) => JSX.Element
```

<a id="api-5363726f6c6c417265612e5363726f6c6c6261722e2470726f70732e6f7269656e746174696f6e"></a>

<a id="ScrollAreaScrollbar-orientation"></a>

<a id="api-5363726f6c6c417265612e5363726f6c6c6261722e2470726f70732e636c617373"></a>

<a id="ScrollAreaScrollbar-class"></a>

<a id="api-5363726f6c6c417265612e5363726f6c6c6261722e2470726f70732e7374796c65"></a>

<a id="ScrollAreaScrollbar-style"></a>

<a id="api-5363726f6c6c417265612e5363726f6c6c6261722e2470726f70732e6b6565704d6f756e746564"></a>

<a id="ScrollAreaScrollbar-keepMounted"></a>

<a id="api-5363726f6c6c417265612e5363726f6c6c6261722e2470726f70732e72656e646572"></a>

<a id="ScrollAreaScrollbar-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| orientation | `"horizontal" \| "vertical" \| undefined` | No | 'vertical' |  |
| class | `JSX.ClassValue \| ((state: Readonly<ScrollAreaScrollbarState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ScrollAreaScrollbarState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| keepMounted | `boolean \| undefined` | No | Unavailable |  |
| render | `ComponentRenderFn<JSX.HTMLAttributes<HTMLDivElement> & JSX.Properties<HTMLDivElement>, ScrollAreaScrollbarState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-5363726f6c6c417265615363726f6c6c62617244617461417474726962757465732e6f7269656e746174696f6e"></a>

<a id="api-5363726f6c6c417265615363726f6c6c62617244617461417474726962757465732e6861734f766572666c6f7758"></a>

<a id="api-5363726f6c6c417265615363726f6c6c62617244617461417474726962757465732e6861734f766572666c6f7759"></a>

<a id="api-5363726f6c6c417265615363726f6c6c62617244617461417474726962757465732e686f766572696e67"></a>

<a id="api-5363726f6c6c417265615363726f6c6c62617244617461417474726962757465732e6f766572666c6f7758456e64"></a>

<a id="api-5363726f6c6c417265615363726f6c6c62617244617461417474726962757465732e6f766572666c6f77585374617274"></a>

<a id="api-5363726f6c6c417265615363726f6c6c62617244617461417474726962757465732e6f766572666c6f7759456e64"></a>

<a id="api-5363726f6c6c417265615363726f6c6c62617244617461417474726962757465732e6f766572666c6f77595374617274"></a>

<a id="api-5363726f6c6c417265615363726f6c6c62617244617461417474726962757465732e7363726f6c6c696e67"></a>

| Name | Description |
| --- | --- |
| data-orientation |  |
| data-has-overflow-x |  |
| data-has-overflow-y |  |
| data-hovering |  |
| data-overflow-x-end |  |
| data-overflow-x-start |  |
| data-overflow-y-end |  |
| data-overflow-y-start |  |
| data-scrolling |  |

#### CSS variables

<a id="api-5363726f6c6c417265615363726f6c6c6261724373735661726961626c65732e7363726f6c6c417265615468756d62486569676874"></a>

<a id="api-5363726f6c6c417265615363726f6c6c6261724373735661726961626c65732e7363726f6c6c417265615468756d625769647468"></a>

| Name | Description |
| --- | --- |
| --scroll-area-thumb-height |  |
| --scroll-area-thumb-width |  |

<a id="api-5363726f6c6c417265612e5363726f6c6c6261722e50726f7073"></a>

<a id="scrollareascrollbarprops"></a>

<a id="api-5363726f6c6c417265612e5363726f6c6c6261722e50726f70732e70726f703a616c69676e"></a>

### Related exported type: ScrollArea.Scrollbar.Props

Declaration: `packages/solid/build/types/scroll-area/scrollbar/ScrollAreaScrollbar.d.ts:14`

#### Declaration

```typescript
ScrollAreaScrollbarProps
```

<a id="api-5363726f6c6c417265612e5363726f6c6c6261722e50726f70732e6f7269656e746174696f6e"></a>

<a id="ScrollAreaScrollbarProps-orientation"></a>

<a id="api-5363726f6c6c417265612e5363726f6c6c6261722e50726f70732e636c617373"></a>

<a id="ScrollAreaScrollbarProps-class"></a>

<a id="api-5363726f6c6c417265612e5363726f6c6c6261722e50726f70732e7374796c65"></a>

<a id="ScrollAreaScrollbarProps-style"></a>

<a id="api-5363726f6c6c417265612e5363726f6c6c6261722e50726f70732e6b6565704d6f756e746564"></a>

<a id="ScrollAreaScrollbarProps-keepMounted"></a>

<a id="api-5363726f6c6c417265612e5363726f6c6c6261722e50726f70732e72656e646572"></a>

<a id="ScrollAreaScrollbarProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| orientation | `"horizontal" \| "vertical" \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<ScrollAreaScrollbarState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ScrollAreaScrollbarState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| keepMounted | `boolean \| undefined` | No | Unavailable |  |
| render | `ComponentRenderFn<JSX.HTMLAttributes<HTMLDivElement> & JSX.Properties<HTMLDivElement>, ScrollAreaScrollbarState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-5363726f6c6c417265612e5363726f6c6c6261722e5374617465"></a>

<a id="scrollareascrollbarstate"></a>

### Related exported type: ScrollArea.Scrollbar.State

Declaration: `packages/solid/build/types/scroll-area/scrollbar/ScrollAreaScrollbar.d.ts:15`

#### Declaration

```typescript
ScrollAreaScrollbarState
```

<a id="api-5363726f6c6c417265612e5363726f6c6c6261722e53746174652e636f726e657248696464656e"></a>

<a id="ScrollAreaScrollbarState-cornerHidden"></a>

<a id="api-5363726f6c6c417265612e5363726f6c6c6261722e53746174652e6861734f766572666c6f7758"></a>

<a id="ScrollAreaScrollbarState-hasOverflowX"></a>

<a id="api-5363726f6c6c417265612e5363726f6c6c6261722e53746174652e6861734f766572666c6f7759"></a>

<a id="ScrollAreaScrollbarState-hasOverflowY"></a>

<a id="api-5363726f6c6c417265612e5363726f6c6c6261722e53746174652e686f766572696e67"></a>

<a id="ScrollAreaScrollbarState-hovering"></a>

<a id="api-5363726f6c6c417265612e5363726f6c6c6261722e53746174652e6f766572666c6f7758456e64"></a>

<a id="ScrollAreaScrollbarState-overflowXEnd"></a>

<a id="api-5363726f6c6c417265612e5363726f6c6c6261722e53746174652e6f766572666c6f77585374617274"></a>

<a id="ScrollAreaScrollbarState-overflowXStart"></a>

<a id="api-5363726f6c6c417265612e5363726f6c6c6261722e53746174652e6f766572666c6f7759456e64"></a>

<a id="ScrollAreaScrollbarState-overflowYEnd"></a>

<a id="api-5363726f6c6c417265612e5363726f6c6c6261722e53746174652e6f766572666c6f77595374617274"></a>

<a id="ScrollAreaScrollbarState-overflowYStart"></a>

<a id="api-5363726f6c6c417265612e5363726f6c6c6261722e53746174652e7363726f6c6c696e67"></a>

<a id="ScrollAreaScrollbarState-scrolling"></a>

<a id="api-5363726f6c6c417265612e5363726f6c6c6261722e53746174652e6f7269656e746174696f6e"></a>

<a id="ScrollAreaScrollbarState-orientation"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| cornerHidden | `boolean` | Yes | Unavailable |  |
| hasOverflowX | `boolean` | Yes | Unavailable |  |
| hasOverflowY | `boolean` | Yes | Unavailable |  |
| hovering | `boolean` | Yes | Unavailable |  |
| overflowXEnd | `boolean` | Yes | Unavailable |  |
| overflowXStart | `boolean` | Yes | Unavailable |  |
| overflowYEnd | `boolean` | Yes | Unavailable |  |
| overflowYStart | `boolean` | Yes | Unavailable |  |
| scrolling | `boolean` | Yes | Unavailable |  |
| orientation | `"horizontal" \| "vertical"` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="thumb"></a>

### Thumb

<a id="api-5363726f6c6c417265612e5468756d62"></a>

<a id="scrollareathumb"></a>

<a id="api-5363726f6c6c417265612e5468756d622e2470726f70732e70726f703a616c69676e"></a>

### ScrollArea.Thumb

Declaration: `packages/solid/build/types/scroll-area/thumb/ScrollAreaThumb.d.ts:3`

#### Declaration

```typescript
(componentProps: ScrollAreaThumbProps) => JSX.Element
```

<a id="api-5363726f6c6c417265612e5468756d622e2470726f70732e636c617373"></a>

<a id="ScrollAreaThumb-class"></a>

<a id="api-5363726f6c6c417265612e5468756d622e2470726f70732e7374796c65"></a>

<a id="ScrollAreaThumb-style"></a>

<a id="api-5363726f6c6c417265612e5468756d622e2470726f70732e72656e646572"></a>

<a id="ScrollAreaThumb-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<ScrollAreaThumbState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ScrollAreaThumbState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<JSX.HTMLAttributes<HTMLDivElement> & JSX.Properties<HTMLDivElement>, ScrollAreaThumbState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-5363726f6c6c417265615468756d6244617461417474726962757465732e6f7269656e746174696f6e"></a>

<a id="api-5363726f6c6c417265615468756d6244617461417474726962757465732e7363726f6c6c696e67"></a>

| Name | Description |
| --- | --- |
| data-orientation |  |
| data-scrolling |  |

#### CSS variables

Metadata status: unavailable.

<a id="api-5363726f6c6c417265612e5468756d622e50726f7073"></a>

<a id="scrollareathumbprops"></a>

<a id="api-5363726f6c6c417265612e5468756d622e50726f70732e70726f703a616c69676e"></a>

### Related exported type: ScrollArea.Thumb.Props

Declaration: `packages/solid/build/types/scroll-area/thumb/ScrollAreaThumb.d.ts:11`

#### Declaration

```typescript
ScrollAreaThumbProps
```

<a id="api-5363726f6c6c417265612e5468756d622e50726f70732e636c617373"></a>

<a id="ScrollAreaThumbProps-class"></a>

<a id="api-5363726f6c6c417265612e5468756d622e50726f70732e7374796c65"></a>

<a id="ScrollAreaThumbProps-style"></a>

<a id="api-5363726f6c6c417265612e5468756d622e50726f70732e72656e646572"></a>

<a id="ScrollAreaThumbProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<ScrollAreaThumbState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ScrollAreaThumbState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<JSX.HTMLAttributes<HTMLDivElement> & JSX.Properties<HTMLDivElement>, ScrollAreaThumbState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-5363726f6c6c417265612e5468756d622e5374617465"></a>

<a id="scrollareathumbstate"></a>

### Related exported type: ScrollArea.Thumb.State

Declaration: `packages/solid/build/types/scroll-area/thumb/ScrollAreaThumb.d.ts:12`

#### Declaration

```typescript
ScrollAreaThumbState
```

<a id="api-5363726f6c6c417265612e5468756d622e53746174652e7363726f6c6c696e67"></a>

<a id="ScrollAreaThumbState-scrolling"></a>

<a id="api-5363726f6c6c417265612e5468756d622e53746174652e6f7269656e746174696f6e"></a>

<a id="ScrollAreaThumbState-orientation"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| scrolling | `boolean` | Yes | Unavailable |  |
| orientation | `"horizontal" \| "vertical"` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="corner"></a>

### Corner

<a id="api-5363726f6c6c417265612e436f726e6572"></a>

<a id="scrollareacorner"></a>

<a id="api-5363726f6c6c417265612e436f726e65722e2470726f70732e70726f703a616c69676e"></a>

### ScrollArea.Corner

Declaration: `packages/solid/build/types/scroll-area/corner/ScrollAreaCorner.d.ts:3`

#### Declaration

```typescript
(componentProps: ScrollAreaCornerProps) => JSX.Element
```

<a id="api-5363726f6c6c417265612e436f726e65722e2470726f70732e636c617373"></a>

<a id="ScrollAreaCorner-class"></a>

<a id="api-5363726f6c6c417265612e436f726e65722e2470726f70732e7374796c65"></a>

<a id="ScrollAreaCorner-style"></a>

<a id="api-5363726f6c6c417265612e436f726e65722e2470726f70732e72656e646572"></a>

<a id="ScrollAreaCorner-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<ScrollAreaCornerState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ScrollAreaCornerState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<JSX.HTMLAttributes<HTMLDivElement> & JSX.Properties<HTMLDivElement>, ScrollAreaCornerState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-5363726f6c6c417265612e436f726e65722e50726f7073"></a>

<a id="scrollareacornerprops"></a>

<a id="api-5363726f6c6c417265612e436f726e65722e50726f70732e70726f703a616c69676e"></a>

### Related exported type: ScrollArea.Corner.Props

Declaration: `packages/solid/build/types/scroll-area/corner/ScrollAreaCorner.d.ts:9`

#### Declaration

```typescript
ScrollAreaCornerProps
```

<a id="api-5363726f6c6c417265612e436f726e65722e50726f70732e636c617373"></a>

<a id="ScrollAreaCornerProps-class"></a>

<a id="api-5363726f6c6c417265612e436f726e65722e50726f70732e7374796c65"></a>

<a id="ScrollAreaCornerProps-style"></a>

<a id="api-5363726f6c6c417265612e436f726e65722e50726f70732e72656e646572"></a>

<a id="ScrollAreaCornerProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<ScrollAreaCornerState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ScrollAreaCornerState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<JSX.HTMLAttributes<HTMLDivElement> & JSX.Properties<HTMLDivElement>, ScrollAreaCornerState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-5363726f6c6c417265612e436f726e65722e5374617465"></a>

<a id="scrollareacornerstate"></a>

### Related exported type: ScrollArea.Corner.State

Declaration: `packages/solid/build/types/scroll-area/corner/ScrollAreaCorner.d.ts:10`

#### Declaration

```typescript
ScrollAreaCornerState
```

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

