# useRender

Utility for enabling a render prop in custom components.



The `useRender` utility (the compatibility alias of createRender) lets you build custom components that provide a `render` prop to override the default rendered element.

## Examples

A `render` prop for a custom Text component lets consumers use it to replace the default rendered `p` element with a different tag or component.

[Interactive example](/solid/utils/use-render)

The `render` prop callback controls how props are spread, and also passes the internal `state` of a component.

[Interactive example](/solid/utils/use-render)

## Merging props

The `mergeProps` function merges two or more sets of Solid props together. It safely merges three types of props:

- Event handlers, so that all are invoked
- `class` strings
- `style` properties

`mergeProps` merges objects from left to right, so that subsequent objects' properties in the arguments overwrite previous ones. Merging props is useful when creating custom components, as well as inside the callback version of the `render` prop for any Base UI component.

```tsx
import { mergeProps } from 'baseui-solid2/merge-props';
import styles from './index.module.css';
function Button() {
  return (
    <Component
      render={(props, state) => (
        <button
          {...mergeProps<'button'>(props, {
            class: styles.Button,
          })}
        />
      )}
    />
  );
}
```

## Merging refs

When building custom components, you often need to control a ref internally while still letting external consumers pass their own—merging refs lets both parties have access to the underlying DOM element. The `ref` option in `useRender` enables this, which holds an array of refs to be merged together.

Solid receives the external `ref` as a normal prop. Pass your internal ref callback to `ref` to merge it with `props.ref`. Allocate ref-dependent effects in component setup; cleanup returned from a ref callback is ignored:

```tsx
import { useRender } from 'baseui-solid2/use-render';
function Text(props: useRender.ComponentProps<'p'>) {
  let internalRef: HTMLElement | null = null;
  const element = useRender({
    defaultTagName: 'p',
    ref: [
      (node) => {
        internalRef = node;
      },
    ],
    props,
    get render() {
      return props.render;
    },
  });
  return element;
}
```

The [examples](#examples) above forward the external `ref` prop directly to the host.

## TypeScript

To type props, there are two interfaces:

- `useRender.ComponentProps` for a component's external (public) props. It types the `render` prop and HTML attributes.
- `useRender.ElementProps` for the element's internal (private) props. It types HTML attributes alone.

```tsx
import type { ComponentProps } from '@solidjs/web';
interface ButtonProps extends useRender.ComponentProps<'button'> {}
function Button(props: ButtonProps) {
  const defaultProps: useRender.ElementProps<'button'> = {
    class: styles.Button,
    type: 'button',
    children: 'Click me',
  };
  const element = useRender({
    defaultTagName: 'button',
    get render() {
      return props.render;
    },
    props: mergeProps<'button'>(defaultProps, props),
  });
  return element;
}
```

## Migrating from Radix UI

The upstream React Radix UI library uses an `asChild` prop, while Base UI uses a `render` prop. Learn more about how composition works in Base UI in the [composition guide](/solid/handbook/composition).

In React Radix UI, the `Slot` component lets you implement an `asChild` prop.

```jsx
import { Slot } from 'radix-ui';

function Button({ asChild, ...props }) {
  const Comp = asChild ? Slot.Root : 'button';
  return <Comp {...props} />;
}

// Usage
<Button asChild>
  <MyButton className="primary">Submit</MyButton>
</Button>;
```

In Base UI, `useRender` lets you implement a `render` prop. The example below is the equivalent implementation to the Radix example above.

```tsx
import { useRender } from 'baseui-solid2/use-render';
function Button(props) {
  return useRender({
    defaultTagName: 'button',
    get render() {
      return props.render;
    },
    props,
  });
}
// Usage
<Button render={(renderProps) => <MyButton {...renderProps} class="primary" />}>
  Submit
</Button>;
```

## Render prop and polymorphism

The `render` prop is primarily designed for composing event handlers and behavioral props. In most cases it should render the same tag as the default element.

Using `render` for polymorphism (rendering a different tag) requires more care, as some default props may not be valid on the new element. For example, `type="button"` is only valid on a `<button>`. Since the component can't know what element `render` will produce at render time and before hydration, props like these need an explicit signal. This is why Base UI's [Button](/solid/components/button) provides a `nativeButton` prop to control which defaults are applied.

## API reference

```tsx
const element = useRender({
  // Input parameters
});
```



| Prop | Type | Description |
| --- | --- | --- |
| defaultTagName | keyof JSX.IntrinsicElements \| undefined |  |
| enabled | Enabled \| undefined |  |
| propGetter | ((props: Props) => Props) \| undefined |  |
| props | Props \| readonly (Props \| ((previous: Props) => Props) \| undefined)[] \| undefined |  |
| ref | InputRef<E> \| readonly InputRef<E>[] |  |
| state | State \| undefined |  |
| stateAttributesMapping | StateAttributesMapping<State> \| undefined |  |
| class | JSX.ClassValue \| ((state: State) => JSX.ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: State) => StyleValue) |  |
| render | ComponentRenderFn<Props, State> \| undefined |  |

