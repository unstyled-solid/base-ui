import { omit } from 'solid-js';
import type { BaseUIComponentProps } from '../../internals/types';
import type { TransitionStatus } from '../../internals/contracts/core';
import { createRenderElement } from '../../internals/createRenderElement';
import { transitionStatusMapping } from '../../internals/stateAttributesMapping';
import { useComboboxRootContext } from '../root/ComboboxRootContext';
import { popupStateMapping } from '../utils/stateAttributesMapping';
export interface ComboboxBackdropState { open: boolean; transitionStatus: TransitionStatus }
export interface ComboboxBackdropProps extends BaseUIComponentProps<'div', ComboboxBackdropState> {}
export function ComboboxBackdrop(props: ComboboxBackdropProps) {
  const model = useComboboxRootContext();
  return createRenderElement('div', props, { state: { get open() { return model.state.open; }, get transitionStatus() { return model.state.transitionStatus; } },
    get ref() { return props.ref; }, stateAttributesMapping: { ...popupStateMapping, ...transitionStatusMapping },
    props: [{ role: 'presentation', get hidden() { return !model.state.mounted; }, style: { 'user-select': 'none', '-webkit-user-select': 'none' } }, omit(props, 'class', 'style', 'render', 'ref')],
  });
}
export namespace ComboboxBackdrop { export type Props = ComboboxBackdropProps; export type State = ComboboxBackdropState }
