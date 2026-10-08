import { createContext, useContext } from 'solid-js';
import type { JSX } from '@solidjs/web';
import type { OTPFieldRoot } from './OTPFieldRoot';

export interface OTPFieldAcceptedValue { readonly value: string; readonly token: number }
export interface OTPFieldRootContext {
  readonly activeIndex: number;
  readonly autoComplete: string;
  readonly disabled: boolean;
  readonly form: string | undefined;
  readonly inputMode: JSX.InputHTMLAttributes<HTMLInputElement>['inputmode'];
  readonly inputAriaLabelledBy: string | undefined;
  readonly invalid: boolean | undefined;
  readonly length: number;
  readonly mask: boolean;
  readonly pattern: string | undefined;
  readonly readOnly: boolean;
  readonly required: boolean;
  readonly normalizeValue: ((value: string) => string) | undefined;
  readonly state: OTPFieldRoot.State;
  readonly validationType: OTPFieldRoot.ValidationType;
  readonly value: string;
  focusInput(index: number): void;
  queueFocusInput(index: number, accepted: OTPFieldAcceptedValue): void;
  getInputId(index: number): string | undefined;
  handleInputBlur(event: FocusEvent): void;
  handleInputFocus(index: number, input: HTMLInputElement): void;
  reportValueInvalid(value: string, details: OTPFieldRoot.InvalidEventDetails): void;
  beginEdit(): void;
  setValue(value: string, details: OTPFieldRoot.ChangeEventDetails): OTPFieldAcceptedValue | null;
  setFocused(focused: boolean): void;
}

export const OTPFieldRootContext = createContext<OTPFieldRootContext>();
export function useOTPFieldRootContext() { return useContext(OTPFieldRootContext); }
