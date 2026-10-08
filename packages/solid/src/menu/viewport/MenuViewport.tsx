import { createPopupViewport, popupViewportStateMapping } from '../../utils/popups/createPopupViewport';
import { createRenderElement } from '../../internals/createRenderElement';
import type { BaseUIComponentProps } from '../../internals/types';
import { useMenuRootContext } from '../root/MenuRootContext';
import { useMenuPositionerContext } from '../positioner/MenuPositionerContext';
import type { MenuInstant } from '../store/MenuStore';
import { elementProps } from '../utils/props';
export interface MenuViewportState { activationDirection: string | undefined; transitioning: boolean; instant: MenuInstant }
export interface MenuViewportProps extends BaseUIComponentProps<'div', MenuViewportState> {}
export function MenuViewport(props: MenuViewportProps) {
  const { store } = useMenuRootContext(); const position = useMenuPositionerContext();
  const viewport = createPopupViewport({ store: store.popup, get side() { return position.side; }, get children() { return props.children; } });
  return createRenderElement('div', props, { get ref() { return props.ref; }, stateAttributesMapping: popupViewportStateMapping, state: {
    get activationDirection() { return viewport.state.activationDirection; }, get transitioning() { return viewport.state.transitioning; }, get instant() { return store.state.instantType; },
  }, props: [elementProps(props, ['children']), { get children() { return viewport.children; } }] });
}
export namespace MenuViewport { export type Props = MenuViewportProps; export type State = MenuViewportState }
