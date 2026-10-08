import { createContext, useContext } from 'solid-js';
import type { AnchorPositioningResult } from '../../internals/createAnchorPositioning';
export const ToastPositionerContext = createContext<AnchorPositioningResult>();
export function useToastPositionerContext() { return useContext(ToastPositionerContext); }
