import { expect, it } from 'vitest';
import { flush, untrack } from 'solid-js';
import { attribution } from 'solid-js/attribution';
import { createRenderer } from '../../../test';
import { createPopup, type PopupModel, type PopupRequestModel } from './createPopup';
import { createChangeEventDetails } from '../../internals/createBaseUIEventDetails';

it('createPopup resolves cancellation before dispatch and preserves controlled refusal', async () => {
  let model!: PopupModel<number>;
  const events: boolean[] = [];
  const view = await createRenderer().renderProps((props: { cancel: boolean }) => {
    model = createPopup<number>({ open: () => false, onOpenChange: () => (_, details) => { if (props.cancel) details.cancel(); } });
    model.state.floatingRootContext.events.on('openchange', ({ open }) => events.push(open));
    return <output>{String(model.state.open)}</output>;
  }, { cancel: true });
  model.setOpen(true, createChangeEventDetails('none'));
  flush();
  expect(events).toEqual([]);
  await view.setProps({ cancel: false });
  model.setOpen(true, createChangeEventDetails('none'));
  flush();
  expect(events).toEqual([true]);
  expect(view.getByRole('status')).toHaveTextContent('false');
});

it('createPopup cancels all accepted side effects and runs the source pre-dispatch/commit order', async () => {
  let model!: PopupRequestModel<number>;
  const order: string[] = [];
  const view = await createRenderer().renderProps((props: { cancel: boolean; commit: boolean }) => {
    model = createPopup<number>({ defaultOpen: true, onOpenChange: () => (_, details) => {
      order.push('callback'); details.preventUnmountOnClose(); if (props.cancel) details.cancel();
    }, onAcceptedChange() { order.push('before-dispatch'); }, onBeforeOpenCommit() { order.push('commit'); return props.commit; } });
    model.state.floatingRootContext.events.on('openchange', ({ open }) => order.push(`dispatch:${open}`));
    return <output>{String(model.state.open)}:{String(model.state.preventUnmountingOnClose)}</output>;
  }, { cancel: true, commit: true });
  expect(model.requestOpen(false, createChangeEventDetails('none')).accepted).toBe(false);
  model.forceUnmount(); flush();
  expect(order).toEqual(['callback']);
  expect(view.getByRole('status')).toHaveTextContent('true:false');
  await view.setProps({ cancel: false, commit: false }); order.length = 0;
  expect(model.requestOpen(false, createChangeEventDetails('none')).accepted).toBe(true); flush();
  expect(order).toEqual(['callback', 'before-dispatch', 'dispatch:false', 'commit']);
  expect(view.getByRole('status')).toHaveTextContent('true:false');
});

it('createPopup retains default-open live payload when active-trigger removal is canceled', async () => {
  let model!: PopupModel<number>;
  let requests = 0;
  const view = await createRenderer().render(() => {
    model = createPopup<number>({ defaultOpen: true, closeOnActiveTriggerUnmount: true,
      onOpenChange: () => (_, details) => { requests++; details.cancel(); } });
    return <output>{String(model.state.open)}:{String(model.state.payload)}</output>;
  });
  const trigger = document.createElement('button'); trigger.id = 'rendered';
  const remove = model.registerTrigger('first', trigger, 1); flush();
  expect(view.getByRole('status')).toHaveTextContent('true:1');
  // A same-node ID migration must retain ownership without a close request.
  remove(); const removeNext = model.registerTrigger('next', trigger, 2); flush();
  await Promise.resolve(); flush();
  expect(untrack(() => model.state.activeTriggerId)).toBe('next');
  expect(view.getByRole('status')).toHaveTextContent('true:2'); expect(requests).toBe(0);
  removeNext(); flush(); await Promise.resolve(); flush();
  expect(requests).toBe(1); expect(view.getByRole('status')).toHaveTextContent('true:2');
  expect(untrack(() => model.state.activeTriggerElement)).toBe(trigger);
});

it('createPopup separates externally selected trigger IDs from internal request ownership', async () => {
  let model!: PopupModel<number>;
  const view = await createRenderer().renderProps<{ triggerId: string | null }>((props) => {
    model = createPopup<number>({ open: () => true, triggerId: () => props.triggerId });
    return <output>{model.state.activeTriggerId ?? 'unassociated'}</output>;
  }, { triggerId: 'one' });
  const one = document.createElement('button'), two = document.createElement('button'); one.id = 'one'; two.id = 'two';
  model.registerTrigger('one', one, 1); model.registerTrigger('two', two, 2); flush();
  expect(view.getByRole('status')).toHaveTextContent('one');
  await view.setProps({ triggerId: null });
  expect(view.getByRole('status')).toHaveTextContent('unassociated');
});

