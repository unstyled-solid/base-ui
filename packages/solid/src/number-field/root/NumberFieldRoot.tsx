// Adapted from Base UI (MIT), 19511bb171f3b360b006c94cf6d07e53cb446505.
import { createEffect, createMemo, createSignal, onCleanup, omit } from 'solid-js';
import type { JSX } from '@solidjs/web';
import type { BaseUIComponentProps } from '../../internals/types';
import { createControlled } from '../../utils/createControlled';
import { createMergedRefsN } from '../../utils/createMergedRefs';
import { createRenderElement } from '../../internals/createRenderElement';
import { useFieldRootContext, type FieldRootState } from '../../internals/field-root-context';
import { useFormContext } from '../../internals/form-context';
import { createLabelableId } from '../../internals/labelable-provider';
import { createChangeEventDetails, createGenericEventDetails, type BaseUIChangeEventDetails, type BaseUIGenericEventDetails } from '../../internals/createBaseUIEventDetails';
import { formatNumber } from '../../utils/formatNumber';
import { visuallyHidden, visuallyHiddenInput } from '../../utils/visuallyHidden';
import { platform } from '../../utils/platform';
import { activeElement } from '../../utils/shadowDom';
import { addEventListener } from '../../utils/addEventListener';
import { ownerDocument } from '../../utils/owner';
import { toValidatedNumber } from '../utils/validate';
import { getFormatParts, getNumberLocaleDetails, BASE_NON_NUMERIC_SYMBOLS, SPACE_SEPARATOR_RE, PERCENTAGES, PERMILLE, PLUS_SIGNS_WITH_ASCII, MINUS_SIGNS_WITH_ASCII } from '../utils/parse';
import { stateAttributesMapping } from '../utils/stateAttributesMapping';
import { NumberFieldRootContext, type ValueResult } from './NumberFieldRootContext';

