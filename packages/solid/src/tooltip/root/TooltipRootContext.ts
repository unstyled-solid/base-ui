import { createContext, useContext } from 'solid-js';
import type { TooltipStore } from '../store/TooltipStore';

export const TooltipRootContext = createContext<TooltipStore | null>(null);
export function useTooltipRootContext(optional: true): TooltipStore | null;
export function useTooltipRootContext(optional?: false): TooltipStore;
export function useTooltipRootContext(optional = false) {
  const context = useContext(TooltipRootContext);
  if (!context && !optional) {
    throw new Error('Base UI: TooltipRootContext is missing. Tooltip parts must be placed within <Tooltip.Root>.');
  }
  return context;
}
