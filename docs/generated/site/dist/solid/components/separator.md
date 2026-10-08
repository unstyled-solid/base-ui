# Separator

A separator element accessible to screen readers.



[Interactive example](/solid/components/separator)

## Anatomy

Import the component and use it as a single part:

```tsx
import { Separator } from 'baseui-solid2/separator';
<Separator />;
```

## API reference

A separator element accessible to screen readers.
Renders a `<div>` element.

| Prop | Type | Description |
| --- | --- | --- |
| orientation | Orientation \| undefined | The orientation of the separator. |
| class | JSX.ClassValue \| ((state: Readonly<SeparatorState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<SeparatorState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, SeparatorState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

