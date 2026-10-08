import { createEffect, createSignal, omit } from 'solid-js';
import type { BaseUIComponentProps } from '../../internals/types';
import { createRenderElement } from '../../internals/createRenderElement';
import { ownerWindow } from '../../utils/owner';
import { useToastRootContext } from '../root/ToastRootContext';
export function ToastContent(props: ToastContentProps) {
  const root = useToastRootContext();
  const [element, setElement] = createSignal<HTMLDivElement | null>(null, { ownedWrite: true });
  createEffect(element, (node) => {
    if (!node) return;
    root.recalculateHeight();
    const win = ownerWindow(node);
    if (typeof win.ResizeObserver !== 'function' || typeof win.MutationObserver !== 'function') return;
    const resize = new win.ResizeObserver(() => root.recalculateHeight());
    const mutation = new win.MutationObserver(() => root.recalculateHeight());
    resize.observe(node);
    mutation.observe(node, { childList: true, subtree: true, characterData: true });
    return () => { resize.disconnect(); mutation.disconnect(); };
  });
  return createRenderElement('div', props, { get ref() { return [props.ref, setElement]; }, state: {
    get expanded() { return root.expanded; }, get behind() { return root.visibleIndex > 0; },
  }, props: omit(props, 'render', 'class', 'style', 'ref') });
}
export interface ToastContentState { expanded: boolean; behind: boolean }
export interface ToastContentProps extends BaseUIComponentProps<'div', ToastContentState> {}
export namespace ToastContent { export type Props = ToastContentProps; export type State = ToastContentState }
