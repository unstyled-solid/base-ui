import { renderToString, isServer } from '@solidjs/web';
import { untrack } from 'solid-js';
import { expect, it, vi } from 'vitest';
import { Popover } from './index';

it('Popover SSR leaves handles detached and does not invoke client actions/focus/portal work', async () => {
  expect(isServer).toBe(true);
  const handle = Popover.createHandle<number>();
  const clientWork = vi.fn();
  const html = await renderToString(() => <Popover.Root handle={handle} actionsRef={clientWork}>
    <Popover.Trigger id="trigger" payload={42}>Toggle</Popover.Trigger>
    <Popover.Portal keepMounted><Popover.Positioner><Popover.Popup initialFocus={clientWork}>Client content</Popover.Popup></Popover.Positioner></Popover.Portal>
  </Popover.Root>, { renderId: 'popover-ssr' });
  expect(html).toContain('Toggle');
  expect(html).toContain('aria-expanded="false"');
  expect(html).not.toContain('Client content');
  expect(untrack(() => handle.isOpen)).toBe(false);
  expect(clientWork).not.toHaveBeenCalled();
});

for (const controlled of [false, true]) {
  it.each([false, true, 'trap-focus'] as const)(`Popover SSR projects initially open trigger ownership without client work (controlled=${controlled}, modal=%s)`, async (modal) => {
    const handle = Popover.createHandle<number>();
    const clientWork = vi.fn();
    const html = await renderToString(() => <Popover.Root handle={handle} modal={modal}
      open={controlled ? true : undefined} defaultOpen={!controlled}
      triggerId={controlled ? 'trigger' : undefined} defaultTriggerId={controlled ? undefined : 'trigger'}
      actionsRef={clientWork} onOpenChange={clientWork} onOpenChangeComplete={clientWork}>
      {(state) => <>
        <Popover.Trigger id="trigger" payload={42} ref={clientWork}>Toggle</Popover.Trigger>
        <output>{state.payload ?? 'none'}</output><Popover.Close ref={clientWork}>Always available</Popover.Close>
        <Popover.Portal keepMounted><Popover.Backdrop /><Popover.Positioner>
          <Popover.Popup initialFocus={clientWork} finalFocus={clientWork}>Client content</Popover.Popup>
        </Popover.Positioner></Popover.Portal>
      </>}
    </Popover.Root>, { renderId: `popover-open-${controlled}-${modal}` });
    expect(html).toContain('aria-expanded="true"');
    expect(html).toContain('Toggle');
    expect(html).toContain('Always available');
    expect(html).toContain('none');
    expect(html).not.toContain('Client content');
    expect(html).not.toContain('role="dialog"');
    expect(untrack(() => handle.isOpen)).toBe(false);
    expect(clientWork).not.toHaveBeenCalled();
  });
}
