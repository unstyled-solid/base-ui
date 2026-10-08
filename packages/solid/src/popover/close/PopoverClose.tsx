import { omit } from 'solid-js';
import { createButton } from '../../internals/use-button/useButton';
import { createRenderElement } from '../../internals/createRenderElement';
import { createChangeEventDetails } from '../../internals/createBaseUIEventDetails';
import type { BaseUIComponentProps } from '../../internals/contracts/render';
import { usePopoverRootContext } from '../root/PopoverRootContext';
import { createClosePartRegistration } from '../../utils/closePart';

export function PopoverClose(props: PopoverCloseProps) {
  const store = usePopoverRootContext();
  createClosePartRegistration();
  const button = createButton({
    get disabled() { return props.disabled ?? false; },
    get native() { return props.nativeButton ?? true; },
    focusableWhenDisabled: false,
  });
  const elementProps = omit(props, 'render', 'class', 'style', 'ref', 'nativeButton', 'disabled', 'children');
  const childProps = omit(props, (key) => key !== 'children');
  return createRenderElement('button', props, {
    get ref() { return [props.ref, button.buttonRef]; },
    props: [{ onClick(event: MouseEvent) { store.setOpen(false, createChangeEventDetails('close-press', event)); } },
      elementProps, button.getButtonProps, childProps],
  });
}
export interface PopoverCloseState {}
export interface PopoverCloseProps extends BaseUIComponentProps<'button', PopoverCloseState> { nativeButton?: boolean; disabled?: boolean }
export namespace PopoverClose {
  export type Props = PopoverCloseProps;
  export type State = PopoverCloseState;
}
