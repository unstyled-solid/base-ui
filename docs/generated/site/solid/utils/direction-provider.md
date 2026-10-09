<a id="direction-provider"></a>

# Direction Provider

Enables RTL behavior for Base UI components.

[Open mounted Solid demo: direction-provider/hero](/solid/utils/direction-provider)

<a id="anatomy"></a>

## Anatomy

Import the component and wrap it around your app:

```tsx
import { DirectionProvider } from '@unstyled-solid/base-ui/direction-provider';
<DirectionProvider>{/* Your app or a group of components */}</DirectionProvider>;
```

`<DirectionProvider>` enables child Base UI components to adjust behavior based on RTL text direction, but does not affect HTML and CSS. The `dir="rtl"` HTML attribute or `direction: rtl` CSS style must be set additionally by your own application code.

<a id="api-reference"></a>

## API reference

<a id="directionprovider"></a>

### DirectionProvider

<a id="api-446972656374696f6e50726f7669646572"></a>

### DirectionProvider

Declaration: `packages/solid/build/types/direction-provider/DirectionProvider.d.ts:9`

#### Declaration

```typescript
(props: DirectionProviderProps) => JSX.Element
```

<a id="api-446972656374696f6e50726f76696465722e2470726f70732e646972656374696f6e"></a>

<a id="DirectionProvider-direction"></a>

<a id="api-446972656374696f6e50726f76696465722e2470726f70732e6368696c6472656e"></a>

<a id="DirectionProvider-children"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| direction | `TextDirection \| undefined` | No | 'ltr' |  |
| children | `JSX.Element` | No | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-446972656374696f6e50726f76696465722e50726f7073"></a>

<a id="directionproviderprops"></a>

### Related exported type: DirectionProvider.Props

Declaration: `packages/solid/build/types/direction-provider/DirectionProvider.d.ts:11`

#### Declaration

```typescript
DirectionProviderProps
```

<a id="api-446972656374696f6e50726f76696465722e50726f70732e646972656374696f6e"></a>

<a id="DirectionProviderProps-direction"></a>

<a id="api-446972656374696f6e50726f76696465722e50726f70732e6368696c6472656e"></a>

<a id="DirectionProviderProps-children"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| direction | `TextDirection \| undefined` | No | Unavailable |  |
| children | `JSX.Element` | No | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-446972656374696f6e50726f76696465722e5374617465"></a>

<a id="directionproviderstate"></a>

### Related exported type: DirectionProvider.State

Declaration: `packages/solid/build/types/direction-provider/DirectionProvider.d.ts:12`

#### Declaration

```typescript
DirectionProviderState
```

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-446972656374696f6e50726f766964657250726f7073"></a>

### Related exported type: DirectionProviderProps

Declaration: `packages/solid/build/types/direction-provider/DirectionProvider.d.ts:3`

#### Declaration

```typescript
DirectionProviderProps
```

<a id="api-446972656374696f6e50726f766964657250726f70732e646972656374696f6e"></a>

<a id="api-446972656374696f6e50726f766964657250726f70732e6368696c6472656e"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| direction | `TextDirection \| undefined` | No | Unavailable |  |
| children | `JSX.Element` | No | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-446972656374696f6e50726f76696465725374617465"></a>

### Related exported type: DirectionProviderState

Declaration: `packages/solid/build/types/direction-provider/DirectionProvider.d.ts:7`

#### Declaration

```typescript
DirectionProviderState
```

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="usedirection"></a>

### useDirection

Use this utility to read the current text direction. This is useful for wrapping portaled components that may be rendered outside your application root and are unaffected by the `dir` attribute set within.

<a id="api-757365446972656374696f6e"></a>

### useDirection

Declaration: `packages/solid/build/types/internals/direction-context/DirectionContext.d.ts:5`

#### Declaration

```typescript
() => Accessor<TextDirection>
```

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

#### Return value

```typescript
Accessor<TextDirection>
```

