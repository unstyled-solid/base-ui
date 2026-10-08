import type { JSX } from '@solidjs/web';
import { ComboboxItem } from '../../combobox/item/ComboboxItem';
import type { ComboboxItemProps } from '../../combobox/item/ComboboxItem';
import type { BaseUIComponentProps } from '../../internals/types';

export interface AutocompleteItemState { disabled: boolean; highlighted: boolean }
export type AutocompleteItemProps = Omit<ComboboxItemProps, 'class' | 'style' | 'render' | 'id'> &
  Pick<BaseUIComponentProps<'div', AutocompleteItemState>, 'class' | 'style' | 'render'>;
export interface AutocompleteItem { (props: AutocompleteItemProps): JSX.Element }
/** Same runtime part; the none-mode API deliberately omits selected state. */
export const AutocompleteItem = ComboboxItem as AutocompleteItem;
export namespace AutocompleteItem {
  export type Props = AutocompleteItemProps;
  export type State = AutocompleteItemState;
}
