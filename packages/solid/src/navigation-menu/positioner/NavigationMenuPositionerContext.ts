import { createContext, useContext } from 'solid-js';
import type { AnchorPositioningResult } from '../../internals/createAnchorPositioning';
export const NavigationMenuPositionerContext = createContext<AnchorPositioningResult | null>(null);
export function useNavigationMenuPositionerContext(optional: true): AnchorPositioningResult | null;
export function useNavigationMenuPositionerContext(optional?: false): AnchorPositioningResult;
export function useNavigationMenuPositionerContext(optional = false) {
  const value = useContext(NavigationMenuPositionerContext);
  if (!value && !optional) throw new Error('Base UI: NavigationMenuPositionerContext is missing. NavigationMenuPositioner parts must be placed within <NavigationMenu.Positioner>.');
  return value;
}
