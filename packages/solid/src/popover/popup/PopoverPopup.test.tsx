import { describe, expect, it, vi } from 'vitest';
import { createSignal, flush } from 'solid-js';
import { createRenderer, screen, waitFor, fireEvent, firePointer, flushMicrotasks } from '../../../test';
import { Popover } from '../index';
import { Toolbar } from '../../toolbar';

describe('Popover popup focus and event boundary', () => {
  const { render } = createRenderer();
  for (const target of ['default', 'element', 'true', 'null', 'false', 'void'] as const) {
    it(`initial/final focus functions preserve ${target} result semantics`, async () => {
      let inside!: HTMLInputElement;
      let outside!: HTMLButtonElement;
      const initial = vi.fn(() => target === 'element' ? inside : target === 'true' ? true : target === 'null' ? null : target === 'false' ? false : undefined);
      const final = vi.fn(() => target === 'element' ? outside : target === 'true' ? true : target === 'null' ? null : target === 'false' ? false : undefined);
      const view = await render(() => <><button ref={(node) => { outside = node; }}>Outside</button><Popover.Root>
        <Popover.Trigger>Toggle</Popover.Trigger><Popover.Portal><Popover.Positioner><Popover.Popup
          initialFocus={target === 'default' ? undefined : initial} finalFocus={target === 'default' ? undefined : final}>
          <input aria-label="Inside" ref={(node) => { inside = node; }} /><Popover.Close>Close</Popover.Close>
        </Popover.Popup></Popover.Positioner></Popover.Portal>
      </Popover.Root></>);
      const trigger = screen.getByRole('button', { name: 'Toggle' });
      trigger.focus();
      firePointer.down(trigger, { timeStamp: 100, pointerType: 'mouse' });
      fireEvent.click(trigger, { detail: 1 });
      await flushMicrotasks();
      if (target !== 'default') await waitFor(() => expect(initial).toHaveBeenCalledExactlyOnceWith('mouse'));
      expect(screen.getByRole('button', { name: 'Toggle' })).toBe(trigger);
      expect(trigger.isConnected).toBe(true);
      if (target === 'false' || target === 'void') expect(trigger).toHaveFocus();
      else await waitFor(() => expect(inside).toHaveFocus());
      await view.user.click(screen.getByRole('button', { name: 'Close' }));
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
      if (target === 'element') expect(outside).toHaveFocus();
      else if (target !== 'false' && target !== 'void') expect(trigger).toHaveFocus();
      if (target !== 'default') expect(final).toHaveBeenCalledExactlyOnceWith('mouse');
    });
  }

  it.each(['false', 'void'] as const)('honors finalFocus returning %s independently of initial-focus preservation', async (result) => {
    const final = vi.fn(() => result === 'false' ? false : undefined);
    const view = await render(() => <Popover.Root><Popover.Trigger>Toggle</Popover.Trigger>
      <Popover.Portal><Popover.Positioner><Popover.Popup initialFocus finalFocus={final}>
        <input aria-label="Inside" /><Popover.Close>Close</Popover.Close>
      </Popover.Popup></Popover.Positioner></Popover.Portal>
    </Popover.Root>);
    const trigger = screen.getByRole('button', { name: 'Toggle' });
    firePointer.down(trigger, { timeStamp: 100, pointerType: 'mouse' });
    fireEvent.click(trigger, { detail: 1 });
    await waitFor(() => expect(screen.getByRole('textbox', { name: 'Inside' })).toHaveFocus());
    await view.user.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await waitFor(() => expect(final).toHaveBeenCalledExactlyOnceWith('mouse'));
    expect(screen.getByRole('button', { name: 'Toggle' })).toBe(trigger);
    expect(trigger).not.toHaveFocus();
  });

  it('keeps the focused trigger stationary when native focus guards are inserted', async () => {
    // PopoverTrigger.tsx:154-166 keys the trigger independently of the inserted guards.
    const view = await render(() => <Popover.Root><Popover.Trigger>Toggle</Popover.Trigger>
      <Popover.Portal><Popover.Positioner><Popover.Popup initialFocus={false}>Content</Popover.Popup></Popover.Positioner></Popover.Portal>
    </Popover.Root>);
    const trigger = screen.getByRole('button', { name: 'Toggle' });
    const removals: Node[] = [];
    const collect = (records: MutationRecord[]) => {
      for (const record of records) removals.push(...record.removedNodes);
    };
    const observer = new trigger.ownerDocument.defaultView!.MutationObserver(collect);
    observer.observe(trigger.parentNode!, { childList: true });
    try {
      trigger.focus();
      firePointer.down(trigger, { timeStamp: 100, pointerType: 'mouse' });
      fireEvent.click(trigger, { detail: 1 });
      await waitFor(() => expect(screen.getByRole('dialog')).toHaveAttribute('data-open'));
      collect(observer.takeRecords());
      expect(screen.getByRole('button', { name: 'Toggle' })).toBe(trigger);
      expect(trigger.isConnected).toBe(true);
      expect.soft(removals.some((node) => node === trigger || node.contains(trigger))).toBe(false);
      await waitFor(() => expect(trigger).toHaveFocus());
    } finally {
      observer.disconnect();
      view.unmount();
    }
  });

  it('uses the latest initialFocus callback and interaction type after reopening', async () => {
    let swap!: () => void;
    const first = vi.fn(() => false);
    const second = vi.fn(() => true);
    const view = await render(() => {
      const [next, setNext] = createSignal(false); swap = () => { setNext(true); };
      return <Popover.Root><Popover.Trigger>Toggle</Popover.Trigger><Popover.Portal keepMounted><Popover.Positioner><Popover.Popup initialFocus={next() ? second : first}>
        <input aria-label="Inside" /><Popover.Close>Close</Popover.Close>
      </Popover.Popup></Popover.Positioner></Popover.Portal></Popover.Root>;
    });
    const trigger = screen.getByRole('button', { name: 'Toggle' });
    trigger.focus();
    firePointer.down(trigger, { timeStamp: 100, pointerType: 'mouse' });
    fireEvent.click(trigger, { detail: 1 });
    await flushMicrotasks();
    await view.user.keyboard('{Escape}');
    swap(); flush();
    trigger.focus();
    await view.user.keyboard('{Enter}');
    expect(first).toHaveBeenCalledExactlyOnceWith('mouse');
    expect(second).toHaveBeenCalledExactlyOnceWith('keyboard');
  });

  it.each(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End'])('lets content composites receive %s without leaking it to the toolbar', async (key) => {
    const toolbar = vi.fn();
    const content = vi.fn();
    const view = await render(() => <Toolbar.Root onKeyDown={toolbar}><Popover.Root>
      <Popover.Trigger>Toggle</Popover.Trigger><Popover.Portal><Popover.Positioner><Popover.Popup>
        <button onKeyDown={content}>Inside composite</button>
      </Popover.Popup></Popover.Positioner></Popover.Portal>
    </Popover.Root></Toolbar.Root>);
    await view.user.click(screen.getByRole('button', { name: 'Toggle' }));
    screen.getByRole('button', { name: 'Inside composite' }).focus();
    await view.user.keyboard(`{${key}}`);
    expect(content).toHaveBeenCalledOnce();
    expect(toolbar).not.toHaveBeenCalled();
  });
});
