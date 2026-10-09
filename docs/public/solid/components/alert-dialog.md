<a id="alert-dialog"></a>

# Alert Dialog

A dialog that requires a user response to proceed.

[Open mounted Solid demo: alert-dialog/hero](/solid/components/alert-dialog)

<a id="anatomy"></a>

## Anatomy

Import the component and assemble its parts:

```tsx
import { AlertDialog } from '@unstyled-solid/base-ui/alert-dialog';
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

<a id="examples"></a>

## Examples

<a id="open-from-a-menu"></a>

### Open from a menu

In order to open a dialog using a menu, control the dialog state and open it imperatively using the `onClick` handler on the menu item.

[Open mounted Solid demo: alert-dialog/open-from-menu](/solid/components/alert-dialog)

<a id="close-confirmation"></a>

### Close confirmation

This example shows a nested confirmation dialog that opens if the text entered in the parent dialog is going to be discarded.

To implement this, both dialogs should be controlled. The confirmation dialog may be opened when `onOpenChange` callback of the parent dialog receives a request to close. This way, the confirmation is automatically shown when the user clicks the backdrop, presses the Esc key, or clicks a close button.

Use the `[data-nested-dialog-open]` selector and the `var(--nested-dialogs)` CSS variable to customize the styling of the parent dialog. Backdrops of the child dialogs won't be rendered so that you can present the parent dialog in a clean way behind the one on top of it.

[Open mounted Solid demo: dialog/close-confirmation](/solid/components/alert-dialog)

<a id="detached-triggers"></a>

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

[Open mounted Solid demo: alert-dialog/detached-triggers-simple](/solid/components/alert-dialog)

<a id="multiple-triggers"></a>

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

<a id="controlled-mode-with-multiple-triggers"></a>

### Controlled mode with multiple triggers

You can control the alert dialog's open state externally using the `open` and `onOpenChange` props on `<AlertDialog.Root>`.
This allows you to manage the alert dialog's visibility based on your application's state.
When using multiple triggers, you have to manage which trigger is active with the `triggerId` prop on `<AlertDialog.Root>` and the `id` prop on each `<AlertDialog.Trigger>`.

Note that there is no separate `onTriggerIdChange` prop.
Instead, the `onOpenChange` callback receives an additional argument, `eventDetails`, which contains the trigger element that initiated the state change.

[Open mounted Solid demo: alert-dialog/detached-triggers-controlled](/solid/components/alert-dialog)

<a id="api-reference"></a>

## API reference

<a id="root"></a>

### Root

<a id="api-416c6572744469616c6f672e526f6f74"></a>

<a id="alertdialogroot"></a>

### AlertDialog.Root

Groups the alert dialog parts without rendering an HTML element.

Declaration: `packages/solid/build/types/alert-dialog/root/AlertDialogRoot.d.ts:4`

#### Declaration

```typescript
<Payload>(props: AlertDialogRoot.Props<Payload>) => JSX.Element
```

<a id="api-416c6572744469616c6f672e526f6f742e2470726f70732e64656661756c744f70656e"></a>

<a id="AlertDialogRoot-defaultOpen"></a>

<a id="api-416c6572744469616c6f672e526f6f742e2470726f70732e6f70656e"></a>

<a id="AlertDialogRoot-open"></a>

<a id="api-416c6572744469616c6f672e526f6f742e2470726f70732e6f6e4f70656e4368616e6765"></a>

<a id="AlertDialogRoot-onOpenChange"></a>

<a id="api-416c6572744469616c6f672e526f6f742e2470726f70732e616374696f6e73526566"></a>

<a id="AlertDialogRoot-actionsRef"></a>

<a id="api-416c6572744469616c6f672e526f6f742e2470726f70732e64656661756c74547269676765724964"></a>

<a id="AlertDialogRoot-defaultTriggerId"></a>

<a id="api-416c6572744469616c6f672e526f6f742e2470726f70732e68616e646c65"></a>

<a id="AlertDialogRoot-handle"></a>

<a id="api-416c6572744469616c6f672e526f6f742e2470726f70732e6f6e4f70656e4368616e6765436f6d706c657465"></a>

<a id="AlertDialogRoot-onOpenChangeComplete"></a>

<a id="api-416c6572744469616c6f672e526f6f742e2470726f70732e747269676765724964"></a>

<a id="AlertDialogRoot-triggerId"></a>

<a id="api-416c6572744469616c6f672e526f6f742e2470726f70732e6368696c6472656e"></a>

<a id="AlertDialogRoot-children"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| defaultOpen | `boolean \| undefined` | No | Unavailable | Initial open state for this root’s uncontrolled lifetime. |
| open | `boolean \| undefined` | No | Unavailable | Controlled open state. Defaults seed only this root's uncontrolled lifetime. |
| onOpenChange | `((open: boolean, eventDetails: AlertDialogRoot.ChangeEventDetails) => void) \| undefined` | No | Unavailable |  |
| actionsRef | `{ current: DialogRootActions \| null; } \| ((actions: DialogRootActions \| null) => void) \| undefined` | No | Unavailable | Call preventUnmountOnClose() before using unmount to finish a manual exit. |
| defaultTriggerId | `string \| null \| undefined` | No | Unavailable | Initial active trigger ID for uncontrolled trigger selection. |
| handle | `AlertDialogHandle<Payload> \| undefined` | No | Unavailable | Associates this root with detached alert dialog triggers. |
| onOpenChangeComplete | `((open: boolean) => void) \| undefined` | No | Unavailable | Called with the open state when the opening or closing transition completes. |
| triggerId | `string \| null \| undefined` | No | Unavailable | Controlled ID of the active trigger. |
| children | `JSX.Element \| ((context: { readonly payload: Payload \| undefined; }) => JSX.Element)` | No | Unavailable | Read context.payload live in JSX; it follows the active trigger without recreating the subtree. |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-416c6572744469616c6f672e526f6f742e50726f7073"></a>

<a id="alertdialogrootprops"></a>

### Related exported type: AlertDialog.Root.Props

Declaration: `packages/solid/build/types/alert-dialog/root/AlertDialogRoot.d.ts:19`

#### Declaration

```typescript
Props<Payload>
```

<a id="api-416c6572744469616c6f672e526f6f742e50726f70732e64656661756c744f70656e"></a>

<a id="AlertDialogRootProps-defaultOpen"></a>

<a id="api-416c6572744469616c6f672e526f6f742e50726f70732e6f70656e"></a>

<a id="AlertDialogRootProps-open"></a>

<a id="api-416c6572744469616c6f672e526f6f742e50726f70732e6f6e4f70656e4368616e6765"></a>

<a id="AlertDialogRootProps-onOpenChange"></a>

<a id="api-416c6572744469616c6f672e526f6f742e50726f70732e616374696f6e73526566"></a>

<a id="AlertDialogRootProps-actionsRef"></a>

<a id="api-416c6572744469616c6f672e526f6f742e50726f70732e64656661756c74547269676765724964"></a>

<a id="AlertDialogRootProps-defaultTriggerId"></a>

<a id="api-416c6572744469616c6f672e526f6f742e50726f70732e68616e646c65"></a>

<a id="AlertDialogRootProps-handle"></a>

<a id="api-416c6572744469616c6f672e526f6f742e50726f70732e6f6e4f70656e4368616e6765436f6d706c657465"></a>

<a id="AlertDialogRootProps-onOpenChangeComplete"></a>

<a id="api-416c6572744469616c6f672e526f6f742e50726f70732e747269676765724964"></a>

<a id="AlertDialogRootProps-triggerId"></a>

<a id="api-416c6572744469616c6f672e526f6f742e50726f70732e6368696c6472656e"></a>

<a id="AlertDialogRootProps-children"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| defaultOpen | `boolean \| undefined` | No | Unavailable | Initial open state for this root’s uncontrolled lifetime. |
| open | `boolean \| undefined` | No | Unavailable | Controlled open state. Defaults seed only this root's uncontrolled lifetime. |
| onOpenChange | `((open: boolean, eventDetails: AlertDialogRoot.ChangeEventDetails) => void) \| undefined` | No | Unavailable |  |
| actionsRef | `{ current: DialogRootActions \| null; } \| ((actions: DialogRootActions \| null) => void) \| undefined` | No | Unavailable | Call preventUnmountOnClose() before using unmount to finish a manual exit. |
| defaultTriggerId | `string \| null \| undefined` | No | Unavailable | Initial active trigger ID for uncontrolled trigger selection. |
| handle | `AlertDialogHandle<Payload> \| undefined` | No | Unavailable | Associates this root with detached alert dialog triggers. |
| onOpenChangeComplete | `((open: boolean) => void) \| undefined` | No | Unavailable | Called with the open state when the opening or closing transition completes. |
| triggerId | `string \| null \| undefined` | No | Unavailable | Controlled ID of the active trigger. |
| children | `JSX.Element \| ((context: { readonly payload: Payload \| undefined; }) => JSX.Element)` | No | Unavailable | Read context.payload live in JSX; it follows the active trigger without recreating the subtree. |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-416c6572744469616c6f672e526f6f742e5374617465"></a>

<a id="alertdialogrootstate"></a>

### Related exported type: AlertDialog.Root.State

Declaration: `packages/solid/build/types/alert-dialog/root/AlertDialogRoot.d.ts:18`

#### Declaration

```typescript
AlertDialogRootState
```

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-416c6572744469616c6f672e526f6f742e416374696f6e73"></a>

<a id="alertdialogrootactions"></a>

### Related exported type: AlertDialog.Root.Actions

Declaration: `packages/solid/build/types/alert-dialog/root/AlertDialogRoot.d.ts:20`

#### Declaration

```typescript
DialogRootActions
```

<a id="api-416c6572744469616c6f672e526f6f742e416374696f6e732e636c6f7365"></a>

<a id="AlertDialogRootActions-close"></a>

<a id="api-416c6572744469616c6f672e526f6f742e416374696f6e732e756e6d6f756e74"></a>

<a id="AlertDialogRootActions-unmount"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| close | `() => void` | Yes | Unavailable |  |
| unmount | `() => void` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-416c6572744469616c6f672e526f6f742e4368616e67654576656e74526561736f6e"></a>

<a id="alertdialogrootchangeeventreason"></a>

### Related exported type: AlertDialog.Root.ChangeEventReason

Declaration: `packages/solid/build/types/alert-dialog/root/AlertDialogRoot.d.ts:21`

#### Declaration

```typescript
DialogRootChangeEventReason
```

Inherited DOM attributes: `__@iterator@106`, `anchor`, `at`, `big`, `blink`, `bold`, `charAt`, `charCodeAt`, `codePointAt`, `concat`, `endsWith`, `fixed`, `fontcolor`, `fontsize`, `includes`, `indexOf`, `isWellFormed`, `italics`, `lastIndexOf`, `length`, `link`, `localeCompare`, `match`, `matchAll`, `normalize`, `padEnd`, `padStart`, `repeat`, `replace`, `replaceAll`, `search`, `slice`, `small`, `split`, `startsWith`, `strike`, `sub`, `substr`, `substring`, `sup`, `toLocaleLowerCase`, `toLocaleUpperCase`, `toLowerCase`, `toString`, `toUpperCase`, `toWellFormed`, `trim`, `trimEnd`, `trimLeft`, `trimRight`, `trimStart`, `valueOf`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-416c6572744469616c6f672e526f6f742e4368616e67654576656e7444657461696c73"></a>

<a id="alertdialogrootchangeeventdetails"></a>

### Related exported type: AlertDialog.Root.ChangeEventDetails

Declaration: `packages/solid/build/types/alert-dialog/root/AlertDialogRoot.d.ts:22`

#### Declaration

```typescript
DialogRootChangeEventDetails
```

<a id="api-416c6572744469616c6f672e526f6f742e4368616e67654576656e7444657461696c732e616c6c6f7750726f7061676174696f6e"></a>

<a id="AlertDialogRootChangeEventDetails-allowPropagation"></a>

<a id="api-416c6572744469616c6f672e526f6f742e4368616e67654576656e7444657461696c732e63616e63656c"></a>

<a id="AlertDialogRootChangeEventDetails-cancel"></a>

<a id="api-416c6572744469616c6f672e526f6f742e4368616e67654576656e7444657461696c732e6576656e74"></a>

<a id="AlertDialogRootChangeEventDetails-event"></a>

<a id="api-416c6572744469616c6f672e526f6f742e4368616e67654576656e7444657461696c732e697343616e63656c6564"></a>

<a id="AlertDialogRootChangeEventDetails-isCanceled"></a>

<a id="api-416c6572744469616c6f672e526f6f742e4368616e67654576656e7444657461696c732e697350726f7061676174696f6e416c6c6f776564"></a>

<a id="AlertDialogRootChangeEventDetails-isPropagationAllowed"></a>

<a id="api-416c6572744469616c6f672e526f6f742e4368616e67654576656e7444657461696c732e70726576656e74556e6d6f756e744f6e436c6f7365"></a>

<a id="AlertDialogRootChangeEventDetails-preventUnmountOnClose"></a>

<a id="api-416c6572744469616c6f672e526f6f742e4368616e67654576656e7444657461696c732e726561736f6e"></a>

<a id="AlertDialogRootChangeEventDetails-reason"></a>

<a id="api-416c6572744469616c6f672e526f6f742e4368616e67654576656e7444657461696c732e74726967676572"></a>

<a id="AlertDialogRootChangeEventDetails-trigger"></a>

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

<a id="api-416c6572744469616c6f672e54726967676572"></a>

<a id="alertdialogtrigger"></a>

<a id="api-416c6572744469616c6f672e547269676765722e2470726f70732e70726f703a64697361626c6564"></a>

<a id="api-416c6572744469616c6f672e547269676765722e2470726f70732e70726f703a666f726d416374696f6e"></a>

<a id="api-416c6572744469616c6f672e547269676765722e2470726f70732e70726f703a666f726d456e6374797065"></a>

<a id="api-416c6572744469616c6f672e547269676765722e2470726f70732e70726f703a666f726d4d6574686f64"></a>

<a id="api-416c6572744469616c6f672e547269676765722e2470726f70732e70726f703a666f726d4e6f56616c6964617465"></a>

<a id="api-416c6572744469616c6f672e547269676765722e2470726f70732e70726f703a666f726d546172676574"></a>

<a id="api-416c6572744469616c6f672e547269676765722e2470726f70732e70726f703a6e616d65"></a>

<a id="api-416c6572744469616c6f672e547269676765722e2470726f70732e70726f703a706f706f766572546172676574416374696f6e"></a>

<a id="api-416c6572744469616c6f672e547269676765722e2470726f70732e70726f703a706f706f766572546172676574456c656d656e74"></a>

<a id="api-416c6572744469616c6f672e547269676765722e2470726f70732e70726f703a74797065"></a>

<a id="api-416c6572744469616c6f672e547269676765722e2470726f70732e70726f703a76616c7565"></a>

### AlertDialog.Trigger

A button that opens the alert dialog. Shares Dialog's trigger implementation.

Declaration: `packages/solid/build/types/alert-dialog/trigger/AlertDialogTrigger.d.ts:5`

#### Declaration

```typescript
AlertDialogTrigger
```

<a id="api-416c6572744469616c6f672e547269676765722e2470726f70732e68616e646c65"></a>

<a id="AlertDialogTrigger-handle"></a>

<a id="api-416c6572744469616c6f672e547269676765722e2470726f70732e6e6174697665427574746f6e"></a>

<a id="AlertDialogTrigger-nativeButton"></a>

<a id="api-416c6572744469616c6f672e547269676765722e2470726f70732e7061796c6f6164"></a>

<a id="AlertDialogTrigger-payload"></a>

<a id="api-416c6572744469616c6f672e547269676765722e2470726f70732e64697361626c6564"></a>

<a id="AlertDialogTrigger-disabled"></a>

<a id="api-416c6572744469616c6f672e547269676765722e2470726f70732e6964"></a>

<a id="AlertDialogTrigger-id"></a>

<a id="api-416c6572744469616c6f672e547269676765722e2470726f70732e636c617373"></a>

<a id="AlertDialogTrigger-class"></a>

<a id="api-416c6572744469616c6f672e547269676765722e2470726f70732e7374796c65"></a>

<a id="AlertDialogTrigger-style"></a>

<a id="api-416c6572744469616c6f672e547269676765722e2470726f70732e72656e646572"></a>

<a id="AlertDialogTrigger-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| handle | `AlertDialogHandle<Payload> \| undefined` | No | Unavailable |  |
| nativeButton | `boolean \| undefined` | No | Unavailable | Whether the rendered host is a native button. Set false when the render callback supplies a non-button host. |
| payload | `NoInfer<Payload> \| undefined` | No | Unavailable | Payload registered with this trigger and exposed by the root when this trigger is active. |
| disabled | `boolean \| undefined` | No | Unavailable | Whether the trigger ignores user interaction. |
| id | `string \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<DialogTriggerState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<DialogTriggerState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, DialogTriggerState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `command`, `commandfor`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `form`, `formaction`, `formenctype`, `formmethod`, `formnovalidate`, `formtarget`, `hidden`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `name`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `popovertarget`, `popovertargetaction`, `prefix`, `prop:disabled`, `prop:formAction`, `prop:formEnctype`, `prop:formMethod`, `prop:formNoValidate`, `prop:formTarget`, `prop:name`, `prop:popoverTargetAction`, `prop:popoverTargetElement`, `prop:type`, `prop:value`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `type`, `typeof`, `value`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-416c6572744469616c6f675472696767657244617461417474726962757465732e706f7075704f70656e"></a>

