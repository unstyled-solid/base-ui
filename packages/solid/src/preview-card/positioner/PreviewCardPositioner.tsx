import { createEffect, omit } from 'solid-js';
import { createAnchorPositioning, type Align, type Side, type UseAnchorPositioningSharedParameters } from '../../internals/createAnchorPositioning';
import type { BaseUIComponentProps } from '../../internals/contracts/render';
import { createRenderElement } from '../../internals/createRenderElement';
import { getDisabledMountTransitionStyles } from '../../internals/getDisabledMountTransitionStyles';
import { POPUP_COLLISION_AVOIDANCE } from '../../internals/constants';
import { createInlineMiddleware } from '../../utils/popups/inlineRect';
import { popupStateMapping } from '../../utils/popupStateMapping';
import { usePreviewCardRootContext } from '../root/PreviewCardContext';
import { usePreviewCardPortalContext } from '../portal/PreviewCardPortalContext';
import { PreviewCardPositionerContext } from './PreviewCardPositionerContext';
import { createFloatingNodeId, FloatingNode } from '../../floating-ui-react/components/FloatingTree';

export function PreviewCardPositioner(props: PreviewCardPositioner.Props) {
  const store = usePreviewCardRootContext();
  const keepMounted = usePreviewCardPortalContext();
  const nodeId = createFloatingNodeId(undefined, () => store.state.floatingRootContext);
  const positioning = createAnchorPositioning({
    get rootContext() { return store.state.floatingRootContext; },
    get anchor() { return props.anchor; },
    get positionMethod() { return props.positionMethod ?? 'absolute'; },
    get mounted() { return store.state.mounted; },
    get open() { return store.state.open; },
    get keepMounted() { return keepMounted(); },
    get side() { return props.side ?? 'bottom'; },
    get align() { return props.align ?? 'center'; },
    get sideOffset() { return props.sideOffset ?? 0; },
    get alignOffset() { return props.alignOffset ?? 0; },
    get collisionBoundary() { return props.collisionBoundary ?? 'clipping-ancestors'; },
    get collisionPadding() { return props.collisionPadding ?? 5; },
    get arrowPadding() { return props.arrowPadding ?? 5; },
    get sticky() { return props.sticky ?? false; },
    get disableAnchorTracking() { return props.disableAnchorTracking ?? false; },
    get collisionAvoidance() { return props.collisionAvoidance ?? POPUP_COLLISION_AVOIDANCE; },
    get adaptiveOrigin() { return store.state.adaptiveOrigin; },
    get nodeId() { return nodeId(); },
    inline: createInlineMiddleware(store.inlineRectCoordsRef),
  });
  createEffect(() => store.state.open && store.state.mounted, (open) => {
    if (open) positioning.update();
  });
  const state: PreviewCardPositionerState = {
    get open() { return store.state.open; },
    get side() { return positioning.side; },
    get align() { return positioning.align; },
    get anchorHidden() { return positioning.anchorHidden; },
    get instant() { return store.instantType; },
  };
  const elementProps = omit(props, 'render', 'class', 'style', 'ref', 'anchor', 'positionMethod', 'side', 'align', 'sideOffset', 'alignOffset', 'collisionBoundary', 'collisionPadding', 'arrowPadding', 'sticky', 'disableAnchorTracking', 'collisionAvoidance');
  function Element() { return createRenderElement('div', props, {
    state,
    get ref() { return [props.ref, store.setPositionerElement, positioning.refs.setFloating]; },
    props: [{
      role: 'presentation',
      get hidden() { return !store.state.mounted; },
      get style() {
        return { ...positioning.positionerStyles, ...(!store.state.open ? { 'pointer-events': 'none' } : {}) };
      },
    }, {
      get style() { return getDisabledMountTransitionStyles(store.state.transitionStatus)?.style; },
    }, elementProps],
    stateAttributesMapping: popupStateMapping,
  }); }
  return <PreviewCardPositionerContext value={positioning}><FloatingNode id={nodeId()} context={store.state.floatingRootContext}><Element /></FloatingNode></PreviewCardPositionerContext>;
}
export interface PreviewCardPositionerState {
  open: boolean;
  side: Side;
  align: Align;
  anchorHidden: boolean;
  instant: 'dismiss' | 'focus' | undefined;
}
export interface PreviewCardPositionerProps extends UseAnchorPositioningSharedParameters, BaseUIComponentProps<'div', PreviewCardPositionerState> {}
export namespace PreviewCardPositioner {
  export type State = PreviewCardPositionerState;
  export type Props = PreviewCardPositionerProps;
}
