import { createEffect, createMemo, createSignal, onCleanup, onSettled, omit, untrack } from 'solid-js';
import { isServer, type JSX } from '@solidjs/web';
import type { BaseUIComponentProps } from '../../internals/types';
import { useFieldRootContext, type FieldRootState } from '../../internals/field-root-context';
import { createSetFieldFocused } from '../../internals/field-root-context/createSetFieldFocused';
import { createRegisterFieldControl } from '../../internals/field-register-control/createRegisterFieldControl';
import { useFormContext } from '../../internals/form-context/FormContext';
import { useLabelableContext } from '../../internals/labelable-provider';
import { createLabelableId } from '../../internals/labelable-provider/createLabelableId';
import { createRenderElement } from '../../internals/createRenderElement';
import { fieldValidityMapping } from '../../internals/field-constants/constants';
import { createChangeEventDetails, type BaseUIChangeEventDetails } from '../../internals/createBaseUIEventDetails';
import { createTimeout } from '../../utils/createTimeout';
import { fieldState } from '../utils/state';

/** Native input facade. Validation and form registration belong to field-core. */
export function FieldControl<E extends HTMLElement = HTMLInputElement>(props: FieldControlProps<E>) {
  const local = props;
  const elementProps = omit(props, 'render', 'class', 'style', 'ref', 'id', 'name', 'value', 'defaultValue', 'disabled', 'onValueChange', 'autoFocus', 'autofocus');
  const field = useFieldRootContext();
  const form = useFormContext();
  const labelable = useLabelableContext();
  const id = createLabelableId({ id: () => typeof local.id === 'string' ? local.id : undefined });
  const disabled = () => Boolean(field?.disabled || local.disabled);
  const name = () => field?.name ?? (typeof local.name === 'string' ? local.name : undefined);
  const controlled = () => local.value !== undefined;
  const serializedValue = () => local.value == null ? undefined : String(local.value);
  // RC13 has native defaultValue setters. Never project an uncontrolled default
  // through `value`: state-attribute updates would overwrite DOM edits.
  const valueProps = createMemo(() => {
    if (controlled()) {
      const value = serializedValue() ?? '';
      return isServer ? { value } : { value, defaultValue: value };
    }
    return isServer ? { value: local.defaultValue } : { defaultValue: local.defaultValue };
  });
  const [element, setElement] = createSignal<HTMLElement | null>(null);
  let current: HTMLElement | null = null;
  let disposed = false;
  const source = Symbol('Field.Control');
  const timeout = createTimeout();
  const state = fieldState(() => field?.state, disabled);
  const readValue = () => current && 'value' in current ? String(current.value) : undefined;
  const setFocused = createSetFieldFocused(disabled, element);
  createRegisterFieldControl(element, id, serializedValue, readValue, () => !disabled(), () => typeof local.name === 'string' ? local.name : undefined);

  createEffect(element, (node) => {
    // React initializes the value property as well as its reset default. Mark
    // each attached native value dirty once: later defaultValue changes update
    // form.reset(), without changing the current value or the field baseline.
    if (node?.tagName === 'INPUT' || node?.tagName === 'TEXTAREA') {
      const input = node as HTMLInputElement | HTMLTextAreaElement;
      input.value = input.value;
    }
    field?.validation.registerInput(source, node);
  });
  onCleanup(() => {
    disposed = true;
    setFocused(false);
    field?.validation.registerInput(source, null);
    current = null;
  });

  let initialized = false;
  let previous: string | undefined;
  createEffect(() => ({ node: element(), value: serializedValue() }), ({ node, value }) => {
    if (!node) return;
    const actual = value ?? readValue();
    if (actual !== undefined) field?.setFilled(actual !== '');
    if (initialized && value !== previous && value !== undefined) {
      // Native constraint validation reads the DOM, which must reflect the
      // accepted prop before validating (the renderer's projection may run later).
      if ('value' in node && node.value !== value) node.value = value;
      form?.clearErrors(untrack(name));
      field?.setDirty(value !== (untrack(() => field.validityData.initialValue) ?? ''));
      field?.validation.change(value);
    }
    previous = value;
    initialized = true;
  });
  onSettled(() => {
    if (local.autoFocus ?? local.autofocus) current?.focus();
    const root = current?.getRootNode() as Document | ShadowRoot | undefined;
    if (current && root?.activeElement === current) setFocused(true);
  });

  const inputProps = {
    get id() { return id(); },
    get disabled() { return disabled(); },
    get name() { return name(); },
    get 'aria-labelledby'() { return labelable?.labelId; },
    get autofocus() { return local.autoFocus ?? local.autofocus; },
    onInput(event: InputEvent & { currentTarget: HTMLInputElement }) {
      const value = event.currentTarget.value;
      const details = createChangeEventDetails('none', event);
      local.onValueChange?.(value, details);
      if (controlled()) {
        const input = event.currentTarget;
        queueMicrotask(() => {
          if (!disposed && input === current && controlled()) {
            const accepted = serializedValue() ?? '';
            if (input.value !== accepted) input.value = accepted;
          }
        });
        return;
      }
      field?.setDirty(value !== (field.validityData.initialValue ?? ''));
      field?.setFilled(value !== '');
      if (!event.defaultPrevented && !details.isCanceled) {
        form?.clearErrors(name());
        field?.validation.change(value);
      }
    },
    onFocus() { setFocused(true); },
    onBlur(event: FocusEvent & { currentTarget: HTMLInputElement }) {
      field?.setTouched(true);
      setFocused(false);
      if (field?.validationMode !== 'onBlur') return;
      const value = event.currentTarget.value;
      void field.validation.commit(value);
      if (controlled()) queueMicrotask(() => {
        if (disposed) return;
        const accepted = readValue();
        if (accepted !== undefined && accepted !== value && accepted !== (field.validityData.initialValue ?? '')) {
          void field.validation.commit(accepted);
        }
      });
    },
    onKeyDown(event: KeyboardEvent & { currentTarget: HTMLInputElement }) {
      const input = event.currentTarget;
      if (input.tagName !== 'INPUT' || event.key !== 'Enter') return;
      field?.setTouched(true);
      if (input.form && input.form === form?.elementRef() && !event.defaultPrevented) {
        const count = form.submitCount;
        timeout.start(0, () => {
          if (form.submitCount === count) void field?.validation.commit(input.value);
        });
      } else void field?.validation.commit(input.value);
    },
  };
  const attach = (node: E | null) => { current = node; setElement(() => node); };
  return createRenderElement<FieldControlState, E>('input', props, {
    state,
    get ref() { return [local.ref, attach]; },
    get props() { return [inputProps, valueProps(), elementProps, (merged: Record<string, unknown>) => {
        const descriptions = labelable?.getDescriptionProps(merged) ?? merged;
        return field ? field.validation.getValidationProps(disabled(), descriptions) : descriptions;
      }]; },
    stateAttributesMapping: fieldValidityMapping,
  });
}

export interface FieldControlState extends FieldRootState {}
export interface FieldControlProps<E extends HTMLElement = HTMLInputElement> extends Omit<BaseUIComponentProps<'input', FieldControlState, JSX.InputHTMLAttributes<E>>, 'ref' | 'value'> {
  ref?: JSX.Ref<E>;
  autoFocus?: boolean;
  value?: JSX.InputHTMLAttributes<E>['value'] | number | readonly string[];
  defaultValue?: string | number | readonly string[];
  onValueChange?: (value: string, details: FieldControlChangeEventDetails) => void;
}
export type FieldControlChangeEventReason = 'none';
export type FieldControlChangeEventDetails = BaseUIChangeEventDetails<FieldControlChangeEventReason>;
export namespace FieldControl {
  export type Props = FieldControlProps;
  export type State = FieldControlState;
  export type ChangeEventReason = FieldControlChangeEventReason;
  export type ChangeEventDetails = FieldControlChangeEventDetails;
}
