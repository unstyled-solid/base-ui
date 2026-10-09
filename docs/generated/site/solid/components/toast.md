<a id="toast"></a>

# Toast

Generates toast notifications.

[Open mounted Solid demo: toast/hero](/solid/components/toast)

<a id="anatomy"></a>

## Anatomy

Import the component and assemble its parts:

```tsx
import { Toast } from '@unstyled-solid/base-ui/toast';
<Toast.Provider>
  <Toast.Portal>
    <Toast.Viewport>
      {/* Stacked toasts */}
      <Toast.Root>
        <Toast.Content>
          <Toast.Title />
          <Toast.Description />
          <Toast.Action />
          <Toast.Close />
        </Toast.Content>
      </Toast.Root>

      {/* Anchored toasts */}
      <Toast.Positioner>
        <Toast.Root>
          <Toast.Arrow />
          <Toast.Content>
            <Toast.Title />
            <Toast.Description />
            <Toast.Action />
            <Toast.Close />
          </Toast.Content>
        </Toast.Root>
      </Toast.Positioner>
    </Toast.Viewport>
  </Toast.Portal>
</Toast.Provider>;
```

<a id="general-usage"></a>

## General usage

- `<Toast.Provider>` can be wrapped around your entire app, ensuring all toasts are rendered in the same viewport.
- <kbd>F6</kbd> lets users jump into the toast viewport landmark region to navigate toasts with
  keyboard focus.
- The `data-base-ui-swipe-ignore` attribute can be manually added to elements inside of a toast to prevent swipe-to-dismiss gestures on them. Interactive elements are automatically prevented.

<a id="global-manager"></a>

## Global manager

A global toast manager can be created by passing the `toastManager` prop to the `<Toast.Provider>`.
This enables you to queue a toast from anywhere in the app (such as in functions outside the component tree) while still using the same toast renderer.

The created `toastManager` exposes the same `add`, `close`, `update`, and `promise` methods as the `Toast.useToastManager()` utility. Unlike the utility, it does not return the reactive `toasts` array, since it lives outside the component tree.

```tsx
const toastManager = Toast.createToastManager();
```

```tsx
<Toast.Provider toastManager={toastManager}>
```

<a id="stacking-and-animations"></a>

## Stacking and animations

The `--toast-index` CSS variable can be used to determine the stacking order of the toasts.
The 0th index toast appears at the front.

```css
.Toast {
  z-index: calc(1000 - var(--toast-index));
  transform: scale(calc(max(0, 1 - (var(--toast-index) * 0.1))));
}
```

The `--toast-offset-y` CSS variable can be used to determine the vertical offset of the toasts when positioned absolutely with a translation offset — this is usually used with the `data-expanded` attribute, present when the toast viewport is being hovered or has focus.

```css
.Toast[data-expanded] {
  transform: translateY(var(--toast-offset-y));
}
```

While the stack is collapsed, each toast's height can be clamped to the frontmost toast's height using the `--toast-frontmost-height` CSS variable, and `<Toast.Content>` is used to hide the content of the toasts behind it.
The `data-behind` attribute marks content that sits behind the frontmost toast and pairs with the `data-expanded` attribute so the content fades back in when the viewport expands:

```css
.Toast {
  height: var(--toast-frontmost-height, var(--toast-height));
}

.ToastContent {
  transition: opacity 0.25s;
}

.ToastContent[data-behind] {
  opacity: 0;
}

.ToastContent[data-expanded] {
  opacity: 1;
}
```

The `--toast-swipe-movement-x` and `--toast-swipe-movement-y` CSS variables are used to determine the swipe movement of the toasts in order to add a translation offset.

```css
.Toast {
  transform: scale(calc(max(0, 1 - (var(--toast-index) * 0.1))))
    translateX(var(--toast-swipe-movement-x))
    translateY(calc(var(--toast-swipe-movement-y) + (var(--toast-index) * -20%)));
}
```

The `data-swipe-direction` attribute can be used to determine the swipe direction of the toasts to add a translation offset upon dismissal.

```css
&[data-ending-style] {
  opacity: 0;

  &[data-swipe-direction='up'] {
    transform: translateY(calc(var(--toast-swipe-movement-y) - 150%));
  }

  &[data-swipe-direction='down'] {
    transform: translateY(calc(var(--toast-swipe-movement-y) + 150%));
  }
  /* Note: --offset-y is defined locally in these examples and derives from
   --toast-offset-y, --toast-index, and swipe movement values */

  &[data-swipe-direction='left'] {
    transform: translateX(calc(var(--toast-swipe-movement-x) - 150%))
      translateY(var(--offset-y));
  }

  &[data-swipe-direction='right'] {
    transform: translateX(calc(var(--toast-swipe-movement-x) + 150%))
      translateY(var(--offset-y));
  }
}
```

The `data-limited` attribute indicates that the toast exceeded the `limit` option.
Limited toasts remain mounted with the HTML `inert` attribute, so this is useful for hiding them or animating them differently.

The `updateKey` property increments when a toast is updated or upserted.
This can be used to replay attention-grabbing styles by switching animation names or, when remounting is acceptable, by using a keyed Solid `key`.

<a id="examples"></a>

## Examples

<a id="anchored-toasts"></a>

### Anchored toasts

Toasts can be anchored to a specific element using `<Toast.Positioner>` and the `positionerProps` option when adding a toast. This is useful for showing contextual feedback like transient "Copied" toasts that appear near the button that triggered the action.

Anchored toasts should be rendered in a separate `<Toast.Provider>` from stacked toasts. A global toast manager can be created for each to manage them separately throughout your app:

```tsx
import { For } from 'solid-js';
const anchoredToastManager = Toast.createToastManager();
const stackedToastManager = Toast.createToastManager();
function App() {
  return (
    <>
      <Toast.Provider toastManager={anchoredToastManager}>
        <AnchoredToasts />
      </Toast.Provider>
      <Toast.Provider toastManager={stackedToastManager}>
        <StackedToasts />
      </Toast.Provider>

      {/* App content */}
    </>
  );
}
function AnchoredToasts() {
  const toastManager = Toast.useToastManager();
  return (
    <Toast.Portal>
      <Toast.Viewport>
        <For each={toastManager.toasts}>
          {(toast) => (
            <Toast.Positioner toast={toast}>
              <Toast.Root toast={toast}>{/* ... */}</Toast.Root>
            </Toast.Positioner>
          )}
        </For>
      </Toast.Viewport>
    </Toast.Portal>
  );
}
function StackedToasts() {
  const toastManager = Toast.useToastManager();
  return (
    <Toast.Portal>
      <Toast.Viewport>
        <For each={toastManager.toasts}>
          {(toast) => <Toast.Root toast={toast}>{/* ... */}</Toast.Root>}
        </For>
      </Toast.Viewport>
    </Toast.Portal>
  );
}
```

[Open mounted Solid demo: toast/anchored](/solid/components/toast)

<a id="custom-position"></a>

### Custom position

The position of the toasts is controlled by your own CSS.
To change the toasts' position, you can modify the `.Viewport` and `.Root` styles.
A more general component could accept a `data-position` attribute, which the CSS handles for each variation.
The following shows a top-center position:

[Open mounted Solid demo: toast/position](/solid/components/toast)

<a id="undo-action"></a>

### Undo action

When adding a toast, the `actionProps` option can be used to define props for an action button inside of it—this enables the ability to undo an action associated with the toast.

[Open mounted Solid demo: toast/undo](/solid/components/toast)

<a id="promise"></a>

### Promise

