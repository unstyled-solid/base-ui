<a id="menu"></a>

# Menu

A list of actions in a dropdown, enhanced with keyboard navigation.

[Open mounted Solid demo: menu/hero](/solid/components/menu)

<a id="anatomy"></a>

## Anatomy

Import the component and assemble its parts:

```tsx
import { Menu } from '@unstyled-solid/base-ui/menu';
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

<a id="examples"></a>

## Examples

<a id="open-on-hover"></a>

### Open on hover

To create a menu that opens on hover, add the `openOnHover` prop to `<Menu.Trigger>`. You can additionally configure how quickly the menu opens on hover using the `delay` prop.

[Open mounted Solid demo: menu/open-on-hover](/solid/components/menu)

<a id="checkbox-items"></a>

### Checkbox items

Use the `<Menu.CheckboxItem>` part to create a menu item that can toggle a setting on or off.

[Open mounted Solid demo: menu/checkbox-items](/solid/components/menu)

<a id="radio-items"></a>

### Radio items

Use the `<Menu.RadioGroup>` and `<Menu.RadioItem>` parts to create menu items that work like radio buttons.

[Open mounted Solid demo: menu/radio-items](/solid/components/menu)

<a id="close-on-click"></a>

### Close on click

Use the `closeOnClick` prop to change whether the menu closes when an item is clicked.

```tsx
// Close the menu when a checkbox item is clicked
<Menu.CheckboxItem closeOnClick />

// Keep the menu open when an item is clicked
<Menu.Item closeOnClick={false} />
```

<a id="group-labels"></a>

### Group labels

Use the `<Menu.GroupLabel>` part to add a label to a `<Menu.Group>` or `<Menu.RadioGroup>`.

[Open mounted Solid demo: menu/group-labels](/solid/components/menu)

<a id="nested-menu"></a>

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

[Open mounted Solid demo: menu/submenu](/solid/components/menu)

<a id="navigate-to-another-page"></a>

### Navigate to another page

Use the `<Menu.LinkItem>` part to create a link.

```tsx
<Menu.LinkItem href="/projects">Go to Projects</Menu.LinkItem>;
```

<a id="open-a-dialog"></a>

### Open a dialog

In order to open a dialog using a menu, control the dialog state and open it imperatively using the `onClick` handler on the menu item.

```tsx
import { createSignal } from 'solid-js';
import { Dialog } from '@unstyled-solid/base-ui/dialog';
import { Menu } from '@unstyled-solid/base-ui/menu';
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

<a id="detached-triggers"></a>

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

[Open mounted Solid demo: menu/detached-triggers-simple](/solid/components/menu)

<a id="multiple-triggers"></a>

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

<a id="controlled-mode-with-multiple-triggers"></a>

### Controlled mode with multiple triggers

Control a menu's open state externally with the `open` and `onOpenChange` props on `<Menu.Root>`.
When more than one trigger can open the menu, track the active trigger with the `triggerId` prop on `<Menu.Root>` and matching `id` props on each `<Menu.Trigger>`.
The `onOpenChange` callback receives `eventDetails`, which includes the DOM element that initiated the change, so you can update your `triggerId` state when the user activates a different trigger.

[Open mounted Solid demo: menu/detached-triggers-controlled](/solid/components/menu)

<a id="arrow"></a>

### Arrow

Use the `<Menu.Arrow>` part inside the popup to visually connect the menu to its trigger.

[Open mounted Solid demo: menu/arrow](/solid/components/menu)

<a id="animating-the-menu"></a>

### Animating the Menu

When one menu is opened by multiple detached triggers, you can animate the menu as it moves between triggers.
This includes animating position, size, and content.

<a id="position-and-size"></a>

#### Position and Size

To animate the menu's position, apply CSS transitions to the `left`, `right`, `top`, and `bottom` properties of the **Positioner** part.
To animate its size, transition the `width` and `height` of the **Popup** part.

<a id="content"></a>

#### Content

The menu also supports content transitions.
This is useful when different triggers display different content within the same menu.

To enable content animations, wrap the menu content in the `<Menu.Viewport>` part.
This part renders a `div` with `data-activation-direction`, containing up to two space-separated tokens — a horizontal (`left` or `right`) and a vertical (`up` or `down`) value — so you can make direction-aware animations.

Inside `<Menu.Viewport>`, content is wrapped in `div`s with transition data attributes:

- `data-current`: The currently visible content when no transitions are present or the incoming content.
- `data-previous`: The outgoing content during a transition.

[Open mounted Solid demo: menu/detached-triggers-full](/solid/components/menu)

<a id="filtering"></a>

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

[Open mounted Solid demo: menu/filter](/solid/components/menu)

<a id="matching-items"></a>

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

<a id="controlling-the-query"></a>

#### Controlling the query

`value` and `onValueChange` on `<Menu.FilterProvider>` control the query.
It resets to an empty string when the menu closes, reported with the `'popup-close'` reason. Cancel that change to keep the query.

<a id="highlighting"></a>

#### Highlighting

Use `autoHighlight` to highlight the first match while filtering, or `autoHighlight="always"` to highlight it even when the query is empty.
The highlighted item has the `data-highlighted` attribute, and `onItemHighlighted` on `<Menu.Root>` reports each change.

<a id="focus-and-keyboard"></a>

#### Focus and keyboard

Opening the menu with a click or the keyboard focuses the input. Opening it on hover, touch, or with a pen does not, so the on-screen keyboard stays hidden.
The arrow keys move the highlight while the input keeps focus. <kbd>Tab</kbd> closes the menu, and <kbd>Shift</kbd>+<kbd>Tab</kbd> returns focus to the trigger.
The popup is a `dialog` that holds the `searchbox` input and the `menu` list.

<a id="submenus"></a>

#### Submenus

Wrap each searchable `<Menu.SubmenuRoot>` in its own `<Menu.FilterProvider>`.
Submenus without a provider remain unfiltered.

<a id="filtering-with-detached-triggers"></a>

#### Filtering with detached triggers

Use the same `Menu.createHandle()` handle for the root and its detached trigger:

```tsx
const handle = Menu.createHandle();

<Menu.Trigger handle={handle}>Actions</Menu.Trigger>
<Menu.FilterProvider>
  <Menu.Root handle={handle}>{/* menu parts */}</Menu.Root>
</Menu.FilterProvider>
```

<a id="custom-keyboard-shortcuts"></a>

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

<a id="api-reference"></a>

## API reference

<a id="filterprovider"></a>

### FilterProvider

<a id="api-4d656e752e46696c74657250726f7669646572"></a>

<a id="menufilterprovider"></a>

### Menu.FilterProvider

Declaration: `packages/solid/build/types/menu/filter-provider/MenuFilterProvider.d.ts:9`

#### Declaration

```typescript
(props: MenuFilterProviderProps) => JSX.Element
```

<a id="api-4d656e752e46696c74657250726f76696465722e2470726f70732e64656661756c7456616c7565"></a>

<a id="MenuFilterProvider-defaultValue"></a>

<a id="api-4d656e752e46696c74657250726f76696465722e2470726f70732e76616c7565"></a>

<a id="MenuFilterProvider-value"></a>

<a id="api-4d656e752e46696c74657250726f76696465722e2470726f70732e6f6e56616c75654368616e6765"></a>

<a id="MenuFilterProvider-onValueChange"></a>

<a id="api-4d656e752e46696c74657250726f76696465722e2470726f70732e6175746f486967686c69676874"></a>

<a id="MenuFilterProvider-autoHighlight"></a>

<a id="api-4d656e752e46696c74657250726f76696465722e2470726f70732e66696c746572"></a>

<a id="MenuFilterProvider-filter"></a>

<a id="api-4d656e752e46696c74657250726f76696465722e2470726f70732e6c6f63616c65"></a>

<a id="MenuFilterProvider-locale"></a>

<a id="api-4d656e752e46696c74657250726f76696465722e2470726f70732e6368696c6472656e"></a>

<a id="MenuFilterProvider-children"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| defaultValue | `string \| undefined` | No | Unavailable |  |
| value | `string \| undefined` | No | Unavailable |  |
| onValueChange | `((value: string, details: FilterDropdownRootChangeEventDetails) => void) \| undefined` | No | Unavailable |  |
| autoHighlight | `boolean \| "always" \| undefined` | No | Unavailable |  |
| filter | `((text: string, query: string) => boolean) \| null \| undefined` | No | Unavailable |  |
| locale | `Intl.LocalesArgument` | No | Unavailable |  |
| children | `JSX.Element` | No | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4d656e752e46696c74657250726f76696465722e50726f7073"></a>

<a id="menufilterproviderprops"></a>

### Related exported type: Menu.FilterProvider.Props

Declaration: `packages/solid/build/types/menu/filter-provider/MenuFilterProvider.d.ts:13`

#### Declaration

```typescript
MenuFilterProviderProps
```

<a id="api-4d656e752e46696c74657250726f76696465722e50726f70732e64656661756c7456616c7565"></a>

<a id="MenuFilterProviderProps-defaultValue"></a>

<a id="api-4d656e752e46696c74657250726f76696465722e50726f70732e76616c7565"></a>

<a id="MenuFilterProviderProps-value"></a>

<a id="api-4d656e752e46696c74657250726f76696465722e50726f70732e6f6e56616c75654368616e6765"></a>

<a id="MenuFilterProviderProps-onValueChange"></a>

<a id="api-4d656e752e46696c74657250726f76696465722e50726f70732e6175746f486967686c69676874"></a>

<a id="MenuFilterProviderProps-autoHighlight"></a>

<a id="api-4d656e752e46696c74657250726f76696465722e50726f70732e66696c746572"></a>

<a id="MenuFilterProviderProps-filter"></a>

<a id="api-4d656e752e46696c74657250726f76696465722e50726f70732e6c6f63616c65"></a>

<a id="MenuFilterProviderProps-locale"></a>

<a id="api-4d656e752e46696c74657250726f76696465722e50726f70732e6368696c6472656e"></a>

<a id="MenuFilterProviderProps-children"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| defaultValue | `string \| undefined` | No | Unavailable |  |
| value | `string \| undefined` | No | Unavailable |  |
| onValueChange | `((value: string, details: FilterDropdownRootChangeEventDetails) => void) \| undefined` | No | Unavailable |  |
| autoHighlight | `boolean \| "always" \| undefined` | No | Unavailable |  |
| filter | `((text: string, query: string) => boolean) \| null \| undefined` | No | Unavailable |  |
| locale | `Intl.LocalesArgument` | No | Unavailable |  |
| children | `JSX.Element` | No | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4d656e752e46696c74657250726f76696465722e5374617465"></a>

<a id="menufilterproviderstate"></a>

### Related exported type: Menu.FilterProvider.State

Declaration: `packages/solid/build/types/menu/filter-provider/MenuFilterProvider.d.ts:14`

#### Declaration

```typescript
MenuFilterProviderState
```

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4d656e752e46696c74657250726f76696465722e4368616e67654576656e74526561736f6e"></a>

<a id="menufilterproviderchangeeventreason"></a>

### Related exported type: Menu.FilterProvider.ChangeEventReason

Declaration: `packages/solid/build/types/menu/filter-provider/MenuFilterProvider.d.ts:15`

#### Declaration

```typescript
FilterDropdownRootChangeEventReason
```

Inherited DOM attributes: `__@iterator@106`, `anchor`, `at`, `big`, `blink`, `bold`, `charAt`, `charCodeAt`, `codePointAt`, `concat`, `endsWith`, `fixed`, `fontcolor`, `fontsize`, `includes`, `indexOf`, `isWellFormed`, `italics`, `lastIndexOf`, `length`, `link`, `localeCompare`, `match`, `matchAll`, `normalize`, `padEnd`, `padStart`, `repeat`, `replace`, `replaceAll`, `search`, `slice`, `small`, `split`, `startsWith`, `strike`, `sub`, `substr`, `substring`, `sup`, `toLocaleLowerCase`, `toLocaleUpperCase`, `toLowerCase`, `toString`, `toUpperCase`, `toWellFormed`, `trim`, `trimEnd`, `trimLeft`, `trimRight`, `trimStart`, `valueOf`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4d656e752e46696c74657250726f76696465722e4368616e67654576656e7444657461696c73"></a>

<a id="menufilterproviderchangeeventdetails"></a>

### Related exported type: Menu.FilterProvider.ChangeEventDetails

Declaration: `packages/solid/build/types/menu/filter-provider/MenuFilterProvider.d.ts:16`

#### Declaration

```typescript
FilterDropdownRootChangeEventDetails
```

<a id="api-4d656e752e46696c74657250726f76696465722e4368616e67654576656e7444657461696c732e616c6c6f7750726f7061676174696f6e"></a>

<a id="MenuFilterProviderChangeEventDetails-allowPropagation"></a>

<a id="api-4d656e752e46696c74657250726f76696465722e4368616e67654576656e7444657461696c732e63616e63656c"></a>

<a id="MenuFilterProviderChangeEventDetails-cancel"></a>

<a id="api-4d656e752e46696c74657250726f76696465722e4368616e67654576656e7444657461696c732e6576656e74"></a>

<a id="MenuFilterProviderChangeEventDetails-event"></a>

<a id="api-4d656e752e46696c74657250726f76696465722e4368616e67654576656e7444657461696c732e697343616e63656c6564"></a>

<a id="MenuFilterProviderChangeEventDetails-isCanceled"></a>

<a id="api-4d656e752e46696c74657250726f76696465722e4368616e67654576656e7444657461696c732e697350726f7061676174696f6e416c6c6f776564"></a>

<a id="MenuFilterProviderChangeEventDetails-isPropagationAllowed"></a>

<a id="api-4d656e752e46696c74657250726f76696465722e4368616e67654576656e7444657461696c732e726561736f6e"></a>

<a id="MenuFilterProviderChangeEventDetails-reason"></a>

<a id="api-4d656e752e46696c74657250726f76696465722e4368616e67654576656e7444657461696c732e74726967676572"></a>

<a id="MenuFilterProviderChangeEventDetails-trigger"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| allowPropagation | `() => void` | Yes | Unavailable | Marks this change transaction as allowing propagation. |
| cancel | `() => void` | Yes | Unavailable | Cancels the Base UI change transaction; separate from the DOM event’s preventDefault() and preventBaseUIHandler(). |
| event | `PointerEvent \| MouseEvent \| Event \| FocusEvent \| InputEvent \| KeyboardEvent` | Yes | Unavailable | Native DOM event associated with the change. Programmatic changes can use a Base UI-created Event. |
| isCanceled | `boolean` | Yes | Unavailable | Whether cancel() has been called for this change transaction. |
| isPropagationAllowed | `boolean` | Yes | Unavailable | Whether allowPropagation() has been called for this change transaction. |
| reason | `"clear-press" \| "input-change" \| "input-clear" \| "popup-close"` | Yes | Unavailable | Reason for the requested change; it discriminates the native event type. |
| trigger | `Element \| undefined` | Yes | Unavailable | Trigger element associated with this change, when available. |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="root"></a>

### Root

<a id="api-4d656e752e526f6f74"></a>

<a id="menuroot"></a>

### Menu.Root

Declaration: `packages/solid/build/types/menu/root/MenuRoot.d.ts:9`

#### Declaration

```typescript
<Payload = unknown>(props: MenuRootProps<Payload>) => JSX.Element
```

<a id="api-4d656e752e526f6f742e2470726f70732e64656661756c744f70656e"></a>

<a id="MenuRoot-defaultOpen"></a>

<a id="api-4d656e752e526f6f742e2470726f70732e6f70656e"></a>

<a id="MenuRoot-open"></a>

<a id="api-4d656e752e526f6f742e2470726f70732e6f6e4f70656e4368616e6765"></a>

<a id="MenuRoot-onOpenChange"></a>

<a id="api-4d656e752e526f6f742e2470726f70732e686967686c696768744974656d4f6e486f766572"></a>

<a id="MenuRoot-highlightItemOnHover"></a>

<a id="api-4d656e752e526f6f742e2470726f70732e616374696f6e73526566"></a>

<a id="MenuRoot-actionsRef"></a>

<a id="api-4d656e752e526f6f742e2470726f70732e636c6f7365506172656e744f6e457363"></a>

<a id="MenuRoot-closeParentOnEsc"></a>

<a id="api-4d656e752e526f6f742e2470726f70732e64656661756c74547269676765724964"></a>

<a id="MenuRoot-defaultTriggerId"></a>

<a id="api-4d656e752e526f6f742e2470726f70732e68616e646c65"></a>

<a id="MenuRoot-handle"></a>

<a id="api-4d656e752e526f6f742e2470726f70732e6c6f6f70466f637573"></a>

<a id="MenuRoot-loopFocus"></a>

<a id="api-4d656e752e526f6f742e2470726f70732e6d6f64616c"></a>

<a id="MenuRoot-modal"></a>

<a id="api-4d656e752e526f6f742e2470726f70732e6f6e4974656d486967686c696768746564"></a>

<a id="MenuRoot-onItemHighlighted"></a>

<a id="api-4d656e752e526f6f742e2470726f70732e6f6e4f70656e4368616e6765436f6d706c657465"></a>

<a id="MenuRoot-onOpenChangeComplete"></a>

<a id="api-4d656e752e526f6f742e2470726f70732e747269676765724964"></a>

<a id="MenuRoot-triggerId"></a>

<a id="api-4d656e752e526f6f742e2470726f70732e64697361626c6564"></a>

<a id="MenuRoot-disabled"></a>

<a id="api-4d656e752e526f6f742e2470726f70732e6f7269656e746174696f6e"></a>

<a id="MenuRoot-orientation"></a>

<a id="api-4d656e752e526f6f742e2470726f70732e6368696c6472656e"></a>

<a id="MenuRoot-children"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| defaultOpen | `boolean \| undefined` | No | Unavailable |  |
| open | `boolean \| undefined` | No | Unavailable |  |
| onOpenChange | `((open: boolean, details: MenuRootChangeEventDetails) => void) \| undefined` | No | Unavailable |  |
| highlightItemOnHover | `boolean \| undefined` | No | Unavailable |  |
| actionsRef | `MutableCell<MenuRootActions \| null> \| undefined` | No | Unavailable |  |
| closeParentOnEsc | `boolean \| undefined` | No | Unavailable |  |
| defaultTriggerId | `string \| null \| undefined` | No | Unavailable |  |
| handle | `MenuHandle<Payload> \| undefined` | No | Unavailable |  |
| loopFocus | `boolean \| undefined` | No | Unavailable |  |
| modal | `boolean \| undefined` | No | Unavailable |  |
| onItemHighlighted | `((item: HTMLElement \| undefined, details: MenuRootHighlightEventDetails) => void) \| undefined` | No | Unavailable |  |
| onOpenChangeComplete | `((open: boolean) => void) \| undefined` | No | Unavailable |  |
| triggerId | `string \| null \| undefined` | No | Unavailable |  |
| disabled | `boolean \| undefined` | No | Unavailable |  |
| orientation | `MenuRootOrientation \| undefined` | No | Unavailable |  |
| children | `JSX.Element \| ((data: { payload: Payload \| undefined; }) => JSX.Element)` | No | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4d656e752e526f6f742e50726f7073"></a>

<a id="menurootprops"></a>

### Related exported type: Menu.Root.Props

Declaration: `packages/solid/build/types/menu/root/MenuRoot.d.ts:72`

#### Declaration

```typescript
Props<Payload>
```

<a id="api-4d656e752e526f6f742e50726f70732e64656661756c744f70656e"></a>

<a id="MenuRootProps-defaultOpen"></a>

<a id="api-4d656e752e526f6f742e50726f70732e6f70656e"></a>

<a id="MenuRootProps-open"></a>

<a id="api-4d656e752e526f6f742e50726f70732e6f6e4f70656e4368616e6765"></a>

<a id="MenuRootProps-onOpenChange"></a>

<a id="api-4d656e752e526f6f742e50726f70732e686967686c696768744974656d4f6e486f766572"></a>

<a id="MenuRootProps-highlightItemOnHover"></a>

<a id="api-4d656e752e526f6f742e50726f70732e616374696f6e73526566"></a>

<a id="MenuRootProps-actionsRef"></a>

<a id="api-4d656e752e526f6f742e50726f70732e636c6f7365506172656e744f6e457363"></a>

<a id="MenuRootProps-closeParentOnEsc"></a>

<a id="api-4d656e752e526f6f742e50726f70732e64656661756c74547269676765724964"></a>

<a id="MenuRootProps-defaultTriggerId"></a>

<a id="api-4d656e752e526f6f742e50726f70732e68616e646c65"></a>

<a id="MenuRootProps-handle"></a>

<a id="api-4d656e752e526f6f742e50726f70732e6c6f6f70466f637573"></a>

<a id="MenuRootProps-loopFocus"></a>

<a id="api-4d656e752e526f6f742e50726f70732e6d6f64616c"></a>

<a id="MenuRootProps-modal"></a>

<a id="api-4d656e752e526f6f742e50726f70732e6f6e4974656d486967686c696768746564"></a>

<a id="MenuRootProps-onItemHighlighted"></a>

<a id="api-4d656e752e526f6f742e50726f70732e6f6e4f70656e4368616e6765436f6d706c657465"></a>

<a id="MenuRootProps-onOpenChangeComplete"></a>

<a id="api-4d656e752e526f6f742e50726f70732e747269676765724964"></a>

<a id="MenuRootProps-triggerId"></a>

<a id="api-4d656e752e526f6f742e50726f70732e64697361626c6564"></a>

<a id="MenuRootProps-disabled"></a>

<a id="api-4d656e752e526f6f742e50726f70732e6f7269656e746174696f6e"></a>

<a id="MenuRootProps-orientation"></a>

<a id="api-4d656e752e526f6f742e50726f70732e6368696c6472656e"></a>

