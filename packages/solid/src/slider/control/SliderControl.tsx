// Gesture policy adapted from Base UI (MIT), 19511bb171f3b360b006c94cf6d07e53cb446505.
import { createEffect, createSignal, onCleanup, omit } from 'solid-js';
import { isServer, type JSX } from '@solidjs/web';
import type { BaseUIComponentProps } from '../../internals/types';
import { createRenderElement } from '../../internals/createRenderElement';
import { createChangeEventDetails, createGenericEventDetails } from '../../internals/createBaseUIEventDetails';
import { useDirection } from '../../internals/direction-context/DirectionContext';
import { createAnimationFrame } from '../../utils/createAnimationFrame';
import { activeElement, contains, getTarget } from '../../utils/shadowDom';
import { clamp } from '../../utils/clamp';
import { useSliderRootContext } from '../root/SliderRootContext';
import { sliderStateAttributesMapping } from '../root/stateAttributesMapping';
import type { SliderRootState } from '../root/SliderRoot';
import { getMidpoint } from '../utils/getMidpoint';
import { roundValueToStep } from '../utils/roundValueToStep';
import { resolveThumbCollision, type ResolveThumbCollisionResult } from '../utils/resolveThumbCollision';
import { validateMinimumDistance } from '../utils/validateMinimumDistance';

