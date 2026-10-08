import { omit } from 'solid-js';
import { createRenderElement } from '../../internals/createRenderElement';
import type { BaseUIComponentProps } from '../../internals/types';
import type { TransitionStatus } from '../../internals/contracts/core';
import { useNavigationMenuRootContext } from '../root/NavigationMenuRootContext';
import { popupTransitionStateMapping } from '../../utils/popupStateMapping';
export function NavigationMenuBackdrop(props: NavigationMenuBackdrop.Props) {
  const root = useNavigationMenuRootContext();
  const state = { get open() { return root.open; }, get transitionStatus() { return root.transitionStatus; } };
  const rest = omit(props, 'class', 'style', 'render', 'ref');
  const defaults = { role: 'presentation', get hidden() { return !root.mounted; }, style: { 'user-select': 'none', '-webkit-user-select': 'none' } };
  return createRenderElement('div', props, { state, stateAttributesMapping: popupTransitionStateMapping,
    get ref() { return props.ref; }, props: [defaults, rest],
  });
}
export interface NavigationMenuBackdropState { open: boolean; transitionStatus: TransitionStatus }
export interface NavigationMenuBackdropProps extends BaseUIComponentProps<'div', NavigationMenuBackdropState> {}
export namespace NavigationMenuBackdrop { export type State = NavigationMenuBackdropState; export type Props = NavigationMenuBackdropProps }