<a id="MenuRootProps-children"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| defaultOpen | `boolean \| undefined` | No | Unavailable |  |
| open | `boolean \| undefined` | No | Unavailable |  |
| onOpenChange | `((open: boolean, details: MenuRootChangeEventDetails) => void) \| undefined` | No | Unavailable |  |
| highlightItemOnHover | `boolean \| undefined` | No | Unavailable |  |
| actionsRef | `MutableCell<MenuRootActions \| null> \| undefined` | No | Unavailable |  |
| closeParentOnEsc | `boolean \| undefined` | No | Unavailable |  |
| defaultTriggerId | `string \| null \| undefined` | No | Unavailable |  |
| handle | `MenuHandle<Payload> \| undefined` | No | Unavailable |  |
| loopFocus | `boolean \| undefined` | No | Unavailable |  |
| modal | `boolean \| undefined` | No | Unavailable |  |
| onItemHighlighted | `((item: HTMLElement \| undefined, details: MenuRootHighlightEventDetails) => void) \| undefined` | No | Unavailable |  |
| onOpenChangeComplete | `((open: boolean) => void) \| undefined` | No | Unavailable |  |
| triggerId | `string \| null \| undefined` | No | Unavailable |  |
| disabled | `boolean \| undefined` | No | Unavailable |  |
| orientation | `MenuRootOrientation \| undefined` | No | Unavailable |  |
| children | `JSX.Element \| ((data: { payload: Payload \| undefined; }) => JSX.Element)` | No | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4d656e752e526f6f742e5374617465"></a>

<a id="menurootstate"></a>

### Related exported type: Menu.Root.State

Declaration: `packages/solid/build/types/menu/root/MenuRoot.d.ts:73`

#### Declaration

```typescript
MenuRootState
```

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4d656e752e526f6f742e416374696f6e73"></a>

<a id="menurootactions"></a>

### Related exported type: Menu.Root.Actions

Declaration: `packages/solid/build/types/menu/root/MenuRoot.d.ts:74`

#### Declaration

```typescript
MenuRootActions
```

<a id="api-4d656e752e526f6f742e416374696f6e732e636c6f7365"></a>

<a id="MenuRootActions-close"></a>

<a id="api-4d656e752e526f6f742e416374696f6e732e686967686c696768744974656d"></a>

<a id="MenuRootActions-highlightItem"></a>

<a id="api-4d656e752e526f6f742e416374696f6e732e756e6d6f756e74"></a>

<a id="MenuRootActions-unmount"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| close | `() => void` | Yes | Unavailable |  |
| highlightItem | `(target: MenuRootHighlightItemTarget) => void` | Yes | Unavailable |  |
| unmount | `() => void` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4d656e752e526f6f742e4368616e67654576656e74526561736f6e"></a>

<a id="menurootchangeeventreason"></a>

### Related exported type: Menu.Root.ChangeEventReason

Declaration: `packages/solid/build/types/menu/root/MenuRoot.d.ts:76`

#### Declaration

```typescript
MenuRootChangeEventReason
```

Inherited DOM attributes: `__@iterator@106`, `anchor`, `at`, `big`, `blink`, `bold`, `charAt`, `charCodeAt`, `codePointAt`, `concat`, `endsWith`, `fixed`, `fontcolor`, `fontsize`, `includes`, `indexOf`, `isWellFormed`, `italics`, `lastIndexOf`, `length`, `link`, `localeCompare`, `match`, `matchAll`, `normalize`, `padEnd`, `padStart`, `repeat`, `replace`, `replaceAll`, `search`, `slice`, `small`, `split`, `startsWith`, `strike`, `sub`, `substr`, `substring`, `sup`, `toLocaleLowerCase`, `toLocaleUpperCase`, `toLowerCase`, `toString`, `toUpperCase`, `toWellFormed`, `trim`, `trimEnd`, `trimLeft`, `trimRight`, `trimStart`, `valueOf`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4d656e752e526f6f742e4368616e67654576656e7444657461696c73"></a>

<a id="menurootchangeeventdetails"></a>

### Related exported type: Menu.Root.ChangeEventDetails

Declaration: `packages/solid/build/types/menu/root/MenuRoot.d.ts:77`

#### Declaration

```typescript
MenuRootChangeEventDetails
```

<a id="api-4d656e752e526f6f742e4368616e67654576656e7444657461696c732e616c6c6f7750726f7061676174696f6e"></a>

<a id="MenuRootChangeEventDetails-allowPropagation"></a>

<a id="api-4d656e752e526f6f742e4368616e67654576656e7444657461696c732e63616e63656c"></a>

<a id="MenuRootChangeEventDetails-cancel"></a>

<a id="api-4d656e752e526f6f742e4368616e67654576656e7444657461696c732e6576656e74"></a>

<a id="MenuRootChangeEventDetails-event"></a>

<a id="api-4d656e752e526f6f742e4368616e67654576656e7444657461696c732e697343616e63656c6564"></a>

<a id="MenuRootChangeEventDetails-isCanceled"></a>

<a id="api-4d656e752e526f6f742e4368616e67654576656e7444657461696c732e697350726f7061676174696f6e416c6c6f776564"></a>

<a id="MenuRootChangeEventDetails-isPropagationAllowed"></a>

<a id="api-4d656e752e526f6f742e4368616e67654576656e7444657461696c732e70726576656e74556e6d6f756e744f6e436c6f7365"></a>

<a id="MenuRootChangeEventDetails-preventUnmountOnClose"></a>

<a id="api-4d656e752e526f6f742e4368616e67654576656e7444657461696c732e726561736f6e"></a>

<a id="MenuRootChangeEventDetails-reason"></a>

<a id="api-4d656e752e526f6f742e4368616e67654576656e7444657461696c732e74726967676572"></a>

<a id="MenuRootChangeEventDetails-trigger"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| allowPropagation | `() => void` | Yes | Unavailable | Marks this change transaction as allowing propagation. |
| cancel | `() => void` | Yes | Unavailable | Cancels the Base UI change transaction; separate from the DOM event’s preventDefault() and preventBaseUIHandler(). |
| event | `PointerEvent \| MouseEvent \| Event \| FocusEvent \| KeyboardEvent \| TouchEvent` | Yes | Unavailable | Native DOM event associated with the change. Programmatic changes can use a Base UI-created Event. |
| isCanceled | `boolean` | Yes | Unavailable | Whether cancel() has been called for this change transaction. |
| isPropagationAllowed | `boolean` | Yes | Unavailable | Whether allowPropagation() has been called for this change transaction. |
| preventUnmountOnClose | `() => void` | Yes | Unavailable |  |
| reason | `"none" \| "trigger-press" \| "trigger-hover" \| "trigger-focus" \| "outside-press" \| "item-press" \| "close-press" \| "focus-out" \| "escape-key" \| "list-navigation" \| "cancel-open" \| "sibling-open" \| "imperative-action"` | Yes | Unavailable | Reason for the requested change; it discriminates the native event type. |
| trigger | `Element \| undefined` | Yes | Unavailable | Trigger element associated with this change, when available. |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4d656e752e526f6f742e486967686c696768744576656e74526561736f6e"></a>

<a id="menuroothighlighteventreason"></a>

### Related exported type: Menu.Root.HighlightEventReason

Declaration: `packages/solid/build/types/menu/root/MenuRoot.d.ts:78`

#### Declaration

```typescript
MenuRootHighlightEventReason
```

Inherited DOM attributes: `__@iterator@106`, `anchor`, `at`, `big`, `blink`, `bold`, `charAt`, `charCodeAt`, `codePointAt`, `concat`, `endsWith`, `fixed`, `fontcolor`, `fontsize`, `includes`, `indexOf`, `isWellFormed`, `italics`, `lastIndexOf`, `length`, `link`, `localeCompare`, `match`, `matchAll`, `normalize`, `padEnd`, `padStart`, `repeat`, `replace`, `replaceAll`, `search`, `slice`, `small`, `split`, `startsWith`, `strike`, `sub`, `substr`, `substring`, `sup`, `toLocaleLowerCase`, `toLocaleUpperCase`, `toLowerCase`, `toString`, `toUpperCase`, `toWellFormed`, `trim`, `trimEnd`, `trimLeft`, `trimRight`, `trimStart`, `valueOf`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4d656e752e526f6f742e486967686c696768744576656e7444657461696c73"></a>

<a id="menuroothighlighteventdetails"></a>

### Related exported type: Menu.Root.HighlightEventDetails

Declaration: `packages/solid/build/types/menu/root/MenuRoot.d.ts:79`

#### Declaration

```typescript
MenuRootHighlightEventDetails
```

<a id="api-4d656e752e526f6f742e486967686c696768744576656e7444657461696c732e6c6162656c"></a>

<a id="MenuRootHighlightEventDetails-label"></a>

<a id="api-4d656e752e526f6f742e486967686c696768744576656e7444657461696c732e6576656e74"></a>

<a id="MenuRootHighlightEventDetails-event"></a>

<a id="api-4d656e752e526f6f742e486967686c696768744576656e7444657461696c732e726561736f6e"></a>

<a id="MenuRootHighlightEventDetails-reason"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| label | `string \| undefined` | Yes | Unavailable |  |
| event | `PointerEvent \| MouseEvent \| Event \| KeyboardEvent` | Yes | Unavailable | Native DOM event associated with the change. Programmatic changes can use a Base UI-created Event. |
| reason | `"none" \| "pointer" \| "keyboard" \| "imperative-action"` | Yes | Unavailable | Reason for the requested change; it discriminates the native event type. |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4d656e752e526f6f742e4f7269656e746174696f6e"></a>

<a id="menurootorientation"></a>

### Related exported type: Menu.Root.Orientation

Declaration: `packages/solid/build/types/menu/root/MenuRoot.d.ts:75`

#### Declaration

```typescript
MenuRootOrientation
```

Inherited DOM attributes: `__@iterator@106`, `anchor`, `at`, `big`, `blink`, `bold`, `charAt`, `charCodeAt`, `codePointAt`, `concat`, `endsWith`, `fixed`, `fontcolor`, `fontsize`, `includes`, `indexOf`, `isWellFormed`, `italics`, `lastIndexOf`, `length`, `link`, `localeCompare`, `match`, `matchAll`, `normalize`, `padEnd`, `padStart`, `repeat`, `replace`, `replaceAll`, `search`, `slice`, `small`, `split`, `startsWith`, `strike`, `sub`, `substr`, `substring`, `sup`, `toLocaleLowerCase`, `toLocaleUpperCase`, `toLowerCase`, `toString`, `toUpperCase`, `toWellFormed`, `trim`, `trimEnd`, `trimLeft`, `trimRight`, `trimStart`, `valueOf`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4d656e752e526f6f742e486967686c696768744974656d546172676574"></a>

<a id="menuroothighlightitemtarget"></a>

### Related exported type: Menu.Root.HighlightItemTarget

Declaration: `packages/solid/build/types/menu/root/MenuRoot.d.ts:80`

#### Declaration

```typescript
MenuRootHighlightItemTarget
```

Inherited DOM attributes: `__@iterator@106`, `anchor`, `at`, `big`, `blink`, `bold`, `charAt`, `charCodeAt`, `codePointAt`, `concat`, `endsWith`, `fixed`, `fontcolor`, `fontsize`, `includes`, `indexOf`, `isWellFormed`, `italics`, `lastIndexOf`, `length`, `link`, `localeCompare`, `match`, `matchAll`, `normalize`, `padEnd`, `padStart`, `repeat`, `replace`, `replaceAll`, `search`, `slice`, `small`, `split`, `startsWith`, `strike`, `sub`, `substr`, `substring`, `sup`, `toLocaleLowerCase`, `toLocaleUpperCase`, `toLowerCase`, `toString`, `toUpperCase`, `toWellFormed`, `trim`, `trimEnd`, `trimLeft`, `trimRight`, `trimStart`, `valueOf`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="trigger"></a>

### Trigger

<a id="api-4d656e752e54726967676572"></a>

<a id="menutrigger"></a>

<a id="api-4d656e752e547269676765722e2470726f70732e70726f703a64697361626c6564"></a>

<a id="api-4d656e752e547269676765722e2470726f70732e70726f703a666f726d416374696f6e"></a>

<a id="api-4d656e752e547269676765722e2470726f70732e70726f703a666f726d456e6374797065"></a>

<a id="api-4d656e752e547269676765722e2470726f70732e70726f703a666f726d4d6574686f64"></a>

<a id="api-4d656e752e547269676765722e2470726f70732e70726f703a666f726d4e6f56616c6964617465"></a>

<a id="api-4d656e752e547269676765722e2470726f70732e70726f703a666f726d546172676574"></a>

<a id="api-4d656e752e547269676765722e2470726f70732e70726f703a6e616d65"></a>

<a id="api-4d656e752e547269676765722e2470726f70732e70726f703a706f706f766572546172676574416374696f6e"></a>

<a id="api-4d656e752e547269676765722e2470726f70732e70726f703a706f706f766572546172676574456c656d656e74"></a>

<a id="api-4d656e752e547269676765722e2470726f70732e70726f703a74797065"></a>

<a id="api-4d656e752e547269676765722e2470726f70732e70726f703a76616c7565"></a>

### Menu.Trigger

Declaration: `packages/solid/build/types/menu/trigger/MenuTrigger.d.ts:16`

#### Declaration

```typescript
<Payload = unknown>(props: MenuTriggerProps<Payload>) => JSX.Element
```

<a id="api-4d656e752e547269676765722e2470726f70732e68616e646c65"></a>

<a id="MenuTrigger-handle"></a>

<a id="api-4d656e752e547269676765722e2470726f70732e6e6174697665427574746f6e"></a>

<a id="MenuTrigger-nativeButton"></a>

<a id="api-4d656e752e547269676765722e2470726f70732e7061796c6f6164"></a>

<a id="MenuTrigger-payload"></a>

<a id="api-4d656e752e547269676765722e2470726f70732e64697361626c6564"></a>

<a id="MenuTrigger-disabled"></a>

<a id="api-4d656e752e547269676765722e2470726f70732e6f70656e4f6e486f766572"></a>

<a id="MenuTrigger-openOnHover"></a>

<a id="api-4d656e752e547269676765722e2470726f70732e64656c6179"></a>

<a id="MenuTrigger-delay"></a>

<a id="api-4d656e752e547269676765722e2470726f70732e636c6f736544656c6179"></a>

<a id="MenuTrigger-closeDelay"></a>

<a id="api-4d656e752e547269676765722e2470726f70732e636c617373"></a>

<a id="MenuTrigger-class"></a>

<a id="api-4d656e752e547269676765722e2470726f70732e7374796c65"></a>

<a id="MenuTrigger-style"></a>

<a id="api-4d656e752e547269676765722e2470726f70732e72656e646572"></a>

<a id="MenuTrigger-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| handle | `MenuHandle<Payload> \| undefined` | No | Unavailable |  |
| nativeButton | `boolean \| undefined` | No | true |  |
| payload | `Payload \| undefined` | No | Unavailable |  |
| disabled | `boolean \| undefined` | No | Unavailable |  |
| openOnHover | `boolean \| undefined` | No | Unavailable |  |
| delay | `number \| undefined` | No | 100 |  |
| closeDelay | `number \| undefined` | No | 0 |  |
| class | `JSX.ClassValue \| ((state: Readonly<MenuTriggerState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<MenuTriggerState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, MenuTriggerState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `command`, `commandfor`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `form`, `formaction`, `formenctype`, `formmethod`, `formnovalidate`, `formtarget`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `name`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `popovertarget`, `popovertargetaction`, `prefix`, `prop:disabled`, `prop:formAction`, `prop:formEnctype`, `prop:formMethod`, `prop:formNoValidate`, `prop:formTarget`, `prop:name`, `prop:popoverTargetAction`, `prop:popoverTargetElement`, `prop:type`, `prop:value`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `type`, `typeof`, `value`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-4d656e755472696767657244617461417474726962757465732e706f7075704f70656e"></a>

<a id="api-4d656e755472696767657244617461417474726962757465732e70726573736564"></a>

<a id="api-4d656e755472696767657244617461417474726962757465732e64697361626c6564"></a>

| Name | Description |
| --- | --- |
| data-popup-open |  |
| data-pressed |  |
| data-disabled |  |

#### CSS variables

Metadata status: unavailable.

<a id="api-4d656e752e547269676765722e50726f7073"></a>

<a id="menutriggerprops"></a>

<a id="api-4d656e752e547269676765722e50726f70732e70726f703a64697361626c6564"></a>

<a id="api-4d656e752e547269676765722e50726f70732e70726f703a666f726d416374696f6e"></a>

<a id="api-4d656e752e547269676765722e50726f70732e70726f703a666f726d456e6374797065"></a>

<a id="api-4d656e752e547269676765722e50726f70732e70726f703a666f726d4d6574686f64"></a>

<a id="api-4d656e752e547269676765722e50726f70732e70726f703a666f726d4e6f56616c6964617465"></a>

<a id="api-4d656e752e547269676765722e50726f70732e70726f703a666f726d546172676574"></a>

<a id="api-4d656e752e547269676765722e50726f70732e70726f703a6e616d65"></a>

<a id="api-4d656e752e547269676765722e50726f70732e70726f703a706f706f766572546172676574416374696f6e"></a>

<a id="api-4d656e752e547269676765722e50726f70732e70726f703a706f706f766572546172676574456c656d656e74"></a>

<a id="api-4d656e752e547269676765722e50726f70732e70726f703a74797065"></a>

<a id="api-4d656e752e547269676765722e50726f70732e70726f703a76616c7565"></a>

### Related exported type: Menu.Trigger.Props

Declaration: `packages/solid/build/types/menu/trigger/MenuTrigger.d.ts:18`

#### Declaration

```typescript
Props<Payload>
```

<a id="api-4d656e752e547269676765722e50726f70732e68616e646c65"></a>

<a id="MenuTriggerProps-handle"></a>

<a id="api-4d656e752e547269676765722e50726f70732e6e6174697665427574746f6e"></a>

<a id="MenuTriggerProps-nativeButton"></a>

<a id="api-4d656e752e547269676765722e50726f70732e7061796c6f6164"></a>

<a id="MenuTriggerProps-payload"></a>

<a id="api-4d656e752e547269676765722e50726f70732e64697361626c6564"></a>

<a id="MenuTriggerProps-disabled"></a>

<a id="api-4d656e752e547269676765722e50726f70732e6f70656e4f6e486f766572"></a>

<a id="MenuTriggerProps-openOnHover"></a>

<a id="api-4d656e752e547269676765722e50726f70732e64656c6179"></a>

<a id="MenuTriggerProps-delay"></a>

<a id="api-4d656e752e547269676765722e50726f70732e636c6f736544656c6179"></a>

<a id="MenuTriggerProps-closeDelay"></a>

<a id="api-4d656e752e547269676765722e50726f70732e636c617373"></a>

<a id="MenuTriggerProps-class"></a>

<a id="api-4d656e752e547269676765722e50726f70732e7374796c65"></a>

<a id="MenuTriggerProps-style"></a>

<a id="api-4d656e752e547269676765722e50726f70732e72656e646572"></a>

<a id="MenuTriggerProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| handle | `MenuHandle<Payload> \| undefined` | No | Unavailable |  |
| nativeButton | `boolean \| undefined` | No | Unavailable |  |
| payload | `Payload \| undefined` | No | Unavailable |  |
| disabled | `boolean \| undefined` | No | Unavailable |  |
| openOnHover | `boolean \| undefined` | No | Unavailable |  |
| delay | `number \| undefined` | No | Unavailable |  |
| closeDelay | `number \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<MenuTriggerState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<MenuTriggerState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, MenuTriggerState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `command`, `commandfor`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `form`, `formaction`, `formenctype`, `formmethod`, `formnovalidate`, `formtarget`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `name`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `popovertarget`, `popovertargetaction`, `prefix`, `prop:disabled`, `prop:formAction`, `prop:formEnctype`, `prop:formMethod`, `prop:formNoValidate`, `prop:formTarget`, `prop:name`, `prop:popoverTargetAction`, `prop:popoverTargetElement`, `prop:type`, `prop:value`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `type`, `typeof`, `value`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4d656e752e547269676765722e5374617465"></a>

<a id="menutriggerstate"></a>

### Related exported type: Menu.Trigger.State

Declaration: `packages/solid/build/types/menu/trigger/MenuTrigger.d.ts:19`

#### Declaration

```typescript
MenuTriggerState
```

<a id="api-4d656e752e547269676765722e53746174652e6f70656e"></a>

<a id="MenuTriggerState-open"></a>

<a id="api-4d656e752e547269676765722e53746174652e64697361626c6564"></a>

<a id="MenuTriggerState-disabled"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| open | `boolean` | Yes | Unavailable |  |
| disabled | `boolean` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="portal"></a>

### Portal

<a id="api-4d656e752e506f7274616c"></a>

<a id="menuportal"></a>

<a id="api-4d656e752e506f7274616c2e2470726f70732e70726f703a616c69676e"></a>

### Menu.Portal

Declaration: `packages/solid/build/types/menu/portal/MenuPortal.d.ts:9`

#### Declaration

```typescript
(props: MenuPortalProps) => JSX.Element
```

<a id="api-4d656e752e506f7274616c2e2470726f70732e636f6e7461696e6572"></a>

<a id="MenuPortal-container"></a>

<a id="api-4d656e752e506f7274616c2e2470726f70732e636c617373"></a>

<a id="MenuPortal-class"></a>

<a id="api-4d656e752e506f7274616c2e2470726f70732e7374796c65"></a>

<a id="MenuPortal-style"></a>

<a id="api-4d656e752e506f7274616c2e2470726f70732e6b6565704d6f756e746564"></a>

<a id="MenuPortal-keepMounted"></a>

<a id="api-4d656e752e506f7274616c2e2470726f70732e72656e646572"></a>

<a id="MenuPortal-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| container | `PortalContainer` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<ContextMenuPortalState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ContextMenuPortalState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| keepMounted | `boolean \| undefined` | No | false |  |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ContextMenuPortalState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4d656e752e506f7274616c2e50726f7073"></a>

<a id="menuportalprops"></a>

<a id="api-4d656e752e506f7274616c2e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Menu.Portal.Props

Declaration: `packages/solid/build/types/menu/portal/MenuPortal.d.ts:11`

#### Declaration

```typescript
MenuPortalProps
```

<a id="api-4d656e752e506f7274616c2e50726f70732e636f6e7461696e6572"></a>

<a id="MenuPortalProps-container"></a>

<a id="api-4d656e752e506f7274616c2e50726f70732e636c617373"></a>

<a id="MenuPortalProps-class"></a>

<a id="api-4d656e752e506f7274616c2e50726f70732e7374796c65"></a>

<a id="MenuPortalProps-style"></a>

<a id="api-4d656e752e506f7274616c2e50726f70732e6b6565704d6f756e746564"></a>

<a id="MenuPortalProps-keepMounted"></a>

