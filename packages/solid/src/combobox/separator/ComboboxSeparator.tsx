import { ListboxSeparator } from '../../utils/listbox-separator/ListboxSeparator';
import type { BaseUIComponentProps } from '../../internals/types';
export interface ComboboxSeparatorState { orientation: 'horizontal' | 'vertical' }
export interface ComboboxSeparatorProps extends BaseUIComponentProps<'div', ComboboxSeparatorState> { orientation?: ComboboxSeparatorState['orientation'] }
export const ComboboxSeparator = ListboxSeparator;
export namespace ComboboxSeparator { export type Props = ComboboxSeparatorProps; export type State = ComboboxSeparatorState }
