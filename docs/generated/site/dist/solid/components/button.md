# Button

A button component that can be rendered as another tag or focusable when disabled.



[Interactive example](/solid/components/button)

## Usage guidelines

- **Submit buttons**: Unlike the native button element, `type="submit"` must be specified on Button for it to act as a submit button.
- **Links**: The Button component enforces button semantics (`role="button"`, keyboard interaction, disabled state). It should not be used for links. See [Rendering links as buttons](#rendering-links-as-buttons) below.

## Anatomy

Import the component:

```tsx
import { Button } from 'baseui-solid2/button';
<Button />;
```

## Examples

### Rendering as another tag

The button can remain keyboard accessible while being rendered as another tag, such as a `<div>`, by specifying `nativeButton={false}`.

```tsx
import { Button } from 'baseui-solid2/button';
<Button render={(renderProps) => <div {...renderProps} />} nativeButton={false}>
  Button that can contain complex children
</Button>;
```

### Rendering links as buttons

The Button component enforces button semantics. `nativeButton={false}` signals that the rendered tag is not a `<button>`, but it must still be a tag that can receive button semantics (`role="button"`, keyboard interaction handlers). Links (`<a>`) have their own semantics and should not be rendered as buttons through the `render` prop.

If a link needs to look like a button visually, style the `<a>` element directly with CSS rather than using the Button component.

### Loading states

For buttons that enter a loading state after activation, specify `focusableWhenDisabled` so focus remains on the button while it is disabled. Because some browser and screen reader combinations do not reliably announce changes to a focused button's descendant text, use [`aria-labelledby`](https://www.w3.org/TR/accname-1.2/#computation-steps) to make the changing text the button's explicit accessible name.

[Interactive example](/solid/components/button)

## API reference

A button that triggers actions. Renders a native `<button>` by default.

| Prop | Type | Description |
| --- | --- | --- |
| focusableWhenDisabled | boolean \| undefined | Whether the button remains focusable when disabled. |
| nativeButton | boolean \| undefined |  |
| ref | JSX.Ref<HTMLElement> | The rendered host, including non-native hosts supplied through `render`. |
| disabled | boolean \| undefined | Whether the button should ignore user interaction. |
| class | JSX.ClassValue \| ((state: Readonly<ButtonState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ButtonState>) => StyleValue) |  |
| render | ComponentRenderFn<Omit<JSX.HTMLAttributes<HTMLElement>, "ref"> & { ref?: (element: HTMLElement) => void; }, ButtonState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

