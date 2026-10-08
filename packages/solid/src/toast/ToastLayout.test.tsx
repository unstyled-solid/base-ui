import { afterEach, describe, expect, it, vi } from 'vitest';
import { createSignal, For, flush, untrack } from 'solid-js';
import { createRenderer, firePointer, flushMicrotasks, waitFor } from '../../test';
import { Toast } from './index';
import { useToastProviderContext } from './provider/ToastProviderContext';
import type { ToastStore } from './store';
import type { ToastRootProps } from './root/ToastRoot';

// Source outcomes: root/ToastRoot.test.tsx, content/ToastContent.tsx,
// viewport/ToastViewport.test.tsx and positioner/ToastPositioner.test.tsx.
// Deterministic natural heights verify registration/observation, not browser layout.
const { render, renderProps } = createRenderer();
afterEach(() => { vi.restoreAllMocks(); vi.useRealTimers(); });
async function fixture(direction: ToastRootProps['swipeDirection'] = 'right') {
  const manager = Toast.createToastManager();
  let store!: ToastStore, show!: (value: boolean) => void;
  function List() {
    store = useToastProviderContext();
    const local = Toast.useToastManager();
    const [shown, setShown] = createSignal(true); show = setShown;
    return <>{shown() && <For each={local.toasts} keyed={(toast) => toast.id}>{(toast) =>
      <Toast.Root toast={toast()} swipeDirection={direction} data-testid={toast().id} style={{ height: '12px' }}>
        <Toast.Content><Toast.Title /><Toast.Description /></Toast.Content>
        <button data-testid={`button-${toast().id}`}>Action</button>
        <div data-base-ui-swipe-ignore data-testid={`ignore-${toast().id}`}>Ignore</div>
        <div data-swipe-ignore data-testid={`legacy-${toast().id}`}>Legacy</div>
      </Toast.Root>
    }</For>}</>;
  }
  const view = await render(() => <Toast.Provider toastManager={manager} timeout={0}><Toast.Viewport data-testid="viewport"><List /></Toast.Viewport></Toast.Provider>);
  manager.add({ id: 'a', title: 'A' }); flush();
  return { view, manager, store, show, node: view.getByTestId('a') };
}
function pointer(type: 'down' | 'move' | 'up' | 'cancel', node: Element, x: number, y: number, time: number, extra: PointerEventInit = {}) {
  firePointer[type](node, { pointerId: 1, pointerType: 'touch', button: 0, bubbles: true, cancelable: true, clientX: x, clientY: y, timeStamp: time, ...extra });
  flush();
}
function start(node: Element) { pointer('down', node, 100, 100, 1); pointer('move', node, 101, 101, 2); }

