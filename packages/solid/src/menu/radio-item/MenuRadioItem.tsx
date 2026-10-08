import { createChangeEventDetails } from '../../internals/createBaseUIEventDetails';
import { createRenderElement } from '../../internals/createRenderElement';
import type { BaseUIComponentProps } from '../../internals/types';
import { createMenuItem } from '../item/createMenuItem';
import { elementProps } from '../utils/props';
import { itemMapping } from '../utils/stateAttributesMapping';
import { useMenuRadioGroupContext } from '../radio-group/MenuRadioGroupContext';
import { MenuRadioItemContext } from './MenuRadioItemContext';
export interface MenuRadioItemState { disabled: boolean; highlighted: boolean; checked: boolean }
export interface MenuRadioItemProps extends BaseUIComponentProps<'div', MenuRadioItemState> {
  value: any; disabled?: boolean; nativeButton?: boolean; closeOnClick?: boolean; label?: string;
}
export function MenuRadioItem(props: MenuRadioItemProps) {
  const group = useMenuRadioGroupContext();
  const options = new Proxy(props, { get(target, key) { return key === 'disabled' ? !!props.disabled || group.disabled : Reflect.get(target, key, target); } });
  const item = createMenuItem(options, { closeOnClick: false });
  const state: MenuRadioItemState = {
    get checked() { return group.value === props.value; }, get disabled() { return item.disabled(); }, get highlighted() { return item.highlighted(); },
  };
  const nativeProps = elementProps(props, ['value', 'disabled', 'nativeButton', 'closeOnClick', 'label']);
  return <MenuRadioItemContext value={state}>{createRenderElement('div', props, {
    state, stateAttributesMapping: itemMapping, get enabled() { return item.filter.visible; }, get ref() { return [props.ref, item.ref]; },
    get props() { return [item.store.state.itemProps, { role: 'menuitemradio', get 'aria-checked'() { return state.checked; },
      onClick(event: MouseEvent) { group.setValue(props.value, createChangeEventDetails<'item-press', { preventUnmountOnClose(): void }>('item-press', event, undefined, { preventUnmountOnClose() {} })); },
    }, nativeProps]; },
    propGetter: item.getItemProps,
  })}</MenuRadioItemContext>;
}
export namespace MenuRadioItem { export type Props = MenuRadioItemProps; export type State = MenuRadioItemState }
