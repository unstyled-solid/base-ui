# Collapsible

A collapsible panel controlled by a button.



[Interactive example](/solid/components/collapsible)

## Anatomy

Import the component and assemble its parts:

```tsx
import { Collapsible } from 'baseui-solid2/collapsible';
<Collapsible.Root>
  <Collapsible.Trigger />
  <Collapsible.Panel />
</Collapsible.Root>;
```

## Examples

### Hidden until found

The `hiddenUntilFound` prop hides the closed panel with [`hidden="until-found"`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/hidden) so the browser can search its contents with find-in-page—Ctrl

+F

 (Cmd

+F

 on macOS)—and reveal the panel when a match is found. The closed panel always remains mounted in the DOM, which also makes its contents indexable by search engines.

Older browsers that don't support `hidden="until-found"` keep the panel hidden until its trigger opens it, and find-in-page skips over the contents.

```tsx
<Collapsible.Root>
  <Collapsible.Trigger>Shipping details</Collapsible.Trigger>

  <Collapsible.Panel hiddenUntilFound>
    Standard shipping takes 3–5 business days.
  </Collapsible.Panel>
</Collapsible.Root>;
```

See the [Accordion example](/solid/components/accordion#hidden-until-found) for an interactive demo.

## API reference

### Root



| Prop | Type | Description |
| --- | --- | --- |
| defaultOpen | boolean \| undefined |  |
| open | boolean \| undefined |  |
| onOpenChange | ((open: boolean, details: CollapsibleRootChangeEventDetails) => void) \| undefined |  |
| disabled | boolean \| undefined |  |
| class | JSX.ClassValue \| ((state: Readonly<CollapsibleRootState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<CollapsibleRootState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, CollapsibleRootState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Trigger



| Prop | Type | Description |
| --- | --- | --- |
| nativeButton | boolean \| undefined |  |
| disabled | boolean \| undefined |  |
| class | JSX.ClassValue \| ((state: Readonly<CollapsibleTriggerState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<CollapsibleTriggerState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, CollapsibleTriggerState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Panel



| Prop | Type | Description |
| --- | --- | --- |
| hiddenUntilFound | boolean \| undefined |  |
| class | JSX.ClassValue \| ((state: Readonly<CollapsiblePanelState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<CollapsiblePanelState>) => StyleValue) |  |
| keepMounted | boolean \| undefined |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, CollapsiblePanelState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

