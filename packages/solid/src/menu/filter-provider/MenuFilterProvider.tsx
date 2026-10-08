import type { JSX } from '@solidjs/web';
import { MenuFilterRoot } from '../filter-root/MenuFilterRoot';
import { MenuFilterSubmenuRoot } from '../filter-submenu-root/MenuFilterSubmenuRoot';
import { MenuFilterProviderContext } from './MenuFilterProviderContext';
import type { MenuFilterProviderOptions } from './MenuFilterProviderOptions';
import type { FilterDropdownRootChangeEventReason, FilterDropdownRootChangeEventDetails } from '../../filter-dropdown/root/FilterDropdownRootContext';
export interface MenuFilterProviderState {}
export interface MenuFilterProviderProps extends MenuFilterProviderOptions { children?: JSX.Element }
export function MenuFilterProvider(props: MenuFilterProviderProps) {
  const options: MenuFilterProviderOptions = {
    get filter() { return props.filter; }, get value() { return props.value; },
    get defaultValue() { return props.defaultValue; }, get onValueChange() { return props.onValueChange; },
    get autoHighlight() { return props.autoHighlight; }, get locale() { return props.locale; },
  };
  return <MenuFilterProviderContext value={{ Root: MenuFilterRoot, SubmenuRoot: MenuFilterSubmenuRoot, options }}>{props.children}</MenuFilterProviderContext>;
}
export type MenuFilterProviderChangeEventReason = FilterDropdownRootChangeEventReason;
export type MenuFilterProviderChangeEventDetails = FilterDropdownRootChangeEventDetails;
export namespace MenuFilterProvider {
  export type Props = MenuFilterProviderProps; export type State = MenuFilterProviderState;
  export type ChangeEventReason = MenuFilterProviderChangeEventReason;
  export type ChangeEventDetails = MenuFilterProviderChangeEventDetails;
}
