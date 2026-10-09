<a id="drawer"></a>

# Drawer

A panel that slides in from the edge of the screen.

[Open mounted Solid demo: drawer/hero](/solid/components/drawer)

<a id="usage-guidelines"></a>

## Usage guidelines

- **Drawer extends [Dialog](/solid/components/dialog):** It adds gesture support, snap points, and indent effects. If you don't need these, use Dialog instead. A panel that slides in from the edge of the screen and doesn't need gesture support is a positioned Dialog.

<a id="anatomy"></a>

## Anatomy

Import the component and assemble its parts:

```tsx
import { Drawer } from '@unstyled-solid/base-ui/drawer';
<Drawer.Provider>
  <Drawer.IndentBackground />
  <Drawer.Indent>
    <Drawer.Root>
      <Drawer.Trigger />
      <Drawer.SwipeArea />
      <Drawer.Portal>
        <Drawer.Backdrop />
        <Drawer.Viewport>
          <Drawer.Popup>
            <Drawer.Content>
              <Drawer.Title />
              <Drawer.Description />
              <Drawer.Close />
            </Drawer.Content>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  </Drawer.Indent>
</Drawer.Provider>;
```

Drawer supports swipe gestures to dismiss. Set `swipeDirection` to control which direction dismisses the drawer. `<Drawer.Content>` allows text selection of its children without swipe interference when using a mouse pointer.

Add `data-base-ui-swipe-ignore` to a descendant to opt it out of swipe dismissal for all input types. If the element only handles touch drags along one axis, such as a JavaScript carousel, set the value to `x` or `y` so touch drags along the other axis still swipe the drawer.

Use `<Drawer.VirtualKeyboardProvider>` when a bottom sheet contains form fields and you want Base UI to manage keyboard-aware focus and scroll handling for software keyboards. Drawers without this provider are unaffected.

<a id="examples"></a>

## Examples

<a id="state"></a>

### State

By default, Drawer is an uncontrolled component that manages its own state.

```tsx
<Drawer.Root>
  <Drawer.Trigger>Open</Drawer.Trigger>
  <Drawer.Portal>
    <Drawer.Viewport>
      <Drawer.Popup>
        <Drawer.Content>
          <Drawer.Title>Example drawer</Drawer.Title>
          <Drawer.Close>Close</Drawer.Close>
        </Drawer.Content>
      </Drawer.Popup>
    </Drawer.Viewport>
  </Drawer.Portal>
</Drawer.Root>;
```

Use `open` and `onOpenChange` props if you need to access or control the state of the drawer.

```tsx
import { createSignal } from 'solid-js';
const [open, setOpen] = createSignal(false);
return (
  <Drawer.Root open={open()} onOpenChange={setOpen}>
    <Drawer.Trigger>Open</Drawer.Trigger>
    <Drawer.Portal>
      <Drawer.Viewport>
        <Drawer.Popup>
          <Drawer.Content>
            <Drawer.Title>Example drawer</Drawer.Title>
            <Drawer.Close>Close</Drawer.Close>
          </Drawer.Content>
        </Drawer.Popup>
      </Drawer.Viewport>
    </Drawer.Portal>
  </Drawer.Root>
);
```

<a id="position"></a>

### Position

Positioning is handled by your styles. `swipeDirection` defaults to `"down"` for bottom sheets. Use `"up"`, `"left"`, or `"right"` for other drawer positions.

```tsx
<Drawer.Root swipeDirection="right">
```

[Open mounted Solid demo: drawer/position](/solid/components/drawer)

<a id="nested-drawers"></a>

### Nested drawers

Use the `[data-nested-drawer-open]` selector and the `--nested-drawers` CSS variable to style drawers when a nested drawer is open.

This demo stacks nested drawers using a constant peek so the frontmost drawer stays anchored to the bottom while the ones behind it are scaled down and lifted. It also uses the `--drawer-height` and `--drawer-frontmost-height` CSS variables to handle varying drawer heights.

[Open mounted Solid demo: drawer/nested](/solid/components/drawer)

<a id="snap-points"></a>

### Snap points

Use `snapPoints` to snap a bottom sheet drawer to preset heights. Numbers between 0 and 1 represent fractions of the viewport height, and numbers greater than 1 are treated as pixel values. String values support `px` and `rem` units (for example, `'148px'` or `'30rem'`).

```tsx
import { createSignal } from 'solid-js';
const snapPoints = ['148px', 1];
const [snapPoint, setSnapPoint] = createSignal<Drawer.Root.SnapPoint | null>(
  snapPoints[0],
);
<Drawer.Root
  snapPoints={snapPoints}
  snapPoint={snapPoint()}
  onSnapPointChange={setSnapPoint}
>
  {/* ... */}
</Drawer.Root>;
```

Apply the snap point offset in your styles when using vertical drawers:

```css
.DrawerPopup {
  transform: translateY(
    calc(var(--drawer-snap-point-offset) + var(--drawer-swipe-movement-y))
  );
}
```

[Open mounted Solid demo: drawer/snap-points](/solid/components/drawer)

By default, the drawer can skip snap points when swiping quickly. Specify the `snapToSequentialPoints` prop to disable velocity-based skipping so the snap target is determined by drag distance (you can still drag past multiple points).

<a id="virtual-keyboard-aware"></a>

### Virtual keyboard aware

Wrap a bottom sheet in `<Drawer.VirtualKeyboardProvider>` to make it react to software keyboards when it contains form controls. When the keyboard opens, the provider scrolls the body to keep the focused field visible.

- **Keep the popup frame stable:** place header and footer content outside a plain scrollable body.
- **Lift a pinned footer input:** if a footer contains its own input, reserve a footer slot below the scroll area and offset it by `var(--drawer-keyboard-inset, 0px)`. The demo switches the focused footer to `position: fixed` — positioned against the popup, since its `transform` contains fixed descendants — and adds the inset to its bottom padding.
- **Always include the `0px` fallback:** the provider only sets `--drawer-keyboard-inset` while the keyboard is aligned, so a bare `var(--drawer-keyboard-inset)` is invalid before the first alignment and after cleanup.

```tsx
<Drawer.Root>
  <Drawer.VirtualKeyboardProvider>{/* ... */}</Drawer.VirtualKeyboardProvider>
</Drawer.Root>;
```

[Open mounted Solid demo: drawer/virtual-keyboard-aware](/solid/components/drawer)

<a id="indent-effect"></a>

### Indent effect

Scale the background down when any drawer opens by wrapping your app in `<Drawer.Provider>` and use `<Drawer.IndentBackground>` + `<Drawer.Indent>` at the top of your tree. Any `<Drawer.Root>` within the provider notifies it when it mounts, which activates the indent parts (they receive `[data-active]` state attributes).

[Open mounted Solid demo: drawer/indent-provider](/solid/components/drawer)

<a id="non-modal"></a>

### Non-modal

Set `modal={false}` to opt out of focus trapping and `disablePointerDismissal` to keep the drawer open on outside clicks.

[Open mounted Solid demo: drawer/non-modal](/solid/components/drawer)

<a id="mobile-navigation"></a>

### Mobile navigation

You can build a full-screen mobile navigation sheet using Drawer parts, including a flick-to-dismiss from the top gesture.

[Open mounted Solid demo: drawer/mobile-nav](/solid/components/drawer)

<a id="swipe-to-open"></a>

### Swipe to open

Place `<Drawer.SwipeArea>` along the edge of the viewport to enable swipe-to-open gestures.

[Open mounted Solid demo: drawer/swipe-area](/solid/components/drawer)

<a id="close-confirmation"></a>

### Close confirmation

This example shows a nested confirmation dialog that opens if the text entered in the drawer is going to be discarded.

To implement this, both the drawer and the confirmation dialog should be controlled. The confirmation dialog may be opened when the `onOpenChange` callback of the drawer receives a request to close while there is text in the textarea. This way, the confirmation is automatically shown when the user clicks the backdrop, presses the Esc key, clicks a close button, or dismisses the drawer with a swipe gesture.

Use `eventDetails.cancel()` in `onOpenChange` to prevent the drawer from closing while the confirmation prompt is shown.

[Open mounted Solid demo: drawer/close-confirmation](/solid/components/drawer)

<a id="action-sheet-with-separate-destructive-action"></a>

### Action sheet with separate destructive action

This demo builds an action sheet with a grouped list of actions plus a separate destructive action button.

[Open mounted Solid demo: drawer/uncontained](/solid/components/drawer)

<a id="detached-triggers"></a>

### Detached triggers

A drawer can be controlled by a trigger located either inside or outside the `<Drawer.Root>` component. For simple, one-off interactions, place the `<Drawer.Trigger>` inside `<Drawer.Root>`.

However, if defining the drawer's content next to its trigger is not practical, you can use a detached trigger. This involves placing the `<Drawer.Trigger>` outside of `<Drawer.Root>` and linking them with a `handle` created by the `Drawer.createHandle()` function.

The imperative methods on the handle, such as `open()` and `openWithPayload()`, require a `<Drawer.Root>` using the same handle to be mounted.
Calls made while no root is attached to the handle — before one mounts, or after it unmounts — are ignored. Each time a root mounts, it starts from fresh state: a call made while no root was attached is not replayed, and no open state carries over from a previous mount.

```tsx
const demoDrawer = Drawer.createHandle();



<Drawer.Trigger handle={demoDrawer}>Open</Drawer.Trigger>



<Drawer.Root handle={demoDrawer}>
  ...
</Drawer.Root>
```

The drawer can render different content depending on which trigger opened it. This is achieved by passing a `payload` to the `<Drawer.Trigger>` and using the function-as-a-child pattern in `<Drawer.Root>`.

```tsx

const demoDrawer = Drawer.createHandle<{ title: string }>();



<Drawer.Trigger handle={demoDrawer} payload={{ title: 'Profile' }}>
  Profile
</Drawer.Trigger>



<Drawer.Trigger handle={demoDrawer} payload={{ title: 'Settings' }}>
  Settings
</Drawer.Trigger>

<Drawer.Root handle={demoDrawer}>
  {({ payload }) => ( 
    <Drawer.Portal>
      <Drawer.Popup>
        <Drawer.Content>
          <Drawer.Title>{payload?.title}</Drawer.Title> 
        </Drawer.Content>
      </Drawer.Popup>
    </Drawer.Portal>
  )}
</Drawer.Root>
```

<a id="stacking-and-animations"></a>

### Stacking and animations

Use CSS transitions or animations to animate drawer opening, closing, swipe interactions, and nested stacking. The `data-starting-style` attribute is applied when a drawer starts to open, and `data-ending-style` is applied when it starts to close.

The `--nested-drawers` CSS variable can be used to determine stack depth. The frontmost drawer has index `0`.

```css
.DrawerPopup {
  --stack-step: 0.05;
  --stack-scale: calc(1 - (var(--nested-drawers) * var(--stack-step)));
  transform: translateY(var(--drawer-swipe-movement-y)) scale(var(--stack-scale));
}
```

When stacked drawers have varying heights, use the `--drawer-height` and `--drawer-frontmost-height` variables to keep collapsed drawers aligned with the frontmost one.

```css
.DrawerPopup {
  --bleed: 3rem;
  --stack-height: max(
    0px,
    calc(var(--drawer-frontmost-height, var(--drawer-height)) - var(--bleed))
  );
  height: var(--drawer-height, auto);
}

.DrawerPopup[data-nested-drawer-open] {
  height: calc(var(--stack-height) + var(--bleed));
  overflow: hidden;
}
```

The `data-nested-drawer-open` attribute marks drawers behind the frontmost drawer. Use it with `data-nested-drawer-swiping` to dim or hide parent drawer content while keeping it visible during nested swipe interactions.

