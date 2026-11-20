import { isServer, renderToString } from '@solidjs/web';
import { createRoot, OBSERVE } from 'solid-js';
import { expect, it } from 'vitest';
import { createPopup } from './createPopup';
import { createMenuStore } from '../../menu/store/MenuStore';
import { Popover } from '../../popover';
import { Dialog } from '../../dialog';
import { PreviewCard } from '../../preview-card';
import { Tooltip } from '../../tooltip';

it('keeps deferred popup and menu setup writes pure while the server owner remains alive', async () => {
  expect(isServer).toBe(true);
  const diagnostics: string[] = [];
  const unsubscribe = OBSERVE?.diagnostics.subscribe(event => diagnostics.push(event.code));
  let dispose!: () => void;
  try {
    createRoot(stop => {
      dispose = stop;
      const popup = createPopup({});
      popup.setInteractionProps({ reference: { 'aria-label': 'browser interaction' } });
      const menu = createMenuStore({ parent: { type: undefined }, rootId: 'menu', floatingId: 'popup' });
      menu.setFilterTriggerProps({ 'aria-haspopup': 'dialog' });
    }, { id: 'deferred-interactions' });
    // A synchronous assertion misses the original queued SERVER_WRITE.
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(diagnostics).toEqual([]);
  } finally {
    dispose();
    unsubscribe?.();
  }
});

it.each([
  ['Popover', () => <Popover.Root><Popover.Trigger>Toggle</Popover.Trigger></Popover.Root>],
  ['Dialog', () => <Dialog.Root><Dialog.Trigger>Toggle</Dialog.Trigger></Dialog.Root>],
  ['PreviewCard', () => <PreviewCard.Root><PreviewCard.Trigger>Toggle</PreviewCard.Trigger></PreviewCard.Root>],
  ['Tooltip', () => <Tooltip.Root><Tooltip.Trigger>Toggle</Tooltip.Trigger></Tooltip.Root>],
] as const)('%s SSR stays diagnostic-clean through the deferred checkpoint', async (_name, render) => {
  const html = await renderToString(render);
  expect(html).toContain('Toggle');
  await new Promise(resolve => setTimeout(resolve, 0));
  // The SSR harness asserts both structured diagnostics and console messages.
});
