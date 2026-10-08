import { createEffect, merge, omit, onCleanup, untrack } from 'solid-js';
import type { BaseUIComponentProps } from '../../internals/types';
import type { Side } from '../../internals/createAnchorPositioning';
import { createRenderElement } from '../../internals/createRenderElement';
import { createButton } from '../../internals/use-button';
import { createChangeEventDetails } from '../../internals/createBaseUIEventDetails';
import { useComboboxRootContext } from '../root/ComboboxRootContext';
import { triggerStateAttributesMapping } from '../utils/stateAttributesMapping';
import { getComboboxPopupId } from '../root/utils';
import { createFieldPartState } from '../utils/fieldState';
import { useLabelableContext } from '../../internals/labelable-provider/LabelableContext';
import type { FieldRootState } from '../../internals/field-root-context';
import { createTypeahead } from '../../floating-ui-react/hooks/createTypeahead';
import { createClick } from '../../floating-ui-react/hooks/createClick';
import { contains, getTarget } from '../../utils/shadowDom';
import { isMouseWithinBounds } from '../../utils/getPseudoElementBounds';
export interface ComboboxTriggerState extends FieldRootState { open: boolean; disabled: boolean; readOnly: boolean; popupSide: Side | null; listEmpty: boolean; placeholder: boolean }
export interface ComboboxTriggerProps extends BaseUIComponentProps<'button', ComboboxTriggerState> { disabled?: boolean; nativeButton?: boolean }
export function ComboboxTrigger(props: ComboboxTriggerProps) {
  const model = useComboboxRootContext();
  const labelable = useLabelableContext();
  const disabled = () => Boolean(props.disabled || model.state.disabled);
  const button = createButton({ get native() { return props.nativeButton ?? true; }, get disabled() { return disabled(); } });
  // Source Trigger temporarily assigns itself as useClick's DOM reference.
  // Project that trigger for the click consumer without replacing the input's
  // focus/positioning context or allocating a second floating engine.
  const clickState = new Proxy(model.floating.state, {
    get(target, key) { return key === 'domReferenceElement' ? model.state.triggerElement : Reflect.get(target, key, target); },
  });
  const clickContext = new Proxy(model.floating, {
    get(target, key) { return key === 'state' ? clickState : Reflect.get(target, key, target); },
  });
  const click = createClick(clickContext, { get enabled() { return !disabled(); }, event: 'mousedown' });
  let pointerType = '';
  let removeMouseUp = () => {};
  onCleanup(() => removeMouseUp());
  const typeahead = createTypeahead(model.floating, {
    get enabled() { return !model.state.open && !model.state.readOnly && !disabled() && model.state.selectionMode === 'single'; },
    listRef: model.context.labelsRef, elementsRef: model.context.listRef,
    get activeIndex() { return model.state.activeIndex; }, get selectedIndex() { return model.state.selectedIndex; },
    onMatch(index: number, event?: Event) {
      const value = model.values()[index];
      if (value !== undefined) model.context.setSelectedValue(value, createChangeEventDetails('none', event));
    },
  });
  const state: ComboboxTriggerState = merge(createFieldPartState(model), {
    get open() { return model.state.open; }, get disabled() { return disabled(); }, get readOnly() { return model.state.readOnly; },
    get popupSide() { return model.state.popupSide; }, get listEmpty() { return !model.derived.filteredItems.length; },
    get placeholder() { return model.state.selectionMode !== 'none' && !model.state.hasSelectedValue; },
  });
  const id = () => typeof props.id === 'string' ? props.id : model.state.inputInsidePopup ? model.state.id : undefined;
  createEffect(() => ({ id: id() ?? model.state.id, element: model.state.triggerElement }), ({ id, element }) => element ? model.popup.registerTrigger(id, element) : undefined);
  return createRenderElement('button', props, { state, get ref() { return [props.ref, button.buttonRef, model.setTriggerElement]; }, stateAttributesMapping: triggerStateAttributesMapping,
    props: [model.state.triggerProps, merge(() => click.reference ?? {}), merge(() => typeahead.reference ?? {}), {
      get id() { return id(); }, get tabIndex() { return model.state.inputInsidePopup ? 0 : -1; },
      get role() { return model.state.inputInsidePopup ? 'combobox' : undefined; }, get 'aria-expanded'() { return model.state.open; },
      get 'aria-haspopup'() { return model.state.inputInsidePopup ? 'dialog' : 'listbox'; },
      get 'aria-controls'() { return model.state.open ? model.state.inputInsidePopup ? model.state.popupId ?? getComboboxPopupId(model.state.id) : model.state.listElement?.id : undefined; },
      get 'aria-required'() { return model.state.inputInsidePopup && model.state.required || undefined; },
      get 'aria-readonly'() { return model.state.inputInsidePopup && model.state.readOnly || undefined; },
       get 'aria-labelledby'() { return labelable?.labelId ?? model.state.labelId; },
      onFocus() { model.field?.setFocused(true); if (!disabled()) model.context.forceMount(); },
      onBlur(event: FocusEvent) {
        if (contains(model.state.positionerElement, event.relatedTarget as Element | null)) return;
        model.field?.setTouched(true); model.field?.setFocused(false);
        if (model.field?.validationMode === 'onBlur') void model.field.validation.commit(model.fieldValue());
      },
      onPointerDown(event: PointerEvent) { pointerType = event.pointerType; }, onPointerEnter(event: PointerEvent) { pointerType = event.pointerType; },
      onMouseDown(event: MouseEvent) {
        if (disabled() || event.button !== 0) return;
        model.context.forceMount();
        if (pointerType !== 'touch') { model.state.inputElement?.focus(); if (!model.state.inputInsidePopup) event.preventDefault(); }
        if (!model.state.open && model.state.inputInsidePopup) {
          removeMouseUp();
          const doc = model.state.triggerElement?.ownerDocument;
          if (doc) {
            const released = (mouseEvent: MouseEvent) => untrack(() => {
              removeMouseUp();
              const trigger = model.state.triggerElement;
              const target = getTarget(mouseEvent) as Element | null;
              if (!trigger || contains(trigger, target) || contains(model.state.positionerElement, target) || contains(model.state.listElement, target) || isMouseWithinBounds(mouseEvent, trigger)) return;
              model.context.setOpen(false, createChangeEventDetails('cancel-open', mouseEvent));
            });
            doc.addEventListener('mouseup', released, { once: true });
            removeMouseUp = () => { doc.removeEventListener('mouseup', released); };
          }
        }
      },
      onKeyDown(event: KeyboardEvent) {
        if (disabled()) return;
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          event.preventDefault(); event.stopPropagation();
          model.context.setOpen(true, createChangeEventDetails('list-navigation', event)); model.state.inputElement?.focus();
        }
      },
    }, merge(() => model.field?.validation.getValidationProps(disabled()) ?? {}), omit(props, 'class', 'style', 'render', 'ref', 'disabled', 'nativeButton', 'id'), button.getButtonProps],
  });
}
export namespace ComboboxTrigger { export type Props = ComboboxTriggerProps; export type State = ComboboxTriggerState }
