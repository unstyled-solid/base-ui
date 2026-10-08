import { omit } from 'solid-js';
import type { BaseUIComponentProps } from '../../internals/types';
import { createRenderElement } from '../../internals/createRenderElement';
import type { SwitchRootState } from '../root/SwitchRoot';
import { useSwitchRootContext } from '../root/SwitchRootContext';
import { stateAttributesMapping } from '../stateAttributesMapping';

export function SwitchThumb(props: SwitchThumbProps) {
  const state = useSwitchRootContext();
  const elementProps = omit(props, 'render', 'class', 'style', 'ref');
  return createRenderElement('span', props, { state, get ref() { return props.ref; }, props: elementProps, stateAttributesMapping });
}
export interface SwitchThumbState extends SwitchRootState {}
export interface SwitchThumbProps extends BaseUIComponentProps<'span', SwitchThumbState> {}
export namespace SwitchThumb {
  export type Props = SwitchThumbProps;
  export type State = SwitchThumbState;
}
