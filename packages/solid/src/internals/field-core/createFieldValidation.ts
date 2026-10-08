// Canonical Base UI useFieldValidation, MIT; raw input identity and explicit commits.
import { onCleanup, untrack } from 'solid-js';
import { createTimeout } from '../../utils/createTimeout';
import { mergeProps } from '../../merge-props';
import { DEFAULT_VALIDITY_STATE } from '../field-constants/constants';
import type { FieldRootContextValue, FieldValidation, RegisteredInput } from '../field-root-context/FieldRootContext';
import type { FieldValidityData, FieldValidator, FormContext } from '../contracts/field';
import type { LabelableContextValue } from '../labelable-provider/LabelableContext';
type NativeValidationElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
function isNativeControl(element: HTMLElement | null): element is NativeValidationElement {
  return !!element && ['INPUT', 'TEXTAREA', 'SELECT'].includes(element.tagName);
}
export function isEligibleInput(input: HTMLInputElement, form: HTMLFormElement | null): boolean {
  if (input.matches(':disabled')) return false;
  return !form || input.form === form || (input.form === null && !input.hasAttribute('form'));
}
export interface FieldValidationParameters {
  field: FieldRootContextValue; form: FormContext | null; label: LabelableContextValue | null;
  validate: () => FieldValidator | undefined; debounce: () => number;
  markedDirty: () => boolean; publish(data: FieldValidityData, invalidOverride?: boolean): void;
  baseline: () => unknown;
  previousValidity: () => FieldValidityData;
}
export function createFieldValidation(params: FieldValidationParameters): FieldValidation {
  const timeout = createTimeout();
  const inputs = new Map<symbol, HTMLElement>();
  const metadata = new Map<HTMLInputElement, RegisteredInput>();
  const tokens = new Map<symbol, symbol>();
  let generation = 0;
  let disposed = false;
  let custom: { element: NativeValidationElement; message: string; displaced: string } | undefined;
  function clearCustom() {
    const previous = custom;
    custom = undefined;
    if (previous && (!previous.element.willValidate || previous.element.validationMessage === previous.message)) previous.element.setCustomValidity(previous.displaced);
  }
  function representative(): NativeValidationElement | null {
    if (!metadata.size) {
      // Direct Control/Switch inputs use the last-owned input ref, not the
      // group's successful-control eligibility rules (including foreign forms).
      const direct = [...inputs.values()].at(-1) ?? null;
      return isNativeControl(direct) ? direct : null;
    }
    let fallback: HTMLInputElement | null = null;
    for (const element of metadata.keys()) {
      if (!isEligibleInput(element, params.form?.elementRef() ?? null)) continue;
      if (!element.validity.valid) return element;
      fallback ??= element;
    }
    return fallback;
  }
  function nativeState(element: NativeValidationElement | null): FieldValidityData['state'] {
    if (!element?.willValidate) return { ...DEFAULT_VALIDITY_STATE, valid: true };
    const result = { ...DEFAULT_VALIDITY_STATE };
    for (const key of Object.keys(result) as (keyof ValidityState)[]) result[key] = element.validity[key];
    const onlyMissing = result.valueMissing && Object.keys(result).every((key) => key === 'valid' || key === 'valueMissing' || !result[key as keyof ValidityState]);
    if (onlyMissing && !params.markedDirty()) { result.valid = true; result.valueMissing = false; }
    return result;
  }
  function nativeErrors(element: NativeValidationElement | null): string[] { return element?.validationMessage ? [element.validationMessage] : []; }
  async function commitImpl(value: unknown, revalidate = false): Promise<void> {
    const request = ++generation;
    const field = params.field;
    const previousValidity = params.previousValidity();
    const baseline = params.baseline();
    let element = representative();
    const publish = (state: FieldValidityData['state'], errors: string[], invalidOverride?: boolean) => {
      const messages = state.valid === false ? errors : [];
      params.publish({ value, state, error: messages[0] ?? '', errors: messages, initialValue: baseline }, invalidOverride);
    };
    if (revalidate) {
      const previousValid = !field.invalid && (field.disabled ? null : previousValidity.state.valid);
      if (previousValid !== false || !element) return;
      if (!element.validity.valueMissing) {
        clearCustom();
        element = representative();
        const foreign = element?.validity.customError ? nativeErrors(element) : [];
        publish({ ...DEFAULT_VALIDITY_STATE, valid: !foreign.length, customError: !!foreign.length }, foreign, false);
        return;
      }
      for (const key of Object.keys(DEFAULT_VALIDITY_STATE) as (keyof ValidityState)[]) {
        if (key !== 'valid' && key !== 'valueMissing' && key !== 'customError' && element.validity[key]) return;
      }
    }
    timeout.clear(); clearCustom();
    element = representative();
    let state = nativeState(element);
    let errors = nativeErrors(element);
    if (!errors.length || field.shouldValidateOnChange()) {
      const values: Record<string, unknown> = {};
      for (const entry of params.form?.fields.values() ?? []) if (entry.name) values[entry.name] = entry.getValue();
      const result = params.validate()?.(value, values);
      let verdict: Awaited<ReturnType<FieldValidator>>;
      if (result != null && typeof result === 'object' && 'then' in result) {
        if (state.valid === false) publish(state, errors);
        else if (field.validationMode === 'onSubmit' || !previousValidity.state.customError) publish({ ...state, valid: null }, errors);
        verdict = await result;
        if (disposed || request !== generation) return;
        element = untrack(representative);
        state = untrack(() => nativeState(element));
      } else verdict = result;
      errors = verdict ? ([] as string[]).concat(verdict).filter(Boolean) : [];
      if (errors.length) {
        state.valid = false; state.customError = true;
        if (element?.willValidate) {
          const displaced = element.validity.customError ? element.validationMessage : '';
          const message = errors.join('\n').replace(/\r\n?/g, '\n');
          element.setCustomValidity(message);
          custom = { element, message, displaced };
        }
      } else errors = nativeErrors(element);
    }
    if (!disposed && request === generation) publish(state, errors);
  }
  onCleanup(() => { disposed = true; generation++; timeout.clear(); clearCustom(); inputs.clear(); metadata.clear(); tokens.clear(); });
  return {
    registeredInputs: inputs, registeredInputMetadata: metadata,
    inputRef: () => [...inputs.values()].at(-1) ?? null,
    registerInput(source, element, registration) {
      const previous = inputs.get(source);
      if (previous && previous !== element) metadata.delete(previous as HTMLInputElement);
      const token = Symbol(); tokens.set(source, token);
      if (element) {
        inputs.set(source, element);
        if (element.tagName === 'INPUT' && registration) metadata.set(element as HTMLInputElement, registration);
      } else { inputs.delete(source); if (previous) metadata.delete(previous as HTMLInputElement); }
      return () => {
        if (tokens.get(source) !== token) return;
        tokens.delete(source); inputs.delete(source);
        if (element && ![...inputs.values()].includes(element)) metadata.delete(element as HTMLInputElement);
      };
    },
    getInputControl() { const element = untrack(representative); return element?.tagName === 'INPUT' ? metadata.get(element as HTMLInputElement)?.controlRef() ?? null : null; },
    commit(value) { return untrack(() => commitImpl(value)); },
    change(value, cancelPending = false) {
      timeout.clear(); generation++;
      if (cancelPending) return;
      untrack(() => {
        const validateOnChange = params.field.shouldValidateOnChange();
        if (validateOnChange && value !== '' && params.debounce()) timeout.start(params.debounce(), () => { void commitImpl(value); });
        else void commitImpl(value, !validateOnChange);
      });
    },
    getValidationProps<P extends object = import('../types').HTMLProps>(disabled: boolean, external: P = {} as P): P {
      const invalid = () => params.field.state.valid === false && !params.field.state.disabled && !disabled;
      const owned = new Proxy({}, {
        ownKeys: () => invalid() ? ['aria-invalid'] : [],
        has: (_, key) => key === 'aria-invalid' && invalid(),
        getOwnPropertyDescriptor: (_, key) => key === 'aria-invalid' && invalid() ? { enumerable: true, configurable: true, get: () => 'true' } : undefined,
        get: (_, key) => key === 'aria-invalid' && invalid() ? 'true' : undefined,
      });
      return mergeProps<any>(params.label?.getDescriptionProps(external) ?? external, owned) as P;
    },
  };
}
