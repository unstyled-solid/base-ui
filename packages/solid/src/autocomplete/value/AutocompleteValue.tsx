import type { JSX } from '@solidjs/web';
import { useComboboxInputValueContext } from '../../combobox/root/ComboboxRootContext';

/** Renders the current input text, or a live child renderer, without a host element. */
export function AutocompleteValue(props: AutocompleteValueProps): JSX.Element {
  const inputValue = useComboboxInputValueContext();
  return <>{typeof props.children === 'function'
    ? props.children(String(inputValue()))
    : props.children ?? inputValue()}</>;
}

export interface AutocompleteValueState {}
export interface AutocompleteValueProps {
  children?: JSX.Element | ((value: string) => JSX.Element);
}
export namespace AutocompleteValue {
  export type Props = AutocompleteValueProps;
  export type State = AutocompleteValueState;
}
