import { createContext, useContext } from 'solid-js';
export interface TabsListContext {
  readonly activateOnFocus: boolean;
  readonly tabsListElement: HTMLElement | null;
  registerIndicatorUpdateListener(listener: () => void): () => void;
  registerTabResizeObserverElement(element: HTMLElement): () => void;
}
export const TabsListContext = createContext<TabsListContext>();
export function useTabsListContext() { return useContext(TabsListContext); }
