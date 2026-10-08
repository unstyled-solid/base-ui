# Menu

A list of actions in a dropdown, enhanced with keyboard navigation.



[Interactive example](/solid/components/menu)

## Anatomy

Import the component and assemble its parts:

```tsx
import { Menu } from 'baseui-solid2/menu';
<Menu.FilterProvider>
  <Menu.Root>
    <Menu.Trigger />
    <Menu.Portal>
      <Menu.Backdrop />
      <Menu.Positioner>
        <Menu.Popup>
          <Menu.Arrow />
          <Menu.Input />
          <Menu.Clear />
          <Menu.Empty />

          <Menu.List>
            <Menu.Item />
            <Menu.LinkItem />
            <Menu.Separator />

            <Menu.SubmenuRoot>
              <Menu.SubmenuTrigger />
            </Menu.SubmenuRoot>

            <Menu.Group>
              <Menu.GroupLabel />
            </Menu.Group>

            <Menu.RadioGroup>
              <Menu.GroupLabel />
              <Menu.RadioItem>
                <Menu.RadioItemIndicator />
              </Menu.RadioItem>
            </Menu.RadioGroup>

            <Menu.CheckboxItem>
              <Menu.CheckboxItemIndicator />
            </Menu.CheckboxItem>
          </Menu.List>

          <Menu.Viewport />
        </Menu.Popup>
      </Menu.Positioner>
    </Menu.Portal>
  </Menu.Root>
</Menu.FilterProvider>;
```

## Examples

### Open on hover

To create a menu that opens on hover, add the `openOnHover` prop to `<Menu.Trigger>`. You can additionally configure how quickly the menu opens on hover using the `delay` prop.

[Interactive example](/solid/components/menu)

### Checkbox items

Use the `<Menu.CheckboxItem>` part to create a menu item that can toggle a setting on or off.

[Interactive example](/solid/components/menu)

### Radio items

Use the `<Menu.RadioGroup>` and `<Menu.RadioItem>` parts to create menu items that work like radio buttons.

[Interactive example](/solid/components/menu)

### Close on click

Use the `closeOnClick` prop to change whether the menu closes when an item is clicked.

```tsx
// Close the menu when a checkbox item is clicked
<Menu.CheckboxItem closeOnClick />

// Keep the menu open when an item is clicked
<Menu.Item closeOnClick={false} />
```

### Group labels

Use the `<Menu.GroupLabel>` part to add a label to a `<Menu.Group>` or `<Menu.RadioGroup>`.

[Interactive example](/solid/components/menu)

### Nested menu

To create a submenu, nest another menu inside the parent menu with `<Menu.SubmenuRoot>`. Use the `<Menu.SubmenuTrigger>` part for the menu item that opens the nested menu.

```tsx
<Menu.Root>
  <Menu.Trigger />
  <Menu.Portal>
    <Menu.Positioner>
      <Menu.Popup>
        <Menu.Item />

        {/* Submenu */}
        <Menu.SubmenuRoot>
          <Menu.SubmenuTrigger />
          <Menu.Portal>
            <Menu.Positioner>
              <Menu.Popup>{/* Submenu items  */}</Menu.Popup>
            </Menu.Positioner>
          </Menu.Portal>
        </Menu.SubmenuRoot>
      </Menu.Popup>
    </Menu.Positioner>
  </Menu.Portal>
</Menu.Root>;
```

[Interactive example](/solid/components/menu)

### Navigate to another page

Use the `<Menu.LinkItem>` part to create a link.

```tsx
<Menu.LinkItem href="/projects">Go to Projects</Menu.LinkItem>;
```

### Open a dialog

In order to open a dialog using a menu, control the dialog state and open it imperatively using the `onClick` handler on the menu item.

```tsx
import { createSignal } from 'solid-js';
import { Dialog } from 'baseui-solid2/dialog';
import { Menu } from 'baseui-solid2/menu';
function ExampleMenu() {
  const [dialogOpen, setDialogOpen] = createSignal(false);
  return (
    <>
      <Menu.Root>
        <Menu.Trigger>Open menu</Menu.Trigger>
        <Menu.Portal>
          <Menu.Positioner>
            <Menu.Popup>
              {/* Open the dialog when the menu item is clicked */}
              <Menu.Item onClick={() => setDialogOpen(true)}>Open dialog</Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>

      {/* Control the dialog state */}
      <Dialog.Root open={dialogOpen()} onOpenChange={setDialogOpen}>
        <Dialog.Portal>
          <Dialog.Backdrop />
          <Dialog.Popup>{/* Rest of the dialog */}</Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
```

