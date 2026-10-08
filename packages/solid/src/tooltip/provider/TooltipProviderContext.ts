import { createContext, useContext, type Accessor } from 'solid-js';

export const TooltipProviderContext = createContext<Accessor<number | undefined> | null>(null);
export function useTooltipProviderContext() {
  return useContext(TooltipProviderContext);
}
