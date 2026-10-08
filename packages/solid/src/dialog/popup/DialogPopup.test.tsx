import { describe, it, expect, vi } from 'vitest';
import { createRenderer, waitFor, fireEvent, firePointer } from '../../../test';
import { Dialog } from '../index';

const { render } = createRenderer();
describe('Dialog.Popup focus contract', () => {
  for (const kind of ['cell', 'accessor'] as const) {
    it(`internal second input is the explicit initial focus target: ${kind}`, async () => {
      const second = { current: null as HTMLInputElement | null };
      const view = await render(() => <><input aria-label="Before" /><Dialog.Root modal={false}>
        <Dialog.Trigger>Open</Dialog.Trigger><Dialog.Portal>
          <Dialog.Popup initialFocus={kind === 'cell' ? second : () => second.current}>
            <input aria-label="First" /><input aria-label="Second" ref={(node) => { second.current = node; }} />
            <input aria-label="Third" /><button>Close</button>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root><input aria-label="After" /></>);
      await view.user.click(view.getByText('Open'));
      await waitFor(() => expect(view.getByRole('textbox', { name: 'Second' })).toHaveFocus());
    });
  }
  it('initial focus callback chooses the second input only after keyboard reopening', async () => {
    let second!: HTMLInputElement;
    const view = await render(() => <Dialog.Root modal={false}>
      <Dialog.Trigger>Open</Dialog.Trigger><Dialog.Portal>
        <Dialog.Popup initialFocus={(type) => type === 'keyboard' ? second : undefined}>
          <input aria-label="First" /><input aria-label="Second" ref={(node) => { second = node; }} />
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>);
    const trigger = view.getByText('Open');
    await view.user.click(trigger);
    await waitFor(() => expect(trigger).toHaveFocus());
    await view.user.keyboard('[Escape]');
    await view.user.keyboard('[Enter]');
    await waitFor(() => expect(second).toHaveFocus());
  });
  it('final focus selects an external element on keyboard close and the trigger on pointer close', async () => {
    let final!: HTMLInputElement;
    const view = await render(() => <><Dialog.Root>
      <Dialog.Backdrop /><Dialog.Trigger>Open</Dialog.Trigger><Dialog.Portal>
        <Dialog.Popup finalFocus={(type) => type === 'keyboard' ? final : true}>
          <Dialog.Close>Close</Dialog.Close>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root><input aria-label="Final" ref={(node) => { final = node; }} /></>);
    const trigger = view.getByText('Open');
    await view.user.click(trigger);
    await view.user.click(view.getByText('Close'));
    await waitFor(() => expect(trigger).toHaveFocus());
    await view.user.click(trigger);
    await waitFor(() => expect(view.getByText('Close')).toHaveFocus());
    await view.user.keyboard('[Escape]');
    await waitFor(() => expect(final).toHaveFocus());
  });
  it('external initial focus with omitted finalFocus does not focus an unrelated final input', async () => {
    const initial = { current: null as HTMLInputElement | null };
    const view = await render(() => <><input aria-label="Initial" ref={(node) => { initial.current = node; }} />
      <Dialog.Root><Dialog.Backdrop /><Dialog.Trigger>Open</Dialog.Trigger><Dialog.Portal>
        <Dialog.Popup initialFocus={initial}><Dialog.Close>Close</Dialog.Close></Dialog.Popup>
      </Dialog.Portal></Dialog.Root><input aria-label="Unrelated final" />
    </>);
    await view.user.click(view.getByText('Open'));
    await waitFor(() => expect(initial.current).toHaveFocus());
    await view.user.click(view.getByText('Close'));
    await waitFor(() => expect(view.queryByRole('dialog')).toBeNull());
    expect(view.getByRole('textbox', { name: 'Unrelated final' })).not.toHaveFocus();
  });
  for (const [label, target, shouldFocus] of [
    ['omitted', undefined, true], ['true', true, true], ['false', false, false],
    ['callback true', () => true, true], ['callback null', () => null, true],
    ['callback false', () => false, false], ['callback undefined', () => undefined, false],
  ] as const) {
    it(`initialFocus ${label}`, async () => {
      const view = await render(() => <Dialog.Root modal={false}>
        <Dialog.Trigger>Open</Dialog.Trigger><Dialog.Portal><Dialog.Popup initialFocus={target}>
          <input aria-label="First" /><Dialog.Close>Close</Dialog.Close>
        </Dialog.Popup></Dialog.Portal>
      </Dialog.Root>);
      await view.user.click(view.getByText('Open'));
      await waitFor(() => expect(view.getByRole('textbox')).toHaveProperty('isConnected', true));
      if (shouldFocus) await waitFor(() => expect(view.getByRole('textbox')).toHaveFocus());
      else expect(view.getByText('Open')).toHaveFocus();
    });
  }

  for (const kind of ['cell', 'accessor'] as const) {
    it(`initial/final focus ${kind} and external initial target`, async () => {
      const initial = { current: null as HTMLInputElement | null };
      const final = { current: null as HTMLInputElement | null };
      const view = await render(() => <>
        <input aria-label="Initial" ref={(node) => { initial.current = node; }} />
        <input aria-label="Final" ref={(node) => { final.current = node; }} />
        <Dialog.Root><Dialog.Backdrop /><Dialog.Trigger>Open</Dialog.Trigger><Dialog.Portal>
          <Dialog.Popup initialFocus={kind === 'cell' ? initial : () => initial.current} finalFocus={kind === 'cell' ? final : () => final.current}>
            <Dialog.Close>Close</Dialog.Close>
          </Dialog.Popup>
        </Dialog.Portal></Dialog.Root>
      </>);
      await view.user.click(view.getByText('Open'));
      await waitFor(() => expect(initial.current).toHaveFocus());
      await view.user.click(view.getByText('Close'));
      await waitFor(() => expect(final.current).toHaveFocus());
    });
  }

  for (const [label, target, returns] of [
    ['omitted', undefined, true], ['true', true, true], ['false', false, false],
    ['callback true', () => true, true], ['callback null', () => null, true],
    ['callback false', () => false, false], ['callback undefined', () => undefined, false],
  ] as const) {
    it(`finalFocus ${label}`, async () => {
      const view = await render(() => <Dialog.Root modal={false}><Dialog.Trigger>Open</Dialog.Trigger>
        <Dialog.Portal><Dialog.Popup finalFocus={target}><Dialog.Close>Close</Dialog.Close></Dialog.Popup></Dialog.Portal>
      </Dialog.Root>);
      const trigger = view.getByText('Open');
      await view.user.click(trigger);
      await view.user.click(view.getByText('Close'));
      await waitFor(() => expect(view.queryByRole('dialog')).toBeNull());
      if (returns) await waitFor(() => expect(trigger).toHaveFocus());
      else expect(trigger).not.toHaveFocus();
    });
  }

  it('touch defaults to popup and callbacks see the latest interaction type', async () => {
    const view = await render(() => <Dialog.Root modal={false}><Dialog.Trigger>Open</Dialog.Trigger>
      <Dialog.Portal><Dialog.Popup><input aria-label="Input" /><Dialog.Close>Close</Dialog.Close></Dialog.Popup></Dialog.Portal>
    </Dialog.Root>);
    const trigger = view.getByText('Open');
    firePointer.down(trigger, { pointerType: 'touch', timeStamp: 10 });
    fireEvent.click(trigger, { detail: 1 });
    await waitFor(() => expect(view.getByRole('dialog')).toHaveFocus());
    expect(view.getByRole('textbox')).not.toHaveFocus();
  });

  it('initialFocus receives keyboard then touch after reopening, and finalFocus sees close interaction', async () => {
    const initial = vi.fn(() => false);
    const final = vi.fn(() => true);
    const view = await render(() => <Dialog.Root modal={false}><Dialog.Trigger>Open</Dialog.Trigger>
      <Dialog.Portal><Dialog.Popup initialFocus={initial} finalFocus={final}><Dialog.Close>Close</Dialog.Close></Dialog.Popup></Dialog.Portal>
    </Dialog.Root>);
    const trigger = view.getByText('Open');
    trigger.focus();
    await view.user.keyboard('[Enter]');
    await waitFor(() => expect(initial).toHaveBeenLastCalledWith('keyboard'));
    await view.user.keyboard('[Escape]');
    await waitFor(() => expect(final).toHaveBeenLastCalledWith('keyboard'));
    await waitFor(() => expect(view.queryByRole('dialog')).toBeNull());
    firePointer.down(trigger, { pointerType: 'touch', timeStamp: 50 });
    fireEvent.click(trigger, { detail: 1 });
    await waitFor(() => expect(initial).toHaveBeenLastCalledWith('touch'));
    await view.user.click(view.getByText('Close'));
    await waitFor(() => expect(final).toHaveBeenLastCalledWith('mouse'));
  });

  it('initial focus callback is not called during closing', async () => {
    const initialFocus = vi.fn(() => true);
    const view = await render(() => <Dialog.Root modal={false}><Dialog.Trigger>Open</Dialog.Trigger>
      <Dialog.Portal><Dialog.Popup initialFocus={initialFocus}><Dialog.Close>Close</Dialog.Close></Dialog.Popup></Dialog.Portal>
    </Dialog.Root>);
    await view.user.click(view.getByText('Open'));
    await waitFor(() => expect(view.getByText('Close')).toHaveFocus());
    expect(initialFocus).toHaveBeenCalledTimes(1);
    await view.user.click(view.getByText('Close'));
    expect(initialFocus).toHaveBeenCalledTimes(1);
  });

  it('source element-returning initialFocus runs once and is not called during closing', async () => {
    const second = { current: null as HTMLInputElement | null };
    const initialFocus = vi.fn(() => second.current);
    const view = await render(() => <div><Dialog.Root modal={false}>
      <Dialog.Trigger>Open</Dialog.Trigger><Dialog.Portal><Dialog.Popup initialFocus={initialFocus}>
        <input aria-label="First" /><input aria-label="Second" ref={(node) => { second.current = node; }} />
        <Dialog.Close>Close</Dialog.Close>
      </Dialog.Popup></Dialog.Portal>
    </Dialog.Root></div>);
    const trigger = view.getByText('Open');
    await view.user.click(trigger);
    await waitFor(() => expect(second.current).toHaveFocus());
    expect(initialFocus).toHaveBeenCalledTimes(1);
    await view.user.click(view.getByText('Close'));
    await waitFor(() => expect(trigger).toHaveFocus());
    expect(initialFocus).toHaveBeenCalledTimes(1);
  });
});
