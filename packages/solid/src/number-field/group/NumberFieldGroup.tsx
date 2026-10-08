import { omit } from 'solid-js';
import type { BaseUIComponentProps } from '../../internals/types';
import { createRenderElement } from '../../internals/createRenderElement';
import { useNumberFieldRootContext } from '../root/NumberFieldRootContext';
import type { NumberFieldRootState } from '../root/NumberFieldRoot';
import { stateAttributesMapping } from '../utils/stateAttributesMapping';

export function NumberFieldGroup(props: NumberFieldGroup.Props) {
  const elementProps = omit(props, 'render', 'class', 'style', 'ref');
  const context = useNumberFieldRootContext();
  return createRenderElement('div', props, { state: context.state,
    get ref() { return props.ref; }, props: [{ role: 'group' }, elementProps], stateAttributesMapping });
}
export interface NumberFieldGroupState extends NumberFieldRootState {}
export interface NumberFieldGroupProps extends BaseUIComponentProps<'div', NumberFieldGroupState> {}
export namespace NumberFieldGroup { export type Props = NumberFieldGroupProps; export type State = NumberFieldGroupState; }
