// Adapted from pinned Base UI DrawerPopup (MIT); Dialog/focus/presence engines stay shared.
import { createEffect, merge, omit, onCleanup, onSettled, untrack } from 'solid-js';
import { ownerWindow } from '../../utils/owner';
import { FloatingFocusManager } from '../../floating-ui-react/components/FloatingFocusManager';
import { useDialogRootContext } from '../../dialog/root/DialogRootContext';
import { useDialogPortalContext } from '../../dialog/portal/DialogPortalContext';
import type { DialogFocusTarget } from '../../dialog/popup/DialogPopup';
import { createRenderElement } from '../../internals/createRenderElement';
import { createRenderedId } from '../../internals/resolveRenderedId';
import type { BaseUIComponentProps, TransitionStatus } from '../../internals/types';
import { FOCUSABLE_POPUP_PROPS } from '../../utils/popups';
import { useDrawerRootContext, type DrawerSwipeDirection } from '../root/DrawerRootContext';
import { createDrawerSnapPoints, getSnapPointSwipeMovement } from '../root/createDrawerSnapPoints';
import { useDrawerViewportContext, type DrawerViewportContext } from '../viewport/DrawerViewportContext';

const registered = new WeakSet<object>();
function registerSwipeProperties(node: HTMLElement) {
  const css = ownerWindow(node).CSS;
  if (!css || !('registerProperty' in css) || registered.has(css)) return;
  for (const name of ['--drawer-swipe-movement-x', '--drawer-swipe-movement-y', '--drawer-snap-point-offset', '--drawer-swipe-progress', '--drawer-swipe-strength']) {
    const number = name === '--drawer-swipe-progress' || name === '--drawer-swipe-strength';
    try { css.registerProperty({ name, syntax: number ? '<number>' : '<length>', inherits: false, initialValue: name === '--drawer-swipe-strength' ? '1' : number ? '0' : '0px' }); } catch { /* Already registered by another independent bundle. */ }
  }
  registered.add(css);
}

