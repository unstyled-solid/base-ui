import { omit } from 'solid-js';
import type { JSX } from '@solidjs/web';
import type { BaseUIComponentProps } from '../../internals/types';
import { createRenderElement } from '../../internals/createRenderElement';
import { hasNullItemLabel, resolveMultipleLabels, resolveSelectedLabel } from '../../internals/resolveValueLabel';
import { useSelectRootContext } from '../root/SelectRootContext';

export function SelectValue(props: SelectValueProps) {
  const model = useSelectRootContext();
  const state: SelectValueState = { get value() { return model.value.value(); }, get placeholder() { return !model.hasSelectedValue; } };
  function children() {
    if (typeof props.children === 'function') return props.children(model.value.value());
    if (props.children != null) return props.children;
    if (!model.hasSelectedValue && props.placeholder != null && !hasNullItemLabel(model.props.items)) return props.placeholder;
    const value = model.value.value();
    return Array.isArray(value) ? resolveMultipleLabels(value, model.props.items, model.props.itemToStringLabel) : resolveSelectedLabel(value, model.props.items, model.props.itemToStringLabel);
  }
  return createRenderElement<SelectValueState, HTMLSpanElement>('span', props, {
    state, ref: model.setValueElement, stateAttributesMapping: { value: null },
    props: [{ get children() { return children(); } }, omit(props, 'class', 'style', 'render', 'children', 'placeholder')],
  });
}
export interface SelectValueState { value: any; placeholder: boolean }
export interface SelectValueProps extends Omit<BaseUIComponentProps<'span', SelectValueState>, 'children'> { children?: JSX.Element | ((value: any) => JSX.Element); placeholder?: JSX.Element }
export namespace SelectValue { export type Props = SelectValueProps; export type State = SelectValueState }
