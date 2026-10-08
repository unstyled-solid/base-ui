import { createEffect, createMemo, For, Show, omit, onCleanup } from 'solid-js';
import type { BaseUIComponentProps } from '../../internals/types';
import { createRenderElement } from '../../internals/createRenderElement';
import { createTimeout } from '../../utils/createTimeout';
import { FocusGuard } from '../../utils/FocusGuard';
import { addEventListener } from '../../utils/addEventListener';
import { ownerDocument, ownerWindow } from '../../utils/owner';
import { activeElement, contains, getTarget } from '../../utils/shadowDom';
import { visuallyHidden } from '../../utils/visuallyHidden';
import { useToastProviderContext } from '../provider/ToastProviderContext';
import { selectors } from '../store';
import { isFocusVisible } from '../utils/focusVisible';

export function ToastViewport(props: ToastViewportProps) {
  const store = useToastProviderContext();
  const focusTimeout = createTimeout();
  let attachedViewport: HTMLElement | null = null;
  const setViewport = (node: HTMLElement | null) => {
    const previous = attachedViewport;
    attachedViewport = node;
    if (node || store.state.viewport === previous) store.setViewport(node);
  };
  let handlingGuard = false, leavePending = false, touchActive = false;
  const toasts = () => store.snapshot().toasts;
  const guardVisible = () => !!toasts().length && !!store.snapshot().prevFocusElement;
  const listenerState = createMemo(() => ({ viewport: store.snapshot().viewport, empty: toasts().length === 0 }), {
    equals: (previous, next) => previous.viewport === next.viewport && previous.empty === next.empty,
  });
  createEffect(listenerState, ({ viewport, empty }) => {
    if (!viewport || empty) return;
    const doc = ownerDocument(viewport), win = ownerWindow(viewport);
    const cleanups = [
      addEventListener(win, 'keydown', (event) => {
        if (event.key !== 'F6' || getTarget(event) === viewport) return;
        event.preventDefault();
        store.set('prevFocusElement', activeElement(doc) as HTMLElement | null);
        viewport.focus({ preventScroll: true });
        store.pauseTimers(); store.set('focused', true);
      }),
      addEventListener(win, 'blur', (event) => {
        if (getTarget(event) !== win) return;
        store.set('isWindowFocused', false); store.pauseTimers();
      }, true),
      addEventListener(win, 'focus', (event) => {
        if (event.relatedTarget) return;
        const target = getTarget(event);
        if (target === win || !contains(viewport, target as Element | null) || !isFocusVisible(activeElement(doc))) store.resumeTimers();
        focusTimeout.start(0, () => store.set('isWindowFocused', true));
      }, true),
      addEventListener(doc, 'pointerdown', store.handleDocumentPointerDown, true),
    ];
    return () => { cleanups.forEach((cleanup) => cleanup()); focusTimeout.clear(); };
  });
  function flushMouseLeave() {
    if (!leavePending || touchActive || store.state.toasts.some((toast) => toast.transitionStatus === 'ending')) return;
    store.set('hovering', false);
    if (!selectors.expandedOrOutOfFocus(store.state)) store.resumeTimers();
    leavePending = false;
  }
  createEffect(() => toasts().some((toast) => toast.transitionStatus === 'ending'), () => { flushMouseLeave(); });
  function handleGuard(event: FocusEvent) {
    handlingGuard = true;
    const next = event.relatedTarget === store.state.viewport
      ? store.state.toasts.find((toast) => toast.transitionStatus !== 'ending' && !toast.limited) : undefined;
    if (next) next.ref?.()?.focus(); else store.restoreFocusToPrevElement();
  }
  function handleFocus() {
    if (handlingGuard) { handlingGuard = false; return; }
    const viewport = store.state.viewport;
    if (!store.state.focused && viewport && isFocusVisible(activeElement(ownerDocument(viewport)))) {
      store.set('focused', true); store.pauseTimers();
    }
  }
  function enter() { store.pauseTimers(); store.set('hovering', true); leavePending = false; }
  function pointerEnd(event: PointerEvent) { if (event.pointerType === 'touch') { touchActive = false; flushMouseLeave(); } }
  const defaults = {
    tabIndex: -1, role: 'region', 'aria-live': 'polite', 'aria-atomic': false,
    'aria-relevant': 'additions text', 'aria-label': 'Notifications',
    onMouseEnter: enter, onMouseMove: enter,
    onMouseLeave() { leavePending = true; flushMouseLeave(); },
    // React focus/blur bubble from toast descendants; their native equivalents
    // are focusin/focusout, not the non-bubbling focus/blur events.
    onFocusIn: handleFocus, onClick: handleFocus,
    onFocusOut(event: FocusEvent) {
      if (!store.state.focused || contains(store.state.viewport, event.relatedTarget as Element | null)) return;
      store.set('focused', false);
      if (!selectors.expandedOrOutOfFocus(store.state)) store.resumeTimers();
    },
    onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Tab' && event.shiftKey && getTarget(event) === store.state.viewport) {
        event.preventDefault(); store.restoreFocusToPrevElement();
      }
    },
    onPointerDown(event: PointerEvent) { if (event.pointerType === 'touch') touchActive = true; },
    onPointerUp: pointerEnd, onPointerCancel: pointerEnd,
    get style() { const height = toasts()[0]?.height; return { '--toast-frontmost-height': height ? `${height}px` : undefined }; },
  };
  const Guard = () => <Show when={guardVisible()}><FocusGuard onFocus={handleGuard} /></Show>;
  // Own the child composition once; state/style updates must not reconstruct it.
  const content = <><Guard />{props.children}<Guard /></>;
  // No ref attaches during SSR. A stale viewport cleanup cannot unregister a
  // newer living viewport that shares this provider.
  onCleanup(() => {
    if (attachedViewport && store.state.viewport === attachedViewport) store.setViewport(null);
  });
  const Announcements = () => <Show when={!store.snapshot().focused && toasts().some((toast) => toast.priority === 'high')}>
    <div style={visuallyHidden}>
      <For each={toasts().filter((toast) => toast.priority === 'high')} keyed={(toast) => toast.id}>
        {(toast) => <div role="alert" aria-atomic="true"><div>{toast().title}</div><div>{toast().description}</div></div>}
      </For>
    </div>
  </Show>;
  return <>
    <Guard />
    {createRenderElement('div', props, {
      get ref() { return [props.ref, setViewport]; }, state: { get expanded() { return selectors.expanded(store.snapshot()); } },
      props: [defaults, omit(props, 'render', 'class', 'style', 'ref', 'children'), { children: content }],
    })}
    <Announcements />
  </>;
}
export interface ToastViewportState { expanded: boolean }
export interface ToastViewportProps extends BaseUIComponentProps<'div', ToastViewportState> {}
export namespace ToastViewport { export type Props = ToastViewportProps; export type State = ToastViewportState }
