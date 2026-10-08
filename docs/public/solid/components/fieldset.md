# Fieldset

A native fieldset element with an easily stylable legend.



[Interactive example](/solid/components/fieldset)

## Anatomy

Import the component and assemble its parts:

```tsx
import { Fieldset } from 'baseui-solid2/fieldset';
<Fieldset.Root>
  <Fieldset.Legend />
</Fieldset.Root>;
```

## API reference

### Root

Groups a shared legend with related controls. Renders a `<fieldset>` element.

| Prop | Type | Description |
| --- | --- | --- |
| disabled | boolean \| undefined | Whether this fieldset and its descendants should ignore user interaction. |
| class | JSX.ClassValue \| ((state: Readonly<FieldsetRootState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<FieldsetRootState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>> & { disabled?: boolean; }, FieldsetRootState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Legend

An accessible label associated with the fieldset. Renders a `<div>` element.

| Prop | Type | Description |
| --- | --- | --- |
| id | string \| undefined |  |
| class | JSX.ClassValue \| ((state: Readonly<FieldsetLegendState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<FieldsetLegendState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, FieldsetLegendState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

