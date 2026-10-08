import { createContext, useContext, type Setter } from 'solid-js';
import type { HTMLProps } from '../types';
export interface LabelableContextValue {
  readonly controlId: string | null | undefined;
  registerControlId(source: symbol, id: string | null | undefined): void;
  resetControlId(): void;
  readonly labelId: string | undefined;
  setLabelId: Setter<string | undefined>;
  readonly messageIds: string[];
  setMessageIds: Setter<string[]>;
  getDescriptionProps<P extends object>(externalProps: P): P & { 'aria-describedby'?: string | undefined };
}
export const LabelableContext = createContext<LabelableContextValue | null>(null);
export function useLabelableContext() { return useContext(LabelableContext); }
