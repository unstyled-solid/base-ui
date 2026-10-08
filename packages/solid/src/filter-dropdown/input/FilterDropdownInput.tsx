import { omit as omitProps, createEffect, createMemo, createSignal } from 'solid-js';
import type { BaseUIComponentProps, HTMLProps } from '../../internals/types';
import { createRenderElement } from '../../internals/createRenderElement';
import { createBaseUiId } from '../../internals/createBaseUiId';
import { createChangeEventDetails } from '../../internals/createBaseUIEventDetails';
import { platform } from '../../utils/platform';
import { useFilterDropdownItemContext, useFilterDropdownRootContext, useFilterDropdownValueContext } from '../root/FilterDropdownRootContext';
import { isRefocusingOwner, refocusOwner } from '../utils/refocusOwner';

export interface FilterDropdownInputState { highlighted: boolean }
export interface FilterDropdownInputProps extends Omit<BaseUIComponentProps<'input', FilterDropdownInputState>, 'id'> { id?: string | null }
export interface FilterDropdownInputHostProps extends FilterDropdownInputProps {
  activeItemId?: string;
  navigationProps?: HTMLProps;
}
export function FilterDropdownInput(props: FilterDropdownInputHostProps) {
  const context = useFilterDropdownRootContext();
  const items = useFilterDropdownItemContext();
  const value = useFilterDropdownValueContext();
  const id = createBaseUiId(() => props.id === null ? '' : props.id);
  let input: HTMLInputElement | null = null;
  const registerInput = (element: HTMLInputElement | null) => { input = element; };
  const ownerRef = createMemo(() => {
    const owner = context.focusOwnerRef;
    return (element: HTMLInputElement | null) => { owner.current = element; };
  });
  const [composingValue, setComposingValue] = createSignal<string | null>(null);
  const [edit, setEdit] = createSignal(0);
  let composing = false;
  const commit = (text: string, event: Event) => {
    context.onValueChange(text, createChangeEventDetails(text === '' ? 'input-clear' : 'input-change', event));
    setEdit(previous => previous + 1);
  };
  // Reconcile the native edit after staged host writes, including a rejected controlled proposal.
  // Accepted edits already agree with the DOM, preserving its selection/caret.
  createEffect(() => ({ edit: edit(), value: composingValue() ?? value() }), next => {
    if (input && input.value !== next.value) input.value = next.value;
  });
  const state: FilterDropdownInputState = { get highlighted() { return context.inputFocusVisible && (!context.keyboardModality || props.activeItemId == null); } };
  const rest = omitProps(props, 'render', 'class', 'style', 'ref', 'id', 'disabled', 'activeItemId', 'navigationProps');
  const defaults = {
    get id() { return id(); }, type: 'text', role: 'searchbox', inputmode: 'search', autocomplete: 'off',
    spellcheck: 'false', autocorrect: 'off', autocapitalize: 'none', 'aria-autocomplete': undefined,
    get disabled() { return context.disabled || props.disabled; },
    get 'aria-activedescendant'() { return props.activeItemId || undefined; },
    get 'aria-controls'() { return context.listId; },
    get value() { return composingValue() ?? value(); },
    onCompositionStart(event: CompositionEvent & { currentTarget: HTMLInputElement }) {
      if (platform.os.android) return;
      composing = true; setComposingValue(event.currentTarget.value);
    },
    onCompositionEnd(event: CompositionEvent & { currentTarget: HTMLInputElement }) {
      if (!composing) return;
      composing = false; setComposingValue(null); commit(event.currentTarget.value, event);
    },
    onInput(event: InputEvent & { currentTarget: HTMLInputElement }) {
      if (composing) setComposingValue(event.currentTarget.value);
      else commit(event.currentTarget.value, event);
    },
    onKeyDown() { context.setKeyboardModality(true); },
    onPointerDown() { context.setKeyboardModality(false); },
    onMouseEnter(event: MouseEvent & { currentTarget: HTMLInputElement }) {
      context.setKeyboardModality(false);
      if (context.open) refocusOwner(event.currentTarget);
    },
    onFocus(event: FocusEvent) {
      context.setInputFocusVisible(true);
      if (context.autoHighlight === 'always' || isRefocusingOwner()) return;
      if (event.relatedTarget !== null && items.listRef.current.some(item => item === event.relatedTarget)) context.setActiveIndex(null);
    },
    onBlur() { context.setInputFocusVisible(false); },
  };
  return createRenderElement('input', props, {
    state, get ref() { return [props.ref, registerInput, ownerRef()]; },
    get props() { return [props.navigationProps, defaults, rest]; },
  });
}
export namespace FilterDropdownInput { export type Props = FilterDropdownInputProps; export type State = FilterDropdownInputState }
