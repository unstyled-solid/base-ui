import { omit } from 'solid-js';
import type { JSX } from '@solidjs/web';
import type { BaseUIComponentProps } from '../../internals/contracts/render';
import type { Side, Align } from '../../internals/createAnchorPositioning';
import { createRenderElement } from '../../internals/createRenderElement';
import { popupStateMapping } from '../../utils/popupStateMapping';
import { useTooltipRootContext } from '../root/TooltipRootContext';
import { useTooltipPositionerContext } from '../positioner/TooltipPositionerContext';
import type { TooltipInstant } from '../utils/instant';
import type { TooltipRenderProps } from '../utils/types';

export function TooltipArrow(props: TooltipArrowProps): JSX.Element {
  const store = useTooltipRootContext();
  const positioning = useTooltipPositionerContext();
  const elementProps = omit(props, 'render', 'class', 'style', 'ref');
  const state: TooltipArrowState = {
    get open() { return store.state.open; },
    get side() { return positioning.side; },
    get align() { return positioning.align; },
    get uncentered() { return positioning.arrowUncentered; },
    get instant() { return store.instantType; },
  };
  return createRenderElement('div', props, {
    state,
    get ref() { return [props.ref, positioning.arrowRef]; },
    props: [{ get style() { return positioning.arrowStyles; }, 'aria-hidden': true }, elementProps],
    stateAttributesMapping: popupStateMapping,
  });
}
export interface TooltipArrowState {
  open: boolean;
  side: Side;
  align: Align;
  uncentered: boolean;
  instant: TooltipInstant;
}
export interface TooltipArrowProps extends BaseUIComponentProps<'div', TooltipArrowState, TooltipRenderProps> {}
export namespace TooltipArrow {
  export type State = TooltipArrowState;
  export type Props = TooltipArrowProps;
}
