import { createEffect, createSignal, omit, onCleanup, onSettled, untrack } from 'solid-js';
import type { JSX } from '@solidjs/web';
import type { BaseUIComponentProps, HTMLProps } from '../../internals/types';
import { createBaseUiId } from '../../internals/createBaseUiId';
import { createRenderElement } from '../../internals/createRenderElement';
import { createChangeEventDetails } from '../../internals/createBaseUIEventDetails';
import { createButton } from '../../internals/use-button';
import { CompositeItem } from '../../internals/composite';
import { useFieldRootContext, type FieldRootState } from '../../internals/field-root-context';
import { useFieldItemContext, createSetFieldFocused } from '../../internals/field-core';
import { useLabelableContext, createLabelableId, createAriaLabelledBy } from '../../internals/labelable-provider';
import { createMergedRefsN } from '../../utils/createMergedRefs';
import { dispatchClickWithModifiers } from '../../utils/dispatchClickWithModifiers';
import { visuallyHidden, visuallyHiddenInput } from '../../utils/visuallyHidden';
import { serializeValue } from '../../internals/serializeValue';
import { useRadioGroupContext } from '../../radio-group/RadioGroupContext';
import { RadioRootContext } from './RadioRootContext';
import { stateAttributesMapping } from '../utils/stateAttributesMapping';

