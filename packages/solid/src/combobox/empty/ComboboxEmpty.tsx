import { omit } from 'solid-js';
import type { BaseUIComponentProps } from '../../internals/types';
import { createRenderElement } from '../../internals/createRenderElement';
import { useComboboxRootContext } from '../root/ComboboxRootContext';
import { createInitialLiveRegionTextMutation } from '../../internals/createInitialLiveRegionTextMutation';
export interface ComboboxEmptyState {}
export interface ComboboxEmptyProps extends BaseUIComponentProps<'div', ComboboxEmptyState> {}
export function ComboboxEmpty(props: ComboboxEmptyProps) {
  const model = useComboboxRootContext();
  const emptyRef = createInitialLiveRegionTextMutation<HTMLDivElement>();
  return createRenderElement('div', props, { get ref() { return [props.ref, model.context.emptyRef, emptyRef]; }, props: [{ role: 'status', 'aria-live': 'polite', 'aria-atomic': true,
    get children() { return model.derived.filteredItems.length === 0 ? props.children : null; } }, omit(props, 'class', 'style', 'render', 'ref', 'children')] });
}
export namespace ComboboxEmpty { export type Props = ComboboxEmptyProps; export type State = ComboboxEmptyState }