export function NumberFieldRoot(props: NumberFieldRoot.Props) {
  const elementProps = omit(props, 'id', 'min', 'max', 'smallStep', 'step', 'largeStep', 'required', 'disabled', 'readOnly', 'form', 'name', 'defaultValue', 'value', 'onValueChange', 'onValueCommitted', 'allowWheelScrub', 'snapOnStep', 'allowOutOfRange', 'format', 'locale', 'inputRef', 'render', 'class', 'style', 'ref');
  const field = useFieldRootContext();
  const form = useFormContext();
  const id = createLabelableId({ id: () => props.id });
  const control = createControlled<number | null, NumberFieldRoot.ChangeEventDetails>({
    value: () => props.value, get defaultValue() { return props.defaultValue ?? null; },
    onChange: () => props.onValueChange, name: 'NumberField', state: 'value',
  });
  const disabled = () => Boolean(props.disabled || field?.disabled);
  const name = () => field?.name ?? props.name;
  const [input, setInput] = createSignal<HTMLInputElement | null>(null);
  const [scrubbing, setScrubbing] = createSignal(false);
  const scrubOwners = new Set<symbol>();
  type Draft = { text: string; numeric: number | null; locale: Intl.LocalesArgument | undefined; format: Intl.NumberFormatOptions | undefined };
  const [draft, setDraft] = createSignal<Draft | null>(null);
  let manual = false;
  // Drafts are user/transaction state. Formatted display is a derivation, never an effect relay.
  const text = createMemo(() => {
    const entry = draft();
    const value = control.value();
    return entry && (manual || (entry.numeric === value && entry.locale === props.locale && entry.format === props.format))
      ? entry.text : formatNumber(value, props.locale, props.format);
  });
  let pendingNumeric: { value: number | null } | undefined;
  let pendingText: string | undefined;
  let hiddenElement: HTMLInputElement | null = null;
  const state: NumberFieldRootState = {
    get disabled() { return disabled(); }, get readOnly() { return props.readOnly ?? false; },
    get required() { return props.required ?? false; }, get value() { return control.value(); },
    get inputValue() { return text(); }, get scrubbing() { return scrubbing(); },
    get touched() { return field?.state.touched ?? false; }, get dirty() { return field?.state.dirty ?? false; },
    get valid() { return field?.state.valid ?? null; }, get filled() { return field?.state.filled ?? false; },
    get focused() { return field?.state.focused ?? false; },
  };
  const context: NumberFieldRootContext = {
    state, field, form, input,
    get id() { return id(); }, get name() { return name(); }, get nameProp() { return props.name; },
    get min() { return props.min; }, get max() { return props.max; },
    get minWithDefault() { return props.min ?? Number.MIN_SAFE_INTEGER; },
    get maxWithDefault() { return props.max ?? Number.MAX_SAFE_INTEGER; },
    get locale() { return props.locale; }, get format() { return props.format; },
    get inputMode() { return platform.os.ios ? context.minWithDefault >= 0 ? 'decimal' : 'text' : 'numeric'; },
    get manual() { return manual; }, set manual(value) { manual = value; },
    pendingCommit: false, lastChanged: null, blockRevalidation: false,
    registerInput(element) { setInput(element); },
    focusInput() {
      const element = input();
      if (!element) return;
      element.setSelectionRange(element.value.length, element.value.length);
      element.focus();
    },
    numericValue() { return !control.controlled && pendingNumeric ? pendingNumeric.value : control.value(); },
    text() { return pendingText ?? text(); },
    setText(nextText, numeric = context.numericValue()) {
      pendingText = nextText;
      setDraft({ text: nextText, numeric, locale: props.locale, format: props.format });
      queueMicrotask(() => { if (pendingText === nextText) pendingText = undefined; });
    },
    syncText() { pendingText = undefined; setDraft(null); },
    setScrubbing(source, active) {
      if (active) scrubOwners.add(source); else scrubOwners.delete(source);
      setScrubbing(scrubOwners.size > 0);
    },
    getStepAmount(event) { return event?.altKey ? props.smallStep ?? 0.1 : event?.shiftKey ? props.largeStep ?? 10 : props.step === 'any' ? 1 : props.step ?? 1; },
    getAllowedNonNumericKeys() {
      const parts = getFormatParts(props.locale, props.format);
      const keys = new Set<string>(BASE_NON_NUMERIC_SYMBOLS);
      const addAll = (chars: readonly string[]) => chars.forEach((char) => keys.add(char));
      keys.add(parts.find((part) => part.type === 'decimal')?.value ?? getNumberLocaleDetails(props.locale, props.format).decimal);
      parts.forEach((part) => {
        if (['integer', 'fraction', 'exponentInteger', 'compact'].includes(part.type)) return;
        addAll(Array.from(part.value));
        if (SPACE_SEPARATOR_RE.test(part.value)) keys.add(' ');
      });
      if (props.format?.style === 'percent' || (props.format?.style === 'unit' && props.format.unit === 'percent')) addAll(PERCENTAGES);
      if (props.format?.style === 'percent' || (props.format?.style === 'unit' && props.format.unit === 'permille')) addAll(PERMILLE);
      addAll(PLUS_SIGNS_WITH_ASCII);
      if (context.minWithDefault < 0 || props.allowOutOfRange) addAll(MINUS_SIGNS_WITH_ASCII);
      return keys;
    },
    setValue(proposal, details): ValueResult {
      const event = details.event as Event & { altKey?: boolean; shiftKey?: boolean };
      const direct = details.reason.startsWith('input-') || details.reason === 'none';
      const candidate = toValidatedNumber(proposal, details.direction ? context.getStepAmount(event) * details.direction : undefined,
        context.minWithDefault, context.maxWithDefault, props.min ?? 0, props.format,
        props.snapOnStep ?? false, event.altKey ?? false, !props.allowOutOfRange || !direct);
      const previous = context.numericValue();
      const changed = candidate !== previous || (direct && (proposal !== previous || context.manual));
      if (changed) {
        const result = control.request(candidate, details);
        if (!result.accepted) return { accepted: false, changed: false, value: previous };
        if (!control.controlled) {
          const transaction = { value: candidate };
          pendingNumeric = transaction;
          queueMicrotask(() => { if (pendingNumeric === transaction) pendingNumeric = undefined; });
          // Native constraints/form reads can run before RC13's staged render commits.
          if (hiddenElement) hiddenElement.value = candidate === null ? '' : String(candidate);
        }
        field?.setDirty(candidate !== field.validityData.initialValue);
        context.pendingCommit = true;
      }
      context.lastChanged = candidate;
      if (!context.manual) context.syncText();
      return { accepted: true, changed, value: candidate };
    },
    increment(amount, direction, details, currentValue) {
      const previous = currentValue ?? context.numericValue();
      if (previous === null) return context.setValue(0, details);
      details.direction = direction;
      return context.setValue(previous + amount * direction, details);
    },
    commit(value, details) { context.pendingCommit = false; props.onValueCommitted?.(value, details); },
  };
  createEffect(control.value, (value) => { field?.setFilled(value !== null); });
  const hiddenSource = Symbol('NumberField hidden validation');
  const attachHidden = (element: HTMLInputElement | null) => {
    hiddenElement = element;
    field?.validation.registerInput(hiddenSource, element);
  };
  const hiddenRef = createMergedRefsN<HTMLInputElement>(() => [props.inputRef, attachHidden]);
  onCleanup(() => field?.validation.registerInput(hiddenSource, null));

  createEffect(() => ({ element: input(), enabled: !disabled() && !props.readOnly && props.allowWheelScrub }), ({ element, enabled }) => {
    if (!element || !enabled) return;
    return addEventListener(element, 'wheel', (event: WheelEvent) => {
      if (event.ctrlKey || activeElement(ownerDocument(element)) !== element) return;
      const horizontal = Math.abs(event.deltaX) > Math.abs(event.deltaY);
      const delta = event.shiftKey && horizontal ? event.deltaX : event.deltaY;
      if (delta === 0 || (!event.shiftKey && horizontal)) return;
      event.preventDefault();
      context.manual = false;
      const result = context.increment(context.getStepAmount(event), delta > 0 ? -1 : 1, createChangeEventDetails('wheel', event));
      if (result.changed) context.commit(result.value, createGenericEventDetails('wheel', event));
    }, { passive: false });
  });

  let autofillInput: { raw: string; restored: string } | undefined;
  function handleAutofill(event: Event) {
    const element = event.currentTarget as HTMLInputElement;
    // React's change plugin observes native `input` as well as `change`, but
    // deduplicates the pair. Native Solid handlers must retain both paths.
    const previousInput = autofillInput;
    autofillInput = undefined;
    if (event.type === 'change' && previousInput &&
      (element.value === previousInput.raw || element.value === previousInput.restored ||
        element.value === String(control.value() ?? ''))) return;
    const raw = element.value;
    if (event.defaultPrevented || disabled() || props.readOnly) {
      element.value = String(control.value() ?? '');
      if (event.type === 'input') autofillInput = { raw, restored: element.value };
      return;
    }
    const value = element.valueAsNumber;
    const parsed = Number.isNaN(value) ? null : value;
    const result = context.setValue(parsed, createChangeEventDetails('none', event));
    form?.clearErrors(name());
    field?.validation.change(context.lastChanged ?? parsed);
    if (!result.accepted || control.controlled) element.value = String(control.value() ?? '');
    if (event.type === 'input') autofillInput = { raw, restored: element.value };
  }
  const hiddenProps = {
      onFocus() { context.focusInput(); },
      onInput: handleAutofill,
      onChange: handleAutofill,
      type: 'number', get form() { return props.form; }, get name() { return name(); },
      get value() { return control.value() ?? ''; }, get min() { return props.min; }, get max() { return props.max; },
      get step() { return props.step ?? 1; }, get disabled() { return disabled(); },
      get readonly() { return props.readOnly; }, get required() { return props.required; },
      'aria-hidden': 'true', tabindex: -1, get style() { return name() ? visuallyHiddenInput : visuallyHidden; },
  };
  // Render inside the provider: child accessors must resolve in the NumberField owner.
  return <NumberFieldRootContext value={context}>
    {createRenderElement('div', props, { state, props: elementProps, get ref() { return props.ref; }, stateAttributesMapping })}
    {createRenderElement('input', {}, { ref: hiddenRef, props: [hiddenProps,
      (merged) => field?.validation.getValidationProps(disabled(), merged) ?? merged] })}
  </NumberFieldRootContext>;
}

