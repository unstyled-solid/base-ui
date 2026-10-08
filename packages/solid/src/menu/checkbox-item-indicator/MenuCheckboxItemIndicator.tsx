import { useMenuCheckboxItemContext } from '../checkbox-item/MenuCheckboxItemContext';
import { createIndicator, type MenuIndicatorState, type MenuIndicatorProps } from '../utils/createIndicator';
export interface MenuCheckboxItemIndicatorState extends MenuIndicatorState {}
export interface MenuCheckboxItemIndicatorProps extends MenuIndicatorProps {}
export function MenuCheckboxItemIndicator(props: MenuCheckboxItemIndicatorProps) { return createIndicator(props, useMenuCheckboxItemContext()); }
export namespace MenuCheckboxItemIndicator { export type Props = MenuCheckboxItemIndicatorProps; export type State = MenuCheckboxItemIndicatorState }