<a id="api-416c6572744469616c6f675472696767657244617461417474726962757465732e64697361626c6564"></a>

| Name | Description |
| --- | --- |
| data-popup-open | Present when the corresponding alert dialog is open. |
| data-disabled | Present when the trigger is disabled. |

#### CSS variables

Metadata status: unavailable.

<a id="api-416c6572744469616c6f672e547269676765722e50726f7073"></a>

<a id="alertdialogtriggerprops"></a>

<a id="api-416c6572744469616c6f672e547269676765722e50726f70732e70726f703a64697361626c6564"></a>

<a id="api-416c6572744469616c6f672e547269676765722e50726f70732e70726f703a666f726d416374696f6e"></a>

<a id="api-416c6572744469616c6f672e547269676765722e50726f70732e70726f703a666f726d456e6374797065"></a>

<a id="api-416c6572744469616c6f672e547269676765722e50726f70732e70726f703a666f726d4d6574686f64"></a>

<a id="api-416c6572744469616c6f672e547269676765722e50726f70732e70726f703a666f726d4e6f56616c6964617465"></a>

<a id="api-416c6572744469616c6f672e547269676765722e50726f70732e70726f703a666f726d546172676574"></a>

<a id="api-416c6572744469616c6f672e547269676765722e50726f70732e70726f703a6e616d65"></a>