describe('Toast layout and shared gesture consumption', () => {
  for (const [direction, dx, dy] of [['right', 60, 0], ['left', -60, 0], ['up', 0, -60], ['down', 0, 60]] as const) {
    it(`dismisses ${direction} across separately committed pointer moves`, async () => {
      const { view, node, manager, store } = await fixture(direction);
      const onClose = vi.fn(), onRemove = vi.fn(); manager.update('a', { onClose, onRemove }); flush();
      start(node); expect(node).toHaveAttribute('data-swiping');
      // Height/content/hover snapshot publications cannot cancel an unchanged gesture policy.
      manager.update('a', { description: 'During drag' }); flush();
      pointer('move', node, 101 + dx, 101 + dy, 3);
      expect(node).toHaveAttribute('data-swipe-direction', direction);
      pointer('up', node, 101 + dx, 101 + dy, 4);
      await waitFor(() => expect(view.queryByTestId('a')).toBeNull());
      expect(store.state.toasts).toHaveLength(0);
      expect(onClose).toHaveBeenCalledTimes(1); expect(onRemove).toHaveBeenCalledTimes(1);
    });
  }
  it('rebases the first movement and constrains two-axis motion before dismissal', async () => {
    const { node, store } = await fixture(['down', 'right']);
    start(node); expect(node.style.getPropertyValue('--toast-swipe-movement-x')).toBe('0px');
    pointer('move', node, 106, 103, 3); pointer('move', node, 121, 200, 4);
    expect(node.style.getPropertyValue('--toast-swipe-movement-y')).toBe('0px');
    expect(node.style.getPropertyValue('--toast-swipe-movement-x')).toBe('20px');
    pointer('up', node, 121, 200, 5); expect(store.state.toasts).toHaveLength(1);
    expect(node).not.toHaveAttribute('data-swiping'); expect(node).not.toHaveAttribute('data-swipe-direction');
  });
  it('cancels reversed motion and document cancellation without leaving drag styles', async () => {
    const { node, view } = await fixture('right'); start(node);
    pointer('move', node, 190, 101, 3, { movementX: 89 });
    pointer('move', node, 150, 101, 4, { movementX: -40 }); pointer('up', node, 150, 101, 5);
    expect(view.getByTestId('a') === node).toBe(true); expect(node).not.toHaveAttribute('data-swipe-direction');
    start(node); pointer('move', node, -5000, 101, 3);
    const cancel = new PointerEvent('pointercancel', { pointerId: 1, pointerType: 'touch', bubbles: true });
    Object.defineProperty(cancel, 'timeStamp', { value: 4 }); document.dispatchEvent(cancel); flush();
    expect(node).not.toHaveAttribute('data-swiping'); expect(node.style.transform).toBe(''); expect(node.style.transition).toBe('');
    expect(node.style.getPropertyValue('--toast-swipe-movement-x')).toBe('0px');
  });
  it('gates primary buttons, interactive descendants, both ignore attributes and native touchmove', async () => {
    const { view, node } = await fixture();
    pointer('down', node, 100, 100, 1, { button: 2 }); expect(node).not.toHaveAttribute('data-swiping');
    for (const id of ['button-a', 'ignore-a', 'legacy-a']) {
      pointer('down', view.getByTestId(id), 100, 100, 1); expect(node).not.toHaveAttribute('data-swiping');
    }
    const touch = () => { const event = new Event('touchmove', { bubbles: true, cancelable: true }); node.dispatchEvent(event); return event.defaultPrevented; };
    expect(touch()).toBe(false); start(node); expect(touch()).toBe(true);
    pointer('cancel', node, 100, 100, 3); expect(touch()).toBe(false);
  });
  it('does not swipe an anchored toast, including an explicit null anchor', async () => {
    const { node, manager, store } = await fixture();
    manager.update('a', { positionerProps: { anchor: null } }); flush();
    start(node); pointer('move', node, 200, 101, 3); pointer('up', node, 200, 101, 4);
    expect(node).not.toHaveAttribute('data-swiping'); expect(store.state.toasts).toHaveLength(1);
  });
  it('remeasures natural content height, offsets and remounted root registration', async () => {
    const naturalHeight = vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(function (this: HTMLElement) {
      if (!this.hasAttribute('data-testid') || this.getAttribute('role') !== 'dialog') return 0;
      expect(this.style.height).toBe('auto');
      return this.textContent?.includes('Longer') ? 80 : 30;
    });
    const observers: { node: Element | undefined; resize: () => void; disconnect: ReturnType<typeof vi.fn<() => void>> }[] = [];
    const original = window.ResizeObserver;
    class Observer {
      record: (typeof observers)[number];
      constructor(callback: ResizeObserverCallback) {
        this.record = { node: undefined, resize: () => callback([], this as unknown as ResizeObserver), disconnect: vi.fn() }; observers.push(this.record);
      }
      observe(node: Element) { this.record.node = node; }
      unobserve() {}
      disconnect() { this.record.disconnect(); }
    }
    window.ResizeObserver = Observer;
    try {
      const { view, node, manager, store, show } = await fixture();
      expect(node.style.height).toBe('12px'); expect(node.style.getPropertyValue('--toast-height')).toBe('30px');
      expect(view.getByTestId('viewport').style.getPropertyValue('--toast-frontmost-height')).toBe('30px');
      manager.update('a', { description: 'Longer content' }); flush();
      await waitFor(() => expect(node.style.getPropertyValue('--toast-height')).toBe('80px'));
      manager.add({ id: 'b', title: 'B' }); flush();
      expect(node.style.getPropertyValue('--toast-offset-y')).toBe('30px');
      show(false); flush(); expect(store.state.toasts.every((toast) => toast.ref === undefined)).toBe(true);
      expect(observers.every((observer) => observer.disconnect.mock.calls.length === 1)).toBe(true);
      show(true); flush(); const remounted = view.getByTestId('a');
      expect(remounted === node).toBe(false); expect(untrack(store.state.toasts[1].ref!) === remounted).toBe(true);
      expect(remounted.style.getPropertyValue('--toast-height')).toBe('80px');
      view.unmount(); expect(observers.every((observer) => observer.disconnect.mock.calls.length === 1)).toBe(true);
      expect(naturalHeight).toHaveBeenCalled();
    } finally { window.ResizeObserver = original; }
  });
  it('lets live Positioner props override toast options and forwards Arrow state', async () => {
    const view = await renderProps((props: { side: 'left' | 'right' }) => <Toast.Provider>
      <Toast.Positioner toast={{ id: 'a', positionerProps: { side: 'bottom', align: 'end', positionMethod: 'fixed' } }} side={props.side} data-testid="positioner">
        <Toast.Arrow data-testid="arrow" />
      </Toast.Positioner>
    </Toast.Provider>, { side: 'left' });
    const node = view.getByTestId('positioner'), arrow = view.getByTestId('arrow');
    expect(node).toHaveAttribute('role', 'presentation'); expect(node).toHaveAttribute('data-side', 'left'); expect(node).toHaveAttribute('data-align', 'end');
    expect(arrow).toHaveAttribute('data-side', 'left'); expect(arrow).toHaveAttribute('aria-hidden', 'true');
    await view.setProps({ side: 'right' }); await flushMicrotasks();
    expect(view.getByTestId('positioner') === node).toBe(true); expect(node).toHaveAttribute('data-side', 'right'); expect(arrow).toHaveAttribute('data-side', 'right');
  });
  it('ignores ending measurements and stale animation completion after the same ID is revived', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date', 'requestAnimationFrame', 'cancelAnimationFrame'] });
    const previous = globalThis.BASE_UI_ANIMATIONS_DISABLED;
    globalThis.BASE_UI_ANIMATIONS_DISABLED = false;
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(40);
    try {
      const { view, manager, node, store } = await fixture();
      let finish!: () => void;
      const finished = new Promise<void>((resolve) => { finish = resolve; });
      const getAnimations = vi.fn(() => [{ finished }]);
      Object.defineProperty(node, 'getAnimations', { configurable: true, value: getAnimations });
      const onRemove = vi.fn(); manager.update('a', { onRemove }); flush();
      manager.close('a'); flush(); vi.advanceTimersByTime(20); flush();
      expect(getAnimations).toHaveBeenCalledTimes(1);
      expect(node).toHaveAttribute('data-ending-style'); expect(node.style.getPropertyValue('--toast-height')).toBe('');
      store.updateToastInternal('a', { height: 80, transitionStatus: undefined }); flush();
      expect(store.state.toasts[0]).toMatchObject({ height: 0, transitionStatus: 'ending' });
      manager.add({ id: 'a', title: 'Revived', onRemove }); flush();
      expect(view.getByTestId('a') === node).toBe(true); expect(node).not.toHaveAttribute('data-starting-style');
      expect(node.style.getPropertyValue('--toast-height')).toBe('40px');
      finish(); await flushMicrotasks(); flush();
      expect(view.getByTestId('a') === node).toBe(true); expect(onRemove).not.toHaveBeenCalled();
      manager.close('a'); flush(); await vi.advanceTimersByTimeAsync(20); flush();
      expect(getAnimations).toHaveBeenCalledTimes(2);
      expect(view.queryByTestId('a')).toBeNull(); expect(onRemove).toHaveBeenCalledTimes(1); view.unmount();
    } finally { globalThis.BASE_UI_ANIMATIONS_DISABLED = previous; }
  });
});