```css
.DrawerContent {
  transition: opacity 300ms;
}

.DrawerPopup[data-nested-drawer-open] .DrawerContent {
  opacity: 0;
}

.DrawerPopup[data-nested-drawer-open][data-nested-drawer-swiping] .DrawerContent {
  opacity: 1;
}
```

The `--drawer-swipe-movement-x`, `--drawer-swipe-movement-y`, and `--drawer-snap-point-offset` CSS variables can be used to create smooth drag and snap offsets:

```css
.DrawerPopup[data-swipe-direction='right'] {
  transform: translateX(var(--drawer-swipe-movement-x));
}

.DrawerPopup[data-swipe-direction='down'] {
  transform: translateY(
    calc(var(--drawer-snap-point-offset) + var(--drawer-swipe-movement-y))
  );
}
```

The `data-swipe-direction` attribute can be used with `data-ending-style` to animate directional dismissal:

```css
.DrawerPopup[data-ending-style][data-swipe-direction='right'] {
  transform: translateX(100%);
}

.DrawerPopup[data-ending-style][data-swipe-direction='down'] {
  transform: translateY(100%);
}
```

Use `--drawer-swipe-progress` to fade the backdrop as the drawer is swiped, and `--drawer-swipe-strength` to scale release transition durations based on swipe velocity.

```css
.DrawerBackdrop {
  --backdrop-opacity: 0.2;
  opacity: calc(var(--backdrop-opacity) * (1 - var(--drawer-swipe-progress)));
}

.DrawerPopup[data-ending-style],
.DrawerBackdrop[data-ending-style] {
  transition-duration: calc(var(--drawer-swipe-strength) * 400ms);
}

.DrawerPopup[data-swiping],
.DrawerBackdrop[data-swiping] {
  transition-duration: 0ms;
}
```

<a id="api-reference"></a>

## API reference

<a id="provider"></a>

### Provider

<a id="api-4472617765722e50726f7669646572"></a>

<a id="drawerprovider"></a>

### Drawer.Provider

Declaration: `packages/solid/build/types/drawer/provider/DrawerProvider.d.ts:2`

#### Declaration

```typescript
(props: DrawerProviderProps) => JSX.Element
```

<a id="api-4472617765722e50726f76696465722e2470726f70732e6368696c6472656e"></a>

<a id="DrawerProvider-children"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| children | `JSX.Element` | No | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4472617765722e50726f76696465722e50726f7073"></a>

<a id="drawerproviderprops"></a>

### Related exported type: Drawer.Provider.Props

Declaration: `packages/solid/build/types/drawer/provider/DrawerProvider.d.ts:9`

#### Declaration

```typescript
DrawerProviderProps
```

<a id="api-4472617765722e50726f76696465722e50726f70732e6368696c6472656e"></a>

<a id="DrawerProviderProps-children"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| children | `JSX.Element` | No | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4472617765722e50726f76696465722e5374617465"></a>

<a id="drawerproviderstate"></a>

### Related exported type: Drawer.Provider.State

Declaration: `packages/solid/build/types/drawer/provider/DrawerProvider.d.ts:10`

#### Declaration

```typescript
DrawerProviderState
```

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="indentbackground"></a>

### IndentBackground

<a id="api-4472617765722e496e64656e744261636b67726f756e64"></a>

<a id="drawerindentbackground"></a>

<a id="api-4472617765722e496e64656e744261636b67726f756e642e2470726f70732e70726f703a616c69676e"></a>

### Drawer.IndentBackground

Declaration: `packages/solid/build/types/drawer/indent-background/DrawerIndentBackground.d.ts:2`

#### Declaration

```typescript
(props: DrawerIndentBackgroundProps) => JSX.Element
```

<a id="api-4472617765722e496e64656e744261636b67726f756e642e2470726f70732e636c617373"></a>

<a id="DrawerIndentBackground-class"></a>

<a id="api-4472617765722e496e64656e744261636b67726f756e642e2470726f70732e7374796c65"></a>

<a id="DrawerIndentBackground-style"></a>

<a id="api-4472617765722e496e64656e744261636b67726f756e642e2470726f70732e72656e646572"></a>

<a id="DrawerIndentBackground-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<DrawerIndentBackgroundState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<DrawerIndentBackgroundState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, DrawerIndentBackgroundState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-4472617765722e496e64656e744261636b67726f756e642e64617461417474726962757465732e646174612d616374697665"></a>

<a id="api-4472617765722e496e64656e744261636b67726f756e642e64617461417474726962757465732e646174612d696e616374697665"></a>

| Name | Description |
| --- | --- |
| data-active | Present when active is true. |
| data-inactive | Present when active is false. |

#### CSS variables

Metadata status: unavailable.

<a id="api-4472617765722e496e64656e744261636b67726f756e642e50726f7073"></a>

<a id="drawerindentbackgroundprops"></a>

<a id="api-4472617765722e496e64656e744261636b67726f756e642e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Drawer.IndentBackground.Props

Declaration: `packages/solid/build/types/drawer/indent-background/DrawerIndentBackground.d.ts:9`

#### Declaration

```typescript
DrawerIndentBackgroundProps
```

<a id="api-4472617765722e496e64656e744261636b67726f756e642e50726f70732e636c617373"></a>

<a id="DrawerIndentBackgroundProps-class"></a>

<a id="api-4472617765722e496e64656e744261636b67726f756e642e50726f70732e7374796c65"></a>

<a id="DrawerIndentBackgroundProps-style"></a>

<a id="api-4472617765722e496e64656e744261636b67726f756e642e50726f70732e72656e646572"></a>

<a id="DrawerIndentBackgroundProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<DrawerIndentBackgroundState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<DrawerIndentBackgroundState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, DrawerIndentBackgroundState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4472617765722e496e64656e744261636b67726f756e642e5374617465"></a>

<a id="drawerindentbackgroundstate"></a>

### Related exported type: Drawer.IndentBackground.State

Declaration: `packages/solid/build/types/drawer/indent-background/DrawerIndentBackground.d.ts:10`

#### Declaration

```typescript
DrawerIndentBackgroundState
```

<a id="api-4472617765722e496e64656e744261636b67726f756e642e53746174652e616374697665"></a>

<a id="DrawerIndentBackgroundState-active"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| active | `boolean` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="indent"></a>

### Indent

<a id="api-4472617765722e496e64656e74"></a>

<a id="drawerindent"></a>

<a id="api-4472617765722e496e64656e742e2470726f70732e70726f703a616c69676e"></a>

### Drawer.Indent

Declaration: `packages/solid/build/types/drawer/indent/DrawerIndent.d.ts:2`

#### Declaration

```typescript
(props: DrawerIndentProps) => JSX.Element
```

<a id="api-4472617765722e496e64656e742e2470726f70732e636c617373"></a>

<a id="DrawerIndent-class"></a>

<a id="api-4472617765722e496e64656e742e2470726f70732e7374796c65"></a>

<a id="DrawerIndent-style"></a>

<a id="api-4472617765722e496e64656e742e2470726f70732e72656e646572"></a>

<a id="DrawerIndent-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<DrawerIndentState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<DrawerIndentState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, DrawerIndentState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-4472617765722e496e64656e742e64617461417474726962757465732e646174612d616374697665"></a>

<a id="api-4472617765722e496e64656e742e64617461417474726962757465732e646174612d696e616374697665"></a>

| Name | Description |
| --- | --- |
| data-active | Present when active is true. |
| data-inactive | Present when active is false. |

#### CSS variables

Metadata status: unavailable.

<a id="api-4472617765722e496e64656e742e50726f7073"></a>

<a id="drawerindentprops"></a>

<a id="api-4472617765722e496e64656e742e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Drawer.Indent.Props

Declaration: `packages/solid/build/types/drawer/indent/DrawerIndent.d.ts:9`

#### Declaration

```typescript
DrawerIndentProps
```

<a id="api-4472617765722e496e64656e742e50726f70732e636c617373"></a>

<a id="DrawerIndentProps-class"></a>

<a id="api-4472617765722e496e64656e742e50726f70732e7374796c65"></a>

<a id="DrawerIndentProps-style"></a>

<a id="api-4472617765722e496e64656e742e50726f70732e72656e646572"></a>

<a id="DrawerIndentProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<DrawerIndentState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<DrawerIndentState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, DrawerIndentState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4472617765722e496e64656e742e5374617465"></a>

<a id="drawerindentstate"></a>

### Related exported type: Drawer.Indent.State

Declaration: `packages/solid/build/types/drawer/indent/DrawerIndent.d.ts:10`

#### Declaration

```typescript
DrawerIndentState
```

<a id="api-4472617765722e496e64656e742e53746174652e616374697665"></a>

<a id="DrawerIndentState-active"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| active | `boolean` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="root"></a>

### Root

<a id="api-4472617765722e526f6f74"></a>

<a id="drawerroot"></a>

### Drawer.Root

Declaration: `packages/solid/build/types/drawer/root/DrawerRoot.d.ts:8`

#### Declaration

```typescript
<Payload = unknown>(props: DrawerRootProps<Payload>) => JSX.Element
```

<a id="api-4472617765722e526f6f742e2470726f70732e64656661756c744f70656e"></a>

<a id="DrawerRoot-defaultOpen"></a>

<a id="api-4472617765722e526f6f742e2470726f70732e6f70656e"></a>

<a id="DrawerRoot-open"></a>

<a id="api-4472617765722e526f6f742e2470726f70732e6f6e4f70656e4368616e6765"></a>

<a id="DrawerRoot-onOpenChange"></a>

<a id="api-4472617765722e526f6f742e2470726f70732e736e6170506f696e7473"></a>

<a id="DrawerRoot-snapPoints"></a>

<a id="api-4472617765722e526f6f742e2470726f70732e64656661756c74536e6170506f696e74"></a>

<a id="DrawerRoot-defaultSnapPoint"></a>

<a id="api-4472617765722e526f6f742e2470726f70732e736e6170506f696e74"></a>

<a id="DrawerRoot-snapPoint"></a>

<a id="api-4472617765722e526f6f742e2470726f70732e6f6e536e6170506f696e744368616e6765"></a>

<a id="DrawerRoot-onSnapPointChange"></a>

<a id="api-4472617765722e526f6f742e2470726f70732e616374696f6e73526566"></a>

<a id="DrawerRoot-actionsRef"></a>

<a id="api-4472617765722e526f6f742e2470726f70732e64656661756c74547269676765724964"></a>

<a id="DrawerRoot-defaultTriggerId"></a>

<a id="api-4472617765722e526f6f742e2470726f70732e64697361626c65506f696e7465724469736d697373616c"></a>

<a id="DrawerRoot-disablePointerDismissal"></a>

<a id="api-4472617765722e526f6f742e2470726f70732e68616e646c65"></a>

<a id="DrawerRoot-handle"></a>

<a id="api-4472617765722e526f6f742e2470726f70732e6d6f64616c"></a>

<a id="DrawerRoot-modal"></a>

<a id="api-4472617765722e526f6f742e2470726f70732e6f6e4f70656e4368616e6765436f6d706c657465"></a>

<a id="DrawerRoot-onOpenChangeComplete"></a>

<a id="api-4472617765722e526f6f742e2470726f70732e736e6170546f53657175656e7469616c506f696e7473"></a>

<a id="DrawerRoot-snapToSequentialPoints"></a>

<a id="api-4472617765722e526f6f742e2470726f70732e7377697065446972656374696f6e"></a>

<a id="DrawerRoot-swipeDirection"></a>

<a id="api-4472617765722e526f6f742e2470726f70732e747269676765724964"></a>

<a id="DrawerRoot-triggerId"></a>

<a id="api-4472617765722e526f6f742e2470726f70732e6368696c6472656e"></a>

