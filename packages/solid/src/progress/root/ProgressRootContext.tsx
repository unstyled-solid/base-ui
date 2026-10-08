import { createContext, useContext, type Setter } from 'solid-js';
import type { ProgressRootState } from './ProgressRoot';

export interface ProgressRootContext {
  formattedValue: string;
  percentageValue: number | null;
  value: number | null;
  setLabelId: Setter<string | undefined>;
  state: ProgressRootState;
}
export const ProgressRootContext = createContext<ProgressRootContext | null>(null);
export function useProgressRootContext() {
  const context = useContext(ProgressRootContext);
  if (!context) throw new Error('Base UI: ProgressRootContext is missing. Progress parts must be placed within <Progress.Root>.');
  return context;
}
