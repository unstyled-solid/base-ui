import { FilterDropdownInput, type FilterDropdownInputProps, type FilterDropdownInputState } from '../../filter-dropdown/input/FilterDropdownInput';
import { useFilterDropdownValueContext } from '../../filter-dropdown/root/FilterDropdownRootContext';
import { mergeProps } from '../../merge-props';
import { useMenuFilterPart } from '../filter-root/MenuFilterContext';
import { useMenuRootContext } from '../root/MenuRootContext';
import { createMenuFilterKeyDown } from '../filter-root/useMenuFilterKeyDown';
import { elementProps } from '../utils/props';
export interface MenuInputState extends FilterDropdownInputState {}
export interface MenuInputProps extends FilterDropdownInputProps {}
export function MenuInput(props: MenuInputProps) {
  useMenuFilterPart('Input');
  const { store } = useMenuRootContext(); const value = useFilterDropdownValueContext();
  const keyDown = createMenuFilterKeyDown(() => value() !== '');
  const merged = mergeProps<typeof FilterDropdownInput>({ onKeyDown: keyDown }, props);
  return <FilterDropdownInput {...merged} activeItemId={store.state.highlightedItem?.id || undefined}
    navigationProps={elementProps(store.state.inputProps, ['onKeyDown'])} />;
}
export namespace MenuInput { export type Props = MenuInputProps; export type State = MenuInputState }
