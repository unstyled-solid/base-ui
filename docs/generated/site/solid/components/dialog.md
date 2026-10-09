<a id="dialog"></a>

# Dialog

A popup that opens on top of the entire page.

[Open mounted Solid demo: dialog/hero](/solid/components/dialog)

<a id="usage-guidelines"></a>

## Usage guidelines

- **Dialog doesn't support gestures:** Use [Drawer](/solid/components/drawer) when you need gesture support or snap points. A panel that slides in from the edge of the screen and doesn't need gesture support is a positioned Dialog.

<a id="anatomy"></a>

## Anatomy

Import the component and assemble its parts:

```tsx
import { Dialog } from '@unstyled-solid/base-ui/dialog';
<Dialog.Root>
  <Dialog.Trigger />
  <Dialog.Portal>
    <Dialog.Backdrop />
    <Dialog.Viewport>
      <Dialog.Popup>
        <Dialog.Title />
        <Dialog.Description />
        <Dialog.Close />
      </Dialog.Popup>
    </Dialog.Viewport>
  </Dialog.Portal>
</Dialog.Root>;
```

<a id="examples"></a>

## Examples

<a id="state"></a>

### State

By default, Dialog is an uncontrolled component that manages its own state.

```tsx
<Dialog.Root>
  <Dialog.Trigger>Open</Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Popup>
      <Dialog.Title>Example dialog</Dialog.Title>
      <Dialog.Close>Close</Dialog.Close>
    </Dialog.Popup>
  </Dialog.Portal>
</Dialog.Root>;
```

Use `open` and `onOpenChange` props if you need to access or control the state of the dialog.
For example, you can control the dialog state in order to open it imperatively from another place in your app.

```tsx
import { createSignal } from 'solid-js';
const [open, setOpen] = createSignal(false);
return (
  <Dialog.Root open={open()} onOpenChange={setOpen}>
    <Dialog.Trigger>Open</Dialog.Trigger>
    <Dialog.Portal>
      <Dialog.Popup>
        <form
          // Close the dialog once the form data is submitted
          onSubmit={async () => {
            await submitData();
            setOpen(false);
          }}
        >
          ...
        </form>
      </Dialog.Popup>
    </Dialog.Portal>
  </Dialog.Root>
);
```

It's also common to use `onOpenChange` if your app needs to do something when the dialog is closed or opened. This is recommended over `a state-watching effect` when reacting to state changes.

```tsx
<Dialog.Root
  open={open}
  onOpenChange={(open) => {
    // Do stuff when the dialog is closed
    if (!open) {
      doStuff();
    }
    // Set the new state
    setOpen(open);
  }}
>
```

<a id="open-from-a-menu"></a>

### Open from a menu

In order to open a dialog using a menu, control the dialog state and open it imperatively using the `onClick` handler on the menu item.

[Open mounted Solid demo: dialog/open-from-menu](/solid/components/dialog)

<a id="nested-dialogs"></a>

### Nested dialogs

You can nest dialogs within one another normally.

Use the `[data-nested-dialog-open]` selector and the `var(--nested-dialogs)` CSS variable to customize the styling of the parent dialog. Backdrops of the child dialogs won't be rendered so that you can present the parent dialog in a clean way behind the one on top of it.

[Open mounted Solid demo: dialog/nested](/solid/components/dialog)

<a id="close-confirmation"></a>

### Close confirmation

This example shows a nested confirmation dialog that opens if the text entered in the parent dialog is going to be discarded.

To implement this, both dialogs should be controlled. The confirmation dialog may be opened when `onOpenChange` callback of the parent dialog receives a request to close. This way, the confirmation is automatically shown when the user clicks the backdrop, presses the Esc key, or clicks a close button.

[Open mounted Solid demo: dialog/close-confirmation](/solid/components/dialog)

<a id="custom-focus-management"></a>

### Custom focus management

You can control where the focus goes when the dialog opens and closes using the `initialFocus` and `finalFocus` props on the `<Dialog.Popup>` component.

You can also set these props to `false` to prevent focus from moving when the dialog opens or closes, or to a function that returns the element to focus based on the interaction type.

[Open mounted Solid demo: dialog/focus-management](/solid/components/dialog)

<a id="outside-scroll-dialog"></a>

### Outside scroll dialog

The dialog can be made scrollable by using `<Dialog.Viewport>` as an outer scrollable container for `<Dialog.Popup>` while the popup can extend past the bottom edge. The scrollable area uses the [Scroll Area component](/solid/components/scroll-area) to provide custom scrollbars.

[Open mounted Solid demo: dialog/outside-scroll](/solid/components/dialog)

<a id="inside-scroll-dialog"></a>

### Inside scroll dialog

The dialog can be made scrollable by making an inner container scrollable while the popup stays fully on screen. `<Dialog.Viewport>` is used as a positioning container for `<Dialog.Popup>`, while an inner scrollable area is created using the [Scroll Area component](/solid/components/scroll-area).

[Open mounted Solid demo: dialog/inside-scroll](/solid/components/dialog)

<a id="placing-elements-outside-the-popup"></a>

### Placing elements outside the popup

When adding elements that should appear "outside" the colored popup area, continue to place them inside `<Dialog.Popup>`, but create a child element that has the popup styles. This ensures they are kept in the tab order and announced correctly by screen readers.

`<Dialog.Popup>` has `pointer-events: none`, while inner content (the colored popup and close button) has `pointer-events: auto` so clicks on the backdrop continue to be registered.

[Open mounted Solid demo: dialog/uncontained](/solid/components/dialog)

<a id="detached-triggers"></a>

### Detached triggers

A dialog can be controlled by a trigger located either inside or outside the `<Dialog.Root>` component.
For simple, one-off interactions, place the `<Dialog.Trigger>` inside `<Dialog.Root>`, as shown in the example at the top of this page.

However, if defining the dialog's content next to its trigger is not practical, you can use a detached trigger.
This involves placing the `<Dialog.Trigger>` outside of `<Dialog.Root>` and linking them with a `handle` created by the `Dialog.createHandle()` function.

The imperative methods on the handle, such as `open()` and `openWithPayload()`, require a `<Dialog.Root>` using the same handle to be mounted.
Calls made while no root is attached to the handle — before one mounts, or after it unmounts — are ignored. Each time a root mounts, it starts from fresh state: a call made while no root was attached is not replayed, and no open state carries over from a previous mount.

```tsx
const demoDialog = Dialog.createHandle();



<Dialog.Trigger handle={demoDialog}>Open</Dialog.Trigger> 



<Dialog.Root handle={demoDialog}>
  ...
</Dialog.Root>
```

[Open mounted Solid demo: dialog/detached-triggers-simple](/solid/components/dialog)

<a id="multiple-triggers"></a>

### Multiple triggers

A single dialog can be opened by multiple trigger elements.
You can achieve this by using the same `handle` for several detached triggers, or by placing multiple `<Dialog.Trigger>` components inside a single `<Dialog.Root>`.

```tsx
<Dialog.Root>
  <Dialog.Trigger>Trigger 1</Dialog.Trigger>
  <Dialog.Trigger>Trigger 2</Dialog.Trigger>
  ...
</Dialog.Root>;
```

```tsx
const demoDialog = Dialog.createHandle();

<Dialog.Trigger handle={demoDialog}>Trigger 1</Dialog.Trigger>
<Dialog.Trigger handle={demoDialog}>Trigger 2</Dialog.Trigger>
<Dialog.Root handle={demoDialog}>
  ...
</Dialog.Root>
```

