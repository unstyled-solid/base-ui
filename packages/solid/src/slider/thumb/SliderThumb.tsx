import { createEffect, createSignal, onCleanup, omit } from 'solid-js';
import { isServer, type JSX } from '@solidjs/web';
import type { BaseUIComponentProps, WithBaseUIEvent } from '../../internals/types';
import { createRenderElement } from '../../internals/createRenderElement';
import { createBaseUiId } from '../../internals/createBaseUiId';
import { createCompositeListItem } from '../../internals/composite';
import { useDirection } from '../../internals/direction-context/DirectionContext';
import { createLabelableId } from '../../internals/labelable-provider/createLabelableId';
import { createSetFieldFocused } from '../../internals/field-root-context/createSetFieldFocused';
import { createMergedRefsN } from '../../utils/createMergedRefs';
import { createIsHydrating } from '../../utils/createIsHydrating';
import { visuallyHidden } from '../../utils/visuallyHidden';
import { valueToPercent } from '../../utils/valueToPercent';
import { formatNumber } from '../../utils/formatNumber';
import { clamp } from '../../utils/clamp';
import { contains } from '../../utils/shadowDom';
import { useSliderRootContext, type ThumbMetadata } from '../root/SliderRootContext';
import type { SliderRootState } from '../root/SliderRoot';
import { sliderStateAttributesMapping } from '../root/stateAttributesMapping';
import { getMidpoint } from '../utils/getMidpoint';
import { getDecimalPrecision, roundValueToStep } from '../utils/roundValueToStep';
import { SliderPrehydrationScript } from './SliderPrehydrationScript';

