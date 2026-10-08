import { createEffect, untrack, type Accessor } from 'solid-js';
import { createAnimationsFinished } from './createAnimationsFinished';
type LiveBoolean = boolean | Accessor<boolean>;
function read(value: LiveBoolean | undefined, fallback: boolean): boolean { return typeof value === 'function' ? value() : value ?? fallback; }
export interface UseOpenChangeCompleteParameters {
  enabled?: LiveBoolean | undefined;
  open?: LiveBoolean | undefined;
  ref: Accessor<HTMLElement | null>;
  batch?: boolean | undefined;
  onComplete: () => void;
}
export function createOpenChangeComplete(params: UseOpenChangeCompleteParameters): void {
  const run = createAnimationsFinished(params.ref, () => read(params.open, false), params.batch);
  createEffect(() => ({ enabled: read(params.enabled, true), open: read(params.open, false), element: params.ref() }), (next) => {
    if (!next.enabled || !next.element) return;
    const controller = new AbortController();
    run(() => {
      // Earlier terminal effects may have staged a reopen/ref replacement in
      // this flush. Deliver after that native checkpoint and reject the stale
      // cycle even when missing/disabled animations finished synchronously.
      queueMicrotask(() => {
        if (controller.signal.aborted) return;
        const current = untrack(() => ({ enabled: read(params.enabled, true), open: read(params.open, false), element: params.ref() }));
        if (!current.enabled || current.open !== next.open || current.element !== next.element) return;
        untrack(() => params.onComplete());
      });
    }, controller.signal);
    return () => controller.abort();
  });
}
export { createOpenChangeComplete as useOpenChangeComplete };
export interface UseOpenChangeCompleteState {}