<a id="api-416c6572744469616c6f672e547269676765722e50726f70732e70726f703a706f706f766572546172676574416374696f6e"></a>

<a id="api-416c6572744469616c6f672e547269676765722e50726f70732e70726f703a706f706f766572546172676574456c656d656e74"></a>

<a id="api-416c6572744469616c6f672e547269676765722e50726f70732e70726f703a74797065"></a>

<a id="api-416c6572744469616c6f672e547269676765722e50726f70732e70726f703a76616c7565"></a>

### Related exported type: AlertDialog.Trigger.Props

Declaration: `packages/solid/build/types/alert-dialog/trigger/AlertDialogTrigger.d.ts:15`

#### Declaration

```typescript
Props<Payload>
```

<a id="api-416c6572744469616c6f672e547269676765722e50726f70732e68616e646c65"></a>

<a id="AlertDialogTriggerProps-handle"></a>

<a id="api-416c6572744469616c6f672e547269676765722e50726f70732e6e6174697665427574746f6e"></a>

<a id="AlertDialogTriggerProps-nativeButton"></a>

<a id="api-416c6572744469616c6f672e547269676765722e50726f70732e7061796c6f6164"></a>

<a id="AlertDialogTriggerProps-payload"></a>

<a id="api-416c6572744469616c6f672e547269676765722e50726f70732e64697361626c6564"></a>

