import { Show } from 'solid-js';
import type { BaseUIComponentProps } from '../../internals/types';
import type { TransitionStatus } from '../../internals/createTransitionStatus';
import { ItemIndicator } from '../../utils/ItemIndicator';
import { useComboboxItemContext } from '../item/ComboboxItemContext';
export interface ComboboxItemIndicatorState { selected: boolean; transitionStatus: TransitionStatus }
export interface ComboboxItemIndicatorProps extends BaseUIComponentProps<'span', ComboboxItemIndicatorState> { keepMounted?: boolean }
export function ComboboxItemIndicator(props: ComboboxItemIndicatorProps) {
  const item = useComboboxItemContext();
  return <Show when={props.keepMounted || item.selected}><ItemIndicator {...props} selected={item.selected} /></Show>;
}
export namespace ComboboxItemIndicator { export type Props = ComboboxItemIndicatorProps; export type State = ComboboxItemIndicatorState }
