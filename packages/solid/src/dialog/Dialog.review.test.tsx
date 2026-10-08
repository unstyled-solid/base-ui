import { describe, expect, it, vi } from 'vitest';
import { children, createSignal, onCleanup, untrack } from 'solid-js';
import { createRenderer, fireEvent, screen, waitFor } from '../../test';
import { Dialog } from './index';
import { createRenderDialogRoot } from './root/useRenderDialogRoot';
import { useDialogRootContext } from './root/DialogRootContext';

// Behavioral regressions derived from the pinned DialogRoot, detached-trigger,
// Popup and part tests. Body queries include the real shared portal hosts.
const { render, renderProps } = createRenderer();

describe('Dialog source-first review regressions', () => {
  it('forwards resolved native children as JSX while keeping payload callbacks distinct', async () => {
    const handle = Dialog.createHandle<number>();
    const arities: number[] = [];
    let setCaption!: (value: string) => void;
    const view = await render(() => {
      const [caption, set] = createSignal('Before');
      setCaption = set;
      const native = children(() => <span data-testid="native-child">{caption()}</span>);
      const forwarded = new Proxy(native, {
        apply(target, receiver, args) { arities.push(args.length); return Reflect.apply(target, receiver, args); },
      });
      return <><Dialog.Root handle={handle}>{forwarded}</Dialog.Root>
        <Dialog.Root>{(context) => <output data-testid="payload-child">{String(context.payload)}</output>}</Dialog.Root>
      </>;
    });
    const node = screen.getByTestId('native-child');
    expect(arities.length).toBeGreaterThan(0);
    expect(arities.every((arity) => arity === 0)).toBe(true);
    expect(screen.getByTestId('payload-child').textContent).toBe('undefined');
    setCaption('After');
    await waitFor(() => expect(node.textContent).toBe('After'));
    handle.openWithPayload(4);
    expect(screen.getByTestId('native-child')).toBe(node);
    view.unmount();
  });

  for (const controlled of [false, true]) {
    it(`reports the same trigger for same-turn imperative open/close (controlled=${controlled})`, async () => {
      const handle = Dialog.createHandle();
      const requests: { open: boolean; trigger: Element | undefined; reason: string }[] = [];
      await render(() => <>
        <Dialog.Trigger handle={handle} id="same-turn">Open</Dialog.Trigger>
        <Dialog.Root handle={handle} open={controlled ? false : undefined} modal={false}
          onOpenChange={(open, details) => { requests.push({ open, trigger: details.trigger, reason: details.reason }); }} />
      </>);
      const trigger = screen.getByText('Open');
      handle.open('same-turn');
      handle.close();
      expect(requests.map(({ open, reason }) => [open, reason])).toEqual([[true, 'imperative-action'], [false, 'imperative-action']]);
      expect(requests[0]?.trigger).toBe(trigger);
      expect(requests[1]?.trigger).toBe(trigger);
    });
  }

  for (const modal of [true, false, 'trap-focus'] as const) {
    it(`preserves the original Close between pointer press and release: ${modal}`, async () => {
      const changed = vi.fn((_open: boolean, details: Dialog.Root.ChangeEventDetails) => {
        details.preventUnmountOnClose();
      });
      const view = await render(() => <Dialog.Root defaultOpen modal={modal} onOpenChange={changed}>
        <Dialog.Portal><Dialog.Popup><Dialog.Close onClick={undefined}>Close</Dialog.Close></Dialog.Popup></Dialog.Portal>
      </Dialog.Root>);
      const popup = screen.getByRole('dialog');
      const close = screen.getByText('Close');
      await view.user.pointer({ target: close, keys: '[MouseLeft>]' });
      expect(screen.getByText('Close')).toBe(close);
      expect(close).toHaveProperty('isConnected', true);
      expect(screen.getByRole('dialog')).toBe(popup);
      expect(changed).not.toHaveBeenCalled();
      await view.user.pointer({ target: close, keys: '[/MouseLeft]' });
      expect(changed).toHaveBeenCalledTimes(1);
      expect(changed.mock.calls[0]?.[0]).toBe(false);
      expect(changed.mock.calls[0]?.[1].reason).toBe('close-press');
      expect(screen.getByRole('dialog')).toBe(popup);
      expect(popup).toHaveAttribute('data-closed');
      expect(screen.getByText('Close')).toBe(close);
    });
  }

  it('keeps trigger child owners when ownership and native disabled props change', async () => {
    let mounts = 0;
    let disposals = 0;
    function Caption() {
      mounts++;
      onCleanup(() => { disposals++; });
      return <span data-testid="caption">Open</span>;
    }
    const view = await renderProps((props: { disabled: boolean }) => <Dialog.Root modal={false} disablePointerDismissal>
      <Dialog.Trigger disabled={props.disabled}><Caption /></Dialog.Trigger>
      <Dialog.Portal><Dialog.Popup><Dialog.Close>Close</Dialog.Close></Dialog.Popup></Dialog.Portal>
    </Dialog.Root>, { disabled: false });
    const trigger = screen.getByRole('button', { name: 'Open' });
    const caption = screen.getByTestId('caption');
    await view.user.click(trigger);
    expect(screen.getByTestId('caption')).toBe(caption);
    await view.setProps({ disabled: true });
    expect(screen.getByTestId('caption')).toBe(caption);
    expect(trigger).toHaveAttribute('disabled');
    await view.setProps({ disabled: false });
    await view.user.click(screen.getByText('Close'));
    await view.user.click(trigger);
    expect(screen.getByTestId('caption')).toBe(caption);
    expect(mounts).toBe(1);
    expect(disposals).toBe(0);
    view.unmount();
    expect(disposals).toBe(1);
  });

  for (const modal of [true, false, 'trap-focus'] as const) {
    it(`preserves DOM labels, closing trigger and callback-before-dispatch: ${modal}`, async () => {
      const order: string[] = [];
      const closeClick = vi.fn();
      const requests: [boolean, string][] = [];
      let root!: ReturnType<typeof useDialogRootContext>;
      let closingTrigger: Element | undefined;
      function Observe() {
        root = useDialogRootContext();
        const events = root.state.floatingRootContext.events;
        const listener = () => { order.push('dispatch'); };
        events.on('openchange', listener);
        onCleanup(() => events.off('openchange', listener));
        return null;
      }
      const view = await render(() => <Dialog.Root modal={modal} onOpenChange={(open, details) => {
        order.push('callback');
        requests.push([open, details.reason]);
        if (!open) closingTrigger = details.trigger;
      }}>
        <Observe /><Dialog.Trigger>Open</Dialog.Trigger>
        <Dialog.Portal><Dialog.Viewport><Dialog.Popup>
          <Dialog.Title>Title</Dialog.Title><Dialog.Description>Description</Dialog.Description><Dialog.Close onClick={closeClick}>Close</Dialog.Close>
        </Dialog.Popup></Dialog.Viewport></Dialog.Portal>
      </Dialog.Root>);
      const trigger = screen.getByText('Open');
      await view.user.click(trigger);
      const popup = screen.getByRole('dialog');
      expect(popup).toHaveAccessibleName('Title');
      expect(popup).toHaveAccessibleDescription('Description');
      expect(trigger).toHaveAttribute('aria-controls', popup.id);
      expect(order).toEqual(['callback', 'dispatch']);
      await waitFor(() => expect(untrack(() => root.state.floatingRootContext.state.floatingElement === popup)).toBe(true));
      await view.user.click(screen.getByText('Close'));
      expect(closeClick).toHaveBeenCalledTimes(1);
      expect(requests).toEqual([[true, 'trigger-press'], [false, 'close-press']]);
      expect(order).toEqual(['callback', 'dispatch', 'callback', 'dispatch']);
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
      expect(closingTrigger).toBe(trigger);
      expect(order).toEqual(['callback', 'dispatch', 'callback', 'dispatch']);
    });
  }

  it('canceled Escape leaves ownership, payload and internal events intact', async () => {
    const handle = Dialog.createHandle<string>();
    const internal = vi.fn();
    const changed = vi.fn((_open: boolean, details: Dialog.Root.ChangeEventDetails) => {
      if (!_open) details.cancel();
    });
    function Observe() {
      const events = useDialogRootContext().state.floatingRootContext.events;
      events.on('openchange', internal);
      onCleanup(() => events.off('openchange', internal));
      return null;
    }
    const view = await render(() => <>
      <Dialog.Trigger handle={handle} id="one" payload="payload">Open</Dialog.Trigger>
      <Dialog.Root handle={handle} modal={false} onOpenChange={changed}>
        {(context) => <><Observe /><Dialog.Portal><Dialog.Popup>{context.payload}</Dialog.Popup></Dialog.Portal></>}
      </Dialog.Root>
    </>);
    await view.user.click(screen.getByText('Open'));
    const popup = screen.getByRole('dialog');
    await view.user.keyboard('[Escape]');
    expect(changed).toHaveBeenCalledTimes(2);
    expect(changed.mock.calls[1]?.[1].trigger).toBe(screen.getByText('Open'));
    expect(internal).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('dialog')).toBe(popup);
    expect(popup.textContent).toBe('payload');
    expect(untrack(() => handle.isOpen)).toBe(true);
  });

  it('forwards live registration payload and swaps handles without recreating the popup', async () => {
    const first = Dialog.createHandle<number>();
    const second = Dialog.createHandle<number>();
    const view = await renderProps((props: { handle: Dialog.Handle<number>; payload: number }) => <>
      <Dialog.Trigger handle={props.handle} id="trigger" payload={props.payload}>Open</Dialog.Trigger>
      <Dialog.Root handle={props.handle} modal={false} disablePointerDismissal>
        {(context) => <Dialog.Portal><Dialog.Popup>{context.payload}</Dialog.Popup></Dialog.Portal>}
      </Dialog.Root>
    </>, { handle: first, payload: 1 });
    first.open('trigger');
    const popup = await screen.findByRole('dialog');
    expect(popup.textContent).toBe('1');
    await view.setProps({ payload: 2, handle: second });
    expect(screen.getByRole('dialog')).toBe(popup);
    expect(popup.textContent).toBe('2');
    expect(untrack(() => first.isOpen)).toBe(false);
    expect(untrack(() => second.isOpen)).toBe(true);
    expect(screen.getByText('Open')).toHaveAttribute('aria-controls', popup.id);
  });

  it('isOpen is a live native getter across attachment, requests and disposal', async () => {
    const handle = Dialog.createHandle();
    const view = await renderProps((props: { attached: boolean }) => <>
      <output data-testid="is-open">{String(handle.isOpen)}</output>
      {props.attached && <Dialog.Root handle={handle} modal={false} />}
    </>, { attached: false });
    expect(screen.getByTestId('is-open').textContent).toBe('false');
    await view.setProps({ attached: true });
    handle.open(null);
    await waitFor(() => expect(screen.getByTestId('is-open').textContent).toBe('true'));
    await view.setProps({ attached: false });
    expect(screen.getByTestId('is-open').textContent).toBe('false');
  });

  it('retains close separately from actionsRef and completes same-turn manual unmount once', async () => {
    const actions = { current: null as Dialog.Root.Actions | null };
    const complete = vi.fn();
    await render(() => <Dialog.Root defaultOpen modal={false} actionsRef={actions} onOpenChangeComplete={complete}
      onOpenChange={(open, details) => { if (!open) details.preventUnmountOnClose(); }}>
      <Dialog.Portal><Dialog.Popup /></Dialog.Portal>
    </Dialog.Root>);
    const popup = screen.getByRole('dialog');
    actions.current!.close();
    await waitFor(() => expect(popup).toHaveAttribute('data-closed'));
    expect(popup).not.toHaveAttribute('hidden');
    actions.current!.unmount();
    actions.current!.unmount();
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(complete.mock.calls.filter(([open]) => !open)).toHaveLength(1);
  });

  it('same-turn close/unmount resets retention when reopening', async () => {
    const handle = Dialog.createHandle();
    const actions = { current: null as Dialog.Root.Actions | null };
    const complete = vi.fn();
    await render(() => <Dialog.Root handle={handle} defaultOpen modal={false} actionsRef={actions} onOpenChangeComplete={complete}
      onOpenChange={(_open, details) => details.preventUnmountOnClose()}>
      <Dialog.Portal keepMounted><Dialog.Popup /></Dialog.Portal>
    </Dialog.Root>);
    for (const cycle of [1, 2]) {
      actions.current!.close();
      actions.current!.unmount();
      await waitFor(() => expect(screen.getByRole('dialog', { hidden: true })).toHaveAttribute('hidden'));
      expect(complete.mock.calls.filter(([open]) => !open)).toHaveLength(cycle);
      handle.open(null);
      await waitFor(() => expect(screen.getByRole('dialog')).not.toHaveAttribute('hidden'));
    }
  });

  it('nested mode counts and viewport attributes clean up without changing parent hosts', async () => {
    const Drawer = (props: Dialog.Root.Props) => createRenderDialogRoot('drawer', props);
    const Alert = (props: Dialog.Root.Props) => createRenderDialogRoot('alert-dialog', props);
    function Counts() {
      const store = useDialogRootContext();
      return <output data-testid="counts">{store.state.nestedOpenDialogCount}/{store.state.nestedOpenDrawerCount}</output>;
    }
    const view = await renderProps((props: { visible: boolean }) => <Dialog.Root open modal={false}>
      <Counts /><Dialog.Portal><Dialog.Viewport data-testid="viewport"><Dialog.Popup data-testid="parent" /></Dialog.Viewport></Dialog.Portal>
      {props.visible && <Drawer open modal={false}><Alert open /></Drawer>}
    </Dialog.Root>, { visible: true });
    const parent = screen.getByTestId('parent');
    const viewport = screen.getByTestId('viewport');
    expect(screen.getByTestId('counts').textContent).toBe('2/1');
    expect(parent).toHaveAttribute('data-nested-dialog-open');
    expect(viewport).toHaveAttribute('data-nested-dialog-open');
    expect(parent.style.getPropertyValue('--nested-dialogs')).toBe('2');
    await view.setProps({ visible: false });
    expect(screen.getByTestId('counts').textContent).toBe('0/0');
    expect(screen.getByTestId('parent')).toBe(parent);
    expect(parent).not.toHaveAttribute('data-nested-dialog-open');
    expect(viewport).not.toHaveAttribute('data-nested-dialog-open');
  });

  it('active trigger ARIA follows custom popup IDs and clears while retained closed', async () => {
    const handle = Dialog.createHandle();
    const view = await renderProps((props: { id: string }) => <>
      <Dialog.Trigger handle={handle} id="one">One</Dialog.Trigger>
      <Dialog.Trigger handle={handle} id="two">Two</Dialog.Trigger>
      <Dialog.Root handle={handle} modal={false} disablePointerDismissal
        onOpenChange={(open, details) => { if (!open) details.preventUnmountOnClose(); }}>
        <Dialog.Portal><Dialog.Popup id={props.id} /></Dialog.Portal>
      </Dialog.Root>
    </>, { id: 'first' });
    handle.open('one');
    const popup = await screen.findByRole('dialog');
    expect(screen.getByText('One')).toHaveAttribute('aria-controls', 'first');
    expect(screen.getByText('Two')).not.toHaveAttribute('aria-controls');
    await view.setProps({ id: 'second' });
    expect(screen.getByRole('dialog')).toBe(popup);
    await waitFor(() => expect(screen.getByText('One')).toHaveAttribute('aria-controls', 'second'));
    handle.close();
    await waitFor(() => expect(popup).toHaveAttribute('data-closed'));
    expect(screen.getByText('One')).not.toHaveAttribute('aria-controls');
    expect(screen.getByText('One')).toHaveAttribute('aria-expanded', 'false');
  });

  it('stops all source composite navigation keys at the popup', async () => {
    const bubbled = vi.fn();
    await render(() => <div onKeyDown={bubbled}><Dialog.Root defaultOpen modal={false}>
      <Dialog.Portal><Dialog.Popup><input aria-label="Input" /></Dialog.Popup></Dialog.Portal>
    </Dialog.Root></div>);
    for (const key of ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End']) {
      fireEvent.keyDown(screen.getByRole('textbox'), { key });
    }
    expect(bubbled).not.toHaveBeenCalled();
  });

  for (const [label, initialFocus, movesFocus] of [
    ['default', undefined, true], ['true', true, true], ['false', false, false],
    ['callback true', () => true, true], ['callback null', () => null, true],
    ['callback false', () => false, false], ['callback void', () => undefined, false],
  ] as const) {
    it(`source initialFocus outcome ${label}`, async () => {
      const view = await render(() => <Dialog.Root modal={false}>
        <Dialog.Trigger>Open</Dialog.Trigger><Dialog.Portal><Dialog.Popup initialFocus={initialFocus}>
          <input aria-label="First" /><Dialog.Close>Close</Dialog.Close>
        </Dialog.Popup></Dialog.Portal>
      </Dialog.Root>);
      const trigger = screen.getByText('Open');
      await view.user.click(trigger);
      await screen.findByRole('dialog');
      if (movesFocus) await waitFor(() => expect(screen.getByRole('textbox')).toHaveFocus());
      else expect(trigger).toHaveFocus();
    });
  }

  for (const mode of ['dialog', 'alert-dialog', 'drawer'] as const) {
    it(`mode ${mode} uses the same live host and pointer policy with a handle`, async () => {
      const handle = Dialog.createHandle();
      const Root = (props: Dialog.Root.Props) => createRenderDialogRoot(mode, props);
      const view = await render(() => <Root handle={handle} modal={false}>
        <Dialog.Portal><Dialog.Backdrop data-testid="backdrop" /><Dialog.Popup /></Dialog.Portal>
      </Root>);
      handle.open(null);
      const role = mode === 'alert-dialog' ? 'alertdialog' : 'dialog';
      await screen.findByRole(role);
      await view.user.click(screen.getByTestId('backdrop'));
      await waitFor(() => expect(Boolean(screen.queryByRole(role))).toBe(mode === 'alert-dialog'));
    });
  }
});
