import { omit } from 'solid-js';
import type { BaseUIComponentProps } from '../../internals/types';
import { createRenderElement } from '../../internals/createRenderElement';
import { createButton } from '../../internals/use-button/useButton';
import { createChangeEventDetails } from '../../internals/createBaseUIEventDetails';
import { useDialogRootContext } from '../root/DialogRootContext';

export function DialogClose(props: DialogCloseProps) {
  const store = useDialogRootContext();
  const button = createButton({ get disabled() { return props.disabled ?? false; }, get native() { return props.nativeButton ?? true; } });
  const state = { get disabled() { return props.disabled ?? false; } };
  return createRenderElement<DialogCloseState, HTMLButtonElement>('button', props, {
    state,
    ref: button.buttonRef,
    propGetter: button.getButtonProps,
    props: [
      { onClick(event: MouseEvent) { if (store.state.open) store.setOpen(false, createChangeEventDetails('close-press', event)); } },
      omit(props, 'class', 'style', 'render', 'nativeButton', 'disabled'),
    ],
  });
}
export interface DialogCloseState { disabled: boolean }
export interface DialogCloseProps extends BaseUIComponentProps<'button', DialogCloseState> { nativeButton?: boolean; disabled?: boolean }
export namespace DialogClose { export type Props = DialogCloseProps; export type State = DialogCloseState; }
