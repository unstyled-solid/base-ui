import { createEffect, omit, onCleanup, untrack } from 'solid-js';
import type { BaseUIComponentProps } from '../../internals/types';
import type { Side, Align } from '../../internals/createAnchorPositioning';
import type { TransitionStatus } from '../../internals/createTransitionStatus';
import { transitionStatusMapping } from '../../internals/stateAttributesMapping';
import { createRenderElement } from '../../internals/createRenderElement';
import { FloatingFocusManager, type FloatingFocusManagerProps } from '../../floating-ui-react/components/FloatingFocusManager';
import { createChangeEventDetails } from '../../internals/createBaseUIEventDetails';
import { useDirection } from '../../internals/direction-context/DirectionContext';
import { ownerWindow } from '../../utils/owner';
import { useSelectRootContext } from '../root/SelectRootContext';
import { useSelectPositionerContext } from '../positioner/SelectPositionerContext';
import { alignSelectedItem, growAlignedPopup } from './geometry';
import { LIST_FUNCTIONAL_STYLES } from './utils';
import { useToolbarRootContext } from '../../toolbar/root/ToolbarRootContext';
import { COMPOSITE_KEYS } from '../../internals/composite/composite';
import { styleDisableScrollbar } from '../../utils/styles';
import { useCSPContext } from '../../internals/csp-context/CSPContext';
import { getDisabledMountTransitionStyles } from '../../internals/getDisabledMountTransitionStyles';
import { mergeProps } from '../../merge-props';

export function SelectPopup(props: SelectPopupProps) {
  const model = useSelectRootContext();
  const positioner = useSelectPositionerContext();
  const direction = useDirection();
  const toolbar = useToolbarRootContext(true);
  const csp = useCSPContext();
  let reachedMaxHeight = false;
  let placed = false;
  let original: { element: HTMLElement; popup: HTMLElement; styles: Partial<CSSStyleDeclaration>; popupHeight: string } | undefined;
  function restorePlacement() {
    if (original) {
      Object.assign(original.element.style, original.styles);
      original.popup.style.height = original.popupHeight;
      original = undefined;
    }
    placed = false; reachedMaxHeight = false;
  }
  const scroll = (scroller: HTMLElement) => {
    if (!placed) return;
    if (!reachedMaxHeight && positioner.alignItemWithTriggerActive && model.positionerElement && model.popupElement) {
      reachedMaxHeight = growAlignedPopup(model.positionerElement, model.popupElement, scroller);
    }
    model.updateScroll(scroller);
  };
  model.scrollHandler = scroll;
  onCleanup(() => { model.scrollHandler = model.updateScroll; restorePlacement(); });
  createEffect(() => ({ mounted: model.mounted, aligned: positioner.alignItemWithTriggerActive }), data => {
    if (!data.mounted || !data.aligned) restorePlacement();
  });
  createEffect(() => ({
    open: model.open, aligned: positioner.alignItemWithTriggerActive,
    layoutRevision: positioner.layoutRevision,
    positioned: positioner.positioning.isPositioned,
    trigger: model.triggerElement, positioner: model.positionerElement, popup: model.popupElement,
    list: model.listElement, value: model.valueElement,
    text: model.ordered().find(item => item.index === (model.selectedIndex ?? (!model.hasSelectedValue ? 0 : -1)))?.text ?? null,
    direction: direction(),
  }), data => {
    if (!data.open || !data.trigger || !data.positioner || !data.popup || (data.aligned && !data.positioned)) return;
    const scroller = data.list ?? data.popup;
    const element = data.positioner;
    const saved = { top: element.style.top, left: element.style.left, right: element.style.right, bottom: element.style.bottom, height: element.style.height, minHeight: element.style.minHeight, maxHeight: element.style.maxHeight, marginTop: element.style.marginTop, marginBottom: element.style.marginBottom };
    if (!original && data.aligned) original = { element, popup: data.popup, styles: saved, popupHeight: data.popup.style.height };
    placed = true; reachedMaxHeight = false;
    data.popup.style.removeProperty('--transform-origin');
    if (data.aligned) {
      const result = alignSelectedItem({ trigger: data.trigger, positioner: element, popup: data.popup, scroller, text: data.text?.isConnected ? data.text : null, value: data.value, direction: data.direction });
      reachedMaxHeight = result.reachedMaxHeight;
      if (result.fallback) positioner.setAlignFallback(true);
      else untrack(() => {
        if ((model.props.highlightItemOnHover ?? true) && model.selectedIndex === null && model.activeIndex === null && model.listRef.current[0]) model.setActiveIndex(0);
      });
    }
    model.updateScroll(scroller);
    const win = ownerWindow(element);
    const resize = (event: UIEvent) => { if (data.aligned) model.setOpen(false, createChangeEventDetails('window-resize', event)); };
    win.addEventListener('resize', resize);
    const observer = typeof win.ResizeObserver === 'function' ? new win.ResizeObserver(() => model.updateScroll(scroller)) : null;
    observer?.observe(scroller);
    return () => {
      win.removeEventListener('resize', resize); observer?.disconnect();
      // Keep the aligned placement throughout an exit; restore when that positioning mode ends.
    };
  });
  const state: SelectPopupState = {
    get open() { return model.open; }, get transitionStatus() { return model.transitionStatus; },
    get side() { return positioner.side; }, get align() { return positioner.positioning.align; },
  };
  const Host = () => createRenderElement<SelectPopupState, HTMLElement>('div', props, {
    state, ref: model.setPopupElement,
    stateAttributesMapping: { ...transitionStatusMapping, open: open => ({ [open ? 'data-open' : 'data-closed']: '' }) },
    props: [external => mergeProps<any>(external, model.popupProps()), {
      get role() { return model.listElement ? 'presentation' : 'listbox'; },
      get id() { return model.listElement ? undefined : `${model.id()}-list`; },
      get 'aria-multiselectable'() { return !model.listElement && model.multiple || undefined; },
      get 'aria-readonly'() { return !model.listElement && model.readOnly || undefined; },
      get style() { return positioner.alignItemWithTriggerActive ? model.listElement ? { height: '100%' } : LIST_FUNCTIONAL_STYLES : undefined; },
      get class() { return !model.listElement && positioner.alignItemWithTriggerActive ? styleDisableScrollbar.className : undefined; },
      onScroll(event: Event) { if (!model.listElement) scroll(event.currentTarget as HTMLElement); },
      onKeyDown(event: KeyboardEvent) { if (toolbar && COMPOSITE_KEYS.has(event.key)) event.stopPropagation(); },
    }, external => mergeProps<any>(external, getDisabledMountTransitionStyles(model.transitionStatus)), omit(props, 'class', 'style', 'render', 'finalFocus')],
  });
  return <>{!csp?.disableStyleElements ? styleDisableScrollbar.getElement(csp?.nonce) : null}
    <FloatingFocusManager context={model.popup.state.floatingRootContext} modal={false} disabled={!model.mounted}
      openInteractionType={model.openMethod} returnFocus={props.finalFocus} restoreFocus><Host /></FloatingFocusManager>
  </>;
}
export interface SelectPopupState { side: Side | 'none'; align: Align; open: boolean; transitionStatus: TransitionStatus }
export interface SelectPopupProps extends BaseUIComponentProps<'div', SelectPopupState> { finalFocus?: FloatingFocusManagerProps['returnFocus'] }
export namespace SelectPopup { export type Props = SelectPopupProps; export type State = SelectPopupState }
