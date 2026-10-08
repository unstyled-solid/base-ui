# Accordion

A set of collapsible panels with headings.



[Interactive example](/solid/components/accordion)

## Anatomy

Import the component and assemble its parts:

```tsx
import { Accordion } from 'baseui-solid2/accordion';
<Accordion.Root>
  <Accordion.Item>
    <Accordion.Header>
      <Accordion.Trigger />
    </Accordion.Header>
    <Accordion.Panel />
  </Accordion.Item>
</Accordion.Root>;
```

## Examples

### Open multiple panels

You can set up the accordion to allow multiple panels to be open at the same time using the `multiple` prop.

[Interactive example](/solid/components/accordion)

### Hidden until found

The `hiddenUntilFound` prop hides closed panels with [`hidden="until-found"`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/hidden) so the browser can search their contents and reveal the matching panel automatically. It can be set on each `Accordion.Panel`, or once on `Accordion.Root` to apply to all panels.

To try it, press Ctrl

+F

 (Cmd

+F

 on macOS) and search for "restocking"—the browser opens the closed panel containing the match. When `hiddenUntilFound` is enabled, closed panels always remain mounted in the DOM, which also makes their contents indexable by search engines.

Older browsers that don't support `hidden="until-found"` keep panels hidden until their trigger opens them, and find-in-page skips over the contents.

[Interactive example](/solid/components/accordion)

## API reference

### Root

Groups an accordion's disclosures. Keyboard focus follows normal document order.

| Prop | Type | Description |
| --- | --- | --- |
| defaultValue | AccordionValue<Value> \| undefined |  |
| value | AccordionValue<Value> \| undefined |  |
| onValueChange | ((value: AccordionValue<Value>, details: AccordionRootChangeEventDetails) => void) \| undefined |  |
| hiddenUntilFound | boolean \| undefined |  |
| loopFocus | boolean \| undefined |  |
| multiple | boolean \| undefined |  |
| disabled | boolean \| undefined |  |
| orientation | Orientation \| undefined |  |
| class | JSX.ClassValue \| ((state: Readonly<AccordionRootState<Value>>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AccordionRootState<Value>>) => StyleValue) |  |
| keepMounted | boolean \| undefined |  |
| render | ComponentRenderFn<JSX.HTMLAttributes<HTMLDivElement> & JSX.Properties<HTMLDivElement>, AccordionRootState<Value>> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Item

Groups the heading, trigger, and panel of one disclosure.

| Prop | Type | Description |
| --- | --- | --- |
| value | any |  |
| onOpenChange | ((open: boolean, details: AccordionItemChangeEventDetails) => void) \| undefined |  |
| disabled | boolean \| undefined |  |
| class | JSX.ClassValue \| ((state: Readonly<AccordionItemState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AccordionItemState>) => StyleValue) |  |
| render | ComponentRenderFn<JSX.HTMLAttributes<HTMLDivElement> & JSX.Properties<HTMLDivElement>, AccordionItemState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Header

A heading for the corresponding disclosure. Renders an h3 by default.

| Prop | Type | Description |
| --- | --- | --- |
| class | JSX.ClassValue \| ((state: Readonly<AccordionHeaderState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AccordionHeaderState>) => StyleValue) |  |
| render | ComponentRenderFn<JSX.HTMLAttributes<HTMLHeadingElement> & JSX.Properties<HTMLHeadingElement>, AccordionHeaderState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Trigger

A normally tabbable button that toggles its disclosure.

| Prop | Type | Description |
| --- | --- | --- |
| nativeButton | boolean \| undefined |  |
| class | JSX.ClassValue \| ((state: Readonly<AccordionTriggerState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AccordionTriggerState>) => StyleValue) |  |
| render | ComponentRenderFn<JSX.HTMLAttributes<HTMLElement>, AccordionTriggerState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Panel

The disclosure's measured, animated region. Lifecycle is owned by Collapsible.

| Prop | Type | Description |
| --- | --- | --- |
| hiddenUntilFound | boolean \| undefined |  |
| class | JSX.ClassValue \| ((state: Readonly<AccordionPanelState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AccordionPanelState>) => StyleValue) |  |
| keepMounted | boolean \| undefined |  |
| render | ComponentRenderFn<JSX.HTMLAttributes<HTMLDivElement> & JSX.Properties<HTMLDivElement>, AccordionPanelState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

