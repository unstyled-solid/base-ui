# Menubar

A menu bar providing commands and options for your application.



[Interactive example](/solid/components/menubar)

## Anatomy

Import the component and assemble its parts:

```tsx
import { Menubar } from 'baseui-solid2/menubar';
import { Menu } from 'baseui-solid2/menu';
<Menubar>
  <Menu.Root>
    <Menu.Trigger />
    <Menu.Portal>
      <Menu.Backdrop />
      <Menu.Positioner>
        <Menu.Popup>
          <Menu.Arrow />
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
            <Menu.RadioItem>
              <Menu.RadioItemIndicator />
            </Menu.RadioItem>
          </Menu.RadioGroup>

          <Menu.CheckboxItem>
            <Menu.CheckboxItemIndicator />
          </Menu.CheckboxItem>

          <Menu.Viewport />
        </Menu.Popup>
      </Menu.Positioner>
    </Menu.Portal>
  </Menu.Root>
</Menubar>;
```

## API reference

The container for menus. Roving focus is owned by the shared composite.

| Prop | Type | Description |
| --- | --- | --- |
| loopFocus | boolean \| undefined | Wrap arrow-key focus at either end. |
| modal | boolean \| undefined | Whether menus are modal. |
| disabled | boolean \| undefined | Whether all menus are disabled. |
| orientation | "horizontal" \| "vertical" \| undefined | The menubar's orientation. |
| class | JSX.ClassValue \| ((state: Readonly<MenubarState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<MenubarState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLDivElement>>, MenubarState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

