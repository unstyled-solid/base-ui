import { createSignal, onCleanup } from 'solid-js';
import { screen, waitFor } from '@testing-library/dom';
import { describe, expect, it, vi } from 'vitest';
import { createRenderer } from '../../test';
import { AlertDialog } from './index';
import { Dialog } from '../dialog';
import { useDialogRootContext } from '../dialog/root/DialogRootContext';

// Pinned React AlertDialogRoot.test.tsx: ARIA, callbacks, actionsRef, handle actions.
// DialogPopup.test.tsx: initial/final focus. DialogRoot.test.tsx: nested dialogs.
describe('AlertDialog real Dialog lifecycle', () => {
  const { render, renderProps } = createRenderer();

  function Mode() {
    const store = useDialogRootContext();
    return <div data-testid="mode" data-modal={String(store.state.modal)}
      data-pointer-disabled={String(store.state.disablePointerDismissal)} data-role={store.state.role} />;
  }

  it.each([false, true])('enforces alert mode even with runtime overrides (handle=%s)', async (detached) => {
    const handle = detached ? AlertDialog.createHandle() : undefined;
    // Untyped JS callers can pass these props; mode enforcement must still win.
    const overrides = { modal: false, disablePointerDismissal: false };
    const view = await render(() => <AlertDialog.Root {...overrides} handle={handle} defaultOpen>
      <Mode />
      <AlertDialog.Portal><AlertDialog.Popup>Content</AlertDialog.Popup></AlertDialog.Portal>
    </AlertDialog.Root>);
    expect(view.getByTestId('mode')).toHaveAttribute('data-modal', 'true');
    expect(view.getByTestId('mode')).toHaveAttribute('data-pointer-disabled', 'true');
    expect(view.getByTestId('mode')).toHaveAttribute('data-role', 'alertdialog');
    expect(screen.getByRole('alertdialog')).toHaveAttribute('data-open');
    await view.user.click(screen.getByRole('presentation', { hidden: true }));
    expect(screen.getByRole('alertdialog')).toHaveAttribute('data-open');
    if (handle) expect(handle.isOpen).toBe(true);
  });

  it('synchronizes controlled triggerId changes without replacing popup or triggers', async () => {
    const view = await renderProps((props: { triggerId: string }) => <AlertDialog.Root open triggerId={props.triggerId}>
      <AlertDialog.Trigger id="first">First</AlertDialog.Trigger>
      <AlertDialog.Trigger id="second">Second</AlertDialog.Trigger>
      <AlertDialog.Portal><AlertDialog.Popup>Content</AlertDialog.Popup></AlertDialog.Portal>
    </AlertDialog.Root>, { triggerId: 'second' });
    const first = screen.getByText('First');
    const second = screen.getByText('Second');
    const popup = screen.getByRole('alertdialog');
    expect(first).toHaveAttribute('aria-expanded', 'false');
    expect(first).not.toHaveAttribute('aria-controls');
    expect(second).toHaveAttribute('aria-expanded', 'true');
    expect(second).toHaveAttribute('aria-controls', popup.id);
    await view.setProps({ triggerId: 'first' });
    expect(screen.getByRole('alertdialog')).toBe(popup);
    expect(screen.getByText('First')).toBe(first);
    expect(screen.getByText('Second')).toBe(second);
    expect(first).toHaveAttribute('aria-expanded', 'true');
    expect(first).toHaveAttribute('aria-controls', popup.id);
    expect(second).toHaveAttribute('aria-expanded', 'false');
    expect(second).not.toHaveAttribute('aria-controls');
  });

  it('detached trigger opening enforces alert mode and internal backdrop does not dismiss', async () => {
    const handle = AlertDialog.createHandle();
    const change = vi.fn();
    const view = await render(() => <>
      <AlertDialog.Trigger handle={handle}>Open</AlertDialog.Trigger>
      <AlertDialog.Root handle={handle} onOpenChange={change}><Mode />
        <AlertDialog.Portal><AlertDialog.Popup>Content</AlertDialog.Popup></AlertDialog.Portal>
      </AlertDialog.Root>
    </>);
    expect(view.getByTestId('mode')).toHaveAttribute('data-modal', 'true');
    expect(view.getByTestId('mode')).toHaveAttribute('data-pointer-disabled', 'true');
    expect(view.getByTestId('mode')).toHaveAttribute('data-role', 'alertdialog');
    await view.user.click(screen.getByText('Open'));
    const popup = await screen.findByRole('alertdialog');
    expect(handle.isOpen).toBe(true);
    change.mockClear();
    await view.user.click(screen.getByRole('presentation', { hidden: true }));
    expect(screen.getByRole('alertdialog')).toBe(popup);
    expect(handle.isOpen).toBe(true);
    expect(change).not.toHaveBeenCalled();
  });

  it('static Content imperative handle open and close preserves trigger ARIA', async () => {
    const handle = AlertDialog.createHandle();
    await render(() => <>
      <AlertDialog.Trigger id="trigger" handle={handle}>Trigger</AlertDialog.Trigger>
      <AlertDialog.Root handle={handle}><AlertDialog.Portal>
        <AlertDialog.Popup data-testid="content">Content</AlertDialog.Popup>
      </AlertDialog.Portal></AlertDialog.Root>
    </>);
    const trigger = screen.getByRole('button', { name: 'Trigger' });
    expect(screen.queryByRole('alertdialog')).toBeNull();
    handle.open('trigger');
    await screen.findByRole('alertdialog');
    expect(screen.getByTestId('content').textContent).toBe('Content');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    handle.close();
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('eventually synchronizes live popup IDs to active trigger ARIA', async () => {
    const view = await renderProps((props: { id: string }) => <AlertDialog.Root defaultOpen defaultTriggerId="id-trigger">
      <AlertDialog.Trigger id="id-trigger">Open</AlertDialog.Trigger>
      <AlertDialog.Portal><AlertDialog.Popup id={props.id}>Content</AlertDialog.Popup></AlertDialog.Portal>
    </AlertDialog.Root>, { id: 'before-id' });
    const trigger = screen.getByText('Open');
    const popup = screen.getByRole('alertdialog');
    expect(trigger).toHaveAttribute('aria-controls', 'before-id');
    await view.setProps({ id: 'after-id' });
    // IDs propagate through owned staged effects; await observable completion.
    await waitFor(() => expect(trigger).toHaveAttribute('aria-controls', 'after-id'));
    expect(screen.getByRole('alertdialog')).toBe(popup);
    expect(popup).toHaveAttribute('id', 'after-id');
  });

  it('reports native events, reasons and the opening trigger for explicit close', async () => {
    const change = vi.fn<(open: boolean, details: AlertDialog.Root.ChangeEventDetails) => void>();
    const view = await render(() => <AlertDialog.Root onOpenChange={change}>
      <AlertDialog.Trigger id="event-trigger">Open</AlertDialog.Trigger>
      <AlertDialog.Portal><AlertDialog.Popup><AlertDialog.Close>Close</AlertDialog.Close></AlertDialog.Popup></AlertDialog.Portal>
    </AlertDialog.Root>);
    expect(change).not.toHaveBeenCalled();
    const trigger = screen.getByText('Open');
    await view.user.click(trigger);
    expect(change).toHaveBeenCalledTimes(1);
    expect(change.mock.calls[0][0]).toBe(true);
    expect(change.mock.calls[0][1]).toMatchObject({ reason: 'trigger-press', trigger });
    expect(change.mock.calls[0][1].trigger?.id).toBe('event-trigger');
    expect(change.mock.calls[0][1].event).toBeInstanceOf(MouseEvent);
    await view.user.click(screen.getByText('Close'));
    expect(change).toHaveBeenCalledTimes(2);
    expect(change.mock.calls[1][0]).toBe(false);
    expect(change.mock.calls[1][1]).toMatchObject({ reason: 'close-press', trigger });
    expect(change.mock.calls[1][1].trigger?.id).toBe('event-trigger');
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
  });

  it('cancels opening and Escape closing without changing handle or trigger state', async () => {
    const handle = AlertDialog.createHandle();
    const cancel = vi.fn((_open: boolean, details: AlertDialog.Root.ChangeEventDetails) => details.cancel());
    const accept = vi.fn();
    const view = await renderProps((props: { change: AlertDialog.Root.Props['onOpenChange'] }) => <>
      <AlertDialog.Trigger handle={handle} id="cancel-trigger">Open</AlertDialog.Trigger>
      <AlertDialog.Root handle={handle} onOpenChange={props.change}>
        <AlertDialog.Portal><AlertDialog.Popup>Content</AlertDialog.Popup></AlertDialog.Portal>
      </AlertDialog.Root>
    </>, { change: cancel });
    const trigger = screen.getByText('Open');
    await view.user.click(trigger);
    expect(cancel).toHaveBeenCalledOnce();
    expect(screen.queryByRole('alertdialog')).toBeNull();
    expect(handle.isOpen).toBe(false);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).not.toHaveAttribute('data-popup-open');
    await view.setProps({ change: accept });
    await view.user.click(trigger);
    const popup = screen.getByRole('alertdialog');
    await view.setProps({ change: cancel });
    await view.user.keyboard('[Escape]');
    expect(cancel.mock.lastCall?.[1].reason).toBe('escape-key');
    expect(cancel.mock.lastCall?.[1].event).toBeInstanceOf(KeyboardEvent);
    expect(screen.getByRole('alertdialog')).toBe(popup);
    expect(handle.isOpen).toBe(true);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(trigger).toHaveAttribute('data-popup-open');
  });

  it('controlled close veto preserves popup, trigger attributes and handle after accepted opening', async () => {
    const handle = AlertDialog.createHandle();
    const view = await render(() => {
      const [open, setOpen] = createSignal(false);
      return <AlertDialog.Root handle={handle} open={open()} onOpenChange={(next) => {
        if (next) setOpen(true);
      }}>
        <AlertDialog.Trigger>Open</AlertDialog.Trigger>
        <AlertDialog.Portal><AlertDialog.Popup>
          <AlertDialog.Title>Confirm</AlertDialog.Title><AlertDialog.Close>Cancel</AlertDialog.Close>
        </AlertDialog.Popup></AlertDialog.Portal>
      </AlertDialog.Root>;
    });
    const trigger = screen.getByText('Open');
    await view.user.click(trigger);
    const popup = await screen.findByRole('alertdialog');
    expect(trigger).toHaveAttribute('data-popup-open');
    expect(handle.isOpen).toBe(true);
    await view.user.click(screen.getByText('Cancel'));
    expect(screen.getByRole('alertdialog')).toBe(popup);
    expect(popup).toHaveAttribute('data-open');
    expect(trigger).toHaveAttribute('aria-controls', popup.id);
    expect(trigger).toHaveAttribute('data-popup-open');
    expect(handle.isOpen).toBe(true);
  });

  it('synchronizes an initially open handle with a trigger inside Root', async () => {
    const handle = AlertDialog.createHandle();
    await render(() => <AlertDialog.Root handle={handle} defaultOpen defaultTriggerId="internal-default">
      <AlertDialog.Trigger id="internal-default">Open</AlertDialog.Trigger>
      <AlertDialog.Portal><AlertDialog.Popup>Content</AlertDialog.Popup></AlertDialog.Portal>
    </AlertDialog.Root>);
    expect(screen.getByText('Open')).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Open')).toHaveAttribute('aria-controls', screen.getByRole('alertdialog').id);
    expect(handle.isOpen).toBe(true);
  });

  it('render callback preserves alertdialog semantics and live state on the same host', async () => {
    const view = await renderProps((props: { title: string }) => <AlertDialog.Root defaultOpen>
      <AlertDialog.Portal><AlertDialog.Popup render={(elementProps, state) =>
        <div {...elementProps} data-render-open={String(state.open)} data-testid="render-popup" />}>
        <AlertDialog.Title>{props.title}</AlertDialog.Title>
        <AlertDialog.Close>Close</AlertDialog.Close>
      </AlertDialog.Popup></AlertDialog.Portal>
    </AlertDialog.Root>, { title: 'Before' });
    const popup = screen.getByRole('alertdialog');
    expect(popup).toHaveAttribute('data-render-open', 'true');
    expect(popup).toHaveAccessibleName('Before');
    await view.setProps({ title: 'After' });
    expect(screen.getByRole('alertdialog')).toBe(popup);
    expect(popup).toHaveAccessibleName('After');
    await view.user.click(screen.getByText('Close'));
    await waitFor(() => expect(screen.queryByTestId('render-popup')).toBeNull());
  });

  it('moves initial focus inside and returns focus to the trigger', async () => {
    const view = await render(() => <AlertDialog.Root>
      <AlertDialog.Trigger>Open</AlertDialog.Trigger>
      <AlertDialog.Portal><AlertDialog.Popup>
        <input aria-label="First input" /><AlertDialog.Close>Close</AlertDialog.Close>
      </AlertDialog.Popup></AlertDialog.Portal>
    </AlertDialog.Root>);
    const trigger = screen.getByText('Open');
    await view.user.click(trigger);
    await waitFor(() => expect(screen.getByRole('textbox', { name: 'First input' })).toHaveFocus());
    await view.user.click(screen.getByText('Close'));
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it('supports function initialFocus and finalFocus with actual Dialog focus management', async () => {
    let input: HTMLInputElement | undefined;
    let final: HTMLButtonElement | undefined;
    const view = await render(() => <>
      <button ref={(node) => { final = node; }}>Final target</button>
      <AlertDialog.Root><AlertDialog.Trigger>Open</AlertDialog.Trigger>
        <AlertDialog.Portal><AlertDialog.Popup initialFocus={() => input} finalFocus={() => final}>
          <button>First target</button><input ref={(node) => { input = node; }} aria-label="Initial target" />
          <AlertDialog.Close>Close</AlertDialog.Close>
        </AlertDialog.Popup></AlertDialog.Portal>
      </AlertDialog.Root>
    </>);
    await view.user.click(screen.getByText('Open'));
    await waitFor(() => expect(input).toHaveFocus());
    await view.user.click(screen.getByText('Close'));
    await waitFor(() => expect(final).toHaveFocus());
  });

  it.each([false, true])('manual unmount ends closing and clears retention (keepMounted=%s)', async (keepMounted) => {
    const actionsRef: { current: AlertDialog.Root.Actions | null } = { current: null };
    let preventOnce = true;
    const view = await render(() => <AlertDialog.Root actionsRef={actionsRef} onOpenChange={(open, details) => {
      if (!open && preventOnce) { preventOnce = false; details.preventUnmountOnClose(); }
    }}>
      <AlertDialog.Trigger>Open</AlertDialog.Trigger>
      <AlertDialog.Portal keepMounted={keepMounted}><AlertDialog.Popup data-testid="manual-popup">
        <AlertDialog.Close>Close</AlertDialog.Close>
      </AlertDialog.Popup></AlertDialog.Portal>
    </AlertDialog.Root>);
    await view.user.click(screen.getByText('Open'));
    const popup = screen.getByRole('alertdialog');
    await view.user.click(screen.getByText('Close'));
    expect(popup).toBeInTheDocument();
    expect(popup).toHaveAttribute('data-closed');
    actionsRef.current!.unmount();
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    if (keepMounted) expect(screen.getByTestId('manual-popup')).toHaveAttribute('hidden');
    else expect(screen.queryByTestId('manual-popup')).toBeNull();
    await view.user.click(screen.getByText('Open'));
    await screen.findByRole('alertdialog');
    await view.user.click(screen.getByText('Close'));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    view.unmount();
    expect(actionsRef.current).toBeNull();
  });

  it('actions close reports imperative-action and releases the popup', async () => {
    const actionsRef: { current: AlertDialog.Root.Actions | null } = { current: null };
    const change = vi.fn();
    await render(() => <AlertDialog.Root defaultOpen actionsRef={actionsRef} onOpenChange={change}>
      <AlertDialog.Portal><AlertDialog.Popup>Content</AlertDialog.Popup></AlertDialog.Portal>
    </AlertDialog.Root>);
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    actionsRef.current!.close();
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    expect(change).toHaveBeenCalledOnce();
    expect(change.mock.calls[0][0]).toBe(false);
    expect(change.mock.calls[0][1].reason).toBe('imperative-action');
  });

  it('retains a same-trigger toggle close until actions unmount is called', async () => {
    const actionsRef: { current: AlertDialog.Root.Actions | null } = { current: null };
    const view = await render(() => <AlertDialog.Root actionsRef={actionsRef} onOpenChange={(open, details) => {
      if (!open) details.preventUnmountOnClose();
    }}>
      <AlertDialog.Trigger>Open</AlertDialog.Trigger>
      <AlertDialog.Portal><AlertDialog.Popup /></AlertDialog.Portal>
    </AlertDialog.Root>);
    const trigger = screen.getByText('Open');
    await view.user.click(trigger);
    const popup = await screen.findByRole('alertdialog');
    await view.user.click(trigger);
    expect(screen.getByRole('alertdialog')).toBe(popup);
    expect(popup).toHaveAttribute('data-closed');
    actionsRef.current!.unmount();
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
  });

  // React popupStoreUtils.test.tsx: opening clears previous unmount prevention.
  it('reopening interrupts retained closing and resets manual unmount prevention', async () => {
    let retain = true;
    const actionsRef: { current: AlertDialog.Root.Actions | null } = { current: null };
    const view = await render(() => <AlertDialog.Root actionsRef={actionsRef} onOpenChange={(open, details) => {
      if (!open && retain) { retain = false; details.preventUnmountOnClose(); }
    }}>
      <AlertDialog.Trigger>Open</AlertDialog.Trigger>
      <AlertDialog.Portal><AlertDialog.Popup><AlertDialog.Close>Close</AlertDialog.Close></AlertDialog.Popup></AlertDialog.Portal>
    </AlertDialog.Root>);
    const trigger = screen.getByText('Open');
    await view.user.click(trigger);
    const popup = screen.getByRole('alertdialog');
    await view.user.click(screen.getByText('Close'));
    expect(popup).toHaveAttribute('data-closed');
    await view.user.click(trigger);
    expect(screen.getByRole('alertdialog')).toBe(popup);
    expect(popup).toHaveAttribute('data-open');
    await view.user.click(screen.getByText('Close'));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    // Calling unmount again after automatic completion cannot resurrect the popup.
    actionsRef.current!.unmount();
    expect(screen.queryByRole('alertdialog')).toBeNull();
  });

  it('handle.open selects trigger payload; openWithPayload has no active trigger', async () => {
    const handle = AlertDialog.createHandle<number>();
    const view = await render(() => <>
      <AlertDialog.Trigger handle={handle} id="payload-one" payload={1}>First</AlertDialog.Trigger>
      <AlertDialog.Trigger handle={handle} id="payload-two" payload={2}>Second</AlertDialog.Trigger>
      <AlertDialog.Root handle={handle}>{(state) => <AlertDialog.Portal>
        <AlertDialog.Popup data-testid="payload-popup">{state.payload}</AlertDialog.Popup>
      </AlertDialog.Portal>}</AlertDialog.Root>
    </>);
    expect(screen.queryByRole('alertdialog')).toBeNull();
    handle.open('payload-two');
    await waitFor(() => expect(screen.getByTestId('payload-popup').textContent).toBe('2'));
    expect(view.getByText('Second')).toHaveAttribute('aria-expanded', 'true');
    expect(view.getByText('First')).toHaveAttribute('aria-expanded', 'false');
    handle.close();
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    expect(view.getByText('Second')).toHaveAttribute('aria-expanded', 'false');
    handle.openWithPayload(8);
    await waitFor(() => expect(screen.getByTestId('payload-popup').textContent).toBe('8'));
    expect(view.getByText('First')).toHaveAttribute('aria-expanded', 'false');
    expect(view.getByText('Second')).toHaveAttribute('aria-expanded', 'false');
    handle.close();
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
  });

  it('keeps root state and popup identity when the handle is recreated', async () => {
    const first = AlertDialog.createHandle();
    const next = AlertDialog.createHandle();
    const view = await renderProps((props: { handle: AlertDialog.Handle<unknown> }) => <>
      <AlertDialog.Trigger handle={props.handle} id="live-handle">Open</AlertDialog.Trigger>
      <AlertDialog.Root handle={props.handle}><AlertDialog.Portal>
        <AlertDialog.Popup><AlertDialog.Close>Close</AlertDialog.Close></AlertDialog.Popup>
      </AlertDialog.Portal></AlertDialog.Root>
    </>, { handle: first });
    const trigger = screen.getByText('Open');
    await view.user.click(trigger);
    const popup = screen.getByRole('alertdialog');
    await view.setProps({ handle: next });
    expect(screen.getByRole('alertdialog')).toBe(popup);
    expect(screen.getByText('Open')).toBe(trigger);
    expect(first.isOpen).toBe(false);
    expect(next.isOpen).toBe(true);
    expect(trigger).toHaveAttribute('aria-controls', popup.id);
    await view.user.click(screen.getByText('Close'));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    await view.user.click(trigger);
    expect(screen.getByRole('alertdialog')).toHaveAttribute('data-open');
  });

  it('remounts a fresh alert root after disposing an open handle-backed root', async () => {
    const handle = AlertDialog.createHandle();
    const view = await render(() => {
      const [mounted, setMounted] = createSignal(true);
      return <>
        <AlertDialog.Trigger handle={handle} id="remount-trigger">Open</AlertDialog.Trigger>
        {!mounted() && <button onClick={() => setMounted(true)}>Remount root</button>}
        {mounted() && <AlertDialog.Root handle={handle}><AlertDialog.Portal>
          <AlertDialog.Popup><button onClick={() => setMounted(false)}>Unmount root</button></AlertDialog.Popup>
        </AlertDialog.Portal></AlertDialog.Root>}
      </>;
    });
    const trigger = screen.getByText('Open');
    await view.user.click(trigger);
    expect(trigger).toHaveAttribute('aria-controls', screen.getByRole('alertdialog').id);
    await view.user.click(screen.getByText('Unmount root'));
    expect(screen.queryByRole('alertdialog')).toBeNull();
    expect(handle.isOpen).toBe(false);
    await view.user.click(screen.getByText('Remount root'));
    expect(screen.queryByRole('alertdialog')).toBeNull();
    await view.user.click(trigger);
    expect(trigger).toHaveAttribute('aria-controls', screen.getByRole('alertdialog').id);
    await view.user.click(screen.getByRole('presentation', { hidden: true }));
    expect(handle.isOpen).toBe(true);
    expect(screen.getByRole('alertdialog')).toHaveAttribute('data-open');
  });

  it('nested alert counts and Escape dismissal leave the real Dialog parent open', async () => {
    const parentChange = vi.fn();
    const view = await render(() => <Dialog.Root defaultOpen onOpenChange={parentChange}>
      <Dialog.Portal><Dialog.Popup data-testid="parent">
        <AlertDialog.Root><AlertDialog.Trigger>Open nested</AlertDialog.Trigger>
          <AlertDialog.Portal><AlertDialog.Popup data-testid="nested">
            <AlertDialog.Close>Close nested</AlertDialog.Close>
          </AlertDialog.Popup></AlertDialog.Portal>
        </AlertDialog.Root>
      </Dialog.Popup></Dialog.Portal>
    </Dialog.Root>);
    const parent = screen.getByTestId('parent');
    await view.user.click(screen.getByText('Open nested'));
    expect(screen.getByRole('alertdialog')).toHaveAttribute('data-nested');
    expect(parent).toHaveAttribute('data-nested-dialog-open');
    expect(parent.style.getPropertyValue('--nested-dialogs')).toBe('1');
    await view.user.keyboard('[Escape]');
    await waitFor(() => expect(screen.queryByTestId('nested')).toBeNull());
    expect(parent).toHaveAttribute('data-open');
    expect(parent).not.toHaveAttribute('data-nested-dialog-open');
    expect(parent.style.getPropertyValue('--nested-dialogs')).toBe('0');
    expect(parentChange).not.toHaveBeenCalled();
  });

  it('keeps the initially-open detached Close through pointer release and controlled veto', async () => {
    const handle = AlertDialog.createHandle();
    const changed = vi.fn<(open: boolean, details: AlertDialog.Root.ChangeEventDetails) => void>();
    const view = await render(() => <>
      <AlertDialog.Trigger handle={handle} id="detached-lifetime">Open</AlertDialog.Trigger>
      <AlertDialog.Root handle={handle} open triggerId="detached-lifetime" onOpenChange={changed}>
        <AlertDialog.Portal><AlertDialog.Popup><AlertDialog.Close onClick={undefined}>Close</AlertDialog.Close></AlertDialog.Popup></AlertDialog.Portal>
      </AlertDialog.Root>
    </>);
    const trigger = screen.getByText('Open');
    const popup = screen.getByRole('alertdialog');
    const close = screen.getByText('Close');
    await view.user.pointer({ target: close, keys: '[MouseLeft>]' });
    expect(screen.getByText('Close')).toBe(close);
    expect(changed).not.toHaveBeenCalled();
    await view.user.pointer({ target: close, keys: '[/MouseLeft]' });
    expect(changed).toHaveBeenCalledTimes(1);
    expect(changed.mock.calls[0]?.[0]).toBe(false);
    expect(changed.mock.calls[0]?.[1]).toMatchObject({ reason: 'close-press', trigger });
    expect(screen.getByText('Close')).toBe(close);
    expect(screen.getByRole('alertdialog')).toBe(popup);
    expect(popup).toHaveAttribute('data-open');
    expect(trigger).toHaveAttribute('aria-controls', popup.id);
    expect(handle.isOpen).toBe(true);
  });

  it('keeps nested alert root and trigger owners during native opening and closing', async () => {
    let mounts = 0;
    let disposals = 0;
    function NestedAlert() {
      mounts++;
      onCleanup(() => { disposals++; });
      return <AlertDialog.Root><AlertDialog.Trigger>Open nested</AlertDialog.Trigger>
        <AlertDialog.Portal><AlertDialog.Popup><AlertDialog.Close>Close nested</AlertDialog.Close></AlertDialog.Popup></AlertDialog.Portal>
      </AlertDialog.Root>;
    }
    const parentChange = vi.fn();
    const view = await render(() => <Dialog.Root defaultOpen onOpenChange={parentChange}>
      <Dialog.Portal><Dialog.Popup data-testid="lifetime-parent"><NestedAlert /></Dialog.Popup></Dialog.Portal>
    </Dialog.Root>);
    const parent = screen.getByTestId('lifetime-parent');
    const trigger = screen.getByText('Open nested');
    await view.user.pointer({ target: trigger, keys: '[MouseLeft>]' });
    expect(screen.getByText('Open nested')).toBe(trigger);
    expect(mounts).toBe(1);
    expect(disposals).toBe(0);
    await view.user.pointer({ target: trigger, keys: '[/MouseLeft]' });
    expect(screen.getByRole('alertdialog')).toHaveAttribute('data-nested');
    expect(screen.getByTestId('lifetime-parent')).toBe(parent);
    expect(parent.style.getPropertyValue('--nested-dialogs')).toBe('1');
    await view.user.click(screen.getByText('Close nested'));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    expect(screen.getByText('Open nested')).toBe(trigger);
    expect(parent.style.getPropertyValue('--nested-dialogs')).toBe('0');
    expect(mounts).toBe(1);
    expect(disposals).toBe(0);
    expect(parentChange).not.toHaveBeenCalled();
    view.unmount();
    expect(disposals).toBe(1);
  });
});
