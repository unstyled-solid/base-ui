# Navigation Menu

A collection of links and menus for website navigation.



[Interactive example](/solid/components/navigation-menu)

## Anatomy

Import the component and assemble its parts:

```tsx
import { NavigationMenu } from 'baseui-solid2/navigation-menu';
<NavigationMenu.Root>
  <NavigationMenu.List>
    <NavigationMenu.Item>
      <NavigationMenu.Trigger>
        <NavigationMenu.Icon />
      </NavigationMenu.Trigger>
      <NavigationMenu.Content>
        <NavigationMenu.Link />
      </NavigationMenu.Content>
    </NavigationMenu.Item>
  </NavigationMenu.List>

  <NavigationMenu.Portal>
    <NavigationMenu.Backdrop />
    <NavigationMenu.Positioner>
      <NavigationMenu.Popup>
        <NavigationMenu.Arrow />
        <NavigationMenu.Viewport />
      </NavigationMenu.Popup>
    </NavigationMenu.Positioner>
  </NavigationMenu.Portal>
</NavigationMenu.Root>;
```

## Examples

### Nested submenus

`<NavigationMenu.Root>` component can be nested within a higher-level `<NavigationMenu.Content>` part to create a multi-level navigation menu.

[Interactive example](/solid/components/navigation-menu)

### Nested inline submenus

For second-level navigation that should stay in the same panel, omit the nested `<NavigationMenu.Portal>` and render only `List` + `Viewport` with a `defaultValue`.

[Interactive example](/solid/components/navigation-menu)

### Custom links

The `<NavigationMenu.Link>` part can be customized to render the link from your framework using the `render` prop to enable client-side routing.

```jsx
// @highlight
import NextLink from 'next/link';
import { NavigationMenu } from '@base-ui/react/navigation-menu';

function Link(props: NavigationMenu.Link.Props) {
  return (
    <NavigationMenu.Link
      // @highlight
      render={<NextLink href={props.href} />}
      {...props}
    />
  );
}
```

### Large menus

When you have large menu content that doesn't fit in the viewport in some cases, you usually have two choices:

- Compress the navigation menu content

You can change the layout of the navigation menu to render less content or be more compact by reducing the space it takes up.
If your content is flexible, you can use the `max-height` property on `.Popup` to limit the height of the navigation menu to let it compress itself while preventing overflow.

```css
.Content,
.Popup {
  max-height: var(--available-height);
}
```

- Make the navigation menu scrollable

```css
.Content,
.Popup {
  max-height: var(--available-height);
}

.Content {
  overflow-y: auto;
}
```

Native scrollbars are visible while transitioning content, so we recommend using the [Scroll Area](/solid/components/scroll-area) component instead of native scrollbars to keep them hidden, which also allows the `Arrow` to be centered correctly.

## Closing animations

The popup stays rendered until its closing animation finishes.
See [JavaScript animations](/solid/handbook/animation#javascript-animations) for animating it with Motion and for manual control.
For Navigation Menu, call `eventDetails.preventUnmountOnClose()` in `onValueChange` when the value becomes `null`, and use `actionsRef.current.close()` instead of setting `value` to `null` directly.

## API reference

### Root



| Prop | Type | Description |
| --- | --- | --- |
| defaultValue | Value \| null \| undefined |  |
| value | Value \| null \| undefined |  |
| onValueChange | ((value: Value \| null, details: NavigationMenuRootChangeEventDetails) => void) \| undefined |  |
| actionsRef | { current: NavigationMenuRootActions \| null; } \| ((actions: NavigationMenuRootActions \| null) => void) \| undefined |  |
| onOpenChangeComplete | ((open: boolean) => void) \| undefined |  |
| delay | number \| undefined |  |
| closeDelay | number \| undefined |  |
| orientation | "horizontal" \| "vertical" \| undefined |  |
| class | JSX.ClassValue \| ((state: Readonly<NavigationMenuRootState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<NavigationMenuRootState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, NavigationMenuRootState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### List



| Prop | Type | Description |
| --- | --- | --- |
| class | JSX.ClassValue \| ((state: Readonly<NavigationMenuListState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<NavigationMenuListState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, NavigationMenuListState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Item



| Prop | Type | Description |
| --- | --- | --- |
| value | any |  |
| class | JSX.ClassValue \| ((state: Readonly<NavigationMenuItemState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<NavigationMenuItemState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, NavigationMenuItemState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Trigger



| Prop | Type | Description |
| --- | --- | --- |
| nativeButton | boolean \| undefined |  |
| disabled | boolean \| undefined |  |
| class | JSX.ClassValue \| ((state: Readonly<NavigationMenuTriggerState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<NavigationMenuTriggerState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, NavigationMenuTriggerState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Icon



| Prop | Type | Description |
| --- | --- | --- |
| class | JSX.ClassValue \| ((state: Readonly<NavigationMenuIconState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<NavigationMenuIconState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, NavigationMenuIconState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Content



| Prop | Type | Description |
| --- | --- | --- |
| class | JSX.ClassValue \| ((state: Readonly<NavigationMenuContentState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<NavigationMenuContentState>) => StyleValue) |  |
| keepMounted | boolean \| undefined |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, NavigationMenuContentState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Link



| Prop | Type | Description |
| --- | --- | --- |
| closeOnClick | boolean \| undefined |  |
| active | boolean \| undefined |  |
| class | JSX.ClassValue \| ((state: Readonly<NavigationMenuLinkState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<NavigationMenuLinkState>) => StyleValue) |  |
| render | ComponentRenderFn<JSX.AnchorHTMLAttributes<HTMLAnchorElement> & JSX.Properties<HTMLAnchorElement>, NavigationMenuLinkState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Backdrop



| Prop | Type | Description |
| --- | --- | --- |
| class | JSX.ClassValue \| ((state: Readonly<NavigationMenuBackdropState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<NavigationMenuBackdropState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, NavigationMenuBackdropState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Portal



| Prop | Type | Description |
| --- | --- | --- |
| container | PortalContainer |  |
| class | JSX.ClassValue \| ((state: Readonly<NavigationMenuPortalState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<NavigationMenuPortalState>) => StyleValue) |  |
| keepMounted | boolean \| undefined |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, NavigationMenuPortalState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

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
| class | JSX.ClassValue \| ((state: Readonly<NavigationMenuPositionerState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<NavigationMenuPositionerState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, NavigationMenuPositionerState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Popup



| Prop | Type | Description |
| --- | --- | --- |
| class | JSX.ClassValue \| ((state: Readonly<NavigationMenuPopupState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<NavigationMenuPopupState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, NavigationMenuPopupState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Viewport



| Prop | Type | Description |
| --- | --- | --- |
| class | JSX.ClassValue \| ((state: Readonly<NavigationMenuViewportState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<NavigationMenuViewportState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, NavigationMenuViewportState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Arrow



| Prop | Type | Description |
| --- | --- | --- |
| class | JSX.ClassValue \| ((state: Readonly<NavigationMenuArrowState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<NavigationMenuArrowState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, NavigationMenuArrowState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

