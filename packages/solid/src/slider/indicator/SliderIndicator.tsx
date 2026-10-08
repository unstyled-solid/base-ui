import { omit } from 'solid-js';
import type { JSX } from '@solidjs/web';
import type { BaseUIComponentProps } from '../../internals/types';
import { createRenderElement } from '../../internals/createRenderElement';
import { createIsHydrating } from '../../utils/createIsHydrating';
import { valueToPercent } from '../../utils/valueToPercent';
import { useSliderRootContext } from '../root/SliderRootContext';
import { sliderStateAttributesMapping } from '../root/stateAttributesMapping';
import type { SliderRootState } from '../root/SliderRoot';
export function getIndicatorStyles(vertical: boolean, range: boolean, inset: boolean, start: number | undefined, end: number | undefined, forceHidden: boolean): JSX.CSSProperties {
  const style: JSX.CSSProperties = {
    visibility: forceHidden || (inset && (start === undefined || (range && end === undefined))) ? 'hidden' : undefined,
    position: vertical ? 'absolute' : 'relative', [vertical ? 'width' : 'height']: 'inherit',
  };
  let startValue = `${start ?? 0}%`;
  let size = `${(end ?? 0) - (start ?? 0)}%`;
  if (inset) {
    style['--start-position'] = startValue;
    startValue = 'var(--start-position)';
    if (range) { style['--relative-size'] = size; size = 'var(--relative-size)'; }
  }
  style[vertical ? 'bottom' : 'inset-inline-start'] = range ? startValue : 0;
  style[vertical ? 'height' : 'width'] = range ? size : startValue;
  return style;
}
export function SliderIndicator(props: SliderIndicatorProps) {
  const context = useSliderRootContext();
  const hydrating = createIsHydrating();
  return createRenderElement('div', props, { state: context.state, stateAttributesMapping: sliderStateAttributesMapping,
    props: [{
      get 'data-base-ui-slider-indicator'() { return context.renderBeforeHydration ? '' : undefined; },
      get style() { return getIndicatorStyles(context.orientation === 'vertical', context.values.length > 1, context.inset,
        context.inset ? context.indicatorPosition[0] : valueToPercent(context.values[0], context.min, context.max),
        context.inset ? context.indicatorPosition[1] : valueToPercent(context.values.at(-1)!, context.min, context.max),
        context.inset && context.renderBeforeHydration && hydrating()); },
    }, omit(props, 'class', 'style', 'render')],
  });
}
export interface SliderIndicatorState extends SliderRootState {}
export interface SliderIndicatorProps extends BaseUIComponentProps<'div', SliderIndicatorState, JSX.HTMLAttributes<HTMLElement>> {}
export namespace SliderIndicator { export type State = SliderIndicatorState; export type Props = SliderIndicatorProps }
