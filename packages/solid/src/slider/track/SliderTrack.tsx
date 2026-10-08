import { omit } from 'solid-js';
import type { JSX } from '@solidjs/web';
import type { BaseUIComponentProps } from '../../internals/types';
import { createRenderElement } from '../../internals/createRenderElement';
import { useSliderRootContext } from '../root/SliderRootContext';
import { sliderStateAttributesMapping } from '../root/stateAttributesMapping';
import type { SliderRootState } from '../root/SliderRoot';
export function SliderTrack(props: SliderTrackProps) {
  const context = useSliderRootContext();
  return createRenderElement('div', props, { state: context.state, stateAttributesMapping: sliderStateAttributesMapping,
    props: [{ style: { position: 'relative' } }, omit(props, 'class', 'style', 'render')],
  });
}
export interface SliderTrackState extends SliderRootState {}
export interface SliderTrackProps extends BaseUIComponentProps<'div', SliderTrackState, JSX.HTMLAttributes<HTMLElement>> {}
export namespace SliderTrack { export type State = SliderTrackState; export type Props = SliderTrackProps }
