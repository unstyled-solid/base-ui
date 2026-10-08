import { omit } from 'solid-js';
import { createRenderElement } from '../../internals/createRenderElement';
import type { BaseUIComponentProps } from '../../internals/types';
import { createRegisteredLabelId } from '../../utils/createRegisteredLabelId';
import { useFieldsetRootContext } from '../root/FieldsetRootContext';

/** An accessible label associated with the fieldset. Renders a `<div>` element. */
export function FieldsetLegend(componentProps: FieldsetLegend.Props) {
  const elementProps = omit(componentProps, 'render', 'class', 'style', 'id');
  const context = useFieldsetRootContext();
  const id = createRegisteredLabelId(() => componentProps.id, context.setLegendId);
  const state: FieldsetLegendState = { get disabled() { return context.disabled; } };
  return createRenderElement('div', componentProps, {
    state,
    props: [{ get id() { return id(); } }, elementProps],
  });
}

export interface FieldsetLegendState { disabled: boolean }
export interface FieldsetLegendProps extends BaseUIComponentProps<'div', FieldsetLegendState> {
  id?: string;
}
export namespace FieldsetLegend {
  export type State = FieldsetLegendState;
  export type Props = FieldsetLegendProps;
}
