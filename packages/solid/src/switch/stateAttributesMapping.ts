import type { StateAttributesMapping } from '../internals/getStateAttributesProps';
import type { SwitchRootState } from './root/SwitchRoot';
import { fieldValidityMapping } from '../internals/field-constants/constants';
export const stateAttributesMapping: StateAttributesMapping<SwitchRootState> = {
  ...fieldValidityMapping,
  checked: (value) => ({ [value ? 'data-checked' : 'data-unchecked']: '' }),
};