<a id="DrawerRoot-children"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| defaultOpen | `boolean \| undefined` | No | Unavailable | Initial open state for this root’s uncontrolled lifetime. |
| open | `boolean \| undefined` | No | Unavailable | Controlled open state. Defaults seed only this root's uncontrolled lifetime. |
| onOpenChange | `((open: boolean, details: DrawerRootChangeEventDetails) => void) \| undefined` | No | Unavailable |  |
| snapPoints | `DrawerSnapPoint[] \| undefined` | No | Unavailable |  |
| defaultSnapPoint | `DrawerSnapPoint \| null \| undefined` | No | Unavailable |  |
| snapPoint | `DrawerSnapPoint \| null \| undefined` | No | Unavailable |  |
| onSnapPointChange | `((point: DrawerSnapPoint \| null, details: DrawerSnapChangeDetails) => void) \| undefined` | No | Unavailable |  |
| actionsRef | `{ current: DialogRootActions \| null; } \| ((actions: DialogRootActions \| null) => void) \| undefined` | No | Unavailable | Retention is requested by details.preventUnmountOnClose(), not by providing actionsRef. |
| defaultTriggerId | `string \| null \| undefined` | No | Unavailable | Initial active trigger ID for uncontrolled trigger selection. |
| disablePointerDismissal | `boolean \| undefined` | No | Unavailable | Also suppresses nonmodal focus-out dismissal; Escape and explicit close remain available. |
| handle | `DrawerHandle<Payload> \| undefined` | No | Unavailable |  |
| modal | `boolean \| "trap-focus" \| undefined` | No | Unavailable | true: trap focus and lock scroll/pointers; false: nonmodal; trap-focus: focus only. |
| onOpenChangeComplete | `((open: boolean) => void) \| undefined` | No | Unavailable | Called with the open state when the opening or closing transition completes. |
| snapToSequentialPoints | `boolean \| undefined` | No | false |  |
| swipeDirection | `DrawerSwipeDirection \| undefined` | No | 'down' |  |
| triggerId | `string \| null \| undefined` | No | Unavailable | Controlled ID of the active trigger. |
| children | `JSX.Element \| ((context: { readonly payload: Payload \| undefined; }) => JSX.Element)` | No | Unavailable | Read context.payload live in JSX; it follows the active trigger without recreating the subtree. |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4472617765722e526f6f742e50726f7073"></a>

<a id="drawerrootprops"></a>

### Related exported type: Drawer.Root.Props

Declaration: `packages/solid/build/types/drawer/root/DrawerRoot.d.ts:23`

#### Declaration

```typescript
Props<Payload>
```

<a id="api-4472617765722e526f6f742e50726f70732e64656661756c744f70656e"></a>

<a id="DrawerRootProps-defaultOpen"></a>

<a id="api-4472617765722e526f6f742e50726f70732e6f70656e"></a>

<a id="DrawerRootProps-open"></a>

<a id="api-4472617765722e526f6f742e50726f70732e6f6e4f70656e4368616e6765"></a>

<a id="DrawerRootProps-onOpenChange"></a>

<a id="api-4472617765722e526f6f742e50726f70732e736e6170506f696e7473"></a>

<a id="DrawerRootProps-snapPoints"></a>

<a id="api-4472617765722e526f6f742e50726f70732e64656661756c74536e6170506f696e74"></a>

<a id="DrawerRootProps-defaultSnapPoint"></a>

<a id="api-4472617765722e526f6f742e50726f70732e736e6170506f696e74"></a>

<a id="DrawerRootProps-snapPoint"></a>

<a id="api-4472617765722e526f6f742e50726f70732e6f6e536e6170506f696e744368616e6765"></a>

<a id="DrawerRootProps-onSnapPointChange"></a>

<a id="api-4472617765722e526f6f742e50726f70732e616374696f6e73526566"></a>

<a id="DrawerRootProps-actionsRef"></a>

<a id="api-4472617765722e526f6f742e50726f70732e64656661756c74547269676765724964"></a>

<a id="DrawerRootProps-defaultTriggerId"></a>

<a id="api-4472617765722e526f6f742e50726f70732e64697361626c65506f696e7465724469736d697373616c"></a>

<a id="DrawerRootProps-disablePointerDismissal"></a>

<a id="api-4472617765722e526f6f742e50726f70732e68616e646c65"></a>

<a id="DrawerRootProps-handle"></a>

<a id="api-4472617765722e526f6f742e50726f70732e6d6f64616c"></a>

<a id="DrawerRootProps-modal"></a>

<a id="api-4472617765722e526f6f742e50726f70732e6f6e4f70656e4368616e6765436f6d706c657465"></a>

<a id="DrawerRootProps-onOpenChangeComplete"></a>

<a id="api-4472617765722e526f6f742e50726f70732e736e6170546f53657175656e7469616c506f696e7473"></a>

<a id="DrawerRootProps-snapToSequentialPoints"></a>

<a id="api-4472617765722e526f6f742e50726f70732e7377697065446972656374696f6e"></a>

<a id="DrawerRootProps-swipeDirection"></a>

<a id="api-4472617765722e526f6f742e50726f70732e747269676765724964"></a>

<a id="DrawerRootProps-triggerId"></a>

<a id="api-4472617765722e526f6f742e50726f70732e6368696c6472656e"></a>

<a id="DrawerRootProps-children"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| defaultOpen | `boolean \| undefined` | No | Unavailable | Initial open state for this root’s uncontrolled lifetime. |
| open | `boolean \| undefined` | No | Unavailable | Controlled open state. Defaults seed only this root's uncontrolled lifetime. |
| onOpenChange | `((open: boolean, details: DrawerRootChangeEventDetails) => void) \| undefined` | No | Unavailable |  |
| snapPoints | `DrawerSnapPoint[] \| undefined` | No | Unavailable |  |
| defaultSnapPoint | `DrawerSnapPoint \| null \| undefined` | No | Unavailable |  |
| snapPoint | `DrawerSnapPoint \| null \| undefined` | No | Unavailable |  |
| onSnapPointChange | `((point: DrawerSnapPoint \| null, details: DrawerSnapChangeDetails) => void) \| undefined` | No | Unavailable |  |
| actionsRef | `{ current: DialogRootActions \| null; } \| ((actions: DialogRootActions \| null) => void) \| undefined` | No | Unavailable | Retention is requested by details.preventUnmountOnClose(), not by providing actionsRef. |
| defaultTriggerId | `string \| null \| undefined` | No | Unavailable | Initial active trigger ID for uncontrolled trigger selection. |
| disablePointerDismissal | `boolean \| undefined` | No | Unavailable | Also suppresses nonmodal focus-out dismissal; Escape and explicit close remain available. |
| handle | `DrawerHandle<Payload> \| undefined` | No | Unavailable |  |
| modal | `boolean \| "trap-focus" \| undefined` | No | Unavailable | true: trap focus and lock scroll/pointers; false: nonmodal; trap-focus: focus only. |
| onOpenChangeComplete | `((open: boolean) => void) \| undefined` | No | Unavailable | Called with the open state when the opening or closing transition completes. |
| snapToSequentialPoints | `boolean \| undefined` | No | Unavailable |  |
| swipeDirection | `DrawerSwipeDirection \| undefined` | No | Unavailable |  |
| triggerId | `string \| null \| undefined` | No | Unavailable | Controlled ID of the active trigger. |
| children | `JSX.Element \| ((context: { readonly payload: Payload \| undefined; }) => JSX.Element)` | No | Unavailable | Read context.payload live in JSX; it follows the active trigger without recreating the subtree. |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4472617765722e526f6f742e5374617465"></a>

<a id="drawerrootstate"></a>

### Related exported type: Drawer.Root.State

Declaration: `packages/solid/build/types/drawer/root/DrawerRoot.d.ts:24`

#### Declaration

```typescript
DrawerRootState
```

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4472617765722e526f6f742e416374696f6e73"></a>

<a id="drawerrootactions"></a>

### Related exported type: Drawer.Root.Actions

Declaration: `packages/solid/build/types/drawer/root/DrawerRoot.d.ts:25`

#### Declaration

```typescript
DialogRootActions
```

<a id="api-4472617765722e526f6f742e416374696f6e732e636c6f7365"></a>

<a id="DrawerRootActions-close"></a>

<a id="api-4472617765722e526f6f742e416374696f6e732e756e6d6f756e74"></a>

<a id="DrawerRootActions-unmount"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| close | `() => void` | Yes | Unavailable |  |
| unmount | `() => void` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4472617765722e526f6f742e4368616e67654576656e74526561736f6e"></a>

<a id="drawerrootchangeeventreason"></a>

### Related exported type: Drawer.Root.ChangeEventReason

Declaration: `packages/solid/build/types/drawer/root/DrawerRoot.d.ts:26`

#### Declaration

```typescript
DrawerChangeReason
```

Inherited DOM attributes: `__@iterator@106`, `anchor`, `at`, `big`, `blink`, `bold`, `charAt`, `charCodeAt`, `codePointAt`, `concat`, `endsWith`, `fixed`, `fontcolor`, `fontsize`, `includes`, `indexOf`, `isWellFormed`, `italics`, `lastIndexOf`, `length`, `link`, `localeCompare`, `match`, `matchAll`, `normalize`, `padEnd`, `padStart`, `repeat`, `replace`, `replaceAll`, `search`, `slice`, `small`, `split`, `startsWith`, `strike`, `sub`, `substr`, `substring`, `sup`, `toLocaleLowerCase`, `toLocaleUpperCase`, `toLowerCase`, `toString`, `toUpperCase`, `toWellFormed`, `trim`, `trimEnd`, `trimLeft`, `trimRight`, `trimStart`, `valueOf`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4472617765722e526f6f742e4368616e67654576656e7444657461696c73"></a>

<a id="drawerrootchangeeventdetails"></a>

### Related exported type: Drawer.Root.ChangeEventDetails

Declaration: `packages/solid/build/types/drawer/root/DrawerRoot.d.ts:27`

#### Declaration

```typescript
DrawerRootChangeEventDetails
```

<a id="api-4472617765722e526f6f742e4368616e67654576656e7444657461696c732e616c6c6f7750726f7061676174696f6e"></a>

<a id="DrawerRootChangeEventDetails-allowPropagation"></a>

<a id="api-4472617765722e526f6f742e4368616e67654576656e7444657461696c732e63616e63656c"></a>

<a id="DrawerRootChangeEventDetails-cancel"></a>

<a id="api-4472617765722e526f6f742e4368616e67654576656e7444657461696c732e6576656e74"></a>

<a id="DrawerRootChangeEventDetails-event"></a>

<a id="api-4472617765722e526f6f742e4368616e67654576656e7444657461696c732e697343616e63656c6564"></a>

<a id="DrawerRootChangeEventDetails-isCanceled"></a>

<a id="api-4472617765722e526f6f742e4368616e67654576656e7444657461696c732e697350726f7061676174696f6e416c6c6f776564"></a>

<a id="DrawerRootChangeEventDetails-isPropagationAllowed"></a>

<a id="api-4472617765722e526f6f742e4368616e67654576656e7444657461696c732e70726576656e74556e6d6f756e744f6e436c6f7365"></a>

<a id="DrawerRootChangeEventDetails-preventUnmountOnClose"></a>

<a id="api-4472617765722e526f6f742e4368616e67654576656e7444657461696c732e726561736f6e"></a>

<a id="DrawerRootChangeEventDetails-reason"></a>

<a id="api-4472617765722e526f6f742e4368616e67654576656e7444657461696c732e74726967676572"></a>

