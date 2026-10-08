import { createSignal } from 'solid-js';
import { expect, vi } from 'vitest';
import { createRenderer, waitFor } from '../../../test';
import { Dialog } from '../index';

/** Browser owner supplies the Chromium CDP lane. Synthetic events cannot prove this source regression. */
export interface DialogTrustedPointerDriver {
  send(command: 'Input.dispatchMouseEvent', parameters: {
    type: 'mouseMoved' | 'mousePressed' | 'mouseReleased'; x: number; y: number;
    button?: 'left'; buttons?: number; clickCount?: number;
  }): Promise<unknown>;
}
export async function replayTrustedPointerDialogGesture(driver: DialogTrustedPointerDriver) {
  const { render } = createRenderer();
  const changed = vi.fn();
  const clicks: MouseEvent[] = [];
  const view = await render(() => {
    const [open, setOpen] = createSignal(false);
    return <><button onPointerDown={() => setOpen(true)}>Open on pointerdown</button>
      <Dialog.Root open={open()} onOpenChange={(next, details) => { changed(next, details.reason); setOpen(next); }}>
        <Dialog.Portal><Dialog.Backdrop style={{ position: 'fixed', inset: '0' }} />
          <Dialog.Popup data-testid="trusted-popup">Dialog</Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </>;
  });
  const trigger = view.getByText('Open on pointerdown');
  const frame = window.frameElement as HTMLIFrameElement | null;
  const frameRect = frame?.getBoundingClientRect();
  const rect = trigger.getBoundingClientRect();
  const center = { x: (frameRect?.left ?? 0) + (frame?.clientLeft ?? 0) + rect.left + rect.width / 2,
    y: (frameRect?.top ?? 0) + (frame?.clientTop ?? 0) + rect.top + rect.height / 2 };
  const record = (event: MouseEvent) => { clicks.push(event); };
  document.addEventListener('click', record, true);
  try {
    await driver.send('Input.dispatchMouseEvent', { type: 'mouseMoved', ...center });
    await driver.send('Input.dispatchMouseEvent', { type: 'mousePressed', ...center, button: 'left', buttons: 1, clickCount: 1 });
    await view.findByTestId('trusted-popup');
    await driver.send('Input.dispatchMouseEvent', { type: 'mouseReleased', ...center, button: 'left', buttons: 0, clickCount: 1 });
    await waitFor(() => expect(clicks.some((event) => event.isTrusted)).toBe(true));
    const click = clicks.find((event) => event.isTrusted)!;
    expect(click.target).not.toBe(trigger);
    expect(view.getByTestId('trusted-popup').contains(click.target as Node)).toBe(false);
    expect(changed).not.toHaveBeenCalledWith(false, 'outside-press');
    await driver.send('Input.dispatchMouseEvent', { type: 'mousePressed', ...center, button: 'left', buttons: 1, clickCount: 1 });
    await driver.send('Input.dispatchMouseEvent', { type: 'mouseReleased', ...center, button: 'left', buttons: 0, clickCount: 1 });
    await waitFor(() => expect(view.queryByTestId('trusted-popup')).toBeNull());
    expect(changed).toHaveBeenCalledWith(false, 'outside-press');
  } finally { document.removeEventListener('click', record, true); view.unmount(); }
}
