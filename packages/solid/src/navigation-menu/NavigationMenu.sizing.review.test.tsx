import { describe, expect, it, vi } from 'vitest';
import { createSignal, flush, Show } from 'solid-js';
import { advanceFrame, createRenderer, fireEvent, screen, waitFor } from '#test-utils';
import { NavigationMenu } from './index';
import type { NavigationMenuRoot } from './root/NavigationMenuRoot';

const { render, renderProps } = createRenderer();
function Sized(props: NavigationMenuRoot.Props & { keepMounted?: boolean }) {
  const [inserted, setInserted] = createSignal(false);
  return <NavigationMenu.Root value={props.value} defaultValue={props.defaultValue} onOpenChangeComplete={props.onOpenChangeComplete}>
    <NavigationMenu.List><NavigationMenu.Item value="a"><NavigationMenu.Trigger>Size trigger</NavigationMenu.Trigger><NavigationMenu.Content><button onClick={() => setInserted(true)}>Insert content</button><Show when={inserted()}><div>Added content</div></Show></NavigationMenu.Content></NavigationMenu.Item></NavigationMenu.List>
    <NavigationMenu.Portal keepMounted={props.keepMounted}><NavigationMenu.Positioner data-testid="sized-positioner"><NavigationMenu.Popup data-testid="sized-popup"><NavigationMenu.Viewport /></NavigationMenu.Popup></NavigationMenu.Positioner></NavigationMenu.Portal>
  </NavigationMenu.Root>;
}

describe('NavigationMenu source controlled sizing and interruption', () => {
  // These offsets reproduce the pinned source's temporary-zero regressions;
  // actual browser geometry remains in NavigationMenu.browser.test.tsx.
  for (const keepMounted of [false, true]) {
    it(`controlled exit preserves the last fixed size when the popup already measures zero [keepMounted=${keepMounted}]`, async () => {
      const complete = vi.fn();
      const view = await renderProps<NavigationMenuRoot.Props>((props) => <Sized {...props} keepMounted={keepMounted} />, { value: 'a', onOpenChangeComplete: complete });
      const popup = screen.getByTestId('sized-popup'); const positioner = screen.getByTestId('sized-positioner');
      await waitFor(() => expect(popup.style.getPropertyValue('--popup-width')).toBe('auto'));
      positioner.style.setProperty('--positioner-width', '675px'); positioner.style.setProperty('--positioner-height', '220px');
      Object.defineProperty(popup, 'offsetWidth', { configurable: true, get: () => 0 });
      Object.defineProperty(popup, 'offsetHeight', { configurable: true, get: () => 0 });
      await view.setProps({ value: null });
      expect(popup.style.getPropertyValue('--popup-width')).toBe('675px');
      expect(popup.style.getPropertyValue('--popup-height')).toBe('220px');
      await waitFor(() => expect(complete).toHaveBeenCalledExactlyOnceWith(false));
      if (keepMounted) expect(positioner).toHaveAttribute('hidden');
      else expect(popup.isConnected).toBe(false);
    });
  }
  it('an interrupted mutation measuring zero retains the current intermediate size, not an older completed size', async () => {
    vi.useFakeTimers();
    const view = await render(() => <Sized defaultValue="a" />);
    try {
      const popup = screen.getByTestId('sized-popup'); const positioner = screen.getByTestId('sized-positioner');
      await advanceFrame();
      let height = 220;
      Object.defineProperty(popup, 'offsetWidth', { configurable: true, get: () => 250 });
      Object.defineProperty(popup, 'offsetHeight', { configurable: true, get: () => height });
      fireEvent(window, new Event('resize')); await advanceFrame();
      expect(positioner.style.getPropertyValue('--positioner-height')).toBe('220px');
      popup.style.setProperty('--popup-width', '250px'); popup.style.setProperty('--popup-height', '220px');
      const heights = [190, 0];
      Object.defineProperty(popup, 'offsetHeight', { configurable: true, get: () => heights.shift() ?? 0 });
      fireEvent.click(screen.getByText('Insert content')); flush();
      // MutationObserver callback, two interruption frames, then the size frame.
      await advanceFrame(); await advanceFrame(); await advanceFrame(); await advanceFrame();
      expect(screen.getByText('Added content')).toBeInTheDocument();
      expect(positioner.style.getPropertyValue('--positioner-height')).toBe('190px');
      expect(popup.style.getPropertyValue('--popup-height')).toBe('auto');
    } finally { view.unmount(); vi.useRealTimers(); }
  });
});
