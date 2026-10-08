// Adapted from Base UI (MIT), 19511bb171f3b360b006c94cf6d07e53cb446505.
import { createEffect, omit, untrack } from 'solid-js';
import type { ComponentProps, JSX } from '@solidjs/web';
import type { BaseUIComponentProps } from '../../internals/types';
import { createRenderElement } from '../../internals/createRenderElement';
import { useLabelableContext } from '../../internals/labelable-provider';
import { createSetFieldFocused } from '../../internals/field-root-context/createSetFieldFocused';
import { createRegisterFieldControl } from '../../internals/field-register-control';
import { createChangeEventDetails, createGenericEventDetails } from '../../internals/createBaseUIEventDetails';
import { formatNumber } from '../../utils/formatNumber';
import { warn } from '../../utils/warn';
import { useNumberFieldRootContext } from '../root/NumberFieldRootContext';
import type { NumberFieldRootState } from '../root/NumberFieldRoot';
import { getNumberLocaleDetails, isNumeralChar, parseNumber, ANY_MINUS_RE, ANY_PLUS_RE, ANY_MINUS_DETECT_RE, ANY_PLUS_DETECT_RE, FORMAT_CONTROL_DETECT_RE } from '../utils/parse';
import { hasNumberFormatRoundingOptions, removeFloatingPointErrors } from '../utils/validate';
import { stateAttributesMapping } from '../utils/stateAttributesMapping';

const NAVIGATE_KEYS = new Set(['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter', 'Escape']);

