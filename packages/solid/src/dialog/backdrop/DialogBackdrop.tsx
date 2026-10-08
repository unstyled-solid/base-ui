import { omit } from 'solid-js';
import type { BaseUIComponentProps, TransitionStatus } from '../../internals/types';
import { createRenderElement } from '../../internals/createRenderElement';
import { useDialogRootContext } from '../root/DialogRootContext';
import { popupTransitionStateMapping } from '../../utils/popupStateMapping';

export function DialogBackdrop(props: DialogBackdropProps) {
  const store = useDialogRootContext();
  const state: DialogBackdropState = {
    get open() { return store.state.open; },
    get transitionStatus() { return store.state.transitionStatus; },
  };
  return createRenderElement<DialogBackdropState, HTMLDivElement, 'div', boolean>('div', props, {
    state,
    get enabled() { return props.forceRender || !store.state.nested; },
    ref: store.setBackdropElement,
    stateAttributesMapping: popupTransitionStateMapping,
    props: [
      { role: 'presentation', get hidden() { return !store.state.mounted; }, style: { 'user-select': 'none', '-webkit-user-select': 'none' } },
      omit(props, 'class', 'style', 'render', 'forceRender'),
    ],
  });
}
export interface DialogBackdropState { open: boolean; transitionStatus: TransitionStatus }
export interface DialogBackdropProps extends BaseUIComponentProps<'div', DialogBackdropState> { forceRender?: boolean }
export namespace DialogBackdrop { export type Props = DialogBackdropProps; export type State = DialogBackdropState; }
