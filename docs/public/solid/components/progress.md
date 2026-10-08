# Progress

Displays the status of a task that takes a long time.



[Interactive example](/solid/components/progress)

## Anatomy

Import the component and assemble its parts:

```tsx
import { Progress } from 'baseui-solid2/progress';
<Progress.Root>
  <Progress.Label />
  <Progress.Track>
    <Progress.Indicator />
  </Progress.Track>
  <Progress.Value />
</Progress.Root>;
```

## API reference

### Root

Groups the progress parts and exposes task completion to assistive technology.

| Prop | Type | Description |
| --- | --- | --- |
| value | number \| null | Null and non-finite values are indeterminate. |
| getAriaValueText | ((formattedValue: string, value: number \| null) => string) \| undefined |  |
| locale | Intl.LocalesArgument |  |
| min | number \| undefined |  |
| max | number \| undefined |  |
| format | Intl.NumberFormatOptions \| undefined |  |
| class | JSX.ClassValue \| ((state: Readonly<ProgressRootState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ProgressRootState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ProgressRootState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Track

Contains the progress indicator. Renders a div.

| Prop | Type | Description |
| --- | --- | --- |
| class | JSX.ClassValue \| ((state: Readonly<ProgressTrackState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ProgressTrackState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ProgressTrackState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Indicator

Visualizes task completion. Renders a div.

| Prop | Type | Description |
| --- | --- | --- |
| class | JSX.ClassValue \| ((state: Readonly<ProgressIndicatorState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ProgressIndicatorState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ProgressIndicatorState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Value

Displays the current formatted value. Renders a span.

| Prop | Type | Description |
| --- | --- | --- |
| children | ((formattedValue: string \| null, value: number \| null) => JSX.Element) \| null \| undefined |  |
| class | JSX.ClassValue \| ((state: Readonly<ProgressValueState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ProgressValueState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ProgressValueState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Label

An accessible label for the progress bar. Renders a span.

| Prop | Type | Description |
| --- | --- | --- |
| class | JSX.ClassValue \| ((state: Readonly<ProgressLabelState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ProgressLabelState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, ProgressLabelState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

