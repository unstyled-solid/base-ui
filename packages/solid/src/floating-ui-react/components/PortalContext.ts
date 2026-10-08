import { createContext, useContext } from 'solid-js';
import type { PortalContext as PortalContextValue } from '../../internals/contracts/portal';
export type { PortalContextValue };
export const PortalContext = createContext<PortalContextValue | null>(null);
export function usePortalContext(): PortalContextValue | null { return useContext(PortalContext); }
