import { createRenderElement } from '../../internals/createRenderElement';
import type { BaseUIComponentProps } from '../../internals/types';
import type { Side, Align } from '../../internals/createAnchorPositioning';
import { useMenuRootContext } from '../root/MenuRootContext';
import { useMenuPositionerContext } from '../positioner/MenuPositionerContext';
import { elementProps } from '../utils/props';
import { popupMapping } from '../utils/stateAttributesMapping';
export interface MenuArrowState { open: boolean; side: Side; align: Align; uncentered: boolean }
export interface MenuArrowProps extends BaseUIComponentProps<'div', MenuArrowState> {}
export function MenuArrow(props: MenuArrowProps) {
  const { store } = useMenuRootContext(); const position = useMenuPositionerContext();
  return createRenderElement('div', props, { state: {
    get open() { return store.state.open; }, get side() { return position.side; }, get align() { return position.align; }, get uncentered() { return position.arrowUncentered; },
  }, stateAttributesMapping: popupMapping, get ref() { return [props.ref, position.arrowRef]; },
    props: [{ 'aria-hidden': true, get style() { return position.arrowStyles; } }, elementProps(props, [])],
  });
}
export namespace MenuArrow { export type Props = MenuArrowProps; export type State = MenuArrowState }
