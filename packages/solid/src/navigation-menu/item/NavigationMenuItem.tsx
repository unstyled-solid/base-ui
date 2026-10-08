import { omit } from 'solid-js';
import { createBaseUiId } from '../../internals/createBaseUiId';
import { createRenderElement } from '../../internals/createRenderElement';
import type { BaseUIComponentProps } from '../../internals/types';
import { NavigationMenuItemContext } from './NavigationMenuItemContext';
export function NavigationMenuItem(props: NavigationMenuItem.Props) {
  const id = createBaseUiId();
  const context = { get value() { return props.value ?? id(); } };
  const rest = omit(props, 'value', 'class', 'style', 'render', 'ref');
  return <NavigationMenuItemContext value={context}>
    {createRenderElement('li', props, { get ref() { return props.ref; }, get props() { return rest; } })}
  </NavigationMenuItemContext>;
}
export interface NavigationMenuItemState {}
export interface NavigationMenuItemProps extends BaseUIComponentProps<'li', NavigationMenuItemState> { value?: any }
export namespace NavigationMenuItem { export type State = NavigationMenuItemState; export type Props = NavigationMenuItemProps }
