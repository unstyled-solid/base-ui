import { createMemo, merge, omit, Show } from 'solid-js';
import { createAnchorPositioning, type UseAnchorPositioningSharedParameters, type Side, type Align } from '../../internals/createAnchorPositioning';
import { createPositioner } from '../../utils/createPositioner';
import { FloatingNode, createFloatingNodeId } from '../../floating-ui-react/components/FloatingTree';
import type { BaseUIComponentProps } from '../../internals/contracts/render';
import { InternalBackdrop } from '../../utils/InternalBackdrop';
import { createAnchoredPopupScrollLock } from '../../utils/createAnchoredPopupScrollLock';
import { createTriggerSwitchTransition } from '../../internals/createTriggerSwitchTransition';
import { POPUP_COLLISION_AVOIDANCE } from '../../internals/constants';
import { usePopoverRootContext } from '../root/PopoverRootContext';
import { usePopoverPortalContext } from '../portal/PopoverPortalContext';
import { PopoverPositionerContext } from './PopoverPositionerContext';

export function PopoverPositioner(props: PopoverPositionerProps) {
  const store = usePopoverRootContext();
  const portal = usePopoverPortalContext();
  const nodeId = createFloatingNodeId(undefined, () => store.state.floatingRootContext);
  const positioning = createAnchorPositioning({
    get rootContext() { return store.state.floatingRootContext; },
    get nodeId() { return nodeId(); },
    get mounted() { return store.state.mounted; },
    get open() { return store.state.open; },
    get keepMounted() { return portal.keepMounted; },
    get anchor() { return props.anchor; },
    get positionMethod() { return props.positionMethod; },
    get side() { return props.side; },
    get align() { return props.align; },
    get sideOffset() { return props.sideOffset; },
    get alignOffset() { return props.alignOffset; },
    get collisionBoundary() { return props.collisionBoundary ?? 'clipping-ancestors'; },
    get collisionPadding() { return props.collisionPadding; },
    get collisionAvoidance() { return props.collisionAvoidance ?? POPUP_COLLISION_AVOIDANCE; },
    get arrowPadding() { return props.arrowPadding; },
    get sticky() { return props.sticky; },
    get disableAnchorTracking() { return props.disableAnchorTracking ?? false; },
    get adaptiveOrigin() { return store.popup.state.adaptiveOrigin; },
  });
  createTriggerSwitchTransition({
    store: store.popup,
    get domReference() { return store.state.floatingRootContext.state.domReferenceElement; },
    get positionerElement() { return store.state.positionerElement; },
    get open() { return store.state.open; },
    setInstantType: store.policy.setInstantType,
    getInstantType: () => store.policy.instantType,
  });
  const trueModalNonHover = () => store.modal === true && store.policy.openChangeReason !== 'trigger-hover';
  createAnchoredPopupScrollLock(
    () => store.state.open && trueModalNonHover(),
    () => store.policy.openMethod === 'touch',
    () => store.state.positionerElement,
    () => store.state.activeTriggerElement,
  );
  const state: PopoverPositionerState = {
    get open() { return store.state.open; },
    get side() { return positioning.side; },
    get align() { return positioning.align; },
    get anchorHidden() { return positioning.anchorHidden; },
    get instant() { return store.policy.instantType; },
  };
  const Element = () => {
    const Content = () => {
      const content = createMemo(() => props.children);
      return <>{content()}</>;
    };
    const children = <Content />;
    return createPositioner(props, state, {
      get styles() { return positioning.positionerStyles; },
      get transitionStatus() { return store.state.transitionStatus; },
      get refs() { return [props.ref, store.popup.setPositionerElement, positioning.refs.setFloating]; },
      get hidden() { return !store.state.mounted; },
      get inert() { return !store.state.open; },
      props: merge(omit(props, 'render', 'class', 'style', 'ref', 'anchor', 'positionMethod', 'side', 'align', 'sideOffset', 'alignOffset', 'collisionBoundary', 'collisionPadding', 'collisionAvoidance', 'arrowPadding', 'sticky', 'disableAnchorTracking', 'children'), { children }),
    });
  };
  return <PopoverPositionerContext value={positioning}>
    <Show when={store.state.mounted && trueModalNonHover()}>
      <InternalBackdrop inert={!store.state.open} cutout={store.state.activeTriggerElement} />
    </Show>
    <FloatingNode id={nodeId()} context={store.state.floatingRootContext}><Element /></FloatingNode>
  </PopoverPositionerContext>;
}
export interface PopoverPositionerState { open: boolean; side: Side; align: Align; anchorHidden: boolean; instant: string | undefined }
export interface PopoverPositionerProps extends UseAnchorPositioningSharedParameters, BaseUIComponentProps<'div', PopoverPositionerState> {}
export namespace PopoverPositioner {
  export type Props = PopoverPositionerProps;
  export type State = PopoverPositionerState;
}
