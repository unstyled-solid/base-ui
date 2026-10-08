import { createEffect, createMemo, createSignal, omit, onCleanup, untrack } from 'solid-js';
import type { ComponentProps, JSX } from '@solidjs/web';
import { createControlled } from '../../utils/createControlled';
import { visuallyHidden, visuallyHiddenInput } from '../../utils/visuallyHidden';
import { warn } from '../../utils/warn';
import { activeElement, contains } from '../../utils/shadowDom';
import { CompositeList } from '../../internals/composite';
import { useFieldRootContext, type FieldRootState } from '../../internals/field-root-context';
import { useFormContext } from '../../internals/form-context';
import { useLabelableContext, createLabelableId, createAriaLabelledBy } from '../../internals/labelable-provider';
import { createRegisterFieldControl } from '../../internals/field-register-control';
import { createRenderElement } from '../../internals/createRenderElement';
import { isDefaultPrevented } from '../../merge-props/mergeProps';
import type { BaseUIComponentProps } from '../../internals/types';
import {
  createChangeEventDetails, createGenericEventDetails,
  type BaseUIChangeEventDetails, type BaseUIGenericEventDetails,
} from '../../internals/createBaseUIEventDetails';
import { OTPFieldRootContext } from './OTPFieldRootContext';
import { createAcceptedValueActions } from './acceptedValue';
import { rootStateAttributesMapping } from '../utils/stateAttributesMapping';
import { getOTPValidationConfig, normalizeOTPValue, normalizeOTPValueWithDetails, type OTPValidationType } from '../utils/otp';

