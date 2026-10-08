import { createEffect, createSignal, untrack } from 'solid-js';
import { createBaseUiId } from '../../internals/createBaseUiId';
import { createRenderElement } from '../../internals/createRenderElement';
import type { BaseUIComponentProps } from '../../internals/types';
import { useMenuRootContext } from '../root/MenuRootContext';
import { useMenuFilterImpl } from '../filter-root/MenuFilterContext';
import { elementProps } from '../utils/props';
import { createRenderedId } from '../../internals/resolveRenderedId';
import { createPopupLabel } from '../../internals/resolvePopupLabel';
export interface MenuListState {}
export interface MenuListProps extends BaseUIComponentProps<'div', MenuListState> {}
export function MenuListPlain(props: MenuListProps) {
  const root = useMenuRootContext(); const store = root.store;
  const fallbackId = createBaseUiId();
  const normalized = new Proxy(props, { get(target, key) { return key === 'id' ? typeof props.id === 'string' ? props.id : undefined : Reflect.get(target, key, target); } });
  const [id, registerId] = createRenderedId(normalized as { id?: string; render?: unknown }, fallbackId, value => { store.setListId(value ?? fallbackId()); });
  const label = createPopupLabel(props, () => store.state.activeTriggerElement, () => store.state.activeTriggerId);
  const nativeProps = elementProps(props, ['id']);
  const [element, setElement] = createSignal<HTMLElement | null>(null);
  createEffect(element, node => {
    store.setListElement(node);
    return () => { if (untrack(() => store.state.listElement) === node) { store.setListElement(null); store.setListId(undefined); } };
  });
  return createRenderElement('div', props, { get ref() { return [props.ref, setElement, registerId, label.ref]; }, props: [{
    get id() { return id(); }, role: 'menu', tabindex: -1,
    get 'aria-orientation'() { return root.orientation === 'horizontal' ? 'horizontal' : undefined; },
  }, label.props, nativeProps] });
}
export function MenuList(props: MenuListProps) { const List = useMenuFilterImpl()?.List ?? MenuListPlain; return <List {...props} />; }
export namespace MenuList { export type Props = MenuListProps; export type State = MenuListState }
