import { createSignal } from 'solid-js';
import { createCompositeListItem } from '../../internals/composite';
import { createButton } from '../../internals/use-button';
import { createBaseUiId } from '../../internals/createBaseUiId';
import { mergeProps } from '../../merge-props';
import { dispatchClickWithModifiers } from '../../utils/dispatchClickWithModifiers';
import { useMenuRootContext } from '../root/MenuRootContext';
import { useContextMenuRootContext } from '../host/MenuHostContexts';
import { useMenuFilterItem } from '../filter-root/MenuFilterContext';
import type { HTMLProps } from '../../internals/types';
import { platform } from '../../utils/platform';

export interface MenuItemOptions { id?: import('@solidjs/web').JSX.HTMLAttributes<HTMLElement>['id']; label?: string; disabled?: boolean; nativeButton?: boolean; closeOnClick?: boolean; children?: import('@solidjs/web').JSX.Element }
export function createMenuItem(props: MenuItemOptions, options: { closeOnClick: boolean; submenu?: boolean; link?: boolean } = { closeOnClick: true }) {
  const root = useMenuRootContext();
  const store = options.submenu && root.parent.type === 'menu' ? root.parent.store : root.store;
  const host = useContextMenuRootContext(true);
  const filter = useMenuFilterItem(props, options.submenu ? 'submenu-trigger' : 'root');
  const list = createCompositeListItem({ guess: true, get label() { return props.label; } });
  const id = createBaseUiId(() => typeof props.id === 'string' ? props.id : undefined);
  const [element, setElement] = createSignal<HTMLElement | null>(null);
  const disabled = () => !!props.disabled || store.state.disabled;
  const virtual = () => options.submenu ? root.parentVirtualFocus : root.virtualFocus;
  const highlighted = () => store.state.activeIndex !== null && store.state.activeIndex === list.index;
  const button = createButton({ get disabled() { return options.link ? false : disabled(); },
    get native() { return props.nativeButton ?? false; }, focusableWhenDisabled: true, composite: true });
  function closeTree(event: MouseEvent) {
    store.state.floatingTreeRoot.events.emit('close', { domEvent: event, reason: 'item-press' });
  }
  const common: HTMLProps = {
    get id() { return id(); }, role: 'menuitem',
    get tabindex() { return !virtual() && store.state.open && highlighted() ? 0 : -1; },
    get 'aria-selected'() { return virtual() && (options.submenu ? root.parentWebkitItemSelected : root.webkitItemSelected) ? String(highlighted()) as 'true' | 'false' : undefined; },
    onMouseDown(event: MouseEvent) { if (virtual()) event.preventDefault(); },
    onMouseEnter(event: MouseEvent) { if (options.submenu && store.state.highlightItemOnHover) store.setActiveIndex(list.index, 'pointer', event); },
    onKeyDown(event: KeyboardEvent) { if (event.key === ' ' && store.context.typingRef.current) event.preventDefault(); },
    onMouseMove(event: MouseEvent) {
      if (store.state.floatingNodeId) store.state.floatingTreeRoot.events.emit('itemhover', { nodeId: store.state.floatingNodeId, target: event.currentTarget as Element });
    },
    onClick(event: MouseEvent) { if (props.closeOnClick ?? options.closeOnClick) closeTree(event); },
    onMouseUp(event: MouseEvent) {
      if (host) {
        const point = host.initialCursorPointRef.current;
        host.initialCursorPointRef.current = null;
        if (point && Math.abs(event.clientX - point.x) <= 1 && Math.abs(event.clientY - point.y) <= 1) return;
        if (!platform.os.mac && event.button === 2) return;
      }
      const target = element();
      if (target && !options.submenu && store.context.allowMouseUpTriggerRef.current && (!host || event.button === 2)) {
        dispatchClickWithModifiers(target, event, { detail: 1, pointerType: 'mouse' });
      }
    },
  };
  return {
    store, filter, id, disabled, highlighted,
    ref(node: HTMLElement | null) { setElement(node); list.ref(node); button.buttonRef(node); filter.ref?.(node); },
    getItemProps(external?: HTMLProps) { return mergeProps<any>(common, filter.props, external, button.getButtonProps); },
  };
}
