import { omit } from 'solid-js';
import type { BaseUIComponentProps } from '../../internals/types';
import type { Side, Align } from '../../internals/createAnchorPositioning';
import { createRenderElement } from '../../internals/createRenderElement';
import { useComboboxRootContext } from '../root/ComboboxRootContext';
import { useComboboxPositionerContext } from '../positioner/ComboboxPositionerContext';
import { popupStateMapping } from '../utils/stateAttributesMapping';
export interface ComboboxArrowState { open: boolean; side: Side; align: Align; uncentered: boolean }
export interface ComboboxArrowProps extends BaseUIComponentProps<'div', ComboboxArrowState> {}
export function ComboboxArrow(props: ComboboxArrowProps) {
  const model = useComboboxRootContext(); const positioning = useComboboxPositionerContext();
  return createRenderElement('div', props, { state: { get open() { return model.state.open; }, get side() { return positioning.side; }, get align() { return positioning.align; }, get uncentered() { return positioning.arrowUncentered; } },
    get ref() { return [props.ref, positioning.arrowRef]; }, stateAttributesMapping: popupStateMapping,
    props: [{ 'aria-hidden': true, get style() { return positioning.arrowStyles; } }, omit(props, 'class', 'style', 'render', 'ref')],
  });
}
export namespace ComboboxArrow { export type Props = ComboboxArrowProps; export type State = ComboboxArrowState }
