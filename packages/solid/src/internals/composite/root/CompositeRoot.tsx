import { createEffect, createSignal, merge, omit, untrack, type Accessor } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { createRenderElement } from '../../createRenderElement';
import { CompositeList, type CompositeMetadata } from '../list/CompositeList';
import { CompositeRootContext } from './CompositeRootContext';
import { useDirection } from '../../direction-context';
import type { BaseUIComponentProps, HTMLProps, StateAttributesMapping } from '../../types';
import type { InputRef } from '../../../utils/createMergedRefs';
import { mergeProps } from '../../../merge-props';
import { isListIndexDisabled } from '../../../floating-ui-react/utils/composite';
import { scrollIntoViewIfNeeded } from '../composite';
import { isElementDisabled } from '../../../utils/isElementDisabled';
export interface CompositeRootState { orientation: 'horizontal' | 'vertical' | 'both'; highlightedIndex: number }
type Pipeline = readonly (Record<string, any> | ((props: Record<string, any>) => Record<string, any>) | undefined)[];
/** Like native ref APIs, callers know the concrete host their render callback supplies. */
export type CompositeRef = HTMLElement | { call(element: HTMLElement | null): void }['call'] | { current: HTMLElement | null } | CompositeRef[] | null | undefined;
export function normalizeCompositeRefs(refs: readonly CompositeRef[]): InputRef<HTMLElement>[] {
  return refs.flatMap((ref) => Array.isArray(ref) ? normalizeCompositeRefs(ref) : ref == null ? [] : [ref]);
}
export interface CompositeRootProps<M = {}, S extends object = CompositeRootState> extends Omit<BaseUIComponentProps<'div', S, JSX.HTMLAttributes<any>>, 'ref'> {
  state?: S | undefined; refs?: readonly CompositeRef[] | undefined;
  props?: Pipeline | undefined; stateAttributesMapping?: StateAttributesMapping<S> | undefined;
  tag?: keyof JSX.IntrinsicElements | undefined; orientation?: CompositeRootState['orientation'] | undefined;
  loopFocus?: boolean | undefined; highlightedIndex?: number | undefined;
  onHighlightedIndexChange?: ((index: number) => void) | undefined;
  onNavigate?: ((target: HTMLElement, event: KeyboardEvent) => void) | undefined;
  disabledIndices?: readonly number[] | undefined; cols?: number | undefined; dense?: boolean | undefined;
  enableHomeAndEndKeys?: boolean | undefined; stopEventPropagation?: boolean | undefined;
  direction?: 'ltr' | 'rtl' | undefined; modifierKeys?: readonly string[] | undefined;
  highlightItemOnHover?: boolean | undefined;
  rootRef?: InputRef<HTMLElement> | { current: HTMLElement | null } | undefined;
  onMapChange?: ((map: Map<Node, CompositeMetadata<M>>) => void) | undefined;
  onLoop?: ((event: KeyboardEvent, previous: number, next: number, elements: { current: (HTMLElement | null)[] }) => number) | undefined;
  grid?: ((state: any) => number) | undefined;
}
export type UseCompositeRootParameters = CompositeRootProps;
export function createCompositeRoot(params: CompositeRootProps): {
  getRootProps(props?: HTMLProps): JSX.HTMLAttributes<HTMLElement>;
  readonly highlightedIndex: Accessor<number>;
  props: JSX.HTMLAttributes<HTMLElement>; elementsRef: { current: (HTMLElement | null)[] };
  onMapChange(map: Map<Node, CompositeMetadata<unknown>>): void;
  onHighlightedIndexChange(index: number): void; relayKeyboardEvent(event: KeyboardEvent): void;
} {
  const direction = useDirection();
  const [internal, setInternal] = createSignal(0);
  const highlightedIndex = () => params.highlightedIndex ?? internal();
  const elementsRef = { current: [] as (HTMLElement | null)[] };
  let root: HTMLElement | null = null;
  let highlighted: HTMLElement | null = null;
  let initialized = false;
  const disabled = (index: number) => {
    const node = elementsRef.current[index];
    return !node || isListIndexDisabled(elementsRef.current, index, params.disabledIndices);
  };
  const fallback = () => {
    let first = -1;
    for (let i = 0; i < elementsRef.current.length; i++) {
      if (disabled(i)) continue;
      if (elementsRef.current[i]!.hasAttribute('data-composite-item-active')) return i;
      if (first < 0) first = i;
    }
    return Math.max(first, 0);
  };
  const change = (index: number) => {
    highlighted = elementsRef.current[index] ?? null;
    if (params.onHighlightedIndexChange) params.onHighlightedIndexChange(index);
    else setInternal(index);
  };
  const onMapChange = () => untrack(() => {
    if (!elementsRef.current.length) return;
    const previousIndex = highlightedIndex();
    if (!initialized) { initialized = true; change(fallback()); return; }
    const index = elementsRef.current.indexOf(highlighted);
    if (index >= 0 && index !== previousIndex) change(index);
    else if (index < 0) {
      if (disabled(previousIndex)) change(fallback());
      else highlighted = elementsRef.current[previousIndex] ?? null;
    }
  });
  createEffect(() => ({ disabled: params.disabledIndices, external: params.highlightedIndex, index: highlightedIndex() }), (next) => {
    if (initialized && next.disabled && next.external === undefined && isListIndexDisabled(elementsRef.current, next.index, next.disabled)) {
      const first = elementsRef.current.findIndex((node, index) => node && !isListIndexDisabled(elementsRef.current, index, next.disabled));
      if (first >= 0) untrack(() => change(first));
    }
  });
  const onKeyDown = (event: KeyboardEvent) => {
    const homeEnd = event.key === 'Home' || event.key === 'End';
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key) || (homeEnd && !params.enableHomeAndEndKeys)) return;
    if (['Alt', 'Control', 'Meta', 'Shift'].some((key) => !params.modifierKeys?.includes(key) && event.getModifierState(key))) return;
    if (!root) return;
    const orientation = params.orientation ?? 'both';
    const rtl = (params.direction ?? direction()) === 'rtl';
    const forward = orientation === 'vertical' ? 'ArrowDown' : rtl ? 'ArrowLeft' : 'ArrowRight';
    const backward = orientation === 'vertical' ? 'ArrowUp' : rtl ? 'ArrowRight' : 'ArrowLeft';
    const target = event.composedPath()[0] as HTMLInputElement;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') && !isElementDisabled(target)) {
      if (target.selectionStart == null || event.shiftKey || target.selectionStart !== target.selectionEnd) return;
      if (event.key !== backward && target.selectionStart < target.value.length) return;
      if (event.key !== forward && target.selectionStart > 0) return;
    }
    const eligible = elementsRef.current.map((_, i) => i).filter((i) => !disabled(i));
    if (!eligible.length) return;
    const previous = highlightedIndex();
    let next = previous;
    const isForward = (orientation !== 'vertical' && event.key === (rtl ? 'ArrowLeft' : 'ArrowRight')) || (orientation !== 'horizontal' && event.key === 'ArrowDown');
    const isBackward = (orientation !== 'vertical' && event.key === (rtl ? 'ArrowRight' : 'ArrowLeft')) || (orientation !== 'horizontal' && event.key === 'ArrowUp');
    if (params.grid) next = params.grid({ disabledIndices: params.disabledIndices, elementsRef, event, highlightedIndex: previous, loopFocus: params.loopFocus ?? true, minIndex: eligible[0], maxIndex: eligible.at(-1), onLoop: params.onLoop, orientation, rtl });
    if (homeEnd) next = event.key === 'Home' ? eligible[0]! : eligible.at(-1)!;
    if (next === previous && (isForward || isBackward)) {
      next = isForward ? eligible.find((i) => i > previous) ?? -1 : [...eligible].reverse().find((i) => i < previous) ?? -1;
      if (next < 0 && (params.loopFocus ?? true)) {
        next = isForward ? eligible[0]! : eligible.at(-1)!;
        next = params.onLoop?.(event, previous, next, elementsRef) ?? next;
      }
    }
    if (next < 0 || next === previous || !elementsRef.current[next]) return;
    if (params.stopEventPropagation) event.stopPropagation();
    event.preventDefault();
    change(next);
    scrollIntoViewIfNeeded(root, elementsRef.current[next]!, rtl ? 'rtl' : 'ltr', orientation);
    params.onNavigate?.(elementsRef.current[next]!, event);
    queueMicrotask(() => { if (root?.isConnected) elementsRef.current[next]?.focus(); });
  };
  const props: JSX.HTMLAttributes<HTMLElement> = {
    ref(node) { root = node; const ref = params.rootRef; if (typeof ref === 'function') ref(node); else if (ref && 'current' in ref) ref.current = node; },
    onKeyDown,
    // React's source onFocus bubbles; native focus does not. Observe focusin
    // on the container to retain selected text on descendant keyboard entry.
    onFocusIn(event) { const target = event.composedPath()[0] as HTMLInputElement; if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') && target.selectionStart != null) target.setSelectionRange(0, target.value.length); },
  };
  return { props, getRootProps: (external = {}) => mergeProps<any>(props, external), highlightedIndex, elementsRef, onMapChange, onHighlightedIndexChange: change, relayKeyboardEvent: onKeyDown };
}
export function CompositeRoot<M = {}, S extends object = CompositeRootState>(componentProps: CompositeRootProps<M, S>): JSX.Element {
  const api = createCompositeRoot(merge(componentProps, { get stopEventPropagation() { return componentProps.stopEventPropagation ?? true; } }) as CompositeRootProps);
  const elementProps = omit(componentProps, (key) => ['state', 'refs', 'props', 'stateAttributesMapping', 'tag', 'orientation', 'loopFocus', 'highlightedIndex', 'onHighlightedIndexChange', 'onNavigate', 'disabledIndices', 'cols', 'dense', 'enableHomeAndEndKeys', 'stopEventPropagation', 'direction', 'modifierKeys', 'highlightItemOnHover', 'rootRef', 'onMapChange', 'onLoop', 'grid', 'render', 'class', 'style'].includes(String(key)));
  const context = { get highlightedIndex() { return api.highlightedIndex(); }, get highlightItemOnHover() { return componentProps.highlightItemOnHover ?? false; }, onHighlightedIndexChange: api.onHighlightedIndexChange, relayKeyboardEvent: api.relayKeyboardEvent };
  function Host() {
    return createRenderElement<S, HTMLElement>(() => componentProps.tag ?? 'div', componentProps, {
      get state() { return componentProps.state ?? { get orientation() { return componentProps.orientation ?? 'both'; }, get highlightedIndex() { return api.highlightedIndex(); } } as S; },
      get ref() { return normalizeCompositeRefs(componentProps.refs ?? []); }, get props() { return [api.props, ...(componentProps.props ?? []), elementProps]; },
      get stateAttributesMapping() { return componentProps.stateAttributesMapping; },
    });
  }
  return <CompositeRootContext value={context}><CompositeList<M> elementsRef={api.elementsRef} onMapChange={(map) => { componentProps.onMapChange?.(map); api.onMapChange(map); }}>
    <Host />
  </CompositeList></CompositeRootContext>;
}
export { createCompositeRoot as useCompositeRoot };
export namespace CompositeRoot { export type Props<M, S extends object> = CompositeRootProps<M, S>; export type State = CompositeRootState }
