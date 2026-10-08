import { createMemo, createSignal, omit } from 'solid-js';
import type { BaseUIComponentProps } from '../../internals/types';
import { createRenderElement } from '../../internals/createRenderElement';
import { clamp } from '../../utils/clamp';
import { formatNumber } from '../../utils/formatNumber';
import { valueToPercent } from '../../utils/valueToPercent';
import { visuallyHidden } from '../../utils/visuallyHidden';
import { MeterRootContext } from './MeterRootContext';

/** Groups the meter parts and exposes the measurement to assistive technology. */
export function MeterRoot(props: MeterRoot.Props) {
  const [labelId, setLabelId] = createSignal<string>();
  const min = () => props.min ?? 0;
  const max = () => props.max ?? 100;
  const percentageValue = createMemo(() => {
    const percentage = valueToPercent(props.value, min(), max());
    return clamp(Number.isNaN(percentage) ? 0 : percentage, 0, 100);
  });
  const clampedValue = createMemo(() => clamp(Number.isNaN(props.value) ? min() : props.value, min(), max()));
  const formattedValue = createMemo(() => props.format
    ? formatNumber(clampedValue(), props.locale, props.format)
    : formatNumber(percentageValue() / 100, props.locale, { style: 'percent' }));
  const context: MeterRootContext = {
    get formattedValue() { return formattedValue(); },
    get percentageValue() { return percentageValue(); },
    get value() { return props.value; },
    setLabelId,
  };
  const elementProps = omit(props, 'format', 'getAriaValueText', 'locale', 'max', 'min', 'value', 'render', 'class', 'style', 'children');
  // Construct the host within the provider so lazy children inherit the required context.
  return <MeterRootContext value={context}>
    {createRenderElement('div', props, {
      props: [{
        role: 'meter',
        get 'aria-labelledby'() { return labelId(); },
        get 'aria-valuemin'() { return min(); },
        get 'aria-valuemax'() { return max(); },
        get 'aria-valuenow'() { return clampedValue(); },
        get 'aria-valuetext'() { return props.getAriaValueText ? props.getAriaValueText(formattedValue(), props.value) : formattedValue(); },
        get children() {
          return <>{props.children}<span role="presentation" style={visuallyHidden}>x</span></>;
        },
      }, elementProps],
    })}
  </MeterRootContext>;
}

export interface MeterRootState {}
export interface MeterRootProps extends BaseUIComponentProps<'div', MeterRootState> {
  format?: Intl.NumberFormatOptions;
  getAriaValueText?: (formattedValue: string, value: number) => string;
  locale?: Intl.LocalesArgument;
  /** @default 100 */
  max?: number;
  /** @default 0 */
  min?: number;
  value: number;
}
export namespace MeterRoot {
  export type State = MeterRootState;
  export type Props = MeterRootProps;
}
