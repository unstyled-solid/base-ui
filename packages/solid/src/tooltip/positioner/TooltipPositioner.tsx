import { omit } from 'solid-js';
import type { JSX } from '@solidjs/web';
import type { BaseUIComponentProps } from '../../internals/contracts/render';
import { createAnchorPositioning, type Side, type Align, type UseAnchorPositioningSharedParameters } from '../../internals/createAnchorPositioning';
import { createPositioner } from '../../utils/createPositioner';
import { POPUP_COLLISION_AVOIDANCE } from '../../internals/constants';
import { useTooltipRootContext } from '../root/TooltipRootContext';
import { useTooltipPortalContext } from '../portal/TooltipPortalContext';
import { TooltipPositionerContext } from './TooltipPositionerContext';
import type { TooltipRenderProps } from '../utils/types';

export function TooltipPositioner(props: TooltipPositionerProps): JSX.Element {
  const store = useTooltipRootContext();
  const keepMounted = useTooltipPortalContext();
  const elementProps = omit(props, 'render', 'class', 'style', 'ref', 'anchor', 'positionMethod', 'side', 'align', 'sideOffset', 'alignOffset', 'collisionBoundary', 'collisionPadding', 'arrowPadding', 'sticky', 'disableAnchorTracking', 'collisionAvoidance');
  const positioning = createAnchorPositioning({
    get rootContext() { return store.state.floatingRootContext; },
    get anchor() { return props.anchor; },
    get positionMethod() { return props.positionMethod ?? 'absolute'; },
    get side() { return props.side ?? 'top'; },
    get align() { return props.align ?? 'center'; },
    get sideOffset() { return props.sideOffset ?? 0; },
    get alignOffset() { return props.alignOffset ?? 0; },
    get collisionBoundary() { return props.collisionBoundary ?? 'clipping-ancestors'; },
    get collisionPadding() { return props.collisionPadding ?? 5; },
    get arrowPadding() { return props.arrowPadding ?? 5; },
    get sticky() { return props.sticky ?? false; },
    get disableAnchorTracking() { return props.disableAnchorTracking ?? false; },
    get collisionAvoidance() { return props.collisionAvoidance ?? POPUP_COLLISION_AVOIDANCE; },
    get mounted() { return store.state.mounted; },
    get open() { return store.state.open; },
    get keepMounted() { return keepMounted(); },
    get adaptiveOrigin() { return store.state.adaptiveOrigin; },
  });
  const state: TooltipPositionerState = {
    get open() { return store.state.open; },
    get side() { return positioning.side; },
    get align() { return positioning.align; },
    get anchorHidden() { return positioning.anchorHidden; },
    get instant() { return store.trackCursorAxis !== 'none' ? 'tracking-cursor' : store.instantType; },
  };
  return (
    <TooltipPositionerContext value={positioning}>
      {createPositioner(props, state, {
        get styles() { return positioning.positionerStyles; },
        get transitionStatus() { return store.state.transitionStatus; },
        props: elementProps,
        get refs() { return [props.ref, store.setPositionerElement, positioning.refs.setFloating]; },
        get hidden() { return !store.state.mounted; },
        get inert() { return !store.state.open || store.trackCursorAxis === 'both' || store.disableHoverablePopup; },
      })}
    </TooltipPositionerContext>
  );
}
export interface TooltipPositionerState {
  open: boolean;
  side: Side;
  align: Align;
  anchorHidden: boolean;
  instant: string | undefined;
}
export interface TooltipPositionerProps extends BaseUIComponentProps<'div', TooltipPositionerState, TooltipRenderProps>, UseAnchorPositioningSharedParameters {}
export namespace TooltipPositioner {
  export type State = TooltipPositionerState;
  export type Props = TooltipPositionerProps;
}
