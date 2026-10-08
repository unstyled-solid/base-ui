import { transitionStatusMapping } from '../../internals/stateAttributesMapping';
import { fieldValidityMapping } from '../../internals/field-constants/constants';

export const stateAttributesMapping = {
  checked: (value: boolean) => value ? { 'data-checked': '' } : { 'data-unchecked': '' },
  ...transitionStatusMapping,
  ...fieldValidityMapping,
};
