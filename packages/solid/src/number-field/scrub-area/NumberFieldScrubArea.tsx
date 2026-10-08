// Adapted from Base UI (MIT), 19511bb171f3b360b006c94cf6d07e53cb446505.
import { createEffect, createSignal, onCleanup, omit } from 'solid-js';
import type { BaseUIComponentProps } from '../../internals/types';
import { createRenderElement } from '../../internals/createRenderElement';
import { createPointerSession } from '../../internals/createPointerSession';
import { createChangeEventDetails, createGenericEventDetails } from '../../internals/createBaseUIEventDetails';
import { createTimeout } from '../../utils/createTimeout';
import { addEventListener } from '../../utils/addEventListener';
import { ownerDocument, ownerWindow } from '../../utils/owner';
import { getTarget } from '../../utils/shadowDom';
import { platform } from '../../utils/platform';
import { useNumberFieldRootContext } from '../root/NumberFieldRootContext';
import type { NumberFieldRootState } from '../root/NumberFieldRoot';
import { stateAttributesMapping } from '../utils/stateAttributesMapping';
import { getViewportRect } from '../utils/getViewportRect';
import { NumberFieldScrubAreaContext } from './NumberFieldScrubAreaContext';

export function NumberFieldScrubArea(props: NumberFieldScrubArea.Props) {
  const elementProps = omit(props, 'render', 'class', 'style', 'ref', 'direction', 'pixelSensitivity', 'teleportDistance');
  const root = useNumberFieldRootContext();
  const source = Symbol('NumberField scrub');
  const [element, setElement] = createSignal<HTMLSpanElement | null>(null);
  const [snapshot, setSnapshot] = createSignal({ active: false, touch: false, denied: false });
  const exitTimeout = createTimeout();
  let active = false;
  let disposed = false;
  let generation = 0;
  let touch = false;
  let denied = false;
  let moved = false;
  let cumulative = 0;
  let downTarget: EventTarget | null = null;
  let cursor: HTMLSpanElement | null = null;
  let initializedCursor: HTMLSpanElement | null = null;
  let cursorGeneration = 0;
  let document: Document | null = null;
  let lastValue: number | null | undefined;
  let point = { x: 0, y: 0 };
  let initialPoint = { x: 0, y: 0 };
  function publish() { setSnapshot({ active, touch, denied }); root.setScrubbing(source, active); }
  function transform() {
    if (!cursor) return;
    const scale = ownerWindow(cursor).visualViewport?.scale ?? 1;
    cursor.style.transform = `translate3d(${point.x}px,${point.y}px,0) scale(${1 / scale})`;
  }
  function initializeCursor(force = false) {
    if (!cursor || !active || (!force && cursor === initializedCursor && cursorGeneration === generation)) return;
    initializedCursor = cursor;
    cursorGeneration = generation;
    point = { x: initialPoint.x - cursor.offsetWidth / 2, y: initialPoint.y - cursor.offsetHeight / 2 };
    transform();
  }
  function exitLock() { try { document?.exitPointerLock(); } catch { /* unsupported/denied lock */ } }
  function cancel() {
    exitTimeout.clear();
    if (active) { active = false; exitLock(); if (!disposed) publish(); else root.setScrubbing(source, false); }
    downTarget = null;
    lastValue = undefined;
  }
  function end(event: PointerEvent, finishSession: () => boolean) {
    if (!active) { finishSession(); return; }
    const endingGeneration = generation;
    const finish = () => {
      if (!active || disposed || generation !== endingGeneration) return;
      // Gecko keeps both movement and pointer lock live through the source's
      // 20ms delay. Release lock first, then finish the shared listener resource.
      exitLock();
      if (platform.engine.gecko && !finishSession()) return;
      active = false;
      publish();
      root.commit(lastValue ?? root.numericValue(), createGenericEventDetails('scrub', event));
      const target = downTarget;
      downTarget = null;
      if (!moved && target && root.input()) {
        target.dispatchEvent(new (ownerWindow(root.input()).MouseEvent)('click', { bubbles: true, cancelable: true }));
      }
      moved = false;
    };
    if (platform.engine.gecko) exitTimeout.start(20, finish); else finish();
  }
  function move(event: PointerEvent) {
    if (!active || disposed) return;
    event.preventDefault();
    const area = element();
    if (cursor && area) {
      const rect = getViewportRect(props.teleportDistance, area);
      const wrap = (coordinate: number, half: number, low: number, high: number) => coordinate + half < low ? high - half : coordinate + half > high ? low - half : coordinate;
      point = {
        x: wrap(Math.round(point.x + event.movementX), cursor.offsetWidth / 2, rect.left, rect.right),
        y: wrap(Math.round(point.y + event.movementY), cursor.offsetHeight / 2, rect.top, rect.bottom),
      };
      transform();
    }
    const vertical = props.direction === 'vertical';
    cumulative += vertical ? event.movementY : event.movementX;
    if (Math.abs(cumulative) < (props.pixelSensitivity ?? 2)) return;
    cumulative = 0;
    moved = true;
    const amount = (vertical ? -event.movementY : event.movementX) * root.getStepAmount(event);
    if (amount !== 0) {
      root.manual = false;
      const result = root.increment(Math.abs(amount), amount >= 0 ? 1 : -1, createChangeEventDetails('scrub', event));
      if (result.accepted) lastValue = result.value;
    }
  }
  const session = createPointerSession({
    element, get disabled() { return root.state.disabled || root.state.readOnly; },
    eventTarget: () => ownerWindow(root.input()), listenerCapture: true,
    deferEnd: platform.engine.gecko,
    onMove: move, onEnd: end, onCancel: cancel,
  });
  onCleanup(() => { disposed = true; cancel(); });
  createEffect(() => ({ area: element(), disabled: root.state.disabled || root.state.readOnly }), ({ area, disabled }) => {
    if (!area || disabled) { cancel(); return; }
    return addEventListener(area, 'touchstart', (event: TouchEvent) => {
      if (event.touches.length === 1) event.preventDefault();
    }, { passive: false });
  });
  const context: NumberFieldScrubAreaContext = {
    get isScrubbing() { return snapshot().active; }, get isTouchInput() { return snapshot().touch; },
    get isPointerLockDenied() { return snapshot().denied; }, get element() { return element(); },
    registerCursor(next) {
      cursor = next;
      initializeCursor();
    },
  };
  const defaults = {
    role: 'presentation', style: { 'touch-action': 'none', '-webkit-user-select': 'none', 'user-select': 'none' },
    async onPointerDown(event: PointerEvent) {
      if (event.defaultPrevented || event.button || root.state.disabled || root.state.readOnly) return;
      session.cancel();
      exitTimeout.clear();
      const currentGeneration = ++generation;
      touch = event.pointerType === 'touch';
      if (event.pointerType === 'mouse') { event.preventDefault(); root.focusInput(); }
      active = true;
      moved = false;
      cumulative = 0;
      lastValue = undefined;
      initialPoint = { x: event.clientX, y: event.clientY };
      downTarget = getTarget(event);
      document = ownerDocument(element());
      initializeCursor();
      publish();
      session.start(event);
      if (touch || platform.engine.webkit) return;
      const lockDocument = document;
      try {
        await lockDocument.body.requestPointerLock();
        if (currentGeneration === generation) denied = false;
      } catch {
        if (currentGeneration === generation) denied = true;
      } finally {
        if (currentGeneration === generation && active && !disposed) {
          initializeCursor(true);
          publish();
        } else if (!active || disposed || touch) {
          // An older request may resolve after another gesture has already
          // ended (or a touch scrub began). It still owns a late lock release.
          try { lockDocument.exitPointerLock(); } catch { /* late acquisition */ }
        }
      }
    },
  };
  return <NumberFieldScrubAreaContext value={context}>
    {createRenderElement('span', props, { state: root.state, get ref() { return [props.ref, setElement]; },
      props: [defaults, elementProps], stateAttributesMapping })}
  </NumberFieldScrubAreaContext>;
}
export interface NumberFieldScrubAreaState extends NumberFieldRootState {}
export interface NumberFieldScrubAreaProps extends BaseUIComponentProps<'span', NumberFieldScrubAreaState> {
  direction?: 'horizontal' | 'vertical'; pixelSensitivity?: number; teleportDistance?: number;
}
export namespace NumberFieldScrubArea { export type Props = NumberFieldScrubAreaProps; export type State = NumberFieldScrubAreaState; }
