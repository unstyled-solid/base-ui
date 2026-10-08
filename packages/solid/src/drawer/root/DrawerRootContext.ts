import { createContext, useContext } from 'solid-js';
import type { DrawerSnapPoint, DrawerSwipeDirection } from './snapPoints';
import type { BaseUIChangeEventDetails } from '../../internals/createBaseUIEventDetails';
export type { DrawerSnapPoint, DrawerSwipeDirection } from './snapPoints';
export type DrawerChangeReason = 'trigger-press' | 'outside-press' | 'escape-key' | 'close-watcher' | 'close-press' | 'focus-out' | 'imperative-action' | 'swipe' | 'none';
export type DrawerSnapChangeDetails = BaseUIChangeEventDetails<DrawerChangeReason>;
export interface DrawerNestedSwipeProgressStore { getSnapshot(): number; subscribe(listener: () => void): () => void }
export interface DrawerRootContext {
  readonly swipeDirection: DrawerSwipeDirection;
  readonly snapToSequentialPoints: boolean;
  readonly snapPoints: DrawerSnapPoint[] | undefined;
  readonly activeSnapPoint: DrawerSnapPoint | null;
  setActiveSnapPoint(point: DrawerSnapPoint | null, details?: DrawerSnapChangeDetails): void;
  swipeAreaActiveRef: { current: boolean };
  readonly popupHeight: number;
  readonly frontmostHeight: number;
  readonly hasNestedDrawer: boolean;
  readonly nestedSwiping: boolean;
  nestedSwipeProgressStore: DrawerNestedSwipeProgressStore;
  onPopupHeightChange(height: number): void;
  onNestedFrontmostHeightChange(height: number): void;
  onNestedDrawerPresenceChange(present: boolean): void;
  onNestedSwipingChange(swiping: boolean): void;
  onNestedSwipeProgressChange(progress: number): void;
  notifyParentFrontmostHeight?: (height: number) => void;
  notifyParentHasNestedDrawer?: (present: boolean) => void;
  notifyParentSwipingChange?: (swiping: boolean) => void;
  notifyParentSwipeProgressChange?: (progress: number) => void;
  /** Register live Dialog state, never mirror controlled values through effects. */
  attachDialog(open: () => boolean, present: () => boolean): () => void;
  registerNested(drawer: DrawerRootContext, open: () => boolean, present: () => boolean): () => void;
}
export const DrawerRootContext = createContext<DrawerRootContext | null>(null);
export function useDrawerRootContext(optional?: false): DrawerRootContext;
export function useDrawerRootContext(optional: true): DrawerRootContext | null;
export function useDrawerRootContext(optional = false) {
  const context = useContext(DrawerRootContext);
  if (!context && !optional) throw new Error('Base UI: DrawerRootContext is missing. Drawer parts must be placed within <Drawer.Root>.');
  return context;
}
