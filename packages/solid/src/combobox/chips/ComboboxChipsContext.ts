import { createContext, useContext } from 'solid-js';
export interface ComboboxChipsContext {
  readonly highlightedChipIndex: number | undefined;
  setHighlightedChipIndex(index: number | undefined): void;
  chipsRef: { current: (HTMLElement | null)[] };
}
export const ComboboxChipsContext = createContext<ComboboxChipsContext | null>(null);
export const useComboboxChipsContext = () => useContext(ComboboxChipsContext);
