import { expect, it, vi } from 'vitest';
import { createSignal, untrack } from 'solid-js';
import { createRenderer, advanceFrame, flushMicrotasks } from '../../test';
import { createAnimationsFinished, type RunAnimationsFinished } from './createAnimationsFinished';

it('animation completion waits for canceled replacements and rejects an aborted queued batch', async () => {
  vi.useFakeTimers();
  const disabled = globalThis.BASE_UI_ANIMATIONS_DISABLED; globalThis.BASE_UI_ANIMATIONS_DISABLED = false;
  let reject!: () => void, resolve!: () => void, run!: RunAnimationsFinished;
  const initial = { finished: new Promise<void>((_, fail) => { reject = () => fail(new Error('canceled')); }), effect: { getTiming: () => ({ duration: 1, iterations: 1 }) }, pending: false, playState: 'running' } as unknown as Animation;
  const replacement = { finished: new Promise<void>((done) => { resolve = done; }), effect: { getTiming: () => ({ duration: 1, iterations: 1 }) }, pending: false, playState: 'running' } as unknown as Animation;
  let animations = [initial];
  const complete = vi.fn();
  const view = await createRenderer().render(() => {
    const [node, setNode] = createSignal<HTMLElement | null>(null);
    run = createAnimationsFinished(node, false, true);
    return <div ref={(element) => { element.getAnimations = () => animations; setNode(element); }} />;
  });
  try {
    const controller = new AbortController(); run(complete, controller.signal);
    await advanceFrame(); animations = [replacement]; reject(); await flushMicrotasks();
    expect(complete).not.toHaveBeenCalled();
    animations = []; resolve(); controller.abort(); await flushMicrotasks(); await flushMicrotasks();
    expect(complete).not.toHaveBeenCalled();
  } finally { view.unmount(); globalThis.BASE_UI_ANIMATIONS_DISABLED = disabled; }
});

it('disabled-animation completion invokes current callbacks untracked, even when batch is requested', async () => {
  const seen: string[] = [];
  const view = await createRenderer().renderProps((props: { label: string; enabled: boolean }) => {
    const [node, setNode] = createSignal<HTMLElement | null>(null);
    createAnimationsFinished({ element: node, enabled: () => props.enabled, batch: true, onFinished() { seen.push(props.label); } });
    return <div ref={setNode} />;
  }, { label: 'before', enabled: false });
  await view.setProps({ label: 'after', enabled: true }); expect(seen).toEqual(['after']);
});

it('default animation completions observe earlier staged reopening before a later close callback', async () => {
  vi.useFakeTimers();
  const disabled = globalThis.BASE_UI_ANIMATIONS_DISABLED; globalThis.BASE_UI_ANIMATIONS_DISABLED = false;
  let firstFinish!: () => void, secondFinish!: () => void, firstRun!: RunAnimationsFinished, secondRun!: RunAnimationsFinished, open!: () => boolean, reopen!: (value: boolean) => void;
  const make = (finished: Promise<void>) => ({ finished, effect: { getTiming: () => ({ duration: 1, iterations: 1 }) }, pending: false, playState: 'running' }) as unknown as Animation;
  const first = make(new Promise<void>((resolve) => { firstFinish = resolve; })), second = make(new Promise<void>((resolve) => { secondFinish = resolve; }));
  const secondDelivered = vi.fn(), secondUnmount = vi.fn();
  let complete!: () => void;
  const delivered = new Promise<void>((resolve) => { complete = resolve; });
  const view = await createRenderer().render(() => {
    const [isOpen, setOpen] = createSignal(false); open = isOpen; reopen = setOpen;
    const [one, setOne] = createSignal<HTMLElement | null>(null), [two, setTwo] = createSignal<HTMLElement | null>(null);
    firstRun = createAnimationsFinished(one); secondRun = createAnimationsFinished(two);
    return <><div ref={(node) => { node.getAnimations = () => [first]; setOne(node); }} /><div ref={(node) => { node.getAnimations = () => [second]; setTwo(node); }} /><output>{String(isOpen())}</output></>;
  });
  try {
    firstRun(() => reopen(true));
    secondRun(() => { secondDelivered(); if (!untrack(open)) secondUnmount(); complete(); });
    await advanceFrame(); firstFinish(); secondFinish();
    await delivered; expect(secondDelivered).toHaveBeenCalledOnce();
    expect(view.getByRole('status')).toHaveTextContent('true'); expect(secondUnmount).not.toHaveBeenCalled();
  } finally { view.unmount(); globalThis.BASE_UI_ANIMATIONS_DISABLED = disabled; }
});
