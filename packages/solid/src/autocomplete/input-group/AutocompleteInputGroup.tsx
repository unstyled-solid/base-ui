import type { JSX } from '@solidjs/web';
import { ComboboxInputGroup } from '../../combobox/input-group/ComboboxInputGroup';
import type { ComboboxInputGroupProps, ComboboxInputGroupState } from '../../combobox/input-group/ComboboxInputGroup';
import type { BaseUIComponentProps } from '../../internals/types';

export type AutocompleteInputGroupState = Omit<ComboboxInputGroupState, 'placeholder'>;
export type AutocompleteInputGroupProps = Omit<ComboboxInputGroupProps, 'class' | 'style' | 'render'> &
  Pick<BaseUIComponentProps<'div', AutocompleteInputGroupState>, 'class' | 'style' | 'render'>;
export interface AutocompleteInputGroup { (props: AutocompleteInputGroupProps): JSX.Element }
export const AutocompleteInputGroup = ComboboxInputGroup as AutocompleteInputGroup;
export namespace AutocompleteInputGroup {
  export type Props = AutocompleteInputGroupProps;
  export type State = AutocompleteInputGroupState;
}