The dialog can render different content depending on which trigger opened it.
This is achieved by passing a `payload` to the `<Dialog.Trigger>` and using the function-as-a-child pattern in `<Dialog.Root>`.

The payload can be strongly typed by providing a type argument to the `createHandle()` function:

```tsx

const demoDialog = Dialog.createHandle<{ text: string }>();



<Dialog.Trigger handle={demoDialog} payload={{ text: 'Trigger 1' }}>
  Trigger 1
</Dialog.Trigger>



<Dialog.Trigger handle={demoDialog} payload={{ text: 'Trigger 2' }}>
  Trigger 2
</Dialog.Trigger>

<Dialog.Root handle={demoDialog}>
  {({ payload }) => ( 
    <Dialog.Portal>
      <Dialog.Popup>
        <Dialog.Title>Dialog</Dialog.Title>
        {payload !== undefined && ( 
          <Dialog.Description>
            This has been opened by {payload.text} 
          </Dialog.Description>
        )}
      </Dialog.Popup>
    </Dialog.Portal>
  )}
</Dialog.Root>
```

<a id="controlled-mode-with-multiple-triggers"></a>

### Controlled mode with multiple triggers

You can control the dialog's open state externally using the `open` and `onOpenChange` props on `<Dialog.Root>`.
This allows you to manage the dialog's visibility based on your application's state.
When using multiple triggers, you have to manage which trigger is active with the `triggerId` prop on `<Dialog.Root>` and the `id` prop on each `<Dialog.Trigger>`.

Note that there is no separate `onTriggerIdChange` prop.
Instead, the `onOpenChange` callback receives an additional argument, `eventDetails`, which contains the trigger element that initiated the state change.

[Open mounted Solid demo: dialog/detached-triggers-controlled](/solid/components/dialog)

<a id="api-reference"></a>

## API reference

<a id="root"></a>

### Root

<a id="api-4469616c6f672e526f6f74"></a>

<a id="dialogroot"></a>

### Dialog.Root

Declaration: `packages/solid/build/types/dialog/root/DialogRoot.d.ts:4`

#### Declaration

```typescript
<Payload = unknown>(props: DialogRootProps<Payload>) => JSX.Element
```

<a id="api-4469616c6f672e526f6f742e2470726f70732e64656661756c744f70656e"></a>

<a id="DialogRoot-defaultOpen"></a>

<a id="api-4469616c6f672e526f6f742e2470726f70732e6f70656e"></a>

<a id="DialogRoot-open"></a>

<a id="api-4469616c6f672e526f6f742e2470726f70732e6f6e4f70656e4368616e6765"></a>

<a id="DialogRoot-onOpenChange"></a>

<a id="api-4469616c6f672e526f6f742e2470726f70732e616374696f6e73526566"></a>

<a id="DialogRoot-actionsRef"></a>

<a id="api-4469616c6f672e526f6f742e2470726f70732e64656661756c74547269676765724964"></a>

<a id="DialogRoot-defaultTriggerId"></a>

<a id="api-4469616c6f672e526f6f742e2470726f70732e64697361626c65506f696e7465724469736d697373616c"></a>

<a id="DialogRoot-disablePointerDismissal"></a>

<a id="api-4469616c6f672e526f6f742e2470726f70732e68616e646c65"></a>

<a id="DialogRoot-handle"></a>

<a id="api-4469616c6f672e526f6f742e2470726f70732e6d6f64616c"></a>

<a id="DialogRoot-modal"></a>

<a id="api-4469616c6f672e526f6f742e2470726f70732e6f6e4f70656e4368616e6765436f6d706c657465"></a>

<a id="DialogRoot-onOpenChangeComplete"></a>

<a id="api-4469616c6f672e526f6f742e2470726f70732e747269676765724964"></a>

<a id="DialogRoot-triggerId"></a>

<a id="api-4469616c6f672e526f6f742e2470726f70732e6368696c6472656e"></a>

<a id="DialogRoot-children"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| defaultOpen | `boolean \| undefined` | No | Unavailable | Initial open state for this root’s uncontrolled lifetime. |
| open | `boolean \| undefined` | No | Unavailable | Controlled open state. Defaults seed only this root's uncontrolled lifetime. |
| onOpenChange | `((open: boolean, details: DialogRootChangeEventDetails) => void) \| undefined` | No | Unavailable | Called with the requested open state and native change details. Use details.cancel() to cancel the change. |
| actionsRef | `{ current: DialogRootActions \| null; } \| ((actions: DialogRootActions \| null) => void) \| undefined` | No | Unavailable | Retention is requested by details.preventUnmountOnClose(), not by providing actionsRef. |
| defaultTriggerId | `string \| null \| undefined` | No | Unavailable | Initial active trigger ID for uncontrolled trigger selection. |
| disablePointerDismissal | `boolean \| undefined` | No | Unavailable | Also suppresses nonmodal focus-out dismissal; Escape and explicit close remain available. |
| handle | `DialogHandle<Payload> \| undefined` | No | Unavailable | A root owns its model; swapping this handle never resets that model. |
| modal | `boolean \| "trap-focus" \| undefined` | No | Unavailable | true: trap focus and lock scroll/pointers; false: nonmodal; trap-focus: focus only. |
| onOpenChangeComplete | `((open: boolean) => void) \| undefined` | No | Unavailable | Called with the open state when the opening or closing transition completes. |
| triggerId | `string \| null \| undefined` | No | Unavailable | Controlled ID of the active trigger. |
| children | `JSX.Element \| ((context: { readonly payload: Payload \| undefined; }) => JSX.Element)` | No | Unavailable | Read context.payload live in JSX; it follows the active trigger without recreating the subtree. |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4469616c6f672e526f6f742e50726f7073"></a>

<a id="dialogrootprops"></a>

### Related exported type: Dialog.Root.Props

Declaration: `packages/solid/build/types/dialog/root/DialogRoot.d.ts:39`

#### Declaration

```typescript
Props<Payload>
```

<a id="api-4469616c6f672e526f6f742e50726f70732e64656661756c744f70656e"></a>

<a id="DialogRootProps-defaultOpen"></a>

<a id="api-4469616c6f672e526f6f742e50726f70732e6f70656e"></a>

<a id="DialogRootProps-open"></a>

<a id="api-4469616c6f672e526f6f742e50726f70732e6f6e4f70656e4368616e6765"></a>

<a id="DialogRootProps-onOpenChange"></a>

<a id="api-4469616c6f672e526f6f742e50726f70732e616374696f6e73526566"></a>

<a id="DialogRootProps-actionsRef"></a>

<a id="api-4469616c6f672e526f6f742e50726f70732e64656661756c74547269676765724964"></a>

<a id="DialogRootProps-defaultTriggerId"></a>

<a id="api-4469616c6f672e526f6f742e50726f70732e64697361626c65506f696e7465724469736d697373616c"></a>

<a id="DialogRootProps-disablePointerDismissal"></a>

<a id="api-4469616c6f672e526f6f742e50726f70732e68616e646c65"></a>

<a id="DialogRootProps-handle"></a>

<a id="api-4469616c6f672e526f6f742e50726f70732e6d6f64616c"></a>

<a id="DialogRootProps-modal"></a>

<a id="api-4469616c6f672e526f6f742e50726f70732e6f6e4f70656e4368616e6765436f6d706c657465"></a>

<a id="DialogRootProps-onOpenChangeComplete"></a>

