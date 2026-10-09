<a id="mergeprops"></a>

# mergeProps

A utility to merge multiple sets of Solid props.

`mergeProps` helps you combine multiple prop objects (for example, internal props + user props) into a single set of props you can spread onto an element.
It behaves like `Object.assign` (rightmost wins) with a few special cases, while preserving live prop reads.

<a id="how-merging-works"></a>

## How merging works

- For most keys (everything except `class`, `style`, and event handlers), the value from the rightmost object wins:
  
  ```ts
  mergeProps({ id: 'a', dir: 'ltr' }, { id: 'b' });
  ```
- `ref` is not merged. Only the rightmost ref is kept:
  
  ```ts
  mergeProps({ ref: refA }, { ref: refB });
  ```
- `class` values are concatenated right-to-left (rightmost first):
  
  ```ts
  mergeProps({ class: 'a' }, { class: 'b' });
  ```
- `style` objects are merged, with keys from the rightmost style overwriting earlier ones.
- Event handlers are merged and executed right-to-left (rightmost first):
  
  ```ts
  mergeProps({ onClick: a }, { onClick: b });
  ```
  
  - For native DOM events, Base UI adds `event.preventBaseUIHandler()`. Calling it prevents Base UI's internal logic from running.
    This does not call `preventDefault()` or `stopPropagation()`.
  - For callbacks with primitive or plain-object arguments, this mechanism isn't available and all handlers always execute.

<a id="preventing-base-uis-default-behavior"></a>

### Preventing Base UI's default behavior

When using the `render` prop, props are not merged automatically.
You can use `mergeProps` to combine Base UI's props with your own, and call `preventBaseUIHandler()` to stop Base UI's internal logic from running:

[Open mounted Solid demo: merge-props/prevent-base-ui-handler](/solid/utils/merge-props)

<a id="passing-a-function-instead-of-an-object"></a>

## Passing a function instead of an object

Each argument can be a props object or a function that receives the merged props up to that point (left to right) and returns a props object.
This is useful when you need to compute the next props from whatever has already been merged.

Note that the function's return value completely replaces the accumulated props up to that point.
If you want to chain event handlers from the previous props, you must call them manually:

```tsx
const merged = mergeProps(
  {
    onClick(event) {
      // Handler from previous props
    },
  },
  (props) => ({
    onClick(event) {
      // Manually call the previous handler
      props.onClick?.(event);
      // Your logic here
    },
  }),
);
```

<a id="api-reference"></a>

## API reference

<a id="mergeprops-1"></a>

### mergeProps

This function accepts up to 5 arguments, each being either a props object or a function that returns a props object.
If you need to merge more than 5 sets of props, use `mergePropsN` instead.

<a id="api-6d6572676550726f7073"></a>

### mergeProps

Declaration: `packages/solid/build/types/merge-props/mergeProps.d.ts:15`

#### Declaration

```typescript
<T extends ElementType = "div">(...inputs: InputProps<T>[]) => ComponentProps<T>
```

<a id="api-6d6572676550726f70732e24706172616d65746572732e696e70757473"></a>

<a id="mergeProps-inputs"></a>

#### Parameters

| Parameter | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| inputs | `InputProps<T>[]` | No | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

#### Return value

```typescript
ComponentProps<T>
```

<a id="mergepropsn"></a>

### mergePropsN

This function accepts an array of props objects or functions that return props objects.
It is slightly less efficient than `mergeProps`, so only use it when you need to merge more than 5 sets of props.

<a id="api-6d6572676550726f70734e"></a>

### mergePropsN

Declaration: `packages/solid/build/types/merge-props/mergeProps.d.ts:16`

#### Declaration

```typescript
<T extends ElementType = "div">(inputs: readonly InputProps<T>[]) => ComponentProps<T>
```

<a id="api-6d6572676550726f70734e2e24706172616d65746572732e696e70757473"></a>

<a id="mergePropsN-inputs"></a>

#### Parameters

| Parameter | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| inputs | `readonly InputProps<T>[]` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

#### Return value

```typescript
ComponentProps<T>
```

