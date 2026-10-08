import { describe, expect, vi, beforeEach, afterEach } from 'vitest';
import { createSignal, onCleanup, untrack } from 'solid-js';
import { browserCase, createRenderer, waitFor, firePointer, fireEvent, wait, flushMicrotasks } from '../../test';
import { Dialog } from './index';
import { createRenderDialogRoot } from './root/createRenderDialogRoot';
import { createTimeout } from '../utils/createTimeout';
import { replayTrustedPointerDialogGesture, type DialogTrustedPointerDriver } from './tests/trustedPointerReplay';
import { useDialogRootContext } from './root/DialogRootContext';

const source = 'packages/react/src/dialog/root/DialogRoot.test.tsx';
const popupSource = 'packages/react/src/dialog/popup/DialogPopup.test.tsx';
const { render, renderProps } = createRenderer();
const browser = (name: string, body: () => Promise<void>, file = source) => browserCase({ source: file, case: name, environment: 'browser', issue: 'bsolid-browser' }, body);

describe('Dialog browser qualification (real layout and animations)', () => {
  const settings = globalThis as typeof globalThis & { BASE_UI_ANIMATIONS_DISABLED?: boolean };
  let animationsDisabled: boolean | undefined;
  beforeEach(() => { animationsDisabled = settings.BASE_UI_ANIMATIONS_DISABLED; settings.BASE_UI_ANIMATIONS_DISABLED = true; });
  afterEach(() => { settings.BASE_UI_ANIMATIONS_DISABLED = animationsDisabled; });
  browser('ignores a trusted click whose pointerdown opened the dialog (Chromium CDP)', async () => {
    const driver = (globalThis as typeof globalThis & { BASE_UI_DIALOG_TRUSTED_POINTER_DRIVER?: DialogTrustedPointerDriver }).BASE_UI_DIALOG_TRUSTED_POINTER_DRIVER;
    if (!driver) throw new Error('Dialog trusted pointer source replay requires the Chromium qualification lane to install BASE_UI_DIALOG_TRUSTED_POINTER_DRIVER.');
    await replayTrustedPointerDialogGesture(driver);
  });
  for (const mode of ['dialog', 'alert-dialog'] as const) {
    for (const [outerTarget, innerTarget] of [['shadow', undefined], ['shadow', 'shadow'], ['shadow', 'body'], [undefined, undefined], [undefined, 'shadow']] as const) {
      for (const modal of mode === 'dialog' ? [true, false] as const : [true] as const) {
        browser(`closed shadow parent remains open: ${mode}/${modal}/${outerTarget}/${innerTarget}`, async () => {
          const host = document.body.appendChild(document.createElement('div'));
          const shadow = host.attachShadow({ mode: 'closed' });
          const container = shadow.appendChild(document.createElement('div'));
          const InnerRoot = (props: Dialog.Root.Props) => createRenderDialogRoot(mode, props);
          const changed = vi.fn();
          try {
            const view = await render(() => <Dialog.Root defaultOpen modal={modal} onOpenChange={changed}>
              <Dialog.Portal container={outerTarget === 'shadow' ? shadow : undefined}>
                {modal && <Dialog.Backdrop />}
                <Dialog.Popup data-testid="outer"><InnerRoot modal={modal}>
                  <Dialog.Trigger data-testid="open-inner">Open nested</Dialog.Trigger>
                  <Dialog.Portal container={innerTarget === 'shadow' ? shadow : innerTarget === 'body' ? document.body : undefined}>
                    <Dialog.Popup data-testid="inner"><Dialog.Close data-testid="close-inner">Close nested</Dialog.Close></Dialog.Popup>
                  </Dialog.Portal>
                </InnerRoot></Dialog.Popup>
              </Dialog.Portal>
            </Dialog.Root>, { container });
            const query = (id: string) => (shadow.querySelector(`[data-testid="${id}"]`) ?? document.querySelector(`[data-testid="${id}"]`)) as HTMLElement;
            expect(query('outer')).not.toBeNull();
            for (const gesture of ['source-virtual', 'pointer'] as const) {
              const click = async (id: string) => {
                if (gesture === 'source-virtual') {
                  // The pinned closed-root helper uses native element.click().
                  // Await RC13's ordinary checkpoint rather than porting flushSync.
                  query(id).click();
                  await flushMicrotasks();
                } else await view.user.click(query(id));
              };
              await click('open-inner');
              // The parent must not receive a close for either opening gesture.
              expect(changed.mock.calls.map(([open, details]) => [open, details.reason, details.event.type])).toEqual([]);
              await waitFor(() => expect(query('inner')).not.toBeNull());
              await click('close-inner');
              await waitFor(() => expect(query('inner')).toBeNull());
              expect(query('outer')).not.toBeNull();
              expect(changed).not.toHaveBeenCalled();
            }
            view.unmount();
          } finally { host.remove(); }
        });
      }
    }
  }

  for (const modal of [false, 'trap-focus'] as const) {
    for (const gesture of ['tap', 'one-remains', 'two-lifted', 'multi-drag', 'single-drag'] as const) {
      browser(`touch outside modal=${modal}, gesture=${gesture}`, async () => {
        const change = vi.fn();
        const view = await render(() => <><button data-testid="outside">Outside</button>
          <Dialog.Root defaultOpen modal={modal} onOpenChange={change}><Dialog.Portal><Dialog.Popup /></Dialog.Portal></Dialog.Root>
        </>);
        const outside = view.getByTestId('outside');
        const start = new Touch({ identifier: 1, target: outside, clientX: 50, clientY: 50 });
        const move = new Touch({ identifier: 1, target: outside, clientX: 50, clientY: gesture.includes('drag') ? 70 : 56 });
        const other = new Touch({ identifier: 2, target: outside, clientX: 70, clientY: 70 });
        const otherMove = new Touch({ identifier: 2, target: outside, clientX: 70, clientY: gesture.includes('drag') ? 90 : 76 });
        const multiple = ['one-remains', 'two-lifted', 'multi-drag'].includes(gesture);
        expect(view.getByRole('dialog')).toBeInTheDocument();
        fireEvent.touchStart(outside, { touches: multiple ? [start, other] : [start] });
        fireEvent.touchMove(outside, { touches: multiple ? [move, gesture === 'one-remains' ? other : otherMove] : [move] });
        if (gesture !== 'single-drag' && gesture !== 'multi-drag') {
          fireEvent.touchEnd(outside, { changedTouches: gesture === 'two-lifted' ? [move, otherMove] : [move], touches: gesture === 'one-remains' ? [other] : [] });
        }
        if (gesture === 'tap' || gesture === 'single-drag') {
          await waitFor(() => expect(view.queryByRole('dialog')).toBeNull());
          expect(change).toHaveBeenCalledTimes(1);
          expect(change.mock.calls[0]?.[1].reason).toBe('outside-press');
        } else {
          await Promise.resolve();
          expect(view.getByRole('dialog')).toBeInTheDocument();
          expect(change).not.toHaveBeenCalled();
        }
      });
    }
  }

  browser('independent modal backdrops dismiss one at a time', async () => {
    const view = await render(() => {
      const [second, setSecond] = createSignal(false);
      const [third, setThird] = createSignal(false);
      return <>
        <Dialog.Root defaultOpen><Dialog.Portal><Dialog.Backdrop data-testid="backdrop-1" /><Dialog.Popup data-testid="dialog-1">
          <button onClick={() => setSecond(true)}>Open second</button>
        </Dialog.Popup></Dialog.Portal></Dialog.Root>
        <Dialog.Root open={second()} onOpenChange={setSecond}><Dialog.Portal><Dialog.Backdrop data-testid="backdrop-2" /><Dialog.Popup data-testid="dialog-2">
          <button onClick={() => setThird(true)}>Open third</button>
        </Dialog.Popup></Dialog.Portal></Dialog.Root>
        <Dialog.Root open={third()} onOpenChange={setThird}><Dialog.Portal><Dialog.Backdrop data-testid="backdrop-3" /><Dialog.Popup data-testid="dialog-3" /></Dialog.Portal></Dialog.Root>
      </>;
    });
    await view.user.click(view.getByText('Open second'));
    await view.user.click(view.getByText('Open third'));
    for (const index of [3, 2, 1]) {
      await view.user.click(view.getByTestId(`backdrop-${index}`));
      await waitFor(() => expect(view.queryByTestId(`dialog-${index}`)).toBeNull());
      if (index > 1) expect(view.getByTestId(`dialog-${index - 1}`)).toBeInTheDocument();
    }
  });

  for (const mechanism of ['attribute', 'body', 'html'] as const) {
    browser(`external scroll-lock handoff: ${mechanism}`, async () => {
      const view = await render(() => {
        const [open, setOpen] = createSignal(false);
        const timeout = createTimeout();
        const lock = () => {
          const html = document.documentElement;
          const body = document.body;
          const previousHtml = html.getAttribute('style');
          const previousBody = body.getAttribute('style');
          const previousAttribute = body.getAttribute('data-scroll-locked');
          const style = document.createElement('style');
          if (mechanism === 'attribute') {
            style.textContent = 'body[data-scroll-locked]{overflow:hidden!important}';
            document.head.append(style); body.setAttribute('data-scroll-locked', '1');
          } else if (mechanism === 'body') body.style.overflow = 'hidden';
          else { html.style.scrollbarGutter = 'stable'; html.style.overflowX = 'hidden'; html.style.overflowY = 'hidden'; }
          let unlocked = false;
          const unlock = () => {
            if (unlocked) return;
            unlocked = true;
            style.remove();
            if (previousHtml === null) html.removeAttribute('style'); else html.setAttribute('style', previousHtml);
            if (previousBody === null) body.removeAttribute('style'); else body.setAttribute('style', previousBody);
            if (previousAttribute === null) body.removeAttribute('data-scroll-locked'); else body.setAttribute('data-scroll-locked', previousAttribute);
          };
          return unlock;
        };
        let cleanup = () => {};
        onCleanup(() => cleanup());
        return <><button onClick={() => { cleanup = lock(); timeout.start(200, cleanup); setOpen(true); }}>Open dialog</button>
          <Dialog.Root open={open()} onOpenChange={setOpen}><Dialog.Portal><Dialog.Popup><Dialog.Close>Close dialog</Dialog.Close></Dialog.Popup></Dialog.Portal></Dialog.Root>
        </>;
      });
      const locked = () => {
        const html = getComputedStyle(document.documentElement);
        const ownScroller = /auto|scroll|overlay|hidden|clip/.test(html.overflow + html.overflowX + html.overflowY);
        return /hidden|clip/.test(getComputedStyle(ownScroller ? document.documentElement : document.body).overflowY);
      };
      expect(locked()).toBe(false);
      await view.user.click(view.getByText('Open dialog'));
      await view.findByRole('dialog');
      for (const delay of [0, 140, 140, 140]) { await wait(delay); expect(locked()).toBe(true); }
      await view.user.click(view.getByText('Close dialog'));
      await waitFor(() => expect(view.queryByRole('dialog')).toBeNull());
      await waitFor(() => expect(locked()).toBe(false));
    });
  }

  browser('display: contents focus and trap-focus cycling', async () => {
    let store!: ReturnType<typeof useDialogRootContext>;
    function ObserveHost() { store = useDialogRootContext(); return null; }
    const view = await render(() => <div><button data-testid="outside-before">Outside before</button><Dialog.Root defaultOpen modal="trap-focus">
      <ObserveHost />
      <Dialog.Portal><form style={{ display: 'contents' }}><Dialog.Popup>
        <input aria-label="First" /><button type="button">Last</button>
      </Dialog.Popup></form></Dialog.Portal>
    </Dialog.Root><button data-testid="outside-after">Outside after</button></div>);
    const popup = view.getByRole('dialog');
    expect(untrack(() => store.state.popupElement === popup)).toBe(true);
    expect(untrack(() => store.state.popupElement?.isConnected)).toBe(true);
    await waitFor(() => expect(view.getByRole('textbox')).toHaveFocus());
    await view.user.tab();
    expect(view.getByText('Last')).toHaveFocus();
    await view.user.tab();
    await waitFor(() => expect(view.getByRole('textbox')).toHaveFocus());
    await view.user.tab({ shift: true });
    await waitFor(() => expect(view.getByText('Last')).toHaveFocus());
    expect(view.getByRole('dialog').contains(document.activeElement)).toBe(true);
    expect(view.getByTestId('outside-before')).not.toHaveFocus();
    expect(view.getByTestId('outside-after')).not.toHaveFocus();
  }, popupSource);

  browser('display: contents trap-focus with the source-only child graph', async () => {
    // Keep the pinned fixture free of observer components as well: a trace
    // sibling must not accidentally make an inert-template adoption race pass.
    const view = await render(() => <div>
      <button data-testid="outside-before">Outside before</button>
      <Dialog.Root defaultOpen modal="trap-focus"><Dialog.Portal>
        <form style={{ display: 'contents' }}><Dialog.Popup>
          <input aria-label="First" /><button type="button">Last</button>
        </Dialog.Popup></form>
      </Dialog.Portal></Dialog.Root>
      <button data-testid="outside-after">Outside after</button>
    </div>);
    await waitFor(() => expect(view.getByRole('textbox')).toHaveFocus());
    await view.user.tab();
    expect(view.getByText('Last')).toHaveFocus();
    await view.user.tab();
    await waitFor(() => expect(view.getByRole('textbox')).toHaveFocus());
    await view.user.tab({ shift: true });
    await waitFor(() => expect(view.getByText('Last')).toHaveFocus());
    expect(view.getByRole('dialog').contains(document.activeElement)).toBe(true);
    expect(view.getByTestId('outside-before')).not.toHaveFocus();
    expect(view.getByTestId('outside-after')).not.toHaveFocus();
  }, popupSource);

  browser('restores popup focus after focused child pointerdown removal', async () => {
    const view = await render(() => {
      const [visible, setVisible] = createSignal(true);
      return <Dialog.Root defaultOpen modal="trap-focus"><Dialog.Portal><Dialog.Popup>
        {visible() && <button onPointerDown={() => setVisible(false)}>Remove</button>}
      </Dialog.Popup></Dialog.Portal></Dialog.Root>;
    });
    const remove = view.getByText('Remove');
    await waitFor(() => expect(remove).toHaveFocus());
    firePointer.down(remove, { pointerType: 'mouse', button: 0, timeStamp: 100 });
    await waitFor(() => expect(view.getByRole('dialog')).toHaveFocus());
    await view.user.click(document.body);
    await waitFor(() => expect(view.queryByRole('dialog')).toBeNull());
  });

  browser('canceled outside close opens confirmation and returns focus inside parent', async () => {
    const AlertRoot = (props: Dialog.Root.Props) => createRenderDialogRoot('alert-dialog', props);
    const view = await render(() => {
      const [open, setOpen] = createSignal(false);
      const [confirmation, setConfirmation] = createSignal(false);
      const [value, setValue] = createSignal('');
      return <Dialog.Root open={open()} onOpenChange={(nextOpen, details) => {
        if (!nextOpen && value()) { details.cancel(); setConfirmation(true); return; }
        setOpen(nextOpen);
      }}>
        <Dialog.Trigger data-testid="trigger">Tweet</Dialog.Trigger>
        <Dialog.Portal><Dialog.Backdrop data-testid="backdrop" /><Dialog.Popup>
          <textarea aria-label="Draft" value={value()} onInput={(event) => setValue(event.currentTarget.value)} />
        </Dialog.Popup></Dialog.Portal>
        <AlertRoot open={confirmation()} onOpenChange={setConfirmation}>
          <Dialog.Portal><Dialog.Popup><Dialog.Close>Go back</Dialog.Close></Dialog.Popup></Dialog.Portal>
        </AlertRoot>
      </Dialog.Root>;
    });
    await view.user.click(view.getByTestId('trigger'));
    await view.findByRole('dialog');
    const draft = view.getByRole('textbox');
    await view.user.click(draft);
    await view.user.keyboard('x');
    expect(draft).toHaveFocus();
    await view.user.click(view.getByTestId('backdrop'));
    await waitFor(() => expect(view.getByText('Go back')).toHaveFocus());
    await view.user.keyboard('[Enter]');
    await waitFor(() => expect(view.queryByText('Go back')).toBeNull());
    await waitFor(() => expect(draft).toHaveFocus());
  });

  browser('nonmodal popup fields do not pollute unrelated modal return focus', async () => {
    const AlertRoot = (props: Dialog.Root.Props) => createRenderDialogRoot('alert-dialog', props);
    const view = await render(() => {
      const [confirmation, setConfirmation] = createSignal(false);
      return <>
        <div data-testid="surface" style={{ width: '100px', height: '100px' }} onClick={() => setConfirmation(true)}>surface</div>
        <Dialog.Root open modal={false}>
          <Dialog.Portal><Dialog.Popup><textarea aria-label="Nonmodal field" /></Dialog.Popup></Dialog.Portal>
        </Dialog.Root>
        <AlertRoot open={confirmation()} onOpenChange={setConfirmation}>
          <Dialog.Portal><Dialog.Popup><Dialog.Close>Go back</Dialog.Close></Dialog.Popup></Dialog.Portal>
        </AlertRoot>
      </>;
    });
    const field = view.getByRole('textbox');
    await view.user.click(field);
    expect(field).toHaveFocus();
    await view.user.click(view.getByTestId('surface'));
    await waitFor(() => expect(view.getByText('Go back')).toHaveFocus());
    await view.user.keyboard('[Enter]');
    await waitFor(() => expect(view.queryByText('Go back')).toBeNull());
    await flushMicrotasks();
    expect(field).not.toHaveFocus();
  });

  browser('exit transition retains popup and exactly-once completion; interrupted enter never completes', async () => {
    settings.BASE_UI_ANIMATIONS_DISABLED = false;
    const complete = vi.fn();
    const view = await renderProps((props: { open: boolean }) => <>
      <style>{`.dialog-motion { opacity: 0; transition: opacity 200ms linear; }
        .dialog-motion[data-open] { opacity: 1; }
        .dialog-motion[data-starting-style], .dialog-motion[data-ending-style] { opacity: 0; }`}</style>
      <Dialog.Root open={props.open} modal={false} onOpenChangeComplete={complete}>
        <Dialog.Portal keepMounted><Dialog.Popup class="dialog-motion" /></Dialog.Portal>
      </Dialog.Root>
    </>, { open: false });
    await view.setProps({ open: true });
    const popup = view.getByRole('dialog');
    await waitFor(() => expect(popup.getAnimations().some((animation) => animation.playState === 'running')).toBe(true));
    await view.setProps({ open: false });
    expect(popup.isConnected).toBe(true);
    expect(popup).not.toHaveAttribute('hidden');
    await waitFor(() => expect(popup).toHaveAttribute('hidden'));
    expect(complete.mock.calls).toEqual([[false]]);
  });

  browser('restarted enter animation waits for the replacement animation', async () => {
    settings.BASE_UI_ANIMATIONS_DISABLED = false;
    const complete = vi.fn();
    const view = await renderProps((props: { open: boolean; variant: string }) => <>
      <style>{`@keyframes dialog-a { from { opacity: 0 } to { opacity: 1 } }
        @keyframes dialog-b { from { opacity: 0 } to { opacity: 1 } }
        .motion-a[data-open] { animation: dialog-a 200ms linear }
        .motion-b[data-open] { animation: dialog-b 200ms linear }`}</style>
      <Dialog.Root open={props.open} modal={false} onOpenChangeComplete={complete}>
        <Dialog.Portal><Dialog.Popup class={`motion-${props.variant}`} /></Dialog.Portal>
      </Dialog.Root>
    </>, { open: false, variant: 'a' });
    await view.setProps({ open: true });
    const popup = view.getByRole('dialog');
    await waitFor(() => expect(popup.getAnimations().length).toBeGreaterThan(0));
    await view.setProps({ variant: 'b' });
    expect(complete).not.toHaveBeenCalled();
    await waitFor(() => expect(complete.mock.calls).toEqual([[true]]));
  });

  browser('modal scroll lock releases after closing', async () => {
    const view = await render(() => <Dialog.Root defaultOpen><Dialog.Portal><Dialog.Popup><Dialog.Close>Close</Dialog.Close></Dialog.Popup></Dialog.Portal></Dialog.Root>);
    const locked = () => [document.documentElement, document.body].some((node) => /hidden|clip/.test(getComputedStyle(node).overflowY));
    await waitFor(() => expect(locked()).toBe(true));
    await view.user.click(view.getByText('Close'));
    await waitFor(() => expect(locked()).toBe(false));
  });
  browser('display: contents ancestor preserves initial focus after trigger opening', async () => {
    const view = await render(() => <div><button>Outside before</button><Dialog.Root modal={false}>
      <Dialog.Trigger>Open</Dialog.Trigger><Dialog.Portal><form style={{ display: 'contents' }}>
        <Dialog.Popup><input aria-label="Dialog input" /><button type="button">Close</button></Dialog.Popup>
      </form></Dialog.Portal>
    </Dialog.Root><button>Outside after</button></div>);
    await view.user.click(view.getByText('Open'));
    await waitFor(() => expect(view.getByRole('textbox')).toHaveFocus());
  }, popupSource);
  for (const childMode of ['dialog', 'alert-dialog'] as const) {
    browser(`nested CSS count opens and closes with child type ${childMode}`, async () => {
      const Child = (props: Dialog.Root.Props) => createRenderDialogRoot(childMode, props);
      const view = await render(() => <Dialog.Root><Dialog.Trigger>Open parent</Dialog.Trigger><Dialog.Portal>
        <Dialog.Popup data-testid="parent"><Child><Dialog.Trigger>Open child</Dialog.Trigger><Dialog.Portal>
          <Dialog.Popup><Dialog.Close>Close child</Dialog.Close>
            <Dialog.Root><Dialog.Trigger>Open grandchild</Dialog.Trigger><Dialog.Portal><Dialog.Popup><Dialog.Close>Close grandchild</Dialog.Close></Dialog.Popup></Dialog.Portal></Dialog.Root>
          </Dialog.Popup>
        </Dialog.Portal></Child></Dialog.Popup>
      </Dialog.Portal></Dialog.Root>);
      await view.user.click(view.getByText('Open parent'));
      const parent = view.getByTestId('parent');
      const count = () => getComputedStyle(parent).getPropertyValue('--nested-dialogs');
      expect(count()).toBe('0');
      await view.user.click(view.getByText('Open child'));
      await waitFor(() => expect(count()).toBe('1'));
      await view.user.click(view.getByText('Open grandchild'));
      await waitFor(() => expect(count()).toBe('2'));
      await view.user.click(view.getByText('Close grandchild'));
      await waitFor(() => expect(count()).toBe('1'));
      await view.user.click(view.getByText('Close child'));
      await waitFor(() => expect(count()).toBe('0'));
    }, popupSource);
  }
  for (const open of [true, false]) {
    browser(`nested CSS count after removing a ${open ? 'open' : 'closed'} child`, async () => {
      const view = await renderProps((props: { visible: boolean }) => <Dialog.Root defaultOpen>
        <Dialog.Portal><Dialog.Popup data-testid="parent">
          {props.visible && <Dialog.Root open={open}><Dialog.Portal><Dialog.Popup /></Dialog.Portal></Dialog.Root>}
        </Dialog.Popup></Dialog.Portal>
      </Dialog.Root>, { visible: true });
      const parent = view.getByTestId('parent');
      expect(getComputedStyle(parent).getPropertyValue('--nested-dialogs')).toBe(open ? '1' : '0');
      await view.setProps({ visible: false });
      expect(getComputedStyle(parent).getPropertyValue('--nested-dialogs')).toBe('0');
    }, popupSource);
  }
  for (const animate of [false, true]) {
    browser(`completion on externally controlled open and close, CSS animation=${animate}`, async () => {
      settings.BASE_UI_ANIMATIONS_DISABLED = false;
      const complete = vi.fn();
      const view = await renderProps((props: { open: boolean }) => <>
        <style>{`@keyframes dialog-source-enter { from { opacity: 0 } } @keyframes dialog-source-exit { to { opacity: 0 } }
          .dialog-source-animation[data-starting-style] { animation: dialog-source-enter 1ms; }
          .dialog-source-animation[data-ending-style] { animation: dialog-source-exit 1ms; }`}</style>
        <Dialog.Root open={props.open} onOpenChangeComplete={complete}>
          <Dialog.Portal><Dialog.Popup class={animate ? 'dialog-source-animation' : undefined} /></Dialog.Portal>
        </Dialog.Root>
      </>, { open: false });
      expect(complete).not.toHaveBeenCalled();
      await view.setProps({ open: true });
      expect(view.getByRole('dialog')).toBeInTheDocument();
      await waitFor(() => expect(complete.mock.calls[0]?.[0]).toBe(true));
      await view.setProps({ open: false });
      await waitFor(() => expect(view.queryByRole('dialog')).toBeNull());
      expect(complete.mock.lastCall?.[0]).toBe(false);
    });
  }
  browser('open-child removal retains the source computed count sequence 0 then 1 then 0', async () => {
    const view = await render(() => {
      const [visible, setVisible] = createSignal(true);
      return <><button onClick={() => setVisible(false)}>toggle</button><Dialog.Root>
        <Dialog.Trigger>Trigger 0</Dialog.Trigger><Dialog.Portal><Dialog.Popup data-testid="parent">
          {visible() && <Dialog.Root><Dialog.Trigger>Trigger 1</Dialog.Trigger><Dialog.Portal><Dialog.Popup><Dialog.Close>Close 1</Dialog.Close></Dialog.Popup></Dialog.Portal></Dialog.Root>}
          <Dialog.Close>Close 0</Dialog.Close>
        </Dialog.Popup></Dialog.Portal>
      </Dialog.Root></>;
    });
    await view.user.click(view.getByText('Trigger 0'));
    const parent = view.getByTestId('parent');
    expect(getComputedStyle(parent).getPropertyValue('--nested-dialogs')).toBe('0');
    await view.user.click(view.getByText('Trigger 1'));
    expect(getComputedStyle(parent).getPropertyValue('--nested-dialogs')).toBe('1');
    await view.user.click(view.getByRole('button', { name: 'toggle', hidden: true }));
    expect(getComputedStyle(parent).getPropertyValue('--nested-dialogs')).toBe('0');
  }, popupSource);
});
import { useUnscaledBrowserFrame } from '../../../../test/harness/unscaled-frame';
useUnscaledBrowserFrame();