<a id="api-4469616c6f672e526f6f742e50726f70732e747269676765724964"></a>

<a id="DialogRootProps-triggerId"></a>

<a id="api-4469616c6f672e526f6f742e50726f70732e6368696c6472656e"></a>

<a id="DialogRootProps-children"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| defaultOpen | `boolean \| undefined` | No | Unavailable | Initial open state for this root’s uncontrolled lifetime. |
| open | `boolean \| undefined` | No | Unavailable | Controlled open state. Defaults seed only this root's uncontrolled lifetime. |
| onOpenChange | `((open: boolean, details: DialogRootChangeEventDetails) => void) \| undefined` | No | Unavailable | Called with the requested open state and native change details. Use details.cancel() to cancel the change. |
| actionsRef | `{ current: DialogRootActions \| null; } \| ((actions: DialogRootActions \| null) => void) \| undefined` | No | Unavailable | Retention is requested by details.preventUnmountOnClose(), not by providing actionsRef. |
| defaultTriggerId | `string \| null \| undefined` | No | Unavailable | Initial active trigger ID for uncontrolled trigger selection. |
| disablePointerDismissal | `boolean \| undefined` | No | Unavailable | Also suppresses nonmodal focus-out dismissal; Escape and explicit close remain available. |
| handle | `DialogHandle<Payload> \| undefined` | No | Unavailable | A root owns its model; swapping this handle never resets that model. |
| modal | `boolean \| "trap-focus" \| undefined` | No | Unavailable | true: trap focus and lock scroll/pointers; false: nonmodal; trap-focus: focus only. |
| onOpenChangeComplete | `((open: boolean) => void) \| undefined` | No | Unavailable | Called with the open state when the opening or closing transition completes. |
| triggerId | `string \| null \| undefined` | No | Unavailable | Controlled ID of the active trigger. |
| children | `JSX.Element \| ((context: { readonly payload: Payload \| undefined; }) => JSX.Element)` | No | Unavailable | Read context.payload live in JSX; it follows the active trigger without recreating the subtree. |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4469616c6f672e526f6f742e5374617465"></a>

<a id="dialogrootstate"></a>

### Related exported type: Dialog.Root.State

Declaration: `packages/solid/build/types/dialog/root/DialogRoot.d.ts:40`

#### Declaration

```typescript
DialogRootState
```

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4469616c6f672e526f6f742e416374696f6e73"></a>

<a id="dialogrootactions"></a>

### Related exported type: Dialog.Root.Actions

Declaration: `packages/solid/build/types/dialog/root/DialogRoot.d.ts:41`

#### Declaration

```typescript
DialogRootActions
```

<a id="api-4469616c6f672e526f6f742e416374696f6e732e636c6f7365"></a>

<a id="DialogRootActions-close"></a>

<a id="api-4469616c6f672e526f6f742e416374696f6e732e756e6d6f756e74"></a>

<a id="DialogRootActions-unmount"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| close | `() => void` | Yes | Unavailable |  |
| unmount | `() => void` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4469616c6f672e526f6f742e4368616e67654576656e74526561736f6e"></a>

<a id="dialogrootchangeeventreason"></a>

### Related exported type: Dialog.Root.ChangeEventReason

Declaration: `packages/solid/build/types/dialog/root/DialogRoot.d.ts:42`

#### Declaration

```typescript
DialogRootChangeEventReason
```

Inherited DOM attributes: `__@iterator@106`, `anchor`, `at`, `big`, `blink`, `bold`, `charAt`, `charCodeAt`, `codePointAt`, `concat`, `endsWith`, `fixed`, `fontcolor`, `fontsize`, `includes`, `indexOf`, `isWellFormed`, `italics`, `lastIndexOf`, `length`, `link`, `localeCompare`, `match`, `matchAll`, `normalize`, `padEnd`, `padStart`, `repeat`, `replace`, `replaceAll`, `search`, `slice`, `small`, `split`, `startsWith`, `strike`, `sub`, `substr`, `substring`, `sup`, `toLocaleLowerCase`, `toLocaleUpperCase`, `toLowerCase`, `toString`, `toUpperCase`, `toWellFormed`, `trim`, `trimEnd`, `trimLeft`, `trimRight`, `trimStart`, `valueOf`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4469616c6f672e526f6f742e4368616e67654576656e7444657461696c73"></a>

<a id="dialogrootchangeeventdetails"></a>

### Related exported type: Dialog.Root.ChangeEventDetails

Declaration: `packages/solid/build/types/dialog/root/DialogRoot.d.ts:43`

#### Declaration

```typescript
DialogRootChangeEventDetails
```

<a id="api-4469616c6f672e526f6f742e4368616e67654576656e7444657461696c732e616c6c6f7750726f7061676174696f6e"></a>

<a id="DialogRootChangeEventDetails-allowPropagation"></a>

<a id="api-4469616c6f672e526f6f742e4368616e67654576656e7444657461696c732e63616e63656c"></a>

<a id="DialogRootChangeEventDetails-cancel"></a>

<a id="api-4469616c6f672e526f6f742e4368616e67654576656e7444657461696c732e6576656e74"></a>

<a id="DialogRootChangeEventDetails-event"></a>

<a id="api-4469616c6f672e526f6f742e4368616e67654576656e7444657461696c732e697343616e63656c6564"></a>

<a id="DialogRootChangeEventDetails-isCanceled"></a>

<a id="api-4469616c6f672e526f6f742e4368616e67654576656e7444657461696c732e697350726f7061676174696f6e416c6c6f776564"></a>

<a id="DialogRootChangeEventDetails-isPropagationAllowed"></a>

<a id="api-4469616c6f672e526f6f742e4368616e67654576656e7444657461696c732e70726576656e74556e6d6f756e744f6e436c6f7365"></a>

<a id="DialogRootChangeEventDetails-preventUnmountOnClose"></a>

<a id="api-4469616c6f672e526f6f742e4368616e67654576656e7444657461696c732e726561736f6e"></a>

<a id="DialogRootChangeEventDetails-reason"></a>

<a id="api-4469616c6f672e526f6f742e4368616e67654576656e7444657461696c732e74726967676572"></a>

<a id="DialogRootChangeEventDetails-trigger"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| allowPropagation | `() => void` | Yes | Unavailable | Marks this change transaction as allowing propagation. |
| cancel | `() => void` | Yes | Unavailable | Cancels the Base UI change transaction; separate from the DOM event’s preventDefault() and preventBaseUIHandler(). |
| event | `PointerEvent \| MouseEvent \| Event \| FocusEvent \| KeyboardEvent \| TouchEvent` | Yes | Unavailable | Native DOM event associated with the change. Programmatic changes can use a Base UI-created Event. |
| isCanceled | `boolean` | Yes | Unavailable | Whether cancel() has been called for this change transaction. |
| isPropagationAllowed | `boolean` | Yes | Unavailable | Whether allowPropagation() has been called for this change transaction. |
| preventUnmountOnClose | `() => void` | Yes | Unavailable |  |
| reason | `"none" \| "trigger-press" \| "outside-press" \| "close-press" \| "focus-out" \| "escape-key" \| "imperative-action"` | Yes | Unavailable | Reason for the requested change; it discriminates the native event type. |
| trigger | `Element \| undefined` | Yes | Unavailable | Trigger element associated with this change, when available. |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="trigger"></a>

### Trigger

<a id="api-4469616c6f672e54726967676572"></a>

<a id="dialogtrigger"></a>

