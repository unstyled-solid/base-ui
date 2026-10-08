import { afterEach, describe, expect, it, vi } from 'vitest';
import { flush, For } from 'solid-js';
import { createRenderer, fireEvent, firePointer } from '../../test';
import { Toast } from './index';
import { useToastProviderContext } from './provider/ToastProviderContext';
import type { ToastStore } from './store';

const { render } = createRenderer();
afterEach(() => vi.useRealTimers());
async function fixture(limit = 3) {
  const manager = Toast.createToastManager(); let store!: ToastStore;
  function List() {
    store = useToastProviderContext(); const local = Toast.useToastManager();
    return <For each={local.toasts} keyed={(toast) => toast.id}>{(toast) => <Toast.Root toast={toast()} data-testid={toast().id}><Toast.Title /><Toast.Close>Close</Toast.Close><Toast.Action>Action</Toast.Action></Toast.Root>}</For>;
  }
  const view = await render(() => <Toast.Provider toastManager={manager} timeout={100} limit={limit}>
    <Toast.Viewport data-testid="viewport"><List /></Toast.Viewport><button>Outside</button>
  </Toast.Provider>);
  manager.add({ id: 'a', title: 'First' }); flush();
  return { view, manager, store, viewport: view.getByTestId('viewport'), outside: view.getByText('Outside') };
}
function tick(ms: number) { vi.advanceTimersByTime(ms); flush(); }
function windowFocus(type: 'blur' | 'focus') {
  const event = new FocusEvent(type);
  // jsdom Window.dispatchEvent exposes a wrapper target; upstream's fixture
  // explicitly identifies the window through the composed event path.
  Object.defineProperty(event, 'composedPath', { value: () => [window] });
  window.dispatchEvent(event);
}
describe('ToastViewport — source timers and focus management', () => {
  it('pauses on hover and resumes with remaining duration', async () => {
    vi.useFakeTimers(); const { view, store, viewport } = await fixture();
    tick(40); fireEvent.mouseEnter(viewport); flush(); tick(1000);
    expect(store.state.toasts[0].transitionStatus).not.toBe('ending');
    fireEvent.mouseLeave(viewport); flush(); tick(59); expect(store.state.toasts[0].transitionStatus).not.toBe('ending');
    tick(1); expect(view.queryByTestId('a')).toBeNull(); expect(store.state.toasts).toHaveLength(0); view.unmount();
  });
  it('pauses when a toast descendant receives focus directly and resumes when it leaves', async () => {
    vi.useFakeTimers(); const { view, viewport, outside, store } = await fixture();
    tick(40); const action = view.getByText('Action'); action.focus(); flush();
    expect(action).toHaveFocus(); expect(viewport).toHaveAttribute('data-expanded'); expect(store.state.focused).toBe(true);
    tick(1000); expect(view.getByTestId('a')).toBeInTheDocument();
    outside.focus(); flush(); expect(store.state.focused).toBe(false); expect(viewport).not.toHaveAttribute('data-expanded');
    tick(59); expect(view.getByTestId('a')).toBeInTheDocument();
    tick(1); expect(view.queryByTestId('a')).toBeNull(); view.unmount();
  });
  for (const remaining of ['focused', 'hovering'] as const) it(`keeps timers paused while still ${remaining} after the other interaction ends`, async () => {
    vi.useFakeTimers(); const { view, store, viewport, outside } = await fixture(); outside.focus(); tick(40);
    fireEvent.keyDown(outside, { key: 'F6' }); flush(); fireEvent.mouseEnter(viewport); flush();
    if (remaining === 'focused') fireEvent.mouseLeave(viewport); else outside.focus(); flush();
    tick(1000); expect(store.state.toasts[0].transitionStatus).not.toBe('ending');
    if (remaining === 'focused') outside.focus(); else fireEvent.mouseLeave(viewport); flush();
    tick(59); expect(store.state.toasts[0].transitionStatus).not.toBe('ending');
    tick(1); expect(view.queryByTestId('a')).toBeNull(); expect(store.state.toasts).toHaveLength(0); view.unmount();
  });
  it('shift+Tab restores previous focus and resumes only if it left the viewport', async () => {
    vi.useFakeTimers(); const { view, store, viewport, outside } = await fixture(); outside.focus();
    fireEvent.keyDown(outside, { key: 'F6' }); flush(); tick(1000);
    expect(viewport).toHaveFocus(); expect(store.state.toasts[0].transitionStatus).not.toBe('ending');
    fireEvent.keyDown(viewport, { key: 'Tab', shiftKey: true }); flush(); expect(outside).toHaveFocus();
    tick(100); expect(view.queryByTestId('a')).toBeNull(); expect(store.state.toasts).toHaveLength(0); view.unmount();
  });
  it('shift+Tab returning inside keeps timers paused; forward Tab does not restore focus', async () => {
    vi.useFakeTimers(); const { view, store, viewport } = await fixture(); const root = view.getByTestId('a'); root.focus();
    fireEvent.keyDown(root, { key: 'F6' }); flush(); fireEvent.keyDown(viewport, { key: 'Tab' }); flush(); expect(viewport).toHaveFocus();
    fireEvent.keyDown(viewport, { key: 'Tab', shiftKey: true }); flush(); expect(root).toHaveFocus();
    tick(1000); expect(store.state.toasts[0].transitionStatus).not.toBe('ending'); view.unmount();
  });
  for (const target of ['outside-touch', 'inside-touch', 'outside-mouse'] as const) it(`touch/mouse ownership [${target}]`, async () => {
    vi.useFakeTimers(); const { view, store, viewport, outside } = await fixture(); fireEvent.mouseEnter(viewport); flush();
    firePointer.down(target === 'inside-touch' ? viewport : outside, { pointerId: 1, pointerType: target === 'outside-mouse' ? 'mouse' : 'touch', button: 0, bubbles: true, timeStamp: 1 }); flush();
    expect(viewport.hasAttribute('data-expanded')).toBe(target !== 'outside-touch');
    tick(101); expect(view.queryByTestId('a') === null).toBe(target === 'outside-touch');
    expect(store.state.toasts.length).toBe(target === 'outside-touch' ? 0 : 1); view.unmount();
  });
  for (const leaving of [false, true]) for (const cancel of [false, true]) it(`touch gesture defers mouseleave [leave=${leaving},cancel=${cancel}]`, async () => {
    const { view, viewport } = await fixture(); const root = view.getByTestId('a');
    firePointer.down(root, { pointerId: 1, pointerType: 'touch', button: 0, clientX: 100, clientY: 100, bubbles: true, timeStamp: 1 }); flush();
    if (leaving) fireEvent.mouseLeave(viewport); flush(); expect(viewport).toHaveAttribute('data-expanded');
    if (cancel) fireEvent.pointerCancel(root, { pointerId: 1, pointerType: 'touch', bubbles: true });
    else firePointer.up(root, { pointerId: 1, pointerType: 'touch', bubbles: true, timeStamp: 2 }); flush();
    expect(viewport.hasAttribute('data-expanded')).toBe(!leaving); view.unmount();
  });
  it('window blur pauses, interaction exits do not resume, window focus restores remaining time', async () => {
    vi.useFakeTimers(); const { view, store, viewport } = await fixture(); tick(40);
    fireEvent.mouseEnter(viewport); windowFocus('blur'); flush();
    expect(store.state.isWindowFocused).toBe(false);
    fireEvent.mouseLeave(viewport); flush(); tick(1000);
    expect(store.state.toasts[0].transitionStatus).not.toBe('ending'); expect(store.state.isWindowFocused).toBe(false);
    windowFocus('focus'); tick(0); tick(59); expect(store.state.toasts[0].transitionStatus).not.toBe('ending');
    tick(1); expect(view.queryByTestId('a')).toBeNull(); expect(store.state.toasts).toHaveLength(0); view.unmount();
  });
  it('ignores focus events with a related target while paused', async () => {
    vi.useFakeTimers(); const { view, store, viewport, outside } = await fixture(); windowFocus('blur'); flush();
    fireEvent.focus(outside, { relatedTarget: viewport }); flush(); tick(1000);
    expect(store.state.toasts[0].transitionStatus).not.toBe('ending'); view.unmount();
  });
  it('focus guard skips ending and limited toasts, and restores when none are eligible', async () => {
    const { view, manager, viewport, outside, store } = await fixture(); manager.add({ id: 'b', title: 'Second', timeout: 0 }); flush();
    outside.focus(); fireEvent.keyDown(outside, { key: 'F6' }); flush();
    // Keep the ending toast in the store independently of animation duration.
    store.updateToastInternal('b', { transitionStatus: 'ending' }); flush();
    const guard = view.container.querySelector('[data-base-ui-focus-guard]')!;
    fireEvent.focus(guard, { relatedTarget: viewport }); flush(); expect(view.getByTestId('a')).toHaveFocus();
    store.syncProviderProps(0, 0); flush(); viewport.focus(); fireEvent.focus(guard, { relatedTarget: viewport }); flush(); expect(outside).toHaveFocus(); view.unmount();
  });
  it('leaves focus alone outside and restores it when all toasts close', async () => {
    const { view, manager, viewport, outside } = await fixture(); outside.focus(); manager.close(); flush(); expect(outside).toHaveFocus();
    manager.add({ id: 'b', timeout: 0 }); flush(); fireEvent.keyDown(outside, { key: 'F6' }); flush(); expect(viewport).toHaveFocus();
    manager.close(); flush(); expect(outside).toHaveFocus(); view.unmount();
  });
});
