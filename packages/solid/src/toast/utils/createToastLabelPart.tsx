import { children, createEffect, createMemo, createSignal, omit, type Setter } from 'solid-js';
import { isServer } from '@solidjs/web';
import type { BaseUIComponentProps } from '../../internals/types';
import { createBaseUiId } from '../../internals/createBaseUiId';
import { createRenderElement } from '../../internals/createRenderElement';
import { ownerWindow } from '../../utils/owner';
import { useToastRootContext } from '../root/ToastRootContext';
import { getRenderedHost, hasRenderableChildren, hasServerRenderableChildren, isRenderableNode } from './isRenderableNode';

export interface ToastLabelState { type: string | undefined }
export function createToastLabelPart(props: BaseUIComponentProps<'div', ToastLabelState>, part: 'title' | 'description') {
  const root = useToastRootContext();
  const id = createBaseUiId(() => typeof props.id === 'string' ? props.id : undefined);
  const [node, setNode] = createSignal<HTMLElement | null>(null, { ownedWrite: true });
  const [customContent, setCustomContent] = createSignal(false);
  const content = children(() => props.children ?? root.toast[part]);
  const element = createRenderElement(part === 'title' ? 'h2' : 'p', props, {
    get ref() { return [props.ref, setNode]; }, state: { get type() { return root.toast.type; } },
    props: [omit(props, 'render', 'class', 'style', 'ref', 'children', 'id'), { get id() { return id(); }, get children() { return content(); } }],
  });
  // Resolve the custom host even while excluded from the document. Otherwise its
  // ref never attaches and a render callback with its own children cannot appear.
  const resolved = children(() => element);
  const visible = () => props.render ? (isServer ? hasServerRenderableChildren(resolved()) : customContent()) : isRenderableNode(content());
  const setId: Setter<string | undefined> = part === 'title' ? root.setTitleId : root.setDescriptionId;
  const registration = createMemo(() => ({ show: visible(), id: id() }), {
    equals: (previous, next) => previous.show === next.show && previous.id === next.id,
  });
  createEffect(registration, ({ show, id: currentId }) => {
    if (!show) return;
    setId(currentId);
    return () => { setId((current) => current === currentId ? undefined : current); };
  });
  createEffect(() => [node() ?? getRenderedHost(resolved()), props.render, content()] as const, ([element, render]) => {
    if (!element || !render) { setCustomContent(false); return; }
    const inspect = () => { setCustomContent(hasRenderableChildren(element)); };
    inspect();
    const observer = new (ownerWindow(element).MutationObserver)(inspect);
    observer.observe(element, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  });
  return <>{(() => { const host = resolved(); return visible() ? host : null; })()}</>;
}
