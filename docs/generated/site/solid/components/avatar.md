<a id="avatar"></a>

# Avatar

An easily stylable avatar component.

[Open mounted Solid demo: avatar/hero](/solid/components/avatar)

<a id="anatomy"></a>

## Anatomy

Import the component and assemble its parts:

```tsx
import { Avatar } from '@unstyled-solid/base-ui/avatar';
<Avatar.Root>
  <Avatar.Image src="" />
  <Avatar.Fallback>LT</Avatar.Fallback>
</Avatar.Root>;
```

<a id="optimized-and-lazy-loaded-images"></a>

## Optimized and lazy-loaded images

By default, `<Avatar.Image>` preloads `src` and renders the image only once it has loaded. This doesn't compose with image optimizers such as `next/image`, which serve a different URL than the raw `src`, or with `loading="lazy"`.

Add the `keepMounted` prop to render the image element right away and let it load in place. Only the image that is actually displayed is requested:

```jsx
import { Avatar } from '@unstyled-solid/base-ui/avatar';
<Avatar.Root>
  <Avatar.Fallback>LT</Avatar.Fallback>
  <Avatar.Image
    keepMounted
    src="/avatar.png"
    render={(props) => (
      <img {...props} loading="lazy" width={32} height={32} alt="" />
    )}
  />
</Avatar.Root>;
```

<a id="stacking"></a>

### Stacking

With `keepMounted`, the image and the fallback are both present until the image loads. The image is hidden from assistive technology until then, so the fallback provides the accessible name on its own.

Stack the two in the same box, and place `<Avatar.Image>` after `<Avatar.Fallback>`. Both are positioned, so whichever comes later in the DOM paints on top. The fallback then shows through until the image covers it.

A loading image paints nothing, so the fallback shows through on its own. An image that failed to load paints a broken-image icon on top of it. Hide the image in either state with the `data-loading` and `data-error` attributes:

```css
.Root {
  position: relative;
}

.Image,
.Fallback {
  position: absolute;
  inset: 0;
}

.Image[data-loading],
.Image[data-error] {
  visibility: hidden;
}
```

Avoid `display: none` here: an element without a box never intersects the viewport, so `loading="lazy"` would never fetch the image. `visibility` and `opacity` both keep lazy loading working.

<a id="server-rendering"></a>

### Server rendering

With `keepMounted`, the image is part of the server-rendered HTML and starts loading before hydration. So is the fallback, which stays visible until hydration resolves the loading status. A cached image is displayed immediately, without an enter animation.

<a id="api-reference"></a>

## API reference

<a id="root"></a>

### Root

<a id="api-4176617461722e526f6f74"></a>

<a id="avatarroot"></a>

### Avatar.Root

Displays a user's profile picture, initials, or fallback icon. Renders a `<span>`.

Declaration: `packages/solid/build/types/avatar/root/AvatarRoot.d.ts:4`

#### Declaration

```typescript
(componentProps: AvatarRoot.Props) => JSX.Element
```

<a id="api-4176617461722e526f6f742e2470726f70732e636c617373"></a>

<a id="AvatarRoot-class"></a>

<a id="api-4176617461722e526f6f742e2470726f70732e7374796c65"></a>

<a id="AvatarRoot-style"></a>

<a id="api-4176617461722e526f6f742e2470726f70732e72656e646572"></a>

<a id="AvatarRoot-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<AvatarRootState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AvatarRootState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<JSX.HTMLAttributes<HTMLSpanElement> & JSX.Properties<HTMLSpanElement>, AvatarRootState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4176617461722e526f6f742e50726f7073"></a>

<a id="avatarrootprops"></a>

### Related exported type: Avatar.Root.Props

Declaration: `packages/solid/build/types/avatar/root/AvatarRoot.d.ts:13`

#### Declaration

```typescript
AvatarRootProps
```

<a id="api-4176617461722e526f6f742e50726f70732e636c617373"></a>

<a id="AvatarRootProps-class"></a>

<a id="api-4176617461722e526f6f742e50726f70732e7374796c65"></a>

<a id="AvatarRootProps-style"></a>

<a id="api-4176617461722e526f6f742e50726f70732e72656e646572"></a>

<a id="AvatarRootProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<AvatarRootState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AvatarRootState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<JSX.HTMLAttributes<HTMLSpanElement> & JSX.Properties<HTMLSpanElement>, AvatarRootState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4176617461722e526f6f742e5374617465"></a>

