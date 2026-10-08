import { createSignal, omit } from 'solid-js';
import { isElement } from '@floating-ui/utils/dom';
import type { BaseUIComponentProps } from '../../internals/types';
import { createAnchorPositioning, type Side, type Align, type UseAnchorPositioningSharedParameters } from '../../internals/createAnchorPositioning';
import { createFloatingRoot } from '../../floating-ui-react/components/createFloatingRoot';
import { createPositioner } from '../../utils/createPositioner';
import { POPUP_COLLISION_AVOIDANCE } from '../../internals/constants';
import { useToastProviderContext } from '../provider/ToastProviderContext';
import { ToastPositionerContext } from './ToastPositionerContext';
import type { ToastObject } from '../useToastManager';
import { selectors } from '../store';

export function ToastPositioner(props: ToastPositionerProps) {
  const store = useToastProviderContext();
  const [element, setElement] = createSignal<HTMLDivElement | null>(null, { ownedWrite: true });
  const anchor = () => { const value = props.anchor === undefined ? props.toast.positionerProps?.anchor : props.anchor; return isElement(value) ? value : null; };
  const root = createFloatingRoot({ state: {
    open: true, transitionStatus: undefined, floatingId: undefined,
    get domReferenceElement() { return anchor(); }, get referenceElement() { return anchor(); },
    get positionReference() { return anchor(); }, get floatingElement() { return element(); },
  } });
  const get = <K extends keyof UseAnchorPositioningSharedParameters>(key: K, fallback: UseAnchorPositioningSharedParameters[K]) =>
    props[key] === undefined ? props.toast.positionerProps?.[key] ?? fallback : props[key];
  const positioning = createAnchorPositioning({
    rootContext: root, mounted: true, open: true, keepMounted: true,
    get anchor() { return anchor(); }, get positionMethod() { return get('positionMethod', 'absolute'); },
    get side() { return get('side', 'top'); }, get align() { return get('align', 'center'); },
    get sideOffset() { return get('sideOffset', 0); }, get alignOffset() { return get('alignOffset', 0); },
    get collisionBoundary() { return get('collisionBoundary', 'clipping-ancestors'); }, get collisionPadding() { return get('collisionPadding', 5); },
    get arrowPadding() { return get('arrowPadding', 5); }, get sticky() { return get('sticky', false); },
    get disableAnchorTracking() { return get('disableAnchorTracking', false); },
    get collisionAvoidance() { return get('collisionAvoidance', POPUP_COLLISION_AVOIDANCE); },
  });
  const state: ToastPositionerState = {
      get side() { return positioning.side; }, get align() { return positioning.align; }, get anchorHidden() { return positioning.anchorHidden; },
  };
  return <ToastPositionerContext value={positioning}>{createPositioner(props, state, {
    get refs() { return [props.ref, setElement, positioning.refs.setFloating]; },
    get transitionStatus() { return props.toast.transitionStatus; },
    get styles() { return {
      ...positioning.positionerStyles,
      '--toast-index': props.toast.transitionStatus === 'ending' ? selectors.toastIndex(store.snapshot(), props.toast.id) : selectors.toastVisibleIndex(store.snapshot(), props.toast.id),
    }; },
    props: omit(props, 'render', 'class', 'style', 'ref', 'toast', 'anchor', 'positionMethod', 'side', 'align', 'sideOffset', 'alignOffset', 'collisionBoundary', 'collisionPadding', 'arrowPadding', 'sticky', 'disableAnchorTracking', 'collisionAvoidance'),
  })}</ToastPositionerContext>;
}
export interface ToastPositionerState { side: Side; align: Align; anchorHidden: boolean }
export interface ToastPositionerProps extends BaseUIComponentProps<'div', ToastPositionerState>, Omit<UseAnchorPositioningSharedParameters, 'anchor'> { anchor?: Element | null | undefined; toast: ToastObject }
export namespace ToastPositioner { export type Props = ToastPositionerProps; export type State = ToastPositionerState }
