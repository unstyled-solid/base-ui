import { createMemo, createSignal, omit } from 'solid-js';
import { createRenderElement } from '../../internals/createRenderElement';
import type { BaseUIComponentProps } from '../../internals/types';
import { clamp } from '../../utils/clamp';
import { formatNumber } from '../../utils/formatNumber';
import { valueToPercent } from '../../utils/valueToPercent';
import { visuallyHidden } from '../../utils/visuallyHidden';
import { ProgressRootContext } from './ProgressRootContext';
import { progressStateAttributesMapping } from './stateAttributesMapping';

/** Groups the progress parts and exposes task completion to assistive technology. */
export function ProgressRoot(props: ProgressRoot.Props) {
  const [labelId, setLabelId] = createSignal<string>();
  const min = () => props.min === undefined ? 0 : props.min;
  const max = () => props.max === undefined ? 100 : props.max;
  // One derivation drives ARIA, visible text, fill and completion, as in upstream.
  const range = createMemo(() => {
    const value = props.value;
    if (value == null || !Number.isFinite(value)) {
      return { status: 'indeterminate' as const, percentageValue: null, clampedValue: null, formattedValue: '' };
    }
    const rawPercentage = valueToPercent(value, min(), max());
    const percentageValue = clamp(Number.isNaN(rawPercentage) ? 0 : rawPercentage, 0, 100);
    const clampedValue = clamp(value, min(), max());
    return {
      status: clampedValue === max() ? 'complete' as const : 'progressing' as const,
      percentageValue,
      clampedValue,
      formattedValue: props.format
        ? formatNumber(clampedValue, props.locale, props.format)
        : formatNumber(percentageValue / 100, props.locale, { style: 'percent' }),
    };
  });
  const state: ProgressRootState = { get status() { return range().status; } };
  const context: ProgressRootContext = {
    get formattedValue() { return range().formattedValue; },
    get percentageValue() { return range().percentageValue; },
    get value() { return props.value; },
    setLabelId,
    state,
  };
  const elementProps = omit(props, 'format', 'getAriaValueText', 'locale', 'max', 'min', 'value', 'render', 'class', 'style', 'children');
  const defaults = {
    role: 'progressbar',
    get 'aria-labelledby'() { return labelId(); },
    get 'aria-valuemax'() { return max(); },
    get 'aria-valuemin'() { return min(); },
    get 'aria-valuenow'() { return range().clampedValue ?? undefined; },
    get 'aria-valuetext'() {
      return props.getAriaValueText
        ? props.getAriaValueText(range().formattedValue, props.value)
        : state.status === 'indeterminate' ? 'indeterminate progress' : range().formattedValue;
    },
    get children() {
      return <>{props.children}<span role="presentation" style={visuallyHidden}>x</span></>;
    },
  };
  // Create the host under the provider so lazy children inherit the required context.
  return <ProgressRootContext value={context}>
    {createRenderElement('div', props, { state, props: [defaults, elementProps], stateAttributesMapping: progressStateAttributesMapping })}
  </ProgressRootContext>;
}

export type ProgressStatus = 'indeterminate' | 'progressing' | 'complete';
export interface ProgressRootState { status: ProgressStatus; }
export interface ProgressRootProps extends BaseUIComponentProps<'div', ProgressRootState> {
  format?: Intl.NumberFormatOptions | undefined;
  getAriaValueText?: ((formattedValue: string, value: number | null) => string) | undefined;
  locale?: Intl.LocalesArgument | undefined;
  /** @default 100 */
  max?: number | undefined;
  /** @default 0 */
  min?: number | undefined;
  /** Null and non-finite values are indeterminate. */
  value: number | null;
}
export namespace ProgressRoot {
  export type State = ProgressRootState;
  export type Props = ProgressRootProps;
}
