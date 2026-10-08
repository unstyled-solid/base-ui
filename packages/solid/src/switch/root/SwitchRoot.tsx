import { createEffect, createSignal, omit, onCleanup, untrack } from 'solid-js';
import type { JSX } from '@solidjs/web';
import type { BaseUIComponentProps } from '../../internals/types';
import { createRenderElement } from '../../internals/createRenderElement';
import { createBaseUiId } from '../../internals/createBaseUiId';
import { createValueChanged } from '../../internals/createValueChanged';
import { createButton } from '../../internals/use-button';
import { createControlled } from '../../utils/createControlled';
import { createMergedRefsN } from '../../utils/createMergedRefs';
import { dispatchClickWithModifiers } from '../../utils/dispatchClickWithModifiers';
import { visuallyHidden, visuallyHiddenInput } from '../../utils/visuallyHidden';
import { createChangeEventDetails, type BaseUIChangeEventDetails } from '../../internals/createBaseUIEventDetails';
import { useFieldRootContext, type FieldRootState } from '../../internals/field-root-context';
import { createSetFieldFocused } from '../../internals/field-root-context/createSetFieldFocused';
import { createRegisterFieldControl } from '../../internals/field-register-control/createRegisterFieldControl';
import { useFormContext } from '../../internals/form-context';
import { useLabelableContext } from '../../internals/labelable-provider';
import { createLabelableId } from '../../internals/labelable-provider/createLabelableId';
import { createAriaLabelledBy } from '../../internals/labelable-provider/createAriaLabelledBy';
import { SwitchRootContext } from './SwitchRootContext';
import { stateAttributesMapping } from '../stateAttributesMapping';
import { mergeProps } from '../../merge-props';

