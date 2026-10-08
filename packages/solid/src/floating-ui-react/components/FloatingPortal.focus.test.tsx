import { expect, it, vi } from 'vitest';
import { createEffect, createSignal, OBSERVE, untrack } from 'solid-js';
import { attribution } from 'solid-js/attribution';
import { createRenderer, flushMicrotasks, advanceFrame, advanceTimers } from '../../../test';
import { createControlled } from '../../utils/createControlled';
import { createChangeEventDetails } from '../../internals/createBaseUIEventDetails';
import { FloatingPortal, usePortalContext } from './FloatingPortal';
import { FloatingFocusManager } from './FloatingFocusManager';
import { createFloatingRoot } from './createFloatingRoot';
import { Popover } from '../../popover';
import type { PortalContext, PortalFocusState } from '../../internals/contracts/portal';

it('portal focus policy and uncontrolled open state settle together without an effect relay', async () => {
  vi.useFakeTimers();
  const release = attribution.enable({ log: false });
  const relays: string[] = [];
  const unsubscribe = OBSERVE!.diagnostics.subscribe(event => {
    if (event.code === 'EFFECT_RELAY_TEAR') relays.push(event.message);
  });
  const observations: { open: boolean; portalOpen: boolean | undefined }[] = [];
  let change!: (open: boolean) => void;
  let trigger!: HTMLButtonElement;
  try {
    const view = await createRenderer().render(() => {
      const controlled = createControlled({ value: () => undefined, defaultValue: false, name: 'FocusRelay' });
      const [floating, setFloating] = createSignal<HTMLElement | null>(null);
      const [reference, setReference] = createSignal<Element | null>(null);
      const root = createFloatingRoot({ state: {
        get open() { return controlled.value()!; }, transitionStatus: undefined,
        get floatingElement() { return floating(); }, get domReferenceElement() { return reference(); },
        get referenceElement() { return reference(); }, positionReference: null, floatingId: 'focus-relay',
      }, onOpenChange(open, details) { controlled.request(open, details); } });
      change = open => root.setOpen(open, createChangeEventDetails('none'));
      function Observe() {
        const portal = usePortalContext()!;
        createEffect(() => ({ open: root.state.open, portalOpen: portal.focusState?.open }),
          state => { observations.push(state); });
        return null;
      }
      return <><button ref={node => { trigger = node; setReference(node); }}>Trigger</button>
        <FloatingPortal><FloatingFocusManager context={root} modal={false} initialFocus={false}>
          <div role="dialog" ref={setFloating}><button>Content</button></div>
        </FloatingFocusManager><Observe /></FloatingPortal></>;
    });
    try {
      trigger.focus();
      observations.length = 0;
      for (const open of [true, false, true, false]) {
        change(open);
        await flushMicrotasks(); await advanceTimers(0); await advanceFrame();
        expect(document.querySelectorAll('[data-type="outside"]')).toHaveLength(open ? 2 : 0);
        if (open) view.getByRole('button', { name: 'Content' }).focus();
        else expect(trigger).toHaveFocus();
      }
      expect(observations).toEqual([true, false, true, false].map(open => ({ open, portalOpen: open })));
      expect(relays).toEqual([]);
    } finally { view.unmount(); await advanceTimers(0); await advanceFrame(); }
  } finally { unsubscribe(); release(); }
});

it('the notifications popup keeps its portal guards and focus ownership across click reopening', async () => {
  const view = await createRenderer().render(() => <Popover.Root>
    <Popover.Trigger>Notifications</Popover.Trigger>
    <Popover.Portal keepMounted><Popover.Positioner><Popover.Popup>
      <Popover.Title>Notifications</Popover.Title>
      <Popover.Description>You are all caught up. Good job!</Popover.Description>
    </Popover.Popup></Popover.Positioner></Popover.Portal>
  </Popover.Root>);
  try {
    const trigger = view.getByRole('button', { name: 'Notifications' });
    for (let index = 0; index < 3; index++) {
      await view.user.click(trigger);
      const popup = view.getByRole('dialog');
      await vi.waitFor(() => expect(popup).toHaveFocus());
      expect(document.querySelectorAll('[data-type="outside"]')).toHaveLength(2);
      await view.user.keyboard('{Escape}');
      await vi.waitFor(() => expect(trigger).toHaveFocus());
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      expect(document.querySelectorAll('[data-type="outside"]')).toHaveLength(0);
    }
  } finally { view.unmount(); }
});

it('portal registration tracks disabled, modal and reference policy and releases its owner on removal', async () => {
  let portal!: PortalContext;
  const one = document.createElement('button'), two = document.createElement('button');
  const view = await createRenderer().renderProps((props: { present: boolean; disabled: boolean; modal: boolean; close: boolean; reference: Element }) => {
    const root = createFloatingRoot({ state: { open: true, transitionStatus: undefined,
      get domReferenceElement() { return props.reference; }, get referenceElement() { return props.reference; },
      floatingElement: null, positionReference: null, floatingId: 'policy' } });
    function Probe() { portal = usePortalContext()!; return null; }
    return <FloatingPortal><Probe />{props.present && <FloatingFocusManager context={root}
      disabled={props.disabled} modal={props.modal} closeOnFocusOut={props.close} />}</FloatingPortal>;
  }, { present: true, disabled: false, modal: false, close: true, reference: one });
  const state = () => untrack(() => portal.focusState);
  const guards = () => document.querySelectorAll('[data-type="outside"]').length;
  expect(state()).toMatchObject({ open: true, modal: false, domReference: one, closeOnFocusOut: true });
  expect(guards()).toBe(2);
  await view.setProps({ reference: two, close: false });
  expect(state()).toMatchObject({ domReference: two, closeOnFocusOut: false });
  await view.setProps({ modal: true });
  expect(state()?.modal).toBe(true); expect(guards()).toBe(0);
  await view.setProps({ disabled: true });
  expect(state()).toBeNull();
  await view.setProps({ disabled: false, modal: false });
  expect(guards()).toBe(2);
  await view.setProps({ present: false });
  expect(state()).toBeNull(); expect(guards()).toBe(0);
  await view.setProps({ present: true });
  expect(state()).toMatchObject({ domReference: two, closeOnFocusOut: false });
  expect(guards()).toBe(2);
  view.unmount();
});

it('stale registration cleanup cannot remove a newer manager even before staged writes commit', async () => {
  let portal!: PortalContext;
  function Probe() { portal = usePortalContext()!; return null; }
  const view = await createRenderer().render(() => <FloatingPortal><Probe /></FloatingPortal>);
  const policy: PortalFocusState = { open: false, modal: false, domReference: null, closeOnFocusOut: true, onOpenChange() {} };
  const releaseFirst = portal.registerFocusManagerState(() => policy);
  const newer = { ...policy, modal: true };
  const releaseSecond = portal.registerFocusManagerState(() => newer);
  releaseFirst();
  await flushMicrotasks();
  expect(untrack(() => portal.focusState)).toBe(newer);
  releaseSecond(); await flushMicrotasks();
  expect(untrack(() => portal.focusState)).toBeNull();
  view.unmount();
});
