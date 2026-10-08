import { omit as omitProps, createSignal, onSettled } from 'solid-js';
import type { BaseUIComponentProps } from '../../internals/types';
import { createRenderElement } from '../../internals/createRenderElement';
import { useFilterDropdownItemContext } from '../root/FilterDropdownRootContext';
import { selectors } from '../store';
import { createInitialLiveRegionTextMutation } from '../../internals/createInitialLiveRegionTextMutation';
export interface FilterDropdownEmptyState {}
export interface FilterDropdownEmptyProps extends BaseUIComponentProps<'div', FilterDropdownEmptyState> {}
export function FilterDropdownEmpty(props: FilterDropdownEmptyProps) {
  const context = useFilterDropdownItemContext();
  const [ready, setReady] = createSignal(false);
  onSettled(() => { setReady(true); });
  const visible = () => ready() && selectors.isEmpty(context.store.state);
  const emptyRef = createInitialLiveRegionTextMutation<HTMLDivElement>(visible);
  const rest = omitProps(props, 'render', 'class', 'style', 'ref');
  return createRenderElement('div', props, {
    get enabled() { return visible(); },
    get ref() { return [props.ref, emptyRef]; },
    get props() { return [{ role: 'status', 'aria-live': 'polite', 'aria-atomic': 'true' }, rest]; },
  });
}
export namespace FilterDropdownEmpty { export type Props = FilterDropdownEmptyProps; export type State = FilterDropdownEmptyState }
