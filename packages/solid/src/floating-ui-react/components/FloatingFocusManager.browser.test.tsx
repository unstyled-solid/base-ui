import { expect, vi } from 'vitest';
import { createSignal } from 'solid-js';
import { browserCase, createRenderer, flushMicrotasks, waitFor } from '../../../test';
import { Dialog } from '../../dialog';
import { AlertDialog } from '../../alert-dialog';

browserCase({ source: 'packages/react/src/dialog/root/DialogRoot.test.tsx', case: 'nonmodal body blur does not seed unrelated return focus', environment: 'browser', issue: 'bsolid-review-foundations' }, async () => {
  const { userEvent } = await import('vitest/browser');
  const view = await createRenderer().render(() => {
    const [open, setOpen] = createSignal(false);
    return <><div style={{ width: '100px', height: '100px' }} onClick={() => setOpen(true)}>Open confirmation</div>
      <Dialog.Root open modal={false}><Dialog.Portal><Dialog.Popup><textarea aria-label="Nonmodal field" /></Dialog.Popup></Dialog.Portal></Dialog.Root>
      <AlertDialog.Root open={open()} onOpenChange={setOpen}><AlertDialog.Portal><AlertDialog.Popup><AlertDialog.Close>Go back</AlertDialog.Close></AlertDialog.Popup></AlertDialog.Portal></AlertDialog.Root>
    </>;
  });
  const field = view.getByRole('textbox', { name: 'Nonmodal field' });
  await userEvent.click(field); expect(field).toHaveFocus();
  await userEvent.click(view.getByText('Open confirmation'));
  await waitFor(() => expect(view.getByRole('button', { name: 'Go back' })).toHaveFocus());
  await userEvent.keyboard('{Enter}');
  await waitFor(() => expect(view.queryByRole('button', { name: 'Go back' })).toBeNull());
  expect(field).not.toHaveFocus();
  view.unmount();
});

browserCase({ source: 'packages/react/src/dialog/root/DialogRoot.test.tsx', case: 'closed-root inside capture does not suppress a separate outside press', environment: 'browser', issue: 'bsolid-review-foundations' }, async () => {
  const host = document.body.appendChild(document.createElement('div'));
  const shadow = host.attachShadow({ mode: 'closed' });
  const outside = shadow.appendChild(document.createElement('button')); outside.textContent = 'Outside';
  const container = shadow.appendChild(document.createElement('div'));
  const changed = vi.fn();
  const view = await createRenderer().render(() => <Dialog.Root defaultOpen modal={false} onOpenChange={changed}>
    <Dialog.Portal container={shadow}><Dialog.Popup data-testid="closed-popup"><button>Inside</button></Dialog.Popup></Dialog.Portal>
  </Dialog.Root>, { container });
  try {
    const popup = shadow.querySelector('[data-testid="closed-popup"]')!;
    (popup.querySelector('button') as HTMLElement).click(); await flushMicrotasks();
    expect(changed).not.toHaveBeenCalled(); expect(popup.isConnected).toBe(true);
    outside.click(); await flushMicrotasks();
    expect(changed).toHaveBeenCalledExactlyOnceWith(false, expect.objectContaining({ reason: 'outside-press' }));
    await waitFor(() => expect(shadow.querySelector('[data-testid="closed-popup"]')).toBeNull());
  } finally { view.unmount(); host.remove(); }
});
