import { createEffect, createSignal, merge, omit, untrack } from 'solid-js';
import { createRenderElement } from '../../internals/createRenderElement';
import { createBaseUiId } from '../../internals/createBaseUiId';
import type { BaseUIComponentProps } from '../../internals/types';
import type { Side } from '../../internals/createAnchorPositioning';
import { createChangeEventDetails } from '../../internals/createBaseUIEventDetails';
import { useDirection } from '../../internals/direction-context/DirectionContext';
import { platform } from '../../utils/platform';
import { useComboboxRootContext } from '../root/ComboboxRootContext';
import { useComboboxPositionerContext } from '../positioner/ComboboxPositionerContext';
import { useComboboxChipsContext } from '../chips/ComboboxChipsContext';
import { clickHighlightedItem, getChipNavigationKeys, getIndexAfterChipRemoval } from '../utils/parts';
import { triggerStateAttributesMapping } from '../utils/stateAttributesMapping';
import { createFieldPartState } from '../utils/fieldState';
import { useLabelableContext } from '../../internals/labelable-provider/LabelableContext';
import type { FieldRootState } from '../../internals/field-root-context';
import { ComboboxInternalDismissButton } from '../utils/ComboboxInternalDismissButton';
import { FieldRootContext } from '../../internals/field-root-context';

