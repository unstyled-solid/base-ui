import { omit } from 'solid-js';
import type { BaseUIComponentProps } from '../../internals/types';
import type { TransitionStatus } from '../../internals/createTransitionStatus';
import { transitionStatusMapping } from '../../internals/stateAttributesMapping';
import { createRenderElement } from '../../internals/createRenderElement';
import { useSelectRootContext } from '../root/SelectRootContext';
export function SelectBackdrop(props: SelectBackdropProps) {
  const model = useSelectRootContext();
  return createRenderElement('div', props, {
    state: { get open() { return model.open; }, get transitionStatus() { return model.transitionStatus; } },
    stateAttributesMapping: { ...transitionStatusMapping, open: open => ({ [open ? 'data-open' : 'data-closed']: '' }) },
    props: [{ role: 'presentation', get hidden() { return !model.mounted; }, style: { 'user-select': 'none', '-webkit-user-select': 'none' } }, omit(props, 'class', 'style', 'render')],
  });
}
export interface SelectBackdropState { open: boolean; transitionStatus: TransitionStatus }
export interface SelectBackdropProps extends BaseUIComponentProps<'div', SelectBackdropState> {}
export namespace SelectBackdrop { export type Props = SelectBackdropProps; export type State = SelectBackdropState }