<a id="api-4469616c6f672e547269676765722e2470726f70732e70726f703a64697361626c6564"></a>

<a id="api-4469616c6f672e547269676765722e2470726f70732e70726f703a666f726d416374696f6e"></a>

<a id="api-4469616c6f672e547269676765722e2470726f70732e70726f703a666f726d456e6374797065"></a>

<a id="api-4469616c6f672e547269676765722e2470726f70732e70726f703a666f726d4d6574686f64"></a>

<a id="api-4469616c6f672e547269676765722e2470726f70732e70726f703a666f726d4e6f56616c6964617465"></a>

<a id="api-4469616c6f672e547269676765722e2470726f70732e70726f703a666f726d546172676574"></a>

<a id="api-4469616c6f672e547269676765722e2470726f70732e70726f703a6e616d65"></a>

<a id="api-4469616c6f672e547269676765722e2470726f70732e70726f703a706f706f766572546172676574416374696f6e"></a>

<a id="api-4469616c6f672e547269676765722e2470726f70732e70726f703a706f706f766572546172676574456c656d656e74"></a>

<a id="api-4469616c6f672e547269676765722e2470726f70732e70726f703a74797065"></a>

<a id="api-4469616c6f672e547269676765722e2470726f70732e70726f703a76616c7565"></a>

### Dialog.Trigger

Declaration: `packages/solid/build/types/dialog/trigger/DialogTrigger.d.ts:3`

#### Declaration

```typescript
<Payload = unknown>(props: DialogTriggerProps<Payload>) => JSX.Element
```

<a id="api-4469616c6f672e547269676765722e2470726f70732e68616e646c65"></a>

<a id="DialogTrigger-handle"></a>

<a id="api-4469616c6f672e547269676765722e2470726f70732e6e6174697665427574746f6e"></a>

<a id="DialogTrigger-nativeButton"></a>

<a id="api-4469616c6f672e547269676765722e2470726f70732e7061796c6f6164"></a>

<a id="DialogTrigger-payload"></a>

<a id="api-4469616c6f672e547269676765722e2470726f70732e64697361626c6564"></a>

<a id="DialogTrigger-disabled"></a>

<a id="api-4469616c6f672e547269676765722e2470726f70732e6964"></a>

<a id="DialogTrigger-id"></a>

<a id="api-4469616c6f672e547269676765722e2470726f70732e636c617373"></a>

<a id="DialogTrigger-class"></a>

<a id="api-4469616c6f672e547269676765722e2470726f70732e7374796c65"></a>

<a id="DialogTrigger-style"></a>

<a id="api-4469616c6f672e547269676765722e2470726f70732e72656e646572"></a>

<a id="DialogTrigger-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| handle | `DialogHandle<Payload> \| undefined` | No | Unavailable | Connects a trigger to the handle’s root, including when the trigger is outside that root’s subtree. |
| nativeButton | `boolean \| undefined` | No | true | Whether the rendered host is a native button. Set false when the render callback supplies a non-button host. |
| payload | `NoInfer<Payload> \| undefined` | No | Unavailable | Payload registered with this trigger and exposed by the root when this trigger is active. |
| disabled | `boolean \| undefined` | No | false | Whether the trigger ignores user interaction. |
| id | `string \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<DialogTriggerState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<DialogTriggerState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, DialogTriggerState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `command`, `commandfor`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `form`, `formaction`, `formenctype`, `formmethod`, `formnovalidate`, `formtarget`, `hidden`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `name`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `popovertarget`, `popovertargetaction`, `prefix`, `prop:disabled`, `prop:formAction`, `prop:formEnctype`, `prop:formMethod`, `prop:formNoValidate`, `prop:formTarget`, `prop:name`, `prop:popoverTargetAction`, `prop:popoverTargetElement`, `prop:type`, `prop:value`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `type`, `typeof`, `value`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-4469616c6f675472696767657244617461417474726962757465732e706f7075704f70656e"></a>

<a id="api-4469616c6f675472696767657244617461417474726962757465732e64697361626c6564"></a>

| Name | Description |
| --- | --- |
| data-popup-open | Present when open is true. |
| data-disabled | Present when this trigger is disabled. |

#### CSS variables

Metadata status: unavailable.

<a id="api-4469616c6f672e547269676765722e50726f7073"></a>

<a id="dialogtriggerprops"></a>

<a id="api-4469616c6f672e547269676765722e50726f70732e70726f703a64697361626c6564"></a>

<a id="api-4469616c6f672e547269676765722e50726f70732e70726f703a666f726d416374696f6e"></a>

<a id="api-4469616c6f672e547269676765722e50726f70732e70726f703a666f726d456e6374797065"></a>

<a id="api-4469616c6f672e547269676765722e50726f70732e70726f703a666f726d4d6574686f64"></a>

<a id="api-4469616c6f672e547269676765722e50726f70732e70726f703a666f726d4e6f56616c6964617465"></a>

<a id="api-4469616c6f672e547269676765722e50726f70732e70726f703a666f726d546172676574"></a>

<a id="api-4469616c6f672e547269676765722e50726f70732e70726f703a6e616d65"></a>

<a id="api-4469616c6f672e547269676765722e50726f70732e70726f703a706f706f766572546172676574416374696f6e"></a>

<a id="api-4469616c6f672e547269676765722e50726f70732e70726f703a706f706f766572546172676574456c656d656e74"></a>

<a id="api-4469616c6f672e547269676765722e50726f70732e70726f703a74797065"></a>

<a id="api-4469616c6f672e547269676765722e50726f70732e70726f703a76616c7565"></a>

### Related exported type: Dialog.Trigger.Props

Declaration: `packages/solid/build/types/dialog/trigger/DialogTrigger.d.ts:16`

#### Declaration

```typescript
Props<Payload>
```

<a id="api-4469616c6f672e547269676765722e50726f70732e68616e646c65"></a>

<a id="DialogTriggerProps-handle"></a>

<a id="api-4469616c6f672e547269676765722e50726f70732e6e6174697665427574746f6e"></a>

<a id="DialogTriggerProps-nativeButton"></a>

<a id="api-4469616c6f672e547269676765722e50726f70732e7061796c6f6164"></a>

<a id="DialogTriggerProps-payload"></a>

<a id="api-4469616c6f672e547269676765722e50726f70732e64697361626c6564"></a>

<a id="DialogTriggerProps-disabled"></a>

<a id="api-4469616c6f672e547269676765722e50726f70732e6964"></a>

<a id="DialogTriggerProps-id"></a>

<a id="api-4469616c6f672e547269676765722e50726f70732e636c617373"></a>

<a id="DialogTriggerProps-class"></a>

<a id="api-4469616c6f672e547269676765722e50726f70732e7374796c65"></a>

<a id="DialogTriggerProps-style"></a>

<a id="api-4469616c6f672e547269676765722e50726f70732e72656e646572"></a>

<a id="DialogTriggerProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| handle | `DialogHandle<Payload> \| undefined` | No | Unavailable | Connects a trigger to the handle’s root, including when the trigger is outside that root’s subtree. |
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

<a id="api-4469616c6f672e547269676765722e5374617465"></a>

<a id="dialogtriggerstate"></a>

### Related exported type: Dialog.Trigger.State

Declaration: `packages/solid/build/types/dialog/trigger/DialogTrigger.d.ts:17`

#### Declaration

```typescript
DialogTriggerState
```

<a id="api-4469616c6f672e547269676765722e53746174652e6f70656e"></a>

<a id="DialogTriggerState-open"></a>

<a id="api-4469616c6f672e547269676765722e53746174652e64697361626c6564"></a>

<a id="DialogTriggerState-disabled"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| open | `boolean` | Yes | Unavailable |  |
| disabled | `boolean` | Yes | Unavailable | Whether the trigger ignores user interaction. |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="portal"></a>

### Portal

<a id="api-4469616c6f672e506f7274616c"></a>

<a id="dialogportal"></a>

<a id="api-4469616c6f672e506f7274616c2e2470726f70732e70726f703a616c69676e"></a>

### Dialog.Portal

Declaration: `packages/solid/build/types/dialog/portal/DialogPortal.d.ts:2`

#### Declaration

```typescript
(props: DialogPortalProps) => JSX.Element
```

<a id="api-4469616c6f672e506f7274616c2e2470726f70732e636f6e7461696e6572"></a>

<a id="DialogPortal-container"></a>

<a id="api-4469616c6f672e506f7274616c2e2470726f70732e6964"></a>

<a id="DialogPortal-id"></a>

<a id="api-4469616c6f672e506f7274616c2e2470726f70732e636c617373"></a>

<a id="DialogPortal-class"></a>

<a id="api-4469616c6f672e506f7274616c2e2470726f70732e7374796c65"></a>

<a id="DialogPortal-style"></a>

<a id="api-4469616c6f672e506f7274616c2e2470726f70732e6b6565704d6f756e746564"></a>

<a id="DialogPortal-keepMounted"></a>

<a id="api-4469616c6f672e506f7274616c2e2470726f70732e72656e646572"></a>

<a id="DialogPortal-render"></a>

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

<a id="api-4469616c6f672e506f7274616c2e50726f7073"></a>

<a id="dialogportalprops"></a>

<a id="api-4469616c6f672e506f7274616c2e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Dialog.Portal.Props

Declaration: `packages/solid/build/types/dialog/portal/DialogPortal.d.ts:11`

#### Declaration

```typescript
DialogPortalProps
```

<a id="api-4469616c6f672e506f7274616c2e50726f70732e636f6e7461696e6572"></a>

<a id="DialogPortalProps-container"></a>

<a id="api-4469616c6f672e506f7274616c2e50726f70732e6964"></a>

<a id="DialogPortalProps-id"></a>

<a id="api-4469616c6f672e506f7274616c2e50726f70732e636c617373"></a>

<a id="DialogPortalProps-class"></a>

<a id="api-4469616c6f672e506f7274616c2e50726f70732e7374796c65"></a>

<a id="DialogPortalProps-style"></a>

<a id="api-4469616c6f672e506f7274616c2e50726f70732e6b6565704d6f756e746564"></a>

<a id="DialogPortalProps-keepMounted"></a>

<a id="api-4469616c6f672e506f7274616c2e50726f70732e72656e646572"></a>

<a id="DialogPortalProps-render"></a>

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

<a id="api-4469616c6f672e506f7274616c2e5374617465"></a>

<a id="dialogportalstate"></a>

### Related exported type: Dialog.Portal.State

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

<a id="api-4469616c6f672e4261636b64726f70"></a>

<a id="dialogbackdrop"></a>

<a id="api-4469616c6f672e4261636b64726f702e2470726f70732e70726f703a616c69676e"></a>

### Dialog.Backdrop

Declaration: `packages/solid/build/types/dialog/backdrop/DialogBackdrop.d.ts:2`

#### Declaration

```typescript
(props: DialogBackdropProps) => JSX.Element
```

<a id="api-4469616c6f672e4261636b64726f702e2470726f70732e666f72636552656e646572"></a>

<a id="DialogBackdrop-forceRender"></a>

<a id="api-4469616c6f672e4261636b64726f702e2470726f70732e636c617373"></a>

<a id="DialogBackdrop-class"></a>

<a id="api-4469616c6f672e4261636b64726f702e2470726f70732e7374796c65"></a>

<a id="DialogBackdrop-style"></a>

<a id="api-4469616c6f672e4261636b64726f702e2470726f70732e72656e646572"></a>

<a id="DialogBackdrop-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| forceRender | `boolean \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<AlertDialogBackdropState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AlertDialogBackdropState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, AlertDialogBackdropState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-4469616c6f674261636b64726f7044617461417474726962757465732e6f70656e"></a>

