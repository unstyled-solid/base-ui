import { createEffect, createSignal, onCleanup, untrack, type Setter } from 'solid-js';
import { useFormContext } from '../form-context';
import { useLabelableContext } from '../labelable-provider';
import type { FieldRootContextValue, FieldRootState } from '../field-root-context';
import type { FieldControlRegistration, FieldValidator, FieldValidityData, FormFieldRegistration, FormValidationMode } from '../contracts/field';
import { DEFAULT_VALIDITY_STATE } from '../field-constants/constants';
import { getCombinedFieldValidityData } from './getCombinedFieldValidityData';
import { createFieldValidation } from './createFieldValidation';
export interface FieldOptions {
  name?: string | undefined; disabled?: boolean | undefined; invalid?: boolean | undefined;
  dirty?: boolean | undefined; touched?: boolean | undefined;
  validationMode?: FormValidationMode | undefined; validationDebounceTime?: number | undefined;
  validate?: FieldValidator | undefined; value?: unknown; defaultValue?: unknown;
}
export function createField(options: FieldOptions): FieldRootContextValue {
  const form = useFormContext();
  const label = useLabelableContext();
  const [touched, setTouchedState] = createSignal(false);
  const [dirty, setDirtyState] = createSignal(false);
  const [filled, setFilled] = createSignal(false);
  const [focused, setFocused] = createSignal(false);
  const [registeredName, setRegisteredName] = createSignal<string | undefined>(undefined);
  let markedDirty = untrack(() => options.dirty ?? false);
  let baseline: unknown = null;
  let captured = false;
  let current: FieldControlRegistration | undefined;
  let currentSource: symbol | undefined;
  let registered: { id: string; data: FormFieldRegistration } | undefined;
  let liveValidity: FieldValidityData = { state: { ...DEFAULT_VALIDITY_STATE }, error: '', errors: [], value: null, initialValue: null };
  const [validity, setValidity] = createSignal(liveValidity);
  const name = () => options.name ?? registeredName();
  const invalid = () => {
    const key = name();
    const errors = key && form && Object.hasOwn(form.errors, key) ? form.errors[key] : undefined;
    return options.invalid === true || !!(Array.isArray(errors) ? errors.length : errors);
  };
  function remove() {
    if (registered && form?.fields.get(registered.id) === registered.data) form.fields.delete(registered.id);
    registered = undefined;
  }
  function getValue() { return current?.getValue ? current.getValue() : current?.value; }
  function registrationValue() { return current?.value === undefined ? getValue() : current.value; }
  function validate() { markedDirty = true; void validation.commit(current ? registrationValue() : liveValidity.value); }
  function refresh(data = liveValidity, invalidValue = untrack(invalid), nameValue = untrack(name)) {
    if (!current?.id || !form) return;
    const next: FormFieldRegistration = {
      name: nameValue, validate, validityData: getCombinedFieldValidityData(data, invalidValue),
      controlRef: current.controlRef, getValue,
    };
    form.fields.set(current.id, next);
    registered = { id: current.id, data: next };
  }
  const setValidityData = ((value: FieldValidityData | ((previous: FieldValidityData) => FieldValidityData)) => {
    liveValidity = typeof value === 'function' ? value(liveValidity) : value;
    refresh(liveValidity);
    setValidity(liveValidity);
    return liveValidity;
  }) as Setter<FieldValidityData>;
  const setDirty = ((next: boolean | ((previous: boolean) => boolean)) => untrack(() => {
    if (options.dirty !== undefined) return options.dirty;
    return setDirtyState((previous) => { const value = typeof next === 'function' ? next(previous) : next; if (value) markedDirty = true; return value; });
  })) as Setter<boolean>;
  const setTouched = ((next: boolean | ((previous: boolean) => boolean)) => untrack(() => options.touched !== undefined ? options.touched : setTouchedState(next))) as Setter<boolean>;
  const state: FieldRootState = {
    get disabled() { return options.disabled ?? false; },
    get dirty() { return options.dirty ?? dirty(); },
    get touched() { return options.touched ?? touched(); },
    get valid() { return !invalid() && (options.disabled ? null : validity().state.valid); },
    get filled() { return filled(); }, get focused() { return focused(); },
  };
  const field: FieldRootContextValue = {
    get name() { return name(); }, get invalid() { return invalid(); },
    get disabled() { return options.disabled; },
    get validityData() { return validity(); }, setValidityData,
    setTouched, setDirty, setFilled, setFocused, focusOwnerRef: { current: undefined },
     get validationMode() { return options.validationMode ?? form?.validationMode ?? 'onSubmit'; },
    shouldValidateOnChange() { return field.validationMode === 'onChange' || (field.validationMode === 'onSubmit' && (form?.submitCount ?? 0) > 0); },
    state,
    get validation() { return validation; }, validate,
    registerFieldControl(source, next) {
      untrack(() => {
        if (!next) {
          if (source !== currentSource) return;
          validation.change(undefined, true); remove(); current = undefined; currentSource = undefined; setRegisteredName(undefined);
          return;
        }
        if (currentSource && source !== currentSource) validation.change(undefined, true);
        if (registered && next.id !== registered.id) remove();
        currentSource = source; current = next;
        // Source useFieldControlRegistration only publishes a control-name
        // fallback when Root has no name. Remembering an inherited Root name
        // here makes a name-gated CheckboxGroup keep its own stale registration
        // alive after that Root name is removed.
        setRegisteredName(options.name ? undefined : next.name);
        if (!captured) { captured = true; baseline = registrationValue(); liveValidity = { ...liveValidity, initialValue: baseline }; setValidity(liveValidity); }
        refresh(liveValidity, invalid(), options.name ?? next.name);
      });
    },
  };
  const validation = createFieldValidation({ field, form, label,
    validate: () => options.validate, debounce: () => options.validationDebounceTime ?? 0,
    markedDirty: () => markedDirty, baseline: () => baseline, previousValidity: () => liveValidity,
    publish(data, invalidOverride) {
      liveValidity = data;
      refresh(data, invalidOverride ?? untrack(invalid));
      setValidity(data);
    },
  });
  createEffect(() => options.dirty, (value) => { if (value !== undefined) markedDirty = value; });
  createEffect(() => ({ rootName: options.name, name: name(), invalid: invalid(), validity: validity() }), (next) => {
    // The source layout registration also refreshes fallback ownership when
    // Root's own name changes, even if the control's intrinsic name did not.
    setRegisteredName(next.rootName ? undefined : current?.name);
    refresh(next.validity, next.invalid, next.rootName ?? current?.name);
  });
  onCleanup(remove);
  return field;
}
