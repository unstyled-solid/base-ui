import { createContext, useContext } from 'solid-js';
export interface DrawerVirtualKeyboardContext {
  onTouchStart(event: TouchEvent): void;
  onTouchMove(event: TouchEvent): void;
  onTouchEnd(event: TouchEvent): void;
  onTouchCancel(): void;
}
export const DrawerVirtualKeyboardContext = createContext<DrawerVirtualKeyboardContext | null>(null);
export function useDrawerVirtualKeyboardContext() { return useContext(DrawerVirtualKeyboardContext); }
