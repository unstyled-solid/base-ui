import { onCleanup } from 'solid-js';

/** Imperative timeout. Derived from Base UI (MIT), pinned source in upstream/base-ui. */
export class Timeout {
  static create() { return new Timeout(); }
  currentId: ReturnType<typeof setTimeout> | 0 = 0;
  start(delay: number, fn: () => void) {
    this.clear();
    this.currentId = setTimeout(() => { this.currentId = 0; fn(); }, delay);
  }
  isStarted() { return this.currentId !== 0; }
  clear = () => {
    if (this.currentId !== 0) { clearTimeout(this.currentId); this.currentId = 0; }
  };
  disposeEffect = () => this.clear;
}

/** Allocate during setup; cleanup also covers disposal before the first settle. */
export function createTimeout() {
  const timeout = Timeout.create();
  onCleanup(timeout.clear);
  return timeout;
}
export { createTimeout as useTimeout };