<a id="avatarrootstate"></a>

### Related exported type: Avatar.Root.State

Declaration: `packages/solid/build/types/avatar/root/AvatarRoot.d.ts:12`

#### Declaration

```typescript
AvatarRootState
```

<a id="api-4176617461722e526f6f742e53746174652e696d6167654c6f6164696e67537461747573"></a>

<a id="AvatarRootState-imageLoadingStatus"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| imageLoadingStatus | `ImageLoadingStatus` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="image"></a>

### Image

<a id="api-4176617461722e496d616765"></a>

<a id="avatarimage"></a>

<a id="api-4176617461722e496d6167652e2470726f70732e70726f703a616c69676e"></a>

<a id="api-4176617461722e496d6167652e2470726f70732e70726f703a616c74"></a>

<a id="api-4176617461722e496d6167652e2470726f70732e70726f703a626f72646572"></a>

<a id="api-4176617461722e496d6167652e2470726f70732e70726f703a63726f73734f726967696e"></a>

<a id="api-4176617461722e496d6167652e2470726f70732e70726f703a6465636f64696e67"></a>

<a id="api-4176617461722e496d6167652e2470726f70732e70726f703a66657463685072696f72697479"></a>

<a id="api-4176617461722e496d6167652e2470726f70732e70726f703a686569676874"></a>

<a id="api-4176617461722e496d6167652e2470726f70732e70726f703a687370616365"></a>

<a id="api-4176617461722e496d6167652e2470726f70732e70726f703a69734d6170"></a>

<a id="api-4176617461722e496d6167652e2470726f70732e70726f703a6c6f6164696e67"></a>

<a id="api-4176617461722e496d6167652e2470726f70732e70726f703a6c6f6e6744657363"></a>

<a id="api-4176617461722e496d6167652e2470726f70732e70726f703a6c6f77737263"></a>

<a id="api-4176617461722e496d6167652e2470726f70732e70726f703a6e616d65"></a>

<a id="api-4176617461722e496d6167652e2470726f70732e70726f703a7265666572726572506f6c696379"></a>

<a id="api-4176617461722e496d6167652e2470726f70732e70726f703a73697a6573"></a>

<a id="api-4176617461722e496d6167652e2470726f70732e70726f703a737263"></a>

<a id="api-4176617461722e496d6167652e2470726f70732e70726f703a737263736574"></a>

<a id="api-4176617461722e496d6167652e2470726f70732e70726f703a7573654d6170"></a>

<a id="api-4176617461722e496d6167652e2470726f70732e70726f703a767370616365"></a>

<a id="api-4176617461722e496d6167652e2470726f70732e70726f703a7769647468"></a>

### Avatar.Image

The avatar image. Renders an `<img>` after preloading, or in place with keepMounted.

Declaration: `packages/solid/build/types/avatar/image/AvatarImage.d.ts:6`

#### Declaration

```typescript
(componentProps: AvatarImage.Props) => JSX.Element
```

<a id="api-4176617461722e496d6167652e2470726f70732e63726f73734f726967696e"></a>

<a id="AvatarImage-crossOrigin"></a>

<a id="api-4176617461722e496d6167652e2470726f70732e6f6e4c6f6164696e675374617475734368616e6765"></a>

<a id="AvatarImage-onLoadingStatusChange"></a>

<a id="api-4176617461722e496d6167652e2470726f70732e7265666572726572506f6c696379"></a>

<a id="AvatarImage-referrerPolicy"></a>

<a id="api-4176617461722e496d6167652e2470726f70732e737263536574"></a>

<a id="AvatarImage-srcSet"></a>

<a id="api-4176617461722e496d6167652e2470726f70732e636c617373"></a>

<a id="AvatarImage-class"></a>

<a id="api-4176617461722e496d6167652e2470726f70732e7374796c65"></a>

<a id="AvatarImage-style"></a>

<a id="api-4176617461722e496d6167652e2470726f70732e6b6565704d6f756e746564"></a>

<a id="AvatarImage-keepMounted"></a>

<a id="api-4176617461722e496d6167652e2470726f70732e72656e646572"></a>

