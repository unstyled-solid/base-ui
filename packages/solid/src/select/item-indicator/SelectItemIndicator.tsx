import type { BaseUIComponentProps } from '../../internals/types';
import type { TransitionStatus } from '../../internals/createTransitionStatus';
import { ItemIndicator } from '../../utils/ItemIndicator';
import { useSelectItemContext } from '../item/SelectItemContext';
export function SelectItemIndicator(props: SelectItemIndicatorProps) {
  const item = useSelectItemContext();
  return <>{props.keepMounted || item.selected ? <ItemIndicator {...props} selected={item.selected} /> : null}</>;
}
export interface SelectItemIndicatorState { selected: boolean; transitionStatus: TransitionStatus }
export interface SelectItemIndicatorProps extends BaseUIComponentProps<'span', SelectItemIndicatorState> { keepMounted?: boolean }
export namespace SelectItemIndicator { export type Props = SelectItemIndicatorProps; export type State = SelectItemIndicatorState }
