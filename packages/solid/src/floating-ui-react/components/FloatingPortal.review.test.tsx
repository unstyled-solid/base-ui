import { expect, it, vi } from 'vitest';
import { untrack } from 'solid-js';
import { createRenderer } from '../../../test';
import { Dialog } from '../../dialog';
import { useDialogRootContext } from '../../dialog/root/DialogRootContext';
import type { DialogStore } from '../../dialog/store/DialogStore';
import { getDelegatedRoot } from '@solidjs/web';

it('an initially-open real popup retains its model/host and delivers the close request through the portal', async () => {
  let store!: DialogStore;
  const change = vi.fn();
  function Probe() { store = useDialogRootContext(); return null; }
  const view = await createRenderer().render(() => <Dialog.Root defaultOpen modal={false} onOpenChange={change}>
    <Probe /><Dialog.Portal><Dialog.Popup><Dialog.Close onClick={undefined}>Close review</Dialog.Close></Dialog.Popup></Dialog.Portal>
  </Dialog.Root>);
  const popup = view.getByRole('dialog');
  expect(untrack(() => store.state.popupElement)).toBe(popup);
  expect(untrack(() => store.state.open)).toBe(true);
  const close = view.getByRole('button', { name: 'Close review' });
  expect(close).not.toBeDisabled();
  expect(getDelegatedRoot(close)).toBe(view.container);
  const native = vi.fn(); close.addEventListener('click', native);
  await view.user.click(close);
  expect(native).toHaveBeenCalledOnce();
  expect(native.mock.calls[0]![0].target).toBe(close);
  expect(change).toHaveBeenCalledWith(false, expect.objectContaining({ reason: 'close-press' }));
  expect(untrack(() => store.state.open)).toBe(false);
  expect(view.queryByRole('dialog')).toBeNull();
});
