import { createContext } from 'solid-js';
import type { JSX } from '@solidjs/web';
import type { MenuRootProps } from '../root/MenuRoot';
import type { MenuFilterProviderOptions } from './MenuFilterProviderOptions';
import type { MenuSubmenuRootProps } from '../submenu-root/MenuSubmenuRoot';
export interface MenuFilterProviderContext {
  Root: <Payload>(props: MenuRootProps<Payload> & MenuFilterProviderOptions) => JSX.Element;
  SubmenuRoot: (props: MenuSubmenuRootProps & MenuFilterProviderOptions) => JSX.Element;
  options: MenuFilterProviderOptions;
}
export const MenuFilterProviderContext = createContext<MenuFilterProviderContext | null>(null);
