# Meter

A graphical display of a numeric value within a range.



[Interactive example](/solid/components/meter)

## Anatomy

Import the component and assemble its parts:

```tsx
import { Meter } from 'baseui-solid2/meter';
<Meter.Root>
  <Meter.Label />
  <Meter.Track>
    <Meter.Indicator />
  </Meter.Track>
  <Meter.Value />
</Meter.Root>;
```

## API reference

### Root

Groups the meter parts and exposes the measurement to assistive technology.

| Prop | Type | Description |
| --- | --- | --- |
| value | number |  |
| getAriaValueText | ((formattedValue: string, value: number) => string) \| undefined |  |
| locale | Intl.LocalesArgument |  |
| min | number \| undefined |  |
| max | number \| undefined |  |
| format | Intl.NumberFormatOptions \| undefined |  |
| class | JSX.ClassValue \| ((state: Readonly<MeterRootState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<MeterRootState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, MeterRootState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Track

Contains the indicator and represents the entire measurement range.

| Prop | Type | Description |
| --- | --- | --- |
| class | JSX.ClassValue \| ((state: Readonly<MeterTrackState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<MeterTrackState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, MeterTrackState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Indicator

Visualizes the position of the value along the range. Renders a div.

| Prop | Type | Description |
| --- | --- | --- |
| class | JSX.ClassValue \| ((state: Readonly<MeterIndicatorState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<MeterIndicatorState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, MeterIndicatorState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Value

Displays the formatted measurement. Renders a span.

| Prop | Type | Description |
| --- | --- | --- |
| children | ((formattedValue: string, value: number) => JSX.Element) \| null \| undefined |  |
| class | JSX.ClassValue \| ((state: Readonly<MeterValueState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<MeterValueState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, MeterValueState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Label

An accessible label for the meter. Renders a span.

| Prop | Type | Description |
| --- | --- | --- |
| class | JSX.ClassValue \| ((state: Readonly<MeterLabelState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<MeterLabelState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, MeterLabelState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