<a id="AlertDialogTriggerProps-disabled"></a>

<a id="api-416c6572744469616c6f672e547269676765722e50726f70732e6964"></a>

<a id="AlertDialogTriggerProps-id"></a>

<a id="api-416c6572744469616c6f672e547269676765722e50726f70732e636c617373"></a>

<a id="AlertDialogTriggerProps-class"></a>

<a id="api-416c6572744469616c6f672e547269676765722e50726f70732e7374796c65"></a>

<a id="AlertDialogTriggerProps-style"></a>

<a id="api-416c6572744469616c6f672e547269676765722e50726f70732e72656e646572"></a>

<a id="AlertDialogTriggerProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| handle | `AlertDialogHandle<Payload> \| undefined` | No | Unavailable |  |
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

<a id="api-416c6572744469616c6f672e547269676765722e5374617465"></a>

<a id="alertdialogtriggerstate"></a>

### Related exported type: AlertDialog.Trigger.State

Declaration: `packages/solid/build/types/alert-dialog/trigger/AlertDialogTrigger.d.ts:16`

#### Declaration

```typescript
AlertDialogTriggerState
```

<a id="api-416c6572744469616c6f672e547269676765722e53746174652e6f70656e"></a>

<a id="AlertDialogTriggerState-open"></a>

<a id="api-416c6572744469616c6f672e547269676765722e53746174652e64697361626c6564"></a>

<a id="AlertDialogTriggerState-disabled"></a>

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

<a id="api-416c6572744469616c6f672e506f7274616c"></a>

<a id="alertdialogportal"></a>

<a id="api-416c6572744469616c6f672e506f7274616c2e2470726f70732e70726f703a616c69676e"></a>

### AlertDialog.Portal

Declaration: `packages/solid/build/types/dialog/portal/DialogPortal.d.ts:2`

#### Declaration

```typescript
(props: DialogPortalProps) => JSX.Element
```

<a id="api-416c6572744469616c6f672e506f7274616c2e2470726f70732e636f6e7461696e6572"></a>

<a id="AlertDialogPortal-container"></a>

<a id="api-416c6572744469616c6f672e506f7274616c2e2470726f70732e6964"></a>

<a id="AlertDialogPortal-id"></a>

<a id="api-416c6572744469616c6f672e506f7274616c2e2470726f70732e636c617373"></a>

<a id="AlertDialogPortal-class"></a>

<a id="api-416c6572744469616c6f672e506f7274616c2e2470726f70732e7374796c65"></a>

<a id="AlertDialogPortal-style"></a>

<a id="api-416c6572744469616c6f672e506f7274616c2e2470726f70732e6b6565704d6f756e746564"></a>

<a id="AlertDialogPortal-keepMounted"></a>

<a id="api-416c6572744469616c6f672e506f7274616c2e2470726f70732e72656e646572"></a>

<a id="AlertDialogPortal-render"></a>

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

<a id="api-416c6572744469616c6f672e506f7274616c2e50726f7073"></a>

<a id="alertdialogportalprops"></a>

<a id="api-416c6572744469616c6f672e506f7274616c2e50726f70732e70726f703a616c69676e"></a>

### Related exported type: AlertDialog.Portal.Props

Declaration: `packages/solid/build/types/dialog/portal/DialogPortal.d.ts:11`

#### Declaration

```typescript
DialogPortalProps
```

<a id="api-416c6572744469616c6f672e506f7274616c2e50726f70732e636f6e7461696e6572"></a>

<a id="AlertDialogPortalProps-container"></a>

<a id="api-416c6572744469616c6f672e506f7274616c2e50726f70732e6964"></a>

<a id="AlertDialogPortalProps-id"></a>

<a id="api-416c6572744469616c6f672e506f7274616c2e50726f70732e636c617373"></a>

<a id="AlertDialogPortalProps-class"></a>

<a id="api-416c6572744469616c6f672e506f7274616c2e50726f70732e7374796c65"></a>

<a id="AlertDialogPortalProps-style"></a>

<a id="api-416c6572744469616c6f672e506f7274616c2e50726f70732e6b6565704d6f756e746564"></a>

<a id="AlertDialogPortalProps-keepMounted"></a>

<a id="api-416c6572744469616c6f672e506f7274616c2e50726f70732e72656e646572"></a>

<a id="AlertDialogPortalProps-render"></a>

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

<a id="api-416c6572744469616c6f672e506f7274616c2e5374617465"></a>

<a id="alertdialogportalstate"></a>

### Related exported type: AlertDialog.Portal.State

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

<a id="api-416c6572744469616c6f672e4261636b64726f70"></a>

<a id="alertdialogbackdrop"></a>

<a id="api-416c6572744469616c6f672e4261636b64726f702e2470726f70732e70726f703a616c69676e"></a>

### AlertDialog.Backdrop

Declaration: `packages/solid/build/types/dialog/backdrop/DialogBackdrop.d.ts:2`

#### Declaration

```typescript
(props: DialogBackdropProps) => JSX.Element
```

<a id="api-416c6572744469616c6f672e4261636b64726f702e2470726f70732e666f72636552656e646572"></a>

<a id="AlertDialogBackdrop-forceRender"></a>

<a id="api-416c6572744469616c6f672e4261636b64726f702e2470726f70732e636c617373"></a>

<a id="AlertDialogBackdrop-class"></a>

<a id="api-416c6572744469616c6f672e4261636b64726f702e2470726f70732e7374796c65"></a>

<a id="AlertDialogBackdrop-style"></a>

<a id="api-416c6572744469616c6f672e4261636b64726f702e2470726f70732e72656e646572"></a>

<a id="AlertDialogBackdrop-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| forceRender | `boolean \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<AlertDialogBackdropState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AlertDialogBackdropState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, AlertDialogBackdropState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-416c6572744469616c6f672e4261636b64726f702e64617461417474726962757465732e6f70656e"></a>