it('createPopup exposes only accepted same-turn current triggers and honors controlled ownership', async () => {
  let model!: PopupRequestModel<unknown>;
  const view = await createRenderer().renderProps((props: { cancel: boolean }) => {
    model = createPopup({ onOpenChange: () => (_, details) => { if (props.cancel) details.cancel(); } });
    return <output>{model.state.activeTriggerId ?? 'none'}</output>;
  }, { cancel: false });
  const one = document.createElement('button'), two = document.createElement('button'); one.id = 'one'; two.id = 'two';
  model.registerTrigger('one', one, undefined); model.registerTrigger('two', two, undefined);
  model.setOpen(true, createChangeEventDetails('trigger-press', undefined, one)); flush();
  model.setOpen(true, createChangeEventDetails('imperative-action', undefined, two));
  expect(model.getCurrentTrigger()).toBe(two); expect(view.getByRole('status')).toHaveTextContent('one');
  flush(); await view.setProps({ cancel: true });
  model.setOpen(true, createChangeEventDetails('imperative-action', undefined, one));
  expect(model.getCurrentTrigger()).toBe(two);
});

it('createPopup allows a family to project disabled presence without acknowledging a controlled close', async () => {
  let model!: PopupModel<unknown>;
  const view = await createRenderer().renderProps((props: { enabled: boolean }) => {
    model = createPopup({ open: () => true, presenceOpen: (open) => props.enabled && open,
      onOpenChange: () => (_, details) => details.cancel() });
    return <output>{String(model.state.open)}:{String(model.state.mounted)}</output>;
  }, { enabled: true });
  model.setPopupElement(document.createElement('div')); flush();
  await view.setProps({ enabled: false }); model.setOpen(false, createChangeEventDetails('disabled')); flush();
  expect(view.getByRole('status')).toHaveTextContent('true:false');
});

it('createPopup releases rendered floating-ID overrides without erasing its generated fallback', async () => {
  let model!: PopupModel<unknown>;
  const view = await createRenderer().render(() => { model = createPopup({}); return <output>{model.state.floatingId ?? 'none'}</output>; });
  const fallback = view.getByRole('status').textContent;
  model.setFloatingId('explicit'); flush(); expect(view.getByRole('status')).toHaveTextContent('explicit');
  model.setFloatingId(''); flush(); expect(view.getByRole('status').textContent).toBe('');
  model.setFloatingId(undefined); flush(); expect(view.getByRole('status').textContent).toBe(fallback);
});

it('createPopup retains closing ownership and programmatic payload; registration cleanup is token-owned', async () => {
  let model!: PopupModel<number>;
  const view = await createRenderer().render(() => {
    model = createPopup<number>({});
    return <output>{String(model.state.open)}:{String(model.state.payload)}</output>;
  });
  const first = document.createElement('button'); first.id = 'trigger';
  const replacement = document.createElement('button'); replacement.id = 'trigger';
  const old = model.registerTrigger('trigger', first, 1);
  model.registerTrigger('trigger', replacement, 2);
  old();
  expect(model.context.triggerElements.getById('trigger')).toBe(replacement);
  model.setPayload(5);
  model.setOpen(true, createChangeEventDetails('imperative-action'));
  flush();
  expect(view.getByRole('status')).toHaveTextContent('true:5');
  expect(untrack(() => model.state.openedWithoutTrigger)).toBe(true);
  model.setOpen(false, createChangeEventDetails('none'));
  flush();
  expect(untrack(() => model.state.openedWithoutTrigger)).toBe(false);
});

it('programmatic open and close derive association policy without metadata write-back', async () => {
  const release = attribution.enable({ log: false });
  let model!: PopupRequestModel<unknown>;
  try {
    const view = await createRenderer().render(() => {
      model = createPopup({});
      return <output>{String(model.state.open)}:{String(model.state.openedWithoutTrigger)}</output>;
    });
    try {
      for (let index = 0; index < 4; index++) {
        model.setOpen(true, createChangeEventDetails('imperative-action')); flush();
        expect(view.getByRole('status')).toHaveTextContent('true:true');
        model.setOpen(false, createChangeEventDetails('none')); flush();
        expect(view.getByRole('status')).toHaveTextContent('false:false');
      }
    } finally { view.unmount(); }
  } finally { release(); }
});

it('a refused programmatic open does not retain an untriggered policy on later external opening', async () => {
  let model!: PopupRequestModel<unknown>;
  const view = await createRenderer().renderProps((props: { open: boolean }) => {
    model = createPopup({ open: () => props.open });
    return <output>{String(model.state.open)}:{String(model.state.openedWithoutTrigger)}</output>;
  }, { open: false });
  model.setOpen(true, createChangeEventDetails('imperative-action')); flush();
  expect(view.getByRole('status')).toHaveTextContent('false:false');
  await view.setProps({ open: true });
  expect(view.getByRole('status')).toHaveTextContent('true:false');
});
