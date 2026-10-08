import type { BaseUIComponentProps } from '../../internals/types';
import { createRenderElement } from '../../internals/createRenderElement';
import { elementProps } from '../utils/props';
import { createMenuItem } from './createMenuItem';
export interface MenuItemState { disabled: boolean; highlighted: boolean }
export interface MenuItemProps extends BaseUIComponentProps<'div', MenuItemState> {
  disabled?: boolean; nativeButton?: boolean; closeOnClick?: boolean; label?: string;
}
export function MenuItem(props: MenuItemProps) {
  const item = createMenuItem(props);
  const state = { get disabled() { return item.disabled(); }, get highlighted() { return item.highlighted(); } };
  const nativeProps = elementProps(props, ['disabled', 'nativeButton', 'closeOnClick', 'label']);
  return createRenderElement('div', props, { state,
    get enabled() { return item.filter.visible; }, get ref() { return [props.ref, item.ref]; },
    get props() { return [item.store.state.itemProps, nativeProps]; },
    propGetter: item.getItemProps,
  });
}
export namespace MenuItem { export type Props = MenuItemProps; export type State = MenuItemState }
