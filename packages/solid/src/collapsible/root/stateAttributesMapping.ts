import type { StateAttributesMapping } from '../../internals/getStateAttributesProps';
import { transitionStatusMapping } from '../../internals/stateAttributesMapping';
import type { CollapsibleRootState } from './CollapsibleRoot';

export const collapsibleStateAttributesMapping: StateAttributesMapping<CollapsibleRootState> = {
  open: (open) => ({ [open ? 'data-open' : 'data-closed']: '' }),
  ...transitionStatusMapping,
};
export const triggerStateAttributesMapping: StateAttributesMapping<CollapsibleRootState> = {
  open: (open) => open ? { 'data-panel-open': '' } : null,
  ...transitionStatusMapping,
};
