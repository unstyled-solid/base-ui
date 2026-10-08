import { createContext, useContext } from 'solid-js';
import type { PopoverStore } from '../store/PopoverStore';

export const PopoverRootContext = createContext<PopoverStore | null>(null);
export function usePopoverRootContext(optional: true): PopoverStore | null;
export function usePopoverRootContext(optional?: false): PopoverStore;
export function usePopoverRootContext(optional = false) {
  const context = useContext(PopoverRootContext);
  if (!context && !optional) throw new Error('Base UI: PopoverRootContext is missing. Popover parts must be placed within <Popover.Root>.');
  return context;
}
