import type { FloatingRootContext, FloatingRootState, TriggerLookup } from '../../internals/contracts/floating';
import type { ChangeEventDetails } from '../../internals/contracts/events';
import { createSignal, onCleanup, untrack } from 'solid-js';
import { createEventEmitter } from '../utils/createEventEmitter';
import type { FloatingUIOpenChangeDetails } from '../../internals/contracts/events';
import { isClickLikeEvent } from '../utils/event';
export interface FloatingRootOptions { state: FloatingRootState; nested?: boolean | undefined; triggerElements?: TriggerLookup | undefined; syncOnly?: boolean | undefined; onOpenChange?(open: boolean, details: ChangeEventDetails): void }
export function createFloatingRoot(options: FloatingRootOptions): FloatingRootContext {
  // A reset to the DOM anchor selects a live source, not an effect-mirrored
  // element snapshot. Cursor references remain explicit imperative overrides.
  const [positionReference, setPositionReference] = createSignal<import('../../internals/contracts/floating').ReferenceType | 'dom' | null>(null);
  const readPositionReference = () => {
    const reference = positionReference();
    return reference === 'dom' ? options.state.domReferenceElement : reference;
  };
  const events = createEventEmitter<{ openchange: FloatingUIOpenChangeDetails }>();
  const data: FloatingRootContext['data'] = {};
  const triggers: TriggerLookup = { size: 0, getById: () => undefined, hasElement: () => false, hasMatchingElement: () => false, entries: function* () {}, elements: function* () {} };
  let disposed = false;
  let pendingOpen: { value: boolean; generation: number } | undefined;
  let transactionGeneration = 0;
  onCleanup(() => { disposed = true; events.clear(); data.openEvent = undefined; });
  const state: FloatingRootState = {
    get open() { return options.state.open; }, get transitionStatus() { return options.state.transitionStatus; },
    get domReferenceElement() { return options.state.domReferenceElement; },
    get referenceElement() { return readPositionReference() ?? options.state.positionReference ?? options.state.referenceElement; },
    get positionReference() { return readPositionReference() ?? options.state.positionReference; },
    get floatingElement() { return options.state.floatingElement; }, get floatingId() { return options.state.floatingId; },
  };
  const context: FloatingRootContext = {
    state, data, events, setPositionReference: (value) => {
      const next = value !== null && value === untrack(() => options.state.domReferenceElement) ? 'dom' : value;
      setPositionReference(() => next);
    },
    get nested() { return options.nested ?? false; },
    get triggerElements() { return options.triggerElements ?? triggers; },
    setOpen(next, details) {
      if (disposed) return;
      untrack(() => {
        options.onOpenChange?.(next, details);
        if (!options.syncOnly && !details.isCanceled) context.dispatchOpenChange(next, details);
      });
    },
    dispatchOpenChange(next, details) {
      if (disposed || details.isCanceled) return;
      untrack(() => {
        const currentOpen = pendingOpen?.value ?? state.open;
        if (!next || !currentOpen || isClickLikeEvent(details.event)) data.openEvent = next ? details.event : undefined;
        const generation = ++transactionGeneration;
        pendingOpen = { value: next, generation };
        // Popup publishes its accepted state after this dispatch. Expire the
        // imperative proposal after that staged commit checkpoint, so an older
        // hover completion cannot overwrite a same-turn click-open provenance.
        queueMicrotask(() => queueMicrotask(() => { if (pendingOpen?.generation === generation) pendingOpen = undefined; }));
        events.emit('openchange', { open: next, reason: details.reason, nativeEvent: details.event, nested: context.nested, triggerElement: details.trigger });
      });
    },
  };
  return context;
}
