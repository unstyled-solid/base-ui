import { children, createEffect, createSignal, omit } from 'solid-js';
import { isServer } from '@solidjs/web';
import type { BaseUIComponentProps, NativeButtonProps } from '../../internals/types';
import { createButton } from '../../internals/use-button/useButton';
import { createRenderElement } from '../../internals/createRenderElement';
import { ownerWindow } from '../../utils/owner';
import { useToastRootContext } from '../root/ToastRootContext';
import { isRenderableNode, getRenderedHost, hasRenderableChildren, hasServerRenderableChildren } from '../utils/isRenderableNode';
export function ToastAction(props: ToastActionProps) {
  const root = useToastRootContext();
  const [node, setNode] = createSignal<HTMLButtonElement | null>(null, { ownedWrite: true });
  const [customContent, setCustomContent] = createSignal(false);
  const content = children(() => root.toast.actionProps?.children ?? props.children);
  const button = createButton({ get disabled() { return props.disabled === '' || props.disabled === true; }, get native() { return props.nativeButton ?? true; } });
  const element = createRenderElement('button', props, { get ref() { return [props.ref, button.buttonRef, setNode]; },
    state: { get type() { return root.toast.type; } }, get props() { return [
      omit(props, 'render', 'class', 'style', 'ref', 'nativeButton'), root.toast.actionProps,
      button.getButtonProps, { get children() { return content(); } },
    ]; },
  });
  const resolved = children(() => element);
  createEffect(() => [node() ?? getRenderedHost(resolved()), props.render, content()] as const, ([element, render]) => {
    if (!element || !render) { setCustomContent(false); return; }
    const inspect = () => { setCustomContent(hasRenderableChildren(element)); };
    inspect();
    const observer = new (ownerWindow(element).MutationObserver)(inspect);
    observer.observe(element, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  });
  return <>{(() => {
    const host = resolved();
    const visible = props.render ? (isServer ? hasServerRenderableChildren(host) : customContent()) : isRenderableNode(content());
    return visible ? host : null;
  })()}</>;
}
export interface ToastActionState { type: string | undefined }
export interface ToastActionProps extends NativeButtonProps, BaseUIComponentProps<'button', ToastActionState> {}
export namespace ToastAction { export type Props = ToastActionProps; export type State = ToastActionState }
