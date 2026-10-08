import { omit } from 'solid-js';
import { createRenderElement } from '../../internals/createRenderElement';
import type { BaseUIComponentProps } from '../../internals/contracts/render';
import { createPopupViewport } from '../../utils/createPopupViewport';
import { usePopoverRootContext } from '../root/PopoverRootContext';
import { usePopoverPositionerContext } from '../positioner/PopoverPositionerContext';
import type { PopoverInstant } from '../store/PopoverPolicy';

export function PopoverViewport(props: PopoverViewportProps) {
  const store = usePopoverRootContext();
  const positioning = usePopoverPositionerContext();
  // The shared adapter owns current/previous containers and their Solid owners.
  // Reading children inside its factory preserves Loading and prevents JSX cloning.
  const viewport = createPopupViewport({
    store: store.popup,
    get side() { return positioning.side; },
    children: () => props.children,
  });
  const state: PopoverViewportState = {
    get activationDirection() { return viewport.state.activationDirection; },
    get transitioning() { return viewport.state.transitioning; },
    get instant() { return store.policy.instantType; },
  };
  return createRenderElement('div', props, {
    state, get ref() { return props.ref; },
    props: [omit(props, 'render', 'class', 'style', 'ref', 'children'), { get children() { return viewport.children; } }],
    stateAttributesMapping: {
      activationDirection: (value) => value ? { 'data-activation-direction': value } : null,
    },
  });
}
export interface PopoverViewportState { activationDirection: string | undefined; transitioning: boolean; instant: PopoverInstant }
export interface PopoverViewportProps extends BaseUIComponentProps<'div', PopoverViewportState> {}
export namespace PopoverViewport {
  export type Props = PopoverViewportProps;
  export type State = PopoverViewportState;
}
