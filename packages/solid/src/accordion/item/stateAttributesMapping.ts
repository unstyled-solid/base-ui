import type { StateAttributesMapping } from '../../internals/getStateAttributesProps';
import { transitionStatusMapping } from '../../internals/stateAttributesMapping';
import type { AccordionItemState } from './AccordionItem';

export const accordionStateAttributesMapping: StateAttributesMapping<AccordionItemState> = {
  open: (open): Record<string, string> => open ? { 'data-open': '' } : { 'data-closed': '' },
  index: (index) => ({ 'data-index': String(index) }),
  ...transitionStatusMapping,
  value: null,
};
