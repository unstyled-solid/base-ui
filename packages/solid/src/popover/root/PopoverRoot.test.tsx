import { describe, expect, it, vi } from 'vitest';
import { createSignal, flush, onSettled, untrack } from 'solid-js';
import { createRenderer, screen, waitFor, popupConformanceTests, fireEvent } from '../../../test';
import { Popover } from '../index';
import { usePopoverRootContext } from './PopoverRootContext';
import { createChangeEventDetails } from '../../internals/createBaseUIEventDetails';

function Content() {
  return <Popover.Portal><Popover.Positioner data-testid="positioner"><Popover.Popup>
    <Popover.Title>Title</Popover.Title><Popover.Description>Description</Popover.Description>
    <Popover.Close>Close</Popover.Close>
  </Popover.Popup></Popover.Positioner></Popover.Portal>;
}

describe('Popover Root', () => {
  const { render, renderProps } = createRenderer();
  // The pinned source expands every body across these three distinct trigger graphs.
  for (const arrangement of ['contained', 'detached', 'multiple-detached'] as const) {
    function SourceFixture(props: { root?: Popover.Root.Props }) {
      const handle = Popover.createHandle();
      return <>
        {arrangement !== 'contained' && <Popover.Trigger handle={handle} data-testid="trigger">Toggle</Popover.Trigger>}
        {arrangement === 'multiple-detached' && <Popover.Trigger handle={handle}>Toggle another</Popover.Trigger>}
        <Popover.Root {...props.root} handle={handle}>
          {arrangement === 'contained' && <Popover.Trigger data-testid="trigger">Toggle</Popover.Trigger>}
          <Popover.Portal><Popover.Positioner><Popover.Popup>Content</Popover.Popup></Popover.Positioner></Popover.Portal>
        </Popover.Root>
      </>;
    }
    it(`${arrangement}: source children and same-anchor toggle`, async () => {
      const view = await render(() => <SourceFixture />);
      const trigger = screen.getByRole('button', { name: 'Toggle' });
      expect(trigger).toBeInTheDocument();
      fireEvent.click(trigger);
      await waitFor(() => expect(screen.getByText('Content')).toBeInTheDocument());
      fireEvent.click(trigger);
      await waitFor(() => expect(screen.queryByText('Content')).toBeNull());
    });
    it(`${arrangement}: source accepted controlled toggle reports previous committed values`, async () => {
      const changed = vi.fn();
      await render(() => {
        const [open, setOpen] = createSignal(false);
        return <SourceFixture root={{ get open() { return open(); }, onOpenChange(next) { changed(open()); setOpen(next); } }} />;
      });
      expect(screen.queryByText('Content')).toBeNull();
      const trigger = screen.getByRole('button', { name: 'Toggle' });
      fireEvent.click(trigger);
      await waitFor(() => expect(screen.getByText('Content')).toBeInTheDocument());
      fireEvent.click(trigger);
      await waitFor(() => expect(screen.queryByText('Content')).toBeNull());
      expect(changed.mock.calls).toEqual([[false], [true]]);
    });
    it(`${arrangement}: source Escape then reopen rewires body dismissal`, async () => {
      const view = await render(() => <SourceFixture root={{ modal: false }} />);
      const trigger = screen.getByRole('button', { name: 'Toggle' });
      await view.user.click(trigger);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      await view.user.keyboard('{Escape}');
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
      await view.user.click(trigger);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      fireEvent.click(document.body);
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    });
    for (const open of [undefined, false, true]) {
      it(`${arrangement}: source defaultOpen with controlled open=${open}`, async () => {
        await render(() => <SourceFixture root={{ defaultOpen: true, open }} />);
        expect(Boolean(screen.queryByText('Content'))).toBe(open !== false);
      });
    }
    it(`${arrangement}: source defaultOpen remains uncontrolled`, async () => {
      await render(() => <SourceFixture root={{ defaultOpen: true }} />);
      expect(screen.getByText('Content')).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: 'Toggle' }));
      await waitFor(() => expect(screen.queryByText('Content')).toBeNull());
    });
    it(`${arrangement}: source cancellation keeps Content absent`, async () => {
      await render(() => <SourceFixture root={{ onOpenChange(next, details) { if (next) details.cancel(); } }} />);
      fireEvent.click(screen.getByRole('button', { name: 'Toggle' }));
      await Promise.resolve();
      expect(screen.queryByText('Content')).toBeNull();
    });
    for (const manual of [false, true]) {
      it(`${arrangement}: source trigger close then unmount manual=${manual}`, async () => {
        let actions: Popover.Root.Actions | null = null;
        const complete = vi.fn();
        const view = await render(() => <SourceFixture root={{ actionsRef: value => { actions = value; },
          onOpenChangeComplete: complete, onOpenChange(_open, details) { if (manual) details.preventUnmountOnClose(); } }} />);
        const trigger = screen.getByRole('button', { name: 'Toggle' });
        await view.user.click(trigger);
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        await view.user.click(trigger);
        if (manual) expect(screen.getByRole('dialog')).toBeInTheDocument();
        else {
          await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
          expect(complete.mock.calls.filter(([open]) => !open)).toHaveLength(1);
        }
        actions!.unmount();
        await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
        expect(complete.mock.calls.filter(([open]) => !open)).toHaveLength(1);
      });
    }
    it(`${arrangement}: source open unmount ignored then Toggle closes normally`, async () => {
      let actions: Popover.Root.Actions | null = null;
      const complete = vi.fn();
      const view = await render(() => <SourceFixture root={{ defaultOpen: true,
        actionsRef: value => { actions = value; }, onOpenChangeComplete: complete }} />);
      const popup = screen.getByRole('dialog');
      actions!.unmount();
      await Promise.resolve();
      expect(screen.getByRole('dialog')).toBe(popup);
      expect(popup).not.toHaveAttribute('data-starting-style');
      expect(complete).not.toHaveBeenCalledWith(false);
      await view.user.click(screen.getByRole('button', { name: 'Toggle' }));
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
      expect(complete).toHaveBeenLastCalledWith(false);
    });
    it(`${arrangement}: source automatic imperative close removes Content`, async () => {
      let actions: Popover.Root.Actions | null = null;
      await render(() => <SourceFixture root={{ defaultOpen: true, actionsRef: value => { actions = value; } }} />);
      actions!.close();
      await waitFor(() => expect(screen.queryByText('Content')).toBeNull());
    });
    it(`${arrangement}: source settled trigger close then double unmount completes once`, async () => {
      let actions: Popover.Root.Actions | null = null;
      const complete = vi.fn();
      const view = await render(() => <SourceFixture root={{ defaultOpen: true,
        actionsRef: value => { actions = value; }, onOpenChangeComplete: complete,
        onOpenChange(open, details) { if (!open) details.preventUnmountOnClose(); } }} />);
      await view.user.click(screen.getByRole('button', { name: 'Toggle' }));
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      actions!.unmount(); actions!.unmount();
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
      expect(complete.mock.calls.filter(([open]) => !open)).toHaveLength(1);
    });
  }
  it.each([false, true])('callback precedes accepted dispatch; cancellation emits no dispatch (cancel=%s)', async (cancel) => {
    const order: string[] = [];
    function Observe() {
      const store = usePopoverRootContext();
      onSettled(() => {
        const listener = () => { order.push(`dispatch:${untrack(() => store.policy.openChangeReason) ?? 'none'}`); };
        store.state.floatingRootContext.events.on('openchange', listener);
        return () => store.state.floatingRootContext.events.off('openchange', listener);
      });
      return null;
    }
    const view = await render(() => <Popover.Root onOpenChange={(_open, details) => { order.push('callback'); if (cancel) details.cancel(); }}>
      <Popover.Trigger>Toggle</Popover.Trigger><Observe /><Content />
    </Popover.Root>);
    await view.user.click(screen.getByRole('button', { name: 'Toggle' }));
    expect(order).toEqual(cancel ? ['callback'] : ['callback', 'dispatch:none']);
  });

  it('arms the patient-click timer only after the callback and accepted floating dispatch', async () => {
    const order: string[] = [];
    let store!: ReturnType<typeof usePopoverRootContext>;
    function Observe() {
      store = usePopoverRootContext();
      onSettled(() => {
        const dispatched = () => { order.push(`dispatch:${vi.getTimerCount()}`); };
        store.state.floatingRootContext.events.on('openchange', dispatched);
        return () => store.state.floatingRootContext.events.off('openchange', dispatched);
      });
      return null;
    }
    const view = await render(() => <Popover.Root onOpenChange={() => { order.push(`callback:${vi.getTimerCount()}`); }}>
      <Popover.Trigger id="trigger">Toggle</Popover.Trigger><Observe />
    </Popover.Root>);
    vi.useFakeTimers();
    try {
      store.setOpen(true, createChangeEventDetails('trigger-hover', new MouseEvent('mousemove'), screen.getByRole('button')));
      expect(order).toEqual(['callback:0', 'dispatch:0']);
      expect(vi.getTimerCount()).toBe(1);
    } finally {
      view.unmount();
      vi.useRealTimers();
    }
  });

  it('a canceled opt-out cannot leak into a reentrant second close', async () => {
    const handle = Popover.createHandle();
    let attempts = 0;
    const completed = vi.fn();
    await render(() => <Popover.Root defaultOpen handle={handle} onOpenChangeComplete={completed} onOpenChange={(open, details) => {
      if (open) return;
      attempts += 1;
      if (attempts === 1) { details.preventUnmountOnClose(); details.cancel(); handle.close(); }
    }}><Popover.Trigger id="trigger">Toggle</Popover.Trigger><Content /></Popover.Root>);
    handle.close(); flush();
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(attempts).toBe(2);
    expect(completed.mock.calls.filter(([open]) => open === false)).toHaveLength(1);
  });

  it('same-turn close/unmount/unmount completes one closing transaction', async () => {
    let actions: Popover.Root.Actions | null = null;
    const completed = vi.fn();
    await render(() => <Popover.Root defaultOpen actionsRef={(value) => { actions = value; }} onOpenChangeComplete={completed}
      onOpenChange={(open, details) => { if (!open) details.preventUnmountOnClose(); }}>
      <Popover.Trigger>Toggle</Popover.Trigger><Content />
    </Popover.Root>);
    actions!.close(); actions!.unmount(); actions!.unmount(); flush();
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(completed.mock.calls.filter(([open]) => open === false)).toHaveLength(1);
  });

  it('unmount while open cannot poison the next automatic close', async () => {
    let actions: Popover.Root.Actions | null = null;
    const completed = vi.fn();
    const view = await render(() => <Popover.Root defaultOpen actionsRef={(value) => { actions = value; }} onOpenChangeComplete={completed}>
      <Popover.Trigger>Toggle</Popover.Trigger><Content />
    </Popover.Root>);
    const popup = screen.getByRole('dialog');
    actions!.unmount(); flush();
    expect(screen.getByRole('dialog')).toBe(popup);
    expect(popup).not.toHaveAttribute('data-starting-style');
    expect(completed).not.toHaveBeenCalledWith(false);
    await view.user.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(completed.mock.calls.filter(([open]) => open === false)).toHaveLength(1);
  });
  popupConformanceTests({
    createComponent: (props) => <Popover.Root {...props.root}>
      <Popover.Trigger {...props.trigger}>Open menu</Popover.Trigger>
      <Popover.Portal {...props.portal}><Popover.Positioner><Popover.Popup {...props.popup}>Content</Popover.Popup></Popover.Positioner></Popover.Portal>
    </Popover.Root>,
    triggerMouseAction: 'click', expectedPopupRole: 'dialog', browserIssue: 'bsolid-browser',
  });

  for (const detached of [false, true]) {
    it(`opens, labels, closes and rewires dismissal after reopening (detached=${detached})`, async () => {
      const handle = Popover.createHandle();
      const view = await render(() => <>
        {detached && <Popover.Trigger handle={handle}>Toggle</Popover.Trigger>}
        <Popover.Root handle={handle}>
          {!detached && <Popover.Trigger>Toggle</Popover.Trigger>}<Content />
        </Popover.Root>
      </>);
      const trigger = screen.getByRole('button', { name: 'Toggle' });
      await view.user.click(trigger);
      expect(screen.getByRole('dialog')).toHaveAccessibleName('Title');
      expect(screen.getByRole('dialog')).toHaveAccessibleDescription('Description');
      expect(screen.getByRole('dialog')).toHaveAttribute('aria-labelledby', screen.getByRole('heading').id);
      expect(screen.getByRole('dialog')).toHaveAttribute('aria-describedby', screen.getByText('Description').id);
      expect(trigger).toHaveAttribute('aria-controls', screen.getByRole('dialog').id);
      await view.user.keyboard('{Escape}');
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
      await view.user.click(trigger);
      await view.user.click(screen.getByRole('button', { name: 'Close' }));
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    });
  }

  it.each([false, true])('controlled open=%s overrides defaultOpen and refuses a request', async (open) => {
    const changed = vi.fn();
    const view = await render(() => <Popover.Root defaultOpen open={open} onOpenChange={changed}>
      <Popover.Trigger>Toggle</Popover.Trigger><Content />
    </Popover.Root>);
    const trigger = screen.getByRole('button', { name: 'Toggle' });
    await view.user.click(trigger);
    expect(changed).toHaveBeenCalledWith(!open, expect.any(Object));
    expect(trigger).toHaveAttribute('aria-expanded', String(open));
  });

  it('calls the current callback and honors cancellation independently of preventDefault', async () => {
    const first = vi.fn();
    const second = vi.fn((_open, details: Popover.Root.ChangeEventDetails) => details.cancel());
    const view = await renderProps((props: { onChange: Popover.Root.Props['onOpenChange'] }) =>
      <Popover.Root onOpenChange={props.onChange}>
        <Popover.Trigger onClick={(event) => event.preventDefault()}>Toggle</Popover.Trigger><Content />
      </Popover.Root>, { onChange: first });
    const trigger = screen.getByRole('button', { name: 'Toggle' });
    await view.setProps({ onChange: second });
    await view.user.click(trigger);
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledOnce();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('preventBaseUIHandler suppresses the internal trigger request', async () => {
    const changed = vi.fn();
    const view = await render(() => <Popover.Root onOpenChange={changed}>
      <Popover.Trigger onClick={(event) => event.preventBaseUIHandler()}>Toggle</Popover.Trigger><Content />
    </Popover.Root>);
    await view.user.click(screen.getByRole('button', { name: 'Toggle' }));
    expect(changed).not.toHaveBeenCalled();
  });

  it('manual unmount retains closing content and completes exactly once', async () => {
    let actions: Popover.Root.Actions | null = null;
    const completed = vi.fn();
    const view = await render(() => <Popover.Root defaultOpen actionsRef={(value) => { actions = value; }}
      onOpenChange={(open, details) => { if (!open) details.preventUnmountOnClose(); }} onOpenChangeComplete={completed}>
      <Popover.Trigger>Toggle</Popover.Trigger><Content />
    </Popover.Root>);
    completed.mockClear();
    await view.user.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(completed).not.toHaveBeenCalled();
    actions!.unmount();
    flush();
    await waitFor(() => expect(screen.queryByText('Description')).toBeNull());
    expect(completed).toHaveBeenCalledExactlyOnceWith(false);
    actions!.unmount();
    flush();
    expect(completed).toHaveBeenCalledOnce();
  });

  it('registers live label IDs without replacing the popup host', async () => {
    const view = await renderProps((props: { id: string }) => <Popover.Root defaultOpen>
      <Popover.Trigger>Toggle</Popover.Trigger><Popover.Portal><Popover.Positioner><Popover.Popup>
        <Popover.Title id={props.id}>Name</Popover.Title>
      </Popover.Popup></Popover.Positioner></Popover.Portal>
    </Popover.Root>, { id: 'before' });
    const popup = screen.getByRole('dialog');
    await view.setProps({ id: 'after' });
    expect(screen.getByRole('dialog')).toBe(popup);
    expect(popup).toHaveAttribute('aria-labelledby', 'after');
  });

  it.each([false, true, 'trap-focus'] as const)('gates focus trapping on an in-popup Close (modal=%s)', async (modal) => {
    let showClose!: (show: boolean) => void;
    const view = await render(() => {
      const [show, setShow] = createSignal(false); showClose = setShow;
      return <><button data-testid="outside">Outside</button><Popover.Root defaultOpen modal={modal}>
        <Popover.Trigger>Toggle</Popover.Trigger><Popover.Portal><Popover.Positioner><Popover.Popup>
          <input aria-label="Inside" />{show() && <Popover.Close>Close</Popover.Close>}
        </Popover.Popup></Popover.Positioner></Popover.Portal>
      </Popover.Root></>;
    });
    showClose(true); flush();
    const inside = screen.getByRole('textbox', { name: 'Inside' });
    screen.getByRole('button', { name: 'Close' }).focus();
    await view.user.tab();
    if (modal !== false) expect(inside).toHaveFocus();
    else {
      expect(inside).not.toHaveFocus();
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    }
  });
});
