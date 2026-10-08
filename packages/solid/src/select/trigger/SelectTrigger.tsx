import { createEffect, omit, onCleanup } from 'solid-js';
import type { BaseUIComponentProps } from '../../internals/types';
import type { FieldRootState } from '../../internals/field-root-context';
import type { Side } from '../../internals/createAnchorPositioning';
import { createRenderElement } from '../../internals/createRenderElement';
import { createButton } from '../../internals/use-button';
import { createTimeout } from '../../utils/createTimeout';
import { contains, getTarget } from '../../utils/shadowDom';
import { isMouseWithinBounds } from '../../utils/getPseudoElementBounds';
import { useFieldRootContext } from '../../internals/field-root-context';
import { useLabelableContext } from '../../internals/labelable-provider';
import { createLabelableId } from '../../internals/labelable-provider/createLabelableId';
import { createSetFieldFocused } from '../../internals/field-root-context/createSetFieldFocused';
import { fieldValidityMapping } from '../../internals/field-constants/constants';
import { createChangeEventDetails } from '../../internals/createBaseUIEventDetails';
import { mergeProps } from '../../merge-props';
import { useSelectRootContext } from '../root/SelectRootContext';

export function SelectTrigger(props: SelectTriggerProps) {
  const model = useSelectRootContext();
  const field = useFieldRootContext();
  const labelable = useLabelableContext();
  createLabelableId({ get id() { return typeof props.id === 'string' ? props.id : undefined; } });
  const disabled = () => model.disabled || !!props.disabled;
  const setFocused = createSetFieldFocused(disabled, () => model.triggerElement);
  const button = createButton({ get disabled() { return disabled(); }, get native() { return props.nativeButton ?? true; } });
  const selectedDelay = createTimeout();
  const focusDelay = createTimeout();
  const mouseDelay = createTimeout();
  let removeRelease: (() => void) | undefined;
  onCleanup(() => removeRelease?.());
  createEffect(() => model.open, open => {
    if (open) selectedDelay.start(400, () => {
      model.selection.allowSelectedMouseUp = true;
      model.selection.allowUnselectedMouseUp = true;
    });
    else {
      model.selection.allowSelectedMouseUp = false;
      model.selection.allowUnselectedMouseUp = false;
      model.selection.dragY = 0;
      mouseDelay.clear(); removeRelease?.();
    }
    return selectedDelay.clear;
  });
  createEffect(() => ({ element: model.triggerElement, id: typeof props.id === 'string' ? props.id : model.id() }), ({ element, id }) => {
    if (element) return model.popup.registerTrigger(id, element);
  });
  const state: SelectTriggerState = {
    get disabled() { return disabled(); }, get open() { return model.open; },
    get readOnly() { return model.readOnly; }, get value() { return model.value.value(); },
    get placeholder() { return !model.hasSelectedValue; },
    get popupSide() { return model.mounted && model.positionerElement ? model.popupSide() : null; },
    get touched() { return field?.state.touched ?? false; }, get dirty() { return field?.state.dirty ?? false; },
    get valid() { return field?.state.valid ?? null; }, get filled() { return field?.state.filled ?? false; },
    get focused() { return field?.state.focused ?? false; },
  };
  return createRenderElement<SelectTriggerState, HTMLElement>('button', props, {
    state, ref: [model.setTriggerElement, button.buttonRef],
    propGetter(external) {
      const buttonProps = button.getButtonProps(external);
      const described = labelable?.getDescriptionProps(buttonProps) ?? buttonProps;
      return mergeProps<any>(field?.validation.getValidationProps(disabled(), described) ?? described, { role: 'combobox' });
    },
    stateAttributesMapping: {
      ...fieldValidityMapping,
      open: value => value ? { 'data-popup-open': '', 'data-pressed': '' } : null,
      value: null,
      popupSide: value => value ? { 'data-popup-side': value } : null,
    },
    props: [external => mergeProps<any>(external, model.triggerProps()), {
      get id() { return props.id ?? model.id(); }, role: 'combobox',
      get 'aria-expanded'() { return model.open; }, 'aria-haspopup': 'listbox',
      get 'aria-controls'() { return model.open ? model.listElement?.id ?? model.popupElement?.id : undefined; },
      get 'aria-labelledby'() { return labelable?.labelId ?? model.labelId; },
      get 'aria-readonly'() { return model.readOnly || undefined; },
      get 'aria-required'() { return model.props.required || undefined; },
      get tabindex() { return disabled() ? -1 : 0; },
      onFocus(event: FocusEvent) {
        if (disabled()) return;
        setFocused(true);
        if (model.open && model.alignment()) model.setOpen(false, createChangeEventDetails('none', event));
        focusDelay.start(0, () => model.setForceMount(true));
      },
      onBlur(event: FocusEvent) {
        if (contains(model.positionerElement, event.relatedTarget as Element | null)) return;
        field?.setTouched(true); setFocused(false);
        if (field?.validationMode === 'onBlur') void field.validation.commit(model.value.value());
      },
      onMouseDown(event: MouseEvent) {
        if (model.open || disabled()) return;
        const trigger = event.currentTarget as HTMLElement;
        removeRelease?.();
        const release = (event: MouseEvent) => {
          const target = getTarget(event) as Element | null;
          if (contains(trigger, target) || contains(model.positionerElement, target) || isMouseWithinBounds(event, trigger)) return;
          model.setOpen(false, createChangeEventDetails('cancel-open', event));
        };
        mouseDelay.start(0, () => {
          trigger.ownerDocument.addEventListener('mouseup', release, { once: true });
          removeRelease = () => trigger.ownerDocument.removeEventListener('mouseup', release);
        });
      },
    }, omit(props, 'class', 'style', 'render', 'nativeButton', 'disabled')],
  });
}
export interface SelectTriggerState extends FieldRootState { open: boolean; readOnly: boolean; popupSide: Side | null; value: any; placeholder: boolean }
export interface SelectTriggerProps extends BaseUIComponentProps<'button', SelectTriggerState> { nativeButton?: boolean; disabled?: boolean }
export namespace SelectTrigger { export type Props = SelectTriggerProps; export type State = SelectTriggerState }
