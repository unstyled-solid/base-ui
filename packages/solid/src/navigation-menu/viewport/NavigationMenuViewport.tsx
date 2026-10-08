import { omit, Show } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { createBaseUiId } from '../../internals/createBaseUiId';
import { createRenderElement } from '../../internals/createRenderElement';
import type { BaseUIComponentProps } from '../../internals/types';
import { contains } from '../../floating-ui-react/utils/element';
import { getNextTabbable, getPreviousTabbable, isOutsideEvent } from '../../floating-ui-react/utils/tabbable';
import { createMergedRefs } from '../../utils/createMergedRefs';
import { useNavigationMenuRootContext } from '../root/NavigationMenuRootContext';
import { useNavigationMenuPositionerContext } from '../positioner/NavigationMenuPositionerContext';
import { NavigationMenuFocusGuard } from './NavigationMenuFocusGuard';
function Guards(props: { children?: JSX.Element }) {
  const root = useNavigationMenuRootContext();
  const position = useNavigationMenuPositionerContext(true);
  const enabled = () => !!position || root.open && !!root.activeTrigger;
  return <>
    <Show when={enabled()}><NavigationMenuFocusGuard slot="beforeInside" onFocus={(event) => {
      const element = root.positionerElement ?? root.viewportElement;
      if (element && isOutsideEvent(event, element)) getNextTabbable(element)?.focus();
      else root.guards.beforeOutside?.focus();
    }} /></Show>
    {props.children}
    <Show when={enabled()}><NavigationMenuFocusGuard slot="afterInside" onFocus={(event) => {
      const element = root.positionerElement ?? root.viewportElement;
      if (element && isOutsideEvent(event, element)) getPreviousTabbable(element)?.focus();
      else root.guards.afterOutside?.focus();
    }} /></Show>
  </>;
}
export function NavigationMenuViewport(props: NavigationMenuViewport.Props) {
  const root = useNavigationMenuRootContext(); const position = useNavigationMenuPositionerContext(true);
  const id = createBaseUiId(() => typeof props.id === 'string' ? props.id : undefined);
  const targetRef = createMergedRefs<HTMLElement>(root.setViewportTargetElement);
  const rest = omit(props, 'id', 'children', 'class', 'style', 'render', 'ref');
  const inlineChildren = position ? undefined : <Guards><div ref={targetRef}>{props.children}</div></Guards>;
  const defaults: JSX.HTMLAttributes<HTMLDivElement> = {
    get id() { return id(); }, get inert() { return !position && root.viewportInert; },
    onFocusOut(event) {
      if (event.relatedTarget && !contains(event.currentTarget, event.relatedTarget as Element) && event.relatedTarget !== root.activeTrigger) root.setViewportInert(true);
    },
    get children() { return position ? props.children : inlineChildren; },
  };
  const host = () => createRenderElement('div', props, { get ref() { return [props.ref, root.setViewportElement]; }, get props() { return [defaults, rest]; } });
  return position ? <Guards>{host()}</Guards> : host();
}
export interface NavigationMenuViewportState {}
export interface NavigationMenuViewportProps extends BaseUIComponentProps<'div', NavigationMenuViewportState> {}
export namespace NavigationMenuViewport { export type State = NavigationMenuViewportState; export type Props = NavigationMenuViewportProps }
