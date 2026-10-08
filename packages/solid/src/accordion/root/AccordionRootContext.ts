import { createContext, useContext } from 'solid-js';
import type { AccordionRootChangeEventDetails, AccordionRootState, AccordionValue } from './AccordionRoot';

export interface AccordionRootContext<Value = any> {
  readonly state: AccordionRootState<Value>;
  readonly value: AccordionValue<Value>;
  readonly disabled: boolean;
  readonly hiddenUntilFound: boolean;
  readonly keepMounted: boolean;
  handleValueChange(value: Value, nextOpen: boolean, details: AccordionRootChangeEventDetails): void;
}
export const AccordionRootContext = createContext<AccordionRootContext>();
export function useAccordionRootContext() { return useContext(AccordionRootContext); }