export function SliderThumb(props: SliderThumbProps) {
  const context = useSliderRootContext();
  const direction = useDirection();
  const id = createBaseUiId(() => typeof props.id === 'string' ? props.id : undefined);
  const defaultInputId = createBaseUiId();
  const labelableId = createLabelableId({ enabled: () => context.values.length <= 1 });
  const inputId = () => context.values.length > 1 ? defaultInputId() : labelableId();
  const disabled = () => Boolean(props.disabled || context.disabled);
  const vertical = () => context.orientation === 'vertical';
  const range = () => context.values.length > 1;
  const listItem = createCompositeListItem<ThumbMetadata>({ metadata: { get inputId() { return inputId(); } } });
  const index = () => !range() ? 0 : (props.index ?? listItem.index ?? -1);
  const value = () => context.values[index()];
  const percent = () => valueToPercent(value(), context.min, context.max);
  const last = () => index() === context.values.length - 1;
  const hydrating = createIsHydrating();
  const [position, setPosition] = createSignal<number>();
  const [thumb, setThumb] = createSignal<HTMLElement | null>(null);
  const input = { current: null as HTMLInputElement | null };
  const [inputElement, setInputElement] = createSignal<HTMLInputElement | null>(null);
  const inputToken = Symbol('slider-input');
  let restoringFocus = false;
  const setFocused = createSetFieldFocused(disabled, inputElement);
  const registerInput = (element: HTMLInputElement | null) => {
    if (isServer) return;
    setInputElement(element);
    context.field?.validation.registerInput(inputToken, element);
  };
  const inputRef = createMergedRefsN<HTMLInputElement>(() => [input, props.inputRef, registerInput]);
  // Native inputs register only after client ref attachment; server disposal
  // must not create/remove a field registration that never existed.
  if (!isServer) onCleanup(() => { context.field?.validation.registerInput(inputToken, null); });
  // Measurements are terminal DOM work. All reactive inputs are captured in compute.
  createEffect(() => ({ inset: context.inset, percent: percent(), vertical: vertical(), index: index(), last: last(), thumb: thumb(), control: context.controlElement }), (snapshot) => {
    if (!snapshot.inset || !snapshot.thumb) return;
    let disposed = false;
    const control = snapshot.control;
    const element = snapshot.thumb;
    function measure() {
      if (disposed || !control) return;
      const side = snapshot.vertical ? 'height' : 'width';
      const size = control.getBoundingClientRect()[side];
      const thumbSize = element.getBoundingClientRect()[side];
      const candidate = (thumbSize / 2 + (size - thumbSize) * snapshot.percent / 100) / size * 100;
      const next = Number.isFinite(candidate) ? candidate : undefined;
      setPosition(next);
      if (snapshot.index === 0) context.setIndicatorPosition((p) => [next, p[1]]);
      else if (snapshot.last) context.setIndicatorPosition((p) => [p[0], next]);
    }
    measure();
    queueMicrotask(measure);
    const Observer = control?.ownerDocument.defaultView?.ResizeObserver;
    const observer = Observer ? new Observer(measure) : undefined;
    if (control) observer?.observe(control);
    observer?.observe(element);
    return () => { disposed = true; observer?.disconnect(); };
  });
  const ariaLabel = () => typeof props.getAriaLabel === 'function' ? props.getAriaLabel(index()) : props['aria-label'];
  function inputChange(event: Event & { currentTarget: HTMLInputElement }) {
    const node = event.currentTarget;
    if (!disabled()) context.handleInputChange(node.valueAsNumber, index(), event);
    // A native range input mutates its value before dispatch. Project the permitted
    // transaction immediately, then reconcile with the published controlled value.
    node.value = String(context.inputValues()[index()] ?? '');
    queueMicrotask(() => {
      if (input.current === node) node.value = String(context.values[index()] ?? '');
    });
  }
  const inputDefaults = {
    get 'aria-label'() { return ariaLabel(); },
    get 'aria-labelledby'() { return props['aria-labelledby'] ?? (ariaLabel() == null ? context.labelId : undefined); },
    get 'aria-describedby'() { return props['aria-describedby']; },
    get 'aria-orientation'() { return context.orientation; },
    get 'aria-valuenow'() { return value(); },
    get 'aria-valuetext'() {
      if (typeof props.getAriaValueText === 'function') return props.getAriaValueText(formatNumber(value(), context.locale, context.format), value(), index());
      if (props['aria-valuetext'] !== undefined) return props['aria-valuetext'];
      if (index() < 0 || !Number.isFinite(value())) return undefined;
      const formatted = formatNumber(value(), context.locale, context.format);
      return context.values.length === 2 ? `${formatted} ${index() === 0 ? 'start' : 'end'} range` : context.format ? formatted : undefined;
    },
    get id() { return inputId(); }, get disabled() { return disabled(); }, get form() { return context.form; },
    get name() { return context.name; }, get min() { return context.min; }, get max() { return context.max; },
    get step() { return context.step; }, get tabindex() { return props.tabIndex ?? props.tabindex; },
    type: 'range' as const, get value() { return value() ?? ''; },
    // Solid's value binding updates the property, whereas React also projects
    // the current value to the attribute/defaultValue used by reset and cloning.
    // SSR already serializes `value`; avoid emitting the same attribute twice.
    get defaultValue() { return isServer ? undefined : value() ?? ''; },
    get style() { return { ...visuallyHidden, width: '100%', height: '100%', 'writing-mode': vertical() ? (direction() === 'rtl' ? 'vertical-rl' : 'vertical-lr') : undefined } as JSX.CSSProperties; },
    onInput: inputChange,
    onChange: inputChange,
    onFocus(event: FocusEvent) {
      context.setActive(index()); setFocused(true);
      if (restoringFocus) event.stopPropagation();
    },
    onBlur(event: FocusEvent) {
      if (restoringFocus) { event.stopPropagation(); return; }
      context.setActive(-1);
      if (context.thumbRefs.current.some((element) => contains(element, event.relatedTarget as Element | null))) return;
      context.field?.setTouched(true); setFocused(false);
      if (context.field?.validationMode === 'onBlur') {
        const values = context.inputValues();
        void context.field.validation.commit(context.isArrayValue ? values : values[0]);
      }
    },
    onKeyDown(event: KeyboardEvent & { currentTarget: HTMLInputElement }) {
      if (disabled() || event.defaultPrevented) return;
      const key = event.key;
      if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown'].includes(key)) return;
      if (key !== 'PageUp' && key !== 'PageDown') event.stopPropagation();
      const increment = event.shiftKey || key === 'PageUp' || key === 'PageDown' ? context.largeStep : context.step;
      const inputValues = context.inputValues();
      const rounded = roundValueToStep(inputValues[index()], context.step, context.min);
      let next: number;
      if (key === 'Home') next = range() && Number.isFinite(inputValues[index() - 1]) ? inputValues[index() - 1] + context.step * context.minStepsBetweenValues : context.min;
      else if (key === 'End') next = range() && Number.isFinite(inputValues[index() + 1]) ? inputValues[index() + 1] - context.step * context.minStepsBetweenValues : context.max;
      else {
        const positive = key === 'ArrowUp' || key === 'PageUp' || (key === 'ArrowRight' && direction() !== 'rtl') || (key === 'ArrowLeft' && direction() === 'rtl');
        next = clamp(Number((rounded + increment * (positive ? 1 : -1)).toFixed(Math.max(getDecimalPrecision(rounded), getDecimalPrecision(increment), getDecimalPrecision(context.min)))), context.min, context.max);
      }
      if (!event.currentTarget.matches(':focus-visible')) {
        restoringFocus = true;
        event.currentTarget.blur();
        event.currentTarget.focus({ preventScroll: true, focusVisible: true } as FocusOptions);
        restoringFocus = false;
      }
      context.handleInputChange(next, index(), event);
      event.preventDefault();
    },
  };
  const Input = () => createRenderElement('input', {}, {
    ref: inputRef,
    props: [inputDefaults,
      (p) => context.field?.validation.getValidationProps(disabled(), p) ?? p,
      { get onFocus() { return restoringFocus ? undefined : props.onFocus; }, get onBlur() { return restoringFocus ? undefined : props.onBlur; }, get onKeyDown() { return props.onKeyDown; } }],
  });
  const content = <>{props.children}<Input />{context.inset && last() && context.renderBeforeHydration && <SliderPrehydrationScript />}</>;
  const reportThumb = (element: HTMLElement | null) => { if (!isServer) setThumb(element); };
  return createRenderElement('div', props, { state: context.state, stateAttributesMapping: sliderStateAttributesMapping,
    get ref() { return [props.ref, listItem.ref, reportThumb]; },
    props: [{
      get id() { return id(); }, get 'data-index'() { return index(); }, children: content,
      onPointerDown(event: PointerEvent & { currentTarget: HTMLElement }) {
        if (disabled()) return;
        context.pressedThumbIndexRef.current = index();
        context.pressedThumbCenterOffsetRef.current = (vertical() ? event.clientY : event.clientX) - getMidpoint(event.currentTarget, vertical());
      },
      get style(): JSX.CSSProperties {
        if (!context.inset && !Number.isFinite(percent())) return visuallyHidden;
        const safeLast = context.lastUsedThumbIndex >= 0 && context.lastUsedThumbIndex < context.values.length ? context.lastUsedThumbIndex : -1;
        return {
          position: 'absolute', [vertical() ? 'bottom' : 'inset-inline-start']: context.inset ? 'var(--position)' : `${percent()}%`,
          [vertical() ? 'left' : 'top']: '50%', translate: `${vertical() || direction() !== 'rtl' ? -50 : 50}% ${vertical() ? 50 : -50}%`,
          'z-index': range() ? context.active === index() ? 2 : safeLast === index() ? 1 : undefined : context.active === index() ? 1 : undefined,
          ...(context.inset ? { '--position': `${position() ?? 0}%`, visibility: (context.renderBeforeHydration && hydrating()) || position() === undefined ? 'hidden' : undefined } : {}),
        };
      },
    }, omit(props, 'class', 'style', 'render', 'ref', 'children', 'id', 'disabled', 'index', 'inputRef', 'onBlur', 'onFocus', 'onKeyDown', 'tabIndex', 'tabindex', 'getAriaLabel', 'getAriaValueText', 'aria-label', 'aria-labelledby', 'aria-describedby', 'aria-valuetext')],
  });
}
export type { ThumbMetadata } from '../root/SliderRootContext';
export interface SliderThumbState extends SliderRootState {}
export interface SliderThumbProps extends Omit<BaseUIComponentProps<'div', SliderThumbState, JSX.HTMLAttributes<HTMLElement>>, 'onFocus' | 'onBlur' | 'onKeyDown'> {
  disabled?: boolean; index?: number; inputRef?: JSX.Ref<HTMLInputElement>;
  tabIndex?: number;
  getAriaLabel?: ((index: number) => string) | null;
  getAriaValueText?: ((formattedValue: string, value: number, index: number) => string) | null;
  onFocus?: WithBaseUIEvent<JSX.InputHTMLAttributes<HTMLInputElement>>['onFocus'];
  onBlur?: WithBaseUIEvent<JSX.InputHTMLAttributes<HTMLInputElement>>['onBlur'];
  onKeyDown?: WithBaseUIEvent<JSX.InputHTMLAttributes<HTMLInputElement>>['onKeyDown'];
}
export namespace SliderThumb { export type State = SliderThumbState; export type Props = SliderThumbProps }
