import { onCleanup } from 'solid-js';

export class IdleCallback {
  static create() { return new IdleCallback(); }
  currentId: number | ReturnType<typeof setTimeout> | null = null;
  private cancelCurrent: (() => void) | undefined;
  /** The fallback is a macrotask, not a promise of an after-paint callback. */
  start(fn: () => void) {
    this.clear();
    const callback = () => { this.currentId = null; this.cancelCurrent = undefined; fn(); };
    if (typeof globalThis.requestIdleCallback === 'function') {
      const cancel = globalThis.cancelIdleCallback.bind(globalThis);
      const id = globalThis.requestIdleCallback(callback);
      this.currentId = id;
      this.cancelCurrent = () => cancel(id);
    } else {
      const id = setTimeout(callback, 0);
      this.currentId = id;
      this.cancelCurrent = () => clearTimeout(id);
    }
  }
  clear = () => {
    this.cancelCurrent?.();
    this.cancelCurrent = undefined;
    this.currentId = null;
  };
  disposeEffect = () => this.clear;
}
export function createIdleCallback() {
  const idle = IdleCallback.create();
  onCleanup(idle.clear);
  return idle;
}
export { createIdleCallback as useIdleCallback };
