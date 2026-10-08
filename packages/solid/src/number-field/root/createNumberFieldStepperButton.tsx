import { omit } from 'solid-js';
import { createButton } from '../../internals/use-button';
import { createPressAndHold, isTouchLikePointerType } from '../../internals/createPressAndHold';
import { createRenderElement } from '../../internals/createRenderElement';
import type { BaseUIComponentProps, NativeButtonProps } from '../../internals/types';
import { createChangeEventDetails, createGenericEventDetails } from '../../internals/createBaseUIEventDetails';
import { parseNumber } from '../utils/parse';
import { stateAttributesMapping } from '../utils/stateAttributesMapping';
import type { NumberFieldRootState } from './NumberFieldRoot';
import { useNumberFieldRootContext } from './NumberFieldRootContext';

export type StepperButtonProps = NativeButtonProps & BaseUIComponentProps<'button', NumberFieldRootState>;

export function createNumberFieldStepperButton(props: StepperButtonProps, increment: boolean) {
  const elementProps = omit(props, 'disabled', 'nativeButton', 'render', 'class', 'style', 'ref');
  const context = useNumberFieldRootContext();
  const reason = increment ? 'increment-press' : 'decrement-press';
  const direction = increment ? 1 : -1;
  const atBoundary = () => context.state.value !== null && (increment
    ? context.state.value >= context.maxWithDefault : context.state.value <= context.minWithDefault);
  const disabled = () => Boolean(props.disabled || context.state.disabled || atBoundary());
  let seed: number | null | undefined;
  let lastTick: number | null | undefined;

  function prepare(event: MouseEvent) {
    seed = undefined;
    lastTick = undefined;
    const dirty = context.manual;
    context.manual = false;
    if (!dirty) return;
    const parsed = parseNumber(context.text(), context.locale, context.format);
    if (parsed !== null) {
      const result = context.setValue(parsed, createChangeEventDetails(reason, event));
      // Source dirty-text sync establishes the raw parsed stepping base, without snapping it.
      if (result.accepted) seed = parsed;
    }
  }
  function tick(event: MouseEvent | PointerEvent | TouchEvent) {
    const base = seed;
    seed = undefined;
    const result = context.increment(context.getStepAmount(event as MouseEvent), direction, createChangeEventDetails(reason, event), base);
    if (result.accepted) lastTick = result.value;
    return result;
  }
  const hold = createPressAndHold({
    get disabled() { return disabled() || context.state.readOnly; },
    elementRef: context.input,
    tick(event: MouseEvent | PointerEvent | TouchEvent) { return tick(event).changed; },
    onStop(event: PointerEvent) {
      context.commit(lastTick ?? context.numericValue(), createGenericEventDetails(reason, event));
      lastTick = undefined;
    },
  });
  const button = createButton({
    get disabled() { return disabled() || context.state.readOnly; },
    get native() { return props.nativeButton ?? true; }, focusableWhenDisabled: true,
  });
  const buttonState = new Proxy(context.state, {
    get(target, key) { return key === 'disabled' ? disabled() : Reflect.get(target, key, target); },
  });
  const defaults = {
    get disabled() { return disabled(); }, 'aria-label': increment ? 'Increase' : 'Decrease',
    get 'aria-controls'() { return context.id; }, tabindex: -1,
    style: { '-webkit-user-select': 'none', 'user-select': 'none' },
    ...hold.pointerHandlers,
    onClick(event: MouseEvent) {
      if (event.defaultPrevented || disabled() || context.state.readOnly || hold.shouldSkipClick(event)) return;
      prepare(event);
      const previous = seed ?? context.numericValue();
      const result = tick(event);
      if (result.accepted && result.value !== previous) context.commit(result.value, createGenericEventDetails(reason, event));
    },
    onPointerDown(event: PointerEvent) {
      if (event.defaultPrevented || event.button || disabled() || context.state.readOnly) return;
      prepare(event);
      if (!isTouchLikePointerType(event.pointerType)) context.focusInput();
      hold.pointerHandlers.onPointerDown(event);
    },
  };
  return createRenderElement('button', props, {
    state: buttonState, get ref() { return [props.ref, button.buttonRef]; },
    props: [defaults, elementProps, button.getButtonProps], stateAttributesMapping,
  });
}
