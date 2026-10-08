import { omit } from 'solid-js';
import type { BaseUIComponentProps } from '../../internals/types';
import type { Side, Align } from '../../internals/createAnchorPositioning';
import { createRenderElement } from '../../internals/createRenderElement';
import { useSelectRootContext } from '../root/SelectRootContext';
import { useSelectPositionerContext } from '../positioner/SelectPositionerContext';
export function SelectArrow(props: SelectArrowProps) {
  const model = useSelectRootContext();
  const positioner = useSelectPositionerContext();
  return createRenderElement<SelectArrowState, HTMLElement, 'div', boolean>('div', props, {
    get enabled() { return !positioner.alignItemWithTriggerActive; }, ref: positioner.positioning.arrowRef,
    state: { get open() { return model.open; }, get side() { return positioner.side; }, get align() { return positioner.positioning.align; }, get uncentered() { return positioner.positioning.arrowUncentered; } },
    stateAttributesMapping: { open: open => ({ [open ? 'data-open' : 'data-closed']: '' }) },
    props: [{ 'aria-hidden': true, get style() { return positioner.positioning.arrowStyles; } }, omit(props, 'class', 'style', 'render')],
  });
}
export interface SelectArrowState { open: boolean; side: Side | 'none'; align: Align; uncentered: boolean }
export interface SelectArrowProps extends BaseUIComponentProps<'div', SelectArrowState> {}
export namespace SelectArrow { export type Props = SelectArrowProps; export type State = SelectArrowState }
