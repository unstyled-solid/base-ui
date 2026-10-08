import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flush, Show, untrack } from 'solid-js';
import { advanceTimers, createRenderer, expectDiagnostic, fireEvent, screen, sourceCase, waitFor } from '../../../test';
import { PreviewCard } from '../index';

const source = 'packages/react/src/preview-card/root/PreviewCardRoot.detached-triggers.test.tsx';
const { render, renderProps } = createRenderer();
const hover = (node: Element) => { fireEvent.mouseEnter(node); fireEvent.mouseMove(node); flush(); };

function Surface() {
  return <PreviewCard.Portal><PreviewCard.Positioner data-testid="positioner"><PreviewCard.Popup data-testid="popup">Content</PreviewCard.Popup></PreviewCard.Positioner></PreviewCard.Portal>;
}

describe('PreviewCard detached handle ownership', () => {
  beforeEach(() => { globalThis.BASE_UI_ANIMATIONS_DISABLED = true; });

  sourceCase({ source, case: 'ignores imperative handle calls made before a root is attached', environment: 'jsdom', adaptation: 'exact-count diagnostic expectation, no console suppression' }, async () => {
    const handle = PreviewCard.createHandle<number>();
    await expectDiagnostic({ message: /no root using this handle is mounted/, count: 2 }, () => { handle.open('trigger'); handle.close(); });
    expect(untrack(() => handle.isOpen)).toBe(false);
    await render(() => <>
      <PreviewCard.Trigger handle={handle} id="trigger" payload={1} href="#">Trigger</PreviewCard.Trigger>
      <PreviewCard.Root handle={handle}>{(context) => <><span data-testid="payload">{context.payload ?? 'none'}</span><Surface /></>}</PreviewCard.Root>
    </>);
    expect(screen.queryByTestId('popup')).toBeNull();
    expect(screen.getByTestId('payload')).toHaveTextContent('none');
    handle.open('trigger'); flush();
    expect(screen.getByTestId('payload')).toHaveTextContent('1');
    expect(screen.getByRole('link')).toHaveAttribute('data-popup-open');
  });

  sourceCase({ source, case: 'ignores imperative handle calls made after the root is detached / fresh remount', environment: 'jsdom' }, async () => {
    const handle = PreviewCard.createHandle<number>();
    const view = await renderProps((props: { mounted: boolean }) => <>
      <PreviewCard.Trigger handle={handle} id="trigger" payload={1} href="#">Trigger</PreviewCard.Trigger>
      <Show when={props.mounted}><PreviewCard.Root handle={handle}>{(context) => <><span data-testid="payload">{context.payload ?? 'none'}</span><Surface /></>}</PreviewCard.Root></Show>
    </>, { mounted: true });
    handle.open('trigger'); flush();
    expect(screen.getByTestId('payload')).toHaveTextContent('1');
    await view.setProps({ mounted: false });
    expect(untrack(() => handle.isOpen)).toBe(false);
    await expectDiagnostic({ message: /no root using this handle is mounted/, count: 2 }, () => { handle.open('trigger'); handle.close(); });
    await view.setProps({ mounted: true });
    expect(screen.queryByTestId('popup')).toBeNull();
    expect(screen.getByTestId('payload')).toHaveTextContent('none');
    handle.open('trigger'); flush();
    expect(screen.getByTestId('payload')).toHaveTextContent('1');
  });

  for (const defaultOpen of [false, true]) {
    sourceCase({ source, case: `registers a detached trigger declared after the root / defaultOpen=${defaultOpen}`, environment: 'jsdom' }, async () => {
      const handle = PreviewCard.createHandle();
      const change = vi.fn();
      await render(() => <>
        <PreviewCard.Root handle={handle} defaultOpen={defaultOpen} defaultTriggerId="trigger" onOpenChange={change}><Surface /></PreviewCard.Root>
        <PreviewCard.Trigger handle={handle} id="trigger" href="#">Trigger</PreviewCard.Trigger>
      </>);
      if (defaultOpen) expect(change).not.toHaveBeenCalled();
      else { handle.open('trigger'); flush(); }
      expect(screen.getByRole('link')).toHaveAttribute('data-popup-open');
      expect(untrack(() => handle.isOpen)).toBe(true);
    });
  }

  sourceCase({ source, case: 'throws when called with an unregistered trigger id', environment: 'jsdom' }, async () => {
    const handle = PreviewCard.createHandle();
    await render(() => <PreviewCard.Root handle={handle}><Surface /></PreviewCard.Root>);
    expect(() => handle.open('missing')).toThrow('was called with the trigger id "missing"');
    expect(untrack(() => handle.isOpen)).toBe(false);
  });

  sourceCase({ source, case: 'warns when a handle stays attached to more than one mounted root', environment: 'jsdom' }, async () => {
    vi.useFakeTimers();
    const handle = PreviewCard.createHandle();
    await expectDiagnostic({ message: /more than one mounted root/ }, async () => {
      await render(() => <><PreviewCard.Root handle={handle} /><PreviewCard.Root handle={handle} /></>);
      await advanceTimers(20);
    });
  });

  sourceCase({ source, case: 'resolves a trigger still registered to the previous root during a transient overlap', environment: 'jsdom', adaptation: 'native staged attachment; no React commit emulation' }, async () => {
    vi.useFakeTimers();
    const handle = PreviewCard.createHandle<number>();
    const view = await renderProps((props: { phase: 'outgoing' | 'overlap' | 'incoming' }) => <>
      <PreviewCard.Trigger handle={handle} id="trigger" payload={42} href="#">Trigger</PreviewCard.Trigger>
      <Show when={props.phase !== 'incoming'}><PreviewCard.Root handle={handle}><span>Outgoing</span></PreviewCard.Root></Show>
      <Show when={props.phase !== 'outgoing'}><PreviewCard.Root handle={handle}>{(context) => <span data-testid="incoming">{context.payload}</span>}</PreviewCard.Root></Show>
    </>, { phase: 'outgoing' });
    await view.setProps({ phase: 'overlap' });
    expect(() => handle.open('trigger')).not.toThrow(); flush();
    await view.setProps({ phase: 'incoming' });
    await advanceTimers(20);
    expect(untrack(() => handle.isOpen)).toBe(true);
    expect(screen.getByTestId('incoming')).toHaveTextContent('42');
  });

  it('migrates an already mounted trigger to a replacement handle without replacing its link', async () => {
    const first = PreviewCard.createHandle<number>();
    const second = PreviewCard.createHandle<number>();
    const view = await renderProps((props: { handle: PreviewCard.Handle<number> }) => <>
      <PreviewCard.Trigger handle={props.handle} id="trigger" payload={42} href="#">Trigger</PreviewCard.Trigger>
      <PreviewCard.Root handle={props.handle}>{(context) => <span data-testid="payload">{context.payload ?? 'none'}</span>}</PreviewCard.Root>
    </>, { handle: first });
    const link = screen.getByRole('link');
    await view.setProps({ handle: second });
    second.open('trigger'); flush();
    expect(screen.getByRole('link')).toBe(link);
    expect(screen.getByTestId('payload')).toHaveTextContent('42');
    expect(untrack(() => first.isOpen)).toBe(false);
    expect(untrack(() => second.isOpen)).toBe(true);
  });
});

