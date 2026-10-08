import { createContext, useContext, type Accessor } from 'solid-js';
import type { Orientation } from '../root/ScrollAreaRootContext';
export const ScrollAreaScrollbarContext = createContext<Accessor<Orientation> | null>(null);
export function useScrollAreaScrollbarContext() {
  const context = useContext(ScrollAreaScrollbarContext);
  if (!context) throw new Error('Base UI: ScrollAreaScrollbarContext is missing. ScrollAreaScrollbar parts must be placed within <ScrollArea.Scrollbar>.');
  return context;
}
