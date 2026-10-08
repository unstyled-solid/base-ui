import { omit } from 'solid-js';
import { createRenderElement } from '../../internals/createRenderElement';
import type { BaseUIComponentProps } from '../../internals/contracts/render';
import type { Side, Align } from '../../internals/createAnchorPositioning';
import { usePopoverRootContext } from '../root/PopoverRootContext';
import { usePopoverPositionerContext } from '../positioner/PopoverPositionerContext';
import { popupStateMapping } from '../utils/state';

export function PopoverArrow(props: PopoverArrowProps) {
  const store = usePopoverRootContext();
  const positioning = usePopoverPositionerContext();
  const state: PopoverArrowState = {
    get open() { return store.state.open; },
    get side() { return positioning.side; },
    get align() { return positioning.align; },
    get uncentered() { return positioning.arrowUncentered; },
  };
  return createRenderElement('div', props, {
    state, get ref() { return [props.ref, positioning.arrowRef]; }, stateAttributesMapping: popupStateMapping,
    props: [{ 'aria-hidden': true, get style() { return positioning.arrowStyles; } },
      omit(props, 'render', 'class', 'style', 'ref')],
  });
}
export interface PopoverArrowState { open: boolean; side: Side; align: Align; uncentered: boolean }
export interface PopoverArrowProps extends BaseUIComponentProps<'div', PopoverArrowState> {}
export namespace PopoverArrow {
  export type Props = PopoverArrowProps;
  export type State = PopoverArrowState;
}