### Detached triggers

A menu can be opened by a trigger that lives either inside or outside the `<Menu.Root>`.
Keep the trigger inside `<Menu.Root>` for simple, tightly coupled layouts like the hero demo at the top of this page.
When the trigger and menu content need to live in different parts of the tree (for example, in a card list that controls a menu rendered near the document root), create a `handle` with `Menu.createHandle()` and pass it to both the trigger and the root.

Note that only top-level menus can have detached triggers.
Submenus must have their triggers defined within the `SubmenuRoot` part.

The imperative methods on the handle, such as `open()` and `close()`, require a `<Menu.Root>` using the same handle to be mounted.
Calls made while no root is attached to the handle — before one mounts, or after it unmounts — are ignored. Each time a root mounts, it starts from fresh state: a call made while no root was attached is not replayed, and no open state carries over from a previous mount.

```tsx
const demoMenu = Menu.createHandle();



<Menu.Trigger handle={demoMenu}>
  Actions
</Menu.Trigger>



<Menu.Root handle={demoMenu}>
  <Menu.Portal>
    <Menu.Positioner>
      <Menu.Popup>
        <Menu.Item>Edit</Menu.Item>
        <Menu.Item>Share</Menu.Item>
      </Menu.Popup>
    </Menu.Positioner>
  </Menu.Portal>
</Menu.Root>
```

[Interactive example](/solid/components/menu)

### Multiple triggers

One menu can be opened by several triggers.
You can either render multiple `<Menu.Trigger>` components inside the same `<Menu.Root>`, or attach several detached triggers to the same `handle`.

```tsx
<Menu.Root>
  <Menu.Trigger>Row actions</Menu.Trigger>
  <Menu.Trigger>Quick actions</Menu.Trigger>
  {/* Rest of the menu */}
</Menu.Root>;
```

```tsx
const projectMenu = Menu.createHandle();

<Menu.Trigger handle={projectMenu}>Row actions</Menu.Trigger>
<Menu.Trigger handle={projectMenu}>Quick actions</Menu.Trigger>

<Menu.Root handle={projectMenu}>
  {/* Rest of the menu */}
</Menu.Root>
```

Menus can render different content depending on which trigger opened them.
Pass a `payload` prop to each `<Menu.Trigger>` and read it via a function child on `<Menu.Root>`.
Provide a type argument to `createHandle()` to strongly type the payload.

```tsx
const menus = {
  file: ['New', 'Open', 'Save'],
  edit: ['Undo', 'Redo', 'Cut', 'Copy', 'Paste'],
}


const demoMenu = Menu.createHandle<{ items: string[] }>();



<Menu.Trigger handle={demoMenu} payload={{ items: menus.file }}>
  File
</Menu.Trigger>



<Menu.Trigger handle={demoMenu} payload={{ items: menus.edit }}>
  Edit
</Menu.Trigger>

<Menu.Root handle={demoMenu}>
  {({ payload }) => ( 
    <Menu.Portal>
      <Menu.Positioner>
        <Menu.Popup>
          <Menu.Viewport>
            {(payload?.items ?? []).map((item) => ( 
              <Menu.Item key={item}>{item}</Menu.Item>
            ))}
          </Menu.Viewport>
        </Menu.Popup>
      </Menu.Positioner>
    </Menu.Portal>
  )}
</Menu.Root>
```

### Controlled mode with multiple triggers

Control a menu's open state externally with the `open` and `onOpenChange` props on `<Menu.Root>`.
When more than one trigger can open the menu, track the active trigger with the `triggerId` prop on `<Menu.Root>` and matching `id` props on each `<Menu.Trigger>`.
The `onOpenChange` callback receives `eventDetails`, which includes the DOM element that initiated the change, so you can update your `triggerId` state when the user activates a different trigger.

[Interactive example](/solid/components/menu)

### Arrow

