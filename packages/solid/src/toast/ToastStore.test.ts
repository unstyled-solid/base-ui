import { afterEach, describe, expect, it, vi } from 'vitest';
import { createRoot, flush, onCleanup, untrack } from 'solid-js';
import { ToastStore, selectors } from './store';
import type { ToastObject } from './useToastManager';

// Source: packages/react/src/toast/store.test.ts at 19511bb.
// Immediate transaction assertions intentionally use state; published UI assertions use snapshot.
const disposers: (() => void)[] = [];
function createStore(toasts: ToastObject[] = [], timeout = 0) {
  return createRoot((dispose) => {
    disposers.push(dispose);
    const store = new ToastStore({ toasts: toasts.map((toast) => ({ updateKey: 0, ...toast })), timeout,
      limit: 3, hovering: false, focused: false, isWindowFocused: true, viewport: null, prevFocusElement: null });
    onCleanup(store.dispose);
    return store;
  });
}
afterEach(() => { disposers.splice(0).forEach((dispose) => dispose()); vi.useRealTimers(); });
const toast = (store: ToastStore, id = 'a') => selectors.toast(store.state, id);
function expectMetadata(store: ToastStore) {
  let visible = 0, offset = 0;
  store.state.toasts.forEach((value, index) => {
    expect(selectors.toast(store.state, value.id)).toBe(value);
    expect(selectors.toastIndex(store.state, value.id)).toBe(index);
    expect(selectors.toastVisibleIndex(store.state, value.id)).toBe(value.transitionStatus === 'ending' ? -1 : visible++);
    expect(selectors.toastOffsetY(store.state, value.id)).toBe(offset);
    offset += value.height || 0;
  });
}
describe('ToastStore', () => {
  it('keeps toast metadata synchronized after mutations', () => {
    const store = createStore([{ id: 'newest', height: 30 }, { id: 'middle', height: 40 }, { id: 'oldest', height: 50 }]);
    expectMetadata(store);
    store.updateToastInternal('middle', { height: 45 }); expectMetadata(store);
    store.closeToast('middle'); expectMetadata(store);
    expect(toast(store, 'middle')?.transitionStatus).toBe('ending');
    store.removeToast('middle', true); expectMetadata(store);
    store.addToast({ id: 'front', title: 'Front', timeout: 0 }); expectMetadata(store);
  });
  it('ignores height recalculations while a toast is transitioning out', () => {
    const store = createStore([{ id: 'a', height: 40 }]);
    store.closeToast('a'); expect(toast(store)?.transitionStatus).toBe('ending');
    store.updateToastInternal('a', { height: 80, transitionStatus: undefined });
    expect(toast(store)).toMatchObject({ transitionStatus: 'ending', height: 0 });
    store.removeToast('a', true); expect(toast(store)).toBeUndefined();
  });
  it('ignores mutations that target an unknown toast', () => {
    const store = createStore([{ id: 'a' }]), previous = store.state.toasts;
    store.removeToast('missing'); store.closeToast('missing'); store.updateToast('missing', { title: 'nope' });
    expect(store.state.toasts).toBe(previous);
    expect(toast(store)?.transitionStatus).toBeUndefined();
  });
  it('replaces custom data wholesale when updating a toast', () => {
    const store = createStore([{ id: 'a', data: { name: 'Draft', count: 1 } }]), data = { count: 2 };
    store.updateToast('a', { data }); expect(toast(store)?.data).toBe(data);
    store.updateToast('a', { title: 'Saved' }); expect(toast(store)?.data).toBe(data);
    store.updateToast('a', { data: undefined }); expect(toast(store)?.data).toBeUndefined();
  });
  it('derives the update from the current toast when given a function', () => {
    const store = createStore([{ id: 'a', title: 'Draft', data: { name: 'Draft', count: 1 } }]);
    store.updateToast('a', (previous) => ({ title: `${previous.title} (saved)`, data: { ...previous.data, count: 2 } }));
    expect(toast(store)).toMatchObject({ title: 'Draft (saved)', data: { name: 'Draft', count: 2 }, updateKey: 1 });
  });
  it('passes a toast without custom data to the updater', () => {
    const store = createStore([{ id: 'a' }]);
    const updater = vi.fn((previous: ToastObject) => { expect(previous.data).toBeUndefined(); return { data: { name: 'Draft' } }; });
    store.updateToast('a', updater); expect(updater).toHaveBeenCalledTimes(1);
    expect(updater.mock.calls[0]?.[0].id).toBe('a');
    expect(toast(store)?.data).toEqual({ name: 'Draft' });
  });
  it('stores a function passed as custom data instead of calling it', () => {
    const store = createStore([{ id: 'a', data: () => 'first' }]), data = vi.fn(() => 'second');
    store.updateToast('a', { data }); expect(toast(store)?.data).toBe(data); expect(data).not.toHaveBeenCalled();
  });
  it('does not call the updater for a missing or ending toast', () => {
    const store = createStore([{ id: 'a', data: { name: 'Draft' } }]), updater = vi.fn(() => ({}));
    store.closeToast('a'); expect(toast(store)?.transitionStatus).toBe('ending');
    store.updateToast('a', updater); store.updateToast('missing', updater);
    expect(updater).not.toHaveBeenCalled(); expect(toast(store)?.data).toEqual({ name: 'Draft' });
  });
  it('keeps a toast added from inside an updater', () => {
    const store = createStore([{ id: 'a', data: { count: 1 } }]);
    store.updateToast('a', () => { store.addToast({ id: 'b' }); return { data: { count: 2 } }; });
    expect(store.state.toasts.map((value) => value.id)).toEqual(['b', 'a']);
    expect(toast(store)?.data).toEqual({ count: 2 }); expectMetadata(store);
  });
  it('keeps a toast closed from inside its updater closed', () => {
    const store = createStore([{ id: 'a', data: { count: 1 } }]);
    store.updateToast('a', () => { store.closeToast('a'); return { data: { count: 2 } }; });
    expect(toast(store)).toMatchObject({ transitionStatus: 'ending', data: { count: 1 } });
  });
  it('stores a function as the value when re-adding a toast under an existing id', () => {
    const store = createStore(), value = vi.fn(() => 'second');
    store.addToast({ id: 'a', data: () => 'first' }); store.addToast({ id: 'a', data: value });
    expect(toast(store)?.data).toBe(value); expect(value).not.toHaveBeenCalled();
  });
  it('replaces custom data when re-adding a toast under an existing id', () => {
    const store = createStore();
    store.addToast({ id: 'a', data: { status: 'error', errorCode: 42 } }); store.addToast({ id: 'a', data: { status: 'ok' } });
    expect(toast(store)?.data).toEqual({ status: 'ok' });
    store.addToast({ id: 'a', title: 'Still uploading' }); expect(toast(store)?.data).toEqual({ status: 'ok' });
  });
  it('stores a function passed as custom data on a promise toast', async () => {
    const store = createStore(), loading = () => 'loading', success = () => 'done';
    const pending = store.promiseToast(Promise.resolve('done'), { loading: { title: 'Saving', data: loading }, success: { title: 'Saved', data: success }, error: 'Failed' });
    expect(store.state.toasts[0].data).toBe(loading); await pending; expect(store.state.toasts[0].data).toBe(success);
  });
  it('does not invoke onRemove for a toast that is no longer in the store', () => {
    const onRemove = vi.fn(), store = createStore([{ id: 'a', onRemove }]);
    store.removeToast('a'); expect(onRemove).toHaveBeenCalledTimes(1);
    store.removeToast('a'); expect(onRemove).toHaveBeenCalledTimes(1);
  });
  it('recomputes limited flags when the limit changes', () => {
    const store = createStore([{ id: 'c' }, { id: 'b' }, { id: 'a' }]);
    store.syncProviderProps(0, 1); expect(store.state.toasts.map((value) => value.limited)).toEqual([false, true, true]);
    store.syncProviderProps(0, 3); expect(store.state.toasts.map((value) => value.limited)).toEqual([false, false, false]);
  });
  for (const scenario of ['last toast', 'all toasts', 'last active with ending toasts', 'last timed with untimed toasts', 'last timed becomes untimed'] as const) {
    it(`re-pauses timers after ${scenario}`, () => {
      vi.useFakeTimers(); const store = createStore();
      if (scenario === 'last timed with untimed toasts') store.addToast({ id: 'loading', type: 'loading' });
      if (scenario === 'all toasts' || scenario === 'last active with ending toasts') store.addToast({ id: 'b', timeout: 100 });
      store.addToast({ id: 'a', timeout: 100 }); store.pauseTimers();
      if (scenario === 'all toasts') store.closeToast();
      else if (scenario === 'last timed becomes untimed') store.updateToastInternal('a', { timeout: 0 });
      else { store.closeToast('a'); if (scenario === 'last active with ending toasts') store.closeToast('b'); }
      store.addToast({ id: 'c', timeout: 100 }); store.pauseTimers(); vi.advanceTimersByTime(200);
      expect(toast(store, 'c')?.transitionStatus).not.toBe('ending');
    });
  }
  it('keeps a rescheduled timer paused while expanded, and runs it once collapsed', () => {
    vi.useFakeTimers(); const store = createStore(); store.addToast({ id: 'a', timeout: 100 });
    store.set('hovering', true); store.pauseTimers(); store.updateToast('a', { timeout: 100 });
    vi.advanceTimersByTime(200); expect(toast(store)?.transitionStatus).not.toBe('ending');
    store.set('hovering', false); store.resumeTimers(); vi.advanceTimersByTime(100); expect(toast(store)?.transitionStatus).toBe('ending');
  });
  it('does not extend the remaining time across repeated pause/resume cycles', () => {
    vi.useFakeTimers(); const store = createStore(); store.addToast({ id: 'a', timeout: 5000 });
    for (let index = 0; index < 2; index++) { vi.advanceTimersByTime(1000); store.pauseTimers(); vi.advanceTimersByTime(1000); store.resumeTimers(); }
    vi.advanceTimersByTime(2999); expect(toast(store)?.transitionStatus).not.toBe('ending');
    vi.advanceTimersByTime(2); expect(toast(store)?.transitionStatus).toBe('ending');
  });
  it('restarts the full delay when the clock jumped past the timeout before pausing', () => {
    vi.useFakeTimers(); const store = createStore(); store.addToast({ id: 'a', timeout: 5000 });
    vi.setSystemTime(Date.now() + 60000); store.pauseTimers(); store.resumeTimers();
    vi.advanceTimersByTime(4999); expect(toast(store)?.transitionStatus).not.toBe('ending');
    vi.advanceTimersByTime(1); expect(toast(store)?.transitionStatus).toBe('ending');
  });
  it('accumulates active time across hover cycles so the toast still dismisses', () => {
    vi.useFakeTimers(); const store = createStore(); store.addToast({ id: 'a', timeout: 100 });
    for (let index = 0; index < 2; index++) { vi.advanceTimersByTime(40); store.pauseTimers(); expect(toast(store)?.transitionStatus).not.toBe('ending'); store.resumeTimers(); }
    vi.advanceTimersByTime(40); expect(toast(store)?.transitionStatus).toBe('ending');
  });
  it('publishes same-turn transactions through the native staged snapshot', () => {
    const store = createStore(); store.addToast({ id: 'a' }); store.addToast({ id: 'b' });
    store.updateToast('a', { title: 'updated' }); store.closeToast('b');
    expect(untrack(store.snapshot).toasts).toHaveLength(0);
    flush(); expect(untrack(store.snapshot).toasts).toEqual(store.state.toasts);
    expect(toast(store)?.title).toBe('updated');
  });
  it('retains replacement identity and exactly-once callbacks during reentrant removal', () => {
    const store = createStore(); const onRemove = vi.fn(() => { store.removeToast('a'); store.addToast({ id: 'b' }); });
    store.addToast({ id: 'a', onRemove }); store.removeToast('a');
    expect(onRemove).toHaveBeenCalledTimes(1); expect(store.state.toasts.map((value) => value.id)).toEqual(['b']);
  });
  it('removes the current incarnation even when onRemove updates its object', () => {
    const store = createStore();
    const onRemove = vi.fn(() => {
      store.updateToast('a', { title: 'Changed during removal' });
      store.removeToast('a');
      store.addToast({ id: 'b' });
    });
    store.addToast({ id: 'a', onRemove });
    store.removeToast('a');
    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(store.state.toasts.map((value) => value.id)).toEqual(['b']);
    expectMetadata(store);
  });
  it('does not remove an ending-ID replacement added inside onRemove', () => {
    const store = createStore();
    const replacementRemoved = vi.fn();
    const onRemove = vi.fn(() => store.addToast({ id: 'a', title: 'Replacement', onRemove: replacementRemoved }));
    store.addToast({ id: 'a', onRemove }); store.closeToast('a'); store.removeToast('a');
    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(store.state.toasts).toHaveLength(1);
    expect(toast(store)).toMatchObject({ title: 'Replacement', transitionStatus: 'starting', updateKey: 0 });
    store.closeToast('a'); store.removeToast('a');
    expect(replacementRemoved).toHaveBeenCalledTimes(1);
  });
  it('clears a running timer when a timeout update becomes NaN', () => {
    vi.useFakeTimers(); const store = createStore([], 100);
    store.addToast({ id: 'a' }); store.updateToast('a', { timeout: Number.NaN });
    expect(vi.getTimerCount()).toBe(0);
    vi.advanceTimersByTime(1000); expect(toast(store)?.transitionStatus).not.toBe('ending');
  });
});
