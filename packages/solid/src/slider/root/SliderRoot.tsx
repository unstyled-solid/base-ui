import { createEffect, createSignal, omit, untrack } from 'solid-js';
import type { JSX } from '@solidjs/web';
import type { BaseUIComponentProps } from '../../internals/types';
import { createBaseUiId } from '../../internals/createBaseUiId';
import { createRenderElement } from '../../internals/createRenderElement';
import { CompositeList } from '../../internals/composite';
import type { CompositeMetadata } from '../../internals/contracts/items';
import { useFieldRootContext, type FieldRootState } from '../../internals/field-root-context/FieldRootContext';
import { createRegisterFieldControl } from '../../internals/field-register-control/createRegisterFieldControl';
import { useFormContext } from '../../internals/form-context/FormContext';
import { useLabelableContext } from '../../internals/labelable-provider';
import { createChangeEventDetails, createGenericEventDetails, type BaseUIChangeEventDetails, type BaseUIGenericEventDetails } from '../../internals/createBaseUIEventDetails';
import { warn } from '../../utils/warn';
import { activeElement, contains } from '../../utils/shadowDom';
import { getSliderValue } from '../utils/getSliderValue';
import { validateMinimumDistance } from '../utils/validateMinimumDistance';
import { SliderRootContext, type ThumbMetadata } from './SliderRootContext';
import { sliderStateAttributesMapping } from './stateAttributesMapping';
import { createSliderModel, areValuesEqual } from './createSliderModel';

