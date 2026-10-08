import { createEffect, omit } from 'solid-js';
import { createBaseUiId } from '../../internals/createBaseUiId';
import { createRenderElement } from '../../internals/createRenderElement';
import type { BaseUIComponentProps } from '../../internals/contracts/render';
import { usePopoverRootContext } from '../root/PopoverRootContext';

export function PopoverDescription(props: PopoverDescriptionProps) {
  const store = usePopoverRootContext();
  const id = createBaseUiId(() => props.id);
  createEffect(id, (value) => store.registerLabel('description', value));
  return createRenderElement('p', props, {
    get ref() { return props.ref; },
    props: [omit(props, 'render', 'class', 'style', 'ref', 'id'), { get id() { return id(); } }],
  });
}
export interface PopoverDescriptionState {}
export interface PopoverDescriptionProps extends BaseUIComponentProps<'p', PopoverDescriptionState> { id?: string }
export namespace PopoverDescription {
  export type Props = PopoverDescriptionProps;
  export type State = PopoverDescriptionState;
}
