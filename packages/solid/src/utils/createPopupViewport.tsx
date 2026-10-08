import { createEffect, createMemo, createSignal, onCleanup, untrack, type Accessor } from 'solid-js';
import { dynamic, isServer, type JSX } from '@solidjs/web';
import type { PopupModel } from './popups/createPopup';
import type { Side } from '../internals/createAnchorPositioning';
import { useDirection } from '../internals/direction-context';
import { createAnimationsFinished } from '../internals/createAnimationsFinished';
import { createAnimationFrame } from './createAnimationFrame';
import { createPopupAutoResize, type PopupDimensions } from './createPopupAutoResize';
import { adaptiveOrigin } from './adaptiveOriginMiddleware';
import * as css from './CommonPopupCssVars';
export interface PopupViewportState { readonly activationDirection: string | undefined; readonly transitioning: boolean }
export interface UsePopupViewportParameters<P = unknown> { store: PopupModel<P>; side: Side; children?: JSX.Element | Accessor<JSX.Element> }
export const popupViewportStateMapping = { activationDirection: (value: string | undefined): Record<string, string> | null => value ? { 'data-activation-direction': value } : null };
export function createPopupViewport<P>(params: UsePopupViewportParameters<P>): { readonly children: JSX.Element; readonly state: PopupViewportState } {
  const direction = useDirection(), frame = createAnimationFrame();
  const [current, setCurrent] = createSignal<HTMLElement | null>(null, { ownedWrite: true }), [previous, setPrevious] = createSignal<HTMLElement | null>(null, { ownedWrite: true });
  const [clone, setClone] = createSignal<HTMLElement | null>(null), [dimensions, setDimensions] = createSignal<PopupDimensions | null>(null);
  const [starting, setStarting] = createSignal(false), [offset, setOffset] = createSignal<{ x: number; y: number } | null>(null);
  let captured: HTMLElement | null = null, lastTrigger: Element | null = null, lastHandled: Element | null = null;
  let currentToken: object | undefined;
  let cleanupController: AbortController | undefined;
  const [measurementEpoch, setMeasurementEpoch] = createSignal(0);
  const contentKey = createMemo<{ id: string | null; payload: unknown; version: number; pendingPayload: boolean }>((previous) => {
    const id = params.store.state.activeTriggerId, payload = params.store.state.payload;
    if (previous?.id === id && previous.payload === payload) return previous;
    const changed = !!previous && id !== previous.id, payloadChanged = !!previous && payload !== previous.payload;
    return { id, payload, version: (previous?.version ?? 0) + (changed || (previous?.pendingPayload && payloadChanged) ? 1 : 0), pendingPayload: changed ? !payloadChanged : previous?.pendingPayload && !payloadChanged || false };
  });
  const finish = createAnimationsFinished(current, true);
  if (!isServer) createEffect(() => params.store, (store) => { store.setAdaptiveOrigin?.(adaptiveOrigin); return () => { store.setAdaptiveOrigin?.(undefined); }; }, { transparent: true });
  createEffect(() => ({ trigger: params.store.state.open ? params.store.state.activeTriggerElement : null, mounted: params.store.state.mounted, node: current(), key: contentKey().version }), (next) => {
    if (!next.trigger || !next.mounted) { lastHandled = null; lastTrigger = null; }
    if (next.trigger && lastTrigger && next.trigger !== lastTrigger && next.trigger !== lastHandled && captured) {
      setClone(captured); setStarting(true);
      const old = lastTrigger.getBoundingClientRect(), newRect = next.trigger.getBoundingClientRect();
      setOffset({ x: newRect.left + newRect.width / 2 - old.left - old.width / 2, y: newRect.top + newRect.height / 2 - old.top - old.height / 2 });
      lastHandled = next.trigger;
    }
    if (next.trigger) lastTrigger = next.trigger;
    const node = next.node;
    if (!node) return;
    const capture = () => { const wrapper = node.ownerDocument.createElement('div'); for (const child of [...node.childNodes]) wrapper.appendChild(child.cloneNode(true)); captured = wrapper; };
    capture();
    const observer = new node.ownerDocument.defaultView!.MutationObserver(capture);
    observer.observe(node, { childList: true, subtree: true, attributes: true, characterData: true });
    return () => observer.disconnect();
  });
  const cleanupOwnership = createMemo(() => ({ clone: clone(), previous: previous(), current: current(), key: contentKey().version, measurement: measurementEpoch() }), {
    equals: (a, b) => a.clone === b.clone && a.previous === b.previous && a.current === b.current && a.key === b.key && a.measurement === b.measurement,
  });
  createEffect(cleanupOwnership, (next) => {
    if (!next.clone || !next.current) return;
    const controller = new AbortController();
    cleanupController = controller;
    if (next.previous) next.previous.replaceChildren(...[...next.clone.childNodes].map((node) => node.cloneNode(true)));
    const restorers = [next.current, next.previous].filter((node): node is HTMLElement => !!node).map(node => {
      const transition = node.style.transition;
      node.style.transition = 'none';
      return () => { if (node.style.transition === 'none') node.style.transition = transition; };
    });
    setStarting(true);
    frame.request(() => {
      if (controller.signal.aborted) return;
      // Solid's attribute writes are staged. Commit the actual starting CSS
      // before toggling it off, as React's layout/flush choreography does.
      const win = next.current?.ownerDocument.defaultView;
      if (win && next.current) { win.getComputedStyle(next.current).opacity; next.current.getBoundingClientRect(); }
      if (win && next.previous) { win.getComputedStyle(next.previous).opacity; next.previous.getBoundingClientRect(); }
      for (const restore of restorers) restore();
      setStarting(false); queueMicrotask(() => {
      if (controller.signal.aborted) return;
      finish(() => { setClone(null); setDimensions(null); captured = null; }, controller.signal);
      });
    });
    return () => { controller.abort(); if (cleanupController === controller) cleanupController = undefined; frame.cancel(); for (const restore of restorers) restore(); };
  });
  createPopupAutoResize({ get popupElement() { return params.store.state.popupElement; }, get positionerElement() { return params.store.state.positionerElement; },
    get mounted() { return params.store.state.mounted; }, get content() { return params.store.state.payload; }, get side() { return params.side; }, get direction() { return direction(); },
    onMeasureLayout() {
      // Native measurement cancels CSS animations immediately. Abort before
      // those rejected promises can settle a watcher for the live exit clone.
      cleanupController?.abort();
      const node = untrack(current), old = untrack(previous); node?.style.setProperty('animation', 'none'); node?.style.setProperty('transition', 'none'); old?.style.setProperty('display', 'none');
    },
    onMeasureLayoutComplete(oldDimensions) {
      const node = untrack(current), old = untrack(previous); node?.style.removeProperty('animation'); node?.style.removeProperty('transition'); old?.style.removeProperty('display'); if (oldDimensions) setDimensions(oldDimensions);
      if (untrack(clone)) { setStarting(true); setMeasurementEpoch(value => value + 1); }
    },
  });
  const container = createMemo((prior: { version: number; target: () => JSX.Element } | undefined) => {
    const version = contentKey().version; if (prior?.version === version) return prior;
    return { version, target() {
      const token = {}; const report = (node: HTMLElement | null) => { if (node) { currentToken = token; setCurrent(node); } else if (currentToken === token) { currentToken = undefined; setCurrent(null); } };
      onCleanup(() => { if (currentToken === token) { currentToken = undefined; setCurrent(null); } });
      return <div data-current="" ref={report} data-starting-style={starting() ? '' : undefined}>{(() => { const value = params.children; return typeof value === 'function' ? value() : value; })()}</div>;
    } };
  });
  const Current = dynamic(() => container().target);
  function Previous() {
    let node: HTMLElement | null = null;
    const report = (element: HTMLElement) => { node = element; setPrevious(element); };
    onCleanup(() => { if (untrack(previous) === node) setPrevious(null); });
    return <div data-previous="" inert="" ref={report} data-ending-style={starting() ? undefined : ''} style={{ position: 'absolute', [css.popupWidth]: dimensions() ? `${dimensions()!.width}px` : undefined, [css.popupHeight]: dimensions() ? `${dimensions()!.height}px` : undefined }} />;
  }
  const output = <>{clone() && <Previous />}<Current /></>;
  const state: PopupViewportState = {
    get transitioning() { return clone() !== null; },
    get activationDirection() { const next = offset(); if (!next) return undefined; return `${next.x > 5 ? 'right' : next.x < -5 ? 'left' : ''} ${next.y > 5 ? 'down' : next.y < -5 ? 'up' : ''}`; },
  };
  return { children: output, state };
}
export { createPopupViewport as usePopupViewport };