/** Groups the slider parts. Values are normalized without mutating consumer arrays. */
export function SliderRoot<Value extends number | readonly number[] = number | readonly number[]>(props: SliderRootProps<Value>) {
  const field = useFieldRootContext();
  const form = useFormContext();
  const labelable = useLabelableContext();
  const id = createBaseUiId(() => typeof props.id === 'string' ? props.id : undefined);
  const model = createSliderModel(props);
  const { min, max, values, fieldValue } = model;
  const disabled = () => Boolean(field?.disabled || props.disabled);
  const [active, setActiveState] = createSignal(-1);
  const [lastUsed, setLastUsed] = createSignal(-1);
  const [dragging, setDragging] = createSignal(false);
  const [labelId, setLabelId] = createSignal<string>();
  const [indicatorPosition, setIndicatorPosition] = createSignal<(number | undefined)[]>([undefined, undefined]);
  const [thumbMap, setThumbMap] = createSignal(new Map<Node, CompositeMetadata<ThumbMetadata>>());
  const rootRef = { current: null as HTMLDivElement | null };
  const controlRef = { current: null as HTMLElement | null };
  const [controlElement, setControlElement] = createSignal<HTMLElement | null>(null);
  const thumbRefs = { current: [] as (HTMLElement | null)[] };
  const lastChangeReasonRef = { current: 'none' as SliderRootChangeEventReason };
  const name = () => field?.name ?? props.name;
  const labelledBy = () => typeof props['aria-labelledby'] === 'string' ? props['aria-labelledby'] : ([...new Set([labelable?.labelId, labelId()].filter(Boolean))].join(' ') || undefined);
  const setActive = (index: number) => { setActiveState(index); if (index !== -1) setLastUsed(index); };
  const commit = (value: number | readonly number[], details: SliderRootCommitEventDetails) => props.onValueCommitted?.(value as Value extends number ? number : Value, details);
  let pendingInput: number | number[] | undefined;
  const inputValues = () => pendingInput === undefined ? values() : typeof pendingInput === 'number' ? [pendingInput] : pendingInput;
  // Native events are deliberately retained: proposed value is the callback argument,
  // not an invented event.target object. A gesture passes its last accepted candidate.
  const setValue: SliderRootContext['setValue'] = (value, details, previous = model.value()) => {
    if (!model.request(value, details, previous)) return false;
    lastChangeReasonRef.current = details.reason;
    return true;
  };
  const state: SliderRootState = {
    get disabled() { return disabled(); }, get activeThumbIndex() { return active(); },
    get dragging() { return dragging(); }, get min() { return min(); }, get max() { return max(); },
    get step() { return props.step ?? 1; }, get minStepsBetweenValues() { return props.minStepsBetweenValues ?? 0; },
    get orientation() { return props.orientation ?? 'horizontal'; }, get values() { return values(); },
    get touched() { return field?.state.touched ?? false; }, get dirty() { return field?.state.dirty ?? false; },
    get valid() { return field?.state.valid ?? null; }, get focused() { return field?.state.focused ?? false; },
    get filled() { return field?.state.filled ?? false; },
  };
  const context: SliderRootContext = {
    state, field, controlRef, thumbRefs, lastChangeReasonRef,
    get controlElement() { return controlElement(); },
    registerControl(element) { controlRef.current = element; setControlElement(element); },
    pressedThumbIndexRef: { current: -1 }, pressedThumbCenterOffsetRef: { current: null }, pressedValuesRef: { current: null },
    get active() { return active(); }, get lastUsedThumbIndex() { return lastUsed(); }, get dragging() { return dragging(); },
    get disabled() { return disabled(); }, get min() { return min(); }, get max() { return max(); },
    get step() { return state.step; }, get largeStep() { return props.largeStep ?? 10; },
    get minStepsBetweenValues() { return state.minStepsBetweenValues; }, get orientation() { return state.orientation; },
    get thumbCollisionBehavior() { return props.thumbCollisionBehavior ?? 'push'; },
    get inset() { return (props.thumbAlignment ?? 'center') !== 'center'; },
    get renderBeforeHydration() { return props.thumbAlignment === 'edge'; },
    get isArrayValue() { return Array.isArray(model.value()); }, get values() { return values(); },
    get format() { return props.format; }, get locale() { return props.locale; }, get name() { return name(); }, get form() { return props.form; },
    get labelId() { return labelledBy(); }, get rootLabelId() { return `${id()}-label`; },
    get indicatorPosition() { return indicatorPosition(); }, get thumbMap() { return thumbMap(); },
    setActive, setDragging, setIndicatorPosition, setLabelId, setValue, onValueCommitted: commit, inputValues,
    handleInputChange(value, index, event) {
      if (disabled() || Number.isNaN(value)) return;
      const next = getSliderValue(value, index, min(), max(), context.isArrayValue, inputValues());
      if (!validateMinimumDistance(next, state.step, state.minStepsBetweenValues)) return;
      const details = 'key' in event
        ? createChangeEventDetails('keyboard', event as KeyboardEvent, undefined, { activeThumbIndex: index })
        : createChangeEventDetails('input-change', event, undefined, { activeThumbIndex: index });
      const accepted = setValue(next, details, pendingInput);
      field?.setTouched(true);
      if (accepted) {
        pendingInput = next;
        queueMicrotask(() => { if (pendingInput === next) pendingInput = undefined; });
        commit(next, createGenericEventDetails(details.reason, details.event));
      }
    },
  };
  createRegisterFieldControl(field?.validation.inputRef ?? (() => null), id, fieldValue, undefined, () => !disabled(), () => props.name);
  if (field) {
    let previous = untrack(fieldValue);
    createEffect(() => ({ value: fieldValue(), name: name(), initial: field.validityData.initialValue }), ({ value, name: fieldName, initial }) => {
      if (!areValuesEqual(value, previous)) {
        previous = value;
        form?.clearErrors(fieldName);
        field.validation.change(value);
        field.setDirty(!areValuesEqual(value, initial));
      }
    });
  }
  createEffect(disabled, (isDisabled) => {
    if (!isDisabled) return;
    const root = rootRef.current;
    const focused = root && activeElement(root.ownerDocument);
    if (root && contains(root, focused)) (focused as HTMLElement)?.blur();
    setActive(-1);
  });
  if (process.env.NODE_ENV !== 'production') createEffect(() => min() >= max(), (invalid) => { if (invalid) warn('Slider `max` must be greater than `min`.'); });
  const elementProps = omit(props, 'class', 'style', 'render', 'ref', 'defaultValue', 'value', 'disabled', 'format', 'locale', 'largeStep', 'max', 'min', 'minStepsBetweenValues', 'form', 'name', 'onValueChange', 'onValueCommitted', 'orientation', 'step', 'thumbAlignment', 'thumbCollisionBehavior', 'id', 'aria-labelledby');
  const Host = () => createRenderElement('div', props, {
    state, get ref() { return [props.ref, rootRef]; }, stateAttributesMapping: sliderStateAttributesMapping,
    props: [{ role: 'group', get id() { return id(); }, get 'aria-labelledby'() { return labelledBy(); } }, elementProps,
      (p) => field?.validation.getValidationProps(disabled(), p) ?? p],
  });
  return <SliderRootContext value={context}><CompositeList elementsRef={thumbRefs} onMapChange={setThumbMap}><Host /></CompositeList></SliderRootContext>;
}
export interface SliderRootState extends FieldRootState {
  activeThumbIndex: number; dragging: boolean; min: number; max: number; step: number; minStepsBetweenValues: number;
  orientation: 'horizontal' | 'vertical'; values: readonly number[];
}
export interface SliderRootProps<Value extends number | readonly number[] = number | readonly number[]> extends BaseUIComponentProps<'div', SliderRootState, JSX.HTMLAttributes<HTMLElement>> {
  defaultValue?: Value; value?: Value; disabled?: boolean; format?: Intl.NumberFormatOptions; locale?: Intl.LocalesArgument;
  max?: number; min?: number; minStepsBetweenValues?: number; name?: string; form?: string;
  orientation?: 'horizontal' | 'vertical'; step?: number; largeStep?: number;
  thumbAlignment?: 'center' | 'edge' | 'edge-client-only'; thumbCollisionBehavior?: 'push' | 'swap' | 'none';
  onValueChange?: (value: Value extends number ? number : Value, details: SliderRootChangeEventDetails) => void;
  onValueCommitted?: (value: Value extends number ? number : Value, details: SliderRootCommitEventDetails) => void;
}
export type SliderRootChangeEventReason = 'input-change' | 'track-press' | 'drag' | 'keyboard' | 'none';
export interface SliderRootChangeEventCustomProperties { activeThumbIndex: number }
export type SliderRootChangeEventDetails = BaseUIChangeEventDetails<SliderRootChangeEventReason, SliderRootChangeEventCustomProperties>;
export type SliderRootCommitEventReason = SliderRootChangeEventReason;
export type SliderRootCommitEventDetails = BaseUIGenericEventDetails<SliderRootCommitEventReason>;
export namespace SliderRoot {
  export type State = SliderRootState;
  export type Props<Value extends number | readonly number[] = number | readonly number[]> = SliderRootProps<Value>;
  export type ChangeEventReason = SliderRootChangeEventReason;
  export type ChangeEventDetails = SliderRootChangeEventDetails;
  export type CommitEventReason = SliderRootCommitEventReason;
  export type CommitEventDetails = SliderRootCommitEventDetails;
}
