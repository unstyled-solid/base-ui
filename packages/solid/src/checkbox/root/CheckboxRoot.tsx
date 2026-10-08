// Adapted from Base UI (MIT), 19511bb171f3b360b006c94cf6d07e53cb446505.
import { createEffect, createMemo, createSignal, onCleanup, onSettled, omit, untrack } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { createControlled } from '../../utils/createControlled';
import { createMergedRefsN } from '../../utils/createMergedRefs';
import { visuallyHidden, visuallyHiddenInput } from '../../utils/visuallyHidden';
import { dispatchClickWithModifiers } from '../../utils/dispatchClickWithModifiers';
import { getDefaultFormSubmitter } from '../../utils/getDefaultFormSubmitter';
import { createBaseUiId } from '../../internals/createBaseUiId';
import { createRenderedId } from '../../internals/resolveRenderedId';
import { createValueChanged } from '../../internals/createValueChanged';
import { createRenderElement } from '../../internals/createRenderElement';
import { createButton } from '../../internals/use-button/useButton';
import { useFieldRootContext, type FieldRootState } from '../../internals/field-root-context';
import { useFieldItemContext } from '../../internals/field-core';
import { createSetFieldFocused } from '../../internals/field-root-context/createSetFieldFocused';
import { useFormContext } from '../../internals/form-context';
import { useLabelableContext } from '../../internals/labelable-provider';
import { createLabelableId } from '../../internals/labelable-provider/createLabelableId';
import { createAriaLabelledBy } from '../../internals/labelable-provider/createAriaLabelledBy';
import { createChangeEventDetails, type BaseUIChangeEventDetails } from '../../internals/createBaseUIEventDetails';
import type { BaseUIComponentProps, BaseUIEvent } from '../../internals/types';
import { mergeProps } from '../../merge-props';
import { useCheckboxGroupContext } from '../../checkbox-group/CheckboxGroupContext';
import { getCheckboxStateAttributesMapping } from '../utils/getCheckboxStateAttributesMapping';
import { CheckboxRootContext } from './CheckboxRootContext';

export const PARENT_CHECKBOX = 'data-parent';
export interface CheckboxRootState extends FieldRootState {
  checked: boolean;
  disabled: boolean;
  readOnly: boolean;
  required: boolean;
  indeterminate: boolean;
}
export interface CheckboxRootProps extends Omit<BaseUIComponentProps<'span', CheckboxRootState>, 'onChange' | 'value'> {
  id?: string | undefined;
  name?: string | undefined;
  form?: string | undefined;
  checked?: boolean | undefined;
  defaultChecked?: boolean | undefined;
  disabled?: boolean | undefined;
  onCheckedChange?: ((checked: boolean, details: CheckboxRootChangeEventDetails) => void) | undefined;
  readOnly?: boolean | undefined;
  required?: boolean | undefined;
  indeterminate?: boolean | undefined;
  inputRef?: JSX.Ref<HTMLInputElement> | undefined;
  parent?: boolean | undefined;
  uncheckedValue?: string | undefined;
  value?: string | undefined;
  nativeButton?: boolean | undefined;
}
export type CheckboxRootChangeEventReason = 'none';
export type CheckboxRootChangeEventDetails = BaseUIChangeEventDetails<CheckboxRootChangeEventReason>;

