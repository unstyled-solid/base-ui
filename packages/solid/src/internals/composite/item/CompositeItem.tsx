import { omit } from 'solid-js';
import type { JSX } from '@solidjs/web';
import type { BaseUIComponentProps, StateAttributesMapping } from '../../types';
import type { InputRef } from '../../../utils/createMergedRefs';
import { createRenderElement } from '../../createRenderElement';
import { createCompositeListItem } from '../list/createCompositeListItem';
import { useCompositeRootContext } from '../root/CompositeRootContext';
import { normalizeCompositeRefs, type CompositeRef } from '../root/CompositeRoot';
export interface CompositeItemProps<M = {}, S extends object = { index: number | null }> extends Omit<BaseUIComponentProps<'div', S, JSX.HTMLAttributes<any>>, 'ref'> {
  ref?: CompositeRef;
  state?: S | undefined; metadata?: M | undefined; refs?: readonly CompositeRef[] | undefined;
  props?: readonly (Record<string, any> | ((props: Record<string, any>) => Record<string, any>) | undefined)[] | undefined;
  stateAttributesMapping?: StateAttributesMapping<S> | undefined; tag?: keyof JSX.IntrinsicElements | undefined;
  index?: number | undefined; disabled?: boolean | undefined; label?: string | null | undefined;
}
export function createCompositeItem<M = {}>(props: { metadata?: M | undefined; index?: number | undefined; label?: string | null | undefined } = {}) {
  const context = useCompositeRootContext()!;
  const item = createCompositeListItem<M>({ get metadata() { return props.metadata; }, get index() { return props.index; }, get label() { return props.label; } });
  let node: HTMLElement | null = null;
  const ref = (element: HTMLElement | null) => { node = element; item.ref(element); };
  const compositeProps = {
    get tabIndex() { return context.highlightedIndex === item.index ? 0 : -1; },
    onFocus() { if (item.index !== null) context.onHighlightedIndexChange(item.index); },
    onMouseMove() { if (context.highlightItemOnHover && node && context.highlightedIndex !== item.index && !node.hasAttribute('disabled') && node.getAttribute('aria-disabled') !== 'true') node.focus(); },
  };
  return { compositeProps, compositeRef: ref, get index() { return item.index; } };
}
export function CompositeItem<M = {}, S extends object = { index: number | null }>(props: CompositeItemProps<M, S>): JSX.Element {
  const item = createCompositeItem(props);
  const elementProps = omit(props, (key) => ['state', 'metadata', 'refs', 'props', 'stateAttributesMapping', 'tag', 'index', 'label', 'render', 'class', 'style'].includes(String(key)));
  return createRenderElement<S, HTMLElement>(() => props.tag ?? 'div', props, {
    get state() { return props.state ?? { get index() { return item.index; } } as S; },
    get ref() { return normalizeCompositeRefs([item.compositeRef, ...(props.refs ?? []), props.ref]); },
    get props() { return [item.compositeProps, ...(props.props ?? []), elementProps]; },
    get stateAttributesMapping() { return props.stateAttributesMapping; },
  });
}
export { createCompositeItem as useCompositeItem };
export interface CompositeItemState {}
export namespace CompositeItem { export type Props<M, S extends object> = CompositeItemProps<M, S>; export type State = CompositeItemState }
