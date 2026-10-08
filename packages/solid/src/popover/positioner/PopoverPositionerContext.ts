import { createContext, useContext } from 'solid-js';
import type { AnchorPositioningResult } from '../../internals/createAnchorPositioning';
export const PopoverPositionerContext = createContext<AnchorPositioningResult | null>(null);
export function usePopoverPositionerContext() {
  const context = useContext(PopoverPositionerContext);
  if (!context) throw new Error('Base UI: PopoverPositionerContext is missing. PopoverPositioner parts must be placed within <Popover.Positioner>.');
  return context;
}