<a id="DrawerRootChangeEventDetails-trigger"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| allowPropagation | `() => void` | Yes | Unavailable | Marks this change transaction as allowing propagation. |
| cancel | `() => void` | Yes | Unavailable | Cancels the Base UI change transaction; separate from the DOM event’s preventDefault() and preventBaseUIHandler(). |
| event | `PointerEvent \| MouseEvent \| Event \| FocusEvent \| KeyboardEvent \| TouchEvent` | Yes | Unavailable | Native DOM event associated with the change. Programmatic changes can use a Base UI-created Event. |
| isCanceled | `boolean` | Yes | Unavailable | Whether cancel() has been called for this change transaction. |
| isPropagationAllowed | `boolean` | Yes | Unavailable | Whether allowPropagation() has been called for this change transaction. |
| preventUnmountOnClose | `() => void` | Yes | Unavailable |  |
| reason | `"none" \| "trigger-press" \| "outside-press" \| "close-press" \| "focus-out" \| "escape-key" \| "close-watcher" \| "swipe" \| "imperative-action"` | Yes | Unavailable | Reason for the requested change; it discriminates the native event type. |
| trigger | `Element \| undefined` | Yes | Unavailable | Trigger element associated with this change, when available. |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4472617765722e526f6f742e536e6170506f696e74"></a>

<a id="drawerrootsnappoint"></a>

### Related exported type: Drawer.Root.SnapPoint

Declaration: `packages/solid/build/types/drawer/root/DrawerRoot.d.ts:30`

#### Declaration

```typescript
DrawerSnapPoint
```

Inherited DOM attributes: `toLocaleString`, `toString`, `valueOf`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4472617765722e526f6f742e536e6170506f696e744368616e67654576656e7444657461696c73"></a>

<a id="drawerrootsnappointchangeeventdetails"></a>

### Related exported type: Drawer.Root.SnapPointChangeEventDetails

Declaration: `packages/solid/build/types/drawer/root/DrawerRoot.d.ts:29`

#### Declaration

```typescript
DrawerSnapChangeDetails
```

<a id="api-4472617765722e526f6f742e536e6170506f696e744368616e67654576656e7444657461696c732e616c6c6f7750726f7061676174696f6e"></a>

<a id="DrawerRootSnapPointChangeEventDetails-allowPropagation"></a>

<a id="api-4472617765722e526f6f742e536e6170506f696e744368616e67654576656e7444657461696c732e63616e63656c"></a>

<a id="DrawerRootSnapPointChangeEventDetails-cancel"></a>

<a id="api-4472617765722e526f6f742e536e6170506f696e744368616e67654576656e7444657461696c732e6576656e74"></a>

<a id="DrawerRootSnapPointChangeEventDetails-event"></a>

<a id="api-4472617765722e526f6f742e536e6170506f696e744368616e67654576656e7444657461696c732e697343616e63656c6564"></a>

<a id="DrawerRootSnapPointChangeEventDetails-isCanceled"></a>

<a id="api-4472617765722e526f6f742e536e6170506f696e744368616e67654576656e7444657461696c732e697350726f7061676174696f6e416c6c6f776564"></a>

<a id="DrawerRootSnapPointChangeEventDetails-isPropagationAllowed"></a>

<a id="api-4472617765722e526f6f742e536e6170506f696e744368616e67654576656e7444657461696c732e726561736f6e"></a>

<a id="DrawerRootSnapPointChangeEventDetails-reason"></a>

<a id="api-4472617765722e526f6f742e536e6170506f696e744368616e67654576656e7444657461696c732e74726967676572"></a>

<a id="DrawerRootSnapPointChangeEventDetails-trigger"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| allowPropagation | `() => void` | Yes | Unavailable | Marks this change transaction as allowing propagation. |
| cancel | `() => void` | Yes | Unavailable | Cancels the Base UI change transaction; separate from the DOM event’s preventDefault() and preventBaseUIHandler(). |
| event | `PointerEvent \| MouseEvent \| Event \| FocusEvent \| KeyboardEvent \| TouchEvent` | Yes | Unavailable | Native DOM event associated with the change. Programmatic changes can use a Base UI-created Event. |
| isCanceled | `boolean` | Yes | Unavailable | Whether cancel() has been called for this change transaction. |
| isPropagationAllowed | `boolean` | Yes | Unavailable | Whether allowPropagation() has been called for this change transaction. |
| reason | `"none" \| "trigger-press" \| "outside-press" \| "close-press" \| "focus-out" \| "escape-key" \| "close-watcher" \| "swipe" \| "imperative-action"` | Yes | Unavailable | Reason for the requested change; it discriminates the native event type. |
| trigger | `Element \| undefined` | Yes | Unavailable | Trigger element associated with this change, when available. |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4472617765722e526f6f742e536e6170506f696e744368616e67654576656e74526561736f6e"></a>

<a id="drawerrootsnappointchangeeventreason"></a>

### Related exported type: Drawer.Root.SnapPointChangeEventReason

Declaration: `packages/solid/build/types/drawer/root/DrawerRoot.d.ts:28`

#### Declaration

```typescript
DrawerChangeReason
```

Inherited DOM attributes: `__@iterator@106`, `anchor`, `at`, `big`, `blink`, `bold`, `charAt`, `charCodeAt`, `codePointAt`, `concat`, `endsWith`, `fixed`, `fontcolor`, `fontsize`, `includes`, `indexOf`, `isWellFormed`, `italics`, `lastIndexOf`, `length`, `link`, `localeCompare`, `match`, `matchAll`, `normalize`, `padEnd`, `padStart`, `repeat`, `replace`, `replaceAll`, `search`, `slice`, `small`, `split`, `startsWith`, `strike`, `sub`, `substr`, `substring`, `sup`, `toLocaleLowerCase`, `toLocaleUpperCase`, `toLowerCase`, `toString`, `toUpperCase`, `toWellFormed`, `trim`, `trimEnd`, `trimLeft`, `trimRight`, `trimStart`, `valueOf`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="trigger"></a>

### Trigger

<a id="api-4472617765722e54726967676572"></a>

<a id="drawertrigger"></a>

<a id="api-4472617765722e547269676765722e2470726f70732e70726f703a64697361626c6564"></a>

<a id="api-4472617765722e547269676765722e2470726f70732e70726f703a666f726d416374696f6e"></a>

<a id="api-4472617765722e547269676765722e2470726f70732e70726f703a666f726d456e6374797065"></a>

<a id="api-4472617765722e547269676765722e2470726f70732e70726f703a666f726d4d6574686f64"></a>

<a id="api-4472617765722e547269676765722e2470726f70732e70726f703a666f726d4e6f56616c6964617465"></a>

<a id="api-4472617765722e547269676765722e2470726f70732e70726f703a666f726d546172676574"></a>

<a id="api-4472617765722e547269676765722e2470726f70732e70726f703a6e616d65"></a>

<a id="api-4472617765722e547269676765722e2470726f70732e70726f703a706f706f766572546172676574416374696f6e"></a>

<a id="api-4472617765722e547269676765722e2470726f70732e70726f703a706f706f766572546172676574456c656d656e74"></a>

<a id="api-4472617765722e547269676765722e2470726f70732e70726f703a74797065"></a>

<a id="api-4472617765722e547269676765722e2470726f70732e70726f703a76616c7565"></a>

### Drawer.Trigger

Declaration: `packages/solid/build/types/drawer/trigger/DrawerTrigger.d.ts:4`

#### Declaration

```typescript
DrawerTrigger
```

<a id="api-4472617765722e547269676765722e2470726f70732e68616e646c65"></a>

<a id="DrawerTrigger-handle"></a>

<a id="api-4472617765722e547269676765722e2470726f70732e6e6174697665427574746f6e"></a>

<a id="DrawerTrigger-nativeButton"></a>

<a id="api-4472617765722e547269676765722e2470726f70732e7061796c6f6164"></a>

<a id="DrawerTrigger-payload"></a>

<a id="api-4472617765722e547269676765722e2470726f70732e64697361626c6564"></a>

<a id="DrawerTrigger-disabled"></a>

<a id="api-4472617765722e547269676765722e2470726f70732e6964"></a>

<a id="DrawerTrigger-id"></a>

<a id="api-4472617765722e547269676765722e2470726f70732e636c617373"></a>

<a id="DrawerTrigger-class"></a>

<a id="api-4472617765722e547269676765722e2470726f70732e7374796c65"></a>

<a id="DrawerTrigger-style"></a>

<a id="api-4472617765722e547269676765722e2470726f70732e72656e646572"></a>

<a id="DrawerTrigger-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| handle | `DrawerHandle<Payload> \| undefined` | No | Unavailable |  |
| nativeButton | `boolean \| undefined` | No | Unavailable | Whether the rendered host is a native button. Set false when the render callback supplies a non-button host. |
| payload | `NoInfer<Payload> \| undefined` | No | Unavailable | Payload registered with this trigger and exposed by the root when this trigger is active. |
| disabled | `boolean \| undefined` | No | Unavailable | Whether the trigger ignores user interaction. |
| id | `string \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<DialogTriggerState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<DialogTriggerState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, DialogTriggerState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `command`, `commandfor`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `form`, `formaction`, `formenctype`, `formmethod`, `formnovalidate`, `formtarget`, `hidden`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `name`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `popovertarget`, `popovertargetaction`, `prefix`, `prop:disabled`, `prop:formAction`, `prop:formEnctype`, `prop:formMethod`, `prop:formNoValidate`, `prop:formTarget`, `prop:name`, `prop:popoverTargetAction`, `prop:popoverTargetElement`, `prop:type`, `prop:value`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `type`, `typeof`, `value`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-4472617765725472696767657244617461417474726962757465732e706f7075704f70656e"></a>

<a id="api-4472617765725472696767657244617461417474726962757465732e64697361626c6564"></a>

| Name | Description |
| --- | --- |
| data-popup-open |  |
| data-disabled |  |

#### CSS variables

Metadata status: unavailable.

<a id="api-4472617765722e547269676765722e50726f7073"></a>

<a id="drawertriggerprops"></a>

<a id="api-4472617765722e547269676765722e50726f70732e70726f703a64697361626c6564"></a>

<a id="api-4472617765722e547269676765722e50726f70732e70726f703a666f726d416374696f6e"></a>

<a id="api-4472617765722e547269676765722e50726f70732e70726f703a666f726d456e6374797065"></a>

<a id="api-4472617765722e547269676765722e50726f70732e70726f703a666f726d4d6574686f64"></a>

<a id="api-4472617765722e547269676765722e50726f70732e70726f703a666f726d4e6f56616c6964617465"></a>

<a id="api-4472617765722e547269676765722e50726f70732e70726f703a666f726d546172676574"></a>

<a id="api-4472617765722e547269676765722e50726f70732e70726f703a6e616d65"></a>

<a id="api-4472617765722e547269676765722e50726f70732e70726f703a706f706f766572546172676574416374696f6e"></a>

<a id="api-4472617765722e547269676765722e50726f70732e70726f703a706f706f766572546172676574456c656d656e74"></a>

<a id="api-4472617765722e547269676765722e50726f70732e70726f703a74797065"></a>

<a id="api-4472617765722e547269676765722e50726f70732e70726f703a76616c7565"></a>

### Related exported type: Drawer.Trigger.Props

Declaration: `packages/solid/build/types/drawer/trigger/DrawerTrigger.d.ts:13`

#### Declaration

```typescript
Props<Payload>
```

<a id="api-4472617765722e547269676765722e50726f70732e68616e646c65"></a>

<a id="DrawerTriggerProps-handle"></a>

<a id="api-4472617765722e547269676765722e50726f70732e6e6174697665427574746f6e"></a>

<a id="DrawerTriggerProps-nativeButton"></a>

<a id="api-4472617765722e547269676765722e50726f70732e7061796c6f6164"></a>

<a id="DrawerTriggerProps-payload"></a>

<a id="api-4472617765722e547269676765722e50726f70732e64697361626c6564"></a>

<a id="DrawerTriggerProps-disabled"></a>

<a id="api-4472617765722e547269676765722e50726f70732e6964"></a>

<a id="DrawerTriggerProps-id"></a>

<a id="api-4472617765722e547269676765722e50726f70732e636c617373"></a>

<a id="DrawerTriggerProps-class"></a>

<a id="api-4472617765722e547269676765722e50726f70732e7374796c65"></a>

<a id="DrawerTriggerProps-style"></a>

<a id="api-4472617765722e547269676765722e50726f70732e72656e646572"></a>

<a id="DrawerTriggerProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| handle | `DrawerHandle<Payload> \| undefined` | No | Unavailable |  |
| nativeButton | `boolean \| undefined` | No | Unavailable | Whether the rendered host is a native button. Set false when the render callback supplies a non-button host. |
| payload | `NoInfer<Payload> \| undefined` | No | Unavailable | Payload registered with this trigger and exposed by the root when this trigger is active. |
| disabled | `boolean \| undefined` | No | Unavailable | Whether the trigger ignores user interaction. |
| id | `string \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<DialogTriggerState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<DialogTriggerState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, DialogTriggerState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `command`, `commandfor`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `form`, `formaction`, `formenctype`, `formmethod`, `formnovalidate`, `formtarget`, `hidden`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `name`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `popovertarget`, `popovertargetaction`, `prefix`, `prop:disabled`, `prop:formAction`, `prop:formEnctype`, `prop:formMethod`, `prop:formNoValidate`, `prop:formTarget`, `prop:name`, `prop:popoverTargetAction`, `prop:popoverTargetElement`, `prop:type`, `prop:value`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `type`, `typeof`, `value`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4472617765722e547269676765722e5374617465"></a>

