import { describe, it, expect, vi, afterEach } from 'vitest';
import { createEffect, createMemo, createSignal, flush, Loading, untrack } from 'solid-js';
import { createRenderer, fireEvent, flushMicrotasks } from '../../test';
import { ToastProvider } from './provider/ToastProvider';
import { useToastProviderContext } from './provider/ToastProviderContext';
import { useToastManager, type UseToastManagerReturnValue } from './useToastManager';
import { createToastManager } from './createToastManager';
import type { ToastStore } from './store';

// Sources: createToastManager.test.tsx, useToastManager.test.tsx, provider/ToastProvider.test.tsx.
const { render, renderProps } = createRenderer();
afterEach(() => vi.useRealTimers());
async function setup(external: boolean, timeout = 5000) {
  let local!: UseToastManagerReturnValue, store!: ToastStore;
  const global = createToastManager();
  function Probe() { local = useToastManager(); store = useToastProviderContext(); return <output>{local.toasts.length}</output>; }
  const view = await render(() => <ToastProvider timeout={timeout} toastManager={external ? global : undefined}><Probe /></ToastProvider>);
  return { view, manager: external ? global : local, store };
}
for (const external of [false, true]) describe(`Toast manager ${external ? 'external' : 'provider'}`, () => {
  it('adds, returns IDs, preserves order, upserts in place and increments updateKey', async () => {
    const { manager, store } = await setup(external, 0);
    const id = manager.add({ title: 'first' }); expect(id).toMatch(/^toast-/);
    manager.add({ id: 'second', title: 'second' }); manager.add({ id, title: 'updated', transitionStatus: 'ending' });
    expect(store.state.toasts.map((toast) => toast.id)).toEqual(['second', id]);
    expect(store.state.toasts[1]).toMatchObject({ title: 'updated', transitionStatus: 'starting', updateKey: 1 });
    flush(); expect(untrack(() => store.snapshot().toasts)).toEqual(store.state.toasts);
  });
  it('replaces a closing toast without onRemove, then removes the replacement once', async () => {
    const { manager, store } = await setup(external, 0); const onClose = vi.fn(), onRemove = vi.fn();
    manager.add({ id: 'save', onClose, onRemove }); manager.close('save'); manager.close('save');
    manager.add({ id: 'save', title: 'Saved', onRemove }); expect(onRemove).not.toHaveBeenCalled();
    expect(store.state.toasts).toHaveLength(1); expect(store.state.toasts[0].updateKey).toBe(0);
    manager.close('save'); store.removeToast('save'); store.removeToast('save');
    expect(onClose).toHaveBeenCalledTimes(1); expect(onRemove).toHaveBeenCalledTimes(1);
  });
  it('closes all toasts and does not call onClose for already ending toasts', async () => {
    const { manager, store } = await setup(external, 0); const callback = vi.fn();
    for (const id of ['a', 'b', 'c']) manager.add({ id, onClose: callback });
    manager.close('a'); manager.close(); manager.close();
    expect(callback).toHaveBeenCalledTimes(3); expect(store.state.toasts.every((toast) => toast.transitionStatus === 'ending')).toBe(true);
  });
  it('onClose can reenter close-all without double-calling the closing toast', async () => {
    const { manager } = await setup(external, 0);
    const first = vi.fn(() => manager.close()), second = vi.fn();
    manager.add({ id: 'first', onClose: first }); manager.add({ id: 'second', onClose: second }); manager.close('first');
    expect(first).toHaveBeenCalledTimes(1); expect(second).toHaveBeenCalledTimes(1);
  });
  it('derives updates from the current toast and retains reentrant additions', async () => {
    const { manager, store } = await setup(external, 0);
    manager.add({ id: 'a', data: { count: 1 } });
    manager.update<{ count: number }>('a', (previous) => { manager.add({ id: 'b' }); return { data: { count: previous.data!.count + 1 } }; });
    expect(store.state.toasts[1].data).toEqual({ count: 2 }); expect(store.state.toasts[1].updateKey).toBe(1);
  });
  for (const initial of [0, 100, undefined]) it(`resets a same-value timeout after initial timeout=${initial}`, async () => {
    vi.useFakeTimers(); const { manager, store, view } = await setup(external);
    manager.add({ id: 'a', timeout: initial }); manager.update('a', { timeout: 100 });
    vi.advanceTimersByTime(90); manager.update('a', { timeout: 100 }); manager.update('a', { title: 'same turn' });
    vi.advanceTimersByTime(99); expect(store.state.toasts[0].transitionStatus).not.toBe('ending');
    vi.advanceTimersByTime(1); expect(store.state.toasts[0].transitionStatus).toBe('ending'); view.unmount();
  });
  it('suppresses loading timers and schedules a timer on non-loading update', async () => {
    vi.useFakeTimers(); const { manager, store, view } = await setup(external);
    manager.add({ id: 'a', type: 'loading', timeout: 100 }); vi.advanceTimersByTime(10000);
    expect(store.state.toasts[0].transitionStatus).not.toBe('ending');
    manager.update('a', { type: 'success' }); vi.advanceTimersByTime(100);
    expect(store.state.toasts[0].transitionStatus).toBe('ending'); view.unmount();
  });
  for (const outcome of ['success', 'error'] as const) for (const form of ['text', 'options', 'function-text', 'function-options'] as const) {
    it(`promise ${outcome}: ${form}, typed result/error and timeout`, async () => {
      vi.useFakeTimers(); const { manager, store, view } = await setup(external, 100);
      const error = new Error('failed');
      const option = form === 'text' ? 'done' : form === 'options' ? { title: 'done', timeout: 20 }
        : form === 'function-text' ? (value: unknown) => { expect(value).toBe(outcome === 'success' ? 42 : error); return 'done'; }
          : (value: unknown) => { expect(value).toBe(outcome === 'success' ? 42 : error); return { title: 'done', timeout: 20 }; };
      const pending = manager.promise(outcome === 'success' ? Promise.resolve(42) : Promise.reject(error), {
        loading: { description: 'loading', timeout: 0 }, success: outcome === 'success' ? option : 'unused', error: outcome === 'error' ? option : 'unused',
      });
      expect(store.state.toasts[0]).toMatchObject({ type: 'loading', description: 'loading' });
      if (outcome === 'success') await expect(pending).resolves.toBe(42); else await expect(pending).rejects.toBe(error);
      expect(store.state.toasts[0].type).toBe(outcome);
      const options = form.endsWith('options');
      expect(store.state.toasts[0][options ? 'title' : 'description']).toBe('done');
      const delay = options ? 20 : 100;
      vi.advanceTimersByTime(delay - 1); expect(store.state.toasts[0].transitionStatus).not.toBe('ending');
      vi.advanceTimersByTime(1); expect(store.state.toasts[0].transitionStatus).toBe('ending'); view.unmount();
    });
  }
  it('does not reopen a dismissed promise toast when it resolves', async () => {
    const { manager, store } = await setup(external, 0);
    let resolve!: (value: string) => void;
    const promise = manager.promise(new Promise<string>((done) => { resolve = done; }), { loading: 'loading', success: 'success', error: 'error' });
    manager.close(); resolve('result'); await expect(promise).resolves.toBe('result');
    expect(store.state.toasts[0]).toMatchObject({ transitionStatus: 'ending', type: 'loading' });
  });
  it('promise timeout zero is retained and upserting a limited toast keeps its index', async () => {
    vi.useFakeTimers(); const { manager, store, view } = await setup(external, 100);
    const pending = manager.promise(Promise.resolve(1), { loading: 'loading', success: { description: 'done', timeout: 0 }, error: 'error' });
    await pending; vi.advanceTimersByTime(10000); expect(store.state.toasts[0].transitionStatus).not.toBe('ending');
    manager.add({ id: 'a', timeout: 0 }); manager.add({ id: 'b', timeout: 0 }); manager.add({ id: 'c', timeout: 0 });
    const id = store.state.toasts[3].id; expect(store.state.toasts[3].limited).toBe(true);
    manager.add({ id, title: 'upsert' }); expect(store.state.toasts[3]).toMatchObject({ id, limited: true });
    manager.close('c'); expect(store.state.toasts[3].limited).toBe(false); view.unmount();
  });
  it('cancels owner timers and pending promise side effects at disposal', async () => {
    vi.useFakeTimers(); const { manager, store, view } = await setup(external);
    const onClose = vi.fn(), success = vi.fn(() => 'done');
    manager.add({ onClose });
    let resolve!: (value: number) => void;
    const pending = manager.promise(new Promise<number>((done) => { resolve = done; }), { loading: 'loading', success, error: 'error' });
    view.unmount(); expect(vi.getTimerCount()).toBe(0); resolve(1); await expect(pending).resolves.toBe(1);
    expect(success).not.toHaveBeenCalled(); expect(onClose).not.toHaveBeenCalled();
    const length = store.state.toasts.length; manager.add({ title: 'detached' }); expect(store.state.toasts).toHaveLength(length);
  });
});
describe('ToastProvider', () => {
  it('does not sync timeout from a held async update that is later abandoned', async () => {
    vi.useFakeTimers(); const onClose = vi.fn(); let manager!: UseToastManagerReturnValue;
    let request!: (value: number) => void;
    const never = new Promise<number>(() => {});
    function App() {
      const [requested, setRequested] = createSignal(5000); request = setRequested;
      const timeout = createMemo<number>(() => requested() === 1000 ? never : requested());
      function Controls() {
        manager = useToastManager(); return <button onClick={() => manager.add({ title: 'Toast', onClose })}>Add toast</button>;
      }
      return <Loading fallback="Loading"><ToastProvider timeout={timeout()}><Controls /></ToastProvider></Loading>;
    }
    const view = await render(() => <App />);
    request(1000); flush(); await flushMicrotasks();
    fireEvent.click(view.getByText('Add toast')); flush();
    vi.advanceTimersByTime(1001); expect(onClose).not.toHaveBeenCalled();
    request(5000); flush(); vi.advanceTimersByTime(4000); expect(onClose).toHaveBeenCalledTimes(1); view.unmount();
  });
  it('syncs timeout and limit before descendant terminal effects', async () => {
    vi.useFakeTimers(); let store!: ToastStore;
    function Child(props: { revision: number }) {
      store = useToastProviderContext();
      createEffect(() => props.revision, (revision) => { store.addToast({ id: String(revision) }); });
      return null;
    }
    const view = await renderProps((props: { timeout: number; limit: number; revision: number }) =>
      <ToastProvider timeout={props.timeout} limit={props.limit}><Child revision={props.revision} /></ToastProvider>,
    { timeout: 5000, limit: 3, revision: 0 });
    await view.setProps({ timeout: 100, limit: 1, revision: 1 });
    expect(store.state.toasts.map((toast) => toast.limited)).toEqual([false, true]);
    vi.advanceTimersByTime(100); expect(store.state.toasts[0].transitionStatus).toBe('ending'); view.unmount();
  });
  it('keeps providers isolated and unsubscribes when the external manager changes', async () => {
    const first = createToastManager(), second = createToastManager(); const stores: ToastStore[] = [];
    function Probe() { stores.push(useToastProviderContext()); return null; }
    const view = await renderProps((props: { manager: typeof first }) => <>
      <ToastProvider toastManager={props.manager} timeout={0}><Probe /></ToastProvider>
      <ToastProvider toastManager={second} timeout={0}><Probe /></ToastProvider>
    </>, { manager: first });
    first.add({ id: 'first' }); second.add({ id: 'second' });
    expect(stores[0].state.toasts[0].id).toBe('first'); expect(stores[1].state.toasts[0].id).toBe('second');
    await view.setProps({ manager: second }); first.add({ id: 'detached' });
    expect(stores[0].state.toasts).toHaveLength(1);
    second.add({ id: 'shared' }); expect(stores.map((store) => store.state.toasts[0].id)).toEqual(['shared', 'shared']);
  });
  it('an unattached external promise returns the original promise', () => {
    const manager = createToastManager(), value = Promise.resolve(1);
    expect(manager.promise(value, { loading: 'loading', success: 'success', error: 'error' })).toBe(value);
  });
});
