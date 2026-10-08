import { createEffect, createMemo, createSignal, omit, untrack } from 'solid-js';
import type { BaseUIComponentProps } from '../../internals/types';
import type { TransitionStatus } from '../../internals/contracts/core';
import { createRenderElement } from '../../internals/createRenderElement';
import { transitionStatusMapping } from '../../internals/stateAttributesMapping';
import { createAnimationsFinished } from '../../internals/createAnimationsFinished';
import { createToastSwipe } from '../../utils/createToastSwipe';
import { activeElement, contains } from '../../utils/shadowDom';
import { ownerDocument } from '../../utils/owner';
import { useToastProviderContext } from '../provider/ToastProviderContext';
import { ToastRootContext } from './ToastRootContext';
import { selectors } from '../store';
import type { ToastObject } from '../useToastManager';
import type { StateAttributesMapping } from '../../internals/getStateAttributesProps';

type Direction = 'up' | 'down' | 'left' | 'right';
export const toastRootStateAttributesMapping: StateAttributesMapping<ToastRootState> = {
  ...transitionStatusMapping,
  swipeDirection: (value) => value ? { 'data-swipe-direction': value } : null,
};
export function ToastRoot(props: ToastRootProps) {
  const store = useToastProviderContext();
  // Native refs and label cleanup can detach during owned subtree disposal.
  const [element, setElement] = createSignal<HTMLDivElement | null>(null, { ownedWrite: true });
  const [titleId, setTitleId] = createSignal<string | undefined>(undefined, { ownedWrite: true });
  const [descriptionId, setDescriptionId] = createSignal<string | undefined>(undefined, { ownedWrite: true });
  // Geometry lookup is ID-based; content retains the caller's live transformed object.
  const toast = () => props.toast;
  const expanded = () => selectors.expanded(store.snapshot());
  const visibleIndex = () => selectors.toastVisibleIndex(store.snapshot(), props.toast.id);
  const directions = createMemo<Direction[]>(() => {
    if (toast().positionerProps?.anchor !== undefined) return [];
    const value = props.swipeDirection ?? ['down', 'right'];
    return Array.isArray(value) ? value : [value];
  }, { equals: (a, b) => a.length === b.length && a.every((direction, index) => direction === b[index]) });
  const swipe = createToastSwipe({
    element, directions,
    onStart() { store.set('hovering', true); },
    onDismiss() { store.closeToast(props.toast.id); },
  });
  const recalculateHeight = () => untrack(() => {
    const node = element();
    if (!node) return;
    const height = node.style.height;
    node.style.height = 'auto';
    const measured = node.offsetHeight;
    node.style.height = height;
    const current = selectors.toast(store.state, props.toast.id);
    if (current?.height === measured && current.ref === element && current.transitionStatus === undefined) return;
    store.updateToastInternal(props.toast.id, { height: measured, ref: element, transitionStatus: undefined });
  });
  let lastId: string | undefined;
  createEffect(() => [element(), props.toast.id, toast().transitionStatus] as const, ([node, id, status]) => {
    if (!node || (id === lastId && status !== 'starting')) return;
    if (lastId !== undefined) swipe.reset();
    if (lastId !== undefined && lastId !== id) {
      const previous = selectors.toast(store.state, lastId);
      if (previous?.ref === element) store.updateToastInternal(lastId, { ref: undefined });
    }
    lastId = id;
    recalculateHeight();
  });
  // A remounted root registers even when it receives an already initialized toast.
  createEffect(element, (node) => {
    if (node) recalculateHeight();
    return () => {
      const current = selectors.toast(store.state, lastId ?? '');
      if (current?.ref === element) store.updateToastInternal(current.id, { ref: undefined });
    };
  });
  createAnimationsFinished({ element, enabled: () => toast().transitionStatus === 'ending', onFinished() {
    untrack(() => {
      const current = selectors.toast(store.state, props.toast.id);
      if (current?.transitionStatus === 'ending') store.removeToast(current.id);
    });
  } });
  const state: ToastRootState = {
    get transitionStatus() { return toast().transitionStatus; },
    get expanded() { return expanded(); }, get limited() { return toast().limited || false; },
    get type() { return toast().type; }, get swiping() { return swipe.swiping; },
    get swipeDirection() { return swipe.direction; },
  };
  const context: ToastRootContext = { get toast() { return toast(); }, get expanded() { return expanded(); },
    get visibleIndex() { return visibleIndex(); }, setTitleId, setDescriptionId, recalculateHeight };
  const defaults = {
    get role() { return toast().priority === 'high' ? 'alertdialog' : 'dialog'; },
    tabIndex: 0, 'aria-modal': false,
    get 'aria-labelledby'() { return titleId(); }, get 'aria-describedby'() { return descriptionId(); },
    get 'aria-hidden'() { return toast().priority === 'high' && !store.snapshot().focused ? true : undefined; },
    get inert() { return toast().limited || undefined; },
    onPointerDown(event: PointerEvent) {
      // Touch activity pauses before the gesture engine rejects an interactive
      // or swipe-ignore target, matching the source notification interaction.
      if (directions().length > 0 && event.button === 0 && event.pointerType === 'touch') store.pauseTimers();
      swipe.onPointerDown(event);
    },
    onPointerMove: swipe.onPointerMove,
    onPointerUp: swipe.onPointerUp, onPointerCancel: swipe.onPointerCancel,
    onKeyDown(event: KeyboardEvent) {
      const node = element();
      if (event.key === 'Escape' && node && contains(node, activeElement(ownerDocument(node)))) store.closeToast(props.toast.id);
    },
    get style() { return { ...swipe.styles,
      '--toast-index': toast().transitionStatus === 'ending' ? selectors.toastIndex(store.snapshot(), props.toast.id) : visibleIndex(),
      '--toast-offset-y': `${selectors.toastOffsetY(store.snapshot(), props.toast.id)}px`,
      '--toast-height': toast().height ? `${toast().height}px` : undefined,
    }; },
  };
  return <ToastRootContext value={context}>{createRenderElement('div', props, {
    state, stateAttributesMapping: toastRootStateAttributesMapping, get ref() { return [props.ref, setElement]; },
    props: [defaults, omit(props, 'render', 'class', 'style', 'ref', 'toast', 'swipeDirection')],
  })}</ToastRootContext>;
}
export type ToastRootToastObject<Data extends object = any> = ToastObject<Data>;
export interface ToastRootState { transitionStatus: TransitionStatus; expanded: boolean; limited: boolean; type: string | undefined; swiping: boolean; swipeDirection: Direction | undefined }
export interface ToastRootProps extends BaseUIComponentProps<'div', ToastRootState> { toast: ToastObject; swipeDirection?: Direction | Direction[] | undefined }
export namespace ToastRoot { export type Props = ToastRootProps; export type State = ToastRootState; export type ToastObject<Data extends object = any> = ToastRootToastObject<Data> }
