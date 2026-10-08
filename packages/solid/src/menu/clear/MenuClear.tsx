import { FilterDropdownClear, type FilterDropdownClearProps, type FilterDropdownClearState } from '../../filter-dropdown/clear/FilterDropdownClear';
import { useMenuFilterPart } from '../filter-root/MenuFilterContext';
export interface MenuClearProps extends FilterDropdownClearProps {}
export interface MenuClearState extends FilterDropdownClearState {}
export function MenuClear(props: MenuClearProps) { useMenuFilterPart('Clear'); return <FilterDropdownClear {...props} />; }
export namespace MenuClear { export type Props = MenuClearProps; export type State = MenuClearState }
