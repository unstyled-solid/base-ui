import { createContext, useContext } from 'solid-js';
export interface NumberFieldScrubAreaContext {
  readonly isScrubbing: boolean;
  readonly isTouchInput: boolean;
  readonly isPointerLockDenied: boolean;
  readonly element: HTMLSpanElement | null;
  registerCursor(element: HTMLSpanElement | null): void;
}
export const NumberFieldScrubAreaContext = createContext<NumberFieldScrubAreaContext>();
export function useNumberFieldScrubAreaContext() { return useContext(NumberFieldScrubAreaContext); }