An asynchronous toast can be created with three possible states: `loading`, `success`, and `error`.
The `type` string matches these states to change the styling.
Each of the states also accepts the [method options](#toastmanagerupdateoptions) object for more granular control.

[Open mounted Solid demo: toast/promise](/solid/components/toast)

<a id="custom"></a>

### Custom

A toast with custom data can be created by passing any typed object interface to the `data` option.
This enables you to pass any data (including functions) you need to the toast and access it in the toast's rendering logic.

[Open mounted Solid demo: toast/custom](/solid/components/toast)

<a id="deduplicated-toast"></a>

### Deduplicated toast

When you upsert the same toast by `id`, the `updateKey` property increments so a custom renderer can replay a visual animation. This demo alternates CSS animation names from `updateKey`, which keeps the same toast mounted while replaying the pulse.

[Open mounted Solid demo: toast/deduplicate](/solid/components/toast)

<a id="varying-heights"></a>

### Varying heights

Toasts with varying heights are stacked by clamping every toast's height to the frontmost toast at index 0 using the `--toast-frontmost-height` CSS variable, while the `data-behind` attribute hides the content of the toasts behind it.
Avoid sizing `<Toast.Content>` to the root's height (such as `height: 100%`), as resizing it alongside the root cancels the root's height transition.

[Open mounted Solid demo: toast/varying-heights](/solid/components/toast)

<a id="api-reference"></a>

## API reference

<a id="provider"></a>

### Provider

<a id="api-546f6173742e50726f7669646572"></a>

<a id="toastprovider"></a>

### Toast.Provider

Declaration: `packages/solid/build/types/toast/provider/ToastProvider.d.ts:3`

#### Declaration

```typescript
(props: ToastProviderProps) => JSX.Element
```

<a id="api-546f6173742e50726f76696465722e2470726f70732e6c696d6974"></a>

<a id="ToastProvider-limit"></a>

<a id="api-546f6173742e50726f76696465722e2470726f70732e746f6173744d616e61676572"></a>

<a id="ToastProvider-toastManager"></a>

<a id="api-546f6173742e50726f76696465722e2470726f70732e74696d656f7574"></a>

<a id="ToastProvider-timeout"></a>

<a id="api-546f6173742e50726f76696465722e2470726f70732e6368696c6472656e"></a>

<a id="ToastProvider-children"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| limit | `number \| undefined` | No | 3 |  |
| toastManager | `ToastManager<any> \| undefined` | No | Unavailable |  |
| timeout | `number \| undefined` | No | 5000 |  |
| children | `JSX.Element` | No | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-546f6173742e50726f76696465722e50726f7073"></a>

<a id="toastproviderprops"></a>

### Related exported type: Toast.Provider.Props

Declaration: `packages/solid/build/types/toast/provider/ToastProvider.d.ts:13`

#### Declaration

```typescript
ToastProviderProps
```

<a id="api-546f6173742e50726f76696465722e50726f70732e6c696d6974"></a>

<a id="ToastProviderProps-limit"></a>

<a id="api-546f6173742e50726f76696465722e50726f70732e746f6173744d616e61676572"></a>

<a id="ToastProviderProps-toastManager"></a>

<a id="api-546f6173742e50726f76696465722e50726f70732e74696d656f7574"></a>

<a id="ToastProviderProps-timeout"></a>

<a id="api-546f6173742e50726f76696465722e50726f70732e6368696c6472656e"></a>

<a id="ToastProviderProps-children"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| limit | `number \| undefined` | No | Unavailable |  |
| toastManager | `ToastManager<any> \| undefined` | No | Unavailable |  |
| timeout | `number \| undefined` | No | Unavailable |  |
| children | `JSX.Element` | No | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-546f6173742e50726f76696465722e5374617465"></a>

<a id="toastproviderstate"></a>

### Related exported type: Toast.Provider.State

Declaration: `packages/solid/build/types/toast/provider/ToastProvider.d.ts:14`

#### Declaration

```typescript
ToastProviderState
```

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="portal"></a>

### Portal

<a id="api-546f6173742e506f7274616c"></a>

<a id="toastportal"></a>

<a id="api-546f6173742e506f7274616c2e2470726f70732e70726f703a616c69676e"></a>

### Toast.Portal

Declaration: `packages/solid/build/types/toast/portal/ToastPortal.d.ts:3`

#### Declaration

```typescript
(props: ToastPortalProps) => JSX.Element
```

<a id="api-546f6173742e506f7274616c2e2470726f70732e636f6e7461696e6572"></a>

<a id="ToastPortal-container"></a>

<a id="api-546f6173742e506f7274616c2e2470726f70732e636c617373"></a>

<a id="ToastPortal-class"></a>

<a id="api-546f6173742e506f7274616c2e2470726f70732e7374796c65"></a>

<a id="ToastPortal-style"></a>

<a id="api-546f6173742e506f7274616c2e2470726f70732e72656e646572"></a>

<a id="ToastPortal-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| container | `PortalContainer` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<ToastPortalState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ToastPortalState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ToastPortalState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-546f6173742e506f7274616c2e50726f7073"></a>

<a id="toastportalprops"></a>

<a id="api-546f6173742e506f7274616c2e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Toast.Portal.Props

Declaration: `packages/solid/build/types/toast/portal/ToastPortal.d.ts:10`

#### Declaration

```typescript
ToastPortalProps
```

<a id="api-546f6173742e506f7274616c2e50726f70732e636f6e7461696e6572"></a>

<a id="ToastPortalProps-container"></a>

<a id="api-546f6173742e506f7274616c2e50726f70732e636c617373"></a>

<a id="ToastPortalProps-class"></a>

<a id="api-546f6173742e506f7274616c2e50726f70732e7374796c65"></a>

<a id="ToastPortalProps-style"></a>

<a id="api-546f6173742e506f7274616c2e50726f70732e72656e646572"></a>

<a id="ToastPortalProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| container | `PortalContainer` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<ToastPortalState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ToastPortalState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ToastPortalState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-546f6173742e506f7274616c2e5374617465"></a>

<a id="toastportalstate"></a>

### Related exported type: Toast.Portal.State

Declaration: `packages/solid/build/types/toast/portal/ToastPortal.d.ts:11`

#### Declaration

```typescript
ToastPortalState
```

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="viewport"></a>

### Viewport

<a id="api-546f6173742e56696577706f7274"></a>

<a id="toastviewport"></a>

<a id="api-546f6173742e56696577706f72742e2470726f70732e70726f703a616c69676e"></a>

### Toast.Viewport

Declaration: `packages/solid/build/types/toast/viewport/ToastViewport.d.ts:2`

#### Declaration

```typescript
(props: ToastViewportProps) => JSX.Element
```

<a id="api-546f6173742e56696577706f72742e2470726f70732e636c617373"></a>

<a id="ToastViewport-class"></a>

<a id="api-546f6173742e56696577706f72742e2470726f70732e7374796c65"></a>

<a id="ToastViewport-style"></a>

<a id="api-546f6173742e56696577706f72742e2470726f70732e72656e646572"></a>

<a id="ToastViewport-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<ToastViewportState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ToastViewportState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ToastViewportState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-546f61737456696577706f727444617461417474726962757465732e657870616e646564"></a>

| Name | Description |
| --- | --- |
| data-expanded |  |

#### CSS variables

<a id="api-546f61737456696577706f72744373735661726961626c65732e66726f6e746d6f7374486569676874"></a>

| Name | Description |
| --- | --- |
| --toast-frontmost-height |  |

<a id="api-546f6173742e56696577706f72742e50726f7073"></a>

<a id="toastviewportprops"></a>

<a id="api-546f6173742e56696577706f72742e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Toast.Viewport.Props

Declaration: `packages/solid/build/types/toast/viewport/ToastViewport.d.ts:9`

#### Declaration

```typescript
ToastViewportProps
```

<a id="api-546f6173742e56696577706f72742e50726f70732e636c617373"></a>

<a id="ToastViewportProps-class"></a>

<a id="api-546f6173742e56696577706f72742e50726f70732e7374796c65"></a>

<a id="ToastViewportProps-style"></a>

<a id="api-546f6173742e56696577706f72742e50726f70732e72656e646572"></a>

<a id="ToastViewportProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<ToastViewportState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ToastViewportState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ToastViewportState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-546f6173742e56696577706f72742e5374617465"></a>

<a id="toastviewportstate"></a>

### Related exported type: Toast.Viewport.State

Declaration: `packages/solid/build/types/toast/viewport/ToastViewport.d.ts:10`

#### Declaration

```typescript
ToastViewportState
```

<a id="api-546f6173742e56696577706f72742e53746174652e657870616e646564"></a>

<a id="ToastViewportState-expanded"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| expanded | `boolean` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="root"></a>

### Root

<a id="api-546f6173742e526f6f74"></a>

<a id="toastroot"></a>

<a id="api-546f6173742e526f6f742e2470726f70732e70726f703a616c69676e"></a>

### Toast.Root

Declaration: `packages/solid/build/types/toast/root/ToastRoot.d.ts:7`

#### Declaration

```typescript
(props: ToastRootProps) => JSX.Element
```

<a id="api-546f6173742e526f6f742e2470726f70732e7377697065446972656374696f6e"></a>

<a id="ToastRoot-swipeDirection"></a>

<a id="api-546f6173742e526f6f742e2470726f70732e746f617374"></a>

<a id="ToastRoot-toast"></a>

<a id="api-546f6173742e526f6f742e2470726f70732e636c617373"></a>

<a id="ToastRoot-class"></a>

<a id="api-546f6173742e526f6f742e2470726f70732e7374796c65"></a>

<a id="ToastRoot-style"></a>

<a id="api-546f6173742e526f6f742e2470726f70732e72656e646572"></a>

<a id="ToastRoot-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| swipeDirection | `Direction \| Direction[] \| undefined` | No | ['down', 'right'] |  |
| toast | `ToastObject<any>` | Yes | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<ToastRootState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ToastRootState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ToastRootState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-546f617374526f6f7444617461417474726962757465732e657870616e646564"></a>

<a id="api-546f617374526f6f7444617461417474726962757465732e6c696d69746564"></a>

<a id="api-546f617374526f6f7444617461417474726962757465732e7377697065446972656374696f6e"></a>

<a id="api-546f617374526f6f7444617461417474726962757465732e73776970696e67"></a>

<a id="api-546f617374526f6f7444617461417474726962757465732e74797065"></a>

<a id="api-546f617374526f6f7444617461417474726962757465732e7374617274696e675374796c65"></a>

<a id="api-546f617374526f6f7444617461417474726962757465732e656e64696e675374796c65"></a>

| Name | Description |
| --- | --- |
| data-expanded |  |
| data-limited |  |
| data-swipe-direction |  |
| data-swiping |  |
| data-type |  |
| data-starting-style | Present when transitionStatus is 'starting'. |
| data-ending-style | Present when transitionStatus is 'ending'. |

#### CSS variables

<a id="api-546f617374526f6f744373735661726961626c65732e686569676874"></a>

<a id="api-546f617374526f6f744373735661726961626c65732e696e646578"></a>

<a id="api-546f617374526f6f744373735661726961626c65732e6f666673657459"></a>

<a id="api-546f617374526f6f744373735661726961626c65732e73776970654d6f76656d656e7458"></a>

<a id="api-546f617374526f6f744373735661726961626c65732e73776970654d6f76656d656e7459"></a>

| Name | Description |
| --- | --- |
| --toast-height |  |
| --toast-index |  |
| --toast-offset-y |  |
| --toast-swipe-movement-x |  |
| --toast-swipe-movement-y |  |

<a id="api-546f6173742e526f6f742e50726f7073"></a>

<a id="toastrootprops"></a>

<a id="api-546f6173742e526f6f742e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Toast.Root.Props

Declaration: `packages/solid/build/types/toast/root/ToastRoot.d.ts:22`

#### Declaration

```typescript
ToastRootProps
```

<a id="api-546f6173742e526f6f742e50726f70732e7377697065446972656374696f6e"></a>

<a id="ToastRootProps-swipeDirection"></a>

<a id="api-546f6173742e526f6f742e50726f70732e746f617374"></a>

<a id="ToastRootProps-toast"></a>

<a id="api-546f6173742e526f6f742e50726f70732e636c617373"></a>

<a id="ToastRootProps-class"></a>

<a id="api-546f6173742e526f6f742e50726f70732e7374796c65"></a>

<a id="ToastRootProps-style"></a>

<a id="api-546f6173742e526f6f742e50726f70732e72656e646572"></a>

<a id="ToastRootProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| swipeDirection | `Direction \| Direction[] \| undefined` | No | Unavailable |  |
| toast | `ToastObject<any>` | Yes | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<ToastRootState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ToastRootState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ToastRootState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-546f6173742e526f6f742e5374617465"></a>

<a id="toastrootstate"></a>

### Related exported type: Toast.Root.State

Declaration: `packages/solid/build/types/toast/root/ToastRoot.d.ts:23`

#### Declaration

```typescript
ToastRootState
```

<a id="api-546f6173742e526f6f742e53746174652e657870616e646564"></a>

<a id="ToastRootState-expanded"></a>

<a id="api-546f6173742e526f6f742e53746174652e6c696d69746564"></a>

<a id="ToastRootState-limited"></a>

<a id="api-546f6173742e526f6f742e53746174652e7377697065446972656374696f6e"></a>

<a id="ToastRootState-swipeDirection"></a>

<a id="api-546f6173742e526f6f742e53746174652e73776970696e67"></a>

<a id="ToastRootState-swiping"></a>

<a id="api-546f6173742e526f6f742e53746174652e7472616e736974696f6e537461747573"></a>

<a id="ToastRootState-transitionStatus"></a>

<a id="api-546f6173742e526f6f742e53746174652e74797065"></a>

<a id="ToastRootState-type"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| expanded | `boolean` | Yes | Unavailable |  |
| limited | `boolean` | Yes | Unavailable |  |
| swipeDirection | `Direction \| undefined` | Yes | Unavailable |  |
| swiping | `boolean` | Yes | Unavailable |  |
| transitionStatus | `TransitionStatus` | Yes | Unavailable |  |
| type | `string \| undefined` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-546f6173742e526f6f742e546f6173744f626a656374"></a>

<a id="toastroottoastobject"></a>

### Related exported type: Toast.Root.ToastObject

Declaration: `packages/solid/build/types/toast/root/ToastRoot.d.ts:24`

#### Declaration

```typescript
ToastObject<Data>
```

<a id="api-546f6173742e526f6f742e546f6173744f626a6563742e616374696f6e50726f7073"></a>

<a id="ToastRootToastObject-actionProps"></a>

<a id="api-546f6173742e526f6f742e546f6173744f626a6563742e64617461"></a>

<a id="ToastRootToastObject-data"></a>

<a id="api-546f6173742e526f6f742e546f6173744f626a6563742e6465736372697074696f6e"></a>

<a id="ToastRootToastObject-description"></a>

<a id="api-546f6173742e526f6f742e546f6173744f626a6563742e686569676874"></a>

<a id="ToastRootToastObject-height"></a>

<a id="api-546f6173742e526f6f742e546f6173744f626a6563742e6c696d69746564"></a>

<a id="ToastRootToastObject-limited"></a>

<a id="api-546f6173742e526f6f742e546f6173744f626a6563742e6f6e436c6f7365"></a>

<a id="ToastRootToastObject-onClose"></a>

<a id="api-546f6173742e526f6f742e546f6173744f626a6563742e6f6e52656d6f7665"></a>

<a id="ToastRootToastObject-onRemove"></a>

<a id="api-546f6173742e526f6f742e546f6173744f626a6563742e706f736974696f6e657250726f7073"></a>

<a id="ToastRootToastObject-positionerProps"></a>

<a id="api-546f6173742e526f6f742e546f6173744f626a6563742e7072696f72697479"></a>

<a id="ToastRootToastObject-priority"></a>

<a id="api-546f6173742e526f6f742e546f6173744f626a6563742e726566"></a>

<a id="ToastRootToastObject-ref"></a>

<a id="api-546f6173742e526f6f742e546f6173744f626a6563742e7469746c65"></a>

<a id="ToastRootToastObject-title"></a>

<a id="api-546f6173742e526f6f742e546f6173744f626a6563742e7472616e736974696f6e537461747573"></a>

<a id="ToastRootToastObject-transitionStatus"></a>

<a id="api-546f6173742e526f6f742e546f6173744f626a6563742e74797065"></a>

<a id="ToastRootToastObject-type"></a>

<a id="api-546f6173742e526f6f742e546f6173744f626a6563742e7570646174654b6579"></a>

<a id="ToastRootToastObject-updateKey"></a>

<a id="api-546f6173742e526f6f742e546f6173744f626a6563742e74696d656f7574"></a>

<a id="ToastRootToastObject-timeout"></a>

<a id="api-546f6173742e526f6f742e546f6173744f626a6563742e6964"></a>

<a id="ToastRootToastObject-id"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| actionProps | `JSX.ButtonHTMLAttributes<HTMLButtonElement> \| undefined` | No | Unavailable |  |
| data | `Data \| undefined` | No | Unavailable |  |
| description | `JSX.Element` | No | Unavailable |  |
| height | `number \| undefined` | No | Unavailable |  |
| limited | `boolean \| undefined` | No | Unavailable |  |
| onClose | `(() => void) \| undefined` | No | Unavailable |  |
| onRemove | `(() => void) \| undefined` | No | Unavailable |  |
| positionerProps | `ToastManagerPositionerProps \| undefined` | No | Unavailable |  |
| priority | `"high" \| "low" \| undefined` | No | Unavailable |  |
| ref | `(() => HTMLElement \| null) \| undefined` | No | Unavailable | Native element accessor; no React ref object. |
| title | `JSX.Element` | No | Unavailable |  |
| transitionStatus | `"starting" \| "ending" \| undefined` | No | Unavailable |  |
| type | `string \| undefined` | No | Unavailable |  |
| updateKey | `number \| undefined` | No | Unavailable |  |
| timeout | `number \| undefined` | No | Unavailable |  |
| id | `string` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="content"></a>

### Content

<a id="api-546f6173742e436f6e74656e74"></a>

<a id="toastcontent"></a>

<a id="api-546f6173742e436f6e74656e742e2470726f70732e70726f703a616c69676e"></a>

### Toast.Content

Declaration: `packages/solid/build/types/toast/content/ToastContent.d.ts:2`

#### Declaration

```typescript
(props: ToastContentProps) => JSX.Element
```

<a id="api-546f6173742e436f6e74656e742e2470726f70732e636c617373"></a>

<a id="ToastContent-class"></a>

<a id="api-546f6173742e436f6e74656e742e2470726f70732e7374796c65"></a>

<a id="ToastContent-style"></a>

<a id="api-546f6173742e436f6e74656e742e2470726f70732e72656e646572"></a>

<a id="ToastContent-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<ToastContentState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ToastContentState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ToastContentState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-546f617374436f6e74656e7444617461417474726962757465732e626568696e64"></a>

<a id="api-546f617374436f6e74656e7444617461417474726962757465732e657870616e646564"></a>

| Name | Description |
| --- | --- |
| data-behind |  |
| data-expanded |  |

#### CSS variables

Metadata status: unavailable.

<a id="api-546f6173742e436f6e74656e742e50726f7073"></a>

<a id="toastcontentprops"></a>

<a id="api-546f6173742e436f6e74656e742e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Toast.Content.Props

Declaration: `packages/solid/build/types/toast/content/ToastContent.d.ts:10`

#### Declaration

```typescript
ToastContentProps
```

<a id="api-546f6173742e436f6e74656e742e50726f70732e636c617373"></a>

<a id="ToastContentProps-class"></a>

<a id="api-546f6173742e436f6e74656e742e50726f70732e7374796c65"></a>

<a id="ToastContentProps-style"></a>

<a id="api-546f6173742e436f6e74656e742e50726f70732e72656e646572"></a>

<a id="ToastContentProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<ToastContentState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ToastContentState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ToastContentState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-546f6173742e436f6e74656e742e5374617465"></a>

<a id="toastcontentstate"></a>

### Related exported type: Toast.Content.State

Declaration: `packages/solid/build/types/toast/content/ToastContent.d.ts:11`

#### Declaration

```typescript
ToastContentState
```

<a id="api-546f6173742e436f6e74656e742e53746174652e626568696e64"></a>

<a id="ToastContentState-behind"></a>

<a id="api-546f6173742e436f6e74656e742e53746174652e657870616e646564"></a>

<a id="ToastContentState-expanded"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| behind | `boolean` | Yes | Unavailable |  |
| expanded | `boolean` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="title"></a>

### Title

<a id="api-546f6173742e5469746c65"></a>

<a id="toasttitle"></a>

<a id="api-546f6173742e5469746c652e2470726f70732e70726f703a616c69676e"></a>

### Toast.Title

Declaration: `packages/solid/build/types/toast/title/ToastTitle.d.ts:3`

#### Declaration

```typescript
(props: ToastTitleProps) => JSX.Element
```

<a id="api-546f6173742e5469746c652e2470726f70732e636c617373"></a>

<a id="ToastTitle-class"></a>

<a id="api-546f6173742e5469746c652e2470726f70732e7374796c65"></a>

<a id="ToastTitle-style"></a>

<a id="api-546f6173742e5469746c652e2470726f70732e72656e646572"></a>

<a id="ToastTitle-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<ToastTitleState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ToastTitleState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ToastTitleState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-546f6173745469746c6544617461417474726962757465732e74797065"></a>

| Name | Description |
| --- | --- |
| data-type |  |

#### CSS variables

Metadata status: unavailable.

<a id="api-546f6173742e5469746c652e50726f7073"></a>

<a id="toasttitleprops"></a>

<a id="api-546f6173742e5469746c652e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Toast.Title.Props

Declaration: `packages/solid/build/types/toast/title/ToastTitle.d.ts:9`

#### Declaration

```typescript
ToastTitleProps
```

<a id="api-546f6173742e5469746c652e50726f70732e636c617373"></a>

<a id="ToastTitleProps-class"></a>

<a id="api-546f6173742e5469746c652e50726f70732e7374796c65"></a>

<a id="ToastTitleProps-style"></a>

<a id="api-546f6173742e5469746c652e50726f70732e72656e646572"></a>

<a id="ToastTitleProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<ToastTitleState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ToastTitleState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ToastTitleState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-546f6173742e5469746c652e5374617465"></a>

<a id="toasttitlestate"></a>

### Related exported type: Toast.Title.State

Declaration: `packages/solid/build/types/toast/title/ToastTitle.d.ts:10`

#### Declaration

```typescript
ToastTitleState
```

<a id="api-546f6173742e5469746c652e53746174652e74797065"></a>

<a id="ToastTitleState-type"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| type | `string \| undefined` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="description"></a>

### Description

<a id="api-546f6173742e4465736372697074696f6e"></a>

<a id="toastdescription"></a>

<a id="api-546f6173742e4465736372697074696f6e2e2470726f70732e70726f703a616c69676e"></a>

### Toast.Description

Declaration: `packages/solid/build/types/toast/description/ToastDescription.d.ts:3`

#### Declaration

```typescript
(props: ToastDescriptionProps) => JSX.Element
```

<a id="api-546f6173742e4465736372697074696f6e2e2470726f70732e636c617373"></a>

<a id="ToastDescription-class"></a>

<a id="api-546f6173742e4465736372697074696f6e2e2470726f70732e7374796c65"></a>

<a id="ToastDescription-style"></a>

<a id="api-546f6173742e4465736372697074696f6e2e2470726f70732e72656e646572"></a>

<a id="ToastDescription-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<ToastDescriptionState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ToastDescriptionState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ToastDescriptionState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-546f6173744465736372697074696f6e44617461417474726962757465732e74797065"></a>

| Name | Description |
| --- | --- |
| data-type |  |

#### CSS variables

Metadata status: unavailable.

<a id="api-546f6173742e4465736372697074696f6e2e50726f7073"></a>

<a id="toastdescriptionprops"></a>

<a id="api-546f6173742e4465736372697074696f6e2e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Toast.Description.Props

Declaration: `packages/solid/build/types/toast/description/ToastDescription.d.ts:9`

#### Declaration

```typescript
ToastDescriptionProps
```

<a id="api-546f6173742e4465736372697074696f6e2e50726f70732e636c617373"></a>

<a id="ToastDescriptionProps-class"></a>

<a id="api-546f6173742e4465736372697074696f6e2e50726f70732e7374796c65"></a>

<a id="ToastDescriptionProps-style"></a>

<a id="api-546f6173742e4465736372697074696f6e2e50726f70732e72656e646572"></a>

<a id="ToastDescriptionProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<ToastDescriptionState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ToastDescriptionState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ToastDescriptionState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-546f6173742e4465736372697074696f6e2e5374617465"></a>

<a id="toastdescriptionstate"></a>

### Related exported type: Toast.Description.State

Declaration: `packages/solid/build/types/toast/description/ToastDescription.d.ts:10`

#### Declaration

```typescript
ToastDescriptionState
```

<a id="api-546f6173742e4465736372697074696f6e2e53746174652e74797065"></a>

<a id="ToastDescriptionState-type"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| type | `string \| undefined` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="action"></a>

### Action

<a id="api-546f6173742e416374696f6e"></a>

<a id="toastaction"></a>

<a id="api-546f6173742e416374696f6e2e2470726f70732e70726f703a64697361626c6564"></a>

<a id="api-546f6173742e416374696f6e2e2470726f70732e70726f703a666f726d416374696f6e"></a>

<a id="api-546f6173742e416374696f6e2e2470726f70732e70726f703a666f726d456e6374797065"></a>

<a id="api-546f6173742e416374696f6e2e2470726f70732e70726f703a666f726d4d6574686f64"></a>

<a id="api-546f6173742e416374696f6e2e2470726f70732e70726f703a666f726d4e6f56616c6964617465"></a>

<a id="api-546f6173742e416374696f6e2e2470726f70732e70726f703a666f726d546172676574"></a>

<a id="api-546f6173742e416374696f6e2e2470726f70732e70726f703a6e616d65"></a>

<a id="api-546f6173742e416374696f6e2e2470726f70732e70726f703a706f706f766572546172676574416374696f6e"></a>

<a id="api-546f6173742e416374696f6e2e2470726f70732e70726f703a706f706f766572546172676574456c656d656e74"></a>

<a id="api-546f6173742e416374696f6e2e2470726f70732e70726f703a74797065"></a>

<a id="api-546f6173742e416374696f6e2e2470726f70732e70726f703a76616c7565"></a>

### Toast.Action

Declaration: `packages/solid/build/types/toast/action/ToastAction.d.ts:2`

#### Declaration

```typescript
(props: ToastActionProps) => JSX.Element
```

<a id="api-546f6173742e416374696f6e2e2470726f70732e6e6174697665427574746f6e"></a>

<a id="ToastAction-nativeButton"></a>

<a id="api-546f6173742e416374696f6e2e2470726f70732e636c617373"></a>

<a id="ToastAction-class"></a>

<a id="api-546f6173742e416374696f6e2e2470726f70732e7374796c65"></a>

<a id="ToastAction-style"></a>

<a id="api-546f6173742e416374696f6e2e2470726f70732e72656e646572"></a>

<a id="ToastAction-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| nativeButton | `boolean \| undefined` | No | true | Whether the rendered host is a native button. Set false when supplying a non-button host through render. |
| class | `JSX.ClassValue \| ((state: Readonly<ToastActionState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ToastActionState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ToastActionState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `command`, `commandfor`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `disabled`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `form`, `formaction`, `formenctype`, `formmethod`, `formnovalidate`, `formtarget`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `name`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `popovertarget`, `popovertargetaction`, `prefix`, `prop:disabled`, `prop:formAction`, `prop:formEnctype`, `prop:formMethod`, `prop:formNoValidate`, `prop:formTarget`, `prop:name`, `prop:popoverTargetAction`, `prop:popoverTargetElement`, `prop:type`, `prop:value`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `type`, `typeof`, `value`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-546f617374416374696f6e44617461417474726962757465732e74797065"></a>

| Name | Description |
| --- | --- |
| data-type |  |

#### CSS variables

Metadata status: unavailable.

<a id="api-546f6173742e416374696f6e2e50726f7073"></a>

<a id="toastactionprops"></a>

<a id="api-546f6173742e416374696f6e2e50726f70732e70726f703a64697361626c6564"></a>

<a id="api-546f6173742e416374696f6e2e50726f70732e70726f703a666f726d416374696f6e"></a>

<a id="api-546f6173742e416374696f6e2e50726f70732e70726f703a666f726d456e6374797065"></a>

<a id="api-546f6173742e416374696f6e2e50726f70732e70726f703a666f726d4d6574686f64"></a>

<a id="api-546f6173742e416374696f6e2e50726f70732e70726f703a666f726d4e6f56616c6964617465"></a>

<a id="api-546f6173742e416374696f6e2e50726f70732e70726f703a666f726d546172676574"></a>

<a id="api-546f6173742e416374696f6e2e50726f70732e70726f703a6e616d65"></a>

<a id="api-546f6173742e416374696f6e2e50726f70732e70726f703a706f706f766572546172676574416374696f6e"></a>

<a id="api-546f6173742e416374696f6e2e50726f70732e70726f703a706f706f766572546172676574456c656d656e74"></a>

<a id="api-546f6173742e416374696f6e2e50726f70732e70726f703a74797065"></a>

<a id="api-546f6173742e416374696f6e2e50726f70732e70726f703a76616c7565"></a>

### Related exported type: Toast.Action.Props

Declaration: `packages/solid/build/types/toast/action/ToastAction.d.ts:9`

#### Declaration

```typescript
ToastActionProps
```

<a id="api-546f6173742e416374696f6e2e50726f70732e6e6174697665427574746f6e"></a>

<a id="ToastActionProps-nativeButton"></a>

<a id="api-546f6173742e416374696f6e2e50726f70732e636c617373"></a>

<a id="ToastActionProps-class"></a>

<a id="api-546f6173742e416374696f6e2e50726f70732e7374796c65"></a>

<a id="ToastActionProps-style"></a>

<a id="api-546f6173742e416374696f6e2e50726f70732e72656e646572"></a>

<a id="ToastActionProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| nativeButton | `boolean \| undefined` | No | Unavailable | Whether the rendered host is a native button. Set false when supplying a non-button host through render. |
| class | `JSX.ClassValue \| ((state: Readonly<ToastActionState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ToastActionState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ToastActionState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `command`, `commandfor`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `disabled`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `form`, `formaction`, `formenctype`, `formmethod`, `formnovalidate`, `formtarget`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `name`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `popovertarget`, `popovertargetaction`, `prefix`, `prop:disabled`, `prop:formAction`, `prop:formEnctype`, `prop:formMethod`, `prop:formNoValidate`, `prop:formTarget`, `prop:name`, `prop:popoverTargetAction`, `prop:popoverTargetElement`, `prop:type`, `prop:value`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `type`, `typeof`, `value`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-546f6173742e416374696f6e2e5374617465"></a>

<a id="toastactionstate"></a>

### Related exported type: Toast.Action.State

Declaration: `packages/solid/build/types/toast/action/ToastAction.d.ts:10`

#### Declaration

```typescript
ToastActionState
```

<a id="api-546f6173742e416374696f6e2e53746174652e74797065"></a>

<a id="ToastActionState-type"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| type | `string \| undefined` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="close"></a>

### Close

<a id="api-546f6173742e436c6f7365"></a>

<a id="toastclose"></a>

<a id="api-546f6173742e436c6f73652e2470726f70732e70726f703a64697361626c6564"></a>

<a id="api-546f6173742e436c6f73652e2470726f70732e70726f703a666f726d416374696f6e"></a>

<a id="api-546f6173742e436c6f73652e2470726f70732e70726f703a666f726d456e6374797065"></a>

<a id="api-546f6173742e436c6f73652e2470726f70732e70726f703a666f726d4d6574686f64"></a>

<a id="api-546f6173742e436c6f73652e2470726f70732e70726f703a666f726d4e6f56616c6964617465"></a>

<a id="api-546f6173742e436c6f73652e2470726f70732e70726f703a666f726d546172676574"></a>

<a id="api-546f6173742e436c6f73652e2470726f70732e70726f703a6e616d65"></a>

<a id="api-546f6173742e436c6f73652e2470726f70732e70726f703a706f706f766572546172676574416374696f6e"></a>

<a id="api-546f6173742e436c6f73652e2470726f70732e70726f703a706f706f766572546172676574456c656d656e74"></a>

<a id="api-546f6173742e436c6f73652e2470726f70732e70726f703a74797065"></a>

<a id="api-546f6173742e436c6f73652e2470726f70732e70726f703a76616c7565"></a>

### Toast.Close

Declaration: `packages/solid/build/types/toast/close/ToastClose.d.ts:2`

#### Declaration

```typescript
(props: ToastCloseProps) => JSX.Element
```

<a id="api-546f6173742e436c6f73652e2470726f70732e6e6174697665427574746f6e"></a>

<a id="ToastClose-nativeButton"></a>

<a id="api-546f6173742e436c6f73652e2470726f70732e636c617373"></a>

<a id="ToastClose-class"></a>

<a id="api-546f6173742e436c6f73652e2470726f70732e7374796c65"></a>

<a id="ToastClose-style"></a>

<a id="api-546f6173742e436c6f73652e2470726f70732e72656e646572"></a>

<a id="ToastClose-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| nativeButton | `boolean \| undefined` | No | true | Whether the rendered host is a native button. Set false when supplying a non-button host through render. |
| class | `JSX.ClassValue \| ((state: Readonly<ToastCloseState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ToastCloseState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ToastCloseState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `command`, `commandfor`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `disabled`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `form`, `formaction`, `formenctype`, `formmethod`, `formnovalidate`, `formtarget`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `name`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `popovertarget`, `popovertargetaction`, `prefix`, `prop:disabled`, `prop:formAction`, `prop:formEnctype`, `prop:formMethod`, `prop:formNoValidate`, `prop:formTarget`, `prop:name`, `prop:popoverTargetAction`, `prop:popoverTargetElement`, `prop:type`, `prop:value`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `type`, `typeof`, `value`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-546f617374436c6f736544617461417474726962757465732e74797065"></a>

| Name | Description |
| --- | --- |
| data-type |  |

#### CSS variables

Metadata status: unavailable.

<a id="api-546f6173742e436c6f73652e50726f7073"></a>

<a id="toastcloseprops"></a>

<a id="api-546f6173742e436c6f73652e50726f70732e70726f703a64697361626c6564"></a>

<a id="api-546f6173742e436c6f73652e50726f70732e70726f703a666f726d416374696f6e"></a>

<a id="api-546f6173742e436c6f73652e50726f70732e70726f703a666f726d456e6374797065"></a>

<a id="api-546f6173742e436c6f73652e50726f70732e70726f703a666f726d4d6574686f64"></a>

<a id="api-546f6173742e436c6f73652e50726f70732e70726f703a666f726d4e6f56616c6964617465"></a>

<a id="api-546f6173742e436c6f73652e50726f70732e70726f703a666f726d546172676574"></a>

<a id="api-546f6173742e436c6f73652e50726f70732e70726f703a6e616d65"></a>

<a id="api-546f6173742e436c6f73652e50726f70732e70726f703a706f706f766572546172676574416374696f6e"></a>

<a id="api-546f6173742e436c6f73652e50726f70732e70726f703a706f706f766572546172676574456c656d656e74"></a>

<a id="api-546f6173742e436c6f73652e50726f70732e70726f703a74797065"></a>

<a id="api-546f6173742e436c6f73652e50726f70732e70726f703a76616c7565"></a>

### Related exported type: Toast.Close.Props

Declaration: `packages/solid/build/types/toast/close/ToastClose.d.ts:9`

#### Declaration

```typescript
ToastCloseProps
```

<a id="api-546f6173742e436c6f73652e50726f70732e6e6174697665427574746f6e"></a>

<a id="ToastCloseProps-nativeButton"></a>

<a id="api-546f6173742e436c6f73652e50726f70732e636c617373"></a>

<a id="ToastCloseProps-class"></a>

<a id="api-546f6173742e436c6f73652e50726f70732e7374796c65"></a>

<a id="ToastCloseProps-style"></a>

<a id="api-546f6173742e436c6f73652e50726f70732e72656e646572"></a>

<a id="ToastCloseProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| nativeButton | `boolean \| undefined` | No | Unavailable | Whether the rendered host is a native button. Set false when supplying a non-button host through render. |
| class | `JSX.ClassValue \| ((state: Readonly<ToastCloseState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ToastCloseState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ToastCloseState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `command`, `commandfor`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `disabled`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `form`, `formaction`, `formenctype`, `formmethod`, `formnovalidate`, `formtarget`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `name`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `popovertarget`, `popovertargetaction`, `prefix`, `prop:disabled`, `prop:formAction`, `prop:formEnctype`, `prop:formMethod`, `prop:formNoValidate`, `prop:formTarget`, `prop:name`, `prop:popoverTargetAction`, `prop:popoverTargetElement`, `prop:type`, `prop:value`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `type`, `typeof`, `value`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-546f6173742e436c6f73652e5374617465"></a>

<a id="toastclosestate"></a>

### Related exported type: Toast.Close.State

Declaration: `packages/solid/build/types/toast/close/ToastClose.d.ts:10`

#### Declaration

```typescript
ToastCloseState
```

<a id="api-546f6173742e436c6f73652e53746174652e74797065"></a>

<a id="ToastCloseState-type"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| type | `string \| undefined` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="positioner"></a>

### Positioner

<a id="api-546f6173742e506f736974696f6e6572"></a>

<a id="toastpositioner"></a>

<a id="api-546f6173742e506f736974696f6e65722e2470726f70732e70726f703a616c69676e"></a>

### Toast.Positioner

Declaration: `packages/solid/build/types/toast/positioner/ToastPositioner.d.ts:4`

#### Declaration

```typescript
(props: ToastPositionerProps) => JSX.Element
```

<a id="api-546f6173742e506f736974696f6e65722e2470726f70732e64697361626c65416e63686f72547261636b696e67"></a>

<a id="ToastPositioner-disableAnchorTracking"></a>

<a id="api-546f6173742e506f736974696f6e65722e2470726f70732e746f617374"></a>

<a id="ToastPositioner-toast"></a>

<a id="api-546f6173742e506f736974696f6e65722e2470726f70732e616c69676e"></a>

<a id="ToastPositioner-align"></a>

<a id="api-546f6173742e506f736974696f6e65722e2470726f70732e616c69676e4f6666736574"></a>

<a id="ToastPositioner-alignOffset"></a>

<a id="api-546f6173742e506f736974696f6e65722e2470726f70732e73696465"></a>

<a id="ToastPositioner-side"></a>

<a id="api-546f6173742e506f736974696f6e65722e2470726f70732e736964654f6666736574"></a>

<a id="ToastPositioner-sideOffset"></a>

<a id="api-546f6173742e506f736974696f6e65722e2470726f70732e6172726f7750616464696e67"></a>

<a id="ToastPositioner-arrowPadding"></a>

<a id="api-546f6173742e506f736974696f6e65722e2470726f70732e616e63686f72"></a>

<a id="ToastPositioner-anchor"></a>

<a id="api-546f6173742e506f736974696f6e65722e2470726f70732e636f6c6c6973696f6e41766f6964616e6365"></a>

<a id="ToastPositioner-collisionAvoidance"></a>

<a id="api-546f6173742e506f736974696f6e65722e2470726f70732e636f6c6c6973696f6e426f756e64617279"></a>

<a id="ToastPositioner-collisionBoundary"></a>

<a id="api-546f6173742e506f736974696f6e65722e2470726f70732e636f6c6c6973696f6e50616464696e67"></a>

<a id="ToastPositioner-collisionPadding"></a>

<a id="api-546f6173742e506f736974696f6e65722e2470726f70732e737469636b79"></a>

<a id="ToastPositioner-sticky"></a>

<a id="api-546f6173742e506f736974696f6e65722e2470726f70732e706f736974696f6e4d6574686f64"></a>

<a id="ToastPositioner-positionMethod"></a>

<a id="api-546f6173742e506f736974696f6e65722e2470726f70732e636c617373"></a>

<a id="ToastPositioner-class"></a>

<a id="api-546f6173742e506f736974696f6e65722e2470726f70732e7374796c65"></a>

<a id="ToastPositioner-style"></a>

<a id="api-546f6173742e506f736974696f6e65722e2470726f70732e72656e646572"></a>

<a id="ToastPositioner-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| disableAnchorTracking | `boolean \| undefined` | No | Unavailable | Disables ancestor-scroll, element-resize and layout-shift observation used for automatic positioning updates. |
| toast | `ToastObject<any>` | Yes | Unavailable |  |
| align | `Align \| undefined` | No | Unavailable | Preferred alignment along the anchor’s side. Collision handling can change the resolved alignment. |
| alignOffset | `number \| OffsetFunction \| undefined` | No | Unavailable | Offset along the alignment axis, in pixels. A callback receives anchor and positioner dimensions plus the side and alignment. |
| side | `Side \| undefined` | No | Unavailable | Preferred side of the anchor. Logical inline sides follow the text direction; collision handling can change the resolved side. |
| sideOffset | `number \| OffsetFunction \| undefined` | No | Unavailable | Distance from the anchor along the side axis, in pixels. A callback receives anchor and positioner dimensions plus the side and alignment. |
| arrowPadding | `number \| undefined` | No | Unavailable | Minimum padding in pixels between the arrow and the floating element’s edges. |
| anchor | `Element \| null \| undefined` | No | Unavailable |  |
| collisionAvoidance | `{ side?: "flip" \| "shift" \| "none"; align?: "flip" \| "shift" \| "none"; fallbackAxisSide?: "start" \| "end" \| "none"; } \| undefined` | No | Unavailable | Controls flipping or shifting along the side and alignment axes, including fallback placement on the perpendicular axis. |
| collisionBoundary | `Boundary \| "clipping-ancestors" \| undefined` | No | Unavailable | Boundary used to detect overflow. The clipping-ancestors value uses clipping ancestors as the overflow boundary. |
| collisionPadding | `Padding \| undefined` | No | Unavailable | Space in pixels reserved inside the collision boundary, either for all edges or per edge. |
| sticky | `boolean \| undefined` | No | Unavailable | Allows shifting along the side axis without the usual limitShift limiter. |
| positionMethod | `"fixed" \| "absolute" \| undefined` | No | Unavailable | CSS positioning strategy used by the floating element: absolute or fixed. |
| class | `JSX.ClassValue \| ((state: Readonly<ToastPositionerState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ToastPositionerState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ToastPositionerState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-546f617374506f736974696f6e657244617461417474726962757465732e616e63686f7248696464656e"></a>

<a id="api-546f617374506f736974696f6e657244617461417474726962757465732e616c69676e"></a>

<a id="api-546f617374506f736974696f6e657244617461417474726962757465732e73696465"></a>

| Name | Description |
| --- | --- |
| data-anchor-hidden |  |
| data-align |  |
| data-side |  |

#### CSS variables

<a id="api-546f617374506f736974696f6e65724373735661726961626c65732e616e63686f72486569676874"></a>

<a id="api-546f617374506f736974696f6e65724373735661726961626c65732e616e63686f725769647468"></a>

<a id="api-546f617374506f736974696f6e65724373735661726961626c65732e617661696c61626c65486569676874"></a>

<a id="api-546f617374506f736974696f6e65724373735661726961626c65732e617661696c61626c655769647468"></a>

<a id="api-546f617374506f736974696f6e65724373735661726961626c65732e7472616e73666f726d4f726967696e"></a>

| Name | Description |
| --- | --- |
| --anchor-height |  |
| --anchor-width |  |
| --available-height |  |
| --available-width |  |
| --transform-origin |  |

<a id="api-546f6173742e506f736974696f6e65722e50726f7073"></a>

<a id="toastpositionerprops"></a>

<a id="api-546f6173742e506f736974696f6e65722e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Toast.Positioner.Props

Declaration: `packages/solid/build/types/toast/positioner/ToastPositioner.d.ts:15`

#### Declaration

```typescript
ToastPositionerProps
```

<a id="api-546f6173742e506f736974696f6e65722e50726f70732e64697361626c65416e63686f72547261636b696e67"></a>

<a id="ToastPositionerProps-disableAnchorTracking"></a>

<a id="api-546f6173742e506f736974696f6e65722e50726f70732e746f617374"></a>

<a id="ToastPositionerProps-toast"></a>

<a id="api-546f6173742e506f736974696f6e65722e50726f70732e616c69676e"></a>

<a id="ToastPositionerProps-align"></a>

<a id="api-546f6173742e506f736974696f6e65722e50726f70732e616c69676e4f6666736574"></a>

<a id="ToastPositionerProps-alignOffset"></a>

<a id="api-546f6173742e506f736974696f6e65722e50726f70732e73696465"></a>

<a id="ToastPositionerProps-side"></a>

<a id="api-546f6173742e506f736974696f6e65722e50726f70732e736964654f6666736574"></a>

<a id="ToastPositionerProps-sideOffset"></a>

<a id="api-546f6173742e506f736974696f6e65722e50726f70732e6172726f7750616464696e67"></a>

<a id="ToastPositionerProps-arrowPadding"></a>

<a id="api-546f6173742e506f736974696f6e65722e50726f70732e616e63686f72"></a>

<a id="ToastPositionerProps-anchor"></a>

<a id="api-546f6173742e506f736974696f6e65722e50726f70732e636f6c6c6973696f6e41766f6964616e6365"></a>

<a id="ToastPositionerProps-collisionAvoidance"></a>

<a id="api-546f6173742e506f736974696f6e65722e50726f70732e636f6c6c6973696f6e426f756e64617279"></a>

<a id="ToastPositionerProps-collisionBoundary"></a>

<a id="api-546f6173742e506f736974696f6e65722e50726f70732e636f6c6c6973696f6e50616464696e67"></a>

<a id="ToastPositionerProps-collisionPadding"></a>

<a id="api-546f6173742e506f736974696f6e65722e50726f70732e737469636b79"></a>

<a id="ToastPositionerProps-sticky"></a>

<a id="api-546f6173742e506f736974696f6e65722e50726f70732e706f736974696f6e4d6574686f64"></a>

<a id="ToastPositionerProps-positionMethod"></a>

<a id="api-546f6173742e506f736974696f6e65722e50726f70732e636c617373"></a>

<a id="ToastPositionerProps-class"></a>

<a id="api-546f6173742e506f736974696f6e65722e50726f70732e7374796c65"></a>

<a id="ToastPositionerProps-style"></a>

<a id="api-546f6173742e506f736974696f6e65722e50726f70732e72656e646572"></a>

<a id="ToastPositionerProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| disableAnchorTracking | `boolean \| undefined` | No | Unavailable | Disables ancestor-scroll, element-resize and layout-shift observation used for automatic positioning updates. |
| toast | `ToastObject<any>` | Yes | Unavailable |  |
| align | `Align \| undefined` | No | Unavailable | Preferred alignment along the anchor’s side. Collision handling can change the resolved alignment. |
| alignOffset | `number \| OffsetFunction \| undefined` | No | Unavailable | Offset along the alignment axis, in pixels. A callback receives anchor and positioner dimensions plus the side and alignment. |
| side | `Side \| undefined` | No | Unavailable | Preferred side of the anchor. Logical inline sides follow the text direction; collision handling can change the resolved side. |
| sideOffset | `number \| OffsetFunction \| undefined` | No | Unavailable | Distance from the anchor along the side axis, in pixels. A callback receives anchor and positioner dimensions plus the side and alignment. |
| arrowPadding | `number \| undefined` | No | Unavailable | Minimum padding in pixels between the arrow and the floating element’s edges. |
| anchor | `Element \| null \| undefined` | No | Unavailable |  |
| collisionAvoidance | `{ side?: "flip" \| "shift" \| "none"; align?: "flip" \| "shift" \| "none"; fallbackAxisSide?: "start" \| "end" \| "none"; } \| undefined` | No | Unavailable | Controls flipping or shifting along the side and alignment axes, including fallback placement on the perpendicular axis. |
| collisionBoundary | `Boundary \| "clipping-ancestors" \| undefined` | No | Unavailable | Boundary used to detect overflow. The clipping-ancestors value uses clipping ancestors as the overflow boundary. |
| collisionPadding | `Padding \| undefined` | No | Unavailable | Space in pixels reserved inside the collision boundary, either for all edges or per edge. |
| sticky | `boolean \| undefined` | No | Unavailable | Allows shifting along the side axis without the usual limitShift limiter. |
| positionMethod | `"fixed" \| "absolute" \| undefined` | No | Unavailable | CSS positioning strategy used by the floating element: absolute or fixed. |
| class | `JSX.ClassValue \| ((state: Readonly<ToastPositionerState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ToastPositionerState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ToastPositionerState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-546f6173742e506f736974696f6e65722e5374617465"></a>

<a id="toastpositionerstate"></a>

### Related exported type: Toast.Positioner.State

Declaration: `packages/solid/build/types/toast/positioner/ToastPositioner.d.ts:16`

#### Declaration

```typescript
ToastPositionerState
```

<a id="api-546f6173742e506f736974696f6e65722e53746174652e616e63686f7248696464656e"></a>

<a id="ToastPositionerState-anchorHidden"></a>

<a id="api-546f6173742e506f736974696f6e65722e53746174652e616c69676e"></a>

<a id="ToastPositionerState-align"></a>

<a id="api-546f6173742e506f736974696f6e65722e53746174652e73696465"></a>

<a id="ToastPositionerState-side"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| anchorHidden | `boolean` | Yes | Unavailable |  |
| align | `Align` | Yes | Unavailable |  |
| side | `Side` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="arrow"></a>

### Arrow

<a id="api-546f6173742e4172726f77"></a>

<a id="toastarrow"></a>

<a id="api-546f6173742e4172726f772e2470726f70732e70726f703a616c69676e"></a>

### Toast.Arrow

Declaration: `packages/solid/build/types/toast/arrow/ToastArrow.d.ts:3`

#### Declaration

```typescript
(props: ToastArrowProps) => JSX.Element
```

<a id="api-546f6173742e4172726f772e2470726f70732e636c617373"></a>

<a id="ToastArrow-class"></a>

<a id="api-546f6173742e4172726f772e2470726f70732e7374796c65"></a>

<a id="ToastArrow-style"></a>

<a id="api-546f6173742e4172726f772e2470726f70732e72656e646572"></a>

<a id="ToastArrow-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<ToastArrowState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ToastArrowState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ToastArrowState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-546f6173744172726f7744617461417474726962757465732e756e63656e7465726564"></a>

<a id="api-546f6173744172726f7744617461417474726962757465732e616c69676e"></a>

<a id="api-546f6173744172726f7744617461417474726962757465732e73696465"></a>

| Name | Description |
| --- | --- |
| data-uncentered |  |
| data-align |  |
| data-side |  |

#### CSS variables

Metadata status: unavailable.

<a id="api-546f6173742e4172726f772e50726f7073"></a>

<a id="toastarrowprops"></a>

<a id="api-546f6173742e4172726f772e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Toast.Arrow.Props

Declaration: `packages/solid/build/types/toast/arrow/ToastArrow.d.ts:12`

#### Declaration

```typescript
ToastArrowProps
```

<a id="api-546f6173742e4172726f772e50726f70732e636c617373"></a>

<a id="ToastArrowProps-class"></a>

<a id="api-546f6173742e4172726f772e50726f70732e7374796c65"></a>

<a id="ToastArrowProps-style"></a>

<a id="api-546f6173742e4172726f772e50726f70732e72656e646572"></a>

<a id="ToastArrowProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<ToastArrowState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ToastArrowState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ToastArrowState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-546f6173742e4172726f772e5374617465"></a>

<a id="toastarrowstate"></a>

### Related exported type: Toast.Arrow.State

Declaration: `packages/solid/build/types/toast/arrow/ToastArrow.d.ts:13`

#### Declaration

```typescript
ToastArrowState
```

<a id="api-546f6173742e4172726f772e53746174652e756e63656e7465726564"></a>

<a id="ToastArrowState-uncentered"></a>

<a id="api-546f6173742e4172726f772e53746174652e616c69676e"></a>

<a id="ToastArrowState-align"></a>

<a id="api-546f6173742e4172726f772e53746174652e73696465"></a>

<a id="ToastArrowState-side"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| uncentered | `boolean` | Yes | Unavailable |  |
| align | `Align` | Yes | Unavailable |  |
| side | `Side` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="usetoastmanager"></a>

## useToastManager

Manages toasts, called inside of a `<Toast.Provider>`.

```tsx
const toastManager = Toast.useToastManager();
```

<a id="api-546f6173742e757365546f6173744d616e61676572"></a>

<a id="toastusetoastmanager"></a>

### Toast.useToastManager

Declaration: `packages/solid/build/types/toast/useToastManager.d.ts:4`

#### Declaration

```typescript
<Data extends object = any>() => UseToastManagerReturnValue<Data>
```

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

#### Return value

```typescript
UseToastManagerReturnValue<Data>
```

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| toasts | `ToastObject<Data>[]` | Yes | Unavailable |  |
| add | `<T extends Data = Data>(options: ToastManagerAddOptions<T>) => string` | Yes | Unavailable |  |
| close | `(id?: string) => void` | Yes | Unavailable |  |
| update | `<T extends Data = Data>(id: string, options: ToastManagerUpdateOptions<T> \| ((previous: ToastObject<T>) => ToastManagerUpdateOptions<T>)) => void` | Yes | Unavailable |  |
| promise | `<Value, T extends Data = Data>(promise: Promise<Value>, options: ToastManagerPromiseOptions<Value, T>) => Promise<Value>` | Yes | Unavailable |  |

<a id="api-557365546f6173744d616e6167657252657475726e56616c7565"></a>

<a id="usetoastmanagerreturnvalue"></a>

### Related exported type: UseToastManagerReturnValue

Declaration: `packages/solid/build/types/toast/useToastManager.d.ts:27`

#### Declaration

```typescript
UseToastManagerReturnValue<Data>
```

<a id="api-557365546f6173744d616e6167657252657475726e56616c75652e616464"></a>

<a id="UseToastManagerReturnValue-add"></a>

<a id="api-557365546f6173744d616e6167657252657475726e56616c75652e636c6f7365"></a>

<a id="UseToastManagerReturnValue-close"></a>

<a id="api-557365546f6173744d616e6167657252657475726e56616c75652e70726f6d697365"></a>

<a id="UseToastManagerReturnValue-promise"></a>

<a id="api-557365546f6173744d616e6167657252657475726e56616c75652e746f61737473"></a>

<a id="UseToastManagerReturnValue-toasts"></a>

<a id="api-557365546f6173744d616e6167657252657475726e56616c75652e757064617465"></a>

<a id="UseToastManagerReturnValue-update"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| add | `<T extends Data = Data>(options: ToastManagerAddOptions<T>) => string` | Yes | Unavailable |  |
| close | `(id?: string) => void` | Yes | Unavailable |  |
| promise | `<Value, T extends Data = Data>(promise: Promise<Value>, options: ToastManagerPromiseOptions<Value, T>) => Promise<Value>` | Yes | Unavailable |  |
| toasts | `ToastObject<Data>[]` | Yes | Unavailable |  |
| update | `<T extends Data = Data>(id: string, options: ToastManagerUpdateOptions<T> \| ((previous: ToastObject<T>) => ToastManagerUpdateOptions<T>)) => void` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="add-method"></a>

### `add` method

Creates a toast by adding it to the toast list.

If you pass an `id` that already exists, the existing toast is updated in place instead of creating a duplicate.

Returns a `toastId` that can be used to update or close the toast later.

```tsx
const toastId = toastManager.add({
  description: 'Hello, world!',
});
```

```tsx
function App() {
  const toastManager = Toast.useToastManager();
  return (
    <button
      type="button"
      onClick={() => {
        toastManager.add({
          description: 'Hello, world!',
        });
      }}
    >
      Add toast
    </button>
  );
}
```

For high priority toasts, the `title` and `description` strings are what are used to announce the toast to screen readers.
Screen readers do not announce any extra content rendered inside `<Toast.Root>`, including the `<Toast.Title>` or `<Toast.Description>` components, unless they intentionally navigate to the toast viewport.

<a id="update-method"></a>

### `update` method

Updates the toast with new options.

```tsx
toastManager.update(toastId, {
  description: 'New description',
});
```

Options replace the corresponding values of the toast, including custom `data`, which is replaced as a whole. To derive the update from the current state of the toast, pass a function instead. It receives the current toast and returns the options to apply. Custom `data` is `undefined` when the toast has none yet:

```tsx
toastManager.update(toastId, (prevToast) => ({
  data: prevToast.data && { ...prevToast.data, progress: 100 },
}));
```

<a id="close-method"></a>

### `close` method

Closes the toast, removing it from the toast list after any animations complete.

```tsx
toastManager.close(toastId);
```

Or you can close all toasts at once by not passing an ID:

```tsx
toastManager.close();
```

<a id="promise-method"></a>

### `promise` method

Creates an asynchronous toast with three possible states: `loading`, `success`, and `error`.

```tsx
const promise = toastManager.promise(
  new Promise((resolve) => {
    setTimeout(() => resolve('world!'), 1000);
  }),
  {
    // Each are a shortcut for the `description` option
    loading: 'Loading…',
    success: (data) => `Hello ${data}`,
    error: (err) => `Error: ${err}`,
  },
);
```

Each state also accepts the [method options](#toastmanagerupdateoptions) object to granularly control the toast for each state:

```tsx
const promise = toastManager.promise(
  new Promise((resolve) => {
    setTimeout(() => resolve('world!'), 1000);
  }),
  {
    loading: {
      title: 'Loading…',
      description: 'The promise is loading.',
    },
    success: {
      title: 'Success',
      description: 'The promise resolved successfully.',
    },
    error: {
      title: 'Error',
      description: 'The promise rejected.',
      actionProps: {
        children: 'Contact support',
        onClick() {
          // Redirect to support page
        },
      },
    },
  },
);
```

See full [`promise` method](#ToastuseToastManager-promise)

[//]: # "@exclude-table-of-contents"

<a id="additional-types"></a>

## Additional types

<a id="api-546f6173744d616e616765725570646174654f7074696f6e73"></a>

<a id="toastmanagerupdateoptions"></a>

### ToastManagerUpdateOptions

Declaration: `packages/solid/build/types/toast/useToastManager.d.ts:37`

#### Declaration

```typescript
ToastManagerUpdateOptions<Data>
```

<a id="api-546f6173744d616e616765725570646174654f7074696f6e732e616374696f6e50726f7073"></a>

<a id="ToastManagerUpdateOptions-actionProps"></a>

<a id="api-546f6173744d616e616765725570646174654f7074696f6e732e64617461"></a>

<a id="ToastManagerUpdateOptions-data"></a>

<a id="api-546f6173744d616e616765725570646174654f7074696f6e732e6465736372697074696f6e"></a>

<a id="ToastManagerUpdateOptions-description"></a>

<a id="api-546f6173744d616e616765725570646174654f7074696f6e732e6f6e436c6f7365"></a>

<a id="ToastManagerUpdateOptions-onClose"></a>

<a id="api-546f6173744d616e616765725570646174654f7074696f6e732e6f6e52656d6f7665"></a>

<a id="ToastManagerUpdateOptions-onRemove"></a>

<a id="api-546f6173744d616e616765725570646174654f7074696f6e732e706f736974696f6e657250726f7073"></a>

<a id="ToastManagerUpdateOptions-positionerProps"></a>

<a id="api-546f6173744d616e616765725570646174654f7074696f6e732e7072696f72697479"></a>

<a id="ToastManagerUpdateOptions-priority"></a>

<a id="api-546f6173744d616e616765725570646174654f7074696f6e732e7469746c65"></a>

<a id="ToastManagerUpdateOptions-title"></a>

<a id="api-546f6173744d616e616765725570646174654f7074696f6e732e74797065"></a>

<a id="ToastManagerUpdateOptions-type"></a>

<a id="api-546f6173744d616e616765725570646174654f7074696f6e732e74696d656f7574"></a>

<a id="ToastManagerUpdateOptions-timeout"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| actionProps | `JSX.ButtonHTMLAttributes<HTMLButtonElement> \| undefined` | No | Unavailable |  |
| data | `Data \| undefined` | No | Unavailable |  |
| description | `JSX.Element` | No | Unavailable |  |
| onClose | `(() => void) \| undefined` | No | Unavailable |  |
| onRemove | `(() => void) \| undefined` | No | Unavailable |  |
| positionerProps | `ToastManagerPositionerProps \| undefined` | No | Unavailable |  |
| priority | `"high" \| "low" \| undefined` | No | Unavailable |  |
| title | `JSX.Element` | No | Unavailable |  |
| type | `string \| undefined` | No | Unavailable |  |
| timeout | `number \| undefined` | No | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

