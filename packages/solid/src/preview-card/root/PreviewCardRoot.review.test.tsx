import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flush, getOwner, Show, untrack } from 'solid-js';
import { advanceTimers, createRenderer, expectDiagnostic, fireEvent, screen } from '../../../test';
import { PreviewCard } from '../index';
import { usePreviewCardRootContext } from './PreviewCardContext';
import type { PreviewCardStore } from '../store/PreviewCardStore';
import { createChangeEventDetails } from '../../internals/createBaseUIEventDetails';

const { render, renderProps } = createRenderer();
const hover = (node: Element, clientX = 0, clientY = 0) => {
  fireEvent.mouseEnter(node, { clientX, clientY });
  fireEvent.mouseMove(node, { clientX, clientY });
  flush();
};

describe('PreviewCard source-first regression checks', () => {
  beforeEach(() => { globalThis.BASE_UI_ANIMATIONS_DISABLED = true; });

  it('keeps handle.isOpen reactive through attachment, disposal, and fresh remount', async () => {
    const handle = PreviewCard.createHandle();
    const view = await renderProps((props: { mounted: boolean }) => <>
      <output data-testid="open">{String(handle.isOpen)}</output>
      <Show when={props.mounted}><PreviewCard.Root handle={handle} defaultOpen /></Show>
    </>, { mounted: false });
    expect(screen.getByTestId('open')).toHaveTextContent('false');
    await view.setProps({ mounted: true });
    expect(screen.getByTestId('open')).toHaveTextContent('true');
    handle.close(); flush();
    expect(screen.getByTestId('open')).toHaveTextContent('false');
    await view.setProps({ mounted: false });
    await view.setProps({ mounted: true });
    expect(screen.getByTestId('open')).toHaveTextContent('true');
    await view.setProps({ mounted: false });
    expect(screen.getByTestId('open')).toHaveTextContent('false');
  });

  it('uses initial defaultOpen/defaultTriggerId only once and preserves link props without an href', async () => {
    const view = await renderProps((props: { initial: boolean; id: string }) =>
      <PreviewCard.Root defaultOpen={props.initial} defaultTriggerId={props.id}>
        <PreviewCard.Trigger id="one" payload={1} data-testid="one">One</PreviewCard.Trigger>
        <PreviewCard.Trigger id="two" payload={2} data-testid="two">Two</PreviewCard.Trigger>
        <PreviewCard.Portal><PreviewCard.Positioner><PreviewCard.Popup data-testid="popup">Content</PreviewCard.Popup></PreviewCard.Positioner></PreviewCard.Portal>
      </PreviewCard.Root>, { initial: true, id: 'one' });
    const first = screen.getByTestId('one');
    expect(first.tagName).toBe('A');
    expect(first).not.toHaveAttribute('href');
    expect(first).not.toHaveAttribute('role');
    expect(first).not.toHaveAttribute('tabindex');
    expect(first).not.toHaveAttribute('aria-expanded');
    expect(first).toHaveAttribute('data-popup-open');
    const popup = screen.getByTestId('popup');
    await view.setProps({ initial: false, id: 'two' });
    expect(screen.getByTestId('one')).toBe(first);
    expect(first).toHaveAttribute('data-popup-open');
    expect(screen.getByTestId('two')).not.toHaveAttribute('data-popup-open');
    expect(screen.getByTestId('popup')).toBe(popup);
  });

  it('restores the previous living root when the newest handle attachment is disposed', async () => {
    vi.useFakeTimers();
    const handle = PreviewCard.createHandle();
    const outgoing = vi.fn();
    const incoming = vi.fn();
    const view = await renderProps((props: { incoming: boolean }) => <>
      <output data-testid="open">{String(handle.isOpen)}</output>
      <PreviewCard.Root handle={handle} defaultOpen onOpenChange={outgoing} />
      <Show when={props.incoming}><PreviewCard.Root handle={handle} onOpenChange={incoming} /></Show>
    </>, { incoming: false });
    expect(screen.getByTestId('open')).toHaveTextContent('true');
    await expectDiagnostic({ message: /more than one mounted root/, count: 1 }, async () => {
      await view.setProps({ incoming: true });
      await advanceTimers(20);
    });
    expect(screen.getByTestId('open')).toHaveTextContent('false');
    await view.setProps({ incoming: false });
    expect(screen.getByTestId('open')).toHaveTextContent('true');
    handle.close(); flush();
    expect(outgoing).toHaveBeenCalledWith(false, expect.objectContaining({ reason: 'imperative-action' }));
    expect(incoming).not.toHaveBeenCalled();
    expect(screen.getByTestId('open')).toHaveTextContent('false');
  });

  it('delivers actionsRef untracked and ownerless on attachment, replacement, and disposal', async () => {
    const calls: { ref: string; label: string; actions: PreviewCard.Root.Actions | null; owner: ReturnType<typeof getOwner> }[] = [];
    const view = await renderProps((props: { swap: boolean; label: string }) => {
      const first = (actions: PreviewCard.Root.Actions | null) => {
        calls.push({ ref: 'first', label: props.label, actions, owner: getOwner() });
      };
      const second = (actions: PreviewCard.Root.Actions | null) => {
        calls.push({ ref: 'second', label: props.label, actions, owner: getOwner() });
      };
      return <PreviewCard.Root actionsRef={props.swap ? second : first} />;
    }, { swap: false, label: 'before' });
    expect(calls).toHaveLength(1);
    const actions = calls[0].actions;
    expect(actions).toEqual({ close: expect.any(Function), unmount: expect.any(Function) });
    expect(calls[0].owner).toBeNull();
    await view.setProps({ label: 'after', swap: true });
    expect(calls.map(({ ref, label, actions: value }) => [ref, label, value])).toEqual([
      ['first', 'before', actions], ['first', 'after', null], ['second', 'after', actions],
    ]);
    view.unmount();
    expect(calls.map(({ ref, actions: value }) => [ref, value])).toEqual([
      ['first', actions], ['first', null], ['second', actions], ['second', null],
    ]);
    expect(calls.every(({ owner }) => owner === null)).toBe(true);
  });

  it('uses fresh delay/closeDelay metadata and cancels a pending hover on disposal', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] });
    const change = vi.fn();
    const view = await renderProps((props: { delay: number; closeDelay: number }) =>
      <PreviewCard.Root onOpenChange={change}>
        <PreviewCard.Trigger href="#preview" delay={props.delay} closeDelay={props.closeDelay}>Link</PreviewCard.Trigger>
        <PreviewCard.Portal><PreviewCard.Positioner data-testid="positioner"><PreviewCard.Popup data-testid="popup">Content</PreviewCard.Popup></PreviewCard.Positioner></PreviewCard.Portal>
      </PreviewCard.Root>, { delay: 600, closeDelay: 300 });
    const link = screen.getByRole('link');
    await view.setProps({ delay: 40, closeDelay: 70 });
    hover(link);
    await advanceTimers(39);
    expect(screen.queryByTestId('popup')).toBeNull();
    await advanceTimers(1);
    const positioner = screen.getByTestId('positioner');
    fireEvent.mouseEnter(positioner); fireEvent.mouseLeave(positioner); flush();
    await advanceTimers(69);
    expect(screen.getByTestId('popup')).toHaveAttribute('data-open');
    await advanceTimers(1);
    expect(screen.queryByTestId('popup')).toBeNull();
    hover(link);
    view.unmount();
    await advanceTimers(600);
    expect(change).toHaveBeenCalledTimes(2);
  });

  it('does not give focus-open cards popup-hover close ownership', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] });
    const change = vi.fn();
    await render(() => <PreviewCard.Root onOpenChange={change}>
      <PreviewCard.Trigger href="#preview" delay={0}>Link</PreviewCard.Trigger>
      <PreviewCard.Portal><PreviewCard.Positioner data-testid="positioner"><PreviewCard.Popup data-testid="popup">Content</PreviewCard.Popup></PreviewCard.Positioner></PreviewCard.Portal>
    </PreviewCard.Root>);
    const link = screen.getByRole('link');
    link.focus(); flush();
    const positioner = screen.getByTestId('positioner');
    fireEvent.mouseEnter(positioner); fireEvent.mouseLeave(positioner); flush();
    await advanceTimers(300);
    expect(screen.getByTestId('popup')).toHaveAttribute('data-open');
    expect(change).toHaveBeenCalledTimes(1);
    expect(change).toHaveBeenCalledWith(true, expect.objectContaining({ reason: 'trigger-focus', trigger: link }));
    link.blur(); flush(); await advanceTimers(0);
    expect(screen.queryByTestId('popup')).toBeNull();
  });

  it('clears association and payload when controlled triggerId becomes null while open', async () => {
    const view = await renderProps<{ triggerId: string | null }>((props) =>
      <PreviewCard.Root open triggerId={props.triggerId}>
        {(context) => <>
          <PreviewCard.Trigger id="one" payload={1} href="#one">One</PreviewCard.Trigger>
          <PreviewCard.Trigger id="two" payload={2} href="#two">Two</PreviewCard.Trigger>
          <span data-testid="payload">{context.payload ?? 'none'}</span>
          <PreviewCard.Portal><PreviewCard.Positioner><PreviewCard.Popup data-testid="popup">Content</PreviewCard.Popup></PreviewCard.Positioner></PreviewCard.Portal>
        </>}
      </PreviewCard.Root>, { triggerId: 'one' });
    expect(screen.getByTestId('payload')).toHaveTextContent('1');
    const popup = screen.getByTestId('popup');
    await view.setProps({ triggerId: null });
    expect(screen.getByRole('link', { name: 'One' })).not.toHaveAttribute('data-popup-open');
    expect(screen.getByRole('link', { name: 'Two' })).not.toHaveAttribute('data-popup-open');
    expect(screen.getByTestId('payload')).toHaveTextContent('none');
    expect(screen.getByTestId('popup')).toBe(popup);
    expect(popup).toHaveAttribute('data-open');
  });

  it('falls back to genuine internal ownership when a controlled triggerId is released', async () => {
    const view = await renderProps<{ triggerId: string | null }>((props) =>
      <PreviewCard.Root defaultOpen defaultTriggerId="one" triggerId={props.triggerId}>
        {(context) => <>
          <PreviewCard.Trigger id="one" payload={1} href="#one">One</PreviewCard.Trigger>
          <PreviewCard.Trigger id="two" payload={2} href="#two">Two</PreviewCard.Trigger>
          <span data-testid="payload">{context.payload ?? 'none'}</span>
          <PreviewCard.Portal><PreviewCard.Positioner><PreviewCard.Popup data-testid="popup">Content</PreviewCard.Popup></PreviewCard.Positioner></PreviewCard.Portal>
        </>}
      </PreviewCard.Root>, { triggerId: 'two' });
    const popup = screen.getByTestId('popup');
    expect(screen.getByTestId('payload')).toHaveTextContent('2');
    expect(screen.getByRole('link', { name: 'Two' })).toHaveAttribute('data-popup-open');
    await view.setProps({ triggerId: null });
    expect(screen.getByRole('link', { name: 'One' })).toHaveAttribute('data-popup-open');
    expect(screen.getByRole('link', { name: 'Two' })).not.toHaveAttribute('data-popup-open');
    expect(screen.getByTestId('payload')).toHaveTextContent('1');
    expect(screen.getByTestId('popup')).toBe(popup);
  });

  it('retains the last requested trigger and payload through same-turn imperative open/switch/close', async () => {
    const handle = PreviewCard.createHandle<number>();
    let store!: PreviewCardStore<unknown>;
    let actions: PreviewCard.Root.Actions | null = null;
    function Probe() { store = usePreviewCardRootContext(); return null; }
    const changes: [boolean, Element | undefined][] = [];
    await render(() => <>
      <PreviewCard.Trigger handle={handle} id="one" href="#one" payload={1}>One</PreviewCard.Trigger>
      <PreviewCard.Trigger handle={handle} id="two" href="#two" payload={2}>Two</PreviewCard.Trigger>
      <PreviewCard.Root handle={handle} defaultOpen defaultTriggerId="one" actionsRef={(value) => { actions = value; }} onOpenChange={(open, details) => {
        changes.push([open, details.trigger]);
        if (!open) details.preventUnmountOnClose();
      }}>
        {(context) => <>
          <Probe />
          <span data-testid="payload">{context.payload ?? 'none'}</span>
          <PreviewCard.Portal><PreviewCard.Positioner><PreviewCard.Popup data-testid="popup">Content</PreviewCard.Popup></PreviewCard.Positioner></PreviewCard.Portal>
        </>}
      </PreviewCard.Root>
    </>);
    const first = screen.getByRole('link', { name: 'One' });
    const second = screen.getByRole('link', { name: 'Two' });
    handle.open('one');
    expect(store.getCurrentTrigger?.()).toBe(first);
    handle.open('two');
    expect(store.getCurrentTrigger?.()).toBe(second);
    handle.close();
    expect(store.getCurrentTrigger?.()).toBe(second);
    flush();
    expect(changes).toEqual([[true, first], [true, second], [false, undefined]]);
    expect(screen.getByTestId('payload')).toHaveTextContent('2');
    expect(screen.getByTestId('popup')).toHaveAttribute('data-closed');
    expect(first).not.toHaveAttribute('data-popup-open');
    expect(second).not.toHaveAttribute('data-popup-open');
    actions!.unmount(); flush();
    expect(screen.queryByTestId('popup')).toBeNull();
    expect(store.getCurrentTrigger?.()).toBeNull();
  });

  for (const sameTrigger of [true, false]) {
    it(`reopens ${sameTrigger ? 'the same' : 'another'} trigger immediately during a held close, then restores its delay after unmount`, async () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] });
      let actions: PreviewCard.Root.Actions | null = null;
      await render(() => <PreviewCard.Root<number> actionsRef={(value) => { actions = value; }} onOpenChange={(open, details) => {
        if (!open) details.preventUnmountOnClose();
      }}>
        {(context) => <>
          <PreviewCard.Trigger id="one" href="#one" payload={1} delay={120} closeDelay={0}>One</PreviewCard.Trigger>
          <PreviewCard.Trigger id="two" href="#two" payload={2} delay={600} closeDelay={0}>Two</PreviewCard.Trigger>
          <PreviewCard.Portal keepMounted><PreviewCard.Positioner data-testid="positioner"><PreviewCard.Popup data-testid="popup">{context.payload}</PreviewCard.Popup></PreviewCard.Positioner></PreviewCard.Portal>
        </>}
      </PreviewCard.Root>);
      const first = screen.getByRole('link', { name: 'One' });
      const next = screen.getByRole('link', { name: sameTrigger ? 'One' : 'Two' });
      const popup = screen.getByTestId('popup');
      const positioner = screen.getByTestId('positioner');
      hover(first); await advanceTimers(120);
      expect(popup).toHaveAttribute('data-open');
      fireEvent.mouseLeave(first); flush(); await advanceTimers(0);
      expect(popup).toHaveAttribute('data-ending-style');
      expect(popup).toHaveAttribute('data-closed');
      hover(next);
      expect(popup).toHaveAttribute('data-open');
      expect(popup).toHaveTextContent(sameTrigger ? '1' : '2');
      expect(screen.getByTestId('popup')).toBe(popup);
      expect(screen.getByTestId('positioner')).toBe(positioner);
      fireEvent.mouseLeave(next); flush(); await advanceTimers(0);
      expect(popup).toHaveAttribute('data-ending-style');
      actions!.unmount(); flush();
      expect(positioner).toHaveAttribute('hidden');
      expect(popup).not.toHaveAttribute('data-ending-style');
      hover(next);
      const delay = sameTrigger ? 120 : 600;
      await advanceTimers(delay - 1);
      expect(popup).toHaveAttribute('data-closed');
      await advanceTimers(1);
      expect(popup).toHaveAttribute('data-open');
      expect(screen.getByTestId('popup')).toBe(popup);
      expect(screen.getByTestId('positioner')).toBe(positioner);
    });
  }

  it('captures the latest inline hover only after acceptance and clears it after close completion', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] });
    let store!: PreviewCardStore<unknown>;
    function Probe() { store = usePreviewCardRootContext(); return null; }
    const seen: unknown[] = [];
    const view = await renderProps((props: { cancel: boolean }) =>
      <PreviewCard.Root onOpenChange={(next, details) => {
        seen.push(store.inlineRectCoordsRef.current);
        if (next && props.cancel) details.cancel();
      }}>
        <Probe />
        <PreviewCard.Trigger href="#preview" delay={100}>Link</PreviewCard.Trigger>
        <PreviewCard.Portal><PreviewCard.Positioner><PreviewCard.Popup data-testid="popup">Content</PreviewCard.Popup></PreviewCard.Positioner></PreviewCard.Portal>
      </PreviewCard.Root>, { cancel: true });
    const link = screen.getByRole('link');
    Object.defineProperty(link, 'getClientRects', { value: () => [
      new DOMRect(0, 0, 80, 20), new DOMRect(0, 20, 60, 20),
    ] });
    hover(link, 30, 10);
    fireEvent.mouseMove(link, { clientX: 30, clientY: 30 }); flush();
    await advanceTimers(100);
    expect(screen.queryByTestId('popup')).toBeNull();
    expect(store.inlineRectCoordsRef.current).toMatchObject({ element: link, lineIndex: 1 });
    // Callback cancellation does not erase the trigger's existing pointer sample.
    expect(store.inlineRectCoordsRef.current).toBe(seen[0]);
    await view.setProps({ cancel: false });
    hover(link, 30, 30); await advanceTimers(100);
    expect(screen.getByTestId('popup')).toHaveAttribute('data-open');
    expect(store.inlineRectCoordsRef.current).toMatchObject({ element: link, lineIndex: 1 });
    // Moving over another line while open must not change the selected line.
    fireEvent.mouseMove(link, { clientX: 30, clientY: 10 }); flush();
    expect(store.inlineRectCoordsRef.current?.lineIndex).toBe(1);
    untrack(() => store.setOpen(false, createChangeEventDetails('imperative-action')));
    flush();
    await advanceTimers(0);
    expect(screen.queryByTestId('popup')).toBeNull();
    expect(store.inlineRectCoordsRef.current).toBeUndefined();
  });
});
