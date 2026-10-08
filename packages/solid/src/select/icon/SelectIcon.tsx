import { omit } from 'solid-js';
import type { BaseUIComponentProps } from '../../internals/types';
import { createRenderElement } from '../../internals/createRenderElement';
import { useSelectRootContext } from '../root/SelectRootContext';
export function SelectIcon(props: SelectIconProps) {
  const model = useSelectRootContext();
  return createRenderElement('span', props, {
    state: { get open() { return model.open; } },
    stateAttributesMapping: { open: open => open ? { 'data-popup-open': '' } : null },
    props: [{ 'aria-hidden': true, children: '▼' }, omit(props, 'class', 'style', 'render')],
  });
}
export interface SelectIconState { open: boolean }
export interface SelectIconProps extends BaseUIComponentProps<'span', SelectIconState> {}
export namespace SelectIcon { export type Props = SelectIconProps; export type State = SelectIconState }
