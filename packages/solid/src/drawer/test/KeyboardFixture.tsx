import { createSignal } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { DialogRootContext } from '../../dialog/root/DialogRootContext';
import type { DialogStore } from '../../dialog/store/DialogStore';
import { DrawerVirtualKeyboardProvider } from '../virtual-keyboard-provider/DrawerVirtualKeyboardProvider';
import { useDrawerVirtualKeyboardContext } from '../virtual-keyboard-provider/DrawerVirtualKeyboardContext';

/** Isolates the keyboard resource's read-only Dialog seam; does not simulate a popup engine. */
export function KeyboardFixture(props: { open?: boolean; mounted?: boolean; nested?: boolean; modal?: boolean; children?: JSX.Element }) {
  const [root, setRoot] = createSignal<HTMLDivElement | null>(null);
  const state: Pick<DialogStore['state'], 'open' | 'mounted' | 'modal' | 'nestedOpenDialogCount' | 'viewportElement'> = {
    get open() { return props.open ?? true; }, get mounted() { return props.mounted ?? true; },
    get modal() { return props.modal ?? false; }, get nestedOpenDialogCount() { return props.nested ? 1 : 0; },
    get viewportElement() { return root(); },
  };
  // Deliberately incomplete fixture: unexpected reads fail rather than acquiring fake machinery.
  const store = new Proxy({ state }, { get(target, key) {
    if (key === 'state') return target.state;
    throw new Error(`Keyboard fixture does not provide Dialog.${String(key)}`);
  } }) as unknown as DialogStore;
  function TouchHost() {
    const keyboard = useDrawerVirtualKeyboardContext()!;
    return <div ref={setRoot} data-testid="viewport" onTouchStart={keyboard.onTouchStart} onTouchMove={keyboard.onTouchMove} onTouchEnd={keyboard.onTouchEnd} onTouchCancel={keyboard.onTouchCancel}>{props.children}</div>;
  }
  return <DialogRootContext value={store}><DrawerVirtualKeyboardProvider><TouchHost /></DrawerVirtualKeyboardProvider></DialogRootContext>;
}

export function dispatchTouch(target: Element, type: 'touchstart' | 'touchmove' | 'touchend' | 'touchcancel', point: { x: number; y: number } | null = { x: 12, y: 34 }) {
  const win = target.ownerDocument.defaultView!;
  const event = new win.Event(type, { bubbles: true, cancelable: true, composed: true });
  const touches = point ? [{ identifier: 1, target, clientX: point.x, clientY: point.y }] : [];
  Object.defineProperties(event, { touches: { value: type === 'touchend' || type === 'touchcancel' ? [] : touches }, changedTouches: { value: touches } });
  target.dispatchEvent(event);
  return event;
}
