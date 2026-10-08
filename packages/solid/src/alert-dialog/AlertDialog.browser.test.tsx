import { screen, waitFor } from '@testing-library/dom';
import { afterEach, beforeEach, describe, expect, vi } from 'vitest';
import { createSignal } from 'solid-js';
import { browserCase, createRenderer } from '../../test';
import { AlertDialog } from './index';
import { Dialog } from '../dialog';

const source = 'packages/react/src/alert-dialog/root/AlertDialogRoot.test.tsx';
const { render, renderProps } = createRenderer();
const replay = (name: string, body: () => Promise<void>) => browserCase({
  source, case: name, environment: 'browser', issue: 'bsolid-review-alert-dialog',
}, body);

describe('AlertDialog retained source browser scenarios', () => {
  for (const detached of [false, true]) {
    replay(`opens with any of three ${detached ? 'detached' : 'within Root'} triggers`, async () => {
      const handle = detached ? AlertDialog.createHandle() : undefined;
      const Triggers = () => <>
        <AlertDialog.Trigger handle={handle}>Trigger 1</AlertDialog.Trigger>
        <AlertDialog.Trigger handle={handle}>Trigger 2</AlertDialog.Trigger>
        <AlertDialog.Trigger handle={handle}>Trigger 3</AlertDialog.Trigger>
      </>;
      const view = await render(() => <>
        {detached && <Triggers />}
        <AlertDialog.Root handle={handle}>
          {!detached && <Triggers />}
          <AlertDialog.Portal><AlertDialog.Popup><AlertDialog.Close>Close</AlertDialog.Close></AlertDialog.Popup></AlertDialog.Portal>
        </AlertDialog.Root>
      </>);
      expect(screen.queryByRole('alertdialog')).toBeNull();
      for (const label of ['Trigger 1', 'Trigger 2', 'Trigger 3']) {
        await view.user.click(screen.getByText(label));
        await screen.findByRole('alertdialog');
        await view.user.click(screen.getByText('Close'));
        await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
      }
    });
  }

  function ReparentedTrigger(props: { handle: AlertDialog.Handle<unknown>; nesting: number }) {
    const Trigger = () => <AlertDialog.Trigger handle={props.handle}>Trigger</AlertDialog.Trigger>;
    return <>{props.nesting === 0 ? <Trigger /> : props.nesting === 1 ? <div><Trigger /></div> :
      props.nesting === 2 ? <div><div><Trigger /></div></div> : <div><div><div><Trigger /></div></div></div>}</>;
  }

  for (const sequence of [[3, 2, 1, 0], [0, 1, 2, 3]]) {
    for (const recreateHandle of [false, true]) {
      replay(`detached trigger reparenting ${sequence.join('→')} (recreateHandle=${recreateHandle})`, async () => {
        const handle = AlertDialog.createHandle();
        const view = await renderProps((props: { handle: AlertDialog.Handle<unknown>; nesting: number }) => <>
          <ReparentedTrigger handle={props.handle} nesting={props.nesting} />
          <AlertDialog.Root handle={props.handle}><AlertDialog.Portal><AlertDialog.Popup>
            <span>Alert dialog content</span><AlertDialog.Close>Close</AlertDialog.Close>
          </AlertDialog.Popup></AlertDialog.Portal></AlertDialog.Root>
        </>, { handle, nesting: sequence[0] });
        for (const nesting of sequence) {
          await view.setProps({ nesting, handle: recreateHandle ? AlertDialog.createHandle() : handle });
          await view.user.click(screen.getByText('Trigger'));
          await screen.findByRole('alertdialog');
          expect(screen.getByText('Alert dialog content')).toBeVisible();
          await view.user.click(screen.getByText('Close'));
          await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
        }
      });
    }
  }

  replay('fixed-nesting detached trigger stays clickable across two closed-cycle handle recreations', async () => {
    const view = await renderProps((props: { handle: AlertDialog.Handle<unknown> }) => <>
      <AlertDialog.Trigger handle={props.handle}>Trigger</AlertDialog.Trigger>
      <AlertDialog.Root handle={props.handle}><AlertDialog.Portal><AlertDialog.Popup>
        <span>Alert dialog content</span><AlertDialog.Close>Close</AlertDialog.Close>
      </AlertDialog.Popup></AlertDialog.Portal></AlertDialog.Root>
    </>, { handle: AlertDialog.createHandle() });
    for (let cycle = 0; cycle < 3; cycle++) {
      if (cycle) await view.setProps({ handle: AlertDialog.createHandle() });
      await view.user.click(screen.getByText('Trigger'));
      expect(await screen.findByText('Alert dialog content')).toBeVisible();
      await view.user.click(screen.getByText('Close'));
      await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    }
  });

  replay('modal inertness and keyboard tab cycling use the real Dialog focus manager', async () => {
    const view = await render(() => <>
      <button>Outside</button>
      <AlertDialog.Root><AlertDialog.Trigger>Open</AlertDialog.Trigger>
        <AlertDialog.Portal><AlertDialog.Popup>
          <input aria-label="First" /><AlertDialog.Close>Close</AlertDialog.Close>
        </AlertDialog.Popup></AlertDialog.Portal>
      </AlertDialog.Root>
    </>);
    const outside = screen.getByText('Outside');
    await view.user.click(screen.getByText('Open'));
    await waitFor(() => expect(screen.getByRole('textbox')).toHaveFocus());
    expect(screen.queryByRole('button', { name: 'Outside' })).toBeNull();
    expect(screen.getByRole('presentation', { hidden: true })).toBeInTheDocument();
    await view.user.tab();
    expect(screen.getByText('Close')).toHaveFocus();
    await view.user.tab();
    expect(screen.getByRole('textbox')).toHaveFocus();
    await view.user.tab({ shift: true });
    expect(screen.getByText('Close')).toHaveFocus();
    await view.user.click(screen.getByText('Close'));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Outside' })).toBe(outside));
  });

  // Relevant DialogRoot.test.tsx nested alert-dialog portal matrix.
  for (const [outerTarget, nestedTarget] of [
    ['shadow', 'default'], ['shadow', 'shadow'], ['shadow', 'body'],
    ['default', 'default'], ['default', 'shadow'],
  ] as const) {
    browserCase({ source: 'packages/react/src/dialog/root/DialogRoot.test.tsx',
      case: `nested alert dialog keeps parent open (outer=${outerTarget}, nested=${nestedTarget})`,
      environment: 'browser', issue: 'bsolid-review-alert-dialog' }, async () => {
      const host = document.createElement('div');
      document.body.append(host);
      const shadow = host.attachShadow({ mode: 'open' });
      const parentChange = vi.fn();
      try {
        const view = await render(() => <Dialog.Root defaultOpen onOpenChange={parentChange}>
          <Dialog.Portal container={outerTarget === 'shadow' ? shadow : undefined}>
            <Dialog.Backdrop /><Dialog.Popup data-testid="outer">
              <AlertDialog.Root><AlertDialog.Trigger>Open nested</AlertDialog.Trigger>
                <AlertDialog.Portal container={nestedTarget === 'shadow' ? shadow : nestedTarget === 'body' ? document.body : undefined}>
                  <AlertDialog.Backdrop /><AlertDialog.Popup data-testid="nested">
                    <AlertDialog.Close>Close nested</AlertDialog.Close>
                  </AlertDialog.Popup>
                </AlertDialog.Portal>
              </AlertDialog.Root>
            </Dialog.Popup>
          </Dialog.Portal>
        </Dialog.Root>);
        const query = (selector: string) => shadow.querySelector<HTMLElement>(selector) ?? document.querySelector<HTMLElement>(selector);
        const trigger = query('button')!;
        await view.user.click(trigger);
        await waitFor(() => expect(query('[data-testid="nested"]')).not.toBeNull());
        await view.user.click(query('[data-testid="nested"] button')!);
        await waitFor(() => expect(query('[data-testid="nested"]')).toBeNull());
        expect(query('[data-testid="outer"]')).toHaveAttribute('data-open');
        expect(parentChange).not.toHaveBeenCalled();
        view.unmount();
      } finally { host.remove(); }
    });
  }
});