/** Groups OTP slots and owns the logical string and native validation input. */
export function OTPFieldRoot(props: OTPFieldRootProps) {
  const field = useFieldRootContext();
  const formContext = useFormContext();
  const labelable = useLabelableContext();
  const disabled = () => Boolean(field?.disabled || props.disabled);
  const name = () => field?.name ?? props.name;
  const validationType = () => props.validationType ?? 'numeric';
  const validationConfig = () => getOTPValidationConfig(validationType());
  const validLength = () => Number.isInteger(props.length) && props.length > 0;
  const inputMode = () => props.inputMode ?? validationConfig()?.inputMode;
  const controlled = createControlled<string, OTPFieldRootChangeEventDetails>({
    value: () => props.value,
    defaultValue: untrack(() => props.defaultValue ?? ''),
    onChange: () => props.onValueChange,
    name: 'OTPField', state: 'value',
  });
  const value = createMemo(() => normalizeOTPValue(controlled.value(), props.length, validationType(), props.normalizeValue));
  const [focused, setFocused] = createSignal(false);
  const [focusedIndex, setFocusedIndex] = createSignal(untrack(() => Math.min(value().length, props.length - 1)));
  const [inputCount, setInputCount] = createSignal(0);
  const inputRefs: { current: (HTMLInputElement | null)[] } = { current: [] };
  const [firstInput, setFirstInput] = createSignal<HTMLInputElement | null>(null);
  let root: HTMLDivElement | null = null;
  let hidden: HTMLInputElement | null = null;
  const validationSource = Symbol('OTP validation');
  const actions = createAcceptedValueActions<OTPFieldRootCompleteEventDetails>();
  let disposed = false;
  const id = createLabelableId({ id: () => props.id });
  const ariaLabelledBy = createAriaLabelledBy(
    () => typeof props['aria-labelledby'] === 'string' ? props['aria-labelledby'] : undefined,
    () => labelable?.labelId, firstInput, true, id,
  );
  const ariaDescribedBy = () => {
    const description = labelable?.getDescriptionProps({})['aria-describedby'];
    const ids = [props['aria-describedby'], description].flatMap((text) => typeof text === 'string' ? text.split(/\s+/).filter(Boolean) : []);
    return ids.length ? [...new Set(ids)].join(' ') : undefined;
  };
  createRegisterFieldControl(firstInput, id, value, undefined, () => !disabled(), () => props.name);

  function focusInput(index: number) {
    const target = inputRefs.current[Math.min(Math.max(index, 0), Math.max(inputRefs.current.length - 1, 0))];
    target?.focus();
    target?.select();
  }

  function synchronizeNativeValue(nextValue: string) {
    // Terminal DOM writes use the accepted snapshot, never a post-setter read.
    // This also makes requestSubmit independent of child render-effect ordering.
    if (hidden) hidden.value = nextValue;
    inputRefs.current.forEach((input, index) => {
      if (input && input.value !== (nextValue[index] ?? '')) input.value = nextValue[index] ?? '';
    });
  }

  function completeValue(nextValue: string, details: OTPFieldRootCompleteEventDetails) {
    props.onValueComplete?.(nextValue, details);
    if (!props.autoSubmit) return;
    let form = hidden?.form ?? inputRefs.current[0]?.form ?? null;
    if (props.form) {
      const associated = root?.ownerDocument.getElementById(props.form);
      // Explicit invalid association must not fall back to an ancestor form.
      form = associated?.tagName === 'FORM' ? associated as HTMLFormElement : null;
    }
    if (typeof form?.requestSubmit === 'function') form.requestSubmit();
  }

  let previousValue = untrack(value);
  createEffect(value, (nextValue) => {
    field?.setFilled(nextValue !== '');
    if (nextValue === previousValue) return;
    previousValue = nextValue;
    // Validation, like submission, must inspect the accepted native projection
    // regardless of whether child render effects ran before this observer.
    synchronizeNativeValue(nextValue);
    // These are imperative snapshots for this accepted change, not dependencies
    // of the value observer (validity itself is updated by validation.change).
    formContext?.clearErrors(untrack(name));
    field?.setDirty(nextValue !== untrack(() => field.validityData.initialValue));
    field?.validation.change(nextValue);
    const pending = actions.consume(nextValue);
    // DOM rendering and native value synchronization precede completion/submission.
    // Queue outside the effect so a Form submit can perform synchronous validation.
    if (pending) queueMicrotask(() => untrack(() => {
      if (disposed || !actions.isCurrent(pending.token)) return;
      if (pending.focus !== undefined) focusInput(pending.focus);
      if (pending.complete) completeValue(nextValue, pending.complete);
    }));
  });

  createEffect(disabled, (isDisabled) => {
    if (isDisabled) { actions.begin(); setFocused(false); }
  });
  createEffect(() => props.readOnly, (readOnly) => { if (readOnly) actions.begin(); });
  onCleanup(() => {
    disposed = true;
    actions.begin();
    field?.validation.registerInput(validationSource, null);
  });

  function setValue(nextValue: string, details: OTPFieldRootChangeEventDetails) {
    const token = actions.begin();
    const normalized = normalizeOTPValue(nextValue, props.length, validationType(), props.normalizeValue);
    const current = value();
    const complete = (details.reason === 'input-change' || details.reason === 'input-paste') &&
      normalized.length === props.length && (current.length !== props.length || details.reason === 'input-paste')
      ? (details.reason === 'input-paste'
        ? createGenericEventDetails('input-paste', details.event)
        : createGenericEventDetails('input-change', details.event)) : undefined;
    if (normalized === current) {
      if (complete) { synchronizeNativeValue(normalized); completeValue(normalized, complete); }
      return null;
    }
    const result = controlled.request(normalized, details);
    if (!result.accepted || !actions.isCurrent(token)) return null;
    actions.queue(token, result.nextValue, complete);
    return { value: result.nextValue, token };
  }

  const state: OTPFieldRootState = {
    get complete() { return value().length === props.length; },
    get disabled() { return disabled(); },
    get filled() { return value() !== ''; },
    get focused() { return focused(); },
    get length() { return props.length; },
    get readOnly() { return props.readOnly ?? false; },
    get required() { return props.required ?? false; },
    get value() { return value(); },
    get touched() { return field?.state.touched ?? false; },
    get dirty() { return field?.state.dirty ?? false; },
    get valid() { return field?.state.valid ?? null; },
  };
  const context: OTPFieldRootContext = {
    get activeIndex() { return focused() ? Math.min(focusedIndex(), Math.max(props.length - 1, 0)) : Math.min(value().length, props.length - 1); },
    get autoComplete() { return props.autoComplete ?? 'one-time-code'; },
    get disabled() { return disabled(); },
    get form() { return props.form; },
    get inputMode() { return inputMode(); },
    get inputAriaLabelledBy() { return props['aria-labelledby'] == null ? ariaLabelledBy() : undefined; },
    get invalid() { return field?.invalid; },
    get length() { return props.length; },
    get mask() { return props.mask ?? false; },
    get pattern() { return validationConfig()?.slotPattern; },
    get readOnly() { return props.readOnly ?? false; },
    get required() { return props.required ?? false; },
    get normalizeValue() { return props.normalizeValue; },
    get validationType() { return validationType(); },
    get value() { return value(); },
    state, focusInput, setValue, setFocused,
    beginEdit() { actions.begin(); },
    queueFocusInput(index, accepted) { actions.focus(accepted.token, accepted.value, index); },
    getInputId(index) { const firstId = id(); return firstId == null ? undefined : index === 0 ? firstId : `${firstId}-${index + 1}`; },
    reportValueInvalid(raw, details) { props.onValueInvalid?.(raw, details); },
    handleInputFocus(index, input) {
      if (index > value().length) { focusInput(Math.min(value().length, props.length - 1)); return; }
      setFocusedIndex(index);
      input.select();
    },
    handleInputBlur(event) {
      if (contains(root, event.relatedTarget as Element | null)) return;
      field?.setTouched(true);
      setFocused(false);
      field?.setFocused(false);
      if (field?.validationMode === 'onBlur') void field.validation.commit(value());
    },
  };
  const elementProps = omit(props,
    'aria-describedby', 'aria-labelledby', 'id', 'autoComplete', 'defaultValue', 'value',
    'onValueChange', 'onValueComplete', 'form', 'length', 'autoSubmit', 'mask', 'inputMode',
    'validationType', 'normalizeValue', 'disabled', 'readOnly', 'required', 'name',
    'onValueInvalid', 'render', 'class', 'style', 'ref',
  );
  const rootRef = (node: HTMLDivElement | null) => { root = node; };
  function RootElement() {
    return createRenderElement('div', props, {
      get ref() { return [rootRef, props.ref]; }, state,
      props: [{ role: 'group', get 'aria-describedby'() { return ariaDescribedBy(); }, get 'aria-labelledby'() { return ariaLabelledBy(); } }, elementProps],
      stateAttributesMapping: rootStateAttributesMapping,
    });
  }
  const validationProps = createMemo(() => field?.validation.getValidationProps(disabled(), {
    onFocus() { focusInput(0); },
    onInput: handleAutofill,
    // Password managers may emit change without a per-keystroke input event.
    onChange: handleAutofill,
  }) ?? { onFocus() { focusInput(0); }, onInput: handleAutofill, onChange: handleAutofill });
  function handleAutofill(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    if (isDefaultPrevented(event) || disabled() || props.readOnly) { input.value = value(); return; }
    context.beginEdit();
    const raw = input.value;
    const [normalized, rejected] = normalizeOTPValueWithDetails(raw, props.length, validationType(), props.normalizeValue);
    if (rejected) context.reportValueInvalid(raw, createGenericEventDetails('input-change', event));
    const accepted = setValue(normalized, createChangeEventDetails('input-change', event));
    input.value = value();
    if (accepted && accepted.value !== '') context.queueFocusInput(accepted.value.length - 1, accepted);
  }
  function ValidationInput() {
    return createRenderElement<{}, HTMLInputElement>('input', {}, {
      ref: (node: HTMLInputElement | null) => {
        hidden = node;
        field?.validation.registerInput(validationSource, node);
      },
      props: [() => validationProps(), {
        type: 'text',
        get id() { return id() && name() == null ? `${id()}-hidden-input` : undefined; },
        get form() { return props.form; },
        get name() { return name(); },
        get value() { return value(); },
        get autocomplete() { return context.autoComplete; },
        get inputmode() { return inputMode(); },
        get minlength() { return props.length; },
        get maxlength() { return props.length; },
        get pattern() { return validationConfig()?.getRootPattern(props.length); },
        get disabled() { return disabled(); },
        get readonly() { return props.readOnly ?? false; },
        get required() { return props.required ?? false; },
        'aria-hidden': 'true', tabindex: -1,
        get style() { return name() ? visuallyHiddenInput : visuallyHidden; },
      }],
    });
  }
  if (process.env.NODE_ENV !== 'production') {
    let warningGeneration = 0;
    createEffect(() => [props.length, inputCount()] as const, ([length, count]) => {
      const generation = ++warningGeneration;
      if (!Number.isInteger(length) || length <= 0) {
        warn(`<OTPField.Root> \`length\` must be a positive integer. Received \`length={${String(length)}}\`.`);
      } else if (count !== 0 && count !== length) {
        // Length and the shared DOM-ordered map can publish in separate RC13
        // turns. Diagnose the settled registry, not a removed slot's old count.
        queueMicrotask(() => {
          if (disposed || generation !== warningGeneration) return;
          const renderedCount = inputRefs.current.filter((input) => input?.isConnected).length;
          if (renderedCount !== 0 && renderedCount !== length) {
            warn('<OTPField.Root> `length` must match the number of rendered <OTPField.Input /> parts. ' +
              `Received \`length={${length}}\` but rendered ${renderedCount} input${renderedCount === 1 ? '' : 's'}.`);
          }
        });
      }
    });
  }
  return (
    <CompositeList elementsRef={inputRefs} onMapChange={(map: ReadonlyMap<Node, { index: number }>) => {
      setInputCount(map.size);
      setFirstInput(inputRefs.current[0] ?? null);
      // Removing an earlier sibling changes the retained slot's index without
      // a new focus event. Follow its raw identity in the shared ordered map;
      // do not refocus/reselect it or move focus to a different slot.
      const active = root && activeElement(root.ownerDocument);
      const focusedSlot = active ? map.get(active) : undefined;
      if (focusedSlot) setFocusedIndex(focusedSlot.index);
    }}>
      <OTPFieldRootContext value={context}>
        <RootElement />
        {validLength() && <ValidationInput />}
      </OTPFieldRootContext>
    </CompositeList>
  );
}

