import { omit } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { CompositeRoot } from '../../internals/composite';
import { createRenderElement } from '../../internals/createRenderElement';
import { createDismiss } from '../../floating-ui-react/hooks/createDismiss';
import { createHoverFloatingInteraction } from '../../floating-ui-react/hooks/createHoverFloatingInteraction';
import { LogicalLayerContext } from '../../floating-ui-react/components/LogicalLayerContext';
import { closest, getTarget } from '../../floating-ui-react/utils/element';
import type { BaseUIComponentProps } from '../../internals/types';
import { useNavigationMenuRootContext } from '../root/NavigationMenuRootContext';
import { NavigationMenuDismissContext } from './NavigationMenuDismissContext';
import { NAVIGATION_MENU_TRIGGER_IDENTIFIER } from '../utils/constants';

export function NavigationMenuList(props: NavigationMenuList.Props) {
  const root = useNavigationMenuRootContext();
  const dismiss = createDismiss(() => root.floatingRootContext, {
    get enabled() { return !!root.positionerElement || root.value == null; },
    outsidePressEvent: 'intentional',
    get layer() { return root.logicalLayer ?? undefined; },
    outsidePress: (event) => !closest(getTarget(event) as Element | null, `[${NAVIGATION_MENU_TRIGGER_IDENTIFIER}]`),
  });
  createHoverFloatingInteraction(() => root.floatingRootContext, {
    get enabled() { return !!root.positionerElement || !!root.viewportElement || root.value == null; },
    get closeDelay() { return root.closeDelay; }, nodeId: root.nodeId,
  });
  const state = { get open() { return root.open; } };
  const rest = omit(props, 'class', 'style', 'render', 'ref');
  const defaults: JSX.HTMLAttributes<HTMLElement> = {
    onKeyDown(event) {
      if (!root.nested && (root.orientation === 'horizontal' ? ['ArrowLeft', 'ArrowRight'] : ['ArrowUp', 'ArrowDown']).includes(event.key)) event.stopPropagation();
    },
  };
  const NestedHost = () => createRenderElement('ul', props, {
    state, get ref() { return props.ref; },
    get props() { return [dismiss.floating, defaults, rest]; },
  });
  return <LogicalLayerContext value={() => root.logicalLayer}><NavigationMenuDismissContext value={dismiss}>
    {root.nested ? <NestedHost /> : <CompositeRoot tag="ul" orientation={root.orientation} loopFocus={false}
      render={props.render} class={props.class} style={props.style} state={state} refs={[props.ref]}
      props={[dismiss.floating, defaults, rest]} />}
  </NavigationMenuDismissContext></LogicalLayerContext>;
}
export interface NavigationMenuListState { open: boolean }
export interface NavigationMenuListProps extends BaseUIComponentProps<'ul', NavigationMenuListState> {}
export namespace NavigationMenuList { export type State = NavigationMenuListState; export type Props = NavigationMenuListProps }
