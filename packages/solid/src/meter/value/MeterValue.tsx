import { omit } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { createRenderElement } from '../../internals/createRenderElement';
import type { BaseUIComponentProps } from '../../internals/types';
import type { MeterRootState } from '../root/MeterRoot';
import { useMeterRootContext } from '../root/MeterRootContext';

/** Displays the formatted measurement. Renders a span. */
export function MeterValue(props: MeterValue.Props) {
  const context = useMeterRootContext();
  return createRenderElement('span', props, {
    props: [{
      'aria-hidden': true,
      get children() {
        return typeof props.children === 'function'
          ? props.children(context.formattedValue, context.value)
          : context.formattedValue;
      },
    }, omit(props, 'render', 'class', 'style', 'children')],
  });
}
export interface MeterValueState extends MeterRootState {}
export interface MeterValueProps extends Omit<BaseUIComponentProps<'span', MeterValueState>, 'children'> {
  children?: null | ((formattedValue: string, value: number) => JSX.Element);
}
export namespace MeterValue {
  export type State = MeterValueState;
  export type Props = MeterValueProps;
}
