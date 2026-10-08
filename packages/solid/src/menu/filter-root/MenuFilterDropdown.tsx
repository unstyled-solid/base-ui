import { createEffect, untrack } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { FilterDropdownRoot } from '../../filter-dropdown/root/FilterDropdownRoot';
import { createFilterDropdownCloseQuery } from '../../filter-dropdown/root/useFilterDropdownCloseQuery';
import { createControlled } from '../../utils/createControlled';
import type { MenuFilterProviderOptions } from '../filter-provider/MenuFilterProviderOptions';
import type { MenuFilterProviderChangeEventDetails } from '../filter-provider/MenuFilterProvider';
import { MenuFilterImplContext } from './MenuFilterContext';
import { MENU_FILTER_IMPL } from './MenuFilterImpl';
import { createMenuFilterKeyDown } from './useMenuFilterKeyDown';
import { useMenuRootContext } from '../root/MenuRootContext';
import { useMenubarContext } from '../host/MenuHostContexts';
import type { BaseUIEvent } from '../../internals/types';
import { isVirtualPointerEvent } from '../../floating-ui-react/utils/event';
export interface MenuFilterDropdownProps extends MenuFilterProviderOptions { children?: JSX.Element }
export function MenuFilterDropdown(props: MenuFilterDropdownProps) {
  const { store } = useMenuRootContext(); const menubar = useMenubarContext(true);
  const value = createControlled<string, MenuFilterProviderChangeEventDetails>({
    value: () => props.value, get defaultValue() { return props.defaultValue ?? ''; }, onChange: () => props.onValueChange, name: 'MenuFilterProvider',
  });
  const query = createFilterDropdownCloseQuery({
    get open() { return store.state.open; }, get mounted() { return store.state.mounted; }, get value() { return value.value(); },
    onValueChange(next, details) { value.request(next, details); },
  });
  createEffect(() => ({ open: store.state.open, mounted: store.state.mounted }), ({ open, mounted }) => {
    untrack(() => query.transition(open, mounted));
  });
  const handleKey = createMenuFilterKeyDown(() => value.value() !== '');
  store.setFilterTriggerProps({ 'aria-haspopup': 'dialog',
    onPointerDown(event: PointerEvent) { store.context.virtualPress = isVirtualPointerEvent(event); },
    onKeyDown(event: BaseUIEvent<KeyboardEvent>) {
      const owner = store.context.virtualFocusRef?.current;
      if (!store.state.open || !owner || menubar) return;
      if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        owner.focus({ preventScroll: true }); handleKey(event); event.preventDefault(); event.preventBaseUIHandler();
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') event.preventBaseUIHandler();
      else if (event.key.length === 1 && event.key !== ' ' && !event.ctrlKey && !event.metaKey && !event.altKey) owner.focus({ preventScroll: true });
    },
  });
  return <MenuFilterImplContext value={MENU_FILTER_IMPL}><FilterDropdownRoot
    open={store.state.open} disabled={store.state.disabled} openedByKeyboard={store.state.keyboardOpen}
    value={value.value()} query={query.query()} filter={props.filter} autoHighlight={props.autoHighlight} locale={props.locale}
    onValueChange={(next, details) => { value.request(next, details); }}
    triggerId={store.state.activeTriggerElement ? store.state.activeTriggerElement.id || null : store.state.activeTriggerId}
    listRef={store.context.itemDomElements} getActiveIndex={() => store.state.activeIndex}
    setActiveIndex={index => store.setActiveIndex(index, 'none')} focusOwnerRef={store.context.virtualFocusRef}>
    {props.children}
  </FilterDropdownRoot></MenuFilterImplContext>;
}
