import { describe, expect, it, vi } from 'vitest';
import { createSignal, Show } from 'solid-js';
import { screen } from '@solidjs/testing-library';
import { createRenderer, sourceCase, waitFor } from '../../../test';
import { Drawer, DrawerTriggerDataAttributes, DrawerCloseDataAttributes } from '../index';
import { useDrawerRootContext } from './DrawerRootContext';

// These are real composition tests: no mocked controlled/popup/gesture foundations.
describe('Drawer root composition (open foundation dependencies)', () => {
  const { render, renderProps } = createRenderer();
  const source = 'packages/react/src/drawer/root/DrawerRoot.test.tsx';
  function SnapProbe() { const context = useDrawerRootContext(); return <output data-testid="snap">{String(context.activeSnapPoint)}</output>; }

  sourceCase({ source, case: 'exposes the attributes rendered by borrowed trigger and close parts', environment: 'jsdom' }, async () => {
    const view = await render(() => <Drawer.Root><Drawer.Trigger>Open</Drawer.Trigger><Drawer.Trigger disabled>Disabled</Drawer.Trigger><Drawer.Portal><Drawer.Viewport><Drawer.Popup><Drawer.Close disabled>Close</Drawer.Close></Drawer.Popup></Drawer.Viewport></Drawer.Portal></Drawer.Root>);
    expect(view.getByRole('button', { name: 'Disabled' })).toHaveAttribute(DrawerTriggerDataAttributes.disabled);
    const trigger = view.getByRole('button', { name: 'Open' });
    expect(trigger).not.toHaveAttribute(DrawerTriggerDataAttributes.popupOpen);
    await view.user.click(trigger);
    expect(trigger).toHaveAttribute(DrawerTriggerDataAttributes.popupOpen);
    expect(trigger).toHaveAttribute('aria-controls', screen.getByRole('dialog').id);
    expect(screen.getByRole('button', { name: 'Close' })).toHaveAttribute(DrawerCloseDataAttributes.disabled);
  });
  sourceCase({ source, case: 'supports detached triggers with handles', environment: 'jsdom', adaptation: 'Payload child receives a live Solid context' }, async () => {
    const handle = Drawer.createHandle<string>();
    const view = await render(() => <><Drawer.Trigger handle={handle} payload="first">First</Drawer.Trigger><Drawer.Trigger handle={handle} payload="second">Second</Drawer.Trigger><Drawer.Root handle={handle}>{payload => <Drawer.Portal><Drawer.Viewport><Drawer.Popup><output>{payload.payload}</output><Drawer.Close>Close</Drawer.Close></Drawer.Popup></Drawer.Viewport></Drawer.Portal>}</Drawer.Root></>);
    expect(screen.queryByRole('dialog')).toBeNull();
    await view.user.click(view.getByRole('button', { name: 'First' })); expect(screen.getByRole('dialog')).toHaveTextContent('first');
    await view.user.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    await view.user.click(view.getByRole('button', { name: 'Second' })); expect(screen.getByRole('dialog')).toHaveTextContent('second');
  });
  sourceCase({ source, case: 'synchronizes trigger aria-controls with the popup id', environment: 'jsdom' }, async () => {
    const view = await renderProps((props: { id: string }) => <Drawer.Root><Drawer.Trigger>Open</Drawer.Trigger><Drawer.Portal><Drawer.Viewport><Drawer.Popup id={props.id}>Drawer</Drawer.Popup></Drawer.Viewport></Drawer.Portal></Drawer.Root>, { id: 'drawer-first' });
    const trigger = view.getByRole('button', { name: 'Open' });
    await view.user.click(trigger);
    const popup = screen.getByRole('dialog');
    expect(trigger).toHaveAttribute('aria-controls', 'drawer-first');
    await view.setProps({ id: 'drawer-next' });
    expect(screen.getByRole('dialog')).toBe(popup);
    await waitFor(() => expect(trigger).toHaveAttribute('aria-controls', 'drawer-next'));
  });
  for (const defaultPoint of [undefined, '300px']) sourceCase({ source, case: defaultPoint === undefined ? 'resets the active snap point when closing' : 'resets to the default snap point when provided', environment: 'jsdom' }, async () => {
    const snapChange = vi.fn();
    const openChange = vi.fn();
    const view = await render(() => <Drawer.Root defaultOpen onOpenChange={openChange} snapPoints={['100px', '300px', 1]} defaultSnapPoint={defaultPoint} snapPoint={1} onSnapPointChange={snapChange}><Drawer.Portal><Drawer.Viewport><Drawer.Popup><Drawer.Close>Close</Drawer.Close></Drawer.Popup></Drawer.Viewport></Drawer.Portal></Drawer.Root>);
    await view.user.click(screen.getByRole('button', { name: 'Close' }));
    expect(openChange).toHaveBeenCalledWith(false, expect.objectContaining({ reason: 'close-press' }));
    expect(snapChange).toHaveBeenCalledWith(defaultPoint ?? '100px', expect.objectContaining({ reason: 'close-press', isCanceled: false }));
  });
  sourceCase({ source, case: 'does not reset snap point when a close is canceled', environment: 'jsdom' }, async () => {
    const snapChange = vi.fn();
    const view = await render(() => <Drawer.Root defaultOpen snapPoints={['100px', 1]} defaultSnapPoint={1} onOpenChange={(_, details) => details.cancel()} onSnapPointChange={snapChange}><SnapProbe /><Drawer.Portal><Drawer.Viewport><Drawer.Popup><Drawer.Close>Close</Drawer.Close></Drawer.Popup></Drawer.Viewport></Drawer.Portal></Drawer.Root>);
    await view.user.click(screen.getByRole('button', { name: 'Close' }));
    expect(snapChange).not.toHaveBeenCalled(); expect(view.getByTestId('snap')).toHaveTextContent('1'); expect(screen.getByRole('dialog')).toBeVisible();
  });
  sourceCase({ source, case: 'honors canceled snap point changes and falls back from invalid uncontrolled values', environment: 'jsdom' }, async () => {
    function Controls() {
      const context = useDrawerRootContext();
      return <><SnapProbe /><button onClick={() => context.setActiveSnapPoint('300px')}>change</button><button onClick={() => context.setActiveSnapPoint('invalid')}>invalid</button></>;
    }
    const view = await renderProps((props: { cancel: boolean }) => <Drawer.Root snapPoints={['100px', '300px']} onSnapPointChange={(_, details) => { if (props.cancel) details.cancel(); }}><Controls /></Drawer.Root>, { cancel: true });
    await view.user.click(view.getByText('change')); expect(view.getByTestId('snap')).toHaveTextContent('100px');
    await view.setProps({ cancel: false }); await view.user.click(view.getByText('change')); expect(view.getByTestId('snap')).toHaveTextContent('300px');
    await view.user.click(view.getByText('invalid')); expect(view.getByTestId('snap')).toHaveTextContent('100px');
  });
  sourceCase({ source, case: 'attaches fresh root state when a handle-backed root remounts', environment: 'jsdom' }, async () => {
    const handle = Drawer.createHandle();
    const view = await render(() => {
      const [show, setShow] = createSignal(true);
      return <><button onClick={() => setShow(value => !value)}>mount</button><Drawer.Trigger handle={handle}>Open</Drawer.Trigger><Show when={show()}><Drawer.Root handle={handle} defaultSnapPoint="300px" snapPoints={['100px', '300px']}><SnapProbe /><Drawer.Portal><Drawer.Viewport><Drawer.Popup><Drawer.Close>Close</Drawer.Close></Drawer.Popup></Drawer.Viewport></Drawer.Portal></Drawer.Root></Show></>;
    });
    await view.user.click(view.getByRole('button', { name: 'Open' })); await view.user.click(screen.getByRole('button', { name: 'Close' }));
    await view.user.click(view.getByText('mount')); await view.user.click(view.getByText('mount'));
    expect(view.getByTestId('snap')).toHaveTextContent('300px');
    await view.user.click(view.getByRole('button', { name: 'Open' })); expect(screen.getByRole('dialog')).toBeVisible();
  });
  it('uses the fresh open callback after live prop replacement', async () => {
    const first = vi.fn(), second = vi.fn();
    const view = await renderProps((props: { onOpenChange: (open: boolean) => void }) => <Drawer.Root onOpenChange={props.onOpenChange}><Drawer.Trigger>Open</Drawer.Trigger></Drawer.Root>, { onOpenChange: first });
    const node = view.getByRole('button'); await view.setProps({ onOpenChange: second });
    expect(view.getByRole('button')).toBe(node); await view.user.click(node); expect(first).not.toHaveBeenCalled(); expect(second).toHaveBeenCalledWith(true, expect.any(Object));
  });
  it('preserves the source default snap after canceled and invalid context requests', async () => {
    const changed = vi.fn((point, details) => { if (point === '100px') details.cancel(); });
    function Controls() {
      const context = useDrawerRootContext();
      return <><SnapProbe /><button onClick={() => context.setActiveSnapPoint('100px')}>Cancel snap</button>
        <button onClick={() => context.setActiveSnapPoint(999)}>Invalid snap</button></>;
    }
    const view = await render(() => <Drawer.Root defaultSnapPoint="300px" snapPoints={['100px', '300px']} onSnapPointChange={changed}><Controls /></Drawer.Root>);
    expect(view.getByTestId('snap').textContent).toBe('300px');
    await view.user.click(view.getByText('Cancel snap'));
    expect(view.getByTestId('snap').textContent).toBe('300px');
    await view.user.click(view.getByText('Invalid snap'));
    expect(view.getByTestId('snap').textContent).toBe('300px');
    expect(changed).toHaveBeenLastCalledWith(999, expect.objectContaining({ reason: 'none' }));
  });
});
