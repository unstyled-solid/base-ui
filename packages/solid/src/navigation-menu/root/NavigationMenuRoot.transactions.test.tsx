import { describe, it, expect, vi } from 'vitest';
import { createEffect, flush, onSettled } from 'solid-js';
import { createRenderer, fireEvent, waitFor } from '../../../test';
import { createChangeEventDetails } from '../../internals/createBaseUIEventDetails';
import { NavigationMenuRoot } from './NavigationMenuRoot';
import { useNavigationMenuRootContext } from './NavigationMenuRootContext';

// Root contract fixtures exercise real state/tree/presence implementations.
// Part-level DOM, hover and positioning integration is in NavigationMenu.test.
function Driver(props: { value?: any; nested?: boolean }) {
  const root = useNavigationMenuRootContext();
  return <>
    <output data-testid={props.nested ? 'nested-state' : 'state'} data-open={String(root.open)} data-mounted={String(root.mounted)} data-inert={String(root.viewportInert)}>{String(root.value)}</output>
    <button onClick={() => root.setViewportInert(true)}>Make inert</button>
    <button onClick={(event) => root.setValue(props.value ?? 'a', createChangeEventDetails('trigger-press', event))}>{props.nested ? 'Nested open' : 'Open'}</button>
    <button onClick={(event) => root.setValue(null, createChangeEventDetails('link-press', event))}>{props.nested ? 'Nested close' : 'Close'}</button>
    <button onClick={(event) => {
      const details = createChangeEventDetails('trigger-press', event);
      root.setValue(props.value ?? 'a', details);
      root.setValue(props.value ?? 'a', details);
    }}>Same native event</button>
  </>;
}
function FloatingDriver(props: { value: string; dispatch: (details: import('../../internals/contracts/events').FloatingUIOpenChangeDetails) => void; replay?: boolean }) {
  const root = useNavigationMenuRootContext();
  let node: HTMLElement | null = null;
  onSettled(() => root.registerTrigger({ get value() { return props.value; }, get element() { return node; } }));
  createEffect(() => ({ context: root.floatingRootContext, dispatch: props.dispatch }), ({ context, dispatch }) => {
    context.events.on('openchange', dispatch);
    return () => context.events.off('openchange', dispatch);
  });
  return <button ref={(element) => { node = element; }} onClick={(event) => {
    root.prepareActivation(props.value, event.currentTarget);
    const details = createChangeEventDetails('trigger-press', event, event.currentTarget);
    if (props.replay) root.setValue(props.value, details);
    root.floatingRootContext.setOpen(true, details);
  }} onMouseLeave={(event) => root.floatingRootContext.setOpen(false, createChangeEventDetails('trigger-hover', event, event.currentTarget))}>{props.value}</button>;
}
describe('NavigationMenuRoot native transaction contracts', () => {
  const { render, renderProps } = createRenderer();
  for (const value of [0, false, '']) {
    it(`derives open from non-nullish default value ${JSON.stringify(value)}`, async () => {
      const view = await render(() => <NavigationMenuRoot defaultValue={value}><Driver value={value} /></NavigationMenuRoot>);
      expect(view.getByTestId('state')).toHaveAttribute('data-open', 'true');
      expect(view.getByTestId('state').textContent).toBe(String(value));
    });
    it(`requests falsy ${JSON.stringify(value)} without losing its identity`, async () => {
      const changed = vi.fn();
      const view = await render(() => <NavigationMenuRoot onValueChange={changed}><Driver value={value} /></NavigationMenuRoot>);
      await view.user.click(view.getByText('Open'));
      expect(changed).toHaveBeenCalledTimes(1); expect(changed.mock.calls[0][0]).toBe(value);
      expect(view.getByTestId('state')).toHaveAttribute('data-open', 'true');
    });
  }
  it('cancellation precedes local state', async () => {
    const changed = vi.fn((_value, details: NavigationMenuRoot.ChangeEventDetails) => details.cancel());
    const view = await render(() => <NavigationMenuRoot onValueChange={changed}><Driver /></NavigationMenuRoot>);
    await view.user.click(view.getByText('Open'));
    expect(changed).toHaveBeenCalledTimes(1);
    expect(changed.mock.calls[0][1].isCanceled).toBe(true);
    expect(view.getByTestId('state')).toHaveAttribute('data-open', 'false');
  });
  it('deduplicates the same native event through a staged request', async () => {
    const changed = vi.fn();
    const view = await render(() => <NavigationMenuRoot onValueChange={changed}><Driver /></NavigationMenuRoot>);
    await view.user.click(view.getByText('Same native event'));
    expect(changed).toHaveBeenCalledTimes(1);
    expect(view.getByTestId('state').textContent).toBe('a');
  });
  it('a direct activation plus floating replay changes value and dispatches once', async () => {
    const changed = vi.fn(); const dispatch = vi.fn();
    const view = await render(() => <NavigationMenuRoot onValueChange={changed}><FloatingDriver value="a" dispatch={dispatch} replay /></NavigationMenuRoot>);
    await view.user.click(view.getByText('a'));
    expect(changed).toHaveBeenCalledTimes(1); expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch.mock.calls[0][0].open).toBe(true);
  });
  it('canceled floating activation emits no accepted event', async () => {
    const changed = vi.fn((_value, details: NavigationMenuRoot.ChangeEventDetails) => details.cancel()); const dispatch = vi.fn();
    const view = await render(() => <NavigationMenuRoot onValueChange={changed}><FloatingDriver value="a" dispatch={dispatch} /></NavigationMenuRoot>);
    await view.user.click(view.getByText('a'));
    expect(changed).toHaveBeenCalledTimes(1); expect(dispatch).not.toHaveBeenCalled();
  });
  it('stale hover-close from an inactive trigger cannot close the active value', async () => {
    const changed = vi.fn(); const dispatch = vi.fn();
    const view = await render(() => <NavigationMenuRoot defaultValue="b" onValueChange={changed}><FloatingDriver value="a" dispatch={dispatch} /><Driver value="b" /></NavigationMenuRoot>);
    fireEvent.mouseLeave(view.getByText('a'));
    expect(changed).not.toHaveBeenCalled(); expect(dispatch).not.toHaveBeenCalled();
    expect(view.getByTestId('state').textContent).toBe('b');
  });
  it('controlled proposals invoke the current callback without replacing the value', async () => {
    const first = vi.fn(); const second = vi.fn();
    const view = await renderProps<NavigationMenuRoot.Props>((props) => <NavigationMenuRoot {...props}><Driver /></NavigationMenuRoot>, { value: false, onValueChange: first });
    const host = view.getByRole('navigation');
    await view.setProps({ value: '', onValueChange: second });
    await view.user.click(view.getByText('Open'));
    expect(first).not.toHaveBeenCalled(); expect(second).toHaveBeenCalledTimes(1);
    expect(second.mock.calls[0][0]).toBe('a');
    expect(view.getByTestId('state').textContent).toBe('');
    expect(view.getByRole('navigation')).toBe(host);
  });
  it('resets viewport inertness on committed value changes, including a return to an earlier value', async () => {
    const view = await renderProps<NavigationMenuRoot.Props>((props) => <NavigationMenuRoot {...props}><Driver value="b" /></NavigationMenuRoot>, { value: 'a' });
    await view.user.click(view.getByText('Make inert'));
    expect(view.getByTestId('state')).toHaveAttribute('data-inert', 'true');
    // An accepted controlled proposal is not a committed value change.
    await view.user.click(view.getByText('Open'));
    expect(view.getByTestId('state')).toHaveAttribute('data-inert', 'true');
    await view.setProps({ value: 'b' });
    expect(view.getByTestId('state')).toHaveAttribute('data-inert', 'false');
    await view.setProps({ value: 'a' });
    expect(view.getByTestId('state')).toHaveAttribute('data-inert', 'false');
  });
  it('manual unmount ignores open state, preserves redundant-close opt-out and completes exactly once', async () => {
    const actions = { current: null as NavigationMenuRoot.Actions | null }; const complete = vi.fn(); const changed = vi.fn((value, details: NavigationMenuRoot.ChangeEventDetails) => { if (value == null) details.preventUnmountOnClose(); });
    const view = await render(() => <NavigationMenuRoot defaultValue="a" actionsRef={actions} onOpenChangeComplete={complete} onValueChange={changed}><Driver /></NavigationMenuRoot>);
    actions.current!.unmount();
    flush(); // Separate the stale-open action from the later close (source act boundary).
    expect(view.getByTestId('state')).toHaveAttribute('data-mounted', 'true');
    actions.current!.close();
    await waitFor(() => expect(view.getByTestId('state')).toHaveAttribute('data-open', 'false'));
    actions.current!.close();
    expect(changed).toHaveBeenCalledTimes(1);
    expect(changed.mock.calls[0][1].reason).toBe('imperative-action');
    expect(view.getByTestId('state')).toHaveAttribute('data-mounted', 'true');
    actions.current!.unmount();
    await waitFor(() => expect(view.getByTestId('state')).toHaveAttribute('data-mounted', 'false'));
    actions.current!.unmount();
    expect(complete).toHaveBeenCalledExactlyOnceWith(false);
    view.unmount(); expect(actions.current).toBeNull();
  });
  it('nested native link requests bubble once and render a nested div', async () => {
    const parentChange = vi.fn(); const childChange = vi.fn();
    const view = await render(() => <NavigationMenuRoot defaultValue="a" onValueChange={parentChange} data-testid="parent-root"><Driver />
      <NavigationMenuRoot defaultValue={false} onValueChange={childChange} data-testid="nested-root"><Driver nested value={false} /></NavigationMenuRoot>
    </NavigationMenuRoot>);
    expect(view.getByTestId('parent-root').tagName).toBe('NAV');
    expect(view.getByTestId('nested-root').tagName).toBe('DIV');
    await view.user.click(view.getByText('Nested close'));
    expect(childChange).toHaveBeenCalledTimes(1); expect(parentChange).toHaveBeenCalledTimes(1);
    expect(parentChange.mock.calls[0][1].reason).toBe('link-press');
    expect(view.getByTestId('state')).toHaveAttribute('data-open', 'false');
    expect(view.getByTestId('nested-state')).toHaveAttribute('data-open', 'false');
  });
});
