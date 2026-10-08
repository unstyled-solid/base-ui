import { omit } from 'solid-js';
import type { BaseUIComponentProps } from '../../internals/types';
import { createRenderElement } from '../../internals/createRenderElement';
import { createInitialLiveRegionTextMutation } from '../../internals/createInitialLiveRegionTextMutation';
export interface ComboboxStatusState {}
export interface ComboboxStatusProps extends BaseUIComponentProps<'div', ComboboxStatusState> {}
export function ComboboxStatus(props: ComboboxStatusProps) {
  const statusRef = createInitialLiveRegionTextMutation<HTMLDivElement>();
  return createRenderElement('div', props, { get ref() { return [props.ref, statusRef]; }, props: [{ role: 'status', 'aria-live': 'polite', 'aria-atomic': true }, omit(props, 'class', 'style', 'render', 'ref')] });
}
export namespace ComboboxStatus { export type Props = ComboboxStatusProps; export type State = ComboboxStatusState }
