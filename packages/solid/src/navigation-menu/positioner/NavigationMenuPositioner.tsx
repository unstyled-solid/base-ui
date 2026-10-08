import { createEffect, createSignal, omit, onSettled, untrack } from 'solid-js';
import { usePortalContext } from '../../floating-ui-react/components/PortalContext';
import { createAnchorPositioning, type UseAnchorPositioningSharedParameters, type Side, type Align } from '../../internals/createAnchorPositioning';
import { createPositioner } from '../../utils/createPositioner';
import type { BaseUIComponentProps } from '../../internals/types';
import { createTimeout } from '../../utils/createTimeout';
import { disableFocusInside, enableFocusInside, isOutsideEvent } from '../../floating-ui-react/utils/tabbable';
import { useNavigationMenuRootContext } from '../root/NavigationMenuRootContext';
import { useNavigationMenuPortalContext } from '../portal/NavigationMenuPortalContext';
import { NavigationMenuPositionerContext } from './NavigationMenuPositionerContext';
import { DROPDOWN_COLLISION_AVOIDANCE, POPUP_COLLISION_AVOIDANCE } from '../../internals/constants';

export function NavigationMenuPositioner(props: NavigationMenuPositioner.Props) {
  const root = useNavigationMenuRootContext();
  const keepMounted = useNavigationMenuPortalContext();
  const portal = usePortalContext();
  onSettled(() => portal ? root.registerLogicalLayer(portal.layer) : undefined);
  const [instant, setInstant] = createSignal(untrack(() => root.open));
  const initialTimeout = createTimeout(); const resizeTimeout = createTimeout();
  let initial = untrack(() => root.open);
  const positioning = createAnchorPositioning({
    get rootContext() { return root.floatingRootContext; },
    nodeId: root.nodeId,
    get anchor() { return props.anchor ?? root.activeTrigger; },
    get mounted() { return root.mounted; }, get open() { return root.open; }, get keepMounted() { return keepMounted(); },
    get positionMethod() { return props.positionMethod ?? 'absolute'; }, get side() { return props.side ?? 'bottom'; },
    get align() { return props.align ?? 'center'; }, get sideOffset() { return props.sideOffset ?? 0; }, get alignOffset() { return props.alignOffset ?? 0; },
    get collisionBoundary() { return props.collisionBoundary ?? 'clipping-ancestors'; }, get collisionPadding() { return props.collisionPadding ?? 5; },
    get arrowPadding() { return props.arrowPadding ?? 5; }, get sticky() { return props.sticky ?? false; },
    get disableAnchorTracking() { return props.disableAnchorTracking ?? false; },
    get collisionAvoidance() { return props.collisionAvoidance ?? (root.nested ? POPUP_COLLISION_AVOIDANCE : DROPDOWN_COLLISION_AVOIDANCE); },
    adaptiveOrigin: true,
    shift: { rootBoundary: 'layoutViewport' },
  });
  createEffect(() => ({ open: root.open, element: root.positionerElement }), ({ open, element }) => {
    if (!element) return;
    let locked = false;
    const focus = (event: FocusEvent) => {
      if (!isOutsideEvent(event)) return;
      if (event.type === 'focusin' && locked) { enableFocusInside(element); locked = false; }
      else if (event.type === 'focusout' && !locked) { disableFocusInside(element); locked = true; }
    };
    element.addEventListener('focusin', focus, true); element.addEventListener('focusout', focus, true);
    const win = element.ownerDocument.defaultView;
    const resize = () => { setInstant(true); resizeTimeout.start(100, () => setInstant(false)); };
    if (open) {
      if (initial) initialTimeout.start(0, () => { initial = false; if (!resizeTimeout.isStarted()) setInstant(false); });
      win?.addEventListener('resize', resize);
    }
    return () => {
      initialTimeout.clear(); resizeTimeout.clear();
      element.removeEventListener('focusin', focus, true); element.removeEventListener('focusout', focus, true);
      win?.removeEventListener('resize', resize); if (locked) enableFocusInside(element);
    };
  });
  const state: NavigationMenuPositioner.State = {
    get open() { return root.open; }, get side() { return positioning.side; }, get align() { return positioning.align; },
    get anchorHidden() { return positioning.anchorHidden; }, get instant() { return instant(); },
  };
  const rest = omit(props, 'anchor', 'positionMethod', 'side', 'align', 'sideOffset', 'alignOffset', 'collisionBoundary', 'collisionPadding', 'collisionAvoidance', 'arrowPadding', 'sticky', 'disableAnchorTracking', 'class', 'style', 'render', 'ref');
  return <NavigationMenuPositionerContext value={positioning}>
    {createPositioner(props, state, {
      get refs() { return [props.ref, root.setPositionerElement, positioning.refs.setFloating]; },
      get props() { return rest; },
      get styles() { return positioning.positionerStyles; },
      get transitionStatus() { return root.transitionStatus; },
      get hidden() { return !root.mounted; }, get inert() { return !root.open; },
    })}
  </NavigationMenuPositionerContext>;
}
export interface NavigationMenuPositionerState { open: boolean; side: Side; align: Align; anchorHidden: boolean; instant: boolean }
export interface NavigationMenuPositionerProps extends UseAnchorPositioningSharedParameters, BaseUIComponentProps<'div', NavigationMenuPositionerState> {}
export namespace NavigationMenuPositioner { export type State = NavigationMenuPositionerState; export type Props = NavigationMenuPositionerProps }