/** A span-plus-native-input checkbox; only the accepted native change commits selection. */
export function CheckboxRoot(props: CheckboxRootProps): JSX.Element {
  const elementProps = omit(props,
    'checked', 'defaultChecked', 'disabled', 'form', 'id', 'indeterminate', 'inputRef', 'name',
    'onCheckedChange', 'parent', 'readOnly', 'required', 'uncheckedValue', 'value', 'nativeButton',
    'class', 'style', 'render', 'ref', 'aria-labelledby',
  );
  const field = useFieldRootContext();
  const item = useFieldItemContext();
  const form = useFormContext();
  const labelable = useLabelableContext();
  const group = useCheckboxGroupContext();
  const parentContext = () => group?.allValues === undefined ? undefined : group.parent;
  const disabled = () => Boolean(field?.disabled || item?.disabled || group?.disabled || props.disabled);
  const name = () => field?.name ?? props.name;
  const value = () => props.value ?? name();
  const id = createBaseUiId();
  const controlId = createLabelableId({
    id: () => props.id || undefined,
    enabled: () => !group || group.registerControlId !== labelable?.registerControlId,
  });
  const exposedId = () => props.nativeButton ? controlId() : id();
  const [renderedIdOverride, setRenderedIdOverride] = createSignal<string | undefined>(undefined);
  const [, renderedRef] = createRenderedId({}, exposedId, setRenderedIdOverride);
  const groupProps = () => {
    const parent = parentContext();
    const childValue = value();
    if (!parent) return undefined;
    if (props.parent) return parent.getParentProps();
    return childValue === undefined ? undefined : parent.getChildProps(childValue);
  };
  const initialChecked = untrack(() => props.defaultChecked ?? false);
  const checkedState = createControlled<boolean, CheckboxRootChangeEventDetails>({
    value: () => {
      const childValue = value();
      if (group && childValue !== undefined && !props.parent) return group.value.includes(childValue);
      return groupProps()?.checked ?? props.checked;
    },
    defaultValue: initialChecked,
    onChange: () => (next, details) => {
      props.onCheckedChange?.(next, details);
      if (details.isCanceled) return;
      groupProps()?.onCheckedChange(next, details);
      if (details.isCanceled) return;
      const childValue = value();
      if (group && childValue !== undefined && !props.parent && !parentContext()) {
        const current = group.getRequestValue();
        group.setValue(next ? [...current, childValue] : current.filter((v) => v !== childValue), details);
      }
    },
    name: 'Checkbox', state: 'checked',
  });
  const checked = () => Boolean(parentContext() ? groupProps()?.checked ?? props.checked : checkedState.value());
  const indeterminate = () => Boolean(props.indeterminate || (props.parent && parentContext()?.getParentProps().indeterminate));
  const [control, setControl] = createSignal<HTMLElement | null>(null);
  const [input, setInput] = createSignal<HTMLInputElement | null>(null);
  const validation = () => group?.validation ?? field?.validation;
  const setFocused = createSetFieldFocused(disabled, control);
  const button = createButton({ get disabled() { return disabled(); }, get native() { return props.nativeButton ?? false; } });
  const inputRef = createMergedRefsN<HTMLInputElement>(() => [props.inputRef, setInput]);
  const labelledBy = createAriaLabelledBy(
    () => typeof props['aria-labelledby'] === 'string' ? props['aria-labelledby'] : undefined, () => labelable?.labelId, input,
    () => !props.nativeButton, controlId, () => typeof props['aria-label'] === 'string' ? props['aria-label'] : undefined,
  );
  const registration = Symbol('Checkbox');
  const inputRegistration = Symbol('CheckboxInput');
  createEffect(() => ({ node: input(), value: group ? value() : undefined, parent: props.parent, validation: validation() }), (next) => {
    if (!next.validation || !next.node || next.parent) return;
    return next.validation.registerInput(inputRegistration, next.node, { controlRef: control, value: next.value });
  });
  createEffect(() => ({ checked: checkedState.value(), disabled: disabled(), id: id(), name: props.name }), (next) => {
    field?.registerFieldControl(registration, !group && !next.disabled ? {
      controlRef: control, id: next.id, name: next.name, value: next.checked,
    } : undefined);
  });
  onCleanup(() => field?.registerFieldControl(registration, undefined));
  createEffect(() => ({ node: input(), checked: checked(), mixed: indeterminate() }), (next) => {
    if (next.node) { next.node.checked = next.checked; next.node.indeterminate = next.mixed; }
    if (!group) field?.setFilled(next.checked);
  });
  createValueChanged(checked, () => {
    untrack(() => {
      if (group) return;
      const next = checked();
      form?.clearErrors(name());
      field?.setDirty(next !== field.validityData.initialValue);
      validation()?.change(next);
    });
  });
  createEffect(() => ({ parent: parentContext(), value: value(), disabled: disabled(), isParent: props.parent }), (next) => {
    if (!next.parent || next.value === undefined || next.isParent) return;
    return next.parent.registerDisabled(next.value, next.disabled);
  });
  // The shared renderer-ID foundation owns DOM observation and ref replacement.
  // Group registration names the exposed host, never its adjacent hidden input.
  createEffect(() => ({ parent: parentContext(), value: value(), node: control(), id: renderedIdOverride() ?? exposedId(), isParent: props.parent }), (next) => {
    if (!next.parent || next.value === undefined || !next.node || !next.id || next.isParent) return;
    return next.parent.registerChildId(next.value, next.id);
  });

  let disposed = false;
  onCleanup(() => { disposed = true; });
  function restoreInput() {
    untrack(() => {
      const node = input();
      if (!disposed && node) { node.checked = checked(); node.indeterminate = indeterminate(); }
    });
  }
  onSettled(() => {
    const node = input();
    if (!node) return;
    node.defaultChecked = untrack(checked);
    const handleReset = (event: Event) => {
      if (event.target !== node.form) return;
      if (group) group.reset(event);
      queueMicrotask(() => {
        if (disposed || event.defaultPrevented) return;
        // Identified children are controlled by the group, but a valueless child
        // in a plain group still owns uncontrolled checked state.
        checkedState.reset(initialChecked);
        queueMicrotask(restoreInput);
      });
    };
    node.ownerDocument.addEventListener('reset', handleReset, true);
    return () => node.ownerDocument.removeEventListener('reset', handleReset, true);
  });
  let clickEvent: MouseEvent | undefined;
  const nativeProps = createMemo(() => mergeProps<'input'>(
    {
      get checked() { return checked(); },
      get disabled() { return disabled(); },
      get form() { return props.form; },
      get name() { return props.parent ? undefined : name(); },
      get id() { return props.nativeButton ? undefined : controlId(); },
      get required() { return props.required; },
      get value() { return props.value === undefined ? 'on' : (group && !checked() ? '' : props.value); },
      ref: inputRef,
      get style() { return name() ? visuallyHiddenInput : visuallyHidden; },
      tabindex: -1, type: 'checkbox', 'aria-hidden': 'true',
      onClick(event) {
        // Only the original root click bubbles. Label activation still uses this native input.
        event.stopPropagation();
        clickEvent = event;
        if (props.readOnly || disabled()) event.preventDefault();
      },
      onChange(event) {
        const nativeEvent = clickEvent ?? event;
        clickEvent = undefined;
        if (nativeEvent.defaultPrevented || props.readOnly || disabled()) { restoreInput(); return; }
        const next = event.currentTarget.checked;
        const details = createChangeEventDetails('none', nativeEvent);
        const result = checkedState.request(next, details);
        if (!result.accepted) restoreInput();
        else event.currentTarget.indeterminate = indeterminate();
        // Controlled proposals are not acknowledgements; restore from committed props after RC13 stages them.
        queueMicrotask(restoreInput);
      },
      onFocus() { control()?.focus(); },
    },
    (external) => labelable?.getDescriptionProps(external) ?? external,
    (external) => validation()?.getValidationProps(disabled(), external) ?? external,
  ), { transparent: true });
  const state: CheckboxRootState = {
    get checked() { return checked(); }, get indeterminate() { return indeterminate(); },
    get disabled() { return disabled(); }, get readOnly() { return props.readOnly ?? false; },
    get required() { return props.required ?? false; },
    get touched() { return field?.state.touched ?? false; }, get dirty() { return field?.state.dirty ?? false; },
    get valid() { return field?.state.valid ?? null; }, get filled() { return field?.state.filled ?? false; },
    get focused() { return field?.state.focused ?? false; },
  };
  return (
    <CheckboxRootContext value={state}>
      {createRenderElement('span', props, {
        state,
        get ref() { return [button.buttonRef, setControl, renderedRef, props.ref]; },
        props: [
          {
            get id() { return exposedId(); },
            role: 'checkbox',
            get 'aria-checked'() { return indeterminate() ? 'mixed' : checked() ? 'true' : 'false'; },
            get 'aria-readonly'() { return props.readOnly ? 'true' : undefined; },
            get 'aria-required'() { return props.required ? 'true' : undefined; },
            get 'aria-labelledby'() { return labelledBy(); },
            get 'aria-controls'() { return props.parent ? parentContext()?.getParentProps()['aria-controls'] : undefined; },
            get [PARENT_CHECKBOX]() { return props.parent ? '' : undefined; },
            onFocus() { setFocused(true); },
            onBlur() {
              if (!input()) return;
              field?.setTouched(true);
              setFocused(false);
              if (field?.validationMode === 'onBlur') void validation()?.commit(group ? group.value : input()!.checked);
            },
            onKeyDown(event: BaseUIEvent<KeyboardEvent>) {
              if (event.key !== 'Enter') return;
              event.preventBaseUIHandler();
              if (event.defaultPrevented || disabled()) return;
              const submitForm = input()?.form ?? null;
              const original = event.preventDefault;
              let preventedLater = false;
              event.preventDefault = () => { preventedLater = true; original.call(event); };
              // Native events have one defaultPrevented flag, unlike React's synthetic/native pair.
              original.call(event);
              queueMicrotask(() => {
                event.preventDefault = original;
                if (!disposed && !preventedLater) getDefaultFormSubmitter(submitForm)?.click();
              });
            },
            onClick(event: MouseEvent) {
              if (props.readOnly || disabled()) return;
              event.preventDefault();
              const node = input();
              if (node) dispatchClickWithModifiers(node, event);
            },
          },
          elementProps,
          button.getButtonProps,
          (external) => labelable?.getDescriptionProps(external) ?? external,
          (external) => validation()?.getValidationProps(disabled(), external) ?? external,
        ],
        stateAttributesMapping: getCheckboxStateAttributesMapping(state),
      })}
      {!checked() && !group && name() && !props.parent && props.uncheckedValue !== undefined && (
        <input type="hidden" form={props.form} name={name()} value={props.uncheckedValue} disabled={disabled()} />
      )}
      <input {...nativeProps()} />
    </CheckboxRootContext>
  );
}
export namespace CheckboxRoot {
  export type Props = CheckboxRootProps;
  export type State = CheckboxRootState;
  export type ChangeEventReason = CheckboxRootChangeEventReason;
  export type ChangeEventDetails = CheckboxRootChangeEventDetails;
}
