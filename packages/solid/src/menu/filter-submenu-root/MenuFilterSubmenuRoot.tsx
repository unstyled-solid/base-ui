import { createEffect, onCleanup, untrack } from 'solid-js';
import { MenuRootInternal } from '../root/MenuRoot';
import type { MenuSubmenuRootProps } from '../submenu-root/MenuSubmenuRoot';
import { MenuSubmenuRootContext } from '../submenu-root/MenuSubmenuRootContext';
import { useMenuRootContext } from '../root/MenuRootContext';
import { MenuFilterDropdown } from '../filter-root/MenuFilterDropdown';
import type { MenuFilterProviderOptions } from '../filter-provider/MenuFilterProviderOptions';
import { isKeyboardOpen } from '../utils/isKeyboardOpen';
import { createChangeEventDetails } from '../../internals/createBaseUIEventDetails';
import { useDirection } from '../../internals/direction-context/DirectionContext';
import { activeElement, contains } from '../../utils/shadowDom';
import { platform } from '../../utils/platform';
import type { MenuRootChangeEventDetails } from '../root/MenuRoot';
import type { BaseUIEvent } from '../../internals/types';
import { isCrossOrientationOpenKey, isCrossOrientationCloseKey, isMainOrientationKey } from '../filter-root/useMenuFilterKeyDown';
import { moveHighlightFrom } from '../filter-root/moveHighlightFrom';
import { createIsHydrating } from '../../utils/createIsHydrating';
import { isHTMLElement } from '@floating-ui/utils/dom';
export type MenuFilterSubmenuRootProps = MenuSubmenuRootProps & MenuFilterProviderOptions;
export function MenuFilterSubmenuRoot(props: MenuFilterSubmenuRootProps) {
  const parent = useMenuRootContext();
  const focusOwner = { current: null as HTMLElement | null };
  const hydrating = createIsHydrating();
  let reference: { reference: HTMLElement; trigger: HTMLElement } | null = null;
  function enter(trigger: HTMLElement, event?: KeyboardEvent) {
    const focused = parent.virtualFocus ? parent.store.context.virtualFocusRef?.current : activeElement(trigger.ownerDocument);
    if (focused && 'focus' in focused) {
      reference = { reference: focused as HTMLElement, trigger };
      parent.store.setActiveIndex(null, event ? 'keyboard' : 'none', event);
    }
  }
  function onOpenChange(next: boolean, details: MenuRootChangeEventDetails) {
    props.onOpenChange?.(next, details);
    if (details.isCanceled) return;
    const trigger = details.trigger;
    if (next) {
      reference = null;
      if (trigger && 'focus' in trigger && isKeyboardOpen(details.reason, details.event)) enter(trigger as HTMLElement, details.reason === 'list-navigation' ? details.event as KeyboardEvent : undefined);
    } else if (details.reason === 'escape-key' && trigger && 'focus' in trigger) {
      parent.store.highlightItem(trigger, 'keyboard', details.event);
      reference = { reference: parent.virtualFocus ? parent.store.context.virtualFocusRef?.current ?? trigger as HTMLElement : trigger as HTMLElement, trigger: trigger as HTMLElement };
    }
  }
  return <MenuRootInternal {...props} isSubmenu virtualFocus virtualFocusRef={focusOwner}
    disabled={parent.store.state.disabled || props.disabled} onOpenChange={onOpenChange}
    allowEscape={!props.autoHighlight} resetOnPointerLeave={props.autoHighlight !== 'always'} webkitItemSelected={!hydrating() && platform.engine.webkit}>
    <MenuFilterSubmenuNavigation parent={parent} enter={enter} getReturnElement={() => reference?.reference ?? parent.store.context.virtualFocusRef?.current ?? null}>
      <MenuFilterDropdown {...props}>{props.children}</MenuFilterDropdown>
    </MenuFilterSubmenuNavigation>
  </MenuRootInternal>;
}
function MenuFilterSubmenuNavigation(props: {
  parent: import('../root/MenuRootContext').MenuRootContext;
  enter(trigger: HTMLElement, event?: KeyboardEvent): void;
  getReturnElement(): HTMLElement | null;
  children?: import('@solidjs/web').JSX.Element;
}) {
  const root = useMenuRootContext(); const store = root.store;
  const direction = useDirection();
  const returnElement = () => {
    const [trigger] = store.context.triggerElements.elements();
    return props.getReturnElement() ?? (isHTMLElement(trigger) ? trigger : null);
  };
  let wasMounted = false;
  let disposed = false;
  let closeToken: symbol | undefined;
  onCleanup(() => { disposed = true; closeToken = undefined; });
  createEffect(() => ({ mounted: store.state.mounted, target: returnElement(), parentOpen: props.parent.store.state.open, popup: store.state.popupElement }), ({ mounted, target, parentOpen, popup }) => {
    const previous = wasMounted; wasMounted = mounted;
    if (!mounted && previous && target && parentOpen) {
      const active = activeElement(target.ownerDocument);
      if (active === target.ownerDocument.body || contains(popup, active)) untrack(() => { target.focus({ preventScroll: true }); });
    }
  });
  function close(event: KeyboardEvent) {
    if (!store.state.open) return;
    event.preventDefault(); event.stopPropagation();
    const details = createChangeEventDetails('list-navigation', event);
    const trigger = store.state.activeTriggerElement;
    store.setOpen(false, details);
    if (details.isCanceled) return;
    returnElement()?.focus({ preventScroll: true });
    props.parent.store.highlightItem(store.state.activeTriggerElement, 'keyboard', event);
    if (trigger && isMainOrientationKey(event.key, props.parent.orientation)) {
      const token = Symbol('submenu-close-key'); closeToken = token;
      // A permitted controlled request is not an acknowledgement. Read only after
      // ordinary staged writes commit; no global flush or stale getter inference.
      queueMicrotask(() => {
        if (disposed || closeToken !== token || store.state.open || !props.parent.store.state.open) return;
        closeToken = undefined; moveInParent(trigger as HTMLElement, event);
      });
    }
  }
  function moveInParent(trigger: HTMLElement, event: KeyboardEvent) {
    const next = moveHighlightFrom(props.parent.store, trigger, event, {
      orientation: props.parent.orientation, rtl: direction() === 'rtl', loopFocus: props.parent.loopFocus,
      allowEscape: props.parent.virtualFocus && props.parent.allowEscape,
    });
    if (!props.parent.virtualFocus) next?.focus({ preventScroll: true });
  }
  return <MenuSubmenuRootContext value={{ getReturnElement: returnElement,
    onTriggerKeyDown(event: BaseUIEvent<KeyboardEvent>) {
      if (isMainOrientationKey(event.key, props.parent.orientation)) {
        moveInParent(event.currentTarget as HTMLElement, event);
        event.preventBaseUIHandler(); event.preventDefault(); event.stopPropagation(); return;
      }
      if (store.state.open && isCrossOrientationCloseKey(event.key, root.orientation, direction() === 'rtl', false)) { close(event); return; }
      if (!isCrossOrientationOpenKey(event.key, props.parent.orientation, direction() === 'rtl')) return;
      event.preventDefault(); event.stopPropagation();
      const trigger = event.currentTarget as HTMLElement;
      if (store.state.open) { props.enter(trigger, event); store.context.virtualFocusRef?.current?.focus({ preventScroll: true }); }
      else store.setOpen(true, createChangeEventDetails('list-navigation', event, trigger));
    },
    onPopupKeyDown(event) { if (event.which !== 229 && isCrossOrientationCloseKey(event.key, root.orientation, direction() === 'rtl', false)) close(event); },
  }}>{props.children}</MenuSubmenuRootContext>;
}