<a id="api-416c6572744469616c6f672e4261636b64726f702e64617461417474726962757465732e636c6f736564"></a>

<a id="api-416c6572744469616c6f672e4261636b64726f702e64617461417474726962757465732e646174612d616e63686f722d68696464656e"></a>

<a id="api-416c6572744469616c6f672e4261636b64726f702e64617461417474726962757465732e7374617274696e675374796c65"></a>

<a id="api-416c6572744469616c6f672e4261636b64726f702e64617461417474726962757465732e656e64696e675374796c65"></a>

| Name | Description |
| --- | --- |
| data-open | Present when open is true. |
| data-closed | Present when open is false. |
| data-anchor-hidden | Present when anchorHidden is true. |
| data-starting-style | Present when transitionStatus is 'starting'. |
| data-ending-style | Present when transitionStatus is 'ending'. |

#### CSS variables

Metadata status: unavailable.

<a id="api-416c6572744469616c6f672e4261636b64726f702e50726f7073"></a>

<a id="alertdialogbackdropprops"></a>

<a id="api-416c6572744469616c6f672e4261636b64726f702e50726f70732e70726f703a616c69676e"></a>

### Related exported type: AlertDialog.Backdrop.Props

Declaration: `packages/solid/build/types/dialog/backdrop/DialogBackdrop.d.ts:11`

#### Declaration

```typescript
DialogBackdropProps
```

<a id="api-416c6572744469616c6f672e4261636b64726f702e50726f70732e666f72636552656e646572"></a>

<a id="AlertDialogBackdropProps-forceRender"></a>

<a id="api-416c6572744469616c6f672e4261636b64726f702e50726f70732e636c617373"></a>

<a id="AlertDialogBackdropProps-class"></a>

<a id="api-416c6572744469616c6f672e4261636b64726f702e50726f70732e7374796c65"></a>

<a id="AlertDialogBackdropProps-style"></a>

<a id="api-416c6572744469616c6f672e4261636b64726f702e50726f70732e72656e646572"></a>

<a id="AlertDialogBackdropProps-render"></a>

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

<a id="api-416c6572744469616c6f672e4261636b64726f702e5374617465"></a>

<a id="alertdialogbackdropstate"></a>

### Related exported type: AlertDialog.Backdrop.State

Declaration: `packages/solid/build/types/dialog/backdrop/DialogBackdrop.d.ts:12`

#### Declaration

```typescript
DialogBackdropState
```

<a id="api-416c6572744469616c6f672e4261636b64726f702e53746174652e6f70656e"></a>

<a id="AlertDialogBackdropState-open"></a>

<a id="api-416c6572744469616c6f672e4261636b64726f702e53746174652e7472616e736974696f6e537461747573"></a>

<a id="AlertDialogBackdropState-transitionStatus"></a>

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

<a id="api-416c6572744469616c6f672e56696577706f7274"></a>

<a id="alertdialogviewport"></a>

<a id="api-416c6572744469616c6f672e56696577706f72742e2470726f70732e70726f703a616c69676e"></a>

### AlertDialog.Viewport

Declaration: `packages/solid/build/types/dialog/viewport/DialogViewport.d.ts:3`

#### Declaration

```typescript
(props: DialogViewportProps) => JSX.Element
```

<a id="api-416c6572744469616c6f672e56696577706f72742e2470726f70732e636c617373"></a>

<a id="AlertDialogViewport-class"></a>

<a id="api-416c6572744469616c6f672e56696577706f72742e2470726f70732e7374796c65"></a>

<a id="AlertDialogViewport-style"></a>

<a id="api-416c6572744469616c6f672e56696577706f72742e2470726f70732e72656e646572"></a>

<a id="AlertDialogViewport-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<AlertDialogViewportState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AlertDialogViewportState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, AlertDialogViewportState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-416c6572744469616c6f672e56696577706f72742e64617461417474726962757465732e6f70656e"></a>

<a id="api-416c6572744469616c6f672e56696577706f72742e64617461417474726962757465732e636c6f736564"></a>

<a id="api-416c6572744469616c6f672e56696577706f72742e64617461417474726962757465732e646174612d616e63686f722d68696464656e"></a>

<a id="api-416c6572744469616c6f672e56696577706f72742e64617461417474726962757465732e6e6573746564"></a>

<a id="api-416c6572744469616c6f672e56696577706f72742e64617461417474726962757465732e6e65737465644469616c6f674f70656e"></a>

<a id="api-416c6572744469616c6f672e56696577706f72742e64617461417474726962757465732e7374617274696e675374796c65"></a>

<a id="api-416c6572744469616c6f672e56696577706f72742e64617461417474726962757465732e656e64696e675374796c65"></a>

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

<a id="api-416c6572744469616c6f672e56696577706f72742e50726f7073"></a>

<a id="alertdialogviewportprops"></a>

<a id="api-416c6572744469616c6f672e56696577706f72742e50726f70732e70726f703a616c69676e"></a>

### Related exported type: AlertDialog.Viewport.Props

Declaration: `packages/solid/build/types/dialog/viewport/DialogViewport.d.ts:9`

#### Declaration

```typescript
DialogViewportProps
```

<a id="api-416c6572744469616c6f672e56696577706f72742e50726f70732e636c617373"></a>

<a id="AlertDialogViewportProps-class"></a>

<a id="api-416c6572744469616c6f672e56696577706f72742e50726f70732e7374796c65"></a>

<a id="AlertDialogViewportProps-style"></a>

<a id="api-416c6572744469616c6f672e56696577706f72742e50726f70732e72656e646572"></a>

<a id="AlertDialogViewportProps-render"></a>

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

<a id="api-416c6572744469616c6f672e56696577706f72742e5374617465"></a>

<a id="alertdialogviewportstate"></a>

### Related exported type: AlertDialog.Viewport.State

Declaration: `packages/solid/build/types/dialog/viewport/DialogViewport.d.ts:10`

#### Declaration

```typescript
DialogViewportState
```

<a id="api-416c6572744469616c6f672e56696577706f72742e53746174652e6f70656e"></a>

<a id="AlertDialogViewportState-open"></a>

<a id="api-416c6572744469616c6f672e56696577706f72742e53746174652e6e6573746564"></a>

<a id="AlertDialogViewportState-nested"></a>

<a id="api-416c6572744469616c6f672e56696577706f72742e53746174652e6e65737465644469616c6f674f70656e"></a>

<a id="AlertDialogViewportState-nestedDialogOpen"></a>

<a id="api-416c6572744469616c6f672e56696577706f72742e53746174652e7472616e736974696f6e537461747573"></a>