export interface OTPFieldRootProps extends Omit<BaseUIComponentProps<'div', OTPFieldRootState, ComponentProps<'div'>>, 'onChange'> {
  /** First slot ID; subsequent IDs append `-2`, `-3`, etc. */
  id?: string;
  autoComplete?: string;
  form?: string;
  /** Required before slots mount, including during SSR. */
  length: number;
  autoSubmit?: boolean;
  mask?: boolean;
  inputMode?: JSX.InputHTMLAttributes<HTMLInputElement>['inputmode'];
  validationType?: OTPValidationType;
  /** Applied after built-in filtering, then revalidated and clamped. Must be idempotent. */
  normalizeValue?: (value: string) => string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  name?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string, details: OTPFieldRootChangeEventDetails) => void;
  onValueInvalid?: (value: string, details: OTPFieldRootInvalidEventDetails) => void;
  onValueComplete?: (value: string, details: OTPFieldRootCompleteEventDetails) => void;
}
export interface OTPFieldRootState extends FieldRootState {
  complete: boolean;
  disabled: boolean;
  length: number;
  readOnly: boolean;
  required: boolean;
  value: string;
}
export type OTPFieldRootChangeEventReason = 'input-change' | 'input-clear' | 'input-paste' | 'keyboard';
export type OTPFieldRootChangeEventDetails = BaseUIChangeEventDetails<OTPFieldRootChangeEventReason>;
export type OTPFieldRootInvalidEventReason = 'input-change' | 'input-paste';
export type OTPFieldRootInvalidEventDetails = BaseUIGenericEventDetails<OTPFieldRootInvalidEventReason>;
export type OTPFieldRootCompleteEventReason = 'input-change' | 'input-paste';
export type OTPFieldRootCompleteEventDetails = BaseUIGenericEventDetails<OTPFieldRootCompleteEventReason>;
export namespace OTPFieldRoot {
  export type Props = OTPFieldRootProps;
  export type State = OTPFieldRootState;
  export type ValidationType = OTPValidationType;
  export type ChangeEventReason = OTPFieldRootChangeEventReason;
  export type ChangeEventDetails = OTPFieldRootChangeEventDetails;
  export type InvalidEventReason = OTPFieldRootInvalidEventReason;
  export type InvalidEventDetails = OTPFieldRootInvalidEventDetails;
  export type CompleteEventReason = OTPFieldRootCompleteEventReason;
  export type CompleteEventDetails = OTPFieldRootCompleteEventDetails;
}
