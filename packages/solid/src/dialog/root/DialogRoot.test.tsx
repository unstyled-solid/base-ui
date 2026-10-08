import { describe, expect, it, vi } from 'vitest';
import { createSignal, Show, onCleanup } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { isInaccessible } from '@testing-library/dom';
import { browserCase, createRenderer, fireEvent, firePointer, popupConformanceTests, waitFor } from '../../../test';
import { Dialog } from '../index';
import { createRenderDialogRoot } from './useRenderDialogRoot';
import { useDialogRootContext } from './DialogRootContext';
import type { DialogRootProps } from './DialogRoot';

const { render, renderProps } = createRenderer();
function Fixture(props: DialogRootProps & { keepMounted?: boolean; backdrop?: boolean }) {
  return <Dialog.Root {...props}>
    <Dialog.Trigger>Open</Dialog.Trigger>
    <Dialog.Portal keepMounted={props.keepMounted}>
      {props.backdrop && <Dialog.Backdrop data-testid="backdrop" />}
      <Dialog.Viewport data-testid="viewport"><Dialog.Popup>
        <Dialog.Title>Title</Dialog.Title><Dialog.Description>Description</Dialog.Description>
        <Dialog.Close>Close</Dialog.Close>
      </Dialog.Popup></Dialog.Viewport>
    </Dialog.Portal>
  </Dialog.Root>;
}