/** A visible switch and an adjacent native checkbox, following Base UI's managed reset semantics. */
export function SwitchRoot(props: SwitchRootProps) {
  const field = useFieldRootContext();
  const form = useFormContext();
  const label = useLabelableContext();
  const disabled = () => Boolean(field?.disabled || props.disabled);
  const name = () => field?.name ?? props.name;
  const model = createControlled<boolean, SwitchRootChangeEventDetails>({
    value: () => props.checked,
    defaultValue: untrack(() => Boolean(props.defaultChecked)),
    onChange: () => props.onCheckedChange,
    name: 'Switch', state: 'checked',
  });
  const id = createBaseUiId();
  const controlId = createLabelableId({ get id() { return props.id; } });
  const inputId = () => props.nativeButton ? undefined : controlId();
  const [input, setInput] = createSignal<HTMLInputElement | null>(null);
  const [element, setElement] = createSignal<HTMLElement | null>(null);
  // Plain cells also support ref-time events before staged signal writes commit.
  let inputNode: HTMLInputElement | null = null;
  let rootNode: HTMLElement | null = null;
  let disposed = false;
  const inputSource = Symbol('Switch input');
  const setFocused = createSetFieldFocused(disabled, element);
  createRegisterFieldControl(element, id, model.value, undefined, () => !disabled(), () => props.name);
  const button = createButton({ get disabled() { return disabled(); }, get native() { return props.nativeButton ?? false; } });
  const labelledBy = createAriaLabelledBy(
    () => typeof props['aria-labelledby'] === 'string' ? props['aria-labelledby'] : undefined,
    () => label?.labelId, input, () => !props.nativeButton, inputId,
    () => typeof props['aria-label'] === 'string' ? props['aria-label'] : undefined,
  );
  const ownInputRef = (node: HTMLInputElement | null) => {
    inputNode = node;
    setInput(node);
    // Switch owns the direct validation input ref. Only checkbox/radio groups
    // supply registry metadata; treating sibling Switches as a group incorrectly
    // keeps an earlier required input authoritative after a later takeover.
    field?.validation.registerInput(inputSource, node);
  };
  const inputRef = createMergedRefsN<HTMLInputElement>(() => [ownInputRef, props.inputRef]);
  const rootRef = (node: HTMLElement | null) => { rootNode = node; setElement(node); };
  onCleanup(() => { disposed = true; field?.validation.registerInput(inputSource, null); });

  createEffect(model.value, (checked) => {
    field?.setFilled(checked);
  });
  createValueChanged(model.value, () => {
    const checked = model.value();
    form?.clearErrors(name());
    field?.setDirty(checked !== field.validityData.initialValue);
    field?.validation.change(checked);
  });
  // RC13 clears an input's value property to "" when a spread key disappears.
  // Checkboxes must instead regain their native "on" value by removing the attribute.
  createEffect(() => ({ node: input(), value: props.value }), ({ node, value }) => {
    if (node && value === undefined) node.removeAttribute('value');
  });
  const restoreInput = () => {
    if (!disposed && inputNode) inputNode.checked = untrack(model.value);
  };
  // Native reset resets DOM checkedness, but upstream deliberately retains managed state.
  createEffect(() => ({ node: input(), form: props.form }), ({ node }) => {
    const owner = node?.form;
    const reset = () => queueMicrotask(restoreInput);
    owner?.addEventListener('reset', reset);
    return () => owner?.removeEventListener('reset', reset);
  });
  let clickChange = false;
  function request(event: Event, node: HTMLInputElement) {
    if (event.defaultPrevented || disabled() || props.readOnly) {
      event.preventDefault();
      queueMicrotask(restoreInput);
      return;
    }
    const result = model.request(node.checked, createChangeEventDetails('none', event));
    if (!result.accepted || result.controlled) node.checked = model.value();
    // Controlled refusal and canceled proposals must not leak browser checkedness.
    queueMicrotask(restoreInput);
  }
  const rootProps = {
    get id() { return props.nativeButton ? controlId() : id(); },
    role: 'switch',
    get 'aria-checked'() { return model.value(); },
    get 'aria-readonly'() { return props.readOnly || undefined; },
    get 'aria-required'() { return props.required || undefined; },
    get 'aria-labelledby'() { return labelledBy(); },
    onFocus() { setFocused(true); },
    onBlur() {
      if (!inputNode || disabled()) return;
      field?.setTouched(true);
      setFocused(false);
      if (field?.validationMode === 'onBlur') void field.validation.commit(inputNode.checked);
    },
    onClick(event: MouseEvent) {
      if (props.readOnly || disabled()) return;
      event.preventDefault();
      if (inputNode) dispatchClickWithModifiers(inputNode, event);
    },
  };
  const elementProps = omit(props, 'checked', 'defaultChecked', 'class', 'style', 'render', 'ref', 'id', 'aria-labelledby', 'form', 'inputRef', 'name', 'nativeButton', 'onCheckedChange', 'readOnly', 'required', 'disabled', 'uncheckedValue', 'value');
  // The field seam exposes generic HTMLElement props. The merge boundary brands native
  // events before invoking Base UI callbacks; this host is specifically an input.
  const validationProps = () => mergeProps<'input'>(field?.validation.getValidationProps(disabled()) as JSX.InputHTMLAttributes<HTMLInputElement> | undefined);
  const state: SwitchRootState = {
    get checked() { return model.value(); }, get disabled() { return disabled(); },
    get readOnly() { return props.readOnly ?? false; }, get required() { return props.required ?? false; },
    get valid() { return field?.state.valid ?? null; }, get touched() { return field?.state.touched ?? false; },
    get dirty() { return field?.state.dirty ?? false; }, get filled() { return field?.state.filled ?? false; },
    get focused() { return field?.state.focused ?? false; },
  };
  return <SwitchRootContext value={state}>
    {createRenderElement('span', props, {
      state, get ref() { return [props.ref, rootRef, button.buttonRef]; }, stateAttributesMapping,
      props: [rootProps, elementProps, button.getButtonProps, (merged) => field?.validation.getValidationProps(disabled(), merged) ?? merged],
    })}
    {!model.value() && name() && props.uncheckedValue !== undefined &&
      <input type="hidden" form={props.form} name={name()} value={props.uncheckedValue} disabled={disabled()} />}
    <input {...validationProps()}
      ref={inputRef} type="checkbox" checked={model.value()} disabled={disabled()}
      form={props.form} id={inputId()} name={name()} required={props.required ?? false}
      style={name() ? visuallyHiddenInput : visuallyHidden} tabindex={-1} aria-hidden="true"
      {...(props.value !== undefined ? { value: props.value } : {})}
      onClick={(event) => {
        event.stopPropagation();
        clickChange = true;
        request(event, event.currentTarget);
        queueMicrotask(() => { clickChange = false; });
      }}
      onChange={(event) => {
        // The browser emits a trusted change synchronously after checkbox click
        // activation. Suppress only that duplicate, not an independent dispatched
        // change later in the same turn (including after a canceled click).
        if (clickChange && event.isTrusted) {
          clickChange = false;
          return;
        }
        request(event, event.currentTarget);
      }}
      onFocus={() => rootNode?.focus()}
    />
  </SwitchRootContext>;
}

export interface SwitchRootState extends FieldRootState { checked: boolean; readOnly: boolean; required: boolean }
export interface SwitchRootProps extends Omit<BaseUIComponentProps<'span', SwitchRootState>, 'onChange'> {
  id?: string;
  nativeButton?: boolean;
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  inputRef?: JSX.Ref<HTMLInputElement>;
  name?: string;
  form?: string;
  onCheckedChange?: (checked: boolean, details: SwitchRootChangeEventDetails) => void;
  readOnly?: boolean;
  required?: boolean;
  value?: string;
  uncheckedValue?: string;
}
export type SwitchRootChangeEventReason = 'none';
export type SwitchRootChangeEventDetails = BaseUIChangeEventDetails<SwitchRootChangeEventReason>;
export namespace SwitchRoot {
  export type State = SwitchRootState;
  export type Props = SwitchRootProps;
  export type ChangeEventReason = SwitchRootChangeEventReason;
  export type ChangeEventDetails = SwitchRootChangeEventDetails;
}
