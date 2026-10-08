import type { ElementAccessor } from './core';

export type FormValidationMode = 'onSubmit' | 'onBlur' | 'onChange';
export type FormErrors = Record<string, string | string[]>;
export type FormValues = Record<string, unknown>;
export interface FieldValidityData {
  state: { -readonly [K in Exclude<keyof ValidityState, 'valid'>]: boolean } & { valid: boolean | null };
  error: string;
  errors: string[];
  value: unknown;
  initialValue: unknown;
}
export type FieldValidator = (value: unknown, formValues: FormValues) =>
  string | string[] | null | void | Promise<string | string[] | null | void>;
export interface FieldControlRegistration {
  controlRef: ElementAccessor;
  id: string | undefined;
  name?: string | undefined;
  getValue?: (() => unknown) | undefined;
  value: unknown;
}
export interface FormFieldRegistration {
  name: string | undefined;
  /** Synchronous verdict reaches the registry before return; async work does not block submit. */
  validate(): void;
  validityData: FieldValidityData;
  controlRef: ElementAccessor;
  getValue(): unknown;
}
export interface FieldRegistration {
  /** Same source updates in place. Undefined removes only that source's registration. */
  registerFieldControl(source: symbol, registration: FieldControlRegistration | undefined): void;
}
export interface FormContext {
  readonly errors: FormErrors;
  clearErrors(name: string | undefined): void;
  readonly elementRef: ElementAccessor<HTMLFormElement>;
  /** Plain live Map: synchronous validation/registration never reads a staged store. */
  readonly fields: Map<string, FormFieldRegistration>;
  readonly validationMode: FormValidationMode;
  readonly submitCount: number;
}