describe('Dialog.Root', () => {
  it('right pointerdown on an independent outside button does not request a close', async () => {
    const changed = vi.fn();
    const view = await render(() => <><button data-testid="outside">Outside</button><Dialog.Root defaultOpen modal="trap-focus" onOpenChange={changed}>
      <Dialog.Portal><Dialog.Popup>Dialog</Dialog.Popup></Dialog.Portal>
    </Dialog.Root></>);
    firePointer.down(view.getByTestId('outside'), { pointerType: 'mouse', button: 2, timeStamp: 10 });
    await Promise.resolve();
    expect(view.getByRole('dialog')).toBeInTheDocument();
    expect(changed).not.toHaveBeenCalled();
  });
  it('an ineffective body overflow lock does not delay the own html scroll lock', async () => {
    const htmlStyle = document.documentElement.getAttribute('style');
    const bodyStyle = document.body.getAttribute('style');
    try {
      document.documentElement.style.overflowY = 'scroll';
      document.body.style.overflowY = 'hidden';
      const view = await render(() => <Dialog.Root defaultOpen><Dialog.Portal><Dialog.Popup><Dialog.Close>Close dialog</Dialog.Close></Dialog.Popup></Dialog.Portal></Dialog.Root>);
      await waitFor(() => expect(document.documentElement.style.overflowX).toBe('hidden'));
      fireEvent.click(view.getByText('Close dialog'));
      await waitFor(() => expect(document.documentElement.style.overflowX === 'hidden').toBe(false));
      view.unmount();
    } finally {
      if (htmlStyle === null) document.documentElement.removeAttribute('style'); else document.documentElement.setAttribute('style', htmlStyle);
      if (bodyStyle === null) document.body.removeAttribute('style'); else document.body.setAttribute('style', bodyStyle);
    }
  });
  it('a native sibling press outside a closed-shadow popup still dismisses once', async () => {
    const host = document.body.appendChild(document.createElement('div'));
    const shadow = host.attachShadow({ mode: 'closed' });
    const container = shadow.appendChild(document.createElement('div'));
    const changed = vi.fn();
    try {
      const view = await render(() => <><div data-testid="outside">Outside</div><Dialog.Root defaultOpen modal={false} onOpenChange={changed}>
        <Dialog.Portal container={shadow}><Dialog.Popup data-testid="outer" /></Dialog.Portal>
      </Dialog.Root></>, { container });
      expect(shadow.querySelector('[data-testid="outer"]')).not.toBeNull();
      shadow.querySelector<HTMLElement>('[data-testid="outside"]')!.click();
      await waitFor(() => expect(shadow.querySelector('[data-testid="outer"]')).toBeNull());
      expect(changed).toHaveBeenCalledTimes(1);
      expect(changed.mock.calls[0][1].reason).toBe('outside-press');
      view.unmount();
    } finally { host.remove(); }
  });
  // The pinned source repeats these contracts for three distinct trigger graphs.
  for (const kind of ['contained triggers', 'detached triggers', 'multiple detached triggers'] as const) {
    function SourceFixture(props: Dialog.Root.Props & { backdrop?: boolean; popupContent?: JSX.Element; popupProps?: Dialog.Popup.Props & { 'data-testid'?: string }; keepMounted?: boolean; container?: HTMLElement | ShadowRoot }) {
      const handle = Dialog.createHandle();
      const popupChildren = () => {
        const content = props.popupContent;
        return content === undefined ? <><Dialog.Title>title text</Dialog.Title><Dialog.Description>description text</Dialog.Description><Dialog.Close>Close</Dialog.Close></> : content;
      };
      return <>
        {kind !== 'contained triggers' && <Dialog.Trigger handle={handle}>Open</Dialog.Trigger>}
        {kind === 'multiple detached triggers' && <Dialog.Trigger handle={handle}>Open another</Dialog.Trigger>}
        <Dialog.Root {...props} handle={kind === 'contained triggers' ? undefined : handle}>
          {kind === 'contained triggers' && <Dialog.Trigger>Open</Dialog.Trigger>}
          <Dialog.Portal container={props.container} keepMounted={props.keepMounted}>
            {props.backdrop && <Dialog.Backdrop data-testid="source-backdrop" style={{ position: 'fixed', inset: '0', 'z-index': 10 }} />}
            <Dialog.Popup style={{ position: 'fixed', 'z-index': 10 }} {...props.popupProps}>{popupChildren()}</Dialog.Popup>
          </Dialog.Portal>
        </Dialog.Root>
      </>;
    }
    const browser = (suffix: string, body: () => Promise<void>) => browserCase({
      source: 'packages/react/src/dialog/root/DialogRoot.test.tsx', case: `${kind}: ${suffix}`, environment: 'browser', issue: 'bsolid-browser',
    }, body);
    for (const right of [false, true]) {
      browser(`fixed modal user backdrop right=${right}`, async () => {
        const changed = vi.fn();
        const view = await render(() => <SourceFixture defaultOpen backdrop onOpenChange={changed} />);
        const backdrop = view.getByTestId('source-backdrop');
        if (right) await view.user.pointer([{ target: backdrop }, { target: backdrop, keys: '[MouseRight]' }]);
        else await view.user.click(backdrop);
        expect(changed).toHaveBeenCalledTimes(right ? 0 : 1);
        if (!right) expect(changed.mock.calls[0][1].reason).toBe('outside-press');
      });
    }
    browser('completed exit transition preserves accessible popup until its transitionend', async () => {
      const previous = globalThis.BASE_UI_ANIMATIONS_DISABLED;
      globalThis.BASE_UI_ANIMATIONS_DISABLED = false;
      try {
        const ended = vi.fn();
        const view = await renderProps((props: { open: boolean }) => <>
          <style>{`.source-dialog-exit { opacity: 0; transition: opacity 200ms; } .source-dialog-exit[data-open] { opacity: 1; }`}</style>
          <SourceFixture open={props.open} modal={false} keepMounted popupProps={{ class: 'source-dialog-exit', onTransitionEnd: ended }} popupContent={null} />
      </>, { open: true });
        const popup = view.getByRole('dialog');
        const nativeEnded = vi.fn();
        popup.addEventListener('transitionend', nativeEnded);
        expect(getComputedStyle(popup).opacity).toBe('1');
        await view.setProps({ open: false });
        expect(view.queryByRole('dialog')).not.toBeNull();
        await waitFor(() => expect(view.queryByRole('dialog')).toBeNull());
        // Animation.finished resolves before Chromium dispatches its queued
        // transitionend; wait for that native observation, not an arbitrary delay.
        await waitFor(() => expect(nativeEnded).toHaveBeenCalledTimes(1));
        expect(ended).toHaveBeenCalledTimes(1);
      } finally { globalThis.BASE_UI_ANIMATIONS_DISABLED = previous; }
    });
    for (const dispatch of [false, true]) {
      browser(`new independent modal dialogs stay open and internal backdrops dismiss in reverse order dispatch=${dispatch}`, async () => {
        const view = await render(() => {
          const [second, setSecond] = createSignal(false);
          const [third, setThird] = createSignal(false);
          return <>
            <SourceFixture popupProps={{ 'data-testid': 'level-1' }} popupContent={<button onClick={() => setSecond(true)}>Open nested 1</button>} />
            <SourceFixture open={second()} onOpenChange={setSecond} popupProps={{ 'data-testid': 'level-2' }} popupContent={<button onClick={() => setThird(true)}>Open nested 2</button>} />
            <SourceFixture open={third()} onOpenChange={setThird} popupProps={{ 'data-testid': 'level-3' }} popupContent={<span>Final nested</span>} />
          </>;
        });
        const click = async (node: HTMLElement) => { if (dispatch) fireEvent.click(node); else await view.user.click(node); };
        await click(view.getAllByText('Open')[0]);
        await view.findByTestId('level-1');
        await click(view.getByText('Open nested 1'));
        await view.findByTestId('level-2');
        await click(view.getByText('Open nested 2'));
        await view.findByTestId('level-3');
        expect(view.getByText('Final nested')).toBeInTheDocument();
        const backdrops = Array.from(document.querySelectorAll<HTMLElement>('[role="presentation"]'));
        for (const [index, level] of [3, 2, 1].entries()) {
          fireEvent.click(backdrops[backdrops.length - index - 1]);
          await waitFor(() => expect(view.queryByTestId(`level-${level}`)).toBeNull());
        }
      });
    }
    browser('focused child pointerdown removal falls back to popup then outside dismissal', async () => {
      const view = await render(() => {
        const [visible, setVisible] = createSignal(true);
        return <SourceFixture defaultOpen modal="trap-focus" popupContent={visible() && <button onPointerDown={() => setVisible(false)}>Remove on pointer down</button>} />;
      });
      const remove = view.getByText('Remove on pointer down');
      await waitFor(() => expect(remove).toHaveFocus());
      firePointer.down(remove, { pointerType: 'mouse', button: 0, timeStamp: 20 });
      await waitFor(() => expect(view.getByRole('dialog')).toHaveFocus());
      await view.user.click(document.body);
      await waitFor(() => expect(view.queryByRole('dialog')).toBeNull());
    });
    for (const animate of [false, true]) {
      browser(`initially-open external close completion animation=${animate}`, async () => {
        const previous = globalThis.BASE_UI_ANIMATIONS_DISABLED;
        globalThis.BASE_UI_ANIMATIONS_DISABLED = !animate;
        try {
          const completed = vi.fn();
          const view = await render(() => {
            const [open, setOpen] = createSignal(true);
            return <><style>{`@keyframes source-close { to { opacity: 0; } } .source-close[data-ending-style] { animation: source-close 1ms; }`}</style>
              <button onClick={() => setOpen(false)}>Close externally</button>
              <SourceFixture open={open()} onOpenChangeComplete={completed} popupProps={{ class: animate ? 'source-close' : undefined }} />
            </>;
          });
          expect(view.getByRole('dialog')).toBeInTheDocument();
          await waitFor(() => expect(completed.mock.calls[0]?.[0]).toBe(true));
          await view.user.click(view.getByText('Close externally'));
          await waitFor(() => expect(view.queryByRole('dialog')).toBeNull());
          expect(completed.mock.lastCall?.[0]).toBe(false);
        } finally { globalThis.BASE_UI_ANIMATIONS_DISABLED = previous; }
      });
      browser(`externally-opened completion animation=${animate}`, async () => {
        const previous = globalThis.BASE_UI_ANIMATIONS_DISABLED;
        globalThis.BASE_UI_ANIMATIONS_DISABLED = !animate;
        try {
          const completed = vi.fn();
          const view = await render(() => {
            const [open, setOpen] = createSignal(false);
            return <><style>{`@keyframes source-enter { from { opacity: 0; } } .source-enter[data-starting-style] { animation: source-enter 1ms; }`}</style>
              <button onClick={() => setOpen(true)}>Open externally</button>
              <SourceFixture open={open()} onOpenChangeComplete={completed} popupProps={{ class: animate ? 'source-enter' : undefined }} />
            </>;
          });
          expect(completed).not.toHaveBeenCalled();
          await view.user.click(view.getByText('Open externally'));
          expect(view.getByRole('dialog')).toBeInTheDocument();
          await waitFor(() => expect(completed.mock.calls[0]?.[0]).toBe(true));
          // Upstream's @mui/internal-test-utils renderer defaults strict and
          // strictEffects to true. Its newly mounted Popup useEffect synchronously
          // completes twice when animations are disabled (setup/cleanup/setup).
          // Solid setup is owned once; retain one completion for this open cycle.
          if (!animate) expect(completed).toHaveBeenCalledTimes(1);
        } finally { globalThis.BASE_UI_ANIMATIONS_DISABLED = previous; }
      });
    }
    browser('restarted 50ms enter waits for replacement animation', async () => {
      const previous = globalThis.BASE_UI_ANIMATIONS_DISABLED;
      globalThis.BASE_UI_ANIMATIONS_DISABLED = false;
      try {
        const completed = vi.fn();
        const view = await render(() => {
          const [open, setOpen] = createSignal(false);
          const [variant, setVariant] = createSignal('a');
          return <><style>{`@keyframes source-enter-a { from { opacity: 0; } } @keyframes source-enter-b { from { opacity: 0; } }
            .source-enter-a[data-open] { animation: source-enter-a 50ms linear; } .source-enter-b[data-open] { animation: source-enter-b 50ms linear; }`}</style>
            <button onClick={() => setOpen(true)}>Open externally</button><button onClick={() => setVariant('b')}>Swap animation</button>
            <SourceFixture open={open()} onOpenChange={setOpen} onOpenChangeComplete={completed} popupProps={{ class: `source-enter-${variant()}` }} />
          </>;
        });
        await view.user.click(view.getByText('Open externally'));
        const popup = view.getByRole('dialog');
        await waitFor(() => expect(popup.getAnimations().length).not.toBe(0));
        await view.user.click(view.getByText('Swap animation'));
        await Promise.resolve();
        expect(completed).not.toHaveBeenCalled();
        await waitFor(() => expect(completed).toHaveBeenCalledTimes(1));
        expect(completed.mock.calls[0][0]).toBe(true);
      } finally { globalThis.BASE_UI_ANIMATIONS_DISABLED = previous; }
    });
    browser('outside dismissal during enter produces only one false completion', async () => {
      const previous = globalThis.BASE_UI_ANIMATIONS_DISABLED;
      globalThis.BASE_UI_ANIMATIONS_DISABLED = false;
      try {
        const completed = vi.fn();
        const view = await render(() => {
          const [open, setOpen] = createSignal(false);
          return <><style>{`.source-interrupt { opacity: 0; transition: opacity 200ms linear; }
            .source-interrupt[data-open] { opacity: 1; } .source-interrupt[data-open][data-starting-style], .source-interrupt[data-ending-style] { opacity: 0; }`}</style>
            <button onClick={() => setOpen(true)}>Open externally</button>
            <SourceFixture open={open()} onOpenChange={setOpen} onOpenChangeComplete={completed} popupProps={{ class: 'source-interrupt' }} />
          </>;
        });
        await view.user.click(view.getByText('Open externally'));
        const popup = view.getByRole('dialog');
        await waitFor(() => expect(popup.getAnimations().length).not.toBe(0));
        await waitFor(() => expect(popup.getAnimations().some((animation) => animation.playState !== 'finished')).toBe(true));
        await view.user.click(document.body);
        await waitFor(() => expect(view.queryByRole('dialog')).toBeNull());
        expect(completed.mock.calls).toEqual([[false]]);
      } finally { globalThis.BASE_UI_ANIMATIONS_DISABLED = previous; }
    });
    browser('closed mount does not complete opening', async () => {
      const completed = vi.fn();
      await render(() => <SourceFixture onOpenChangeComplete={completed} />);
      expect(completed).not.toHaveBeenCalled();
    });
    it(`source trigger graph ${kind}: initially controlled-open ARIA IDs`, async () => {
      const view = await render(() => <SourceFixture open modal={false} backdrop />);
      const popup = view.getByRole('dialog');
      expect(popup.getAttribute('aria-labelledby')).toBe(view.getByText('title text').id);
      expect(popup.getAttribute('aria-describedby')).toBe(view.getByText('description text').id);
    });
    it(`source trigger graph ${kind}: keyed generated label replacement and removal`, async () => {
      function Labels() {
        const [phase, setPhase] = createSignal(0);
        return <><Show when={phase() < 2 ? phase() + 1 : undefined} keyed>{(value) => <>
          <Dialog.Title>Title {value}</Dialog.Title><Dialog.Description>Description {value}</Dialog.Description>
        </>}</Show><button onClick={() => setPhase((value) => value + 1)}>Change labels</button></>;
      }
      const view = await render(() => <SourceFixture open modal={false} popupContent={<Labels />} />);
      const popup = view.getByRole('dialog');
      const firstTitle = view.getByText('Title 1').id;
      const firstDescription = view.getByText('Description 1').id;
      expect(popup).toHaveAttribute('aria-labelledby', firstTitle);
      expect(popup).toHaveAttribute('aria-describedby', firstDescription);
      await view.user.click(view.getByText('Change labels'));
      const secondTitle = view.getByText('Title 2').id;
      const secondDescription = view.getByText('Description 2').id;
      await waitFor(() => expect(popup).toHaveAttribute('aria-labelledby', secondTitle));
      await waitFor(() => expect(popup).toHaveAttribute('aria-describedby', secondDescription));
      expect(secondTitle).not.toBe(firstTitle);
      expect(secondDescription).not.toBe(firstDescription);
      await view.user.click(view.getByText('Change labels'));
      await waitFor(() => expect(popup).not.toHaveAttribute('aria-labelledby'));
      await waitFor(() => expect(popup).not.toHaveAttribute('aria-describedby'));
      expect(view.getByRole('dialog')).toBe(popup);
    });
    it(`source trigger graph ${kind}: canceled uncontrolled opening`, async () => {
      const view = await render(() => <SourceFixture onOpenChange={(open, details) => { if (open) details.cancel(); }} />);
      await view.user.click(view.getByText('Open'));
      expect(view.queryByRole('dialog')).toBeNull();
    });
    for (const cancel of [false, true]) {
      it(`source trigger graph ${kind}: internal Escape notification canceled=${cancel}`, async () => {
        const internal = vi.fn();
        function Observe() {
          const events = useDialogRootContext().state.floatingRootContext.events;
          events.on('openchange', internal);
          onCleanup(() => events.off('openchange', internal));
          return null;
        }
        const view = await render(() => <SourceFixture defaultOpen
          onOpenChange={(open, details) => { if (!open && cancel) details.cancel(); }}
          popupContent={<><Observe /><p>Dialog content</p><Dialog.Close>Close</Dialog.Close></>} />);
        await view.user.keyboard('[Escape]');
        expect(internal).toHaveBeenCalledTimes(cancel ? 0 : 1);
        if (cancel) expect(view.getByRole('dialog')).toBeInTheDocument();
        else expect(internal.mock.calls[0][0]).toMatchObject({ open: false, reason: 'escape-key' });
      });
    }
    for (const modal of [true, false]) {
      it(`source trigger graph ${kind}: default-open presentation presence modal=${modal}`, async () => {
        const view = await render(() => <SourceFixture defaultOpen modal={modal} />);
        if (modal) expect(view.getByRole('presentation', { hidden: true })).toBeInTheDocument();
        else expect(view.queryByRole('presentation')).toBeNull();
      });
    }
    it(`source trigger graph ${kind}: trigger toggle retains popup until actions unmount`, async () => {
      const actions = { current: null as Dialog.Root.Actions | null };
      const view = await render(() => <SourceFixture actionsRef={actions} onOpenChange={(_open, details) => details.preventUnmountOnClose()} />);
      const trigger = view.getByText('Open');
      await view.user.click(trigger);
      expect(view.getByRole('dialog')).toBeInTheDocument();
      await view.user.click(trigger);
      expect(view.getByRole('dialog')).toBeInTheDocument();
      actions.current!.unmount();
      await waitFor(() => expect(view.queryByRole('dialog')).toBeNull());
    });
    for (const press of ['user backdrop', 'same-shadow sibling', 'outside-shadow nonmodal', 'outside-shadow modal'] as const) {
      it(`source trigger graph ${kind}: shadow outside press via ${press}`, async () => {
        const host = document.body.appendChild(document.createElement('div'));
        const shadow = host.attachShadow({ mode: 'open' });
        const container = shadow.appendChild(document.createElement('div'));
        const changed = vi.fn();
        try {
          const view = await render(() => <><button data-testid="shadow-outside">Outside</button>
            <SourceFixture defaultOpen modal={press === 'user backdrop' || press === 'outside-shadow modal'}
              container={shadow} backdrop={press === 'user backdrop'} onOpenChange={changed} />
          </>, { container });
          const target = press === 'user backdrop' ? shadow.querySelector<HTMLElement>('[data-testid="source-backdrop"]')!
            : press === 'same-shadow sibling' ? shadow.querySelector<HTMLElement>('[data-testid="shadow-outside"]')! : document.body;
          fireEvent.click(target);
          await waitFor(() => expect(shadow.querySelector('[role="dialog"]')).toBeNull());
          expect(changed).toHaveBeenCalledTimes(1);
          if (press !== 'user backdrop') expect(changed.mock.calls[0][1].reason).toBe('outside-press');
          view.unmount();
        } finally { host.remove(); }
      });
    }
    it(`source trigger graph ${kind}: Escape then reopen rewires outside dismissal`, async () => {
      const view = await render(() => <SourceFixture modal={false} />);
      const trigger = view.getByText('Open');
      await view.user.click(trigger);
      expect(view.getByRole('dialog')).toBeInTheDocument();
      await view.user.keyboard('[Escape]');
      await waitFor(() => expect(view.queryByRole('dialog')).toBeNull());
      await view.user.click(trigger);
      expect(view.getByRole('dialog')).toBeInTheDocument();
      fireEvent.click(document.body);
      await waitFor(() => expect(view.queryByRole('dialog')).toBeNull());
    });
    it(`source trigger graph ${kind}: exact ARIA IDs and opening/closing callback sequence`, async () => {
      const changed = vi.fn();
      const view = await render(() => <SourceFixture modal={false} onOpenChange={changed} />);
      expect(changed).not.toHaveBeenCalled();
      await view.user.click(view.getByText('Open'));
      const popup = view.getByRole('dialog');
      expect(popup.getAttribute('aria-labelledby')).toBe(view.getByText('title text').id);
      expect(popup.getAttribute('aria-describedby')).toBe(view.getByText('description text').id);
      expect(changed).toHaveBeenCalledTimes(1);
      expect(changed.mock.calls[0][0]).toBe(true);
      expect(changed.mock.calls[0][1].reason).toBe('trigger-press');
      await view.user.click(view.getByText('Close'));
      expect(changed).toHaveBeenCalledTimes(2);
      expect(changed.mock.calls[1][0]).toBe(false);
      expect(changed.mock.calls[1][1].reason).toBe('close-press');
    });
    for (const dismiss of ['escape', 'modal backdrop', 'nonmodal outside'] as const) {
      it(`source trigger graph ${kind}: ${dismiss} sends one reason`, async () => {
        const changed = vi.fn();
        const view = await render(() => <SourceFixture defaultOpen modal={dismiss !== 'nonmodal outside'} onOpenChange={changed} />);
        if (dismiss === 'escape') await view.user.keyboard('[Escape]');
        else await view.user.click(dismiss === 'modal backdrop' ? view.getByRole('presentation', { hidden: true }) : document.body);
        expect(changed).toHaveBeenCalledTimes(1);
        expect(changed.mock.calls[0][1].reason).toBe(dismiss === 'escape' ? 'escape-key' : 'outside-press');
      });
    }
    for (const disabled of [true, false, undefined]) {
      it(`source trigger graph ${kind}: disablePointerDismissal=${disabled} outside sequence`, async () => {
        const changed = vi.fn();
        const view = await render(() => <div data-testid="outside"><SourceFixture defaultOpen modal={false} disablePointerDismissal={disabled} onOpenChange={changed} /></div>);
        const outside = view.getByTestId('outside');
        fireEvent.mouseDown(outside);
        fireEvent.click(outside);
        await waitFor(() => expect(view.queryByRole('dialog') === null).toBe(disabled !== true));
        expect(changed).toHaveBeenCalledTimes(disabled === true ? 0 : 1);
      });
    }
    for (const backdrop of [true, false]) {
      it(`source trigger graph ${kind}: intentional ${backdrop ? 'user' : 'internal'} backdrop waits for click`, async () => {
        const changed = vi.fn();
        const view = await render(() => <SourceFixture defaultOpen modal={!backdrop} backdrop={backdrop} onOpenChange={changed} />);
        const node = backdrop ? view.getByTestId('source-backdrop') : view.getByRole('presentation', { hidden: true });
        fireEvent.mouseDown(node);
        expect(view.getByRole('dialog')).toBeInTheDocument();
        expect(changed).not.toHaveBeenCalled();
        fireEvent.click(node);
        await waitFor(() => expect(view.queryByRole('dialog')).toBeNull());
        expect(changed).toHaveBeenCalledTimes(1);
      });
    }
    for (const modal of [true, false]) {
      it(`source trigger graph ${kind}: internal backdrop modal=${modal}`, async () => {
        const view = await render(() => <SourceFixture modal={modal} />);
        await view.user.click(view.getByText('Open'));
        const popup = view.getByRole('dialog');
        if (modal) expect(popup.previousElementSibling?.previousElementSibling).toHaveAttribute('role', 'presentation');
        else expect(popup.previousElementSibling?.previousElementSibling).toBeNull();
      });
    }
  }
  popupConformanceTests({
    createComponent: (props) => <Dialog.Root {...props.root}>
      <Dialog.Trigger {...props.trigger}>Open dialog</Dialog.Trigger>
      <Dialog.Portal {...props.portal}><Dialog.Popup {...props.popup}>Dialog</Dialog.Popup></Dialog.Portal>
    </Dialog.Root>,
    triggerMouseAction: 'click', expectedPopupRole: 'dialog', browserIssue: 'bsolid-browser',
  });

  for (const modal of [true, false, 'trap-focus'] as const) {
    it(`opens/closes and maintains ARIA, reason and trigger identity: ${modal}`, async () => {
      const changed = vi.fn();
      const view = await render(() => <Fixture modal={modal} onOpenChange={changed} />);
      const trigger = view.getByText('Open');
      await view.user.click(trigger);
      const popup = view.getByRole('dialog');
      expect(popup).toHaveAccessibleName('Title');
      expect(popup).toHaveAccessibleDescription('Description');
      expect(trigger).toHaveAttribute('aria-controls', popup.id);
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
      expect(changed.mock.calls[0]?.[1]).toMatchObject({ reason: 'trigger-press', trigger });
      await view.user.click(view.getByText('Close'));
      await waitFor(() => expect(view.queryByRole('dialog')).toBeNull());
      expect(changed.mock.calls.at(-1)?.[1]).toMatchObject({ reason: 'close-press', trigger });
      await view.user.click(trigger);
      await view.user.keyboard('[Escape]');
      await waitFor(() => expect(view.queryByRole('dialog')).toBeNull());
      expect(changed.mock.calls.at(-1)?.[1].reason).toBe('escape-key');
    });
  }

  for (const cancel of [false, true]) {
    it(`Escape sends exactly ${cancel ? 'zero' : 'one'} accepted internal notification`, async () => {
      const internal = vi.fn();
      const changed = vi.fn((_open: boolean, details: Dialog.Root.ChangeEventDetails) => { if (cancel) details.cancel(); });
      function Observe() {
        const events = useDialogRootContext().state.floatingRootContext.events;
        events.on('openchange', internal);
        onCleanup(() => events.off('openchange', internal));
        return null;
      }
      const view = await render(() => <Dialog.Root defaultOpen onOpenChange={changed}>
        <Observe /><Dialog.Portal><Dialog.Popup><Dialog.Close>Close</Dialog.Close></Dialog.Popup></Dialog.Portal>
      </Dialog.Root>);
      await view.user.keyboard('[Escape]');
      expect(changed).toHaveBeenCalledTimes(1);
      expect(internal).toHaveBeenCalledTimes(cancel ? 0 : 1);
      if (!cancel) expect(internal.mock.calls[0][0]).toMatchObject({ open: false, reason: 'escape-key' });
      expect(Boolean(view.queryByRole('dialog'))).toBe(cancel);
    });
  }

  it('canceled opening preserves closed state', async () => {
    const view = await render(() => <Fixture onOpenChange={(_, details) => details.cancel()} />);
    await view.user.click(view.getByText('Open'));
    expect(view.queryByRole('dialog')).toBeNull();
    expect(view.getByText('Open')).toHaveAttribute('aria-expanded', 'false');
  });

  it('onOpenChange always invokes the current callback', async () => {
    const first = vi.fn();
    const second = vi.fn();
    const view = await renderProps((props: { onChange: Dialog.Root.Props['onOpenChange'] }) => <Fixture modal={false} onOpenChange={props.onChange} />, { onChange: first });
    await view.user.click(view.getByText('Open'));
    await view.setProps({ onChange: second });
    await view.user.click(view.getByText('Close'));
    expect(first).toHaveBeenCalledTimes(1);
    expect(second.mock.calls[0]?.[0]).toBe(false);
  });

  it('closing with an unregistered defaultTriggerId reports no trigger', async () => {
    const actions = { current: null as Dialog.Root.Actions | null };
    const changed = vi.fn();
    const view = await render(() => <Dialog.Root defaultOpen modal={false} defaultTriggerId="missing" actionsRef={actions} onOpenChange={changed}>
      <Dialog.Portal><Dialog.Popup /></Dialog.Portal>
    </Dialog.Root>);
    actions.current!.close();
    await waitFor(() => expect(changed).toHaveBeenCalledTimes(1));
    expect(changed.mock.calls[0]?.[1].trigger).toBeUndefined();
    expect(changed.mock.calls[0][0]).toBe(false);
    expect(changed.mock.calls[0][1].reason).toBe('imperative-action');
    view.unmount();
    expect(actions.current).toBeNull();
  });

  it('mounting an inactive trigger does not steal active ownership', async () => {
    const view = await renderProps((props: { extra: boolean }) => <Dialog.Root modal={false} disablePointerDismissal>
      <Dialog.Trigger id="one">One</Dialog.Trigger>
      {props.extra && <Dialog.Trigger id="two">Two</Dialog.Trigger>}
      <Dialog.Portal><Dialog.Popup /></Dialog.Portal>
    </Dialog.Root>, { extra: false });
    await view.user.click(view.getByText('One'));
    const popup = view.getByRole('dialog');
    await view.setProps({ extra: true });
    expect(view.getByText('One')).toHaveAttribute('aria-expanded', 'true');
    expect(view.getByText('One')).toHaveAttribute('aria-controls', popup.id);
    expect(view.getByText('Two')).toHaveAttribute('aria-expanded', 'false');
    expect(view.getByText('Two')).not.toHaveAttribute('aria-controls');
  });

  for (const disabled of [false, true, undefined]) {
    it(`outside press prevention=${disabled}`, async () => {
      const view = await render(() => <Fixture defaultOpen modal={false} disablePointerDismissal={disabled} backdrop />);
      const backdrop = view.getByTestId('backdrop');
      fireEvent.mouseDown(backdrop);
      expect(view.getByRole('dialog')).toBeInTheDocument();
      await view.user.click(backdrop);
      expect(Boolean(view.queryByRole('dialog'))).toBe(disabled === true);
    });
  }

  it('right outside press does not dismiss', async () => {
    const changed = vi.fn();
    const view = await render(() => <Fixture defaultOpen modal="trap-focus" backdrop onOpenChange={changed} />);
    await view.user.pointer({ keys: '[MouseRight]', target: view.getByTestId('backdrop') });
    expect(changed).not.toHaveBeenCalled();
    expect(view.getByRole('dialog')).toBeInTheDocument();
  });

  for (const keepMounted of [true, false, undefined]) {
    it(`portal and viewport keepMounted=${keepMounted}`, async () => {
      const view = await render(() => <Fixture keepMounted={keepMounted} />);
      expect(Boolean(view.queryByRole('dialog', { hidden: true }))).toBe(keepMounted === true);
      if (keepMounted) {
        expect(view.getByTestId('viewport')).toHaveAttribute('hidden');
        expect(view.queryByRole('dialog')).toBeNull();
        expect(isInaccessible(view.getByRole('dialog', { hidden: true }))).toBe(true);
      }
      await view.user.click(view.getByText('Open'));
      expect(view.getByTestId('viewport')).not.toHaveAttribute('hidden');
    });
  }

  it('actionsRef alone does not retain the closing popup', async () => {
    const actions = { current: null as Dialog.Root.Actions | null };
    const view = await render(() => <Fixture defaultOpen actionsRef={actions} />);
    actions.current!.close();
    await waitFor(() => expect(view.queryByRole('dialog')).toBeNull());
  });

  it('manual unmount finishes once and resets retention on reopen, including same-turn close/unmount', async () => {
    const actions = { current: null as Dialog.Root.Actions | null };
    const complete = vi.fn();
    let retain = true;
    const view = await render(() => <Fixture defaultOpen actionsRef={actions} onOpenChangeComplete={complete}
      onOpenChange={(open, details) => { if (!open && retain) details.preventUnmountOnClose(); }} />);
    await view.user.click(view.getByText('Close'));
    expect(view.getByRole('dialog')).toHaveAttribute('data-closed');
    actions.current!.unmount();
    await waitFor(() => expect(view.queryByRole('dialog')).toBeNull());
    expect(complete.mock.calls.filter(([open]) => open === false)).toHaveLength(1);
    retain = false;
    await view.user.click(view.getByText('Open'));
    actions.current!.close();
    actions.current!.unmount();
    await waitFor(() => expect(view.queryByRole('dialog')).toBeNull());
    expect(complete.mock.calls.filter(([open]) => open === false)).toHaveLength(2);
  });

  it('label replacement and removal update the same popup', async () => {
    const view = await renderProps((props: { phase: number }) => <Dialog.Root open modal={false}>
      <Dialog.Portal><Dialog.Popup>
        {props.phase < 2 && <><Dialog.Title id={`title-${props.phase}`}>Title {props.phase}</Dialog.Title>
          <Dialog.Description id={`description-${props.phase}`}>Description {props.phase}</Dialog.Description></>}
      </Dialog.Popup></Dialog.Portal>
    </Dialog.Root>, { phase: 0 });
    const popup = view.getByRole('dialog');
    expect(popup).toHaveAttribute('aria-labelledby', 'title-0');
    expect(popup).toHaveAttribute('aria-describedby', 'description-0');
    await view.setProps({ phase: 1 });
    expect(view.getByRole('dialog')).toBe(popup);
    expect(popup).toHaveAttribute('aria-labelledby', 'title-1');
    expect(popup).toHaveAttribute('aria-describedby', 'description-1');
    await view.setProps({ phase: 2 });
    expect(popup).not.toHaveAttribute('aria-labelledby');
    expect(popup).not.toHaveAttribute('aria-describedby');
  });

  for (const mode of ['dialog', 'alert-dialog', 'drawer'] as const) {
    it(`mode adapter ${mode} supplies role and forced modal policy`, async () => {
      const Root = (props: DialogRootProps) => createRenderDialogRoot(mode, props);
      const view = await render(() => <Root defaultOpen modal={false}>
        <Dialog.Portal><Dialog.Backdrop data-testid="backdrop" /><Dialog.Popup><Dialog.Close>Close</Dialog.Close></Dialog.Popup></Dialog.Portal>
      </Root>);
      expect(view.getByRole(mode === 'alert-dialog' ? 'alertdialog' : 'dialog')).toBeInTheDocument();
      await view.user.click(view.getByTestId('backdrop'));
      expect(Boolean(view.queryByRole('alertdialog'))).toBe(mode === 'alert-dialog');
    });
  }

  it('nested counts include drawer/alert modes and clean up disposed roots', async () => {
    const DrawerRoot = (props: DialogRootProps) => createRenderDialogRoot('drawer', props);
    const AlertRoot = (props: DialogRootProps) => createRenderDialogRoot('alert-dialog', props);
    function Counts() {
      const store = useDialogRootContext();
      return <output data-testid="counts">{store.state.nestedOpenDialogCount}/{store.state.nestedOpenDrawerCount}</output>;
    }
    const view = await renderProps((props: { visible: boolean }) => <Dialog.Root open>
      <Counts />
      <Dialog.Portal><Dialog.Popup data-testid="parent" /></Dialog.Portal>
      {props.visible && <DrawerRoot open><AlertRoot open /></DrawerRoot>}
    </Dialog.Root>, { visible: true });
    expect(view.getByTestId('counts').textContent).toBe('2/1');
    expect(view.getByTestId('parent')).toHaveAttribute('data-nested-dialog-open');
    await view.setProps({ visible: false });
    expect(view.getByTestId('counts').textContent).toBe('0/0');
    expect(view.getByTestId('parent')).not.toHaveAttribute('data-nested-dialog-open');
  });

  for (const mode of ['open', 'closed'] as const) {
    it(`dismisses correctly through a ${mode} shadow portal`, async () => {
      const host = document.createElement('div');
      document.body.append(host);
      const shadow = host.attachShadow({ mode });
      try {
        const view = await render(() => <Dialog.Root defaultOpen modal={false}>
          <Dialog.Portal container={shadow}><Dialog.Backdrop data-testid="backdrop" /><Dialog.Popup /></Dialog.Portal>
        </Dialog.Root>);
        const backdrop = shadow.querySelector<HTMLElement>('[data-testid="backdrop"]')!;
        await view.user.click(backdrop);
        await waitFor(() => expect(shadow.querySelector('[role="dialog"]')).toBeNull());
        view.unmount();
      } finally { host.remove(); }
    });
  }
});
