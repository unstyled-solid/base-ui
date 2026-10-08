import { useContext, untrack } from 'solid-js';
import { FloatingFocusManager, type FloatingFocusManagerProps } from '../../floating-ui-react/components/FloatingFocusManager';
import { createRenderElement } from '../../internals/createRenderElement';
import type { BaseUIComponentProps } from '../../internals/types';
import type { TransitionStatus } from '../../internals/contracts/core';
import type { Side, Align } from '../../internals/createAnchorPositioning';
import { useMenuRootContext } from '../root/MenuRootContext';
import { useMenuPositionerContext } from '../positioner/MenuPositionerContext';
import { useMenuSubmenuRootContext } from '../submenu-root/MenuSubmenuRootContext';
import { useMenuFilterImpl, MenuFilterImplContext } from '../filter-root/MenuFilterContext';
import { popupMapping } from '../utils/stateAttributesMapping';
import { elementProps } from '../utils/props';
import type { MenuInstant } from '../store/MenuStore';
import type { MenuTree } from '../utils/MenuTreeEvents';
import type { MutableCell } from '../../internals/contracts/core';
import { createHoverFloatingInteraction } from '../../floating-ui-react/hooks/createHoverFloatingInteraction';
import { getDisabledMountTransitionStyles } from '../../internals/getDisabledMountTransitionStyles';
import { createRenderedId } from '../../internals/resolveRenderedId';
import type { InteractionType } from '../../utils/createEnhancedClickHandler';
import { useToolbarRootContext } from '../../toolbar/root/ToolbarRootContext';
import { COMPOSITE_KEYS } from '../../internals/composite/composite';
import { createPopupLabel } from '../../internals/resolvePopupLabel';
export interface MenuPopupState { transitionStatus: TransitionStatus; side: Side; align: Align; open: boolean; nested: boolean; instant: MenuInstant }
export interface MenuPopupProps extends BaseUIComponentProps<'div', MenuPopupState> {
  finalFocus?: boolean | (() => HTMLElement | null) | ((closeType: InteractionType) => boolean | HTMLElement | null | void);
}
export interface MenuPopupPlainProps extends MenuPopupProps { initialFocus?: FloatingFocusManagerProps['initialFocus'] }
interface MenuFocusManagerParameters extends FloatingFocusManagerProps {
  openInteractionType: InteractionType | null;
  explicitReturnFocus: boolean | undefined;
  getInsideElements: (() => (HTMLElement | null)[]) | undefined;
  externalTree: MenuTree | undefined;
  previousFocusableElement: HTMLElement | null;
  nextFocusableElement: MutableCell<HTMLElement | null> | undefined;
  beforeContentFocusGuardRef: MutableCell<HTMLElement | null>;
}
export function MenuPopupPlain(props: MenuPopupPlainProps) {
  const root = useMenuRootContext(); const store = root.store; const position = useMenuPositionerContext();
  const inheritedSubmenu = useMenuSubmenuRootContext();
  const toolbar = useToolbarRootContext(true);
  const submenu = () => store.state.parent.type === 'menu' ? inheritedSubmenu : null;
  const handoff = useContext(MenuFilterImplContext)?.useParentHandoff(store, () => store.state.parent, untrack(() => root.virtualFocus));
  createHoverFloatingInteraction(store.state.floatingRootContext, {
    get enabled() { return store.state.hoverEnabled && !store.state.disabled && store.state.parent.type !== 'context-menu' && store.state.parent.type !== 'menubar'; },
    get closeDelay() { return store.state.closeDelay; },
  });
  const idProps = new Proxy(props, {
    get(target, key) { return key === 'id' ? typeof props.id === 'string' ? props.id : undefined : Reflect.get(target, key, target); },
  }) as { id?: string; render?: unknown };
  const [id, registerId] = createRenderedId(idProps, () => root.defaultFloatingId, root.setRenderedFloatingId);
  const label = createPopupLabel(props, () => store.state.listElement ? null : store.state.activeTriggerElement,
    () => store.state.listElement ? null : store.state.activeTriggerId);
  const nativeProps = elementProps(props, ['finalFocus', 'initialFocus', 'id']);
  const state: MenuPopupState = {
    get open() { return store.state.open; }, get transitionStatus() { return store.state.transitionStatus; },
    get side() { return position.side; }, get align() { return position.align; },
    get nested() { return store.state.parent.type === 'menu'; }, get instant() { return store.state.instantType; },
  };
  const focus: MenuFocusManagerParameters = {
    context: store.state.floatingRootContext,
    get disabled() { return !store.state.mounted; }, get modal() { return store.state.parent.type === 'context-menu'; }, restoreFocus: true,
    get initialFocus() {
      if (props.initialFocus !== undefined) return props.initialFocus;
      if (store.state.parent.type === 'menu') return false;
      if (store.state.listElement) return () => store.state.activeIndex !== null ? false : store.state.listElement;
      return true;
    },
    get returnFocus() {
      const target = props.finalFocus;
      if (typeof target === 'function') return (interaction: string) => {
        const result = target(interaction as InteractionType);
        return result === undefined ? undefined : result;
      };
      const parent = store.state.parent;
      const defaultReturn = parent.type === undefined || parent.type === 'context-menu' || !!store.state.activeTriggerElement || parent.type === 'menubar' && store.state.openChangeReason !== 'outside-press';
      return target ?? submenu()?.getReturnElement ?? handoff?.getReturnElement ?? defaultReturn;
    },
    get explicitReturnFocus() { return props.finalFocus === undefined && (submenu()?.getReturnElement || handoff?.getReturnElement) ? false : undefined; },
    get openInteractionType() { return store.state.openMethod; },
    get getInsideElements() { return store.state.parent.type === undefined ? () => [store.context.beforeTriggerFocusGuardRef.current] : undefined; },
    get externalTree() { return store.state.parent.type !== 'menubar' ? store.state.floatingTreeRoot : undefined; },
    get previousFocusableElement() { return store.state.activeTriggerElement as HTMLElement | null; },
    get nextFocusableElement() { return store.state.parent.type === undefined ? store.context.triggerFocusTargetRef : undefined; },
    beforeContentFocusGuardRef: store.context.beforeContentFocusGuardRef,
  };
  function PopupElement() {
    return createRenderElement('div', props, { state, stateAttributesMapping: popupMapping,
      get ref() { return [props.ref, registerId, label.ref, store.setPopupElement]; },
      get props() { return [store.state.popupProps, {
        get id() { return id(); },
        get role() { return store.state.listElement ? 'presentation' : 'menu'; },
        get 'aria-orientation'() { return !store.state.listElement && root.orientation === 'horizontal' ? 'horizontal' : undefined; },
        onKeyDown(event: KeyboardEvent) { submenu()?.onPopupKeyDown?.(event); if (toolbar && COMPOSITE_KEYS.has(event.key)) event.stopPropagation(); },
        onFocus: handoff?.handleFocus,
        get 'data-rootownerid'() { return store.state.rootId; },
      }, label.props, getDisabledMountTransitionStyles(store.state.transitionStatus), nativeProps]; },
    });
  }
  return <FloatingFocusManager {...focus}><PopupElement /></FloatingFocusManager>;
}
export function MenuPopup(props: MenuPopupProps) {
  const Popup = useMenuFilterImpl()?.Popup ?? MenuPopupPlain;
  return <Popup {...props} />;
}
export namespace MenuPopup { export type Props = MenuPopupProps; export type State = MenuPopupState }
