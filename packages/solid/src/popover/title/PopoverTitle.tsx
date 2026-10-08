import { createEffect, omit } from 'solid-js';
import { createBaseUiId } from '../../internals/createBaseUiId';
import { createRenderElement } from '../../internals/createRenderElement';
import type { BaseUIComponentProps } from '../../internals/contracts/render';
import { usePopoverRootContext } from '../root/PopoverRootContext';

export function PopoverTitle(props: PopoverTitleProps) {
  const store = usePopoverRootContext();
  const id = createBaseUiId(() => props.id);
  createEffect(id, (value) => store.registerLabel('title', value));
  return createRenderElement('h2', props, {
    get ref() { return props.ref; },
    props: [omit(props, 'render', 'class', 'style', 'ref', 'id'), { get id() { return id(); } }],
  });
}
export interface PopoverTitleState {}
export interface PopoverTitleProps extends BaseUIComponentProps<'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6', PopoverTitleState> { id?: string }
export namespace PopoverTitle {
  export type Props = PopoverTitleProps;
  export type State = PopoverTitleState;
}
