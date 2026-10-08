import { omit } from 'solid-js';
import { createRenderElement } from '../../internals/createRenderElement';
import type { BaseUIComponentProps } from '../../internals/types';
import { useNavigationMenuRootContext } from '../root/NavigationMenuRootContext';
import { useNavigationMenuItemContext } from '../item/NavigationMenuItemContext';
import { triggerOpenStateMapping } from '../../utils/popupStateMapping';
export function NavigationMenuIcon(props: NavigationMenuIcon.Props) {
  const item = useNavigationMenuItemContext(); const root = useNavigationMenuRootContext();
  const state = { get open() { return root.open && root.value === item.value; } };
  const rest = omit(props, 'class', 'style', 'render', 'ref');
  return createRenderElement('span', props, { state, get ref() { return props.ref; }, get props() { return [{ 'aria-hidden': true, children: '▼' }, rest]; }, stateAttributesMapping: triggerOpenStateMapping });
}
export interface NavigationMenuIconState { open: boolean }
export interface NavigationMenuIconProps extends BaseUIComponentProps<'span', NavigationMenuIconState> {}
export namespace NavigationMenuIcon { export type State = NavigationMenuIconState; export type Props = NavigationMenuIconProps }
