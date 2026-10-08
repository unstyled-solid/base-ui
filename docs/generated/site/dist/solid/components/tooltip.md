# Tooltip

A popup that appears when an element is hovered or focused, showing a hint for sighted users.



[Interactive example](/solid/components/tooltip)

## Usage guidelines

- **Prefer using tooltips as visual labels only**: Tooltips should act as supplementary visual labels for sighted mouse and keyboard users. Tooltips alone are not accessible to touch or screen reader users. See [Alternatives to tooltips](#alternatives-to-tooltips) for more details.
- **Provide an accessible name for the trigger**: Tooltips are visual-only elements and are not a replacement for labeling the trigger. The tooltip's trigger must have an `aria-label` attribute that closely matches the tooltip's content to ensure consistency for screen reader users.

## Anatomy

Import the component and assemble its parts:

```tsx
import { Tooltip } from 'baseui-solid2/tooltip';
<Tooltip.Provider>
  <Tooltip.Root>
    <Tooltip.Trigger />
    <Tooltip.Portal>
      <Tooltip.Positioner>
        <Tooltip.Popup>
          <Tooltip.Arrow />
          <Tooltip.Viewport />
        </Tooltip.Popup>
      </Tooltip.Positioner>
    </Tooltip.Portal>
  </Tooltip.Root>
</Tooltip.Provider>;
```

## Alternatives to tooltips

Tooltips should be supplementary popups that provide non-essential clarity in high-density UIs. A user should not miss critical information if they never see a tooltip.

Tooltips don't work well with touch input. Unlike mouse pointers with hover capability, there's no easily discoverable way to reveal a tooltip before tapping its trigger on a touch device.

iOS doesn't provide a system-standard, touch-friendly tooltip affordance, while Android may show a tooltip on long press. However, on the web, long press is often used to trigger contextual menus in the browser, which can lead to potential conflicts. For this reason, tooltips are disabled on touch devices.

### Infotips

Popups that open when hovering an info icon should use [Popover](/solid/components/popover) with the `openOnHover` prop on the trigger instead of a tooltip. This way, touch users and screen reader users can access the content.

To know when to reach for a popover instead of a tooltip, consider the **purpose** of the trigger element:
If the trigger's purpose is to open the popup itself, it's a popover. If the trigger's purpose is unrelated to opening the popup, it's a tooltip.

### Description text

Tooltips are designed for sighted users and are not a reliable way to deliver important information to touch users or assistive technologies. If the description is important to understanding the element, don't hide it behind a tooltip — use inline text or [Popover](/solid/components/popover) if space is limited, so the information is accessible to everyone.

Since tooltips serve sighted mouse and keyboard users, iconography should clearly communicate the purpose of icon-only triggers, especially on mobile where the text label may not be visible.

If the description is not critical, a tooltip can still be used to provide extra clarity for sighted mouse or keyboard users.

### Contextual feedback messages

Use the Toast component's [anchoring ability](/solid/components/toast#anchored-toasts) for more ergonomic DX, to ensure the message is announced to screen readers, and to support complex content.

## Examples

### Detached triggers

A tooltip can be controlled by a trigger located either inside or outside the `<Tooltip.Root>` component.
For simple, one-off interactions, place the `<Tooltip.Trigger>` inside `<Tooltip.Root>`, as shown in the example at the top of this page.

However, if defining the tooltip's content next to its trigger is not practical, you can use a detached trigger.
This involves placing the `<Tooltip.Trigger>` outside of `<Tooltip.Root>` and linking them with a `handle` created by the `Tooltip.createHandle()` function.

The imperative methods on the handle, such as `open()` and `close()`, require a `<Tooltip.Root>` using the same handle to be mounted.
Calls made while no root is attached to the handle — before one mounts, or after it unmounts — are ignored. Each time a root mounts, it starts from fresh state: a call made while no root was attached is not replayed, and no open state carries over from a previous mount.

```tsx
const demoTooltip = Tooltip.createHandle();



<Tooltip.Trigger handle={demoTooltip}>Button</Tooltip.Trigger>



<Tooltip.Root handle={demoTooltip}>
  ...
</Tooltip.Root>
```

[Interactive example](/solid/components/tooltip)

### Multiple triggers

A single tooltip can be opened by multiple trigger elements.
You can achieve this by using the same `handle` for several detached triggers, or by placing multiple `<Tooltip.Trigger>` components inside a single `<Tooltip.Root>`.

```tsx
<Tooltip.Root>
  <Tooltip.Trigger>Trigger 1</Tooltip.Trigger>
  <Tooltip.Trigger>Trigger 2</Tooltip.Trigger>
  ...
</Tooltip.Root>;
```

```tsx
const demoTooltip = Tooltip.createHandle();

<Tooltip.Trigger handle={demoTooltip}>
  Trigger 1
</Tooltip.Trigger>

<Tooltip.Trigger handle={demoTooltip}>
  Trigger 2
</Tooltip.Trigger>

<Tooltip.Root handle={demoTooltip}>
  ...
</Tooltip.Root>
```

The tooltip can render different content depending on which trigger opened it.
This is achieved by passing a `payload` to the `<Tooltip.Trigger>` and using the function-as-a-child pattern in `<Tooltip.Root>`.

The payload can be strongly typed by providing a type argument to the `createHandle()` function:

```tsx

const demoTooltip = Tooltip.createHandle<{ text: string }>();



<Tooltip.Trigger handle={demoTooltip} payload={{ text: 'Trigger 1' }}>
  Trigger 1
</Tooltip.Trigger>



<Tooltip.Trigger handle={demoTooltip} payload={{ text: 'Trigger 2' }}>
  Trigger 2
</Tooltip.Trigger>

<Tooltip.Root handle={demoTooltip}>
  {({ payload }) => ( 
    <Tooltip.Portal>
      <Tooltip.Positioner sideOffset={8}>
        <Tooltip.Popup class={styles.Popup}>
          <Tooltip.Arrow class={styles.Arrow}>
            <ArrowSvg />
          </Tooltip.Arrow>
          {payload !== undefined && ( 
            <span>
              Tooltip opened by {payload.text} 
            </span>
          )}
        </Tooltip.Popup>
      </Tooltip.Positioner>
    </Tooltip.Portal>
  )}
</Tooltip.Root>
```

### Controlled mode with multiple triggers

You can control the tooltip's open state externally using the `open` and `onOpenChange` props on `<Tooltip.Root>`.
This allows you to manage the tooltip's visibility based on your application's state.
When using multiple triggers, you have to manage which trigger is active with the `triggerId` prop on `<Tooltip.Root>` and the `id` prop on each `<Tooltip.Trigger>`.

Note that there is no separate `onTriggerIdChange` prop.
Instead, the `onOpenChange` callback receives an additional argument, `eventDetails`, which contains the trigger element that initiated the state change.

[Interactive example](/solid/components/tooltip)

### Animating the Tooltip

You can animate a tooltip as it moves between different trigger elements.
This includes animating its position, size, and content.

#### Position and Size

To animate the tooltip's position, apply CSS transitions to the `left`, `right`, `top`, and `bottom` properties of the **Positioner** part.
To animate its size, transition the `width` and `height` of the **Popup** part.

#### Content

The tooltip also supports content transitions.
This is useful when different triggers display different content within the same tooltip.

To enable content animations, wrap the content in the `<Tooltip.Viewport>` part.
This part provides features to create direction-aware animations.
It renders a `div` with a `data-activation-direction` attribute that indicates the new trigger's position relative to the previous one. The value is a space-separated set of up to two tokens (one per axis) — `left` or `right` for the horizontal axis and `up` or `down` for the vertical axis (for example, `right down`). Match a single token with the `~=` attribute selector, such as `[data-activation-direction~='right']`.

Inside the `<Tooltip.Viewport>`, the content is further wrapped in `div`s with data attributes to help with styling:

- `data-current`: The currently visible content when no transitions are present or the incoming content.
- `data-previous`: The outgoing content during a transition.

You can use these attributes to style the enter and exit animations.

[Interactive example](/solid/components/tooltip)

## API reference

### Provider

Shares hover delays and the instant-opening window between tooltips.

| Prop | Type | Description |
| --- | --- | --- |
| delay | number \| undefined |  |
| closeDelay | number \| undefined |  |
| timeout | number \| undefined |  |
| children | JSX.Element |  |

### Root

Groups tooltip parts without introducing a DOM element or focus trap.

| Prop | Type | Description |
| --- | --- | --- |
| defaultOpen | boolean \| undefined |  |
| open | boolean \| undefined |  |
| onOpenChange | ((open: boolean, eventDetails: TooltipRootChangeEventDetails) => void) \| undefined |  |
| actionsRef | { current: TooltipRootActions \| null; } \| ((actions: TooltipRootActions \| null) => void) \| undefined |  |
| defaultTriggerId | string \| null \| undefined |  |
| handle | TooltipHandle<Payload> \| undefined |  |
| onOpenChangeComplete | ((open: boolean) => void) \| undefined |  |
| triggerId | string \| null \| undefined |  |
| trackCursorAxis | "none" \| "both" \| "x" \| "y" \| undefined |  |
| disabled | boolean \| undefined |  |
| disableHoverablePopup | boolean \| undefined |  |
| children | JSX.Element \| ((state: { readonly payload: Payload \| undefined; }) => JSX.Element) |  |

### Trigger



| Prop | Type | Description |
| --- | --- | --- |
| closeOnClick | boolean \| undefined |  |
| handle | TooltipHandle<Payload> \| undefined |  |
| payload | Payload \| undefined |  |
| disabled | boolean \| undefined |  |
| delay | number \| undefined |  |
| closeDelay | number \| undefined |  |
| class | JSX.ClassValue \| ((state: Readonly<TooltipTriggerState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<TooltipTriggerState>) => StyleValue) |  |
| render | ComponentRenderFn<TooltipRenderProps, TooltipTriggerState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Portal



| Prop | Type | Description |
| --- | --- | --- |
| container | PortalContainer |  |
| class | JSX.ClassValue \| ((state: Readonly<TooltipPortalState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<TooltipPortalState>) => StyleValue) |  |
| keepMounted | boolean \| undefined |  |
| render | ComponentRenderFn<TooltipRenderProps, TooltipPortalState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

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
| class | JSX.ClassValue \| ((state: Readonly<TooltipPositionerState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<TooltipPositionerState>) => StyleValue) |  |
| render | ComponentRenderFn<TooltipRenderProps, TooltipPositionerState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Popup



| Prop | Type | Description |
| --- | --- | --- |
| class | JSX.ClassValue \| ((state: Readonly<TooltipPopupState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<TooltipPopupState>) => StyleValue) |  |
| render | ComponentRenderFn<TooltipRenderProps, TooltipPopupState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Arrow



| Prop | Type | Description |
| --- | --- | --- |
| class | JSX.ClassValue \| ((state: Readonly<TooltipArrowState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<TooltipArrowState>) => StyleValue) |  |
| render | ComponentRenderFn<TooltipRenderProps, TooltipArrowState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Viewport



| Prop | Type | Description |
| --- | --- | --- |
| class | JSX.ClassValue \| ((state: Readonly<TooltipViewportState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<TooltipViewportState>) => StyleValue) |  |
| render | ComponentRenderFn<TooltipRenderProps, TooltipViewportState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

The `Viewport` is optional — reach for it only when a single popup is opened by multiple triggers, its content differs per trigger, and the switch between them is animated. When used, set `width: var(--positioner-width)` and `height: var(--positioner-height)` on the `Positioner` so its box is frozen to the measured size during the transition; otherwise content-driven resizing can make the popup thrash or flip to another side.

## createHandle



| Prop | Type | Description |
| --- | --- | --- |


### Handle

Associates detached triggers with the most recently attached living Root.

| Prop | Type | Description |
| --- | --- | --- |


