import { createChangeEventDetails } from '../../internals/createBaseUIEventDetails';
import { createRenderElement } from '../../internals/createRenderElement';
import type { BaseUIComponentProps } from '../../internals/types';
import { createMenuItem } from '../item/createMenuItem';
import { elementProps } from '../utils/props';
import { itemMapping } from '../utils/stateAttributesMapping';
import { useMenuRadioGroupContext } from '../radio-group/MenuRadioGroupContext';
import { MenuRadioItemContext } from './MenuRadioItemContext';
import { children, merge } from 'solid-js';
export interface MenuRadioItemState { disabled: boolean; highlighted: boolean; checked: boolean }
export interface MenuRadioItemProps extends BaseUIComponentProps<'div', MenuRadioItemState> {
  value: any; disabled?: boolean; nativeButton?: boolean; closeOnClick?: boolean; label?: string;
}
export function MenuRadioItem(props: MenuRadioItemProps) {
  const group = useMenuRadioGroupContext();
  const options = new Proxy(props, { get(target, key) { return key === 'disabled' ? !!props.disabled || group.disabled : Reflect.get(target, key, target); } });
  let item: ReturnType<typeof createMenuItem>;
  const state: MenuRadioItemState = {
    get checked() { return group.value === props.value; }, get disabled() { return item.disabled(); }, get highlighted() { return item.highlighted(); },
  };
  function Content() {
  let content: (() => import('@solidjs/web').JSX.Element) | undefined;
  const resolved = merge(options, { get children() { return content?.(); } });
  item = createMenuItem(resolved, { closeOnClick: false });
  content = children(() => props.children);
  const nativeProps = elementProps(resolved, ['value', 'disabled', 'nativeButton', 'closeOnClick', 'label']);
  return createRenderElement('div', props, {
    state, stateAttributesMapping: itemMapping, get enabled() { return item.filter.visible; }, get ref() { return [props.ref, item.ref]; },
    get props() { return [item.store.state.itemProps, { role: 'menuitemradio', get 'aria-checked'() { return state.checked; },
      onClick(event: MouseEvent) { group.setValue(props.value, createChangeEventDetails<'item-press', { preventUnmountOnClose(): void }>('item-press', event, undefined, { preventUnmountOnClose() {} })); },
    }, nativeProps]; },
    propGetter: item.getItemProps,
  });
  }
  return <MenuRadioItemContext value={state}><Content /></MenuRadioItemContext>;
}
export namespace MenuRadioItem { export type Props = MenuRadioItemProps; export type State = MenuRadioItemState }
