<a id="userender"></a>

# useRender

Utility for enabling a render prop in custom components.

The `useRender` utility (the compatibility alias of createRender) lets you build custom components that provide a `render` prop to override the default rendered element.

<a id="examples"></a>

## Examples

A `render` prop for a custom Text component lets consumers use it to replace the default rendered `p` element with a different tag or component.

[Open mounted Solid demo: use-render/render](/solid/utils/use-render)

The `render` prop callback controls how props are spread, and also passes the internal `state` of a component.

[Open mounted Solid demo: use-render/render-callback](/solid/utils/use-render)

<a id="merging-props"></a>

## Merging props

The `mergeProps` function merges two or more sets of Solid props together. It safely merges three types of props:

1. Event handlers, so that all are invoked
2. `class` strings
3. `style` properties

`mergeProps` merges objects from left to right, so that subsequent objects' properties in the arguments overwrite previous ones. Merging props is useful when creating custom components, as well as inside the callback version of the `render` prop for any Base UI component.

```tsx
import { mergeProps } from '@unstyled-solid/base-ui/merge-props';
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

<a id="merging-refs"></a>

## Merging refs

When building custom components, you often need to control a ref internally while still letting external consumers pass their own—merging refs lets both parties have access to the underlying DOM element. The `ref` option in `useRender` enables this, which holds an array of refs to be merged together.

Solid receives the external `ref` as a normal prop. Pass your internal ref callback to `ref` to merge it with `props.ref`. Allocate ref-dependent effects in component setup; cleanup returned from a ref callback is ignored:

```tsx
import type { ComponentProps } from '@solidjs/web';
import { useRender } from '@unstyled-solid/base-ui/use-render';
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

<a id="typescript"></a>

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

<a id="migrating-from-radix-ui"></a>

## Migrating from Radix UI

The upstream React Radix UI library uses an `asChild` prop, while Base UI uses a `render` prop. Learn more about how composition works in Base UI in the [composition guide](/solid/handbook/composition).

In Solid Base UI, `useRender` implements a live `render` callback. Forward its props and ref to the host element, as shown below; it does not clone a child element like upstream React Radix `asChild`.

