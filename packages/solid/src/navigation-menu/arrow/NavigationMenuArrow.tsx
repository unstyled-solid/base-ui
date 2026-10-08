import { omit } from 'solid-js';
import { createRenderElement } from '../../internals/createRenderElement';
import type { BaseUIComponentProps } from '../../internals/types';
import type { Side, Align } from '../../internals/createAnchorPositioning';
import { useNavigationMenuRootContext } from '../root/NavigationMenuRootContext';
import { useNavigationMenuPositionerContext } from '../positioner/NavigationMenuPositionerContext';
import { popupStateMapping } from '../../utils/popupStateMapping';
import { getDisabledMountTransitionStyles } from '../../internals/getDisabledMountTransitionStyles';
export function NavigationMenuArrow(props: NavigationMenuArrow.Props) {
  const root = useNavigationMenuRootContext(); const position = useNavigationMenuPositionerContext();
  const state: NavigationMenuArrow.State = { get open() { return root.open; }, get side() { return position.side; }, get align() { return position.align; }, get uncentered() { return position.arrowUncentered; } };
  const rest = omit(props, 'class', 'style', 'render', 'ref');
  const defaults = { 'aria-hidden': true, get style() { return position.arrowStyles; } };
  const transition = { get style() { return getDisabledMountTransitionStyles(root.transitionStatus).style; } };
  return createRenderElement('div', props, { state, stateAttributesMapping: popupStateMapping,
    get ref() { return [props.ref, position.arrowRef]; },
    props: [defaults, transition, rest],
  });
}
export interface NavigationMenuArrowState { open: boolean; side: Side; align: Align; uncentered: boolean }
export interface NavigationMenuArrowProps extends BaseUIComponentProps<'div', NavigationMenuArrowState> {}
export namespace NavigationMenuArrow { export type State = NavigationMenuArrowState; export type Props = NavigationMenuArrowProps }
