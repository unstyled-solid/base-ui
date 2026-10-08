import { describe, expect, it, vi } from 'vitest';
import { browserCase, createRenderer, popupConformanceTests } from '../../test';
import { screen, waitFor } from '@testing-library/dom';
import { AlertDialog } from './index';
import * as AlertDialogExports from './index';
import * as DialogExports from '../dialog';
import * as Dialog from '../dialog/index.parts';

// Source: packages/react/src/alert-dialog/root/AlertDialogRoot.test.tsx
// Baseline: 19511bb171f3b360b006c94cf6d07e53cb446505.
describe('AlertDialog', () => {
  const { render, renderProps } = createRenderer();

  popupConformanceTests({
    createComponent: (props) => (
      <AlertDialog.Root {...props.root}>
        <AlertDialog.Trigger {...props.trigger}>Open dialog</AlertDialog.Trigger>
        <AlertDialog.Portal {...props.portal}>
          <AlertDialog.Popup {...props.popup}>Dialog</AlertDialog.Popup>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    ),
    triggerMouseAction: 'click',
    expectedPopupRole: 'alertdialog',
    expectedAriaHasPopupValue: 'dialog',
    browserIssue: 'bsolid-c-alert-dialog',
  });

  it('exports the actual Dialog parts and a branded Dialog handle subclass', () => {
    for (const part of ['Backdrop', 'Close', 'Description', 'Popup', 'Portal', 'Title', 'Trigger', 'Viewport'] as const) {
      expect(AlertDialog[part]).toBe(Dialog[part]);
    }
    const handle = AlertDialog.createHandle();
    expect(handle).toBeInstanceOf(Dialog.Handle);
    expect(handle).toBeInstanceOf(AlertDialog.Handle);
    expect(AlertDialogExports.AlertDialogBackdropDataAttributes).toBe(DialogExports.DialogBackdropDataAttributes);
    expect(AlertDialogExports.AlertDialogCloseDataAttributes).toBe(DialogExports.DialogCloseDataAttributes);
    expect(AlertDialogExports.AlertDialogPopupCssVariables).toBe(DialogExports.DialogPopupCssVariables);
    expect(AlertDialogExports.AlertDialogPopupDataAttributes).toBe(DialogExports.DialogPopupDataAttributes);
    expect(AlertDialogExports.AlertDialogViewportDataAttributes).toBe(DialogExports.DialogViewportDataAttributes);
    expect(AlertDialogExports.AlertDialogTriggerDataAttributes).toEqual(DialogExports.DialogTriggerDataAttributes);
  });

  it('keeps controlled props, title and description live on the same popup', async () => {
    const view = await renderProps((props: { open: boolean; title: string; description: string }) => (
      <AlertDialog.Root open={props.open}>
        <AlertDialog.Portal>
          <AlertDialog.Viewport data-testid="viewport">
            <AlertDialog.Popup>
              <AlertDialog.Title>{props.title}</AlertDialog.Title>
              <AlertDialog.Description>{props.description}</AlertDialog.Description>
            </AlertDialog.Popup>
          </AlertDialog.Viewport>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    ), { open: true, title: 'Before', description: 'First' });
    const popup = screen.getByRole('alertdialog');
    expect(popup).toHaveAccessibleName('Before');
    expect(popup).toHaveAccessibleDescription('First');
    expect(view.getByText('Before').getAttribute('id')).toBe(popup.getAttribute('aria-labelledby'));
    expect(view.getByText('First').getAttribute('id')).toBe(popup.getAttribute('aria-describedby'));
    expect(screen.getByTestId('viewport')).toContainElement(popup);
    await view.setProps({ title: 'After', description: 'Second' });
    expect(screen.getByRole('alertdialog')).toBe(popup);
    expect(popup).toHaveAccessibleName('After');
    expect(popup).toHaveAccessibleDescription('Second');
    await view.setProps({ open: false });
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
  });

  it.each([false, true])('prevents outside dismissal; Escape still works (handle=%s)', async (detached) => {
    const handle = detached ? AlertDialog.createHandle() : undefined;
    const onOpenChange = vi.fn();
    const view = await render(() => (
      <AlertDialog.Root handle={handle} defaultOpen onOpenChange={onOpenChange}>
        <AlertDialog.Portal>
          <AlertDialog.Backdrop data-testid="backdrop" />
          <AlertDialog.Popup><AlertDialog.Close>Close</AlertDialog.Close></AlertDialog.Popup>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    ));
    await view.user.click(screen.getByTestId('backdrop'));
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    await view.user.keyboard('[Escape]');
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange.mock.lastCall?.[0]).toBe(false);
    expect(onOpenChange.mock.lastCall?.[1].reason).toBe('escape-key');
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
  });

  it('initializes detached handle ARIA and preserves it when controlled close is vetoed', async () => {
    const handle = AlertDialog.createHandle();
    const onOpenChange = vi.fn();
    const view = await render(() => <>
      <AlertDialog.Trigger handle={handle} id="alert-trigger">Open</AlertDialog.Trigger>
      <AlertDialog.Root handle={handle} open triggerId="alert-trigger" onOpenChange={onOpenChange}>
        <AlertDialog.Portal>
          <AlertDialog.Popup><AlertDialog.Close>Close</AlertDialog.Close></AlertDialog.Popup>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </>);
    const trigger = view.getByText('Open');
    const popup = screen.getByRole('alertdialog');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(trigger.getAttribute('aria-controls')).toBe(popup.id);
    await view.user.click(screen.getByText('Close'));
    expect(onOpenChange.mock.lastCall?.[1].reason).toBe('close-press');
    expect(screen.getByRole('alertdialog')).toBe(popup);
    expect(trigger).toHaveAttribute('data-popup-open');
    expect(handle.isOpen).toBe(true);
  });

  it('honors cancellation and reads a replaced change callback', async () => {
    const cancel = vi.fn((_open: boolean, details: AlertDialog.Root.ChangeEventDetails) => details.cancel());
    const accept = vi.fn();
    const view = await renderProps((props: { onOpenChange: AlertDialog.Root.Props['onOpenChange'] }) => (
      <AlertDialog.Root defaultOpen onOpenChange={props.onOpenChange}>
        <AlertDialog.Portal>
          <AlertDialog.Popup><AlertDialog.Close>Close</AlertDialog.Close></AlertDialog.Popup>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    ), { onOpenChange: cancel });
    await view.user.click(screen.getByText('Close'));
    expect(cancel).toHaveBeenCalledOnce();
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    await view.setProps({ onOpenChange: accept });
    await view.user.click(screen.getByText('Close'));
    expect(accept).toHaveBeenCalledOnce();
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
  });

  it('synchronizes initially open detached triggers with defaultTriggerId', async () => {
    const handle = AlertDialog.createHandle();
    const view = await render(() => <>
      <AlertDialog.Trigger handle={handle} id="initial-trigger">Open</AlertDialog.Trigger>
      <AlertDialog.Root handle={handle} defaultOpen defaultTriggerId="initial-trigger">
        <AlertDialog.Portal><AlertDialog.Popup>Content</AlertDialog.Popup></AlertDialog.Portal>
      </AlertDialog.Root>
    </>);
    const trigger = view.getByText('Open');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(trigger.getAttribute('aria-controls')).toBe(screen.getByRole('alertdialog').id);
    expect(handle.isOpen).toBe(true);
  });

  it('opens with a programmatic payload and closes imperatively', async () => {
    const handle = AlertDialog.createHandle<number>();
    const view = await render(() => <>
      <button onClick={() => handle.openWithPayload(8)}>Programmatic open</button>
      <AlertDialog.Root handle={handle}>
        {(state: { payload: number | undefined }) => <AlertDialog.Portal>
          <AlertDialog.Popup>
            <span data-testid="payload">{state.payload}</span>
            <button onClick={() => handle.close()}>Imperative close</button>
          </AlertDialog.Popup>
        </AlertDialog.Portal>}
      </AlertDialog.Root>
    </>);
    await view.user.click(view.getByText('Programmatic open'));
    expect(screen.getByTestId('payload').textContent).toBe('8');
    await view.user.click(screen.getByText('Imperative close'));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
  });

  for (const detached of [false, true]) {
    browserCase({
      source: 'packages/react/src/alert-dialog/root/AlertDialogRoot.test.tsx',
      case: `multiple ${detached ? 'detached' : 'within Root'} triggers: payload, DOM reuse and ARIA`,
      environment: 'browser',
      issue: 'bsolid-c-alert-dialog',
    }, async () => {
      const handle = detached ? AlertDialog.createHandle<number>() : undefined;
      const Triggers = () => <>
        <AlertDialog.Trigger handle={handle} payload={1}>Trigger 1</AlertDialog.Trigger>
        <AlertDialog.Trigger handle={handle} payload={2}>Trigger 2</AlertDialog.Trigger>
      </>;
      const view = await render(() => <>
        {detached && <Triggers />}
        <AlertDialog.Root<number> handle={handle}>
          {(state: { payload: number | undefined }) => <>
            {!detached && <Triggers />}
            <AlertDialog.Portal>
              <AlertDialog.Popup><span data-testid="payload">{state.payload}</span></AlertDialog.Popup>
            </AlertDialog.Portal>
          </>}
        </AlertDialog.Root>
      </>);
      const first = view.getByText('Trigger 1');
      const second = view.getByText('Trigger 2');
      expect(first).toHaveAttribute('aria-expanded', 'false');
      expect(second).toHaveAttribute('aria-expanded', 'false');
      await view.user.click(first);
       const popup = screen.getByRole('alertdialog');
       expect(screen.getByTestId('payload').textContent).toBe('1');
      expect(first).toHaveAttribute('aria-expanded', 'true');
      expect(second).toHaveAttribute('aria-expanded', 'false');
      expect(first.getAttribute('aria-controls')).not.toBeNull();
      expect(first.getAttribute('aria-controls')).toBe(popup.id);
      await view.user.click(second);
       expect(screen.getByRole('alertdialog')).toBe(popup);
       expect(screen.getByTestId('payload').textContent).toBe('2');
      expect(first).toHaveAttribute('aria-expanded', 'false');
      expect(second).toHaveAttribute('aria-expanded', 'true');
      expect(second.getAttribute('aria-controls')).toBe(popup.id);
    });
  }
});
