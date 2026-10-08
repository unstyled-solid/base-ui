import type { FloatingRootContext, FloatingUIOpenChangeDetails } from '../../internals/types';
import { createEventEmitter } from './createEventEmitter';
export function getEmptyRootContext(): FloatingRootContext {
  return {
    state: { open: false, transitionStatus: undefined, domReferenceElement: null, referenceElement: null, positionReference: null, floatingElement: null, floatingId: undefined },
    nested: false, triggerElements: { size: 0, getById: () => undefined, hasElement: () => false, hasMatchingElement: () => false, entries: function* () {}, elements: function* () {} },
    events: createEventEmitter<{ openchange: FloatingUIOpenChangeDetails }>(), data: {}, setOpen() {}, dispatchOpenChange() {},
  };
}
