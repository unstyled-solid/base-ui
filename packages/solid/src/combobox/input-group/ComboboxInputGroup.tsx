import { merge, omit } from 'solid-js';
import type { BaseUIComponentProps } from '../../internals/types';
import { createRenderElement } from '../../internals/createRenderElement';
import { contains } from '../../utils/shadowDom';
import { useComboboxRootContext } from '../root/ComboboxRootContext';
import { triggerStateAttributesMapping } from '../utils/stateAttributesMapping';
import { handleInputPress } from '../utils/handleInputPress';
import type { ComboboxTriggerState } from '../trigger/ComboboxTrigger';
import { createFieldPartState } from '../utils/fieldState';
export interface ComboboxInputGroupState extends ComboboxTriggerState {}
export interface ComboboxInputGroupProps extends BaseUIComponentProps<'div', ComboboxInputGroupState> {}
export function ComboboxInputGroup(props: ComboboxInputGroupProps) {
  const model = useComboboxRootContext();
  const state = merge(createFieldPartState(model), { get open() { return model.state.open; }, get disabled() { return model.state.disabled; }, get readOnly() { return model.state.readOnly; },
    get popupSide() { return model.state.popupSide; }, get listEmpty() { return !model.derived.filteredItems.length; }, get placeholder() { return model.state.selectionMode !== 'none' && !model.state.hasSelectedValue; } });
  return createRenderElement('div', props, { state, get ref() { return [props.ref, model.setInputGroupElement]; }, stateAttributesMapping: triggerStateAttributesMapping,
    props: [{ role: 'group', onMouseDown(event: MouseEvent) { handleInputPress(event, model, model.state.disabled, (target) => contains(model.context.chipsContainerRef.current, target)); } },
      omit(props, 'class', 'style', 'render', 'ref')] });
}
export namespace ComboboxInputGroup { export type Props = ComboboxInputGroupProps; export type State = ComboboxInputGroupState }
