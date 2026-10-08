import { createRoot, flush, onSettled } from 'solid-js';
import { describe, it, expect, vi } from 'vitest';
import { createRenderer } from '../../test/createRenderer';
import { createTimeout } from './createTimeout';
import { createInterval } from './createInterval';
import { createIdleCallback, IdleCallback } from './createIdleCallback';
import { createAnimationFrame, AnimationFrame, resetAnimationFrameScheduler } from './createAnimationFrame';
import { createTimeoutManager } from '../internals/TimeoutManager';
import { createStableCallback } from './createStableCallback';

describe('Lifecycle resources', () => {
  const { renderProps } = createRenderer();
  it('restarts timers, clears before invoking, repeats intervals and cancels all owned work', () => {
    vi.useFakeTimers();
    // Exercise idle fallback deterministically even when the browser supplies
    // native requestIdleCallback (which Vitest does not fake by default).
    vi.stubGlobal('requestIdleCallback', undefined);
    const first = vi.fn(); const second = vi.fn(); const intervalTick = vi.fn();
    const dispose = createRoot((dispose) => {
      const timeout = createTimeout(); const interval = createInterval();
      const idle = createIdleCallback(); const frame = createAnimationFrame();
      const manager = createTimeoutManager();
      timeout.start(10, first);
      timeout.start(20, () => { expect(timeout.isStarted()).toBe(false); second(); });
      expect(timeout.isStarted()).toBe(true);
      interval.start(5, intervalTick);
      vi.advanceTimersByTime(20);
      expect(first).not.toHaveBeenCalled(); expect(second).toHaveBeenCalledOnce();
      expect(intervalTick).toHaveBeenCalledTimes(4);
      timeout.start(100, first); idle.start(first); frame.request(first); manager.start('a', 50, first);
      return dispose;
    });
    // No settle/flush: setup-owned disposal must already be installed.
    dispose();
    expect(vi.getTimerCount()).toBe(0);
    vi.runAllTimers(); expect(first).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });
  it('uses the current callback without recreating the interval', () => {
    vi.useFakeTimers();
    const first = vi.fn(); const second = vi.fn();
    let handler = first;
    const dispose = createRoot((dispose) => {
      const interval = createInterval();
      const callback = createStableCallback(() => handler);
      onSettled(() => { interval.start(100, callback); return interval.clear; });
      return dispose;
    });
    flush(); vi.advanceTimersByTime(100); handler = second;
    vi.advanceTimersByTime(100); dispose();
    expect(first).toHaveBeenCalledOnce(); expect(second).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0); vi.useRealTimers();
  });
  it('idle fallback replaces and clears callbacks and native cancellation uses its original source', () => {
    vi.useFakeTimers();
    vi.stubGlobal('requestIdleCallback', undefined);
    const idle = IdleCallback.create(); const first = vi.fn(); const second = vi.fn();
    idle.start(first); idle.start(second); vi.runOnlyPendingTimers();
    expect(first).not.toHaveBeenCalled(); expect(second).toHaveBeenCalledOnce();
    idle.start(first); idle.clear(); expect(vi.getTimerCount()).toBe(0);
    const cancel = vi.fn(); const laterCancel = vi.fn();
    vi.stubGlobal('requestIdleCallback', vi.fn(() => 0)); vi.stubGlobal('cancelIdleCallback', cancel);
    idle.start(first); vi.stubGlobal('cancelIdleCallback', laterCancel); idle.clear();
    expect(cancel).toHaveBeenCalledWith(0); expect(laterCancel).not.toHaveBeenCalled();
    vi.unstubAllGlobals(); vi.useRealTimers();
  });
  it('frame batching, duplicate cancellation, reset and nested requests preserve order', () => {
    vi.useFakeTimers(); resetAnimationFrameScheduler();
    const calls: string[] = [];
    const id = AnimationFrame.request(() => calls.push('cancelled'));
    AnimationFrame.cancel(id); AnimationFrame.cancel(id);
    AnimationFrame.request(() => { calls.push('a'); AnimationFrame.request(() => calls.push('next')); });
    AnimationFrame.request(() => calls.push('b'));
    vi.advanceTimersToNextFrame(); expect(calls).toEqual(['a', 'b']);
    vi.advanceTimersToNextFrame(); expect(calls).toEqual(['a', 'b', 'next']);
    const old = AnimationFrame.request(() => calls.push('old'));
    resetAnimationFrameScheduler();
    AnimationFrame.request(() => calls.push('new')); AnimationFrame.cancel(old);
    vi.advanceTimersToNextFrame(); expect(calls.at(-1)).toBe('new');
    expect(vi.getTimerCount()).toBe(0); vi.useRealTimers();
  });
  it('stable callback reads the committed live handler and supports undefined and arguments', async () => {
    const a = vi.fn((value: number) => value + 1); const b = vi.fn((value: number) => value + 2);
    let call!: (value: number) => number | undefined;
    const view = await renderProps((props: { handler: typeof a | undefined }) => {
      call = createStableCallback(() => props.handler); return <span />;
    }, { handler: a });
    const identity = call;
    expect(call(3)).toBe(4);
    await view.setProps({ handler: b }); expect(call).toBe(identity); expect(call(3)).toBe(5);
    await view.setProps({ handler: undefined }); expect(call(3)).toBeUndefined();
    expect(a).toHaveBeenCalledOnce(); expect(b).toHaveBeenCalledOnce();
    flush();
  });
  it('disposal from an earlier frame callback cancels an owned callback already in the batch', () => {
    vi.useFakeTimers();
    const callback = vi.fn(); let dispose!: () => void;
    AnimationFrame.request(() => dispose());
    dispose = createRoot((dispose) => { createAnimationFrame().request(callback); return dispose; });
    vi.advanceTimersToNextFrame();
    expect(callback).not.toHaveBeenCalled(); expect(vi.getTimerCount()).toBe(0);
    vi.useRealTimers();
  });
});
