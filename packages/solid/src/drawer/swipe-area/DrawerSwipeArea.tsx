// Adapted from pinned Base UI DrawerSwipeArea (MIT).
import { createEffect, createSignal, merge, onCleanup, omit, untrack } from 'solid-js';
import { useDialogRootContext } from '../../dialog/root/DialogRootContext';
import { createRenderElement } from '../../internals/createRenderElement';
import { createBaseUiId } from '../../internals/createBaseUiId';
import { createChangeEventDetails } from '../../internals/createBaseUIEventDetails';
import type { BaseUIComponentProps } from '../../internals/types';
import { createSwipeDismiss, getDisplacement } from '../../utils/createSwipeDismiss';
import { getElementTransform } from '../../utils/getElementTransform';
import { isVirtualClick } from '../../floating-ui-react/utils/event';
import { useDrawerRootContext, type DrawerSwipeDirection } from '../root/DrawerRootContext';
import { useDrawerProviderContext } from '../provider/DrawerProviderContext';
import type { DrawerSwipeProgress, DrawerSwipeRelease } from '../viewport/DrawerViewportContext';

const opposite: Record<DrawerSwipeDirection, DrawerSwipeDirection> = { up: 'down', down: 'up', left: 'right', right: 'left' };
export function DrawerSwipeArea(props: DrawerSwipeAreaProps) {
  const store = useDialogRootContext();
  const drawer = useDrawerRootContext();
  const provider = useDrawerProviderContext();
  const [element, setElement] = createSignal<HTMLDivElement | null>(null);
  const [active, setActive] = createSignal(false);
  let swipeActive = false;
  const id = createBaseUiId(() => typeof props.id === 'string' ? props.id : undefined);
  let start: PointerEvent | TouchEvent | null = null;
  let opened = false;
  let pendingOpen = false;
  let delta = { x: 0, y: 0 };
  let closedOffset: number | null = null;
  let popup: HTMLElement | null = null;
  let backdrop: HTMLElement | null = null;
  let transition: string | null = null;
  let releaseCleanup = () => {};
  const direction = () => props.swipeDirection ?? opposite[drawer.swipeDirection];
  const horizontal = () => direction() === 'left' || direction() === 'right';
  const enabled = () => { active(); return !props.disabled && (!store.state.open || swipeActive); };
  createEffect(() => ({ node: element(), id: id() }), ({ node, id }) => node && id ? store.registerTrigger(id, node) : undefined);
  function restoreDismissAfterRelease() {
    releaseCleanup();
    const doc = element()?.ownerDocument;
    if (!doc) { store.context.outsidePressEnabledRef.current = true; return; }
    function restore(event?: Event) {
      if (event?.type === 'click') {
        const click = event as MouseEvent;
        if (click.detail !== 0 && !isVirtualClick(click)) return;
      }
      doc!.removeEventListener('pointerdown', restore, true); doc!.removeEventListener('click', restore, true);
      releaseCleanup = () => {}; store.context.outsidePressEnabledRef.current = true;
    }
    releaseCleanup = restore;
    doc.addEventListener('pointerdown', restore, true); doc.addEventListener('click', restore, true);
  }
  function size(node: HTMLElement) { const value = horizontal() ? node.offsetWidth : node.offsetHeight; return value > 0 ? value : null; }
  function clearStyles() {
    popup?.style.removeProperty('--drawer-swipe-movement-x'); popup?.style.removeProperty('--drawer-swipe-movement-y'); popup?.removeAttribute('data-swiping');
    if (popup && transition !== null) popup.style.transition = transition;
    backdrop?.removeAttribute('data-swiping'); backdrop?.style.setProperty('--drawer-swipe-progress', '0'); backdrop?.style.removeProperty('--drawer-height');
    provider?.visualStateStore.set({ swipeProgress: 0, frontmostHeight: 0 });
    popup = null; backdrop = null; transition = null; drawer.swipeAreaActiveRef.current = false;
  }
  function applyMovement() {
    const node = store.context.popupRef();
    if (!node || !store.state.open || !store.state.mounted) return;
    if (closedOffset === null) {
      const extent = size(node);
      if (extent === null) return;
      const transform = getElementTransform(node);
      const offset = horizontal() ? transform.x : transform.y;
      closedOffset = Number.isFinite(offset) && Math.abs(offset) > 0.5 ? Math.min(extent, Math.abs(offset)) : extent;
    }
    const displacement = Math.max(0, getDisplacement(direction(), delta.x, delta.y));
    const damped = displacement > closedOffset ? closedOffset + Math.sqrt(displacement - closedOffset) : displacement;
    const sign = opposite[direction()] === 'left' || opposite[direction()] === 'up' ? -1 : 1;
    const movement = (closedOffset - damped) * sign;
    const progress = Math.max(0, Math.min(1, displacement / closedOffset));
    if (popup && popup !== node) clearStyles();
    popup = node;
    node.style.setProperty('--drawer-swipe-movement-x', `${horizontal() ? movement : 0}px`);
    node.style.setProperty('--drawer-swipe-movement-y', `${horizontal() ? 0 : movement}px`);
    node.setAttribute('data-swiping', '');
    if (transition === null) transition = node.style.transition;
    node.style.transition = 'none';
    backdrop = store.context.backdropRef();
    backdrop?.setAttribute('data-swiping', ''); backdrop?.style.setProperty('--drawer-swipe-progress', `${1 - progress}`);
    if (progress > 0 && drawer.frontmostHeight > 0) backdrop?.style.setProperty('--drawer-height', `${drawer.frontmostHeight}px`);
    else backdrop?.style.removeProperty('--drawer-height');
    provider?.visualStateStore.set({ swipeProgress: progress, frontmostHeight: progress > 0 ? drawer.frontmostHeight : 0 });
    drawer.swipeAreaActiveRef.current = true;
  }
  function requestOpen(event: PointerEvent | TouchEvent) {
    opened = true;
    // Set before requesting: the popup may attach only after this transaction commits.
    drawer.swipeAreaActiveRef.current = true;
    const details = createChangeEventDetails('swipe', event, element() ?? undefined);
    store.setOpen(true, details);
    pendingOpen = !details.isCanceled && store.state.openProp === undefined;
    queueMicrotask(() => { pendingOpen = false; });
    if (details.isCanceled) drawer.swipeAreaActiveRef.current = false;
  }
  function finish() { start = null; opened = false; closedOffset = null; swipeActive = false; setActive(false); restoreDismissAfterRelease(); delta = { x: 0, y: 0 }; clearStyles(); }
  const swipe = createSwipeDismiss({
    get enabled() { return enabled(); }, get directions() { return [direction()]; }, elementRef: element,
    trackDrag: false, movementCssVars: { x: '--drawer-swipe-movement-x', y: '--drawer-swipe-movement-y' },
    onSwipeStart(event: PointerEvent | TouchEvent) { releaseCleanup(); store.context.outsidePressEnabledRef.current = false; start = event; opened = false; swipeActive = true; setActive(true); delta = { x: 0, y: 0 }; },
    onProgress(_progress: number, details?: DrawerSwipeProgress) {
      if (!details || !start) return;
      delta = { x: details.deltaX, y: details.deltaY };
      if (details.direction !== direction()) return;
      if (!opened && getDisplacement(direction(), delta.x, delta.y) < 1) return;
      if (!opened && !store.state.open) requestOpen(start);
      applyMovement();
    },
    onRelease({ event, direction: releaseDirection, deltaX, deltaY, releaseVelocityX, releaseVelocityY }: DrawerSwipeRelease) {
      const node = store.context.popupRef();
      const extent = node ? size(node) : null;
      const distance = getDisplacement(direction(), deltaX, deltaY);
      const velocity = getDisplacement(direction(), releaseVelocityX, releaseVelocityY);
      const shouldOpen = releaseDirection === direction() && (distance >= (extent === null ? 40 : extent * 0.5) || velocity >= 0.1) && !props.disabled;
      if (shouldOpen) { if (!store.state.open && !pendingOpen) requestOpen(event); }
      else if (opened && store.state.open) store.setOpen(false, createChangeEventDetails('swipe', event, element() ?? undefined));
      finish(); return false;
    },
    onCancel: finish,
  });
  const pointer = () => swipe.getPointerProps();
  createEffect(() => ({ active: active(), open: store.state.open, mounted: store.state.mounted, popup: store.state.popupElement, height: drawer.frontmostHeight }), value => { if (value.active && start) untrack(applyMovement); });
  createEffect(enabled, value => { if (!value) untrack(() => { if (swipeActive) restoreDismissAfterRelease(); swipe.reset(); clearStyles(); start = null; opened = false; closedOffset = null; delta = { x: 0, y: 0 }; swipeActive = false; setActive(false); }); });
  onCleanup(() => { releaseCleanup(); swipe.reset(); clearStyles(); store.context.outsidePressEnabledRef.current = true; });
  const state: DrawerSwipeAreaState = { get open() { return store.state.open; }, get swiping() { return swipe.swiping; }, get disabled() { return props.disabled ?? false; }, get swipeDirection() { return direction(); } };
  return createRenderElement<DrawerSwipeAreaState, HTMLDivElement>('div', props, {
    state, ref: setElement,
    stateAttributesMapping: { open: value => ({ [value ? 'data-open' : 'data-closed']: '' }), swiping: value => value ? { 'data-swiping': '' } : null, disabled: value => value ? { 'data-disabled': '' } : null, swipeDirection: value => ({ 'data-swipe-direction': value }) },
    props: [{ role: 'presentation', 'aria-hidden': true, get id() { return id(); }, get style() { return { 'pointer-events': enabled() ? undefined : 'none', 'touch-action': horizontal() ? 'pan-y' : 'pan-x' }; },
      onPointerDown(event: PointerEvent) { if (event.pointerType === 'touch') return; pointer().onPointerDown?.(event); if (event.cancelable) event.preventDefault(); },
      onPointerMove(event: PointerEvent) { if (event.pointerType !== 'touch') pointer().onPointerMove?.(event); },
      onPointerUp(event: PointerEvent) { if (event.pointerType !== 'touch') pointer().onPointerUp?.(event); },
      onPointerCancel(event: PointerEvent) { if (event.pointerType !== 'touch') pointer().onPointerCancel?.(event); },
    }, merge(() => swipe.getTouchProps()), omit(props, 'render', 'class', 'style', 'disabled', 'swipeDirection')],
  });
}
export interface DrawerSwipeAreaState { open: boolean; swiping: boolean; swipeDirection: DrawerSwipeDirection; disabled: boolean }
export interface DrawerSwipeAreaProps extends BaseUIComponentProps<'div', DrawerSwipeAreaState> { disabled?: boolean; swipeDirection?: DrawerSwipeDirection }
export namespace DrawerSwipeArea { export type Props = DrawerSwipeAreaProps; export type State = DrawerSwipeAreaState; }
