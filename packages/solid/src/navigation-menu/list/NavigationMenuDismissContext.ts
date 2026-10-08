import { createContext, useContext } from 'solid-js';
import type { InteractionProps } from '../../floating-ui-react/hooks/createDismiss';
export const NavigationMenuDismissContext = createContext<InteractionProps | null>(null);
export function useNavigationMenuDismissContext() { return useContext(NavigationMenuDismissContext); }
