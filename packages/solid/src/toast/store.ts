// Toast algorithms adapted from Base UI (MIT), pinned at 19511bb171f3b360b006c94cf6d07e53cb446505.
import { createSignal, type Accessor } from 'solid-js';
import { generateId } from '../utils/generateId';
import { Timeout } from '../utils/createTimeout';
import { ownerDocument } from '../utils/owner';
import { activeElement, contains, getTarget } from '../utils/shadowDom';
import { isFocusVisible } from './utils/focusVisible';
import { resolvePromiseOptions } from './utils/resolvePromiseOptions';
import type { ToastObject, ToastManagerAddOptions, ToastManagerUpdateOptions, ToastManagerPromiseOptions } from './useToastManager';

export type StoredToast<Data extends object = any> = ToastObject<Data> & { updateKey: number };
export interface State {
  toasts: StoredToast[];
  toastMetadata: Map<string, { value: StoredToast; domIndex: number; visibleIndex: number; offsetY: number }>;
  hovering: boolean; focused: boolean; timeout: number; limit: number; isWindowFocused: boolean;
  viewport: HTMLElement | null; prevFocusElement: HTMLElement | null;
}
function metadata(toasts: StoredToast[]): State['toastMetadata'] {
  let visibleIndex = 0, offsetY = 0;
  return new Map(toasts.map((value, domIndex) => {
    const entry = { value, domIndex, visibleIndex: value.transitionStatus === 'ending' ? -1 : visibleIndex++, offsetY };
    offsetY += value.height || 0;
    return [value.id, entry];
  }));
}
function applyLimited(toasts: StoredToast[], limit: number) {
  let index = 0;
  return toasts.map((toast) => {
    if (toast.transitionStatus === 'ending') return toast;
    const limited = index++ >= limit;
    return limited === toast.limited ? toast : { ...toast, limited };
  });
}
export const selectors = {
  toasts: (state: State) => state.toasts,
  isEmpty: (state: State) => state.toasts.length === 0,
  toast: (state: State, id: string) => state.toastMetadata.get(id)?.value,
  toastIndex: (state: State, id: string) => state.toastMetadata.get(id)?.domIndex ?? -1,
  toastVisibleIndex: (state: State, id: string) => state.toastMetadata.get(id)?.visibleIndex ?? -1,
  toastOffsetY: (state: State, id: string) => state.toastMetadata.get(id)?.offsetY ?? 0,
  focused: (state: State) => state.focused,
  expanded: (state: State) => state.hovering || state.focused,
  expandedOrOutOfFocus: (state: State) => state.hovering || state.focused || !state.isWindowFocused,
  prevFocusElement: (state: State) => state.prevFocusElement,
};
interface Timer { timeout?: Timeout; start: number; delay: number; remaining: number }

/** Toast-specific transaction model. `state` is immediate imperative state;
 * `snapshot` is a native, staged signal. No setter/read roundtrip or global flush. */