describe('AlertDialog source completion callbacks', () => {
  let previous: boolean | undefined;
  beforeEach(() => { previous = globalThis.BASE_UI_ANIMATIONS_DISABLED; globalThis.BASE_UI_ANIMATIONS_DISABLED = false; });
  afterEach(() => { globalThis.BASE_UI_ANIMATIONS_DISABLED = previous; });

  for (const animation of [false, true]) {
    for (const initiallyOpen of [false, true]) {
      replay(`source external-button completion ${initiallyOpen ? 'close' : 'open'} (${animation ? '1ms' : 'no animation'})`, async () => {
        globalThis.BASE_UI_ANIMATIONS_DISABLED = !animation;
        const complete = vi.fn();
        const view = await render(() => {
          const [open, setOpen] = createSignal(initiallyOpen);
          return <>
            {animation && <style>{`@keyframes alert-source-fade { ${initiallyOpen ? 'to' : 'from'} { opacity: 0; } }
              .alert-source-animation[${initiallyOpen ? 'data-ending-style' : 'data-starting-style'}] { animation: alert-source-fade 1ms; }`}</style>}
            <button onClick={() => setOpen(!initiallyOpen)}>{initiallyOpen ? 'Close externally' : 'Open externally'}</button>
            <AlertDialog.Root open={open()} onOpenChange={setOpen} onOpenChangeComplete={complete}>
              <AlertDialog.Portal><AlertDialog.Popup data-testid="source-popup" class={animation ? 'alert-source-animation' : undefined} /></AlertDialog.Portal>
            </AlertDialog.Root>
          </>;
        });
        if (initiallyOpen) {
          expect(screen.getByTestId('source-popup')).toBeInTheDocument();
          await waitFor(() => expect(complete.mock.calls[0]?.[0]).toBe(true));
        }
        await view.user.click(screen.getByText(initiallyOpen ? 'Close externally' : 'Open externally'));
        if (initiallyOpen) {
          await waitFor(() => expect(screen.queryByTestId('source-popup')).toBeNull());
          expect(complete.mock.calls[0][0]).toBe(true);
          expect(complete.mock.lastCall?.[0]).toBe(false);
        } else {
          await waitFor(() => expect(complete.mock.calls[0]?.[0]).toBe(true));
          expect(screen.getByTestId('source-popup')).toBeInTheDocument();
          // Source2 is synchronous StrictMode effect replay; Solid owns one
          // cycle. See dialog.json#/currentRepair/strictModeCompletionAdaptation.
          if (!animation) expect(complete).toHaveBeenCalledTimes(1);
        }
      });
    }
  }

  for (const animation of [false, true]) {
    for (const initiallyOpen of [false, true]) {
      replay(`onOpenChangeComplete ${initiallyOpen ? 'close' : 'open'} (animation=${animation})`, async () => {
        const complete = vi.fn();
        const view = await renderProps((props: { open: boolean }) => <AlertDialog.Root open={props.open} onOpenChangeComplete={complete}>
          <AlertDialog.Portal>
            {animation && <style>{'@keyframes alert-review-fade { from { opacity: .5 } to { opacity: 1 } } .alert-review-animation[data-starting-style], .alert-review-animation[data-ending-style] { animation: alert-review-fade 20ms; }'}</style>}
            <AlertDialog.Popup class={animation ? 'alert-review-animation' : undefined} data-testid="animated-popup" />
          </AlertDialog.Portal>
        </AlertDialog.Root>, { open: initiallyOpen });
        if (initiallyOpen) await waitFor(() => expect(complete).toHaveBeenCalledWith(true));
        await view.setProps({ open: !initiallyOpen });
        await waitFor(() => expect(complete).toHaveBeenLastCalledWith(!initiallyOpen));
        if (initiallyOpen) expect(screen.queryByTestId('animated-popup')).toBeNull();
        else expect(screen.getByRole('alertdialog')).toHaveAttribute('data-open');
      });
    }
  }
});
