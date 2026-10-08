import { createContext, useContext } from 'solid-js';
import type { FormContext as FormContextValue } from '../contracts/field';
export type { FormContextValue };
export type { FormErrors as Errors, FormValidationMode, FormValues } from '../contracts/field';
export const FormContext = createContext<FormContextValue | null>(null);
export function useFormContext() { return useContext(FormContext); }