<a id="api-4d656e752e506f7274616c2e50726f70732e72656e646572"></a>

<a id="MenuPortalProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| container | `PortalContainer` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<ContextMenuPortalState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ContextMenuPortalState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| keepMounted | `boolean \| undefined` | No | Unavailable |  |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ContextMenuPortalState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4d656e752e506f7274616c2e5374617465"></a>

<a id="menuportalstate"></a>

### Related exported type: Menu.Portal.State

Declaration: `packages/solid/build/types/menu/portal/MenuPortal.d.ts:12`

#### Declaration

```typescript
MenuPortalState
```

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="backdrop"></a>

### Backdrop

<a id="api-4d656e752e4261636b64726f70"></a>

<a id="menubackdrop"></a>

<a id="api-4d656e752e4261636b64726f702e2470726f70732e70726f703a616c69676e"></a>

### Menu.Backdrop

Declaration: `packages/solid/build/types/menu/backdrop/MenuBackdrop.d.ts:9`

#### Declaration

```typescript
(props: MenuBackdropProps) => JSX.Element
```

<a id="api-4d656e752e4261636b64726f702e2470726f70732e636c617373"></a>

<a id="MenuBackdrop-class"></a>

<a id="api-4d656e752e4261636b64726f702e2470726f70732e7374796c65"></a>

<a id="MenuBackdrop-style"></a>

<a id="api-4d656e752e4261636b64726f702e2470726f70732e72656e646572"></a>

<a id="MenuBackdrop-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<ContextMenuBackdropState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ContextMenuBackdropState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ContextMenuBackdropState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-4d656e754261636b64726f7044617461417474726962757465732e6f70656e"></a>

<a id="api-4d656e754261636b64726f7044617461417474726962757465732e636c6f736564"></a>

<a id="api-4d656e754261636b64726f7044617461417474726962757465732e7374617274696e675374796c65"></a>

<a id="api-4d656e754261636b64726f7044617461417474726962757465732e656e64696e675374796c65"></a>

| Name | Description |
| --- | --- |
| data-open |  |
| data-closed |  |
| data-starting-style |  |
| data-ending-style |  |

#### CSS variables

Metadata status: unavailable.

<a id="api-4d656e752e4261636b64726f702e50726f7073"></a>

<a id="menubackdropprops"></a>

<a id="api-4d656e752e4261636b64726f702e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Menu.Backdrop.Props

Declaration: `packages/solid/build/types/menu/backdrop/MenuBackdrop.d.ts:11`

#### Declaration

```typescript
MenuBackdropProps
```

<a id="api-4d656e752e4261636b64726f702e50726f70732e636c617373"></a>

<a id="MenuBackdropProps-class"></a>

<a id="api-4d656e752e4261636b64726f702e50726f70732e7374796c65"></a>

<a id="MenuBackdropProps-style"></a>

<a id="api-4d656e752e4261636b64726f702e50726f70732e72656e646572"></a>

<a id="MenuBackdropProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<ContextMenuBackdropState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ContextMenuBackdropState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ContextMenuBackdropState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4d656e752e4261636b64726f702e5374617465"></a>

<a id="menubackdropstate"></a>

### Related exported type: Menu.Backdrop.State

Declaration: `packages/solid/build/types/menu/backdrop/MenuBackdrop.d.ts:12`

#### Declaration

```typescript
MenuBackdropState
```

<a id="api-4d656e752e4261636b64726f702e53746174652e6f70656e"></a>

<a id="MenuBackdropState-open"></a>

<a id="api-4d656e752e4261636b64726f702e53746174652e7472616e736974696f6e537461747573"></a>

<a id="MenuBackdropState-transitionStatus"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| open | `boolean` | Yes | Unavailable |  |
| transitionStatus | `TransitionStatus` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="positioner"></a>

### Positioner

<a id="api-4d656e752e506f736974696f6e6572"></a>

<a id="menupositioner"></a>

<a id="api-4d656e752e506f736974696f6e65722e2470726f70732e70726f703a616c69676e"></a>

### Menu.Positioner

Declaration: `packages/solid/build/types/menu/positioner/MenuPositioner.d.ts:13`

#### Declaration

```typescript
(props: MenuPositionerProps) => JSX.Element
```

<a id="api-4d656e752e506f736974696f6e65722e2470726f70732e64697361626c65416e63686f72547261636b696e67"></a>

<a id="MenuPositioner-disableAnchorTracking"></a>

<a id="api-4d656e752e506f736974696f6e65722e2470726f70732e616c69676e"></a>

<a id="MenuPositioner-align"></a>

<a id="api-4d656e752e506f736974696f6e65722e2470726f70732e616c69676e4f6666736574"></a>

<a id="MenuPositioner-alignOffset"></a>

<a id="api-4d656e752e506f736974696f6e65722e2470726f70732e73696465"></a>

<a id="MenuPositioner-side"></a>

<a id="api-4d656e752e506f736974696f6e65722e2470726f70732e736964654f6666736574"></a>

<a id="MenuPositioner-sideOffset"></a>

<a id="api-4d656e752e506f736974696f6e65722e2470726f70732e6172726f7750616464696e67"></a>

<a id="MenuPositioner-arrowPadding"></a>

<a id="api-4d656e752e506f736974696f6e65722e2470726f70732e616e63686f72"></a>

<a id="MenuPositioner-anchor"></a>

<a id="api-4d656e752e506f736974696f6e65722e2470726f70732e636f6c6c6973696f6e41766f6964616e6365"></a>

<a id="MenuPositioner-collisionAvoidance"></a>

<a id="api-4d656e752e506f736974696f6e65722e2470726f70732e636f6c6c6973696f6e426f756e64617279"></a>

<a id="MenuPositioner-collisionBoundary"></a>

<a id="api-4d656e752e506f736974696f6e65722e2470726f70732e636f6c6c6973696f6e50616464696e67"></a>

<a id="MenuPositioner-collisionPadding"></a>

<a id="api-4d656e752e506f736974696f6e65722e2470726f70732e737469636b79"></a>

<a id="MenuPositioner-sticky"></a>

<a id="api-4d656e752e506f736974696f6e65722e2470726f70732e706f736974696f6e4d6574686f64"></a>

<a id="MenuPositioner-positionMethod"></a>

<a id="api-4d656e752e506f736974696f6e65722e2470726f70732e636c617373"></a>

<a id="MenuPositioner-class"></a>

<a id="api-4d656e752e506f736974696f6e65722e2470726f70732e7374796c65"></a>

<a id="MenuPositioner-style"></a>

<a id="api-4d656e752e506f736974696f6e65722e2470726f70732e72656e646572"></a>

