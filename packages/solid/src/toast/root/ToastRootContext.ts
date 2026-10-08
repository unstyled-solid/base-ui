import { createContext, useContext, type Setter } from 'solid-js';
import type { ToastObject } from '../useToastManager';
export interface ToastRootContext {
  readonly toast: ToastObject;
  readonly visibleIndex: number;
  readonly expanded: boolean;
  setTitleId: Setter<string | undefined>;
  setDescriptionId: Setter<string | undefined>;
  recalculateHeight(): void;
}
export const ToastRootContext = createContext<ToastRootContext>();
export function useToastRootContext() { return useContext(ToastRootContext); }