<a id="AlertDialogViewportState-transitionStatus"></a>

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

<a id="api-416c6572744469616c6f672e506f707570"></a>

<a id="alertdialogpopup"></a>

<a id="api-416c6572744469616c6f672e506f7075702e2470726f70732e70726f703a616c69676e"></a>

### AlertDialog.Popup

Declaration: `packages/solid/build/types/dialog/popup/DialogPopup.d.ts:10`

#### Declaration

```typescript
(props: DialogPopupProps) => JSX.Element
```

<a id="api-416c6572744469616c6f672e506f7075702e2470726f70732e696e697469616c466f637573"></a>

<a id="AlertDialogPopup-initialFocus"></a>

<a id="api-416c6572744469616c6f672e506f7075702e2470726f70732e66696e616c466f637573"></a>

<a id="AlertDialogPopup-finalFocus"></a>

<a id="api-416c6572744469616c6f672e506f7075702e2470726f70732e6964"></a>

<a id="AlertDialogPopup-id"></a>

<a id="api-416c6572744469616c6f672e506f7075702e2470726f70732e636c617373"></a>

<a id="AlertDialogPopup-class"></a>

<a id="api-416c6572744469616c6f672e506f7075702e2470726f70732e7374796c65"></a>

<a id="AlertDialogPopup-style"></a>

<a id="api-416c6572744469616c6f672e506f7075702e2470726f70732e72656e646572"></a>

<a id="AlertDialogPopup-render"></a>

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

<a id="api-416c6572744469616c6f672e506f7075702e64617461417474726962757465732e6f70656e"></a>

<a id="api-416c6572744469616c6f672e506f7075702e64617461417474726962757465732e636c6f736564"></a>

<a id="api-416c6572744469616c6f672e506f7075702e64617461417474726962757465732e646174612d616e63686f722d68696464656e"></a>

<a id="api-416c6572744469616c6f672e506f7075702e64617461417474726962757465732e6e6573746564"></a>

<a id="api-416c6572744469616c6f672e506f7075702e64617461417474726962757465732e6e65737465644469616c6f674f70656e"></a>

<a id="api-416c6572744469616c6f672e506f7075702e64617461417474726962757465732e7374617274696e675374796c65"></a>

<a id="api-416c6572744469616c6f672e506f7075702e64617461417474726962757465732e656e64696e675374796c65"></a>

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

<a id="api-416c6572744469616c6f672e506f7075702e6373735661726961626c65732e6e65737465644469616c6f6773"></a>

| Name | Description |
| --- | --- |
| --nested-dialogs |  |

<a id="api-416c6572744469616c6f672e506f7075702e50726f7073"></a>

<a id="alertdialogpopupprops"></a>

<a id="api-416c6572744469616c6f672e506f7075702e50726f70732e70726f703a616c69676e"></a>

### Related exported type: AlertDialog.Popup.Props

Declaration: `packages/solid/build/types/dialog/popup/DialogPopup.d.ts:23`

#### Declaration

```typescript
DialogPopupProps
```

<a id="api-416c6572744469616c6f672e506f7075702e50726f70732e696e697469616c466f637573"></a>

<a id="AlertDialogPopupProps-initialFocus"></a>

<a id="api-416c6572744469616c6f672e506f7075702e50726f70732e66696e616c466f637573"></a>

<a id="AlertDialogPopupProps-finalFocus"></a>

<a id="api-416c6572744469616c6f672e506f7075702e50726f70732e6964"></a>

<a id="AlertDialogPopupProps-id"></a>

<a id="api-416c6572744469616c6f672e506f7075702e50726f70732e636c617373"></a>

<a id="AlertDialogPopupProps-class"></a>

<a id="api-416c6572744469616c6f672e506f7075702e50726f70732e7374796c65"></a>

<a id="AlertDialogPopupProps-style"></a>

<a id="api-416c6572744469616c6f672e506f7075702e50726f70732e72656e646572"></a>

<a id="AlertDialogPopupProps-render"></a>

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

<a id="api-416c6572744469616c6f672e506f7075702e5374617465"></a>

<a id="alertdialogpopupstate"></a>

### Related exported type: AlertDialog.Popup.State

Declaration: `packages/solid/build/types/dialog/popup/DialogPopup.d.ts:24`

#### Declaration

```typescript
DialogPopupState
```

<a id="api-416c6572744469616c6f672e506f7075702e53746174652e6f70656e"></a>

<a id="AlertDialogPopupState-open"></a>

<a id="api-416c6572744469616c6f672e506f7075702e53746174652e6e6573746564"></a>

<a id="AlertDialogPopupState-nested"></a>

<a id="api-416c6572744469616c6f672e506f7075702e53746174652e6e65737465644469616c6f674f70656e"></a>

<a id="AlertDialogPopupState-nestedDialogOpen"></a>

<a id="api-416c6572744469616c6f672e506f7075702e53746174652e7472616e736974696f6e537461747573"></a>

<a id="AlertDialogPopupState-transitionStatus"></a>

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

<a id="api-416c6572744469616c6f672e5469746c65"></a>

<a id="alertdialogtitle"></a>

<a id="api-416c6572744469616c6f672e5469746c652e2470726f70732e70726f703a616c69676e"></a>

### AlertDialog.Title

Declaration: `packages/solid/build/types/dialog/title/DialogTitle.d.ts:2`

#### Declaration

```typescript
(props: DialogTitleProps) => JSX.Element
```

<a id="api-416c6572744469616c6f672e5469746c652e2470726f70732e6964"></a>

<a id="AlertDialogTitle-id"></a>

<a id="api-416c6572744469616c6f672e5469746c652e2470726f70732e636c617373"></a>

<a id="AlertDialogTitle-class"></a>

<a id="api-416c6572744469616c6f672e5469746c652e2470726f70732e7374796c65"></a>

<a id="AlertDialogTitle-style"></a>

<a id="api-416c6572744469616c6f672e5469746c652e2470726f70732e72656e646572"></a>

<a id="AlertDialogTitle-render"></a>

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

<a id="api-416c6572744469616c6f672e5469746c652e50726f7073"></a>

<a id="alertdialogtitleprops"></a>

<a id="api-416c6572744469616c6f672e5469746c652e50726f70732e70726f703a616c69676e"></a>

### Related exported type: AlertDialog.Title.Props

Declaration: `packages/solid/build/types/dialog/title/DialogTitle.d.ts:9`

#### Declaration

```typescript
DialogTitleProps
```

<a id="api-416c6572744469616c6f672e5469746c652e50726f70732e6964"></a>

