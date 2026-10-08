import { createMemo, omit } from 'solid-js';
import type { JSX } from '@solidjs/web';
import type { BaseUIComponentProps } from '../../internals/types';
import { createRenderElement } from '../../internals/createRenderElement';
import { formatNumber } from '../../utils/formatNumber';
import { useSliderRootContext } from '../root/SliderRootContext';
import { sliderStateAttributesMapping } from '../root/stateAttributesMapping';
import type { SliderRootState } from '../root/SliderRoot';
export function SliderValue(props: SliderValueProps) {
  const context = useSliderRootContext();
  const formatted = createMemo(() => context.values.map((value) => formatNumber(value, context.locale, context.format)));
  return createRenderElement('output', props, { state: context.state, stateAttributesMapping: sliderStateAttributesMapping,
    props: [{
      get 'aria-live'() { return props['aria-live'] ?? 'off'; },
      get for() { return Array.from(context.thumbMap.values(), (thumb) => thumb.inputId).join(' ').trim() || undefined; },
      get children() { return typeof props.children === 'function' ? props.children(formatted(), context.values) : formatted().join(' – '); },
    }, omit(props, 'class', 'style', 'render', 'children', 'aria-live')],
  });
}
export interface SliderValueState extends SliderRootState {}
export interface SliderValueProps extends Omit<BaseUIComponentProps<'output', SliderValueState, JSX.HTMLAttributes<HTMLElement>>, 'children'> {
  children?: null | ((formattedValues: readonly string[], values: readonly number[]) => JSX.Element);
}
export namespace SliderValue { export type State = SliderValueState; export type Props = SliderValueProps }
