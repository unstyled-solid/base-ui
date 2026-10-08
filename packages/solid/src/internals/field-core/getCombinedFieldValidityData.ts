import type { FieldValidityData } from '../contracts/field';
export function getCombinedFieldValidityData(data: FieldValidityData, invalid: boolean | undefined): FieldValidityData {
  return { ...data, state: { ...data.state, valid: !invalid && data.state.valid } };
}
