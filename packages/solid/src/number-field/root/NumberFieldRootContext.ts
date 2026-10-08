import { createContext, useContext, type Accessor } from 'solid-js';
import type { NumberFieldRoot, NumberFieldRootState } from './NumberFieldRoot';
import type { FieldRootContextValue } from '../../internals/field-root-context';
import type { FormContext } from '../../internals/contracts/field';

export type InputMode = 'numeric' | 'decimal' | 'text';
export type StepReason = 'keyboard' | 'increment-press' | 'decrement-press' | 'wheel' | 'scrub';
export interface ValueResult { accepted: boolean; changed: boolean; value: number | null }
export interface NumberFieldRootContext {
  readonly state: NumberFieldRootState;
  readonly id: string;
  readonly name: string | undefined;
  readonly nameProp: string | undefined;
  readonly min: number | undefined;
  readonly max: number | undefined;
  readonly minWithDefault: number;
  readonly maxWithDefault: number;
  readonly locale: Intl.LocalesArgument | undefined;
  readonly format: Intl.NumberFormatOptions | undefined;
  readonly inputMode: InputMode;
  readonly field: FieldRootContextValue | null;
  readonly form: FormContext | null;
  readonly input: Accessor<HTMLInputElement | null>;
  registerInput(element: HTMLInputElement | null): void;
  focusInput(): void;
  /** Synchronous transaction metadata, never a second controlled value. */
  manual: boolean;
  pendingCommit: boolean;
  lastChanged: number | null;
  blockRevalidation: boolean;
  numericValue(): number | null;
  text(): string;
  setText(text: string, numeric?: number | null): void;
  syncText(): void;
  setScrubbing(source: symbol, active: boolean): void;
  getAllowedNonNumericKeys(): Set<string>;
  getStepAmount(event?: { altKey?: boolean; shiftKey?: boolean }): number;
  setValue(value: number | null, details: NumberFieldRoot.ChangeEventDetails): ValueResult;
  increment(amount: number, direction: 1 | -1, details: NumberFieldRoot.ChangeEventDetails, currentValue?: number | null): ValueResult;
  commit(value: number | null, details: NumberFieldRoot.CommitEventDetails): void;
}
export const NumberFieldRootContext = createContext<NumberFieldRootContext>();
export function useNumberFieldRootContext() { return useContext(NumberFieldRootContext); }