/** A radio's visible span and adjacent native form input. */
export function RadioRoot<Value = any>(props: RadioRootProps<Value>) {
  const group = useRadioGroupContext();
  const field = useFieldRootContext();
  const item = useFieldItemContext();
  const labelable = useLabelableContext();
  const disabled = () => Boolean(props.disabled || group?.disabled || field?.disabled || item?.disabled);
  const readOnly = () => Boolean(props.readOnly || group?.readOnly);
  const required = () => Boolean(props.required || group?.required);
  const checked = () => group ? group.checkedValue === props.value : props.value === '';
  const [control, setControl] = createSignal<HTMLElement | null>(null);
  const [input, setInput] = createSignal<HTMLInputElement | null>(null);
  const setFocused = createSetFieldFocused(disabled, control);
  const inputId = createLabelableId({ get id() { return typeof props.id === 'string' ? props.id : undefined; } });
  const rootId = createBaseUiId();
  const ariaLabelledBy = createAriaLabelledBy(
    () => typeof props['aria-labelledby'] === 'string' ? props['aria-labelledby'] : undefined, () => labelable?.labelId, input,
    () => !props.nativeButton, () => props.nativeButton ? undefined : inputId(),
    () => typeof props['aria-label'] === 'string' ? props['aria-label'] : undefined,
  );
  const source = Symbol('RadioRoot');
  const inputRef = createMergedRefsN<HTMLInputElement>(() => [props.inputRef, setInput]);
  createEffect(() => ({ input: input(), value: props.value }), (next) => {
    // RC13's native value removal sets the property to '', which creates a
    // value attribute on radios. Source omission must preserve native 'on'.
    if (next.value === undefined) next.input?.removeAttribute('value');
  });
  onSettled(() => { if (input()?.checked) field?.setFilled(true); });
  createEffect(input, (element) => {
    if (!element) return;
    const unregister = group?.registerInput(source, {
      input: element,
      get control() { return control(); },
      get value() { return props.value; },
      get disabled() { return disabled(); },
    });
    const unregisterField = group && field?.validation.registerInput(source, element, { controlRef: control, value: undefined });
    return () => {
      unregister?.();
      if (unregisterField) unregisterField();
    };
  });
  let disposed = false;
  onCleanup(() => { disposed = true; });
  const restoreInputs = () => untrack(() => {
    if (disposed) return;
    if (group) group.syncInputs(group.checkedValue);
    else if (input()) input()!.checked = checked();
  });
  const change = (event: Event) => {
    if (event.defaultPrevented || disabled() || readOnly() || props.value === undefined) {
      event.preventDefault();
      queueMicrotask(restoreInputs);
      return;
    }
    if (!(group ? group.isSelected(props.value) : checked())) {
      const details = createChangeEventDetails('none', event);
      const accepted = group?.setCheckedValue(props.value, details) ?? true;
      if (!accepted) event.preventDefault();
      else field?.setTouched(true);
    }
    // Controlled requests need not be acknowledged, and a canceled native radio
    // click may roll back checked after listeners return. Reconcile after dispatch.
    queueMicrotask(restoreInputs);
  };
  let activation: MouseEvent | undefined;
  const defaults: HTMLProps & { 'data-composite-item-active'?: string } = {
    role: 'radio',
    get 'aria-checked'() { return checked() ? 'true' : 'false'; },
    get 'aria-labelledby'() { return ariaLabelledBy(); },
    get id() { return props.nativeButton ? inputId() : rootId(); },
    get 'data-composite-item-active'() { return checked() ? '' : undefined; },
    onKeyDown(event) { if (event.key === 'Enter') event.preventDefault(); },
    onClick(event) {
      if (event.defaultPrevented || disabled() || readOnly()) return;
      event.preventDefault();
      const element = input();
      if (element) dispatchClickWithModifiers(element, event);
    },
    onFocus() { setFocused(true); },
    onFocusOut() { if (!group) setFocused(false); },
  };
  const button = createButton({
    get disabled() { return disabled(); },
    get native() { return props.nativeButton ?? false; },
    composite: false,
  });
  const state: RadioRootState = {
    get checked() { return checked(); },
    get disabled() { return disabled(); },
    get readOnly() { return readOnly(); },
    get required() { return required(); },
    get touched() { return field?.state.touched ?? false; },
    get dirty() { return field?.state.dirty ?? false; },
    get valid() { return field?.state.valid ?? null; },
    get filled() { return field?.state.filled ?? false; },
    get focused() { return field?.state.focused ?? false; },
  };
  const elementProps = omit(props, 'value', 'disabled', 'required', 'readOnly', 'inputRef', 'nativeButton', 'id', 'aria-labelledby', 'class', 'style', 'render', 'ref');
  const renderProps = [
    defaults, elementProps, button.getButtonProps,
    (external: HTMLProps) => labelable?.getDescriptionProps(external) ?? external,
    (external: HTMLProps) => field?.validation.getValidationProps(disabled(), external) ?? external,
  ];
  return (
    <RadioRootContext value={state}>
      {group ? (
        <CompositeItem tag="span" render={props.render} class={props.class} style={props.style}
          state={state} refs={[props.ref, setControl, button.buttonRef]}
          props={renderProps} stateAttributesMapping={stateAttributesMapping} />
      ) : createRenderElement('span', props, {
        state, get ref() { return [props.ref, setControl, button.buttonRef]; },
        props: renderProps, stateAttributesMapping,
      })}
      <input type="radio" ref={inputRef} form={group?.form}
        id={props.nativeButton ? undefined : inputId()} name={group?.name}
        tabindex={-1} style={group?.name ? visuallyHiddenInput : visuallyHidden}
        aria-hidden="true" {...(props.value === undefined ? {} : { value: serializeValue(props.value) })}
        checked={checked()} disabled={disabled()} required={required()} readonly={readOnly()}
        onClick={(event) => {
          event.stopPropagation();
          // Change is dispatched only after the entire native click completes
          // uncanceled. Retain its modifiers/reason event without committing in
          // the click listener (later listeners can still preventDefault).
          activation = event;
          queueMicrotask(() => {
            if (activation === event) activation = undefined;
            restoreInputs();
          });
        }}
        onChange={(event) => { change(activation ?? event); activation = undefined; }}
        onFocus={() => control()?.focus()} />
    </RadioRootContext>
  );
}

export interface RadioRootState extends FieldRootState {
  checked: boolean;
  readOnly: boolean;
  required: boolean;
}
export interface RadioRootProps<Value = any> extends Omit<BaseUIComponentProps<'span', RadioRootState>, 'value'> {
  value: Value;
  disabled?: boolean;
  required?: boolean;
  readOnly?: boolean;
  nativeButton?: boolean;
  inputRef?: JSX.Ref<HTMLInputElement>;
}
export namespace RadioRoot {
  export type State = RadioRootState;
  export type Props<Value = any> = RadioRootProps<Value>;
}