<a id="AvatarImage-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| crossOrigin | `JSX.RemoveAttribute \| JSX.HTMLCrossorigin` | No | Unavailable | Source-compatible alias of Solid's `crossorigin`. |
| onLoadingStatusChange | `((status: ImageLoadingStatus) => void) \| undefined` | No | Unavailable |  |
| referrerPolicy | `JSX.RemoveAttribute \| JSX.HTMLReferrerPolicy` | No | Unavailable | Source-compatible alias of Solid's `referrerpolicy`. |
| srcSet | `string \| JSX.RemoveAttribute` | No | Unavailable | Source-compatible alias of Solid's `srcset`. |
| class | `JSX.ClassValue \| ((state: Readonly<AvatarImageState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AvatarImageState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| keepMounted | `boolean \| undefined` | No | false | Load in place and retain the image element, including when loading or failed. |
| render | `ComponentRenderFn<JSX.ImgHTMLAttributes<HTMLImageElement> & JSX.Properties<HTMLImageElement>, AvatarImageState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `align`, `alt`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `attributionsrc`, `autocapitalize`, `autocorrect`, `autofocus`, `border`, `browsingtopics`, `children`, `contenteditable`, `contextmenu`, `crossorigin`, `datatype`, `decoding`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `fetchpriority`, `height`, `hidden`, `hspace`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `intrinsicsize`, `is`, `ismap`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `loading`, `longdesc`, `lowsrc`, `name`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `prop:alt`, `prop:border`, `prop:crossOrigin`, `prop:decoding`, `prop:fetchPriority`, `prop:height`, `prop:hspace`, `prop:isMap`, `prop:loading`, `prop:longDesc`, `prop:lowsrc`, `prop:name`, `prop:referrerPolicy`, `prop:sizes`, `prop:src`, `prop:srcset`, `prop:useMap`, `prop:vspace`, `prop:width`, `property`, `ref`, `referrerpolicy`, `resource`, `role`, `sharedstoragewritable`, `sizes`, `slot`, `spellcheck`, `src`, `srcset`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `usemap`, `virtualkeyboardpolicy`, `vocab`, `vspace`, `width`, `writingsuggestions`

#### Data attributes

<a id="api-417661746172496d61676544617461417474726962757465732e6572726f72"></a>

<a id="api-417661746172496d61676544617461417474726962757465732e6c6f6164696e67"></a>

<a id="api-417661746172496d61676544617461417474726962757465732e7374617274696e675374796c65"></a>

<a id="api-417661746172496d61676544617461417474726962757465732e656e64696e675374796c65"></a>

| Name | Description |
| --- | --- |
| data-error | Present when a keepMounted image failed to load. |
| data-loading | Present while a keepMounted image is loading. |
| data-starting-style |  |
| data-ending-style |  |

#### CSS variables

Metadata status: unavailable.

<a id="api-4176617461722e496d6167652e50726f7073"></a>

<a id="avatarimageprops"></a>

<a id="api-4176617461722e496d6167652e50726f70732e70726f703a616c69676e"></a>

<a id="api-4176617461722e496d6167652e50726f70732e70726f703a616c74"></a>

<a id="api-4176617461722e496d6167652e50726f70732e70726f703a626f72646572"></a>

<a id="api-4176617461722e496d6167652e50726f70732e70726f703a63726f73734f726967696e"></a>

<a id="api-4176617461722e496d6167652e50726f70732e70726f703a6465636f64696e67"></a>

<a id="api-4176617461722e496d6167652e50726f70732e70726f703a66657463685072696f72697479"></a>

<a id="api-4176617461722e496d6167652e50726f70732e70726f703a686569676874"></a>

<a id="api-4176617461722e496d6167652e50726f70732e70726f703a687370616365"></a>

<a id="api-4176617461722e496d6167652e50726f70732e70726f703a69734d6170"></a>

<a id="api-4176617461722e496d6167652e50726f70732e70726f703a6c6f6164696e67"></a>

<a id="api-4176617461722e496d6167652e50726f70732e70726f703a6c6f6e6744657363"></a>

<a id="api-4176617461722e496d6167652e50726f70732e70726f703a6c6f77737263"></a>

<a id="api-4176617461722e496d6167652e50726f70732e70726f703a6e616d65"></a>

<a id="api-4176617461722e496d6167652e50726f70732e70726f703a7265666572726572506f6c696379"></a>

<a id="api-4176617461722e496d6167652e50726f70732e70726f703a73697a6573"></a>

<a id="api-4176617461722e496d6167652e50726f70732e70726f703a737263"></a>

<a id="api-4176617461722e496d6167652e50726f70732e70726f703a737263736574"></a>

<a id="api-4176617461722e496d6167652e50726f70732e70726f703a7573654d6170"></a>

