import { For, createEffect, untrack } from 'solid-js';
import type { JSX } from '@solidjs/web';
import type { BaseUIChangeEventDetails, BaseUIHighlightEventDetails } from '../../internals/createBaseUIEventDetails';
import { createChangeEventDetails } from '../../internals/createBaseUIEventDetails';
import type { Group } from '../../internals/resolveValueLabel';
import { stringifyAsValue } from '../../internals/resolveValueLabel';
import { visuallyHidden, visuallyHiddenInput } from '../../utils/visuallyHidden';
import { createMergedRefsN } from '../../utils/createMergedRefs';
import type { ComboboxItemCollection } from '../items/itemCollection';
import { createComboboxModel } from '../store';
import { createRenderElement } from '../../internals/createRenderElement';
import { ComboboxRootContext, ComboboxDerivedItemsContext, ComboboxFloatingContext, ComboboxHasItemsContext, ComboboxInputValueContext } from './ComboboxRootContext';

export type SelectionMode = 'single' | 'multiple' | 'none';
export type AriaComboboxInputValue = string | number | readonly string[];
type InputValue<Value, Mode extends SelectionMode> = (Mode extends 'multiple' ? readonly Value[] : Value) | null;
type OutputValue<Value, Mode extends SelectionMode> = Mode extends 'multiple' ? Value[] : Value | null;
export interface AriaComboboxProps<Value, Mode extends SelectionMode = 'none', Item = Value> {
  children?: JSX.Element;
  selectionMode: Mode;
  selectedValue?: InputValue<Value, Mode>;
  defaultSelectedValue?: InputValue<Value, Mode>;
  onSelectedValueChange?: (value: OutputValue<Value, Mode>, details: AriaCombobox.ChangeEventDetails) => void;
  id?: string; name?: string; form?: string;
  disabled?: boolean; readOnly?: boolean; required?: boolean;
  open?: boolean; defaultOpen?: boolean;
  onOpenChange?: (open: boolean, details: AriaCombobox.OpenChangeEventDetails) => void;
  onOpenChangeComplete?: (open: boolean) => void;
  inputValue?: AriaComboboxInputValue; defaultInputValue?: AriaComboboxInputValue;
  onInputValueChange?: (value: string, details: AriaCombobox.ChangeEventDetails) => void;
  onItemHighlighted?: (value: Value | undefined, details: AriaCombobox.HighlightEventDetails) => void;
  actionsRef?: ((actions: AriaCombobox.Actions | null) => void) | { current: AriaCombobox.Actions | null };
  inputRef?: JSX.Ref<HTMLInputElement>;
  items?: readonly Item[] | readonly Group<Item>[] | ComboboxItemCollection<Item, Value>;
  filteredItems?: readonly Item[] | readonly Group<Item>[];
  filter?: null | ((item: Item, query: string, itemToString?: (item: Item) => string) => boolean);
  itemToStringLabel?: (value: Value) => string;
  itemToStringValue?: (value: Value) => string;
  isItemEqualToValue?: (a: Value, b: Value) => boolean;
  autoHighlight?: boolean | 'always'; keepHighlight?: boolean; highlightItemOnHover?: boolean;
  openOnInputClick?: boolean; loopFocus?: boolean; grid?: boolean; virtualized?: boolean;
  inline?: boolean; modal?: boolean; limit?: number; locale?: Intl.LocalesArgument;
  autoComplete?: 'list' | 'both' | 'inline' | 'none'; formAutoComplete?: string;
  fillInputOnItemPress?: boolean; submitOnItemClick?: boolean;
  /** Internal Autocomplete seam: filtering can differ from the displayed completion. */
  filterQuery?: string;
  /** Private display adapter scope; never added to public highlight details. */
  inlineCompletionScope?: object;
  onInlineCompletion?: (value: Value | undefined, details: AriaCombobox.HighlightEventDetails) => void;
}
export interface AriaComboboxState {}
export type AriaComboboxHighlightItemTarget = 'next' | 'previous' | 'first' | 'last' | 'none';

