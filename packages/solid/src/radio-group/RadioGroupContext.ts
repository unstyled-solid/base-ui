import { createContext, useContext } from 'solid-js';
import type { RadioGroupChangeEventDetails } from './RadioGroup';

/** Radio-specific input ownership; field validation owns its separate authoritative registry. */
export interface RadioInputRegistration {
  readonly input: HTMLInputElement;
  readonly control: HTMLElement | null;
  readonly value: unknown;
  readonly disabled: boolean;
}
export interface RadioGroupContextValue {
  readonly checkedValue: unknown;
  readonly disabled: boolean;
  readonly readOnly: boolean;
  readonly required: boolean;
  readonly name: string | undefined;
  readonly form: string | undefined;
  isSelected(value: unknown): boolean;
  setCheckedValue(value: unknown, details: RadioGroupChangeEventDetails): boolean;
  registerInput(source: symbol, registration: RadioInputRegistration): () => void;
  syncInputs(value: unknown): void;
}
export const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);
export function useRadioGroupContext() { return useContext(RadioGroupContext); }
