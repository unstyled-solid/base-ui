# Alert Dialog

A dialog that requires a user response to proceed.



[Interactive example](/solid/components/alert-dialog)

## Anatomy

Import the component and assemble its parts:

```tsx
import { AlertDialog } from 'baseui-solid2/alert-dialog';
<AlertDialog.Root>
  <AlertDialog.Trigger />
  <AlertDialog.Portal>
    <AlertDialog.Backdrop />
    <AlertDialog.Viewport>
      <AlertDialog.Popup>
        <AlertDialog.Title />
        <AlertDialog.Description />
        <AlertDialog.Close />
      </AlertDialog.Popup>
    </AlertDialog.Viewport>
  </AlertDialog.Portal>
</AlertDialog.Root>;
```

## Examples

### Open from a menu

In order to open a dialog using a menu, control the dialog state and open it imperatively using the `onClick` handler on the menu item.

[Interactive example](/solid/components/alert-dialog)

### Close confirmation

This example shows a nested confirmation dialog that opens if the text entered in the parent dialog is going to be discarded.

To implement this, both dialogs should be controlled. The confirmation dialog may be opened when `onOpenChange` callback of the parent dialog receives a request to close. This way, the confirmation is automatically shown when the user clicks the backdrop, presses the Esc key, or clicks a close button.

Use the `[data-nested-dialog-open]` selector and the `var(--nested-dialogs)` CSS variable to customize the styling of the parent dialog. Backdrops of the child dialogs won't be rendered so that you can present the parent dialog in a clean way behind the one on top of it.

[Interactive example](/solid/components/alert-dialog)

### Detached triggers

An alert dialog can be controlled by a trigger located either inside or outside the `<AlertDialog.Root>` component.
For simple, one-off interactions, place the `<AlertDialog.Trigger>` inside `<AlertDialog.Root>`, as shown in the example at the top of this page.

However, if defining the alert dialog's content next to its trigger is not practical, you can use a detached trigger.
This involves placing the `<AlertDialog.Trigger>` outside of `<AlertDialog.Root>` and linking them with a `handle` created by the `AlertDialog.createHandle()` function.

The imperative methods on the handle, such as `open()` and `openWithPayload()`, require an `<AlertDialog.Root>` using the same handle to be mounted.
Calls made while no root is attached to the handle — before one mounts, or after it unmounts — are ignored. Each time a root mounts, it starts from fresh state: a call made while no root was attached is not replayed, and no open state carries over from a previous mount.

```tsx
const demoAlertDialog = AlertDialog.createHandle();



<AlertDialog.Trigger handle={demoAlertDialog}>Open</AlertDialog.Trigger>



<AlertDialog.Root handle={demoAlertDialog}>
  ...
</AlertDialog.Root>
```

[Interactive example](/solid/components/alert-dialog)

### Multiple triggers

A single alert dialog can be opened by multiple trigger elements.
You can achieve this by using the same `handle` for several detached triggers, or by placing multiple `<AlertDialog.Trigger>` components inside a single `<AlertDialog.Root>`.

```tsx
<AlertDialog.Root>
  <AlertDialog.Trigger>Trigger 1</AlertDialog.Trigger>
  <AlertDialog.Trigger>Trigger 2</AlertDialog.Trigger>
  ...
</AlertDialog.Root>;
```

```tsx
const demoAlertDialog = AlertDialog.createHandle();

<AlertDialog.Trigger handle={demoAlertDialog}>Trigger 1</AlertDialog.Trigger>
<AlertDialog.Trigger handle={demoAlertDialog}>Trigger 2</AlertDialog.Trigger>
<AlertDialog.Root handle={demoAlertDialog}>
  ...
</AlertDialog.Root>
```

The alert dialog can render different content depending on which trigger opened it.
This is achieved by passing a `payload` to the `<AlertDialog.Trigger>` and using the function-as-a-child pattern in `<AlertDialog.Root>`.

The payload can be strongly typed by providing a type argument to the `createHandle()` function:

```tsx

const demoAlertDialog = AlertDialog.createHandle<{ message: string }>();



<AlertDialog.Trigger handle={demoAlertDialog} payload={{ message: 'Trigger 1' }}>
  Trigger 1
</AlertDialog.Trigger>



<AlertDialog.Trigger handle={demoAlertDialog} payload={{ message: 'Trigger 2' }}>
  Trigger 2
</AlertDialog.Trigger>

<AlertDialog.Root handle={demoAlertDialog}>
  {({ payload }) => ( 
    <AlertDialog.Portal>
      <AlertDialog.Popup>
        <AlertDialog.Title>Alert dialog</AlertDialog.Title>
        {payload !== undefined && ( 
          <AlertDialog.Description>
            Confirming {payload.message} 
          </AlertDialog.Description>
        )}
      </AlertDialog.Popup>
    </AlertDialog.Portal>
  )}
</AlertDialog.Root>
```

### Controlled mode with multiple triggers

You can control the alert dialog's open state externally using the `open` and `onOpenChange` props on `<AlertDialog.Root>`.
This allows you to manage the alert dialog's visibility based on your application's state.
When using multiple triggers, you have to manage which trigger is active with the `triggerId` prop on `<AlertDialog.Root>` and the `id` prop on each `<AlertDialog.Trigger>`.

Note that there is no separate `onTriggerIdChange` prop.
Instead, the `onOpenChange` callback receives an additional argument, `eventDetails`, which contains the trigger element that initiated the state change.

[Interactive example](/solid/components/alert-dialog)

## API reference

### Root

Groups the alert dialog parts without rendering an HTML element.

| Prop | Type | Description |
| --- | --- | --- |
| defaultOpen | boolean \| undefined |  |
| open | boolean \| undefined | Controlled open state. Defaults seed only this root's uncontrolled lifetime. |
| onOpenChange | ((open: boolean, eventDetails: AlertDialogRoot.ChangeEventDetails) => void) \| undefined |  |
| actionsRef | { current: DialogRootActions \| null; } \| ((actions: DialogRootActions \| null) => void) \| undefined | Call preventUnmountOnClose() before using unmount to finish a manual exit. |
| defaultTriggerId | string \| null \| undefined |  |
| handle | AlertDialogHandle<Payload> \| undefined | Associates this root with detached alert dialog triggers. |
| onOpenChangeComplete | ((open: boolean) => void) \| undefined |  |
| triggerId | string \| null \| undefined |  |
| children | JSX.Element \| ((context: { readonly payload: Payload \| undefined; }) => JSX.Element) | Read context.payload live in JSX; it follows the active trigger without recreating the subtree. |

### Trigger

A button that opens the alert dialog. Shares Dialog's trigger implementation.

| Prop | Type | Description |
| --- | --- | --- |
| handle | AlertDialogHandle<Payload> \| undefined |  |
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

Connects detached triggers to a mounted alert dialog root.

| Prop | Type | Description |
| --- | --- | --- |


