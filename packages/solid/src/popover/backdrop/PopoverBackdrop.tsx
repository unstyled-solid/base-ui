import { omit } from 'solid-js';
import { createRenderElement } from '../../internals/createRenderElement';
import type { BaseUIComponentProps } from '../../internals/contracts/render';
import type { TransitionStatus } from '../../internals/contracts/core';
import { usePopoverRootContext } from '../root/PopoverRootContext';
import { popupTransitionStateMapping } from '../utils/state';

export function PopoverBackdrop(props: PopoverBackdropProps) {
  const store = usePopoverRootContext();
  const state: PopoverBackdropState = {
    get open() { return store.state.open; },
    get transitionStatus() { return store.state.transitionStatus; },
  };
  return createRenderElement('div', props, {
    state, get ref() { return props.ref; }, stateAttributesMapping: popupTransitionStateMapping,
    props: [{
      role: 'presentation',
      get hidden() { return !store.state.mounted; },
      get style() { return {
        'pointer-events': store.policy.openChangeReason === 'trigger-hover' ? 'none' : undefined,
        'user-select': 'none', '-webkit-user-select': 'none',
      }; },
    }, omit(props, 'render', 'class', 'style', 'ref')],
  });
}
export interface PopoverBackdropState { open: boolean; transitionStatus: TransitionStatus }
export interface PopoverBackdropProps extends BaseUIComponentProps<'div', PopoverBackdropState> {}
export namespace PopoverBackdrop {
  export type Props = PopoverBackdropProps;
  export type State = PopoverBackdropState;
}
