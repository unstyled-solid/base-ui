import { merge, omit } from 'solid-js';
import type { JSX } from '@solidjs/web';
import type { BaseUIComponentProps } from '../../internals/contracts/render';
import type { TransitionStatus } from '../../internals/contracts/core';
import type { Side, Align } from '../../internals/createAnchorPositioning';
import { createRenderElement } from '../../internals/createRenderElement';
import { getDisabledMountTransitionStyles } from '../../internals/getDisabledMountTransitionStyles';
import { popupTransitionStateMapping } from '../../utils/popupStateMapping';
import { FOCUSABLE_POPUP_PROPS } from '../../utils/popups';
import { createHoverFloatingInteraction } from '../../floating-ui-react/hooks/createHoverFloatingInteraction';
import { useTooltipRootContext } from '../root/TooltipRootContext';
import { useTooltipPositionerContext } from '../positioner/TooltipPositionerContext';
import type { TooltipInstant } from '../utils/instant';
import type { TooltipRenderProps } from '../utils/types';

export function TooltipPopup(props: TooltipPopupProps): JSX.Element {
  const store = useTooltipRootContext();
  const positioning = useTooltipPositionerContext();
  const elementProps = omit(props, 'render', 'class', 'style', 'ref');
  createHoverFloatingInteraction(store.state.floatingRootContext, {
    get enabled() { return !store.disabled; },
    get closeDelay() { return store.closeDelay; },
  });
  const state: TooltipPopupState = {
    get open() { return store.state.open; },
    get side() { return positioning.side; },
    get align() { return positioning.align; },
    get instant() { return store.instantType; },
    get transitionStatus() { return store.state.transitionStatus; },
  };
  return createRenderElement('div', props, {
    state,
    get ref() { return [props.ref, store.setPopupElement]; },
    props: [FOCUSABLE_POPUP_PROPS, merge(() => store.state.popupProps), {
        get style() { return getDisabledMountTransitionStyles(store.state.transitionStatus)?.style; },
      }, elementProps],
    stateAttributesMapping: popupTransitionStateMapping,
  });
}
export interface TooltipPopupState {
  open: boolean;
  side: Side;
  align: Align;
  instant: TooltipInstant;
  transitionStatus: TransitionStatus;
}
export interface TooltipPopupProps extends BaseUIComponentProps<'div', TooltipPopupState, TooltipRenderProps> {}
export namespace TooltipPopup {
  export type State = TooltipPopupState;
  export type Props = TooltipPopupProps;
}
