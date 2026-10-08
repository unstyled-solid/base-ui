import { SelectScrollArrow } from '../scroll-arrow/SelectScrollArrow';
import type { BaseUIComponentProps } from '../../internals/types';
export function SelectScrollDownArrow(props: SelectScrollDownArrowProps) { return <SelectScrollArrow {...props} direction="down" />; }
export interface SelectScrollDownArrowProps extends BaseUIComponentProps<'div', SelectScrollDownArrowState> { keepMounted?: boolean }
export interface SelectScrollDownArrowState {}
export namespace SelectScrollDownArrow { export type Props = SelectScrollDownArrowProps; export type State = SelectScrollDownArrowState }