type Point = { x: number; y: number };
export function SliderControl(props: SliderControlProps) {
  const context = useSliderRootContext();
  const direction = useDirection();
  const [element, setElement] = createSignal<HTMLElement | null>(null);
  let control: HTMLElement | null = null;
  let doc: Document | null = null;
  let styles: CSSStyleDeclaration | null = null;
  let touchId: number | null = null;
  let moveCount = 0;
  let insetOffset = 0;
  let interactionValue: number | number[] | null = null;
  let pendingValue: number | number[] | undefined;
  let proposalVersion = 0;
  let pointerGesture = false;
  let observedValues: readonly number[] | null = null;
  let latestValues: readonly number[] | null = null;
  const frame = createAnimationFrame();
  const vertical = () => context.orientation === 'vertical';
  const inputFor = (index: number) => context.thumbRefs.current[index]?.querySelector<HTMLInputElement>('input[type="range"]');
  const updatePressed = (index: number) => {
    context.pressedThumbIndexRef.current = index;
    if (!context.thumbRefs.current[index]) context.pressedThumbCenterOffsetRef.current = null;
  };
  const resetPressed = () => { context.pressedThumbIndexRef.current = -1; context.pressedThumbCenterOffsetRef.current = null; };
  const disabledTarget = (target: EventTarget | null) => context.thumbRefs.current.some((thumb, index) => contains(thumb, target as Element | null) && inputFor(index)?.disabled);
  function coords(event: PointerEvent | TouchEvent): Point | null {
    if (touchId !== null && 'changedTouches' in event) {
      for (const touch of Array.from(event.changedTouches)) if (touch.identifier === touchId) return { x: touch.clientX, y: touch.clientY };
      return null;
    }
    return { x: (event as PointerEvent).clientX, y: (event as PointerEvent).clientY };
  }
  function liveValues() {
    const values = context.values;
    // External/committed updates can resize a controlled range. Same-turn accepted
    // candidates stay local until a genuinely new published snapshot is observed.
    if (values !== observedValues) {
      observedValues = values;
      latestValues = values;
      pendingValue = undefined;
    }
    return latestValues ?? values;
  }
  function fingerState(point: Point): ResolveThumbCollisionResult | null {
    const values = liveValues();
    const index = context.pressedThumbIndexRef.current;
    if (!control || index < 0 || index >= context.values.length) {
      if (index >= context.values.length) interactionValue = null;
      return null;
    }
    const rect = control.getBoundingClientRect();
    const parse = (value: string | undefined) => parseFloat(value ?? '') || 0;
    const start = vertical() ? parse(styles?.borderTopWidth) + parse(styles?.paddingTop) : parse(styles?.borderInlineStartWidth) + parse(styles?.paddingInlineStart);
    const end = vertical() ? parse(styles?.borderBottomWidth) + parse(styles?.paddingBottom) : parse(styles?.borderInlineEndWidth) + parse(styles?.paddingInlineEnd);
    const size = (vertical() ? rect.height : rect.width) - start - end - insetOffset * 2;
    const offset = context.pressedThumbCenterOffsetRef.current ?? 0;
    const position = vertical() ? rect.bottom - (point.y - offset) - end : (direction() === 'rtl' ? rect.right - (point.x - offset) : point.x - offset - rect.left) - start;
    const scaled = clamp((position - insetOffset) / size, 0, 1);
    const value = clamp(roundValueToStep((context.max - context.min) * scaled + context.min, context.step, context.min), context.min, context.max);
    if (context.values.length <= 1) return { value: context.isArrayValue ? [value] : value, thumbIndex: index, didSwap: false };
    return resolveThumbCollision(context.thumbCollisionBehavior, context.values, values, context.pressedValuesRef.current, index, value, context.min, context.max, context.step, context.minStepsBetweenValues);
  }
  function start(point: Point) {
    const values = context.values;
    context.pressedValuesRef.current = values.length > 1 ? values.slice() : null;
    observedValues = values; latestValues = values; interactionValue = null; pendingValue = undefined;
    const pressed = context.pressedThumbIndexRef.current;
    let closest = pressed;
    if (pressed >= 0 && pressed < values.length) {
      if (values[pressed] === context.max) while (closest > 0 && values[closest - 1] === context.max) closest -= 1;
    } else {
      closest = -1;
      let distance: number | undefined;
      context.thumbRefs.current.forEach((thumb, index) => {
        if (!thumb || inputFor(index)?.disabled) return;
        const candidate = Math.abs(point[vertical() ? 'y' : 'x'] - getMidpoint(thumb, vertical()));
        if (distance === undefined || candidate <= distance) { closest = index; distance = candidate; }
      });
    }
    if (closest > -1 && closest !== pressed) updatePressed(closest);
    insetOffset = 0;
    if (context.inset) insetOffset = (context.thumbRefs.current[closest]?.getBoundingClientRect()[vertical() ? 'height' : 'width'] ?? 0) / 2;
  }
  function focus(index: number) { inputFor(index)?.focus({ preventScroll: true, focusVisible: false } as FocusOptions); }
  function apply(finger: ResolveThumbCollisionResult, reason: 'track-press' | 'drag', event: PointerEvent | TouchEvent) {
    const accepted = context.setValue(finger.value, createChangeEventDetails(reason, event, undefined, { activeThumbIndex: finger.thumbIndex }), pendingValue);
    if (accepted) {
      interactionValue = finger.value;
      latestValues = Array.isArray(finger.value) ? finger.value : [finger.value];
      // Carry proposals only across staged same-turn writes. An accepted controlled
      // request is not an acknowledgment, and a published value replaces the
      // comparison baseline without discarding the last value owed at commit.
      pendingValue = finger.value;
      const version = ++proposalVersion;
      queueMicrotask(() => { if (version === proposalVersion) pendingValue = undefined; });
      if (finger.didSwap) { updatePressed(finger.thumbIndex); frame.cancel(); focus(finger.thumbIndex); }
    }
  }
  function stopListening() {
    doc?.removeEventListener('pointermove', move);
    doc?.removeEventListener('pointerup', end);
    doc?.removeEventListener('pointercancel', cancel);
    doc?.removeEventListener('touchmove', move);
    doc?.removeEventListener('touchend', end);
    doc?.removeEventListener('touchcancel', end);
    touchId = null; context.pressedValuesRef.current = null; interactionValue = null; pendingValue = undefined; pointerGesture = false;
  }
  function move(event: PointerEvent | TouchEvent) {
    if (context.disabled) return;
    const point = coords(event);
    if (!point) return;
    moveCount += 1;
    if (event.type === 'pointermove' && (event as PointerEvent).buttons === 0) { end(event); return; }
    const finger = fingerState(point);
    if (!finger || !validateMinimumDistance(finger.value, context.step, context.minStepsBetweenValues)) return;
    if (moveCount > 2) context.setDragging(true);
    apply(finger, 'drag', event);
  }
  function end(event: PointerEvent | TouchEvent) {
    if (!coords(event)) return;
    context.setActive(-1); context.setDragging(false);
    context.pressedThumbCenterOffsetRef.current = null;
    if (Array.isArray(interactionValue) && interactionValue.length !== context.values.length) interactionValue = null;
    if (interactionValue !== null) context.onValueCommitted(interactionValue, createGenericEventDetails(context.lastChangeReasonRef.current, event));
    if ('pointerType' in event && control?.hasPointerCapture?.(event.pointerId)) control.releasePointerCapture(event.pointerId);
    resetPressed(); stopListening();
  }
  function cancel(event: PointerEvent) { if (touchId === null) end(event); }
  function touchStart(event: TouchEvent) {
    const startedByPointer = pointerGesture;
    pointerGesture = false;
    if (context.disabled) return;
    if (disabledTarget(getTarget(event))) { resetPressed(); return; }
    const touch = event.changedTouches[0];
    if (!touch) return;
    touchId = touch.identifier;
    if (!startedByPointer) {
      const point = { x: touch.clientX, y: touch.clientY };
      start(point);
      const finger = fingerState(point);
      if (!finger) return;
      focus(finger.thumbIndex); apply(finger, 'track-press', event); moveCount = 0;
    }
    doc?.addEventListener('touchmove', move, { passive: true });
    doc?.addEventListener('touchend', end, { passive: true });
    doc?.addEventListener('touchcancel', end, { passive: true });
  }
  createEffect(element, (node) => {
    if (!node) return;
    node.addEventListener('touchstart', touchStart, { passive: true });
    return () => { node.removeEventListener('touchstart', touchStart); frame.cancel(); stopListening(); };
  });
  createEffect(() => context.disabled, (disabled) => { if (disabled) stopListening(); });
  // React's DOM effect cleanup never runs on the server. RC13 onCleanup does:
  // null refs there mean no control was attached, not a registration to clear.
  if (!isServer) onCleanup(() => { stopListening(); frame.cancel(); if (control && context.controlRef.current === control) context.registerControl(null); });
  const reportControl = (node: HTMLElement | null) => {
    if (isServer) return;
    if (node !== control) stopListening();
    control = node; context.registerControl(node); doc = node?.ownerDocument ?? null;
    styles = node?.ownerDocument.defaultView?.getComputedStyle(node) ?? null; setElement(node);
  };
  return createRenderElement('div', props, { state: context.state, stateAttributesMapping: sliderStateAttributesMapping,
    get ref() { return [props.ref, reportControl]; },
    props: [{
      get 'data-base-ui-slider-control'() { return context.renderBeforeHydration ? '' : undefined; },
      onPointerDown(event: PointerEvent) {
        pointerGesture = false;
        const target = getTarget(event);
        if (!control || context.disabled || event.defaultPrevented || !target || (target as Node).nodeType !== 1 || event.button !== 0) return;
        if (disabledTarget(target)) { resetPressed(); return; }
        const point = { x: event.clientX, y: event.clientY };
        start(point);
        const finger = fingerState(point);
        if (!finger) return;
        if (contains(context.thumbRefs.current[finger.thumbIndex], activeElement(control.ownerDocument))) event.preventDefault();
        else frame.request(() => focus(context.pressedThumbIndexRef.current >= 0 ? context.pressedThumbIndexRef.current : finger.thumbIndex));
        context.setDragging(true);
        if (context.pressedThumbCenterOffsetRef.current === null) apply(finger, 'track-press', event);
        if (event.pointerId) control.setPointerCapture?.(event.pointerId);
        moveCount = 0; pointerGesture = event.pointerType === 'touch' || event.pointerType === 'pen';
        doc?.addEventListener('pointermove', move, { passive: true });
        doc?.addEventListener('pointerup', end, { once: true });
        doc?.addEventListener('pointercancel', cancel, { once: true });
      },
    }, omit(props, 'class', 'style', 'render', 'ref')],
  });
}
export interface SliderControlState extends SliderRootState {}
export interface SliderControlProps extends BaseUIComponentProps<'div', SliderControlState, JSX.HTMLAttributes<HTMLElement>> {}
export namespace SliderControl { export type State = SliderControlState; export type Props = SliderControlProps }
