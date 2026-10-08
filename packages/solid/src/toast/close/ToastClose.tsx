import { createSignal, omit } from 'solid-js';
import type { BaseUIComponentProps, NativeButtonProps } from '../../internals/types';
import { createButton } from '../../internals/use-button/useButton';
import { createRenderElement } from '../../internals/createRenderElement';
import { useToastRootContext } from '../root/ToastRootContext';
import { useToastProviderContext } from '../provider/ToastProviderContext';
export function ToastClose(props: ToastCloseProps) {
  const root = useToastRootContext(), store = useToastProviderContext();
  const [focused, setFocused] = createSignal(false);
  const button = createButton({ get disabled() { return props.disabled === '' || props.disabled === true; }, get native() { return props.nativeButton ?? true; } });
  return createRenderElement('button', props, { get ref() { return [props.ref, button.buttonRef]; }, state: { get type() { return root.toast.type; } }, props: [
    { get 'aria-hidden'() { return !root.expanded && !focused(); },
      onClick() { store.closeToast(root.toast.id); }, onFocus() { setFocused(true); }, onBlur() { setFocused(false); } },
    omit(props, 'render', 'class', 'style', 'ref', 'nativeButton'), button.getButtonProps,
  ] });
}
export interface ToastCloseState { type: string | undefined }
export interface ToastCloseProps extends NativeButtonProps, BaseUIComponentProps<'button', ToastCloseState> {}
export namespace ToastClose { export type Props = ToastCloseProps; export type State = ToastCloseState }
