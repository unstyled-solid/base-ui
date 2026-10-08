import { omit } from 'solid-js';
import { createRegisteredLabelId } from '../../utils/createRegisteredLabelId';
import { createRenderElement } from '../../internals/createRenderElement';
import type { BaseUIComponentProps } from '../../internals/types';
import type { ProgressRootState } from '../root/ProgressRoot';
import { useProgressRootContext } from '../root/ProgressRootContext';
import { progressStateAttributesMapping } from '../root/stateAttributesMapping';

/** An accessible label for the progress bar. Renders a span. */
export function ProgressLabel(props: ProgressLabel.Props) {
  const context = useProgressRootContext();
  const id = createRegisteredLabelId(() => typeof props.id === 'string' ? props.id : undefined, context.setLabelId);
  return createRenderElement('span', props, {
    state: context.state,
    props: [{ get id() { return id(); }, role: 'presentation' }, omit(props, 'render', 'class', 'style', 'id')],
    stateAttributesMapping: progressStateAttributesMapping,
  });
}
export interface ProgressLabelState extends ProgressRootState {}
export interface ProgressLabelProps extends BaseUIComponentProps<'span', ProgressLabelState> {}
export namespace ProgressLabel {
  export type State = ProgressLabelState;
  export type Props = ProgressLabelProps;
}
