# Context Menu

A menu that appears at the pointer on right click or long press.



[Interactive example](/solid/components/context-menu)

## Usage guidelines

- **Use context menus as an enhancement**: Don't make a context menu the only way to perform actions. Users may not discover or be able to open a context menu, especially on touch devices or with assistive technology. Always provide visible controls for the actions that are available in the context menu.

## Anatomy

Import the components and place them together:

```tsx
import { ContextMenu } from 'baseui-solid2/context-menu';
<ContextMenu.Root>
  <ContextMenu.Trigger />
  <ContextMenu.Portal>
    <ContextMenu.Backdrop />
    <ContextMenu.Positioner>
      <ContextMenu.Popup>
        <ContextMenu.Arrow />
        <ContextMenu.Item />
        <ContextMenu.LinkItem />
        <ContextMenu.Separator />

        <ContextMenu.SubmenuRoot>
          <ContextMenu.SubmenuTrigger />
        </ContextMenu.SubmenuRoot>

        <ContextMenu.Group>
          <ContextMenu.GroupLabel />
        </ContextMenu.Group>

        <ContextMenu.RadioGroup>
          <ContextMenu.RadioItem>
            <ContextMenu.RadioItemIndicator />
          </ContextMenu.RadioItem>
        </ContextMenu.RadioGroup>

        <ContextMenu.CheckboxItem>
          <ContextMenu.CheckboxItemIndicator />
        </ContextMenu.CheckboxItem>
      </ContextMenu.Popup>
    </ContextMenu.Positioner>
  </ContextMenu.Portal>
</ContextMenu.Root>;
```

## Examples

[Menu](/solid/components/menu#examples) displays additional demos, many of which apply to the context menu as well.

### Using with Menu

A context menu should supplement a primary way to perform the same actions. This image card exposes actions through a visible menu button and reuses them in the context menu for right-click and long-press users.

[Interactive example](/solid/components/context-menu)

### Nested menu

To create a submenu, create a `<ContextMenu.SubmenuRoot>` inside the parent context menu. Use the `<ContextMenu.SubmenuTrigger>` part for the menu item that opens the nested menu.

[Interactive example](/solid/components/context-menu)

## API reference

### Root

Creates a context menu activated by right clicking or long pressing.

| Prop | Type | Description |
| --- | --- | --- |
| defaultOpen | boolean \| undefined |  |
| open | boolean \| undefined |  |
| onOpenChange | ((open: boolean, eventDetails: ContextMenuRootChangeEventDetails) => void) \| undefined |  |
| highlightItemOnHover | boolean \| undefined |  |
| actionsRef | MutableCell<MenuRootActions \| null> \| undefined |  |
| closeParentOnEsc | boolean \| undefined |  |
| loopFocus | boolean \| undefined |  |
| onItemHighlighted | ((item: HTMLElement \| undefined, details: MenuRootHighlightEventDetails) => void) \| undefined |  |
| onOpenChangeComplete | ((open: boolean) => void) \| undefined |  |
| disabled | boolean \| undefined |  |
| orientation | MenuRootOrientation \| undefined |  |
| children | JSX.Element |  |

### Trigger

An area that opens the menu on right click or long press. Renders a div.

| Prop | Type | Description |
| --- | --- | --- |
| class | JSX.ClassValue \| ((state: Readonly<ContextMenuTriggerState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ContextMenuTriggerState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ContextMenuTriggerState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

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

Positions against the pointer (root) or submenu trigger; the Menu engine owns defaults.

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

### Arrow



| Prop | Type | Description |
| --- | --- | --- |
| class | JSX.ClassValue \| ((state: Readonly<ContextMenuArrowState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ContextMenuArrowState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ContextMenuArrowState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

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

