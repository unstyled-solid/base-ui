import type { FieldValidityData } from '../contracts/field';
export const DEFAULT_VALIDITY_STATE: FieldValidityData['state'] = {
  badInput: false, customError: false, patternMismatch: false, rangeOverflow: false,
  rangeUnderflow: false, stepMismatch: false, tooLong: false, tooShort: false,
  typeMismatch: false, valid: null, valueMissing: false,
};
export const DEFAULT_FIELD_STATE_ATTRIBUTES = { valid: null, touched: false, dirty: false, filled: false, focused: false };
export const DEFAULT_FIELD_ROOT_STATE = { disabled: false, ...DEFAULT_FIELD_STATE_ATTRIBUTES };
export const fieldValidityMapping = {
  valid(value: boolean | null): Record<string, string> | null {
    return value === null ? null : value ? { 'data-valid': '' } : { 'data-invalid': '' };
  },
};
