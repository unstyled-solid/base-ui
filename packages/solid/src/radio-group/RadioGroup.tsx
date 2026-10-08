import { createEffect, createSignal, omit, onCleanup, untrack } from 'solid-js';
import type { JSX } from '@solidjs/web';
import type { BaseUIComponentProps, HTMLProps } from '../internals/types';
import { createControlled } from '../utils/createControlled';
import { createMergedRefsN } from '../utils/createMergedRefs';
import { contains } from '../utils/shadowDom';
import { dispatchClickWithModifiers } from '../utils/dispatchClickWithModifiers';
import { createBaseUiId } from '../internals/createBaseUiId';
import { CompositeRoot } from '../internals/composite';
import { useFieldRootContext, type FieldRootState } from '../internals/field-root-context';
import { useFormContext } from '../internals/form-context';
import { useLabelableContext } from '../internals/labelable-provider';
import { useFieldsetRootContext } from '../fieldset/root/FieldsetRootContext';
import { isEligibleInput } from '../internals/field-core';
import { fieldValidityMapping } from '../internals/field-constants/constants';
import type { BaseUIChangeEventDetails } from '../internals/createBaseUIEventDetails';
import { RadioGroupContext, type RadioGroupContextValue, type RadioInputRegistration } from './RadioGroupContext';

