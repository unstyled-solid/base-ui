import { omit as omitProps } from 'solid-js';
import type { BaseUIComponentProps, NativeButtonProps } from '../../internals/types';
import { createButton } from '../../internals/use-button';
import { createRenderElement } from '../../internals/createRenderElement';
import { createChangeEventDetails } from '../../internals/createBaseUIEventDetails';
import { useFilterDropdownRootContext, useFilterDropdownValueContext } from '../root/FilterDropdownRootContext';
export interface FilterDropdownClearState { disabled: boolean }
export interface FilterDropdownClearProps extends NativeButtonProps, BaseUIComponentProps<'button', FilterDropdownClearState> { disabled?: boolean }
export function FilterDropdownClear(props: FilterDropdownClearProps) {
  const context = useFilterDropdownRootContext();
  const value = useFilterDropdownValueContext();
  const disabled = () => context.disabled || (props.disabled ?? false);
  const { buttonRef, getButtonProps } = createButton({ get disabled() { return disabled(); }, get native() { return props.nativeButton ?? true; } });
  const state: FilterDropdownClearState = { get disabled() { return disabled(); } };
  const rest = omitProps(props, 'render', 'class', 'style', 'ref', 'disabled', 'nativeButton');
  const defaults = {
    tabindex: -1, 'aria-hidden': 'true',
    onMouseDown(event: MouseEvent) { event.preventDefault(); },
    onClick(event: MouseEvent) {
      context.onValueChange('', createChangeEventDetails('clear-press', event));
      context.focusOwnerRef.current?.focus({ preventScroll: true });
    },
  };
  return createRenderElement('button', props, {
    get enabled() { return value() !== ''; }, state,
    get ref() { return [props.ref, buttonRef]; },
    get props() { return [defaults, rest, getButtonProps]; },
  });
}
export namespace FilterDropdownClear { export type Props = FilterDropdownClearProps; export type State = FilterDropdownClearState }