<a id="api-4469616c6f674261636b64726f7044617461417474726962757465732e636c6f736564"></a>

<a id="api-4469616c6f672e4261636b64726f702e64617461417474726962757465732e646174612d616e63686f722d68696464656e"></a>

<a id="api-4469616c6f674261636b64726f7044617461417474726962757465732e7374617274696e675374796c65"></a>

<a id="api-4469616c6f674261636b64726f7044617461417474726962757465732e656e64696e675374796c65"></a>

| Name | Description |
| --- | --- |
| data-open | Present when open is true. |
| data-closed | Present when open is false. |
| data-anchor-hidden | Present when anchorHidden is true. |
| data-starting-style | Present when transitionStatus is 'starting'. |
| data-ending-style | Present when transitionStatus is 'ending'. |

#### CSS variables

Metadata status: unavailable.

<a id="api-4469616c6f672e4261636b64726f702e50726f7073"></a>

<a id="dialogbackdropprops"></a>

<a id="api-4469616c6f672e4261636b64726f702e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Dialog.Backdrop.Props

Declaration: `packages/solid/build/types/dialog/backdrop/DialogBackdrop.d.ts:11`

#### Declaration

```typescript
DialogBackdropProps
```

<a id="api-4469616c6f672e4261636b64726f702e50726f70732e666f72636552656e646572"></a>

<a id="DialogBackdropProps-forceRender"></a>

<a id="api-4469616c6f672e4261636b64726f702e50726f70732e636c617373"></a>

<a id="DialogBackdropProps-class"></a>

<a id="api-4469616c6f672e4261636b64726f702e50726f70732e7374796c65"></a>

<a id="DialogBackdropProps-style"></a>

<a id="api-4469616c6f672e4261636b64726f702e50726f70732e72656e646572"></a>

<a id="DialogBackdropProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| forceRender | `boolean \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<AlertDialogBackdropState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AlertDialogBackdropState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, AlertDialogBackdropState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4469616c6f672e4261636b64726f702e5374617465"></a>

<a id="dialogbackdropstate"></a>

### Related exported type: Dialog.Backdrop.State

Declaration: `packages/solid/build/types/dialog/backdrop/DialogBackdrop.d.ts:12`

#### Declaration

```typescript
DialogBackdropState
```

<a id="api-4469616c6f672e4261636b64726f702e53746174652e6f70656e"></a>

<a id="DialogBackdropState-open"></a>

<a id="api-4469616c6f672e4261636b64726f702e53746174652e7472616e736974696f6e537461747573"></a>

<a id="DialogBackdropState-transitionStatus"></a>

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

<a id="api-4469616c6f672e56696577706f7274"></a>

<a id="dialogviewport"></a>

<a id="api-4469616c6f672e56696577706f72742e2470726f70732e70726f703a616c69676e"></a>

### Dialog.Viewport

Declaration: `packages/solid/build/types/dialog/viewport/DialogViewport.d.ts:3`

#### Declaration

```typescript
(props: DialogViewportProps) => JSX.Element
```

<a id="api-4469616c6f672e56696577706f72742e2470726f70732e636c617373"></a>

<a id="DialogViewport-class"></a>

<a id="api-4469616c6f672e56696577706f72742e2470726f70732e7374796c65"></a>

