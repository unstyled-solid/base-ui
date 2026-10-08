# Toolbar

A container for grouping a set of buttons and controls.



[Interactive example](/solid/components/toolbar)

## Usage guidelines

To ensure that toolbars are accessible and helpful, follow these guidelines:

- **Use inputs sparingly**: Left and right arrow keys are used to both move the text insertion cursor in an input, and to navigate among controls in horizontal toolbars. When using an input in a horizontal toolbar, use only one and place it as the last element of the toolbar.

## Anatomy

Import the component and assemble its parts:

```tsx
import { Toolbar } from 'baseui-solid2/toolbar';
<Toolbar.Root>
  <Toolbar.Button />
  <Toolbar.Link />
  <Toolbar.Separator />
  <Toolbar.Group>
    <Toolbar.Button />
    <Toolbar.Button />
  </Toolbar.Group>
  <Toolbar.Input />
</Toolbar.Root>;
```

## Examples

### Using with Menu

All Base UI popup components that provide a `Trigger` component can be integrated with a toolbar by passing the trigger to `<Toolbar.Button>` with the `render` prop:

```tsx
return (
  <Toolbar.Root>
    <Menu.Root>
      <Toolbar.Button render={(renderProps) => <Menu.Trigger {...renderProps} />} />
      <Menu.Portal>{/* Compose the rest of the menu */}</Menu.Portal>
    </Menu.Root>
  </Toolbar.Root>
);
```

This applies to `<AlertDialog>`, `<Dialog>`, `<Menu>`, `<Popover>`, and `<Select>`.

### Using with Tooltip

Unlike other popups, the toolbar item should be passed to the `render` prop of `<Tooltip.Trigger>`:

```tsx
return (
  <Toolbar.Root>
    <Tooltip.Root>
      <Tooltip.Trigger
        render={(renderProps) => <Toolbar.Button {...renderProps} />}
      />
      <Tooltip.Portal>{/* Compose the rest of the tooltip */}</Tooltip.Portal>
    </Tooltip.Root>
  </Toolbar.Root>
);
```

### Using with NumberField

To use a NumberField in the toolbar, pass `<NumberField.Input>` to `<Toolbar.Input>` using the `render` prop:

```tsx
return (
  <Toolbar.Root>
    <NumberField.Root>
      <NumberField.Group>
        <NumberField.Decrement />

        <Toolbar.Input
          render={(renderProps) => <NumberField.Input {...renderProps} />}
        />
        <NumberField.Increment />
      </NumberField.Group>
    </NumberField.Root>
  </Toolbar.Root>
);
```

## API reference

### Root

Groups controls into one ordered, roving-focus toolbar.

| Prop | Type | Description |
| --- | --- | --- |
| loopFocus | boolean \| undefined | Wrap keyboard focus at the ends. |
| disabled | boolean \| undefined |  |
| orientation | Orientation \| undefined |  |
| class | JSX.ClassValue \| ((state: Readonly<ToolbarRootState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ToolbarRootState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ToolbarRootState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Button

A toolbar button, also composable with another control's render callback.

| Prop | Type | Description |
| --- | --- | --- |
| focusableWhenDisabled | boolean \| undefined | Keep disabled buttons in roving focus. |
| nativeButton | boolean \| undefined | Whether the rendered element is a native button. |
| disabled | boolean \| undefined |  |
| class | JSX.ClassValue \| ((state: Readonly<ToolbarButtonState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ToolbarButtonState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ToolbarButtonState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Link

Links remain enabled even inside disabled toolbars and groups.

| Prop | Type | Description |
| --- | --- | --- |
| class | JSX.ClassValue \| ((state: Readonly<ToolbarLinkState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ToolbarLinkState>) => StyleValue) |  |
| render | ComponentRenderFn<JSX.AnchorHTMLAttributes<HTMLAnchorElement> & JSX.Properties<HTMLAnchorElement>, ToolbarLinkState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Input

Native editing semantics are retained by the shared composite navigation engine.

| Prop | Type | Description |
| --- | --- | --- |
| defaultValue | string \| number \| string[] \| undefined |  |
| focusableWhenDisabled | boolean \| undefined | Keep disabled inputs in roving focus. |
| disabled | boolean \| undefined |  |
| class | JSX.ClassValue \| ((state: Readonly<ToolbarInputState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ToolbarInputState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ToolbarInputState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Group

Groups toolbar controls; the nearest group supplies their disabled state.

| Prop | Type | Description |
| --- | --- | --- |
| disabled | boolean \| undefined | Disable the controls in this group. |
| class | JSX.ClassValue \| ((state: Readonly<ToolbarGroupState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ToolbarGroupState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ToolbarGroupState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Separator

A separator perpendicular to its toolbar unless explicitly overridden.

| Prop | Type | Description |
| --- | --- | --- |
| orientation | Orientation \| undefined | The orientation of the separator. |
| class | JSX.ClassValue \| ((state: Readonly<SeparatorState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<SeparatorState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, SeparatorState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