for (const detached of [false, true]) {
  describe(`PreviewCard multiple ${detached ? 'detached' : 'contained'} triggers`, () => {
    beforeEach(() => { globalThis.BASE_UI_ANIMATIONS_DISABLED = true; });
    function Fixture(props: {
      remove?: boolean;
      root?: PreviewCard.Root.Props<number>;
      payload?: number;
      handle: PreviewCard.Handle<number>;
    }) {
      function Triggers() {
        return <>
          <Show when={!props.remove}><PreviewCard.Trigger handle={detached ? props.handle : undefined} id="one" payload={props.payload ?? 1} href="#" delay={0} closeDelay={0}>One</PreviewCard.Trigger></Show>
          <PreviewCard.Trigger handle={detached ? props.handle : undefined} id="two" payload={2} href="#" delay={2000}>Two</PreviewCard.Trigger>
          <PreviewCard.Trigger handle={detached ? props.handle : undefined} id="three" payload={3} href="#" delay={0} closeDelay={0}>Three</PreviewCard.Trigger>
        </>;
      }
      return <>
        {detached && <Triggers />}
        <PreviewCard.Root handle={props.handle} {...props.root}>{(context) => <>
          {!detached && <Triggers />}
          <span data-testid="payload">{context.payload ?? 'none'}</span>
          <Surface />
        </>}</PreviewCard.Root>
      </>;
    }

    for (const input of ['hover', 'focus'] as const) {
      sourceCase({ source, case: `should open the preview card with any trigger on ${input} [detached=${detached}]`, environment: 'jsdom' }, async () => {
        vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] });
        await render(() => { const handle = PreviewCard.createHandle<number>(); return <Fixture handle={handle} />; });
        for (const [label, payload, delay] of [['One', '1', 0], ['Two', '2', 2000], ['Three', '3', 0]] as const) {
          const node = screen.getByRole('link', { name: label });
          if (input === 'hover') hover(node); else { node.focus(); flush(); }
          await advanceTimers(delay);
          expect(screen.getByTestId('payload')).toHaveTextContent(payload);
          expect(node).toHaveAttribute('data-popup-open');
          if (input === 'hover') fireEvent.mouseLeave(node); else node.blur();
          flush(); await advanceTimers(300);
          expect(screen.queryByTestId('popup')).toBeNull();
        }
      });
      sourceCase({ source, case: `should open immediately when ${input === 'hover' ? 'hovering' : 'focusing'} another trigger while open [detached=${detached}]`, environment: 'jsdom' }, async () => {
        vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] });
        await render(() => { const handle = PreviewCard.createHandle<number>(); return <Fixture handle={handle} />; });
        const first = screen.getByRole('link', { name: 'One' });
        const second = screen.getByRole('link', { name: 'Two' });
        if (input === 'hover') hover(first); else { first.focus(); flush(); }
        await advanceTimers(0);
        expect(screen.getByTestId('payload')).toHaveTextContent('1');
        const popup = screen.getByTestId('popup');
        const positioner = screen.getByTestId('positioner');
        if (input === 'hover') hover(second); else { second.focus(); flush(); }
        await advanceTimers(0);
        expect(screen.getByTestId('payload')).toHaveTextContent('2');
        expect(screen.getByTestId('popup')).toBe(popup);
        expect(screen.getByTestId('positioner')).toBe(positioner);
        expect(first).not.toHaveAttribute('data-popup-open');
        expect(second).toHaveAttribute('data-popup-open');
      });
    }

    sourceCase({ source, case: `should open again after escape when focusing another trigger [detached=${detached}]`, environment: 'jsdom' }, async () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] });
      await render(() => { const handle = PreviewCard.createHandle<number>(); return <Fixture handle={handle} />; });
      const first = screen.getByRole('link', { name: 'One' });
      first.focus(); flush(); await advanceTimers(0);
      fireEvent.keyDown(first, { key: 'Escape' }); flush(); await advanceTimers(0);
      expect(screen.queryByTestId('popup')).toBeNull();
      screen.getByRole('link', { name: 'Three' }).focus(); flush(); await advanceTimers(0);
      expect(screen.getByTestId('payload')).toHaveTextContent('3');
    });

    for (const cancel of [false, true]) {
      sourceCase({ source, case: `active trigger unmount ${cancel ? 'close is canceled' : 'closes'} [detached=${detached}]`, environment: 'jsdom' }, async () => {
        const change = vi.fn((next: boolean, details: PreviewCard.Root.ChangeEventDetails) => { if (cancel && !next) details.cancel(); });
        const handle = PreviewCard.createHandle<number>();
        const view = await renderProps((props: { remove: boolean }) => <Fixture handle={handle} remove={props.remove} root={{ defaultOpen: true, defaultTriggerId: 'one', onOpenChange: change }} />, { remove: false });
        expect(screen.getByTestId('payload')).toHaveTextContent('1');
        await view.setProps({ remove: true }); flush();
        expect(change).toHaveBeenCalledWith(false, expect.objectContaining({ reason: 'none' }));
        expect(screen.getByRole('link', { name: 'Two' })).not.toHaveAttribute('data-popup-open');
        await waitFor(() => expect(screen.queryByTestId('popup') !== null).toBe(cancel));
        if (cancel) expect(screen.getByTestId('payload')).toHaveTextContent('1');
      });
    }

    sourceCase({ source, case: `imperative open/close sets associated payload [detached=${detached}]`, environment: 'jsdom' }, async () => {
      const handle = PreviewCard.createHandle<number>();
      await render(() => <Fixture handle={handle} />);
      handle.open('two'); flush();
      expect(screen.getByTestId('payload')).toHaveTextContent('2');
      expect(screen.getByRole('link', { name: 'Two' })).toHaveAttribute('data-popup-open');
      handle.close(); flush();
      await waitFor(() => expect(screen.queryByTestId('popup')).toBeNull());
    });

    sourceCase({ source, case: `controlled open and triggerId / defaultTriggerId [detached=${detached}]`, environment: 'jsdom' }, async () => {
      const handle = PreviewCard.createHandle<number>();
      const view = await renderProps<{ open: boolean; triggerId: string | null }>((props) =>
        <Fixture handle={handle} root={{ get open() { return props.open; }, get triggerId() { return props.triggerId; } }} />,
      { open: false, triggerId: null });
      await view.setProps({ open: true, triggerId: 'one' });
      expect(screen.getByTestId('payload')).toHaveTextContent('1');
      await view.setProps({ triggerId: 'two' });
      expect(screen.getByTestId('payload')).toHaveTextContent('2');
      await view.setProps({ open: false });
      expect(screen.queryByTestId('popup')).toBeNull();
    });

    it('forwards fresh payload without unregistering or changing host identity', async () => {
      const handle = PreviewCard.createHandle<number>();
      const view = await renderProps((props: { payload: number }) => <Fixture handle={handle} payload={props.payload} root={{ defaultOpen: true, defaultTriggerId: 'one' }} />, { payload: 1 });
      const link = screen.getByRole('link', { name: 'One' });
      await view.setProps({ payload: 9 });
      expect(screen.getByTestId('payload')).toHaveTextContent('9');
      expect(screen.getByRole('link', { name: 'One' })).toBe(link);
    });
  });
}
