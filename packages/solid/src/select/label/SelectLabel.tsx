import { omit } from 'solid-js';
import type { BaseUIComponentProps } from '../../internals/types';
import type { FieldRootState } from '../../internals/field-root-context';
import { useFieldRootContext } from '../../internals/field-root-context';
import { createRenderElement } from '../../internals/createRenderElement';
import { createLabel } from '../../internals/labelable-provider/createLabel';
import { DEFAULT_FIELD_ROOT_STATE, fieldValidityMapping } from '../../internals/field-constants/constants';
import { useSelectRootContext } from '../root/SelectRootContext';
export function SelectLabel(props: SelectLabelProps) {
  const model = useSelectRootContext();
  const field = useFieldRootContext();
  const labelProps = createLabel({
    get id() { return `${model.id()}-label`; },
    get fallbackControlId() { return model.triggerElement?.id ?? model.id(); },
    setLabelId: model.setLabelId,
  });
  return createRenderElement('div', props, {
    get state() { return field?.state ?? DEFAULT_FIELD_ROOT_STATE; },
    stateAttributesMapping: fieldValidityMapping,
    props: [labelProps, omit(props as SelectLabelProps & { id?: string }, 'class', 'style', 'render', 'id')],
  });
}
export type SelectLabelState = FieldRootState;
export interface SelectLabelProps extends Omit<BaseUIComponentProps<'div', SelectLabelState>, 'id'> {}
export namespace SelectLabel { export type Props = SelectLabelProps; export type State = SelectLabelState }
