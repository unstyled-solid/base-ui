import { omit } from 'solid-js';
import { createRenderElement } from '../../internals/createRenderElement';
import type { BaseUIComponentProps } from '../../internals/types';
import type { MeterRootState } from '../root/MeterRoot';

/** Contains the indicator and represents the entire measurement range. */
export function MeterTrack(props: MeterTrack.Props) {
  return createRenderElement('div', props, { props: omit(props, 'render', 'class', 'style') });
}
export interface MeterTrackState extends MeterRootState {}
export interface MeterTrackProps extends BaseUIComponentProps<'div', MeterTrackState> {}
export namespace MeterTrack {
  export type State = MeterTrackState;
  export type Props = MeterTrackProps;
}
