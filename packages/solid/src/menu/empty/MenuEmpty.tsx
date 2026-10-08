import { FilterDropdownEmpty, type FilterDropdownEmptyProps, type FilterDropdownEmptyState } from '../../filter-dropdown/empty/FilterDropdownEmpty';
import { useMenuFilterPart } from '../filter-root/MenuFilterContext';
export interface MenuEmptyProps extends FilterDropdownEmptyProps {}
export interface MenuEmptyState extends FilterDropdownEmptyState {}
export function MenuEmpty(props: MenuEmptyProps) { useMenuFilterPart('Empty'); return <FilterDropdownEmpty {...props} />; }
export namespace MenuEmpty { export type Props = MenuEmptyProps; export type State = MenuEmptyState }
