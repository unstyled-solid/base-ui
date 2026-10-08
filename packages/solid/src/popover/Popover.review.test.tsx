import { describe, expect, it, vi } from 'vitest';
import { flush, onCleanup, onSettled, Show, untrack } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { createRenderer, fireEvent, firePointer, screen, waitFor } from '../../test';
import { Popover } from './index';
import { usePopoverRootContext } from './root/PopoverRootContext';
import { ToolbarRootContext } from '../toolbar/root/ToolbarRootContext';
import { Tooltip } from '../tooltip';

// Behavioral regressions from PopoverRoot(.detached-triggers), Close, Popup and Backdrop @19511bb.
const { render, renderProps } = createRenderer();
function Popup(props: { children?: JSX.Element; keepMounted?: boolean }) {
  return <Popover.Portal keepMounted={props.keepMounted}><Popover.Positioner data-testid="positioner">
    <Popover.Popup data-testid="popup">{props.children}<Popover.Close>Close</Popover.Close></Popover.Popup>
  </Popover.Positioner></Popover.Portal>;
}

describe('Popover source-first review', () => {
  it.each([false, true])('derives floating nesting from a positioner ancestor, not merely another Root (inPopup=%s)', async (inPopup) => {
    const nested: boolean[] = [];
    function Observe() {
      const store = usePopoverRootContext();
      onSettled(() => {
        const change = (details: { nested: boolean }) => nested.push(details.nested);
        store.state.floatingRootContext.events.on('openchange', change);
        return () => store.state.floatingRootContext.events.off('openchange', change);
      });
      return null;
    }
    function Child() { return <Popover.Root><Popover.Trigger>Child</Popover.Trigger><Observe /></Popover.Root>; }
    const view = await render(() => <Popover.Root defaultOpen>
      <Popover.Trigger>Parent</Popover.Trigger>{inPopup ? <Popup><Child /></Popup> : <Child />}
    </Popover.Root>);
    await view.user.click(screen.getByRole('button', { name: 'Child' }));
    expect(nested).toEqual([inPopup]);
  });

  it.each([false, true, 'trap-focus'] as const)('renders the source modal backdrop and removes ARIA controls on a retained close (modal=%s)', async (modal) => {
    const view = await render(() => <Popover.Root defaultOpen modal={modal} onOpenChange={(_open, details) => details.preventUnmountOnClose()}>
      <Popover.Trigger>Toggle</Popover.Trigger><Popup />
    </Popover.Root>);
    const trigger = screen.getByRole('button', { name: 'Toggle' });
    const positioner = screen.getByTestId('positioner');
    expect(positioner.previousElementSibling?.getAttribute('role') ?? null).toBe(modal === true ? 'presentation' : null);
    expect(trigger).toHaveAttribute('aria-controls', screen.getByTestId('popup').id);
    await view.user.keyboard('{Escape}');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).not.toHaveAttribute('aria-controls');
    expect(screen.getByTestId('popup')).toHaveAttribute('data-closed');
    expect(positioner).not.toHaveAttribute('inert');
    expect(positioner.style.pointerEvents).toBe('none');
  });

  it('retains open ownership and payload when the active trigger unmounts', async () => {
    const handle = Popover.createHandle<{ value: number }>();
    const payload = { value: 7 };
    let readPayload!: () => unknown;
    function Observe() {
      const store = usePopoverRootContext();
      readPayload = () => untrack(() => store.state.payload);
      return null;
    }
    const changed = vi.fn();
    const view = await renderProps((props: { show: boolean }) => <>
      {props.show && <Popover.Trigger handle={handle} id="trigger" payload={payload}>Toggle</Popover.Trigger>}
      <Popover.Root defaultOpen defaultTriggerId="trigger" handle={handle} onOpenChange={changed}>{(state) => <>
        <output>{state.payload?.value}</output><Observe /><Popup />
      </>}</Popover.Root>
    </>, { show: true });
    expect(readPayload()).toBe(payload);
    await view.setProps({ show: false });
    expect(untrack(() => handle.isOpen)).toBe(true);
    expect(changed).not.toHaveBeenCalled();
    expect(screen.getByRole('status')).toHaveTextContent('7');
  });

  it('keeps current root transactions and raw payload ownership across same-turn trigger requests', async () => {
    const requests: (Element | undefined)[] = [];
    const one = { value: 1 }, two = { value: 2 };
    let currentPayload!: () => unknown;
    function Observe() { const store = usePopoverRootContext(); currentPayload = () => untrack(() => store.state.payload); return null; }
    await render(() => <Popover.Root<{ value: number }> onOpenChange={(_open, details) => requests.push(details.trigger)}>{(state) => <>
      <Popover.Trigger id="one" payload={one}>One</Popover.Trigger><Popover.Trigger id="two" payload={two}>Two</Popover.Trigger>
      <output>{state.payload?.value}</output><Observe /><Popup />
    </>}</Popover.Root>);
    const first = screen.getByRole('button', { name: 'One' }), second = screen.getByRole('button', { name: 'Two' });
    fireEvent.click(first); fireEvent.click(second); flush();
    expect(requests).toEqual([first, second]);
    expect(currentPayload()).toBe(two);
    expect(screen.getByRole('status')).toHaveTextContent('2');
    expect(first).toHaveAttribute('aria-expanded', 'false');
    expect(second).toHaveAttribute('aria-expanded', 'true');
  });

  it('observes the actual custom-rendered popup ID, updates it live, and restores the generated default', async () => {
    function CustomPopup(props: { override: string | undefined }) {
      const custom: NonNullable<Popover.Popup.Props['render']> = (host) => <div {...host} id={props.override ?? host.id} />;
      return <Popover.Popup render={custom}>Content</Popover.Popup>;
    }
    const view = await renderProps((props: { override: string | undefined }) => <Popover.Root open>
      <Popover.Trigger>Toggle</Popover.Trigger><Popover.Portal><Popover.Positioner>
        <CustomPopup override={props.override} />
      </Popover.Positioner></Popover.Portal>
    </Popover.Root>, { override: 'custom-first' });
    const trigger = screen.getByRole('button', { name: 'Toggle' }), popup = screen.getByRole('dialog');
    await waitFor(() => expect(trigger).toHaveAttribute('aria-controls', 'custom-first'));
    await view.setProps({ override: 'custom-second' });
    await waitFor(() => expect(trigger).toHaveAttribute('aria-controls', 'custom-second'));
    expect(screen.getByRole('dialog')).toBe(popup);
    await view.setProps({ override: undefined });
    await waitFor(() => expect(popup.id).not.toBe('custom-second'));
    expect(popup.id).not.toBe('');
    expect(trigger).toHaveAttribute('aria-controls', popup.id);
  });

  it('keeps close event trigger fallback undefined if its configured trigger never mounted', async () => {
    const changed = vi.fn();
    const view = await render(() => <Popover.Root defaultOpen defaultTriggerId="missing" onOpenChange={changed}><Popup /></Popover.Root>);
    await view.user.click(screen.getByRole('button', { name: 'Close' }));
    expect(changed).toHaveBeenCalledExactlyOnceWith(false, expect.objectContaining({ reason: 'close-press', trigger: undefined }));
    await waitFor(() => expect(screen.queryByTestId('popup')).toBeNull());
  });

  it('a canceled Close reports the active trigger and preserves the popup', async () => {
    const changed = vi.fn((_open: boolean, details: Popover.Root.ChangeEventDetails) => details.cancel());
    const view = await render(() => <Popover.Root defaultOpen onOpenChange={changed}>
      <Popover.Trigger id="trigger">Toggle</Popover.Trigger><Popup />
    </Popover.Root>);
    const popup = screen.getByTestId('popup');
    await view.user.click(screen.getByRole('button', { name: 'Close' }));
    expect(changed).toHaveBeenCalledExactlyOnceWith(false, expect.objectContaining({ reason: 'close-press', trigger: screen.getByRole('button', { name: 'Toggle' }) }));
    expect(screen.getByTestId('popup')).toBe(popup);
    expect(popup).toHaveAttribute('data-open');
  });

  it.each([
    { controlled: false, canceled: false, expected: 'two' },
    { controlled: false, canceled: true, expected: 'one' },
    { controlled: true, canceled: false, expected: 'one' },
  ])('a same-turn Close uses current accepted trigger ownership (controlled=$controlled canceled=$canceled)', async ({ controlled, canceled, expected }) => {
    const handle = Popover.createHandle<number>();
    let reported: Element | undefined;
    const order: string[] = [];
    await render(() => <Popover.Root handle={handle} defaultOpen defaultTriggerId="one" triggerId={controlled ? 'one' : undefined}
      onOpenChange={(open, details) => {
        order.push(`${open ? 'open' : 'close'}:${details.trigger?.id}`);
        if (open && canceled) details.cancel();
        if (!open && details.reason === 'close-press') { reported = details.trigger; details.preventUnmountOnClose(); }
      }}>{(state) => <>
      <Popover.Trigger id="one" payload={1}>One</Popover.Trigger><Popover.Trigger id="two" payload={2}>Two</Popover.Trigger>
      <Popup><output>{state.payload}</output></Popup>
    </>}</Popover.Root>);
    const popup = screen.getByTestId('popup');
    handle.open('two');
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(reported).toBe(screen.getByRole('button', { name: expected === 'two' ? 'Two' : 'One' }));
    expect(order).toEqual(['open:two', `close:${expected}`]);
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(expected === 'two' ? '2' : '1'));
    expect(screen.getByTestId('popup')).toBe(popup);
    expect(popup).toHaveAttribute('data-closed');
    expect(untrack(() => handle.isOpen)).toBe(false);
  });

  it('keeps the Popover trigger when Close composes a real Tooltip trigger', async () => {
    const changed = vi.fn();
    await render(() => <Popover.Root defaultOpen onOpenChange={changed}>
      <Popover.Trigger id="trigger">Toggle</Popover.Trigger><Popover.Portal><Popover.Positioner><Popover.Popup data-testid="popup">
        <Popover.Close data-testid="close" render={(host) => <Tooltip.Root><Tooltip.Trigger {...host}>Close</Tooltip.Trigger></Tooltip.Root>} />
      </Popover.Popup></Popover.Positioner></Popover.Portal>
    </Popover.Root>);
    const trigger = screen.getByRole('button', { name: 'Toggle' });
    fireEvent.click(screen.getByTestId('close'));
    expect(changed).toHaveBeenCalledExactlyOnceWith(false, expect.objectContaining({ reason: 'close-press', trigger }));
    await waitFor(() => expect(screen.queryByTestId('popup')).toBeNull());
  });

  it('blocks toolbar propagation in bubble phase while content receives composite keys', async () => {
    const outside = vi.fn(), inside = vi.fn();
    const view = await render(() => <ToolbarRootContext value={{ disabled: false, orientation: 'horizontal' }}>
      <div onKeyDown={outside}><Popover.Root defaultOpen><Popover.Trigger>Toggle</Popover.Trigger>
        <Popover.Portal><Popover.Positioner><Popover.Popup initialFocus={false} render={(host) => <div onKeyDown={outside}><div {...host} /></div>}>
          <input onKeyDown={inside} />
        </Popover.Popup></Popover.Positioner></Popover.Portal>
      </Popover.Root></div>
    </ToolbarRootContext>);
    const input = screen.getByRole('textbox');
    fireEvent.keyDown(input, { key: 'ArrowRight' });
    expect(inside).toHaveBeenCalledOnce();
    expect(inside.mock.calls[0][0].defaultPrevented).toBe(false);
    expect(outside).not.toHaveBeenCalled();
    view.unmount();
  });

  it('migrates a detached trigger whose custom component retains its first ref and replaces its host', async () => {
    const handle = Popover.createHandle<number>();
    const fallback = untrack(() => handle.store);
    function RetainedRefButton(props: JSX.ButtonHTMLAttributes<HTMLButtonElement> & { nodeKey: string }) {
      const ref = untrack(() => props.ref);
      return <Show keyed when={props.nodeKey}>{(_key: string) => <button {...props} ref={ref} />}</Show>;
    }
    function Fixture(props: { nodeKey: string }) {
      const custom = (host: JSX.ButtonHTMLAttributes<HTMLButtonElement>) => <RetainedRefButton {...host} nodeKey={props.nodeKey} />;
      return <><Popover.Trigger handle={handle} id="trigger" payload={3} render={custom}>Toggle</Popover.Trigger>
        <Popover.Root handle={handle}><Popup /></Popover.Root></>;
    }
    const view = await renderProps(Fixture, { nodeKey: 'first' });
    const original = screen.getByRole('button', { name: 'Toggle' });
    await view.setProps({ nodeKey: 'second' });
    const replacement = screen.getByRole('button', { name: 'Toggle' });
    expect(replacement).not.toBe(original);
    expect(original.isConnected).toBe(false);
    expect(fallback.context.triggerElements.size).toBe(0);
    expect(untrack(() => handle.store.context.triggerElements.getById('trigger'))).toBe(replacement);
    handle.open('trigger'); flush();
    expect(replacement).toHaveAttribute('aria-expanded', 'true');
  });

  it('only dismisses the nested popup on Escape and preserves the parent', async () => {
    const view = await render(() => <Popover.Root defaultOpen><Popover.Trigger>Parent</Popover.Trigger>
      <Popover.Portal><Popover.Positioner><Popover.Popup data-testid="parent">
        <Popover.Root><Popover.Trigger>Child</Popover.Trigger><Popover.Portal><Popover.Positioner>
          <Popover.Popup data-testid="child">Child content</Popover.Popup>
        </Popover.Positioner></Popover.Portal></Popover.Root>
      </Popover.Popup></Popover.Positioner></Popover.Portal>
    </Popover.Root>);
    await view.user.click(screen.getByRole('button', { name: 'Child' }));
    expect(screen.getByTestId('parent')).toHaveAttribute('data-open');
    const child = screen.getByTestId('child');
    fireEvent.keyDown(child, { key: 'Escape' }); flush();
    expect(screen.getByRole('button', { name: 'Child' })).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByTestId('parent')).toHaveAttribute('data-open');
    await waitFor(() => expect(screen.queryByTestId('child')).toBeNull());
  });

  it('does not dismiss either popup when a press begins in the child and ends outside', async () => {
    const view = await render(() => <><button data-testid="outside">Outside</button><Popover.Root defaultOpen>
      <Popover.Trigger>Parent</Popover.Trigger><Popover.Portal><Popover.Positioner><Popover.Popup data-testid="parent">
        <Popover.Root><Popover.Trigger>Child</Popover.Trigger><Popover.Portal><Popover.Positioner><Popover.Popup data-testid="child">Child content</Popover.Popup></Popover.Positioner></Popover.Portal></Popover.Root>
      </Popover.Popup></Popover.Positioner></Popover.Portal>
    </Popover.Root></>);
    await view.user.click(screen.getByRole('button', { name: 'Child' }));
    firePointer.down(screen.getByTestId('child'), { timeStamp: 100, pointerType: 'mouse', button: 0 });
    fireEvent.click(screen.getByTestId('outside'));
    expect(screen.getByTestId('parent')).toHaveAttribute('data-open');
    expect(screen.getByTestId('child')).toHaveAttribute('data-open');
  });

  it('keeps popup children owned once while payload and geometry settle', async () => {
    const mounted = vi.fn(), disposed = vi.fn();
    function Content() { mounted(); onCleanup(disposed); return <input aria-label="Persistent" />; }
    const view = await render(() => <Popover.Root>
      <Popover.Trigger payload={1}>One</Popover.Trigger><Popover.Trigger payload={2}>Two</Popover.Trigger><Popup><Content /></Popup>
    </Popover.Root>);
    await view.user.click(screen.getByRole('button', { name: 'One' }));
    const input = screen.getByRole('textbox');
    await view.user.click(screen.getByRole('button', { name: 'Two' }));
    expect(screen.getByRole('textbox')).toBe(input);
    expect(mounted).toHaveBeenCalledOnce();
    expect(disposed).not.toHaveBeenCalled();
    view.unmount();
    expect(disposed).toHaveBeenCalledOnce();
  });

  it.each(['trigger', 'close'] as const)('keeps %s children owned once across interaction-bag and disabled updates', async (part) => {
    const mounted = vi.fn(), disposed = vi.fn();
    function Label(props: { text: string }) {
      mounted();
      onCleanup(disposed);
      return <span data-testid="part-label">{props.text}</span>;
    }
    const view = await renderProps((props: { open: boolean; disabled: boolean; text: string }) => <Popover.Root open={props.open}>
      {part === 'trigger' ? <Popover.Trigger disabled={props.disabled}><Label text={props.text} /></Popover.Trigger>
        : <Popover.Close disabled={props.disabled}><Label text={props.text} /></Popover.Close>}<Popup />
    </Popover.Root>, { open: false, disabled: false, text: 'Before' });
    const trigger = screen.getByRole('button', { name: 'Before' });
    const label = screen.getByTestId('part-label');
    await view.setProps({ open: true });
    expect(screen.getByRole('button', { name: 'Before' })).toBe(trigger);
    await view.setProps({ disabled: true, text: 'After' });
    expect(screen.getByRole('button', { name: 'After' })).toBe(trigger);
    expect(screen.getByTestId('part-label')).toBe(label);
    expect(trigger).toBeDisabled();
    await view.setProps({ open: false });
    expect(screen.getByTestId('part-label')).toBe(label);
    expect(mounted).toHaveBeenCalledOnce();
    expect(disposed).not.toHaveBeenCalled();
    view.unmount();
    expect(disposed).toHaveBeenCalledOnce();
  });
});
