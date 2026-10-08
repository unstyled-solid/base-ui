import { createEffect, omit } from 'solid-js';
import type { BaseUIComponentProps } from '../../internals/types';
import { createRenderElement } from '../../internals/createRenderElement';
import { createLabel } from '../../internals/labelable-provider/createLabel';
import type { FieldRootState } from '../../internals/field-root-context';
import { useComboboxRootContext } from '../root/ComboboxRootContext';
import { error } from '../../utils/error';
import { fieldValidityMapping } from '../../internals/field-constants/constants';
import { createFieldPartState } from '../utils/fieldState';
export interface ComboboxLabelState extends FieldRootState {}
export interface ComboboxLabelProps extends Omit<BaseUIComponentProps<'div', ComboboxLabelState>, 'id'> {}
export function ComboboxLabel(props: ComboboxLabelProps) {
  const model = useComboboxRootContext();
  if (process.env.NODE_ENV !== 'production') createEffect(() => ({ input: model.state.inputElement, inside: model.state.inputInsidePopup }), ({ input, inside }) => {
    if (input && !inside) error('<Combobox.Label> labels <Combobox.Trigger> only. When <Combobox.Input> is the form control, use a native <label> or <Field.Label> instead.');
  });
  const label = createLabel({ get id() { return `${model.state.id}-label`; },
    get fallbackControlId() { return model.state.triggerElement?.id ?? (model.state.inputInsidePopup ? model.state.id : undefined); },
    setLabelId: model.setLabelId,
  });
  return createRenderElement('div', props, { get ref() { return props.ref; }, state: createFieldPartState(model), stateAttributesMapping: fieldValidityMapping, props: [label, omit(props as ComboboxLabelProps & { id?: string }, 'class', 'style', 'render', 'ref', 'id')] });
}
export namespace ComboboxLabel { export type Props = ComboboxLabelProps; export type State = ComboboxLabelState }
