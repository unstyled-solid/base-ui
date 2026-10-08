# Popover

An accessible popup anchored to a button.



[Interactive example](/solid/components/popover)

## Anatomy

Import the component and assemble its parts:

```tsx
import { Popover } from 'baseui-solid2/popover';
<Popover.Root>
  <Popover.Trigger />
  <Popover.Portal>
    <Popover.Backdrop />
    <Popover.Positioner>
      <Popover.Popup>
        <Popover.Arrow />
        <Popover.Viewport>
          <Popover.Title />
          <Popover.Description />
          <Popover.Close />
        </Popover.Viewport>
      </Popover.Popup>
    </Popover.Positioner>
  </Popover.Portal>
</Popover.Root>;
```

## Examples

### Opening on hover

This example shows how you can configure the popover to open on hover using the `openOnHover` prop.

You can use the `delay` prop to specify how long to wait (in milliseconds) before the popover opens on hover.

[Interactive example](/solid/components/popover)

### Detached triggers

A popover can be controlled by a trigger located either inside or outside the `<Popover.Root>` component.
For simple, one-off interactions, place the `<Popover.Trigger>` inside `<Popover.Root>`, as shown in the example at the top of this page.

However, if defining the popover's content next to its trigger is not practical, you can use a detached trigger.
This involves placing the `<Popover.Trigger>` outside of `<Popover.Root>` and linking them with a `handle` created by the `Popover.createHandle()` function.

The imperative methods on the handle, such as `open()` and `close()`, require a `<Popover.Root>` using the same handle to be mounted.
Calls made while no root is attached to the handle — before one mounts, or after it unmounts — are ignored. Each time a root mounts, it starts from fresh state: a call made while no root was attached is not replayed, and no open state carries over from a previous mount.

```tsx
const demoPopover = Popover.createHandle();



<Popover.Trigger handle={demoPopover}>
  Trigger
</Popover.Trigger>



<Popover.Root handle={demoPopover}>
  ...
</Popover.Root>
```

[Interactive example](/solid/components/popover)

### Multiple triggers

A single popover can be opened by multiple trigger elements.
You can achieve this by using the same `handle` for several detached triggers, or by placing multiple `<Popover.Trigger>` components inside a single `<Popover.Root>`.

```tsx
<Popover.Root>
  <Popover.Trigger>Trigger 1</Popover.Trigger>
  <Popover.Trigger>Trigger 2</Popover.Trigger>
  ...
</Popover.Root>;
```

```tsx
const demoPopover = Popover.createHandle();

<Popover.Trigger handle={demoPopover}>
  Trigger 1
</Popover.Trigger>

<Popover.Trigger handle={demoPopover}>
  Trigger 2
</Popover.Trigger>

<Popover.Root handle={demoPopover}>
  ...
</Popover.Root>
```

The popover can render different content depending on which trigger opened it.
This is achieved by passing a `payload` to the `<Popover.Trigger>` and using the function-as-a-child pattern in `<Popover.Root>`.

The payload can be strongly typed by providing a type argument to the `createHandle()` function:

```tsx

const demoPopover = Popover.createHandle<{ text: string }>();



<Popover.Trigger handle={demoPopover} payload={{ text: 'Trigger 1' }}>
  Trigger 1
</Popover.Trigger>



<Popover.Trigger handle={demoPopover} payload={{ text: 'Trigger 2' }}>
  Trigger 2
</Popover.Trigger>

<Popover.Root handle={demoPopover}>
  {({ payload }) => ( 
    <Popover.Portal>
      <Popover.Positioner sideOffset={8}>
        <Popover.Popup class={styles.Popup}>
          <Popover.Arrow class={styles.Arrow}>
            <ArrowSvg />
          </Popover.Arrow>
          <Popover.Title class={styles.Title}>Popover</Popover.Title>
          {payload !== undefined && ( 
            <Popover.Description class={styles.Description}>
              This has been opened by {payload.text} 
            </Popover.Description>
          )}
        </Popover.Popup>
      </Popover.Positioner>
    </Popover.Portal>
  )}
</Popover.Root>
```

### Controlled mode with multiple triggers

You can control the popover's open state externally using the `open` and `onOpenChange` props on `<Popover.Root>`.
This allows you to manage the popover's visibility based on your application's state.
When using multiple triggers, you have to manage which trigger is active with the `triggerId` prop on `<Popover.Root>` and the `id` prop on each `<Popover.Trigger>`.

Note that there is no separate `onTriggerIdChange` prop.
Instead, the `onOpenChange` callback receives an additional argument, `eventDetails`, which contains the trigger element that initiated the state change.

[Interactive example](/solid/components/popover)

### Animating the Popover

You can animate a popover as it moves between different trigger elements.
This includes animating its position, size, and content.

#### Position and Size

To animate the popover's position, apply CSS transitions to the `left`, `right`, `top`, and `bottom` properties of the **Positioner** part.
To animate its size, transition the `width` and `height` of the **Popup** part.

#### Content

