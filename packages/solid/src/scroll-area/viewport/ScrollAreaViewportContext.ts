import { createContext, useContext } from 'solid-js';
export interface ScrollAreaViewportContextValue {
  computeThumbPosition(): void;
  scheduleThumbPosition(): void;
}
export const ScrollAreaViewportContext = createContext<ScrollAreaViewportContextValue | null>(null);
export function useScrollAreaViewportContext() {
  const context = useContext(ScrollAreaViewportContext);
  if (!context) throw new Error('Base UI: ScrollAreaViewportContext missing. ScrollAreaViewport parts must be placed within <ScrollArea.Viewport>.');
  return context;
}
