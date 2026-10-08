import { omit } from 'solid-js';
import type { BaseUIComponentProps } from '../../internals/types';
import { createRenderElement } from '../../internals/createRenderElement';
import { ComboboxRowContext } from './ComboboxRowContext';
export interface ComboboxRowState {}
export interface ComboboxRowProps extends BaseUIComponentProps<'div', ComboboxRowState> {}
export function ComboboxRow(props: ComboboxRowProps) {
  return <ComboboxRowContext value={true}>{createRenderElement('div', props, { get ref() { return props.ref; }, props: [{ role: 'row' }, omit(props, 'class', 'style', 'render', 'ref')] })}</ComboboxRowContext>;
}
export namespace ComboboxRow { export type Props = ComboboxRowProps; export type State = ComboboxRowState }
