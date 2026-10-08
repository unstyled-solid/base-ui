import type { StateAttributesMapping, TransitionStatus } from '../../internals/types';
import { transitionStatusMapping } from '../../internals/stateAttributesMapping';
import { popupStateMapping } from '../../utils/popupStateMapping';

export const dialogStateAttributesMapping: StateAttributesMapping<{ open: boolean; transitionStatus: TransitionStatus; nested: boolean; nestedDialogOpen: boolean }> = {
  ...popupStateMapping,
  ...transitionStatusMapping,
  nestedDialogOpen: (value) => value ? { 'data-nested-dialog-open': '' } : null,
};
