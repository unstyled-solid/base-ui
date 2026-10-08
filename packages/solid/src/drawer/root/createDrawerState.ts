// Drawer-specific state adapted from pinned Base UI (MIT); controlled requests belong to foundations.
import { createSignal, onCleanup, untrack } from 'solid-js';
import { createControlled } from '../../utils/createControlled';
import { createChangeEventDetails } from '../../internals/createBaseUIEventDetails';
import { createVisualStateStore, type DrawerProviderContext } from '../provider/DrawerProviderContext';
import type { DrawerRootContext, DrawerSnapChangeDetails, DrawerSnapPoint, DrawerSwipeDirection } from './DrawerRootContext';

export interface DrawerStateOptions {
  snapPoints?: DrawerSnapPoint[];
  snapPoint?: DrawerSnapPoint | null;
  defaultSnapPoint?: DrawerSnapPoint | null;
  snapToSequentialPoints?: boolean;
  swipeDirection?: DrawerSwipeDirection;
  onSnapPointChange?: (point: DrawerSnapPoint | null, details: DrawerSnapChangeDetails) => void;
}
export function createDrawerState(props: DrawerStateOptions, parent: DrawerRootContext | null, provider: DrawerProviderContext | null): DrawerRootContext {
  const defaultPoint = () => props.defaultSnapPoint !== undefined ? props.defaultSnapPoint : props.snapPoints?.[0] ?? null;
  const snap = createControlled<DrawerSnapPoint | null, DrawerSnapChangeDetails>({
    value: () => props.snapPoint, defaultValue: untrack(defaultPoint),
    onChange: () => props.onSnapPointChange, name: 'Drawer', state: 'snapPoint',
  });
  const [popupHeight, setPopupHeight] = createSignal(0);
  const [frontmostHeight, setFrontmostHeight] = createSignal(0);
  const [hasNestedDrawer, setHasNestedDrawer] = createSignal(false);
  const [nestedSwiping, setNestedSwiping] = createSignal(false);
  const progress = createVisualStateStore();
  let ownHeight = 0;
  let nestedHeight = 0;
  const [children, setChildren] = createSignal<readonly { drawer: DrawerRootContext; open: () => boolean; present: () => boolean }[]>([]);
  const identity = {};
  function publishHeight() {
    const next = nestedHeight > 0 ? nestedHeight : ownHeight;
    setFrontmostHeight(next);
  }
  const context: DrawerRootContext = {
    get swipeDirection() { return props.swipeDirection ?? 'down'; },
    get snapToSequentialPoints() { return props.snapToSequentialPoints ?? false; },
    get snapPoints() { return props.snapPoints; },
    get activeSnapPoint() {
      const value = snap.value();
      if (snap.controlled || !props.snapPoints?.length) return value;
      return value === null || !props.snapPoints.some(point => Object.is(point, value)) ? defaultPoint() : value;
    },
    setActiveSnapPoint(point, details = createChangeEventDetails('none')) { snap.request(point, details); },
    swipeAreaActiveRef: { current: false },
    get popupHeight() { return popupHeight(); },
    get frontmostHeight() { return [...children()].reverse().find(child => child.open() && child.present() && child.drawer.frontmostHeight > 0)?.drawer.frontmostHeight ?? frontmostHeight(); },
    get hasNestedDrawer() { return hasNestedDrawer() || children().some(child => child.present()); },
    get nestedSwiping() { return nestedSwiping(); },
    nestedSwipeProgressStore: { getSnapshot: () => progress.getSnapshot().swipeProgress, subscribe: progress.subscribe },
    onPopupHeightChange(height) { ownHeight = height; setPopupHeight(height); publishHeight(); },
    onNestedFrontmostHeightChange(height) { nestedHeight = height; publishHeight(); },
    onNestedDrawerPresenceChange: setHasNestedDrawer,
    onNestedSwipingChange(value) { setNestedSwiping(value); parent?.onNestedSwipingChange(value); },
    onNestedSwipeProgressChange(value) { progress.set({ swipeProgress: value }); parent?.onNestedSwipeProgressChange(value); },
    notifyParentFrontmostHeight: parent?.onNestedFrontmostHeightChange,
    notifyParentHasNestedDrawer: parent?.onNestedDrawerPresenceChange,
    notifyParentSwipingChange: parent?.onNestedSwipingChange,
    notifyParentSwipeProgressChange: parent?.onNestedSwipeProgressChange,
    registerNested(drawer, open, present) {
      const entry = { drawer, open, present };
      setChildren(previous => [...previous, entry]);
      return () => { setChildren(previous => previous.filter(child => child !== entry)); };
    },
    attachDialog(open, present) {
      const removeProvider = provider?.registerDrawer(identity, open);
      const removeParent = parent?.registerNested(context, open, present);
      return () => { removeProvider?.(); removeParent?.(); };
    },
  };
  onCleanup(() => {
    provider?.removeDrawer(identity);
    parent?.onNestedDrawerPresenceChange(false);
    parent?.onNestedFrontmostHeightChange(0);
    parent?.onNestedSwipingChange(false);
    parent?.onNestedSwipeProgressChange(0);
  });
  return context;
}
