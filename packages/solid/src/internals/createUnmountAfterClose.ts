import { createEffect, createSignal, untrack, type Accessor } from 'solid-js';
import { createTransitionStatus } from './createTransitionStatus';
import { createOpenChangeComplete } from './createOpenChangeComplete';
export interface UseUnmountAfterCloseParameters {
  open: Accessor<boolean>; ref: Accessor<HTMLElement | null>;
  preventUnmountOnClose: Accessor<boolean>; setPreventUnmountOnClose(value: boolean): void;
  onUnmount(): void; animateInitialOpen?: boolean | undefined;
}
export function createUnmountAfterClose(params: UseUnmountAfterCloseParameters) {
  const status = createTransitionStatus(params.open, () => false, () => false, params.animateInitialOpen);
  const [pending, setPending] = createSignal(false);
  let completed = false;
  const unmount = () => {
    if (completed || !untrack(() => status.mounted)) return;
    completed = true; status.setMounted(false); untrack(() => params.onUnmount());
  };
  createEffect(() => ({ open: params.open(), mounted: status.mounted, pending: pending() }), (next) => {
    if (next.open) { completed = false; untrack(() => params.setPreventUnmountOnClose(false)); }
    if (next.pending) { setPending(false); if (!next.open && next.mounted) unmount(); }
  });
  const forceUnmount = () => {
    if (untrack(params.open)) { setPending(true); return; }
    unmount();
  };
  createOpenChangeComplete({ enabled: () => status.mounted && !params.open() && !params.preventUnmountOnClose(), open: params.open, ref: params.ref,
    onComplete() { if (!untrack(params.open)) forceUnmount(); } });
  return { get mounted() { return status.mounted; }, get transitionStatus() { return status.transitionStatus; },
    get preventUnmountingOnClose() { return !params.open() && params.preventUnmountOnClose(); }, forceUnmount, setMounted: status.setMounted };
}
export { createUnmountAfterClose as useUnmountAfterClose };
