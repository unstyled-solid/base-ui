import { omit as omitProps } from 'solid-js';
import type { BaseUIComponentProps } from '../../internals/types';
import { createRenderElement } from '../../internals/createRenderElement';
import { createRenderedId } from '../../internals/resolveRenderedId';
import { useFilterDropdownRootContext } from '../root/FilterDropdownRootContext';
import { FilterDropdownGroupContext } from '../group/FilterDropdownGroupContext';
import { refocusOwner } from '../utils/refocusOwner';
export interface FilterDropdownListState {}
export interface FilterDropdownListProps extends Omit<BaseUIComponentProps<'div', FilterDropdownListState>, 'id'> { id?: string | null }
export function FilterDropdownList(props: FilterDropdownListProps) {
  const context = useFilterDropdownRootContext();
  const [id, registerId] = createRenderedId({
    get id() { return props.id === null ? '' : props.id; },
    get render() { return props.render; },
  }, () => context.defaultListId, context.setRenderedListId);
  const rest = omitProps(props, 'render', 'class', 'style', 'ref', 'id');
  const defaults = {
    tabindex: -1,
    get id() { return id(); },
    onFocus(event: FocusEvent & { currentTarget: HTMLDivElement }) {
      const owner = context.focusOwnerRef.current;
      if (owner && event.relatedTarget === owner && (event.composedPath()[0] ?? event.target) === event.currentTarget) refocusOwner(owner);
    },
    onPointerMove() { context.setKeyboardModality(false); },
    onPointerDown() { context.setKeyboardModality(false); },
  };
  return <FilterDropdownGroupContext value={null}>{createRenderElement('div', props, {
    get ref() { return [props.ref, registerId]; },
    get props() { return [defaults, rest]; },
  })}</FilterDropdownGroupContext>;
}
export namespace FilterDropdownList { export type Props = FilterDropdownListProps; export type State = FilterDropdownListState }
