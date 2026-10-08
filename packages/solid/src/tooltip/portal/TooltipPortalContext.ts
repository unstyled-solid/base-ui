import { createContext, useContext, type Accessor } from 'solid-js';

export const TooltipPortalContext = createContext<Accessor<boolean> | null>(null);
export function useTooltipPortalContext() {
  const context = useContext(TooltipPortalContext);
  if (!context) throw new Error('Base UI: <Tooltip.Portal> is missing. Place the positioner within <Tooltip.Portal>.');
  return context;
}