<a id="DialogViewport-style"></a>

<a id="api-4469616c6f672e56696577706f72742e2470726f70732e72656e646572"></a>

<a id="DialogViewport-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<AlertDialogViewportState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AlertDialogViewportState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, AlertDialogViewportState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-4469616c6f6756696577706f727444617461417474726962757465732e6f70656e"></a>

<a id="api-4469616c6f6756696577706f727444617461417474726962757465732e636c6f736564"></a>

<a id="api-4469616c6f672e56696577706f72742e64617461417474726962757465732e646174612d616e63686f722d68696464656e"></a>

<a id="api-4469616c6f6756696577706f727444617461417474726962757465732e6e6573746564"></a>

<a id="api-4469616c6f6756696577706f727444617461417474726962757465732e6e65737465644469616c6f674f70656e"></a>

<a id="api-4469616c6f6756696577706f727444617461417474726962757465732e7374617274696e675374796c65"></a>

<a id="api-4469616c6f6756696577706f727444617461417474726962757465732e656e64696e675374796c65"></a>

| Name | Description |
| --- | --- |
| data-open | Present when open is true. |
| data-closed | Present when open is false. |
| data-anchor-hidden | Present when anchorHidden is true. |
| data-nested |  |
| data-nested-dialog-open | Present when nestedDialogOpen is true. |
| data-starting-style | Present when transitionStatus is 'starting'. |
| data-ending-style | Present when transitionStatus is 'ending'. |

#### CSS variables

Metadata status: unavailable.

<a id="api-4469616c6f672e56696577706f72742e50726f7073"></a>

<a id="dialogviewportprops"></a>

<a id="api-4469616c6f672e56696577706f72742e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Dialog.Viewport.Props

Declaration: `packages/solid/build/types/dialog/viewport/DialogViewport.d.ts:9`

#### Declaration

```typescript
DialogViewportProps
```

<a id="api-4469616c6f672e56696577706f72742e50726f70732e636c617373"></a>

<a id="DialogViewportProps-class"></a>

<a id="api-4469616c6f672e56696577706f72742e50726f70732e7374796c65"></a>

<a id="DialogViewportProps-style"></a>

<a id="api-4469616c6f672e56696577706f72742e50726f70732e72656e646572"></a>

<a id="DialogViewportProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<AlertDialogViewportState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AlertDialogViewportState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, AlertDialogViewportState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4469616c6f672e56696577706f72742e5374617465"></a>

<a id="dialogviewportstate"></a>

### Related exported type: Dialog.Viewport.State

Declaration: `packages/solid/build/types/dialog/viewport/DialogViewport.d.ts:10`

#### Declaration

```typescript
DialogViewportState
```

<a id="api-4469616c6f672e56696577706f72742e53746174652e6f70656e"></a>

<a id="DialogViewportState-open"></a>

<a id="api-4469616c6f672e56696577706f72742e53746174652e6e6573746564"></a>

<a id="DialogViewportState-nested"></a>

<a id="api-4469616c6f672e56696577706f72742e53746174652e6e65737465644469616c6f674f70656e"></a>

<a id="DialogViewportState-nestedDialogOpen"></a>

<a id="api-4469616c6f672e56696577706f72742e53746174652e7472616e736974696f6e537461747573"></a>

<a id="DialogViewportState-transitionStatus"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| open | `boolean` | Yes | Unavailable | Whether this dialog is open. |
| nested | `boolean` | Yes | Unavailable | Whether this dialog is nested inside another dialog. |
| nestedDialogOpen | `boolean` | Yes | Unavailable | Whether at least one nested dialog is open. |
| transitionStatus | `TransitionStatus` | Yes | Unavailable | Current transition phase: starting, ending, idle, or unavailable, as declared. |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="popup"></a>

### Popup

<a id="api-4469616c6f672e506f707570"></a>

<a id="dialogpopup"></a>

<a id="api-4469616c6f672e506f7075702e2470726f70732e70726f703a616c69676e"></a>

### Dialog.Popup

Declaration: `packages/solid/build/types/dialog/popup/DialogPopup.d.ts:10`

#### Declaration

```typescript
(props: DialogPopupProps) => JSX.Element
```

<a id="api-4469616c6f672e506f7075702e2470726f70732e696e697469616c466f637573"></a>

<a id="DialogPopup-initialFocus"></a>

<a id="api-4469616c6f672e506f7075702e2470726f70732e66696e616c466f637573"></a>

<a id="DialogPopup-finalFocus"></a>

<a id="api-4469616c6f672e506f7075702e2470726f70732e6964"></a>

<a id="DialogPopup-id"></a>

<a id="api-4469616c6f672e506f7075702e2470726f70732e636c617373"></a>

<a id="DialogPopup-class"></a>

<a id="api-4469616c6f672e506f7075702e2470726f70732e7374796c65"></a>

<a id="DialogPopup-style"></a>

<a id="api-4469616c6f672e506f7075702e2470726f70732e72656e646572"></a>

<a id="DialogPopup-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| initialFocus | `DialogFocusTarget \| undefined` | No | Unavailable |  |
| finalFocus | `DialogFocusTarget \| undefined` | No | Unavailable |  |
| id | `string \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<AlertDialogPopupState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AlertDialogPopupState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, AlertDialogPopupState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-4469616c6f67506f70757044617461417474726962757465732e6f70656e"></a>

<a id="api-4469616c6f67506f70757044617461417474726962757465732e636c6f736564"></a>

<a id="api-4469616c6f672e506f7075702e64617461417474726962757465732e646174612d616e63686f722d68696464656e"></a>

<a id="api-4469616c6f67506f70757044617461417474726962757465732e6e6573746564"></a>

<a id="api-4469616c6f67506f70757044617461417474726962757465732e6e65737465644469616c6f674f70656e"></a>

<a id="api-4469616c6f67506f70757044617461417474726962757465732e7374617274696e675374796c65"></a>

<a id="api-4469616c6f67506f70757044617461417474726962757465732e656e64696e675374796c65"></a>

| Name | Description |
| --- | --- |
| data-open | Present when open is true. |
| data-closed | Present when open is false. |
| data-anchor-hidden | Present when anchorHidden is true. |
| data-nested | Present when this dialog is nested inside another dialog. |
| data-nested-dialog-open | Present when nestedDialogOpen is true. |
| data-starting-style | Present when transitionStatus is 'starting'. |
| data-ending-style | Present when transitionStatus is 'ending'. |

#### CSS variables

<a id="api-4469616c6f67506f7075704373735661726961626c65732e6e65737465644469616c6f6773"></a>

| Name | Description |
| --- | --- |
| --nested-dialogs |  |

<a id="api-4469616c6f672e506f7075702e50726f7073"></a>

<a id="dialogpopupprops"></a>

<a id="api-4469616c6f672e506f7075702e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Dialog.Popup.Props

Declaration: `packages/solid/build/types/dialog/popup/DialogPopup.d.ts:23`

#### Declaration

```typescript
DialogPopupProps
```

<a id="api-4469616c6f672e506f7075702e50726f70732e696e697469616c466f637573"></a>

<a id="DialogPopupProps-initialFocus"></a>

<a id="api-4469616c6f672e506f7075702e50726f70732e66696e616c466f637573"></a>

<a id="DialogPopupProps-finalFocus"></a>

<a id="api-4469616c6f672e506f7075702e50726f70732e6964"></a>

<a id="DialogPopupProps-id"></a>

<a id="api-4469616c6f672e506f7075702e50726f70732e636c617373"></a>

<a id="DialogPopupProps-class"></a>

<a id="api-4469616c6f672e506f7075702e50726f70732e7374796c65"></a>

<a id="DialogPopupProps-style"></a>

<a id="api-4469616c6f672e506f7075702e50726f70732e72656e646572"></a>

<a id="DialogPopupProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| initialFocus | `DialogFocusTarget \| undefined` | No | Unavailable |  |
| finalFocus | `DialogFocusTarget \| undefined` | No | Unavailable |  |
| id | `string \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<AlertDialogPopupState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AlertDialogPopupState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, AlertDialogPopupState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4469616c6f672e506f7075702e5374617465"></a>

