import { omit } from 'solid-js';
import type { BaseUIComponentProps } from '../../internals/types';
import type { Side, Align } from '../../internals/createAnchorPositioning';
import { createRenderElement } from '../../internals/createRenderElement';
import { useToastPositionerContext } from '../positioner/ToastPositionerContext';
export function ToastArrow(props: ToastArrowProps) {
  const positioning = useToastPositionerContext();
  return createRenderElement('div', props, { get ref() { return [props.ref, positioning.arrowRef]; }, state: {
    get side() { return positioning.side; }, get align() { return positioning.align; }, get uncentered() { return positioning.arrowUncentered; },
  }, props: [{ 'aria-hidden': true, get style() { return positioning.arrowStyles; } }, omit(props, 'render', 'class', 'style', 'ref')] });
}
export interface ToastArrowState { side: Side; align: Align; uncentered: boolean }
export interface ToastArrowProps extends BaseUIComponentProps<'div', ToastArrowState> {}
export namespace ToastArrow { export type Props = ToastArrowProps; export type State = ToastArrowState }
