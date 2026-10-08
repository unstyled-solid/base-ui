import { createContext, useContext } from 'solid-js';
export interface CompositeRootContextValue {
  readonly highlightedIndex: number;
  readonly highlightItemOnHover: boolean;
  onHighlightedIndexChange(index: number): void;
  relayKeyboardEvent(event: KeyboardEvent): void;
}
export const CompositeRootContext = createContext<CompositeRootContextValue | null>(null);
export function useCompositeRootContext(optional?: false): CompositeRootContextValue;
export function useCompositeRootContext(optional: true): CompositeRootContextValue | null;
export function useCompositeRootContext(optional = false): CompositeRootContextValue | null {
  const context = useContext(CompositeRootContext);
  if (!context && !optional) throw new Error('Base UI: CompositeItem requires a CompositeRoot. Place the item inside a CompositeRoot.');
  return context;
}
