import { createContext, useContext } from 'solid-js';
import type { DialogStore } from '../store/DialogStore';

export const DialogRootContext = createContext<DialogStore<unknown> | null>(null);
export function useDialogRootContext(optional: true): DialogStore<unknown> | null;
export function useDialogRootContext(optional?: false): DialogStore<unknown>;
export function useDialogRootContext(optional = false) {
  const context = useContext(DialogRootContext);
  if (!context && !optional) {
    throw new Error('Base UI: DialogRootContext is missing. Dialog parts must be placed within <Dialog.Root>.');
  }
  return context;
}
