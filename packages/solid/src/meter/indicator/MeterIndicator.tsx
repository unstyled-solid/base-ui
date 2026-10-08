import { omit } from 'solid-js';
import { createRenderElement } from '../../internals/createRenderElement';
import type { BaseUIComponentProps } from '../../internals/types';
import type { MeterRootState } from '../root/MeterRoot';
import { useMeterRootContext } from '../root/MeterRootContext';

/** Visualizes the position of the value along the range. Renders a div. */
export function MeterIndicator(props: MeterIndicator.Props) {
  const context = useMeterRootContext();
  return createRenderElement('div', props, {
    props: [{
      get style() { return { 'inset-inline-start': '0', height: 'inherit', width: `${context.percentageValue}%` }; },
    }, omit(props, 'render', 'class', 'style')],
  });
}
export interface MeterIndicatorState extends MeterRootState {}
export interface MeterIndicatorProps extends BaseUIComponentProps<'div', MeterIndicatorState> {}
export namespace MeterIndicator {
  export type State = MeterIndicatorState;
  export type Props = MeterIndicatorProps;
}
