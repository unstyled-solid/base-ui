import { createContext, useContext } from 'solid-js';
import type { AnchorPositioningResult } from '../../internals/createAnchorPositioning';

export const TooltipPositionerContext = createContext<AnchorPositioningResult | null>(null);
export function useTooltipPositionerContext() {
  const context = useContext(TooltipPositionerContext);
  if (!context) {
    throw new Error('Base UI: TooltipPositionerContext is missing. TooltipPositioner parts must be placed within <Tooltip.Positioner>.');
  }
  return context;
}
