import { omit } from 'solid-js';
import type { BaseUIComponentProps } from '../../internals/types';
import { createRenderElement } from '../../internals/createRenderElement';
import { createButton } from '../../internals/use-button';
import { createChangeEventDetails } from '../../internals/createBaseUIEventDetails';
import { findItemIndex } from '../../internals/itemEquality';
import { useComboboxRootContext } from '../root/ComboboxRootContext';
import { useComboboxChipContext } from '../chip/ComboboxChipContext';
export interface ComboboxChipRemoveState { disabled: boolean }
export interface ComboboxChipRemoveProps extends BaseUIComponentProps<'button', ComboboxChipRemoveState> { disabled?: boolean; nativeButton?: boolean }
export function ComboboxChipRemove(props: ComboboxChipRemoveProps) {
  const model = useComboboxRootContext(); const chip = useComboboxChipContext();
  const disabled = () => Boolean(model.state.disabled || props.disabled);
  const button = createButton({ get native() { return props.nativeButton ?? true; }, get disabled() { return disabled() || model.state.readOnly; }, focusableWhenDisabled: true });
  function remove(event: MouseEvent | KeyboardEvent) {
    if (disabled() || model.state.readOnly || chip.index == null || !Array.isArray(model.state.selectedValue)) return;
    const index = chip.index; const values = model.state.selectedValue;
    const removedIndex = findItemIndex(model.values(), values[index], model.state.isItemEqualToValue);
    const details = createChangeEventDetails('chip-remove-press', event);
    // Source clears virtual focus before the cancellable value request; cancellation
    // prevents removal independently of focus and propagation.
    if (removedIndex !== -1 && model.state.activeIndex === removedIndex) model.context.setIndices({ activeIndex: null, type: event.type === 'keydown' ? 'keyboard' : 'pointer', event });
    model.context.setSelectedValue(values.filter((_, i) => i !== index), details);
    model.state.inputElement?.focus();
    if (!details.isPropagationAllowed) event.stopPropagation();
    return details;
  }
  return createRenderElement('button', props, { state: { get disabled() { return disabled(); } }, get ref() { return [props.ref, button.buttonRef]; },
    props: [{ tabIndex: -1, onMouseDown(event: MouseEvent) { event.preventDefault(); }, onClick: remove,
      onKeyDown(event: KeyboardEvent) { if (event.key === 'Enter' || event.key === ' ') { const details = remove(event); if (details && !details.isPropagationAllowed) event.preventDefault(); } },
    }, omit(props, 'class', 'style', 'render', 'ref', 'disabled', 'nativeButton'), button.getButtonProps],
  });
}
export namespace ComboboxChipRemove { export type Props = ComboboxChipRemoveProps; export type State = ComboboxChipRemoveState }
