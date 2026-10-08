import { createSignal, omit } from 'solid-js';
import type { BaseUIComponentProps } from '../../internals/types';
import { createRenderElement } from '../../internals/createRenderElement';
import { SelectGroupContext } from './SelectGroupContext';
export function SelectGroup(props: SelectGroupProps) {
  const [labelId, setLabelId] = createSignal<string>();
  const Host = () => createRenderElement('div', props, { props: [{ role: 'group', get 'aria-labelledby'() { return labelId(); } }, omit(props, 'class', 'style', 'render')] });
  return <SelectGroupContext value={{ get labelId() { return labelId(); }, setLabelId }}><Host /></SelectGroupContext>;
}
export interface SelectGroupState {}
export interface SelectGroupProps extends BaseUIComponentProps<'div', SelectGroupState> {}
export namespace SelectGroup { export type Props = SelectGroupProps; export type State = SelectGroupState }
