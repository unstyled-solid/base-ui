import { createContext, useContext, type Setter } from 'solid-js';

export interface MeterRootContext {
  readonly formattedValue: string;
  readonly percentageValue: number;
  readonly value: number;
  setLabelId: Setter<string | undefined>;
}

export const MeterRootContext = createContext<MeterRootContext>(undefined, { name: 'MeterRootContext' });
export function useMeterRootContext() {
  return useContext(MeterRootContext);
}
