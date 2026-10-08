import { omit } from 'solid-js';
import { createRenderElement } from '../../internals/createRenderElement';
import { createBaseUiId } from '../../internals/createBaseUiId';
import type { BaseUIComponentProps } from '../../internals/types';
import type { TransitionStatus } from '../../internals/contracts/core';
import type { Side, Align } from '../../internals/createAnchorPositioning';
import { useNavigationMenuRootContext } from '../root/NavigationMenuRootContext';
import { useNavigationMenuPositionerContext } from '../positioner/NavigationMenuPositionerContext';
import { useDirection } from '../../internals/direction-context/DirectionContext';
import { popupTransitionStateMapping } from '../../utils/popupStateMapping';
import { getDisabledMountTransitionStyles } from '../../internals/getDisabledMountTransitionStyles';
export function NavigationMenuPopup(props: NavigationMenuPopup.Props) {
  const root = useNavigationMenuRootContext(); const position = useNavigationMenuPositionerContext();
  const direction = useDirection(); const id = createBaseUiId(() => typeof props.id === 'string' ? props.id : undefined);
  const state: NavigationMenuPopup.State = {
    get open() { return root.open; }, get transitionStatus() { return root.transitionStatus; },
    get side() { return position.side; }, get align() { return position.align; }, get anchorHidden() { return position.anchorHidden; },
  };
  const rest = omit(props, 'id', 'class', 'style', 'render', 'ref');
  const defaults = {
    get id() { return id(); }, tabindex: -1,
    get style() {
      const left = position.side === 'left' || position.side === (direction() === 'rtl' ? 'inline-end' : 'inline-start');
      return left || position.side === 'top'
        ? { position: 'absolute', [position.side === 'top' ? 'bottom' : 'top']: '0', [left ? 'right' : 'left']: '0' }
        : {};
    },
  };
  const transition = { get style() { return getDisabledMountTransitionStyles(root.transitionStatus).style; } };
  return createRenderElement('nav', props, { state, stateAttributesMapping: popupTransitionStateMapping,
    get ref() { return [props.ref, root.setPopupElement]; },
    props: [defaults, transition, rest],
  });
}
export interface NavigationMenuPopupState { open: boolean; transitionStatus: TransitionStatus; side: Side; align: Align; anchorHidden: boolean }
export interface NavigationMenuPopupProps extends BaseUIComponentProps<'nav', NavigationMenuPopupState> {}
export namespace NavigationMenuPopup { export type State = NavigationMenuPopupState; export type Props = NavigationMenuPopupProps }
