import { createEffect, createSignal, omit, onCleanup, untrack } from 'solid-js';
import type { ComponentProps, JSX } from '@solidjs/web';
import { FormContext } from '../internals/form-context/FormContext';
import type { FormContext as FormContextValue, FormErrors, FormFieldRegistration } from '../internals/contracts/field';
import type { BaseUIComponentProps } from '../internals/contracts/render';
import type { BaseUIEvent } from '../internals/contracts/events';
import { createGenericEventDetails, type BaseUIGenericEventDetails } from '../internals/createBaseUIEventDetails';
import { createRenderElement } from '../internals/createRenderElement';

/** A native form element with consolidated error handling. */
export function Form<FormValues extends Record<string, any> = Record<string, any>>(
  props: FormProps<FormValues>,
): JSX.Element {
  const fields = new Map<string, FormFieldRegistration>();
  let element: HTMLFormElement | null = null;
  let submitCount = 0;
  let submitted = false;
  let disposed = false;
  const [errors, setErrors] = createSignal<FormErrors | undefined>(untrack(() => props.errors));
  const emptyErrors: FormErrors = {};
  let previousExternal = untrack(() => props.errors);

  createEffect(() => props.errors, (next) => {
    if (next !== previousExternal) {
      previousExternal = next;
      setErrors(next);
    }
  });

  function focusFirstInvalid() {
    let invalid = false;
    let first: HTMLElement | null = null;
    for (const field of fields.values()) {
      if (field.validityData.state.valid !== false) continue;
      invalid = true;
      const control = field.controlRef();
      if (control && (!first || comesBeforeInSameTree(control, first))) first = control;
    }
    first?.focus();
    if (first?.tagName === 'INPUT') (first as HTMLInputElement).select();
    return invalid;
  }

  createEffect(errors, () => {
    if (!submitted) return;
    submitted = false;
    // Let field error projections publish their registry verdict before focusing.
    queueMicrotask(() => { if (!disposed) untrack(focusFirstInvalid); });
  });
  onCleanup(() => { disposed = true; });

  const actions: FormActions = {
    validate(name) {
      if (disposed) return;
      if (name) {
        Array.from(fields.values()).find((field) => field.name === name)?.validate();
      } else {
        fields.forEach((field) => field.validate());
      }
    },
  };
  createEffect(() => props.actionsRef, (ref) => {
    ref?.(actions);
    return () => { ref?.(null); };
  });

  const context: FormContextValue = {
    fields,
    elementRef: () => element,
    get submitCount() { return submitCount; },
    get validationMode() { return props.validationMode ?? 'onSubmit'; },
    get errors() { return errors() ?? emptyErrors; },
    clearErrors(name) {
      if (!name) return;
      setErrors((previous) => {
        if (!previous || !Object.hasOwn(previous, name)) return previous;
        const next = { ...previous };
        delete next[name];
        return next;
      });
    },
  };
  const elementProps = omit(props, 'render', 'class', 'style', 'validationMode', 'errors',
    'onSubmit', 'onFormSubmit', 'actionsRef', 'ref');
  const setElement = (node: HTMLFormElement | null) => { element = node; };

  function submit(event: BaseUIEvent<SubmitEvent & { currentTarget: HTMLFormElement; target: Element }>) {
    submitCount += 1;
    // The foundation publishes synchronous verdicts to this Map before returning.
    fields.forEach((field) => field.validate());
    if (focusFirstInvalid()) {
      event.preventDefault();
      return;
    }
    submitted = true;
    const onSubmit = props.onSubmit;
    if (typeof onSubmit === 'function') onSubmit(event);
    else if (onSubmit) onSubmit[0](onSubmit[1], event);
    if (props.onFormSubmit) {
      event.preventDefault();
      const values: Record<string, unknown> = {};
      fields.forEach((field) => {
        if (field.name) values[field.name] = field.getValue();
      });
      props.onFormSubmit(values as FormValues, createGenericEventDetails('none', event));
    }
  }

  // Evaluate the host beneath the provider so render callbacks and children inherit it.
  return <FormContext value={context}>{createRenderElement('form', props, {
    get ref() { return [props.ref, setElement]; },
    props: [{ noValidate: true, onSubmit: submit }, elementProps],
  })}</FormContext>;
}

export type FormSubmitEventReason = 'none';
export type FormSubmitEventDetails = BaseUIGenericEventDetails<FormSubmitEventReason>;
export type FormValidationMode = 'onSubmit' | 'onBlur' | 'onChange';
export interface FormActions { validate(fieldName?: string): void }
export interface FormState {}
export interface FormProps<FormValues extends Record<string, any> = Record<string, any>>
  extends BaseUIComponentProps<'form', FormState, ComponentProps<'form'> & { noValidate?: boolean }> {
  validationMode?: FormValidationMode;
  noValidate?: boolean;
  errors?: FormErrors;
  onFormSubmit?: (formValues: FormValues, eventDetails: FormSubmitEventDetails) => void;
  /** Solid callback ref; receives null on replacement or disposal. */
  actionsRef?: (actions: FormActions | null) => void;
}
export namespace Form {
  export type Props<FormValues extends Record<string, any> = Record<string, any>> = FormProps<FormValues>;
  export type State = FormState;
  export type Actions = FormActions;
  export type ValidationMode = FormValidationMode;
  export type SubmitEventReason = FormSubmitEventReason;
  export type SubmitEventDetails = FormSubmitEventDetails;
  export type Values<FormValues extends Record<string, any> = Record<string, any>> = FormValues;
}

function comesBeforeInSameTree(element: Node, reference: Node) {
  const position = element.compareDocumentPosition(reference);
  return (position & 1) === 0 && (position & 4) !== 0;
}
