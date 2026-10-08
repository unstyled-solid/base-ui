import { omit } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { createRenderElement } from '../../internals/createRenderElement';
import type { BaseUIComponentProps } from '../../internals/types';
import type { ProgressRootState } from '../root/ProgressRoot';
import { useProgressRootContext } from '../root/ProgressRootContext';
import { progressStateAttributesMapping } from '../root/stateAttributesMapping';

/** Displays the current formatted value. Renders a span. */
export function ProgressValue(props: ProgressValue.Props) {
  const context = useProgressRootContext();
  return createRenderElement('span', props, {
    state: context.state,
    props: [{
      'aria-hidden': true,
      get children() {
        const indeterminate = context.state.status === 'indeterminate';
        return typeof props.children === 'function'
          ? props.children(indeterminate ? 'indeterminate' : context.formattedValue, context.value)
          : indeterminate ? null : context.formattedValue;
      },
    }, omit(props, 'render', 'class', 'style', 'children')],
    stateAttributesMapping: progressStateAttributesMapping,
  });
}
export interface ProgressValueState extends ProgressRootState {}
export interface ProgressValueProps extends Omit<BaseUIComponentProps<'span', ProgressValueState>, 'children'> {
  children?: null | ((formattedValue: string | null, value: number | null) => JSX.Element) | undefined;
}
export namespace ProgressValue {
  export type State = ProgressValueState;
  export type Props = ProgressValueProps;
}
