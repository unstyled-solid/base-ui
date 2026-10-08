import { createEffect, omit } from 'solid-js';
import type { BaseUIComponentProps } from '../../internals/types';
import { createRenderElement } from '../../internals/createRenderElement';
import { createBaseUiId } from '../../internals/createBaseUiId';
import { useComboboxGroupContext } from '../group/ComboboxGroupContext';
export interface ComboboxGroupLabelState {}
export interface ComboboxGroupLabelProps extends BaseUIComponentProps<'div', ComboboxGroupLabelState> {}
export function ComboboxGroupLabel(props: ComboboxGroupLabelProps) {
  const group = useComboboxGroupContext(); const id = createBaseUiId(() => typeof props.id === 'string' ? props.id : undefined);
  createEffect(id, (id) => { group.setLabelId(id); return () => { group.setLabelId((current) => current === id ? undefined : current); }; });
  return createRenderElement('div', props, { get ref() { return props.ref; }, props: [{ 'aria-hidden': true, get id() { return id(); } }, omit(props, 'class', 'style', 'render', 'ref', 'id')] });
}
export namespace ComboboxGroupLabel { export type Props = ComboboxGroupLabelProps; export type State = ComboboxGroupLabelState }
