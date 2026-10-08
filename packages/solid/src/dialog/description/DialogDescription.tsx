import { omit, createEffect } from 'solid-js';
import type { BaseUIComponentProps } from '../../internals/types';
import { createBaseUiId } from '../../internals/createBaseUiId';
import { createRenderElement } from '../../internals/createRenderElement';
import { useDialogRootContext } from '../root/DialogRootContext';

export function DialogDescription(props: DialogDescriptionProps) {
  const store = useDialogRootContext();
  const id = createBaseUiId(() => props.id);
  createEffect(() => store, (value) => value.registerLabel('description', id));
  return createRenderElement('p', props, {
    props: [{ get id() { return id(); } }, omit(props, 'class', 'style', 'render', 'id')],
  });
}
export interface DialogDescriptionState {}
export interface DialogDescriptionProps extends BaseUIComponentProps<'p', DialogDescriptionState> { id?: string }
export namespace DialogDescription { export type Props = DialogDescriptionProps; export type State = DialogDescriptionState; }