<a id="drawertriggerstate"></a>

### Related exported type: Drawer.Trigger.State

Declaration: `packages/solid/build/types/drawer/trigger/DrawerTrigger.d.ts:14`

#### Declaration

```typescript
DialogTriggerState
```

<a id="api-4472617765722e547269676765722e53746174652e6f70656e"></a>

<a id="DrawerTriggerState-open"></a>

<a id="api-4472617765722e547269676765722e53746174652e64697361626c6564"></a>

<a id="DrawerTriggerState-disabled"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| open | `boolean` | Yes | Unavailable |  |
| disabled | `boolean` | Yes | Unavailable | Whether the trigger ignores user interaction. |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="swipearea"></a>

### SwipeArea

<a id="api-4472617765722e537769706541726561"></a>

<a id="drawerswipearea"></a>

<a id="api-4472617765722e5377697065417265612e2470726f70732e70726f703a616c69676e"></a>

### Drawer.SwipeArea

Declaration: `packages/solid/build/types/drawer/swipe-area/DrawerSwipeArea.d.ts:3`

#### Declaration

```typescript
(props: DrawerSwipeAreaProps) => JSX.Element
```

<a id="api-4472617765722e5377697065417265612e2470726f70732e7377697065446972656374696f6e"></a>

<a id="DrawerSwipeArea-swipeDirection"></a>

<a id="api-4472617765722e5377697065417265612e2470726f70732e64697361626c6564"></a>

<a id="DrawerSwipeArea-disabled"></a>

<a id="api-4472617765722e5377697065417265612e2470726f70732e636c617373"></a>

<a id="DrawerSwipeArea-class"></a>

<a id="api-4472617765722e5377697065417265612e2470726f70732e7374796c65"></a>

<a id="DrawerSwipeArea-style"></a>

<a id="api-4472617765722e5377697065417265612e2470726f70732e72656e646572"></a>

<a id="DrawerSwipeArea-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| swipeDirection | `DrawerSwipeDirection \| undefined` | No | Unavailable |  |
| disabled | `boolean \| undefined` | No | false |  |
| class | `JSX.ClassValue \| ((state: Readonly<DrawerSwipeAreaState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<DrawerSwipeAreaState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, DrawerSwipeAreaState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-44726177657253776970654172656144617461417474726962757465732e6f70656e"></a>

<a id="api-44726177657253776970654172656144617461417474726962757465732e636c6f736564"></a>

<a id="api-44726177657253776970654172656144617461417474726962757465732e64697361626c6564"></a>

<a id="api-44726177657253776970654172656144617461417474726962757465732e7377697065446972656374696f6e"></a>

<a id="api-44726177657253776970654172656144617461417474726962757465732e73776970696e67"></a>

| Name | Description |
| --- | --- |
| data-open | Present when open is true. |
| data-closed | Present when open is false. |
| data-disabled | Present when disabled is true. |
| data-swipe-direction |  |
| data-swiping | Present when swiping is true. |

#### CSS variables

Metadata status: unavailable.

<a id="api-4472617765722e5377697065417265612e50726f7073"></a>

<a id="drawerswipeareaprops"></a>

<a id="api-4472617765722e5377697065417265612e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Drawer.SwipeArea.Props

Declaration: `packages/solid/build/types/drawer/swipe-area/DrawerSwipeArea.d.ts:15`

#### Declaration

```typescript
DrawerSwipeAreaProps
```

<a id="api-4472617765722e5377697065417265612e50726f70732e7377697065446972656374696f6e"></a>

<a id="DrawerSwipeAreaProps-swipeDirection"></a>

<a id="api-4472617765722e5377697065417265612e50726f70732e64697361626c6564"></a>

<a id="DrawerSwipeAreaProps-disabled"></a>

<a id="api-4472617765722e5377697065417265612e50726f70732e636c617373"></a>

<a id="DrawerSwipeAreaProps-class"></a>

<a id="api-4472617765722e5377697065417265612e50726f70732e7374796c65"></a>

<a id="DrawerSwipeAreaProps-style"></a>

<a id="api-4472617765722e5377697065417265612e50726f70732e72656e646572"></a>

<a id="DrawerSwipeAreaProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| swipeDirection | `DrawerSwipeDirection \| undefined` | No | Unavailable |  |
| disabled | `boolean \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<DrawerSwipeAreaState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<DrawerSwipeAreaState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, DrawerSwipeAreaState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4472617765722e5377697065417265612e5374617465"></a>

<a id="drawerswipeareastate"></a>

### Related exported type: Drawer.SwipeArea.State

Declaration: `packages/solid/build/types/drawer/swipe-area/DrawerSwipeArea.d.ts:16`

#### Declaration

```typescript
DrawerSwipeAreaState
```

<a id="api-4472617765722e5377697065417265612e53746174652e6f70656e"></a>

<a id="DrawerSwipeAreaState-open"></a>

<a id="api-4472617765722e5377697065417265612e53746174652e7377697065446972656374696f6e"></a>

<a id="DrawerSwipeAreaState-swipeDirection"></a>

<a id="api-4472617765722e5377697065417265612e53746174652e73776970696e67"></a>

<a id="DrawerSwipeAreaState-swiping"></a>

<a id="api-4472617765722e5377697065417265612e53746174652e64697361626c6564"></a>

<a id="DrawerSwipeAreaState-disabled"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| open | `boolean` | Yes | Unavailable |  |
| swipeDirection | `DrawerSwipeDirection` | Yes | Unavailable |  |
| swiping | `boolean` | Yes | Unavailable |  |
| disabled | `boolean` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="virtualkeyboardprovider"></a>

### VirtualKeyboardProvider

<a id="api-4472617765722e5669727475616c4b6579626f61726450726f7669646572"></a>

<a id="drawervirtualkeyboardprovider"></a>

### Drawer.VirtualKeyboardProvider

Native keyboard focus/geometry resource; all work belongs to the viewport's realm/lifetime.

Declaration: `packages/solid/build/types/drawer/virtual-keyboard-provider/DrawerVirtualKeyboardProvider.d.ts:3`

#### Declaration

```typescript
(props: DrawerVirtualKeyboardProviderProps) => JSX.Element
```

<a id="api-4472617765722e5669727475616c4b6579626f61726450726f76696465722e2470726f70732e6368696c6472656e"></a>

<a id="DrawerVirtualKeyboardProvider-children"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| children | `JSX.Element` | No | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4472617765722e5669727475616c4b6579626f61726450726f76696465722e50726f7073"></a>

<a id="drawervirtualkeyboardproviderprops"></a>

### Related exported type: Drawer.VirtualKeyboardProvider.Props

Declaration: `packages/solid/build/types/drawer/virtual-keyboard-provider/DrawerVirtualKeyboardProvider.d.ts:10`

#### Declaration

```typescript
DrawerVirtualKeyboardProviderProps
```

<a id="api-4472617765722e5669727475616c4b6579626f61726450726f76696465722e50726f70732e6368696c6472656e"></a>

<a id="DrawerVirtualKeyboardProviderProps-children"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| children | `JSX.Element` | No | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4472617765722e5669727475616c4b6579626f61726450726f76696465722e5374617465"></a>

<a id="drawervirtualkeyboardproviderstate"></a>

### Related exported type: Drawer.VirtualKeyboardProvider.State

Declaration: `packages/solid/build/types/drawer/virtual-keyboard-provider/DrawerVirtualKeyboardProvider.d.ts:11`

#### Declaration

```typescript
DrawerVirtualKeyboardProviderState
```

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="portal"></a>

### Portal

<a id="api-4472617765722e506f7274616c"></a>

<a id="drawerportal"></a>

<a id="api-4472617765722e506f7274616c2e2470726f70732e70726f703a616c69676e"></a>

### Drawer.Portal

Declaration: `packages/solid/build/types/dialog/portal/DialogPortal.d.ts:2`

#### Declaration

```typescript
(props: DialogPortalProps) => JSX.Element
```

<a id="api-4472617765722e506f7274616c2e2470726f70732e636f6e7461696e6572"></a>

<a id="DrawerPortal-container"></a>

<a id="api-4472617765722e506f7274616c2e2470726f70732e6964"></a>

<a id="DrawerPortal-id"></a>

<a id="api-4472617765722e506f7274616c2e2470726f70732e636c617373"></a>

<a id="DrawerPortal-class"></a>

<a id="api-4472617765722e506f7274616c2e2470726f70732e7374796c65"></a>

<a id="DrawerPortal-style"></a>

<a id="api-4472617765722e506f7274616c2e2470726f70732e6b6565704d6f756e746564"></a>

<a id="DrawerPortal-keepMounted"></a>

<a id="api-4472617765722e506f7274616c2e2470726f70732e72656e646572"></a>

<a id="DrawerPortal-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| container | `PortalContainer` | No | Unavailable |  |
| id | `string \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<AlertDialogPortalState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AlertDialogPortalState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| keepMounted | `boolean \| undefined` | No | false |  |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, AlertDialogPortalState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4472617765722e506f7274616c2e50726f7073"></a>

<a id="drawerportalprops"></a>

<a id="api-4472617765722e506f7274616c2e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Drawer.Portal.Props

Declaration: `packages/solid/build/types/dialog/portal/DialogPortal.d.ts:11`

#### Declaration

```typescript
DialogPortalProps
```

<a id="api-4472617765722e506f7274616c2e50726f70732e636f6e7461696e6572"></a>

<a id="DrawerPortalProps-container"></a>

<a id="api-4472617765722e506f7274616c2e50726f70732e6964"></a>

<a id="DrawerPortalProps-id"></a>

<a id="api-4472617765722e506f7274616c2e50726f70732e636c617373"></a>

<a id="DrawerPortalProps-class"></a>

<a id="api-4472617765722e506f7274616c2e50726f70732e7374796c65"></a>

<a id="DrawerPortalProps-style"></a>

<a id="api-4472617765722e506f7274616c2e50726f70732e6b6565704d6f756e746564"></a>

<a id="DrawerPortalProps-keepMounted"></a>

<a id="api-4472617765722e506f7274616c2e50726f70732e72656e646572"></a>

<a id="DrawerPortalProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| container | `PortalContainer` | No | Unavailable |  |
| id | `string \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<AlertDialogPortalState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AlertDialogPortalState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| keepMounted | `boolean \| undefined` | No | Unavailable |  |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, AlertDialogPortalState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4472617765722e506f7274616c2e5374617465"></a>

