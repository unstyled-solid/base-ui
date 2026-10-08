import { omit } from 'solid-js';
import { createRenderElement } from '../../internals/createRenderElement';
import type { BaseUIComponentProps } from '../../internals/types';
import type { ProgressRootState } from '../root/ProgressRoot';
import { useProgressRootContext } from '../root/ProgressRootContext';
import { progressStateAttributesMapping } from '../root/stateAttributesMapping';

/** Visualizes task completion. Renders a div. */
export function ProgressIndicator(props: ProgressIndicator.Props) {
  const context = useProgressRootContext();
  return createRenderElement('div', props, {
    state: context.state,
    props: [{ get style() {
      return context.percentageValue == null ? {} : {
        'inset-inline-start': '0', height: 'inherit', width: `${context.percentageValue}%`,
      };
    } }, omit(props, 'render', 'class', 'style')],
    stateAttributesMapping: progressStateAttributesMapping,
  });
}
export interface ProgressIndicatorState extends ProgressRootState {}
export interface ProgressIndicatorProps extends BaseUIComponentProps<'div', ProgressIndicatorState> {}
export namespace ProgressIndicator {
  export type State = ProgressIndicatorState;
  export type Props = ProgressIndicatorProps;
}
