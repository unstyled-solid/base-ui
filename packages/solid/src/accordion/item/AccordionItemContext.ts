import { createContext, useContext } from 'solid-js';
import type { AccordionItemState } from './AccordionItem';

export interface AccordionItemContext {
  readonly state: AccordionItemState;
  readonly open: boolean;
  readonly defaultTriggerId: string;
  readonly triggerId: string | undefined;
  registerTrigger(id: string | undefined): () => void;
  registerPanel(id: string | undefined): () => void;
}
export const AccordionItemContext = createContext<AccordionItemContext>();
export function useAccordionItemContext() { return useContext(AccordionItemContext); }
