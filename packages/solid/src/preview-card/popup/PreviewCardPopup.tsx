import { merge, omit } from 'solid-js';
import type { Align, Side } from '../../internals/createAnchorPositioning';
import type { BaseUIComponentProps } from '../../internals/contracts/render';
import type { TransitionStatus } from '../../internals/contracts/core';
import { createRenderElement } from '../../internals/createRenderElement';
import { getDisabledMountTransitionStyles } from '../../internals/getDisabledMountTransitionStyles';
import { createHoverFloatingInteraction } from '../../floating-ui-react/hooks/createHoverFloatingInteraction';
import { FOCUSABLE_POPUP_PROPS } from '../../utils/popups';
import { popupTransitionStateMapping } from '../../utils/popupStateMapping';
import { usePreviewCardRootContext } from '../root/PreviewCardContext';
import { usePreviewCardPositionerContext } from '../positioner/PreviewCardPositionerContext';

export function PreviewCardPopup(props: PreviewCardPopup.Props) {
  const store = usePreviewCardRootContext();
  const positioner = usePreviewCardPositionerContext();
  createHoverFloatingInteraction(() => store.state.floatingRootContext, {
    get closeDelay() { return store.closeDelay; },
  });
  const state: PreviewCardPopupState = {
    get open() { return store.state.open; },
    get side() { return positioner.side; },
    get align() { return positioner.align; },
    get instant() { return store.instantType; },
    get transitionStatus() { return store.state.transitionStatus; },
  };
  const elementProps = omit(props, 'render', 'class', 'style', 'ref');
  const popupProps = merge(() => store.state.popupProps);
  return createRenderElement('div', props, {
    state,
    get ref() { return [props.ref, store.setPopupElement]; },
    props: [FOCUSABLE_POPUP_PROPS, popupProps, {
      get style() { return getDisabledMountTransitionStyles(store.state.transitionStatus)?.style; },
    }, elementProps],
    stateAttributesMapping: popupTransitionStateMapping,
  });
}
export interface PreviewCardPopupState {
  open: boolean;
  side: Side;
  align: Align;
  instant: 'dismiss' | 'focus' | undefined;
  transitionStatus: TransitionStatus;
}
export interface PreviewCardPopupProps extends BaseUIComponentProps<'div', PreviewCardPopupState> {}
export namespace PreviewCardPopup {
  export type State = PreviewCardPopupState;
  export type Props = PreviewCardPopupProps;
}
