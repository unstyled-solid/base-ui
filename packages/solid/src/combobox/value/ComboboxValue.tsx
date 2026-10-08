import type { JSX } from '@solidjs/web';
import { resolveSelectedLabel, resolveMultipleLabels, hasNullItemLabel } from '../../internals/resolveValueLabel';
import { useComboboxRootContext } from '../root/ComboboxRootContext';
export interface ComboboxValueState {}
export interface ComboboxValueProps { children?: JSX.Element | ((selectedValue: any) => JSX.Element); placeholder?: JSX.Element }
export function ComboboxValue(props: ComboboxValueProps) {
  const model = useComboboxRootContext();
  const content = () => {
    if (typeof props.children === 'function') return props.children(model.state.selectedValue);
    if (props.children != null) return props.children;
    if (!model.state.hasSelectedValue && props.placeholder != null && !hasNullItemLabel(model.state.items)) return props.placeholder;
    return model.state.selectionMode === 'multiple' && Array.isArray(model.state.selectedValue)
      ? resolveMultipleLabels(model.state.selectedValue, model.state.items, model.derived.collection ? model.derived.label : model.props.itemToStringLabel)
      : resolveSelectedLabel(model.state.selectedValue, model.state.items, model.derived.collection ? model.derived.label : model.props.itemToStringLabel);
  };
  return <>{content()}</>;
}
export namespace ComboboxValue { export type Props = ComboboxValueProps; export type State = ComboboxValueState }