<a id="api-4176617461722e496d6167652e50726f70732e70726f703a767370616365"></a>

<a id="api-4176617461722e496d6167652e50726f70732e70726f703a7769647468"></a>

### Related exported type: Avatar.Image.Props

Declaration: `packages/solid/build/types/avatar/image/AvatarImage.d.ts:23`

#### Declaration

```typescript
AvatarImageProps
```

<a id="api-4176617461722e496d6167652e50726f70732e63726f73734f726967696e"></a>

<a id="AvatarImageProps-crossOrigin"></a>

<a id="api-4176617461722e496d6167652e50726f70732e6f6e4c6f6164696e675374617475734368616e6765"></a>

<a id="AvatarImageProps-onLoadingStatusChange"></a>

<a id="api-4176617461722e496d6167652e50726f70732e7265666572726572506f6c696379"></a>

<a id="AvatarImageProps-referrerPolicy"></a>

<a id="api-4176617461722e496d6167652e50726f70732e737263536574"></a>

<a id="AvatarImageProps-srcSet"></a>

<a id="api-4176617461722e496d6167652e50726f70732e636c617373"></a>

<a id="AvatarImageProps-class"></a>

<a id="api-4176617461722e496d6167652e50726f70732e7374796c65"></a>

<a id="AvatarImageProps-style"></a>

<a id="api-4176617461722e496d6167652e50726f70732e6b6565704d6f756e746564"></a>

<a id="AvatarImageProps-keepMounted"></a>

<a id="api-4176617461722e496d6167652e50726f70732e72656e646572"></a>

<a id="AvatarImageProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| crossOrigin | `JSX.RemoveAttribute \| JSX.HTMLCrossorigin` | No | Unavailable | Source-compatible alias of Solid's `crossorigin`. |
| onLoadingStatusChange | `((status: ImageLoadingStatus) => void) \| undefined` | No | Unavailable |  |
| referrerPolicy | `JSX.RemoveAttribute \| JSX.HTMLReferrerPolicy` | No | Unavailable | Source-compatible alias of Solid's `referrerpolicy`. |
| srcSet | `string \| JSX.RemoveAttribute` | No | Unavailable | Source-compatible alias of Solid's `srcset`. |
| class | `JSX.ClassValue \| ((state: Readonly<AvatarImageState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AvatarImageState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| keepMounted | `boolean \| undefined` | No | false | Load in place and retain the image element, including when loading or failed. |
| render | `ComponentRenderFn<JSX.ImgHTMLAttributes<HTMLImageElement> & JSX.Properties<HTMLImageElement>, AvatarImageState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `align`, `alt`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `attributionsrc`, `autocapitalize`, `autocorrect`, `autofocus`, `border`, `browsingtopics`, `children`, `contenteditable`, `contextmenu`, `crossorigin`, `datatype`, `decoding`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `fetchpriority`, `height`, `hidden`, `hspace`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `intrinsicsize`, `is`, `ismap`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `loading`, `longdesc`, `lowsrc`, `name`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `prop:alt`, `prop:border`, `prop:crossOrigin`, `prop:decoding`, `prop:fetchPriority`, `prop:height`, `prop:hspace`, `prop:isMap`, `prop:loading`, `prop:longDesc`, `prop:lowsrc`, `prop:name`, `prop:referrerPolicy`, `prop:sizes`, `prop:src`, `prop:srcset`, `prop:useMap`, `prop:vspace`, `prop:width`, `property`, `ref`, `referrerpolicy`, `resource`, `role`, `sharedstoragewritable`, `sizes`, `slot`, `spellcheck`, `src`, `srcset`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `usemap`, `virtualkeyboardpolicy`, `vocab`, `vspace`, `width`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4176617461722e496d6167652e5374617465"></a>

<a id="avatarimagestate"></a>

### Related exported type: Avatar.Image.State

Declaration: `packages/solid/build/types/avatar/image/AvatarImage.d.ts:22`

#### Declaration

```typescript
AvatarImageState
```

<a id="api-4176617461722e496d6167652e53746174652e696d6167654c6f6164696e67537461747573"></a>

<a id="AvatarImageState-imageLoadingStatus"></a>

<a id="api-4176617461722e496d6167652e53746174652e7472616e736974696f6e537461747573"></a>

<a id="AvatarImageState-transitionStatus"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| imageLoadingStatus | `ImageLoadingStatus` | Yes | Unavailable |  |
| transitionStatus | `TransitionStatus` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="fallback"></a>

