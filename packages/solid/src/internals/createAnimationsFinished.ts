import { createEffect, onCleanup, untrack, type Accessor } from 'solid-js';
import { createAnimationFrame } from '../utils/createAnimationFrame';
import { getFiniteAnimations } from '../utils/getFiniteAnimations';
export interface AnimationsFinishedParameters {
  element: Accessor<HTMLElement | null>;
  enabled?: Accessor<boolean>;
  onFinished: () => void;
  waitForStartingStyleRemoved?: Accessor<boolean>;
  batch?: boolean;
}
export type RunAnimationsFinished = (callback: () => void, signal?: AbortSignal | null) => void;
const pendingCompletions: (() => void)[] = [];
let completionScheduled = false;
/** Default source completions commit separately. RC13 stages ordinary writes,
 * so let its commit checkpoint run before delivering the next ready callback. */
function enqueueCompletion(callback: () => void) {
  pendingCompletions.push(callback);
  if (completionScheduled) return;
  completionScheduled = true;
  const next = () => {
    try { pendingCompletions.shift()?.(); }
    finally {
      if (pendingCompletions.length) queueMicrotask(next);
      else completionScheduled = false;
    }
  };
  queueMicrotask(next);
}
/** Imperative source API is additive to the frozen declarative parameter seam. */
export function createAnimationsFinished(params: AnimationsFinishedParameters): void;
export function createAnimationsFinished(element: Accessor<HTMLElement | null>, waitForStartingStyleRemoved?: boolean | Accessor<boolean>, batch?: boolean): RunAnimationsFinished;
export function createAnimationsFinished(input: AnimationsFinishedParameters | Accessor<HTMLElement | null>, wait: boolean | Accessor<boolean> = false, batch = false): void | RunAnimationsFinished {
  const frame = createAnimationFrame();
  let cancelCurrent = () => {};
  onCleanup(() => cancelCurrent());
  const element = typeof input === 'function' ? input : input.element;
  const run: RunAnimationsFinished = (callback, signal) => {
    cancelCurrent();
    const node = untrack(element);
    if (!node || signal?.aborted) return;
    let active = true;
    let observer: MutationObserver | undefined;
    const cancel = () => {
      active = false;
      frame.cancel();
      observer?.disconnect();
      signal?.removeEventListener('abort', cancel);
    };
    cancelCurrent = cancel;
    signal?.addEventListener('abort', cancel, { once: true });
    const finish = (immediate = false) => {
      const deliver = () => {
        if (!active || signal?.aborted) return;
        cancel();
        untrack(callback);
      };
      if (immediate) deliver();
      else if (typeof input === 'function' ? batch : input.batch) queueMicrotask(deliver);
      else enqueueCompletion(deliver);
    };
    if (typeof node.getAnimations !== 'function' || (globalThis as typeof globalThis & { BASE_UI_ANIMATIONS_DISABLED?: boolean }).BASE_UI_ANIMATIONS_DISABLED) {
      finish(true);
      return;
    }
    const execute = () => {
      if (!active || signal?.aborted) return;
      Promise.all(getFiniteAnimations(node).map((animation) => animation.finished.then(() => undefined))).then(
        () => { if (active && !signal?.aborted) finish(); },
        () => {
          if (!active || signal?.aborted) return;
          if (getFiniteAnimations(node).some((animation) => animation.pending || animation.playState !== 'finished')) execute();
          else finish();
        },
      );
    };
    const waitForStarting = untrack(() => typeof input === 'function' ? (typeof wait === 'function' ? wait() : wait) : input.waitForStartingStyleRemoved?.() ?? false);
    if (waitForStarting && node.hasAttribute('data-starting-style')) {
      const Observer = node.ownerDocument.defaultView?.MutationObserver;
      if (Observer) {
        observer = new Observer(() => {
          if (!node.hasAttribute('data-starting-style')) { observer?.disconnect(); execute(); }
        });
        observer.observe(node, { attributes: true, attributeFilter: ['data-starting-style'] });
        return;
      }
    }
    frame.request(execute);
  };
  if (typeof input === 'function') return run;
  createEffect(() => ({ element: input.element(), enabled: input.enabled?.() ?? true, wait: input.waitForStartingStyleRemoved?.() ?? false }), (next) => {
    if (!next.enabled || !next.element) return;
    const controller = new AbortController();
    run(() => input.onFinished(), controller.signal);
    return () => controller.abort();
  });
}
export { createAnimationsFinished as useAnimationsFinished };
