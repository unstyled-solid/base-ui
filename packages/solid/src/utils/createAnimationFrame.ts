import { onCleanup } from 'solid-js';

// Base UI's batched frame ordering and explicit cancellation, with cancellation
// of the native frame too when the last owned callback is removed.
class Scheduler {
  callbacks = new Map<number, FrameRequestCallback>();
  nextId = 1;
  private nativeId: number | null = null;
  private cancelNative: ((id: number) => void) | undefined;
  private requestNative: typeof requestAnimationFrame | undefined;
  tick = (timestamp: number) => {
    this.nativeId = null;
    const callbacks = this.callbacks;
    this.callbacks = new Map();
    for (const callback of callbacks.values()) callback(timestamp);
  };
  request(fn: FrameRequestCallback) {
    const id = this.nextId++;
    this.callbacks.set(id, fn);
    if (this.nativeId === null || this.requestNative !== globalThis.requestAnimationFrame) {
      this.requestNative = globalThis.requestAnimationFrame;
      this.cancelNative = globalThis.cancelAnimationFrame.bind(globalThis);
      this.nativeId = globalThis.requestAnimationFrame(this.tick);
    }
    return id;
  }
  cancel(id: number) {
    this.callbacks.delete(id);
    if (this.callbacks.size === 0 && this.nativeId !== null) {
      this.cancelNative?.(this.nativeId);
      this.nativeId = null;
    }
  }
  reset() {
    this.callbacks.clear();
    if (this.nativeId !== null) this.cancelNative?.(this.nativeId);
    this.nativeId = null;
  }
}
const scheduler = new Scheduler();
export function resetAnimationFrameScheduler() { scheduler.reset(); }
export class AnimationFrame {
  static create() { return new AnimationFrame(); }
  static request(fn: FrameRequestCallback) { return scheduler.request(fn); }
  static cancel(id: number) { scheduler.cancel(id); }
  currentId: number | null = null;
  request(fn: () => void) {
    this.cancel();
    const id = scheduler.request(() => {
      // An earlier callback in this frame may dispose this resource after the
      // scheduler has taken its batch snapshot. Disposal must still win.
      if (this.currentId !== id) return;
      this.currentId = null;
      fn();
    });
    this.currentId = id;
  }
  cancel = () => {
    if (this.currentId !== null) { scheduler.cancel(this.currentId); this.currentId = null; }
  };
  disposeEffect = () => this.cancel;
}
export function createAnimationFrame() {
  const frame = AnimationFrame.create();
  onCleanup(frame.cancel);
  return frame;
}
export { createAnimationFrame as useAnimationFrame };
