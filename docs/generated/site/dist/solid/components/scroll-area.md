# Scroll Area

A native scroll container with custom scrollbars.



[Interactive example](/solid/components/scroll-area)

## Anatomy

Import the component and assemble its parts:

```tsx
import { ScrollArea } from 'baseui-solid2/scroll-area';
<ScrollArea.Root>
  <ScrollArea.Viewport>
    <ScrollArea.Content />
  </ScrollArea.Viewport>
  <ScrollArea.Scrollbar>
    <ScrollArea.Thumb />
  </ScrollArea.Scrollbar>
  <ScrollArea.Corner />
</ScrollArea.Root>;
```

## Examples

### Both scrollbars

Use `<ScrollArea.Corner>` to prevent the scrollbars from intersecting.

[Interactive example](/solid/components/scroll-area)

### Gradient scroll fade

Use the viewport overflow CSS variables to drive a CSS mask, which gradually increases the fade as the user scrolls away from the edges.

```css
.Viewport {
  mask-image: linear-gradient(
    to bottom,
    transparent 0,
    black min(40px, var(--scroll-area-overflow-y-start)),
    black calc(100% - min(40px, var(--scroll-area-overflow-y-end, 40px))),
    transparent 100%
  );
  mask-repeat: no-repeat;
}
```

For SSR, a fallback can be used as part of the end-side `var()` call so the mask is visible before the overflow CSS variables hydrate.

```css
/* @highlight-text ", 40px" */
var(--scroll-area-overflow-y-end, 40px);
```

When the fade is applied to `<ScrollArea.Viewport>` itself, the variables can be used directly. However, inheritance to children is disabled, so they must explicitly opt-in using the `inherit` keyword.

```css
.Child {
  --scroll-area-overflow-y-start: inherit;
  --scroll-area-overflow-y-end: inherit;
}
```

[Interactive example](/solid/components/scroll-area)

### Combining with Tabs

Use `<Tabs.List>`'s `render` prop to render `<ScrollArea.Viewport>` directly when the tab list itself needs the viewport overflow values for a mask fade. This keeps the mask logic on the same element that receives the scroll state.

```tsx
<Tabs.Root defaultValue="overview">
  <ScrollArea.Root>
    <Tabs.List render={(renderProps) => <ScrollArea.Viewport {...renderProps} />}>
      <Tabs.Tab value="overview">Overview</Tabs.Tab>
      <Tabs.Indicator />
    </Tabs.List>
  </ScrollArea.Root>
  <Tabs.Panel value="overview">...</Tabs.Panel>
</Tabs.Root>;
```

## API reference

### Root

Source: Base UI 19511bb, MIT. Solid setup owns state; gesture latches are synchronous.

| Prop | Type | Description |
| --- | --- | --- |
| overflowEdgeThreshold | number \| Partial<Record<keyof OverflowEdges, number>> \| undefined |  |
| class | JSX.ClassValue \| ((state: Readonly<ScrollAreaRootState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ScrollAreaRootState>) => StyleValue) |  |
| render | ComponentRenderFn<JSX.HTMLAttributes<HTMLDivElement> & JSX.Properties<HTMLDivElement>, ScrollAreaRootState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Viewport



| Prop | Type | Description |
| --- | --- | --- |
| class | JSX.ClassValue \| ((state: Readonly<ScrollAreaViewportState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ScrollAreaViewportState>) => StyleValue) |  |
| render | ComponentRenderFn<JSX.HTMLAttributes<HTMLDivElement> & JSX.Properties<HTMLDivElement>, ScrollAreaViewportState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Content



| Prop | Type | Description |
| --- | --- | --- |
| class | JSX.ClassValue \| ((state: Readonly<ScrollAreaContentState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ScrollAreaContentState>) => StyleValue) |  |
| render | ComponentRenderFn<JSX.HTMLAttributes<HTMLDivElement> & JSX.Properties<HTMLDivElement>, ScrollAreaContentState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Scrollbar



| Prop | Type | Description |
| --- | --- | --- |
| orientation | "horizontal" \| "vertical" \| undefined |  |
| class | JSX.ClassValue \| ((state: Readonly<ScrollAreaScrollbarState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ScrollAreaScrollbarState>) => StyleValue) |  |
| keepMounted | boolean \| undefined |  |
| render | ComponentRenderFn<JSX.HTMLAttributes<HTMLDivElement> & JSX.Properties<HTMLDivElement>, ScrollAreaScrollbarState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Thumb



| Prop | Type | Description |
| --- | --- | --- |
| class | JSX.ClassValue \| ((state: Readonly<ScrollAreaThumbState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ScrollAreaThumbState>) => StyleValue) |  |
| render | ComponentRenderFn<JSX.HTMLAttributes<HTMLDivElement> & JSX.Properties<HTMLDivElement>, ScrollAreaThumbState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Corner



| Prop | Type | Description |
| --- | --- | --- |
| class | JSX.ClassValue \| ((state: Readonly<ScrollAreaCornerState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<ScrollAreaCornerState>) => StyleValue) |  |
| render | ComponentRenderFn<JSX.HTMLAttributes<HTMLDivElement> & JSX.Properties<HTMLDivElement>, ScrollAreaCornerState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

