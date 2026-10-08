import { describe, expect, it, vi } from 'vitest';
import { createEffect, createSignal, flush, untrack } from 'solid-js';
import { createRenderer, advanceTimers } from '../../../test';
import { createChangeEventDetails } from '../../internals/createBaseUIEventDetails';
import { createPopoverPolicy } from './PopoverPolicy';
import type { PopupChangeEventDetails } from '../../internals/contracts/popup';

// Family-policy tests. These do not replace the real createPopup transaction suite.
describe('Popover policy (PopoverStore.ts @ 19511bb)', () => {
  const { render } = createRenderer();
  function details(reason: string, event = new MouseEvent('click', { detail: 1 })) {
    return createChangeEventDetails(reason, event, undefined, { preventUnmountOnClose: vi.fn() });
  }
  async function mount(onChange: (open: boolean, details: PopupChangeEventDetails) => void = () => {}) {
    let policy!: ReturnType<typeof createPopoverPolicy>;
    let setOpen!: (open: boolean) => void;
    const trigger = document.createElement('button');
    const registered = new Map<string, Element>();
    const view = await render(() => {
      const [open, writeOpen] = createSignal(true);
      setOpen = writeOpen;
      policy = createPopoverPolicy({
        open, getCurrentTrigger: () => registered.get('active') ?? trigger,
        onOpenChange: onChange,
      });
      return <output data-testid="state">{policy.openChangeReason ?? 'none'}:{String(policy.stickIfOpen)}:{policy.instantType ?? '-'}</output>;
    });
    const beforeChange = policy.beforeChange;
    // Explicit engine-contract fixture: callback, canceled check, then accepted policy.
    // Real dispatch ordering is asserted in PopoverRoot.test.tsx against createPopup.
    policy.beforeChange = (open, details) => {
      beforeChange(open, details);
      if (!details.isCanceled) policy.acceptedChange(open, details);
    };
    return { view, policy, setOpen, trigger, registered };
  }

  it('resolves the Close fallback before invoking the user callback', async () => {
    let reported: Element | undefined;
    const { policy, trigger } = await mount((_open, event) => { reported = event.trigger; });
    policy.beforeChange(false, details('close-press'));
    expect(reported).toBe(trigger);
  });

  it('prefers a registered active ID and preserves an explicit trigger', async () => {
    const { policy, registered } = await mount();
    const replacement = document.createElement('button');
    registered.set('active', replacement);
    const close = details('close-press');
    policy.beforeChange(false, close);
    expect(close.trigger).toBe(replacement);
    const explicit = document.createElement('button');
    const second = { ...details('close-press'), trigger: explicit };
    policy.beforeChange(false, second);
    expect(second.trigger).toBe(explicit);
  });

  it('cancellation changes neither the reason, instant style nor patient-click timer', async () => {
    const { policy, view } = await mount((_open, event) => event.cancel());
    vi.useFakeTimers();
    policy.beforeChange(true, details('trigger-hover'));
    flush();
    expect(view.getByTestId('state')).toHaveTextContent('none:true:-');
    expect(vi.getTimerCount()).toBe(0);
    view.unmount();
    vi.useRealTimers();
  });

  it('native preventDefault does not cancel the Base UI request', async () => {
    const { policy, view } = await mount();
    const event = new MouseEvent('click', { cancelable: true });
    event.preventDefault();
    policy.beforeChange(true, details('trigger-press', event));
    flush();
    expect(view.getByTestId('state')).toHaveTextContent('trigger-press:true:click');
  });

  it('invokes the current callback before publishing accepted policy state', async () => {
    const calls: string[] = [];
    let callback = () => { calls.push('old'); };
    const { policy, view } = await mount(() => callback());
    callback = () => { calls.push(untrack(() => policy.openChangeReason) ?? 'before'); };
    policy.beforeChange(true, details('trigger-press'));
    expect(calls).toEqual(['before']);
    flush();
    expect(view.getByTestId('state')).toHaveTextContent('trigger-press:true:-');
  });

  it('uses the 500ms patient-click threshold and resets it on another hover', async () => {
    const { policy, view } = await mount();
    vi.useFakeTimers();
    policy.beforeChange(true, details('trigger-hover'));
    flush();
    await advanceTimers(499);
    expect(view.getByTestId('state')).toHaveTextContent('trigger-hover:true:-');
    await advanceTimers(1);
    expect(view.getByTestId('state')).toHaveTextContent('trigger-hover:false:-');
    policy.beforeChange(true, details('trigger-hover'));
    flush();
    expect(view.getByTestId('state')).toHaveTextContent('trigger-hover:true:-');
    view.unmount();
    expect(vi.getTimerCount()).toBe(0);
    vi.useRealTimers();
  });

  it('clears pending hover work on effective close and restores policy after completion', async () => {
    const { policy, view, setOpen } = await mount();
    vi.useFakeTimers();
    policy.beforeChange(true, details('trigger-hover'));
    flush();
    setOpen(false);
    flush();
    expect(vi.getTimerCount()).toBe(0);
    policy.complete(false);
    flush();
    expect(view.getByTestId('state')).toHaveTextContent('none:true:-');
    view.unmount();
    vi.useRealTimers();
  });

  it.each([['escape-key', 'dismiss'], ['focus-out', 'focus'], ['outside-press', '-']])(
    'maps %s closing to %s without treating all dismissals as instant', async (reason, instant) => {
      const { policy, view } = await mount();
      policy.beforeChange(false, details(reason));
      flush();
      expect(view.getByTestId('state')).toHaveTextContent(`${reason}:true:${instant}`);
    },
  );

  it('publishes a coherent method on controlled close and does not resurrect it on imperative reopen', async () => {
    const frames: [boolean, string | null][] = [];
    let policy!: ReturnType<typeof createPopoverPolicy>;
    const view = await createRenderer().renderProps((props: { open: boolean }) => {
      policy = createPopoverPolicy({ open: () => props.open, getCurrentTrigger: () => null, onOpenChange() {} });
      createEffect(() => [props.open, policy.openMethod] as [boolean, string | null], frame => { frames.push(frame); });
      return <output>{policy.openMethod ?? 'none'}</output>;
    }, { open: false });
    policy.setOpenMethod('keyboard'); flush();
    expect(view.getByRole('status')).toHaveTextContent('keyboard');
    await view.setProps({ open: true });
    frames.length = 0;
    await view.setProps({ open: false });
    expect(frames).toEqual([[false, null]]);
    await view.setProps({ open: true });
    expect(view.getByRole('status')).toHaveTextContent('none');
    policy.setOpenMethod('touch'); flush();
    expect(view.getByRole('status')).toHaveTextContent('touch');
  });

  it('drops trigger-change instantly on a controlled close without waiting for a request', async () => {
    const { policy, view, setOpen } = await mount();
    policy.setInstantType('trigger-change');
    flush();
    expect(view.getByTestId('state')).toHaveTextContent('trigger-change');
    setOpen(false);
    flush();
    expect(view.getByTestId('state')).toHaveTextContent('none:true:-');
  });
});
