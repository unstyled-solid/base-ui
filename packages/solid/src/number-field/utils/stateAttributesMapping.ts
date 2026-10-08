import type { StateAttributesMapping } from '../../internals/getStateAttributesProps';
import type { NumberFieldRootState } from '../root/NumberFieldRoot';
import { fieldValidityMapping } from '../../internals/field-constants/constants';

export const stateAttributesMapping: StateAttributesMapping<NumberFieldRootState> = {
  value: null,
  inputValue: null,
  ...fieldValidityMapping,
};
