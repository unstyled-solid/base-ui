import { omit } from 'solid-js';
import type { BaseUIComponentProps } from '../../internals/types';
import { createPositioner } from '../../utils/createPositioner';
import { createAnchorPositioning, type UseAnchorPositioningSharedParameters, type Side, type Align } from '../../internals/createAnchorPositioning';
import { createAnchoredPopupScrollLock } from '../../utils/createAnchoredPopupScrollLock';
import { InternalBackdrop } from '../../utils/InternalBackdrop';
import { useComboboxRootContext } from '../root/ComboboxRootContext';
import { useComboboxPortalContext } from '../portal/ComboboxPortalContext';
import { ComboboxPositionerContext } from './ComboboxPositionerContext';
import { popupStateMapping } from '../utils/stateAttributesMapping';
export interface ComboboxPositionerState { open: boolean; side: Side; align: Align; anchorHidden: boolean; empty: boolean }
export interface ComboboxPositionerProps extends BaseUIComponentProps<'div', ComboboxPositionerState>, UseAnchorPositioningSharedParameters {}
export function ComboboxPositioner(props: ComboboxPositionerProps) {
  const model = useComboboxRootContext();
  const keepMounted = useComboboxPortalContext();
  const positioning = createAnchorPositioning({
    get anchor() { return props.anchor ?? (model.state.inputInsidePopup ? model.state.triggerElement : model.state.inputGroupElement ?? model.state.inputElement); },
    rootContext: model.floating, get mounted() { return model.state.mounted; }, get open() { return model.state.open; }, get keepMounted() { return keepMounted(); },
    get side() { return props.side; }, get align() { return props.align; }, get sideOffset() { return props.sideOffset; }, get alignOffset() { return props.alignOffset; },
    get positionMethod() { return props.positionMethod; }, get collisionBoundary() { return props.collisionBoundary; }, get collisionPadding() { return props.collisionPadding; },
    get arrowPadding() { return props.arrowPadding; }, get sticky() { return props.sticky; }, get disableAnchorTracking() { return props.disableAnchorTracking; },
    get collisionAvoidance() { return props.collisionAvoidance ?? { side: 'flip', align: 'shift', fallbackAxisSide: 'none' }; }, lazyFlip: true,
  });
  createAnchoredPopupScrollLock(() => model.state.open && model.state.modal, () => model.state.openMethod === 'touch', () => model.state.positionerElement, () => model.state.triggerElement);
  const state: ComboboxPositionerState = {
    get open() { return model.state.open; }, get side() { return positioning.side; }, get align() { return positioning.align; },
    get anchorHidden() { return positioning.anchorHidden; }, get empty() { return !model.derived.filteredItems.length; },
  };
  const setElement = (element: HTMLDivElement | null) => {
      positioning.refs.setFloating(element); model.popup.setPositionerElement(element);
      if (element) model.setPositioningResult(positioning);
      else model.setPositioningResult((current) => current === positioning ? null : current);
  };
  const element = () => createPositioner<ComboboxPositionerState, HTMLDivElement>(props, state, {
    get refs() { return [props.ref, setElement]; }, get styles() { return positioning.positionerStyles; },
    get hidden() { return !model.state.mounted; }, get inert() { return !model.state.open; }, get transitionStatus() { return model.state.transitionStatus; },
    props: omit(props, 'class', 'style', 'render', 'ref', 'anchor', 'positionMethod', 'side', 'align', 'sideOffset', 'alignOffset', 'collisionBoundary', 'collisionPadding', 'arrowPadding', 'sticky', 'disableAnchorTracking', 'collisionAvoidance'),
  });
  return <ComboboxPositionerContext value={positioning}>
    {model.state.mounted && model.state.modal && <InternalBackdrop inert={!model.state.open} cutout={model.state.inputGroupElement ?? model.state.inputElement ?? model.state.triggerElement} />}
    {element()}
  </ComboboxPositionerContext>;
}
export namespace ComboboxPositioner { export type Props = ComboboxPositionerProps; export type State = ComboboxPositionerState }
