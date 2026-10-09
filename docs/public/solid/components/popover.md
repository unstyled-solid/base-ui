<a id="popover"></a>

# Popover

An accessible popup anchored to a button.

[Open mounted Solid demo: popover/hero](/solid/components/popover)

<a id="anatomy"></a>

## Anatomy

Import the component and assemble its parts:

```tsx
import { Popover } from '@unstyled-solid/base-ui/popover';
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

<a id="examples"></a>

## Examples

<a id="opening-on-hover"></a>

### Opening on hover

This example shows how you can configure the popover to open on hover using the `openOnHover` prop.

You can use the `delay` prop to specify how long to wait (in milliseconds) before the popover opens on hover.

[Open mounted Solid demo: popover/open-on-hover](/solid/components/popover)

<a id="detached-triggers"></a>

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

[Open mounted Solid demo: popover/detached-triggers-simple](/solid/components/popover)

<a id="multiple-triggers"></a>

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

<a id="controlled-mode-with-multiple-triggers"></a>

### Controlled mode with multiple triggers

You can control the popover's open state externally using the `open` and `onOpenChange` props on `<Popover.Root>`.
This allows you to manage the popover's visibility based on your application's state.
When using multiple triggers, you have to manage which trigger is active with the `triggerId` prop on `<Popover.Root>` and the `id` prop on each `<Popover.Trigger>`.

Note that there is no separate `onTriggerIdChange` prop.
Instead, the `onOpenChange` callback receives an additional argument, `eventDetails`, which contains the trigger element that initiated the state change.

[Open mounted Solid demo: popover/detached-triggers-controlled](/solid/components/popover)

<a id="animating-the-popover"></a>

### Animating the Popover

You can animate a popover as it moves between different trigger elements.
This includes animating its position, size, and content.

<a id="position-and-size"></a>

#### Position and Size

To animate the popover's position, apply CSS transitions to the `left`, `right`, `top`, and `bottom` properties of the **Positioner** part.
To animate its size, transition the `width` and `height` of the **Popup** part.

<a id="content"></a>

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

[Open mounted Solid demo: popover/detached-triggers-full](/solid/components/popover)

<a id="api-reference"></a>

## API reference

<a id="root"></a>

### Root

<a id="api-506f706f7665722e526f6f74"></a>

<a id="popoverroot"></a>

### Popover.Root

Declaration: `packages/solid/build/types/popover/root/PopoverRoot.d.ts:4`

#### Declaration

```typescript
<Payload = unknown>(props: PopoverRootProps<Payload>) => JSX.Element
```

<a id="api-506f706f7665722e526f6f742e2470726f70732e64656661756c744f70656e"></a>

<a id="PopoverRoot-defaultOpen"></a>

<a id="api-506f706f7665722e526f6f742e2470726f70732e6f70656e"></a>

<a id="PopoverRoot-open"></a>

<a id="api-506f706f7665722e526f6f742e2470726f70732e6f6e4f70656e4368616e6765"></a>

<a id="PopoverRoot-onOpenChange"></a>

<a id="api-506f706f7665722e526f6f742e2470726f70732e616374696f6e73526566"></a>

<a id="PopoverRoot-actionsRef"></a>

<a id="api-506f706f7665722e526f6f742e2470726f70732e64656661756c74547269676765724964"></a>

<a id="PopoverRoot-defaultTriggerId"></a>

<a id="api-506f706f7665722e526f6f742e2470726f70732e68616e646c65"></a>

<a id="PopoverRoot-handle"></a>

<a id="api-506f706f7665722e526f6f742e2470726f70732e6d6f64616c"></a>

<a id="PopoverRoot-modal"></a>

<a id="api-506f706f7665722e526f6f742e2470726f70732e6f6e4f70656e4368616e6765436f6d706c657465"></a>

<a id="PopoverRoot-onOpenChangeComplete"></a>

<a id="api-506f706f7665722e526f6f742e2470726f70732e747269676765724964"></a>

<a id="PopoverRoot-triggerId"></a>

<a id="api-506f706f7665722e526f6f742e2470726f70732e6368696c6472656e"></a>

<a id="PopoverRoot-children"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| defaultOpen | `boolean \| undefined` | No | Unavailable | Initial open state for this root’s uncontrolled lifetime. |
| open | `boolean \| undefined` | No | Unavailable | Controlled open state of the popover. |
| onOpenChange | `((open: boolean, details: PopoverRootChangeEventDetails) => void) \| undefined` | No | Unavailable | Called with the requested open state and native change details. Use details.cancel() to cancel the change. |
| actionsRef | `((actions: PopoverRootActions \| null) => void) \| undefined` | No | Unavailable | Native callback attachment; dispose clears the attachment. |
| defaultTriggerId | `string \| null \| undefined` | No | Unavailable | Initial active trigger ID for uncontrolled trigger selection. |
| handle | `PopoverHandle<Payload> \| undefined` | No | Unavailable | Connects this root to a handle that can also be supplied to detached triggers. The root retains ownership of its model. |
| modal | `boolean \| "trap-focus" \| undefined` | No | Unavailable |  |
| onOpenChangeComplete | `((open: boolean) => void) \| undefined` | No | Unavailable | Called with the open state when the opening or closing transition completes. |
| triggerId | `string \| null \| undefined` | No | Unavailable | Controlled ID of the active trigger. |
| children | `JSX.Element \| ((state: { readonly payload: Payload \| undefined; }) => JSX.Element)` | No | Unavailable | Content, or a callback receiving live payload state from the active trigger. |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-506f706f7665722e526f6f742e50726f7073"></a>

<a id="popoverrootprops"></a>

### Related exported type: Popover.Root.Props

Declaration: `packages/solid/build/types/popover/root/PopoverRoot.d.ts:31`

#### Declaration

```typescript
Props<Payload>
```

<a id="api-506f706f7665722e526f6f742e50726f70732e64656661756c744f70656e"></a>

<a id="PopoverRootProps-defaultOpen"></a>

<a id="api-506f706f7665722e526f6f742e50726f70732e6f70656e"></a>

<a id="PopoverRootProps-open"></a>

<a id="api-506f706f7665722e526f6f742e50726f70732e6f6e4f70656e4368616e6765"></a>

<a id="PopoverRootProps-onOpenChange"></a>

<a id="api-506f706f7665722e526f6f742e50726f70732e616374696f6e73526566"></a>

<a id="PopoverRootProps-actionsRef"></a>

<a id="api-506f706f7665722e526f6f742e50726f70732e64656661756c74547269676765724964"></a>

<a id="PopoverRootProps-defaultTriggerId"></a>

<a id="api-506f706f7665722e526f6f742e50726f70732e68616e646c65"></a>

<a id="PopoverRootProps-handle"></a>

<a id="api-506f706f7665722e526f6f742e50726f70732e6d6f64616c"></a>

<a id="PopoverRootProps-modal"></a>

<a id="api-506f706f7665722e526f6f742e50726f70732e6f6e4f70656e4368616e6765436f6d706c657465"></a>

<a id="PopoverRootProps-onOpenChangeComplete"></a>

<a id="api-506f706f7665722e526f6f742e50726f70732e747269676765724964"></a>

<a id="PopoverRootProps-triggerId"></a>

<a id="api-506f706f7665722e526f6f742e50726f70732e6368696c6472656e"></a>

<a id="PopoverRootProps-children"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| defaultOpen | `boolean \| undefined` | No | Unavailable | Initial open state for this root’s uncontrolled lifetime. |
| open | `boolean \| undefined` | No | Unavailable | Controlled open state of the popover. |
| onOpenChange | `((open: boolean, details: PopoverRootChangeEventDetails) => void) \| undefined` | No | Unavailable | Called with the requested open state and native change details. Use details.cancel() to cancel the change. |
| actionsRef | `((actions: PopoverRootActions \| null) => void) \| undefined` | No | Unavailable | Native callback attachment; dispose clears the attachment. |
| defaultTriggerId | `string \| null \| undefined` | No | Unavailable | Initial active trigger ID for uncontrolled trigger selection. |
| handle | `PopoverHandle<Payload> \| undefined` | No | Unavailable | Connects this root to a handle that can also be supplied to detached triggers. The root retains ownership of its model. |
| modal | `boolean \| "trap-focus" \| undefined` | No | Unavailable |  |
| onOpenChangeComplete | `((open: boolean) => void) \| undefined` | No | Unavailable | Called with the open state when the opening or closing transition completes. |
| triggerId | `string \| null \| undefined` | No | Unavailable | Controlled ID of the active trigger. |
| children | `JSX.Element \| ((state: { readonly payload: Payload \| undefined; }) => JSX.Element)` | No | Unavailable | Content, or a callback receiving live payload state from the active trigger. |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-506f706f7665722e526f6f742e5374617465"></a>

<a id="popoverrootstate"></a>

### Related exported type: Popover.Root.State

Declaration: `packages/solid/build/types/popover/root/PopoverRoot.d.ts:32`

#### Declaration

```typescript
PopoverRootState
```

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-506f706f7665722e526f6f742e416374696f6e73"></a>

<a id="popoverrootactions"></a>

### Related exported type: Popover.Root.Actions

Declaration: `packages/solid/build/types/popover/root/PopoverRoot.d.ts:33`

#### Declaration

```typescript
PopoverRootActions
```

<a id="api-506f706f7665722e526f6f742e416374696f6e732e636c6f7365"></a>

<a id="PopoverRootActions-close"></a>

<a id="api-506f706f7665722e526f6f742e416374696f6e732e756e6d6f756e74"></a>

<a id="PopoverRootActions-unmount"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| close | `() => void` | Yes | Unavailable |  |
| unmount | `() => void` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-506f706f7665722e526f6f742e4368616e67654576656e74526561736f6e"></a>

<a id="popoverrootchangeeventreason"></a>

### Related exported type: Popover.Root.ChangeEventReason

Declaration: `packages/solid/build/types/popover/root/PopoverRoot.d.ts:34`

#### Declaration

```typescript
PopoverRootChangeEventReason
```

Inherited DOM attributes: `__@iterator@106`, `anchor`, `at`, `big`, `blink`, `bold`, `charAt`, `charCodeAt`, `codePointAt`, `concat`, `endsWith`, `fixed`, `fontcolor`, `fontsize`, `includes`, `indexOf`, `isWellFormed`, `italics`, `lastIndexOf`, `length`, `link`, `localeCompare`, `match`, `matchAll`, `normalize`, `padEnd`, `padStart`, `repeat`, `replace`, `replaceAll`, `search`, `slice`, `small`, `split`, `startsWith`, `strike`, `sub`, `substr`, `substring`, `sup`, `toLocaleLowerCase`, `toLocaleUpperCase`, `toLowerCase`, `toString`, `toUpperCase`, `toWellFormed`, `trim`, `trimEnd`, `trimLeft`, `trimRight`, `trimStart`, `valueOf`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-506f706f7665722e526f6f742e4368616e67654576656e7444657461696c73"></a>

<a id="popoverrootchangeeventdetails"></a>

### Related exported type: Popover.Root.ChangeEventDetails

Declaration: `packages/solid/build/types/popover/root/PopoverRoot.d.ts:35`

#### Declaration

```typescript
PopoverRootChangeEventDetails
```

<a id="api-506f706f7665722e526f6f742e4368616e67654576656e7444657461696c732e616c6c6f7750726f7061676174696f6e"></a>

<a id="PopoverRootChangeEventDetails-allowPropagation"></a>

<a id="api-506f706f7665722e526f6f742e4368616e67654576656e7444657461696c732e63616e63656c"></a>

<a id="PopoverRootChangeEventDetails-cancel"></a>

<a id="api-506f706f7665722e526f6f742e4368616e67654576656e7444657461696c732e6576656e74"></a>

<a id="PopoverRootChangeEventDetails-event"></a>

<a id="api-506f706f7665722e526f6f742e4368616e67654576656e7444657461696c732e697343616e63656c6564"></a>

<a id="PopoverRootChangeEventDetails-isCanceled"></a>

<a id="api-506f706f7665722e526f6f742e4368616e67654576656e7444657461696c732e697350726f7061676174696f6e416c6c6f776564"></a>

<a id="PopoverRootChangeEventDetails-isPropagationAllowed"></a>

<a id="api-506f706f7665722e526f6f742e4368616e67654576656e7444657461696c732e70726576656e74556e6d6f756e744f6e436c6f7365"></a>

<a id="PopoverRootChangeEventDetails-preventUnmountOnClose"></a>

<a id="api-506f706f7665722e526f6f742e4368616e67654576656e7444657461696c732e726561736f6e"></a>

<a id="PopoverRootChangeEventDetails-reason"></a>

<a id="api-506f706f7665722e526f6f742e4368616e67654576656e7444657461696c732e74726967676572"></a>

<a id="PopoverRootChangeEventDetails-trigger"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| allowPropagation | `() => void` | Yes | Unavailable | Marks this change transaction as allowing propagation. |
| cancel | `() => void` | Yes | Unavailable | Cancels the Base UI change transaction; separate from the DOM event’s preventDefault() and preventBaseUIHandler(). |
| event | `PointerEvent \| MouseEvent \| Event \| FocusEvent \| KeyboardEvent \| TouchEvent` | Yes | Unavailable | Native DOM event associated with the change. Programmatic changes can use a Base UI-created Event. |
| isCanceled | `boolean` | Yes | Unavailable | Whether cancel() has been called for this change transaction. |
| isPropagationAllowed | `boolean` | Yes | Unavailable | Whether allowPropagation() has been called for this change transaction. |
| preventUnmountOnClose | `() => void` | Yes | Unavailable |  |
| reason | `"none" \| "trigger-press" \| "trigger-hover" \| "trigger-focus" \| "outside-press" \| "close-press" \| "focus-out" \| "escape-key" \| "imperative-action"` | Yes | Unavailable | Reason for the requested change; it discriminates the native event type. |
| trigger | `Element \| undefined` | Yes | Unavailable | Trigger element associated with this change, when available. |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="trigger"></a>

### Trigger

<a id="api-506f706f7665722e54726967676572"></a>

<a id="popovertrigger"></a>

<a id="api-506f706f7665722e547269676765722e2470726f70732e70726f703a64697361626c6564"></a>

<a id="api-506f706f7665722e547269676765722e2470726f70732e70726f703a666f726d416374696f6e"></a>

<a id="api-506f706f7665722e547269676765722e2470726f70732e70726f703a666f726d456e6374797065"></a>

<a id="api-506f706f7665722e547269676765722e2470726f70732e70726f703a666f726d4d6574686f64"></a>

<a id="api-506f706f7665722e547269676765722e2470726f70732e70726f703a666f726d4e6f56616c6964617465"></a>

<a id="api-506f706f7665722e547269676765722e2470726f70732e70726f703a666f726d546172676574"></a>

<a id="api-506f706f7665722e547269676765722e2470726f70732e70726f703a6e616d65"></a>

<a id="api-506f706f7665722e547269676765722e2470726f70732e70726f703a706f706f766572546172676574416374696f6e"></a>

<a id="api-506f706f7665722e547269676765722e2470726f70732e70726f703a706f706f766572546172676574456c656d656e74"></a>

<a id="api-506f706f7665722e547269676765722e2470726f70732e70726f703a74797065"></a>

<a id="api-506f706f7665722e547269676765722e2470726f70732e70726f703a76616c7565"></a>

### Popover.Trigger

Declaration: `packages/solid/build/types/popover/trigger/PopoverTrigger.d.ts:3`

#### Declaration

```typescript
<Payload = unknown>(props: PopoverTriggerProps<Payload>) => JSX.Element
```

<a id="api-506f706f7665722e547269676765722e2470726f70732e68616e646c65"></a>

<a id="PopoverTrigger-handle"></a>

<a id="api-506f706f7665722e547269676765722e2470726f70732e6e6174697665427574746f6e"></a>

<a id="PopoverTrigger-nativeButton"></a>

<a id="api-506f706f7665722e547269676765722e2470726f70732e7061796c6f6164"></a>

<a id="PopoverTrigger-payload"></a>

<a id="api-506f706f7665722e547269676765722e2470726f70732e64697361626c6564"></a>

<a id="PopoverTrigger-disabled"></a>

<a id="api-506f706f7665722e547269676765722e2470726f70732e6f70656e4f6e486f766572"></a>

<a id="PopoverTrigger-openOnHover"></a>

<a id="api-506f706f7665722e547269676765722e2470726f70732e64656c6179"></a>

<a id="PopoverTrigger-delay"></a>

<a id="api-506f706f7665722e547269676765722e2470726f70732e636c6f736544656c6179"></a>

<a id="PopoverTrigger-closeDelay"></a>

<a id="api-506f706f7665722e547269676765722e2470726f70732e6964"></a>

<a id="PopoverTrigger-id"></a>

<a id="api-506f706f7665722e547269676765722e2470726f70732e636c617373"></a>

<a id="PopoverTrigger-class"></a>

<a id="api-506f706f7665722e547269676765722e2470726f70732e7374796c65"></a>

<a id="PopoverTrigger-style"></a>

<a id="api-506f706f7665722e547269676765722e2470726f70732e72656e646572"></a>

<a id="PopoverTrigger-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| handle | `PopoverHandle<Payload> \| undefined` | No | Unavailable | Connects a trigger to the handle’s root, including when the trigger is outside that root’s subtree. |
| nativeButton | `boolean \| undefined` | No | true | Whether the rendered host is a native button. Set false when the render callback supplies a non-button host. |
| payload | `NoInfer<Payload> \| undefined` | No | Unavailable | Payload registered with this trigger and exposed by the root when this trigger is active. |
| disabled | `boolean \| undefined` | No | false | Whether the trigger ignores user interaction. |
| openOnHover | `boolean \| undefined` | No | false | Whether mouse hover can open the popover. |
| delay | `number \| undefined` | No | 300 | Mouse rest delay in milliseconds before hover opens the popover. |
| closeDelay | `number \| undefined` | No | 0 | Delay in milliseconds before hover closes the popover. |
| id | `string \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<PopoverTriggerState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<PopoverTriggerState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, PopoverTriggerState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `command`, `commandfor`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `form`, `formaction`, `formenctype`, `formmethod`, `formnovalidate`, `formtarget`, `hidden`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `name`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `popovertarget`, `popovertargetaction`, `prefix`, `prop:disabled`, `prop:formAction`, `prop:formEnctype`, `prop:formMethod`, `prop:formNoValidate`, `prop:formTarget`, `prop:name`, `prop:popoverTargetAction`, `prop:popoverTargetElement`, `prop:type`, `prop:value`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `type`, `typeof`, `value`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-506f706f7665725472696767657244617461417474726962757465732e706f7075704f70656e"></a>

