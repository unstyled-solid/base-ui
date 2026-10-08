import { describe, expect, it, vi } from 'vitest';
import { isServer, renderToString } from '@solidjs/web';
import { Tooltip } from './index';

describe('Tooltip SSR inert handles', () => {
  it('renders detached triggers without attaching roots or running callbacks', async () => {
    expect(isServer).toBe(true);
    const handle = Tooltip.createHandle<string>();
    const changed = vi.fn(); const completed = vi.fn();
    const html = await renderToString(() => <Tooltip.Provider>
      <Tooltip.Trigger handle={handle} id="trigger" payload="first">Trigger</Tooltip.Trigger>
      <Tooltip.Root handle={handle} defaultOpen defaultTriggerId="trigger" onOpenChange={changed} onOpenChangeComplete={completed}>
        <Tooltip.Portal><Tooltip.Positioner><Tooltip.Popup>Content</Tooltip.Popup></Tooltip.Positioner></Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>, { renderId: 'tooltip-request' });
    expect(html).toContain('id="trigger"'); expect(html).toContain('Trigger');
    expect(html).not.toContain('data-popup-open');
    expect(handle.isOpen).toBe(false); expect(handle.store).toBe(handle.serverStore);
    expect(changed).not.toHaveBeenCalled(); expect(completed).not.toHaveBeenCalled();
  });
  it('isolates simultaneous request IDs and never shares an attached root', async () => {
    const handle = Tooltip.createHandle();
    const app = () => <Tooltip.Root handle={handle}><Tooltip.Trigger>Trigger</Tooltip.Trigger></Tooltip.Root>;
    const [first, second] = await Promise.all([
      renderToString(app, { renderId: 'tooltip-first' }),
      renderToString(app, { renderId: 'tooltip-second' }),
    ]);
    const firstId = /id="([^"]+)"/.exec(first)?.[1]; const secondId = /id="([^"]+)"/.exec(second)?.[1];
    expect(firstId).toBeTruthy(); expect(secondId).toBeTruthy(); expect(firstId).not.toBe(secondId);
    expect(handle.store).toBe(handle.serverStore);
  });
});