Use the `<Menu.Arrow>` part inside the popup to visually connect the menu to its trigger.

[Interactive example](/solid/components/menu)

### Animating the Menu

When one menu is opened by multiple detached triggers, you can animate the menu as it moves between triggers.
This includes animating position, size, and content.

#### Position and Size

To animate the menu's position, apply CSS transitions to the `left`, `right`, `top`, and `bottom` properties of the **Positioner** part.
To animate its size, transition the `width` and `height` of the **Popup** part.

#### Content

The menu also supports content transitions.
This is useful when different triggers display different content within the same menu.

To enable content animations, wrap the menu content in the `<Menu.Viewport>` part.
This part renders a `div` with `data-activation-direction`, containing up to two space-separated tokens — a horizontal (`left` or `right`) and a vertical (`up` or `down`) value — so you can make direction-aware animations.

Inside `<Menu.Viewport>`, content is wrapped in `div`s with transition data attributes:

- `data-current`: The currently visible content when no transitions are present or the incoming content.
- `data-previous`: The outgoing content during a transition.

[Interactive example](/solid/components/menu)

### Filtering

Wrap `<Menu.Root>` in `<Menu.FilterProvider>`, add `<Menu.Input>` to the popup, and put the items inside `<Menu.List>`.

```tsx
<Menu.FilterProvider>
  <Menu.Root>
    <Menu.Trigger>Actions</Menu.Trigger>
    <Menu.Portal>
      <Menu.Positioner>
        <Menu.Popup>
          <Menu.Input aria-label="Filter actions" />
          <Menu.Clear>Clear</Menu.Clear>
          <Menu.Empty>No results.</Menu.Empty>
          <Menu.List>
            <Menu.Item>Rename</Menu.Item>
            <Menu.Item>Delete</Menu.Item>
          </Menu.List>
        </Menu.Popup>
      </Menu.Positioner>
    </Menu.Portal>
  </Menu.Root>
</Menu.FilterProvider>;
```

Label the input with `aria-label`, `aria-labelledby`, or a visible `<label>`.
Type to narrow the actions, then use the arrow keys to move through matching items.

[Interactive example](/solid/components/menu)

#### Matching items

Items match their text by default. Use `label` to override it.

```tsx
<Menu.Item label="Move to folder">Move</Menu.Item>;
```

Groups with no matching items get the `hidden` attribute and stay mounted. If your styles set `display` on a group, add a `[hidden]` rule so it still hides.

```css
.Group {
  display: flex;
}

.Group[hidden] {
  display: none;
}
```

`<Menu.Empty>` appears when no items match.

By default, an item matches when its text contains the query, ignoring case, accents, and punctuation.
Use `filter` to replace the matching. It receives each item's text and the trimmed query, and keeps the item when it returns `true`.
`Menu.useFilter` provides the same locale-aware comparisons.

```tsx
const { startsWith } = Menu.useFilter();
<Menu.FilterProvider filter={startsWith}>
  <Menu.Root>{/* menu parts */}</Menu.Root>
</Menu.FilterProvider>;
```

For external filtering, pass `filter={null}` and render the results yourself, omitting empty groups.

```tsx
import { createMemo, createSignal } from 'solid-js';
const { contains } = Menu.useFilter();
const [query, setQuery] = createSignal('');
const results = createMemo(() =>
  actions.filter((action) => contains(action.label, query())),
);
<Menu.FilterProvider filter={null} value={query()} onValueChange={setQuery}>
  <Menu.Root>{/* render `results` */}</Menu.Root>
</Menu.FilterProvider>;
```

#### Controlling the query

`value` and `onValueChange` on `<Menu.FilterProvider>` control the query.
It resets to an empty string when the menu closes, reported with the `'popup-close'` reason. Cancel that change to keep the query.

#### Highlighting

Use `autoHighlight` to highlight the first match while filtering, or `autoHighlight="always"` to highlight it even when the query is empty.
The highlighted item has the `data-highlighted` attribute, and `onItemHighlighted` on `<Menu.Root>` reports each change.

#### Focus and keyboard

Opening the menu with a click or the keyboard focuses the input. Opening it on hover, touch, or with a pen does not, so the on-screen keyboard stays hidden.
The arrow keys move the highlight while the input keeps focus. Tab

 closes the menu, and Shift