### Fallback

<a id="api-4176617461722e46616c6c6261636b"></a>

<a id="avatarfallback"></a>

### Avatar.Fallback

Shown while the image is unavailable. Renders a `<span>`.

Declaration: `packages/solid/build/types/avatar/fallback/AvatarFallback.d.ts:5`

#### Declaration

```typescript
(componentProps: AvatarFallback.Props) => JSX.Element
```

<a id="api-4176617461722e46616c6c6261636b2e2470726f70732e64656c6179"></a>

<a id="AvatarFallback-delay"></a>

<a id="api-4176617461722e46616c6c6261636b2e2470726f70732e636c617373"></a>

<a id="AvatarFallback-class"></a>

<a id="api-4176617461722e46616c6c6261636b2e2470726f70732e7374796c65"></a>

<a id="AvatarFallback-style"></a>

<a id="api-4176617461722e46616c6c6261636b2e2470726f70732e72656e646572"></a>

<a id="AvatarFallback-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| delay | `number \| undefined` | No | 0 | Delay before showing the fallback, in milliseconds. |
| class | `JSX.ClassValue \| ((state: Readonly<AvatarFallbackState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AvatarFallbackState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<JSX.HTMLAttributes<HTMLSpanElement> & JSX.Properties<HTMLSpanElement>, AvatarFallbackState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4176617461722e46616c6c6261636b2e50726f7073"></a>

<a id="avatarfallbackprops"></a>

### Related exported type: Avatar.Fallback.Props

Declaration: `packages/solid/build/types/avatar/fallback/AvatarFallback.d.ts:14`

#### Declaration

```typescript
AvatarFallbackProps
```

<a id="api-4176617461722e46616c6c6261636b2e50726f70732e64656c6179"></a>

<a id="AvatarFallbackProps-delay"></a>

<a id="api-4176617461722e46616c6c6261636b2e50726f70732e636c617373"></a>

<a id="AvatarFallbackProps-class"></a>

<a id="api-4176617461722e46616c6c6261636b2e50726f70732e7374796c65"></a>

<a id="AvatarFallbackProps-style"></a>

<a id="api-4176617461722e46616c6c6261636b2e50726f70732e72656e646572"></a>

<a id="AvatarFallbackProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| delay | `number \| undefined` | No | 0 | Delay before showing the fallback, in milliseconds. |
| class | `JSX.ClassValue \| ((state: Readonly<AvatarFallbackState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AvatarFallbackState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<JSX.HTMLAttributes<HTMLSpanElement> & JSX.Properties<HTMLSpanElement>, AvatarFallbackState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4176617461722e46616c6c6261636b2e5374617465"></a>

<a id="avatarfallbackstate"></a>

### Related exported type: Avatar.Fallback.State

Declaration: `packages/solid/build/types/avatar/fallback/AvatarFallback.d.ts:13`

#### Declaration

```typescript
AvatarFallbackState
```

<a id="api-4176617461722e46616c6c6261636b2e53746174652e696d6167654c6f6164696e67537461747573"></a>

<a id="AvatarFallbackState-imageLoadingStatus"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| imageLoadingStatus | `ImageLoadingStatus` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

[//]: # "@exclude-table-of-contents"

<a id="additional-types"></a>

## Additional types

<a id="api-496d6167654c6f6164696e67537461747573"></a>

<a id="imageloadingstatus"></a>

### ImageLoadingStatus

Declaration: `packages/solid/build/types/avatar/root/AvatarRoot.d.ts:5`

#### Declaration

```typescript
ImageLoadingStatus
```

Inherited DOM attributes: `__@iterator@106`, `anchor`, `at`, `big`, `blink`, `bold`, `charAt`, `charCodeAt`, `codePointAt`, `concat`, `endsWith`, `fixed`, `fontcolor`, `fontsize`, `includes`, `indexOf`, `isWellFormed`, `italics`, `lastIndexOf`, `length`, `link`, `localeCompare`, `match`, `matchAll`, `normalize`, `padEnd`, `padStart`, `repeat`, `replace`, `replaceAll`, `search`, `slice`, `small`, `split`, `startsWith`, `strike`, `sub`, `substr`, `substring`, `sup`, `toLocaleLowerCase`, `toLocaleUpperCase`, `toLowerCase`, `toString`, `toUpperCase`, `toWellFormed`, `trim`, `trimEnd`, `trimLeft`, `trimRight`, `trimStart`, `valueOf`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

