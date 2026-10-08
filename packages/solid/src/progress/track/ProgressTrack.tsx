import { omit } from 'solid-js';
import { createRenderElement } from '../../internals/createRenderElement';
import type { BaseUIComponentProps } from '../../internals/types';
import type { ProgressRootState } from '../root/ProgressRoot';
import { useProgressRootContext } from '../root/ProgressRootContext';
import { progressStateAttributesMapping } from '../root/stateAttributesMapping';

/** Contains the progress indicator. Renders a div. */
export function ProgressTrack(props: ProgressTrack.Props) {
  const context = useProgressRootContext();
  return createRenderElement('div', props, {
    state: context.state,
    props: omit(props, 'render', 'class', 'style'),
    stateAttributesMapping: progressStateAttributesMapping,
  });
}
export interface ProgressTrackState extends ProgressRootState {}
export interface ProgressTrackProps extends BaseUIComponentProps<'div', ProgressTrackState> {}
export namespace ProgressTrack {
  export type State = ProgressTrackState;
  export type Props = ProgressTrackProps;
}
