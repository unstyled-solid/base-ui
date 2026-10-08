import { omit } from 'solid-js';
import type { BaseUIComponentProps } from '../../internals/types';
import { createRenderElement } from '../../internals/createRenderElement';
export interface ComboboxIconState {}
export interface ComboboxIconProps extends BaseUIComponentProps<'span', ComboboxIconState> {}
export function ComboboxIcon(props: ComboboxIconProps) {
  return createRenderElement('span', props, { get ref() { return props.ref; },
    props: [{ 'aria-hidden': true, children: '▼' }, omit(props, 'class', 'style', 'render', 'ref')] });
}
export namespace ComboboxIcon { export type Props = ComboboxIconProps; export type State = ComboboxIconState }