<a id="AlertDialogTitleProps-id"></a>

<a id="api-416c6572744469616c6f672e5469746c652e50726f70732e636c617373"></a>

<a id="AlertDialogTitleProps-class"></a>

<a id="api-416c6572744469616c6f672e5469746c652e50726f70732e7374796c65"></a>

<a id="AlertDialogTitleProps-style"></a>

<a id="api-416c6572744469616c6f672e5469746c652e50726f70732e72656e646572"></a>

<a id="AlertDialogTitleProps-render"></a>

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

<a id="api-416c6572744469616c6f672e5469746c652e5374617465"></a>

<a id="alertdialogtitlestate"></a>

### Related exported type: AlertDialog.Title.State

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

<a id="api-416c6572744469616c6f672e4465736372697074696f6e"></a>

<a id="alertdialogdescription"></a>

<a id="api-416c6572744469616c6f672e4465736372697074696f6e2e2470726f70732e70726f703a616c69676e"></a>

### AlertDialog.Description

Declaration: `packages/solid/build/types/dialog/description/DialogDescription.d.ts:2`

#### Declaration

```typescript
(props: DialogDescriptionProps) => JSX.Element
```

<a id="api-416c6572744469616c6f672e4465736372697074696f6e2e2470726f70732e6964"></a>

<a id="AlertDialogDescription-id"></a>

<a id="api-416c6572744469616c6f672e4465736372697074696f6e2e2470726f70732e636c617373"></a>

<a id="AlertDialogDescription-class"></a>

<a id="api-416c6572744469616c6f672e4465736372697074696f6e2e2470726f70732e7374796c65"></a>

<a id="AlertDialogDescription-style"></a>

<a id="api-416c6572744469616c6f672e4465736372697074696f6e2e2470726f70732e72656e646572"></a>

<a id="AlertDialogDescription-render"></a>

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

<a id="api-416c6572744469616c6f672e4465736372697074696f6e2e50726f7073"></a>

<a id="alertdialogdescriptionprops"></a>

<a id="api-416c6572744469616c6f672e4465736372697074696f6e2e50726f70732e70726f703a616c69676e"></a>

### Related exported type: AlertDialog.Description.Props

Declaration: `packages/solid/build/types/dialog/description/DialogDescription.d.ts:9`

#### Declaration

```typescript
DialogDescriptionProps
```

<a id="api-416c6572744469616c6f672e4465736372697074696f6e2e50726f70732e6964"></a>

<a id="AlertDialogDescriptionProps-id"></a>

<a id="api-416c6572744469616c6f672e4465736372697074696f6e2e50726f70732e636c617373"></a>

<a id="AlertDialogDescriptionProps-class"></a>

<a id="api-416c6572744469616c6f672e4465736372697074696f6e2e50726f70732e7374796c65"></a>

<a id="AlertDialogDescriptionProps-style"></a>

<a id="api-416c6572744469616c6f672e4465736372697074696f6e2e50726f70732e72656e646572"></a>

<a id="AlertDialogDescriptionProps-render"></a>

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

<a id="api-416c6572744469616c6f672e4465736372697074696f6e2e5374617465"></a>

<a id="alertdialogdescriptionstate"></a>

### Related exported type: AlertDialog.Description.State

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

<a id="api-416c6572744469616c6f672e436c6f7365"></a>

<a id="alertdialogclose"></a>

<a id="api-416c6572744469616c6f672e436c6f73652e2470726f70732e70726f703a64697361626c6564"></a>

<a id="api-416c6572744469616c6f672e436c6f73652e2470726f70732e70726f703a666f726d416374696f6e"></a>

<a id="api-416c6572744469616c6f672e436c6f73652e2470726f70732e70726f703a666f726d456e6374797065"></a>

<a id="api-416c6572744469616c6f672e436c6f73652e2470726f70732e70726f703a666f726d4d6574686f64"></a>

<a id="api-416c6572744469616c6f672e436c6f73652e2470726f70732e70726f703a666f726d4e6f56616c6964617465"></a>

<a id="api-416c6572744469616c6f672e436c6f73652e2470726f70732e70726f703a666f726d546172676574"></a>

<a id="api-416c6572744469616c6f672e436c6f73652e2470726f70732e70726f703a6e616d65"></a>

<a id="api-416c6572744469616c6f672e436c6f73652e2470726f70732e70726f703a706f706f766572546172676574416374696f6e"></a>

<a id="api-416c6572744469616c6f672e436c6f73652e2470726f70732e70726f703a706f706f766572546172676574456c656d656e74"></a>

<a id="api-416c6572744469616c6f672e436c6f73652e2470726f70732e70726f703a74797065"></a>

<a id="api-416c6572744469616c6f672e436c6f73652e2470726f70732e70726f703a76616c7565"></a>

### AlertDialog.Close

Declaration: `packages/solid/build/types/dialog/close/DialogClose.d.ts:2`

#### Declaration

```typescript
(props: DialogCloseProps) => JSX.Element
```

<a id="api-416c6572744469616c6f672e436c6f73652e2470726f70732e6e6174697665427574746f6e"></a>

<a id="AlertDialogClose-nativeButton"></a>

<a id="api-416c6572744469616c6f672e436c6f73652e2470726f70732e64697361626c6564"></a>

<a id="AlertDialogClose-disabled"></a>

<a id="api-416c6572744469616c6f672e436c6f73652e2470726f70732e636c617373"></a>

<a id="AlertDialogClose-class"></a>

<a id="api-416c6572744469616c6f672e436c6f73652e2470726f70732e7374796c65"></a>

<a id="AlertDialogClose-style"></a>

<a id="api-416c6572744469616c6f672e436c6f73652e2470726f70732e72656e646572"></a>

<a id="AlertDialogClose-render"></a>

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

<a id="api-416c6572744469616c6f672e436c6f73652e64617461417474726962757465732e64697361626c6564"></a>

| Name | Description |
| --- | --- |
| data-disabled |  |

#### CSS variables

Metadata status: unavailable.

<a id="api-416c6572744469616c6f672e436c6f73652e50726f7073"></a>

<a id="alertdialogcloseprops"></a>

<a id="api-416c6572744469616c6f672e436c6f73652e50726f70732e70726f703a64697361626c6564"></a>

<a id="api-416c6572744469616c6f672e436c6f73652e50726f70732e70726f703a666f726d416374696f6e"></a>

<a id="api-416c6572744469616c6f672e436c6f73652e50726f70732e70726f703a666f726d456e6374797065"></a>

<a id="api-416c6572744469616c6f672e436c6f73652e50726f70732e70726f703a666f726d4d6574686f64"></a>

