<a id="animation"></a>

# Animation

A guide to animating Base UI components.

Base UI components can be animated using CSS transitions, CSS animations, or JavaScript animation libraries. Each component provides a number of data attributes to target its states, as well as a few attributes specifically for animation.

<a id="css-transitions"></a>

## CSS transitions

Use the following Base UI attributes for creating transitions when a component becomes visible or hidden:

- `[data-starting-style]` corresponds to the initial style to transition from.
- `[data-ending-style]` corresponds to the final style to transition to.

Transitions are recommended over CSS animations, because a transition can be smoothly cancelled midway.
For example, if the user closes a popup before it finishes opening, with CSS transitions it will smoothly animate to its closed state without any abrupt changes.

```css
.Popup {
  box-sizing: border-box;
  padding: 1rem 1.5rem;
  background-color: canvas;
  transform-origin: var(--transform-origin);
  transition:
    transform 150ms,
    opacity 150ms;

  &[data-starting-style],
  &[data-ending-style] {
    opacity: 0;
    transform: scale(0.9);
  }
}
```

<a id="css-animations"></a>

## CSS animations

Use the following Base UI attributes for creating CSS animations when a component becomes visible or hidden:

- `[data-open]` corresponds to the style applied when a component becomes visible.
- `[data-closed]` corresponds to the style applied before a component becomes hidden.

```css
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes scaleOut {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.9);
  }
}

.Popup[data-open] {
  animation: scaleIn 250ms ease-out;
}

.Popup[data-closed] {
  animation: scaleOut 250ms ease-in;
}
```

<a id="javascript-animations"></a>

## JavaScript animations

JavaScript animations can use the native Web Animations API. When automatic closing-animation detection is insufficient, prevent unmounting and explicitly finish the closing phase as shown under Manual unmounting.

<a id="manual-unmounting"></a>

### Manual unmounting

Use this when Base UI can't detect your closing animation, for example when it doesn't animate `opacity`, or when the popup should stay in its closing phase until something other than an animation completes.

Call `eventDetails.preventUnmountOnClose()` in `onOpenChange` when the component closes, then call `unmount()` on the `actionsRef` passed to the `<Root>` once the animation finishes.
This ends the closing phase, and `onOpenChangeComplete(false)` fires. Whether the popup leaves the DOM is still decided by `keepMounted`.

```tsx
import { createSignal, onCleanup } from 'solid-js';
import { Popover } from '@unstyled-solid/base-ui/popover';
export default function Example() {
  const [open, setOpen] = createSignal(false);
  let actions: Popover.Root.Actions | null = null;
  let popup: HTMLDivElement | undefined;
  let animation: Animation | undefined;
  onCleanup(() => animation?.cancel());
  return (
    <Popover.Root
      open={open()}
      actionsRef={(value) => {
        actions = value;
      }}
      onOpenChange={(nextOpen, details) => {
        animation?.cancel();
        if (!nextOpen && popup) {
          details.preventUnmountOnClose();
          animation = popup.animate(
            [{ transform: 'scale(1)' }, { transform: 'scale(.8)' }],
            { duration: 150, fill: 'forwards' },
          );
          animation.onfinish = () => actions?.unmount();
        }
        setOpen(nextOpen);
      }}
    >
      <Popover.Trigger>Trigger</Popover.Trigger>
      <Popover.Portal keepMounted>
        <Popover.Positioner>
          <Popover.Popup
            ref={(node) => {
              popup = node ?? undefined;
            }}
          >
            Popup
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
```

