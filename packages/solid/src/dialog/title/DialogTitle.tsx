import { omit, createEffect } from 'solid-js';
import type { BaseUIComponentProps } from '../../internals/types';
import { createBaseUiId } from '../../internals/createBaseUiId';
import { createRenderElement } from '../../internals/createRenderElement';
import { useDialogRootContext } from '../root/DialogRootContext';

export function DialogTitle(props: DialogTitleProps) {
  const store = useDialogRootContext();
  const id = createBaseUiId(() => props.id);
  createEffect(() => store, (value) => value.registerLabel('title', id));
  return createRenderElement('h2', props, {
    props: [{ get id() { return id(); } }, omit(props, 'class', 'style', 'render', 'id')],
  });
}
export interface DialogTitleState {}
export interface DialogTitleProps extends BaseUIComponentProps<'h2', DialogTitleState> { id?: string }
export namespace DialogTitle { export type Props = DialogTitleProps; export type State = DialogTitleState; }