+Tab

 returns focus to the trigger.
The popup is a `dialog` that holds the `searchbox` input and the `menu` list.

#### Submenus

Wrap each searchable `<Menu.SubmenuRoot>` in its own `<Menu.FilterProvider>`.
Submenus without a provider remain unfiltered.

#### Filtering with detached triggers

Use the same `Menu.createHandle()` handle for the root and its detached trigger:

```tsx
const handle = Menu.createHandle();

<Menu.Trigger handle={handle}>Actions</Menu.Trigger>
<Menu.FilterProvider>
  <Menu.Root handle={handle}>{/* menu parts */}</Menu.Root>
</Menu.FilterProvider>
```

### Custom keyboard shortcuts

`<Menu.Root>` accepts an `actionsRef` whose `highlightItem()` action moves the highlight to the `'next'`, `'previous'`, `'first'` or `'last'` item, or clears it with `'none'`. Use it to bind shortcuts beyond the built-in arrow keys. Menu items receive real DOM focus, so the action moves focus along with the highlight, and `'none'` hands focus back to the popup. It wraps around at the ends unless `loopFocus` is disabled, and does nothing while the menu is closed.

Because the items hold focus while the menu is open, attach the key handler to `<Menu.Popup>` rather than to the trigger:

```tsx
let actionsRef: Menu.Root.Actions | null = null;
<Menu.Root
  actionsRef={(value) => {
    actionsRef = value;
  }}
>
  <Menu.Trigger>Open</Menu.Trigger>
  <Menu.Portal>
    <Menu.Positioner>
      <Menu.Popup
        onKeyDown={(event) => {
          if (event.ctrlKey && event.key === 'j') {
            event.preventDefault();
            actionsRef?.highlightItem('next');
          }
        }}
      >
        {/* items */}
      </Menu.Popup>
    </Menu.Positioner>
  </Menu.Portal>
</Menu.Root>;
```

In a filterable menu, `<Menu.Input>` keeps focus while the action moves the highlight, and it treats modified character keys as text editing, so attach the handler to `<Menu.Input>` instead.

## API reference

### FilterProvider



| Prop | Type | Description |
| --- | --- | --- |
| defaultValue | string \| undefined |  |
| value | string \| undefined |  |
| onValueChange | ((value: string, details: FilterDropdownRootChangeEventDetails) => void) \| undefined |  |
| autoHighlight | boolean \| "always" \| undefined |  |
| filter | ((text: string, query: string) => boolean) \| null \| undefined |  |
| locale | Intl.LocalesArgument |  |
| children | JSX.Element |  |

### Root



| Prop | Type | Description |
| --- | --- | --- |
| defaultOpen | boolean \| undefined |  |
| open | boolean \| undefined |  |
| onOpenChange | ((open: boolean, details: MenuRootChangeEventDetails) => void) \| undefined |  |
| highlightItemOnHover | boolean \| undefined |  |
| actionsRef | MutableCell<MenuRootActions \| null> \| undefined |  |
| closeParentOnEsc | boolean \| undefined |  |
| defaultTriggerId | string \| null \| undefined |  |
| handle | MenuHandle<Payload> \| undefined |  |
| loopFocus | boolean \| undefined |  |
| modal | boolean \| undefined |  |
| onItemHighlighted | ((item: HTMLElement \| undefined, details: MenuRootHighlightEventDetails) => void) \| undefined |  |
| onOpenChangeComplete | ((open: boolean) => void) \| undefined |  |
| triggerId | string \| null \| undefined |  |
| disabled | boolean \| undefined |  |
| orientation | MenuRootOrientation \| undefined |  |
| children | JSX.Element \| ((data: { payload: Payload \| undefined; }) => JSX.Element) |  |

### Trigger



