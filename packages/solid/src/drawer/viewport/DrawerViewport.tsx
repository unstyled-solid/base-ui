// Adapted from pinned Base UI DrawerViewport (MIT); gesture recognition stays foundation-owned.
import { createEffect, createSignal, onCleanup, untrack } from 'solid-js';
import { isElement } from '@floating-ui/utils/dom';
import { DialogViewport } from '../../dialog/viewport/DialogViewport';
import { useDialogRootContext } from '../../dialog/root/DialogRootContext';
import { createSwipeDismiss, getDisplacement } from '../../utils/createSwipeDismiss';
import { createChangeEventDetails } from '../../internals/createBaseUIEventDetails';
import { getElementAtPoint } from '../../utils/getElementAtPoint';
import { findScrollableTouchTarget } from '../../utils/scrollable';
import { closest, contains, getTarget } from '../../utils/shadowDom';
import { ownerWindow } from '../../utils/owner';
import { mergeProps } from '../../merge-props';
import type { BaseUIComponentProps, TransitionStatus } from '../../internals/types';
import { useDrawerRootContext } from '../root/DrawerRootContext';
import { createDrawerSnapPoints } from '../root/createDrawerSnapPoints';
import { getSnapPointSwipeMovement, resolveSnapRelease, resolveSwipeReleaseStrength, type DrawerSnapPoint, type DrawerSwipeDirection } from '../root/snapPoints';
import { useDrawerProviderContext } from '../provider/DrawerProviderContext';
import { useDrawerVirtualKeyboardContext } from '../virtual-keyboard-provider/DrawerVirtualKeyboardContext';
import { DrawerViewportContext, type DrawerSwipeProgress, type DrawerSwipeRelease } from './DrawerViewportContext';
import { shouldYieldTouchMove, shouldIgnoreSwipeForTextSelection, getBaseSwipeSize, getBaseSwipeThreshold, getScrollMetrics, isAtSwipeStartEdge, canSwipeFromScrollEdgeOnMove, type TouchScrollState, type ScrollAxis } from './touchArbitration';

