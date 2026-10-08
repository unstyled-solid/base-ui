import { describe, expect, it, vi } from 'vitest';
import { untrack } from 'solid-js';
import { createRenderer, screen, fireEvent, firePointer, advanceTimers } from '../../test';
import { Tooltip } from './index';
import { settle } from './Tooltip.test-utils';
import { useTooltipRootContext } from './root/TooltipRootContext';
import type { TooltipStore } from './store/TooltipStore';

const { render, renderProps } = createRenderer();

describe('Tooltip source-first regressions', () => {
  it('opens a provider trigger after its rest delay without remounting the trigger', async () => {
    vi.useFakeTimers();
    const changed = vi.fn();
    const view = await render(() => <Tooltip.Provider delay={100}>
      <Tooltip.Root onOpenChange={changed}><Tooltip.Trigger>Trigger</Tooltip.Trigger></Tooltip.Root>
    </Tooltip.Provider>);
    const trigger = screen.getByText('Trigger');
    fireEvent.mouseEnter(trigger); fireEvent.mouseMove(trigger);
    await advanceTimers(99); expect(changed).not.toHaveBeenCalled();
    await advanceTimers(1);
    expect(changed).toHaveBeenCalledWith(true, expect.objectContaining({ reason: 'trigger-hover', trigger }));
    expect(screen.getByText('Trigger')).toBe(trigger);
    expect(trigger).toHaveAttribute('data-popup-open');
    view.unmount();
  });

  it('does not remount nested children when pointer state changes', async () => {
    const view = await render(() => <Tooltip.Root>
      <Tooltip.Trigger delay={0} render={props => <span {...props} />}>
        <Tooltip.Root><Tooltip.Trigger>Nested</Tooltip.Trigger></Tooltip.Root>
      </Tooltip.Trigger>
    </Tooltip.Root>);
    const nested = screen.getByText('Nested');
    fireEvent.mouseEnter(nested); fireEvent.mouseOver(nested); fireEvent.mouseMove(nested);
    await settle();
    expect(screen.getByText('Nested')).toBe(nested);
    view.unmount();
  });

  it('notifies disabled close with the latest callback', async () => {
    const before = vi.fn(); const after = vi.fn();
    const view = await renderProps((props: { disabled: boolean; changed: Tooltip.Root.Props['onOpenChange'] }) =>
      <Tooltip.Root defaultOpen disabled={props.disabled} onOpenChange={props.changed}>
        <Tooltip.Trigger>Trigger</Tooltip.Trigger>
      </Tooltip.Root>, { disabled: false, changed: before });
    await view.setProps({ disabled: true, changed: after });
    expect(before).not.toHaveBeenCalled();
    expect(after).toHaveBeenCalledWith(false, expect.objectContaining({ reason: 'disabled' }));
    expect(screen.getByText('Trigger')).not.toHaveAttribute('data-popup-open');
    view.unmount();
  });

  for (const prevention of ['default', 'handler', 'change'] as const) {
    it(`keeps native preventDefault, Base UI handler prevention and change cancellation distinct/${prevention}`, async () => {
      vi.useFakeTimers();
      const changed = vi.fn();
      const view = await render(() => <Tooltip.Root onOpenChange={(next, details) => {
        changed(next, details.reason);
        if (prevention === 'change') details.cancel();
      }}><Tooltip.Trigger onFocus={event => {
        if (prevention === 'default') event.preventDefault();
        if (prevention === 'handler') event.preventBaseUIHandler();
      }}>Trigger</Tooltip.Trigger></Tooltip.Root>);
      const trigger = screen.getByText('Trigger');
      trigger.focus();
      // jsdom queues selectionchange on native focus. Settle that zero-delay DOM
      // task explicitly; it is not a Tooltip timeout or an owned timer leak.
      await advanceTimers(0);
      if (prevention === 'handler') expect(changed).not.toHaveBeenCalled();
      else expect(changed.mock.calls).toEqual([[true, 'trigger-focus']]);
      expect(trigger.hasAttribute('data-popup-open')).toBe(prevention === 'default');
      view.unmount();
      expect(vi.getTimerCount()).toBe(0);
    });
  }

  it('runs consumer focus prevention and notifications on the same bubbling native events', async () => {
    vi.useFakeTimers();
    const events: FocusEvent[] = [];
    const order: string[] = [];
    const changed = vi.fn();
    const view = await render(() => <><Tooltip.Root onOpenChange={(next, details) => {
      order.push(next ? 'open' : 'close'); changed(next, details);
    }}><Tooltip.Trigger onFocus={event => { events.push(event); order.push('focus'); }}
      onBlur={event => { events.push(event); order.push('blur'); }}>Focus trigger</Tooltip.Trigger>
    </Tooltip.Root><button>Outside</button></>);
    screen.getByText('Focus trigger').focus();
    await advanceTimers(0);
    expect(changed).toHaveBeenCalledOnce();
    expect(changed.mock.calls[0]![1].event).toBe(events[0]);
    expect(events[0]!.type).toBe('focusin');
    expect(events[0]!.bubbles).toBe(true);
    screen.getByText('Outside').focus();
    await advanceTimers(0);
    expect(changed).toHaveBeenCalledTimes(2);
    expect(changed.mock.calls[1]![1].event).toBe(events[1]);
    expect(events[1]!.type).toBe('focusout');
    expect(order).toEqual(['focus', 'open', 'blur', 'close']);
    view.unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  for (const closeOnClick of [false, true]) {
    it(`cancels pending hover without a public close notification only when closeOnClick=${closeOnClick}`, async () => {
      vi.useFakeTimers();
      const changed = vi.fn();
      const view = await render(() => <Tooltip.Root onOpenChange={changed}>
        <Tooltip.Trigger delay={100} closeOnClick={closeOnClick}>Trigger</Tooltip.Trigger>
      </Tooltip.Root>);
      const trigger = screen.getByText('Trigger');
      fireEvent.pointerEnter(trigger, { pointerType: 'mouse' });
      fireEvent.mouseEnter(trigger); fireEvent.mouseMove(trigger);
      await advanceTimers(50); firePointer.down(trigger, { pointerType: 'mouse', timeStamp: 51 });
      await advanceTimers(50);
      expect(changed.mock.calls.map(([next]) => next)).toEqual(closeOnClick ? [] : [true]);
      expect(trigger.hasAttribute('data-popup-open')).toBe(!closeOnClick);
      view.unmount();
    });
  }

  it('honors controlled open and trigger ownership without announcing external changes', async () => {
    const handle = Tooltip.createHandle<string>(); const changed = vi.fn();
    const view = await renderProps<{ open: boolean; triggerId: string | null }>(props => <>
      <Tooltip.Trigger handle={handle} id="first" payload="First">First trigger</Tooltip.Trigger>
      <Tooltip.Trigger handle={handle} id="second" payload="Second">Second trigger</Tooltip.Trigger>
      <Tooltip.Root handle={handle} open={props.open} triggerId={props.triggerId} onOpenChange={changed}>
        {state => <output data-testid="payload">{state.payload ?? 'None'}</output>}
      </Tooltip.Root>
    </>, { open: false, triggerId: null });
    const output = screen.getByTestId('payload');
    await view.setProps({ open: true, triggerId: 'first' }); expect(output).toHaveTextContent('First');
    await view.setProps({ triggerId: 'second' });
    expect(screen.getByTestId('payload')).toBe(output); expect(output).toHaveTextContent('Second');
    expect(screen.getByText('Second trigger')).toHaveAttribute('data-popup-open');
    await view.setProps({ triggerId: null }); expect(output).toHaveTextContent('None');
    expect(changed).not.toHaveBeenCalled(); view.unmount();
  });

  it('uses accepted same-turn trigger ownership for click policy and preserves it after a canceled handoff', async () => {
    const handle = Tooltip.createHandle();
    let store!: TooltipStore;
    let cancel = false;
    function Capture() { store = useTooltipRootContext(); return null; }
    const view = await render(() => <>
      <Tooltip.Trigger handle={handle} id="first" closeOnClick={false}>First</Tooltip.Trigger>
      <Tooltip.Trigger handle={handle} id="second" closeOnClick render={props => <button {...props} id="custom-second" />}>Second</Tooltip.Trigger>
      <Tooltip.Root handle={handle} defaultOpen defaultTriggerId="first" onOpenChange={(_, details) => { if (cancel) details.cancel(); }}>
        <Capture />
      </Tooltip.Root>
    </>);
    const first = screen.getByText('First'); const second = screen.getByText('Second');
    firePointer.down(first, { pointerType: 'mouse', timeStamp: 1 });
    expect(untrack(() => store.closeOnClick)).toBe(false);
    handle.open('second');
    // No flush between the accepted request and its imperative policy read.
    expect(untrack(() => store.state.activeTriggerId)).toBe('first');
    expect(store.getCurrentTrigger?.()).toBe(second);
    expect(untrack(() => store.closeOnClick)).toBe(true);
    cancel = true; handle.open('first');
    expect(store.getCurrentTrigger?.()).toBe(second);
    expect(untrack(() => store.closeOnClick)).toBe(true);
    await settle(); expect(second).toHaveAttribute('data-popup-open');
    view.unmount();
  });
});
