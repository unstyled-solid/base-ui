import { createEffect, createMemo, merge, omit } from 'solid-js';
import { FloatingFocusManager } from '../../floating-ui-react/components/FloatingFocusManager';
import { createHoverFloatingInteraction } from '../../floating-ui-react/hooks/createHoverFloatingInteraction';
import { createRenderElement } from '../../internals/createRenderElement';
import type { BaseUIComponentProps } from '../../internals/contracts/render';
import type { TransitionStatus } from '../../internals/contracts/core';
import type { Side, Align } from '../../internals/createAnchorPositioning';
import type { PopoverInstant, PopoverInteraction } from '../store/PopoverPolicy';
import { usePopoverRootContext } from '../root/PopoverRootContext';
import { usePopoverPositionerContext } from '../positioner/PopoverPositionerContext';
import { ClosePartContext, createClosePartCount } from '../../utils/closePart';
import { createDefaultInitialFocus, FOCUSABLE_POPUP_PROPS } from '../../utils/popups';
import { getDisabledMountTransitionStyles } from '../../internals/getDisabledMountTransitionStyles';
import { isHTMLElement } from '../../utils/isHTMLElement';
import { popupTransitionStateMapping } from '../utils/state';
import { useToolbarRootContext } from '../../toolbar/root/ToolbarRootContext';
import { COMPOSITE_KEYS } from '../../internals/composite/composite';
import { createRenderedId } from '../../internals/resolveRenderedId';

export function PopoverPopup(props: PopoverPopupProps) {
  const store = usePopoverRootContext();
  const positioning = usePopoverPositionerContext();
  const insideToolbar = useToolbarRootContext(true) !== null;
  const close = createClosePartCount();
  const modalSource = () => store.modal !== false && close.hasClosePart;
  createEffect(() => modalSource, (source) => store.registerFocusManagerModal(source));
  const [id, registerId] = createRenderedId(props, store.defaultFloatingId, store.setFloatingId);
  const defaultInitialFocus = createDefaultInitialFocus(() => store.state.popupElement);
  createHoverFloatingInteraction(store.state.floatingRootContext, {
    get enabled() { return !!store.activeTriggerData?.openOnHover && !store.activeTriggerData?.disabled; },
    get closeDelay() { return store.activeTriggerData?.closeDelay ?? 0; },
  });
  const state: PopoverPopupState = {
    get open() { return store.state.open; },
    get side() { return positioning.side; },
    get align() { return positioning.align; },
    get instant() { return store.policy.instantType; },
    get transitionStatus() { return store.state.transitionStatus; },
  };
  const Element = () => {
    // Materialize children in their ClosePart owner once, independently of interaction/style bags.
    const Content = () => {
      const content = createMemo(() => props.children);
      return <>{content()}</>;
    };
    const children = <Content />;
    return createRenderElement('div', props, {
      state, stateAttributesMapping: popupTransitionStateMapping,
      get ref() { return [props.ref, store.popup.setPopupElement, registerId]; },
      props: [merge(() => store.state.popupProps), {
        get id() { return id(); },
        role: 'dialog', ...FOCUSABLE_POPUP_PROPS,
        get 'aria-labelledby'() { return store.titleId; },
        get 'aria-describedby'() { return store.descriptionId; },
        onKeyDown(event: KeyboardEvent) {
          // Bubble phase: composites within the popup have already received the key.
          if (insideToolbar && COMPOSITE_KEYS.has(event.key)) event.stopPropagation();
        },
      }, { get style() { return getDisabledMountTransitionStyles(store.state.transitionStatus).style; } },
      omit(props, 'render', 'class', 'style', 'ref', 'initialFocus', 'finalFocus', 'children'), { children }],
    });
  };
  return <FloatingFocusManager
    context={store.state.floatingRootContext}
    modal={store.focusManagerModal}
    disabled={!store.state.mounted || store.policy.openChangeReason === 'trigger-hover'}
    initialFocus={props.initialFocus === undefined ? defaultInitialFocus : props.initialFocus}
    returnFocus={props.finalFocus}
    restoreFocus="popup"
    openInteractionType={store.policy.openMethod}
    getInsideElements={() => [store.context.beforeTriggerFocusGuardRef?.current]}
    previousFocusableElement={isHTMLElement(store.state.activeTriggerElement) ? store.state.activeTriggerElement : undefined}
    nextFocusableElement={store.context.triggerFocusTargetRef}
    beforeContentFocusGuardRef={store.context.beforeContentFocusGuardRef}
  >
    <ClosePartContext value={close.context}><Element /></ClosePartContext>
  </FloatingFocusManager>;
}
export interface PopoverPopupState { open: boolean; side: Side; align: Align; transitionStatus: TransitionStatus; instant: PopoverInstant }
export type PopoverFocusTarget = boolean | (() => HTMLElement | null)
  | ((interaction: PopoverInteraction) => void | boolean | HTMLElement | null);
export interface PopoverPopupProps extends BaseUIComponentProps<'div', PopoverPopupState> {
  id?: string;
  initialFocus?: PopoverFocusTarget;
  finalFocus?: PopoverFocusTarget;
}
export namespace PopoverPopup {
  export type Props = PopoverPopupProps;
  export type State = PopoverPopupState;
}