The popover also supports content transitions.
This is useful when different triggers display different content within the same popover.

To enable content animations, wrap the content in the `<Popover.Viewport>` part.
This part provides features to create direction-aware animations.
It renders a `div` with a `data-activation-direction` attribute that indicates the new trigger's position relative to the previous one. The value is a space-separated set of up to two tokens (one per axis) — `left` or `right` for the horizontal axis and `up` or `down` for the vertical axis (for example, `right down`). Match a single token with the `~=` attribute selector, such as `[data-activation-direction~='right']`.

Inside the `<Popover.Viewport>`, the content is further wrapped in `div`s with data attributes to help with styling:

- `data-current`: The currently visible content when no transitions are present or the incoming content.
- `data-previous`: The outgoing content during a transition.

You can use these attributes to style the enter and exit animations.

[Interactive example](/solid/components/popover)

## API reference

### Root



| Prop | Type | Description |
| --- | --- | --- |
| defaultOpen | boolean \| undefined |  |
| open | boolean \| undefined |  |
| onOpenChange | ((open: boolean, details: PopoverRootChangeEventDetails) => void) \| undefined |  |
| actionsRef | ((actions: PopoverRootActions \| null) => void) \| undefined | Native callback attachment; dispose clears the attachment. |
| defaultTriggerId | string \| null \| undefined |  |
| handle | PopoverHandle<Payload> \| undefined |  |
| modal | boolean \| "trap-focus" \| undefined |  |
| onOpenChangeComplete | ((open: boolean) => void) \| undefined |  |
| triggerId | string \| null \| undefined |  |
| children | JSX.Element \| ((state: { readonly payload: Payload \| undefined; }) => JSX.Element) |  |

### Trigger



| Prop | Type | Description |
| --- | --- | --- |
| handle | PopoverHandle<Payload> \| undefined |  |
| nativeButton | boolean \| undefined |  |
| payload | NoInfer<Payload> \| undefined |  |
| disabled | boolean \| undefined |  |
| openOnHover | boolean \| undefined |  |
| delay | number \| undefined |  |
| closeDelay | number \| undefined |  |
| id | string \| undefined |  |
| class | JSX.ClassValue \| ((state: Readonly<PopoverTriggerState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<PopoverTriggerState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, PopoverTriggerState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Backdrop



| Prop | Type | Description |
| --- | --- | --- |
| class | JSX.ClassValue \| ((state: Readonly<PopoverBackdropState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<PopoverBackdropState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, PopoverBackdropState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Portal



| Prop | Type | Description |
| --- | --- | --- |
| container | PortalContainer |  |
| id | string \| undefined |  |
| class | JSX.ClassValue \| ((state: Readonly<PopoverPortalState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<PopoverPortalState>) => StyleValue) |  |
| keepMounted | boolean \| undefined |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, PopoverPortalState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

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
| class | JSX.ClassValue \| ((state: Readonly<PopoverPositionerState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<PopoverPositionerState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, PopoverPositionerState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Popup



| Prop | Type | Description |
| --- | --- | --- |
| initialFocus | PopoverFocusTarget \| undefined |  |
| finalFocus | PopoverFocusTarget \| undefined |  |
| id | string \| undefined |  |
| class | JSX.ClassValue \| ((state: Readonly<PopoverPopupState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<PopoverPopupState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, PopoverPopupState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Arrow



| Prop | Type | Description |
| --- | --- | --- |
| class | JSX.ClassValue \| ((state: Readonly<PopoverArrowState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<PopoverArrowState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, PopoverArrowState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Title



| Prop | Type | Description |
| --- | --- | --- |
| id | string \| undefined |  |
| class | JSX.ClassValue \| ((state: Readonly<PopoverTitleState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<PopoverTitleState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, PopoverTitleState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Description



| Prop | Type | Description |
| --- | --- | --- |
| id | string \| undefined |  |
| class | JSX.ClassValue \| ((state: Readonly<PopoverDescriptionState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<PopoverDescriptionState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, PopoverDescriptionState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Close



| Prop | Type | Description |
| --- | --- | --- |
| nativeButton | boolean \| undefined |  |
| disabled | boolean \| undefined |  |
| class | JSX.ClassValue \| ((state: Readonly<PopoverCloseState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<PopoverCloseState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, PopoverCloseState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Viewport



| Prop | Type | Description |
| --- | --- | --- |
| class | JSX.ClassValue \| ((state: Readonly<PopoverViewportState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<PopoverViewportState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, PopoverViewportState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

The `Viewport` is optional — reach for it only when a single popup is opened by multiple triggers, its content differs per trigger, and the switch between them is animated. When used, set `width: var(--positioner-width)` and `height: var(--positioner-height)` on the `Positioner` so its box is frozen to the measured size during the transition; otherwise content-driven resizing can make the popup thrash or flip to another side.

## createHandle



| Prop | Type | Description |
| --- | --- | --- |


### Handle

Attachment, fallback migration and diagnostics are shared popup-engine behavior.

| Prop | Type | Description |
| --- | --- | --- |