```tsx
import { useRender } from '@unstyled-solid/base-ui/use-render';
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

<a id="render-prop-and-polymorphism"></a>

## Render prop and polymorphism

The `render` prop is primarily designed for composing event handlers and behavioral props. In most cases it should render the same tag as the default element.

Using `render` for polymorphism (rendering a different tag) requires more care, as some default props may not be valid on the new element. For example, `type="button"` is only valid on a `<button>`. Since the component can't know what element `render` will produce at render time and before hydration, props like these need an explicit signal. This is why Base UI's [Button](/solid/components/button) provides a `nativeButton` prop to control which defaults are applied.

<a id="api-reference"></a>

## API reference

```tsx
const element = useRender({
  // Input parameters
});
```

<a id="api-75736552656e646572"></a>

### useRender

Declaration: `packages/solid/build/types/use-render/useRender.d.ts:15`

#### Declaration

```typescript
<State extends object = {}, E extends Element = HTMLElement, Enabled extends boolean | undefined = undefined>(params: UseRenderParameters<State, E, Enabled>) => JSX.Element
```

<a id="api-75736552656e6465722e2470726f70732e64656661756c745461674e616d65"></a>

<a id="useRender-defaultTagName"></a>

<a id="api-75736552656e6465722e2470726f70732e656e61626c6564"></a>

<a id="useRender-enabled"></a>

<a id="api-75736552656e6465722e2470726f70732e70726f70476574746572"></a>

<a id="useRender-propGetter"></a>

<a id="api-75736552656e6465722e2470726f70732e70726f7073"></a>

<a id="useRender-props"></a>

<a id="api-75736552656e6465722e2470726f70732e726566"></a>

<a id="useRender-ref"></a>

<a id="api-75736552656e6465722e2470726f70732e7374617465"></a>

<a id="useRender-state"></a>

<a id="api-75736552656e6465722e2470726f70732e7374617465417474726962757465734d617070696e67"></a>

<a id="useRender-stateAttributesMapping"></a>

<a id="api-75736552656e6465722e2470726f70732e636c617373"></a>

<a id="useRender-class"></a>

<a id="api-75736552656e6465722e2470726f70732e7374796c65"></a>

<a id="useRender-style"></a>

<a id="api-75736552656e6465722e2470726f70732e72656e646572"></a>

<a id="useRender-render"></a>

#### Parameters

| Parameter | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| defaultTagName | `keyof JSX.IntrinsicElements \| undefined` | No | 'div' | Host tag used when no render callback is supplied. |
| enabled | `Enabled \| undefined` | No | Unavailable | Whether to render the host. When false, no host is rendered. |
| propGetter | `((props: Props) => Props) \| undefined` | No | Unavailable | Transforms the merged host props before rendering. |
| props | `Props \| readonly (Props \| ((previous: Props) => Props) \| undefined)[] \| undefined` | No | Unavailable | Props merged in order onto the host. A function in the array receives the preceding merged props. |
| ref | `InputRef<E> \| readonly InputRef<E>[]` | No | Unavailable | Host attachment refs, merged with the renderer’s own ref. Accepts a native input ref or an array of input refs, as declared. |
| state | `State \| undefined` | No | Unavailable | Live component state supplied to the render, class and style callbacks and to state-attribute mapping. |
| stateAttributesMapping | `StateAttributesMapping<State> \| undefined` | No | Unavailable | Custom mappings from state values to host attributes. A null mapping excludes that state property; a callback returning null emits no attributes for that value. |
| class | `JSX.ClassValue \| ((state: State) => JSX.ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: State) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<Props, State> \| undefined` | No | Unavailable | Customize the rendered element with a Solid callback: (props, state) => JSX. Spread the supplied live props onto the host, including its merged ref callback. This is not a pre-created JSX element to clone. |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

#### Return value

```typescript
JSX.Element
```

<a id="api-55736552656e64657252657475726e56616c7565"></a>

<a id="userenderreturnvalue"></a>

### Related exported type: UseRenderReturnValue

Declaration: `packages/solid/build/types/use-render/useRender.d.ts:12`

#### Declaration

```typescript
JSX.Element
```

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-75736552656e6465722e5374617465"></a>

<a id="userenderstate"></a>

### Related exported type: useRender.State

Declaration: `packages/solid/build/types/use-render/useRender.d.ts:17`

#### Declaration

```typescript
UseRenderState
```

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-75736552656e6465722e436f6d706f6e656e7450726f7073"></a>

<a id="userendercomponentprops"></a>

### Related exported type: useRender.ComponentProps

Declaration: `packages/solid/build/types/use-render/useRender.d.ts:20`

#### Declaration

```typescript
ComponentProps<E, S, P>
```

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-75736552656e6465722e456c656d656e7450726f7073"></a>

<a id="userenderelementprops"></a>

### Related exported type: useRender.ElementProps

Declaration: `packages/solid/build/types/use-render/useRender.d.ts:19`

#### Declaration

```typescript
ElementProps<E>
```

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-75736552656e6465722e506172616d6574657273"></a>

<a id="userenderparameters"></a>

### Related exported type: useRender.Parameters

Declaration: `packages/solid/build/types/use-render/useRender.d.ts:21`

#### Declaration

```typescript
Parameters<S, E, Enabled>
```

<a id="api-75736552656e6465722e506172616d65746572732e64656661756c745461674e616d65"></a>

<a id="useRenderParameters-defaultTagName"></a>

<a id="api-75736552656e6465722e506172616d65746572732e656e61626c6564"></a>

<a id="useRenderParameters-enabled"></a>

<a id="api-75736552656e6465722e506172616d65746572732e70726f70476574746572"></a>

<a id="useRenderParameters-propGetter"></a>

<a id="api-75736552656e6465722e506172616d65746572732e70726f7073"></a>

<a id="useRenderParameters-props"></a>

<a id="api-75736552656e6465722e506172616d65746572732e726566"></a>

<a id="useRenderParameters-ref"></a>

<a id="api-75736552656e6465722e506172616d65746572732e7374617465"></a>

<a id="useRenderParameters-state"></a>

<a id="api-75736552656e6465722e506172616d65746572732e7374617465417474726962757465734d617070696e67"></a>

<a id="useRenderParameters-stateAttributesMapping"></a>

<a id="api-75736552656e6465722e506172616d65746572732e636c617373"></a>

<a id="useRenderParameters-class"></a>

<a id="api-75736552656e6465722e506172616d65746572732e7374796c65"></a>

<a id="useRenderParameters-style"></a>

<a id="api-75736552656e6465722e506172616d65746572732e72656e646572"></a>

<a id="useRenderParameters-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| defaultTagName | `keyof JSX.IntrinsicElements \| undefined` | No | Unavailable | Host tag used when no render callback is supplied. |
| enabled | `Enabled \| undefined` | No | Unavailable | Whether to render the host. When false, no host is rendered. |
| propGetter | `((props: Props) => Props) \| undefined` | No | Unavailable | Transforms the merged host props before rendering. |
| props | `Props \| readonly (Props \| ((previous: Props) => Props) \| undefined)[] \| undefined` | No | Unavailable | Props merged in order onto the host. A function in the array receives the preceding merged props. |
| ref | `InputRef<E> \| readonly InputRef<E>[]` | No | Unavailable | Host attachment refs, merged with the renderer’s own ref. Accepts a native input ref or an array of input refs, as declared. |
| state | `S \| undefined` | No | Unavailable | Live component state supplied to the render, class and style callbacks and to state-attribute mapping. |
| stateAttributesMapping | `StateAttributesMapping<S> \| undefined` | No | Unavailable | Custom mappings from state values to host attributes. A null mapping excludes that state property; a callback returning null emits no attributes for that value. |
| class | `JSX.ClassValue \| ((state: S) => JSX.ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: S) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<Props, S> \| undefined` | No | Unavailable | Customize the rendered element with a Solid callback: (props, state) => JSX. Spread the supplied live props onto the host, including its merged ref callback. This is not a pre-created JSX element to clone. |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-75736552656e6465722e52657475726e56616c7565"></a>

### Related exported type: useRender.ReturnValue

Declaration: `packages/solid/build/types/use-render/useRender.d.ts:22`

#### Declaration

```typescript
JSX.Element
```

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

