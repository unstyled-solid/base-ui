import type { BaseUIComponentProps } from '../../internals/types';
import type { ComponentProps } from '@solidjs/web';
import { createRenderElement } from '../../internals/createRenderElement';
import { elementProps } from '../utils/props';
import { createMenuItem } from '../item/createMenuItem';
export interface MenuLinkItemState { highlighted: boolean }
export interface MenuLinkItemProps extends BaseUIComponentProps<'a', MenuLinkItemState, ComponentProps<'a'>> { closeOnClick?: boolean; label?: string }
export function MenuLinkItem(props: MenuLinkItemProps) {
  const item = createMenuItem(props, { closeOnClick: false, link: true });
  const nativeProps = elementProps(props, ['closeOnClick', 'label']);
  return createRenderElement('a', props, {
    state: { get highlighted() { return item.highlighted(); } },
    get enabled() { return item.filter.visible; }, get ref() { return [props.ref, item.ref]; },
    get props() { return [item.store.state.itemProps, nativeProps]; },
    propGetter: item.getItemProps,
  });
}
export namespace MenuLinkItem { export type Props = MenuLinkItemProps; export type State = MenuLinkItemState }