| Prop | Type | Description |
| --- | --- | --- |
| handle | MenuHandle<Payload> \| undefined |  |
| nativeButton | boolean \| undefined |  |
| payload | Payload \| undefined |  |
| disabled | boolean \| undefined |  |
| openOnHover | boolean \| undefined |  |
| delay | number \| undefined |  |
| closeDelay | number \| undefined |  |
| class | JSX.ClassValue \| ((state: Readonly<MenuTriggerState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<MenuTriggerState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, MenuTriggerState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Portal



| Prop | Type | Description |
| --- | --- | --- |
| container | PortalContainer |  |
| class | JSX.ClassValue \| ((state: Readonly<ContextMenuPortalState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ContextMenuPortalState>) => StyleValue) |  |
| keepMounted | boolean \| undefined |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ContextMenuPortalState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Backdrop



| Prop | Type | Description |
| --- | --- | --- |
| class | JSX.ClassValue \| ((state: Readonly<ContextMenuBackdropState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ContextMenuBackdropState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ContextMenuBackdropState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

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
| class | JSX.ClassValue \| ((state: Readonly<MenuPositionerState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<MenuPositionerState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, MenuPositionerState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Popup



| Prop | Type | Description |
| --- | --- | --- |
| finalFocus | boolean \| (() => HTMLElement \| null) \| ((closeType: InteractionType) => boolean \| HTMLElement \| null \| void) \| undefined |  |
| class | JSX.ClassValue \| ((state: Readonly<ContextMenuPopupState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ContextMenuPopupState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ContextMenuPopupState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Viewport



| Prop | Type | Description |
| --- | --- | --- |
| class | JSX.ClassValue \| ((state: Readonly<MenuViewportState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<MenuViewportState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, MenuViewportState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

The `Viewport` is optional — reach for it only when a single popup is opened by multiple triggers, its content differs per trigger, and the switch between them is animated. When used, set `width: var(--positioner-width)` and `height: var(--positioner-height)` on the `Positioner` so its box is frozen to the measured size during the transition; otherwise content-driven resizing can make the popup thrash or flip to another side.

### Arrow



| Prop | Type | Description |
| --- | --- | --- |
| class | JSX.ClassValue \| ((state: Readonly<ContextMenuArrowState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ContextMenuArrowState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ContextMenuArrowState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Input



| Prop | Type | Description |
| --- | --- | --- |
| id | string \| null \| undefined |  |
| class | JSX.ClassValue \| ((state: Readonly<FilterDropdownInputState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<FilterDropdownInputState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, FilterDropdownInputState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Clear



| Prop | Type | Description |
| --- | --- | --- |
| nativeButton | boolean \| undefined |  |
| disabled | boolean \| undefined |  |
| class | JSX.ClassValue \| ((state: Readonly<FilterDropdownClearState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<FilterDropdownClearState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, FilterDropdownClearState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Empty



| Prop | Type | Description |
| --- | --- | --- |
| class | JSX.ClassValue \| ((state: Readonly<FilterDropdownEmptyState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<FilterDropdownEmptyState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, FilterDropdownEmptyState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### List



| Prop | Type | Description |
| --- | --- | --- |
| class | JSX.ClassValue \| ((state: Readonly<MenuListState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<MenuListState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, MenuListState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Item



| Prop | Type | Description |
| --- | --- | --- |
| label | string \| undefined |  |
| closeOnClick | boolean \| undefined |  |
| nativeButton | boolean \| undefined |  |
| disabled | boolean \| undefined |  |
| class | JSX.ClassValue \| ((state: Readonly<ContextMenuItemState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ContextMenuItemState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ContextMenuItemState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### LinkItem



| Prop | Type | Description |
| --- | --- | --- |
| label | string \| undefined |  |
| closeOnClick | boolean \| undefined |  |
| class | JSX.ClassValue \| ((state: Readonly<ContextMenuLinkItemState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ContextMenuLinkItemState>) => StyleValue) |  |
| render | ComponentRenderFn<JSX.AnchorHTMLAttributes<HTMLAnchorElement> & JSX.Properties<HTMLAnchorElement>, ContextMenuLinkItemState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### SubmenuRoot



| Prop | Type | Description |
| --- | --- | --- |
| defaultOpen | boolean \| undefined |  |
| open | boolean \| undefined |  |
| onOpenChange | ((open: boolean, details: MenuRootChangeEventDetails) => void) \| undefined |  |
| highlightItemOnHover | boolean \| undefined |  |
| actionsRef | MutableCell<MenuRootActions \| null> \| undefined |  |
| closeParentOnEsc | boolean \| undefined |  |
| loopFocus | boolean \| undefined |  |
| onItemHighlighted | ((item: HTMLElement \| undefined, details: MenuRootHighlightEventDetails) => void) \| undefined |  |
| onOpenChangeComplete | ((open: boolean) => void) \| undefined |  |
| disabled | boolean \| undefined |  |
| orientation | MenuRootOrientation \| undefined |  |
| children | JSX.Element |  |

### SubmenuTrigger



| Prop | Type | Description |
| --- | --- | --- |
| label | string \| undefined |  |
| nativeButton | boolean \| undefined |  |
| disabled | boolean \| undefined |  |
| openOnHover | boolean \| undefined |  |
| delay | number \| undefined |  |
| closeDelay | number \| undefined |  |
| class | JSX.ClassValue \| ((state: Readonly<ContextMenuSubmenuTriggerState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ContextMenuSubmenuTriggerState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ContextMenuSubmenuTriggerState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Group



| Prop | Type | Description |
| --- | --- | --- |
| class | JSX.ClassValue \| ((state: Readonly<ContextMenuGroupState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ContextMenuGroupState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ContextMenuGroupState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### GroupLabel



| Prop | Type | Description |
| --- | --- | --- |
| class | JSX.ClassValue \| ((state: Readonly<ContextMenuGroupLabelState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ContextMenuGroupLabelState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ContextMenuGroupLabelState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### RadioGroup



| Prop | Type | Description |
| --- | --- | --- |
| defaultValue | any |  |
| value | any |  |
| onValueChange | ((value: any, details: MenuRoot.ChangeEventDetails) => void) \| undefined |  |
| disabled | boolean \| undefined |  |
| class | JSX.ClassValue \| ((state: Readonly<ContextMenuRadioGroupState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ContextMenuRadioGroupState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ContextMenuRadioGroupState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### RadioItem



| Prop | Type | Description |
| --- | --- | --- |
| label | string \| undefined |  |
| value | any |  |
| closeOnClick | boolean \| undefined |  |
| nativeButton | boolean \| undefined |  |
| disabled | boolean \| undefined |  |
| class | JSX.ClassValue \| ((state: Readonly<ContextMenuRadioItemState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ContextMenuRadioItemState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ContextMenuRadioItemState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### RadioItemIndicator



| Prop | Type | Description |
| --- | --- | --- |
| class | JSX.ClassValue \| ((state: Readonly<MenuIndicatorState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<MenuIndicatorState>) => StyleValue) |  |
| keepMounted | boolean \| undefined |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, MenuIndicatorState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### CheckboxItem



| Prop | Type | Description |
| --- | --- | --- |
| label | string \| undefined |  |
| defaultChecked | boolean \| undefined |  |
| checked | boolean \| undefined |  |
| onCheckedChange | ((checked: boolean, details: MenuRoot.ChangeEventDetails) => void) \| undefined |  |
| closeOnClick | boolean \| undefined |  |
| nativeButton | boolean \| undefined |  |
| disabled | boolean \| undefined |  |
| class | JSX.ClassValue \| ((state: Readonly<ContextMenuCheckboxItemState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ContextMenuCheckboxItemState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ContextMenuCheckboxItemState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### CheckboxItemIndicator



| Prop | Type | Description |
| --- | --- | --- |
| class | JSX.ClassValue \| ((state: Readonly<MenuIndicatorState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<MenuIndicatorState>) => StyleValue) |  |
| keepMounted | boolean \| undefined |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, MenuIndicatorState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Separator

A separator element accessible to screen readers.
Renders a `<div>` element.

| Prop | Type | Description |
| --- | --- | --- |
| orientation | Orientation \| undefined | The orientation of the separator. |
| class | JSX.ClassValue \| ((state: Readonly<SeparatorState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<SeparatorState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, SeparatorState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

## useFilter

When filtering items yourself, `Menu.useFilter` matches text according to the user's locale.



| Prop | Type | Description |
| --- | --- | --- |
| options | GetFilterParameters \| undefined |  |

## createHandle



| Prop | Type | Description |
| --- | --- | --- |


### Handle

The foundation owns attachment order, inert fallback and trigger migration.

| Prop | Type | Description |
| --- | --- | --- |


