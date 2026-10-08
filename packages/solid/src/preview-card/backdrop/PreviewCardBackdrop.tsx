import { omit } from 'solid-js';
import type { BaseUIComponentProps } from '../../internals/contracts/render';
import type { TransitionStatus } from '../../internals/contracts/core';
import { createRenderElement } from '../../internals/createRenderElement';
import { popupTransitionStateMapping } from '../../utils/popupStateMapping';
import { usePreviewCardRootContext } from '../root/PreviewCardContext';

export function PreviewCardBackdrop(props: PreviewCardBackdrop.Props) {
  const store = usePreviewCardRootContext();
  const state: PreviewCardBackdropState = {
    get open() { return store.state.open; },
    get transitionStatus() { return store.state.transitionStatus; },
  };
  const elementProps = omit(props, 'render', 'class', 'style', 'ref');
  return createRenderElement('div', props, {
    state,
    get ref() { return props.ref; },
    props: [{
      role: 'presentation',
      get hidden() { return !store.state.mounted; },
      style: { 'pointer-events': 'none', 'user-select': 'none', '-webkit-user-select': 'none' },
    }, elementProps],
    stateAttributesMapping: popupTransitionStateMapping,
  });
}
export interface PreviewCardBackdropState { open: boolean; transitionStatus: TransitionStatus }
export interface PreviewCardBackdropProps extends BaseUIComponentProps<'div', PreviewCardBackdropState> {}
export namespace PreviewCardBackdrop {
  export type State = PreviewCardBackdropState;
  export type Props = PreviewCardBackdropProps;
}