<a id="drawerportalstate"></a>

### Related exported type: Drawer.Portal.State

Declaration: `packages/solid/build/types/dialog/portal/DialogPortal.d.ts:12`

#### Declaration

```typescript
DialogPortalState
```

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="backdrop"></a>

### Backdrop

<a id="api-4472617765722e4261636b64726f70"></a>

<a id="drawerbackdrop"></a>

<a id="api-4472617765722e4261636b64726f702e2470726f70732e70726f703a616c69676e"></a>

### Drawer.Backdrop

Declaration: `packages/solid/build/types/drawer/backdrop/DrawerBackdrop.d.ts:2`

#### Declaration

```typescript
(props: DrawerBackdropProps) => JSX.Element
```

<a id="api-4472617765722e4261636b64726f702e2470726f70732e666f72636552656e646572"></a>

<a id="DrawerBackdrop-forceRender"></a>

<a id="api-4472617765722e4261636b64726f702e2470726f70732e636c617373"></a>

<a id="DrawerBackdrop-class"></a>

<a id="api-4472617765722e4261636b64726f702e2470726f70732e7374796c65"></a>

<a id="DrawerBackdrop-style"></a>

<a id="api-4472617765722e4261636b64726f702e2470726f70732e72656e646572"></a>

<a id="DrawerBackdrop-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| forceRender | `boolean \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<DrawerBackdropState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<DrawerBackdropState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, DrawerBackdropState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-4472617765724261636b64726f7044617461417474726962757465732e6f70656e"></a>

<a id="api-4472617765724261636b64726f7044617461417474726962757465732e636c6f736564"></a>

<a id="api-4472617765724261636b64726f7044617461417474726962757465732e7374617274696e675374796c65"></a>

<a id="api-4472617765724261636b64726f7044617461417474726962757465732e656e64696e675374796c65"></a>

| Name | Description |
| --- | --- |
| data-open | Present when open is true. |
| data-closed | Present when open is false. |
| data-starting-style | Present when transitionStatus is 'starting'. |
| data-ending-style | Present when transitionStatus is 'ending'. |

#### CSS variables

<a id="api-4472617765724261636b64726f704373735661726961626c65732e737769706550726f6772657373"></a>

| Name | Description |
| --- | --- |
| --drawer-swipe-progress |  |

<a id="api-4472617765722e4261636b64726f702e50726f7073"></a>

<a id="drawerbackdropprops"></a>

<a id="api-4472617765722e4261636b64726f702e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Drawer.Backdrop.Props

Declaration: `packages/solid/build/types/drawer/backdrop/DrawerBackdrop.d.ts:11`

#### Declaration

```typescript
DrawerBackdropProps
```

<a id="api-4472617765722e4261636b64726f702e50726f70732e666f72636552656e646572"></a>

<a id="DrawerBackdropProps-forceRender"></a>

<a id="api-4472617765722e4261636b64726f702e50726f70732e636c617373"></a>

<a id="DrawerBackdropProps-class"></a>

<a id="api-4472617765722e4261636b64726f702e50726f70732e7374796c65"></a>

<a id="DrawerBackdropProps-style"></a>

<a id="api-4472617765722e4261636b64726f702e50726f70732e72656e646572"></a>

<a id="DrawerBackdropProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| forceRender | `boolean \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<DrawerBackdropState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<DrawerBackdropState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, DrawerBackdropState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4472617765722e4261636b64726f702e5374617465"></a>

<a id="drawerbackdropstate"></a>

### Related exported type: Drawer.Backdrop.State

Declaration: `packages/solid/build/types/drawer/backdrop/DrawerBackdrop.d.ts:12`

#### Declaration

```typescript
DrawerBackdropState
```

<a id="api-4472617765722e4261636b64726f702e53746174652e6f70656e"></a>

<a id="DrawerBackdropState-open"></a>

<a id="api-4472617765722e4261636b64726f702e53746174652e7472616e736974696f6e537461747573"></a>

<a id="DrawerBackdropState-transitionStatus"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| open | `boolean` | Yes | Unavailable |  |
| transitionStatus | `TransitionStatus` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="viewport"></a>

### Viewport

<a id="api-4472617765722e56696577706f7274"></a>

<a id="drawerviewport"></a>

<a id="api-4472617765722e56696577706f72742e2470726f70732e70726f703a616c69676e"></a>

### Drawer.Viewport

Declaration: `packages/solid/build/types/drawer/viewport/DrawerViewport.d.ts:2`

#### Declaration

```typescript
(props: DrawerViewportProps) => JSX.Element
```

<a id="api-4472617765722e56696577706f72742e2470726f70732e636c617373"></a>

<a id="DrawerViewport-class"></a>

<a id="api-4472617765722e56696577706f72742e2470726f70732e7374796c65"></a>

<a id="DrawerViewport-style"></a>

<a id="api-4472617765722e56696577706f72742e2470726f70732e72656e646572"></a>

<a id="DrawerViewport-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<DrawerViewportState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<DrawerViewportState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, DrawerViewportState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-44726177657256696577706f727444617461417474726962757465732e6f70656e"></a>

<a id="api-44726177657256696577706f727444617461417474726962757465732e636c6f736564"></a>

<a id="api-44726177657256696577706f727444617461417474726962757465732e6e6573746564"></a>

<a id="api-44726177657256696577706f727444617461417474726962757465732e7374617274696e675374796c65"></a>

<a id="api-44726177657256696577706f727444617461417474726962757465732e656e64696e675374796c65"></a>

| Name | Description |
| --- | --- |
| data-open |  |
| data-closed |  |
| data-nested |  |
| data-starting-style |  |
| data-ending-style |  |

#### CSS variables

<a id="api-44726177657256696577706f72744373735661726961626c65732e6b6579626f617264496e736574"></a>

| Name | Description |
| --- | --- |
| --drawer-keyboard-inset |  |

<a id="api-4472617765722e56696577706f72742e50726f7073"></a>

<a id="drawerviewportprops"></a>

<a id="api-4472617765722e56696577706f72742e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Drawer.Viewport.Props

Declaration: `packages/solid/build/types/drawer/viewport/DrawerViewport.d.ts:12`

#### Declaration

```typescript
DrawerViewportProps
```

<a id="api-4472617765722e56696577706f72742e50726f70732e636c617373"></a>

<a id="DrawerViewportProps-class"></a>

<a id="api-4472617765722e56696577706f72742e50726f70732e7374796c65"></a>

<a id="DrawerViewportProps-style"></a>

<a id="api-4472617765722e56696577706f72742e50726f70732e72656e646572"></a>

<a id="DrawerViewportProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<DrawerViewportState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<DrawerViewportState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, DrawerViewportState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4472617765722e56696577706f72742e5374617465"></a>

<a id="drawerviewportstate"></a>

### Related exported type: Drawer.Viewport.State

Declaration: `packages/solid/build/types/drawer/viewport/DrawerViewport.d.ts:13`

#### Declaration

```typescript
DrawerViewportState
```

<a id="api-4472617765722e56696577706f72742e53746174652e6f70656e"></a>

<a id="DrawerViewportState-open"></a>

<a id="api-4472617765722e56696577706f72742e53746174652e6e6573746564"></a>

<a id="DrawerViewportState-nested"></a>

<a id="api-4472617765722e56696577706f72742e53746174652e6e65737465644469616c6f674f70656e"></a>

<a id="DrawerViewportState-nestedDialogOpen"></a>

<a id="api-4472617765722e56696577706f72742e53746174652e7472616e736974696f6e537461747573"></a>

<a id="DrawerViewportState-transitionStatus"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| open | `boolean` | Yes | Unavailable |  |
| nested | `boolean` | Yes | Unavailable |  |
| nestedDialogOpen | `boolean` | Yes | Unavailable |  |
| transitionStatus | `TransitionStatus` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="popup"></a>

### Popup

<a id="api-4472617765722e506f707570"></a>

<a id="drawerpopup"></a>

<a id="api-4472617765722e506f7075702e2470726f70732e70726f703a616c69676e"></a>

### Drawer.Popup

Declaration: `packages/solid/build/types/drawer/popup/DrawerPopup.d.ts:4`

#### Declaration

```typescript
(props: DrawerPopupProps) => JSX.Element
```

<a id="api-4472617765722e506f7075702e2470726f70732e696e697469616c466f637573"></a>

<a id="DrawerPopup-initialFocus"></a>

<a id="api-4472617765722e506f7075702e2470726f70732e66696e616c466f637573"></a>

<a id="DrawerPopup-finalFocus"></a>

<a id="api-4472617765722e506f7075702e2470726f70732e6964"></a>

<a id="DrawerPopup-id"></a>

<a id="api-4472617765722e506f7075702e2470726f70732e636c617373"></a>

<a id="DrawerPopup-class"></a>

<a id="api-4472617765722e506f7075702e2470726f70732e7374796c65"></a>

<a id="DrawerPopup-style"></a>

<a id="api-4472617765722e506f7075702e2470726f70732e72656e646572"></a>

<a id="DrawerPopup-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| initialFocus | `DialogFocusTarget \| undefined` | No | Unavailable |  |
| finalFocus | `DialogFocusTarget \| undefined` | No | Unavailable |  |
| id | `string \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<DrawerPopupState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<DrawerPopupState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, DrawerPopupState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-447261776572506f70757044617461417474726962757465732e6f70656e"></a>

<a id="api-447261776572506f70757044617461417474726962757465732e636c6f736564"></a>

<a id="api-447261776572506f70757044617461417474726962757465732e657870616e646564"></a>

<a id="api-4472617765722e506f7075702e64617461417474726962757465732e646174612d6e6573746564"></a>

<a id="api-447261776572506f70757044617461417474726962757465732e6e65737465644472617765724f70656e"></a>

<a id="api-447261776572506f70757044617461417474726962757465732e6e657374656444726177657253776970696e67"></a>

<a id="api-447261776572506f70757044617461417474726962757465732e7377697065446972656374696f6e"></a>

<a id="api-447261776572506f70757044617461417474726962757465732e73776970654469736d697373"></a>

<a id="api-447261776572506f70757044617461417474726962757465732e73776970696e67"></a>

<a id="api-447261776572506f70757044617461417474726962757465732e7374617274696e675374796c65"></a>

<a id="api-447261776572506f70757044617461417474726962757465732e656e64696e675374796c65"></a>

| Name | Description |
| --- | --- |
| data-open | Present when open is true. |
| data-closed | Present when open is false. |
| data-expanded | Present when expanded is true. |
| data-nested | Present when nested is true. |
| data-nested-drawer-open | Present when nestedDrawerOpen is true. |
| data-nested-drawer-swiping | Present when nestedDrawerSwiping is true. |
| data-swipe-direction |  |
| data-swipe-dismiss |  |
| data-swiping | Present when swiping is true. |
| data-starting-style | Present when transitionStatus is 'starting'. |
| data-ending-style | Present when transitionStatus is 'ending'. |

#### CSS variables

<a id="api-447261776572506f7075704373735661726961626c65732e66726f6e746d6f7374486569676874"></a>

<a id="api-447261776572506f7075704373735661726961626c65732e686569676874"></a>

<a id="api-447261776572506f7075704373735661726961626c65732e736e6170506f696e744f6666736574"></a>

<a id="api-447261776572506f7075704373735661726961626c65732e73776970654d6f76656d656e7458"></a>

<a id="api-447261776572506f7075704373735661726961626c65732e73776970654d6f76656d656e7459"></a>

<a id="api-447261776572506f7075704373735661726961626c65732e7377697065537472656e677468"></a>

<a id="api-447261776572506f7075704373735661726961626c65732e6e657374656444726177657273"></a>

| Name | Description |
| --- | --- |
| --drawer-frontmost-height |  |
| --drawer-height |  |
| --drawer-snap-point-offset |  |
| --drawer-swipe-movement-x |  |
| --drawer-swipe-movement-y |  |
| --drawer-swipe-strength |  |
| --nested-drawers |  |

<a id="api-4472617765722e506f7075702e50726f7073"></a>

<a id="drawerpopupprops"></a>

<a id="api-4472617765722e506f7075702e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Drawer.Popup.Props

Declaration: `packages/solid/build/types/drawer/popup/DrawerPopup.d.ts:21`

#### Declaration

```typescript
DrawerPopupProps
```

<a id="api-4472617765722e506f7075702e50726f70732e696e697469616c466f637573"></a>

<a id="DrawerPopupProps-initialFocus"></a>

<a id="api-4472617765722e506f7075702e50726f70732e66696e616c466f637573"></a>

<a id="DrawerPopupProps-finalFocus"></a>

<a id="api-4472617765722e506f7075702e50726f70732e6964"></a>

<a id="DrawerPopupProps-id"></a>

<a id="api-4472617765722e506f7075702e50726f70732e636c617373"></a>

<a id="DrawerPopupProps-class"></a>

<a id="api-4472617765722e506f7075702e50726f70732e7374796c65"></a>

<a id="DrawerPopupProps-style"></a>

<a id="api-4472617765722e506f7075702e50726f70732e72656e646572"></a>

<a id="DrawerPopupProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| initialFocus | `DialogFocusTarget \| undefined` | No | Unavailable |  |
| finalFocus | `DialogFocusTarget \| undefined` | No | Unavailable |  |
| id | `string \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<DrawerPopupState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<DrawerPopupState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, DrawerPopupState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4472617765722e506f7075702e5374617465"></a>