<a id="MenuPositioner-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| disableAnchorTracking | `boolean \| undefined` | No | false | Disables ancestor-scroll, element-resize and layout-shift observation used for automatic positioning updates. |
| align | `Align \| undefined` | No | Unavailable | Preferred alignment along the anchor’s side. Collision handling can change the resolved alignment. |
| alignOffset | `number \| OffsetFunction \| undefined` | No | Unavailable | Offset along the alignment axis, in pixels. A callback receives anchor and positioner dimensions plus the side and alignment. |
| side | `Side \| undefined` | No | Unavailable | Preferred side of the anchor. Logical inline sides follow the text direction; collision handling can change the resolved side. |
| sideOffset | `number \| OffsetFunction \| undefined` | No | Unavailable | Distance from the anchor along the side axis, in pixels. A callback receives anchor and positioner dimensions plus the side and alignment. |
| arrowPadding | `number \| undefined` | No | 5 | Minimum padding in pixels between the arrow and the floating element’s edges. |
| anchor | `ReferenceType \| (() => ReferenceType \| null) \| null \| undefined` | No | Unavailable | Positioning reference: an element or virtual reference, or an accessor returning one. A nullish reference falls back to the root’s reference. |
| collisionAvoidance | `{ side?: "flip" \| "shift" \| "none"; align?: "flip" \| "shift" \| "none"; fallbackAxisSide?: "start" \| "end" \| "none"; } \| undefined` | No | { fallbackAxisSide: 'none' } | Controls flipping or shifting along the side and alignment axes, including fallback placement on the perpendicular axis. |
| collisionBoundary | `Boundary \| "clipping-ancestors" \| undefined` | No | 'clipping-ancestors' | Boundary used to detect overflow. The clipping-ancestors value uses clipping ancestors as the overflow boundary. |
| collisionPadding | `Padding \| undefined` | No | 5 | Space in pixels reserved inside the collision boundary, either for all edges or per edge. |
| sticky | `boolean \| undefined` | No | false | Allows shifting along the side axis without the usual limitShift limiter. |
| positionMethod | `"fixed" \| "absolute" \| undefined` | No | 'absolute' | CSS positioning strategy used by the floating element: absolute or fixed. |
| class | `JSX.ClassValue \| ((state: Readonly<MenuPositionerState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<MenuPositionerState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, MenuPositionerState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-4d656e75506f736974696f6e657244617461417474726962757465732e6f70656e"></a>

<a id="api-4d656e75506f736974696f6e657244617461417474726962757465732e636c6f736564"></a>

<a id="api-4d656e75506f736974696f6e657244617461417474726962757465732e616e63686f7248696464656e"></a>

<a id="api-4d656e75506f736974696f6e657244617461417474726962757465732e616c69676e"></a>

<a id="api-4d656e75506f736974696f6e657244617461417474726962757465732e73696465"></a>

| Name | Description |
| --- | --- |
| data-open |  |
| data-closed |  |
| data-anchor-hidden |  |
| data-align |  |
| data-side |  |

#### CSS variables

<a id="api-4d656e75506f736974696f6e65724373735661726961626c65732e616e63686f72486569676874"></a>

<a id="api-4d656e75506f736974696f6e65724373735661726961626c65732e616e63686f725769647468"></a>

<a id="api-4d656e75506f736974696f6e65724373735661726961626c65732e617661696c61626c65486569676874"></a>

<a id="api-4d656e75506f736974696f6e65724373735661726961626c65732e617661696c61626c655769647468"></a>

<a id="api-4d656e75506f736974696f6e65724373735661726961626c65732e706f736974696f6e6572486569676874"></a>

<a id="api-4d656e75506f736974696f6e65724373735661726961626c65732e706f736974696f6e65725769647468"></a>

<a id="api-4d656e75506f736974696f6e65724373735661726961626c65732e7472616e73666f726d4f726967696e"></a>

| Name | Description |
| --- | --- |
| --anchor-height |  |
| --anchor-width |  |
| --available-height |  |
| --available-width |  |
| --positioner-height |  |
| --positioner-width |  |
| --transform-origin |  |

<a id="api-4d656e752e506f736974696f6e65722e50726f7073"></a>

<a id="menupositionerprops"></a>

<a id="api-4d656e752e506f736974696f6e65722e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Menu.Positioner.Props

Declaration: `packages/solid/build/types/menu/positioner/MenuPositioner.d.ts:15`

#### Declaration

```typescript
MenuPositionerProps
```

<a id="api-4d656e752e506f736974696f6e65722e50726f70732e64697361626c65416e63686f72547261636b696e67"></a>

<a id="MenuPositionerProps-disableAnchorTracking"></a>

<a id="api-4d656e752e506f736974696f6e65722e50726f70732e616c69676e"></a>

<a id="MenuPositionerProps-align"></a>

<a id="api-4d656e752e506f736974696f6e65722e50726f70732e616c69676e4f6666736574"></a>

<a id="MenuPositionerProps-alignOffset"></a>

<a id="api-4d656e752e506f736974696f6e65722e50726f70732e73696465"></a>

<a id="MenuPositionerProps-side"></a>

<a id="api-4d656e752e506f736974696f6e65722e50726f70732e736964654f6666736574"></a>

<a id="MenuPositionerProps-sideOffset"></a>

<a id="api-4d656e752e506f736974696f6e65722e50726f70732e6172726f7750616464696e67"></a>

<a id="MenuPositionerProps-arrowPadding"></a>

<a id="api-4d656e752e506f736974696f6e65722e50726f70732e616e63686f72"></a>

<a id="MenuPositionerProps-anchor"></a>

<a id="api-4d656e752e506f736974696f6e65722e50726f70732e636f6c6c6973696f6e41766f6964616e6365"></a>

<a id="MenuPositionerProps-collisionAvoidance"></a>

<a id="api-4d656e752e506f736974696f6e65722e50726f70732e636f6c6c6973696f6e426f756e64617279"></a>

<a id="MenuPositionerProps-collisionBoundary"></a>

<a id="api-4d656e752e506f736974696f6e65722e50726f70732e636f6c6c6973696f6e50616464696e67"></a>

<a id="MenuPositionerProps-collisionPadding"></a>

<a id="api-4d656e752e506f736974696f6e65722e50726f70732e737469636b79"></a>

<a id="MenuPositionerProps-sticky"></a>

<a id="api-4d656e752e506f736974696f6e65722e50726f70732e706f736974696f6e4d6574686f64"></a>

<a id="MenuPositionerProps-positionMethod"></a>

<a id="api-4d656e752e506f736974696f6e65722e50726f70732e636c617373"></a>

<a id="MenuPositionerProps-class"></a>

<a id="api-4d656e752e506f736974696f6e65722e50726f70732e7374796c65"></a>

<a id="MenuPositionerProps-style"></a>

<a id="api-4d656e752e506f736974696f6e65722e50726f70732e72656e646572"></a>

<a id="MenuPositionerProps-render"></a>

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
| class | `JSX.ClassValue \| ((state: Readonly<MenuPositionerState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<MenuPositionerState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, MenuPositionerState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4d656e752e506f736974696f6e65722e5374617465"></a>

<a id="menupositionerstate"></a>

### Related exported type: Menu.Positioner.State

Declaration: `packages/solid/build/types/menu/positioner/MenuPositioner.d.ts:16`

#### Declaration

```typescript
MenuPositionerState
```

<a id="api-4d656e752e506f736974696f6e65722e53746174652e6f70656e"></a>

<a id="MenuPositionerState-open"></a>

<a id="api-4d656e752e506f736974696f6e65722e53746174652e616e63686f7248696464656e"></a>

<a id="MenuPositionerState-anchorHidden"></a>

<a id="api-4d656e752e506f736974696f6e65722e53746174652e696e7374616e74"></a>

<a id="MenuPositionerState-instant"></a>

<a id="api-4d656e752e506f736974696f6e65722e53746174652e6e6573746564"></a>

<a id="MenuPositionerState-nested"></a>

<a id="api-4d656e752e506f736974696f6e65722e53746174652e616c69676e"></a>

<a id="MenuPositionerState-align"></a>

<a id="api-4d656e752e506f736974696f6e65722e53746174652e73696465"></a>

<a id="MenuPositionerState-side"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| open | `boolean` | Yes | Unavailable |  |
| anchorHidden | `boolean` | Yes | Unavailable |  |
| instant | `string \| undefined` | Yes | Unavailable |  |
| nested | `boolean` | Yes | Unavailable |  |
| align | `Align` | Yes | Unavailable |  |
| side | `Side` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="popup"></a>

### Popup

<a id="api-4d656e752e506f707570"></a>

<a id="menupopup"></a>

<a id="api-4d656e752e506f7075702e2470726f70732e70726f703a616c69676e"></a>

### Menu.Popup

Declaration: `packages/solid/build/types/menu/popup/MenuPopup.d.ts:22`

#### Declaration

```typescript
(props: MenuPopupProps) => JSX.Element
```

<a id="api-4d656e752e506f7075702e2470726f70732e66696e616c466f637573"></a>

<a id="MenuPopup-finalFocus"></a>

<a id="api-4d656e752e506f7075702e2470726f70732e636c617373"></a>

<a id="MenuPopup-class"></a>

<a id="api-4d656e752e506f7075702e2470726f70732e7374796c65"></a>

<a id="MenuPopup-style"></a>

<a id="api-4d656e752e506f7075702e2470726f70732e72656e646572"></a>

<a id="MenuPopup-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| finalFocus | `boolean \| (() => HTMLElement \| null) \| ((closeType: InteractionType) => boolean \| HTMLElement \| null \| void) \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<ContextMenuPopupState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ContextMenuPopupState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ContextMenuPopupState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-4d656e75506f70757044617461417474726962757465732e6f70656e"></a>

<a id="api-4d656e75506f70757044617461417474726962757465732e636c6f736564"></a>

<a id="api-4d656e75506f70757044617461417474726962757465732e616c69676e"></a>

<a id="api-4d656e75506f70757044617461417474726962757465732e696e7374616e74"></a>

<a id="api-4d656e75506f70757044617461417474726962757465732e73696465"></a>

<a id="api-4d656e75506f70757044617461417474726962757465732e7374617274696e675374796c65"></a>

<a id="api-4d656e75506f70757044617461417474726962757465732e656e64696e675374796c65"></a>

| Name | Description |
| --- | --- |
| data-open |  |
| data-closed |  |
| data-align |  |
| data-instant |  |
| data-side |  |
| data-starting-style |  |
| data-ending-style |  |

#### CSS variables

Metadata status: unavailable.

<a id="api-4d656e752e506f7075702e50726f7073"></a>

<a id="menupopupprops"></a>

<a id="api-4d656e752e506f7075702e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Menu.Popup.Props

Declaration: `packages/solid/build/types/menu/popup/MenuPopup.d.ts:24`

#### Declaration

```typescript
MenuPopupProps
```

<a id="api-4d656e752e506f7075702e50726f70732e66696e616c466f637573"></a>

<a id="MenuPopupProps-finalFocus"></a>

<a id="api-4d656e752e506f7075702e50726f70732e636c617373"></a>

<a id="MenuPopupProps-class"></a>

<a id="api-4d656e752e506f7075702e50726f70732e7374796c65"></a>

<a id="MenuPopupProps-style"></a>

<a id="api-4d656e752e506f7075702e50726f70732e72656e646572"></a>

<a id="MenuPopupProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| finalFocus | `boolean \| (() => HTMLElement \| null) \| ((closeType: InteractionType) => boolean \| HTMLElement \| null \| void) \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<ContextMenuPopupState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ContextMenuPopupState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ContextMenuPopupState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4d656e752e506f7075702e5374617465"></a>

<a id="menupopupstate"></a>

### Related exported type: Menu.Popup.State

Declaration: `packages/solid/build/types/menu/popup/MenuPopup.d.ts:25`

#### Declaration

```typescript
MenuPopupState
```

<a id="api-4d656e752e506f7075702e53746174652e6f70656e"></a>

<a id="MenuPopupState-open"></a>

<a id="api-4d656e752e506f7075702e53746174652e696e7374616e74"></a>

<a id="MenuPopupState-instant"></a>

<a id="api-4d656e752e506f7075702e53746174652e6e6573746564"></a>

<a id="MenuPopupState-nested"></a>

<a id="api-4d656e752e506f7075702e53746174652e7472616e736974696f6e537461747573"></a>

<a id="MenuPopupState-transitionStatus"></a>

<a id="api-4d656e752e506f7075702e53746174652e616c69676e"></a>

<a id="MenuPopupState-align"></a>

<a id="api-4d656e752e506f7075702e53746174652e73696465"></a>

<a id="MenuPopupState-side"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| open | `boolean` | Yes | Unavailable |  |
| instant | `MenuInstant` | Yes | Unavailable |  |
| nested | `boolean` | Yes | Unavailable |  |
| transitionStatus | `TransitionStatus` | Yes | Unavailable |  |
| align | `Align` | Yes | Unavailable |  |
| side | `Side` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="viewport"></a>

### Viewport

<a id="api-4d656e752e56696577706f7274"></a>

<a id="menuviewport"></a>

<a id="api-4d656e752e56696577706f72742e2470726f70732e70726f703a616c69676e"></a>

### Menu.Viewport

Declaration: `packages/solid/build/types/menu/viewport/MenuViewport.d.ts:10`

#### Declaration

```typescript
(props: MenuViewportProps) => JSX.Element
```

<a id="api-4d656e752e56696577706f72742e2470726f70732e636c617373"></a>

<a id="MenuViewport-class"></a>

<a id="api-4d656e752e56696577706f72742e2470726f70732e7374796c65"></a>

<a id="MenuViewport-style"></a>

<a id="api-4d656e752e56696577706f72742e2470726f70732e72656e646572"></a>

<a id="MenuViewport-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<MenuViewportState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<MenuViewportState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, MenuViewportState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-4d656e7556696577706f727444617461417474726962757465732e61637469766174696f6e446972656374696f6e"></a>

<a id="api-4d656e7556696577706f727444617461417474726962757465732e63757272656e74"></a>

<a id="api-4d656e7556696577706f727444617461417474726962757465732e696e7374616e74"></a>

<a id="api-4d656e7556696577706f727444617461417474726962757465732e70726576696f7573"></a>

<a id="api-4d656e7556696577706f727444617461417474726962757465732e7472616e736974696f6e696e67"></a>

| Name | Description |
| --- | --- |
| data-activation-direction |  |
| data-current |  |
| data-instant |  |
| data-previous |  |
| data-transitioning |  |

#### CSS variables

<a id="api-4d656e7556696577706f72744373735661726961626c65732e706f707570486569676874"></a>

<a id="api-4d656e7556696577706f72744373735661726961626c65732e706f7075705769647468"></a>

| Name | Description |
| --- | --- |
| --popup-height |  |
| --popup-width |  |

<a id="api-4d656e752e56696577706f72742e50726f7073"></a>

<a id="menuviewportprops"></a>

<a id="api-4d656e752e56696577706f72742e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Menu.Viewport.Props

Declaration: `packages/solid/build/types/menu/viewport/MenuViewport.d.ts:12`

#### Declaration

```typescript
MenuViewportProps
```

<a id="api-4d656e752e56696577706f72742e50726f70732e636c617373"></a>

<a id="MenuViewportProps-class"></a>

<a id="api-4d656e752e56696577706f72742e50726f70732e7374796c65"></a>

<a id="MenuViewportProps-style"></a>

<a id="api-4d656e752e56696577706f72742e50726f70732e72656e646572"></a>

<a id="MenuViewportProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<MenuViewportState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<MenuViewportState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, MenuViewportState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4d656e752e56696577706f72742e5374617465"></a>

<a id="menuviewportstate"></a>

### Related exported type: Menu.Viewport.State

Declaration: `packages/solid/build/types/menu/viewport/MenuViewport.d.ts:13`

#### Declaration

```typescript
MenuViewportState
```

<a id="api-4d656e752e56696577706f72742e53746174652e61637469766174696f6e446972656374696f6e"></a>

<a id="MenuViewportState-activationDirection"></a>

<a id="api-4d656e752e56696577706f72742e53746174652e696e7374616e74"></a>

<a id="MenuViewportState-instant"></a>

<a id="api-4d656e752e56696577706f72742e53746174652e7472616e736974696f6e696e67"></a>

<a id="MenuViewportState-transitioning"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| activationDirection | `string \| undefined` | Yes | Unavailable |  |
| instant | `MenuInstant` | Yes | Unavailable |  |
| transitioning | `boolean` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

The `Viewport` is optional — reach for it only when a single popup is opened by multiple triggers, its content differs per trigger, and the switch between them is animated. When used, set `width: var(--positioner-width)` and `height: var(--positioner-height)` on the `Positioner` so its box is frozen to the measured size during the transition; otherwise content-driven resizing can make the popup thrash or flip to another side.

<a id="arrow-1"></a>

### Arrow

<a id="api-4d656e752e4172726f77"></a>

<a id="menuarrow"></a>

<a id="api-4d656e752e4172726f772e2470726f70732e70726f703a616c69676e"></a>

### Menu.Arrow

Declaration: `packages/solid/build/types/menu/arrow/MenuArrow.d.ts:11`

#### Declaration

```typescript
(props: MenuArrowProps) => JSX.Element
```

<a id="api-4d656e752e4172726f772e2470726f70732e636c617373"></a>

<a id="MenuArrow-class"></a>

<a id="api-4d656e752e4172726f772e2470726f70732e7374796c65"></a>

<a id="MenuArrow-style"></a>

<a id="api-4d656e752e4172726f772e2470726f70732e72656e646572"></a>

<a id="MenuArrow-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<ContextMenuArrowState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ContextMenuArrowState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ContextMenuArrowState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-4d656e754172726f7744617461417474726962757465732e6f70656e"></a>

<a id="api-4d656e754172726f7744617461417474726962757465732e636c6f736564"></a>

<a id="api-4d656e754172726f7744617461417474726962757465732e756e63656e7465726564"></a>

<a id="api-4d656e754172726f7744617461417474726962757465732e616c69676e"></a>

<a id="api-4d656e754172726f7744617461417474726962757465732e73696465"></a>

| Name | Description |
| --- | --- |
| data-open |  |
| data-closed |  |
| data-uncentered |  |
| data-align |  |
| data-side |  |

#### CSS variables

Metadata status: unavailable.

<a id="api-4d656e752e4172726f772e50726f7073"></a>

<a id="menuarrowprops"></a>

<a id="api-4d656e752e4172726f772e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Menu.Arrow.Props

Declaration: `packages/solid/build/types/menu/arrow/MenuArrow.d.ts:13`

#### Declaration

```typescript
MenuArrowProps
```

<a id="api-4d656e752e4172726f772e50726f70732e636c617373"></a>

<a id="MenuArrowProps-class"></a>

<a id="api-4d656e752e4172726f772e50726f70732e7374796c65"></a>

<a id="MenuArrowProps-style"></a>

<a id="api-4d656e752e4172726f772e50726f70732e72656e646572"></a>

<a id="MenuArrowProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<ContextMenuArrowState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ContextMenuArrowState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ContextMenuArrowState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4d656e752e4172726f772e5374617465"></a>

<a id="menuarrowstate"></a>

### Related exported type: Menu.Arrow.State

Declaration: `packages/solid/build/types/menu/arrow/MenuArrow.d.ts:14`

#### Declaration

```typescript
MenuArrowState
```

<a id="api-4d656e752e4172726f772e53746174652e6f70656e"></a>

<a id="MenuArrowState-open"></a>

<a id="api-4d656e752e4172726f772e53746174652e756e63656e7465726564"></a>

<a id="MenuArrowState-uncentered"></a>

<a id="api-4d656e752e4172726f772e53746174652e616c69676e"></a>

<a id="MenuArrowState-align"></a>

<a id="api-4d656e752e4172726f772e53746174652e73696465"></a>

<a id="MenuArrowState-side"></a>

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

<a id="input"></a>

### Input

<a id="api-4d656e752e496e707574"></a>

<a id="menuinput"></a>

<a id="api-4d656e752e496e7075742e2470726f70732e70726f703a616363657074"></a>

<a id="api-4d656e752e496e7075742e2470726f70732e70726f703a616c69676e"></a>

<a id="api-4d656e752e496e7075742e2470726f70732e70726f703a616c74"></a>

<a id="api-4d656e752e496e7075742e2470726f70732e70726f703a6175746f636f6d706c657465"></a>

<a id="api-4d656e752e496e7075742e2470726f70732e70726f703a63617074757265"></a>

<a id="api-4d656e752e496e7075742e2470726f70732e70726f703a6469724e616d65"></a>

<a id="api-4d656e752e496e7075742e2470726f70732e70726f703a64697361626c6564"></a>

<a id="api-4d656e752e496e7075742e2470726f70732e70726f703a666f726d416374696f6e"></a>

<a id="api-4d656e752e496e7075742e2470726f70732e70726f703a666f726d456e6374797065"></a>

<a id="api-4d656e752e496e7075742e2470726f70732e70726f703a666f726d4d6574686f64"></a>

<a id="api-4d656e752e496e7075742e2470726f70732e70726f703a666f726d4e6f56616c6964617465"></a>

<a id="api-4d656e752e496e7075742e2470726f70732e70726f703a666f726d546172676574"></a>

<a id="api-4d656e752e496e7075742e2470726f70732e70726f703a686569676874"></a>

<a id="api-4d656e752e496e7075742e2470726f70732e70726f703a696e64657465726d696e617465"></a>

<a id="api-4d656e752e496e7075742e2470726f70732e70726f703a6d6178"></a>

<a id="api-4d656e752e496e7075742e2470726f70732e70726f703a6d61784c656e677468"></a>

<a id="api-4d656e752e496e7075742e2470726f70732e70726f703a6d696e"></a>

<a id="api-4d656e752e496e7075742e2470726f70732e70726f703a6d696e4c656e677468"></a>

<a id="api-4d656e752e496e7075742e2470726f70732e70726f703a6d756c7469706c65"></a>

<a id="api-4d656e752e496e7075742e2470726f70732e70726f703a6e616d65"></a>

<a id="api-4d656e752e496e7075742e2470726f70732e70726f703a7061747465726e"></a>

<a id="api-4d656e752e496e7075742e2470726f70732e70726f703a706c616365686f6c646572"></a>

<a id="api-4d656e752e496e7075742e2470726f70732e70726f703a706f706f766572546172676574416374696f6e"></a>

<a id="api-4d656e752e496e7075742e2470726f70732e70726f703a706f706f766572546172676574456c656d656e74"></a>

<a id="api-4d656e752e496e7075742e2470726f70732e70726f703a726561644f6e6c79"></a>

<a id="api-4d656e752e496e7075742e2470726f70732e70726f703a7265717569726564"></a>

<a id="api-4d656e752e496e7075742e2470726f70732e70726f703a73656c656374696f6e446972656374696f6e"></a>

<a id="api-4d656e752e496e7075742e2470726f70732e70726f703a73656c656374696f6e456e64"></a>

<a id="api-4d656e752e496e7075742e2470726f70732e70726f703a73656c656374696f6e5374617274"></a>

<a id="api-4d656e752e496e7075742e2470726f70732e70726f703a73697a65"></a>

<a id="api-4d656e752e496e7075742e2470726f70732e70726f703a737263"></a>

<a id="api-4d656e752e496e7075742e2470726f70732e70726f703a73746570"></a>

<a id="api-4d656e752e496e7075742e2470726f70732e70726f703a74797065"></a>

<a id="api-4d656e752e496e7075742e2470726f70732e70726f703a7573654d6170"></a>

<a id="api-4d656e752e496e7075742e2470726f70732e70726f703a76616c7565417344617465"></a>

<a id="api-4d656e752e496e7075742e2470726f70732e70726f703a76616c756541734e756d626572"></a>

<a id="api-4d656e752e496e7075742e2470726f70732e70726f703a7765626b69746469726563746f7279"></a>

<a id="api-4d656e752e496e7075742e2470726f70732e70726f703a7769647468"></a>

### Menu.Input

Declaration: `packages/solid/build/types/menu/input/MenuInput.d.ts:6`

#### Declaration

```typescript
(props: MenuInputProps) => JSX.Element
```

<a id="api-4d656e752e496e7075742e2470726f70732e6964"></a>

<a id="MenuInput-id"></a>

<a id="api-4d656e752e496e7075742e2470726f70732e636c617373"></a>

<a id="MenuInput-class"></a>

<a id="api-4d656e752e496e7075742e2470726f70732e7374796c65"></a>

<a id="MenuInput-style"></a>

<a id="api-4d656e752e496e7075742e2470726f70732e72656e646572"></a>

<a id="MenuInput-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| id | `string \| null \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<FilterDropdownInputState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<FilterDropdownInputState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, FilterDropdownInputState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accept`, `accesskey`, `align`, `alpha`, `alt`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocomplete`, `autocorrect`, `autofocus`, `capture`, `checked`, `children`, `colorspace`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `dirname`, `disabled`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `form`, `formaction`, `formenctype`, `formmethod`, `formnovalidate`, `formtarget`, `height`, `hidden`, `incremental`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `list`, `max`, `maxlength`, `min`, `minlength`, `multiple`, `name`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `pattern`, `placeholder`, `popover`, `popovertarget`, `popovertargetaction`, `prefix`, `prop:accept`, `prop:align`, `prop:alt`, `prop:autocomplete`, `prop:capture`, `prop:checked`, `prop:defaultChecked`, `prop:defaultValue`, `prop:dirName`, `prop:disabled`, `prop:formAction`, `prop:formEnctype`, `prop:formMethod`, `prop:formNoValidate`, `prop:formTarget`, `prop:height`, `prop:indeterminate`, `prop:max`, `prop:maxLength`, `prop:min`, `prop:minLength`, `prop:multiple`, `prop:name`, `prop:pattern`, `prop:placeholder`, `prop:popoverTargetAction`, `prop:popoverTargetElement`, `prop:readOnly`, `prop:required`, `prop:selectionDirection`, `prop:selectionEnd`, `prop:selectionStart`, `prop:size`, `prop:src`, `prop:step`, `prop:type`, `prop:useMap`, `prop:value`, `prop:valueAsDate`, `prop:valueAsNumber`, `prop:webkitdirectory`, `prop:width`, `property`, `readonly`, `ref`, `required`, `resource`, `results`, `role`, `size`, `slot`, `spellcheck`, `src`, `step`, `tabindex`, `textContent`, `title`, `translate`, `type`, `typeof`, `usemap`, `value`, `virtualkeyboardpolicy`, `vocab`, `webkitdirectory`, `width`, `writingsuggestions`

#### Data attributes

<a id="api-4d656e75496e70757444617461417474726962757465732e686967686c696768746564"></a>

| Name | Description |
| --- | --- |
| data-highlighted |  |

#### CSS variables

Metadata status: unavailable.

<a id="api-4d656e752e496e7075742e50726f7073"></a>

<a id="menuinputprops"></a>

<a id="api-4d656e752e496e7075742e50726f70732e70726f703a616363657074"></a>

<a id="api-4d656e752e496e7075742e50726f70732e70726f703a616c69676e"></a>

<a id="api-4d656e752e496e7075742e50726f70732e70726f703a616c74"></a>

<a id="api-4d656e752e496e7075742e50726f70732e70726f703a6175746f636f6d706c657465"></a>

<a id="api-4d656e752e496e7075742e50726f70732e70726f703a63617074757265"></a>

<a id="api-4d656e752e496e7075742e50726f70732e70726f703a6469724e616d65"></a>

<a id="api-4d656e752e496e7075742e50726f70732e70726f703a64697361626c6564"></a>

<a id="api-4d656e752e496e7075742e50726f70732e70726f703a666f726d416374696f6e"></a>

<a id="api-4d656e752e496e7075742e50726f70732e70726f703a666f726d456e6374797065"></a>

<a id="api-4d656e752e496e7075742e50726f70732e70726f703a666f726d4d6574686f64"></a>

<a id="api-4d656e752e496e7075742e50726f70732e70726f703a666f726d4e6f56616c6964617465"></a>

<a id="api-4d656e752e496e7075742e50726f70732e70726f703a666f726d546172676574"></a>

<a id="api-4d656e752e496e7075742e50726f70732e70726f703a686569676874"></a>

<a id="api-4d656e752e496e7075742e50726f70732e70726f703a696e64657465726d696e617465"></a>

<a id="api-4d656e752e496e7075742e50726f70732e70726f703a6d6178"></a>

<a id="api-4d656e752e496e7075742e50726f70732e70726f703a6d61784c656e677468"></a>

<a id="api-4d656e752e496e7075742e50726f70732e70726f703a6d696e"></a>

<a id="api-4d656e752e496e7075742e50726f70732e70726f703a6d696e4c656e677468"></a>

<a id="api-4d656e752e496e7075742e50726f70732e70726f703a6d756c7469706c65"></a>

<a id="api-4d656e752e496e7075742e50726f70732e70726f703a6e616d65"></a>

<a id="api-4d656e752e496e7075742e50726f70732e70726f703a7061747465726e"></a>

<a id="api-4d656e752e496e7075742e50726f70732e70726f703a706c616365686f6c646572"></a>

<a id="api-4d656e752e496e7075742e50726f70732e70726f703a706f706f766572546172676574416374696f6e"></a>

<a id="api-4d656e752e496e7075742e50726f70732e70726f703a706f706f766572546172676574456c656d656e74"></a>

<a id="api-4d656e752e496e7075742e50726f70732e70726f703a726561644f6e6c79"></a>

<a id="api-4d656e752e496e7075742e50726f70732e70726f703a7265717569726564"></a>

<a id="api-4d656e752e496e7075742e50726f70732e70726f703a73656c656374696f6e446972656374696f6e"></a>

<a id="api-4d656e752e496e7075742e50726f70732e70726f703a73656c656374696f6e456e64"></a>

<a id="api-4d656e752e496e7075742e50726f70732e70726f703a73656c656374696f6e5374617274"></a>

<a id="api-4d656e752e496e7075742e50726f70732e70726f703a73697a65"></a>

<a id="api-4d656e752e496e7075742e50726f70732e70726f703a737263"></a>

<a id="api-4d656e752e496e7075742e50726f70732e70726f703a73746570"></a>

<a id="api-4d656e752e496e7075742e50726f70732e70726f703a74797065"></a>

<a id="api-4d656e752e496e7075742e50726f70732e70726f703a7573654d6170"></a>

<a id="api-4d656e752e496e7075742e50726f70732e70726f703a76616c7565417344617465"></a>

<a id="api-4d656e752e496e7075742e50726f70732e70726f703a76616c756541734e756d626572"></a>

<a id="api-4d656e752e496e7075742e50726f70732e70726f703a7765626b69746469726563746f7279"></a>

<a id="api-4d656e752e496e7075742e50726f70732e70726f703a7769647468"></a>

### Related exported type: Menu.Input.Props

Declaration: `packages/solid/build/types/menu/input/MenuInput.d.ts:8`

#### Declaration

```typescript
MenuInputProps
```

<a id="api-4d656e752e496e7075742e50726f70732e6964"></a>

<a id="MenuInputProps-id"></a>

<a id="api-4d656e752e496e7075742e50726f70732e636c617373"></a>

<a id="MenuInputProps-class"></a>

<a id="api-4d656e752e496e7075742e50726f70732e7374796c65"></a>

<a id="MenuInputProps-style"></a>

<a id="api-4d656e752e496e7075742e50726f70732e72656e646572"></a>

<a id="MenuInputProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| id | `string \| null \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<FilterDropdownInputState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<FilterDropdownInputState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, FilterDropdownInputState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accept`, `accesskey`, `align`, `alpha`, `alt`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocomplete`, `autocorrect`, `autofocus`, `capture`, `checked`, `children`, `colorspace`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `dirname`, `disabled`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `form`, `formaction`, `formenctype`, `formmethod`, `formnovalidate`, `formtarget`, `height`, `hidden`, `incremental`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `list`, `max`, `maxlength`, `min`, `minlength`, `multiple`, `name`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `pattern`, `placeholder`, `popover`, `popovertarget`, `popovertargetaction`, `prefix`, `prop:accept`, `prop:align`, `prop:alt`, `prop:autocomplete`, `prop:capture`, `prop:checked`, `prop:defaultChecked`, `prop:defaultValue`, `prop:dirName`, `prop:disabled`, `prop:formAction`, `prop:formEnctype`, `prop:formMethod`, `prop:formNoValidate`, `prop:formTarget`, `prop:height`, `prop:indeterminate`, `prop:max`, `prop:maxLength`, `prop:min`, `prop:minLength`, `prop:multiple`, `prop:name`, `prop:pattern`, `prop:placeholder`, `prop:popoverTargetAction`, `prop:popoverTargetElement`, `prop:readOnly`, `prop:required`, `prop:selectionDirection`, `prop:selectionEnd`, `prop:selectionStart`, `prop:size`, `prop:src`, `prop:step`, `prop:type`, `prop:useMap`, `prop:value`, `prop:valueAsDate`, `prop:valueAsNumber`, `prop:webkitdirectory`, `prop:width`, `property`, `readonly`, `ref`, `required`, `resource`, `results`, `role`, `size`, `slot`, `spellcheck`, `src`, `step`, `tabindex`, `textContent`, `title`, `translate`, `type`, `typeof`, `usemap`, `value`, `virtualkeyboardpolicy`, `vocab`, `webkitdirectory`, `width`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4d656e752e496e7075742e5374617465"></a>

<a id="menuinputstate"></a>

### Related exported type: Menu.Input.State

Declaration: `packages/solid/build/types/menu/input/MenuInput.d.ts:9`

#### Declaration

```typescript
MenuInputState
```

<a id="api-4d656e752e496e7075742e53746174652e686967686c696768746564"></a>

<a id="MenuInputState-highlighted"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| highlighted | `boolean` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="clear"></a>

### Clear

<a id="api-4d656e752e436c656172"></a>

<a id="menuclear"></a>

<a id="api-4d656e752e436c6561722e2470726f70732e70726f703a64697361626c6564"></a>

<a id="api-4d656e752e436c6561722e2470726f70732e70726f703a666f726d416374696f6e"></a>

<a id="api-4d656e752e436c6561722e2470726f70732e70726f703a666f726d456e6374797065"></a>

<a id="api-4d656e752e436c6561722e2470726f70732e70726f703a666f726d4d6574686f64"></a>

<a id="api-4d656e752e436c6561722e2470726f70732e70726f703a666f726d4e6f56616c6964617465"></a>

<a id="api-4d656e752e436c6561722e2470726f70732e70726f703a666f726d546172676574"></a>

<a id="api-4d656e752e436c6561722e2470726f70732e70726f703a6e616d65"></a>

<a id="api-4d656e752e436c6561722e2470726f70732e70726f703a706f706f766572546172676574416374696f6e"></a>

<a id="api-4d656e752e436c6561722e2470726f70732e70726f703a706f706f766572546172676574456c656d656e74"></a>

<a id="api-4d656e752e436c6561722e2470726f70732e70726f703a74797065"></a>

<a id="api-4d656e752e436c6561722e2470726f70732e70726f703a76616c7565"></a>

### Menu.Clear

Declaration: `packages/solid/build/types/menu/clear/MenuClear.d.ts:6`

#### Declaration

```typescript
(props: MenuClearProps) => JSX.Element
```

<a id="api-4d656e752e436c6561722e2470726f70732e6e6174697665427574746f6e"></a>

<a id="MenuClear-nativeButton"></a>

<a id="api-4d656e752e436c6561722e2470726f70732e64697361626c6564"></a>

<a id="MenuClear-disabled"></a>

<a id="api-4d656e752e436c6561722e2470726f70732e636c617373"></a>

<a id="MenuClear-class"></a>

<a id="api-4d656e752e436c6561722e2470726f70732e7374796c65"></a>

<a id="MenuClear-style"></a>

<a id="api-4d656e752e436c6561722e2470726f70732e72656e646572"></a>

<a id="MenuClear-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| nativeButton | `boolean \| undefined` | No | Unavailable | Whether the rendered host is a native button. Set false when supplying a non-button host through render. |
| disabled | `boolean \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<FilterDropdownClearState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<FilterDropdownClearState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, FilterDropdownClearState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `command`, `commandfor`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `form`, `formaction`, `formenctype`, `formmethod`, `formnovalidate`, `formtarget`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `name`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `popovertarget`, `popovertargetaction`, `prefix`, `prop:disabled`, `prop:formAction`, `prop:formEnctype`, `prop:formMethod`, `prop:formNoValidate`, `prop:formTarget`, `prop:name`, `prop:popoverTargetAction`, `prop:popoverTargetElement`, `prop:type`, `prop:value`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `type`, `typeof`, `value`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-4d656e75436c65617244617461417474726962757465732e64697361626c6564"></a>

| Name | Description |
| --- | --- |
| data-disabled |  |

#### CSS variables

Metadata status: unavailable.

<a id="api-4d656e752e436c6561722e50726f7073"></a>

<a id="menuclearprops"></a>

<a id="api-4d656e752e436c6561722e50726f70732e70726f703a64697361626c6564"></a>

<a id="api-4d656e752e436c6561722e50726f70732e70726f703a666f726d416374696f6e"></a>

<a id="api-4d656e752e436c6561722e50726f70732e70726f703a666f726d456e6374797065"></a>

<a id="api-4d656e752e436c6561722e50726f70732e70726f703a666f726d4d6574686f64"></a>

<a id="api-4d656e752e436c6561722e50726f70732e70726f703a666f726d4e6f56616c6964617465"></a>

<a id="api-4d656e752e436c6561722e50726f70732e70726f703a666f726d546172676574"></a>

<a id="api-4d656e752e436c6561722e50726f70732e70726f703a6e616d65"></a>

<a id="api-4d656e752e436c6561722e50726f70732e70726f703a706f706f766572546172676574416374696f6e"></a>

<a id="api-4d656e752e436c6561722e50726f70732e70726f703a706f706f766572546172676574456c656d656e74"></a>

<a id="api-4d656e752e436c6561722e50726f70732e70726f703a74797065"></a>

<a id="api-4d656e752e436c6561722e50726f70732e70726f703a76616c7565"></a>

### Related exported type: Menu.Clear.Props

Declaration: `packages/solid/build/types/menu/clear/MenuClear.d.ts:8`

#### Declaration

```typescript
MenuClearProps
```

<a id="api-4d656e752e436c6561722e50726f70732e6e6174697665427574746f6e"></a>

<a id="MenuClearProps-nativeButton"></a>

<a id="api-4d656e752e436c6561722e50726f70732e64697361626c6564"></a>

<a id="MenuClearProps-disabled"></a>

<a id="api-4d656e752e436c6561722e50726f70732e636c617373"></a>

<a id="MenuClearProps-class"></a>

<a id="api-4d656e752e436c6561722e50726f70732e7374796c65"></a>

<a id="MenuClearProps-style"></a>

<a id="api-4d656e752e436c6561722e50726f70732e72656e646572"></a>

<a id="MenuClearProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| nativeButton | `boolean \| undefined` | No | Unavailable | Whether the rendered host is a native button. Set false when supplying a non-button host through render. |
| disabled | `boolean \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<FilterDropdownClearState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<FilterDropdownClearState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, FilterDropdownClearState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `command`, `commandfor`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `form`, `formaction`, `formenctype`, `formmethod`, `formnovalidate`, `formtarget`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `name`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `popovertarget`, `popovertargetaction`, `prefix`, `prop:disabled`, `prop:formAction`, `prop:formEnctype`, `prop:formMethod`, `prop:formNoValidate`, `prop:formTarget`, `prop:name`, `prop:popoverTargetAction`, `prop:popoverTargetElement`, `prop:type`, `prop:value`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `type`, `typeof`, `value`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4d656e752e436c6561722e5374617465"></a>

<a id="menuclearstate"></a>

### Related exported type: Menu.Clear.State

Declaration: `packages/solid/build/types/menu/clear/MenuClear.d.ts:9`

#### Declaration

```typescript
MenuClearState
```

<a id="api-4d656e752e436c6561722e53746174652e64697361626c6564"></a>

<a id="MenuClearState-disabled"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| disabled | `boolean` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="empty"></a>

### Empty

<a id="api-4d656e752e456d707479"></a>

<a id="menuempty"></a>

<a id="api-4d656e752e456d7074792e2470726f70732e70726f703a616c69676e"></a>

### Menu.Empty

Declaration: `packages/solid/build/types/menu/empty/MenuEmpty.d.ts:6`

#### Declaration

```typescript
(props: MenuEmptyProps) => JSX.Element
```

<a id="api-4d656e752e456d7074792e2470726f70732e636c617373"></a>

<a id="MenuEmpty-class"></a>

<a id="api-4d656e752e456d7074792e2470726f70732e7374796c65"></a>

<a id="MenuEmpty-style"></a>

<a id="api-4d656e752e456d7074792e2470726f70732e72656e646572"></a>

<a id="MenuEmpty-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<FilterDropdownEmptyState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<FilterDropdownEmptyState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, FilterDropdownEmptyState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4d656e752e456d7074792e50726f7073"></a>

<a id="menuemptyprops"></a>

<a id="api-4d656e752e456d7074792e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Menu.Empty.Props

Declaration: `packages/solid/build/types/menu/empty/MenuEmpty.d.ts:8`

#### Declaration

```typescript
MenuEmptyProps
```

<a id="api-4d656e752e456d7074792e50726f70732e636c617373"></a>

<a id="MenuEmptyProps-class"></a>

<a id="api-4d656e752e456d7074792e50726f70732e7374796c65"></a>

<a id="MenuEmptyProps-style"></a>

<a id="api-4d656e752e456d7074792e50726f70732e72656e646572"></a>

<a id="MenuEmptyProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<FilterDropdownEmptyState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<FilterDropdownEmptyState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, FilterDropdownEmptyState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4d656e752e456d7074792e5374617465"></a>

<a id="menuemptystate"></a>

### Related exported type: Menu.Empty.State

Declaration: `packages/solid/build/types/menu/empty/MenuEmpty.d.ts:9`

#### Declaration

```typescript
MenuEmptyState
```

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="list"></a>

### List

<a id="api-4d656e752e4c697374"></a>

<a id="menulist"></a>

<a id="api-4d656e752e4c6973742e2470726f70732e70726f703a616c69676e"></a>

### Menu.List

Declaration: `packages/solid/build/types/menu/list/MenuList.d.ts:7`

#### Declaration

```typescript
(props: MenuListProps) => JSX.Element
```

<a id="api-4d656e752e4c6973742e2470726f70732e636c617373"></a>

<a id="MenuList-class"></a>

<a id="api-4d656e752e4c6973742e2470726f70732e7374796c65"></a>

<a id="MenuList-style"></a>

<a id="api-4d656e752e4c6973742e2470726f70732e72656e646572"></a>

<a id="MenuList-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<MenuListState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<MenuListState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, MenuListState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4d656e752e4c6973742e50726f7073"></a>

<a id="menulistprops"></a>

<a id="api-4d656e752e4c6973742e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Menu.List.Props

Declaration: `packages/solid/build/types/menu/list/MenuList.d.ts:9`

#### Declaration

```typescript
MenuListProps
```

<a id="api-4d656e752e4c6973742e50726f70732e636c617373"></a>

<a id="MenuListProps-class"></a>

<a id="api-4d656e752e4c6973742e50726f70732e7374796c65"></a>

<a id="MenuListProps-style"></a>

<a id="api-4d656e752e4c6973742e50726f70732e72656e646572"></a>

<a id="MenuListProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<MenuListState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<MenuListState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, MenuListState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4d656e752e4c6973742e5374617465"></a>

<a id="menuliststate"></a>

### Related exported type: Menu.List.State

Declaration: `packages/solid/build/types/menu/list/MenuList.d.ts:10`

#### Declaration

```typescript
MenuListState
```

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="item"></a>

### Item

<a id="api-4d656e752e4974656d"></a>

<a id="menuitem"></a>

<a id="api-4d656e752e4974656d2e2470726f70732e70726f703a616c69676e"></a>

### Menu.Item

Declaration: `packages/solid/build/types/menu/item/MenuItem.d.ts:12`

#### Declaration

```typescript
(props: MenuItemProps) => JSX.Element
```

<a id="api-4d656e752e4974656d2e2470726f70732e6c6162656c"></a>

<a id="MenuItem-label"></a>

<a id="api-4d656e752e4974656d2e2470726f70732e636c6f73654f6e436c69636b"></a>

<a id="MenuItem-closeOnClick"></a>

<a id="api-4d656e752e4974656d2e2470726f70732e6e6174697665427574746f6e"></a>

<a id="MenuItem-nativeButton"></a>

<a id="api-4d656e752e4974656d2e2470726f70732e64697361626c6564"></a>

<a id="MenuItem-disabled"></a>

<a id="api-4d656e752e4974656d2e2470726f70732e636c617373"></a>

<a id="MenuItem-class"></a>

<a id="api-4d656e752e4974656d2e2470726f70732e7374796c65"></a>

<a id="MenuItem-style"></a>

<a id="api-4d656e752e4974656d2e2470726f70732e72656e646572"></a>

<a id="MenuItem-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| label | `string \| undefined` | No | Unavailable |  |
| closeOnClick | `boolean \| undefined` | No | Unavailable |  |
| nativeButton | `boolean \| undefined` | No | false |  |
| disabled | `boolean \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<ContextMenuItemState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ContextMenuItemState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ContextMenuItemState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-4d656e754974656d44617461417474726962757465732e686967686c696768746564"></a>

<a id="api-4d656e754974656d44617461417474726962757465732e64697361626c6564"></a>

| Name | Description |
| --- | --- |
| data-highlighted |  |
| data-disabled |  |

#### CSS variables

Metadata status: unavailable.

<a id="api-4d656e752e4974656d2e50726f7073"></a>

<a id="menuitemprops"></a>

<a id="api-4d656e752e4974656d2e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Menu.Item.Props

Declaration: `packages/solid/build/types/menu/item/MenuItem.d.ts:14`

#### Declaration

```typescript
MenuItemProps
```

<a id="api-4d656e752e4974656d2e50726f70732e6c6162656c"></a>

<a id="MenuItemProps-label"></a>

<a id="api-4d656e752e4974656d2e50726f70732e636c6f73654f6e436c69636b"></a>

<a id="MenuItemProps-closeOnClick"></a>

<a id="api-4d656e752e4974656d2e50726f70732e6e6174697665427574746f6e"></a>

<a id="MenuItemProps-nativeButton"></a>

<a id="api-4d656e752e4974656d2e50726f70732e64697361626c6564"></a>

<a id="MenuItemProps-disabled"></a>

<a id="api-4d656e752e4974656d2e50726f70732e636c617373"></a>

<a id="MenuItemProps-class"></a>

<a id="api-4d656e752e4974656d2e50726f70732e7374796c65"></a>

<a id="MenuItemProps-style"></a>

<a id="api-4d656e752e4974656d2e50726f70732e72656e646572"></a>

<a id="MenuItemProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| label | `string \| undefined` | No | Unavailable |  |
| closeOnClick | `boolean \| undefined` | No | Unavailable |  |
| nativeButton | `boolean \| undefined` | No | Unavailable |  |
| disabled | `boolean \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<ContextMenuItemState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ContextMenuItemState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ContextMenuItemState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4d656e752e4974656d2e5374617465"></a>

<a id="menuitemstate"></a>

### Related exported type: Menu.Item.State

Declaration: `packages/solid/build/types/menu/item/MenuItem.d.ts:15`

#### Declaration

```typescript
MenuItemState
```

<a id="api-4d656e752e4974656d2e53746174652e686967686c696768746564"></a>

<a id="MenuItemState-highlighted"></a>

<a id="api-4d656e752e4974656d2e53746174652e64697361626c6564"></a>

<a id="MenuItemState-disabled"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| highlighted | `boolean` | Yes | Unavailable |  |
| disabled | `boolean` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="linkitem"></a>

### LinkItem

<a id="api-4d656e752e4c696e6b4974656d"></a>

<a id="menulinkitem"></a>

<a id="api-4d656e752e4c696e6b4974656d2e2470726f70732e70726f703a63686172736574"></a>

<a id="api-4d656e752e4c696e6b4974656d2e2470726f70732e70726f703a636f6f726473"></a>

<a id="api-4d656e752e4c696e6b4974656d2e2470726f70732e70726f703a646f776e6c6f6164"></a>

<a id="api-4d656e752e4c696e6b4974656d2e2470726f70732e70726f703a68617368"></a>

<a id="api-4d656e752e4c696e6b4974656d2e2470726f70732e70726f703a686f7374"></a>

<a id="api-4d656e752e4c696e6b4974656d2e2470726f70732e70726f703a686f73746e616d65"></a>

<a id="api-4d656e752e4c696e6b4974656d2e2470726f70732e70726f703a68726566"></a>

<a id="api-4d656e752e4c696e6b4974656d2e2470726f70732e70726f703a687265666c616e67"></a>

<a id="api-4d656e752e4c696e6b4974656d2e2470726f70732e70726f703a6e616d65"></a>

<a id="api-4d656e752e4c696e6b4974656d2e2470726f70732e70726f703a70617373776f7264"></a>

<a id="api-4d656e752e4c696e6b4974656d2e2470726f70732e70726f703a706174686e616d65"></a>

<a id="api-4d656e752e4c696e6b4974656d2e2470726f70732e70726f703a70696e67"></a>

<a id="api-4d656e752e4c696e6b4974656d2e2470726f70732e70726f703a706f7274"></a>

<a id="api-4d656e752e4c696e6b4974656d2e2470726f70732e70726f703a70726f746f636f6c"></a>

<a id="api-4d656e752e4c696e6b4974656d2e2470726f70732e70726f703a7265666572726572506f6c696379"></a>

<a id="api-4d656e752e4c696e6b4974656d2e2470726f70732e70726f703a72656c"></a>

<a id="api-4d656e752e4c696e6b4974656d2e2470726f70732e70726f703a726576"></a>

<a id="api-4d656e752e4c696e6b4974656d2e2470726f70732e70726f703a736561726368"></a>

<a id="api-4d656e752e4c696e6b4974656d2e2470726f70732e70726f703a7368617065"></a>

<a id="api-4d656e752e4c696e6b4974656d2e2470726f70732e70726f703a746172676574"></a>

<a id="api-4d656e752e4c696e6b4974656d2e2470726f70732e70726f703a74657874"></a>

<a id="api-4d656e752e4c696e6b4974656d2e2470726f70732e70726f703a74797065"></a>

<a id="api-4d656e752e4c696e6b4974656d2e2470726f70732e70726f703a757365726e616d65"></a>

### Menu.LinkItem

Declaration: `packages/solid/build/types/menu/link-item/MenuLinkItem.d.ts:10`

#### Declaration

```typescript
(props: MenuLinkItemProps) => JSX.Element
```

<a id="api-4d656e752e4c696e6b4974656d2e2470726f70732e6c6162656c"></a>

<a id="MenuLinkItem-label"></a>

<a id="api-4d656e752e4c696e6b4974656d2e2470726f70732e636c6f73654f6e436c69636b"></a>

<a id="MenuLinkItem-closeOnClick"></a>

<a id="api-4d656e752e4c696e6b4974656d2e2470726f70732e636c617373"></a>

<a id="MenuLinkItem-class"></a>

<a id="api-4d656e752e4c696e6b4974656d2e2470726f70732e7374796c65"></a>

<a id="MenuLinkItem-style"></a>

<a id="api-4d656e752e4c696e6b4974656d2e2470726f70732e72656e646572"></a>

<a id="MenuLinkItem-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| label | `string \| undefined` | No | Unavailable |  |
| closeOnClick | `boolean \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<ContextMenuLinkItemState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ContextMenuLinkItemState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<JSX.AnchorHTMLAttributes<HTMLAnchorElement> & JSX.Properties<HTMLAnchorElement>, ContextMenuLinkItemState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `attributionsrc`, `autocapitalize`, `autocorrect`, `autofocus`, `charset`, `children`, `contenteditable`, `contextmenu`, `coords`, `datatype`, `dir`, `download`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `href`, `hreflang`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `link`, `name`, `nonce`, `noscroll`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `ping`, `popover`, `prefix`, `preload`, `prop:charset`, `prop:coords`, `prop:download`, `prop:hash`, `prop:host`, `prop:hostname`, `prop:href`, `prop:hreflang`, `prop:name`, `prop:password`, `prop:pathname`, `prop:ping`, `prop:port`, `prop:protocol`, `prop:referrerPolicy`, `prop:rel`, `prop:rev`, `prop:search`, `prop:shape`, `prop:target`, `prop:text`, `prop:type`, `prop:username`, `property`, `ref`, `referrerpolicy`, `rel`, `replace`, `resource`, `rev`, `role`, `shape`, `slot`, `spellcheck`, `state`, `tabindex`, `target`, `textContent`, `title`, `translate`, `type`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`, `xmlns`

#### Data attributes

<a id="api-4d656e754c696e6b4974656d44617461417474726962757465732e686967686c696768746564"></a>

| Name | Description |
| --- | --- |
| data-highlighted |  |

#### CSS variables

Metadata status: unavailable.

<a id="api-4d656e752e4c696e6b4974656d2e50726f7073"></a>

<a id="menulinkitemprops"></a>

<a id="api-4d656e752e4c696e6b4974656d2e50726f70732e70726f703a63686172736574"></a>

<a id="api-4d656e752e4c696e6b4974656d2e50726f70732e70726f703a636f6f726473"></a>

<a id="api-4d656e752e4c696e6b4974656d2e50726f70732e70726f703a646f776e6c6f6164"></a>

<a id="api-4d656e752e4c696e6b4974656d2e50726f70732e70726f703a68617368"></a>

<a id="api-4d656e752e4c696e6b4974656d2e50726f70732e70726f703a686f7374"></a>

<a id="api-4d656e752e4c696e6b4974656d2e50726f70732e70726f703a686f73746e616d65"></a>

<a id="api-4d656e752e4c696e6b4974656d2e50726f70732e70726f703a68726566"></a>

<a id="api-4d656e752e4c696e6b4974656d2e50726f70732e70726f703a687265666c616e67"></a>

<a id="api-4d656e752e4c696e6b4974656d2e50726f70732e70726f703a6e616d65"></a>

<a id="api-4d656e752e4c696e6b4974656d2e50726f70732e70726f703a70617373776f7264"></a>

<a id="api-4d656e752e4c696e6b4974656d2e50726f70732e70726f703a706174686e616d65"></a>

<a id="api-4d656e752e4c696e6b4974656d2e50726f70732e70726f703a70696e67"></a>

<a id="api-4d656e752e4c696e6b4974656d2e50726f70732e70726f703a706f7274"></a>

<a id="api-4d656e752e4c696e6b4974656d2e50726f70732e70726f703a70726f746f636f6c"></a>

<a id="api-4d656e752e4c696e6b4974656d2e50726f70732e70726f703a7265666572726572506f6c696379"></a>

<a id="api-4d656e752e4c696e6b4974656d2e50726f70732e70726f703a72656c"></a>

<a id="api-4d656e752e4c696e6b4974656d2e50726f70732e70726f703a726576"></a>

<a id="api-4d656e752e4c696e6b4974656d2e50726f70732e70726f703a736561726368"></a>

<a id="api-4d656e752e4c696e6b4974656d2e50726f70732e70726f703a7368617065"></a>

<a id="api-4d656e752e4c696e6b4974656d2e50726f70732e70726f703a746172676574"></a>

<a id="api-4d656e752e4c696e6b4974656d2e50726f70732e70726f703a74657874"></a>

<a id="api-4d656e752e4c696e6b4974656d2e50726f70732e70726f703a74797065"></a>

<a id="api-4d656e752e4c696e6b4974656d2e50726f70732e70726f703a757365726e616d65"></a>

### Related exported type: Menu.LinkItem.Props

Declaration: `packages/solid/build/types/menu/link-item/MenuLinkItem.d.ts:12`

#### Declaration

```typescript
MenuLinkItemProps
```

<a id="api-4d656e752e4c696e6b4974656d2e50726f70732e6c6162656c"></a>

<a id="MenuLinkItemProps-label"></a>

<a id="api-4d656e752e4c696e6b4974656d2e50726f70732e636c6f73654f6e436c69636b"></a>

<a id="MenuLinkItemProps-closeOnClick"></a>

<a id="api-4d656e752e4c696e6b4974656d2e50726f70732e636c617373"></a>

<a id="MenuLinkItemProps-class"></a>

<a id="api-4d656e752e4c696e6b4974656d2e50726f70732e7374796c65"></a>

<a id="MenuLinkItemProps-style"></a>

<a id="api-4d656e752e4c696e6b4974656d2e50726f70732e72656e646572"></a>

<a id="MenuLinkItemProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| label | `string \| undefined` | No | Unavailable |  |
| closeOnClick | `boolean \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<ContextMenuLinkItemState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ContextMenuLinkItemState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<JSX.AnchorHTMLAttributes<HTMLAnchorElement> & JSX.Properties<HTMLAnchorElement>, ContextMenuLinkItemState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `attributionsrc`, `autocapitalize`, `autocorrect`, `autofocus`, `charset`, `children`, `contenteditable`, `contextmenu`, `coords`, `datatype`, `dir`, `download`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `href`, `hreflang`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `link`, `name`, `nonce`, `noscroll`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `ping`, `popover`, `prefix`, `preload`, `prop:charset`, `prop:coords`, `prop:download`, `prop:hash`, `prop:host`, `prop:hostname`, `prop:href`, `prop:hreflang`, `prop:name`, `prop:password`, `prop:pathname`, `prop:ping`, `prop:port`, `prop:protocol`, `prop:referrerPolicy`, `prop:rel`, `prop:rev`, `prop:search`, `prop:shape`, `prop:target`, `prop:text`, `prop:type`, `prop:username`, `property`, `ref`, `referrerpolicy`, `rel`, `replace`, `resource`, `rev`, `role`, `shape`, `slot`, `spellcheck`, `state`, `tabindex`, `target`, `textContent`, `title`, `translate`, `type`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`, `xmlns`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4d656e752e4c696e6b4974656d2e5374617465"></a>

<a id="menulinkitemstate"></a>

### Related exported type: Menu.LinkItem.State

Declaration: `packages/solid/build/types/menu/link-item/MenuLinkItem.d.ts:13`

#### Declaration

```typescript
MenuLinkItemState
```

<a id="api-4d656e752e4c696e6b4974656d2e53746174652e686967686c696768746564"></a>

<a id="MenuLinkItemState-highlighted"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| highlighted | `boolean` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="submenuroot"></a>

### SubmenuRoot

<a id="api-4d656e752e5375626d656e75526f6f74"></a>

<a id="menusubmenuroot"></a>

### Menu.SubmenuRoot

Declaration: `packages/solid/build/types/menu/submenu-root/MenuSubmenuRoot.d.ts:9`

#### Declaration

```typescript
(props: MenuSubmenuRootProps) => JSX.Element
```

<a id="api-4d656e752e5375626d656e75526f6f742e2470726f70732e64656661756c744f70656e"></a>

<a id="MenuSubmenuRoot-defaultOpen"></a>

<a id="api-4d656e752e5375626d656e75526f6f742e2470726f70732e6f70656e"></a>

<a id="MenuSubmenuRoot-open"></a>

<a id="api-4d656e752e5375626d656e75526f6f742e2470726f70732e6f6e4f70656e4368616e6765"></a>

<a id="MenuSubmenuRoot-onOpenChange"></a>

<a id="api-4d656e752e5375626d656e75526f6f742e2470726f70732e686967686c696768744974656d4f6e486f766572"></a>

<a id="MenuSubmenuRoot-highlightItemOnHover"></a>

<a id="api-4d656e752e5375626d656e75526f6f742e2470726f70732e616374696f6e73526566"></a>

<a id="MenuSubmenuRoot-actionsRef"></a>

<a id="api-4d656e752e5375626d656e75526f6f742e2470726f70732e636c6f7365506172656e744f6e457363"></a>

<a id="MenuSubmenuRoot-closeParentOnEsc"></a>

<a id="api-4d656e752e5375626d656e75526f6f742e2470726f70732e6c6f6f70466f637573"></a>

<a id="MenuSubmenuRoot-loopFocus"></a>

<a id="api-4d656e752e5375626d656e75526f6f742e2470726f70732e6f6e4974656d486967686c696768746564"></a>

<a id="MenuSubmenuRoot-onItemHighlighted"></a>

<a id="api-4d656e752e5375626d656e75526f6f742e2470726f70732e6f6e4f70656e4368616e6765436f6d706c657465"></a>

<a id="MenuSubmenuRoot-onOpenChangeComplete"></a>

<a id="api-4d656e752e5375626d656e75526f6f742e2470726f70732e64697361626c6564"></a>

<a id="MenuSubmenuRoot-disabled"></a>

<a id="api-4d656e752e5375626d656e75526f6f742e2470726f70732e6f7269656e746174696f6e"></a>

<a id="MenuSubmenuRoot-orientation"></a>

<a id="api-4d656e752e5375626d656e75526f6f742e2470726f70732e6368696c6472656e"></a>

<a id="MenuSubmenuRoot-children"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| defaultOpen | `boolean \| undefined` | No | Unavailable |  |
| open | `boolean \| undefined` | No | Unavailable |  |
| onOpenChange | `((open: boolean, details: MenuRootChangeEventDetails) => void) \| undefined` | No | Unavailable |  |
| highlightItemOnHover | `boolean \| undefined` | No | Unavailable |  |
| actionsRef | `MutableCell<MenuRootActions \| null> \| undefined` | No | Unavailable |  |
| closeParentOnEsc | `boolean \| undefined` | No | Unavailable |  |
| loopFocus | `boolean \| undefined` | No | Unavailable |  |
| onItemHighlighted | `((item: HTMLElement \| undefined, details: MenuRootHighlightEventDetails) => void) \| undefined` | No | Unavailable |  |
| onOpenChangeComplete | `((open: boolean) => void) \| undefined` | No | Unavailable |  |
| disabled | `boolean \| undefined` | No | Unavailable |  |
| orientation | `MenuRootOrientation \| undefined` | No | Unavailable |  |
| children | `JSX.Element` | No | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4d656e752e5375626d656e75526f6f742e50726f7073"></a>

<a id="menusubmenurootprops"></a>

### Related exported type: Menu.SubmenuRoot.Props

Declaration: `packages/solid/build/types/menu/submenu-root/MenuSubmenuRoot.d.ts:13`

#### Declaration

```typescript
MenuSubmenuRootProps
```

<a id="api-4d656e752e5375626d656e75526f6f742e50726f70732e64656661756c744f70656e"></a>

<a id="MenuSubmenuRootProps-defaultOpen"></a>

<a id="api-4d656e752e5375626d656e75526f6f742e50726f70732e6f70656e"></a>

<a id="MenuSubmenuRootProps-open"></a>

<a id="api-4d656e752e5375626d656e75526f6f742e50726f70732e6f6e4f70656e4368616e6765"></a>

<a id="MenuSubmenuRootProps-onOpenChange"></a>

<a id="api-4d656e752e5375626d656e75526f6f742e50726f70732e686967686c696768744974656d4f6e486f766572"></a>

<a id="MenuSubmenuRootProps-highlightItemOnHover"></a>

<a id="api-4d656e752e5375626d656e75526f6f742e50726f70732e616374696f6e73526566"></a>

<a id="MenuSubmenuRootProps-actionsRef"></a>

<a id="api-4d656e752e5375626d656e75526f6f742e50726f70732e636c6f7365506172656e744f6e457363"></a>

<a id="MenuSubmenuRootProps-closeParentOnEsc"></a>

<a id="api-4d656e752e5375626d656e75526f6f742e50726f70732e6c6f6f70466f637573"></a>

<a id="MenuSubmenuRootProps-loopFocus"></a>

<a id="api-4d656e752e5375626d656e75526f6f742e50726f70732e6f6e4974656d486967686c696768746564"></a>

<a id="MenuSubmenuRootProps-onItemHighlighted"></a>

<a id="api-4d656e752e5375626d656e75526f6f742e50726f70732e6f6e4f70656e4368616e6765436f6d706c657465"></a>

<a id="MenuSubmenuRootProps-onOpenChangeComplete"></a>

<a id="api-4d656e752e5375626d656e75526f6f742e50726f70732e64697361626c6564"></a>

<a id="MenuSubmenuRootProps-disabled"></a>

<a id="api-4d656e752e5375626d656e75526f6f742e50726f70732e6f7269656e746174696f6e"></a>

<a id="MenuSubmenuRootProps-orientation"></a>

<a id="api-4d656e752e5375626d656e75526f6f742e50726f70732e6368696c6472656e"></a>

<a id="MenuSubmenuRootProps-children"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| defaultOpen | `boolean \| undefined` | No | Unavailable |  |
| open | `boolean \| undefined` | No | Unavailable |  |
| onOpenChange | `((open: boolean, details: MenuRootChangeEventDetails) => void) \| undefined` | No | Unavailable |  |
| highlightItemOnHover | `boolean \| undefined` | No | Unavailable |  |
| actionsRef | `MutableCell<MenuRootActions \| null> \| undefined` | No | Unavailable |  |
| closeParentOnEsc | `boolean \| undefined` | No | Unavailable |  |
| loopFocus | `boolean \| undefined` | No | Unavailable |  |
| onItemHighlighted | `((item: HTMLElement \| undefined, details: MenuRootHighlightEventDetails) => void) \| undefined` | No | Unavailable |  |
| onOpenChangeComplete | `((open: boolean) => void) \| undefined` | No | Unavailable |  |
| disabled | `boolean \| undefined` | No | Unavailable |  |
| orientation | `MenuRootOrientation \| undefined` | No | Unavailable |  |
| children | `JSX.Element` | No | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4d656e752e5375626d656e75526f6f742e5374617465"></a>

<a id="menusubmenurootstate"></a>

### Related exported type: Menu.SubmenuRoot.State

Declaration: `packages/solid/build/types/menu/submenu-root/MenuSubmenuRoot.d.ts:14`

#### Declaration

```typescript
MenuSubmenuRootState
```

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4d656e752e5375626d656e75526f6f742e4368616e67654576656e74526561736f6e"></a>

<a id="menusubmenurootchangeeventreason"></a>

### Related exported type: Menu.SubmenuRoot.ChangeEventReason

Declaration: `packages/solid/build/types/menu/submenu-root/MenuSubmenuRoot.d.ts:15`

#### Declaration

```typescript
MenuRootChangeEventReason
```

Inherited DOM attributes: `__@iterator@106`, `anchor`, `at`, `big`, `blink`, `bold`, `charAt`, `charCodeAt`, `codePointAt`, `concat`, `endsWith`, `fixed`, `fontcolor`, `fontsize`, `includes`, `indexOf`, `isWellFormed`, `italics`, `lastIndexOf`, `length`, `link`, `localeCompare`, `match`, `matchAll`, `normalize`, `padEnd`, `padStart`, `repeat`, `replace`, `replaceAll`, `search`, `slice`, `small`, `split`, `startsWith`, `strike`, `sub`, `substr`, `substring`, `sup`, `toLocaleLowerCase`, `toLocaleUpperCase`, `toLowerCase`, `toString`, `toUpperCase`, `toWellFormed`, `trim`, `trimEnd`, `trimLeft`, `trimRight`, `trimStart`, `valueOf`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4d656e752e5375626d656e75526f6f742e4368616e67654576656e7444657461696c73"></a>

<a id="menusubmenurootchangeeventdetails"></a>

### Related exported type: Menu.SubmenuRoot.ChangeEventDetails

Declaration: `packages/solid/build/types/menu/submenu-root/MenuSubmenuRoot.d.ts:16`

#### Declaration

```typescript
MenuRootChangeEventDetails
```

<a id="api-4d656e752e5375626d656e75526f6f742e4368616e67654576656e7444657461696c732e616c6c6f7750726f7061676174696f6e"></a>

<a id="MenuSubmenuRootChangeEventDetails-allowPropagation"></a>

<a id="api-4d656e752e5375626d656e75526f6f742e4368616e67654576656e7444657461696c732e63616e63656c"></a>

<a id="MenuSubmenuRootChangeEventDetails-cancel"></a>

<a id="api-4d656e752e5375626d656e75526f6f742e4368616e67654576656e7444657461696c732e6576656e74"></a>

<a id="MenuSubmenuRootChangeEventDetails-event"></a>

<a id="api-4d656e752e5375626d656e75526f6f742e4368616e67654576656e7444657461696c732e697343616e63656c6564"></a>

<a id="MenuSubmenuRootChangeEventDetails-isCanceled"></a>

<a id="api-4d656e752e5375626d656e75526f6f742e4368616e67654576656e7444657461696c732e697350726f7061676174696f6e416c6c6f776564"></a>

<a id="MenuSubmenuRootChangeEventDetails-isPropagationAllowed"></a>

<a id="api-4d656e752e5375626d656e75526f6f742e4368616e67654576656e7444657461696c732e70726576656e74556e6d6f756e744f6e436c6f7365"></a>

<a id="MenuSubmenuRootChangeEventDetails-preventUnmountOnClose"></a>

<a id="api-4d656e752e5375626d656e75526f6f742e4368616e67654576656e7444657461696c732e726561736f6e"></a>

<a id="MenuSubmenuRootChangeEventDetails-reason"></a>

<a id="api-4d656e752e5375626d656e75526f6f742e4368616e67654576656e7444657461696c732e74726967676572"></a>

<a id="MenuSubmenuRootChangeEventDetails-trigger"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| allowPropagation | `() => void` | Yes | Unavailable | Marks this change transaction as allowing propagation. |
| cancel | `() => void` | Yes | Unavailable | Cancels the Base UI change transaction; separate from the DOM event’s preventDefault() and preventBaseUIHandler(). |
| event | `PointerEvent \| MouseEvent \| Event \| FocusEvent \| KeyboardEvent \| TouchEvent` | Yes | Unavailable | Native DOM event associated with the change. Programmatic changes can use a Base UI-created Event. |
| isCanceled | `boolean` | Yes | Unavailable | Whether cancel() has been called for this change transaction. |
| isPropagationAllowed | `boolean` | Yes | Unavailable | Whether allowPropagation() has been called for this change transaction. |
| preventUnmountOnClose | `() => void` | Yes | Unavailable |  |
| reason | `"none" \| "trigger-press" \| "trigger-hover" \| "trigger-focus" \| "outside-press" \| "item-press" \| "close-press" \| "focus-out" \| "escape-key" \| "list-navigation" \| "cancel-open" \| "sibling-open" \| "imperative-action"` | Yes | Unavailable | Reason for the requested change; it discriminates the native event type. |
| trigger | `Element \| undefined` | Yes | Unavailable | Trigger element associated with this change, when available. |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="submenutrigger"></a>

### SubmenuTrigger

<a id="api-4d656e752e5375626d656e7554726967676572"></a>

<a id="menusubmenutrigger"></a>

<a id="api-4d656e752e5375626d656e75547269676765722e2470726f70732e70726f703a616c69676e"></a>

### Menu.SubmenuTrigger

Declaration: `packages/solid/build/types/menu/submenu-trigger/MenuSubmenuTrigger.d.ts:15`

#### Declaration

```typescript
(props: MenuSubmenuTriggerProps) => JSX.Element
```

<a id="api-4d656e752e5375626d656e75547269676765722e2470726f70732e6c6162656c"></a>

<a id="MenuSubmenuTrigger-label"></a>

<a id="api-4d656e752e5375626d656e75547269676765722e2470726f70732e6e6174697665427574746f6e"></a>

<a id="MenuSubmenuTrigger-nativeButton"></a>

<a id="api-4d656e752e5375626d656e75547269676765722e2470726f70732e64697361626c6564"></a>

<a id="MenuSubmenuTrigger-disabled"></a>

<a id="api-4d656e752e5375626d656e75547269676765722e2470726f70732e6f70656e4f6e486f766572"></a>

<a id="MenuSubmenuTrigger-openOnHover"></a>

<a id="api-4d656e752e5375626d656e75547269676765722e2470726f70732e64656c6179"></a>

<a id="MenuSubmenuTrigger-delay"></a>

<a id="api-4d656e752e5375626d656e75547269676765722e2470726f70732e636c6f736544656c6179"></a>

<a id="MenuSubmenuTrigger-closeDelay"></a>

<a id="api-4d656e752e5375626d656e75547269676765722e2470726f70732e636c617373"></a>

<a id="MenuSubmenuTrigger-class"></a>

<a id="api-4d656e752e5375626d656e75547269676765722e2470726f70732e7374796c65"></a>

<a id="MenuSubmenuTrigger-style"></a>

<a id="api-4d656e752e5375626d656e75547269676765722e2470726f70732e72656e646572"></a>

<a id="MenuSubmenuTrigger-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| label | `string \| undefined` | No | Unavailable |  |
| nativeButton | `boolean \| undefined` | No | Unavailable |  |
| disabled | `boolean \| undefined` | No | Unavailable |  |
| openOnHover | `boolean \| undefined` | No | true |  |
| delay | `number \| undefined` | No | 100 |  |
| closeDelay | `number \| undefined` | No | 0 |  |
| class | `JSX.ClassValue \| ((state: Readonly<ContextMenuSubmenuTriggerState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ContextMenuSubmenuTriggerState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ContextMenuSubmenuTriggerState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-4d656e755375626d656e755472696767657244617461417474726962757465732e706f7075704f70656e"></a>

<a id="api-4d656e755375626d656e755472696767657244617461417474726962757465732e686967686c696768746564"></a>

<a id="api-4d656e755375626d656e755472696767657244617461417474726962757465732e64697361626c6564"></a>

| Name | Description |
| --- | --- |
| data-popup-open |  |
| data-highlighted |  |
| data-disabled |  |

#### CSS variables

Metadata status: unavailable.

<a id="api-4d656e752e5375626d656e75547269676765722e50726f7073"></a>

<a id="menusubmenutriggerprops"></a>

<a id="api-4d656e752e5375626d656e75547269676765722e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Menu.SubmenuTrigger.Props

Declaration: `packages/solid/build/types/menu/submenu-trigger/MenuSubmenuTrigger.d.ts:17`

#### Declaration

```typescript
MenuSubmenuTriggerProps
```

<a id="api-4d656e752e5375626d656e75547269676765722e50726f70732e6c6162656c"></a>

<a id="MenuSubmenuTriggerProps-label"></a>

<a id="api-4d656e752e5375626d656e75547269676765722e50726f70732e6e6174697665427574746f6e"></a>

<a id="MenuSubmenuTriggerProps-nativeButton"></a>

<a id="api-4d656e752e5375626d656e75547269676765722e50726f70732e64697361626c6564"></a>

<a id="MenuSubmenuTriggerProps-disabled"></a>

<a id="api-4d656e752e5375626d656e75547269676765722e50726f70732e6f70656e4f6e486f766572"></a>

<a id="MenuSubmenuTriggerProps-openOnHover"></a>

<a id="api-4d656e752e5375626d656e75547269676765722e50726f70732e64656c6179"></a>

<a id="MenuSubmenuTriggerProps-delay"></a>

<a id="api-4d656e752e5375626d656e75547269676765722e50726f70732e636c6f736544656c6179"></a>

<a id="MenuSubmenuTriggerProps-closeDelay"></a>

<a id="api-4d656e752e5375626d656e75547269676765722e50726f70732e636c617373"></a>

<a id="MenuSubmenuTriggerProps-class"></a>

<a id="api-4d656e752e5375626d656e75547269676765722e50726f70732e7374796c65"></a>

<a id="MenuSubmenuTriggerProps-style"></a>

<a id="api-4d656e752e5375626d656e75547269676765722e50726f70732e72656e646572"></a>

<a id="MenuSubmenuTriggerProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| label | `string \| undefined` | No | Unavailable |  |
| nativeButton | `boolean \| undefined` | No | Unavailable |  |
| disabled | `boolean \| undefined` | No | Unavailable |  |
| openOnHover | `boolean \| undefined` | No | Unavailable |  |
| delay | `number \| undefined` | No | Unavailable |  |
| closeDelay | `number \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<ContextMenuSubmenuTriggerState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ContextMenuSubmenuTriggerState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ContextMenuSubmenuTriggerState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4d656e752e5375626d656e75547269676765722e5374617465"></a>

<a id="menusubmenutriggerstate"></a>

### Related exported type: Menu.SubmenuTrigger.State

Declaration: `packages/solid/build/types/menu/submenu-trigger/MenuSubmenuTrigger.d.ts:18`

#### Declaration

```typescript
MenuSubmenuTriggerState
```

<a id="api-4d656e752e5375626d656e75547269676765722e53746174652e6f70656e"></a>

<a id="MenuSubmenuTriggerState-open"></a>

<a id="api-4d656e752e5375626d656e75547269676765722e53746174652e686967686c696768746564"></a>

<a id="MenuSubmenuTriggerState-highlighted"></a>

<a id="api-4d656e752e5375626d656e75547269676765722e53746174652e64697361626c6564"></a>

<a id="MenuSubmenuTriggerState-disabled"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| open | `boolean` | Yes | Unavailable |  |
| highlighted | `boolean` | Yes | Unavailable |  |
| disabled | `boolean` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="group"></a>

### Group

<a id="api-4d656e752e47726f7570"></a>

<a id="menugroup"></a>

<a id="api-4d656e752e47726f75702e2470726f70732e70726f703a616c69676e"></a>

### Menu.Group

Declaration: `packages/solid/build/types/menu/group/MenuGroup.d.ts:7`

#### Declaration

```typescript
(props: MenuGroupProps) => JSX.Element
```

<a id="api-4d656e752e47726f75702e2470726f70732e636c617373"></a>

<a id="MenuGroup-class"></a>

<a id="api-4d656e752e47726f75702e2470726f70732e7374796c65"></a>

<a id="MenuGroup-style"></a>

<a id="api-4d656e752e47726f75702e2470726f70732e72656e646572"></a>

<a id="MenuGroup-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<ContextMenuGroupState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ContextMenuGroupState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ContextMenuGroupState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4d656e752e47726f75702e50726f7073"></a>

<a id="menugroupprops"></a>

<a id="api-4d656e752e47726f75702e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Menu.Group.Props

Declaration: `packages/solid/build/types/menu/group/MenuGroup.d.ts:9`

#### Declaration

```typescript
MenuGroupProps
```

<a id="api-4d656e752e47726f75702e50726f70732e636c617373"></a>

<a id="MenuGroupProps-class"></a>

<a id="api-4d656e752e47726f75702e50726f70732e7374796c65"></a>

<a id="MenuGroupProps-style"></a>

<a id="api-4d656e752e47726f75702e50726f70732e72656e646572"></a>

<a id="MenuGroupProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<ContextMenuGroupState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ContextMenuGroupState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ContextMenuGroupState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4d656e752e47726f75702e5374617465"></a>

<a id="menugroupstate"></a>

### Related exported type: Menu.Group.State

Declaration: `packages/solid/build/types/menu/group/MenuGroup.d.ts:10`

#### Declaration

```typescript
MenuGroupState
```

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="grouplabel"></a>

### GroupLabel

<a id="api-4d656e752e47726f75704c6162656c"></a>

<a id="menugrouplabel"></a>

<a id="api-4d656e752e47726f75704c6162656c2e2470726f70732e70726f703a616c69676e"></a>

### Menu.GroupLabel

Declaration: `packages/solid/build/types/menu/group-label/MenuGroupLabel.d.ts:6`

#### Declaration

```typescript
(props: MenuGroupLabelProps) => JSX.Element
```

<a id="api-4d656e752e47726f75704c6162656c2e2470726f70732e636c617373"></a>

<a id="MenuGroupLabel-class"></a>

<a id="api-4d656e752e47726f75704c6162656c2e2470726f70732e7374796c65"></a>

<a id="MenuGroupLabel-style"></a>

<a id="api-4d656e752e47726f75704c6162656c2e2470726f70732e72656e646572"></a>

<a id="MenuGroupLabel-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<ContextMenuGroupLabelState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ContextMenuGroupLabelState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ContextMenuGroupLabelState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4d656e752e47726f75704c6162656c2e50726f7073"></a>

<a id="menugrouplabelprops"></a>

<a id="api-4d656e752e47726f75704c6162656c2e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Menu.GroupLabel.Props

Declaration: `packages/solid/build/types/menu/group-label/MenuGroupLabel.d.ts:8`

#### Declaration

```typescript
MenuGroupLabelProps
```

<a id="api-4d656e752e47726f75704c6162656c2e50726f70732e636c617373"></a>

<a id="MenuGroupLabelProps-class"></a>

<a id="api-4d656e752e47726f75704c6162656c2e50726f70732e7374796c65"></a>

<a id="MenuGroupLabelProps-style"></a>

<a id="api-4d656e752e47726f75704c6162656c2e50726f70732e72656e646572"></a>

<a id="MenuGroupLabelProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<ContextMenuGroupLabelState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ContextMenuGroupLabelState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ContextMenuGroupLabelState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4d656e752e47726f75704c6162656c2e5374617465"></a>

<a id="menugrouplabelstate"></a>

### Related exported type: Menu.GroupLabel.State

Declaration: `packages/solid/build/types/menu/group-label/MenuGroupLabel.d.ts:9`

#### Declaration

```typescript
MenuGroupLabelState
```

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="radiogroup"></a>

### RadioGroup

<a id="api-4d656e752e526164696f47726f7570"></a>

<a id="menuradiogroup"></a>

<a id="api-4d656e752e526164696f47726f75702e2470726f70732e70726f703a616c69676e"></a>

### Menu.RadioGroup

Declaration: `packages/solid/build/types/menu/radio-group/MenuRadioGroup.d.ts:13`

#### Declaration

```typescript
(props: MenuRadioGroupProps) => JSX.Element
```

<a id="api-4d656e752e526164696f47726f75702e2470726f70732e64656661756c7456616c7565"></a>

<a id="MenuRadioGroup-defaultValue"></a>

<a id="api-4d656e752e526164696f47726f75702e2470726f70732e76616c7565"></a>

<a id="MenuRadioGroup-value"></a>

<a id="api-4d656e752e526164696f47726f75702e2470726f70732e6f6e56616c75654368616e6765"></a>

<a id="MenuRadioGroup-onValueChange"></a>

<a id="api-4d656e752e526164696f47726f75702e2470726f70732e64697361626c6564"></a>

<a id="MenuRadioGroup-disabled"></a>

<a id="api-4d656e752e526164696f47726f75702e2470726f70732e636c617373"></a>

<a id="MenuRadioGroup-class"></a>

<a id="api-4d656e752e526164696f47726f75702e2470726f70732e7374796c65"></a>

<a id="MenuRadioGroup-style"></a>

<a id="api-4d656e752e526164696f47726f75702e2470726f70732e72656e646572"></a>

<a id="MenuRadioGroup-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| defaultValue | `any` | No | Unavailable |  |
| value | `any` | No | Unavailable |  |
| onValueChange | `((value: any, details: MenuRoot.ChangeEventDetails) => void) \| undefined` | No | Unavailable |  |
| disabled | `boolean \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<ContextMenuRadioGroupState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ContextMenuRadioGroupState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ContextMenuRadioGroupState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4d656e752e526164696f47726f75702e50726f7073"></a>

<a id="menuradiogroupprops"></a>

<a id="api-4d656e752e526164696f47726f75702e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Menu.RadioGroup.Props

Declaration: `packages/solid/build/types/menu/radio-group/MenuRadioGroup.d.ts:17`

#### Declaration

```typescript
MenuRadioGroupProps
```

<a id="api-4d656e752e526164696f47726f75702e50726f70732e64656661756c7456616c7565"></a>

<a id="MenuRadioGroupProps-defaultValue"></a>

<a id="api-4d656e752e526164696f47726f75702e50726f70732e76616c7565"></a>

<a id="MenuRadioGroupProps-value"></a>

<a id="api-4d656e752e526164696f47726f75702e50726f70732e6f6e56616c75654368616e6765"></a>

<a id="MenuRadioGroupProps-onValueChange"></a>

<a id="api-4d656e752e526164696f47726f75702e50726f70732e64697361626c6564"></a>

<a id="MenuRadioGroupProps-disabled"></a>

<a id="api-4d656e752e526164696f47726f75702e50726f70732e636c617373"></a>

<a id="MenuRadioGroupProps-class"></a>

<a id="api-4d656e752e526164696f47726f75702e50726f70732e7374796c65"></a>

<a id="MenuRadioGroupProps-style"></a>

<a id="api-4d656e752e526164696f47726f75702e50726f70732e72656e646572"></a>

<a id="MenuRadioGroupProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| defaultValue | `any` | No | Unavailable |  |
| value | `any` | No | Unavailable |  |
| onValueChange | `((value: any, details: MenuRoot.ChangeEventDetails) => void) \| undefined` | No | Unavailable |  |
| disabled | `boolean \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<ContextMenuRadioGroupState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ContextMenuRadioGroupState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ContextMenuRadioGroupState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4d656e752e526164696f47726f75702e5374617465"></a>

<a id="menuradiogroupstate"></a>

### Related exported type: Menu.RadioGroup.State

Declaration: `packages/solid/build/types/menu/radio-group/MenuRadioGroup.d.ts:18`

#### Declaration

```typescript
MenuRadioGroupState
```

<a id="api-4d656e752e526164696f47726f75702e53746174652e64697361626c6564"></a>

<a id="MenuRadioGroupState-disabled"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| disabled | `boolean` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4d656e752e526164696f47726f75702e4368616e67654576656e74526561736f6e"></a>

<a id="menuradiogroupchangeeventreason"></a>

### Related exported type: Menu.RadioGroup.ChangeEventReason

Declaration: `packages/solid/build/types/menu/radio-group/MenuRadioGroup.d.ts:19`

#### Declaration

```typescript
MenuRootChangeEventReason
```

Inherited DOM attributes: `__@iterator@106`, `anchor`, `at`, `big`, `blink`, `bold`, `charAt`, `charCodeAt`, `codePointAt`, `concat`, `endsWith`, `fixed`, `fontcolor`, `fontsize`, `includes`, `indexOf`, `isWellFormed`, `italics`, `lastIndexOf`, `length`, `link`, `localeCompare`, `match`, `matchAll`, `normalize`, `padEnd`, `padStart`, `repeat`, `replace`, `replaceAll`, `search`, `slice`, `small`, `split`, `startsWith`, `strike`, `sub`, `substr`, `substring`, `sup`, `toLocaleLowerCase`, `toLocaleUpperCase`, `toLowerCase`, `toString`, `toUpperCase`, `toWellFormed`, `trim`, `trimEnd`, `trimLeft`, `trimRight`, `trimStart`, `valueOf`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4d656e752e526164696f47726f75702e4368616e67654576656e7444657461696c73"></a>

<a id="menuradiogroupchangeeventdetails"></a>

### Related exported type: Menu.RadioGroup.ChangeEventDetails

Declaration: `packages/solid/build/types/menu/radio-group/MenuRadioGroup.d.ts:20`

#### Declaration

```typescript
MenuRootChangeEventDetails
```

<a id="api-4d656e752e526164696f47726f75702e4368616e67654576656e7444657461696c732e616c6c6f7750726f7061676174696f6e"></a>

<a id="MenuRadioGroupChangeEventDetails-allowPropagation"></a>

<a id="api-4d656e752e526164696f47726f75702e4368616e67654576656e7444657461696c732e63616e63656c"></a>

<a id="MenuRadioGroupChangeEventDetails-cancel"></a>

<a id="api-4d656e752e526164696f47726f75702e4368616e67654576656e7444657461696c732e6576656e74"></a>

<a id="MenuRadioGroupChangeEventDetails-event"></a>

<a id="api-4d656e752e526164696f47726f75702e4368616e67654576656e7444657461696c732e697343616e63656c6564"></a>

<a id="MenuRadioGroupChangeEventDetails-isCanceled"></a>

<a id="api-4d656e752e526164696f47726f75702e4368616e67654576656e7444657461696c732e697350726f7061676174696f6e416c6c6f776564"></a>

<a id="MenuRadioGroupChangeEventDetails-isPropagationAllowed"></a>

<a id="api-4d656e752e526164696f47726f75702e4368616e67654576656e7444657461696c732e70726576656e74556e6d6f756e744f6e436c6f7365"></a>

<a id="MenuRadioGroupChangeEventDetails-preventUnmountOnClose"></a>

<a id="api-4d656e752e526164696f47726f75702e4368616e67654576656e7444657461696c732e726561736f6e"></a>

<a id="MenuRadioGroupChangeEventDetails-reason"></a>

<a id="api-4d656e752e526164696f47726f75702e4368616e67654576656e7444657461696c732e74726967676572"></a>

<a id="MenuRadioGroupChangeEventDetails-trigger"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| allowPropagation | `() => void` | Yes | Unavailable | Marks this change transaction as allowing propagation. |
| cancel | `() => void` | Yes | Unavailable | Cancels the Base UI change transaction; separate from the DOM event’s preventDefault() and preventBaseUIHandler(). |
| event | `PointerEvent \| MouseEvent \| Event \| FocusEvent \| KeyboardEvent \| TouchEvent` | Yes | Unavailable | Native DOM event associated with the change. Programmatic changes can use a Base UI-created Event. |
| isCanceled | `boolean` | Yes | Unavailable | Whether cancel() has been called for this change transaction. |
| isPropagationAllowed | `boolean` | Yes | Unavailable | Whether allowPropagation() has been called for this change transaction. |
| preventUnmountOnClose | `() => void` | Yes | Unavailable |  |
| reason | `"none" \| "trigger-press" \| "trigger-hover" \| "trigger-focus" \| "outside-press" \| "item-press" \| "close-press" \| "focus-out" \| "escape-key" \| "list-navigation" \| "cancel-open" \| "sibling-open" \| "imperative-action"` | Yes | Unavailable | Reason for the requested change; it discriminates the native event type. |
| trigger | `Element \| undefined` | Yes | Unavailable | Trigger element associated with this change, when available. |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="radioitem"></a>

### RadioItem

<a id="api-4d656e752e526164696f4974656d"></a>

<a id="menuradioitem"></a>

<a id="api-4d656e752e526164696f4974656d2e2470726f70732e70726f703a616c69676e"></a>

### Menu.RadioItem

Declaration: `packages/solid/build/types/menu/radio-item/MenuRadioItem.d.ts:14`

#### Declaration

```typescript
(props: MenuRadioItemProps) => JSX.Element
```

<a id="api-4d656e752e526164696f4974656d2e2470726f70732e6c6162656c"></a>

<a id="MenuRadioItem-label"></a>

<a id="api-4d656e752e526164696f4974656d2e2470726f70732e76616c7565"></a>

<a id="MenuRadioItem-value"></a>

<a id="api-4d656e752e526164696f4974656d2e2470726f70732e636c6f73654f6e436c69636b"></a>

<a id="MenuRadioItem-closeOnClick"></a>

<a id="api-4d656e752e526164696f4974656d2e2470726f70732e6e6174697665427574746f6e"></a>

<a id="MenuRadioItem-nativeButton"></a>

<a id="api-4d656e752e526164696f4974656d2e2470726f70732e64697361626c6564"></a>

<a id="MenuRadioItem-disabled"></a>

<a id="api-4d656e752e526164696f4974656d2e2470726f70732e636c617373"></a>

<a id="MenuRadioItem-class"></a>

<a id="api-4d656e752e526164696f4974656d2e2470726f70732e7374796c65"></a>

<a id="MenuRadioItem-style"></a>

<a id="api-4d656e752e526164696f4974656d2e2470726f70732e72656e646572"></a>

<a id="MenuRadioItem-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| label | `string \| undefined` | No | Unavailable |  |
| value | `any` | Yes | Unavailable |  |
| closeOnClick | `boolean \| undefined` | No | Unavailable |  |
| nativeButton | `boolean \| undefined` | No | Unavailable |  |
| disabled | `boolean \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<ContextMenuRadioItemState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ContextMenuRadioItemState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ContextMenuRadioItemState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-4d656e75526164696f4974656d44617461417474726962757465732e636865636b6564"></a>

<a id="api-4d656e75526164696f4974656d44617461417474726962757465732e756e636865636b6564"></a>

<a id="api-4d656e75526164696f4974656d44617461417474726962757465732e686967686c696768746564"></a>

<a id="api-4d656e75526164696f4974656d44617461417474726962757465732e64697361626c6564"></a>

<a id="api-4d656e752e526164696f4974656d2e64617461417474726962757465732e646174612d7374617274696e672d7374796c65"></a>

<a id="api-4d656e752e526164696f4974656d2e64617461417474726962757465732e646174612d656e64696e672d7374796c65"></a>

| Name | Description |
| --- | --- |
| data-checked | Present when checked is true. |
| data-unchecked | Present when checked is false. |
| data-highlighted |  |
| data-disabled |  |
| data-starting-style | Present when transitionStatus is 'starting'. |
| data-ending-style | Present when transitionStatus is 'ending'. |

#### CSS variables

Metadata status: unavailable.

<a id="api-4d656e752e526164696f4974656d2e50726f7073"></a>

<a id="menuradioitemprops"></a>

<a id="api-4d656e752e526164696f4974656d2e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Menu.RadioItem.Props

Declaration: `packages/solid/build/types/menu/radio-item/MenuRadioItem.d.ts:16`

#### Declaration

```typescript
MenuRadioItemProps
```

<a id="api-4d656e752e526164696f4974656d2e50726f70732e6c6162656c"></a>

<a id="MenuRadioItemProps-label"></a>

<a id="api-4d656e752e526164696f4974656d2e50726f70732e76616c7565"></a>

<a id="MenuRadioItemProps-value"></a>

<a id="api-4d656e752e526164696f4974656d2e50726f70732e636c6f73654f6e436c69636b"></a>

<a id="MenuRadioItemProps-closeOnClick"></a>

<a id="api-4d656e752e526164696f4974656d2e50726f70732e6e6174697665427574746f6e"></a>

<a id="MenuRadioItemProps-nativeButton"></a>

<a id="api-4d656e752e526164696f4974656d2e50726f70732e64697361626c6564"></a>

<a id="MenuRadioItemProps-disabled"></a>

<a id="api-4d656e752e526164696f4974656d2e50726f70732e636c617373"></a>

<a id="MenuRadioItemProps-class"></a>

<a id="api-4d656e752e526164696f4974656d2e50726f70732e7374796c65"></a>

<a id="MenuRadioItemProps-style"></a>

<a id="api-4d656e752e526164696f4974656d2e50726f70732e72656e646572"></a>

<a id="MenuRadioItemProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| label | `string \| undefined` | No | Unavailable |  |
| value | `any` | Yes | Unavailable |  |
| closeOnClick | `boolean \| undefined` | No | Unavailable |  |
| nativeButton | `boolean \| undefined` | No | Unavailable |  |
| disabled | `boolean \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<ContextMenuRadioItemState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ContextMenuRadioItemState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ContextMenuRadioItemState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4d656e752e526164696f4974656d2e5374617465"></a>

<a id="menuradioitemstate"></a>

### Related exported type: Menu.RadioItem.State

Declaration: `packages/solid/build/types/menu/radio-item/MenuRadioItem.d.ts:17`

#### Declaration

```typescript
MenuRadioItemState
```

<a id="api-4d656e752e526164696f4974656d2e53746174652e636865636b6564"></a>

<a id="MenuRadioItemState-checked"></a>

<a id="api-4d656e752e526164696f4974656d2e53746174652e686967686c696768746564"></a>

<a id="MenuRadioItemState-highlighted"></a>

<a id="api-4d656e752e526164696f4974656d2e53746174652e64697361626c6564"></a>

<a id="MenuRadioItemState-disabled"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| checked | `boolean` | Yes | Unavailable |  |
| highlighted | `boolean` | Yes | Unavailable |  |
| disabled | `boolean` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="radioitemindicator"></a>

### RadioItemIndicator

<a id="api-4d656e752e526164696f4974656d496e64696361746f72"></a>

<a id="menuradioitemindicator"></a>

### Menu.RadioItemIndicator

Declaration: `packages/solid/build/types/menu/radio-item-indicator/MenuRadioItemIndicator.d.ts:6`

#### Declaration

```typescript
(props: MenuRadioItemIndicatorProps) => JSX.Element
```

<a id="api-4d656e752e526164696f4974656d496e64696361746f722e2470726f70732e636c617373"></a>

<a id="MenuRadioItemIndicator-class"></a>

<a id="api-4d656e752e526164696f4974656d496e64696361746f722e2470726f70732e7374796c65"></a>

<a id="MenuRadioItemIndicator-style"></a>

<a id="api-4d656e752e526164696f4974656d496e64696361746f722e2470726f70732e6b6565704d6f756e746564"></a>

<a id="MenuRadioItemIndicator-keepMounted"></a>

<a id="api-4d656e752e526164696f4974656d496e64696361746f722e2470726f70732e72656e646572"></a>

<a id="MenuRadioItemIndicator-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<MenuIndicatorState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<MenuIndicatorState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| keepMounted | `boolean \| undefined` | No | Unavailable |  |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, MenuIndicatorState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-4d656e75526164696f4974656d496e64696361746f7244617461417474726962757465732e636865636b6564"></a>

<a id="api-4d656e75526164696f4974656d496e64696361746f7244617461417474726962757465732e756e636865636b6564"></a>

<a id="api-4d656e75526164696f4974656d496e64696361746f7244617461417474726962757465732e64697361626c6564"></a>

<a id="api-4d656e75526164696f4974656d496e64696361746f7244617461417474726962757465732e7374617274696e675374796c65"></a>

<a id="api-4d656e75526164696f4974656d496e64696361746f7244617461417474726962757465732e656e64696e675374796c65"></a>

| Name | Description |
| --- | --- |
| data-checked |  |
| data-unchecked |  |
| data-disabled |  |
| data-starting-style |  |
| data-ending-style |  |

#### CSS variables

Metadata status: unavailable.

<a id="api-4d656e752e526164696f4974656d496e64696361746f722e50726f7073"></a>

<a id="menuradioitemindicatorprops"></a>

### Related exported type: Menu.RadioItemIndicator.Props

Declaration: `packages/solid/build/types/menu/radio-item-indicator/MenuRadioItemIndicator.d.ts:8`

#### Declaration

```typescript
MenuRadioItemIndicatorProps
```

<a id="api-4d656e752e526164696f4974656d496e64696361746f722e50726f70732e636c617373"></a>

<a id="MenuRadioItemIndicatorProps-class"></a>

<a id="api-4d656e752e526164696f4974656d496e64696361746f722e50726f70732e7374796c65"></a>

<a id="MenuRadioItemIndicatorProps-style"></a>

<a id="api-4d656e752e526164696f4974656d496e64696361746f722e50726f70732e6b6565704d6f756e746564"></a>

<a id="MenuRadioItemIndicatorProps-keepMounted"></a>

<a id="api-4d656e752e526164696f4974656d496e64696361746f722e50726f70732e72656e646572"></a>

<a id="MenuRadioItemIndicatorProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<MenuIndicatorState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<MenuIndicatorState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| keepMounted | `boolean \| undefined` | No | Unavailable |  |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, MenuIndicatorState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4d656e752e526164696f4974656d496e64696361746f722e5374617465"></a>

<a id="menuradioitemindicatorstate"></a>

### Related exported type: Menu.RadioItemIndicator.State

Declaration: `packages/solid/build/types/menu/radio-item-indicator/MenuRadioItemIndicator.d.ts:9`

#### Declaration

```typescript
MenuRadioItemIndicatorState
```

<a id="api-4d656e752e526164696f4974656d496e64696361746f722e53746174652e636865636b6564"></a>

<a id="MenuRadioItemIndicatorState-checked"></a>

<a id="api-4d656e752e526164696f4974656d496e64696361746f722e53746174652e686967686c696768746564"></a>

<a id="MenuRadioItemIndicatorState-highlighted"></a>

<a id="api-4d656e752e526164696f4974656d496e64696361746f722e53746174652e7472616e736974696f6e537461747573"></a>

<a id="MenuRadioItemIndicatorState-transitionStatus"></a>

<a id="api-4d656e752e526164696f4974656d496e64696361746f722e53746174652e64697361626c6564"></a>

<a id="MenuRadioItemIndicatorState-disabled"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| checked | `boolean` | Yes | Unavailable |  |
| highlighted | `boolean` | Yes | Unavailable |  |
| transitionStatus | `TransitionStatus` | Yes | Unavailable |  |
| disabled | `boolean` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="checkboxitem"></a>

### CheckboxItem

<a id="api-4d656e752e436865636b626f784974656d"></a>

<a id="menucheckboxitem"></a>

<a id="api-4d656e752e436865636b626f784974656d2e2470726f70732e70726f703a616c69676e"></a>

### Menu.CheckboxItem

Declaration: `packages/solid/build/types/menu/checkbox-item/MenuCheckboxItem.d.ts:17`

#### Declaration

```typescript
(props: MenuCheckboxItemProps) => JSX.Element
```

<a id="api-4d656e752e436865636b626f784974656d2e2470726f70732e6c6162656c"></a>

<a id="MenuCheckboxItem-label"></a>

<a id="api-4d656e752e436865636b626f784974656d2e2470726f70732e64656661756c74436865636b6564"></a>

<a id="MenuCheckboxItem-defaultChecked"></a>

<a id="api-4d656e752e436865636b626f784974656d2e2470726f70732e636865636b6564"></a>

<a id="MenuCheckboxItem-checked"></a>

<a id="api-4d656e752e436865636b626f784974656d2e2470726f70732e6f6e436865636b65644368616e6765"></a>

<a id="MenuCheckboxItem-onCheckedChange"></a>

<a id="api-4d656e752e436865636b626f784974656d2e2470726f70732e636c6f73654f6e436c69636b"></a>

<a id="MenuCheckboxItem-closeOnClick"></a>

<a id="api-4d656e752e436865636b626f784974656d2e2470726f70732e6e6174697665427574746f6e"></a>

<a id="MenuCheckboxItem-nativeButton"></a>

<a id="api-4d656e752e436865636b626f784974656d2e2470726f70732e64697361626c6564"></a>

<a id="MenuCheckboxItem-disabled"></a>

<a id="api-4d656e752e436865636b626f784974656d2e2470726f70732e636c617373"></a>

<a id="MenuCheckboxItem-class"></a>

<a id="api-4d656e752e436865636b626f784974656d2e2470726f70732e7374796c65"></a>

<a id="MenuCheckboxItem-style"></a>

<a id="api-4d656e752e436865636b626f784974656d2e2470726f70732e72656e646572"></a>

<a id="MenuCheckboxItem-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| label | `string \| undefined` | No | Unavailable |  |
| defaultChecked | `boolean \| undefined` | No | false |  |
| checked | `boolean \| undefined` | No | Unavailable |  |
| onCheckedChange | `((checked: boolean, details: MenuRoot.ChangeEventDetails) => void) \| undefined` | No | Unavailable |  |
| closeOnClick | `boolean \| undefined` | No | Unavailable |  |
| nativeButton | `boolean \| undefined` | No | false |  |
| disabled | `boolean \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<ContextMenuCheckboxItemState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ContextMenuCheckboxItemState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ContextMenuCheckboxItemState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-4d656e75436865636b626f784974656d44617461417474726962757465732e636865636b6564"></a>

<a id="api-4d656e75436865636b626f784974656d44617461417474726962757465732e756e636865636b6564"></a>

<a id="api-4d656e75436865636b626f784974656d44617461417474726962757465732e686967686c696768746564"></a>

<a id="api-4d656e75436865636b626f784974656d44617461417474726962757465732e64697361626c6564"></a>

<a id="api-4d656e752e436865636b626f784974656d2e64617461417474726962757465732e646174612d7374617274696e672d7374796c65"></a>

<a id="api-4d656e752e436865636b626f784974656d2e64617461417474726962757465732e646174612d656e64696e672d7374796c65"></a>

| Name | Description |
| --- | --- |
| data-checked | Present when checked is true. |
| data-unchecked | Present when checked is false. |
| data-highlighted |  |
| data-disabled |  |
| data-starting-style | Present when transitionStatus is 'starting'. |
| data-ending-style | Present when transitionStatus is 'ending'. |

#### CSS variables

Metadata status: unavailable.

<a id="api-4d656e752e436865636b626f784974656d2e50726f7073"></a>

<a id="menucheckboxitemprops"></a>

<a id="api-4d656e752e436865636b626f784974656d2e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Menu.CheckboxItem.Props

Declaration: `packages/solid/build/types/menu/checkbox-item/MenuCheckboxItem.d.ts:21`

#### Declaration

```typescript
MenuCheckboxItemProps
```

<a id="api-4d656e752e436865636b626f784974656d2e50726f70732e6c6162656c"></a>

<a id="MenuCheckboxItemProps-label"></a>

<a id="api-4d656e752e436865636b626f784974656d2e50726f70732e64656661756c74436865636b6564"></a>

<a id="MenuCheckboxItemProps-defaultChecked"></a>

<a id="api-4d656e752e436865636b626f784974656d2e50726f70732e636865636b6564"></a>

<a id="MenuCheckboxItemProps-checked"></a>

<a id="api-4d656e752e436865636b626f784974656d2e50726f70732e6f6e436865636b65644368616e6765"></a>

<a id="MenuCheckboxItemProps-onCheckedChange"></a>

<a id="api-4d656e752e436865636b626f784974656d2e50726f70732e636c6f73654f6e436c69636b"></a>

<a id="MenuCheckboxItemProps-closeOnClick"></a>

<a id="api-4d656e752e436865636b626f784974656d2e50726f70732e6e6174697665427574746f6e"></a>

<a id="MenuCheckboxItemProps-nativeButton"></a>

<a id="api-4d656e752e436865636b626f784974656d2e50726f70732e64697361626c6564"></a>

<a id="MenuCheckboxItemProps-disabled"></a>

<a id="api-4d656e752e436865636b626f784974656d2e50726f70732e636c617373"></a>

<a id="MenuCheckboxItemProps-class"></a>

<a id="api-4d656e752e436865636b626f784974656d2e50726f70732e7374796c65"></a>

<a id="MenuCheckboxItemProps-style"></a>

<a id="api-4d656e752e436865636b626f784974656d2e50726f70732e72656e646572"></a>

<a id="MenuCheckboxItemProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| label | `string \| undefined` | No | Unavailable |  |
| defaultChecked | `boolean \| undefined` | No | Unavailable |  |
| checked | `boolean \| undefined` | No | Unavailable |  |
| onCheckedChange | `((checked: boolean, details: MenuRoot.ChangeEventDetails) => void) \| undefined` | No | Unavailable |  |
| closeOnClick | `boolean \| undefined` | No | Unavailable |  |
| nativeButton | `boolean \| undefined` | No | Unavailable |  |
| disabled | `boolean \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<ContextMenuCheckboxItemState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ContextMenuCheckboxItemState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ContextMenuCheckboxItemState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4d656e752e436865636b626f784974656d2e5374617465"></a>

<a id="menucheckboxitemstate"></a>

### Related exported type: Menu.CheckboxItem.State

Declaration: `packages/solid/build/types/menu/checkbox-item/MenuCheckboxItem.d.ts:22`

#### Declaration

```typescript
MenuCheckboxItemState
```

<a id="api-4d656e752e436865636b626f784974656d2e53746174652e636865636b6564"></a>

<a id="MenuCheckboxItemState-checked"></a>

<a id="api-4d656e752e436865636b626f784974656d2e53746174652e686967686c696768746564"></a>

<a id="MenuCheckboxItemState-highlighted"></a>

<a id="api-4d656e752e436865636b626f784974656d2e53746174652e64697361626c6564"></a>

<a id="MenuCheckboxItemState-disabled"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| checked | `boolean` | Yes | Unavailable |  |
| highlighted | `boolean` | Yes | Unavailable |  |
| disabled | `boolean` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4d656e752e436865636b626f784974656d2e4368616e67654576656e74526561736f6e"></a>

<a id="menucheckboxitemchangeeventreason"></a>

### Related exported type: Menu.CheckboxItem.ChangeEventReason

Declaration: `packages/solid/build/types/menu/checkbox-item/MenuCheckboxItem.d.ts:23`

#### Declaration

```typescript
MenuRootChangeEventReason
```

Inherited DOM attributes: `__@iterator@106`, `anchor`, `at`, `big`, `blink`, `bold`, `charAt`, `charCodeAt`, `codePointAt`, `concat`, `endsWith`, `fixed`, `fontcolor`, `fontsize`, `includes`, `indexOf`, `isWellFormed`, `italics`, `lastIndexOf`, `length`, `link`, `localeCompare`, `match`, `matchAll`, `normalize`, `padEnd`, `padStart`, `repeat`, `replace`, `replaceAll`, `search`, `slice`, `small`, `split`, `startsWith`, `strike`, `sub`, `substr`, `substring`, `sup`, `toLocaleLowerCase`, `toLocaleUpperCase`, `toLowerCase`, `toString`, `toUpperCase`, `toWellFormed`, `trim`, `trimEnd`, `trimLeft`, `trimRight`, `trimStart`, `valueOf`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4d656e752e436865636b626f784974656d2e4368616e67654576656e7444657461696c73"></a>

<a id="menucheckboxitemchangeeventdetails"></a>

### Related exported type: Menu.CheckboxItem.ChangeEventDetails

Declaration: `packages/solid/build/types/menu/checkbox-item/MenuCheckboxItem.d.ts:24`

#### Declaration

```typescript
MenuRootChangeEventDetails
```

<a id="api-4d656e752e436865636b626f784974656d2e4368616e67654576656e7444657461696c732e616c6c6f7750726f7061676174696f6e"></a>

<a id="MenuCheckboxItemChangeEventDetails-allowPropagation"></a>

<a id="api-4d656e752e436865636b626f784974656d2e4368616e67654576656e7444657461696c732e63616e63656c"></a>

<a id="MenuCheckboxItemChangeEventDetails-cancel"></a>

<a id="api-4d656e752e436865636b626f784974656d2e4368616e67654576656e7444657461696c732e6576656e74"></a>

<a id="MenuCheckboxItemChangeEventDetails-event"></a>

<a id="api-4d656e752e436865636b626f784974656d2e4368616e67654576656e7444657461696c732e697343616e63656c6564"></a>

<a id="MenuCheckboxItemChangeEventDetails-isCanceled"></a>

<a id="api-4d656e752e436865636b626f784974656d2e4368616e67654576656e7444657461696c732e697350726f7061676174696f6e416c6c6f776564"></a>

<a id="MenuCheckboxItemChangeEventDetails-isPropagationAllowed"></a>

<a id="api-4d656e752e436865636b626f784974656d2e4368616e67654576656e7444657461696c732e70726576656e74556e6d6f756e744f6e436c6f7365"></a>

<a id="MenuCheckboxItemChangeEventDetails-preventUnmountOnClose"></a>

<a id="api-4d656e752e436865636b626f784974656d2e4368616e67654576656e7444657461696c732e726561736f6e"></a>

<a id="MenuCheckboxItemChangeEventDetails-reason"></a>

<a id="api-4d656e752e436865636b626f784974656d2e4368616e67654576656e7444657461696c732e74726967676572"></a>

<a id="MenuCheckboxItemChangeEventDetails-trigger"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| allowPropagation | `() => void` | Yes | Unavailable | Marks this change transaction as allowing propagation. |
| cancel | `() => void` | Yes | Unavailable | Cancels the Base UI change transaction; separate from the DOM event’s preventDefault() and preventBaseUIHandler(). |
| event | `PointerEvent \| MouseEvent \| Event \| FocusEvent \| KeyboardEvent \| TouchEvent` | Yes | Unavailable | Native DOM event associated with the change. Programmatic changes can use a Base UI-created Event. |
| isCanceled | `boolean` | Yes | Unavailable | Whether cancel() has been called for this change transaction. |
| isPropagationAllowed | `boolean` | Yes | Unavailable | Whether allowPropagation() has been called for this change transaction. |
| preventUnmountOnClose | `() => void` | Yes | Unavailable |  |
| reason | `"none" \| "trigger-press" \| "trigger-hover" \| "trigger-focus" \| "outside-press" \| "item-press" \| "close-press" \| "focus-out" \| "escape-key" \| "list-navigation" \| "cancel-open" \| "sibling-open" \| "imperative-action"` | Yes | Unavailable | Reason for the requested change; it discriminates the native event type. |
| trigger | `Element \| undefined` | Yes | Unavailable | Trigger element associated with this change, when available. |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="checkboxitemindicator"></a>

### CheckboxItemIndicator

<a id="api-4d656e752e436865636b626f784974656d496e64696361746f72"></a>

<a id="menucheckboxitemindicator"></a>

### Menu.CheckboxItemIndicator

Declaration: `packages/solid/build/types/menu/checkbox-item-indicator/MenuCheckboxItemIndicator.d.ts:6`

#### Declaration

```typescript
(props: MenuCheckboxItemIndicatorProps) => JSX.Element
```

<a id="api-4d656e752e436865636b626f784974656d496e64696361746f722e2470726f70732e636c617373"></a>

<a id="MenuCheckboxItemIndicator-class"></a>

<a id="api-4d656e752e436865636b626f784974656d496e64696361746f722e2470726f70732e7374796c65"></a>

<a id="MenuCheckboxItemIndicator-style"></a>

<a id="api-4d656e752e436865636b626f784974656d496e64696361746f722e2470726f70732e6b6565704d6f756e746564"></a>

<a id="MenuCheckboxItemIndicator-keepMounted"></a>

<a id="api-4d656e752e436865636b626f784974656d496e64696361746f722e2470726f70732e72656e646572"></a>

<a id="MenuCheckboxItemIndicator-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<MenuIndicatorState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<MenuIndicatorState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| keepMounted | `boolean \| undefined` | No | Unavailable |  |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, MenuIndicatorState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-4d656e75436865636b626f784974656d496e64696361746f7244617461417474726962757465732e636865636b6564"></a>

<a id="api-4d656e75436865636b626f784974656d496e64696361746f7244617461417474726962757465732e756e636865636b6564"></a>

<a id="api-4d656e75436865636b626f784974656d496e64696361746f7244617461417474726962757465732e64697361626c6564"></a>

<a id="api-4d656e75436865636b626f784974656d496e64696361746f7244617461417474726962757465732e7374617274696e675374796c65"></a>

<a id="api-4d656e75436865636b626f784974656d496e64696361746f7244617461417474726962757465732e656e64696e675374796c65"></a>

| Name | Description |
| --- | --- |
| data-checked |  |
| data-unchecked |  |
| data-disabled |  |
| data-starting-style |  |
| data-ending-style |  |

#### CSS variables

Metadata status: unavailable.

<a id="api-4d656e752e436865636b626f784974656d496e64696361746f722e50726f7073"></a>

<a id="menucheckboxitemindicatorprops"></a>

### Related exported type: Menu.CheckboxItemIndicator.Props

Declaration: `packages/solid/build/types/menu/checkbox-item-indicator/MenuCheckboxItemIndicator.d.ts:8`

#### Declaration

```typescript
MenuCheckboxItemIndicatorProps
```

<a id="api-4d656e752e436865636b626f784974656d496e64696361746f722e50726f70732e636c617373"></a>

<a id="MenuCheckboxItemIndicatorProps-class"></a>

<a id="api-4d656e752e436865636b626f784974656d496e64696361746f722e50726f70732e7374796c65"></a>

<a id="MenuCheckboxItemIndicatorProps-style"></a>

<a id="api-4d656e752e436865636b626f784974656d496e64696361746f722e50726f70732e6b6565704d6f756e746564"></a>

<a id="MenuCheckboxItemIndicatorProps-keepMounted"></a>

<a id="api-4d656e752e436865636b626f784974656d496e64696361746f722e50726f70732e72656e646572"></a>

<a id="MenuCheckboxItemIndicatorProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<MenuIndicatorState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<MenuIndicatorState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| keepMounted | `boolean \| undefined` | No | Unavailable |  |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, MenuIndicatorState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4d656e752e436865636b626f784974656d496e64696361746f722e5374617465"></a>

<a id="menucheckboxitemindicatorstate"></a>

### Related exported type: Menu.CheckboxItemIndicator.State

Declaration: `packages/solid/build/types/menu/checkbox-item-indicator/MenuCheckboxItemIndicator.d.ts:9`

#### Declaration

```typescript
MenuCheckboxItemIndicatorState
```

<a id="api-4d656e752e436865636b626f784974656d496e64696361746f722e53746174652e636865636b6564"></a>

<a id="MenuCheckboxItemIndicatorState-checked"></a>

<a id="api-4d656e752e436865636b626f784974656d496e64696361746f722e53746174652e686967686c696768746564"></a>

<a id="MenuCheckboxItemIndicatorState-highlighted"></a>

<a id="api-4d656e752e436865636b626f784974656d496e64696361746f722e53746174652e7472616e736974696f6e537461747573"></a>

<a id="MenuCheckboxItemIndicatorState-transitionStatus"></a>

<a id="api-4d656e752e436865636b626f784974656d496e64696361746f722e53746174652e64697361626c6564"></a>

<a id="MenuCheckboxItemIndicatorState-disabled"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| checked | `boolean` | Yes | Unavailable |  |
| highlighted | `boolean` | Yes | Unavailable |  |
| transitionStatus | `TransitionStatus` | Yes | Unavailable |  |
| disabled | `boolean` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="separator"></a>

### Separator

<a id="api-4d656e752e536570617261746f72"></a>

<a id="menuseparator"></a>

<a id="api-4d656e752e536570617261746f722e2470726f70732e70726f703a616c69676e"></a>

### Menu.Separator

A separator element accessible to screen readers.
Renders a `<div>` element.

Declaration: `packages/solid/build/types/separator/Separator.d.ts:6`

#### Declaration

```typescript
(componentProps: Separator.Props) => JSX.Element
```

<a id="api-4d656e752e536570617261746f722e2470726f70732e6f7269656e746174696f6e"></a>

<a id="MenuSeparator-orientation"></a>

<a id="api-4d656e752e536570617261746f722e2470726f70732e636c617373"></a>

<a id="MenuSeparator-class"></a>

<a id="api-4d656e752e536570617261746f722e2470726f70732e7374796c65"></a>

<a id="MenuSeparator-style"></a>

<a id="api-4d656e752e536570617261746f722e2470726f70732e72656e646572"></a>

<a id="MenuSeparator-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| orientation | `Orientation \| undefined` | No | 'horizontal' | The orientation of the separator. |
| class | `JSX.ClassValue \| ((state: Readonly<SeparatorState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<SeparatorState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, SeparatorState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-4d656e752e536570617261746f722e64617461417474726962757465732e6f7269656e746174696f6e"></a>

| Name | Description |
| --- | --- |
| data-orientation | Indicates the orientation of the separator. |

#### CSS variables

Metadata status: unavailable.

<a id="api-4d656e752e536570617261746f722e50726f7073"></a>

<a id="menuseparatorprops"></a>

<a id="api-4d656e752e536570617261746f722e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Menu.Separator.Props

Declaration: `packages/solid/build/types/separator/Separator.d.ts:19`

#### Declaration

```typescript
SeparatorProps
```

<a id="api-4d656e752e536570617261746f722e50726f70732e6f7269656e746174696f6e"></a>

<a id="MenuSeparatorProps-orientation"></a>

<a id="api-4d656e752e536570617261746f722e50726f70732e636c617373"></a>

<a id="MenuSeparatorProps-class"></a>

<a id="api-4d656e752e536570617261746f722e50726f70732e7374796c65"></a>

<a id="MenuSeparatorProps-style"></a>

<a id="api-4d656e752e536570617261746f722e50726f70732e72656e646572"></a>

<a id="MenuSeparatorProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| orientation | `Orientation \| undefined` | No | 'horizontal' | The orientation of the separator. |
| class | `JSX.ClassValue \| ((state: Readonly<SeparatorState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<SeparatorState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, SeparatorState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4d656e752e536570617261746f722e5374617465"></a>

<a id="menuseparatorstate"></a>

### Related exported type: Menu.Separator.State

Declaration: `packages/solid/build/types/separator/Separator.d.ts:20`

#### Declaration

```typescript
SeparatorState
```

<a id="api-4d656e752e536570617261746f722e53746174652e6f7269656e746174696f6e"></a>

<a id="MenuSeparatorState-orientation"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| orientation | `Orientation` | Yes | Unavailable | The orientation of the separator. |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="usefilter"></a>

## useFilter

When filtering items yourself, `Menu.useFilter` matches text according to the user's locale.

<a id="api-4d656e752e75736546696c746572"></a>

<a id="menuusefilter"></a>

### Menu.useFilter

Declaration: `packages/solid/build/types/internals/filter.d.ts:3`

#### Declaration

```typescript
(options?: GetFilterParameters) => Filter
```

<a id="api-4d656e752e75736546696c7465722e24706172616d65746572732e6f7074696f6e73"></a>

<a id="MenuuseFilter-options"></a>

#### Parameters

| Parameter | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| options | `GetFilterParameters \| undefined` | No | {} |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

#### Return value

```typescript
Filter
```

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| contains | `<Item>(item: Item, query: string, itemToString?: (item: Item) => string) => boolean` | Yes | Unavailable | Returns whether the item matches the query anywhere. |
| startsWith | `<Item>(item: Item, query: string, itemToString?: (item: Item) => string) => boolean` | Yes | Unavailable | Returns whether the item starts with the query. |
| endsWith | `<Item>(item: Item, query: string, itemToString?: (item: Item) => string) => boolean` | Yes | Unavailable | Returns whether the item ends with the query. |

<a id="createhandle"></a>

## createHandle

<a id="api-4d656e752e63726561746548616e646c65"></a>

<a id="menucreatehandle"></a>

### Menu.createHandle

Declaration: `packages/solid/build/types/menu/store/MenuHandle.d.ts:10`

#### Declaration

```typescript
<Payload = unknown>() => MenuHandle<Payload>
```

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

#### Return value

```typescript
MenuHandle<Payload>
```

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| open | `(triggerId: string) => void` | Yes | Unavailable |  |
| close | `() => void` | Yes | Unavailable |  |
| isOpen | `boolean` | Yes | Unavailable |  |
| fallbackStore | `MenuHandleStore<Payload>` | Yes | Unavailable |  |
| componentName | `any` | Yes | Unavailable |  |
| throwOnMissingTrigger | `any` | Yes | Unavailable |  |
| attached | `any` | Yes | Unavailable |  |
| current | `any` | Yes | Unavailable |  |
| version | `any` | Yes | Unavailable |  |
| warning | `any` | Yes | Unavailable |  |
| attachedStore | `MenuStore<Payload> \| null` | Yes | Unavailable |  |
| store | `MenuHandleStore<Payload>` | Yes | Unavailable |  |
| serverStore | `MenuHandleStore<Payload>` | Yes | Unavailable |  |
| attachStore | `(store: MenuStore<Payload>) => () => void` | Yes | Unavailable |  |
| activate | `any` | Yes | Unavailable |  |
| openByTrigger | `(id: string \| null \| undefined) => void` | Yes | Unavailable |  |
| closePopup | `() => void` | Yes | Unavailable |  |

[//]: # "@exclude-table-of-contents"

<a id="handle"></a>

### Handle

<a id="api-4d656e752e48616e646c65"></a>

<a id="menuhandle"></a>

### Menu.Handle

The foundation owns attachment order, inert fallback and trigger migration.

Declaration: `packages/solid/build/types/menu/store/MenuHandle.d.ts:4`

#### Declaration

```typescript
MenuHandle<Payload>
```

<a id="api-4d656e752e48616e646c652e6f70656e"></a>

<a id="MenuHandle-open"></a>

<a id="api-4d656e752e48616e646c652e6163746976617465"></a>

<a id="MenuHandle-activate"></a>

<a id="api-4d656e752e48616e646c652e61747461636853746f7265"></a>

<a id="MenuHandle-attachStore"></a>

<a id="api-4d656e752e48616e646c652e6174746163686564"></a>

<a id="MenuHandle-attached"></a>

<a id="api-4d656e752e48616e646c652e617474616368656453746f7265"></a>

<a id="MenuHandle-attachedStore"></a>

<a id="api-4d656e752e48616e646c652e636c6f7365"></a>

<a id="MenuHandle-close"></a>

<a id="api-4d656e752e48616e646c652e636c6f7365506f707570"></a>

<a id="MenuHandle-closePopup"></a>

<a id="api-4d656e752e48616e646c652e636f6d706f6e656e744e616d65"></a>

<a id="MenuHandle-componentName"></a>

<a id="api-4d656e752e48616e646c652e63757272656e74"></a>

<a id="MenuHandle-current"></a>

<a id="api-4d656e752e48616e646c652e66616c6c6261636b53746f7265"></a>

<a id="MenuHandle-fallbackStore"></a>

<a id="api-4d656e752e48616e646c652e69734f70656e"></a>

<a id="MenuHandle-isOpen"></a>

<a id="api-4d656e752e48616e646c652e6f70656e427954726967676572"></a>

<a id="MenuHandle-openByTrigger"></a>

<a id="api-4d656e752e48616e646c652e73657276657253746f7265"></a>

<a id="MenuHandle-serverStore"></a>

<a id="api-4d656e752e48616e646c652e73746f7265"></a>

<a id="MenuHandle-store"></a>

<a id="api-4d656e752e48616e646c652e7468726f774f6e4d697373696e6754726967676572"></a>

<a id="MenuHandle-throwOnMissingTrigger"></a>

<a id="api-4d656e752e48616e646c652e76657273696f6e"></a>

<a id="MenuHandle-version"></a>

<a id="api-4d656e752e48616e646c652e7761726e696e67"></a>

<a id="MenuHandle-warning"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| open | `(triggerId: string) => void` | Yes | Unavailable |  |
| activate | `any` | Yes | Unavailable |  |
| attachStore | `(store: MenuStore<Payload>) => () => void` | Yes | Unavailable |  |
| attached | `any` | Yes | Unavailable |  |
| attachedStore | `MenuStore<Payload> \| null` | Yes | Unavailable |  |
| close | `() => void` | Yes | Unavailable |  |
| closePopup | `() => void` | Yes | Unavailable |  |
| componentName | `any` | Yes | Unavailable |  |
| current | `any` | Yes | Unavailable |  |
| fallbackStore | `MenuHandleStore<Payload>` | Yes | Unavailable |  |
| isOpen | `boolean` | Yes | Unavailable |  |
| openByTrigger | `(id: string \| null \| undefined) => void` | Yes | Unavailable |  |
| serverStore | `MenuHandleStore<Payload>` | Yes | Unavailable |  |
| store | `MenuHandleStore<Payload>` | Yes | Unavailable |  |
| throwOnMissingTrigger | `any` | Yes | Unavailable |  |
| version | `any` | Yes | Unavailable |  |
| warning | `any` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

