import type { StateAttributesMapping } from '../../internals/getStateAttributesProps';
import { fieldValidityMapping } from '../../internals/field-constants/constants';
import type { CheckboxRootState } from '../root/CheckboxRoot';

export function getCheckboxStateAttributesMapping(state: CheckboxRootState): StateAttributesMapping<CheckboxRootState> {
  return {
    checked(value) {
      if (state.indeterminate) return {};
      return value ? { 'data-checked': '' } : { 'data-unchecked': '' };
    },
    ...fieldValidityMapping,
  };
}
