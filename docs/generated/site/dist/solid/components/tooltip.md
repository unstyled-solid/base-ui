<a id="tooltip"></a>

# Tooltip

A popup that appears when an element is hovered or focused, showing a hint for sighted users.



[Open mounted Solid demo: tooltip/hero](/solid/components/tooltip)

<a id="usage-guidelines"></a>

## Usage guidelines

- **Prefer using tooltips as visual labels only**: Tooltips should act as supplementary visual labels for sighted mouse and keyboard users. Tooltips alone are not accessible to touch or screen reader users. See [Alternatives to tooltips](#alternatives-to-tooltips) for more details.
- **Provide an accessible name for the trigger**: Tooltips are visual-only elements and are not a replacement for labeling the trigger. The tooltip's trigger must have an `aria-label` attribute that closely matches the tooltip's content to ensure consistency for screen reader users.

<a id="anatomy"></a>

## Anatomy

Import the component and assemble its parts:

```tsx
import { Tooltip } from '@unstyled-solid/base-ui/tooltip';
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

<a id="alternatives-to-tooltips"></a>

## Alternatives to tooltips

Tooltips should be supplementary popups that provide non-essential clarity in high-density UIs. A user should not miss critical information if they never see a tooltip.

Tooltips don't work well with touch input. Unlike mouse pointers with hover capability, there's no easily discoverable way to reveal a tooltip before tapping its trigger on a touch device.

iOS doesn't provide a system-standard, touch-friendly tooltip affordance, while Android may show a tooltip on long press. However, on the web, long press is often used to trigger contextual menus in the browser, which can lead to potential conflicts. For this reason, tooltips are disabled on touch devices.

<a id="infotips"></a>

### Infotips

Popups that open when hovering an info icon should use [Popover](/solid/components/popover) with the `openOnHover` prop on the trigger instead of a tooltip. This way, touch users and screen reader users can access the content.

To know when to reach for a popover instead of a tooltip, consider the **purpose** of the trigger element:
If the trigger's purpose is to open the popup itself, it's a popover. If the trigger's purpose is unrelated to opening the popup, it's a tooltip.

<a id="description-text"></a>

### Description text

Tooltips are designed for sighted users and are not a reliable way to deliver important information to touch users or assistive technologies. If the description is important to understanding the element, don't hide it behind a tooltip — use inline text or [Popover](/solid/components/popover) if space is limited, so the information is accessible to everyone.

Since tooltips serve sighted mouse and keyboard users, iconography should clearly communicate the purpose of icon-only triggers, especially on mobile where the text label may not be visible.

If the description is not critical, a tooltip can still be used to provide extra clarity for sighted mouse or keyboard users.

<a id="contextual-feedback-messages"></a>

### Contextual feedback messages

Use the Toast component's [anchoring ability](/solid/components/toast#anchored-toasts) for more ergonomic DX, to ensure the message is announced to screen readers, and to support complex content.

<a id="examples"></a>

## Examples

<a id="detached-triggers"></a>

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

[Open mounted Solid demo: tooltip/detached-triggers-simple](/solid/components/tooltip)

<a id="multiple-triggers"></a>

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

<a id="controlled-mode-with-multiple-triggers"></a>

### Controlled mode with multiple triggers

You can control the tooltip's open state externally using the `open` and `onOpenChange` props on `<Tooltip.Root>`.
This allows you to manage the tooltip's visibility based on your application's state.
When using multiple triggers, you have to manage which trigger is active with the `triggerId` prop on `<Tooltip.Root>` and the `id` prop on each `<Tooltip.Trigger>`.

Note that there is no separate `onTriggerIdChange` prop.
Instead, the `onOpenChange` callback receives an additional argument, `eventDetails`, which contains the trigger element that initiated the state change.

[Open mounted Solid demo: tooltip/detached-triggers-controlled](/solid/components/tooltip)

<a id="animating-the-tooltip"></a>

### Animating the Tooltip

You can animate a tooltip as it moves between different trigger elements.
This includes animating its position, size, and content.

<a id="position-and-size"></a>

#### Position and Size

To animate the tooltip's position, apply CSS transitions to the `left`, `right`, `top`, and `bottom` properties of the **Positioner** part.
To animate its size, transition the `width` and `height` of the **Popup** part.

<a id="content"></a>

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

[Open mounted Solid demo: tooltip/detached-triggers-full](/solid/components/tooltip)

<a id="api-reference"></a>

## API reference

<a id="provider"></a>

### Provider

<a id="api-546f6f6c7469702e50726f7669646572"></a>

<a id="tooltipprovider"></a>

### Tooltip.Provider

Shares hover delays and the instant-opening window between tooltips.

Declaration: `packages/solid/build/types/tooltip/provider/TooltipProvider.d.ts:3`

#### Declaration

```typescript
(props: TooltipProviderProps) => JSX.Element
```

<a id="api-546f6f6c7469702e50726f76696465722e2470726f70732e64656c6179"></a>

<a id="TooltipProvider-delay"></a>

<a id="api-546f6f6c7469702e50726f76696465722e2470726f70732e636c6f736544656c6179"></a>

<a id="TooltipProvider-closeDelay"></a>

<a id="api-546f6f6c7469702e50726f76696465722e2470726f70732e74696d656f7574"></a>

<a id="TooltipProvider-timeout"></a>

<a id="api-546f6f6c7469702e50726f76696465722e2470726f70732e6368696c6472656e"></a>

<a id="TooltipProvider-children"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| delay | `number \| undefined` | No | Unavailable |  |
| closeDelay | `number \| undefined` | No | Unavailable |  |
| timeout | `number \| undefined` | No | 400 |  |
| children | `JSX.Element` | No | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-546f6f6c7469702e50726f76696465722e50726f7073"></a>

<a id="tooltipproviderprops"></a>

### Related exported type: Tooltip.Provider.Props

Declaration: `packages/solid/build/types/tooltip/provider/TooltipProvider.d.ts:14`

#### Declaration

```typescript
TooltipProviderProps
```

<a id="api-546f6f6c7469702e50726f76696465722e50726f70732e64656c6179"></a>

<a id="TooltipProviderProps-delay"></a>

<a id="api-546f6f6c7469702e50726f76696465722e50726f70732e636c6f736544656c6179"></a>

<a id="TooltipProviderProps-closeDelay"></a>

<a id="api-546f6f6c7469702e50726f76696465722e50726f70732e74696d656f7574"></a>

<a id="TooltipProviderProps-timeout"></a>

<a id="api-546f6f6c7469702e50726f76696465722e50726f70732e6368696c6472656e"></a>

<a id="TooltipProviderProps-children"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| delay | `number \| undefined` | No | Unavailable |  |
| closeDelay | `number \| undefined` | No | Unavailable |  |
| timeout | `number \| undefined` | No | Unavailable |  |
| children | `JSX.Element` | No | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-546f6f6c7469702e50726f76696465722e5374617465"></a>

<a id="tooltipproviderstate"></a>

### Related exported type: Tooltip.Provider.State

Declaration: `packages/solid/build/types/tooltip/provider/TooltipProvider.d.ts:13`

#### Declaration

```typescript
TooltipProviderState
```

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="root"></a>

### Root

<a id="api-546f6f6c7469702e526f6f74"></a>

<a id="tooltiproot"></a>

### Tooltip.Root

Groups tooltip parts without introducing a DOM element or focus trap.

Declaration: `packages/solid/build/types/tooltip/root/TooltipRoot.d.ts:5`

#### Declaration

```typescript
<Payload = unknown>(props: TooltipRootProps<Payload>) => JSX.Element
```

<a id="api-546f6f6c7469702e526f6f742e2470726f70732e64656661756c744f70656e"></a>

<a id="TooltipRoot-defaultOpen"></a>

<a id="api-546f6f6c7469702e526f6f742e2470726f70732e6f70656e"></a>

<a id="TooltipRoot-open"></a>

<a id="api-546f6f6c7469702e526f6f742e2470726f70732e6f6e4f70656e4368616e6765"></a>

<a id="TooltipRoot-onOpenChange"></a>

<a id="api-546f6f6c7469702e526f6f742e2470726f70732e616374696f6e73526566"></a>

<a id="TooltipRoot-actionsRef"></a>

<a id="api-546f6f6c7469702e526f6f742e2470726f70732e64656661756c74547269676765724964"></a>

<a id="TooltipRoot-defaultTriggerId"></a>

<a id="api-546f6f6c7469702e526f6f742e2470726f70732e68616e646c65"></a>

<a id="TooltipRoot-handle"></a>

<a id="api-546f6f6c7469702e526f6f742e2470726f70732e6f6e4f70656e4368616e6765436f6d706c657465"></a>

<a id="TooltipRoot-onOpenChangeComplete"></a>

<a id="api-546f6f6c7469702e526f6f742e2470726f70732e747269676765724964"></a>

<a id="TooltipRoot-triggerId"></a>

<a id="api-546f6f6c7469702e526f6f742e2470726f70732e747261636b437572736f7241786973"></a>

<a id="TooltipRoot-trackCursorAxis"></a>

<a id="api-546f6f6c7469702e526f6f742e2470726f70732e64697361626c6564"></a>

<a id="TooltipRoot-disabled"></a>

<a id="api-546f6f6c7469702e526f6f742e2470726f70732e64697361626c65486f76657261626c65506f707570"></a>

<a id="TooltipRoot-disableHoverablePopup"></a>

<a id="api-546f6f6c7469702e526f6f742e2470726f70732e6368696c6472656e"></a>

<a id="TooltipRoot-children"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| defaultOpen | `boolean \| undefined` | No | Unavailable |  |
| open | `boolean \| undefined` | No | Unavailable |  |
| onOpenChange | `((open: boolean, eventDetails: TooltipRootChangeEventDetails) => void) \| undefined` | No | Unavailable |  |
| actionsRef | `{ current: TooltipRootActions \| null; } \| ((actions: TooltipRootActions \| null) => void) \| undefined` | No | Unavailable |  |
| defaultTriggerId | `string \| null \| undefined` | No | Unavailable |  |
| handle | `TooltipHandle<Payload> \| undefined` | No | Unavailable |  |
| onOpenChangeComplete | `((open: boolean) => void) \| undefined` | No | Unavailable |  |
| triggerId | `string \| null \| undefined` | No | Unavailable |  |
| trackCursorAxis | `"none" \| "both" \| "x" \| "y" \| undefined` | No | Unavailable |  |
| disabled | `boolean \| undefined` | No | false |  |
| disableHoverablePopup | `boolean \| undefined` | No | Unavailable |  |
| children | `JSX.Element \| ((state: { readonly payload: Payload \| undefined; }) => JSX.Element)` | No | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-546f6f6c7469702e526f6f742e50726f7073"></a>

<a id="tooltiprootprops"></a>

### Related exported type: Tooltip.Root.Props

Declaration: `packages/solid/build/types/tooltip/root/TooltipRoot.d.ts:36`

#### Declaration

```typescript
Props<Payload>
```

<a id="api-546f6f6c7469702e526f6f742e50726f70732e64656661756c744f70656e"></a>

<a id="TooltipRootProps-defaultOpen"></a>

<a id="api-546f6f6c7469702e526f6f742e50726f70732e6f70656e"></a>

<a id="TooltipRootProps-open"></a>

<a id="api-546f6f6c7469702e526f6f742e50726f70732e6f6e4f70656e4368616e6765"></a>

<a id="TooltipRootProps-onOpenChange"></a>

<a id="api-546f6f6c7469702e526f6f742e50726f70732e616374696f6e73526566"></a>

<a id="TooltipRootProps-actionsRef"></a>

<a id="api-546f6f6c7469702e526f6f742e50726f70732e64656661756c74547269676765724964"></a>

<a id="TooltipRootProps-defaultTriggerId"></a>

<a id="api-546f6f6c7469702e526f6f742e50726f70732e68616e646c65"></a>

<a id="TooltipRootProps-handle"></a>

<a id="api-546f6f6c7469702e526f6f742e50726f70732e6f6e4f70656e4368616e6765436f6d706c657465"></a>

<a id="TooltipRootProps-onOpenChangeComplete"></a>

<a id="api-546f6f6c7469702e526f6f742e50726f70732e747269676765724964"></a>

<a id="TooltipRootProps-triggerId"></a>

<a id="api-546f6f6c7469702e526f6f742e50726f70732e747261636b437572736f7241786973"></a>

<a id="TooltipRootProps-trackCursorAxis"></a>

<a id="api-546f6f6c7469702e526f6f742e50726f70732e64697361626c6564"></a>

<a id="TooltipRootProps-disabled"></a>

<a id="api-546f6f6c7469702e526f6f742e50726f70732e64697361626c65486f76657261626c65506f707570"></a>

<a id="TooltipRootProps-disableHoverablePopup"></a>

<a id="api-546f6f6c7469702e526f6f742e50726f70732e6368696c6472656e"></a>

<a id="TooltipRootProps-children"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| defaultOpen | `boolean \| undefined` | No | Unavailable |  |
| open | `boolean \| undefined` | No | Unavailable |  |
| onOpenChange | `((open: boolean, eventDetails: TooltipRootChangeEventDetails) => void) \| undefined` | No | Unavailable |  |
| actionsRef | `{ current: TooltipRootActions \| null; } \| ((actions: TooltipRootActions \| null) => void) \| undefined` | No | Unavailable |  |
| defaultTriggerId | `string \| null \| undefined` | No | Unavailable |  |
| handle | `TooltipHandle<Payload> \| undefined` | No | Unavailable |  |
| onOpenChangeComplete | `((open: boolean) => void) \| undefined` | No | Unavailable |  |
| triggerId | `string \| null \| undefined` | No | Unavailable |  |
| trackCursorAxis | `"none" \| "both" \| "x" \| "y" \| undefined` | No | Unavailable |  |
| disabled | `boolean \| undefined` | No | Unavailable |  |
| disableHoverablePopup | `boolean \| undefined` | No | Unavailable |  |
| children | `JSX.Element \| ((state: { readonly payload: Payload \| undefined; }) => JSX.Element)` | No | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-546f6f6c7469702e526f6f742e5374617465"></a>

<a id="tooltiprootstate"></a>

### Related exported type: Tooltip.Root.State

Declaration: `packages/solid/build/types/tooltip/root/TooltipRoot.d.ts:35`

#### Declaration

```typescript
TooltipRootState
```

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-546f6f6c7469702e526f6f742e416374696f6e73"></a>

<a id="tooltiprootactions"></a>

### Related exported type: Tooltip.Root.Actions

Declaration: `packages/solid/build/types/tooltip/root/TooltipRoot.d.ts:37`

#### Declaration

```typescript
TooltipRootActions
```

<a id="api-546f6f6c7469702e526f6f742e416374696f6e732e636c6f7365"></a>

<a id="TooltipRootActions-close"></a>

<a id="api-546f6f6c7469702e526f6f742e416374696f6e732e756e6d6f756e74"></a>

<a id="TooltipRootActions-unmount"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| close | `() => void` | Yes | Unavailable |  |
| unmount | `() => void` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-546f6f6c7469702e526f6f742e4368616e67654576656e74526561736f6e"></a>

<a id="tooltiprootchangeeventreason"></a>

### Related exported type: Tooltip.Root.ChangeEventReason

Declaration: `packages/solid/build/types/tooltip/root/TooltipRoot.d.ts:38`

#### Declaration

```typescript
TooltipRootChangeEventReason
```

Inherited DOM attributes: `__@iterator@106`, `anchor`, `at`, `big`, `blink`, `bold`, `charAt`, `charCodeAt`, `codePointAt`, `concat`, `endsWith`, `fixed`, `fontcolor`, `fontsize`, `includes`, `indexOf`, `isWellFormed`, `italics`, `lastIndexOf`, `length`, `link`, `localeCompare`, `match`, `matchAll`, `normalize`, `padEnd`, `padStart`, `repeat`, `replace`, `replaceAll`, `search`, `slice`, `small`, `split`, `startsWith`, `strike`, `sub`, `substr`, `substring`, `sup`, `toLocaleLowerCase`, `toLocaleUpperCase`, `toLowerCase`, `toString`, `toUpperCase`, `toWellFormed`, `trim`, `trimEnd`, `trimLeft`, `trimRight`, `trimStart`, `valueOf`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-546f6f6c7469702e526f6f742e4368616e67654576656e7444657461696c73"></a>

<a id="tooltiprootchangeeventdetails"></a>

### Related exported type: Tooltip.Root.ChangeEventDetails

Declaration: `packages/solid/build/types/tooltip/root/TooltipRoot.d.ts:39`

#### Declaration

```typescript
TooltipRootChangeEventDetails
```

<a id="api-546f6f6c7469702e526f6f742e4368616e67654576656e7444657461696c732e616c6c6f7750726f7061676174696f6e"></a>

<a id="TooltipRootChangeEventDetails-allowPropagation"></a>

<a id="api-546f6f6c7469702e526f6f742e4368616e67654576656e7444657461696c732e63616e63656c"></a>

<a id="TooltipRootChangeEventDetails-cancel"></a>

<a id="api-546f6f6c7469702e526f6f742e4368616e67654576656e7444657461696c732e6576656e74"></a>

<a id="TooltipRootChangeEventDetails-event"></a>

<a id="api-546f6f6c7469702e526f6f742e4368616e67654576656e7444657461696c732e697343616e63656c6564"></a>

<a id="TooltipRootChangeEventDetails-isCanceled"></a>

<a id="api-546f6f6c7469702e526f6f742e4368616e67654576656e7444657461696c732e697350726f7061676174696f6e416c6c6f776564"></a>

<a id="TooltipRootChangeEventDetails-isPropagationAllowed"></a>

<a id="api-546f6f6c7469702e526f6f742e4368616e67654576656e7444657461696c732e70726576656e74556e6d6f756e744f6e436c6f7365"></a>

<a id="TooltipRootChangeEventDetails-preventUnmountOnClose"></a>

<a id="api-546f6f6c7469702e526f6f742e4368616e67654576656e7444657461696c732e726561736f6e"></a>

<a id="TooltipRootChangeEventDetails-reason"></a>

<a id="api-546f6f6c7469702e526f6f742e4368616e67654576656e7444657461696c732e74726967676572"></a>

<a id="TooltipRootChangeEventDetails-trigger"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| allowPropagation | `() => void` | Yes | Unavailable | Marks this change transaction as allowing propagation. |
| cancel | `() => void` | Yes | Unavailable | Cancels the Base UI change transaction; separate from the DOM event’s preventDefault() and preventBaseUIHandler(). |
| event | `PointerEvent \| MouseEvent \| Event \| FocusEvent \| KeyboardEvent \| TouchEvent` | Yes | Unavailable | Native DOM event associated with the change. Programmatic changes can use a Base UI-created Event. |
| isCanceled | `boolean` | Yes | Unavailable | Whether cancel() has been called for this change transaction. |
| isPropagationAllowed | `boolean` | Yes | Unavailable | Whether allowPropagation() has been called for this change transaction. |
| preventUnmountOnClose | `() => void` | Yes | Unavailable |  |
| reason | `"none" \| "disabled" \| "trigger-press" \| "trigger-hover" \| "trigger-focus" \| "outside-press" \| "escape-key" \| "imperative-action"` | Yes | Unavailable | Reason for the requested change; it discriminates the native event type. |
| trigger | `Element \| undefined` | Yes | Unavailable | Trigger element associated with this change, when available. |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="trigger"></a>

### Trigger

<a id="api-546f6f6c7469702e54726967676572"></a>

<a id="tooltiptrigger"></a>

<a id="api-546f6f6c7469702e547269676765722e2470726f70732e70726f703a64697361626c6564"></a>

<a id="api-546f6f6c7469702e547269676765722e2470726f70732e70726f703a666f726d416374696f6e"></a>

<a id="api-546f6f6c7469702e547269676765722e2470726f70732e70726f703a666f726d456e6374797065"></a>

<a id="api-546f6f6c7469702e547269676765722e2470726f70732e70726f703a666f726d4d6574686f64"></a>

<a id="api-546f6f6c7469702e547269676765722e2470726f70732e70726f703a666f726d4e6f56616c6964617465"></a>

<a id="api-546f6f6c7469702e547269676765722e2470726f70732e70726f703a666f726d546172676574"></a>

<a id="api-546f6f6c7469702e547269676765722e2470726f70732e70726f703a6e616d65"></a>

<a id="api-546f6f6c7469702e547269676765722e2470726f70732e70726f703a706f706f766572546172676574416374696f6e"></a>

<a id="api-546f6f6c7469702e547269676765722e2470726f70732e70726f703a706f706f766572546172676574456c656d656e74"></a>

<a id="api-546f6f6c7469702e547269676765722e2470726f70732e70726f703a74797065"></a>

<a id="api-546f6f6c7469702e547269676765722e2470726f70732e70726f703a76616c7565"></a>

### Tooltip.Trigger

Declaration: `packages/solid/build/types/tooltip/trigger/TooltipTrigger.d.ts:5`

#### Declaration

```typescript
<Payload = unknown>(props: TooltipTriggerProps<Payload>) => JSX.Element
```

<a id="api-546f6f6c7469702e547269676765722e2470726f70732e636c6f73654f6e436c69636b"></a>

<a id="TooltipTrigger-closeOnClick"></a>

<a id="api-546f6f6c7469702e547269676765722e2470726f70732e68616e646c65"></a>

<a id="TooltipTrigger-handle"></a>

<a id="api-546f6f6c7469702e547269676765722e2470726f70732e7061796c6f6164"></a>

<a id="TooltipTrigger-payload"></a>

<a id="api-546f6f6c7469702e547269676765722e2470726f70732e64697361626c6564"></a>

<a id="TooltipTrigger-disabled"></a>

<a id="api-546f6f6c7469702e547269676765722e2470726f70732e64656c6179"></a>

<a id="TooltipTrigger-delay"></a>

<a id="api-546f6f6c7469702e547269676765722e2470726f70732e636c6f736544656c6179"></a>

<a id="TooltipTrigger-closeDelay"></a>

<a id="api-546f6f6c7469702e547269676765722e2470726f70732e636c617373"></a>

<a id="TooltipTrigger-class"></a>

<a id="api-546f6f6c7469702e547269676765722e2470726f70732e7374796c65"></a>

<a id="TooltipTrigger-style"></a>

<a id="api-546f6f6c7469702e547269676765722e2470726f70732e72656e646572"></a>

<a id="TooltipTrigger-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| closeOnClick | `boolean \| undefined` | No | true |  |
| handle | `TooltipHandle<Payload> \| undefined` | No | Unavailable |  |
| payload | `Payload \| undefined` | No | Unavailable |  |
| disabled | `boolean \| undefined` | No | Unavailable |  |
| delay | `number \| undefined` | No | Unavailable |  |
| closeDelay | `number \| undefined` | No | 0 |  |
| class | `JSX.ClassValue \| ((state: Readonly<TooltipTriggerState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<TooltipTriggerState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<TooltipRenderProps, TooltipTriggerState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `command`, `commandfor`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `form`, `formaction`, `formenctype`, `formmethod`, `formnovalidate`, `formtarget`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `name`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `popovertarget`, `popovertargetaction`, `prefix`, `prop:disabled`, `prop:formAction`, `prop:formEnctype`, `prop:formMethod`, `prop:formNoValidate`, `prop:formTarget`, `prop:name`, `prop:popoverTargetAction`, `prop:popoverTargetElement`, `prop:type`, `prop:value`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `type`, `typeof`, `value`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-546f6f6c7469705472696767657244617461417474726962757465732e706f7075704f70656e"></a>

<a id="api-546f6f6c7469705472696767657244617461417474726962757465732e7472696767657244697361626c6564"></a>

| Name | Description |
| --- | --- |
| data-popup-open | Present when open is true. |
| data-trigger-disabled |  |

#### CSS variables

Metadata status: unavailable.

<a id="api-546f6f6c7469702e547269676765722e50726f7073"></a>

<a id="tooltiptriggerprops"></a>

<a id="api-546f6f6c7469702e547269676765722e50726f70732e70726f703a64697361626c6564"></a>

<a id="api-546f6f6c7469702e547269676765722e50726f70732e70726f703a666f726d416374696f6e"></a>

<a id="api-546f6f6c7469702e547269676765722e50726f70732e70726f703a666f726d456e6374797065"></a>

<a id="api-546f6f6c7469702e547269676765722e50726f70732e70726f703a666f726d4d6574686f64"></a>

<a id="api-546f6f6c7469702e547269676765722e50726f70732e70726f703a666f726d4e6f56616c6964617465"></a>

<a id="api-546f6f6c7469702e547269676765722e50726f70732e70726f703a666f726d546172676574"></a>

<a id="api-546f6f6c7469702e547269676765722e50726f70732e70726f703a6e616d65"></a>

<a id="api-546f6f6c7469702e547269676765722e50726f70732e70726f703a706f706f766572546172676574416374696f6e"></a>

<a id="api-546f6f6c7469702e547269676765722e50726f70732e70726f703a706f706f766572546172676574456c656d656e74"></a>

<a id="api-546f6f6c7469702e547269676765722e50726f70732e70726f703a74797065"></a>

<a id="api-546f6f6c7469702e547269676765722e50726f70732e70726f703a76616c7565"></a>

### Related exported type: Tooltip.Trigger.Props

Declaration: `packages/solid/build/types/tooltip/trigger/TooltipTrigger.d.ts:19`

#### Declaration

```typescript
Props<Payload>
```

<a id="api-546f6f6c7469702e547269676765722e50726f70732e636c6f73654f6e436c69636b"></a>

<a id="TooltipTriggerProps-closeOnClick"></a>

<a id="api-546f6f6c7469702e547269676765722e50726f70732e68616e646c65"></a>

<a id="TooltipTriggerProps-handle"></a>

<a id="api-546f6f6c7469702e547269676765722e50726f70732e7061796c6f6164"></a>

<a id="TooltipTriggerProps-payload"></a>

<a id="api-546f6f6c7469702e547269676765722e50726f70732e64697361626c6564"></a>

<a id="TooltipTriggerProps-disabled"></a>

<a id="api-546f6f6c7469702e547269676765722e50726f70732e64656c6179"></a>

<a id="TooltipTriggerProps-delay"></a>

<a id="api-546f6f6c7469702e547269676765722e50726f70732e636c6f736544656c6179"></a>

<a id="TooltipTriggerProps-closeDelay"></a>

<a id="api-546f6f6c7469702e547269676765722e50726f70732e636c617373"></a>

<a id="TooltipTriggerProps-class"></a>

<a id="api-546f6f6c7469702e547269676765722e50726f70732e7374796c65"></a>

<a id="TooltipTriggerProps-style"></a>

<a id="api-546f6f6c7469702e547269676765722e50726f70732e72656e646572"></a>

<a id="TooltipTriggerProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| closeOnClick | `boolean \| undefined` | No | Unavailable |  |
| handle | `TooltipHandle<Payload> \| undefined` | No | Unavailable |  |
| payload | `Payload \| undefined` | No | Unavailable |  |
| disabled | `boolean \| undefined` | No | Unavailable |  |
| delay | `number \| undefined` | No | Unavailable |  |
| closeDelay | `number \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<TooltipTriggerState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<TooltipTriggerState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<TooltipRenderProps, TooltipTriggerState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `command`, `commandfor`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `form`, `formaction`, `formenctype`, `formmethod`, `formnovalidate`, `formtarget`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `name`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `popovertarget`, `popovertargetaction`, `prefix`, `prop:disabled`, `prop:formAction`, `prop:formEnctype`, `prop:formMethod`, `prop:formNoValidate`, `prop:formTarget`, `prop:name`, `prop:popoverTargetAction`, `prop:popoverTargetElement`, `prop:type`, `prop:value`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `type`, `typeof`, `value`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-546f6f6c7469702e547269676765722e5374617465"></a>

<a id="tooltiptriggerstate"></a>

### Related exported type: Tooltip.Trigger.State

Declaration: `packages/solid/build/types/tooltip/trigger/TooltipTrigger.d.ts:18`

#### Declaration

```typescript
TooltipTriggerState
```

<a id="api-546f6f6c7469702e547269676765722e53746174652e6f70656e"></a>

<a id="TooltipTriggerState-open"></a>

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

<a id="api-546f6f6c7469702e506f7274616c"></a>

<a id="tooltipportal"></a>

<a id="api-546f6f6c7469702e506f7274616c2e2470726f70732e70726f703a616c69676e"></a>

### Tooltip.Portal

Declaration: `packages/solid/build/types/tooltip/portal/TooltipPortal.d.ts:5`

#### Declaration

```typescript
(props: TooltipPortalProps) => JSX.Element
```

<a id="api-546f6f6c7469702e506f7274616c2e2470726f70732e636f6e7461696e6572"></a>

<a id="TooltipPortal-container"></a>

<a id="api-546f6f6c7469702e506f7274616c2e2470726f70732e636c617373"></a>

<a id="TooltipPortal-class"></a>

<a id="api-546f6f6c7469702e506f7274616c2e2470726f70732e7374796c65"></a>

<a id="TooltipPortal-style"></a>

<a id="api-546f6f6c7469702e506f7274616c2e2470726f70732e6b6565704d6f756e746564"></a>

<a id="TooltipPortal-keepMounted"></a>

<a id="api-546f6f6c7469702e506f7274616c2e2470726f70732e72656e646572"></a>

<a id="TooltipPortal-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| container | `PortalContainer` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<TooltipPortalState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<TooltipPortalState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| keepMounted | `boolean \| undefined` | No | false |  |
| render | `ComponentRenderFn<TooltipRenderProps, TooltipPortalState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-546f6f6c7469702e506f7274616c2e50726f7073"></a>

<a id="tooltipportalprops"></a>

<a id="api-546f6f6c7469702e506f7274616c2e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Tooltip.Portal.Props

Declaration: `packages/solid/build/types/tooltip/portal/TooltipPortal.d.ts:14`

#### Declaration

```typescript
TooltipPortalProps
```

<a id="api-546f6f6c7469702e506f7274616c2e50726f70732e636f6e7461696e6572"></a>

<a id="TooltipPortalProps-container"></a>

<a id="api-546f6f6c7469702e506f7274616c2e50726f70732e636c617373"></a>

<a id="TooltipPortalProps-class"></a>

<a id="api-546f6f6c7469702e506f7274616c2e50726f70732e7374796c65"></a>

<a id="TooltipPortalProps-style"></a>

<a id="api-546f6f6c7469702e506f7274616c2e50726f70732e6b6565704d6f756e746564"></a>

<a id="TooltipPortalProps-keepMounted"></a>

<a id="api-546f6f6c7469702e506f7274616c2e50726f70732e72656e646572"></a>

<a id="TooltipPortalProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| container | `PortalContainer` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<TooltipPortalState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<TooltipPortalState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| keepMounted | `boolean \| undefined` | No | Unavailable |  |
| render | `ComponentRenderFn<TooltipRenderProps, TooltipPortalState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-546f6f6c7469702e506f7274616c2e5374617465"></a>

<a id="tooltipportalstate"></a>

### Related exported type: Tooltip.Portal.State

Declaration: `packages/solid/build/types/tooltip/portal/TooltipPortal.d.ts:13`

#### Declaration

```typescript
TooltipPortalState
```

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="positioner"></a>

### Positioner

<a id="api-546f6f6c7469702e506f736974696f6e6572"></a>

<a id="tooltippositioner"></a>

<a id="api-546f6f6c7469702e506f736974696f6e65722e2470726f70732e70726f703a616c69676e"></a>

### Tooltip.Positioner

Declaration: `packages/solid/build/types/tooltip/positioner/TooltipPositioner.d.ts:5`

#### Declaration

```typescript
(props: TooltipPositionerProps) => JSX.Element
```

<a id="api-546f6f6c7469702e506f736974696f6e65722e2470726f70732e64697361626c65416e63686f72547261636b696e67"></a>

<a id="TooltipPositioner-disableAnchorTracking"></a>

<a id="api-546f6f6c7469702e506f736974696f6e65722e2470726f70732e616c69676e"></a>

<a id="TooltipPositioner-align"></a>

<a id="api-546f6f6c7469702e506f736974696f6e65722e2470726f70732e616c69676e4f6666736574"></a>

<a id="TooltipPositioner-alignOffset"></a>

<a id="api-546f6f6c7469702e506f736974696f6e65722e2470726f70732e73696465"></a>

<a id="TooltipPositioner-side"></a>

<a id="api-546f6f6c7469702e506f736974696f6e65722e2470726f70732e736964654f6666736574"></a>

<a id="TooltipPositioner-sideOffset"></a>

<a id="api-546f6f6c7469702e506f736974696f6e65722e2470726f70732e6172726f7750616464696e67"></a>

<a id="TooltipPositioner-arrowPadding"></a>

<a id="api-546f6f6c7469702e506f736974696f6e65722e2470726f70732e616e63686f72"></a>

<a id="TooltipPositioner-anchor"></a>

<a id="api-546f6f6c7469702e506f736974696f6e65722e2470726f70732e636f6c6c6973696f6e41766f6964616e6365"></a>

<a id="TooltipPositioner-collisionAvoidance"></a>

<a id="api-546f6f6c7469702e506f736974696f6e65722e2470726f70732e636f6c6c6973696f6e426f756e64617279"></a>

<a id="TooltipPositioner-collisionBoundary"></a>

<a id="api-546f6f6c7469702e506f736974696f6e65722e2470726f70732e636f6c6c6973696f6e50616464696e67"></a>

<a id="TooltipPositioner-collisionPadding"></a>

<a id="api-546f6f6c7469702e506f736974696f6e65722e2470726f70732e737469636b79"></a>

<a id="TooltipPositioner-sticky"></a>

<a id="api-546f6f6c7469702e506f736974696f6e65722e2470726f70732e706f736974696f6e4d6574686f64"></a>

<a id="TooltipPositioner-positionMethod"></a>

<a id="api-546f6f6c7469702e506f736974696f6e65722e2470726f70732e636c617373"></a>

<a id="TooltipPositioner-class"></a>

<a id="api-546f6f6c7469702e506f736974696f6e65722e2470726f70732e7374796c65"></a>

<a id="TooltipPositioner-style"></a>

<a id="api-546f6f6c7469702e506f736974696f6e65722e2470726f70732e72656e646572"></a>

<a id="TooltipPositioner-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| disableAnchorTracking | `boolean \| undefined` | No | false | Disables ancestor-scroll, element-resize and layout-shift observation used for automatic positioning updates. |
| align | `Align \| undefined` | No | 'center' | Preferred alignment along the anchor’s side. Collision handling can change the resolved alignment. |
| alignOffset | `number \| OffsetFunction \| undefined` | No | 0 | Offset along the alignment axis, in pixels. A callback receives anchor and positioner dimensions plus the side and alignment. |
| side | `Side \| undefined` | No | 'top' | Preferred side of the anchor. Logical inline sides follow the text direction; collision handling can change the resolved side. |
| sideOffset | `number \| OffsetFunction \| undefined` | No | 0 | Distance from the anchor along the side axis, in pixels. A callback receives anchor and positioner dimensions plus the side and alignment. |
| arrowPadding | `number \| undefined` | No | 5 | Minimum padding in pixels between the arrow and the floating element’s edges. |
| anchor | `ReferenceType \| (() => ReferenceType \| null) \| null \| undefined` | No | Unavailable | Positioning reference: an element or virtual reference, or an accessor returning one. A nullish reference falls back to the root’s reference. |
| collisionAvoidance | `{ side?: "flip" \| "shift" \| "none"; align?: "flip" \| "shift" \| "none"; fallbackAxisSide?: "start" \| "end" \| "none"; } \| undefined` | No | { fallbackAxisSide: 'end' } | Controls flipping or shifting along the side and alignment axes, including fallback placement on the perpendicular axis. |
| collisionBoundary | `Boundary \| "clipping-ancestors" \| undefined` | No | 'clipping-ancestors' | Boundary used to detect overflow. The clipping-ancestors value uses clipping ancestors as the overflow boundary. |
| collisionPadding | `Padding \| undefined` | No | 5 | Space in pixels reserved inside the collision boundary, either for all edges or per edge. |
| sticky | `boolean \| undefined` | No | false | Allows shifting along the side axis without the usual limitShift limiter. |
| positionMethod | `"fixed" \| "absolute" \| undefined` | No | 'absolute' | CSS positioning strategy used by the floating element: absolute or fixed. |
| class | `JSX.ClassValue \| ((state: Readonly<TooltipPositionerState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<TooltipPositionerState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<TooltipRenderProps, TooltipPositionerState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-546f6f6c746970506f736974696f6e657244617461417474726962757465732e6f70656e"></a>

<a id="api-546f6f6c746970506f736974696f6e657244617461417474726962757465732e636c6f736564"></a>

<a id="api-546f6f6c746970506f736974696f6e657244617461417474726962757465732e616e63686f7248696464656e"></a>

<a id="api-546f6f6c746970506f736974696f6e657244617461417474726962757465732e616c69676e"></a>

<a id="api-546f6f6c746970506f736974696f6e657244617461417474726962757465732e73696465"></a>

| Name | Description |
| --- | --- |
| data-open |  |
| data-closed |  |
| data-anchor-hidden |  |
| data-align |  |
| data-side |  |

#### CSS variables

<a id="api-546f6f6c746970506f736974696f6e65724373735661726961626c65732e616e63686f72486569676874"></a>

<a id="api-546f6f6c746970506f736974696f6e65724373735661726961626c65732e616e63686f725769647468"></a>

<a id="api-546f6f6c746970506f736974696f6e65724373735661726961626c65732e617661696c61626c65486569676874"></a>

<a id="api-546f6f6c746970506f736974696f6e65724373735661726961626c65732e617661696c61626c655769647468"></a>

<a id="api-546f6f6c746970506f736974696f6e65724373735661726961626c65732e706f736974696f6e6572486569676874"></a>

<a id="api-546f6f6c746970506f736974696f6e65724373735661726961626c65732e706f736974696f6e65725769647468"></a>

<a id="api-546f6f6c746970506f736974696f6e65724373735661726961626c65732e7472616e73666f726d4f726967696e"></a>

| Name | Description |
| --- | --- |
| --anchor-height |  |
| --anchor-width |  |
| --available-height |  |
| --available-width |  |
| --positioner-height |  |
| --positioner-width |  |
| --transform-origin |  |

<a id="api-546f6f6c7469702e506f736974696f6e65722e50726f7073"></a>

<a id="tooltippositionerprops"></a>

<a id="api-546f6f6c7469702e506f736974696f6e65722e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Tooltip.Positioner.Props

Declaration: `packages/solid/build/types/tooltip/positioner/TooltipPositioner.d.ts:17`

#### Declaration

```typescript
TooltipPositionerProps
```

<a id="api-546f6f6c7469702e506f736974696f6e65722e50726f70732e64697361626c65416e63686f72547261636b696e67"></a>

<a id="TooltipPositionerProps-disableAnchorTracking"></a>

<a id="api-546f6f6c7469702e506f736974696f6e65722e50726f70732e616c69676e"></a>

<a id="TooltipPositionerProps-align"></a>

<a id="api-546f6f6c7469702e506f736974696f6e65722e50726f70732e616c69676e4f6666736574"></a>

<a id="TooltipPositionerProps-alignOffset"></a>

<a id="api-546f6f6c7469702e506f736974696f6e65722e50726f70732e73696465"></a>

<a id="TooltipPositionerProps-side"></a>

<a id="api-546f6f6c7469702e506f736974696f6e65722e50726f70732e736964654f6666736574"></a>

<a id="TooltipPositionerProps-sideOffset"></a>

<a id="api-546f6f6c7469702e506f736974696f6e65722e50726f70732e6172726f7750616464696e67"></a>

<a id="TooltipPositionerProps-arrowPadding"></a>

<a id="api-546f6f6c7469702e506f736974696f6e65722e50726f70732e616e63686f72"></a>

<a id="TooltipPositionerProps-anchor"></a>

<a id="api-546f6f6c7469702e506f736974696f6e65722e50726f70732e636f6c6c6973696f6e41766f6964616e6365"></a>

<a id="TooltipPositionerProps-collisionAvoidance"></a>

<a id="api-546f6f6c7469702e506f736974696f6e65722e50726f70732e636f6c6c6973696f6e426f756e64617279"></a>

<a id="TooltipPositionerProps-collisionBoundary"></a>

<a id="api-546f6f6c7469702e506f736974696f6e65722e50726f70732e636f6c6c6973696f6e50616464696e67"></a>

<a id="TooltipPositionerProps-collisionPadding"></a>

<a id="api-546f6f6c7469702e506f736974696f6e65722e50726f70732e737469636b79"></a>

<a id="TooltipPositionerProps-sticky"></a>

<a id="api-546f6f6c7469702e506f736974696f6e65722e50726f70732e706f736974696f6e4d6574686f64"></a>

<a id="TooltipPositionerProps-positionMethod"></a>

<a id="api-546f6f6c7469702e506f736974696f6e65722e50726f70732e636c617373"></a>

<a id="TooltipPositionerProps-class"></a>

<a id="api-546f6f6c7469702e506f736974696f6e65722e50726f70732e7374796c65"></a>

<a id="TooltipPositionerProps-style"></a>

<a id="api-546f6f6c7469702e506f736974696f6e65722e50726f70732e72656e646572"></a>

<a id="TooltipPositionerProps-render"></a>

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
| class | `JSX.ClassValue \| ((state: Readonly<TooltipPositionerState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<TooltipPositionerState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<TooltipRenderProps, TooltipPositionerState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-546f6f6c7469702e506f736974696f6e65722e5374617465"></a>

<a id="tooltippositionerstate"></a>

### Related exported type: Tooltip.Positioner.State

Declaration: `packages/solid/build/types/tooltip/positioner/TooltipPositioner.d.ts:16`

#### Declaration

```typescript
TooltipPositionerState
```

<a id="api-546f6f6c7469702e506f736974696f6e65722e53746174652e6f70656e"></a>

<a id="TooltipPositionerState-open"></a>

<a id="api-546f6f6c7469702e506f736974696f6e65722e53746174652e616e63686f7248696464656e"></a>

<a id="TooltipPositionerState-anchorHidden"></a>

<a id="api-546f6f6c7469702e506f736974696f6e65722e53746174652e696e7374616e74"></a>

<a id="TooltipPositionerState-instant"></a>

<a id="api-546f6f6c7469702e506f736974696f6e65722e53746174652e616c69676e"></a>

<a id="TooltipPositionerState-align"></a>

<a id="api-546f6f6c7469702e506f736974696f6e65722e53746174652e73696465"></a>

<a id="TooltipPositionerState-side"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| open | `boolean` | Yes | Unavailable |  |
| anchorHidden | `boolean` | Yes | Unavailable |  |
| instant | `string \| undefined` | Yes | Unavailable |  |
| align | `Align` | Yes | Unavailable |  |
| side | `Side` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="popup"></a>

### Popup

<a id="api-546f6f6c7469702e506f707570"></a>

<a id="tooltippopup"></a>

<a id="api-546f6f6c7469702e506f7075702e2470726f70732e70726f703a616c69676e"></a>

### Tooltip.Popup

Declaration: `packages/solid/build/types/tooltip/popup/TooltipPopup.d.ts:7`

#### Declaration

```typescript
(props: TooltipPopupProps) => JSX.Element
```

<a id="api-546f6f6c7469702e506f7075702e2470726f70732e636c617373"></a>

<a id="TooltipPopup-class"></a>

<a id="api-546f6f6c7469702e506f7075702e2470726f70732e7374796c65"></a>

<a id="TooltipPopup-style"></a>

<a id="api-546f6f6c7469702e506f7075702e2470726f70732e72656e646572"></a>

<a id="TooltipPopup-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<TooltipPopupState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<TooltipPopupState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<TooltipRenderProps, TooltipPopupState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-546f6f6c746970506f70757044617461417474726962757465732e6f70656e"></a>

<a id="api-546f6f6c746970506f70757044617461417474726962757465732e636c6f736564"></a>

<a id="api-546f6f6c7469702e506f7075702e64617461417474726962757465732e646174612d616e63686f722d68696464656e"></a>

<a id="api-546f6f6c746970506f70757044617461417474726962757465732e616c69676e"></a>

<a id="api-546f6f6c746970506f70757044617461417474726962757465732e696e7374616e74"></a>

<a id="api-546f6f6c746970506f70757044617461417474726962757465732e73696465"></a>

<a id="api-546f6f6c746970506f70757044617461417474726962757465732e7374617274696e675374796c65"></a>

<a id="api-546f6f6c746970506f70757044617461417474726962757465732e656e64696e675374796c65"></a>

| Name | Description |
| --- | --- |
| data-open | Present when open is true. |
| data-closed | Present when open is false. |
| data-anchor-hidden | Present when anchorHidden is true. |
| data-align |  |
| data-instant |  |
| data-side |  |
| data-starting-style | Present when transitionStatus is 'starting'. |
| data-ending-style | Present when transitionStatus is 'ending'. |

#### CSS variables

Metadata status: unavailable.

<a id="api-546f6f6c7469702e506f7075702e50726f7073"></a>

<a id="tooltippopupprops"></a>

<a id="api-546f6f6c7469702e506f7075702e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Tooltip.Popup.Props

Declaration: `packages/solid/build/types/tooltip/popup/TooltipPopup.d.ts:19`

#### Declaration

```typescript
TooltipPopupProps
```

<a id="api-546f6f6c7469702e506f7075702e50726f70732e636c617373"></a>

<a id="TooltipPopupProps-class"></a>

<a id="api-546f6f6c7469702e506f7075702e50726f70732e7374796c65"></a>

<a id="TooltipPopupProps-style"></a>

<a id="api-546f6f6c7469702e506f7075702e50726f70732e72656e646572"></a>

<a id="TooltipPopupProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<TooltipPopupState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<TooltipPopupState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<TooltipRenderProps, TooltipPopupState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-546f6f6c7469702e506f7075702e5374617465"></a>

<a id="tooltippopupstate"></a>

### Related exported type: Tooltip.Popup.State

Declaration: `packages/solid/build/types/tooltip/popup/TooltipPopup.d.ts:18`

#### Declaration

```typescript
TooltipPopupState
```

<a id="api-546f6f6c7469702e506f7075702e53746174652e6f70656e"></a>

<a id="TooltipPopupState-open"></a>

<a id="api-546f6f6c7469702e506f7075702e53746174652e696e7374616e74"></a>

<a id="TooltipPopupState-instant"></a>

<a id="api-546f6f6c7469702e506f7075702e53746174652e7472616e736974696f6e537461747573"></a>

<a id="TooltipPopupState-transitionStatus"></a>

<a id="api-546f6f6c7469702e506f7075702e53746174652e616c69676e"></a>

<a id="TooltipPopupState-align"></a>

<a id="api-546f6f6c7469702e506f7075702e53746174652e73696465"></a>

<a id="TooltipPopupState-side"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| open | `boolean` | Yes | Unavailable |  |
| instant | `TooltipInstant` | Yes | Unavailable |  |
| transitionStatus | `TransitionStatus` | Yes | Unavailable |  |
| align | `Align` | Yes | Unavailable |  |
| side | `Side` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="arrow"></a>

### Arrow

<a id="api-546f6f6c7469702e4172726f77"></a>

<a id="tooltiparrow"></a>

<a id="api-546f6f6c7469702e4172726f772e2470726f70732e70726f703a616c69676e"></a>

### Tooltip.Arrow

Declaration: `packages/solid/build/types/tooltip/arrow/TooltipArrow.d.ts:6`

#### Declaration

```typescript
(props: TooltipArrowProps) => JSX.Element
```

<a id="api-546f6f6c7469702e4172726f772e2470726f70732e636c617373"></a>

<a id="TooltipArrow-class"></a>

<a id="api-546f6f6c7469702e4172726f772e2470726f70732e7374796c65"></a>

<a id="TooltipArrow-style"></a>

<a id="api-546f6f6c7469702e4172726f772e2470726f70732e72656e646572"></a>

<a id="TooltipArrow-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<TooltipArrowState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<TooltipArrowState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<TooltipRenderProps, TooltipArrowState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-546f6f6c7469704172726f7744617461417474726962757465732e6f70656e"></a>

<a id="api-546f6f6c7469704172726f7744617461417474726962757465732e636c6f736564"></a>

<a id="api-546f6f6c7469704172726f7744617461417474726962757465732e756e63656e7465726564"></a>

<a id="api-546f6f6c7469702e4172726f772e64617461417474726962757465732e646174612d616e63686f722d68696464656e"></a>

<a id="api-546f6f6c7469704172726f7744617461417474726962757465732e616c69676e"></a>

<a id="api-546f6f6c7469704172726f7744617461417474726962757465732e696e7374616e74"></a>

<a id="api-546f6f6c7469704172726f7744617461417474726962757465732e73696465"></a>

| Name | Description |
| --- | --- |
| data-open | Present when open is true. |
| data-closed | Present when open is false. |
| data-uncentered |  |
| data-anchor-hidden | Present when anchorHidden is true. |
| data-align |  |
| data-instant |  |
| data-side |  |

#### CSS variables

Metadata status: unavailable.

<a id="api-546f6f6c7469702e4172726f772e50726f7073"></a>

<a id="tooltiparrowprops"></a>

<a id="api-546f6f6c7469702e4172726f772e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Tooltip.Arrow.Props

Declaration: `packages/solid/build/types/tooltip/arrow/TooltipArrow.d.ts:18`

#### Declaration

```typescript
TooltipArrowProps
```

<a id="api-546f6f6c7469702e4172726f772e50726f70732e636c617373"></a>

<a id="TooltipArrowProps-class"></a>

<a id="api-546f6f6c7469702e4172726f772e50726f70732e7374796c65"></a>

<a id="TooltipArrowProps-style"></a>

<a id="api-546f6f6c7469702e4172726f772e50726f70732e72656e646572"></a>

<a id="TooltipArrowProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<TooltipArrowState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<TooltipArrowState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<TooltipRenderProps, TooltipArrowState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-546f6f6c7469702e4172726f772e5374617465"></a>

<a id="tooltiparrowstate"></a>

### Related exported type: Tooltip.Arrow.State

Declaration: `packages/solid/build/types/tooltip/arrow/TooltipArrow.d.ts:17`

#### Declaration

```typescript
TooltipArrowState
```

<a id="api-546f6f6c7469702e4172726f772e53746174652e6f70656e"></a>

<a id="TooltipArrowState-open"></a>

<a id="api-546f6f6c7469702e4172726f772e53746174652e696e7374616e74"></a>

<a id="TooltipArrowState-instant"></a>

<a id="api-546f6f6c7469702e4172726f772e53746174652e756e63656e7465726564"></a>

<a id="TooltipArrowState-uncentered"></a>

<a id="api-546f6f6c7469702e4172726f772e53746174652e616c69676e"></a>

<a id="TooltipArrowState-align"></a>

<a id="api-546f6f6c7469702e4172726f772e53746174652e73696465"></a>

<a id="TooltipArrowState-side"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| open | `boolean` | Yes | Unavailable |  |
| instant | `TooltipInstant` | Yes | Unavailable |  |
| uncentered | `boolean` | Yes | Unavailable |  |
| align | `Align` | Yes | Unavailable |  |
| side | `Side` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="viewport"></a>

### Viewport

<a id="api-546f6f6c7469702e56696577706f7274"></a>

<a id="tooltipviewport"></a>

<a id="api-546f6f6c7469702e56696577706f72742e2470726f70732e70726f703a616c69676e"></a>

### Tooltip.Viewport

Declaration: `packages/solid/build/types/tooltip/viewport/TooltipViewport.d.ts:5`

#### Declaration

```typescript
(props: TooltipViewportProps) => JSX.Element
```

<a id="api-546f6f6c7469702e56696577706f72742e2470726f70732e636c617373"></a>

<a id="TooltipViewport-class"></a>

<a id="api-546f6f6c7469702e56696577706f72742e2470726f70732e7374796c65"></a>

<a id="TooltipViewport-style"></a>

<a id="api-546f6f6c7469702e56696577706f72742e2470726f70732e72656e646572"></a>

<a id="TooltipViewport-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<TooltipViewportState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<TooltipViewportState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<TooltipRenderProps, TooltipViewportState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-546f6f6c74697056696577706f727444617461417474726962757465732e61637469766174696f6e446972656374696f6e"></a>

<a id="api-546f6f6c74697056696577706f727444617461417474726962757465732e63757272656e74"></a>

<a id="api-546f6f6c74697056696577706f727444617461417474726962757465732e696e7374616e74"></a>

<a id="api-546f6f6c74697056696577706f727444617461417474726962757465732e70726576696f7573"></a>

<a id="api-546f6f6c74697056696577706f727444617461417474726962757465732e7472616e736974696f6e696e67"></a>

| Name | Description |
| --- | --- |
| data-activation-direction |  |
| data-current |  |
| data-instant |  |
| data-previous |  |
| data-transitioning |  |

#### CSS variables

<a id="api-546f6f6c74697056696577706f72744373735661726961626c65732e706f707570486569676874"></a>

<a id="api-546f6f6c74697056696577706f72744373735661726961626c65732e706f7075705769647468"></a>

| Name | Description |
| --- | --- |
| --popup-height |  |
| --popup-width |  |

<a id="api-546f6f6c7469702e56696577706f72742e50726f7073"></a>

<a id="tooltipviewportprops"></a>

<a id="api-546f6f6c7469702e56696577706f72742e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Tooltip.Viewport.Props

Declaration: `packages/solid/build/types/tooltip/viewport/TooltipViewport.d.ts:15`

#### Declaration

```typescript
TooltipViewportProps
```

<a id="api-546f6f6c7469702e56696577706f72742e50726f70732e636c617373"></a>

<a id="TooltipViewportProps-class"></a>

<a id="api-546f6f6c7469702e56696577706f72742e50726f70732e7374796c65"></a>

<a id="TooltipViewportProps-style"></a>

<a id="api-546f6f6c7469702e56696577706f72742e50726f70732e72656e646572"></a>

<a id="TooltipViewportProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<TooltipViewportState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<TooltipViewportState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<TooltipRenderProps, TooltipViewportState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-546f6f6c7469702e56696577706f72742e5374617465"></a>

<a id="tooltipviewportstate"></a>

### Related exported type: Tooltip.Viewport.State

Declaration: `packages/solid/build/types/tooltip/viewport/TooltipViewport.d.ts:14`

#### Declaration

```typescript
TooltipViewportState
```

<a id="api-546f6f6c7469702e56696577706f72742e53746174652e61637469766174696f6e446972656374696f6e"></a>

<a id="TooltipViewportState-activationDirection"></a>

<a id="api-546f6f6c7469702e56696577706f72742e53746174652e696e7374616e74"></a>

<a id="TooltipViewportState-instant"></a>

<a id="api-546f6f6c7469702e56696577706f72742e53746174652e7472616e736974696f6e696e67"></a>

<a id="TooltipViewportState-transitioning"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| activationDirection | `string \| undefined` | Yes | Unavailable |  |
| instant | `TooltipInstant` | Yes | Unavailable |  |
| transitioning | `boolean` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

The `Viewport` is optional — reach for it only when a single popup is opened by multiple triggers, its content differs per trigger, and the switch between them is animated. When used, set `width: var(--positioner-width)` and `height: var(--positioner-height)` on the `Positioner` so its box is frozen to the measured size during the transition; otherwise content-driven resizing can make the popup thrash or flip to another side.

<a id="createhandle"></a>

## createHandle

<a id="api-546f6f6c7469702e63726561746548616e646c65"></a>

<a id="tooltipcreatehandle"></a>

### Tooltip.createHandle

Declaration: `packages/solid/build/types/tooltip/store/TooltipHandle.d.ts:10`

#### Declaration

```typescript
<Payload = unknown>() => TooltipHandle<Payload>
```

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

#### Return value

```typescript
TooltipHandle<Payload>
```

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| open | `(triggerId: string) => void` | Yes | Unavailable |  |
| close | `() => void` | Yes | Unavailable |  |
| isOpen | `boolean` | Yes | Unavailable |  |
| fallbackStore | `TooltipStore<Payload>` | Yes | Unavailable |  |
| componentName | `any` | Yes | Unavailable |  |
| throwOnMissingTrigger | `any` | Yes | Unavailable |  |
| attached | `any` | Yes | Unavailable |  |
| current | `any` | Yes | Unavailable |  |
| version | `any` | Yes | Unavailable |  |
| warning | `any` | Yes | Unavailable |  |
| attachedStore | `TooltipStore<Payload> \| null` | Yes | Unavailable |  |
| store | `TooltipStore<Payload>` | Yes | Unavailable |  |
| serverStore | `TooltipStore<Payload>` | Yes | Unavailable |  |
| attachStore | `(store: TooltipStore<Payload>) => () => void` | Yes | Unavailable |  |
| activate | `any` | Yes | Unavailable |  |
| openByTrigger | `(id: string \| null \| undefined) => void` | Yes | Unavailable |  |
| closePopup | `() => void` | Yes | Unavailable |  |

[//]: # "@exclude-table-of-contents"

<a id="handle"></a>

### Handle

<a id="api-546f6f6c7469702e48616e646c65"></a>

<a id="tooltiphandle"></a>

### Tooltip.Handle

Associates detached triggers with the most recently attached living Root.

Declaration: `packages/solid/build/types/tooltip/store/TooltipHandle.d.ts:4`

#### Declaration

```typescript
TooltipHandle<Payload>
```

<a id="api-546f6f6c7469702e48616e646c652e6f70656e"></a>

<a id="TooltipHandle-open"></a>

<a id="api-546f6f6c7469702e48616e646c652e6163746976617465"></a>

<a id="TooltipHandle-activate"></a>

<a id="api-546f6f6c7469702e48616e646c652e61747461636853746f7265"></a>

<a id="TooltipHandle-attachStore"></a>

<a id="api-546f6f6c7469702e48616e646c652e6174746163686564"></a>

<a id="TooltipHandle-attached"></a>

<a id="api-546f6f6c7469702e48616e646c652e617474616368656453746f7265"></a>

<a id="TooltipHandle-attachedStore"></a>

<a id="api-546f6f6c7469702e48616e646c652e636c6f7365"></a>

<a id="TooltipHandle-close"></a>

<a id="api-546f6f6c7469702e48616e646c652e636c6f7365506f707570"></a>

<a id="TooltipHandle-closePopup"></a>

<a id="api-546f6f6c7469702e48616e646c652e636f6d706f6e656e744e616d65"></a>

<a id="TooltipHandle-componentName"></a>

<a id="api-546f6f6c7469702e48616e646c652e63757272656e74"></a>

<a id="TooltipHandle-current"></a>

<a id="api-546f6f6c7469702e48616e646c652e66616c6c6261636b53746f7265"></a>

<a id="TooltipHandle-fallbackStore"></a>

<a id="api-546f6f6c7469702e48616e646c652e69734f70656e"></a>

<a id="TooltipHandle-isOpen"></a>

<a id="api-546f6f6c7469702e48616e646c652e6f70656e427954726967676572"></a>

<a id="TooltipHandle-openByTrigger"></a>

<a id="api-546f6f6c7469702e48616e646c652e73657276657253746f7265"></a>

<a id="TooltipHandle-serverStore"></a>

<a id="api-546f6f6c7469702e48616e646c652e73746f7265"></a>

<a id="TooltipHandle-store"></a>

<a id="api-546f6f6c7469702e48616e646c652e7468726f774f6e4d697373696e6754726967676572"></a>

<a id="TooltipHandle-throwOnMissingTrigger"></a>

<a id="api-546f6f6c7469702e48616e646c652e76657273696f6e"></a>

<a id="TooltipHandle-version"></a>

<a id="api-546f6f6c7469702e48616e646c652e7761726e696e67"></a>

<a id="TooltipHandle-warning"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| open | `(triggerId: string) => void` | Yes | Unavailable |  |
| activate | `any` | Yes | Unavailable |  |
| attachStore | `(store: TooltipStore<Payload>) => () => void` | Yes | Unavailable |  |
| attached | `any` | Yes | Unavailable |  |
| attachedStore | `TooltipStore<Payload> \| null` | Yes | Unavailable |  |
| close | `() => void` | Yes | Unavailable |  |
| closePopup | `() => void` | Yes | Unavailable |  |
| componentName | `any` | Yes | Unavailable |  |
| current | `any` | Yes | Unavailable |  |
| fallbackStore | `TooltipStore<Payload>` | Yes | Unavailable |  |
| isOpen | `boolean` | Yes | Unavailable |  |
| openByTrigger | `(id: string \| null \| undefined) => void` | Yes | Unavailable |  |
| serverStore | `TooltipStore<Payload>` | Yes | Unavailable |  |
| store | `TooltipStore<Payload>` | Yes | Unavailable |  |
| throwOnMissingTrigger | `any` | Yes | Unavailable |  |
| version | `any` | Yes | Unavailable |  |
| warning | `any` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

