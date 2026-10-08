import { createSignal } from 'solid-js';
import { createRenderElement } from '../../internals/createRenderElement';
import type { BaseUIComponentProps } from '../../internals/types';
import { elementProps } from '../utils/props';
import { useMenuFilterImpl } from '../filter-root/MenuFilterContext';
import { MenuGroupContext } from './MenuGroupContext';
export interface MenuGroupState {}
export interface MenuGroupProps extends BaseUIComponentProps<'div', MenuGroupState> {}
export function MenuGroupPlain(props: MenuGroupProps) {
  const [label, setLabel] = createSignal<string | undefined>();
  return <MenuGroupContext value={setLabel}>{createRenderElement('div', props, {
    get ref() { return props.ref; }, props: [{ role: 'group', get 'aria-labelledby'() { return label(); } }, elementProps(props, [])],
  })}</MenuGroupContext>;
}
export function MenuGroup(props: MenuGroupProps) {
  const Group = useMenuFilterImpl()?.Group ?? MenuGroupPlain;
  return <Group {...props} />;
}
export namespace MenuGroup { export type Props = MenuGroupProps; export type State = MenuGroupState }
