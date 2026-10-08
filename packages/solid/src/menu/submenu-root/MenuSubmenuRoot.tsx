import { useContext } from 'solid-js';
import { MenuRootInternal, type MenuRoot } from '../root/MenuRoot';
import { useMenuRootContext } from '../root/MenuRootContext';
import { MenuFilterProviderContext } from '../filter-provider/MenuFilterProviderContext';
import { MenuSubmenuRootContext } from './MenuSubmenuRootContext';
export { useMenuSubmenuRootContext } from './MenuSubmenuRootContext';
export interface MenuSubmenuRootProps extends Omit<MenuRoot.Props, 'handle' | 'modal' | 'triggerId' | 'defaultTriggerId' | 'children'> { children?: import('@solidjs/web').JSX.Element }
export interface MenuSubmenuRootState {}
export function MenuSubmenuRootPlain(props: MenuSubmenuRootProps) {
  useMenuRootContext();
  return <MenuSubmenuRootContext value={{}}><MenuRootInternal {...props} isSubmenu /></MenuSubmenuRootContext>;
}
export function MenuSubmenuRoot(props: MenuSubmenuRootProps) {
  const filter = useContext(MenuFilterProviderContext);
  if (!filter) return <MenuSubmenuRootPlain {...props} />;
  return <MenuFilterProviderContext value={null}><filter.SubmenuRoot {...filter.options} {...props} /></MenuFilterProviderContext>;
}
export type MenuSubmenuRootChangeEventReason = MenuRoot.ChangeEventReason;
export type MenuSubmenuRootChangeEventDetails = MenuRoot.ChangeEventDetails;
export namespace MenuSubmenuRoot {
  export type Props = MenuSubmenuRootProps; export type State = MenuSubmenuRootState;
  export type ChangeEventReason = MenuSubmenuRootChangeEventReason; export type ChangeEventDetails = MenuSubmenuRootChangeEventDetails;
}
