# Toggle

A two-state button that can be on or off.



[Interactive example](/solid/components/toggle)

## Anatomy

Import the component and use it as a single part:

```tsx
import { Toggle } from 'baseui-solid2/toggle';
<Toggle />;
```

## API reference

A two-state button that can be on or off. Renders a `<button>` element.

| Prop | Type | Description |
| --- | --- | --- |
| value | Value \| undefined | Unique group value; omitted and empty values receive a generated ID. |
| defaultPressed | boolean \| undefined | Initial uncontrolled pressed state. |
| pressed | boolean \| undefined | Controlled pressed state. |
| onPressedChange | ((pressed: boolean, eventDetails: ToggleChangeEventDetails) => void) \| undefined | Called before a grouped toggle requests a group value change. |
| nativeButton | boolean \| undefined | Whether the render callback returns a native button. |
| disabled | boolean \| undefined | Whether the component should ignore interaction. |
| class | JSX.ClassValue \| ((state: Readonly<ToggleState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ToggleState>) => StyleValue) |  |
| render | ComponentRenderFn<JSX.HTMLAttributes<HTMLElement>, ToggleState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

