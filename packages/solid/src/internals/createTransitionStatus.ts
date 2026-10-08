import { createEffect, createMemo, createSignal, type Accessor, type Setter } from 'solid-js';
import type { TransitionStatus } from './contracts/core';
import { createAnimationFrame } from '../utils/createAnimationFrame';
export type { TransitionStatus } from './contracts/core';
export interface TransitionStatusResult { readonly mounted: boolean; readonly transitionStatus: TransitionStatus; setMounted: Setter<boolean> }
/** Getter-backed result, not accessor-valued fields. All inputs remain live. */
export function createTransitionStatus(open: Accessor<boolean>, enableIdleState: Accessor<boolean> = () => false, deferEndingState: Accessor<boolean> = () => false, animateInitialOpen = false): TransitionStatusResult {
  const frame = createAnimationFrame();
  const [manual, setManual] = createSignal<{ value: boolean } | undefined>(undefined);
  const [tick, setTick] = createSignal(0);
  interface Snapshot { open: boolean; mounted: boolean; status: TransitionStatus; manual: ReturnType<typeof manual>; tick: number; pending: boolean }
  const snapshot = createMemo<Snapshot>((previous) => {
    const isOpen = open(), idle = enableIdleState(), defer = deferEndingState();
    const request = manual(), frameTick = tick();
    let mounted = previous?.mounted ?? isOpen;
    let status = previous?.status;
    let pending = false;
    if (!previous) status = isOpen ? animateInitialOpen ? 'starting' : idle ? 'idle' : undefined : undefined;
    if (request !== previous?.manual && request) mounted = request.value;
    if (isOpen && !mounted) { mounted = true; status = 'starting'; }
    if (previous && isOpen !== previous.open) {
      if (isOpen) status = idle || !mounted ? 'starting' : status;
      else if (mounted && !defer) status = 'ending';
    }
    if (!isOpen && mounted && status !== 'ending') {
      if (!defer || (previous?.pending && frameTick !== previous.tick)) status = 'ending';
      else pending = true;
    }
    if (!isOpen && !mounted) status = undefined;
    if (isOpen && previous && frameTick !== previous.tick) status = idle ? 'idle' : undefined;
    if (isOpen && status !== (idle ? 'idle' : undefined)) pending = true;
    // An upstream selection/props record may change without changing this
    // transition. Retain the entire state-machine snapshot only when every
    // field is identical, including the consumed manual request and frame tick.
    if (previous && previous.open === isOpen && previous.mounted === mounted &&
      previous.status === status && previous.manual === request &&
      previous.tick === frameTick && previous.pending === pending) return previous;
    return { open: isOpen, mounted, status, manual: request, tick: frameTick, pending };
  });
  interface FrameState { open: boolean; pending: boolean; status: TransitionStatus }
  const frameState = createMemo<FrameState>((previous) => {
    const current = snapshot();
    // Internal bookkeeping can change without changing the scheduled phase.
    // In that case keep its existing frame rather than canceling/restarting it.
    if (previous && previous.open === current.open && previous.pending === current.pending &&
      previous.status === current.status) return previous;
    return { open: current.open, pending: current.pending, status: current.status };
  });
  createEffect(frameState, (next) => {
    if (!next.pending) return;
    // Let starting state reach first paint before its staged clear.
    if (next.open && next.status === 'starting') frame.request(() => frame.request(() => setTick((value) => value + 1)));
    else frame.request(() => setTick((value) => value + 1));
    return frame.cancel;
  });
  const setMounted = ((value: boolean | ((previous: boolean) => boolean)) => {
    setManual((previous) => ({ value: typeof value === 'function' ? value(previous?.value ?? snapshot().mounted) : value }));
  }) as Setter<boolean>;
  return { get mounted() { return snapshot().mounted; }, get transitionStatus() { return snapshot().status; }, setMounted };
}
export { createTransitionStatus as useTransitionStatus };
