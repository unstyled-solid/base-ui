import { omit } from 'solid-js';
import type { BaseUIComponentProps } from '../../internals/types';
import { createRenderElement } from '../../internals/createRenderElement';
import { useSelectItemContext } from '../item/SelectItemContext';
export function SelectItemText(props: SelectItemTextProps) {
  const item = useSelectItemContext();
  return createRenderElement<SelectItemTextState, HTMLElement>('div', props, { ref: item.setText, props: omit(props, 'class', 'style', 'render') });
}
export interface SelectItemTextState {}
export interface SelectItemTextProps extends BaseUIComponentProps<'div', SelectItemTextState> {}
export namespace SelectItemText { export type Props = SelectItemTextProps; export type State = SelectItemTextState }