/** Provides shared, identity-based selection to radio buttons. */
export function RadioGroup<Value = any>(props: RadioGroupProps<Value>) {
  const field = useFieldRootContext();
  const form = useFormContext();
  const labelable = useLabelableContext();
  const fieldset = useFieldsetRootContext(true);
  const id = createBaseUiId(() => typeof props.id === 'string' ? props.id : undefined);
  const initialValue = untrack(() => props.defaultValue);
  const selection = createControlled<Value | undefined, RadioGroupChangeEventDetails>({
    value: () => props.value,
    defaultValue: initialValue,
    onChange: () => (value, details) => props.onValueChange?.(value as Value, details),
    name: 'RadioGroup', state: 'value',
  });
  const disabled = () => Boolean(field?.disabled || fieldset?.disabled || props.disabled);
  const name = () => field?.name ?? props.name;
  const inputs = new Map<symbol, RadioInputRegistration>();
  const [revision, setRevision] = createSignal(0);
  const inputRef = createMergedRefsN<HTMLInputElement>(() => [props.inputRef]);
  const source = Symbol('RadioGroup');
  let disposed = false;
  let transaction: { value: Value | undefined } | undefined;
  let detachedRepresentative: {
    value: Value | undefined;
    remaining: { item: RadioInputRegistration; disabled: boolean; value: unknown }[];
  } | undefined;
  onCleanup(() => { disposed = true; });
  const syncInputs = (value: unknown) => {
    // Native activation changes checked before dispatch. Reconcile every sibling using
    // the explicit transaction candidate, never a just-staged Solid getter.
    for (const item of inputs.values()) item.input.checked = item.value === value;
  };
  const context: RadioGroupContextValue = {
    get checkedValue() { return selection.value(); },
    get disabled() { return disabled(); },
    get readOnly() { return props.readOnly ?? false; },
    get required() { return props.required ?? false; },
    get name() { return name(); },
    get form() { return props.form; },
    isSelected(value) { return value === (transaction ? transaction.value : selection.value()); },
    syncInputs,
    setCheckedValue(value, details) {
      const current = transaction ? transaction.value : selection.value();
      if (value === current) { syncInputs(current); return true; }
      const result = selection.request(value as Value, details);
      const next = result.accepted && !result.controlled ? result.nextValue : current;
      if (result.accepted && !result.controlled) {
        const accepted = { value: result.nextValue };
        transaction = accepted;
        queueMicrotask(() => { if (transaction === accepted) transaction = undefined; });
      }
      syncInputs(next);
      return result.accepted;
    },
    registerInput(token, registration) {
      detachedRepresentative = undefined;
      inputs.set(token, registration);
      setRevision((value) => value + 1);
      return () => {
        if (inputs.get(token) !== registration) return;
        inputs.delete(token);
        if (inputRef.current === registration.input) {
          inputRef(null);
          detachedRepresentative = {
            value: selection.value(),
            remaining: [...inputs.values()].map((item) => ({ item, disabled: item.disabled, value: item.value })),
          };
        }
        setRevision((value) => value + 1);
      };
    },
  };
  createEffect(() => {
    revision();
    const value = selection.value();
    const entries = [...inputs.values()].filter((item) => !item.disabled);
    // Source detaches on removal instead of silently forwarding a different
    // mounted radio. A later selection/eligibility/registration change rebinds.
    if (detachedRepresentative && detachedRepresentative.value === value &&
      detachedRepresentative.remaining.length === inputs.size &&
      detachedRepresentative.remaining.every((entry) =>
        [...inputs.values()].includes(entry.item) && entry.disabled === entry.item.disabled && entry.value === entry.item.value)) return null;
    return entries.find((item) => item.value === value)?.input ?? entries[0]?.input ?? null;
  }, (input) => { inputRef(input); });

  const getFormValue = () => {
    const ownerForm = form?.elementRef();
    if (!ownerForm) return selection.value() ?? null;
    // Never store a representative in validation.inputRef. Empty registries must
    // remain empty so inputless custom validation can still run.
    for (const item of inputs.values()) {
      if (field && ![...field.validation.registeredInputs.values()].includes(item.input)) continue;
      if (item.input.checked && isEligibleInput(item.input, ownerForm)) return selection.value() ?? null;
    }
    return null;
  };
  createEffect(() => ({
    id: id(), value: selection.value() ?? null, name: props.name, enabled: !disabled(),
  }), (next) => {
    field?.registerFieldControl(source, next.enabled ? {
      id: next.id, value: next.value, name: next.name,
      controlRef: () => field.validation.getInputControl(), getValue: getFormValue,
    } : undefined);
  });
  onCleanup(() => field?.registerFieldControl(source, undefined));

  let previousValue = untrack(selection.value);
  createEffect(() => ({ value: selection.value(), name: name(), initialValue: field?.validityData.initialValue }), ({ value, name: fieldName, initialValue: fieldInitialValue }) => {
    if (value === previousValue) return;
    previousValue = value;
    form?.clearErrors(fieldName);
    field?.setDirty(value !== fieldInitialValue);
    field?.setFilled(value != null);
    field?.validation.change(value);
  });
  createEffect(() => {
    revision();
    return { form: props.form, inputs: [...inputs.values()].map((item) => item.input) };
  }, (next) => {
    // Read native association after DOM bindings commit, not in compute while
    // a live `form` update still exposes the previous input.form.
    const forms = [...new Set(next.inputs.map((input) => input.form).filter((form) => form !== null))];
    const reset = (event: Event) => {
      // The reset default action follows dispatch. Reconcile after it, respecting
      // cancellation and the current controlled value.
      queueMicrotask(() => untrack(() => {
        if (disposed || event.defaultPrevented) return;
        transaction = undefined;
        selection.reset(initialValue);
        syncInputs(selection.controlled ? selection.value() : initialValue);
      }));
    };
    forms.forEach((element) => element.addEventListener('reset', reset));
    return () => forms.forEach((element) => element.removeEventListener('reset', reset));
  });

  const state: RadioGroupState = {
    get disabled() { return disabled(); },
    get readOnly() { return props.readOnly ?? false; },
    get required() { return props.required ?? false; },
    get touched() { return field?.state.touched ?? false; },
    get dirty() { return field?.state.dirty ?? false; },
    get filled() { return field?.state.filled ?? false; },
    get focused() { return field?.state.focused ?? false; },
    get valid() { return field?.state.valid ?? null; },
  };
  const defaults: HTMLProps = {
    get id() { return props.id; },
    role: 'radiogroup',
    get 'aria-required'() { return props.required ? 'true' : undefined; },
    get 'aria-disabled'() { return disabled() ? 'true' : undefined; },
    get 'aria-readonly'() { return props.readOnly ? 'true' : undefined; },
    get 'aria-labelledby'() { return labelable?.labelId ?? fieldset?.legendId; },
    onFocusOut(event) {
      if (contains(event.currentTarget, event.relatedTarget as Element | null)) return;
      field?.setTouched(true);
      field?.setFocused(false);
      if (field?.validationMode === 'onBlur') void field.validation.commit(selection.value());
    },
  };
  const elementProps = omit(props, 'value', 'defaultValue', 'onValueChange', 'disabled', 'readOnly', 'required', 'name', 'form', 'inputRef', 'class', 'style', 'render', 'ref', 'children');
  return (
    <RadioGroupContext value={context}>
      <CompositeRoot
        render={props.render} class={props.class} style={props.style}
        state={state} refs={[props.ref]} stateAttributesMapping={fieldValidityMapping}
        props={[defaults, elementProps, (external: HTMLProps) => field?.validation.getValidationProps(disabled(), external) ?? labelable?.getDescriptionProps(external) ?? external]}
        enableHomeAndEndKeys={false} modifierKeys={['Shift']}
        onNavigate={(target: HTMLElement, event: KeyboardEvent) => {
          if (disabled() || props.readOnly) return;
          for (const item of inputs.values()) {
            if (item.control === target && !item.disabled) {
              dispatchClickWithModifiers(item.input, event);
              break;
            }
          }
        }}
      >
        {props.children}
      </CompositeRoot>
    </RadioGroupContext>
  );
}

export interface RadioGroupState extends FieldRootState { readOnly: boolean; required: boolean }
export interface RadioGroupProps<Value = any> extends Omit<BaseUIComponentProps<'div', RadioGroupState>, 'value'> {
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  name?: string;
  form?: string;
  value?: Value;
  defaultValue?: Value;
  onValueChange?: (value: Value, details: RadioGroupChangeEventDetails) => void;
  inputRef?: JSX.Ref<HTMLInputElement>;
}
export type RadioGroupChangeEventReason = 'none';
export type RadioGroupChangeEventDetails = BaseUIChangeEventDetails<RadioGroupChangeEventReason>;
export namespace RadioGroup {
  export type State = RadioGroupState;
  export type Props<Value = any> = RadioGroupProps<Value>;
  export type ChangeEventReason = RadioGroupChangeEventReason;
  export type ChangeEventDetails = RadioGroupChangeEventDetails;
}
