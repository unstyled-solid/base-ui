# Toggle Group

Provides a shared state to a series of toggle buttons.



[Interactive example](/solid/components/toggle-group)

## Anatomy

Import the component and use it as a single part:

```tsx
import { ToggleGroup } from 'baseui-solid2/toggle-group';
<ToggleGroup />;
```

## Examples

### Multiple

Add the `multiple` prop to allow pressing more than one toggle at a time.

[Interactive example](/solid/components/toggle-group)

## API reference

Provides shared selection and keyboard navigation to toggle buttons.

| Prop | Type | Description |
| --- | --- | --- |
| defaultValue | readonly Value[] \| undefined |  |
| value | readonly Value[] \| undefined |  |
| onValueChange | ((value: Value[], details: ToggleGroupChangeEventDetails) => void) \| undefined |  |
| loopFocus | boolean \| undefined |  |
| multiple | boolean \| undefined |  |
| disabled | boolean \| undefined |  |
| orientation | Orientation \| undefined |  |
| class | JSX.ClassValue \| ((state: Readonly<ToggleGroupState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ToggleGroupState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ToggleGroupState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

