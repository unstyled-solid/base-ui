import { createContext, useContext } from 'solid-js';
import type { ToggleGroupChangeEventDetails } from './ToggleGroup';

export interface ToggleGroupContext<Value extends string = string> {
  readonly value: readonly Value[];
  readonly disabled: boolean;
  /** Whether either raw value prop is defined, including an empty array. */
  readonly isValueInitialized: boolean;
  setGroupValue(value: Value, nextPressed: boolean, details: ToggleGroupChangeEventDetails): void;
}

export const ToggleGroupContext = createContext<ToggleGroupContext | null>(null);

export function useToggleGroupContext<Value extends string = string>() {
  return useContext(ToggleGroupContext) as ToggleGroupContext<Value> | null;
}
