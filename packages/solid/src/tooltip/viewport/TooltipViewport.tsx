import { omit } from 'solid-js';
import type { JSX } from '@solidjs/web';
import type { BaseUIComponentProps } from '../../internals/contracts/render';
import { createRenderElement } from '../../internals/createRenderElement';
import { createPopupViewport, popupViewportStateMapping } from '../../utils/createPopupViewport';
import { useTooltipRootContext } from '../root/TooltipRootContext';
import { useTooltipPositionerContext } from '../positioner/TooltipPositionerContext';
import type { TooltipInstant } from '../utils/instant';
import type { TooltipRenderProps } from '../utils/types';

export function TooltipViewport(props: TooltipViewportProps): JSX.Element {
  const store = useTooltipRootContext();
  const positioning = useTooltipPositionerContext();
  const elementProps = omit(props, 'render', 'class', 'style', 'ref', 'children');
  const viewport = createPopupViewport({
    store,
    get side() { return positioning.side; },
    children: () => props.children,
  });
  const state: TooltipViewportState = {
    get activationDirection() { return viewport.state.activationDirection; },
    get transitioning() { return viewport.state.transitioning; },
    get instant() { return store.instantType; },
  };
  return createRenderElement('div', props, {
    state,
    get ref() { return props.ref; },
    props: [elementProps, { get children() { return viewport.children; } }],
    stateAttributesMapping: popupViewportStateMapping,
  });
}
export interface TooltipViewportState {
  activationDirection: string | undefined;
  transitioning: boolean;
  instant: TooltipInstant;
}
export interface TooltipViewportProps extends BaseUIComponentProps<'div', TooltipViewportState, TooltipRenderProps> {}
export namespace TooltipViewport {
  export type State = TooltipViewportState;
  export type Props = TooltipViewportProps;
}
