# Preview Card

A link that shows a destination preview without interrupting keyboard or screen reader navigation.



[Interactive example](/solid/components/preview-card)



## Usage guidelines

- **Protect screen reader users' current context**: Exposing each preview to screen readers would force users through its contents before they could continue through the page, repeatedly disrupting their current context. Keep the link as the only accessible interface and include all previewed information at its destination.
- **Keep popup content supplementary**: Avoid placing unique or essential information in the popup unless it is also available on the linked page. For the reason above, preview card content is not touch, keyboard or screen reader navigable. It acts as a visual [progressive enhancement](https://developer.mozilla.org/en-US/docs/Glossary/Progressive_Enhancement) for sighted mouse and keyboard users only.

## Anatomy

Import the component and assemble its parts:

```tsx
import { PreviewCard } from 'baseui-solid2/preview-card';
<PreviewCard.Root>
  <PreviewCard.Trigger />
  <PreviewCard.Portal>
    <PreviewCard.Backdrop />
    <PreviewCard.Positioner>
      <PreviewCard.Popup>
        <PreviewCard.Arrow />
        <PreviewCard.Viewport />
      </PreviewCard.Popup>
    </PreviewCard.Positioner>
  </PreviewCard.Portal>
</PreviewCard.Root>;
```

## Examples

### Detached triggers

A preview card can be controlled by a trigger located either inside or outside the `<PreviewCard.Root>` component.
For simple, one-off interactions, place the `<PreviewCard.Trigger>` inside `<PreviewCard.Root>`, as shown in the example at the top of this page.

However, if defining the preview card's content next to its trigger is not practical, you can use a detached trigger.
This involves placing the `<PreviewCard.Trigger>` outside of `<PreviewCard.Root>` and linking them with a `handle` created by the `PreviewCard.createHandle()` function.

The imperative methods on the handle, such as `open()` and `close()`, require a `<PreviewCard.Root>` using the same handle to be mounted.
Calls made while no root is attached to the handle — before one mounts, or after it unmounts — are ignored. Each time a root mounts, it starts from fresh state: a call made while no root was attached is not replayed, and no open state carries over from a previous mount.

```tsx
const demoPreviewCard = PreviewCard.createHandle();



<PreviewCard.Trigger handle={demoPreviewCard} href="#">
  Link
</PreviewCard.Trigger>



<PreviewCard.Root handle={demoPreviewCard}>
  ...
</PreviewCard.Root>;
```

[Interactive example](/solid/components/preview-card)

### Multiple triggers

A single preview card can be opened by multiple trigger elements.
You can achieve this by using the same `handle` for several detached triggers, or by placing multiple `<PreviewCard.Trigger>` components inside a single `<PreviewCard.Root>`.

```tsx
<PreviewCard.Root>
  <PreviewCard.Trigger href="#">Trigger 1</PreviewCard.Trigger>
  <PreviewCard.Trigger href="#">Trigger 2</PreviewCard.Trigger>
  ...
</PreviewCard.Root>;
```

```tsx
const demoPreviewCard = PreviewCard.createHandle();

<PreviewCard.Trigger handle={demoPreviewCard} href="#">
  Trigger 1
</PreviewCard.Trigger>

<PreviewCard.Trigger handle={demoPreviewCard} href="#">
  Trigger 2
</PreviewCard.Trigger>

<PreviewCard.Root handle={demoPreviewCard}>
  ...
</PreviewCard.Root>
```

The preview card can render different content depending on which trigger opened it.
This is achieved by passing a `payload` to the `<PreviewCard.Trigger>` and using the function-as-a-child pattern in `<PreviewCard.Root>`.

The payload can be strongly typed by providing a type argument to the `createHandle()` function:

```tsx

const demoPreviewCard = PreviewCard.createHandle<{ title: string }>();



<PreviewCard.Trigger handle={demoPreviewCard} payload={{ title: 'Trigger 1' }} href="#">
  Trigger 1
</PreviewCard.Trigger>



<PreviewCard.Trigger handle={demoPreviewCard} payload={{ title: 'Trigger 2' }} href="#">
  Trigger 2
</PreviewCard.Trigger>

<PreviewCard.Root handle={demoPreviewCard}>
  {({ payload }) => ( 
    <PreviewCard.Portal>
      <PreviewCard.Positioner sideOffset={8}>
        <PreviewCard.Popup>
          {payload !== undefined && ( 
            <span>
              Preview card opened by {payload.title} 
            </span>
          )}
        </PreviewCard.Popup>
      </PreviewCard.Positioner>
    </PreviewCard.Portal>
  )}
</PreviewCard.Root>
```

### Controlled mode with multiple triggers

You can control the preview card's open state externally using the `open` and `onOpenChange` props on `<PreviewCard.Root>`.
This allows you to manage the preview card's visibility based on your application's state.
When using multiple triggers, you have to manage which trigger is active with the `triggerId` prop on `<PreviewCard.Root>` and the `id` prop on each `<PreviewCard.Trigger>`.

Note that there is no separate `onTriggerIdChange` prop.
Instead, the `onOpenChange` callback receives an additional argument, `eventDetails`, which contains the trigger element that initiated the state change.

[Interactive example](/solid/components/preview-card)

### Animating the Preview Card

You can animate a preview card as it moves between different trigger elements.
This includes animating its position, size, and content.

#### Position and Size

To animate the preview card's position, apply CSS transitions to the `left`, `right`, `top`, and `bottom` properties of the **Positioner** part.
To animate its size, transition the `width` and `height` of the **Popup** part.

#### Content

The preview card also supports content transitions.
This is useful when different triggers display different content within the same preview card.

To enable content animations, wrap the content in the `<PreviewCard.Viewport>` part.
This part provides features to create direction-aware animations.
It renders a `div` with a `data-activation-direction` attribute that indicates the new trigger's position relative to the previous one. The value is a space-separated set of up to two tokens (one per axis) — `left` or `right` for the horizontal axis and `up` or `down` for the vertical axis (for example, `right down`). Match a single token with the `~=` attribute selector, such as `[data-activation-direction~='right']`.

Inside the `<PreviewCard.Viewport>`, the content is further wrapped in `div`s with data attributes to help with styling:

- `data-current`: The currently visible content when no transitions are present or the incoming content.
- `data-previous`: The outgoing content during a transition.

You can use these attributes to style the enter and exit animations.

[Interactive example](/solid/components/preview-card)

## API reference

### Root

Groups the preview card parts without adding an element.

| Prop | Type | Description |
| --- | --- | --- |
| defaultOpen | boolean \| undefined |  |
| open | boolean \| undefined |  |
| onOpenChange | ((open: boolean, details: PreviewCardRootChangeEventDetails) => void) \| undefined |  |
| actionsRef | ((actions: PreviewCardRootActions \| null) => void) \| undefined | Native callback ref; receives null on disposal or replacement. |
| defaultTriggerId | string \| null \| undefined |  |
| handle | PreviewCardHandle<Payload> \| undefined |  |
| onOpenChangeComplete | ((open: boolean) => void) \| undefined |  |
| triggerId | string \| null \| undefined |  |
| children | JSX.Element \| ((context: { readonly payload: Payload \| undefined; }) => JSX.Element) |  |

### Trigger

A link which opens a preview on pointer rest or keyboard focus.

| Prop | Type | Description |
| --- | --- | --- |
| handle | PreviewCardHandle<Payload> \| undefined |  |
| payload | Payload \| undefined |  |
| delay | number \| undefined | Pointer rest / focus delay, in milliseconds. |
| closeDelay | number \| undefined | Close delay, in milliseconds. |
| class | JSX.ClassValue \| ((state: Readonly<PreviewCardTriggerState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<PreviewCardTriggerState>) => StyleValue) |  |
| render | ComponentRenderFn<JSX.AnchorHTMLAttributes<HTMLAnchorElement> & JSX.Properties<HTMLAnchorElement>, PreviewCardTriggerState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Portal



| Prop | Type | Description |
| --- | --- | --- |
| container | PortalContainer |  |
| class | JSX.ClassValue \| ((state: Readonly<PreviewCardPortalState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<PreviewCardPortalState>) => StyleValue) |  |
| keepMounted | boolean \| undefined |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, PreviewCardPortalState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Backdrop



| Prop | Type | Description |
| --- | --- | --- |
| class | JSX.ClassValue \| ((state: Readonly<PreviewCardBackdropState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<PreviewCardBackdropState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, PreviewCardBackdropState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Positioner



| Prop | Type | Description |
| --- | --- | --- |
| disableAnchorTracking | boolean \| undefined |  |
| align | Align \| undefined |  |
| alignOffset | number \| OffsetFunction \| undefined |  |
| side | Side \| undefined |  |
| sideOffset | number \| OffsetFunction \| undefined |  |
| arrowPadding | number \| undefined |  |
| anchor | ReferenceType \| (() => ReferenceType \| null) \| null \| undefined |  |
| collisionAvoidance | { side?: "flip" \| "shift" \| "none"; align?: "flip" \| "shift" \| "none"; fallbackAxisSide?: "start" \| "end" \| "none"; } \| undefined |  |
| collisionBoundary | Boundary \| "clipping-ancestors" \| undefined |  |
| collisionPadding | Padding \| undefined |  |
| sticky | boolean \| undefined |  |
| positionMethod | "fixed" \| "absolute" \| undefined |  |
| class | JSX.ClassValue \| ((state: Readonly<PreviewCardPositionerState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<PreviewCardPositionerState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, PreviewCardPositionerState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Popup



| Prop | Type | Description |
| --- | --- | --- |
| class | JSX.ClassValue \| ((state: Readonly<PreviewCardPopupState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<PreviewCardPopupState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, PreviewCardPopupState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Viewport

Owned current/previous content lifetimes are supplied by the popup foundation.

| Prop | Type | Description |
| --- | --- | --- |
| class | JSX.ClassValue \| ((state: Readonly<PreviewCardViewportState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<PreviewCardViewportState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, PreviewCardViewportState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

The `Viewport` is optional — reach for it only when a single popup is opened by multiple triggers, its content differs per trigger, and the switch between them is animated. When used, set `width: var(--positioner-width)` and `height: var(--positioner-height)` on the `Positioner` so its box is frozen to the measured size during the transition; otherwise content-driven resizing can make the popup thrash or flip to another side.

### Arrow



| Prop | Type | Description |
| --- | --- | --- |
| class | JSX.ClassValue \| ((state: Readonly<PreviewCardArrowState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<PreviewCardArrowState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, PreviewCardArrowState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

## createHandle



| Prop | Type | Description |
| --- | --- | --- |


### Handle

Associates detached links with the last attached living PreviewCard.Root.

| Prop | Type | Description |
| --- | --- | --- |