export function DrawerViewport(props: DrawerViewportProps) {
  const store = useDialogRootContext();
  const drawer = useDrawerRootContext();
  const snaps = createDrawerSnapPoints();
  const provider = useDrawerProviderContext();
  const keyboard = useDrawerVirtualKeyboardContext();
  const [strength, setStrength] = createSignal<number | null>(null);
  let swiping = false;
  let nestedSwipe = false;
  let pointerType = '';
  let penTouch = false;
  let ignoreTouch = false;
  let touchState: TouchScrollState | null = null;
  let pendingSnap: DrawerSnapPoint | null | undefined;
  let cancelControlledFrame = () => {};
  const axis = (): ScrollAxis => drawer.swipeDirection === 'left' || drawer.swipeDirection === 'right' ? 'horizontal' : 'vertical';
  const hasSnaps = () => !!drawer.snapPoints?.length;
  const canInteract = () => store.state.open && store.state.mounted && store.state.nestedOpenDrawerCount === 0;
  function setSwipeDismissed(value: boolean) {
    store.context.popupRef()?.toggleAttribute('data-swipe-dismiss', value);
    store.context.backdropRef()?.toggleAttribute('data-swipe-dismiss', value);
  }
  function clearRelease() {
    setSwipeDismissed(false);
    store.context.popupRef()?.removeAttribute('data-ending-style');
    store.context.popupRef()?.style.setProperty('--drawer-swipe-strength', '1');
    setStrength(null);
  }
  function finishNested() { if (nestedSwipe) { nestedSwipe = false; drawer.notifyParentSwipingChange?.(false); } }
  function snapRange() {
    if (!hasSnaps() || drawer.snapPoints!.length < 2 || snaps.resolvedSnapPoints.length < 2 || axis() !== 'vertical') return null;
    const offsets = snaps.resolvedSnapPoints.map(point => point.offset).sort((a, b) => a - b);
    return { min: offsets[0], range: offsets[1] - offsets[0] };
  }
  const clamp = (value: number) => Math.max(0, Math.min(1, value));
  function applyProgress(progress: number, notify: boolean) {
    const active = store.state.open && !store.state.nested;
    const value = active ? progress : 0;
    if (notify) {
      drawer.notifyParentSwipeProgressChange?.(store.state.open ? progress : 0);
      if (progress <= 0) finishNested();
    }
    provider?.visualStateStore.set({ swipeProgress: value, frontmostHeight: value > 0 ? drawer.frontmostHeight : 0 });
    const backdrop = store.context.backdropRef();
    backdrop?.style.setProperty('--drawer-swipe-progress', value > 0 ? `${value}` : '0');
    if (value > 0 && drawer.frontmostHeight > 0) backdrop?.style.setProperty('--drawer-height', `${drawer.frontmostHeight}px`);
    else backdrop?.style.removeProperty('--drawer-height');
  }
  const swipe = createSwipeDismiss({
    get enabled() { return store.state.mounted && store.state.nestedOpenDrawerCount === 0; },
    get directions(): DrawerSwipeDirection[] { return hasSnaps() && axis() === 'vertical' ? [drawer.swipeDirection, drawer.swipeDirection === 'down' ? 'up' : 'down'] : [drawer.swipeDirection]; },
    elementRef: store.context.popupRef,
    ignoreSelectorWhenTouch: false,
    ignoreScrollableAncestors: true,
    movementCssVars: { x: '--drawer-swipe-movement-x', y: '--drawer-swipe-movement-y' },
    swipeThreshold: ({ element, direction }: { element: HTMLElement; direction: DrawerSwipeDirection }) => getBaseSwipeThreshold(element, direction),
    onSwipeStart(event: PointerEvent | TouchEvent) {
      if ('touches' in event || event.pointerType === 'touch') return;
      const popup = store.context.popupRef();
      const selection = popup?.ownerDocument.getSelection();
      if (!selection || selection.isCollapsed) return;
      const anchor = isElement(selection.anchorNode) ? selection.anchorNode : selection.anchorNode?.parentElement;
      const focus = isElement(selection.focusNode) ? selection.focusNode : selection.focusNode?.parentElement;
      if (contains(popup, anchor) || contains(popup, focus)) selection.removeAllRanges();
    },
    onSwipingChange(value: boolean) {
      swiping = value;
      store.context.backdropRef()?.toggleAttribute('data-swiping', value);
      if (!value && !drawer.notifyParentSwipeProgressChange) finishNested();
    },
    canStart(position: { x: number; y: number }, details: { nativeEvent: PointerEvent | TouchEvent }) {
      const popup = store.context.popupRef();
      if (!popup) return false;
      const target = getElementAtPoint(popup.getRootNode(), position.x, position.y);
      if (!target || !contains(popup, target)) return false;
      const touch = 'touches' in details.nativeEvent || details.nativeEvent.pointerType === 'touch';
      if (touch && shouldIgnoreSwipeForTextSelection(popup.ownerDocument, popup)) return false;
      if (touch && touchState?.hasCrossAxisGestureTarget && !touchState.drawerAxisAttributed && touchState.allowSwipe !== true) return false;
      return true;
    },
    onProgress(progress: number, details?: DrawerSwipeProgress) {
      if (swiping && details && !nestedSwipe && Math.abs(getDisplacement(details.direction ?? drawer.swipeDirection, details.deltaX, details.deltaY)) >= 10) {
        nestedSwipe = true; drawer.notifyParentSwipingChange?.(true);
      }
      if (swiping && drawer.swipeDirection === 'down' && hasSnaps() && details) {
        const popup = store.context.popupRef();
        popup?.style.removeProperty('transform');
        popup?.style.setProperty('--drawer-swipe-movement-y', `${getSnapPointSwipeMovement(snaps.activeSnapPointOffset ?? 0, details.deltaY)}px`);
      }
      const range = snapRange();
      let next = progress;
      if (range && snaps.popupHeight > 0) {
        const base = snaps.activeSnapPointOffset ?? range.min;
        const offset = swiping && details && Number.isFinite(details.deltaY) ? Math.max(0, Math.min(snaps.popupHeight, base + details.deltaY)) : base;
        next = clamp((offset - range.min) / range.range);
      }
      if (!swiping) { drawer.notifyParentSwipeProgressChange?.(0); finishNested(); }
      applyProgress(next, swiping);
    },
    onRelease(details: DrawerSwipeRelease) {
      const popup = store.context.popupRef();
      if (!popup) { clearRelease(); return; }
      const { event, direction, deltaX, deltaY, velocityX, velocityY, releaseVelocityX, releaseVelocityY } = details;
      const startRelease = (dir: DrawerSwipeDirection) => {
        finishNested(); setSwipeDismissed(true);
        popup.style.removeProperty('transition'); popup.setAttribute('data-ending-style', '');
        const base = axis() === 'vertical' && hasSnaps() ? snaps.activeSnapPointOffset ?? 0 : 0;
        const scalar = resolveSwipeReleaseStrength(getBaseSwipeSize(popup, dir), base + getDisplacement(dir, deltaX, deltaY), getDisplacement(dir, velocityX, velocityY), getDisplacement(dir, releaseVelocityX, releaseVelocityY));
        // Explicit transaction value is also applied before the staged signal commits.
        popup.style.setProperty('--drawer-swipe-strength', `${scalar ?? 1}`);
        setStrength(scalar);
      };
      if (!hasSnaps()) {
        if (!direction) { clearRelease(); return; }
        const distance = getDisplacement(direction, deltaX, deltaY);
        const close = distance > 0 && (getDisplacement(direction, velocityX, velocityY) >= 0.5 || distance > getBaseSwipeThreshold(popup, direction));
        if (close) startRelease(direction); else clearRelease();
        return close;
      }
      if (axis() !== 'vertical') { clearRelease(); return; }
      if (!snaps.popupHeight) { clearRelease(); return false; }
      const sign = drawer.swipeDirection === 'down' ? 1 : -1;
      const decision = resolveSnapRelease({ points: snaps.resolvedSnapPoints, popupHeight: snaps.popupHeight, currentOffset: snaps.activeSnapPointOffset ?? 0, delta: deltaY * sign, velocity: velocityY * sign, releaseVelocity: releaseVelocityY * sign, sequential: drawer.snapToSequentialPoints, attributed: !!direction });
      if (!decision) { clearRelease(); return; }
      const change = createChangeEventDetails('swipe', event);
      const previous = drawer.activeSnapPoint;
      drawer.setActiveSnapPoint(decision.close ? null : decision.point.value, change);
      if (decision.close && !change.isCanceled) { pendingSnap = previous; startRelease(drawer.swipeDirection); return true; }
      applyProgress(0, true); clearRelease(); return false;
    },
    onDismiss(event: PointerEvent | TouchEvent) {
      applyProgress(0, true);
      const details = createChangeEventDetails('swipe', event);
      store.setOpen(false, details);
      const restore = () => {
        if (pendingSnap !== undefined) drawer.setActiveSnapPoint(pendingSnap, createChangeEventDetails('swipe', event));
        pendingSnap = undefined; swipe.reset(); clearRelease();
      };
      cancelControlledFrame();
      if (details.isCanceled) { restore(); return; }
      // Shared state writes are staged; the accepted uncontrolled proposal is
      // already closed even while the accessor still reports the previous open.
      if (store.state.openProp === undefined) setSwipeDismissed(true);
      const popup = store.context.popupRef();
      if (popup) {
        const win = ownerWindow(popup);
        const id = win.requestAnimationFrame(() => { if (store.state.open) restore(); else pendingSnap = undefined; });
        cancelControlledFrame = () => win.cancelAnimationFrame(id);
      }
    },
  });
  // The shared prop getters depend on enabled. Resolve at dispatch, including
  // when a retained viewport opens again or a nested drawer closes.
  const pointer = () => swipe.getPointerProps();
  const touch = () => swipe.getTouchProps();
  createEffect(() => store.state.viewportElement ?? store.state.popupElement, root => {
    if (!root) return;
    const doc = root.ownerDocument;
    const move = (event: TouchEvent) => {
      keyboard?.onTouchMove(event);
      const state = touchState;
      const finger = event.touches[0];
      if (ignoreTouch || !state || !finger) return;
      const vertical = axis() === 'vertical';
      const delta = vertical ? finger.clientY - state.lastY : finger.clientX - state.lastX;
      try {
        if (event.touches.length === 2 || !canInteract() || shouldIgnoreSwipeForTextSelection(doc, root)) return;
        if (shouldYieldTouchMove(state, event, finger, vertical)) return;
        const scroll = state.scrollTarget;
        if (!scroll || scroll === doc.body || scroll === doc.documentElement) {
          if (event.cancelable) event.preventDefault();
          event.stopPropagation(); swipe.moveNative(event, root); return;
        }
        if (getScrollMetrics(scroll, axis()).max <= 0) { if (event.cancelable) event.preventDefault(); event.stopPropagation(); return; }
        if (delta !== 0) {
          if (!state.allowSwipe) {
            state.allowSwipe = event.cancelable && canSwipeFromScrollEdgeOnMove(scroll, axis(), drawer.swipeDirection, delta);
            if (state.allowSwipe) event.preventDefault();
          } else if (event.cancelable) event.preventDefault();
        }
        if (state.allowSwipe) { event.stopPropagation(); swipe.moveNative(event, root); }
      } finally { state.lastX = finger.clientX; state.lastY = finger.clientY; }
    };
    doc.addEventListener('touchmove', move, { passive: false, capture: true });
    return () => doc.removeEventListener('touchmove', move, true);
  });
  createEffect(() => ({ range: snapRange(), offset: snaps.activeSnapPointOffset, open: store.state.open, nested: store.state.nested, swiping: swipe.swiping, height: drawer.frontmostHeight }), value => {
    const range = value.range;
    if (range && !value.swiping) untrack(() => applyProgress(!value.open || value.nested ? 0 : clamp(((value.offset ?? range.min) - range.min) / range.range), false));
  });
  createEffect(() => store.state.open, open => {
    if (open) { if (!drawer.swipeAreaActiveRef.current) untrack(swipe.reset); untrack(clearRelease); }
    else { drawer.notifyParentSwipeProgressChange?.(0); finishNested(); }
  });
  onCleanup(() => { cancelControlledFrame(); swipe.reset(); applyProgress(0, true); store.context.backdropRef()?.removeAttribute('data-swiping'); finishNested(); });
  function resetTouch() { ignoreTouch = false; touchState = null; pointerType = ''; penTouch = false; }
  const handlers = {
    onPointerDown(event: PointerEvent & { currentTarget: HTMLElement }) {
      pointerType = event.pointerType; penTouch = event.pointerType === 'pen';
      if (!canInteract() || event.pointerType === 'touch') return;
      const target = getElementAtPoint(event.currentTarget.getRootNode(), event.clientX, event.clientY);
      if (closest(target, '[data-base-ui-swipe-ignore],[data-drawer-content]')) return;
      pointer().onPointerDown?.(event);
    },
    onPointerMove(event: PointerEvent) { if (event.pointerType !== 'touch') pointer().onPointerMove?.(event); },
    onPointerUp(event: PointerEvent) { pointerType = ''; if (event.pointerType !== 'touch') pointer().onPointerUp?.(event); },
    onPointerCancel(event: PointerEvent) { pointerType = ''; if (event.pointerType !== 'touch') pointer().onPointerCancel?.(event); },
    onTouchStart(event: TouchEvent & { currentTarget: HTMLElement }) {
      if (pointerType === 'pen' && penTouch) { penTouch = false; touchState = null; ignoreTouch = false; return; }
      if (!canInteract()) { touchState = null; ignoreTouch = false; return; }
      const finger = event.touches[0];
      if (!finger) return;
      const root = event.currentTarget;
      const win = ownerWindow(root);
      if (event.composedPath().some(target => target instanceof win.HTMLInputElement && target.type === 'range')) { touchState = null; return; }
      const atPoint = getElementAtPoint(root.getRootNode(), finger.clientX, finger.clientY);
      const nativeTarget = getTarget(event);
      const target = isElement(nativeTarget) ? nativeTarget : root;
      if (!contains(root, target)) { ignoreTouch = true; touchState = null; return; }
      keyboard?.onTouchStart(event);
      const cross: ScrollAxis = axis() === 'vertical' ? 'horizontal' : 'vertical';
      const crossIgnore = `[data-base-ui-swipe-ignore="${cross === 'horizontal' ? 'x' : 'y'}"]`;
      if (closest(atPoint, `[data-base-ui-swipe-ignore]:not(${crossIgnore})`)) { ignoreTouch = true; touchState = null; return; }
      ignoreTouch = false;
      const scroll = findScrollableTouchTarget(target, root, axis());
      touchState = { startX: finger.clientX, startY: finger.clientY, lastX: finger.clientX, lastY: finger.clientY,
        scrollTarget: scroll, hasCrossAxisGestureTarget: !!findScrollableTouchTarget(target, root, cross) || !!closest(atPoint, crossIgnore),
        allowSwipe: scroll && !isAtSwipeStartEdge(scroll, axis(), drawer.swipeDirection) ? false : null,
        preserveNativeCrossAxisScroll: false, drawerAxisAttributed: false };
      touch().onTouchStart?.(event);
    },
    onTouchEnd(event: TouchEvent) { keyboard?.onTouchEnd(event); resetTouch(); touch().onTouchEnd?.(event); },
    onTouchCancel(event: TouchEvent) { keyboard?.onTouchCancel(); resetTouch(); touch().onTouchCancel?.(event); },
    'data-nested-dialog-open': undefined,
  };
  const context: DrawerViewportContext = { get swiping() { return swipe.swiping; }, get swipeStrength() { return strength(); }, getDragStyles: swipe.getDragStyles, setSwipeDismissed };
  const merged = () => mergeProps<typeof DialogViewport>(props, handlers);
  return <DialogViewport {...merged()}><DrawerViewportContext value={context}>{props.children}</DrawerViewportContext></DialogViewport>;
}
export interface DrawerViewportState { open: boolean; transitionStatus: TransitionStatus; nested: boolean; nestedDialogOpen: boolean }
export interface DrawerViewportProps extends BaseUIComponentProps<'div', DrawerViewportState> {}
export namespace DrawerViewport { export type Props = DrawerViewportProps; export type State = DrawerViewportState; }
