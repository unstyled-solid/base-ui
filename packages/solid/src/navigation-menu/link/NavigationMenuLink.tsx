import { omit } from 'solid-js';
import type { JSX, ComponentProps } from '@solidjs/web';
import { CompositeItem } from '../../internals/composite';
import { createChangeEventDetails } from '../../internals/createBaseUIEventDetails';
import type { BaseUIComponentProps } from '../../internals/types';
import { useNavigationMenuRootContext } from '../root/NavigationMenuRootContext';
import { isOutsideMenuEvent } from '../utils/isOutsideMenuEvent';
export function NavigationMenuLink(props: NavigationMenuLink.Props) {
  const root = useNavigationMenuRootContext();
  const state = { get active() { return props.active ?? false; } };
  const rest = omit(props, 'active', 'closeOnClick', 'class', 'style', 'render', 'ref');
  const defaults: JSX.AnchorHTMLAttributes<HTMLAnchorElement> = {
    get 'aria-current'() { return state.active ? 'page' : undefined; }, tabindex: undefined,
    onClick(event) { if (props.closeOnClick) root.setValue(null, createChangeEventDetails('link-press', event)); },
    onBlur(event) { if (root.positionerElement && root.popupElement && isOutsideMenuEvent(event, root)) root.setValue(null, createChangeEventDetails('focus-out', event)); },
  };
  return <CompositeItem tag="a" render={props.render} class={props.class} style={props.style}
    state={state} refs={[props.ref]} props={[{ tabIndex: undefined }, defaults, rest]} />;
}
export interface NavigationMenuLinkState { active: boolean }
export interface NavigationMenuLinkProps extends BaseUIComponentProps<'a', NavigationMenuLinkState, ComponentProps<'a'>> { active?: boolean; closeOnClick?: boolean }
export namespace NavigationMenuLink { export type State = NavigationMenuLinkState; export type Props = NavigationMenuLinkProps }
