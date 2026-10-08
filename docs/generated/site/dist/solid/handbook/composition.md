# Composition

A guide to composing Base UI components with your own Solid components.



## Composing custom Solid components

Use the `render` prop to compose a Base UI part with your own Solid components.

For example, most triggers render a `<button>` by default.
The code snippet below shows how to use a custom button instead.

```tsx
<Menu.Trigger render={(renderProps) => <MyButton {...renderProps} size="md" />}>
  Open menu
</Menu.Trigger>;
```

The custom component must forward the `ref`, and spread all the received props on its underlying DOM node.

## Composing multiple components

In situations where you need to compose multiple Base UI components with custom Solid components, `render` props can be nested as deeply as necessary.
Working with Tooltip is a common example.

```tsx
<Dialog.Root>
  <Tooltip.Root>
    <Tooltip.Trigger
      render={(renderProps) => (
        <Dialog.Trigger
          {...renderProps}
          render={(renderProps) => (
            <Menu.Trigger
              {...renderProps}
              render={(renderProps) => <MyButton {...renderProps} size="md" />}
            >
              Open menu
            </Menu.Trigger>
          )}
        />
      )}
    />
    <Tooltip.Portal>...</Tooltip.Portal>
  </Tooltip.Root>
  <Dialog.Portal>...</Dialog.Portal>
</Dialog.Root>;
```

## Changing the default rendered element

You can also use the `render` prop to override the rendered element of the component.

For example, `<Menu.Item>` renders a `<div>` by default.
The code snippet below shows how to render it as an `<a>` element so that it works like a link.

```tsx
import { Menu } from 'baseui-solid2/menu';
export default () => (
  <Menu.Root>
    <Menu.Trigger>Song</Menu.Trigger>
    <Menu.Portal>
      <Menu.Positioner>
        <Menu.Popup>
          <Menu.Item
            render={(renderProps) => <a {...renderProps} href="base-ui.com" />}
          >
            Add to Library
          </Menu.Item>
        </Menu.Popup>
      </Menu.Positioner>
    </Menu.Portal>
  </Menu.Root>
);
```

Each Base UI component renders the most appropriate element by default, and in most cases, rendering a different element is recommended only on a case-by-case basis.

## Render function

Pass a function to the `render` prop. Its props and state are live objects; read their properties inside JSX.

```tsx
<Switch.Thumb
  render={(props, state) => (
    <span {...props}>{state.checked ? <CheckedIcon /> : <UncheckedIcon />}</span>
  )}
/>;
```

Using a function gives you complete control over spreading props and also allows you to render different content based on the component's state.

