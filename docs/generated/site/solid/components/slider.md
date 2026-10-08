# Slider

An easily stylable range input.



[Interactive example](/solid/components/slider)

## Usage guidelines

- **Form controls must have an accessible name**: Prefer `<Slider.Label>`, or provide an `aria-label` on each `<Slider.Thumb>` when no visible label is rendered. See [Labeling a slider](#labeling-a-slider) and the [forms guide](/solid/handbook/forms).

## Anatomy

Import the component and assemble its parts:

```tsx
import { Slider } from 'baseui-solid2/slider';
<Slider.Root>
  <Slider.Label />
  <Slider.Value />
  <Slider.Control>
    <Slider.Track>
      <Slider.Indicator />
      <Slider.Thumb />
    </Slider.Track>
  </Slider.Control>
</Slider.Root>;
```

## Examples

### Labeling a slider

A single-thumb slider without a visible label (such as a volume control) can be labeled using `aria-label` on `<Slider.Thumb>`:

```tsx
<Slider.Root>
  <Slider.Control>
    <Slider.Track>
      <Slider.Indicator />

      <Slider.Thumb aria-label="Volume" />
    </Slider.Track>
  </Slider.Control>
</Slider.Root>;
```

A visible label can be created using `<Slider.Label>`:

```tsx
<Slider.Root>
  <Slider.Label>Volume</Slider.Label>
  <Slider.Control>
    <Slider.Track>
      <Slider.Indicator />
      <Slider.Thumb />
    </Slider.Track>
  </Slider.Control>
</Slider.Root>;
```

For a multi-thumb range slider with a visible label, add `aria-label` on each `<Slider.Thumb>` to distinguish them:

```tsx
<Slider.Root defaultValue={[25, 75]}>
  <Slider.Label>Price range</Slider.Label>
  <Slider.Control>
    <Slider.Track>
      <Slider.Indicator />

      <Slider.Thumb index={0} aria-label="Minimum price" />
      <Slider.Thumb index={1} aria-label="Maximum price" />
    </Slider.Track>
  </Slider.Control>
</Slider.Root>;
```

### Range slider

To create a range slider:

- Pass an array of values and place a `<Slider.Thumb>` for each value in the array
- Additionally for server-side rendering, specify a numeric `index` for each thumb that corresponds to the index of its value in the value array

Thumbs can be configured to behave differently when they collide during pointer interactions using the `thumbCollisionBehavior` prop on `<Slider.Root>`.

[Interactive example](/solid/components/slider)

### Steps

Use the `step` prop to snap the value to multiples of a given increment, and `largeStep` to control the increment when using Page Up/Page Down or Shift + Arrow Up/Arrow Down.

[Interactive example](/solid/components/slider)

### Marks

Render your own tick marks, positioning each mark along the track as a percentage of the value range.

[Interactive example](/solid/components/slider)

Marks are independent of the value's granularity—pair them with the [`step`](#steps) prop to snap the thumb to each mark.

### Thumb alignment

Set `thumbAlignment="edge"` to inset the thumb such that its edge aligns with the edge of the control when the value is at `min` or `max`, without overflowing the control like the default `"center"` alignment.

A client-only alternative `thumbAlignment="edge-client-only"` can be used to reduce bundle size but only renders after hydration.

[Interactive example](/solid/components/slider)

### Vertical

Set `orientation="vertical"` on `<Slider.Root>` to build a vertical slider.

[Interactive example](/solid/components/slider)

### Form integration

To use a slider in a form, pass the slider `name` to `<Slider.Root>`:

```tsx
<Form>
  <Slider.Root name="volume">
    <Slider.Label>Volume</Slider.Label>
    <Slider.Control>
      <Slider.Track>
        <Slider.Indicator />
        <Slider.Thumb />
      </Slider.Track>
    </Slider.Control>
  </Slider.Root>
</Form>;
```

For grouped multi-thumb range sliders in forms, [Fieldset](/solid/components/fieldset) can provide the shared visible label while each thumb keeps its own `aria-label`:

```tsx
<Field.Root>
  <Fieldset.Root
    render={(renderProps) => (
      <Slider.Root {...renderProps} defaultValue={[25, 75]} />
    )}
  >
    <Fieldset.Legend>Price range</Fieldset.Legend>

    <Slider.Control>
      <Slider.Track>
        <Slider.Indicator />

        <Slider.Thumb index={0} aria-label="Minimum price" />
        <Slider.Thumb index={1} aria-label="Maximum price" />
      </Slider.Track>
    </Slider.Control>
  </Fieldset.Root>
</Field.Root>;
```

## API reference

### Root

Groups the slider parts. Values are normalized without mutating consumer arrays.

| Prop | Type | Description |
| --- | --- | --- |
| name | string \| undefined |  |
| defaultValue | Value \| undefined |  |
| value | Value \| undefined |  |
| onValueChange | ((value: Value extends number ? number : Value, details: SliderRootChangeEventDetails) => void) \| undefined |  |
| onValueCommitted | ((value: Value extends number ? number : Value, details: SliderRootCommitEventDetails) => void) \| undefined |  |
| form | string \| undefined |  |
| locale | Intl.LocalesArgument |  |
| thumbAlignment | "center" \| "edge" \| "edge-client-only" \| undefined |  |
| thumbCollisionBehavior | "push" \| "none" \| "swap" \| undefined |  |
| step | number \| undefined |  |
| largeStep | number \| undefined |  |
| minStepsBetweenValues | number \| undefined |  |
| min | number \| undefined |  |
| max | number \| undefined |  |
| format | Intl.NumberFormatOptions \| undefined |  |
| disabled | boolean \| undefined |  |
| orientation | "horizontal" \| "vertical" \| undefined |  |
| class | JSX.ClassValue \| ((state: Readonly<SliderRootState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<SliderRootState>) => StyleValue) |  |
| render | ComponentRenderFn<JSX.HTMLAttributes<HTMLElement>, SliderRootState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Label



| Prop | Type | Description |
| --- | --- | --- |
| class | JSX.ClassValue \| ((state: Readonly<SliderRootState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<SliderRootState>) => StyleValue) |  |
| render | ComponentRenderFn<JSX.HTMLAttributes<HTMLElement>, SliderRootState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Value



| Prop | Type | Description |
| --- | --- | --- |
| children | ((formattedValues: readonly string[], values: readonly number[]) => JSX.Element) \| null \| undefined |  |
| class | JSX.ClassValue \| ((state: Readonly<SliderValueState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<SliderValueState>) => StyleValue) |  |
| render | ComponentRenderFn<JSX.HTMLAttributes<HTMLElement>, SliderValueState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Control



| Prop | Type | Description |
| --- | --- | --- |
| class | JSX.ClassValue \| ((state: Readonly<SliderControlState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<SliderControlState>) => StyleValue) |  |
| render | ComponentRenderFn<JSX.HTMLAttributes<HTMLElement>, SliderControlState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Track



| Prop | Type | Description |
| --- | --- | --- |
| class | JSX.ClassValue \| ((state: Readonly<SliderTrackState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<SliderTrackState>) => StyleValue) |  |
| render | ComponentRenderFn<JSX.HTMLAttributes<HTMLElement>, SliderTrackState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Indicator



| Prop | Type | Description |
| --- | --- | --- |
| class | JSX.ClassValue \| ((state: Readonly<SliderIndicatorState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<SliderIndicatorState>) => StyleValue) |  |
| render | ComponentRenderFn<JSX.HTMLAttributes<HTMLElement>, SliderIndicatorState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Thumb



| Prop | Type | Description |
| --- | --- | --- |
| getAriaLabel | ((index: number) => string) \| null \| undefined |  |
| getAriaValueText | ((formattedValue: string, value: number, index: number) => string) \| null \| undefined |  |
| index | number \| undefined |  |
| onBlur | ((event: BaseUIEvent<FocusEvent & { currentTarget: HTMLInputElement; target: HTMLInputElement; }>) => void) \| { 0: (data: any, event: BaseUIEvent<FocusEvent & { currentTarget: HTMLInputElement; target: HTMLInputElement; }>) => void; 1: any; } \| undefined |  |
| onFocus | ((event: BaseUIEvent<FocusEvent & { currentTarget: HTMLInputElement; target: HTMLInputElement; }>) => void) \| { 0: (data: any, event: BaseUIEvent<FocusEvent & { currentTarget: HTMLInputElement; target: HTMLInputElement; }>) => void; 1: any; } \| undefined |  |
| onKeyDown | ((event: BaseUIEvent<KeyboardEvent & { currentTarget: HTMLInputElement; target: DOMElement; }>) => void) \| { 0: (data: any, event: BaseUIEvent<KeyboardEvent & { currentTarget: HTMLInputElement; target: DOMElement; }>) => void; 1: any; } \| undefined |  |
| tabIndex | number \| undefined |  |
| disabled | boolean \| undefined |  |
| inputRef | JSX.Ref<HTMLInputElement> |  |
| class | JSX.ClassValue \| ((state: Readonly<SliderThumbState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<SliderThumbState>) => StyleValue) |  |
| render | ComponentRenderFn<JSX.HTMLAttributes<HTMLElement>, SliderThumbState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

