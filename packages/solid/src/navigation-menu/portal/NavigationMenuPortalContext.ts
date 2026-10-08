import { createContext, useContext, type Accessor } from 'solid-js';
export const NavigationMenuPortalContext = createContext<Accessor<boolean> | null>(null);
export function useNavigationMenuPortalContext() {
  const context = useContext(NavigationMenuPortalContext);
  if (!context) throw new Error('Base UI: <NavigationMenu.Portal> is missing.');
  return context;
}
