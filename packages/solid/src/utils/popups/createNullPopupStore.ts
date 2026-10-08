import type { PopupModel } from './createPopup';
import { PopupTriggerMap } from './popupTriggerMap';
import type { PopupState } from '../../internals/contracts/popup';
import type { FloatingRootContext } from '../../internals/contracts/floating';
import { createEventEmitter } from '../../floating-ui-react/utils/createEventEmitter';
export function createNullPopupStore<Payload = unknown>(): PopupModel<Payload> {
  const triggers = new PopupTriggerMap();
  const floating: FloatingRootContext = {
    state: { open: false, transitionStatus: undefined, domReferenceElement: null, referenceElement: null, positionReference: null, floatingElement: null, floatingId: undefined },
    nested: false, triggerElements: triggers, events: createEventEmitter(), data: {}, setOpen() {}, dispatchOpenChange() {},
  };
  const state: PopupState<Payload> = {
    open: false, openProp: undefined, mounted: false, transitionStatus: undefined, floatingRootContext: floating, floatingId: undefined,
    triggerCount: 0, preventUnmountingOnClose: false, payload: undefined, activeTriggerId: null, activeTriggerElement: null,
    openedWithoutTrigger: false, triggerIdProp: undefined, popupElement: null, positionerElement: null,
    activeTriggerProps: {}, inactiveTriggerProps: {}, popupProps: {},
  };
  return { state, context: { triggerElements: triggers, popupRef: () => null, onOpenChangeComplete: undefined,
    beforeTriggerFocusGuardRef: { current: null }, beforeContentFocusGuardRef: { current: null }, triggerFocusTargetRef: { current: null } },
    setOpen() {}, setPopupElement() {}, setPositionerElement() {}, setMounted() {}, forceUnmount() {}, setPayload() {}, setFloatingId() {}, setInteractionProps() {},
    requestOpen: (nextValue) => ({ accepted: false, nextValue }),
    getTriggerData: () => undefined,
    getCurrentTrigger: () => null,
    registerTrigger(id, element) { triggers.add(id, element); return () => { if (triggers.getById(id) === element) triggers.delete(id); }; },
  };
}
