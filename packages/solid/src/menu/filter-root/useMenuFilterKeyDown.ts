import { useMenuRootContext } from '../root/MenuRootContext';
import { useMenuSubmenuRootContext } from '../submenu-root/MenuSubmenuRootContext';
import { useDirection } from '../../internals/direction-context/DirectionContext';
import { createChangeEventDetails } from '../../internals/createBaseUIEventDetails';
import { dispatchClickWithModifiers } from '../../utils/dispatchClickWithModifiers';
import type { MenuRootOrientation } from '../root/MenuRoot';
import { isMainOrientationKey, isCrossOrientationOpenKey, isCrossOrientationCloseKey } from '../../floating-ui-react/hooks/createListNavigation';
export { isMainOrientationKey, isCrossOrientationOpenKey, isCrossOrientationCloseKey } from '../../floating-ui-react/hooks/createListNavigation';
export type MenuFilterKeyAction = 'edit' | 'navigate' | 'enter-list' | 'submenu' | 'activate' | 'close' | 'ignore';
export interface MenuFilterKeyContext {
  orientation: MenuRootOrientation; rtl: boolean; hasActiveItem: boolean; activeItemOpensSubmenu: boolean; hasValue: boolean;
}
/** Source key decision table; text editing is independent of menu navigation. */
export function getMenuFilterKeyAction(event: Pick<KeyboardEvent, 'key' | 'which' | 'shiftKey' | 'ctrlKey' | 'altKey' | 'metaKey'>, context: MenuFilterKeyContext): MenuFilterKeyAction {
  const { key } = event;
  if (event.which === 229) return 'ignore';
  if (key === 'Tab') return event.shiftKey ? 'close' : 'ignore';
  if (key === 'Enter') return context.hasActiveItem ? 'activate' : 'navigate';
  const arrow = key.startsWith('Arrow'); const boundary = key === 'Home' || key === 'End';
  if (event.shiftKey || event.ctrlKey || event.altKey || event.metaKey) return arrow || boundary || key.length === 1 ? 'edit' : 'navigate';
  if (key.length === 1) return 'edit';
  if (boundary) return context.hasActiveItem && !context.hasValue ? 'navigate' : 'edit';
  if (!arrow) return 'navigate';
  if (isMainOrientationKey(key, context.orientation)) return context.orientation === 'horizontal' && !context.hasActiveItem && context.hasValue ? 'edit' : 'navigate';
  if (context.activeItemOpensSubmenu && (isCrossOrientationOpenKey(key, context.orientation, context.rtl) || isCrossOrientationCloseKey(key, context.orientation, context.rtl, false))) return 'submenu';
  if (context.orientation === 'horizontal' && !context.hasActiveItem) return 'enter-list';
  return context.hasValue ? 'edit' : 'navigate';
}
export function createMenuFilterKeyDown(hasValue: () => boolean) {
  const root = useMenuRootContext(); const store = root.store;
  const submenu = useMenuSubmenuRootContext(); const direction = useDirection();
  return (event: KeyboardEvent) => {
    const active = store.state.highlightedItem;
    const action = getMenuFilterKeyAction(event, {
      orientation: root.orientation, rtl: direction() === 'rtl', hasActiveItem: !!active,
      activeItemOpensSubmenu: active?.hasAttribute('aria-haspopup') ?? false, hasValue: hasValue(),
    });
    switch (action) {
      case 'edit':
        event.stopPropagation();
        if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) invokeNavigation(event);
        break;
      case 'navigate':
        if (isMainOrientationKey(event.key, root.orientation)) event.stopPropagation();
        invokeNavigation(event); break;
      case 'enter-list': {
        event.stopPropagation();
        const items = store.context.itemDomElements.current;
        let index = items.findIndex(Boolean);
        if (event.key !== 'ArrowDown') {
          index = -1;
          for (let i = items.length - 1; i >= 0; i--) { if (items[i]) { index = i; break; } }
        }
        if (index !== -1) { event.preventDefault(); store.setActiveIndex(index, 'keyboard', event); }
        break;
      }
      case 'submenu': {
        event.preventDefault(); event.stopPropagation();
        const win = active?.ownerDocument.defaultView;
        if (active && win) active.dispatchEvent(new win.KeyboardEvent(event.type, event));
        break;
      }
      case 'activate': event.preventDefault(); if (active) dispatchClickWithModifiers(active, event); break;
      case 'close': {
        event.preventDefault(); event.stopPropagation();
        const target = (store.state.parent.type === 'menu' ? submenu?.getReturnElement?.() : null) ?? store.state.activeTriggerElement;
        const details = createChangeEventDetails('focus-out', event);
        store.setOpen(false, details);
        if (!details.isCanceled && target && 'focus' in target) (target as HTMLElement).focus();
        break;
      }
    }
  };
  function invokeNavigation(event: KeyboardEvent) {
    const handler = store.state.inputProps.onKeyDown;
    if (typeof handler === 'function') handler(event as never);
  }
}
export { createMenuFilterKeyDown as useMenuFilterKeyDown };
