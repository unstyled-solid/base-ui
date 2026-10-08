# Direction Provider

Enables RTL behavior for Base UI components.



[Interactive example](/solid/utils/direction-provider)

## Anatomy

Import the component and wrap it around your app:

```tsx
import { DirectionProvider } from 'baseui-solid2/direction-provider';
<DirectionProvider>{/* Your app or a group of components */}</DirectionProvider>;
```

`<DirectionProvider>` enables child Base UI components to adjust behavior based on RTL text direction, but does not affect HTML and CSS. The `dir="rtl"` HTML attribute or `direction: rtl` CSS style must be set additionally by your own application code.

## API reference

### DirectionProvider



| Prop | Type | Description |
| --- | --- | --- |
| direction | TextDirection \| undefined |  |
| children | JSX.Element |  |

### useDirection

Use this utility to read the current text direction. This is useful for wrapping portaled components that may be rendered outside your application root and are unaffected by the `dir` attribute set within.



| Prop | Type | Description |
| --- | --- | --- |




| Prop | Type | Description |
| --- | --- | --- |


