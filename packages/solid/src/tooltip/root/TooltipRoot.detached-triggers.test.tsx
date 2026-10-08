import { describe, expect, it, vi } from 'vitest';
import { createMemo, Loading, untrack } from 'solid-js';
import { createRenderer, screen, expectDiagnostic, sourceCase, waitFor, advanceFrame } from '../../../test';
import { Tooltip } from '../index';
import { hover, settle, upstream } from '../Tooltip.test-utils';

const { render, renderProps } = createRenderer();
const check = (title: string, run: () => Promise<void>) => sourceCase({ source: `${upstream}root/TooltipRoot.detached-triggers.test.tsx`, case: title, environment: 'jsdom', adaptation: 'native owned mounting and live payload object; real-layout assertions are in browser suite' }, run);
function Content(props: { value?: string }) {
  return <Tooltip.Portal><Tooltip.Positioner data-testid="positioner"><Tooltip.Popup data-testid="popup">{props.value ?? 'Content'}</Tooltip.Popup></Tooltip.Positioner></Tooltip.Portal>;
}
describe('Tooltip handle ownership', () => {
  check('ignores imperative handle calls before attach and after detach', async () => {
    const handle = Tooltip.createHandle<string>();
    await expectDiagnostic({ message: /no root using this handle is mounted/, count: 2 }, () => { handle.open('first'); handle.close(); });
    expect(untrack(() => handle.isOpen)).toBe(false);
    const view = await render(() => <><Tooltip.Trigger id="first" handle={handle} payload="first">First</Tooltip.Trigger>
      <Tooltip.Root handle={handle}>{state => <Content value={state.payload} />}</Tooltip.Root></>);
    handle.open('first'); await settle(); expect(screen.getByTestId('popup')).toHaveTextContent('first');
    view.unmount(); expect(untrack(() => handle.isOpen)).toBe(false);
    await expectDiagnostic({ message: /no root using this handle is mounted/, count: 2 }, () => { handle.open('first'); handle.close(); });
  });
  for (const rootFirst of [false, true]) {
    check(`registers detached trigger declared ${rootFirst ? 'after' : 'before'} root / imperative payload`, async () => {
      const handle = Tooltip.createHandle<string>();
      const Root = () => <Tooltip.Root handle={handle}>{state => <Content value={state.payload} />}</Tooltip.Root>;
      const view = await render(() => <>{rootFirst && <Root />}
        <Tooltip.Trigger handle={handle} id="first" payload="First payload">First</Tooltip.Trigger>
        <Tooltip.Trigger handle={handle} id="second" payload="Second payload">Second</Tooltip.Trigger>
        {!rootFirst && <Root />}</>);
      handle.open('second'); await settle(); expect(screen.getByTestId('popup')).toHaveTextContent('Second payload');
      expect(screen.getByText('Second')).toHaveAttribute('data-popup-open'); expect(screen.getByText('First')).not.toHaveAttribute('data-popup-open');
      handle.close(); await settle(); expect(screen.queryByTestId('popup')).toBeNull();
      expect(() => handle.open('missing')).toThrow('was called with the trigger id "missing"'); view.unmount();
    });
  }
  for (const detached of [false, true]) {
    for (const canceled of [false, true]) {
      check(`active-trigger removal/detached=${detached}/canceled=${canceled}`, async () => {
        const handle = Tooltip.createHandle<string>();
        const changed = vi.fn((open: boolean, details: Tooltip.Root.ChangeEventDetails) => { if (!open && canceled) details.cancel(); });
        const view = await renderProps((props: { show: boolean }) => {
          const Triggers = () => <>{props.show && <Tooltip.Trigger handle={detached ? handle : undefined} id="first" payload="first">First</Tooltip.Trigger>}
            <Tooltip.Trigger handle={detached ? handle : undefined} id="second" payload="second">Second</Tooltip.Trigger></>;
          return <>{detached && <Triggers />}<Tooltip.Root handle={handle} defaultOpen defaultTriggerId="first" onOpenChange={changed}>
            {state => <>{!detached && <Triggers />}<Content value={state.payload} /></>}
          </Tooltip.Root></>;
        }, { show: true });
        expect(screen.getByTestId('popup')).toHaveTextContent('first'); await view.setProps({ show: false }); await settle();
        expect(changed).toHaveBeenCalledWith(false, expect.objectContaining({ reason: 'none' }));
        expect(screen.getByText('Second')).not.toHaveAttribute('data-popup-open');
        if (canceled) expect(screen.getByTestId('popup')).toHaveTextContent('first');
        else expect(screen.queryByTestId('popup')).toBeNull(); view.unmount();
      });
    }
    check(`live payload / same popup and positioner DOM / detached=${detached}`, async () => {
      const handle = Tooltip.createHandle<string>();
      const view = await renderProps((props: { payload: string }) => {
        const Triggers = () => <><Tooltip.Trigger handle={detached ? handle : undefined} id="first" payload="first" delay={0}>First</Tooltip.Trigger>
          <Tooltip.Trigger handle={detached ? handle : undefined} id="second" payload={props.payload} delay={0}>Second</Tooltip.Trigger></>;
        return <>{detached && <Triggers />}<Tooltip.Root handle={handle}>{state => <>{!detached && <Triggers />}<Content value={state.payload} /></>}</Tooltip.Root></>;
      }, { payload: 'second' });
      handle.open('first'); await settle(); const popup = screen.getByTestId('popup'); const positioner = screen.getByTestId('positioner');
      handle.open('second'); await settle(); expect(screen.getByTestId('popup')).toBe(popup); expect(screen.getByTestId('positioner')).toBe(positioner);
      expect(popup).toHaveTextContent('second'); await view.setProps({ payload: 'ready' }); expect(popup).toHaveTextContent('ready'); view.unmount();
    });
  }
  check('handle replacement preserves root state and migrates triggers', async () => {
    const first = Tooltip.createHandle<string>(); const second = Tooltip.createHandle<string>();
    const view = await renderProps((props: { handle: Tooltip.Handle<string> }) => <>
      <Tooltip.Trigger handle={props.handle} id="first" payload="first">First</Tooltip.Trigger>
      <Tooltip.Root handle={props.handle} defaultOpen defaultTriggerId="first">{state => <Content value={state.payload} />}</Tooltip.Root>
    </>, { handle: first });
    const popup = screen.getByTestId('popup'); await view.setProps({ handle: second }); await settle();
    expect(untrack(() => first.isOpen)).toBe(false); expect(untrack(() => second.isOpen)).toBe(true);
    expect(screen.getByTestId('popup')).toBe(popup); second.close(); await settle(); expect(screen.queryByTestId('popup')).toBeNull(); view.unmount();
  });
  check('controlled open and triggerId change the payload without replacing hosts', async () => {
    const handle = Tooltip.createHandle<string>();
    const view = await renderProps<{ open: boolean; triggerId: string | null }>((props) => <>
      <Tooltip.Trigger handle={handle} id="first" payload="first">First</Tooltip.Trigger>
      <Tooltip.Trigger handle={handle} id="second" payload="second">Second</Tooltip.Trigger>
      <Tooltip.Root handle={handle} open={props.open} triggerId={props.triggerId}>{state => <Content value={state.payload} />}</Tooltip.Root>
    </>, { open: false, triggerId: null });
    await view.setProps({ open: true, triggerId: 'first' }); expect(screen.getByTestId('popup')).toHaveTextContent('first');
    const popup = screen.getByTestId('popup'); await view.setProps({ triggerId: 'second' }); expect(popup).toHaveTextContent('second');
    await view.setProps({ triggerId: null }); expect(popup).toHaveTextContent('Content');
    await view.setProps({ open: false }); expect(screen.queryByTestId('popup')).toBeNull(); view.unmount();
  });
  check('retained close state does not leak across initially-open root remount', async () => {
    const handle = Tooltip.createHandle<string>(); let prevent = true;
    const view = await renderProps((props: { mounted: boolean; defaultOpen: boolean }) => <>
      <Tooltip.Trigger handle={handle} id="first" payload="first">First</Tooltip.Trigger>
      {props.mounted && <Tooltip.Root handle={handle} defaultOpen={props.defaultOpen} defaultTriggerId="first" onOpenChange={(open, details) => {
        if (!open && prevent) { prevent = false; details.preventUnmountOnClose(); }
      }}><Content /></Tooltip.Root>}
    </>, { mounted: true, defaultOpen: false });
    handle.open('first'); await settle(); handle.close(); await settle(); expect(screen.getByTestId('popup')).toBeInTheDocument();
    await view.setProps({ mounted: false }); expect(screen.queryByTestId('popup')).toBeNull();
    await view.setProps({ mounted: true, defaultOpen: true }); expect(screen.getByTestId('popup')).toBeInTheDocument();
    handle.close(); await settle(); expect(screen.queryByTestId('popup')).toBeNull(); view.unmount();
  });
  check('a default-open root waits for a later detached trigger', async () => {
    const handle = Tooltip.createHandle<string>(); const changed = vi.fn();
    const view = await renderProps((props: { show: boolean }) => <>
      <Tooltip.Root handle={handle} defaultOpen defaultTriggerId="first" onOpenChange={changed}><Content /></Tooltip.Root>
      {props.show && <Tooltip.Trigger handle={handle} id="first">First</Tooltip.Trigger>}
    </>, { show: false });
    expect(untrack(() => handle.isOpen)).toBe(true); await view.setProps({ show: true });
    expect(screen.getByText('First')).toHaveAttribute('data-popup-open'); expect(changed).not.toHaveBeenCalled(); view.unmount();
  });
  check('host Loading owns a delayed detached trigger without closing a default-open root', async () => {
    const handle = Tooltip.createHandle(); let resume!: () => void;
    const gate = new Promise<void>(resolve => { resume = resolve; });
    const changed = vi.fn();
    function DelayedTrigger() {
      const ready = createMemo(async () => { await gate; return true; });
      return <>{ready() && <Tooltip.Trigger handle={handle} id="first">First</Tooltip.Trigger>}</>;
    }
    const view = await render(() => <><Tooltip.Root handle={handle} defaultOpen defaultTriggerId="first" onOpenChange={changed}>
      <Content />
    </Tooltip.Root><Loading fallback="Loading"><DelayedTrigger /></Loading></>);
    expect(untrack(() => handle.isOpen)).toBe(true); expect(screen.getByText('Loading')).toBeInTheDocument();
    resume(); await waitFor(() => expect(screen.getByText('First')).toHaveAttribute('data-popup-open'));
    expect(changed).not.toHaveBeenCalled(); view.unmount();
  });
  check('warns for persistent overlap and restores the previous living root on cleanup', async () => {
    vi.useFakeTimers();
    const handle = Tooltip.createHandle();
    let view!: Awaited<ReturnType<typeof renderProps<{ incoming: boolean }>>>;
    await expectDiagnostic({ message: /more than one mounted root/ }, async () => {
      view = await renderProps((props: { incoming: boolean }) => <>
        <Tooltip.Trigger handle={handle} id="first">First</Tooltip.Trigger>
        <Tooltip.Root handle={handle}><Content value="Outgoing" /></Tooltip.Root>
        {props.incoming && <Tooltip.Root handle={handle}><Content value="Incoming" /></Tooltip.Root>}
      </>, { incoming: true });
      await advanceFrame();
    });
    handle.open('first'); await settle(); expect(screen.getByTestId('popup')).toHaveTextContent('Incoming');
    await view.setProps({ incoming: false }); handle.open('first'); await settle();
    expect(screen.getByTestId('popup')).toHaveTextContent('Outgoing'); view.unmount();
  });
  check('resolves triggers during a transient attachment overlap without resetting root state', async () => {
    const handle = Tooltip.createHandle();
    const view = await renderProps((props: { phase: 'outgoing' | 'overlap' | 'incoming' }) => <>
      <Tooltip.Trigger handle={handle} id="first">First</Tooltip.Trigger>
      {props.phase !== 'incoming' && <Tooltip.Root handle={handle}><Content value="Outgoing" /></Tooltip.Root>}
      {props.phase !== 'outgoing' && <Tooltip.Root handle={handle}><Content value="Incoming" /></Tooltip.Root>}
    </>, { phase: 'outgoing' });
    await view.setProps({ phase: 'overlap' }); handle.open('first'); await settle();
    expect(screen.getByText('First')).toHaveAttribute('data-popup-open');
    await view.setProps({ phase: 'incoming' }); expect(untrack(() => handle.isOpen)).toBe(true); view.unmount();
  });
});
