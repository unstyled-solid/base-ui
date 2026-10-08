import { createContext, useContext } from 'solid-js';
export const PopoverPortalContext = createContext<{ readonly keepMounted: boolean } | null>(null);
export function usePopoverPortalContext() {
  const context = useContext(PopoverPortalContext);
  if (!context) throw new Error('Base UI: <Popover.Portal> is missing.');
  return context;
}
