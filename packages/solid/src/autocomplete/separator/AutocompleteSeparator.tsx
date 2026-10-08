import type { JSX } from '@solidjs/web';
import { ListboxSeparator } from '../../utils/listbox-separator/ListboxSeparator';
import type { BaseUIComponentProps, Orientation } from '../../internals/types';

export interface AutocompleteSeparatorState { orientation: Orientation }
export interface AutocompleteSeparatorProps extends BaseUIComponentProps<'div', AutocompleteSeparatorState> {
  orientation?: Orientation;
}
export const AutocompleteSeparator = ListboxSeparator as (props: AutocompleteSeparatorProps) => JSX.Element;
export namespace AutocompleteSeparator {
  export type Props = AutocompleteSeparatorProps;
  export type State = AutocompleteSeparatorState;
}