<a id="api-506f706f7665725472696767657244617461417474726962757465732e70726573736564"></a>

<a id="api-506f706f7665725472696767657244617461417474726962757465732e64697361626c6564"></a>

| Name | Description |
| --- | --- |
| data-popup-open | Present when the popover is open and this is its active trigger. |
| data-pressed | Present when this trigger’s popover is open and the open-change reason is trigger-press. Hover opening alone does not set it. |
| data-disabled | Present when this trigger is disabled. |

#### CSS variables

Metadata status: unavailable.

<a id="api-506f706f7665722e547269676765722e50726f7073"></a>

<a id="popovertriggerprops"></a>

<a id="api-506f706f7665722e547269676765722e50726f70732e70726f703a64697361626c6564"></a>

<a id="api-506f706f7665722e547269676765722e50726f70732e70726f703a666f726d416374696f6e"></a>

<a id="api-506f706f7665722e547269676765722e50726f70732e70726f703a666f726d456e6374797065"></a>

<a id="api-506f706f7665722e547269676765722e50726f70732e70726f703a666f726d4d6574686f64"></a>

<a id="api-506f706f7665722e547269676765722e50726f70732e70726f703a666f726d4e6f56616c6964617465"></a>

<a id="api-506f706f7665722e547269676765722e50726f70732e70726f703a666f726d546172676574"></a>

