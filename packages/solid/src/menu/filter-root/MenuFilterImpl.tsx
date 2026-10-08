import { createEffect, onCleanup, onSettled } from 'solid-js';
import { createChangeEventDetails } from '../../internals/createBaseUIEventDetails';
import { createEnhancedClickHandler } from '../../utils/createEnhancedClickHandler';
import type { BaseUIEvent } from '../../internals/types';
import { createFilterDropdownItem } from '../../filter-dropdown/item/useFilterDropdownItem';
import { createFilterDropdownGroup } from '../../filter-dropdown/group/useFilterDropdownGroup';
import { FilterDropdownGroupContext } from '../../filter-dropdown/group/FilterDropdownGroupContext';
import { FilterDropdownList } from '../../filter-dropdown/list/FilterDropdownList';
import { useFilterDropdownValueContext, useFilterDropdownRootContext, useFilterContextForList } from '../../filter-dropdown/root/FilterDropdownRootContext';
import { refocusOwner, isRefocusingOwner } from '../../filter-dropdown/utils/refocusOwner';
import { MenuPopupPlain, type MenuPopupProps } from '../popup/MenuPopup';
import { MenuGroupPlain, type MenuGroupProps } from '../group/MenuGroup';
import { MenuRadioGroupPlain, type MenuRadioGroupProps } from '../radio-group/MenuRadioGroup';
import type { MenuListProps } from '../list/MenuList';
import { useMenuRootContext } from '../root/MenuRootContext';
import { createMenuFilterKeyDown, isMainOrientationKey, isCrossOrientationCloseKey } from './useMenuFilterKeyDown';
import type { MenuFilterImpl, MenuFilterItemParams } from './MenuFilterContext';
import { mergeProps } from '../../merge-props';
import { activeElement, contains, getTarget } from '../../utils/shadowDom';
import type { MenuStore } from '../store/MenuStore';
import type { MenuParent } from '../root/MenuRoot';
import { moveHighlightFrom } from './moveHighlightFrom';
import { useDirection } from '../../internals/direction-context/DirectionContext';
import { isVirtualPointerEvent } from '../../floating-ui-react/utils/event';
import { isElement, isHTMLElement } from '@floating-ui/utils/dom';
import { isTypeableElement } from '../../floating-ui-react/utils/element';
import { useCompositeListContext } from '../../internals/composite';
import { createPopupLabel } from '../../internals/resolvePopupLabel';

