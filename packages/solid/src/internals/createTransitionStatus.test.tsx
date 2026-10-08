import { expect, it, onTestFinished, vi } from 'vitest';
import { createEffect, createSignal, flush } from 'solid-js';
import { createRenderer, advanceFrame } from '../../test';
import { createTransitionStatus, type TransitionStatusResult } from './createTransitionStatus';
import { createOpenChangeComplete } from './createOpenChangeComplete';
import { AnimationFrame } from '../utils/createAnimationFrame';

it('createTransitionStatus retains closing content and invalidates deferred ending on reopen', async () => {
  vi.useFakeTimers();
  let status!: TransitionStatusResult;
  const view = await createRenderer().renderProps((props: { open: boolean }) => {
    status = createTransitionStatus(() => props.open, () => true, () => true);
    return <output>{String(status.mounted)}:{status.transitionStatus}</output>;
  }, { open: false });
  await view.setProps({ open: true });
  expect(view.getByRole('status')).toHaveTextContent('true:starting');
  await advanceFrame();
  expect(view.getByRole('status')).toHaveTextContent('true:starting');
  await advanceFrame();
  expect(view.getByRole('status')).toHaveTextContent('true:idle');
  await view.setProps({ open: false });
  expect(view.getByRole('status')).toHaveTextContent('true:idle');
  await view.setProps({ open: true });
  await advanceFrame();
  expect(view.getByRole('status')).toHaveTextContent('true:starting');
  await advanceFrame();
  expect(view.getByRole('status')).toHaveTextContent('true:idle');
  await view.setProps({ open: false });
  await advanceFrame();
  expect(view.getByRole('status')).toHaveTextContent('true:ending');
  status.setMounted(false);
  flush();
  expect(view.getByRole('status')).toHaveTextContent('false:');
});

it('createTransitionStatus does not animate initially open content', async () => {
  const view = await createRenderer().render(() => {
    const [open] = createSignal(true);
    const status = createTransitionStatus(open);
    return <output>{String(status.mounted)}:{status.transitionStatus}</output>;
  });
  expect(view.getByRole('status')).toHaveTextContent('true:');
});

it('does not notify presence consumers when a different radio selection leaves open unchanged', async () => {
  const observe = vi.fn();
  const view = await createRenderer().renderProps((props: { selection: string }) => {
    const status = createTransitionStatus(() => props.selection === 'c');
    createEffect(() => ({ mounted: status.mounted, status: status.transitionStatus }), observe);
    return <output>{String(status.mounted)}:{status.transitionStatus}</output>;
  }, { selection: 'a' });
  expect(observe).toHaveBeenCalledTimes(1);
  for (const selection of ['b', 'a', 'b', 'a']) await view.setProps({ selection });
  expect(observe).toHaveBeenCalledTimes(1);
  expect(view.getByRole('status')).toHaveTextContent('false:');
});

it('does not replace a pending entry frame when its transition inputs are equivalent', async () => {
  vi.useFakeTimers();
  const request = vi.spyOn(AnimationFrame.prototype, 'request');
  onTestFinished(() => request.mockRestore());
  const view = await createRenderer().renderProps((props: { open: boolean; unrelated: number }) => {
    const status = createTransitionStatus(() => props.open);
    return <output>{String(status.mounted)}:{status.transitionStatus}</output>;
  }, { open: false, unrelated: 0 });
  await view.setProps({ open: true });
  expect(view.getByRole('status')).toHaveTextContent('true:starting');
  expect(request).toHaveBeenCalledTimes(1);
  for (const unrelated of [1, 2, 3, 4]) await view.setProps({ unrelated });
  expect(request).toHaveBeenCalledTimes(1);
  await advanceFrame();
  expect(view.getByRole('status')).toHaveTextContent('true:starting');
  expect(request).toHaveBeenCalledTimes(2);
  for (const unrelated of [5, 6, 7, 8]) await view.setProps({ unrelated });
  expect(request).toHaveBeenCalledTimes(2);
  await advanceFrame();
  expect(view.getByRole('status')).toHaveTextContent('true:');
});

it('consumes distinct manual requests without replacing an equivalent pending frame', async () => {
  vi.useFakeTimers();
  const request = vi.spyOn(AnimationFrame.prototype, 'request');
  onTestFinished(() => request.mockRestore());
  let status!: TransitionStatusResult;
  const view = await createRenderer().renderProps((props: { open: boolean }) => {
    status = createTransitionStatus(() => props.open);
    return <output>{String(status.mounted)}:{status.transitionStatus}</output>;
  }, { open: false });
  await view.setProps({ open: true });
  for (let index = 0; index < 4; index++) { status.setMounted(true); flush(); }
  expect(request).toHaveBeenCalledTimes(1);
  await advanceFrame();
  expect(view.getByRole('status')).toHaveTextContent('true:starting');
  await advanceFrame();
  await view.setProps({ open: false });
  expect(view.getByRole('status')).toHaveTextContent('true:ending');
  status.setMounted(false); flush();
  expect(view.getByRole('status')).toHaveTextContent('false:');
  await view.setProps({ open: true });
  await advanceFrame();
  expect(view.getByRole('status')).toHaveTextContent('true:starting');
  await advanceFrame();
  await view.setProps({ open: false });
  expect(view.getByRole('status')).toHaveTextContent('true:ending');
  // A second false request is new even though its value matches the consumed
  // request: the intervening open mounted the content again.
  status.setMounted(false); flush();
  expect(view.getByRole('status')).toHaveTextContent('false:');
});

