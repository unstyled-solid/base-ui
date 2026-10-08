import { createContext, useContext } from 'solid-js';
import type { AnchorPositioningResult } from '../../internals/createAnchorPositioning';
export const MenuPositionerContext = createContext<AnchorPositioningResult>();
export function useMenuPositionerContext() { return useContext(MenuPositionerContext); }