export class ToastStore {
  state: State;
  readonly snapshot: Accessor<State>;
  private publish: (state: State) => void;
  private timers = new Map<string, Timer>();
  private paused = false;
  private disposed = false;
  private lifetimes = new Map<string, symbol>();
  private removing = new Set<symbol>();
  constructor(initial: Omit<State, 'toastMetadata'>) {
    this.state = { ...initial, toastMetadata: metadata(initial.toasts) };
    initial.toasts.forEach((toast) => this.lifetimes.set(toast.id, Symbol(toast.id)));
    // Owned ref/registration cleanup publishes the imperative model as well.
    const [read, write] = createSignal(this.state, { ownedWrite: true });
    this.snapshot = read;
    this.publish = (state) => { write(state); };
  }
  update(updates: Partial<State>) {
    if (this.disposed) return;
    this.state = { ...this.state, ...updates };
    this.publish(this.state);
  }
  set<K extends keyof State>(key: K, value: State[K]) { this.update({ [key]: value }); }
  setViewport = (viewport: HTMLElement | null) => { this.set('viewport', viewport); };
  syncProviderProps(timeout: number, limit: number) {
    if (timeout === this.state.timeout && limit === this.state.limit) return;
    const toasts = limit === this.state.limit ? this.state.toasts : applyLimited(this.state.toasts, limit);
    this.update({ timeout, limit, toasts, toastMetadata: metadata(toasts) });
  }
  dispose = () => { this.disposed = true; this.clearTimers(); };
  disposeEffect = () => this.dispose;
  private setToasts(toasts: StoredToast[], clearInteraction = toasts.length === 0) {
    this.update({ toasts, toastMetadata: metadata(toasts), ...(clearInteraction ? { hovering: false, focused: false } : {}) });
  }
  removeToast(id: string, skipOnRemove = false) {
    const toast = selectors.toast(this.state, id);
    const lifetime = this.lifetimes.get(id);
    if (!toast || !lifetime || this.disposed || (!skipOnRemove && this.removing.has(lifetime))) return;
    this.removing.add(lifetime);
    try { if (!skipOnRemove) toast.onRemove?.(); }
    finally {
      // A callback may have removed/replaced this ID. Never remove its replacement.
      if (this.lifetimes.get(id) === lifetime) {
        this.clearTimer(id);
        this.lifetimes.delete(id);
        this.setToasts(this.state.toasts.filter((item) => item.id !== id));
      }
      this.removing.delete(lifetime);
    }
  }
  addToast = <Data extends object>(options: ToastManagerAddOptions<Data>): string => {
    const id = options.id || generateId('toast');
    if (this.disposed) return id;
    const previous = selectors.toast(this.state, id);
    if (previous) {
      if (previous.transitionStatus === 'ending') this.removeToast(id, true);
      else {
        const { id: ignoredId, transitionStatus: ignoredStatus, ...updates } = options;
        this.updateToastInternal(id, updates, true, true);
        return id;
      }
    }
    const toast: StoredToast<Data> = { ...options, id, updateKey: 0, transitionStatus: 'starting' };
    this.lifetimes.set(id, Symbol(id));
    this.setToasts(applyLimited([toast, ...this.state.toasts], this.state.limit));
    const duration = toast.timeout ?? this.state.timeout;
    if (toast.type !== 'loading' && duration > 0) this.scheduleTimer(id, duration);
    if (selectors.expandedOrOutOfFocus(this.state)) this.pauseTimers();
    return id;
  };
  updateToast = <Data extends object>(id: string, updates: ToastManagerUpdateOptions<Data> | ((previous: ToastObject<Data>) => ToastManagerUpdateOptions<Data>)) => {
    const previous = selectors.toast(this.state, id);
    if (!previous || previous.transitionStatus === 'ending' || this.disposed) return;
    this.updateToastInternal(id, typeof updates === 'function' ? updates(previous) : updates, false, true);
  };
  updateToastInternal = <Data extends object>(id: string, updates: Partial<Omit<ToastObject<Data>, 'id' | 'updateKey'>>, resetTimer = false, markUpdated = false) => {
    const previous = selectors.toast(this.state, id);
    if (!previous || previous.transitionStatus === 'ending' || this.disposed) return;
    const next = { ...previous, ...updates, updateKey: previous.updateKey + Number(markUpdated) };
    this.setToasts(this.state.toasts.map((toast) => toast.id === id ? next : toast));
    const duration = next.timeout ?? this.state.timeout;
    const hasTimer = this.timers.has(id);
    if (next.transitionStatus === 'ending' || next.type === 'loading' || !(duration > 0)) {
      if (hasTimer) this.clearTimer(id);
    } else if (!hasTimer || duration !== (previous.timeout ?? this.state.timeout) || Object.hasOwn(updates, 'timeout') || previous.type === 'loading' || resetTimer) {
      this.clearTimer(id);
      this.scheduleTimer(id, duration);
      if (selectors.expandedOrOutOfFocus(this.state)) this.pauseTimers();
    }
  };
  closeToast = (id?: string) => {
    if (this.disposed) return;
    const affected = id === undefined ? this.state.toasts : this.state.toasts.filter((toast) => toast.id === id);
    if (!affected.length) return;
    if (id === undefined) this.clearTimers(); else this.clearTimer(id);
    const toasts = applyLimited(this.state.toasts.map((toast) => id === undefined || toast.id === id ? { ...toast, transitionStatus: 'ending' as const, height: 0 } : toast), this.state.limit);
    this.setToasts(toasts, toasts.every((toast) => toast.transitionStatus === 'ending'));
    affected.forEach((toast) => { if (toast.transitionStatus !== 'ending') toast.onClose?.(); });
    this.manageFocus(id);
  };
  promiseToast = <Value, Data extends object>(promise: Promise<Value>, options: ToastManagerPromiseOptions<Value, Data>): Promise<Value> => {
    const id = this.addToast({ ...resolvePromiseOptions(options.loading), type: 'loading' });
    const handled = promise.then((value) => {
      if (!this.disposed) {
        const success = resolvePromiseOptions(options.success, value);
        this.updateToast(id, { ...success, type: 'success', timeout: success.timeout });
      }
      return value;
    }).catch((error) => {
      if (!this.disposed) {
        const failure = resolvePromiseOptions(options.error, error);
        this.updateToast(id, { ...failure, type: 'error', timeout: failure.timeout });
      }
      throw error;
    });
    if (Object.hasOwn(options, 'setPromise') && 'setPromise' in options && typeof options.setPromise === 'function') options.setPromise(handled);
    return handled;
  };
  pauseTimers() {
    if (this.paused || this.disposed) return;
    this.paused = true;
    this.timers.forEach((timer) => {
      if (timer.timeout?.isStarted()) {
        timer.timeout.clear();
        timer.remaining = Math.max(timer.remaining - (Date.now() - timer.start), 0);
      }
    });
  }
  resumeTimers() {
    if (!this.paused || this.disposed) return;
    this.paused = false;
    this.timers.forEach((timer, id) => {
      timer.remaining = timer.remaining > 0 ? timer.remaining : timer.delay;
      this.startTimer(id, timer);
    });
  }
  private startTimer(id: string, timer: Timer) {
    timer.timeout ??= Timeout.create();
    timer.start = Date.now();
    timer.timeout.start(timer.remaining, () => { this.clearTimer(id); this.closeToast(id); });
  }
  private scheduleTimer(id: string, delay: number) {
    const timer = { start: Date.now(), remaining: delay, delay };
    this.timers.set(id, timer);
    if (!selectors.expandedOrOutOfFocus(this.state)) this.startTimer(id, timer);
  }
  private clearTimer(id: string) {
    this.timers.get(id)?.timeout?.clear(); this.timers.delete(id);
    if (!this.timers.size) this.paused = false;
  }
  private clearTimers() { this.timers.forEach((timer) => timer.timeout?.clear()); this.timers.clear(); this.paused = false; }
  restoreFocusToPrevElement() { this.state.prevFocusElement?.focus({ preventScroll: true }); }
  handleDocumentPointerDown = (event: PointerEvent) => {
    if (event.pointerType !== 'touch' || contains(this.state.viewport, getTarget(event) as Element | null)) return;
    this.resumeTimers(); this.update({ hovering: false, focused: false });
  };
  private manageFocus(id?: string) {
    const viewport = this.state.viewport;
    if (!viewport) return;
    const active = activeElement(ownerDocument(viewport));
    if (!contains(viewport, active) || !isFocusVisible(active)) return;
    if (id === undefined) { this.restoreFocusToPrevElement(); return; }
    const index = selectors.toastIndex(this.state, id);
    const eligible = (toast: StoredToast) => toast.transitionStatus !== 'ending' && !toast.limited;
    const next = this.state.toasts.slice(index + 1).find(eligible) ?? this.state.toasts.slice(0, index).reverse().find(eligible);
    if (next) next.ref?.()?.focus(); else this.restoreFocusToPrevElement();
  }
}
