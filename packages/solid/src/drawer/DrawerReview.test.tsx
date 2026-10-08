import { describe, expect, it, vi } from 'vitest';
import { screen } from '@solidjs/testing-library';
import { createRenderer, firePointer, flushMicrotasks, waitFor } from '../../test';
import { Drawer } from './index';
import { useDrawerRootContext } from './root/DrawerRootContext';
import type { DrawerRootActions } from './root/DrawerRoot';
import { dispatchTouch } from './test/KeyboardFixture';

function height(node: HTMLElement | null, value: number) {
  if (node) Object.defineProperty(node, 'offsetHeight', { configurable: true, value });
}

describe('Drawer source-first review regressions', () => {
  const { render, renderProps } = createRenderer();

  it('resets snap state after an accepted close and keeps snap cancellation independent', async () => {
    const order: string[] = [];
    let actions: DrawerRootActions | null = null;
    function Probe() {
      const drawer = useDrawerRootContext();
      return <output data-testid="snap">{String(drawer.activeSnapPoint)}</output>;
    }
    const view = await render(() => <Drawer.Root defaultOpen modal={false} defaultSnapPoint={1} snapPoints={['100px', 1]}
      actionsRef={value => { actions = value; }}
      onOpenChange={(_, details) => { order.push('open'); expect(details.reason).toBe('imperative-action'); }}
      onSnapPointChange={(_, details) => { order.push('snap'); details.cancel(); }}>
      <Probe /><Drawer.Portal keepMounted><Drawer.Viewport><Drawer.Popup>Drawer</Drawer.Popup></Drawer.Viewport></Drawer.Portal>
    </Drawer.Root>);
    actions!.close();
    await flushMicrotasks();
    expect(order).toEqual(['open', 'snap']);
    expect(view.getByTestId('snap')).toHaveTextContent('1');
    expect(screen.getByText('Drawer')).toHaveAttribute('data-closed');
  });

  it('keeps provider active until all real roots close or unregister', async () => {
    const view = await renderProps((props: { first: boolean; second: boolean; show: boolean }) => <Drawer.Provider>
      <Drawer.IndentBackground data-testid="background" />
      <Drawer.Root open={props.first} />
      {props.show && <Drawer.Root open={props.second} />}
    </Drawer.Provider>, { first: false, second: false, show: true });
    const background = view.getByTestId('background');
    expect(background).toHaveAttribute('data-inactive');
    expect(background).not.toHaveAttribute('data-active');
    await view.setProps({ first: true });
    expect(background).toHaveAttribute('data-active');
    expect(background).not.toHaveAttribute('data-inactive');
    await view.setProps({ first: false, second: true });
    expect(background).toHaveAttribute('data-active');
    await view.setProps({ show: false });
    expect(background).toHaveAttribute('data-inactive');
  });

  it('uses the shared completion lifetime once for an initially open drawer', async () => {
    const complete = vi.fn();
    let actions: DrawerRootActions | null = null;
    await render(() => <Drawer.Root defaultOpen modal={false} actionsRef={value => { actions = value; }} onOpenChangeComplete={complete}>
      <Drawer.Portal><Drawer.Viewport><Drawer.Popup>Drawer</Drawer.Popup></Drawer.Viewport></Drawer.Portal>
    </Drawer.Root>);
    await waitFor(() => expect(complete).toHaveBeenCalledWith(true));
    expect(complete.mock.calls).toEqual([[true]]);
    actions!.close();
    await waitFor(() => expect(complete).toHaveBeenCalledWith(false));
    expect(complete.mock.calls).toEqual([[true], [false]]);
  });

  it('does not freeze popup height for a nested root that has no popup', async () => {
    const view = await render(() => <Drawer.Root open modal={false}>
      <Drawer.Portal><Drawer.Viewport><Drawer.Popup data-testid="parent" ref={node => height(node, 200)}>
        <Drawer.Root open modal={false} />
      </Drawer.Popup></Drawer.Viewport></Drawer.Portal>
    </Drawer.Root>);
    expect(screen.getByTestId('parent').style.getPropertyValue('--drawer-height')).toBe('');
    view.unmount();
  });

  it('reports child border-box height and clears nested ownership when a kept-mounted child closes', async () => {
    const view = await renderProps((props: { open: boolean }) => <Drawer.Root open modal={false}>
      <Drawer.Portal><Drawer.Viewport><Drawer.Popup data-testid="parent" ref={node => height(node, 200)}>
        <Drawer.Root open={props.open} modal={false}>
          <Drawer.Portal keepMounted><Drawer.Viewport><Drawer.Popup data-testid="child" ref={node => height(node, 104)} /></Drawer.Viewport></Drawer.Portal>
        </Drawer.Root>
      </Drawer.Popup></Drawer.Viewport></Drawer.Portal>
    </Drawer.Root>, { open: true });
    const parent = screen.getByTestId('parent');
    expect(parent).toHaveAttribute('data-nested-drawer-open');
    expect(parent.style.getPropertyValue('--nested-drawers')).toBe('1');
    expect(parent.style.getPropertyValue('--drawer-frontmost-height')).toBe('104px');
    expect(parent.style.getPropertyValue('--drawer-height')).toBe('200px');
    await view.setProps({ open: false });
    expect(parent).not.toHaveAttribute('data-nested-drawer-open');
    expect(parent.style.getPropertyValue('--nested-drawers')).toBe('0');
    expect(parent.style.getPropertyValue('--drawer-frontmost-height')).toBe('200px');
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it.each(['up', 'down'] as const)('resolves %s snap geometry through live measured parts', async direction => {
    const view = await renderProps((props: { point: number | string | null }) => <Drawer.Root open modal={false} swipeDirection={direction} snapPoints={[0.5, 200, '2rem']} snapPoint={props.point}>
      <Drawer.Portal><Drawer.Viewport ref={node => height(node, 400)}><Drawer.Popup data-testid="popup" ref={node => height(node, 300)} /></Drawer.Viewport></Drawer.Portal>
    </Drawer.Root>, { point: 200 as number | string | null });
    const popup = screen.getByTestId('popup');
    expect(popup.style.getPropertyValue('--drawer-snap-point-offset')).toBe(direction === 'up' ? '-100px' : '100px');
    await view.setProps({ point: null });
    expect(screen.getByTestId('popup')).toBe(popup);
    expect(popup.style.getPropertyValue('--drawer-snap-point-offset')).toBe('0px');
    await view.setProps({ point: 'invalid' });
    expect(popup.style.getPropertyValue('--drawer-snap-point-offset')).toBe('0px');
  });

  it('uses touch handlers after a retained closed viewport opens', async () => {
    const view = await renderProps((props: { open: boolean }) => <Drawer.Root open={props.open} modal={false}>
      <Drawer.Portal keepMounted><Drawer.Backdrop data-testid="backdrop" /><Drawer.Viewport><Drawer.Popup data-testid="popup">Drawer</Drawer.Popup></Drawer.Viewport></Drawer.Portal>
    </Drawer.Root>, { open: false });
    const popup = screen.getByTestId('popup');
    const originalHitTest = document.elementFromPoint;
    document.elementFromPoint = () => popup;
    try {
      await view.setProps({ open: true });
      dispatchTouch(popup, 'touchstart');
      await flushMicrotasks();
      expect(screen.getByTestId('backdrop')).toHaveAttribute('data-swiping');
      dispatchTouch(popup, 'touchend');
      await flushMicrotasks();
      expect(screen.getByTestId('backdrop')).not.toHaveAttribute('data-swiping');
    } finally { document.elementFromPoint = originalHitTest; }
  });

  it('uses pointer handlers after SwipeArea is enabled and suppresses touch compatibility pointers', async () => {
    const change = vi.fn();
    const view = await renderProps((props: { disabled: boolean }) => <Drawer.Root modal={false} onOpenChange={change}>
      <Drawer.SwipeArea disabled={props.disabled} data-testid="area" />
    </Drawer.Root>, { disabled: true });
    const area = view.getByTestId('area');
    await view.setProps({ disabled: false });
    for (const pointerType of ['touch', 'mouse']) {
      firePointer.down(area, { pointerType, button: 0, buttons: 1, pointerId: 1, clientX: 10, clientY: 120, timeStamp: 1000 });
      firePointer.move(area, { pointerType, buttons: 1, pointerId: 1, clientX: 10, clientY: 40, timeStamp: 1016 });
      firePointer.up(area, { pointerType, button: 0, buttons: 0, pointerId: 1, clientX: 10, clientY: 40, timeStamp: 1032 });
      await flushMicrotasks();
      if (pointerType === 'touch') expect(change).not.toHaveBeenCalled();
    }
    expect(area).toHaveAttribute('data-open');
    expect(change).toHaveBeenCalledExactlyOnceWith(true, expect.objectContaining({ reason: 'swipe' }));
  });

  it('keeps payload-derived JSX live without rebuilding the popup host', async () => {
    const handle = Drawer.createHandle<number>();
    const view = await render(() => <Drawer.Root handle={handle} modal={false}>
      {data => <Drawer.Portal keepMounted><Drawer.Viewport><Drawer.Popup data-testid="popup"><output>{data.payload}</output></Drawer.Popup></Drawer.Viewport></Drawer.Portal>}
    </Drawer.Root>);
    handle.openWithPayload(1);
    await flushMicrotasks();
    const popup = screen.getByTestId('popup');
    expect(popup).toHaveTextContent('1');
    handle.openWithPayload(2);
    await flushMicrotasks();
    expect(screen.getByTestId('popup')).toBe(popup);
    expect(popup).toHaveTextContent('2');
    view.unmount();
  });
});
