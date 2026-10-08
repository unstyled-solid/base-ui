import { describe, expect, it, vi } from 'vitest';
import { createSignal, flush, onSettled, untrack } from 'solid-js';
import { createRenderer, screen, waitFor, expectDiagnostic } from '../../../test';
import { Popover } from '../index';

describe('Popover detached handles', () => {
  const { render, renderProps } = createRenderer();
  function Popup() {
    return <Popover.Portal><Popover.Positioner data-testid="positioner"><Popover.Popup data-testid="popup">
      <Popover.Close>Close</Popover.Close>
    </Popover.Popup></Popover.Positioner></Popover.Portal>;
  }

  it('attaches before descendant settled work opens a registered trigger', async () => {
    const handle = Popover.createHandle();
    function Open() { onSettled(() => { handle.open('trigger'); }); return null; }
    await render(() => <Popover.Root handle={handle}><Popover.Trigger id="trigger">Toggle</Popover.Trigger><Open /><Popup /></Popover.Root>);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Toggle' })).toHaveAttribute('aria-expanded', 'true'));
    expect(untrack(() => handle.isOpen)).toBe(true);
  });

  it('publishes live isOpen when a root attaches and detaches without an open transaction', async () => {
    const handle = Popover.createHandle();
    const view = await renderProps((props: { mounted: boolean }) => <>
      <output>{String(handle.isOpen)}</output>
      {props.mounted && <Popover.Root handle={handle} defaultOpen />}
    </>, { mounted: false });
    expect(screen.getByRole('status')).toHaveTextContent('false');
    await view.setProps({ mounted: true });
    expect(screen.getByRole('status')).toHaveTextContent('true');
    await view.setProps({ mounted: false });
    expect(screen.getByRole('status')).toHaveTextContent('false');
  });

  it.each(['before', 'after'] as const)('migrates a detached trigger declared %s its root without ref churn', async (order) => {
    const handle = Popover.createHandle<number>();
    const fallback = untrack(() => handle.store);
    const refs: HTMLElement[] = [];
    const view = await render(() => <>
      {order === 'before' && <Popover.Trigger handle={handle} id="trigger" payload={42} ref={(node) => { refs.push(node); }}>Toggle</Popover.Trigger>}
      <Popover.Root handle={handle}>{(state) => <><output>{state.payload ?? 'none'}</output><Popup /></>}</Popover.Root>
      {order === 'after' && <Popover.Trigger handle={handle} id="trigger" payload={42} ref={(node) => { refs.push(node); }}>Toggle</Popover.Trigger>}
    </>);
    const trigger = screen.getByRole('button', { name: 'Toggle' });
    expect(refs).toEqual([trigger]);
    expect(fallback.context.triggerElements.size).toBe(0);
    expect(untrack(() => handle.store.context.triggerElements.getById('trigger'))).toBe(trigger);
    await view.user.click(trigger);
    expect(screen.getByRole('status')).toHaveTextContent('42');
  });

  it('preserves root state when the handle is replaced and gives a remounted root fresh state', async () => {
    const a = Popover.createHandle<number>();
    const b = Popover.createHandle<number>();
    const view = await renderProps((props: { handle: Popover.Handle<number>; mounted: boolean }) => <>
      <Popover.Trigger handle={props.handle} id="trigger" payload={7}>Toggle</Popover.Trigger>
      {props.mounted && <Popover.Root handle={props.handle}>{(state) => <><output>{state.payload ?? 'none'}</output><Popup /></>}</Popover.Root>}
    </>, { handle: a, mounted: true });
    await view.user.click(screen.getByRole('button', { name: 'Toggle' }));
    const popup = screen.getByTestId('popup');
    await view.setProps({ handle: b });
    expect(untrack(() => a.isOpen)).toBe(false);
    expect(untrack(() => b.isOpen)).toBe(true);
    expect(screen.getByTestId('popup')).toBe(popup);
    expect(screen.getByRole('status')).toHaveTextContent('7');
    await view.setProps({ mounted: false });
    expect(untrack(() => b.isOpen)).toBe(false);
    await view.setProps({ mounted: true });
    expect(untrack(() => b.isOpen)).toBe(false);
    expect(screen.getByRole('status')).toHaveTextContent('none');
  });

  it('keeps the popup and positioner nodes while trigger payload and ARIA ownership change', async () => {
    const handle = Popover.createHandle<number>();
    const view = await render(() => <>
      <Popover.Trigger handle={handle} id="one" payload={1}>One</Popover.Trigger>
      <Popover.Trigger handle={handle} id="two" payload={2}>Two</Popover.Trigger>
      <Popover.Root handle={handle}>{(state) => <><output>{state.payload}</output><Popup /></>}</Popover.Root>
    </>);
    await view.user.click(screen.getByRole('button', { name: 'One' }));
    const popup = screen.getByTestId('popup');
    const positioner = screen.getByTestId('positioner');
    await view.user.click(screen.getByRole('button', { name: 'Two' }));
    expect(screen.getByTestId('popup')).toBe(popup);
    expect(screen.getByTestId('positioner')).toBe(positioner);
    expect(screen.getByRole('status')).toHaveTextContent('2');
    expect(screen.getByRole('button', { name: 'One' })).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByRole('button', { name: 'Two' })).toHaveAttribute('aria-controls', popup.id);
  });

  it.each([false, true])('controlled open=%s vetoes imperative changes without lying through isOpen', async (open) => {
    const handle = Popover.createHandle();
    const changed = vi.fn();
    await render(() => <Popover.Root handle={handle} open={open} onOpenChange={changed}>
      <Popover.Trigger id="trigger">Toggle</Popover.Trigger><Popup />
    </Popover.Root>);
    if (open) handle.close(); else handle.open('trigger');
    flush();
    expect(changed).toHaveBeenCalledWith(!open, expect.objectContaining({ reason: 'imperative-action' }));
    expect(untrack(() => handle.isOpen)).toBe(open);
  });

  it('throws for an invalid trigger while attached', async () => {
    const handle = Popover.createHandle();
    await render(() => <Popover.Root handle={handle}><Popover.Trigger id="valid">Toggle</Popover.Trigger></Popover.Root>);
    expect(() => handle.open('missing')).toThrow('was called with the trigger id "missing"');
    expect(untrack(() => handle.isOpen)).toBe(false);
  });

  it('warns and ignores calls before attachment and after disposal', async () => {
    const handle = Popover.createHandle();
    await expectDiagnostic({ message: /no root using this handle is mounted/ }, () => handle.open('trigger'));
    const view = await render(() => <Popover.Root handle={handle}><Popover.Trigger id="trigger">Toggle</Popover.Trigger></Popover.Root>);
    view.unmount();
    await expectDiagnostic({ message: /no root using this handle is mounted/ }, () => handle.close());
    expect(untrack(() => handle.isOpen)).toBe(false);
  });

  it('updates a registered payload without recreating its trigger', async () => {
    const handle = Popover.createHandle<number>();
    const view = await renderProps((props: { payload: number }) => <>
      <Popover.Trigger id="trigger" handle={handle} payload={props.payload}>Toggle</Popover.Trigger>
      <Popover.Root defaultOpen defaultTriggerId="trigger" handle={handle}>{(state) => <output>{state.payload}</output>}</Popover.Root>
    </>, { payload: 1 });
    const trigger = screen.getByRole('button', { name: 'Toggle' });
    await view.setProps({ payload: 2 });
    expect(screen.getByRole('button', { name: 'Toggle' })).toBe(trigger);
    expect(screen.getByRole('status')).toHaveTextContent('2');
  });

  it('reports the retained active element when a controlled trigger ID is temporarily unregistered', async () => {
    const changed = vi.fn();
    let repoint!: () => void;
    const view = await render(() => {
      const [id, setId] = createSignal('trigger'); repoint = () => { setId('missing'); };
      return <Popover.Root open triggerId={id()} onOpenChange={changed}>
        <Popover.Trigger id="trigger">Toggle</Popover.Trigger><Popup />
      </Popover.Root>;
    });
    repoint(); flush();
    await view.user.click(screen.getByRole('button', { name: 'Close' }));
    expect(changed).toHaveBeenCalledWith(false, expect.objectContaining({
      reason: 'close-press', trigger: screen.getByRole('button', { name: 'Toggle' }),
    }));
  });
});
