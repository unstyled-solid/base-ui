import { describe, expect, it, vi } from 'vitest';
import { createSignal, flush, untrack } from 'solid-js';
import { createRenderer, waitFor } from '../../../test';
import { Autocomplete } from '../index';
import { AutocompleteFixture, type FixtureProps } from '../test/AutocompleteFixture';

// Source: every manual-unmount scenario in pinned AutocompleteRoot.test.tsx.
// React act/startTransition become explicit native staged writes; shared lifecycle is not copied.
describe('Autocomplete shared manual unmount lifecycle', () => {
  const { render, renderProps } = createRenderer();
  function Popup(props: FixtureProps) {
    const [open, setOpen] = createSignal(untrack(() => props.defaultOpen ?? false));
    return <AutocompleteFixture {...props} open={props.open ?? open()} onOpenChange={(next, details) => {
      props.onOpenChange?.(next, details);
      if (!details.isCanceled) setOpen(next);
    }} />;
  }
  async function mount(extra: FixtureProps = {}) {
    let actions!: Autocomplete.Root.Actions;
    const complete = vi.fn();
    const view = await renderProps((props: FixtureProps) => <Popup {...props} />,
      { defaultOpen: true, openOnInputClick: true, actionsRef: (value) => { if (value) actions = value; },
        onOpenChangeComplete: complete, ...extra });
    return { ...view, complete, actions: () => actions,
      closedCount: () => complete.mock.calls.filter(([open]) => !open).length };
  }
  const optOut: NonNullable<FixtureProps['onOpenChange']> = (open, details) => {
    if (!open) details.preventUnmountOnClose();
  };

  it('automatically unmounts with an actions ref and completes closing once', async () => {
    const view = await mount({ defaultOpen: false });
    expect(view.complete).not.toHaveBeenCalled();
    await view.user.click(view.getByTestId('input'));
    await view.findByRole('listbox');
    await view.user.keyboard('{Escape}');
    await waitFor(() => expect(view.queryByRole('listbox')).toBe(null));
    expect(view.closedCount()).toBe(1);
    view.actions().unmount();
    flush();
    expect(view.closedCount()).toBe(1);
  });

  it('keeps the popup mounted until the unmount action, then resets the opt-out', async () => {
    const view = await mount({ onOpenChange: optOut });
    await view.user.click(view.getByRole('option', { name: 'alpha' }));
    expect(view.getByRole('listbox')).toBeInTheDocument();
    expect(view.closedCount()).toBe(0);
    view.actions().unmount();
    flush();
    expect(view.queryByRole('listbox')).toBe(null);
    expect(view.closedCount()).toBe(1);
    await view.setProps({ open: true });
    await view.setProps({ open: false });
    await waitFor(() => expect(view.queryByRole('listbox')).toBe(null));
    expect(view.closedCount()).toBe(2);
  });

  it('clears the opt-out when a controlled reopen interrupts a pending unmount', async () => {
    const view = await mount({ onOpenChange: optOut });
    await view.user.click(view.getByRole('option', { name: 'alpha' }));
    expect(view.closedCount()).toBe(0);
    expect(view.getByRole('listbox')).toBeInTheDocument();
    await view.setProps({ open: true });
    await view.setProps({ open: false });
    await waitFor(() => expect(view.queryByRole('listbox')).toBe(null));
    expect(view.closedCount()).toBe(1);
  });

  it('ignores an opt-out on a canceled close', async () => {
    const view = await mount({ onOpenChange: (open, details) => {
      if (!open) { details.preventUnmountOnClose(); details.cancel(); }
    } });
    await view.user.click(view.getByRole('option', { name: 'alpha' }));
    expect(view.getByTestId('input')).toHaveAttribute('aria-expanded', 'true');
    expect(view.getByRole('listbox')).toBeInTheDocument();
    await view.setProps({ onOpenChange: undefined });
    await view.user.click(view.getByRole('option', { name: 'alpha' }));
    await waitFor(() => expect(view.queryByRole('listbox')).toBe(null));
  });

  it('keeps the opt-out across a staged controlled close', async () => {
    let actions!: Autocomplete.Root.Actions;
    const complete = vi.fn();
    const view = await render(() => {
      const [open, setOpen] = createSignal(true);
      return <AutocompleteFixture open={open()} actionsRef={(value) => { if (value) actions = value; }}
        onOpenChangeComplete={complete} onOpenChange={(next, details) => {
          if (!next) details.preventUnmountOnClose();
          setOpen(next);
        }} />;
    });
    await view.user.click(view.getByRole('option', { name: 'alpha' }));
    expect(view.getByTestId('input')).toHaveAttribute('aria-expanded', 'false');
    expect(view.getByRole('listbox')).toBeInTheDocument();
    expect(complete.mock.calls.filter(([open]) => !open)).toHaveLength(0);
    actions.unmount();
    flush();
    expect(view.queryByRole('listbox')).toBe(null);
    expect(complete.mock.calls.filter(([open]) => !open)).toHaveLength(1);
  });

  it('close reports imperative-action and permits opting out', async () => {
    const reasons: string[] = [];
    const view = await mount({ onOpenChange: (open, details) => { reasons.push(details.reason); optOut(open, details); } });
    view.actions().close();
    flush();
    expect(reasons).toEqual(['imperative-action']);
    expect(view.getByTestId('input')).toHaveAttribute('aria-expanded', 'false');
    expect(view.getByRole('listbox')).toBeInTheDocument();
    view.actions().unmount();
    flush();
    expect(view.queryByRole('listbox')).toBe(null);
  });

  it('ignores unmount while open and still unmounts on a later close', async () => {
    const view = await mount();
    const list = view.getByRole('listbox');
    view.actions().unmount();
    flush();
    expect(view.getByRole('listbox')).toBe(list);
    expect(view.closedCount()).toBe(0);
    expect(view.getByTestId('input')).toHaveAttribute('aria-expanded', 'true');
    await view.user.click(view.getByTestId('input'));
    await view.user.keyboard('{Escape}');
    await waitFor(() => expect(view.queryByRole('listbox')).toBe(null));
    expect(view.closedCount()).toBe(1);
    expect(view.complete).toHaveBeenLastCalledWith(false);
  });

  it('unmounts when close and unmount are requested in one turn', async () => {
    const view = await mount({ onOpenChange: optOut });
    view.actions().close();
    view.actions().unmount();
    flush();
    expect(view.queryByRole('listbox')).toBe(null);
    expect(view.closedCount()).toBe(1);
  });

  it('completes closing once when unmount is called twice in one turn', async () => {
    const view = await mount({ onOpenChange: optOut });
    await view.user.click(view.getByRole('option', { name: 'alpha' }));
    view.actions().unmount();
    view.actions().unmount();
    flush();
    expect(view.queryByRole('listbox')).toBe(null);
    expect(view.closedCount()).toBe(1);
  });

  it('does not call onOpenChange when close is called while closed', async () => {
    const change = vi.fn();
    const view = await mount({ defaultOpen: false, onOpenChange: change });
    view.actions().close();
    flush();
    expect(change).not.toHaveBeenCalled();
    expect(view.getByTestId('input')).toHaveAttribute('aria-expanded', 'false');
  });

  it('still unmounts after an unmount completion reopens in the same turn', async () => {
    let actions!: Autocomplete.Root.Actions;
    let reopen = true;
    let prevent = true;
    const complete = vi.fn();
    const view = await render(() => {
      const [open, setOpen] = createSignal(true);
      return <AutocompleteFixture open={open()} actionsRef={(value) => { if (value) actions = value; }}
        onOpenChange={(next, details) => {
          if (!next && prevent) details.preventUnmountOnClose();
          setOpen(next);
        }} onOpenChangeComplete={(next) => {
          complete(next);
          if (!next && reopen) { reopen = false; setOpen(true); }
        }} />;
    });
    actions.close();
    flush();
    expect(view.getByRole('listbox')).toBeInTheDocument();
    actions.unmount();
    flush();
    await waitFor(() => expect(view.getByTestId('input')).toHaveAttribute('aria-expanded', 'true'));
    expect(view.getByRole('listbox')).toBeInTheDocument();
    expect(complete.mock.calls.filter(([open]) => !open)).toHaveLength(1);
    prevent = false;
    await view.user.click(view.getByRole('option', { name: 'alpha' }));
    await waitFor(() => expect(view.queryByRole('listbox')).toBe(null));
    expect(complete.mock.calls.filter(([open]) => !open)).toHaveLength(2);
  });
});
