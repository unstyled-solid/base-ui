import { createSignal } from 'solid-js';
import { createControlled } from '../../utils/createControlled';
import { createRenderElement } from '../../internals/createRenderElement';
import type { BaseUIComponentProps } from '../../internals/types';
import type { MenuRoot } from '../root/MenuRoot';
import { MenuGroupContext } from '../group/MenuGroupContext';
import { useMenuFilterImpl } from '../filter-root/MenuFilterContext';
import { elementProps } from '../utils/props';
import { MenuRadioGroupContext } from './MenuRadioGroupContext';
export interface MenuRadioGroupState { disabled: boolean }
export interface MenuRadioGroupProps extends BaseUIComponentProps<'div', MenuRadioGroupState> {
  value?: any; defaultValue?: any; disabled?: boolean;
  onValueChange?(value: any, details: MenuRoot.ChangeEventDetails): void;
}
export function MenuRadioGroupPlain(props: MenuRadioGroupProps) {
  const value = createControlled<any, MenuRoot.ChangeEventDetails>({ value: () => props.value,
    get defaultValue() { return props.defaultValue; }, onChange: () => props.onValueChange, name: 'MenuRadioGroup' });
  const [label, setLabel] = createSignal<string | undefined>();
  const state = { get disabled() { return props.disabled ?? false; } };
  const context: MenuRadioGroupContext = { get value() { return value.value(); }, get disabled() { return state.disabled; },
    setValue(next, details) { value.request(next, details); } };
  return <MenuGroupContext value={setLabel}><MenuRadioGroupContext value={context}>{createRenderElement('div', props, {
    state, get ref() { return props.ref; }, props: [{ role: 'group', get 'aria-labelledby'() { return props['aria-labelledby'] ?? label(); },
      get 'aria-disabled'() { return state.disabled || undefined; } }, elementProps(props, ['value', 'defaultValue', 'disabled', 'onValueChange', 'aria-labelledby'])],
  })}</MenuRadioGroupContext></MenuGroupContext>;
}
export function MenuRadioGroup(props: MenuRadioGroupProps) {
  const Group = useMenuFilterImpl()?.RadioGroup ?? MenuRadioGroupPlain;
  return <Group {...props} />;
}
export type MenuRadioGroupChangeEventReason = MenuRoot.ChangeEventReason;
export type MenuRadioGroupChangeEventDetails = MenuRoot.ChangeEventDetails;
export namespace MenuRadioGroup {
  export type Props = MenuRadioGroupProps; export type State = MenuRadioGroupState;
  export type ChangeEventReason = MenuRadioGroupChangeEventReason; export type ChangeEventDetails = MenuRadioGroupChangeEventDetails;
}
