import { createEffect, createSignal } from 'solid-js';
import { createClick } from '../../floating-ui-react/hooks/createClick';
import { createHoverReferenceInteraction } from '../../floating-ui-react/hooks/createHoverReferenceInteraction';
import { safePolygon } from '../../floating-ui-react/safePolygon';
import { createRenderElement } from '../../internals/createRenderElement';
import type { BaseUIComponentProps } from '../../internals/types';
import { platform } from '../../utils/platform';
import { createMenuItem } from '../item/createMenuItem';
import { useMenuRootContext } from '../root/MenuRootContext';
import { useMenuSubmenuRootContext } from '../submenu-root/MenuSubmenuRootContext';
import { elementProps } from '../utils/props';
import { triggerMapping } from '../utils/stateAttributesMapping';
import { getTarget } from '../../utils/shadowDom';
import { createChangeEventDetails } from '../../internals/createBaseUIEventDetails';
export interface MenuSubmenuTriggerState { disabled: boolean; highlighted: boolean; open: boolean }
export interface MenuSubmenuTriggerProps extends BaseUIComponentProps<'div', MenuSubmenuTriggerState> {
  label?: string; nativeButton?: boolean; disabled?: boolean; openOnHover?: boolean; delay?: number; closeDelay?: number;
}
export function MenuSubmenuTrigger(props: MenuSubmenuTriggerProps) {
  const root = useMenuRootContext();
  if (root.parent.type !== 'menu') throw new Error('Base UI: <Menu.SubmenuTrigger> must be placed in <Menu.SubmenuRoot>.');
  const { store } = root; const parent = root.parent.store;
  const submenu = useMenuSubmenuRootContext();
  const item = createMenuItem(new Proxy(props, { get(target, key) { return key === 'disabled' ? !!props.disabled || store.state.disabled : Reflect.get(target, key, target); } }), { submenu: true, closeOnClick: false });
  const [element, setElement] = createSignal<HTMLElement | null>(null);
  let returnedThroughGuard = false;
  createEffect(() => ({ open: store.state.open, positioner: store.state.positionerElement, trigger: element() }), ({ open, positioner, trigger }) => {
    if (!open || !positioner) return;
    const handleFocusOut = (event: FocusEvent) => {
      if (getTarget(event) === store.context.beforeContentFocusGuardRef.current) returnedThroughGuard = event.relatedTarget === trigger;
    };
    positioner.addEventListener('focusout', handleFocusOut, true);
    return () => { returnedThroughGuard = false; positioner.removeEventListener('focusout', handleFocusOut, true); };
  });
  createEffect(() => ({ element: element(), id: item.id() }), ({ element: node, id }) => { if (node) return store.registerTrigger(id, node); });
  const click = createClick(store.state.floatingRootContext, {
    get enabled() { return !item.disabled(); }, event: 'mousedown', toggle: true,
    get ignoreMouse() { return props.openOnHover ?? true; }, get stickIfOpen() { return props.openOnHover ?? true; },
  });
  const hover = createHoverReferenceInteraction(store.state.floatingRootContext, {
    get enabled() { return store.state.hoverEnabled && (props.openOnHover ?? true) && !item.disabled(); },
    handleClose: safePolygon({ blockPointerEvents: true }), mouseOnly: true, move: true,
    get restMs() { return props.delay ?? 100; }, get delay() { return { open: props.delay ?? 100, close: props.closeDelay ?? 0 }; },
    shouldOpen: () => (props.delay ?? 100) === 0 || parent.context.allowMouseEnter,
    triggerElementRef: { get current() { return element(); } }, guardStaleOpen: true,
    isClosing: () => store.state.transitionStatus === 'ending',
  });
  Object.defineProperty(store.context, 'closeDelay', { configurable: true, get: () => props.closeDelay ?? 0 });
  const state: MenuSubmenuTriggerState = {
    get disabled() { return item.disabled(); }, get highlighted() { return item.highlighted(); }, get open() { return store.state.open; },
  };
  const nativeProps = elementProps(props, ['label', 'nativeButton', 'disabled', 'openOnHover', 'delay', 'closeDelay']);
  return createRenderElement('div', props, { state, stateAttributesMapping: triggerMapping,
    get enabled() { return item.filter.visible; }, get ref() { return [props.ref, item.ref, setElement]; },
    get props() { return [click.reference, hover, store.state.activeTriggerProps,
      { onKeyDown: submenu?.onTriggerKeyDown }, parent.state.itemProps, {
        get 'aria-haspopup'() { return root.virtualFocus ? 'dialog' : 'menu'; },
        get 'aria-controls'() { return store.state.mounted ? store.state.floatingId : undefined; },
        get 'aria-expanded'() { return store.state.open && (store.state.openChangeReason === 'list-navigation' || store.state.openMethod === 'keyboard') && platform.screenReader.voiceOver ? undefined : store.state.open; },
        get tabindex() { return root.parentVirtualFocus || !(state.open || state.highlighted) ? -1 : 0; },
        onBlur() { if (state.highlighted) parent.setActiveIndex(null, 'none'); },
        onFocus(event: FocusEvent) {
          if (store.state.open && returnedThroughGuard) {
            returnedThroughGuard = false;
            store.setOpen(false, createChangeEventDetails('focus-out', event));
          }
        },
      }, nativeProps]; },
    propGetter: item.getItemProps,
  });
}
export namespace MenuSubmenuTrigger { export type Props = MenuSubmenuTriggerProps; export type State = MenuSubmenuTriggerState }
