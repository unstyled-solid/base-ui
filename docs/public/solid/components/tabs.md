# Tabs

A component for toggling between related panels on the same page.



[Interactive example](/solid/components/tabs)

## Anatomy

Import the component and assemble its parts:

```tsx
import { Tabs } from 'baseui-solid2/tabs';
<Tabs.Root>
  <Tabs.List>
    <Tabs.Tab />
    <Tabs.Indicator />
  </Tabs.List>
  <Tabs.Panel />
</Tabs.Root>;
```

## Examples

### Animated panels

Animate panels as they activate using the `data-starting-style` and `data-ending-style` attributes.
The `data-activation-direction` attribute indicates which direction the newly active tab is relative to the previously active one, letting panels slide in from the correct side.

[Interactive example](/solid/components/tabs)

### Links

Use the `render` prop and set `nativeButton={false}` on `<Tabs.Tab>` to render tabs as anchor elements.

```jsx
import { Tabs } from '@base-ui/react/tabs';
import Link from 'next/link';

<Tabs.Root>
  <Tabs.List>
    {/* @highlight-start */}
    {/* @highlight-text "nativeButton={false}" "render" */}
    <Tabs.Tab
      nativeButton={false}
      render={<Link href="/overview" />}
      value="overview"
    >
      Overview
    </Tabs.Tab>
    {/* @highlight-end */}
  </Tabs.List>
  {/* ... */}
</Tabs.Root>;
```

## API reference

### Root

Groups tabs and their panels. Renders a div.

| Prop | Type | Description |
| --- | --- | --- |
| defaultValue | any |  |
| value | any |  |
| onValueChange | ((value: TabsTab.Value, details: TabsRootChangeEventDetails) => void) \| undefined |  |
| orientation | TabsRootOrientation \| undefined |  |
| class | JSX.ClassValue \| ((state: Readonly<TabsRootState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<TabsRootState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, TabsRootState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### List

Groups the tab buttons. Keyboard movement is owned by CompositeRoot.

| Prop | Type | Description |
| --- | --- | --- |
| activateOnFocus | boolean \| undefined |  |
| loopFocus | boolean \| undefined |  |
| class | JSX.ClassValue \| ((state: Readonly<TabsListState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<TabsListState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, TabsListState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Tab

An interactive tab button; disabled tabs remain keyboard focusable.

| Prop | Type | Description |
| --- | --- | --- |
| value | any |  |
| nativeButton | boolean \| undefined |  |
| disabled | boolean \| undefined |  |
| class | JSX.ClassValue \| ((state: Readonly<TabsTabState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<TabsTabState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, TabsTabState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Indicator

Measures the selected tab in layout coordinates, retaining subpixel precision when safe.

| Prop | Type | Description |
| --- | --- | --- |
| renderBeforeHydration | boolean \| undefined |  |
| class | JSX.ClassValue \| ((state: Readonly<TabsIndicatorState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<TabsIndicatorState>) => StyleValue) |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, TabsIndicatorState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Panel

A panel retained until its exit animation completes.

| Prop | Type | Description |
| --- | --- | --- |
| value | any |  |
| class | JSX.ClassValue \| ((state: Readonly<TabsPanelState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<TabsPanelState>) => StyleValue) |  |
| keepMounted | boolean \| undefined |  |
| render | ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, TabsPanelState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

