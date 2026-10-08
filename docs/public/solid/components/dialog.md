# Dialog

A popup that opens on top of the entire page.



[Interactive example](/solid/components/dialog)

## Usage guidelines

- **Dialog doesn't support gestures:** Use [Drawer](/solid/components/drawer) when you need gesture support or snap points. A panel that slides in from the edge of the screen and doesn't need gesture support is a positioned Dialog.

## Anatomy

Import the component and assemble its parts:

```tsx
import { Dialog } from 'baseui-solid2/dialog';
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

## Examples

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

### Open from a menu

In order to open a dialog using a menu, control the dialog state and open it imperatively using the `onClick` handler on the menu item.

[Interactive example](/solid/components/dialog)

### Nested dialogs

You can nest dialogs within one another normally.

Use the `[data-nested-dialog-open]` selector and the `var(--nested-dialogs)` CSS variable to customize the styling of the parent dialog. Backdrops of the child dialogs won't be rendered so that you can present the parent dialog in a clean way behind the one on top of it.

[Interactive example](/solid/components/dialog)

### Close confirmation

This example shows a nested confirmation dialog that opens if the text entered in the parent dialog is going to be discarded.

To implement this, both dialogs should be controlled. The confirmation dialog may be opened when `onOpenChange` callback of the parent dialog receives a request to close. This way, the confirmation is automatically shown when the user clicks the backdrop, presses the Esc key, or clicks a close button.

[Interactive example](/solid/components/dialog)

### Custom focus management

You can control where the focus goes when the dialog opens and closes using the `initialFocus` and `finalFocus` props on the `<Dialog.Popup>` component.

You can also set these props to `false` to prevent focus from moving when the dialog opens or closes, or to a function that returns the element to focus based on the interaction type.

[Interactive example](/solid/components/dialog)

### Outside scroll dialog

The dialog can be made scrollable by using `<Dialog.Viewport>` as an outer scrollable container for `<Dialog.Popup>` while the popup can extend past the bottom edge. The scrollable area uses the [Scroll Area component](/solid/components/scroll-area) to provide custom scrollbars.

[Interactive example](/solid/components/dialog)

### Inside scroll dialog

The dialog can be made scrollable by making an inner container scrollable while the popup stays fully on screen. `<Dialog.Viewport>` is used as a positioning container for `<Dialog.Popup>`, while an inner scrollable area is created using the [Scroll Area component](/solid/components/scroll-area).

[Interactive example](/solid/components/dialog)

### Placing elements outside the popup

When adding elements that should appear "outside" the colored popup area, continue to place them inside `<Dialog.Popup>`, but create a child element that has the popup styles. This ensures they are kept in the tab order and announced correctly by screen readers.

`<Dialog.Popup>` has `pointer-events: none`, while inner content (the colored popup and close button) has `pointer-events: auto` so clicks on the backdrop continue to be registered.

[Interactive example](/solid/components/dialog)

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

[Interactive example](/solid/components/dialog)

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

### Controlled mode with multiple triggers

You can control the dialog's open state externally using the `open` and `onOpenChange` props on `<Dialog.Root>`.
This allows you to manage the dialog's visibility based on your application's state.
When using multiple triggers, you have to manage which trigger is active with the `triggerId` prop on `<Dialog.Root>` and the `id` prop on each `<Dialog.Trigger>`.

Note that there is no separate `onTriggerIdChange` prop.
Instead, the `onOpenChange` callback receives an additional argument, `eventDetails`, which contains the trigger element that initiated the state change.

[Interactive example](/solid/components/dialog)

## API reference

### Root



| Prop | Type | Description |
| --- | --- | --- |
| defaultOpen | boolean \| undefined |  |
| open | boolean \| undefined | Controlled open state. Defaults seed only this root's uncontrolled lifetime. |
| onOpenChange | ((open: boolean, details: DialogRootChangeEventDetails) => void) \| undefined |  |
| actionsRef | { current: DialogRootActions \| null; } \| ((actions: DialogRootActions \| null) => void) \| undefined | Retention is requested by details.preventUnmountOnClose(), not by providing actionsRef. |
| defaultTriggerId | string \| null \| undefined |  |
| disablePointerDismissal | boolean \| undefined | Also suppresses nonmodal focus-out dismissal; Escape and explicit close remain available. |
| handle | DialogHandle<Payload> \| undefined | A root owns its model; swapping this handle never resets that model. |
| modal | boolean \| "trap-focus" \| undefined | true: trap focus and lock scroll/pointers; false: nonmodal; trap-focus: focus only. |
| onOpenChangeComplete | ((open: boolean) => void) \| undefined |  |
| triggerId | string \| null \| undefined |  |
| children | JSX.Element \| ((context: { readonly payload: Payload \| undefined; }) => JSX.Element) | Read context.payload live in JSX; it follows the active trigger without recreating the subtree. |

### Trigger



| Prop | Type | Description |
| --- | --- | --- |
| handle | DialogHandle<Payload> \| undefined |  |
| nativeButton | boolean \| undefined |  |
| payload | NoInfer<Payload> \| undefined |  |
| disabled | boolean \| undefined |  |
| id | string \| undefined |  |
| class | JSX.ClassValue \| ((state: Readonly<DialogTriggerState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<DialogTriggerState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, DialogTriggerState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Portal



| Prop | Type | Description |
| --- | --- | --- |
| container | PortalContainer |  |
| id | string \| undefined |  |
| class | JSX.ClassValue \| ((state: Readonly<AlertDialogPortalState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AlertDialogPortalState>) => StyleValue) |  |
| keepMounted | boolean \| undefined |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, AlertDialogPortalState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Backdrop



| Prop | Type | Description |
| --- | --- | --- |
| forceRender | boolean \| undefined |  |
| class | JSX.ClassValue \| ((state: Readonly<AlertDialogBackdropState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AlertDialogBackdropState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, AlertDialogBackdropState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Viewport



| Prop | Type | Description |
| --- | --- | --- |
| class | JSX.ClassValue \| ((state: Readonly<AlertDialogViewportState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AlertDialogViewportState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, AlertDialogViewportState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Popup



| Prop | Type | Description |
| --- | --- | --- |
| initialFocus | DialogFocusTarget \| undefined |  |
| finalFocus | DialogFocusTarget \| undefined |  |
| id | string \| undefined |  |
| class | JSX.ClassValue \| ((state: Readonly<AlertDialogPopupState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AlertDialogPopupState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, AlertDialogPopupState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Title



| Prop | Type | Description |
| --- | --- | --- |
| id | string \| undefined |  |
| class | JSX.ClassValue \| ((state: Readonly<AlertDialogTitleState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AlertDialogTitleState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, AlertDialogTitleState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Description



| Prop | Type | Description |
| --- | --- | --- |
| id | string \| undefined |  |
| class | JSX.ClassValue \| ((state: Readonly<AlertDialogDescriptionState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AlertDialogDescriptionState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, AlertDialogDescriptionState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Close



| Prop | Type | Description |
| --- | --- | --- |
| nativeButton | boolean \| undefined |  |
| disabled | boolean \| undefined |  |
| class | JSX.ClassValue \| ((state: Readonly<AlertDialogCloseState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AlertDialogCloseState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, AlertDialogCloseState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

## createHandle



| Prop | Type | Description |
| --- | --- | --- |


### Handle

The shared handle owns attachment stacks and detached trigger migration, never root state.

| Prop | Type | Description |
| --- | --- | --- |


