import { createEffect, createMemo, createSignal, omit, onCleanup, untrack } from 'solid-js';
import type { BaseUIComponentProps } from '../../internals/types';
import { createAnchorPositioning, type UseAnchorPositioningSharedParameters, type Side, type Align } from '../../internals/createAnchorPositioning';
import { createPositioner } from '../../utils/createPositioner';
import { CompositeList } from '../../internals/composite';
import { findItemIndex, defaultItemEquality } from '../../internals/itemEquality';
import { createChangeEventDetails } from '../../internals/createBaseUIEventDetails';
import { createAnchoredPopupScrollLock } from '../../utils/createAnchoredPopupScrollLock';
import { InternalBackdrop } from '../../utils/InternalBackdrop';
import { DROPDOWN_COLLISION_AVOIDANCE } from '../../internals/constants';
import { useSelectRootContext } from '../root/SelectRootContext';
import { SelectPositionerContext } from './SelectPositionerContext';

export function SelectPositioner(props: SelectPositionerProps) {
  const model = useSelectRootContext();
  const [fallback, setAlignFallback] = createSignal(false);
  const [layoutRevision, setLayoutRevision] = createSignal(0);
  let requestedAlignment = untrack(() => props.alignItemWithTrigger ?? true);
  const aligned = createMemo(() => {
    const mounted = model.mounted;
    if (!mounted) requestedAlignment = props.alignItemWithTrigger ?? true;
    return mounted && requestedAlignment && !fallback() && model.openMethod !== 'touch';
  });
  model.alignment = aligned;
  onCleanup(() => { model.alignment = () => false; model.popupSide = () => null; });
  createEffect(() => model.mounted, mounted => { if (!mounted) setAlignFallback(false); });
  const positioning = createAnchorPositioning({
    get rootContext() { return model.popup.state.floatingRootContext; },
    // Pinned Select keeps geometry alive for the full mounted lifetime, including
    // a touch exit. Closing is not a new unpositioned geometry generation.
    get mounted() { return model.mounted; }, keepMounted: true,
    // Select's source root supplies its trigger even before an open is accepted.
    // The shared popup root only exposes an active trigger while mounted.
    get anchor() { const anchor = props.anchor; return (typeof anchor === 'function' ? anchor() : anchor) ?? model.triggerElement; }, get positionMethod() { return props.positionMethod; },
    get side() { return props.side; }, get align() { return props.align; },
    get sideOffset() { return props.sideOffset; }, get alignOffset() { return props.alignOffset; },
    get collisionBoundary() { return props.collisionBoundary ?? 'clipping-ancestors'; },
    get collisionPadding() { return props.collisionPadding; }, get arrowPadding() { return props.arrowPadding; },
    get sticky() { return props.sticky; }, get disableAnchorTracking() { return props.disableAnchorTracking ?? aligned(); },
    get collisionAvoidance() { return props.collisionAvoidance ?? DROPDOWN_COLLISION_AVOIDANCE; },
  });
  model.popupSide = () => positioning.side;
  createAnchoredPopupScrollLock(() => (aligned() || model.modal) && model.open, () => model.openMethod === 'touch', () => model.positionerElement, () => model.triggerElement);
  const scrollUpArrow = { current: null as HTMLElement | null };
  const scrollDownArrow = { current: null as HTMLElement | null };
  const side = () => aligned() ? 'none' as const : positioning.side;
  const state: SelectPositionerState = {
    get open() { return model.open; }, get side() { return side(); },
    get align() { return positioning.align; }, get anchorHidden() { return positioning.anchorHidden; },
  };
  let previousSize = 0;
  function onMapChange(map: Map<Node, { value: any; index: number | null }>) {
    const values = [...map.values()].map(item => item.value);
    if (values.length === 0 && previousSize === 0) return;
    const { value, comparer, multiple } = untrack(() => ({ value: model.value.value(), comparer: model.props.isItemEqualToValue ?? defaultItemEquality, multiple: model.multiple }));
    const size = values.length;
    if (previousSize > 0) {
      if (!multiple && value !== null && findItemIndex(values, value, comparer) === -1) {
        model.setValue(model.initialValue != null && findItemIndex(values, model.initialValue, comparer) !== -1 ? model.initialValue : null, createChangeEventDetails('none'));
      } else if (multiple && Array.isArray(value)) {
        const next = value.filter(item => findItemIndex(values, item, comparer) !== -1);
        if (next.length !== value.length) model.setValue(next, createChangeEventDetails('none'));
      }
    }
    previousSize = size;
    if (model.open && aligned()) {
      model.clearScroll();
      model.positionerElement?.style.removeProperty('height');
      model.popupElement?.style.removeProperty('height');
    }
    setLayoutRevision(revision => revision + 1);
  }
  const Host = () => createPositioner(props, state, {
    refs: [model.setPositionerElement, positioning.refs.setFloating],
    get styles() { return aligned() ? { position: 'fixed' as const } : positioning.positionerStyles; },
    get transitionStatus() { return model.transitionStatus; },
    get hidden() { return !model.mounted; }, get inert() { return !model.open; },
    props: omit(props, 'class', 'style', 'render', 'anchor', 'positionMethod', 'side', 'align', 'sideOffset', 'alignOffset', 'collisionBoundary', 'collisionPadding', 'arrowPadding', 'sticky', 'disableAnchorTracking', 'collisionAvoidance', 'alignItemWithTrigger'),
  });
  return <CompositeList<{ value: any }> elementsRef={model.listRef} labelsRef={model.labelsRef} onMapChange={onMapChange}>
    <SelectPositionerContext value={{ positioning, get side() { return side(); }, get alignItemWithTriggerActive() { return aligned(); }, get layoutRevision() { return layoutRevision(); }, setAlignFallback, scrollUpArrow, scrollDownArrow }}>
      {model.mounted && model.modal ? <InternalBackdrop inert={!model.open} cutout={model.triggerElement} /> : null}
      <Host />
    </SelectPositionerContext>
  </CompositeList>;
}
export interface SelectPositionerState { open: boolean; side: Side | 'none'; align: Align; anchorHidden: boolean }
export interface SelectPositionerProps extends UseAnchorPositioningSharedParameters, BaseUIComponentProps<'div', SelectPositionerState> { alignItemWithTrigger?: boolean }
export namespace SelectPositioner { export type Props = SelectPositionerProps; export type State = SelectPositionerState }