<a id="drawerpopupstate"></a>

### Related exported type: Drawer.Popup.State

Declaration: `packages/solid/build/types/drawer/popup/DrawerPopup.d.ts:22`

#### Declaration

```typescript
DrawerPopupState
```

<a id="api-4472617765722e506f7075702e53746174652e6f70656e"></a>

<a id="DrawerPopupState-open"></a>

<a id="api-4472617765722e506f7075702e53746174652e657870616e646564"></a>

<a id="DrawerPopupState-expanded"></a>

<a id="api-4472617765722e506f7075702e53746174652e6e6573746564"></a>

<a id="DrawerPopupState-nested"></a>

<a id="api-4472617765722e506f7075702e53746174652e6e65737465644472617765724f70656e"></a>

<a id="DrawerPopupState-nestedDrawerOpen"></a>

<a id="api-4472617765722e506f7075702e53746174652e6e657374656444726177657253776970696e67"></a>

<a id="DrawerPopupState-nestedDrawerSwiping"></a>

<a id="api-4472617765722e506f7075702e53746174652e7377697065446972656374696f6e"></a>

<a id="DrawerPopupState-swipeDirection"></a>

<a id="api-4472617765722e506f7075702e53746174652e73776970696e67"></a>

<a id="DrawerPopupState-swiping"></a>

<a id="api-4472617765722e506f7075702e53746174652e7472616e736974696f6e537461747573"></a>

<a id="DrawerPopupState-transitionStatus"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| open | `boolean` | Yes | Unavailable |  |
| expanded | `boolean` | Yes | Unavailable |  |
| nested | `boolean` | Yes | Unavailable |  |
| nestedDrawerOpen | `boolean` | Yes | Unavailable |  |
| nestedDrawerSwiping | `boolean` | Yes | Unavailable |  |
| swipeDirection | `DrawerSwipeDirection` | Yes | Unavailable |  |
| swiping | `boolean` | Yes | Unavailable |  |
| transitionStatus | `TransitionStatus` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="content"></a>

### Content

<a id="api-4472617765722e436f6e74656e74"></a>

<a id="drawercontent"></a>

<a id="api-4472617765722e436f6e74656e742e2470726f70732e70726f703a616c69676e"></a>

### Drawer.Content

Declaration: `packages/solid/build/types/drawer/content/DrawerContent.d.ts:2`

#### Declaration

```typescript
(props: DrawerContentProps) => JSX.Element
```

<a id="api-4472617765722e436f6e74656e742e2470726f70732e636c617373"></a>

<a id="DrawerContent-class"></a>

<a id="api-4472617765722e436f6e74656e742e2470726f70732e7374796c65"></a>

<a id="DrawerContent-style"></a>

<a id="api-4472617765722e436f6e74656e742e2470726f70732e72656e646572"></a>

<a id="DrawerContent-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<DrawerContentState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<DrawerContentState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, DrawerContentState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4472617765722e436f6e74656e742e50726f7073"></a>

<a id="drawercontentprops"></a>

<a id="api-4472617765722e436f6e74656e742e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Drawer.Content.Props

Declaration: `packages/solid/build/types/drawer/content/DrawerContent.d.ts:8`

#### Declaration

```typescript
DrawerContentProps
```

<a id="api-4472617765722e436f6e74656e742e50726f70732e636c617373"></a>

<a id="DrawerContentProps-class"></a>

<a id="api-4472617765722e436f6e74656e742e50726f70732e7374796c65"></a>

<a id="DrawerContentProps-style"></a>

<a id="api-4472617765722e436f6e74656e742e50726f70732e72656e646572"></a>

<a id="DrawerContentProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<DrawerContentState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<DrawerContentState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, DrawerContentState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4472617765722e436f6e74656e742e5374617465"></a>

<a id="drawercontentstate"></a>

### Related exported type: Drawer.Content.State

Declaration: `packages/solid/build/types/drawer/content/DrawerContent.d.ts:9`

#### Declaration

```typescript
DrawerContentState
```

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="title"></a>

### Title

<a id="api-4472617765722e5469746c65"></a>

<a id="drawertitle"></a>

<a id="api-4472617765722e5469746c652e2470726f70732e70726f703a616c69676e"></a>

### Drawer.Title

Declaration: `packages/solid/build/types/dialog/title/DialogTitle.d.ts:2`

#### Declaration

```typescript
(props: DialogTitleProps) => JSX.Element
```

<a id="api-4472617765722e5469746c652e2470726f70732e6964"></a>

<a id="DrawerTitle-id"></a>

<a id="api-4472617765722e5469746c652e2470726f70732e636c617373"></a>

<a id="DrawerTitle-class"></a>

<a id="api-4472617765722e5469746c652e2470726f70732e7374796c65"></a>

<a id="DrawerTitle-style"></a>

<a id="api-4472617765722e5469746c652e2470726f70732e72656e646572"></a>

<a id="DrawerTitle-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| id | `string \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<AlertDialogTitleState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AlertDialogTitleState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, AlertDialogTitleState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4472617765722e5469746c652e50726f7073"></a>

<a id="drawertitleprops"></a>

<a id="api-4472617765722e5469746c652e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Drawer.Title.Props

Declaration: `packages/solid/build/types/dialog/title/DialogTitle.d.ts:9`

#### Declaration

```typescript
DialogTitleProps
```

<a id="api-4472617765722e5469746c652e50726f70732e6964"></a>

<a id="DrawerTitleProps-id"></a>

<a id="api-4472617765722e5469746c652e50726f70732e636c617373"></a>

<a id="DrawerTitleProps-class"></a>

<a id="api-4472617765722e5469746c652e50726f70732e7374796c65"></a>

<a id="DrawerTitleProps-style"></a>

<a id="api-4472617765722e5469746c652e50726f70732e72656e646572"></a>

<a id="DrawerTitleProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| id | `string \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<AlertDialogTitleState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AlertDialogTitleState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, AlertDialogTitleState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4472617765722e5469746c652e5374617465"></a>

<a id="drawertitlestate"></a>

### Related exported type: Drawer.Title.State

Declaration: `packages/solid/build/types/dialog/title/DialogTitle.d.ts:10`

#### Declaration

```typescript
DialogTitleState
```

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="description"></a>

### Description

<a id="api-4472617765722e4465736372697074696f6e"></a>

<a id="drawerdescription"></a>

<a id="api-4472617765722e4465736372697074696f6e2e2470726f70732e70726f703a616c69676e"></a>

### Drawer.Description

Declaration: `packages/solid/build/types/dialog/description/DialogDescription.d.ts:2`

#### Declaration

```typescript
(props: DialogDescriptionProps) => JSX.Element
```

<a id="api-4472617765722e4465736372697074696f6e2e2470726f70732e6964"></a>

<a id="DrawerDescription-id"></a>

<a id="api-4472617765722e4465736372697074696f6e2e2470726f70732e636c617373"></a>

<a id="DrawerDescription-class"></a>

<a id="api-4472617765722e4465736372697074696f6e2e2470726f70732e7374796c65"></a>

<a id="DrawerDescription-style"></a>

<a id="api-4472617765722e4465736372697074696f6e2e2470726f70732e72656e646572"></a>

<a id="DrawerDescription-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| id | `string \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<AlertDialogDescriptionState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AlertDialogDescriptionState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, AlertDialogDescriptionState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4472617765722e4465736372697074696f6e2e50726f7073"></a>

<a id="drawerdescriptionprops"></a>

<a id="api-4472617765722e4465736372697074696f6e2e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Drawer.Description.Props

Declaration: `packages/solid/build/types/dialog/description/DialogDescription.d.ts:9`

#### Declaration

```typescript
DialogDescriptionProps
```

<a id="api-4472617765722e4465736372697074696f6e2e50726f70732e6964"></a>

<a id="DrawerDescriptionProps-id"></a>

<a id="api-4472617765722e4465736372697074696f6e2e50726f70732e636c617373"></a>

<a id="DrawerDescriptionProps-class"></a>

<a id="api-4472617765722e4465736372697074696f6e2e50726f70732e7374796c65"></a>

<a id="DrawerDescriptionProps-style"></a>

<a id="api-4472617765722e4465736372697074696f6e2e50726f70732e72656e646572"></a>

<a id="DrawerDescriptionProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| id | `string \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<AlertDialogDescriptionState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AlertDialogDescriptionState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, AlertDialogDescriptionState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4472617765722e4465736372697074696f6e2e5374617465"></a>

<a id="drawerdescriptionstate"></a>

### Related exported type: Drawer.Description.State

Declaration: `packages/solid/build/types/dialog/description/DialogDescription.d.ts:10`

#### Declaration

```typescript
DialogDescriptionState
```

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="close"></a>

### Close

<a id="api-4472617765722e436c6f7365"></a>

<a id="drawerclose"></a>

<a id="api-4472617765722e436c6f73652e2470726f70732e70726f703a64697361626c6564"></a>

<a id="api-4472617765722e436c6f73652e2470726f70732e70726f703a666f726d416374696f6e"></a>

<a id="api-4472617765722e436c6f73652e2470726f70732e70726f703a666f726d456e6374797065"></a>

<a id="api-4472617765722e436c6f73652e2470726f70732e70726f703a666f726d4d6574686f64"></a>

<a id="api-4472617765722e436c6f73652e2470726f70732e70726f703a666f726d4e6f56616c6964617465"></a>

<a id="api-4472617765722e436c6f73652e2470726f70732e70726f703a666f726d546172676574"></a>

<a id="api-4472617765722e436c6f73652e2470726f70732e70726f703a6e616d65"></a>

<a id="api-4472617765722e436c6f73652e2470726f70732e70726f703a706f706f766572546172676574416374696f6e"></a>