<a id="api-506f706f7665722e547269676765722e50726f70732e70726f703a6e616d65"></a>

<a id="api-506f706f7665722e547269676765722e50726f70732e70726f703a706f706f766572546172676574416374696f6e"></a>

<a id="api-506f706f7665722e547269676765722e50726f70732e70726f703a706f706f766572546172676574456c656d656e74"></a>

<a id="api-506f706f7665722e547269676765722e50726f70732e70726f703a74797065"></a>

<a id="api-506f706f7665722e547269676765722e50726f70732e70726f703a76616c7565"></a>

### Related exported type: Popover.Trigger.Props

Declaration: `packages/solid/build/types/popover/trigger/PopoverTrigger.d.ts:19`

#### Declaration

```typescript
Props<Payload>
```

<a id="api-506f706f7665722e547269676765722e50726f70732e68616e646c65"></a>

<a id="PopoverTriggerProps-handle"></a>

<a id="api-506f706f7665722e547269676765722e50726f70732e6e6174697665427574746f6e"></a>

<a id="PopoverTriggerProps-nativeButton"></a>

<a id="api-506f706f7665722e547269676765722e50726f70732e7061796c6f6164"></a>

<a id="PopoverTriggerProps-payload"></a>

<a id="api-506f706f7665722e547269676765722e50726f70732e64697361626c6564"></a>

<a id="PopoverTriggerProps-disabled"></a>

<a id="api-506f706f7665722e547269676765722e50726f70732e6f70656e4f6e486f766572"></a>

<a id="PopoverTriggerProps-openOnHover"></a>

<a id="api-506f706f7665722e547269676765722e50726f70732e64656c6179"></a>

<a id="PopoverTriggerProps-delay"></a>

<a id="api-506f706f7665722e547269676765722e50726f70732e636c6f736544656c6179"></a>

<a id="PopoverTriggerProps-closeDelay"></a>

<a id="api-506f706f7665722e547269676765722e50726f70732e6964"></a>

<a id="PopoverTriggerProps-id"></a>

<a id="api-506f706f7665722e547269676765722e50726f70732e636c617373"></a>

<a id="PopoverTriggerProps-class"></a>

<a id="api-506f706f7665722e547269676765722e50726f70732e7374796c65"></a>

<a id="PopoverTriggerProps-style"></a>

<a id="api-506f706f7665722e547269676765722e50726f70732e72656e646572"></a>

<a id="PopoverTriggerProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| handle | `PopoverHandle<Payload> \| undefined` | No | Unavailable | Connects a trigger to the handle’s root, including when the trigger is outside that root’s subtree. |
| nativeButton | `boolean \| undefined` | No | Unavailable | Whether the rendered host is a native button. Set false when the render callback supplies a non-button host. |
| payload | `NoInfer<Payload> \| undefined` | No | Unavailable | Payload registered with this trigger and exposed by the root when this trigger is active. |
| disabled | `boolean \| undefined` | No | Unavailable | Whether the trigger ignores user interaction. |
| openOnHover | `boolean \| undefined` | No | Unavailable | Whether mouse hover can open the popover. |
| delay | `number \| undefined` | No | Unavailable | Mouse rest delay in milliseconds before hover opens the popover. |
| closeDelay | `number \| undefined` | No | Unavailable | Delay in milliseconds before hover closes the popover. |
| id | `string \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<PopoverTriggerState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<PopoverTriggerState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, PopoverTriggerState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `command`, `commandfor`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `form`, `formaction`, `formenctype`, `formmethod`, `formnovalidate`, `formtarget`, `hidden`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `name`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `popovertarget`, `popovertargetaction`, `prefix`, `prop:disabled`, `prop:formAction`, `prop:formEnctype`, `prop:formMethod`, `prop:formNoValidate`, `prop:formTarget`, `prop:name`, `prop:popoverTargetAction`, `prop:popoverTargetElement`, `prop:type`, `prop:value`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `type`, `typeof`, `value`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-506f706f7665722e547269676765722e5374617465"></a>

<a id="popovertriggerstate"></a>

### Related exported type: Popover.Trigger.State

Declaration: `packages/solid/build/types/popover/trigger/PopoverTrigger.d.ts:20`

#### Declaration

```typescript
PopoverTriggerState
```

<a id="api-506f706f7665722e547269676765722e53746174652e6f70656e"></a>

<a id="PopoverTriggerState-open"></a>

<a id="api-506f706f7665722e547269676765722e53746174652e64697361626c6564"></a>

<a id="PopoverTriggerState-disabled"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| open | `boolean` | Yes | Unavailable |  |
| disabled | `boolean` | Yes | Unavailable | Whether the trigger ignores user interaction. |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="backdrop"></a>

### Backdrop

<a id="api-506f706f7665722e4261636b64726f70"></a>

<a id="popoverbackdrop"></a>

<a id="api-506f706f7665722e4261636b64726f702e2470726f70732e70726f703a616c69676e"></a>

### Popover.Backdrop

Declaration: `packages/solid/build/types/popover/backdrop/PopoverBackdrop.d.ts:3`

#### Declaration

```typescript
(props: PopoverBackdropProps) => JSX.Element
```

<a id="api-506f706f7665722e4261636b64726f702e2470726f70732e636c617373"></a>

<a id="PopoverBackdrop-class"></a>

<a id="api-506f706f7665722e4261636b64726f702e2470726f70732e7374796c65"></a>

<a id="PopoverBackdrop-style"></a>

<a id="api-506f706f7665722e4261636b64726f702e2470726f70732e72656e646572"></a>

<a id="PopoverBackdrop-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<PopoverBackdropState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<PopoverBackdropState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, PopoverBackdropState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-506f706f7665724261636b64726f7044617461417474726962757465732e6f70656e"></a>

<a id="api-506f706f7665724261636b64726f7044617461417474726962757465732e636c6f736564"></a>

<a id="api-506f706f7665724261636b64726f7044617461417474726962757465732e7374617274696e675374796c65"></a>

<a id="api-506f706f7665724261636b64726f7044617461417474726962757465732e656e64696e675374796c65"></a>

| Name | Description |
| --- | --- |
| data-open | Present when open is true. |
| data-closed | Present when open is false. |
| data-starting-style | Present when transitionStatus is 'starting'. |
| data-ending-style | Present when transitionStatus is 'ending'. |

#### CSS variables

Metadata status: unavailable.

<a id="api-506f706f7665722e4261636b64726f702e50726f7073"></a>

<a id="popoverbackdropprops"></a>

<a id="api-506f706f7665722e4261636b64726f702e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Popover.Backdrop.Props

Declaration: `packages/solid/build/types/popover/backdrop/PopoverBackdrop.d.ts:11`

#### Declaration

```typescript
PopoverBackdropProps
```

<a id="api-506f706f7665722e4261636b64726f702e50726f70732e636c617373"></a>

<a id="PopoverBackdropProps-class"></a>

<a id="api-506f706f7665722e4261636b64726f702e50726f70732e7374796c65"></a>

<a id="PopoverBackdropProps-style"></a>

<a id="api-506f706f7665722e4261636b64726f702e50726f70732e72656e646572"></a>

<a id="PopoverBackdropProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<PopoverBackdropState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<PopoverBackdropState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, PopoverBackdropState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-506f706f7665722e4261636b64726f702e5374617465"></a>

<a id="popoverbackdropstate"></a>

### Related exported type: Popover.Backdrop.State

Declaration: `packages/solid/build/types/popover/backdrop/PopoverBackdrop.d.ts:12`

#### Declaration

```typescript
PopoverBackdropState
```

<a id="api-506f706f7665722e4261636b64726f702e53746174652e6f70656e"></a>

<a id="PopoverBackdropState-open"></a>

<a id="api-506f706f7665722e4261636b64726f702e53746174652e7472616e736974696f6e537461747573"></a>

<a id="PopoverBackdropState-transitionStatus"></a>

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

<a id="api-506f706f7665722e506f7274616c"></a>

<a id="popoverportal"></a>

<a id="api-506f706f7665722e506f7274616c2e2470726f70732e70726f703a616c69676e"></a>

### Popover.Portal

Declaration: `packages/solid/build/types/popover/portal/PopoverPortal.d.ts:3`

#### Declaration

```typescript
(props: PopoverPortalProps) => JSX.Element
```

<a id="api-506f706f7665722e506f7274616c2e2470726f70732e636f6e7461696e6572"></a>

<a id="PopoverPortal-container"></a>

<a id="api-506f706f7665722e506f7274616c2e2470726f70732e6964"></a>

<a id="PopoverPortal-id"></a>

<a id="api-506f706f7665722e506f7274616c2e2470726f70732e636c617373"></a>

<a id="PopoverPortal-class"></a>

<a id="api-506f706f7665722e506f7274616c2e2470726f70732e7374796c65"></a>

<a id="PopoverPortal-style"></a>

<a id="api-506f706f7665722e506f7274616c2e2470726f70732e6b6565704d6f756e746564"></a>

<a id="PopoverPortal-keepMounted"></a>

<a id="api-506f706f7665722e506f7274616c2e2470726f70732e72656e646572"></a>

<a id="PopoverPortal-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| container | `PortalContainer` | No | Unavailable |  |
| id | `string \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<PopoverPortalState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<PopoverPortalState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| keepMounted | `boolean \| undefined` | No | false |  |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, PopoverPortalState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-506f706f7665722e506f7274616c2e50726f7073"></a>

