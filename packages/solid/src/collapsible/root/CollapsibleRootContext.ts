import { createContext, useContext } from 'solid-js';
import type { UseCollapsibleRootReturnValue } from './createCollapsibleRoot';
import type { CollapsibleRootState, CollapsibleRootChangeEventDetails } from './CollapsibleRoot';

export interface CollapsibleRootContext extends UseCollapsibleRootReturnValue {
  onOpenChange(open: boolean, details: CollapsibleRootChangeEventDetails): void;
  readonly state: CollapsibleRootState;
}
export const CollapsibleRootContext = createContext<CollapsibleRootContext>();
export function useCollapsibleRootContext() { return useContext(CollapsibleRootContext); }