/** Native, shared single/multiple/none engine. Context fields are live getters. */
export function AriaCombobox<Value, Mode extends SelectionMode = 'none', Item = Value>(props: AriaComboboxProps<Value, Mode, Item>): JSX.Element {
  // The erased context is internal; public inference remains in Props above.
  const model = createComboboxModel(props as AriaComboboxProps<any, SelectionMode, any>);
  const source = Symbol('combobox-field');
  const validationSource = Symbol('combobox-validation-input');
  const [hidden, setHidden] = model.hiddenInput;
  const hiddenRef = createMergedRefsN<HTMLInputElement>(() => [props.inputRef, setHidden]);
  createEffect(() => ({ field: model.field, value: model.fieldValue(), name: props.name, id: model.state.id, disabled: model.state.disabled, element: hidden() }), (next) => untrack(() => {
    const field = next.field;
    if (!field) return;
    field.registerFieldControl(source, next.disabled ? undefined : {
      controlRef: () => model.state.inputInsidePopup ? model.state.triggerElement : model.state.inputElement,
      id: next.id, name: next.name, value: next.value, getValue: model.formValue,
    });
    field.validation.registerInput(validationSource, next.element);
    return () => { field.registerFieldControl(source, undefined); field.validation.registerInput(validationSource, null); };
  }));
  createEffect(() => ({ element: hidden(), formId: props.form }), ({ element, formId }) => {
    const external = formId === undefined ? null : element?.ownerDocument.getElementById(formId);
    const form = formId === undefined ? element?.form : external?.tagName === 'FORM' ? external as HTMLFormElement : null;
    if (!form) return;
    const reset = (event: Event) => {
      queueMicrotask(() => { if (!model.disposed && !event.defaultPrevented) untrack(() => model.reset(event)); });
    };
    form.addEventListener('reset', reset);
    return () => form.removeEventListener('reset', reset);
  });
  createEffect(() => props.actionsRef, (ref) => {
    if (typeof ref === 'function') ref(model.actions);
    else if (ref) ref.current = model.actions;
    return () => { if (typeof ref === 'function') ref(null); else if (ref?.current === model.actions) ref.current = null; };
  });
  const hiddenName = () => model.state.selectionMode === 'multiple' || (model.state.selectionMode === 'none' && model.state.inputOwnsFormValue) ? undefined : model.state.name;
  const multipleValues = () => model.state.selectionMode === 'multiple' && Array.isArray(model.state.selectedValue) ? model.state.selectedValue : [];
  function autofill(event: InputEvent & { currentTarget: HTMLInputElement }) {
    const element = event.currentTarget;
    const text = element.value;
    const restore = () => { if (!model.disposed) element.value = Array.isArray(model.fieldValue()) ? '' : stringifyAsValue(model.fieldValue(), props.itemToStringValue); };
    if (event.defaultPrevented || model.state.disabled || model.state.readOnly || props.selectionMode === 'multiple') { restore(); return; }
    const details = createChangeEventDetails('none', event);
    if (props.selectionMode === 'none') { model.context.setInputValue(text, details); queueMicrotask(() => untrack(restore)); return; }
    model.context.forceMount();
    const serializedMatch = (candidate: any) => stringifyAsValue(candidate, props.itemToStringValue).toLocaleLowerCase() === text.toLocaleLowerCase() || model.derived.label(candidate).toLocaleLowerCase() === text.toLocaleLowerCase();
    if (model.derived.hasItems && !model.values().some(serializedMatch)) model.context.forceMountRendered();
    queueMicrotask(() => untrack(() => {
      if (model.disposed) return;
      const search = text.toLocaleLowerCase();
      const candidates = model.values();
      let index = candidates.findIndex(serializedMatch);
      if (index === -1) index = candidates.findIndex((_candidate, index) => model.context.labelsRef.current[index]?.toLocaleLowerCase() === search);
      const value = index === -1 ? undefined : candidates[index];
      if (value !== undefined) model.context.setSelectedValue(value, details);
      queueMicrotask(() => untrack(restore));
    }));
  }
  function HiddenControl() {
    const defaults = {
      get id() { return hiddenName() == null ? `${model.state.id}-hidden-input` : undefined; },
      get name() { return hiddenName(); }, get form() { return props.form; }, get autocomplete() { return props.formAutoComplete; },
      get value() { return Array.isArray(model.fieldValue()) ? '' : stringifyAsValue(model.fieldValue(), props.itemToStringValue); },
      get disabled() { return model.state.disabled; }, get readonly() { return props.readOnly; },
      get required() { return props.required && multipleValues().length === 0; },
      tabindex: -1, 'aria-hidden': true, get style() { return hiddenName() ? visuallyHiddenInput : visuallyHidden; },
      onFocus() { (model.state.inputInsidePopup ? model.state.triggerElement : model.state.inputElement ?? model.state.triggerElement)?.focus(); }, onInput: autofill,
    };
    return createRenderElement<{}, HTMLInputElement>('input', {}, { ref: hiddenRef,
      get props() { return [model.field?.validation.getValidationProps(model.state.disabled), defaults]; },
    });
  }
  return <ComboboxRootContext value={model}>
    <ComboboxFloatingContext value={model.floating}>
      <ComboboxDerivedItemsContext value={model.derived}>
        <ComboboxHasItemsContext value={() => model.derived.hasItems}>
          <ComboboxInputValueContext value={() => model.state.inputValue}>
            {props.children}
            <HiddenControl />
            <For each={model.state.name ? multipleValues() : []}>{(value) => <input type="hidden" name={model.state.name} form={props.form}
              value={stringifyAsValue(value, props.itemToStringValue)} disabled={model.state.disabled} />}</For>
          </ComboboxInputValueContext>
        </ComboboxHasItemsContext>
      </ComboboxDerivedItemsContext>
    </ComboboxFloatingContext>
  </ComboboxRootContext>;
}
export namespace AriaCombobox {
  export type Props<Value, Mode extends SelectionMode = 'none', Item = Value> = AriaComboboxProps<Value, Mode, Item>;
  export type State = AriaComboboxState;
  export type HighlightItemTarget = AriaComboboxHighlightItemTarget;
  export interface Actions { unmount(): void; close(): void; highlightItem(target: HighlightItemTarget): void }
  export type HighlightEventReason = 'keyboard' | 'pointer' | 'imperative-action' | 'none';
  export type HighlightEventDetails = BaseUIHighlightEventDetails<HighlightEventReason, { index: number }>;
  export type ChangeEventReason = 'trigger-press' | 'input-press' | 'outside-press' | 'item-press' | 'close-press' | 'escape-key' | 'list-navigation' | 'focus-out' | 'input-change' | 'input-clear' | 'clear-press' | 'chip-remove-press' | 'cancel-open' | 'imperative-action' | 'none';
  export type ChangeEventDetails = BaseUIChangeEventDetails<ChangeEventReason> & { isItemPress?: boolean };
  export type OpenChangeEventDetails = ChangeEventDetails & { preventUnmountOnClose(): void };
}
