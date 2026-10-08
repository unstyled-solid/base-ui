import { createContext, useContext, type Accessor } from 'solid-js';
export const DialogPortalContext = createContext<Accessor<boolean> | null>(null);
export function useDialogPortalContext(): Accessor<boolean> {
  const context = useContext(DialogPortalContext);
  if (!context) throw new Error('Base UI: <Dialog.Portal> is missing.');
  return context;
}
