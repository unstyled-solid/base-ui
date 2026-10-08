import { createContext, useContext } from 'solid-js';
import type { JSX } from '@solidjs/web';
import type { DrawerSwipeDirection } from '../root/snapPoints';
export interface DrawerSwipeProgress { direction?: DrawerSwipeDirection; deltaX: number; deltaY: number }
export interface DrawerSwipeRelease extends DrawerSwipeProgress {
  event: PointerEvent | TouchEvent;
  velocityX: number; velocityY: number; releaseVelocityX: number; releaseVelocityY: number;
}
export interface DrawerViewportContext {
  readonly swiping: boolean;
  readonly swipeStrength: number | null;
  getDragStyles(): JSX.CSSProperties;
  setSwipeDismissed(value: boolean): void;
}
export const DrawerViewportContext = createContext<DrawerViewportContext | null>(null);
export function useDrawerViewportContext() { return useContext(DrawerViewportContext); }
