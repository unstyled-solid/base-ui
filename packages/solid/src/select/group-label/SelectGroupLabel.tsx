import { createEffect, omit } from 'solid-js';
import type { BaseUIComponentProps } from '../../internals/types';
import { createBaseUiId } from '../../internals/createBaseUiId';
import { createRenderElement } from '../../internals/createRenderElement';
import { useSelectGroupContext } from '../group/SelectGroupContext';
export function SelectGroupLabel(props: SelectGroupLabelProps) {
  const group = useSelectGroupContext();
  const id = createBaseUiId(() => typeof props.id === 'string' ? props.id : undefined);
  createEffect(id, next => {
    group.setLabelId(next);
    return () => group.setLabelId(current => current === next ? undefined : current);
  });
  return createRenderElement('div', props, { props: [{ get id() { return id(); }, 'aria-hidden': true }, omit(props, 'class', 'style', 'render', 'id')] });
}
export interface SelectGroupLabelState {}
export interface SelectGroupLabelProps extends BaseUIComponentProps<'div', SelectGroupLabelState> {}
export namespace SelectGroupLabel { export type Props = SelectGroupLabelProps; export type State = SelectGroupLabelState }
