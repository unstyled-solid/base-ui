import { renderToString } from '@solidjs/web';
import { describe, expect, it, vi } from 'vitest';
import { Dialog } from './index';

describe('Dialog SSR detached ownership', () => {
  it('retains inert detached trigger snapshot even after a default-open root renders', async () => {
    const handle = Dialog.createHandle<number>();
    const initial = handle.serverStore;
    const changed = vi.fn();
    const html = await renderToString(() => <>
      <Dialog.Root handle={handle} defaultOpen defaultTriggerId="trigger" onOpenChange={changed}>
        <Dialog.Portal><Dialog.Popup>Client-only popup</Dialog.Popup></Dialog.Portal>
      </Dialog.Root>
      <Dialog.Trigger handle={handle} id="trigger" payload={7}>Trigger</Dialog.Trigger>
    </>, { renderId: 'dialog-server' });
    expect(html).toContain('aria-expanded="false"');
    expect(html).not.toContain('data-popup-open');
    expect(html).not.toContain('Client-only popup');
    expect(handle.serverStore).toBe(initial);
    expect(handle.store).toBe(initial);
    expect(handle.isOpen).toBe(false);
    expect(changed).not.toHaveBeenCalled();
  });

  it('sharing a handle across concurrent render requests does not attach either root', async () => {
    const handle = Dialog.createHandle();
    const requests = await Promise.all(['first', 'second'].map((renderId) => renderToString(() => <>
      <Dialog.Root handle={handle} defaultOpen />
      <Dialog.Trigger handle={handle}>Trigger</Dialog.Trigger>
    </>, { renderId })));
    for (const html of requests) expect(html).toContain('aria-expanded="false"');
    expect(requests[0]).not.toBe(requests[1]);
    expect(handle.isOpen).toBe(false);
  });
});
