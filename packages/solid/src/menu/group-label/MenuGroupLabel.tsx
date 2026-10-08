import { createEffect } from 'solid-js';
import { createRenderElement } from '../../internals/createRenderElement';
import { createBaseUiId } from '../../internals/createBaseUiId';
import type { BaseUIComponentProps } from '../../internals/types';
import { elementProps } from '../utils/props';
import { useMenuGroupRootContext } from '../group/MenuGroupContext';
export interface MenuGroupLabelState {}
export interface MenuGroupLabelProps extends BaseUIComponentProps<'div', MenuGroupLabelState> {}
export function MenuGroupLabel(props: MenuGroupLabelProps) {
  const id = createBaseUiId(() => typeof props.id === 'string' ? props.id : undefined);
  const setLabel = useMenuGroupRootContext();
  createEffect(id, value => {
    setLabel(value);
    return () => { setLabel(current => current === value ? undefined : current); };
  });
  return createRenderElement('div', props, { get ref() { return props.ref; }, props: [{ get id() { return id(); }, 'aria-hidden': true }, elementProps(props, ['id'])] });
}
export namespace MenuGroupLabel { export type Props = MenuGroupLabelProps; export type State = MenuGroupLabelState }