export function NumberFieldInput(props: NumberFieldInput.Props) {
  const elementProps = omit(props, 'render', 'class', 'style', 'ref');
  const context = useNumberFieldRootContext();
  const field = context.field;
  const label = useLabelableContext();
  const setFocused = createSetFieldFocused(() => context.state.disabled, context.input);
  let pendingCaret: number | null = null;
  let previousValue = untrack(() => context.state.value);
  createRegisterFieldControl(context.input, () => context.id, () => context.state.value,
    undefined, () => !context.state.disabled, () => context.nameProp);
  createEffect(() => context.state.value, (value) => {
    if (value === previousValue) return;
    previousValue = value;
    context.form?.clearErrors(context.name);
    if (context.blockRevalidation && !field?.shouldValidateOnChange()) {
      context.blockRevalidation = false;
      return;
    }
    field?.validation.change(value);
  });
  createEffect(() => ({ text: context.state.inputValue, element: context.input() }), ({ element }) => {
    if (pendingCaret !== null) {
      element?.setSelectionRange(pendingCaret, pendingCaret);
      pendingCaret = null;
    }
  });

  const inputProps: JSX.InputHTMLAttributes<HTMLInputElement> = {
    get id() { return context.id; }, get required() { return context.state.required; },
    get disabled() { return context.state.disabled; }, get readonly() { return context.state.readOnly; },
    get inputmode() { return context.inputMode; }, get value() { return context.state.inputValue; },
    type: 'text', autocomplete: 'off', autocorrect: 'off', spellcheck: false,
    'aria-roledescription': 'Number field',
    get 'aria-invalid'() { return !context.state.disabled && field?.invalid ? 'true' : undefined; },
    get 'aria-labelledby'() { return label?.labelId; },
    onFocus(event) {
      if (event.defaultPrevented || context.state.disabled) return;
      setFocused(true);
    },
    onBlur(event) {
      if (event.defaultPrevented || context.state.disabled) return;
      field?.setTouched(true);
      setFocused(false);
      if (context.state.readOnly) return;
      const manual = context.manual;
      const pending = context.pendingCommit;
      const inputValue = context.text();
      const value = context.numericValue();
      context.manual = false;
      if (inputValue.trim() === '') {
        const result = context.setValue(null, createChangeEventDetails('input-clear', event));
        if (!result.accepted) return;
        if (field?.validationMode === 'onBlur') void field.validation.commit(null);
        if (manual || pending || value !== null) context.commit(null, createGenericEventDetails('input-clear', event));
        return;
      }
      const parsed = parseNumber(inputValue, context.locale, context.format);
      if (parsed === null) return;
      const rounding = hasNumberFormatRoundingOptions(context.format);
      const committed = !manual && !rounding ? value : rounding ? removeFloatingPointErrors(parsed, context.format) : parsed;
      const shouldUpdate = value !== committed;
      let candidate = committed;
      if (shouldUpdate) {
        context.blockRevalidation = true;
        const result = context.setValue(committed, createChangeEventDetails('input-blur', event));
        if (!result.accepted) { context.blockRevalidation = false; return; }
        candidate = result.value;
        if (candidate === value) context.blockRevalidation = false;
      }
      if (field?.validationMode === 'onBlur') void field.validation.commit(candidate);
      if (manual || shouldUpdate || pending) context.commit(candidate, createGenericEventDetails('input-blur', event));
      context.setText(formatNumber(candidate, context.locale, context.format), candidate);
    },
    onInput(event) {
      if (event.defaultPrevented || context.state.disabled || context.state.readOnly) {
        event.currentTarget.value = context.text();
        return;
      }
      const previousText = context.text();
      context.manual = true;
      const nextText = event.currentTarget.value;
      if (nextText.trim() === '') {
        context.setText(nextText);
        context.setValue(null, createChangeEventDetails('input-clear', event));
        return;
      }
      const allowed = context.getAllowedNonNumericKeys();
      const valid = Array.from(nextText).every((ch) => isNumeralChar(ch) || ANY_MINUS_DETECT_RE.test(ch) || allowed.has(ch) || FORMAT_CONTROL_DETECT_RE.test(ch));
      if (!valid) {
        context.setText(previousText);
        event.currentTarget.value = previousText;
        return;
      }
      const parsed = parseNumber(nextText, context.locale, context.format);
      context.setText(nextText);
      if (parsed !== null) context.setValue(parsed, createChangeEventDetails('input-change', event));
    },
    onKeyDown(event) {
      if (event.defaultPrevented || context.state.readOnly || context.state.disabled) return;
      const manual = context.manual;
      const text = context.text();
      const allowed = context.getAllowedNonNumericKeys();
      let allowedKey = allowed.has(event.key);
      const { decimal, currency, percentSign } = getNumberLocaleDetails(context.locale, context.format);
      const start = event.currentTarget.selectionStart;
      const end = event.currentTarget.selectionEnd;
      const allSelected = start === 0 && end === text.length;
      const containsIndex = (index: number) => start !== null && end !== null && index >= start && index < end;
      ([[ANY_MINUS_DETECT_RE, ANY_MINUS_RE], [ANY_PLUS_DETECT_RE, ANY_PLUS_RE]] as const).forEach(([detect, global]) => {
        if (detect.test(event.key) && Array.from(allowed).some((key) => detect.test(key))) {
          const index = text.search(global);
          allowedKey = !(ANY_MINUS_DETECT_RE.test(text) || ANY_PLUS_DETECT_RE.test(text)) || allSelected || (index !== -1 && containsIndex(index));
        }
      });
      [decimal, currency, percentSign].forEach((symbol) => {
        if (event.key === symbol) { const index = text.indexOf(symbol); allowedKey = index === -1 || allSelected || containsIndex(index); }
      });
      const stepKey = event.key === 'ArrowUp' || event.key === 'ArrowDown';
      if (event.which === 229 || event.isComposing || (event.altKey && !stepKey) || event.ctrlKey || event.metaKey || allowedKey || isNumeralChar(event.key) || NAVIGATE_KEYS.has(event.key)) return;
      const bound = event.key === 'Home' ? context.min : event.key === 'End' ? context.max : undefined;
      if (event.key.length > 1 && !stepKey && bound == null) return;
      const current = manual ? parseNumber(text, context.locale, context.format) : null;
      event.preventDefault();
      event.stopPropagation();
      if (!stepKey && bound == null) return;
      context.manual = false;
      const result = stepKey
        ? context.increment(context.getStepAmount(event), event.key === 'ArrowUp' ? 1 : -1, createChangeEventDetails('keyboard', event), current)
        : context.setValue(bound!, createChangeEventDetails('keyboard', event));
      if (result.changed) context.commit(result.value, createGenericEventDetails('keyboard', event));
    },
    onPaste(event) {
      if (event.defaultPrevented || context.state.readOnly || context.state.disabled) return;
      let data = '';
      try { data = event.clipboardData?.getData('text/plain') ?? ''; }
      catch {
        if (process.env.NODE_ENV !== 'production') warn('<NumberField.Input> could not read clipboard text during paste handling.');
        return;
      }
      event.preventDefault();
      const input = event.currentTarget;
      const start = input.selectionStart!;
      const end = input.selectionEnd!;
      const text = context.text();
      const nextText = text.slice(0, start) + data + text.slice(end);
      const parsed = parseNumber(nextText, context.locale, context.format);
      if (parsed !== null) {
        context.manual = true;
        pendingCaret = start + data.length;
        context.setValue(parsed, createChangeEventDetails('input-paste', event));
        context.setText(nextText);
        // Native text insertion and selection are one transaction, including unchanged pastes.
        input.value = nextText;
        input.setSelectionRange(pendingCaret, pendingCaret);
      }
    },
  };
  return createRenderElement('input', props, {
    state: context.state, get ref() { return [props.ref, context.registerInput]; },
    props: [inputProps, elementProps, (merged) => field?.validation.getValidationProps(context.state.disabled, merged) ?? label?.getDescriptionProps(merged) ?? merged],
    stateAttributesMapping,
  });
}
export interface NumberFieldInputState extends NumberFieldRootState {}
export interface NumberFieldInputProps extends BaseUIComponentProps<'input', NumberFieldInputState, ComponentProps<'input'>> {}
export namespace NumberFieldInput { export type Props = NumberFieldInputProps; export type State = NumberFieldInputState; }
