import { createEffect, createSignal, omit } from 'solid-js';
import type { ComponentProps, JSX } from '@solidjs/web';
import { platform } from '../../utils/platform';
import { warn } from '../../utils/warn';
import { createCompositeListItem } from '../../internals/composite';
import { useDirection } from '../../internals/direction-context/DirectionContext';
import { createSetFieldFocused } from '../../internals/field-root-context/createSetFieldFocused';
import { createRenderElement } from '../../internals/createRenderElement';
import { isDefaultPrevented } from '../../merge-props/mergeProps';
import type { BaseUIComponentProps } from '../../internals/types';
import { createChangeEventDetails, createGenericEventDetails } from '../../internals/createBaseUIEventDetails';
import { useOTPFieldRootContext } from '../root/OTPFieldRootContext';
import type { OTPFieldRootState } from '../root/OTPFieldRoot';
import { inputStateAttributesMapping } from '../utils/stateAttributesMapping';
import { normalizeOTPValueWithDetails, removeOTPCharacter, replaceOTPValue } from '../utils/otp';

/** A single OTP slot. Indexing belongs to the shared, DOM-ordered composite list. */
export function OTPFieldInput(props: OTPFieldInputProps) {
  const root = useOTPFieldRootContext();
  const item = createCompositeListItem({ guess: true });
  const index = () => item.index ?? 0;
  const [input, setInput] = createSignal<HTMLInputElement | null>(null);
  const setFocused = createSetFieldFocused(() => root.disabled, input, root.setFocused);
  const direction = useDirection();
  const [composition, setComposition] = createSignal<string | null>(null);
  // IME events may arrive in one turn. This imperative flag owns the transaction;
  // the signal only publishes its displayed text (RC13 getters are staged).
  let composing = false;
  const slotValue = () => root.value[index()] ?? '';
  const state: OTPFieldInputState = {
    get complete() { return root.state.complete; },
    get disabled() { return root.state.disabled; },
    get length() { return root.state.length; },
    get readOnly() { return root.state.readOnly; },
    get required() { return root.state.required; },
    get focused() { return root.state.focused; },
    get dirty() { return root.state.dirty; },
    get touched() { return root.state.touched; },
    get valid() { return root.state.valid; },
    get filled() { return slotValue() !== ''; },
    get value() { return slotValue(); },
    get index() { return index(); },
  };

  function restore(target: HTMLInputElement, select = false) {
    target.value = slotValue();
    if (select && target.value !== '') target.select();
  }
  function commitValue(raw: string, event: Event, paste: boolean, target: HTMLInputElement) {
    root.beginEdit();
    const [digits, rejected] = normalizeOTPValueWithDetails(raw, root.length, root.validationType, root.normalizeValue);
    if (rejected) root.reportValueInvalid(raw, paste
      ? createGenericEventDetails('input-paste', event as ClipboardEvent)
      : createGenericEventDetails('input-change', event));
    if (digits === '') {
      if (!paste && raw === '') root.setValue(removeOTPCharacter(root.value, index()), createChangeEventDetails('input-clear', event));
      if (!paste) restore(target, raw !== '');
      return;
    }
    const accepted = root.setValue(
      replaceOTPValue(root.value, index(), digits, root.length, root.validationType, root.normalizeValue),
      paste ? createChangeEventDetails('input-paste', event as ClipboardEvent) : createChangeEventDetails('input-change', event),
    );
    // Native input has already mutated even if the controlled owner rejects it.
    // Restore synchronously; the accepted render will publish the candidate later.
    if (!paste) restore(target);
    if (accepted) root.queueFocusInput(Math.min(index() + digits.length, root.length - 1), accepted);
  }
  const inputProps: JSX.InputHTMLAttributes<HTMLInputElement> = {
    get id() { return root.getInputId(index()); },
    get value() { return composition() ?? slotValue(); },
    get type() { return root.mask ? 'password' : 'text'; },
    get inputmode() { return root.inputMode; },
    get autocomplete() { return index() === 0 ? root.autoComplete : 'off'; },
    autocorrect: 'off', spellcheck: 'false',
    get enterkeyhint() { return index() === root.length - 1 ? 'done' : 'next'; },
    get maxlength() { return index() === 0 ? root.length : undefined; },
    get tabindex() { return root.activeIndex === index() ? 0 : -1; },
    get disabled() { return root.disabled; },
    get form() { return root.form; },
    get pattern() { return root.pattern; },
    get readonly() { return root.readOnly; },
    get required() { return root.required; },
    get 'aria-labelledby'() { return index() !== 0 && props['aria-label'] != null ? undefined : props['aria-labelledby'] ?? root.inputAriaLabelledBy; },
    get 'aria-label'() { return index() === 0 ? undefined : props['aria-label']; },
    get 'aria-invalid'() { return !root.disabled && root.invalid ? 'true' : undefined; },
    onMouseDown(event) {
      if (isDefaultPrevented(event) || root.disabled) return;
      event.preventDefault();
      root.focusInput(index());
    },
    onFocus(event) {
      if (isDefaultPrevented(event) || root.disabled) return;
      setFocused(true);
      root.handleInputFocus(index(), event.currentTarget);
    },
    onBlur(event) {
      if (!isDefaultPrevented(event)) root.handleInputBlur(event);
    },
    onCompositionStart() {
      root.beginEdit();
      if (!platform.os.android) { composing = true; setComposition(slotValue()); }
    },
    onCompositionEnd(event) {
      if (!composing) return;
      composing = false;
      setComposition(null);
      if (!root.disabled && !root.readOnly) commitValue(event.currentTarget.value, event, false, event.currentTarget);
      else restore(event.currentTarget);
    },
    onInput(event) {
      if (isDefaultPrevented(event) || root.disabled || root.readOnly) { restore(event.currentTarget); return; }
      if (composing) { setComposition(event.currentTarget.value); return; }
      commitValue(event.currentTarget.value, event, false, event.currentTarget);
    },
    onKeyDown(event) {
      if (isDefaultPrevented(event) || root.disabled || composing) return;
      const lastIndex = Math.max(root.length - 1, 0);
      const endIndex = Math.min(root.value.length, lastIndex);
      const boundary = (event.ctrlKey || event.metaKey) && !event.altKey;
      const previousKey = direction() === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
      const nextKey = direction() === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
      function stop() { event.preventDefault(); event.stopPropagation(); }
      if (event.key === previousKey) { stop(); root.focusInput(boundary ? 0 : Math.max(0, index() - 1)); return; }
      if (event.key === nextKey) { stop(); root.focusInput(boundary ? endIndex : Math.min(lastIndex, index() + 1)); return; }
      if (event.key === 'Home' || event.key === 'ArrowUp') { stop(); root.focusInput(0); return; }
      if (event.key === 'End' || event.key === 'ArrowDown') { stop(); root.focusInput(endIndex); return; }
      if (root.readOnly) return;
      function keyboardValue(next: string, target: number) {
        const accepted = root.setValue(next, createChangeEventDetails('keyboard', event));
        if (accepted) root.queueFocusInput(target, accepted);
      }
      if (event.key === 'Backspace' && boundary) { stop(); keyboardValue('', 0); return; }
      if (event.key === 'Delete') { stop(); keyboardValue(removeOTPCharacter(root.value, index()), index()); return; }
      const target = event.currentTarget;
      const fullSelection = target.selectionStart === 0 && target.selectionEnd === target.value.length;
      if (event.key.length === 1 && fullSelection && slotValue() === event.key) {
        root.beginEdit();
        stop();
        if (index() < root.length - 1) root.focusInput(index() + 1);
        return;
      }
      if (event.key === 'Backspace') {
        stop();
        const previous = Math.max(0, index() - 1);
        keyboardValue(removeOTPCharacter(root.value, slotValue() === '' ? previous : index()), previous);
      }
    },
    onPaste(event) {
      if (isDefaultPrevented(event) || root.disabled || root.readOnly) return;
      let raw: string;
      try { raw = event.clipboardData?.getData('text/plain') ?? ''; }
      catch {
        if (process.env.NODE_ENV !== 'production') warn('<OTPField.Input> could not read clipboard text during paste handling.');
        return;
      }
      event.preventDefault();
      commitValue(raw, event, true, event.currentTarget);
    },
  };
  if (process.env.NODE_ENV !== 'production') {
    createEffect(() => [index(), props['aria-label'], input()] as const, ([slot, label, node]) => {
      if (slot === 0 && label != null && node && !node.labels?.length) {
        warn('<OTPField.Input> ignores `aria-label` on the first input. Use a `<label>` or `<Field.Label>` to label the OTP field.');
      }
    });
  }
  const elementProps = omit(props, 'aria-label', 'aria-labelledby', 'render', 'class', 'style', 'ref');
  const inputRef = (node: HTMLInputElement | null) => { setInput(node); };
  return createRenderElement('input', props, {
    get ref() { return [props.ref, item.ref, inputRef]; },
    state, props: [inputProps, elementProps], stateAttributesMapping: inputStateAttributesMapping,
  });
}

export interface OTPFieldInputState extends Omit<OTPFieldRootState, 'filled' | 'value'> {
  filled: boolean;
  index: number;
  value: string;
}
export interface OTPFieldInputProps extends BaseUIComponentProps<'input', OTPFieldInputState, ComponentProps<'input'>> {}
export namespace OTPFieldInput {
  export type State = OTPFieldInputState;
  export type Props = OTPFieldInputProps;
}