<a id="dialogpopupstate"></a>

### Related exported type: Dialog.Popup.State

Declaration: `packages/solid/build/types/dialog/popup/DialogPopup.d.ts:24`

#### Declaration

```typescript
DialogPopupState
```

<a id="api-4469616c6f672e506f7075702e53746174652e6f70656e"></a>

<a id="DialogPopupState-open"></a>

<a id="api-4469616c6f672e506f7075702e53746174652e6e6573746564"></a>

<a id="DialogPopupState-nested"></a>

<a id="api-4469616c6f672e506f7075702e53746174652e6e65737465644469616c6f674f70656e"></a>

<a id="DialogPopupState-nestedDialogOpen"></a>

<a id="api-4469616c6f672e506f7075702e53746174652e7472616e736974696f6e537461747573"></a>

<a id="DialogPopupState-transitionStatus"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| open | `boolean` | Yes | Unavailable | Whether this dialog is open. |
| nested | `boolean` | Yes | Unavailable | Whether this dialog is nested inside another dialog. |
| nestedDialogOpen | `boolean` | Yes | Unavailable | Whether at least one nested dialog is open. |
| transitionStatus | `TransitionStatus` | Yes | Unavailable | Current transition phase: starting, ending, idle, or unavailable, as declared. |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="title"></a>

### Title

<a id="api-4469616c6f672e5469746c65"></a>

<a id="dialogtitle"></a>

<a id="api-4469616c6f672e5469746c652e2470726f70732e70726f703a616c69676e"></a>

### Dialog.Title

Declaration: `packages/solid/build/types/dialog/title/DialogTitle.d.ts:2`

#### Declaration

```typescript
(props: DialogTitleProps) => JSX.Element
```

<a id="api-4469616c6f672e5469746c652e2470726f70732e6964"></a>

<a id="DialogTitle-id"></a>

<a id="api-4469616c6f672e5469746c652e2470726f70732e636c617373"></a>

<a id="DialogTitle-class"></a>

<a id="api-4469616c6f672e5469746c652e2470726f70732e7374796c65"></a>

<a id="DialogTitle-style"></a>

<a id="api-4469616c6f672e5469746c652e2470726f70732e72656e646572"></a>

<a id="DialogTitle-render"></a>

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

<a id="api-4469616c6f672e5469746c652e50726f7073"></a>

<a id="dialogtitleprops"></a>

<a id="api-4469616c6f672e5469746c652e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Dialog.Title.Props

Declaration: `packages/solid/build/types/dialog/title/DialogTitle.d.ts:9`

#### Declaration

```typescript
DialogTitleProps
```

<a id="api-4469616c6f672e5469746c652e50726f70732e6964"></a>

<a id="DialogTitleProps-id"></a>

<a id="api-4469616c6f672e5469746c652e50726f70732e636c617373"></a>

<a id="DialogTitleProps-class"></a>

<a id="api-4469616c6f672e5469746c652e50726f70732e7374796c65"></a>

<a id="DialogTitleProps-style"></a>

<a id="api-4469616c6f672e5469746c652e50726f70732e72656e646572"></a>

<a id="DialogTitleProps-render"></a>

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

<a id="api-4469616c6f672e5469746c652e5374617465"></a>

<a id="dialogtitlestate"></a>

### Related exported type: Dialog.Title.State

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

<a id="api-4469616c6f672e4465736372697074696f6e"></a>

<a id="dialogdescription"></a>

<a id="api-4469616c6f672e4465736372697074696f6e2e2470726f70732e70726f703a616c69676e"></a>

### Dialog.Description

Declaration: `packages/solid/build/types/dialog/description/DialogDescription.d.ts:2`

#### Declaration

```typescript
(props: DialogDescriptionProps) => JSX.Element
```

<a id="api-4469616c6f672e4465736372697074696f6e2e2470726f70732e6964"></a>

<a id="DialogDescription-id"></a>

<a id="api-4469616c6f672e4465736372697074696f6e2e2470726f70732e636c617373"></a>

<a id="DialogDescription-class"></a>

<a id="api-4469616c6f672e4465736372697074696f6e2e2470726f70732e7374796c65"></a>

<a id="DialogDescription-style"></a>

<a id="api-4469616c6f672e4465736372697074696f6e2e2470726f70732e72656e646572"></a>

<a id="DialogDescription-render"></a>

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

<a id="api-4469616c6f672e4465736372697074696f6e2e50726f7073"></a>

<a id="dialogdescriptionprops"></a>

<a id="api-4469616c6f672e4465736372697074696f6e2e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Dialog.Description.Props

Declaration: `packages/solid/build/types/dialog/description/DialogDescription.d.ts:9`

#### Declaration

```typescript
DialogDescriptionProps
```

<a id="api-4469616c6f672e4465736372697074696f6e2e50726f70732e6964"></a>

<a id="DialogDescriptionProps-id"></a>

<a id="api-4469616c6f672e4465736372697074696f6e2e50726f70732e636c617373"></a>

<a id="DialogDescriptionProps-class"></a>

<a id="api-4469616c6f672e4465736372697074696f6e2e50726f70732e7374796c65"></a>

<a id="DialogDescriptionProps-style"></a>

<a id="api-4469616c6f672e4465736372697074696f6e2e50726f70732e72656e646572"></a>

<a id="DialogDescriptionProps-render"></a>

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

<a id="api-4469616c6f672e4465736372697074696f6e2e5374617465"></a>

<a id="dialogdescriptionstate"></a>

### Related exported type: Dialog.Description.State

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

<a id="api-4469616c6f672e436c6f7365"></a>

<a id="dialogclose"></a>

<a id="api-4469616c6f672e436c6f73652e2470726f70732e70726f703a64697361626c6564"></a>

<a id="api-4469616c6f672e436c6f73652e2470726f70732e70726f703a666f726d416374696f6e"></a>

<a id="api-4469616c6f672e436c6f73652e2470726f70732e70726f703a666f726d456e6374797065"></a>

<a id="api-4469616c6f672e436c6f73652e2470726f70732e70726f703a666f726d4d6574686f64"></a>

<a id="api-4469616c6f672e436c6f73652e2470726f70732e70726f703a666f726d4e6f56616c6964617465"></a>

<a id="api-4469616c6f672e436c6f73652e2470726f70732e70726f703a666f726d546172676574"></a>

<a id="api-4469616c6f672e436c6f73652e2470726f70732e70726f703a6e616d65"></a>

<a id="api-4469616c6f672e436c6f73652e2470726f70732e70726f703a706f706f766572546172676574416374696f6e"></a>

<a id="api-4469616c6f672e436c6f73652e2470726f70732e70726f703a706f706f766572546172676574456c656d656e74"></a>

<a id="api-4469616c6f672e436c6f73652e2470726f70732e70726f703a74797065"></a>

