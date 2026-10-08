import { createContext, useContext, type Setter } from 'solid-js';
import type { FieldValidityData, FieldRegistration, FormValidationMode } from '../contracts/field';
import type { MutableCell } from '../contracts/core';
import type { HTMLProps } from '../types';
export interface FieldRootState { disabled: boolean; touched: boolean; dirty: boolean; valid: boolean | null; filled: boolean; focused: boolean }
export interface FieldValidation {
  getValidationProps(disabled: boolean): HTMLProps;
  getValidationProps<P extends object>(disabled: boolean, props: P): P;
  readonly inputRef: () => HTMLElement | null;
  readonly registeredInputs: Map<symbol, HTMLElement>;
   readonly registeredInputMetadata: Map<HTMLInputElement, RegisteredInput>;
   registerInput(source: symbol, element: HTMLElement | null, metadata?: RegisteredInput): () => void;
  getInputControl(): HTMLElement | null;
  commit(value: unknown): Promise<void>;
   change(value: unknown, cancelPending?: boolean): void;
}
export interface RegisteredInput { controlRef: () => HTMLElement | null; value?: string | undefined }
export interface FieldRootContextValue extends FieldRegistration {
  readonly invalid: boolean | undefined; readonly name: string | undefined;
  readonly validityData: FieldValidityData; setValidityData: Setter<FieldValidityData>;
  readonly disabled: boolean | undefined;
  setTouched: Setter<boolean>; setDirty: Setter<boolean>; setFilled: Setter<boolean>; setFocused: Setter<boolean>;
  readonly focusOwnerRef: MutableCell<unknown>;
  readonly validationMode: FormValidationMode;
  shouldValidateOnChange(): boolean;
  readonly state: FieldRootState;
  readonly validation: FieldValidation;
  validate(): void;
}
export const FieldRootContext = createContext<FieldRootContextValue | null>(null);
export function useFieldRootContext(optional?: true): FieldRootContextValue | null;
export function useFieldRootContext(optional: false): FieldRootContextValue;
export function useFieldRootContext(optional = true) {
  const value = useContext(FieldRootContext);
  if (!optional && !value) throw new Error('Base UI: Field parts need a Field.Root provider. Place the part inside Field.Root.');
  return value;
}
