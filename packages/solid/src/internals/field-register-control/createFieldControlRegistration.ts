import type { FieldRootContextValue } from '../field-root-context';
/** The one field engine owns registration; this seam binds its current operations. */
export function createFieldControlRegistration(field: FieldRootContextValue) {
  return [() => field.validate(), (source: symbol, registration: Parameters<FieldRootContextValue['registerFieldControl']>[1]) => field.registerFieldControl(source, registration)] as const;
}
export type UseFieldControlRegistrationParameters = FieldRootContextValue;
export { createFieldControlRegistration as useFieldControlRegistration };