<a id="api-416c6572744469616c6f672e436c6f73652e50726f70732e70726f703a666f726d4e6f56616c6964617465"></a>

<a id="api-416c6572744469616c6f672e436c6f73652e50726f70732e70726f703a666f726d546172676574"></a>

<a id="api-416c6572744469616c6f672e436c6f73652e50726f70732e70726f703a6e616d65"></a>

<a id="api-416c6572744469616c6f672e436c6f73652e50726f70732e70726f703a706f706f766572546172676574416374696f6e"></a>

<a id="api-416c6572744469616c6f672e436c6f73652e50726f70732e70726f703a706f706f766572546172676574456c656d656e74"></a>

<a id="api-416c6572744469616c6f672e436c6f73652e50726f70732e70726f703a74797065"></a>

<a id="api-416c6572744469616c6f672e436c6f73652e50726f70732e70726f703a76616c7565"></a>

### Related exported type: AlertDialog.Close.Props

Declaration: `packages/solid/build/types/dialog/close/DialogClose.d.ts:11`

#### Declaration

```typescript
DialogCloseProps
```

<a id="api-416c6572744469616c6f672e436c6f73652e50726f70732e6e6174697665427574746f6e"></a>

<a id="AlertDialogCloseProps-nativeButton"></a>

<a id="api-416c6572744469616c6f672e436c6f73652e50726f70732e64697361626c6564"></a>

<a id="AlertDialogCloseProps-disabled"></a>

<a id="api-416c6572744469616c6f672e436c6f73652e50726f70732e636c617373"></a>

<a id="AlertDialogCloseProps-class"></a>

<a id="api-416c6572744469616c6f672e436c6f73652e50726f70732e7374796c65"></a>

<a id="AlertDialogCloseProps-style"></a>

<a id="api-416c6572744469616c6f672e436c6f73652e50726f70732e72656e646572"></a>

<a id="AlertDialogCloseProps-render"></a>

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

<a id="api-416c6572744469616c6f672e436c6f73652e5374617465"></a>

<a id="alertdialogclosestate"></a>

### Related exported type: AlertDialog.Close.State

Declaration: `packages/solid/build/types/dialog/close/DialogClose.d.ts:12`

#### Declaration

```typescript
DialogCloseState
```

<a id="api-416c6572744469616c6f672e436c6f73652e53746174652e64697361626c6564"></a>

<a id="AlertDialogCloseState-disabled"></a>

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

<a id="api-416c6572744469616c6f672e63726561746548616e646c65"></a>

<a id="alertdialogcreatehandle"></a>

### AlertDialog.createHandle

Declaration: `packages/solid/build/types/alert-dialog/handle.d.ts:6`

#### Declaration

```typescript
<Payload>() => AlertDialogHandle<Payload>
```

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

#### Return value

```typescript
AlertDialogHandle<Payload>
```

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| __alertDialogBrand | `any` | Yes | Unavailable |  |
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

<a id="api-416c6572744469616c6f672e48616e646c65"></a>

<a id="alertdialoghandle"></a>

### AlertDialog.Handle

Connects detached triggers to a mounted alert dialog root.

Declaration: `packages/solid/build/types/alert-dialog/handle.d.ts:3`

#### Declaration

```typescript
AlertDialogHandle<Payload>
```

<a id="api-416c6572744469616c6f672e48616e646c652e6f70656e"></a>

<a id="AlertDialogHandle-open"></a>

<a id="api-416c6572744469616c6f672e48616e646c652e5f5f616c6572744469616c6f674272616e64"></a>

<a id="AlertDialogHandle-__alertDialogBrand"></a>

<a id="api-416c6572744469616c6f672e48616e646c652e6163746976617465"></a>

<a id="AlertDialogHandle-activate"></a>

<a id="api-416c6572744469616c6f672e48616e646c652e61747461636853746f7265"></a>

<a id="AlertDialogHandle-attachStore"></a>

<a id="api-416c6572744469616c6f672e48616e646c652e6174746163686564"></a>

<a id="AlertDialogHandle-attached"></a>

<a id="api-416c6572744469616c6f672e48616e646c652e617474616368656453746f7265"></a>

<a id="AlertDialogHandle-attachedStore"></a>

<a id="api-416c6572744469616c6f672e48616e646c652e636c6f7365"></a>

<a id="AlertDialogHandle-close"></a>

<a id="api-416c6572744469616c6f672e48616e646c652e636c6f7365506f707570"></a>

<a id="AlertDialogHandle-closePopup"></a>

<a id="api-416c6572744469616c6f672e48616e646c652e636f6d706f6e656e744e616d65"></a>

<a id="AlertDialogHandle-componentName"></a>

<a id="api-416c6572744469616c6f672e48616e646c652e63757272656e74"></a>

<a id="AlertDialogHandle-current"></a>

<a id="api-416c6572744469616c6f672e48616e646c652e66616c6c6261636b53746f7265"></a>

<a id="AlertDialogHandle-fallbackStore"></a>

<a id="api-416c6572744469616c6f672e48616e646c652e69734f70656e"></a>

<a id="AlertDialogHandle-isOpen"></a>

<a id="api-416c6572744469616c6f672e48616e646c652e6f70656e427954726967676572"></a>

<a id="AlertDialogHandle-openByTrigger"></a>

<a id="api-416c6572744469616c6f672e48616e646c652e6f70656e576974685061796c6f6164"></a>

<a id="AlertDialogHandle-openWithPayload"></a>

<a id="api-416c6572744469616c6f672e48616e646c652e73657276657253746f7265"></a>

<a id="AlertDialogHandle-serverStore"></a>

<a id="api-416c6572744469616c6f672e48616e646c652e7365744f70656e4d6574686f64"></a>

<a id="AlertDialogHandle-setOpenMethod"></a>

<a id="api-416c6572744469616c6f672e48616e646c652e73746f7265"></a>

<a id="AlertDialogHandle-store"></a>

<a id="api-416c6572744469616c6f672e48616e646c652e7468726f774f6e4d697373696e6754726967676572"></a>

<a id="AlertDialogHandle-throwOnMissingTrigger"></a>

<a id="api-416c6572744469616c6f672e48616e646c652e76657273696f6e"></a>

<a id="AlertDialogHandle-version"></a>

<a id="api-416c6572744469616c6f672e48616e646c652e7761726e696e67"></a>

<a id="AlertDialogHandle-warning"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| open | `(triggerId: string \| null) => void` | Yes | Unavailable |  |
| __alertDialogBrand | `any` | Yes | Unavailable |  |
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