export function MenuFilterPopup(props: MenuPopupProps) {
  const root = useMenuRootContext(); const store = root.store;
  const direction = useDirection();
  let pointerType = 'mouse'; let nestedFocus: Element | null = null;
  const owner = () => store.context.virtualFocusRef?.current ?? null;
  onSettled(() => {
    if (process.env.NODE_ENV !== 'production' && store.state.open && !owner()) {
      console.warn('Base UI: A filterable menu opened without a <Menu.Input>. Render the input inside ' +
        '<Menu.Popup>, or drop <Menu.FilterProvider> for a menu that does not filter.');
    }
  });
  function restore(event: MouseEvent & { currentTarget: HTMLElement }, enteredTrigger: boolean) {
    const input = owner();
    if (!store.state.open || !input || pointerType !== 'mouse') return;
    const focused = activeElement(input.ownerDocument);
    if (focused === input || contains(event.currentTarget, focused)) return;
    let trigger: HTMLElement | null = null;
    const nearest = event.composedPath().find(node => {
      if (!node || typeof node !== 'object' || !('getAttribute' in node)) return false;
      const el = node as HTMLElement;
      if (el.getAttribute('role') === 'dialog' || el.hasAttribute('data-rootownerid')) return true;
      if (el.hasAttribute('aria-haspopup')) trigger = el;
      return false;
    });
    if (nearest !== event.currentTarget || nestedFocus && !(enteredTrigger && trigger)) return;
    if (enteredTrigger && trigger && isElement(event.relatedTarget) && contains(trigger, event.relatedTarget)) return;
    refocusOwner(input);
  }
  const interaction = {
    'aria-activedescendant': undefined, 'aria-orientation': undefined,
    onMouseDown(event: MouseEvent & { currentTarget: HTMLElement }) { if (getTarget(event) === event.currentTarget) event.preventDefault(); },
    onPointerDown(event: PointerEvent) { pointerType = event.pointerType || 'mouse'; },
    onPointerOver(event: PointerEvent) { pointerType = event.pointerType || 'mouse'; },
    onPointerMove(event: PointerEvent) { pointerType = event.pointerType || 'mouse'; },
    onMouseMove(event: MouseEvent & { currentTarget: HTMLElement }) { restore(event, false); },
    onMouseOver(event: MouseEvent & { currentTarget: HTMLElement }) { if (nestedFocus) restore(event, true); },
    onFocus(event: FocusEvent & { currentTarget: HTMLElement }) {
      const target = getTarget(event);
      if (target === owner()) nestedFocus = null;
      else if (isHTMLElement(target) && !contains(event.currentTarget, target) && !isRefocusingOwner()) nestedFocus = target;
      if (store.state.open && target === event.currentTarget) owner()?.focus({ preventScroll: true });
    },
    onKeyDown(event: KeyboardEvent) {
      const target = getTarget(event);
      if (target === owner() || isTypeableElement(target)) return;
      if (isCrossOrientationCloseKey(event.key, root.orientation, direction() === 'rtl', false)) { owner()?.focus({ preventScroll: true }); event.stopPropagation(); }
    },
  };
  const merged = mergeProps<typeof MenuPopupPlain>(interaction, props);
  return <MenuPopupPlain {...merged} role="dialog" initialFocus={() => {
    const mayFocus = store.state.parent.type !== 'menu' || store.state.open &&
      (store.state.openMethod === 'keyboard' || ['list-navigation', 'trigger-hover', 'trigger-press'].includes(store.state.openChangeReason ?? ''));
    if (!mayFocus) return false;
    const touch = ['touch', 'pen'].includes(store.state.openMethod ?? '') && !store.context.virtualPress;
    return store.state.openChangeReason === 'trigger-hover' || touch ? false : owner() ?? false;
  }} />;
}
export function MenuFilterList(props: MenuListProps) {
  const root = useMenuRootContext(); const store = root.store;
  const filter = useFilterDropdownRootContext();
  const label = createPopupLabel(props, () => null, () => filter.triggerId ?? null);
  const composite = useCompositeListContext();
  let previousItems: readonly (HTMLElement | null)[] | null = null;
  const unsubscribe = composite.subscribeMapChange(() => {
    const items = [...store.context.itemDomElements.current];
    const previous = previousItems;
    if (previous && (previous.length !== items.length || items.some((item, index) => item !== previous[index]))) filter.onItemsChange(previous);
    previousItems = items;
  });
  onCleanup(unsubscribe);
  const direction = useDirection();
  const value = useFilterDropdownValueContext();
  const keyDown = createMenuFilterKeyDown(() => value() !== '');
  const defaults = {
    role: 'menu' as const, get 'aria-orientation'() { return root.orientation === 'horizontal' ? 'horizontal' : undefined; },
    get 'aria-labelledby'() { return props['aria-label'] ? undefined : store.state.activeTriggerElement?.id || undefined; },
    onKeyDown(event: KeyboardEvent & { currentTarget: HTMLElement }) {
      const owner = store.context.virtualFocusRef?.current;
      const target = getTarget(event) as Element;
      const fromNested = !contains(event.currentTarget, target);
      const ownerFocused = owner !== undefined && owner !== null && activeElement(owner.ownerDocument) === owner;
      if (!owner || ownerFocused || fromNested) {
        if (event.which !== 229 && !event.shiftKey && !event.ctrlKey && !event.metaKey && !event.altKey && isMainOrientationKey(event.key, root.orientation)) {
          event.stopPropagation();
          if (fromNested && ownerFocused) {
            const documentRoot = target.getRootNode() as Document | ShadowRoot;
            const trigger = store.context.itemDomElements.current.find(item => {
              const controlled = item?.getAttribute('aria-controls');
              return controlled && contains(documentRoot.getElementById(controlled), target);
            });
            if (trigger) moveHighlightFrom(store, trigger, event, { orientation: root.orientation, rtl: direction() === 'rtl', loopFocus: root.loopFocus, allowEscape: root.allowEscape });
          }
        }
        return;
      }
      if (event.defaultPrevented) return;
      refocusOwner(owner); keyDown(event);
    },
  };
  const normalizedProps = new Proxy(props, {
    get(target, key) {
      if (key === 'id') return props.id === null || props.id === false ? null : typeof props.id === 'string' ? props.id : undefined;
      return Reflect.get(target, key, target);
    },
  }) as Omit<MenuListProps, 'id'> & { id?: string | null };
  const merged = mergeProps<typeof FilterDropdownList>(defaults, label.props, normalizedProps);
  // Only a plain list takes semantics from its popup. A filtered popup remains
  // a labelled dialog; its trigger controls that dialog and its input controls
  // the FilterDropdown-owned list.
  const withRefs = mergeProps<typeof FilterDropdownList>(merged, {
    get ref() { return [props.ref, label.ref]; },
  });
  return <FilterDropdownList {...withRefs} />;
}
export function MenuFilterGroup(props: MenuGroupProps) {
  const group = createFilterDropdownGroup();
  return <FilterDropdownGroupContext value={group.context}><MenuGroupPlain {...props} hidden={group.hidden || props.hidden || undefined} /></FilterDropdownGroupContext>;
}
export function MenuFilterRadioGroup(props: MenuRadioGroupProps) {
  const group = createFilterDropdownGroup();
  return <FilterDropdownGroupContext value={group.context}><MenuRadioGroupPlain {...props} hidden={group.hidden || props.hidden || undefined} /></FilterDropdownGroupContext>;
}
function createMenuFilterSubmenuTrigger(params: MenuFilterItemParams) {
  const root = useMenuRootContext();
  const parent = root.parent.type === 'menu' ? root.parent.store : null;
  const context = useFilterContextForList(parent?.context.itemDomElements ?? null);
  const parameters = new Proxy({} as MenuFilterItemParams & { context: typeof context; retainGroup: boolean }, {
    get(_target, key) {
      if (key === 'context') return context;
      if (key === 'retainGroup') return root.store.state.mounted;
      return Reflect.get(params, key, params);
    },
  });
  const item = createFilterDropdownItem(parameters);
  createEffect(() => ({ visible: item.visible, open: root.store.state.open }), ({ visible, open }) => {
    if (!visible && open) root.store.setOpen(false, createChangeEventDetails('none'));
  });
  const click = createEnhancedClickHandler(() => (event, interaction) => {
    if (event.type === 'click' && root.store.state.open && (interaction === 'keyboard' || interaction === 'mouse' && root.store.state.openChangeReason === 'trigger-press')) {
      root.store.context.virtualFocusRef?.current?.focus({ preventScroll: true });
    }
  });
  const props = {
    get 'aria-haspopup'() { return root.virtualFocus ? 'dialog' as const : 'menu' as const; }, ...click,
    onPointerDown(event: PointerEvent & { currentTarget: HTMLElement }) {
      click.onPointerDown(event);
      root.store.context.virtualPress = isVirtualPointerEvent(event);
    },
    onFocus(event: BaseUIEvent<FocusEvent>) {
      const owner = root.store.context.virtualFocusRef?.current;
      if (owner && root.store.state.open && event.relatedTarget === owner) { event.preventBaseUIHandler(); owner.focus({ preventScroll: true }); }
    },
  };
  return { get visible() { return context === null || item.visible || root.store.state.mounted; }, ref: item.ref, props };
}
export const MENU_FILTER_IMPL: MenuFilterImpl = {
  Popup: MenuFilterPopup, List: MenuFilterList, Group: MenuFilterGroup, RadioGroup: MenuFilterRadioGroup,
  useItem: createFilterDropdownItem, useSubmenuTrigger: createMenuFilterSubmenuTrigger,
  useParentHandoff: createVirtualFocusParentHandoff,
};
function createVirtualFocusParentHandoff(store: MenuStore, parent: () => MenuParent, virtual: boolean) {
  const parentStore = () => { const current = parent(); return current.type === 'menu' ? current.store : null; };
  const owner = () => parentStore()?.context.virtualFocusRef?.current ?? null;
  let disposed = false;
  onCleanup(() => { disposed = true; });
  createEffect(() => ({ open: store.state.open, trigger: store.state.activeTriggerElement, reason: store.state.openChangeReason }), ({ open, trigger, reason }) => {
    if (open || virtual) return;
    queueMicrotask(() => {
      const input = owner();
      const current = parentStore();
      if (disposed || store.state.open || !current?.state.open || !input) return;
      if (contains(store.state.popupElement, activeElement(input.ownerDocument))) input.focus({ preventScroll: true });
      if ((reason === 'list-navigation' || reason === 'escape-key') && current.state.activeIndex === null) current.highlightItem(trigger, 'none');
    });
  });
  return {
    get getReturnElement() { return parentStore()?.context.virtualFocusRef ? owner : undefined; },
    handleFocus() { const current = parentStore(); if (!virtual && owner() && current?.state.activeIndex !== null) current?.setActiveIndex(null, 'none'); },
  };
}
