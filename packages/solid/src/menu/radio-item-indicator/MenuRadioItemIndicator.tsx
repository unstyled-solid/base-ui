import { useMenuRadioItemContext } from '../radio-item/MenuRadioItemContext';
import { createIndicator, type MenuIndicatorState, type MenuIndicatorProps } from '../utils/createIndicator';
export interface MenuRadioItemIndicatorState extends MenuIndicatorState {}
export interface MenuRadioItemIndicatorProps extends MenuIndicatorProps {}
export function MenuRadioItemIndicator(props: MenuRadioItemIndicatorProps) { return createIndicator(props, useMenuRadioItemContext()); }
export namespace MenuRadioItemIndicator { export type Props = MenuRadioItemIndicatorProps; export type State = MenuRadioItemIndicatorState }
