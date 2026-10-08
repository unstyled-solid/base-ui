import { useDialogRootContext } from '../../dialog/root/DialogRootContext';
import { createRenderElement } from '../../internals/createRenderElement';
import type { BaseUIComponentProps } from '../../internals/types';
import { DRAWER_CONTENT_ATTRIBUTE } from './drawerContentAttribute';
export function DrawerContent(props: DrawerContentProps) {
  useDialogRootContext();
  return createRenderElement('div', props, {
    props: [{ [DRAWER_CONTENT_ATTRIBUTE]: '' }, omit(props, 'render', 'class', 'style')],
  });
}
export interface DrawerContentState {}
export interface DrawerContentProps extends BaseUIComponentProps<'div', DrawerContentState> {}
export namespace DrawerContent { export type Props = DrawerContentProps; export type State = DrawerContentState; }
import { omit } from 'solid-js';