<a id="api-4472617765722e436c6f73652e2470726f70732e70726f703a706f706f766572546172676574456c656d656e74"></a>

<a id="api-4472617765722e436c6f73652e2470726f70732e70726f703a74797065"></a>

<a id="api-4472617765722e436c6f73652e2470726f70732e70726f703a76616c7565"></a>

### Drawer.Close

Declaration: `packages/solid/build/types/dialog/close/DialogClose.d.ts:2`

#### Declaration

```typescript
(props: DialogCloseProps) => JSX.Element
```

<a id="api-4472617765722e436c6f73652e2470726f70732e6e6174697665427574746f6e"></a>

<a id="DrawerClose-nativeButton"></a>

<a id="api-4472617765722e436c6f73652e2470726f70732e64697361626c6564"></a>

<a id="DrawerClose-disabled"></a>

<a id="api-4472617765722e436c6f73652e2470726f70732e636c617373"></a>

<a id="DrawerClose-class"></a>

<a id="api-4472617765722e436c6f73652e2470726f70732e7374796c65"></a>

<a id="DrawerClose-style"></a>

<a id="api-4472617765722e436c6f73652e2470726f70732e72656e646572"></a>

<a id="DrawerClose-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| nativeButton | `boolean \| undefined` | No | true |  |
| disabled | `boolean \| undefined` | No | false |  |
| class | `JSX.ClassValue \| ((state: Readonly<AlertDialogCloseState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AlertDialogCloseState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, AlertDialogCloseState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `command`, `commandfor`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `form`, `formaction`, `formenctype`, `formmethod`, `formnovalidate`, `formtarget`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `name`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `popovertarget`, `popovertargetaction`, `prefix`, `prop:disabled`, `prop:formAction`, `prop:formEnctype`, `prop:formMethod`, `prop:formNoValidate`, `prop:formTarget`, `prop:name`, `prop:popoverTargetAction`, `prop:popoverTargetElement`, `prop:type`, `prop:value`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `type`, `typeof`, `value`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-4472617765722e436c6f73652e64617461417474726962757465732e64697361626c6564"></a>

| Name | Description |
| --- | --- |
| data-disabled |  |

#### CSS variables

Metadata status: unavailable.

<a id="api-4472617765722e436c6f73652e50726f7073"></a>

<a id="drawercloseprops"></a>

<a id="api-4472617765722e436c6f73652e50726f70732e70726f703a64697361626c6564"></a>

<a id="api-4472617765722e436c6f73652e50726f70732e70726f703a666f726d416374696f6e"></a>

<a id="api-4472617765722e436c6f73652e50726f70732e70726f703a666f726d456e6374797065"></a>

<a id="api-4472617765722e436c6f73652e50726f70732e70726f703a666f726d4d6574686f64"></a>

<a id="api-4472617765722e436c6f73652e50726f70732e70726f703a666f726d4e6f56616c6964617465"></a>

<a id="api-4472617765722e436c6f73652e50726f70732e70726f703a666f726d546172676574"></a>

<a id="api-4472617765722e436c6f73652e50726f70732e70726f703a6e616d65"></a>

<a id="api-4472617765722e436c6f73652e50726f70732e70726f703a706f706f766572546172676574416374696f6e"></a>

<a id="api-4472617765722e436c6f73652e50726f70732e70726f703a706f706f766572546172676574456c656d656e74"></a>

<a id="api-4472617765722e436c6f73652e50726f70732e70726f703a74797065"></a>

<a id="api-4472617765722e436c6f73652e50726f70732e70726f703a76616c7565"></a>

### Related exported type: Drawer.Close.Props

Declaration: `packages/solid/build/types/dialog/close/DialogClose.d.ts:11`

#### Declaration

```typescript
DialogCloseProps
```

<a id="api-4472617765722e436c6f73652e50726f70732e6e6174697665427574746f6e"></a>

<a id="DrawerCloseProps-nativeButton"></a>

<a id="api-4472617765722e436c6f73652e50726f70732e64697361626c6564"></a>

<a id="DrawerCloseProps-disabled"></a>

<a id="api-4472617765722e436c6f73652e50726f70732e636c617373"></a>

<a id="DrawerCloseProps-class"></a>

<a id="api-4472617765722e436c6f73652e50726f70732e7374796c65"></a>

<a id="DrawerCloseProps-style"></a>

<a id="api-4472617765722e436c6f73652e50726f70732e72656e646572"></a>

<a id="DrawerCloseProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| nativeButton | `boolean \| undefined` | No | Unavailable |  |
| disabled | `boolean \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<AlertDialogCloseState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AlertDialogCloseState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, AlertDialogCloseState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `command`, `commandfor`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `form`, `formaction`, `formenctype`, `formmethod`, `formnovalidate`, `formtarget`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `name`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `popovertarget`, `popovertargetaction`, `prefix`, `prop:disabled`, `prop:formAction`, `prop:formEnctype`, `prop:formMethod`, `prop:formNoValidate`, `prop:formTarget`, `prop:name`, `prop:popoverTargetAction`, `prop:popoverTargetElement`, `prop:type`, `prop:value`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `type`, `typeof`, `value`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4472617765722e436c6f73652e5374617465"></a>

<a id="drawerclosestate"></a>

### Related exported type: Drawer.Close.State

Declaration: `packages/solid/build/types/dialog/close/DialogClose.d.ts:12`

#### Declaration

```typescript
DialogCloseState
```

<a id="api-4472617765722e436c6f73652e53746174652e64697361626c6564"></a>

<a id="DrawerCloseState-disabled"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| disabled | `boolean` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="createhandle"></a>

## createHandle

<a id="api-4472617765722e63726561746548616e646c65"></a>

<a id="drawercreatehandle"></a>

### Drawer.createHandle

Declaration: `packages/solid/build/types/drawer/handle.d.ts:5`

#### Declaration

```typescript
<Payload = unknown>() => DrawerHandle<Payload>
```

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

#### Return value

```typescript
DrawerHandle<Payload>
```

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| __drawerBrand | `any` | Yes | Unavailable |  |
| open | `(triggerId: string \| null) => void` | Yes | Unavailable |  |
| openWithPayload | `(payload: Payload) => void` | Yes | Unavailable |  |
| close | `() => void` | Yes | Unavailable |  |
| setOpenMethod | `(method: InteractionType) => void` | Yes | Unavailable |  |
| isOpen | `boolean` | Yes | Unavailable |  |
| fallbackStore | `DialogHandleStore<Payload>` | Yes | Unavailable |  |
| componentName | `any` | Yes | Unavailable |  |
| throwOnMissingTrigger | `any` | Yes | Unavailable |  |
| attached | `any` | Yes | Unavailable |  |
| current | `any` | Yes | Unavailable |  |
| version | `any` | Yes | Unavailable |  |
| warning | `any` | Yes | Unavailable |  |
| attachedStore | `DialogStore<Payload> \| null` | Yes | Unavailable |  |
| store | `DialogHandleStore<Payload>` | Yes | Unavailable |  |
| serverStore | `DialogHandleStore<Payload>` | Yes | Unavailable |  |
| attachStore | `(store: DialogStore<Payload>) => () => void` | Yes | Unavailable |  |
| activate | `any` | Yes | Unavailable |  |
| openByTrigger | `(id: string \| null \| undefined) => void` | Yes | Unavailable |  |
| closePopup | `() => void` | Yes | Unavailable |  |

[//]: # "@exclude-table-of-contents"

<a id="handle"></a>

### Handle

<a id="api-4472617765722e48616e646c65"></a>

<a id="drawerhandle"></a>

### Drawer.Handle

Declaration: `packages/solid/build/types/drawer/handle.d.ts:2`

#### Declaration

```typescript
DrawerHandle<Payload>
```

<a id="api-4472617765722e48616e646c652e6f70656e"></a>

<a id="DrawerHandle-open"></a>

<a id="api-4472617765722e48616e646c652e5f5f6472617765724272616e64"></a>

<a id="DrawerHandle-__drawerBrand"></a>

<a id="api-4472617765722e48616e646c652e6163746976617465"></a>

<a id="DrawerHandle-activate"></a>

<a id="api-4472617765722e48616e646c652e61747461636853746f7265"></a>

<a id="DrawerHandle-attachStore"></a>

<a id="api-4472617765722e48616e646c652e6174746163686564"></a>

<a id="DrawerHandle-attached"></a>

<a id="api-4472617765722e48616e646c652e617474616368656453746f7265"></a>

<a id="DrawerHandle-attachedStore"></a>

<a id="api-4472617765722e48616e646c652e636c6f7365"></a>

<a id="DrawerHandle-close"></a>

<a id="api-4472617765722e48616e646c652e636c6f7365506f707570"></a>

<a id="DrawerHandle-closePopup"></a>

<a id="api-4472617765722e48616e646c652e636f6d706f6e656e744e616d65"></a>

<a id="DrawerHandle-componentName"></a>

<a id="api-4472617765722e48616e646c652e63757272656e74"></a>

<a id="DrawerHandle-current"></a>

<a id="api-4472617765722e48616e646c652e66616c6c6261636b53746f7265"></a>

<a id="DrawerHandle-fallbackStore"></a>

<a id="api-4472617765722e48616e646c652e69734f70656e"></a>

<a id="DrawerHandle-isOpen"></a>

<a id="api-4472617765722e48616e646c652e6f70656e427954726967676572"></a>

<a id="DrawerHandle-openByTrigger"></a>

<a id="api-4472617765722e48616e646c652e6f70656e576974685061796c6f6164"></a>

<a id="DrawerHandle-openWithPayload"></a>

<a id="api-4472617765722e48616e646c652e73657276657253746f7265"></a>

<a id="DrawerHandle-serverStore"></a>

<a id="api-4472617765722e48616e646c652e7365744f70656e4d6574686f64"></a>

<a id="DrawerHandle-setOpenMethod"></a>

<a id="api-4472617765722e48616e646c652e73746f7265"></a>

<a id="DrawerHandle-store"></a>

<a id="api-4472617765722e48616e646c652e7468726f774f6e4d697373696e6754726967676572"></a>

<a id="DrawerHandle-throwOnMissingTrigger"></a>

<a id="api-4472617765722e48616e646c652e76657273696f6e"></a>

<a id="DrawerHandle-version"></a>

<a id="api-4472617765722e48616e646c652e7761726e696e67"></a>

<a id="DrawerHandle-warning"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| open | `(triggerId: string \| null) => void` | Yes | Unavailable |  |
| __drawerBrand | `any` | Yes | Unavailable |  |
| activate | `any` | Yes | Unavailable |  |
| attachStore | `(store: DialogStore<Payload>) => () => void` | Yes | Unavailable |  |
| attached | `any` | Yes | Unavailable |  |
| attachedStore | `DialogStore<Payload> \| null` | Yes | Unavailable |  |
| close | `() => void` | Yes | Unavailable |  |
| closePopup | `() => void` | Yes | Unavailable |  |
| componentName | `any` | Yes | Unavailable |  |
| current | `any` | Yes | Unavailable |  |
| fallbackStore | `DialogHandleStore<Payload>` | Yes | Unavailable |  |
| isOpen | `boolean` | Yes | Unavailable |  |
| openByTrigger | `(id: string \| null \| undefined) => void` | Yes | Unavailable |  |
| openWithPayload | `(payload: Payload) => void` | Yes | Unavailable |  |
| serverStore | `DialogHandleStore<Payload>` | Yes | Unavailable |  |
| setOpenMethod | `(method: InteractionType) => void` | Yes | Unavailable |  |
| store | `DialogHandleStore<Payload>` | Yes | Unavailable |  |
| throwOnMissingTrigger | `any` | Yes | Unavailable |  |
| version | `any` | Yes | Unavailable |  |
| warning | `any` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

