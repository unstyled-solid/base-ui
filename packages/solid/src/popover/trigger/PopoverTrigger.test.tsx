import { describe, expect, it, vi } from 'vitest';
import { flush } from 'solid-js';
import { createRenderer, screen, enterWithMouse, fireEvent, advanceTimers, firePointer, waitFor } from '../../../test';
import { Popover } from '../index';

describe('Popover Trigger hover/click policy', () => {
  const { render } = createRenderer();
  function Popup() {
    return <Popover.Portal><Popover.Backdrop data-testid="backdrop" /><Popover.Positioner><Popover.Popup>
      <Popover.Close>Close</Popover.Close>
    </Popover.Popup></Popover.Positioner></Popover.Portal>;
  }
  it('source trigger-only click sets both open and pressed attributes', async () => {
    await render(() => <Popover.Root><Popover.Trigger>Toggle</Popover.Trigger></Popover.Root>);
    const trigger = screen.getByRole('button');
    trigger.click();
    await waitFor(() => expect(trigger).toHaveAttribute('data-popup-open'));
    expect(trigger).toHaveAttribute('data-pressed');
  });
  it('source hover sets open without pressed and immediate click retains open', async () => {
    const view = await render(() => <Popover.Root><Popover.Trigger openOnHover delay={0}>Toggle</Popover.Trigger><Popup /></Popover.Root>);
    const trigger = screen.getByRole('button', { name: 'Toggle' });
    await view.user.hover(trigger);
    expect(trigger).toHaveAttribute('data-popup-open');
    expect(trigger).not.toHaveAttribute('data-pressed');
    trigger.click();
    await Promise.resolve();
    expect(trigger).toHaveAttribute('data-popup-open');
  });
  it('source default hover delay followed by click sets open and pressed', async () => {
    const view = await render(() => <Popover.Root><Popover.Trigger openOnHover>Toggle</Popover.Trigger><Popup /></Popover.Root>);
    const trigger = screen.getByRole('button', { name: 'Toggle' });
    await view.user.hover(trigger);
    trigger.click();
    await waitFor(() => expect(trigger).toHaveAttribute('data-popup-open'));
    expect(trigger).toHaveAttribute('data-pressed');
  });
  for (const [entry, elapsed, leave] of [
    ['move', 499, false], ['enter', 500, false], ['enter', 499, true], ['enter', 500, true],
  ] as const) {
    it(`source patient gesture entry=${entry}/elapsed=${elapsed}/leave=${leave}`, async () => {
      const view = await render(() => <Popover.Root><Popover.Trigger openOnHover delay={0}>Toggle</Popover.Trigger><Popup /></Popover.Root>);
      vi.useFakeTimers();
      try {
        const trigger = screen.getByRole('button', { name: 'Toggle' });
        if (entry === 'move') fireEvent.mouseMove(trigger);
        else fireEvent.mouseEnter(trigger);
        await advanceTimers(elapsed);
        fireEvent.click(trigger);
        if (leave) fireEvent.mouseLeave(trigger);
        await Promise.resolve();
        expect(trigger.hasAttribute('data-popup-open')).toBe(elapsed < 500);
        if (leave && elapsed === 499) {
          await advanceTimers(1);
          expect(trigger).toHaveAttribute('data-popup-open');
        }
      } finally {
        view.unmount(); vi.useRealTimers();
      }
    });
  }
  it.each([499, 500])('patient threshold elapsed=%s distinguishes sticky click from toggle close', async (elapsed) => {
    const view = await render(() => <Popover.Root><Popover.Trigger delay={0} openOnHover>Toggle</Popover.Trigger><Popup /></Popover.Root>);
    vi.useFakeTimers();
    const trigger = screen.getByRole('button', { name: 'Toggle' });
    enterWithMouse(trigger); flush();
    expect(screen.getByTestId('backdrop').style.pointerEvents).toBe('none');
    await advanceTimers(elapsed);
    fireEvent.click(trigger, { detail: 1 }); flush();
    expect(trigger).toHaveAttribute('aria-expanded', String(elapsed < 500));
    if (elapsed < 500) {
      fireEvent.mouseLeave(trigger); flush();
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByTestId('backdrop').style.pointerEvents).not.toBe('none');
    }
    view.unmount(); vi.useRealTimers();
  });

  it('a click before the hover delay keeps ownership and restores trigger focus on Close', async () => {
    const changed = vi.fn();
    const view = await render(() => <Popover.Root onOpenChange={changed}><Popover.Trigger delay={300} openOnHover>Toggle</Popover.Trigger><Popup /></Popover.Root>);
    vi.useFakeTimers();
    const trigger = screen.getByRole('button', { name: 'Toggle' });
    trigger.focus(); enterWithMouse(trigger); await advanceTimers(100);
    fireEvent.click(trigger, { detail: 1 }); flush();
    expect(trigger).toHaveAttribute('data-popup-open');
    fireEvent.mouseLeave(trigger);
    await Promise.resolve();
    expect(trigger).toHaveAttribute('data-popup-open');
    await advanceTimers(1000);
    expect(changed.mock.calls.map(([, details]) => details.reason)).toEqual(['trigger-press']);
    fireEvent.click(screen.getByRole('button', { name: 'Close' })); flush();
    await advanceTimers(0);
    expect(trigger).toHaveFocus();
    view.unmount(); vi.useRealTimers();
  });

  it('disabled triggers do not activate through click or hover', async () => {
    const changed = vi.fn();
    const view = await render(() => <Popover.Root onOpenChange={changed}><Popover.Trigger disabled delay={0} openOnHover>Toggle</Popover.Trigger><Popup /></Popover.Root>);
    const trigger = screen.getByRole('button');
    await view.user.click(trigger); enterWithMouse(trigger); flush();
    expect(changed).not.toHaveBeenCalled();
    expect(trigger).toHaveAttribute('data-disabled');
    expect(trigger).toBeDisabled();
    expect(screen.queryByRole('dialog')).toBeNull();
    await view.user.tab();
    expect(trigger).not.toHaveFocus();
  });

  it('a disabled custom span cannot click, hover or receive Tab focus', async () => {
    const view = await render(() => <Popover.Root><Popover.Trigger disabled nativeButton={false}
      render={(host) => <span {...host} />} openOnHover delay={0}>Toggle</Popover.Trigger><Popup /></Popover.Root>);
    const trigger = screen.getByRole('button');
    expect(trigger).not.toHaveAttribute('disabled');
    expect(trigger).toHaveAttribute('data-disabled');
    expect(trigger).toHaveAttribute('aria-disabled', 'true');
    await view.user.click(trigger);
    expect(screen.queryByRole('dialog')).toBeNull();
    await view.user.hover(trigger);
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(trigger).not.toHaveAttribute('data-popup-open');
    await view.user.tab();
    expect(trigger).not.toHaveFocus();
  });

  it('touch click prevents a hovered sibling stealing trigger/payload ownership', async () => {
    const view = await render(() => <Popover.Root<number>>{(state) => <>
      <Popover.Trigger payload={1} openOnHover delay={0}>One</Popover.Trigger>
      <Popover.Trigger payload={2} openOnHover delay={0}>Two</Popover.Trigger>
      <output>{state.payload}</output><Popup />
    </>}</Popover.Root>);
    const one = screen.getByRole('button', { name: 'One' });
    firePointer.down(one, { timeStamp: 100, pointerType: 'touch' });
    fireEvent.mouseDown(one);
    fireEvent.click(one, { detail: 1 }); flush();
    enterWithMouse(screen.getByRole('button', { name: 'Two' })); flush();
    expect(screen.getByRole('status')).toHaveTextContent('1');
    expect(one).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('button', { name: 'Two' })).toHaveAttribute('aria-expanded', 'false');
    view.unmount();
  });

  it('mouse opening permits hovered sibling ownership', async () => {
    await render(() => <Popover.Root<number>>{(state) => <>
      <Popover.Trigger payload={1} openOnHover delay={0} closeDelay={0}>One</Popover.Trigger>
      <Popover.Trigger payload={2} openOnHover delay={0} closeDelay={0}>Two</Popover.Trigger>
      <output>{state.payload}</output><Popup />
    </>}</Popover.Root>);
    const one = screen.getByRole('button', { name: 'One' });
    firePointer.down(one, { timeStamp: 100, pointerType: 'mouse' });
    fireEvent.mouseDown(one);
    fireEvent.click(one, { detail: 1 });
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('1'));
    const two = screen.getByRole('button', { name: 'Two' });
    enterWithMouse(two);
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('2'));
    expect(two).toHaveAttribute('aria-expanded', 'true');
  });
});
