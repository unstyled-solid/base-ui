import { createSignal, omit, onSettled } from 'solid-js';
import type { BaseUIComponentProps } from '../../internals/types';
import { createRenderElement } from '../../internals/createRenderElement';
import { createButton } from '../../internals/use-button';
import { createCompositeListItem } from '../../internals/composite';
import { createChangeEventDetails } from '../../internals/createBaseUIEventDetails';
import { defaultItemEquality, removeItem } from '../../internals/itemEquality';
import { mergeProps } from '../../merge-props';
import { isVirtualClick } from '../../floating-ui-react/utils/event';
import { useSelectRootContext } from '../root/SelectRootContext';
import { SelectItemContext } from './SelectItemContext';
import type { SelectItemRecord } from '../store';

export function SelectItem(props: SelectItemProps) {
  const model = useSelectRootContext();
  const [element, setElement] = createSignal<HTMLElement | null>(null);
  const [text, setText] = createSignal<HTMLElement | null>(null);
  const disabled = () => model.disabled || !!props.disabled;
  const composite = createCompositeListItem({ get label() { return props.label; }, metadata: { get value() { return props.value === undefined ? null : props.value; } }, textRef: text, guess: true });
  const record: SelectItemRecord = {
    get value() { return props.value === undefined ? null : props.value; },
    get index() { return composite.index; }, get disabled() { return disabled(); },
    get label() { return props.label; }, get element() { return element(); }, get text() { return text(); },
  };
  const token = Symbol('Select.Item');
  // Register the live record for the item lifetime. Re-registering on index/text
  // changes publishes incomplete lists during initial mounting and can clear a
  // valid selection before the remaining items have reported their refs.
  onSettled(() => model.registry.registerItem(token, record));
  const selected = () => model.isSelected(record.value);
  const highlighted = () => model.activeIndex !== null && model.activeIndex === composite.index;
  const button = createButton({ get disabled() { return disabled(); }, focusableWhenDisabled: true, get native() { return props.nativeButton ?? false; }, composite: true });
  let pointerType = 'mouse';
  let allowMouseSelection = false;
  function commit(event: MouseEvent | KeyboardEvent | PointerEvent) {
    if (disabled() || model.readOnly) return;
    if (model.multiple) {
      const current = model.value.value();
      const values = Array.isArray(current) ? current : [];
      model.setValue(selected() ? removeItem(values, record.value, model.props.isItemEqualToValue ?? defaultItemEquality) : [...values, record.value], createChangeEventDetails('item-press', event));
    } else {
      model.setValue(record.value, createChangeEventDetails('item-press', event));
      model.setOpen(false, createChangeEventDetails('item-press', event));
    }
  }
  const state: SelectItemState = { get disabled() { return disabled(); }, get selected() { return selected(); }, get highlighted() { return highlighted(); } };
  const Host = () => createRenderElement<SelectItemState, HTMLElement>('div', props, {
    state, ref: [setElement, button.buttonRef, composite.ref],
    propGetter: button.getButtonProps,
    props: [external => mergeProps<any>(external, model.itemProps()), {
      role: 'option', get 'aria-selected'() { return selected(); },
      get tabindex() { return model.open && highlighted() ? 0 : -1; },
      onKeyDown(event: KeyboardEvent) {
        model.setActiveIndex(composite.index);
        if (event.key === ' ' && model.typing) event.preventDefault();
      },
      onClick(event: MouseEvent) {
        const clickPointer = (event as PointerEvent).pointerType;
        const virtual = pointerType !== 'touch' && isVirtualClick(event) && (clickPointer !== undefined || highlighted());
        const invalid = pointerType !== 'touch' && !virtual && !allowMouseSelection;
        allowMouseSelection = false;
        if (!invalid) commit(event);
      },
      onPointerEnter(event: PointerEvent) { pointerType = event.pointerType; },
      onPointerMove(event: PointerEvent) {
        if (event.pointerType === 'mouse' && event.buttons === 1) {
          model.selection.dragY += event.movementY;
          if (model.selection.dragY ** 2 >= 64) model.selection.allowUnselectedMouseUp = true;
        }
      },
      onPointerDown(event: PointerEvent) { pointerType = event.pointerType; allowMouseSelection = true; model.selection.dragY = 0; },
      onMouseUp() {
        model.selection.dragY = 0;
        if (disabled() || pointerType === 'touch' || allowMouseSelection) return;
        if (selected() ? !model.selection.allowSelectedMouseUp : !model.selection.allowUnselectedMouseUp) return;
        allowMouseSelection = true;
        element()?.click();
        allowMouseSelection = false;
      },
    }, omit(props, 'class', 'style', 'render', 'value', 'label', 'disabled', 'nativeButton')],
  });
  return <SelectItemContext value={{ record, get selected() { return selected(); }, setText }}><Host /></SelectItemContext>;
}
export interface SelectItemState { disabled: boolean; selected: boolean; highlighted: boolean }
export interface SelectItemProps extends Omit<BaseUIComponentProps<'div', SelectItemState>, 'id'> { value?: any; disabled?: boolean; nativeButton?: boolean; label?: string }
export namespace SelectItem { export type Props = SelectItemProps; export type State = SelectItemState }