<a id="popoverportalprops"></a>

<a id="api-506f706f7665722e506f7274616c2e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Popover.Portal.Props

Declaration: `packages/solid/build/types/popover/portal/PopoverPortal.d.ts:12`

#### Declaration

```typescript
PopoverPortalProps
```

<a id="api-506f706f7665722e506f7274616c2e50726f70732e636f6e7461696e6572"></a>

<a id="PopoverPortalProps-container"></a>

<a id="api-506f706f7665722e506f7274616c2e50726f70732e6964"></a>

<a id="PopoverPortalProps-id"></a>

<a id="api-506f706f7665722e506f7274616c2e50726f70732e636c617373"></a>

<a id="PopoverPortalProps-class"></a>

<a id="api-506f706f7665722e506f7274616c2e50726f70732e7374796c65"></a>

<a id="PopoverPortalProps-style"></a>

<a id="api-506f706f7665722e506f7274616c2e50726f70732e6b6565704d6f756e746564"></a>

<a id="PopoverPortalProps-keepMounted"></a>

<a id="api-506f706f7665722e506f7274616c2e50726f70732e72656e646572"></a>

<a id="PopoverPortalProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| container | `PortalContainer` | No | Unavailable |  |
| id | `string \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<PopoverPortalState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<PopoverPortalState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| keepMounted | `boolean \| undefined` | No | Unavailable |  |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, PopoverPortalState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-506f706f7665722e506f7274616c2e5374617465"></a>

<a id="popoverportalstate"></a>

### Related exported type: Popover.Portal.State

Declaration: `packages/solid/build/types/popover/portal/PopoverPortal.d.ts:13`

#### Declaration

```typescript
PopoverPortalState
```

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="positioner"></a>

### Positioner

<a id="api-506f706f7665722e506f736974696f6e6572"></a>

<a id="popoverpositioner"></a>

<a id="api-506f706f7665722e506f736974696f6e65722e2470726f70732e70726f703a616c69676e"></a>

### Popover.Positioner

Declaration: `packages/solid/build/types/popover/positioner/PopoverPositioner.d.ts:3`

#### Declaration

```typescript
(props: PopoverPositionerProps) => JSX.Element
```

<a id="api-506f706f7665722e506f736974696f6e65722e2470726f70732e64697361626c65416e63686f72547261636b696e67"></a>

<a id="PopoverPositioner-disableAnchorTracking"></a>

<a id="api-506f706f7665722e506f736974696f6e65722e2470726f70732e616c69676e"></a>

<a id="PopoverPositioner-align"></a>

<a id="api-506f706f7665722e506f736974696f6e65722e2470726f70732e616c69676e4f6666736574"></a>

<a id="PopoverPositioner-alignOffset"></a>

<a id="api-506f706f7665722e506f736974696f6e65722e2470726f70732e73696465"></a>

<a id="PopoverPositioner-side"></a>

<a id="api-506f706f7665722e506f736974696f6e65722e2470726f70732e736964654f6666736574"></a>

<a id="PopoverPositioner-sideOffset"></a>

<a id="api-506f706f7665722e506f736974696f6e65722e2470726f70732e6172726f7750616464696e67"></a>

<a id="PopoverPositioner-arrowPadding"></a>

<a id="api-506f706f7665722e506f736974696f6e65722e2470726f70732e616e63686f72"></a>

<a id="PopoverPositioner-anchor"></a>

<a id="api-506f706f7665722e506f736974696f6e65722e2470726f70732e636f6c6c6973696f6e41766f6964616e6365"></a>

<a id="PopoverPositioner-collisionAvoidance"></a>

<a id="api-506f706f7665722e506f736974696f6e65722e2470726f70732e636f6c6c6973696f6e426f756e64617279"></a>

<a id="PopoverPositioner-collisionBoundary"></a>

<a id="api-506f706f7665722e506f736974696f6e65722e2470726f70732e636f6c6c6973696f6e50616464696e67"></a>

<a id="PopoverPositioner-collisionPadding"></a>

<a id="api-506f706f7665722e506f736974696f6e65722e2470726f70732e737469636b79"></a>

<a id="PopoverPositioner-sticky"></a>

<a id="api-506f706f7665722e506f736974696f6e65722e2470726f70732e706f736974696f6e4d6574686f64"></a>

<a id="PopoverPositioner-positionMethod"></a>

<a id="api-506f706f7665722e506f736974696f6e65722e2470726f70732e636c617373"></a>

<a id="PopoverPositioner-class"></a>

<a id="api-506f706f7665722e506f736974696f6e65722e2470726f70732e7374796c65"></a>

<a id="PopoverPositioner-style"></a>

<a id="api-506f706f7665722e506f736974696f6e65722e2470726f70732e72656e646572"></a>

<a id="PopoverPositioner-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| disableAnchorTracking | `boolean \| undefined` | No | false | Disables ancestor-scroll, element-resize and layout-shift observation used for automatic positioning updates. |
| align | `Align \| undefined` | No | Unavailable | Preferred alignment along the anchor’s side. Collision handling can change the resolved alignment. |
| alignOffset | `number \| OffsetFunction \| undefined` | No | Unavailable | Offset along the alignment axis, in pixels. A callback receives anchor and positioner dimensions plus the side and alignment. |
| side | `Side \| undefined` | No | Unavailable | Preferred side of the anchor. Logical inline sides follow the text direction; collision handling can change the resolved side. |
| sideOffset | `number \| OffsetFunction \| undefined` | No | Unavailable | Distance from the anchor along the side axis, in pixels. A callback receives anchor and positioner dimensions plus the side and alignment. |
| arrowPadding | `number \| undefined` | No | Unavailable | Minimum padding in pixels between the arrow and the floating element’s edges. |
| anchor | `ReferenceType \| (() => ReferenceType \| null) \| null \| undefined` | No | Unavailable | Positioning reference: an element or virtual reference, or an accessor returning one. A nullish reference falls back to the root’s reference. |
| collisionAvoidance | `{ side?: "flip" \| "shift" \| "none"; align?: "flip" \| "shift" \| "none"; fallbackAxisSide?: "start" \| "end" \| "none"; } \| undefined` | No | { fallbackAxisSide: 'end' } | Controls flipping or shifting along the side and alignment axes, including fallback placement on the perpendicular axis. |
| collisionBoundary | `Boundary \| "clipping-ancestors" \| undefined` | No | 'clipping-ancestors' | Boundary used to detect overflow. The clipping-ancestors value uses clipping ancestors as the overflow boundary. |
| collisionPadding | `Padding \| undefined` | No | Unavailable | Space in pixels reserved inside the collision boundary, either for all edges or per edge. |
| sticky | `boolean \| undefined` | No | Unavailable | Allows shifting along the side axis without the usual limitShift limiter. |
| positionMethod | `"fixed" \| "absolute" \| undefined` | No | Unavailable | CSS positioning strategy used by the floating element: absolute or fixed. |
| class | `JSX.ClassValue \| ((state: Readonly<PopoverPositionerState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<PopoverPositionerState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, PopoverPositionerState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-506f706f766572506f736974696f6e657244617461417474726962757465732e6f70656e"></a>

<a id="api-506f706f766572506f736974696f6e657244617461417474726962757465732e636c6f736564"></a>

<a id="api-506f706f766572506f736974696f6e657244617461417474726962757465732e616e63686f7248696464656e"></a>

<a id="api-506f706f766572506f736974696f6e657244617461417474726962757465732e616c69676e"></a>

<a id="api-506f706f766572506f736974696f6e657244617461417474726962757465732e73696465"></a>

| Name | Description |
| --- | --- |
| data-open | Present when the popover is open. |
| data-closed | Present when the popover is closed. |
| data-anchor-hidden | Present when the positioning anchor is hidden by its clipping boundary. |
| data-align | Resolved alignment after positioning and collision handling. |
| data-side | Resolved side of the anchor after positioning and collision handling. |

#### CSS variables

<a id="api-506f706f766572506f736974696f6e65724373735661726961626c65732e616e63686f72486569676874"></a>

<a id="api-506f706f766572506f736974696f6e65724373735661726961626c65732e616e63686f725769647468"></a>

<a id="api-506f706f766572506f736974696f6e65724373735661726961626c65732e617661696c61626c65486569676874"></a>

<a id="api-506f706f766572506f736974696f6e65724373735661726961626c65732e617661696c61626c655769647468"></a>

<a id="api-506f706f766572506f736974696f6e65724373735661726961626c65732e706f736974696f6e6572486569676874"></a>

<a id="api-506f706f766572506f736974696f6e65724373735661726961626c65732e706f736974696f6e65725769647468"></a>

<a id="api-506f706f766572506f736974696f6e65724373735661726961626c65732e7472616e73666f726d4f726967696e"></a>

| Name | Description |
| --- | --- |
| --anchor-height |  |
| --anchor-width |  |
| --available-height |  |
| --available-width |  |
| --positioner-height |  |
| --positioner-width |  |
| --transform-origin |  |

<a id="api-506f706f7665722e506f736974696f6e65722e50726f7073"></a>

<a id="popoverpositionerprops"></a>

<a id="api-506f706f7665722e506f736974696f6e65722e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Popover.Positioner.Props

Declaration: `packages/solid/build/types/popover/positioner/PopoverPositioner.d.ts:14`

#### Declaration

```typescript
PopoverPositionerProps
```

<a id="api-506f706f7665722e506f736974696f6e65722e50726f70732e64697361626c65416e63686f72547261636b696e67"></a>

<a id="PopoverPositionerProps-disableAnchorTracking"></a>

<a id="api-506f706f7665722e506f736974696f6e65722e50726f70732e616c69676e"></a>

<a id="PopoverPositionerProps-align"></a>

<a id="api-506f706f7665722e506f736974696f6e65722e50726f70732e616c69676e4f6666736574"></a>

<a id="PopoverPositionerProps-alignOffset"></a>

<a id="api-506f706f7665722e506f736974696f6e65722e50726f70732e73696465"></a>

<a id="PopoverPositionerProps-side"></a>

<a id="api-506f706f7665722e506f736974696f6e65722e50726f70732e736964654f6666736574"></a>

<a id="PopoverPositionerProps-sideOffset"></a>

<a id="api-506f706f7665722e506f736974696f6e65722e50726f70732e6172726f7750616464696e67"></a>

<a id="PopoverPositionerProps-arrowPadding"></a>

<a id="api-506f706f7665722e506f736974696f6e65722e50726f70732e616e63686f72"></a>

<a id="PopoverPositionerProps-anchor"></a>

<a id="api-506f706f7665722e506f736974696f6e65722e50726f70732e636f6c6c6973696f6e41766f6964616e6365"></a>

<a id="PopoverPositionerProps-collisionAvoidance"></a>

<a id="api-506f706f7665722e506f736974696f6e65722e50726f70732e636f6c6c6973696f6e426f756e64617279"></a>

<a id="PopoverPositionerProps-collisionBoundary"></a>

<a id="api-506f706f7665722e506f736974696f6e65722e50726f70732e636f6c6c6973696f6e50616464696e67"></a>

<a id="PopoverPositionerProps-collisionPadding"></a>

<a id="api-506f706f7665722e506f736974696f6e65722e50726f70732e737469636b79"></a>

<a id="PopoverPositionerProps-sticky"></a>

<a id="api-506f706f7665722e506f736974696f6e65722e50726f70732e706f736974696f6e4d6574686f64"></a>

<a id="PopoverPositionerProps-positionMethod"></a>

<a id="api-506f706f7665722e506f736974696f6e65722e50726f70732e636c617373"></a>

<a id="PopoverPositionerProps-class"></a>

<a id="api-506f706f7665722e506f736974696f6e65722e50726f70732e7374796c65"></a>

<a id="PopoverPositionerProps-style"></a>

<a id="api-506f706f7665722e506f736974696f6e65722e50726f70732e72656e646572"></a>

<a id="PopoverPositionerProps-render"></a>

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
| class | `JSX.ClassValue \| ((state: Readonly<PopoverPositionerState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<PopoverPositionerState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, PopoverPositionerState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-506f706f7665722e506f736974696f6e65722e5374617465"></a>

<a id="popoverpositionerstate"></a>

### Related exported type: Popover.Positioner.State

Declaration: `packages/solid/build/types/popover/positioner/PopoverPositioner.d.ts:15`

#### Declaration

```typescript
PopoverPositionerState
```

<a id="api-506f706f7665722e506f736974696f6e65722e53746174652e6f70656e"></a>

<a id="PopoverPositionerState-open"></a>

<a id="api-506f706f7665722e506f736974696f6e65722e53746174652e616e63686f7248696464656e"></a>

<a id="PopoverPositionerState-anchorHidden"></a>

<a id="api-506f706f7665722e506f736974696f6e65722e53746174652e696e7374616e74"></a>

<a id="PopoverPositionerState-instant"></a>

<a id="api-506f706f7665722e506f736974696f6e65722e53746174652e616c69676e"></a>

<a id="PopoverPositionerState-align"></a>

<a id="api-506f706f7665722e506f736974696f6e65722e53746174652e73696465"></a>

<a id="PopoverPositionerState-side"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| open | `boolean` | Yes | Unavailable | Whether this popover is open. |
| anchorHidden | `boolean` | Yes | Unavailable | Whether the positioning anchor is hidden by its clipping boundary. |
| instant | `string \| undefined` | Yes | Unavailable |  |
| align | `Align` | Yes | Unavailable | Resolved alignment after positioning and collision handling. |
| side | `Side` | Yes | Unavailable | Resolved side after positioning and collision handling. |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="popup"></a>

### Popup

<a id="api-506f706f7665722e506f707570"></a>

<a id="popoverpopup"></a>

<a id="api-506f706f7665722e506f7075702e2470726f70732e70726f703a616c69676e"></a>

### Popover.Popup

Declaration: `packages/solid/build/types/popover/popup/PopoverPopup.d.ts:5`

#### Declaration

```typescript
(props: PopoverPopupProps) => JSX.Element
```

<a id="api-506f706f7665722e506f7075702e2470726f70732e696e697469616c466f637573"></a>

<a id="PopoverPopup-initialFocus"></a>

<a id="api-506f706f7665722e506f7075702e2470726f70732e66696e616c466f637573"></a>

<a id="PopoverPopup-finalFocus"></a>

<a id="api-506f706f7665722e506f7075702e2470726f70732e6964"></a>

<a id="PopoverPopup-id"></a>

<a id="api-506f706f7665722e506f7075702e2470726f70732e636c617373"></a>

<a id="PopoverPopup-class"></a>

<a id="api-506f706f7665722e506f7075702e2470726f70732e7374796c65"></a>

<a id="PopoverPopup-style"></a>

<a id="api-506f706f7665722e506f7075702e2470726f70732e72656e646572"></a>

<a id="PopoverPopup-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| initialFocus | `PopoverFocusTarget \| undefined` | No | Unavailable |  |
| finalFocus | `PopoverFocusTarget \| undefined` | No | Unavailable |  |
| id | `string \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<PopoverPopupState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<PopoverPopupState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, PopoverPopupState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-506f706f766572506f70757044617461417474726962757465732e6f70656e"></a>

<a id="api-506f706f766572506f70757044617461417474726962757465732e636c6f736564"></a>

<a id="api-506f706f766572506f70757044617461417474726962757465732e616c69676e"></a>

<a id="api-506f706f766572506f70757044617461417474726962757465732e696e7374616e74"></a>

<a id="api-506f706f766572506f70757044617461417474726962757465732e73696465"></a>

<a id="api-506f706f766572506f70757044617461417474726962757465732e7374617274696e675374796c65"></a>

<a id="api-506f706f766572506f70757044617461417474726962757465732e656e64696e675374796c65"></a>

| Name | Description |
| --- | --- |
| data-open | Present when open is true. |
| data-closed | Present when open is false. |
| data-align |  |
| data-instant |  |
| data-side |  |
| data-starting-style | Present when transitionStatus is 'starting'. |
| data-ending-style | Present when transitionStatus is 'ending'. |

#### CSS variables

<a id="api-506f706f766572506f7075704373735661726961626c65732e706f707570486569676874"></a>

<a id="api-506f706f766572506f7075704373735661726961626c65732e706f7075705769647468"></a>

| Name | Description |
| --- | --- |
| --popup-height |  |
| --popup-width |  |

<a id="api-506f706f7665722e506f7075702e50726f7073"></a>

<a id="popoverpopupprops"></a>

<a id="api-506f706f7665722e506f7075702e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Popover.Popup.Props

Declaration: `packages/solid/build/types/popover/popup/PopoverPopup.d.ts:20`

#### Declaration

```typescript
PopoverPopupProps
```

<a id="api-506f706f7665722e506f7075702e50726f70732e696e697469616c466f637573"></a>

<a id="PopoverPopupProps-initialFocus"></a>

<a id="api-506f706f7665722e506f7075702e50726f70732e66696e616c466f637573"></a>

<a id="PopoverPopupProps-finalFocus"></a>

<a id="api-506f706f7665722e506f7075702e50726f70732e6964"></a>

<a id="PopoverPopupProps-id"></a>

<a id="api-506f706f7665722e506f7075702e50726f70732e636c617373"></a>

<a id="PopoverPopupProps-class"></a>

<a id="api-506f706f7665722e506f7075702e50726f70732e7374796c65"></a>

<a id="PopoverPopupProps-style"></a>

<a id="api-506f706f7665722e506f7075702e50726f70732e72656e646572"></a>

<a id="PopoverPopupProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| initialFocus | `PopoverFocusTarget \| undefined` | No | Unavailable |  |
| finalFocus | `PopoverFocusTarget \| undefined` | No | Unavailable |  |
| id | `string \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<PopoverPopupState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<PopoverPopupState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, PopoverPopupState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-506f706f7665722e506f7075702e5374617465"></a>

<a id="popoverpopupstate"></a>

### Related exported type: Popover.Popup.State

Declaration: `packages/solid/build/types/popover/popup/PopoverPopup.d.ts:21`

#### Declaration

```typescript
PopoverPopupState
```

<a id="api-506f706f7665722e506f7075702e53746174652e6f70656e"></a>

<a id="PopoverPopupState-open"></a>

<a id="api-506f706f7665722e506f7075702e53746174652e696e7374616e74"></a>

<a id="PopoverPopupState-instant"></a>

<a id="api-506f706f7665722e506f7075702e53746174652e7472616e736974696f6e537461747573"></a>

<a id="PopoverPopupState-transitionStatus"></a>

<a id="api-506f706f7665722e506f7075702e53746174652e616c69676e"></a>

<a id="PopoverPopupState-align"></a>

<a id="api-506f706f7665722e506f7075702e53746174652e73696465"></a>

<a id="PopoverPopupState-side"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| open | `boolean` | Yes | Unavailable |  |
| instant | `PopoverInstant` | Yes | Unavailable |  |
| transitionStatus | `TransitionStatus` | Yes | Unavailable |  |
| align | `Align` | Yes | Unavailable |  |
| side | `Side` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="arrow"></a>

### Arrow

<a id="api-506f706f7665722e4172726f77"></a>

<a id="popoverarrow"></a>

<a id="api-506f706f7665722e4172726f772e2470726f70732e70726f703a616c69676e"></a>

### Popover.Arrow

Declaration: `packages/solid/build/types/popover/arrow/PopoverArrow.d.ts:3`

#### Declaration

```typescript
(props: PopoverArrowProps) => JSX.Element
```

<a id="api-506f706f7665722e4172726f772e2470726f70732e636c617373"></a>

<a id="PopoverArrow-class"></a>

<a id="api-506f706f7665722e4172726f772e2470726f70732e7374796c65"></a>

<a id="PopoverArrow-style"></a>

<a id="api-506f706f7665722e4172726f772e2470726f70732e72656e646572"></a>

<a id="PopoverArrow-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<PopoverArrowState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<PopoverArrowState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, PopoverArrowState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-506f706f7665724172726f7744617461417474726962757465732e6f70656e"></a>

<a id="api-506f706f7665724172726f7744617461417474726962757465732e636c6f736564"></a>

<a id="api-506f706f7665724172726f7744617461417474726962757465732e756e63656e7465726564"></a>

<a id="api-506f706f7665724172726f7744617461417474726962757465732e616c69676e"></a>

<a id="api-506f706f7665724172726f7744617461417474726962757465732e73696465"></a>

| Name | Description |
| --- | --- |
| data-open | Present when open is true. |
| data-closed | Present when open is false. |
| data-uncentered |  |
| data-align |  |
| data-side |  |

#### CSS variables

Metadata status: unavailable.

<a id="api-506f706f7665722e4172726f772e50726f7073"></a>

<a id="popoverarrowprops"></a>

<a id="api-506f706f7665722e4172726f772e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Popover.Arrow.Props

Declaration: `packages/solid/build/types/popover/arrow/PopoverArrow.d.ts:13`

#### Declaration

```typescript
PopoverArrowProps
```

<a id="api-506f706f7665722e4172726f772e50726f70732e636c617373"></a>

<a id="PopoverArrowProps-class"></a>

<a id="api-506f706f7665722e4172726f772e50726f70732e7374796c65"></a>

<a id="PopoverArrowProps-style"></a>

<a id="api-506f706f7665722e4172726f772e50726f70732e72656e646572"></a>

<a id="PopoverArrowProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<PopoverArrowState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<PopoverArrowState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, PopoverArrowState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-506f706f7665722e4172726f772e5374617465"></a>

<a id="popoverarrowstate"></a>

### Related exported type: Popover.Arrow.State

Declaration: `packages/solid/build/types/popover/arrow/PopoverArrow.d.ts:14`

#### Declaration

```typescript
PopoverArrowState
```

<a id="api-506f706f7665722e4172726f772e53746174652e6f70656e"></a>

<a id="PopoverArrowState-open"></a>

<a id="api-506f706f7665722e4172726f772e53746174652e756e63656e7465726564"></a>

<a id="PopoverArrowState-uncentered"></a>

<a id="api-506f706f7665722e4172726f772e53746174652e616c69676e"></a>

<a id="PopoverArrowState-align"></a>

<a id="api-506f706f7665722e4172726f772e53746174652e73696465"></a>

<a id="PopoverArrowState-side"></a>

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

<a id="title"></a>

### Title

<a id="api-506f706f7665722e5469746c65"></a>

<a id="popovertitle"></a>

<a id="api-506f706f7665722e5469746c652e2470726f70732e70726f703a616c69676e"></a>

### Popover.Title

Declaration: `packages/solid/build/types/popover/title/PopoverTitle.d.ts:2`

#### Declaration

```typescript
(props: PopoverTitleProps) => JSX.Element
```

<a id="api-506f706f7665722e5469746c652e2470726f70732e6964"></a>

<a id="PopoverTitle-id"></a>

<a id="api-506f706f7665722e5469746c652e2470726f70732e636c617373"></a>

<a id="PopoverTitle-class"></a>

<a id="api-506f706f7665722e5469746c652e2470726f70732e7374796c65"></a>

<a id="PopoverTitle-style"></a>

<a id="api-506f706f7665722e5469746c652e2470726f70732e72656e646572"></a>

<a id="PopoverTitle-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| id | `string \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<PopoverTitleState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<PopoverTitleState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, PopoverTitleState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-506f706f7665722e5469746c652e50726f7073"></a>

<a id="popovertitleprops"></a>

<a id="api-506f706f7665722e5469746c652e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Popover.Title.Props

Declaration: `packages/solid/build/types/popover/title/PopoverTitle.d.ts:9`

#### Declaration

```typescript
PopoverTitleProps
```

<a id="api-506f706f7665722e5469746c652e50726f70732e6964"></a>

<a id="PopoverTitleProps-id"></a>

<a id="api-506f706f7665722e5469746c652e50726f70732e636c617373"></a>

<a id="PopoverTitleProps-class"></a>

<a id="api-506f706f7665722e5469746c652e50726f70732e7374796c65"></a>

<a id="PopoverTitleProps-style"></a>

<a id="api-506f706f7665722e5469746c652e50726f70732e72656e646572"></a>

<a id="PopoverTitleProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| id | `string \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<PopoverTitleState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<PopoverTitleState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, PopoverTitleState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-506f706f7665722e5469746c652e5374617465"></a>

<a id="popovertitlestate"></a>

### Related exported type: Popover.Title.State

Declaration: `packages/solid/build/types/popover/title/PopoverTitle.d.ts:10`

#### Declaration

```typescript
PopoverTitleState
```

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="description"></a>

### Description

<a id="api-506f706f7665722e4465736372697074696f6e"></a>

<a id="popoverdescription"></a>

<a id="api-506f706f7665722e4465736372697074696f6e2e2470726f70732e70726f703a616c69676e"></a>

### Popover.Description

Declaration: `packages/solid/build/types/popover/description/PopoverDescription.d.ts:2`

#### Declaration

```typescript
(props: PopoverDescriptionProps) => JSX.Element
```

<a id="api-506f706f7665722e4465736372697074696f6e2e2470726f70732e6964"></a>

<a id="PopoverDescription-id"></a>

<a id="api-506f706f7665722e4465736372697074696f6e2e2470726f70732e636c617373"></a>

<a id="PopoverDescription-class"></a>

<a id="api-506f706f7665722e4465736372697074696f6e2e2470726f70732e7374796c65"></a>

<a id="PopoverDescription-style"></a>

<a id="api-506f706f7665722e4465736372697074696f6e2e2470726f70732e72656e646572"></a>

<a id="PopoverDescription-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| id | `string \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<PopoverDescriptionState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<PopoverDescriptionState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, PopoverDescriptionState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-506f706f7665722e4465736372697074696f6e2e50726f7073"></a>

<a id="popoverdescriptionprops"></a>

<a id="api-506f706f7665722e4465736372697074696f6e2e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Popover.Description.Props

Declaration: `packages/solid/build/types/popover/description/PopoverDescription.d.ts:9`

#### Declaration

```typescript
PopoverDescriptionProps
```

<a id="api-506f706f7665722e4465736372697074696f6e2e50726f70732e6964"></a>

<a id="PopoverDescriptionProps-id"></a>

<a id="api-506f706f7665722e4465736372697074696f6e2e50726f70732e636c617373"></a>

<a id="PopoverDescriptionProps-class"></a>

<a id="api-506f706f7665722e4465736372697074696f6e2e50726f70732e7374796c65"></a>

<a id="PopoverDescriptionProps-style"></a>

<a id="api-506f706f7665722e4465736372697074696f6e2e50726f70732e72656e646572"></a>

<a id="PopoverDescriptionProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| id | `string \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<PopoverDescriptionState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<PopoverDescriptionState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, PopoverDescriptionState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-506f706f7665722e4465736372697074696f6e2e5374617465"></a>

<a id="popoverdescriptionstate"></a>

### Related exported type: Popover.Description.State

Declaration: `packages/solid/build/types/popover/description/PopoverDescription.d.ts:10`

#### Declaration

```typescript
PopoverDescriptionState
```

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="close"></a>

### Close

<a id="api-506f706f7665722e436c6f7365"></a>

<a id="popoverclose"></a>

<a id="api-506f706f7665722e436c6f73652e2470726f70732e70726f703a64697361626c6564"></a>

<a id="api-506f706f7665722e436c6f73652e2470726f70732e70726f703a666f726d416374696f6e"></a>

<a id="api-506f706f7665722e436c6f73652e2470726f70732e70726f703a666f726d456e6374797065"></a>

<a id="api-506f706f7665722e436c6f73652e2470726f70732e70726f703a666f726d4d6574686f64"></a>

<a id="api-506f706f7665722e436c6f73652e2470726f70732e70726f703a666f726d4e6f56616c6964617465"></a>

<a id="api-506f706f7665722e436c6f73652e2470726f70732e70726f703a666f726d546172676574"></a>

<a id="api-506f706f7665722e436c6f73652e2470726f70732e70726f703a6e616d65"></a>

<a id="api-506f706f7665722e436c6f73652e2470726f70732e70726f703a706f706f766572546172676574416374696f6e"></a>

<a id="api-506f706f7665722e436c6f73652e2470726f70732e70726f703a706f706f766572546172676574456c656d656e74"></a>

<a id="api-506f706f7665722e436c6f73652e2470726f70732e70726f703a74797065"></a>

<a id="api-506f706f7665722e436c6f73652e2470726f70732e70726f703a76616c7565"></a>

### Popover.Close

Declaration: `packages/solid/build/types/popover/close/PopoverClose.d.ts:2`

#### Declaration

```typescript
(props: PopoverCloseProps) => JSX.Element
```

<a id="api-506f706f7665722e436c6f73652e2470726f70732e6e6174697665427574746f6e"></a>

<a id="PopoverClose-nativeButton"></a>

<a id="api-506f706f7665722e436c6f73652e2470726f70732e64697361626c6564"></a>

<a id="PopoverClose-disabled"></a>

<a id="api-506f706f7665722e436c6f73652e2470726f70732e636c617373"></a>

<a id="PopoverClose-class"></a>

<a id="api-506f706f7665722e436c6f73652e2470726f70732e7374796c65"></a>

<a id="PopoverClose-style"></a>

<a id="api-506f706f7665722e436c6f73652e2470726f70732e72656e646572"></a>

<a id="PopoverClose-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| nativeButton | `boolean \| undefined` | No | true |  |
| disabled | `boolean \| undefined` | No | false |  |
| class | `JSX.ClassValue \| ((state: Readonly<PopoverCloseState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<PopoverCloseState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, PopoverCloseState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `command`, `commandfor`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `form`, `formaction`, `formenctype`, `formmethod`, `formnovalidate`, `formtarget`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `name`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `popovertarget`, `popovertargetaction`, `prefix`, `prop:disabled`, `prop:formAction`, `prop:formEnctype`, `prop:formMethod`, `prop:formNoValidate`, `prop:formTarget`, `prop:name`, `prop:popoverTargetAction`, `prop:popoverTargetElement`, `prop:type`, `prop:value`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `type`, `typeof`, `value`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-506f706f7665722e436c6f73652e50726f7073"></a>

<a id="popovercloseprops"></a>

<a id="api-506f706f7665722e436c6f73652e50726f70732e70726f703a64697361626c6564"></a>

<a id="api-506f706f7665722e436c6f73652e50726f70732e70726f703a666f726d416374696f6e"></a>

<a id="api-506f706f7665722e436c6f73652e50726f70732e70726f703a666f726d456e6374797065"></a>

<a id="api-506f706f7665722e436c6f73652e50726f70732e70726f703a666f726d4d6574686f64"></a>

<a id="api-506f706f7665722e436c6f73652e50726f70732e70726f703a666f726d4e6f56616c6964617465"></a>

<a id="api-506f706f7665722e436c6f73652e50726f70732e70726f703a666f726d546172676574"></a>

<a id="api-506f706f7665722e436c6f73652e50726f70732e70726f703a6e616d65"></a>

<a id="api-506f706f7665722e436c6f73652e50726f70732e70726f703a706f706f766572546172676574416374696f6e"></a>

<a id="api-506f706f7665722e436c6f73652e50726f70732e70726f703a706f706f766572546172676574456c656d656e74"></a>

<a id="api-506f706f7665722e436c6f73652e50726f70732e70726f703a74797065"></a>

<a id="api-506f706f7665722e436c6f73652e50726f70732e70726f703a76616c7565"></a>

### Related exported type: Popover.Close.Props

Declaration: `packages/solid/build/types/popover/close/PopoverClose.d.ts:10`

#### Declaration

```typescript
PopoverCloseProps
```

<a id="api-506f706f7665722e436c6f73652e50726f70732e6e6174697665427574746f6e"></a>

<a id="PopoverCloseProps-nativeButton"></a>

<a id="api-506f706f7665722e436c6f73652e50726f70732e64697361626c6564"></a>

<a id="PopoverCloseProps-disabled"></a>

<a id="api-506f706f7665722e436c6f73652e50726f70732e636c617373"></a>

<a id="PopoverCloseProps-class"></a>

<a id="api-506f706f7665722e436c6f73652e50726f70732e7374796c65"></a>

<a id="PopoverCloseProps-style"></a>

<a id="api-506f706f7665722e436c6f73652e50726f70732e72656e646572"></a>

<a id="PopoverCloseProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| nativeButton | `boolean \| undefined` | No | Unavailable |  |
| disabled | `boolean \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<PopoverCloseState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<PopoverCloseState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, PopoverCloseState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `command`, `commandfor`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `form`, `formaction`, `formenctype`, `formmethod`, `formnovalidate`, `formtarget`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `name`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `popovertarget`, `popovertargetaction`, `prefix`, `prop:disabled`, `prop:formAction`, `prop:formEnctype`, `prop:formMethod`, `prop:formNoValidate`, `prop:formTarget`, `prop:name`, `prop:popoverTargetAction`, `prop:popoverTargetElement`, `prop:type`, `prop:value`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `type`, `typeof`, `value`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-506f706f7665722e436c6f73652e5374617465"></a>

<a id="popoverclosestate"></a>

### Related exported type: Popover.Close.State

Declaration: `packages/solid/build/types/popover/close/PopoverClose.d.ts:11`

#### Declaration

```typescript
PopoverCloseState
```

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="viewport"></a>

### Viewport

<a id="api-506f706f7665722e56696577706f7274"></a>

<a id="popoverviewport"></a>

<a id="api-506f706f7665722e56696577706f72742e2470726f70732e70726f703a616c69676e"></a>

### Popover.Viewport

Declaration: `packages/solid/build/types/popover/viewport/PopoverViewport.d.ts:3`

#### Declaration

```typescript
(props: PopoverViewportProps) => JSX.Element
```

<a id="api-506f706f7665722e56696577706f72742e2470726f70732e636c617373"></a>

<a id="PopoverViewport-class"></a>

<a id="api-506f706f7665722e56696577706f72742e2470726f70732e7374796c65"></a>

<a id="PopoverViewport-style"></a>

<a id="api-506f706f7665722e56696577706f72742e2470726f70732e72656e646572"></a>

<a id="PopoverViewport-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<PopoverViewportState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<PopoverViewportState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, PopoverViewportState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-506f706f76657256696577706f727444617461417474726962757465732e61637469766174696f6e446972656374696f6e"></a>

<a id="api-506f706f76657256696577706f727444617461417474726962757465732e63757272656e74"></a>

<a id="api-506f706f76657256696577706f727444617461417474726962757465732e696e7374616e74"></a>

<a id="api-506f706f76657256696577706f727444617461417474726962757465732e70726576696f7573"></a>

<a id="api-506f706f76657256696577706f727444617461417474726962757465732e7472616e736974696f6e696e67"></a>

| Name | Description |
| --- | --- |
| data-activation-direction |  |
| data-current |  |
| data-instant |  |
| data-previous |  |
| data-transitioning |  |

#### CSS variables

<a id="api-506f706f76657256696577706f72744373735661726961626c65732e706f707570486569676874"></a>

<a id="api-506f706f76657256696577706f72744373735661726961626c65732e706f7075705769647468"></a>

| Name | Description |
| --- | --- |
| --popup-height |  |
| --popup-width |  |

<a id="api-506f706f7665722e56696577706f72742e50726f7073"></a>

<a id="popoverviewportprops"></a>

<a id="api-506f706f7665722e56696577706f72742e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Popover.Viewport.Props

Declaration: `packages/solid/build/types/popover/viewport/PopoverViewport.d.ts:12`

#### Declaration

```typescript
PopoverViewportProps
```

<a id="api-506f706f7665722e56696577706f72742e50726f70732e636c617373"></a>

<a id="PopoverViewportProps-class"></a>

<a id="api-506f706f7665722e56696577706f72742e50726f70732e7374796c65"></a>

<a id="PopoverViewportProps-style"></a>

<a id="api-506f706f7665722e56696577706f72742e50726f70732e72656e646572"></a>

<a id="PopoverViewportProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<PopoverViewportState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<PopoverViewportState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, PopoverViewportState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-506f706f7665722e56696577706f72742e5374617465"></a>

<a id="popoverviewportstate"></a>

### Related exported type: Popover.Viewport.State

Declaration: `packages/solid/build/types/popover/viewport/PopoverViewport.d.ts:13`

#### Declaration

```typescript
PopoverViewportState
```

<a id="api-506f706f7665722e56696577706f72742e53746174652e61637469766174696f6e446972656374696f6e"></a>

<a id="PopoverViewportState-activationDirection"></a>

<a id="api-506f706f7665722e56696577706f72742e53746174652e696e7374616e74"></a>

<a id="PopoverViewportState-instant"></a>

<a id="api-506f706f7665722e56696577706f72742e53746174652e7472616e736974696f6e696e67"></a>

<a id="PopoverViewportState-transitioning"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| activationDirection | `string \| undefined` | Yes | Unavailable |  |
| instant | `PopoverInstant` | Yes | Unavailable |  |
| transitioning | `boolean` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

The `Viewport` is optional — reach for it only when a single popup is opened by multiple triggers, its content differs per trigger, and the switch between them is animated. When used, set `width: var(--positioner-width)` and `height: var(--positioner-height)` on the `Positioner` so its box is frozen to the measured size during the transition; otherwise content-driven resizing can make the popup thrash or flip to another side.

<a id="createhandle"></a>

## createHandle

<a id="api-506f706f7665722e63726561746548616e646c65"></a>

<a id="popovercreatehandle"></a>

### Popover.createHandle

Declaration: `packages/solid/build/types/popover/store/PopoverHandle.d.ts:10`

#### Declaration

```typescript
<Payload = unknown>() => PopoverHandle<Payload>
```

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

#### Return value

```typescript
PopoverHandle<Payload>
```

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| open | `(triggerId: string) => void` | Yes | Unavailable |  |
| close | `() => void` | Yes | Unavailable |  |
| isOpen | `boolean` | Yes | Unavailable |  |
| fallbackStore | `PopoverHandleStore<Payload>` | Yes | Unavailable |  |
| componentName | `any` | Yes | Unavailable |  |
| throwOnMissingTrigger | `any` | Yes | Unavailable |  |
| attached | `any` | Yes | Unavailable |  |
| current | `any` | Yes | Unavailable |  |
| version | `any` | Yes | Unavailable |  |
| warning | `any` | Yes | Unavailable |  |
| attachedStore | `PopoverStore<Payload> \| null` | Yes | Unavailable |  |
| store | `PopoverHandleStore<Payload>` | Yes | Unavailable |  |
| serverStore | `PopoverHandleStore<Payload>` | Yes | Unavailable |  |
| attachStore | `(store: PopoverStore<Payload>) => () => void` | Yes | Unavailable |  |
| activate | `any` | Yes | Unavailable |  |
| openByTrigger | `(id: string \| null \| undefined) => void` | Yes | Unavailable |  |
| closePopup | `() => void` | Yes | Unavailable |  |

[//]: # "@exclude-table-of-contents"

<a id="handle"></a>

### Handle

<a id="api-506f706f7665722e48616e646c65"></a>

<a id="popoverhandle"></a>

### Popover.Handle

Attachment, fallback migration and diagnostics are shared popup-engine behavior.

Declaration: `packages/solid/build/types/popover/store/PopoverHandle.d.ts:4`

#### Declaration

```typescript
PopoverHandle<Payload>
```

<a id="api-506f706f7665722e48616e646c652e6f70656e"></a>

<a id="PopoverHandle-open"></a>

<a id="api-506f706f7665722e48616e646c652e6163746976617465"></a>

<a id="PopoverHandle-activate"></a>

<a id="api-506f706f7665722e48616e646c652e61747461636853746f7265"></a>

<a id="PopoverHandle-attachStore"></a>

<a id="api-506f706f7665722e48616e646c652e6174746163686564"></a>

<a id="PopoverHandle-attached"></a>

<a id="api-506f706f7665722e48616e646c652e617474616368656453746f7265"></a>

<a id="PopoverHandle-attachedStore"></a>

<a id="api-506f706f7665722e48616e646c652e636c6f7365"></a>

<a id="PopoverHandle-close"></a>

<a id="api-506f706f7665722e48616e646c652e636c6f7365506f707570"></a>

<a id="PopoverHandle-closePopup"></a>

<a id="api-506f706f7665722e48616e646c652e636f6d706f6e656e744e616d65"></a>

<a id="PopoverHandle-componentName"></a>

<a id="api-506f706f7665722e48616e646c652e63757272656e74"></a>

<a id="PopoverHandle-current"></a>

<a id="api-506f706f7665722e48616e646c652e66616c6c6261636b53746f7265"></a>

<a id="PopoverHandle-fallbackStore"></a>

<a id="api-506f706f7665722e48616e646c652e69734f70656e"></a>

<a id="PopoverHandle-isOpen"></a>

<a id="api-506f706f7665722e48616e646c652e6f70656e427954726967676572"></a>

<a id="PopoverHandle-openByTrigger"></a>

<a id="api-506f706f7665722e48616e646c652e73657276657253746f7265"></a>

<a id="PopoverHandle-serverStore"></a>

<a id="api-506f706f7665722e48616e646c652e73746f7265"></a>

<a id="PopoverHandle-store"></a>

<a id="api-506f706f7665722e48616e646c652e7468726f774f6e4d697373696e6754726967676572"></a>

<a id="PopoverHandle-throwOnMissingTrigger"></a>

<a id="api-506f706f7665722e48616e646c652e76657273696f6e"></a>

<a id="PopoverHandle-version"></a>

<a id="api-506f706f7665722e48616e646c652e7761726e696e67"></a>

<a id="PopoverHandle-warning"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| open | `(triggerId: string) => void` | Yes | Unavailable |  |
| activate | `any` | Yes | Unavailable |  |
| attachStore | `(store: PopoverStore<Payload>) => () => void` | Yes | Unavailable |  |
| attached | `any` | Yes | Unavailable |  |
| attachedStore | `PopoverStore<Payload> \| null` | Yes | Unavailable |  |
| close | `() => void` | Yes | Unavailable |  |
| closePopup | `() => void` | Yes | Unavailable |  |
| componentName | `any` | Yes | Unavailable |  |
| current | `any` | Yes | Unavailable |  |
| fallbackStore | `PopoverHandleStore<Payload>` | Yes | Unavailable |  |
| isOpen | `boolean` | Yes | Unavailable |  |
| openByTrigger | `(id: string \| null \| undefined) => void` | Yes | Unavailable |  |
| serverStore | `PopoverHandleStore<Payload>` | Yes | Unavailable |  |
| store | `PopoverHandleStore<Payload>` | Yes | Unavailable |  |
| throwOnMissingTrigger | `any` | Yes | Unavailable |  |
| version | `any` | Yes | Unavailable |  |
| warning | `any` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