export interface ComboboxInputState extends FieldRootState { open: boolean; disabled: boolean; readOnly: boolean; popupSide: Side | null; listEmpty: boolean }
export interface ComboboxInputProps extends BaseUIComponentProps<'input', ComboboxInputState> { disabled?: boolean }
export function ComboboxInput(props: ComboboxInputProps) {
  const model = useComboboxRootContext();
  const positioning = useComboboxPositionerContext(true);
  const chips = useComboboxChipsContext();
  const direction = useDirection();
  const labelable = useLabelableContext();
  const inside = () => Boolean(positioning || model.state.inline);
  const id = createBaseUiId(() => typeof props.id === 'string' ? props.id : (!inside() ? model.state.id : undefined));
  const disabled = () => Boolean(props.disabled || model.state.disabled);
  const [composingValue, setComposingValue] = createSignal<string | null>(null);
  let composing = false;
  let lastActiveIndex: number | null = null;
  createEffect(() => model.state.open, (open) => { if (!open) lastActiveIndex = null; });
  const state: ComboboxInputState = merge(createFieldPartState(model, () => Boolean(positioning)), {
    get open() { return model.state.open; }, get disabled() { return disabled(); }, get readOnly() { return model.state.readOnly; },
    get popupSide() { return model.state.popupSide; }, get listEmpty() { return !model.derived.filteredItems.length; },
  });
  const clearHighlight = (event: Event) => model.context.setIndices({ activeIndex: null, selectedIndex: null, event, type: event.type.startsWith('key') ? 'keyboard' : event.type.startsWith('pointer') || event.type.startsWith('mouse') ? 'pointer' : 'none' });
  const setInput = (element: HTMLInputElement | null) => {
    if (element && inside() && !model.state.hasInputValue) model.context.setInputValue('', createChangeEventDetails('none'));
    model.setInputElement(element); model.setInside(inside());
  };
  const defaults = {
    get id() { return id(); }, get role() { return inputLike() || model.state.open || model.state.inline ? 'combobox' : undefined; },
    get autocomplete() { return inputLike() ? 'off' : undefined; }, get spellcheck() { return inputLike() ? 'false' : undefined; },
    get autocorrect() { return inputLike() ? 'off' : undefined; }, get autocapitalize() { return inputLike() ? 'none' : undefined; },
    get value() { return composingValue() ?? model.state.inputValue; },
    get disabled() { return disabled(); }, get readonly() { return model.state.readOnly; },
    get required() { return model.state.selectionMode === 'none' && model.state.required; },
    get name() { return model.state.selectionMode === 'none' && !positioning ? model.state.name : undefined; }, get form() { return model.state.form; },
    get 'aria-expanded'() { return inputLike() || model.state.open || model.state.inline ? Boolean(model.state.open || model.state.inline) : undefined; }, get 'aria-haspopup'() { return inputLike() || model.state.open || model.state.inline ? model.state.grid ? 'grid' : 'listbox' : undefined; },
    get 'aria-controls'() { return model.state.open || model.state.inline ? model.state.listElement?.id : undefined; },
    get 'aria-autocomplete'() { return inputLike() || model.state.open || model.state.inline ? model.state.readOnly ? 'none' : model.props.autoComplete ?? 'list' : undefined; },
    get 'aria-activedescendant'() { const index = model.state.activeIndex; return index == null ? undefined : `${model.state.id}-${index}`; },
    get 'aria-readonly'() { return model.state.readOnly || undefined; }, get 'aria-required'() { return model.state.required || undefined; },
    get 'aria-labelledby'() { return labelable?.labelId; },
    onFocus() {
      model.field?.setFocused(true);
      const index = lastActiveIndex; lastActiveIndex = null;
      if (model.state.inline && index != null && Object.hasOwn(model.values(), index)) model.context.setIndices({ activeIndex: index });
    },
    onBlur() {
      model.field?.setFocused(false); model.field?.setTouched(true);
      if (model.state.inline && model.state.autoHighlight !== 'always') {
        model.context.discardPendingHighlight();
        if (model.state.activeIndex != null) { lastActiveIndex = model.state.activeIndex; model.context.setIndices({ activeIndex: null }); }
      }
      if (model.field?.validationMode === 'onBlur') void model.field.validation.commit(model.fieldValue());
    },
    onCompositionStart(event: CompositionEvent & { currentTarget: HTMLInputElement }) {
      if (platform.os.android) return;
      composing = true; setComposingValue(event.currentTarget.value);
    },
    onCompositionEnd(event: CompositionEvent & { currentTarget: HTMLInputElement }) {
      composing = false; setComposingValue(null);
      model.context.setInputValue(event.currentTarget.value, createChangeEventDetails('input-change', event));
      restoreControlledInput(event.currentTarget);
    },
    onInput(event: InputEvent & { currentTarget: HTMLInputElement }) {
      if (disabled() || model.state.readOnly) return;
      const next = event.currentTarget.value;
      const typed = composing || Boolean(event.inputType && event.inputType !== 'insertReplacementText');
      if (composing) setComposingValue(next);
      else {
        const result = model.context.setInputValue(next, createChangeEventDetails('input-change', event));
        if (!result.accepted) { event.currentTarget.value = String(model.state.inputValue ?? ''); return; }
        if (result.controlled) restoreControlledInput(event.currentTarget);
        if (!next && !inside() && model.state.selectionMode === 'single') model.context.setSelectedValue(null, createChangeEventDetails('input-clear', event));
      }
      if (!next && !model.state.openOnInputClick && !inside()) model.context.setOpen(false, createChangeEventDetails('input-clear', event));
      if (next.trim() && typed) model.context.setOpen(true, createChangeEventDetails('input-change', event));
      if (model.state.open && model.state.activeIndex != null && (!model.state.autoHighlight || composing && next.trim() === '')) clearHighlight(event);
    },
    onKeyDown(event: KeyboardEvent & { currentTarget: HTMLInputElement }) {
      if (event.isComposing || composing || event.keyCode === 229 || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey || disabled()) return;
      const input = event.currentTarget;
      if (model.state.readOnly) {
        if (event.key === 'Enter' && model.state.open && model.state.activeIndex != null) { event.preventDefault(); event.stopPropagation(); }
        return;
      }
      if (event.key === 'Home' || event.key === 'End') {
        event.preventDefault(); event.stopPropagation();
        const end = event.key === 'End';
        const rtl = direction() === 'rtl';
        const cursor = (platform.engine.gecko && rtl ? !end : end) ? input.value.length : 0;
        input.setSelectionRange(cursor, cursor); input.scrollLeft = end ? (rtl ? -1 : 1) * (input.scrollWidth - input.clientWidth) : 0;
        return;
      }
      if (event.key === 'Enter' && model.state.open && model.state.activeIndex != null) {
        event.preventDefault(); event.stopPropagation();
        if (!model.state.readOnly) clickHighlightedItem(model, model.state.activeIndex, event);
        return;
      }
      if (event.key === 'Escape' && !model.state.mounted) {
        const details = createChangeEventDetails('escape-key', event);
        const hadValue = model.state.hasSelectedValue;
        model.context.setInputValue('', details);
        model.context.setSelectedValue(model.state.selectionMode === 'multiple' ? [] : null, details);
        if (hadValue && !model.state.inline && !details.isPropagationAllowed) event.stopPropagation();
      }
      if (chips && event.key === 'Backspace' && input.value === '' && chips.highlightedChipIndex === undefined && Array.isArray(model.state.selectedValue)) {
        const values = model.state.selectedValue;
        if (values.length) {
          const removalIndex = chips.chipsRef.current.length > 0 ? chips.chipsRef.current.length - 1 : values.length - 1;
          clearHighlight(event); model.context.setSelectedValue(values.filter((_, i) => i !== removalIndex), createChangeEventDetails('none', event)); return;
        }
      }
      if (chips) {
        const previous = chips.highlightedChipIndex;
        const [back, forward] = getChipNavigationKeys(direction());
        const count = chips.chipsRef.current.length;
        let next: number | undefined;
        if (previous !== undefined) {
          if (event.key === back) { event.preventDefault(); next = previous > 0 ? previous - 1 : undefined; }
          else if (event.key === forward) { event.preventDefault(); next = previous < count - 1 ? previous + 1 : undefined; }
          else if (event.key === 'Backspace' || event.key === 'Delete') { event.preventDefault(); next = getIndexAfterChipRemoval(previous, model.state.selectedValue.length); clearHighlight(event); }
        } else if (event.key === back && (input.selectionStart ?? 0) === 0 && model.state.hasSelectedValue) { event.preventDefault(); next = count > 0 ? count - 1 : undefined; }
        chips.setHighlightedChipIndex(next);
        if (next != null) chips.chipsRef.current[next]?.focus(); else if (previous != null) model.state.inputElement?.focus();
      }
      if (event.key === 'Enter' && model.state.open && !model.state.inline) model.context.setOpen(false, createChangeEventDetails('none', event));
    },
  };
  function inputLike() { return model.state.inputElement == null || model.state.inputElement.tagName === 'INPUT'; }
  function restoreControlledInput(element: HTMLInputElement) {
    queueMicrotask(() => untrack(() => { const value = String(model.state.inputValue ?? ''); if (element.isConnected && !composing && element.value !== value) element.value = value; }));
  }
  function InputElement() { return createRenderElement('input', props, {
    state, get ref() { return [props.ref, setInput]; }, stateAttributesMapping: triggerStateAttributesMapping,
    get props() {
      const external = omit(props, 'class', 'style', 'render', 'ref', 'disabled', 'id');
      return [model.state.inputProps, model.state.triggerProps, defaults, !positioning ? model.field?.validation.getValidationProps(disabled()) : undefined, external];
    },
  }); }
  return <>{model.state.open && (!inside() || model.state.modal) && <ComboboxInternalDismissButton ref={(element) => { model.context.startDismissRef.current = element; }} />}
    {positioning ? <FieldRootContext value={null}><InputElement /></FieldRootContext> : <InputElement />}</>;
}
export namespace ComboboxInput { export type Props = ComboboxInputProps; export type State = ComboboxInputState }
