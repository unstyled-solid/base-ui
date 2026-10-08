import { createContext, useContext, untrack } from 'solid-js';
import type { JSX } from '@solidjs/web';
import type { HTMLProps } from '../../internals/types';
import { useMenuRootContext } from '../root/MenuRootContext';
import type { MenuPopupProps } from '../popup/MenuPopup';
import type { MenuListProps } from '../list/MenuList';
import type { MenuGroupProps } from '../group/MenuGroup';
import type { MenuRadioGroupProps } from '../radio-group/MenuRadioGroup';
import type { MenuStore } from '../store/MenuStore';
import type { MenuParent } from '../root/MenuRoot';
export interface MenuFilterItemParams { label?: string; children?: JSX.Element; render?: unknown }
export interface MenuFilterItemResult { readonly visible: boolean; ref?: (element: HTMLElement | null) => void; props?: HTMLProps }
export interface MenuFilterImpl {
  Popup(props: MenuPopupProps): JSX.Element;
  List(props: MenuListProps): JSX.Element;
  Group(props: MenuGroupProps): JSX.Element;
  RadioGroup(props: MenuRadioGroupProps): JSX.Element;
  useItem(params: MenuFilterItemParams): MenuFilterItemResult;
  useSubmenuTrigger(params: MenuFilterItemParams): MenuFilterItemResult;
  useParentHandoff(store: MenuStore, parent: () => MenuParent, virtual: boolean): { getReturnElement?: () => HTMLElement | null; handleFocus?: () => void };
}
export const MenuFilterImplContext = createContext<MenuFilterImpl | null>(null);
export function useMenuFilterImpl(scope: 'root' | 'submenu-trigger' = 'root') {
  const impl = useContext(MenuFilterImplContext);
  const root = useMenuRootContext(true);
  // Focus engines are chosen for the mounted root's lifetime, not by filter
  // options such as query/autoHighlight, which remain live in those engines.
  return root && untrack(() => scope === 'submenu-trigger' ? root.virtualFocus || root.parentVirtualFocus : root.virtualFocus) ? impl : null;
}
export function useMenuFilterPart(part: string) {
  const impl = useMenuFilterImpl();
  if (!impl) throw new Error(`Base UI: <Menu.${part}> must be placed in a menu wrapped in <Menu.FilterProvider>. ` +
    'It reads the filter query and the matching items from the provider, which a plain menu ' +
    'does not have. Wrap the <Menu.Root> or <Menu.SubmenuRoot> it belongs to in ' +
    '<Menu.FilterProvider>. See https://base-ui.com/react/components/menu#filtering');
  return impl;
}
export function useMenuFilterItem(props: MenuFilterItemParams, scope: 'root' | 'submenu-trigger' = 'root'): MenuFilterItemResult {
  const impl = useMenuFilterImpl(scope);
  return (scope === 'submenu-trigger' ? impl?.useSubmenuTrigger(props) : impl?.useItem(props)) ?? { visible: true };
}
