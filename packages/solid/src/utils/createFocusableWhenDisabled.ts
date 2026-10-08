import { createMemo, merge } from 'solid-js';
export interface UseFocusableWhenDisabledParameters {
  focusableWhenDisabled?: boolean | undefined;
  disabled: boolean;
  composite?: boolean | undefined;
  tabIndex?: number | undefined;
  isNativeButton: boolean;
}
export interface FocusableWhenDisabledProps {
  'aria-disabled'?: boolean | undefined;
  disabled?: boolean | undefined;
  onKeyDown(event: KeyboardEvent): void;
  tabIndex?: number | undefined;
}
export interface UseFocusableWhenDisabledReturnValue { props: FocusableWhenDisabledProps }
export interface UseFocusableWhenDisabledState {}
export function createFocusableWhenDisabled(params: UseFocusableWhenDisabledParameters): UseFocusableWhenDisabledReturnValue {
  const onKeyDown = (event: KeyboardEvent) => {
    if (params.disabled && params.focusableWhenDisabled && event.key !== 'Tab') event.preventDefault();
  };
  const snapshot = createMemo((previous: FocusableWhenDisabledProps | undefined) => {
    const { disabled, focusableWhenDisabled, composite = false, tabIndex = 0, isNativeButton } = params;
    const result: FocusableWhenDisabledProps = { onKeyDown };
    if (!composite) result.tabIndex = !isNativeButton && disabled && !focusableWhenDisabled ? -1 : tabIndex;
    if ((isNativeButton && (focusableWhenDisabled || (composite && focusableWhenDisabled !== false))) || (!isNativeButton && disabled)) result['aria-disabled'] = disabled;
    if (isNativeButton && !focusableWhenDisabled) result.disabled = disabled;
    if (previous && previous.tabIndex === result.tabIndex && previous.disabled === result.disabled &&
      previous['aria-disabled'] === result['aria-disabled'] && Object.keys(previous).length === Object.keys(result).length) return previous;
    return result;
  }, { name: 'Button.focusability' });
  const props = merge(snapshot);
  return { props };
}
export { createFocusableWhenDisabled as useFocusableWhenDisabled };