<a id="api-4469616c6f672e436c6f73652e2470726f70732e70726f703a76616c7565"></a>

### Dialog.Close

Declaration: `packages/solid/build/types/dialog/close/DialogClose.d.ts:2`

#### Declaration

```typescript
(props: DialogCloseProps) => JSX.Element
```

<a id="api-4469616c6f672e436c6f73652e2470726f70732e6e6174697665427574746f6e"></a>

<a id="DialogClose-nativeButton"></a>

<a id="api-4469616c6f672e436c6f73652e2470726f70732e64697361626c6564"></a>

<a id="DialogClose-disabled"></a>

<a id="api-4469616c6f672e436c6f73652e2470726f70732e636c617373"></a>

<a id="DialogClose-class"></a>

<a id="api-4469616c6f672e436c6f73652e2470726f70732e7374796c65"></a>

<a id="DialogClose-style"></a>

<a id="api-4469616c6f672e436c6f73652e2470726f70732e72656e646572"></a>

<a id="DialogClose-render"></a>

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

<a id="api-4469616c6f67436c6f736544617461417474726962757465732e64697361626c6564"></a>

| Name | Description |
| --- | --- |
| data-disabled |  |

#### CSS variables

Metadata status: unavailable.

<a id="api-4469616c6f672e436c6f73652e50726f7073"></a>

<a id="dialogcloseprops"></a>

<a id="api-4469616c6f672e436c6f73652e50726f70732e70726f703a64697361626c6564"></a>

<a id="api-4469616c6f672e436c6f73652e50726f70732e70726f703a666f726d416374696f6e"></a>

<a id="api-4469616c6f672e436c6f73652e50726f70732e70726f703a666f726d456e6374797065"></a>

<a id="api-4469616c6f672e436c6f73652e50726f70732e70726f703a666f726d4d6574686f64"></a>

<a id="api-4469616c6f672e436c6f73652e50726f70732e70726f703a666f726d4e6f56616c6964617465"></a>

<a id="api-4469616c6f672e436c6f73652e50726f70732e70726f703a666f726d546172676574"></a>

<a id="api-4469616c6f672e436c6f73652e50726f70732e70726f703a6e616d65"></a>

<a id="api-4469616c6f672e436c6f73652e50726f70732e70726f703a706f706f766572546172676574416374696f6e"></a>

<a id="api-4469616c6f672e436c6f73652e50726f70732e70726f703a706f706f766572546172676574456c656d656e74"></a>

<a id="api-4469616c6f672e436c6f73652e50726f70732e70726f703a74797065"></a>

<a id="api-4469616c6f672e436c6f73652e50726f70732e70726f703a76616c7565"></a>

### Related exported type: Dialog.Close.Props

Declaration: `packages/solid/build/types/dialog/close/DialogClose.d.ts:11`

#### Declaration

```typescript
DialogCloseProps
```

<a id="api-4469616c6f672e436c6f73652e50726f70732e6e6174697665427574746f6e"></a>

<a id="DialogCloseProps-nativeButton"></a>

<a id="api-4469616c6f672e436c6f73652e50726f70732e64697361626c6564"></a>

<a id="DialogCloseProps-disabled"></a>

<a id="api-4469616c6f672e436c6f73652e50726f70732e636c617373"></a>

<a id="DialogCloseProps-class"></a>

<a id="api-4469616c6f672e436c6f73652e50726f70732e7374796c65"></a>

<a id="DialogCloseProps-style"></a>

<a id="api-4469616c6f672e436c6f73652e50726f70732e72656e646572"></a>

<a id="DialogCloseProps-render"></a>

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

<a id="api-4469616c6f672e436c6f73652e5374617465"></a>

<a id="dialogclosestate"></a>

### Related exported type: Dialog.Close.State

Declaration: `packages/solid/build/types/dialog/close/DialogClose.d.ts:12`

#### Declaration

```typescript
DialogCloseState
```

<a id="api-4469616c6f672e436c6f73652e53746174652e64697361626c6564"></a>

<a id="DialogCloseState-disabled"></a>

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

<a id="api-4469616c6f672e63726561746548616e646c65"></a>

<a id="dialogcreatehandle"></a>

### Dialog.createHandle

Declaration: `packages/solid/build/types/dialog/store/DialogHandle.d.ts:13`

#### Declaration

```typescript
<Payload = unknown>() => DialogHandle<Payload>
```

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

#### Return value

```typescript
DialogHandle<Payload>
```

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
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

<a id="api-4469616c6f672e48616e646c65"></a>

<a id="dialoghandle"></a>

### Dialog.Handle

The shared handle owns attachment stacks and detached trigger migration, never root state.

Declaration: `packages/solid/build/types/dialog/store/DialogHandle.d.ts:4`

#### Declaration

```typescript
DialogHandle<Payload>
```

<a id="api-4469616c6f672e48616e646c652e6f70656e"></a>

<a id="DialogHandle-open"></a>

<a id="api-4469616c6f672e48616e646c652e6163746976617465"></a>

<a id="DialogHandle-activate"></a>

<a id="api-4469616c6f672e48616e646c652e61747461636853746f7265"></a>

<a id="DialogHandle-attachStore"></a>

<a id="api-4469616c6f672e48616e646c652e6174746163686564"></a>

<a id="DialogHandle-attached"></a>

<a id="api-4469616c6f672e48616e646c652e617474616368656453746f7265"></a>

<a id="DialogHandle-attachedStore"></a>

<a id="api-4469616c6f672e48616e646c652e636c6f7365"></a>

<a id="DialogHandle-close"></a>

<a id="api-4469616c6f672e48616e646c652e636c6f7365506f707570"></a>

<a id="DialogHandle-closePopup"></a>

<a id="api-4469616c6f672e48616e646c652e636f6d706f6e656e744e616d65"></a>

<a id="DialogHandle-componentName"></a>

<a id="api-4469616c6f672e48616e646c652e63757272656e74"></a>

<a id="DialogHandle-current"></a>

<a id="api-4469616c6f672e48616e646c652e66616c6c6261636b53746f7265"></a>

<a id="DialogHandle-fallbackStore"></a>

<a id="api-4469616c6f672e48616e646c652e69734f70656e"></a>

<a id="DialogHandle-isOpen"></a>

<a id="api-4469616c6f672e48616e646c652e6f70656e427954726967676572"></a>

<a id="DialogHandle-openByTrigger"></a>

<a id="api-4469616c6f672e48616e646c652e6f70656e576974685061796c6f6164"></a>

<a id="DialogHandle-openWithPayload"></a>

<a id="api-4469616c6f672e48616e646c652e73657276657253746f7265"></a>

<a id="DialogHandle-serverStore"></a>

<a id="api-4469616c6f672e48616e646c652e7365744f70656e4d6574686f64"></a>

<a id="DialogHandle-setOpenMethod"></a>

<a id="api-4469616c6f672e48616e646c652e73746f7265"></a>

<a id="DialogHandle-store"></a>

<a id="api-4469616c6f672e48616e646c652e7468726f774f6e4d697373696e6754726967676572"></a>

<a id="DialogHandle-throwOnMissingTrigger"></a>

<a id="api-4469616c6f672e48616e646c652e76657273696f6e"></a>

<a id="DialogHandle-version"></a>

<a id="api-4469616c6f672e48616e646c652e7761726e696e67"></a>

<a id="DialogHandle-warning"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| open | `(triggerId: string \| null) => void` | Yes | Unavailable |  |
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

