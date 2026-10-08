import { SelectScrollArrow } from '../scroll-arrow/SelectScrollArrow';
import type { BaseUIComponentProps } from '../../internals/types';
export function SelectScrollUpArrow(props: SelectScrollUpArrowProps) { return <SelectScrollArrow {...props} direction="up" />; }
export interface SelectScrollUpArrowProps extends BaseUIComponentProps<'div', SelectScrollUpArrowState> { keepMounted?: boolean }
export interface SelectScrollUpArrowState {}
export namespace SelectScrollUpArrow { export type Props = SelectScrollUpArrowProps; export type State = SelectScrollUpArrowState }
