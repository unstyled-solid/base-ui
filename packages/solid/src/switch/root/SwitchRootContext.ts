import { createContext, useContext } from 'solid-js';
import type { SwitchRootState } from './SwitchRoot';
export type SwitchRootContext = SwitchRootState;
export const SwitchRootContext = createContext<SwitchRootContext>(undefined, { name: 'SwitchRootContext' });
export function useSwitchRootContext() { return useContext(SwitchRootContext); }