export function DrawerPopup(props: DrawerPopupProps) {
  const store = useDialogRootContext();
  const drawer = useDrawerRootContext();
  const viewport = useDrawerViewportContext();
  const swipe: Pick<DrawerViewportContext, 'swiping' | 'swipeStrength' | 'getDragStyles'> = viewport ?? { swiping: false, swipeStrength: null, getDragStyles: () => ({}) };
  const snaps = createDrawerSnapPoints();
  const [popupId, registerId] = createRenderedId(props, store.defaultFloatingId, id => store.setFloatingId(id ?? store.defaultFloatingId));
  useDialogPortalContext();
  onSettled(() => {
    if (!viewport && process.env.NODE_ENV !== 'production') console.error('Base UI: <Drawer.Popup> expected to be rendered within <Drawer.Viewport>. Omitting the viewport disables drawer swipe handling and touch scroll locking. Wrap <Drawer.Popup> in <Drawer.Viewport>.');
  });
  let measuredHeight = 0;
  createEffect(() => ({ node: store.state.popupElement, mounted: store.state.mounted, nested: store.state.nestedOpenDrawerCount }), ({ node, mounted }) => {
    if (!node || !mounted) { measuredHeight = 0; drawer.onPopupHeightChange(0); return; }
    const win = ownerWindow(node);
    let disposed = false;
    registerSwipeProperties(node);
    const measure = () => untrack(() => {
      if (disposed || store.state.popupElement !== node) return;
      const height = node.offsetHeight;
      if (measuredHeight > 0 && drawer.frontmostHeight > measuredHeight && height > measuredHeight) return;
      if (measuredHeight > 0 && drawer.hasNestedDrawer) { drawer.onPopupHeightChange(measuredHeight); return; }
      if (height !== measuredHeight) { measuredHeight = height; drawer.onPopupHeightChange(height); }
    });
    measure();
    const observer = win.ResizeObserver ? new win.ResizeObserver(measure) : null;
    observer?.observe(node);
    return () => { disposed = true; observer?.disconnect(); };
  });
  createEffect(() => store.state.popupElement, node => {
    if (!node) return;
    const sync = () => node.style.setProperty('--drawer-swipe-progress', `${Math.max(0, drawer.nestedSwipeProgressStore.getSnapshot())}`);
    sync();
    const cleanup = drawer.nestedSwipeProgressStore.subscribe(sync);
    return () => { cleanup(); node.style.setProperty('--drawer-swipe-progress', '0'); };
  });
  onCleanup(() => drawer.onPopupHeightChange(0));
  const state: DrawerPopupState = {
    get open() { return store.state.open; }, get transitionStatus() { return store.state.transitionStatus; },
    get nested() { return store.state.nested; }, get expanded() { return drawer.activeSnapPoint === 1; },
    get nestedDrawerOpen() { return store.state.nestedOpenDrawerCount > 0; },
    get nestedDrawerSwiping() { return drawer.nestedSwiping; }, get swipeDirection() { return drawer.swipeDirection; },
    get swiping() { return swipe.swiping; },
  };
  const rootPopupProps = merge(() => store.state.popupProps);
  const elementProps = omit(props, 'render', 'class', 'style', 'initialFocus', 'finalFocus');
  const defaults = {
    ...FOCUSABLE_POPUP_PROPS,
    get id() { return popupId(); },
    get role() { return store.state.role; },
    get 'aria-labelledby'() { return store.state.titleElementId; },
    get 'aria-describedby'() { return store.state.descriptionElementId; },
    get hidden() { return !store.state.mounted; },
    onKeyDown(event: KeyboardEvent) { if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown'].includes(event.key)) event.stopPropagation(); },
    get style() {
      const verticalSnaps = !!drawer.snapPoints?.length && (drawer.swipeDirection === 'down' || drawer.swipeDirection === 'up');
      const offset = verticalSnaps ? (snaps.activeSnapPointOffset ?? 0) * (drawer.swipeDirection === 'up' ? -1 : 1) : 0;
      const drag = { ...swipe.getDragStyles() };
      if (verticalSnaps && drawer.swipeDirection === 'down') {
        const movement = parseFloat(String(drag['--drawer-swipe-movement-y']));
        drag.transform = undefined;
        if (swipe.swiping && Number.isFinite(movement)) drag['--drawer-swipe-movement-y'] = `${getSnapPointSwipeMovement(snaps.activeSnapPointOffset ?? 0, movement)}px`;
      }
      return { ...drag, '--drawer-swipe-progress': '0', '--nested-drawers': store.state.nestedOpenDrawerCount,
        '--drawer-height': drawer.popupHeight && (drawer.hasNestedDrawer || store.state.transitionStatus === 'ending') ? `${drawer.popupHeight}px` : undefined,
        '--drawer-snap-point-offset': `${offset}px`, '--drawer-frontmost-height': drawer.frontmostHeight ? `${drawer.frontmostHeight}px` : undefined,
        '--drawer-swipe-strength': swipe.swipeStrength && Number.isFinite(swipe.swipeStrength) && swipe.swipeStrength > 0 ? `${swipe.swipeStrength}` : '1' };
    },
  };
  const element = createRenderElement<DrawerPopupState, HTMLDivElement>('div', props, {
    state, ref: [store.setPopupElement, registerId],
    props: [rootPopupProps, defaults, elementProps],
    stateAttributesMapping: {
      open: value => ({ [value ? 'data-open' : 'data-closed']: '' }),
      transitionStatus: (value): Record<string, string> | null => value === 'starting' ? { 'data-starting-style': '' } : value === 'ending' ? { 'data-ending-style': '' } : null,
      expanded: value => value ? { 'data-expanded': '' } : null,
      nested: value => value ? { 'data-nested': '' } : null,
      nestedDrawerOpen: value => value ? { 'data-nested-drawer-open': '' } : null,
      nestedDrawerSwiping: value => value ? { 'data-nested-drawer-swiping': '' } : null,
      swipeDirection: value => ({ 'data-swipe-direction': value }),
      swiping: value => value ? { 'data-swiping': '' } : null,
    },
  });
  return <FloatingFocusManager context={store.state.floatingRootContext} openInteractionType={store.state.openMethod}
    disabled={!store.state.mounted} closeOnFocusOut={!store.state.disablePointerDismissal}
    initialFocus={props.initialFocus === undefined ? store.context.popupRef : props.initialFocus}
    returnFocus={props.finalFocus} modal={store.state.modal !== false} restoreFocus="popup">{element}</FloatingFocusManager>;
}
export interface DrawerPopupState {
  open: boolean; transitionStatus: TransitionStatus; expanded: boolean; nested: boolean;
  nestedDrawerOpen: boolean; nestedDrawerSwiping: boolean; swipeDirection: DrawerSwipeDirection; swiping: boolean;
}
export interface DrawerPopupProps extends BaseUIComponentProps<'div', DrawerPopupState> { initialFocus?: DialogFocusTarget; finalFocus?: DialogFocusTarget; id?: string }
export namespace DrawerPopup { export type Props = DrawerPopupProps; export type State = DrawerPopupState; }