export interface NumberFieldRootState extends FieldRootState {
  value: number | null; inputValue: string; required: boolean; disabled: boolean; readOnly: boolean; scrubbing: boolean;
}
export interface NumberFieldRootProps extends Omit<BaseUIComponentProps<'div', NumberFieldRootState>, 'onChange'> {
  id?: string; min?: number; max?: number; smallStep?: number; step?: number | 'any'; largeStep?: number;
  required?: boolean; disabled?: boolean; readOnly?: boolean; form?: string; name?: string;
  defaultValue?: number; value?: number | null; allowWheelScrub?: boolean; snapOnStep?: boolean; allowOutOfRange?: boolean;
  format?: Intl.NumberFormatOptions; locale?: Intl.LocalesArgument; inputRef?: JSX.Ref<HTMLInputElement>;
  onValueChange?: (value: number | null, details: NumberFieldRootChangeEventDetails) => void;
  onValueCommitted?: (value: number | null, details: NumberFieldRootCommitEventDetails) => void;
}
export type NumberFieldRootChangeEventReason = 'input-change' | 'input-clear' | 'input-blur' | 'input-paste' | 'keyboard' | 'increment-press' | 'decrement-press' | 'wheel' | 'scrub' | 'none';
export type NumberFieldRootChangeEventDetails = BaseUIChangeEventDetails<NumberFieldRootChangeEventReason, { direction?: 1 | -1 }>;
export type NumberFieldRootCommitEventReason = 'input-blur' | 'input-clear' | 'keyboard' | 'increment-press' | 'decrement-press' | 'wheel' | 'scrub' | 'none';
export type NumberFieldRootCommitEventDetails = BaseUIGenericEventDetails<NumberFieldRootCommitEventReason>;
export namespace NumberFieldRoot {
  export type Props = NumberFieldRootProps;
  export type State = NumberFieldRootState;
  export type ChangeEventReason = NumberFieldRootChangeEventReason;
  export type ChangeEventDetails = NumberFieldRootChangeEventDetails;
  export type CommitEventReason = NumberFieldRootCommitEventReason;
  export type CommitEventDetails = NumberFieldRootCommitEventDetails;
}
