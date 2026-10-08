import { createEffect, createSignal, onCleanup, untrack } from 'solid-js';
import type { JSX } from '@solidjs/web';
import type { NativeRef } from '../../internals/contracts/core';
import type { Group } from '../../internals/resolveValueLabel';
import { stringifyAsValue } from '../../internals/resolveValueLabel';
import { createLabelableId } from '../../internals/labelable-provider/createLabelableId';
import { createRenderElement } from '../../internals/createRenderElement';
import { createChangeEventDetails, type BaseUIChangeEventDetails } from '../../internals/createBaseUIEventDetails';
import { useFieldRootContext } from '../../internals/field-root-context';
import { useFormContext } from '../../internals/form-context/FormContext';
import { createRegisterFieldControl } from '../../internals/field-register-control/createRegisterFieldControl';
import { defaultItemEquality, isSelectedValueDirty } from '../../internals/itemEquality';
import { createMergedRefsN } from '../../utils/createMergedRefs';
import { visuallyHidden, visuallyHiddenInput } from '../../utils/visuallyHidden';
import { createDismiss } from '../../floating-ui-react/hooks/createDismiss';
import { createClick } from '../../floating-ui-react/hooks/createClick';
import { createListNavigation } from '../../floating-ui-react/hooks/createListNavigation';
import { createTypeahead } from '../../floating-ui-react/hooks/createTypeahead';
import { mergeProps } from '../../merge-props';
import { createSelectModel } from '../store';
import { FOCUSABLE_POPUP_PROPS } from '../../utils/popups';
import { SelectRootContext } from './SelectRootContext';
import { createOpenMethodTriggerProps } from '../../utils/createOpenInteractionType';

export function SelectRoot<Value, Multiple extends boolean | undefined = false>(props: SelectRootProps<Value, Multiple>) {
  const field = useFieldRootContext();
  const form = useFormContext();
  const id = createLabelableId({ get id() { return props.id; } });
  const model = createSelectModel(props, id, () => field?.disabled ?? false, (next, details) => {
    if (!next && (details.reason === 'focus-out' || details.reason === 'outside-press')) {
      field?.setTouched(true); field?.setFocused(false);
      if (field?.validationMode === 'onBlur') void field.validation.commit(model.value.value());
    }
  });
  const name = () => field?.name ?? props.name;
  const [input, setInput] = createSignal<HTMLInputElement | null>(null);
  const source = Symbol('Select');
  const ref = createMergedRefsN<HTMLInputElement>(() => [props.inputRef, setInput]);
  createRegisterFieldControl(() => model.triggerElement, id, model.value.value, () => model.fieldValue, () => !model.disabled, () => props.name);
  createEffect(() => input(), element => {
    field?.validation.registerInput(source, element);
    return () => field?.validation.registerInput(source, null);
  });
  let previousValue = untrack(model.value.value);
  createEffect(() => ({ value: model.value.value(), filled: model.hasSelectedValue,
    name: name(), initial: field?.validityData.initialValue, comparer: props.isItemEqualToValue ?? defaultItemEquality }), data => {
    field?.setFilled(data.filled);
    if (!Object.is(previousValue, data.value)) {
      previousValue = data.value;
      form?.clearErrors(data.name);
      field?.setDirty(isSelectedValueDirty(data.value, data.initial, data.comparer));
      field?.validation.change(data.value);
    }
  });
  createEffect(() => ({ input: input(), form: props.form }), ({ input: element }) => {
    const owner = element?.form;
    if (!owner) return;
    const reset = (event: Event) => queueMicrotask(() => {
      if (alive && !event.defaultPrevented) model.setValue(model.initialValue, createChangeEventDetails('none', event));
    });
    owner.addEventListener('reset', reset);
    return () => owner.removeEventListener('reset', reset);
  });
  const floating = model.popup.state.floatingRootContext;
  const dismiss = createDismiss(floating, { bubbles: { escapeKey: false } });
  const click = createClick(floating, { get enabled() { return !model.disabled; }, event: 'mousedown' });
  const navigation = createListNavigation(floating, {
    get enabled() { return !model.disabled; }, listRef: model.listRef,
    get activeIndex() { return model.activeIndex; }, get selectedIndex() { return model.selectedIndex; },
    disabledIndices: [], get focusItemOnHover() { return props.highlightItemOnHover ?? true; },
    onNavigate(index: number | null, event?: Event, source?: 'imperative') {
      if (index === null && !model.open) return;
      // The opening selection is already derived in the model. Event requests
      // must still write even when equal to the committed value: an earlier
      // handler may have staged a different highlight in this same dispatch.
      if (event || source || index !== model.activeIndex) model.setActiveIndex(index);
    },
  });
  const typeahead = createTypeahead(floating, {
    get enabled() { return !model.disabled && (model.open || (!model.readOnly && !model.multiple)); },
    listRef: model.labelsRef,
    get activeIndex() { return model.activeIndex; }, get selectedIndex() { return model.selectedIndex; },
    disabledIndices: (index: number) => model.getItem(index)?.disabled ?? false,
    onMatch(index: number) {
      if (model.open) model.setActiveIndex(index);
      else model.setValue(model.getItem(index)?.value, createChangeEventDetails('none'));
    },
    onTyping(typing: boolean) { model.typing = typing; },
  });
  const interactionType = createOpenMethodTriggerProps(() => model.open, model.setOpenMethod);
  model.triggerProps = () => mergeProps<any>(typeahead.reference, navigation.reference, dismiss.reference, click.reference, interactionType);
  model.popupProps = () => mergeProps<any>(FOCUSABLE_POPUP_PROPS, typeahead.floating, navigation.floating, dismiss.floating);
  model.itemProps = () => navigation.item ?? {};
  const actions: SelectRootActions = {
    close() { if (model.open) model.setOpen(false, createChangeEventDetails('imperative-action')); },
    unmount() { model.popup.forceUnmount(); },
    highlightItem: navigation.highlightItem,
  };
  createEffect(() => props.actionsRef, refValue => {
    if (typeof refValue === 'function') untrack(() => refValue(actions));
    return () => { if (typeof refValue === 'function') untrack(() => refValue(null)); };
  });
  let alive = true;
  onCleanup(() => { alive = false; });
  function autofill(event: Event & { currentTarget: HTMLInputElement }) {
    const text = event.currentTarget.value;
    // React's input value tracker ignores a following change event once input
    // has delivered this projection. Native input/change must do so as well.
    if (text === model.serializedValue) return;
    // Native autofill mutates the DOM before dispatch. Restore the current projection;
    // only an accepted, committed transaction may update it through the live value prop.
    event.currentTarget.value = model.serializedValue;
    if (event.defaultPrevented || model.disabled || model.readOnly || model.multiple) return;
    model.setForceMount(true);
    queueMicrotask(() => {
      if (!alive) return;
      const match = model.matchAutofill(text);
      if (match?.value != null) model.setValue(match.value, createChangeEventDetails('none', event));
    });
  }
  const Input = () => createRenderElement<{}, HTMLInputElement>('input', {}, {
    ref,
    props: [{
      get id() { return model.multiple || name() == null ? `${id()}-hidden-input` : undefined; },
      get form() { return props.form; }, get name() { return model.multiple ? undefined : name(); },
      get autocomplete() { return props.autoComplete; }, get value() { return model.serializedValue; },
      // React projects both the current value and its attribute/default value.
      // Keep the native property binding: defaultValue alone cannot restore a
      // dirty input after a canceled or unacknowledged controlled request.
      get defaultValue() { return model.serializedValue; },
      get disabled() { return model.disabled; }, get readonly() { return model.readOnly; },
      get required() { return props.required && !(model.multiple && model.hasSelectedValue); },
      tabindex: -1, 'aria-hidden': true,
      get style() { return name() ? visuallyHiddenInput : visuallyHidden; },
      onFocus() {
        const options: FocusOptions & { focusVisible: boolean } = { focusVisible: true };
        model.triggerElement?.focus(options);
      }, onInput: autofill, onChange: autofill,
    }, external => field?.validation.getValidationProps(model.disabled, external) ?? external],
  });
  return <SelectRootContext value={model}>
    {props.children}
    <Input />
    {model.multiple && Array.isArray(model.value.value()) && name() ? model.value.value().map((item: Value) =>
      <input type="hidden" form={props.form} name={name()} disabled={model.disabled} value={stringifyAsValue(item, props.itemToStringValue)} />) : null}
  </SelectRootContext>;
}

