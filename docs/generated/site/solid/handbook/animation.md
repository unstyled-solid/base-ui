# Animation

A guide to animating Base UI components.



Base UI components can be animated using CSS transitions, CSS animations, or JavaScript animation libraries. Each component provides a number of data attributes to target its states, as well as a few attributes specifically for animation.

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

  /* @highlight-start */
  &[data-starting-style],
  &[data-ending-style] {
    opacity: 0;
    transform: scale(0.9);
  }
  /* @highlight-end */
}
```

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

## JavaScript animations

React animation libraries such as [Motion](https://motion.dev) need the popup to stay rendered while its exit animation plays, and Base UI to know when that animation is over.

When a popup closes, `open` becomes `false` right away, but the popup stays rendered in a closing phase until its closing animation finishes.
Base UI detects animations on the popup element. CSS animations are detected, as are animations in the upstream React Motion examples that include `opacity`.
Once the animation ends, the popup is removed from the DOM, or hidden if the `<Portal>` has `keepMounted`, and `onOpenChangeComplete(false)` fires.

This leaves two choices:

- **Where does the popup go when closed?** Removed from the DOM with `<AnimatePresence>`, or kept in the DOM with `keepMounted`.
- **Who ends the closing phase?** Base UI, when it can detect the animation, or you, with [manual unmounting](#manual-unmounting).

The examples below animate `opacity`, so Base UI ends the closing phase on its own.

### Animating components unmounted from DOM when closed with Motion

Most popup components like Popover, Dialog, Tooltip, and Menu are removed from the DOM when they are closed by default. To animate them with Motion:

- Make the component controlled with the `open` prop so `<AnimatePresence>` can see the state as a child
- Specify `keepMounted` on the `<Portal>` part so Base UI doesn't remove it before the exit animation has played
- Use the `render` prop to compose the `<Popup>` with `motion.div`

[Interactive example](/solid/handbook/animation)

```jsx
function App() {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger>Trigger</Popover.Trigger>
      <AnimatePresence>
        {open && (
          <Popover.Portal keepMounted> {/* @highlight-text "keepMounted" */}
            <Popover.Positioner>
              <Popover.Popup
                {/* @highlight-start */}
                render={
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  />
                }
                {/* @highlight-end */}
              >
                Popup
              </Popover.Popup>
            </Popover.Positioner>
          </Popover.Portal>
        )}
      </AnimatePresence>
    </Popover.Root>
  );
}
```

### Animating components kept in DOM when closed with Motion

Components that specify `keepMounted` remain rendered in the DOM when they are closed. These elements need a different approach to be animated with Motion:

- Use the `render` prop to compose the `<Popup>` with `motion.div`
- Animate the properties based on the `open` state, avoiding `<AnimatePresence>`

[Interactive example](/solid/handbook/animation)

```jsx
function App() {
  return (
    <Popover.Root>
      <Popover.Trigger>Trigger</Popover.Trigger>
      <Popover.Portal keepMounted> {/* @highlight-text "keepMounted" */}
        <Popover.Positioner>
          <Popover.Popup
            // @highlight-start
            render={(props, state) => (
              <motion.div
                {...(props as HTMLMotionProps<'div'>)}
                initial={false}
                animate={{
                  opacity: state.open ? 1 : 0,
                  scale: state.open ? 1 : 0.8,
                }}
              />
            )}
            {/* @highlight-end */}
          >
            Popup
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
```

### Animating Select component with Motion

The Select component is removed from the DOM until its first interaction and stays in the DOM after that. To animate it with Motion, a mix of the two previous approaches is needed.

[Interactive example](/solid/handbook/animation)

### Manual unmounting

Use this when Base UI can't detect your closing animation, for example when it doesn't animate `opacity`, or when the popup should stay in its closing phase until something other than an animation completes.

Call `eventDetails.preventUnmountOnClose()` in `onOpenChange` when the component closes, then call `unmount()` on the `actionsRef` passed to the `<Root>` once the animation finishes.
This ends the closing phase, and `onOpenChangeComplete(false)` fires. Whether the popup leaves the DOM is still decided by `keepMounted`.

```tsx
import { createSignal, onCleanup } from 'solid-js';
import { Popover } from 'baseui-solid2/popover';
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

