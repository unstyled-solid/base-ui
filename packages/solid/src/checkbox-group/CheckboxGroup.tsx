// Adapted from Base UI (MIT), 19511bb171f3b360b006c94cf6d07e53cb446505.
import { createEffect, onCleanup, onSettled, omit, untrack } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { createControlled } from '../utils/createControlled';
import { createBaseUiId } from '../internals/createBaseUiId';
import { createValueChanged } from '../internals/createValueChanged';
import { createRenderElement } from '../internals/createRenderElement';
import { useFieldRootContext, type FieldRootState } from '../internals/field-root-context';
import { useFormContext } from '../internals/form-context';
import { useLabelableContext } from '../internals/labelable-provider';
import { createLabelableId } from '../internals/labelable-provider/createLabelableId';
import { isEligibleInput } from '../internals/field-core';
import { fieldValidityMapping } from '../internals/field-constants/constants';
import type { BaseUIComponentProps } from '../internals/types';
import type { BaseUIChangeEventDetails } from '../internals/createBaseUIEventDetails';
import { CheckboxGroupContext } from './CheckboxGroupContext';
import { createCheckboxGroupParent } from './useCheckboxGroupParent';

export interface CheckboxGroupState extends FieldRootState { disabled: boolean }
export interface CheckboxGroupProps extends BaseUIComponentProps<'div', CheckboxGroupState> {
  value?: readonly string[] | undefined;
  defaultValue?: readonly string[] | undefined;
  onValueChange?: ((value: string[], details: CheckboxGroupChangeEventDetails) => void) | undefined;
  allValues?: readonly string[] | undefined;
  disabled?: boolean | undefined;
}
export type CheckboxGroupChangeEventReason = 'none';
export type CheckboxGroupChangeEventDetails = BaseUIChangeEventDetails<CheckboxGroupChangeEventReason>;

/** Shared logical selection. Successful form values are projected from registered native inputs. */
export function CheckboxGroup(props: CheckboxGroupProps): JSX.Element {
  const elementProps = omit(props, 'allValues', 'value', 'defaultValue', 'onValueChange', 'disabled', 'class', 'style', 'render', 'ref');
  const field = useFieldRootContext();
  const form = useFormContext();
  const labelable = useLabelableContext();
  const initialValue = untrack(() => (props.defaultValue ?? []).slice());
  const selection = createControlled<readonly string[], CheckboxGroupChangeEventDetails>({
    value: () => props.value,
    defaultValue: initialValue,
    name: 'CheckboxGroup', state: 'value',
  });
  const value = () => selection.value() ?? [];
  // RC13 getters remain committed during event dispatch. Carry accepted requests
  // only until that turn commits; controlled requests never acknowledge props.
  let pendingValue: string[] | undefined;
  const getRequestValue = () => pendingValue ?? value();
  const disabled = () => Boolean(field?.disabled || props.disabled);
  const parent = createCheckboxGroupParent({
    get allValues() { return props.allValues; },
    get value() { return value(); },
    getRequestValue,
    onValueChange: setValue,
  });
  function setValue(next: string[], details: CheckboxGroupChangeEventDetails) {
    props.onValueChange?.(next, details);
    if (!selection.request(next, details).accepted || selection.controlled) return;
    pendingValue = next;
    queueMicrotask(() => { if (pendingValue === next) pendingValue = undefined; });
  }
  createLabelableId({ id: () => null });
  const id = createBaseUiId(() => typeof props.id === 'string' ? props.id : undefined);
  const registration = Symbol('CheckboxGroup');
  const getFormValue = () => {
    const current = value();
    const formElement = form?.elementRef();
    if (!formElement || !field) return current;
    const successful = new Set<string>();
    for (const [input, metadata] of field.validation.registeredInputMetadata) {
      if (metadata.value !== undefined && input.checked && isEligibleInput(input, formElement)) {
        successful.add(metadata.value);
      }
    }
    return current.filter((item) => successful.has(item));
  };
  createEffect(() => ({ value: value(), disabled: disabled(), id: id(), name: field?.name }), (next) => {
    field?.registerFieldControl(registration, next.name && !next.disabled ? {
      id: next.id, name: next.name, value: next.value, getValue: getFormValue,
      controlRef: () => field.validation.getInputControl(),
    } : undefined);
  });
  onCleanup(() => field?.registerFieldControl(registration, undefined));
  createEffect(value, (next) => {
    field?.setFilled(next.length > 0);
  });
  createValueChanged(value, () => {
    untrack(() => {
      const next = value();
      if (field?.name) form?.clearErrors(field.name);
      const initial = Array.isArray(field?.validityData.initialValue) ? field.validityData.initialValue : [];
      field?.setDirty(next.length !== initial.length || next.some((item, index) => item !== initial[index]));
      field?.validation.change(next);
    });
  });

  let element: HTMLElement | null = null;
  const setElement = (node: HTMLElement | null) => { element = node; };
  let disposed = false;
  const resetEvents = new WeakSet<Event>();
  function reset(event: Event) {
    if (resetEvents.has(event)) return;
    resetEvents.add(event);
    queueMicrotask(() => {
      if (disposed || event.defaultPrevented) return;
      pendingValue = undefined;
      selection.reset(initialValue.slice());
      parent.reset(selection.controlled ? untrack(value) : initialValue);
    });
  }
  onCleanup(() => { disposed = true; });
  onSettled(() => {
    const doc = element?.ownerDocument;
    if (!doc) return;
    const handleReset = (event: Event) => {
      if (event.target === untrack(() => form?.elementRef() ?? element?.closest('form'))) reset(event);
    };
    doc.addEventListener('reset', handleReset, true);
    return () => doc.removeEventListener('reset', handleReset, true);
  });
  const state: CheckboxGroupState = {
    get disabled() { return disabled(); },
    get touched() { return field?.state.touched ?? false; },
    get dirty() { return field?.state.dirty ?? false; },
    get valid() { return field?.state.valid ?? null; },
    get filled() { return field?.state.filled ?? false; },
    get focused() { return field?.state.focused ?? false; },
  };
  const context: CheckboxGroupContext = {
    get allValues() { return props.allValues; },
    get value() { return value(); },
    setValue, getRequestValue, parent, reset,
    get disabled() { return disabled(); },
    get validation() { return field?.validation; },
    get registerControlId() { return labelable?.registerControlId; },
  };
  return (
    <CheckboxGroupContext value={context}>
      {createRenderElement('div', props, {
        state,
        get ref() { return [setElement, props.ref]; },
        props: [
          { role: 'group', get 'aria-labelledby'() { return labelable?.labelId; } },
          elementProps,
          (external) => labelable?.getDescriptionProps(external) ?? external,
        ],
        stateAttributesMapping: fieldValidityMapping,
      })}
    </CheckboxGroupContext>
  );
}
export namespace CheckboxGroup {
  export type Props = CheckboxGroupProps;
  export type State = CheckboxGroupState;
  export type ChangeEventReason = CheckboxGroupChangeEventReason;
  export type ChangeEventDetails = CheckboxGroupChangeEventDetails;
}