type InputValue<Value, Multiple extends boolean | undefined> = Multiple extends true ? readonly Value[] : Value;
type OutputValue<Value, Multiple extends boolean | undefined> = Multiple extends true ? Value[] : Value | null;
export interface SelectRootProps<Value, Multiple extends boolean | undefined = false> {
  children?: JSX.Element;
  inputRef?: NativeRef<HTMLInputElement>;
  actionsRef?: (actions: SelectRootActions | null) => void;
  name?: string; form?: string; autoComplete?: string; id?: string;
  required?: boolean; readOnly?: boolean; disabled?: boolean; multiple?: Multiple;
  highlightItemOnHover?: boolean; defaultOpen?: boolean; open?: boolean; modal?: boolean;
  onOpenChange?: (open: boolean, details: SelectRootOpenChangeEventDetails) => void;
  onOpenChangeComplete?: (open: boolean) => void;
  items?: Record<string, JSX.Element> | ReadonlyArray<{ label: JSX.Element; value: any }> | ReadonlyArray<Group<any>>;
  itemToStringLabel?: (value: Value) => string;
  itemToStringValue?: (value: Value) => string;
  isItemEqualToValue?: (item: Value, value: Value) => boolean;
  defaultValue?: InputValue<Value, Multiple> | null;
  value?: InputValue<Value, Multiple> | null;
  onValueChange?: (value: OutputValue<Value, Multiple>, details: SelectRootChangeEventDetails) => void;
}
export interface SelectRootState {}
export type SelectRootHighlightItemTarget = 'next' | 'previous' | 'first' | 'last' | 'none';
export interface SelectRootActions { unmount(): void; close(): void; highlightItem(target: SelectRootHighlightItemTarget): void }
export type SelectRootChangeEventReason = 'trigger-press' | 'outside-press' | 'escape-key' | 'window-resize' | 'item-press' | 'focus-out' | 'list-navigation' | 'cancel-open' | 'imperative-action' | 'none';
export type SelectRootChangeEventDetails = BaseUIChangeEventDetails<SelectRootChangeEventReason>;
export type SelectRootOpenChangeEventDetails = SelectRootChangeEventDetails & { preventUnmountOnClose(): void };
export namespace SelectRoot {
  export type Props<Value, Multiple extends boolean | undefined = false> = SelectRootProps<Value, Multiple>;
  export type State = SelectRootState;
  export type Actions = SelectRootActions;
  export type HighlightItemTarget = SelectRootHighlightItemTarget;
  export type ChangeEventReason = SelectRootChangeEventReason;
  export type ChangeEventDetails = SelectRootChangeEventDetails;
  export type OpenChangeEventDetails = SelectRootOpenChangeEventDetails;
}
