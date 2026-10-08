import { transitionStatusMapping } from '../../internals/stateAttributesMapping';
export { popupTransitionStateMapping as popupMapping, triggerOpenStateMapping as triggerMapping, pressableTriggerOpenStateMapping as pressableTriggerMapping } from '../../utils/popupStateMapping';
export const itemMapping = {
  checked: (checked: boolean) => ({ [checked ? 'data-checked' : 'data-unchecked']: '' }),
  ...transitionStatusMapping,
};
