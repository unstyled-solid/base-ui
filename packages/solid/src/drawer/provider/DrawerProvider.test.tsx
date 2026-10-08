import { describe, it, expect } from 'vitest';
import { createSignal, onSettled } from 'solid-js';
import { createRenderer } from '../../../test';
import { DrawerProvider } from './DrawerProvider';
import { createVisualStateStore, useDrawerProviderContext } from './DrawerProviderContext';
import { DrawerIndent } from '../indent/DrawerIndent';
import { DrawerIndentBackground } from '../indent-background/DrawerIndentBackground';

describe('Drawer Provider and indentation', () => {
  const { render } = createRenderer();
  it('derives active state from living drawers and preserves host identity', async () => {
    function Registration() {
      const context = useDrawerProviderContext()!;
      const [open, setOpen] = createSignal(false);
      onSettled(() => context.registerDrawer({}, open));
      return <button onClick={() => setOpen(value => !value)}>toggle</button>;
    }
    const view = await render(() => <DrawerProvider><Registration /><DrawerIndent data-testid="indent" /><DrawerIndentBackground data-testid="background" /></DrawerProvider>);
    const indent = view.getByTestId('indent');
    expect(indent).toHaveAttribute('data-inactive');
    expect(indent).not.toHaveAttribute('data-active');
    await view.user.click(view.getByRole('button'));
    expect(view.getByTestId('indent')).toBe(indent);
    expect(indent).toHaveAttribute('data-active');
    expect(indent).not.toHaveAttribute('data-inactive');
    expect(view.getByTestId('background')).toHaveAttribute('data-active');
    await view.user.click(view.getByRole('button'));
    expect(indent).toHaveAttribute('data-inactive');
  });
  it('publishes same-turn multi-drawer updates without losing registrations', async () => {
    function Actions() {
      const context = useDrawerProviderContext()!;
      const first = {}, second = {};
      return <><button onClick={() => { context.setDrawerOpen(first, true); context.setDrawerOpen(second, true); context.removeDrawer(first); }}>open</button><button onClick={() => context.removeDrawer(second)}>close</button></>;
    }
    const view = await render(() => <DrawerProvider><Actions /><DrawerIndent data-testid="indent" /></DrawerProvider>);
    await view.user.click(view.getByText('open'));
    expect(view.getByTestId('indent')).toHaveAttribute('data-active');
    await view.user.click(view.getByText('close'));
    expect(view.getByTestId('indent')).toHaveAttribute('data-inactive');
  });
  it('syncs visual variables and releases old nodes on disposal', async () => {
    function Actions() {
      const provider = useDrawerProviderContext()!;
      return <button onClick={() => provider.visualStateStore.set({ swipeProgress: 0.4, frontmostHeight: 310 })}>swipe</button>;
    }
    const view = await render(() => <DrawerProvider><Actions /><DrawerIndent data-testid="indent" /></DrawerProvider>);
    const node = view.getByTestId('indent');
    await view.user.click(view.getByRole('button'));
    expect(node.style.getPropertyValue('--drawer-swipe-progress')).toBe('0.4');
    expect(node.style.getPropertyValue('--drawer-height')).toBe('310px');
    view.unmount();
    expect(node.style.getPropertyValue('--drawer-swipe-progress')).toBe('0');
    expect(node.style.getPropertyValue('--drawer-height')).toBe('');
  });
  it('keeps the optional provider absent rather than sharing mutable fallback state', async () => {
    const view = await render(() => <><DrawerIndent data-testid="indent" /><DrawerIndentBackground data-testid="background" /></>);
    expect(view.getByTestId('indent')).toHaveAttribute('data-inactive');
    expect(view.getByTestId('background')).toHaveAttribute('data-inactive');
  });
  it('ignores redundant registry updates without disturbing active state', async () => {
    function Controls() {
      const context = useDrawerProviderContext()!;
      const drawer = {}, missing = {};
      return <><button onClick={() => context.setDrawerOpen(drawer, true)}>Register open</button>
        <button onClick={() => context.setDrawerOpen(drawer, false)}>Register closed</button>
        <button onClick={() => context.removeDrawer(drawer)}>Remove registered</button>
        <button onClick={() => context.removeDrawer(missing)}>Remove missing</button></>;
    }
    const view = await render(() => <DrawerProvider><DrawerIndentBackground data-testid="background" /><Controls /></DrawerProvider>);
    const background = view.getByTestId('background');
    await view.user.click(view.getByText('Register open'));
    expect(background).toHaveAttribute('data-active', '');
    await view.user.click(view.getByText('Register open'));
    await view.user.click(view.getByText('Remove missing'));
    expect(background).toHaveAttribute('data-active', '');
    await view.user.click(view.getByText('Register closed'));
    expect(background).toHaveAttribute('data-inactive', '');
    await view.user.click(view.getByText('Remove registered'));
    await view.user.click(view.getByText('Remove registered'));
    expect(background).toHaveAttribute('data-inactive', '');
  });
  it('synchronizes partial visual updates and restores a removed indent', async () => {
    function Controls() {
      const context = useDrawerProviderContext()!;
      return <><button onClick={() => context.visualStateStore.set({ swipeProgress: 0.5, frontmostHeight: 120 })}>Set visual state</button>
        <button onClick={() => context.visualStateStore.set({ swipeProgress: 0 })}>Clear progress</button>
        <button onClick={() => context.visualStateStore.set({ frontmostHeight: 0 })}>Clear height</button>
        <button onClick={() => context.visualStateStore.set({ swipeProgress: NaN, frontmostHeight: Infinity })}>Set invalid visual state</button></>;
    }
    const { renderProps } = createRenderer();
    const view = await renderProps((props: { showIndent: boolean }) => <DrawerProvider>
      {props.showIndent && <DrawerIndent data-testid="indent" />}<Controls />
    </DrawerProvider>, { showIndent: true });
    const indent = view.getByTestId('indent');
    await view.user.click(view.getByText('Set visual state'));
    expect(indent.style.getPropertyValue('--drawer-swipe-progress')).toBe('0.5');
    expect(indent.style.getPropertyValue('--drawer-height')).toBe('120px');
    await view.user.click(view.getByText('Clear progress'));
    expect(indent.style.getPropertyValue('--drawer-swipe-progress')).toBe('0');
    expect(indent.style.getPropertyValue('--drawer-height')).toBe('120px');
    await view.user.click(view.getByText('Clear height'));
    expect(indent.style.getPropertyValue('--drawer-height')).toBe('');
    await view.user.click(view.getByText('Set invalid visual state'));
    expect(indent.style.getPropertyValue('--drawer-swipe-progress')).toBe('0');
    expect(indent.style.getPropertyValue('--drawer-height')).toBe('');
    await view.user.click(view.getByText('Set visual state'));
    await view.setProps({ showIndent: false });
    expect(indent.style.getPropertyValue('--drawer-swipe-progress')).toBe('0');
    expect(indent.style.getPropertyValue('--drawer-height')).toBe('');
  });
  it('normalizes non-finite progress and height, deduplicates and unsubscribes', () => {
    const store = createVisualStateStore();
    let calls = 0;
    const dispose = store.subscribe(() => calls++);
    store.set({ swipeProgress: 0.5, frontmostHeight: 300 });
    store.set({ swipeProgress: 0.5 });
    expect(calls).toBe(1);
    store.set({ swipeProgress: NaN, frontmostHeight: Infinity });
    expect(store.getSnapshot()).toEqual({ swipeProgress: 0, frontmostHeight: 0 });
    dispose();
    store.set({ swipeProgress: 1 });
    expect(calls).toBe(2);
  });
});
