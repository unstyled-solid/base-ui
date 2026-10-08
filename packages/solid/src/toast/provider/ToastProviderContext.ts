import { createContext, useContext } from 'solid-js';
import type { ToastStore } from '../store';
export const ToastContext = createContext<ToastStore>();
export function useToastProviderContext() { return useContext(ToastContext); }
