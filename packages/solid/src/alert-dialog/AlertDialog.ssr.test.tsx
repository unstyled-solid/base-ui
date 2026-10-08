import { isServer, renderToString } from '@solidjs/web';
import { describe, expect, it, vi } from 'vitest';
import { AlertDialog } from './index';

describe('AlertDialog server ownership through real Dialog', () => {
  it('leaves detached handles inert and does not serialize client-only popup content', async () => {
    expect(isServer).toBe(true);
    const handle = AlertDialog.createHandle<number>();
    const serverStore = handle.serverStore;
    const change = vi.fn();
    const actionsRef: { current: AlertDialog.Root.Actions | null } = { current: null };
    const html = await renderToString(() => <>
      <AlertDialog.Root handle={handle} defaultOpen defaultTriggerId="alert-server-trigger" actionsRef={actionsRef} onOpenChange={change}>
        <AlertDialog.Portal><AlertDialog.Popup>Client-only alert</AlertDialog.Popup></AlertDialog.Portal>
      </AlertDialog.Root>
      <AlertDialog.Trigger handle={handle} id="alert-server-trigger" payload={7}>Open</AlertDialog.Trigger>
    </>, { renderId: 'alert-server-' });
    expect(html).toContain('aria-haspopup="dialog"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).not.toContain('data-popup-open');
    expect(html).not.toContain('Client-only alert');
    expect(handle.store).toBe(serverStore);
    expect(handle.isOpen).toBe(false);
    expect(actionsRef.current).toBeNull();
    expect(change).not.toHaveBeenCalled();
  });

  it('does not attach a shared handle across overlapping server requests', async () => {
    const handle = AlertDialog.createHandle();
    const requests = await Promise.all(['first-', 'second-'].map((renderId) => renderToString(() => <>
      <AlertDialog.Root handle={handle} defaultOpen />
      <AlertDialog.Trigger handle={handle}>Open</AlertDialog.Trigger>
    </>, { renderId })));
    for (const html of requests) expect(html).toContain('aria-expanded="false"');
    expect(requests[0]).not.toBe(requests[1]);
    expect(handle.store).toBe(handle.serverStore);
    expect(handle.isOpen).toBe(false);
  });
});