it.each([false, true])('animates initially open content only when requested (idle=%s)', async (idle) => {
  vi.useFakeTimers();
  const view = await createRenderer().render(() => {
    const status = createTransitionStatus(() => true, () => idle, () => false, true);
    return <output>{String(status.mounted)}:{status.transitionStatus}</output>;
  });
  expect(view.getByRole('status')).toHaveTextContent('true:starting');
  await advanceFrame();
  expect(view.getByRole('status')).toHaveTextContent('true:starting');
  await advanceFrame();
  expect(view.getByRole('status')).toHaveTextContent(idle ? 'true:idle' : 'true:');
});

it('disposes the pending second entry frame before it can clear starting state', async () => {
  vi.useFakeTimers();
  const view = await createRenderer().renderProps((props: { open: boolean }) => {
    const status = createTransitionStatus(() => props.open);
    return <output>{String(status.mounted)}:{status.transitionStatus}</output>;
  }, { open: false });
  await view.setProps({ open: true });
  await advanceFrame();
  const node = view.getByRole('status');
  expect(node).toHaveTextContent('true:starting');
  expect(vi.getTimerCount()).toBe(1);
  view.unmount();
  expect(vi.getTimerCount()).toBe(0);
  await advanceFrame();
  expect(node).toHaveTextContent('true:starting');
});

it('interrupts the second entry frame while deferred ending retains its single-frame contract', async () => {
  vi.useFakeTimers();
  const request = vi.spyOn(AnimationFrame.prototype, 'request');
  onTestFinished(() => request.mockRestore());
  const view = await createRenderer().renderProps((props: { open: boolean }) => {
    const status = createTransitionStatus(() => props.open, () => false, () => true);
    return <output>{String(status.mounted)}:{status.transitionStatus}</output>;
  }, { open: false });
  await view.setProps({ open: true });
  await advanceFrame();
  expect(request).toHaveBeenCalledTimes(2);
  expect(view.getByRole('status')).toHaveTextContent('true:starting');
  await view.setProps({ open: false });
  expect(request).toHaveBeenCalledTimes(3);
  expect(vi.getTimerCount()).toBe(1);
  await advanceFrame();
  expect(view.getByRole('status')).toHaveTextContent('true:ending');
  expect(vi.getTimerCount()).toBe(0);
  await view.setProps({ open: true });
  await advanceFrame();
  expect(view.getByRole('status')).toHaveTextContent('true:');
  expect(vi.getTimerCount()).toBe(0);
});

it('clears a stale ending phase on the next frame when reopened before exit completes', async () => {
  vi.useFakeTimers();
  const view = await createRenderer().renderProps((props: { open: boolean }) => {
    const status = createTransitionStatus(() => props.open);
    return <output>{String(status.mounted)}:{status.transitionStatus}</output>;
  }, { open: true });
  await view.setProps({ open: false });
  expect(view.getByRole('status')).toHaveTextContent('true:ending');
  await view.setProps({ open: true });
  await advanceFrame();
  expect(view.getByRole('status')).toHaveTextContent('true:');
});

it('createTransitionStatus honors same-turn manual mounting before cached content becomes open', async () => {
  let open!: (value: boolean) => void, status!: TransitionStatusResult;
  const view = await createRenderer().render(() => {
    const [value, setValue] = createSignal(false); open = setValue;
    status = createTransitionStatus(value);
    return <output>{String(status.mounted)}:{status.transitionStatus ?? 'none'}</output>;
  });
  status.setMounted(true); open(true); flush();
  expect(view.getByRole('status')).toHaveTextContent('true:none');
});

it('cached attachment cannot be overwritten by a stale no-animation close completion in the same flush', async () => {
  let closes = 0;
  const view = await createRenderer().render(() => {
    const [open, setOpen] = createSignal(false), [node, setNode] = createSignal<HTMLElement | null>(null);
    const status = createTransitionStatus(open);
    createEffect(node, (element) => { if (element) { setOpen(true); status.setMounted(true); } });
    createOpenChangeComplete({ enabled: () => !open(), open, ref: node, onComplete() { closes++; status.setMounted(false); } });
    return <><img alt="cached" ref={setNode} /><output>{String(status.mounted)}:{status.transitionStatus ?? 'none'}</output></>;
  });
  expect(closes).toBe(0); expect(view.getByRole('status')).toHaveTextContent('true:none');
});
